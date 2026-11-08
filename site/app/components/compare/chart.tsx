// The comparison chart (design-spec 6.4, design-system 6.5): the top three options and the baseline on one
// axis, time left to right, direct labels at the right end, dashed where a line rests on a return the person
// entered. Our own SVG on D3 scales, sharing the timeline chart's grid, axis, crosshair and table view.
import { useId } from "react";
import { scaleLinear } from "d3-scale";
import { line } from "d3-shape";
import { guide as guideCopy, r2 } from "../../copy";
import { nominalFormula, type SeriesLine } from "../../lib/compare";
import { fmt } from "../../lib/format";
import { Num } from "../provenance";
import { AxisLabels, niceYearTicks, yearTicksIn } from "../chart/TimelineChart";
import { ChartLegend as Legend, ChartReadout as Readout, ChartTable as Table, Swatch, YearLabels, ZoomBar, ZoomBrush, cx, pickDim, tickFade, useFadingTicks, useGlidingNumbers, useGlidingSeries, useYearZoom, valueOn, type ChartPick, type GlidePoint, useBox, ticksOn } from "../kit";
import type { Mode, ResultCtx } from "./ctx";

/** The direct label's strip at the right of the plot; narrower on a phone, where the plot had 175 of 296 px (2026-10-26). */
const strip = (width: number) => (width < 400 ? 84 : 104);
const TOP = 20; // room for the top axis label above its gridline (audit 2026-10-24 (sweep))
const BOTTOM = 26;
const LABEL_H = 54;

/** The baseline (the current account) is dotted: its grey sits within 15 ΔE of one of the three teal steps, and a dash already means an
 * entered return (2026-10-26). */
const BASELINE_DOTS = "0.1 5";

const roleClass = {
  "option-1": { stroke: "stroke-chart-option-1", bg: "bg-chart-option-1", fill: "fill-chart-option-1", width: 2.5 },
  "option-2": { stroke: "stroke-chart-option-2", bg: "bg-chart-option-2", fill: "fill-chart-option-2", width: 2 },
  "option-3": { stroke: "stroke-chart-option-3", bg: "bg-chart-option-3", fill: "fill-chart-option-3", width: 1.5 },
  baseline: { stroke: "stroke-chart-baseline", bg: "bg-chart-baseline", fill: "fill-chart-baseline", width: 1.5 },
} as const;

type Pt = GlidePoint;

const valueOf = (l: SeriesLine, mode: Mode): Pt[] => l.points.map((p) => ({ year: p.year, v: mode === "real" ? p.real : p.nominal }));

