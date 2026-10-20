/* ------------------------------------------------------------------ */
/*  How each figure is drawn. The xlsx workbooks carry only data, so  */
/*  chart types, stacking and colours are taken from the printed      */
/*  report (docs/HV_desember 2022.pdf). Series are referred to by     */
/*  their position in the workbook. Figures without an entry get the  */
/*  defaults in applyStyle().                                         */
/* ------------------------------------------------------------------ */

import type { ChartType, FigureDefinition, SeriesDefinition } from "../types";

/** The report's chart palette (sRGB from the PDF). */
export const PALETTE = ["#004F6D", "#F37425", "#94AFBE", "#921A1D", "#FFD100", "#0F9277", "#86C550", "#6D6E71", "#7B5EA7", "#5FB3CE", "#C9A227", "#D98C8C"];
export const TARGET_COLOR = "#921A1D";
const BAND = "#8FC5E0";
const PURPLE = "#7B5EA7";

export interface FigureStyle {
  /** Kind for every series not listed in bars/lines/areas/points. */
  type?: "line" | "bar" | "area";
  bars?: number[];
  lines?: number[];
  areas?: number[];
  /** Drawn as markers only (quarterly points on an annual chart, survey readings). */
  points?: number[];
  /** Stack all bars/areas (true) or only the listed series. */
  stack?: boolean | number[];
  /** Bars drawn on top of each other instead of side by side. */
  overlap?: boolean;
  dashed?: number[];
  step?: boolean;
  markers?: number[];
  /** Palette index or CSS colour per series; "none" draws nothing (base of a band). */
  colors?: Record<number, number | string>;
  /** Series moved to the right-hand axis. */
  right?: number[];
  unitRight?: string;
  /** Kept in the chart, left out of the legend. */
  hide?: number[];
  /** Left out entirely. */
  drop?: number[];
  /** Left out of tooltips. */
  quiet?: number[];
  rename?: Record<number, string>;
  /** Strip this prefix from series names (e.g. "Ný útlán: "). */
  stripPrefix?: string;
}

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

