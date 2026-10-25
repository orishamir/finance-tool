// The numbered badge of a ranked row or a step.
import { cx } from "./cx";

/** The rank (or step number) in a circle: the first place is filled with the action colour. `flush` drops the 2 px top offset used beside a two-line title. */
export function RankBadge({ rank, label, first = rank === 1, flush }: { rank: number; label: string; first?: boolean; flush?: boolean }) {
  return (
    <span className={cx("size-7 shrink-0 rounded-full inline-flex items-center justify-center text-sm font-semibold", !flush && "mt-0.5", first ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground")} aria-label={label}>
      {rank}
    </span>
  );
}
