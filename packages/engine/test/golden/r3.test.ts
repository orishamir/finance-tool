// Release 3 golden scenarios: S42 and S43 (fee materiality, F-61, F-62 with P-03), S46 (holdings review: F-70
// fit marks, F-72 consolidation, hand-off to F-61), plus unit tests for F-68, F-70 and F-64 on small fixtures.
// S44 (provider workbench, F-63) is release 4 and is not tested here.
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { CmaPeriodFile, ValueObject, WrapperId } from "@finance-tool/schema";
import {
  classificationFit,
  consolidation,
  feeMateriality,
  feeMaterialitySeries,
  feeThresholds,
  feeVerdict,
  formulas,
  latestTracks,
  pending,
  referenceForWrapper,
  regulatorReference,
  regulatorReferenceLabel,
  trackWorkbench,
  valueOfReduction,
  withoutFeeLine,
  withFeeRate,
  feeLines,
  type CmaTrack,
  type FitTable,
  type Holding,
  type RunPlan,
} from "../../src/index.ts";
import { context, golden, loadRules } from "./harness.ts";
import { withinTolerance } from "./expected.ts";
import { r3Expected as x } from "./expected.ts";

const dataDir = new URL("../../../../data/", import.meta.url);
const readJson = (path: string) => JSON.parse(readFileSync(new URL(path, dataDir), "utf8")) as Record<string, unknown>;
const p03 = readJson("parameters/fee-verdict-thresholds.json");
const p04 = readJson("parameters/classification-fit.json") as unknown as FitTable;
const wrapperRecords = readdirSync(new URL("instruments/wrappers/", dataDir))
  .filter((f) => f.endsWith(".json"))
  .map((f) => readJson(`instruments/wrappers/${f}`));

const rules = loadRules();
const ctx = context(rules);

// ---------------------------------------------------------------- S42

/**
 * S42: the holding is a balance of 120,000 already past its 6 years (the scenario: "exempt at exit, past 6 years"),
 * with own 300 and employer 900 a month. The balance enters as benefited money (F-61, TXH-09): no deposit fee, no
 * relief, not counted as paid in. Both monthly parts sit under their benefited limits at the determining salary
 * cap (TXH-02 15,712, from the rule base): own 2.5% x 15,712 = 392.80 >= 300 (TXH-08) and employer 7.5% x 15,712 =
 * 1,178.40 >= 900 (TXH-01), so the run is exempt at exit with the rules as they are.
 */
const s42: RunPlan = {
  run: "runProvident",
  input: {
    wrapper: "keren-hishtalmut",
    goal: { amountNow: 0, monthly: 1_200, months: 120, contributions: "nominal" },
    market: { grossReturn: 0.06, inflation: 0.025 },
    fees: { deposit: 0, balance: 0.0074, direct: 0.0011 },
    // First payment 72 months before the start: TXH-09's 6 years have passed at month 0.
    hishtalmut: { employment: "employee", monthlySalary: 20_000, clockStartMonth: -72, employerMonthly: 900 },
    existingBalance: 120_000,
    profile: {},
  },
};

describe("S42 fee materiality on the founder's hishtalmut (F-61, F-62)", () => {
  const m = feeMateriality(s42, ctx);
  const cost = (line: string) => m.lines.find((l) => l.line === line)?.cost.value as number;

  it("total drag, the cost of each fee line, the interaction remainder", () => {
    const g = golden("S42");
    g.value("real with fees", m.realWithFees, x.s42.realWithFees);
    g.value("total drag", m.total.value as number, x.s42.totalDrag);
    g.value("cost of balance fee", cost("balance"), x.s42.balanceFee);
    g.value("cost of direct expenses", cost("direct"), x.s42.directExpenses);
    g.value("interaction remainder", m.interaction.value as number, x.s42.interaction);
    g.done();
    expect(m.lines.map((l) => l.line)).toEqual(["balance", "direct"]);
    expect(m.lines[0]!.cap).toMatchObject({ ruleId: "PF-06", figure: "balance_cap", rate: 0.02 });
  });

  it("returns computed value objects that name F-61 and their inputs", () => {
    for (const v of [m.total, m.interaction, ...m.lines.map((l) => l.cost)]) {
      expect(v).toMatchObject({ state: "computed", unit: "nis", computed_from: { formula: "F-61" } });
      expect(Object.keys(v.computed_from!.inputs).length).toBeGreaterThan(0);
    }
    expect(m.lines[0]!.cost.computed_from!.inputs).toMatchObject({ fee_line: "balance" });
  });

  it("value of cutting the balance fee to 0.34%", () => {
    const r = valueOfReduction(s42, "balance", 0.0034, ctx);
    const g = golden("S42");
    g.value("value of the reduction", r.value.value as number, x.s42.reduction);
    g.done();
    expect(r.value).toMatchObject({ state: "computed", computed_from: { formula: "F-61" } });
  });

  it("verdicts under P-03: the balance fee is worth negotiating (reference 0.34%), direct expenses are not (no reference)", () => {
    const balance = feeVerdict({ nis: cost("balance"), currentRate: 0.0074, totalDrag: m.total.value as number }, { rate: 0.0034 }, p03);
    expect(balance).toMatchObject({ verdict: "worth-negotiating", negotiate: true, avoid: false });
    // 17,901.59 of 20,664.79 is 87% of the drag: above negotiate_share (10%).
    expect(balance.share?.atLeastThreshold).toBe(true);
    const direct = feeVerdict({ nis: cost("direct"), currentRate: 0.0011, totalDrag: m.total.value as number }, null, p03);
    expect(direct).toMatchObject({ verdict: "not-worth-the-effort", negotiate: false });
    expect(direct.reasons).toContain("no-reference");
    // 2,587.05 of 20,664.79 is 12.5%: the share test passes while the verdict stays (no reference to negotiate with).
    expect(direct.share?.atLeastThreshold).toBe(true);
  });
});

