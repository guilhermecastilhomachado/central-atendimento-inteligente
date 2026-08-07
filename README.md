# Central de Atendimento Inteligente

Painel web para abertura, acompanhamento e triagem de chamados de suporte, com sugestão automática de categoria e prioridade a partir da mensagem do usuário.

Projeto de portfólio desenvolvido durante o curso de Sistemas de Informação da Universidade Federal de Uberlândia (UFU), com o objetivo de exercitar a integração completa entre front-end, API REST e banco de dados relacional.

![Painel principal](docs/imagens/painel-principal-1.png)

---

## Funcionalidades

- Listagem de chamados com filtro por status (aberto / em atendimento / resolvido)
- Painel de métricas agregadas: total, abertos, em atendimento e resolvidos
- Abertura de chamados com validação no back-end
- Alteração de status diretamente pelo painel, com atualização imediata das métricas
- **Chatbot de triagem baseado em regras**: interpreta a mensagem do usuário e sugere título, categoria e prioridade, pré-preenchendo o formulário de abertura
- Indicador visual do estado da API (health check), exibido em tempo real na interface

![Chatbot de triagem](docs/imagens/chatbot-triagem-2.png)

![Abertura de chamado](docs/imagens/novo-chamado-1.png)

---

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Front-end | React 19, TypeScript, Vite, CSS |
| Back-end | Node.js, Express, TypeScript |
| Validação | Zod (schemas como fonte única de tipo e de regra) |
| Testes | Vitest, Supertest (32 casos) |
| Documentação | OpenAPI 3, Swagger UI |
| Persistência | Prisma ORM, SQLite (migrations versionadas + seed) |
| Ferramentas | Git, GitHub, Oxlint, Concurrently |

A documentação interativa fica em **http://localhost:3001/docs** com a API no ar, e a especificação crua em `/docs.json`.

---

## Arquitetura

```text
central-atendimento-inteligente/
├── api/
│   ├── prisma/
│   │   ├── migrations/      → histórico versionado do schema
│   │   ├── schema.prisma    → modelo de dados e enums
│   │   └── seed.ts          → carga inicial para desenvolvimento
│   ├── src/
│   │   ├── app.ts           → montagem do Express (sem abrir porta)
│   │   ├── server.ts        → ponto de entrada: escolhe a porta e sobe
│   │   ├── controladores/   → rotas HTTP
│   │   ├── servicos/        → regra de negócio
│   │   ├── validacao/       → schemas Zod das entradas
│   │   ├── middlewares/     → tratador global de erros
│   │   ├── erros/           → AppError
│   │   ├── docs/            → especificação OpenAPI
│   │   ├── modelos/         → tipos e contratos compartilhados
│   │   └── database/        → instância do Prisma Client
│   └── tests/               → suíte Vitest + Supertest
├── web/
│   └── src/
│       ├── App.tsx          → composição da tela
│       ├── components/      → componentes de apresentação
│       ├── hooks/           → estado e efeitos reutilizáveis
│       ├── services/api.ts  → única camada que conhece a API
│       └── App.css
└── docs/imagens/            → capturas de tela do sistema
```

A separação foi feita de modo que **o serviço não conheça o Express e o controlador não conheça o Prisma**. Na prática, isso significa que trocar o banco de dados afeta apenas a camada de serviço, e trocar o framework HTTP afeta apenas a camada de controladores.

No front-end, todo acesso à API está concentrado em `web/src/services/api.ts`, com os tipos de resposta declarados explicitamente.

A tela está dividida entre **componentes**, que apenas recebem dados por props e os renderizam, e **hooks**, que concentram estado e chamadas de rede. Um componente de apresentação não dispara requisição: ele avisa o pai através de um callback. Isso mantém cada peça testável isoladamente e evita que a lógica de dados se espalhe pela árvore de renderização.

