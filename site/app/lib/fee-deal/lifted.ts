// What the fee page's grips lift, where each can be dropped, and what a drop does (method §10.6, F-114): a table's column, a ladder's step,
// a grid's row or column, a cell, a table's part row, a part of the open case, a thing of the band's head, and a fee's card. Dropped on a
// place, a thing moves there (a column or a row among its own, a part onto another case or another fee, a case into a grid's empty place),
// or swaps (two things of a head); a cell takes no other cell. Dropped in the bin, it is taken away. Each drop is one of the pure edits
// (edits/arrange.ts, edits/cells.ts, edits/case.ts) and says, where it took something the person gave, what it did, for the undo line.
// Pure.
import { feeDeal as copy } from "../../copy";
import { hasCases, sameContent, type Fee, type FeeDeal, type When } from "./model";
import { WHOLE } from "./layout";
import { isPartRow, type PartRow } from "./part-rows";
import { moveCase, moveValue, orderFees, removeStep, removeValue, swapThings } from "./edits/arrange";
import { cellHolds, cellMovesTo, clearCells, moveCell, moveCellTo, moveNoteTo, withoutCell, withoutNote, type CellRow } from "./edits/cells";
import type { Note } from "./core";
import { removeCase, setWhen } from "./edits/case";
import { updateFee } from "./edits/deal";

/** A thing lifted by its grip, with the words it is named by (`name`) where its undo line names it. */
export type Lifted =
  | { k: "col"; fee: string; case: string }
  | { k: "step"; fee: string; t: number; step: number; name: string }
  | { k: "value"; fee: string; t: number; key: string; name: string }
  | { k: "cell"; fee: string; cases: string[]; row: CellRow; along: number }
  | { k: "row"; fee: string; row: PartRow }
  /** A part of the open case's first price: its row's content, or one note alone (`note`), which leaves the case's other notes. */
  | { k: "part"; fee: string; case: string | null; row: PartRow; note?: Note }
  | { k: "thing"; fee: string; t: number }
  | { k: "fee"; fee: string; group: string };

/** A place a lifted thing may be dropped on. */
export type LiftTarget =
  /** A case's head, the open case, or a fee whose price changes by nothing (`case` null). */
  | { k: "case"; fee: string; case: string | null }
  /** A cell: its cases, its part row (or the whole case), and the thing it spans along. */
  | { k: "cell"; fee: string; cases: string[]; row: CellRow; along: number }
  /** A table's column head, by its case. */
  | { k: "col"; fee: string; case: string }
  /** A grid's row or column head, by its value of thing `t`. */
  | { k: "value"; fee: string; t: number; key: string }
  /** A grid's place no case holds: the value of thing `t` it is at, in the row of case `row`. */
  | { k: "place"; fee: string; row: string; t: number; when: When }
  /** A thing of a fee's band head. */
  | { k: "thing"; fee: string; t: number }
  /** A fee's card, by its group. */
  | { k: "fee"; fee: string; group: string };

const PREFIX = "lift:";
/** A lifted thing as the carried item's id. */
export const liftId = (l: Lifted): string => `${PREFIX}${JSON.stringify(l)}`;
/** The lifted thing a carried item names; null for anything else (a toolbox card). */
export function liftedOf(item: string): Lifted | null {
  if (!item.startsWith(PREFIX)) return null;
  try {
    return JSON.parse(item.slice(PREFIX.length)) as Lifted;
  } catch {
    return null;
  }
}

/** The result of a drop: the deal after it, and, where it took something the person gave, the fee it changed and the undo line's words. */
export interface LiftResult {
  deal: FeeDeal;
  kept?: { feeId: string; words: string };
}

const feeOf = (deal: FeeDeal, id: string) => deal.fees.find((f) => f.id === id);

/** The fee a drop changes, as the result of one fee's edit; null where it changed nothing. */
function oneFee(deal: FeeDeal, fee: Fee, next: Fee, words?: string): LiftResult | null {
  if (next === fee || sameContent(next, fee)) return null;
  return { deal: updateFee(deal, fee.id, () => next), ...(words ? { kept: { feeId: fee.id, words } } : {}) };
}

