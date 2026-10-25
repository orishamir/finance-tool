// Release 2 comparison golden scenarios: S39 (ranking, deciding formula, sensitivity), S40 (full coverage line),
// S41 (idle-cash preset), S50 (tie), plus the F-83 priority order and the F-81 bisection on their own.
// Wrapper records here are minimal, schema-valid test records; no file under data/instruments/ is read.
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { ValueObject, WrapperId, WrapperRecord } from "@finance-tool/schema";
import {
  buildCandidateSet,
  executeCandidate,
  enteredGoal,
  formulas,
  idleCash,
  isTie,
  pending,
  rankCandidates,
  sensitivity,
  sensitivityAxes,
  tieThreshold,
  withoutFees,
  type Candidate,
  type CandidateInput,
  type CandidateSet,
  type ComparisonGoal,
  type InstrumentTerms,
  type Tier2Instrument,
} from "../../src/index.ts";
import { context, golden } from "./harness.ts";
import { r2Expected as x, sectionText } from "./expected.ts";

const ctx = context();
const parametersDir = new URL("../../../../data/parameters/", import.meta.url);
const parameters = readdirSync(parametersDir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(new URL(f, parametersDir), "utf8")) as Record<string, unknown>);

const vo = (value: number | string | boolean, unit: ValueObject["unit"], state: ValueObject["state"] = "sourced", rule_ids?: string[]): ValueObject => ({
  value,
  unit,
  source: { url: "docs/data-schema.md#33", title: "test record", publisher: "test", strength: state === "entered" ? "entered" : "primary" },
  checked: "2026-10-23",
  effective_from: "2026-01-01",
  effective_to: null,
  update_rule: state === "entered" ? "founder" : "fixed in regulation",
  state,
  ...(rule_ids ? { rule_ids } : {}),
});
const rate = (pct: number, state: ValueObject["state"] = "sourced") => vo(pct, "pct_per_year", state);

interface WrapperOptions {
  exit?: WrapperRecord["lawful_exit"];
  ceiling?: WrapperRecord["ceiling"];
  eligibilityRules?: string[];
  blockedBy?: string[];
  depositSide?: string;
}

/** A test record in the shape of data-schema §3.3. */
function wrapper(id: WrapperId, during: string, exit: string, o: WrapperOptions = {}): WrapperRecord {
  return {
    id,
    names: { he: ["שם"], statement: [], app: [] },
    regulator: vo("CMA", "text"),
    fee_bases_allowed: ["deposit", "balance"],
    fee_caps: {},
    ceiling: o.ceiling ?? null,
    deposit_side_tax: { formula: o.depositSide ?? "F-33", rule_ids: [] },
    tax_during: { formula: during, rule_ids: [] },
    tax_at_exit: { formula: exit, rule_ids: [], blocked_by: o.blockedBy ?? [], labels: [] },
    lawful_exit: o.exit ?? { kind: "any_time" },
    switch_is_tax_event: vo(false, "boolean"),
    transfer_routes: [],
    eligibility: { rule_ids: o.eligibilityRules ?? [], text: "anyone" },
    protection: { rule_ids: [], text: "held in trust" },
    dimensions: {},
    tier: 1,
    open_questions: [],
    checked: "2026-10-23",
  };
}

const ageExit = (rules: string[]): WrapperRecord["lawful_exit"] => ({ kind: "at_age", age: vo(60, "years", "sourced", rules) });
const maturityExit: WrapperRecord["lawful_exit"] = { kind: "at_maturity" };
const records: Record<WrapperId, WrapperRecord> = {
  "current-account": wrapper("current-account", "F-26", "F-41"),
  "bank-deposit": wrapper("bank-deposit", "F-21", "F-41", { exit: maturityExit }),
  "savings-plan": wrapper("savings-plan", "F-22", "F-41", { exit: maturityExit }),
  "money-market-fund-daily": wrapper("money-market-fund-daily", "F-23", "F-40", { exit: { kind: "trading_day" } }),
  "money-market-fund-renewable": wrapper("money-market-fund-renewable", "F-23", "F-40", { exit: maturityExit }),
  makam: wrapper("makam", "F-24", "F-40", { exit: { kind: "trading_day" } }),
  "government-bond": wrapper("government-bond", "F-25", "F-40", { exit: { kind: "trading_day" } }),
  "brokerage-account": wrapper("brokerage-account", "F-20", "F-40", { exit: { kind: "trading_day" } }),
  "kupat-gemel-lehashkaa": wrapper("kupat-gemel-lehashkaa", "F-27", "F-44", {
    ceiling: { per: "person_per_calendar_year", amount: vo(83_641, "nis", "sourced", ["KGL-02", "KGL-04"]) },
  }),
  "keren-hishtalmut": wrapper("keren-hishtalmut", "F-27", "F-46", { exit: { kind: "after_years", years: vo(6, "years", "sourced", ["TXH-09"]) } }),
  "pension-comprehensive": wrapper("pension-comprehensive", "F-27", "F-49", { depositSide: "F-30", exit: ageExit(["PEN-26"]), blockedBy: ["G-03"] }),
  "pension-general": wrapper("pension-general", "F-27", "F-49", { depositSide: "F-30", exit: ageExit(["PEN-26"]), blockedBy: ["G-03"] }),
  "provident-for-annuity": wrapper("provident-for-annuity", "F-27", "F-49", {
    depositSide: "F-30",
    exit: ageExit(["PEN-34", "PEN-26"]),
    blockedBy: ["G-03"],
  }),
  "child-savings-provident": wrapper("child-savings-provident", "F-54", "F-50", { eligibilityRules: ["CS-02", "CS-04", "CS-16"], exit: { kind: "at_child_age" } }),
  "child-savings-bank": wrapper("child-savings-bank", "F-54", "F-50", { eligibilityRules: ["CS-02", "CS-04", "CS-16"], exit: { kind: "at_child_age" } }),
  "ira-hishtalmut": wrapper("ira-hishtalmut", "F-51", "F-46", { eligibilityRules: ["IRA-25"], exit: { kind: "after_years", years: vo(6, "years") } }),
  "ira-provident": wrapper("ira-provident", "F-27", "F-48", { eligibilityRules: ["IRA-25"], exit: ageExit(["PEN-26"]), blockedBy: ["G-03", "G-06"] }),
};

