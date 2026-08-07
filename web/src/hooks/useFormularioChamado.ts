import { useCallback, useState } from "react";
import type { NovoChamado, RespostaChatbot } from "../services/api";

const VALORES_INICIAIS: NovoChamado = {
  titulo: "",
  descricao: "",
  categoria: "",
  prioridade: "MEDIA",
  nomeSolicitante: "",
};

/**
 * Estado do formulário de abertura de chamado.
 *
 * Vive aqui, e não dentro do componente do formulário, porque o chatbot
 * também escreve nele: a sugestão de triagem preenche título, descrição,
 * categoria e prioridade. Dois componentes irmãos precisam enxergar o mesmo
 * estado, então ele sobe para o pai comum.
 */
export function useFormularioChamado() {
  const [valores, setValores] = useState<NovoChamado>(VALORES_INICIAIS);

  const alterarCampo = useCallback(<C extends keyof NovoChamado>(
    campo: C,
    valor: NovoChamado[C]
  ) => {
    setValores((atual) => ({ ...atual, [campo]: valor }));
  }, []);

  /**
   * Aplica a sugestão do chatbot preservando o que o usuário já digitou no
   * nome do solicitante — esse campo o chatbot não tem como inferir.
   */
  const preencherComSugestao = useCallback((sugestao: RespostaChatbot) => {
    setValores((atual) => ({
      ...atual,
      titulo: sugestao.tituloSugerido,
      descricao: sugestao.descricaoSugerida,
      categoria: sugestao.categoriaSugerida,
      prioridade: sugestao.prioridadeSugerida,
    }));
  }, []);

  const limpar = useCallback(() => {
    setValores(VALORES_INICIAIS);
  }, []);

  return { valores, alterarCampo, preencherComSugestao, limpar };
}
