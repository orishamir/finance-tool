// F-107 and F-133: the tax a fund bears on what it receives from its index (A-11), by fund country and company country from the rule
// files, the net index's deduction, a fund's gap measured from it, and the two ends of a fund the site does not know.
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  comparedYears,
  dividendsOf,
  fundOf,
  gapFromNet,
  gapListOf,
  hasTwoEnds,
  heldDividendTax,
  INSIDE_TAX_ROWS,
  insideTaxEnds,
  insideTaxOf,
  netDeduction,
  partsScope,
  recordDistribution,
  REGION_COUNTRIES,
  runSecurities,
  shortfallBeyondFees,
  sumFees,
  usDividendsOf,
  type InsideTax,
  type RateOf,
} from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

function must<T>(v: T | null | undefined, what: string): T {
  if (v === null || v === undefined) throw new Error(`missing: ${what}`);
  return v;
}

const rules = loadRules();
const ctx = context(rules);
const read = (p: string) => JSON.parse(readFileSync(new URL(`../../../data/${p}`, import.meta.url), "utf8"));
const sp500 = read("instruments/exposures/index-sp500.json");
const world = read("instruments/exposures/index-msci-world.json");
const acwi = read("instruments/exposures/index-msci-acwi.json");
const nasdaq = read("instruments/exposures/index-nasdaq100.json");
const ishares = read("funds/ie00b5bmr087@2026-11-07.json"); // Irish, holds the shares
const swap = read("funds/1183441@2026-11-07.json"); // Irish, a swap on the S&P 500

/** A rule figure as the rule file holds it, as a fraction: the rates the method's worked examples rest on. */
const rate: RateOf = (rule, figure) => {
  const v = rules.find((r) => r.id === rule)?.figures?.[figure] as { value: number } | undefined;
  if (!v) throw new Error(`no figure ${rule} ${figure}`);
  return v.value / 100;
};
/** The method's worked index parts (F-107, F-133): MSCI USA's 1.13% on MSCI World's 72.77% and ACWI's 64.63%, the S&P 500 whole. */
const worldUs = [{ countries: ["us"] as const, yield: 0.0113, weight: 0.7277 }];
const acwiUs = [{ countries: ["us"] as const, yield: 0.0113, weight: 0.6463 }];
const sp500Us = [{ countries: ["us"] as const, yield: 0.0113, weight: 1 }];
const pct = (x: number) => x * 100;

