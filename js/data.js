const SPOTS = [
  {
    id: 'prea',
    name: 'Preá',
    region: 'Litoral Oeste',
    description: 'Ventos fortes e constantes, ideal para freestyle',
    lat: -2.867,
    lon: -40.467,
    tideOffset: 18,
    schools: [
      {
        id: 1, initials: 'PK', name: 'Preá Kite School', color: '#1D9E75',
        open: true, rating: 4.9, reviews: 128, since: 2012,
        hours: '7h às 17h · todos os dias',
        mapsUrl: 'https://maps.google.com/?q=Preá+Kite+School+Jericoacoara+Ceará',
        phone: '+5588999990001', whatsapp: 'https://wa.me/5588999990001', site: 'https://preakiteschool.com.br',
        reviewsList: [
          { initials: 'LM', color: '#534AB7', textColor: '#EEEDFE', name: 'Lucas Mendes', date: 'há 3 dias', stars: 5, text: 'Melhor experiência da viagem! Instrutor super paciente, aprendi a soltar a pipa no primeiro dia.' },
          { initials: 'AC', color: '#993C1D', textColor: '#FAECE7', name: 'Ana Clara', date: 'há 1 semana', stars: 5, text: 'Vim de Portugal só pra isso. Preá é incrível e a escola é top. Já marquei pra voltar em outubro.' },
        ],
      },
      {
        id: 2, initials: 'WK', name: 'Wind & Kite Brasil', color: '#185FA5',
        open: false, openTime: 'Abre às 8h', rating: 4.7, reviews: 94, since: 2015,
        hours: '8h às 17h · todos os dias',
        mapsUrl: 'https://maps.google.com/?q=Wind+Kite+Brasil+Preá+Ceará',
        phone: '+5588999990002', whatsapp: 'https://wa.me/5588999990002', site: null,
        reviewsList: [
          { initials: 'MF', color: '#854F0B', textColor: '#FAEEDA', name: 'Marco Ferreira', date: 'há 5 dias', stars: 5, text: 'Instrutores incríveis, estrutura ótima. Aprendi wave riding em 3 dias!' },
        ],
      },
    ],
  },
  {
    id: 'barrinha',
    name: 'Barrinha de Baixo',
    region: 'Litoral Oeste',
    description: 'Maior downwind do mundo, vila de pescadores',
    lat: -2.900,
    lon: -40.430,
    tideOffset: 20,
    schools: [
      {
        id: 10, initials: 'BK', name: 'Barrinha Kite School', color: '#854F0B',
        open: true, rating: 5.0, reviews: 12, since: 2018,
        hours: '10h às 18h · todos os dias',
        mapsUrl: 'https://maps.google.com/?q=Barrinha+Kite+School+Acaraú+Ceará',
        phone: '+5512997279682', whatsapp: 'https://wa.me/5512997279682', site: 'https://barrinhakiteschool.com',
        reviewsList: [
          { initials: 'RP', color: '#0F6E56', textColor: '#E1F5EE', name: 'Romain P.', date: 'há 1 semana', stars: 5, text: 'Incredible downwinders! 11 days of perfect kiting. The team is amazing, best kite trip ever!' },
          { initials: 'KV', color: '#3C3489', textColor: '#EEEDFE', name: 'Klaus V.', date: 'há 2 semanas', stars: 5, text: 'Família kitou 4 dias seguidos. Instrutor Romain fala francês, inglês e português. Excelente escola!' },
        ],
      },
      {
        id: 11, initials: 'CK', name: 'Camboa Kite Beach Club', color: '#1D9E75',
        open: true, rating: 4.8, reviews: 34, since: 2016,
        hours: '8h às 17h · todos os dias',
        mapsUrl: 'https://maps.google.com/?q=Camboa+Kite+Beach+Club+Barrinha+Ceará',
        phone: '+5588999990010', whatsapp: 'https://wa.me/5588999990010', site: 'https://camboakitebeachclub.com.br',
        reviewsList: [
          { initials: 'ES', color: '#185FA5', textColor: '#E6F1FB', name: 'Eduardo S.', date: 'há 3 dias', stars: 5, text: 'Edinho é experiente e atencioso. Escola apoiada pela Naish Kiteboarding. Recomendo muito!' },
        ],
      },
    ],
  },
  {
    id: 'jericoacoara',
    name: 'Jericoacoara',
    region: 'Litoral Oeste',
    description: 'Ícone mundial, Duna do Pôr do Sol, vila charmosa',
    lat: -2.795,
    lon: -40.510,
    tideOffset: 15,
    schools: [
      {
        id: 20, initials: 'JK', name: 'Jeri Kite Center', color: '#993C1D',
        open: true, rating: 4.8, reviews: 210, since: 2008,
        hours: '7h às 18h · todos os dias',
        mapsUrl: 'https://maps.google.com/?q=Kite+Center+Jericoacoara+Ceará',
        phone: '+5588998035075', whatsapp: 'https://wa.me/5588998035075', site: null,
        reviewsList: [
          { initials: 'GH', color: '#534AB7', textColor: '#EEEDFE', name: 'Gabriel H.', date: 'há 2 dias', stars: 5, text: 'Jeri é o paraíso do kite! Escola top, instrutores certificados. Aprendi em 3 dias.' },
          { initials: 'SL', color: '#854F0B', textColor: '#FAEEDA', name: 'Sophie L.', date: 'há 1 semana', stars: 5, text: 'Perfect school in paradise. Wind is amazing in Jeri, instructors speak English and French.' },
        ],
      },
    ],
  },
  {
    id: 'guajiru',
    name: 'Ilha do Guajiru',
    region: 'Litoral Oeste',
    description: 'Lagoa rasa e plana, ideal para iniciantes',
    lat: -2.943,
    lon: -39.952,
    tideOffset: 22,
    schools: [
      {
        id: 30, initials: 'GK', name: 'Guajiru Kite School', color: '#534AB7',
        open: true, rating: 4.9, reviews: 87, since: 2013,
        hours: '7h às 17h · todos os dias',
        mapsUrl: 'https://maps.google.com/?q=Kite+School+Ilha+Guajiru+Itarema+Ceará',
        phone: '+5588996223661', whatsapp: 'https://wa.me/5588996223661', site: null,
        reviewsList: [
          { initials: 'BV', color: '#1D9E75', textColor: '#E1F5EE', name: 'Beatriz V.', date: 'há 4 dias', stars: 5, text: 'Lagoa perfeita para iniciantes! Aprendi sem medo, água rasa e calma o tempo todo.' },
        ],
      },
    ],
  },
  {
    id: 'icarai',
    name: 'Icaraí de Amontada',
    region: 'Litoral Oeste',
    description: 'Clima tranquilo, dunas e lagoas cristalinas',
    lat: -2.733,
    lon: -39.967,
    tideOffset: 20,
    schools: [
      {
        id: 40, initials: 'IK', name: 'Icaraí Kite School', color: '#185FA5',
        open: true, rating: 4.7, reviews: 56, since: 2014,
        hours: '8h às 17h · todos os dias',
        mapsUrl: 'https://maps.google.com/?q=Kite+School+Icaraí+Amontada+Ceará',
        phone: '+5585999990040', whatsapp: 'https://wa.me/5585999990040', site: null,
        reviewsList: [
          { initials: 'TP', color: '#993C1D', textColor: '#FAECE7', name: 'Thiago P.', date: 'há 1 semana', stars: 5, text: 'Lugar incrível, menos lotado que Jeri. Ventos perfeitos e escola muito profissional.' },
        ],
      },
    ],
  },
  {
    id: 'cumbuco',
    name: 'Cumbuco',
    region: 'Litoral Norte',
    description: 'A meca do kitesurf no Brasil, 30km de Fortaleza',
    lat: -3.607,
    lon: -38.738,
    tideOffset: 5,
    schools: [
      {
        id: 50, initials: 'CK', name: 'Carmel Kite Center', color: '#0F6E56',
        open: true, rating: 4.9, reviews: 340, since: 2005,
        hours: '7h às 18h · todos os dias',
        mapsUrl: 'https://maps.google.com/?q=Carmel+Kite+Center+Cumbuco+Ceará',
        phone: '+5585988529666', whatsapp: 'https://wa.me/5585988529666', site: 'https://carmelhoteis.com.br',
        reviewsList: [
          { initials: 'BK', color: '#534AB7', textColor: '#EEEDFE', name: 'Bruno K.', date: 'há 2 dias', stars: 5, text: 'Cumbuco é top! Escola estruturada, vento garantido quase o ano todo.' },
          { initials: 'MR', color: '#993C1D', textColor: '#FAECE7', name: 'Maria R.', date: 'há 5 dias', stars: 5, text: 'Melhor escola do Cumbuco. Instrutores pacientes e muito competentes. Amei!' },
        ],
      },
      {
        id: 51, initials: 'DK', name: 'Duro Beach Kite', color: '#854F0B',
        open: true, rating: 4.6, reviews: 120, since: 2010,
        hours: '8h às 17h · todos os dias',
        mapsUrl: 'https://maps.google.com/?q=Duro+Beach+Kite+Cumbuco+Ceará',
        phone: '+5585988529667', whatsapp: 'https://wa.me/5585988529667', site: null,
        reviewsList: [
          { initials: 'PL', color: '#185FA5', textColor: '#E6F1FB', name: 'Pedro L.', date: 'há 1 semana', stars: 5, text: 'Guarderia excelente, equipamentos novos. Cumbuco tem o melhor vento que já vi.' },
        ],
      },
    ],
  },
  {
    id: 'caupe',
    name: 'Lagoa do Cauípe',
    region: 'Litoral Norte',
    description: 'Lagoa calma ao lado do Cumbuco, perfeita para iniciantes',
    lat: -3.570,
    lon: -38.720,
    tideOffset: 5,
    schools: [
      {
        id: 60, initials: 'LK', name: 'Cauípe Kite School', color: '#1D9E75',
        open: true, rating: 4.8, reviews: 78, since: 2012,
        hours: '8h às 17h · todos os dias',
        mapsUrl: 'https://maps.google.com/?q=Lagoa+Cauípe+Kite+School+Ceará',
        phone: '+5585988686145', whatsapp: 'https://wa.me/5585988686145', site: null,
        reviewsList: [
          { initials: 'FL', color: '#534AB7', textColor: '#EEEDFE', name: 'Fernanda L.', date: 'há 3 dias', stars: 5, text: 'Lagoa ideal para aprender! Sem ondas, rasa e vento perfeito. Aprendi em 2 dias.' },
        ],
      },
    ],
  },
  {
    id: 'taiba',
    name: 'Taíba',
    region: 'Litoral Norte',
    description: 'Águas rasas, ventos fortes, ótimo para avançados',
    lat: -3.469,
    lon: -38.932,
    tideOffset: 8,
    schools: [
      {
        id: 70, initials: 'TK', name: 'Taíba Kite School', color: '#185FA5',
        open: true, rating: 4.7, reviews: 65, since: 2011,
        hours: '8h às 17h · todos os dias',
        mapsUrl: 'https://maps.google.com/?q=Taíba+Kite+School+Ceará',
        phone: '+5585999990070', whatsapp: 'https://wa.me/5585999990070', site: null,
        reviewsList: [
          { initials: 'RG', color: '#0F6E56', textColor: '#E1F5EE', name: 'Rodrigo G.', date: 'há 5 dias', stars: 5, text: 'Taíba tem uns dos melhores ventos do Ceará. Escola com bom nível técnico.' },
        ],
      },
    ],
  },
  {
    id: 'paracuru',
    name: 'Paracuru',
    region: 'Litoral Norte',
    description: 'Mar ideal para todos os níveis, piscinas naturais',
    lat: -3.411,
    lon: -39.031,
    tideOffset: 10,
    schools: [
      {
        id: 80, initials: 'PK', name: 'Paracuru Kite Club', color: '#993C1D',
        open: true, rating: 4.6, reviews: 48, since: 2015,
        hours: '8h às 17h · todos os dias',
        mapsUrl: 'https://maps.google.com/?q=Kite+Club+Paracuru+Ceará',
        phone: '+5585999994100', whatsapp: 'https://wa.me/5585999994100', site: null,
        reviewsList: [
          { initials: 'CN', color: '#534AB7', textColor: '#EEEDFE', name: 'Carolina N.', date: 'há 1 semana', stars: 5, text: 'Paracuru é incrível! Maré baixa forma piscinas naturais lindas. Kite top!' },
        ],
      },
    ],
  },
  {
    id: 'portodunas',
    name: 'Porto das Dunas',
    region: 'Litoral Leste',
    description: 'Próximo a Fortaleza, Beach Park, conveniente',
    lat: -3.832,
    lon: -38.406,
    tideOffset: 2,
    schools: [
      {
        id: 90, initials: 'PD', name: 'Porto Kite School', color: '#185FA5',
        open: true, rating: 4.5, reviews: 92, since: 2009,
        hours: '8h às 17h · todos os dias',
        mapsUrl: 'https://maps.google.com/?q=Kite+School+Porto+Dunas+Aquiraz+Ceará',
        phone: '+5585987393796', whatsapp: 'https://wa.me/5585987393796', site: null,
        reviewsList: [
          { initials: 'AM', color: '#1D9E75', textColor: '#E1F5EE', name: 'André M.', date: 'há 4 dias', stars: 5, text: 'Ótimo pra quem está em Fortaleza. Fácil acesso, bom vento à tarde.' },
        ],
      },
    ],
  },
  {
    id: 'canoa',
    name: 'Canoa Quebrada',
    region: 'Litoral Leste',
    description: 'Falésias vermelhas, vida noturna, vento forte',
    lat: -4.338,
    lon: -37.978,
    tideOffset: 0,
    schools: [
      {
        id: 100, initials: 'CQ', name: 'Canoa Kite School', color: '#D85A30',
        open: true, rating: 4.7, reviews: 113, since: 2010,
        hours: '8h às 17h · todos os dias',
        mapsUrl: 'https://maps.google.com/?q=Kite+School+Canoa+Quebrada+Ceará',
        phone: '+5588999990100', whatsapp: 'https://wa.me/5588999990100', site: null,
        reviewsList: [
          { initials: 'VB', color: '#534AB7', textColor: '#EEEDFE', name: 'Vitor B.', date: 'há 2 dias', stars: 5, text: 'Canoa é linda demais! As falésias vermelhas no fundo enquanto você kita. Experiência única.' },
        ],
      },
    ],
  },
  {
    id: 'fortim',
    name: 'Fortim',
    region: 'Litoral Leste',
    description: 'Foz do Jaguaribe, menos explorado, muito tranquilo',
    lat: -4.442,
    lon: -37.796,
    tideOffset: -2,
    schools: [
      {
        id: 110, initials: 'FK', name: 'Fortim Kite', color: '#1D9E75',
        open: true, rating: 4.6, reviews: 32, since: 2017,
        hours: '8h às 17h · todos os dias',
        mapsUrl: 'https://maps.google.com/?q=Kite+School+Fortim+Ceará',
        phone: '+5588981397169', whatsapp: 'https://wa.me/5588981397169', site: null,
        reviewsList: [
          { initials: 'LF', color: '#993C1D', textColor: '#FAECE7', name: 'Letícia F.', date: 'há 1 semana', stars: 5, text: 'Lugar ainda preservado, sem multidão. Foz do Jaguaribe é espetacular para kitar.' },
        ],
      },
    ],
  },
  {
    id: 'icapui',
    name: 'Icapuí',
    region: 'Litoral Leste',
    description: 'Ponta leste do Ceará, ventos intensos e mar aberto',
    lat: -4.711,
    lon: -37.346,
    tideOffset: -5,
    schools: [
      {
        id: 120, initials: 'IK', name: 'Icapuí Kite School', color: '#534AB7',
        open: true, rating: 4.8, reviews: 41, since: 2016,
        hours: '8h às 17h · todos os dias',
        mapsUrl: 'https://maps.google.com/?q=Kite+School+Icapuí+Ceará',
        phone: '+5588981831100', whatsapp: 'https://wa.me/5588981831100', site: null,
        reviewsList: [
          { initials: 'HM', color: '#0F6E56', textColor: '#E1F5EE', name: 'Hugo M.', date: 'há 3 dias', stars: 5, text: 'Icapuí é escondido mas vale muito. Ventos fortes, mar aberto, poucos turistas.' },
        ],
      },
    ],
  },
];

const FORECAST_DAYS = ['Hoje','Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
