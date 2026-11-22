// How the index page asks for its heavy work (lib/invest-work.ts): in a Web Worker (lib/invest-worker.ts) wherever the browser has one, so
// no task on the page waits for it, and in place where there is none (the tests, the build) or where it fails twice (`makeClient`). Each hook is a channel of its own: it shows the
// last answer it got until the next one comes, its answer renders in a transition, which React splits into short tasks, and a newer request
// replaces one not yet sent, so the worker never works on a plan no one is looking at any more. An answer is a structured clone: its fund
// records and its index are put back as the page's own objects, and it comes with the data and the request it was worked out on, so what
// the page shows beside it reads the same plan.
import { startTransition, useEffect, useMemo, useState } from "react";
import { KEPT_DATA, work, type FromWorker, type PlanChanges, type WorkKind, type Works } from "./invest-work";
import type { InvestView } from "./invest";
import type { IndicesBundle } from "./providers";

/**
 * A request, with the data it is on: kept as one object while neither changes, since a new object is a new request. The page may keep more
 * beside them, which stays on the page and comes back with the answer.
 */
export type Asked<K extends WorkKind> = { bundle: IndicesBundle; ask: Works[K]["ask"] };
/** An answer, with the request it was worked out on, as the page passed it. */
type Got<K extends WorkKind, A extends Asked<K>> = { asked: A; answer: Works[K]["answer"] };
/** What a channel holds: an answer, or the error the work threw (thrown again where the page renders it, for its error boundary). */
export type Held<K extends WorkKind, A extends Asked<K> = Asked<K>> = Got<K, A> | { failed: string };

/** The answer as the page reads it: the fund records and the index are the page's own objects, as an answer worked out in place has them. */
export const relink: { [K in WorkKind]: (asked: Asked<K>, answer: Works[K]["answer"]) => Works[K]["answer"] } = {
  view: (asked, answer) => {
    const recs = new Map(asked.bundle.funds.map((f) => [f.id, f]));
    for (const o of answer.options) for (const f of o.funds) f.rec = recs.get(f.rec.id) ?? f.rec;
    answer.index = asked.ask.index;
    return answer;
  },
  changes: (asked, answer) => answer && { ...answer, plan: asked.ask.plan, shares: asked.ask.shares },
};

const inPlace = <K extends WorkKind, A extends Asked<K>>(kind: K, asked: A): Got<K, A> => ({ asked, answer: work[kind](asked.bundle, asked.ask) });

/** One request on its way, or waiting for the one before it: `live` until a newer one or the page's leaving replaces it. */
export type Job<K extends WorkKind, A extends Asked<K> = Asked<K>> = { asked: A; live: boolean; done: (held: Held<K, A>) => void };

/** Whether this browser runs Web Workers (the tests and the build have none). */
const HAS_WORKER = typeof Worker !== "undefined";

export type Client = { post: <K extends WorkKind>(kind: K, asked: Asked<K>, reply: (m: FromWorker) => void) => void };

/** What the client reads of a worker: a Web Worker, or a test's stand-in. */
export type WorkerLike = Pick<Worker, "postMessage" | "addEventListener" | "terminate">;

/**
 * How long a request may wait for its answer before the worker is taken as stuck: generous, many times the longest work (the S&P 500's
 * view, about 830 ms on a phone slowed four times) and the one request of the other channel that may run before it.
 */
export const ANSWER_WITHIN_MS = 20_000;

/** The work of a request, done on the page: its answer, or the error it threw, as the worker would send them. */
function answerHere(id: number, run: () => Works[WorkKind]["answer"]): FromWorker {
  try {
    return { id, answer: run() };
  } catch (error) {
    return { id, failed: error instanceof Error ? `${error.name}: ${error.message}` : String(error) };
  }
}

/**
 * A client of the worker `start` starts. A worker that fails (it does not load or start, as an old script after a deploy, an answer it
 * cannot send, or no answer within ANSWER_WITHIN_MS) is started again once and sent what still waits; when it fails again, the client works
 * every request on the page instead, as the page did before it had a worker: slower, but the figures are right and nothing waits forever.
 * `warn` hears each failure, with why.
 */
