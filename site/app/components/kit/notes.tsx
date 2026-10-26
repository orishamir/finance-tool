// Small lines under a control or a visual: where a starting value came from, and a part the site has not worked out yet.
import type { ReactNode } from "react";
import { guideSignature as copy } from "../../copy";
import { cx } from "./cx";

/** Where the starting values came from, in one small line under the controls: "מקור ההתחלה: …". */
export function SourceLine({ lead, items }: { lead: ReactNode; items: string[] }) {
  return (
    <p className="text-xs text-muted-foreground">
      {lead} {items.join(", ")}
    </p>
  );
}

/** "עוד לא חושב" with its reason: for a part the data cannot compute yet. Says so in words; never leaves a blank. */
export function GapNote({ reason, label = copy.common.notComputed, className }: { reason: ReactNode; label?: ReactNode; className?: string }) {
  return (
    <p className={cx("text-sm text-muted-foreground max-w-measure", className)}>
      <span className="font-medium text-foreground">{label}:</span> {reason}
    </p>
  );
}

/** The notes under a visual, one point each (2026-10-26): what a figure leaves out, where a rate comes from. Never one long sentence. */
export function NoteList({ items, className }: { items: ReactNode[]; className?: string }) {
  return (
    <ul className={cx("flex flex-col gap-1 text-sm text-muted-foreground max-w-measure list-disc ps-5 marker:text-chart-axis", className)}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
