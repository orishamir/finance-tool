// A thin bar of one share from 0 to 100%, beside its figure in a table row: a track's stock or currency exposure (kit ExposureCell), in
// the measure's chart colour on a quiet track. Every bar of a list has one length, so the eye runs down the column. Empty at 0, full above
// 100% (the figure says how much). The figure carries the meaning: the bar is the eye's alone, hidden from screen readers.
import { cx } from "./cx";

export function MeterBar({ share, tone, className }: { /** 0 to 1. */ share: number; tone: "stocks" | "currency"; className?: string }) {
  const fill = { stocks: "bg-chart-stocks", currency: "bg-chart-currency" }[tone];
  return (
    <span aria-hidden="true" className={cx("relative block h-1.5 w-full rounded-full bg-muted", className)}>
      <span className={cx("absolute inset-y-0 start-0 rounded-full transition-[width] duration-[var(--duration-chart)] ease-standard motion-reduce:transition-none", fill)} style={{ width: `${Math.max(0, Math.min(1, share)) * 100}%` }} />
    </span>
  );
}
