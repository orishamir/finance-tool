// The fee-drag chart (design-spec 11.4, design-system 7.3): each fee's cost over time as stacked bands, the total
// drag as a neutral line on top (2026-10-24 evening: in orange it matched the largest band's legend swatch), real values,
// time left to right, direct labels in a strip at the right. Our own SVG on D3
// scales, sharing the comparison chart's grid, axis, crosshair, readout and table view.
import { useId } from "react";
import { scaleLinear } from "d3-scale";
import { area, line as d3line } from "d3-shape";
import type { FeeLine } from "@finance-tool/engine";
import { guide as guideCopy, r3fees } from "../../copy";
import type { Analysis } from "../../lib/fees";
import { fmt } from "../../lib/format";
import { Num } from "../provenance";
import { AxisLabels, yearTicksIn } from "../chart/TimelineChart";
import { ChartLegend as Legend, ChartReadout as Readout, ChartTable as Table, Swatch, YearLabels, ZoomBar, ZoomBrush, cx, pickDim, tickFade, useFadingTicks, useGlidingNumbers, useGlidingRows, useYearZoom, type ChartPick, useBox, ticksOn } from "../kit";

const STRIP = 104;
const TOP = 20; // room for the top axis label above its gridline (audit 2026-10-24 (sweep))
const BOTTOM = 26;
const LABEL_H = 38; // one short name over its figure (2026-10-24 evening: two-line names overlapped the next label)

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
 *  (design-system 3.4: a legend item only for an area that is drawn; 2026-10-24 evening). A line whose discount ends (A-19, F-16)
 *  keeps its band while the horizon is still inside the discount and it costs nothing yet: it is charged later on the same plan,
 *  and a legend item, a label and a table column that came and went with the years slider moved the page (D63, 2026-11-07). */
