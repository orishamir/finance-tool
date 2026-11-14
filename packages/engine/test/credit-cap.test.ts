// The s.45A credit is worth at most the year's income tax before the credit, and the rest is lost (TXP-01, the cautious
// reading of TXP OQ20; method F-30 to F-32). The tax the engine counts leaves out credit points (G-23), so every year
// with a credit carries G-23 and TXP-OQ20. Worked by hand from the rule figures: TXG-02's first band is 10% up to
// 84,120; TXP-02's floor is 2,268, its cap 7% of eligible income; TXP-05 limb (1) deducts 7% of business income plus
// 4% on the part of the deposit above 12% of it.
import { describe, expect, it } from "vitest";
import { beneficiaryRelief, reliefFlags, employeeCredit, employerLinePension, ruleBook, runPension, taxAtBrackets, type PensionInput, type PensionRelief } from "../src/index.ts";
import { context } from "./golden/harness.ts";

const ctx = context();
const book = ruleBook(ctx);
const tax = taxAtBrackets(book.brackets("TXG-02", "brackets"));

describe("F-31: the credit is capped at the year's tax", () => {
  // A salary of 500 a month: income 6,000 a year, tax 10% x 6,000 = 600 before credit points.
  const low: PensionRelief = { taxableIncome: 6_000, insuredIncome: 6_000, existingOwn: 0, employer: 1_500 };

  it("a credit larger than the tax is cut to the tax, and the flags say so", () => {
    // Deposit 3,000: credited min(3,000, max(2,268, 7% x 6,000 = 420)) = 2,268; 35% of it is 793.80, above the 600 of tax.
    const r = employeeCredit(book, low, 3_000, tax);
    expect(r.credited).toBeCloseTo(2_268, 9);
    expect(r.credit).toBeCloseTo(600, 9);
    expect(r.relief).toBeCloseTo(600, 9);
    expect(r.creditCap).toEqual({ tax: 600, binds: true, gap: "G-23" });
    expect(reliefFlags(r)).toEqual(["G-23", "TXP-OQ20"]);
  });

  it("a credit below the tax is unchanged, and still flagged, since the tax leaves out credit points", () => {
    // Salary 10,000 a month, 6% already deposited through work (S27): headroom 7% x 116,400 - 7,200 = 948, credit 331.80.
    const r = employeeCredit(book, { taxableIncome: 120_000, insuredIncome: 120_000, existingOwn: 7_200, employer: 15_000 }, 3_600, tax);
    expect(r.credited).toBeCloseTo(948, 9);
    expect(r.credit).toBeCloseTo(331.8, 9);
    expect(r.creditCap.binds).toBe(false);
    expect(reliefFlags(r)).toEqual(["G-23", "TXP-OQ20"]);
  });

  it("deposits already made through work use the tax first", () => {
    // Existing own deposits 2,000: their credit 35% x 2,000 = 700 already passes the 600 of tax, so new money adds nothing.
    const r = employeeCredit(book, { ...low, existingOwn: 2_000 }, 1_000, tax);
    expect(r.credited).toBeCloseTo(268, 9);
    expect(r.credit).toBeCloseTo(0, 9);
    expect(r.creditCap.binds).toBe(true);
    // no credit is given, so nothing may be overstated: only the reading that the rest is lost
    expect(reliefFlags(r)).toEqual(["TXP-OQ20"]);
  });

  it("no credit, no flag", () => {
    const r = employeeCredit(book, low, 0, tax);
    expect(r.credit).toBe(0);
    expect(reliefFlags(r)).toEqual([]);
  });
});

