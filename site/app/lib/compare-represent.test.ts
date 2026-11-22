// The representative instrument: an entered fee replaces its fee in F-80; an open minimum-amount rule keeps an option from being ranked.
import { describe, expect, it } from "vitest";
import { evaluate, openConstraintOf, type RunGoal } from "./compare";
import type { Reason } from "@finance-tool/engine";

/** The open question a reason names ("GOV-OQ7"), or null. */
const question = (r: Pick<Reason, "code" | "detail">) => (r.code === "rule-open" ? /[A-Z]+-OQ\d+/.exec(r.detail ?? "")?.[0] ?? null : null);
import { compareBundle } from "./compare.server";
import { parseOwnRates, splitOwnTerms, termsOfGoal } from "./own-rate";

const bundle = compareBundle();
const BRK = "brokerage-account";
// 29 years old, 22,000 a month, 40,000 now, 3,000 a month for 20 years, 7 % return, 2.5 % inflation
const goal: RunGoal = { horizonYears: 20, amountNow: 40_000, monthly: 3_000, available: 0, anytime: false, returnPct: 7, inflationPct: 2.5, age: 29, employment: "employee", salary: 22_000, pensionEmployee: 6, pensionEmployer: 6.5, insurancePct: 0.3, preset: "none", fromPreset: { horizon: false, monthly: false, available: false } };
const real = (g: RunGoal, id: string) => evaluate(bundle, g).candidates.find((c) => c.id === id)?.run?.real ?? NaN;

describe("entered fee for the representative instrument", () => {
  it("the record's 0.03 % tracker (5139100) ends 4.5 % above the kupat gemel once Harel's discount ends; IBI's old 1.115 % trails it by 5 %", () => {
    // Leumi's whole tariff stays (custody, buy and sell commission, FX), its monthly purchases on the regular line: its standing-order line
    // is set aside (D41). F-80, A-19, D56: the gemel runs on Harel's 0.7 % and 0 % for
    // five years, then on the bylaws' most, 1.05 % and 4 % (at 0.7 % for all twenty years the tracker ended 0.7 % below it; at Meitav's 0.8 % a free fund tied it)
    const kgl = real(goal, "kupat-gemel-lehashkaa");
    const rec = real(goal, "brokerage-account");
    const cheap = real({ ...goal, ownFees: { "brokerage-account": 0.1 } }, "brokerage-account");
    const ibiOld = real({ ...goal, ownFees: { "brokerage-account": 1.115 } }, "brokerage-account");
    const free = real({ ...goal, ownFees: { "brokerage-account": 0 } }, "brokerage-account");
    expect(kgl - ibiOld).toBeGreaterThan(0.05 * kgl);
    expect(rec).toBeGreaterThan(ibiOld + 90_000);
    expect((rec - kgl) / kgl).toBeGreaterThan(0.04);
    expect((rec - kgl) / kgl).toBeLessThan(0.05);
    expect(cheap).toBeGreaterThan(kgl);
    expect(free).toBeGreaterThan(rec);
    expect((free - kgl) / kgl).toBeGreaterThan(0.045);
    expect((free - kgl) / kgl).toBeLessThan(0.05);
  });
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
    expect(question(r)).toBe("GOV-OQ7");
    expect(openConstraintOf({ dimensions: { minimum: "covered" } } as never)).toBeNull();
  });
  it("a bare blocked mark keeps the option from being ranked too, with no question to name (third check, 2026-11-07)", () => {
    for (const d of ["minimum", "eligibility"]) {
      const r = openConstraintOf({ dimensions: { [d]: "blocked" } } as never)!;
      expect(r).toMatchObject({ code: "rule-open", detail: `${d}:` });
      expect(question(r)).toBeNull();
    }
  });
  it("makam is listed, not ranked, on the page and on the goal; government bonds no longer for their minimum (GOV-24, 2026-11-07)", () => {
    const ev = evaluate(bundle, goal);
    const makam = ev.candidates.find((x) => x.id === "makam")!;
    expect(makam.kind).toBe("listed-not-ranked");
    expect(makam.reasons.some((r) => question(r) === "GOV-OQ7")).toBe(true);
    expect(ev.ranking.entries.some((e) => e.id === "makam")).toBe(false);
    // the minimum of a government bond is known in every trading phase (GOV-24), so the open question is not its reason; it stays listed for its own gap (G-10)
    const bond = ev.candidates.find((x) => x.id === "government-bond")!;
    expect(bond.reasons.some((r) => question(r) !== null)).toBe(false);
    expect(ev.coverage.invariant.ok).toBe(true);
  });
});

