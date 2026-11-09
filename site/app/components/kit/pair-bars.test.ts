// The yearly-returns chart's figures never touch: at 390 px "+24.8" and "+21.9" of 2024 overlapped by about 4 px. Every chart
// width a page can give it, from a 320 px phone to a computer, with years whose bars are nearly equal, far apart and on both sides of zero.
import { describe, expect, it } from "vitest";
import { pairFigures, pairGeometry, pairPads, pairScale, type PairBarYear } from "./pair-bars";
import { CHART_TEXT_PX, chartTextWidth } from "./chart-text";

const format = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(Number.isInteger(v) ? 0 : 1)}`;
const SETS: PairBarYear[][] = [
  // the S&P 500 page's years
  [{ year: 2022, a: -7.8, b: -21.8 }, { year: 2023, a: 30.1, b: 23.6 }, { year: 2024, a: 24.8, b: 21.9 }, { year: 2025, a: 2.4, b: 15.3 }],
  [{ year: 2022, a: -18.4, b: -19.1 }, { year: 2023, a: 21.9, b: 24.8 }, { year: 2024, a: 0, b: -0.4 }, { year: 2025, a: -12.5, b: 12.5 }, { year: 2026, a: 33.3, b: 33.3 }],
  [{ year: 2024, a: 124.8, b: 121.9 }, { year: 2025, a: -88.8, b: -88.1 }],
];
const H = 250;

describe("PairBars figures", () => {
  for (const [s, items] of SETS.entries())
    it(`set ${s + 1}: no two figures meet, none runs over a bar or out of the chart, at every width from 240 (a 320 px phone) to 1200 px`, () => {
      for (let w = 240; w <= 1200; w += 1) {
        const values = items.flatMap((i) => [i.a, i.b]);
        const g = pairGeometry(items.length, w, Math.max(...values.map((v) => chartTextWidth(format(v), CHART_TEXT_PX))));
        const top = Math.max(0, ...values);
        const bottom = Math.max(0, ...values.map((v) => -v));
        const y = pairScale(top, bottom, ...pairPads(items, g, top, bottom, format));
        const figs = pairFigures(items, g, y, format);
        const boxes = figs.flat().map((f) => ({ t: f.text, x1: f.x - f.w / 2, x2: f.x + f.w / 2, y1: f.y - 13, y2: f.y + 4 }));
        for (let i = 0; i < boxes.length; i++) {
          const a = boxes[i]!;
          expect(a.x1, `${a.t} at ${w}`).toBeGreaterThanOrEqual(0);
          expect(a.x2, `${a.t} at ${w}`).toBeLessThanOrEqual(w);
          expect(a.y1, `${a.t} at ${w}`).toBeGreaterThanOrEqual(0);
          // the years' line starts about 19 px above the bottom
          expect(a.y2, `${a.t} at ${w}`).toBeLessThanOrEqual(H - 20);
          for (let j = i + 1; j < boxes.length; j++) {
            const b = boxes[j]!;
            const meet = Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1) > 0 && Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1) > 0;
            expect(meet, `"${a.t}" and "${b.t}" meet at ${w} px`).toBe(false);
          }
        }
        // a figure is never drawn over a bar: neither its own nor any other
        items.forEach((it, i) =>
          ([0, 1] as const).forEach((k) => {
            const v = k === 0 ? it.a : it.b;
            const bar = { x1: g.barX(i, k), x2: g.barX(i, k) + g.bw, y1: Math.min(y(0), y(v)), y2: Math.max(y(0), y(v)) };
            for (const f of boxes) {
              // the visible figures sit between the box's top and the baseline (no descenders in figures)
              const fy1 = f.y1 + 3;
              const fy2 = f.y2 - 4;
              const over = Math.min(bar.x2, f.x2) - Math.max(bar.x1, f.x1) > 0.5 && Math.min(bar.y2, fy2) - Math.max(bar.y1, fy1) > 0.5;
              expect(over, `"${f.t}" over the ${it.year} bar ${k} at ${w} px`).toBe(false);
            }
          }),
        );
      }
    });
});
