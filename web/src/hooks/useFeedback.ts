import { useCallback, useEffect, useRef, useState } from "react";

export type TipoFeedback = "sucesso" | "erro" | "info";

interface Feedback {
  mensagem: string;
  tipo: TipoFeedback;
}

/**
 * Controla a mensagem temporária de feedback exibida ao usuário.
 *
 * Cuidado que a versão anterior não tinha: o identificador do temporizador é
 * guardado em uma ref e cancelado antes de agendar o próximo. Sem isso, duas
 * ações em sequência compartilhavam o mesmo relógio e a segunda mensagem
 * desaparecia no tempo restante da primeira.
 */
export function useFeedback(duracaoMs = 4000) {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const temporizador = useRef<number | null>(null);

  const exibirFeedback = useCallback(
    (mensagem: string, tipo: TipoFeedback = "info") => {
      if (temporizador.current !== null) {
        window.clearTimeout(temporizador.current);
      }

      setFeedback({ mensagem, tipo });

      temporizador.current = window.setTimeout(() => {
        setFeedback(null);
        temporizador.current = null;
      }, duracaoMs);
    },
    [duracaoMs]
  );

  // Cancela o temporizador se o componente sair da tela antes de ele disparar,
  // evitando atualizar o estado de algo que não existe mais.
  useEffect(() => {
    return () => {
      if (temporizador.current !== null) {
        window.clearTimeout(temporizador.current);
      }
    };
  }, []);

  return { feedback, exibirFeedback };
}
