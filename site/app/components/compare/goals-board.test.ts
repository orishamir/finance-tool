import { describe, expect, it } from "vitest";
import { dropOrder } from "./goals-board";

// Three 100px chips on one row, right to left as on the page: a at 300-400, b at 180-280, c at 60-160.
const row = new Map([
  ["a", { left: 300, right: 400, top: 0, bottom: 44 }],
  ["b", { left: 180, right: 280, top: 0, bottom: 44 }],
  ["c", { left: 60, right: 160, top: 0, bottom: 44 }],
]);

describe("dropOrder", () => {
  it("puts the chip after the nearest one when the pointer is past its middle toward the end (left in RTL)", () => {
    expect(dropOrder(["a", "b", "c"], "a", 200, 20, row, true)).toEqual(["b", "a", "c"]);
    expect(dropOrder(["a", "b", "c"], "a", 70, 20, row, true)).toEqual(["b", "c", "a"]);
  });

  it("puts it before the nearest one when the pointer is on its start side (right in RTL)", () => {
    expect(dropOrder(["a", "b", "c"], "c", 390, 20, row, true)).toEqual(["c", "a", "b"]);
    expect(dropOrder(["a", "b", "c"], "c", 260, 20, row, true)).toEqual(["a", "c", "b"]);
  });

  it("reads the sides the other way round left to right", () => {
    expect(dropOrder(["c", "b", "a"], "c", 390, 20, row, false)).toEqual(["b", "a", "c"]);
  });

  it("prefers a chip on the pointer's row over a nearer-looking one on another row", () => {
    const wrapped = new Map([
      ["a", { left: 300, right: 400, top: 0, bottom: 44 }],
      ["b", { left: 180, right: 280, top: 0, bottom: 44 }],
      ["c", { left: 300, right: 400, top: 52, bottom: 96 }],
    ]);
    // On the second row, left of c: lands after c, not beside b.
    expect(dropOrder(["a", "b", "c"], "a", 250, 70, wrapped, true)).toEqual(["b", "c", "a"]);
  });

  it("keeps the order when there is nothing to measure", () => {
    expect(dropOrder(["a", "b"], "a", 0, 0, new Map(), true)).toEqual(["a", "b"]);
  });
});
