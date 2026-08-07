import type { Chamado, StatusChamado } from "../services/api";

interface Props {
  chamado: Chamado;
  aoAlterarStatus: (id: number, status: StatusChamado) => void;
}

const ACOES: Array<{ status: StatusChamado; rotulo: string }> = [
  { status: "ABERTO", rotulo: "Aberto" },
  { status: "EM_ATENDIMENTO", rotulo: "Em atendimento" },
  { status: "RESOLVIDO", rotulo: "Resolvido" },
];

/**
 * Cartão de um chamado individual.
 *
 * O componente não conhece a API: ele recebe o chamado pronto e avisa o pai
 * quando um botão é acionado. Essa separação entre "componente que mostra" e
 * "componente que busca" é o que permite renderizar este cartão em qualquer
 * contexto — inclusive em um teste, com um objeto fixo.
 */
export function CardChamado({ chamado, aoAlterarStatus }: Props) {
  const statusLegivel = chamado.status.replace("_", " ");

  return (
    <article className="card-chamado">
      <div className="linha-card">
        <h3>
          #{chamado.id} - {chamado.titulo}
        </h3>
        <span className={`status ${chamado.status.toLowerCase()}`}>{statusLegivel}</span>
      </div>

      <p>{chamado.descricao}</p>

      <div className="detalhes">
        <span>Categoria: {chamado.categoria}</span>
        <span>Prioridade: {chamado.prioridade}</span>
        <span>Solicitante: {chamado.nomeSolicitante}</span>
      </div>

      <div className="acoes-status">
        {ACOES.map(({ status, rotulo }) => (
          <button
            key={status}
            type="button"
            onClick={() => aoAlterarStatus(chamado.id, status)}
            // Desabilita a ação que levaria o chamado ao estado em que ele já
            // está: prevenir o erro é melhor do que avisar depois que ocorreu.
            disabled={chamado.status === status}
            aria-label={`Marcar chamado ${chamado.id} como ${rotulo}`}
          >
            {rotulo}
          </button>
        ))}
      </div>
    </article>
  );
}
