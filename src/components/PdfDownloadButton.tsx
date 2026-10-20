import { useState } from "react";
import { isoDate } from "../lib/format";
import { useToast } from "../state/AppState";

function IconPdf() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M6 2.75h8.5L19.25 7.5v13.75H6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14.25 2.75V7.75h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <text x="12.6" y="17.6" textAnchor="middle" fontSize="6.4" fontWeight="700" fill="currentColor" fontFamily="'Open Sans', sans-serif">
        PDF
      </text>
    </svg>
  );
}

/**
 * Floating "Sækja sem PDF" button for the chapter page. Builds the whole report as a
 * printed-style PDF in the browser (src/pdf/report.ts, loaded on first use) and shows
 * progress in the button while it works.
 */
export function PdfDownloadButton() {
  const toast = useToast();
  const [progress, setProgress] = useState<number | null>(null);
  const [step, setStep] = useState("");
  const busy = progress !== null;

  const run = async () => {
    if (busy) return;
    setProgress(0);
    setStep("Hleð");
    try {
      const { generateReportPdf } = await import("../pdf/report");
      const blob = await generateReportPdf((f, label) => {
        setProgress(f);
        setStep(label);
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Hagvisar-${isoDate(Date.now())}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      toast.show("PDF tilbúið og sótt.");
    } catch (err) {
      console.error(err);
      toast.show("Ekki tókst að búa til PDF.");
    } finally {
      setProgress(null);
    }
  };

  const pct = Math.round((progress ?? 0) * 100);
  return (
    <button
      type="button"
      className={`pdf-fab${busy ? " is-busy" : ""}`}
      onClick={run}
      aria-busy={busy}
      aria-label={busy ? `Bý til PDF, ${pct}%` : "Sækja Hagvísa sem PDF"}
      title={busy ? step : undefined}
    >
      {busy && <span className="pdf-fab__fill" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />}
      <span className="pdf-fab__label" aria-hidden="true">
        {busy ? `BÝ TIL PDF… ${pct}%` : "SÆKJA SEM PDF"}
      </span>
      <span className="pdf-fab__icon">
        <IconPdf />
      </span>
      <span className="sr-only" aria-live="polite">
        {busy && pct % 10 === 0 ? `${pct}%` : ""}
      </span>
    </button>
  );
}
