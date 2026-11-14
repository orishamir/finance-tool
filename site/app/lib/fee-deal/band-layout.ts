// A fee's cases as the workbench lays them out (method §10.6, F-114): each case's parts placed in the rows of the fee's table, the layout
// of its shape (layout.ts) over them, a row's head, a ladder's step bounds, and what a row or a column added to a grid starts as. The
// parts' words are the builder's (rows.ts); this file only says which row each stands in and when two are the same.
import { feeDeal as copy } from "../../copy";
import type { SiteValue } from "../value";
import { currencyOfUnit } from "../format";
import { isRange, type CasesFee, type When } from "./model";
import { layoutOf, type FeeLayout } from "./layout";
import type { PartId } from "./offers/parts";
import { figure, sumUnit } from "./values";
import { valueWords, whenWords, type SlimPart, type WhenWords } from "./case-words";
import type { CaseRow } from "./rows";

/**
 * The rows of a fee's table, in the order they stand everywhere: the price, then its bounds, then the rest of its parts, then its notes.
 * The price's forms share one row (a case free and another charged stand side by side), and so do the notes.
 */
export const PART_ROWS = ["price", "min", "max", "cap", "flat", "maxPerSecurity", "discount", "third", "until", "offset", "refund", "notes"] as const;
export type PartRow = (typeof PART_ROWS)[number];

/** The row each part stands in: keyed by the part registry's ids, so a new part has a row before it compiles. */
const ROW_OF: Readonly<Record<PartId, PartRow>> = {
  share: "price",
  perUnit: "price",
  perAction: "price",
  held: "price",
  sum: "price",
  free: "price",
  min: "min",
  max: "max",
  cap: "cap",
  flat: "flat",
  maxPerSecurity: "maxPerSecurity",
  discount: "discount",
  third: "third",
  until: "until",
  offset: "offset",
  refund: "refund",
  unfilled: "notes",
  unfilledClerk: "notes",
  unfilledClerkAbroad: "notes",
  capRead: "notes",
  partial: "notes",
  inTrade: "notes",
  sale: "notes",
};

/** The row a part stands in: a later price's parts stand with the month the price before it ends, in its own row. */
export const rowOf = (p: Pick<SlimPart, "id" | "stage">): PartRow => (p.stage ? "until" : ROW_OF[p.id]);

/** A case's parts by row, in the rows' order: the parts of each row a case has (a case may hold two notes, or a price and its later one). */
export function partsByRow(parts: readonly SlimPart[]): Map<PartRow, SlimPart[]> {
  const out = new Map<PartRow, SlimPart[]>();
  for (const row of PART_ROWS) {
    const here = parts.filter((p) => rowOf(p) === row);
    if (here.length) out.set(row, here);
  }
  return out;
}

/** The rows whose head says the first word of their parts ("מינימום"), which a cell under that head then leaves out. */
const HEAD_SAYS_LEAD: ReadonlySet<PartRow> = new Set(["min", "max", "cap", "maxPerSecurity"]);
export const headSaysLead = (row: PartRow): boolean => HEAD_SAYS_LEAD.has(row);

/**
 * A figure's content: equal for the same number in the same unit and state. Two lines of one price list that print the same figure read
 * the same and are said once, the first case's source behind it.
 */
const figureKey = (v: SiteValue | undefined) => (v ? [v.value, v.unit, v.state] : null);

/** A part's content, equal for two parts that read the same: its id and every word and figure of it. */
export function partKey(p: SlimPart): string {
  const w = p.words;
  return JSON.stringify([p.id, p.stage ?? 0, w.lead ?? null, figureKey(w.figure), w.mid ?? null, figureKey(w.second), w.month ?? null, w.tail ?? null, w.quiet ?? null]);
}

/** The currency a part's figure is in; null for a share, a count or a part with no figure. */
const currencyOf = (p: SlimPart): string | null => (p.words.figure ? currencyOfUnit(p.words.figure.unit) : null);

/**
 * A fee's cases laid out by its shape (`layoutOf`), the cases being the builder's rows of it (`rows`, in the fee's order), with three things
 * the switch on `switchTo`.
 */
export function bandLayout(fee: CasesFee, rows: readonly CaseRow[], switchTo: string | null = null): FeeLayout {
  const whenOf = new Map(fee.cases.map((c) => [c.id, c.when]));
  return layoutOf({
    things: fee.by.map((b) => ({ range: isRange(b) })),
    rows: PART_ROWS,
    switchTo,
    cases: rows.map((r) => ({
      id: r.case,
      when: whenOf.get(r.case)!,
      parts: [...partsByRow(r.parts)].map(([row, ps]) => ({ row, key: ps.map(partKey).join("|"), currency: ps.map(currencyOf).find((c) => c !== null) ?? null })),
    })),
  });
}

/** A row's head: the price's by what every case's price is (a share, a sum, else a price), any other row's its own. */
export function rowHead(row: PartRow, parts: readonly SlimPart[]): string {
  const h = copy.cases.rowHeads;
  if (row !== "price") return h[row]!;
  const units = parts.filter((p) => rowOf(p) === "price").map((p) => p.words.figure?.unit);
  if (units.length > 0 && units.every((u) => u?.startsWith("pct"))) return h.rate!;
  if (units.length > 0 && units.every((u) => u !== undefined && currencyOfUnit(u) !== null)) return h.sum!;
  return h.price!;
}

/** The line a part said once stands under: every case, or the cases of one currency. */
export const sharedLead = (currency: string | null): string => (currency === null ? copy.cases.shared.all : (copy.cases.shared.in[currency] ?? copy.cases.shared.all));

/** A ladder's step as its head says it: the top of the step before it (none for the first) and its own top (none for the last). */
export interface StepBounds {
  from: SiteValue | null;
  to: SiteValue | null;
  /** The step's place among the range's steps: its top's place among the tops, where it has one. */
  step: number;
}

/** The bounds of a case's step on range `t` (`StepBounds`); null for a case on any value, or a thing that is no range. */
export function stepBounds(fee: CasesFee, w: When, t: number, today: string): StepBounds | null {
  const b = fee.by[t]!;
  if (!isRange(b) || typeof w !== "number") return null;
  const unit = b.unit === "units" || b.unit === "actions" ? "count" : sumUnit(b.unit);
  return { from: w > 0 ? figure(b.tops[w - 1]!, unit, today) : null, to: w < b.tops.length ? figure(b.tops[w]!, unit, today) : null, step: w };
}

/** A range's unit as its boxes show it: a currency's sign, or the words for units or actions. */
export const rangeSign = (unit: string): string => (unit === "units" || unit === "actions" ? copy.cases.units[unit]! : (copy.panel.signs[unit] ?? unit));

/** A value of thing `t` as a grid's row, column or switch names it. */
export const headWords = (fee: CasesFee, w: When, t: number, today: string): WhenWords => whenWords(fee, w, t, today);

/** The words of the value the cases name last on thing `t`, which a new row or column starts from (`addValues`). */
export function lastValueWords(fee: CasesFee, t: number): string {
  const last = [...new Set(fee.cases.map((c) => JSON.stringify(c.when[t])))].at(-1)!;
  const w = JSON.parse(last) as When;
  return Array.isArray(w) ? w.map((v) => valueWords(fee.by[t]!.kind, v)).join(", ") : (copy.cases.any[fee.by[t]!.kind] ?? "");
}
