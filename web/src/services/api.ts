// Endereço da API lido do ambiente (o Vite expõe apenas variáveis com prefixo VITE_).
// O fallback mantém o projeto funcionando sem .env em desenvolvimento local.
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

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

export interface NovoChamado {
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: PrioridadeChamado;
  nomeSolicitante: string;
}

export interface MetricasChamados {
  total: number;
  abertos: number;
  emAtendimento: number;
  resolvidos: number;
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
    throw new Error("Erro na comunicação com a API.");
  }

  return resposta.json() as Promise<T>;
}

export async function verificarSaudeApi(): Promise<boolean> {
  try {
    const resposta = await fetch(`${API_URL}/saude`);
    return resposta.ok;
  } catch {
    return false;
  }
}

export async function buscarChamados(status?: StatusChamado | "TODOS"): Promise<Chamado[]> {
  const url =
    status && status !== "TODOS"
      ? `${API_URL}/chamados?status=${status}`
      : `${API_URL}/chamados`;

  const resposta = await fetch(url);
  return tratarResposta<Chamado[]>(resposta);
}

export async function buscarMetricas(): Promise<MetricasChamados> {
  const resposta = await fetch(`${API_URL}/chamados/metricas/resumo`);
  return tratarResposta<MetricasChamados>(resposta);
}

export async function criarChamado(dados: NovoChamado): Promise<Chamado> {
  const resposta = await fetch(`${API_URL}/chamados`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dados),
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

export async function enviarMensagemChatbot(mensagem: string): Promise<RespostaChatbot> {
  const resposta = await fetch(`${API_URL}/chatbot/mensagem`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mensagem }),
  });

  return tratarResposta<RespostaChatbot>(resposta);
}