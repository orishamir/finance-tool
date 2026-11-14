// Where a fee's price changes with time (design-system 11, "Cases and parts"; method F-110): between the price before and the price after,
// a full-width line carrying "מ־" and the month the later price starts, a month box typed in place (`MonthField`), and the bin that takes
// the change away. The prices themselves stand above and below it, each with its own parts; nothing of a price sits on the line.
import type { ReactNode } from "react";
import { RemoveButton } from "./remove-button";

/** The divider: `lead` ("מ־"), `month` (its box, which keeps the month between its neighbours), and the bin (`removeLabel`, `onRemove`). */
export function ChangeDivider({ lead, month, removeLabel, onRemove }: { lead: ReactNode; month: ReactNode; removeLabel: string; onRemove: () => void }) {
  return (
    <div data-change-divider="" className="flex items-center gap-2">
      <span aria-hidden className="h-px flex-1 bg-border" />
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        {lead}
        {month}
        <RemoveButton label={removeLabel} onRemove={onRemove} />
      </span>
      <span aria-hidden className="h-px flex-1 bg-border" />
    </div>
  );
}
