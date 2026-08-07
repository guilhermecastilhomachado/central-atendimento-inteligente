import type { FormEvent } from "react";
import type { NovoChamado, PrioridadeChamado } from "../services/api";

interface Props {
  valores: NovoChamado;
  carregando: boolean;
  aoAlterarCampo: <C extends keyof NovoChamado>(campo: C, valor: NovoChamado[C]) => void;
  aoEnviar: () => void;
}

const PRIORIDADES: Array<{ valor: PrioridadeChamado; rotulo: string }> = [
  { valor: "BAIXA", rotulo: "Baixa" },
  { valor: "MEDIA", rotulo: "Média" },
  { valor: "ALTA", rotulo: "Alta" },
];

export function FormularioChamado({ valores, carregando, aoAlterarCampo, aoEnviar }: Props) {
  function submeter(evento: FormEvent) {
    evento.preventDefault();
    aoEnviar();
  }

  return (
    <section className="painel">
      <h2>Novo chamado</h2>
      <p>Cadastre manualmente ou use a sugestão gerada pelo chatbot.</p>

      <form onSubmit={submeter} className="formulario">
        <label>
          Título
          <input
            value={valores.titulo}
            onChange={(evento) => aoAlterarCampo("titulo", evento.target.value)}
            // Os limites espelham o schema Zod da API. Validar também no
            // navegador evita uma ida ao servidor para descobrir algo que já
            // dava para saber aqui — mas a validação do servidor continua
            // sendo a que vale, porque a do navegador é contornável.
            minLength={3}
            maxLength={120}
            required
          />
        </label>

        <label>
          Descrição
          <textarea
            value={valores.descricao}
            onChange={(evento) => aoAlterarCampo("descricao", evento.target.value)}
            minLength={5}
            maxLength={2000}
            required
          />
        </label>

        <label>
          Categoria
          <input
            value={valores.categoria}
            onChange={(evento) => aoAlterarCampo("categoria", evento.target.value)}
            minLength={2}
            maxLength={60}
            required
          />
        </label>

        <label>
          Prioridade
          <select
            value={valores.prioridade}
            onChange={(evento) =>
              aoAlterarCampo("prioridade", evento.target.value as PrioridadeChamado)
            }
          >
            {PRIORIDADES.map(({ valor, rotulo }) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        </label>

        <label>
          Nome do solicitante
          <input
            value={valores.nomeSolicitante}
            onChange={(evento) => aoAlterarCampo("nomeSolicitante", evento.target.value)}
            minLength={2}
            maxLength={120}
            required
          />
        </label>

        <button type="submit" disabled={carregando}>
          {carregando ? "Salvando..." : "Criar chamado"}
        </button>
      </form>
    </section>
  );
}
