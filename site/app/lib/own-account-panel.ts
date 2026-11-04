// The account panel's own logic that is not drawing (founder, 2026-11-04): the draft it starts from, the starting point a draft is on, and the
// stretches of the plan the year strip shows. Pure: nothing here prices anything (own-account.ts and own-account-view.ts do).
import type { FeesSnapshot } from "@finance-tool/schema";
import { brokerDraftOf, type BrokerDraft, type CustomBroker } from "./custom-entries";
import { baseOf, startingPointsOf, untilMonthsOf, type StartingPoint } from "./own-account";
import type { FeeLayers, FeeType } from "./own-account-view";

/** The draft of an account started from a house's price list or from one of its groups: nothing typed, the whole plan. */
export function startDraft(house: FeesSnapshot, point: StartingPoint, name: string): BrokerDraft {
  return { ...brokerDraftOf(null), name, base: baseOf(house, point), untilYears: null };
}

/** The starting point the account stands on: the group of its base by name, else the price list. */
export function pointOfBroker(points: readonly StartingPoint[], base: CustomBroker["base"] | BrokerDraft["base"]): StartingPoint {
  const group = base?.group;
  return (group && points.find((p) => p.nameHe === group.name)) || points[0]!;
}

export { startingPointsOf };

/** What holds in one stretch of the plan, for `PeriodStrip`: all of the group's prices, some of them (named), or the price list alone. */
export interface Stretch {
  fromYears: number;
  toYears: number;
  kind: "all" | "some" | "none";
  /** The fee types still at the group's price, when `some`. */
  fees: FeeType[];
}

/**
 * The stretches of a plan of `years` years for an account on a group's prices: each applied price holds to its own end (`forMonths`) and no
 * longer than the stay (`untilYears`), whichever is first (F-101). Null when no price of the group is applied (nothing to show), and one stretch
 * when none of them ends within the plan.
 */
export function stretchesOf(layers: readonly FeeLayers[], untilYears: number | null | undefined, years: number): Stretch[] | null {
  const horizon = Math.round(years * 12);
  const stay = untilMonthsOf({ untilYears });
  const parts = layers.flatMap((l) => (l.group?.applied ? [{ fee: l.fee, end: Math.min(l.group.forMonths ?? Infinity, stay ?? Infinity) }] : []));
  if (parts.length === 0 || horizon <= 0) return null;
  const cuts = [...new Set(parts.map((p) => p.end).filter((e) => e > 0 && e < horizon))].sort((a, b) => a - b);
  const bounds = [0, ...cuts, horizon];
  const out: Stretch[] = [];
  for (let i = 0; i + 1 < bounds.length; i++) {
    const [from, to] = [bounds[i]!, bounds[i + 1]!];
    const alive = parts.filter((p) => p.end >= to);
    out.push({ fromYears: from / 12, toYears: to / 12, kind: alive.length === parts.length ? "all" : alive.length === 0 ? "none" : "some", fees: alive.map((p) => p.fee) });
  }
  return out;
}