describe("F-107 the tax a fund bears on what it receives from its index", () => {
  it("is each part's rate times its yield times its share, summed", () => {
    expect(heldDividendTax([{ rate: 0.15, yield: 0.0113, weight: 1 }])).toBeCloseTo(0.001695, 12);
    expect(heldDividendTax([{ rate: 0.15, yield: 0.0113, weight: 0.7277 }, { rate: 0.35, yield: 0.03, weight: 0.1 }])).toBeCloseTo(0.15 * 0.0113 * 0.7277 + 0.35 * 0.03 * 0.1, 12);
  });
  it("reads each fund country's row from the rule files: the method's worked ends, % a year", () => {
    const held = (fund: "ireland" | "luxembourg" | "us" | "israel", parts: InsideTax["parts"]) => insideTaxEnds({ basis: { kind: "held", fund, ends: "both" }, parts }, rate);
    const ie = held("ireland", worldUs);
    expect(pct(ie.low)).toBeCloseTo(0.123345, 6);
    expect(pct(ie.high)).toBeCloseTo(0.24669, 6);
    expect(pct(held("ireland", acwiUs).low)).toBeCloseTo(0.109548, 5);
    expect(pct(held("ireland", acwiUs).high)).toBeCloseTo(0.219096, 5);
    expect(pct(held("ireland", sp500Us).low)).toBeCloseTo(0.1695, 6);
    expect(pct(held("ireland", sp500Us).high)).toBeCloseTo(0.339, 6);
    expect(pct(held("israel", sp500Us).low)).toBeCloseTo(0.2825, 6);
    expect(pct(held("israel", sp500Us).high)).toBeCloseTo(0.339, 6);
    // Luxembourg's US rate is settled at 30% by its own list (TXF-55): one figure, no open end
    const lu = held("luxembourg", sp500Us);
    expect(pct(lu.low)).toBeCloseTo(0.339, 6);
    expect(lu.high).toBe(lu.low);
    expect(lu.open).toBeUndefined();
    // a US fund bears none on its US companies (TXF-56)
    expect(held("us", sp500Us).high).toBe(0);
  });
  it("bounds an added index's region over the countries read: an Irish fund on Europe at a 3% yield, 0 to 1.05% a year, flagged TXF-OQ29", () => {
    const e = insideTaxEnds({ basis: { kind: "held", fund: "ireland", ends: "both" }, parts: [{ countries: REGION_COUNTRIES.europe, yield: 0.03, weight: 1 }] }, rate);
    expect(e.low).toBe(0);
    expect(pct(e.high)).toBeCloseTo(1.05, 9);
    expect(e.flags).toContain("TXF-OQ29");
    // a US fund's dearest European country is Germany's 26.375% (F-107's table)
    const us = insideTaxEnds({ basis: { kind: "held", fund: "us", ends: "both" }, parts: [{ countries: REGION_COUNTRIES.world, yield: 0.03, weight: 1 }] }, rate);
    expect(pct(us.high)).toBeCloseTo(0.26375 * 3, 9);
  });
  it("cites Luxembourg's own list where it settles a domestic rate (TXF-55), beside the rates read", () => {
    const lu = insideTaxEnds({ basis: { kind: "held", fund: "luxembourg", ends: "both" }, parts: sp500Us }, rate);
    expect(lu.cites).toContain("TXF-55");
    expect(insideTaxEnds({ basis: { kind: "held", fund: "ireland", ends: "both" }, parts: sp500Us }, rate).cites).not.toContain("TXF-55");
  });
  it("holds every figure of TXF-53 to TXF-57 in its table, and every rate it names exists in the rule files", () => {
    const named = new Set(Object.values(INSIDE_TAX_ROWS).flatMap((row) => Object.values(row.cells).flatMap((c) => [c.low, c.high].map(([r, f]) => `${r}:${f}`))));
    for (const ref of named) {
      const [rule, figure] = ref.split(":") as [string, string];
      expect(rules.find((r) => r.id === rule)?.figures?.[figure], ref).toBeDefined();
    }
    for (const id of ["TXF-53", "TXF-54", "TXF-55", "TXF-56", "TXF-57"]) {
      const figures = Object.keys(must(rules.find((r) => r.id === id), id).figures ?? {});
      expect(figures.length, id).toBeGreaterThan(0);
      for (const f of figures) expect(named.has(`${id}:${f}`), `${id}:${f}`).toBe(true);
    }
    for (const [country, row] of Object.entries(INSIDE_TAX_ROWS)) expect(rules.some((r) => r.id === row.rule), country).toBe(true);
  });
  it("at the accepted rate alone, a collected fund carries the question that holds its claim open", () => {
    const e = insideTaxEnds({ basis: { kind: "held", fund: "ireland", ends: "accepted" }, parts: sp500Us }, rate);
    expect(e.high).toBe(e.low);
    expect(e.flags).toEqual(["TXF-OQ7"]);
    expect(insideTaxEnds({ basis: { kind: "held", fund: "israel", ends: "accepted" }, parts: sp500Us }, rate).flags).toEqual(["TXS-OQ24"]);
  });
});

