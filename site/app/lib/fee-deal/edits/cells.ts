// The changes the fee page makes to a cell of a fee's table or grid (F-114), each a pure function from a fee to the next. A cell holds a
// part row of a case (a table: its price, its minimum, its notes, …) or the whole case (a grid, `WHOLE`). A cell stretched over its
// neighbours gives them what it holds, so they hold the same and share one cell (layout.ts, rule 2); stretched back, the cases it leaves keep
// it as a copy, in spans of their own, so they stand apart until changed. A cell's content moves to another case (or another fee), or is
// taken away. What a part row holds follows the part registry: each part's key, and the row the part stands in (part-rows.ts).
import { blankFigure, blankPrice, copiedPrice, copiedPriced, copiedStages, hasCases, pricesOn, sameContent, type Case, type Fee, type Priced, type Span, type Stage, type When } from "../model";
import { capacity } from "../offers/capacity";
import { byRate } from "../offers/capabilities";
import { editPrice } from "./stage";
import { figureOf, setFigure, withFigure } from "./price";
import type { Figure } from "../offers/figures";
import type { Note, Price } from "../core";
import { WHOLE } from "../layout";
import { addCaseAt, removeCase } from "./case";
import { PART_ROWS, ROW_OF, isPartRow, type PartRow } from "../part-rows";
import { PARTS, PART_IDS, fitted, partsSaid, type PartId } from "../offers/parts";
import { KEY_FORMS, type PartKey } from "../offers/capabilities";
import type { FeeKindId } from "../shapes";

/** A cell of a fee's table or grid: a part row of a case, or the whole case (`WHOLE`). */
export type CellRow = PartRow | typeof WHOLE;

/** The keys of a price a part row holds: the keys of the parts that stand in it (the price row holds the form's own, `PRICE_ROW`). */
const ROW_KEYS: Readonly<Record<PartRow, readonly PartKey[]>> = Object.fromEntries(
  PART_ROWS.map((row) => [row, [...new Set(PART_IDS.flatMap((id) => (ROW_OF[id] === row && PARTS[id].field ? [PARTS[id].field!] : [])))]]),
) as Record<PartRow, PartKey[]>;

/** The keys a price row leaves to the other rows: every key some other row holds. */
const OTHER_KEYS: readonly PartKey[] = PART_ROWS.flatMap((row) => (row === "price" ? [] : ROW_KEYS[row]));

const clone = <T>(x: T): T => structuredClone(x);

/** A price without some of its keys. */
function withoutKeys(p: Price, keys: readonly string[]): Price {
  const out: Record<string, unknown> = { ...p };
  for (const k of keys) delete out[k];
  return out as Price;
}

/** The parts of a part row a price (and its case's prices, `x`) says. */
const partsIn = (p: Price, x: Priced, row: PartRow): PartId[] => partsSaid(p, { ...(x.stages.length > 1 ? { until: "x" } : {}), ...(x.sale ? { sale: true } : {}) }).filter((id) => ROW_OF[id] === row);

/**
 * Whether case prices `to` of a fee of `kind` can hold what part row `row` of `from` holds: every part of it the target's price can hold
 * there (a form the fee takes, a key the target's form has a place for). The whole case and a row with nothing in `from` always fit.
 */
export function cellFits(kind: FeeKindId, from: Priced, to: Priced, row: CellRow): boolean {
  if (row === WHOLE || row === "until") return true;
  const src = from.stages[0]!.price;
  const target = to.stages[0]!.price;
  return partsIn(src, from, row).every((id) => (row === "price" || id === "sale" ? PARTS[id].holds(kind, target) : !!PARTS[id].field && KEY_FORMS[PARTS[id].field!](target.form) && PARTS[id].holds(kind, target)));
}

/**
 * Case prices `to` holding what cell `row` of `from` holds, for a fee of `kind`: the whole case's prices; the later prices (the month the
 * first ends and what follows); the first price's form and figure, its other parts kept where the form has a place for them; or the keys
 * of a part row (the notes with a sale priced apart). Null where `to` cannot hold it (`cellFits`).
 */
