// A bank's deposits or savings plans as one table on its company page: the records the bank prints under one name and terms, differing only by
// the amount deposited, stand as one row with a rate for each amount; rows stand under their kind (פיקדון יומי, שבועי…); what is true of every
// row is said once over the table. Pure: no React, no I/O.
import type { ProductRowData } from "../components/decoder/institutions/types";
import type { SiteValue } from "./value";
import { r4catalogue as copy } from "../copy";
import { onlyAtExits, termWords } from "./deposit-kind";

export interface TableRow {
  key: string;
  /** The row's records, by amount from the smallest: one, or one per amount range. */
  lines: ProductRowData[];
}

export interface KindGroup {
  /** The kind as the bank's 447 table names it ("פיקדון שבועי"). */
  kind: string;
  rows: TableRow[];
}

const num = (v: SiteValue | null | undefined): number | null => (v && typeof v.value === "number" ? v.value : null);

/** An amount range as one key: "1000-99999", "250000-". */
export const rangeKey = (p: ProductRowData): string => `${num(p.amountMin) ?? 0}-${num(p.amountMax) ?? ""}`;

/** Everything about a record but its amount, its rate, its date and its doubt: two records that share it are one deposit at two amounts. */
const sameDeposit = (p: ProductRowData): string =>
  JSON.stringify([p.name, p.model, p.type447, p.term.value, p.term.unit, p.rateType, p.anchor, p.linkage, p.variant, p.breakTerms.penalty, p.breakTerms.quotes, p.exitPoints, p.autoRenew, p.conditions, p.currentAccount, p.alsoCalled]);

/** How many days a period is, roughly, to order kinds and rows from the shortest. */
const termDays = (p: ProductRowData): number => {
  const v = num(p.term);
  if (v === null) return Infinity;
  return p.term.unit === "days" ? v : p.term.unit === "years" ? v * 365 : v * 30.4;
};

/**
 * The records as rows: those that differ only by amount are one row. Should two such records name the same amount (the bank prints a deposit
 * twice), they stay rows of their own, so no cell ever holds two rates.
 */
export function tableRows(products: readonly ProductRowData[]): TableRow[] {
  const by = new Map<string, ProductRowData[]>();
  for (const p of products) by.set(sameDeposit(p), [...(by.get(sameDeposit(p)) ?? []), p]);
  const out: TableRow[] = [];
  for (const list of by.values()) {
    const sorted = [...list].sort((a, b) => (num(a.amountMin) ?? 0) - (num(b.amountMin) ?? 0) || (a.id < b.id ? -1 : 1));
    if (new Set(sorted.map(rangeKey)).size < sorted.length) out.push(...sorted.map((p) => ({ key: p.id, lines: [p] })));
    else out.push({ key: sorted[0]!.id, lines: sorted });
  }
  return out;
}

/** The rows under their kinds, kinds and rows from the shortest period, then by name. */
export function kindGroups(rows: readonly TableRow[]): KindGroup[] {
  const by = new Map<string, TableRow[]>();
  for (const r of rows) by.set(r.lines[0]!.type447, [...(by.get(r.lines[0]!.type447) ?? []), r]);
  const minDays = (list: TableRow[]) => Math.min(...list.map((r) => termDays(r.lines[0]!)));
  return [...by]
    .map(([kind, list]) => ({ kind, rows: [...list].sort((a, b) => termDays(a.lines[0]!) - termDays(b.lines[0]!) || a.lines[0]!.name.localeCompare(b.lines[0]!.name, "he")) }))
    .sort((a, b) => minDays(a.rows) - minDays(b.rows) || a.kind.localeCompare(b.kind, "he"));
}

export interface AmountBand {
  key: string;
  min: SiteValue;
  max: SiteValue | null;
}

/**
 * The amount ranges every row shares, from the smallest: then each is a rate column of its own. Null when the rows' ranges differ (each row
 * then lists its own amounts, as the deposits page does).
 */
export function sharedBands(rows: readonly TableRow[]): AmountBand[] | null {
  if (rows.length === 0) return null;
  const sets = new Set(rows.map((r) => r.lines.map(rangeKey).join(",")));
  if (sets.size !== 1) return null;
  return rows[0]!.lines.map((p) => ({ key: rangeKey(p), min: p.amountMin, max: p.amountMax }));
}

/** The record of a row at an amount range, if the row has it. */
export const lineAt = (row: TableRow, band: string): ProductRowData | null => row.lines.find((p) => rangeKey(p) === band) ?? null;

