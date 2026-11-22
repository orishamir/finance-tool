// F-118 (product D84, method B3): a run whose exit tax an open rule blocks is read before that tax. Today the rule is TXF-04, so every
// foreign fund on TASE: it has a value before tax and the account's cost, no value after tax and no rank. The checks below hold the value
// to the same run with TXF-04 settled either way (the golden harness's letter copy, exchange rate or CPI): it depends on neither.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  BlockedError,
  NotEvaluatedError,
  beforeTaxPathOf,
  providerWorkbench,
  providerWorkbenchBeforeTax,
  runSecurities,
  runSecuritiesBeforeTax,
  securitiesBlockedBy,
  type SecuritiesInput,
  type WorkbenchInput,
} from "../src/index.ts";
import { context, loadRules, withTxf04AsTheLetterCopy } from "./golden/harness.ts";

const rules = loadRules();
const ctx = context(rules);
const letter = context(withTxf04AsTheLetterCopy(rules));
const ids = (r: { rules: { id: string }[] }) => r.rules.map((u) => u.id);

/** A foreign fund on TASE held in an Israeli account: a lump sum and monthly purchases, custody, a currency that moves. */
const tase = (over: Partial<SecuritiesInput> = {}, ninetyPercentTest?: boolean): SecuritiesInput => ({
  goal: { amountNow: 50_000, monthly: 1_000, months: 120 },
  market: { grossReturn: 0.06, returnIn: "instrument", inflation: 0.025, fxChange: -0.01 },
  fund: { kind: "tase-foreign-fund", drag: { management: 0.002, tracking: 0.0005 }, halfSpread: 0.001, saleOnlyRuling: true, ...(ninetyPercentTest === undefined ? {} : { ninetyPercentTest }) },
  tariff: { buy: { rate: 0.001, min: 5 }, sell: { rate: 0.001, min: 5 }, custody: { rate: 0.0016, everyMonths: 3, min: 15 } },
  profile: {},
  ...over,
});

