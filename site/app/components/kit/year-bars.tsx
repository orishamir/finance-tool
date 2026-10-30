// A value for each year as a bar from zero (2026-10-29, the index page: the dollar's change against the shekel each year): years left to
// right, the value axis at the left edge, each bar's figure at its end. One neutral hue: the bars are one series. Own SVG.
import { useWidth } from "./marker";

const H = 220;
const TOP = 16;
const BOTTOM = 22;
const LEFT = 40;

export function YearBars({ items, format, tickStep, label }: { items: { year: number; value: number }[]; format: (v: number) => string; tickStep: number; label: string }) {
  const [ref, w] = useWidth(420);
  const max = Math.max(tickStep, ...items.map((i) => Math.abs(i.value)));
  const top = Math.ceil(max / tickStep) * tickStep;
  const y = (v: number) => TOP + ((top - v) / (2 * top)) * (H - TOP - BOTTOM);
  const bw = (w - LEFT - 4) / Math.max(1, items.length);
  const ticks = Array.from({ length: (2 * top) / tickStep + 1 }, (_, i) => -top + i * tickStep);
  // year labels at least 34 px apart (every second or fifth year on a phone); a bar keeps its figure when there is room for it
  const every = [1, 2, 5, 10].find((n) => n * bw >= 34) ?? 10;
  return (
    <div ref={ref} dir="ltr" className="select-none">
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
          const x = LEFT + i * bw + bw * 0.15;
          const bwi = bw * 0.7;
          const y0 = y(0);
          const y1 = y(it.value);
          return (
            <g key={it.year}>
              <rect x={x} y={Math.min(y0, y1)} width={bwi} height={Math.max(1, Math.abs(y1 - y0))} rx={2} className="fill-chart-baseline" opacity={0.8} />
              {bw >= 22 && (
                <text x={x + bwi / 2} y={it.value >= 0 ? y1 - 4 : y1 + 12} textAnchor="middle" className="fill-foreground text-[10px] tabular-nums">
                  {format(it.value)}
                </text>
              )}
              {(it.year % every === 0) && (
                <text x={x + bwi / 2} y={H - 6} textAnchor="middle" className="fill-chart-text text-[11px] tabular-nums">
                  {it.year}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
