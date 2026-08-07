import type { Chamado, StatusChamado } from "../services/api";
import type { FiltroStatus } from "../hooks/useChamados";
import { CardChamado } from "./CardChamado";

interface Props {
  chamados: Chamado[];
  filtroStatus: FiltroStatus;
  aoTrocarFiltro: (filtro: FiltroStatus) => void;
  aoAlterarStatus: (id: number, status: StatusChamado) => void;
}

const OPCOES_FILTRO: Array<{ valor: FiltroStatus; rotulo: string }> = [
  { valor: "TODOS", rotulo: "Todos" },
  { valor: "ABERTO", rotulo: "Abertos" },
  { valor: "EM_ATENDIMENTO", rotulo: "Em atendimento" },
  { valor: "RESOLVIDO", rotulo: "Resolvidos" },
];

export function ListaChamados({
  chamados,
  filtroStatus,
  aoTrocarFiltro,
  aoAlterarStatus,
}: Props) {
  return (
    <div className="painel">
      <div className="cabecalho-painel">
        <div>
          <h2>Chamados</h2>
          <p>Visualize e acompanhe os atendimentos cadastrados.</p>
        </div>

        <select
          value={filtroStatus}
          onChange={(evento) => aoTrocarFiltro(evento.target.value as FiltroStatus)}
          aria-label="Filtrar chamados por status"
        >
          {OPCOES_FILTRO.map(({ valor, rotulo }) => (
            <option key={valor} value={valor}>
              {rotulo}
            </option>
          ))}
        </select>
      </div>

      <div className="lista-chamados">
        {/*
          Estado vazio explícito. Antes, uma lista sem resultados renderizava
          uma área em branco, indistinguível de uma falha de carregamento.
        */}
        {chamados.length === 0 ? (
          <p>Nenhum chamado encontrado para o filtro selecionado.</p>
        ) : (
          chamados.map((chamado) => (
            <CardChamado
              key={chamado.id}
              chamado={chamado}
              aoAlterarStatus={aoAlterarStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}