describe("F-32: the credit is capped at the tax left after the deduction", () => {
  it("a self-employed person's relief never passes the year's tax", () => {
    // Business income 6,000, deposit 5,000 (below the beneficiary threshold, TXP-05 limb (1)): deduction 7% x 6,000 = 420
    // plus min(4% x 6,000 = 240, 5,000 - 12% x 6,000 = 4,280) = 240, so 660, saving 10% x 660 = 66. Tax left 10% x 5,340 = 534.
    // The rest, 4,340, is credited at the floor 2,268 (5% x 6,000 = 300 is lower): 35% is 793.80, cut to 534.
    const self: PensionRelief = { taxableIncome: 6_000, insuredIncome: 0, existingOwn: 0, employer: 0, businessIncome: true };
    const r = beneficiaryRelief(book, self, 5_000, tax, false);
    expect(r.deduction).toBeCloseTo(660, 9);
    expect(r.deductionValue).toBeCloseTo(66, 9);
    expect(r.credited).toBeCloseTo(2_268, 9);
    expect(r.credit).toBeCloseTo(534, 9);
    expect(r.relief).toBeCloseTo(600, 9);
    expect(r.creditCap).toEqual({ tax: 534, binds: true, gap: "G-23" });
  });

  it("a deduction and a credit below the tax are unchanged", () => {
    // Income 100,000, deposit 10,000, work income not insured (TXP-05 limb (2)): deduction 5,000 saves 700; credit 35% x 5,000 = 1,750
    // against a tax left of 8,412 + 14% x 10,880 = 9,935.20 on 95,000.
    const r = beneficiaryRelief(book, { taxableIncome: 100_000, insuredIncome: 0, existingOwn: 0, employer: 0 }, 10_000, tax);
    expect(r.credit).toBeCloseTo(1_750, 9);
    expect(r.creditCap.tax).toBeCloseTo(9_935.2, 6);
    expect(r.creditCap.binds).toBe(false);
  });
});

describe("F-30 follows the capped credit", () => {
  const run = (monthlySalary: number, monthly: number): PensionInput => ({
    wrapper: "provident-for-annuity",
    goal: { amountNow: 0, monthly, months: 12, contributions: "nominal", firstMonth: 1 },
    market: { grossReturn: 0.05, inflation: 0.02 },
    fees: { deposit: 0, balance: 0, direct: 0.001 },
    insurance: { rate: 0 },
    pension: { employment: "employee", monthlySalary, existingEmployeeRate: 0, employer: { pensionRate: 0.065, severanceRate: 0.06 } },
    profile: {},
  });

  it("where the cap binds, the gross deposit is the net outlay plus the year's tax", () => {
    // Net 250 a month, 3,000 in the year; salary 500 a month, tax 600. Uncapped, D = 3,000 + 35% x 2,268 = 3,793.80;
    // capped, the credit is 600 for any D above 600 / 35% = 1,714.29, so D = 3,600.
    const r = runPension(run(500, 250), ctx);
    const y = r.years[0]!;
    expect(y.net).toBeCloseTo(3_000, 9);
    expect(y.gross).toBeCloseTo(3_600, 6);
    expect(y.credit).toBeCloseTo(600, 6);
    expect(r.working.years[0]!.creditCap.binds).toBe(true);
    const flags = r.flags.map((f) => f.code);
    expect(flags).toContain("G-23");
    expect(flags).toContain("TXP-OQ20");
  });

  it("where it does not bind, the gross deposit is as before", () => {
    // Salary 10,000, net 300 a month: 3,600 in the year, credited min(D, 8,148); D = 3,600 / 0.65 = 5,538.46, credit 1,938.46.
    const r = runPension(run(10_000, 300), ctx);
    const y = r.years[0]!;
    expect(y.gross).toBeCloseTo(3_600 / 0.65, 6);
    expect(y.credit).toBeCloseTo(0.35 * (3_600 / 0.65), 6);
    expect(r.working.years[0]!.creditCap.binds).toBe(false);
    expect(r.flags.map((f) => f.code)).toEqual(expect.arrayContaining(["G-23", "TXP-OQ20"]));
  });
});

describe("the employer line's money above the exempt limit (F-52)", () => {
  it("is taxed at the brackets when paid, without credit points, so the line carries G-23 though it owes nothing at its exit", () => {
    // 6.5% of 40,000 is 2,600 a month; TXP-10 exempts 6.5% of 34,423, so 362.50 a month is work income taxed at the brackets
    const line = employerLinePension(
      {
        wrapper: "pension-comprehensive",
        goal: { amountNow: 0, monthly: 0, months: 24, contributions: "nominal", firstMonth: 1 },
        market: { grossReturn: 0.05, inflation: 0.02 },
        fees: { deposit: 0, balance: 0, direct: 0 },
        insurance: { rate: 0 },
        pension: { employment: "employee", monthlySalary: 40_000, existingEmployeeRate: 0, employer: { pensionRate: 0.065, severanceRate: 0 } },
        profile: {},
      },
      ctx,
    );
    expect(line.taxAtExit).toBe(0);
    expect(line.detail.depositTax).toBeGreaterThan(0);
    expect(line.flags.map((f) => f.code)).toContain("G-23");
  });
});
