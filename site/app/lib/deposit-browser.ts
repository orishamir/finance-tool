// The deposits page (D92, `/deposits`): every bank's standard shekel deposits side by side. Pure: the shapes the loader sends, the term
// of a record, which offers the reader's amount opens, the period chart's bars and the grid's cell (F-108), the interest an offer pays on
// the amount (F-21), the list's order and its words. No React, no I/O.
import { amountOpens, amountUnknown, bestOpenOffer, depositInterest } from "@finance-tool/engine";
import { depositBrowser as t } from "../copy";
import { breakText, exitFirstOf, exitTiming, exitWords, type ExitPoints } from "./deposit-kind";
import { countPhrase, fmt } from "./format";
import type { Label } from "./labels";
import type { ListSort } from "./list-sort";
import { computed, numberOf, type SiteValue } from "./value";

/** Each term's length in years, for the interest it pays (F-21): a day and a week on a 365-day year (Schedule A, BANK-50), the rest in months. */
export const TERM_YEARS: Record<string, number> = { day: 1 / 365, week: 7 / 365, m1: 1 / 12, m3: 3 / 12, m6: 6 / 12, y1: 1, y2: 2, y3: 3 };

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

/** The term the page opens on: a year, the plain deposit most guides speak of. */
export const START_TERM: TermId = "y1";
/** The kind of rate the page opens on. */
export const START_KIND: RateKind = "fixed";

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
  /** The amounts the bank takes, with how the amount at each bound stands where the table says it is out or does not say (F-108). */
  amount_range: { min: SiteValue; max: SiteValue | null; min_edge?: "excluded" | "unknown"; max_edge?: "excluded" | "unknown" };
  breakTerm: BreakTerm;
  exits: ExitPoints;
  /** F-21 (BANK-50): the term's days as the table prints them, how the product calculates interest (its printed effective rate, as a
   *  value, or the times a year), and whether interest is paid out during the term; each only where the record says. */
  termDays?: number;
  calc?: { effectiveAnnual?: SiteValue; periodsPerYear?: SiteValue };
  paidOut?: boolean;
}

