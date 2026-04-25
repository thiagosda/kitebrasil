// ── KiteInforma Service Worker ─────────────────
const CACHE_NAME = 'kiteinforma-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/data.js',
  '/js/app.js',
  '/js/patch.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  e.waitUntil(clients.claim());
  // Tenta registrar verificação periódica
  if ('periodicSync' in self.registration) {
    self.registration.periodicSync.register('check-kite-conditions', {
      minInterval: 15 * 60 * 1000
    }).catch(() => {});
  }
});

// Serve do cache quando offline
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;
  if (url.includes('open-meteo.com') || url.includes('marine-api')) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

// Periodic Sync (background, quando instalado como PWA)
self.addEventListener('periodicsync', e => {
  if (e.tag === 'check-kite-conditions') {
    e.waitUntil(checkAndNotify());
  }
});

// Coordenadas dos spots para verificação em background
const SPOTS_BG = {
  prea:         { name: 'Preá',               lat: -2.5975,  lon: -40.0989 },
  barrinha:     { name: 'Barrinha de Baixo',  lat: -2.6236,  lon: -40.2019 },
  jericoacoara: { name: 'Jericoacoara',       lat: -2.7969,  lon: -40.5128 },
  guajiru:      { name: 'Ilha do Guajiru',    lat: -2.9503,  lon: -40.5033 },
  icarai:       { name: 'Icaraí de Amontada', lat: -3.0086,  lon: -39.7044 },
  cumbuco:      { name: 'Cumbuco',            lat: -3.6297,  lon: -38.7589 },
  cauipe:       { name: 'Lagoa do Cauípe',    lat: -3.6453,  lon: -38.8144 },
  taiba:        { name: 'Taíba',              lat: -3.5286,  lon: -39.0556 },
  paracuru:     { name: 'Paracuru',           lat: -3.4086,  lon: -39.0314 },
  portodunas:   { name: 'Porto das Dunas',    lat: -3.8611,  lon: -38.4133 },
  canoa:        { name: 'Canoa Quebrada',     lat: -4.5169,  lon: -37.6678 },
  fortim:       { name: 'Fortim',             lat: -4.4458,  lon: -37.7978 },
  icapui:       { name: 'Icapuí',             lat: -4.7047,  lon: -37.3619 },
};

async function checkAndNotify() {
  try {
    const alerts = await idbRead('alerts');
    if (!alerts || !alerts.length) return;
    for (const alert of alerts) {
      const spot = SPOTS_BG[alert.spotId];
      if (!spot) continue;

      // Para maré, busca o nível atual e passa junto
      let level = null;
      if (['tide-high','tide-low'].includes(alert.condition)) {
        level = await getCurrentTideLevel(spot);
      }

      const met = await checkConditionBG(alert.condition, spot);
      if (!met) continue;

      const lastKey = `notified_${alert.spotId}_${alert.condition}`;
      const last = parseInt(await idbRead(lastKey) || '0');
      if (Date.now() - last < 3600000) continue;
      await idbWrite(lastKey, String(Date.now()));
      await notify(alert.condition, spot.name, level);
    }
  } catch(err) {
    console.warn('[SW]', err);
  }
}

async function checkConditionBG(condition, spot) {
  try {
    const pad = n => String(n).padStart(2, '0');
    const now = new Date();
    const key = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:00`;

    // Vento
    if (['wind-good','wind-strong','score-high'].includes(condition)) {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${spot.lat}&longitude=${spot.lon}&hourly=windspeed_10m,windgusts_10m&wind_speed_unit=ms&forecast_days=1&timezone=America%2FFortaleza`;
      const res  = await fetch(url);
      const data = await res.json();
      const idx  = data.hourly.time.indexOf(key);
      if (idx === -1) return false;
      const wind = Math.round(data.hourly.windspeed_10m[idx] * 1.94384);
      const gust = Math.round(data.hourly.windgusts_10m[idx] * 1.94384);
      if (condition === 'wind-good')   return wind >= 14;
      if (condition === 'wind-strong') return wind >= 20;
      if (condition === 'score-high') {
        let s = 0;
        if (wind >= 15 && wind <= 30) s += 5;
        else if (wind >= 10) s += 3; else s += 1;
        const d = gust - wind;
        s += d <= 5 ? 3 : d <= 10 ? 2 : 1;
        if (wind >= 18 && wind <= 28 && d <= 5) s += 2;
        return Math.min(10, Math.max(1, s)) >= 8;
      }
    }

    // Maré
    if (['tide-high','tide-low'].includes(condition)) {
      const tideLevel = await getCurrentTideLevel(spot);
      if (tideLevel === null) return false;
      if (condition === 'tide-high') return tideLevel >= 2.5;
      if (condition === 'tide-low')  return tideLevel <= 0.6;
    }

    return false;
  } catch { return false; }
}

