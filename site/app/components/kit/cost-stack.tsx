// A cost split into its parts as one horizontal bar (founder, 2026-10-27, the index page): the parts in their own hues side by side,
// the bar's length the total on a scale shared by every bar it is compared with. Bars that compare are drawn one above the other
// ("10x easier to comprehend when the bars are above each other"). A total beyond the scale is drawn to the edge with a break mark.
//
// It moves and answers (founder, 2026-11-04): when a figure changes, every part's width and the amount written in it glide to the new value
// (the chart glide of chart-glide.tsx, so one that keeps changing never restarts), and a part that falls to zero shrinks to nothing, keeping its
// place, rather than vanishing. Pointing at a part, or tapping it, shows its name, amount, share and where its price comes from.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { kit as kitCopy } from "../../copy";
import { fmt } from "../../lib/format";
import { useGlidingSeries, type GlideSeries } from "./chart-glide";
import { useChartPick } from "./chart-interact";
import { cx } from "./cx";

export interface CostPart {
  id: string;
  value: number;
  /** The part's colour role, a `bg-` class (`bg-chart-cost-trade`). */
  className: string;
  /** Written inside the part when it is wide enough: `true` for its amount in whole shekels, gliding with the part; or the caller's own text. */
  inside?: true | ReactNode;
  /** The part's name: with it, pointing at the part (on `md`, also tapping it) shows its name, amount and share of the bar. */
  name?: string;
  /** Where the part's price comes from ("the price list", "what you entered"), written in the same box under its name. */
  source?: ReactNode;
  /** The legend item this part belongs to, when it is not `id`. */
  legendId?: string;
}

/** A part's width is at least a sliver while its bar has anything, and a part this thin has no edge of its own. */
const THIN = 0.003;
/** The bar's whole length, as a share of the scale, below which the parts are drawn larger so a small cost stays visible. */
const SLIVER = 0.01;

/**
 * `scale`: the total that fills the whole width. `size`: `sm` for a list row, `md` for a figure of its own. `label` is the bar's spoken
 * summary; the figures beside it are the caller's. `highlight`: the legend item set apart, on every bar it is compared with.
 * A `sm` bar sits in a row that picks the row on a tap, so it answers a mouse only. A part of the bar that is not in `parts` any more
 * keeps its place and shrinks to nothing.
 */
export function CostStack({ parts, scale, size = "md", label, highlight }: { parts: CostPart[]; scale: number; size?: "sm" | "md"; label: string; highlight?: string | null }) {
  const pick = useChartPick();
  const root = useRef<HTMLDivElement>(null);
  // the bar's width in px, so an amount is written inside a part only where it fits
  const [px, setPx] = useState(0);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const read = () => setPx(el.clientWidth);
    read();
    const watch = new ResizeObserver(read);
    watch.observe(el);
    return () => watch.disconnect();
  }, []);
  // a part the caller no longer gives stays, at zero, so it can shrink away from where it stood
  const last = useRef(new Map<string, CostPart>());
  for (const p of parts) last.current.set(p.id, p);
  const given = new Set(parts.map((p) => p.id));
  const list = [...parts, ...[...last.current.values()].filter((p) => !given.has(p.id)).map((p) => ({ ...p, value: 0 }))];

  const target: GlideSeries = {};
  for (const p of list) target[p.id] = [{ year: 0, v: p.value }];
  const glide = useGlidingSeries(target);
  const shown = (p: CostPart) => Math.max(0, glide[p.id]?.[0]?.v ?? p.value);

  const total = list.reduce((a, p) => a + p.value, 0);
  const shownTotal = list.reduce((a, p) => a + shown(p), 0);
  const broken = scale > 0 && total > scale;
  // the length the parts are measured on: the scale, or the bar's own when it is longer; a small bar is drawn larger, so a sliver stays
  let whole = scale > 0 ? Math.max(scale, shownTotal) : shownTotal;
  if (shownTotal > 0) whole = Math.min(whole, shownTotal / SLIVER);
  const widths = list.map((p) => (whole > 0 ? shown(p) / whole : 0));
  const live = widths.map((w) => w > THIN);
  const firstLive = live.indexOf(true);
  const lastLive = live.lastIndexOf(true);

  // a tap outside lets go of a part kept by a tap
  const pinned = pick.pinned;
  const clear = pick.clear;
  useEffect(() => {
    if (!pinned) return;
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) clear();
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [pinned, clear]);

  let before = 0;
  return (
    <div ref={root} className="relative">
      <div role="img" aria-label={label} className={cx("flex", size === "sm" ? "h-3" : "h-7")}>
        {list.map((p, i) => {
          const w = widths[i]!;
          const start = before;
          before += w;
          const named = !!p.name && p.value > 0;
          const written = p.inside === true ? Math.round(shown(p)).toLocaleString("he-IL") : p.inside;
          // 11 px figures, about 7 px a character, and a little air at both sides
          const fits = w * px >= (typeof written === "string" ? written.length : 6) * 7 + 10;
          const text = size === "md" && fits ? written : null;
          return (
            <span
              key={p.id}
              {...(named ? pick.bind(p.id, size === "md") : {})}
              className={cx(
                "relative flex shrink-0 items-center justify-center text-[11px] font-semibold text-background tabular-nums whitespace-nowrap",
                live[i] && i !== lastLive && "border-e border-card",
                i === firstLive && "rounded-s-sm",
                i === lastLive && "rounded-e-sm",
                named && "cursor-pointer",
                size === "md" && named && "before:absolute before:inset-x-0 before:-inset-y-2",
                "transition-opacity duration-[var(--duration-fast)]",
                p.className,
                (highlight ? highlight !== (p.legendId ?? p.id) : pick.active && pick.active !== p.id) && "opacity-20",
              )}
              style={{ width: `${w * 100}%` }}
            >
              <span className="overflow-hidden">{text}</span>
              {/* the middle of the part along the whole scale: past the middle its box opens toward the bar's start, so it stays on the screen */}
              {p.name && pick.active === p.id && p.value > 0 && <Tip part={p} share={p.value / total} toStart={start + w / 2 > 0.5} />}
            </span>
          );
        })}
      </div>
      {broken && <span aria-hidden="true" className="absolute inset-y-0 start-[82%] w-1.5 -skew-x-[20deg] bg-card" />}
    </div>
  );
}

function Tip({ part, share, toStart }: { part: CostPart; share: number; toStart: boolean }) {
  return (
    <span className={cx("absolute bottom-full mb-1 z-20 pointer-events-none flex w-max max-w-56 flex-col rounded-md border border-border bg-popover px-2 py-1 text-xs font-normal text-foreground leading-snug whitespace-normal text-start shadow-sm", toStart ? "end-0" : "start-0")}>
      <span>
        <bdi>{part.name}</bdi>: <bdi dir="ltr">{fmt.nisWhole(part.value)}</bdi> ({kitCopy.chart.shareOf(Math.round(share * 100))})
      </span>
      {part.source && <span className="text-muted-foreground">{part.source}</span>}
    </span>
  );
}
