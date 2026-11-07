// The representative instrument (2026-10-24): an entered fee replaces its fee in F-80 and F-81; an open minimum-amount rule keeps an option from being ranked.
import { describe, expect, it } from "vitest";
import { applyProviders, buildView, computeSensitivity, evaluate, feeFor, keepsFromRank, openConstraintCode, openConstraintOf, type RunGoal } from "./compare";
import { compareBundle } from "./compare.server";
import { parseOwnRates, splitOwnTerms, termsOfGoal } from "./own-rate";

const bundle = compareBundle();
// 29 years old, 22,000 a month, 40,000 now, 3,000 a month for 20 years, 7 % return, 2.5 % inflation
const goal: RunGoal = { horizonYears: 20, amountNow: 40_000, monthly: 3_000, available: 0, anytime: false, returnPct: 7, inflationPct: 2.5, age: 29, employment: "employee", salary: 22_000, pensionEmployee: 6, pensionEmployer: 6.5, insurancePct: 0.3, preset: "none", fromPreset: { horizon: false, monthly: false, available: false } };
const real = (g: RunGoal, id: string) => evaluate(bundle, g).candidates.find((c) => c.id === id)?.run?.real ?? NaN;

describe("entered fee for the representative instrument", () => {
  it("the record's 0.02 % tracker (5139282) ends 5 % above the kupat gemel once Harel's discount ends; IBI's old 1.115 % trails it by 5 %", () => {
    // Leumi's whole tariff stays (custody, buy and sell commission, FX). 2026-11-07 (F-80, A-19, D56): the gemel runs on Harel's 0.7 % and 0 % for
    // five years, then on the bylaws' most, 1.05 % and 4 % (at 0.7 % for all twenty years the tracker ended 0.7 % below it; at Meitav's 0.8 % a free fund tied it)
    const kgl = real(goal, "kupat-gemel-lehashkaa");
    const rec = real(goal, "brokerage-account");
    const cheap = real({ ...goal, ownFees: { "brokerage-account": 0.1 } }, "brokerage-account");
    const ibiOld = real({ ...goal, ownFees: { "brokerage-account": 1.115 } }, "brokerage-account");
    const free = real({ ...goal, ownFees: { "brokerage-account": 0 } }, "brokerage-account");
    expect(kgl - ibiOld).toBeGreaterThan(0.05 * kgl);
    expect(rec).toBeGreaterThan(ibiOld + 90_000);
    expect((rec - kgl) / kgl).toBeGreaterThan(0.045);
    expect((rec - kgl) / kgl).toBeLessThan(0.055);
    expect(cheap).toBeGreaterThan(kgl);
    expect(free).toBeGreaterThan(rec);
    expect((free - kgl) / kgl).toBeGreaterThan(0.05);
    expect((free - kgl) / kgl).toBeLessThan(0.055);
    // the entered fee reaches the ranking: on the site's pick of tariff the account leads at the fund's own fee and at IBI's old 1.115 %, and a 1.3 % fee puts the gemel first
    const picked = (g: RunGoal) => evaluate(applyProviders(bundle, g), g).ranking.entries[0]!.id;
    expect(picked(goal)).toBe("brokerage-account");
    expect(picked({ ...goal, ownFees: { "brokerage-account": 1.115 } })).toBe("brokerage-account");
    expect(picked({ ...goal, ownFees: { "brokerage-account": 1.3 } })).toBe("kupat-gemel-lehashkaa");
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
  }, 30_000); // the flip search runs many evaluations over the whole bundle; a CI runner overran the 5 s default on 2026-10-24
});

describe("own terms store shape", () => {
  it("reads the old numbers as rates and keeps rate and fee side by side", () => {
    const stored = parseOwnRates({ g1: { "bank-deposit": 3.5, "brokerage-account": { fee: 0.1 }, x: { rate: 2, fee: 1 }, bad: { fee: 400 } } });
    expect(stored.g1).toEqual({ "bank-deposit": 3.5, "brokerage-account": { fee: 0.1 }, x: { rate: 2, fee: 1 } });
    expect(splitOwnTerms(termsOfGoal(stored.g1))).toEqual({ ownRates: { "bank-deposit": 3.5, x: 2 }, ownFees: { "brokerage-account": 0.1, x: 1 }, ownProviders: {}, ownIndices: {} });
  });
});

describe("an open minimum-amount rule", () => {
  it("shows the option without a rank, with the open question as the reason", () => {
    const r = openConstraintOf({ dimensions: { minimum: "blocked:GOV-OQ7" } } as never)!;
    expect(r).toMatchObject({ code: "rule-open" });
    expect(openConstraintCode(r)).toBe("GOV OQ7");
    expect(openConstraintOf({ dimensions: { minimum: "covered" } } as never)).toBeNull();
  });
  it("only a minimum-amount or eligibility question keeps from rank; the checklist calls any other block \"blocked for\"", () => {
    expect(keepsFromRank("minimum") && keepsFromRank("eligibility")).toBe(true);
    expect(keepsFromRank("loss-offset") || keepsFromRank("tax-at-exit")).toBe(false);
  });
  it("a bare blocked mark keeps the option from being ranked too, with no question to name (third check, 2026-11-07)", () => {
    for (const d of ["minimum", "eligibility"]) {
      const r = openConstraintOf({ dimensions: { [d]: "blocked" } } as never)!;
      expect(r).toMatchObject({ code: "rule-open", detail: `${d}:` });
      expect(openConstraintCode(r)).toBeNull();
    }
  });
  it("makam is listed, not ranked, on the page and on the goal; government bonds no longer for their minimum (GOV-24, 2026-11-07)", () => {
    const ev = evaluate(bundle, goal);
    const makam = ev.candidates.find((x) => x.id === "makam")!;
    expect(makam.kind).toBe("listed-not-ranked");
    expect(makam.reasons.some((r) => openConstraintCode(r) === "GOV OQ7")).toBe(true);
    expect(ev.ranking.entries.some((e) => e.id === "makam")).toBe(false);
    // the minimum of a government bond is known in every trading phase (GOV-24), so the open question is not its reason; it stays listed for its own gap (G-10)
    const bond = ev.candidates.find((x) => x.id === "government-bond")!;
    expect(bond.reasons.some((r) => openConstraintCode(r) !== null)).toBe(false);
    expect(ev.coverage.invariant.ok).toBe(true);
  });
});
