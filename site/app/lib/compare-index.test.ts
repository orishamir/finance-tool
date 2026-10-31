// The securities account over the indices in the comparison (2026-10-25, D27 and D28): no index until the person chooses one, the lowest
// of the ways before, the index's cheapest way after, and the same numbers as the invest page for the same plan.
import { describe, expect, it } from "vitest";
import { applyProviders, buildView, evaluate, providerOf, type RunGoal } from "./compare";
import { applyIndex, applyIndexWay, planOfGoal, readIndex } from "./compare-index";
import { compareBundle } from "./compare.server";
import { cheapestWay, knownIndices, rangeOverKnownIndices } from "./invest";
import { parseOwnRates, splitOwnTerms, termsOfGoal } from "./own-rate";
import { instrumentClassOf } from "./providers";
import { buildWorkbenchBundle } from "./providers.server";

const bundle = compareBundle();
const wb = buildWorkbenchBundle();
const BRK = "brokerage-account";
const state = { entered: {}, age: null, employment: null } as const;
// the founder's plan: 6,000 now and 400 a month for 20 years at 7 % (inflation 2 %)
const founder: RunGoal = { horizonYears: 20, amountNow: 6_000, monthly: 400, available: 0, anytime: false, returnPct: 7, inflationPct: 2, age: null, employment: null, salary: null, pensionEmployee: null, pensionEmployer: null, insurancePct: null, preset: "none", fromPreset: { horizon: false, monthly: false, available: false } };
// Doron's case: 67,000 for eight years, nothing monthly
const doron: RunGoal = { ...founder, horizonYears: 8, amountNow: 67_000, monthly: 0 };
const real = (b: typeof bundle, g: RunGoal) => evaluate(b, g, { only: new Set([BRK]) }).candidates.find((c) => c.id === BRK)?.run?.real ?? NaN;

describe("the account's way is priced like the invest page's", () => {
  for (const [name, g] of [["the founder's plan", founder], ["Doron's case", doron]] as const) {
    it(`${name}: every known index's cheapest way runs here at the value the invest page gives it`, () => {
      const plan = planOfGoal(bundle, g, state);
      const ways = rangeOverKnownIndices(wb, plan)!.perIndex;
      expect(ways.length).toBe(knownIndices(wb).length);
      for (const w of ways) {
        const b = applyIndexWay(bundle, wb, w, "chosen");
        expect(b, `${w.indexId} via ${w.providerId}`).not.toBeNull();
        expect(real(b!, g), `${w.indexId} via ${w.providerId} ${w.fundRecordId}`).toBeCloseTo(w.valueN, 0);
      }
    });
  }
});

describe("the account's other houses are read for the way's fund (F-12, F-63)", () => {
  const way = (kind: "etf" | "tracking") => {
    const plan = planOfGoal(bundle, founder, state);
    const ways = rangeOverKnownIndices(wb, plan)!.perIndex;
    const fundOf = (w: (typeof ways)[number]) => wb.funds.find((f) => f.id === w.fundRecordId);
    const isEtf = (w: (typeof ways)[number]) => instrumentClassOf(fundOf(w)!, wb.exposures.find((e) => e.id === fundOf(w)!.exposure_id)) === "etf_units";
    return { list: ways.filter((w) => isEtf(w) === (kind === "etf")), plan };
  };
  const withWay = (w: Parameters<typeof applyIndexWay>[2]) => applyIndexWay(bundle, wb, w, "chosen")!.wrappers.find((x) => x.id === BRK)!;
  it("an Israeli ETF's way carries the printed standing-order price at the three houses that print one, as the invest page charges it (MF-58)", () => {
    const { list } = way("etf");
    expect(list.length).toBeGreaterThan(0);
    for (const w of list) {
      const entry = withWay(w);
      const marked = Object.entries(entry.providers ?? {}).filter(([, p]) => p.tariff.buyStanding).map(([id]) => id).sort();
      expect(marked, w.fundRecordId).toEqual(["fibi", "leumi", "massad"]);
      expect(entry.providers?.massad?.tariff.buy?.min).toBe(35);
      expect(entry.providers?.massad?.tariff.buyStanding?.min).toBe(7);
    }
  });
  it("a tracking fund's way carries the printed standing-order price at the three houses that print one", () => {
    const { list } = way("tracking");
    expect(list.length).toBeGreaterThan(0);
    const entry = withWay(list[0]!);
    const marked = Object.entries(entry.providers ?? {}).filter(([, p]) => p.tariff.buyStanding).map(([id]) => id).sort();
    expect(marked).toEqual(["fibi", "leumi", "massad"]);
    expect(entry.providers?.massad?.tariff.buyStanding?.min).toBe(7);
  });
});

