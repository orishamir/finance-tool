// The popup's three tiles for a deal on the plan (decision 4 of the deal-on-indices design): what the deal leaves at the end on the pair's
// fund (F-128), its place among the accounts by what each leaves at its cheapest (as the account list ranks them), and, for a deal filled
// from a house's list, what it leaves less what that house's own row leaves on the same fund. Pure: the page's view and the deal's run.
import type { DealOnPlan, InvestView } from "../invest";
import type { Missing } from "./plan";

export interface DealTiles {
  /** What the deal leaves on the fund, today's shekels; null where it has no price there. */
  left: number | null;
  /** What it lacks, where it has no price for what it lacks (`DealOnPlan`'s reason). */
  missing: Missing | null;
  /** Its place among the accounts that rank, by what each leaves at its cheapest, and of how many with it; null where it has no price. */
  place: { k: number; of: number } | null;
  /** What it leaves less what the house it was filled from leaves on the same fund; null where it was filled from none or either has no price. */
  diff: number | null;
}

/**
 * The tiles of deal account `providerId` (its run on the fund, `got`) on the page's view: every other account that ranks, at its cheapest
 * way (`HouseRow.best`), the deal's own row on the page left out, since the popup's run is the deal as it is now.
 */
export function dealTiles(view: InvestView, got: DealOnPlan | null, providerId: string, houseId: string | null, fundId: string): DealTiles {
  if (!got || got.kind === "fail") {
    const missing = got?.kind === "fail" && "missing" in got.reason ? got.reason.missing : null;
    return { left: null, missing, place: null, diff: null };
  }
  const others = view.houses.filter((h) => h.provider.id !== providerId).flatMap((h) => (h.best?.price && !h.best.price.open ? [h.best.price.valueN] : []));
  const k = 1 + others.filter((v) => v > got.valueN).length;
  const house = houseId ? view.houses.find((h) => h.provider.id === houseId)?.entries.find((e) => e.fund.rec.id === fundId)?.price : null;
  return { left: got.valueN, missing: null, place: { k, of: others.length + 1 }, diff: house && !house.open ? got.valueN - house.valueN : null };
}
