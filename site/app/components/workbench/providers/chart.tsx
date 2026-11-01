// The cumulative-cost chart (design-system 8.3, design-spec 16.4): the provider fees paid up to each month, real, one
// step line per provider for ranks 1 to 3 and the compared one; one fee hue per line (2026-10-24 evening: the orange steps
// looked alike in the legend); direct labels at the end.
// Our own SVG on D3 scales, sharing the fee-drag chart's grid, axis, crosshair, readout and table view.
import { AxisLabels, yearTicksIn } from "../../chart/TimelineChart";
import { useId } from "react";
import { scaleLinear } from "d3-scale";
import { curveStepAfter, line as d3line } from "d3-shape";
import { r4workbench as c } from "../../../copy";
import { fmt } from "../../../lib/format";
import type { ChartLine } from "../../../lib/providers";
import { computed } from "../../../lib/value";
import { IconPencil } from "../../icons";
import { Num } from "../../provenance";
import { ChartLegend as Legend, ChartReadout as Readout, ChartTable as Table, Swatch, YearLabels, ZoomBar, ZoomBrush, cx, pickDim, tickFade, useFadingTicks, useGlidingNumbers, useGlidingSeries, useYearZoom, valueOn, type ChartPick, type GlidePoint, useBox, ticksOn } from "../../kit";

const STRIP = 112;
const TOP = 20; // room for the top axis label above its gridline (audit 2026-10-24 (sweep))
const BOTTOM = 26;
const LABEL_H = 38;

const style: Record<NonNullable<ChartLine["role"]>, { stroke: string; bg: string; width: number }> = {
  "rank-1": { stroke: "stroke-chart-fee-1", bg: "bg-chart-fee-1", width: 2.5 },
  "rank-2": { stroke: "stroke-chart-fee-2", bg: "bg-chart-fee-2", width: 2 },
  "rank-3": { stroke: "stroke-chart-fee-3", bg: "bg-chart-fee-3", width: 1.5 },
  vs: { stroke: "stroke-chart-fee-4", bg: "bg-chart-fee-4", width: 1.5 },
};

const drawn = (lines: ChartLine[]) => lines.filter((l) => l.role !== null) as (ChartLine & { role: NonNullable<ChartLine["role"]> })[];

