// What something costs at each amount of shekels (the fee page's two curves, method F-112): the parts as stacked areas from zero, the
// amount left to right, each part's name at its band's end, and the amounts where the cost bends as points on the top line with a dashed
// line down to the axis, each with its amount over it where that has room (charts.md, "Labels"). A pointer or a tap on the plot reads every
// part and their sum at an amount. Own SVG; the motion is the kit's glide.
import { useState, type PointerEvent, type ReactNode } from "react";
import { scaleLinear } from "d3-scale";
import { fmt } from "../../lib/format";
import { AxisLabels, ChartLegend, Swatch } from "./chart-parts";
import { ticksOn, useFadingTicks, useGlidingNumbers, useGlidingSeries, valueOn, type GlidePoint } from "./chart-glide";
import { ChartTip } from "./chart-interact";
import { CHART_TEXT_PX, chartTextWidth } from "./chart-text";
import { cx } from "./cx";
import { useWidth } from "./marker";

export interface AmountBand {
  id: string;
  label: string;
  /** The band's colour roles: its area and line (`fill-fee-trade`, `stroke-fee-trade`) and its swatch (`bg-fee-trade`). */
  fill: string;
  stroke: string;
  swatch: string;
  /** Its cost at each of the chart's amounts; straight between two of them. */
  values: number[];
}

export interface AmountMark {
  id: string;
  /** The amount, in shekels, where the cost bends. */
  at: number;
  /** What is written over its point ("6,000 ₪"). */
  label: string;
}

const H = 240;
const TOP = 28;
/** Room under the plot for the amounts and the axis's name. */
const BOTTOM = 26;
const SWATCH = 10;
const SWATCH_GAP = 6;
/** Top to top between two band names at the end. */
const NAME_GAP = 18;
/** The narrowest plot that still takes the names at its end; narrower, the names stand in a legend above the chart. */
const MIN_PLOT = 200;
/** Over a mark's point, its label's baseline; a label with something in its way stands a row higher, up to `MARK_ROWS` rows. */
const MARK_LABEL = 10;
const MARK_ROW = 16;
const MARK_ROWS = 4;
/** How far round a mark's point no label may stand (its 4.5 px dot and its 2 px ring, and air). */
const POINT_CLEAR = 7;
/** The least room between a mark's label and another label or the value axis's words. */
const LABEL_GAP = 4;
/** The furthest a mark's label may stand from its point, joined to it by a line; further, it gives way. */
const JOIN_MAX = 40;
/** How far a line of chart text reaches above and below its baseline. */
const TEXT_UP = 11;
const TEXT_DOWN = 3;
/** The least room between two amounts written under the plot. */
const X_LABEL_GAP = 8;

/** A cost the chart reads at an amount: whole shekels, with the agorot under 10 ₪ (wording.md, "Numbers"). */
const cost = (v: number) => (Math.abs(v) < 10 ? fmt.nis(Math.round(v * 100) / 100) : fmt.nisWhole(v));

/** Nice steps on an axis from zero: 1, 2 or 5 times a power of ten, about four of them. */
const ticksTo = (max: number): number[] => (max > 0 ? scaleLinear().domain([0, max]).nice(4).ticks(4) : [0]);

/** A part's top at each amount: what the bands under it and it add up to. */
function stacked(amounts: readonly number[], bands: readonly AmountBand[]): Record<string, GlidePoint[]> {
  const out: Record<string, GlidePoint[]> = {};
  let under = amounts.map(() => 0);
  for (const b of bands) {
    const top = amounts.map((_, i) => under[i]! + (b.values[i] ?? 0));
    out[b.id] = amounts.map((a, i) => ({ year: a, v: top[i]! }));
    under = top;
  }
  return out;
}


type Box = { left: number; right: number; top: number; bottom: number };
const meet = (a: Box, b: Box, gap: number) => a.left < b.right + gap && b.left < a.right + gap && a.top < b.bottom + gap && b.top < a.bottom + gap;

/**
 * Where each mark's label stands, in the order of the marks along the plot (charts.md, "Labels": labels are never stacked on each other or
 * on the axis's words; a label that cannot stand at its mark is joined to it by a short line, or gives way). Its places, nearest first:
 * over its point (`cx`, `cy`; `half` its half width) or beside it, after it along the line, each a row higher in turn, up to `MARK_ROWS`
 * rows and never above the chart's top; held inside the plot and moved past the end of the value axis's words where it would meet one. A
 * place is free where the label meets no word of the axis, no mark's point and no label already placed, and stands no further than
 * `JOIN_MAX` from its point. `lx`, `by`: the label's middle and its baseline; one not right at its point is `joined` to it by a line. A
 * label with no free place gives way (null): its point stays, and the points beside the chart say its sum.
 */
