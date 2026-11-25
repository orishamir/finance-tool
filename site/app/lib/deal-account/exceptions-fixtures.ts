// For the deal tests (plan.test.ts, move.test.ts): F-128's two stated exceptions, where a deal filled from a house's whole price list and
// left as filled leaves another amount than the house's own row on the same fund. Each is proven by its cause: the house's record with the
// cause taken out prices the row on the deal's own terms, and there the deal and the row leave the same on every fund. No Hebrew.
import { STANDING_CONVERSION_BAND, STANDING_ORDER_BAND } from "@finance-tool/engine";
import type { FundWay } from "../invest";
import type { BundleSnapshot, IndicesBundle } from "../providers";
import { hasCases, type FeeDeal } from "../fee-deal/model";
import type { DealKind } from "../fee-deal/kinds";
import { lineValueOf } from "./bundle";
import { planRead } from "./plan";

/**
 * (1) A row that buys each month's purchase of a fund bought abroad on the house's recurring plan, by amount and at the plan's conversion
 * (F-12, F-13's standing lines, F-109's `by_amount` entry for the plan: Interactive Israel). A deal names no plan a purchase is placed by:
 * it converts at the regular price and buys whole units. Taken out: the record's standing lines, so the row converts each purchase at the
 * regular price and, with no plan's conversion to buy by amount on, buys whole units (`wholeUnitsAt`), as the deal does.
 */
const STANDING_BANDS: readonly string[] = [STANDING_CONVERSION_BAND, STANDING_ORDER_BAND];

/**
 * (2) A list that prints more than one track for an exchange abroad: the row reads each and takes the one that leaves the most on the plan
 * (F-63: Interactive Brokers' Fixed and Tiered), the deal reads the track it keeps (its own pick, else the first). Taken out: the record's
 * trade lines of every track the deal does not keep.
 */
function tracksOf(deal: FeeDeal, house: BundleSnapshot, kinds: readonly DealKind[], today: string): { kept: string; others: string[] } | null {
  const trade = deal.fees.find((f) => f.kind === "trade");
  const by = trade && hasCases(trade) ? trade.by.find((b) => b.kind === "track") : undefined;
  if (!by || !("values" in by)) return null;
  const run = { instrumentClass: "foreign_securities", listing: "us" as const, currency: "USD" };
  const kept = planRead(deal, run, { kinds, today, lineValue: lineValueOf(house) }).picks.find((p) => p.by === "track")?.is;
  return kept ? { kept, others: by.values.filter((v) => v !== kept) } : null;
}

/** A house's record with both causes taken out, for the deal `deal` filled from it: what the row reads on the deal's own terms. */
function onDealTerms(house: BundleSnapshot, deal: FeeDeal, kinds: readonly DealKind[], today: string): BundleSnapshot {
  const tracks = tracksOf(deal, house, kinds, today);
  const otherTrack = (band: string | null) => !!band && !!tracks && tracks.others.some((t) => band.includes(t));
  // a standing line set aside from ranking (D41) is one no row reads
  const lines = house.lines.filter((l) => !(l.band && STANDING_BANDS.includes(l.band) && l.not_ranked === undefined) && !(l.base === "trade" && otherTrack(l.band)));
  return lines.length === house.lines.length ? house : { ...house, lines };
}

/**
 * The bundle with each house a deal of `deals` was filled from read on that deal's terms (`onDealTerms`), and the ids of the houses whose
 * record that changes: the only houses on which a deal may leave another amount than the row in the bundle as it is.
 */
export function onDealsTerms(bundle: IndicesBundle, deals: readonly { house: string; deal: FeeDeal }[], kinds: readonly DealKind[]): { bundle: IndicesBundle; changed: Set<string> } {
  const changed = new Set<string>();
  const snapshots = bundle.snapshots.map((s) => {
    const d = deals.find((x) => x.house === s.id);
    if (!d) return s;
    const out = onDealTerms(s, d.deal, kinds, bundle.today);
    if (out !== s) changed.add(s.id);
    return out;
  });
  return { bundle: { ...bundle, snapshots }, changed };
}

/** What account `id` leaves on fund `f`: after tax; null where it has no price. */
export function leftOn(f: FundWay, id: string): number | null {
  const at = f.byHouse[id];
  return at && "valueN" in at ? at.valueN : null;
}
