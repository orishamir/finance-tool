// A typed account built on a group moved into a deal (method §10.4), on every index the page prices: typed today, it leaves what it left
// before on every fund, to the shekel, except where one of F-128's stated exceptions is (exceptions-fixtures.ts). move.test.ts runs a
// slice of this on a few indices.
import { describe, expect, it } from "vitest";
import { baseOf, startingPointsOf } from "../own-account";
import type { CustomBroker } from "../custom-entries";
import { account, bundle, compare, data, differing, readBack, unstated } from "./move-fixtures";

describe("the move: an account built on a group, typed today, leaves what it left, on every index", () => {
  const shapes = bundle.snapshots.flatMap((s) =>
    data.houses.some((h) => h.id === s.id)
      ? startingPointsOf(s).flatMap((p): [string, string, CustomBroker][] =>
          p.group
            ? [
                [s.id, p.nameHe, account({}, { base: baseOf(s, p) })],
                [s.id, `${p.nameHe}, every price used`, account({}, { base: { ...baseOf(s, p), group: { ...p.group, adopted: p.group.prices.map((x) => x.fee) } } })],
                [s.id, `${p.nameHe}, for two years, the trade typed`, account({ tradePct: 0.06 }, { base: baseOf(s, p), untilYears: 2 })],
              ]
            : [],
        )
      : [],
  );
  const got = compare(shapes.map((s) => s[2]));
  const onTerms = compare(shapes.map((s) => s[2]), true);
  it.each(shapes)("%s, %s: the same on every fund on the deal's terms; as it is, no more anywhere", (_id, _, a) => {
    expect(differing(onTerms.get(a.id)!)).toEqual([]);
    expect(differing(got.get(a.id)!).filter(unstated)).toEqual([]);
  });

  it.each(shapes)("%s, %s: the deal reads back as it was written", (_id, _, a) => {
    const { wrote, read } = readBack(a);
    expect(read).toEqual(wrote);
  });
});
