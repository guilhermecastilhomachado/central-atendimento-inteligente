import { Router } from "express";
import {
  atualizarStatusChamado,
  buscarChamadoPorId,
  buscarMetricas,
  criarChamado,
  listarChamados,
} from "../servicos/chamadoServico";
import type { NovoChamado, PrioridadeChamado, StatusChamado } from "../modelos/Chamado";

const chamadoControlador = Router();

const statusPermitidos: StatusChamado[] = ["ABERTO", "EM_ATENDIMENTO", "RESOLVIDO"];
const prioridadesPermitidas: PrioridadeChamado[] = ["BAIXA", "MEDIA", "ALTA"];

function ehStatusValido(status: string): status is StatusChamado {
  return statusPermitidos.includes(status as StatusChamado);
}

function ehPrioridadeValida(prioridade: string): prioridade is PrioridadeChamado {
  return prioridadesPermitidas.includes(prioridade as PrioridadeChamado);
}

function textoValido(valor: unknown): valor is string {
  return typeof valor === "string" && valor.trim().length > 0;
}

chamadoControlador.get("/", async (req, res) => {
  try {
    const status = req.query.status as string | undefined;

    if (status && !ehStatusValido(status)) {
      return res.status(400).json({
        mensagem: "Status informado é inválido.",
        statusPermitidos,
      });
    }

    const chamados = await listarChamados(status as StatusChamado | undefined);
    return res.json(chamados);
  } catch {
    return res.status(500).json({
      mensagem: "Erro interno ao listar chamados.",
    });
  }
});

chamadoControlador.get("/metricas/resumo", async (_req, res) => {
  try {
    const metricas = await buscarMetricas();
    return res.json(metricas);
  } catch {
    return res.status(500).json({
      mensagem: "Erro interno ao buscar métricas dos chamados.",
    });
  }
});

chamadoControlador.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        mensagem: "ID informado é inválido.",
      });
    }

    const chamado = await buscarChamadoPorId(id);

    if (!chamado) {
      return res.status(404).json({
        mensagem: "Chamado não encontrado.",
      });
    }

    return res.json(chamado);
  } catch {
    return res.status(500).json({
      mensagem: "Erro interno ao buscar chamado.",
    });
  }
});

chamadoControlador.post("/", async (req, res) => {
  try {
    const { titulo, descricao, categoria, prioridade, nomeSolicitante } = req.body;

    if (
      !textoValido(titulo) ||
      !textoValido(descricao) ||
      !textoValido(categoria) ||
      !textoValido(prioridade) ||
      !textoValido(nomeSolicitante)
    ) {
      return res.status(400).json({
        mensagem: "Todos os campos são obrigatórios.",
      });
    }

    if (!ehPrioridadeValida(prioridade)) {
      return res.status(400).json({
        mensagem: "Prioridade informada é inválida.",
        prioridadesPermitidas,
      });
    }

    const novoChamado: NovoChamado = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      categoria: categoria.trim(),
      prioridade,
      nomeSolicitante: nomeSolicitante.trim(),
    };

    const chamadoCriado = await criarChamado(novoChamado);

    return res.status(201).json(chamadoCriado);
  } catch {
    return res.status(500).json({
      mensagem: "Erro interno ao criar chamado.",
    });
  }
});

chamadoControlador.patch("/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (Number.isNaN(id)) {
      return res.status(400).json({
        mensagem: "ID informado é inválido.",
      });
    }

    if (!textoValido(status) || !ehStatusValido(status)) {
      return res.status(400).json({
        mensagem: "Status informado é inválido.",
        statusPermitidos,
      });
    }

    const chamadoAtualizado = await atualizarStatusChamado(id, status);

    if (!chamadoAtualizado) {
      return res.status(404).json({
        mensagem: "Chamado não encontrado.",
      });
    }

    return res.json(chamadoAtualizado);
  } catch {
    return res.status(500).json({
      mensagem: "Erro interno ao atualizar status do chamado.",
    });
  }
});

export default chamadoControlador;