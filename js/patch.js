// ── KiteInforma Patch ─────────────────────────────
// Tradução completa + Push Notifications (sem emojis)

// ── 1. Estende TRANSLATIONS ──────────────────────
(function patchTranslations() {
  if (typeof TRANSLATIONS === 'undefined') return;

  Object.assign(TRANSLATIONS.pt, {
    tides:             'Marés',
    tide_rising:       'Enchendo',
    tide_falling:      'Secando',
    tide_high_lbl:     'Maré alta',
    tide_low_lbl:      'Maré baixa',
    tide_max:          'máxima',
    tide_min:          'mínima',
    tide_next:         'Próxima',
    tide_full:         'Cheia',
    tide_dry:          'Seca',
    tide_now_lbl:      'm agora',
    no_data_day:       'Sem dados para este dia.',
    today:             'Hoje',
    period_lbl:        'período',
    knots_lbl:         'nós',
    score_excellent:   'Dia excelente',
    score_great:       'Dia muito bom',
    score_ok:          'Dia razoável',
    score_weak:        'Dia fraco',
    score_sub_ideal:   'Ideal para freestyle',
    score_sub_ok:      'Condições ok',
    score_sub_weak:    'Vento fraco hoje',
    tip_no_wind_title: 'Sem condições para kitesurf',
    tip_no_wind_text:  'Vento insuficiente para kitar (mínimo ~12 nós). Aproveite para relaxar ou visitar as lagoas.',
    tip_beginner_title:'Condição para iniciantes',
    tip_beginner_text: 'Vento fraco para avançados, mas adequado para praticar em lagoa com pipa grande.',
    tip_high_rising:   'Maré alta e enchendo',
    tip_high_falling:  'Maré alta e secando',
    tip_high_rising_t: 'Maré subindo. Bom para wave riding. Cuidado com a profundidade nas lagoas.',
    tip_high_falling_t:'Maré vazando. Boa janela para freestyle no mar aberto. Aproveite antes de secar.',
    tip_low_rising:    'Maré baixa e enchendo',
    tip_low_title:     'Maré baixa',
    tip_low_rising_t:  'Maré subindo. Lagoas e rampas ficam expostas — ótimo para iniciantes e manobras rasas.',
    tip_low_t:         'Mínima do dia. Ideal para sessões na lagoa e downwind. Mar pode estar raso.',
    tip_mid_title:     'Boa condição · vento',
    tip_mid_preamar:   'preamar',
    tip_mid_baixamar:  'baixamar',
    tip_mid_text:      'Maré em direção à {peak}. Boas condições para todos os níveis.',
    schools_in:        'Escolas em',
    open_now:          'Aberta agora',
    closed:            'Fechada',
    reviews_lbl:       'avaliações',
    next_tide_lbl:     'PRÓXIMA MARÉ',
    season_title:      'Baixa temporada',
    season_sub:        'Ventos mais fracos agora · Alta temporada: julho a janeiro',
    chart_today:       'GRÁFICO DE HOJE',
    tide_table:        'TÁBUA DE MARÉS — 7 DIAS',
    tip_today:         'DICA PARA HOJE',
    tide_label_low:    'Seca (~0.4m)',
    tide_label_high:   'Cheia (~2.7m)',
    notif_active:      'Notificações ativas',
    notif_blocked:     'Notificações bloqueadas no navegador',
    notif_enable:      'Ativar notificações push',
    notif_test:        'Notificações ativadas! Você receberá alertas de kite.',
    notif_wind_good:   'Vento bom para kitesurf',
    notif_wind_strong: 'Vento forte detectado',
    notif_tide_high:   'Maré alta agora',
    notif_tide_low:    'Maré baixa agora',
    notif_score_high:  'Dia excelente para kitar!',
  });

  Object.assign(TRANSLATIONS.en, {
    tides:             'Tides',
    tide_rising:       'Rising',
    tide_falling:      'Falling',
    tide_high_lbl:     'High tide',
    tide_low_lbl:      'Low tide',
    tide_max:          'maximum',
    tide_min:          'minimum',
    tide_next:         'Next',
    tide_full:         'High',
    tide_dry:          'Low',
    tide_now_lbl:      'm now',
    no_data_day:       'No data for this day.',
    today:             'Today',
    period_lbl:        'period',
    knots_lbl:         'kn',
    score_excellent:   'Excellent day',
    score_great:       'Great day',
    score_ok:          'Decent day',
    score_weak:        'Weak day',
    score_sub_ideal:   'Ideal for freestyle',
    score_sub_ok:      'Decent conditions',
    score_sub_weak:    'Light wind today',
    tip_no_wind_title: 'Not enough wind for kitesurfing',
    tip_no_wind_text:  'Wind too light to kite (minimum ~12 kn). Great time to relax or explore the lagoons.',
    tip_beginner_title:'Beginner conditions',
    tip_beginner_text: 'Light wind for advanced riders, but suitable for lagoon sessions with a larger kite.',
    tip_high_rising:   'High tide and rising',
    tip_high_falling:  'High tide and falling',
    tip_high_rising_t: 'Tide rising. Good for wave riding. Watch the depth in the lagoons.',
    tip_high_falling_t:'Tide dropping. Good window for open-water freestyle. Go before it gets too shallow.',
    tip_low_rising:    'Low tide and rising',
    tip_low_title:     'Low tide',
    tip_low_rising_t:  'Tide rising. Lagoons and ramps exposed — ideal for beginners and flat-water tricks.',
    tip_low_t:         'Daily minimum. Great for lagoon sessions and downwinders. Sea may be very shallow.',
    tip_mid_title:     'Good conditions · wind',
    tip_mid_preamar:   'high tide',
    tip_mid_baixamar:  'low tide',
    tip_mid_text:      'Tide heading towards {peak}. Good conditions for all levels.',
    schools_in:        'Schools in',
    open_now:          'Open now',
    closed:            'Closed',
    reviews_lbl:       'reviews',
    next_tide_lbl:     'NEXT TIDE',
    season_title:      'Off season',
    season_sub:        'Lighter winds now · High season: July to January',
    chart_today:       "TODAY'S CHART",
    tide_table:        'TIDE TABLE — 7 DAYS',
    tip_today:         "TODAY'S TIP",
    tide_label_low:    'Low (~0.4m)',
    tide_label_high:   'High (~2.7m)',
    notif_active:      'Notifications active',
    notif_blocked:     'Notifications blocked in browser',
    notif_enable:      'Enable push notifications',
    notif_test:        'Notifications enabled! You will receive kite alerts.',
    notif_wind_good:   'Good wind for kitesurfing',
    notif_wind_strong: 'Strong wind detected',
    notif_tide_high:   'High tide right now',
    notif_tide_low:    'Low tide right now',
    notif_score_high:  'Excellent kite day!',
  });
})();

