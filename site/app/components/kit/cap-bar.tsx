// A price against its legal cap (method F-113): one thin bar from zero to the cap, a mark where the cap stands, and the cap's own figure
// at the bar's end. Drawn left to right, as the approved design draws it.
import type { ReactNode } from "react";
import { cx } from "./cx";

/**
 * The price's share of the cap as a bar: `share` is the price over the cap (`x / c`), filled in the fee's colour (`fill`, a `bg-*` role);
 * a `later` price's share, where the fee changes, is an outline in the same colour (`edge`, a `border-*` role) behind it. A price above
 * the cap runs past the cap's mark in the blocked red's stripes, the scale widened a little so the part above shows. `cap` is the cap's
 * label after the bar ("התקרה 1.05%", a figure that opens its source). The bar is decoration: the sentence beside it says the standing
 * in words, so it is hidden from a screen reader. A cap of zero (no such fee allowed) has no bar: say it in words alone.
 */
export function CapBar({ share, later, fill, edge, cap, className }: { share: number; later?: number; fill: string; edge: string; cap: ReactNode; className?: string }) {
  const over = Math.max(share, later ?? 0) > 1 + 1e-9;
  const scale = Math.max(1, share, later ?? 0) * (over ? 1.08 : 1);
  const at = (x: number) => `${(Math.max(0, x) / scale) * 100}%`;
  return (
    <div className={cx("flex items-center gap-3", className)}>
      <span aria-hidden="true" dir="ltr" className="relative flex-1 min-w-16 h-3 rounded-full bg-muted">
        {later !== undefined && later > share && <span className={cx("absolute inset-y-0 left-0 rounded-full border-2 bg-transparent", edge)} style={{ width: at(Math.min(later, 1)) }} />}
        <span className={cx("absolute inset-y-0 left-0 rounded-full transition-[width] duration-[var(--duration-chart)] ease-standard motion-reduce:transition-none", fill)} style={{ width: at(Math.min(share, 1)) }} />
        {over && <span className="absolute inset-y-0 rounded-e-full" style={{ left: at(1), width: `calc(${at(Math.max(share, later ?? 0))} - ${at(1)})`, backgroundImage: "repeating-linear-gradient(135deg, var(--blocked) 0 3px, transparent 3px 6px)" }} />}
        <span className="absolute -inset-y-1 w-0.5 rounded-full bg-foreground" style={{ left: `calc(${at(1)} - 1px)` }} />
      </span>
      <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">{cap}</span>
    </div>
  );
}
