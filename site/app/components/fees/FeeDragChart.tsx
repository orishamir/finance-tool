// The fee-drag chart (design-spec 11.4, design-system 7.3): each fee's cost over time as stacked bands, the total
// drag as a neutral line on top (2026-10-24 evening: in orange it matched the largest band's legend swatch), real values,
// time left to right, direct labels in a strip at the right. Our own SVG on D3
// scales, sharing the comparison chart's grid, axis, crosshair, readout and table view.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { scaleLinear } from "d3-scale";
import { area, line as d3line } from "d3-shape";
import type { FeeLine } from "@finance-tool/engine";
import { guide as guideCopy, r3fees } from "../../copy";
import type { Analysis } from "../../lib/fees";
import { fmt } from "../../lib/format";
import { Num } from "../provenance";
import { AxisLabels, niceYearTicks } from "../chart/TimelineChart";
import { ChartLegend as Legend, ChartReadout as Readout, ChartTable as Table, Swatch, cx } from "../kit";

const STRIP = 104;
const TOP = 20; // room for the top axis label above its gridline (audit 2026-10-24 (sweep))
const BOTTOM = 26;
const LABEL_H = 38; // one short name over its figure (2026-10-24 evening: two-line names overlapped the next label)
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

interface Band {
  id: string;
  name: string;
  fill: string;
  bg: string;
  lines: FeeLine[];
}

// One fee hue per band in stack order (design-system 2.3, 2026-10-24 evening): orange, gold, teal, magenta.
const hues = [
  { fill: "fill-chart-fee-1", bg: "bg-chart-fee-1" },
  { fill: "fill-chart-fee-2", bg: "bg-chart-fee-2" },
  { fill: "fill-chart-fee-3", bg: "bg-chart-fee-3" },
  { fill: "fill-chart-fee-4", bg: "bg-chart-fee-4" },
];

/** The three largest fees as bands, every further one in a single "rest" band (design-spec 11.4). A fee that costs nothing over
 *  the horizon (an FX line with no foreign trade, a fee reduced to zero) has no band, so no legend item, label or row either
 *  (design-system 3.4: a legend item only for an area that is drawn; 2026-10-24 evening). */
export function bandsOf(an: Analysis): Band[] {
  const order = [...an.lines].filter((l) => l.costNis >= 0.005).sort((a, b) => b.costNis - a.costNis).map((l) => l.line);
  if (order.length <= 4) return order.map((l, i) => ({ id: l, name: r3fees.names[l]!, ...hues[i]!, lines: [l] }));
  const head = order.slice(0, 3).map((l, i) => ({ id: l, name: r3fees.names[l]!, ...hues[i]!, lines: [l] }));
  return [...head, { id: "rest", name: r3fees.chart.rest, ...hues[3]!, lines: order.slice(3) }];
}

interface Pt {
  year: number;
  /** Cumulative top edge of each band, bottom first. */
  edges: number[];
  total: number;
  parts: number[];
}

function points(an: Analysis, bands: Band[]): Pt[] {
  const s = an.series!;
  return s.points
    .filter((p) => p.month % 12 === 0 || p.month === s.exitMonth)
    .map((p) => {
      const parts = bands.map((b) => b.lines.reduce((sum, l) => sum + (p.cost[l] ?? 0), 0));
      let acc = 0;
      return { year: p.month / 12, edges: parts.map((v) => (acc += v)), total: p.total, parts };
    });
}

/** All months, for a smooth outline; the readout and table use whole years. */
function monthly(an: Analysis, bands: Band[]): Pt[] {
  return an.series!.points.map((p) => {
    const parts = bands.map((b) => b.lines.reduce((sum, l) => sum + (p.cost[l] ?? 0), 0));
    let acc = 0;
    return { year: p.month / 12, edges: parts.map((v) => (acc += v)), total: p.total, parts };
  });
}

