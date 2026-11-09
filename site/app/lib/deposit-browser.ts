// The deposits page (D92, `/deposits`): every bank's standard shekel deposits side by side. Pure: the shapes the loader sends, the term
// of a record, which offers the reader's amount opens, the grid's cell (F-108), the list's order and its words. No React, no I/O.
import { amountOpens, bestOpenOffer } from "@finance-tool/engine";
import { depositBrowser as t } from "../copy";
import { exitWords } from "./deposit-kind";
import { fmt } from "./format";
import type { Label } from "./labels";
import type { ListSort } from "./list-sort";
import { computed, numberOf, type SiteValue } from "./value";

/** The eight terms of the banks' standard table (directive 447 Annex A, BANK-14), shortest first. */
export const TERMS = ["day", "week", "m1", "m3", "m6", "y1", "y2", "y3"] as const;
export type TermId = (typeof TERMS)[number];

/** A record's term as its table prints it (`term_months`: a day and a week in days, the rest in months); null for any other. */
export function termOf(term: { value: unknown; unit: string }): TermId | null {
  const v = term.value;
  if (term.unit === "days") return v === 1 ? "day" : v === 7 ? "week" : null;
  if (term.unit !== "months") return null;
  return ({ 1: "m1", 3: "m3", 6: "m6", 12: "y1", 24: "y2", 36: "y3" } as Record<number, TermId>)[v as number] ?? null;
}

export type RateKind = "fixed" | "variable";
export type BreakTerm = "not_allowed" | "with_penalty" | "none";

/**
 * One offer: one deposit record, the latest of its id. Its rate and its amounts are the record's own value objects (`rate_offered`,
 * `amount_range`), named as the engine reads them (F-108).
 */
export interface DbOffer {
  id: string;
  bank: string;
  term: TermId;
  /** The name in the bank's table. */
  name: string;
  kind: RateKind;
  linkage: "none" | "cpi" | "fx";
  /** Only some customers may take it (method F-108: a `closed_system` or `new_customers` variant). */
  limited: boolean;
  /** Its kinds (`variant`) as label chips, the bank's own table under each meaning. */
  labels: Label[];
  rate_offered: SiteValue;
  /** A variable rate's anchor and spread, as the table prints them. */
  anchor: string | null;
  spread: SiteValue | null;
  amount_range: { min: SiteValue; max: SiteValue | null };
  breakTerm: BreakTerm;
  exits: { exists: boolean; everyMonths: number | null };
}

export interface DbBank {
  id: string;
  name: string;
  /** The date the bank's own table prints, when it is earlier than the day the tables were read ("טבלת הבנק מ־…"); null otherwise. */
  tableDate: string | null;
}

export interface DbData {
  today: string;
  /** The day the tables were read (the latest `checked` of the records). */
  read: string;
  /** In the order the grid and the groups show them: by name, in Hebrew order (no size or rank). */
  banks: DbBank[];
  offers: DbOffer[];
  /** P-11's steps, each the parameter's value object; the page starts at `start` (P-05's amount now). */
  amounts: SiteValue[];
  start: number;
}

/** The glossary cards behind the list's column heads, the kind of rate's "?" and the linked group's heading (as the track browser keeps its own). */
export const HELP_TERMS = { rate: "שיעור הריבית המוצעת", exits: "תחנת יציאה", break: "שבירת פיקדון", linked: "צמוד למדד המחירים לצרכן" } as const;
export const KIND_TERMS = ["ריבית קבועה", "ריבית משתנה"] as const;

/** Whether the amount opens the offer (F-108, `amountOpens`): at or above its minimum, at or below its maximum; an unknown bound opens nothing past the minimum. */
export const opens = (o: DbOffer, amount: number): boolean => amountOpens(o, amount);

/** The offers of one term (or every term) and one kind of rate: what the list shows, opened or folded. */
export function offersOf(data: DbData, term: TermId | null, kind: RateKind): DbOffer[] {
  return data.offers.filter((o) => o.kind === kind && (term === null || o.term === term));
}