export function withCell(kind: FeeKindId, from: Priced, to: Priced, row: CellRow): Priced | null {
  if (!cellFits(kind, from, to, row)) return null;
  // a figure copied keeps its source only where the target held it so (`copiedPriced`): the list prints it for the case it came from
  if (row === WHOLE) return copiedPriced(clone({ stages: from.stages, ...(from.sale ? { sale: from.sale } : {}) }), to);
  const sale = to.sale ? { sale: to.sale } : {};
  const [first, ...later] = to.stages as [Stage, ...Stage[]];
  if (row === "until") {
    const { until: _u, ...head } = first;
    const lead: Stage = from.stages.length > 1 ? { ...head, until: from.stages[0]!.until! } : head;
    return { stages: [lead, ...copiedStages(clone(from.stages.slice(1)), to.stages.slice(1))], ...sale };
  }
  const src = from.stages[0]!.price;
  const target = first.price;
  let price: Price;
  if (row === "price") {
    // the source's form and figure, with the target's other parts where the form keeps them
    const kept: Record<string, unknown> = {};
    for (const k of OTHER_KEYS) if ((target as Record<string, unknown>)[k] !== undefined && KEY_FORMS[k](src.form)) kept[k] = (target as Record<string, unknown>)[k];
    price = { ...withoutKeys(clone(src), OTHER_KEYS), ...kept } as Price;
  } else {
    const keys = ROW_KEYS[row];
    const given = Object.fromEntries(keys.flatMap((k) => ((src as Record<string, unknown>)[k] !== undefined ? [[k, clone((src as Record<string, unknown>)[k])]] : [])));
    price = { ...withoutKeys(target, keys), ...given } as Price;
  }
  const stages = [{ ...first, price: copiedPrice(fitted(kind, price), target) }, ...later];
  if (row !== "notes") return { stages, ...sale };
  return { stages, ...(from.sale ? { sale: copiedStages(clone(from.sale), to.sale ?? to.stages) } : {}) };
}

/**
 * Case prices without what cell `row` holds: the first price not given (the price row: its figure blank, its other parts kept; a free
 * price becomes the fee's usual form, blank), which the reading leaves out until it is given (§10.6); no later prices; or the row's keys
 * gone (a sale priced apart with the notes).
 */
export function withoutCell(x: Priced, row: PartRow, kind: FeeKindId): Priced {
  const [first, ...later] = x.stages as [Stage, ...Stage[]];
  const sale = x.sale && row !== "notes" ? { sale: x.sale } : {};
  if (row === "until") {
    const { until: _u, ...head } = first;
    return { stages: [head], ...sale };
  }
  const price: Price = row === "price" ? notGiven(first.price, kind) : withoutKeys(first.price, ROW_KEYS[row]);
  return { stages: [{ ...first, price }, ...later], ...sale };
}

/** A price whose figure is not given yet: its rate or sum blank, its other parts kept; a free price, the fee's usual form, blank. */
function notGiven(p: Price, kind: FeeKindId): Price {
  if (p.form === "free") return blankPrice(capacity(kind).usual);
  const main = byRate(p) ? "rate" : "amount";
  return { ...p, [main]: blankFigure() } as Price;
}

/** Whether a cell holds anything: a part row a case has parts in, or a whole case. */
export const cellHolds = (x: Priced, row: CellRow): boolean => row === WHOLE || (isPartRow(row) && partsIn(x.stages[0]!.price, x, row).length > 0) || (row === "until" && x.stages.length > 1);

/** A case with its prices replaced (its id, values, mark and spans kept). */
const priced = (c: Case, x: Priced): Case => {
  const { stages: _s, sale: _sale, ...head } = c;
  return { ...head, stages: x.stages, ...(x.sale ? { sale: x.sale } : {}) };
};