/** The fees in the order the page shows them (`shown`), with `id` moved to stand before `before` in its group. */
function reordered(shown: readonly string[], id: string, before: string): string[] {
  const rest = shown.filter((x) => x !== id);
  const at = rest.indexOf(before);
  const from = shown.indexOf(id), to = shown.indexOf(before);
  // dropped on a card after its own place, it goes after that card
  rest.splice(at + (from < to ? 1 : 0), 0, id);
  return rest;
}

/**
 * What dropping `l` on `on` does to the deal (`copy`: the modifier key was held, so a part stays where it was too), with `shown` the fees'
 * ids in the order the page shows them; null where the place does not take it (`liftTakes`).
 */
export function liftDrop(deal: FeeDeal, l: Lifted, on: LiftTarget, opts: { copy?: boolean; shown?: readonly string[] } = {}): LiftResult | null {
  const fee = feeOf(deal, l.fee);
  if (!fee) return null;
  switch (l.k) {
    case "col":
      if (on.k !== "col" || on.fee !== l.fee || on.case === l.case || !hasCases(fee)) return null;
      return oneFee(deal, fee, moveCase(fee, l.case, on.case));
    case "value":
      if (on.k !== "value" || on.fee !== l.fee || on.t !== l.t || on.key === l.key || !hasCases(fee)) return null;
      return oneFee(deal, fee, moveValue(fee, l.t, l.key, on.key));
    case "cell": {
      if (!hasCases(fee)) return null;
      // onto a cell of its own row: the cell's price goes to it, and they merge
      // a cell takes no other cell: a neighbour takes its price only by a stretch over a place left empty (reach.ts)
      if (on.k === "cell") return null;
      // a whole case into a grid's place no case holds: it takes the place's row and its column, so it stands there alone
      if (l.row === WHOLE && on.k === "place" && on.fee === l.fee && l.cases.length === 1) return oneFee(deal, fee, intoPlace(fee, l.cases[0]!, on), copy.cases.lifted.movedCase);
      if (l.row !== WHOLE && isPartRow(l.row)) return partDrop(deal, fee, l.cases[0]!, l.row, on, !!opts.copy);
      return null;
    }
    case "part":
      return l.note ? noteDrop(deal, fee, l.case, l.note, on, !!opts.copy) : partDrop(deal, fee, l.case, l.row, on, !!opts.copy);
    case "thing":
      if (on.k !== "thing" || on.fee !== l.fee || on.t === l.t) return null;
      return oneFee(deal, fee, swapThings(fee, l.t, on.t));
    case "fee": {
      if (on.k !== "fee" || on.fee === l.fee || on.group !== l.group || !opts.shown) return null;
      const next = orderFees(deal, reordered(opts.shown, l.fee, on.fee));
      return next === deal ? null : { deal: next };
    }
    default:
      return null;
  }
}

/**
 * A fee whose case `id` stands at a grid's place no case holds (`on`): its value of the place's thing is the place's, and of the other
 * of the grid's two things the row's (the case `on.row`'s). Left as it is where the case or the row's case is gone.
 */
function intoPlace(fee: Fee, id: string, on: Extract<LiftTarget, { k: "place" }>): Fee {
  const row = caseIn(fee, on.row);
  if (!row || !caseIn(fee, id)) return fee;
  return [0, 1].reduce((x, j) => (j === on.t ? setWhen(x, id, j, on.when) : setWhen(x, id, j, row.when[j]!)), fee);
}

const caseIn = (fee: Fee, id: string) => (hasCases(fee) ? fee.cases.find((c) => c.id === id) : undefined);

/** A part row dropped on another case of its fee (it moves there) or on another fee's case or line (it moves there, where that fee takes it). */
function partDrop(deal: FeeDeal, fee: Fee, from: string | null, row: PartRow, on: LiftTarget, keep: boolean): LiftResult | null {
  if (on.k !== "case" && on.k !== "cell") return null;
  const to = on.k === "case" ? on.case : on.cases[0]!;
  if (on.fee === fee.id) {
    if (!hasCases(fee) || from === null || to === null || to === from) return null;
    // the case it lands on had that row's part: kept for the undo, which says what was replaced
    const had = cellHolds(caseIn(fee, to)!, row);
    return oneFee(deal, fee, moveCell(fee, from, to, row, keep), had ? copy.cases.lifted.replaced.replace("{what}", copy.cases.rowHeads[row] ?? "") : undefined);
  }
  const other = feeOf(deal, on.fee);
  if (!other) return null;
  const moved = moveCellTo(fee, from, other, to, row, keep);
  return moved ? { deal: updateFee(updateFee(deal, fee.id, () => moved.from), other.id, () => moved.to) } : null;
}

