// The popup's three tiles for a deal on the plan: what the deal leaves at the end on the fund the plan line names (F-128), its place in
// the account list, and, for a deal filled from a house's list, what it leaves less what that house's own row leaves on the same fund. The
// place is the list's own: every account at its cheapest way among the funds of the pair's kind (`stretchOf`), in the list's order, most
// first and equal figures by name, so the tile always says where the deal's row stands. Pure: the page's view and the deal's runs.
import { kindOf, type DealOnPlan, type FundWay, type InvestView, type WayPrice } from "../invest";
import { stretchOf } from "../stretch";
import type { Missing } from "./plan";

export interface DealTiles {
  /** What the deal leaves on the fund, today's shekels; null where it has no price there. */
  left: number | null;
  /** What it lacks, where it has no price for what it lacks (`DealOnPlan`'s reason). */
  missing: Missing | null;
  /** Its row's place in the account list, of how many ranked rows with it (`listPlace`); null where it ranks no fund. */
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
 * A row's place in the account list (`PairLists`' ranked rows): the list sorts by what each account leaves at its cheapest, most first, and
 * equal figures by name; the place is one more than the rows that stand above it.
 */
export function listPlace(rows: readonly { best: number; name: string }[], mine: { best: number; name: string }): number {
  return 1 + rows.filter((r) => r.best > mine.best || (r.best === mine.best && r.name.localeCompare(mine.name, "he") < 0)).length;
}

/**
 * The tiles of deal account `providerId`, named `name` in the list, from its runs on the list's funds (`got`), read on fund `fundId`: every
 * other account of the list at its cheapest ranked way (`stretchOf`), the deal's own row on the page left out, since the popup's runs are
 * the deal as it is now.
 */
export function dealTiles(view: InvestView, got: ReadonlyMap<string, DealOnPlan>, providerId: string, name: string, houseId: string | null, fundId: string, funds: readonly FundWay[]): DealTiles {
  const at = got.get(fundId) ?? null;
  const ok = at?.kind === "ok" ? at : null;
  const missing = at?.kind === "fail" && "missing" in at.reason ? at.reason.missing : null;
  const own = funds.flatMap((f) => {
    const g = got.get(f.rec.id);
    return g?.kind === "ok" ? [g.valueN] : [];
  });
  const others = view.providers.filter((p) => p.id !== providerId).flatMap((p) => {
    const s = stretchOf(funds, p.id);
    return s ? [{ best: s.best, name: p.short }] : [];
  });
  const best = own.length ? Math.max(...own) : null;
  const place = best === null ? null : { k: listPlace(others, { best, name: view.providers.find((p) => p.id === providerId)?.short ?? name }), of: others.length + 1 };
  const house = houseId ? view.houses.find((h) => h.provider.id === houseId)?.entries.find((e) => e.fund.rec.id === fundId)?.price : null;
  const priced = ok && house ? house : null;
  return { left: ok ? ok.valueN : null, missing, place, diff: ok && priced ? ok.valueN - priced.valueN : null, house: priced };
}
