import { useMemo } from "react";
import type { FigureDefinition } from "../types";
import { computeView, defaultView } from "../lib/transforms";
import { useFigureData, useInView } from "../lib/hooks";

/** Tiny, non-interactive preview used in set lists and the add-figure drawer. */
export function Sparkline({ figure, width = 120, height = 40 }: { figure: FigureDefinition; width?: number; height?: number }) {
  const [ref, inView] = useInView<SVGSVGElement>();
  const { figure: full } = useFigureData(figure, inView);

  const content = useMemo(() => {
    if (!full) return null;
    const pad = 2;
    if (full.xType === "category") {
      const s = full.series.find((x) => !x.hideInLegend) ?? full.series[0];
      const vals = (s?.values ?? []).map((v) => v ?? 0);
      const max = Math.max(...vals.map(Math.abs), 1);
      const bw = (width - 2 * pad) / Math.max(1, vals.length);
      return vals.map((v, i) => {
        const h = (Math.abs(v) / max) * (height - 2 * pad);
        return <rect key={i} x={pad + i * bw + 1} y={height - pad - h} width={Math.max(1, bw - 2)} height={h} fill={s.color ?? "#004F6D"} />;
      });
    }
    const cv = computeView(full, defaultView(full));
    const series = cv.series.filter((s) => !s.def.reference && !s.def.hideInLegend && s.color !== "transparent").slice(0, 3);
    const all = series.flatMap((s) => s.points.map((p) => p.v)).filter((v): v is number => v != null);
    if (!all.length) return null;
    const t0 = Math.min(...series.map((s) => s.points[0]?.t ?? Infinity));
    const t1 = Math.max(...series.map((s) => s.points[s.points.length - 1]?.t ?? -Infinity));
    const v0 = Math.min(...all, full.zeroBased ? 0 : Infinity);
    const v1 = Math.max(...all);
    const x = (t: number) => pad + ((t - t0) / (t1 - t0 || 1)) * (width - 2 * pad);
    const y = (v: number) => height - pad - ((v - v0) / (v1 - v0 || 1)) * (height - 2 * pad);
    return series.map((s) => {
      const step = Math.max(1, Math.floor(s.points.length / 80));
      const d = s.points
        .filter((_, i) => i % step === 0 || i === s.points.length - 1)
        .filter((p) => p.v != null)
        .map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)},${y(p.v as number).toFixed(1)}`)
        .join("");
      return <path key={s.def.id} d={d} fill="none" stroke={s.color} strokeWidth={1.3} />;
    });
  }, [full, width, height]);

  return (
    <svg ref={ref} className="sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
      {content}
    </svg>
  );
}
