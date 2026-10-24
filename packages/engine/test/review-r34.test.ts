// Cases from the independent finance review of the release 3 and 4 engine (2026-10-24): each pins a rule the
// golden scenarios do not reach. Figures are worked from the rule's own figures in a comment.
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { ValueObject } from "@finance-tool/schema";
import { classificationFit, regulatorReference, RecordInputError, feeCap, fxFee, providerWorkbench, runProvident, runSecurities, switchingCost, type ProvidentSide, type ProvidentInput, type RunPlan, type ComparedProvider, type SecuritiesInput, type WorkbenchInput } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

const dataDir = new URL("../../../data/", import.meta.url);
const readJson = (path: string) => JSON.parse(readFileSync(new URL(path, dataDir), "utf8")) as Record<string, unknown>;
const ctx = context(loadRules());

describe("F-13 FX line with minimum and maximum (review F-63 / F-13)", () => {
  // Hapoalim, branch: 0.19% of the conversion, min $6.70, max $2,700 (data/fees/hapoalim@2026-10-23.json).
  const line = { rate: 0.0019, min: 6.7, max: 2700, in: "instrument" as const };
  const terms = { fxRate: 3.7 };

  it("a conversion pays the bound in the trade currency, converted at the rate of the trade", () => {
    // 100 NIS: 0.19% = 0.19 NIS < min 6.70 × 3.7 = 24.79 NIS, so the minimum.
    expect(fxFee(line, 100, terms)).toBeCloseTo(24.79, 9);
    // 1,000,000 NIS: 0.19% = 1,900 NIS, between 24.79 and max 2,700 × 3.7 = 9,990 NIS.
    expect(fxFee(line, 1_000_000, terms)).toBeCloseTo(1900, 9);
    // 10,000,000 NIS: 0.19% = 19,000 NIS > 9,990 NIS, so the maximum.
    expect(fxFee(line, 10_000_000, terms)).toBeCloseTo(9990, 9);
    // A bare number stays a percentage with no bounds.
    expect(fxFee(0.0019, 100)).toBeCloseTo(0.19, 12);
  });

  it("10 small orders a month (A-28) each pay the minimum", () => {
    const base: SecuritiesInput = {
      // 1,000 NIS a month for 12 months, split into 10 orders of 100 NIS; nothing now.
      goal: { amountNow: 0, monthly: 1000, months: 12 },
      market: { grossReturn: 0.05, inflation: 0.02 },
      fund: { kind: "israeli-fund" },
      tariff: { currency: { code: "USD", startRate: 3.7 } },
      ordersPerMonth: 10,
      profile: {},
    };
    const bounded = runSecurities({ ...base, tariff: { ...base.tariff, fx: line } }, ctx);
    const bare = runSecurities({ ...base, tariff: { ...base.tariff, fx: 0.0019 } }, ctx);
    // 120 buys × 24.79 + the exit conversion (gross about 12.3k NIS × 0.19% = 23.4 < 24.79, so the minimum): 121 × 24.79.
    expect(bounded.fees.fx).toBeCloseTo(121 * 24.79, 6);
    // Without bounds the same orders pay 0.19% of the cash only: far less.
    expect(bare.fees.fx).toBeLessThan(60); // about 12,000 × 0.19% twice
    expect(bounded.real).toBeLessThan(bare.real);
  });

  it("the workbench passes Hapoalim's bounds from the snapshot, in USD", () => {
    const hapoalim = readJson("fees/hapoalim@2026-10-23.json");
    const wb = providerWorkbench(
      {
        goal: { amountNow: 0, monthly: 1000, months: 12 },
        market: { grossReturn: 0.05, inflation: 0.02, returnIn: "instrument" },
        fund: { kind: "israeli-fund" },
        profile: {},
        behaviour: { ordersPerMonth: 10 },
        instrumentClass: "etf_units",
        channel: "branch",
        currency: { code: "USD", startRate: 3.7 },
        theta: 0.005,
        providers: [{ snapshot: hapoalim, level: "list" }],
      } satisfies WorkbenchInput,
      ctx,
    );
    const r = wb.rows[0] as ComparedProvider;
    expect(r.tariff.fx).toEqual({ rate: 0.0019, min: 6.7, max: 2700, in: "instrument" });
    expect(r.linesUsed).toContain("hapoalim-fx-conversion-branch");
  });
});

