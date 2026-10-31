// "השקעה במדד" on the collected data (spec §8): the founder's plan, the grid, the custom index and D27.
import { describe, expect, it } from "vitest";
import { buildInvest, cheapestWay, pairCosts, indexById, knownIndices, matchKnownIndex, optionOfFund, rangeOverKnownIndices, refOfCustom, venueOfBand, type CustomIndex } from "./invest";
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

  it("marks the three houses that print a standing-order price, and only them", () => {
    const marked = view.houses.filter((h) => h.entries.some((e) => e.price?.standing)).map((h) => h.provider.id);
    expect(marked.sort()).toEqual(["fibi", "leumi", "massad"]);
  });

  it("lists the equity indices of the records, none chosen for the person", () => {
    expect(knownIndices(bundle).map((i) => i.id)).toContain("index-sp500");
    expect(knownIndices(bundle).every((i) => i.exposure?.kind === "equity_index")).toBe(true);
  });

  it("the founder's plan: the cheapest way is Fair with a tracking fund, priced with the fund's own class", () => {
    expect(view.headline).not.toBeNull();
    expect(view.headline!.providerId).toBe("fair");
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
    expect(w?.providerId).toBe("fair");
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

  it("opens on an unhedged fund (founder, 2026-10-28); hedged funds stay in the list, priced and pickable", () => {
    const world = indexById(bundle, "index-msci-world")!;
    const v = buildInvest({ bundle, index: world, plan: plan() });
    const funds = v.options.flatMap((o) => o.funds);
    const hedged = funds.filter((f) => f.rec.hedged === true && f.best);
    expect(hedged.length).toBeGreaterThan(0);
    // 2026-10-29 (F-92): a hedged fund's shortfall beyond its fees is counted, so none leaves more than the headline on a steady dollar;
    // the one with no full year in its report is listed with its reason, not priced
    expect(Math.max(...hedged.map((f) => f.best!.valueN))).toBeLessThan(v.headline!.valueN);
    expect(funds.find((f) => f.rec.id === "5140165")!.reason).toEqual({ code: "no-hedge-record" });
    expect(v.headline!.fund.rec.hedged).not.toBe(true);
    const unhedged = funds.filter((f) => f.rec.hedged !== true && f.best && !f.best.open);
    expect(v.headline!.valueN).toBe(Math.max(...unhedged.map((f) => f.best!.valueN)));
    // the goal comparison's cheapest way for the index is the same pair
    expect(cheapestWay(bundle, world, plan())!.fundRecordId).toBe(v.headline!.fund.rec.id);
  });

  it("a hedged fund is not moved by the dollar against the shekel; an unhedged one is (F-04, 2026-10-29)", () => {
    const sp500 = indexById(bundle, "index-sp500")!;
    const at = (fx: number, id: string) => {
      const v = buildInvest({ bundle, index: sp500, plan: plan(), assumptions: { fxChange: fx } });
      return v.options.flatMap((o) => o.funds).find((f) => f.rec.id === id)!.best!.valueN;
    };
    expect(at(-3, "5127527")).toBeCloseTo(at(3, "5127527"), 6);
    expect(at(3, "5139282")).toBeGreaterThan(at(-3, "5139282"));
  });

  it("reads the exchange a tariff band names", () => {
    expect(venueOfBand('מניות הנסחרות בארה"ב')).toBe("us");
    expect(venueOfBand("מניות ו-ETF הנסחרות בבורסות אירופה")).toBe("europe");
    expect(venueOfBand("מסלול ONE")).toBeNull();
  });
});

