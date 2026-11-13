// The fee page's one undo: a change that loses something the person typed or chose (a fee taken away, a fee filled from a price list over
// its own prices, a later price taken away, the prices after one taken away by "כל הזמן") keeps what it took, for a moment, so one action
// puts it back. Only the last such change is kept. It stands while the part it would put back into is as the change left it: for a fee
// taken away, the deal has no fee of its kind (of the person's own: no fee with its id); for the others, the fee is unchanged since. A
// change of the deal's kind that takes fees away (`setKindKept`) is kept the same way, and puts the kind and the fees back together. Edits
// elsewhere in the deal keep it standing and stay when it is used; once its part changes, it goes. A case taken away, and a thing a fee's
// price changes by taken away with the cases it merged (F-114), are kept the same way, as a change of their fee. The words of its line are
// here too.
import { feeDeal as copy } from "../../copy";
import type { ProductId } from "@finance-tool/schema";
import { holdOn, laterUntouched, removeBy, removeCase, removeStage, setKind, updateFee, type Side } from "./edit";
import type { DealKind } from "./kinds";
import { newFee, pricedOf, pricesOn, sameContent, type Fee, type FeeDeal, type ProviderKind } from "./model";
import type { FeeKindId } from "./shapes";
import { fillFee, houseName } from "./templates";
import type { FeesData } from "../fee-page-data";

/**
 * What the change did, for its line's words and its place: the fee taken away and where it stood, the fee filled and from which house,
 * price `k` taken away, the prices after price `k` taken away (`chain`), a case taken away, or thing `t` taken away (`by`).
 */
export type UndoWhat =
  | { kind: "remove"; feeId: string; at: number }
  | { kind: "fill"; feeId: string; house: string }
  | { kind: "stage"; feeId: string; side: Side; k: number; caseId?: string }
  | { kind: "chain"; feeId: string; side: Side; k: number; caseId?: string }
  | { kind: "case"; feeId: string; caseId: string }
  | { kind: "by"; feeId: string; t: number };

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

/**
 * The deal with price `k` of a fee's prices on `side` taken away (`removeStage`; in case `caseId` where the fee has cases). Null where the
 * fee has one price on that side.
 */
export function removeStageKept(deal: FeeDeal, feeId: string, side: Side, k: number, chosen: string | null, caseId?: string): Undoable | null {
  const fee = deal.fees.find((f) => f.id === feeId);
  if (!fee || (side === "sell" && !pricedOf(fee, caseId).sale)) return null;
  const changed = removeStage(fee, side, k, caseId);
  if (changed === fee) return null;
  return feeChange(deal, fee, changed, { kind: "stage", feeId, side, k, ...(caseId ? { caseId } : {}) }, chosen);
}

/** The deal with a fee's case taken away (`removeCase`), the fee as it was kept for the undo. Null where it cannot be taken away. */
export function removeCaseKept(deal: FeeDeal, feeId: string, caseId: string, chosen: string | null): Undoable | null {
  const fee = deal.fees.find((f) => f.id === feeId);
  if (!fee) return null;
  const changed = removeCase(fee, caseId);
  if (changed === fee) return null;
  return feeChange(deal, fee, changed, { kind: "case", feeId, caseId }, chosen);
}

/** The deal with thing `t` of a fee taken away and its cases merged (`removeBy`), the fee as it was kept for the undo. */
export function removeByKept(deal: FeeDeal, feeId: string, t: number, chosen: string | null): Undoable | null {
  const fee = deal.fees.find((f) => f.id === feeId);
  if (!fee) return null;
  const changed = removeBy(fee, t);
  if (changed === fee) return null;
  return feeChange(deal, fee, changed, { kind: "by", feeId, t }, chosen);
}

/**
 * The deal with price `k` of a fee's prices on `side` held on and the prices after it taken away (`holdOn`): kept for the undo where they
 * hold anything the person gave, gone silently where they are as "לזמן מוגבל" added them (`laterUntouched`). Null where none follows it.
 */
export function holdOnKept(deal: FeeDeal, feeId: string, side: Side, k: number, chosen: string | null, caseId?: string): MaybeUndoable | null {
  const fee = deal.fees.find((f) => f.id === feeId);
  if (!fee || (side === "sell" && !pricedOf(fee, caseId).sale) || k >= pricesOn(fee, side, caseId).length - 1) return null;
  const changed = holdOn(fee, side, k, caseId);
  if (laterUntouched(fee, side, k, caseId)) return { deal: updateFee(deal, feeId, () => changed), chosen, undo: null };
  return feeChange(deal, fee, changed, { kind: "chain", feeId, side, k, ...(caseId ? { caseId } : {}) }, chosen);
}

// ---------------------------------------------------------------- the deal's kind changed

/**
 * The deal's kind changed and took fees away (`setKind`): the deal as it was, and where each fee taken away stood in it, so one action puts
 * the kind and the fees back together.
 */