describe("a representative fund whose status as a foreign-investment fund is not known (TXS-14, F-04, method §13)", async () => {
  const { buildInstrumentTerms, loadFunds } = await import("./instruments.server");
  const { loadFees, loadRules } = await import("./data.server");
  const { runTimeline } = await import("./engine");
  // a fund on a dollar index, its status set by the test: the guides and the comparison read it through the indices page's path (fundOf),
  // and run it with A-03 at its default of 0 against the plan's inflation, so the two readings of TXS OQ26 give the plan different taxes
  const rec = loadFunds().find((f) => f.exposure_id === "index-sp500" && f.domicile === "IL" && f.tax_status.il_fund_tax_track === "exempt" && f.tax_status.foreign_investment_fund);
  if (!rec?.tax_status.foreign_investment_fund) throw new Error("an exempt Israeli fund on the S&P 500 with a status is in the data");
  const withStatus = (value: string | false | null) => ({ ...rec, tax_status: { ...rec.tax_status, foreign_investment_fund: { ...rec.tax_status.foreign_investment_fund!, value, notes: "as the test sets it" } } });
  const termsOf = (value: string | false | null) => {
    const built = buildInstrumentTerms(BRK, "securities", { fund: rec.id, tariff: "leumi" }, { fees: loadFees(), funds: [withStatus(value)], deposits: [], rules: loadRules(), today: bundle.runDate });
    if (!("terms" in built)) throw new Error(built.missing.join("; "));
    return built;
  };
  const wrapper = bundle.wrappers.find((w) => w.id === BRK)!;
  const p05 = bundle.parameters.find((p) => p.method_id === "P-05")!;
  const onTerms = (terms: ReturnType<typeof termsOf>["terms"]) => ({ ...bundle, wrappers: bundle.wrappers.map((w) => (w.id === BRK ? { ...w, terms } : w)) });

  it("is run under both readings, with the index's currency as the candidate and A-03 at 0", () => {
    const { terms } = termsOf(null);
    expect(terms.fund?.principalCurrency).toBe("USD");
    expect(terms.currency).toEqual({ principalFxChange: 0 });
    expect(termsOf(false).terms.fund?.principalCurrency).toBeUndefined();
  });

  it("stops the guide's example on TXS-14 with the question, where a fund known not to be one runs on the CPI alone", () => {
    const timeline = (value: string | false | null) => {
      const { terms, feeValues } = termsOf(value);
      return runTimeline({ record: wrapper.record, p05, terms, feeValues, rules: bundle.rules, runDate: bundle.runDate }, { entered: {}, age: null });
    };
    expect(timeline(null)).toMatchObject({ kind: "blocked", ruleId: "TXS-14", question: "TXS OQ26" });
    const settled = timeline(false);
    expect(settled.kind).toBe("ok");
    if (settled.kind === "ok") expect(settled.flags).not.toContain("TXS-OQ26");
  });

  it("is not ranked in the goal comparison: not evaluated, on TXS-14 with the question", () => {
    const c = evaluate(onTerms(termsOf(null).terms), goal).candidates.find((x) => x.id === BRK)!;
    expect(c.run).toBeUndefined();
    expect(c.reasons).toEqual([expect.objectContaining({ code: "rule-open", ruleIds: ["TXS-14"], detail: "TXS OQ26" })]);
    const settled = evaluate(onTerms(termsOf(false).terms), goal).candidates.find((x) => x.id === BRK)!;
    expect(settled.run?.real).toBeGreaterThan(0);
  });
});
