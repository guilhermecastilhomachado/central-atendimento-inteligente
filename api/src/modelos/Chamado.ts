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
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface NovoChamado {
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: PrioridadeChamado;
  nomeSolicitante: string;
}