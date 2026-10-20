import { useEffect, useMemo, useState } from "react";
import { CHAPTERS } from "../data/chapters";
import { FIGURES } from "../data/figures";
import { matchesQuery } from "../lib/filters";
import { Drawer } from "./Drawer";
import { Sparkline } from "./Sparkline";
import { IconCheck, IconSearch } from "./Icons";

interface Props {
  open: boolean;
  onClose: () => void;
  existing: string[];
  onAdd: (ids: string[]) => void;
}

export function AddFigureDrawer({ open, onClose, existing, onAdd }: Props) {
  const [query, setQuery] = useState("");
  const [chapter, setChapter] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setSelected([]);
      setQuery("");
    }
  }, [open]);

  const results = useMemo(() => FIGURES.filter((f) => (!chapter || f.chapterId === chapter) && matchesQuery(f, query)), [query, chapter]);

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const n = selected.length;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Bæta við myndum"
      width={520}
      footer={
        <>
          <span className="muted small">{n ? `${n} valin` : "Veldu eina eða fleiri myndir"}</span>
          <button
            type="button"
            className="btn btn--primary"
            disabled={!n}
            onClick={() => {
              onAdd(selected);
              onClose();
            }}
          >
            {n === 0 ? "Bæta við" : n === 1 ? "Bæta við 1 mynd" : `Bæta við ${n} myndum`}
          </button>
        </>
      }
    >
      <div className="add-fig__controls">
        <div className="search-field">
          <IconSearch className="search-field__icon" />
          <label className="sr-only" htmlFor="add-q">
            Leita
          </label>
          <input id="add-q" data-autofocus className="input input--search" type="search" placeholder="Leita að mynd…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <label className="sr-only" htmlFor="add-chapter">
          Kafli
        </label>
        <select id="add-chapter" className="select" value={chapter} onChange={(e) => setChapter(e.target.value)}>
          <option value="">Allir kaflar</option>
          {CHAPTERS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.id} · {c.shortTitle}
            </option>
          ))}
        </select>
      </div>

      <ul className="add-fig__list" aria-label="Myndir">
        {results.map((f) => {
          const inSet = existing.includes(f.id);
          const on = selected.includes(f.id);
          return (
            <li key={f.id}>
              <label className={`add-fig__row${inSet ? " is-disabled" : ""}${on ? " is-on" : ""}`}>
                <input type="checkbox" checked={on || inSet} disabled={inSet} onChange={() => toggle(f.id)} />
                <span className="check-row__box" aria-hidden="true">
                  {(on || inSet) && <IconCheck size={14} />}
                </span>
                <span className="add-fig__text">
                  <span className="add-fig__id">{f.id}</span>
                  <span className="add-fig__title">{f.title}</span>
                  {inSet && <span className="add-fig__in">Þegar í safni</span>}
                </span>
                <Sparkline figure={f} width={96} height={34} />
              </label>
            </li>
          );
        })}
        {results.length === 0 && <li className="muted small add-fig__empty">Engar myndir fundust.</li>}
      </ul>
    </Drawer>
  );
}
