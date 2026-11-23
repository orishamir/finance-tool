// G-41: the rule base holds no rule for the tax on interest below zero (TXI OQ15). The bank withholds on interest it pays (TXI-07, TXI-08);
// TXI-25 is negative linkage, not a negative rate; a makam issued above 100 has no discount, and its shortfall at redemption may be negative
// interest (TXI-01) or a capital loss on redemption (TXI-12, TXI-17), which the rule base does not choose between. A deposit, a savings plan,
// a current account, a makam and a government bond at a negative rate stop on the rule that would tax the interest, naming G-41
// (`BlockedError`'s `gap`), rather than tax it at a negative amount, which would hand tax back.
import { describe, expect, it } from "vitest";
import { BlockedError, runDeposit, type DepositInput } from "../src/index.ts";
import { runBond, type BondInput } from "../src/ledgers/bond.ts";
import { runMakam, type MakamInput } from "../src/ledgers/makam.ts";
import { context, loadRules } from "./golden/harness.ts";

const ctx = context(loadRules());
const goal = { amountNow: 10_000, monthly: 500, months: 24 };

const deposit = (kind: DepositInput["deposit"]["kind"], rate: number, linkage: "unlinked" | "cpi" = "unlinked"): DepositInput => ({
  goal,
  market: { inflation: 0.02 },
  deposit: { kind, rate, termMonths: kind === "current-account" ? 1 : 12, linkage },
  profile: {},
});
const makam = (y: number): MakamInput => ({ goal, market: { inflation: 0.02 }, makam: { yield: y }, tariff: {} });
const bond = (coupon: number): BondInput => ({ goal, market: { inflation: 0.02 }, bond: { coupon, linkage: "unlinked", couponEveryMonths: 12 }, tariff: {}, profile: {} });

const gap = (run: () => unknown) => {
  try {
    run();
  } catch (e) {
    return e instanceof BlockedError ? `${e.ruleId} ${e.gap ?? "no gap"}` : `not a BlockedError: ${String(e)}`;
  }
  return "ran";
};

describe("G-41 interest below zero is not run", () => {
  it("stops a deposit, a savings plan and a current account at a negative rate, a linked deposit's real rate included", () => {
    expect(gap(() => runDeposit(deposit("deposit", -0.1), ctx))).toBe("TXI-03 G-41");
    expect(gap(() => runDeposit(deposit("savings-plan", -0.01), ctx))).toBe("TXI-03 G-41");
    expect(gap(() => runDeposit(deposit("current-account", -0.1), ctx))).toBe("TXI-03 G-41");
    expect(gap(() => runDeposit(deposit("deposit", -0.005, "cpi"), ctx))).toBe("TXI-05 G-41");
  });

  it("stops a makam at a negative yield and a government bond at a negative coupon", () => {
    expect(gap(() => runMakam(makam(-0.02), ctx))).toBe("TXI-11 G-41");
    expect(gap(() => runBond(bond(-0.02), ctx))).toBe("TXI-15 G-41");
  });

  it("runs each at a rate of zero, with no tax on interest", () => {
    for (const kind of ["deposit", "savings-plan", "current-account"] as const) {
      const r = runDeposit(deposit(kind, 0), ctx);
      expect(r.taxDuring + r.taxAtExit).toBeCloseTo(0, 6);
      expect(r.nominal).toBeCloseTo(r.paidIn, 6);
    }
    const m = runMakam(makam(0), ctx);
    expect(m.taxDuring + m.taxAtExit).toBeCloseTo(0, 6);
    const b = runBond(bond(0), ctx);
    expect(b.taxDuring + b.taxAtExit).toBeCloseTo(0, 6);
  });
});
