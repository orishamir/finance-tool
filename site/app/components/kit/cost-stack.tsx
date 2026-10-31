// A cost split into its parts as one horizontal bar (founder, 2026-10-27, the index page): the parts in their own hues side by side,
// the bar's length the total on a scale shared by every bar it is compared with. Bars that compare are drawn one above the other
// ("10x easier to comprehend when the bars are above each other"). A total beyond the scale is drawn to the edge with a break mark.
import type { ReactNode } from "react";
import { kit as kitCopy } from "../../copy";
import { fmt } from "../../lib/format";
import { pickDim, useChartPick } from "./chart-interact";
import { cx } from "./cx";

export interface CostPart {
  id: string;
  value: number;
  /** The part's colour role, a `bg-` class (`bg-chart-cost-trade`). */
  className: string;
  /** Written inside the part when it is wide enough (an amount). */
  inside?: ReactNode;
  /** The part's name: with it, pointing at the part (on `md`, also tapping it) shows its name, amount and share of the bar. */
  name?: string;
  /** The legend item this part belongs to, when it is not `id`. */
  legendId?: string;
}

/**
 * `scale`: the total that fills the whole width. `size`: `sm` for a list row, `md` for a figure of its own. `label` is the bar's
 * spoken summary; the figures beside it are the caller's. `highlight`: the legend item set apart, on every bar it is compared with.
 * A `sm` bar sits in a row that picks the row on a tap, so it answers a mouse only.
 */
export function CostStack({ parts, scale, size = "md", label, highlight }: { parts: CostPart[]; scale: number; size?: "sm" | "md"; label: string; highlight?: string | null }) {
  const shown = parts.filter((p) => p.value > 0);
  const total = shown.reduce((a, p) => a + p.value, 0);
  const broken = scale > 0 && total > scale;
  const width = scale > 0 ? Math.min(1, total / scale) : 0;
  const pick = useChartPick();
  let before = 0;
  return (
    <div role="img" aria-label={label} className={cx("relative flex rounded-sm", size === "sm" ? "h-3" : "h-7")} style={{ width: `${Math.max(width * 100, total > 0 ? 1 : 0)}%` }}>
      {shown.map((p, i) => {
        const share = p.value / total;
        // the middle of the part along the whole scale: past the middle of the scale its box opens toward the bar's start, so it stays on the screen
        const mid = (before + share / 2) * width;
        before += share;
        return (
          <span
            key={p.id}
            {...(p.name ? pick.bind(p.id, size === "md") : {})}
            className={cx("relative flex items-center justify-center border-e border-card last:border-e-0 text-[11px] font-semibold text-background tabular-nums whitespace-nowrap", i === 0 && "rounded-s-sm", i === shown.length - 1 && "rounded-e-sm", p.name && "cursor-pointer", size === "md" && p.name && "before:absolute before:inset-x-0 before:-inset-y-2", p.className, pickDim(highlight ?? pick.active, highlight ? (p.legendId ?? p.id) : p.id))}
            style={{ width: `${share * 100}%` }}
          >
            <span className="overflow-hidden">{size === "md" && p.inside && p.value / Math.max(total, scale) > 0.07 ? p.inside : null}</span>
            {p.name && pick.active === p.id && (
              <span className={cx("absolute bottom-full mb-1 z-20 pointer-events-none rounded-md border border-border bg-popover px-2 py-1 text-xs font-normal text-foreground leading-snug shadow-sm", mid > 0.5 ? "end-0" : "start-0")}>
                <bdi>{p.name}</bdi>: <bdi dir="ltr">{fmt.nisWhole(p.value)}</bdi> ({kitCopy.chart.shareOf(Math.round(share * 100))})
              </span>
            )}
          </span>
        );
      })}
      {broken && <span aria-hidden="true" className="absolute inset-y-0 start-[82%] w-1.5 -skew-x-[20deg] bg-card" />}
    </div>
  );
}
