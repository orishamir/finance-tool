// The fee page's one undo: a change that loses something the person typed or chose (a fee taken away, a fee filled from a price list over
// its own prices, a later price taken away, the prices after one taken away by the bin of its month) keeps what it took, for a moment, so
// one action puts it back. Only the last such change is kept. It stands while the part it would put back into is as the change left it: for a fee
// taken away, the deal has no fee of its kind (of the person's own: no fee with its id); for the others, the fee is unchanged since. A
// change of the deal's kind that takes fees away (`setKindKept`) is kept the same way, and puts the kind and the fees back together. Edits
// elsewhere in the deal keep it standing and stay when it is used; once its part changes, it goes. A case taken away, and a thing a fee's
// price changes by taken away with the cases it merged (F-114), are kept the same way, as a change of their fee. The words of its line are
// here too.
import { feeDeal as copy } from "../../copy";
import type { ProductId } from "@finance-tool/schema";
import { thingName } from "./case-words";
import { changeUntouched, removeChange } from "./edits/stage";
import { ownKept, removeBy, removeCase } from "./edits/case";
import { setKind, updateFee } from "./edits/deal";
import { type Side } from "./model";
import { lostParts, PARTS, setPart, type LostPart, type PartId } from "./offers/parts";
import type { DealKind } from "./kinds";
import { blankPrice, hasCases, newFee, pricedOf, pricesOn, sameContent, toolPrice, type Fee, type FeeDeal, type ProviderKind } from "./model";
import type { DataBar } from "./offers/offer";
import { fillFee, houseName } from "./templates";
import type { FeesData } from "../fee-page-data";
import type { LiftResult } from "./lifted";

/**
 * What the change did, for its line's words and its place: the fee taken away and where it stood, the fee filled and from which house,
 * price `k` taken away, the prices after price `k` taken away (`chain`), a case taken away, thing `t` taken away (`by`), or price `k` put
 * in another form by the toolbox (`form`).
 */
export type UndoWhat =
  | { kind: "remove"; feeId: string; at: number }
  | { kind: "fill"; feeId: string; house: string }
  | { kind: "chain"; feeId: string; side: Side; k: number; caseId?: string }
  | { kind: "case"; feeId: string; caseId: string }
  | { kind: "by"; feeId: string; t: number }
  | { kind: "form"; feeId: string; k: number; caseId?: string }
  /** A change made by a drag or a knob (lifted.ts) that took something: its words, said when it was made. */
  | { kind: "said"; feeId: string; words: string };

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
 * The deal with the price the toolbox acts on (`toolPrice`) put in the form a toolbox part sets (`setPart`; in case `caseId` where the fee has cases):
 * what carries over carries (`withForm`), and the price as it stood is kept for the undo where it held anything given, typed or filled;
 * a price still blank, as the builder added it, changes silently. Null where the part sets no form, or the price is in it already.
 */
export function changeFormKept(deal: FeeDeal, feeId: string, part: PartId, chosen: string | null, caseId?: string, at?: number): MaybeUndoable | null {
  const fee = deal.fees.find((f) => f.id === feeId);
  const form = PARTS[part].form;
  if (!fee || !form) return null;
  const k = toolPrice(pricedOf(fee, caseId), at);
  const was = pricesOn(fee, "buy", caseId)[k]!.price;
  if (was.form === form) return null;
  const changed = setPart(fee, part, true, { k, ...(caseId ? { caseId } : {}) });
  if (changed === fee || sameContent(changed, fee)) return null;
  if (was.form === "free" || sameContent(was, blankPrice(was.form))) return { deal: updateFee(deal, feeId, () => changed), chosen, undo: null };
  return feeChange(deal, fee, changed, { kind: "form", feeId, k, ...(caseId ? { caseId } : {}) }, chosen);
}

/**
 * Whether choosing form `part` for a fee's price (in case `caseId`) puts back the price an undo keeps: the undo is of that price made free
 * (from the toolbox's "חינם"), it still stands, the price is still free, and before it was in that form. The page then undoes, so the
 * parts it had come back with the form.
 */
export function formBack(u: Undo | KindUndo | null, deal: FeeDeal, feeId: string, part: PartId, caseId?: string): boolean {
  if (!u || u.what.kind !== "form" || !standing(u, deal)) return false;
  const f = u as Undo;
  const w = f.what as Extract<UndoWhat, { kind: "form" }>;
  if (w.feeId !== feeId || w.caseId !== caseId) return false;
  const now = deal.fees.find((x) => x.id === feeId);
  const was = pricesOn(f.before, "buy", caseId)[w.k]?.price;
  return !!now && pricesOn(now, "buy", caseId)[w.k]?.price.form === "free" && !!was && was.form === PARTS[part].form;
}