export interface DbBank {
  id: string;
  name: string;
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

/** Whether the offer's table leaves the amount undecided (F-108, `amountUnknown`): above a minimum whose maximum is printed unreadably, say. */
export const unknownAt = (o: DbOffer, amount: number): boolean => amountUnknown(o, amount);

/** The offers of one term (or every term) and one kind of rate: what the list shows, opened or folded. */
export function offersOf(data: DbData, term: TermId | null, kind: RateKind): DbOffer[] {
  return data.offers.filter((o) => o.kind === kind && (term === null || o.term === term));
}


/** Linked to the index: its rate is paid on top of the index, another kind of figure than an unlinked rate, so the two never rank together. */
export const isLinked = (o: DbOffer): boolean => o.linkage !== "none";

/**
 * The folded group under the list (F-108): the offers the amount does not open, under the same two "show also" chips as the list (an offer
 * only some may open, a linked one), and whether the table of one of them does not say whether it takes the amount.
 */
export function foldedOffers(offers: readonly DbOffer[], amount: number, show: { conditional: boolean; linked: boolean }): { offers: DbOffer[]; unknown: boolean } {
  const out = offers.filter((o) => !opens(o, amount) && (show.conditional || !o.limited) && (show.linked || !isLinked(o)));
  return { offers: out, unknown: out.some((o) => unknownAt(o, amount)) };
}

/** Whether a cell or a bar may pick the offer: unlinked and open to every customer (F-108). */
export const forCell = (o: DbOffer) => o.linkage === "none" && !o.limited;

/**
 * Why a period's bar has no rate: no offer of the kind is open to everyone at this amount, but some of the other kind is ("רק משתנה"); the
 * table of one of the kind does not say whether it takes the amount ("לא ידוע בסכום הזה"); some of the kind are, at other amounts ("לא
 * בסכום הזה"); or none of either.
 */
export type BarGap = "otherKind" | "unknownAtAmount" | "notAtAmount" | "none";

/**
 * A period's bar in the chart over the list (F-108 over every bank at once): the highest rate of the kind among the offers of the term that
 * are unlinked and open to every customer, that the amount opens, and the offer that pays it; with none, why.
 */
export function periodBest(data: DbData, term: TermId, kind: RateKind, amount: number | null): { pick: DbOffer | null; gap: BarGap | null } {
  const ofTerm = data.offers.filter((o) => o.term === term && forCell(o));
  const pick = amount === null ? null : bestOpenOffer(ofTerm.filter((o) => o.kind === kind), amount);
  if (pick) return { pick, gap: null };
  if (amount !== null && ofTerm.some((o) => o.kind !== kind && opens(o, amount))) return { pick: null, gap: "otherKind" };
  if (amount !== null && ofTerm.some((o) => o.kind === kind && unknownAt(o, amount))) return { pick: null, gap: "unknownAtAmount" };
  return { pick: null, gap: ofTerm.some((o) => o.kind === kind) ? "notAtAmount" : "none" };
}

/** The offer the page's heading names as the highest when it opens (its term, its kind, P-05's amount): the home page says it too. */
export const startBest = (data: DbData): DbOffer | null => periodBest(data, START_TERM, START_KIND, data.start).pick;

/**
 * F-21's facts of an offer for the engine: how its rate is quoted (its unit, `pct_per_year_effective` being effective), the printed days,
 * the printed nominal and effective pair or times a year, interest paid out.
 */
function factsOf(o: DbOffer) {
  const nominal = numberOf(o.rate_offered);
  const eff = o.calc?.effectiveAnnual ? numberOf(o.calc.effectiveAnnual) : null;
  const m = o.calc?.periodsPerYear ? numberOf(o.calc.periodsPerYear) : null;
  const printed = eff !== null && nominal !== null ? { printed: { nominal: nominal / 100, effective: eff / 100 } } : {};
  const calc = eff !== null || m !== null ? { ...printed, ...(m !== null ? { periodsPerYear: m } : {}) } : undefined;
  return {
    ...(o.rate_offered.unit === "pct_per_year_effective" ? { basis: "effective" as const } : {}),
    ...(o.termDays !== undefined ? { termDays: o.termDays } : {}),
    ...(calc ? { calc } : {}),
    ...(o.paidOut ? { paidOut: true } : {}),
  };
}

/**
 * The interest an offer pays on the amount over its term, before tax, at its rate as printed today (F-21, BANK-50: `A × r × d/365` under a
 * year, by the days the table prints or 365/12 a month; the rate over one year; over a year compounded by the times a year the record's
 * printed nominal and effective pair or its words give; a rate quoted as effective compounded over the term), as a computed value over the
 * rate, the amount and, where read, the record's days or effective rate. A variable rate is taken as it stands
 * today. Null where the rate is not a number, or where the term is over a year and the record says nothing of how interest is calculated
 * (`interestUnknown`, BANK OQ21).
 */
export function interestOn(o: DbOffer, amount: number, amountValue: SiteValue, today: string): SiteValue | null {
  const r = numberOf(o.rate_offered);
  if (r === null) return null;
  const months = TERM_YEARS[o.term]! * 12;
  const v = depositInterest(amount, r / 100, months, months, factsOf(o));
  if (v === null) return null;
  const inputs: Record<string, SiteValue> = { [t.interest.inputs.rate]: o.rate_offered, [t.interest.inputs.amount]: amountValue };
  if (months > 12 && !o.paidOut && o.calc?.effectiveAnnual) inputs[t.interest.inputs.effective] = o.calc.effectiveAnnual;
  else if (months > 12 && !o.paidOut && o.calc?.periodsPerYear) inputs[t.interest.inputs.periods] = o.calc.periodsPerYear;
  return computed(v, "nis", "F-21", inputs, { today, about: `${t.interest.about}${t.termIn[o.term]}`, notes: o.kind === "variable" ? t.interest.variableNote : undefined });
}

/** The term is over a year and the record says nothing of how the product calculates interest: the interest is not known (BANK OQ21). */
export function interestUnknown(o: DbOffer): boolean {
  const months = TERM_YEARS[o.term]! * 12;
  return numberOf(o.rate_offered) !== null && depositInterest(1, 0.01, months, months, factsOf(o)) === null;
}

/** "כ־325 ₪", and under one shekel "פחות מ־1 ₪": the interest in whole shekels, as the list says it. */
export const interestText = (n: number): string => (n < 0.5 ? t.interest.underOne : `${t.interest.about2}${fmt.nisWhole(n)}`);

/** How the money can come out before the end: exit points (every so many months, or at points the table does not space evenly), a break, or neither. */
export type Access = { kind: "exits"; words: string } | { kind: "break"; words: string } | { kind: "locked"; words: string };

/** An offer's exit points in the access column: "יציאה כל 3 חודשים", "יציאה אחרי 6 חודשים, ואז כל 3 חודשים", "יציאה ראשונה אחרי 6 חודשים". */
function exitAccessWords(e: ExitPoints): string {
  const first = exitFirstOf(e);
  if (first !== null && !e.everyMonths) return `${t.access.firstAfter}${fmt.months(first)}`;
  const timing = exitTiming(e);
  return timing ? `${t.access.exit}${timing}` : t.access.some;
}

/** The access column's answer for an offer: its exit points first, then a break, else locked to the end. Both when it has both. */
export function accessOf(o: DbOffer): Access[] {
  const out: Access[] = [];
  if (o.exits.exists) out.push({ kind: "exits", words: exitAccessWords(o.exits) });
  if (o.breakTerm !== "not_allowed") out.push({ kind: "break", words: breakText(o.breakTerm, o.exits.exists) });
  return out.length ? out : [{ kind: "locked", words: t.access.locked }];
}

/** The line that names an offer under its row's first one: "אותו פיקדון, עם תחנות יציאה", or what else sets it apart (a break, the amounts). */
export function variantWords(row: DbRow, o: DbOffer): string {
  const split = rowSplit(row);
  const first = row.offers[0]!;
  if (split.exits) return o.exits.exists ? t.variant.withExits : t.variant.noExits;
  if (split.break) return `${t.variant.same}${o.breakTerm === "not_allowed" ? t.access.locked : breakText(o.breakTerm, o.exits.exists)}`;
  const min = numberOf(o.amount_range.min);
  return min !== null && min !== numberOf(first.amount_range.min) ? `${t.variant.same}${t.variant.from}${fmt.nis(min)}` : t.variant.plain;
}


/** Why a cell has no rate, in the order F-108 tests it. */
export type CellGap = "none" | "unknownAtAmount" | "notAtAmount" | "conditionalOnly" | "otherKind" | "otherOffers";

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
    if (differ((x) => numberOf(x.amount_range.min)) && min !== null) parts.push(`${t.grid.from}${fmt.nis(min)}`);
    if (differ((x) => [x.exits.exists, x.exits.everyMonths, x.exits.firstMonths])) parts.push(`${t.help.exits}: ${exitWords(o.exits)}`);
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
  const ofKind = all.filter((o) => o.kind === kind);
  const gap: CellGap =
    candidates.length > 0
      ? candidates.some((o) => unknownAt(o, amount)) ? "unknownAtAmount" : "notAtAmount"
      : ofKind.length > 0
        ? ofKind.some((o) => o.limited && !isLinked(o)) ? "conditionalOnly" : "otherOffers"
        : all.some((o) => forCell(o)) ? "otherKind" : "otherOffers";
  return { bank, term, pick: null, rate: null, gap, more: all.length };
}

