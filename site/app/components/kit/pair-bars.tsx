// Two bars for each year, from zero (2026-10-31, the index page: what each kind of fund did in the same years): years left to right, the
// value axis at the left edge, each bar's figure at its end. Own SVG. The two hues are the caller's, with a legend beside the chart. Each
// bar already has its figure and the years are few, so no zoom: pointing at or tapping a year sets it apart and names its two bars (issue 22).
import { ChartTip, pickDim, useChartPick } from "./chart-interact";
import { useWidth } from "./marker";

const H = 250;
const TOP = 18;
const BOTTOM = 24;
const LEFT = 34;

export interface PairBarYear {
  year: number;
  a: number;
  b: number;
}

export function PairBars({ items, format, tickStep, label, fillA, fillB, nameA, nameB, highlight }: { items: PairBarYear[]; format: (v: number) => string; tickStep: number; label: string; fillA: string; fillB: string; nameA: string; nameB: string; /** The series set apart by the legend. */ highlight?: "a" | "b" | null }) {
  const [ref, w] = useWidth(420);
  const pick = useChartPick<number>();
  const values = items.flatMap((i) => [i.a, i.b]);
  const top = Math.ceil(Math.max(tickStep, ...values) / tickStep) * tickStep;
  const bottom = Math.ceil(Math.max(0, ...values.map((v) => -v)) / tickStep) * tickStep;
  const y = (v: number) => TOP + ((top - v) / (top + bottom)) * (H - TOP - BOTTOM);
  const step = (w - LEFT - 4) / Math.max(1, items.length);
  const bw = Math.min(step * 0.3, 34);
  const ticks = Array.from({ length: (top + bottom) / tickStep + 1 }, (_, i) => -bottom + i * tickStep);
  const bar = (x: number, v: number, fill: string, id: "a" | "b") => (
    <g className={pickDim(highlight, id)}>
      <rect x={x} y={Math.min(y(0), y(v))} width={bw} height={Math.max(1, Math.abs(y(v) - y(0)))} rx={3} className={fill} />
      <text x={x + bw / 2} y={v >= 0 ? y(v) - 5 : y(v) + 13} textAnchor="middle" className="fill-foreground text-[11px] font-semibold tabular-nums">
        {format(v)}
      </text>
    </g>
  );
  const at = items.findIndex((i) => i.year === pick.active);
  const read = items[at];
  return (
    <div ref={ref} dir="ltr" className="relative select-none">
      <svg width={w} height={H} role="img" aria-label={label} className="block">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={LEFT} x2={w - 4} y1={y(t)} y2={y(t)} className={t === 0 ? "stroke-chart-axis" : "stroke-chart-grid"} strokeWidth={1} />
            <text x={LEFT - 6} y={y(t) + 4} textAnchor="end" className="fill-chart-text text-[11px] tabular-nums">
              {format(t)}
            </text>
          </g>
        ))}
        {items.map((it, i) => {
          const cx = LEFT + i * step + step / 2;
          return (
            <g key={it.year} {...pick.bind(it.year)} className={pickDim(pick.active === null ? null : String(pick.active), String(it.year))} cursor="pointer">
              <rect x={cx - step / 2} y={0} width={step} height={H} fill="transparent" />
              {bar(cx - bw - 2, it.a, fillA, "a")}
              {bar(cx + 2, it.b, fillB, "b")}
              <text x={cx} y={H - 6} textAnchor="middle" className="fill-chart-text text-[11px] tabular-nums">
                {it.year}
              </text>
            </g>
          );
        })}
      </svg>
      {read && (
        <ChartTip x={LEFT + at * step + step / 2} width={w}>
          <span className="block font-medium">
            <bdi dir="ltr">{read.year}</bdi>
          </span>
          <span className="block">
            <bdi>{nameA}</bdi>: <bdi dir="ltr">{format(read.a)}</bdi>
          </span>
          <span className="block">
            <bdi>{nameB}</bdi>: <bdi dir="ltr">{format(read.b)}</bdi>
          </span>
        </ChartTip>
      )}
    </div>
  );
}
