// Whether a script of the site failed on the page after it was drawn: an exception nothing caught (`error`) or a promise nothing handled
// (`unhandledrejection`), and whether the person closed the notice that says so. An exception a tool's error boundary catches never reaches
// here; the boundary says it in place. Listening starts when this module loads in the browser, so a failure before the first render counts
// too. Both facts live here, not in the notice, so a closed notice stays closed while the person moves between the site's pages, until a
// page loads again.
import { useSyncExternalStore } from "react";

type State = { failed: boolean; closed: boolean };
let state: State = { failed: false, closed: false };
const listeners = new Set<() => void>();

function set(next: Partial<State>): void {
  state = { ...state, ...next };
  for (const on of listeners) on();
}

function fail(): void {
  if (!state.failed) set({ failed: true });
}

/** Hides the notice until the page loads again. */
export function closeFailure(): void {
  if (!state.closed) set({ closed: true });
}

/**
 * Whether an uncaught exception is the site's: thrown in a script under its own origin and base path (`own`). A browser extension's
 * script file, another site's and the browser's own errors (a resize loop, with no address) are not the page's, and raise no notice. A
 * script an extension writes into the page inline is reported under the page's own address, so its exception counts as the site's.
 */
export const isOwnError = (filename: unknown, own: string): boolean => typeof filename === "string" && filename.startsWith(own);

/**
 * Whether an unhandled rejection is the site's: a rejection carries no address of its own, but its stack names the scripts it ran through.
 * A rejection with no stack is not counted: Safari's native errors (a failed fetch, a refused storage call) often carry none, so one of
 * the site's own rejections there raises no notice.
 */
export function isOwnRejection(reason: unknown, own: string): boolean {
  const stack: unknown = reason instanceof Error ? reason.stack : undefined;
  return typeof stack === "string" && stack.includes(own);
}

if (typeof window !== "undefined") {
  const own = `${window.location.origin}${import.meta.env.BASE_URL}`;
  window.addEventListener("error", (e) => {
    if (isOwnError(e.filename, own)) fail();
  });
  window.addEventListener("unhandledrejection", (e) => {
    if (isOwnRejection(e.reason, own)) fail();
  });
}

function subscribe(on: () => void): () => void {
  listeners.add(on);
  return () => void listeners.delete(on);
}

/** True once a script of the site has failed on the page and the person has not closed the notice. */
const failureShown = (): boolean => state.failed && !state.closed;

/** `failureShown` as a component reads it; false on the pre-rendered page. */
export function useFailureShown(): boolean {
  return useSyncExternalStore(subscribe, failureShown, () => false);
}
