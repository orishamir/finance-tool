import { describe, expect, it } from "vitest";
import { foldShown, heldFoldHeight } from "./pick-list-hold";

describe("PickList's phone fold", () => {
  // the S&P 500 on a phone in small: six places, the unhedged group's first row at 0 and the hedged group's only row at 6
  const order = (sel: number) => Array.from({ length: 10 }, (_, i) => ({ heading: i === 0 || i === 6, selected: i === sel }));
  it("shows the same rows whichever row is chosen, a group's heading row included", () => {
    const plain = foldShown(order(0), 6);
    // choosing the hedged group's only fund (it opens its group) hid the row above it on a phone (170 px)
    expect([...foldShown(order(6), 6)].sort()).toEqual([...plain].sort());
    expect(plain.size).toBe(6);
    // a chosen row past the places takes the last free one: the count never changes
    expect(foldShown(order(9), 6).size).toBe(6);
    expect(foldShown(order(9), 6).has(9)).toBe(true);
  });

  it("holds the tallest rows of any order and any choice, not the order it opened in", () => {
    const keys = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const tall = new Map([["h", 233]]);
    const height = (k: string) => tall.get(k) ?? 100;
    // at one account the tall row "h" sorts last and cannot be chosen; at another it sorts third
    const at1 = { keys, headings: new Set(["a", "e"]), choosable: new Set(["a", "b", "c", "d", "e", "f", "g"]) };
    const at2 = { keys: ["a", "b", "h", "c", "d", "e", "f", "g"], headings: new Set(["a", "e"]), choosable: new Set(["a", "b", "c", "d", "e", "f", "g"]) };
    expect(heldFoldHeight([at1], 4, height)).toBe(400);
    expect(heldFoldHeight([at1, at2], 4, height)).toBe(300 + 233);
  });
});
