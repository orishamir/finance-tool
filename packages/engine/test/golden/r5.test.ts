// Release 5 golden scenarios: S48 (revisit after a rule change, F-82) and S49 (exposure mode with entered returns
// and the loss filter, F-71), plus unit tests for F-71, and diffVersions.
// Wrapper and exposure records are minimal, schema-valid test records; no file under data/instruments/ is read.
// Filled-in inputs follow workings.md Q17: S49 holds cash as S11 (daily money-market fund, 0.16% + 0.02%) and bonds
// as S15 (open tracking fund, trustee 0.02%, 0.1% min 10, custody as S14), on the S39 goal.
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isSecurityId, type ExposureRecord, type RuleRecord, type ValueObject, type ProductId, type ProductRecord, type WrapperRecord } from "@finance-tool/schema";
import {
  buildCandidateSet,
  compareExposures,
  diffVersions,
  formulas,
  lossFilter,
  pending,
  rankCandidates,
  revisit,
  saveComparison,
  tieThreshold,
  RecordInputError,
  type CandidateInput,
  type CandidateSetInput,
  type ExposureHolding,
  type InstrumentTerms,
  type Versions,
} from "../../src/index.ts";
import { context, golden, loadRules } from "./harness.ts";
import { r2Expected, r5Expected as x } from "./expected.ts";

const parametersDir = new URL("../../../../data/parameters/", import.meta.url);
const parameters = readdirSync(parametersDir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(new URL(f, parametersDir), "utf8")) as Record<string, unknown>);
const theta = tieThreshold(parameters);

const vo = (value: number | string | boolean, unit: ValueObject["unit"], state: ValueObject["state"] = "sourced"): ValueObject => ({
  value,
  unit,
  source: { url: "docs/data-schema.md#33", title: "test record", publisher: "test", strength: state === "entered" ? "entered" : "primary" },
  checked: "2026-10-23",
  effective_from: "2026-01-01",
  effective_to: null,
  update_rule: state === "entered" ? "founder" : "fixed in regulation",
  state,
});

/** A test product: a security's id also gets what a security record carries (D6, amended 2026-10-26). */
const asProduct = (r: Omit<WrapperRecord, "id"> & { id: ProductId }): ProductRecord =>
  (isSecurityId(r.id) ? { ...r, held_as: "security", held_in: { wrapper_ids: ["brokerage-account"], rule_ids: [], text: "held in a securities account" } } : r) as ProductRecord;

/** A test record in the shape of data-schema §3.3 (as r2-compare.test.ts). */
function wrapper(id: ProductId, during: string, exit: string, over: Partial<ProductRecord> = {}): ProductRecord {
  return asProduct({
    id,
    names: { he: ["שם"], statement: [], app: [] },
    regulator: vo("CMA", "text"),
    fee_bases_allowed: ["deposit", "balance"],
    fee_caps: {},
    ceiling: null,
    deposit_side_tax: { formula: "F-33", rule_ids: [] },
    tax_during: { formula: during, rule_ids: [] },
    tax_at_exit: { formula: exit, rule_ids: [], blocked_by: [], labels: [] },
    lawful_exit: { kind: "trading_day" },
    switch_is_tax_event: vo(false, "boolean"),
    transfer_routes: [],
    eligibility: { rule_ids: [], text: "anyone" },
    protection: { rule_ids: [], text: "held in trust" },
    dimensions: {},
    tier: 1,
    open_questions: [],
    checked: "2026-10-23",
    ...over,
  });
}
const brokerage = wrapper("brokerage-account", "F-20", "F-40");
const mmfDaily = wrapper("money-market-fund-daily", "F-23", "F-40");
const kgl = wrapper("kupat-gemel-lehashkaa", "F-27", "F-44", {
  lawful_exit: { kind: "any_time" },
  ceiling: { per: "person_per_calendar_year", amount: vo(83_641, "nis", "sourced") },
});
const hishtalmut = wrapper("keren-hishtalmut", "F-27", "F-46", { lawful_exit: { kind: "after_years", years: vo(6, "years") } });
const pension = wrapper("pension-comprehensive", "F-27", "F-49", {
  deposit_side_tax: { formula: "F-30", rule_ids: [] },
  lawful_exit: { kind: "at_age", age: vo(60, "years", "sourced") },
  tax_at_exit: { formula: "F-49", rule_ids: [], blocked_by: ["G-03"], labels: [] },
});