// ── 2. scoreLabel bilíngue ───────────────────────
const _origScoreLabel = window.scoreLabel;
window.scoreLabel = function(s) {
  if (s >= 9) return i18n('score_excellent');
  if (s >= 7) return i18n('score_great');
  if (s >= 5) return i18n('score_ok');
  return i18n('score_weak');
};

// ── 3. formatDate bilíngue ───────────────────────
const _origFormatDate = window.formatDate;
window.formatDate = function() {
  const d = new Date();
  const lang = (typeof currentLang !== 'undefined') ? currentLang : 'pt';
  if (lang === 'en') {
    const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
  }
  const days   = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  return `${days[d.getDay()]}, ${d.getDate()} de ${months[d.getMonth()]}`;
};

// ── 4. applyData — corrige strings fixas ─────────
const _origApplyData = window.applyData;
window.applyData = function(data, spot) {
  _origApplyData(data, spot);
  const wind  = data?.wind ?? 10;
  const gust  = data?.gust ?? 14;
  const score = calcScore(wind, gust);
  const wp    = data?.wp ?? 8;
  const t     = tideStatus(spot);
  const $     = id => document.getElementById(id);
  const rising = t.status === 'Enchendo';

  $('score-desc').textContent = scoreLabel(score);
  $('score-sub').textContent  = `${data?.dir ?? 'NE'} · ${
    score >= 8 ? i18n('score_sub_ideal') :
    score >= 6 ? i18n('score_sub_ok') : i18n('score_sub_weak')}`;
  $('wave-period').textContent = `${i18n('period_lbl')} ${Math.round(wp)}s`;
  $('tide-status').textContent = (rising ? i18n('tide_rising') : i18n('tide_falling')).toLowerCase();
  $('tide-pill-text').textContent  = rising ? i18n('tide_rising') : i18n('tide_falling');
  $('tide-pill-level').textContent = `${t.level} ${i18n('tide_now_lbl')}`;
};

