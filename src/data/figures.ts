/* ------------------------------------------------------------------ */
/*  Figure catalogue, read from public/data (built from Seðlabanki's  */
/*  xlsx workbooks by scripts/hagvisar/build_data.py).                 */
/*  catalogue.json is loaded once before the app renders; each        */
/*  figure's values are fetched the first time it is drawn.           */
/* ------------------------------------------------------------------ */

import type { FigureDefinition, Frequency, TimePoint, Transform } from "../types";
import { applyStyle } from "./figureStyles";

interface CatalogueSeries {
  name: string;
  axis: "left" | "right";
  inverse?: boolean;
}

interface CatalogueEntry {
  id: string;
  chapterId: string;
  title: string;
  subtitle: string | null;
  note: string | null;
  sources: string[];
  unit: string;
  unitRight: string | null;
  latest: string | null;
  xType: "time" | "category" | "none";
  frequency: string | null;
  coverage: [string, string] | null;
  points: number;
  series: CatalogueSeries[];
  categories?: string[];
  updatedAt: string;
  unavailable?: string;
}

interface CatalogueJson {
  release: string;
  releaseLabel: string | null;
  generatedAt: string;
  figures: CatalogueEntry[];
}

interface FigureDataJson {
  id: string;
  x: string[];
  series: (number | null)[][];
}

/* Filled in place by loadCatalogue() so importers can keep plain references. */
export const FIGURES: FigureDefinition[] = [];
export const FIGURE_BY_ID: Record<string, FigureDefinition> = {};
export const ALL_SOURCES: string[] = [];
export const RELEASE = { label: "", generatedAt: "" };

const BASE = `${import.meta.env.BASE_URL}data/`;
const byChapter = new Map<string, FigureDefinition[]>();

/** "2026-09-01" → local timestamp. */
function ts(iso: string): number {
  const [y, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getTime();
}

function toFrequency(entry: CatalogueEntry): Frequency {
  switch (entry.frequency) {
    case "daily":
    case "weekly":
    case "monthly":
    case "quarterly":
    case "annual":
      return entry.frequency;
    case "bimonthly":
    case "semiannual":
      return "monthly";
  }
  const note = (entry.note ?? "").toLowerCase();
  if (note.includes("daglegar")) return "daily";
  if (note.includes("vikulegar")) return "weekly";
  if (note.includes("mánaðarleg")) return "monthly";
  if (note.includes("ársfjórðungsleg")) return "quarterly";
  return "annual";
}

function toFigure(e: CatalogueEntry): FigureDefinition {
  const timeAxis = e.xType === "time";
  const transforms: Transform[] = timeAxis && /^vísitala/i.test(e.unit) ? ["level", "rebase"] : ["level"];
  const fig: FigureDefinition = {
    id: e.id,
    slug: e.id.toLowerCase(),
    chapterId: e.chapterId,
    title: e.title,
    subtitle: e.subtitle ?? undefined,
    unit: e.unit,
    unitRight: e.unitRight ?? undefined,
    inverseRight: e.series.some((s) => s.inverse) || undefined,
    latest: e.latest ?? undefined,
    unavailable: e.unavailable,
    frequency: toFrequency(e),
    chartType: "line",
    xType: e.xType === "category" ? "category" : "time",
    categories: e.categories,
    tags: [],
    sources: e.sources,
    note: e.note ?? undefined,
    series: [],
    transforms,
    defaultPeriod: "all",
    coverage: e.coverage ? [ts(e.coverage[0]), ts(e.coverage[1])] : undefined,
    updatedAt: e.updatedAt,
  };
  const styled = applyStyle(fig, e.series);
  fig.chartType = styled.chartType;
  fig.series = styled.series;
  fig.barOverlap = styled.barOverlap;
  if (styled.unitRight) fig.unitRight = styled.unitRight;
  fig.zeroBased = styled.series.some((s) => s.kind === "bar" || (s.kind === "area" && !!s.stack)) || undefined;
  return fig;
}

export async function loadCatalogue(): Promise<void> {
  const res = await fetch(`${BASE}catalogue.json`, { cache: "no-cache" });
  if (!res.ok) throw new Error(`catalogue.json: ${res.status}`);
  const json = (await res.json()) as CatalogueJson;
  RELEASE.label = json.releaseLabel ?? json.release;
  RELEASE.generatedAt = json.generatedAt;

  FIGURES.length = 0;
  for (const key of Object.keys(FIGURE_BY_ID)) delete FIGURE_BY_ID[key];
  byChapter.clear();
  for (const e of json.figures) {
    const fig = toFigure(e);
    FIGURES.push(fig);
    FIGURE_BY_ID[fig.id] = fig;
  }

  const counts = new Map<string, number>();
  FIGURES.forEach((f) => f.sources.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1)));
  ALL_SOURCES.length = 0;
  ALL_SOURCES.push(...[...counts.entries()].sort((a, b) => b[1] - a[1]).map(([s]) => s));
}

export function getFigure(id: string | undefined): FigureDefinition | undefined {
  return id ? FIGURE_BY_ID[id] : undefined;
}

export function figuresInChapter(chapterId: string): FigureDefinition[] {
  let list = byChapter.get(chapterId);
  if (!list) {
    list = FIGURES.filter((f) => f.chapterId === chapterId);
    byChapter.set(chapterId, list);
  }
  return list;
}

/* ---------------- Figure values ---------------- */

const loaded = new Map<string, FigureDefinition>();
const pending = new Map<string, Promise<FigureDefinition>>();

/** The figure with its values, if they have already been fetched. */
export function peekFigureData(id: string): FigureDefinition | undefined {
  return loaded.get(id);
}

/** Fetch a figure's values once and return a copy of the figure with them filled in. */
export function loadFigureData(id: string): Promise<FigureDefinition> {
  const hit = loaded.get(id);
  if (hit) return Promise.resolve(hit);
  let p = pending.get(id);
  if (!p) {
    const fig = FIGURE_BY_ID[id];
    if (!fig) return Promise.reject(new Error(`Unknown figure ${id}`));
    p = (fig.unavailable ? Promise.resolve(null) : fetch(`${BASE}figures/${encodeURIComponent(id)}.json`).then((r) => {
      if (!r.ok) throw new Error(`${id}.json: ${r.status}`);
      return r.json() as Promise<FigureDataJson>;
    }))
      .then((data) => {
        const full = hydrate(fig, data);
        loaded.set(id, full);
        return full;
      })
      .finally(() => pending.delete(id));
    pending.set(id, p);
  }
  return p;
}

function hydrate(fig: FigureDefinition, data: FigureDataJson | null): FigureDefinition {
  if (!data) return { ...fig, loaded: true };
  const column = (i: number) => data.series[Number(i)] ?? [];
  if (fig.xType === "category") {
    return {
      ...fig,
      loaded: true,
      categories: data.x,
      series: fig.series.map((s) => ({ ...s, values: column(Number(s.id.slice(1))) })),
    };
  }
  const t = data.x.map(ts);
  return {
    ...fig,
    loaded: true,
    series: fig.series.map((s) => {
      const values = column(Number(s.id.slice(1)));
      const points: TimePoint[] = t.map((tt, i) => ({ t: tt, v: values[i] ?? null }));
      return { ...s, data: points };
    }),
  };
}
