// The representative instrument (2026-10-24): an entered fee replaces its fee in F-80 and F-81; an open minimum-amount rule keeps an option from being ranked.
import { describe, expect, it } from "vitest";
import { buildView, computeSensitivity, evaluate, feeFor, openConstraintCode, openConstraintOf, type RunGoal } from "./compare";
import { compareBundle } from "./compare.server";
import { parseOwnRates, splitOwnTerms, termsOfGoal } from "./own-rate";

const bundle = compareBundle();
// 29 years old, 22,000 a month, 40,000 now, 3,000 a month for 20 years, 7 % return, 2.5 % inflation
const goal: RunGoal = { horizonYears: 20, amountNow: 40_000, monthly: 3_000, available: 0, anytime: false, returnPct: 7, inflationPct: 2.5, age: 29, employment: "employee", salary: 22_000, pensionEmployee: 6, pensionEmployer: 6.5, insurancePct: 0.3, preset: "none", fromPreset: { horizon: false, monthly: false, available: false } };
const real = (g: RunGoal, id: string) => evaluate(bundle, g).candidates.find((c) => c.id === id)?.run?.real ?? NaN;

describe("entered fee for the representative instrument", () => {
  it("the record's 0.02 % tracker (5139282) ends within 0.5 % of the kupat gemel at 0.8 %; IBI's old 1.115 % trailed by about a tenth", () => {
    // Leumi's whole tariff stays (custody, buy and sell commission, FX), so even a fund costing nothing only ties (theta 0.5 %), it does not overtake.
    const kgl = real(goal, "kupat-gemel-lehashkaa");
    const rec = real(goal, "brokerage-account");
    const cheap = real({ ...goal, ownFees: { "brokerage-account": 0.1 } }, "brokerage-account");
    const ibiOld = real({ ...goal, ownFees: { "brokerage-account": 1.115 } }, "brokerage-account");
    const free = real({ ...goal, ownFees: { "brokerage-account": 0 } }, "brokerage-account");
    expect(kgl - ibiOld).toBeGreaterThan(0.08 * kgl);
    expect(rec).toBeGreaterThan(ibiOld + 90_000);
    expect(Math.abs(kgl - rec) / kgl).toBeLessThan(0.005);
    expect(kgl - cheap).toBeLessThan(0.02 * kgl);
    expect(Math.abs(kgl - free) / kgl).toBeLessThan(0.005);
    // the entered fee reaches the ranking: with 0 % the brokerage account is in the top tie
    expect(evaluate(bundle, { ...goal, ownFees: { "brokerage-account": 0 } }).ranking.tieSet).toContain("brokerage-account");
  });
  it("is an entered value that remembers the fee it replaced; the record's own fee is a sourced or computed one", () => {
    const w = bundle.wrappers.find((x) => x.id === "brokerage-account")!;
    const own = feeFor(w, { ownFees: { "brokerage-account": 0.1 } }, bundle.runDate)!;
    expect(own).toMatchObject({ state: "entered", value: 0.1, unit: "pct_per_year" });
    expect(own.replaces?.value).toBeCloseTo(0.02, 6); // the representative is 5139282 since 2026-10-24 (was IBI 1148162, 1.115 %)
    expect(feeFor(w, {}, bundle.runDate)?.state).not.toBe("entered");
    const out = buildView(bundle, { ...goal, ownFees: { "brokerage-account": 0.1 } });
    expect(out.kind).toBe("ok");
    if (out.kind === "ok") expect(out.ranked.find((o) => o.id === "brokerage-account")?.enteredFee?.state).toBe("entered");
  });
  it("the in-fund cost is searched below half of the record's, and the flip is given in fee terms", () => {
    const out = buildView(bundle, goal);
    expect(out.kind).toBe("ok");
    if (out.kind !== "ok") return;
    const s = computeSensitivity(bundle, goal, out.evaluated, (k, n) => `${k} ${n}`, { return: "r", inflation: "i", horizon: "h" })!;
    const row = s.rows.find((r) => r.fee?.wrapperId === "brokerage-account" && r.fee.kind === "fund")!;
    expect(row).toBeDefined();
    expect(row.fee!.loPct).toBeLessThan(0.5 * row.fee!.currentPct);
    // the representative already costs 0.02 %: no flip point is reported inside the searched range
    expect(row.fee!.currentPct).toBeCloseTo(0.02, 6);
    // the lowest cost among the fund records collected for the exposure (more records are collected over time)
    expect(row.fee!.classMinPct).toBeCloseTo(0.02, 6);
  });
});

describe("own terms store shape", () => {
  it("reads the old numbers as rates and keeps rate and fee side by side", () => {
    const stored = parseOwnRates({ g1: { "bank-deposit": 3.5, "brokerage-account": { fee: 0.1 }, x: { rate: 2, fee: 1 }, bad: { fee: 400 } } });
    expect(stored.g1).toEqual({ "bank-deposit": 3.5, "brokerage-account": { fee: 0.1 }, x: { rate: 2, fee: 1 } });
    expect(splitOwnTerms(termsOfGoal(stored.g1))).toEqual({ ownRates: { "bank-deposit": 3.5, x: 2 }, ownFees: { "brokerage-account": 0.1, x: 1 }, ownProviders: {} });
  });
});

describe("an open minimum-amount rule", () => {
  it("shows the option without a rank, with the open question as the reason", () => {
    const r = openConstraintOf({ dimensions: { minimum: "blocked:GOV-OQ7" } } as never)!;
    expect(r).toMatchObject({ code: "rule-open" });
    expect(openConstraintCode(r)).toBe("GOV OQ7");
    expect(openConstraintOf({ dimensions: { minimum: "covered" } } as never)).toBeNull();
  });
  it("government bonds and makam are listed, not ranked, on the page and on the goal", () => {
    const ev = evaluate(bundle, goal);
    for (const id of ["government-bond", "makam"]) {
      const c = ev.candidates.find((x) => x.id === id)!;
      expect(c.kind).toBe("listed-not-ranked");
      expect(c.reasons.some((r) => openConstraintCode(r) === "GOV OQ7")).toBe(true);
      expect(ev.ranking.entries.some((e) => e.id === id)).toBe(false);
    }
    expect(ev.coverage.invariant.ok).toBe(true);
  });
});