export function bandsOf(an: Analysis): Band[] {
  const order = [...an.lines].filter((l) => l.costNis >= 0.005 || l.after !== undefined).sort((a, b) => b.costNis - a.costNis).map((l) => l.line);
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

export function FeeDragChart({ an, horizonYears, hover, onHover, dimmed, highlight }: { an: Analysis; horizonYears: number; hover: number | null; onHover: (y: number | null) => void; dimmed?: boolean; /** The band the legend sets apart, or `total`. */ highlight?: string | null }) {
  const [box, size] = useBox(240, 180);
  const bands = bandsOf(an);
  // whole years and the exit month, as the readout and the table: drawn month by month, each band's edge rose and fell between charges
  // and every boundary showed as a saw (2026-10-26)
  const goal = points(an, bands);
  const keys = [...bands.map((b) => b.id), "total"];
  const flat = goal.map((p) => ({ year: p.year, total: p.total, ...Object.fromEntries(bands.map((b, i) => [b.id, p.parts[i]!])) })) as ({ year: number } & Record<string, number>)[];
  const pts: Pt[] = useGlidingRows(flat, keys).map((r) => {
    const parts = bands.map((b) => r[b.id] ?? 0);
    let acc = 0;
    return { year: r.year, total: r.total ?? 0, parts, edges: parts.map((v) => (acc += v)) };
  });
  const { width, height } = size;
  const plotW = width - STRIP;
  const years = goal[goal.length - 1]?.year ?? horizonYears;
  const zoom = useYearZoom({ last: Math.max(1, years), plotWidth: plotW, onHover });
  const clip = useId().replace(/:/g, "");
  const x = scaleLinear().domain(zoom.domain).range([0, plotW]);
  const maxV = Math.max(1, ...goal.filter((p) => zoom.seen(p.year)).map((p) => Math.max(p.total, p.edges[p.edges.length - 1] ?? 0)));
  const yGoal = scaleLinear().domain([0, maxV]).nice(4);
  const top = useGlidingNumbers([yGoal.domain()[1]!])[0]!;
  const y = scaleLinear().domain([0, top]).range([height - BOTTOM, TOP]);
  const ticks = ticksOn(useFadingTicks(yGoal.ticks(4)), y, y.range());
  const yearTicks = useFadingTicks(yearTicksIn(zoom.settled[0], zoom.settled[1]));
  const endX = Math.min(plotW, x(years));
  const endSeen = zoom.settled[1] >= years;
  const bandArea = (i: number) =>
    area<Pt>()
      .x((d) => x(d.year))
      .y0((d) => y(i === 0 ? 0 : d.edges[i - 1]!))
      .y1((d) => y(d.edges[i]!));
  const totalLine = d3line<Pt>().x((d) => x(d.year)).y((d) => y(d.total));
  // the last point in view: zoomed in, the labels read there, beside their bands
  const last = [...goal].reverse().find((p) => p.year <= zoom.settled[1]) ?? goal[goal.length - 1];
  const lastDrawn = [...pts].reverse().find((p) => p.year <= zoom.settled[1]) ?? pts[pts.length - 1];

  // Labels at the right end: each band's name over its horizon cost, the total at the top, pushed apart by the label height.
  const labels: { id: string; name: string; value: number; y: number; band?: Band }[] = [];
  if (last) {
    bands.forEach((b, i) => labels.push({ id: b.id, name: r3fees.chart.short[b.id] ?? b.name, value: last.parts[i]!, y: y(((lastDrawn?.edges[i] ?? 0) + (lastDrawn?.edges[i - 1] ?? 0)) / 2), band: b }));
    // audit A79: when one band is the whole total, the second label would repeat it; the band's own label stays
    if (!labels.some((l) => Math.abs(l.value - last.total) < 0.005)) labels.push({ id: "total", name: r3fees.chart.total, value: last.total, y: y(lastDrawn?.total ?? 0) });
  }
  labels.sort((a, b) => a.y - b.y);
  const placed: typeof labels = [];
  for (const l of labels) placed.push({ ...l, y: Math.max(l.y, (placed[placed.length - 1]?.y ?? -Infinity) + LABEL_H) });
  const over = (placed[placed.length - 1]?.y ?? 0) + LABEL_H / 2 - (height - BOTTOM + 8);
  if (over > 0) placed.forEach((p) => (p.y -= over));
  const top0 = placed[0] ? placed[0].y - LABEL_H / 2 : 0;
  if (top0 < 0) placed.forEach((p) => (p.y -= top0));

  const hovered = hover === null ? null : pts.find((p) => Math.abs(p.year - hover) < 1e-6) ?? null;
  const run = { rules: an.fm.run.rules, flags: an.fm.run.flags, labels: an.fm.run.labels };
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
        aria-label={`${r3fees.chart.aria[0]}${an.lines.length}${r3fees.chart.aria[1]}${fmt.years(Math.round(years))}${r3fees.chart.aria[2]}`}
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
        <g clipPath={`url(#${clip})`}>
          <g className="stroke-card" strokeWidth="1.5" strokeLinejoin="round">
            {bands.map((b, i) => (
              <path key={b.id} d={bandArea(i)(pts) ?? ""} className={cx("chart-line", b.fill, pickDim(highlight, b.id))} />
            ))}
          </g>
          <path d={totalLine(pts) ?? ""} fill="none" className={cx("stroke-chart-fee-total", pickDim(highlight, "total"))} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        </g>
        {/* after the total line, with the card-colour halo (2026-10-26) */}
        <AxisLabels ticks={ticks} y={y} />
        {endSeen && <line x1={endX} x2={endX} y1={TOP} y2={height - BOTTOM} className="stroke-chart-marker" strokeWidth="1" />}
        <YearLabels ticks={yearTicks} x={x} y={height - 8} left={0} right={plotW} word={(yr) => (yr === 0 ? guideCopy.readout.today : String(yr))} />
        {hovered && (
          <g>
            <line x1={x(hovered.year)} x2={x(hovered.year)} y1={TOP} y2={height - BOTTOM} className="stroke-chart-crosshair" strokeWidth="1" />
            <circle cx={x(hovered.year)} cy={y(hovered.total)} r="4" className="stroke-card fill-chart-fee-total" strokeWidth="2" />
          </g>
        )}
        <ZoomBrush brush={zoom.brush} top={TOP} bottom={height - BOTTOM} />
      </svg>
      {endSeen && (
        <span className="absolute top-0 text-xs text-chart-text whitespace-nowrap px-1 bg-card/80 rounded-sm" style={{ left: `${endX}px`, transform: "translateX(-100%)" }} dir="rtl">
          {r3fees.chart.endMarker}
        </span>
      )}
      {placed.map((p) => (
        <div key={p.id} className={cx("absolute text-xs leading-tight", pickDim(highlight, p.id))} style={{ left: `${plotW + 8}px`, top: `${p.y - LABEL_H / 2}px`, width: `${STRIP - 10}px`, height: `${LABEL_H}px` }}>
          <span className="line-clamp-1 font-medium">{p.name}</span>
          {/* whole shekels, as on the headline (design-system 2.7); "cell" kept the agorot */}
          <Num value={an.mk.nis(p.value, "F-61", p.name, run)} animate />
        </div>
      ))}
    </div>
    <ZoomBar zoom={zoom} yearWord={(yr) => (yr === 0 ? guideCopy.readout.today : String(yr))} />
    </div>
  );
}

export function ChartLegend({ an, pick }: { an: Analysis; pick?: ChartPick<string> }) {
  const bands = bandsOf(an);
  return (
    <Legend
      pick={pick}
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
  const run = { rules: an.fm.run.rules, flags: an.fm.run.flags, labels: an.fm.run.labels };
  const sum = p.parts.reduce((a, b) => a + b, 0);
  return (
    <Readout
      title={`${p.year === 0 ? guideCopy.readout.today : `${r3fees.chart.year} ${p.year}`}${r3fees.chart.preTax}`}
      rows={[
        ...bands.map((b, i) => ({ id: b.id, swatch: <Swatch shape="box" className={b.bg} />, label: <bdi>{b.name}</bdi>, value: <Num value={an.mk.nis(p.parts[i]!, "F-61", b.name, run)} animate /> })),
        { id: "total", swatch: <Swatch className="bg-chart-fee-total" />, label: r3fees.chart.totalPreTax, value: <Num value={an.mk.nis(p.total, "F-61", r3fees.chart.totalPreTax, run)} animate /> },
        { id: "remainder", label: r3fees.chart.remainderLegend.split(":")[0], value: <Num value={an.mk.nis(p.total - sum, "F-61", r3fees.chart.remainderLegend, run)} animate /> },
      ]}
    />
  );
}

export function ChartTable({ an }: { an: Analysis }) {
  const bands = bandsOf(an);
  const rows = points(an, bands);
  const run = { rules: an.fm.run.rules, flags: an.fm.run.flags, labels: an.fm.run.labels };
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
