import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { FigureSet } from "../types";
import { FIGURES, FIGURE_BY_ID } from "../data/figures";
import { useAuth, useBrowse, useSets, useToast } from "../state/AppState";
import { LoginPrompt } from "../components/LoginPrompt";
import { NotificationDrawer } from "../components/NotificationDrawer";
import { IconBell } from "../components/Icons";
import { formatDate } from "../lib/format";
import { uid } from "../lib/storage";

const FREQ_LABEL = { immediate: "Strax", daily: "Daglegt yfirlit", weekly: "Vikulegt yfirlit" } as const;

export function UpdatesPage() {
  const { user } = useAuth();
  const { sets, notifications } = useSets();
  const { markUpdated, updated } = useBrowse();
  const toast = useToast();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<FigureSet | null>(null);
  const [, setVersion] = useState(0);

  if (!user || !notifications) {
    return <LoginPrompt title="Uppfærslur" text="Skráðu þig inn til að fá tilkynningar þegar ný gögn birtast í söfnunum þínum." />;
  }

  const outbox = notifications.queueSync();

  const simulate = () => {
    const subscribed = sets
      .map((s) => ({ set: s, prefs: notifications.getSync(s.id) }))
      .filter((x) => x.prefs?.enabled);
    const candidates = subscribed.flatMap(({ set, prefs }) =>
      (prefs!.scope === "selected" ? prefs!.figureIds : set.figureIds).map((id) => ({ id, prefs: prefs!, set })),
    );
    const pick = candidates.length
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : { id: FIGURES[Math.floor(Math.random() * FIGURES.length)].id, prefs: null, set: null };
    const fig = FIGURE_BY_ID[pick.id];
    markUpdated(fig.id);
    if (pick.prefs) {
      notifications.enqueue({
        id: uid("mail"),
        to: pick.prefs.email,
        subject: `Ný gögn: ${fig.id} ${fig.title} (${pick.set?.name})`,
        at: new Date().toISOString(),
      });
      setVersion((v) => v + 1);
      toast.show(`Ný gögn í ${fig.id} ${fig.title}. Tölvupóstur settur í biðröð (sýnidæmi).`, { label: "Skoða", onClick: () => navigate(`/figure/${fig.id}`) });
    } else {
      toast.show(`Ný gögn í ${fig.id} ${fig.title}. Engin virk áskrift, enginn póstur.`, { label: "Skoða", onClick: () => navigate(`/figure/${fig.id}`) });
    }
  };

  return (
    <div className="page page--narrow">
      <p className="eyebrow">Tilkynningar</p>
      <h1 className="page-title">Uppfærslur</h1>
      <p className="lead">Veldu hvaða söfn senda þér tölvupóst þegar ný gögn birtast.</p>
      <div className="demo-banner" role="note">
        Sýnidæmi: enginn tölvupóstur verður sendur.
      </div>

      {sets.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state__title">Engin söfn</p>
          <p className="muted">Uppfærslur eru stilltar fyrir hvert safn. Byrjaðu á að búa til safn.</p>
          <Link to="/sets" className="btn btn--primary">
            Mín söfn
          </Link>
        </div>
      ) : (
        <ul className="sub-list">
          {sets.map((s) => {
            const p = notifications.getSync(s.id);
            return (
              <li key={s.id} className="sub-row">
                <div className="sub-row__text">
                  <Link to={`/sets/${s.id}`} className="sub-row__name">
                    {s.name}
                  </Link>
                  <span className={`sub-row__status${p?.enabled ? " is-on" : ""}`}>
                    {p?.enabled ? (
                      <>
                        <IconBell size={13} /> {FREQ_LABEL[p.frequency]} · {p.scope === "all" ? "allar myndir" : `${p.figureIds.length} valdar myndir`} · {p.email}
                      </>
                    ) : (
                      "Slökkt"
                    )}
                  </span>
                </div>
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setEditing(s)}>
                  Stillingar
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <details className="debug-tools">
        <summary>Prófunarverkfæri (sýnidæmi)</summary>
        <p className="small muted">Hermir eftir því að ný gögn birtist fyrir mynd í áskrift. Myndin fær merkinguna „Ný gögn“ og póstur fer í hermda útsendingarbiðröð.</p>
        <button type="button" className="btn btn--secondary btn--sm" onClick={simulate}>
          Herma eftir uppfærslu
        </button>
        {updated.size > 0 && <p className="small muted">Merktar sem uppfærðar: {[...updated].join(", ")}</p>}
        <h2 className="debug-tools__title">Útsendingarbiðröð</h2>
        {outbox.length === 0 ? (
          <p className="small muted">Tóm.</p>
        ) : (
          <ul className="outbox">
            {outbox.map((m) => (
              <li key={m.id}>
                <span className="outbox__subject">{m.subject}</span>
                <span className="small muted">
                  til {m.to} · {formatDate(m.at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </details>

      {editing && (
        <NotificationDrawer
          open={!!editing}
          onClose={() => setEditing(null)}
          set={editing}
          onSaved={() => setVersion((v) => v + 1)}
        />
      )}
    </div>
  );
}
