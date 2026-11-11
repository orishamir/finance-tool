// What moves the result (the indices page): every plan number changed by the same share on one chart, left to
// right from less to more, all lines crossing at the plan; a marker the person drags (or sets with a choice) reads every line at one
// share, and beside it the numbers ranked by how much they change what is left, a row each: the number before and after, a bar of the
// difference from one zero line, the difference and what is left. Own SVG; the rows are HTML.
import { useState, type PointerEvent, type ReactNode } from "react";
import { tickFade, ticksOn, useFadingTicks, useFlip, useGlidingNumbers, useGlidingSeries, valueOn } from "./chart-glide";
import { pickDim, useChartPick } from "./chart-interact";
import { cx } from "./cx";
import { ChoiceChips } from "./choice";
import { CHART_TEXT_PX, chartTextWidth } from "./chart-text";
import { useWidth } from "./marker";

export interface ChangeLine {
  id: string;
  label: string;
  /** The line's colour role, as a stroke class (`stroke-chart-lever-1`) and a fill class for its swatch and dot (`fill-chart-lever-1`). */
  stroke: string;
  fill: string;
  /** The result at each of the chart's shares; null where it cannot be priced. */
  ys: (number | null)[];
}

/** A number's row, in rank order. */
export interface ChangeRow {
  id: string;
  /** The line's swatch class (`bg-chart-lever-1`), and the bar's. */
  swatch: string;
  name: ReactNode;
  /** The number in the plan, and after the change. */
  from: ReactNode;
  to: ReactNode;
  /** The difference in what is left, with its word ("19,116 ₪ יותר"), and the bar's length (its size, on the rows' shared scale). */
  diff: ReactNode;
  size: number;
  /** What is left after the change. */
  left: ReactNode;
}

const H = 260;
const TOP = 12;
/** Room under the plot for the shares: their line sits clear of the axis's lowest figure. */
const BOTTOM = 28;
/** A second line of shares, baseline to baseline. */
const TICK_ROW = 18;
const LEFT = 64;
/** The swatch before each line's name and value at its right end, and the room after it. */
const SWATCH = 10;
const SWATCH_GAP = 5;
/** Baseline to baseline between the name and the value under it, at a line's right end. */
const END_LINE = 16;
/** Top to top between two lines' end labels (a name and the value under it). */
const END_GAP = 36;