// Terms from the earlier examples (scenarios.md S01, S08, S11, S14, S20, S23, S24, S40 step 0).
const s14Fund = { kind: "israeli-fund" as const, drag: { management: 0.008, variable: 0.003, trustee: 0.000085 }, halfSpread: 0.0005 };
const s14Tariff = {
  buy: { rate: 0.003, min: 25 },
  sell: { rate: 0.003, min: 25 },
  custody: { rate: 0.0015, min: 15, everyMonths: 3 },
};
const mmfFund = { kind: "money-market-daily" as const, drag: { management: 0.0016, trustee: 0.0002 } };
const terms = {
  kgl: { fees: { deposit: 0, balance: 0.008, direct: 0.001 } },
  hishtalmut: {
    fees: { deposit: 0, balance: 0.006, direct: 0.0011 },
    hishtalmut: { employment: "employee" as const, monthlySalary: 12_000, clockStartMonth: 0 },
  },
  // Pension terms (fixture, review 2026-10-23): the fees and A-17 of S27, the salary of the study fund above.
  pension: {
    fees: { deposit: 0.01, balance: 0.0022, direct: 0 },
    insurance: { rate: 0.015 },
    pension: { employment: "employee" as const, monthlySalary: 12_000 },
  },
  providentForAnnuity: {
    fees: { deposit: 0.01, balance: 0.0022, direct: 0 },
    pension: { employment: "employee" as const, monthlySalary: 12_000 },
  },
  deposit: { deposit: { termMonths: 1, linkage: "unlinked" as const } },
  mmf: { fund: mmfFund, tariff: {} },
  renewable: { fund: { kind: "money-market-renewable" as const, drag: mmfFund.drag }, tariff: {} },
  etf: { fund: s14Fund, tariff: s14Tariff },
  makam: { tariff: { buy: { rate: 0.001, min: 20 }, sell: { rate: 0.001, min: 20 } } },
  bond: {
    bond: { linkage: "unlinked" as const, couponEveryMonths: 12 },
    tariff: { buy: { rate: 0.002, min: 30 }, sell: { rate: 0.002, min: 30 }, custody: { rate: 0.001, min: 10, everyMonths: 3 } },
  },
} satisfies Record<string, InstrumentTerms>;

const input = (id: WrapperId, t?: InstrumentTerms, cashRatePct?: number): CandidateInput => ({
  record: records[id],
  ...(t ? { terms: t } : {}),
  ...(cashRatePct !== undefined ? { cashRate: rate(cashRatePct, "entered") } : {}),
});

const tier2: Tier2Instrument[] = [
  ["savings-policies", "savings policies", "TXA OQ1"],
  ["executive-insurance", "executive insurance", "TXA OQ6"],
  ["structured-deposits", "structured deposits", "TX2 OQ5"],
  ["corporate-bonds", "corporate bonds", "TX2 OQ6"],
  ["managed-portfolios", "managed and robo portfolios", "MF-28"],
  ["foreign-currency-deposits", "foreign-currency deposits", "TX2 OQ2"],
  ["reits", "REITs", "TX2 OQ8"],
  ["gold-via-funds", "gold via funds", "TX2 OQ10"],
  ["amendment-190-deposits", "Amendment 190 deposits", "TXA OQ14, TXA OQ15"],
].map(([id, name, openQuestion]) => ({ id: id!, name: name!, openQuestion: openQuestion! }));

const byId = (set: CandidateSet, id: string) => set.candidates.find((c) => c.id === id)!;
const codes = (c: Candidate) => c.reasons.map((r) => r.code);

