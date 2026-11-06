// A product's or company's name inside a Hebrew line. A name with Hebrew in it is laid out right to left whatever letter it starts with:
// a plain <bdi> takes its direction from the first letter, so "MTF סל (4D) S&P 500" was laid out left to right and read
// "S&P 500 (4D) סל MTF" from the right (2026-11-05). A name with no Hebrew keeps its own direction.
import { cx } from "./cx";

const HEBREW = /[֐-׿]/;

// An index's name and its number never part at a line's end: "S&P" ended one line and "500" began the next, beside a fund's security
// number on a phone or alone under the name (#190, fourth pass). A no-break space joins a Latin word to the number after it.
const LATIN_NUMBER = /([A-Za-z&]+) (\d)/g;
/** The name as drawn: an index's name kept with its number. */
export const keepIndexWhole = (name: string) => name.replace(LATIN_NUMBER, "$1\u00a0$2");

/** `children` is the name; `show` replaces what is drawn (the name with an icon held to it) while the name sets the direction. */
export function MixedName({ children, show, className }: { children: string; show?: React.ReactNode; className?: string }) {
  return (
    <bdi dir={HEBREW.test(children) ? "rtl" : undefined} className={className}>
      {show ?? keepIndexWhole(children)}
    </bdi>
  );
}

/**
 * A name on a line or two of its own that may be cut (`className` sets the cut: `truncate`, `line-clamp-2`): laid out in its own
 * direction, so the cut falls at the end of the name in reading order and its start, the brand, always shows, aligned with the Hebrew
 * around it (#190: in a Hebrew line the cut took the start of "iShares Core S&P 500 UCITS ETF", the very word that tells two funds apart).
 */
export function NameLine({ children, className }: { children: string; className?: string }) {
  const rtl = HEBREW.test(children);
  return (
    <span dir={rtl ? "rtl" : "ltr"} className={cx("block", rtl ? "text-start" : "text-end", className)}>
      {keepIndexWhole(children)}
    </span>
  );
}