// ---------------------------------------------------------------- S43

const s43: RunPlan = {
  run: "runSecurities",
  input: {
    goal: { amountNow: 100_000, monthly: 2_000, months: 60 },
    market: { grossReturn: 0.06, returnIn: "instrument", inflation: 0.025, fxChange: 0.01 },
    fund: { kind: "foreign-fund", domicile: "us", w8ben: true, drag: { management: 0.0003 }, halfSpread: 0.0002, distribution: { yield: 0.013, perYear: 4 } },
    tariff: {
      buy: { rate: 0.003, min: 25 },
      sell: { rate: 0.003, min: 25 },
      custody: { rate: 0.0015, everyMonths: 3 },
      fx: 0.0025,
      currency: { code: "USD", startRate: 3.107 },
    },
    broker: "israeli",
    profile: {},
  },
};

describe("S43 fee materiality on a brokerage plan (F-61)", () => {
  const m = feeMateriality(s43, ctx);
  const cost = (line: string) => m.lines.find((l) => l.line === line)?.cost.value as number;

  it("ranked fee costs, interaction remainder, total drag", () => {
    const g = golden("S43");
    g.value("custody", cost("custody"), x.s43.custody);
    g.value("trade", cost("trade"), x.s43.trade);
    g.value("fx", cost("fx"), x.s43.fx);
    g.value("fund", cost("fund"), x.s43.fund);
    g.value("spread", cost("spread"), x.s43.spread);
    g.value("interaction remainder", m.interaction.value as number, x.s43.interaction);
    g.value("total drag", m.total.value as number, x.s43.totalDrag);
    g.value("real with fees", m.realWithFees, x.s43.realWithFees);
    g.done();
    expect(m.lines.map((l) => l.line)).toEqual(["custody", "trade", "fx", "fund", "spread"]);
  });

  it("each cost is the plan with that line zeroed; lines add up with the remainder to the total", () => {
    const sum = m.lines.reduce((s, l) => s + (l.cost.value as number), 0);
    expect(sum + (m.interaction.value as number)).toBeCloseTo(m.total.value as number, 8);
    expect(feeLines(s43)).toEqual(["trade", "spread", "custody", "fund", "fx"]);
    const noFx = withoutFeeLine(s43, "fx");
    expect(noFx.run === "runSecurities" && noFx.input.tariff.fx).toBeUndefined();
    expect(noFx.run === "runSecurities" && noFx.input.tariff.custody).toBeDefined();
  });

  it("a stated rate replaces one line and keeps the rest; a line the plan lacks is an error", () => {
    const cheaper = withFeeRate(s43, "trade", 0.001);
    expect(cheaper.run === "runSecurities" && cheaper.input.tariff.buy).toEqual({ rate: 0.001, min: 25 });
    expect(valueOfReduction(s43, "custody", 0.0005, ctx).value.value as number).toBeGreaterThan(0);
    expect(() => withFeeRate(s43, "manager", 0.001)).toThrow(/manager/);
  });

  it("an alternative that removes a fee makes it worth avoiding above the avoid threshold", () => {
    const custody = feeVerdict({ nis: cost("custody"), removedByAlternative: true }, null, p03);
    expect(custody).toMatchObject({ verdict: "worth-avoiding", avoid: true, negotiate: false });
    expect(feeVerdict({ nis: cost("custody"), removedByAlternative: false }, null, p03).verdict).toBe("not-worth-the-effort");
    expect(feeVerdict({ nis: cost("spread"), removedByAlternative: true }, null, p03).verdict).toBe("not-worth-the-effort");
  });
});

describe("F-62 thresholds come from the P-03 record passed in", () => {
  const t = feeThresholds(p03);
  it("reads the three thresholds with their value objects", () => {
    expect(t).toMatchObject({ negotiateNis: 1000, avoidNis: 2500, negotiateShare: 0.1 });
    expect(t.values.negotiate_nis.state).toBe("sourced");
  });
  it("changes with the record, and refuses a record that is not P-03 or lacks a threshold", () => {
    const stricter = { ...p03, negotiate_nis: { ...(p03.negotiate_nis as object), value: 5000 } };
    expect(feeVerdict({ nis: 2000, currentRate: 0.01 }, { rate: 0.005 }, p03).verdict).toBe("worth-negotiating");
    expect(feeVerdict({ nis: 2000, currentRate: 0.01 }, { rate: 0.005 }, stricter).verdict).toBe("not-worth-the-effort");
    expect(() => feeThresholds({ ...p03, method_id: "P-04" })).toThrow(/P-03/);
    const { avoid_nis: _omit, ...missing } = p03;
    expect(() => feeThresholds(missing)).toThrow(/avoid_nis/);
  });
  it("a reference that is not below the current rate does not make a negotiation", () => {
    const v = feeVerdict({ nis: 3000, currentRate: 0.005 }, { rate: 0.005 }, p03);
    expect(v.verdict).toBe("not-worth-the-effort");
    expect(v.reasons).toContain("reference-not-below-current");
  });
  it("when both tests pass the verdict is negotiate (the method's order) and says the avoid test passed too", () => {
    const v = feeVerdict({ nis: 3000, currentRate: 0.01, removedByAlternative: true }, { rate: 0.005 }, p03);
    expect(v).toMatchObject({ verdict: "worth-negotiating", negotiate: true, avoid: true, alsoAvoid: true });
  });
});

