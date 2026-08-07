import { useCallback } from "react";
import "./App.css";

import { Cabecalho } from "./components/Cabecalho";
import { ChatbotTriagem } from "./components/ChatbotTriagem";
import { Feedback } from "./components/Feedback";
import { FormularioChamado } from "./components/FormularioChamado";
import { ListaChamados } from "./components/ListaChamados";
import { PainelMetricas } from "./components/PainelMetricas";

import { useCargaInicial, useChamados } from "./hooks/useChamados";
import { useFeedback } from "./hooks/useFeedback";
import { useFormularioChamado } from "./hooks/useFormularioChamado";

import type { StatusChamado } from "./services/api";

/**
 * Composição da tela.
 *
 * Depois da separação em componentes e hooks, este arquivo passou a ter uma
 * função só: ligar as peças. Não há aqui nenhuma marcação de layout, nenhuma
 * chamada de API e nenhum estado próprio — apenas a coordenação entre o que
 * cada parte precisa saber da outra.
 */
function App() {
  const { feedback, exibirFeedback } = useFeedback();

  const {
    chamados,
    metricas,
    filtroStatus,
    setFiltroStatus,
    apiOnline,
    carregando,
    recarregar,
    criar,
    alterarStatus,
  } = useChamados();

  const formulario = useFormularioChamado();

  useCargaInicial(
    recarregar,
    useCallback((mensagem: string) => exibirFeedback(mensagem, "erro"), [exibirFeedback])
  );

  async function aoCriarChamado() {
    try {
      await criar(formulario.valores);

      formulario.limpar();
      exibirFeedback("Chamado criado com sucesso.", "sucesso");
    } catch {
      exibirFeedback(
        "Não foi possível criar o chamado. Verifique os dados e tente novamente.",
        "erro"
      );
    }
  }

  async function aoAlterarStatus(id: number, status: StatusChamado) {
    try {
      await alterarStatus(id, status);

      const rotulo = status.toLowerCase().replace("_", " ");
      exibirFeedback(`Status do chamado atualizado para ${rotulo}.`, "sucesso");
    } catch {
      exibirFeedback("Não foi possível atualizar o status do chamado.", "erro");
    }
  }

  return (
    <main className="pagina">
      <Cabecalho apiOnline={apiOnline} />

      {feedback && <Feedback mensagem={feedback.mensagem} tipo={feedback.tipo} />}

      <PainelMetricas metricas={metricas} />

      <section className="grid-principal">
        <ListaChamados
          chamados={chamados}
          filtroStatus={filtroStatus}
          aoTrocarFiltro={setFiltroStatus}
          aoAlterarStatus={aoAlterarStatus}
        />

        <aside className="coluna-lateral">
          <FormularioChamado
            valores={formulario.valores}
            carregando={carregando}
            aoAlterarCampo={formulario.alterarCampo}
            aoEnviar={aoCriarChamado}
          />

          <ChatbotTriagem
            aoReceberSugestao={formulario.preencherComSugestao}
            aoNotificar={exibirFeedback}
          />
        </aside>
      </section>
    </main>
  );
}

export default App;
