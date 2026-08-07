import { useCallback, useEffect, useState } from "react";
import {
  atualizarStatusChamado,
  buscarChamados,
  buscarMetricas,
  criarChamado,
  verificarSaudeApi,
} from "../services/api";
import type {
  Chamado,
  MetricasChamados,
  NovoChamado,
  StatusChamado,
} from "../services/api";

export type FiltroStatus = "TODOS" | StatusChamado;

/**
 * Concentra todo o estado dos chamados e a conversa com a API.
 *
 * A motivação para extrair isto do componente é separar o que a tela faz do
 * que a tela mostra: o hook cuida de carregar, criar e atualizar; os
 * componentes recebem dados prontos e apenas os renderizam. Em consequência,
 * os componentes ficam sem efeito colateral e podem ser reaproveitados ou
 * testados isoladamente.
 */
export function useChamados() {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [metricas, setMetricas] = useState<MetricasChamados | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("TODOS");
  const [apiOnline, setApiOnline] = useState(false);
  const [carregando, setCarregando] = useState(false);

  /**
   * `useCallback` mantém a mesma referência da função entre renderizações.
   * Sem isso, a função seria recriada a cada render, e o `useEffect` abaixo,
   * que a tem como dependência, dispararia em loop.
   */
  const recarregar = useCallback(async (): Promise<void> => {
    const apiEstaOnline = await verificarSaudeApi();
    setApiOnline(apiEstaOnline);

    if (!apiEstaOnline) {
      setChamados([]);
      setMetricas(null);
      throw new Error("Não foi possível conectar à API.");
    }

    // As duas requisições são independentes: buscá-las em paralelo evita
    // esperar a soma dos dois tempos de resposta.
    const [chamadosApi, metricasApi] = await Promise.all([
      buscarChamados(filtroStatus),
      buscarMetricas(),
    ]);

    setChamados(chamadosApi);
    setMetricas(metricasApi);
  }, [filtroStatus]);

  const criar = useCallback(
    async (dados: NovoChamado): Promise<void> => {
      setCarregando(true);

      try {
        await criarChamado(dados);
        await recarregar();
      } finally {
        setCarregando(false);
      }
    },
    [recarregar]
  );

  const alterarStatus = useCallback(
    async (id: number, status: StatusChamado): Promise<void> => {
      await atualizarStatusChamado(id, status);
      await recarregar();
    },
    [recarregar]
  );

  return {
    chamados,
    metricas,
    filtroStatus,
    setFiltroStatus,
    apiOnline,
    carregando,
    setCarregando,
    recarregar,
    criar,
    alterarStatus,
  };
}

/**
 * Executa uma carga inicial e repete sempre que o filtro muda.
 *
 * Ficou separado do hook principal para que o tratamento de erro continue na
 * camada que sabe como avisar o usuário: o hook lança, a tela decide qual
 * mensagem exibir.
 */
export function useCargaInicial(
  recarregar: () => Promise<void>,
  aoFalhar: (mensagem: string) => void
): void {
  useEffect(() => {
    let cancelado = false;

    recarregar().catch(() => {
      // Evita atualizar a tela se o componente já saiu antes da resposta.
      if (!cancelado) {
        aoFalhar("Não foi possível carregar os dados. Verifique se a API está rodando.");
      }
    });

    return () => {
      cancelado = true;
    };
  }, [recarregar, aoFalhar]);
}
