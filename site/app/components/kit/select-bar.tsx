// The bar of several cells chosen at once (design-system 11, `SelectBar`): how many, then its actions as words after " · ", on the
// popover's surface, small and quiet, standing under the table it belongs to, in the room the table's foot keeps for the bin. Each action
// is a button with its words (a 44 px press), the danger colour for one that takes something away; one that opens a menu says whether
// it is open (`expanded`) and hands its button to the menu (`onPick(at)`).
import type { ReactNode } from "react";
import { cx } from "./cx";

export interface SelectAction {
  label: string;
  onPick: (at: HTMLElement) => void;
  danger?: boolean;
  expanded?: boolean;
}

export function SelectBar({ count, label, actions, sep }: { count: ReactNode; /** Its spoken name ("התאים שנבחרו"). */ label: string; actions: SelectAction[]; /** Between the count and each action. */ sep: string }) {
  return (
    <div role="toolbar" aria-label={label} data-select-bar="" className="flex w-max max-w-full flex-wrap items-center gap-x-1 self-center rounded-md border border-border bg-popover px-3 py-1 text-sm shadow-sm">
      <span role="status" className="text-muted-foreground">
        {count}
      </span>
      {actions.map((a) => (
        <span key={a.label} className="inline-flex items-center gap-x-1">
          <span aria-hidden className="text-muted-foreground">
            {sep}
          </span>
          <button type="button" aria-expanded={a.expanded} onClick={(e) => a.onPick(e.currentTarget)} className={cx("tap-area rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring", a.danger ? "text-destructive" : "text-primary")}>
            {a.label}
          </button>
        </span>
      ))}
    </div>
  );
}
