let currentSchool = null;
let tideChartInstance = null;

function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const t = h + ':' + m;
  document.querySelectorAll('#current-time, #tide-time').forEach(el => el && (el.textContent = t));
}

function formatDate() {
  const days = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const now = new Date();
  return days[now.getDay()] + ', ' + now.getDate() + ' de ' + months[now.getMonth()];
}

function scoreColor(s) {
  if (s >= 8) return { bg: '#EF9F27', text: '#412402' };
  if (s >= 6) return { bg: '#EAF3DE', text: '#27500A' };
  return { bg: '#FAEEDA', text: '#633806' };
}

function calcKiteScore(windKnots, gustKnots) {
  let score = 0;
  if (windKnots >= 15 && windKnots <= 30) score += 5;
  else if (windKnots >= 10 && windKnots < 15) score += 3;
  else if (windKnots > 30 && windKnots <= 35) score += 3;
  else score += 1;
  const gustDiff = gustKnots - windKnots;
  if (gustDiff <= 5) score += 3;
  else if (gustDiff <= 10) score += 2;
  else score += 1;
  if (windKnots >= 18 && windKnots <= 28 && gustDiff <= 5) score += 2;
  return Math.min(10, Math.max(1, score));
}

function scoreLabel(s) {
  if (s >= 9) return 'Dia excelente';
  if (s >= 7) return 'Dia muito bom';
  if (s >= 5) return 'Dia razoável';
  return 'Dia fraco';
}

function mpsToKnots(mps) { return Math.round(mps * 1.94384); }