export interface KindUndo {
  what: { kind: "product"; to: ProductId };
  dealId: string;
  /** The deal before the change. */
  before: FeeDeal;
  /** The fees taken away, each with its place in the deal before. */
  gone: { fee: Fee; at: number }[];
  chosenBefore: string | null;
  chosenAfter: string | null;
}

/** A fee as the builder adds it, nothing typed or filled in it: one price of its usual form, its figure blank. */
const blankFee = (f: Fee): boolean => f.name === undefined && !f.sale && sameContent(f.stages, newFee(f.kind).stages);

/**
 * The deal of another kind (`setKind`), kept for the undo where a fee it takes away holds anything typed or filled; silent where every fee
 * it takes away is blank, or none is. A chosen fee taken away hands the choice to the first fee left.
 */
export function setKindKept(deal: FeeDeal, kind: DealKind, barred: readonly FeeKindId[], chosen: string | null): Omit<MaybeUndoable, "undo"> & { undo: KindUndo | null } {
  const next = setKind(deal, kind, barred);
  const gone = deal.fees.flatMap((fee, at) => (next.fees.some((f) => f.id === fee.id) ? [] : [{ fee, at }]));
  const chosenAfter = chosen !== null && !next.fees.some((f) => f.id === chosen) ? (next.fees[0]?.id ?? null) : chosen;
  if (gone.every((g) => blankFee(g.fee))) return { deal: next, chosen: chosenAfter, undo: null };
  return { deal: next, chosen: chosenAfter, undo: { what: { kind: "product", to: kind.id }, dealId: deal.id, before: deal, gone, chosenBefore: chosen, chosenAfter } };
}

/**
 * Whether a kind's undo still stands: the same deal, still of the kind the change gave it, with no fee of a kind taken away (of the person's
 * own: no fee with its id).
 */
function kindStanding(u: KindUndo, deal: FeeDeal): boolean {
  if (deal.id !== u.dealId || deal.kind !== u.what.to) return false;
  return !u.gone.some(({ fee }) => deal.fees.some((f) => f.id === fee.id || (fee.kind !== "own" && f.kind === fee.kind)));
}

/**
 * The deal put back to its kind with the fees taken away in their places, as it is now otherwise (a fee typed since stays); its template
 * and provider kind as they were.
 */
function kindBack(deal: FeeDeal, u: KindUndo): FeeDeal {
  const fees = [...deal.fees];
  for (const { fee, at } of u.gone) fees.splice(Math.min(at, fees.length), 0, fee);
  const { template: _t, provider: _p, ...rest } = deal;
  const { template, provider } = u.before;
  return { ...rest, kind: u.before.kind, fees, ...(template ? { template } : {}), ...(provider ? { provider } : {}) };
}

/**
 * Whether an undo still stands on the deal on screen: the same deal, and the part it puts back into as its change left it (no fee of the
 * removed fee's kind, or of a fee of the person's own its id; the changed fee unchanged since).
 */
export function standing<U extends Undo | KindUndo>(u: U | null, deal: FeeDeal): u is U {
  if (!u || deal.id !== u.dealId) return false;
  if (u.what.kind === "product") return kindStanding(u as KindUndo, deal);
  return feeStanding(u as Undo, deal);
}

function feeStanding(u: Undo, deal: FeeDeal): boolean {
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
export function undo(deal: FeeDeal, u: Undo | KindUndo, chosen: string | null): { deal: FeeDeal; chosen: string | null } | null {
  if (!standing(u, deal)) return null;
  if (u.what.kind === "product") return { deal: kindBack(deal, u as KindUndo), chosen: chosen === u.chosenAfter ? u.chosenBefore : chosen };
  const f = u as Undo;
  let back: FeeDeal;
  if (f.what.kind === "remove") {
    const at = Math.min(f.what.at, deal.fees.length);
    back = { ...deal, fees: [...deal.fees.slice(0, at), f.before, ...deal.fees.slice(at)] };
  } else {
    back = updateFee(deal, f.before.id, () => f.before);
    if (f.provider && !back.provider) back = { ...back, provider: f.provider };
  }
  return { deal: back, chosen: chosen === f.chosenAfter ? f.chosenBefore : chosen };
}

/** The words of an undo's line: what its change did, with the fee's or the house's name where the line says it. */
export function undoWords(u: Undo | KindUndo, names: (fee: Fee) => string, data: Pick<FeesData, "houses">): string {
  if (u.what.kind === "product") {
    const gone = (u as KindUndo).gone;
    return `${gone.length > 1 ? copy.builder.removedMany : copy.builder.removed}${gone.map((g) => names(g.fee)).join(", ")}.`;
  }
  u = u as Undo;
  switch (u.what.kind) {
    case "stage":
      return copy.panel.stageRemoved;
    case "chain":
      return copy.panel.laterRemoved;
    case "case":
      return copy.cases.caseRemoved;
    case "by":
      return copy.cases.byRemoved;
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
