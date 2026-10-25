// The cumulative-cost chart (design-system 8.3, design-spec 16.4): the provider fees paid up to each month, real, one
// step line per provider for ranks 1 to 3 and the compared one; one fee hue per line (2026-10-24 evening: the orange steps
// looked alike in the legend); direct labels at the end.
// Our own SVG on D3 scales, sharing the fee-drag chart's grid, axis, crosshair, readout and table view.
import { AxisLabels, niceYearTicks } from "../../chart/TimelineChart";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { scaleLinear } from "d3-scale";
import { curveStepAfter, line as d3line } from "d3-shape";
import { r4workbench as c } from "../../../copy";
import { fmt } from "../../../lib/format";
import type { ChartLine } from "../../../lib/providers";
import { computed } from "../../../lib/value";
import { IconPencil } from "../../icons";
import { Num } from "../../provenance";
import { ChartLegend as Legend, ChartReadout as Readout, ChartTable as Table, Swatch, cx } from "../../kit";

const STRIP = 112;
const TOP = 20; // room for the top axis label above its gridline (audit 2026-10-24 (sweep))
const BOTTOM = 26;
const LABEL_H = 38;
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const style: Record<NonNullable<ChartLine["role"]>, { stroke: string; bg: string; width: number }> = {
  "rank-1": { stroke: "stroke-chart-fee-1", bg: "bg-chart-fee-1", width: 2.5 },
  "rank-2": { stroke: "stroke-chart-fee-2", bg: "bg-chart-fee-2", width: 2 },
  "rank-3": { stroke: "stroke-chart-fee-3", bg: "bg-chart-fee-3", width: 1.5 },
  vs: { stroke: "stroke-chart-fee-4", bg: "bg-chart-fee-4", width: 1.5 },
};

const drawn = (lines: ChartLine[]) => lines.filter((l) => l.role !== null) as (ChartLine & { role: NonNullable<ChartLine["role"]> })[];

