import { describe, expect, it } from "vitest";
import { bundle, plan } from "../components/invest/render-fixtures";
import { allFunds, pickOfHeadline } from "../components/invest/pair";
import { pickableGroups, withGroupPick } from "./group-pick";
import { indexById, knownIndices, refOfCustom } from "./invest";
import { work } from "./invest-work";

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
      const changes = work.changes(bundle, { index, plan, house: pick.house, fund: pick.fund, group: null, shares: [-20, 0, 20] });
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

describe("a house's group picked: the sweep names the group, and the worker adds its account to the data it already holds", () => {
  const index = indexById(bundle, "index-sp500");
  if (!index) throw new Error("the collected data has the S&P 500");
  const view = work.view(bundle, { index, plan, yourBroker: null });
  // the first house and fund the page offers a group for
  const found = allFunds(view).flatMap((f) => view.providers.flatMap((p) => { const at = f.byHouse[p.id]; const keys = at && "valueN" in at ? [...pickableGroups(bundle.snapshots.find((s) => s.id === p.id), f.option)] : []; return keys.map((key) => ({ house: p.id, short: p.short, fund: f.rec.id, key })); }))[0];
  it("the data has a group to pick", () => expect(found).toBeTruthy());
  if (!found) return;
  it("the same sweep as on the data with the group's account in it", () => {
    const g = withGroupPick({ bundle, index, plan }, view, found.house, found.key, found.short);
    if (!g) throw new Error("the group's account is priced");
    const shares = [-20, 0, 20];
    const byName = work.changes(bundle, { index, plan, house: g.id, fund: found.fund, group: { house: found.house, key: found.key, short: found.short }, shares });
    expect(byName).not.toBeNull();
    expect(byName).toEqual(work.changes(g.bundle, { index, plan, house: g.id, fund: found.fund, group: null, shares }));
    // on the page's data alone, the group's account is not there to price
    expect(work.changes(bundle, { index, plan, house: g.id, fund: found.fund, group: null, shares })).toBeNull();
  });
});