// ---------------------------------------------------------------- F-63 average levels

const src = (publisher: string, strength: ValueObject["source"]["strength"]) => ({ url: `https://example.test/${publisher}`, title: publisher, publisher, strength });
const vo = (value: number | null, unit: ValueObject["unit"], publisher = "bank", strength: ValueObject["source"]["strength"] = "institution"): ValueObject => ({
  value,
  unit,
  source: src(publisher, strength),
  checked: "2026-10-23",
  effective_from: null,
  effective_to: null,
  update_rule: "provider-set",
  state: "sourced",
});
const line = (id: string, level: string, rate: ValueObject, over: Record<string, unknown> = {}) => ({
  id,
  base: "trade",
  applies_to: ["etf_units"],
  level,
  rate,
  min: null,
  max: null,
  period: null,
  channel: null,
  band: null,
  statement_code: null,
  names: { tariff: [id] },
  ...over,
});
const snap = (over: Record<string, unknown>) => ({
  id: "bank-x",
  provider: { name_he: "x", class: "bank", regulator: "BoI", tase_member: true, protection_rule_ids: ["BRK-10"] },
  tariff: { url: "https://example.test/t", title: "t", published: "2026-10-01", format: "pdf" },
  snapshot: "2026-10-23",
  missing: false,
  missing_reason: null,
  lines: [],
  averages: [],
  minimums: { account_opening: null },
  notice_rule_ids: [],
  ...over,
});
const wbInput = (snapshot: unknown, level: WorkbenchInput["providers"][number]["level"]): WorkbenchInput => ({
  goal: { amountNow: 1000, monthly: 0, months: 12 },
  market: { grossReturn: 0.05, inflation: 0.02 },
  fund: { kind: "israeli-fund" },
  profile: {},
  instrumentClass: "etf_units",
  theta: 0.005,
  providers: [{ snapshot, level }],
});

describe("F-63 average levels carry no bounds and the average's own source", () => {
  it("a line whose own level is an average drops its min and max, and its strength is the average's", () => {
    // The list line is 0.30% min 25. The average-level line is 0.20% with a printed min 25 that must not apply:
    // 1,000 × 0.20% = 2 NIS a trade, not 25.
    const s = snap({
      lines: [
        line("x-list", "list", vo(0.3, "pct_of_trade"), { min: vo(25, "nis_per_trade") }),
        line("x-avg", "regulator_average", vo(0.2, "pct_of_trade", "BoI", "primary"), { min: vo(25, "nis_per_trade", "BoI", "primary") }),
      ],
    });
    const r = providerWorkbench(wbInput(s, "regulator_average"), ctx).rows[0] as ComparedProvider;
    expect(r.tariff.buy).toEqual({ rate: 0.002 });
    expect(r.linesUsed).toEqual(["x-avg"]);
    expect(r.horizonCost.source.strength).not.toBe("institution");
  });

  it("a list line replaced by an average row takes the row's source and strength, not the list line's", () => {
    const s = snap({
      lines: [line("x-list", "list", vo(0.3, "pct_of_trade", "bank", "institution"), { min: vo(25, "nis_per_trade") })],
      averages: [{ line_id: "x-list", level: "tase_average", band: null, rate: vo(0.1, "pct_of_trade", "TASE", "primary") }],
    });
    const r = providerWorkbench(wbInput(s, "tase_average"), ctx).rows[0] as ComparedProvider;
    expect(r.tariff.buy).toEqual({ rate: 0.001 });
    expect(r.horizonCost.source.strength).not.toBe("institution"); // the list line is an institution source; the run's rules are weaker than primary
    expect(r.lineSources).toEqual([{ lineId: "x-list", level: "tase_average", url: "https://example.test/TASE", publisher: "TASE", strength: "primary" }]);
  });

  it("no average row at an average level is not comparable (the list price is not an average)", () => {
    const s = snap({ lines: [line("x-list", "list", vo(0.3, "pct_of_trade"))] });
    const row = providerWorkbench(wbInput(s, "regulator_average"), ctx).rows[0]!;
    expect(row.kind).toBe("not-comparable");
    if (row.kind === "not-comparable") expect(row.reason.code).toBe("no-average");
  });
});

