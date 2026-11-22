// The notice every page shows when a script on it failed after it was drawn (lib/page-failure.ts): what may be wrong on the screen and
// how to recover. It stands at the foot of the window, over the page, so it is seen wherever the person is; closing it hides it until a
// page loads again (lib/page-failure.ts keeps that it was closed).
import { system } from "../copy";
import { closeFailure, useFailureShown } from "../lib/page-failure";
import { Button, Callout } from "./kit";

export function FailureNotice() {
  const shown = useFailureShown();
  if (!shown) return null;
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
