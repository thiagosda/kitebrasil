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

// ── Tide API (Open-Meteo Marine) ───────────────
// Gratuita, sem limite, sem chave de API
// Retorna nível do mar horário em metros (nível médio como referência)

const tideCache = {};

async function fetchTideData(spot) {
  const key = spot.id + '_' + new Date().toISOString().substring(0, 10);
  if (tideCache[key]) return tideCache[key];

  const url = `https://marine-api.open-meteo.com/v1/marine`
    + `?latitude=${spot.lat}&longitude=${spot.lon}`
    + `&hourly=sea_level_height_msl`
    + `&timezone=America%2FFortaleza&forecast_days=7`;

  try {
    const res  = await fetch(url);
    const data = await res.json();
    const raw   = data.hourly.sea_level_height_msl;
    const times = data.hourly.time;

    // Normaliza APENAS os valores (shift vertical) para que o mínimo real fique ~0.3m
    // NÃO altera os índices de tempo — os horários da API já estão em UTC-3 (Fortaleza)
    const minVal = Math.min(...raw);
    const offset = 0.3 - minVal;
    const levels = raw.map(v => +(v + offset).toFixed(2));

    const result = { times, levels };
    tideCache[key] = result;
    return result;
  } catch (e) {
    console.warn('Tide API error', e);
    return null;
  }
}

function getTideLevelAt(tideData, h) {
  if (!tideData) return tideH_fallback(h);
  // Usa hora local de Fortaleza (UTC-3) para buscar o índice correto
  const now     = new Date();
  const localH  = Math.floor(h);
  const localM  = Math.round((h - localH) * 60);
  const dateStr = now.toLocaleDateString('sv-SE', { timeZone: 'America/Fortaleza' });
  const timeStr = `${dateStr}T${pad(localH)}:00`;
  const idx = tideData.times.indexOf(timeStr);
  if (idx < 0) return tideH_fallback(h);
  const curr = tideData.levels[idx];
  const next  = tideData.levels[idx + 1] ?? curr;
  return +(curr + (next - curr) * (localM / 60)).toFixed(2);
}

function nowLocalH() {
  // Hora local em Fortaleza (UTC-3) como número fracionário
  const now = new Date();
  const localStr = now.toLocaleTimeString('sv-SE', { timeZone: 'America/Fortaleza', hour12: false });
  const [hh, mm, ss] = localStr.split(':').map(Number);
  return hh + mm / 60 + ss / 3600;
}

// Fallback matemático caso a API falhe
function tideH_fallback(h, offsetMin = 0) {
  const t = (h + offsetMin / 60) / 24;
  return 1.575 + 1.05 * Math.sin(2 * Math.PI * (t * 1.9323 - 0.27))
               + 0.18 * Math.sin(4 * Math.PI * (t * 1.9323 - 0.27));
}

// ── Tide helpers ───────────────────────────────

let _currentTideData = null; // carregado na init e ao trocar spot

function tideH(h, offsetMin = 0) {
  if (_currentTideData) return getTideLevelAt(_currentTideData, h + offsetMin / 60);
  return tideH_fallback(h, offsetMin);
}

function tideStatus(spot) {
  const h   = nowLocalH();
  const cur = tideH(h, spot.tideOffset);
  const prv = tideH(h - 0.25, spot.tideOffset);
  const todayDate = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Fortaleza' });
  const todayVals = _currentTideData
    ? _currentTideData.levels.filter((_, i) => _currentTideData.times[i].startsWith(todayDate))
    : [0.3, 2.7];
  const minV = Math.min(...todayVals);
  const maxV = Math.max(...todayVals);
  const pct = Math.round(((cur - minV) / (maxV - minV)) * 100);
  return {
    level:  cur.toFixed(1),
    status: cur > prv ? 'Enchendo' : 'Secando',
    color:  cur > prv ? '#EF9F27'  : '#85b7eb',
    pct:    Math.min(100, Math.max(0, pct))
  };
}

// ── Extrai todos os eventos de maré de N dias ──

