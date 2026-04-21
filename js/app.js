// ─────────────────────────────────────────────
//  KiteInforma — app.js
// ─────────────────────────────────────────────

let currentSpot   = SPOTS[0];
let currentSchool = null;
let tideChart     = null;
const weatherCache = {};

// ── Utilities ──────────────────────────────────

function pad(n) { return String(n).padStart(2, '0'); }

function mpsToKnots(v) { return Math.round(v * 1.94384); }

function degToDir(d) {
  const dirs = ['N','NNE','NE','ENE','L','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO'];
  return dirs[Math.round(d / 22.5) % 16];
}

function calcScore(wind, gust) {
  let s = 0;
  if (wind >= 15 && wind <= 30)      s += 5;
  else if (wind >= 10 && wind < 15)  s += 3;
  else if (wind > 30 && wind <= 35)  s += 3;
  else                               s += 1;
  const diff = gust - wind;
  if (diff <= 5)       s += 3;
  else if (diff <= 10) s += 2;
  else                 s += 1;
  if (wind >= 18 && wind <= 28 && diff <= 5) s += 2;
  return Math.min(10, Math.max(1, s));
}

function scoreLabel(s) {
  if (s >= 9) return 'Dia excelente';
  if (s >= 7) return 'Dia muito bom';
  if (s >= 5) return 'Dia razoável';
  return 'Dia fraco';
}

function scoreColor(s) {
  if (s >= 8) return { bg: '#EF9F27', text: '#412402' };
  if (s >= 6) return { bg: '#EAF3DE', text: '#27500A' };
  return { bg: '#FAEEDA', text: '#633806' };
}

function formatDate() {
  const d = new Date();
  const days   = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  return `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]}`;
}

function nowH() {
  const n = new Date();
  return n.getHours() + n.getMinutes() / 60;
}

// ── Tide helpers ───────────────────────────────

function tideH(h, offsetMin = 0) {
  const t = (h + offsetMin / 60) / 24;
  return 1.3 + 1.1 * Math.sin(2 * Math.PI * (t * 1.93 - 0.12))
             + 0.15 * Math.sin(4 * Math.PI * (t * 1.93));
}

function tideStatus(spot) {
  const h   = nowH();
  const cur = tideH(h, spot.tideOffset);
  const prv = tideH(h - 0.5, spot.tideOffset);
  const pct = Math.round(((cur - 0.2) / 2.2) * 100);
  return {
    level:  cur.toFixed(1),
    status: cur > prv ? 'Enchendo' : 'Secando',
    color:  cur > prv ? '#EF9F27'  : '#85b7eb',
    pct:    Math.min(100, Math.max(0, pct))
  };
}

function getTideEvents(spot) {
  const events = [];
  const half   = Array.from({ length: 48 }, (_, i) => i * 0.5);
  let prev = tideH(0, spot.tideOffset);

  for (let i = 1; i < half.length; i++) {
    const cur  = tideH(half[i],     spot.tideOffset);
    const next = tideH(half[i + 1] ?? half[i], spot.tideOffset);
    const hh   = pad(Math.floor(half[i]));
    const mm   = half[i] % 1 === 0.5 ? '30' : '00';

    if (cur > prev && cur >= next)
      events.push({ time: `${hh}:${mm}`, label: 'Maré alta',  height: `${cur.toFixed(1)} m`, detail: 'máxima', type: 'high' });
    else if (cur < prev && cur <= next)
      events.push({ time: `${hh}:${mm}`, label: 'Maré baixa', height: `${cur.toFixed(1)} m`, detail: 'mínima', type: 'low' });

    prev = cur;
    if (events.length >= 4) break;
  }

  const t   = tideStatus(spot);
  const now = { time: 'Agora', label: t.status, height: `${t.level} m`, detail: 'em tempo real', type: 'now' };
  const at  = events.findIndex(e => parseInt(e.time) > nowH());
  if (at >= 0) events.splice(at, 0, now);
  else         events.push(now);

  return events.slice(0, 5);
}

// ── Weather API ────────────────────────────────

