import { Router } from "express";
import { StatusChamado } from "../modelos/Chamado";
import {
  atualizarStatusChamado,
  buscarChamadoPorId,
  criarChamado,
  listarChamados,
  obterMetricasChamados,
} from "../servicos/chamadoServico";

export const chamadoControlador = Router();

chamadoControlador.get("/metricas/resumo", (req, res) => {
  const metricas = obterMetricasChamados();
  res.json(metricas);
});

chamadoControlador.get("/", (req, res) => {
  const status = req.query.status as StatusChamado | undefined;
  const resultado = listarChamados(status);

  res.json(resultado);
});

chamadoControlador.get("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const chamado = buscarChamadoPorId(id);

    res.json(chamado);
  } catch (erro) {
    res.status(404).json({
      mensagem: erro instanceof Error ? erro.message : "Erro ao buscar chamado.",
    });
  }
});

chamadoControlador.post("/", (req, res) => {
  try {
    const chamado = criarChamado(req.body);

    res.status(201).json(chamado);
  } catch (erro) {
    res.status(400).json({
      mensagem: erro instanceof Error ? erro.message : "Erro ao criar chamado.",
    });
  }
});

chamadoControlador.patch("/:id/status", (req, res) => {
  try {
    const id = Number(req.params.id);
    const chamado = atualizarStatusChamado(id, req.body);

    res.json(chamado);
  } catch (erro) {
    res.status(400).json({
      mensagem:
        erro instanceof Error ? erro.message : "Erro ao atualizar status.",
    });
  }
});