import { describe, expect, it } from "vitest";
import { equalLines, secondShare, stripeLayer, stripeStrength, type RegionGrid } from "./region-map";

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

describe("the stripes where two areas are about the same (F-131)", () => {
  it("come in as the lead drops below 1 and are full from 0.5 down", () => {
    expect([stripeStrength(1), stripeStrength(0.5), stripeStrength(0.2), stripeStrength(0)]).toEqual([0, 1, 1, 1]);
    for (let s = 0.5; s < 1; s += 0.05) expect(stripeStrength(s + 0.05)).toBeLessThan(stripeStrength(s));
  });

  it("lie exactly over the nodes' band, the lead under 1, in the next area's colour", () => {
    // area 0 leads everywhere, by |i − 5| / 3 up to 1: under 1 between columns 2 and 8 only, the band where area 1 is next
    const cols = 11;
    const rows = 11;
    const ahead = Array.from({ length: cols * rows }, (_, k) => Math.min(1, Math.abs((k % cols) - 5) / 3));
    const grid: RegionGrid = { cols, rows, first: ahead.map(() => 0), second: ahead.map((a) => (a < 1 ? 1 : -1)), ahead };
    const [w, h] = [201, 101];
    const px = stripeLayer(grid, w, h, { step: 6, width: 1.5, scale: 1, alpha: 0.7 }, (k) => (k === 1 ? [10, 20, 30] : [200, 200, 200]));
    let inBand = 0;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const o = (y * w + x) * 4;
        const gx = (10 * x) / (w - 1);
        const a = px[o + 3] ?? 0;
        if (gx <= 2 || gx >= 8) expect(a, `${x}, ${y}`).toBe(0);
        else if (a > 0) expect([px[o], px[o + 1], px[o + 2]]).toEqual([10, 20, 30]);
        expect(a).toBeLessThanOrEqual(Math.round(255 * 0.7));
        if (gx > 3.6 && gx < 6.4) inBand += a > 0 ? 1 : 0;
      }
    // where the lead is 0.5 or less the stripes are drawn: about a quarter of the pixels lie on a line 1.5 px wide every 6 px
    const area = [...Array(w).keys()].filter((x) => (10 * x) / (w - 1) > 3.6 && (10 * x) / (w - 1) < 6.4).length * h;
    expect(inBand / area).toBeGreaterThan(0.2);
    expect(inBand / area).toBeLessThan(0.6);
  });
});