describe("F-133 a net index's deduction, and a fund's gap measured from it", () => {
  it("is MSCI's rate on each part: MSCI World's US part 0.246690% a year, ACWI's 0.219096%", () => {
    expect(pct(netDeduction([{ rate: 0.3, yield: 0.0113, weight: 0.7277 }]))).toBeCloseTo(0.24669, 6);
    expect(pct(insideTaxEnds({ basis: { kind: "net", statement: "fund" }, parts: acwiUs, netRule: "TXF-59" }, rate).low)).toBeCloseTo(0.219096, 5);
  });
  it("raises the mean shortfall by the deduction less the fund's own tax, floored after: the method's worked Irish fund", () => {
    // fees 0.20%, led the net index by 0.05 points: s = −0.25%; fell 0.30 points short: s = 0.10%
    expect(gapFromNet(-0.0025, 0.0024669, 0.00123345)).toBe(0);
    expect(pct(gapFromNet(0.001, 0.0024669, 0.00123345))).toBeCloseTo(0.223345, 9);
  });
  it("gives the ends of typed synthetic funds: a futures fund 0 to D, a swap or futures fund on an added index 0 to the region's highest domestic rate", () => {
    const fut = insideTaxEnds({ basis: { kind: "futures-net" }, parts: worldUs, netRule: "TXF-59" }, rate);
    expect(fut.low).toBe(0);
    expect(pct(fut.high)).toBeCloseTo(0.24669, 6);
    const europe = insideTaxEnds({ basis: { kind: "synthetic-domestic" }, parts: [{ countries: REGION_COUNTRIES.europe, yield: 0.03, weight: 1 }] }, rate);
    expect(pct(europe.high)).toBeCloseTo(1.05, 9);
    const us = insideTaxEnds({ basis: { kind: "synthetic-domestic" }, parts: [{ countries: REGION_COUNTRIES.us, yield: 0.03, weight: 1 }] }, rate);
    expect(pct(us.high)).toBeCloseTo(0.9, 9);
  });
  it("takes the widest of holding, swap and futures where the way of following is not known: the low end a futures fund's 0", () => {
    const e = insideTaxEnds({ basis: { kind: "way-not-known", fund: "ireland", swap: "net" }, parts: worldUs, netRule: "TXF-59" }, rate);
    expect(e.low).toBe(0);
    expect(pct(e.high)).toBeCloseTo(0.24669, 6);
    // a Luxembourg fund's held end equals the net index's deduction (30% on the US part both ways), and its range is still 0 to that
    const lu = insideTaxEnds({ basis: { kind: "way-not-known", fund: "luxembourg", swap: "net" }, parts: worldUs, netRule: "TXF-59" }, rate);
    expect(lu.low).toBe(0);
    expect(pct(lu.high)).toBeCloseTo(0.24669, 6);
    // on the S&P 500, whose deduction is not known, a US fund: 0 held on its US companies, 30% × y as a swap or futures (TXF-53)
    const us = insideTaxEnds({ basis: { kind: "way-not-known", fund: "us", swap: "domestic" }, parts: sp500Us }, rate);
    expect(us.low).toBe(0);
    expect(pct(us.high)).toBeCloseTo(0.339, 6);
    const added = insideTaxEnds({ basis: { kind: "way-not-known", fund: "ireland", swap: "domestic" }, parts: [{ countries: REGION_COUNTRIES.us, yield: 0.03, weight: 1 }] }, rate);
    expect(added.low).toBe(0);
    expect(pct(added.high)).toBeCloseTo(0.9, 9);
  });
});

describe("two ends", () => {
  it("say what of the index they are on: a region's countries, the US part of a wider index, or the whole", () => {
    expect(partsScope({ parts: [{ countries: REGION_COUNTRIES.europe, yield: 0.03, weight: 1 }] })).toBe("region");
    expect(partsScope({ parts: worldUs })).toBe("part");
    expect(partsScope({ parts: sp500Us })).toBe("whole");
    expect(insideTaxEnds({ basis: { kind: "held", fund: "ireland", ends: "both" }, parts: worldUs }, rate).open).toEqual({ rule: "TXF-54", why: "claim", parts: "part" });
  });
  it("are said from the case's structure exactly where its low end differs from its high", () => {
    const fundCountries = ["ireland", "luxembourg", "us", "israel"] as const;
    const parts: InsideTax["parts"][] = [worldUs, acwiUs, sp500Us, ...Object.values(REGION_COUNTRIES).map((countries) => [{ countries, yield: 0.03, weight: 1 }]), [{ countries: REGION_COUNTRIES.europe, yield: 0, weight: 1 }]];
    const cases: InsideTax[] = parts.flatMap((p) => {
      const single = p.every((x) => x.countries.length === 1);
      const net = single ? { netRule: "TXF-59" } : {};
      return [
        ...fundCountries.flatMap((fund) => [
          { basis: { kind: "held" as const, fund, ends: "both" as const }, parts: p },
          { basis: { kind: "held" as const, fund, ends: "accepted" as const }, parts: p },
          { basis: { kind: "way-not-known" as const, fund, swap: "domestic" as const }, parts: p },
          ...(single ? [{ basis: { kind: "way-not-known" as const, fund, swap: "net" as const }, parts: p, ...net }] : []),
        ]),
        { basis: { kind: "synthetic-domestic" as const }, parts: p },
        ...(single ? [{ basis: { kind: "futures-net" as const }, parts: p, ...net }, { basis: { kind: "net" as const, statement: "fund" as const }, parts: p, ...net }] : []),
        { basis: { kind: "none" as const }, parts: p },
        { basis: { kind: "own" as const, rate: 0.001 }, parts: p },
      ];
    });
    for (const t of cases) {
      const e = insideTaxEnds(t, rate);
      expect(hasTwoEnds(t), JSON.stringify(t)).toBe(e.low !== e.high);
    }
  });
});

