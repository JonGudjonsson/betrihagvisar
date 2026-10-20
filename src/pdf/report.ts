/* ------------------------------------------------------------------ */
/*  "Sækja sem PDF": the whole report as a printed-style PDF, built   */
/*  in the browser. Loaded on demand (import()) by the button.         */
/* ------------------------------------------------------------------ */

import { jsPDF } from "jspdf";
import { svg2pdf } from "svg2pdf.js";
import { PDFDocument, PDFHexString, PDFName, degrees, rgb, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { echarts } from "../lib/echarts";
import { buildOption } from "../lib/chartOptions";
import { computeView, defaultView } from "../lib/transforms";
import { formatDateLong, isoDate } from "../lib/format";
import { CHAPTERS, CHAPTER_BY_ID } from "../data/chapters";
import { FIGURES, loadFigureData } from "../data/figures";
import type { FigureDefinition } from "../types";
import { COL_GAP, COL_W, MARGIN_L, PAGE_H, paginate } from "./layout";
import { CONTENTS, FONT, drawCell, drawContents, drawPageFrame, drawUnavailable, type CellPlan } from "./draw";

export type Progress = (fraction: number, label: string) => void;

const BASE = `${import.meta.env.BASE_URL}pdf/`;
/** Charts are rendered at twice their size and scaled down, giving the report's 5.5pt labels. */
const CHART_SCALE = 2;
/** Cover pages from the 2022 report; only the date is replaced. */
const BEIGE = rgb(231 / 255, 230 / 255, 220 / 255);
const COVER_TEAL = rgb(25 / 255, 140 / 255, 116 / 255);

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

async function fetchBytes(path: string): Promise<ArrayBuffer> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.arrayBuffer();
}

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

async function loadAll(figs: FigureDefinition[], onDone: (n: number) => void): Promise<Map<string, FigureDefinition>> {
  const out = new Map<string, FigureDefinition>();
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < figs.length) {
      const f = figs[next++];
      out.set(f.id, await loadFigureData(f.id));
      onDone(++done);
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  return out;
}

function chartSvg(fig: FigureDefinition, w: number, h: number): string | null {
  const cv = computeView(fig, defaultView(fig));
  if (cv.empty) return null;
  const chart = echarts.init(null as unknown as HTMLElement, undefined, { renderer: "svg", ssr: true, width: w * CHART_SCALE, height: h * CHART_SCALE });
  try {
    chart.setOption(buildOption(fig, cv, { detailed: false, animate: false, fontFamily: FONT }));
    return chart.renderToSVGString();
  } finally {
    chart.dispose();
  }
}

/** Raster fallback for a chart svg2pdf cannot handle. */
async function svgToPng(svg: string, w: number, h: number): Promise<string> {
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = w * 3;
  canvas.height = h * 3;
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

async function drawChart(doc: jsPDF, plan: CellPlan) {
  const { fig, x, chartY, chartH } = plan;
  if (fig.unavailable) return drawUnavailable(doc, plan, fig.unavailable);
  const svg = chartSvg(fig, COL_W, chartH);
  if (!svg) return;
  const el = new DOMParser().parseFromString(svg, "image/svg+xml").documentElement;
  try {
    await svg2pdf(el, doc, { x, y: chartY, width: COL_W, height: chartH });
  } catch (err) {
    console.warn(`PDF: ${fig.id} drawn as an image`, err);
    doc.addImage(await svgToPng(svg, COL_W, chartH), "PNG", x, chartY, COL_W, chartH);
  }
}

/**
 * Navigation as in the original report: each contents row links to its chapter, and the
 * chapters are listed as bookmarks. Added after assembly so the links point at the pages
 * of the final document (the cover shifts every page by one).
 */
function addNavigation(out: PDFDocument, contents: PDFPage, startPage: Record<string, number>) {
  const pages = out.getPages();
  const ctx = out.context;
  const dest = (page: PDFPage) => ctx.obj([page.ref, "XYZ", 0, PAGE_H, null]);
  const chapters = CHAPTERS.filter((c) => startPage[c.id] != null);

  chapters.forEach((c) => {
    const i = CHAPTERS.indexOf(c);
    const y = CONTENTS.firstBaseline + i * CONTENTS.step;
    const link = ctx.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [CONTENTS.x1, PAGE_H - (y + 7), CONTENTS.x2, PAGE_H - (y - 16)],
      Border: [0, 0, 0],
      Dest: dest(pages[startPage[c.id] - 1]),
    });
    contents.node.addAnnot(ctx.register(link));
  });

  const outline = ctx.nextRef();
  const items = chapters.map(() => ctx.nextRef());
  chapters.forEach((c, i) => {
    ctx.assign(
      items[i],
      ctx.obj({
        Title: PDFHexString.fromText(`${c.id} ${c.title}`),
        Parent: outline,
        ...(i > 0 ? { Prev: items[i - 1] } : {}),
        ...(i < items.length - 1 ? { Next: items[i + 1] } : {}),
        Dest: dest(pages[startPage[c.id] - 1]),
      }),
    );
  });
  ctx.assign(outline, ctx.obj({ Type: "Outlines", First: items[0], Last: items[items.length - 1], Count: items.length }));
  out.catalog.set(PDFName.of("Outlines"), outline);
}

