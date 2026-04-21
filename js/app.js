let currentSpot = SPOTS[0];
let currentSchool = null;
let tideChartInstance = null;
let weatherCache = {};

function updateClock() {
  const now = new Date();
  const t = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
  document.querySelectorAll('.clock').forEach(el => el.textContent = t);
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
  const diff = gustKnots - windKnots;
  if (diff <= 5) score += 3;
  else if (diff <= 10) score += 2;
  else score += 1;
  if (windKnots >= 18 && windKnots <= 28 && diff <= 5) score += 2;
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

function tideHeight(h, offset = 0) {
  const t = (h + offset / 60) / 24;
  return 1.3 + 1.1 * Math.sin(2 * Math.PI * (t * 1.93 - 0.12)) + 0.15 * Math.sin(4 * Math.PI * (t * 1.93));
}

function getCurrentTideStatus(spot) {
  const h = new Date().getHours() + new Date().getMinutes() / 60;
  const off = (spot.tideOffset || 0) / 60;
  const current = tideHeight(h, spot.tideOffset);
  const prev = tideHeight(h - 0.5, spot.tideOffset);
  const rising = current > prev;
  const pct = Math.round(((current - 0.2) / (2.4 - 0.2)) * 100);
  return {
    level: current.toFixed(1),
    status: rising ? 'Enchendo' : 'Secando',
    color: rising ? '#EF9F27' : '#85b7eb',
    pct: Math.min(100, Math.max(0, pct))
  };
}

function getTideEvents(spot) {
  const events = [];
  const hours = Array.from({length: 48}, (_, i) => i * 0.5);
  let prev = tideHeight(0, spot.tideOffset);
  for (let i = 1; i < hours.length; i++) {
    const curr = tideHeight(hours[i], spot.tideOffset);
    const next = i < hours.length - 1 ? tideHeight(hours[i+1], spot.tideOffset) : curr;
    if (curr > prev && curr >= next) {
      const hh = String(Math.floor(hours[i])).padStart(2,'0');
      const mm = hours[i] % 1 === 0.5 ? '30' : '00';
      events.push({ time: hh+':'+mm, label: 'Maré alta', height: curr.toFixed(1)+' m', detail: 'máxima', type: 'high' });
    } else if (curr < prev && curr <= next) {
      const hh = String(Math.floor(hours[i])).padStart(2,'0');
      const mm = hours[i] % 1 === 0.5 ? '30' : '00';
      events.push({ time: hh+':'+mm, label: 'Maré baixa', height: curr.toFixed(1)+' m', detail: 'mínima', type: 'low' });
    }
    prev = curr;
    if (events.length >= 4) break;
  }
  const nowH = new Date().getHours() + new Date().getMinutes() / 60;
  const tide = getCurrentTideStatus(spot);
  const nowEvent = { time: 'Agora', label: tide.status, height: tide.level+' m', detail: 'em tempo real', type: 'now' };
  const insertAt = events.findIndex(e => parseInt(e.time) > nowH);
  if (insertAt >= 0) events.splice(insertAt, 0, nowEvent);
  else events.push(nowEvent);
  return events.slice(0, 5);
}

async function fetchWeatherForSpot(spot) {
  const key = spot.id;
  if (weatherCache[key]) return weatherCache[key];
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${spot.lat}&longitude=${spot.lon}&hourly=windspeed_10m,windgusts_10m,winddirection_10m,wave_height,wave_period&wind_speed_unit=ms&forecast_days=7&timezone=America%2FFortaleza`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const now = new Date();
    const pad = n => String(n).padStart(2,'0');
    const nowStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:00`;
    const idx = data.hourly.time.indexOf(nowStr);
    if (idx === -1) return null;

    const windKnots = mpsToKnots(data.hourly.windspeed_10m[idx]);
    const gustKnots = mpsToKnots(data.hourly.windgusts_10m[idx]);
    const dirStr = degToDir(data.hourly.winddirection_10m[idx]);
    const waveH = data.hourly.wave_height?.[idx] || 0.8;
    const wavePer = data.hourly.wave_period?.[idx] || 8;

    const dayNames = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    const forecast = [];
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

    const result = { windKnots, gustKnots, dirStr, waveH, wavePer, forecast };
    weatherCache[key] = result;
    return result;
  } catch(e) {
    console.warn('API offline para ' + spot.name, e);
    return null;
  }
}

function renderSpotSelector() {
  const sel = document.getElementById('spot-selector');
  if (!sel) return;
  const regions = [...new Set(SPOTS.map(s => s.region))];
  sel.innerHTML = regions.map(r => `
    <optgroup label="${r}">
      ${SPOTS.filter(s => s.region === r).map(s =>
        `<option value="${s.id}" ${s.id === currentSpot.id ? 'selected' : ''}>${s.name}</option>`
      ).join('')}
    </optgroup>
  `).join('');
}

