// Sistema de Internacionalização
const translations = {
  pt: {
    location: "CEARÁ · BRASIL",
    score_label: "SCORE DO DIA",
    loading: "Carregando...",
    season_title: "Baixa temporada",
    season_sub: "Ventos mais fracos agora · Alta temporada: julho a janeiro",
    conditions_now: "CONDIÇÕES AGORA",
    wind: "Vento",
    gusts: "Rajadas",
    realtime: "em tempo real",
    waves: "Ondas",
    tide: "Maré",
    forecast_7d: "PREVISÃO 7 DIAS",
    sponsored: "Patrocinado",
    partner_school: "Escola Parceira",
    banner_title: "Preá Kite School",
    banner_subtitle: "Aulas profissionais para todos os níveis · Preá, CE",
    learn_more: "Saiba Mais",
    kitesurf: "Kitesurf",
    tides: "Marés",
    low_tide: "Seca (~0.4m)",
    high_tide: "Cheia (~2.7m)",
    next_tide: "Próxima maré",
    today_chart: "GRÁFICO DE HOJE",
    tide_table: "TÁBUA DE MARÉS — 7 DIAS",
    tip_today: "DICA PARA HOJE",
    back: "Voltar",
    alerts_title: "Meus Alertas",
    alerts_subtitle: "Receba avisos quando as condições forem ideais",
    active_alerts: "ALERTAS ATIVOS",
    no_alerts: "Você ainda não tem alertas. Toque em + para criar o primeiro.",
    new_alert: "NOVO ALERTA",
    alert_spot: "Praia",
    alert_condition: "Condição",
    cond_wind_good: "Vento bom para velejar",
    cond_wind_good_sub: "Acima de 14 nós",
    cond_wind_strong: "Vento forte",
    cond_wind_strong_sub: "Acima de 20 nós",
    cond_tide_high: "Maré alta",
    cond_tide_high_sub: "Quando a maré subir acima de 2.5m",
    cond_tide_low: "Maré baixa",
    cond_tide_low_sub: "Quando a maré baixar abaixo de 0.6m",
    cond_score_high: "Dia excelente",
    cond_score_high_sub: "Score do dia 8 ou mais",
    cancel: "Cancelar",
    save_alert: "Salvar Alerta",
    how_works: "COMO FUNCIONA",
    how_step1: "Crie um alerta escolhendo a praia e a condição que você quer monitorar.",
    how_step2: "Quando você abrir o app e a condição for atingida, um aviso aparece destacado.",
    how_step3: "Você pode criar quantos alertas quiser e remover a qualquer momento.",
    schools: "Escolas",
    ad_title: "Destaque sua escola aqui",
    ad_subtitle: "Alcance kitesurfistas do mundo todo",
    advertise: "Anunciar",
    open_now: "Aberta agora",
    call: "Ligar",
    website: "Site",
    location_title: "LOCALIZAÇÃO",
    view_map: "Ver no Google Maps",
    google_reviews: "AVALIAÇÕES DO GOOGLE",
    tide_nav: "Maré"
  },
  en: {
    location: "CEARÁ · BRAZIL",
    score_label: "TODAY'S SCORE",
    loading: "Loading...",
    season_title: "Off season",
    season_sub: "Lighter winds now · High season: July to January",
    conditions_now: "CURRENT CONDITIONS",
    wind: "Wind",
    gusts: "Gusts",
    realtime: "real-time",
    waves: "Waves",
    tide: "Tide",
    forecast_7d: "7-DAY FORECAST",
    sponsored: "Sponsored",
    partner_school: "Partner School",
    banner_title: "Preá Kite School",
    banner_subtitle: "Professional lessons for all levels · Preá, CE",
    learn_more: "Learn More",
    kitesurf: "Kitesurf",
    tides: "Tides",
    low_tide: "Low (~0.4m)",
    high_tide: "High (~2.7m)",
    next_tide: "Next tide",
    today_chart: "TODAY'S CHART",
    tide_table: "TIDE TABLE — 7 DAYS",
    tip_today: "TODAY'S TIP",
    back: "Back",
    alerts_title: "My Alerts",
    alerts_subtitle: "Get notified when conditions are ideal",
    active_alerts: "ACTIVE ALERTS",
    no_alerts: "You don't have any alerts yet. Tap + to create your first one.",
    new_alert: "NEW ALERT",
    alert_spot: "Spot",
    alert_condition: "Condition",
    cond_wind_good: "Good sailing wind",
    cond_wind_good_sub: "Above 14 knots",
    cond_wind_strong: "Strong wind",
    cond_wind_strong_sub: "Above 20 knots",
    cond_tide_high: "High tide",
    cond_tide_high_sub: "When tide rises above 2.5m",
    cond_tide_low: "Low tide",
    cond_tide_low_sub: "When tide drops below 0.6m",
    cond_score_high: "Excellent day",
    cond_score_high_sub: "Day score 8 or higher",
    cancel: "Cancel",
    save_alert: "Save Alert",
    how_works: "HOW IT WORKS",
    how_step1: "Create an alert by choosing the spot and condition you want to monitor.",
    how_step2: "When you open the app and the condition is met, a highlighted notice appears.",
    how_step3: "You can create as many alerts as you want and remove them anytime.",
    schools: "Schools",
    ad_title: "Feature your school here",
    ad_subtitle: "Reach kitesurfers worldwide",
    advertise: "Advertise",
    open_now: "Open now",
    call: "Call",
    website: "Website",
    location_title: "LOCATION",
    view_map: "View on Google Maps",
    google_reviews: "GOOGLE REVIEWS",
    tide_nav: "Tide"
  }
};

let currentLang = 'pt';

function toggleLang() {
  currentLang = currentLang === 'pt' ? 'en' : 'pt';
  localStorage.setItem('kite_lang', currentLang);
  applyTranslations();
  updateLangButton();
}

function applyTranslations() {
  const t = translations[currentLang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.textContent = t[key];
    }
  });
}

function updateLangButton() {
  const btn = document.getElementById('lang-toggle');
  if (btn) {
    btn.textContent = currentLang.toUpperCase();
  }
}

function initI18n() {
  const savedLang = localStorage.getItem('kite_lang');
  if (savedLang && translations[savedLang]) {
    currentLang = savedLang;
  }
  applyTranslations();
  updateLangButton();
}

document.addEventListener('DOMContentLoaded', initI18n);
