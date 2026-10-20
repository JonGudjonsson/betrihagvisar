import type { ChartType, Frequency, Transform } from "../types";

const MONTHS_SHORT = ["jan.", "feb.", "mar.", "apr.", "maí", "jún.", "júl.", "ágú.", "sept.", "okt.", "nóv.", "des."];
const MONTHS_LONG = ["janúar", "febrúar", "mars", "apríl", "maí", "júní", "júlí", "ágúst", "september", "október", "nóvember", "desember"];

/**
 * Icelandic number formatting (1.234,5) done by hand so it does not depend on
 * the browser shipping Icelandic locale data. Uses a true minus sign.
 */
function formatFixed(v: number, decimals: number): string {
  const neg = v < 0 && Math.abs(v) >= 0.5 * 10 ** -decimals;
  const [int, frac] = Math.abs(v).toFixed(decimals).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${neg ? "\u2212" : ""}${grouped}${frac ? `,${frac}` : ""}`;
}

/** Icelandic number formatting with a sensible number of decimals. */
export function formatNumber(v: number | null | undefined, decimals?: number): string {
  if (v == null || Number.isNaN(v)) return "–";
  const d = decimals ?? (Math.abs(v) >= 100 ? (Math.abs(v) >= 1000 ? 0 : 1) : Math.abs(v) >= 10 ? 1 : 2);
  return formatFixed(v, d);
}

export function formatAxisNumber(v: number): string {
  if (Math.abs(v) >= 1000) return formatFixed(v, 0);
  const d = Number.isInteger(v) ? 0 : Math.abs(v * 10 - Math.round(v * 10)) < 1e-9 ? 1 : 2;
  return formatFixed(v, d);
}

export function monthShort(m: number) {
  return MONTHS_SHORT[m];
}

/** Format an observation date according to its frequency. */
export function formatPeriod(t: number, freq: Frequency): string {
  const d = new Date(t);
  const y = d.getFullYear();
  switch (freq) {
    case "annual":
      return String(y);
    case "quarterly":
      return `${Math.floor(d.getMonth() / 3) + 1}. ársfj. ${y}`;
    case "monthly":
      return `${MONTHS_SHORT[d.getMonth()]} ${y}`;
    case "weekly":
      return `Vika frá ${d.getDate()}. ${MONTHS_SHORT[d.getMonth()]} ${y}`;
    case "daily":
      return `${d.getDate()}. ${MONTHS_SHORT[d.getMonth()]} ${y}`;
  }
}

/** Short tick label for a category axis built from dates. */
export function formatPeriodShort(t: number, freq: Frequency): string {
  const d = new Date(t);
  const y = d.getFullYear();
  if (freq === "annual") return String(y);
  if (freq === "quarterly") return d.getMonth() === 0 ? String(y) : `${Math.floor(d.getMonth() / 3) + 1}F`;
  if (freq === "monthly") return d.getMonth() === 0 ? String(y) : MONTHS_SHORT[d.getMonth()];
  return `${d.getDate()}. ${MONTHS_SHORT[d.getMonth()]}`;
}

/** "17. okt. 2026" from ISO date string. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()}. ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateLong(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()}. ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

export function isoDate(t: number): string {
  const d = new Date(t);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  daily: "Dagleg",
  weekly: "Vikuleg",
  monthly: "Mánaðarleg",
  quarterly: "Ársfjórðungsleg",
  annual: "Árleg",
};

export const FREQUENCY_NOTE: Record<Frequency, string> = {
  daily: "Daglegar tölur",
  weekly: "Vikulegar tölur",
  monthly: "Mánaðarlegar tölur",
  quarterly: "Ársfjórðungslegar tölur",
  annual: "Árlegar tölur",
};

export const CHART_TYPE_LABEL: Record<ChartType, string> = {
  line: "Línurit",
  bar: "Súlurit",
  area: "Flatarmál",
  scatter: "Dreifirit",
  table: "Tafla",
};

export const TRANSFORM_LABEL: Record<Transform, string> = {
  level: "Gildi",
  yoy: "Breyting frá fyrra ári",
  pop: "Breyting frá fyrra tímabili",
  rebase: "Vísitala, upphaf tímabils = 100",
};

export function transformUnit(transform: Transform, freq: Frequency, baseUnit: string, override?: string): string {
  if (override) return override;
  switch (transform) {
    case "level":
      return baseUnit;
    case "yoy":
      return freq === "monthly" ? "12 mánaða breyting (%)" : "Breyting frá fyrra ári (%)";
    case "pop":
      return {
        daily: "Breyting frá fyrri degi (%)",
        weekly: "Breyting frá fyrri viku (%)",
        monthly: "Breyting frá fyrri mánuði (%)",
        quarterly: "Breyting frá fyrri ársfjórðungi (%)",
        annual: "Breyting frá fyrra ári (%)",
      }[freq];
    case "rebase":
      return "Vísitala, upphaf tímabils = 100";
  }
}

export function transformOptionLabel(transform: Transform, freq: Frequency): string {
  if (transform === "yoy") return freq === "monthly" ? "12 mánaða breyting" : "Breyting frá fyrra ári";
  if (transform === "pop") {
    return {
      daily: "Dagsbreyting",
      weekly: "Vikubreyting",
      monthly: "Mánaðarbreyting",
      quarterly: "Ársfjórðungsbreyting",
      annual: "Ársbreyting",
    }[freq];
  }
  return TRANSFORM_LABEL[transform];
}

export function pluralFigures(n: number): string {
  // Icelandic: 1 mynd, 21 mynd, otherwise myndir
  return n % 10 === 1 && n % 100 !== 11 ? `${n} mynd` : `${n} myndir`;
}

export function toRoman(n: number): string {
  const map: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  for (const [v, s] of map) while (n >= v) {
    out += s;
    n -= v;
  }
  return out;
}