// ── 5. renderTideTip bilíngue ────────────────────
window.renderTideTip = function(windKnots, spot) {
  const titleEl = document.getElementById('tide-tip-title');
  const textEl  = document.getElementById('tide-tip-text');
  const boxEl   = document.getElementById('tide-tip-box');
  if (!titleEl || !textEl) return;

  const t      = tideStatus(spot);
  const level  = parseFloat(t.level);
  const rising = t.status === 'Enchendo';

  if (windKnots < 10) {
    if (boxEl) { boxEl.style.background = 'rgba(245,158,11,0.09)'; boxEl.style.borderColor = 'rgba(245,158,11,0.3)'; }
    titleEl.textContent = i18n('tip_no_wind_title');
    textEl.textContent  = i18n('tip_no_wind_text');
    return;
  }
  if (boxEl) { boxEl.style.background = ''; boxEl.style.borderColor = ''; }

  if (windKnots < 14) {
    titleEl.textContent = i18n('tip_beginner_title');
    textEl.textContent  = i18n('tip_beginner_text');
    return;
  }

  if (level > 2.5) {
    titleEl.textContent = rising ? i18n('tip_high_rising') : i18n('tip_high_falling');
    textEl.textContent  = rising ? i18n('tip_high_rising_t') : i18n('tip_high_falling_t');
  } else if (level < 0.8) {
    titleEl.textContent = rising ? i18n('tip_low_rising') : i18n('tip_low_title');
    textEl.textContent  = rising ? i18n('tip_low_rising_t') : i18n('tip_low_t');
  } else {
    const peak = rising ? i18n('tip_mid_preamar') : i18n('tip_mid_baixamar');
    titleEl.textContent = `${i18n('tip_mid_title')} ${windKnots} ${i18n('knots_lbl')}`;
    textEl.textContent  = i18n('tip_mid_text').replace('{peak}', peak);
  }
};

// ── 6. renderTideEventsForDay bilíngue ───────────
window.renderTideEventsForDay = function(dateKey) {
  const el = document.getElementById('tide-events');
  if (!el) return;
  const todayKey    = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Fortaleza' });
  const evs         = _allTideEvents.filter(e => e.dateKey === dateKey);
  if (!evs.length) { el.innerHTML = `<div class="empty-schools">${i18n('no_data_day')}</div>`; return; }
  const nowLocalStr = new Date().toLocaleString('sv-SE', { timeZone: 'America/Fortaleza' }).replace(' ', 'T');

  el.innerHTML = evs.map(e => {
    const eventStr = e.dateKey + 'T' + e.time + ':00';
    const isPast   = dateKey === todayKey && eventStr < nowLocalStr;
    const isNext   = dateKey === todayKey && !isPast &&
                     !evs.some(ev => (ev.dateKey+'T'+ev.time+':00') < eventStr &&
                                     (ev.dateKey+'T'+ev.time+':00') >= nowLocalStr);
    const isHigh   = e.type === 'high';
    const label    = isHigh ? i18n('tide_high_lbl') : i18n('tide_low_lbl');
    const badge    = isHigh
      ? `<span class="event-badge badge-high">${i18n('tide_full')}</span>`
      : `<span class="event-badge badge-low">${i18n('tide_dry')}</span>`;
    const nextBadge = isNext ? `<span class="event-badge badge-now">${i18n('tide_next')}</span>` : badge;

    return `<div class="event-row" style="${isPast ? 'opacity:0.45' : ''}">
      <div class="event-time${isNext ? ' now' : ''}">${e.time}</div>
      <div class="event-info">
        <div class="event-label">${label}</div>
        <div class="event-height">${e.level} m · ${isHigh ? i18n('tide_max') : i18n('tide_min')}</div>
      </div>
      ${nextBadge}
    </div>`;
  }).join('');
};

