// The index page's Web Worker (guidelines/code.md: work over about 50 ms on a phone slowed four times moves to one): it keeps the last two
// sets of data the page sent (the page's own and the one its last answer was worked out on) and answers each request, once, on the one it
// names with `work` (lib/invest-work.ts), one at a time, in the order they came. The page sends a request only when the one before it on
// the same channel has been answered (lib/invest-run.ts), so none waits behind work no one wants any more.
import { KEPT_DATA, work, type FromWorker, type ToWorker, type WorkKind, type Works } from "./invest-work";
import type { IndicesBundle } from "./providers";

const data = new Map<number, IndicesBundle>();

const answer = (m: FromWorker) => self.postMessage(m);

/** A request's work, by its kind (`work` holds one for every kind). */
const workOf = <K extends WorkKind>(bundle: IndicesBundle, m: { kind: K; ask: Works[K]["ask"] }): Works[K]["answer"] => work[m.kind](bundle, m.ask);

// only the page's own client (lib/invest-run.ts) posts to this worker
self.addEventListener("message", (e: MessageEvent<ToWorker>) => {
  const m = e.data;
  if (m.bundle) {
    data.set(m.data, m.bundle);
    for (const n of data.keys()) if (data.size > KEPT_DATA) data.delete(n);
  }
  try {
    const bundle = data.get(m.data);
    if (!bundle) throw new Error(`the worker holds no data numbered ${m.data}: the page keeps the same ${KEPT_DATA} latest it sent`);
    answer({ id: m.id, answer: workOf(bundle, m) });
  } catch (error) {
    answer({ id: m.id, failed: error instanceof Error ? `${error.name}: ${error.message}` : String(error) });
  }
});