describe("S39 wrapper mode: the founder's ETF-vs-provident case (F-80, F-81)", () => {
  const goal = { amountNow: 30_000, monthly: 2_000, horizonYears: 20, grossReturnPct: 6, inflationPct: 2.5, profile: { ageAtStart: 22, annualIncome: 144_000 } };
  const wrappers = (scale: Record<string, number> = {}): CandidateInput[] => {
    const k = (n: string) => scale[n] ?? 1;
    return [
      input("brokerage-account", {
        fund: { ...s14Fund, drag: Object.fromEntries(Object.entries(s14Fund.drag).map(([f, v]) => [f, v * k("etf fund fee")])) },
        tariff: {
          buy: { rate: 0.003 * k("trade commission"), min: 25 },
          sell: { rate: 0.003 * k("trade commission"), min: 25 },
          custody: { rate: 0.0015 * k("custody"), min: 15, everyMonths: 3 },
        },
      }),
      input("kupat-gemel-lehashkaa", { fees: { deposit: 0, balance: 0.008 * k("kgl balance fee"), direct: 0.001 * k("kgl direct expenses") } }),
      input("keren-hishtalmut", terms.hishtalmut),
      input("pension-comprehensive", terms.pension),
    ];
  };
  const compare = (g: Partial<typeof goal> = {}, scale: Record<string, number> = {}) => {
    const set = buildCandidateSet({ wrappers: wrappers(scale), tier2: [], parameters, goal: { ...goal, ...g }, restricted: true }, ctx);
    return { set, ranking: rankCandidates(set.candidates, { theta: tieThreshold(parameters), ctx }) };
  };
  const { set, ranking } = compare();

  it("ranks the kupat gemel lehashkaa above the brokerage, and is not a tie", () => {
    const g = golden("S39");
    expect(ranking.entries.map((e) => e.id)).toEqual(["kupat-gemel-lehashkaa", "brokerage-account"]);
    g.value("brokerage real", byId(set, "brokerage-account").run!.real, x.s39.brokerageReal);
    g.value("brokerage nominal", byId(set, "brokerage-account").run!.nominal, x.s39.brokerageNominal);
    g.value("kgl real", ranking.entries[0]!.real, x.s39.kglReal);
    g.value("kgl real, 15% nominal alternative", byId(set, "kupat-gemel-lehashkaa").run!.detail.altReal, x.s39.kglAltReal);
    g.done();
    expect(ranking.topTwo!.gap * 100).toBeCloseTo(x.s39.gapPct, 2);
    expect(ranking.topTwo!.tie).toBe(false);
    expect(ranking.tieSet).toEqual(["kupat-gemel-lehashkaa"]);
    expect(ranking.theta).toBe(0.005);
  });

  it("names fee drag as the deciding formula, by re-running both without fees", () => {
    const d = ranking.topTwo!.deciding;
    const g = golden("S39");
    g.value("brokerage fee drag", d.second.feeDrag, x.s39.feeDragBrokerage);
    g.value("kgl fee drag", d.top.feeDrag, x.s39.feeDragKgl);
    g.value("brokerage tax at exit", d.second.taxAtExit, x.s39.taxBrokerage);
    g.value("kgl tax at exit", d.top.taxAtExit, x.s39.taxKgl);
    g.value("fee drag gap", d.gaps["fee-drag"], x.s39.feeDragGap);
    g.value("tax gap", d.gaps["tax-at-exit"], x.s39.taxGap);
    g.done();
    expect(d.formula).toBe("fee-drag");
    expect(d.gaps["deposit-side-relief"]).toBe(0);
    expect(d.gaps["lock-up"]).toBe(0);
  });

  it("lists the study fund (employee, D15) and the pension (locked, G-03), not ranked", () => {
    const h = byId(set, "keren-hishtalmut");
    expect(h.kind).toBe("listed-not-ranked");
    expect(h.reasons).toMatchObject([{ code: "employee-study-fund", decision: "D15" }]);
    const p = byId(set, "pension-comprehensive");
    expect(p.kind).toBe("listed-not-ranked");
    expect(p.reasons).toMatchObject([
      { code: "locked-to-age", ruleIds: ["PEN-26"], untilMonth: 12 * 38 },
      { code: "exit-blocked", gapIds: ["G-03"] },
    ]);
    // TODO(pension formulas): once formulas/deposit-side.ts exists, assert the "no credit on new money" reason (S39 step 4).
    expect(set.coverage).toMatchObject({ considered: 4, counts: { ranked: 2, "listed-not-ranked": 2, "not-eligible": 0, excluded: 0, "not-evaluated": 0 } });
    expect(set.coverage.invariant.ok).toBe(true);
  });

  it("finds no flip within the P-02 bounds for the guesses and each fee", () => {
    const fees = [
      { key: "etf fund fee", label: "etf fund fee" },
      { key: "custody", label: "custody" },
      { key: "trade commission", label: "trade commission" },
      { key: "kgl balance fee", label: "kgl balance fee" },
      { key: "kgl direct expenses", label: "kgl direct expenses" },
    ];
    const axes = sensitivityAxes(parameters, { current: { "A-01": 0.06, "A-02": 0.025 }, horizonYears: 20, fees });
    expect(axes.map((a) => [a.key, a.lo, a.hi])).toEqual([
      ["A-01", 0, 0.1],
      ["A-02", 0, 0.05],
      ["horizon", 18, 22],
      ...fees.map((f) => [`fee:${f.key}`, 0.5, 2]),
    ]);
    const topOf = (key: string, value: number) => {
      if (key === "A-01") return compare({ grossReturnPct: value * 100 }).ranking.top;
      if (key === "A-02") return compare({ inflationPct: value * 100 }).ranking.top;
      if (key === "horizon") return compare({ horizonYears: value }).ranking.top;
      return compare({}, { [key.slice(4)]: value }).ranking.top;
    };
    const s = sensitivity(axes, topOf);
    expect(s.baseTop).toBe("kupat-gemel-lehashkaa");
    expect(s.noFlip).toBe(true);
    expect(s.flips).toEqual([]);
    expect(s.rows.every((r) => !r.lo.flips && !r.hi.flips)).toBe(true);
    // Deterministic: the same inputs give the same panel.
    expect(sensitivity(axes, topOf)).toEqual(s);
  });
});

