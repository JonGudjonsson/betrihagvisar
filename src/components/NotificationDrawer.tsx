import { useEffect, useState } from "react";
import type { FigureSet, NotificationPreferences } from "../types";
import { FIGURE_BY_ID } from "../data/figures";
import { useAuth, useSets, useToast } from "../state/AppState";
import { Drawer } from "./Drawer";
import { CheckRow, FieldGroup, RadioRow } from "./controls";

interface Props {
  open: boolean;
  onClose: () => void;
  set: FigureSet;
  onSaved?: () => void;
}

export function NotificationDrawer({ open, onClose, set, onSaved }: Props) {
  const { user } = useAuth();
  const { notifications } = useSets();
  const toast = useToast();
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setPrefs(
      notifications?.getSync(set.id) ?? {
        setId: set.id,
        enabled: true,
        scope: "all",
        figureIds: [],
        frequency: "daily",
        email: user?.email ?? "",
      },
    );
  }, [open, set.id, notifications, user]);

  if (!prefs) return null;

  const save = async () => {
    if (prefs.enabled && !/^\S+@\S+\.\S+$/.test(prefs.email)) {
      setError("Sláðu inn gilt netfang.");
      return;
    }
    if (prefs.enabled && prefs.scope === "selected" && prefs.figureIds.length === 0) {
      setError("Veldu að minnsta kosti eina mynd.");
      return;
    }
    await notifications?.savePreferences(prefs);
    onSaved?.();
    toast.show(
      prefs.enabled ? "Uppfærslur vistaðar. Í framleiðslu myndi tölvupóstur berast þegar ný gögn birtast." : "Slökkt á uppfærslum fyrir þetta safn.",
    );
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Fáðu uppfærslur í tölvupósti"
      subtitle={set.name}
      width={440}
      footer={
        <>
          <span className="muted small">Sýnidæmi: enginn tölvupóstur verður sendur.</span>
          <button type="button" className="btn btn--primary" onClick={save}>
            Vista stillingar
          </button>
        </>
      }
    >
      <div className="notify-form">
        <CheckRow checked={prefs.enabled} onChange={(v) => setPrefs({ ...prefs, enabled: v })} label="Láta mig vita þegar ný gögn birtast í þessu safni" />

        <fieldset className="notify-form__body" disabled={!prefs.enabled}>
          <FieldGroup title="Myndir">
            <RadioRow name="scope" checked={prefs.scope === "all"} onChange={() => setPrefs({ ...prefs, scope: "all" })} label="Allar myndir í safninu" />
            <RadioRow name="scope" checked={prefs.scope === "selected"} onChange={() => setPrefs({ ...prefs, scope: "selected" })} label="Aðeins valdar myndir" />
            {prefs.scope === "selected" && (
              <div className="notify-form__figs">
                {set.figureIds.map((id) => {
                  const f = FIGURE_BY_ID[id];
                  if (!f) return null;
                  return (
                    <CheckRow
                      key={id}
                      checked={prefs.figureIds.includes(id)}
                      onChange={(on) => setPrefs({ ...prefs, figureIds: on ? [...prefs.figureIds, id] : prefs.figureIds.filter((x) => x !== id) })}
                      label={
                        <>
                          <span className="roman">{f.id}</span> {f.title}
                        </>
                      }
                    />
                  );
                })}
              </div>
            )}
          </FieldGroup>

          <FieldGroup title="Tíðni">
            <RadioRow name="freq" checked={prefs.frequency === "immediate"} onChange={() => setPrefs({ ...prefs, frequency: "immediate" })} label="Strax" hint="Einn póstur fyrir hverja uppfærslu" />
            <RadioRow name="freq" checked={prefs.frequency === "daily"} onChange={() => setPrefs({ ...prefs, frequency: "daily" })} label="Daglegt yfirlit" />
            <RadioRow name="freq" checked={prefs.frequency === "weekly"} onChange={() => setPrefs({ ...prefs, frequency: "weekly" })} label="Vikulegt yfirlit" />
          </FieldGroup>

          <div className="field">
            <label htmlFor="notify-email" className="field__label">
              Netfang
            </label>
            <input
              id="notify-email"
              className="input"
              type="email"
              autoComplete="email"
              value={prefs.email}
              onChange={(e) => setPrefs({ ...prefs, email: e.target.value })}
              aria-invalid={!!error && error.includes("netfang")}
            />
          </div>
        </fieldset>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </Drawer>
  );
}