/** A case whose cell `row` stands in span `span` along thing `along` ("": the default span, named by no entry). */
function inSpan(c: Case, row: CellRow, along: number, span: string): Case {
  const rest = (c.spans ?? []).filter((s) => !(s.row === row && s.along === along));
  const spans: Span[] = span ? [...rest, { row, along, span }] : rest;
  const { spans: _s, ...head } = c;
  return spans.length ? { ...head, spans } : head;
}

const spanName = (c: Case, row: CellRow, along: number): string => c.spans?.find((s) => s.row === row && s.along === along)?.span ?? "";

/** A span name no case of the fee uses yet. */
function freshSpan(cases: readonly Case[]): string {
  const used = new Set(cases.flatMap((c) => (c.spans ?? []).map((s) => s.span)));
  for (let n = cases.length + 1; ; n++) {
    const name = `s${n.toString(36)}`;
    if (!used.has(name)) return name;
  }
}

/**
 * A fee whose cell `row` of case `fromId` is stretched along thing `along` over cases `over`: each takes what the cell holds (`withCell`)
 * and joins its span, so equal neighbours share one cell. A case that cannot hold it is left as it is. `named`: the span must have a
 * name (down a grid's column only a named span merges, layout.ts), so a cell in the default span starts one of its own first.
 */
export function stretch(fee: Fee, fromId: string, over: readonly string[], row: CellRow, along: number, named = false): Fee {
  if (!hasCases(fee) || !fee.by[along]) return fee;
  let from = fee.cases.find((c) => c.id === fromId);
  if (!from) return fee;
  if (named && !spanName(from, row, along)) {
    const fresh = freshSpan(fee.cases);
    from = inSpan(from, row, along, fresh);
    fee = { ...fee, cases: fee.cases.map((c) => (c.id === fromId ? from! : c)) };
  }
  const span = spanName(from, row, along);
  const source = from;
  return {
    ...fee,
    cases: fee.cases.map((c) => {
      if (c.id === fromId || !over.includes(c.id)) return c;
      const x = withCell(fee.kind, source, c, row);
      return x ? inSpan(priced(c, x), row, along, span) : c;
    }),
  };
}

/**
 * A fee whose grid cell, case `fromId`, is stretched along thing `along` over cases `over` and over places no case holds (`places`, each
 * by its value of `along`): each place takes a copy of the case with its prices first (`addCaseAt`, as "+ מקרה" there does), then every
 * one joins the cell's span (`stretch`), so they read as one cell. Stretched back, the place is empty again (`shrinkAway`). `named`: as
 * `stretch`'s, down a grid's column.
 */
export function stretchOver(fee: Fee, fromId: string, over: readonly string[], places: readonly When[], along: number, named = false): Fee {
  if (!hasCases(fee) || !fee.cases.some((c) => c.id === fromId)) return fee;
  let next: Fee = fee;
  const made: string[] = [];
  for (const when of places) {
    const after = addCaseAt(next, fromId, along, when);
    if (after === next || !hasCases(after)) continue;
    made.push(after.cases.at(-1)!.id);
    next = after;
  }
  return stretch(next, fromId, [...over, ...made], WHOLE, along, named);
}

/**
 * A fee whose cell `row` is stretched back along thing `along` off cases `off`, where a place left must still hold a price (a table's or a
 * ladder's price row, `shrinkEmpties`): each keeps what it holds, as a copy, in a span of its own, so it stands apart from the cell it left
 * until it is changed.
 */
export function shrink(fee: Fee, off: readonly string[], row: CellRow, along: number): Fee {
  if (!hasCases(fee) || !fee.by[along]) return fee;
  let cases = fee.cases;
  for (const id of off) cases = cases.map((c) => (c.id === id ? inSpan(c, row, along, freshSpan(cases)) : c));
  return { ...fee, cases };
}

/**
 * Whether a cell stretched back empties the places it leaves (`shrinkAway`) rather than leaving them a copy (`shrink`): every cell of a
 * grid (a whole case leaves its place with no case, a part cell takes its part from the cases it leaves), and a table's part row other
 * than the price, which a case may lack. A table's or a ladder's price stays: a column or a step with no price says nothing.
 */
