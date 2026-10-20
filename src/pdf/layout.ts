/* ------------------------------------------------------------------ */
/*  Page layout of the printed-style report, measured from            */
/*  docs/HV_desember 2022.pdf (A4, points, origin top-left).          */
/* ------------------------------------------------------------------ */

import type { FigureDefinition } from "../types";

export const PAGE_W = 595.28;
export const PAGE_H = 841.89;
export const MARGIN_L = 57.5;
export const MARGIN_R = 537.4;
export const COL_GAP = 24;
export const COL_W = (MARGIN_R - MARGIN_L - COL_GAP) / 2;
/** Chapter title baseline and the rule under it at the top of every page. */
export const HEADER_BASELINE = 64;
export const HEADER_RULE_Y = 74.2;
/** Figures fill the space between these. */
export const CONTENT_TOP = 92;
export const CONTENT_BOTTOM = 792;
export const PAGE_NUMBER_Y = 815;
export const ROWS_PER_PAGE = 3;
/** Every row gets the same height: three rows fill the space between header and page number. */
export const ROW_H = (CONTENT_BOTTOM - CONTENT_TOP) / ROWS_PER_PAGE;

export interface Row {
  figures: FigureDefinition[];
  y: number;
  height: number;
}

export interface PageModel {
  /** Chapter shown in the page header. */
  chapterId: string;
  rows: Row[];
}

export interface Pagination {
  pages: PageModel[];
  /** Index into `pages` of each chapter's first page. */
  chapterStart: Record<string, number>;
}

/**
 * Two figures per row, three rows per page, and every chapter starts on a new page
 * (unlike the 2022 report, where a chapter could begin part-way down a page).
 */
export function paginate(figures: FigureDefinition[], chapterOrder: string[]): Pagination {
  const pages: PageModel[] = [];
  const chapterStart: Record<string, number> = {};

  for (const chapterId of chapterOrder) {
    const figs = figures.filter((f) => f.chapterId === chapterId);
    if (!figs.length) continue;
    chapterStart[chapterId] = pages.length;
    let page: PageModel | undefined;
    for (let i = 0; i < figs.length; i += 2) {
      if (!page || page.rows.length === ROWS_PER_PAGE) {
        page = { chapterId, rows: [] };
        pages.push(page);
      }
      page.rows.push({ figures: figs.slice(i, i + 2), y: CONTENT_TOP + page.rows.length * ROW_H, height: ROW_H });
    }
  }
  return { pages, chapterStart };
}
