// The money's story (founder, 2026-11-02; reworked 2026-11-08 for the one choice it serves, withdraw before the lock or wait). `PileYears`
// is the main chart: a bar a year, each the money at a withdrawal after that year, its net above it, the year picked and the one it is set
// against at full strength. `PileBar` is the year picked as one bar from the left: what went in and what the return added, and cut from the
// far end what the fees and the tax took, with what is left bracketed under it. Own SVG; the bar's figures are HTML, so they go through `Num`.
import { useId, type ReactNode } from "react";
import { useGlidingNumbers } from "./chart-glide";
import { CHART_TEXT_PX, chartTextWidth } from "./chart-text";
import { ChartLegend, Swatch } from "./chart-parts";
import { cx } from "./cx";
import { LaneLabel, Marker, useWidth } from "./marker";

export interface PileSlice {
  own: number;
  /** What another hand added: an employer, or a tax refund. */
  extra: number;
  /** After fees; below zero when the fees and rising prices took more than the return gave. */
  gain: number;
  /** What the fees took; the return before them is `gain + fees`. */
  fees?: number;
  tax: number;
  /** The part of `tax` paid out of the salary along the way; the rest is paid at the withdrawal. */
  taxFromSalary?: number;
  net: number;
}

/** The pile after the fees, before tax. */
const top = (s: PileSlice) => s.own + s.extra + s.gain;
/** The pile before the fees. */
const gross = (s: PileSlice) => top(s) + (s.fees ?? 0);
/** The tallest moment of a slice: a loss brings the pile below what was put in. */
const tallest = (s: PileSlice) => Math.max(gross(s), s.own + s.extra);
const FILL = { own: "fill-chart-pile-own", extra: "fill-chart-pile-extra", gain: "fill-chart-pile-gain" } as const;
/** The parts of the pile up to `upTo`, bottom first. */
const parts = (s: PileSlice, upTo: number) =>
  [
    { key: "own" as const, from: 0, to: Math.min(s.own, upTo) },
    { key: "extra" as const, from: Math.min(s.own, upTo), to: Math.min(s.own + s.extra, upTo) },
    { key: "gain" as const, from: s.own + s.extra, to: Math.min(gross(s), upTo) },
  ]
    .filter((p) => p.to - p.from > 0)
    .map((p) => ({ ...p, cls: FILL[p.key] }));
/** What is taken from the top of a year's column down: the fees, what was paid out of the salary along the way, then the withdrawal's tax. */
const taken = (s: PileSlice) => {
  const a = top(s);
  const paid = Math.min(s.taxFromSalary ?? 0, s.tax);
  return [
    { key: "fees", from: a, to: gross(s), cls: "fill-chart-pile-fee" },
    { key: "salary", from: a - paid, to: a, cls: "fill-chart-pile-salary-tax" },
    { key: "tax", from: a - s.tax, to: a - paid, cls: "fill-chart-pile-tax" },
  ].filter((p) => p.to - p.from > 1);
};
const flat = (s: PileSlice | null) => (s ? [s.own, s.extra, s.gain, s.tax, s.taxFromSalary ?? 0, s.net, s.fees ?? 0] : [0, 0, 0, 0, 0, 0, 0]);
const FLAT = 7;
const sliceAt = (v: readonly number[], i: number): PileSlice => ({ own: v[i]!, extra: v[i + 1]!, gain: v[i + 2]!, tax: v[i + 3]!, taxFromSalary: v[i + 4]!, net: v[i + 5]!, fees: v[i + 6]! });

const LANE_H = 26;
/** The note's room above the columns: two lines on a PC, three on a phone, where it may wrap. */
const NOTE_H = 48;
const NOTE_H_PHONE = 62;
const AMOUNT_H = 22;

/**
 * The years as the main chart: one column a year in the colours of the story, what the fees and tax take on top, the net written above it
 * (`amount`, its unit named along the value axis, `valueAxis`). The year picked and `compare` are at full strength, the rest dim. When the 12 amounts
 * do not fit side by side, only the year picked, `compare` and the two ends carry theirs; tapping a year shows its own. `note` points at
 * `compare`'s column from a row kept for it. A year with no figure is a dashed stub. Tapping, dragging or the arrow keys pick the year.
 */
