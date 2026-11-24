import { describe, expect, it } from "vitest";
import { bestRanked } from "./rank";

describe("the best of a fund's prices (F-80)", () => {
  it("is never a price on an open rule while a ranked one exists, whatever it leaves", () => {
    const ways = [
      { id: "open", open: true, v: 120 },
      { id: "ranked", open: false, v: 100 },
    ];
    expect(bestRanked(ways, (w) => w.v)?.id).toBe("ranked");
  });

  it("is the open one that leaves the most where none is ranked, and none where there is none", () => {
    expect(bestRanked([{ id: "a", open: true, v: 90 }, { id: "b", open: true, v: 95 }], (w) => w.v)?.id).toBe("b");
    expect(bestRanked([] as { open: boolean }[], () => 0)).toBeUndefined();
  });
});
