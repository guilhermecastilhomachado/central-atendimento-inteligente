import { Router } from "express";
import {
  atualizarStatusChamado,
  buscarChamadoPorId,
  buscarMetricas,
  criarChamado,
  listarChamados,
} from "../servicos/chamadoServico";
import { AppError } from "../erros/AppError";
import {
  atualizarStatusSchema,
  criarChamadoSchema,
  idParamSchema,
  listarChamadosQuerySchema,
} from "../validacao/chamadoSchemas";

const chamadoControlador = Router();

/**
 * Nenhuma rota deste arquivo usa try/catch.
 *
 * O pacote `express-async-errors`, importado uma única vez em `app.ts`,
 * encaminha qualquer exceção lançada dentro de uma rota assíncrona para o
 * tratador global de erros. O controlador só precisa descrever o caminho
 * feliz e lançar um AppError quando a regra não for satisfeita.
 */

/** GET /chamados — lista os chamados, opcionalmente filtrados por status. */
chamadoControlador.get("/", async (req, res) => {
  const { status } = listarChamadosQuerySchema.parse(req.query);

  const chamados = await listarChamados(status);

  res.json(chamados);
});

/**
 * GET /chamados/metricas/resumo — contagem agregada por status.
 *
 * Precisa ser declarada ANTES de GET /:id. O Express avalia as rotas na ordem
 * em que foram registradas, e "/:id" casaria com "/metricas", fazendo a
 * requisição cair na rota errada.
 */
chamadoControlador.get("/metricas/resumo", async (_req, res) => {
  const metricas = await buscarMetricas();

  res.json(metricas);
});

/** GET /chamados/:id — busca um chamado específico. */
chamadoControlador.get("/:id", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);

  const chamado = await buscarChamadoPorId(id);

  if (!chamado) {
    throw AppError.naoEncontrado(`Chamado ${id} não encontrado.`);
  }

  res.json(chamado);
});

/** POST /chamados — cria um chamado. */
chamadoControlador.post("/", async (req, res) => {
  // `parse` devolve os dados já validados, convertidos e tipados.
  // Se algo estiver errado, ele lança um ZodError que vira 400 no
  // tratador global, com a lista de campos inválidos.
  const dados = criarChamadoSchema.parse(req.body);

  const chamadoCriado = await criarChamado(dados);

  res.status(201).json(chamadoCriado);
});

/** PATCH /chamados/:id/status — altera o status de um chamado. */
chamadoControlador.patch("/:id/status", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const { status } = atualizarStatusSchema.parse(req.body);

  const chamadoAtualizado = await atualizarStatusChamado(id, status);

  if (!chamadoAtualizado) {
    throw AppError.naoEncontrado(`Chamado ${id} não encontrado.`);
  }

  res.json(chamadoAtualizado);
});

export default chamadoControlador;