export function ComparisonChart({ lines, mode, horizon, ctx, hover, onHover, dimmed, highlight }: { lines: SeriesLine[]; mode: Mode; horizon: number; ctx: ResultCtx; hover: number | null; onHover: (y: number | null) => void; dimmed?: boolean; /** The line the legend sets apart. */ highlight?: string | null }) {
  const [box, size] = useBox(220, 180);

  const target = Object.fromEntries(lines.map((l) => [l.id, valueOf(l, mode)]));
  const shown = useGlidingSeries(target);
  const { width, height } = size;
  const STRIP = strip(width);
  const plotW = width - STRIP;
  const zoom = useYearZoom({ last: Math.max(1, horizon), plotWidth: plotW, onHover });
  const clip = useId().replace(/:/g, "");
  const [from, to] = zoom.domain;
  const x = scaleLinear().domain(zoom.domain).range([0, plotW]);
  const maxV = Math.max(1, ...Object.values(target).flatMap((p) => p.filter((q) => zoom.seen(q.year)).map((q) => q.v)));
  const yGoal = scaleLinear().domain([0, maxV]).nice(4);
  const top = useGlidingNumbers([yGoal.domain()[1]!])[0]!;
  const y = scaleLinear().domain([0, top]).range([height - BOTTOM, TOP]);
  const ticks = ticksOn(useFadingTicks(yGoal.ticks(4)), y, y.range());
  const path = line<Pt>().x((d) => x(d.year)).y((d) => y(d.v));
  const yearTicks = useFadingTicks(yearTicksIn(zoom.settled[0], zoom.settled[1]));
  const horizonX = Math.min(plotW, x(horizon));
  const horizonSeen = zoom.settled[1] >= horizon;
  // A12: the fall the person accepts, as a band from today's amount down by that share (D11 unchanged: it filters in exposure mode only)
  const fallStart = ctx.g.amountNow - ctx.g.available;
  // the band is a bracket at the start (year 0 to the first tick): the fall is read on today's amount, not applied to every year (F-71, 2026-10-24)
  const fallW = x(Math.min(Math.max(1, horizon), niceYearTicks(horizon).find((t) => t > 0) ?? 1));
  const fallDrop = ctx.fall && ctx.fall > 0 && fallStart > 0 ? (fallStart * Math.min(ctx.fall, 100)) / 100 : 0;

  // One direct label, for the leading option only (the others are in the readout and the table): placed at its line's
  // end and kept inside the plot's height, so labels can never overprint one another or the goal marker.
  const lead = ctx.view.ranked[0] ? lines.find((l) => l.id === ctx.view.ranked[0]!.id) ?? lines[0] : lines[0];
  // the last year in view: zoomed in, the label reads there, beside its line
  const endYear = zoom.view ? zoom.settled[1] : horizon;
  const leadEnd = lead ? y(valueOn(shown[lead.id] ?? [], to)) : 0;
  const leadY = Math.max(TOP + LABEL_H / 2 + 14, Math.min(height - BOTTOM - LABEL_H / 2, leadEnd));

  const leadOpt = lead ? ctx.view.ranked.find((o) => o.id === lead.id) : undefined;
  const leadLast = lead?.points[lead.points.length - 1];
  const leadRaw = zoom.view && lead ? valueOn(valueOf(lead, mode), endYear) : ((mode === "real" ? leadOpt?.real ?? leadLast?.real : leadOpt?.nominal ?? leadLast?.nominal) ?? 0);
  const leadValue = ctx.mk.nis(leadRaw, mode === "real" ? "F-06" : nominalFormula(leadOpt?.run, ctx.bundle.wrappers.find((w) => w.id === lead?.id)?.record), lead?.name ?? "", leadOpt);
  const hovered = hover === null ? null : hover;
  // Each ranked line carries its place in a small circle, the number its card shows: the three options are shades of one teal and
  // often run on top of each other, so the colour alone could not tell them apart (V6, 2026-10-26). The circles stand at different
  // years along the line, so two lines that meet still show both numbers.
  const badges = lines
    .map((l) => ({ l, rank: ctx.view.ranked.find((o) => o.id === l.id)?.rank ?? 0 }))
    .filter((b) => b.rank > 0)
    .sort((a, b) => a.rank - b.rank)
    .map((b, i) => {
      const at = Math.max(from, to - (to - from) * (0.08 + 0.12 * i));
      return { ...b, x: x(at), y: y(valueOn(shown[b.l.id] ?? [], at)) };
    });
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
        aria-label={`${r2.result.chartAria} ${fmt.years(horizon)}. ${guideCopy.graphAria.after}`}
        className="block select-none touch-pan-y"
      >
        <defs>
          <clipPath id={clip}>
            <rect x={0} y={0} width={plotW} height={height} />
          </clipPath>
        </defs>
        {ticks.map((t) => (
          <line key={t.value} x1={0} x2={plotW} y1={y(t.value)} y2={y(t.value)} className={cx(t.value === 0 ? "stroke-chart-axis" : "stroke-chart-grid", tickFade(t))} strokeWidth="1" />
        ))}
        {fallDrop > 0 && (
          <g role="img" aria-label={r2.result.fallBand} data-fall-band clipPath={`url(#${clip})`}>
            <rect x={0} y={y(fallStart)} width={fallW} height={Math.max(0, y(fallStart - fallDrop) - y(fallStart))} className="fill-foreground" fillOpacity="0.07" />
            <line x1={0} x2={fallW} y1={y(fallStart - fallDrop)} y2={y(fallStart - fallDrop)} className="stroke-chart-marker" strokeWidth="1" strokeDasharray="2 3" />
          </g>
        )}
        {horizonSeen && <line x1={horizonX} x2={horizonX} y1={TOP} y2={height - BOTTOM} className="stroke-chart-marker" strokeWidth="1" />}
        <g clipPath={`url(#${clip})`}>
        {[...lines].reverse().map((l) => (
          <path key={l.id} d={path(shown[l.id] ?? []) ?? ""} fill="none" className={cx("chart-line", roleClass[l.role].stroke, pickDim(highlight, l.id))} strokeWidth={l.role === "baseline" ? 2.5 : roleClass[l.role].width} strokeDasharray={l.enteredReturn ? "6 4" : l.role === "baseline" ? BASELINE_DOTS : undefined} strokeLinejoin="round" strokeLinecap="round" />
        ))}
        </g>
        {/* after the lines, with the card-colour halo: on a phone the lines ran through "100 אלף ₪" (2026-10-26) */}
        <AxisLabels ticks={ticks} y={y} />
        <g aria-hidden="true">
          {badges.map((b) => (
            <g key={b.l.id} transform={`translate(${b.x} ${b.y})`} className={pickDim(highlight, b.l.id)}>
              <circle r="9.5" className={cx("fill-card", roleClass[b.l.role].stroke)} strokeWidth="1.5" />
              <text y="0.5" textAnchor="middle" dominantBaseline="middle" direction="ltr" className="text-xs font-medium fill-foreground tabular-nums">
                {b.rank}
              </text>
            </g>
          ))}
        </g>
        <YearLabels ticks={yearTicks} x={x} y={height - 8} left={0} right={plotW} word={(yr) => (yr === 0 ? guideCopy.readout.today : String(yr))} />
        {hovered !== null && (
          <g>
            <line x1={x(hovered)} x2={x(hovered)} y1={TOP} y2={height - BOTTOM} className="stroke-chart-crosshair" strokeWidth="1" />
            {lines.map((l) => {
              const p = shown[l.id]?.find((q) => q.year === hovered);
              return p ? <circle key={l.id} cx={x(p.year)} cy={y(p.v)} r="4" className={cx("stroke-card", roleClass[l.role].fill)} strokeWidth="2" /> : null;
            })}
          </g>
        )}
        <ZoomBrush brush={zoom.brush} top={TOP} bottom={height - BOTTOM} />
      </svg>
      {horizonSeen && (
        <span className="absolute top-0 text-xs text-chart-text whitespace-nowrap px-1 bg-card/80 rounded-sm" style={{ left: `${horizonX}px`, transform: "translateX(-100%)" }} dir="rtl">
          {r2.result.chartHorizon}
        </span>
      )}
      {lead && (
        <div className="absolute text-xs leading-tight" style={{ left: `${plotW + 8}px`, top: `${leadY - LABEL_H / 2}px`, width: `${STRIP - 10}px`, height: `${LABEL_H}px` }}>
          <span className="line-clamp-2 font-medium">{lead.name}</span>
          {/* whole shekels, as on the ranked cards (design-system 2.7); "cell" kept the agorot */}
          <Num value={leadValue} animate />
        </div>
      )}
    </div>
    <ZoomBar zoom={zoom} yearWord={(yr) => (yr === 0 ? guideCopy.readout.today : String(yr))} />
    </div>
  );
}

