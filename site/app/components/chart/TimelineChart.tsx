// The timeline graph (design-spec 1.4, design-system 3.4): our own SVG on D3 scales and shapes. Time runs
// left to right; the value axis labels sit at the plot's left edge above their gridlines (one rule shared by
// the three SVG charts, see AxisLabels); bands bottom-up are what is left, tax and fees, with a neutral
// contributions line over them.
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { area, line } from "d3-shape";
import { scaleLinear } from "d3-scale";
import { guide as copy } from "../../copy";
import { fmt } from "../../lib/format";
import { IconLock } from "../icons";
import { durationChart } from "../provenance";
import { cx } from "../kit";

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

/** The shared value-axis rule: labels at the plot's start edge, just above their gridline, with a card-colour halo. */
export function AxisLabels({ ticks, y }: { ticks: number[]; y: (v: number) => number }) {
  return (
    <>
      {ticks.map(
        (t) =>
          t > 0 && (
            <text key={t} x={2} y={y(t) - 4} textAnchor="start" direction="ltr" className="text-xs fill-chart-text stroke-card [paint-order:stroke]" strokeWidth="3" data-scale>
              {fmt.compactNisAxis(t)}
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

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function TimelineChart({ points, hover, onHover, markers = [], blocked, enteredReturn, ariaLabel, dimmed }: TimelineChartProps) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 326, height: 240 });
  useIsoLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setSize({ width: Math.max(200, el.clientWidth), height: Math.max(160, el.clientHeight) });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const shown = useAnimatedPoints(points);
  const horizon = Math.max(1, points[points.length - 1]?.year ?? 1);
  const { width, height } = size;
  const plotW = width - STRIP;
  const x = scaleLinear().domain([0, horizon]).range([0, plotW]);
  const maxTop = Math.max(1, ...shown.map((p) => p.net + p.tax + p.fees), ...shown.map((p) => p.contributions));
  const y = scaleLinear().domain([0, maxTop]).nice(4).range([height - BOTTOM, TOP]);
  const ticks = y.ticks(4);

  const bandNet = area<ChartPoint>().x((d) => x(d.year)).y0(() => y(0)).y1((d) => y(d.net));
  const bandTax = area<ChartPoint>().x((d) => x(d.year)).y0((d) => y(d.net)).y1((d) => y(d.net + d.tax));
  const bandFees = area<ChartPoint>().x((d) => x(d.year)).y0((d) => y(d.net + d.tax)).y1((d) => y(d.net + d.tax + d.fees));
  const netLine = line<ChartPoint>().x((d) => x(d.year)).y((d) => y(d.net));
  const topLine = line<ChartPoint>().x((d) => x(d.year)).y((d) => y(d.net + d.tax + d.fees));
  const contribLine = line<ChartPoint>().x((d) => x(d.year)).y((d) => y(d.contributions));

  const yearTicks = niceYearTicks(horizon);
  const hovered = hover === null ? null : shown.find((p) => p.year === hover) ?? null;

  const svgRef = useRef<SVGSVGElement>(null);
  const pick = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = clientX - rect.left;
    const yr = Math.round(x.invert(px));
    onHover(Math.max(0, Math.min(horizon, yr)));
  };

  return (
    <div ref={box} className={cx("relative w-full h-[240px] lg:h-[300px] transition-opacity duration-[var(--duration-base)]", dimmed && "opacity-60")}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
        className="block select-none touch-pan-y"
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerUp={() => onHover(null)}
        onPointerLeave={() => onHover(null)}
        onPointerCancel={() => onHover(null)}
      >
        <defs>
          <pattern id="chart-hatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
            <rect width="8" height="8" className="fill-blocked-subtle" />
            <line x1="0" y1="0" x2="0" y2="8" className="stroke-chart-blocked" strokeWidth="2" />
          </pattern>
        </defs>
        {ticks.map((t) => (
          <line key={t} x1={0} x2={plotW} y1={y(t)} y2={y(t)} className={t === 0 ? "stroke-chart-axis" : "stroke-chart-grid"} strokeWidth="1" />
        ))}
        <g className="stroke-card" strokeWidth="1.5" strokeLinejoin="round">
          <path d={bandNet(shown) ?? ""} className="fill-chart-value" />
          <path d={bandTax(shown) ?? ""} className="fill-chart-tax" />
          <path d={bandFees(shown) ?? ""} className="fill-chart-fee" />
        </g>
        <AxisLabels ticks={ticks} y={y} />
        {enteredReturn && <path d={topLine(shown) ?? ""} fill="none" className="stroke-chart-entered" strokeWidth="2" strokeDasharray="6 4" />}
        <path d={contribLine(shown) ?? ""} fill="none" className="stroke-chart-contributions" strokeWidth="1.5" />
        <path d={netLine(shown) ?? ""} fill="none" className={enteredReturn ? "stroke-chart-entered" : "stroke-chart-net"} strokeWidth="2" strokeDasharray={enteredReturn ? "6 4" : undefined} />
        {blocked && (
          <g>
            <rect x={x(blocked.fromYear)} y={TOP} width={Math.max(0, plotW - x(blocked.fromYear))} height={height - BOTTOM - TOP} fill="url(#chart-hatch)" />
          </g>
        )}
        {markers.map((m) => (
          <line key={m.year} x1={x(m.year)} x2={x(m.year)} y1={TOP} y2={height - BOTTOM} className="stroke-chart-marker" strokeWidth="1" />
        ))}
        {yearTicks.map((yr) => (
          <text key={yr} x={x(yr)} y={height - 8} textAnchor={yr === 0 ? "start" : yr === horizon ? "end" : "middle"} direction="ltr" className="text-xs fill-chart-text" data-scale>
            {yr === 0 ? copy.readout.today : yr}
          </text>
        ))}
        {hovered && (
          <g>
            <line x1={x(hovered.year)} x2={x(hovered.year)} y1={TOP} y2={height - BOTTOM} className="stroke-chart-crosshair" strokeWidth="1" />
            <circle cx={x(hovered.year)} cy={y(hovered.net)} r="4" className={cx("stroke-card", enteredReturn ? "fill-chart-entered" : "fill-chart-net")} strokeWidth="2" />
          </g>
        )}
      </svg>
      {markers.map((m) => (
        <span key={`l${m.year}`} className="absolute top-0 text-xs text-chart-text whitespace-nowrap px-1 bg-card/80 rounded-sm" style={{ left: `${x(m.year)}px`, transform: x(m.year) > plotW / 2 ? "translateX(-100%)" : undefined }} dir="rtl">
          {m.label}
        </span>
      ))}
      {blocked && (
        <span className="absolute text-xs text-blocked-foreground bg-blocked-subtle rounded-sm px-1.5 py-0.5 inline-flex items-center gap-1" style={{ left: `${x(blocked.fromYear) + 4}px`, top: `${TOP + 4}px` }}>
          <IconLock size={14} className="text-blocked" /> {copy.blockedBand} <bdi dir="ltr">{blocked.code}</bdi>
        </span>
      )}
    </div>
  );
}

/** Paths move to their new shape over --duration-chart; a changed horizon stretches the old curve over the new one. */
function useAnimatedPoints(target: ChartPoint[]): ChartPoint[] {
  const [shown, setShown] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const from = prev.current;
    const ms = durationChart();
    if (ms === 0 || from === target || from.length < 2 || target.length < 2) {
      setShown(target);
      prev.current = target;
      return;
    }
    const start = performance.now();
    const fromR = resample(from, target);
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - t, 3);
      setShown(
        target.map((p, i) => {
          const f = fromR[i]!;
          return { year: p.year, net: f.net + (p.net - f.net) * e, tax: f.tax + (p.tax - f.tax) * e, fees: f.fees + (p.fees - f.fees) * e, contributions: f.contributions + (p.contributions - f.contributions) * e };
        }),
      );
      if (t < 1) raf = requestAnimationFrame(tick);
      else prev.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return shown;
}

function resample(from: ChartPoint[], target: ChartPoint[]): ChartPoint[] {
  const fh = from[from.length - 1]!.year;
  const th = target[target.length - 1]!.year;
  return target.map((p) => {
    const pos = (p.year / th) * fh;
    const i = Math.min(from.length - 2, Math.max(0, Math.floor(pos)));
    const a = from[i]!;
    const b = from[i + 1]!;
    const t = b.year === a.year ? 0 : (pos - a.year) / (b.year - a.year);
    const l = (u: number, v: number) => u + (v - u) * Math.max(0, Math.min(1, t));
    return { year: p.year, net: l(a.net, b.net), tax: l(a.tax, b.tax), fees: l(a.fees, b.fees), contributions: l(a.contributions, b.contributions) };
  });
}
