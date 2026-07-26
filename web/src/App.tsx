import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import "./App.css";

import {
  atualizarStatusChamado,
  buscarChamados,
  buscarMetricas,
  criarChamado,
  enviarMensagemChatbot,
  verificarSaudeApi,
} from "./services/api";

import type {
  Chamado,
  MetricasChamados,
  NovoChamado,
  PrioridadeChamado,
  RespostaChatbot,
  StatusChamado,
} from "./services/api";

const chamadoInicial: NovoChamado = {
  titulo: "",
  descricao: "",
  categoria: "",
  prioridade: "MEDIA",
  nomeSolicitante: "",
};

function App() {
  const [metricas, setMetricas] = useState<MetricasChamados | null>(null);
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<"TODOS" | StatusChamado>("TODOS");
  const [novoChamado, setNovoChamado] = useState<NovoChamado>(chamadoInicial);

  const [mensagemChatbot, setMensagemChatbot] = useState("");
  const [respostaChatbot, setRespostaChatbot] = useState<RespostaChatbot | null>(null);

  const [carregando, setCarregando] = useState(false);

  const [apiOnline, setApiOnline] = useState(false);
  const [mensagemFeedback, setMensagemFeedback] = useState("");
  const [tipoFeedback, setTipoFeedback] = useState<"sucesso" | "erro" | "info">("info");

  function exibirFeedback(
    mensagem: string,
    tipo: "sucesso" | "erro" | "info" = "info"
  ) {
    setMensagemFeedback(mensagem);
    setTipoFeedback(tipo);

    window.setTimeout(() => {
      setMensagemFeedback("");
    }, 4000);
  }

  async function carregarDados() {
    try {
      const apiEstaOnline = await verificarSaudeApi();
      setApiOnline(apiEstaOnline);

      if (!apiEstaOnline) {
        setMetricas(null);
        setChamados([]);
        exibirFeedback("Não foi possível conectar à API. Verifique se o servidor está rodando.", "erro");
        return;
      }

      const [chamadosApi, metricasApi] = await Promise.all([
        buscarChamados(filtroStatus),
        buscarMetricas(),
      ]);

      setChamados(chamadosApi);
      setMetricas(metricasApi);
    } catch {
      setApiOnline(false);
      setMetricas(null);
      setChamados([]);
      exibirFeedback("Não foi possível carregar os dados da API.", "erro");
    }
  }

  useEffect(() => {
    carregarDados();
  }, [filtroStatus]);

  async function aoCriarChamado(evento: FormEvent) {
    evento.preventDefault();

    try {
      setCarregando(true);

      await criarChamado(novoChamado);

      setNovoChamado(chamadoInicial);
      exibirFeedback("Chamado criado com sucesso.", "sucesso");

      await carregarDados();
    } catch {
      exibirFeedback("Não foi possível criar o chamado. Verifique os dados e tente novamente.", "erro");
    } finally {
      setCarregando(false);
    }
  }

  async function aoAtualizarStatus(id: number, status: StatusChamado) {
    try {
      await atualizarStatusChamado(id, status);
      
      const statusFormatado =
        status === "ABERTO"
          ? "aberto"
          : status === "EM_ATENDIMENTO"
            ? "em atendimento"
            : "resolvido";

      exibirFeedback(`Status do chamado atualizado para ${statusFormatado}.`, "sucesso");

      await carregarDados();
    } catch {
      exibirFeedback("Não foi possível atualizar o status do chamado.", "erro");
    }
  }

  async function aoEnviarMensagemChatbot(evento: FormEvent) {
    evento.preventDefault();

    if (!mensagemChatbot.trim()) {
      exibirFeedback("Digite uma mensagem antes de enviar para o chatbot.", "info");
      return;
    }

    try {
      setCarregando(true);

      const resposta = await enviarMensagemChatbot(mensagemChatbot);
      setRespostaChatbot(resposta);
      exibirFeedback("Sugestão do chatbot gerada com sucesso.", "sucesso");

      if (resposta.deveAbrirChamado) {
        setNovoChamado((chamadoAtual) => ({
          ...chamadoAtual,
          titulo: resposta.tituloSugerido,
          descricao: resposta.descricaoSugerida,
          categoria: resposta.categoriaSugerida,
          prioridade: resposta.prioridadeSugerida,
        }));
      }
    } catch {
      exibirFeedback("Não foi possível consultar o chatbot.", "erro");
    } finally {
      setCarregando(false);
    }
  }

  function alterarCampoChamado(campo: keyof NovoChamado, valor: string) {
    setNovoChamado((chamadoAtual) => ({
      ...chamadoAtual,
      [campo]: valor,
    }));
  }

  return (
    <main className="pagina">
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
          <span className="bolinha-status"></span>
          {apiOnline ? "API conectada em localhost:3001" : "API indisponível"}
        </div>
      </section>

      {mensagemFeedback && (
        <div className={`feedback feedback-${tipoFeedback}`}>
          {mensagemFeedback}
        </div>
      )}

      <section className="metricas">
        <article className="card-metrica">
          <span>Total</span>
          <strong>{metricas?.total ?? "-"}</strong>
        </article>

        <article className="card-metrica">
          <span>Abertos</span>
          <strong>{metricas?.abertos ?? "-"}</strong>
        </article>

        <article className="card-metrica">
          <span>Em atendimento</span>
          <strong>{metricas?.emAtendimento ?? "-"}</strong>
        </article>

        <article className="card-metrica">
          <span>Resolvidos</span>
          <strong>{metricas?.resolvidos ?? "-"}</strong>
        </article>
      </section>

      <section className="grid-principal">
        <div className="painel">
          <div className="cabecalho-painel">
            <div>
              <h2>Chamados</h2>
              <p>Visualize e acompanhe os atendimentos cadastrados.</p>
            </div>

            <select
              value={filtroStatus}
              onChange={(evento) =>
                setFiltroStatus(evento.target.value as "TODOS" | StatusChamado)
              }
            >
              <option value="TODOS">Todos</option>
              <option value="ABERTO">Abertos</option>
              <option value="EM_ATENDIMENTO">Em atendimento</option>
              <option value="RESOLVIDO">Resolvidos</option>
            </select>
          </div>

          <div className="lista-chamados">
            {chamados.map((chamado) => (
              <article key={chamado.id} className="card-chamado">
                <div className="linha-card">
                  <h3>#{chamado.id} - {chamado.titulo}</h3>
                  <span className={`status ${chamado.status.toLowerCase()}`}>
                    {chamado.status.replace("_", " ")}
                  </span>
                </div>

                <p>{chamado.descricao}</p>

                <div className="detalhes">
                  <span>Categoria: {chamado.categoria}</span>
                  <span>Prioridade: {chamado.prioridade}</span>
                  <span>Solicitante: {chamado.nomeSolicitante}</span>
                </div>

                <div className="acoes-status">
                  <button onClick={() => aoAtualizarStatus(chamado.id, "ABERTO")}>
                    Aberto
                  </button>
                  <button onClick={() => aoAtualizarStatus(chamado.id, "EM_ATENDIMENTO")}>
                    Em atendimento
                  </button>
                  <button onClick={() => aoAtualizarStatus(chamado.id, "RESOLVIDO")}>
                    Resolvido
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="coluna-lateral">
          <section className="painel">
            <h2>Novo chamado</h2>
            <p>Cadastre manualmente ou use a sugestão gerada pelo chatbot.</p>

            <form onSubmit={aoCriarChamado} className="formulario">
              <label>
                Título
                <input
                  value={novoChamado.titulo}
                  onChange={(evento) => alterarCampoChamado("titulo", evento.target.value)}
                  required
                />
              </label>

              <label>
                Descrição
                <textarea
                  value={novoChamado.descricao}
                  onChange={(evento) => alterarCampoChamado("descricao", evento.target.value)}
                  required
                />
              </label>

              <label>
                Categoria
                <input
                  value={novoChamado.categoria}
                  onChange={(evento) => alterarCampoChamado("categoria", evento.target.value)}
                  required
                />
              </label>

              <label>
                Prioridade
                <select
                  value={novoChamado.prioridade}
                  onChange={(evento) =>
                    alterarCampoChamado("prioridade", evento.target.value as PrioridadeChamado)
                  }
                >
                  <option value="BAIXA">Baixa</option>
                  <option value="MEDIA">Média</option>
                  <option value="ALTA">Alta</option>
                </select>
              </label>

              <label>
                Nome do solicitante
                <input
                  value={novoChamado.nomeSolicitante}
                  onChange={(evento) =>
                    alterarCampoChamado("nomeSolicitante", evento.target.value)
                  }
                  required
                />
              </label>

              <button type="submit" disabled={carregando}>
                {carregando ? "Salvando..." : "Criar chamado"}
              </button>
            </form>
          </section>

          <section className="painel">
            <h2>Chatbot de triagem</h2>
            <p>Descreva o problema e receba uma sugestão automática.</p>

            <form onSubmit={aoEnviarMensagemChatbot} className="formulario">
              <label>
                Mensagem do usuário
                <textarea
                  value={mensagemChatbot}
                  onChange={(evento) => setMensagemChatbot(evento.target.value)}
                  placeholder="Ex.: Não consigo acessar o sistema com minha senha."
                  required
                />
              </label>

              <button type="submit" disabled={carregando}>
                {carregando ? "Analisando..." : "Enviar para o chatbot"}
              </button>
            </form>

            {respostaChatbot && (
              <div className="resposta-chatbot">
                <h3>Resposta do chatbot</h3>
                <p>{respostaChatbot.resposta}</p>

                <div className="detalhes">
                  <span>Categoria: {respostaChatbot.categoriaSugerida}</span>
                  <span>Prioridade: {respostaChatbot.prioridadeSugerida}</span>
                  <span>
                    Abrir chamado: {respostaChatbot.deveAbrirChamado ? "Sim" : "Não"}
                  </span>
                </div>
              </div>
            )}
          </section>
        </aside>
      </section>
    </main>
  );
}

export default App;