/** What a deposit's break comes to, as one key: a deposit that cannot be broken but has exit points says so apart. */
export const breakKey = (p: ProductRowData): string => (onlyAtExits(p.breakTerms.penalty, p.exitPoints.exists) ? "atExits" : p.breakTerms.penalty);

/** Which facts every record of the table shares, so they are said once over it; each `false` stays in the rows. */
export interface Shared {
  rateType: boolean;
  exits: boolean;
  breakTerms: boolean;
  autoRenew: boolean;
  linkage: boolean;
  tax: boolean;
  term: boolean;
  /** The bank's printed conditions, the same on every record (Leumi's line about a digital benefit). */
  conditions: boolean;
  /** The bank's own words about a break, the same on every record ("אין אפשרות שבירה"). */
  breakQuotes: boolean;
  /** The tax differs, but each linkage has one (every unlinked deposit one rate, every linked one another): said once per linkage. */
  taxByLinkage: boolean;
}

export function sharedFacts(products: readonly ProductRowData[]): Shared {
  const one = (f: (p: ProductRowData) => unknown) => products.length > 0 && new Set(products.map((p) => JSON.stringify(f(p)))).size === 1;
  return {
    rateType: one((p) => p.rateType),
    exits: one((p) => p.exitPoints),
    // whether a deposit can be broken; where some have exit points, the exits column says so on their rows
    breakTerms: one((p) => p.breakTerms.penalty),
    autoRenew: one((p) => p.autoRenew),
    linkage: one((p) => p.linkage),
    tax: one((p) => p.taxBucket.value),
    term: one((p) => [p.term.value, p.term.unit]),
    conditions: one((p) => p.conditions) && !!products[0]?.conditions,
    breakQuotes: one((p) => p.breakTerms.quotes),
    taxByLinkage: !one((p) => p.taxBucket.value) && products.length > 0 && taxPerLinkage(products) !== null,
  };
}

/** One record for each linkage, when every record of a linkage has the same tax; null when some linkage holds two. */
export function taxPerLinkage(products: readonly ProductRowData[]): ProductRowData[] | null {
  const by = new Map<string, ProductRowData>();
  for (const p of products) {
    const seen = by.get(p.linkage);
    if (seen && seen.taxBucket.value !== p.taxBucket.value) return null;
    if (!seen) by.set(p.linkage, p);
  }
  const order = ["none", "cpi", "fx"];
  return [...by.values()].sort((a, b) => order.indexOf(a.linkage) - order.indexOf(b.linkage));
}

/** How many deposits or plans the records are: those that differ only by amount count once. */
export const depositCount = (products: readonly ProductRowData[]): number => tableRows(products).length;

/** The lowest and highest rate among the records (the overview's line); null when none prints a number. */
export function rateRange(products: readonly ProductRowData[]): { low: SiteValue; high: SiteValue } | null {
  const rated = products.filter((p) => num(p.rate) !== null);
  if (rated.length === 0) return null;
  const sorted = [...rated].sort((a, b) => num(a.rate)! - num(b.rate)!);
  return { low: sorted[0]!.rate, high: sorted.at(-1)!.rate };
}

/**
 * The shortest and longest period among the records, in words, for the overview's label: "מיום עד שנה", and with one unit said once,
 * "מ־3 עד 15 שנים"; one period alone is said as itself. Null when no record holds a period (a current account).
 */
export function termRange(products: readonly ProductRowData[]): string | null {
  const timed = products.filter((p) => termDays(p) !== Infinity).sort((a, b) => termDays(a) - termDays(b));
  if (timed.length === 0) return null;
  // whole years of months are said in years: "15 שנים", not "180 חודשים"
  const words = (t: ProductRowData["term"]) => termWords(t.unit === "months" && typeof t.value === "number" && t.value >= 12 && t.value % 12 === 0 ? { value: t.value / 12, unit: "years" } : t)!;
  const low = words(timed[0]!.term);
  const high = words(timed.at(-1)!.term);
  if (low === high) return high;
  const from = (w: string) => (w === copy.term.day ? copy.amount.fromDay : /^\d/.test(w) ? `${copy.amount.from}${w}` : `${copy.amount.fromWord}${w}`);
  const a = /^([\d,.]+) (.+)$/.exec(low);
  const b = /^([\d,.]+) (.+)$/.exec(high);
  if (a && b && a[2] === b[2]) return `${copy.amount.from}${a[1]} ${copy.amount.to} ${b[1]} ${b[2]}`;
  return `${from(low)} ${copy.amount.to} ${high}`;
}
