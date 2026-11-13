// The fee page's one undo: a change that loses something the person typed or chose (a fee taken away, a fee filled from a price list over
// its own prices, a later price taken away, the prices after one taken away by "כל הזמן") keeps what it took, for a moment, so one action
// puts it back. Only the last such change is kept. It stands while the part it would put back into is as the change left it: for a fee
// taken away, the deal has no fee of its kind (of the person's own: no fee with its id); for the others, the fee is unchanged since. Edits
// elsewhere in the deal keep it standing and stay when it is used; once its part changes, it goes. The words of its line are here too.
import { feeDeal as copy } from "../../copy";
import { holdOn, laterUntouched, removeStage, updateFee, type Side } from "./edit";
import { pricesOn, sameContent, type Fee, type FeeDeal, type ProviderKind } from "./model";
import { fillFee, houseName } from "./templates";
import type { FeesData } from "../fee-page-data";

/**
 * What the change did, for its line's words and its place: the fee taken away and where it stood, the fee filled and from which house,
 * price `k` taken away, or the prices after price `k` taken away (`chain`).
 */
export type UndoWhat =
  | { kind: "remove"; feeId: string; at: number }
  | { kind: "fill"; feeId: string; house: string }
  | { kind: "stage"; feeId: string; side: Side; k: number }
  | { kind: "chain"; feeId: string; side: Side; k: number };

export interface Undo {
  what: UndoWhat;
  /** The deal the change was made on. */
  dealId: string;
  /** The fee as it was before the change (and the deal's provider, where a fill took it away). */
  before: Fee;
  provider?: ProviderKind;
  /** The fee as the change left it; none where the change took it away. */
  after?: Fee;
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

/** A change that keeps an undo only where it took something the person gave. */
export type MaybeUndoable = Omit<Undoable, "undo"> & { undo: Undo | null };

/** A change to one fee, kept with the fee before and after it. */
function feeChange(deal: FeeDeal, fee: Fee, changed: Fee, what: UndoWhat, chosen: string | null): Undoable {
  return { deal: updateFee(deal, fee.id, () => changed), chosen, undo: { what, dealId: deal.id, before: fee, after: changed, chosenBefore: chosen, chosenAfter: chosen } };
}

/**
 * The deal without a fee. A removed chosen fee hands the choice to its neighbour (the next card, else the one before), so the panel never
 * stands empty; another chosen fee stays chosen. Null where the deal has no such fee.
 */
export function removeFeeKept(deal: FeeDeal, feeId: string, chosen: string | null): Undoable | null {
  const at = deal.fees.findIndex((f) => f.id === feeId);
  if (at < 0) return null;
  const after: FeeDeal = { ...deal, fees: deal.fees.filter((f) => f.id !== feeId) };
  const next = chosen === feeId ? (after.fees[at] ?? after.fees[at - 1])?.id ?? null : chosen;
  return { deal: after, chosen: next, undo: { what: { kind: "remove", feeId, at }, dealId: deal.id, before: deal.fees[at]!, chosenBefore: chosen, chosenAfter: next } };
}

/** The deal with one fee filled from a house's price list (`fillFee`), its own prices kept for the undo. Null where nothing fills it. */
export function fillFeeKept(deal: FeeDeal, feeId: string, house: string, data: Pick<FeesData, "houses">, chosen: string | null): Undoable | null {
  const filled = fillFee(deal, feeId, house, data);
  const fee = deal.fees.find((f) => f.id === feeId);
  const changed = filled?.fees.find((f) => f.id === feeId);
  if (!filled || !fee || !changed) return null;
  const provider = deal.provider && !filled.provider ? deal.provider : undefined;
  return { deal: filled, chosen, undo: { what: { kind: "fill", feeId, house }, dealId: deal.id, before: fee, ...(provider ? { provider } : {}), after: changed, chosenBefore: chosen, chosenAfter: chosen } };
}

/** The deal with price `k` of a fee's prices on `side` taken away (`removeStage`). Null where the fee has one price on that side. */
export function removeStageKept(deal: FeeDeal, feeId: string, side: Side, k: number, chosen: string | null): Undoable | null {
  const fee = deal.fees.find((f) => f.id === feeId);
  if (!fee || (side === "sell" && !fee.sale)) return null;
  const changed = removeStage(fee, side, k);
  if (changed === fee) return null;
  return feeChange(deal, fee, changed, { kind: "stage", feeId, side, k }, chosen);
}

/**
 * The deal with price `k` of a fee's prices on `side` held on and the prices after it taken away (`holdOn`): kept for the undo where they
 * hold anything the person gave, gone silently where they are as "לזמן מוגבל" added them (`laterUntouched`). Null where none follows it.
 */
export function holdOnKept(deal: FeeDeal, feeId: string, side: Side, k: number, chosen: string | null): MaybeUndoable | null {
  const fee = deal.fees.find((f) => f.id === feeId);
  if (!fee || (side === "sell" && !fee.sale) || k >= pricesOn(fee, side).length - 1) return null;
  const changed = holdOn(fee, side, k);
  if (laterUntouched(fee, side, k)) return { deal: updateFee(deal, feeId, () => changed), chosen, undo: null };
  return feeChange(deal, fee, changed, { kind: "chain", feeId, side, k }, chosen);
}

/**
 * Whether an undo still stands on the deal on screen: the same deal, and the part it puts back into as its change left it (no fee of the
 * removed fee's kind, or of a fee of the person's own its id; the changed fee unchanged since).
 */
export function standing(u: Undo | null, deal: FeeDeal): u is Undo {
  if (!u || deal.id !== u.dealId) return false;
  if (u.what.kind === "remove") {
    const gone = u.before;
    return !deal.fees.some((f) => f.id === gone.id || (gone.kind !== "own" && f.kind === gone.kind));
  }
  const now = deal.fees.find((f) => f.id === u.before.id);
  return !!now && !!u.after && sameContent(now, u.after);
}

/**
 * What the change took, put back into the deal as it is now; null where the undo no longer stands. The choice goes back to what it was
 * only where it is still what the change left; a fee chosen since stays chosen.
 */
export function undo(deal: FeeDeal, u: Undo, chosen: string | null): { deal: FeeDeal; chosen: string | null } | null {
  if (!standing(u, deal)) return null;
  let back: FeeDeal;
  if (u.what.kind === "remove") {
    const at = Math.min(u.what.at, deal.fees.length);
    back = { ...deal, fees: [...deal.fees.slice(0, at), u.before, ...deal.fees.slice(at)] };
  } else {
    back = updateFee(deal, u.before.id, () => u.before);
    if (u.provider && !back.provider) back = { ...back, provider: u.provider };
  }
  return { deal: back, chosen: chosen === u.chosenAfter ? u.chosenBefore : chosen };
}

/** The words of an undo's line: what its change did, with the fee's or the house's name where the line says it. */
export function undoWords(u: Undo, names: (fee: Fee) => string, data: Pick<FeesData, "houses">): string {
  switch (u.what.kind) {
    case "stage":
      return copy.panel.stageRemoved;
    case "chain":
      return copy.panel.laterRemoved;
    case "fill":
      return `${copy.builder.filled(houseName(u.what.house, data) ?? "")}.`;
    case "remove":
      return `${copy.builder.removed}${names(u.before)}.`;
  }
}

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
