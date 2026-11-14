// F-26 (2026-10-25): a current account pays its rate on the first `balanceCeiling` of the balance (BANK-09, Leumi: 10,000 NIS).
import { describe, expect, it } from "vitest";
import { pieceAtExitPoint, runDeposit, type DepositInput } from "../src/index.ts";
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
    const plan: DepositInput = { ...dep(48, 500), deposit: { kind: "savings-plan", rate: 0.03, termMonths: 36, linkage: "unlinked", interestCalc: { periodsPerYear: 1 } } };
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

// F-41: a piece's age on month m is m - startMonth + 1; it matures at age termMonths. It is at an exit point when its age is the
// first exit point's (exitFirstMonth, the record's first_after_months), or past it by a whole number of intervals
// (exitEveryMonths). Without a first the run knows no exit point. A piece at an exit point on the last day can be withdrawn
// without a break (BANK-27): the run says G-34 in place of G-16, since what an exit point pays is not in the records.
describe("G-16 and exit points", () => {
  type Exits = { first?: number; every?: number };
  const dep = (months: number, monthly: number, termMonths: number, exits: Exits = {}, kind: "deposit" | "savings-plan" = "deposit", linkage: "unlinked" | "cpi" = "unlinked", amountNow = 10_000): DepositInput => ({
    goal: { amountNow, monthly, months },
    market: { inflation: 0.02 },
    deposit: {
      kind,
      rate: 0.03,
      termMonths,
      linkage,
      // a product whose terms say it calculates interest once a year (BANK-50's m), so a term over a year runs (BANK OQ21 otherwise)
      interestCalc: { periodsPerYear: 1 },
      ...(exits.first !== undefined ? { exitFirstMonth: exits.first } : {}),
      ...(exits.every !== undefined ? { exitEveryMonths: exits.every } : {}),
    },
    profile: {},
  });
  const codes = (i: DepositInput) => runDeposit(i, ctx).flags.map((f) => f.code);
  // what the last day says of the money still inside its term: "G-16" (locked), "G-34" (at an exit point), both, or nothing
  const said = (i: DepositInput) => ["G-16", "G-34"].filter((c) => codes(i).includes(c)).join(" ");

  it("does not let money out before the first exit point, however often the exit points come after it", () => {
    // ten-year plans with yearly exit points after the tenth year: a year in is locked, not at an exit point
    expect(said(dep(12, 0, 180, { first: 120, every: 12 }))).toBe("G-16");
    expect(said(dep(12, 0, 36, { first: 24, every: 12 }))).toBe("G-16");
    expect(said(dep(24, 0, 36, { first: 24, every: 12 }))).toBe("G-34");
    expect(said(dep(120, 0, 180, { first: 120, every: 12 }))).toBe("G-34");
    expect(said(dep(132, 0, 180, { first: 120, every: 12 }))).toBe("G-34");
    expect(said(dep(126, 0, 180, { first: 120, every: 12 }))).toBe("G-16");
  });

  it("knows no exit point without the first, whatever the interval", () => {
    expect(said(dep(12, 0, 36, { every: 12 }))).toBe("G-16");
    expect(said(dep(18, 0, 12, { every: 3 }))).toBe("G-16");
    expect(said(dep(3, 0, 12, { every: 1 }))).toBe("G-16");
    // the same three runs with a first one interval after the start are at an exit point: the interval was read, and not as the first
    expect(said(dep(12, 0, 36, { first: 12, every: 12 }))).toBe("G-34");
    expect(said(dep(18, 0, 12, { first: 3, every: 3 }))).toBe("G-34");
    expect(said(dep(3, 0, 12, { first: 1, every: 1 }))).toBe("G-34");
  });

  it("with a first and no interval, knows the first exit point alone", () => {
    expect(said(dep(6, 0, 12, { first: 6 }))).toBe("G-34");
    expect(said(dep(5, 0, 12, { first: 6 }))).toBe("G-16");
    expect(said(dep(7, 0, 12, { first: 6 }))).toBe("G-16");
    expect(said(dep(12 + 6, 0, 12, { first: 6 }))).toBe("G-34"); // the first exit point of the deposit it rolled into
  });

  it("with the first equal to the interval, finds every multiple of it", () => {
    for (const age of [3, 6, 9]) expect(said(dep(age, 0, 12, { first: 3, every: 3 }))).toBe("G-34");
    for (const age of [1, 2, 4, 5, 7, 8, 10, 11]) expect(said(dep(age, 0, 12, { first: 3, every: 3 }))).toBe("G-16");
    expect(said(dep(12, 0, 12, { first: 3, every: 3 }))).toBe(""); // matured on the last day: neither
  });

  it("is exact one month either side of the first and of each later exit point", () => {
    // first after 6 months, then every 3 (Leumi's prime plan prints this pattern)
    const at = (age: number) => said(dep(age, 0, 12, { first: 6, every: 3 }));
    expect([5, 6, 7, 8, 9, 10, 11].map(at)).toEqual(["G-16", "G-34", "G-16", "G-16", "G-34", "G-16", "G-16"]);
    expect(at(3)).toBe("G-16"); // one interval after the start is no exit point when the first comes later
  });

  it("takes zero, negative and fractional months as no exit point", () => {
    expect(said(dep(6, 0, 12, { first: 0, every: 3 }))).toBe("G-16");
    expect(said(dep(6, 0, 12, { first: -3, every: 3 }))).toBe("G-16");
    expect(said(dep(3, 0, 12, { first: 1.5, every: 1.5 }))).toBe("G-16");
    expect(said(dep(6, 0, 12, { first: Number.NaN, every: 3 }))).toBe("G-16");
    // a bad interval leaves the first exit point alone
    expect(said(dep(3, 0, 12, { first: 3, every: 0 }))).toBe("G-34");
    expect(said(dep(6, 0, 12, { first: 3, every: 0 }))).toBe("G-16");
    expect(said(dep(6, 0, 12, { first: 3, every: -3 }))).toBe("G-16");
    expect(said(dep(6, 0, 12, { first: 3, every: 1.5 }))).toBe("G-16");
  });

  it("with an interval or a first longer than the term, knows only the exit points inside it", () => {
    expect(said(dep(3, 0, 12, { first: 3, every: 24 }))).toBe("G-34");
    for (const age of [4, 6, 9, 11]) expect(said(dep(age, 0, 12, { first: 3, every: 24 }))).toBe("G-16");
    for (const age of [3, 6, 11]) expect(said(dep(age, 0, 12, { first: 24, every: 3 }))).toBe("G-16");
  });

  it("raises both notes when some pieces are at an exit point and others are not", () => {
    // monthly deposits opened in the last year have every age from 1 to 12 months; only the 6-month-old one is at the exit point
    expect(said(dep(24, 500, 12, { first: 6 }))).toBe("G-16 G-34");
    // with an exit point every month from the first month, every piece is at one
    expect(said(dep(24, 500, 12, { first: 1, every: 1 }))).toBe("G-34");
  });

  it("counts a savings plan's exit points from both its start and the piece's, in every term of the plan", () => {
    // term 12, not a multiple of the interval: exit points at ages 5 and 10 of each plan
    const plan = (months: number, exits: Exits) => said(dep(months, 0, 12, exits, "savings-plan"));
    expect(plan(5, { first: 5, every: 5 })).toBe("G-34");
    expect(plan(10, { first: 5, every: 5 })).toBe("G-34");
    expect(plan(11, { first: 5, every: 5 })).toBe("G-16");
    // after the first term the sum rolls into a plan opened on month 13: on month 17 both are 5 months old, though 17 is no multiple of 5
    expect(plan(17, { first: 5, every: 5 })).toBe("G-34");
    expect(plan(22, { first: 5, every: 5 })).toBe("G-34");
    expect(plan(15, { first: 5, every: 5 })).toBe("G-16"); // month 15 is a multiple of 5, the plan's age (3) is not on an exit point
  });

  it("reads no exit point for a CPI-linked deposit or plan: the tax on leaving a linked deposit there is not in the rule base (TXI OQ14)", () => {
    // each pair: the same unlinked deposit is at its exit point (G-34); linked, it is said only to be inside its term (G-16)
    expect(said(dep(17, 0, 12, { first: 5, every: 5 }, "savings-plan", "unlinked"))).toBe("G-34");
    expect(said(dep(17, 0, 12, { first: 5, every: 5 }, "savings-plan", "cpi"))).toBe("G-16");
    expect(said(dep(24, 0, 36, { first: 24, every: 12 }, "deposit", "unlinked"))).toBe("G-34");
    expect(said(dep(24, 0, 36, { first: 24, every: 12 }, "deposit", "cpi"))).toBe("G-16");
    // and the amount is the same whichever note is raised: the exit points change no number
    const linked = dep(24, 0, 36, { first: 24, every: 12 }, "deposit", "cpi");
    const plain = runDeposit(dep(24, 0, 36, {}, "deposit", "cpi"), ctx);
    expect(runDeposit(linked, ctx).nominal).toBe(plain.nominal);
    expect(runDeposit(linked, ctx).taxDuring).toBe(plain.taxDuring);
  });

  it("does not let a plan's instalment out where only its own count is on an exit point", () => {
    // instalments from month 1: on month 7 the one paid in month 3 is 5 months old, while the plan is 7 months old
    expect(said(dep(7, 500, 12, { first: 5, every: 5 }, "deposit", "unlinked", 0))).toBe("G-16 G-34");
    expect(said(dep(7, 500, 12, { first: 5, every: 5 }, "savings-plan", "unlinked", 0))).toBe("G-16");
    // on month 10 the plan is 10 months old: the instalments 5 and 10 months old are let out, the rest are not
    expect(said(dep(10, 500, 12, { first: 5, every: 5 }, "savings-plan", "unlinked", 0))).toBe("G-16 G-34");
    // on month 17 the instalment of month 13 is 5 months old in a plan opened that month: both counts are on an exit point
    expect(said(dep(17, 500, 12, { first: 5, every: 5 }, "savings-plan", "unlinked", 0))).toBe("G-16 G-34");
    // an instalment paid in month 7 of a three-year plan with a first exit point after a year is 12 months old on month 18,
    // which is no exit point of a plan begun in month 1 and still running
    expect(said(dep(18, 500, 36, { first: 12, every: 12 }, "savings-plan", "unlinked", 0))).toBe("G-16");
    expect(said(dep(12, 0, 36, { first: 12, every: 12 }, "savings-plan"))).toBe("G-34");
  });

  it("counts a plan's instalment from the plan it was paid into, and no exit point past that plan's end", () => {
    const plan = { kind: "savings-plan" as const, termMonths: 12, exitFirstMonth: 5, exitEveryMonths: 5 };
    // inside the plan's term both counts must be on an exit point
    expect([5, 10].map((m) => pieceAtExitPoint(m, 1, plan))).toEqual([true, true]); // paid in month 1: both counts alike
    expect(pieceAtExitPoint(7, 3, plan)).toBe(false); // 5 months old, in its plan's seventh month
    expect(pieceAtExitPoint(10, 6, plan)).toBe(true); // 5 months old, in its plan's tenth month
    expect(pieceAtExitPoint(11, 7, plan)).toBe(false); // 5 months old, in its plan's eleventh month
    expect(pieceAtExitPoint(7, 3, { ...plan, kind: "deposit" })).toBe(true); // a deposit counts from its own start alone
    // paid in month 13, the first month of the next plan: 5 months old by both counts
    expect(pieceAtExitPoint(17, 13, plan)).toBe(true);
    // paid in month 8 of the plan opened on month 1: on month 17 it is 10 months old, an exit point by its own count, and its plan
    // ended on month 12. That plan's count holds it no longer; month 17 is not counted as "month 17" of a twelve-month plan, nor as
    // the fifth month of the plan opened on month 13.
    expect(pieceAtExitPoint(17, 8, plan)).toBe(true);
    expect(pieceAtExitPoint(16, 8, plan)).toBe(false); // 9 months old: no exit point by its own count, whatever the plan's
    // Bank Leumi's prime plan (36 months, first exit after 6, then every 3): paid in month 31, on month 39 it is 9 months old and
    // its plan ended on month 36
    const leumi = { kind: "savings-plan" as const, termMonths: 36, exitFirstMonth: 6, exitEveryMonths: 3 };
    expect(pieceAtExitPoint(39, 31, leumi)).toBe(true);
    expect(pieceAtExitPoint(35, 31, leumi)).toBe(false); // 5 months old
    expect(pieceAtExitPoint(18, 7, leumi)).toBe(true); // 12 months old, plan month 18: both on exit points
    expect(pieceAtExitPoint(18, 8, leumi)).toBe(false); // 11 months old
    expect(pieceAtExitPoint(15, 7, leumi)).toBe(true); // 9 months old, plan month 15
    expect(pieceAtExitPoint(12, 7, leumi)).toBe(true); // 6 months old, plan month 12
    expect(pieceAtExitPoint(12, 6, { ...leumi, exitEveryMonths: 12, exitFirstMonth: 6 })).toBe(false); // 7 months old
    expect(pieceAtExitPoint(18, 13, { ...leumi, exitEveryMonths: 12, exitFirstMonth: 6 })).toBe(true); // 6 months old, plan month 18
    expect(pieceAtExitPoint(17, 12, { ...leumi, exitEveryMonths: 12, exitFirstMonth: 6 })).toBe(false); // 6 months old, plan month 17
    // no first, no exit point; bad figures are no figures
    expect(pieceAtExitPoint(6, 1, { kind: "deposit", termMonths: 12, exitEveryMonths: 3 })).toBe(false);
    expect(pieceAtExitPoint(6, 1, { kind: "deposit", termMonths: 12, exitFirstMonth: 1.5, exitEveryMonths: 1.5 })).toBe(false);
  });

  it("reads a refund paid into the ladder at the year's end as a piece with its own count", () => {
    // a run that begins in July: the lump matures in October (month 4) and the year closes in December (month 6), when the refund of
    // the tax withheld above the low-income deduction (TXI-20) opens a piece of its own on month 7. On month 9 that piece is 3
    // months old and the piece opened by the lump's second maturity is one month old.
    const run = (exits: Exits): DepositInput => ({ ...dep(9, 0, 4, exits), goal: { amountNow: 100_000, monthly: 0, months: 9, firstMonth: 7 }, profile: { annualIncome: 30_000 } });
    expect(runDeposit(run({}), ctx).nominal).toBeGreaterThan(runDeposit({ ...run({}), profile: {} }, ctx).nominal); // there is a refund
    expect(said(run({}))).toBe("G-16");
    expect(said(run({ first: 3 }))).toBe("G-16 G-34");
    expect(said(run({ first: 1 }))).toBe("G-16 G-34"); // the one-month-old piece
    expect(said(run({ first: 2 }))).toBe("G-16"); // neither piece is two months old
  });

  it("changes no number the run returns", () => {
    const inputs = [dep(18, 0, 12), dep(24, 500, 12), dep(48, 500, 36, {}, "savings-plan"), dep(30, 500, 12, {}, "deposit", "cpi"), dep(17, 0, 12, {}, "savings-plan", "cpi")];
    const exitSets: Exits[] = [{ first: 6, every: 3 }, { first: 3, every: 3 }, { first: 5 }, { first: 1, every: 1 }];
    for (const i of inputs) {
      const { flags: _a, ...without } = runDeposit(i, ctx);
      for (const e of exitSets) {
        const { flags: _b, ...withExits } = runDeposit({ ...i, deposit: { ...i.deposit, exitFirstMonth: e.first, ...(e.every !== undefined ? { exitEveryMonths: e.every } : {}) } }, ctx);
        expect(withExits).toEqual(without);
      }
    }
    // and the exit points were read in those runs: the note differs, the numbers do not
    const [i] = inputs;
    expect(said(i!)).toBe("G-16");
    expect(said({ ...i!, deposit: { ...i!.deposit, exitFirstMonth: 6, exitEveryMonths: 3 } })).toBe("G-34");
  });
});