describe("a TASE foreign fund read before tax (F-118, D84)", () => {
  it("gives a value before tax, no value after tax and no rank, with or without the 90% test", () => {
    for (const test of [true, false, undefined]) {
      const input = tase({}, test);
      expect(() => runSecurities(input, ctx)).toThrow(BlockedError);
      const r = runSecuritiesBeforeTax(input, ctx);
      expect(r.beforeTaxReal).toBeGreaterThan(0);
      expect(r.beforeTaxNominal).toBeGreaterThan(r.beforeTaxReal);
      expect(r).not.toHaveProperty("real");
      expect(r).not.toHaveProperty("nominal");
      expect(r).not.toHaveProperty("taxAtExit");
      expect(r.outcome).toEqual({ code: "listed-not-ranked", reason: "TXF-04" });
      expect(r.formulas).toContain("F-118");
      expect(r.formulas).not.toContain("F-40");
      expect(r.taxDuring).toBe(0);
    }
  });

  it("reads no tax index and no exit tax: the open rule, the index rules and the exit tax's rules are not among the run's rules (method section 13)", () => {
    const used = ids(runSecuritiesBeforeTax(tase({}, true), ctx));
    for (const id of ["TXF-04", "TXF-03", "TXF-02", "TXS-02", "TXS-06", "TXG-09", "TXG-10"]) expect(used).not.toContain(id);
  });

  it("rests its 'nothing is taxed before the sale' on TXF-11, as the after-tax run does: cited on the fund's ruling, else labelled a reading", () => {
    const ruled = runSecuritiesBeforeTax(tase(), ctx);
    expect(ids(ruled)).toContain("TXF-11");
    expect(ruled.labels).not.toContainEqual({ code: "reading", ruleId: "TXF-11" });
    const read = runSecuritiesBeforeTax(tase({ fund: { kind: "tase-foreign-fund", drag: { management: 0.002 } } }), ctx);
    expect(read.labels).toContainEqual({ code: "reading", ruleId: "TXF-11" });
    expect(read.taxDuring).toBe(0);
  });

  it("gives the value worked by hand: whole units at a share price, a currency path in the return, F-107's drag", () => {
    // 10,000 NIS now, nothing monthly, 12 months; A-01 6% in dollars, the dollar +2% a year, CPI 3%; a unit costs 100 NIS; 0.1% to buy and
    // to sell, no minimum; the fund's fee 0.2% a year, and F-107 for an Irish fund holding US shares: TXF-16's 15% × a 1.5% yield × a 60%
    // weight = 0.135% a year (data/rules/txf-16.json, 2026-10-25).
    //   buy (F-109, F-12): the cash buys trade = 10,000 / 1.001 = 9,990.01 at most, so 99 units = 9,900, commission 9.90; 90.10 waits.
    //   month (F-07, F-10): g = (1.06 × 1.02)^(1/12) − 1 = 0.00652717; δ = 0.002 + 0.00135 = 0.00335; step = 1 + g − δ/12 = 1.00624800.
    //   at 12: NAV × 1.00624800^12 = 1.07760695; the units are worth 9,900 × 1.07760695 = 10,668.31; the sale's commission 10.67.
    //   V^pre = 10,668.31 − 10.67 + 90.10 = 10,747.74 nominal; I_12 = 1.03, so V^pre,real = 10,434.70.
    const r = runSecuritiesBeforeTax(
      {
        goal: { amountNow: 10_000, monthly: 0, months: 12 },
        market: { grossReturn: 0.06, returnIn: "instrument", inflation: 0.03, fxChange: 0.02 },
        fund: { kind: "tase-foreign-fund", drag: { management: 0.002, usDividends: { yield: 0.015, weight: 0.6 } }, saleOnlyRuling: true },
        tariff: { buy: { rate: 0.001 }, sell: { rate: 0.001 } },
        wholeUnits: { price: 100 },
        profile: {},
      },
      ctx,
    );
    expect(r.beforeTaxNominal).toBeCloseTo(10_747.74, 2);
    expect(r.beforeTaxReal).toBeCloseTo(10_434.7, 2);
    expect(r.fees.trade).toBeCloseTo(9.9 + 10.668, 2);
    expect(r.detail.cashLeft).toBeCloseTo(90.1, 6);
    expect(r.formulas).toEqual(expect.arrayContaining(["F-107", "F-109", "F-118"]));
  });

  it("equals the value before tax of the same run with TXF-04 settled either way: it depends on neither index", () => {
    for (const test of [true, false]) {
      for (const fxChange of [-0.02, 0, 0.03]) {
        const input = tase({ market: { grossReturn: 0.06, returnIn: "instrument", inflation: 0.025, fxChange } }, test);
        const settled = runSecurities(input, letter);
        const before = runSecuritiesBeforeTax(input, ctx);
        expect(settled.taxAtExit).toBeGreaterThan(0);
        expect(before.beforeTaxNominal).toBeCloseTo(settled.nominal + settled.taxAtExit, 6);
        expect(before.fees).toEqual(settled.fees);
        expect(before.series).toEqual(settled.series);
      }
    }
  });

  it("is the same value whichever index the letter would give: the 90% test moves the tax, not the value before it", () => {
    const withTest = runSecuritiesBeforeTax(tase({}, true), ctx);
    const without = runSecuritiesBeforeTax(tase({}, false), ctx);
    expect(withTest.beforeTaxNominal).toBe(without.beforeTaxNominal);
    const a = runSecurities(tase({}, true), letter);
    const b = runSecurities(tase({}, false), letter);
    expect(a.taxAtExit).not.toBeCloseTo(b.taxAtExit, 0);
  });

  it("holds in whole units, with a conversion fee in the fund's currency (F-109, F-13)", () => {
    const input = tase({
      tariff: { buy: { rate: 0.001, min: 5 }, sell: { rate: 0.001, min: 5 }, fx: 0.003, currency: { code: "USD", startRate: 3.7 } },
      wholeUnits: { price: 450 },
    });
    const settled = runSecurities(input, letter);
    const before = runSecuritiesBeforeTax(input, ctx);
    expect(before.beforeTaxNominal).toBeCloseTo(settled.nominal + settled.taxAtExit, 6);
    expect(before.detail.wholeUnits).toBe(1);
  });

  it("is read only for a run an open rule blocks: any other fund's run stays runSecurities's", () => {
    expect(beforeTaxPathOf({ kind: "tase-foreign-fund" }, ctx)).toBe("TXF-04");
    for (const kind of ["israeli-fund", "foreign-fund", "money-market-daily"] as const) {
      expect(beforeTaxPathOf({ kind }, ctx)).toBeNull();
      expect(() => runSecuritiesBeforeTax(tase({ fund: { kind, drag: {} }, market: { grossReturn: 0.05, inflation: 0.02 } }), ctx)).toThrow(/F-118/);
    }
    // with TXF-04 settled nothing blocks the run, so nothing is read before tax
    expect(beforeTaxPathOf({ kind: "tase-foreign-fund" }, letter)).toBeNull();
  });

  it("gives a fund that pays out no figure: its form is unknown, and for an arrangement the tax on its distributions is open (TXF open question 19)", () => {
    const fund = { kind: "tase-foreign-fund" as const, distribution: { yield: 0.015, perYear: 4 } };
    expect(securitiesBlockedBy(fund, ctx)).toBe("TXF-04");
    expect(beforeTaxPathOf(fund, ctx)).toBeNull();
    expect(() => runSecuritiesBeforeTax(tase({ fund }), ctx)).toThrow(NotEvaluatedError);
    expect(() => runSecuritiesBeforeTax(tase({ fund }), ctx)).toThrow("TXF-OQ19");
  });
});