export function CumulativeCostChart({ lines, years, today, hover, onHover, dimmed }: { lines: ChartLine[]; years: number; today: string; hover: number | null; onHover: (y: number | null) => void; dimmed?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 326, height: 240 });
  useIsoLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => setSize({ width: Math.max(240, el.clientWidth), height: Math.max(180, el.clientHeight) });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const shown = drawn(lines);
  const { width, height } = size;
  const plotW = width - STRIP;
  const months = shown[0]?.real.length ? shown[0].real.length - 1 : 12 * years;
  const horizonYears = months / 12;
  const x = scaleLinear().domain([0, Math.max(1, horizonYears)]).range([0, plotW]);
  const maxV = Math.max(1, ...shown.map((l) => l.real[l.real.length - 1] ?? 0));
  const y = scaleLinear().domain([0, maxV]).nice(4).range([height - BOTTOM, TOP]);
  const ticks = y.ticks(4);
  const yearTicks = niceYearTicks(horizonYears);
  const path = d3line<number>().x((_, m) => x(m / 12)).y((v) => y(v)).curve(curveStepAfter);

  // direct labels: each line's short name over its horizon cost, pushed apart (collision rule of the comparison chart)
  const labels = shown.map((l) => ({ id: l.id, line: l, y: y(l.real[l.real.length - 1] ?? 0) })).sort((a, b) => a.y - b.y);
  const placed: typeof labels = [];
  for (const l of labels) placed.push({ ...l, y: Math.max(l.y, (placed[placed.length - 1]?.y ?? -Infinity) + LABEL_H) });
  const over = (placed[placed.length - 1]?.y ?? 0) + LABEL_H / 2 - (height - BOTTOM + 8);
  if (over > 0) placed.forEach((p) => (p.y -= over));
  const top0 = placed[0] ? placed[0].y - LABEL_H / 2 : 0;
  if (top0 < 0) placed.forEach((p) => (p.y -= top0));

  const pick = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    onHover(Math.max(0, Math.min(Math.floor(horizonYears), Math.round(x.invert(clientX - rect.left)))));
  };
  const yearOneX = horizonYears > 1 ? x(1) : null;
  return (
    <div ref={box} className={cx("relative w-full h-[240px] lg:h-[320px] transition-opacity duration-[var(--duration-base)]", dimmed && "opacity-60")}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={c.providers.chart.aria(lines.length, fmt.years(Math.round(horizonYears)))}
        className="block select-none touch-pan-y"
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerUp={() => onHover(null)}
        onPointerLeave={() => onHover(null)}
        onPointerCancel={() => onHover(null)}
      >
        {ticks.map((tk) => (
          <line key={tk} x1={0} x2={plotW} y1={y(tk)} y2={y(tk)} className={tk === 0 ? "stroke-chart-axis" : "stroke-chart-grid"} strokeWidth="1" />
        ))}
        <AxisLabels ticks={ticks} y={y} />
        <line x1={x(horizonYears)} x2={x(horizonYears)} y1={TOP} y2={height - BOTTOM} className="stroke-chart-marker" strokeWidth="1" />
        {yearOneX !== null && <line x1={yearOneX} x2={yearOneX} y1={TOP} y2={height - BOTTOM} className="stroke-chart-marker" strokeWidth="1" strokeDasharray="2 4" />}
        {[...shown].reverse().map((l) => (
          <path key={l.id} d={path(l.real) ?? ""} fill="none" className={cx(style[l.role].stroke, "transition-[d] duration-[var(--duration-chart)]")} strokeWidth={style[l.role].width} strokeDasharray={l.entered ? "6 4" : undefined} strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {yearTicks.map((yr) => (
          <text key={yr} x={x(yr)} y={height - 8} textAnchor={yr === 0 ? "start" : yr === Math.round(horizonYears) ? "end" : "middle"} direction="ltr" className="text-xs fill-chart-text" data-scale>
            {yr === 0 ? c.providers.chart.today : yr}
          </text>
        ))}
        {hover !== null &&
          shown.map((l) => {
            const m = Math.min(l.real.length - 1, hover * 12);
            return (
              <g key={l.id}>
                <line x1={x(hover)} x2={x(hover)} y1={TOP} y2={height - BOTTOM} className="stroke-chart-crosshair" strokeWidth="1" />
                <circle cx={x(hover)} cy={y(l.real[m]!)} r="4" className={cx("stroke-card", style[l.role].stroke.replace("stroke-", "fill-"))} strokeWidth="2" />
              </g>
            );
          })}
      </svg>
      <span className="absolute top-0 text-xs text-chart-text whitespace-nowrap px-1 bg-card/80 rounded-sm" style={{ left: `${x(horizonYears)}px`, transform: "translateX(-100%)" }} dir="rtl">
        {c.providers.chart.marker.horizon}
      </span>
      {yearOneX !== null && (
        <span className="absolute bottom-6 text-[11px] text-chart-text whitespace-nowrap px-1 bg-card/80 rounded-sm" style={{ left: `${yearOneX + 3}px` }} dir="rtl">
          {c.providers.chart.yearOneMarker}
        </span>
      )}
      {placed.map((p) => (
        <div key={p.id} className="absolute text-xs leading-tight" style={{ left: `${plotW + 8}px`, top: `${p.y - LABEL_H / 2}px`, width: `${STRIP - 10}px`, height: `${LABEL_H}px` }}>
          <span className="line-clamp-1 font-medium inline-flex items-center gap-1">
            {p.line.entered && <IconPencil size={14} className="shrink-0" />}
            <bdi>{p.line.short}</bdi>
          </span>
          <Num value={p.line.horizonCost} size="cell" />
        </div>
      ))}
    </div>
  );
}

export function ChartLegend({ lines }: { lines: ChartLine[] }) {
  const shown = drawn(lines);
  return (
    <Legend
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
