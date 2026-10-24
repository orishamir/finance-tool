// The broker the person chooses for the brokerage account (2026-10-24): its tariff replaces the representative's in the run.
import { describe, expect, it } from "vitest";
import { applyOwnProviders, evaluate, providerOutcomes, type RunGoal } from "./compare";
import { compareBundle } from "./compare.server";
import { parseOwnRates, splitOwnTerms, termsOfGoal } from "./own-rate";
import { readSideFile } from "./side-stores";

const bundle = compareBundle();
const BRK = "brokerage-account";
// 29 years old, 22,000 a month, 40,000 now, 3,000 a month for 20 years, 7 % return, 2.5 % inflation (the long-term case of the scenario audit)
const goal: RunGoal = { horizonYears: 20, amountNow: 40_000, monthly: 3_000, available: 0, anytime: false, returnPct: 7, inflationPct: 2.5, age: 29, employment: "employee", salary: 22_000, pensionEmployee: 6, pensionEmployer: 6.5, insurancePct: 0.3, preset: "none", fromPreset: { horizon: false, monthly: false, available: false } };
const real = (b: typeof bundle, id: string, g: RunGoal = goal) => evaluate(b, g).candidates.find((c) => c.id === id)?.run?.real ?? NaN;
const wrapper = bundle.wrappers.find((w) => w.id === BRK)!;

