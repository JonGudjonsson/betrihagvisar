import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, useSets, useToast } from "../state/AppState";
import { useDismiss } from "../lib/hooks";
import { IconCheck, IconPlus, IconStar, IconStarFilled } from "./Icons";

interface Props {
  figureId: string;
  /** Render as a labelled button instead of an icon (spotlight). */
  variant?: "icon" | "button";
}

/** ☆ Bæta í safn: choose existing sets or create a new one. */
export function AddToSetPopover({ figureId, variant = "icon" }: Props) {
  const { user } = useAuth();
  const { sets, toggleFigure, createSet, setsContaining } = useSets();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const btn = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const close = useCallback(() => {
    setOpen(false);
    setCreating(false);
    setName("");
  }, []);
  useDismiss(open, close, [btn, pop]);

  const saved = user ? setsContaining(figureId).length > 0 : false;

  useEffect(() => {
    if (creating) input.current?.focus();
  }, [creating]);
  useEffect(() => {
    if (open && !creating) pop.current?.querySelector<HTMLElement>("input, a, button")?.focus();
  }, [open, creating]);

  const onToggle = (setId: string, setName: string) => {
    const added = toggleFigure(setId, figureId);
    toast.show(added ? `${figureId} bætt í „${setName}“.` : `${figureId} fjarlægð úr „${setName}“.`, added ? { label: "Opna safn", onClick: () => navigate(`/sets/${setId}`) } : undefined);
  };

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const set = createSet(name, [figureId]);
    toast.show(`Nýtt safn „${set.name}“ stofnað með ${figureId}.`, { label: "Opna safn", onClick: () => navigate(`/sets/${set.id}`) });
    close();
  };

  const label = saved ? "Vistað í safni: breyta" : "Bæta í safn";

  return (
    <div className="popover-anchor">
      <button
        ref={btn}
        type="button"
        className={variant === "icon" ? `icon-btn${saved ? " is-active" : ""}` : "btn btn--secondary"}
        aria-label={variant === "icon" ? label : undefined}
        title={variant === "icon" ? label : undefined}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
      >
        {saved ? <IconStarFilled /> : <IconStar />}
        {variant === "button" && <span>{saved ? "Í safni" : "Bæta í mitt safn"}</span>}
      </button>
      {open && (
        <div ref={pop} id={id} className="popover" role="dialog" aria-label="Bæta mynd í safn">
          <div className="popover__title">Bæta í safn</div>
          {!user ? (
            <div className="popover__body">
              <p className="muted small">Skráðu þig inn til að vista myndir í eigin söfn.</p>
              <Link className="btn btn--primary btn--sm" to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`}>
                Skrá inn
              </Link>
            </div>
          ) : (
            <>
              {sets.length > 0 && (
                <ul className="popover__list">
                  {sets.map((s) => {
                    const has = s.figureIds.includes(figureId);
                    return (
                      <li key={s.id}>
                        <label className="check-row">
                          <input type="checkbox" checked={has} onChange={() => onToggle(s.id, s.name)} />
                          <span className="check-row__box" aria-hidden="true">
                            {has && <IconCheck size={14} />}
                          </span>
                          <span className="check-row__label">{s.name}</span>
                          <span className="check-row__meta">{s.figureIds.length}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
              {creating ? (
                <form className="popover__create" onSubmit={onCreate}>
                  <label className="sr-only" htmlFor={`${id}-name`}>
                    Heiti nýs safns
                  </label>
                  <input
                    ref={input}
                    id={`${id}-name`}
                    className="input input--sm"
                    placeholder="Heiti safns"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={60}
                  />
                  <button type="submit" className="btn btn--primary btn--sm" disabled={!name.trim()}>
                    Stofna
                  </button>
                </form>
              ) : (
                <button type="button" className="popover__new" onClick={() => setCreating(true)}>
                  <IconPlus size={16} /> Nýtt safn
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
