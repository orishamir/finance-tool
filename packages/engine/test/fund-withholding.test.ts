// F-107: the US tax on the dividends of the US shares an Irish fund holds (A-11), from TXF-16's treaty rate and the index provider's yield.
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { fundOf, fundVariants, gapListOf, irishFundUsWithholding, usDividendsOf } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

const ctx = context(loadRules());
const read = (p: string) => JSON.parse(readFileSync(new URL(`../../../data/${p}`, import.meta.url), "utf8"));
const sp500 = read("instruments/exposures/index-sp500.json");
const world = read("instruments/exposures/index-msci-world.json");
const nasdaq = read("instruments/exposures/index-nasdaq100.json");
const ishares = read("funds/ie00b5bmr087@2026-11-07.json"); // Irish, holds the shares
const swap = read("funds/1183441@2026-11-07.json"); // Irish, a swap on the index

describe("F-107 the US tax inside an Irish fund that holds US shares", () => {
  it("is the treaty rate times the US shares' yield times their weight", () => {
    expect(irishFundUsWithholding(0.15, 0.0113, 1)).toBeCloseTo(0.001695, 12);
    expect(irishFundUsWithholding(0.15, 0.0113, 0.7277)).toBeCloseTo(0.15 * 0.0113 * 0.7277, 12);
  });
  it("reads the exposure's yield and weight as fractions; an index of US companies weighs 1, and no yield gives nothing", () => {
    expect(usDividendsOf(sp500)).toEqual({ yield: sp500.us_dividends.yield.value / 100, weight: 1 });
    expect(usDividendsOf(world)!.weight).toBeCloseTo(world.us_dividends.weight.value / 100, 12);
    expect(nasdaq.us_dividends).toBeUndefined();
    expect(usDividendsOf(nasdaq)).toBeUndefined();
  });
  it("is set for an Irish fund that holds the shares and has no figure of its own, and the field is then not called uncollected", () => {
    const { fund, notCollected } = fundOf(ishares, "foreign-fund", undefined, undefined, undefined, usDividendsOf(sp500));
    expect(fund.drag!.usDividends).toEqual(usDividendsOf(sp500));
    expect(fund.drag!.foreignWithholding).toBeUndefined();
    expect(notCollected).not.toContain("fund_level_withholding_drag");
  });
  it("is not set for a swap fund, a fund with its own figure, a published 12-month gap, or a fund outside Ireland", () => {
    const u = usDividendsOf(sp500);
    expect(fundOf(swap, "tase-foreign-fund", undefined, undefined, undefined, u).fund.drag!.usDividends).toBeUndefined();
    const own = { ...ishares, fees: { ...ishares.fees, fund_level_withholding_drag: { ...ishares.fees.fixed_management, value: 0.2 } } };
    const d = fundOf(own, "foreign-fund", undefined, undefined, undefined, u).fund.drag!;
    expect(d.usDividends).toBeUndefined();
    expect(d.foreignWithholding).toBeCloseTo(0.002, 12);
    const published = { ...ishares, fees: { ...ishares.fees, tracking_difference_12m: { ...ishares.fees.fixed_management, value: 0.05 } } };
    expect(fundOf(published, "foreign-fund", undefined, undefined, undefined, u).fund.drag!.usDividends).toBeUndefined();
    const american = { ...ishares, domicile: "US" };
    expect(fundOf(american, "foreign-fund", undefined, undefined, undefined, u).fund.drag!.usDividends).toBeUndefined();
  });
  it("costs the run what the same figure written in the record costs, and the run names F-107 and TXF-16", () => {
    const exposure = {
      record: sp500,
      theta: 0.005,
      run: {
        goal: { amountNow: 20_000, monthly: 500, months: 120 },
        grossReturn: 0.07,
        inflation: 0.025,
        tariff: { buy: { rate: 0.001, min: 5 }, sell: { rate: 0.001, min: 5 } },
        profile: {},
        fxStartRates: { USD: 3.7 },
      },
    };
    const runOf = (rec: typeof ishares) => fundVariants(exposure as never, [], [rec], ctx).rows.find((r) => r.recordId === rec.id)!.run!;
    const computed = runOf(ishares);
    const written = runOf({ ...ishares, fees: { ...ishares.fees, fund_level_withholding_drag: { ...ishares.fees.fixed_management, value: 15 * sp500.us_dividends.yield.value / 100 } } });
    const none = runOf({ ...ishares, fees: { ...ishares.fees, fund_level_withholding_drag: { ...ishares.fees.fixed_management, value: 0 } } });
    expect(computed.nominal).toBeCloseTo(written.nominal, 6);
    expect(computed.nominal).toBeLessThan(none.nominal);
    expect(computed.formulas).toContain("F-107");
    expect(written.formulas).not.toContain("F-107");
    expect(computed.rules.map((r) => r.id)).toContain("TXF-16");
    // whether the fund obtains the treaty rate is TXF open question 7: the run says so (G-33)
    expect(computed.flags.map((f) => f.code)).toContain("TXF-OQ7");
    expect(written.flags.map((f) => f.code)).not.toContain("TXF-OQ7");
  });
  it("every Irish fund that takes it and has an A-07 from its years has that A-07 at its floor, where nothing is counted twice or missed (G-33)", () => {
    // above the floor, an A-07 measured against a net index has netted the index's rate less the fund's, which F-107 does not add back
    const files = readdirSync(new URL("../../../data/funds/", import.meta.url)).filter((f) => f.endsWith(".json")).sort();
    const latest = new Map<string, ReturnType<typeof read>>();
    for (const f of files) { const r = read(`funds/${f}`); latest.set(r.id, r); }
    const all = [...latest.values()];
    const exposures = new Map([sp500, world, read("instruments/exposures/index-msci-acwi.json"), nasdaq].map((e) => [e.id, e]));
    const checked: string[] = [];
    for (const rec of all) {
      const u = usDividendsOf(exposures.get(rec.exposure_id));
      if (rec.domicile !== "IE" || rec.replication?.method !== "physical" || !u || !rec.tracking_record) continue;
      const list = gapListOf(rec, { id: rec.exposure_id }, all.filter((x) => x.exposure_id === rec.exposure_id));
      const d = fundOf(rec, "foreign-fund", undefined, undefined, list, u).fund.drag!;
      if (!d.usDividends || d.tracking === undefined) continue;
      expect(d.tracking, rec.id).toBe(0);
      checked.push(rec.id);
    }
    expect(checked.length).toBeGreaterThanOrEqual(5);
  });
});