// ---------------------------------------------------------------- S46

const providentForAnnuity = (balance: number, balanceFee: number): RunPlan => ({
  run: "runPension",
  input: {
    wrapper: "provident-for-annuity",
    // The balance is already in the fund: no deposit-side relief, no deposit fee, nothing counted as paid in.
    existingBalance: balance,
    goal: { amountNow: 0, monthly: 0, months: 180 },
    market: { grossReturn: 0.06, inflation: 0.025 },
    fees: { deposit: 0, balance: balanceFee, direct: 0 },
    insurance: { rate: 0 },
    pension: { employment: "employee" },
    profile: {},
  },
});

describe("S46 holdings review: parental kupot gemel (F-70, F-72, hand-off to F-61)", () => {
  const holdings: Holding[] = [
    { id: "A", wrapper: "provident-for-annuity", manager: "manager 1" },
    { id: "B", wrapper: "provident-for-annuity", manager: "manager 2" },
    { id: "child", wrapper: "child-savings-provident" },
  ];

  it("fit marks from the P-04 table at a 15-year horizon: כללי fits, מניות fits; the loss half is not applied", () => {
    const general = classificationFit({ specialization: "כללי", sub_specialization: "" }, 15, p04);
    const equity = classificationFit({ specialization: "מניות", sub_specialization: "" }, 15, p04);
    expect(general).toMatchObject({ formula: "F-70", mark: "fits", classification: "כללי", lossFilter: "not-applied-release-5" });
    expect(equity).toMatchObject({ mark: "fits", classification: "מניות", lossFilter: "not-applied-release-5" });
    expect(general.row?.horizon_min_years.value).toBe(5);
    expect(equity.row?.horizon_min_years.value).toBe(10);
  });

  it("consolidation: annuity fund to annuity fund is allowed under PF-17; the child-savings default check is blocked (CS-OQ10)", () => {
    const c = consolidation(holdings, { wrappers: wrapperRecords, ctx });
    expect(c.pairs).toHaveLength(1);
    expect(c.pairs[0]).toMatchObject({ a: "A", b: "B", wrapper: "provident-for-annuity", result: { kind: "allowed" } });
    const result = c.pairs[0]!.result;
    expect(result.kind === "allowed" && result.ruleIds).toContain("PF-17");
    // Barred only if a loan, attachment or started annuity applies (PF-17).
    expect(result.kind === "allowed" && result.stillBarredIf).toEqual(["loan", "attachment", "annuity-started"]);
    expect(c.childSavings).toEqual([{ holding: "child", status: "blocked", openQuestion: "CS-OQ10" }]);
  });

  it("fee cost over 15 years and the value of moving the 80,000 into the 0.6% fund", () => {
    const a = feeMateriality(providentForAnnuity(80_000, 0.009), ctx);
    const b = feeMateriality(providentForAnnuity(40_000, 0.006), ctx);
    const moved = valueOfReduction(providentForAnnuity(80_000, 0.009), "balance", 0.006, ctx);
    const g = golden("S46");
    g.value("0.9% on 80,000", a.total.value as number, x.s46.cost80);
    g.value("0.6% on 40,000", b.total.value as number, x.s46.cost40);
    g.value("moving the 80,000", moved.value.value as number, x.s46.moveValue);
    g.done();
    expect(a.run.paidIn).toBe(0);
    expect(a.run.outcome).toMatchObject({ code: "listed-not-ranked", reason: "G-03" });
    expect(a.lines).toHaveLength(1);
    expect(a.lines[0]!.cap).toMatchObject({ ruleId: "PEN-22" });
    // The only fee line is the whole drag: nothing interacts.
    expect(Math.abs(a.interaction.value as number)).toBeLessThan(1e-6);
  });
});