function degToDir(deg) {
  const dirs = ['N','NNE','NE','ENE','L','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function tideHeight(h) {
  const t = h / 24;
  return 1.3 + 1.1 * Math.sin(2 * Math.PI * (t * 1.93 - 0.12)) + 0.15 * Math.sin(4 * Math.PI * (t * 1.93));
}

function getCurrentTideStatus(h) {
  const current = tideHeight(h);
  const prev = tideHeight(h - 0.5);
  const rising = current > prev;
  const pct = Math.round(((current - 0.2) / (2.4 - 0.2)) * 100);
  return {
    level: current.toFixed(1),
    status: rising ? 'Enchendo' : 'Secando',
    color: rising ? '#EF9F27' : '#85b7eb',
    pct: Math.min(100, Math.max(0, pct))
  };
}

function getTideEvents() {
  const events = [];
  const hours = Array.from({length: 48}, (_, i) => i * 0.5);
  let prev = tideHeight(0);
  for (let i = 1; i < hours.length; i++) {
    const curr = tideHeight(hours[i]);
    const next = i < hours.length - 1 ? tideHeight(hours[i+1]) : curr;
    if (curr > prev && curr >= next) {
      const hh = String(Math.floor(hours[i])).padStart(2,'0');
      const mm = (hours[i] % 1 === 0.5) ? '30' : '00';
      events.push({ time: hh+':'+mm, label: 'Maré alta', height: curr.toFixed(1)+' m', detail: 'máxima', type: 'high' });
    } else if (curr < prev && curr <= next) {
      const hh = String(Math.floor(hours[i])).padStart(2,'0');
      const mm = (hours[i] % 1 === 0.5) ? '30' : '00';
      events.push({ time: hh+':'+mm, label: 'Maré baixa', height: curr.toFixed(1)+' m', detail: 'mínima', type: 'low' });
    }
    prev = curr;
    if (events.length >= 4) break;
  }
  const nowH = new Date().getHours() + new Date().getMinutes() / 60;
  const tide = getCurrentTideStatus(nowH);
  const nowEvent = { time: 'Agora', label: tide.status, height: tide.level+' m', detail: 'em tempo real', type: 'now' };
  const insertAt = events.findIndex(e => {
    const [eh] = e.time.split(':').map(Number);
    return eh > nowH;
  });
  if (insertAt >= 0) events.splice(insertAt, 0, nowEvent);
  else events.push(nowEvent);
  return events.slice(0, 5);
}

async function fetchWeatherData() {
  const LAT = -2.867;
  const LON = -40.467;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&hourly=windspeed_10m,windgusts_10m,winddirection_10m,wave_height,wave_period&wind_speed_unit=ms&forecast_days=7&timezone=America%2FFortaleza`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const now = new Date();
    const pad = n => String(n).padStart(2,'0');
    const nowStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:00`;
    const idx = data.hourly.time.indexOf(nowStr);
    if (idx === -1) return null;

    const windMps  = data.hourly.windspeed_10m[idx];
    const gustMps  = data.hourly.windgusts_10m[idx];
    const windDeg  = data.hourly.winddirection_10m[idx];
    const waveH    = data.hourly.wave_height?.[idx] || 0.8;
    const wavePer  = data.hourly.wave_period?.[idx]  || 8;
    const windKnots = mpsToKnots(windMps);
    const gustKnots = mpsToKnots(gustMps);
    const dirStr    = degToDir(windDeg);

    const forecast = [];
    const dayNames = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    for (let d = 0; d < 7; d++) {
      const date = new Date(now);
      date.setDate(date.getDate() + d);
      const dateStr = `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
      const noon = data.hourly.time.indexOf(`${dateStr}T12:00`);
      if (noon === -1) continue;
      const dw = mpsToKnots(data.hourly.windspeed_10m[noon]);
      const dg = mpsToKnots(data.hourly.windgusts_10m[noon]);
      forecast.push({ day: d === 0 ? 'Hoje' : dayNames[date.getDay()], score: calcKiteScore(dw, dg), wind: dw, active: d === 0 });
    }
    return { windKnots, gustKnots, dirStr, waveH, wavePer, forecast };
  } catch(e) {
    console.warn('API offline, usando dados simulados', e);
    return null;
  }
}

function applyWeatherData(data) {
  const windKnots = data ? data.windKnots : 22;
  const gustKnots = data ? data.gustKnots : 26;
  const dirStr    = data ? data.dirStr    : 'NE';
  const forecast  = data ? data.forecast  : FORECAST;
  const score = calcKiteScore(windKnots, gustKnots);
  const el = id => document.getElementById(id);

  if (el('score-num'))   el('score-num').textContent  = score;
  if (el('score-desc'))  el('score-desc').textContent = scoreLabel(score);
  if (el('score-sub'))   el('score-sub').textContent  = dirStr + ' — ' + (score >= 8 ? 'Ideal para freestyle' : score >= 6 ? 'Condições ok' : 'Vento fraco hoje');
  if (el('wind-speed'))  el('wind-speed').textContent = windKnots;
  if (el('wind-gust'))   el('wind-gust').textContent  = gustKnots;
  if (el('wind-dir'))    el('wind-dir').textContent   = dirStr + ' — ' + dirStr.toLowerCase();

  const nowH = new Date().getHours() + new Date().getMinutes() / 60;
  const tide = getCurrentTideStatus(nowH);
  if (el('tide-level'))       el('tide-level').textContent       = tide.level;
  if (el('tide-status'))      el('tide-status').textContent      = tide.status.toLowerCase();
  if (el('tide-dot'))         el('tide-dot').style.background    = tide.color;
  if (el('tide-pill-text'))   el('tide-pill-text').textContent   = tide.status;
  if (el('tide-pill-level'))  el('tide-pill-level').textContent  = tide.level + ' m agora';
  if (el('tide-bar'))         el('tide-bar').style.width         = tide.pct + '%';

  renderForecast(forecast);
}

function renderForecast(forecast) {
  const row = document.getElementById('forecast-row');
  if (!row) return;
  const data = forecast || FORECAST;
  row.innerHTML = data.map(f => {
    const c = scoreColor(f.score);
    return `<div class="forecast-card ${f.active ? 'active' : ''}">
      <div class="fc-day">${f.day}</div>
      <div class="fc-score" style="background:${c.bg};color:${c.text}">${f.score}</div>
      <div class="fc-wind">${f.wind} nós</div>
    </div>`;
  }).join('');
}

function renderSchoolsList() {
  const list = document.getElementById('schools-list');
  if (!list) return;
  list.innerHTML = SCHOOLS.map(s => `
    <div class="school-card" onclick="openSchool(${s.id})">
      <div class="school-avatar" style="background:${s.color}">${s.initials}</div>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div class="school-name">${s.name}</div>
          <span class="school-badge ${s.open ? 'badge-open' : 'badge-closed'}">${s.open ? 'Aberta agora' : (s.openTime || 'Fechada')}</span>
        </div>
        <div class="school-meta"><span style="color:#EF9F27">★</span> ${s.rating} · ${s.reviews} avaliações</div>
      </div>
    </div>`).join('');
}

function renderSchoolsPage() {
  const list = document.getElementById('schools-list-page');
  if (!list) return;
  list.innerHTML = SCHOOLS.map(s => `
    <div class="school-card" onclick="openSchool(${s.id})">
      <div class="school-avatar" style="background:${s.color}">${s.initials}</div>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div class="school-name">${s.name}</div>
          <span class="school-badge ${s.open ? 'badge-open' : 'badge-closed'}">${s.open ? 'Aberta agora' : (s.openTime || 'Fechada')}</span>
        </div>
        <div class="school-meta"><span style="color:#EF9F27">★</span> ${s.rating} · ${s.reviews} avaliações</div>
        <div class="school-meta" style="margin-top:3px">${s.location} · desde ${s.since}</div>
      </div>
    </div>`).join('');
}

function openSchool(id) {
  currentSchool = SCHOOLS.find(s => s.id === id);
  if (!currentSchool) return;
  const s = currentSchool;
  document.getElementById('school-logo').textContent = s.initials;
  document.getElementById('school-logo').style.background = s.color;
  document.getElementById('school-name-title').textContent = s.name;
  document.getElementById('school-loc-title').textContent = s.location;
  document.getElementById('school-rating').textContent = s.rating;
  document.getElementById('school-reviews').textContent = s.reviews + ' avaliações';
  document.getElementById('school-badge').textContent = s.open ? 'Aberta agora' : (s.openTime || 'Fechada');
  document.getElementById('school-contact-btn').onclick = () => window.location.href = s.contact;
  document.getElementById('school-info').innerHTML = `
    <div class="info-row"><span class="info-key">Funcionamento</span><span class="info-val">${s.hours}</span></div>
    <div class="info-row"><span class="info-key">Idiomas</span><span class="info-val">${s.languages}</span></div>
    <div class="info-row"><span class="info-key">Instrutores</span><span class="info-val">${s.instructors}</span></div>
    <div class="info-row"><span class="info-key">Na praia desde</span><span class="info-val">${s.since}</span></div>`;
  document.getElementById('school-tags').innerHTML = s.tags.map(t =>
    `<span class="tag ${s.highlightTags.includes(t) ? 'highlight' : ''}">${t}</span>`).join('');
  document.getElementById('school-packages').innerHTML = s.packages.map(p => `
    <div class="pkg-card ${p.featured ? 'featured' : ''}">
      <div>
        ${p.featured ? '<div class="pkg-badge">Mais popular</div>' : ''}
        <div class="pkg-name">${p.name}</div>
        <div class="pkg-desc">${p.desc}</div>
      </div>
      <div>
        <div class="pkg-price">${p.price}</div>
        <div class="pkg-unit">${p.unit}</div>
      </div>
    </div>`).join('');
  document.getElementById('school-reviews-list').innerHTML = s.reviewsList.map(r => `
    <div class="review-card">
      <div class="review-header">
        <div class="reviewer">
          <div class="rev-avatar" style="background:${r.color};color:${r.textColor}">${r.initials}</div>
          <div><div class="rev-name">${r.name}</div><div class="rev-date">${r.date}</div></div>
        </div>
        <span class="rev-stars">${'★'.repeat(r.stars)}</span>
      </div>
      <div class="rev-text">${r.text}</div>
    </div>`).join('');
  navigate('school');
}

function renderTideEvents() {
  const el = document.getElementById('tide-events');
  if (!el) return;
  el.innerHTML = getTideEvents().map(e => {
    const isNow = e.type === 'now';
    let badge = e.type === 'high'
      ? '<span class="event-badge badge-high">Cheia</span>'
      : e.type === 'low'
      ? '<span class="event-badge badge-low">Seca</span>'
      : '<span class="event-badge badge-now">Ao vivo</span>';
    return `<div class="event-row ${isNow ? 'now' : ''}">
      <div class="event-time ${isNow ? 'now' : ''}">${e.time}</div>
      <div class="event-info">
        <div class="event-label">${e.label}</div>
        <div class="event-height">${e.height} · ${e.detail}</div>
      </div>${badge}</div>`;
  }).join('');
}

function renderTideChart() {
  const canvas = document.getElementById('tideChart');
  if (!canvas) return;
  if (tideChartInstance) { tideChartInstance.destroy(); tideChartInstance = null; }
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const textColor = isDark ? '#9c9a92' : '#888780';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const hours = Array.from({length: 25}, (_, i) => i);
  const heights = hours.map(h => +tideHeight(h).toFixed(2));
  const nowH = new Date().getHours() + new Date().getMinutes() / 60;
  const nowVal = +tideHeight(nowH).toFixed(2);
  tideChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: hours.map(h => h % 6 === 0 ? h + 'h' : ''),
      datasets: [
        { data: heights, borderColor: '#185FA5', borderWidth: 2, fill: true,
          backgroundColor: isDark ? 'rgba(24,95,165,0.15)' : 'rgba(24,95,165,0.08)', tension: 0.4, pointRadius: 0 },
        { data: hours.map(h => Math.abs(h - nowH) < 0.5 ? nowVal : null),
          borderColor: '#EF9F27', borderWidth: 0,
          pointRadius: hours.map(h => Math.abs(h - nowH) < 0.5 ? 5 : 0),
          pointBackgroundColor: '#EF9F27', pointBorderColor: isDark ? '#1c1c1a' : '#fff', pointBorderWidth: 2, fill: false }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 }, maxRotation: 0 } },
        y: { min: 0, max: 3, grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10 }, stepSize: 1, callback: v => v + 'm' } }
      }
    }
  });
}

function navigate(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const map = { 'home':'screen-home','tide':'screen-tide','school':'screen-school','schools':'screen-schools' };
  const navMap = { 'home':'nav-home','tide':'nav-tide','school':'nav-schools','schools':'nav-schools' };
  const target = document.getElementById(map[screen] || 'screen-home');
  if (target) { target.classList.add('active'); target.classList.add('fade-in'); setTimeout(() => target.classList.remove('fade-in'), 300); }
  const navTarget = document.getElementById(navMap[screen] || 'nav-home');
  if (navTarget) navTarget.classList.add('active');
  if (screen === 'tide') { renderTideChart(); renderTideEvents(); }
  if (screen === 'schools') { renderSchoolsPage(); }
  window.scrollTo(0, 0);
}

async function init() {
  updateClock();
  setInterval(updateClock, 10000);
  const dateEl = document.getElementById('hero-date');
  const tideDateEl = document.getElementById('tide-date');
  if (dateEl) dateEl.textContent = formatDate();
  if (tideDateEl) tideDateEl.textContent = 'Preá · ' + formatDate();
  renderSchoolsList();
  const weatherData = await fetchWeatherData();
  applyWeatherData(weatherData);
}

document.addEventListener('DOMContentLoaded', init);
