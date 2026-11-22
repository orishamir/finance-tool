// How the index page asks for its heavy work (lib/invest-work.ts): in a Web Worker (lib/invest-worker.ts) wherever the browser has one, so
// no task on the page waits for it, and in place where there is none (the tests, the build). Each hook is a channel of its own: it shows the
// last answer it got until the next one comes, its answer renders in a transition, which React splits into short tasks, and a newer request
// replaces one not yet sent, so the worker never works on a plan no one is looking at any more. An answer is a structured clone: its fund
// records and its index are put back as the page's own objects, and it comes with the data and the request it was worked out on, so what
// the page shows beside it reads the same plan.
import { startTransition, useEffect, useMemo, useState } from "react";
import { KEPT_DATA, work, type FromWorker, type PlanChanges, type WorkKind, type Works } from "./invest-work";
import type { InvestView } from "./invest";
import type { IndicesBundle } from "./providers";

/** A request, with the data it is on: kept as one object while neither changes, since a new object is a new request. */
export type Asked<K extends WorkKind> = { bundle: IndicesBundle; ask: Works[K]["ask"] };
/** An answer, with the data and the request it was worked out on. */
type Got<K extends WorkKind> = Asked<K> & { answer: Works[K]["answer"] };
/** What a channel holds: an answer, or the error the work threw (thrown again where the page renders it, for its error boundary). */
export type Held<K extends WorkKind> = Got<K> | { failed: string };

/** The answer as the page reads it: the fund records and the index are the page's own objects, as an answer worked out in place has them. */
export const relink: { [K in WorkKind]: (got: Got<K>) => Got<K> } = {
  view: (got) => {
    const recs = new Map(got.bundle.funds.map((f) => [f.id, f]));
    for (const o of got.answer.options) for (const f of o.funds) f.rec = recs.get(f.rec.id) ?? f.rec;
    got.answer.index = got.ask.index;
    return got;
  },
  changes: (got) => (got.answer ? { ...got, answer: { ...got.answer, plan: got.ask.plan, shares: got.ask.shares } } : got),
};

const inPlace = <K extends WorkKind>(kind: K, a: Asked<K>): Got<K> => ({ ...a, answer: work[kind](a.bundle, a.ask) });

/** One request on its way, or waiting for the one before it: `live` until a newer one or the page's leaving replaces it. */
export type Job<K extends WorkKind> = Asked<K> & { live: boolean; done: (held: Held<K>) => void };

/** Whether this browser runs Web Workers (the tests and the build have none). */
const HAS_WORKER = typeof Worker !== "undefined";

export type Client = { post: <K extends WorkKind>(kind: K, job: Job<K>, reply: (m: FromWorker) => void) => void };
/** The page's worker, started on the first request. */
let client: Client | undefined;

function clientOf(): Client {
  if (client) return client;
  const worker = new Worker(new URL("./invest-worker.ts", import.meta.url), { type: "module" });
  const waiting = new Map<number, (m: FromWorker) => void>();
  // the data the worker keeps, as it keeps it: the latest KEPT_DATA sent
  const sent: { bundle: IndicesBundle; n: number }[] = [];
  let id = 0;
  let n = 0;
  worker.addEventListener("message", (e: MessageEvent<FromWorker>) => {
    const reply = waiting.get(e.data.id);
    waiting.delete(e.data.id);
    reply?.(e.data);
  });
  // a worker that cannot start or run (a script that does not load): every request answers as failed, and the page's error boundary says so
  let broken: string | null = null;
  worker.addEventListener("error", (e) => {
    broken = `the index page's worker failed: ${e.message}`;
    for (const [i, reply] of waiting) reply({ id: i, failed: broken });
    waiting.clear();
  });
  // the data's number, and the data itself where the worker does not keep it
  const dataOf = (bundle: IndicesBundle): { data: number; bundle?: IndicesBundle } => {
    const kept = sent.find((s) => s.bundle === bundle);
    if (kept) return { data: kept.n };
    n += 1;
    sent.push({ bundle, n });
    if (sent.length > KEPT_DATA) sent.shift();
    return { data: n, bundle };
  };
  return (client = {
    post: (kind, job, reply) => {
      id += 1;
      if (broken) {
        const failed = { id, failed: broken };
        queueMicrotask(() => reply(failed));
        return;
      }
      waiting.set(id, reply);
      worker.postMessage({ id, ...dataOf(job.bundle), kind, ask: job.ask });
    },
  });
}

/** A channel's requests: one with the worker at a time, and the newest of those that came meanwhile next. */
export function channelOf<K extends WorkKind>(kind: K) {
  let busy = false;
  let next: Job<K> | null = null;
  const send = (job: Job<K>, c: Client) => {
    busy = true;
    c.post(kind, job, (m) => {
      busy = false;
      // the worker's answer is this channel's kind: it answered the request this channel sent
      if (job.live) job.done("failed" in m ? { failed: m.failed } : relink[kind]({ bundle: job.bundle, ask: job.ask, answer: m.answer as Works[K]["answer"] }));
      const after = next;
      next = null;
      if (after) send(after, c);
    });
  };
  return {
    ask(job: Job<K>, c: Client) {
      if (busy) next = job;
      else send(job, c);
    },
    drop(job: Job<K>) {
      job.live = false;
      if (next === job) next = null;
    },
  };
}

/** The last answer to `asked` (null while it is null, and until the first answer comes), from the worker. */
function useWork<K extends WorkKind>(kind: K, asked: Asked<K> | null): Got<K> | null {
  const [channel] = useState(() => channelOf(kind));
  const [held, setHeld] = useState<Held<K> | null>(null);
  // no worker: every request is worked out where it is asked, as the page did before it had one
  const here = useMemo(() => (!HAS_WORKER && asked ? inPlace(kind, asked) : null), [kind, asked]);
  useEffect(() => {
    if (!HAS_WORKER || !asked) return;
    const job: Job<K> = { ...asked, live: true, done: (h) => startTransition(() => setHeld(h)) };
    channel.ask(job, clientOf());
    return () => channel.drop(job);
  }, [asked, channel]);
  if (held && "failed" in held) throw new Error(held.failed);
  return asked ? (here ?? held) : null;
}

/** The index page's view of the plan on the index (`buildInvest`), with the data, the index and the plan it was worked out on; null until the first answer. */
export function useInvestView(asked: Asked<"view"> | null): { view: InvestView; bundle: IndicesBundle; index: InvestView["index"]; plan: Asked<"view">["ask"]["plan"] } | null {
  const got = useWork("view", asked);
  return useMemo(() => got && { view: got.answer, bundle: got.bundle, index: got.ask.index, plan: got.ask.plan }, [got]);
}

/**
 * F-89 and F-90 on the pair the page prices: `waiting` until the first answer comes, then the last answer, and whether it is for the pair
 * asked now; null where nothing is asked or the pair has no value left. An answer for another pair (the one picked before) is `held`: the
 * page shows it dimmed, never as the new pair's, until the new pair's answer comes.
 */
export function usePlanChangesRun(asked: Asked<"changes"> | null): { run: PlanChanges; held: boolean } | "waiting" | null {
  const got = useWork("changes", asked);
  return useMemo(() => {
    if (!asked) return null;
    if (!got) return "waiting";
    return got.answer && { run: got.answer, held: !forPair(got.answer, asked.ask) };
  }, [got, asked]);
}

/** Whether an answer was worked out for the pair a request asks about: the same index, house (or group's account) and fund. */
export const forPair = (run: PlanChanges, ask: Asked<"changes">["ask"]): boolean => run.index === ask.index.id && run.house === ask.house && run.fund === ask.fund;
