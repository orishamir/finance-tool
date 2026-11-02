// The money's story (founder, 2026-11-02, the study fund): one strip of every year, and under it the year picked, step by step. Each column of
// the story is the whole pile so far: what this step adds is bright and what was there already is dim, with a dashed line from each column's top
// to the next. Tax is hatched over the part it takes; the last column is what is left. Names and numbers are written on the chart, in the
// fixed rows of `docs/design-system.md` 2.5a, so only the bars and the figures change. Own SVG; the numbers are HTML, so they go through `Num`.
import { useId, type ReactNode } from "react";
import { useGlidingNumbers } from "./chart-glide";
import { cx } from "./cx";
import { LaneLabel, Marker, useWidth } from "./marker";

export interface PileSlice {
  own: number;
  /** What another hand added: an employer, or a tax refund. */
  extra: number;
  /** Below zero when the fees took more than the return did. */
  gain: number;
  tax: number;
  net: number;
}

export type PileStep = "own" | "extra" | "gain" | "tax" | "left";

const top = (s: PileSlice) => s.own + s.extra + s.gain;
/** The tallest moment of a slice: a loss brings the pile below what was put in. */
const tallest = (s: PileSlice) => Math.max(top(s), s.own + s.extra);
/** The parts of the pile up to `to`, bottom first. */
const parts = (s: PileSlice) => {
  const g = top(s);
  return [
    { key: "own" as const, from: 0, to: Math.min(s.own, g) },
    { key: "extra" as const, from: Math.min(s.own, g), to: Math.min(s.own + s.extra, g) },
    { key: "gain" as const, from: s.own + s.extra, to: g },
  ].filter((p) => p.to - p.from > 0);
};
const FILL = { own: "fill-chart-pile-own", extra: "fill-chart-pile-extra", gain: "fill-chart-pile-gain" };
const flat = (s: PileSlice | null) => (s ? [s.own, s.extra, s.gain, s.tax, s.net] : [0, 0, 0, 0, 0]);
const sliceAt = (v: readonly number[], i: number): PileSlice => ({ own: v[i]!, extra: v[i + 1]!, gain: v[i + 2]!, tax: v[i + 3]!, net: v[i + 4]! });

/** The share of the tallest column the first number stands above, over all the years: it keeps its row while the year changes. */
export function pileFirstRow(years: readonly (PileSlice | null)[]): number {
  let row = 0;
  for (const s of years) if (s && tallest(s) > 0) row = Math.max(row, s.own / tallest(s));
  return Math.min(1, row);
}

function Hatch({ id, gap }: { id: string; gap: number }) {
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width={gap} height={gap} patternTransform="rotate(45)">
      <rect width={gap} height={gap} className="fill-chart-pile-veil" />
      <line x1={0} y1={0} x2={0} y2={gap} className="stroke-chart-pile-tax" strokeWidth={1.8} />
    </pattern>
  );
}

const STRIP_H = 156;
const STRIP_TOP = 24;
const STRIP_BASE = STRIP_H - 28;

