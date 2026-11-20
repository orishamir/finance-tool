// The changes the fee page makes to a deal as a whole, each a pure function from a deal to the next: a fee added, replaced or taken away,
// the deal's product and name, a fee duplicated, and the reading's picks (F-114). These alone ask the offer (offers/offer.ts), for the fees a product is
// offered; the edits of a fee's prices, stages and cases are in price.ts, stage.ts and case.ts.
import { hasCases, newFee, newFeeId, pickKey, thingValues, type Fee, type FeeDeal, type ReadPick } from "../model";
import { renameValue } from "./case";
import type { DealKind } from "../kinds";
import { feeRoom, PICKS_MAX } from "../limits";
import { type FeeKindId, type FormId } from "../shapes";
import { feeOffered, offerFor, type DataBar } from "../offers/offer";

/** The deal with one fee replaced by `fn` of it. */
export const updateFee = (deal: FeeDeal, feeId: string, fn: (f: Fee) => Fee): FeeDeal => ({ ...deal, fees: deal.fees.map((f) => (f.id === feeId ? fn(f) : f)) });

/**
 * The deal with fee `feeId` duplicated: a copy with all it holds (its prices, cases, sources and the list it came from) under a new id,
 * right after it in the deal and so beside it on the page (the same kind and group, and the same place among the person's own order,
 * `Rank`). Null where the deal has no such fee or holds as many fees as a deal may (`FEES_MAX`); a kind that stands alone (`feeAlone`) is
 * the page's to refuse.
 */
export function duplicateFee(deal: FeeDeal, feeId: string): { deal: FeeDeal; feeId: string } | null {
  const at = deal.fees.findIndex((f) => f.id === feeId);
  if (at < 0 || !feeRoom(deal)) return null;
  const copy: Fee = { ...structuredClone(deal.fees[at]!), id: newFeeId() };
  return { deal: { ...deal, fees: [...deal.fees.slice(0, at + 1), copy, ...deal.fees.slice(at + 1)] }, feeId: copy.id };
}

/**
 * The deal with a new fee of a kind at the end, its price in the form given (the first its product's fee is offered in, `Offer.usual`).
 * Null where the deal holds as many fees as a deal may (`FEES_MAX`).
 */
export function addFee(deal: FeeDeal, kind: FeeKindId, form?: FormId): { deal: FeeDeal; fee: Fee } | null {
  if (!feeRoom(deal)) return null;
  const fee = newFee(kind, undefined, form);
  return { deal: { ...deal, fees: [...deal.fees, fee] }, fee };
}

/** The deal with a new fee of a kind at the end, its price in the first form the deal's product (`product`) is offered it in. */
export const addOfferedFee = (deal: FeeDeal, product: DealKind | null, kind: FeeKindId): { deal: FeeDeal; fee: Fee } | null => addFee(deal, kind, offerFor(product, kind).usual ?? undefined);

/**
 * A deal of another kind: a fee the new kind is not offered (`feeOffered`: one it does not have, one the data bars, `bar`, or one the rule
 * table offers no form that charges, a provident account's deposit fee on a switch to a study fund) leaves it, and the fees it is offered
 * stay as typed, a fee of the person's own among them. Its template goes, with the provider kind the template gave: a
 * template belongs to one kind (a house's price list to the securities account, a track to its product). The reading's picks stay. The
 * same kind leaves the deal as it is.
 */
export function setKind(deal: FeeDeal, kind: DealKind, bar: DataBar | null = null): FeeDeal {
  if (deal.kind === kind.id) return deal;
  const { template: _template, provider: _provider, ...rest } = deal;
  const fees = deal.fees.filter((f) => feeOffered(kind, f.kind, bar));
  return { ...rest, kind: kind.id, fees };
}

export const setName = (deal: FeeDeal, name: string): FeeDeal => ({ ...deal, name });

/** A fee of the person's own with its name. */
export const setFeeName = <F extends Fee>(fee: F, name: string): F => ({ ...fee, name });


// ---------------------------------------------------------------- the reading's picks (F-114)

/**
 * Value `from` of thing `t` of fee `feeId` renamed `to` (`renameValue`), and the reading's pick of it renamed with it, where no fee names
 * `from` for that thing any more; unchanged where the fee does not rename it.
 */
export function renameValueIn(deal: FeeDeal, feeId: string, t: number, from: string, to: string): FeeDeal {
  const fee = deal.fees.find((f) => f.id === feeId);
  if (!fee || !hasCases(fee) || !fee.by[t]) return deal;
  const next = renameValue(fee, t, from, to);
  if (next === fee) return deal;
  const fees = deal.fees.map((f) => (f.id === feeId ? next : f));
  const key = pickKey(fee.by[t]!);
  const still = fees.some((f) => hasCases(f) && f.by.some((b, j) => pickKey(b) === key && thingValues(f, j).includes(from)));
  const readFor = still ? deal.readFor : deal.readFor?.map((p) => (p.by === key && p.is === from ? { ...p, is: to.trim() } : p));
  return { ...deal, fees, ...(readFor ? { readFor } : {}) };
}

/**
 * The deal read for `is` of the thing keyed `by` (`pickKey`); `null` takes the pick away, and the thing starts as F-114 says. A new pick
 * past `PICKS_MAX` leaves the deal as it is: the thing is read as F-114 starts it.
 */
export function setPick(deal: FeeDeal, by: string, is: string | null): FeeDeal {
  const { readFor: _r, ...rest } = deal;
  const picks: ReadPick[] = [...(deal.readFor ?? []).filter((p) => p.by !== by), ...(is === null ? [] : [{ by, is }])];
  if (picks.length > PICKS_MAX) return deal;
  return picks.length ? { ...rest, readFor: picks } : rest;
}