const s14Tariff = { buy: { rate: 0.003, min: 25 }, sell: { rate: 0.003, min: 25 }, custody: { rate: 0.0015, min: 15, everyMonths: 3 } };
const s14Fund = { kind: "israeli-fund" as const, drag: { management: 0.008, variable: 0.003, trustee: 0.000085 }, halfSpread: 0.0005 };
const mmfFund = { kind: "money-market-daily" as const, drag: { management: 0.0016, trustee: 0.0002 } };
const hishtalmutTerms: InstrumentTerms = {
  fees: { deposit: 0, balance: 0.006, direct: 0.0011 },
  hishtalmut: { employment: "employee", monthlySalary: 12_000, clockStartMonth: 0 },
};
const pensionTerms: InstrumentTerms = {
  fees: { deposit: 0.01, balance: 0.0022, direct: 0 },
  insurance: { rate: 0.015 },
  pension: { employment: "employee", monthlySalary: 12_000 },
};

// ---------------------------------------------------------------- S48

describe("S48 revisit after a rule change: F-82 over S39", () => {
  const goal = { amountNow: 30_000, monthly: 2_000, horizonYears: 20, grossReturnPct: 6, inflationPct: 2.5, profile: { ageAtStart: 22, annualIncome: 144_000 } };
  const inputs: CandidateSetInput = {
    wrappers: [
      { record: brokerage, terms: { fund: s14Fund, tariff: s14Tariff } },
      { record: kgl, terms: { fees: { deposit: 0, balance: 0.008, direct: 0.001 } } },
      { record: hishtalmut, terms: hishtalmutTerms },
      { record: pension, terms: pensionTerms },
    ],
    tier2: [],
    parameters,
    goal,
    restricted: true,
  };
  const dataFiles = [{ path: "data/rules/txs-09.json", checked: "2026-10-22" }];

  const rules = loadRules();
  /** The rate's checked date as the record holds it (moved with each source check; 2026-10-25 at the time of writing). */
  const rateChecked = (rules.find((r) => r.id === "TXS-09")!.figures!.rate as ValueObject).checked;
  const ctxThen = context(rules);
  const setThen = buildCandidateSet(inputs, ctxThen);
  const rankingThen = rankCandidates(setThen.candidates, { theta, ctx: ctxThen });
  const saved = saveComparison({ inputs, set: setThen, ranking: rankingThen, ctx: ctxThen, dataFiles });

  /** Test copy of the rule base: TXS-09's rate is 30 (test only; no file is changed). */
  const changed: RuleRecord[] = structuredClone(rules).map((r) => {
    if (r.id !== "TXS-09") return r;
    const f = r.figures!.rate as ValueObject;
    return { ...r, figures: { ...r.figures, rate: { ...f, value: x.s48.rateAfter } } };
  });
  const ctxNow = context(changed);
  const bundle = { wrappers: inputs.wrappers, tier2: inputs.tier2, parameters, dataFiles };
  const rv = revisit(saved, bundle, ctxNow);

  it("saves the S39 comparison with its versions", () => {
    expect(saved.savedOn).toBe("2026-10-23");
    expect(saved.result.top).toBe("kupat-gemel-lehashkaa");
    expect(saved.rules.find((r) => r.ruleId === "TXS-09" && r.figure === "rate")).toMatchObject({ value: x.s48.rateBefore, checked: rateChecked });
    expect(saved.parameters.find((p) => p.methodId === "P-01")?.value).toBe(0.5);
    expect(saved.assumptions).toEqual([
      { id: "A-01", value: 6, state: "entered" },
      { id: "A-02", value: 2.5, state: "entered" },
    ]);
    expect(saved.data).toEqual(dataFiles);
  });

  it("reports the changed entry TXS-09 rate 25 to 30, and no other", () => {
    expect(rv.diff).toEqual([{ kind: "rule", key: "TXS-09/rate", old: x.s48.rateBefore, new: x.s48.rateAfter, oldChecked: rateChecked, newChecked: rateChecked }]);
  });

  it("changes the brokerage value and nothing else", () => {
    const g = golden("S48");
    const b = (set: typeof rv.set) => set.candidates.find((c) => c.id === "brokerage-account")!.run!;
    g.value("brokerage real before", b(setThen).real, x.s48.brokerageRealBefore);
    g.value("brokerage nominal before", b(setThen).nominal, x.s48.brokerageNominalBefore);
    g.value("brokerage real after", b(rv.set).real, x.s48.brokerageRealAfter);
    g.value("brokerage nominal after", b(rv.set).nominal, x.s48.brokerageNominalAfter);
    g.done();
    expect(rv.after.entries.find((e) => e.id === "kupat-gemel-lehashkaa")!.real).toBeCloseTo(x.s48.kglReal, 2);
    expect(x.s48.brokerageRealBefore).toBe(r2Expected.s39.brokerageReal);
    expect(rv.valueChanges.map((c) => c.id)).toEqual(["brokerage-account"]);
    expect(rv.valueChanges[0]).toMatchObject({ before: { real: expect.closeTo(x.s48.brokerageRealBefore, 1) }, after: { real: expect.closeTo(x.s48.brokerageRealAfter, 1) } });
  });

  it("reports the ranking unchanged: the kupat gemel lehashkaa first, not a tie", () => {
    expect(rv.unchanged).toBe(true);
    expect(rv.topUnchanged && rv.tieSetUnchanged).toBe(true);
    expect(rv.after.top).toBe("kupat-gemel-lehashkaa");
    expect(rv.after.tieSet).toEqual(["kupat-gemel-lehashkaa"]);
    expect(rv.ranking.topTwo!.gap * 100).toBeCloseTo(x.s48.gapPct, 2);
    expect(rv.ranking.topTwo!.tie).toBe(false);
  });

  it("with nothing changed, the diff is empty and nothing differs", () => {
    const same = revisit(saved, bundle, ctxThen);
    expect(same.diff).toEqual([]);
    expect(same.valueChanges).toEqual([]);
    expect(same.unchanged).toBe(true);
  });

  it("reports a changed top option when the current data reorders the ranking", () => {
    // Test only: the current fee snapshot gives the brokerage a fund with no fees and no tariff (a data file change).
    const cheaper: CandidateInput[] = inputs.wrappers.map((w) =>
      (w.record as ProductRecord).id === "brokerage-account" ? { ...w, terms: { fund: { kind: "israeli-fund" as const, drag: {} }, tariff: {} } } : w,
    );
    const r = revisit(saved, { ...bundle, wrappers: cheaper, dataFiles: [{ path: dataFiles[0]!.path, checked: "2026-11-01" }] }, ctxThen);
    expect(r.diff).toMatchObject([{ kind: "data", key: dataFiles[0]!.path, old: "2026-10-22", new: "2026-11-01" }]);
    expect(r.after.top).toBe("brokerage-account");
    expect(r.topUnchanged).toBe(false);
    expect(r.unchanged).toBe(false);
  });
});