/**
 * The grid's shading scale (F-108): from 0 to `top`, the highest rate of the kind among the offers a cell may pick, at any amount, so a
 * change of amount does not move it and every rate has a shade of its own.
 */
export function scaleTop(data: DbData, kind: RateKind): { top: number } {
  const rates = data.offers.filter((o) => o.kind === kind && forCell(o)).flatMap((o) => (typeof o.rate_offered.value === "number" ? [o.rate_offered.value] : []));
  return { top: rates.length ? Math.max(...rates) : 1 };
}

/** The bank whose cell is the highest of each term's column (the grid marks it), at the amount and kind: none for a column with no rate. */
export function columnBest(cells: readonly DbCell[]): DbCell | null {
  let best: DbCell | null = null;
  for (const c of cells) if (c.rate && (!best || Number(c.rate.value) > Number(best.rate!.value))) best = c;
  return best;
}

// ---------------------------------------------------------------- the list's order

export type SortId = "rate" | "min";
export type SortState = ListSort<SortId>;
/** Each column's natural order: the rate from the highest, the amount from the smallest. */
const NATURAL: Record<SortId, 1 | -1> = { rate: -1, min: 1 };
export const SORT_IDS = Object.keys(NATURAL) as SortId[];

/** The list starts by rate, from the highest. */
export const DEFAULT_SORT: SortState = { id: "rate", dir: 1 };

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
    exits: differ((o) => [o.exits.exists, o.exits.everyMonths, o.exits.firstMonths]),
    break: differ((o) => o.breakTerm),
  };
}

/**
 * The rows in the order, each by its best rate (its first offer) or its smallest amount; ties broken by rate (highest first), then by
 * name in Hebrew order, then by id, so nothing rests on file order. An offer only some customers may open ranks among the others with its
 * label; linked rows come after the rest, since a rate on top of the index never ranks among plain rates.
 */
export function sortRows(rows: readonly DbRow[], s: SortState): DbRow[] {
  const key = (r: DbRow): number | null => {
    const o = r.offers[0]!;
    if (s.id === "rate") return numberOf(o.rate_offered);
    const mins = r.offers.map((x) => numberOf(x.amount_range.min)).filter((n): n is number => n !== null);
    return mins.length ? Math.min(...mins) : null;
  };
  const sign = s.dir * NATURAL[s.id];
  return [...rows].sort((a, b) => {
    const la = isLinked(a.offers[0]!) ? 1 : 0;
    const lb = isLinked(b.offers[0]!) ? 1 : 0;
    if (la !== lb) return la - lb;
    const ka = key(a);
    const kb = key(b);
    if (ka !== kb) {
      if (ka === null) return 1;
      if (kb === null) return -1;
      const c = ka - kb;
      if (c !== 0) return sign * c;
    }
    const ra = rateOf(a.offers[0]!);
    const rb = rateOf(b.offers[0]!);
    if (ra !== rb) return rb - ra;
    return a.name.localeCompare(b.name, "he") || byId(a.offers[0]!, b.offers[0]!);
  });
}

// ---------------------------------------------------------------- words

/** "54 הצעות", "הצעה אחת", "שתי הצעות". */
export function offersPhrase(n: number): string {
  return countPhrase(n, { one: t.count.offerOne, two: t.count.offerTwo, many: t.count.offers });
}
