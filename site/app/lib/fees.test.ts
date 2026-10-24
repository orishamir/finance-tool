import { describe, expect, it } from "vitest";
import { rankedFor, ranksOf, softensAvoid, type ComparisonSet } from "./fees";

describe("the fee page's ranked sentence (A9)", () => {
  const entries = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];
  const ranks = ranksOf(entries, ["a"]);
  const set: ComparisonSet = { goalName: "g", candidates: [], ranks };

  it("numbers the options, ties sharing a place", () => {
    expect(ranks.a).toEqual({ rank: 1, tied: false });
    expect(ranks.b).toEqual({ rank: 2, tied: false });
    expect(ranks.c).toEqual({ rank: 3, tied: false });
    expect(ranks.d).toEqual({ rank: 4, tied: false });
    expect(ranksOf(entries, ["a", "b"])).toMatchObject({ a: { rank: 1, tied: true }, b: { rank: 1, tied: true }, c: { rank: 3, tied: false } });
  });
  it("does not chain ties: 0.4 % below second and second 0.4 % below top is not first (F-80)", () => {
    // engine tie set is pairwise with the top: only a, b; c is within theta of b but not of a
    const r = ranksOf([{ id: "a" }, { id: "b" }, { id: "c" }], ["a", "b"]);
    expect(r.c!.rank).toBe(3);
    expect(softensAvoid("avoid", r.c!)).toBe(false);
  });
  it("selects the subject's place, and nothing when there is no comparison or the option is not ranked", () => {
    expect(rankedFor(set, "a")?.rank).toBe(1);
    expect(rankedFor(set, "zzz")).toBeNull();
    expect(rankedFor(null, "a")).toBeNull();
  });
  it("softens the avoid badge only for the first place", () => {
    expect(softensAvoid("avoid", rankedFor(set, "a"))).toBe(true);
    expect(softensAvoid("avoid", rankedFor(set, "d"))).toBe(false);
    expect(softensAvoid("avoid", null)).toBe(false);
    expect(softensAvoid("negotiate", rankedFor(set, "a"))).toBe(false);
  });
});