/** How many of those offers the amount opens: a chip's count, the same offers the count line counts. */
export const openCount = (data: DbData, term: TermId | null, kind: RateKind, amount: number): number => offersOf(data, term, kind).filter((o) => opens(o, amount)).length;

/** Linked to the index: its rate is paid on top of the index, another kind of figure than an unlinked rate, so the two never rank together. */
export const isLinked = (o: DbOffer): boolean => o.linkage !== "none";

/** Where an offer stands in a list: open to everyone, only for some customers (a new-joiner or closed-system offer), or linked to the index. */
export const standing = (o: DbOffer): 0 | 1 | 2 => (isLinked(o) ? 2 : o.limited ? 1 : 0);

/** Whether a cell may pick the offer: unlinked and open to every customer (F-108). */
const forCell = (o: DbOffer) => o.linkage === "none" && !o.limited;

/** Why a cell has no rate, in the order F-108 tests it. */
export type CellGap = "none" | "notAtAmount" | "otherKind" | "otherOffers";

export interface DbCell {
  bank: string;
  term: TermId;
  /** The pick (F-108) and its rate as a computed value over the offers it chose among; null with `gap`. */
  pick: DbOffer | null;
  rate: SiteValue | null;
  gap: CellGap | null;
  /** The bank's other offers of the term, whatever their kind, linkage or limit ("ועוד n"). */
  more: number;
}

/**
 * Each offer's line in a grid cell's sheet, one name per offer: the bank and the name in its table, and, where the bank prints that name more
 * than once, what tells them apart (the amount it starts at, its exit points), then a number if a name is still taken. A sheet keyed by a
 * name two offers share kept only one of them: Discount prints "פקדון לשנה" from 250 ₪ three times, apart only in its exit points.
 */
export function sheetNames(data: DbData): Map<string, string> {
  const bankName = (id: string) => data.banks.find((b) => b.id === id)?.name ?? id;
  const out = new Map<string, string>();
  const taken = new Map<string, number>();
  for (const o of [...data.offers].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) {
    const twins = data.offers.filter((x) => x.bank === o.bank && x.name === o.name);
    const differ = (f: (x: DbOffer) => unknown) => new Set(twins.map((x) => JSON.stringify(f(x)))).size > 1;
    const parts = [bankName(o.bank), o.name];
    const min = numberOf(o.amount_range.min);
    if (differ((x) => numberOf(x.amount_range.min)) && min !== null) parts.push(`${t.grid.from}${fmt.number(min)} ₪`);
    if (differ((x) => [x.exits.exists, x.exits.everyMonths])) parts.push(`${t.columns.exits}: ${exitWords(o.exits.exists, o.exits.everyMonths)}`);
    const base = parts.join(" · ");
    const n = (taken.get(base) ?? 0) + 1;
    taken.set(base, n);
    out.set(o.id, n > 1 ? `${base} (${n})` : base);
  }
  return out;
}

/** A grid cell (method F-108): bank `bank`, term `term`, at `amount` and kind `kind`. */
export function cellOf(data: DbData, bank: string, term: TermId, kind: RateKind, amount: number, names: (o: DbOffer) => string): DbCell {
  const all = data.offers.filter((o) => o.bank === bank && o.term === term);
  if (all.length === 0) return { bank, term, pick: null, rate: null, gap: "none", more: 0 };
  const candidates = all.filter((o) => o.kind === kind && forCell(o));
  const pick = bestOpenOffer(candidates, amount);
  if (pick) {
    // the sheet lists the offers the amount opens, each by its name in the bank's table, with its own rate
    const inputs = Object.fromEntries(candidates.filter((o) => opens(o, amount)).map((o) => [names(o), o.rate_offered]));
    const rate = computed(pick.rate_offered.value as number, "pct_per_year", "F-108", inputs, { today: data.today, about: t.grid.about });
    return { bank, term, pick, rate, gap: null, more: all.length - 1 };
  }
  const gap: CellGap = candidates.length > 0 ? "notAtAmount" : all.some((o) => o.kind !== kind && forCell(o)) ? "otherKind" : "otherOffers";
  return { bank, term, pick: null, rate: null, gap, more: all.length };
}

