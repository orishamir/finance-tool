// A short explanation of the page's own, in a sheet: a title and a body that may hold figures, each opening its own sheet as a figure does.
// `OwnSheet` is the sheet itself, opened from whatever the caller draws (a receipt line's name); `WordsSheet` is words in running text that
// open one, drawn as a glossary term is (`.term`, the dotted grey underline, teal under a computer's pointer, on focus and while open), for
// a line about the reader's own figures whose explanation is neither a glossary card (`Term`) nor a text with no figures (`HelpMark`'s).
import { useId, useState, type ReactNode } from "react";
import { Sheet } from "../Sheet";
import { cx } from "./cx";

/** The sheet: `title` heads it, `body` under it; open while `anchor`, what opened it, is set. */
export function OwnSheet({ anchor, onClose, title, children }: { anchor: HTMLElement | null; onClose: () => void; title: ReactNode; children: ReactNode }) {
  const id = useId();
  return (
    <Sheet open={anchor !== null} onClose={onClose} anchor={anchor} pc="popover" height={70} labelledBy={id}>
      {anchor && (
        <div className="flex flex-col gap-3">
          <h2 id={id} className="text-lg font-semibold">
            {title}
          </h2>
          {children}
        </div>
      )}
    </Sheet>
  );
}

/**
 * Words that open a sheet of their own (`OwnSheet`): a button drawn as a glossary term. The words wrap with the line they stand in (a
 * glossary term keeps to one line; these may be a whole line on a narrow phone). The body is drawn only while the sheet is open, so what
 * it reads is worked out only then.
 */
export function WordsSheet({ title, body, children, className }: { title: ReactNode; /** The sheet's text under its title, as a function, so it is worked out only when opened. */ body: () => ReactNode; children: ReactNode; className?: string }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <button type="button" aria-haspopup="dialog" aria-expanded={anchor !== null} onClick={(e) => setAnchor(e.currentTarget)} className={cx("term whitespace-normal", className)}>
        {children}
      </button>
      <OwnSheet anchor={anchor} onClose={() => setAnchor(null)} title={title}>
        {anchor && <div className="flex flex-col gap-2.5 max-w-measure">{body()}</div>}
      </OwnSheet>
    </>
  );
}
