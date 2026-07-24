import { chamados, gerarProximoIdChamado } from "../dados/chamadosDados";
import {
  AtualizarStatusEntrada,
  Chamado,
  CriarChamadoEntrada,
  StatusChamado,
} from "../modelos/Chamado";

function validarTextoObrigatorio(valor: string, nomeCampo: string): void {
  if (!valor || valor.trim().length === 0) {
    throw new Error(`O campo ${nomeCampo} é obrigatório.`);
  }
}

function validarStatus(status: string): status is StatusChamado {
  return ["ABERTO", "EM_ATENDIMENTO", "RESOLVIDO"].includes(status);
}

export function listarChamados(status?: StatusChamado): Chamado[] {
  if (!status) {
    return chamados;
  }

  return chamados.filter((chamado) => chamado.status === status);
}

export function buscarChamadoPorId(id: number): Chamado {
  const chamado = chamados.find((item) => item.id === id);

  if (!chamado) {
    throw new Error(`Chamado não encontrado com id: ${id}`);
  }

  return chamado;
}

export function criarChamado(entrada: CriarChamadoEntrada): Chamado {
  validarTextoObrigatorio(entrada.titulo, "titulo");
  validarTextoObrigatorio(entrada.descricao, "descricao");
  validarTextoObrigatorio(entrada.categoria, "categoria");
  validarTextoObrigatorio(entrada.nomeSolicitante, "nomeSolicitante");

  const agora = new Date().toISOString();

  const novoChamado: Chamado = {
    id: gerarProximoIdChamado(),
    titulo: entrada.titulo.trim(),
    descricao: entrada.descricao.trim(),
    categoria: entrada.categoria.trim(),
    prioridade: entrada.prioridade,
    status: "ABERTO",
    nomeSolicitante: entrada.nomeSolicitante.trim(),
    criadoEm: agora,
    atualizadoEm: agora,
  };

  chamados.push(novoChamado);

  return novoChamado;
}

export function atualizarStatusChamado(
  id: number,
  entrada: AtualizarStatusEntrada
): Chamado {
  if (!validarStatus(entrada.status)) {
    throw new Error("Status inválido. Use ABERTO, EM_ATENDIMENTO ou RESOLVIDO.");
  }

  const chamado = buscarChamadoPorId(id);

  chamado.status = entrada.status;
  chamado.atualizadoEm = new Date().toISOString();

  return chamado;
}

export function obterMetricasChamados() {
  const total = chamados.length;
  const abertos = chamados.filter((chamado) => chamado.status === "ABERTO").length;
  const emAtendimento = chamados.filter(
    (chamado) => chamado.status === "EM_ATENDIMENTO"
  ).length;
  const resolvidos = chamados.filter(
    (chamado) => chamado.status === "RESOLVIDO"
  ).length;

  return {
    total,
    abertos,
    emAtendimento,
    resolvidos,
  };
}