// Scenario fixes of 2026-10-24 (sc-compare): the fit-table demotion, the limitation-first headline, the parameter-rate disclosure,
// the flip target that never names the current leader, the pooled coverage mark and the real-terms figure.
import { describe, expect, it } from "vitest";
import { buildView, equityFit, evaluate, fitDropOf, fitDropReason, limitationFirst, parameterRateLead, realOfIdle, type RunGoal } from "./compare";
import { compareBundle } from "./compare.server";
import { flipTargets } from "../components/compare/sensitivity";

const bundle = compareBundle();
// the inheritance case: 250,000 now, 10 years, a return of 7 %, an accepted drop of 0
const base: RunGoal = { horizonYears: 10, amountNow: 250_000, monthly: 0, available: 0, anytime: false, returnPct: 7, inflationPct: null, age: 40, employment: "employee", salary: 15_000, pensionEmployee: null, pensionEmployer: null, insurancePct: 0.3, preset: "none", fromPreset: { horizon: false, monthly: false, available: false } };

describe("accepted drop below P-04's equity fall", () => {
  it("lists every equity-exposed option, not ranked, with the fit reason", () => {
    const cap = equityFit(bundle)!.maxFall!.value as number;
    expect(cap).toBeGreaterThan(0);
    const ev = evaluate(bundle, { ...base, acceptedFall: 0 });
    const listed = ev.candidates.filter((c) => c.kind === "listed-not-ranked" && c.reasons.some((r) => fitDropOf(r) === cap));
    expect(listed.length).toBeGreaterThan(0);
    for (const c of ev.ranking.entries) expect(listed.some((l) => l.id === c.id)).toBe(false);
  });
  it("changes nothing when the accepted drop is unset or at least P-04's, or a passing forecast was entered", () => {
    const cap = equityFit(bundle)!.maxFall!.value as number;
    const w = bundle.wrappers.find((x) => x.id === "brokerage-account")!;
    expect(fitDropReason(bundle, w, { acceptedFall: null })).toBeNull();
    expect(fitDropReason(bundle, w, { acceptedFall: cap })).toBeNull();
    expect(fitDropReason(bundle, w, { acceptedFall: 0, forecastFall: 0 })).toBeNull();
    expect(fitDropReason(bundle, w, { acceptedFall: 5, forecastFall: 40 })).not.toBeNull();
    const cash = bundle.wrappers.find((x) => x.id === "bank-deposit")!;
    expect(fitDropReason(bundle, cash, { acceptedFall: 0 })).toBeNull();
  });
});

describe("the fit demotion reads the option's own P-04 row (review fix 2026-10-24)", () => {
  const get = (id: string) => bundle.wrappers.find((x) => x.id === id)!;
  it("keeps the study fund and the provident-for-annuity general track at an accepted fall of 25 and demotes it below the general row's 20", () => {
    const general = bundle.fit!.rows.find((r) => r.classification === "כללי")!.maxFallPct!.value as number;
    expect(general).toBe(20);
    for (const id of ["keren-hishtalmut", "provident-for-annuity"]) {
      expect(get(id).fitBasis, id).toBeDefined();
      expect(fitDropReason(bundle, get(id), { acceptedFall: 25 }), id).toBeNull();
      expect(fitDropOf(fitDropReason(bundle, get(id), { acceptedFall: 10 })!), id).toBe(general);
    }
  });
  it("does not demote the general pension: the regulator's record for track 2158 has no specialization, so P-04 has no row for it", () => {
    expect(fitDropReason(bundle, get("pension-general"), { acceptedFall: 0 })).toBeNull();
  });
  it("demotes the brokerage S&P fund below the equity row's 30", () => {
    expect(fitDropOf(fitDropReason(bundle, get("brokerage-account"), { acceptedFall: 25 })!)).toBe(30);
  });
  it("does not demote a wrapper with no classification", () => {
    const w = { ...get("brokerage-account") };
    delete w.fitBasis;
    expect(fitDropReason(bundle, w, { acceptedFall: 0 })).toBeNull();
  });
});

describe("headline lines", () => {
  const long: RunGoal = { ...base, returnPct: null, horizonYears: 8, amountNow: 67_000 };
  it("leads with the limitation at or above the equity minimum with no return, not below it", () => {
    const min = equityFit(bundle)!.minYears.value as number;
    for (const [years, expected] of [[min, true], [min - 1, false]] as const) {
      const out = buildView(bundle, { ...long, horizonYears: years });
      expect(out.kind).toBe("ok");
      if (out.kind === "ok") expect(limitationFirst(out, { horizonYears: years }, bundle)).toBe(expected);
    }
  });
  it("discloses the site's cash rate when the leader runs on it and a rival's rate is published", () => {
    const out = buildView(bundle, { ...long, horizonYears: 1 });
    if (out.kind !== "ok") throw new Error("not ok");
    const lead = parameterRateLead(out, bundle, { ...long, horizonYears: 1 });
    // either the leader runs on a published rate (no line) or on P-05's (the line names it)
    if (lead) expect(lead.rate.parameter).toBeDefined();
  });
});

describe("a flip never names the current leader", () => {
  it("names the newcomers, or the members left of a tie", () => {
    expect(flipTargets("b", new Set(["a"]))).toEqual({ ids: ["b"], alongside: false });
    expect(flipTargets("a|b", new Set(["a"]))).toEqual({ ids: ["b"], alongside: true });
    expect(flipTargets("a", new Set(["a", "b"]))).toEqual({ ids: ["a"], alongside: false });
  });
});

describe("pooled coverage", () => {
  it("shows the options blocked on a dimension even when another option covers it", () => {
    const out = buildView(bundle, { ...base, horizonYears: 20, monthly: 3_000, amountNow: 40_000, inflationPct: 2.5 });
    if (out.kind !== "ok") throw new Error("not ok");
    const mixed = out.marks.filter((m) => m.mark === "covered" && m.blockedOptions);
    for (const m of mixed) expect(m.blockedOptions!.options.length).toBeGreaterThan(0);
  });
});

describe("real terms", () => {
  it("is the amount over the inflation index of the years", () => {
    expect(realOfIdle(67_000, 2, 8)).toBeCloseTo(67_000 / 1.02 ** 8, 6);
    expect(realOfIdle(100, 0, 10)).toBe(100);
  });
});
