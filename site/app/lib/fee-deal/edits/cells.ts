// The changes the fee page makes to a cell of a fee's table or grid (F-114), each a pure function from a fee to the next. A cell holds a
// part row of a case (a table: its price, its minimum, its notes, …) or the whole case (a grid, `WHOLE`). A cell stretched over its
// neighbours gives them what it holds, so they hold the same and share one cell (layout.ts, rule 2); stretched back, the cases it leaves keep
// it as a copy, in spans of their own, so they stand apart until changed. A cell's content moves to another case (or another fee), or is
// taken away. What a part row holds follows the part registry: each part's key, and the row the part stands in (part-rows.ts).
import { blankFigure, blankPrice, copiedPrice, copiedPriced, copiedStages, hasCases, pricesOn, sameContent, type Case, type Fee, type MonthKey, type Priced, type Side, type Span, type Stage, type When } from "../model";
import { capacity } from "../offers/capacity";
import { byRate, onAction } from "../offers/capabilities";
import { editPrice } from "./stage";
import { heldAlike } from "../alike";
import { figureOf, setFigure, withFigure } from "./price";
import { FIGURES, type Figure } from "../offers/figures";
import type { BoundCurrency, Note, Price } from "../core";
import { WHOLE } from "../layout";
import { addCaseAt, removeCase } from "./case";
import { PART_ROWS, ROW_OF, isPartRow, type PartRow } from "../part-rows";
import { PARTS, PART_IDS, fitted, partsSaid, setPart, type PartAt, type PartId } from "../offers/parts";
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

/** The currency a price's sums are counted in: a named one (the shekel where none is), or the action's own (`inTrade`, with the currencies it is for). */
export interface SumsIn {
  currency: BoundCurrency;
  inTrade?: true | readonly BoundCurrency[];
}

/** The figures of a price counted in its own currency (figures.ts's `inPrice`): its sum, its bounds, its flat price's two, its refund. */
const SUM_FIGURES: readonly Figure[] = ["amount", "min", "max", "flat", "upTo", "refund"];

/** The figures of `SUM_FIGURES` each part row holds: the price row its sum, a bound its own, the flat price its two, the refund its own. */
const ROW_SUMS: Partial<Record<PartRow, readonly Figure[]>> = { price: ["amount"], min: ["min"], max: ["max"], flat: ["flat", "upTo"], refund: ["refund"] };

/** What a price's sums are counted in: a price on an action names it (the shekel where it does not); any other price's sums are shekels. */
export const sumsIn = (p: Price): SumsIn => (onAction(p) ? { currency: p.currency ?? "ILS", ...(p.inTrade ? { inTrade: p.inTrade } : {}) } : { currency: "ILS" });

/** A price whose sums are counted in `c` (a price on an action; any other is left as it is, its sums shekels). */
function countedIn(p: Price, c: SumsIn): Price {
  if (!onAction(p)) return p;
  const { currency: _c, inTrade: _t, ...rest } = p as Price & { currency?: BoundCurrency; inTrade?: unknown };
  return { ...rest, ...(c.currency !== "ILS" ? { currency: c.currency } : {}), ...(c.inTrade ? { inTrade: c.inTrade } : {}) } as Price;
}

/**
 * Why a part row cannot be put on a price in its currency: the figure it carries (`moved`) and what it is counted in (`from`), and a figure
 * the price keeps that is counted in another (`other`, `here`). One currency serves all of a price's sums.
 */
export interface CurrencyClash {
  moved: Figure;
  from: SumsIn;
  other: Figure;
  here: SumsIn;
}

/** The given figures of `figs` a price has (a figure not typed yet is counted in nothing). */
const givenOf = (p: Price, figs: readonly Figure[]): Figure[] => figs.filter((f) => {
  const n = FIGURES[f].get(p);
  return !!n && !n.blank;
});

/**
 * A price built from target `target` with part row `row` of source price `src` put on it (`price`), its sums counted as each figure was:
 * a figure carries its own currency, never re-labelled nor converted. Where the row carries a sum in a currency other than the target's,
 * the price takes that currency when it keeps no other sum of its own, else the row does not go there (a clash).
 */