export function PileYears({
  years,
  year,
  onYear,
  lockYear,
  compare,
  before,
  after,
  axis,
  valueAxis,
  note,
  amount,
  label,
  valueText,
}: {
  years: readonly (PileSlice | null)[];
  year: number;
  onYear: (y: number) => void;
  /** The first year out of the lock: the dashed line stands before it. */
  lockYear: number;
  /** The year the picked one is set against, or null. */
  compare: number | null;
  before: ReactNode;
  after: ReactNode;
  /** The years' axis name, under them. */
  axis: string;
  /** What the amounts are, written up the value axis at the chart's left (founder, 2026-11-08). */
  valueAxis?: string;
  /** Words pointing at `compare`'s column. */
  note?: ReactNode;
  /** A year's net as written above its column; `picked` for the year picked. */
  amount: (net: number, picked: boolean) => string;
  label: string;
  valueText: string;
}) {
  const [ref, W] = useWidth(720);
  const phone = W < 520;
  const noteH = phone ? NOTE_H_PHONE : NOTE_H;
  const shown = useGlidingNumbers(years.flatMap(flat));
  const n = years.length;
  // room at the left for the value axis' name, written upward
  const X0 = valueAxis ? 20 : 0;
  const band = (W - X0) / n;
  const barW = Math.min(band - (phone ? 5 : 10), 48);
  const plotTop = LANE_H + noteH + AMOUNT_H;
  const plotH = phone ? 150 : 210;
  const base = plotTop + plotH;
  const H = base + 54;
  const slices = years.map((s, i) => (s ? sliceAt(shown, i * FLAT) : null));
  const max = Math.max(1, ...slices.map((s) => (s ? tallest(s) : 0)));
  const y = (v: number) => base - (v / max) * plotH;
  const lockX = X0 + (lockYear - 1) * band;
  const cxOf = (yr: number) => X0 + (yr - 0.5) * band;
  const strong = (yr: number) => yr === year || yr === compare;
  // the amounts above the columns: every year's when they fit side by side, else the year picked, `compare` and the two ends
  const texts = years.map((s, i) => (s ? amount(s.net, i + 1 === year) : ""));
  const widths = texts.map((t, i) => chartTextWidth(t) * (i + 1 === year ? 1.06 : 1));
  const rawY = (yr: number) => y(tallest(slices[yr - 1]!)) - (yr === year ? 9 : 6);
  const meet = (a: number, b: number) => (widths[a - 1]! + widths[b - 1]!) / 2 + 4 > Math.abs(a - b) * band && Math.abs(rawY(a) - rawY(b)) < CHART_TEXT_PX + 3;
  // the year picked and `compare` both keep their amounts: when they would meet, `compare`'s stands a line higher
  const lift = compare !== null && slices[compare - 1] && slices[year - 1] && meet(year, compare);
  const labelY = (yr: number) => (lift && yr === compare ? Math.min(rawY(yr), rawY(year) - CHART_TEXT_PX - 3) : rawY(yr));
  // two neighbours clash when their words overlap sideways and stand within a line of each other
  const clashes = (a: number, b: number) => (widths[a - 1]! + widths[b - 1]!) / 2 + 4 > Math.abs(a - b) * band && Math.abs(labelY(a) - labelY(b)) < CHART_TEXT_PX + 3;
  const clashing = (shownYears: number[]) => shownYears.flatMap((a, k) => (k > 0 && clashes(shownYears[k - 1]!, a) ? [shownYears[k - 1]!, a] : []));
  const all = years.map((_, i) => i + 1).filter((yr) => texts[yr - 1]);
  let labelled = all;
  if (clashing(all).length) {
    const keep = [year, ...(compare ? [compare] : [])];
    labelled = [...new Set([1, n, ...keep])].filter((yr) => texts[yr - 1]).sort((a, b) => a - b);
    for (const end of [1, n]) if (!keep.includes(end) && clashing(labelled).includes(end)) labelled = labelled.filter((yr) => yr !== end);
  }
  const compareSlice = compare ? slices[compare - 1] : null;
  const noteX = compare ? cxOf(compare) : 0;
  const noteW = Math.min(300, W - 8);
  const noteLeft = Math.min(Math.max(noteX - noteW / 2, 0), W - noteW);
  return (
    <div ref={ref} className="relative w-full" dir="ltr" style={{ height: H }} data-chart>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="block select-none">
        <line x1={lockX} x2={lockX} y1={LANE_H} y2={base + 4} className="stroke-chart-marker" strokeDasharray="3 3" />
        <line x1={X0} x2={W} y1={base} y2={base} className="stroke-chart-axis" />
        {valueAxis && (
          <text transform={`translate(${X0 - 7} ${plotTop + plotH / 2}) rotate(-90)`} textAnchor="middle" direction="rtl" className="text-xs fill-chart-text">
            {valueAxis}
          </text>
        )}
        {slices.map((s, i) => {
          const yr = i + 1;
          const x = cxOf(yr) - barW / 2;
          if (!s) return <rect key={i} x={x} y={base - 8} width={barW} height={8} className="fill-none stroke-chart-axis" strokeDasharray="2 2" />;
          return (
            <g key={i}>
              <g opacity={strong(yr) ? 1 : 0.42}>
                {[...parts(s, top(s) - s.tax), ...taken(s)].map((p) => (
                  <rect key={p.key} x={x} y={y(p.to)} width={barW} height={Math.max(0.5, y(p.from) - y(p.to) - 2)} className={p.cls} />
                ))}
              </g>
              {yr === year && <rect x={x - 3} y={y(tallest(s)) - 3} width={barW + 6} height={base - y(tallest(s)) + 3} rx={2} className="fill-none stroke-foreground" strokeWidth={1.5} />}
            </g>
          );
        })}
        {labelled.map((yr) => {
          return (
            <text key={yr} x={Math.min(Math.max(cxOf(yr), X0 + widths[yr - 1]! / 2 + 1), W - widths[yr - 1]! / 2 - 1)} y={labelY(yr)} textAnchor="middle" fontSize={CHART_TEXT_PX} className={cx(yr === year ? "fill-foreground font-bold" : strong(yr) ? "fill-foreground" : "fill-chart-text")} data-scale>
              {texts[yr - 1]}
            </text>
          );
        })}
        {note && compareSlice && <line x1={noteX} x2={noteX} y1={LANE_H + noteH - 2} y2={labelY(compare!) - CHART_TEXT_PX - 2} className="stroke-chart-marker" />}
        {years.map((_, i) => (
          <text key={i} x={cxOf(i + 1)} y={base + 18} textAnchor="middle" className={cx("text-xs", i + 1 === year ? "fill-foreground font-semibold" : "fill-chart-text")} data-scale>
            {i + 1}
          </text>
        ))}
        <circle cx={cxOf(year)} cy={base + 13} r={12} className="fill-none stroke-primary" strokeWidth={2} />
      </svg>
      <LaneLabel from={0} to={lockX} top={0} prefer="center">
        {before}
      </LaneLabel>
      <LaneLabel from={lockX} to={W} top={0} prefer="center">
        {after}
      </LaneLabel>
      {note && compareSlice && (
        <div className="absolute text-xs leading-snug text-center" dir="rtl" style={{ left: noteLeft, width: noteW, top: LANE_H + 2 }}>
          {note}
        </div>
      )}
      <div className="absolute text-xs text-muted-foreground text-center" dir="rtl" style={{ left: X0, width: W - X0, top: base + 32 }}>
        {axis}
      </div>
      <Marker min={1} max={n} step={1} bands value={year} onChange={onYear} label={label} valueText={valueText} left={X0} top={LANE_H + noteH} width={W - X0} height={base + 28 - LANE_H - noteH} />
    </div>
  );
}

