// F-132: a fund's 12-month trailing distribution yield, worked out from the manager's own payments and NAV where it publishes none (A-10).
import { assertNever, type DistributionPayment } from "@finance-tool/schema";

/** The first day after the 12 months that end on `asOf` (`YYYY-MM-DD`): the same day a year before, so the window holds 12 months. */
function yearBefore(asOf: string): string {
  return `${Number(asOf.slice(0, 4)) - 1}${asOf.slice(4)}`;
}

/**
 * F-132 The 12-month trailing yield, in percent: the income a share paid in the 12 months that end on `asOf`, over the NAV a share `nav`
 * plus the capital gains a share paid in those months, × 100. A payment counts when its ex-dividend date falls after the same day a year
 * before `asOf` and on or before `asOf`. `nav` is the last NAV on or before `asOf`; the payments and the NAV are in one currency.
 */
export function trailingDistributionYield(payments: readonly Pick<DistributionPayment, "kind" | "ex_date" | "per_share">[], nav: number, asOf: string): number {
  const from = yearBefore(asOf);
  let income = 0;
  let capitalGains = 0;
  for (const p of payments) {
    if (p.ex_date <= from || p.ex_date > asOf) continue;
    switch (p.kind) {
      case "income":
        income += p.per_share;
        break;
      case "capital_gain":
        capitalGains += p.per_share;
        break;
      default:
        return assertNever(p.kind);
    }
  }
  return (income / (nav + capitalGains)) * 100;
}
