import { PrioridadeChamado } from "../modelos/Chamado";

interface RespostaChatbot {
  mensagemUsuario: string;
  resposta: string;
  categoriaSugerida: string;
  prioridadeSugerida: PrioridadeChamado;
  deveAbrirChamado: boolean;
  tituloSugerido: string;
  descricaoSugerida: string;
}

function contemAlgumaPalavra(texto: string, palavras: string[]): boolean {
  return palavras.some((palavra) => texto.includes(palavra));
}

/**
 * A ordem das verificações abaixo define a precedência da triagem.
 * Regras mais específicas vêm antes das mais genéricas: "acesso" é avaliado
 * antes de "dados" para que "não consigo acessar meus dados" seja classificado
 * como problema de acesso, e não como integração.
 */

export function gerarRespostaChatbot(mensagem: string): RespostaChatbot {
  const mensagemNormalizada = mensagem.toLowerCase().trim();

  if (!mensagemNormalizada) {
    throw new Error("A mensagem não pode estar vazia.");
  }

  if (
    contemAlgumaPalavra(mensagemNormalizada, [
      "senha",
      "login",
      "acesso",
      "acessar",
      "acessa",
      "entrar",
      "logar",
      "conta",
      "permissao",
      "permissão",
      "usuario",
      "usuário",
    ])
  ) {
    return {
      mensagemUsuario: mensagem,
      resposta:
        "Entendi que você está com dificuldade de acesso. Vou sugerir a abertura de um chamado para a equipe verificar login, senha ou permissão do usuário.",
      categoriaSugerida: "Acesso",
      prioridadeSugerida: "ALTA",
      deveAbrirChamado: true,
      tituloSugerido: "Problema de acesso ao sistema",
      descricaoSugerida: mensagem,
    };
  }

  if (
    contemAlgumaPalavra(mensagemNormalizada, [
      "api",
      "integração",
      "integracao",
      "webhook",
      "dados",
    ])
  ) {
    return {
      mensagemUsuario: mensagem,
      resposta:
        "Parece ser uma dúvida ou problema relacionado à integração. Vou classificar como integração para análise técnica.",
      categoriaSugerida: "Integração",
      prioridadeSugerida: "MEDIA",
      deveAbrirChamado: true,
      tituloSugerido: "Solicitação sobre integração",
      descricaoSugerida: mensagem,
    };
  }

  if (
    contemAlgumaPalavra(mensagemNormalizada, [
      "erro",
      "bug",
      "falha",
      "travando",
      "lento",
      "problema",
    ])
  ) {
    return {
      mensagemUsuario: mensagem,
      resposta:
        "Identifiquei uma possível falha técnica. Recomendo abrir um chamado com prioridade média ou alta, dependendo do impacto.",
      categoriaSugerida: "Suporte Técnico",
      prioridadeSugerida: "MEDIA",
      deveAbrirChamado: true,
      tituloSugerido: "Falha técnica no sistema",
      descricaoSugerida: mensagem,
    };
  }

  if (
    contemAlgumaPalavra(mensagemNormalizada, [
      "melhoria",
      "sugestão",
      "sugestao",
      "automatizar",
      "fluxo",
    ])
  ) {
    return {
      mensagemUsuario: mensagem,
      resposta:
        "Sua mensagem parece ser uma sugestão de melhoria. Vou classificar como melhoria para avaliação da equipe.",
      categoriaSugerida: "Melhoria",
      prioridadeSugerida: "BAIXA",
      deveAbrirChamado: true,
      tituloSugerido: "Sugestão de melhoria",
      descricaoSugerida: mensagem,
    };
  }

  return {
    mensagemUsuario: mensagem,
    resposta:
      "Não consegui classificar automaticamente sua solicitação, mas posso encaminhar como atendimento geral para análise da equipe.",
    categoriaSugerida: "Atendimento Geral",
    prioridadeSugerida: "BAIXA",
    deveAbrirChamado: true,
    tituloSugerido: "Atendimento geral",
    descricaoSugerida: mensagem,
  };
}