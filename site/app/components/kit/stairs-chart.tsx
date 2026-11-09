// The stairs (the indices page): money left at the end on the vertical axis, the order of the steps from left to right.
// The first column is the start (grey, with a break mark because the axis does not begin at zero); every other column floats from the level
// before it to its own, in the hue of what changed (the account, the kind of fund, the fund) and red when it loses money. A step taken is
// solid; the largest one still ahead is lighter and outlined; one that rests on an open rule is hollow. A dashed line marks the most any
// priced pair leaves. Under the chart a table of the same columns on a computer, a list of the steps on a phone. Own SVG.
import type { KeyboardEvent, ReactNode } from "react";
import { cx } from "./cx";
import { CHART_TEXT_PX, chartTextWidth } from "./chart-text";
import { useWidth } from "./marker";

export type StairHue = "start" | "account" | "kind" | "fund";

export interface StairColumn {
  id: string;
  /** What is left here. */
  level: number;
  /** What is left at the column before (the start's own level for the start): the stair floats between the two. */
  from: number;
  /** The text over the column: the level for the start, the signed difference for the others. */
  top: string;
  hue: StairHue;
  /** A step that leaves less than the one before it is red whatever it changed. */
  loses: boolean;
  /** Taken by the person (the start counts); the others are the suggested ones. */
  taken: boolean;
  /** Rests on an open rule: hollow. */
  open: boolean;
  /** Where the person is now. */
  current: boolean;
  /** What a screen reader and a tooltip say about the column. */
  label: string;
}

/** Columns on screen at most; a longer chain folds its first steps away. */
export const STAIRS_SLOTS = 5;
/** The chart's left and right margins as shares of its width, so a table under it keeps the chart's columns. */
export const STAIRS_MARGIN = { left: 0.095, right: 0.175 };

const FILL: Record<StairHue | "loss", string> = { start: "fill-chart-stairs-start", account: "fill-chart-stairs-account", kind: "fill-chart-stairs-kind", fund: "fill-chart-stairs-fund", loss: "fill-loss" };
const STROKE: Record<StairHue | "loss", string> = { start: "stroke-chart-stairs-start", account: "stroke-chart-stairs-account", kind: "stroke-chart-stairs-kind", fund: "stroke-chart-stairs-fund", loss: "stroke-loss" };
export const STAIR_SWATCH: Record<StairHue | "loss", string> = { start: "bg-chart-stairs-start", account: "bg-chart-stairs-account", kind: "bg-chart-stairs-kind", fund: "bg-chart-stairs-fund", loss: "bg-loss" };

/**
 * Isolates every number that stands among Hebrew words, so it keeps its sign and order there ("+2,345 ₪"). A number inside a Latin
 * name ("S&P 500", "(4D)", "NASDAQ 100") is left to the name: isolated alone, it stepped out of the name's order, and
 * "S&P 500 (4D)" read "(D4) 500 S&P".
 */
export const isoNumbers = (s: string) => s.replace(/(?<![A-Za-z&][ ]?)(?<![\d,.])[−+]?\d[\d,.]*%?(?: ₪)?(?![A-Za-z])/g, (m) => `\u2066${m}\u2069`);

function Txt({ x, y, a = "right", size = 13, className = "fill-chart-text", weight = 400, children }: { x: number; y: number; a?: "right" | "left" | "mid"; size?: number; className?: string; weight?: number; children: string }) {
  return (
    <text x={x} y={y} direction="rtl" textAnchor={a === "right" ? "start" : a === "left" ? "end" : "middle"} fontSize={size} fontWeight={weight} className={cx("stroke-card", className)} strokeWidth={4} style={{ paintOrder: "stroke" }}>
      {isoNumbers(children)}
    </text>
  );
}

/** A text broken into lines of at most `max` characters, at the spaces. */
export function wrapLines(text: string, max: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const w of text.split(" ")) {
    if (line && (line + " " + w).length > max) {
      out.push(line);
      line = w;
    } else line = line ? line + " " + w : w;
  }
  if (line) out.push(line);
  return out;
}

