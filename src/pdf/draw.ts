/* ------------------------------------------------------------------ */
/*  Drawing the inside pages of the printed-style report with jsPDF.  */
/*  Sizes and colours follow docs/HV_desember 2022.pdf.               */
/* ------------------------------------------------------------------ */

import type { jsPDF } from "jspdf";
import type { Chapter, FigureDefinition } from "../types";
import { seriesColor, defaultView } from "../lib/transforms";
import { transformUnit } from "../lib/format";
import { legendLabel, legendSeries } from "../components/FigureLegend";
import {
  COL_W,
  HEADER_BASELINE,
  HEADER_RULE_Y,
  MARGIN_L,
  MARGIN_R,
  PAGE_NUMBER_Y,
  PAGE_W,
  type PageModel,
} from "./layout";

export const FONT = "Open Sans";
const TEAL = "#008E72";
const TEXT = "#231F20";
const MUTED = "#6D6E71";
const PANEL = "#F2F2F2";

const ID_SIZE = 6.8;
const TITLE_SIZE = 8.6;
const TITLE_LH = 10.6;
const SUB_SIZE = 6.8;
const UNIT_SIZE = 5.8;
const LEGEND_SIZE = 6;
const LEGEND_LH = 8.2;
const NOTE_SIZE = 6;
const NOTE_LH = 7.3;
const MIN_CHART_H = 70;
/** Chart height in the 2022 report; what is left of a row becomes space before the next one. */
const MAX_CHART_H = 108;
/** Least space kept under a figure's sources. */
const ROW_GAP = 18;

/** Where and how big the chart of a cell is, worked out before drawing it. */
export interface CellPlan {
  fig: FigureDefinition;
  x: number;
  chartY: number;
  chartH: number;
}

function font(doc: jsPDF, style: "normal" | "semibold" | "italic" | "light", size: number, color = TEXT) {
  doc.setFont(FONT, style);
  doc.setFontSize(size);
  doc.setTextColor(color);
}

function chapterTitle(chapter: Chapter) {
  return `${chapter.id} ${chapter.title}`;
}

function heading(doc: jsPDF, chapter: Chapter, baseline: number, ruleY: number) {
  font(doc, "light", 16.5, TEAL);
  doc.text(chapterTitle(chapter), MARGIN_L, baseline);
  doc.setDrawColor(TEAL);
  doc.setLineWidth(1);
  doc.line(MARGIN_L, ruleY, MARGIN_R, ruleY);
}

/** Page frame: chapter header with its rule and the page number. */
export function drawPageFrame(doc: jsPDF, page: PageModel, pageNumber: number, chapters: Record<string, Chapter>) {
  heading(doc, chapters[page.chapterId], HEADER_BASELINE, HEADER_RULE_Y);
  font(doc, "normal", 7, TEXT);
  doc.text(String(pageNumber), PAGE_W / 2, PAGE_NUMBER_Y, { align: "center" });
}

interface LegendItem {
  label: string;
  color: string;
  kind: "line" | "dashed" | "box" | "dot" | "dotline";
  w: number;
}

function legendItems(doc: jsPDF, fig: FigureDefinition): LegendItem[] {
  font(doc, "normal", LEGEND_SIZE);
  return legendSeries(fig, defaultView(fig).transform).map((s) => {
    const kind = s.kind ?? fig.chartType;
    const k: LegendItem["kind"] =
      kind === "bar" || kind === "area" ? "box" : kind === "scatter" ? "dot" : s.markers ? "dotline" : s.dashed ? "dashed" : "line";
    const label = legendLabel(fig, s);
    const sw = k === "box" || k === "dot" ? 6 : 11;
    return { label, color: seriesColor(fig, s), kind: k, w: sw + 3 + doc.getTextWidth(label) };
  });
}

/** Lay legend items out in rows across the cell width. */
function legendRows(items: LegendItem[], width: number): LegendItem[][] {
  const rows: LegendItem[][] = [];
  let row: LegendItem[] = [];
  let used = 0;
  for (const it of items) {
    const need = (row.length ? 9 : 0) + it.w;
    if (row.length && used + need > width) {
      rows.push(row);
      row = [];
      used = 0;
    }
    used += (row.length ? 9 : 0) + it.w;
    row.push(it);
  }
  if (row.length) rows.push(row);
  return rows;
}

function drawLegend(doc: jsPDF, rows: LegendItem[][], x: number, y: number) {
  rows.forEach((row, ri) => {
    let cx = x;
    const base = y + ri * LEGEND_LH + 5.4;
    const mid = base - 1.9;
    for (const it of row) {
      doc.setDrawColor(it.color);
      doc.setFillColor(it.color);
      if (it.kind === "box") doc.rect(cx, mid - 2.6, 5.2, 5.2, "F");
      else if (it.kind === "dot") doc.circle(cx + 3, mid, 2, "F");
      else {
        doc.setLineWidth(1.3);
        if (it.kind === "dashed") doc.setLineDashPattern([2, 1.5], 0);
        doc.line(cx, mid, cx + 11, mid);
        doc.setLineDashPattern([], 0);
        if (it.kind === "dotline") doc.circle(cx + 5.5, mid, 1.6, "F");
      }
      const sw = it.kind === "box" || it.kind === "dot" ? 6 : 11;
      font(doc, "normal", LEGEND_SIZE);
      doc.text(it.label, cx + sw + 3, base);
      cx += it.w + 9;
    }
  });
}

