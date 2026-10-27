// A cost split into its parts as one horizontal bar (founder, 2026-10-27, the index page): the parts in their own hues side by side,
// the bar's length the total on a scale shared by every bar it is compared with. Bars that compare are drawn one above the other
// ("10x easier to comprehend when the bars are above each other"). A total beyond the scale is drawn to the edge with a break mark.
import type { ReactNode } from "react";
import { cx } from "./cx";

export interface CostPart {
  id: string;
  value: number;
  /** The part's colour role, a `bg-` class (`bg-chart-cost-trade`). */
  className: string;
  /** Written inside the part when it is wide enough (an amount). */
  inside?: ReactNode;
}

/**
 * `scale`: the total that fills the whole width. `size`: `sm` for a list row, `md` for a figure of its own. `label` is the bar's
 * spoken summary; the figures beside it are the caller's.
 */
export function CostStack({ parts, scale, size = "md", label }: { parts: CostPart[]; scale: number; size?: "sm" | "md"; label: string }) {
  const shown = parts.filter((p) => p.value > 0);
  const total = shown.reduce((a, p) => a + p.value, 0);
  const broken = scale > 0 && total > scale;
  const width = scale > 0 ? Math.min(1, total / scale) : 0;
  return (
    <div role="img" aria-label={label} className={cx("relative flex overflow-hidden rounded-sm", size === "sm" ? "h-3" : "h-7")} style={{ width: `${Math.max(width * 100, total > 0 ? 1 : 0)}%` }}>
      {shown.map((p) => (
        <span key={p.id} className={cx("flex items-center justify-center overflow-hidden border-e border-card last:border-e-0 text-[11px] font-semibold text-background tabular-nums whitespace-nowrap", p.className)} style={{ width: `${(p.value / total) * 100}%` }}>
          {size === "md" && p.inside && p.value / Math.max(total, scale) > 0.07 ? p.inside : null}
        </span>
      ))}
      {broken && <span aria-hidden="true" className="absolute inset-y-[-2px] start-[82%] w-1.5 -skew-x-[20deg] bg-card" />}
    </div>
  );
}
