// F-21: a bank deposit's interest over its term from the annual nominal rate the bank publishes (BANK-50, the disclosure rules'
// Schedule A). A term under a year pays once, at maturity, rate × days/365: the days the table prints, or 365/12 a month (the method's
// convention). A one-year term pays the rate. A term over a year compounds at the effective rate the record gives, its printed effective
// rate or its printed times a year; where it gives none the figure is unknown (BANK OQ21). Interest paid out during the term does not
// compound. Values worked by hand.
import { describe, expect, it } from "vitest";
import { currentAccountMonthlyRate, depositInterest, effectiveAnnualOf, NotEvaluatedError, runDeposit, type DepositInput } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

const ctx = context(loadRules());

describe("F-21 a deposit's interest over its term", () => {
  it("pays rate × days/365 on a term under a year, by the days the table prints where it prints them", () => {
    // 10,000 at 3.5% for six months: 10,000 × 0.035 × 6/12 = 175, where yearly compounding gave 173.04
    expect(depositInterest(10_000, 0.035, 6)).toBeCloseTo(175, 9);
    // 100,000 for three months: 875 (91.25 days by the method's month); Yahav prints "(90 יום)": 100,000 × 0.035 × 90/365 = 863.01
    expect(depositInterest(100_000, 0.035, 3)).toBeCloseTo(875, 9);
    expect(depositInterest(100_000, 0.035, 3, 3, { termDays: 90 })!).toBeCloseTo(863.013699, 5);
    // a piece cut short at two of its three months: two thirds of the printed days
    expect(depositInterest(100_000, 0.035, 2, 3, { termDays: 90 })!).toBeCloseTo(100_000 * 0.035 * 60 / 365, 6);
    // a day and a week, as the deposits page counts them (12/365 and 84/365 of a month): 365 days a year
    expect(depositInterest(100_000, 0.0365, 12 / 365)).toBeCloseTo(10, 9);
    expect(depositInterest(100_000, 0.0365, 84 / 365)).toBeCloseTo(70, 9);
  });

  it("is the rate itself over one year", () => {
    expect(depositInterest(10_000, 0.035, 12)).toBeCloseTo(350, 9);
    expect(depositInterest(10_000, 0.035, 12, 12, { termDays: 365 })).toBeCloseTo(350, 9);
  });

  it("compounds a term over a year at the effective rate the record gives, and gives no figure where it gives none (BANK OQ21)", () => {
    // Mizrahi-Tefahot 166 prints 2.00% and an effective 2.02%: 10,000 for two years is 10,000 × (1.0202² − 1) = 408.08
    expect(depositInterest(10_000, 0.02, 24, 24, { calc: { effectiveAnnual: 0.0202 } })!).toBeCloseTo(408.0804, 6);
    // Yahav's "בריבית דריבית חודשית": m = 12, so 2.2% is (1 + 0.022/12)^12 − 1 = 2.2203% a year
    expect(effectiveAnnualOf(0.022, { periodsPerYear: 12 })!).toBeCloseTo(Math.pow(1 + 0.022 / 12, 12) - 1, 12);
    expect(depositInterest(10_000, 0.022, 24, 24, { calc: { periodsPerYear: 12 } })!).toBeCloseTo(10_000 * (Math.pow(1 + 0.022 / 12, 24) - 1), 6);
    // no printed effective rate and no printed compounding: unknown
    expect(depositInterest(10_000, 0.02, 24)).toBeNull();
    expect(effectiveAnnualOf(0.02, undefined)).toBeNull();
    // five months into a two-year deposit, at its effective rate: 10,000 × (1.0202^(5/12) − 1)
    expect(depositInterest(10_000, 0.02, 5, 24, { calc: { effectiveAnnual: 0.0202 } })!).toBeCloseTo(10_000 * (Math.pow(1.0202, 5 / 12) - 1), 9);
  });

  it("does not compound interest paid out during the term (BANK-50)", () => {
    // two years at 2%, interest paid to the current account as it falls due: 10,000 × 0.02 × 2 = 400, whatever the record's compounding
    expect(depositInterest(10_000, 0.02, 24, 24, { paidOut: true })).toBeCloseTo(400, 9);
    expect(depositInterest(10_000, 0.02, 24, 24, { paidOut: true, calc: { effectiveAnnual: 0.0202 } })).toBeCloseTo(400, 9);
    // under a year it is the same sum as interest at maturity
    expect(depositInterest(10_000, 0.02, 6, 6, { paidOut: true })).toBeCloseTo(depositInterest(10_000, 0.02, 6)!, 9);
  });

  it("rolls a three-month deposit four times in a year at rate/4 each time, or at its printed 90 days", () => {
    const input: DepositInput = { goal: { amountNow: 10_000, monthly: 0, months: 12 }, market: { inflation: 0 }, deposit: { rate: 0.04, termMonths: 3, linkage: "unlinked" }, profile: {} };
    // each quarter 1% before tax, 0.85% after the 15% withheld: 10,000 × 1.0085⁴
    expect(runDeposit(input, ctx).nominal).toBeCloseTo(10_000 * Math.pow(1.0085, 4), 6);
    const days = runDeposit({ ...input, deposit: { ...input.deposit, termDays: 90 } }, ctx);
    expect(days.nominal).toBeCloseTo(10_000 * Math.pow(1 + 0.04 * (90 / 365) * 0.85, 4), 6);
  });

  it("stops a run on a term over a year whose record says nothing of how interest is calculated, and runs it where it does", () => {
    const input: DepositInput = { goal: { amountNow: 10_000, monthly: 0, months: 24 }, market: { inflation: 0 }, deposit: { rate: 0.02, termMonths: 24, linkage: "unlinked" }, profile: {} };
    expect(() => runDeposit(input, ctx)).toThrow(NotEvaluatedError);
    const r = runDeposit({ ...input, deposit: { ...input.deposit, interestCalc: { effectiveAnnual: 0.0202 } } }, ctx);
    expect(r.detail.interest).toBeCloseTo(408.0804, 4);
    // interest paid out runs without it, and does not compound
    const paid = runDeposit({ ...input, deposit: { ...input.deposit, interestPaidOut: true } }, ctx);
    expect(paid.detail.interest).toBeCloseTo(400, 6);
  });
});

describe("F-26 the current account's monthly rate", () => {
  it("compounds at the bank's printed crediting, else at F-07's convention", () => {
    // Discount credits "בכל סוף רבעון": 3% a year is (1 + 0.03/4)^(4/12) − 1 a month
    expect(currentAccountMonthlyRate(0.03, { periodsPerYear: 4 })).toBeCloseTo(Math.pow(1.0075, 1 / 3) - 1, 12);
    expect(currentAccountMonthlyRate(0.03, undefined)).toBeCloseTo(Math.pow(1.03, 1 / 12) - 1, 12);
  });
});
