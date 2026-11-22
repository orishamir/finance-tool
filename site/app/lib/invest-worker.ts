// The index page's Web Worker (guidelines/code.md: work over about 50 ms on a phone slowed four times moves to one): it keeps the last two
// sets of data the page sent (the page's own and the one its last answer was worked out on) and answers each request, once, on the one it
// names with `work` (lib/invest-work.ts), one at a time, in the order they came. The page sends a request only when the one before it on
// the same channel has been answered (lib/invest-run.ts), so none waits behind work no one wants any more.
import { KEPT_DATA, work, type FromWorker, type ToWorker } from "./invest-work";
import type { IndicesBundle } from "./providers";

const data = new Map<number, IndicesBundle>();

const answer = (m: FromWorker) => self.postMessage(m);

// only the page's own client (lib/invest-run.ts) posts to this worker
self.addEventListener("message", (e: MessageEvent<ToWorker>) => {
  const m = e.data;
  if (m.bundle) {
    data.set(m.data, m.bundle);
    for (const n of data.keys()) if (data.size > KEPT_DATA) data.delete(n);
  }
  const bundle = data.get(m.data);
  // data let go before the request ran: the page asks again
  if (!bundle) return answer({ id: m.id, stale: true });
  try {
    answer({ id: m.id, answer: m.kind === "view" ? work.view(bundle, m.ask) : work.changes(bundle, m.ask) });
  } catch (error) {
    answer({ id: m.id, failed: error instanceof Error ? `${error.name}: ${error.message}` : String(error) });
  }
});
