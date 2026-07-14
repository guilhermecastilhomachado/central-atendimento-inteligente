import "./App.css";

function App() {
  return (
    <main className="pagina-inicial">
      <section className="hero">
        <p className="etiqueta">Projeto de Portfólio</p>

        <h1>Central de Atendimento Inteligente</h1>

        <p className="descricao">
          Sistema web para simular uma central de atendimento com chatbot
          simples, painel de chamados e integração com API em Node.js e
          TypeScript.
        </p>

        <div className="acoes">
          <button>Ver atendimentos</button>
          <button className="botao-secundario">Abrir chatbot</button>
        </div>
      </section>

      <section className="cards">
        <article>
          <h2>Chatbot</h2>
          <p>
            Atendimento inicial automatizado por palavras-chave e regras simples
            de negócio.
          </p>
        </article>

        <article>
          <h2>Painel</h2>
          <p>
            Visualização de chamados, status, prioridade e acompanhamento das
            demandas.
          </p>
        </article>

        <article>
          <h2>API</h2>
          <p>
            Back-end em Node.js e TypeScript para centralizar dados e regras do
            sistema.
          </p>
        </article>
      </section>
    </main>
  );
}

export default App;