describe("F-81 bisection, on its own", () => {
  it("narrows to the value where the top changes, within the iteration bound", () => {
    const axes = [{ key: "A-01", label: "A-01", unit: "fraction" as const, current: 0.06, lo: 0, hi: 0.1 }];
    const topOf = (_k: string, v: number) => (v < 0.0275 ? "b" : "a");
    const s = sensitivity(axes, (k, v) => (topOf(k, v) === "a" ? "a" : "b"));
    expect(s.baseTop).toBe("a");
    expect(s.noFlip).toBe(false);
    expect(s.rows[0]!.hi.flips).toBe(false);
    expect(s.rows[0]!.lo).toMatchObject({ flips: true, topAfter: "b" });
    expect(s.flips).toHaveLength(1);
    expect(s.flips[0]).toMatchObject({ key: "A-01", side: "lo", from: 0.06 });
    expect(s.flips[0]!.to).toBeCloseTo(0.0275, 9);
    expect(s.evaluations).toBeLessThanOrEqual(1 + 2 + 40);
  });

  it("moves the horizon in whole months", () => {
    const axes = [{ key: "horizon", label: "horizon", unit: "years" as const, current: 20, lo: 18, hi: 22, step: 1 / 12 }];
    const s = sensitivity(axes, (_k, v) => (v >= 21.3 ? "b" : "a"));
    const to = s.flips[0]!.to;
    expect(Number.isInteger(to * 12)).toBe(true);
    expect(to).toBeGreaterThanOrEqual(21.3);
    expect(to - 21.3).toBeLessThan(1 / 12);
  });
});

