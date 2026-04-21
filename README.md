# Kite Intelligence 🪁

App web para praticantes de kitesurf em Preá, Ceará.

## Estrutura do projeto

```
kite-intelligence/
├── index.html        ← app principal (todas as telas)
├── css/
│   └── style.css     ← estilos completos
├── js/
│   ├── data.js       ← dados das escolas e previsões
│   └── app.js        ← lógica de navegação e renderização
└── README.md
```

## Como publicar no Vercel (15 minutos)

1. Suba essa pasta no GitHub como um repositório novo
2. Acesse vercel.com e faça login com sua conta GitHub
3. Clique em "Add New Project"
4. Selecione o repositório kite-intelligence
5. Clique em "Deploy" — pronto!

Seu app estará em: `kite-intelligence.vercel.app`

## Próximos passos

### Dados reais de maré e vento
- Crie uma conta gratuita em open-meteo.com
- Não precisa de chave de API — é aberta
- Me peça para integrar e eu atualizo o código

### Escolas reais (Firebase)
- Crie uma conta em firebase.google.com
- Crie um projeto novo chamado "kite-intelligence"
- Me passe as credenciais e eu integro o banco de dados

## Telas disponíveis
- Tela inicial com score do dia, condições e previsão 7 dias
- Tela de maré com gráfico e horários
- Perfil de escolas com pacotes e avaliações
