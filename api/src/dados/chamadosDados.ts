import { Chamado } from "../modelos/Chamado";

export const chamados: Chamado[] = [
  {
    id: 1,
    titulo: "Erro ao acessar o sistema",
    descricao: "Usuário informou que não consegue acessar o painel com sua senha.",
    categoria: "Acesso",
    prioridade: "ALTA",
    status: "ABERTO",
    nomeSolicitante: "Mariana Souza",
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: 2,
    titulo: "Dúvida sobre integração com API",
    descricao: "Cliente precisa entender como consultar os dados de atendimento por integração.",
    categoria: "Integração",
    prioridade: "MEDIA",
    status: "EM_ATENDIMENTO",
    nomeSolicitante: "Carlos Oliveira",
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
  {
    id: 3,
    titulo: "Solicitação de melhoria no fluxo de atendimento",
    descricao: "Equipe solicitou melhoria para reduzir etapas no cadastro de chamados.",
    categoria: "Melhoria",
    prioridade: "BAIXA",
    status: "RESOLVIDO",
    nomeSolicitante: "Ana Pereira",
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
];

export let proximoIdChamado = 4;

export function gerarProximoIdChamado(): number {
  const idGerado = proximoIdChamado;
  proximoIdChamado += 1;
  return idGerado;
}