import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { FigureDefinition, FigureSet } from "../types";
import { FIGURE_BY_ID } from "../data/figures";
import { formatDate, pluralFigures } from "../lib/format";
import { useAuth, useSets, useToast } from "../state/AppState";
import { LoginPrompt } from "../components/LoginPrompt";
import { FigureGrid } from "../components/FigureGrid";
import { FigurePanel } from "../components/FigurePanel";
import { ArrangeToolbar } from "../components/ArrangeToolbar";
import { AddFigureDrawer } from "../components/AddFigureDrawer";
import { NotificationDrawer } from "../components/NotificationDrawer";
import { Menu, type MenuItem } from "../components/Menu";
import { IconArrange, IconArrowLeft, IconBell, IconPencil, IconPlus } from "../components/Icons";

const FREQ_LABEL = { immediate: "Strax", daily: "Daglegt yfirlit", weekly: "Vikulegt yfirlit" } as const;

export function SetDetailPage() {
  const { setId } = useParams();
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const { getSet, saveSet, deleteSet, notifications } = useSets();
  const toast = useToast();
  const navigate = useNavigate();
  const set = getSet(setId);

  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState("");
  const [arrange, setArrange] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [, setPrefsVersion] = useState(0);
  const renameInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (set && params.get("new") === "1") {
      setName(set.name);
      setRenaming(true);
      setParams(new URLSearchParams(), { replace: true });
    }
  }, [set, params, setParams]);

  useEffect(() => {
    if (renaming) renameInput.current?.select();
  }, [renaming]);

  const figures = useMemo(() => (set ? set.figureIds.map((id) => FIGURE_BY_ID[id]).filter(Boolean) : []), [set]);
  const spotlight = set?.spotlightFigureId ? FIGURE_BY_ID[set.spotlightFigureId] : undefined;
  const rest = figures.filter((f) => f.id !== spotlight?.id);

  if (!user) return <LoginPrompt title="Safn" text="Skráðu þig inn til að skoða söfnin þín." />;
  if (!set) {
    return (
      <div className="page page--narrow">
        <div className="empty-state empty-state--page">
          <h1 className="page-title">Safn fannst ekki</h1>
          <p className="muted">Safnið er ekki til eða tilheyrir öðrum prófunarnotanda.</p>
          <Link to="/sets" className="btn btn--primary">
            Mín söfn
          </Link>
        </div>
      </div>
    );
  }

  const prefs = notifications?.getSync(set.id);

  const update = (patch: Partial<FigureSet>) => saveSet({ ...set, ...patch });

  const removeFigure = (fig: FigureDefinition) => {
    const before = set;
    update({
      figureIds: set.figureIds.filter((id) => id !== fig.id),
      spotlightFigureId: set.spotlightFigureId === fig.id ? undefined : set.spotlightFigureId,
    });
    toast.show(`${fig.id} fjarlægð úr safninu.`, { label: "Afturkalla", onClick: () => saveSet(before) });
  };

  const menuFor = (fig: FigureDefinition): MenuItem[] => [
    fig.id === set.spotlightFigureId
      ? { label: "Hætta sem aðalmynd", onSelect: () => update({ spotlightFigureId: undefined }), separatorBefore: true }
      : { label: "Gera að aðalmynd", onSelect: () => update({ spotlightFigureId: fig.id }), separatorBefore: true },
    { label: "Uppfærslur fyrir myndina", onSelect: () => setNotifyOpen(true) },
    { label: "Fjarlægja úr safni", danger: true, onSelect: () => removeFigure(fig) },
  ];

  const startArrange = () => {
    setDraft(rest.map((f) => f.id));
    setArrange(true);
  };
  const saveArrange = () => {
    update({ figureIds: spotlight ? [spotlight.id, ...draft] : draft });
    setArrange(false);
    toast.show("Röð vistuð.");
  };

  const shown = arrange ? draft.map((id) => FIGURE_BY_ID[id]).filter(Boolean) : rest;

  return (
    <div className="page page--set">
      <Link to="/sets" className="btn btn--text set-back">
        <IconArrowLeft size={16} /> Mín söfn
      </Link>

      <header className="set-head">
        <div className="set-head__main">
          {renaming ? (
            <form
              className="inline-rename inline-rename--title"
              onSubmit={(e) => {
                e.preventDefault();
                if (name.trim()) update({ name: name.trim() });
                setRenaming(false);
              }}
            >
              <label htmlFor="set-name" className="sr-only">
                Heiti safns
              </label>
              <input ref={renameInput} id="set-name" className="input input--title" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
              <button className="btn btn--primary btn--sm" type="submit">
                Vista
              </button>
              <button className="btn btn--text btn--sm" type="button" onClick={() => setRenaming(false)}>
                Hætta við
              </button>
            </form>
          ) : (
            <h1 className="page-title set-head__title">
              {set.name}
              <button
                type="button"
                className="icon-btn icon-btn--subtle"
                aria-label="Endurnefna safn"
                title="Endurnefna"
                onClick={() => {
                  setName(set.name);
                  setRenaming(true);
                }}
              >
                <IconPencil size={16} />
              </button>
            </h1>
          )}
          <p className="set-head__meta">
            {pluralFigures(figures.length)} · síðast breytt {formatDate(set.updatedAt)}
            {prefs?.enabled && (
              <span className="set-card__notify">
                <IconBell size={13} /> {FREQ_LABEL[prefs.frequency]}
              </span>
            )}
          </p>
        </div>
        <Menu
          label="Aðgerðir fyrir safn"
          items={[
            {
              label: "Endurnefna",
              onSelect: () => {
                setName(set.name);
                setRenaming(true);
              },
            },
            { label: "Uppfærslur", onSelect: () => setNotifyOpen(true) },
            {
              label: "Eyða safni",
              danger: true,
              separatorBefore: true,
              onSelect: () => {
                if (window.confirm(`Eyða safninu „${set.name}“?`)) {
                  deleteSet(set.id);
                  toast.show(`Safninu „${set.name}“ var eytt.`);
                  navigate("/sets");
                }
              },
            },
          ]}
        />
      </header>

      {arrange ? (
        <ArrangeToolbar onCancel={() => setArrange(false)} onSave={saveArrange} dirty={draft.join() !== rest.map((f) => f.id).join()} />
      ) : (
        <div className="action-row action-row--set">
          <div className="action-row__left">
            <button type="button" className="btn btn--secondary" onClick={() => setAddOpen(true)} aria-haspopup="dialog">
              <IconPlus size={16} /> Bæta við mynd
            </button>
            <button type="button" className="btn btn--secondary" onClick={startArrange} disabled={rest.length < 2}>
              <IconArrange size={16} /> Raða myndum
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => setNotifyOpen(true)} aria-haspopup="dialog">
              <IconBell size={16} /> Uppfærslur
            </button>
          </div>
        </div>
      )}

      {figures.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">Safnið er tómt</p>
          <p className="muted">Bættu við myndum úr hvaða kafla sem er.</p>
          <button type="button" className="btn btn--primary" onClick={() => setAddOpen(true)}>
            <IconPlus size={16} /> Bæta við mynd
          </button>
        </div>
      ) : (
        <>
          {spotlight && (
            <div className={`set-spotlight${arrange ? " is-pinned" : ""}`}>
              {arrange && <p className="set-spotlight__note small muted">Aðalmynd helst efst.</p>}
              <FigurePanel figure={spotlight} variant="set" wide showChapter={false} extraMenuItems={menuFor(spotlight)} arrange={false} />
            </div>
          )}
          {shown.length > 0 && (
            <FigureGrid figures={shown} arrange={arrange} onReorder={setDraft} variant="set" extraMenuItems={menuFor} label={set.name} />
          )}
        </>
      )}

      <AddFigureDrawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        existing={set.figureIds}
        onAdd={(ids) => {
          update({ figureIds: [...set.figureIds, ...ids] });
          toast.show(ids.length === 1 ? "1 mynd bætt við safnið." : `${ids.length} myndum bætt við safnið.`);
        }}
      />
      <NotificationDrawer open={notifyOpen} onClose={() => setNotifyOpen(false)} set={set} onSaved={() => setPrefsVersion((v) => v + 1)} />
    </div>
  );
}
