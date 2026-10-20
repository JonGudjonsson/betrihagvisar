import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useSets, useToast } from "../state/AppState";
import { FIGURE_BY_ID } from "../data/figures";
import { formatDate, pluralFigures } from "../lib/format";
import { LoginPrompt } from "../components/LoginPrompt";
import { Menu } from "../components/Menu";
import { Sparkline } from "../components/Sparkline";
import { IconBell, IconPlus } from "../components/Icons";

export function SetsIndexPage() {
  const { user } = useAuth();
  const { sets, createSet, saveSet, deleteSet, notifications } = useSets();
  const toast = useToast();
  const navigate = useNavigate();
  const [renaming, setRenaming] = useState<string | null>(null);
  const [name, setName] = useState("");

  if (!user) {
    return <LoginPrompt title="Mín söfn" text="Skráðu þig inn til að setja saman og vista eigin söfn mynda." />;
  }

  const onNew = () => {
    const set = createSet("Nýtt safn");
    navigate(`/sets/${set.id}?new=1`);
  };

  return (
    <div className="page page--sets">
      <header className="set-head">
        <div>
          <h1 className="page-title">Mín söfn</h1>
          <p className="set-head__meta">{sets.length === 1 ? "1 safn" : `${sets.length} söfn`}</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={onNew}>
          <IconPlus size={16} /> Nýtt safn
        </button>
      </header>

      {sets.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">Engin söfn enn</p>
          <p className="muted">Búðu til safn eða smelltu á ☆ á hvaða mynd sem er til að vista hana.</p>
          <div className="empty-state__actions">
            <button type="button" className="btn btn--primary" onClick={onNew}>
              <IconPlus size={16} /> Nýtt safn
            </button>
            <Link to="/section/I" className="btn btn--secondary">
              Skoða myndir
            </Link>
          </div>
        </div>
      ) : (
        <ul className="set-list">
          {sets.map((s) => {
            const figs = s.figureIds.map((id) => FIGURE_BY_ID[id]).filter(Boolean);
            const prefs = notifications?.getSync(s.id);
            return (
              <li key={s.id} className="set-card">
                <div className="set-card__head">
                  {renaming === s.id ? (
                    <form
                      className="inline-rename"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (name.trim()) saveSet({ ...s, name: name.trim() });
                        setRenaming(null);
                      }}
                    >
                      <label className="sr-only" htmlFor={`rename-${s.id}`}>
                        Nýtt heiti
                      </label>
                      <input id={`rename-${s.id}`} className="input input--sm" value={name} onChange={(e) => setName(e.target.value)} autoFocus maxLength={60} />
                      <button className="btn btn--primary btn--sm" type="submit">
                        Vista
                      </button>
                      <button className="btn btn--text btn--sm" type="button" onClick={() => setRenaming(null)}>
                        Hætta við
                      </button>
                    </form>
                  ) : (
                    <h2 className="set-card__title">
                      <Link to={`/sets/${s.id}`}>{s.name}</Link>
                    </h2>
                  )}
                  <Menu
                    label={`Aðgerðir fyrir ${s.name}`}
                    items={[
                      { label: "Opna", onSelect: () => navigate(`/sets/${s.id}`) },
                      {
                        label: "Endurnefna",
                        onSelect: () => {
                          setName(s.name);
                          setRenaming(s.id);
                        },
                      },
                      {
                        label: "Eyða safni",
                        danger: true,
                        separatorBefore: true,
                        onSelect: () => {
                          if (window.confirm(`Eyða safninu „${s.name}“? Myndirnar sjálfar eyðast ekki.`)) {
                            deleteSet(s.id);
                            toast.show(`Safninu „${s.name}“ var eytt.`);
                          }
                        },
                      },
                    ]}
                  />
                </div>
                <p className="set-card__meta">
                  {pluralFigures(figs.length)} · Uppfært {formatDate(s.updatedAt)}
                  {prefs?.enabled && (
                    <span className="set-card__notify">
                      <IconBell size={13} /> Uppfærslur virkar
                    </span>
                  )}
                </p>
                <Link to={`/sets/${s.id}`} className="set-card__thumbs" aria-label={`Opna ${s.name}`} tabIndex={-1}>
                  {figs.slice(0, 3).map((f) => (
                    <span key={f.id} className="set-card__thumb">
                      <span className="set-card__thumb-id">{f.id}</span>
                      <Sparkline figure={f} width={140} height={44} />
                    </span>
                  ))}
                  {figs.length === 0 && <span className="muted small">Ekkert í safninu enn</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