---

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Identificação e versão da API |
| `GET` | `/saude` | Health check consumido pelo front-end |
| `GET` | `/chamados` | Lista chamados. Aceita `?status=ABERTO\|EM_ATENDIMENTO\|RESOLVIDO` |
| `GET` | `/chamados/:id` | Busca um chamado por ID |
| `GET` | `/chamados/metricas/resumo` | Contagem agregada por status |
| `POST` | `/chamados` | Cria um chamado |
| `PATCH` | `/chamados/:id/status` | Atualiza o status de um chamado |
| `POST` | `/chatbot/mensagem` | Executa a triagem de uma mensagem |
| `GET` | `/docs` | Documentação interativa (Swagger UI) |
| `GET` | `/docs.json` | Especificação OpenAPI 3 |

Exemplo de requisição ao chatbot:

```bash
curl -X POST http://localhost:3001/chatbot/mensagem \
  -H "Content-Type: application/json" \
  -d '{"mensagem":"Não consigo acessar o sistema com minha senha"}'
```

Resposta:

```json
{
  "resposta": "Entendi que você está com dificuldade de acesso...",
  "categoriaSugerida": "Acesso",
  "prioridadeSugerida": "ALTA",
  "deveAbrirChamado": true,
  "tituloSugerido": "Problema de acesso ao sistema"
}
```

---

## Como executar

Pré-requisitos: Node.js 20 ou superior.

```bash
git clone https://github.com/guilhermecastilhomachado/central-atendimento-inteligente
cd central-atendimento-inteligente
npm install
```

Configure e prepare a API:

```bash
cd api
cp .env.example .env          # no Windows: copy .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
cd ..
```

Configure o front-end:

```bash
cd web
cp .env.example .env          # no Windows: copy .env.example .env
npm install
cd ..
```

Suba os dois serviços de uma vez, a partir da raiz:

```bash
npm run dev
```

| Serviço | Endereço |
|---------|----------|
| API | http://localhost:3001 |
| Documentação | http://localhost:3001/docs |
| Front-end | http://localhost:5173 |

### Testes

```bash
npm test              # executa a suíte uma vez
npm --prefix api run test:watch    # reexecuta a cada alteração
npm run typecheck     # verifica os tipos da API e do front
```

A suíte não precisa de banco nem de servidor no ar: os testes de integração
substituem o acesso a dados por um dublê em memória e fazem as requisições
diretamente contra a instância do Express.

---

## Decisões técnicas

### Por que o chatbot é baseado em regras e não em um modelo de linguagem?

O componente de triagem é **determinístico**: classifica a mensagem por correspondência de palavras-chave, em ordem de precedência definida no código (`api/src/servicos/chatbotServico.ts`).

Foi uma escolha, não uma limitação. Para este escopo, regras determinísticas são **auditáveis**: é possível explicar exatamente por que uma mensagem recebeu determinada categoria e prioridade, e o resultado é reprodutível. Em um contexto de suporte, essa rastreabilidade costuma valer mais do que sofisticação, além de não introduzir custo de inferência nem dependência de serviço externo.

A limitação evidente é a ausência de compreensão semântica: sinônimos fora da lista não são reconhecidos. A evolução natural seria substituir as regras por classificação com embeddings ou por um modelo de linguagem — mas essa troca só faz sentido acompanhada de um conjunto de avaliação que comprove ganho real de acurácia sobre a baseline por regras. Sem isso, seria complexidade sem evidência.

### Por que SQLite?

Zero configuração para quem clona o repositório: não é necessário subir contêiner nem instalar servidor de banco. Como todo o acesso está isolado atrás do Prisma, migrar para PostgreSQL exige alterar apenas o `provider` no `schema.prisma` e a `DATABASE_URL` — nenhuma linha da camada de serviço muda.

### Por que Zod em vez de validação manual?

A primeira versão validava com funções escritas à mão (`textoValido`, `ehPrioridadeValida`) e mantinha, em paralelo, uma `interface` descrevendo o mesmo formato. São duas declarações da mesma verdade, e duas declarações saem de sincronia: mudar a interface não quebra a validação, e mudar a validação não quebra a interface.

Com Zod, o schema é a única fonte. Ele valida em tempo de execução e, através de `z.infer`, gera o tipo TypeScript correspondente. Alterar uma regra passa a alterar o tipo, e o compilador aponta todos os pontos afetados.

