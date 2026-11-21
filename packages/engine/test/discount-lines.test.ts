// A discount that ends (A-19, F-16, D83) outside the run itself: the fee lines a plan charges, a line set by hand, held or removed, and a
// line scaled. Harel's provident fund for investing: 0.7% a year and 0% on deposits for 60 months, then up to 1.05% and 4%.
import { describe, expect, it } from "vitest";
import { annualToMonthly, feeCharged, feeLines, runPension, runProvident, withFee, withHeldRate, withFeeScaled, withoutFeeLine, type RunPlan } from "../src/index.ts";
import { context } from "./golden/harness.ts";

const ctx = context();

const fees = {
  deposit: 0,
  balance: 0.007,
  direct: 0,
  discount: { months: 60, listRate: 0.0105 },
  depositDiscount: { months: 60, listRate: 0.04 },
};

// 72 months with a nominal deposit every month: months 61 to 72 are past the discount on both fees
const plan = (f: typeof fees | Omit<typeof fees, "discount" | "depositDiscount"> = fees, months = 72): RunPlan => ({
  run: "runProvident",
  input: {
    wrapper: "kupat-gemel-lehashkaa",
    goal: { amountNow: 10_000, monthly: 1_000, months, contributions: "nominal" },
    market: { grossReturn: 0.06, inflation: 0.025 },
    fees: f,
    profile: {},
  },
});
const run = (p: RunPlan) => (p.run === "runProvident" ? runProvident(p.input, ctx) : null)!;
// the same plan with the amount now alone and no deposit after it (PF OQ18, D87)
const once = (f: typeof fees | Omit<typeof fees, "discount" | "depositDiscount">, months = 72): RunPlan => {
  const p = plan(f, months);
  return p.run === "runProvident" ? { ...p, input: { ...p.input, goal: { ...p.input.goal, monthly: 0 } } } : p;
};