export type PileBarPart = "own" | "extra" | "gain" | "loss" | "fees" | "salary" | "tax";
const BAR_FILL: Record<PileBarPart, string> = {
  own: "fill-chart-pile-own",
  extra: "fill-chart-pile-extra",
  gain: "fill-chart-pile-gain",
  loss: "fill-chart-pile-loss",
  fees: "fill-chart-pile-fee",
  salary: "fill-chart-pile-salary-tax",
  tax: "fill-chart-pile-tax",
};
const SWATCH: Record<PileBarPart, string> = {
  own: "bg-chart-pile-own",
  extra: "bg-chart-pile-extra",
  gain: "bg-chart-pile-gain",
  loss: "bg-chart-pile-loss",
  fees: "bg-chart-pile-fee",
  salary: "bg-chart-pile-salary-tax",
  tax: "bg-chart-pile-tax",
};
/** The hatched swatch of a cut draws in its colour as text colour. */
const HATCH_INK: Record<PileBarPart, string> = { own: "text-chart-pile-own", extra: "text-chart-pile-extra", gain: "text-chart-pile-gain", loss: "text-chart-pile-loss", fees: "text-chart-pile-fee", salary: "text-chart-pile-salary-tax", tax: "text-chart-pile-tax" };
/** Text on a part: near-black on the light fills, white on the dark ones (charts.md "Stacked bar"). */
const INK: Record<PileBarPart, string> = { own: "text-background", extra: "text-background", gain: "text-background", loss: "text-foreground", fees: "text-background", salary: "text-foreground", tax: "text-background" };
/** The text a part's figure is measured by: whole shekels with a sign, as the page writes them. */
const measured = (part: PileBarPart, v: number, compact: boolean) => `${part === "own" ? "" : part === "extra" || part === "gain" ? "+" : "−"}${Math.round(Math.abs(v)).toLocaleString("en-US")}${compact ? "" : " ₪"}`;

