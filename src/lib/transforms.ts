import type { ChartView, FigureDefinition, Frequency, PeriodPreset, SeriesDefinition, TimePoint, Transform } from "../types";
import { formatNumber, formatPeriod, transformUnit, CHART_TYPE_LABEL } from "./format";
import { PALETTE, TARGET_COLOR } from "../data/figureStyles";

export const SERIES_PALETTE = PALETTE;
export const REFERENCE_COLOR = TARGET_COLOR;

const DAY = 86_400_000;

export function frequencyOptions(fig: FigureDefinition): Frequency[] {
  if (fig.xType !== "time" || fig.chartType === "table" || fig.chartType === "scatter") return [fig.frequency];
  switch (fig.frequency) {
    case "daily":
      return ["daily", "weekly", "monthly"];
    case "weekly":
      return ["weekly", "monthly"];
    case "monthly":
      return ["monthly", "quarterly", "annual"];
    case "quarterly":
      return ["quarterly", "annual"];
    case "annual":
      return ["annual"];
  }
}

export function transformOptions(fig: FigureDefinition): Transform[] {
  return fig.transforms && fig.transforms.length ? fig.transforms : ["level"];
}

export function isTimeFigure(fig: FigureDefinition) {
  return fig.xType === "time" && fig.chartType !== "table" && fig.chartType !== "scatter";
}

export function defaultView(fig: FigureDefinition): ChartView {
  return {
    period: fig.defaultPeriod,
    transform: transformOptions(fig)[0],
    frequency: fig.frequency,
    hidden: [],
  };
}

/** Colour for a series, stable regardless of visibility. */
export function seriesColor(fig: FigureDefinition, s: SeriesDefinition): string {
  if (s.color) return s.color;
  if (s.reference) return REFERENCE_COLOR;
  const idx = fig.series.filter((x) => !x.reference && !x.color).indexOf(s);
  return SERIES_PALETTE[idx % SERIES_PALETTE.length];
}

export function visibleSeriesDefs(fig: FigureDefinition, transform: Transform): SeriesDefinition[] {
  return fig.series.filter((s) => !s.showWith || s.showWith.includes(transform));
}

/* ---------------- Frequency aggregation ---------------- */

function bucketStart(t: number, f: Frequency): number {
  const d = new Date(t);
  switch (f) {
    case "weekly": {
      const day = (d.getDay() + 6) % 7; // Monday = 0
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() - day).getTime();
    }
    case "monthly":
      return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    case "quarterly":
      return new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1).getTime();
    case "annual":
      return new Date(d.getFullYear(), 0, 1).getTime();
    default:
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }
}

export function aggregate(points: TimePoint[], target: Frequency, mode: "mean" | "sum" | "last" = "mean"): TimePoint[] {
  const out: TimePoint[] = [];
  let key = NaN;
  let acc: number[] = [];
  const flush = () => {
    if (Number.isNaN(key)) return;
    let v: number | null = null;
    if (acc.length) {
      if (mode === "sum") v = acc.reduce((s, x) => s + x, 0);
      else if (mode === "last") v = acc[acc.length - 1];
      else v = acc.reduce((s, x) => s + x, 0) / acc.length;
      v = Math.round(v * 100) / 100;
    }
    out.push({ t: key, v });
  };
  for (const p of points) {
    const k = bucketStart(p.t, target);
    if (k !== key) {
      flush();
      key = k;
      acc = [];
    }
    if (p.v != null) acc.push(p.v);
  }
  flush();
  return out;
}

/* ---------------- Transformations ---------------- */

function findAtOrBefore(points: TimePoint[], t: number): number {
  let lo = 0;
  let hi = points.length - 1;
  let ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (points[mid].t <= t) {
      ans = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return ans;
}

function pct(a: number, b: number) {
  return Math.round(((a / b - 1) * 100) * 100) / 100;
}

export function applyTransform(points: TimePoint[], transform: Transform, freq: Frequency): TimePoint[] {
  if (transform === "level" || transform === "rebase") return points;
  if (transform === "pop") {
    return points.map((p, i) => {
      const prev = i > 0 ? points[i - 1].v : null;
      return { t: p.t, v: p.v != null && prev != null && prev !== 0 ? pct(p.v, prev) : null };
    });
  }
  // yoy
  const tol = freq === "daily" || freq === "weekly" ? 7 * DAY : 2 * DAY;
  return points.map((p) => {
    const d = new Date(p.t);
    const target = new Date(d.getFullYear() - 1, d.getMonth(), d.getDate()).getTime();
    const idx = findAtOrBefore(points, target);
    if (idx < 0 || p.v == null) return { t: p.t, v: null };
    const prev = points[idx];
    if (target - prev.t > tol || prev.v == null || prev.v === 0) return { t: p.t, v: null };
    return { t: p.t, v: pct(p.v, prev.v) };
  });
}

/* ---------------- Periods ---------------- */

export function parseDateInput(s?: string): number | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  if (!y) return undefined;
  return new Date(y, (m || 1) - 1, d || 1).getTime();
}

export function periodBounds(preset: PeriodPreset, lastT: number, from?: string, to?: string): [number, number] {
  const last = new Date(lastT);
  const yearsBack = (n: number) => new Date(last.getFullYear() - n, last.getMonth(), last.getDate()).getTime();
  switch (preset) {
    case "1Y":
      return [yearsBack(1), Infinity];
    case "5Y":
      return [yearsBack(5), Infinity];
    case "10Y":
      return [yearsBack(10), Infinity];
    case "custom":
      return [parseDateInput(from) ?? -Infinity, parseDateInput(to) ?? Infinity];
    default:
      return [-Infinity, Infinity];
  }
}