function sumsCarried(src: Price, target: Price, price: Price, row: PartRow): Price | CurrencyClash {
  const from = sumsIn(src), here = sumsIn(target);
  const moved = givenOf(price, ROW_SUMS[row] ?? []);
  // the price row is built from the source's price, the target's other parts kept: they keep the target's currency; another row is built
  // on the target's price, so it keeps its own (the notes row's "in the trade's currency" goes with the notes)
  if (moved.length === 0) return row === "price" ? countedIn(price, here) : price;
  if (sameContent(from, here)) return countedIn(price, here);
  const other = givenOf(price, SUM_FIGURES.filter((f) => !(ROW_SUMS[row] ?? []).includes(f)));
  if (other.length > 0) return { moved: moved[0]!, from, other: other[0]!, here };
  // a price that names no currency counts its sums in shekels: it cannot take one in another
  if (!onAction(price) && from.currency !== "ILS") return { moved: moved[0]!, from, other: moved[0]!, here };
  return countedIn(price, from);
}

/** Why case prices `to` of a fee of `kind` cannot take cell `row` of `from` in its currency (`sumsCarried`); null where they can, or cannot for another reason. */
export function currencyClash(kind: FeeKindId, from: Priced, to: Priced, row: CellRow): CurrencyClash | null {
  const r = cellBuilt(kind, from, to, row);
  return r && "moved" in r ? r : null;
}

/**
 * Case prices `to` holding what cell `row` of `from` holds, for a fee of `kind`: the whole case's prices; the later prices (the month the
 * first ends and what follows); the first price's form and figure, its other parts kept where the form has a place for them; or the keys
 * of a part row (the notes with a sale priced apart), each sum in the currency it was counted in (`sumsCarried`). Null where `to` cannot
 * hold it (`cellFits`), or not in that currency (`currencyClash`).
 */
export function withCell(kind: FeeKindId, from: Priced, to: Priced, row: CellRow): Priced | null {
  const r = cellBuilt(kind, from, to, row);
  return r && !("moved" in r) ? r : null;
}

