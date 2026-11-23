// The date beside a bank's rates: the "נכון ליום" of the records they come from, one day, or the oldest and the newest where the records
// are of several days, each opening its own record's source.
import { oneDay, type DateSpan } from "../../lib/date-span";
import type { SiteValue } from "../../lib/value";
import { Num, NumAfter } from "../provenance";

/** `words`: the lead of one day ("נכון ל־"), the lead of the oldest of several ("נכון לימים ") and the word before the newest ("עד "). */
export function AsOfDates({ span, words }: { span: DateSpan<SiteValue>; words: { one: string; from: string; to: string } }) {
  if (oneDay(span, (v) => String(v.value))) return <NumAfter lead={words.one} value={span.to} />;
  return (
    <>
      <NumAfter lead={words.from} value={span.from} /> {words.to}
      <Num value={span.to} />
    </>
  );
}
