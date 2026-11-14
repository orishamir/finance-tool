// The changes the fee page makes to a deal as a whole, each a pure function from a deal to the next: a fee added, replaced or taken away,
// the deal's product and name, and the reading's picks (F-114). These alone ask the offer (offers/offer.ts), for the fees a product is
// offered; the edits of a fee's prices, stages and cases are in price.ts, stage.ts and case.ts.
import { newFee, type Fee, type FeeDeal, type ReadPick } from "../model";
import type { DealKind } from "../kinds";
import { type FeeKindId, type FormId } from "../shapes";
import { feeOffered, type DataBar } from "../offers/offer";

/** The deal with one fee replaced by `fn` of it. */
export const updateFee = (deal: FeeDeal, feeId: string, fn: (f: Fee) => Fee): FeeDeal => ({ ...deal, fees: deal.fees.map((f) => (f.id === feeId ? fn(f) : f)) });

/** The deal with a new fee of a kind at the end, its price in the form given (the first its product's fee is offered in, `Offer.usual`). */
export function addFee(deal: FeeDeal, kind: FeeKindId, form?: FormId): { deal: FeeDeal; fee: Fee } {
  const fee = newFee(kind, undefined, form);
  return { deal: { ...deal, fees: [...deal.fees, fee] }, fee };
}

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

/** The deal read for `is` of the thing keyed `by` (`pickKey`); `null` takes the pick away, and the thing starts as F-114 says. */
export function setPick(deal: FeeDeal, by: string, is: string | null): FeeDeal {
  const { readFor: _r, ...rest } = deal;
  const picks: ReadPick[] = [...(deal.readFor ?? []).filter((p) => p.by !== by), ...(is === null ? [] : [{ by, is }])];
  return picks.length ? { ...rest, readFor: picks } : rest;
}