export function StairsChart({
  columns,
  fold,
  axis,
  ceiling,
  endsAt,
  now,
  label,
  onGo,
}: {
  /** The columns on screen (at most `STAIRS_SLOTS`). */
  columns: StairColumn[];
  /** How many steps are folded away before the first column; a column's index for `onGo` counts them. */
  fold: number;
  /** The levels the plot spans (no figures drawn on the axis: the amounts on the columns are the axis, charts.md). */
  axis: { lo: number; hi: number };
  /** The dashed line: what the most that any priced pair leaves, and the words beside it on a computer (the first is a heading). */
  ceiling: { level: number; lines: string[] };
  /** The level where the climb stops below the ceiling and the words for it; shown on a computer when there is room. */
  endsAt: { level: number; text: string } | null;
  now: string;
  label: string;
  onGo: (index: number) => void;
}) {
  const [ref, W] = useWidth(1000);
  const compact = W < 860;
  const H = compact ? 300 : 340;
  const { lo, hi } = axis;
  // no value axis: every column carries its amount, and up to about twelve marks the amounts replace the axis (charts.md)
  const m = compact ? { l: 6, r: 6, t: 40, b: 6 } : { l: W * STAIRS_MARGIN.left, r: W * STAIRS_MARGIN.right, t: 44, b: 6 };
  const cw = (W - m.l - m.r) / STAIRS_SLOTS;
  const y = (v: number) => m.t + (1 - (v - lo) / (hi - lo || 1)) * (H - m.t - m.b);
  const floor = y(lo);
  const bx = (i: number) => m.l + i * cw + cw * 0.1;
  const bw = cw * 0.8;
  // the figure over each column, and the "now" words over the current one: centred on the column, kept clear of the chart's left edge and
  // the chart's right edge, and raised above the one before where they would meet it (at 13 px, five columns on a phone are
  // narrower than their figures, and "+4,875 ₪" ran into "−2,148 ₪")
  const topPx = compact ? CHART_TEXT_PX : 15;
  const place = () => {
    const marks: { x: number; base: number; y1: number }[] = [];
    let prev: { x1: number; x2: number; y1: number; y2: number } | null = null;
    for (const [i, c] of columns.entries()) {
      const top = i === 0 ? y(c.level) : y(Math.max(c.level, c.from));
      const w = Math.max(chartTextWidth(c.top, topPx), c.current ? chartTextWidth(now, CHART_TEXT_PX) : 0);
      const x = Math.min(W - 2 - w / 2, Math.max(m.l - 4 + w / 2, bx(i) + bw / 2));
      const lift = c.current ? 27 + CHART_TEXT_PX : topPx;
      const box = (base: number) => ({ x1: x - w / 2, x2: x + w / 2, y1: base - lift, y2: base + topPx * 0.3 });
      let base = top - 7;
      // a figure wider than its column clears the columns beside it that it reaches over (at 320 px "78,038 ₪" ran over the
      // next step's edge)
      for (const j of [i - 1, i + 1]) {
        const n = columns[j];
        if (!n) continue;
        const nb = box(base);
        const nTop = j === 0 ? y(n.level) : y(Math.max(n.level, n.from));
        if (nb.x2 > bx(j) && nb.x1 < bx(j) + bw) base = Math.min(base, nTop - 4 - topPx * 0.3);
      }
      const b = box(base);
      if (prev && b.x1 < prev.x2 + 4 && b.x2 > prev.x1 - 4 && b.y1 < prev.y2 + 2 && b.y2 > prev.y1 - 2) base = prev.y1 - 2 - topPx * 0.3;
      prev = box(base);
      marks.push({ x, base, y1: prev.y1 });
    }
    return marks;
  };
  // a figure raised that far would leave the chart at its top: the plot starts lower, as far as the highest figure needs
  let marks = place();
  for (let pass = 0; pass < 3; pass++) {
    const over = 2 - Math.min(Infinity, ...marks.map((k) => k.y1));
    if (over <= 0.5) break;
    m.t += Math.ceil(over);
    marks = place();
  }
  // the words beside the dashed line: a heading above, the figure on it, the names below, each broken to fit the margin
  const maxChars = Math.max(8, Math.floor((m.r - 12) / 6.6));
  const heading = wrapLines(ceiling.lines[0] ?? "", maxChars);
  const detail = ceiling.lines.slice(2).flatMap((t) => wrapLines(t, maxChars));
  const lines = [
    ...heading.map((t, j) => ({ key: `h${j}`, text: t, y: y(ceiling.level) - 3 - 21 * (heading.length - j), big: false })),
    ...(ceiling.lines[1] ? [{ key: "m", text: ceiling.lines[1], y: y(ceiling.level) - 3, big: true }] : []),
    ...detail.map((t, j) => ({ key: `d${j}`, text: t, y: y(ceiling.level) + 17 + 18 * j, big: false })),
  ];
  const key = (e: KeyboardEvent, i: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onGo(i);
    }
  };
  return (
    <div ref={ref} className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={label} className="block w-full h-auto [direction:ltr]">
        <line x1={m.l} x2={W - m.r + (compact ? 0 : 4)} y1={y(ceiling.level)} y2={y(ceiling.level)} className="stroke-chart-crosshair" strokeWidth={1.5} strokeDasharray="3 5" />
        {/* the floor, where the first column stands, is the chart's zero line for the chart check (it does not begin at zero: the first
            column carries a break mark) */}
        <line x1={m.l} x2={W - m.r} y1={floor} y2={floor} className="stroke-chart-grid" data-zero="" />
        {columns.map((c, i) => {
          const low = Math.min(c.level, c.from);
          const high = Math.max(c.level, c.from);
          const first = i === 0;
          const hue = c.loses ? "loss" : c.hue;
          const x = bx(i);
          const h = Math.max(y(low) - y(high), 2);
          return (
            <g key={c.id}>
              {first ? (
                <>
                  <rect x={x} y={y(c.level)} width={bw} height={floor - y(c.level)} rx={3} className={FILL.start} data-mark="bar" />
                  {/* never a negative height: a plan with no money puts the first bar on the floor ("-2" in the console) */}
                  {c.open && <rect x={x + 1} y={y(c.level) + 1} width={bw - 2} height={Math.max(0, floor - y(c.level) - 2)} rx={3} className="fill-card stroke-chart-marker" strokeWidth={1.5} />}
                  {/* the axis does not begin at zero: a break mark across the foot of the bar */}
                  <path d={`M${x} ${floor - 12}l${bw / 6} -5l${bw / 3} 10l${bw / 3} -10l${bw / 6} 5`} fill="none" className="stroke-card" strokeWidth={3} />
                </>
              ) : (
                <>
                  <rect x={x} y={y(low)} width={bw} height={floor - y(low)} className="fill-chart-stairs-below" />
                  {c.open ? (
                    <rect x={x + 1} y={y(high) + 1} width={bw - 2} height={Math.max(y(low) - y(high) - 2, 2)} rx={3} className={cx("fill-card", STROKE[hue])} strokeWidth={2} data-mark="step" />
                  ) : (
                    <>
                      <rect x={x} y={y(high)} width={bw} height={h} rx={3} className={FILL[hue]} opacity={c.taken ? 1 : 0.5} data-mark="step" />
                      {!c.taken && <rect x={x + 0.75} y={y(high) + 0.75} width={bw - 1.5} height={Math.max(h - 1.5, 1)} rx={3} fill="none" className={STROKE[hue]} strokeWidth={1.5} />}
                    </>
                  )}
                </>
              )}
              {i < columns.length - 1 && <line x1={x + bw} x2={bx(i + 1)} y1={y(c.level)} y2={y(c.level)} className="stroke-chart-marker" strokeWidth={1.5} />}
              <rect
                data-go={fold + i}
                role="button"
                tabIndex={0}
                aria-label={c.label}
                x={m.l + i * cw}
                y={0}
                width={cw}
                height={H}
                className="cursor-pointer fill-transparent hover:fill-foreground/5 focus-visible:fill-foreground/10 outline-none"
                onClick={() => onGo(fold + i)}
                onKeyDown={(e) => key(e, fold + i)}
              />
            </g>
          );
        })}
        {/* the figures over the columns come after every column, so their card-coloured halo keeps them clear of the next column's
            outline where a figure is wider than its column (a phone at 320 px: "78,038 ₪" was crossed by the next step's edge) */}
        <g pointerEvents="none">
          {columns.map((c, i) => (
            <g key={c.id}>
              <Txt x={marks[i]!.x} y={marks[i]!.base} a="mid" size={topPx} className="fill-foreground" weight={600}>
                {c.top}
              </Txt>
              {c.current && (
                <>
                  <path d={`M${bx(i) + bw / 2 - 6} ${marks[i]!.base - 23}h12l-6 7z`} className="fill-primary" />
                  <Txt x={marks[i]!.x} y={marks[i]!.base - 27} a="mid" size={CHART_TEXT_PX} className="fill-primary" weight={600}>
                    {now}
                  </Txt>
                </>
              )}
            </g>
          ))}
        </g>
        {!compact && (
          <>
            {lines.map((l) => (
              <Txt key={l.key} x={W - 2} y={l.y} size={l.big ? 18 : 13} className={l.big ? "fill-foreground" : "fill-chart-text"} weight={l.big ? 600 : 400}>
                {l.text}
              </Txt>
            ))}
            {endsAt && columns.length < STAIRS_SLOTS && columns.length > 1 && (
              <Txt x={bx(columns.length - 1) + bw + 8} y={y(endsAt.level) + 5} a="left" size={14} className="fill-foreground" weight={600}>
                {endsAt.text}
              </Txt>
            )}
          </>
        )}
      </svg>
    </div>
  );
}