export const FIGURE_STYLES: Record<string, FigureStyle> = {
  /* I Verðlagsþróun og verðbólguvæntingar */
  "I-2": {
    areas: [2, 3, 4, 5, 6],
    stack: [2, 3, 4, 5, 6],
    colors: { 2: "none", 3: BAND, 4: BAND, 5: BAND, 6: BAND },
    hide: [2, 4, 5, 6],
    quiet: [2, 3, 4, 5, 6],
    rename: { 3: "Bil hæsta og lægsta mats" },
  },
  "I-5": { type: "bar", stack: true, lines: [6], colors: { 0: 0, 1: 2, 2: 6, 3: 3, 4: 4, 5: 5, 6: 1 } },
  "I-6": { bars: [0], colors: { 0: 0, 1: 1, 2: 3, 3: 2, 4: 4 } },
  "I-12": { bars: [2], colors: { 0: 0, 1: 1, 2: 2 } },
  "I-13": { type: "bar", stack: true },

  /* II Framleiðsla og eftirspurn */
  "II-1": { type: "bar", stack: true, lines: [0], colors: { 0: 4, 1: 0, 2: 1, 3: 2, 4: 3 } },
  "II-2": { bars: [2, 3], colors: { 0: 2, 1: 3, 2: 0, 3: 1 } },
  "II-3": { bars: [0] },
  "II-5": { type: "bar", stack: true, lines: [0], colors: { 0: 3, 1: 0, 2: 1, 3: 2 } },
  "II-7": { areas: [2], colors: { 0: 2, 1: 1, 2: 0 } },
  "II-9": { bars: [0], colors: { 0: 0, 1: 1, 2: 2 } },
  "II-10": { bars: [0] },
  "II-13": { bars: [0] },
  "II-15": { bars: [2], colors: { 0: 2, 1: 1, 2: 0 } },
  "II-17": { bars: [2, 3, 4, 5], stack: true, colors: { 0: 4, 1: 1, 2: 0, 3: 2, 4: 5, 5: 3 } },
  "II-18": { areas: [3, 4], colors: { 0: 1, 1: 2, 2: 0, 3: 5, 4: 6 } },
  "II-20": { areas: [0], colors: { 0: 0, 1: 2, 2: 1 } },
  "II-21": { areas: [1], colors: { 0: 1, 1: 0 } },
  "II-22": { areas: [0] },

  /* III Utanríkisviðskipti og ytri skilyrði */
  "III-1": { bars: [0, 1], overlap: true, colors: { 0: 0, 1: 2, 2: 1 } },
  "III-2": { type: "bar", stack: true, colors: { 0: 3, 1: 2, 2: 1, 3: 0 } },
  "III-3": { type: "area", stack: true },
  "III-4": { type: "bar", stack: true, lines: [4], colors: { 0: 0, 1: 2, 2: 3, 3: 1, 4: 4 } },
  "III-5": { type: "bar", stack: true, lines: [0], colors: { 0: 4, 1: 0, 2: 3, 3: 2, 4: 5, 5: 1 } },
  "III-6": { type: "bar", stack: true, lines: [5], colors: { 0: 0, 1: 1, 2: 2, 3: 5, 4: 3, 5: 4 } },
  "III-8": { type: "bar", stack: true, colors: { 0: 4, 1: 0, 2: 1, 3: 2, 4: 3 } },
  "III-9": { type: "area", stack: true },
  "III-10": { type: "area", stack: true },
  "III-18": { bars: [1], colors: { 0: 1, 1: 0 } },
  "III-19": { type: "bar", colors: { 0: 0, 1: 1, 2: 2, 3: 0, 4: 1, 5: 2 }, hide: [3, 4, 5], stripPrefix: "Verðþróun: " },
  "III-20": { type: "bar", stack: [0, 1, 2], right: range(3, 7), unitRight: "Ma.kr.", colors: { 3: 0, 4: 1, 5: 2, 6: 3, 7: 4 } },
  "III-21": {
    type: "bar",
    stack: true,
    lines: [0],
    colors: { 0: 1, 1: 0, 2: 3, 3: 5, 4: 0, 5: 3, 6: 5 },
    hide: [4, 5, 6],
    rename: { 1: "Samgöngur", 2: "Ferðalög", 3: "Annað" },
  },
  "III-22": { type: "bar", stack: true, drop: [0] },
  "III-23": { type: "bar" },
  "III-24": { colors: { 0: 1, 1: 0 } },
  "III-25": { colors: { 0: 1, 1: 0, 2: 2, 3: 3 } },
  "III-27": { colors: { 0: 1, 1: 0 } },

  /* IV Vinnumarkaður og tekjur */
  "IV-1": { type: "bar", stack: true, lines: [3], colors: { 0: 3, 1: 0, 2: 2, 3: 1 } },
  "IV-2": { type: "bar", stack: true },
  "IV-4": { colors: { 0: 0, 1: 1, 2: 0, 3: 1 }, dashed: [0, 1] },
  "IV-5": { type: "bar", stack: true, lines: [2], colors: { 0: 0, 1: 2, 2: 1 } },
  "IV-6": { type: "bar", stack: true, lines: [2], colors: { 0: 0, 1: 2, 2: 1 } },
  "IV-7": { type: "bar", stack: true, lines: [0], colors: { 0: 1, 1: 0, 2: 2, 3: 3 } },
  "IV-8": { type: "bar", stack: true, lines: [4] },
  "IV-9": { type: "bar" },
  "IV-10": { type: "bar", stack: true, lines: [0], colors: { 0: 1, 1: 0, 2: 2 } },
  "IV-11": { type: "bar", colors: { 0: 2, 1: 0, 2: "#D98C8C", 3: 3 } },
  "IV-13": { bars: [0], colors: { 0: 2, 1: 0, 2: 1, 3: 3 } },
  "IV-14": { type: "bar", stack: true, lines: [0], colors: { 0: 1, 1: 0, 2: 2, 3: 3 } },
  "IV-15": { bars: [2], colors: { 0: 1, 1: 2, 2: 0 } },

  /* V Opinber fjármál */
  "V-1": { bars: [2], points: [3, 4, 5], markers: [0, 1], colors: { 0: 0, 1: 1, 2: 2, 3: 0, 4: 1, 5: 3 }, hide: [3, 4, 5] },
  "V-2": { bars: [2], points: [3, 4, 5], markers: [0, 1], colors: { 0: 0, 1: 1, 2: 2, 3: 0, 4: 1, 5: 3 }, hide: [3, 4, 5] },
  "V-3": { bars: [2], points: [3, 4, 5], markers: [0, 1], colors: { 0: 0, 1: 1, 2: 2, 3: 0, 4: 1, 5: 3 }, hide: [3, 4, 5] },
  "V-5": { type: "bar", stack: true, lines: [0], colors: { 0: 1, 1: 0, 2: 2, 3: 3 } },
  "V-6": { type: "bar", stack: true, lines: [0], colors: { 0: 1, 1: 0, 2: 2 } },
  "V-10": { colors: { 0: 0, 1: 0, 2: 1, 3: 1 }, dashed: [1, 3] },
  "V-12": { colors: { 0: 0, 1: 1, 2: 2, 3: 0, 4: 1, 5: 2 }, dashed: [3, 4, 5] },
  "V-13": { bars: [0, 1], overlap: true, colors: { 0: 0, 1: 1, 2: 3, 3: 2 } },
  "V-14": { bars: [0, 1], colors: { 0: 0, 1: 2, 2: 1 } },

  /* VI Eignamarkaðir */
  "VI-1": { areas: [0] },
  "VI-6": { colors: { 0: 1, 1: 0 } },
  "VI-9": { areas: [0, 1, 2], stack: [0, 1, 2], colors: { 3: 3 } },
  "VI-10": { type: "bar", stack: true, lines: [3], colors: { 0: 0, 1: 3, 2: 5, 3: 1, 4: 0, 5: 3, 6: 5 }, hide: [4, 5, 6], stripPrefix: "Ný útlán: " },
  "VI-11": { type: "area", stack: true },
  "VI-12": { bars: [1], colors: { 0: 1, 1: 0 } },
  "VI-13": { type: "bar", stack: true },
  "VI-14": { bars: [3], colors: { 0: 1, 1: 2, 2: 3, 3: 0 } },

  /* VII Heimili og fyrirtæki */
  "VII-1": { type: "bar", stack: true, lines: [5], colors: { 0: 0, 1: 2, 2: 3, 3: 4, 4: 5, 5: 1 } },
  "VII-2": { type: "bar", stack: true, lines: [5], colors: { 0: 0, 1: 2, 2: 3, 3: 4, 4: 5, 5: 1 } },
  "VII-3": { type: "bar", stack: true, lines: [3] },
  "VII-4": { type: "bar", stack: true, lines: [4] },
  "VII-5": {
    type: "bar",
    stack: true,
    lines: [4],
    colors: { 0: 0, 1: 3, 2: 5, 3: PURPLE, 4: 1, 5: 0, 6: 3, 7: 5, 8: PURPLE },
    hide: [5, 6, 7, 8],
    stripPrefix: "Ný útlán: ",
  },
  "VII-6": { type: "bar", stack: true, lines: [4], colors: { 0: 0, 1: 3, 2: 5, 3: PURPLE, 4: 1, 5: 0, 6: 3, 7: 5, 8: PURPLE }, hide: [5, 6, 7, 8] },
  "VII-7": { type: "bar", stack: true },
  "VII-8": { type: "bar", stack: true },
  "VII-9": { type: "bar", stack: true, lines: [4] },
  "VII-10": { type: "bar", stack: true },
  "VII-11": { type: "bar", stack: true },
  "VII-12": { type: "bar", colors: { 0: 1, 1: 0 } },
  "VII-13": { type: "bar", stack: true },
  "VII-14": { type: "bar", stack: true },
  "VII-15": { bars: [0] },
  "VII-16": { bars: [0, 1], colors: { 0: 0, 1: 2, 2: 1, 3: 3 } },
  "VII-18": { bars: [0], right: [1, 2, 3, 4, 5], colors: { 0: 2, 1: 0, 2: 1, 3: 3, 4: 4, 5: 5 } },
  "VII-19": { bars: [0], right: [1, 2, 3, 4, 5], colors: { 0: 2, 1: 0, 2: 1, 3: 3, 4: 4, 5: 5 } },
  "VII-20": { bars: [0, 1], right: [0, 1], unitRight: "Fjöldi lánveitinga", colors: { 0: 2, 1: 7, 2: 0, 3: 1, 4: 3, 5: 4, 6: 5 } },
  "VII-21": { bars: [0, 1], right: [0, 1], unitRight: "Fjöldi lánveitinga", colors: { 0: 2, 1: 7, 2: 0, 3: 1, 4: 3, 5: 4, 6: 5 } },
  "VII-29": { bars: [0, 1], stack: [0, 1], right: [2, 3], markers: [2, 3] },

  /* VIII Fjármálamarkaðir */
  "VIII-3": { type: "area" },
  "VIII-4": { type: "bar", stack: true, lines: [4], colors: { 0: 0, 1: 2, 2: 1, 3: 3, 4: 4 } },
  "VIII-5": { areas: [0, 1, 2], stack: [0, 1, 2], colors: { 0: 0, 1: 2, 2: 3, 3: 1 } },
  "VIII-6": { type: "bar", stack: true },
  "VIII-7": { bars: [0], colors: { 0: 0, 1: 2, 2: 3 } },
  "VIII-9": { step: true },
  "VIII-10": { points: [2, 3, 4], colors: { 0: 0, 1: 3, 2: 1, 3: 2, 4: 4 } },
  "VIII-28": { type: "bar", stack: true },
  "VIII-29": { bars: [0] },
  "VIII-30": { type: "bar" },
  "VIII-31": { bars: [0] },
  "VIII-32": { type: "bar", stack: true },
  "VIII-33": { type: "bar", stack: true, lines: [4], colors: { 0: 0, 1: 5, 2: 2, 3: 1, 4: 3 } },
  "VIII-34": { type: "bar", stack: true, lines: [0], colors: { 0: 1, 1: 2, 2: 0 } },
  "VIII-35": { type: "bar", stack: true, lines: [4] },
  "VIII-36": { type: "bar", stack: true, lines: [0], colors: { 0: 2, 1: 0, 2: 1 } },

  /* IX Fjármálakerfið */
  "IX-1": { type: "bar", stack: true, drop: [6] },
  "IX-2": { type: "area", stack: true },
  "IX-4": { type: "bar", stack: true },
  "IX-5": { type: "area", stack: true },
  "IX-6": { type: "area", stack: true },
  "IX-7": { type: "bar" },
  "IX-8": { type: "bar" },
  "IX-9": { type: "bar" },
  "IX-11": { type: "line" },
  "IX-12": { type: "bar", stack: true },
  "IX-13": { type: "bar", stack: true },
  "IX-14": { type: "area", stack: true },
  "IX-15": { type: "area", stack: true },
  "IX-16": { type: "bar", stack: true },
  "IX-17": { type: "bar", stack: true },
  "IX-18": { type: "bar", stack: true },
  "IX-21": { areas: [1], colors: { 0: 2, 1: 0, 2: 1 } },
  "IX-23": { type: "bar", stack: true },
  "IX-24": { type: "bar", stack: true },
  "IX-25": { type: "bar", stack: true },

  /* X Alþjóðleg efnahagsmál og erlendur samanburður */
  "X-5": { type: "bar" },
  "X-6": { type: "bar" },
  "X-40": { type: "line" },
};

