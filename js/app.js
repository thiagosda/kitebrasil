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

function renderForecast() {
  const row = document.getElementById('forecast-row');
  if (!row) return;
  row.innerHTML = FORECAST.map(f => {
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
        <div class="school-meta">
          <span style="color:#EF9F27">★</span> ${s.rating} · ${s.reviews} avaliações
        </div>
      </div>
    </div>
  `).join('');
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
    <div class="info-row"><span class="info-key">Na praia desde</span><span class="info-val">${s.since}</span></div>
  `;

  document.getElementById('school-tags').innerHTML = s.tags.map(t =>
    `<span class="tag ${s.highlightTags.includes(t) ? 'highlight' : ''}">${t}</span>`
  ).join('');

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
    </div>
  `).join('');

  document.getElementById('school-reviews-list').innerHTML = s.reviewsList.map(r => `
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
    </div>
  `).join('');

  navigate('school');
}

function renderTideEvents() {
  const el = document.getElementById('tide-events');
  if (!el) return;
  el.innerHTML = TIDE_EVENTS.map(e => {
    const isNow = e.type === 'now';
    let badge = '';
    if (e.type === 'high') badge = '<span class="event-badge badge-high">Cheia</span>';
    else if (e.type === 'low') badge = '<span class="event-badge badge-low">Seca</span>';
    else badge = '<span class="event-badge badge-now">Ao vivo</span>';
    return `<div class="event-row ${isNow ? 'now' : ''}">
      <div class="event-time ${isNow ? 'now' : ''}">${e.time}</div>
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
  if (tideChartInstance) { tideChartInstance.destroy(); tideChartInstance = null; }

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const textColor = isDark ? '#9c9a92' : '#888780';
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

  const hours = Array.from({length: 25}, (_, i) => i);
  function tideH(h) {
    const t = h / 24;
    return 1.3 + 1.1 * Math.sin(2 * Math.PI * (t * 1.93 - 0.12)) + 0.15 * Math.sin(4 * Math.PI * (t * 1.93));
  }
  const heights = hours.map(h => +tideH(h).toFixed(2));
  const nowH = new Date().getHours() + new Date().getMinutes() / 60;
  const nowVal = +tideH(nowH).toFixed(2);

  tideChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: hours.map(h => h % 6 === 0 ? h + 'h' : ''),
      datasets: [
        {
          data: heights,
          borderColor: '#185FA5',
          borderWidth: 2,
          fill: true,
          backgroundColor: isDark ? 'rgba(24,95,165,0.15)' : 'rgba(24,95,165,0.08)',
          tension: 0.4,
          pointRadius: 0,
        },
        {
          data: hours.map(h => Math.abs(h - nowH) < 0.5 ? nowVal : null),
          borderColor: '#EF9F27',
          borderWidth: 0,
          pointRadius: hours.map(h => Math.abs(h - nowH) < 0.5 ? 5 : 0),
          pointBackgroundColor: '#EF9F27',
          pointBorderColor: isDark ? '#1c1c1a' : '#fff',
          pointBorderWidth: 2,
          fill: false,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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

  const map = { 'home': 'screen-home', 'tide': 'screen-tide', 'school': 'screen-school', 'schools-list-view': 'screen-home' };
  const navMap = { 'home': 'nav-home', 'tide': 'nav-tide', 'school': 'nav-schools', 'schools-list-view': 'nav-schools' };

  const target = document.getElementById(map[screen] || 'screen-home');
  if (target) { target.classList.add('active'); target.classList.add('fade-in'); setTimeout(() => target.classList.remove('fade-in'), 300); }

  const navTarget = document.getElementById(navMap[screen] || 'nav-home');
  if (navTarget) navTarget.classList.add('active');

  if (screen === 'tide') { renderTideChart(); renderTideEvents(); }
  if (screen === 'schools-list-view') {
    setTimeout(() => {
      const sl = document.getElementById('schools-list');
      if (sl) sl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  window.scrollTo(0, 0);
}

function init() {
  updateClock();
  setInterval(updateClock, 10000);

  const dateEl = document.getElementById('hero-date');
  const tideDateEl = document.getElementById('tide-date');
  if (dateEl) dateEl.textContent = formatDate();
  if (tideDateEl) tideDateEl.textContent = 'Preá · ' + formatDate();

  renderForecast();
  renderSchoolsList();
}

document.addEventListener('DOMContentLoaded', init);