const OUT_H = 26;
const BAR_H = 40;

/**
 * The year picked as one bar growing from the right (the page is RTL), its parts in the story's order (what went in, what another hand
 * added, the return before fees). What a loss, the fees and the tax took is hatched in its own colour over the bar's far end, so the part
 * under it still shows, and a bracket under the rest says what is left (`left`) (founder, 2026-11-08). A figure sits inside the part's
 * unhatched length when it fits with room on both sides, else above it with a thin line; a cut's figure sits under it. `other`
 * draws what the same money would leave elsewhere as a second bar on the same scale. `gap` takes the bar's place when the year has no figure.
 */
export function PileBar({
  slice,
  names,
  number,
  left,
  other,
  gap,
  label,
}: {
  slice: PileSlice | null;
  /** The legend's name of each part. */
  names: Record<PileBarPart, string>;
  /** A part's figure; `compact` when the chart is phone-wide and has no room for the shekel sign. */
  number: (part: PileBarPart, compact: boolean) => ReactNode;
  /** The bracket's words and what is left, in bold. */
  left: { words: string; number: ReactNode };
  other?: { net: number | null; words: ReactNode; number: ReactNode };
  gap?: ReactNode;
  label: string;
}) {
  const [ref, W] = useWidth(720);
  const compact = W < 520;
  const shown = useGlidingNumbers([...flat(slice), other?.net ?? 0]);
  const s = sliceAt(shown, 0);
  const otherNet = shown[FLAT]!;
  const deposits = s.own + s.extra;
  const before = s.gain + (s.fees ?? 0);
  const G = deposits + Math.max(before, 0);
  const paid = Math.min(s.taxFromSalary ?? 0, s.tax);
  // the pile at its full length: what went in and the return before fees
  const segs = (["own", "extra", "gain"] as const)
    .map((part) => {
      const from = part === "own" ? 0 : part === "extra" ? s.own : deposits;
      const value = part === "own" ? s.own : part === "extra" ? s.extra : Math.max(before, 0);
      return { part: part as PileBarPart, from, to: from + value, value };
    })
    .filter((p) => p.value > 0.5);
  // hatched over its far end, inward from the end: what a loss, the fees, the salary and the withdrawal took
  const cuts: { part: PileBarPart; from: number; to: number; value: number }[] = [];
  let end = G;
  for (const c of [
    { part: "loss" as const, size: Math.max(-before, 0) },
    { part: "fees" as const, size: s.fees ?? 0 },
    { part: "salary" as const, size: paid },
    { part: "tax" as const, size: s.tax - paid },
  ].filter((c) => c.size > 0.5)) {
    cuts.push({ part: c.part, from: end - c.size, to: end, value: c.size });
    end -= c.size;
  }
  const kept = Math.max(0, end);
  const scaleMax = Math.max(G, other?.net ?? 0, 1);
  const x = (v: number) => W - (v / scaleMax) * W;
  const barTop = OUT_H;
  const cutBelow = barTop + BAR_H + 6;
  const bracketY = cutBelow + 28;
  const otherTop = bracketY + 32;
  const H = other ? otherTop + 26 + BAR_H * 0.6 + 4 : bracketY + 30;
  const size = compact ? CHART_TEXT_PX : 14;
  /** Each figure inside the part's unhatched length when it fits with room on both sides, else in the row beside it (above the bar, under the cuts), pushed apart. */
  const place = (list: typeof segs, hatched: boolean) => {
    const placed = list.map((p) => {
      const w = chartTextWidth(measured(p.part, p.value, compact), size);
      const to = hatched ? p.to : Math.min(p.to, end);
      const mid = hatched ? (x(p.from) + x(p.to)) / 2 : (x(p.from) + x(to)) / 2;
      return { ...p, w, mid, inside: !hatched && x(p.from) - x(to) - 2 >= w + 12, at: mid };
    });
    let edge = -Infinity;
    for (const p of placed.filter((q) => !q.inside).sort((a, b) => a.mid - b.mid)) {
      p.at = Math.max(p.mid, edge + 8 + p.w / 2, p.w / 2);
      edge = p.at + p.w / 2;
    }
    const over = edge - W;
    if (over > 0) for (const p of placed.filter((q) => !q.inside)) p.at -= over;
    return placed;
  };
  const above = place(segs, false);
  const under = place(cuts, true);
  const hatch = useId();
  const legend = (["own", "extra", "gain", "loss", "fees", "salary", "tax"] as const).filter((k) => [...segs, ...cuts].some((p) => p.part === k)).map((k) => ({ id: k, swatch: cuts.some((p) => p.part === k) ? <span className={cx("size-2.5 rounded-sm", HATCH_INK[k])} style={{ background: "repeating-linear-gradient(45deg, currentColor 0 2px, transparent 2px 4px)" }} /> : <Swatch shape="box" className={SWATCH[k]} />, label: names[k] }));
  const rect = (p: { part: PileBarPart; from: number; to: number }, fill?: string) => <rect key={p.part} x={x(p.to) + 1} y={barTop} width={Math.max(0.5, x(p.from) - x(p.to) - 2)} height={BAR_H} {...(fill ? { fill } : { className: BAR_FILL[p.part] })} />;
  return (
    <div className="flex flex-col gap-2">
      {slice && <ChartLegend items={legend} />}
      <div ref={ref} className="relative w-full" dir="ltr" style={slice ? { height: H } : undefined} data-chart>
        {slice && (
          <>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="block select-none">
              <defs>
                {cuts.map((p) => (
                  <pattern key={p.part} id={`${hatch}-${p.part}`} patternUnits="userSpaceOnUse" width={6} height={6} patternTransform="rotate(45)">
                    <rect width={3.5} height={6} className={BAR_FILL[p.part]} />
                  </pattern>
                ))}
              </defs>
              {segs.map((p) => rect(p))}
              {cuts.map((p) => rect(p, `url(#${hatch}-${p.part})`))}
              {above
                .filter((p) => !p.inside)
                .map((p) => (
                  <path key={p.part} d={`M ${p.at} ${OUT_H - 5} L ${p.mid} ${barTop - 1}`} className="stroke-chart-marker" fill="none" />
                ))}
              {under
                .filter((p) => !p.inside)
                .map((p) => (
                  <path key={p.part} d={`M ${p.mid} ${barTop + BAR_H + 1} L ${p.at} ${cutBelow + 1}`} className="stroke-chart-marker" fill="none" />
                ))}
              {kept > 0.5 && <path d={`M ${x(0) - 1} ${bracketY - 6} V ${bracketY} H ${x(kept) + 1} V ${bracketY - 6}`} className="stroke-foreground" fill="none" strokeWidth={1.2} />}
              {other && other.net !== null && otherNet > 0.5 && <rect x={x(otherNet) + 1} y={otherTop + 26} width={Math.max(0.5, W - x(otherNet) - 2)} height={BAR_H * 0.6} className="fill-chart-pile-left" opacity={0.3} />}
            </svg>
            {above.map((p) => (
              <span key={p.part} className={cx("absolute -translate-x-1/2 whitespace-nowrap leading-5 font-semibold", compact ? "text-xs" : "text-sm", p.inside && INK[p.part])} style={{ left: p.at, top: p.inside ? barTop + BAR_H / 2 - 10 : 0 }}>
                {number(p.part, compact)}
              </span>
            ))}
            {under.map((p) => (
              <span key={p.part} className={cx("absolute -translate-x-1/2 whitespace-nowrap leading-5 font-semibold", compact ? "text-xs" : "text-sm", p.inside && INK[p.part])} style={{ left: p.at, top: cutBelow }}>
                {number(p.part, compact)}
              </span>
            ))}
            <div className={cx("absolute whitespace-nowrap", compact ? "text-sm" : "text-base")} dir="rtl" style={{ left: Math.min(Math.max((x(kept) + W) / 2, 90), W - 90), top: bracketY + 4, transform: "translateX(-50%)" }}>
              {left.words} <span className="font-bold">{left.number}</span>
            </div>
            {other && (
              <div className={cx("absolute whitespace-nowrap", compact ? "text-xs" : "text-sm")} dir="rtl" style={{ right: 0, top: otherTop }}>
                {other.words} {other.net !== null && <span className="font-semibold">{other.number}</span>}
              </div>
            )}
          </>
        )}
        {!slice && gap && (
          <div className="text-sm text-caution" dir="rtl">
            {gap}
          </div>
        )}
      </div>
    </div>
  );
}
