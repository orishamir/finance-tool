// The notice every page shows when a script on it failed after it was drawn (lib/page-failure.ts): what may be wrong on the screen and
// how to recover. It stands at the foot of the window, over the page, so it is seen wherever the person is; closing it hides it until a
// page loads again (lib/page-failure.ts keeps that it was closed). It opens in the top layer (a `popover`), placed against the window, over
// whatever else is drawn. While a sheet is open it is drawn inside the sheet shown (Sheet.tsx, `where="sheet"`), not on the page: a sheet
// is a modal dialog, which makes everything outside it inert, a popover too, so a notice on the page would take no press. Inside the
// dialog, opened after it, it stands over the sheet, against the window still, never cut by a centred sheet's card.
import { useEffect, useRef, useSyncExternalStore } from "react";
import { system } from "../copy";
import { closeFailure, useFailureShown } from "../lib/page-failure";
import { anySheet, watchSheets } from "./sheet-stack";
import { Button, Callout } from "./kit";

/** `where`: on the page (the shell's, which stands aside while a sheet is open), or in the sheet shown. */
export function FailureNotice({ where }: { where: "page" | "sheet" }) {
  const shown = useFailureShown();
  const sheetOpen = useSyncExternalStore(watchSheets, anySheet, () => false);
  const box = useRef<HTMLDivElement>(null);
  const on = shown && !(where === "page" && sheetOpen);
  // opened after the sheet that holds it (the sheet opens its dialog in a layout effect, before this runs), so it is drawn over the sheet
  useEffect(() => {
    const el = box.current;
    if (on && el && typeof el.showPopover === "function" && !el.matches(":popover-open")) el.showPopover();
  }, [on]);
  if (!on) return null;
  return (
    <div
      ref={box}
      role="alert"
      popover="manual"
      // the top layer's own place and look are set aside: the foot of the window, across it
      className="fixed inset-x-0 top-auto bottom-0 m-0 h-auto w-auto max-w-none overflow-visible border-0 bg-transparent p-0 px-gutter pb-4 text-foreground"
    >
      <Callout tone="caution" title={system.pageFailed.title} className="mx-auto max-w-measure shadow-lg">
        <p>{system.pageFailed.line}</p>
        <div className="flex flex-wrap gap-x-6">
          <Button variant="quiet" flush onClick={() => window.location.reload()}>
            {system.pageFailed.reload}
          </Button>
          <Button variant="quiet" flush onClick={closeFailure}>
            {system.pageFailed.close}
          </Button>
        </div>
      </Callout>
    </div>
  );
}