/** The share of the rates the shading spreads over: the few highest shade as the top, so they don't press the rest into one shade. */
const SCALE_SHARE = 0.95;

/**
 * The grid's shading scale (F-108): from 0 to `top`, the rate at the 95th percentile (nearest rank) of the kind among the offers a cell may
 * pick, at any amount, rounded up to the next half percent, so a change of amount does not move it. `above`: some of those rates are
 * higher, and shade as the top.
 */
export function scaleTop(data: DbData, kind: RateKind): { top: number; above: boolean } {
  const rates = data.offers.filter((o) => o.kind === kind && forCell(o)).flatMap((o) => (typeof o.rate_offered.value === "number" ? [o.rate_offered.value] : [])).sort((a, b) => a - b);
  if (rates.length === 0) return { top: 1, above: false };
  const at = rates[Math.ceil(SCALE_SHARE * rates.length) - 1]!;
  const top = Math.max(0.5, Math.ceil(at * 2) / 2);
  return { top, above: rates[rates.length - 1]! > top };
}

// ---------------------------------------------------------------- the list's order

export type SortId = "bank" | "term" | "rate" | "min";
export type SortState = ListSort<SortId>;
/** Each column's natural order: names and terms from the start, the rate from the highest, the amount from the smallest. */
const NATURAL: Record<SortId, 1 | -1> = { bank: 1, term: 1, rate: -1, min: 1 };
export const SORT_IDS = Object.keys(NATURAL) as SortId[];

/** One term: the offers are one list, by rate from the highest. Every term: under their banks, by term from the shortest. */
export const defaultSort = (all: boolean): SortState => ({ id: all ? "term" : "rate", dir: 1 });

/** The sorts a list can take: by bank in one list, by term under the banks. */
export const sortable = (all: boolean): ReadonlySet<SortId> => new Set<SortId>(all ? ["term", "rate", "min"] : ["bank", "rate", "min"]);

/** Whether the column runs from small to large in this order (the head's arrow). */
export const ascending = (s: SortState): boolean => s.dir * NATURAL[s.id] === 1;


// ---------------------------------------------------------------- rows: offers of one name

/**
 * One row of the list: the offers of one bank, term, kind of rate, linkage and kinds (`variant`) that the bank's table prints under one
 * name, as Discount's three "פקדון לשנה" with and without exit points, or a bank's tiers by amount. What sets them apart is only what the
 * row shows for each (its rate, amounts, exit points, break), so they stand as one row with a line for each. Best rate first.
 */
export interface DbRow {
  key: string;
  bank: string;
  term: TermId;
  name: string;
  linkage: DbOffer["linkage"];
  labels: Label[];
  offers: DbOffer[];
}

/** What the row's offers do not share: each of these shows on every line, beside its rate; the rest once for the row. */
export interface RowSplit {
  amount: boolean;
  exits: boolean;
  break: boolean;
}

const rowKey = (o: DbOffer) => [o.bank, o.term, o.kind, o.linkage, o.limited, o.labels.map((l) => l.id).join(","), o.anchor ?? "", o.name].join("|");
const rateOf = (o: DbOffer) => numberOf(o.rate_offered) ?? -Infinity;
const minOf = (o: DbOffer) => numberOf(o.amount_range.min) ?? Infinity;
const byId = (a: DbOffer, b: DbOffer) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/** The offers as rows, one per name (`DbRow`); each row's offers by rate from the highest, then by amount from the smallest. */
export function rowsOf(offers: readonly DbOffer[]): DbRow[] {
  const by = new Map<string, DbOffer[]>();
  for (const o of offers) by.set(rowKey(o), [...(by.get(rowKey(o)) ?? []), o]);
  return [...by].map(([key, list]) => {
    const sorted = [...list].sort((a, b) => rateOf(b) - rateOf(a) || minOf(a) - minOf(b) || byId(a, b));
    const o = sorted[0]!;
    return { key, bank: o.bank, term: o.term, name: o.name, linkage: o.linkage, labels: o.labels, offers: sorted };
  });
}