// ---------------------------------------------------------------- F-61 existing balance in a study fund

describe("F-61 existing balance in a study fund (review S42)", () => {
  const base: ProvidentInput = {
    wrapper: "keren-hishtalmut",
    goal: { amountNow: 0, monthly: 1200, months: 120, contributions: "nominal" },
    market: { grossReturn: 0.06, inflation: 0.025 },
    fees: { deposit: 0, balance: 0, direct: 0 },
    // Past the lock: first payment 72 months before the start (TXH-09, 6 years).
    hishtalmut: { employment: "employee", monthlySalary: 20_000, clockStartMonth: -72, employerMonthly: 900 },
    existingBalance: 120_000,
    profile: {},
  };

  it("enters as benefited money, exempt at exit, not counted as paid in", () => {
    const r = runProvident(base, ctx);
    // No fees, 6% a year: 120,000 grows by 1.06^10 = 214,901.7 (monthly compounding of (1.06)^(1/12)); the deposits add to it.
    expect(r.taxAtExit).toBe(0);
    expect(r.outcome).toEqual({ code: "eligible" });
    // Paid in: 1,200 × 120 = 144,000, not 264,000.
    expect(r.paidIn).toBeCloseTo(144_000, 6);
    expect(r.nominal).toBeGreaterThan(120_000 * 1.06 ** 10);
  });

  it("inside the lock it stops with a missing input naming PF-36", () => {
    const locked = { ...base, hishtalmut: { ...base.hishtalmut!, clockStartMonth: -12 } };
    expect(() => runProvident(locked, ctx)).toThrow(/PF-36/);
    expect(() => runProvident(locked, ctx)).toThrow(RecordInputError);
  });

  describe("kupat gemel lehashkaa balance", () => {
    const kgl: ProvidentInput = {
      wrapper: "kupat-gemel-lehashkaa",
      goal: { amountNow: 0, monthly: 0, months: 120 },
      market: { grossReturn: 0.06, inflation: 0.02 },
      fees: { deposit: 0, balance: 0.008, direct: 0 },
      existingBalance: 100_000,
      profile: {},
    };
    it("without embeddedGain the fees and growth run, the exit tax is not computed and PF-36 is flagged", () => {
      const r = runProvident(kgl, ctx);
      expect(r.taxAtExit).toBe(0);
      expect(r.flags.map((f) => f.code)).toContain("PF-36");
      expect(r.fees.balance).toBeGreaterThan(0);
      expect(r.detail.realGain).toBeUndefined();
      expect(r.paidIn).toBe(0);
      // Same fee costs as with a known gain: F-61 is before exit tax.
      const known = runProvident({ ...kgl, embeddedGain: 20_000 }, ctx);
      expect(known.fees.balance).toBeCloseTo(r.fees.balance, 9);
    });
    it("with embeddedGain the exit tax uses it: basis 80,000 at index 1, 25% of the real gain (TXK-07)", () => {
      const r = runProvident({ ...kgl, embeddedGain: 20_000 }, ctx);
      expect(r.flags.map((f) => f.code)).not.toContain("PF-36");
      const realGain = r.detail.grossBalance! - 80_000 * 1.02 ** 10;
      expect(r.detail.realGain).toBeCloseTo(realGain, 6);
      expect(r.taxAtExit).toBeCloseTo(0.25 * realGain, 6);
    });
    it("embeddedGain above the balance is refused", () => {
      expect(() => runProvident({ ...kgl, embeddedGain: 200_000 }, ctx)).toThrow(RangeError);
    });
  });
  it("an employer part above TXH-01's limit stops: it is salary when paid (F-52)", () => {
    // 7.5% × 15,712 = 1,178.40 < 1,200.
    const over = { ...base, goal: { ...base.goal, monthly: 1500 }, hishtalmut: { ...base.hishtalmut!, employerMonthly: 1200 } };
    expect(() => runProvident(over, ctx)).toThrow(/TXH-01/);
  });
});