export const shrinkEmpties = (grid: boolean, row: CellRow): boolean => grid || row !== "price";

/**
 * A fee whose cell `row` is stretched back off cases `off`, taking from each what the stretch gave: a whole case (a grid's) leaves its
 * place with no case, never the fee's last case; a part row is taken from each (`clearCells`). The mirror of `stretchOver` and `stretch`.
 */
export function shrinkAway(fee: Fee, off: readonly string[], row: CellRow): Fee {
  if (!hasCases(fee)) return fee;
  if (row !== WHOLE) return clearCells(fee, off, row);
  return off.reduce<Fee>((x, id) => removeCase(x, id), fee);
}

/** A fee whose cases `ids` no longer hold what part row `row` holds (`withoutCell`). A case with nothing there is left as it is. */
export function clearCells(fee: Fee, ids: readonly string[], row: PartRow): Fee {
  if (!hasCases(fee)) return fee;
  const next = { ...fee, cases: fee.cases.map((c) => (ids.includes(c.id) && cellHolds(c, row) ? priced(c, withoutCell(c, row, fee.kind)) : c)) };
  return sameContent(next, fee) ? fee : next;
}

/**
 * A fee whose case `toId` takes what part row `row` of case `fromId` holds, which leaves `fromId` (`copy`: stays there too). Refused where
 * the target cannot hold it.
 */
export function moveCell(fee: Fee, fromId: string, toId: string, row: PartRow, copy = false): Fee {
  if (!hasCases(fee) || fromId === toId) return fee;
  const from = fee.cases.find((c) => c.id === fromId);
  const to = fee.cases.find((c) => c.id === toId);
  if (!from || !to || !cellHolds(from, row)) return fee;
  const x = withCell(fee.kind, from, to, row);
  if (!x) return fee;
  return { ...fee, cases: fee.cases.map((c) => (c.id === toId ? priced(c, x) : c.id === fromId && !copy ? priced(c, withoutCell(c, row, fee.kind)) : c)) };
}

/** The prices of fee `fee`'s case `caseId`, or its own where it changes by nothing. */
const pricesOf = (fee: Fee, caseId: string | null): Priced | undefined => (hasCases(fee) ? fee.cases.find((c) => c.id === caseId) : fee);

/** A fee with its prices (or case `caseId`'s) replaced. */
function withPrices(fee: Fee, caseId: string | null, x: Priced): Fee {
  if (hasCases(fee)) return { ...fee, cases: fee.cases.map((c) => (c.id === caseId ? priced(c, x) : c)) };
  const { stages: _s, sale: _sale, ...head } = fee;
  return { ...head, stages: x.stages, ...(x.sale ? { sale: x.sale } : {}) } as Fee;
}

/**
 * Whether part row `row` of fee `from`'s case `fromCase` (null: a fee whose price changes by nothing) can move to fee `to`'s case `toCase`:
 * another fee, whose kind takes every part the row holds there (`cellFits`).
 */
export function cellMovesTo(from: Fee, fromCase: string | null, to: Fee, toCase: string | null, row: PartRow): boolean {
  const a = pricesOf(from, fromCase), b = pricesOf(to, toCase);
  return !!a && !!b && from.id !== to.id && cellHolds(a, row) && cellFits(to.kind, a, b, row);
}

/**
 * Two fees once part row `row` of `from`'s case `fromCase` moved to `to`'s case `toCase` (`copy`: stays in `from` too). Null where it cannot
 * (`cellMovesTo`).
 */
export function moveCellTo(from: Fee, fromCase: string | null, to: Fee, toCase: string | null, row: PartRow, copy = false): { from: Fee; to: Fee } | null {
  if (!cellMovesTo(from, fromCase, to, toCase, row)) return null;
  const a = pricesOf(from, fromCase)!, b = pricesOf(to, toCase)!;
  const x = withCell(to.kind, a, b, row)!;
  return { from: copy ? from : withPrices(from, fromCase, withoutCell(a, row, from.kind)), to: withPrices(to, toCase, x) };
}

