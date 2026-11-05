// The stairs (founder, 2026-11-01, the indices page): money left at the end on the vertical axis, the order of the steps from left to right.
// The first column is the start (grey, with a break mark because the axis does not begin at zero); every other column floats from the level
// before it to its own, in the hue of what changed (the account, the kind of fund, the fund) and red when it loses money. A step taken is
// solid; the largest one still ahead is lighter and outlined; one that rests on an open rule is hollow. A dashed line marks the most any
// priced pair leaves. Under the chart a table of the same columns on a computer, a list of the steps on a phone. Own SVG.
import type { KeyboardEvent, ReactNode } from "react";
import { cx } from "./cx";
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
 * "S&P 500 (4D)" read "(D4) 500 S&P" (2026-11-05).
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
  tick,
  onGo,
}: {
  /** The columns on screen (at most `STAIRS_SLOTS`). */
  columns: StairColumn[];
  /** How many steps are folded away before the first column; a column's index for `onGo` counts them. */
  fold: number;
  axis: { lo: number; hi: number; step: number };
  /** The dashed line: what the most that any priced pair leaves, and the words beside it on a computer (the first is a heading). */
  ceiling: { level: number; lines: string[] };
  /** The level where the climb stops below the ceiling and the words for it; shown on a computer when there is room. */
  endsAt: { level: number; text: string } | null;
  now: string;
  label: string;
  tick: (n: number, compact: boolean) => string;
  onGo: (index: number) => void;
}) {
  const [ref, W] = useWidth(1000);
  const compact = W < 860;
  const H = compact ? 300 : 340;
  const m = compact ? { l: 44, r: 6, t: 40, b: 6 } : { l: W * STAIRS_MARGIN.left, r: W * STAIRS_MARGIN.right, t: 44, b: 6 };
  const cw = (W - m.l - m.r) / STAIRS_SLOTS;
  const { lo, hi, step } = axis;
  const y = (v: number) => m.t + (1 - (v - lo) / (hi - lo || 1)) * (H - m.t - m.b);
  const floor = y(lo);
  const bx = (i: number) => m.l + i * cw + cw * 0.1;
  const bw = cw * 0.8;
  const grid: number[] = [];
  for (let g = lo; g <= hi + 1e-9; g += step) grid.push(g);
  // the words beside the dashed line: a heading above, the figure on it, the names below, each broken to fit the margin
  const maxChars = Math.max(8, Math.floor((m.r - 12) / 6.6));
  const heading = wrapLines(ceiling.lines[0] ?? "", maxChars);
  const detail = ceiling.lines.slice(2).flatMap((t) => wrapLines(t, maxChars));
  const lines = [
    ...heading.map((t, j) => ({ key: `h${j}`, text: t, y: y(ceiling.level) - 3 - 19 * (heading.length - j), big: false })),
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
        {grid.map((g) => (
          <g key={g}>
            <line x1={m.l} x2={W - m.r} y1={y(g)} y2={y(g)} className="stroke-chart-grid" />
            <text x={m.l - 8} y={y(g) + 4} textAnchor="end" fontSize={compact ? 10.5 : 12} className="fill-chart-text">
              {tick(g, compact)}
            </text>
          </g>
        ))}
        {columns.map((c, i) => {
          const low = Math.min(c.level, c.from);
          const high = Math.max(c.level, c.from);
          const first = i === 0;
          const hue = c.loses ? "loss" : c.hue;
          const top = first ? y(c.level) : y(high);
          const x = bx(i);
          const h = Math.max(y(low) - y(high), 2);
          return (
            <g key={c.id}>
              {first ? (
                <>
                  <rect x={x} y={y(c.level)} width={bw} height={floor - y(c.level)} rx={3} className={FILL.start} />
                  {c.open && <rect x={x + 1} y={y(c.level) + 1} width={bw - 2} height={floor - y(c.level) - 2} rx={3} className="fill-card stroke-chart-marker" strokeWidth={1.5} />}
                  {/* the axis does not begin at zero: a break mark across the foot of the bar */}
                  <path d={`M${x} ${floor - 12}l${bw / 6} -5l${bw / 3} 10l${bw / 3} -10l${bw / 6} 5`} fill="none" className="stroke-card" strokeWidth={3} />
                </>
              ) : (
                <>
                  <rect x={x} y={y(low)} width={bw} height={floor - y(low)} className="fill-chart-stairs-below" />
                  {c.open ? (
                    <rect x={x + 1} y={y(high) + 1} width={bw - 2} height={Math.max(y(low) - y(high) - 2, 2)} rx={3} className={cx("fill-card", STROKE[hue])} strokeWidth={2} />
                  ) : (
                    <>
                      <rect x={x} y={y(high)} width={bw} height={h} rx={3} className={FILL[hue]} opacity={c.taken ? 1 : 0.5} />
                      {!c.taken && <rect x={x + 0.75} y={y(high) + 0.75} width={bw - 1.5} height={Math.max(h - 1.5, 1)} rx={3} fill="none" className={STROKE[hue]} strokeWidth={1.5} />}
                    </>
                  )}
                </>
              )}
              {i < columns.length - 1 && <line x1={x + bw} x2={bx(i + 1)} y1={y(c.level)} y2={y(c.level)} className="stroke-chart-marker" strokeWidth={1.5} />}
              <Txt x={x + bw / 2} y={top - 7} a="mid" size={compact ? 11.5 : 15} className="fill-foreground" weight={600}>
                {c.top}
              </Txt>
              {c.current && (
                <>
                  <path d={`M${x + bw / 2 - 6} ${top - 30}h12l-6 7z`} className="fill-primary" />
                  <Txt x={x + bw / 2} y={top - 34} a="mid" size={compact ? 11 : 13} className="fill-primary" weight={600}>
                    {now}
                  </Txt>
                </>
              )}
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
            {s.parts && <span className="ps-[19px] text-[12.5px] text-muted-foreground">{s.parts}</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}