// ── 7. renderDayTabs bilíngue ────────────────────
window.renderDayTabs = function() {
  const container = document.getElementById('day-tabs');
  if (!container || !_allTideEvents.length) return;
  const seen = new Set(), days = [];
  _allTideEvents.forEach(e => { if (!seen.has(e.dateKey)) { seen.add(e.dateKey); days.push(e); } });
  const todayKey = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Fortaleza' });
  if (!_selectedDay) _selectedDay = todayKey;

  container.innerHTML = days.map(e => {
    const isToday  = e.dateKey === todayKey;
    const isActive = e.dateKey === _selectedDay;
    const highs    = _allTideEvents.filter(ev => ev.dateKey === e.dateKey && ev.type === 'high').length;
    return `<div class="day-tab ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}"
                 onclick="selectDay('${e.dateKey}')">
      <div class="day-tab-name">${isToday ? i18n('today') : e.dayName}</div>
      <div class="day-tab-date">${e.dateDisp}</div>
      <div class="day-tab-dot" style="background:${highs >= 2 ? 'var(--teal)' : 'var(--amber)'}"></div>
    </div>`;
  }).join('');
};

// ── 8. renderNextTide bilíngue ───────────────────
window.renderNextTide = function() {
  const now    = new Date();
  const nowStr = now.toLocaleString('sv-SE', { timeZone: 'America/Fortaleza' }).replace(' ', 'T');
  const next   = _allTideEvents.find(e => (e.dateKey + 'T' + e.time + ':00') > nowStr);
  if (!next) return;
  const el = id => document.getElementById(id);
  const isHigh     = next.type === 'high';
  const isTomorrow = next.dateKey !== new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Fortaleza' });
  const dayLabel   = isTomorrow ? next.dayName + ' ' + next.dateDisp : i18n('today');

  if (el('next-tide-icon')) {
    el('next-tide-icon').textContent = isHigh ? '↑' : '↓';
    el('next-tide-icon').style.color = isHigh ? '#9FE1CB' : '#85b7eb';
  }
  if (el('next-tide-type'))  el('next-tide-type').textContent  = isHigh ? i18n('tide_high_lbl') : i18n('tide_low_lbl');
  if (el('next-tide-time'))  el('next-tide-time').textContent  = next.time + ' · ' + dayLabel;
  if (el('next-tide-level')) el('next-tide-level').textContent = next.level + 'm';
  const lbl = el('next-tide-label');
  if (lbl) lbl.textContent = i18n('next_tide_lbl');
};

// ── 9. renderForecast bilíngue ───────────────────
window.renderForecast = function(fc) {
  const row = document.getElementById('forecast-row');
  if (!row || !fc.length) return;
  const lang = (typeof currentLang !== 'undefined') ? currentLang : 'pt';
  const dayNamesEN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const dayNamesPT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

  row.innerHTML = fc.map(f => {
    const c = scoreColor(f.score);
    let dayLabel = f.day;
    if (f.day === 'Hoje' || f.day === 'Today') {
      dayLabel = i18n('today');
    } else if (lang === 'en') {
      const idx = dayNamesPT.indexOf(f.day);
      if (idx >= 0) dayLabel = dayNamesEN[idx];
    }
    return `<div class="forecast-card ${f.active ? 'active' : ''}">
      <div class="fc-day">${dayLabel}</div>
      <div class="fc-score" style="background:${c.bg};color:${c.text}">${f.score}</div>
      <div class="fc-wind">${f.wind} ${i18n('knots_lbl')}</div>
    </div>`;
  }).join('');
};

