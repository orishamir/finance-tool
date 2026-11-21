// Whether a script on the page failed after it was drawn: an exception nothing caught (`error`) or a promise nothing handled
// (`unhandledrejection`). An exception a tool's error boundary catches never reaches here; the boundary says it in place. Listening
// starts when this module loads in the browser, so a failure before the first render counts too.
import { useSyncExternalStore } from "react";

let failed = false;
const listeners = new Set<() => void>();

function fail(): void {
  if (failed) return;
  failed = true;
  for (const on of listeners) on();
}

if (typeof window !== "undefined") {
  // an error event with no exception behind it is the browser's own (a resize loop) or a script from another site: not the page's
  window.addEventListener("error", (e) => {
    if (e.error != null) fail();
  });
  window.addEventListener("unhandledrejection", () => fail());
}

function subscribe(on: () => void): () => void {
  listeners.add(on);
  return () => void listeners.delete(on);
}

/** True once a script on the page has failed; false on the pre-rendered page. */
export function usePageFailed(): boolean {
  return useSyncExternalStore(subscribe, () => failed, () => false);
}
