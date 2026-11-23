// F-20, a taxable money-market fund at a loss: the fund is a taxpayer of its own, its own losses are set against its own later gains, and
// the holder gets no credit or refund for its tax (TXS-44; circular 7/2003, "לא ינתן לבעל היחידה זיכוי או החזר בגין המס המשתלם על ידי קרן
// חייבת"). So the fund's tax is never below 0, and a loss lowers the tax on the gains after it.
import { describe, expect, it } from "vitest";
import { fundLevelTaxOn, runSecurities, type SecuritiesInput } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

const ctx = context(loadRules());
const fund = (kind: "money-market-taxable" | "money-market-daily", grossReturn: number): SecuritiesInput => ({
  goal: { amountNow: 100_000, monthly: 1_000, months: 36 },
  market: { grossReturn, inflation: 0.02 },
  fund: { kind },
  tariff: {},
  profile: {},
});

describe("a taxable fund's own tax after its own losses (TXS-44)", () => {
  it("carries a month's loss and sets it against the gains after it, at 15% on what is left", () => {
    // a loss of 10 per unit pays nothing and is carried
    expect(fundLevelTaxOn(-10, 0, 0.15)).toEqual({ tax: 0, carried: 10 });
    // a gain of 4 is all offset, 6 still carried
    expect(fundLevelTaxOn(4, 10, 0.15)).toEqual({ tax: 0, carried: 6 });
    // a gain of 10: 6 offset, 15% of the 4 left
    const t = fundLevelTaxOn(10, 6, 0.15);
    expect(t.tax).toBeCloseTo(0.6, 12);
    expect(t.carried).toBe(0);
    // no loss carried: 15% of the gain
    expect(fundLevelTaxOn(10, 0, 0.15).tax).toBeCloseTo(1.5, 12);
  });

  it("charges no tax at the fund and hands none back on a return below zero", () => {
    const r = runSecurities(fund("money-market-taxable", -0.01), ctx);
    expect(r.detail.fundLevelTax).toBe(0);
    expect(r.taxDuring + r.taxAtExit).toBe(0);
    // the fund's loss is the whole loss: it grows as an exempt fund at the same return, which owes nothing at a loss
    const exempt = runSecurities(fund("money-market-daily", -0.01), ctx);
    expect(r.nominal).toBeCloseTo(exempt.nominal, 6);
  });

  it("still pays 15% of a positive return at the fund", () => {
    const r = runSecurities(fund("money-market-taxable", 0.04), ctx);
    expect(r.detail.fundLevelTax as number).toBeGreaterThan(0);
  });
});
