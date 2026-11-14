// A small square control that takes no room of its own (design-system 11, `KnobButton`): a bordered square on the popover's surface, a
// 12 px icon in it, muted and the foreground under the pointer, its words spoken and in its title only. It is the look of every small
// action that stands at an edge or a corner of what it acts on: the plus that adds a column, a row or a step at the heads' end or between
// two heads, the plus under a row that adds a part to every case of it, the ✕ at a part line's end, and a closed fee card's corner
// actions. Where it stands alone its press reaches 44 px both ways (`wide`); beside other controls, 44 px tall.
import type { ComponentType, MouseEvent } from "react";
import { cx } from "./cx";

type Data = { [k: `data-${string}`]: string | undefined };

export function KnobButton({
  icon: Icon,
  label,
  onClick,
  expanded,
  wide,
  tabIndex,
  className,
  ...data
}: {
  icon: ComponentType<{ size?: number; strokeWidth?: number; "aria-hidden"?: boolean }>;
  /** Its words: spoken, and its title. */
  label: string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  /** The question or the menu it opens is open. */
  expanded?: boolean;
  /** It stands alone: its press reaches 44 px wide as well as tall. */
  wide?: boolean;
  tabIndex?: number;
  className?: string;
} & Data) {
  return (
    <button
      type="button"
      tabIndex={tabIndex}
      aria-label={label}
      title={label}
      aria-expanded={expanded}
      onClick={onClick}
      {...data}
      className={cx(
        "flex size-5 shrink-0 items-center justify-center rounded-sm border border-border bg-popover text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring",
        wide ? "tap-wide" : "tap-area",
        expanded && "bg-accent text-foreground",
        className,
      )}
    >
      <Icon size={12} strokeWidth={2} aria-hidden />
    </button>
  );
}
