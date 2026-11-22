// The broker the person chooses for the brokerage account: its tariff replaces the representative's in the run.
import { describe, expect, it } from "vitest";
import { evaluate, type CompareBundle, type RunGoal } from "./compare";
import { compareBundle } from "./compare.server";
import { parseOwnRates, splitOwnTerms, termsOfGoal } from "./own-rate";
import { readSideFile } from "./side-stores";

const bundle = compareBundle();
const BRK = "brokerage-account";
// 29 years old, 22,000 a month, 40,000 now, 3,000 a month for 20 years, 7 % return, 2.5 % inflation (the long-term case)
const goal: RunGoal = { horizonYears: 20, amountNow: 40_000, monthly: 3_000, available: 0, anytime: false, returnPct: 7, inflationPct: 2.5, age: 29, employment: "employee", salary: 22_000, pensionEmployee: 6, pensionEmployer: 6.5, insurancePct: 0.3, preset: "none", fromPreset: { horizon: false, monthly: false, available: false } };
const real = (b: typeof bundle, id: string, g: RunGoal = goal) => evaluate(b, g).candidates.find((c) => c.id === id)?.run?.real ?? NaN;
const wrapper = bundle.wrappers.find((w) => w.id === BRK)!;
/** The bundle with one wrapper priced on one of the providers it carries: its tariff, and the member's kind where the run reads it (F-14). */
const onProvider = (b: CompareBundle, id: string, pid: string): CompareBundle => ({
  ...b,
  wrappers: b.wrappers.map((w) => {
    const p = w.id === id ? w.providers?.[pid] : undefined;
    if (!p || !w.terms) return w;
    const memberKind = p.memberKind && (w.family === "makam" || w.family === "securities") ? { memberKind: p.memberKind } : {};
    return { ...w, terms: { ...w.terms, tariff: structuredClone(p.tariff), ...memberKind } };
  }),
});

describe("the providers the brokerage wrapper carries", () => {
  it("are the banks and brokers whose tariff has a line for the class of the fund the account holds, with their tariff lines and Hebrew names", () => {
    const ids = Object.keys(wrapper.providers ?? {});
    for (const id of ["psagot", "ibi"]) expect(ids).toContain(id);
    expect(ids).toContain("meitav-trade"); // priced at its price list since 2026-11-04 (D56): custody 0.15% a quarter, at least 270 NIS, and a handling fee up to 90 NIS a month
    // the representative fund (5139100) is a tracking fund, `mutual_fund_units`: a tariff with no buy/sell line for that class gives no price, never a free trade (F-63 "No line, no price", MF-26)
    expect(ids).not.toContain("interactive-brokers");
    expect(ids).toContain("leumi"); // its TASE line covers tracking funds by footnote (MF-27; snapshot)
    // One Zero sells only the funds whose managers signed a distribution agreement with it, listed on Maya and not read: no price (BRK-38)
    expect(ids).not.toContain("one-zero");
    for (const p of Object.values(wrapper.providers!)) {
      expect(p.name.length).toBeGreaterThan(2);
      expect(p.tariff.buy).toBeDefined();
      expect(p.feeValues.tradeRate?.state).toBe("sourced");
      expect(["direct", "branch"]).toContain(p.channel);
    }
    expect(wrapper.providers!.psagot!.tariff.buy!.rate).toBeCloseTo(0.0007, 8);
    expect(wrapper.representative?.providerId).toBe("leumi");
  });
});

describe("the 20-year case on the cheapest collected broker", () => {
  // IBI on its account agreement's fee annex (D56, now): no custody fee, 0.08% a trade, at least 5 NIS for a tracking fund, and
  // 15 NIS a month charged in full (the offset against the month's trading fees is not modelled)
  const best = "ibi";
  it("lands above the kupat gemel on the best broker, and so does the unpicked default (Leumi, its monthly purchases on the regular line: its standing-order line is set aside, D41) once Harel's discount ends, and the figures are these", () => {
    const kgl = real(bundle, "kupat-gemel-lehashkaa");
    const dflt = real(bundle, BRK);
    const chosen = onProvider(bundle, BRK, best);
    const cheapest = real(chosen, BRK, { ...goal, ownProviders: { [BRK]: best } });
    expect(wrapper.terms!.tariff!.buy!.rate).toBeCloseTo(0.004, 8); // Leumi's direct channel, not the branch line's 0.65 %
    expect(wrapper.representative?.channel).toBe("direct");
    // F-80, A-19, D56: the gemel runs on Harel, the lowest of the managers' fees, at its printed 0.7% and 0% for PF-13's five years
    // and then at the most its bylaws allow, 1.05% and 4% (KGL-16). On Meitav's 0.8% alone it ended at 1,032,222, at Harel's 0.7% for all
    // twenty years at 1,041,892; the 4% on fifteen years of 3,000 deposits and the higher balance fee bring it below Leumi's default
    expect(dflt).toBeGreaterThan(kgl);
    expect(cheapest).toBeGreaterThan(kgl);
    // no exit after 20 years owes surtax: salary 264,000 and each real gain pass 721,560 but not the exit year's threshold, grown by 2.5%
    // a year from 2028 (F-119) to over 1,125,000 nominal. At 721,560 the gemel paid 2,578.78 at exit (985,597), IBI 10,616.85 with the 2% on capital
    // income (1,104,645), Leumi 6,788.19 (1,030,053)
    expect(Math.round(kgl)).toBe(987_170);
    expect(cheapest).toBeCloseTo(1_110_011, -2); // at IBI since 2026-11-08, on P-05's fund 5139100
    // 240 purchases of 3,000 on the regular line, each at its minimum of 26: Leumi's standing-order price (0.225%, 6.75) is not ranked,
    // because the bank opens it only to a list of funds it does not publish (D41, D56)
    expect(Math.abs(dflt - 1_033_178)).toBeLessThan(100);
    // the ranking moves: the brokerage account leads outright with that broker
    const ev = evaluate(chosen, goal);
    expect(ev.ranking.entries[0]!.id).toBe(BRK);
    expect(ev.ranking.tieSet).toEqual([BRK]);
  });
});

describe("the choice in the own-terms store", () => {
  it("is read, split off for the run, and kept beside a rate and a fee; a malformed id is dropped", () => {
    const stored = parseOwnRates({ g1: { [BRK]: { fee: 0.1, provider: "psagot" }, a: { provider: "ibi" }, b: { provider: "../x" }, c: 3 } });
    expect(stored.g1).toEqual({ [BRK]: { fee: 0.1, provider: "psagot" }, a: { provider: "ibi" }, c: 3 });
    expect(splitOwnTerms(termsOfGoal(stored.g1))).toEqual({ ownRates: { c: 3 }, ownFees: { [BRK]: 0.1 }, ownProviders: { [BRK]: "psagot", a: "ibi" }, ownIndices: {} });
  });
  it("travels in the export file, and a file without it still reads", () => {
    const { side, problems } = readSideFile({ offers: [], variantAssumptions: {}, playbookTicks: {}, ownRates: { g1: { [BRK]: { provider: "psagot" } } } });
    expect(problems).toEqual([]);
    expect(side!.ownRates.g1![BRK]).toEqual({ provider: "psagot" });
    expect(readSideFile({ offers: [], variantAssumptions: {}, playbookTicks: {} }).side!.ownRates).toEqual({});
  });
});
