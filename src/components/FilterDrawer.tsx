import { useEffect, useMemo, useRef, useState } from "react";
import type { ChartType, FigureFilters, Frequency, PeriodPreset } from "../types";
import { CHAPTERS } from "../data/chapters";
import { ALL_SOURCES, FIGURES } from "../data/figures";
import { EMPTY_FILTERS, applyFilters, isCrossChapter } from "../lib/filters";
import { CHART_TYPE_LABEL, FREQUENCY_LABEL, pluralFigures } from "../lib/format";
import { useIsMobile } from "../lib/hooks";
import { Drawer } from "./Drawer";
import { CheckRow, FieldGroup, Segmented } from "./controls";
import { IconSearch } from "./Icons";

interface Props {
  open: boolean;
  onClose: () => void;
  filters: FigureFilters;
  onApply: (f: FigureFilters) => void;
  /** Current chapter; undefined = whole catalogue. */
  chapterId?: string;
}

const FREQS: Frequency[] = ["daily", "weekly", "monthly", "quarterly", "annual"];
const TYPES: ChartType[] = ["line", "bar", "area", "scatter", "table"];
const PERIODS: { value: PeriodPreset; label: string }[] = [
  { value: "1Y", label: "1Á" },
  { value: "5Y", label: "5Á" },
  { value: "10Y", label: "10Á" },
  { value: "all", label: "Allt" },
  { value: "custom", label: "Sérsniðið" },
];

function toggle<T>(arr: T[], v: T, on: boolean): T[] {
  return on ? (arr.includes(v) ? arr : [...arr, v]) : arr.filter((x) => x !== v);
}

export function FilterDrawer({ open, onClose, filters, onApply, chapterId }: Props) {
  const [draft, setDraft] = useState<FigureFilters>(filters);
  const [showAllChapters, setShowAllChapters] = useState(false);
  const isMobile = useIsMobile();

  const latest = useRef(filters);
  latest.current = filters;
  useEffect(() => {
    if (open) setDraft(latest.current);
  }, [open]);

  const base = useMemo(
    () => (chapterId && !isCrossChapter(draft) ? FIGURES.filter((f) => f.chapterId === chapterId) : FIGURES),
    [chapterId, draft],
  );
  const count = useMemo(() => applyFilters(base, draft).length, [base, draft]);

  const countBy = useMemo(() => {
    const byChapter = new Map<string, number>();
    const byFreq = new Map<string, number>();
    const byType = new Map<string, number>();
    const bySource = new Map<string, number>();
    FIGURES.forEach((f) => {
      byChapter.set(f.chapterId, (byChapter.get(f.chapterId) ?? 0) + 1);
      byFreq.set(f.frequency, (byFreq.get(f.frequency) ?? 0) + 1);
      byType.set(f.chartType, (byType.get(f.chartType) ?? 0) + 1);
      f.sources.forEach((s) => bySource.set(s, (bySource.get(s) ?? 0) + 1));
    });
    return { byChapter, byFreq, byType, bySource };
  }, []);

  const chaptersShown = showAllChapters ? CHAPTERS : CHAPTERS.slice(0, 5);
  const sourcesShown = ALL_SOURCES.slice(0, 9);
  const collapsible = isMobile;

  const apply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Síur og leit"
      width={440}
      footer={
        <>
          <button type="button" className="btn btn--text" onClick={() => setDraft(EMPTY_FILTERS)}>
            Hreinsa allt
          </button>
          <button type="button" className="btn btn--primary" onClick={apply} disabled={count === 0}>
            {count === 0 ? "Engar myndir" : `Sýna ${pluralFigures(count)}`}
          </button>
        </>
      }
    >
      <form
        className="filter-form"
        onSubmit={(e) => {
          e.preventDefault();
          apply();
        }}
      >
        <div className="search-field">
          <IconSearch className="search-field__icon" />
          <label htmlFor="filter-q" className="sr-only">
            Leita að myndum
          </label>
          <input
            id="filter-q"
            data-autofocus
            className="input input--search"
            type="search"
            placeholder="Leita að myndum, t.d. húsnæði, laun, vextir…"
            value={draft.query}
            onChange={(e) => setDraft({ ...draft, query: e.target.value })}
          />
        </div>
        {chapterId && isCrossChapter(draft) && <p className="filter-form__hint">Leitað er í öllum köflum.</p>}

        <FieldGroup title="Flokkar" collapsible={collapsible} open>
          {chaptersShown.map((c) => (
            <CheckRow
              key={c.id}
              checked={draft.chapters.includes(c.id)}
              onChange={(on) => setDraft({ ...draft, chapters: toggle(draft.chapters, c.id, on) })}
              label={
                <>
                  <span className="roman">{c.id}</span> {c.title}
                </>
              }
              meta={countBy.byChapter.get(c.id)}
            />
          ))}
          <button type="button" className="btn btn--text btn--sm" onClick={() => setShowAllChapters((v) => !v)} aria-expanded={showAllChapters}>
            {showAllChapters ? "Sýna færri" : "Sýna fleiri…"}
          </button>
        </FieldGroup>

        <FieldGroup title="Tímabil" collapsible={collapsible} open={!collapsible}>
          <Segmented
            label="Tímabil"
            options={PERIODS}
            value={draft.period ?? "all"}
            onChange={(p) => setDraft({ ...draft, period: p === "all" ? null : p })}
          />
          {draft.period === "custom" && (
            <div className="date-range">
              <label>
                <span>Frá</span>
                <input className="input input--sm" type="date" value={draft.from ?? ""} onChange={(e) => setDraft({ ...draft, from: e.target.value })} />
              </label>
              <label>
                <span>Til</span>
                <input className="input input--sm" type="date" value={draft.to ?? ""} onChange={(e) => setDraft({ ...draft, to: e.target.value })} />
              </label>
            </div>
          )}
          <p className="filter-form__hint">Sýnir myndir með gögn sem ná yfir valið tímabil. Myndunum sjálfum er ekki breytt.</p>
        </FieldGroup>

        <FieldGroup title="Tíðni gagna" collapsible={collapsible} open={!collapsible}>
          {FREQS.map((f) => (
            <CheckRow
              key={f}
              checked={draft.frequencies.includes(f)}
              onChange={(on) => setDraft({ ...draft, frequencies: toggle(draft.frequencies, f, on) })}
              label={FREQUENCY_LABEL[f]}
              meta={countBy.byFreq.get(f) ?? 0}
            />
          ))}
        </FieldGroup>

        <FieldGroup title="Tegund myndar" collapsible={collapsible} open={!collapsible}>
          {TYPES.map((t) => (
            <CheckRow
              key={t}
              checked={draft.chartTypes.includes(t)}
              onChange={(on) => setDraft({ ...draft, chartTypes: toggle(draft.chartTypes, t, on) })}
              label={CHART_TYPE_LABEL[t]}
              meta={countBy.byType.get(t) ?? 0}
            />
          ))}
        </FieldGroup>

        <FieldGroup title="Heimild" collapsible={collapsible} open={!collapsible}>
          {sourcesShown.map((s) => (
            <CheckRow
              key={s}
              checked={draft.sources.includes(s)}
              onChange={(on) => setDraft({ ...draft, sources: toggle(draft.sources, s, on) })}
              label={s}
              meta={countBy.bySource.get(s)}
            />
          ))}
        </FieldGroup>
        <button type="submit" hidden />
      </form>
    </Drawer>
  );
}
