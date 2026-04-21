# KiteInforma 🪁

> Condições de vento, maré e ondas em tempo real para kitesurf no Ceará.

**Link:** [kiteinforma.vercel.app](https://kiteinforma.vercel.app)

---

## Sobre o projeto

O KiteInforma nasceu em Preá, Ceará — um dos melhores spots de kitesurf do mundo. O app foi criado para dar ao praticante, em segundos, a informação mais importante do dia: **vale a pena sair para kitar agora?**

O sistema busca dados reais de vento, rajadas, ondas e maré e transforma tudo em um **score de 1 a 10**, com previsão para 7 dias. Além disso, conecta praticantes com as melhores escolas de kitesurf de cada praia.

---

## Praias cobertas (13 spots)

### Litoral Oeste
- Preá
- Barrinha de Baixo
- Jericoacoara
- Ilha do Guajiru
- Icaraí de Amontada

### Litoral Norte
- Cumbuco
- Lagoa do Cauípe
- Taíba
- Paracuru

### Litoral Leste
- Porto das Dunas
- Canoa Quebrada
- Fortim
- Icapuí

---

## Funcionalidades

- **Score do dia** — nota de 1 a 10 calculada com base em vento e rajadas
- **Condições em tempo real** — vento, rajadas, ondas e maré atualizados
- **Previsão 7 dias** — planeje sua semana de kite
- **Gráfico de maré** — horários de preamar e baixamar com ponto ao vivo
- **GPS automático** — detecta a praia mais próxima ao abrir o app
- **Escolas por praia** — encontre escolas com avaliações, contato e localização
- **Aviso de temporada** — alerta de baixa temporada (fev–jun)
- **Banners rotativos** — espaço para anunciantes parceiros
- **Responsivo** — funciona perfeitamente em celular e computador
- **Modo escuro** — adaptação automática ao sistema do dispositivo

---

## Estrutura do projeto

```
kiteinforma/
├── index.html          # Estrutura HTML do app (4 telas)
├── css/
│   └── style.css       # Estilos, responsividade e modo escuro
├── js/
│   ├── data.js         # Dados dos 13 spots e escolas
│   └── app.js          # Lógica: API, navegação, gráficos, GPS
└── README.md
```

---

## Fontes de dados

| Dado | Fonte | 
|------|-------|
| Vento e rajadas | [Open-Meteo](https://open-meteo.com) |
| Ondas (altura e período) | [Open-Meteo Marine](https://open-meteo.com) |
| Maré | Cálculo harmônico calibrado para o Ceará |

---

## Tecnologias

- **HTML5 / CSS3 / JavaScript** — sem frameworks, leve e rápido
- **Chart.js** — gráfico de maré interativo
- **Vercel** — hospedagem e deploy automático
- **Google Fonts** — DM Sans + DM Mono

---

## Roadmap

- [ ] Integrar API de maré oficial da Marinha do Brasil
- [ ] Domínio próprio `kiteinforma.com.br`
- [ ] Google Analytics para métricas de acesso
- [ ] Sistema de cadastro de escolas pelo painel
- [ ] Notificações push ("Hoje é dia 9 em Preá!")
- [ ] Versão PWA instalável no celular

---

## Criado em

Preá, Ceará, Brasil 🌊

*"O Ceará é o Havaí do kitesurf. O KiteInforma é o seu guia local."*
