// Small lines under a control or a visual: where a starting value came from, and a part the site has not worked out yet.
import { Fragment, type ReactNode } from "react";
import { guideSignature as copy } from "../../copy";
import { IconAlert } from "../icons";
import { cx } from "./cx";
import { gershayim } from "../../lib/format";

/** Where the starting values came from, in one small line under the controls: "מקור ההתחלה: …". */
export function SourceLine({ lead, items }: { lead: ReactNode; items: string[] }) {
  return (
    <p className="text-xs text-muted-foreground">
      {lead} {items.join(", ")}
    </p>
  );
}

/**
 * What a calculation runs on, in one weak line of short parts joined by " · " (the indices page's plan, a guide visual's assumptions): whose
 * numbers they are, said in sight where it is a caution ("הנחות של האתר, לא תחזית"), the figures, and an action at its end. A part that is
 * `false`, `null` or empty is left out, with its dot.
 */
export function DotLine({ items, className }: { items: ReactNode[]; className?: string }) {
  const shown = items.filter((x) => x !== null && x !== undefined && x !== false && x !== "");
  return (
    <p className={cx("text-xs text-muted-foreground", className)}>
      {shown.map((x, i) => (
        <Fragment key={i}>
          {i > 0 && " · "}
          {x}
        </Fragment>
      ))}
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
 * not site figures; an abbreviation's straight quote is drawn as the gershayim (docs/copy.md 10.4). In the kit (the current account's visual and the bank page's cards).
 */
export function PrintedText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(NUMBER)) {
    parts.push(gershayim(text.slice(last, m.index)));
    parts.push(
      <bdi key={m.index} dir="ltr" className="whitespace-nowrap">
        {m[0]}
      </bdi>,
    );
    last = m.index + m[0].length;
  }
  parts.push(gershayim(text.slice(last)));
  return <>{parts}</>;
}

/**
 * A document's own terms quoted word for word in a muted box (a bank's printed terms for breaking a deposit): each quote on a line of its
 * own between Hebrew quotation marks, its figures isolated as `PrintedText` does. The fold that opens it is the caller's.
 */
export function PrintedQuotes({ quotes }: { quotes: readonly string[] }) {
  return (
    <span className="flex flex-col gap-1.5 text-sm bg-muted rounded-md p-3 max-w-measure">
      {quotes.map((q) => (
        <span key={q}>
          ״<PrintedText text={q} />״
        </span>
      ))}
    </span>
  );
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

/**
 * What is true of every row of the table under it, said once over the table instead of on each row ("נכון לכל הפיקדונות בטבלה:"): a muted
 * box with one point each. A fact true of only some rows stays in those rows.
 */
export function SharedFacts({ title, items, className, plain, foot }: { title: ReactNode; items: { key: string; text: ReactNode; /** An item shown at some widths only (`md:hidden`: what a column head's "?" says from md, on a phone with no heads). */ className?: string }[]; className?: string; /** Each item a line of plain sentences, with no bullets (a company page, the designer's mocks). */ plain?: boolean; /** After the lines: the rules behind them, as one quiet line of chips. */ foot?: ReactNode }) {
  if (items.length === 0) return null;
  if (plain)
    return (
      <div className={cx("rounded-lg border border-border bg-card px-4 py-3 flex flex-col gap-1 text-sm", className)}>
        <p className="font-medium">{title}</p>
        {items.map((it) => (
          <p key={it.key} className={cx("text-muted-foreground", it.className)}>
            {it.text}
          </p>
        ))}
        {foot}
      </div>
    );
  return (
    <div className={cx("rounded-lg bg-muted px-4 py-3 flex flex-col gap-1.5 text-sm", className)}>
      <p className="font-medium">{title}</p>
      <ul className="flex flex-col gap-1 list-disc ps-5 marker:text-chart-axis max-w-measure">
        {items.map((it) => (
          <li key={it.key} className={it.className}>
            {it.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
