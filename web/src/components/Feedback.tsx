import type { TipoFeedback } from "../hooks/useFeedback";

interface Props {
  mensagem: string;
  tipo: TipoFeedback;
}

/**
 * Faixa de mensagem temporária.
 *
 * `role="status"` faz leitores de tela anunciarem a mensagem quando ela
 * aparece, sem tirar o foco de onde o usuário está. É o que garante que o
 * retorno visual também exista para quem não enxerga a tela.
 */
export function Feedback({ mensagem, tipo }: Props) {
  return (
    <div className={`feedback feedback-${tipo}`} role="status" aria-live="polite">
      {mensagem}
    </div>
  );
}