/** A first price's notes with `note` put in, at the end (`on`), or taken out; its other parts kept. */
function notesWith(p: Price, note: Note, on: boolean): Price {
  const was = (p as { notes?: Note[] }).notes ?? [];
  const notes = on ? (was.includes(note) ? was : [...was, note]) : was.filter((n) => n !== note);
  const { notes: _n, ...rest } = p as Price & { notes?: Note[] };
  return (notes.length ? { ...rest, notes } : rest) as Price;
}

const withFirst = (x: Priced, f: (p: Price) => Price): Priced => ({ ...x, stages: [{ ...x.stages[0]!, price: f(x.stages[0]!.price) }, ...x.stages.slice(1)] });

/** Whether case `caseId` of `fee` (null: a fee whose price changes by nothing) has note `note` on its first price. */
export const hasNote = (fee: Fee, caseId: string | null, note: Note): boolean => !!(pricesOf(fee, caseId)?.stages[0]!.price as { notes?: Note[] } | undefined)?.notes?.includes(note);

/** A fee whose case `caseId` (null: a fee whose price changes by nothing) no longer has note `note`, its other notes kept. */
export function withoutNote(fee: Fee, caseId: string | null, note: Note): Fee {
  const x = pricesOf(fee, caseId);
  return x && hasNote(fee, caseId, note) ? withPrices(fee, caseId, withFirst(x, (p) => notesWith(p, note, false))) : fee;
}

/**
 * One note lifted alone and dropped on another case, of its fee or another (`to`, `toCase`): added to that case's notes, which it keeps,
 * and taken from its own (`copy`: kept there too). Null where the target's price cannot hold it, has it already, or it is the same case.
 */
export function moveNoteTo(from: Fee, fromCase: string | null, to: Fee, toCase: string | null, note: Note, copy = false): { from: Fee; to: Fee } | null {
  const same = from.id === to.id;
  if ((same && fromCase === toCase) || !hasNote(from, fromCase, note) || hasNote(to, toCase, note)) return null;
  const target = pricesOf(to, toCase);
  if (!target || !PARTS[note].holds(to.kind, target.stages[0]!.price)) return null;
  const left = copy ? from : withoutNote(from, fromCase, note);
  const base = same ? left : to;
  const added = withPrices(base, toCase, withFirst(pricesOf(base, toCase)!, (p) => notesWith(p, note, true)));
  return same ? { from: added, to: added } : { from: left, to: added };
}

/**
 * A fee whose figure `figure` of price `k` in each of cases `others` is set as it now stands in case `from` (`withFigure`, so a case that
 * held that very figure keeps its source), or taken away where it is gone there: a figure edited where a cell or a line joins cases, which
 * are alike in that part alone, changes nothing else of theirs.
 */
export function figureToAll(fee: Fee, from: string | undefined, others: readonly string[], k: number, figure: Figure): Fee {
  const n = figureOf(pricesOn(fee, "buy", from)[k]!.price, figure);
  const v = n && !n.blank ? n.v : null;
  return others.reduce((x, c) => editPrice(x, "buy", k, (p) => withFigure(p, figure, v), c), fee);
}

/**
 * A fee whose figure `figure` of price `k` in each of cases `cases` (none named: a fee whose price changes by nothing) is as it stood in
 * `was`, its source with it: a figure edited where it is read, put back by Esc.
 */
export function figuresBack(fee: Fee, was: Fee, cases: readonly string[] | null, k: number, figure: Figure): Fee {
  const back = (x: Fee, c?: string) => editPrice(x, "buy", k, (p) => setFigure(p, figure, figureOf(pricesOn(was, "buy", c)[k]!.price, figure)), c);
  return cases ? cases.reduce((x, c) => back(x, c), fee) : back(fee);
}