async function fetchWeather(spot) {
  if (weatherCache[spot.id]) return weatherCache[spot.id];

  const url = `https://api.open-meteo.com/v1/forecast`
    + `?latitude=${spot.lat}&longitude=${spot.lon}`
    + `&hourly=windspeed_10m,windgusts_10m,winddirection_10m,wave_height,wave_period`
    + `&wind_speed_unit=ms&forecast_days=7&timezone=America%2FFortaleza`;

  try {
    const res  = await fetch(url);
    const data = await res.json();
    const n    = new Date();
    const key  = `${n.getFullYear()}-${pad(n.getMonth()+1)}-${pad(n.getDate())}T${pad(n.getHours())}:00`;
    const idx  = data.hourly.time.indexOf(key);
    if (idx === -1) return null;

    const wind = mpsToKnots(data.hourly.windspeed_10m[idx]);
    const gust = mpsToKnots(data.hourly.windgusts_10m[idx]);
    const dir  = degToDir(data.hourly.winddirection_10m[idx]);
    const wh   = data.hourly.wave_height?.[idx]  ?? 0.8;
    const wp   = data.hourly.wave_period?.[idx]  ?? 8;

    const dayNames = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    const forecast = [];
    for (let d = 0; d < 7; d++) {
      const dt  = new Date(n);
      dt.setDate(dt.getDate() + d);
      const ds  = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;
      const ni  = data.hourly.time.indexOf(`${ds}T12:00`);
      if (ni === -1) continue;
      const dw  = mpsToKnots(data.hourly.windspeed_10m[ni]);
      const dg  = mpsToKnots(data.hourly.windgusts_10m[ni]);
      forecast.push({ day: d === 0 ? 'Hoje' : dayNames[dt.getDay()], score: calcScore(dw, dg), wind: dw, active: d === 0 });
    }

    const result = { wind, gust, dir, wh, wp, forecast };
    weatherCache[spot.id] = result;
    return result;
  } catch (e) {
    console.warn('API error', e);
    return null;
  }
}

// ── Apply data to DOM ──────────────────────────

function applyData(data, spot) {
  const wind  = data?.wind  ?? 10;
  const gust  = data?.gust  ?? 14;
  const dir   = data?.dir   ?? 'NE';
  const wh    = data?.wh    ?? 0.8;
  const wp    = data?.wp    ?? 8;
  const score = calcScore(wind, gust);
  const t     = tideStatus(spot);
  const $ = id => document.getElementById(id);

  $('score-num').textContent   = score;
  $('score-desc').textContent  = scoreLabel(score);
  $('score-sub').textContent   = `${dir} · ${score >= 8 ? 'Ideal para freestyle' : score >= 6 ? 'Condições ok' : 'Vento fraco hoje'}`;
  $('wind-speed').textContent  = wind;
  $('wind-gust').textContent   = gust;
  $('wind-dir').textContent    = `${dir} — ${dir.toLowerCase()}`;
  $('wave-height').textContent = wh.toFixed(1);
  $('wave-period').textContent = `período ${Math.round(wp)}s`;
  $('tide-level').textContent  = t.level;
  $('tide-status').textContent = t.status.toLowerCase();
  $('tide-dot').style.background     = t.color;
  $('tide-pill-text').textContent    = t.status;
  $('tide-pill-level').textContent   = `${t.level} m agora`;
  $('tide-bar').style.width          = `${t.pct}%`;

  if (data?.forecast?.length) renderForecast(data.forecast);
}

// ── Render functions ───────────────────────────

function renderForecast(fc) {
  const row = document.getElementById('forecast-row');
  if (!row || !fc.length) return;
  row.innerHTML = fc.map(f => {
    const c = scoreColor(f.score);
    return `<div class="forecast-card ${f.active ? 'active' : ''}">
      <div class="fc-day">${f.day}</div>
      <div class="fc-score" style="background:${c.bg};color:${c.text}">${f.score}</div>
      <div class="fc-wind">${f.wind} nós</div>
    </div>`;
  }).join('');
}

function renderSelectors() {
  const regions = [...new Set(SPOTS.map(s => s.region))];
  const html = regions.map(r =>
    `<optgroup label="${r}">${
      SPOTS.filter(s => s.region === r).map(s =>
        `<option value="${s.id}"${s.id === currentSpot.id ? ' selected' : ''}>${s.name}</option>`
      ).join('')
    }</optgroup>`
  ).join('');
  ['spot-selector', 'spot-selector-schools'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  });
}

