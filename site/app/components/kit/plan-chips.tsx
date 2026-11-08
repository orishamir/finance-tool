// The numbers a page runs on, as a row of chips (design-spec 12): label and value, a tap opens the fields. A value the person typed
// looks the same as the start value, with no site-parameter tag on either (founder, 2026-11-08): the fields are where they differ.
import type { FieldKey } from "../../lib/goal";

export interface PlanChipItem {
  field: FieldKey;
  label: string;
  /** The value as text; empty shows the label alone. */
  text: string;
  /** Not editable here (the holding's own amount): a plain span, not a button. */
  fixed?: boolean;
}

export function PlanChips({ items, allLabel, onOpen }: { items: PlanChipItem[]; allLabel: string; onOpen: (f: FieldKey | "all") => void }) {
  return (
    <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto md:overflow-visible flex md:flex-wrap gap-2 pb-1 scrollbar-none">
      {items.map((c) => {
        const body = (
          <>
            <span className="text-muted-foreground">{c.label}</span>
            {c.text && (
              <bdi dir="ltr" className="font-medium">
                {c.text}
              </bdi>
            )}
          </>
        );
        return c.fixed ? (
          <span key={c.field} className="a-chip shrink-0 cursor-default">
            {body}
          </span>
        ) : (
          <button key={c.field} type="button" onClick={() => onOpen(c.field)} className="a-chip shrink-0">
            {body}
          </button>
        );
      })}
      <button type="button" onClick={() => onOpen("all")} className="a-chip shrink-0">
        {allLabel}
      </button>
    </div>
  );
}
