// The notice every page shows when a script on it failed after it was drawn (lib/page-failure.ts): what may be wrong on the screen and
// how to recover. It stands at the foot of the window, over the page, so it is seen wherever the person is; closing it hides it until a
// page loads again (lib/page-failure.ts keeps that it was closed). While a sheet is open the notice is drawn in the sheet shown (Sheet.tsx,
// `where="sheet"`), not on the page: a sheet is a modal dialog in the top layer, which covers the page and makes it inert, so a notice on
// the page would be hidden under it and its buttons would take no press.
import { useSyncExternalStore } from "react";
import { system } from "../copy";
import { closeFailure, useFailureShown } from "../lib/page-failure";
import { anySheet, watchSheets } from "./sheet-stack";
import { Button, Callout } from "./kit";

/** `where`: on the page (the shell's, which stands aside while a sheet is open), or in the sheet shown. */
export function FailureNotice({ where }: { where: "page" | "sheet" }) {
  const shown = useFailureShown();
  const sheetOpen = useSyncExternalStore(watchSheets, anySheet, () => false);
  if (!shown || (where === "page" && sheetOpen)) return null;
  return (
    <div role="alert" className="fixed inset-x-0 bottom-0 z-[var(--z-sticky)] px-gutter pb-4">
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