/**
 * The deal with change `k` of a fee's prices on `side` taken away at its divider, the later price merging back into the earlier
 * (`removeChange`): kept for the undo where the later price differs from the earlier, gone silently where it is still the earlier's copy
 * (`changeUntouched`). Null where no change `k` stands.
 */
export function removeChangeKept(deal: FeeDeal, feeId: string, side: Side, k: number, chosen: string | null, caseId?: string): MaybeUndoable | null {
  const fee = deal.fees.find((f) => f.id === feeId);
  if (!fee || (side === "sell" && !pricedOf(fee, caseId).sale) || k >= pricesOn(fee, side, caseId).length - 1) return null;
  const changed = removeChange(fee, side, k, caseId);
  if (changeUntouched(fee, side, k, caseId)) return { deal: updateFee(deal, feeId, () => changed), chosen, undo: null };
  return feeChange(deal, fee, changed, { kind: "chain", feeId, side, k, ...(caseId ? { caseId } : {}) }, chosen);
}

/**
 * The deal after a drop or a knob (`LiftResult`), kept for the undo where it took something the person gave (`kept`, the fee it changed and
 * its words); a plain change otherwise.
 */
export function liftKept(deal: FeeDeal, r: LiftResult, chosen: string | null): MaybeUndoable {
  const before = r.kept && deal.fees.find((f) => f.id === r.kept!.feeId);
  const after = r.kept && r.deal.fees.find((f) => f.id === r.kept!.feeId);
  if (!r.kept || !before || !after) return { deal: r.deal, chosen, undo: null };
  return { deal: r.deal, chosen, undo: { what: { kind: "said", feeId: r.kept.feeId, words: r.kept.words }, dealId: deal.id, before, after, chosenBefore: chosen, chosenAfter: chosen } };
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

/** A fee as the builder adds it, nothing typed or filled in it: one price of the form it was added in, its figure blank. */
const blankFee = (f: Fee): boolean => f.name === undefined && !f.sale && sameContent(f.stages, newFee(f.kind, undefined, f.stages?.[0]?.price.form).stages);

/**
 * The deal of another kind (`setKind`), kept for the undo where a fee it takes away holds anything typed or filled; silent where every fee
 * it takes away is blank, or none is. A chosen fee taken away hands the choice to the first fee left.
 */
export function setKindKept(deal: FeeDeal, kind: DealKind, bar: DataBar | null, chosen: string | null): Omit<MaybeUndoable, "undo"> & { undo: KindUndo | null } {
  const next = setKind(deal, kind, bar);
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
    case "chain":
      return copy.panel.change.removed;
    case "case":
      return copy.cases.caseRemoved;
    case "said":
      return u.what.words;
    case "form":
      return formWords(u);
    case "by": {
      // what the line says follows what the change did, naming the thing as its menu did: the cases merged (from how many to how many),
      // none merged, or the fee left with one case's price, the person's track's or the first case's
      const after = u.after;
      const words = copy.cases.byRemoved;
      const b = hasCases(u.before) ? u.before.by[u.what.t] : undefined;
      const thing = b ? thingName(u.before.kind, b) : "";
      const fill = (s: string) => s.replace("{thing}", thing);
      if (!after || !hasCases(after)) return fill(hasCases(u.before) && ownKept(u.before, u.what.t) ? words.slimOwn : words.slim);
      const from = hasCases(u.before) ? u.before.cases.length : 1;
      return from > after.cases.length ? fill(words.merged).replace("{from}", String(from)).replace("{to}", String(after.cases.length)) : fill(words.kept);
    }
    case "fill":
      return `${copy.builder.filled(houseName(u.what.house, data) ?? "")}.`;
    case "remove":
      return `${copy.builder.removed}${names(u.before)}.`;
  }
}

/** Each part a change of form names when it leaves it behind (`PARTS[id].lost`), by its words. */
const LOST_WORDS: Readonly<Record<LostPart, string>> = copy.cases.formChanged.parts;

/**
 * The words of a price put in another form: that it changed, and the bounds, the percent maximum and the flat price it left behind, by
 * name, where it left any.
 */
function formWords(u: Undo): string {
  const w = copy.cases.formChanged;
  const { caseId, k } = u.what.kind === "form" ? u.what : { caseId: undefined, k: 0 };
  const before = pricedOf(u.before, caseId);
  const after = u.after ? pricesOn(u.after, "buy", caseId)[k]!.price : null;
  const lost = lostParts(before.stages[k]!.price, after, before).map((id) => LOST_WORDS[id]);
  if (lost.length === 0) return w.plain;
  const list = lost.length === 1 ? lost[0]! : `${lost.slice(0, -1).join(", ")} ${w.and}${lost.at(-1)!}`;
  return w.lost.replace("{parts}", list).replace("{verb}", lost.length === 1 ? w.one : w.many);
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
