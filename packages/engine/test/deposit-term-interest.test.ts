// F-21: a bank deposit's interest over its term from the annual nominal rate the bank publishes (BANK-50, the disclosure rules'
// Schedule A). A term under a year pays once, at maturity, rate × days/365: the days the table prints, or 365/12 a month (the method's
// convention). A one-year term pays the rate. A term over a year compounds at the run's rate by the times a year the record gives, read
// from its printed nominal and effective pair or from its words; where it gives neither the figure is unknown (BANK OQ21). Interest paid
// out during the term does not compound and is taxed in the month it is paid. Values worked by hand.
import { describe, expect, it } from "vitest";
import { currentAccountMonthlyRate, depositInterest, effectiveAnnualOf, NotEvaluatedError, periodsFromPrinted, runDeposit, type DepositInput } from "../src/index.ts";
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

  it("compounds a term over a year at the times a year the record gives, and gives no figure where it gives none (BANK OQ21)", () => {
    // Leumi's 503/3 prints 1.50% and "ריבית מתואמת" 1.50%: an equal pair is m = 1, so 10,000 for three years is 10,000 × (1.015³ − 1) = 456.78
    const leumi = { printed: { nominal: 0.015, effective: 0.015 } };
    expect(periodsFromPrinted(0.015, 0.015)).toBe(1);
    expect(depositInterest(10_000, 0.015, 36, 36, { calc: leumi })!).toBeCloseTo(456.78375, 5);
    // Yahav's "בריבית דריבית חודשית": m = 12, so 2.2% is (1 + 0.022/12)^12 − 1 = 2.2203% a year
    expect(effectiveAnnualOf(0.022, { periodsPerYear: 12 })!).toBeCloseTo(Math.pow(1 + 0.022 / 12, 12) - 1, 12);
    expect(depositInterest(10_000, 0.022, 24, 24, { calc: { periodsPerYear: 12 } })!).toBeCloseTo(10_000 * (Math.pow(1 + 0.022 / 12, 24) - 1), 6);
    // no printed effective rate and no printed compounding: unknown
    expect(depositInterest(10_000, 0.02, 24)).toBeNull();
    expect(effectiveAnnualOf(0.02, undefined)).toBeNull();
    // five months into a three-year deposit at m = 1: 10,000 × (1.015^(5/12) − 1)
    expect(depositInterest(10_000, 0.015, 5, 36, { calc: leumi })!).toBeCloseTo(10_000 * (Math.pow(1.015, 5 / 12) - 1), 9);
  });

  it("reads m from a printed pair at the two decimals the bank prints, the fewest calculations a year that give it", () => {
    // 2.00% beside 2.02%: m = 1 gives 2.00%, m = 2 2.01%, m = 3 2.0134%, m = 4 (1.005)⁴ − 1 = 2.01505%, which prints 2.02%
    expect(periodsFromPrinted(0.02, 0.0202)).toBe(4);
    // an effective rate under the nominal one, or above what any m up to 365 gives, reads no m
    expect(periodsFromPrinted(0.015, 0.0148)).toBeNull();
    expect(periodsFromPrinted(0.02, 0.021)).toBeNull();
    expect(depositInterest(10_000, 0.015, 36, 36, { calc: { printed: { nominal: 0.015, effective: 0.0148 } } })).toBeNull();
  });

  it("applies the record's m to the run's own rate, not the printed effective rate, when the rate entered differs from the printed one", () => {
    // the record prints 1.50% and 1.50% (m = 1); the person enters 3%: 10,000 × (1.03³ − 1) = 927.27, not the printed rate's 456.78
    const leumi = { printed: { nominal: 0.015, effective: 0.015 } };
    expect(effectiveAnnualOf(0.03, leumi)).toBeCloseTo(0.03, 12);
    expect(depositInterest(10_000, 0.03, 36, 36, { calc: leumi })!).toBeCloseTo(927.27, 9);
    // 2.00% beside 2.02% is m = 4: at 3% the year pays (1 + 0.03/4)⁴ − 1 = 3.0339%
    expect(effectiveAnnualOf(0.03, { printed: { nominal: 0.02, effective: 0.0202 } })!).toBeCloseTo(Math.pow(1.0075, 4) - 1, 12);
    const input: DepositInput = { goal: { amountNow: 10_000, monthly: 0, months: 36 }, market: { inflation: 0 }, deposit: { rate: 0.03, termMonths: 36, linkage: "unlinked", interestCalc: leumi }, profile: {} };
    expect(runDeposit(input, ctx).detail.interest).toBeCloseTo(927.27, 6);
  });

  it("does not compound interest paid out during the term (BANK-50)", () => {
    // two years at 2%, interest paid to the current account as it falls due: 10,000 × 0.02 × 2 = 400, whatever the record's compounding
    expect(depositInterest(10_000, 0.02, 24, 24, { paidOut: true })).toBeCloseTo(400, 9);
    expect(depositInterest(10_000, 0.02, 24, 24, { paidOut: true, calc: { printed: { nominal: 0.02, effective: 0.0202 } } })).toBeCloseTo(400, 9);
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
    // 2.00% beside a printed 2.02% is m = 4: 10,000 × ((1.005)⁸ − 1) = 407.07
    const r = runDeposit({ ...input, deposit: { ...input.deposit, interestCalc: { printed: { nominal: 0.02, effective: 0.0202 } } } }, ctx);
    expect(r.detail.interest).toBeCloseTo(10_000 * (Math.pow(1.005, 8) - 1), 6);
    // interest paid out runs without it, and does not compound
    const paid = runDeposit({ ...input, deposit: { ...input.deposit, interestPaidOut: true } }, ctx);
    expect(paid.detail.interest).toBeCloseTo(400, 6);
  });

  it("taxes interest paid out in the month it is paid, so each tax year carries its own months' interest", () => {
    // 100,000 for two years at 2%, interest paid every month, from July: 1,000 in the first tax year (6 months), 2,000 in the second,
    // 1,000 in the third.
    const input: DepositInput = {
      goal: { amountNow: 100_000, monthly: 0, months: 24, firstMonth: 7 },
      market: { inflation: 0 },
      deposit: { rate: 0.02, termMonths: 24, linkage: "unlinked", interestPaidOut: true },
      profile: {},
    };
    const r = runDeposit(input, ctx);
    expect(r.detail.interest).toBeCloseTo(4_000, 6);
    // the same 15% on the same 4,000, withheld as it is paid, and the 3,400 after tax comes back with the principal
    expect(r.taxDuring).toBeCloseTo(600, 6);
    expect(r.nominal).toBeCloseTo(103_400, 6);
    // at the end of the first tax year (month 6, December) the tax on its 1,000 is withheld, 150, where at maturity it would be none yet;
    // the value holds the 850 paid out after tax
    const december = r.series.find((p) => p.month === 6)!;
    expect(december.taxDuring).toBeCloseTo(150, 6);
    expect(december.balance).toBeCloseTo(100_850, 6);
    expect(r.series.find((p) => p.month === 18)!.taxDuring).toBeCloseTo(450, 6);
  });
});

