// Number, date and identifier formats: docs/design-system.md 2.7. Always Intl with he-IL; never hand-built.
import { numbers, values as valuesCopy } from "../copy";

const he = "he-IL";
const currency = new Intl.NumberFormat(he, { style: "currency", currency: "ILS", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const currencyWhole = new Intl.NumberFormat(he, { style: "currency", currency: "ILS", maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat(he, { style: "percent", maximumFractionDigits: 2 });
const plain = new Intl.NumberFormat(he, { maximumFractionDigits: 2 });
const compactNumber = new Intl.NumberFormat(he, { maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat(he, { day: "2-digit", month: "2-digit", year: "numeric" });
const period = new Intl.DateTimeFormat(he, { month: "long", year: "numeric" });
const plural = new Intl.PluralRules("he");

export const fmt = {
  /** `1,234.50 ₪` (two decimals, method §13). */
  nis: (v: number) => currency.format(v),
  nisWhole: (v: number) => currencyWhole.format(v),
  /** Data stores percent numbers (`1.05` is 1.05%). */
  pct: (v: number) => percent.format(v / 100),
  number: (v: number) => plain.format(v),
  /** `22.10.2026` from `2026-10-22`. */
  date: (iso: string) => date.format(new Date(iso + "T00:00:00")),
  /** `ספטמבר 2026` from `2026-09`. */
  period: (ym: string) => period.format(new Date(ym + "-01T00:00:00")),
  /** Chart ticks: `200 אלף ₪`, `1.5 מיליון ₪`. A scale mark, not a figure (design-system Q4). */
  compactNis: (v: number) => {
    const a = Math.abs(v);
    if (a >= 1e6) return `${compactNumber.format(v / 1e6)} מיליון ₪`;
    if (a >= 1e3) return `${compactNumber.format(v / 1e3)} אלף ₪`;
    return `${compactNumber.format(v)} ₪`;
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

/** A figure's text by its unit. Dates and periods arrive as `text` values in ISO form. */
export function formatValue(value: number | string | boolean | null, unit: string): string {
  if (value === null) return numbers.unknown;
  if (typeof value === "boolean") return value ? numbers.yes : numbers.no;
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return fmt.date(value);
    if (/^\d{4}-\d{2}$/.test(value)) return fmt.period(value);
    return value;
  }
  switch (unit) {
    case "nis":
    case "nis_per_month":
    case "nis_per_trade":
    case "nis_per_transfer":
      return fmt.nis(value);
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

/** Unit word beside an input field (values sheet). */
export function unitWord(unit: string): string {
  if (unit.startsWith("nis")) return valuesCopy.units.nis;
  if (unit.startsWith("pct")) return valuesCopy.units.pct;
  if (unit === "years") return valuesCopy.units.years;
  return "";
}

/** Parses what a person typed: commas, spaces, ₪ and % are cleaned; letters are an error (NaN). */
export function parseTyped(text: string): number {
  const cleaned = text.replace(/[\s,₪%‎‏]/g, "").replace(/[−–]/g, "-");
  if (cleaned === "" || !/^-?\d*\.?\d+$/.test(cleaned)) return Number.NaN;
  return Number(cleaned);
}

/** Thousands separators for a typed field, left to right (`1,500`, `5`, `-2.5`). */
export function formatTyped(n: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 }).format(n);
}