describe("S40 wrapper mode: the founder's apartment case (F-83, F-80)", () => {
  const goal = { amountNow: 150_000, monthly: 4_000, horizonYears: 4, grossReturnPct: 5, inflationPct: 2.5, keepAvailable: { amount: 50_000 }, profile: { ageAtStart: 22 } };
  const wrappers: CandidateInput[] = [
    input("current-account", terms.deposit, 0.5),
    input("bank-deposit", terms.deposit, 3.5),
    input("savings-plan"),
    input("money-market-fund-daily", terms.mmf, 3.25),
    input("money-market-fund-renewable", terms.renewable, 3.25),
    input("makam", terms.makam, 3.9),
    input("government-bond", terms.bond, 3.75),
    input("brokerage-account", terms.etf),
    input("kupat-gemel-lehashkaa", terms.kgl),
    input("keren-hishtalmut", terms.hishtalmut),
    input("pension-comprehensive", terms.pension),
    input("pension-general", terms.pension),
    input("provident-for-annuity", terms.providentForAnnuity),
    input("child-savings-provident"),
    input("child-savings-bank"),
    input("ira-hishtalmut", { ...terms.etf, ira: { managerFee: 0.003, clockStartMonth: -72 } }),
    input("ira-provident"),
  ];
  const set = buildCandidateSet({ wrappers, tier2, parameters, goal }, ctx);
  const ranking = rankCandidates(set.candidates, { theta: tieThreshold(parameters), ctx });

  it("ranks the five options on the same money (the bond is listed, G-10)", () => {
    const g = golden("S40");
    const entry = (id: string) => ranking.entries.find((e) => e.id === id)!;
    // The engine follows the method's G-10 (accrued interest on a bond bought between coupon dates is not
    // modelled), which moves the bond's value by about 1.1% (workings S40 buys it at par plus accrued interest),
    // so the bond is a B3 case: listed, not ranked, and the ETF ranks fourth. Every other row matches the workings.
    const matching = x.s40.ranked.filter((r) => r.id !== "government-bond");
    for (const r of matching) {
      g.value(`${r.id} real`, entry(r.id).real, r.real);
      g.value(`${r.id} nominal`, entry(r.id).nominal, r.nominal);
    }
    g.value("paid in by the compared money", byId(set, "makam").run!.paidIn, x.s40.paid);
    g.done();
    expect(ranking.entries.map((e) => e.id)).toEqual([
      "makam",
      "bank-deposit",
      "money-market-fund-daily",
      "brokerage-account",
      "current-account",
    ]);
    expect(ranking.entries.map((e) => e.rank)).toEqual([1, 2, 3, 4, 5]);
    expect(set.compared).toEqual({ amountNow: 100_000, monthly: 4_000, months: 48 });
  });

  it("lists the bond with G-10 and shows the run's value, where the engine (method G-10) and the workings differ", () => {
    const candidate = byId(set, "government-bond");
    expect(candidate.kind).toBe("listed-not-ranked");
    expect(candidate.reasons).toEqual([{ code: "gap", ruleIds: [], gapIds: ["G-10"] }]);
    expect(set.coverage.notRanked.find((n) => n.id === "government-bond")).toMatchObject({ kind: "listed-not-ranked", reasons: [{ code: "gap", gapIds: ["G-10"] }] });
    const bond = candidate.run!;
    const workings = x.s40.ranked.find((r) => r.id === "government-bond")!;
    expect(bond.flags.map((f) => f.code)).toContain("G-10");
    // Regression pin of the engine's value, not a golden value: the workings print 291,761.83.
    expect(bond.real).toBeCloseTo(295_024.12, 1);
    expect(bond.real - workings.real).toBeGreaterThan(3_000);
    expect((bond.real - workings.real) / workings.real).toBeLessThan(0.012);
  });

  it("declares the top two a tie", () => {
    expect(ranking.topTwo!.tie).toBe(true);
    // The workings print 0.11%; the makam row differs from them by 16 NIS (inside P-06), so the engine's gap is 0.12%.
    expect(ranking.topTwo!.gap * 100).toBeCloseTo(x.s40.gapPct, 1);
    // F-80 ties every option within θ of the top, so the daily fund (0.26% below, also by the workings' numbers) is in the set.
    expect(ranking.tieSet.slice(0, 3)).toEqual(["makam", "bank-deposit", "money-market-fund-daily"]);
    expect(ranking.tieSet).not.toContain("brokerage-account");
    expect(ranking.tieSet).not.toContain("current-account");
  });

  it("keeps the 50,000 that must stay available in the current account", () => {
    const k = set.keptAvailable!;
    const g = golden("S40");
    expect(k.wrapper).toBe("current-account");
    g.value("kept, nominal", k.run!.nominal, x.s40.keptNominal);
    g.value("kept, real", k.run!.real, x.s40.keptReal);
    g.done();
  });

  it("lists the kupat gemel lehashkaa because the ceiling takes only part of the money (F-05)", () => {
    const c = byId(set, "kupat-gemel-lehashkaa");
    const g = golden("S40");
    g.value("routed to the next goal", c.routed, x.s40.routed);
    g.value("value on what it takes", c.run!.nominal, x.s40.kglValueOnWhatItTakes);
    g.done();
    expect(c.kind).toBe("listed-not-ranked");
    expect(c.reasons).toMatchObject([{ code: "ceiling-partial", ruleIds: ["KGL-02", "KGL-04"] }]);
  });

  it("accounts for all 26 candidates once, with every reason code", () => {
    const text = sectionText("S40");
    const cov = set.coverage;
    expect(cov.invariant).toEqual({ ok: true, sum: 26, duplicates: [] });
    expect(cov.considered).toBe(x.s40.coverage.considered);
    // The independent check ranks the bond (it priced accrued interest); the engine lists it (G-10): ranked 5, listed 8.
    expect(cov.counts).toEqual({
      ranked: x.s40.coverage.ranked - 1,
      "listed-not-ranked": x.s40.coverage.listed + 1,
      "not-eligible": x.s40.coverage.notEligible,
      excluded: x.s40.coverage.excluded,
      "not-evaluated": x.s40.coverage.notEvaluated,
    });
    expect(text).toContain("Considered 26: ranked 6, listed, not ranked 7, not eligible 2, excluded by the person's constraint 0, not evaluated 11");
    expect(new Set(set.candidates.map((c) => c.id)).size).toBe(26);

    const reasons = (id: string) => cov.notRanked.find((n) => n.id === id)!;
    expect(reasons("savings-plan")).toMatchObject({ kind: "not-evaluated", reasons: [{ code: "missing-input" }] });
    expect(reasons("savings-plan").reasons[0]!.detail).toMatch(/instrument\.deposit is missing/);
    expect(reasons("money-market-fund-renewable")).toMatchObject({ kind: "not-evaluated", reasons: [{ code: "gap", gapIds: ["G-30"] }] });
    expect(reasons("keren-hishtalmut")).toMatchObject({
      kind: "listed-not-ranked",
      reasons: [
        { code: "employee-study-fund", decision: "D15" },
        { code: "locked-until", ruleIds: ["TXH-09"], untilMonth: 72 },
      ],
    });
    for (const id of ["pension-comprehensive", "pension-general"]) {
      expect(reasons(id)).toMatchObject({ kind: "listed-not-ranked", reasons: [{ code: "locked-to-age", ruleIds: ["PEN-26"] }, { code: "exit-blocked", gapIds: ["G-03"] }] });
    }
    expect(reasons("provident-for-annuity")).toMatchObject({ kind: "listed-not-ranked", reasons: [{ code: "locked-to-age", ruleIds: ["PEN-34", "PEN-26"] }, { code: "exit-blocked" }] });
    for (const id of ["ira-hishtalmut", "ira-provident"]) {
      expect(reasons(id)).toMatchObject({ kind: "listed-not-ranked", reasons: [{ code: "held-as-underlying", ruleIds: ["IRA-25"] }] });
    }
    for (const id of ["child-savings-provident", "child-savings-bank"]) {
      expect(reasons(id)).toMatchObject({ kind: "not-eligible", reasons: [{ code: "not-own-money", ruleIds: ["CS-02", "CS-04", "CS-16"] }] });
    }
    for (const t of tier2) {
      expect(reasons(t.id)).toMatchObject({ kind: "not-evaluated", name: t.name, reasons: [{ code: "tier-2", gapIds: ["G-24"], detail: t.openQuestion }] });
    }
    // Every rule and gap named in the coverage line is printed in the scenario's own reasons.
    for (const id of ["KGL-02", "KGL-04", "TXH-09", "PEN-26", "PEN-34", "IRA-25", "CS-02", "CS-04", "CS-16", "G-24", "G-30", "D15"]) {
      expect(text, id).toContain(id);
    }
    expect(cov.notRanked).toHaveLength(21);
  });

  it("applies the five outcomes in the method's priority order", () => {
    // A child-savings wrapper with no terms is not eligible, not "not evaluated" (1 before 3); with "must be
    // withdrawable at any time" the deposit is excluded before it could be not evaluated, and a locked wrapper too.
    const strict = buildCandidateSet(
      { wrappers, tier2, parameters, goal: { ...goal, mustBeWithdrawableAnytime: true } },
      ctx,
    );
    const kind = (id: string) => byId(strict, id).kind;
    expect(kind("child-savings-bank")).toBe("not-eligible");
    expect(kind("bank-deposit")).toBe("excluded");
    expect(kind("savings-plan")).toBe("excluded");
    expect(kind("money-market-fund-renewable")).toBe("excluded");
    expect(kind("keren-hishtalmut")).toBe("excluded");
    expect(kind("pension-comprehensive")).toBe("excluded");
    expect(kind("current-account")).toBe("ranked");
    expect(kind("money-market-fund-daily")).toBe("ranked");
    expect(kind("kupat-gemel-lehashkaa")).toBe("listed-not-ranked");
    expect(codes(byId(strict, "bank-deposit"))).toEqual(["not-withdrawable-any-time"]);
    expect(strict.coverage.invariant.ok).toBe(true);
    expect(strict.coverage.considered).toBe(26);
  });

  it("adds a candidate for a wrapper with no record, unless the scenario restricts the set", () => {
    const partial = buildCandidateSet({ wrappers: wrappers.slice(0, 4), tier2: [], parameters, goal }, ctx);
    expect(partial.coverage.considered).toBe(17);
    expect(byId(partial, "makam")).toMatchObject({ kind: "not-evaluated", reasons: [{ code: "missing-record" }] });
    const restricted = buildCandidateSet({ wrappers: wrappers.slice(0, 4), tier2: [], parameters, goal, restricted: true }, ctx);
    expect(restricted.coverage.considered).toBe(4);
  });

  it("refuses two inputs for one wrapper and an invalid record", () => {
    expect(() => buildCandidateSet({ wrappers: [wrappers[0]!, wrappers[0]!], tier2: [], parameters, goal, restricted: true }, ctx)).toThrow(/two inputs/);
    expect(() => buildCandidateSet({ wrappers: [{ record: { id: "makam" } }], tier2: [], parameters, goal, restricted: true }, ctx)).toThrow(/wrapper record/);
    expect(() => buildCandidateSet({ wrappers, tier2, parameters, goal: { ...goal, keepAvailable: { amount: 200_000 } } }, ctx)).toThrow(/more than the amount now/);
  });

  it("stops with the age missing rather than guess a lock-up", () => {
    const noAge = buildCandidateSet({ wrappers: [input("pension-comprehensive")], tier2: [], parameters, goal: { ...goal, profile: {} }, restricted: true }, ctx);
    expect(byId(noAge, "pension-comprehensive")).toMatchObject({ kind: "not-evaluated", reasons: [{ code: "missing-input", detail: "profile.ageAtStart" }] });
  });
});

