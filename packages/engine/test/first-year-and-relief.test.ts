// The run date's tax year (F-01, A-30), the study fund's standing against its yearly limit (F-97), TXP-03's test on one basis, and the
// relief at the brackets (F-31, F-32, G-23). Figures worked by hand in the comments, from the 2026 figures of TXH-05, TXH-08, TXG-02,
// TXP-02, TXP-03 and TXP-05.
import { describe, expect, it } from "vitest";
import { beneficiaryRelief, limitStanding, reliefFlags, ruleBook, runPension, runProvident, taxAtBrackets, type PensionInput, type ProvidentInput } from "../src/index.ts";
import { loadRules } from "./golden/harness.ts";

const ctx = { rules: loadRules(), runDate: "2026-11-14" };
const codes = (r: { flags: { code: string }[] }) => r.flags.map((f) => f.code);

describe("F-97 a self-employed person's standing is a whole tax year's", () => {
  // 15,000 a month of business income (180,000 a year), 1,500 a month after the tax back, run on 14.11.2026
  const self = (firstMonth: number): ProvidentInput => ({
    wrapper: "keren-hishtalmut",
    goal: { amountNow: 0, monthly: 1_500, months: 144, firstMonth },
    market: { grossReturn: 0.07, inflation: 0.025 },
    fees: { deposit: 0, balance: 0.0054, direct: 0 },
    hishtalmut: { employment: "self-employed", clockStartMonth: 0 },
    profile: { annualIncome: 180_000 },
  });
  it("leaves 946 a year of room, whatever month the run starts in", () => {
    // a year: 12 × 1,500 = 18,000 after the tax back. The deduction is 4.5% of 180,000 = 8,100 (TXH-05), all of it in the 20% band
    // (120,720 to 228,000, TXG-02), so it gives back 1,620 and the year's deposits are 19,620; the benefited amount is 20,566 (TXH-08), so
    // 946 is left and nothing is above it
    for (const first of [11, 1, 6]) {
      const s = limitStanding([runProvident(self(first), ctx)]);
      expect(s.per).toBe("year");
      expect(s.room[0]).toBeCloseTo(946, 6);
      expect(s.over[0]).toBe(0);
    }
  });
  it("flags the deduction valued at the brackets (G-23)", () => {
    expect(codes(runProvident(self(11), ctx))).toContain("G-23");
  });
});

describe("A-30 a yearly cap reached in the run date's tax year", () => {
  const kgl = (firstMonth: number): ProvidentInput => ({
    wrapper: "kupat-gemel-lehashkaa",
    goal: { amountNow: 90_000, monthly: 0, months: 24, firstMonth },
    market: { grossReturn: 0.05, inflation: 0.02 },
    fees: { deposit: 0, balance: 0, direct: 0 },
    profile: {},
  });
  it("is flagged where the first tax year is part of a year and its ceiling is reached", () => {
    // 90,000 now is above the 2026 ceiling of 83,641 (KGL-03, as the record holds it): the run date's year takes the whole ceiling, which assumes nothing was
    // deposited earlier that year
    const r = runProvident(kgl(11), ctx);
    expect(r.routed[0]!.amount).toBeCloseTo(90_000 - 83_641, 6);
    expect(r.flags).toContainEqual({ code: "A-30", month: 1 });
  });
  it("is not flagged when the first tax year is a whole one, or when no cap is reached", () => {
    expect(codes(runProvident(kgl(1), ctx))).not.toContain("A-30");
    expect(codes(runProvident({ ...kgl(11), goal: { amountNow: 10_000, monthly: 0, months: 24, firstMonth: 11 } }, ctx))).not.toContain("A-30");
  });
});

describe("TXP-03's 16% test counts own and employer money on one basis, a whole year's", () => {
  // salary 15,000: employer 6.5% + 6% = 1,875 a month, 22,500 a year; own 6% already through work, 10,800 a year: 33,300 with no new money,
  // above 16% of the average wage, 26,436 (TXP-03). With two months of employer money (3,750) the first year would be under it.
  const input: PensionInput = {
    wrapper: "pension-comprehensive",
    goal: { amountNow: 0, monthly: 300, months: 24, firstMonth: 11 },
    market: { grossReturn: 0.05, inflation: 0.02 },
    fees: { deposit: 0, balance: 0.0022, direct: 0 },
    insurance: { rate: 0 },
    pension: { employment: "employee", monthlySalary: 15_000, existingEmployeeRate: 0.06, employer: { pensionRate: 0.065, severanceRate: 0.06 } },
    profile: { ageAtStart: 30 },
  };
  it("makes the run date's two months a beneficiary member's year, as the whole years after it", () => {
    const r = runPension(input, ctx);
    expect(r.years[0]!.beneficiary).toBe(true);
    expect(r.years[0]!.formula).toBe("F-32");
    expect(r.years[1]!.beneficiary).toBe(true);
  });
});

describe("F-32 the new money's credit is the year's capped credit with it less the year's without it", () => {
  const book = ruleBook(ctx);
  const tax = taxAtBrackets(book.brackets("TXG-02", "brackets"));
  it("caps the existing deposits' credit at the tax on the whole income", () => {
    // Business income 8,000: tax 10% = 800. Not a beneficiary member (2,268 + 2,000 is under 26,436). Deduction (TXP-05 limb 1): 7% of
    // 8,000 = 560, plus 4% of 8,000 = 320 on the deposit above 12% of it (960): 880, worth 800 − 712 = 88. Credited amount: up to the
    // floor 2,268, all taken by the 2,268 already deposited, whose credit is 35% × 2,268 = 793.80. Without the new money that credit is
    // capped at 800, so it is 793.80; with it, at the 712 left after the deduction. New money's credit: 712 − 793.80 = −81.80; relief
    // 88 − 81.80 = 6.20, which is the year's tax without the new money, 800 − 793.80, less the tax with it, 0.
    const r = beneficiaryRelief(book, { taxableIncome: 8_000, insuredIncome: 0, existingOwn: 2_268, employer: 0, businessIncome: true }, 2_000, tax);
    expect(r.beneficiary).toBe(false);
    expect(r.deduction).toBeCloseTo(880, 9);
    expect(r.deductionValue).toBeCloseTo(88, 9);
    expect(r.credit).toBeCloseTo(-81.8, 9);
    expect(r.relief).toBeCloseTo(6.2, 9);
  });
});

describe("G-23 on any deduction or credit valued at the brackets", () => {
  it("flags a deduction with no credit", () => {
    expect(reliefFlags({ credit: 0, deductionValue: 50, creditCap: { tax: 100, binds: false, gap: "G-23" } })).toEqual(["G-23"]);
    expect(reliefFlags({ credit: 0, deductionValue: 0, creditCap: { tax: 100, binds: false, gap: "G-23" } })).toEqual([]);
  });
});