describe("the case of each fund (method F-107, F-133)", () => {
  const base = { domicile: "IE", replication: "physical" as const, distribution: "accumulating" as const, withholding: null, publishedGap: false, tracksNet: false, typed: false };
  const noYears = { net: null, gross: false };
  it("reads the collected index: the S&P 500's US part with no known deduction, MSCI World's with TXF-59, the NASDAQ-100 none", () => {
    expect(dividendsOf(sp500)).toEqual({ source: "collected", parts: [{ countries: ["us"], ...must(usDividendsOf(sp500), "the S&P 500's US part") }], netRule: null });
    expect(dividendsOf(world).netRule).toBe("TXF-59");
    expect(dividendsOf(nasdaq).parts).toEqual([]);
  });
  it("charges every fund with years against a net index whose deduction is known from them, whatever way it follows it", () => {
    const years = { net: { shortfall: 0.001 }, gross: false };
    const held = insideTaxOf(base, dividendsOf(world), years);
    expect(held).toMatchObject({ kind: "counted", tax: { basis: { kind: "held", ends: "accepted" }, years: { shortfall: 0.001 } } });
    for (const replication of ["swap", "futures", "mixed", null] as const) expect(insideTaxOf({ ...base, domicile: "IL", replication }, dividendsOf(world), years), String(replication)).toMatchObject({ kind: "counted", tax: { basis: { kind: "none" } } });
    // on the S&P 500, whose deduction is not known, years change nothing (F-133 (d))
    expect(insideTaxOf({ ...base, domicile: "IL", replication: "swap" }, dividendsOf(sp500), years)).toEqual({ kind: "not-counted", why: "synthetic" });
  });
  it("sets a record's own figure against its years against a net index (F-133 (b)), and lets it stand alone only without them (F-107 (a))", () => {
    const years = { net: { shortfall: 0.001 }, gross: false };
    expect(insideTaxOf({ ...base, withholding: 0.0005 }, dividendsOf(world), years)).toMatchObject({ kind: "counted", tax: { basis: { kind: "own", rate: 0.0005 }, years: { shortfall: 0.001 } } });
    expect(insideTaxOf({ ...base, withholding: 0.0005 }, dividendsOf(world), noYears)).toEqual({ kind: "own-figure" });
    expect(insideTaxOf({ ...base, withholding: 0.0005 }, dividendsOf(sp500), years)).toEqual({ kind: "own-figure" });
    // a published 12-month gap stands, whatever else the record holds (A-11 (2))
    expect(insideTaxOf({ ...base, publishedGap: true }, dividendsOf(world), noYears)).toEqual({ kind: "own-figure" });
    const own = insideTaxEnds({ basis: { kind: "own", rate: 0.0005 }, parts: worldUs, netRule: "TXF-59", years: { shortfall: 0.001 } }, rate);
    expect(own.low).toBe(0.0005);
    expect(own.formulas).toEqual(expect.arrayContaining(["F-107", "F-133"]));
  });
  it("keeps every case the method leaves not counted", () => {
    expect(insideTaxOf({ ...base, domicile: "US", distribution: "accumulating" }, dividendsOf(sp500), noYears)).toEqual({ kind: "not-counted", why: "us-keeps" });
    expect(insideTaxOf({ ...base, replication: "mixed" }, dividendsOf(world), noYears)).toEqual({ kind: "not-counted", why: "synthetic" });
    expect(insideTaxOf({ ...base, domicile: "IL", replication: "mixed" }, dividendsOf(sp500), noYears)).toEqual({ kind: "not-counted", why: "synthetic" });
    expect(insideTaxOf({ ...base, replication: "futures" }, dividendsOf(world), noYears)).toEqual({ kind: "not-counted", why: "synthetic" });
    expect(insideTaxOf(base, dividendsOf(nasdaq), noYears)).toEqual({ kind: "not-counted", why: "no-parts" });
    expect(insideTaxOf({ ...base, domicile: "LU", typed: true }, undefined, noYears)).toEqual({ kind: "not-counted", why: "no-parts" });
    expect(insideTaxOf({ ...base, domicile: "DE" }, dividendsOf(sp500), noYears)).toEqual({ kind: "not-counted", why: "domicile" });
    expect(insideTaxOf({ ...base, domicile: "IL" }, dividendsOf(sp500), { net: null, gross: true })).toEqual({ kind: "gap-gross" });
  });
  it("reads a swap fund with no years as paying its net index: the fund's statement where its own document names the net index, else the site's reading", () => {
    expect(insideTaxOf({ ...base, domicile: "IL", replication: "swap", tracksNet: true }, dividendsOf(world), noYears)).toMatchObject({ kind: "counted", tax: { basis: { kind: "net", statement: "fund" } } });
    expect(insideTaxOf({ ...base, domicile: "IL", replication: "swap" }, dividendsOf(world), noYears)).toMatchObject({ kind: "counted", tax: { basis: { kind: "net", statement: "reading" } } });
    expect(insideTaxOf({ ...base, domicile: "IL", replication: "swap", typed: true }, dividendsOf(world), noYears)).toMatchObject({ kind: "counted", tax: { basis: { kind: "net", statement: "reading" } } });
  });
  it("runs a typed fund that says less no better than one that says more: a typed swap or futures fund on the S&P 500 at 0 to 30% × y, one whose way is not said at the widest", () => {
    for (const replication of ["swap", "futures"] as const) expect(insideTaxOf({ ...base, replication, typed: true }, dividendsOf(sp500), noYears), replication).toMatchObject({ kind: "counted", tax: { basis: { kind: "synthetic-domestic" } } });
    // collected, it stays not counted (F-133 (d))
    expect(insideTaxOf({ ...base, replication: "swap" }, dividendsOf(sp500), noYears)).toEqual({ kind: "not-counted", why: "synthetic" });
    for (const domicile of ["IE", "LU", "US", "IL"]) expect(insideTaxOf({ ...base, domicile, distribution: "distributing", replication: null, typed: true }, dividendsOf(sp500), noYears), domicile).toMatchObject({ kind: "counted", tax: { basis: { kind: "way-not-known", swap: "domestic" } } });
    const held = insideTaxEnds({ basis: { kind: "held", fund: "ireland", ends: "both" }, parts: sp500Us }, rate);
    const synthetic = insideTaxEnds({ basis: { kind: "synthetic-domestic" }, parts: sp500Us }, rate);
    const way = insideTaxEnds({ basis: { kind: "way-not-known", fund: "ireland", swap: "domestic" }, parts: sp500Us }, rate);
    expect(way.high).toBeGreaterThanOrEqual(Math.max(held.high, synthetic.high));
    expect(way.low).toBeLessThanOrEqual(Math.min(held.low, synthetic.low));
  });
});

