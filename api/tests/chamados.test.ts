import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { criarBancoEmMemoria } from "./bancoEmMemoria";
import { app } from "../src/app";

const banco = criarBancoEmMemoria();

/**
 * Substitui o módulo de acesso ao banco por um dublê em memória.
 *
 * O Vitest iça a chamada de `vi.mock` para o topo do arquivo, antes até dos
 * imports. Por isso a fábrica não pode ler `banco` diretamente — naquele
 * instante a constante ainda não foi inicializada. O getter resolve isso:
 * ele adia a leitura para o momento em que a aplicação realmente usa o
 * prisma, que é sempre depois de o módulo de teste ter sido avaliado.
 */
vi.mock("../src/database/prisma", () => ({
  get prisma() {
    return banco;
  },
}));

describe("API de chamados", () => {
  beforeEach(() => {
    banco.limpar();
  });

  describe("GET /saude", () => {
    it("responde 200 informando que a API está no ar", async () => {
      const resposta = await request(app).get("/saude");

      expect(resposta.status).toBe(200);
      expect(resposta.body.status).toBeTruthy();
    });
  });

  describe("POST /chamados", () => {
    const chamadoValido = {
      titulo: "Erro ao acessar o sistema",
      descricao: "O usuário não consegue entrar com a senha cadastrada.",
      categoria: "Acesso",
      prioridade: "ALTA",
      nomeSolicitante: "Mariana Souza",
    };

    it("cria o chamado e responde 201 com o registro persistido", async () => {
      const resposta = await request(app).post("/chamados").send(chamadoValido);

      expect(resposta.status).toBe(201);
      expect(resposta.body.id).toBeGreaterThan(0);
      expect(resposta.body.titulo).toBe(chamadoValido.titulo);
    });

    it("define o status inicial como ABERTO, ignorando o que o cliente enviar", () => {
      return request(app)
        .post("/chamados")
        .send({ ...chamadoValido, status: "RESOLVIDO" })
        .expect(201)
        .expect((resposta) => {
          expect(resposta.body.status).toBe("ABERTO");
        });
    });

    it("remove espaços em volta dos campos de texto", async () => {
      const resposta = await request(app)
        .post("/chamados")
        .send({ ...chamadoValido, titulo: "   Título com espaços   " });

      expect(resposta.body.titulo).toBe("Título com espaços");
    });

    it("responde 400 e aponta o campo quando falta informação obrigatória", async () => {
      const { titulo, ...semTitulo } = chamadoValido;

      const resposta = await request(app).post("/chamados").send(semTitulo);

      expect(resposta.status).toBe(400);
      expect(resposta.body.detalhes).toHaveProperty("titulo");
    });

    it("responde 400 quando a prioridade não é um valor aceito", async () => {
      const resposta = await request(app)
        .post("/chamados")
        .send({ ...chamadoValido, prioridade: "URGENTISSIMA" });

      expect(resposta.status).toBe(400);
      expect(resposta.body.detalhes).toHaveProperty("prioridade");
    });

    it("acumula todos os campos inválidos em uma única resposta", async () => {
      const resposta = await request(app).post("/chamados").send({
        titulo: "ab",
        descricao: "x",
        categoria: "",
        prioridade: "INVALIDA",
        nomeSolicitante: "",
      });

      expect(resposta.status).toBe(400);
      expect(Object.keys(resposta.body.detalhes).length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("GET /chamados", () => {
    beforeEach(() => {
      banco.semear([
        {
          titulo: "Chamado aberto",
          descricao: "Descrição do chamado aberto.",
          categoria: "Acesso",
          prioridade: "ALTA",
          status: "ABERTO",
          nomeSolicitante: "Ana",
        },
        {
          titulo: "Chamado resolvido",
          descricao: "Descrição do chamado resolvido.",
          categoria: "Melhoria",
          prioridade: "BAIXA",
          status: "RESOLVIDO",
          nomeSolicitante: "Carlos",
        },
      ]);
    });

    it("lista todos os chamados quando nenhum filtro é informado", async () => {
      const resposta = await request(app).get("/chamados");

      expect(resposta.status).toBe(200);
      expect(resposta.body).toHaveLength(2);
    });

    it("filtra por status quando a query é informada", async () => {
      const resposta = await request(app).get("/chamados?status=ABERTO");

      expect(resposta.status).toBe(200);
      expect(resposta.body).toHaveLength(1);
      expect(resposta.body[0].status).toBe("ABERTO");
    });

    it("responde 400 quando o status da query é desconhecido", async () => {
      const resposta = await request(app).get("/chamados?status=PENDENTE");

      expect(resposta.status).toBe(400);
      expect(resposta.body.detalhes).toHaveProperty("status");
    });
  });

  describe("GET /chamados/:id", () => {
    it("responde 404 quando o chamado não existe", async () => {
      const resposta = await request(app).get("/chamados/999");

      expect(resposta.status).toBe(404);
      expect(resposta.body.mensagem).toContain("999");
    });

    it("responde 400 quando o id não é um número", async () => {
      const resposta = await request(app).get("/chamados/abc");

      expect(resposta.status).toBe(400);
    });
  });

  describe("PATCH /chamados/:id/status", () => {
    it("atualiza o status de um chamado existente", async () => {
      const criado = await request(app).post("/chamados").send({
        titulo: "Chamado para atualizar",
        descricao: "Descrição suficientemente longa.",
        categoria: "Suporte",
        prioridade: "MEDIA",
        nomeSolicitante: "Guilherme",
      });

      const resposta = await request(app)
        .patch(`/chamados/${criado.body.id}/status`)
        .send({ status: "RESOLVIDO" });

      expect(resposta.status).toBe(200);
      expect(resposta.body.status).toBe("RESOLVIDO");
    });

    it("responde 404 ao tentar atualizar um chamado inexistente", async () => {
      const resposta = await request(app)
        .patch("/chamados/999/status")
        .send({ status: "RESOLVIDO" });

      expect(resposta.status).toBe(404);
    });

    it("responde 400 quando o status enviado é inválido", async () => {
      const resposta = await request(app)
        .patch("/chamados/1/status")
        .send({ status: "FINALIZADO" });

      expect(resposta.status).toBe(400);
    });
  });

  describe("GET /chamados/metricas/resumo", () => {
    it("devolve a contagem por status", async () => {
      banco.semear([
        {
          titulo: "A",
          descricao: "Descrição A.",
          categoria: "Acesso",
          prioridade: "ALTA",
          status: "ABERTO",
          nomeSolicitante: "Ana",
        },
        {
          titulo: "B",
          descricao: "Descrição B.",
          categoria: "Acesso",
          prioridade: "ALTA",
          status: "ABERTO",
          nomeSolicitante: "Bruno",
        },
        {
          titulo: "C",
          descricao: "Descrição C.",
          categoria: "Melhoria",
          prioridade: "BAIXA",
          status: "RESOLVIDO",
          nomeSolicitante: "Carla",
        },
      ]);

      const resposta = await request(app).get("/chamados/metricas/resumo");

      expect(resposta.status).toBe(200);
      expect(resposta.body).toEqual({
        total: 3,
        abertos: 2,
        emAtendimento: 0,
        resolvidos: 1,
      });
    });

    it("não é interpretada como GET /chamados/:id", async () => {
      // Protege a ordem de declaração das rotas: se "/:id" fosse registrada
      // antes, "metricas" seria tratada como um id e a resposta seria 400.
      const resposta = await request(app).get("/chamados/metricas/resumo");

      expect(resposta.status).toBe(200);
      expect(resposta.body).toHaveProperty("total");
    });
  });

  describe("POST /chatbot/mensagem", () => {
    it("devolve a sugestão de triagem para uma mensagem válida", async () => {
      const resposta = await request(app)
        .post("/chatbot/mensagem")
        .send({ mensagem: "Não consigo acessar o sistema com minha senha" });

      expect(resposta.status).toBe(200);
      expect(resposta.body.categoriaSugerida).toBe("Acesso");
      expect(resposta.body.prioridadeSugerida).toBe("ALTA");
    });

    it("responde 400 quando a mensagem não é um texto", async () => {
      const resposta = await request(app).post("/chatbot/mensagem").send({ mensagem: 42 });

      expect(resposta.status).toBe(400);
      expect(resposta.body.detalhes).toHaveProperty("mensagem");
    });

    it("responde 400 quando a mensagem está vazia", async () => {
      const resposta = await request(app).post("/chatbot/mensagem").send({ mensagem: "   " });

      expect(resposta.status).toBe(400);
    });
  });

  describe("rota inexistente", () => {
    it("responde 404 com o formato de erro padrão da API", async () => {
      const resposta = await request(app).get("/rota-que-nao-existe");

      expect(resposta.status).toBe(404);
      expect(resposta.body).toHaveProperty("mensagem");
    });
  });
});