export function markLabels(points: readonly { cx: number; cy: number; half: number }[], axisWords: readonly { right: number; top: number; bottom: number }[], plotR: number): ({ lx: number; by: number; joined: boolean } | null)[] {
  const axis: Box[] = axisWords.map((a) => ({ left: 0, right: a.right, top: a.top, bottom: a.bottom }));
  const dots: Box[] = points.map((p) => ({ left: p.cx - POINT_CLEAR, right: p.cx + POINT_CLEAR, top: p.cy - POINT_CLEAR, bottom: p.cy + POINT_CLEAR }));
  const taken: Box[] = [];
  return points.map(({ cx, cy, half }) => {
    const box = (lx: number, by: number): Box => ({ left: lx - half, right: lx + half, top: by - TEXT_UP, bottom: by + TEXT_DOWN });
    // how far a label's box stands from its point: nothing where the point is under it or at its side
    const away = (b: Box) => Math.hypot(Math.max(0, b.left - cx, cx - b.right), Math.max(0, b.top - cy, cy - b.bottom));
    for (let row = 0; row < MARK_ROWS; row++) {
      // over the point, then beside it (its baseline a little under the point's middle, so the words sit level with it)
      for (const [x0, by] of [
        [cx, cy - MARK_LABEL - row * MARK_ROW],
        [cx + POINT_CLEAR + 2 + half, cy + 4 - row * MARK_ROW],
      ] as const) {
        if (by - TEXT_UP < 0) continue;
        let lx = Math.max(half, Math.min(plotR - half, x0));
        for (const a of axis) if (meet(box(lx, by), a, LABEL_GAP)) lx = a.right + LABEL_GAP + half;
        const b = box(lx, by);
        if (b.right > plotR || away(b) > JOIN_MAX) continue;
        if (axis.some((a) => meet(b, a, LABEL_GAP - 1)) || dots.some((d) => meet(b, d, 0)) || taken.some((t) => meet(b, t, LABEL_GAP))) continue;
        taken.push(b);
        // a label right over its point or level beside it needs no line; one higher, or moved along the line off its point, is joined to it
        return { lx, by, joined: away(b) > MARK_LABEL };
      }
    }
    return null;
  });
}

/**
 * `amounts`: the amounts the bands' values are at, from 0 to the axis's end, rising. `bands`: the parts from the bottom up. `marks`: the
 * amounts where the cost bends. `xTitle` names the amount ("גודל הפעולה"); `tip` heads the reading at an amount ("פעולה של 10,000 ₪")
 * and `total` names the parts' sum in it. The value axis is in shekels at the plot's start edge.
 */