function extractAllTideEvents(tideData) {
  if (!tideData) return [];
  const raw    = tideData.levels;
  const times  = tideData.times;
  const events = [];
  const days   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

  for (let i = 1; i < raw.length - 1; i++) {
    const p = raw[i-1], c = raw[i], n = raw[i+1];
    const isHigh = c > p && c > n;
    const isLow  = c < p && c < n;
    if (!isHigh && !isLow) continue;

    // Interpolação quadrática para horário exato
    const denom  = p - 2*c + n;
    const delta  = denom !== 0 ? (p - n) / (2 * denom) : 0;
    const exactLevel = +(c - (p - n) * delta / 4).toFixed(1);

    // Converte índice fracionário em hora local de Fortaleza
    const baseMs   = new Date(times[i] + ':00-03:00').getTime();
    const exactMs  = baseMs + delta * 3600000;
    const dt       = new Date(exactMs);
    // Hora local Fortaleza
    const localStr = dt.toLocaleString('sv-SE', { timeZone: 'America/Fortaleza' });
    const [datePart, timePart] = localStr.split(' ');
    const [hh, mm] = timePart.split(':');
    const dtLocal  = new Date(datePart + 'T' + timePart + '-03:00');

    events.push({
      dateKey:  datePart,                           // "2026-04-21"
      dayName:  days[dtLocal.getDay()],             // "Ter"
      dateDisp: dtLocal.getDate() + '/' + pad(dtLocal.getMonth()+1), // "21/04"
      time:     pad(hh) + ':' + pad(mm),            // "06:51"
      type:     isHigh ? 'high' : 'low',
      label:    isHigh ? 'Maré alta' : 'Maré baixa',
      level:    String(exactLevel),
    });
  }
  return events;
}

let _allTideEvents = [];   // todos os eventos de 7 dias
let _selectedDay   = null; // data selecionada no tab "2026-04-21"

// ── Próxima maré ──────────────────────────────

function renderNextTide() {
  const now    = new Date();
  const nowStr = now.toLocaleString('sv-SE', { timeZone: 'America/Fortaleza' }).replace(' ', 'T');
  const next   = _allTideEvents.find(e => (e.dateKey + 'T' + e.time + ':00') > nowStr);
  if (!next) return;

  const el = id => document.getElementById(id);
  const isHigh = next.type === 'high';
  const isTomorrow = next.dateKey !== new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Fortaleza' });
  const dayLabel   = isTomorrow ? next.dayName + ' ' + next.dateDisp : 'Hoje';

  if (el('next-tide-icon')) {
    el('next-tide-icon').textContent = isHigh ? '↑' : '↓';
    el('next-tide-icon').style.color = isHigh ? '#9FE1CB' : '#85b7eb';
  }
  if (el('next-tide-type'))  el('next-tide-type').textContent  = next.label;
  if (el('next-tide-time'))  el('next-tide-time').textContent  = next.time + ' · ' + dayLabel;
  if (el('next-tide-level')) el('next-tide-level').textContent = next.level + 'm';
}

// ── Day tabs ──────────────────────────────────

function renderDayTabs() {
  const container = document.getElementById('day-tabs');
  if (!container || !_allTideEvents.length) return;

  // Pega dias únicos
  const seen = new Set();
  const days = [];
  _allTideEvents.forEach(e => {
    if (!seen.has(e.dateKey)) { seen.add(e.dateKey); days.push(e); }
  });

  const todayKey = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Fortaleza' });
  if (!_selectedDay) _selectedDay = todayKey;

  container.innerHTML = days.map(e => {
    const isToday  = e.dateKey === todayKey;
    const isActive = e.dateKey === _selectedDay;
    // Conta high/low para o mini-indicador
    const evs = _allTideEvents.filter(ev => ev.dateKey === e.dateKey);
    const highs = evs.filter(ev => ev.type === 'high').length;
    return `<div class="day-tab ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}"
                 onclick="selectDay('${e.dateKey}')">
      <div class="day-tab-name">${isToday ? 'Hoje' : e.dayName}</div>
      <div class="day-tab-date">${e.dateDisp}</div>
      <div class="day-tab-dot" style="background:${highs >= 2 ? 'var(--teal)' : 'var(--amber)'}"></div>
    </div>`;
  }).join('');
}

