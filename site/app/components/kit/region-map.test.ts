import { describe, expect, it } from "vitest";
import { equalLines, secondShare, type RegionGrid } from "./region-map";

/** A grid whose two areas' lead is a plane, d = (i + 0.5 j − 6.3) / 10 in grid units: area 0 leads where d > 0, area 1 where d < 0, each
 *  ahead by |d|, so the two are equal on the line i + 0.5 j = 6.3. */
function planeGrid(): RegionGrid {
  const cols = 11;
  const rows = 11;
  const first: number[] = [];
  const second: number[] = [];
  const ahead: number[] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const d = (i + 0.5 * j - 6.3) / 10;
      first.push(d > 0 ? 0 : 1);
      second.push(d > 0 ? 1 : 0);
      ahead.push(Math.abs(d));
    }
  return { cols, rows, first, second, ahead };
}

describe("the line where two areas are equal", () => {
  it("runs through the points where the leads either side cancel, between the nodes, not along the cells", () => {
    const segs = equalLines(planeGrid());
    expect(segs.length).toBeGreaterThan(5);
    for (const [x0, y0, x1, y1] of segs) {
      expect(x0 + 0.5 * y0).toBeCloseTo(6.3, 9);
      expect(x1 + 0.5 * y1).toBeCloseTo(6.3, 9);
    }
    // slanted, as the line is: no piece runs along a row or a column
    expect(segs.every(([x0, y0, x1, y1]) => x0 !== x1 && y0 !== y1)).toBe(true);
  });

  it("draws nothing where one area leads everywhere", () => {
    const g = planeGrid();
    expect(equalLines({ ...g, first: g.first.map(() => 0) })).toEqual([]);
  });
});

describe("the next one's share of a point's colour (F-131: half of (1 − s) to the 6th power)", () => {
  it("is half where the two are equal and none once the leader is clearly ahead", () => {
    expect([secondShare(0), secondShare(1)]).toEqual([0.5, 0]);
  });

  it("falls fast: under a tenth a quarter of the way to clearly ahead, where an even fade still gave three eighths", () => {
    // 0.5 × 0.75⁶ = 0.089; 0.5 × 0.5⁶ = 0.0078
    expect(secondShare(0.25)).toBeCloseTo(0.089, 3);
    expect(secondShare(0.5)).toBeCloseTo(0.0078, 4);
    for (let s = 0; s < 1; s += 0.05) expect(secondShare(s + 0.05)).toBeLessThan(secondShare(s));
  });
});