const MONTH_RE = /^(jan|feb|mar|apr|maí|jún|júl|ág|sep|okt|nóv|des)/i;

/**
 * Turn a catalogue entry's series into drawable series definitions: chart kinds, stacking,
 * colours, axes and legend visibility. Explicit styles win over the defaults:
 * - inflation targets are thin reference lines in the report's dark red,
 * - "25 ára meðaltal" style long-run averages are dashed,
 * - category figures are bars, unless the categories are months (one line per year),
 * - a second copy of a series ("Óverðtryggð (2)") shares its colour and stays out of the legend.
 */
export function applyStyle(
  fig: FigureDefinition,
  raw: { name: string; axis: "left" | "right" }[],
): { chartType: ChartType; series: SeriesDefinition[]; unitRight?: string; barOverlap?: boolean } {
  const st = FIGURE_STYLES[fig.id] ?? {};
  const isMonths = fig.xType === "category" && (fig.categories ?? []).length > 0 && (fig.categories ?? []).every((c) => MONTH_RE.test(c));
  const base: ChartType = st.type ?? (fig.xType === "category" && !isMonths ? "bar" : "line");
  const has = (list: number[] | undefined, i: number) => !!list?.includes(i);
  const stackAll = st.stack === true;

  let paletteNext = 0;
  const colorOf = new Map<string, string>();
  const series: SeriesDefinition[] = [];

  raw.forEach((r, i) => {
    if (has(st.drop, i)) return;
    let name = st.rename?.[i] ?? r.name;
    if (st.stripPrefix && name.startsWith(st.stripPrefix)) name = name.slice(st.stripPrefix.length);
    const isTarget = /markmið/i.test(name);
    const kind = has(st.points, i) ? "scatter" : has(st.bars, i) ? "bar" : has(st.lines, i) || isTarget ? "line" : has(st.areas, i) ? "area" : base;
    const isAverage = /^\d+ ára meðaltal$/i.test(name);
    const dup = /^(.*) \(2\)$/.exec(name);
    const twin = dup && colorOf.has(dup[1]) ? dup[1] : undefined;

    let color: string;
    const c = st.colors?.[i];
    if (typeof c === "number") color = PALETTE[c % PALETTE.length];
    else if (c === "none") color = "transparent";
    else if (c) color = c;
    else if (twin) color = colorOf.get(twin) ?? PALETTE[0];
    else if (isTarget) color = TARGET_COLOR;
    else color = PALETTE[paletteNext++ % PALETTE.length];
    colorOf.set(name, color);

    const stacked = (kind === "bar" || kind === "area") && (stackAll || (Array.isArray(st.stack) && st.stack.includes(i)));
    series.push({
      id: `s${i}`,
      name: twin ?? name,
      kind,
      axis: has(st.right, i) ? "right" : r.axis,
      color,
      stack: stacked ? (kind === "area" ? "area" : "bars") : undefined,
      dashed: has(st.dashed, i) || isAverage || undefined,
      reference: isTarget || isAverage || undefined,
      step: st.step || undefined,
      markers: has(st.markers, i) || undefined,
      hideInLegend: has(st.hide, i) || !!twin || undefined,
      noTooltip: has(st.quiet, i) || undefined,
    });
  });

  return { chartType: base, series, unitRight: st.unitRight, barOverlap: st.overlap };
}
