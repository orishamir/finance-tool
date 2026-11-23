// F-22: a savings plan whose own terms pay every instalment out at the plan's end (Leumi's fixed-rate instalment form ss.2.1, 2.2, 2.3.1,
// 4.1, in the record's notes; the site's `planEndPlans`) matures each piece at the end of the plan it was paid into, each having earned
// from its own month to that end, where the method's convention for any other plan locks each instalment for the term from its own month
// (G-42). Values worked by hand.
import { describe, expect, it } from "vitest";
import { runDeposit, type DepositInput } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

const ctx = context(loadRules());

// 100 a month for six months into a three-month plan at 12% a year, paid at maturity: a term under a year pays rate × months/12, so a
// piece earns 1 a month
const input = (planEnd: boolean): DepositInput => ({
  goal: { amountNow: 0, monthly: 100, months: 6 },
  market: { inflation: 0 },
  deposit: { kind: "savings-plan", rate: 0.12, termMonths: 3, linkage: "unlinked", ...(planEnd ? { planEnd: true } : {}) },
  profile: {},
});

describe("F-22 a savings plan paid out at its end", () => {
  it("matures every piece at its plan's end, each earning from its own month", () => {
    const r = runDeposit(input(true), ctx);
    // the first plan (months 1 to 3): pieces of 3, 2 and 1 months, 6 of interest, 5.10 after 15% at month 3; its 305.10 rolls into the
    // second plan from month 4 and earns its 3 months, 9.153; the second plan's own pieces earn 3, 2 and 1 months, 6
    expect(r.detail.interest).toBeCloseTo(6 + 305.1 * 0.03 + 6, 9);
    // every piece is at its plan's end on the last month: nothing is priced as broken
    expect(r.flags.map((f) => f.code)).not.toContain("G-16");
  });

  it("is not the convention's lock per instalment, which matures each piece its own term after it", () => {
    const own = runDeposit(input(false), ctx);
    // the pieces of months 5 and 6 are inside their own terms on the last month and priced as if broken (G-16); at a simple rate the
    // interest comes to the same 21.153, since each shekel earns for the months it is held either way and the net interest rolled
    // forward earns the same, so the flag is what tells the two apart here
    expect(own.flags.map((f) => f.code)).toContain("G-16");
    expect(own.detail.interest).toBeCloseTo(21.153, 9);
  });
});
