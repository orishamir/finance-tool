// The comparison chart (design-spec 6.4, design-system 6.5): the top three options and the baseline on one
// axis, time left to right, direct labels at the right end, dashed where a line rests on a return the person
// entered. Our own SVG on D3 scales, sharing the timeline chart's grid, axis, crosshair and table view.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { scaleLinear } from "d3-scale";
import { line } from "d3-shape";
import { buttons, guide as guideCopy, r2 } from "../../copy";
import type { SeriesLine } from "../../lib/compare";
import { fmt } from "../../lib/format";
import { durationChart, Num } from "../provenance";
import { AxisLabels, niceYearTicks, scrollCueStyle } from "../chart/TimelineChart";
import { Disclosure, cx } from "../ui";
import type { Mode, ResultCtx } from "./ctx";

const STRIP = 104;
const TOP = 20; // room for the top axis label above its gridline (audit 2026-10-24 (sweep))
const BOTTOM = 26;
const LABEL_H = 54;
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const roleClass = {
  "option-1": { stroke: "stroke-chart-option-1", bg: "bg-chart-option-1", fill: "fill-chart-option-1", width: 2.5 },
  "option-2": { stroke: "stroke-chart-option-2", bg: "bg-chart-option-2", fill: "fill-chart-option-2", width: 2 },
  "option-3": { stroke: "stroke-chart-option-3", bg: "bg-chart-option-3", fill: "fill-chart-option-3", width: 1.5 },
  baseline: { stroke: "stroke-chart-baseline", bg: "bg-chart-baseline", fill: "fill-chart-baseline", width: 1.5 },
} as const;

interface Pt {
  year: number;
  v: number;
}

const valueOf = (l: SeriesLine, mode: Mode): Pt[] => l.points.map((p) => ({ year: p.year, v: mode === "real" ? p.real : p.nominal }));

/** Values move to their new numbers over --duration-chart when an input changes and the shape (the lines, the years) is the same. */
function useTween(target: Record<string, Pt[]>): Record<string, Pt[]> {
  const [shown, setShown] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const from = prev.current;
    const ms = durationChart();
    const same = Object.keys(target).length === Object.keys(from).length && Object.entries(target).every(([id, pts]) => from[id]?.length === pts.length);
    if (ms === 0 || !same) {
      setShown(target);
      prev.current = target;
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - t, 3);
      setShown(Object.fromEntries(Object.entries(target).map(([id, pts]) => [id, pts.map((p, i) => ({ year: p.year, v: from[id]![i]!.v + (p.v - from[id]![i]!.v) * e }))])));
      if (t < 1) raf = requestAnimationFrame(tick);
      else prev.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return shown;
}