export function FeeDragChart({ an, horizonYears, hover, onHover, hasGoal, dimmed }: { an: Analysis; horizonYears: number; hover: number | null; onHover: (y: number | null) => void; hasGoal: boolean; dimmed?: boolean }) {
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
  const bands = bandsOf(an);
  const pts = monthly(an, bands);
  const { width, height } = size;
  const plotW = width - STRIP;
  const years = pts[pts.length - 1]?.year ?? horizonYears;
  const x = scaleLinear().domain([0, Math.max(1, years)]).range([0, plotW]);
  const maxV = Math.max(1, ...pts.map((p) => Math.max(p.total, p.edges[p.edges.length - 1] ?? 0)));
  const y = scaleLinear().domain([0, maxV]).nice(4).range([height - BOTTOM, TOP]);
  const ticks = y.ticks(4);
  const yearTicks = niceYearTicks(years);
  const bandArea = (i: number) =>
    area<Pt>()
      .x((d) => x(d.year))
      .y0((d) => y(i === 0 ? 0 : d.edges[i - 1]!))
      .y1((d) => y(d.edges[i]!));
  const totalLine = d3line<Pt>().x((d) => x(d.year)).y((d) => y(d.total));
  const last = pts[pts.length - 1];

  // Labels at the right end: each band's name over its horizon cost, the total at the top, pushed apart by the label height.
  const labels: { id: string; name: string; value: number; y: number; band?: Band }[] = [];
  if (last) {
    bands.forEach((b, i) => labels.push({ id: b.id, name: r3fees.chart.short[b.id] ?? b.name, value: last.parts[i]!, y: y((last.edges[i]! + (last.edges[i - 1] ?? 0)) / 2), band: b }));
    // audit A79: when one band is the whole total, the second label would repeat it; the band's own label stays
    if (!labels.some((l) => Math.abs(l.value - last.total) < 0.005)) labels.push({ id: "total", name: r3fees.chart.total, value: last.total, y: y(last.total) });
  }
  labels.sort((a, b) => a.y - b.y);
  const placed: typeof labels = [];
  for (const l of labels) placed.push({ ...l, y: Math.max(l.y, (placed[placed.length - 1]?.y ?? -Infinity) + LABEL_H) });
  const over = (placed[placed.length - 1]?.y ?? 0) + LABEL_H / 2 - (height - BOTTOM + 8);
  if (over > 0) placed.forEach((p) => (p.y -= over));
  const top0 = placed[0] ? placed[0].y - LABEL_H / 2 : 0;
  if (top0 < 0) placed.forEach((p) => (p.y -= top0));

  const pick = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    onHover(Math.max(0, Math.min(Math.floor(years), Math.round(x.invert(clientX - rect.left)))));
  };
  const hovered = hover === null ? null : pts.find((p) => Math.abs(p.year - hover) < 1e-6) ?? null;
  const run = { rules: an.fm.run.rules, flags: an.fm.run.flags };
  return (
    <div ref={box} className={cx("relative w-full h-[240px] lg:h-[320px] transition-opacity duration-[var(--duration-base)]", dimmed && "opacity-60")}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${r3fees.chart.aria[0]}${an.lines.length}${r3fees.chart.aria[1]}${fmt.years(Math.round(years))}${r3fees.chart.aria[2]}`}
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
        <g className="stroke-card" strokeWidth="1.5" strokeLinejoin="round">
          {bands.map((b, i) => (
            <path key={b.id} d={bandArea(i)(pts) ?? ""} className={b.fill} />
          ))}
        </g>
        <AxisLabels ticks={ticks} y={y} />
        <path d={totalLine(pts) ?? ""} fill="none" className="stroke-chart-fee-total" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <line x1={x(years)} x2={x(years)} y1={TOP} y2={height - BOTTOM} className="stroke-chart-marker" strokeWidth="1" />
        {yearTicks.map((yr) => (
          <text key={yr} x={x(yr)} y={height - 8} textAnchor={yr === 0 ? "start" : yr === Math.round(years) ? "end" : "middle"} direction="ltr" className="text-xs fill-chart-text" data-scale>
            {yr === 0 ? guideCopy.readout.today : yr}
          </text>
        ))}
        {hovered && (
          <g>
            <line x1={x(hovered.year)} x2={x(hovered.year)} y1={TOP} y2={height - BOTTOM} className="stroke-chart-crosshair" strokeWidth="1" />
            <circle cx={x(hovered.year)} cy={y(hovered.total)} r="4" className="stroke-card fill-chart-fee-total" strokeWidth="2" />
          </g>
        )}
      </svg>
      <span className="absolute top-0 text-xs text-chart-text whitespace-nowrap px-1 bg-card/80 rounded-sm" style={{ left: `${x(years)}px`, transform: "translateX(-100%)" }} dir="rtl">
        {hasGoal ? "מועד המטרה" : r3fees.chart.noGoalMarker}
      </span>
      {placed.map((p) => (
        <div key={p.id} className="absolute text-xs leading-tight" style={{ left: `${plotW + 8}px`, top: `${p.y - LABEL_H / 2}px`, width: `${STRIP - 10}px`, height: `${LABEL_H}px` }}>
          <span className="line-clamp-1 font-medium">{p.name}</span>
          <Num value={an.mk.nis(p.value, "F-61", p.name, run)} size="cell" />
        </div>
      ))}
    </div>
  );
}

export function ChartLegend({ an }: { an: Analysis }) {
  const bands = bandsOf(an);
  return (
    <Legend
      items={[
        ...bands.map((b) => ({ id: b.id, swatch: <Swatch shape="box" className={b.bg} />, label: <bdi>{b.name}</bdi> })),
        { id: "total", swatch: <Swatch className="bg-chart-fee-total" />, label: r3fees.chart.total },
        { id: "remainder", label: r3fees.chart.remainderLegend },
      ]}
    />
  );
}

export function ChartReadout({ an, year }: { an: Analysis; year: number }) {
  const bands = bandsOf(an);
  const p = points(an, bands).find((q) => Math.abs(q.year - year) < 1e-6) ?? points(an, bands).at(-1)!;
  const run = { rules: an.fm.run.rules, flags: an.fm.run.flags };
  const sum = p.parts.reduce((a, b) => a + b, 0);
  return (
    <Readout
      title={p.year === 0 ? guideCopy.readout.today : `${r3fees.chart.year} ${p.year}`}
      rows={[
        ...bands.map((b, i) => ({ id: b.id, swatch: <Swatch shape="box" className={b.bg} />, label: <bdi>{b.name}</bdi>, value: <Num value={an.mk.nis(p.parts[i]!, "F-61", b.name, run)} animate /> })),
        { id: "total", swatch: <Swatch className="bg-chart-fee-total" />, label: r3fees.chart.total, value: <Num value={an.mk.nis(p.total, "F-61", r3fees.chart.total, run)} animate /> },
        { id: "remainder", label: r3fees.chart.remainderLegend.split(":")[0], value: <Num value={an.mk.nis(p.total - sum, "F-61", r3fees.chart.remainderLegend, run)} animate /> },
      ]}
    />
  );
}

export function ChartTable({ an }: { an: Analysis }) {
  const bands = bandsOf(an);
  const rows = points(an, bands);
  const run = { rules: an.fm.run.rules, flags: an.fm.run.flags };
  return (
    <Table
      rowHead="שנה"
      columns={[...bands.map((b) => ({ id: b.id, head: <bdi>{b.name}</bdi> })), { id: "total", head: r3fees.chart.total }, { id: "remainder", head: r3fees.chart.remainderLegend.split(":")[0] }]}
      rows={rows.map((p) => ({
        key: p.year,
        head: p.year,
        cells: [
          ...bands.map((b, i) => <Num key={b.id} size="cell" value={an.mk.nis(p.parts[i]!, "F-61", b.name, run)} />),
          <Num key="total" size="cell" value={an.mk.nis(p.total, "F-61", r3fees.chart.total, run)} />,
          <Num key="remainder" size="cell" value={an.mk.nis(p.total - p.parts.reduce((a, b) => a + b, 0), "F-61", r3fees.chart.remainderLegend, run)} />,
        ],
      }))}
    />
  );
}