function renderSchools() {
  const list  = document.getElementById('schools-list-page');
  const title = document.getElementById('schools-page-title');
  if (!list) return;
  if (title) title.textContent = `Escolas em ${currentSpot.name}`;

  const sc = currentSpot.schools ?? [];
  if (!sc.length) {
    list.innerHTML = `<div class="empty-schools">Nenhuma escola cadastrada em ${currentSpot.name} ainda.</div>`;
    return;
  }
  list.innerHTML = sc.map(s => `
    <div class="school-card" onclick="openSchool('${currentSpot.id}', ${s.id})">
      <div class="school-avatar" style="background:${s.color};color:#fff">${s.initials}</div>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div class="school-name">${s.name}</div>
          <span class="school-badge ${s.open ? 'badge-open' : 'badge-closed'}">${s.open ? 'Aberta agora' : (s.openTime ?? 'Fechada')}</span>
        </div>
        <div class="school-meta">★ ${s.rating} · ${s.reviews} avaliações</div>
        <div class="school-meta" style="margin-top:2px">${currentSpot.name} · desde ${s.since}</div>
      </div>
    </div>`).join('');
}

function renderTideEvents() {
  const el = document.getElementById('tide-events');
  if (!el) return;
  el.innerHTML = getTideEvents(currentSpot).map(e => {
    const isNow = e.type === 'now';
    const badge = e.type === 'high'
      ? '<span class="event-badge badge-high">Cheia</span>'
      : e.type === 'low'
      ? '<span class="event-badge badge-low">Seca</span>'
      : '<span class="event-badge badge-now">Ao vivo</span>';
    return `<div class="event-row${isNow ? ' now' : ''}">
      <div class="event-time${isNow ? ' now' : ''}">${e.time}</div>
      <div class="event-info">
        <div class="event-label">${e.label}</div>
        <div class="event-height">${e.height} · ${e.detail}</div>
      </div>
      ${badge}
    </div>`;
  }).join('');
}

function renderTideChart() {
  const canvas = document.getElementById('tideChart');
  if (!canvas) return;
  if (tideChart) { tideChart.destroy(); tideChart = null; }

  const dark   = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const tc     = dark ? '#9c9a92' : '#888780';
  const gc     = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const hours  = Array.from({ length: 25 }, (_, i) => i);
  const hts    = hours.map(h => +tideH(h, currentSpot.tideOffset).toFixed(2));
  const nh     = nowH();
  const nowVal = +tideH(nh, currentSpot.tideOffset).toFixed(2);

  tideChart = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: hours.map(h => h % 6 === 0 ? `${h}h` : ''),
      datasets: [
        {
          data: hts, borderColor: '#185FA5', borderWidth: 2, fill: true,
          backgroundColor: dark ? 'rgba(24,95,165,0.15)' : 'rgba(24,95,165,0.08)',
          tension: 0.4, pointRadius: 0
        },
        {
          data: hours.map(h => Math.abs(h - nh) < 0.5 ? nowVal : null),
          borderColor: '#EF9F27', borderWidth: 0,
          pointRadius: hours.map(h => Math.abs(h - nh) < 0.5 ? 5 : 0),
          pointBackgroundColor: '#EF9F27',
          pointBorderColor: dark ? '#1c1c1a' : '#fff',
          pointBorderWidth: 2, fill: false
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { grid: { color: gc }, ticks: { color: tc, font: { size: 10 }, maxRotation: 0 } },
        y: { min: 0, max: 3, grid: { color: gc }, ticks: { color: tc, font: { size: 10 }, stepSize: 1, callback: v => v + 'm' } }
      }
    }
  });
}

function renderSeasonBanner() {
  const el = document.getElementById('season-banner');
  if (!el) return;
  const month = new Date().getMonth() + 1;
  // Low season: February–June. High season: July–January
  el.style.display = (month >= 2 && month <= 6) ? 'flex' : 'none';
}

// ── School profile ─────────────────────────────

