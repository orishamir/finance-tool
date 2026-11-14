// What the fee page says under its bar (method §10.6): for a screen reader, what the undo line says, else what the page just did; a saved
// deal's undo line; what the bar's end just did (a price list opened a new deal), for as long as an undo line stays or until it is closed;
// and the link to copy by hand where the browser would not copy it.
import { useEffect, useState, type ReactNode } from "react";
import { feeDeal as copy } from "../../copy";
import { Button } from "../kit";
import { UNDO_MS } from "./use-undo";

/** What the bar's end just did, said for as long as an undo line stays (`UNDO_MS`), or until it is closed (`setSaid(null)`). */
export function useSaid() {
  const [said, setSaid] = useState<string | null>(null);
  useEffect(() => {
    if (!said) return;
    const t = window.setTimeout(() => setSaid(null), UNDO_MS);
    return () => window.clearTimeout(t);
  }, [said]);
  return { said, setSaid };
}

/**
 * The notices: `status` the live region's words (the undo line's, else `said`, else that the link was copied), `undoLine` a saved deal's
 * undo line, `said` with its close (`onDismiss`), and `blocked` the link the browser would not copy.
 */
export function DealNotices({ status, undoLine, said, blocked, onDismiss }: { status: string; undoLine: ReactNode; said: string | null; blocked: string | null; onDismiss: () => void }) {
  return (
    <>
      <p role="status" className="sr-only">
        {status}
      </p>
      {undoLine}
      {(said || blocked) && (
        <div className="come-in flex flex-col gap-1.5 text-sm">
          {said && (
            <p className="flex flex-wrap items-center gap-x-3">
              <span>{said}</span>
              <Button variant="quiet" size="sm" flush wide onClick={onDismiss}>
                {copy.end.dismiss}
              </Button>
            </p>
          )}
          {blocked && (
            <>
              <p className="text-muted-foreground">{copy.end.copyBlocked}</p>
              <textarea readOnly dir="ltr" rows={2} aria-label={copy.end.linkField} value={blocked} onFocus={(e) => e.currentTarget.select()} className="w-full rounded-md border border-input bg-card p-3 font-mono text-base select-all" />
            </>
          )}
        </div>
      )}
    </>
  );
}
