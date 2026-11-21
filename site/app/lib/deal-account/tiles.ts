// The popup's three tiles for a deal on the plan: what the deal leaves at the end on the fund the plan line names (F-128), its place in
// the account list, and, for a deal filled from a house's list, what it leaves less what that house's own row leaves on the same fund. The
// place is the list's own order: every account at its cheapest way among the funds of the pair's kind, the deal at its own cheapest, so the
// tile always says where the deal's row stands. Pure: the page's view and the deal's runs.
import { kindOf, type DealOnPlan, type FundWay, type InvestView, type WayPrice } from "../invest";
import { isGroupProvider } from "../group-pick";
import { stretchOf } from "../stretch";
import type { Missing } from "./plan";

export interface DealTiles {
  /** What the deal leaves on the fund, today's shekels; null where it has no price there. */
  left: number | null;
  /** What it lacks, where it has no price for what it lacks (`DealOnPlan`'s reason). */
  missing: Missing | null;
  /** Its place in the account list, by what each account leaves at its cheapest, and of how many with it; null where it ranks no fund. */
  place: { k: number; of: number } | null;
  /** What it leaves less what the house it was filled from leaves on the same fund; null where it was filled from none or either has no price. */
  diff: number | null;
  /** What that house's own row leaves on the fund, where `diff` has a value. */
  house: WayPrice | null;
}

/**
 * The funds the account list ranks its accounts on (`PairLists`): on an index of hedged and unhedged funds with the dollar's range, those of
 * the pair's fund's kind; else every fund.
 */
export function listFunds(funds: readonly FundWay[], pickFund: string, kinds: boolean): FundWay[] {
  const fund = funds.find((f) => f.rec.id === pickFund);
  const mine = fund ? kindOf(fund.rec) : "unhedged";
  return kinds ? funds.filter((f) => kindOf(f.rec) === mine) : [...funds];
}

/**
 * The tiles of deal account `providerId` from its runs on the list's funds (`got`), read on fund `fundId`: every other account of the list
 * at its cheapest way (`stretchOf`), the deal's own row on the page left out, since the popup's runs are the deal as it is now.
 */
export function dealTiles(view: InvestView, got: ReadonlyMap<string, DealOnPlan>, providerId: string, houseId: string | null, fundId: string, funds: readonly FundWay[]): DealTiles {
  const at = got.get(fundId) ?? null;
  const ok = at?.kind === "ok" ? at : null;
  const missing = at?.kind === "fail" && "missing" in at.reason ? at.reason.missing : null;
  const own = funds.flatMap((f) => {
    const g = got.get(f.rec.id);
    return g?.kind === "ok" ? [g.valueN] : [];
  });
  const others = view.providers.filter((p) => p.id !== providerId && !isGroupProvider(p)).flatMap((p) => {
    const s = stretchOf(funds, p.id);
    return s ? [s.best] : [];
  });
  const best = own.length ? Math.max(...own) : null;
  const place = best === null ? null : { k: 1 + others.filter((v) => v > best).length, of: others.length + 1 };
  const house = houseId ? view.houses.find((h) => h.provider.id === houseId)?.entries.find((e) => e.fund.rec.id === fundId)?.price : null;
  const priced = ok && house && !house.open ? house : null;
  return { left: ok ? ok.valueN : null, missing, place, diff: ok && priced ? ok.valueN - priced.valueN : null, house: priced };
}
