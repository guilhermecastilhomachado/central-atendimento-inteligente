import type { MetricasChamados } from "../services/api";

interface Props {
  metricas: MetricasChamados | null;
}

const CARTOES: Array<{ rotulo: string; campo: keyof MetricasChamados }> = [
  { rotulo: "Total", campo: "total" },
  { rotulo: "Abertos", campo: "abertos" },
  { rotulo: "Em atendimento", campo: "emAtendimento" },
  { rotulo: "Resolvidos", campo: "resolvidos" },
];

/**
 * Cartões com a contagem de chamados por status.
 *
 * A lista de cartões é derivada de um array em vez de escrita quatro vezes no
 * JSX: acrescentar uma métrica nova passa a ser uma linha, e não um bloco
 * copiado e colado.
 */
export function PainelMetricas({ metricas }: Props) {
  return (
    <section className="metricas">
      {CARTOES.map(({ rotulo, campo }) => (
        <article key={campo} className="card-metrica">
          <span>{rotulo}</span>
          <strong>{metricas?.[campo] ?? "-"}</strong>
        </article>
      ))}
    </section>
  );
}
