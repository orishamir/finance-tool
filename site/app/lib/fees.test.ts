import { describe, expect, it } from "vitest";
import { outrankingOf, rankedFor, ranksOf, type ComparisonSet } from "./fees";

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
  });
  it("selects the subject's place, and nothing when there is no comparison or the option is not ranked", () => {
    expect(rankedFor(set, "a")?.rank).toBe(1);
    expect(rankedFor(set, "zzz")).toBeNull();
    expect(rankedFor(null, "a")).toBeNull();
  });
  // D90 revised the same day: "avoid" only with an option that ranks above the subject
  it("counts an alternative only where it ranks above the subject: never for the first place, never for a shared place, always for a subject with no place", () => {
    const alt = (id: string) => ({ id, name: id, lower: false });
    const all = [alt("a"), alt("b"), alt("c"), alt("d"), alt("unranked")];
    expect(outrankingOf(set, "a", all.filter((o) => o.id !== "a"))).toEqual([]);
    expect(outrankingOf(set, "c", all.filter((o) => o.id !== "c")).map((o) => o.id)).toEqual(["a", "b"]);
    const tied: ComparisonSet = { goalName: "g", candidates: [], ranks: ranksOf(entries, ["a", "b"]) };
    expect(outrankingOf(tied, "b", [alt("a")])).toEqual([]);
    expect(outrankingOf(set, "zzz", all).map((o) => o.id)).toEqual(["a", "b", "c", "d"]);
    expect(outrankingOf(null, "c", all)).toEqual([]);
  });
});