describe("F-26 the current account's monthly rate", () => {
  it("compounds at the bank's printed crediting, else at F-07's convention", () => {
    // Discount credits "בכל סוף רבעון": 3% a year is (1 + 0.03/4)^(4/12) − 1 a month
    expect(currentAccountMonthlyRate(0.03, { periodsPerYear: 4 })).toBeCloseTo(Math.pow(1.0075, 1 / 3) - 1, 12);
    expect(currentAccountMonthlyRate(0.03, undefined)).toBeCloseTo(Math.pow(1.03, 1 / 12) - 1, 12);
  });
});

describe("F-21 at a rate quoted as effective (the unit pct_per_year_effective)", () => {
  it("compounds the effective rate over any term, F-07's month, and leaves interest paid out at it unknown", () => {
    // 60,000 for one month at 3.2% effective: 60,000 × (1.032^(1/12) − 1) = 157.73, where 3.2% nominal pays 160
    expect(depositInterest(60_000, 0.032, 1, 1, { basis: "effective" })!).toBeCloseTo(60_000 * (Math.pow(1.032, 1 / 12) - 1), 9);
    expect(depositInterest(60_000, 0.032, 1)).toBeCloseTo(160, 9);
    // the term counts the days the table prints: 90 days earn 1.032^(90/365) − 1, and a term printed in months only, its months
    expect(depositInterest(10_000, 0.032, 3, 3, { basis: "effective", termDays: 90 })!).toBeCloseTo(10_000 * (Math.pow(1.032, 90 / 365) - 1), 9);
    expect(depositInterest(10_000, 0.032, 2, 3, { basis: "effective", termDays: 90 })!).toBeCloseTo(10_000 * (Math.pow(1.032, 60 / 365) - 1), 9);
    expect(depositInterest(10_000, 0.032, 3, 3, { basis: "effective" })!).toBeCloseTo(10_000 * (Math.pow(1.032, 3 / 12) - 1), 9);
    expect(depositInterest(10_000, 0.032, 24, 24, { basis: "effective" })!).toBeCloseTo(10_000 * (Math.pow(1.032, 2) - 1), 9);
    expect(depositInterest(10_000, 0.032, 1, 1, { basis: "effective", paidOut: true })).toBeNull();
  });

  it("stops a run that pays interest out at a rate quoted as effective, on the method's gap (G-37)", () => {
    const input: DepositInput = { goal: { amountNow: 10_000, monthly: 0, months: 12 }, market: { inflation: 0 }, deposit: { rate: 0.032, rateBasis: "effective", termMonths: 12, linkage: "unlinked", interestPaidOut: true }, profile: {} };
    expect(() => runDeposit(input, ctx)).toThrow(/G-37/);
  });
});
