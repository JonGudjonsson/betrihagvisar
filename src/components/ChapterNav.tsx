import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { CHAPTERS } from "../data/chapters";
import { IconChevronDown } from "./Icons";

/**
 * Left rail with the ten classic chapters (desktop public view); `children` go below the list.
 * `onSelect` runs when a chapter is picked (the chapter pages clear filters with it).
 */
export function ChapterRail({ activeId, onSelect, children }: { activeId?: string; onSelect?: (id: string) => void; children?: ReactNode }) {
  return (
    <nav className="chapter-rail" aria-label="Kaflar">
      <ol>
        {CHAPTERS.map((c) => (
          <li key={c.id}>
            <NavLink
              to={`/section/${c.id}`}
              className={`chapter-rail__item${activeId === c.id ? " is-active" : ""}`}
              aria-current={activeId === c.id ? "location" : undefined}
              onClick={() => onSelect?.(c.id)}
            >
              <span className="chapter-rail__num">{c.id}</span>
              <span className="chapter-rail__title">{c.shortTitle}</span>
            </NavLink>
          </li>
        ))}
      </ol>
      {children}
    </nav>
  );
}

/** Compact chapter selector for tablet / mobile. */
export function ChapterSelect({ activeId, onSelect }: { activeId?: string; onSelect?: (id: string) => void }) {
  const navigate = useNavigate();
  return (
    <div className="chapter-select">
      <label htmlFor="chapter-select" className="sr-only">
        Velja kafla
      </label>
      <select
        id="chapter-select"
        value={activeId ?? ""}
        onChange={(e) => {
          if (!e.target.value) return;
          onSelect?.(e.target.value);
          navigate(`/section/${e.target.value}`);
        }}
      >
        {!activeId && <option value="">Allir kaflar</option>}
        {CHAPTERS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.id} · {c.title}
          </option>
        ))}
      </select>
      <IconChevronDown className="chapter-select__icon" size={16} />
    </div>
  );
}
