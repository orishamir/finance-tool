// The timeline graph (design-spec 1.4, design-system 3.4): our own SVG on D3 scales and shapes. Time runs
// left to right; the value axis labels sit at the plot's left edge above their gridlines (one rule shared by
// the three SVG charts, see AxisLabels); bands bottom-up are what is left, tax and fees, with a neutral
// contributions line over them.
import { useId, type CSSProperties, type ReactNode } from "react";
import { area, line } from "d3-shape";
import { scaleLinear } from "d3-scale";
import { guide as copy } from "../../copy";
import { fmt } from "../../lib/format";
import { IconLock } from "../icons";
import { IdRef } from "../provenance";
import { YearLabels, ZoomBar, ZoomBrush, cx, pickDim, tickFade, useFadingTicks, useGlidingNumbers, useGlidingRows, useYearZoom, type GlideTick, useBox, ticksOn } from "../kit";

export interface ChartPoint {
  year: number;
  net: number;
  tax: number;
  fees: number;
  contributions: number;
}

export interface Marker {
  year: number;
  label: ReactNode;
}

export interface TimelineChartProps {
  points: ChartPoint[];
  hover: number | null;
  onHover: (year: number | null) => void;
  markers?: Marker[];
  blocked?: { fromYear: number; code: string } | null;
  enteredReturn?: boolean;
  ariaLabel: string;
  dimmed?: boolean;
  /** The series the legend sets apart: `net`, `tax`, `fees` or `contributions`. */
  highlight?: string | null;
}

/** Right padding after the horizon; the value axis sits at the plot's start edge (see AxisLabels), not in a strip. */
const STRIP = 12;
const TOP = 20; // room for the top axis label above its gridline (audit 2026-10-24 (sweep))
const BOTTOM = 26;

/**
 * Year ticks on a whole-year grid: steps of 1, 2, 5 or 10 years (d3's nice steps for about four intervals), always
 * including 0 ("today"). Any horizon from 1 to 40 gives 3 to 8 ticks, never a 2.5-year step.
 */
export function niceYearTicks(horizon: number): number[] {
  const h = Math.max(1, Math.round(horizon));
  const t = scaleLinear().domain([0, h]).ticks(4).filter((v) => Number.isInteger(v));
  return t.length ? t : [0, h];
}

/** Year ticks for a zoomed view: the same whole-year steps between its two ends. */
export function yearTicksIn(from: number, to: number): number[] {
  if (from <= 0) return niceYearTicks(to);
  const t = scaleLinear().domain([from, to]).ticks(4).filter((v) => Number.isInteger(v));
  return t.length >= 2 ? t : [Math.ceil(from), Math.floor(to)];
}

/** The shared value-axis rule: labels at the plot's start edge, just above their gridline, with a card-colour halo. */
export function AxisLabels({ ticks, y }: { ticks: GlideTick[]; y: (v: number) => number }) {
  return (
    <>
      {ticks.map(
        (t) =>
          t.value > 0 && (
            <text key={t.value} x={2} y={y(t.value) - 4} textAnchor="start" direction="ltr" className={cx("text-xs fill-chart-text stroke-card [paint-order:stroke]", tickFade(t))} strokeWidth="3" data-scale>
              {fmt.compactNisAxis(t.value)}
            </text>
          ),
      )}
    </>
  );
}

/** A sideways-scrolling table wrapper's cue without script: a card-colour fade at each end that is still hidden content, and a soft edge shadow. */
export const scrollCueStyle: CSSProperties = {
  background:
    "linear-gradient(to right, var(--card) 30%, transparent) left center / 32px 100% no-repeat local, linear-gradient(to left, var(--card) 30%, transparent) right center / 32px 100% no-repeat local, radial-gradient(farthest-side at 0 50%, rgb(255 255 255 / 0.22), transparent) left center / 14px 100% no-repeat scroll, radial-gradient(farthest-side at 100% 50%, rgb(255 255 255 / 0.22), transparent) right center / 14px 100% no-repeat scroll",
};

const ROW_KEYS = ["net", "tax", "fees", "contributions"] as const;

