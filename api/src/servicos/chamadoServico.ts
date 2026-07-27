import { prisma } from "../database/prisma";
import type { NovoChamado, StatusChamado } from "../modelos/Chamado";

export async function listarChamados(status?: StatusChamado) {
  return prisma.chamado.findMany({
    where: status ? { status } : undefined,
    orderBy: {
      id: "asc",
    },
  });
}

export async function buscarChamadoPorId(id: number) {
  return prisma.chamado.findUnique({
    where: {
      id,
    },
  });
}

export async function criarChamado(dados: NovoChamado) {
  return prisma.chamado.create({
    data: {
      titulo: dados.titulo,
      descricao: dados.descricao,
      categoria: dados.categoria,
      prioridade: dados.prioridade,
      nomeSolicitante: dados.nomeSolicitante,
      status: "ABERTO",
    },
  });
}

export async function atualizarStatusChamado(id: number, status: StatusChamado) {
  const chamadoExistente = await buscarChamadoPorId(id);

  if (!chamadoExistente) {
    return null;
  }

  return prisma.chamado.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}

export async function buscarMetricas() {
  const [total, abertos, emAtendimento, resolvidos] = await Promise.all([
    prisma.chamado.count(),
    prisma.chamado.count({
      where: {
        status: "ABERTO",
      },
    }),
    prisma.chamado.count({
      where: {
        status: "EM_ATENDIMENTO",
      },
    }),
    prisma.chamado.count({
      where: {
        status: "RESOLVIDO",
      },
    }),
  ]);

  return {
    total,
    abertos,
    emAtendimento,
    resolvidos,
  };
}