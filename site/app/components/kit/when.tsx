// A date inside Hebrew text (2026-11-07): a day is isolated left to right (`22.10.2026`); a month a document prints alone is said in words,
// in the text's own direction (`נובמבר 2025`), never with an invented first day. Every date a page writes in its text goes through it.
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
