// A "?" beside a column head or a label ("add some (?) tooltips ... only add tooltips when they actually add
// anything"). A tap opens the glossary card of one term, with its source, in the sheet every number opens: nothing hangs on hover,
// and the hit area is the 44 px target around a small mark. Use it only where the card says what the label leaves out.
// Without a term it opens a short text of its own, titled with what it explains (guidelines/design.md "Tables":
// a column's longer explanation goes in its "?", not in a sentence around the table); `rules` ends that text with the chip of the rules
// behind it, so a sentence moved from beside a table keeps its rules within reach.
// With `words` it is a quiet text action of those words before the mark ("מה זה ?"), for a name that heads a panel of its own, where a bare
// mark beside a heading would read as part of it. Its words carry it, so it is not a bare mark the layout check keeps beside its words
// (`.help-mark`).
import { help as copy } from "../../copy";
import { useOpen } from "../provenance";
import { cx } from "./cx";

export function HelpMark({ term, about, lead, text, rules, words, className }: { /** The glossary term's Hebrew name, as the page's provenance data keys it; several terms open one sheet of them all, titled `about` (a column of three fees). Leave it out for a text of its own (`text`). */ term?: string | readonly string[]; /** With no term: the explanation the sheet shows under `about`. */ text?: string; /** The rules behind the text (or the line under the terms): one chip at its end. */ rules?: readonly string[]; /** What the mark explains, in the reader's words ("כסף מנוהל"): the button's spoken name. */ about: string; /** With several terms, the line under the sheet's title. */ lead?: string; /** Words shown before the mark, in the link colour; the spoken name starts with them. */ words?: string; className?: string }) {
  const open = useOpen();
  const mark = (
    <span aria-hidden="true" className="inline-flex items-center justify-center size-[1.125rem] rounded-full border border-current text-[13px] font-semibold leading-none">
      ?
    </span>
  );
  return (
    <button
      type="button"
      aria-label={copy.markLabel.replace("{about}", about)}
      onClick={(e) => open(typeof term === "string" ? { kind: "term", id: term } : { kind: "terms", ids: term ?? [], name: about, lead: term ? lead : text, ...(rules?.length ? { rules } : {}) }, e.currentTarget)}
      className={cx(
        words
          ? "tap-area inline-flex items-center gap-1.5 shrink-0 rounded-md text-sm text-link hover:underline"
          : "help-mark inline-flex items-center justify-center min-h-target min-w-target -my-3 -mx-3 align-middle shrink-0 text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {words}
      {mark}
    </button>
  );
}