// ── 10. renderSchools bilíngue ───────────────────
window.renderSchools = function() {
  const list  = document.getElementById('schools-list-page');
  const title = document.getElementById('schools-page-title');
  if (!list) return;
  if (title) title.textContent = `${i18n('schools_in')} ${currentSpot.name}`;
  const sc = currentSpot.schools ?? [];
  if (!sc.length) {
    list.innerHTML = `<div class="empty-schools">${i18n('schools_in')} ${currentSpot.name}.</div>`;
    return;
  }
  list.innerHTML = sc.map(s => `
    <div class="school-card" onclick="openSchool('${currentSpot.id}', ${s.id})">
      <div class="school-avatar" style="background:${s.color};color:#fff">${s.initials}</div>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
          <div class="school-name">${s.name}</div>
          <span class="school-badge ${s.open ? 'badge-open' : 'badge-closed'}">${s.open ? i18n('open_now') : (s.openTime ?? i18n('closed'))}</span>
        </div>
        <div class="school-meta">★ ${s.rating} · ${s.reviews} ${i18n('reviews_lbl')}</div>
        <div class="school-meta" style="margin-top:2px">${currentSpot.name}</div>
      </div>
    </div>`).join('');
};

// ── 11. toggleLang — re-render tudo ──────────────
const _origToggleLang = window.toggleLang;
window.toggleLang = function() {
  _origToggleLang();
  document.querySelectorAll('.hero-date').forEach(el => el.textContent = formatDate());
  const cached = (typeof weatherCache !== 'undefined') ? weatherCache[currentSpot?.id] : null;
  if (cached) applyData(cached, currentSpot);
  renderNotifButton();
};

// ── 12. Push Notifications ───────────────────────
const PUSH = {
  sw: null,
  async init() {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return;
    try {
      this.sw = await navigator.serviceWorker.register('/sw.js');
      if (Notification.permission === 'granted') this.scheduleChecks();
    } catch(e) { console.warn('SW falhou', e); }
  },
  scheduleChecks() { this.check(); setInterval(() => this.check(), 15 * 60 * 1000); },
  async requestPermission() {
    if (!('Notification' in window)) return false;
    const p = await Notification.requestPermission();
    if (p === 'granted') { this.scheduleChecks(); return true; }
    return false;
  },
  check() {
    if (Notification.permission !== 'granted') return;
    if (typeof getAlerts !== 'function') return;
    getAlerts().forEach(a => {
      const spot = SPOTS.find(s => s.id === a.spotId);
      if (!spot || !checkConditionMet(a.condition, spot)) return;
      const key  = `notified_${a.spotId}_${a.condition}`;
      const last = parseInt(localStorage.getItem(key) || '0');
      if (Date.now() - last < 3600000) return;
      localStorage.setItem(key, String(Date.now()));
      const titles = {
        'wind-good':   i18n('notif_wind_good'),
        'wind-strong': i18n('notif_wind_strong'),
        'tide-high':   i18n('notif_tide_high'),
        'tide-low':    i18n('notif_tide_low'),
        'score-high':  i18n('notif_score_high'),
      };
      this.send(titles[a.condition] ?? a.condition, spot.name);
    });
  },
  send(title, body) {
    if (Notification.permission !== 'granted') return;
    try {
      if (this.sw?.active) {
        this.sw.active.postMessage({ type: 'NOTIFY', title, body });
      } else {
        new Notification(title, { body, tag: 'kiteinforma-alert' });
      }
    } catch(e) { console.warn(e); }
  }
};

// ── 13. UI botão de notificações ─────────────────
function renderNotifButton() {
  const el = document.getElementById('notif-btn-container');
  if (!el) return;
  if (!('Notification' in window)) { el.innerHTML = ''; return; }
  const perm = Notification.permission;
  if (perm === 'granted') {
    el.innerHTML = `<div class="notif-status notif-on">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
        <path d="M3 8l4 4 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      ${i18n('notif_active')}
    </div>`;
  } else if (perm === 'denied') {
    el.innerHTML = `<div class="notif-status notif-off">${i18n('notif_blocked')}</div>`;
  } else {
    el.innerHTML = `<button class="notif-enable-btn" onclick="enableNotifications()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 2a7 7 0 00-7 7v3.5a3 3 0 01-.5 1.7L3 16h18l-1.5-1.8a3 3 0 01-.5-1.7V9a7 7 0 00-7-7z" stroke="currentColor" stroke-width="1.5" fill="none"/>
        <path d="M9 18a3 3 0 006 0" stroke="currentColor" stroke-width="1.5"/>
      </svg>
      ${i18n('notif_enable')}
    </button>`;
  }
}

