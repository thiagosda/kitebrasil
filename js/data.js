const SPOTS = [
  {
    id: 'prea', name: 'Preá', region: 'Litoral Oeste',
    lat: -2.867, lon: -40.467, tideOffset: 18,
    schools: [
      {
        id: 1, initials: 'PK', name: 'Preá Kite School', color: '#1D9E75',
        open: true, rating: 4.9, reviews: 128, since: 2012, hours: '7h às 17h',
        mapsUrl: 'https://maps.google.com/?q=Preá+Kite+School+Jericoacoara',
        phone: '+5588999990001', whatsapp: 'https://wa.me/5588999990001',
        site: 'https://preakiteschool.com.br',
        reviewsList: [
          { initials: 'LM', color: '#534AB7', textColor: '#EEEDFE', name: 'Lucas Mendes', date: 'há 3 dias', stars: 5, text: 'Melhor experiência da viagem! Instrutor super paciente, aprendi no primeiro dia.' },
          { initials: 'AC', color: '#993C1D', textColor: '#FAECE7', name: 'Ana Clara', date: 'há 1 semana', stars: 5, text: 'Vim de Portugal só pra isso. Preá é incrível e a escola é top!' }
        ]
      },
      {
        id: 2, initials: 'WK', name: 'Wind & Kite Brasil', color: '#185FA5',
        open: false, openTime: 'Abre às 8h', rating: 4.7, reviews: 94, since: 2015, hours: '8h às 17h',
        mapsUrl: 'https://maps.google.com/?q=Wind+Kite+Brasil+Preá',
        phone: '+5588999990002', whatsapp: 'https://wa.me/5588999990002', site: null,
        reviewsList: [
          { initials: 'MF', color: '#854F0B', textColor: '#FAEEDA', name: 'Marco Ferreira', date: 'há 5 dias', stars: 5, text: 'Instrutores incríveis! Aprendi wave riding em 3 dias.' }
        ]
      }
    ]
  },
  {
    id: 'barrinha', name: 'Barrinha de Baixo', region: 'Litoral Oeste',
    lat: -2.900, lon: -40.430, tideOffset: 20,
    schools: [
      {
        id: 10, initials: 'BK', name: 'Barrinha Kite School', color: '#854F0B',
        open: true, rating: 5.0, reviews: 12, since: 2018, hours: '10h às 18h',
        mapsUrl: 'https://maps.google.com/?q=Barrinha+Kite+School+Acaraú+Ceará',
        phone: '+5512997279682', whatsapp: 'https://wa.me/5512997279682',
        site: 'https://barrinhakiteschool.com',
        reviewsList: [
          { initials: 'RP', color: '#0F6E56', textColor: '#E1F5EE', name: 'Romain P.', date: 'há 1 semana', stars: 5, text: '11 dias incríveis! Downwinds perfeitos, equipe fantástica. Melhor trip de kite!' },
          { initials: 'KV', color: '#3C3489', textColor: '#EEEDFE', name: 'Klaus V.', date: 'há 2 semanas', stars: 5, text: 'Família kitou 4 dias seguidos. Instrutor fala francês, inglês e português.' }
        ]
      },
      {
        id: 11, initials: 'CK', name: 'Camboa Kite Beach Club', color: '#1D9E75',
        open: true, rating: 4.8, reviews: 34, since: 2016, hours: '8h às 17h',
        mapsUrl: 'https://maps.google.com/?q=Camboa+Kite+Barrinha+Ceará',
        phone: '+5588999990010', whatsapp: 'https://wa.me/5588999990010',
        site: 'https://camboakitebeachclub.com.br',
        reviewsList: [
          { initials: 'ES', color: '#185FA5', textColor: '#E6F1FB', name: 'Eduardo S.', date: 'há 3 dias', stars: 5, text: 'Edinho é muito experiente. Escola apoiada pela Naish Kiteboarding.' }
        ]
      }
    ]
  },
  {
    id: 'jericoacoara', name: 'Jericoacoara', region: 'Litoral Oeste',
    lat: -2.795, lon: -40.510, tideOffset: 15,
    schools: [
      {
        id: 20, initials: 'JK', name: 'Jeri Kite Center', color: '#993C1D',
        open: true, rating: 4.8, reviews: 210, since: 2008, hours: '7h às 18h',
        mapsUrl: 'https://maps.google.com/?q=Kite+Center+Jericoacoara',
        phone: '+5588998035075', whatsapp: 'https://wa.me/5588998035075', site: null,
        reviewsList: [
          { initials: 'GH', color: '#534AB7', textColor: '#EEEDFE', name: 'Gabriel H.', date: 'há 2 dias', stars: 5, text: 'Jeri é o paraíso do kite! Escola top, instrutores certificados.' },
          { initials: 'SL', color: '#854F0B', textColor: '#FAEEDA', name: 'Sophie L.', date: 'há 1 semana', stars: 5, text: 'Perfect school! Wind is amazing in Jeri, instructors speak English.' }
        ]
      }
    ]
  },
  {
    id: 'guajiru', name: 'Ilha do Guajiru', region: 'Litoral Oeste',
    lat: -2.943, lon: -39.952, tideOffset: 22,
    schools: [
      {
        id: 30, initials: 'GK', name: 'Guajiru Kite School', color: '#534AB7',
        open: true, rating: 4.9, reviews: 87, since: 2013, hours: '7h às 17h',
        mapsUrl: 'https://maps.google.com/?q=Kite+School+Ilha+Guajiru+Itarema',
        phone: '+5588996223661', whatsapp: 'https://wa.me/5588996223661', site: null,
        reviewsList: [
          { initials: 'BV', color: '#1D9E75', textColor: '#E1F5EE', name: 'Beatriz V.', date: 'há 4 dias', stars: 5, text: 'Lagoa perfeita para iniciantes! Água rasa e calma o tempo todo.' }
        ]
      }
    ]
  },
  {
    id: 'icarai', name: 'Icaraí de Amontada', region: 'Litoral Oeste',
    lat: -2.733, lon: -39.967, tideOffset: 20,
    schools: [
      {
        id: 40, initials: 'IK', name: 'Icaraí Kite School', color: '#185FA5',
        open: true, rating: 4.7, reviews: 56, since: 2014, hours: '8h às 17h',
        mapsUrl: 'https://maps.google.com/?q=Kite+School+Icaraí+Amontada',
        phone: '+5585999990040', whatsapp: 'https://wa.me/5585999990040', site: null,
        reviewsList: [
          { initials: 'TP', color: '#993C1D', textColor: '#FAECE7', name: 'Thiago P.', date: 'há 1 semana', stars: 5, text: 'Menos lotado que Jeri. Ventos perfeitos e escola muito profissional.' }
        ]
      }
    ]
  },
  {
    id: 'cumbuco', name: 'Cumbuco', region: 'Litoral Norte',
    lat: -3.607, lon: -38.738, tideOffset: 5,
    schools: [
      {
        id: 50, initials: 'CC', name: 'Carmel Kite Center', color: '#0F6E56',
        open: true, rating: 4.9, reviews: 340, since: 2005, hours: '7h às 18h',
        mapsUrl: 'https://maps.google.com/?q=Carmel+Kite+Center+Cumbuco',
        phone: '+5585988529666', whatsapp: 'https://wa.me/5585988529666',
        site: 'https://carmelhoteis.com.br',
        reviewsList: [
          { initials: 'BK', color: '#534AB7', textColor: '#EEEDFE', name: 'Bruno K.', date: 'há 2 dias', stars: 5, text: 'Cumbuco é top! Escola estruturada, vento garantido quase o ano todo.' },
          { initials: 'MR', color: '#993C1D', textColor: '#FAECE7', name: 'Maria R.', date: 'há 5 dias', stars: 5, text: 'Melhor escola do Cumbuco. Instrutores pacientes. Amei!' }
        ]
      },
      {
        id: 51, initials: 'DK', name: 'Duro Beach Kite', color: '#854F0B',
        open: true, rating: 4.6, reviews: 120, since: 2010, hours: '8h às 17h',
        mapsUrl: 'https://maps.google.com/?q=Duro+Beach+Kite+Cumbuco',
        phone: '+5585988529667', whatsapp: 'https://wa.me/5585988529667', site: null,
        reviewsList: [
          { initials: 'PL', color: '#185FA5', textColor: '#E6F1FB', name: 'Pedro L.', date: 'há 1 semana', stars: 5, text: 'Equipamentos novos. Cumbuco tem um dos melhores ventos que já vi.' }
        ]
      }
    ]
  },
  {
    id: 'caupe', name: 'Lagoa do Cauípe', region: 'Litoral Norte',
    lat: -3.570, lon: -38.720, tideOffset: 5,
    schools: [
      {
        id: 60, initials: 'LK', name: 'Cauípe Kite School', color: '#1D9E75',
        open: true, rating: 4.8, reviews: 78, since: 2012, hours: '8h às 17h',
        mapsUrl: 'https://maps.google.com/?q=Lagoa+Cauípe+Kite+Ceará',
        phone: '+5585988686145', whatsapp: 'https://wa.me/5585988686145', site: null,
        reviewsList: [
          { initials: 'FL', color: '#534AB7', textColor: '#EEEDFE', name: 'Fernanda L.', date: 'há 3 dias', stars: 5, text: 'Lagoa ideal para aprender! Sem ondas, rasa, vento perfeito.' }
        ]
      }
    ]
  },
  {
    id: 'taiba', name: 'Taíba', region: 'Litoral Norte',
    lat: -3.469, lon: -38.932, tideOffset: 8,
    schools: [
      {
        id: 70, initials: 'TK', name: 'Taíba Kite School', color: '#185FA5',
        open: true, rating: 4.7, reviews: 65, since: 2011, hours: '8h às 17h',
        mapsUrl: 'https://maps.google.com/?q=Taíba+Kite+School+Ceará',
        phone: '+5585999990070', whatsapp: 'https://wa.me/5585999990070', site: null,
        reviewsList: [
          { initials: 'RG', color: '#0F6E56', textColor: '#E1F5EE', name: 'Rodrigo G.', date: 'há 5 dias', stars: 5, text: 'Taíba tem uns dos melhores ventos do Ceará.' }
        ]
      }
    ]
  },
  {
    id: 'paracuru', name: 'Paracuru', region: 'Litoral Norte',
    lat: -3.411, lon: -39.031, tideOffset: 10,
    schools: [
      {
        id: 80, initials: 'PK', name: 'Paracuru Kite Club', color: '#993C1D',
        open: true, rating: 4.6, reviews: 48, since: 2015, hours: '8h às 17h',
        mapsUrl: 'https://maps.google.com/?q=Kite+Club+Paracuru+Ceará',
        phone: '+5585999994100', whatsapp: 'https://wa.me/5585999994100', site: null,
        reviewsList: [
          { initials: 'CN', color: '#534AB7', textColor: '#EEEDFE', name: 'Carolina N.', date: 'há 1 semana', stars: 5, text: 'Piscinas naturais na maré baixa. Kite top!' }
        ]
      }
    ]
  },
  {
    id: 'portodunas', name: 'Porto das Dunas', region: 'Litoral Leste',
    lat: -3.832, lon: -38.406, tideOffset: 2,
    schools: [
      {
        id: 90, initials: 'PD', name: 'Porto Kite School', color: '#185FA5',
        open: true, rating: 4.5, reviews: 92, since: 2009, hours: '8h às 17h',
        mapsUrl: 'https://maps.google.com/?q=Kite+School+Porto+Dunas+Aquiraz',
        phone: '+5585987393796', whatsapp: 'https://wa.me/5585987393796', site: null,
        reviewsList: [
          { initials: 'AM', color: '#1D9E75', textColor: '#E1F5EE', name: 'André M.', date: 'há 4 dias', stars: 5, text: 'Ótimo pra quem está em Fortaleza. Fácil acesso.' }
        ]
      }
    ]
  },
  {
    id: 'canoa', name: 'Canoa Quebrada', region: 'Litoral Leste',
    lat: -4.338, lon: -37.978, tideOffset: 0,
    schools: [
      {
        id: 100, initials: 'CQ', name: 'Canoa Kite School', color: '#D85A30',
        open: true, rating: 4.7, reviews: 113, since: 2010, hours: '8h às 17h',
        mapsUrl: 'https://maps.google.com/?q=Kite+School+Canoa+Quebrada',
        phone: '+5588999990100', whatsapp: 'https://wa.me/5588999990100', site: null,
        reviewsList: [
          { initials: 'VB', color: '#534AB7', textColor: '#EEEDFE', name: 'Vitor B.', date: 'há 2 dias', stars: 5, text: 'Falésias vermelhas enquanto você kita. Experiência única!' }
        ]
      }
    ]
  },
  {
    id: 'fortim', name: 'Fortim', region: 'Litoral Leste',
    lat: -4.442, lon: -37.796, tideOffset: -2,
    schools: [
      {
        id: 110, initials: 'FK', name: 'Fortim Kite', color: '#1D9E75',
        open: true, rating: 4.6, reviews: 32, since: 2017, hours: '8h às 17h',
        mapsUrl: 'https://maps.google.com/?q=Kite+School+Fortim+Ceará',
        phone: '+5588981397169', whatsapp: 'https://wa.me/5588981397169', site: null,
        reviewsList: [
          { initials: 'LF', color: '#993C1D', textColor: '#FAECE7', name: 'Letícia F.', date: 'há 1 semana', stars: 5, text: 'Lugar preservado. Foz do Jaguaribe é espetacular.' }
        ]
      }
    ]
  },
  {
    id: 'icapui', name: 'Icapuí', region: 'Litoral Leste',
    lat: -4.711, lon: -37.346, tideOffset: -5,
    schools: [
      {
        id: 120, initials: 'IK', name: 'Icapuí Kite School', color: '#534AB7',
        open: true, rating: 4.8, reviews: 41, since: 2016, hours: '8h às 17h',
        mapsUrl: 'https://maps.google.com/?q=Kite+School+Icapuí+Ceará',
        phone: '+5588981831100', whatsapp: 'https://wa.me/5588981831100', site: null,
        reviewsList: [
          { initials: 'HM', color: '#0F6E56', textColor: '#E1F5EE', name: 'Hugo M.', date: 'há 3 dias', stars: 5, text: 'Escondido mas vale muito. Ventos fortes e mar aberto.' }
        ]
      }
    ]
  }
];