/** One note dropped on another case, of its fee or another: added to its notes, taken from its own case unless copied (`moveNoteTo`). */
function noteDrop(deal: FeeDeal, fee: Fee, from: string | null, note: Note, on: LiftTarget, keep: boolean): LiftResult | null {
  if (on.k !== "case" && on.k !== "cell") return null;
  const to = on.k === "case" ? on.case : on.cases[0]!;
  const other = feeOf(deal, on.fee);
  if (!other) return null;
  const moved = moveNoteTo(fee, from, other, to, note, keep);
  if (!moved) return null;
  return { deal: other.id === fee.id ? updateFee(deal, fee.id, () => moved.to) : updateFee(updateFee(deal, fee.id, () => moved.from), other.id, () => moved.to) };
}

/** Whether `on` takes `l` (`liftDrop` would change something). */
export const liftTakes = (deal: FeeDeal, l: Lifted, on: LiftTarget, shown?: readonly string[]): boolean => liftDrop(deal, l, on, { shown: shown ?? deal.fees.map((f) => f.id) }) !== null;

/**
 * Why a part lifted from one fee does not drop on another fee's case: that fee's kind does not take it there. Null where it does, or where
 * the place is not another fee's.
 */
export function liftWhy(deal: FeeDeal, l: Lifted, on: LiftTarget): string | null {
  if ((l.k !== "part" && l.k !== "cell") || (on.k !== "case" && on.k !== "cell") || on.fee === l.fee) return null;
  const from = feeOf(deal, l.fee), to = feeOf(deal, on.fee);
  const row = l.row;
  if (!from || !to || !isPartRow(row)) return null;
  const fromCase = l.k === "part" ? l.case : l.cases[0]!;
  return cellMovesTo(from, fromCase, to, on.k === "case" ? on.case : on.cases[0]!, row) ? null : copy.cases.lifted.notHere;
}

/** Whether the bin takes `l`: it can be taken away (`liftRemove` would change something). */
export const binTakes = (deal: FeeDeal, l: Lifted): boolean => liftRemove(deal, l) !== null;

/**
 * What the bin does with `l`: a column's case, a ladder's step, a grid's row or column, a cell's cases (a grid) or its part (a table), a
 * part row in every case, a part of the open case. Each keeps an undo, with its words; null where nothing can be taken away (the last
 * case, a thing of a head, a fee's card).
 */
export function liftRemove(deal: FeeDeal, l: Lifted): LiftResult | null {
  const fee = feeOf(deal, l.fee);
  if (!fee) return null;
  const w = copy.cases.lifted;
  switch (l.k) {
    case "col":
      return oneFee(deal, fee, removeCase(fee, l.case), copy.cases.caseRemoved);
    case "step":
      return oneFee(deal, fee, removeStep(fee, l.t, l.step), w.step.replace("{name}", l.name));
    case "value":
      return oneFee(deal, fee, removeValue(fee, l.t, l.key), (l.t === 0 ? w.row : w.column).replace("{name}", l.name));
    case "cell": {
      if (l.row === WHOLE) {
        let next = fee;
        for (const id of l.cases) next = removeCase(next, id);
        return oneFee(deal, fee, next, l.cases.length > 1 ? w.cases : copy.cases.caseRemoved);
      }
      return isPartRow(l.row) ? oneFee(deal, fee, clearCells(fee, l.cases, l.row), w.part[l.row]) : null;
    }
    case "row":
      return hasCases(fee) ? oneFee(deal, fee, clearCells(fee, fee.cases.map((c) => c.id), l.row), w.part[l.row]) : null;
    case "part": {
      if (l.note) return oneFee(deal, fee, withoutNote(fee, l.case, l.note), w.noteRemoved);
      if (hasCases(fee)) return l.case ? oneFee(deal, fee, clearCells(fee, [l.case], l.row), w.part[l.row]) : null;
      if (!cellHolds(fee, l.row)) return null;
      const x = withoutCell(fee, l.row, fee.kind);
      const { stages: _s, sale: _sale, ...head } = fee;
      return oneFee(deal, fee, { ...head, stages: x.stages, ...(x.sale ? { sale: x.sale } : {}) } as Fee, w.part[l.row]);
    }
    default:
      return null;
  }
}
