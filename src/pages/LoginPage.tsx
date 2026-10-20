import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { DEMO_IDENTITIES } from "../services/auth";
import { useAuth } from "../state/AppState";
import { RadioRow } from "../components/controls";
import { IconCheck } from "../components/Icons";
import type { UserIdentity } from "../types";

type Step = "entry" | "identity" | "waiting" | "success";

function safeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/login")) return "/sets";
  return next;
}

export function LoginPage() {
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const [step, setStep] = useState<Step>("entry");
  const [identityId, setIdentityId] = useState(DEMO_IDENTITIES[0].id);
  const [signedIn, setSignedIn] = useState<UserIdentity | null>(null);
  const [code] = useState(() => String(1000 + Math.floor(Math.random() * 9000)));
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
  }, [step]);

  useEffect(() => {
    if (step !== "waiting") return;
    const t = window.setTimeout(async () => {
      const u = await login(identityId);
      setSignedIn(u);
      setStep("success");
    }, 2400);
    return () => window.clearTimeout(t);
  }, [step, identityId, login]);

  useEffect(() => {
    if (step !== "success") return;
    const t = window.setTimeout(() => navigate(next, { replace: true }), 1600);
    return () => window.clearTimeout(t);
  }, [step, navigate, next]);

  const quickDemo = async () => {
    const u = await login(DEMO_IDENTITIES[0].id);
    setSignedIn(u);
    setStep("success");
  };

  const identity = DEMO_IDENTITIES.find((d) => d.id === identityId)!;

  return (
    <div className="page page--auth">
      <div className="auth-card">
        <div className="demo-banner" role="note">
          Sýnidæmi: raunveruleg auðkenning fer ekki fram.
        </div>

        {user && step === "entry" ? (
          <>
            <h1 ref={heading} tabIndex={-1} className="auth-card__title">
              Þú ert innskráð(ur)
            </h1>
            <p className="muted">
              Innskráð(ur) sem <strong>{user.name}</strong>.
            </p>
            <div className="auth-card__actions">
              <Link className="btn btn--primary" to={next}>
                Halda áfram
              </Link>
              <button type="button" className="btn btn--secondary" onClick={() => logout()}>
                Skrá út
              </button>
            </div>
          </>
        ) : step === "entry" ? (
          <>
            <p className="eyebrow">Innskráning</p>
            <h1 ref={heading} tabIndex={-1} className="auth-card__title">
              Skráðu þig inn til að vista eigin söfn
            </h1>
            <p className="muted">Með innskráningu getur þú sett saman eigin söfn mynda, raðað þeim og fengið tilkynningar þegar ný gögn birtast.</p>
            <div className="auth-card__actions auth-card__actions--stack">
              <button type="button" className="btn btn--primary btn--lg" onClick={() => setStep("identity")}>
                Skrá inn með rafrænum skilríkjum
              </button>
              <button type="button" className="btn btn--text" onClick={quickDemo}>
                Prófa innskráningu (demo)
              </button>
            </div>
            <p className="small muted auth-card__note">Þetta er sýnidæmi. Engin raunveruleg auðkenning fer fram og engin persónugögn eru send.</p>
          </>
        ) : step === "identity" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep("waiting");
            }}
          >
            <p className="eyebrow">Skref 1 af 2</p>
            <h1 ref={heading} tabIndex={-1} className="auth-card__title">
              Veldu prófunarauðkenni
            </h1>
            <p className="muted">Í raunverulegri útgáfu myndir þú slá inn símanúmer og staðfesta í símanum. Hér velur þú tilbúinn notanda.</p>
            <fieldset className="identity-list">
              <legend className="sr-only">Prófunarnotendur</legend>
              {DEMO_IDENTITIES.map((d) => (
                <RadioRow
                  key={d.id}
                  name="identity"
                  checked={identityId === d.id}
                  onChange={() => setIdentityId(d.id)}
                  label={d.name}
                  hint={`${d.maskedId} · ${d.description}`}
                />
              ))}
            </fieldset>
            <div className="auth-card__actions">
              <button type="button" className="btn btn--secondary" onClick={() => setStep("entry")}>
                Til baka
              </button>
              <button type="submit" className="btn btn--primary">
                Áfram
              </button>
            </div>
          </form>
        ) : step === "waiting" ? (
          <>
            <p className="eyebrow">Skref 2 af 2</p>
            <h1 ref={heading} tabIndex={-1} className="auth-card__title">
              Staðfestu innskráningu
            </h1>
            <p className="muted">
              Beiðni hefur verið „send“ í síma {identity.name.split(" ")[0]}. Berðu saman öryggisnúmerið og staðfestu.
            </p>
            <div className="verify">
              <span className="verify__label">Öryggisnúmer</span>
              <span className="verify__code" aria-live="polite">
                {code}
              </span>
            </div>
            <div className="waiting" role="status">
              <span className="waiting__bar" aria-hidden="true" />
              <span>Bíð eftir staðfestingu…</span>
            </div>
            <div className="auth-card__actions">
              <button type="button" className="btn btn--secondary" onClick={() => setStep("identity")}>
                Hætta við
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="success-mark" aria-hidden="true">
              <IconCheck size={28} />
            </div>
            <h1 ref={heading} tabIndex={-1} className="auth-card__title">
              Innskráning tókst
            </h1>
            <p className="muted">Velkomin(n), {signedIn?.name ?? user?.name}. Þú verður færð(ur) áfram…</p>
            <div className="auth-card__actions">
              <Link className="btn btn--primary" to={next} replace>
                Halda áfram
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