window.enableNotifications = async function() {
  const granted = await PUSH.requestPermission();
  renderNotifButton();
  if (granted) PUSH.send('KiteInforma', i18n('notif_test'));
};

// ── 15. conditionLabel sem emojis ────────────────
window.conditionLabel = function(cond) {
  const labels = {
    'wind-good':   { pt: i18n('cond_wind_good'),   en: i18n('cond_wind_good') },
    'wind-strong': { pt: i18n('cond_wind_strong'),  en: i18n('cond_wind_strong') },
    'tide-high':   { pt: i18n('cond_tide_high'),    en: i18n('cond_tide_high') },
    'tide-low':    { pt: i18n('cond_tide_low'),     en: i18n('cond_tide_low') },
    'score-high':  { pt: i18n('cond_score_high'),   en: i18n('cond_score_high') },
  };
  return labels[cond]?.[currentLang] ?? cond;
};
document.addEventListener('DOMContentLoaded', async () => {
  await PUSH.init();

  // Hook navigate
  const _origNav = window.navigate;
  window.navigate = function(screen) {
    _origNav(screen);
    if (screen === 'alerts') setTimeout(renderNotifButton, 60);
  };

  // Sincroniza alertas com SW ao salvar
  const _origSaveAlerts = window.saveAlerts;
  if (_origSaveAlerts) {
    window.saveAlerts = function(alerts) {
      _origSaveAlerts(alerts);
      syncAlertsToSW(alerts);
    };
  }
  if (typeof getAlerts === 'function') syncAlertsToSW(getAlerts());

  initPWABanner();
});

// ── Sync alertas para Service Worker ────────────
function syncAlertsToSW(alerts) {
  if (!navigator.serviceWorker?.controller) return;
  navigator.serviceWorker.controller.postMessage({ type: 'SYNC_ALERTS', alerts });
}

// ── PWA Install Banner ───────────────────────────
let _deferredPrompt = null;

function initPWABanner() {
  if (window.matchMedia('(display-mode: standalone)').matches) return;
  if (localStorage.getItem('pwa_dismissed')) return;

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    _deferredPrompt = e;
    showPWABanner();
  });

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIOS && !window.navigator.standalone) {
    // Só mostra se ainda não instalou e não dispensou nesta sessão
    if (!sessionStorage.getItem('pwa_ios_shown')) {
      sessionStorage.setItem('pwa_ios_shown', '1');
      setTimeout(showIOSBanner, 4000);
    }
  }
}

function showPWABanner() {
  const banner = document.getElementById('pwa-banner');
  if (!banner) return;
  banner.style.display = 'block';
  const btn = document.getElementById('pwa-install-btn');
  if (btn) {
    btn.onclick = async () => {
      if (!_deferredPrompt) return;
      _deferredPrompt.prompt();
      await _deferredPrompt.userChoice;
      _deferredPrompt = null;
      closePWABanner();
    };
  }
}

function showIOSBanner() {
  const banner = document.getElementById('pwa-banner');
  if (!banner) return;

  // Substitui conteúdo por instrução visual completa
  banner.innerHTML = `
    <div class="pwa-ios-guide">
      <div class="pwa-ios-header">
        <div class="pwa-ios-title">Instale o KiteInforma</div>
        <button class="pwa-close-btn" onclick="closePWABanner()" aria-label="Fechar">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div class="pwa-ios-sub">Para receber alertas com o app fechado, adicione à tela inicial:</div>
      <div class="pwa-ios-steps">
        <div class="pwa-ios-step">
          <div class="pwa-ios-num">1</div>
          <div class="pwa-ios-text">
            Toque em
            <span class="pwa-ios-icon-inline">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </span>
            <strong>Compartilhar</strong> na barra do Safari
          </div>
        </div>
        <div class="pwa-ios-step">
          <div class="pwa-ios-num">2</div>
          <div class="pwa-ios-text">Role para baixo e toque em <strong>"Adicionar à Tela de Início"</strong></div>
        </div>
        <div class="pwa-ios-step">
          <div class="pwa-ios-num">3</div>
          <div class="pwa-ios-text">Toque em <strong>Adicionar</strong> no canto superior direito</div>
        </div>
      </div>
      <button class="pwa-ios-dismiss" onclick="closePWABanner()">Entendi</button>
    </div>`;

  banner.style.display = 'block';
}