export function AmountChart({ amounts, bands, marks, xTitle, tip, total, className }: { amounts: number[]; bands: AmountBand[]; marks: AmountMark[]; xTitle: string; tip: (amount: number) => ReactNode; total: string; className?: string }) {
  const [ref, w] = useWidth(560);
  const [at, setAt] = useState<number | null>(null);
  const end = amounts[amounts.length - 1] ?? 1;
  const tops = stacked(amounts, bands);
  const sums = amounts.map((_, i) => bands.reduce((s, b) => s + (b.values[i] ?? 0), 0));
  const yGoal = ticksTo(Math.max(...sums, 0) * 1.05).at(-1) ?? 1;
  const drawn = useGlidingSeries(tops);
  const [xMax, yMax] = useGlidingNumbers([end, yGoal]) as [number, number];
  const yTicks = useFadingTicks(ticksTo(yGoal));

  // each band's name at its end, in the text colours with the band's swatch before it, as wide as the widest name; on a narrow chart the
  // names go to a legend above it
  const nameWidth = Math.ceil(Math.max(0, ...bands.map((b) => chartTextWidth(b.label, CHART_TEXT_PX))));
  const named = w - (12 + SWATCH + SWATCH_GAP + nameWidth) >= MIN_PLOT;
  const plotR = named ? w - (12 + SWATCH + SWATCH_GAP + nameWidth) : w - 4;
  const x = (a: number) => (a / (xMax || 1)) * plotR;
  const y = (v: number) => TOP + (1 - v / (yMax || 1)) * (H - TOP - BOTTOM);
  const base = H - BOTTOM;

  const area = (id: string, below: GlidePoint[] | null) => {
    const top = drawn[id] ?? [];
    if (top.length === 0) return "";
    const up = top.map((p) => `${x(p.year).toFixed(1)} ${y(p.v).toFixed(1)}`);
    const down = below ? [...below].reverse().map((p) => `${x(p.year).toFixed(1)} ${y(p.v).toFixed(1)}`) : [`${x(top.at(-1)!.year).toFixed(1)} ${base}`, `${x(top[0]!.year).toFixed(1)} ${base}`];
    return `M${up.join("L")}L${down.join("L")}Z`;
  };
  const line = (id: string) => (drawn[id] ?? []).map((p, i) => `${i ? "L" : "M"}${x(p.year).toFixed(1)} ${y(p.v).toFixed(1)}`).join("");
  const topOf = (a: number) => (bands.length ? valueOn(drawn[bands.at(-1)!.id] ?? [], a) : 0);

  // the names at the band ends, each at its band's middle, pushed apart where they would meet and kept inside the plot's height
  const ends = bands
    .map((b, k) => {
      const top = drawn[b.id]?.at(-1)?.v ?? 0;
      const under = k ? (drawn[bands[k - 1]!.id]?.at(-1)?.v ?? 0) : 0;
      return { b, y: y((top + under) / 2) };
    })
    .sort((p, q) => p.y - q.y);
  for (let i = 1; i < ends.length; i++) if (ends[i]!.y - ends[i - 1]!.y < NAME_GAP) ends[i]!.y = ends[i - 1]!.y + NAME_GAP;
  const over = ends.length ? ends.at(-1)!.y + 5 - base : 0;
  if (over > 0) for (const e of ends) e.y -= over;

  // the amounts under the plot: the nice steps, the last one with its sign. The first and the last are always written; one between them
  // only where its words clear the one written before it and the last (a phone's plot has no room for every step)
  const steps = ticksTo(end).filter((v) => v <= end);
  const xText = (v: number, last: boolean) => (last ? fmt.nisWhole(v) : fmt.number(v));
  const xSpan = (i: number): [number, number] => {
    const at = x(steps[i]!);
    const wide = chartTextWidth(xText(steps[i]!, i === steps.length - 1), CHART_TEXT_PX);
    return i === 0 ? [at, at + wide] : i === steps.length - 1 ? [at - wide, at] : [at - wide / 2, at + wide / 2];
  };
  const written: number[] = [];
  steps.forEach((_, i) => {
    const edge = i === 0 || i === steps.length - 1;
    const before = written.length ? xSpan(written.at(-1)!)[1] : -Infinity;
    if (edge || (xSpan(i)[0] >= before + X_LABEL_GAP && xSpan(i)[1] + X_LABEL_GAP <= xSpan(steps.length - 1)[0])) written.push(i);
  });

  // a mark's label over its point, held inside the plot and clear of the value axis's words at the plot's start (it moves past their end
  // where it would meet one); one that would meet the label before it goes a row higher
  const axisWords = ticksOn(yTicks, y, [TOP, base])
    .filter((t) => t.value > 0)
    .map((t) => ({ right: 2 + chartTextWidth(fmt.compactNisAxis(t.value), CHART_TEXT_PX), top: y(t.value) - 4 - TEXT_UP, bottom: y(t.value) - 4 + TEXT_DOWN }));
  const sorted = [...marks].sort((p, q) => p.at - q.at);
  const points = sorted.map((m) => ({ cx: x(m.at), cy: y(topOf(m.at)), half: chartTextWidth(m.label, CHART_TEXT_PX) / 2 + 2 }));
  const placed = markLabels(points, axisWords, plotR).map((l, i) => ({ m: sorted[i]!, cx: points[i]!.cx, cy: points[i]!.cy, label: l }));

  // the pointer reads an amount: the chart's steps are a hundredth of its end, rounded to a nice step
  const step = (() => {
    const raw = end / 100;
    const mag = Math.pow(10, Math.floor(Math.log10(raw || 1)));
    return [1, 2, 5, 10].map((k) => k * mag).find((v) => v >= raw) ?? mag;
  })();
  const read = (e: PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const a = ((e.clientX - box.left) / plotR) * (xMax || 1);
    setAt(Math.max(0, Math.min(end, Math.round(a / step) * step)));
  };
  const valueAt = (b: AmountBand, a: number) => {
    const k = bands.indexOf(b);
    const pts = (i: number) => amounts.map((x0, j) => ({ year: x0, v: bands[i]!.values[j] ?? 0 }));
    return k < 0 ? 0 : valueOn(pts(k), a);
  };

  return (
    <div className={cx("flex flex-col gap-2", className)}>
      {!named && <ChartLegend items={[...bands].reverse().map((b) => ({ id: b.id, swatch: <Swatch shape="box" className={b.swatch} />, label: b.label }))} />}
      <div ref={ref} dir="ltr" className="relative select-none">
        <svg
          width={w}
          height={H}
          aria-hidden="true"
          className="block touch-pan-y"
          onPointerMove={(e) => e.pointerType === "mouse" && read(e)}
          onPointerDown={read}
          onPointerLeave={(e) => e.pointerType === "mouse" && setAt(null)}
        >
          {ticksOn(yTicks, y, [TOP, base]).map((t) => (
            <line key={t.value} x1={0} x2={plotR} y1={y(t.value)} y2={y(t.value)} className="stroke-chart-grid" strokeWidth={1} />
          ))}
          {bands.map((b, k) => (
            <g key={b.id}>
              <path d={area(b.id, k ? (drawn[bands[k - 1]!.id] ?? null) : null)} className={b.fill} fillOpacity={0.4} data-mark="area" />
              <path d={line(b.id)} fill="none" className={b.stroke} strokeWidth={2} />
            </g>
          ))}
          <line x1={0} x2={plotR} y1={base} y2={base} className="stroke-chart-axis" strokeWidth={1} />
          <AxisLabels ticks={ticksOn(yTicks, y, [TOP, base])} y={y} />
          {written.map((i) => {
            const v = steps[i]!;
            const last = i === steps.length - 1;
            return (
              <text key={v} x={x(v)} y={base + 18} textAnchor={i === 0 ? "start" : last ? "end" : "middle"} className="fill-chart-text text-xs tabular-nums">
                {xText(v, last)}
              </text>
            );
          })}
          {named &&
            ends.map((e) => (
              <g key={e.b.id}>
                <rect x={plotR + 12} y={e.y - 5} width={SWATCH} height={SWATCH} rx={2} className={e.b.fill} />
                <text x={plotR + 12 + SWATCH + SWATCH_GAP} y={e.y + 4} className="fill-chart-text text-xs">
                  {e.b.label}
                </text>
              </g>
            ))}
          {placed.map((p) => (
            <line key={`${p.m.id}:down`} x1={p.cx} x2={p.cx} y1={p.cy} y2={base} className="stroke-foreground" strokeWidth={1} strokeDasharray="3 4" />
          ))}
          {placed.map(
            (p) =>
              p.label?.joined && (
                <line key={`${p.m.id}:join`} x1={p.cx} y1={p.cy - 5} x2={p.label.lx} y2={p.label.by + TEXT_DOWN + 1} className="stroke-chart-text" strokeWidth={1} />
              ),
          )}
          {placed.map((p) => (
            <circle key={`${p.m.id}:point`} cx={p.cx} cy={p.cy} r={4.5} className="fill-foreground stroke-card" strokeWidth={2} data-mark="point" />
          ))}
          {placed.map(
            (p) =>
              p.label && (
                <text key={`${p.m.id}:label`} x={p.label.lx} y={p.label.by} textAnchor="middle" className="fill-foreground stroke-card text-xs font-semibold tabular-nums [paint-order:stroke]" strokeWidth={3}>
                  {p.m.label}
                </text>
              ),
          )}
          {at !== null && <line x1={x(at)} x2={x(at)} y1={TOP} y2={base} className="stroke-chart-crosshair" strokeWidth={1.5} />}
        </svg>
        {at !== null && (
          <ChartTip x={x(at)} top={TOP} width={w}>
            <span className="block font-medium">{tip(at)}</span>
            {[...bands].reverse().map((b) => (
              <span key={b.id} className="flex items-center gap-1.5">
                <Swatch shape="box" className={b.swatch} />
                {b.label}: <bdi dir="ltr">{cost(valueAt(b, at))}</bdi>
              </span>
            ))}
            {bands.length > 1 && (
              <span className="block font-medium">
                {total}: <bdi dir="ltr">{cost(bands.reduce((s, b) => s + valueAt(b, at), 0))}</bdi>
              </span>
            )}
          </ChartTip>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground">{xTitle}</p>
    </div>
  );
}