/**
 * The table under the stairs on a computer: one column per step, on the chart's own columns, so each figure sits under its stair. Rows are
 * given heading and cells; a row with fewer cells than slots leaves the rest blank, and the grid keeps its shape.
 */
export function StairsTable({ rows, slots = STAIRS_SLOTS }: { rows: { id: string; head: ReactNode; cells: ReactNode[]; className?: string; headClassName?: string }[]; slots?: number }) {
  const g = STAIRS_MARGIN.left * 100;
  const r = STAIRS_MARGIN.right * 100;
  const c = (100 - g - r) / slots;
  return (
    <div role="table" className="grid [direction:ltr] mt-0.5" style={{ gridTemplateColumns: `${g}% ${Array(slots).fill(`${c}%`).join(" ")} ${r}%` }}>
      {rows.map((row) => (
        <div key={row.id} role="row" className="contents">
          <div role="rowheader" className={cx("[direction:rtl] min-w-0 self-center py-1 pr-2 text-left text-[13px] leading-tight text-muted-foreground", row.headClassName)}>
            {row.head}
          </div>
          {Array.from({ length: slots }, (_, i) => (
            <div key={i} role="cell" className={cx("[direction:rtl] min-w-0 self-center px-1 py-1 text-center text-sm leading-snug", row.className)}>
              {row.cells[i] ?? null}
            </div>
          ))}
          <div />
        </div>
      ))}
    </div>
  );
}