describe("the run", () => {
  const runOf = (rec: typeof ishares, opts: { typed?: boolean; exposure?: typeof sp500 } = {}) => {
    const exposure = opts.exposure ?? sp500;
    return runSecurities(
      {
        goal: { amountNow: 20_000, monthly: 500, months: 120 },
        market: { grossReturn: 0.07, inflation: 0.025, returnIn: "instrument", fxChange: 0 },
        fund: fundOf(rec, "foreign-fund", { distribution: rec.distribution_policy === "distributing" ? recordDistribution(rec) : undefined, list: gapListOf(rec, exposure, [rec]), dividends: dividendsOf(exposure), typed: opts.typed }).fund,
        tariff: { buy: { rate: 0.001, min: 5 }, sell: { rate: 0.001, min: 5 }, currency: { code: "USD", startRate: 3.7 } },
        profile: {},
      },
      ctx,
    );
  };
  it("costs a collected Irish fund what the same figure written in the record costs, and names F-107, TXF-16 and TXF-OQ7", () => {
    const computed = runOf(ishares);
    const written = runOf({ ...ishares, fees: { ...ishares.fees, fund_level_withholding_drag: { ...ishares.fees.fixed_management, value: 15 * sp500.us_dividends.yield.value / 100 } } });
    const none = runOf({ ...ishares, fees: { ...ishares.fees, fund_level_withholding_drag: { ...ishares.fees.fixed_management, value: 0 } } });
    expect(computed.nominal).toBeCloseTo(written.nominal, 6);
    expect(computed.nominal).toBeLessThan(none.nominal);
    expect(computed.formulas).toContain("F-107");
    expect(written.formulas).not.toContain("F-107");
    expect(computed.rules.map((r) => r.id)).toContain("TXF-16");
    expect(computed.flags.map((f) => f.code)).toContain("TXF-OQ7");
    expect(written.flags.map((f) => f.code)).not.toContain("TXF-OQ7");
  });
  it("charges a swap fund on the S&P 500 nothing inside it, as the method leaves it not counted", () => {
    expect(fundOf(swap, "tase-foreign-fund", { dividends: dividendsOf(sp500) }).fund.drag?.insideTax).toBeUndefined();
  });
  it("puts the case in the drag and no longer calls the record's own figure uncollected; the record's figure or a published gap stands instead", () => {
    const { fund, notCollected } = fundOf(ishares, "foreign-fund", { dividends: dividendsOf(sp500) });
    expect(fund.drag?.insideTax?.basis).toEqual({ kind: "held", fund: "ireland", ends: "accepted" });
    expect(fund.drag?.foreignWithholding).toBeUndefined();
    expect(notCollected).not.toContain("fund_level_withholding_drag");
    // the record's own figure with no years against a net index: it stands, and the run counts nothing beside it (F-107 (a))
    const own = { ...ishares, fees: { ...ishares.fees, fund_level_withholding_drag: { ...ishares.fees.fixed_management, value: 0.2 } } };
    const d = must(fundOf(own, "foreign-fund", { dividends: dividendsOf(sp500) }).fund.drag, "the drag");
    expect(d.insideTax).toBeUndefined();
    expect(d.foreignWithholding).toBeCloseTo(0.002, 12);
    // a published 12-month gap may hold the tax already: no inside tax (A-11 (2))
    const published = { ...ishares, fees: { ...ishares.fees, tracking_difference_12m: { ...ishares.fees.fixed_management, value: 0.05 } } };
    const p = fundOf(published, "foreign-fund", { dividends: dividendsOf(sp500) });
    expect(p.fund.drag?.insideTax).toBeUndefined();
    expect(p.fund.drag?.foreignWithholding).toBeUndefined();
  });
  it("runs a typed fund at both ends and ranks the cautious one, its label carrying both ends", () => {
    const typed = { ...ishares, id: "typed", tracking_record: undefined };
    const run = runOf(typed, { typed: true });
    const label = run.labels.find((l) => l.code === "cautious" && l.ruleId === "TXF-54");
    expect(label).toMatchObject({ code: "cautious", ruleId: "TXF-54", notKnown: "documents", ends: { why: "claim" } });
    const ends = must(label && "ends" in label ? label.ends : null, "the two ends");
    expect(pct(ends.low)).toBeCloseTo(15 * sp500.us_dividends.yield.value / 100, 9);
    expect(pct(ends.high)).toBeCloseTo(30 * sp500.us_dividends.yield.value / 100, 9);
    // the cautious end is the high one: the run that stands charged it
    expect(run.detail.insideTax).toBeCloseTo(ends.high, 12);
    const collected = runOf({ ...typed });
    expect(run.real).toBeLessThan(collected.real);
  });
  it("raises a collected MSCI fund's A-07 by F-133 (b), and charges a swap fund with no years the net index's deduction", () => {
    const files = readdirSync(new URL("../../../data/funds/", import.meta.url)).filter((f) => f.endsWith(".json")).sort();
    const latest = new Map<string, ReturnType<typeof read>>();
    for (const f of files) { const r = read(`funds/${f}`); latest.set(r.id, r); }
    // MTF's MSCI World swap fund: its annual report names MSCI's net index as its tracking asset and prints no full year (F-133 (a))
    const swapNoYears = must(latest.get("5140165"), "5140165");
    expect(swapNoYears.tracking_record?.years).toEqual([]);
    const d = runOf(swapNoYears, { exposure: world });
    const worldUs = must(usDividendsOf(world), "MSCI World's US part");
    const D = netDeduction([{ rate: 0.3, ...worldUs }]);
    expect(d.detail.insideTax).toBeCloseTo(D, 12);
    expect(d.formulas).toContain("F-133");
    expect(d.labels.some((l) => l.code === "reading" && l.ruleId === "TXF-59")).toBe(false);
    // SWDA: A-07 = max(0, s + D − w), s its mean shortfall beyond the fees charged against the net index, w TXF-16's 15% on the US part
    const swdaRec = must(latest.get("ie00b4l5y983"), "SWDA");
    const swda = runOf(swdaRec, { exposure: world });
    const w = 0.15 * worldUs.yield * worldUs.weight;
    const s = must(shortfallBeyondFees(must(comparedYears(swdaRec.tracking_record, gapListOf(swdaRec, world, [swdaRec])), "SWDA's years"), sumFees(swdaRec)), "SWDA's shortfall");
    expect(swda.detail.insideTax).toBeCloseTo(w, 12);
    expect(swda.detail.trackingGap).toBeCloseTo(Math.max(0, s + D - w), 12);
    expect(swda.formulas).toEqual(expect.arrayContaining(["F-107", "F-133"]));
    // SWDA led the net index (s + D − w < 0): its A-07 is at the floor. Kesem's ACWI swap fund fell short of it, so its A-07 is s + D with
    // w = 0, above the floor, where a deduction left out would show
    const kesemRec = must(latest.get("1147362"), "1147362");
    const kesem = runOf(kesemRec, { exposure: acwi });
    const acwiUs = must(usDividendsOf(acwi), "ACWI's US part");
    const Dacwi = netDeduction([{ rate: 0.3, ...acwiUs }]);
    const sKesem = must(shortfallBeyondFees(must(comparedYears(kesemRec.tracking_record, gapListOf(kesemRec, acwi, [kesemRec])), "1147362's years"), sumFees(kesemRec)), "1147362's shortfall");
    expect(sKesem).toBeGreaterThan(0);
    expect(kesem.detail.insideTax).toBe(0);
    expect(kesem.detail.trackingGap).toBeCloseTo(sKesem + Dacwi, 12);
    // the record's own figure, with those years, is F-133 (b)'s w in place of F-107 (b)'s (F-107 (a))
    const ownW = 0.0005;
    const own = runOf({ ...kesemRec, fees: { ...kesemRec.fees, fund_level_withholding_drag: { ...kesemRec.fees.fixed_management, value: ownW * 100 } } }, { exposure: acwi });
    expect(own.detail.insideTax).toBeCloseTo(ownW, 12);
    expect(own.detail.trackingGap).toBeCloseTo(sKesem + Dacwi - ownW, 12);
    expect(own.formulas).toContain("F-133");
  });
  it("every Irish fund on the S&P 500 that holds the shares and has years has its A-07 at its floor, where F-133 (d) misses nothing (G-33)", () => {
    const files = readdirSync(new URL("../../../data/funds/", import.meta.url)).filter((f) => f.endsWith(".json")).sort();
    const latest = new Map<string, ReturnType<typeof read>>();
    for (const f of files) { const r = read(`funds/${f}`); latest.set(r.id, r); }
    const all = [...latest.values()];
    const exposures = new Map([sp500, world, acwi, nasdaq].map((e) => [e.id, e]));
    const checked: string[] = [];
    for (const rec of all) {
      const e = exposures.get(rec.exposure_id);
      if (rec.domicile !== "IE" || rec.replication?.method !== "physical" || !e || dividendsOf(e).netRule || !usDividendsOf(e) || !rec.tracking_record) continue;
      const list = gapListOf(rec, { id: rec.exposure_id }, all.filter((x) => x.exposure_id === rec.exposure_id));
      const drag = must(fundOf(rec, "foreign-fund", { list, dividends: dividendsOf(e) }).fund.drag, `the drag of ${rec.id}`);
      if (!drag.insideTax || drag.tracking === undefined) continue;
      expect(drag.tracking, rec.id).toBe(0);
      checked.push(rec.id);
    }
    expect(checked.sort()).toEqual(["1159250", "ie00b3xxrp09", "ie00b5bmr087", "ie00bfmxxd54"]);
  });
});