function renderSpotSelectorSchools() {
  const sel = document.getElementById('spot-selector-schools');
  if (!sel) return;
  const regions = [...new Set(SPOTS.map(s => s.region))];
  sel.innerHTML = regions.map(r => `
    <optgroup label="${r}">
      ${SPOTS.filter(s => s.region === r).map(s =>
        `<option value="${s.id}" ${s.id === currentSpot.id ? 'selected' : ''}>${s.name}</option>`
      ).join('')}
    </optgroup>
  `).join('');
}

async function switchSpot(spotId) {
  const spot = SPOTS.find(s => s.id === spotId);
  if (!spot) return;
  currentSpot = spot;

  document.querySelectorAll('.spot-name').forEach(el => el.textContent = spot.name);
  document.querySelectorAll('.spot-desc').forEach(el => el.textContent = spot.description);
  document.querySelectorAll('#spot-selector, #spot-selector-schools').forEach(sel => sel.value = spotId);

  showLoading(true);
  const weather = await fetchWeatherForSpot(spot);
  applyWeatherData(weather, spot);
  showLoading(false);

  if (document.getElementById('screen-schools').classList.contains('active')) {
    renderSchoolsPage();
  }
}

function showLoading(on) {
  document.querySelectorAll('.loading-indicator').forEach(el => {
    el.style.opacity = on ? '1' : '0';
  });
}

function applyWeatherData(data, spot) {
  const windKnots = data ? data.windKnots : 22;
  const gustKnots = data ? data.gustKnots : 26;
  const dirStr = data ? data.dirStr : 'NE';
  const waveH = data ? data.waveH : 0.8;
  const wavePer = data ? data.wavePer : 8;
  const forecast = data ? data.forecast : [];
  const score = calcKiteScore(windKnots, gustKnots);

  const el = id => document.getElementById(id);
  if (el('score-num')) el('score-num').textContent = score;
  if (el('score-desc')) el('score-desc').textContent = scoreLabel(score);
  if (el('score-sub')) el('score-sub').textContent = dirStr + ' · ' + (score >= 8 ? 'Ideal para freestyle' : score >= 6 ? 'Condições ok' : 'Vento fraco hoje');
  if (el('wind-speed')) el('wind-speed').textContent = windKnots;
  if (el('wind-gust')) el('wind-gust').textContent = gustKnots;
  if (el('wind-dir')) el('wind-dir').textContent = dirStr + ' — ' + dirStr.toLowerCase();
  if (el('wave-height')) el('wave-height').textContent = waveH.toFixed(1);
  if (el('wave-period')) el('wave-period').textContent = 'período ' + Math.round(wavePer) + 's';

  const tide = getCurrentTideStatus(spot);
  if (el('tide-level')) el('tide-level').textContent = tide.level;
  if (el('tide-status')) el('tide-status').textContent = tide.status.toLowerCase();
  if (el('tide-dot')) el('tide-dot').style.background = tide.color;
  if (el('tide-pill-text')) el('tide-pill-text').textContent = tide.status;
  if (el('tide-pill-level')) el('tide-pill-level').textContent = tide.level + ' m agora';
  if (el('tide-bar')) el('tide-bar').style.width = tide.pct + '%';

  renderForecast(forecast);
}

function renderForecast(forecast) {
  const row = document.getElementById('forecast-row');
  if (!row || !forecast.length) return;
  row.innerHTML = forecast.map(f => {
    const c = scoreColor(f.score);
    return `<div class="forecast-card ${f.active ? 'active' : ''}">
      <div class="fc-day">${f.day}</div>
      <div class="fc-score" style="background:${c.bg};color:${c.text}">${f.score}</div>
      <div class="fc-wind">${f.wind} nós</div>
    </div>`;
  }).join('');
}

function renderSchoolsPage() {
  const list = document.getElementById('schools-list-page');
  const title = document.getElementById('schools-page-title');
  if (!list) return;
  if (title) title.textContent = 'Escolas em ' + currentSpot.name;
  const schools = currentSpot.schools || [];
  if (!schools.length) {
    list.innerHTML = `<div style="text-align:center;padding:32px 16px;color:var(--text-muted);font-size:14px">Nenhuma escola cadastrada em ${currentSpot.name} ainda.</div>`;
    return;
  }
  list.innerHTML = schools.map(s => `
    <div class="school-card" onclick="openSchool('${currentSpot.id}', ${s.id})">
      <div class="school-avatar" style="background:${s.color}">${s.initials}</div>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div class="school-name">${s.name}</div>
          <span class="school-badge ${s.open ? 'badge-open' : 'badge-closed'}">${s.open ? 'Aberta agora' : (s.openTime || 'Fechada')}</span>
        </div>
        <div class="school-meta"><span style="color:#EF9F27">★</span> ${s.rating} · ${s.reviews} avaliações</div>
        <div class="school-meta" style="margin-top:2px">${s.location || currentSpot.name} · desde ${s.since}</div>
      </div>
    </div>`).join('');
}

