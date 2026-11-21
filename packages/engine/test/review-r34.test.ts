// Cases from the independent finance review of the release 3 and 4 engine (2026-10-24): each pins a rule the
// golden scenarios do not reach. Figures are worked from the rule's own figures in a comment.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { ValueObject } from "@finance-tool/schema";
import { fxFee, providerWorkbench, runProvident, runSecurities, type ProvidentInput, type ComparedProvider, type SecuritiesInput, type WorkbenchInput } from "../src/index.ts";
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

// ---------------------------------------------------------------- F-52 the employer part

describe("F-52 a study fund's employer part against TXH-01's limit", () => {
  const base: ProvidentInput = {
    wrapper: "keren-hishtalmut",
    goal: { amountNow: 0, monthly: 1200, months: 120, contributions: "nominal" },
    market: { grossReturn: 0.06, inflation: 0.025 },
    fees: { deposit: 0, balance: 0, direct: 0 },
    // Past the lock: first payment 72 months before the start (TXH-09, 6 years).
    hishtalmut: { employment: "employee", monthlySalary: 20_000, clockStartMonth: -72, employerMonthly: 900 },
    profile: {},
  };
  // 7.5% × 15,712 = 1,178.40 a month; the own part 300 is under TXH-08's 2.5% × 15,712 = 392.80.
  const limit = 0.075 * 15_712;
  const withEmployer = (employerMonthly: number) => ({
    ...base,
    goal: { ...base.goal, monthly: 300 + employerMonthly },
    hishtalmut: { ...base.hishtalmut!, employerMonthly },
  });
  const g = 1.06 ** (1 / 12) - 1;
  const growth = Array.from({ length: 120 }, (_, k) => (1 + g) ** (k + 1)).reduce((a, b) => a + b, 0);

  it("exactly at the limit: all benefited, no salary tax, nothing taxed at exit", () => {
    const r = runProvident(withEmployer(limit), ctx);
    expect(r.detail.employerDepositTax).toBeUndefined();
    expect(r.taxAtExit).toBe(0);
  });
  it("above the limit it no longer stops: the part above is salary when paid and runs separately", () => {
    const at = runProvident(withEmployer(limit), ctx);
    const r = runProvident(withEmployer(1500), ctx);
    const over = 1500 - limit;
    // The extra money (321.60 a month) lands in the excess pot and grows like any deposit.
    expect(r.detail.grossBalance! - at.detail.grossBalance!).toBeCloseTo(over * growth, 4);
    // Salary 20,000: the 321.60 above is 3,859.20 a year on top of 240,000, in the 31% band (TXG-02) while that band starts at 228,000:
    // 1,196.352 a year in years 1 to 4. From 2028 the bands grow by π = 2.5% a year (F-119), and in year 5 (2030) the 20% band reaches
    // 228,000 × 1.025³ = 245,527, above 243,859.20: 771.84 a year in years 5 to 10. 4 × 1,196.352 + 6 × 771.84 = 9,416.448.
    expect(r.detail.employerDepositTax!).toBeCloseTo(9_416.448, 2);
    // National Insurance and health at the full rate 12.17% (TXG-35, sourced to National Insurance's circular 1473, TXH-26): 0.1217 × 321.60 × 120 = 4,696.6464.
    expect(r.detail.employerSocial!).toBeCloseTo(4_696.6464, 3);
    // The split of the monthly money: own 300 and employer 1,178.40 benefited, 321.60 above.
    expect(r.detail.benefitedMonthly).toBeCloseTo(1_478.4, 9);
    expect(r.detail.excessMonthly).toBeCloseTo(321.6, 9);
    expect(r.labels.some((l) => l.ruleId === "TXG-35")).toBe(false);
    // Its gains are taxed at exit (TXH-11); the benefited part is not.
    expect(r.taxAtExit).toBeGreaterThan(0);
    expect(r.formulas).toContain("F-52");
    expect(r.nominal).toBeLessThan(r.detail.grossBalance! - r.taxAtExit);
  });
  it("the self-employed path has no employer limit and is unchanged", () => {
    const se: ProvidentInput = { ...base, hishtalmut: { employment: "self-employed", clockStartMonth: -72 }, profile: { annualIncome: 200_000 } };
    const r = runProvident(se, ctx);
    expect(r.detail.employerDepositTax).toBeUndefined();
  });
});
