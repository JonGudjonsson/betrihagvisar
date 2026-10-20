import type { FigureDefinition, FigureFilters, SortKey } from "../types";
import { CHAPTER_BY_ID } from "../data/chapters";
import { figureCoverage, lastObservation, periodBounds } from "./transforms";

export const EMPTY_FILTERS: FigureFilters = {
  query: "",
  chapters: [],
  period: null,
  frequencies: [],
  chartTypes: [],
  sources: [],
};

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/þ/g, "th")
    .replace(/æ/g, "ae")
    .replace(/ð/g, "d")
    .replace(/ö/g, "o")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const haystacks = new Map<string, string>();
function haystack(f: FigureDefinition): string {
  let h = haystacks.get(f.id);
  if (!h) {
    h = normalize(
      [
        f.id,
        f.title,
        f.unit,
        f.note ?? "",
        CHAPTER_BY_ID[f.chapterId]?.title ?? "",
        ...f.tags,
        ...f.sources,
        ...f.series.map((s) => s.name),
        ...(f.categories ?? []),
      ].join(" | "),
    );
    haystacks.set(f.id, h);
  }
  return h;
}

export function matchesQuery(f: FigureDefinition, query: string): boolean {
  const q = normalize(query.trim());
  if (!q) return true;
  const h = haystack(f);
  return q.split(/\s+/).every((term) => h.includes(term));
}

export function activeFilterCount(f: FigureFilters): number {
  return (
    (f.query.trim() ? 1 : 0) +
    f.chapters.length +
    (f.period && f.period !== "all" ? 1 : 0) +
    f.frequencies.length +
    f.chartTypes.length +
    f.sources.length
  );
}

/** Whether the filters move the view out of a single chapter. */
export function isCrossChapter(f: FigureFilters): boolean {
  return f.chapters.length > 0 || f.query.trim().length > 0;
}

export function applyFilters(figs: FigureDefinition[], f: FigureFilters): FigureDefinition[] {
  return figs.filter((fig) => {
    if (f.chapters.length && !f.chapters.includes(fig.chapterId)) return false;
    if (f.frequencies.length && !f.frequencies.includes(fig.frequency)) return false;
    if (f.chartTypes.length && !f.chartTypes.includes(fig.chartType)) return false;
    if (f.sources.length && !fig.sources.some((s) => f.sources.includes(s))) return false;
    if (f.period && f.period !== "all") {
      // A figure qualifies if its data covers the requested span.
      const [cs, ce] = figureCoverage(fig);
      const [start, end] = periodBounds(f.period, lastObservation(fig), f.from, f.to);
      if (f.period === "custom") {
        if (Number.isFinite(start) && cs > start) return false;
        if (Number.isFinite(end) && ce < end) return false;
      } else if (cs > start) return false;
    }
    if (!matchesQuery(fig, f.query)) return false;
    return true;
  });
}

export function sortFigures(figs: FigureDefinition[], key: SortKey, customOrder?: string[]): FigureDefinition[] {
  const out = [...figs];
  if (key === "updated") return out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  if (key === "title") return out.sort((a, b) => a.title.localeCompare(b.title, "is"));
  if (customOrder?.length) {
    const pos = new Map(customOrder.map((id, i) => [id, i]));
    return out.sort((a, b) => (pos.get(a.id) ?? 1e6) - (pos.get(b.id) ?? 1e6));
  }
  return out;
}