// ── 16. Banners com imagem de fundo ──────────────
const BANNER_IMAGES = [
  'imagens/banner1.jpg',
  'imagens/banner2.jpg',
];

window.renderLocationBanners = function() {
  const track = document.getElementById('banner-track');
  const dots  = document.getElementById('banner-dots');
  if (!track || !dots) return;

  const banners = getCurrentBanners();
  const safeUrl = (url) => {
    if (typeof url !== 'string') return '#';
    const t = url.trim();
    return (t.startsWith('https://') || t.startsWith('mailto:')) ? t : '#';
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);

  track.innerHTML = banners.map((b, i) => {
    const img = BANNER_IMAGES[i % BANNER_IMAGES.length];
    const hasImg = img && i < BANNER_IMAGES.length;

    if (hasImg) {
      return `<div class="banner-slide" onclick="window.open('${safeUrl(b.url)}','_blank','noopener,noreferrer')" style="cursor:pointer">
        <div style="width:100%;height:120px;background-image:url(${img});background-size:cover;background-position:center;background-repeat:no-repeat;border-radius:14px;"></div>
      </div>`;
    }

    // Banner sem imagem — layout original com texto
    return `<div class="banner-slide" onclick="window.open('${safeUrl(b.url)}','_blank','noopener,noreferrer')">
      <div class="banner-slide-inner" style="background:${esc(b.gradient)}">
        <div class="bs-icon" style="background:${esc(b.iconBg)};color:${esc(b.iconColor)}">${esc(b.icon)}</div>
        <div class="bs-body">
          <div class="bs-tag">${esc(b.tag)}</div>
          <div class="bs-title">${esc(b.title)}</div>
          <div class="bs-sub">${esc(b.sub)}</div>
        </div>
        <div class="bs-arrow">›</div>
      </div>
    </div>`;
  }).join('');

  dots.innerHTML = banners.map((_, i) =>
    `<span class="dot ${i === 0 ? 'active' : ''}" onclick="goToBanner(${i})"></span>`
  ).join('');

  // Swipe com pointer events (funciona em touch e mouse)
  const carousel = track.closest('.banner-carousel') || track.parentElement;
  if (carousel && banners.length > 1) {
    carousel.querySelectorAll('.banner-arrow').forEach(el => el.remove());

    let _px = 0, _isDragging = false, _hasMoved = false;

    carousel.style.userSelect = 'none';

    carousel.addEventListener('pointerdown', e => {
      _px = e.clientX;
      _isDragging = true;
      _hasMoved = false;
      carousel.setPointerCapture(e.pointerId);
    });

    carousel.addEventListener('pointermove', e => {
      if (!_isDragging) return;
      if (Math.abs(e.clientX - _px) > 8) _hasMoved = true;
    });

    carousel.addEventListener('pointerup', e => {
      if (!_isDragging) return;
      _isDragging = false;
      const dx = e.clientX - _px;
      if (_hasMoved && Math.abs(dx) > 40) {
        dx < 0 ? goToBanner(_bannerIdx + 1) : goToBanner(_bannerIdx - 1);
      }
    });

    carousel.addEventListener('pointercancel', () => { _isDragging = false; });
  }

  track.style.transform = 'translateX(0)';
  startBannerTimer();
};

window.closePWABanner = function() {
  const b = document.getElementById('pwa-banner');
  if (b) b.style.display = 'none';
  localStorage.setItem('pwa_dismissed', '1');
};
