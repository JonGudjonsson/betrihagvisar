import type { EChartsCoreOption } from "echarts/core";
import type { FigureDefinition, Frequency } from "../types";
import type { ComputedSeries, ComputedView } from "./transforms";
import { formatAxisNumber, formatNumber, formatPeriod, formatPeriodShort, monthShort } from "./format";

/* Colours and type follow the printed Hagvísar report. */
const TEXT = "#231F20";
const MUTED = "#6D6E71";
const AXIS = "#939598";
const GRID = "#B9BBBD";
const ZERO = "#6D6E71";
const FONT = "'Open Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";

export interface BuildOptions {
  detailed: boolean;
  animate: boolean;
  /** Font for chart text; the PDF export passes the font it has embedded. */
  fontFamily?: string;
}

export function valueSuffix(unit: string): string {
  return /\(%\)|^%/.test(unit.trim()) ? "%" : "";
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type TooltipParam = { seriesName: string; value: any; color: string; axisValue?: any; data?: any; seriesId?: string };

function swatch(color: string) {
  return `<span class="hv-tt__sw" style="background:${color}"></span>`;
}

function tooltipTable(title: string, rows: { name: string; color: string; value: string }[]) {
  const body = rows
    .map((r) => `<tr><td>${swatch(r.color)}${escapeHtml(r.name)}</td><td class="hv-tt__v">${r.value}</td></tr>`)
    .join("");
  return `<div class="hv-tt"><div class="hv-tt__title">${escapeHtml(title)}</div><table>${body}</table></div>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
}

const baseTooltip = {
  backgroundColor: "#FFFFFF",
  borderColor: "#D9DBDD",
  borderWidth: 1,
  padding: [8, 10],
  textStyle: { color: TEXT, fontFamily: FONT, fontSize: 12 },
  extraCssText: "box-shadow:0 2px 8px rgba(35,31,32,0.08);border-radius:4px;",
  confine: true,
  transitionDuration: 0.1,
};

/** Year ticks as in the report ('04, '06 …) when the span is long; full years otherwise. */
function yearLabel(y: number, shortYears: boolean) {
  return shortYears ? `'${String(y).slice(2)}` : String(y);
}

function timeAxisLabel(value: number, shortYears: boolean) {
  const d = new Date(value);
  if (d.getMonth() === 0 && d.getDate() === 1) return yearLabel(d.getFullYear(), shortYears);
  if (d.getDate() === 1) return monthShort(d.getMonth());
  return `${d.getDate()}. ${monthShort(d.getMonth())}`;
}

function categoryInterval(ts: number[], freq: Frequency, detailed: boolean) {
  const n = ts.length;
  const years = n ? (ts[n - 1] - ts[0]) / (365.25 * 86_400_000) : 0;
  const maxLabels = detailed ? 12 : 7;
  if (freq === "annual") {
    const step = Math.max(1, Math.ceil(n / maxLabels));
    return (index: number) => index % step === 0;
  }
  if ((freq === "monthly" && n <= 18) || (freq === "quarterly" && n <= 8)) return "auto";
  const step = Math.max(1, Math.ceil(years / maxLabels));
  return (_: number, value: string) => {
    const d = new Date(Number(value));
    return d.getMonth() === 0 && d.getFullYear() % step === 0;
  };
}

/** Series options shared by time and category charts. */
function seriesOption(
  fig: FigureDefinition,
  s: ComputedSeries,
  i: number,
  data: unknown[],
  ctx: { hasRight: boolean; detailed: boolean; many: number; daily: boolean },
): Record<string, unknown> {
  const kind = s.def.kind ?? (fig.chartType === "table" ? "line" : fig.chartType);
  const color = s.color;
  const common: Record<string, unknown> = {
    name: s.def.name,
    id: s.def.id,
    data,
    yAxisIndex: ctx.hasRight && s.def.axis === "right" ? 1 : 0,
    emphasis: { disabled: true },
  };
  if (kind === "bar") {
    return {
      ...common,
      type: "bar",
      stack: s.def.stack,
      z: 2,
      itemStyle: { color },
      barMaxWidth: 28,
      barGap: fig.barOverlap ? "-100%" : "8%",
      barCategoryGap: ctx.many > 60 ? "12%" : "28%",
      large: ctx.many > 600,
    };
  }
  if (kind === "scatter") {
    return { ...common, type: "scatter", z: 6, symbol: "circle", symbolSize: ctx.detailed ? 7 : 5, itemStyle: { color } };
  }
  const area = kind === "area";
  return {
    ...common,
    type: "line",
    // unstacked areas: smaller (earlier) series drawn over larger ones
    z: area ? (s.def.stack ? 3 : 4 - i * 0.01) : 5,
    stack: area ? s.def.stack : undefined,
    step: s.def.step ? "end" : undefined,
    showSymbol: !!s.def.markers,
    symbol: "circle",
    symbolSize: s.def.markers ? 5 : 6,
    connectNulls: !!s.def.markers,
    sampling: ctx.daily ? "lttb" : undefined,
    lineStyle: {
      color,
      width: area ? (color === "transparent" ? 0 : 0.6) : s.def.reference ? 1.3 : ctx.detailed ? 2 : 1.6,
      type: s.def.dashed ? [5, 3] : "solid",
    },
    itemStyle: { color },
    areaStyle: area ? { color, opacity: 1 } : undefined,
  };
}

const shareCache = new WeakMap<FigureDefinition, boolean>();

/**
 * Stacked parts that always add up to 100 (shares of a total, e.g. IX-5, IX-6):
 * the left axis is then pinned to 0–100. Checked on the full data, so hiding a series
 * in the spotlight keeps the scale.
 */
export function isShareOfTotal(fig: FigureDefinition): boolean {
  const hit = shareCache.get(fig);
  if (hit !== undefined) return hit;
  const parts = fig.series.filter((s) => s.stack && (s.kind === "bar" || s.kind === "area") && s.axis !== "right");
  const cols = parts.map((s) => (fig.xType === "category" ? s.values ?? [] : (s.data ?? []).map((p) => p.v)));
  let rows = 0;
  let hits = 0;
  let negative = false;
  const n = Math.max(0, ...cols.map((c) => c.length));
  for (let i = 0; i < n && !negative; i++) {
    const vals = cols.map((c) => c[i]).filter((v): v is number => v != null);
    if (!vals.length) continue;
    negative = vals.some((v) => v < -0.01);
    rows++;
    if (Math.abs(vals.reduce((a, b) => a + b, 0) - 100) <= 1.5) hits++;
  }
  const res = parts.length > 1 && !negative && rows > 1 && hits / rows >= 0.95;
  shareCache.set(fig, res);
  return res;
}

function valueAxes(fig: FigureDefinition, cv: ComputedView, hasRight: boolean, o: BuildOptions, fontSize: number) {
  const axisLabel = { color: MUTED, fontSize, fontFamily: o.fontFamily ?? FONT };
  const forcesZero = (side: "left" | "right") =>
    cv.series.some((s) => (s.def.axis ?? "left") === side && (s.def.kind === "bar" || (s.def.kind === "area" && !!s.def.stack)));
  const base = {
    type: "value",
    splitNumber: o.detailed ? 6 : 5,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { ...axisLabel, formatter: (v: number) => formatAxisNumber(v) },
  };
  const left = {
    ...base,
    scale: !forcesZero("left") && !fig.zeroBased,
    ...(isShareOfTotal(fig) ? { min: 0, max: 100, scale: false } : {}),
    splitLine: { lineStyle: { color: GRID, type: [3, 3], width: 0.8 } },
  };
  if (!hasRight) return [left];
  return [
    left,
    {
      ...base,
      position: "right",
      scale: !forcesZero("right"),
      inverse: !!fig.inverseRight,
      alignTicks: true,
      splitLine: { show: false },
    },
  ];
}

export function buildOption(fig: FigureDefinition, cv: ComputedView, o: BuildOptions): EChartsCoreOption {
  const suffix = valueSuffix(cv.unit);
  const fontSize = o.detailed ? 12 : 11;
  const font = o.fontFamily ?? FONT;
  const anim = o.animate
    ? { animation: true, animationDuration: 0, animationDurationUpdate: 220, animationEasingUpdate: "cubicOut" as const }
    : { animation: false };
  const axisLabel = { color: MUTED, fontSize, fontFamily: font };
  const hasRight = cv.series.some((s) => s.def.axis === "right") && cv.series.some((s) => s.def.axis !== "right");
  const grid = o.detailed
    ? { left: 6, right: hasRight ? 6 : 18, top: 14, bottom: 6, containLabel: true }
    : { left: 2, right: hasRight ? 2 : 10, top: 10, bottom: 2, containLabel: true };
  const yAxis = valueAxes(fig, cv, hasRight, o, fontSize);
  const quietIds = new Set(cv.series.filter((s) => s.def.noTooltip || s.color === "transparent").map((s) => s.def.id));
  const quiet = (p: TooltipParam) => !!p.seriesId && quietIds.has(p.seriesId);
  const shadow = { type: "shadow", shadowStyle: { color: "rgba(0,79,109,0.06)" } };

  /* ---------- Categorical comparison ---------- */
  if (fig.xType === "category") {
    const cats = fig.categories ?? [];
    const few = cats.length <= 12;
    const longest = Math.max(0, ...cats.map((c) => c.length));
    // Wrap short lists into the space each category gets; tilt longer lists of long names.
    const catLabel =
      !few || longest <= 6
        ? { interval: few ? 0 : "auto", hideOverlap: !few }
        : cats.length <= 8
          ? { interval: 0, width: Math.floor((o.detailed ? 860 : 480) / cats.length) - 10, overflow: "break", lineHeight: fontSize + 2 }
          : { interval: 0, rotate: 35, width: o.detailed ? 160 : 110, overflow: "truncate" };
    const anyBar = cv.series.some((s) => s.def.kind === "bar");
    const series = cv.series.map((s, i) =>
      seriesOption(fig, s, i, (s.def.values ?? []).map((v) => (v == null ? null : v)), { hasRight, detailed: o.detailed, many: cats.length, daily: false }),
    );
    return {
      ...anim,
      textStyle: { fontFamily: font },
      grid: { ...grid, bottom: few ? 4 : grid.bottom },
      tooltip: {
        ...baseTooltip,
        trigger: "axis",
        axisPointer: anyBar ? shadow : { type: "line", lineStyle: { color: AXIS, type: "dashed", width: 1 } },
        formatter: (ps: TooltipParam[]) => {
          if (!ps.length) return "";
          const rows = ps
            .filter((p) => p.value != null && !quiet(p))
            .map((p) => ({ name: p.seriesName, color: p.color, value: `${formatNumber(p.value as number)}${suffix}` }));
          return tooltipTable(String(ps[0].axisValue), rows);
        },
      },
      xAxis: {
        type: "category",
        data: cats,
        boundaryGap: anyBar || cats.length < 3,
        axisLine: { lineStyle: { color: AXIS } },
        axisTick: { show: false },
        axisLabel: { ...axisLabel, ...catLabel },
      },
      yAxis,
      series,
    };
  }

  /* ---------- Time series ---------- */
  const useCategory = cv.series.some((s) => s.def.kind === "bar");
  const allT = Array.from(new Set(cv.series.flatMap((s) => s.points.map((p) => p.t)))).sort((a, b) => a - b);
  const tIndex = new Map(allT.map((t, i) => [t, i]));
  const spanYears = allT.length ? (allT[allT.length - 1] - allT[0]) / (365.25 * 86_400_000) : 0;
  const shortYears = spanYears > 9;
  const leftNegative = cv.series.some((s) => s.def.axis !== "right" && s.points.some((p) => p.v != null && p.v < 0));
  const daily = cv.frequency === "daily";

  const series = cv.series.map((s, i) => {
    const data = useCategory
      ? (() => {
          const arr: (number | null)[] = new Array(allT.length).fill(null);
          s.points.forEach((p) => {
            const idx = tIndex.get(p.t);
            if (idx !== undefined) arr[idx] = p.v;
          });
          return arr;
        })()
      : s.points.map((p) => [p.t, p.v]);
    return seriesOption(fig, s, i, data, { hasRight, detailed: o.detailed, many: allT.length, daily });
  });
  const first = series.findIndex((s) => s.yAxisIndex === 0);
  if (leftNegative && first >= 0) {
    series[first].markLine = {
      silent: true,
      symbol: "none",
      animation: false,
      label: { show: false },
      lineStyle: { color: ZERO, width: 1, type: "solid" },
      data: [{ yAxis: 0 }],
    };
  }

  const freq = cv.frequency;
  const tooltip = {
    ...baseTooltip,
    trigger: "axis",
    axisPointer: useCategory ? shadow : { type: "line", lineStyle: { color: AXIS, type: "dashed", width: 1 } },
    formatter: (ps: TooltipParam[]) => {
      if (!ps.length) return "";
      const head = ps[0];
      const t = useCategory ? Number(head.axisValue) : (head.value as [number, number])[0];
      const rows = ps
        .map((p) => {
          const v = useCategory ? (p.value as number | null) : (p.value as [number, number | null])[1];
          if (v == null || quiet(p)) return null;
          return { name: p.seriesName, color: p.color, value: `${formatNumber(v)}${suffix}` };
        })
        .filter(Boolean) as { name: string; color: string; value: string }[];
      return tooltipTable(formatPeriod(t, freq), rows);
    },
  };

  const xAxis = useCategory
    ? {
        type: "category",
        data: allT.map(String),
        axisLine: { lineStyle: { color: AXIS } },
        axisTick: { show: false },
        axisLabel: {
          ...axisLabel,
          interval: categoryInterval(allT, freq, o.detailed),
          formatter: (v: string) => {
            const d = new Date(Number(v));
            return freq === "annual" || d.getMonth() === 0 ? yearLabel(d.getFullYear(), shortYears) : formatPeriodShort(Number(v), freq);
          },
          hideOverlap: true,
        },
      }
    : {
        type: "time",
        boundaryGap: false,
        splitNumber: o.detailed ? 8 : 5,
        axisLine: { lineStyle: { color: AXIS } },
        axisTick: { show: false },
        axisLabel: { ...axisLabel, hideOverlap: true, formatter: (v: number) => timeAxisLabel(v, shortYears) },
        splitLine: { show: false },
      };

  return {
    ...anim,
    textStyle: { fontFamily: font },
    grid,
    tooltip,
    xAxis,
    yAxis,
    series,
  };
}
