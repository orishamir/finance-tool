// The fee page's one undo: a change that loses something the person typed or chose (a fee taken away, a fee filled from a price list over
// its own prices, a price stage taken away) keeps what it took, for a moment, so one action puts it back. Only the last such change is
// kept. Other edits made meanwhile stay: the undo puts back only what its change took (the fee at its place, the fee's prices as they were
// before the fill, the stage at its place) into the deal as it is now. It stands while the deal is the one it was made on and what it would
// put back has a place to go: the fee is still away, or still there to take back its prices or its stage.
import { removeStage, updateFee, type Side } from "./edit";
import type { Fee, FeeDeal, MonthKey, ProviderKind, Stage } from "./model";
import { fillFee } from "./templates";
import type { FeesData } from "../fee-page-data";

/** What the change did, for its line's words and its place: the fee taken away and where it stood, the fee filled and from which house, the stage taken away. */
export type UndoWhat = { kind: "remove"; feeId: string; at: number } | { kind: "fill"; feeId: string; house: string } | { kind: "stage"; feeId: string; side: Side; k: number };

/** What the change took: the fee away or as it was before the fill (with the deal's provider, where the fill took it), or the stage away. */
type Took = { fee: Fee; provider?: ProviderKind } | { stage: Stage; endBefore?: MonthKey };

export interface Undo {
  what: UndoWhat;
  /** The deal the change was made on. */
  dealId: string;
  took: Took;
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

const stagesOf = (fee: Fee, side: Side): Stage[] | undefined => (side === "sell" ? fee.sale : fee.stages);

/**
 * The deal without a fee. A removed chosen fee hands the choice to its neighbour (the next card, else the one before), so the panel never
 * stands empty; another chosen fee stays chosen. Null where the deal has no such fee.
 */
export function removeFeeKept(deal: FeeDeal, feeId: string, chosen: string | null): Undoable | null {
  const at = deal.fees.findIndex((f) => f.id === feeId);
  if (at < 0) return null;
  const after: FeeDeal = { ...deal, fees: deal.fees.filter((f) => f.id !== feeId) };
  const next = chosen === feeId ? (after.fees[at] ?? after.fees[at - 1])?.id ?? null : chosen;
  return { deal: after, chosen: next, undo: { what: { kind: "remove", feeId, at }, dealId: deal.id, took: { fee: deal.fees[at]! }, chosenBefore: chosen, chosenAfter: next } };
}

/** The deal with one fee filled from a house's price list (`fillFee`), its own prices kept for the undo. Null where nothing fills it. */
export function fillFeeKept(deal: FeeDeal, feeId: string, house: string, data: Pick<FeesData, "houses">, chosen: string | null): Undoable | null {
  const after = fillFee(deal, feeId, house, data);
  const fee = deal.fees.find((f) => f.id === feeId);
  if (!after || !fee) return null;
  const took: Took = { fee, ...(deal.provider && !after.provider ? { provider: deal.provider } : {}) };
  return { deal: after, chosen, undo: { what: { kind: "fill", feeId, house }, dealId: deal.id, took, chosenBefore: chosen, chosenAfter: chosen } };
}

/** The deal with stage `k` of a fee's prices on `side` taken away (`removeStage`). Null where the fee has one price on that side. */
export function removeStageKept(deal: FeeDeal, feeId: string, side: Side, k: number, chosen: string | null): Undoable | null {
  const fee = deal.fees.find((f) => f.id === feeId);
  const stages = fee && stagesOf(fee, side);
  if (!fee || !stages?.[k]) return null;
  const changed = removeStage(fee, side, k);
  if (changed === fee) return null;
  // the last stage taken away takes the end of the one before it with it (the price left last has no end): the undo gives it back
  const endBefore = k === stages.length - 1 ? stages[k - 1]?.until : undefined;
  return { deal: updateFee(deal, feeId, () => changed), chosen, undo: { what: { kind: "stage", feeId, side, k }, dealId: deal.id, took: { stage: stages[k]!, ...(endBefore ? { endBefore } : {}) }, chosenBefore: chosen, chosenAfter: chosen } };
}

/** The deal as it is now with what the change took put back; null where it has no place to go (another deal, the fee or its side gone, the fee already back). */
function restored(deal: FeeDeal, u: Undo): FeeDeal | null {
  if (deal.id !== u.dealId) return null;
  const w = u.what;
  if (w.kind === "remove" && "fee" in u.took) {
    if (deal.fees.some((f) => f.id === w.feeId)) return null;
    const at = Math.min(w.at, deal.fees.length);
    return { ...deal, fees: [...deal.fees.slice(0, at), u.took.fee, ...deal.fees.slice(at)] };
  }
  if (w.kind === "fill" && "fee" in u.took) {
    const before = u.took;
    if (!deal.fees.some((f) => f.id === w.feeId)) return null;
    const back = updateFee(deal, w.feeId, () => before.fee);
    return before.provider && !back.provider ? { ...back, provider: before.provider } : back;
  }
  if (w.kind === "stage" && "stage" in u.took) {
    const took = u.took;
    const fee = deal.fees.find((f) => f.id === w.feeId);
    const stages = fee && stagesOf(fee, w.side);
    if (!fee || !stages) return null;
    const at = Math.min(w.k, stages.length);
    const next = [...stages.slice(0, at), took.stage, ...stages.slice(at)];
    // put back last: the price before it ends again where it ended
    if (at === stages.length && at > 0) next[at - 1] = { ...next[at - 1]!, ...(took.endBefore ? { until: took.endBefore } : {}) };
    return updateFee(deal, w.feeId, (f) => (w.side === "sell" ? { ...f, sale: next } : { ...f, stages: next }));
  }
  return null;
}

/**
 * What the change took, put back into the deal as it is now; null where it has no place to go. The choice goes back to what it was only
 * where it is still what the change left; a fee chosen since stays chosen.
 */
export function undo(deal: FeeDeal, u: Undo, chosen: string | null): { deal: FeeDeal; chosen: string | null } | null {
  const back = restored(deal, u);
  if (!back) return null;
  return { deal: back, chosen: chosen === u.chosenAfter ? u.chosenBefore : chosen };
}

/** Whether an undo still stands on the deal on screen: what it took has a place to go. */
export const standing = (u: Undo | null, deal: FeeDeal): u is Undo => !!u && restored(deal, u) !== null;

// ---------------------------------------------------------------- a saved deal deleted

/** A saved deal deleted from the device: the deal and its place among the saved ones, and whether it was the deal on screen. */
export interface DealUndo {
  what: { kind: "deal" };
  deal: FeeDeal;
  at: number;
  shown: boolean;
}

/** The saved deals without one, keeping it for the undo; null where none has that id. */
export function deleteDealKept(deals: readonly FeeDeal[], id: string, shownId: string): { deals: FeeDeal[]; undo: DealUndo } | null {
  const at = deals.findIndex((d) => d.id === id);
  if (at < 0) return null;
  return { deals: deals.filter((d) => d.id !== id), undo: { what: { kind: "deal" }, deal: deals[at]!, at, shown: id === shownId } };
}

/** The saved deals with the deleted one back at its place; null where it is back already. */
export function undoDelete(deals: readonly FeeDeal[], u: DealUndo): FeeDeal[] | null {
  if (deals.some((d) => d.id === u.deal.id)) return null;
  const at = Math.min(u.at, deals.length);
  return [...deals.slice(0, at), u.deal, ...deals.slice(at)];
}
