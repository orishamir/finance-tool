// A short explanation of the page's own, in a sheet: a title and a body that may hold figures, each opening its own sheet as a figure does.
// `OwnSheet` is the sheet itself, opened from whatever the caller draws (a receipt line's name); `MarkSheet` is a line of words with a small
// "?" after them that opens one, for a line about the reader's own figures whose explanation is neither a glossary card (`Term`) nor a text
// with no figures (`HelpMark`'s). The words stay plain; only the mark acts.
import { useId, useState, type ReactNode } from "react";
import { Sheet } from "../Sheet";
import { MarkButton } from "./help-mark";

/** The sheet: `title` heads it, `body` under it; open while `anchor`, what opened it, is set. */
export function OwnSheet({ anchor, onClose, title, children }: { anchor: HTMLElement | null; onClose: () => void; title: ReactNode; children: ReactNode }) {
  const id = useId();
  return (
    <Sheet open={anchor !== null} onClose={onClose} anchor={anchor} pc="popover" height={70} labelledBy={id}>
      {anchor && (
        <div className="flex flex-col gap-3 text-start">
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
 * Words with a "?" after them that opens a sheet of their own (`OwnSheet`), the mark kept on the line of the last word (a no-break space
 * before it), so it never stands on a line of its own when the words wrap. The body is drawn only while the sheet is open, so what its
 * components read is worked out only then.
 */
export function MarkSheet({ title, about, body, children, className }: { title: ReactNode; /** What the mark explains, in the reader's words: the button's spoken name. */ about: string; /** The sheet's text under its title. */ body: ReactNode; children: ReactNode; className?: string }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <span className={className}>
      {children}
      {"\u00a0"}
      <MarkButton about={about} open={anchor !== null} onOpen={setAnchor} />
      <OwnSheet anchor={anchor} onClose={() => setAnchor(null)} title={title}>
        <div className="flex flex-col gap-2.5 max-w-measure">{body}</div>
      </OwnSheet>
    </span>
  );
}