describe("S41 idle-cash preset (F-60, F-83)", () => {
  const result = idleCash(
    {
      balance: 80_000,
      mustStayAvailable: 20_000,
      inflationPct: 3,
      parameters,
      wrappers: [
        input("current-account", terms.deposit, 0.5),
        input("bank-deposit", terms.deposit),
        input("money-market-fund-daily", terms.mmf, 3.25),
        input("makam", { tariff: {} }, 3.9),
        input("savings-plan"),
        input("money-market-fund-renewable", terms.renewable),
        input("government-bond", terms.bond),
        input("brokerage-account", terms.etf),
        input("kupat-gemel-lehashkaa", terms.kgl),
        input("keren-hishtalmut", terms.hishtalmut),
        input("pension-comprehensive"),
        input("pension-general"),
        input("provident-for-annuity"),
        input("child-savings-provident"),
        input("child-savings-bank"),
        input("ira-hishtalmut"),
        input("ira-provident"),
      ],
      tier2,
      bankAverage: rate(3.2),
      ownOffer: rate(3.6, "entered"),
      profile: { ageAtStart: 22 },
    },
    ctx,
  );
  const row = (id: string) => result.rows.find((r) => r.id === id)!;

  it("gives the monthly cost of leaving 60,000 in the current account, with the three labels", () => {
    const g = golden("S41");
    g.value("amount considered", result.amount, x.s41.amount);
    g.value("bank average", row("bank-deposit:average").monthlyCost, x.s41.costs.average);
    g.value("own offer", row("bank-deposit:own-offer").monthlyCost, x.s41.costs.ownOffer);
    g.value("makam", row("makam").monthlyCost, x.s41.costs.makam);
    g.value("daily fund", row("money-market-fund-daily").monthlyCost, x.s41.costs.fund);
    g.done();
    expect(result.rows.map((r) => r.id)).toEqual(["bank-deposit:average", "bank-deposit:own-offer", "makam", "money-market-fund-daily"]);
    expect(row("bank-deposit:average").label).toBe("average-paid-last-month");
    expect(row("bank-deposit:own-offer").label).toBe("entered-by-you");
    expect(row("makam").notes).toEqual(["no-commission-given"]);
    expect(row("money-market-fund-daily").notes).toEqual(["one-year-hold"]);
    expect(row("money-market-fund-daily").run.labels).toContainEqual({ code: "proxy", ruleId: "MF-34" });
    expect(result.baseline.wrapper).toBe("current-account");
  });

  it("accounts for the 26 candidates: baseline, compared, not eligible, not evaluated (G-28, G-24)", () => {
    const cov = result.coverage;
    expect(cov.invariant).toEqual({ ok: true, sum: 26, duplicates: [] });
    expect(cov.considered).toBe(x.s41.coverage.considered);
    expect(cov.counts).toEqual({
      baseline: x.s41.coverage.baseline,
      compared: x.s41.coverage.compared,
      "not-eligible": x.s41.coverage.notEligible,
      "not-evaluated": x.s41.coverage.notEvaluated,
    });
    expect(sectionText("S41")).toContain("Considered 26: baseline 1, compared 3, not eligible 2, not evaluated 20");
    const kind = (id: string) => result.candidates.find((c) => c.id === id)!;
    expect(kind("current-account").kind).toBe("baseline");
    for (const id of ["bank-deposit", "makam", "money-market-fund-daily"]) expect(kind(id).kind).toBe("compared");
    for (const id of ["child-savings-provident", "child-savings-bank"]) {
      expect(kind(id)).toMatchObject({ kind: "not-eligible", reasons: [{ code: "not-own-money", gapIds: [] }] });
    }
    const g28 = ["savings-plan", "money-market-fund-renewable", "government-bond", "brokerage-account", "kupat-gemel-lehashkaa", "keren-hishtalmut", "pension-comprehensive", "pension-general", "provident-for-annuity", "ira-hishtalmut", "ira-provident"];
    for (const id of g28) expect(kind(id)).toMatchObject({ kind: "not-evaluated", reasons: [{ code: "idle-cash-not-run", gapIds: ["G-28"] }] });
    for (const t of tier2) expect(kind(t.id)).toMatchObject({ kind: "not-evaluated", reasons: [{ code: "tier-2", gapIds: ["G-24"] }] });
    expect(cov.notRanked).toHaveLength(22);
  });
});

