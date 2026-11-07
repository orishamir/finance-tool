// A discount that ends (A-19, F-16, D83) outside the run itself: the fee lines F-61 reads, a line replaced or removed, and a line
// scaled for F-81. Harel's provident fund for investing: 0.7% a year and 0% on deposits for 60 months, then up to 1.05% and 4%.
import { describe, expect, it } from "vitest";
import { feeCap, feeCharged, feeLines, heldRevertRate, feeMateriality, rateAfterDiscount, runPension, runProvident, withFee, withHeldRate, valueOfReduction, withFeeRate, withFeeScaled, withoutFeeLine, type RunPlan } from "../src/index.ts";
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

  it("a line at 0% whose discount reverts to a positive rate is a fee line (F-61)", () => {
    expect(feeCharged(fees, "deposit")).toBe(true);
    expect(feeCharged({ ...fees, depositDiscount: undefined }, "deposit")).toBe(false);
    expect(feeLines(plan())).toEqual(["deposit", "balance"]);
  });

  it("without the deposit fee nothing is charged on deposits in any month, and its cost is the 4% of months 61 to 72", () => {
    const without = withoutFeeLine(plan(), "deposit");
    const f = without.run === "runProvident" ? without.input.fees : null;
    expect(f).toEqual({ deposit: 0, balance: 0.007, direct: 0, discount: fees.discount });
    expect(run(without).fees.deposit).toBe(0);
    const m = feeMateriality(plan(), ctx);
    const cost = m.lines.find((l) => l.line === "deposit")!.cost.value as number;
    // 12 deposits of 1,000 at 4%, less the growth they would have made: a little under 480 nominal, in today's money
    expect(cost).toBeGreaterThan(400);
    expect(cost).toBeLessThan(480);
    // the deposit fee is its own line, not left in the interaction remainder
    expect(Math.abs(m.interaction.value as number)).toBeLessThan(cost / 10);
  });

  it("a stated reduction replaces only the discounted rate; the line still reverts after the period (F-61, D83)", () => {
    const b = withFeeRate(plan(), "balance", 0.005, ctx);
    expect(b.run === "runProvident" && b.input.fees).toEqual({ ...fees, balance: 0.005 });
    // worth only the five years at 0.5% instead of 0.7%: months 61 to 72 are the same 1.05% on both sides
    const worth = valueOfReduction(plan(), "balance", 0.005, ctx).value.value as number;
    const flat = run(plan(withFee(fees, "balance", 0.005))).real - run(plan()).real;
    expect(worth).toBeGreaterThan(0);
    expect(worth).toBeLessThan(flat);
  });

  it("set by hand with withFee, a line is one rate for the whole run; the other line keeps its discount", () => {
    expect(withFee(fees, "balance", 0.005)).toEqual({ deposit: 0, balance: 0.005, direct: 0, depositDiscount: fees.depositDiscount });
    expect(withFee(fees, "deposit", 0.01)).toEqual({ deposit: 0.01, balance: 0.007, direct: 0, discount: fees.discount });
    expect(withFee(fees, "direct", 0.001)).toEqual({ ...fees, direct: 0.001 });
  });

  it("F-81 scales a discounted line in both periods", () => {
    expect(withFeeScaled(fees, "balance", 2)).toEqual({ ...fees, balance: 0.014, discount: { months: 60, listRate: 0.021 } });
    expect(withFeeScaled(fees, "deposit", 0.5)).toEqual({ ...fees, depositDiscount: { months: 60, listRate: 0.02 } });
    // halved, month 61's deposit pays 2%; doubled, 8% is held at the 4% cap (PF-02)
    expect(run(plan(withFeeScaled(fees, "deposit", 0.5), 61)).fees.deposit).toBeCloseTo(0.02 * 1_000, 9);
    expect(run(plan(withFeeScaled(fees, "deposit", 2), 61)).fees.deposit).toBeCloseTo(0.04 * 1_000, 9);
  });

  it("a stated reduction on a line with no discount holds for PF-13's 60 months, then returns to the line's own rate (D86)", () => {
    const flat = { deposit: 0.01, balance: 0.008, direct: 0 };
    const b = withFeeRate(plan(flat), "balance", 0.005, ctx);
    expect(b.run === "runProvident" && b.input.fees).toEqual({ ...flat, balance: 0.005, discount: { months: 60, listRate: 0.008 } });
    // without the context (PF-13 unknown), or for a move to another fund, the rate is the whole run's
    expect(withFeeRate(plan(flat), "balance", 0.005)).toEqual(plan({ ...flat, balance: 0.005 }));
    const held = valueOfReduction(plan(flat), "balance", 0.005, ctx).value.value as number;
    const moved = valueOfReduction(plan(flat), "balance", 0.005, ctx, { held: false }).value.value as number;
    expect(held).toBeGreaterThan(0);
    expect(held).toBeLessThan(moved);
    // a rate at or above the line's own is one rate; direct expenses never hold
    expect(withHeldRate(flat, "balance", 0.009, 60, 0.008)).toEqual({ ...flat, balance: 0.009 });
    expect(withHeldRate(flat, "direct", 0.001, 60, 0.002)).toEqual({ ...flat, direct: 0.001 });
  });

  it("a move to another fund at its own rate (no context) is one rate for the whole run: the old fund's discount does not follow it (D86)", () => {
    const moved = withFeeRate(plan(), "balance", 0.005);
    expect(moved.run === "runProvident" && moved.input.fees).toEqual({ deposit: 0, balance: 0.005, direct: 0, depositDiscount: fees.depositDiscount });
    // months 61 to 72 at 0.5% too, so the move is worth more than the same rate agreed with the old fund
    const asMove = valueOfReduction(plan(), "balance", 0.005, ctx, { held: false }).value.value as number;
    const asOffer = valueOfReduction(plan(), "balance", 0.005, ctx).value.value as number;
    expect(asMove).toBeGreaterThan(asOffer);
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

  it("a stated cut on a pension fund's deposit fee holds for PF-13's period, then returns to the line's rate, like every other line (D86)", () => {
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
    const cut = withFeeRate(pension, "deposit", 0.01, ctx);
    // 1% for 60 months, then the line's own 2%
    expect(cut.run === "runPension" && cut.input.fees).toEqual({ deposit: 0.01, balance: 0.003, direct: 0, depositDiscount: { months: 60, listRate: 0.02 } });
    const held = valueOfReduction(pension, "deposit", 0.01, ctx).value.value as number;
    const whole = valueOfReduction(pension, "deposit", 0.01, ctx, { held: false }).value.value as number;
    expect(held).toBeGreaterThan(0);
    expect(held).toBeLessThan(whole);
    // the pension ledger reads the deposit discount: deposits in months 0 to 60 pay 1%, months 61 to 120 pay 2%
    const depositFees = (p: RunPlan) => (p.run === "runPension" ? runPension(p.input, ctx).fees.deposit : 0);
    const gross = (p: RunPlan) => (p.run === "runPension" ? runPension(p.input, ctx).deposits : []);
    const g = gross(pension);
    const expected = g.reduce((s, d, m) => s + (m <= 120 ? d * (m <= 60 ? 0.01 : 0.02) : 0), 0);
    expect(depositFees(cut)).toBeCloseTo(expected, 6);
    expect(depositFees(cut)).toBeGreaterThan(depositFees(pension) / 2);
    expect(depositFees(cut)).toBeLessThan(depositFees(pension));
    expect(heldRevertRate(pension, "deposit")).toBe(0.02);
    // a printed deposit discount shorter than PF-13's period is extended to it, and the run says so, as on a provident fund
    const short = { ...pension.input, fees: { ...pension.input.fees, deposit: 0.01, depositDiscount: { months: 24, listRate: 0.02 } } } as Parameters<typeof runPension>[0];
    const sr = runPension(short, ctx);
    expect(sr.fees.deposit).toBeCloseTo(expected, 6);
    expect(sr.flags.some((f) => f.code === "PF-13")).toBe(true);
    // the verdict judges the line by the rate after the cut once it ends within the run (D88)
    expect(rateAfterDiscount(cut, "deposit", 120, ctx)).toBe(0.02);
    // the balance fee of the same fund is held the same way
    const bal = withFeeRate(pension, "balance", 0.002, ctx);
    expect(bal.run === "runPension" && bal.input.fees.discount).toEqual({ months: 60, listRate: 0.003 });
  });

  it("the verdict judges a discount that ends within the horizon by the rate after it (D88)", () => {
    expect(rateAfterDiscount(plan(), "deposit", 72, ctx)).toBe(0.04);
    expect(rateAfterDiscount(plan(), "balance", 72, ctx)).toBe(0.0105);
    // a discount that lasts the whole run, and a line with none, are judged by the rate charged now
    expect(rateAfterDiscount(plan(fees, 60), "deposit", 60, ctx)).toBeNull();
    expect(rateAfterDiscount(plan({ deposit: 0, balance: 0.007, direct: 0 }), "balance", 72, ctx)).toBeNull();
    // a rate after the discount scaled past the regulated cap (F-81's sensitivity) is judged at the cap, the most the run charges
    const doubled = plan({ ...fees, discount: { months: 60, listRate: 0.021 }, depositDiscount: { months: 60, listRate: 0.08 } });
    expect(rateAfterDiscount(doubled, "balance", 72, ctx)).toBe(feeCap(doubled, "balance", ctx)!.rate);
    expect(rateAfterDiscount(doubled, "deposit", 72, ctx)).toBe(feeCap(doubled, "deposit", ctx)!.rate);
    expect(feeCap(doubled, "balance", ctx)!.rate).toBeLessThan(0.021);
    // a study fund charges no deposit fee (PF-06), so a deposit discount there is judged at nothing; a comprehensive pension fund at its own caps
    const kh = doubled.run === "runProvident" ? ({ ...doubled, input: { ...doubled.input, wrapper: "keren-hishtalmut" } } as RunPlan) : doubled;
    expect(rateAfterDiscount(kh, "deposit", 72, ctx)).toBe(0);
    const comp: RunPlan = {
      run: "runPension",
      input: {
        wrapper: "pension-comprehensive",
        goal: { amountNow: 0, monthly: 1_000, months: 72 },
        market: { grossReturn: 0.06, inflation: 0.025 },
        fees: { deposit: 0.01, balance: 0.002, direct: 0, discount: { months: 60, listRate: 0.02 }, depositDiscount: { months: 60, listRate: 0.1 } },
        insurance: { rate: 0 },
        pension: { employment: "employee", monthlySalary: 10_000 },
        profile: {},
      },
    };
    expect(rateAfterDiscount(comp, "balance", 72, ctx)).toBe(feeCap(comp, "balance", ctx)!.rate);
    expect(rateAfterDiscount(comp, "deposit", 72, ctx)).toBe(feeCap(comp, "deposit", ctx)!.rate);
    expect(feeCap(comp, "deposit", ctx)!.rate).toBeLessThan(0.1);
  });

  it("a discounted plan with no deposit after month 0 carries the open question PF OQ18 (D87)", () => {
    const once = (f: typeof fees | Omit<typeof fees, "discount" | "depositDiscount">, months = 72): RunPlan => {
      const p = plan(f, months);
      return p.run === "runProvident" ? { ...p, input: { ...p.input, goal: { ...p.input.goal, monthly: 0 } } } : p;
    };
    const codes = (p: RunPlan) => run(p).flags.map((f) => f.code);
    expect(codes(once(fees))).toContain("PF-OQ18");
    expect(codes(plan())).not.toContain("PF-OQ18");
    expect(codes(once({ deposit: 0, balance: 0.007, direct: 0 }))).not.toContain("PF-OQ18");
    expect(codes(once(fees, 6))).not.toContain("PF-OQ18");
  });
});