describe("the providers the brokerage wrapper carries", () => {
  it("are the banks and brokers the providers page ranks, with their tariff lines and Hebrew names", () => {
    const ids = Object.keys(wrapper.providers ?? {});
    for (const id of ["leumi", "psagot", "ibi", "one-zero", "hapoalim", "discount"]) expect(ids).toContain(id);
    expect(ids).not.toContain("meitav-trade"); // its snapshot is marked missing
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

describe("applyOwnProviders", () => {
  it("returns the same bundle when nothing is chosen or the id is unknown", () => {
    expect(applyOwnProviders(bundle, {})).toBe(bundle);
    expect(applyOwnProviders(bundle, { ownProviders: { [BRK]: "no-such-broker" } })).toBe(bundle);
    expect(applyOwnProviders(bundle, { ownProviders: { "bank-deposit": "psagot" } })).toBe(bundle);
  });
  it("puts the provider's sourced tariff lines in place and says it was chosen", () => {
    const b = applyOwnProviders(bundle, { ownProviders: { [BRK]: "psagot" } });
    const w = b.wrappers.find((x) => x.id === BRK)!;
    expect(w.terms!.tariff!.buy!.rate).toBeCloseTo(0.0007, 8);
    expect(w.terms!.fund).toEqual(wrapper.terms!.fund); // the fund and its costs stay
    expect(w.feeValues.tradeRate).toMatchObject({ value: 0.07, state: "sourced" });
    expect(w.feeValues.tradeRate!.source.url).toContain("psagot");
    expect(w.representative).toMatchObject({ providerId: "psagot", chosen: true });
    expect(w.representative!.provider).toContain("פסגות");
    expect(wrapper.terms!.tariff!.buy!.rate).not.toBeCloseTo(0.0007, 8); // the original bundle is untouched
  });
});

describe("the 20-year case on the cheapest collected broker", () => {
  const all = providerOutcomes(bundle, goal, BRK);
  const outcomes = all.providers;
  const best = outcomes[0]!;
  it("ranks the providers by what the option ends at; the cheapest is the one the workbench's lines make cheapest", () => {
    expect(outcomes.length).toBe(Object.keys(wrapper.providers!).length);
    for (let i = 1; i < outcomes.length; i++) expect(outcomes[i - 1]!.real).toBeGreaterThanOrEqual(outcomes[i]!.real);
    expect(best.id).toBe("one-zero"); // custody 0 and 0.3 % a trade; Psagot's 0.07 % a trade with 0.03 % custody a quarter is second
    expect(outcomes[1]!.id).toBe("psagot");
    expect(outcomes.at(-1)!.id).toBe("excellence");
  });
  it("shows the card's own run as the site's choice, on the same direct channel as the provider's row, so the default and \"Leumi\" in the picker agree (review fix 2026-10-24)", () => {
    expect(all.site).toMatchObject({ id: "leumi", current: true, channel: "direct" });
    expect(all.site!.real).toBeCloseTo(real(bundle, BRK), 4);
    expect(outcomes.find((o) => o.id === "leumi")!.channel).toBe("direct");
    expect(outcomes.find((o) => o.id === "leumi")!.real).toBeCloseTo(all.site!.real, 4);
    expect(wrapper.terms!.tariff!.buy!.rate).toBeCloseTo(0.004, 8); // Leumi's direct channel, not the branch line's 0.65 %
    expect(wrapper.representative?.channel).toBe("direct");
    // once the person chose, the card's run is theirs and there is no site row
    expect(providerOutcomes(applyOwnProviders(bundle, { ownProviders: { [BRK]: "psagot" } }), goal, BRK).site).toBeNull();
  });
  it("lands above the kupat gemel, while the site's default (Leumi) lands below it, and the figures are these", () => {
    const kgl = real(bundle, "kupat-gemel-lehashkaa");
    const dflt = real(bundle, BRK);
    const chosen = applyOwnProviders(bundle, { ownProviders: { [BRK]: best.id } });
    const cheapest = real(chosen, BRK, { ...goal, ownProviders: { [BRK]: best.id } });
    expect(cheapest).toBeCloseTo(best.real, 4);
    expect(dflt).toBeLessThan(kgl);
    expect(kgl - dflt).toBeCloseTo(2_169, -2); // 3,154 on the branch line (the scenario audit); 2,169 on the direct channel (review fix 2026-10-24)
    expect(cheapest).toBeGreaterThan(kgl);
    expect(Math.round(kgl)).toBe(1_032_222);
    expect(cheapest).toBeCloseTo(1_098_743, -2);
    expect(Math.abs(dflt - 1_030_053)).toBeLessThan(100);
    // the ranking moves: the brokerage account leads outright with that broker
    const ev = evaluate(chosen, goal);
    expect(ev.ranking.entries[0]!.id).toBe(BRK);
    expect(ev.ranking.tieSet).toEqual([BRK]);
    // Leumi chosen in the picker (direct channel, 0.4 % a trade) is now the same as the default
    const leumi = real(applyOwnProviders(bundle, { ownProviders: { [BRK]: "leumi" } }), BRK);
    expect(leumi).toBeCloseTo(dflt, 4);
    expect(leumi).toBeLessThan(kgl);
  });
});

describe("the choice in the own-terms store", () => {
  it("is read, split off for the run, and kept beside a rate and a fee; a malformed id is dropped", () => {
    const stored = parseOwnRates({ g1: { [BRK]: { fee: 0.1, provider: "psagot" }, a: { provider: "ibi" }, b: { provider: "../x" }, c: 3 } });
    expect(stored.g1).toEqual({ [BRK]: { fee: 0.1, provider: "psagot" }, a: { provider: "ibi" }, c: 3 });
    expect(splitOwnTerms(termsOfGoal(stored.g1))).toEqual({ ownRates: { c: 3 }, ownFees: { [BRK]: 0.1 }, ownProviders: { [BRK]: "psagot", a: "ibi" } });
  });
  it("travels in the export file, and a file without it still reads", () => {
    const { side, problems } = readSideFile({ offers: [], variantAssumptions: {}, playbookTicks: {}, ownRates: { g1: { [BRK]: { provider: "psagot" } } } });
    expect(problems).toEqual([]);
    expect(side!.ownRates.g1![BRK]).toEqual({ provider: "psagot" });
    expect(readSideFile({ offers: [], variantAssumptions: {}, playbookTicks: {} }).side!.ownRates).toEqual({});
  });
});
