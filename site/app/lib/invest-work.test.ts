import { describe, expect, it } from "vitest";
import { bundle, plan } from "../components/invest/render-fixtures";
import { pickOfHeadline } from "../components/invest/pair";
import { indexById, knownIndices, providersOfInvest, refOfCustom, tieShareOf } from "./invest";
import { leftWith, mapCache, work } from "./invest-work";
import { accountMap } from "./account-map";
import { entered } from "./value";
import { p05Range } from "./engine";

/** Where a value holds something a structured clone would not copy as it is: a function, a getter, an object of a class. */
function notPlain(v: unknown, at = "", seen = new Set<object>()): string[] {
  if (typeof v === "function") return [at];
  if (v === null || typeof v !== "object" || seen.has(v)) return [];
  seen.add(v);
  const proto = Object.getPrototypeOf(v);
  if (proto !== Object.prototype && proto !== Array.prototype) return [`${at} (a ${String(v.constructor?.name)})`];
  return Object.entries(Object.getOwnPropertyDescriptors(v)).flatMap(([k, d]) => ("value" in d ? notPlain(d.value, `${at}.${k}`, seen) : [`${at}.${k} (a getter)`]));
}

describe("the index page's work is plain data both ways, as the worker sends it (lib/invest-worker.ts)", () => {
  for (const ref of knownIndices(bundle)) {
    it(`${ref.name}: the view and the F-89 sweep on its pair`, () => {
      const index = ref;
      const ask = { index, plan, yourBroker: null };
      expect(notPlain(ask)).toEqual([]);
      const view = work.view(bundle, ask);
      expect([...new Set(notPlain(view, "view").map((p) => p.replace(/\.byHouse\.[^.]+/, ".byHouse.*")))]).toEqual([]);
      expect(() => structuredClone(view)).not.toThrow();
      const pick = pickOfHeadline(view);
      if (!pick) return;
      // the split by fee line takes a run per line, and only the account list of an index with no fund to price shows it
      expect(view.houses.filter((h) => h.split).map((h) => h.provider.id)).toEqual([]);
      const changes = work.changes(bundle, { index, plan, house: pick.house, fund: pick.fund, shares: [-20, 0, 20] });
      expect(notPlain(changes)).toEqual([]);
      expect(changes?.lines.map((l) => l.ys.length)).toEqual([3, 3, 3, 3]);
    });
  }

  it("an index with no fund to price: its view, with the split by fee line of every priced house its account list shows", () => {
    const view = work.view(bundle, { index: refOfCustom({ id: "custom-nikkei", name: "ניקיי 225", israeli: false, added: bundle.today }), plan, yourBroker: null });
    expect(notPlain(view, "view")).toEqual([]);
    const priced = view.houses.filter((h) => h.generic);
    expect(priced.length).toBeGreaterThan(0);
    expect(priced.filter((h) => !h.split).map((h) => h.provider.id)).toEqual([]);
  });
});

describe("the account map's work (F-131)", () => {
  it("fails naming P-05 where it has no slider range to reach, never a map on axes of 0", () => {
    const index = knownIndices(bundle)[0];
    if (!index) throw new Error("missing: an index");
    const view = work.view(bundle, { index, plan, yourBroker: null });
    const pick = pickOfHeadline(view);
    if (!pick) throw new Error("missing: the page's pair");
    const { sliders: _gone, ...rest } = bundle.p05 as unknown as Record<string, unknown>;
    const bare = { ...bundle, p05: rest as unknown as typeof bundle.p05 };
    expect(() => work.map(bare, { index, plan, fund: pick.fund })).toThrow(/P-05 has no slider range for amount_now/);
  });
});

describe("the account map's prices are kept between maps (F-131, lib/map-surface.ts)", () => {
  it("a map whose amount moved reads the points it shares with the one before, and is the map worked out afresh", () => {
    const index = indexById(bundle, "index-sp500");
    if (!index) throw new Error("missing: the S&P 500");
    const at = (amount: number) => ({ ...plan, amountNow: amount, values: { ...plan.values, amount: entered(amount, "nis", bundle.today) } });
    const fund = pickOfHeadline(work.view(bundle, { index, plan, yourBroker: null }))?.fund;
    if (!fund) throw new Error("missing: the page's pair");
    work.map(bundle, { index, plan: at(10_000), fund });
    const kept = mapCache().points;
    const moved = work.map(bundle, { index, plan: at(12_000), fund });
    const slider = (key: string) => p05Range(bundle.p05, "sliders", key)?.max ?? NaN;
    // afresh, counting the points it reads
    const read = new Set<string>();
    const price = leftWith(bundle, index, at(12_000), fund);
    const fresh = accountMap({ leftAt: (a, m, h) => (read.add(`${a}|${m}`), price(a, m, h)), order: providersOfInvest(bundle).map((s) => s.id), theta: tieShareOf(bundle), plan: { amount: 12_000, monthly: plan.monthly }, reach: { amount: slider("amount_now"), monthly: slider("monthly_deposit") } });
    expect(moved).toEqual({ kind: "map", map: fresh });
    // fewer than half of its points are new
    expect(mapCache().points - kept).toBeLessThan(read.size / 2);
  });
});
