// The fee page's one undo: a change that loses something the person typed or chose (a fee taken away, a fee filled from a price list over
// its own prices, a price stage taken away) keeps the deal as it was before it, for a moment, so one action puts it back. Only the last
// such change is kept, and only on the deal it left: any other change to the deal, or another deal opened, ends it.
import { removeStage, updateFee, type Side } from "./edit";
import type { FeeDeal } from "./model";
import { fillFee } from "./templates";
import type { FeesData } from "../fee-page-data";

/** What the change did, for its line's words and its place: the fee taken away and where it stood, the fee filled and from which house, the stage taken away. */
export type UndoWhat = { kind: "remove"; feeId: string; at: number } | { kind: "fill"; feeId: string; house: string } | { kind: "stage"; feeId: string; side: Side; k: number };

export interface Undo {
  what: UndoWhat;
  /** The deal before the change and right after it. */
  before: FeeDeal;
  after: FeeDeal;
  /** The fee chosen before the change and right after it. */
  chosenBefore: string | null;
  chosenAfter: string | null;
}

/** A change, with what puts it back. */
export interface Undoable {
  deal: FeeDeal;
  chosen: string | null;
  undo: Undo;
}

const kept = (before: FeeDeal, after: FeeDeal, what: UndoWhat, chosenBefore: string | null, chosenAfter: string | null): Undoable => ({
  deal: after,
  chosen: chosenAfter,
  undo: { what, before, after, chosenBefore, chosenAfter },
});

/**
 * The deal without a fee. A removed chosen fee hands the choice to its neighbour (the next card, else the one before), so the panel never
 * stands empty; another chosen fee stays chosen. Null where the deal has no such fee.
 */
export function removeFeeKept(deal: FeeDeal, feeId: string, chosen: string | null): Undoable | null {
  const at = deal.fees.findIndex((f) => f.id === feeId);
  if (at < 0) return null;
  const after: FeeDeal = { ...deal, fees: deal.fees.filter((f) => f.id !== feeId) };
  const next = chosen === feeId ? (after.fees[at] ?? after.fees[at - 1])?.id ?? null : chosen;
  return kept(deal, after, { kind: "remove", feeId, at }, chosen, next);
}

/** The deal with one fee filled from a house's price list (`fillFee`), its own prices kept for the undo. Null where nothing fills it. */
export function fillFeeKept(deal: FeeDeal, feeId: string, house: string, data: Pick<FeesData, "houses">, chosen: string | null): Undoable | null {
  const after = fillFee(deal, feeId, house, data);
  return after ? kept(deal, after, { kind: "fill", feeId, house }, chosen, chosen) : null;
}

/** The deal with stage `k` of a fee's prices on `side` taken away (`removeStage`). Null where the fee has one price on that side. */
export function removeStageKept(deal: FeeDeal, feeId: string, side: Side, k: number, chosen: string | null): Undoable | null {
  const fee = deal.fees.find((f) => f.id === feeId);
  if (!fee) return null;
  const changed = removeStage(fee, side, k);
  if (changed === fee) return null;
  return kept(deal, updateFee(deal, feeId, () => changed), { kind: "stage", feeId, side, k }, chosen, chosen);
}

/**
 * The deal as it was before the change, on the deal the change left only: after any other change it is null. The choice goes back to what
 * it was only where it is still what the change left; a fee chosen since stays chosen.
 */
export function undo(deal: FeeDeal, u: Undo, chosen: string | null): { deal: FeeDeal; chosen: string | null } | null {
  if (deal !== u.after) return null;
  return { deal: u.before, chosen: chosen === u.chosenAfter ? u.chosenBefore : chosen };
}

/** Whether an undo still stands on the deal on screen. */
export const standing = (u: Undo | null, deal: FeeDeal): u is Undo => !!u && u.after === deal;
