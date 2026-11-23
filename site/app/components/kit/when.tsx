// A date inside Hebrew text: a day is isolated left to right (`22.10.2026`); a month a document prints alone is said in words,
// in the text's own direction (`נובמבר 2025`), never with an invented first day. Every date a page writes in its text goes through it.
import type { ReactNode } from "react";
import { oneDay, type DateSpan } from "../../lib/date-span";
import { fmt, joinLead } from "../../lib/format";
import { LeadTail } from "../provenance";

const MONTH = /^\d{4}-\d{2}$/;

/**
 * `iso` is a day (`2026-10-22`) or a month (`2025-11`). `lead`, the words before the date ("נכנס לתוקף ב־", "תעריפון מ־"), is bound to
 * it on one line; a maqaf lead writes its letter on a month said in words ("מנובמבר 2025") and keeps the maqaf before digits
 * ("מ־22.10.2026"; copy.md 10).
 */
export function When({ iso, lead }: { iso: string; lead?: string }) {
  const text = fmt.date(iso);
  const date = MONTH.test(iso) ? <bdi>{text}</bdi> : <bdi dir="ltr" className="tabular-nums">{text}</bdi>;
  return lead === undefined ? date : <LeadTail lead={joinLead(lead, text)}>{date}</LeadTail>;
}

/** The words of a date span (`DateSpanText`): the lead of one day ("נכון ל־"), the lead of the oldest of several ("נכון לימים ") and the word before the newest ("עד "). */
export interface DateSpanWords {
  one: string;
  from: string;
  to: string;
}

/**
 * The date beside figures from many records: their oldest and their newest (`dateSpan`), said once where they agree, so a list read over
 * several days never reads as all read on its newest day. `day` reads an item's ISO day; `renderDate` draws one item after its lead (a sourced
 * date's `NumAfter`, a read day's `When`), so each date opens what it opens on its page.
 */
export function DateSpanText<T>({ span, day, words, renderDate }: { span: DateSpan<T>; day: (x: T) => string; words: DateSpanWords; renderDate: (x: T, lead: string) => ReactNode }) {
  if (oneDay(span, day)) return <>{renderDate(span.to, words.one)}</>;
  return (
    <>
      {renderDate(span.from, words.from)} {renderDate(span.to, words.to)}
    </>
  );
}
