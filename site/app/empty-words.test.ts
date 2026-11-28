// One word per empty state (docs/copy.md 3): the guide's house words, said by every cell that holds one.
import { describe, expect, it } from "vitest";
import { emptyWords, invest, track } from "./copy";

describe("the empty-state words", () => {
  it("are the copy guide's house words", () => {
    expect(emptyWords).toEqual({ notCollected: "עוד לא נאסף", notReported: "עוד לא דווח", none: "אין" });
  });
  it("are what a track's empty fee and a fund's gap say, with no word of their own", () => {
    expect(track.feeNotReported).toBe(emptyWords.notReported);
    expect(invest.kinds.gapNotCollected).toBe(emptyWords.notCollected);
  });
});
