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

describe("G-16: money still inside a deposit's term on the last day", () => {
  const dep = (months: number, monthly: number, linkage: "unlinked" | "cpi" = "unlinked"): DepositInput => ({
    goal: { amountNow: 10_000, monthly, months },
    market: { inflation: 0.02 },
    deposit: { kind: "deposit", rate: 0.03, termMonths: 12, linkage },
    profile: {},
  });
  const codes = (i: DepositInput) => runDeposit(i, ctx).flags.map((f) => f.code);

  it("is flagged when a monthly deposit opened in the last year has not reached its term", () => {
    expect(codes(dep(24, 500))).toContain("G-16");
    expect(codes(dep(24, 500, "cpi"))).toContain("G-16");
  });
  it("is flagged when the plan ends in the middle of a term", () => {
    expect(codes(dep(18, 0))).toContain("G-16");
  });
  it("is not flagged when every deposit ends its term on the last day", () => {
    expect(codes(dep(24, 0))).not.toContain("G-16");
  });
  it("is flagged on a savings plan as on a deposit", () => {
    const plan: DepositInput = { ...dep(48, 500), deposit: { kind: "savings-plan", rate: 0.03, termMonths: 36, linkage: "unlinked" } };
    expect(codes(plan)).toContain("G-16");
    expect(codes({ ...plan, goal: { amountNow: 10_000, monthly: 0, months: 72 } })).not.toContain("G-16");
  });
  it("is not flagged on a deposit with a one-month term, whatever the plan", () => {
    expect(codes({ ...dep(30, 500), deposit: { kind: "deposit", rate: 0.03, termMonths: 1, linkage: "unlinked" } })).not.toContain("G-16");
  });
  it("is never flagged on a current account, which has no term", () => {
    expect(codes(base(10_000))).not.toContain("G-16");
  });
});

// F-41: a piece's age on month m is m - startMonth + 1; it matures at age termMonths and is at an exit point when its age is a
// whole multiple of exitEveryMonths. A piece at an exit point on the last day can be taken out without a break: no G-16.
describe("G-16 and exit points", () => {
  const dep = (months: number, monthly: number, termMonths: number, exitEveryMonths?: number, kind: "deposit" | "savings-plan" = "deposit", linkage: "unlinked" | "cpi" = "unlinked"): DepositInput => ({
    goal: { amountNow: 10_000, monthly, months },
    market: { inflation: 0.02 },
    deposit: { kind, rate: 0.03, termMonths, linkage, ...(exitEveryMonths !== undefined ? { exitEveryMonths } : {}) },
    profile: {},
  });
  const flagged = (i: DepositInput) => runDeposit(i, ctx).flags.some((f) => f.code === "G-16");

  it("is not flagged when the one piece open on the last day is at an exit point, and is one month either side", () => {
    // the first deposit matures on month 12 and rolls into one opened on month 13: on month 18 it is 6 months old
    expect(flagged(dep(17, 0, 12, 3))).toBe(true); // 5 months old
    expect(flagged(dep(18, 0, 12, 3))).toBe(false); // 6 months old: its second exit point
    expect(flagged(dep(19, 0, 12, 3))).toBe(true); // 7 months old
    expect(flagged(dep(18, 0, 12))).toBe(true); // the same day with no exit points
    expect(flagged(dep(18, 0, 12, 3, "deposit", "cpi"))).toBe(false);
  });

  it("is not flagged at the first exit point of the first deposit, counted from the deposit's start", () => {
    expect(flagged(dep(2, 0, 12, 3))).toBe(true);
    expect(flagged(dep(3, 0, 12, 3))).toBe(false);
    expect(flagged(dep(4, 0, 12, 3))).toBe(true);
  });

  it("is flagged when any piece open on the last day is between exit points", () => {
    // monthly deposits opened in the last year have every age from 1 to 11 months; most are not at a quarterly exit point
    expect(flagged(dep(24, 500, 12, 3))).toBe(true);
    // with an exit point every month, every piece is at one
    expect(flagged(dep(24, 500, 12, 1))).toBe(false);
    expect(flagged(dep(23, 500, 12, 1))).toBe(false);
  });

  it("counts a savings plan's exit points from each piece's own start", () => {
    // the one-off sum's first plan matures on month 36 and rolls into one opened on month 37: 12 months old on month 48
    expect(flagged(dep(47, 0, 36, 12, "savings-plan"))).toBe(true);
    expect(flagged(dep(48, 0, 36, 12, "savings-plan"))).toBe(false);
    expect(flagged(dep(49, 0, 36, 12, "savings-plan"))).toBe(true);
    // with monthly instalments, the pieces opened in the last three years are of every age, most of them between exit points
    expect(flagged(dep(48, 500, 36, 12, "savings-plan"))).toBe(true);
  });

  it("with a term that is not a multiple of the interval, counts exit points afresh in each new deposit", () => {
    // term 12, an exit point every 5 months: exit points at ages 5 and 10, maturity at 12, then 5 and 10 again in the next deposit
    expect(flagged(dep(5, 0, 12, 5))).toBe(false);
    expect(flagged(dep(10, 0, 12, 5))).toBe(false);
    expect(flagged(dep(11, 0, 12, 5))).toBe(true);
    expect(flagged(dep(12, 0, 12, 5))).toBe(false); // matured: no exit point needed
    expect(flagged(dep(15, 0, 12, 5))).toBe(true); // 3 months into the second deposit, though month 15 is a multiple of 5
    expect(flagged(dep(17, 0, 12, 5))).toBe(false); // 5 months into the second deposit
    expect(flagged(dep(22, 0, 12, 5))).toBe(false);
    expect(flagged(dep(23, 0, 12, 5))).toBe(true);
  });

  it("changes no number the run returns", () => {
    for (const i of [dep(18, 0, 12), dep(24, 500, 12), dep(48, 500, 36, undefined, "savings-plan"), dep(30, 500, 12, undefined, "deposit", "cpi")]) {
      const without = runDeposit(i, ctx);
      const withExits = runDeposit({ ...i, deposit: { ...i.deposit, exitEveryMonths: 3 } }, ctx);
      const { flags: _a, ...a } = without;
      const { flags: _b, ...b } = withExits;
      expect(b).toEqual(a);
    }
  });
});
