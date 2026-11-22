// A promise an event handler or an effect starts and nothing awaits. Its failure is reported as an uncaught exception (`reportError`): the
// browser logs it and the page-wide handler for `error` shows that something broke, so it never passes in silence (guidelines/code.md,
// "A failure never leaves wrong figures on screen in silence").

/** Lets `p` run and reports its failure. `p` may be the nothing React Router's `navigate` returns where it has no navigation to wait for. */
export function inBackground(p: Promise<unknown> | void): void {
  if (p) p.catch((e: unknown) => reportError(e));
}

/** An event handler that runs `fn`, which returns a promise: the handler itself returns nothing, and `fn`'s failure is reported. */
export function handler<A extends unknown[]>(fn: (...args: A) => Promise<unknown>): (...args: A) => void {
  return (...args) => inBackground(fn(...args));
}
