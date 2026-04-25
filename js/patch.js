// ── KiteInforma Patch ─────────────────────────────
// Estende app.js com: tradução de "tides" + Push Notifications

// 1. Adiciona chave "tides" às traduções do app.js original
(function patchTranslations() {
  if (typeof TRANSLATIONS === 'undefined') return;
  TRANSLATIONS.pt.tides = 'Marés';
  TRANSLATIONS.en.tides = 'Tides';
})();

// 2. Push Notifications via Service Worker
// ─────────────────────────────────────────────────

const PUSH = {
  sw: null,

  async init() {
    if (!('serviceWorker' in navigator) || !('Notification' in window)) return;
    try {
      this.sw = await navigator.serviceWorker.register('/sw.js');
      this.showBellIfGranted();
    } catch (e) {
      console.warn('SW registro falhou', e);
    }
  },

  showBellIfGranted() {
    if (Notification.permission === 'granted') {
      this.scheduleChecks();
    }
  },

  async requestPermission() {
    if (!('Notification' in window)) {
      alert('Seu navegador não suporta notificações.');
      return false;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      this.scheduleChecks();
      return true;
    }
    return false;
  },

  scheduleChecks() {
    // Checa condições a cada 15 minutos enquanto a aba estiver aberta
    this.check();
    setInterval(() => this.check(), 15 * 60 * 1000);
  },

  check() {
    if (Notification.permission !== 'granted') return;
    if (typeof getAlerts !== 'function' || typeof SPOTS === 'undefined') return;

    const alerts = getAlerts();
    alerts.forEach(a => {
      const spot = SPOTS.find(s => s.id === a.spotId);
      if (!spot) return;
      if (typeof checkConditionMet !== 'function') return;
      if (!checkConditionMet(a.condition, spot)) return;

      const lastKey = `notified_${a.spotId}_${a.condition}`;
      const lastNotified = parseInt(localStorage.getItem(lastKey) || '0');
      const now = Date.now();
      const COOLDOWN = 60 * 60 * 1000; // 1 hora entre notificações iguais

      if (now - lastNotified < COOLDOWN) return;

      localStorage.setItem(lastKey, String(now));

      const labels = {
        'wind-good':   { pt: 'Vento bom para kitesurf', en: 'Good wind for kitesurfing' },
        'wind-strong': { pt: 'Vento forte detectado',   en: 'Strong wind detected' },
        'tide-high':   { pt: 'Maré alta agora',         en: 'High tide right now' },
        'tide-low':    { pt: 'Maré baixa agora',        en: 'Low tide right now' },
        'score-high':  { pt: 'Dia excelente para kitar!','en': 'Excellent kite day!' },
      };

      const lang = (typeof currentLang !== 'undefined') ? currentLang : 'pt';
      const title = labels[a.condition]?.[lang] ?? a.condition;
      const body  = spot.name;

      this.send(title, body);
    });
  },

  send(title, body) {
    if (Notification.permission !== 'granted') return;
    try {
      if (this.sw?.active) {
        this.sw.active.postMessage({ type: 'NOTIFY', title, body });
      } else {
        new Notification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'kiteinforma-alert',
        });
      }
    } catch (e) {
      console.warn('Notificação falhou', e);
    }
  }
};

// 3. UI: botão de ativar notificações na tela de Alertas
function renderNotifButton() {
  if (!('Notification' in window)) return;

  const container = document.getElementById('notif-btn-container');
  if (!container) return;

  const perm = Notification.permission;

  if (perm === 'granted') {
    container.innerHTML = `
      <div class="notif-status notif-on">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3 7l4 4 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Notificações ativas
      </div>`;
  } else if (perm === 'denied') {
    container.innerHTML = `
      <div class="notif-status notif-off">
        Notificações bloqueadas no navegador
      </div>`;
  } else {
    container.innerHTML = `
      <button class="notif-enable-btn" onclick="enableNotifications()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2a7 7 0 00-7 7v3.5a3 3 0 01-.5 1.7L3 16h18l-1.5-1.8a3 3 0 01-.5-1.7V9a7 7 0 00-7-7z" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <path d="M9 18a3 3 0 006 0" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        Ativar notificações push
      </button>`;
  }
}

async function enableNotifications() {
  const granted = await PUSH.requestPermission();
  renderNotifButton();
  if (granted) {
    // Testa imediatamente
    PUSH.send('KiteInforma', 'Notificações ativadas! Você receberá alertas de kite.');
  }
}

// 4. Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  await PUSH.init();

  // Re-render botão sempre que a tela de alertas abrir
  const origNavigate = window.navigate;
  window.navigate = function(screen) {
    origNavigate(screen);
    if (screen === 'alerts') {
      setTimeout(renderNotifButton, 50);
    }
  };
});
