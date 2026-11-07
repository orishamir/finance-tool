// A choice that changed something else too (2026-11-05, issue 190, the indices page: a fund picked at an account that cannot price it moved
// the account, with nothing near the row to say so). Said where the person tapped, with the way back to what was there before the tap.
// The way back is a 44 px target that takes no more height than the words beside it, so the note never grows its row. The target is a
// layer around the words, not a margin pulled in: a way back wrapped onto two lines in a narrow cell was drawn over the note (#190, 390 px).
import type { MouseEvent, ReactNode } from "react";
import { cx } from "./cx";

/** `what`: what changed without being tapped. `back`: the way back's words. `stack`: the way back on a line of its own, at the end (a narrow cell). */
export function AlsoChanged({ what, back, onBack, stack = false, className }: { what: ReactNode; back: string; onBack: (e: MouseEvent<HTMLButtonElement>) => void; stack?: boolean; className?: string }) {
  return (
    <span className={cx("text-foreground", stack ? "flex flex-col items-end" : "inline", className)}>
      <span>{what}</span>
      {stack ? null : " "}
      <button type="button" onClick={onBack} className={cx("relative rounded-md px-1 text-link underline underline-offset-[3px] hover:no-underline transition-colors duration-[var(--duration-fast)]", "text-start before:absolute before:inset-x-0 before:-inset-y-3")}>
        {back}
      </button>
    </span>
  );
}
