// Two bars for each year, from zero (2026-10-31, the index page: what each kind of fund did in the same years): years left to right, each
// bar's figure at its end. Own SVG. The two hues are the caller's, with a legend beside the chart. Each bar already has its figure and the
// years are few, so no zoom: pointing at or tapping a year sets it apart and names its two bars.
//
// No value axis (2026-11-08, charts.md: amounts written on the marks replace it): the zero line stays, and the width it held goes to the bars.
// The figures are 13 px and placed by their measured width (chart-text.ts), so none touches another at any width: the two bars of a year sit
// as far apart as two figures side by side need, when the year's room allows; where it does not (a phone), a figure that would meet its
// neighbour or run over the other bar of its year moves away from zero, above it, the larger figure further out.
import { useGlidingNumbers, useGlidingRows } from "./chart-glide";
import { ChartTip, pickDim, useChartPick } from "./chart-interact";
import { CHART_TEXT_PX, chartTextWidth } from "./chart-text";
import { useWidth } from "./marker";

const H = 250;
/** Air above the highest figure. */
const TOP = 2;
/** Room under the plot for the years. */
const BOTTOM = 24;
/** A 13 px figure's box reaches about this far above its baseline, and this far below. */
const ASC = 13;
const DESC = 4;
/** Baseline to baseline when one figure stands above another. */
const ROW = 18;
/** A figure's baseline above a rising bar's end, and below a falling one's. */
const ABOVE = 5;
const BELOW = 14;
/** Between the two bars of a year. */
const GAP_IN = 4;
/** At least between two figures side by side. */
const GAP_X = 4;
const MAX_BAR = 48;

export interface PairBarYear {
  year: number;
  a: number;
  b: number;
}

const PAIR = ["a", "b"] as const;

export interface PairGeometry {
  step: number;
  bw: number;
  /** The centre of year `i`, and the left edge of its bar `k` (0 for a, 1 for b). */
  cx: (i: number) => number;
  barX: (i: number, k: 0 | 1) => number;
}

/** Where the years and bars go across `w` px, for figures at most `widest` px wide. */
export function pairGeometry(n: number, w: number, widest: number): PairGeometry {
  const step = w / Math.max(1, n);
  // figures centred on their bars never meet a neighbouring year's while the bars' centres are this close together
  const most = step - widest - GAP_X;
  // and never meet each other once they are this far apart
  const side = widest + GAP_X;
  const bw = Math.max(6, Math.min(MAX_BAR, Math.min(side, most) - GAP_IN));
  const cx = (i: number) => i * step + step / 2;
  return { step, bw, cx, barX: (i, k) => (k === 0 ? cx(i) - GAP_IN / 2 - bw : cx(i) + GAP_IN / 2) };
}

/** The vertical scale: `top` and `bottom` the largest rise and fall, `padTop` and `padBottom` px kept for figures beyond the bars. */
export function pairScale(top: number, bottom: number, padTop: number, padBottom: number) {
  const span = top + bottom || 1;
  const y0 = TOP + padTop;
  const y1 = H - BOTTOM - padBottom;
  return (v: number) => y0 + ((top - v) / span) * (y1 - y0);
}

export interface PairFigure {
  text: string;
  /** Centre and baseline. */
  x: number;
  y: number;
  w: number;
  up: boolean;
}

/** Each year's two figures: at its bar's end, centred on it, moved out from zero where it would meet the other figure or run over the other bar. */
export function pairFigures(items: readonly PairBarYear[], g: PairGeometry, y: (v: number) => number, format: (v: number) => string): [PairFigure, PairFigure][] {
  return items.map((it, i) => {
    const vs = [it.a, it.b] as const;
    const figs = vs.map((v, k) => {
      const text = format(v);
      const w = chartTextWidth(text, CHART_TEXT_PX);
      const up = v >= 0;
      return { text, w, up, x: g.barX(i, k as 0 | 1) + g.bw / 2, y: up ? y(v) - ABOVE : y(v) + BELOW };
    }) as [PairFigure, PairFigure];
    // a figure wider than its bar that reaches over the other bar of the year clears that bar's end too
    figs.forEach((f, k) => {
      const o = 1 - k;
      const left = g.barX(i, o as 0 | 1);
      if (vs[o]! >= 0 !== f.up || f.x + f.w / 2 <= left - 1 || f.x - f.w / 2 >= left + g.bw + 1) return;
      f.y = f.up ? Math.min(f.y, y(vs[o]!) - ABOVE) : Math.max(f.y, y(vs[o]!) + BELOW);
    });
    // two figures on the same side that meet: the one further from zero goes one line further out
    const [fa, fb] = figs;
    const meetX = Math.abs(fa.x - fb.x) < (fa.w + fb.w) / 2 + GAP_X;
    if (fa.up === fb.up && meetX && Math.abs(fa.y - fb.y) < ROW) {
      const outer = fa.up ? (it.a >= it.b ? fa : fb) : it.a <= it.b ? fa : fb;
      const inner = outer === fa ? fb : fa;
      outer.y = fa.up ? Math.min(outer.y, inner.y - ROW) : Math.max(outer.y, inner.y + ROW);
    }
    return figs;
  });
}

