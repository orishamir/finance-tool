// Where a carried thing lands in a sortable list, and how far the others slide (kit/sortable.ts): every place between two members and both
// ends is a landing, picked by the pointer's place along the list (no member has to be hit), across in the page's right-to-left reading
// order or down; the members between the thing's place and its landing slide one place toward where it was, by its size.
import { describe, expect, it } from "vitest";
import { around, inside, landing, placeAt, readingOrder, shifts, type Box } from "./sortable";

/** Boxes down the page: each of `heights`, with `gap` between. */
const down = (heights: number[], gap = 10, top = 100): Box[] => {
  let y = top;
  return heights.map((h) => {
    const b = { left: 0, right: 300, top: y, bottom: y + h };
    y += h + gap;
    return b;
  });
};
/** Boxes across, right to left (the first is the rightmost), each `w` wide with `gap` between. */
const across = (n: number, w = 100, gap = 8, right = 1000): Box[] => Array.from({ length: n }, (_, i) => ({ left: right - (i + 1) * w - i * gap, right: right - i * w - i * gap, top: 0, bottom: 40 }));

describe("the landing in a list down the page", () => {
  const boxes = down([40, 40, 40, 40]); // middles at 120, 170, 220, 270
  it("stays home while the pointer is on its own place", () => {
    expect(landing(boxes, 1, { x: 10, y: 160 }, "y")).toBe(1);
  });
  it("passes each member whose middle the pointer passed, both ways", () => {
    expect(landing(boxes, 1, { x: 10, y: 225 }, "y")).toBe(2);
    expect(landing(boxes, 1, { x: 10, y: 400 }, "y")).toBe(3);
    expect(landing(boxes, 1, { x: 10, y: 110 }, "y")).toBe(0);
  });
  it("lands at both ends from beyond them, with no member hit", () => {
    expect(landing(boxes, 2, { x: 10, y: -50 }, "y")).toBe(0);
    expect(landing(boxes, 0, { x: 10, y: 5000 }, "y")).toBe(3);
  });
  it("lands between every two members, a thing from outside the list too", () => {
    expect([90, 140, 190, 240, 300].map((y) => landing(boxes, null, { x: 10, y }, "y"))).toEqual([0, 1, 2, 3, 4]);
  });
});

describe("the landing in a list across, right to left", () => {
  const boxes = across(3); // the first rightmost
  it("reads the list from the right", () => {
    expect(readingOrder([...boxes].reverse(), "x")).toEqual([2, 1, 0]);
  });
  it("moves on as the pointer goes left past each middle", () => {
    const mids = boxes.map((b) => (b.left + b.right) / 2);
    expect(landing(boxes, 0, { x: mids[0]!, y: 10 }, "x")).toBe(0);
    expect(landing(boxes, 0, { x: mids[1]! - 1, y: 10 }, "x")).toBe(1);
    expect(landing(boxes, 0, { x: mids[2]! - 1, y: 10 }, "x")).toBe(2);
    expect(landing(boxes, 2, { x: 2000, y: 10 }, "x")).toBe(0);
  });
});

describe("what slides to open the gap", () => {
  it("moves the members between home and the landing one place back by the thing's size, and the thing past them", () => {
    const boxes = down([40, 60, 30], 10);
    // the first (40 tall) lands last: the other two rise by 50, it falls by 60 + 10 + 30 + 10
    expect(shifts(boxes, 0, 2, "y")).toEqual([110, -50, -50]);
    // the last lands first: the others fall by its 30 and the gap
    expect(shifts(boxes, 2, 0, "y")).toEqual([40, 40, -120]);
    expect(shifts(boxes, 1, 1, "y")).toEqual([0, 0, 0]);
  });
  it("moves across in the reading order: a step on is a step to the left", () => {
    const boxes = across(3, 100, 8);
    expect(shifts(boxes, 0, 1, "x")).toEqual([-108, 108, 0]);
  });
  it("says whether a point stands in a box, a margin around it, and the box around boxes", () => {
    const boxes = down([40, 40]);
    expect(around(boxes)).toEqual({ left: 0, right: 300, top: 100, bottom: 190 });
    expect(inside(around(boxes), { x: 310, y: 120 })).toBe(false);
    expect(inside(around(boxes), { x: 310, y: 120 }, 20)).toBe(true);
  });
});

describe("the place a carried thing is over", () => {
  const cell = { key: "cell", box: { left: 100, right: 300, top: 100, bottom: 200 }, depth: 1, fixed: false };
  const card = { key: "card", box: { left: 0, right: 1000, top: 0, bottom: 1000 }, depth: 0, fixed: false };
  const bin = { key: "bin", box: { left: 0, right: 1000, top: 800, bottom: 850 }, depth: 0, fixed: true };
  it("is the innermost place whose box holds the point", () => {
    expect(placeAt([card, cell], { x: 150, y: 150 }, { x: 150, y: 150 })).toBe("cell");
    expect(placeAt([card, cell], { x: 500, y: 150 }, { x: 500, y: 150 })).toBe("card");
    expect(placeAt([cell], { x: 500, y: 150 }, { x: 500, y: 150 })).toBeNull();
  });
  it("reads a place fixed on the screen by the screen's point, over what the page has under it", () => {
    // the page scrolled 1,000 px: the cell is at the screen's foot, under the bin
    expect(placeAt([card, cell, bin], { x: 150, y: 1820 }, { x: 150, y: 820 })).toBe("bin");
    expect(placeAt([card, cell, bin], { x: 150, y: 150 }, { x: 150, y: 150 })).toBe("cell");
  });
  it("puts a place laid over the page over the places under it, however deep they stand", () => {
    // a computer's bin drawn over the top of the block under its own
    const laid = { key: "laid", box: { left: 0, right: 1000, top: 180, bottom: 230 }, depth: 0, fixed: false, over: true };
    expect(placeAt([card, cell, laid], { x: 150, y: 190 }, { x: 150, y: 190 })).toBe("laid");
    expect(placeAt([card, cell, laid], { x: 150, y: 150 }, { x: 150, y: 150 })).toBe("cell");
    expect(placeAt([card, cell, laid, bin], { x: 150, y: 1820 }, { x: 150, y: 820 })).toBe("bin");
  });
});
