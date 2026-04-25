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

  // Sem vento suficiente: não dá pra kitar
  if (windKnots < 10) {
    if (boxEl) { boxEl.style.background = 'var(--amber-pale)'; boxEl.style.borderLeft = '3px solid var(--amber)'; }
    titleEl.style.color = 'var(--amber-dark)';
    textEl.style.color  = 'var(--amber-dark)';
    titleEl.textContent = 'Sem condições para kitesurf';
    textEl.textContent  = `Vento de ${windKnots} nós é insuficiente para kitar (mínimo ~12 nós). Aproveite para relaxar ou visitar as lagoas.`;
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
  $('school-whatsapp-btn').onclick = () => window.open(s.whatsapp, '_blank', 'noopener,noreferrer');

  const siteBtn = $('school-site-btn');
  if (s.site) {
    siteBtn.classList.remove('disabled');
    siteBtn.onclick = () => window.open(s.site, '_blank', 'noopener,noreferrer');
  } else {
    siteBtn.classList.add('disabled');
    siteBtn.onclick = null;
  }

  $('school-map-link').onclick = () => window.open(s.mapsUrl, '_blank', 'noopener,noreferrer');

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

  const screenMap = { kitesurf: 'screen-kitesurf', tide: 'screen-tide', schools: 'screen-schools', school: 'screen-school', alerts: 'screen-alerts' };
  const navMap    = { kitesurf: 'nav-kitesurf',    tide: 'nav-tide',    schools: 'nav-schools',    school: 'nav-schools',    alerts: 'nav-kitesurf' };

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
  if (screen === 'alerts') renderAlertsList();

  applyI18n();
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
  renderLocationBanners();
  checkAlertsForBadge();

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

// ── Sistema de Alertas ─────────────────────────
// Armazenado localmente no navegador do usuário (sem servidor)
// Sanitização: spotId validado contra SPOTS, condition validada contra lista fixa

const VALID_CONDITIONS = ['wind-good', 'wind-strong', 'tide-high', 'tide-low', 'score-high'];

function getAlerts() {
  try {
    const raw = localStorage.getItem('kiteinforma_alerts');
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    // Sanitiza: aceita apenas alertas com formato esperado
    return arr.filter(a =>
      a && typeof a === 'object' &&
      typeof a.spotId === 'string' &&
      SPOTS.some(s => s.id === a.spotId) &&
      VALID_CONDITIONS.includes(a.condition)
    );
  } catch { return []; }
}

function saveAlerts(alerts) {
  try {
    localStorage.setItem('kiteinforma_alerts', JSON.stringify(alerts));
  } catch (e) { console.warn('Não foi possível salvar alertas', e); }
}

function openAlertForm() {
  const form = document.getElementById('alert-form');
  if (!form) return;
  form.style.display = 'block';
  // Popula seletor com os spots
  const sel = document.getElementById('alert-spot');
  if (sel && !sel.options.length) {
    const regions = [...new Set(SPOTS.map(s => s.region))];
    sel.innerHTML = regions.map(r =>
      `<optgroup label="${r}">${SPOTS.filter(s => s.region === r).map(s =>
        `<option value="${s.id}"${s.id === currentSpot.id ? ' selected' : ''}>${s.name}</option>`
      ).join('')}</optgroup>`
    ).join('');
  }
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeAlertForm() {
  const form = document.getElementById('alert-form');
  if (form) form.style.display = 'none';
}

function saveAlert() {
  const spotId = document.getElementById('alert-spot')?.value;
  const condEl = document.querySelector('input[name="alert-cond"]:checked');
  if (!spotId || !condEl) return;
  // Valida contra whitelist (defesa contra manipulação do DOM)
  if (!SPOTS.some(s => s.id === spotId)) return;
  if (!VALID_CONDITIONS.includes(condEl.value)) return;

  const alerts = getAlerts();
  // Evita duplicatas
  const exists = alerts.find(a => a.spotId === spotId && a.condition === condEl.value);
  if (!exists) {
    alerts.push({
      spotId,
      condition: condEl.value,
      createdAt: Date.now()
    });
    saveAlerts(alerts);
  }
  closeAlertForm();
  renderAlertsList();
  checkAlertsForBadge();
}

function deleteAlert(idx) {
  const alerts = getAlerts();
  alerts.splice(idx, 1);
  saveAlerts(alerts);
  renderAlertsList();
  checkAlertsForBadge();
}

function conditionLabel(cond) {
  const labels = {
    'wind-good':   { 'pt': '🪁 Vento bom para velejar',   'en': '🪁 Good wind for kiting' },
    'wind-strong': { 'pt': '💨 Vento forte (20+ nós)',    'en': '💨 Strong wind (20+ knots)' },
    'tide-high':   { 'pt': '🌊 Maré alta (acima 2.5m)',  'en': '🌊 High tide (above 2.5m)' },
    'tide-low':    { 'pt': '🏖️ Maré baixa (abaixo 0.6m)','en': '🏖️ Low tide (below 0.6m)' },
    'score-high':  { 'pt': '⭐ Dia excelente (score 8+)','en': '⭐ Excellent day (score 8+)' }
  };
  return labels[cond]?.[currentLang] ?? cond;
}

function checkConditionMet(condition, spot) {
  const w = weatherCache[spot.id];
  if (!w) return false;
  const score = calcScore(w.wind, w.gust);

  if (condition === 'wind-good')   return w.wind >= 14;
  if (condition === 'wind-strong') return w.wind >= 20;
  if (condition === 'score-high')  return score >= 8;

  // Para maré, precisa de dados desse spot específico
  if (_currentTideData && spot.id === currentSpot.id) {
    const lvl = parseFloat(tideStatus(spot).level);
    if (condition === 'tide-high') return lvl >= 2.5;
    if (condition === 'tide-low')  return lvl <= 0.6;
  }
  return false;
}

function renderAlertsList() {
  const list = document.getElementById('alerts-list');
  if (!list) return;
  const alerts = getAlerts();

  if (!alerts.length) {
    list.innerHTML = `<div class="empty-alerts">${i18n('no_alerts')}</div>`;
    return;
  }

  list.innerHTML = alerts.map((a, i) => {
    const spot = SPOTS.find(s => s.id === a.spotId);
    if (!spot) return '';
    const met = checkConditionMet(a.condition, spot);
    return `<div class="alert-card ${met ? 'alert-active' : ''}">
      <div class="alert-info">
        <div class="alert-cond">${conditionLabel(a.condition)}</div>
        <div class="alert-spot">📍 ${spot.name}</div>
        ${met ? `<div class="alert-status-on">✓ ${i18n('condition_met')}</div>` : `<div class="alert-status-off">${i18n('waiting')}</div>`}
      </div>
      <button class="alert-delete" onclick="deleteAlert(${i})" aria-label="Remover">×</button>
    </div>`;
  }).join('');
}

function checkAlertsForBadge() {
  const alerts = getAlerts();
  const matched = alerts.filter(a => {
    const spot = SPOTS.find(s => s.id === a.spotId);
    return spot && checkConditionMet(a.condition, spot);
  });
  const badge = document.getElementById('bell-badge');
  if (!badge) return;
  if (matched.length > 0) {
    badge.textContent = matched.length;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

// ── Internacionalização (i18n) ─────────────────

let currentLang = (() => {
  try {
    const saved = localStorage.getItem('kiteinforma_lang');
    if (saved === 'pt' || saved === 'en') return saved;
  } catch {}
  // Detecta idioma do navegador
  const nav = (navigator.language || 'pt').toLowerCase();
  return nav.startsWith('en') ? 'en' : 'pt';
})();

const TRANSLATIONS = {
  pt: {
    back: 'Voltar',
    alerts_title: 'Meus Alertas',
    alerts_subtitle: 'Receba avisos quando as condições forem ideais',
    active_alerts: 'ALERTAS ATIVOS',
    no_alerts: 'Você ainda não tem alertas. Toque em + para criar o primeiro.',
    new_alert: 'NOVO ALERTA',
    alert_spot: 'Praia',
    alert_condition: 'Condição',
    cond_wind_good: 'Vento bom para velejar',
    cond_wind_good_sub: 'Acima de 14 nós',
    cond_wind_strong: 'Vento forte',
    cond_wind_strong_sub: 'Acima de 20 nós',
    cond_tide_high: 'Maré alta',
    cond_tide_high_sub: 'Quando a maré subir acima de 2.5m',
    cond_tide_low: 'Maré baixa',
    cond_tide_low_sub: 'Quando a maré baixar abaixo de 0.6m',
    cond_score_high: 'Dia excelente',
    cond_score_high_sub: 'Score do dia 8 ou mais',
    cancel: 'Cancelar',
    save_alert: 'Salvar Alerta',
    how_works: 'COMO FUNCIONA',
    how_step1: 'Crie um alerta escolhendo a praia e a condição que você quer monitorar.',
    how_step2: 'Quando você abrir o app e a condição for atingida, um aviso aparece destacado.',
    how_step3: 'Você pode criar quantos alertas quiser e remover a qualquer momento.',
    condition_met: 'Condição atingida agora!',
    waiting: 'Aguardando condição',
    score_label: 'SCORE DO DIA',
    conditions_now: 'CONDIÇÕES AGORA',
    forecast_7days: 'PREVISÃO 7 DIAS',
    sponsored: 'Patrocinado',
    wind: 'Vento', gusts: 'Rajadas', waves: 'Ondas', tide: 'Maré',
    knots: 'nós', realtime: 'em tempo real', period: 'período',
    schools: 'Escolas', kitesurf: 'Kitesurf'
  },
  en: {
    back: 'Back',
    alerts_title: 'My Alerts',
    alerts_subtitle: 'Get notified when conditions are ideal',
    active_alerts: 'ACTIVE ALERTS',
    no_alerts: 'You have no alerts yet. Tap + to create your first.',
    new_alert: 'NEW ALERT',
    alert_spot: 'Beach',
    alert_condition: 'Condition',
    cond_wind_good: 'Good wind for kiting',
    cond_wind_good_sub: 'Above 14 knots',
    cond_wind_strong: 'Strong wind',
    cond_wind_strong_sub: 'Above 20 knots',
    cond_tide_high: 'High tide',
    cond_tide_high_sub: 'When tide rises above 2.5m',
    cond_tide_low: 'Low tide',
    cond_tide_low_sub: 'When tide drops below 0.6m',
    cond_score_high: 'Excellent day',
    cond_score_high_sub: 'Daily score 8 or higher',
    cancel: 'Cancel',
    save_alert: 'Save Alert',
    how_works: 'HOW IT WORKS',
    how_step1: 'Create an alert by picking the beach and condition you want to monitor.',
    how_step2: 'When you open the app and the condition is met, a highlighted notice appears.',
    how_step3: 'Create as many alerts as you want and remove anytime.',
    condition_met: 'Condition met right now!',
    waiting: 'Waiting for condition',
    score_label: 'TODAY\'S SCORE',
    conditions_now: 'CURRENT CONDITIONS',
    forecast_7days: '7-DAY FORECAST',
    sponsored: 'Sponsored',
    wind: 'Wind', gusts: 'Gusts', waves: 'Waves', tide: 'Tide',
    knots: 'knots', realtime: 'real time', period: 'period',
    schools: 'Schools', kitesurf: 'Kitesurf'
  }
};

function i18n(key) {
  return TRANSLATIONS[currentLang]?.[key] ?? TRANSLATIONS.pt[key] ?? key;
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const txt = i18n(key);
    if (txt) el.textContent = txt;
  });
  document.documentElement.lang = currentLang === 'en' ? 'en' : 'pt-BR';
  const toggle = document.getElementById('lang-toggle');
  if (toggle) toggle.textContent = currentLang === 'en' ? 'EN' : 'PT';
}

function toggleLang() {
  currentLang = currentLang === 'pt' ? 'en' : 'pt';
  try { localStorage.setItem('kiteinforma_lang', currentLang); } catch {}
  applyI18n();
  // Re-renderiza componentes dinâmicos
  renderAlertsList();
  if (_currentTideData) {
    _allTideEvents = extractAllTideEvents(_currentTideData);
    renderNextTide();
    renderDayTabs();
    renderTideEventsForDay(_selectedDay ?? new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Fortaleza' }));
  }
  renderLocationBanners();
}

// ── Banners por localização ────────────────────
// Cada spot tem seus próprios banners. Quando o usuário troca de praia,
// os banners mudam automaticamente.

const SPOT_BANNERS = {
  prea: [
    {
      tag: 'Escola Parceira', title: 'Preá Wind School',
      sub: 'Aulas particulares · Português, Inglês, Francês',
      icon: '🎓', gradient: 'linear-gradient(135deg,#0a2a40,#1a3a5c)',
      iconBg: '#E1F5EE', iconColor: '#0F6E56',
      url: 'https://wa.me/5588999990001?text=Olá! Vi vocês no KiteInforma'
    },
    {
      tag: 'Agência de Viagens', title: 'Preá Trips',
      sub: 'Pacotes completos: hotel, transfer e aulas',
      icon: '✈️', gradient: 'linear-gradient(135deg,#2d1a4a,#4a2e7a)',
      iconBg: '#EEDEFA', iconColor: '#534AB7',
      url: 'https://wa.me/5588999990002?text=Olá! Quero saber sobre pacotes'
    }
  ],
  barrinha: [
    {
      tag: 'Escola Parceira', title: 'Barrinha Kite Brasil',
      sub: 'O paraíso escondido do kitesurf · Aulas todos os níveis',
      icon: '🪁', gradient: 'linear-gradient(135deg,#1a3a2a,#0f4a2a)',
      iconBg: '#E1F5EE', iconColor: '#0F6E56',
      url: 'https://wa.me/5512997279682?text=Olá! Vi vocês no KiteInforma'
    },
    {
      tag: 'Agência Local', title: 'Discover Barrinha',
      sub: 'Tours de buggy, lagoas e dunas · Roteiros exclusivos',
      icon: '🏜️', gradient: 'linear-gradient(135deg,#3d2a0a,#5a3e1a)',
      iconBg: '#FAEEDA', iconColor: '#854F0B',
      url: 'https://wa.me/5588999990010?text=Olá! Quero saber sobre tours'
    }
  ],
  jericoacoara: [
    {
      tag: 'Escola Parceira', title: 'Jeri Kite Academy',
      sub: 'Localização perfeita · Instrutores certificados IKO',
      icon: '🏄', gradient: 'linear-gradient(135deg,#3a1a0a,#5a2e1a)',
      iconBg: '#FAECE7', iconColor: '#993C1D',
      url: 'https://wa.me/5588998035075?text=Olá! Vi vocês no KiteInforma'
    },
    {
      tag: 'Agência de Turismo', title: 'Jericoacoara Adventure',
      sub: 'Pôr do sol na Duna · Lagoa do Paraíso · Pedra Furada',
      icon: '🌅', gradient: 'linear-gradient(135deg,#2a1a3a,#4a2e5a)',
      iconBg: '#EEDEFA', iconColor: '#534AB7',
      url: 'https://wa.me/5588999990020?text=Olá! Quero conhecer os passeios'
    }
  ]
};

// Banners genéricos para spots sem banners específicos
const DEFAULT_BANNERS = [
  {
    tag: 'Anuncie aqui', title: 'Sua escola em destaque',
    sub: 'Alcance kitesurfistas que estão olhando esta praia',
    icon: '⭐', gradient: 'linear-gradient(135deg,#1a3a5c,#0a2a40)',
    iconBg: '#E6F1FB', iconColor: '#185FA5',
    url: 'mailto:anuncie@kiteinforma.com.br?subject=Quero anunciar'
  },
  {
    tag: 'Patrocinado', title: 'Transfer Fortaleza → Litoral',
    sub: 'Saídas diárias · Conforto e pontualidade',
    icon: '🚐', gradient: 'linear-gradient(135deg,#0a2d1a,#0f4a2a)',
    iconBg: '#E1F5EE', iconColor: '#1D9E75',
    url: 'https://wa.me/5588999990099?text=Olá! Vi vocês no KiteInforma'
  }
];

let _bannerIdx   = 0;
let _bannerTimer = null;

function getCurrentBanners() {
  return SPOT_BANNERS[currentSpot.id] ?? DEFAULT_BANNERS;
}

function renderLocationBanners() {
  const track = document.getElementById('banner-track');
  const dots  = document.getElementById('banner-dots');
  if (!track || !dots) return;

  const banners = getCurrentBanners();

  // Sanitiza URL: aceita apenas https://, mailto: e wa.me
  const safeUrl = (url) => {
    if (typeof url !== 'string') return '#';
    const trimmed = url.trim();
    if (trimmed.startsWith('https://') || trimmed.startsWith('mailto:')) return trimmed;
    return '#';
  };

  // Escapa HTML para prevenir XSS
  const esc = (s) => String(s).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);

  track.innerHTML = banners.map(b => `
    <div class="banner-slide" onclick="window.open('${safeUrl(b.url)}','_blank','noopener,noreferrer')">
      <div class="banner-slide-inner" style="background:${esc(b.gradient)}">
        <div class="bs-icon" style="background:${esc(b.iconBg)};color:${esc(b.iconColor)}">${esc(b.icon)}</div>
        <div class="bs-body">
          <div class="bs-tag">${esc(b.tag)}</div>
          <div class="bs-title">${esc(b.title)}</div>
          <div class="bs-sub">${esc(b.sub)}</div>
        </div>
        <div class="bs-arrow">›</div>
      </div>
    </div>`).join('');

  dots.innerHTML = banners.map((_, i) =>
    `<span class="dot ${i === 0 ? 'active' : ''}" onclick="goToBanner(${i})"></span>`
  ).join('');

  _bannerIdx = 0;
  track.style.transform = 'translateX(0)';
  startBannerTimer();
}

function goToBanner(n) {
  const banners = getCurrentBanners();
  _bannerIdx = (n + banners.length) % banners.length;
  const track = document.getElementById('banner-track');
  if (track) track.style.transform = `translateX(-${_bannerIdx * 100}%)`;
  document.querySelectorAll('.dot').forEach((d, i) =>
    d.classList.toggle('active', i === _bannerIdx)
  );
}

function startBannerTimer() {
  if (_bannerTimer) clearInterval(_bannerTimer);
  _bannerTimer = setInterval(() => {
    const banners = getCurrentBanners();
    if (banners.length > 1) goToBanner(_bannerIdx + 1);
  }, 5000);
}



async function init() {
  updateClock();
  setInterval(updateClock, 10_000);

  document.querySelectorAll('.hero-date').forEach(el => el.textContent = formatDate());

  renderSelectors();
  renderSeasonBanner();
  applyI18n();

  document.getElementById('spot-selector')?.addEventListener('change', e => switchSpot(e.target.value));
  document.getElementById('spot-selector-schools')?.addEventListener('change', e => switchSpot(e.target.value));

  // Carrega dados de maré reais e clima em paralelo
  const [tideData, weatherData] = await Promise.all([
    fetchTideData(currentSpot),
    fetchWeather(currentSpot)
  ]);
  _currentTideData = tideData;
  applyData(weatherData, currentSpot);
  renderLocationBanners();
  checkAlertsForBadge();

  tryGPS();
}

document.addEventListener('DOMContentLoaded', init);
