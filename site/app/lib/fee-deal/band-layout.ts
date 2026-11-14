// A fee's cases as the workbench lays them out (method §10.6, F-114): each case's parts placed in the rows of the fee's table, the layout
// of its shape (layout.ts) over them, a row's head, a ladder's step bounds, and what a row or a column added to a grid starts as. The
// parts' words are the builder's (rows.ts); this file only says which row each stands in and when two are the same.
import { feeDeal as copy } from "../../copy";
import type { SiteValue } from "../value";
import { currencyOfUnit } from "../format";
import { byRank, isRange, type CasesFee, type When } from "./model";
import { layoutOf, type FeeLayout } from "./layout";
import { PART_ROWS, rowOf, type PartRow } from "./part-rows";
import { figure, sumUnit } from "./values";
import { valueWords, whenWords, type SlimPart, type WhenWords } from "./case-words";
import type { CaseRow } from "./rows";

export { PART_ROWS, rowOf, type PartRow };

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
 * A figure's content: equal for the same number in the same unit, whatever its state. Two cases that print the same figure read the same
 * to the person and share one cell, also where one holds it from the price list and the other as the person's own (a copy the list does
 * not print there); the cell then names where each case holds it from (`mergedParts`).
 */
const figureKey = (v: SiteValue | undefined) => (v ? [v.value, v.unit] : null);

/** Where a figure is from, equal for two figures from the same place: the person, or one source (a house's list and its page). */
export const fromKey = (v: SiteValue): string =>
  v.state === "entered" ? "entered" : JSON.stringify([v.state, v.own ?? null, v.source.url, (v.source as { page?: unknown }).page ?? null]);

/**
 * The parts a cell over several cases shows (cases whose parts there read the same, `partKey`): the first case's, and where the cases
 * hold a figure from more than one place (a list's figure and the person's copy of it, or two lines of lists), each case's value of it
 * (`froms`), the figure itself as a case holds it from a source where one does. So no case's list figure is ever shown as the person's,
 * and the cell can say where each case's is from.
 */
export function mergedParts(cases: readonly string[], parts: (caseId: string) => readonly SlimPart[]): SlimPart[] {
  const first = parts(cases[0]!);
  if (cases.length < 2) return [...first];
  return first.map((p) => {
    const alike = cases.map((id) => ({ id, part: parts(id).find((x) => x.id === p.id && (x.stage ?? 0) === (p.stage ?? 0)) }));
    const froms = [0, 1].map((n) => {
      const each = alike.flatMap(({ id, part }) => {
        const v = n ? part?.words.second : part?.words.figure;
        return v ? [{ case: id, value: v }] : [];
      });
      return new Set(each.map((x) => fromKey(x.value))).size > 1 ? each : null;
    });
    if (!froms[0] && !froms[1]) return p;
    // the figure as the first case that holds it from a source holds it: its words and its box
    const listed = (n: number) => alike.find(({ part }) => (n ? part?.words.second : part?.words.figure)?.state === "sourced")?.part;
    const at = [froms[0] ? listed(0) : undefined, froms[1] ? listed(1) : undefined];
    return {
      ...p,
      words: { ...p.words, ...(at[0]?.words.figure ? { figure: at[0].words.figure } : {}), ...(at[1]?.words.second ? { second: at[1].words.second } : {}) },
      ...(p.fields ? { fields: p.fields.map((f, n) => ({ ...f, value: at[n]?.fields?.[n]?.value ?? f.value })) } : {}),
      froms,
    };
  });
}

/** A part's content, equal for two parts that read the same: its id and every word and figure of it. */
export function partKey(p: SlimPart): string {
  const w = p.words;
  return JSON.stringify([p.id, p.stage ?? 0, w.lead ?? null, figureKey(w.figure), w.mid ?? null, figureKey(w.second), w.month ?? null, w.tail ?? null, w.quiet ?? null]);
}

/** A part's words, equal for two parts that read the same whichever price they belong to. */
const wordsKey = (p: SlimPart): string => {
  const w = p.words;
  return JSON.stringify([p.id, w.lead ?? null, figureKey(w.figure), w.mid ?? null, figureKey(w.second), w.month ?? null, w.tail ?? null, w.quiet ?? null]);
};

/**
 * A case's parts as a table, a grid or its rows say them (`slimParts`' order: the first price's parts, then for each later price the month
 * it starts and its parts): a later price says only what it changes. Each part it holds exactly as the price before it is left out, since
 * that part, said once with the first price (in its own row, its own part cell, or before the change), reads for every price after it;
 * so a part shared over a grid's row, said once under its cells, is not said again inside a cell for a later period. A later price that
 * lacks a part the price before it holds is said whole, so nothing reads as going on that does not.
 */
export function laterChanges(parts: readonly SlimPart[]): SlimPart[] {
  const at = (k: number) => parts.filter((p) => (p.stage ?? 0) === k && p.id !== "until");
  const left = new Set<SlimPart>();
  const last = Math.max(0, ...parts.map((p) => p.stage ?? 0));
  for (let k = 1; k <= last; k++) {
    const before = new Map(at(k - 1).map((p) => [p.id, wordsKey(p)]));
    const now = at(k);
    if (![...before.keys()].every((id) => now.some((p) => p.id === id))) continue;
    for (const p of now) if (before.get(p.id) === wordsKey(p)) left.add(p);
  }
  return left.size ? parts.filter((p) => !left.has(p)) : [...parts];
}

/**
 * A fee's cases laid out by its shape (`layoutOf`), the cases being the builder's rows of it (`rows`, in the fee's order), with three things
 * the switch on `switchTo`.
 */
export function bandLayout(fee: CasesFee, rows: readonly CaseRow[], switchTo: string | null = null): FeeLayout {
  const caseOf = new Map(fee.cases.map((c) => [c.id, c]));
  return layoutOf({
    things: fee.by.map((b) => ({ range: isRange(b) })),
    rows: PART_ROWS,
    switchTo,
    // the cases in the order the page shows them (`byRank`), which the person may have set apart from the order the reading reads
    cases: byRank(rows.map((r) => ({ ...r, rank: caseOf.get(r.case)!.rank }))).map((r) => ({
      id: r.case,
      when: caseOf.get(r.case)!.when,
      ...(caseOf.get(r.case)!.spans ? { spans: caseOf.get(r.case)!.spans } : {}),
      parts: [...partsByRow(r.parts)].map(([row, ps]) => ({ row, key: ps.map(partKey).join("|") })),
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