function sourceLine(fig: FigureDefinition) {
  return fig.sources.length ? `${fig.sources.length > 1 ? "Heimildir" : "Heimild"}: ${fig.sources.join(", ")}.` : "";
}

/**
 * Draws everything in a figure cell except the chart itself and returns where the chart
 * goes. The chart gets the height left over by title, units, legend and notes.
 */
export function drawCell(doc: jsPDF, fig: FigureDefinition, x: number, y: number, height: number): CellPlan {
  const w = COL_W;
  font(doc, "normal", ID_SIZE, MUTED);
  doc.text(fig.id, x, y + 7);

  font(doc, "normal", TITLE_SIZE);
  const title = (doc.splitTextToSize(fig.title, w - 16) as string[]).slice(0, 2);
  let cy = y + 19;
  title.forEach((line, i) => doc.text(line, x + w / 2, cy + i * TITLE_LH, { align: "center" }));
  cy += (title.length - 1) * TITLE_LH;
  if (fig.subtitle) {
    font(doc, "normal", SUB_SIZE, MUTED);
    cy += 9;
    doc.text((doc.splitTextToSize(fig.subtitle, w - 16) as string[])[0], x + w / 2, cy, { align: "center" });
  }

  // units above the axes
  cy += 11;
  font(doc, "normal", UNIT_SIZE, TEXT);
  const unit = transformUnit(defaultView(fig).transform, fig.frequency, fig.unit, fig.transformLabels?.[defaultView(fig).transform]);
  if (unit) doc.text((doc.splitTextToSize(unit, w * 0.55) as string[])[0], x, cy);
  const right = fig.series.some((s) => s.axis === "right") ? fig.unitRight : undefined;
  const corner = right ?? fig.latest;
  if (corner) doc.text((doc.splitTextToSize(corner, w * 0.45) as string[])[0], x + w, cy, { align: "right" });
  const chartY = cy + 2;

  // bottom-up: notes and sources, then the legend
  font(doc, "normal", NOTE_SIZE);
  let note = fig.note ? (doc.splitTextToSize(fig.note, w) as string[]) : [];
  font(doc, "italic", NOTE_SIZE);
  const src = sourceLine(fig) ? (doc.splitTextToSize(sourceLine(fig), w) as string[]) : [];
  const legend = legendRows(legendItems(doc, fig), w);
  const bottom = y + height - ROW_GAP;
  const fixed = legend.length * LEGEND_LH + 5 + (note.length + src.length) * NOTE_LH + 4;
  let chartH = bottom - fixed - chartY;
  if (chartH < MIN_CHART_H) {
    // long notes: keep the chart readable and shorten the note
    const spare = Math.floor((MIN_CHART_H - chartH) / NOTE_LH);
    if (spare > 0 && note.length) {
      note = note.slice(0, Math.max(1, note.length - spare));
      note[note.length - 1] = note[note.length - 1].replace(/\s*\S*$/, " …");
    }
    chartH = Math.max(MIN_CHART_H, bottom - (legend.length * LEGEND_LH + 5 + (note.length + src.length) * NOTE_LH + 4) - chartY);
  }
  chartH = Math.min(chartH, MAX_CHART_H);

  let ly = chartY + chartH + 3;
  drawLegend(doc, legend, x, ly);
  ly += legend.length * LEGEND_LH + 5;
  font(doc, "normal", NOTE_SIZE);
  note.forEach((line) => {
    ly += NOTE_LH;
    doc.text(line, x, ly);
  });
  font(doc, "italic", NOTE_SIZE);
  src.forEach((line) => {
    ly += NOTE_LH;
    doc.text(line, x, ly);
  });

  return { fig, x, chartY, chartH };
}

/** Grey box with the bank's note, for sheets published without data. */
export function drawUnavailable(doc: jsPDF, plan: CellPlan, message: string) {
  doc.setFillColor(PANEL);
  doc.rect(plan.x, plan.chartY + 4, COL_W, plan.chartH - 8, "F");
  font(doc, "normal", 6.6, MUTED);
  const lines = doc.splitTextToSize(message, COL_W - 40) as string[];
  const top = plan.chartY + plan.chartH / 2 - ((lines.length - 1) * 8) / 2;
  lines.forEach((l, i) => doc.text(l, plan.x + COL_W / 2, top + i * 8, { align: "center" }));
}

/** Rows of the contents page: baseline of the first row, row spacing and the clickable span. */
export const CONTENTS = { firstBaseline: 160, step: 25.8, x1: 92, x2: 490 };

/** Contents page, as page 2 of the 2022 report. */
export function drawContents(doc: jsPDF, chapters: Chapter[], startPage: Record<string, number>) {
  doc.setFillColor(PANEL);
  doc.rect(MARGIN_L, 57.5, MARGIN_R - MARGIN_L, 727, "F");
  font(doc, "light", 22, TEAL);
  doc.text("Efnisyfirlit", 137, 104);
  chapters.forEach((c, i) => {
    const y = CONTENTS.firstBaseline + i * CONTENTS.step;
    doc.setFont("times", "normal");
    doc.setFontSize(19);
    doc.setTextColor(TEAL);
    doc.text(c.id, 99, y + 1);
    font(doc, "normal", 11, TEAL);
    doc.text(c.title, 144.5, y);
    if (startPage[c.id] != null) doc.text(String(startPage[c.id]), 482, y, { align: "right" });
  });
  font(doc, "normal", 7, TEXT);
  doc.text("2", PAGE_W / 2, PAGE_NUMBER_Y, { align: "center" });
}
