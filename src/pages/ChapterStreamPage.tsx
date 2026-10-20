import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useNavigationType, useParams } from "react-router-dom";
import type { Chapter, FigureFilters, SortKey } from "../types";
import { CHAPTERS, getChapter } from "../data/chapters";
import { figuresInChapter } from "../data/figures";
import { activeFilterCount, applyFilters, isCrossChapter, sortFigures } from "../lib/filters";
import { formatDate, pluralFigures } from "../lib/format";
import { useBrowse } from "../state/AppState";
import { ChapterRail, ChapterSelect } from "../components/ChapterNav";
import { FigureGrid } from "../components/FigureGrid";
import { FilterDrawer } from "../components/FilterDrawer";
import { IconFilter } from "../components/Icons";
import { NotFoundPage } from "./NotFoundPage";

/* Survive unmounts so "Til baka" from a spotlight returns to the same place. */
const renderedChapters = new Set<string>();
let savedPosition: { id: string; offset: number } | null = null;

/** How long a jump keeps its chapter in place while chapters above it render. */
const PIN_MS = 2500;
/* Scroll target as "chapter + offset", re-applied while chapters above it change height. */
let pin: { id: string; offset: number; until: number } | null = null;

/** How far below the sticky bars a chapter counts as the current one. */
const ACTIVE_OFFSET = 160;

/** Height of the sticky bars at the top: the navigation, plus the chapter bar on compact screens. */
function barsHeight() {
  const nav = document.querySelector(".topnav")?.getBoundingClientRect().height ?? 68;
  const bar = document.querySelector(".stream-bar")?.getBoundingClientRect().height ?? 0;
  return nav + bar;
}

function chapterTop(id: string): number | null {
  const el = document.getElementById(`kafli-${id}`);
  return el ? el.getBoundingClientRect().top + window.scrollY : null;
}

/** Placeholder height for a chapter that has not been drawn yet. */
function estimateHeight(count: number) {
  const vw = window.innerWidth;
  const content = Math.min(1160, vw - (vw >= 1100 ? 208 + 72 : 32));
  const cols = Math.max(1, Math.floor((content + 24) / 444));
  return Math.ceil(count / cols) * (cols === 1 ? 640 : 500);
}

/**
 * All ten chapters on one page, in order. `/section/:id` scrolls to that chapter; the rail
 * and the compact selector jump between chapters and follow the scroll. Each chapter draws
 * its figures only when it comes near the viewport (charts load their data lazily too).
 */
export function ChapterStreamPage() {
  const { chapterId } = useParams();
  const chapter = getChapter(chapterId);
  const location = useLocation();
  const navType = useNavigationType();
  const navigate = useNavigate();
  const { filters, setFilters, clearFilters } = useBrowse();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sort, setSort] = useState<SortKey>("order");
  const [active, setActive] = useState(chapter?.id);
  const activeRef = useRef(active);
  const firstJump = useRef(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // Chapter pages never carry a cross-chapter query.
  const local = useMemo<FigureFilters>(() => ({ ...filters, query: "", chapters: [] }), [filters]);
  useEffect(() => {
    if (isCrossChapter(filters)) setFilters({ ...filters, query: "", chapters: [] });
  }, [filters, setFilters]);

  const markActive = useCallback((id: string) => {
    activeRef.current = id;
    setActive(id);
  }, []);

  const applyPin = useCallback(() => {
    const p = pin;
    if (!p || Date.now() > p.until) {
      pin = null;
      return;
    }
    const top = chapterTop(p.id);
    if (top != null) window.scrollTo({ top: top + p.offset, behavior: "auto" });
  }, []);

  const pinTo = useCallback(
    (id: string, offset: number) => {
      markActive(id);
      pin = { id, offset, until: Date.now() + PIN_MS };
      applyPin();
    },
    [markActive, applyPin],
  );

  // Keep the pin while content above changes; let go as soon as the reader scrolls.
  useEffect(() => {
    const el = contentRef.current;
    const release = () => (pin = null);
    const ro = typeof ResizeObserver !== "undefined" && el ? new ResizeObserver(applyPin) : null;
    if (ro && el) ro.observe(el);
    const events = ["wheel", "touchstart", "keydown", "mousedown"] as const;
    events.forEach((e) => window.addEventListener(e, release, { passive: true }));
    return () => {
      ro?.disconnect();
      events.forEach((e) => window.removeEventListener(e, release));
    };
  }, [applyPin]);

  // Jump on every navigation to a chapter (rail, selector, links), but not on the quiet
  // URL updates made while scrolling. Coming back (POP) restores the previous position.
  useLayoutEffect(() => {
    if (!chapter) return;
    if ((location.state as { fromScroll?: boolean } | null)?.fromScroll) return;
    if (firstJump.current && navType === "POP" && savedPosition) pinTo(savedPosition.id, savedPosition.offset);
    else pinTo(chapter.id, -(barsHeight() + 12));
    firstJump.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // Follow the scroll: the current chapter is the last one whose top has passed the bars.
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // at the very bottom the last chapters may never reach the line; keep the one jumped to
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) return;
        const line = barsHeight() + ACTIVE_OFFSET;
        let current = CHAPTERS[0].id;
        for (const c of CHAPTERS) {
          const el = document.getElementById(`kafli-${c.id}`);
          if (el && el.getBoundingClientRect().top <= line) current = c.id;
        }
        const top = chapterTop(current);
        if (top != null) savedPosition = { id: current, offset: window.scrollY - top };
        if (current !== activeRef.current) {
          markActive(current);
          navigate(`/section/${current}`, { replace: true, state: { fromScroll: true } });
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [markActive, navigate]);

  if (!chapter) return <NotFoundPage />;

  const activeCount = activeFilterCount(local);
  const onApply = (f: FigureFilters) => {
    setFilters(f);
    if (isCrossChapter(f)) navigate("/search");
  };

  const controls = (
    <div className="stream-controls">
      <button type="button" className={`btn btn--secondary btn--sm${activeCount ? " has-count" : ""}`} onClick={() => setDrawerOpen(true)} aria-haspopup="dialog">
        <IconFilter size={15} />
        <span>Síur og leit{activeCount ? ` (${activeCount})` : ""}</span>
      </button>
      {activeCount > 0 && (
        <button type="button" className="btn btn--text btn--sm" onClick={clearFilters}>
          Hreinsa síur
        </button>
      )}
      <label className="select-inline">
        <span>Raða eftir</span>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
          <option value="order">Röð</option>
          <option value="updated">Síðast uppfært</option>
          <option value="title">Titli</option>
        </select>
      </label>
    </div>
  );

  return (
    <div className="page page--public page--stream">
      <aside className="page__rail">
        <ChapterRail activeId={active} onSelect={clearFilters}>
          {controls}
        </ChapterRail>
      </aside>
      <div className="page__content" ref={contentRef}>
        <h1 className="sr-only">Hagvísar eftir köflum</h1>
        <div className="compact-only stream-bar">
          <ChapterSelect activeId={active} onSelect={clearFilters} />
          {controls}
        </div>

        {CHAPTERS.map((c) => (
          <ChapterSection key={c.id} chapter={c} filters={local} sort={sort} />
        ))}
      </div>

      <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} filters={local} onApply={onApply} />
    </div>
  );
}