describe("a discount that ends, outside the run (A-19, F-16)", () => {
  it("the run charges both fees from month 61: 4% of each deposit, 1.05% of the balance", () => {
    const at60 = run(plan(fees, 60));
    expect(at60.fees.deposit).toBe(0);
    const at61 = run(plan(fees, 61));
    expect(at61.fees.deposit).toBeCloseTo(0.04 * 1_000, 9);
    // month 61's balance fee is at 1.05%, more than 0.7% of the same balance would be
    const flat = run(plan({ deposit: 0, balance: 0.007, direct: 0 }, 61));
    expect(at61.fees.balance - at60.fees.balance).toBeGreaterThan(flat.fees.balance - at60.fees.balance);
  });

  it("a line at 0% whose discount reverts to a positive rate is a fee line", () => {
    expect(feeCharged(fees, "deposit")).toBe(true);
    expect(feeCharged({ ...fees, depositDiscount: undefined }, "deposit")).toBe(false);
    expect(feeLines(plan())).toEqual(["deposit", "balance"]);
  });

  it("without the deposit fee nothing is charged on deposits in any month, and its cost is the 4% of months 61 to 72", () => {
    const without = withoutFeeLine(plan(), "deposit");
    const f = without.run === "runProvident" ? without.input.fees : null;
    expect(f).toEqual({ deposit: 0, balance: 0.007, direct: 0, discount: fees.discount });
    expect(run(without).fees.deposit).toBe(0);
    const cost = run(without).real - run(plan()).real;
    // 12 deposits of 1,000 at 4%, less the growth they would have made: a little under 480 nominal, in today's money
    expect(cost).toBeGreaterThan(400);
    expect(cost).toBeLessThan(480);
  });

  it("set by hand with withFee, a line is one rate for the whole run; the other line keeps its discount", () => {
    expect(withFee(fees, "balance", 0.005)).toEqual({ deposit: 0, balance: 0.005, direct: 0, depositDiscount: fees.depositDiscount });
    expect(withFee(fees, "deposit", 0.01)).toEqual({ deposit: 0.01, balance: 0.007, direct: 0, discount: fees.discount });
    expect(withFee(fees, "direct", 0.001)).toEqual({ ...fees, direct: 0.001 });
  });

  it("a line scaled by a factor is scaled in both periods of its discount", () => {
    expect(withFeeScaled(fees, "balance", 2)).toEqual({ ...fees, balance: 0.014, discount: { months: 60, listRate: 0.021 } });
    expect(withFeeScaled(fees, "deposit", 0.5)).toEqual({ ...fees, depositDiscount: { months: 60, listRate: 0.02 } });
    // halved, month 61's deposit pays 2%; doubled, 8% is held at the 4% cap (PF-02)
    expect(run(plan(withFeeScaled(fees, "deposit", 0.5), 61)).fees.deposit).toBeCloseTo(0.02 * 1_000, 9);
    expect(run(plan(withFeeScaled(fees, "deposit", 2), 61)).fees.deposit).toBeCloseTo(0.04 * 1_000, 9);
  });

  it("a lower rate held on a line with no discount holds for PF-13's 60 months, then returns to the line's own rate (D86)", () => {
    const flat = { deposit: 0.01, balance: 0.008, direct: 0 };
    expect(withHeldRate(flat, "balance", 0.005, 60, 0.008)).toEqual({ ...flat, balance: 0.005, discount: { months: 60, listRate: 0.008 } });
    // a rate at or above the line's own is one rate; direct expenses never hold
    expect(withHeldRate(flat, "balance", 0.009, 60, 0.008)).toEqual({ ...flat, balance: 0.009 });
    expect(withHeldRate(flat, "direct", 0.001, 60, 0.002)).toEqual({ ...flat, direct: 0.001 });
  });

  it("entering the record's own fee keeps a discount printed longer than PF-13's period; a lower rate holds for PF-13's period alone (A-19, D86)", () => {
    const long = { ...fees, discount: { months: 84, listRate: 0.0105 } };
    expect(withHeldRate(long, "balance", 0.007, 60, 0.0105).discount).toEqual({ months: 84, listRate: 0.0105 });
    expect(withHeldRate(long, "balance", 0.008, 60, 0.0105).discount).toEqual({ months: 84, listRate: 0.0105 });
    // no document promises 0.5% past PF-13's five years
    expect(withHeldRate(long, "balance", 0.005, 60, 0.0105).discount).toEqual({ months: 60, listRate: 0.0105 });
    // a printed period shorter than PF-13's is extended to it, as the run itself does
    expect(withHeldRate({ ...fees, discount: { months: 24, listRate: 0.0105 } }, "balance", 0.005, 60, 0.0105).discount).toEqual({ months: 60, listRate: 0.0105 });
    // with no discount of its own the line holds for PF-13's period
    const plain: { deposit: number; balance: number; direct: number; discount?: { months: number; listRate: number } } = { deposit: 0, balance: 0.008, direct: 0 };
    expect(withHeldRate(plain, "balance", 0.005, 60, 0.008).discount).toEqual({ months: 60, listRate: 0.008 });
  });

  it("a pension fund's deposit discount holds for its period, then the line's rate is charged, as on a provident fund (F-16)", () => {
    const pension: RunPlan = {
      run: "runPension",
      input: {
        wrapper: "pension-general",
        goal: { amountNow: 0, monthly: 1_000, months: 120 },
        market: { grossReturn: 0.06, inflation: 0.025 },
        fees: { deposit: 0.02, balance: 0.003, direct: 0 },
        insurance: { rate: 0 },
        pension: { employment: "employee", monthlySalary: 10_000 },
        profile: {},
      },
    };
    // 1% for 60 months, then the line's own 2%
    const cut: RunPlan = pension.run === "runPension" ? { run: "runPension", input: { ...pension.input, fees: { deposit: 0.01, balance: 0.003, direct: 0, depositDiscount: { months: 60, listRate: 0.02 } } } } : pension;
    // the pension ledger reads the deposit discount: deposits in months 0 to 60 pay 1%, months 61 to 120 pay 2%
    const depositFees = (p: RunPlan) => (p.run === "runPension" ? runPension(p.input, ctx).fees.deposit : 0);
    const gross = (p: RunPlan) => (p.run === "runPension" ? runPension(p.input, ctx).deposits : []);
    const g = gross(pension);
    const expected = g.reduce((s, d, m) => s + (m <= 120 ? d * (m <= 60 ? 0.01 : 0.02) : 0), 0);
    expect(depositFees(cut)).toBeCloseTo(expected, 6);
    expect(depositFees(cut)).toBeGreaterThan(depositFees(pension) / 2);
    expect(depositFees(cut)).toBeLessThan(depositFees(pension));
    // a printed deposit discount shorter than PF-13's period is extended to it, and the run says so, as on a provident fund
    const short = { ...pension.input, fees: { ...pension.input.fees, deposit: 0.01, depositDiscount: { months: 24, listRate: 0.02 } } } as Parameters<typeof runPension>[0];
    const sr = runPension(short, ctx);
    expect(sr.fees.deposit).toBeCloseTo(expected, 6);
    expect(sr.flags.some((f) => f.code === "PF-13")).toBe(true);
  });

  it("a discounted plan with no deposit after month 0 carries the open question PF OQ18 (D87)", () => {
    const codes = (p: RunPlan) => run(p).flags.map((f) => f.code);
    expect(codes(once(fees))).toContain("PF-OQ18");
    expect(codes(plan())).not.toContain("PF-OQ18");
    expect(codes(once({ deposit: 0, balance: 0.007, direct: 0 }))).not.toContain("PF-OQ18");
    expect(codes(once(fees, 6))).not.toContain("PF-OQ18");
  });

  // PF OQ18's cautious reading (D87, guidelines/research.md step 6, 2026-11-08): PF-14 case 1 lets the manager raise the fee six months after
  // deposits stop, and whether that reaches one deposit and no more is open, so the run takes the reading that costs more. Until that day the
  // run kept the discount for its whole period (the favourable reading).
  it("a one-deposit discounted run longer than six months pays the fee without the discount from month 7 (PF OQ18, cautious)", () => {
    const g = annualToMonthly(0.06);
    // the hand ledger: 10,000 in at month 0 at the discounted deposit fee (0%), then the balance fee at 0.7% for months 1 to 6, 1.05% after
    const byHand = (months: number) => {
      let b = 10_000;
      let fee = 0;
      for (let m = 1; m <= months; m++) {
        b *= 1 + g;
        const f = ((m <= 6 ? 0.007 : 0.0105) / 12) * b;
        fee += f;
        b -= f;
      }
      return { b, fee };
    };
    for (const months of [7, 12, 72]) {
      const r = run(once(fees, months));
      expect(r.fees.deposit).toBe(0);
      expect(r.fees.balance).toBeCloseTo(byHand(months).fee, 6);
      expect(r.flags.map((f) => f.code)).toContain("PF-OQ18");
    }
    // month 7 alone is charged at 1.05%
    const m6 = run(once(fees, 6));
    const m7 = run(once(fees, 7));
    expect(m6.fees.balance).toBeCloseTo(byHand(6).fee, 6);
    expect(m7.fees.balance - m6.fees.balance).toBeCloseTo((0.0105 / 12) * byHand(6).b * (1 + g), 6);
    // PF-13's five years do not outlast the cut: a printed 24-month discount also ends after month 6, and PF-13 is not named as lengthening it
    const short = run(once({ ...fees, discount: { months: 24, listRate: 0.0105 }, depositDiscount: { months: 24, listRate: 0.04 } }, 12));
    expect(short.fees.balance).toBeCloseTo(byHand(12).fee, 6);
    expect(short.flags.map((f) => f.code)).not.toContain("PF-13");
    // a plan with monthly deposits keeps the discount for PF-13's period: 0.7% through month 60
    const monthly = run(plan(fees, 12));
    const flat = run(plan({ deposit: 0, balance: 0.007, direct: 0 }, 12));
    expect(monthly.fees.balance).toBeCloseTo(flat.fees.balance, 9);
  });

  it("a one-deposit discounted pension run pays the fee without the discount from month 7 too (PF OQ18, cautious)", () => {
    const g = annualToMonthly(0.06);
    const pensionOnce = (months: number): Parameters<typeof runPension>[0] => ({
      wrapper: "pension-comprehensive",
      goal: { amountNow: 100_000, monthly: 0, months },
      market: { grossReturn: 0.06, inflation: 0.025 },
      fees: { deposit: 0, balance: 0.002, direct: 0, discount: { months: 60, listRate: 0.005 } },
      insurance: { rate: 0 },
      pension: { employment: "employee", monthlySalary: 10_000 },
      profile: {},
    });
    const r = runPension(pensionOnce(12), ctx);
    // the amount now goes in at month 0, gross of its relief (F-30), with no deposit fee and no insurance
    let b = r.deposits[0]!;
    let fee = 0;
    for (let m = 1; m <= 12; m++) {
      b *= 1 + g;
      const f = ((m <= 6 ? 0.002 : 0.005) / 12) * b;
      fee += f;
      b -= f;
    }
    expect(r.fees.balance).toBeCloseTo(fee, 6);
    expect(r.flags.map((f) => f.code)).toContain("PF-OQ18");
    // six months or fewer: the discount holds throughout and the question does not arise
    expect(runPension(pensionOnce(6), ctx).flags.map((f) => f.code)).not.toContain("PF-OQ18");
  });
});
