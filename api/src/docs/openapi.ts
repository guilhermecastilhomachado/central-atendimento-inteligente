/**
 * Especificação OpenAPI 3.0 da API.
 *
 * O arquivo é escrito à mão de propósito: gerar a documentação a partir de
 * decorators ou comentários esconde o formato real do contrato. Mantendo o
 * documento explícito, fica claro o que a API promete a quem a consome — e é
 * esse documento que o Swagger UI renderiza em /docs.
 */
export const documentoOpenApi = {
  openapi: "3.0.3",
  info: {
    title: "Central de Atendimento Inteligente — API",
    version: "1.0.0",
    description:
      "API REST para abertura, acompanhamento e triagem de chamados de suporte. " +
      "A triagem é baseada em regras determinísticas, não em modelo de linguagem.",
    contact: {
      name: "Guilherme Castilho Machado",
      url: "https://github.com/guilhermecastilhomachado",
    },
    license: { name: "MIT" },
  },
  servers: [{ url: "http://localhost:3001", description: "Ambiente local" }],
  tags: [
    { name: "Sistema", description: "Identificação e health check" },
    { name: "Chamados", description: "Ciclo de vida dos chamados" },
    { name: "Chatbot", description: "Triagem automática de mensagens" },
  ],
  components: {
    schemas: {
      Chamado: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          titulo: { type: "string", example: "Erro ao acessar o sistema" },
          descricao: {
            type: "string",
            example: "Usuário informou que não consegue acessar o painel com sua senha.",
          },
          categoria: { type: "string", example: "Acesso" },
          prioridade: { type: "string", enum: ["BAIXA", "MEDIA", "ALTA"], example: "ALTA" },
          status: {
            type: "string",
            enum: ["ABERTO", "EM_ATENDIMENTO", "RESOLVIDO"],
            example: "ABERTO",
          },
          nomeSolicitante: { type: "string", example: "Mariana Souza" },
          criadoEm: { type: "string", format: "date-time" },
          atualizadoEm: { type: "string", format: "date-time" },
        },
      },
      NovoChamado: {
        type: "object",
        required: ["titulo", "descricao", "categoria", "prioridade", "nomeSolicitante"],
        properties: {
          titulo: { type: "string", minLength: 3, maxLength: 120 },
          descricao: { type: "string", minLength: 5, maxLength: 2000 },
          categoria: { type: "string", minLength: 2, maxLength: 60 },
          prioridade: { type: "string", enum: ["BAIXA", "MEDIA", "ALTA"] },
          nomeSolicitante: { type: "string", minLength: 2, maxLength: 120 },
        },
      },
      MetricasChamados: {
        type: "object",
        properties: {
          total: { type: "integer", example: 5 },
          abertos: { type: "integer", example: 3 },
          emAtendimento: { type: "integer", example: 0 },
          resolvidos: { type: "integer", example: 2 },
        },
      },
      RespostaChatbot: {
        type: "object",
        properties: {
          mensagemUsuario: { type: "string" },
          resposta: { type: "string" },
          categoriaSugerida: { type: "string", example: "Acesso" },
          prioridadeSugerida: { type: "string", enum: ["BAIXA", "MEDIA", "ALTA"] },
          deveAbrirChamado: { type: "boolean" },
          tituloSugerido: { type: "string" },
          descricaoSugerida: { type: "string" },
        },
      },
      Erro: {
        type: "object",
        properties: {
          mensagem: { type: "string", example: "Os dados enviados são inválidos." },
          detalhes: {
            type: "object",
            additionalProperties: { type: "string" },
            example: { titulo: "Título deve ter ao menos 3 caracteres." },
          },
        },
      },
    },
    responses: {
      RequisicaoInvalida: {
        description: "Dados de entrada inválidos",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Erro" } } },
      },
      NaoEncontrado: {
        description: "Recurso não encontrado",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Erro" } } },
      },
    },
  },
  paths: {
    "/": {
      get: {
        tags: ["Sistema"],
        summary: "Identificação da API",
        responses: { "200": { description: "Nome, status e versão da API" } },
      },
    },
    "/saude": {
      get: {
        tags: ["Sistema"],
        summary: "Health check",
        description:
          "Consumido pelo front-end para exibir o estado da API em tempo real na interface.",
        responses: { "200": { description: "API operacional" } },
      },
    },
    "/chamados": {
      get: {
        tags: ["Chamados"],
        summary: "Lista chamados",
        parameters: [
          {
            name: "status",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["ABERTO", "EM_ATENDIMENTO", "RESOLVIDO"] },
            description: "Filtra os chamados por status. Omitido, retorna todos.",
          },
        ],
        responses: {
          "200": {
            description: "Lista de chamados",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Chamado" } },
              },
            },
          },
          "400": { $ref: "#/components/responses/RequisicaoInvalida" },
        },
      },
      post: {
        tags: ["Chamados"],
        summary: "Cria um chamado",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/NovoChamado" } },
          },
        },
        responses: {
          "201": {
            description: "Chamado criado",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Chamado" } },
            },
          },
          "400": { $ref: "#/components/responses/RequisicaoInvalida" },
        },
      },
    },
    "/chamados/metricas/resumo": {
      get: {
        tags: ["Chamados"],
        summary: "Contagem agregada por status",
        responses: {
          "200": {
            description: "Métricas dos chamados",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/MetricasChamados" } },
            },
          },
        },
      },
    },
    "/chamados/{id}": {
      get: {
        tags: ["Chamados"],
        summary: "Busca um chamado por ID",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } },
        ],
        responses: {
          "200": {
            description: "Chamado encontrado",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Chamado" } },
            },
          },
          "400": { $ref: "#/components/responses/RequisicaoInvalida" },
          "404": { $ref: "#/components/responses/NaoEncontrado" },
        },
      },
    },
    "/chamados/{id}/status": {
      patch: {
        tags: ["Chamados"],
        summary: "Atualiza o status de um chamado",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: {
                    type: "string",
                    enum: ["ABERTO", "EM_ATENDIMENTO", "RESOLVIDO"],
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Chamado atualizado",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Chamado" } },
            },
          },
          "400": { $ref: "#/components/responses/RequisicaoInvalida" },
          "404": { $ref: "#/components/responses/NaoEncontrado" },
        },
      },
    },
    "/chatbot/mensagem": {
      post: {
        tags: ["Chatbot"],
        summary: "Executa a triagem de uma mensagem",
        description:
          "Classifica a mensagem por correspondência de palavras-chave, em ordem de " +
          "precedência definida no código. Regras mais específicas são avaliadas antes " +
          "das mais genéricas.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["mensagem"],
                properties: {
                  mensagem: {
                    type: "string",
                    minLength: 1,
                    maxLength: 1000,
                    example: "Não consigo acessar o sistema com minha senha",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Sugestão de triagem",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/RespostaChatbot" } },
            },
          },
          "400": { $ref: "#/components/responses/RequisicaoInvalida" },
        },
      },
    },
  },
} as const;
