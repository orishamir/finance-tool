// What moves the result (the indices page): every plan number changed by the same share on one chart, left to
// right from less to more, all lines crossing at the plan; a marker the person drags (or sets with a choice) reads every line at one
// share, and the table under it says, for each number, what it was, what it becomes, what is left and the difference. Own SVG.
import { useState, type PointerEvent, type ReactNode } from "react";
import { tickFade, ticksOn, useFadingTicks, useFlip, useGlidingNumbers, useGlidingSeries, valueOn } from "./chart-glide";
import { pickDim, useChartPick } from "./chart-interact";
import { cx } from "./cx";
import { PHONE_GONE, TableCols } from "./table-cols";
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

export interface ChangeRow {
  id: string;
  /** The line's swatch class (`bg-chart-lever-1`). */
  swatch: string;
  cells: ReactNode[];
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
/** A column left out on a phone leaves the grid with its <col> (TableCols), so its cells go too. */
const GONE = PHONE_GONE;

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
  widths,
  stackOnPhone,
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
  head: ReactNode[];
  rows: ChangeRow[];
  /** Each column's width, on a computer and on a phone ("0" leaves the column out on a phone): fixed, so no value that changes
   * moves a column. The widths add up to 100% on each. */
  widths: { pc: string; phone: string }[];
  /**
   * Two columns that share one on a phone, `[top, under]`: the under column's figure sits below the top one's, and its own column is left
   * out (its phone width "0"). Four figures side by side left a phone's column 63 px for a typed plan's "50,000,000 ₪", and three
   * figures were printed over each other.
   */
  stackOnPhone?: [number, number];
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
  const tableRows = useFlip<HTMLTableSectionElement>(rows.map((r) => r.id).join());
  return (
    <div className="flex flex-col gap-3">
      <ChoiceChips ids={ids} labels={Object.fromEntries(choices.map((s) => [String(s), shareWord(s)]))} value={ids.includes(String(at)) ? String(at) : null} onChange={(id) => onAt(Number(id))} ariaLabel={choicesLabel} wrap />
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
      <div className="overflow-x-auto">
        <table className="tbl text-sm max-md:text-[13px] max-md:[&_td]:px-1.5 max-md:[&_th]:px-1.5">
          <TableCols widths={widths} />
          <thead>
            <tr>
              {head.map((h, i) => (
                <th key={i} scope="col" className={widths[i]?.phone === "0" ? GONE : undefined}>
                  {h}
                  {stackOnPhone?.[0] === i && <span className="block md:hidden">{head[stackOnPhone[1]]}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody ref={tableRows}>
            {rows.map((r) => (
              <tr key={r.id} data-flip={r.id} {...pick.bind(r.id)} className={cx("cursor-pointer transition-colors duration-[var(--duration-fast)]", pick.active === r.id && "bg-accent")}>
                {r.cells.map((c, i) => (
                  <td key={i} className={widths[i]?.phone === "0" ? GONE : undefined}>
                    {i === 0 ? (
                      <span className="inline-flex items-center gap-2">
                        <span aria-hidden="true" className={`inline-block size-3 rounded-sm ${r.swatch}`} />
                        {c}
                      </span>
                    ) : stackOnPhone?.[0] === i ? (
                      <>
                        {c}
                        <span className="block md:hidden">{r.cells[stackOnPhone[1]]}</span>
                      </>
                    ) : (
                      c
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