describe("F-72 consolidation, on its own", () => {
  const two = (wrapper: WrapperId, extra: Partial<Holding> = {}, extraB: Partial<Holding> = {}): Holding[] => [
    { id: "x", wrapper, ...extra },
    { id: "y", wrapper, ...extraB },
  ];
  const rulesOf = { wrappers: wrapperRecords, ctx };

  it("pairs only holdings of the same wrapper type, each pair once", () => {
    const hs: Holding[] = [
      { id: "1", wrapper: "kupat-gemel-lehashkaa" },
      { id: "2", wrapper: "kupat-gemel-lehashkaa" },
      { id: "3", wrapper: "kupat-gemel-lehashkaa" },
      { id: "4", wrapper: "provident-for-annuity" },
    ];
    const c = consolidation(hs, rulesOf);
    expect(c.pairs.map((p) => `${p.a}${p.b}`)).toEqual(["12", "13", "23"]);
    const r = c.pairs[0]!.result;
    expect(r.kind === "allowed" && r.ruleIds).toEqual(["PF-17", "KGL-10", "PF-19"]);
  });

  it("a loan, an attachment or a started annuity bars it, citing PF-17", () => {
    const c = consolidation(two("kupat-gemel-lehashkaa", { barriers: ["loan"] }), rulesOf);
    expect(c.pairs[0]!.result).toMatchObject({ kind: "not-allowed", ruleIds: ["PF-17"], reason: "barrier" });
  });

  it("each bar of PF-17 reg. 4 the person can state stops the transfer, citing PF-17", () => {
    const bars: [Partial<Holding>, string][] = [
      [{ loan: true }, "loan"],
      [{ attachment: true }, "attachment"],
      [{ annuityStarted: true }, "annuity-started"],
      [{ disabilityAnnuityClaimed: true }, "disability-annuity"],
      [{ memberDied: true }, "member-died"],
      [{ receivingFundClosed: true }, "receiving-fund-closed"],
      [{ appliedToComprehensivePension: true }, "applied-to-comprehensive-pension"],
    ];
    for (const [flag, code] of bars) {
      // On either holding of the pair.
      for (const pair of [two("kupat-gemel-lehashkaa", flag), two("kupat-gemel-lehashkaa", {}, flag)]) {
        const r = consolidation(pair, rulesOf).pairs[0]!.result;
        expect(r).toMatchObject({ kind: "not-allowed", ruleIds: ["PF-17"], reason: "barrier" });
        expect(r.kind === "not-allowed" && r.detail).toContain(code);
      }
    }
    // A flag set to false is not a bar; the allowed answer lists the bars the person can still state.
    const ok = consolidation(two("kupat-gemel-lehashkaa", { memberDied: false }), rulesOf).pairs[0]!.result;
    expect(ok.kind === "allowed" && ok.alsoBarredIf).toEqual(["disability-annuity", "member-died", "receiving-fund-closed", "applied-to-comprehensive-pension"]);
  });

  it("a study fund moves only when both accounts are withdrawable tax-free (PF-18)", () => {
    const old = "2018-01-15";
    const recent = "2023-06-01";
    expect(consolidation(two("keren-hishtalmut", { firstDepositDate: old }, { firstDepositDate: old }), rulesOf).pairs[0]!.result).toMatchObject({
      kind: "allowed",
    });
    const one = consolidation(two("keren-hishtalmut", { firstDepositDate: old }, { firstDepositDate: recent }), rulesOf).pairs[0]!.result;
    expect(one).toMatchObject({ kind: "allowed-separate-account", ruleIds: ["SW-39", "PF-17", "PF-18"] });
    expect(one.kind === "allowed-separate-account" && one.notLiquid.map((x) => x.holding)).toEqual(["y"]);
    expect(one.kind === "allowed-separate-account" && one.reason).toContain("separate account");
    const both = consolidation(two("keren-hishtalmut", { firstDepositDate: recent }, { firstDepositDate: recent }), rulesOf).pairs[0]!.result;
    expect(both.kind === "allowed-separate-account" && both.notLiquid).toHaveLength(2);
    // Three years at retirement age (TXH-10): 2023-06-01 to 2026-10-23 is 40 months, enough.
    const atAge = consolidation(two("keren-hishtalmut", { firstDepositDate: old }, { firstDepositDate: recent, atRetirementAge: true }), rulesOf).pairs[0]!.result;
    expect(atAge.kind).toBe("allowed");
    const exactly = consolidation(two("keren-hishtalmut", { firstDepositDate: "2020-10-23" }, { firstDepositDate: "2020-10-24" }), rulesOf).pairs[0]!.result;
    expect(exactly.kind).toBe("allowed-separate-account");
  });

  it("the study-fund liquidity test follows the wrapper, not the rule list of its route", () => {
    const stripped = (wrapperRecords as unknown as { id: string; transfer_routes: { to: string; rule_ids: string[] }[] }[]).map((r) =>
      r.id === "keren-hishtalmut" ? { ...r, transfer_routes: r.transfer_routes.map((t) => ({ ...t, rule_ids: t.rule_ids.filter((id) => id !== "PF-18") })) } : r,
    );
    const recent = "2023-06-01";
    const r = consolidation(two("keren-hishtalmut", { firstDepositDate: recent }, { firstDepositDate: recent }), { wrappers: stripped, ctx }).pairs[0]!.result;
    expect(r.kind).toBe("allowed-separate-account");
  });

  it("a partial move of a study fund is not allowed (PF-18, KH-17), even when both are liquid", () => {
    const r = consolidation(two("keren-hishtalmut", { firstDepositDate: "2018-01-15", partialMove: true }, { firstDepositDate: "2018-01-15" }), rulesOf).pairs[0]!.result;
    expect(r).toMatchObject({ kind: "not-allowed", ruleIds: ["PF-18", "KH-17"], reason: "partial-move" });
  });

  it("a study fund without a first-deposit date is missing input, not a guess", () => {
    const r = consolidation(two("keren-hishtalmut", { firstDepositDate: "2018-01-15" }), rulesOf).pairs[0]!.result;
    expect(r).toEqual({ kind: "missing-input", field: "firstDepositDate", holding: "y" });
  });

  it("a wrapper whose record names no route to itself is 'transfer rules not sourced', with the record's open questions", () => {
    const r = consolidation(two("brokerage-account"), rulesOf).pairs[0]!.result;
    expect(r.kind).toBe("transfer-rules-not-sourced");
    // BRK OQ3 closed 2026-10-25 and left the record's list (2026-10-26); BRK OQ5 (client securities if a bank fails) is still open
    expect(r.kind === "transfer-rules-not-sourced" && r.openQuestions).toContain("BRK-OQ5");
  });

  it("both child-savings wrappers are flagged blocked and never paired", () => {
    const c = consolidation(two("child-savings-bank"), rulesOf);
    expect(c.pairs).toEqual([]);
    expect(c.childSavings.map((h) => h.openQuestion)).toEqual(["CS-OQ10", "CS-OQ10"]);
  });

  it("a wrapper with no record stops with its name", () => {
    expect(() => consolidation(two("keren-hishtalmut"), { wrappers: [], ctx })).toThrow(/keren-hishtalmut/);
  });
});

