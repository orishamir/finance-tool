// A typed account built on a house moved into a deal (method §10.4), each kind of typed field on every index the page prices: it leaves what it
// left before on every fund, to the shekel, except where one of F-128's stated exceptions is, each proven by its cause
// (exceptions-fixtures.ts). move.test.ts says what the move is, and runs a slice of this on a few indices.
import { describe, expect, it } from "vitest";
import type { CustomBroker } from "../custom-entries";
import { compare, differing, houses, on, unstated } from "./move-fixtures";

describe("the move: an account built on a house leaves what it left, on every index", () => {
  const shapes = houses.flatMap((id): [string, string, CustomBroker][] => [
    [id, "nothing typed", on(id, {})],
    [id, "every field typed", on(id, { tradePct: 0.05, tradeMin: 3, custodyPct: 0.08, custodyMin: 1, fxPct: 0.2, monthlyFee: 5 })],
    [id, "the trade's percent alone", on(id, { tradePct: 0.07 })],
    [id, "the custody's minimum alone", on(id, { custodyMin: 4 })],
    [id, "the custody's percent alone", on(id, { custodyPct: 0.08 })],
    [id, "the conversion alone", on(id, { fxPct: 0.2 })],
    [id, "the monthly fee alone", on(id, { monthlyFee: 5 })],
    [id, "the trade's minimum alone", on(id, { tradeMin: 3 })],
  ]);
  const got = compare(shapes.map((s) => s[2]));
  const onTerms = compare(shapes.map((s) => s[2]), true);
  it.each(shapes)("%s, %s: the same on every fund on the deal's terms; as it is, no more anywhere", (_id, _, a) => {
    expect(differing(onTerms.get(a.id)!)).toEqual([]);
    expect(differing(got.get(a.id)!).filter(unstated)).toEqual([]);
  });
});
