const API_URL = "http://localhost:3001";

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

export interface MetricasChamados {
  total: number;
  abertos: number;
  emAtendimento: number;
  resolvidos: number;
}

export interface NovoChamado {
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: PrioridadeChamado;
  nomeSolicitante: string;
}

export interface RespostaChatbot {
  mensagemUsuario: string;
  resposta: string;
  categoriaSugerida: string;
  prioridadeSugerida: PrioridadeChamado;
  deveAbrirChamado: boolean;
  tituloSugerido: string;
  descricaoSugerida: string;
}

async function tratarResposta<T>(resposta: Response): Promise<T> {
  if (!resposta.ok) {
    throw new Error("Erro ao comunicar com a API.");
  }

  return resposta.json();
}

export async function buscarMetricas(): Promise<MetricasChamados> {
  const resposta = await fetch(`${API_URL}/chamados/metricas/resumo`);
  return tratarResposta<MetricasChamados>(resposta);
}

export async function buscarChamados(status?: StatusChamado): Promise<Chamado[]> {
  const parametroStatus = status ? `?status=${status}` : "";
  const resposta = await fetch(`${API_URL}/chamados${parametroStatus}`);
  return tratarResposta<Chamado[]>(resposta);
}

export async function criarChamado(novoChamado: NovoChamado): Promise<Chamado> {
  const resposta = await fetch(`${API_URL}/chamados`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(novoChamado),
  });

  return tratarResposta<Chamado>(resposta);
}

export async function atualizarStatusChamado(
  id: number,
  status: StatusChamado
): Promise<Chamado> {
  const resposta = await fetch(`${API_URL}/chamados/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  return tratarResposta<Chamado>(resposta);
}

export async function enviarMensagemChatbot(
  mensagem: string
): Promise<RespostaChatbot> {
  const resposta = await fetch(`${API_URL}/chatbot/mensagem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mensagem }),
  });

  return tratarResposta<RespostaChatbot>(resposta);
}