describe("the accounts read before tax (F-118 on F-63)", () => {
  const snap = (id: string) => JSON.parse(readFileSync(new URL(`../../../data/fees/${id}@2026-10-23.json`, import.meta.url), "utf8"));
  const input: WorkbenchInput = {
    goal: { amountNow: 50_000, monthly: 1_000, months: 120 },
    market: { grossReturn: 0.06, inflation: 0.025 },
    fund: { kind: "tase-foreign-fund", drag: { management: 0.002 } },
    profile: {},
    behaviour: { ordersPerMonth: 1 },
    instrumentClass: "tase_foreign_fund_units",
    channel: "direct",
    theta: 0.005,
    providers: [{ snapshot: snap("leumi"), level: "list" }, { snapshot: snap("discount"), level: "list" }],
  };

  it("prices each account before tax with the account's cost from the same runs, and ranks none", () => {
    expect(() => providerWorkbench(input, ctx)).toThrow(BlockedError);
    const wb = providerWorkbenchBeforeTax(input, ctx);
    expect(wb.blockedBy).toBe("TXF-04");
    expect(wb).not.toHaveProperty("ranking");
    const rows = wb.rows.filter((r) => r.kind === "before-tax");
    expect(rows.length).toBe(2);
    for (const r of rows) {
      expect(r).not.toHaveProperty("real");
      expect(r).not.toHaveProperty("rank");
      expect(r.run.outcome.reason).toBe("TXF-04");
      expect(r.horizonCostBeforeTax).toBeCloseTo(wb.beforeTaxWithoutProviderFees - r.beforeTax, 9);
      expect(r.horizonCostBeforeTax).toBeGreaterThan(0);
    }
  });

  it("gives each account the cost F-91 gives it once TXF-04 is settled: the account's cost before tax rests on no index", () => {
    const settled = providerWorkbench(input, letter);
    const before = providerWorkbenchBeforeTax(input, ctx);
    for (const r of before.rows) {
      const s = settled.rows.find((x) => x.id === r.id)!;
      if (r.kind !== "before-tax" || s.kind !== "compared") throw new Error(`${r.id} not priced`);
      expect(r.horizonCostBeforeTax).toBeCloseTo(s.horizonCostBeforeTax, 6);
    }
  });

  it("refuses a fund whose exit tax is known: its accounts are providerWorkbench's", () => {
    expect(() => providerWorkbenchBeforeTax({ ...input, fund: { kind: "israeli-fund", drag: {} }, instrumentClass: "etf_units" }, ctx)).toThrow(/F-118/);
  });
});
