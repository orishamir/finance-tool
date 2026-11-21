// A typed account built on a house moved into a deal (method §10.4), on every index the page prices: at 1,000,000 now, where every custody
// maximum binds (F-14), and with nothing typed at the page's plan, it leaves what it left before on every fund, to the shekel, except where
// one of F-128's stated exceptions is (exceptions-fixtures.ts). move.test.ts runs a slice of this on a few indices.
import { describe, expect, it } from "vitest";
import type { CustomBroker } from "../custom-entries";
import { compare, differing, fig, houses, on, plan, unstated } from "./move-fixtures";

describe("the move at 1,000,000 now over 20 years, where every custody maximum binds (F-14), on every index", () => {
  const big = { ...plan, amountNow: 1_000_000, years: 20, values: { ...plan.values, amount: fig(1_000_000, "nis"), years: fig(20, "years") } };
  const shapes = houses.flatMap((id): [string, string, CustomBroker][] => [
    [id, "nothing typed", on(id, {})],
    [id, "the custody's percent alone, 2% a year", on(id, { custodyPct: 2 })],
  ]);
  const got = compare(shapes.map((s) => s[2]), true, big);
  it.each(shapes)("%s, %s: the same on every fund on the deal's terms", (_id, _, a) => {
    expect(differing(got.get(a.id)!)).toEqual([]);
  });
});

describe("the move: an account built on a house with nothing typed, on every index", () => {
  const bare = houses.map((id) => on(id, {}));
  const got = compare(bare);
  const rows = houses.flatMap((id, i) => differing(got.get(bare[i]!.id)!).map((r) => ({ id, r })));
  const onTerms = compare(bare, true);

  it("differs only on funds bought abroad, where the deal leaves less, and nowhere on the deal's terms", () => {
    expect(rows.every(({ r }) => r.abroad)).toBe(true);
    expect(rows.filter(({ r }) => unstated(r))).toEqual([]);
    expect(houses.flatMap((id, i) => differing(onTerms.get(bare[i]!.id)!).map((r) => ({ id, r })))).toEqual([]);
  });

  it("is priced on every fund exactly where it was before", () => {
    expect(rows.filter(({ r }) => (r.before === null) !== (r.after === null))).toEqual([]);
  });
});