/** One column a year in the colours of the story, the hatch on what tax takes. A year with no figure is a dashed stub. Tapping or dragging picks the year. */
export function PileYears({
  years,
  year,
  onYear,
  lockYear,
  before,
  after,
  label,
  valueText,
}: {
  years: readonly (PileSlice | null)[];
  year: number;
  onYear: (y: number) => void;
  /** The first year out of the lock: the dashed line stands before it. */
  lockYear: number;
  before: ReactNode;
  after: ReactNode;
  label: string;
  valueText: string;
}) {
  const [ref, W] = useWidth(720);
  const pid = useId().replace(/:/g, "");
  const shown = useGlidingNumbers(years.flatMap(flat));
  const n = years.length;
  const band = W / n;
  const barW = Math.min(band - 4, 40);
  const slices = years.map((s, i) => (s ? sliceAt(shown, i * 5) : null));
  const max = Math.max(1, ...slices.map((s) => (s ? tallest(s) : 0)));
  const y = (v: number) => STRIP_BASE - (v / max) * (STRIP_BASE - STRIP_TOP);
  const lockX = (lockYear - 1) * band;
  return (
    <div ref={ref} className="relative w-full" dir="ltr" style={{ height: STRIP_H }}>
      <svg width={W} height={STRIP_H} viewBox={`0 0 ${W} ${STRIP_H}`} role="img" aria-label={label} className="block select-none">
        <defs>
          <Hatch id={pid} gap={4} />
        </defs>
        <line x1={lockX} x2={lockX} y1={2} y2={STRIP_BASE + 4} className="stroke-chart-marker" strokeDasharray="3 3" />
        <line x1={0} x2={W} y1={STRIP_BASE} y2={STRIP_BASE} className="stroke-chart-axis" />
        {slices.map((s, i) => {
          const x = (i + 0.5) * band - barW / 2;
          const on = i + 1 === year;
          if (!s) return <rect key={i} x={x} y={STRIP_BASE - 8} width={barW} height={8} className="fill-none stroke-chart-axis" strokeDasharray="2 2" />;
          const g = top(s);
          return (
            <g key={i}>
              <g opacity={on ? 1 : 0.86}>
                {parts(s).map((p) => (
                  <rect key={p.key} x={x} y={y(p.to)} width={barW} height={Math.max(0.5, y(p.from) - y(p.to) - 1)} className={FILL[p.key]} />
                ))}
                {s.tax > 1 && <rect x={x} y={y(g)} width={barW} height={Math.max(0, y(g - s.tax) - y(g))} fill={`url(#${pid})`} className="stroke-chart-pile-tax" strokeWidth={1} />}
              </g>
              {on && <rect x={x - 2.5} y={y(tallest(s)) - 2.5} width={barW + 5} height={STRIP_BASE - y(tallest(s)) + 2.5} rx={2} className="fill-none stroke-foreground" strokeWidth={1.5} />}
            </g>
          );
        })}
        {years.map((_, i) => (
          <text key={i} x={(i + 0.5) * band} y={STRIP_BASE + 18} textAnchor="middle" className={cx("text-xs", i + 1 === year ? "fill-foreground font-semibold" : "fill-chart-text")} data-scale>
            {i + 1}
          </text>
        ))}
        <circle cx={(year - 0.5) * band} cy={STRIP_BASE + 13} r={12} className="fill-none stroke-primary" strokeWidth={2} />
      </svg>
      <LaneLabel from={0} to={lockX} top={0} prefer="center">
        {before}
      </LaneLabel>
      <LaneLabel from={lockX} to={W} top={0} prefer="center">
        {after}
      </LaneLabel>
      <Marker min={1} max={n} step={1} bands value={year} onChange={onYear} label={label} valueText={valueText} left={0} top={20} width={W} height={STRIP_H - 20} />
    </div>
  );
}

const COLUMNS: PileStep[] = ["own", "extra", "gain", "tax", "left"];

/**
 * The year picked, step by step, from left to right. `other` is a sixth slot beside the story, a dashed outline of what the same money would do
 * elsewhere, only where that is a choice the person really has. `gap` takes the columns' place when the year has no figure.
 */
