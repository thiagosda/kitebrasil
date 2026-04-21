const SCHOOLS = [
  {
    id: 1,
    initials: 'PK',
    name: 'Preá Kite School',
    location: 'Preá · Jericoacoara, CE',
    color: '#1D9E75',
    open: true,
    rating: 4.9,
    reviews: 128,
    since: 2012,
    hours: '7h às 17h · todos os dias',
    mapsUrl: 'https://maps.google.com/?q=Preá+Kite+School+Jericoacoara',
    phone: '+5588999990001',
    whatsapp: 'https://wa.me/5588999990001',
    site: 'https://preakiteschool.com.br',
    reviewsList: [
      { initials: 'LM', color: '#534AB7', textColor: '#EEEDFE', name: 'Lucas Mendes', date: 'há 3 dias', stars: 5, text: 'Melhor experiência da viagem! Instrutor super paciente, aprendi a soltar a pipa no primeiro dia.' },
      { initials: 'AC', color: '#993C1D', textColor: '#FAECE7', name: 'Ana Clara', date: 'há 1 semana', stars: 5, text: 'Vim de Portugal só pra isso. Preá é incrível e a escola é top. Já marquei pra voltar em outubro.' },
      { initials: 'RF', color: '#0F6E56', textColor: '#E1F5EE', name: 'Rafael F.', date: 'há 2 semanas', stars: 5, text: 'Estrutura impecável, equipamentos novos e instrutores muito atenciosos. Super recomendo!' },
    ],
  },
  {
    id: 2,
    initials: 'WK',
    name: 'Wind & Kite Brasil',
    location: 'Preá · Ceará, CE',
    color: '#185FA5',
    open: false,
    openTime: 'Abre às 8h',
    rating: 4.7,
    reviews: 94,
    since: 2015,
    hours: '8h às 17h · todos os dias',
    mapsUrl: 'https://maps.google.com/?q=Wind+Kite+Brasil+Preá',
    phone: '+5588999990002',
    whatsapp: 'https://wa.me/5588999990002',
    site: null,
    reviewsList: [
      { initials: 'MF', color: '#854F0B', textColor: '#FAEEDA', name: 'Marco Ferreira', date: 'há 5 dias', stars: 5, text: 'Instrutores incríveis, estrutura ótima. Aprendi wave riding em 3 dias!' },
      { initials: 'JS', color: '#3C3489', textColor: '#EEEDFE', name: 'Julia S.', date: 'há 3 semanas', stars: 4, text: 'Ótima escola, vento excelente em Preá. Voltarei com certeza no próximo verão.' },
    ],
  }
];

const FORECAST = [
  { day: 'Hoje', score: 9, wind: 22, active: true },
  { day: 'Ter',  score: 8, wind: 19, active: false },
  { day: 'Qua',  score: 7, wind: 17, active: false },
  { day: 'Qui',  score: 6, wind: 15, active: false },
  { day: 'Sex',  score: 8, wind: 20, active: false },
  { day: 'Sáb',  score: 9, wind: 23, active: false },
  { day: 'Dom',  score: 9, wind: 24, active: false },
];