describe("one account and one fund, broken down (2026-10-27)", () => {
  const view = buildInvest({ bundle, index: sp, plan: plan() });
  const w = view.headline!;
  const pc = pairCosts({ bundle, index: sp, plan: plan(), fundId: w.fund.rec.id, providerId: w.providerId })!;
  const num = (v: { value: unknown }) => v.value as number;

  it("each way keeps what the account charges, by its tariff lines", () => {
    const at = w.fund.byHouse[w.providerId] as { accountCost: number; lines: { cost: number }[]; interaction: number };
    expect(at.lines.length).toBeGreaterThan(0);
    expect(at.lines.reduce((a, l) => a + l.cost, 0) + at.interaction).toBeCloseTo(at.accountCost, 6);
  });

  it("the pair: the same value left as the list, the account's lines, the fund's fee and the tax", () => {
    expect(num(pc.left)).toBeCloseTo(w.valueN, 6);
    expect(num(pc.paidIn)).toBeCloseTo(6000 + 400 * 240, 6);
    expect(pc.account.length).toBeGreaterThan(0);
    expect(num(pc.tax)).toBeGreaterThan(0);
    expect(num(pc.fund)).toBeGreaterThanOrEqual(0);
  });

  it("the parts add up: what is left plus every cost is the same for every way, so a gap in what is left is the gap in cost (F-91)", () => {
    const all = (v: typeof view) => v.options.flatMap((o) => o.funds).flatMap((f) => Object.entries(f.byHouse).flatMap(([house, at]) => ("valueN" in at ? [{ fund: f.rec.id, house, at }] : [])));
    for (const [ix, ret] of [[sp, 7], [indexById(bundle, "index-ta125")!, 5], [indexById(bundle, "index-msci-world")!, 7]] as const) {
      const v = buildInvest({ bundle, index: ix, plan: plan({}, ret) });
      const ways = all(v);
      expect(ways.length).toBeGreaterThan(10);
      const sums = ways.map(({ fund, house, at }) => {
        const p = pairCosts({ bundle, index: ix, plan: plan({}, ret), fundId: fund, providerId: house })!;
        const cost = p.account.reduce((a, l) => a + num(l.cost), 0) + p.interaction + num(p.fund) + num(p.tax);
        // the account's part is the figure the accounts list shows for the same way
        expect(p.account.reduce((a, l) => a + num(l.cost), 0) + p.interaction).toBeCloseTo(at.accountCost, 6);
        expect(num(p.left) + cost).toBeCloseTo(p.base, 6);
        return p.base;
      });
      for (const b of sums) expect(b).toBeCloseTo(sums[0]!, 6);
    }
  });

  it("the parts still add up when a fund pays out (A-10): the tax paid along the way, with its lost growth, is the state's", () => {
    // no collected fund pays out yet: the cheapest one, read as if its record said it does
    const b = { ...bundle, funds: bundle.funds.map((f) => (f.id === w.fund.rec.id ? { ...f, distribution_policy: "distributing" as const } : f)) };
    const assumptions = { distributions: { [w.fund.rec.id]: { yield: 1.3, perYear: 4 } } };
    const v = buildInvest({ bundle: b, index: sp, plan: plan(), assumptions });
    const ways = v.options.flatMap((o) => o.funds).flatMap((f) => Object.entries(f.byHouse).flatMap(([house, at]) => ("valueN" in at ? [{ fund: f.rec.id, house }] : [])));
    const paying = ways.filter((x) => x.fund === w.fund.rec.id);
    expect(paying.length).toBeGreaterThan(0);
    const bases = ways.map(({ fund, house }) => {
      const p = pairCosts({ bundle: b, index: sp, plan: plan(), assumptions, fundId: fund, providerId: house })!;
      const cost = p.account.reduce((a, l) => a + num(l.cost), 0) + p.interaction + num(p.fund) + num(p.tax);
      expect(num(p.left) + cost).toBeCloseTo(p.base, 6);
      return p.base;
    });
    for (const b of bases) expect(b).toBeCloseTo(bases[0]!, 6);
    // the paying fund leaves less than the same fund held without payouts, and the difference is in the state's part
    const still = pairCosts({ bundle, index: sp, plan: plan(), fundId: w.fund.rec.id, providerId: w.providerId })!;
    const pays = pairCosts({ bundle: b, index: sp, plan: plan(), assumptions, fundId: w.fund.rec.id, providerId: w.providerId })!;
    expect(num(pays.left)).toBeLessThan(num(still.left));
    expect(num(pays.tax)).toBeGreaterThan(num(still.tax));
  });

  it("the fund's part is the same at every account", () => {
    const at = Object.entries(w.fund.byHouse).filter(([, x]) => "valueN" in x).map(([h]) => num(pairCosts({ bundle, index: sp, plan: plan(), fundId: w.fund.rec.id, providerId: h })!.fund));
    for (const f of at) expect(f).toBeCloseTo(at[0]!, 6);
  });

  it("an account that cannot price the fund gives no breakdown", () => {
    const none = Object.entries(w.fund.byHouse).find(([, v]) => "reason" in v)?.[0];
    if (none) expect(pairCosts({ bundle, index: sp, plan: plan(), fundId: w.fund.rec.id, providerId: none })).toBeNull();
  });
});