export function ChangeChart({
  lines,
  shares,
  at,
  onAt,
  choices,
  shareWord,
  planWord,
  xTitle,
  yTitle,
  yFormat,
  choicesLabel,
  head,
  rows,
  rowsLabel,
}: {
  lines: ChangeLine[];
  /** The shares the lines are priced at, in percent, from the lowest to the highest; 0 is the plan. */
  shares: number[];
  at: number;
  onAt: (share: number) => void;
  /** Shares to set with one tap. */
  choices: number[];
  /** "20% יותר", "10% פחות". */
  shareWord: (share: number) => string;
  planWord: string;
  xTitle: string;
  yTitle: string;
  yFormat: (n: number) => string;
  choicesLabel: string;
  /** The rows' heads: the number with its two values, the difference, and the word before what is left. */
  head: { number: ReactNode; diff: ReactNode; left: ReactNode };
  rows: ChangeRow[];
  /** The rows' spoken name. */
  rowsLabel: string;
}) {
  const [ref, w] = useWidth(600);
  const [drag, setDrag] = useState(false);
  // a row of the table sets its line apart; the marker already answers the pointer on the plot
  const pick = useChartPick();
  const lo = shares[0]!;
  const hi = shares[shares.length - 1]!;
  const step = shares.length > 1 ? shares[1]! - shares[0]! : 1;
  const all = lines.flatMap((l) => l.ys.filter((v): v is number => v !== null));
  const maxGoal = Math.max(1, ...all);
  const minGoal = Math.min(0, ...all);
  // no price is NaN on the way: the line has a gap there, at once
  const drawn = useGlidingSeries(Object.fromEntries(lines.map((l) => [l.id, shares.map((year, i) => ({ year, v: l.ys[i] ?? NaN }))])));
  const [yMax, yMin] = useGlidingNumbers([maxGoal, minGoal]) as [number, number];
  // round amounts on the axis: a step of 1, 2 or 5 times a power of ten
  const raw = (maxGoal - minGoal) / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const gstep = [1, 2, 5, 10].map((m) => m * mag).find((v) => v >= raw)!;
  const gridAt = Array.from({ length: Math.floor((maxGoal - minGoal) / gstep) + 1 }, (_, i) => Math.ceil(minGoal / gstep) * gstep + i * gstep).filter((v) => v <= maxGoal);
  // the gutter holds the widest label the axis draws, a fading one too, measured (chart-text.ts): a large plan's "100,000,000" lost its
  // leading digits past a fixed 64 px
  const fading = useFadingTicks(gridAt);
  const left = Math.max(LEFT, 12 + Math.ceil(Math.max(0, ...fading.map((t) => chartTextWidth(yFormat(t.value), CHART_TEXT_PX)))));
  // each line's name and its value at the right end, in the text colours, the line's colour in a swatch before them (charts.md: the value
  // at the end of each line, with its name; label text never in the series colour); the room on the right is the widest of them, measured
  const endValue = (l: ChangeLine) => l.ys.at(-1);
  const endWidth = Math.max(0, ...lines.flatMap((l) => [chartTextWidth(l.label, CHART_TEXT_PX), chartTextWidth(yFormat(endValue(l) ?? 0), CHART_TEXT_PX)]));
  const plotR = w - (8 + SWATCH + SWATCH_GAP + Math.ceil(endWidth) + 4);
  const x = (s: number) => left + ((s - lo) / (hi - lo)) * (plotR - left);
  const y = (v: number) => TOP + (1 - (v - yMin) / (yMax - yMin)) * (H - TOP - BOTTOM);
  const idx = (s: number) => Math.round((s - lo) / step);
  const set = (e: PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const s = lo + ((e.clientX - box.left - left) / (plotR - left)) * (hi - lo);
    onAt(Math.max(lo, Math.min(hi, Math.round(s / step) * step)));
  };
  // direct labels at the right ends, pushed apart where they would overlap
  const ends = lines
    .map((l) => ({ l, v: drawn[l.id]?.at(-1)?.v }))
    .filter((e): e is { l: ChangeLine; v: number } => e.v !== undefined && Number.isFinite(e.v))
    .map((e) => ({ l: e.l, y: y(e.v) }))
    .sort((a, b) => a.y - b.y);
  // a name and its value take two 13 px lines: each label starts at least END_GAP under the one above it, and the lowest stays in the plot
  for (let i = 1; i < ends.length; i++) if (ends[i]!.y - ends[i - 1]!.y < END_GAP) ends[i]!.y = ends[i - 1]!.y + END_GAP;
  const over = ends.length ? ends.at(-1)!.y + END_LINE - (H - BOTTOM) : 0;
  if (over > 0) for (const e of ends) e.y -= over;
  // the shares written under the plot, each measured (chart-text.ts): the two ends, then the plan, then the halves where they fit. The plan
  // that would meet an end goes to a second line under them (at 13 px on a phone, "התוכנית שלכם" ran into both ends)
  const tickText = (s: number) => (s === 0 ? planWord : shareWord(s));
  const ticks: { s: number; row: number }[] = [];
  for (const s of [lo, hi, 0, lo / 2, hi / 2]) {
    if (ticks.some((t) => t.s === s)) continue;
    const half = chartTextWidth(tickText(s), CHART_TEXT_PX) / 2;
    const meets = ticks.some((t) => t.row === 0 && Math.abs(x(t.s) - x(s)) < half + chartTextWidth(tickText(t.s), CHART_TEXT_PX) / 2 + 8);
    if (!meets) ticks.push({ s, row: 0 });
    else if (s === 0) ticks.push({ s, row: 1 });
  }
  const tickRows = Math.max(...ticks.map((t) => t.row)) + 1;
  const height = H + (tickRows - 1) * TICK_ROW;
  const grid = ticksOn(fading, y, [TOP, H - BOTTOM]);
  const path = (pts: { year: number; v: number }[]) => pts.reduce<string>((acc, p, i) => (!Number.isFinite(p.v) ? acc : `${acc}${acc && Number.isFinite(pts[i - 1]?.v) ? "L" : "M"}${x(p.year).toFixed(1)} ${y(p.v).toFixed(1)}`), "");
  const ids = choices.map(String);
  const rowList = useFlip<HTMLOListElement>(rows.map((r) => r.id).join());
  const top = Math.max(0, ...rows.map((r) => r.size));
  return (
    <div className="flex flex-col gap-3">
      <ChoiceChips ids={ids} labels={Object.fromEntries(choices.map((s) => [String(s), shareWord(s)]))} value={ids.includes(String(at)) ? String(at) : null} onChange={(id) => onAt(Number(id))} ariaLabel={choicesLabel} wrap />
      {/* the ranked rows at the start, the chart beside them where there is room; on a phone the chart first */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-3 lg:order-last">
      <p className="text-xs text-muted-foreground">{yTitle}</p>
      <div ref={ref} dir="ltr" className="select-none -mt-2">
        <svg
          width={w}
          height={height}
          aria-hidden="true"
          className="block touch-none cursor-ew-resize"
          onPointerDown={(e) => {
            setDrag(true);
            e.currentTarget.setPointerCapture(e.pointerId);
            set(e);
          }}
          onPointerMove={(e) => drag && set(e)}
          onPointerUp={() => setDrag(false)}
        >
          {grid.map((t) => (
            <g key={t.value} className={tickFade(t)}>
              <line x1={left} x2={plotR} y1={y(t.value)} y2={y(t.value)} className="stroke-chart-grid" strokeWidth={1} />
              <text x={left - 6} y={y(t.value) + 4} textAnchor="end" className="fill-chart-text text-xs tabular-nums">
                {yFormat(t.value)}
              </text>
            </g>
          ))}
          {ticks.map(({ s, row }) => (
            <text key={s} x={x(s)} y={H - BOTTOM + 22 + row * TICK_ROW} textAnchor="middle" className={cx("text-xs", s === 0 ? "fill-foreground" : "fill-chart-text")}>
              {tickText(s)}
            </text>
          ))}
          <line x1={x(0)} x2={x(0)} y1={TOP} y2={H - BOTTOM} className="stroke-chart-axis" strokeDasharray="3 3" />
          {lines.map((l) => (
            <path key={l.id} d={path(drawn[l.id] ?? [])} fill="none" className={cx(l.stroke, pickDim(pick.active, l.id))} strokeWidth={2.2} data-mark="line" />
          ))}
          {ends.map((e) => {
            const v = endValue(e.l);
            return (
              <g key={e.l.id} className={pickDim(pick.active, e.l.id)}>
                <rect x={plotR + 8} y={e.y - 5} width={SWATCH} height={SWATCH} rx={2} className={e.l.fill} />
                <text x={plotR + 8 + SWATCH + SWATCH_GAP} y={e.y + 4} className="fill-chart-text text-xs">
                  {e.l.label}
                </text>
                {v !== null && v !== undefined && (
                  <text x={plotR + 8 + SWATCH + SWATCH_GAP} y={e.y + 4 + END_LINE} className="fill-foreground text-xs font-semibold tabular-nums">
                    {yFormat(v)}
                  </text>
                )}
              </g>
            );
          })}
          {at !== 0 && <line x1={x(at)} x2={x(at)} y1={TOP} y2={H - BOTTOM} className="stroke-chart-crosshair" strokeWidth={1.5} />}
          {lines.map((l) => {
            const v = l.ys[idx(at)] === null || l.ys[idx(at)] === undefined ? null : valueOn(drawn[l.id] ?? [], at);
            return v === null || !Number.isFinite(v) ? null : <circle key={l.id} cx={x(at)} cy={y(v)} r={4.5} className={cx(l.fill, "stroke-card", pickDim(pick.active, l.id))} strokeWidth={1.5} data-mark="point" />;
          })}
        </svg>
      </div>
      <p className="text-xs text-muted-foreground text-center -mt-2">{xTitle}</p>
      </div>
      <div className="flex min-w-0 flex-col">
        <div className="flex items-baseline justify-between gap-3 border-b border-border pb-1.5 text-xs text-muted-foreground">
          <span>{head.number}</span>
          <span>{head.diff}</span>
        </div>
        {/* the bars of the differences from one zero line at the rows' start (charts.md: a bar in a Hebrew row grows with the row) */}
        <ol ref={rowList} aria-label={rowsLabel} data-chart="change-rows" className="flex flex-col">
          {rows.map((r, i) => (
            <li key={r.id} data-flip={r.id} {...pick.bind(r.id)} className={cx("grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b border-border px-1 py-2.5 transition-colors duration-[var(--duration-fast)]", pick.active === r.id && "bg-accent")}>
              <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                <span className="inline-flex items-center gap-2 font-semibold">
                  <span aria-hidden="true" className={cx("inline-block size-3 rounded-sm", r.swatch)} />
                  {r.name}
                </span>
                <span className="whitespace-nowrap text-xs text-muted-foreground tabular-nums">
                  {r.from} ← {r.to}
                </span>
              </span>
              <span className="text-end font-semibold">{r.diff}</span>
              <span className="relative flex h-4 items-center">
                {i === 0 && <span aria-hidden="true" data-zero className="absolute inset-y-0 start-0 w-px" />}
                {top > 0 && r.size > 0 && <span aria-hidden="true" data-mark="bar" className={cx("block h-4 rounded-e-[4px] transition-[width] duration-[var(--duration-chart)] ease-standard motion-reduce:transition-none", r.swatch)} style={{ width: `${(100 * r.size) / top}%` }} />}
              </span>
              <span className="text-end text-xs text-muted-foreground">
                {head.left} {r.left}
              </span>
            </li>
          ))}
        </ol>
      </div>
      </div>
    </div>
  );
}
