export type StatusChamado = "ABERTO" | "EM_ATENDIMENTO" | "RESOLVIDO";

export type PrioridadeChamado = "BAIXA" | "MEDIA" | "ALTA";

export interface Chamado {
  id: number;
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: PrioridadeChamado;
  status: StatusChamado;
  nomeSolicitante: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CriarChamadoEntrada {
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: PrioridadeChamado;
  nomeSolicitante: string;
}

export interface AtualizarStatusEntrada {
  status: StatusChamado;
}