/** The px to keep above the bars and under them so every figure stays inside the chart, the years' line included. */
export function pairPads(items: readonly PairBarYear[], g: PairGeometry, top: number, bottom: number, format: (v: number) => string): [number, number] {
  const vs = items.flatMap((i) => [i.a, i.b]);
  let pads: [number, number] = [vs.some((v) => v >= 0) ? ABOVE + ASC : 0, vs.some((v) => v < 0) ? BELOW + DESC : 0];
  for (let pass = 0; pass < 4; pass++) {
    const figs = pairFigures(items, g, pairScale(top, bottom, ...pads), format).flat();
    const over = Math.max(0, ...figs.filter((f) => f.up).map((f) => TOP - (f.y - ASC)));
    const under = Math.max(0, ...figs.filter((f) => !f.up).map((f) => f.y + DESC - (H - BOTTOM)));
    if (over < 0.5 && under < 0.5) break;
    pads = [pads[0] + Math.ceil(over) + 1, pads[1] + Math.ceil(under) + 1];
  }
  return pads;
}

export function PairBars({ items: goal, format, label, fillA, fillB, nameA, nameB, highlight }: { items: PairBarYear[]; format: (v: number) => string; label: string; fillA: string; fillB: string; nameA: string; nameB: string; /** The series set apart by the legend. */ highlight?: "a" | "b" | null }) {
  const [ref, w] = useWidth(420);
  const pick = useChartPick<number>();
  const items = useGlidingRows(goal, PAIR);
  const values = goal.flatMap((i) => [i.a, i.b]);
  // the widest figure, of the goal and of the figures on the way to it, sets the bars' spacing
  const widest = Math.max(0, ...[...values, ...items.flatMap((i) => [i.a, i.b])].map((v) => chartTextWidth(format(v), CHART_TEXT_PX)));
  const g = pairGeometry(items.length, w, widest);
  const topGoal = Math.max(0, ...values);
  const bottomGoal = Math.max(0, ...values.map((v) => -v));
  const padsGoal = pairPads(goal, g, topGoal, bottomGoal, format);
  const [top, bottom, padTop, padBottom] = useGlidingNumbers([topGoal, bottomGoal, ...padsGoal]) as [number, number, number, number];
  const y = pairScale(top, bottom, padTop, padBottom);
  const figures = pairFigures(items, g, y, format);
  const bar = (i: number, k: 0 | 1, v: number, fill: string, f: PairFigure) => (
    <g className={pickDim(highlight, PAIR[k])}>
      <rect x={g.barX(i, k)} y={Math.min(y(0), y(v))} width={g.bw} height={Math.max(1, Math.abs(y(v) - y(0)))} rx={3} className={fill} data-mark="bar" />
      <text x={f.x} y={f.y} textAnchor="middle" className="fill-foreground text-xs font-semibold tabular-nums">
        {f.text}
      </text>
    </g>
  );
  const at = items.findIndex((i) => i.year === pick.active);
  const read = items[at];
  return (
    <div ref={ref} dir="ltr" className="relative select-none">
      <svg width={w} height={H} role="img" aria-label={label} className="block">
        <line x1={0} x2={w} y1={y(0)} y2={y(0)} className="stroke-chart-axis" strokeWidth={1} data-zero="" />
        {items.map((it, i) => {
          const cx = g.cx(i);
          return (
            <g key={it.year} {...pick.bind(it.year)} className={pickDim(pick.active === null ? null : String(pick.active), String(it.year))} cursor="pointer">
              <rect x={cx - g.step / 2} y={0} width={g.step} height={H} fill="transparent" />
              {bar(i, 0, it.a, fillA, figures[i]![0])}
              {bar(i, 1, it.b, fillB, figures[i]![1])}
              <text x={cx} y={H - 6} textAnchor="middle" className="fill-chart-text text-xs tabular-nums">
                {it.year}
              </text>
            </g>
          );
        })}
      </svg>
      {read && (
        <ChartTip x={g.cx(at)} width={w}>
          <span className="block font-medium">
            <bdi dir="ltr">{read.year}</bdi>
          </span>
          <span className="block">
            <bdi>{nameA}</bdi>: <bdi dir="ltr">{format(read.a)}</bdi>
          </span>
          <span className="block">
            <bdi>{nameB}</bdi>: <bdi dir="ltr">{format(read.b)}</bdi>
          </span>
        </ChartTip>
      )}
    </div>
  );
}
