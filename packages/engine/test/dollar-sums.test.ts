// F-12, F-13: a line's sum printed in the fund's currency stays in it and is charged at that currency's rate of the month the trade is made
// (A-03's path, F-04), not at the run's start rate. Expected figures worked by hand (comments): no return, fund cost or inflation; the dollar
// at 3.70 ₪ at the start.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { tradeCommission, withSumsIn, type Commission } from "../src/formulas/fees.ts";
import { runSecurities, type SecuritiesInput } from "../src/ledgers/securities.ts";
import { buildTariff, type WorkbenchInput } from "../src/providers/workbench.ts";
import { context } from "./golden/harness.ts";

const ctx = context();
const usd = 3.7;
const leumi = JSON.parse(readFileSync(new URL("../../../data/fees/leumi@2026-11-12.json", import.meta.url), "utf8"));
const wb: WorkbenchInput = {
  goal: { amountNow: 1_000, monthly: 0, months: 120 },
  market: { grossReturn: 0, inflation: 0 },
  fund: { kind: "foreign-fund", drag: {} },
  profile: {},
  instrumentClass: "foreign_securities",
  currency: { code: "USD", startRate: usd },
  fx: { USD: usd },
  theta: 0.005,
  providers: [],
  channel: "direct",
};
const line = buildTariff(wb, { snapshot: leumi, level: "list" }, leumi).tariff.buy as Commission;
// the line with each dollar sum fixed in shekels at the start rate, for comparison
const atStart = (c: Commission): Commission => ({ rate: c.rate, ...(c.min !== undefined ? { min: c.min * usd } : {}), ...(c.max !== undefined ? { max: c.max * usd } : {}) });
const run = (buy: Commission, fxChange: number) =>
  runSecurities({ market: { grossReturn: 0, inflation: 0, fxChange }, fund: { kind: "foreign-fund", drag: {} }, profile: {}, goal: wb.goal, tariff: { buy, sell: buy, currency: { code: "USD", startRate: usd } } } as SecuritiesInput, ctx);

describe("a dollar minimum read at the month's rate (F-12)", () => {
  it("Leumi's direct foreign line keeps its 24 $ minimum in dollars", () => {
    expect(line).toMatchObject({ rate: expect.closeTo(0.003, 12), min: 24, in: "instrument" });
  });

  it("with the dollar up 3% a year, the sale ten years on pays the minimum at that year's rate", () => {
    // the purchase now: 24 $ × 3.70 = 88.80 ₪ (0.3% of 1,000 ₪ is 3 ₪); the sale in month 120, the dollar at 3.70 × 1.03^10: 88.80 × 1.03^10
    // = 119.34 ₪ (0.3% of about 911 ₪ is under it). Read at the start rate, as a bound fixed for the run, the sale would pay 88.80 ₪
    const r = run(line, 0.03);
    expect(r.fees.trade).toBeCloseTo(88.8 + 88.8 * 1.03 ** 10, 6);
    expect(r.fees.trade - run(atStart(line), 0.03).fees.trade).toBeCloseTo(88.8 * (1.03 ** 10 - 1), 6);
  });

  it("with a steady dollar nothing changes: the same as the minimum in shekels at the start rate", () => {
    const steady = run(line, 0);
    expect(steady.fees.trade).toBeCloseTo(2 * 88.8, 9);
    expect(steady.nominal).toBeCloseTo(run(atStart(line), 0).nominal, 9);
  });
});

describe("a line with sums in two currencies, each read at its own rate (F-12, F-101)", () => {
  // a dollar line, 0.3% with a maximum of 100 $, under a minimum of 50 ₪ set in shekels (a group's or the person's)
  const two = withSumsIn({ rate: 0.003, min: 50, max: 100, in: "instrument" }, "nis", "min");

  it("marks only the sum set in shekels", () => {
    expect(two).toEqual({ rate: 0.003, min: 50, max: 100, in: "instrument", sumIn: { min: "nis" } });
    expect(withSumsIn(two, "instrument", "min")).toEqual({ rate: 0.003, min: 50, max: 100, in: "instrument" });
  });

  it("the shekel minimum holds whatever the dollar does, and the dollar maximum moves with it", () => {
    // 1,000 ₪: 0.3% is 3 ₪, the minimum 50 ₪ at 3.70 and at 4.40; 200,000 ₪: 600 ₪, the maximum 100 $ = 370 ₪, then 440 ₪
    expect(tradeCommission(two, 1_000, { fxRate: 3.7 })).toBeCloseTo(50, 9);
    expect(tradeCommission(two, 1_000, { fxRate: 4.4 })).toBeCloseTo(50, 9);
    expect(tradeCommission(two, 200_000, { fxRate: 3.7 })).toBeCloseTo(370, 9);
    expect(tradeCommission(two, 200_000, { fxRate: 4.4 })).toBeCloseTo(440, 9);
  });
});
