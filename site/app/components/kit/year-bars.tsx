// A value for each year as a bar from zero (2026-10-29, the index page: the dollar's change against the shekel each year): years left to
// right, the value axis at the left edge, each bar's figure at its end. One neutral hue: the bars are one series. Own SVG. Pointing at or
// tapping a year reads it; on a computer a drag zooms to the years it covers, and a zoomed bar has room for its figure (issue 22).
import { useId, useState } from "react";
import { tickFade, ticksOn, useFadingTicks, useGlidingNumbers, useGlidingRows } from "./chart-glide";
import { ChartTip, ZoomBar, ZoomBrush, useYearZoom } from "./chart-interact";
import { useWidth } from "./marker";

const H = 220;
const TOP = 16;
const BOTTOM = 22;
const LEFT = 40;

const VALUE = ["value"] as const;

export function YearBars({ items: goal, format, tickStep, label, bright }: { items: { year: number; value: number }[]; format: (v: number) => string; tickStep: number; label: string; /** The years to set apart: these are bright with their figure, the rest dim without one. */ bright?: readonly number[] }) {
  const [ref, w] = useWidth(420);
  const [hover, setHover] = useState<number | null>(null);
  const items = useGlidingRows(goal, VALUE);
  const plotW = w - LEFT - 4;
  const zoom = useYearZoom({ first: goal[0]?.year ?? 0, last: goal[goal.length - 1]?.year ?? 0, plotLeft: LEFT, plotWidth: plotW, band: true, onHover: setHover });
  const clip = useId().replace(/:/g, "");
  const [from, to] = zoom.domain;
  const inView = items.filter((i) => zoom.has(i.year));
  const max = Math.max(tickStep, ...goal.filter((i) => zoom.seen(i.year)).map((i) => Math.abs(i.value)));
  const topGoal = Math.ceil(max / tickStep) * tickStep;
  const top = useGlidingNumbers([topGoal])[0]!;
  const y = (v: number) => TOP + ((top - v) / (2 * top)) * (H - TOP - BOTTOM);
  const bw = plotW / Math.max(1, to - from);
  const ticks = ticksOn(useFadingTicks(Array.from({ length: (2 * topGoal) / tickStep + 1 }, (_, i) => -topGoal + i * tickStep)), y, [TOP, H - BOTTOM]);
  // year labels at least 34 px apart (every second or fifth year on a phone); a bar keeps its figure when there is room for it
  const every = [1, 2, 5, 10].find((n) => n * bw >= 34) ?? 10;
  // among the bright years, only the highest and lowest carry a figure: the bars are too narrow for more
  const shown = items.filter((i) => bright?.includes(i.year));
  const extreme = { lo: shown.reduce((a, i) => (i.value < (a?.value ?? Infinity) ? i : a), shown[0])?.year, hi: shown.reduce((a, i) => (i.value > (a?.value ?? -Infinity) ? i : a), shown[0])?.year };
  const barX = (year: number) => LEFT + (year - from) * bw - bw / 2 + bw * 0.15;
  const read = hover === null ? null : items.find((i) => i.year === hover);
  return (
    <div className="flex flex-col gap-1">
      <div ref={ref} dir="ltr" className="relative select-none">
        <svg ref={zoom.svgRef} {...zoom.handlers} width={w} height={H} role="img" aria-label={label} className="block touch-pan-y overflow-visible">
          <defs>
            <clipPath id={clip}>
              <rect x={LEFT} y={0} width={plotW} height={H} />
            </clipPath>
          </defs>
          {ticks.map((t) => (
            <g key={t.value} className={tickFade(t)}>
              <line x1={LEFT} x2={w - 4} y1={y(t.value)} y2={y(t.value)} className={t.value === 0 ? "stroke-chart-axis" : "stroke-chart-grid"} strokeWidth={1} />
              <text x={LEFT - 6} y={y(t.value) + 4} textAnchor="end" className="fill-chart-text text-[11px] tabular-nums">
                {format(t.value)}
              </text>
            </g>
          ))}
          <g clipPath={`url(#${clip})`}>
            {inView.map((it) => {
              const y0 = y(0);
              const y1 = y(it.value);
              const on = !!bright?.includes(it.year);
              const lit = hover === it.year;
              return <rect key={it.year} x={barX(it.year)} y={Math.min(y0, y1)} width={bw * 0.7} height={Math.max(1, Math.abs(y1 - y0))} rx={2} className={on || lit ? "fill-foreground" : "fill-chart-baseline"} opacity={lit || (on && hover === null) ? 1 : hover !== null ? 0.45 : bright ? 0.6 : 0.8} />;
            })}
          </g>
          {/* the words stand outside the clip: only the bars slide past the plot's edge on the way to a new view */}
          {inView
            .filter((it) => it.year >= zoom.settled[0] && it.year <= zoom.settled[1])
            .map((it) => {
              const mid = barX(it.year) + bw * 0.35;
              const y1 = y(it.value);
              const on = !!bright?.includes(it.year);
              return (
                <g key={it.year}>
                  {(zoom.view || !bright ? bw >= 22 : on && (it.year === extreme.lo || it.year === extreme.hi)) && (
                    <text x={mid} y={it.value >= 0 ? y1 - 4 : y1 + 12} textAnchor="middle" className="fill-foreground text-[10px] tabular-nums">
                      {format(it.value)}
                    </text>
                  )}
                  {it.year % every === 0 && (
                    <text x={mid} y={H - 6} textAnchor="middle" className="fill-chart-text text-[11px] tabular-nums">
                      {it.year}
                    </text>
                  )}
                </g>
              );
            })}
          <ZoomBrush brush={zoom.brush} left={LEFT} top={TOP} bottom={H - BOTTOM} />
        </svg>
        {read && !zoom.brush && (
          <ChartTip x={barX(read.year) + bw * 0.35} width={w}>
            <bdi dir="ltr">{read.year}</bdi>: <bdi dir="ltr">{format(read.value)}</bdi>
          </ChartTip>
        )}
      </div>
      <ZoomBar zoom={zoom} />
    </div>
  );
}
