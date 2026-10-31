// The broker the person chooses for the brokerage account (2026-10-24): its tariff replaces the representative's in the run.
import { describe, expect, it } from "vitest";
import { applyOwnProviders, applyProviders, buildView, evaluate, feeShieldPair, providerOutcomes, type RunGoal } from "./compare";
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
  it("are the banks and brokers whose tariff has a line for the class of the fund the account holds, with their tariff lines and Hebrew names", () => {
    const ids = Object.keys(wrapper.providers ?? {});
    for (const id of ["psagot", "ibi"]) expect(ids).toContain(id);
    expect(ids).not.toContain("meitav-trade"); // its snapshot is marked missing
    // the representative fund (5139282) is a tracking fund, `mutual_fund_units`: a tariff with no buy/sell line for that class gives no price, never a free trade (F-63 "No line, no price", MF-26, 2026-10-25)
    expect(ids).not.toContain("interactive-brokers");
    for (const id of ["one-zero", "leumi"]) expect(ids).toContain(id); // their TASE lines cover tracking funds by footnote (MF-27; snapshot 2026-10-31)
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
    expect(best.id).toBe("fair"); // no custody fee by its home page, 0.08% minimum 3 NIS on a tracking fund (BRK-53)
    expect(outcomes[1]!.id).toBe("one-zero");
    expect(outcomes.at(-1)!.id).toBe("excellence");
  });
  it("marks the card's own run (P-05's Leumi tariff) on its row, on the direct channel, with no second row for it", () => {
    expect(all.site).toBeNull();
    expect(outcomes.find((o) => o.id === "leumi")).toMatchObject({ current: true, channel: "direct" });
    expect(outcomes.find((o) => o.id === "leumi")!.real).toBeCloseTo(real(bundle, BRK), 4);
    expect(wrapper.terms!.tariff!.buy!.rate).toBeCloseTo(0.004, 8); // Leumi's direct channel, not the branch line's 0.65 %
    expect(wrapper.representative?.channel).toBe("direct");
    // once the person chose, the card's run is theirs and there is no site row
    expect(providerOutcomes(applyOwnProviders(bundle, { ownProviders: { [BRK]: "psagot" } }), goal, BRK).site).toBeNull();
  });
  it("lands above the kupat gemel on the best broker and on the unpicked default (Leumi, its monthly purchases on the standing-order line, D41), and the figures are these", () => {
    const kgl = real(bundle, "kupat-gemel-lehashkaa");
    const dflt = real(bundle, BRK);
    const chosen = applyOwnProviders(bundle, { ownProviders: { [BRK]: best.id } });
    const cheapest = real(chosen, BRK, { ...goal, ownProviders: { [BRK]: best.id } });
    expect(cheapest).toBeCloseTo(best.real, 4);
    expect(dflt).toBeGreaterThan(kgl);
    expect(cheapest).toBeGreaterThan(kgl);
    expect(Math.round(kgl)).toBe(1_032_222);
    expect(cheapest).toBeCloseTo(1_108_948, -2);
    // 240 purchases of 3,000: 0.225% (6.75) instead of the regular line's 26 saves 4,620 before growth and tax
    expect(Math.abs(dflt - 1_034_620)).toBeLessThan(100);
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

describe("the site's pick of the brokerage tariff (F-80, 2026-10-24, Doron's case)", () => {
  // 67,000 for eight years at 7 %, nothing monthly, no profile: the reader's goal on which the comparison crowned the gemel over an account priced at Leumi's list tariff
  const doron: RunGoal = { horizonYears: 8, amountNow: 67_000, monthly: 0, available: 0, anytime: false, returnPct: 7, inflationPct: null, age: null, employment: null, salary: null, pensionEmployee: null, pensionEmployer: null, insurancePct: null, preset: "none", fromPreset: { horizon: false, monthly: false, available: false } };
  it("prices the account on the collected tariff that leaves the goal the most, named as the site's pick", () => {
    const b = applyProviders(bundle, doron);
    const w = b.wrappers.find((x) => x.id === BRK)!;
    expect(w.representative).toMatchObject({ providerId: "fair", pickedBy: "site", compared: Object.keys(wrapper.providers!).length });
    expect(w.representative!.chosen).toBeUndefined();
    expect(w.feeValues.custodyRate).toMatchObject({ state: "sourced" });
    expect(real(b, BRK, doron)).toBeGreaterThan(real(bundle, BRK, doron) + 3_000);
    expect(Math.round(real(b, BRK, doron))).toBe(90_172);
  });
  it("never picks a provider whose tariff has no line for the fund's class: Interactive Brokers has no tracking-fund line and is not a candidate", () => {
    expect(Object.keys(wrapper.providers!)).not.toContain("interactive-brokers");
    for (const g of [doron, { ...doron, monthly: 1_200 }, goal, { ...goal, horizonYears: 3 }]) {
      const id = applyProviders(bundle, g).wrappers.find((x) => x.id === BRK)!.representative!.providerId!;
      expect(Object.keys(wrapper.providers!)).toContain(id);
    }
  });
  it("puts the securities account first for that goal, where Leumi's list tariff gave a tie with the gemel", () => {
    const before = buildView(bundle, doron);
    const after = buildView(applyProviders(bundle, doron), doron);
    if (before.kind !== "ok" || after.kind !== "ok") throw new Error("not ok");
    expect(before.headline).toBe("tie");
    expect(after.headline).toBe("winner");
    expect(after.ranked[0]!.id).toBe(BRK);
    expect(after.ranked[1]!.id).toBe("kupat-gemel-lehashkaa");
    expect(after.ranked[0]!.real - after.ranked[1]!.real).toBeGreaterThan(3_000);
  });
  it("ranks per goal: with a monthly deposit the 2 NIS minimum beats the 30 NIS one", () => {
    const rank = (g: RunGoal) => providerOutcomes(bundle, g, BRK).providers.map((p) => p.id);
    expect(rank(doron).indexOf("one-zero")).toBeLessThan(rank(doron).indexOf("psagot"));
    const monthly = rank({ ...doron, monthly: 1_200 });
    expect(monthly.indexOf("psagot")).toBeLessThan(monthly.indexOf("one-zero"));
  });
  it("keeps the person's own choice, and P-05's tariff when the run cannot be made", () => {
    const own = applyProviders(bundle, { ...doron, ownProviders: { [BRK]: "ibi" } });
    const w = own.wrappers.find((x) => x.id === BRK)!;
    expect(w.representative).toMatchObject({ providerId: "ibi", chosen: true });
    expect(w.representative!.pickedBy).toBeUndefined();
    // the account's entry is P-05's (makam and the bond, securities held in the account since D6 2026-10-26, need no return and are picked)
    const noReturn = applyProviders(bundle, { ...doron, returnPct: null });
    expect(noReturn.wrappers.find((x) => x.id === BRK)).toBe(bundle.wrappers.find((x) => x.id === BRK));
  });
  it("marks the pick in the picker instead of adding the site's row", () => {
    const b = applyProviders(bundle, doron);
    const out = providerOutcomes(b, doron, BRK);
    expect(out.site).toBeNull();
    expect(out.providers.find((p) => p.current)?.id).toBe("fair");
    expect(out.providers[0]!.id).toBe("fair");
  });
  it("names the pair behind a tax gap that is a fee effect, and not a pair without custody fees", () => {
    const v = buildView(bundle, doron);
    if (v.kind !== "ok") throw new Error("not ok");
    const gemel = v.ranked.find((o) => o.id === "kupat-gemel-lehashkaa")!;
    const brk = v.ranked.find((o) => o.id === BRK)!;
    expect(feeShieldPair(bundle, gemel, brk)).toEqual({ provident: gemel.name, securities: brk.name });
    expect(feeShieldPair(bundle, brk, gemel)).toEqual({ provident: gemel.name, securities: brk.name });
    const mmf = v.ranked.find((o) => o.id === "money-market-fund-daily")!;
    expect(feeShieldPair(bundle, gemel, mmf)).toBeNull(); // bought through a bank with a distribution agreement: no custody fee (MF-26, BANK-18)
    expect(feeShieldPair(bundle, brk, mmf)).toBeNull();
  });
});
