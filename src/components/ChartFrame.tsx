import { useMemo } from "react";
import type { ChartView, FigureDefinition } from "../types";
import { computeView, describeFigure } from "../lib/transforms";
import { buildOption } from "../lib/chartOptions";
import { formatNumber } from "../lib/format";
import { useFigureData, useInView, useReducedMotion } from "../lib/hooks";
import { EChart } from "./EChart";

interface Props {
  figure: FigureDefinition;
  view: ChartView;
  height: number;
  detailed?: boolean;
  /** Render immediately (e.g. drag preview, spotlight). */
  eager?: boolean;
}

/** The plot region of a figure: handles loading / empty / error / table states. */
export function ChartFrame({ figure, view, height, detailed = false, eager = false }: Props) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const active = eager || inView;
  const { state, figure: full, retry } = useFigureData(figure, active && !figure.unavailable);
  const reduced = useReducedMotion();

  const cv = useMemo(() => (full ? computeView(full, view) : null), [full, view]);
  const option = useMemo(
    () => (full && cv ? buildOption(full, cv, { detailed, animate: detailed && !reduced }) : null),
    [full, cv, detailed, reduced],
  );
  const label = useMemo(() => (full && cv ? describeFigure(full, cv) : ""), [full, cv]);

  let body: React.ReactNode;
  if (figure.unavailable) {
    body = (
      <div className="chart-message chart-message--unavailable" style={{ minHeight: height }}>
        <p>{figure.unavailable}</p>
      </div>
    );
  } else if (state === "error") {
    body = (
      <div className="chart-message" style={{ minHeight: height }}>
        <p>Ekki tókst að sækja gögn.</p>
        <button type="button" className="btn btn--text" onClick={retry}>
          Reyna aftur
        </button>
      </div>
    );
  } else if (!active || !full || !cv || !option) {
    body = <div className="chart-skeleton" style={{ minHeight: height }} aria-label="Hleð gögnum" role="img" />;
  } else if (figure.chartType === "table" && figure.table) {
    const t = figure.table;
    body = (
      <div className="fig-table-wrap" style={{ minHeight: detailed ? undefined : height }}>
        <table className="fig-table">
          <caption className="sr-only">{label}</caption>
          <thead>
            <tr>
              {t.columns.map((c, i) => (
                <th key={c} scope="col" className={i > 0 ? "num" : undefined}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.rows.map((r, ri) => (
              <tr key={ri} className={ri === t.highlightRow ? "is-highlight" : undefined}>
                {r.map((c, ci) =>
                  ci === 0 ? (
                    <th key={ci} scope="row">
                      {c}
                    </th>
                  ) : (
                    <td key={ci} className="num">
                      {typeof c === "number" ? formatNumber(c, ci === t.columns.length - 1 ? 2 : 1) : c}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } else if (cv.empty) {
    body = (
      <div className="chart-message" style={{ minHeight: height }}>
        <p>Engin gögn fundust fyrir valið tímabil.</p>
      </div>
    );
  } else {
    body = <EChart option={option} height={height} ariaLabel={label} />;
  }

  return (
    <div ref={ref} className="chart-frame">
      {body}
    </div>
  );
}