describe("S50 tie (F-80, P-01)", () => {
  const entered = enteredGoal({ amountNow: 10_000, monthly: 2_000, horizonYears: 5, grossReturnPct: 6, inflationPct: 2.5 }, 10_000, 2_000, ctx.runDate);
  const bank = (commission: number): Candidate => {
    const ex = executeCandidate(
      input("brokerage-account", { fund: s14Fund, tariff: { ...s14Tariff, buy: { rate: commission, min: 25 }, sell: { rate: commission, min: 25 } } }),
      parameters,
      entered,
      {},
      ctx,
    );
    if (!ex.ok) throw new Error("run failed");
    return { id: `commission ${commission}`, tier: 1, kind: "ranked", reasons: [], plan: ex.plan, run: ex.run };
  };

  it("declares a tie when the gap is under the threshold", () => {
    const a = bank(0.003);
    const a2 = bank(0.0025);
    const ranking = rankCandidates([a, a2], { theta: tieThreshold(parameters), ctx });
    const g = golden("S50");
    g.value("bank A2", ranking.entries[0]!.real, x.s50.bankA2);
    g.value("bank A", ranking.entries[1]!.real, x.s50.bankA);
    g.done();
    expect(ranking.entries.map((e) => e.id)).toEqual(["commission 0.0025", "commission 0.003"]);
    expect(ranking.topTwo!.gap * 100).toBeCloseTo(x.s50.gapPct, 2);
    expect(ranking.topTwo!.tie).toBe(true);
    expect(ranking.tieSet).toEqual(["commission 0.0025", "commission 0.003"]);
    // At a threshold below the gap it is no tie; the threshold itself is not a tie (strict).
    expect(rankCandidates([a, a2], { theta: 0.0001, ctx }).topTwo!.tie).toBe(false);
    expect(isTie(100, 99.5, 0.005)).toBe(false);
  });
});

