// The fit-table demotion (P-04): an accepted fall below an option's row keeps it from the ranking, read from the option's own row.
import { describe, expect, it } from "vitest";
import type { Reason } from "@finance-tool/engine";
import { equityFit, evaluate, fitDropReason, type RunGoal } from "./compare";
import { compareBundle } from "./compare.server";

const bundle = compareBundle();
/** The P-04 fall of a `fitDropReason`, or null for any other reason. */
const fitDropOf = (r: Pick<Reason, "code" | "detail">): number | null => {
  const m = r.code === "rule-open" && r.detail ? /^fit-drop:(.+)$/.exec(r.detail) : null;
  return m ? Number(m[1]) : null;
};
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