// ---------------------------------------------------------------- F-70

describe("F-70 classification fit, each outcome", () => {
  const vo = (value: number | null): ValueObject => ({
    value,
    unit: "years",
    source: { url: "x", title: "x", publisher: "x", strength: "primary" },
    checked: "2026-10-23",
    effective_from: null,
    effective_to: null,
    update_rule: "founder",
    state: "sourced",
    ...(value === null ? { notes: "no upper bound" } : {}),
  });
  const row = (classification: string, min: number, max: number | null) => ({ classification, horizon_min_years: vo(min), horizon_max_years: vo(max), max_fall_pct: { ...vo(20), unit: "pct" as const } });
  const table: FitTable = { table: [row("כללי", 5, null), row("הלכה", 3, 8), row("50-60", 1, 4)] };
  const track = (specialization: string, sub = "") => ({ specialization, sub_specialization: sub });

  it("fits inside the band, including its edges", () => {
    expect(classificationFit(track("כללי"), 5, table).mark).toBe("fits");
    expect(classificationFit(track("כללי"), 40, table).mark).toBe("fits");
    expect(classificationFit(track("הלכה"), 8, table).mark).toBe("fits");
  });
  it("does not fit below the minimum or above the maximum, and still names the row it matched", () => {
    const short = classificationFit(track("כללי"), 4.9, table);
    expect(short).toMatchObject({ mark: "does-not-fit", matchedOn: "specialization", classification: "כללי" });
    expect(short.row?.horizon_min_years.value).toBe(5);
    expect(classificationFit(track("הלכה"), 9, table).mark).toBe("does-not-fit");
  });
  it("has no rule when the classification is not in the table, and says which words it looked up", () => {
    const r = classificationFit(track("עוקבי מדדים"), 10, table);
    expect(r).toMatchObject({ mark: "no-rule", classification: "עוקבי מדדים", lossFilter: "not-applied-release-5" });
    expect(r.row).toBeUndefined();
  });
  it("matches the sub-specialization before the specialization", () => {
    const r = classificationFit(track("מדרגות", "50-60"), 2, table);
    expect(r).toMatchObject({ mark: "fits", matchedOn: "sub_specialization", classification: "50-60" });
    // A sub-specialization with no row falls back to the specialization.
    expect(classificationFit(track("כללי", "other"), 6, table)).toMatchObject({ mark: "fits", matchedOn: "specialization" });
  });
  it("the real P-04 table: equity needs 10 years, general 5, anything else has no rule", () => {
    expect(classificationFit(track("מניות"), 9, p04).mark).toBe("does-not-fit");
    expect(classificationFit(track("כללי"), 5, p04).mark).toBe("fits");
    expect(classificationFit(track("מתמחים בניהול אקטיבי"), 15, p04).mark).toBe("no-rule");
  });
});

// ---------------------------------------------------------------- F-68 and F-64 fixtures

const source = { url: "https://data.gov.il/he/datasets/cma/gemelnet", title: "fixture", publisher: "CMA", strength: "primary" as const };
const fee = (value: number | null, unit: ValueObject["unit"]): ValueObject => ({
  value,
  unit,
  source,
  checked: "2026-10-23",
  effective_from: "2025-01-01",
  effective_to: "2025-12-31",
  update_rule: "market",
  state: "sourced",
  ...(value === null ? { notes: "the regulator reports no value" } : {}),
});

interface Fixture {
  id: number;
  name: string;
  company?: string;
  classification?: string;
  specialization?: string;
  sub?: string;
  mgmt: number | null;
  dep?: number | null;
  population?: string;
}

function fund(f: Fixture): CmaPeriodFile["funds"][number] {
  return {
    fund_id: f.id,
    names: { cma: [f.name] },
    managing_corporation: { name: `${f.company ?? "c1"} ltd`, legal_id: f.company ?? "c1" },
    controlling_corporation: "",
    fund_classification: f.classification ?? "קרנות השתלמות",
    target_population: f.population ?? "כלל האוכלוסיה",
    specialization: f.specialization ?? "כללי",
    sub_specialization: f.sub ?? "",
    inception_date: null,
    raw_fields: {},
    fees: { avg_annual_management_fee: fee(f.mgmt, "pct_per_year"), avg_deposit_fee: fee(f.dep === undefined ? 0 : f.dep, "pct_of_deposit") },
  };
}

function file(funds: Fixture[], period = "2026-09", dataset: CmaPeriodFile["dataset"] = "gemelnet"): CmaPeriodFile {
  return { dataset, report_period: period, source, checked: "2026-10-23", raw: { archive_key: "x", sha256: "0".repeat(64) }, funds: funds.map(fund) };
}

const classKey = { fund_classification: "קרנות השתלמות", specialization: "כללי" };

