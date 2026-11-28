// A "?" beside a column head or a label ("add some (?) tooltips ... only add tooltips when they actually add
// anything"). A tap opens the glossary card of one term, with its source, in the sheet every number opens: nothing hangs on hover,
// and the hit area is the 44 px target around a small mark (`tap-wide`), drawn around the mark rather than taking room on the line, so
// the mark stands as close to its words as a space. Use it only where the card says what the label leaves out.
// Without a term it opens a short text of its own, titled with what it explains (guidelines/design.md "Tables":
// a column's longer explanation goes in its "?", not in a sentence around the table); `rules` ends that text with the chip of the rules
// behind it, so a sentence moved from beside a table keeps its rules within reach.
// With `words` it is a quiet text action of those words before the mark ("מה זה ?"), for a name that heads a panel of its own, where a bare
// mark beside a heading would read as part of it. Its words carry it, so it is not a bare mark the layout check keeps beside its words
// (`.help-mark`).
// `tone="caution"` draws the mark in the caution role: what it opens holds a catch about the figures under it (what a child-savings fee
// figure is not), where the label stays as it is; the colour is said again by the sheet's own words.
// `note` draws "!" instead of "?": what it opens is not what the label means but a fact added to the figure (what a total rests on).
// `CatchMark` is the same caution "?" after a calculated figure that carries a catch (provenance `catchesOf`): it opens the catch's sheet.
import type { ReactNode } from "react";
import { help as copy } from "../../copy";
import { useOpen, type Item } from "../provenance";
import { cx } from "./cx";

/** The mark's own circle, the same in every "?" and "!". */
const Dot = ({ children }: { children: ReactNode }) => (
  <span aria-hidden="true" className="inline-flex items-center justify-center size-3.5 rounded-full border border-current/40 text-[0.625rem] font-medium leading-none">
    {children}
  </span>
);

/** The "?" drawn as a line, not a letter: a calculated figure's mark stands inside charts, where every letter is text a reader must read at
 *  13 px (charts.md); a mark is read by its shape, as the caution and clock icons are, and keeps the look of the letter's "?". */
const QuestionGlyph = () => (
  <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 8.5a4 4 0 1 1 5.6 3.7c-1 .5-1.6 1.4-1.6 2.5v.6" />
    <path d="M12 20.2h.01" />
  </svg>
);

/** A bare mark's look: the 44 px target around a small circle, in the muted or the caution role. */
const markLook = (tone: "caution" | undefined) => cx("help-mark tap-wide inline-flex items-center justify-center align-middle shrink-0 rounded-full", tone === "caution" ? "text-caution hover:text-caution-foreground" : "text-muted-foreground hover:text-foreground");

export function HelpMark({ term, about, lead, text, rules, words, tone, note, className }: { /** The glossary term's Hebrew name, as the page's provenance data keys it; several terms open one sheet of them all, titled `about` (a column of three fees). Leave it out for a text of its own (`text`). */ term?: string | readonly string[]; /** With no term: the explanation the sheet shows under `about`. */ text?: string; /** The rules behind the text (or the line under the terms): one chip at its end. */ rules?: readonly string[]; /** What the mark explains, in the reader's words ("כסף מנוהל"): the button's spoken name. */ about: string; /** With several terms, the line under the sheet's title. */ lead?: string; /** Words shown before the mark, in the link colour; the spoken name starts with them. */ words?: string; /** `caution`: the mark in the caution role, for a "?" that holds a catch about the figures it explains. */ tone?: "caution"; /** "!" in place of "?": the sheet adds a fact about the figure rather than explaining the label. */ note?: boolean; className?: string }) {
  const open = useOpen();
  const mark = <Dot>{note ? "!" : "?"}</Dot>;
  return (
    <button
      type="button"
      aria-label={(note ? copy.noteLabel : copy.markLabel).replace("{about}", about)}
      onClick={(e) => open(typeof term === "string" ? { kind: "term", id: term } : { kind: "terms", ids: term ?? [], name: about, lead: term ? lead : text, ...(rules?.length ? { rules } : {}) }, e.currentTarget)}
      className={cx(
        words ? "tap-area inline-flex items-center gap-1.5 shrink-0 rounded-md text-sm text-link hover:underline" : markLook(tone),
        className,
      )}
    >
      {words}
      {mark}
    </button>
  );
}

/**
 * The caution "?" after a calculated figure that carries a catch: it opens the catch's sheet (`item`, a provenance "catch" item), which says
 * only what the catch is. The figure holds it on its line, so it never stands alone (provenance `Num`). The same mark says once the catches
 * every figure of a list carries, in their column's head or above the list (a "list-catch" item, provenance `ListCatchMark`).
 * `data-catch` names the kinds of catch it opens, and `data-catch-list` marks a list's, for the scripts that count them over the built pages.
 */
export function CatchMark({ item, about, className }: { item: Item; /** What the figure is (its `about`, else its text), or what the list's figures are: the button's spoken name. */ about: string; className?: string }) {
  const open = useOpen();
  const catches = item.kind === "catch" || item.kind === "list-catch" ? item.catches : [];
  return (
    <button type="button" aria-label={copy.catchLabel.replace("{about}", about)} data-catch={catches.length ? [...new Set(catches.map((c) => c.kind))].join(" ") : undefined} data-catch-list={item.kind === "list-catch" ? "" : undefined} onClick={(e) => open(item, e.currentTarget)} className={cx(markLook("caution"), className)}>
      <Dot>
        <QuestionGlyph />
      </Dot>
    </button>
  );
}

/** Words that end with a "?" (`mark`, a `HelpMark`): the last word and the mark on one line, so the mark never stands on a line of its own
 *  when the words wrap (a title, a label in a narrow column). */
export function HeldMark({ words, mark }: { words: string; mark: ReactNode }) {
  const cut = words.lastIndexOf(" ") + 1;
  return (
    <>
      {words.slice(0, cut)}
      <span className="whitespace-nowrap">
        {words.slice(cut)} {mark}
      </span>
    </>
  );
}