function openSchool(spotId, schoolId) {
  const spot = SPOTS.find(s => s.id === spotId);
  if (!spot) return;
  const s = spot.schools.find(sc => sc.id === schoolId);
  if (!s) return;
  currentSchool = s;

  document.getElementById('school-logo').textContent = s.initials;
  document.getElementById('school-logo').style.background = s.color;
  document.getElementById('school-name-title').textContent = s.name;
  document.getElementById('school-loc-title').textContent = spot.name + ' · ' + spot.region;
  document.getElementById('school-rating').textContent = s.rating;
  document.getElementById('school-reviews').textContent = s.reviews + ' avaliações';
  document.getElementById('school-badge').textContent = s.open ? 'Aberta agora' : (s.openTime || 'Fechada');

  document.getElementById('school-phone-btn').onclick = () => window.location.href = 'tel:' + s.phone;
  document.getElementById('school-whatsapp-btn').onclick = () => window.open(s.whatsapp, '_blank');

  const siteBtn = document.getElementById('school-site-btn');
  if (s.site) {
    siteBtn.classList.remove('disabled');
    siteBtn.onclick = () => window.open(s.site, '_blank');
  } else {
    siteBtn.classList.add('disabled');
    siteBtn.onclick = null;
  }

  document.getElementById('school-map-link').onclick = () => window.open(s.mapsUrl, '_blank');

  document.getElementById('school-google-rating').innerHTML = `
    <span class="stars">${'★'.repeat(Math.round(s.rating))}</span>
    <span>${s.rating}</span>
    <span class="count">(${s.reviews} no Google)</span>`;

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
  el.innerHTML = getTideEvents(currentSpot).map(e => {
    const isNow = e.type === 'now';
    const badge = e.type === 'high'
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
  const heights = hours.map(h => +tideHeight(h, currentSpot.tideOffset).toFixed(2));
  const nowH = new Date().getHours() + new Date().getMinutes() / 60;
  const nowVal = +tideHeight(nowH, currentSpot.tideOffset).toFixed(2);
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
          pointBackgroundColor: '#EF9F27',
          pointBorderColor: isDark ? '#1c1c1a' : '#fff',
          pointBorderWidth: 2, fill: false }
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
  const map = { 'kitesurf':'screen-kitesurf','tide':'screen-tide','schools':'screen-schools','school':'screen-school' };
  const navMap = { 'kitesurf':'nav-kitesurf','tide':'nav-tide','schools':'nav-schools','school':'nav-schools' };
  const target = document.getElementById(map[screen] || 'screen-kitesurf');
  if (target) { target.classList.add('active'); target.classList.add('fade-in'); setTimeout(() => target.classList.remove('fade-in'), 300); }
  const navTarget = document.getElementById(navMap[screen] || 'nav-kitesurf');
  if (navTarget) navTarget.classList.add('active');
  if (screen === 'tide') { renderTideChart(); renderTideEvents(); }
  if (screen === 'schools') renderSchoolsPage();
  window.scrollTo(0, 0);
}

function tryGPS() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    let closest = SPOTS[0];
    let minDist = Infinity;
    SPOTS.forEach(spot => {
      const d = Math.sqrt(Math.pow(spot.lat - latitude, 2) + Math.pow(spot.lon - longitude, 2));
      if (d < minDist) { minDist = d; closest = spot; }
    });
    if (closest.id !== currentSpot.id) switchSpot(closest.id);
  }, () => {});
}

async function init() {
  updateClock();
  setInterval(updateClock, 10000);

  document.querySelectorAll('.hero-date').forEach(el => el.textContent = formatDate());

  renderSpotSelector();
  renderSpotSelectorSchools();

  document.getElementById('spot-selector')?.addEventListener('change', e => switchSpot(e.target.value));
  document.getElementById('spot-selector-schools')?.addEventListener('change', e => switchSpot(e.target.value));

  showLoading(true);
  const weather = await fetchWeatherForSpot(currentSpot);
  applyWeatherData(weather, currentSpot);
  showLoading(false);

  renderSeasonBanner();
  tryGPS();
}

document.addEventListener('DOMContentLoaded', init);

function getSeasonBanner() {
  const month = new Date().getMonth() + 1;
  if (month >= 7 && month <= 1) return null;
  if (month >= 2 && month <= 6) {
    return {
      type: 'low',
      title: 'Baixa temporada',

function renderSeasonBanner() {
  const el = document.getElementById('season-banner');
  if (!el) return;
  const month = new Date().getMonth() + 1;
  if (month >= 7 || month === 1) {
    el.style.display = 'none';
  } else {
    el.style.display = 'flex';
  }
}
