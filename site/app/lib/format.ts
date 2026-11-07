// Number, date and identifier formats: docs/design-system.md 2.7. Always Intl with he-IL; never hand-built.
import { numbers, values as valuesCopy } from "../copy";

const he = "he-IL";
const currency = new Intl.NumberFormat(he, { style: "currency", currency: "ILS", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const currencyWhole = new Intl.NumberFormat(he, { style: "currency", currency: "ILS", maximumFractionDigits: 0 });
const dollars = new Intl.NumberFormat(he, { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const euros = new Intl.NumberFormat(he, { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pounds = new Intl.NumberFormat(he, { style: "currency", currency: "GBP", minimumFractionDigits: 2, maximumFractionDigits: 2 });
// a price per share is a fraction of a cent (0.0035 $): up to four decimals
const dollarsFine = new Intl.NumberFormat(he, { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 4 });
const percent = new Intl.NumberFormat(he, { style: "percent", maximumFractionDigits: 2 });
const percent3 = new Intl.NumberFormat(he, { style: "percent", maximumFractionDigits: 3 });
const plain = new Intl.NumberFormat(he, { maximumFractionDigits: 2 });
const compactNumber = new Intl.NumberFormat(he, { maximumFractionDigits: 1 });
const compactFormat = (v: number) => withMinus(compactNumber.format(v));
const date = new Intl.DateTimeFormat(he, { day: "2-digit", month: "2-digit", year: "numeric" });
const period = new Intl.DateTimeFormat(he, { month: "long", year: "numeric" });
const plural = new Intl.PluralRules("he");

/**
 * Intl's he-IL currency text carries a right-to-left mark and a no-break space around the sign. Copied into a note or a
 * spreadsheet they travel as invisible characters (audit A37); the number is isolated by its own element on the page
 * (`<bdi dir="ltr">`, `unicode-bidi: isolate`), so the right-to-left mark is dropped and the space is an ordinary one (the left-to-right mark before a minus sign stays).
 */
const plainMarks = (text: string) => text.replace(/\u200f/g, "").replace(/[\u00a0\u202f]/g, " ");

/**
 * Intl writes a negative with an ASCII hyphen after a left-to-right mark. A hyphen is weak in the bidi algorithm and can
 * land on the wrong side of the digits in Hebrew text ("2%-"); the true minus sign U+2212 keeps the left-to-right mark in
 * front of it and, with the `<bdi dir="ltr">` that `Num` and every call site put around a figure, reads "−2%".
 */
export const withMinus = (text: string) => text.replace(/\u200e?-/g, "\u200e\u2212");

function compactNisParts(v: number): { num: string; word: string | null } {
  const a = Math.abs(v);
  if (a >= 1e6) return { num: compactFormat(v / 1e6), word: "מיליון" };
  if (a >= 1e3) return { num: compactFormat(v / 1e3), word: "אלף" };
  return { num: compactFormat(v), word: null };
}

/**
 * A billion or more in its short form, always with two decimals (`2.30 מיליארד ₪`, `1,250.00 מיליארד ₪`): a figure with one decimal beside
 * one with two read as different precisions (fresh readers, round 3, 2026-11-07: "'1.6' has one decimal place while the rest have two").
 */
const billions = new Intl.NumberFormat(he, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nisBillions = (v: number) => `${billions.format(Math.abs(v) / 1e9)} ${numbers.billion} ₪`;

/**
 * A row with a figure in the short form writes its other large figures in it too, from a hundred million up (`0.76 מיליארד ₪`): a smaller
 * one keeps its digits, so costs of 9 and 14 million beside 1.86 billion did not both read "0.01 מיליארד ₪".
 */
export const SHORT_IN_ROW = 1e8;

/**
 * A figure's text with every shekel amount of `from` or more ("2,296,540,223 ₪", "+2,296,540,223 ₪") in its short form, or null when it
 * has none. A phone shows it from a billion, so a typed plan's figure is never cut by its fixed column (lens review S2); a computer from a
 * thousand billion. A row that writes one of its figures short passes `SHORT_IN_ROW`, so its figures read in one form: "758,833,521 ₪"
 * beside "1.57 מיליארד ₪" read as the larger of the two (fresh readers, round 3).
 */
export function shortBillions(text: string, from = 1e9): string | null {
  let hit = false;
  const out = text.replace(/(\d{1,3}(?:,\d{3})+)(?:\.\d+)? ₪/g, (whole, digits: string) => {
    const v = Number(digits.replace(/,/g, ""));
    if (v < from) return whole;
    hit = true;
    return nisBillions(v);
  });
  return hit ? out : null;
}

export const fmt = {
  /** `1,234.50 ₪` (two decimals, method §13). */
  nis: (v: number) => withMinus(plainMarks(currency.format(v))),
  nisWhole: (v: number) => withMinus(plainMarks(currencyWhole.format(v))),
  /** `7.00 $`: a bound or a fee a foreign or bank price list prints in dollars (2026-11-04: until then a bare "2"). */
  usd: (v: number) => withMinus(plainMarks(dollars.format(v))),
  /** `25.00 €` and `5.00 £`: a bound a price list prints in euros or pounds, for trades abroad (2026-11-05: until then a bare "25"). */
  eur: (v: number) => withMinus(plainMarks(euros.format(v))),
  gbp: (v: number) => withMinus(plainMarks(pounds.format(v))),
  /** `0.0035 $`: a price per share. */
  usdFine: (v: number) => withMinus(plainMarks(dollarsFine.format(v))),
  /** Data stores percent numbers (`1.05` is 1.05%). */
  pct: (v: number) => {
    // a figure that really has a third decimal (a 0.015% trustee fee, a 1.115% sum) keeps it; everything else rounds to two
    const thousandths = v * 1000;
    return Math.abs(thousandths - Math.round(thousandths)) < 1e-6 && Math.abs(v * 100 - Math.round(v * 100)) > 1e-6 ? withMinus(percent3.format(v / 100)) : withMinus(percent.format(v / 100));
  },
  /** The number `pct` shows, as a number: what a field prefilled from a displayed percentage holds (0.4293 reads 0.43). */
  pctShown: (v: number) => {
    const thousandths = v * 1000;
    return Math.abs(thousandths - Math.round(thousandths)) < 1e-6 && Math.abs(v * 100 - Math.round(v * 100)) > 1e-6 ? Math.round(thousandths) / 1000 : Math.round(v * 100) / 100;
  },
  number: (v: number) => withMinus(plain.format(v)),
  /**
   * `22.10.2026` from `2026-10-22`. A document that prints only a month is dated `2025-11` (fees schema, 2026-11-07); it is said as the
   * month, `נובמבר 2025`, never with an invented first day.
   */
  date: (iso: string) => (/^\d{4}-\d{2}$/.test(iso) ? period.format(new Date(iso + "-01T00:00:00")) : date.format(new Date(iso + "T00:00:00"))),
  /** `ספטמבר 2026` from `2026-09`. */
  period: (ym: string) => period.format(new Date(ym + "-01T00:00:00")),
  /** Chart ticks, as running text: `200 אלף ₪`, `1.5 מיליון ₪`. A scale mark, not a figure (design-system Q4). */
  compactNis: (v: number) => {
    const p = compactNisParts(v);
    return p.word ? `${p.num} ${p.word} ₪` : `${p.num} ₪`;
  },
  /**
   * The same mark for an SVG `<text>`, spelled in visual left-to-right order inside a left-to-right isolate:
   * `₪ אלף 200`. WebKit reorders mixed Hebrew and digits in SVG text on its own and drew "100₪אלף" (audit A62);
   * a text that is already in visual order and isolated is drawn the same way by every engine.
   */
  compactNisAxis: (v: number) => {
    const p = compactNisParts(v);
    return `\u2066₪ ${p.word ? `${p.word} ` : ""}${p.num}\u2069`;
  },
  /** Hebrew year forms (copy.md §1): שנה, שנתיים, {n} שנים. */
  years: (n: number) => {
    const form = plural.select(n);
    if (n === 1) return "שנה";
    if (n === 2 || form === "two") return "שנתיים";
    return `${plain.format(n)} שנים`;
  },
  months: (n: number) => (n === 1 ? "חודש" : n === 2 ? "חודשיים" : `${plain.format(n)} חודשים`),
};

/**
 * Display rounding (audit 2026-10-24 A13; method §13 unchanged, this is display only). A computed, entered or
 * parameter shekel amount of 1,000 ₪ or more shows whole shekels; a whole-number amount of any size shows no agorot
 * ("10,000 ₪", "0 ₪"), per month and per trade as well. Tariffs and fees (sourced, non-parameter) and every figure under 1,000 ₪ that has agorot keep
 * two decimals. The values themselves are never rounded; the detail view of a table keeps two decimals.
 */
export function nisShown(v: number, state?: "sourced" | "computed" | "entered", parameter = false): string {
  const derived = state === "computed" || state === "entered" || parameter;
  if (derived && (Math.abs(v) >= 1000 || Number.isInteger(v))) return fmt.nisWhole(v);
  return fmt.nis(v);
}

/**
 * Whether a computed shekel amount sits within `within` ₪ of a threshold (F-62's P-03 thresholds): there the whole-shekel
 * rounding could print the threshold's own figure for a value on the other side of it (2,499.60 as "2,500 ₪"), so two decimals are kept.
 */
export function nearThreshold(v: number, thresholds: readonly number[], within = 0.5): boolean {
  return thresholds.some((t) => Math.abs(v - t) <= within);
}

/**
 * A lead that ends in a maqaf ("ב־", "מ־", "תעריפון מ־") before what follows it: the maqaf joins a one-letter prefix to digits
 * ("ב־2025", "מ־1,000 ₪"), and before a Hebrew word the letter is simply written on the word ("מנובמבר 2025", "בשנה", "בשנתיים";
 * copy.md 10). Returns the lead as it is written before `next`.
 */
export const joinLead = (lead: string, next: string): string => (lead.endsWith("\u05be") && /^[\u05d0-\u05ea]/.test(next.trimStart()) ? lead.slice(0, -1) : lead);

/** A figure's text by its unit. Dates and periods arrive as `text` values in ISO form. `state` applies the display rounding to shekel amounts (`nisShown`). */
export function formatValue(value: number | string | boolean | null, unit: string, state?: "sourced" | "computed" | "entered", parameter = false): string {
  if (value === null) return numbers.unknown;
  if (typeof value === "boolean") return value ? numbers.yes : numbers.no;
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return fmt.date(value);
    if (/^\d{4}-\d{2}$/.test(value)) return fmt.period(value);
    if (numbers.enums[value]) return numbers.enums[value]!;
    const dm = /^(\d{1,2}) ([A-Z][a-z]+)$/.exec(value);
    if (dm && numbers.monthsHe[dm[2]!]) return `${dm[1]} ${numbers.monthsHe[dm[2]!]}`;
    return value;
  }
  switch (unit) {
    case "nis":
    case "nis_per_month":
    case "nis_per_trade":
    case "nis_per_transfer":
      return state ? nisShown(value, state, parameter) : fmt.nis(value);
    case "usd":
    case "usd_per_trade":
      return fmt.usd(value);
    case "usd_per_share":
      return fmt.usdFine(value);
    case "eur":
      return fmt.eur(value);
    case "gbp_per_trade":
      return fmt.gbp(value);
    case "nis_millions":
      return `${fmt.number(value)} ${numbers.nisMillions}`;
    case "nis_per_usd":
      return `${fmt.number(value * 100)} ${numbers.agorotPerDollar}`;
    case "pct":
    case "pct_per_year":
    case "pct_of_deposit":
    case "pct_of_trade":
    case "pct_of_balance_per_period":
      return fmt.pct(value);
    default:
      return fmt.number(value);
  }
}

/**
 * What a reader means by a point where the conclusion changes (fresh readers, 2026-11-07: "8.17 שנים" read as oddly precise): years whole,
 * or halves under 3; a return or inflation in percent whole from 3, halves from 1, tenths below; a fee's rate in tenths of a percent, hundredths
 * under 0.1% (fees run 0.1% to 4%, where halves would carry a 1.17% point to 1.5%). It rounds away from the value now, toward
 * the side the conclusion has already changed on, so the value shown still changes it; the sheet that opens on it keeps the exact point.
 */
export function readerRound(x: number, side: "lo" | "hi", unit: "years" | "pct" | "fee"): number {
  const a = Math.abs(x);
  const step = unit === "years" ? (a >= 3 ? 1 : 0.5) : unit === "fee" ? (a >= 0.1 ? 0.1 : 0.01) : a >= 3 ? 1 : a >= 1 ? 0.5 : a >= 0.1 ? 0.1 : 0.01;
  const r = side === "lo" ? Math.floor(x / step + 1e-9) * step : Math.ceil(x / step - 1e-9) * step;
  // never rounded down to nothing, nor up across the point (finance review, 2026-11-07): a point under one step rounds down in a finer step
  if (side === "lo" && r <= 0 && x > 0) {
    for (let fine = step / 10; fine >= 1e-4; fine /= 10) {
      const f = Math.floor(x / fine + 1e-9) * fine;
      if (f > 0) return Number(f.toFixed(4));
    }
    return Number(x.toFixed(4));
  }
  return Number(r.toFixed(2));
}

/** Unit word beside an input field (values sheet). */
export function unitWord(unit: string): string {
  if (unit.startsWith("nis")) return valuesCopy.units.nis;
  if (unit.startsWith("pct")) return valuesCopy.units.pct;
  if (unit === "years") return valuesCopy.units.years;
  return "";
}

/**
 * The one parser for every number a person types (audit A6). Strips spaces (also no-break and thin), ₪, % and bidi
 * marks; a minus sign in any dash form. Decimal point or comma: a single "," followed by one or two digits and no other
 * separator is a decimal point ("2,5" is 2.5, "4,25" is 4.25); a comma followed by exactly three digits is a thousands
 * separator ("12,000" is 12000, "1,234,567" is 1234567); "1.234,5" and "1,234.5" read the last separator as the
 * decimal point. Anything else, letters included, is NaN. Returns a number or NaN, never a guess.
 */
export function parseNumber(text: string): number {
  let t = text.replace(/[\s\u00a0\u202f\u200e\u200f\u202a-\u202e\u2066-\u2069₪%]/g, "").replace(/[−–—‐-]/g, "-");
  if (t === "" || /[^\d.,+-]/.test(t)) return Number.NaN;
  const neg = t.startsWith("-");
  t = t.replace(/^[+-]/, "");
  if (/[+-]/.test(t)) return Number.NaN;
  const lastComma = t.lastIndexOf(",");
  const lastDot = t.lastIndexOf(".");
  let intPart = t;
  let frac = "";
  if (lastComma >= 0 && lastDot >= 0) {
    const sep = Math.max(lastComma, lastDot);
    intPart = t.slice(0, sep);
    frac = t.slice(sep + 1);
    // the other separator must be the thousands one, used consistently
    const other = lastComma > lastDot ? "." : ",";
    if (intPart.includes(lastComma > lastDot ? "," : ".")) return Number.NaN;
    intPart = intPart.split(other).join("");
  } else if (lastComma >= 0) {
    const parts = t.split(",");
    const last = parts[parts.length - 1]!;
    if (parts.length === 2 && last.length >= 1 && last.length <= 2) {
      intPart = parts[0]!;
      frac = last;
    } else if (parts.slice(1).every((p) => p.length === 3) && parts[0]!.length >= 1) intPart = parts.join("");
    else return Number.NaN;
  } else if (lastDot >= 0) {
    const parts = t.split(".");
    if (parts.length === 2) {
      intPart = parts[0]!;
      frac = parts[1]!;
    } else if (parts.slice(1).every((p) => p.length === 3) && parts[0]!.length >= 1) intPart = parts.join("");
    else return Number.NaN;
  }
  if (!/^\d*$/.test(intPart) || !/^\d*$/.test(frac) || (intPart === "" && frac === "")) return Number.NaN;
  const n = Number(`${intPart || "0"}${frac ? "." + frac : ""}`);
  return neg ? -n : n;
}

/** Thousands separators for a typed field, left to right (`1,500`, `5`, `-2.5`). */
export function formatTyped(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(n);
}
