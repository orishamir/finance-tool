import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { bandLayer, bandWeight, ease, equalLines, laterShare, RegionMap, stripedPairs, type RegionGrid } from "./region-map";

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

describe("the band's mix (F-131, ט5)", () => {
  const look = { period: 5, texture: 0.45 };

  it("gives Q, the later area, half of (1 − s) where P leads and the rest where Q leads: half on the equal line, nothing swapping there", () => {
    expect([laterShare(0, 1, 1), laterShare(1, 0, 1)]).toEqual([0, 1]);
    expect([laterShare(0, 1, 0), laterShare(1, 0, 0)]).toEqual([0.5, 0.5]);
    expect(laterShare(0, 1, 0.2)).toBeCloseTo(0.4, 12);
    expect(laterShare(1, 0, 0.2)).toBeCloseTo(0.6, 12);
  });

  it("eases the smooth part narrowly: 0.5 + sign(q − 0.5) |2 (q − 0.5)|^0.35 / 2", () => {
    expect([ease(0), ease(0.5), ease(1)]).toEqual([0, 0.5, 1]);
    // 0.5 + 0.5^0.35 / 2 = 0.892; 0.5 − 0.2^0.35 / 2 = 0.215
    expect(ease(0.75)).toBeCloseTo(0.892, 3);
    expect(ease(0.4)).toBeCloseTo(0.215, 3);
  });

  it("weighs Q at 0.55 of the eased share and 0.45 where the 45° pattern, fract((x + y) / 5), is under the share", () => {
    expect([bandWeight(0, 1, 1, look), bandWeight(1, 1, 1, look)]).toEqual([0, 1]);
    // q = 0.5: the pattern at (1, 1) is 0.4, under it; at (2, 1) 0.6, over it
    expect(bandWeight(0.5, 1, 1, look)).toBeCloseTo(0.725, 12);
    expect(bandWeight(0.5, 2, 1, look)).toBeCloseTo(0.275, 12);
    // the pattern repeats along x + y every 5 px
    expect(bandWeight(0.3, 7, 4, look)).toBe(bandWeight(0.3, 2, 4, look));
    // counted by cover, a stripe thinner than a pixel fades with its share: a twentieth of the period under a pixel 1 px each way
    expect(bandWeight(0.05, 0, 0.125, look, 1)).toBeCloseTo(0.55 * ease(0.05) + (0.45 * 0.25) / 2, 12);
    expect(bandWeight(0.01, 0, 0.025, look, 1)).toBeLessThan(bandWeight(0.05, 0, 0.125, look, 1));
  });
});

describe("the band's layer over a grid", () => {
  // 21 columns, two rows: area 0 leads left of column 10 and area 1 from it, by |i − 10| / 6, clearly from 6 columns away
  const cols = 21;
  const lead = (i: number) => Math.min(1, Math.abs(i - 10) / 6);
  const grid: RegionGrid = {
    cols,
    rows: 2,
    first: [...Array(cols * 2).keys()].map((k) => ((k % cols) < 10 ? 0 : 1)),
    second: [...Array(cols * 2).keys()].map((k) => (lead(k % cols) < 1 ? ((k % cols) < 10 ? 1 : 0) : -1)),
    ahead: [...Array(cols * 2).keys()].map((k) => lead(k % cols)),
  };
  const [w, h] = [201, 21];
  // P black and Q white, so a pixel's red is Q's weight
  const px = bandLayer(grid, w, h, { period: 5, texture: 0.45, scale: 1 }, (k) => (k === 0 ? [0, 0, 0] : [255, 255, 255]));
  const at = (x: number, y: number) => ({ q: (px[(y * w + x) * 4] ?? 0) / 255, alpha: px[(y * w + x) * 4 + 3] ?? 0 });
  const gx = (x: number) => (20 * x) / (w - 1);

  it("is clear where one area leads clearly, so the grid's solid colour shows", () => {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) if (gx(x) <= 4 || gx(x) >= 16) expect(at(x, y).alpha, `${x}, ${y}`).toBe(0);
  });

  it("runs on across the equal line: a pixel and the next one of the same pattern, 5 px on, either side of it differ only by the smooth part", () => {
    // the line is at column 10, pixel 100; pixels 98 and 103 lie on the pattern's same phase (x + y moves by 5). Only the smooth part
    // changes between them, steeply near the line; stripes that swapped there would differ by the texture's whole 0.45 as well
    for (let y = 0; y < h; y++) expect(Math.abs(at(98, y).q - at(103, y).q), `${y}`).toBeLessThan(0.25);
  });

  it("is half and half on the equal line, between its pattern's two weights there", () => {
    const qs = [...Array(h).keys()].map((y) => at(100, y).q);
    // each pixel between 0.275 and 0.725, the pattern's two weights (a pixel on a stripe's edge between them)
    for (const q of qs) expect(q > 0.27 && q < 0.73, `${q}`).toBe(true);
    const mean = qs.reduce((n, q) => n + q, 0) / qs.length;
    expect(Math.abs(mean - 0.5)).toBeLessThan(0.1);
  });

  it("moves towards each one's own colour as its lead grows", () => {
    const meanAt = (x: number) => [...Array(h).keys()].reduce((n, y) => n + at(x, y).q, 0) / h;
    expect(meanAt(60)).toBeLessThan(meanAt(90));
    expect(meanAt(140)).toBeGreaterThan(meanAt(110));
    expect(meanAt(45)).toBeLessThan(0.15);
    expect(meanAt(155)).toBeGreaterThan(0.85);
  });
});

describe("the legend's items for the band", () => {
  const SAME = "about the same";
  const legendOf = (field: RegionGrid) =>
    renderToString(
      createElement(RegionMap, {
        max: { x: 100, y: 100 },
        areas: [{ id: "p", name: "P", tone: "region-1" }, { id: "q", name: "Q", tone: "region-2" }],
        field: { ...field, from: 1 },
        edge: { cols: 2, rows: 1, first: [0, 0], second: [-1, -1], ahead: [1, 1] },
        edgeLabel: (id: string) => ({ text: id }),
        bandLabel: { text: SAME, pair: (a: string, b: string) => `${a} & ${b}: ${SAME}` },
        mark: { at: [10, 10], label: { text: "mark" } },
        guides: [],
        xTitle: "x",
        yTitle: "y",
        xTick: String,
        yTick: String,
        snap: { x: 1, y: 1 },
        renderTip: () => null,
      }),
    );

  it("names each pair whose band shows, the earlier area first, with the pair in its title", () => {
    const g = planeGrid();
    // every node of this plane is within θ
    expect(stripedPairs(g)).toEqual([[0, 1]]);
    expect(legendOf(g)).toContain(SAME);
    expect(legendOf(g)).toContain(`P &amp; Q: ${SAME}`);
  });

  it("leaves out a pair whose band covers under a hundredth of the plot", () => {
    const g = planeGrid();
    // the lead under 1 only at one node of the 121
    const one: RegionGrid = { ...g, ahead: g.ahead.map((a, k) => (k === 60 ? 0.5 : 1)) };
    expect(stripedPairs(one)).toEqual([]);
    const two: RegionGrid = { ...g, ahead: g.ahead.map((a, k) => (k === 60 || k === 61 ? 0.5 : 1)) };
    expect(stripedPairs(two).length).toBe(1);
  });

  it("is absent where no two areas are within θ anywhere", () => {
    const g = planeGrid();
    const clear: RegionGrid = { ...g, second: g.second.map(() => -1), ahead: g.ahead.map(() => 1) };
    expect(stripedPairs(clear)).toEqual([]);
    expect(legendOf(clear)).not.toContain(SAME);
  });
});