/** Builds the report and returns it as a PDF blob. */
export async function generateReportPdf(onProgress: Progress): Promise<Blob> {
  onProgress(0, "Sæki gögn");
  const fonts = await Promise.all(["Regular", "SemiBold", "Italic", "Light"].map((w) => fetchBytes(`fonts/OpenSans-${w}.ttf`)));
  const covers = await fetchBytes("hv-covers.pdf");

  const figures = await loadAll(FIGURES, (n) => onProgress((0.3 * n) / FIGURES.length, "Sæki gögn"));
  const ordered = FIGURES.map((f) => figures.get(f.id) ?? f);
  const { pages, chapterStart } = paginate(ordered, CHAPTERS.map((c) => c.id));

  // Contents page and inside pages (cover is page 1, contents page 2).
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  [["Regular", "normal"], ["SemiBold", "semibold"], ["Italic", "italic"], ["Light", "light"]].forEach(([w, style], i) => {
    doc.addFileToVFS(`OpenSans-${w}.ttf`, toBase64(fonts[i]));
    doc.addFont(`OpenSans-${w}.ttf`, FONT, style);
  });
  const startPage = Object.fromEntries(Object.entries(chapterStart).map(([id, idx]) => [id, idx + 3]));
  drawContents(doc, CHAPTERS, startPage);

  let drawn = 0;
  for (let p = 0; p < pages.length; p++) {
    doc.addPage();
    drawPageFrame(doc, pages[p], p + 3, CHAPTER_BY_ID);
    for (const row of pages[p].rows) {
      for (let i = 0; i < row.figures.length; i++) {
        const fig = row.figures[i];
        const plan = drawCell(doc, fig, MARGIN_L + i * (COL_W + COL_GAP), row.y, row.height);
        await drawChart(doc, plan);
        onProgress(0.3 + (0.62 * ++drawn) / ordered.length, `Teikna ${fig.id}`);
        await nextFrame();
      }
    }
  }

  // Covers from the 2022 report with today's date.
  onProgress(0.93, "Set saman");
  await nextFrame();
  const out = await PDFDocument.create();
  out.registerFontkit(fontkit);
  const coverDoc = await PDFDocument.load(covers);
  const body = await PDFDocument.load(doc.output("arraybuffer"));
  const [front, back] = await out.copyPages(coverDoc, [0, 1]);
  const inside = await out.copyPages(body, body.getPageIndices());
  out.addPage(front);
  inside.forEach((pg) => out.addPage(pg));
  out.addPage(back);
  addNavigation(out, inside[0], startPage);

  const light = await out.embedFont(fonts[3], { subset: true });
  const date = formatDateLong(isoDate(Date.now()));
  // Front: vertical, reading upwards, on the old "2022|4" baseline beside the green band.
  front.drawRectangle({ x: 410, y: 34, width: 38, height: 136, color: BEIGE });
  const size = Math.min(35, 330 / light.widthOfTextAtSize(date, 1));
  front.drawText(date, { x: 441.3, y: 41, size, font: light, color: COVER_TEAL, rotate: degrees(90) });
  // Back: under "HAGVÍSAR" in the lower left corner.
  back.drawRectangle({ x: 40, y: 35, width: 60, height: 17, color: BEIGE });
  back.drawText(date, { x: 42.8, y: 40, size: 14.96, font: light, color: COVER_TEAL });

  out.setTitle(`Hagvísar, ${date}`);
  out.setAuthor("Hagvísar (sýnidæmi), gögn frá Seðlabanka Íslands");
  const bytes = await out.save();
  onProgress(1, "Tilbúið");
  return new Blob([bytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" });
}
