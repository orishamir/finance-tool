// "השקעה במדד" on the collected data (spec §8): the founder's plan, the grid, the custom index and D27.
import { describe, expect, it } from "vitest";
import { buildInvest, cheapestWay, indexById, knownIndices, matchKnownIndex, optionOfFund, rangeOverKnownIndices, refOfCustom, venueOfBand, type CustomIndex } from "./invest";
import { buildWorkbenchBundle } from "./providers.server";
import type { WorkbenchInputs } from "./providers";
import { entered } from "./value";

const bundle = buildWorkbenchBundle();
const t = bundle.today;
const plan = (over: Partial<WorkbenchInputs> = {}, ret = 7): WorkbenchInputs => ({
  amountNow: 6000,
  monthly: 400,
  years: 20,
  grossReturn: ret / 100,
  inflation: 0.02,
  age: null,
  income: null,
  values: { amount: entered(6000, "nis", t), monthly: entered(400, "nis_per_month", t), years: entered(20, "years", t), returnV: entered(ret, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
  fromGoal: false,
  returnFromParameter: false,
  ...over,
});
const sp = indexById(bundle, "index-sp500")!;

describe("invest page computation", () => {
  const view = buildInvest({ bundle, index: sp, plan: plan() });

  it("lists the equity indices of the records, none chosen for the person", () => {
    expect(knownIndices(bundle).map((i) => i.id)).toContain("index-sp500");
    expect(knownIndices(bundle).every((i) => i.exposure?.kind === "equity_index")).toBe(true);
  });

  it("the founder's plan: the cheapest way is Psagot Trade with a tracking fund, priced with the fund's own class", () => {
    expect(view.headline).not.toBeNull();
    expect(view.headline!.providerId).toBe("psagot");
    expect(view.headline!.option).toBe("il-tracking");
    expect(optionOfFund(view.headline!.fund.rec, sp.exposure!)).toBe("il-tracking");
  });

  it("Interactive Israel is not available where TASE units are sold", () => {
    const cellOf = (o: string) => view.options.find((x) => x.id === o)!.cells.find((c) => c.providerId === "interactive-israel")!;
    expect(cellOf("il-etf").kind).toBe("unavailable");
    expect(cellOf("il-etf").availability?.source.url).toMatch(/^http/);
    expect(cellOf("tase-foreign").kind).toBe("unavailable");
    expect(cellOf("il-tracking").kind).not.toBe("cost");
  });

  it("the abroad column has numbers or a per-broker reason, never a page error", () => {
    const abroad = view.options.find((o) => o.id === "abroad")!;
    expect(abroad.cells.length).toBe(view.providers.length);
    for (const c of abroad.cells) expect(c.kind === "cost" ? typeof c.costN === "number" : c.kind === "unavailable" || !!c.reason).toBe(true);
    expect(abroad.cells.some((c) => c.kind === "cost")).toBe(true);
    expect(abroad.cells.filter((c) => c.kind === "not-comparable").length).toBeGreaterThan(0);
  });

  it("the Europe line of Interactive Israel prices a London fund and names the exchange", () => {
    const c = view.options.find((o) => o.id === "abroad")!.cells.find((x) => x.providerId === "interactive-israel")!;
    expect(c.kind).toBe("cost");
    expect(c.venue).toBe("europe");
  });

  it("the funds of an option are ranked by value at the option's cheapest broker", () => {
    const o = view.options.find((x) => x.id === "il-tracking")!;
    const vals = o.funds.flatMap((f) => (f.best ? [f.best.valueN] : []));
    expect(vals.length).toBeGreaterThan(3);
    expect([...vals].sort((a, b) => b - a)).toEqual(vals);
    expect(o.funds.every((f) => !f.best || f.best.providerId === o.bestCell!.providerId)).toBe(true);
  });

  it("a person's broker is priced for the headline fund", () => {
    const v = buildInvest({ bundle, index: sp, plan: plan(), yourBroker: "leumi" });
    expect(v.atYours?.providerId).toBe("leumi");
    expect(v.atYours?.price).not.toBeNull();
    expect(v.atYours!.less!.value as number).toBeGreaterThan(0);
  });

  it("a custom non-Israeli index shows broker costs per option and no funds", () => {
    const c: CustomIndex = { id: "custom-nikkei", name: "ניקיי 225", israeli: false, added: t };
    const v = buildInvest({ bundle, index: refOfCustom(c), plan: plan() });
    expect(v.options.filter((o) => o.exists).map((o) => o.id)).toEqual(["il-tracking", "il-etf", "tase-foreign", "abroad"]);
    for (const o of v.options) {
      expect(o.funds).toHaveLength(0);
      expect(o.cells.some((x) => x.kind === "cost")).toBe(true);
    }
    expect(v.headline).toBeNull();
    expect(v.genericHeadline).not.toBeNull();
  });

  it("an Israeli index has two options only", () => {
    const v = buildInvest({ bundle, index: indexById(bundle, "index-ta35")!, plan: plan() });
    expect(v.options.filter((o) => o.exists).map((o) => o.id)).toEqual(["il-tracking", "il-etf"]);
  });

  it("without an entered return it says whether the order holds between 0% and 10%", () => {
    const v = buildInvest({ bundle, index: sp, plan: plan({ returnFromParameter: true }, 5) });
    expect(v.returnIllustrative).toBe(true);
    expect(v.order).not.toBeNull();
    expect(typeof v.order!.holds).toBe("boolean");
    expect(buildInvest({ bundle, index: sp, plan: plan() }).order).toBeNull();
  });

  it("a typed name that matches a known index selects it", () => {
    expect(matchKnownIndex(bundle, "S&P 500")?.id).toBe("index-sp500");
    expect(matchKnownIndex(bundle, "ניקיי 225")).toBeNull();
  });

  it("the API: the cheapest way for an index, and the range over the known indices", () => {
    const w = cheapestWay(bundle, sp, plan());
    expect(w?.providerId).toBe("psagot");
    const r = rangeOverKnownIndices(bundle, plan())!;
    expect(r.low.valueN).toBeLessThanOrEqual(r.high.valueN);
    expect(r.perIndex.length).toBeGreaterThan(3);
  });

  it("the houses: ranked by what is left, the headline's own house first, each gap measured from the headline", () => {
    const il = view.houses.filter((h) => h.group === "il" && h.best);
    expect(il[0]!.provider.id).toBe(view.headline!.providerId);
    expect(il[0]!.gap).toBeNull();
    const left = il.map((h) => h.best!.price!.valueN);
    expect([...left].sort((a, b) => b - a)).toEqual(left);
    for (const h of il.slice(1)) expect(h.gap!.value as number).toBeCloseTo(view.headline!.valueN - h.best!.price!.valueN, 6);
  });

  it("the worth lines are slices through the headline's cell: same fund at other houses, same house with other funds", () => {
    const h = view.headline!;
    const w = view.worth!;
    const sameFund = Object.values(h.fund.byHouse).flatMap((x) => ("value" in x && !x.open && x.providerId !== h.providerId ? [x.valueN] : []));
    expect(w.houseCount).toBe(sameFund.length);
    expect(w.house!.value as number).toBeCloseTo(h.valueN - Math.min(...sameFund), 6);
    const sameHouse = view.options.filter((o) => o.id !== "abroad").flatMap((o) => o.funds).flatMap((f) => { const x = f.byHouse[h.providerId]; return f.rec.id !== h.fund.rec.id && x && "value" in x && !x.open ? [x.valueN] : []; });
    expect(w.fundCount).toBe(sameHouse.length);
    expect(w.fund!.value as number).toBeCloseTo(h.valueN - Math.min(...sameHouse), 6);
  });

  it("reads the exchange a tariff band names", () => {
    expect(venueOfBand('מניות הנסחרות בארה"ב')).toBe("us");
    expect(venueOfBand("מניות ו-ETF הנסחרות בבורסות אירופה")).toBe("europe");
    expect(venueOfBand("מסלול ONE")).toBeNull();
  });
});