export interface StairStep {
  id: string;
  hue: StairHue;
  loses: boolean;
  /** The name of the step, with a lock when it is open (a node). */
  head: ReactNode;
  /** The figure on the right: the level for the start, the signed difference for the others (a `Num`). */
  delta: ReactNode;
  /** The parts under it: what each of the three costs changed by. Null for the start. */
  parts: ReactNode | null;
  /** The largest step still ahead, not yet taken: its name is muted. */
  next: boolean;
  label: string;
}

/** The same steps as a list, where the columns do not fit (a phone): a step is a tap, its figures open their sheets. */
export function StairsSteps({ steps, onGo }: { steps: StairStep[]; onGo: (index: number) => void }) {
  return (
    <ol className="m-0 mt-1.5 flex min-h-[290px] list-none flex-col p-0">
      {steps.map((s, i) => (
        <li key={s.id} className="group relative border-t border-border hover:bg-accent">
          <button type="button" aria-label={s.label} onClick={() => onGo(i)} className="absolute inset-0 w-full cursor-pointer" />
          <div className="pointer-events-none relative z-10 flex min-h-11 flex-col justify-center gap-px px-0.5 py-1.5 [&_.num]:pointer-events-auto">
            <span className="flex items-center gap-[7px] text-sm">
              <i className={cx("inline-block size-3 flex-none rounded-[2px]", STAIR_SWATCH[s.loses ? "loss" : s.hue])} />
              <b className={cx("min-w-0 font-medium", s.next && "text-muted-foreground")}>{s.head}</b>
              <span className="ms-auto font-semibold tabular-nums">{s.delta}</span>
            </span>
            {s.parts && <span className="ps-[19px] text-xs text-muted-foreground">{s.parts}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}
