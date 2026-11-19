// Where a fee's price changes with time (design-system 11, "Cases and parts"; method F-110): a thin line across its place in the colour of
// what the price changes by (`--when`), with words centred on it (`WhenRule`), the earlier price above it and the later under it, so a
// price over time reads as a timeline rather than a table. In the open case the line is `ChangeDivider`: "מ־" and the month the later price
// starts, a month box typed in place (`MonthField`), and the bin that takes the change away. Nothing of a price sits on the line.
import type { ReactNode } from "react";
import { RemoveButton } from "./remove-button";
import { cx } from "./cx";

/** The line with `children` centred on it: at rest the month in words ("מינואר 2027"), in the open case its box and bin, in the toolbox its card's words. */
export function WhenRule({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span data-when-rule="" className={cx("flex w-full basis-full items-center gap-2 text-sm text-when", className)}>
      <span aria-hidden className="h-px min-w-3 flex-1 bg-when" />
      <span className="inline-flex items-center gap-1.5">{children}</span>
      <span aria-hidden className="h-px min-w-3 flex-1 bg-when" />
    </span>
  );
}

/** The divider in the open case: `lead` ("מ־"), `month` (its box, which keeps the month between its neighbours), and the bin (`removeLabel`, `onRemove`). */
export function ChangeDivider({ lead, month, removeLabel, onRemove }: { lead: ReactNode; month: ReactNode; removeLabel: string; onRemove: () => void }) {
  return (
    <div data-change-divider="">
      <WhenRule>
        {lead}
        {month}
        <RemoveButton label={removeLabel} onRemove={onRemove} />
      </WhenRule>
    </div>
  );
}