export function ChartLegend({ lines, pick }: { lines: SeriesLine[]; pick?: ChartPick<string> }) {
  return <Legend pick={pick} items={lines.map((l) => ({ id: l.id, swatch: l.enteredReturn ? <Swatch shape="entered-line" className={roleClass[l.role].stroke} /> : l.role === "baseline" ? <Swatch shape="dotted-line" className={roleClass[l.role].stroke} /> : <Swatch className={roleClass[l.role].bg} />, label: <bdi>{l.name}</bdi> }))} />;
}

/** One row per line at the hovered year (or the horizon): swatch, name, value. */
export function ChartReadout({ lines, mode, year, ctx }: { lines: SeriesLine[]; mode: Mode; year: number; ctx: ResultCtx }) {
  return (
    <Readout
      title={year === 0 ? guideCopy.readout.today : `${r2.result.chartYear} ${year}`}
      rows={lines.map((l) => {
        const p = l.points.find((q) => q.year === year) ?? l.points[l.points.length - 1]!;
        const opt = ctx.view.ranked.find((o) => o.id === l.id);
        const v = mode === "real" ? p.real : p.nominal;
        return { id: l.id, swatch: l.role === "baseline" ? <Swatch shape="dotted-line" className={roleClass[l.role].stroke} /> : <Swatch className={roleClass[l.role].bg} />, label: <bdi>{l.name}</bdi>, value: <Num value={ctx.mk.nis(v, mode === "real" ? "F-06" : nominalFormula(opt?.run, ctx.bundle.wrappers.find((w) => w.id === l.id)?.record), l.name, opt)} animate /> };
      })}
    />
  );
}

export function ChartTable({ lines, mode, ctx }: { lines: SeriesLine[]; mode: Mode; ctx: ResultCtx }) {
  const years = lines[0]?.points.map((p) => p.year) ?? [];
  return (
    <Table
      rowHead={r2.result.tableYear}
      columns={lines.map((l) => ({ id: l.id, head: <bdi>{l.name}</bdi> }))}
      rows={years.map((yr) => ({
        key: yr,
        head: yr,
        cells: lines.map((l) => {
          const p = l.points.find((q) => q.year === yr);
          const opt = ctx.view.ranked.find((o) => o.id === l.id);
          return p ? <Num size="cell" value={ctx.mk.nis(mode === "real" ? p.real : p.nominal, mode === "real" ? "F-06" : nominalFormula(opt?.run, ctx.bundle.wrappers.find((w) => w.id === l.id)?.record), l.name, opt)} /> : null;
        }),
      }))}
    />
  );
}
