import { describe, expect, it } from "vitest";
import { gerarRespostaChatbot } from "../src/servicos/chatbotServico";
import { AppError } from "../src/erros/AppError";

/**
 * Testes de unidade da triagem.
 *
 * `gerarRespostaChatbot` é uma função pura: para a mesma entrada devolve
 * sempre a mesma saída, sem tocar em banco, rede ou relógio. Isso a torna o
 * alvo mais barato de testar do projeto — não é preciso subir servidor nem
 * preparar dados.
 */
describe("gerarRespostaChatbot", () => {
  describe("classificação por categoria", () => {
    it("classifica problema de senha como Acesso e prioridade ALTA", () => {
      const resultado = gerarRespostaChatbot("Não consigo entrar com minha senha");

      expect(resultado.categoriaSugerida).toBe("Acesso");
      expect(resultado.prioridadeSugerida).toBe("ALTA");
      expect(resultado.deveAbrirChamado).toBe(true);
    });

    it("classifica dúvida sobre integração como Integração e prioridade MEDIA", () => {
      const resultado = gerarRespostaChatbot("Como faço a integração via webhook?");

      expect(resultado.categoriaSugerida).toBe("Integração");
      expect(resultado.prioridadeSugerida).toBe("MEDIA");
    });

    it("classifica relato de falha como Suporte Técnico", () => {
      const resultado = gerarRespostaChatbot("O sistema está travando ao salvar");

      expect(resultado.categoriaSugerida).toBe("Suporte Técnico");
    });

    it("classifica pedido de automação como Melhoria e prioridade BAIXA", () => {
      const resultado = gerarRespostaChatbot("Sugestão: automatizar o fluxo de aprovação");

      expect(resultado.categoriaSugerida).toBe("Melhoria");
      expect(resultado.prioridadeSugerida).toBe("BAIXA");
    });

    it("cai no Atendimento Geral quando nenhuma regra reconhece a mensagem", () => {
      const resultado = gerarRespostaChatbot("Bom dia, tudo bem?");

      expect(resultado.categoriaSugerida).toBe("Atendimento Geral");
      expect(resultado.prioridadeSugerida).toBe("BAIXA");
    });
  });

  describe("precedência entre regras", () => {
    /**
     * Este teste protege contra o bug que existia antes: a mensagem abaixo
     * contém "dados", palavra da regra de Integração, mas o assunto real é
     * acesso. Como a regra de Acesso é avaliada primeiro e reconhece
     * "acessar", a classificação correta prevalece.
     *
     * Se alguém reordenar as verificações no serviço, este teste falha.
     */
    it("prioriza Acesso sobre Integração quando a mensagem cita ambos", () => {
      const resultado = gerarRespostaChatbot("Não consigo acessar meus dados");

      expect(resultado.categoriaSugerida).toBe("Acesso");
    });

    it("reconhece variações da mesma ideia de acesso", () => {
      const variacoes = [
        "não consigo logar",
        "minha conta está bloqueada",
        "erro de permissão no sistema",
        "não consigo acessar",
      ];

      for (const mensagem of variacoes) {
        expect(gerarRespostaChatbot(mensagem).categoriaSugerida).toBe("Acesso");
      }
    });
  });

  describe("normalização e robustez", () => {
    it("é insensível a maiúsculas e minúsculas", () => {
      const minusculas = gerarRespostaChatbot("erro no sistema");
      const maiusculas = gerarRespostaChatbot("ERRO NO SISTEMA");

      expect(maiusculas.categoriaSugerida).toBe(minusculas.categoriaSugerida);
    });

    it("preserva a mensagem original na descrição sugerida", () => {
      const original = "Não consigo acessar o sistema";
      const resultado = gerarRespostaChatbot(original);

      expect(resultado.descricaoSugerida).toBe(original);
      expect(resultado.mensagemUsuario).toBe(original);
    });

    it("rejeita mensagem composta apenas de espaços", () => {
      expect(() => gerarRespostaChatbot("     ")).toThrow(AppError);
    });

    it("sempre devolve uma sugestão completa, qualquer que seja a entrada", () => {
      const resultado = gerarRespostaChatbot("qualquer coisa");

      expect(resultado.tituloSugerido).toBeTruthy();
      expect(resultado.categoriaSugerida).toBeTruthy();
      expect(resultado.resposta).toBeTruthy();
      expect(["BAIXA", "MEDIA", "ALTA"]).toContain(resultado.prioridadeSugerida);
    });
  });
});