// ---------------------------------------------------------------- F-66 loss at the switch

describe("F-66 a loss realised at the switch carries into leg B (TXS-17, TXS-18)", () => {
  // A: an Israeli fund that falls 10% a year, 100,000 now, no deposits, no fees; π 2%. B: the same kind at +8%.
  const a = (months: number): SecuritiesInput => ({
    goal: { amountNow: 100_000, monthly: 0, months },
    market: { grossReturn: -0.1, inflation: 0.02 },
    fund: { kind: "israeli-fund" },
    tariff: {},
    profile: {},
  });
  const toB = { kind: "brokerage" as const, fund: { kind: "israeli-fund" as const }, market: { grossReturn: 0.08, inflation: 0.02 } };

  it("a loss at month 12 offsets B's real gain at month 36, carried forward (TXS-18)", () => {
    const r = switchingCost({ kind: "brokerage", input: a(36) }, toB, 12, ctx);
    if (r.kind !== "brokerage") throw new Error("expected a brokerage switch");
    // A at 12: 100,000 × 0.9 = 90,000; indexed cost 100,000 × 1.02 = 102,000; real loss 12,000.
    expect(r.runs.legA.detail.realGain).toBeCloseTo(-12_000, 6);
    // B 24 months: 90,000 × 1.08² = 104,976; indexed basis 90,000 × 1.02² = 93,636; real gain 11,340.
    expect(r.runs.legB.detail.realGain).toBeCloseTo(11_340, 6);
    // Offset: the whole gain 11,340 of the 12,000 loss; 660 stays unused. Tax at exit 0 instead of 25% × 11,340 = 2,835.
    expect(r.loss).toMatchObject({ amount: expect.closeTo(12_000, 6), applied: true, offset: expect.closeTo(11_340, 6), unused: expect.closeTo(660, 6), ruleIds: ["TXS-17", "TXS-18"] });
    expect(r.runs.legB.taxAtExit).toBe(0);
    expect(r.runs.legB.flags.map((f) => f.code)).toContain("TXS-18");
    expect(r.runs.legB.rules.map((u) => u.id)).toEqual(expect.arrayContaining(["TXS-17", "TXS-18"]));
    // Without the carry B would pay 2,835 on the same gain: the switch is cheaper by 2,835 nominal (real: / 1.02^3).
    const noLoss = runSecurities({ ...a(24), market: toB.market, goal: { amountNow: 90_000, monthly: 0, months: 24 }, gridOffset: 12 }, ctx);
    expect(noLoss.taxAtExit).toBeCloseTo(2_835, 6);
    expect(r.runs.legB.nominal - noLoss.nominal).toBeCloseTo(2_835, 6);
  });

  it("in the same tax year the offset rests on TXS-17 and TXS-19, with no carry-forward flag", () => {
    const r = switchingCost({ kind: "brokerage", input: a(12) }, toB, 6, ctx);
    if (r.kind !== "brokerage") throw new Error("expected a brokerage switch");
    expect(r.loss?.ruleIds).toEqual(["TXS-17", "TXS-19"]);
    expect(r.loss?.applied).toBe(true);
    expect(r.runs.legB.flags.map((f) => f.code)).not.toContain("TXS-18");
    expect(r.runs.legB.taxAtExit).toBe(0);
  });

  it("a gain at the switch carries no loss", () => {
    const up = { ...a(36), market: { grossReturn: 0.05, inflation: 0.02 } };
    const r = switchingCost({ kind: "brokerage", input: up }, toB, 12, ctx);
    if (r.kind !== "brokerage") throw new Error("expected a brokerage switch");
    expect(r.loss).toBeUndefined();
  });

  it("a loss between a shekel fund and a foreign fund is not carried: a loss abroad is offset first against foreign gains (TXS-17)", () => {
    const foreignB = { kind: "brokerage" as const, fund: { kind: "foreign-fund" as const, domicile: "us" as const, w8ben: true }, market: { grossReturn: 0.08, inflation: 0.02 } };
    const r = switchingCost({ kind: "brokerage", input: { ...a(36), broker: "israeli" } }, foreignB, 12, ctx);
    if (r.kind !== "brokerage") throw new Error("expected a brokerage switch");
    expect(r.loss).toMatchObject({ applied: false, reason: "different-domain", offset: 0 });
  });
});