describe("F-68 regulator reference", () => {
  const funds: Fixture[] = [
    { id: 1, name: "a", mgmt: 0.2, dep: 0 },
    { id: 2, name: "b", mgmt: 0.6, dep: 0.1 },
    { id: 3, name: "c", mgmt: 1.0, dep: null },
    { id: 4, name: "d", mgmt: null, dep: 0.4 },
    { id: 5, name: "other specialization", specialization: "מניות", mgmt: 9, dep: 9 },
    { id: 6, name: "other classification", classification: "קופת גמל להשקעה", mgmt: 9, dep: 9 },
  ];
  const tracks = latestTracks([file(funds)]);

  it("mean, median and count over the class, leaving nulls out", () => {
    const r = regulatorReference(tracks, classKey);
    expect(r).toMatchObject({ formula: "F-68", period: "2026-09", tracksInClass: 4, label: regulatorReferenceLabel });
    expect(r.management.count).toBe(3);
    expect(r.management.mean.value).toBeCloseTo(0.6, 10);
    expect(r.management.median.value).toBe(0.6);
    expect(r.deposit.count).toBe(3);
    expect(r.deposit.mean.value).toBeCloseTo((0 + 0.1 + 0.4) / 3, 10);
    expect(r.deposit.median.value).toBe(0.1);
    expect(r.management.mean.unit).toBe("pct_per_year");
    expect(r.deposit.mean.unit).toBe("pct_of_deposit");
  });

  it("the median of an even count is the mean of the middle two", () => {
    const r = regulatorReference(latestTracks([file([{ id: 1, name: "a", mgmt: 0.2 }, { id: 2, name: "b", mgmt: 0.4 }, { id: 3, name: "c", mgmt: 0.9 }, { id: 4, name: "d", mgmt: 1.5 }])]), classKey);
    expect(r.management.median.value).toBeCloseTo(0.65, 10);
  });

  it("each figure is a computed value object: F-68, the class, the period and the count as inputs, and the label", () => {
    const r = regulatorReference(tracks, classKey);
    for (const v of [r.management.mean, r.management.median, r.deposit.mean, r.deposit.median]) {
      expect(v.state).toBe("computed");
      expect(v.computed_from?.formula).toBe("F-68");
      expect(v.computed_from?.inputs).toMatchObject({ fund_classification: "קרנות השתלמות", specialization: "כללי", period: "2026-09" });
      expect(v.notes).toContain("the regulator publishes no class average");
      expect(v.notes).toContain("CAT OQ2");
    }
    expect(r.management.mean.computed_from?.inputs).toMatchObject({ count: 3 });
    expect(r.management.mean.source.strength).toBe("primary");
  });

  it("a class where no track reports a fee has a null value with its reason, never a zero", () => {
    const r = regulatorReference(latestTracks([file([{ id: 1, name: "a", mgmt: null }])]), classKey);
    expect(r.management.count).toBe(0);
    expect(r.management.mean.value).toBeNull();
    expect(r.management.mean.notes).toContain("no track of this class reports");
    const none = regulatorReference(tracks, { fund_classification: "x", specialization: "y" });
    expect(none.tracksInClass).toBe(0);
    expect(none.period).toBeNull();
    expect(none.management.median.value).toBeNull();
  });

  it("uses the latest period of a dataset only", () => {
    const older = file([{ id: 1, name: "a", mgmt: 5 }], "2026-08");
    const newer = file([{ id: 1, name: "a", mgmt: 0.5 }], "2026-09");
    const r = regulatorReference(latestTracks([older, newer]), classKey);
    expect(r.period).toBe("2026-09");
    expect(r.management.mean.value).toBe(0.5);
  });

  it("funds, banks and brokers have no reference: null with the reason (D20)", () => {
    const cma = new Set<WrapperId>(["keren-hishtalmut"]);
    expect(referenceForWrapper("brokerage-account", cma, tracks, classKey)).toMatchObject({ reference: null, reason: "none-available", decision: "D20" });
    expect(referenceForWrapper("bank-deposit", cma, tracks, classKey)).toMatchObject({ reference: null });
    expect(referenceForWrapper("keren-hishtalmut", cma, tracks, classKey)).toMatchObject({ formula: "F-68" });
  });

  it("on the real 2026-09 Gemel-Net file it equals an independent count and mean", () => {
    const real = readJson("cma/gemelnet@2026-09.json") as unknown as CmaPeriodFile;
    const r = regulatorReference(latestTracks([real]), classKey);
    const values = real.funds
      .filter((f) => f.fund_classification === classKey.fund_classification && f.specialization === classKey.specialization)
      .map((f) => f.fees.avg_annual_management_fee.value)
      .filter((v): v is number => typeof v === "number");
    expect(r.management.count).toBe(values.length);
    expect(values.length).toBeGreaterThan(10);
    expect(r.management.mean.value).toBeCloseTo(values.reduce((s, v) => s + v, 0) / values.length, 10);
    // S42's reference: study-fund averages go from 0.34 to 0.74 (units not confirmed), so the class mean lies in that range.
    expect(r.management.mean.value as number).toBeGreaterThan(0.2);
    expect(r.management.mean.value as number).toBeLessThan(1);
  });
});

