import { useMemo, useState } from "react";
import type { FigureFilters, SortKey } from "../types";
import { FIGURES } from "../data/figures";
import { activeFilterCount, applyFilters, sortFigures } from "../lib/filters";
import { CHART_TYPE_LABEL, FREQUENCY_LABEL, formatDate, pluralFigures } from "../lib/format";
import { useBrowse } from "../state/AppState";
import { ChapterRail, ChapterSelect } from "../components/ChapterNav";
import { FigureGrid } from "../components/FigureGrid";
import { FilterDrawer } from "../components/FilterDrawer";
import { IconFilter } from "../components/Icons";

function filterSummary(f: FigureFilters): string {
  const parts: string[] = [];
  if (f.query.trim()) parts.push(`„${f.query.trim()}“`);
  if (f.chapters.length) parts.push(`Kaflar ${f.chapters.join(", ")}`);
  if (f.period && f.period !== "all") parts.push(f.period === "custom" ? `${f.from ?? "…"} – ${f.to ?? "…"}` : `Gögn ná yfir ${f.period.replace("Y", " ár")}`);
  f.frequencies.forEach((x) => parts.push(FREQUENCY_LABEL[x]));
  f.chartTypes.forEach((x) => parts.push(CHART_TYPE_LABEL[x]));
  f.sources.forEach((x) => parts.push(x));
  return parts.join(" · ");
}

/** Search and filters across all chapters. Chapters themselves are read on ChapterStreamPage. */
export function SearchPage() {
  const { filters, setFilters, clearFilters } = useBrowse();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sort, setSort] = useState<SortKey>("order");

  const list = useMemo(() => sortFigures(applyFilters(FIGURES, filters), sort), [filters, sort]);
  const activeCount = activeFilterCount(filters);
  const latest = FIGURES.reduce((m, f) => (f.updatedAt > m ? f.updatedAt : m), "");
  const description = filters.query || filters.chapters.length ? "Niðurstöður úr öllum köflum." : "Allar myndir í Hagvísum.";

  return (
    <div className="page page--public">
      <aside className="page__rail">
        <ChapterRail onSelect={clearFilters} />
      </aside>
      <div className="page__content">
        <div className="compact-only">
          <ChapterSelect onSelect={clearFilters} />
        </div>

        <header className="section-head">
          <div className="section-head__text">
            <h1 className="section-head__title">Leit og síur</h1>
            <p className="section-head__desc">{description}</p>
          </div>
          <div className="section-head__meta">
            <span>{pluralFigures(list.length)}</span>
            {latest && <span>Uppfært {formatDate(latest)}</span>}
          </div>
        </header>

        <div className="action-row">
          <div className="action-row__left">
            <button type="button" className={`btn btn--secondary${activeCount ? " has-count" : ""}`} onClick={() => setDrawerOpen(true)} aria-haspopup="dialog">
              <IconFilter size={16} />
              <span>Síur og leit{activeCount ? ` (${activeCount})` : ""}</span>
            </button>
          </div>
          <div className="action-row__right">
            <label className="select-inline">
              <span>Raða eftir</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                <option value="order">Númeri</option>
                <option value="updated">Síðast uppfært</option>
                <option value="title">Titli</option>
              </select>
            </label>
          </div>
        </div>

        {activeCount > 0 && (
          <div className="filter-summary" role="status">
            <span>
              <strong>{pluralFigures(list.length)}</strong> · {filterSummary(filters)}
            </span>
            <button type="button" className="btn btn--text btn--sm" onClick={clearFilters}>
              Hreinsa síur
            </button>
          </div>
        )}

        {list.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state__title">Engar myndir passa við valdar síur.</p>
            <p className="muted">Prófaðu að fjarlægja síu eða leita að öðru orði.</p>
            <button type="button" className="btn btn--secondary" onClick={clearFilters}>
              Hreinsa síur
            </button>
          </div>
        ) : (
          <FigureGrid figures={list} arrange={false} variant="public" showChapter label="Leit og síur" />
        )}
      </div>

      <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} filters={filters} onApply={setFilters} />
    </div>
  );
}
