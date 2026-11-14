// Several cells chosen at once (cell-select.ts): the rectangle a drag covers, a cell spanning columns or rows included where it reaches
// in, and Shift+click adding or taking out one cell.
import { describe, expect, it } from "vitest";
import { rectKeys, toggled, type CellPlace } from "./cell-select";

/** A grid of two rows of two cells, a cell over both columns between them (a row's part line), and one down both of the last rows. */
const cells: CellPlace[] = [
  { key: "a", row: 0, rows: 1, from: 0, span: 1 },
  { key: "b", row: 0, rows: 1, from: 1, span: 1 },
  { key: "line", row: 1, rows: 1, from: 0, span: 2 },
  { key: "c", row: 2, rows: 1, from: 0, span: 1 },
  { key: "down", row: 2, rows: 2, from: 1, span: 1 },
  { key: "d", row: 3, rows: 1, from: 0, span: 1 },
];
const at = (k: string) => cells.find((c) => c.key === k)!;

describe("the cells a drag chooses", () => {
  it("are every cell of the rectangle from the cell it started on to the one under the pointer, either way round", () => {
    expect(rectKeys(cells, at("a"), at("b"))).toEqual(["a", "b"]);
    expect(rectKeys(cells, at("b"), at("c"))).toEqual(["a", "b", "line", "c", "down"]);
    expect(rectKeys(cells, at("c"), at("b"))).toEqual(rectKeys(cells, at("b"), at("c")));
  });
  it("take in a cell that reaches into the rectangle, which runs over the whole places of the two cells it is drawn between", () => {
    expect(rectKeys(cells, at("d"), at("d"))).toEqual(["d"]);
    expect(rectKeys(cells, at("d"), at("down"))).toEqual(["c", "down", "d"]);
    expect(rectKeys(cells, at("a"), at("a"))).toEqual(["a"]);
  });
});

describe("Shift+click", () => {
  it("adds a cell, or takes it out where it is chosen", () => {
    expect(toggled(new Set(["a"]), "b")).toEqual(["a", "b"]);
    expect(toggled(new Set(["a", "b"]), "a")).toEqual(["b"]);
  });
});