describe("F-64 track workbench", () => {
  const map: Record<string, WrapperId | null> = {
    "קרנות השתלמות": "keren-hishtalmut",
    "קופת גמל להשקעה": "kupat-gemel-lehashkaa",
    "מרכזית לפיצויים": null,
  };
  const funds: Fixture[] = [
    { id: 1, name: "הלכה", company: "c1", specialization: "כללי", mgmt: 0.5 },
    { id: 2, name: "הלכה", company: "c1", specialization: "כללי", mgmt: 0.6 },
    { id: 3, name: "הלכה", company: "c2", specialization: "כללי", mgmt: null, dep: null },
    { id: 4, name: "מניות", company: "c1", specialization: "מניות", mgmt: 0.8 },
    { id: 5, name: "מדד", company: "c2", specialization: "עוקבי מדדים", mgmt: 0.3 },
    { id: 6, name: "גמל", company: "c1", classification: "קופת גמל להשקעה", specialization: "כללי", mgmt: 0.4 },
    { id: 7, name: "מרכזית", company: "c1", classification: "מרכזית לפיצויים", specialization: "כללי", mgmt: 0.1 },
  ];
  const files = [file(funds)];
  const wb = trackWorkbench("keren-hishtalmut", files, { horizonYears: 7 }, p04, { classificationToWrapper: map });

  it("lists every track of the wrapper at every company, and no other wrapper's", () => {
    expect(wb.rows.map((r) => r.fundId)).toEqual([1, 2, 3, 4, 5]);
    expect(wb.periods).toEqual([{ dataset: "gemelnet", period: "2026-09" }]);
    expect(trackWorkbench("kupat-gemel-lehashkaa", files, undefined, p04, { classificationToWrapper: map }).rows.map((r) => r.fundId)).toEqual([6]);
  });

  it("each row carries both fees as given (null stays null with its notes), the class reference and the fit mark", () => {
    const r3 = wb.rows.find((r) => r.fundId === 3)!;
    expect(r3.fees.management.value).toBeNull();
    expect(r3.fees.management.notes).toContain("no value");
    expect(r3.fees.deposit.value).toBeNull();
    const r1 = wb.rows.find((r) => r.fundId === 1)!;
    expect(r1.fees.management.value).toBe(0.5);
    expect(r1.reference).toMatchObject({ formula: "F-68", class: { specialization: "כללי" }, tracksInClass: 3 });
    // The class "כללי" has fees 0.5 and 0.6 reported (id 3 is null): count 2, mean 0.55.
    expect((r1.reference as { management: { count: number } }).management.count).toBe(2);
    expect((r1.reference as { management: { mean: ValueObject } }).management.mean.value).toBeCloseTo(0.55, 10);
    // Horizon 7: כללי (min 5) fits, מניות (min 10) does not, עוקבי מדדים has no rule.
    expect(wb.rows.map((r) => r.fit?.mark)).toEqual(["fits", "fits", "fits", "does-not-fit", "no-rule"]);
  });

  it("without a goal there is no fit mark", () => {
    const none = trackWorkbench("keren-hishtalmut", files, undefined, p04, { classificationToWrapper: map });
    expect(none.rows.every((r) => r.fit === null)).toBe(true);
  });

  it("groups tracks with an identical name within one company, flags them and keeps them all", () => {
    expect(wb.groups).toEqual([{ id: "c1:הלכה", companyId: "c1", name: "הלכה", fundIds: [1, 2] }]);
    expect(wb.rows.map((r) => r.groupId)).toEqual(["c1:הלכה", "c1:הלכה", null, null, null]);
  });

  it("coverage line: considered, shown, grouped, fee not reported", () => {
    expect(wb.coverage).toEqual({
      considered: 5,
      shown: 5,
      grouped: 2,
      feeNotReported: 1,
      depositFeeNotReported: 1,
      invariant: { ok: true },
      outcomes: { "not-eligible": 0, "not-evaluated": 0, "shown-without-rule": 1, "shown-with-mark": 4 },
      split: { fits: 3, "does-not-fit": 1, "no-rule": 1, "not-eligible": 0, "no-goal": 0, "no-classification": 0 },
    });
  });

  describe("F-83 outcomes (method 2026-10-24): each track has exactly one, the counts equal the rows", () => {
    const mixed: Fixture[] = [
      { id: 1, name: "fits", specialization: "כללי", mgmt: 0.5 },
      { id: 2, name: "too short", specialization: "מניות", mgmt: 0.5 },
      { id: 3, name: "no rule", specialization: "עוקבי מדדים", mgmt: 0.5 },
      { id: 4, name: "sector", specialization: "כללי", population: "עובדי סקטור מסויים", mgmt: 0.5 },
      { id: 5, name: "employer", specialization: "כללי", population: "עובדי מפעל/גוף מסויים", mgmt: 0.5 },
      { id: 6, name: "no classification", specialization: "", sub: "", mgmt: 0.5 },
      // A sector track with no classification is still "not eligible": that comes first.
      { id: 7, name: "sector, no class", specialization: "", sub: "", population: "עובדי סקטור מסויים", mgmt: 0.5 },
    ];
    const withGoal = trackWorkbench("keren-hishtalmut", [file(mixed)], { horizonYears: 7 }, p04, { classificationToWrapper: map });
    const noGoal = trackWorkbench("keren-hishtalmut", [file(mixed)], undefined, p04, { classificationToWrapper: map });
    const code = (w: typeof withGoal, id: number) => w.rows.find((r) => r.fundId === id)!.outcome;

    it("not eligible (CAT-10) comes first, then not evaluated, then shown without a rule, else shown with the mark", () => {
      expect(code(withGoal, 1)).toEqual({ code: "shown-with-mark", mark: "fits" });
      expect(code(withGoal, 2)).toEqual({ code: "shown-with-mark", mark: "does-not-fit" });
      expect(code(withGoal, 3)).toEqual({ code: "shown-without-rule" });
      expect(code(withGoal, 4)).toEqual({ code: "not-eligible", ruleIds: ["CAT-10"], population: "עובדי סקטור מסויים" });
      expect(code(withGoal, 5)).toMatchObject({ code: "not-eligible", population: "עובדי מפעל/גוף מסויים" });
      expect(code(withGoal, 6)).toEqual({ code: "not-evaluated", reason: "no-classification" });
      expect(code(withGoal, 7).code).toBe("not-eligible");
    });

    it("with no goal every eligible track is not evaluated; a sector track is still not eligible", () => {
      expect(noGoal.rows.map((r) => r.outcome.code)).toEqual(["not-evaluated", "not-evaluated", "not-evaluated", "not-eligible", "not-eligible", "not-evaluated", "not-eligible"]);
      expect(code(noGoal, 1)).toEqual({ code: "not-evaluated", reason: "no-goal" });
    });

    it("counts are in the coverage line and add up to the rows", () => {
      expect(withGoal.coverage.outcomes).toEqual({ "not-eligible": 3, "not-evaluated": 1, "shown-without-rule": 1, "shown-with-mark": 2 });
      expect(withGoal.coverage.split).toEqual({ fits: 1, "does-not-fit": 1, "no-rule": 1, "not-eligible": 3, "no-goal": 0, "no-classification": 1 });
      expect(noGoal.coverage.split).toMatchObject({ "no-goal": 4, "not-eligible": 3, fits: 0 });
      for (const w of [withGoal, noGoal]) {
        expect(Object.values(w.coverage.outcomes).reduce((a, b) => a + b, 0)).toBe(w.coverage.considered);
        expect(Object.values(w.coverage.split).reduce((a, b) => a + b, 0)).toBe(w.coverage.considered);
        expect(w.coverage.invariant.ok).toBe(true);
      }
    });

    it("the pension tracks (no classification fields at all) are not evaluated, not guessed", () => {
      const pension = file([{ id: 1, name: "p", classification: "קרנות השתלמות", specialization: "", sub: "", mgmt: 0.2 }], "2026-09", "pensia-net");
      const w = trackWorkbench("keren-hishtalmut", [pension], { horizonYears: 30 }, p04, { classificationToWrapper: map });
      expect(w.rows[0]!.outcome).toEqual({ code: "not-evaluated", reason: "no-classification" });
    });
  });

  it("a wrapper the CMA does not report has no tracks and a zero coverage line", () => {
    const none = trackWorkbench("brokerage-account", files, { horizonYears: 7 }, p04, { classificationToWrapper: map });
    expect(none.rows).toEqual([]);
    expect(none.coverage).toMatchObject({ considered: 0, shown: 0, grouped: 0, feeNotReported: 0 });
  });

  it("on the real files every track of the wrapper is accounted for once", () => {
    const real = readdirSync(new URL("cma/", dataDir)).filter((f) => f.endsWith(".json")).map((f) => readJson(`cma/${f}`) as unknown as CmaPeriodFile);
    const out = trackWorkbench("keren-hishtalmut", real, { horizonYears: 10 }, p04, { classificationToWrapper: map });
    const expected = real.filter((f) => f.dataset === "gemelnet").flatMap((f) => f.funds).filter((f) => f.fund_classification.trim() === "קרנות השתלמות").length;
    expect(out.coverage.considered).toBe(expected);
    expect(out.coverage.shown).toBe(expected);
    expect(out.coverage.invariant.ok).toBe(true);
    expect(out.coverage.feeNotReported).toBe(out.rows.filter((r) => r.fees.management.value === null).length);
    // Tracks of one company sharing a name are flagged, never dropped.
    expect(out.coverage.grouped).toBe(out.groups.reduce((s, g) => s + g.fundIds.length, 0));
  });
});

