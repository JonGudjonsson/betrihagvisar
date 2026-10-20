import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { loadCatalogue } from "./data/figures";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/figure.css";
import "./styles/overlays.css";
import "./styles/pages.css";

// Pages place the scroll themselves (top on navigation, chapter positions on the chapter page).
if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";

const rootEl = document.getElementById("root")!;
const root = createRoot(rootEl);

root.render(
  <div className="boot" role="status">
    Hleð Hagvísum…
  </div>,
);

loadCatalogue().then(
  () =>
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  (err) => {
    console.error(err);
    root.render(
      <div className="boot boot--error" role="alert">
        <p>Ekki tókst að sækja gögn Hagvísa.</p>
        <button type="button" className="btn btn--secondary" onClick={() => window.location.reload()}>
          Reyna aftur
        </button>
      </div>,
    );
  },
);
