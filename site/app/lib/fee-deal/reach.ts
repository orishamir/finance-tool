// How far a cell's knob may stretch it (F-114, the fee page's grids): the places of the line it stands in
// (a grid's row, a part row under a grid's row, a grid's column), each as a knob may treat it, and the edits a new reach makes. A knob
// moves over every case of the line, which takes the cell's content in place of what it held there (one undo brings that back), over a
// grid's place no case holds (it is filled with a copy of the case), or back where the cell covers more than one place. It stops only
// where nothing may be stretched over: a case on any value across, a cell down over rows. Pure.
import type { When } from "./model";
import type { FeeLayout, GridCell, GridRow } from "./layout";

/**
 * A place of a line, as a knob may stretch over it: a case that holds a price there (`own`), the cell's own, or a neighbour's that the
 * stretch writes over; a case that holds nothing there (`take`); a place no case holds, by its value along the line (`place`); null where
 * nothing may be stretched over (a case on any value, a cell down over rows).
 */
export type Slot = { own: string } | { take: string } | { place: When } | null;

type Grid = Extract<FeeLayout, { shape: "grid" }>;

const reachable = (x: Slot | undefined): boolean => !!x;

/** How far a cell over places `from` to `from + span - 1` may reach along `slots`: from `lo` to `hi`, its own places always. */
export function reachOf(slots: readonly Slot[], from: number, span: number): { lo: number; hi: number } {
  let lo = from, hi = from + span - 1;
  while (lo > 0 && reachable(slots[lo - 1])) lo--;
  while (hi < slots.length - 1 && reachable(slots[hi + 1])) hi++;
  return { lo, hi };
}

/** Whether a cell has a knob on its edge before it and after it: toward a place it may reach, or back where it covers more than one. */
export function knobEdges(slots: readonly Slot[], from: number, span: number): { before: boolean; after: boolean } {
  const { lo, hi } = reachOf(slots, from, span);
  return { before: lo < from || span > 1, after: hi > from + span - 1 || span > 1 };
}

/**
 * What a cell over `from` to `to` reaching `a` to `b` now does: the cases it newly covers, which take its content (`over`), those of them
 * whose own it writes over (`replaced`), the places it fills (`places`), and its own cases it leaves (`off`).
 */
export function reachEdits(slots: readonly Slot[], from: number, to: number, a: number, b: number): { over: string[]; replaced: string[]; places: When[]; off: string[] } {
  const reached = slots.slice(a, b + 1).filter((_, k) => a + k < from || a + k > to);
  return {
    over: reached.flatMap((x) => (x && "take" in x ? [x.take] : x && "own" in x ? [x.own] : [])),
    replaced: reached.flatMap((x) => (x && "own" in x ? [x.own] : [])),
    places: reached.flatMap((x) => (x && "place" in x ? [x.place] : [])),
    off: slots.slice(from, to + 1).flatMap((x, k) => (x && "own" in x && (from + k < a || from + k > b) ? [x.own] : [])),
  };
}

const cellAt = (cells: readonly GridCell[], k: number) => cells.find((x) => x.from <= k && k < x.from + x.span)!;

/** The case cell of a grid's row at column `k`, where one may be stretched there: not a case on any value across, nor a cell down over rows. */
function caseAt(cells: readonly GridCell[], k: number): string | null {
  const cell = cellAt(cells, k);
  return cell.case && !cell.whole && !cell.covered && !cell.down ? cell.cases[k - cell.from]! : null;
}

/** A grid's row as places, for a stretch across: a place no case holds, which a stretch fills; every case holds its own price, written over. */
export const gridRowSlots = (g: Grid, row: GridRow): Slot[] =>
  g.columns.map((col, k) => {
    if (!cellAt(row.cells, k).case) return { place: col.when };
    const id = caseAt(row.cells, k);
    return id ? { own: id } : null;
  });

/** A part row under a grid's row as places, for its part cells (`holds`: whether a case holds that part): with it its own, written over; without it, it takes it. */
export const gridPartSlots = (g: Grid, row: GridRow, holds: (caseId: string) => boolean): Slot[] =>
  g.columns.map((_, k) => {
    const id = caseAt(row.cells, k);
    return id === null ? null : holds(id) ? { own: id } : { take: id };
  });

/** A grid's column `k` as places by row, for a stretch down: a one-column case cell (or a row of a cell down over rows), or a place no case holds. */
export const gridColumnSlots = (g: Grid, k: number): Slot[] =>
  g.rows.map((r) => {
    const cell = cellAt(r.cells, k);
    if (!cell.case) return { place: r.when };
    return !cell.whole && cell.span === 1 ? { own: cell.case } : null;
  });