export function ComparisonChart({ lines, mode, horizon, ctx, hover, onHover, dimmed }: { lines: SeriesLine[]; mode: Mode; horizon: number; ctx: ResultCtx; hover: number | null; onHover: (y: number | null) => void; dimmed?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 326, height: 240 });
  useIsoLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setSize({ width: Math.max(220, el.clientWidth), height: Math.max(180, el.clientHeight) });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const target = Object.fromEntries(lines.map((l) => [l.id, valueOf(l, mode)]));
  const shown = useTween(target);
  const { width, height } = size;
  const plotW = width - STRIP;
  const x = scaleLinear().domain([0, Math.max(1, horizon)]).range([0, plotW]);
  const maxV = Math.max(1, ...Object.values(shown).flatMap((p) => p.map((q) => q.v)));
  const y = scaleLinear().domain([0, maxV]).nice(4).range([height - BOTTOM, TOP]);
  const ticks = y.ticks(4);
  const path = line<Pt>().x((d) => x(d.year)).y((d) => y(d.v));
  const yearTicks = niceYearTicks(horizon);
  // A12: the fall the person accepts, as a band from today's amount down by that share (D11 unchanged: it filters in exposure mode only)
  const fallStart = ctx.g.amountNow - ctx.g.available;
  // the band is a bracket at the start (year 0 to the first tick): the fall is read on today's amount, not applied to every year (F-71, 2026-10-24)
  const fallW = x(Math.min(Math.max(1, horizon), yearTicks.find((t) => t > 0) ?? 1));
  const fallDrop = ctx.fall && ctx.fall > 0 && fallStart > 0 ? (fallStart * Math.min(ctx.fall, 100)) / 100 : 0;

  // One direct label, for the leading option only (the others are in the readout and the table): placed at its line's
  // end and kept inside the plot's height, so labels can never overprint one another or the goal marker.
  const lead = ctx.view.ranked[0] ? lines.find((l) => l.id === ctx.view.ranked[0]!.id) ?? lines[0] : lines[0];
  const leadEnd = lead ? y(shown[lead.id]?.[shown[lead.id]!.length - 1]?.v ?? 0) : 0;
  const leadY = Math.max(TOP + LABEL_H / 2 + 14, Math.min(height - BOTTOM - LABEL_H / 2, leadEnd));

  const leadOpt = lead ? ctx.view.ranked.find((o) => o.id === lead.id) : undefined;
  const leadLast = lead?.points[lead.points.length - 1];
  const leadRaw = (mode === "real" ? leadOpt?.real ?? leadLast?.real : leadOpt?.nominal ?? leadLast?.nominal) ?? 0;
  const leadValue = ctx.mk.nis(leadRaw, mode === "real" ? "F-06" : "F-09", lead?.name ?? "", leadOpt);
  const pick = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const yr = Math.round(x.invert(clientX - rect.left));
    onHover(Math.max(0, Math.min(horizon, yr)));
  };
  const hovered = hover === null ? null : hover;
  return (
    <div ref={box} className={cx("relative w-full h-[240px] lg:h-[320px] transition-opacity duration-[var(--duration-base)]", dimmed && "opacity-60")}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${r2.result.chartAria} ${fmt.years(horizon)}. ${guideCopy.graphAria.after}`}
        className="block select-none touch-pan-y"
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerUp={() => onHover(null)}
        onPointerLeave={() => onHover(null)}
        onPointerCancel={() => onHover(null)}
      >
        {ticks.map((t) => (
          <line key={t} x1={0} x2={plotW} y1={y(t)} y2={y(t)} className={t === 0 ? "stroke-chart-axis" : "stroke-chart-grid"} strokeWidth="1" />
        ))}
        {fallDrop > 0 && (
          <g role="img" aria-label={r2.result.fallBand} data-fall-band>
            <rect x={0} y={y(fallStart)} width={fallW} height={Math.max(0, y(fallStart - fallDrop) - y(fallStart))} className="fill-foreground" fillOpacity="0.07" />
            <line x1={0} x2={fallW} y1={y(fallStart - fallDrop)} y2={y(fallStart - fallDrop)} className="stroke-chart-marker" strokeWidth="1" strokeDasharray="2 3" />
          </g>
        )}
        <AxisLabels ticks={ticks} y={y} />
        <line x1={x(horizon)} x2={x(horizon)} y1={TOP} y2={height - BOTTOM} className="stroke-chart-marker" strokeWidth="1" />
        {[...lines].reverse().map((l) => (
          <path key={l.id} d={path(shown[l.id] ?? []) ?? ""} fill="none" className={roleClass[l.role].stroke} strokeWidth={roleClass[l.role].width} strokeDasharray={l.enteredReturn ? "6 4" : undefined} strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {yearTicks.map((yr) => (
          <text key={yr} x={x(yr)} y={height - 8} textAnchor={yr === 0 ? "start" : yr === horizon ? "end" : "middle"} direction="ltr" className="text-xs fill-chart-text" data-scale>
            {yr === 0 ? guideCopy.readout.today : yr}
          </text>
        ))}
        {hovered !== null && (
          <g>
            <line x1={x(hovered)} x2={x(hovered)} y1={TOP} y2={height - BOTTOM} className="stroke-chart-crosshair" strokeWidth="1" />
            {lines.map((l) => {
              const p = shown[l.id]?.find((q) => q.year === hovered);
              return p ? <circle key={l.id} cx={x(p.year)} cy={y(p.v)} r="4" className={cx("stroke-card", roleClass[l.role].fill)} strokeWidth="2" /> : null;
            })}
          </g>
        )}
      </svg>
      <span className="absolute top-0 text-xs text-chart-text whitespace-nowrap px-1 bg-card/80 rounded-sm" style={{ left: `${x(horizon)}px`, transform: "translateX(-100%)" }} dir="rtl">
        {r2.result.chartHorizon}
      </span>
      {lead && (
        <div className="absolute text-xs leading-tight" style={{ left: `${plotW + 8}px`, top: `${leadY - LABEL_H / 2}px`, width: `${STRIP - 10}px`, height: `${LABEL_H}px` }}>
          <span className="line-clamp-2 font-medium">{lead.name}</span>
          <Num value={leadValue} size="cell" />
        </div>
      )}
    </div>
  );
}

export function ChartLegend({ lines }: { lines: SeriesLine[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="מקרא">
      {lines.map((l) => (
        <li key={l.id} className="flex items-center gap-1.5">
          {l.enteredReturn ? (
            <svg width="14" height="3" aria-hidden="true">
              <line x1="0" y1="1.5" x2="14" y2="1.5" strokeDasharray="4 2" strokeWidth="3" className={roleClass[l.role].stroke} />
            </svg>
          ) : (
            <span className={cx("w-3.5 h-[3px] rounded-sm", roleClass[l.role].bg)} />
          )}
          <bdi>{l.name}</bdi>
        </li>
      ))}
    </ul>
  );
}

/** One row per line at the hovered year (or the horizon): swatch, name, value. */
export function ChartReadout({ lines, mode, year, ctx }: { lines: SeriesLine[]; mode: Mode; year: number; ctx: ResultCtx }) {
  return (
    <dl className="readout" aria-live="polite">
      <div className="readout-row readout-head">
        <dt>{year === 0 ? guideCopy.readout.today : `${r2.result.chartYear} ${year}`}</dt>
        <dd />
      </div>
      {lines.map((l) => {
        const p = l.points.find((q) => q.year === year) ?? l.points[l.points.length - 1]!;
        const opt = ctx.view.ranked.find((o) => o.id === l.id);
        const v = mode === "real" ? p.real : p.nominal;
        return (
          <div key={l.id} className="readout-row">
            <dt className="flex items-center gap-2">
              <span className={cx("w-3.5 h-[3px] rounded-sm", roleClass[l.role].bg)} />
              <bdi>{l.name}</bdi>
            </dt>
            <dd>
              <Num value={ctx.mk.nis(v, mode === "real" ? "F-06" : "F-09", l.name, opt)} animate />
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

export function ChartTable({ lines, mode, ctx }: { lines: SeriesLine[]; mode: Mode; ctx: ResultCtx }) {
  const years = lines[0]?.points.map((p) => p.year) ?? [];
  return (
    <Disclosure label={buttons.showTable} openLabel={buttons.hideTable} summaryClassName="text-sm">
      <div className="overflow-x-auto mt-2" style={scrollCueStyle}>
        <table className="tbl text-sm">
          <thead>
            <tr>
              <th scope="col">{r2.result.tableYear}</th>
              {lines.map((l) => (
                <th key={l.id} scope="col">
                  <bdi>{l.name}</bdi>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map((yr) => (
              <tr key={yr}>
                <th scope="row">
                  <bdi dir="ltr">{yr}</bdi>
                </th>
                {lines.map((l) => {
                  const p = l.points.find((q) => q.year === yr);
                  const opt = ctx.view.ranked.find((o) => o.id === l.id);
                  return <td key={l.id}>{p ? <Num size="cell" value={ctx.mk.nis(mode === "real" ? p.real : p.nominal, mode === "real" ? "F-06" : "F-09", l.name, opt)} /> : null}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Disclosure>
  );
}
