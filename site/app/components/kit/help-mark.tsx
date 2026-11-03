// A "?" beside a column head or a label (founder, 2026-11-03: "add some (?) tooltips ... only add tooltips when they actually add
// anything"). A tap opens the glossary card of one term, with its source, in the sheet every number opens: nothing hangs on hover,
// and the hit area is the 44 px target around a small mark. Use it only where the card says what the label leaves out.
import { help as copy } from "../../copy";
import { useOpen } from "../provenance";
import { cx } from "./cx";

export function HelpMark({ term, about, className }: { /** The glossary term's Hebrew name, as the page's provenance data keys it. */ term: string; /** What the mark explains, in the reader's words ("כסף מנוהל"): the button's spoken name. */ about: string; className?: string }) {
  const open = useOpen();
  return (
    <button
      type="button"
      aria-label={copy.markLabel.replace("{about}", about)}
      onClick={(e) => open({ kind: "term", id: term }, e.currentTarget)}
      className={cx("help-mark inline-flex items-center justify-center min-h-target min-w-target -my-3 -mx-3 align-middle shrink-0 text-muted-foreground hover:text-foreground", className)}
    >
      <span aria-hidden="true" className="inline-flex items-center justify-center size-4 rounded-full border border-current text-[11px] font-semibold leading-none">
        ?
      </span>
    </button>
  );
}