/** `withCell`'s case prices, or why its currency keeps the row off them. */
function cellBuilt(kind: FeeKindId, from: Priced, to: Priced, row: CellRow): Priced | CurrencyClash | null {
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
  const carried = sumsCarried(src, target, price, row);
  if ("moved" in carried) return carried;
  const stages = [{ ...first, price: copiedPrice(fitted(kind, carried), target) }, ...later];
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

/**
 * Whether case prices `x` hold part `part` itself on their first price: of the notes, which share a row, that very one; of the price's
 * forms, that form; of any other row, which holds one part, the row's.
 */
export const holdsPart = (x: Priced, part: PartId): boolean => partsIn(x.stages[0]!.price, x, ROW_OF[part]).includes(part);

/** The rows whose parts stand side by side, each case keeping its own beside one more: the notes (part-rows.ts). */
const SIDE_BY_SIDE: readonly PartRow[] = ["notes"];

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

/**
 * A fee whose cases `ids` no longer hold what part row `row` holds on price `at` (`withoutCell`; the purchase's first where none is said).
 * A case with nothing there, or no such price, is left as it is.
 */
export function clearCells(fee: Fee, ids: readonly string[], row: PartRow, at: PriceAt = FIRST): Fee {
  if (!hasCases(fee)) return fee;
  const cleared = (c: Case): Case => {
    const v = priceView(c, at);
    return v && cellHolds(v, row) ? priced(c, withView(c, at, withoutCell(v, row, fee.kind))) : c;
  };
  const next = { ...fee, cases: fee.cases.map((c) => (ids.includes(c.id) ? cleared(c) : c)) };
  return sameContent(next, fee) ? fee : next;
}

/**
 * A fee whose case `toId` takes what part row `row` of case `fromId` holds on price `at` (the purchase's first where none is said), which
 * leaves `fromId` (`copy`: stays there too). Refused where the target has no such price or cannot hold it.
 */
export function moveCell(fee: Fee, fromId: string, toId: string, row: PartRow, copy = false, at: PriceAt = FIRST): Fee {
  if (!hasCases(fee) || fromId === toId) return fee;
  const from = fee.cases.find((c) => c.id === fromId);
  const to = fee.cases.find((c) => c.id === toId);
  const vf = from && priceView(from, at), vt = to && priceView(to, at);
  if (!from || !to || !vf || !vt || !cellHolds(vf, row)) return fee;
  const x = withCell(fee.kind, vf, vt, row);
  if (!x) return fee;
  return { ...fee, cases: fee.cases.map((c) => (c.id === toId ? priced(c, withView(to, at, x)) : c.id === fromId && !copy ? priced(c, withView(from, at, withoutCell(vf, row, fee.kind))) : c)) };
}

/** The prices of fee `fee`'s case `caseId`, or its own where it changes by nothing. */
export const pricesOf = (fee: Fee, caseId: string | null): Priced | undefined => (hasCases(fee) ? fee.cases.find((c) => c.id === caseId) : fee);

/**
 * One price among a case's prices, by a key that stays while the prices around it change: its side, and the month it starts (`from`; null:
 * the side's first price). A part lifted from the open case names its price so.
 */
export interface PriceAt {
  side: Side;
  from: MonthKey | null;
}

/** The purchase's first price: the one a table's cells, a head's parts and a case's notes stand on. */
export const FIRST: PriceAt = { side: "buy", from: null };

/** Whether `at` is the purchase's first price. */
export const isFirst = (at: PriceAt): boolean => at.side === "buy" && at.from === null;

/** The prices of a side of case prices `x`: a sale's only where it is priced apart. */
const sideOf = (x: Priced, side: Side): readonly Stage[] | undefined => (side === "sell" ? x.sale : x.stages);

/** Where price `at` stands among its side's prices in `x`; -1 where `x` has no such price (no sale priced apart, no price starting that month). */
function indexAt(x: Priced, at: PriceAt): number {
  const stages = sideOf(x, at.side);
  if (!stages) return -1;
  return at.from === null ? 0 : stages.findIndex((_, k) => k > 0 && stages[k - 1]?.until === at.from);
}

/**
 * Price `at` of case prices `x` as case prices of their own, so a cell's edits read it as they read a first price: the purchase's first is
 * `x` itself (its later prices and its sale with it, as a table's cell holds them); any other is that one price alone. Null where `x` has no
 * such price.
 */
export function priceView(x: Priced, at: PriceAt): Priced | null {
  if (isFirst(at)) return x;
  const stage = sideOf(x, at.side)?.[indexAt(x, at)];
  return stage ? { stages: [{ price: stage.price }] } : null;
}

/** Case prices `x` with price `at` as `view` leaves it (`priceView`'s mirror): the purchase's first, `view` whole; any other, its one price. */
export function withView(x: Priced, at: PriceAt, view: Priced): Priced {
  if (isFirst(at)) return view;
  const k = indexAt(x, at);
  const stages = sideOf(x, at.side);
  if (k < 0 || !stages) return x;
  const price = view.stages[0]?.price;
  if (!price) return x;
  const next = stages.map((s, j) => (j === k ? { ...s, price } : s));
  return at.side === "sell" ? { ...x, sale: next } : { ...x, stages: next };
}

/** A fee with its prices (or case `caseId`'s) replaced. */
export function withPrices(fee: Fee, caseId: string | null, x: Priced): Fee {
  if (hasCases(fee)) return { ...fee, cases: fee.cases.map((c) => (c.id === caseId ? priced(c, x) : c)) };
  const { stages: _s, sale: _sale, ...head } = fee;
  return { ...head, stages: x.stages, ...(x.sale ? { sale: x.sale } : {}) } as Fee;
}

/** Price `at` of fee `fee`'s case `caseId` (null: a fee whose price changes by nothing) as case prices of its own (`priceView`); null where there is none. */
export const viewOf = (fee: Fee, caseId: string | null, at: PriceAt): Priced | null => {
  const x = pricesOf(fee, caseId);
  return x ? priceView(x, at) : null;
};

/** Fee `fee` with price `at` of its case `caseId` as `view` leaves it (`withView`). */
const withViewOf = (fee: Fee, caseId: string | null, at: PriceAt, view: Priced): Fee => {
  const x = pricesOf(fee, caseId);
  return x ? withPrices(fee, caseId, withView(x, at, view)) : fee;
};

/**
 * Whether part row `row` of price `at` (the purchase's first where none is said) of fee `from`'s case `fromCase` (null: a fee whose price
 * changes by nothing) can move to the same price of fee `to`'s case `toCase`: another fee, which has that price, and whose kind takes every
 * part the row holds there (`cellFits`).
 */
export function cellMovesTo(from: Fee, fromCase: string | null, to: Fee, toCase: string | null, row: PartRow, at: PriceAt = FIRST): boolean {
  const a = viewOf(from, fromCase, at), b = viewOf(to, toCase, at);
  return !!a && !!b && from.id !== to.id && cellHolds(a, row) && withCell(to.kind, a, b, row) !== null;
}

/**
 * Two fees once part row `row` of price `at` of `from`'s case `fromCase` moved to the same price of `to`'s case `toCase` (`copy`: stays in
 * `from` too). Null where it cannot (`cellMovesTo`).
 */
export function moveCellTo(from: Fee, fromCase: string | null, to: Fee, toCase: string | null, row: PartRow, copy = false, at: PriceAt = FIRST): { from: Fee; to: Fee } | null {
  const a = viewOf(from, fromCase, at), b = viewOf(to, toCase, at);
  const x = a && b && from.id !== to.id && cellHolds(a, row) ? withCell(to.kind, a, b, row) : null;
  if (!a || !x) return null;
  return { from: copy ? from : withViewOf(from, fromCase, at, withoutCell(a, row, from.kind)), to: withViewOf(to, toCase, at, x) };
}

/** A first price's notes with `note` put in, at the end (`on`), or taken out; its other parts kept. */
function notesWith(p: Price, note: Note, on: boolean): Price {
  const was = (p as { notes?: Note[] }).notes ?? [];
  const notes = on ? (was.includes(note) ? was : [...was, note]) : was.filter((n) => n !== note);
  const { notes: _n, ...rest } = p as Price & { notes?: Note[] };
  return (notes.length ? { ...rest, notes } : rest) as Price;
}

const withFirst = (x: Priced, f: (p: Price) => Price): Priced => ({ ...x, stages: [{ ...x.stages[0]!, price: f(x.stages[0]!.price) }, ...x.stages.slice(1)] });

/** Whether case `caseId` of `fee` (null: a fee whose price changes by nothing) has note `note` on price `at` (the purchase's first where none is said). */
export const hasNote = (fee: Fee, caseId: string | null, note: Note, at: PriceAt = FIRST): boolean => !!(viewOf(fee, caseId, at)?.stages[0]?.price as { notes?: Note[] } | undefined)?.notes?.includes(note);

/** A fee whose case `caseId` (null: a fee whose price changes by nothing) no longer has note `note` on price `at`, its other notes kept. */
export function withoutNote(fee: Fee, caseId: string | null, note: Note, at: PriceAt = FIRST): Fee {
  const v = viewOf(fee, caseId, at);
  return v && hasNote(fee, caseId, note, at) ? withViewOf(fee, caseId, at, withFirst(v, (p) => notesWith(p, note, false))) : fee;
}

/**
 * One note of price `at` (the purchase's first where none is said) lifted alone and dropped on another case, of its fee or another (`to`,
 * `toCase`): added to the notes of that case's same price, which it keeps, and taken from its own (`copy`: kept there too). Null where the
 * target has no such price, its price cannot hold the note or has it already, or it is the same case.
 */
export function moveNoteTo(from: Fee, fromCase: string | null, to: Fee, toCase: string | null, note: Note, copy = false, at: PriceAt = FIRST): { from: Fee; to: Fee } | null {
  const same = from.id === to.id;
  if ((same && fromCase === toCase) || !hasNote(from, fromCase, note, at) || hasNote(to, toCase, note, at)) return null;
  const target = viewOf(to, toCase, at)?.stages[0]?.price;
  if (!target || !PARTS[note].holds(to.kind, target)) return null;
  const left = copy ? from : withoutNote(from, fromCase, note, at);
  const base = same ? left : to;
  const onto = viewOf(base, toCase, at);
  if (!onto) return null;
  const added = withViewOf(base, toCase, at, withFirst(onto, (p) => notesWith(p, note, true)));
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
 * A fee whose figure `figure` of price `k` and of every later price, in each of cases `cases` (none named: a fee whose price changes by
 * nothing), is as it stood in `was`, its source with it: a figure edited where it is read, put back by Esc, with the later prices it was
 * carried to (`figureOnward`).
 */
export function figuresBack(fee: Fee, was: Fee, cases: readonly string[] | null, k: number, figure: Figure): Fee {
  const back = (x: Fee, c?: string) => {
    const before = pricesOn(was, "buy", c);
    return pricesOn(x, "buy", c).reduce((y, _, j) => (j < k || !before[j] ? y : editPrice(y, "buy", j, (p) => setFigure(p, figure, figureOf(before[j]!.price, figure)), c)), x);
  };
  return cases ? cases.reduce((x, c) => back(x, c), fee) : back(fee);
}

/**
 * A fee whose figure `figure` of price `k`, as it now stands in each of cases `cases` (none named: a fee whose price changes by nothing),
 * is carried on to each later price that held part `part` as the price before it did in `was` (`heldAlike`), one after the other until a
 * price held it otherwise. `was` is the fee as it stood when the figure's box opened, never as an earlier keystroke left it, so typing
 * carries only to the prices that read as one with it then. Where a fee's cases are laid out, a later price says only what it changes
 * (`laterChanges`, the same `heldAlike`), so a part it held alike reads once, for every price; an edit of it holds for every price it
 * reads for, and a price said whole takes none.
 */
export function figureOnward(fee: Fee, was: Fee, cases: readonly string[] | null, k: number, part: PartId, figure: Figure): Fee {
  const on = (x: Fee, c?: string) => {
    const before = pricesOn(was, "buy", c);
    const n = figureOf(pricesOn(x, "buy", c)[k]!.price, figure);
    let y = x;
    for (let j = k + 1; j < before.length && heldAlike(before[j - 1]!.price, before[j]!.price, part); j++) y = editPrice(y, "buy", j, (p) => setFigure(p, figure, n), c);
    return y;
  };
  return cases ? cases.reduce((x, c) => on(x, c), fee) : on(fee);
}

/** What a part asks for, given once for several cases: its figure (`value`), or the fee it is against. */
export type PartGiven = Pick<PartAt, "value" | "against">;

/** Whether part `part` stands beside the others of its row (a note beside the case's other notes), not alone in it. */
export const standsBeside = (part: PartId): boolean => SIDE_BY_SIDE.includes(ROW_OF[part]);

/**
 * A fee whose cases `ids` each take part `part` on their first price, as the toolbox adds it (`setPart`), from the toolbox acting on several
 * cases at once: where none of them holds anything in the part's row, all alike, as one cell stretched over them along thing `along` (the
 * first takes it, `stretch` gives it to the others); in a row whose parts stand side by side (the notes), where some of them hold others
 * there, each beside its own. A part that asks for something takes `given`, what the person gave once for them all, and stands nowhere
 * without it. Refused where a case holds that part already, or another part of a row that holds one (nothing the person gave is
 * overwritten), or where the first cannot take it.
 */
export function partAcross(fee: Fee, ids: readonly string[], part: PartId, along: number, given: PartGiven = {}): Fee {
  if (!hasCases(fee) || ids.length === 0 || !fee.by[along]) return fee;
  const row = ROW_OF[part];
  const cases = ids.map((id) => fee.cases.find((c) => c.id === id));
  if (cases.some((c) => !c || holdsPart(c, part))) return fee;
  const at = (caseId: string): PartAt => ({ k: 0, caseId, ...given });
  if (cases.some((c) => cellHolds(c!, row))) {
    if (!standsBeside(part)) return fee;
    const next = ids.reduce((x, id) => setPart(x, part, true, at(id)), fee);
    return sameContent(next, fee) ? fee : next;
  }
  const first = setPart(fee, part, true, at(ids[0]!));
  if (first === fee) return fee;
  return ids.length > 1 ? stretch(first, ids[0]!, ids.slice(1), row, along) : first;
}

/**
 * A fee whose cases `ids` each take what part row `row` of prices `from` holds, replacing what they held there (`withCell`, so a figure
 * keeps its source only where the case held that very figure from it): a part applied to a head's cases (a grid's row or column, every
 * case of the fee). Each joins one span of that row along thing `along`, the span of case `fromId` (the case `from` is, where it is this
 * fee's and among them) or else the default one, so neighbours that now hold it alike read as one cell. `fromId` itself and a case that
 * cannot hold the part are left as they are; a place no case holds is no case, so it is not filled. Unchanged where `from` holds nothing
 * in that row.
 */
export function partToCases(fee: Fee, from: Priced, row: PartRow, ids: readonly string[], along: number, fromId?: string): Fee {
  if (!hasCases(fee) || !fee.by[along] || !cellHolds(from, row)) return fee;
  const source = fromId === undefined ? undefined : fee.cases.find((c) => c.id === fromId);
  const span = source && ids.includes(source.id) ? spanName(source, row, along) : "";
  const next = {
    ...fee,
    cases: fee.cases.map((c) => {
      if (!ids.includes(c.id) || c.id === fromId) return c;
      const x = withCell(fee.kind, from, c, row);
      return x ? inSpan(priced(c, x), row, along, span) : c;
    }),
  };
  return sameContent(next, fee) ? fee : next;
}

/**
 * A fee whose cases `ids` each have note `note` on their first price, added after their own notes: one note applied to a head's cases. A
 * case that has it already or cannot hold it is left as it is.
 */
export function noteToCases(fee: Fee, note: Note, ids: readonly string[]): Fee {
  if (!hasCases(fee)) return fee;
  const next = {
    ...fee,
    cases: fee.cases.map((c) => (ids.includes(c.id) && !hasNote(fee, c.id, note) && PARTS[note].holds(fee.kind, c.stages[0]!.price) ? priced(c, withFirst(c, (p) => notesWith(p, note, true))) : c)),
  };
  return sameContent(next, fee) ? fee : next;
}
