// Results across one assumption (2026-10-29, the index page's "hedged or not, across the dollar"): the assumption runs left to right,
// the value axis sits at the plot's left edge and each line or band is labelled directly at the right. A band is a range a figure rests
// on (a hedged fund's cheapest and dearest year); a shade marks a stretch of the axis (what happened in the past), with its words above
// it (its words above the chart); a crossing is a dashed rule where two results meet. Own SVG; colours come from the caller's role classes.
import { Swatch } from "./chart-parts";
import { useWidth } from "./marker";

export interface ScenarioLine {
  id: string;
  /** The direct label at the right end. */
  label: string;
  /** Role classes: a stroke for the line, a fill for its dots and label (`stroke-chart-kind-unhedged`, `fill-chart-kind-unhedged`). */
  stroke: string;
  fill: string;
  points: { x: number; y: number }[];
  dashed?: boolean;
}

export interface ScenarioBand {
  id: string;
  label: string;
  /** A fill class for the band, drawn faint, and a fill class for its label. */
  fill: string;
  text: string;
  low: number;
  high: number;
}

const H = 280;
const TOP = 26;
const BOTTOM = 26;
const LEFT = 70;

export function ScenarioChart({
  lines,
  bands = [],
  shade,
  crossing,
  xMin,
  xMax,
  xTicks,
  xFormat,
  yFormat,
  label,
}: {
  lines: ScenarioLine[];
  bands?: ScenarioBand[];
  /** A stretch of the axis to shade, with its words above the chart (always one line: an empty stretch keeps the words, as a note); clipped to the axis. */
  shade?: { from: number; to: number; label: string } | null;
  /** Where two results meet, with its words. */
  crossing?: { x: number; label: string } | null;
  xMin: number;
  xMax: number;
  xTicks: number[];
  xFormat: (x: number) => string;
  yFormat: (y: number) => string;
  /** What the chart shows, for a screen reader (the figures are in the text around it). */
  label: string;
}) {
  const [ref, w] = useWidth(640);
  const right = Math.min(150, Math.max(96, w * 0.2));
  const plotR = w - right;
  const ys = [...lines.flatMap((l) => l.points.map((p) => p.y)), ...bands.flatMap((b) => [b.low, b.high])];
  const raw = (Math.max(...ys) - Math.min(...ys)) / 4 || 1;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((v) => v >= raw)!;
  const yMin = Math.floor(Math.min(...ys) / step) * step;
  const yMax = Math.ceil(Math.max(...ys) / step) * step;
  const x = (v: number) => LEFT + ((v - xMin) / (xMax - xMin)) * (plotR - LEFT);
  const y = (v: number) => TOP + (1 - (v - yMin) / (yMax - yMin || 1)) * (H - TOP - BOTTOM);
  const grid = Array.from({ length: Math.round((yMax - yMin) / step) + 1 }, (_, i) => yMin + i * step);
  // direct labels at the right, pushed apart where they would overlap
  const ends = [
    ...lines.map((l) => ({ id: l.id, label: l.label, cls: l.fill, y: y(l.points[l.points.length - 1]!.y) })),
    ...bands.map((b) => ({ id: b.id, label: b.label, cls: b.text, y: y((b.low + b.high) / 2) })),
  ].sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) if (ends[i]!.y - ends[i - 1]!.y < 16) ends[i]!.y = ends[i - 1]!.y + 16;
  // ticks at least 40 px apart: on a phone the two ends and 0
  const ticks = (plotR - LEFT) / Math.max(1, xTicks.length - 1) >= 40 ? xTicks : xTicks.filter((t, i) => i === 0 || i === xTicks.length - 1 || t === 0);
  const sFrom = shade ? Math.max(xMin, shade.from) : 0;
  const sTo = shade ? Math.min(xMax, shade.to) : 0;
  return (
    <div ref={ref} className="select-none flex flex-col gap-1">
      {shade && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5 max-md:min-h-[2lh]">
          {shade.to > shade.from && <Swatch shape="box" className="bg-foreground/15" />}
          {shade.label}
        </p>
      )}
      <svg direction="ltr" width={w} height={H} role="img" aria-label={label} className="block">
        {grid.map((v) => (
          <g key={v}>
            <line x1={LEFT} x2={plotR} y1={y(v)} y2={y(v)} className="stroke-chart-grid" strokeWidth={1} />
            <text x={LEFT - 8} y={y(v) + 4} textAnchor="end" className="fill-chart-text text-[11px] tabular-nums">
              {yFormat(v)}
            </text>
          </g>
        ))}
        {shade && sTo > sFrom && (
          <g>
            <rect x={x(sFrom)} y={TOP - 4} width={x(sTo) - x(sFrom)} height={H - TOP - BOTTOM + 4} className="fill-foreground" opacity={0.06} />
          </g>
        )}
        {bands.map((b) => (
          <rect key={b.id} x={LEFT} y={y(b.high)} width={plotR - LEFT} height={Math.max(2, y(b.low) - y(b.high))} className={b.fill} opacity={0.22} />
        ))}
        {lines.map((l) => (
          <g key={l.id}>
            <path d={l.points.map((p, i) => `${i ? "L" : "M"}${x(p.x).toFixed(1)} ${y(p.y).toFixed(1)}`).join("")} fill="none" className={l.stroke} strokeWidth={2.5} strokeDasharray={l.dashed ? "7 5" : undefined} />
            {!l.dashed && l.points.map((p) => <circle key={p.x} cx={x(p.x)} cy={y(p.y)} r={3.5} className={l.fill} />)}
          </g>
        ))}
        {crossing && crossing.x >= xMin && crossing.x <= xMax && (
          <g>
            <line x1={x(crossing.x)} x2={x(crossing.x)} y1={TOP} y2={H - BOTTOM} className="stroke-chart-crosshair" strokeDasharray="3 3" />
            <text x={x(crossing.x) + 6} y={TOP + 12} className="fill-foreground text-[11px] tabular-nums">
              {crossing.label}
            </text>
          </g>
        )}
        {ticks.map((t) => (
          <text key={t} x={x(t)} y={H - BOTTOM + 17} textAnchor="middle" className="fill-chart-text text-[11px] tabular-nums">
            {xFormat(t)}
          </text>
        ))}
        {ends.map((e) => (
          // right-to-left text anchored at its start: its right edge sits at x
          <text key={e.id} x={w - 4} y={e.y + 4} textAnchor="start" direction="rtl" className={`${e.cls} text-xs font-semibold`}>
            {e.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