/* ---------------- Coverage (for catalogue filters) ---------------- */

export function figureCoverage(fig: FigureDefinition): [number, number] {
  if (fig.coverage) return fig.coverage;
  if (!isTimeFigure(fig) || fig.referenceYear) {
    const y = fig.referenceYear ?? new Date(fig.updatedAt).getFullYear();
    return [new Date(y, 0, 1).getTime(), new Date(y, 11, 31).getTime()];
  }
  let min = Infinity;
  let max = -Infinity;
  for (const s of fig.series) {
    if (s.reference || !s.data?.length) continue;
    min = Math.min(min, s.data[0].t);
    max = Math.max(max, s.data[s.data.length - 1].t);
  }
  return [min, max];
}

export function lastObservation(fig: FigureDefinition): number {
  return figureCoverage(fig)[1];
}

/* ---------------- Computed view ---------------- */

export interface ComputedSeries {
  def: SeriesDefinition;
  color: string;
  points: TimePoint[];
}

export interface ComputedView {
  series: ComputedSeries[];
  unit: string;
  frequency: Frequency;
  start: number;
  end: number;
  empty: boolean;
}

const cache = new Map<string, ComputedView>();

export function computeView(fig: FigureDefinition, view: ChartView): ComputedView {
  const key = `${fig.id}|${fig.loaded ? 1 : 0}|${view.period}|${view.from ?? ""}|${view.to ?? ""}|${view.transform}|${view.frequency}|${view.hidden.join(",")}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const freq = view.frequency;
  const unit = transformUnit(view.transform, freq, fig.unit, fig.transformLabels?.[view.transform]);
  const defs = visibleSeriesDefs(fig, view.transform);

  if (!isTimeFigure(fig)) {
    const res: ComputedView = {
      series: defs.filter((d) => !view.hidden.includes(d.id)).map((def) => ({ def, color: seriesColor(fig, def), points: [] })),
      unit: fig.unit,
      frequency: freq,
      start: -Infinity,
      end: Infinity,
      empty: false,
    };
    cache.set(key, res);
    return res;
  }

  const prepared = defs.map((def) => {
    let pts = def.data ?? [];
    if (freq !== fig.frequency) pts = aggregate(pts, freq, def.reference ? "mean" : fig.aggregate ?? "mean");
    if (!def.reference) pts = applyTransform(pts, view.transform, freq);
    return { def, pts };
  });

  let lastT = -Infinity;
  for (const p of prepared) {
    if (p.def.reference) continue;
    for (let i = p.pts.length - 1; i >= 0; i--) {
      if (p.pts[i].v != null) {
        lastT = Math.max(lastT, p.pts[i].t);
        break;
      }
    }
  }
  const [start, end] = periodBounds(view.period, lastT, view.from, view.to);

  const series: ComputedSeries[] = prepared
    .filter((p) => !view.hidden.includes(p.def.id))
    .map(({ def, pts }) => {
      let points = pts.filter((p) => p.t >= start && p.t <= end && p.t <= lastT);
      // trim leading nulls (e.g. YoY needs a year of history)
      const firstIdx = points.findIndex((p) => p.v != null);
      points = firstIdx < 0 ? [] : points.slice(firstIdx);
      if (view.transform === "rebase" && !def.reference) {
        const base = points.find((p) => p.v != null)?.v;
        if (base) points = points.map((p) => ({ t: p.t, v: p.v == null ? null : Math.round((p.v / base) * 10000) / 100 }));
      }
      return { def, color: seriesColor(fig, def), points };
    })
    // reference lines alone don't make a chart
    .filter((s) => !(s.def.reference && view.transform === "rebase"));

  const empty = series.filter((s) => !s.def.reference).every((s) => s.points.length === 0);
  const res: ComputedView = { series, unit, frequency: freq, start, end, empty };
  if (cache.size > 400) cache.clear();
  cache.set(key, res);
  return res;
}

/* ---------------- Accessibility summary ---------------- */

export function describeFigure(fig: FigureDefinition, cv: ComputedView): string {
  const type = CHART_TYPE_LABEL[fig.chartType];
  if (fig.chartType === "table" && fig.table) {
    return `${type}: ${fig.title}. ${fig.table.rows.length} raðir, dálkar: ${fig.table.columns.join(", ")}.`;
  }
  if (fig.chartType === "scatter") {
    const pts = fig.series.flatMap((s) => s.points ?? []);
    return `${type}: ${fig.title}. ${pts.length} lönd. ${fig.axisLabels?.x ?? ""} á láréttum ás, ${fig.axisLabels?.y ?? ""} á lóðréttum ás.`;
  }
  if (fig.xType === "category") {
    const s = fig.series[0];
    const pairs = (fig.categories ?? []).map((c, i) => `${c} ${formatNumber(s.values?.[i] ?? null)}`);
    return `${type}: ${fig.title}, ${fig.unit}. ${pairs.join("; ")}.`;
  }
  const parts = cv.series
    .filter((s) => !s.def.reference)
    .map((s) => {
      const last = [...s.points].reverse().find((p) => p.v != null);
      return last ? `${s.def.name} ${formatNumber(last.v)} (${formatPeriod(last.t, cv.frequency)})` : null;
    })
    .filter(Boolean);
  return `${type}: ${fig.title}, ${cv.unit}. Nýjustu gildi: ${parts.join("; ")}.`;
}
