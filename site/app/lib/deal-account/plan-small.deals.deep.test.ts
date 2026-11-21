// F-128 on every index the page prices, at the plans of `PLANS` past the first six (smaller sums, the page's plan at A-03 of ±3%): an
// untouched deal filled from a house leaves what the house's own row leaves on every fund, except where F-128 states it does not, each
// exception proven by its cause (exceptions-fixtures.ts), and has a price exactly where the row has one. plan.test.ts runs two of the plans
// on a few indices.
import { describe, expect, it } from "vitest";
import { housesBeside, onPlan, PLANS } from "./plan-fixtures";

describe("F-128 a deal filled from a house prices as the house does, on every index, at the other plans", () => {
  const s = housesBeside();

  it.each(PLANS.slice(6))("an untouched deal leaves what its house's row leaves on every fund of every index at %s on the deal's terms, as it is less only where a stated exception's cause is, and has a price exactly where its house's row has one", (_, p, fxChange) => {
    const r = onPlan(s, p, fxChange);
    expect(r.pricedApart).toEqual([]);
    expect(r.compared).toBeGreaterThan(0);
    expect(r.unexplained).toEqual([]);
    expect(r.onTerms).toEqual([]);
  });
});
