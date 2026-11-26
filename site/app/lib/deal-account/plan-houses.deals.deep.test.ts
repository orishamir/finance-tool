// F-128 on every index the page prices, at the page's plan: a deal filled from a house's whole price list and left as filled leaves what the
// house's own row leaves on every fund, except where F-128 states it does not, each exception proven by its cause (exceptions-fixtures.ts),
// and carries the same open questions. plan.test.ts runs the same on a few indices.
import { describe, expect, it } from "vitest";
import { dealProviderId } from "./bundle";
import { flagsOf, housesBeside, onHouse } from "./plan-fixtures";

function must<T>(v: T | null | undefined, what: string): T {
  if (v === null || v === undefined) throw new Error(`missing: ${what}`);
  return v;
}

describe("F-128 a deal filled from a house prices as the house does, on every index", () => {
  const s = housesBeside();

  it.each(s.houses)("%s: the same value left on every fund of every index, to the shekel, on the deal's terms; as it is, less only where a stated exception's cause is", (id) => {
    const r = onHouse(s, id);
    expect(r.notCustom).toEqual([]);
    expect(r.compared).toBeGreaterThan(0);
    expect(r.unexplained).toEqual([]);
    expect(r.onTerms).toEqual([]);
  });

  it("carries the open questions of the prices it reads on its value figure on every fund of every index, as its house's row does (F-12: Interactive Israel's minimum in Europe, BRK OQ25)", () => {
    const funds = s.indices.flatMap((ix) => s.views.get(ix)!.options.flatMap((o) => o.funds));
    expect(funds.filter((f) => flagsOf(f, "interactive-israel")?.includes("BRK-OQ25")).length).toBeGreaterThan(0);
    // where a stated exception changes the house (Interactive Israel's recurring plan, which a deal has not), the deal buys otherwise and
    // its run's own open questions follow how it buys (F-133: TX2-OQ4 where a payout waits at an interval), so the two are compared on the
    // deal's terms, as the values are
    const id = "interactive-israel";
    const on = s.terms.changed.has(id) ? s.termsViews() : s.views;
    const fundsOn = s.indices.flatMap((ix) => must(on.get(ix), `the view of ${ix}`).options.flatMap((o) => o.funds));
    for (const f of fundsOn) expect([f.rec.id, flagsOf(f, dealProviderId(`deal-${id}`))]).toEqual([f.rec.id, flagsOf(f, id)]);
  });
});
