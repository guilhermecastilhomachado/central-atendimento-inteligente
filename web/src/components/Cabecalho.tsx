interface Props {
  apiOnline: boolean;
}

/**
 * Cabeçalho da página e indicador do estado da API.
 *
 * O indicador é a aplicação direta de um princípio de Interação
 * Humano-Computador: o sistema deve manter o usuário informado sobre o que
 * está acontecendo. Se a API cair, a interface diz que caiu, em vez de
 * simplesmente exibir uma tela vazia.
 */
export function Cabecalho({ apiOnline }: Props) {
  return (
    <section className="hero">
      <div>
        <p className="tag">Projeto de portfólio front-end + API</p>
        <h1>Central de Atendimento Inteligente</h1>
        <p>
          Painel web para abertura, acompanhamento e classificação de chamados
          com apoio de um chatbot simples.
        </p>
      </div>

      <div className={apiOnline ? "status-api online" : "status-api offline"}>
        <span className="bolinha-status" />
        {apiOnline ? "API conectada em localhost:3001" : "API indisponível"}
      </div>
    </section>
  );
}