// Busca nível atual da maré via API
async function getCurrentTideLevel(spot) {
  try {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${spot.lat}&longitude=${spot.lon}&hourly=sea_level_height_msl&timezone=America%2FFortaleza&forecast_days=2`;
    const res  = await fetch(url);
    const data = await res.json();
    const raw  = data.hourly.sea_level_height_msl;
    const times = data.hourly.time;

    // Normaliza (igual ao app.js)
    const minVal = Math.min(...raw);
    const offset = 0.3 - minVal;
    const levels = raw.map(v => +(v + offset).toFixed(2));

    // Hora atual em Fortaleza
    const now     = new Date();
    const pad     = n => String(n).padStart(2, '0');
    const dateStr = now.toLocaleDateString('sv-SE', { timeZone: 'America/Fortaleza' });
    const hourStr = now.toLocaleTimeString('sv-SE', { timeZone: 'America/Fortaleza', hour12: false }).substring(0,2);
    const key     = `${dateStr}T${hourStr}:00`;

    const idx = times.indexOf(key);
    if (idx === -1) return null;

    // Interpolação para o minuto exato
    const curr = levels[idx];
    const next  = levels[idx + 1] ?? curr;
    const mins  = now.getMinutes() / 60;
    return +(curr + (next - curr) * mins).toFixed(2);
  } catch { return null; }
}

async function notify(condition, spotName, level) {
  const titles = {
    'wind-good':   'Vento bom para kitesurf',
    'wind-strong': 'Vento forte detectado',
    'tide-high':   'Maré alta agora',
    'tide-low':    'Maré baixa agora',
    'score-high':  'Dia excelente para kitar!',
  };
  const title = titles[condition] ?? 'KiteInforma';
  const body  = level ? `${spotName} · ${level}m` : spotName;
  await self.registration.showNotification(title, {
    body,
    icon:     '/icons/icon-192.png',
    badge:    '/icons/icon-192.png',
    tag:      `kite-${condition}`,
    renotify: true,
    vibrate:  [200, 100, 200],
    data:     { url: '/' }
  });
}

// Mensagem do app (tab aberta)
self.addEventListener('message', e => {
  if (e.data?.type === 'NOTIFY') {
    notify(e.data.condition ?? '', e.data.body ?? '').catch(() => {
      self.registration.showNotification(e.data.title, {
        body: e.data.body, icon: '/icons/icon-192.png',
        tag: 'kiteinforma-alert', renotify: true
      });
    });
  }
  if (e.data?.type === 'SYNC_ALERTS') {
    idbWrite('alerts', e.data.alerts).catch(() => {});
  }
});

// Clique na notificação — abre o app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if (c.url.includes(self.location.origin)) return c.focus();
      }
      return clients.openWindow('/');
    })
  );
});

// ── IndexedDB (persiste alertas para o SW) ───────
function openDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('kiteinforma-sw', 1);
    r.onupgradeneeded = ev => ev.target.result.createObjectStore('kv', { keyPath: 'k' });
    r.onsuccess = ev => res(ev.target.result);
    r.onerror   = () => rej(r.error);
  });
}

async function idbRead(key) {
  const db = await openDB();
  return new Promise(res => {
    const r = db.transaction('kv', 'readonly').objectStore('kv').get(key);
    r.onsuccess = () => res(r.result?.v ?? null);
    r.onerror   = () => res(null);
  });
}

async function idbWrite(key, value) {
  const db = await openDB();
  return new Promise(res => {
    const tx = db.transaction('kv', 'readwrite');
    tx.objectStore('kv').put({ k: key, v: value });
    tx.oncomplete = res;
    tx.onerror    = res;
  });
}