// ---------------------------------------------------------------- S49

describe("S49 exposure mode with entered returns and the loss filter: F-71", () => {
  const exposure = (id: string, kind: ExposureRecord["kind"], cashLike: boolean, mode: "entered" | "series", wrappers: ProductId[]): ExposureRecord => ({
    id,
    names: { he: [id], en: [id] },
    kind,
    currency: "ILS",
    cash_like: cashLike,
    return_source: { mode, series: mode === "series" ? "boi-policy-rate" : null },
    variants: [],
    wrapper_ids: wrappers,
    checked: "2026-10-23",
  });
  const cash = exposure("shekel-cash", "cash_like", true, "series", ["money-market-fund-daily"]);
  const bonds = exposure("bonds", "bond_index", false, "entered", ["brokerage-account"]);
  const equity = exposure("equity", "equity_index", false, "entered", ["brokerage-account"]);

  const goal = { amountNow: 30_000, monthly: 2_000, horizonYears: 20, inflationPct: 2.5, profile: { ageAtStart: 22, annualIncome: 144_000 } };
  const acceptedFall = vo(x.s49.accepted, "pct", "entered");
  const worstFall = { bonds: vo(x.s49.worstFall.bonds, "pct", "entered"), equity: vo(x.s49.worstFall.equity, "pct", "entered") };
  const boi = vo(3.25, "pct_per_year", "sourced");
  const holdings = (over: { cash?: ValueObject | null } = {}): ExposureHolding[] => [
    { exposure: cash, wrapper: mmfDaily, terms: { fund: mmfFund, tariff: {} }, ...(over.cash === null ? {} : { grossReturn: over.cash ?? boi }) },
    {
      exposure: bonds,
      wrapper: brokerage,
      terms: { fund: { kind: "israeli-fund" as const, drag: { trustee: 0.0002 } }, tariff: { ...s14Tariff, buy: { rate: 0.001, min: 10 }, sell: { rate: 0.001, min: 10 } } },
      grossReturn: vo(3, "pct_per_year", "entered"),
    },
    { exposure: equity, wrapper: brokerage, terms: { fund: s14Fund, tariff: s14Tariff }, grossReturn: vo(6, "pct_per_year", "entered") },
  ];
  const run = (h = holdings(), lf = { worstFall, acceptedFall }) => compareExposures({ exposures: h, parameters, goal, lossFilter: lf }, context());
  const out = run();
  const by = (id: string) => out.candidates.find((c) => c.id === id)!;

  it("excludes equity by the filter (40% > 30%) and ranks cash then bonds", () => {
    expect(by("equity")).toMatchObject({ kind: "excluded", reasons: [{ code: "loss-filter", decision: "D11" }] });
    expect(by("equity").run).toBeUndefined();
    expect(out.ranking.entries.map((e) => e.id)).toEqual(["shekel-cash", "bonds"]);
    const g = golden("S49");
    g.value("cash real", out.ranking.entries[0]!.real, x.s49.cashReal);
    g.value("bonds real", out.ranking.entries[1]!.real, x.s49.bondsReal);
    g.done();
    expect(out.ranking.topTwo!.gap * 100).toBeCloseTo(x.s49.gapPct, 2);
    expect(out.ranking.topTwo!.tie).toBe(false);
    expect(out.ranking.tieSet).toEqual(["shekel-cash"]);
  });

  it("keeps cash, which has no entered worst fall, and says the filter was not evaluated for it", () => {
    expect(by("shekel-cash").kind).toBe("ranked");
    expect(by("shekel-cash").lossFilter).toMatchObject({ verdict: "not-evaluated", missing: "worst-fall" });
    expect(by("bonds").lossFilter).toMatchObject({ verdict: "kept", worstFall: 10, accepted: 30 });
  });

  it("labels every entered return as entered by you, and the cash rate as sourced", () => {
    expect(by("bonds").returnLabel).toMatchObject({ label: "entered-by-you", state: "entered", rate: { value: 3 } });
    expect(by("equity").returnLabel).toMatchObject({ label: "entered-by-you", state: "entered", rate: { value: 6 } });
    expect(by("shekel-cash").returnLabel).toMatchObject({ label: "sourced", state: "sourced", rate: { value: 3.25 } });
    for (const c of out.candidates) if (c.returnLabel!.state === "entered") expect(c.returnLabel!.label).toBe("entered-by-you");
  });

  it("accounts for every exposure record exactly once, with the five outcomes", () => {
    expect(out.coverage).toMatchObject({
      considered: 3,
      counts: { ranked: 2, excluded: 1, "not-eligible": 0, "not-evaluated": 0, "listed-not-ranked": 0 },
    });
    expect(out.coverage.notRanked.map((n) => [n.id, n.kind])).toEqual([["equity", "excluded"]]);
    expect(out.coverage.invariant.ok).toBe(true);
  });

  it("does not evaluate a cash-like exposure with no sourced series (D20), and keeps it counted", () => {
    const r = run(holdings({ cash: null }));
    expect(by("shekel-cash").kind).toBe("ranked");
    const c = r.candidates.find((x) => x.id === "shekel-cash")!;
    expect(c).toMatchObject({ kind: "not-evaluated", reasons: [{ code: "no-sourced-series", decision: "D20", detail: "boi-policy-rate" }] });
    expect(r.ranking.entries.map((e) => e.id)).toEqual(["bonds"]);
    expect(r.coverage.counts["not-evaluated"]).toBe(1);
    expect(r.coverage.invariant.ok).toBe(true);
  });

  it("does not evaluate an exposure with no entered return, no wrapper, or a wrapper its record leaves out", () => {
    const h = holdings();
    const noReturn = run([h[0]!, { ...h[1]!, grossReturn: undefined }, h[2]!]);
    expect(noReturn.candidates.find((c) => c.id === "bonds")).toMatchObject({ kind: "not-evaluated", reasons: [{ code: "missing-input" }] });
    const noWrapper = run([h[0]!, { exposure: bonds }, h[2]!]);
    expect(noWrapper.candidates.find((c) => c.id === "bonds")).toMatchObject({ kind: "not-evaluated", reasons: [{ code: "missing-input", detail: "wrapper" }] });
    const wrong = run([{ ...h[0]!, wrapper: brokerage, terms: { fund: s14Fund, tariff: s14Tariff } }, h[1]!, h[2]!]);
    expect(wrong.candidates.find((c) => c.id === "shekel-cash")).toMatchObject({ kind: "not-evaluated", reasons: [{ code: "wrapper-cannot-hold", detail: "brokerage-account" }] });
  });

  it("refuses a sourced return for an exposure that takes an entered one (D9)", () => {
    const h = holdings();
    expect(() => run([h[0]!, { ...h[1]!, grossReturn: vo(3, "pct_per_year", "sourced") }, h[2]!])).toThrow(RecordInputError);
  });

  it("runs a run that reads the cash rate (a money-market fund, a bond) at the exposure's entered return, not at P-05's cash rate", () => {
    const heldInMmf = exposure("bonds", "bond_index", false, "entered", ["money-market-fund-daily"]);
    const at = (pct: number) =>
      compareExposures(
        { exposures: [{ exposure: heldInMmf, wrapper: mmfDaily, terms: { fund: mmfFund, tariff: {} }, grossReturn: vo(pct, "pct_per_year", "entered") }], parameters, goal, lossFilter: { worstFall: {} } },
        context(),
      ).candidates[0]!.run!.real;
    expect(at(6)).toBeGreaterThan(at(3));
  });

  it("is registered", () => {
    expect(Object.keys(formulas)).toEqual(expect.arrayContaining(["F-71", "F-82"]));
    expect(pending).not.toHaveProperty("F-71");
    expect(pending).not.toHaveProperty("F-82");
  });
});