export function CumulativeCostChart({ lines, years, today, hover, onHover, dimmed, highlight }: { lines: ChartLine[]; years: number; today: string; hover: number | null; onHover: (y: number | null) => void; dimmed?: boolean; /** The line the legend sets apart. */ highlight?: string | null }) {
  const [box, size] = useBox(240, 180);
  const shown = drawn(lines);
  const { width, height } = size;
  const plotW = width - STRIP;
  const months = shown[0]?.real.length ? shown[0].real.length - 1 : 12 * years;
  const horizonYears = months / 12;
  const zoom = useYearZoom({ last: Math.max(1, horizonYears), plotWidth: plotW, onHover });
  const clip = useId().replace(/:/g, "");
  const x = scaleLinear().domain(zoom.domain).range([0, plotW]);
  // the costs only add up, so the most any line reaches in view is where the view ends
  const monthAt = (l: ChartLine, year: number) => Math.min(l.real.length - 1, Math.round(year * 12));
  const maxV = Math.max(1, ...shown.map((l) => l.real[monthAt(l, Math.ceil(zoom.settled[1]))] ?? 0));
  const yGoal = scaleLinear().domain([0, maxV]).nice(4);
  const top = useGlidingNumbers([yGoal.domain()[1]!])[0]!;
  const y = scaleLinear().domain([0, top]).range([height - BOTTOM, TOP]);
  const ticks = ticksOn(useFadingTicks(yGoal.ticks(4)), y, y.range());
  const yearTicks = useFadingTicks(yearTicksIn(zoom.settled[0], zoom.settled[1]));
  const endSeen = zoom.settled[1] >= horizonYears;
  const endX = Math.min(plotW, x(horizonYears));
  const endOf = (l: ChartLine) => l.real[monthAt(l, zoom.settled[1])] ?? 0;
  const drawnLines = useGlidingSeries(Object.fromEntries(shown.map((l) => [l.id, l.real.map((v, m) => ({ year: m / 12, v }))])));
  const onLine = (l: ChartLine, year: number) => valueOn(drawnLines[l.id] ?? [], year);
  const path = d3line<GlidePoint>().x((p) => x(p.year)).y((p) => y(p.v)).curve(curveStepAfter);

  // direct labels: each line's short name over its horizon cost, pushed apart (collision rule of the comparison chart)
  const labels = shown.map((l) => ({ id: l.id, line: l, y: y(onLine(l, zoom.domain[1])) })).sort((a, b) => a.y - b.y);
  const placed: typeof labels = [];
  for (const l of labels) placed.push({ ...l, y: Math.max(l.y, (placed[placed.length - 1]?.y ?? -Infinity) + LABEL_H) });
  const over = (placed[placed.length - 1]?.y ?? 0) + LABEL_H / 2 - (height - BOTTOM + 8);
  if (over > 0) placed.forEach((p) => (p.y -= over));
  const top0 = placed[0] ? placed[0].y - LABEL_H / 2 : 0;
  if (top0 < 0) placed.forEach((p) => (p.y -= top0));

  const yearOneX = horizonYears > 1 && zoom.has(1) && zoom.settled[0] <= 1 ? x(1) : null;
  return (
    <div className="flex flex-col gap-1">
    <div ref={box} className={cx("relative w-full h-[240px] lg:h-[320px] transition-opacity duration-[var(--duration-base)]", dimmed && "opacity-60")}>
      <svg
        ref={zoom.svgRef}
        {...zoom.handlers}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={c.providers.chart.aria(lines.length, fmt.years(Math.round(horizonYears)))}
        className="block select-none touch-pan-y"
      >
        <defs>
          <clipPath id={clip}>
            <rect x={0} y={0} width={plotW} height={height} />
          </clipPath>
        </defs>
        {ticks.map((tk) => (
          <line key={tk.value} x1={0} x2={plotW} y1={y(tk.value)} y2={y(tk.value)} className={cx(tk.value === 0 ? "stroke-chart-axis" : "stroke-chart-grid", tickFade(tk))} strokeWidth="1" />
        ))}
        {endSeen && <line x1={endX} x2={endX} y1={TOP} y2={height - BOTTOM} className="stroke-chart-marker" strokeWidth="1" />}
        {yearOneX !== null && <line x1={yearOneX} x2={yearOneX} y1={TOP} y2={height - BOTTOM} className="stroke-chart-marker" strokeWidth="1" strokeDasharray="2 4" />}
        <g clipPath={`url(#${clip})`}>
          {[...shown].reverse().map((l) => (
            <path key={l.id} d={path(drawnLines[l.id] ?? []) ?? ""} fill="none" className={cx("chart-line", style[l.role].stroke, pickDim(highlight, l.id))} strokeWidth={style[l.role].width} strokeDasharray={l.entered ? "6 4" : undefined} strokeLinejoin="round" strokeLinecap="round" />
          ))}
        </g>
        {/* after the lines, with the card-colour halo (2026-10-26) */}
        <AxisLabels ticks={ticks} y={y} />
        <YearLabels ticks={yearTicks} x={x} y={height - 8} left={0} right={plotW} word={(yr) => (yr === 0 ? c.providers.chart.today : String(yr))} />
        {hover !== null &&
          shown.map((l) => {
            return (
              <g key={l.id}>
                <line x1={x(hover)} x2={x(hover)} y1={TOP} y2={height - BOTTOM} className="stroke-chart-crosshair" strokeWidth="1" />
                <circle cx={x(hover)} cy={y(onLine(l, hover))} r="4" className={cx("stroke-card", style[l.role].stroke.replace("stroke-", "fill-"))} strokeWidth="2" />
              </g>
            );
          })}
        <ZoomBrush brush={zoom.brush} top={TOP} bottom={height - BOTTOM} />
      </svg>
      {endSeen && (
        <span className="absolute top-0 text-xs text-chart-text whitespace-nowrap px-1 bg-card/80 rounded-sm" style={{ left: `${endX}px`, transform: "translateX(-100%)" }} dir="rtl">
          {c.providers.chart.marker.horizon}
        </span>
      )}
      {yearOneX !== null && (
        // just under the top gridline, clear of the value labels that sit over each gridline: at the foot it covered the lines where they
        // all start (2026-10-26)
        <span className="absolute text-xs text-chart-text whitespace-nowrap px-1 bg-card/80 rounded-sm" style={{ left: `${yearOneX + 3}px`, top: `${y(yGoal.ticks(4).at(-1) ?? 0) + 3}px` }} dir="rtl">
          {c.providers.chart.yearOneMarker}
        </span>
      )}
      {placed.map((p) => (
        <div key={p.id} className={cx("absolute text-xs leading-tight", pickDim(highlight, p.id))} style={{ left: `${plotW + 8}px`, top: `${p.y - LABEL_H / 2}px`, width: `${STRIP - 10}px`, height: `${LABEL_H}px` }}>
          {/* its own line: inline, the name ran into the whole-shekel amount ("לאומי27,104 ₪") */}
          <span className="line-clamp-1 font-medium flex items-center gap-1">
            {p.line.entered && <IconPencil size={14} className="shrink-0" />}
            <bdi>{p.line.short}</bdi>
          </span>
          <Num value={zoom.view ? computed(endOf(p.line), "nis", "F-63", {}, { today, about: p.line.short }) : p.line.horizonCost} animate />
        </div>
      ))}
    </div>
    <ZoomBar zoom={zoom} yearWord={(yr) => (yr === 0 ? c.providers.chart.today : String(yr))} />
    </div>
  );
}