/** Which of the row's columns differ between its offers. */
export function rowSplit(row: DbRow): RowSplit {
  const differ = (f: (o: DbOffer) => unknown) => new Set(row.offers.map((o) => JSON.stringify(f(o)))).size > 1;
  return {
    amount: differ((o) => [numberOf(o.amount_range.min), o.amount_range.max ? numberOf(o.amount_range.max) : null]),
    exits: differ((o) => [o.exits.exists, o.exits.everyMonths]),
    break: differ((o) => o.breakTerm),
  };
}

/**
 * The rows in the order, each by its best rate (its first offer) and its smallest amount; ties broken by rate (highest first), then by
 * name in Hebrew order, then by id, so nothing rests on file order. Rows open to everyone come first, then those only for some customers,
 * then linked ones (`standing`): a new-joiner or closed-system rate never ranks among the rates everyone can get, and a rate on top of the
 * index never ranks among plain rates (a list that holds all three: every term under a bank, the folded group).
 */
export function sortRows(rows: readonly DbRow[], s: SortState, bankName: (id: string) => string): DbRow[] {
  const key = (r: DbRow): number | string | null => {
    const o = r.offers[0]!;
    if (s.id === "bank") return bankName(r.bank);
    if (s.id === "term") return TERMS.indexOf(r.term);
    if (s.id === "rate") return numberOf(o.rate_offered);
    const mins = r.offers.map((x) => numberOf(x.amount_range.min)).filter((n): n is number => n !== null);
    return mins.length ? Math.min(...mins) : null;
  };
  const sign = s.dir * NATURAL[s.id];
  return [...rows].sort((a, b) => {
    const la = standing(a.offers[0]!);
    const lb = standing(b.offers[0]!);
    if (la !== lb) return la - lb;
    const ka = key(a);
    const kb = key(b);
    if (ka !== kb) {
      if (ka === null) return 1;
      if (kb === null) return -1;
      const c = typeof ka === "string" ? ka.localeCompare(kb as string, "he") : ka - (kb as number);
      if (c !== 0) return sign * c;
    }
    const ra = rateOf(a.offers[0]!);
    const rb = rateOf(b.offers[0]!);
    if (ra !== rb) return rb - ra;
    return a.name.localeCompare(b.name, "he") || byId(a.offers[0]!, b.offers[0]!);
  });
}

/** "ההצעות מסודרות לפי הריבית, מהגבוהה לנמוכה." */
export function orderLine(s: SortState, all: boolean): string {
  const w = t.sorts[s.id];
  return `${all ? t.order.all : t.order.one}${w.what}, ${ascending(s) ? w.up : w.down}.`;
}

// ---------------------------------------------------------------- words

/** "54 הצעות", "הצעה אחת", "שתי הצעות". */
export function offersPhrase(n: number): string {
  return n === 1 ? t.count.offerOne : n === 2 ? t.count.offerTwo : `${fmt.number(n)} ${t.count.offers}`;
}

/** "9 בנקים", "בנק אחד", "שני בנקים". */
export function banksPhrase(n: number): string {
  return n === 1 ? t.count.bankOne : n === 2 ? t.count.bankTwo : `${fmt.number(n)} ${t.count.banks}`;
}

/** "10,000 ₪". */
export const amountText = (n: number): string => `${fmt.number(n)} ₪`;