// ---------------------------------------------------------------- F-61 caps cite the rules the method names

describe("F-61 caps cite the method's rules per wrapper; the figures are unchanged", () => {
  const plan = (run: string, wrapper: string, extra: object = {}) => ({ run, input: { wrapper, ...extra } }) as unknown as RunPlan;
  const cap = (p: RunPlan, line: "balance" | "deposit" | "manager") => feeCap(p, line, ctx);

  it("study fund: KH-22 with PF-06, 2% of the balance", () => {
    expect(cap(plan("runProvident", "keren-hishtalmut"), "balance")).toEqual({ ruleId: "PF-06", figure: "balance_cap", rate: 0.02, ruleIds: ["KH-22", "PF-06"] });
    expect(cap(plan("runProvident", "keren-hishtalmut"), "deposit")).toBeUndefined();
  });
  it("kupat gemel lehashkaa: PF-03 and PF-02, 1.05% and 4%", () => {
    expect(cap(plan("runProvident", "kupat-gemel-lehashkaa"), "balance")).toMatchObject({ rate: 0.0105, ruleIds: ["PF-03", "PF-02"] });
    expect(cap(plan("runProvident", "kupat-gemel-lehashkaa"), "deposit")).toMatchObject({ rate: 0.04, ruleIds: ["PF-03", "PF-02"] });
  });
  it("pensions: PEN-21 with PF-04 (0.5%, 6%) or PF-05 (1.05%, 4%); provident for annuity PEN-22", () => {
    expect(cap(plan("runPension", "pension-comprehensive"), "balance")).toMatchObject({ rate: 0.005, ruleIds: ["PEN-21", "PF-04"] });
    expect(cap(plan("runPension", "pension-comprehensive"), "deposit")).toMatchObject({ rate: 0.06 });
    expect(cap(plan("runPension", "pension-general"), "balance")).toMatchObject({ rate: 0.0105, ruleIds: ["PEN-21", "PF-05"] });
    expect(cap(plan("runPension", "provident-for-annuity"), "balance")).toMatchObject({ ruleId: "PEN-22", ruleIds: ["PEN-22"] });
  });
  it("the manager line of an IRA hishtalmut shows PF-06's 2%", () => {
    expect(cap({ run: "runSecurities", input: {} } as unknown as RunPlan, "manager")).toBeUndefined();
    const ira = { run: "runSecurities", input: { wrapper: { kind: "ira-hishtalmut", managerFee: 0.01, clockStartMonth: 0 } } } as unknown as RunPlan;
    expect(cap(ira, "manager")).toEqual({ ruleId: "PF-06", figure: "balance_cap", rate: 0.02, ruleIds: ["PF-06"] });
  });
});

// ---------------------------------------------------------------- F-68 notes, F-70 order

