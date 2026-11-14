// F-21: a bank deposit's interest over its term from the annual nominal rate the bank publishes (BANK-50, the disclosure rules'
// Schedule A): a term under a year pays once, at maturity, rate × days/365 (a month counted as 365/12 days); a term of a year or more
// is calculated once a year. Values worked by hand.
import { describe, expect, it } from "vitest";
import { depositInterest, runDeposit, type DepositInput } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

describe("F-21 a deposit's interest over its term", () => {
  it("pays rate × days/365 on a term under a year", () => {
    // 10,000 at 3.5% for six months: 10,000 × 0.035 × 6/12 = 175, where yearly compounding gave 173.04
    expect(depositInterest(10_000, 0.035, 6)).toBeCloseTo(175, 9);
    // 100,000 for three months: 875 (91.25 days); 91 days would be 872.60
    expect(depositInterest(100_000, 0.035, 3)).toBeCloseTo(875, 9);
    // a day and a week, as the deposits page counts them (12/365 and 84/365 of a month): 365 days a year
    expect(depositInterest(100_000, 0.0365, 12 / 365)).toBeCloseTo(10, 9);
    expect(depositInterest(100_000, 0.0365, 84 / 365)).toBeCloseTo(70, 9);
  });

  it("is the rate itself over one year, and calculated yearly on a longer term", () => {
    expect(depositInterest(10_000, 0.035, 12)).toBeCloseTo(350, 9);
    // two years, interest calculated once a year (m = 1): 10,000 × (1.035² − 1) = 712.25
    expect(depositInterest(10_000, 0.035, 24)).toBeCloseTo(712.25, 9);
  });

  it("prices a piece cut short by its own term: pro rata under a year, yearly over it", () => {
    // five months into a six-month deposit: 10,000 × 0.035 × 5/12
    expect(depositInterest(10_000, 0.035, 5, 6)).toBeCloseTo(145.833333, 5);
    // five months into a two-year deposit: 10,000 × (1.035^(5/12) − 1)
    expect(depositInterest(10_000, 0.035, 5, 24)).toBeCloseTo(10_000 * (Math.pow(1.035, 5 / 12) - 1), 9);
  });

  it("rolls a three-month deposit four times in a year at rate/4 each time", () => {
    const ctx = context(loadRules());
    const input: DepositInput = { goal: { amountNow: 10_000, monthly: 0, months: 12 }, market: { inflation: 0 }, deposit: { rate: 0.04, termMonths: 3, linkage: "unlinked" }, profile: {} };
    const r = runDeposit(input, ctx);
    // each quarter 1% before tax, 0.85% after the 15% withheld: 10,000 × 1.0085⁴
    expect(r.nominal).toBeCloseTo(10_000 * Math.pow(1.0085, 4), 6);
  });
});
