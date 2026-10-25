// The numbers a page runs on, as a row of chips (design-spec 12): label and value; blue when the person typed it, plain when it is
// a site value; a tap opens the fields. The comparison, the exposure mode, the fees page and the index page all use it (2026-10-25).
import { numbers } from "../../copy";
import type { FieldKey } from "../../lib/goal";
import { cx } from "./cx";
import { Tag } from "./tag";

export interface PlanChipItem {
  field: FieldKey;
  label: string;
  /** The value as text; empty shows the label alone. */
  text: string;
  /** Typed by the person: blue. */
  entered: boolean;
  /** A starting value the site gave (a preset's): wears the "site parameter" tag. */
  parameter?: boolean;
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
              <bdi dir="ltr" className={cx("font-medium", c.entered && "text-entered")}>
                {c.text}
              </bdi>
            )}
            {c.parameter && <Tag tone="parameter">{numbers.parameter}</Tag>}
          </>
        );
        return c.fixed ? (
          <span key={c.field} className={cx("a-chip shrink-0 cursor-default", c.entered && "a-chip-entered")}>
            {body}
          </span>
        ) : (
          <button key={c.field} type="button" onClick={() => onOpen(c.field)} className={cx("a-chip shrink-0", c.entered && "a-chip-entered")}>
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
