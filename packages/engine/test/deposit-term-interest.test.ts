// F-21: a bank deposit's interest over its term from the annual nominal rate the bank publishes (BANK-50, the disclosure rules'
// Schedule A). Where the record gives m, from its words or from its printed nominal and effective pair at the decimals the bank prints (every
// whole m and, for a deposit paid at maturity, m = 365/d), any term compounds at the run's rate by it; where the pair leaves the run's rate
// open, the figure is unknown (BANK OQ21). Where it gives none, the method reads a term under a year as paying once, at maturity,
// rate × days/365 (the days the table prints, or 365/12 a month), and a one-year term as paying the rate itself; a term over a year is
// unknown. Interest paid out during the term does not compound and is taxed in the month it is paid. Values worked by hand.
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

  it("is Schedule A at 365 days over one year: the rate itself where the record gives no m, (1 + i/m)^m − 1 where it does", () => {
    expect(depositInterest(10_000, 0.035, 12)).toBeCloseTo(350, 9);
    expect(depositInterest(10_000, 0.035, 12, 12, { termDays: 365 })).toBeCloseTo(350, 9);
    // a one-year term whose words say interest is calculated monthly: 10,000 × ((1 + 0.035/12)^12 − 1) = 355.67, not 350
    expect(depositInterest(10_000, 0.035, 12, 12, { calc: { periodsPerYear: 12 } })!).toBeCloseTo(10_000 * (Math.pow(1 + 0.035 / 12, 12) - 1), 9);
    expect(depositInterest(10_000, 0.035, 12, 12, { calc: { periodsPerYear: 12 } })!).toBeCloseTo(355.67, 2);
    // six months into it: (1 + R)^(6/12) − 1, R the year's effective rate
    expect(depositInterest(10_000, 0.035, 6, 12, { calc: { periodsPerYear: 4 } })!).toBeCloseTo(10_000 * (Math.pow(1 + 0.035 / 4, 2) - 1), 9);
    // a printed pair that leaves the year's rate open leaves it unknown, and a run of it stops (BANK OQ21)
    const open = { printed: { nominal: 0.0115, effective: 0.0115, decimals: 2 } };
    expect(depositInterest(10_000, 0.045, 12, 12, { calc: open })).toBeNull();
    const input: DepositInput = { goal: { amountNow: 10_000, monthly: 0, months: 12 }, market: { inflation: 0 }, deposit: { rate: 0.045, termMonths: 12, linkage: "unlinked", interestCalc: open }, profile: {} };
    expect(() => runDeposit(input, ctx)).toThrow(/BANK-OQ21/);
    expect(runDeposit({ ...input, deposit: { ...input.deposit, interestCalc: { periodsPerYear: 12 } } }, ctx).detail.interest).toBeCloseTo(10_000 * (Math.pow(1 + 0.045 / 12, 12) - 1), 6);
  });

  it("compounds a term over a year at the times a year the record gives, and gives no figure where it gives none (BANK OQ21)", () => {
    // Leumi's 503/3 prints 1.50% and "ריבית מתואמת" 1.50%: an equal pair is m = 1, so 10,000 for three years is 10,000 × (1.015³ − 1) = 456.78
    const leumi = { printed: { nominal: 0.015, effective: 0.015, decimals: 2 } };
    expect(periodsFromPrinted(0.015, 0.015, 2)).toEqual([1]);
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

  it("reads every m a printed pair allows at the decimals the bank prints", () => {
    // 2.00% beside 2.02%: m = 1 gives 2.00%, m = 2 2.01%, m = 3 2.0134%, m = 4 (1.005)⁴ − 1 = 2.01505%, which prints 2.02%, and so does
    // every m up to 365 (2.0201%)
    expect(periodsFromPrinted(0.02, 0.0202, 2)).toEqual(Array.from({ length: 362 }, (_, k) => k + 4));
    // an equal pair at two decimals is m = 1 alone from about 1.42%; at 1.15% m = 1 to 4 all print 1.15%
    expect(periodsFromPrinted(0.0115, 0.0115, 2)).toEqual([1, 2, 3, 4]);
    // an illustration, not a collected record (no record in data/ prints four decimals): 2.0000% beside 2.0184% is m = 12 alone,
    // (1 + 0.02/12)^12 − 1 = 2.01844%
    expect(periodsFromPrinted(0.02, 0.020184, 4)).toEqual([12]);
    // an effective rate under the nominal one reads no whole m, nor does one above what any m up to 365 gives
    expect(periodsFromPrinted(0.015, 0.0148, 2)).toEqual([]);
    expect(periodsFromPrinted(0.02, 0.021, 2)).toEqual([]);
  });

  it("reads BANK-50's m = 365/d, interest once at maturity, from a printed pair of a deposit that pays at maturity", () => {
    // three years (1,095 days) at 1.50%: once at maturity, (1 + 0.015 × 3)^(1/3) − 1 = 1.4782%, which prints 1.48% (BANK-50's own
    // example), so 1.50% beside 1.48% allows m = 365/1,095 alone, and 10,000 earns 10,000 × 0.015 × 3 = 450
    const simple = { printed: { nominal: 0.015, effective: 0.0148, decimals: 2 } };
    expect(periodsFromPrinted(0.015, 0.0148, 2, 1_095)).toEqual([365 / 1_095]);
    expect(depositInterest(10_000, 0.015, 36, 36, { calc: simple })!).toBeCloseTo(450, 9);
    const input: DepositInput = { goal: { amountNow: 10_000, monthly: 0, months: 36 }, market: { inflation: 0 }, deposit: { rate: 0.015, termMonths: 36, linkage: "unlinked", interestCalc: simple }, profile: {} };
    expect(runDeposit(input, ctx).detail.interest).toBeCloseTo(450, 6);
    // Leumi's equal pair 1.50% beside 1.50% does not allow it (1.48% again), so it stays m = 1
    expect(periodsFromPrinted(0.015, 0.015, 2, 1_095)).toEqual([1]);
    // an equal pair at a low rate allows it beside the whole m, and the run takes the fewest: Mizrahi-Tefahot's 332, two years at 1.00%
    // beside 1.00%, allows m = 0.5 ((1.02)^(1/2) − 1 = 0.995%) to 302, all of which print 1.00% at its own rate, so 100,000 earns
    // 100,000 × 0.01 × 2 = 2,000, the low end, where m = 1 gave 2,010
    const low = { printed: { nominal: 0.01, effective: 0.01, decimals: 2 } };
    expect(periodsFromPrinted(0.01, 0.01, 2, 730)[0]).toBe(0.5);
    expect(depositInterest(100_000, 0.01, 24, 24, { calc: low })!).toBeCloseTo(2_000, 6);
  });

  it("applies the record's own m on a term under a year, the method's once-at-maturity reading only where it gives none", () => {
    // three months of 90 printed days at 3.5%, interest calculated monthly: (1 + 0.035/12)^(12 × 90/365) − 1 (BANK-50), not 0.035 × 90/365
    expect(depositInterest(100_000, 0.035, 3, 3, { termDays: 90, calc: { periodsPerYear: 12 } })!).toBeCloseTo(100_000 * (Math.pow(1 + 0.035 / 12, (12 * 90) / 365) - 1), 6);
    expect(depositInterest(100_000, 0.035, 3, 3, { termDays: 90 })!).toBeCloseTo((100_000 * 0.035 * 90) / 365, 6);
    // a printed pair on a six-month term that leaves the run's rate open leaves the figure unknown, as over a year
    const open = { printed: { nominal: 0.0115, effective: 0.0115, decimals: 2 } };
    expect(depositInterest(10_000, 0.045, 6, 6, { calc: open })).toBeNull();
    const input: DepositInput = { goal: { amountNow: 100_000, monthly: 0, months: 3 }, market: { inflation: 0 }, deposit: { rate: 0.035, termMonths: 3, termDays: 90, linkage: "unlinked", interestCalc: { periodsPerYear: 12 } }, profile: {} };
    expect(runDeposit(input, ctx).detail.interest).toBeCloseTo(100_000 * (Math.pow(1 + 0.035 / 12, (12 * 90) / 365) - 1), 6);
  });

  it("gives a figure only where every m the pair allows gives the run's rate the same effective rate at the printed decimals, at the fewest m", () => {
    const twoTwo = { printed: { nominal: 0.02, effective: 0.0202, decimals: 2 } };
    // 2.00% beside 2.02% at its own 2%: m = 4 to 365 all print 2.02%, so the figure stands, at m = 4, the low end: 10,000 over two years is
    // 10,000 × ((1.005)⁸ − 1) = 407.07, where m = 365 would give 408.10
    expect(depositInterest(10_000, 0.02, 24, 24, { calc: twoTwo })!).toBeCloseTo(10_000 * (Math.pow(1.005, 8) - 1), 9);
    expect(depositInterest(10_000, 0.02, 24, 24, { calc: twoTwo })!).toBeCloseTo(407.07, 2);
    // at an entered 3% they print 3.03% (m = 4), 3.04% and 3.05% (m = 365): the figure is unknown
    expect(effectiveAnnualOf(0.03, twoTwo)).toBeNull();
    // Mizrahi-Tefahot's 259 prints 1.15% beside 1.15%, m = 1 to 4. At an entered 4.5% m = 1 gives 4.50% and m = 4 4.58%: 100,000 for two
    // years would be 9,202.50 or 9,362.46, so the figure is unknown and a run stops (BANK OQ21); at its own 1.15% all print 1.15%, m = 1
    const mizrahi259 = { printed: { nominal: 0.0115, effective: 0.0115, decimals: 2 } };
    expect(depositInterest(100_000, 0.045, 24, 24, { calc: mizrahi259 })).toBeNull();
    const input: DepositInput = { goal: { amountNow: 100_000, monthly: 0, months: 24 }, market: { inflation: 0 }, deposit: { rate: 0.045, termMonths: 24, linkage: "unlinked", interestCalc: mizrahi259 }, profile: {} };
    expect(() => runDeposit(input, ctx)).toThrow(/BANK-OQ21/);
    expect(depositInterest(100_000, 0.0115, 24, 24, { calc: mizrahi259 })!).toBeCloseTo(100_000 * (1.0115 * 1.0115 - 1), 9);
    // an illustration, not a collected record: printed to four decimals, 2.0000% beside 2.0184% is m = 12, where two decimals' tolerance
    // would have read m = 4; at an entered 3% the year pays (1 + 0.03/12)^12 − 1 = 3.0416%
    const fourPlaces = { printed: { nominal: 0.02, effective: 0.020184, decimals: 4 } };
    expect(effectiveAnnualOf(0.03, fourPlaces)!).toBeCloseTo(Math.pow(1 + 0.03 / 12, 12) - 1, 12);
    expect(depositInterest(10_000, 0.02, 24, 24, { calc: fourPlaces })!).toBeCloseTo(10_000 * (Math.pow(1 + 0.02 / 12, 24) - 1), 9);
  });

  it("applies the record's m to the run's own rate, not the printed effective rate, when the rate entered differs from the printed one", () => {
    // the record prints 1.50% and 1.50% (m = 1); the person enters 3%: 10,000 × (1.03³ − 1) = 927.27, not the printed rate's 456.78
    const leumi = { printed: { nominal: 0.015, effective: 0.015, decimals: 2 } };
    expect(effectiveAnnualOf(0.03, leumi)).toBeCloseTo(0.03, 12);
    expect(depositInterest(10_000, 0.03, 36, 36, { calc: leumi })!).toBeCloseTo(927.27, 9);
    const input: DepositInput = { goal: { amountNow: 10_000, monthly: 0, months: 36 }, market: { inflation: 0 }, deposit: { rate: 0.03, termMonths: 36, linkage: "unlinked", interestCalc: leumi }, profile: {} };
    expect(runDeposit(input, ctx).detail.interest).toBeCloseTo(927.27, 6);
  });

  it("does not compound interest paid out during the term (BANK-50)", () => {
    // two years at 2%, interest paid to the current account as it falls due: 10,000 × 0.02 × 2 = 400, whatever the record's compounding
    expect(depositInterest(10_000, 0.02, 24, 24, { paidOut: true })).toBeCloseTo(400, 9);
    expect(depositInterest(10_000, 0.02, 24, 24, { paidOut: true, calc: { printed: { nominal: 0.02, effective: 0.0202, decimals: 2 } } })).toBeCloseTo(400, 9);
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
    // 2.00% beside a printed 2.02% at its own rate is m = 4, the fewest it allows: 10,000 × ((1.005)⁸ − 1) = 407.07
    const r = runDeposit({ ...input, deposit: { ...input.deposit, interestCalc: { printed: { nominal: 0.02, effective: 0.0202, decimals: 2 } } } }, ctx);
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
