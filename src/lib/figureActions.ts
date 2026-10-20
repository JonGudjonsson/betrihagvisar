import type { ChartView, FigureDefinition } from "../types";
import { computeView, defaultView } from "./transforms";
import { downloadText, figureToCsv } from "./csv";
import { loadFigureData } from "../data/figures";

export function figureUrl(id: string, search = ""): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#/figure/${encodeURIComponent(id)}${search}`;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export async function downloadFigureCsv(fig: FigureDefinition, view: ChartView = defaultView(fig)) {
  const full = await loadFigureData(fig.id);
  const cv = computeView(full, { ...view, hidden: [] });
  downloadText(`hagvisar-${fig.id}.csv`, figureToCsv(full, cv));
}