describe("registry", () => {
  it("F-61, F-62, F-64, F-68, F-70 and F-72 are implemented, not pending", () => {
    for (const id of ["F-61", "F-62", "F-64", "F-68", "F-70", "F-72"]) {
      expect(id in formulas, id).toBe(true);
      expect(id in pending, id).toBe(false);
    }
  });
});

// An unused import guard: CmaTrack is part of the public surface the site reads.
export type { CmaTrack };

const kglPlan: RunPlan = {
  run: "runProvident",
  input: {
    wrapper: "kupat-gemel-lehashkaa",
    goal: { amountNow: 50_000, monthly: 1_000, months: 120 },
    market: { grossReturn: 0.06, inflation: 0.025 },
    fees: { deposit: 0.01, balance: 0.008, direct: 0 },
    profile: {},
  },
};

describe("F-61 per month (feeMaterialitySeries)", () => {
  it("starts at zero, grows, and is built from the same runs as the total", () => {
    const s = feeMaterialitySeries(s42, ctx);
    expect(s.lines).toEqual(["balance", "direct"]);
    expect(s.points[0]!.total).toBeCloseTo(0, 6);
    const last = s.points[s.points.length - 1]!;
    expect(last.total).toBeGreaterThan(s.points[60]!.total);
    expect(last.cost.balance!).toBeGreaterThan(last.cost.direct!);
    expect(last.total).toBeGreaterThan(last.cost.balance! + last.cost.direct!);
  });

  it("B6: the last point less the exit effect is F-61's total, and each line's cost, within P-06", () => {
    for (const plan of [s42, s43, kglPlan]) {
      const m = feeMateriality(plan, ctx);
      const s = feeMaterialitySeries(plan, ctx);
      const last = s.points[s.points.length - 1]!;
      expect(last.month).toBe(s.exitMonth);
      expect(withinTolerance(last.total - s.exitEffect.total, m.total.value as number)).toBe(true);
      for (const l of m.lines) expect(withinTolerance(last.cost[l.line]! - s.exitEffect.cost[l.line]!, l.cost.value as number)).toBe(true);
    }
  });

  it("B6: a kupat gemel lehashkaa has a real exit effect (the 25% on the real gain), a study fund past its lock none", () => {
    const k = feeMaterialitySeries(kglPlan, ctx);
    const last = k.points[k.points.length - 1]!;
    expect(k.exitEffect.total).toBeGreaterThan(0.2 * last.total);
    expect(k.exitEffect.total).toBeLessThan(0.3 * last.total);
    const h = feeMaterialitySeries(s42, ctx);
    expect(Math.abs(h.exitEffect.total)).toBeLessThan(1);
  });
});