export function makeClient(start: () => WorkerLike, warn: (why: string) => void): Client {
  // a request still owed its answer: what the worker is sent, the same work on the page, and where its answer goes
  type Waiting = { kind: WorkKind; bundle: IndicesBundle; ask: Works[WorkKind]["ask"]; run: () => Works[WorkKind]["answer"]; reply: (m: FromWorker) => void; timer: ReturnType<typeof setTimeout> | undefined };
  const waiting = new Map<number, Waiting>();
  // the data the worker keeps, as it keeps it: the latest KEPT_DATA sent
  let sent: { bundle: IndicesBundle; n: number }[] = [];
  let id = 0;
  let n = 0;
  let restarts = 0;
  let worker: WorkerLike | null = null;
  // the data's number, and the data itself where the worker does not keep it
  const dataOf = (bundle: IndicesBundle): { data: number; bundle?: IndicesBundle } => {
    const kept = sent.find((x) => x.bundle === bundle);
    if (kept) return { data: kept.n };
    n += 1;
    sent.push({ bundle, n });
    if (sent.length > KEPT_DATA) sent.shift();
    return { data: n, bundle };
  };
  const reply = (m: FromWorker) => {
    const w = waiting.get(m.id);
    if (!w) return;
    clearTimeout(w.timer);
    waiting.delete(m.id);
    w.reply(m);
  };
  // on the page: after the task that asked, as an answer from the worker comes
  const here = (i: number, w: Waiting) => setTimeout(() => reply(answerHere(i, w.run)), 0);
  const send = (i: number, w: Waiting) => {
    if (!worker) {
      here(i, w);
      return;
    }
    clearTimeout(w.timer);
    w.timer = setTimeout(() => fail(`no answer to a request within ${ANSWER_WITHIN_MS / 1000} s`), ANSWER_WITHIN_MS);
    worker.postMessage({ id: i, ...dataOf(w.bundle), kind: w.kind, ask: w.ask });
  };
  const fail = (why: string) => {
    worker?.terminate();
    worker = null;
    sent = [];
    const again = restarts < 1;
    warn(`the index page's worker failed (${why}); ${again ? "it starts again" : "the page works out its figures itself"}`);
    if (again) {
      restarts += 1;
      worker = open();
    }
    for (const [i, w] of waiting) send(i, w);
  };
  const open = (): WorkerLike | null => {
    let w: WorkerLike;
    try {
      w = start();
    } catch (error) {
      warn(`the index page's worker did not start (${error instanceof Error ? error.message : String(error)}); the page works out its figures itself`);
      restarts = 1;
      return null;
    }
    w.addEventListener("message", (e: MessageEvent<FromWorker>) => reply(e.data));
    // a module worker that does not load gives a plain event, with no message
    w.addEventListener("error", (e) => fail(e.message || "its script did not load or start"));
    w.addEventListener("messageerror", () => fail("an answer it sent could not be read"));
    return w;
  };
  worker = open();
  return {
    post: (kind, asked, answer) => {
      id += 1;
      const w: Waiting = { kind, bundle: asked.bundle, ask: asked.ask, run: () => work[kind](asked.bundle, asked.ask), reply: answer, timer: undefined };
      waiting.set(id, w);
      send(id, w);
    },
  };
}

/** The page's worker, started on the first request. */
let client: Client | undefined;

const clientOf = (): Client =>
  (client ??= makeClient(
    () => new Worker(new URL("./invest-worker.ts", import.meta.url), { type: "module" }),
    (why) => console.warn(why),
  ));

/** A channel's requests: one with the worker at a time, and the newest of those that came meanwhile next. */
export function channelOf<K extends WorkKind, A extends Asked<K> = Asked<K>>(kind: K) {
  let busy = false;
  let next: Job<K, A> | null = null;
  const send = (job: Job<K, A>, c: Client) => {
    busy = true;
    c.post(kind, job.asked, (m) => {
      busy = false;
      // the worker's answer is this channel's kind: it answered the request this channel sent
      if (job.live) job.done("failed" in m ? { failed: m.failed } : { asked: job.asked, answer: relink[kind](job.asked, m.answer as Works[K]["answer"]) });
      const after = next;
      next = null;
      if (after) send(after, c);
    });
  };
  return {
    ask(job: Job<K, A>, c: Client) {
      if (busy) next = job;
      else send(job, c);
    },
    drop(job: Job<K, A>) {
      job.live = false;
      if (next === job) next = null;
    },
  };
}

/** The last answer to `asked` (null while it is null, and until the first answer comes), from the worker. */
function useWork<K extends WorkKind, A extends Asked<K>>(kind: K, asked: A | null): Got<K, A> | null {
  const [channel] = useState(() => channelOf<K, A>(kind));
  const [held, setHeld] = useState<Held<K, A> | null>(null);
  // no worker: every request is worked out where it is asked, as the page did before it had one
  const here = useMemo(() => (!HAS_WORKER && asked ? inPlace(kind, asked) : null), [kind, asked]);
  useEffect(() => {
    if (!HAS_WORKER || !asked) return;
    const job: Job<K, A> = { asked, live: true, done: (h) => startTransition(() => setHeld(h)) };
    channel.ask(job, clientOf());
    return () => channel.drop(job);
  }, [asked, channel]);
  if (held && "failed" in held) throw new Error(held.failed);
  return asked ? (here ?? held) : null;
}

/**
 * The index page's view of the plan on the index (`buildInvest`), with the request it was worked out on (`asked`, as the page passed it, with
 * anything the page keeps beside the data and the ask); null until the first answer.
 */
export function useInvestView<A extends Asked<"view">>(asked: A | null): { view: InvestView; asked: A } | null {
  const got = useWork("view", asked);
  return useMemo(() => got && { view: got.answer, asked: got.asked }, [got]);
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
