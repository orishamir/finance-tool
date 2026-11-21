// A typed account built on a house moved into a deal (method §10.4), with the dollar moving (A-03 = +3% a year over 20 years), on every index
// the page prices: on the deal's terms it leaves what it left before on every fund, to the shekel (exceptions-fixtures.ts). move.test.ts runs
// a slice of this on a few indices.
import { describe, expect, it } from "vitest";
import type { CustomBroker } from "../custom-entries";
import { compare, differing, fig, houses, on, plan, readBack } from "./move-fixtures";

describe("the move with the dollar moving: A-03 = +3% a year over 20 years, on every index", () => {
  const at = (amount: number) => ({ ...plan, amountNow: amount, years: 20, values: { ...plan.values, amount: fig(amount, "nis"), years: fig(20, "years") } });
  const shapes = houses.flatMap((id): [string, string, CustomBroker][] => [
    [id, "nothing typed", on(id, {})],
    [id, "the trade's percent alone", on(id, { tradePct: 0.07 })],
    [id, "the custody's percent and minimum", on(id, { custodyPct: 0.08, custodyMin: 1 })],
    [id, "the conversion alone", on(id, { fxPct: 0.2 })],
    [id, "the trade's minimum alone", on(id, { tradeMin: 3 })],
  ]);
  const got = compare(shapes.map((s) => s[2]), true, at(10_000), 3);
  it.each(shapes)("%s, %s: the same on every fund on the deal's terms", (_id, _, a) => {
    expect(differing(got.get(a.id)!)).toEqual([]);
  });

  it.each(shapes)("%s, %s: the deal reads back as it was written", (_id, _, a) => {
    const { wrote, read } = readBack(a);
    expect(read).toEqual(wrote);
  });

  // the third stated difference: beside a typed minimum, a maximum in dollars stands at F-84's rate, so where it binds (a large first sum)
  // and the dollar rises, the deal pays less than the account priced it at each month's rate; with the dollar still, the two agree
  const banks = ["hapoalim", "yahav", "massad"].map((id): [string, CustomBroker] => [id, on(id, { tradeMin: 3 })]);
  const big = compare(banks.map((b) => b[1]), true, at(1_000_000), 3);
  const still = compare(banks.map((b) => b[1]), true, at(1_000_000), 0);
  it.each(banks)("%s: a typed minimum over a maximum in dollars leaves no less with the dollar rising, and the same with it still", (_id, a) => {
    const rows = differing(big.get(a.id)!).filter((r) => r.abroad);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.filter((r) => r.before === null || r.after === null || r.after < r.before)).toEqual([]);
    expect(differing(still.get(a.id)!).filter((r) => r.abroad)).toEqual([]);
  });
});