describe("F-68 and F-70 wording (review)", () => {
  it("F-68 says the mean is simple, one track one vote, not asset-weighted (CAT OQ2)", () => {
    const fee = (value: number) => ({ ...vo(value, "pct_per_year", "CMA", "primary") });
    const track = (n: number, mgmt: number) =>
      ({ report_period: "2026-09", checked: "2026-10-23", fund_classification: "x", specialization: "y", fees: { avg_annual_management_fee: fee(mgmt), avg_deposit_fee: fee(0) }, n }) as never;
    const ref = regulatorReference([track(1, 0.2), track(2, 0.6)], { fund_classification: "x", specialization: "y" });
    // Mean (0.2 + 0.6) / 2 = 0.4; a 1,000-vs-1 asset weighting would not give that.
    expect(ref.management.mean.value).toBeCloseTo(0.4, 12);
    expect(ref.management.mean.notes).toContain("a simple mean of the per-track averages, one track one vote, not asset-weighted (CAT OQ2)");
    expect(ref.deposit.median.notes).toContain("one track one vote");
  });

  it("F-70 names the classification words in the lookup's own order: sub-specialization first", () => {
    const r = classificationFit({ specialization: "unknown spec", sub_specialization: "unknown sub" }, 10, { table: [] });
    expect(r).toMatchObject({ mark: "no-rule", classification: "unknown sub", lossFilter: "not-applied-release-5" });
    expect(classificationFit({ specialization: "unknown spec", sub_specialization: "" }, 10, { table: [] }).classification).toBe("unknown spec");
  });
});

// ---------------------------------------------------------------- F-66 provident transfers

describe("F-66 a transfer between two funds of the same kind cites SW-39 and SW-40 and labels the neutrality a reading", () => {
  const wrappers = readdirSync(new URL("instruments/wrappers/", dataDir))
    .filter((f) => f.endsWith(".json"))
    .map((f) => readJson(`instruments/wrappers/${f}`) as { id: string; transfer_routes: { to: string; rule_ids: string[] }[] });
  /** The rule ids the site passes: the wrapper record's route to its own kind. */
  const routeIds = (id: string) => wrappers.find((w) => w.id === id)!.transfer_routes.find((t) => t.to === id)!.rule_ids;

  for (const wrapper of ["kupat-gemel-lehashkaa", "keren-hishtalmut", "pension-comprehensive", "provident-for-annuity"] as const) {
    it(`${wrapper}: the route's ids plus SW-39 and SW-40, SW-40 labelled secondary, strength secondary`, () => {
      const side: ProvidentSide = { kind: "provident", wrapper, move: "fund-transfer", ruleIds: routeIds(wrapper), ...(wrapper === "keren-hishtalmut" ? { wholeOnlyRuleIds: ["PF-18", "KH-17"] } : {}) };
      const r = switchingCost(side, side, 0, ctx);
      if (r.kind !== "provident") throw new Error(`expected a provident switch, got ${r.kind}`);
      expect(r.move).toBe("fund-transfer");
      expect(r.ruleIds).toEqual(expect.arrayContaining([...routeIds(wrapper), "SW-39", "SW-40"]));
      expect(r.labels).toContainEqual({ code: "secondary-source", ruleId: "SW-40" });
      expect(r.cost.source.strength).toBe("secondary");
      expect(r.cost.value).toBe(0);
    });
  }

  it("a track switch keeps TXK-04, TXH-19, PF-23 and carries no reading label", () => {
    const side: ProvidentSide = { kind: "provident", wrapper: "kupat-gemel-lehashkaa", ruleIds: ["TXK-04", "PF-23"] };
    const r = switchingCost(side, side, 0, ctx);
    if (r.kind !== "provident") throw new Error("expected a provident switch");
    expect(r.move).toBe("track-switch");
    expect(r.ruleIds).toEqual(["TXK-04", "PF-23"]);
    expect(r.labels.some((l) => l.ruleId === "SW-40")).toBe(false);
    expect(r.cost.source.strength).not.toBe("secondary");
  });
});
