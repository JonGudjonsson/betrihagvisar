/* ------------------------------------------------------------------ */
/*  Core domain types for Hagvísar                                     */
/* ------------------------------------------------------------------ */

export type Frequency = "daily" | "weekly" | "monthly" | "quarterly" | "annual";
export type ChartType = "line" | "bar" | "area" | "scatter" | "table";
export type Transform = "level" | "yoy" | "pop" | "rebase";
export type PeriodPreset = "1Y" | "5Y" | "10Y" | "all" | "custom";

/** A time-series observation: local-time timestamp (ms) and value. */
export interface TimePoint {
  t: number;
  v: number | null;
}

export interface ScatterPoint {
  x: number;
  y: number;
  label: string;
}

export interface SeriesDefinition {
  id: string;
  name: string;
  /** Override render kind (e.g. a line on top of stacked bars). */
  kind?: "line" | "bar" | "area" | "scatter";
  /** Value axis; "right" uses the figure's second axis (unitRight). */
  axis?: "left" | "right";
  /** Helper series drawn in the chart but left out of the legend (e.g. negative halves of stacked bars). */
  hideInLegend?: boolean;
  /** Draw point markers on a line. */
  markers?: boolean;
  /** Left out of tooltips (pieces of a band whose values only make sense together). */
  noTooltip?: boolean;
  /** Reference series (targets, minimums) are dashed and never transformed. */
  reference?: boolean;
  /** Only show the series with these transforms (e.g. inflation target only for YoY). */
  showWith?: Transform[];
  color?: string;
  dashed?: boolean;
  stack?: string;
  step?: boolean;
  data?: TimePoint[];
  /** For category charts: one value per category. */
  values?: (number | null)[];
  /** For scatter charts. */
  points?: ScatterPoint[];
  /** Highlight indices in category charts (e.g. Iceland). */
  highlight?: number[];
}

export interface TableData {
  columns: string[];
  rows: (string | number | null)[][];
  /** Row index to emphasise. */
  highlightRow?: number;
}

export interface FigureDefinition {
  id: string; // "I-1"
  slug: string;
  chapterId: string; // "I"
  title: string;
  subtitle?: string;
  /** Unit label for the stored data ("level"). */
  unit: string;
  /** Unit of the right-hand axis, when the figure has one. */
  unitRight?: string;
  /** Invert the right-hand axis (e.g. exchange rate where up means stronger). */
  inverseRight?: boolean;
  /** "Nýjast: 24. september 2026" for daily and weekly figures. */
  latest?: string;
  /** Set when the source publishes the figure without data (licensed data). */
  unavailable?: string;
  /** First and last observation (ms), known before the data itself is loaded. */
  coverage?: [number, number];
  /** True once the series values have been fetched. */
  loaded?: boolean;
  /** Bars drawn over each other rather than side by side. */
  barOverlap?: boolean;
  frequency: Frequency;
  chartType: ChartType;
  /** "time" = time axis; "category" = categorical comparison; "value" = scatter. */
  xType: "time" | "category" | "value";
  categories?: string[];
  horizontal?: boolean;
  tags: string[];
  sources: string[];
  note?: string;
  series: SeriesDefinition[];
  table?: TableData;
  /** Transforms the figure supports; first is the default. */
  transforms?: Transform[];
  /** Override label per transform (e.g. yoy → "12 mánaða breyting (%)"). */
  transformLabels?: Partial<Record<Transform, string>>;
  defaultPeriod: Exclude<PeriodPreset, "custom">;
  /** Axis labels for scatter charts. */
  axisLabels?: { x: string; y: string };
  /** Snapshot reference year for non-time figures. */
  referenceYear?: number;
  updatedAt: string; // ISO date
  /** How values combine when the frequency is lowered (default: mean). */
  aggregate?: "mean" | "sum" | "last";
  /** Start y-axis at zero (default for bars). */
  zeroBased?: boolean;
}

export interface Chapter {
  id: string; // "I"
  number: number;
  title: string;
  shortTitle: string;
  description: string;
}

/* ---------------- Personalisation ---------------- */

export interface UserIdentity {
  id: string;
  name: string;
  email: string;
  /** Masked national id for display only. */
  maskedId: string;
  initials: string;
  description: string;
}

export interface FigureSet {
  id: string;
  name: string;
  figureIds: string[]; // order is significant
  spotlightFigureId?: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  setId: string;
  enabled: boolean;
  scope: "all" | "selected";
  figureIds: string[];
  frequency: "immediate" | "daily" | "weekly";
  email: string;
}

/* ---------------- Browsing ---------------- */

export interface FigureFilters {
  query: string;
  chapters: string[];
  period: PeriodPreset | null;
  from?: string;
  to?: string;
  frequencies: Frequency[];
  chartTypes: ChartType[];
  sources: string[];
}

export type SortKey = "order" | "updated" | "title";

/** View state for a rendered chart. */
export interface ChartView {
  period: PeriodPreset;
  from?: string; // yyyy-mm-dd
  to?: string;
  transform: Transform;
  frequency: Frequency;
  hidden: string[];
}