O ganho secundário é a qualidade da resposta de erro: em vez de uma mensagem genérica sobre campos obrigatórios, a API devolve exatamente qual campo falhou e por quê, o que o front-end pode exibir ao lado do campo correspondente.

### Por que um tratador global de erros?

Antes, cada rota carregava o próprio `try/catch` com a mesma resposta 500 repetida. Além do ruído, o padrão é frágil: basta esquecer um bloco para que um erro vaze como stack trace.

Agora existe uma classe `AppError`, que carrega a mensagem e o status HTTP, e um único middleware que traduz qualquer exceção em resposta. Os controladores voltaram a descrever apenas o caminho feliz e lançam quando a regra não é satisfeita. O formato de erro passou a ser um só em toda a API — o que permite ao front-end tratar qualquer falha da mesma maneira.

O detalhe que torna isso possível no Express 4 é o pacote `express-async-errors`: sem ele, uma exceção lançada dentro de um handler `async` viraria uma promise rejeitada e a requisição ficaria pendurada até o timeout, em vez de chegar ao middleware.

### Por que os testes de integração usam um dublê em memória?

A suíte substitui o cliente do Prisma por uma implementação em memória. Rotas, schemas Zod e tratador de erros são exercitados de verdade; apenas a persistência é trocada.

Duas razões: a suíte não depende de arquivo de banco nem de binário do Prisma, então roda igual em qualquer máquina e em um pipeline de CI; e não há risco de um teste apagar o `dev.db` usado no desenvolvimento.

O limite desse recorte é explícito e está registrado nas limitações: o SQL gerado pelo Prisma não é testado. Testes contra um banco real são o passo seguinte.

---

## Limitações conhecidas

Documentadas de forma explícita por serem decisões conscientes de escopo, não descuidos:

- **Sem autenticação e autorização.** Qualquer cliente pode ler e alterar qualquer chamado.
- **Sem paginação.** `GET /chamados` retorna a coleção completa. Adequado ao volume de demonstração, inadequado para produção — a evolução seria paginação por cursor com `take`/`skip` do Prisma.
- **Sem `helmet` nem rate limiting.** A API não define cabeçalhos de segurança HTTP e não limita requisições por origem, o que a deixa exposta a abuso em um cenário público.
- **Os testes de integração não tocam um banco real.** A persistência é substituída por um dublê em memória, então o SQL gerado pelo Prisma e as migrations não são exercitados pela suíte.
- **Triagem sem compreensão semântica**, conforme descrito acima.
- **Sem índice em `status`**, ainda que seja a coluna usada nos filtros e nas métricas.

---

## Roadmap

**Concluído**
- [x] Testes automatizados com Vitest e Supertest — 32 casos cobrindo triagem, rotas, validação e tratamento de erro
- [x] Middleware global de tratamento de erros com classe `AppError`, eliminando os `try/catch` repetidos nos controladores
- [x] Validação de entrada com Zod, substituindo as verificações manuais
- [x] Documentação interativa com OpenAPI/Swagger em `/docs`
- [x] Decomposição de `App.tsx` em componentes e hooks

**Curto prazo**
- [ ] Testes de integração contra um banco real, complementando o dublê em memória
- [ ] Paginação em `GET /chamados`
- [ ] Tela de detalhe do chamado, consumindo o `GET /chamados/:id` já disponível

**Médio prazo**
- [ ] Containerização com Docker e Docker Compose
- [ ] Deploy: PostgreSQL gerenciado, API e front-end publicados
- [ ] Pipeline de CI no GitHub Actions executando lint e testes a cada push
- [ ] `helmet`, rate limiting e índice em `status`

---

## Autor

**Guilherme Castilho Machado** — Sistemas de Informação, Universidade Federal de Uberlândia (UFU)

[LinkedIn](https://www.linkedin.com/in/guilhermecastilhom/) · [GitHub](https://github.com/guilhermecastilhomachado)

Licença MIT.
