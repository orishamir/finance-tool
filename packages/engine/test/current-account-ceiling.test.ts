// F-26 (2026-10-25): a current account pays its rate on the first `balanceCeiling` of the balance (BANK-09, Leumi: 10,000 NIS).
import { describe, expect, it } from "vitest";
import { runDeposit, type DepositInput } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

const ctx = context(loadRules());
const base = (balanceCeiling?: number): DepositInput => ({
  goal: { amountNow: 10_000, monthly: 500, months: 120 },
  market: { inflation: 0.02 },
  deposit: { kind: "current-account", rate: 0.01, termMonths: 1, linkage: "unlinked", ...(balanceCeiling !== undefined ? { balanceCeiling } : {}) },
  profile: {},
});

describe("F-26 balance ceiling", () => {
  it("pays interest only on the first ceiling of the balance", () => {
    const capped = runDeposit(base(10_000), ctx);
    const open = runDeposit(base(), ctx);
    // 1% a year on at most 10,000 for 10 years is at most about 1,050 before tax; uncapped the balance reaches 70,000+
    expect(capped.detail.interest).toBeLessThan(1_100);
    expect(capped.detail.interest).toBeGreaterThan(900);
    expect(open.detail.interest).toBeGreaterThan(3_000);
    expect(capped.nominal).toBeLessThan(open.nominal);
    // what is left is what was paid in plus the interest after the bank's 15%
    expect(capped.nominal).toBeCloseTo(capped.paidIn + capped.detail.interest! * 0.85, 6);
  });

  it("a ceiling above every balance changes nothing", () => {
    expect(runDeposit(base(1_000_000), ctx).nominal).toBeCloseTo(runDeposit(base(), ctx).nominal, 9);
  });

  it("the founder's defaults with Leumi's terms lose money in today's shekels", () => {
    const r = runDeposit(base(10_000), ctx);
    expect(r.real).toBeLessThan(r.paidIn);
  });

  it("a ceiling does not reach a deposit", () => {
    const dep = (c?: number): DepositInput => ({ ...base(c), deposit: { kind: "deposit", rate: 0.03, termMonths: 12, linkage: "unlinked", ...(c !== undefined ? { balanceCeiling: c } : {}) } });
    expect(runDeposit(dep(5_000), ctx).nominal).toBeCloseTo(runDeposit(dep(), ctx).nominal, 9);
  });
});