export function TimelineChart({ points, hover, onHover, markers = [], blocked, enteredReturn, ariaLabel, dimmed, highlight }: TimelineChartProps) {
  const [box, size] = useBox(200, 160);

  const shown = useGlidingRows(points, ROW_KEYS);
  const horizon = Math.max(1, points[points.length - 1]?.year ?? 1);
  const { width, height } = size;
  const plotW = width - STRIP;
  const zoom = useYearZoom({ last: horizon, plotWidth: plotW, onHover });
  const clip = useId().replace(/:/g, "");
  const x = scaleLinear().domain(zoom.domain).range([0, plotW]);
  // the axis fits the numbers it is going to, and glides there: fitted to the numbers on their way, its rounded top jumped every few frames
  const inView = points.filter((p) => zoom.seen(p.year));
  const maxTop = Math.max(1, ...inView.map((p) => p.net + p.tax + p.fees), ...inView.map((p) => p.contributions));
  const yGoal = scaleLinear().domain([0, maxTop]).nice(4);
  const top = useGlidingNumbers([yGoal.domain()[1]!])[0]!;
  const y = scaleLinear().domain([0, top]).range([height - BOTTOM, TOP]);
  const ticks = ticksOn(useFadingTicks(yGoal.ticks(4)), y, y.range());

  const bandNet = area<ChartPoint>().x((d) => x(d.year)).y0(() => y(0)).y1((d) => y(d.net));
  const bandTax = area<ChartPoint>().x((d) => x(d.year)).y0((d) => y(d.net)).y1((d) => y(d.net + d.tax));
  const bandFees = area<ChartPoint>().x((d) => x(d.year)).y0((d) => y(d.net + d.tax)).y1((d) => y(d.net + d.tax + d.fees));
  const netLine = line<ChartPoint>().x((d) => x(d.year)).y((d) => y(d.net));
  const topLine = line<ChartPoint>().x((d) => x(d.year)).y((d) => y(d.net + d.tax + d.fees));
  const contribLine = line<ChartPoint>().x((d) => x(d.year)).y((d) => y(d.contributions));

  const yearTicks = useFadingTicks(yearTicksIn(zoom.settled[0], zoom.settled[1]));
  const seen = markers.filter((m) => zoom.seen(m.year));
  const hovered = hover === null ? null : shown.find((p) => p.year === hover) ?? null;

  return (
    <div className="flex flex-col gap-1">
    <div ref={box} className={cx("relative w-full h-[240px] lg:h-[300px] transition-opacity duration-[var(--duration-base)]", dimmed && "opacity-60")}>
      <svg
        ref={zoom.svgRef}
        {...zoom.handlers}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
        className="block select-none touch-pan-y"
      >
        <defs>
          <pattern id="chart-hatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
            <rect width="8" height="8" className="fill-blocked-subtle" />
            <line x1="0" y1="0" x2="0" y2="8" className="stroke-chart-blocked" strokeWidth="2" />
          </pattern>
          <clipPath id={clip}>
            <rect x={0} y={0} width={plotW} height={height} />
          </clipPath>
        </defs>
        {ticks.map((t) => (
          <line key={t.value} x1={0} x2={plotW} y1={y(t.value)} y2={y(t.value)} className={cx(t.value === 0 ? "stroke-chart-axis" : "stroke-chart-grid", tickFade(t))} strokeWidth="1" />
        ))}
        <g clipPath={`url(#${clip})`}>
          <g className="stroke-card" strokeWidth="1.5" strokeLinejoin="round">
            <path d={bandNet(shown) ?? ""} className={cx("fill-chart-value", pickDim(highlight, "net"))} />
            <path d={bandTax(shown) ?? ""} className={cx("fill-chart-tax", pickDim(highlight, "tax"))} />
            <path d={bandFees(shown) ?? ""} className={cx("fill-chart-fee", pickDim(highlight, "fees"))} />
          </g>
          {enteredReturn && <path d={topLine(shown) ?? ""} fill="none" className="stroke-chart-entered" strokeWidth="2" strokeDasharray="6 4" />}
          <path d={contribLine(shown) ?? ""} fill="none" className={cx("stroke-chart-contributions", pickDim(highlight, "contributions"))} strokeWidth="1.5" />
          <path d={netLine(shown) ?? ""} fill="none" className={cx(enteredReturn ? "stroke-chart-entered" : "stroke-chart-net", pickDim(highlight, "net"))} strokeWidth="2" strokeDasharray={enteredReturn ? "6 4" : undefined} />
        </g>
        {/* after the lines, with the card-colour halo, so no line runs through a value label (2026-10-26) */}
        <AxisLabels ticks={ticks} y={y} />
        {blocked && (
          <g clipPath={`url(#${clip})`}>
            <rect x={x(blocked.fromYear)} y={TOP} width={Math.max(0, plotW - x(blocked.fromYear))} height={height - BOTTOM - TOP} fill="url(#chart-hatch)" />
          </g>
        )}
        {seen.map((m) => (
          <line key={m.year} x1={Math.min(plotW, x(m.year))} x2={Math.min(plotW, x(m.year))} y1={TOP} y2={height - BOTTOM} className="stroke-chart-marker" strokeWidth="1" />
        ))}
        <YearLabels ticks={yearTicks} x={x} y={height - 8} left={0} right={plotW} word={(yr) => (yr === 0 ? copy.readout.today : String(yr))} />
        {hovered && (
          <g>
            <line x1={x(hovered.year)} x2={x(hovered.year)} y1={TOP} y2={height - BOTTOM} className="stroke-chart-crosshair" strokeWidth="1" />
            <circle cx={x(hovered.year)} cy={y(hovered.net)} r="4" className={cx("stroke-card", enteredReturn ? "fill-chart-entered" : "fill-chart-net")} strokeWidth="2" />
          </g>
        )}
        <ZoomBrush brush={zoom.brush} top={TOP} bottom={height - BOTTOM} />
      </svg>
      {seen.map((m) => (
        <span key={`l${m.year}`} className="absolute top-0 text-xs text-chart-text whitespace-nowrap px-1 bg-card/80 rounded-sm" style={{ left: `${Math.min(plotW, x(m.year))}px`, transform: x(m.year) > plotW / 2 ? "translateX(-100%)" : undefined }} dir="rtl">
          {m.label}
        </span>
      ))}
      {blocked && zoom.settled[1] > blocked.fromYear && (
        <span className="absolute text-xs text-blocked-foreground bg-blocked-subtle rounded-sm px-1.5 py-0.5 inline-flex items-center gap-1" style={{ left: `${Math.max(0, x(blocked.fromYear)) + 4}px`, top: `${TOP + 4}px` }}>
          <IconLock size={14} className="text-blocked" /> {copy.blockedBand} <IdRef id={blocked.code} />
        </span>
      )}
    </div>
    <ZoomBar zoom={zoom} yearWord={(yr) => (yr === 0 ? copy.readout.today : String(yr))} />
    </div>
  );
}