const anchorNatively = typeof CSS !== "undefined" && CSS.supports("overflow-anchor", "auto");

const ChapterSection = memo(function ChapterSection({ chapter, filters, sort }: { chapter: Chapter; filters: FigureFilters; sort: SortKey }) {
  const ref = useRef<HTMLElement>(null);
  const [rendered, setRendered] = useState(() => renderedChapters.has(chapter.id));

  const scope = figuresInChapter(chapter.id);
  const list = useMemo(() => sortFigures(applyFilters(scope, filters), sort), [scope, filters, sort]);
  const latest = scope.reduce((m, f) => (f.updatedAt > m ? f.updatedAt : m), "");
  const filtered = activeFilterCount(filters) > 0;

  // Draw the figures once the chapter is within reach of the viewport.
  useEffect(() => {
    if (rendered) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setRendered(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          renderedChapters.add(chapter.id);
          setRendered(true);
          io.disconnect();
        }
      },
      { rootMargin: "1200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rendered, chapter.id]);

  // Browsers without scroll anchoring (Safari): keep the view still when a chapter above it changes height.
  useEffect(() => {
    const el = ref.current;
    if (anchorNatively || !el || typeof ResizeObserver === "undefined") return;
    let prev = el.offsetHeight;
    const ro = new ResizeObserver(() => {
      const h = el.offsetHeight;
      if (h !== prev && !pin && el.getBoundingClientRect().bottom < barsHeight()) window.scrollBy(0, h - prev);
      prev = h;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section ref={ref} id={`kafli-${chapter.id}`} className="chapter-block" aria-labelledby={`kafli-${chapter.id}-title`}>
      <header className="section-head">
        <div className="section-head__text">
          <h2 className="section-head__title" id={`kafli-${chapter.id}-title`}>
            <span className="sr-only">Kafli </span>
            <span className="section-head__num">{chapter.id}</span> {chapter.title}
          </h2>
          <p className="section-head__desc">{chapter.description}</p>
        </div>
        <div className="section-head__meta">
          <span>{filtered ? `${list.length} af ${scope.length} myndum` : pluralFigures(scope.length)}</span>
          {latest && <span>Uppfært {formatDate(latest)}</span>}
        </div>
      </header>

      {!rendered ? (
        <div className="chapter-block__placeholder" style={{ height: estimateHeight(list.length) }} aria-hidden="true" />
      ) : list.length === 0 ? (
        <p className="chapter-block__empty muted">Engar myndir í þessum kafla passa við valdar síur.</p>
      ) : (
        <FigureGrid figures={list} arrange={false} variant="public" label={chapter.title} />
      )}
    </section>
  );
});
