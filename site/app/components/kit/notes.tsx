// Small lines under a control or a visual: where a starting value came from, and a part the site has not worked out yet.
import type { ReactNode } from "react";
import { guideSignature as copy } from "../../copy";
import { IconAlert } from "../icons";
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

/** Points inside the body text of a guide: body size, one point each, for a sentence that ends "..., אבל אז משלמים:". Notes under a visual are NoteList. */
export function ProseList({ items, className }: { items: ReactNode[]; className?: string }) {
  return (
    <ul className={cx("flex flex-col gap-1 max-w-measure list-disc ps-5 marker:text-chart-axis", className)}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

/** The notes under a visual, one point each: what a figure leaves out, where a rate comes from. Never one long sentence. */
export function NoteList({ items, className }: { items: ReactNode[]; className?: string }) {
  return (
    <ul className={cx("flex flex-col gap-1 text-sm text-muted-foreground max-w-measure list-disc ps-5 marker:text-chart-axis", className)}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

const NUMBER = /\d+(?:[.,]\d+)*(?:\s?(?:₪|%))?/g;

/**
 * Hebrew prose that carries figures, as a record prints it (a bank's conditions: "3,000 ₪", "31.03.2026", "2%"): each figure is isolated
 * left to right, so the shekel sign and the digits keep one order beside Hebrew words, as in a `Num`. The figures stay the document's own,
 * not site figures. In the kit (the current account's visual and the bank page's cards).
 */
export function PrintedText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(NUMBER)) {
    parts.push(text.slice(last, m.index));
    parts.push(
      <bdi key={m.index} dir="ltr" className="whitespace-nowrap">
        {m[0]}
      </bdi>,
    );
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}

/** An open doubt about a record, with the caution mark: the sentence the record carries (`doubt_he`), beside the figure it is about. */
export function DoubtNote({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cx("flex items-start gap-1.5 text-caution-foreground max-w-measure", className)}>
      <IconAlert size={14} className="text-caution shrink-0 mt-1" aria-hidden="true" />
      <span>
        <PrintedText text={text} />
      </span>
    </span>
  );
}