export function ChartLegend({ lines, pick }: { lines: ChartLine[]; pick?: ChartPick<string> }) {
  const shown = drawn(lines);
  return (
    <Legend
      pick={pick}
      items={shown.map((l) => ({
        id: l.id,
        swatch: <Swatch className={cx(style[l.role].bg, l.entered && "opacity-70 [background-image:repeating-linear-gradient(90deg,transparent_0_4px,var(--card)_4px_6px)]")} />,
        label: (
          <>
            <bdi>{l.short}</bdi>
            {l.entered && <IconPencil size={14} />}
            {l.role === "vs" && <span>({c.providers.chart.legendVs})</span>}
          </>
        ),
      }))}
    />
  );
}

export function ChartReadout({ lines, year, today }: { lines: ChartLine[]; year: number; today: string }) {
  const shown = drawn(lines);
  const m = Math.min((shown[0]?.real.length ?? 1) - 1, year * 12);
  return (
    <Readout
      title={year === 0 ? c.providers.chart.today : `${c.providers.chart.year} ${year}`}
      rows={shown.map((l) => ({ id: l.id, swatch: <Swatch shape="box" className={style[l.role].bg} />, label: <bdi>{l.short}</bdi>, value: <Num value={computed(l.real[m]!, "nis", "F-63", {}, { today, about: l.short })} animate /> }))}
    />
  );
}

export function ChartTable({ lines, today }: { lines: ChartLine[]; today: string }) {
  const months = (lines[0]?.real.length ?? 1) - 1;
  const yearsList = Array.from({ length: Math.floor(months / 12) + 1 }, (_, i) => i).filter((i) => i > 0);
  if (months % 12 !== 0) yearsList.push(months / 12);
  return (
    <Table
      scroll="bleed"
      rowHead={c.providers.chart.year}
      columns={lines.map((l) => ({ id: l.id, head: <bdi>{l.short}</bdi> }))}
      rows={yearsList.map((yr) => ({ key: yr, head: yr, cells: lines.map((l) => <Num key={l.id} size="cell" value={computed(l.real[Math.min(l.real.length - 1, yr * 12)]!, "nis", "F-63", {}, { today, about: l.short })} />) }))}
    />
  );
}