function openSchool(spotId, schoolId) {
  const spot = SPOTS.find(s => s.id === spotId);
  if (!spot) return;
  const s = spot.schools.find(x => x.id === schoolId);
  if (!s) return;
  currentSchool = s;

  const $ = id => document.getElementById(id);
  $('school-logo').textContent        = s.initials;
  $('school-logo').style.background   = s.color;
  $('school-name-title').textContent  = s.name;
  $('school-loc-title').textContent   = `${spot.name} · ${spot.region}`;
  $('school-rating').textContent      = s.rating;
  $('school-reviews').textContent     = `${s.reviews} avaliações`;
  $('school-badge').textContent       = s.open ? 'Aberta agora' : (s.openTime ?? 'Fechada');

  $('school-phone-btn').onclick    = () => window.location.href = `tel:${s.phone}`;
  $('school-whatsapp-btn').onclick = () => window.open(s.whatsapp, '_blank');

  const siteBtn = $('school-site-btn');
  if (s.site) {
    siteBtn.classList.remove('disabled');
    siteBtn.onclick = () => window.open(s.site, '_blank');
  } else {
    siteBtn.classList.add('disabled');
    siteBtn.onclick = null;
  }

  $('school-map-link').onclick = () => window.open(s.mapsUrl, '_blank');

  $('school-google-rating').innerHTML =
    `<span class="stars">${'★'.repeat(Math.round(s.rating))}</span>
     <span>${s.rating}</span>
     <span class="count">(${s.reviews} no Google)</span>`;

  $('school-reviews-list').innerHTML = s.reviewsList.map(r => `
    <div class="review-card">
      <div class="review-header">
        <div class="reviewer">
          <div class="rev-avatar" style="background:${r.color};color:${r.textColor}">${r.initials}</div>
          <div>
            <div class="rev-name">${r.name}</div>
            <div class="rev-date">${r.date}</div>
          </div>
        </div>
        <span class="rev-stars">${'★'.repeat(r.stars)}</span>
      </div>
      <div class="rev-text">${r.text}</div>
    </div>`).join('');

  navigate('school');
}

// ── Navigation ─────────────────────────────────

function navigate(screen) {
  document.querySelectorAll('.screen').forEach(s  => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const screenMap = { kitesurf: 'screen-kitesurf', tide: 'screen-tide', schools: 'screen-schools', school: 'screen-school' };
  const navMap    = { kitesurf: 'nav-kitesurf',    tide: 'nav-tide',    schools: 'nav-schools',    school: 'nav-schools' };

  const target = document.getElementById(screenMap[screen] ?? 'screen-kitesurf');
  if (target) {
    target.classList.add('active', 'fade-in');
    setTimeout(() => target.classList.remove('fade-in'), 300);
  }
  const navEl = document.getElementById(navMap[screen] ?? 'nav-kitesurf');
  if (navEl) navEl.classList.add('active');

  if (screen === 'tide')    { renderTideChart(); renderTideEvents(); }
  if (screen === 'schools') renderSchools();

  window.scrollTo(0, 0);
}

// ── Spot switching ─────────────────────────────

async function switchSpot(id) {
  const spot = SPOTS.find(s => s.id === id);
  if (!spot || spot.id === currentSpot.id) return;
  currentSpot = spot;

  ['spot-selector', 'spot-selector-schools'].forEach(selId => {
    const el = document.getElementById(selId);
    if (el) el.value = id;
  });

  const data = await fetchWeather(spot);
  applyData(data, spot);

  if (document.getElementById('screen-schools').classList.contains('active')) renderSchools();
  if (document.getElementById('screen-tide').classList.contains('active')) { renderTideChart(); renderTideEvents(); }
}

// ── GPS auto-detect ────────────────────────────

function tryGPS() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude: la, longitude: lo } = pos.coords;
    let best = SPOTS[0], minDist = Infinity;
    SPOTS.forEach(s => {
      const d = Math.hypot(s.lat - la, s.lon - lo);
      if (d < minDist) { minDist = d; best = s; }
    });
    if (best.id !== currentSpot.id) switchSpot(best.id);
  }, () => {/* silently ignore GPS errors */});
}

// ── Clock ──────────────────────────────────────

function updateClock() {
  const n = new Date();
  const t = `${pad(n.getHours())}:${pad(n.getMinutes())}`;
  document.querySelectorAll('.clock').forEach(el => el.textContent = t);
}

// ── Init ───────────────────────────────────────

async function init() {
  updateClock();
  setInterval(updateClock, 10_000);

  document.querySelectorAll('.hero-date').forEach(el => el.textContent = formatDate());

  renderSelectors();
  renderSeasonBanner();

  document.getElementById('spot-selector')?.addEventListener('change', e => switchSpot(e.target.value));
  document.getElementById('spot-selector-schools')?.addEventListener('change', e => switchSpot(e.target.value));

  const data = await fetchWeather(currentSpot);
  applyData(data, currentSpot);

  tryGPS();
}

document.addEventListener('DOMContentLoaded', init);
