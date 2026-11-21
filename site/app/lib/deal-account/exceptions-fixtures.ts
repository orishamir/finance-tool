// For the deal tests (plan.test.ts, move.test.ts): F-128's three stated exceptions, where a deal filled from a house's whole price list and
// left as filled leaves another amount than the house's own row on the same fund, each with which way the deal's amount goes. Every other
// fund leaves the same. No Hebrew.
import type { feesData } from "../fees.server";
import type { FundWay } from "../invest";
import { isConversion } from "../fee-deal/shapes";

/**
 * (1) A house whose row buys each month's purchase of a fund bought abroad on its recurring plan (F-12, F-13's standing lines). A deal
 * names no plan a purchase is placed by, so it prices that purchase at the regular price, and leaves no more than the row.
 */
const RECURRING_ABROAD = new Set(["interactive-israel", "interactive-brokers"]);

/**
 * (2) A house whose list prints more than one track for an exchange abroad: its row takes the track that leaves the most on each plan
 * (F-63: Interactive Brokers' Fixed and Tiered), where the deal keeps the person's pick of the track, and leaves no more than the row.
 */
const TRACKS = new Set(["interactive-brokers"]);

/**
 * (3) Whether house `id`'s list prices a conversion by its size (`size_tiers` on its conversion line, the deal's conversion read by the
 * size of each conversion): its row prices every conversion at one step (F-13, the steps left out under D56), where the deal reads each
 * step (F-115). The deal pays no more on any conversion, so it leaves more than the row; in whole units the cash a cheaper conversion leaves
 * can move the month a unit is bought, and with it a commission, so it may leave a little less, within `BY_SIZE_LESS` of the row.
 */
export function convertsBySize(houses: ReturnType<typeof feesData>["houses"], id: string): boolean {
  return (houses.find((h) => h.id === id)?.fees ?? []).some((f) => isConversion(f.kind) && "by" in f && !!f.by?.some((b) => b.kind === "actionSize"));
}

/** (3) The most a deal at a house that prices a conversion by its size leaves below the row, as a share of the row. */
const BY_SIZE_LESS = 0.002;

export type StatedException = "recurring-abroad" | "track" | "by-size";

/** What a house's row and its deal leave on one fund, on a plan that buys each month or not: null where one has no price there. */
export interface Compared {
  abroad: boolean;
  monthly: boolean;
  row: number | null;
  deal: number | null;
}

/**
 * The stated exceptions that explain a fund on which a deal from house `id` leaves another amount than the row, each that applies there and
 * holds its direction; none where no stated exception explains it.
 */
export function statedExceptions(houses: ReturnType<typeof feesData>["houses"], id: string, r: Compared): StatedException[] {
  if (r.row === null || r.deal === null || !r.abroad) return [];
  const out: StatedException[] = [];
  if (RECURRING_ABROAD.has(id) && r.monthly && r.deal <= r.row + 0.5) out.push("recurring-abroad");
  if (TRACKS.has(id) && r.deal <= r.row + 0.5) out.push("track");
  if (convertsBySize(houses, id) && r.deal >= r.row * (1 - BY_SIZE_LESS)) out.push("by-size");
  return out;
}

/** What account `id` leaves on fund `f`: after tax, or before it on a fund an open rule leaves untaxed (F-118); null where it has no price. */
export function leftOn(f: FundWay, id: string): number | null {
  const at = f.byHouse[id];
  const n = at && "valueN" in at ? at.valueN : f.beforeTax?.byHouse[id]?.leftN;
  return n === undefined ? null : n;
}
