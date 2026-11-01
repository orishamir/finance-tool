// What moves the result (founder, 2026-10-28, the indices page): every plan number changed by the same share on one chart, left to
// right from less to more, all lines crossing at the plan; a marker the person drags (or sets with a choice) reads every line at one
// share, and the table under it says, for each number, what it was, what it becomes, what is left and the difference. Own SVG.
import { useState, type PointerEvent, type ReactNode } from "react";
import { tickFade, ticksOn, useFadingTicks, useFlip, useGlidingNumbers, useGlidingSeries, valueOn } from "./chart-glide";
import { pickDim, useChartPick } from "./chart-interact";
import { cx } from "./cx";
import { TableCols } from "./table-cols";
import { ChoiceChips } from "./choice";
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
const BOTTOM = 22;
const LEFT = 64;
const RIGHT = 104;
/** A column left out on a phone stays in the table at width 0 (hiding the cell would move the next cell into its column). */
const GONE = "max-md:invisible max-md:!p-0 overflow-hidden";

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
   * moves a column (founder, 2026-10-28). The widths add up to 100% on each. */
  widths: { pc: string; phone: string }[];
}) {
  const [ref, w] = useWidth(600);
  const [drag, setDrag] = useState(false);
  // a row of the table sets its line apart (issue 22); the marker already answers the pointer on the plot
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
  const plotR = w - RIGHT;
  const x = (s: number) => LEFT + ((s - lo) / (hi - lo)) * (plotR - LEFT);
  const y = (v: number) => TOP + (1 - (v - yMin) / (yMax - yMin)) * (H - TOP - BOTTOM);
  const idx = (s: number) => Math.round((s - lo) / step);
  const set = (e: PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const s = lo + ((e.clientX - box.left - LEFT) / (plotR - LEFT)) * (hi - lo);
    onAt(Math.max(lo, Math.min(hi, Math.round(s / step) * step)));
  };
  // direct labels at the right ends, pushed apart where they would overlap
  const ends = lines
    .map((l) => ({ l, v: drawn[l.id]?.at(-1)?.v }))
    .filter((e): e is { l: ChangeLine; v: number } => e.v !== undefined && Number.isFinite(e.v))
    .map((e) => ({ l: e.l, y: y(e.v) }))
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) if (ends[i]!.y - ends[i - 1]!.y < 15) ends[i]!.y = ends[i - 1]!.y + 15;
  // a phone keeps the two ends and the plan; a computer also the halves
  const ticks = (w < 520 ? [lo, 0, hi] : [lo, lo / 2, 0, hi / 2, hi]).filter((s, i, a) => a.indexOf(s) === i);
  // round amounts on the axis: a step of 1, 2 or 5 times a power of ten
  const raw = (maxGoal - minGoal) / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const gstep = [1, 2, 5, 10].map((m) => m * mag).find((v) => v >= raw)!;
  const grid = ticksOn(useFadingTicks(Array.from({ length: Math.floor((maxGoal - minGoal) / gstep) + 1 }, (_, i) => Math.ceil(minGoal / gstep) * gstep + i * gstep).filter((v) => v <= maxGoal)), y, [TOP, H - BOTTOM]);
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
          height={H}
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
              <line x1={LEFT} x2={plotR} y1={y(t.value)} y2={y(t.value)} className="stroke-chart-grid" strokeWidth={1} />
              <text x={LEFT - 6} y={y(t.value) + 4} textAnchor="end" className="fill-chart-text text-[11px] tabular-nums">
                {yFormat(t.value)}
              </text>
            </g>
          ))}
          {ticks.map((s) => (
            <text key={s} x={x(s)} y={H - BOTTOM + 16} textAnchor="middle" className={s === 0 ? "fill-foreground text-[11px]" : "fill-chart-text text-[11px]"}>
              {s === 0 ? planWord : shareWord(s)}
            </text>
          ))}
          <line x1={x(0)} x2={x(0)} y1={TOP} y2={H - BOTTOM} className="stroke-chart-axis" strokeDasharray="3 3" />
          {lines.map((l) => (
            <path key={l.id} d={path(drawn[l.id] ?? [])} fill="none" className={cx(l.stroke, pickDim(pick.active, l.id))} strokeWidth={2.2} />
          ))}
          {ends.map((e) => (
            <text key={e.l.id} x={plotR + 8} y={e.y + 4} className={cx(e.l.fill, "text-xs", pickDim(pick.active, e.l.id))}>
              {e.l.label}
            </text>
          ))}
          {at !== 0 && <line x1={x(at)} x2={x(at)} y1={TOP} y2={H - BOTTOM} className="stroke-chart-crosshair" strokeWidth={1.5} />}
          {lines.map((l) => {
            const v = l.ys[idx(at)] === null || l.ys[idx(at)] === undefined ? null : valueOn(drawn[l.id] ?? [], at);
            return v === null || !Number.isFinite(v) ? null : <circle key={l.id} cx={x(at)} cy={y(v)} r={4.5} className={cx(l.fill, "stroke-card", pickDim(pick.active, l.id))} strokeWidth={1.5} />;
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
