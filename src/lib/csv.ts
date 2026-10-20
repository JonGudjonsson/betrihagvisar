import type { FigureDefinition } from "../types";
import type { ComputedView } from "./transforms";
import { isoDate } from "./format";
import { RELEASE } from "../data/figures";

function cell(v: string | number | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Build a semicolon-separated CSV (Excel-friendly in Icelandic locale). */
export function figureToCsv(fig: FigureDefinition, cv: ComputedView): string {
  const lines: string[] = [];
  const num = (v: number | null | undefined) => (v == null ? "" : String(v).replace(".", ","));

  if (fig.chartType === "table" && fig.table) {
    lines.push(fig.table.columns.map(cell).join(";"));
    fig.table.rows.forEach((r) => lines.push(r.map((c) => (typeof c === "number" ? num(c) : cell(c))).join(";")));
  } else if (fig.chartType === "scatter") {
    lines.push(["Land", fig.axisLabels?.x ?? "x", fig.axisLabels?.y ?? "y"].map(cell).join(";"));
    fig.series.flatMap((s) => s.points ?? []).forEach((p) => lines.push([cell(p.label), num(p.x), num(p.y)].join(";")));
  } else if (fig.xType === "category") {
    lines.push(["", ...fig.series.map((s) => s.name)].map(cell).join(";"));
    (fig.categories ?? []).forEach((c, i) => lines.push([cell(c), ...fig.series.map((s) => num(s.values?.[i]))].join(";")));
  } else {
    const times = Array.from(new Set(cv.series.flatMap((s) => s.points.map((p) => p.t)))).sort((a, b) => a - b);
    const maps = cv.series.map((s) => new Map(s.points.map((p) => [p.t, p.v])));
    lines.push(["Dagsetning", ...cv.series.map((s) => s.def.name)].map(cell).join(";"));
    times.forEach((t) => lines.push([isoDate(t), ...maps.map((m) => num(m.get(t)))].join(";")));
  }
  const header = [
    `# ${fig.id} ${fig.title}`,
    `# ${cv.unit}${fig.unitRight && fig.series.some((s) => s.axis === "right") ? ` / ${fig.unitRight} (h. ás)` : ""}`,
    `# Heimildir: ${fig.sources.join(", ")}`,
    `# Hagvísar Seðlabanka Íslands, ${RELEASE.label}`,
  ];
  return "﻿" + [...header, ...lines].join("\r\n");
}

export function downloadText(filename: string, text: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