// ---------------------------------------------------------------- F-71 outcomes

describe("F-71 lossFilter", () => {
  const ids = [{ id: "a" }, { id: "b" }, { id: "c" }];
  const pct = (v: number) => vo(v, "pct", "entered");

  it("excludes when the worst fall exceeds the largest fall accepted", () => {
    const [a] = lossFilter(ids, { worstFall: { a: pct(40) }, acceptedFall: pct(30) });
    expect(a).toMatchObject({ id: "a", verdict: "excluded", worstFall: 40, accepted: 30, reason: { code: "loss-filter", decision: "D11" } });
  });

  it("keeps when the worst fall equals or is below it", () => {
    const v = lossFilter(ids, { worstFall: { a: pct(30), b: pct(10) }, acceptedFall: pct(30) });
    expect(v.slice(0, 2).map((x) => x.verdict)).toEqual(["kept", "kept"]);
  });

  it("is not evaluated without an entered worst fall, or without the largest fall accepted", () => {
    const v = lossFilter(ids, { worstFall: { a: pct(40) }, acceptedFall: pct(30) });
    expect(v[1]).toEqual({ id: "b", verdict: "not-evaluated", missing: "worst-fall" });
    const w = lossFilter(ids, { worstFall: { a: pct(40) } });
    expect(w[0]).toMatchObject({ verdict: "not-evaluated", missing: "largest-fall-accepted", worstFall: 40 });
  });

  it("takes a largest fall accepted per exposure over the common one", () => {
    const v = lossFilter(ids, { worstFall: { a: pct(40), b: pct(40) }, acceptedFall: pct(30), acceptedFallById: { a: pct(50) } });
    expect(v.slice(0, 2).map((x) => x.verdict)).toEqual(["kept", "excluded"]);
  });

  it("claims no sourced mapping: a number that is not entered, or not a percentage, stops", () => {
    expect(() => lossFilter(ids, { worstFall: { a: vo(40, "pct", "sourced") }, acceptedFall: pct(30) })).toThrow(/entered/);
    expect(() => lossFilter(ids, { worstFall: { a: vo(40, "nis", "entered") }, acceptedFall: pct(30) })).toThrow(RecordInputError);
    expect(() => lossFilter(ids, { worstFall: { a: pct(-1) }, acceptedFall: pct(30) })).toThrow(RecordInputError);
  });
});

