// A choice that changed something else too (the indices page: a fund picked at an account that cannot price it moved
// the account, with nothing near the row to say so). Said where the person tapped, with the way back to what was there before the tap.
// The way back is the inline Button: a 44 px target that takes no more height than the words beside it, so the note never grows its row.
import type { MouseEvent, ReactNode } from "react";
import { Button } from "./button";
import { cx } from "./cx";

/** `what`: what changed without being tapped. `back`: the way back's words. `stack`: the way back on a line of its own, at the end (a narrow cell). */
export function AlsoChanged({ what, back, onBack, stack = false, className }: { what: ReactNode; back: string; onBack: (e: MouseEvent<HTMLButtonElement>) => void; stack?: boolean; className?: string }) {
  return (
    <span className={cx("text-foreground", stack ? "flex flex-col items-end" : "inline", className)}>
      <span>{what}</span>
      {stack ? null : " "}
      <Button variant="inline" onClick={onBack}>
        {back}
      </Button>
    </span>
  );
}