export function PileStory({
  slice,
  names,
  fine,
  number,
  firstRow,
  other,
  gap,
  label,
}: {
  slice: PileSlice | null;
  /** The words under each column, one entry a line. */
  names: Record<PileStep, readonly string[]>;
  /** A smaller line under a column's words. */
  fine?: Partial<Record<PileStep, string>>;
  /** A column's figure; `compact` when the chart is phone-wide and has no room for the shekel sign. */
  number: (step: PileStep, compact: boolean) => ReactNode;
  /** `pileFirstRow` of all the years. */
  firstRow: number;
  other?: { to: number | null; names: readonly string[]; fine?: string; number: (compact: boolean) => ReactNode };
  gap?: ReactNode;
  label: string;
}) {
  const [ref, W] = useWidth(720);
  const pid = useId().replace(/:/g, "");
  const compact = W < 520;
  // a sixth column on a phone is narrow: its words take more lines
  const nameH = compact ? (other ? 94 : 78) : 58;
  const H = compact ? 288 + nameH : 400;
  const plotTop = compact ? 46 : 30;
  const base = H - nameH;
  const room = base - plotTop;
  const slots = other ? 6 : 5;
  const slotGap = other ? (compact ? 6 : 16) : 0;
  const band = (W - slotGap) / slots;
  const bw = Math.min(band - (compact ? 7 : 22), 96);
  const shown = useGlidingNumbers([...flat(slice), other?.to ?? 0, firstRow]);
  const s = sliceAt(shown, 0);
  const otherTo = shown[5]!;
  const row = shown[6]!;
  const biggest = Math.max(slice ? tallest(s) : 0, otherTo) || 1;
  const scale = (room / biggest) * (slice ? 1 : 0.6);
  const y = (v: number) => base - v * scale;
  const cx5 = (i: number) => (i < 5 ? (i + 0.5) * band : 5 * band + slotGap + 0.5 * band);
  const g = top(s);
  const tops = [s.own, s.own + s.extra, g, s.net];
  const rowY = plotTop - 26;
  const numberY = (i: number) => (i === 0 ? Math.max(rowY, base - row * room * (slice ? 1 : 0.6) - 24) : rowY - (compact && i % 2 === 0 ? 16 : 0));
  const rect = (key: string, from: number, to: number, cls: string, x: number, op = 1) => <rect key={key} x={x} y={y(to)} width={bw} height={Math.max(1, y(from) - y(to) - 1.5)} rx={1.5} className={cls} opacity={op} />;
  const dim = 0.36;
  const Words = ({ i, lines, small, strong }: { i: number; lines: readonly string[]; small?: string; strong?: boolean }) => (
    <div className="absolute text-center" dir="rtl" style={{ left: cx5(i) - band / 2, width: band, top: base + 5 }}>
      <div className={cx("leading-tight", compact ? "text-xs" : "text-sm", strong && "font-semibold")}>
        {lines.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
      {small && <div className="text-xs leading-tight text-muted-foreground mt-0.5">{small}</div>}
    </div>
  );
  return (
    <div ref={ref} className="relative w-full" dir="ltr" style={{ height: H }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="block select-none">
        <defs>
          <Hatch id={pid} gap={5} />
        </defs>
        <line x1={0} x2={W} y1={base} y2={base} className="stroke-chart-axis" />
        {slice &&
          COLUMNS.map((c, i) => {
            const x = cx5(i) - bw / 2;
            const full = parts(s);
            const only = (k: "own" | "extra") => full.filter((p) => p.key === k);
            return (
              <g key={c}>
                {c === "own" && only("own").map((p) => rect(p.key, p.from, p.to, FILL.own, x))}
                {c === "extra" && (
                  <>
                    {only("own").map((p) => rect(p.key, p.from, p.to, FILL.own, x, dim))}
                    {only("extra").map((p) => rect(p.key, p.from, p.to, FILL.extra, x))}
                  </>
                )}
                {c === "gain" && (
                  <>
                    {full.map((p) => rect(p.key, p.from, p.to, FILL[p.key], x, p.key === "gain" ? 1 : dim))}
                    {s.gain < 0 && <rect x={x} y={y(s.own + s.extra)} width={bw} height={Math.max(1, y(g) - y(s.own + s.extra))} className="fill-none stroke-chart-pile-gain" strokeWidth={1.4} strokeDasharray="4 3" />}
                  </>
                )}
                {c === "tax" && (
                  <>
                    {full.map((p) => rect(p.key, p.from, p.to, FILL[p.key], x, dim))}
                    {s.tax > 1 && <rect x={x} y={y(g)} width={bw} height={Math.max(0, y(g - s.tax) - y(g))} fill={`url(#${pid})`} className="stroke-chart-pile-tax" strokeWidth={1.2} />}
                  </>
                )}
                {c === "left" && <rect x={x} y={y(s.net)} width={bw} height={Math.max(0, base - y(s.net))} rx={2} className="fill-chart-pile-left" />}
                {i < 4 && <line x1={x + bw} x2={cx5(i + 1) - bw / 2} y1={y(tops[i]!)} y2={y(tops[i]!)} className="stroke-chart-pile-own" strokeDasharray="3 3" />}
              </g>
            );
          })}
        {other && (
          <>
            <line x1={5 * band + slotGap / 2} x2={5 * band + slotGap / 2} y1={Math.max(0, plotTop - 22)} y2={H - 4} className="stroke-chart-axis" strokeDasharray="1.5 3" />
            {other.to !== null && otherTo > 0 && <rect x={cx5(5) - bw / 2} y={y(otherTo)} width={bw} height={Math.max(0, base - y(otherTo))} rx={2} className="fill-chart-pile-left/10 stroke-chart-pile-left" strokeWidth={1.4} strokeDasharray="5 4" />}
          </>
        )}
      </svg>
      {slice &&
        COLUMNS.map((c, i) => (
          <div key={c}>
            <span className={cx("absolute -translate-x-1/2 whitespace-nowrap leading-4", compact ? "text-xs" : "text-sm", c === "left" ? "font-bold" : "font-semibold")} style={{ left: cx5(i), top: numberY(i) }}>
              {number(c, compact)}
            </span>
            <Words i={i} lines={names[c]} {...(fine?.[c] ? { small: fine[c]! } : {})} strong={c === "left"} />
          </div>
        ))}
      {!slice && gap && (
        <div className="absolute text-sm text-caution" dir="rtl" style={{ left: 8, width: 5 * band - 16, top: plotTop }}>
          {gap}
        </div>
      )}
      {other && (
        <>
          {other.to !== null && (
            <span className={cx("absolute -translate-x-1/2 whitespace-nowrap leading-4 font-semibold", compact ? "text-xs" : "text-sm")} style={{ left: cx5(5), top: rowY }}>
              {other.number(compact)}
            </span>
          )}
          <Words i={5} lines={other.names} {...(other.fine ? { small: other.fine } : {})} />
        </>
      )}
    </div>
  );
}