describe("before a choice (D27)", () => {
  const plan = planOfGoal(bundle, founder, state);
  const out = applyIndex(bundle, wb, plan, founder);
  it("reads the range over the known indices and ranks the account by the lowest", () => {
    expect(out.reading?.kind).toBe("range");
    if (out.reading?.kind !== "range") throw new Error("range");
    const range = rangeOverKnownIndices(wb, plan)!;
    expect(out.reading.low.valueN).toBe(range.low.valueN);
    expect(out.reading.high.valueN).toBe(range.high.valueN);
    expect(out.reading.low.valueN).toBeLessThan(out.reading.high.valueN);
    expect(out.ranked?.valueN).toBe(range.low.valueN);
    expect(real(out.bundle, founder)).toBeCloseTo(range.low.valueN, 0);
    expect(out.bundle.wrappers.find((w) => w.id === BRK)!.representative).toMatchObject({ viaIndex: "range", pickedBy: "site" });
  });
  it("the pick of a tariff does not override the way's broker", () => {
    const again = applyProviders(out.bundle, founder);
    expect(again.wrappers.find((w) => w.id === BRK)).toBe(out.bundle.wrappers.find((w) => w.id === BRK));
  });
  // since 2026-10-28 an index's way opens on an unhedged fund: MSCI World runs through MTF's unhedged fund, no longer Kesem's hedged one
  it("the founder's plan: the lowest is MSCI World at about 146,712, the highest the S&P 500 at 155,116", () => {
    if (out.reading?.kind !== "range") throw new Error("range");
    expect(out.reading.low.indexId).toBe("index-msci-world");
    expect(Math.round(out.reading.low.valueN)).toBe(146_712);
    expect(Math.round(out.reading.high.valueN)).toBe(155_116);
  });
});

describe("after a choice", () => {
  const g: RunGoal = { ...founder, ownIndices: { [BRK]: "index-sp500" } };
  const plan = planOfGoal(bundle, g, state);
  const out = applyIndex(bundle, wb, plan, g);
  it("runs on that index's cheapest way, which is the invest page's headline for it", () => {
    expect(out.reading?.kind).toBe("chosen");
    const way = cheapestWay(wb, knownIndices(wb).find((i) => i.id === "index-sp500")!, plan)!;
    expect(out.ranked).toEqual(way);
    expect(Math.round(real(out.bundle, g))).toBe(155_116);
    const w = out.bundle.wrappers.find((x) => x.id === BRK)!;
    expect(w.representative).toMatchObject({ providerId: "psagot", viaIndex: "chosen" });
    expect(w.representative!.name).toContain("S&P 500");
    expect(providerOf(out.bundle, BRK)?.name).toContain("פסגות");
  });
  it("an unknown or removed index id falls back to the range", () => {
    expect(readIndex(wb, plan, "index-nope")?.kind).toBe("range");
  });
  it("another index changes the figure through the fund's costs only", () => {
    const o = applyIndex(bundle, wb, plan, { ...founder, ownIndices: { [BRK]: "index-ta35" } });
    expect(Math.round(real(o.bundle, founder))).toBe(154_323);
  });
});

describe("no return, no index layer", () => {
  it("leaves the bundle alone when the goal holds no return", () => {
    const g = { ...founder, returnPct: null };
    const o = applyIndex(bundle, wb, planOfGoal(bundle, g, state), g);
    expect(o.bundle).toBe(bundle);
    expect(o.reading).toBeNull();
  });
});

describe("the comparison's ranking uses the conservative reading", () => {
  it("places the account at the lowest of the ways, below what the S&P 500 way would give", () => {
    const plan = planOfGoal(bundle, founder, state);
    const lo = applyIndex(bundle, wb, plan, founder).bundle;
    const hi = applyIndex(bundle, wb, plan, { ...founder, ownIndices: { [BRK]: "index-sp500" } }).bundle;
    const rank = (b: typeof bundle) => {
      const v = buildView(b, founder);
      if (v.kind !== "ok") throw new Error("not ok");
      return v.ranked.find((o) => o.id === BRK)!.real;
    };
    expect(rank(lo)).toBeLessThan(rank(hi));
  });
});

describe("the choice is stored with the goal and old goals still load", () => {
  it("an index id is read, split off for the run, and kept beside a provider; a malformed id is dropped", () => {
    const stored = parseOwnRates({ g1: { [BRK]: { provider: "psagot", index: "index-sp500" }, a: { index: "../x" } }, g2: { [BRK]: { fee: 0.1 } } });
    expect(stored.g1).toEqual({ [BRK]: { provider: "psagot", index: "index-sp500" } });
    expect(splitOwnTerms(termsOfGoal(stored.g1)).ownIndices).toEqual({ [BRK]: "index-sp500" });
    expect(splitOwnTerms(termsOfGoal(stored.g2)).ownIndices).toEqual({});
    expect(parseOwnRates({ g3: { [BRK]: 3 } }).g3).toEqual({ [BRK]: 3 });
  });
});
