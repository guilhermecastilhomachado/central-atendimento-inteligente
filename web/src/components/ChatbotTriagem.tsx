import { useState } from "react";
import type { FormEvent } from "react";
import { enviarMensagemChatbot } from "../services/api";
import type { RespostaChatbot } from "../services/api";

interface Props {
  aoReceberSugestao: (sugestao: RespostaChatbot) => void;
  aoNotificar: (mensagem: string, tipo: "sucesso" | "erro" | "info") => void;
}

/**
 * Caixa de triagem.
 *
 * Diferente dos demais componentes, este chama a API diretamente: a mensagem
 * digitada não interessa a mais ninguém na tela, então mantê-la aqui evita
 * carregar o componente pai com um estado que só este trecho usa. O resultado,
 * sim, sobe — porque o formulário de chamado precisa dele.
 */
export function ChatbotTriagem({ aoReceberSugestao, aoNotificar }: Props) {
  const [mensagem, setMensagem] = useState("");
  const [resposta, setResposta] = useState<RespostaChatbot | null>(null);
  const [analisando, setAnalisando] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();

    if (!mensagem.trim()) {
      aoNotificar("Digite uma mensagem antes de enviar para o chatbot.", "info");
      return;
    }

    setAnalisando(true);

    try {
      const sugestao = await enviarMensagemChatbot(mensagem);

      setResposta(sugestao);
      aoNotificar("Sugestão do chatbot gerada com sucesso.", "sucesso");

      if (sugestao.deveAbrirChamado) {
        aoReceberSugestao(sugestao);
      }
    } catch {
      aoNotificar("Não foi possível consultar o chatbot.", "erro");
    } finally {
      setAnalisando(false);
    }
  }

  return (
    <section className="painel">
      <h2>Chatbot de triagem</h2>
      <p>Descreva o problema e receba uma sugestão automática.</p>

      <form onSubmit={enviar} className="formulario">
        <label>
          Mensagem do usuário
          <textarea
            value={mensagem}
            onChange={(evento) => setMensagem(evento.target.value)}
            placeholder="Ex.: Não consigo acessar o sistema com minha senha."
            maxLength={1000}
            required
          />
        </label>

        <button type="submit" disabled={analisando}>
          {analisando ? "Analisando..." : "Enviar para o chatbot"}
        </button>
      </form>

      {resposta && (
        <div className="resposta-chatbot">
          <h3>Resposta do chatbot</h3>
          <p>{resposta.resposta}</p>

          <div className="detalhes">
            <span>Categoria: {resposta.categoriaSugerida}</span>
            <span>Prioridade: {resposta.prioridadeSugerida}</span>
            <span>Abrir chamado: {resposta.deveAbrirChamado ? "Sim" : "Não"}</span>
          </div>
        </div>
      )}
    </section>
  );
}
