// A product's or company's name inside a Hebrew line. A name with Hebrew in it is laid out right to left whatever letter it starts with:
// a plain <bdi> takes its direction from the first letter, so "MTF סל (4D) S&P 500" was laid out left to right and read
// "S&P 500 (4D) סל MTF" from the right (2026-11-05). A name with no Hebrew keeps its own direction.
import { cx } from "./cx";
import { GERSHAYIM, gershayim } from "../../lib/format";
export { gershayim };

const HEBREW = /[֐-׿]/;

// An index's name and its number never part at a line's end: "S&P" ended one line and "500" began the next, beside a fund's security
// number on a phone or alone under the name (fourth pass). A no-break space joins a Latin word to the number after it.
const LATIN_NUMBER = /([A-Za-z&]+) (\d)/g;
/** The name as drawn: an index's name kept with its number. */
export const keepIndexWhole = (name: string) => name.replace(LATIN_NUMBER, "$1\u00a0$2");

// A Latin run inside a Hebrew line ("MSCI AC World (4A) ETF") broken at a line's end is drawn with its end at the start of the next line
// and its start at the end of the one before: readers took "ETF" for a word of the next line (fresh readers, round 3, 2026-11-07).
const LATIN_RUN = /[A-Za-z][\w&.'()-]*(?: [\w&.'()-]+)+/g;
// a fund's name quoted in a Hebrew title is laid out right to left on its own: its closing quote after a number ("ת״א 35") was drawn before
// the number, so the name read "35 KTF (4A) ת״א" with the "35" thrown to its far end (fresh readers, round 3, 2026-11-07)
const QUOTED = /"([^"]+)"/g;
/** A document's Hebrew title as drawn: each Latin run, up to 40 characters, on one line, a gershayim written as one, and a quoted name isolated. */
export const keepTitleWhole = (title: string) =>
  HEBREW.test(title)
    ? title
        .replace(GERSHAYIM, "\u05f4")
        .replace(LATIN_RUN, (run) => (run.length <= 40 ? run.replace(/ /g, "\u00a0") : run))
        .replace(QUOTED, (_, name: string) => (HEBREW.test(name) ? `\u2067"${name}"\u2069` : `"${name}"`))
    : title;

/** `children` is the name; `show` replaces what is drawn (the name with an icon held to it) while the name sets the direction. */
export function MixedName({ children, show, className }: { children: string; show?: React.ReactNode; className?: string }) {
  return (
    <bdi dir={HEBREW.test(children) ? "rtl" : undefined} className={className}>
      {show ?? keepIndexWhole(gershayim(children))}
    </bdi>
  );
}

/**
 * A name on a line or two of its own that may be cut (`className` sets the cut: `truncate`, `line-clamp-2`): laid out in its own
 * direction, so the cut falls at the end of the name in reading order and its start, the brand, always shows, aligned with the Hebrew
 * around it (in a Hebrew line the cut took the start of "iShares Core S&P 500 UCITS ETF", the very word that tells two funds apart).
 */
export function NameLine({ children, className }: { children: string; className?: string }) {
  const rtl = HEBREW.test(children);
  return (
    <span dir={rtl ? "rtl" : "ltr"} className={cx("block", rtl ? "text-start" : "text-end", className)}>
      {keepIndexWhole(gershayim(children))}
    </span>
  );
}