function selectDay(dateKey) {
  _selectedDay = dateKey;
  renderDayTabs();
  renderTideEventsForDay(dateKey);
}

// ── Eventos do dia selecionado ─────────────────

function renderTideEventsForDay(dateKey) {
  const el = document.getElementById('tide-events');
  if (!el) return;

  const todayKey = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Fortaleza' });
  const evs = _allTideEvents.filter(e => e.dateKey === dateKey);
  if (!evs.length) { el.innerHTML = '<div class="empty-schools">Sem dados para este dia.</div>'; return; }

  const nowLocalStr = new Date().toLocaleString('sv-SE', { timeZone: 'America/Fortaleza' }).replace(' ', 'T');

  el.innerHTML = evs.map(e => {
    const eventStr = e.dateKey + 'T' + e.time + ':00';
    const isPast   = dateKey === todayKey && eventStr < nowLocalStr;
    const isNext   = dateKey === todayKey && !isPast &&
                     !evs.some(ev => (ev.dateKey + 'T' + ev.time + ':00') < eventStr &&
                                     (ev.dateKey + 'T' + ev.time + ':00') >= nowLocalStr);
    const isHigh   = e.type === 'high';
    const badge    = isHigh
      ? `<span class="event-badge badge-high">Cheia</span>`
      : `<span class="event-badge badge-low">Seca</span>`;
    const nextBadge = isNext ? `<span class="event-badge badge-now">Próxima</span>` : badge;
    const pastStyle = isPast ? 'opacity:0.45' : '';

    return `<div class="event-row" style="${pastStyle}">
      <div class="event-time${isNext ? ' now' : ''}">${e.time}</div>
      <div class="event-info">
        <div class="event-label">${e.label}</div>
        <div class="event-height">${e.level} m · ${isHigh ? 'máxima' : 'mínima'}</div>
      </div>
      ${nextBadge}
    </div>`;
  }).join('');
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

// ── Dica inteligente de maré ───────────────────

function renderTideTip(windKnots, spot) {
  const titleEl = document.getElementById('tide-tip-title');
  const textEl  = document.getElementById('tide-tip-text');
  const boxEl   = document.getElementById('tide-tip-box');
  if (!titleEl || !textEl) return;

  const t     = tideStatus(spot);
  const level = parseFloat(t.level);
  const rising = t.status === 'Enchendo';

  // Sem vento suficiente: não dá pra velejar
  if (windKnots < 10) {
    if (boxEl) { boxEl.style.background = 'var(--amber-pale)'; boxEl.style.borderLeft = '3px solid var(--amber)'; }
    titleEl.style.color = 'var(--amber-dark)';
    textEl.style.color  = 'var(--amber-dark)';
    titleEl.textContent = 'Sem condições para kitesurf';
    textEl.textContent  = `Vento de ${windKnots} nós é insuficiente para velejar (mínimo ~12 nós). Aproveite para relaxar ou visitar as lagoas.`;
    return;
  }

  // Vento fraco mas possível para iniciantes
  if (windKnots < 14) {
    titleEl.textContent = 'Condição para iniciantes';
    textEl.textContent  = `Vento de ${windKnots} nós — fraco para avançados mas adequado para praticar em lagoa com pipa grande.`;
    return;
  }

  // Vento bom — analisa a maré
  if (windKnots >= 14) {
    if (level > 2.5) {
      titleEl.textContent = rising ? 'Maré alta e enchendo' : 'Maré alta e secando';
      textEl.textContent  = rising
        ? `Maré em ${level}m subindo. Bom para wave riding. Cuidado com a profundidade nas lagoas.`
        : `Maré em ${level}m e vazando. Boa janela para freestyle no mar aberto. Aproveite antes de secar.`;
    } else if (level < 0.8) {
      titleEl.textContent = rising ? 'Maré baixa e enchendo' : 'Maré baixa';
      textEl.textContent  = rising
        ? `Maré em ${level}m subindo. Lagoas e rampas ficam expostas — ótimo para iniciantes e manobras rasas.`
        : `Maré em ${level}m — mínima do dia. Ideal para sessões na lagoa e downwind. Mar pode estar raso.`;
    } else {
      // Maré média
      const nextPeak = rising ? 'preamar' : 'baixamar';
      titleEl.textContent = `Condição boa · vento ${windKnots} nós`;
      textEl.textContent  = `Maré em ${level}m e ${t.status.toLowerCase()} em direção à ${nextPeak}. Boas condições para todos os níveis.`;
    }
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
  renderTideTip(wind, spot);

  // Reconstrói eventos de 7 dias quando dados mudam
  if (_currentTideData) {
    _allTideEvents = extractAllTideEvents(_currentTideData);
    renderNextTide();
    renderDayTabs();
    const todayKey = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Fortaleza' });
    _selectedDay = todayKey;
    renderTideEventsForDay(todayKey);
  }
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

  const dark     = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const tc       = dark ? '#9c9a92' : '#888780';
  const gc       = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const todayStr = new Date().toISOString().substring(0, 10);
  const nh       = nowH();

  let labels = [], heights = [], nowIdx = -1;

  if (_currentTideData) {
    _currentTideData.times.forEach((t, i) => {
      if (!t.startsWith(todayStr)) return;
      const h = parseInt(t.substring(11, 13));
      labels.push(h % 6 === 0 ? h + 'h' : '');
      heights.push(_currentTideData.levels[i]);
      if (Math.abs(h - nh) < 0.7) nowIdx = labels.length - 1;
    });
  } else {
    const hours = Array.from({ length: 25 }, (_, i) => i);
    labels  = hours.map(h => h % 6 === 0 ? h + 'h' : '');
    heights = hours.map(h => +tideH_fallback(h, currentSpot.tideOffset).toFixed(2));
    nowIdx  = Math.round(nh);
  }

  const nowDots = heights.map((v, i) => i === nowIdx ? v : null);
  const maxH    = Math.ceil((Math.max(...heights.filter(Boolean)) + 0.3) * 2) / 2;

  tideChart = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { data: heights, borderColor: '#185FA5', borderWidth: 2, fill: true,
          backgroundColor: dark ? 'rgba(24,95,165,0.15)' : 'rgba(24,95,165,0.08)',
          tension: 0.4, pointRadius: 0 },
        { data: nowDots, borderColor: '#EF9F27', borderWidth: 0,
          pointRadius: nowDots.map(v => v !== null ? 5 : 0),
          pointBackgroundColor: '#EF9F27',
          pointBorderColor: dark ? '#1c1c1a' : '#fff',
          pointBorderWidth: 2, fill: false }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { grid: { color: gc }, ticks: { color: tc, font: { size: 10 }, maxRotation: 0 } },
        y: { min: 0, max: maxH, grid: { color: gc },
             ticks: { color: tc, font: { size: 10 }, callback: v => v + 'm' } }
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

  if (screen === 'tide') {
    renderTideChart();
    renderTideEvents();
    renderNextTide();
    renderDayTabs();
    const cached = weatherCache[currentSpot.id];
    renderTideTip(cached?.wind ?? 10, currentSpot);
  }
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

  // Carrega maré e clima em paralelo para o novo spot
  const [tideData, weatherData] = await Promise.all([
    fetchTideData(spot),
    fetchWeather(spot)
  ]);
  _currentTideData = tideData;
  applyData(weatherData, spot);

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

  // Carrega dados de maré reais e clima em paralelo
  const [tideData, weatherData] = await Promise.all([
    fetchTideData(currentSpot),
    fetchWeather(currentSpot)
  ]);
  _currentTideData = tideData;
  applyData(weatherData, currentSpot);

  tryGPS();
}

document.addEventListener('DOMContentLoaded', init);
