// F-20, product D85: a foreign fund's distribution is taxed on the site's reading that it is a dividend, whatever the fund's legal form
// (TXF open question 19): 25% in Israel (TXF-08), the foreign tax withheld from it credited up to that (TXF-17, TXF-18). The rates are
// the rule base's: TXF-08's 25%, TXF-12's 25% for a US fund with a W-8BEN, TXF-13's 30% without one, Ireland's nothing (TXF-28).
import { describe, expect, it } from "vitest";
import { runSecurities, securitiesBlockedBy, type Fund, type SecuritiesInput } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

const ctx = context(loadRules());
const codes = (r: { flags: { code: string }[] }) => r.flags.map((f) => f.code);

const ISRAELI = 0.25;
const CASES: { name: string; fund: Partial<Fund>; w: number }[] = [
  { name: "a US fund with a W-8BEN", fund: { domicile: "us", w8ben: true }, w: 0.25 },
  { name: "a US fund without one", fund: { domicile: "us", w8ben: false }, w: 0.3 },
  { name: "an Irish fund", fund: { domicile: "ireland" }, w: 0 },
];

/** No cost anywhere, so a month's value before its distribution is the accumulating run's balance in that month. */
const input = (fund: Fund, months: number): SecuritiesInput => ({
  goal: { amountNow: 100_000, monthly: 0, months },
  market: { grossReturn: 0.06, returnIn: "instrument", inflation: 0.025, fxChange: 0 },
  fund,
  tariff: { currency: { code: "USD", startRate: 3.5 } },
  profile: {},
});

describe("a foreign fund's distribution, taxed on the site's reading that it is a dividend (F-20, D85, TXF open question 19)", () => {
  const yearly = 0.02;
  const perYear = 4;
  for (const kind of ["foreign-fund", "tase-foreign-fund"] as const) {
    for (const c of CASES) {
      const base: Fund = { kind, drag: {}, ...c.fund, ...(kind === "tase-foreign-fund" ? { recordCurrency: "USD" } : {}) };
      const paying: Fund = { ...base, distribution: { yield: yearly, perYear } };

      it(`${kind}, ${c.name}: one distribution pays max(0, 25% − min(w, 25%)) of it in Israel and w abroad`, () => {
        // three months: the only distribution is in month 3, before any tax has touched the holding
        const accumulating = runSecurities(input(base, 3), ctx);
        const month3 = accumulating.series[3];
        if (!month3) throw new Error("a three-month run has a month 3");
        const dist = month3.balance * (yearly / perYear);
        expect(dist).toBeGreaterThan(0);
        const r = runSecurities(input(paying, 3), ctx);
        const credit = Math.min(c.w * dist, ISRAELI * dist);
        expect(r.detail.foreignTax).toBeCloseTo(c.w * dist, 6);
        expect(r.detail.israeliTaxOnDistributions).toBeCloseTo(Math.max(0, ISRAELI * dist - credit), 6);
      });

      it(`${kind}, ${c.name}: over many distributions, each pays the same shares, and the run is ranked with the reading's label`, () => {
        expect(securitiesBlockedBy(paying, ctx)).toBeNull();
        const r = runSecurities(input(paying, 60), ctx);
        const israeliShare = Math.max(0, ISRAELI - Math.min(c.w, ISRAELI));
        // the taxes are the same share of every distribution, so of their sum: the Israeli part beside the foreign one
        const { israeliTaxOnDistributions: israeli = Number.NaN, foreignTax: foreign = Number.NaN } = r.detail;
        if (c.w > 0) expect(israeli).toBeCloseTo((israeliShare / c.w) * foreign, 6);
        else expect(r.detail.foreignTax).toBe(0);
        if (c.w >= ISRAELI) expect(israeli).toBe(0);
        expect(israeli + foreign).toBeGreaterThan(0);
        expect(r.outcome).toEqual({ code: "eligible" });
        expect(r.labels).toContainEqual({ code: "reading", ruleId: "TXF-08" });
        expect(codes(r)).not.toContain("TXF-OQ19");
        // the reading is the distribution's: a fund that pays nothing out carries no label on TXF-08
        expect(runSecurities(input(base, 60), ctx).labels.some((l) => l.ruleId === "TXF-08")).toBe(false);
      });
    }
  }

  it("a fund the person typed carries the same label: the reading is the run's, not a check on where the fund came from", () => {
    const typed: Fund = { kind: "tase-foreign-fund", drag: {}, domicile: "us", w8ben: true, recordCurrency: "USD", notKnown: "documents", distribution: { yield: yearly, perYear } };
    const r = runSecurities(input(typed, 60), ctx);
    expect(r.labels).toContainEqual({ code: "reading", ruleId: "TXF-08" });
    expect(r.detail.israeliTaxOnDistributions).toBe(0);
  });
});
