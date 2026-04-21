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
    languages: 'PT · EN · ES',
    instructors: '6 certificados IKO',
    tags: ['Iniciantes', 'Freestyle', 'Wave', 'Kiteboarding', 'Equipamento incluso', 'Foil'],
    highlightTags: ['Iniciantes', 'Freestyle'],
    packages: [
      { name: 'Aula experimental', desc: '1h · instrutor dedicado', price: 'R$ 180', unit: 'por pessoa', featured: false },
      { name: 'Curso completo', desc: '9h · certificado IKO', price: 'R$ 1.200', unit: 'por pessoa', featured: true },
      { name: 'Aperfeiçoamento', desc: '3h · nível intermediário', price: 'R$ 420', unit: 'por pessoa', featured: false },
    ],
    reviewsList: [
      { initials: 'LM', color: '#534AB7', textColor: '#EEEDFE', name: 'Lucas Mendes', date: 'há 3 dias · São Paulo, SP', stars: 5, text: 'Melhor experiência da viagem! Instrutor super paciente, aprendi a soltar a pipa no primeiro dia.' },
      { initials: 'AC', color: '#993C1D', textColor: '#FAECE7', name: 'Ana Clara', date: 'há 1 semana · Lisboa, PT', stars: 5, text: 'Vim de Portugal só pra isso. Preá é incrível e a escola é top. Já marquei pra voltar em outubro.' },
    ],
    contact: 'whatsapp://send?phone=5588999990001'
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
    languages: 'PT · EN',
    instructors: '4 certificados IKO',
    tags: ['Iniciantes', 'Wave', 'SUP', 'Equipamento incluso'],
    highlightTags: ['Wave', 'SUP'],
    packages: [
      { name: 'Aula experimental', desc: '1h · grupo pequeno', price: 'R$ 160', unit: 'por pessoa', featured: false },
      { name: 'Pacote wave', desc: '6h · foco em ondas', price: 'R$ 980', unit: 'por pessoa', featured: true },
    ],
    reviewsList: [
      { initials: 'MF', color: '#854F0B', textColor: '#FAEEDA', name: 'Marco Ferreira', date: 'há 5 dias · Rio de Janeiro, RJ', stars: 5, text: 'Instrutores incríveis, estrutura ótima. Aprendi wave riding em 3 dias!' },
    ],
    contact: 'whatsapp://send?phone=5588999990002'
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

const TIDE_EVENTS = [
  { time: '02:14', label: 'Maré baixa',  height: '0.2 m', detail: 'mínima do dia',       type: 'low'  },
  { time: '08:37', label: 'Maré alta',   height: '2.4 m', detail: 'máxima da manhã',     type: 'high' },
  { time: 'Agora', label: 'Enchendo',    height: '1.2 m', detail: 'subindo desde 06:10', type: 'now'  },
  { time: '14:52', label: 'Maré baixa',  height: '0.4 m', detail: 'boa pra lagoa',       type: 'low'  },
  { time: '21:18', label: 'Maré alta',   height: '2.1 m', detail: 'máxima da noite',     type: 'high' },
];