// ---------------------------------------------------------------- diffVersions

describe("F-82 diffVersions", () => {
  const base: Versions = {
    rules: [
      { ruleId: "TXS-09", figure: "rate", value: 25, checked: "2026-10-22" },
      { ruleId: "TXK-07", figure: "rate", value: 25, checked: "2026-10-22" },
    ],
    parameters: [{ methodId: "P-01", id: "tie-threshold", value: 0.5 }],
    data: [{ path: "data/fees/psagot@2026-10-23.json", checked: "2026-10-23" }],
    assumptions: [{ id: "A-01", value: 6, state: "entered" }],
  };
  const edit = (f: (v: Versions) => void): Versions => {
    const c = structuredClone(base);
    f(c);
    return c;
  };

  it("lists a changed rule figure with old and new", () => {
    const d = diffVersions(base, edit((v) => (v.rules[0] = { ...v.rules[0]!, value: 30 })));
    expect(d).toEqual([{ kind: "rule", key: "TXS-09/rate", old: 25, new: 30, oldChecked: "2026-10-22", newChecked: "2026-10-22" }]);
  });

  it("lists a figure that is gone", () => {
    const d = diffVersions(base, edit((v) => (v.rules[1] = { ruleId: "TXK-07", figure: "rate", value: null, checked: null })));
    expect(d).toEqual([{ kind: "rule", key: "TXK-07/rate", old: 25, new: null, oldChecked: "2026-10-22", newChecked: null }]);
  });

  it("lists a changed parameter", () => {
    const d = diffVersions(base, edit((v) => (v.parameters[0] = { ...v.parameters[0]!, value: 1 })));
    expect(d).toEqual([{ kind: "parameter", key: "P-01", old: 0.5, new: 1 }]);
  });

  it("lists a data file whose checked date moved, and one that is gone", () => {
    const moved = diffVersions(base, edit((v) => (v.data[0] = { ...v.data[0]!, checked: "2026-11-01" })));
    expect(moved).toMatchObject([{ kind: "data", key: "data/fees/psagot@2026-10-23.json", old: "2026-10-23", new: "2026-11-01" }]);
    const gone = diffVersions(base, edit((v) => (v.data = [])));
    expect(gone).toMatchObject([{ kind: "data", old: "2026-10-23", new: null }]);
  });

  it("lists a changed assumption, including a change of state", () => {
    const d = diffVersions(base, edit((v) => (v.assumptions[0] = { id: "A-01", value: 6, state: "sourced" })));
    expect(d).toEqual([{ kind: "assumption", key: "A-01", old: { value: 6, state: "entered" }, new: { value: 6, state: "sourced" } }]);
  });

  it("lists nothing when nothing differs, and does not count a re-check with the same value", () => {
    expect(diffVersions(base, structuredClone(base))).toEqual([]);
    expect(diffVersions(base, edit((v) => (v.rules[0] = { ...v.rules[0]!, checked: "2026-12-01" })))).toEqual([]);
  });

  it("compares bracket schedules by value", () => {
    const a: Versions = { ...base, rules: [{ ruleId: "TXI-01", figure: "brackets", value: [{ upTo: 100, rate: 10 }, { upTo: null, rate: 20 }], checked: "2026-10-22" }] };
    const b: Versions = { ...a, rules: [{ ...a.rules[0]!, value: [{ upTo: 100, rate: 10 }, { upTo: null, rate: 21 }] }] };
    expect(diffVersions(a, structuredClone(a))).toEqual([]);
    expect(diffVersions(a, b)).toHaveLength(1);
  });
});