describe("registry", () => {
  it("computes F-60, F-80, F-81 and F-83", () => {
    for (const id of ["F-60", "F-80", "F-81", "F-83"]) {
      expect(id in formulas, id).toBe(true);
      expect(id in pending, id).toBe(false);
    }
  });

  it("removes only fees in a plan, never tax or the return", () => {
    const set = buildCandidateSet(
      { wrappers: [input("brokerage-account", terms.etf)], tier2: [], parameters, goal: { amountNow: 10_000, monthly: 0, horizonYears: 2, grossReturnPct: 5, inflationPct: 2.5 }, restricted: true },
      ctx,
    );
    const plan = byId(set, "brokerage-account").plan!;
    const bare = withoutFees(plan);
    expect(bare.run === "runSecurities" && bare.input.fund.drag).toEqual({});
    expect(bare.run === "runSecurities" && bare.input.tariff).toEqual({});
    expect(plan.run === "runSecurities" && plan.input.fund.drag?.management).toBe(0.008);
  });
});

describe("independent finance review 2026-10-23: F-83 order, the annual-return constraint, missing income", () => {
  const goal: ComparisonGoal = { amountNow: 50_000, monthly: 1_000, horizonYears: 5, grossReturnPct: 5, inflationPct: 2.5, profile: { ageAtStart: 22 } };
  const build = (wrappers: CandidateInput[], g: Partial<ComparisonGoal> = {}) =>
    buildCandidateSet({ wrappers, tier2: [], parameters, goal: { ...goal, ...g }, restricted: true }, ctx);

  it("M4: a locked-to-age wrapper whose run lacks an input is not evaluated (order 3 before 4)", () => {
    const set = build([input("pension-comprehensive")]);
    const c = byId(set, "pension-comprehensive");
    expect(c.kind).toBe("not-evaluated");
    expect(c.reasons).toMatchObject([{ code: "missing-input" }]);
    expect(c.reasons[0]!.detail).toMatch(/is missing/);
    // With its terms the same wrapper runs and is listed: locked to 60 (PEN-26) with its exit blocked (G-03).
    const withTerms = byId(build([input("pension-comprehensive", terms.pension)]), "pension-comprehensive");
    expect(withTerms.kind).toBe("listed-not-ranked");
    expect(codes(withTerms)).toEqual(["locked-to-age", "exit-blocked"]);
    expect(withTerms.run).toBeDefined();
  });

  it("M6: 'must not need an annual tax return' adds a blocked note (G-22, TXG OQ4) and filters nobody", () => {
    const wrappers = [input("current-account", terms.deposit, 0.5), input("bank-deposit", terms.deposit, 3.5), input("keren-hishtalmut", terms.hishtalmut)];
    const plain = build(wrappers);
    const set = build(wrappers, { mustNotNeedAnnualReturn: true });
    expect(set.coverage.blocked).toEqual([{ constraint: "no-annual-return", gapIds: ["G-22"], ruleIds: ["TXG-OQ4"] }]);
    expect(plain.coverage.blocked).toBeUndefined();
    expect(set.coverage.counts).toEqual(plain.coverage.counts);
    expect(set.candidates.map((c) => [c.id, c.kind])).toEqual(plain.candidates.map((c) => [c.id, c.kind]));
    expect(set.coverage.invariant.ok).toBe(true);
  });

  it("R2: a self-employed study fund without the person's income is not evaluated, missing input", () => {
    const selfEmployed = { ...terms.hishtalmut, hishtalmut: { employment: "self-employed" as const, clockStartMonth: -72 } };
    const missing = byId(build([input("keren-hishtalmut", selfEmployed)]), "keren-hishtalmut");
    expect(missing.kind).toBe("not-evaluated");
    expect(missing.reasons).toMatchObject([{ code: "missing-input", ruleIds: [] }]);
    expect(missing.reasons[0]!.detail).toMatch(/profile\.annualIncome is missing/);
    const given = byId(build([input("keren-hishtalmut", selfEmployed)], { profile: { ageAtStart: 22, annualIncome: 200_000 } }), "keren-hishtalmut");
    expect(given.kind).toBe("ranked");
  });
});
