// The headline's state (A3), the deposit out-of-range flag (A8), the flip filter (A7) and the count forms (A91).
import { describe, expect, it } from "vitest";
import { countForm, countPhrase, depositRangeFlag, flipIsChange, flipNamesCurrentTop, grossReturnRow, headlineState, runGoalOf } from "./compare";
import { emptyGoal, resolveGoal } from "./goal";
import { entered } from "./value";

const person = { kind: "not-evaluated", reasons: [{ code: "missing-input", ruleIds: [], gapIds: [], field: "return", fixableBy: "person" }] } as never;
const site = { kind: "not-evaluated", reasons: [{ code: "gap", ruleIds: [], gapIds: ["G-1"], fixableBy: "site" }] } as never;
const ranked = { kind: "ranked", reasons: [] } as never;

describe("headline state", () => {
  it("leads with the leader when something non-cash is ranked", () => {
    expect(headlineState({ ranked: [{ cashLike: false }, { cashLike: true }], coverageRows: [person] })).toMatchObject({ lead: "leader", ranked: 2, unevaluated: 1, fields: ["return"] });
  });
  it("leads with the cash-only line when only cash-like options rank and the person can unlock more", () => {
    expect(headlineState({ ranked: [{ cashLike: true }, { cashLike: true }], coverageRows: [ranked, person] }).lead).toBe("cash-only");
  });
  it("does not count what only the site can fix, and has no third line without fields", () => {
    const s = headlineState({ ranked: [{ cashLike: true }], coverageRows: [site] });
    expect(s).toMatchObject({ lead: "leader", unevaluated: 0, fields: [] });
  });
});

describe("deposit range flag", () => {
  const w = { id: "bank-deposit", family: "deposit", cashRange: { min: entered(1000, "nis", "2026-10-24"), max: entered(99999, "nis", "2026-10-24") } } as never;
  it("flags an amount above the range and below it, none inside", () => {
    expect(depositRangeFlag(w, { amountNow: 120000, available: 0 })).toMatchObject({ side: "above", amount: 120000 });
    expect(depositRangeFlag(w, { amountNow: 500, available: 0 })).toMatchObject({ side: "below" });
    expect(depositRangeFlag(w, { amountNow: 50000, available: 0 })).toBeNull();
    expect(depositRangeFlag(w, { amountNow: 120000, available: 30000 })).toBeNull();
  });
  it("flags a monthly deposit below the range minimum, as its own deposit (F-21)", () => {
    expect(depositRangeFlag(w, { amountNow: 50000, available: 0, monthly: 300 })).toMatchObject({ side: "below", amount: 300 });
    expect(depositRangeFlag(w, { amountNow: 0, available: 0, monthly: 300 })).toMatchObject({ side: "below", amount: 300 });
    expect(depositRangeFlag(w, { amountNow: 50000, available: 0, monthly: 2000 })).toBeNull();
    expect(depositRangeFlag(w, { amountNow: 50000, available: 0, monthly: 0 })).toBeNull();
  });
  it("is silent once the person entered a rate, or when the bundle has no range", () => {
    expect(depositRangeFlag(w, { amountNow: 120000, available: 0, ownRates: { "bank-deposit": 2.5 } })).toBeNull();
    expect(depositRangeFlag({ id: "bank-deposit", family: "deposit" } as never, { amountNow: 120000, available: 0 })).toBeNull();
  });
});

describe("flip filter, gross row, counts", () => {
  it("names the current top", () => {
    expect(flipNamesCurrentTop("a|b", new Set(["a"]))).toBe(true);
    expect(flipNamesCurrentTop("b", new Set(["a"]))).toBe(false);
  });
  it("keeps a flip that turns a sole leader into a tie, drops one that changes nothing (F-81)", () => {
    expect(flipIsChange("a|b", new Set(["a"]))).toBe(true);
    expect(flipIsChange("a", new Set(["a"]))).toBe(false);
    expect(flipIsChange("b", new Set(["a"]))).toBe(true);
    expect(flipIsChange("b|a", new Set(["a", "b"]))).toBe(false);
  });
  it("shows the gross-return row only when the rates differ", () => {
    const chip = (v: number) => ({ chips: [{ key: "cash", label: "", value: entered(v, "pct_per_year", "2026-10-24") }] }) as never;
    expect(grossReturnRow(chip(3.5), chip(3.5))).toBeNull();
    expect(grossReturnRow(chip(3.5), chip(1.8))).not.toBeNull();
  });
  it("forms counts", () => {
    const n = { one: "אחת", two: "שתיים" };
    expect(countForm(1, { one: "דורגה", other: "דורגו" }, n)).toEqual({ numeral: "אחת", word: "דורגה" });
    expect(countForm(2, { one: "דורגה", other: "דורגו" }, n).numeral).toBe("שתיים");
    expect(countForm(7, { one: "דורגה", other: "דורגו" }, n).numeral).toBeNull();
    expect(countPhrase(2, { one: "x", two: "שתי", other: "{n} y" })).toBe("שתי");
    expect(countPhrase(5, { one: "x", two: "z", other: "{n} y" })).toBe("5 y");
  });
});

describe("employment default", () => {
  it("takes employee when the person has a pension through work and entered none", () => {
    const g = emptyGoal(0);
    g.horizonYears = { value: 5, entered: true };
    g.profile.hasPension = true;
    expect(runGoalOf(g, resolveGoal(g, {}))).toMatchObject({ employment: "employee", employmentInferred: true });
    g.profile.employment = "self-employed";
    expect(runGoalOf(g, resolveGoal(g, {}))).toMatchObject({ employment: "self-employed" });
  });
});
