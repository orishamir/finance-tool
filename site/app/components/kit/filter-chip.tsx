// A filter that is on or off, with the number of rows it would show (the rules page's filters). The number has a fixed
// slot, so nothing moves when it changes; a chip that would show nothing dims and stays where it is.
import type { ReactNode } from "react";
import { fmt } from "../../lib/format";
import { cx } from "./cx";

export function FilterChip({ on, onClick, count, children }: { on: boolean; onClick: () => void; count?: number; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cx(
        "min-h-target inline-flex items-center gap-1.5 px-3 rounded-md text-sm whitespace-nowrap transition-[background-color,color,opacity] duration-[var(--duration-base)] ease-standard",
        on ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent",
        count === 0 && !on && "opacity-45",
      )}
    >
      {children}
      {count !== undefined && (
        <bdi dir="ltr" className="inline-block min-w-[3.5ch] text-end tabular-nums opacity-80">
          {fmt.number(count)}
        </bdi>
      )}
    </button>
  );
}
