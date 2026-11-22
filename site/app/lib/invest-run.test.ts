import { describe, expect, it, vi } from "vitest";
import { bundle as data, plan } from "../components/invest/render-fixtures";
import { pickOfHeadline } from "../components/invest/pair";
import { indexById } from "./invest";
import { work, type FromWorker } from "./invest-work";
import { ANSWER_WITHIN_MS, channelOf, forPair, makeClient, relink, type Asked, type Client, type WorkerLike, type Held, type Job } from "./invest-run";
import type { IndicesBundle } from "./providers";

/** A worker that answers when the test says: what was posted, in order, and the replies still owed. */
function fakeWorker() {
  const posted: Asked<"changes">[] = [];
  const owed: ((m: FromWorker) => void)[] = [];
  const client: Client = {
    post: (_kind, asked, reply) => {
      posted.push(asked as Asked<"changes">);
      owed.push(reply);
    },
  };
  const answer = (m: Omit<FromWorker, "id">) => {
    const reply = owed.shift();
    if (!reply) throw new Error("no request waits for an answer");
    reply({ id: 0, ...m } as FromWorker);
  };
  return { client, posted, answer };
}

const bundle = { funds: [] } as unknown as IndicesBundle;
/** A request on the sweep, told apart by its plan's amount; what it was answered with lands in `got`. */
function job(amount: number, got: Held<"changes">[]): Job<"changes"> {
  const plan = { amountNow: amount } as Asked<"changes">["ask"]["plan"];
  return { asked: { bundle, ask: { index: { id: "i" } as Asked<"changes">["ask"]["index"], plan, house: "h", fund: "f", group: null, shares: [0] } }, live: true, done: (h) => got.push(h) };
}
const amounts = (posted: Asked<"changes">[]) => posted.map((a) => a.ask.plan.amountNow);

describe("a channel of the index page's worker (lib/invest-run.ts)", () => {
  it("sends one request at a time, and after it only the newest of those asked meanwhile", () => {
    const w = fakeWorker();
    const ch = channelOf("changes");
    const got: Held<"changes">[] = [];
    ch.ask(job(1, got), w.client);
    ch.ask(job(2, got), w.client);
    ch.ask(job(3, got), w.client);
    expect(amounts(w.posted)).toEqual([1]);
    w.answer({ answer: null });
    expect(amounts(w.posted)).toEqual([1, 3]);
    w.answer({ answer: null });
    expect(got).toHaveLength(2);
  });

  it("shows no answer to a request the page dropped, and sends no dropped request", () => {
    const w = fakeWorker();
    const ch = channelOf("changes");
    const got: Held<"changes">[] = [];
    const first = job(1, got);
    const second = job(2, got);
    ch.ask(first, w.client);
    ch.ask(second, w.client);
    ch.drop(first);
    ch.drop(second);
    w.answer({ answer: null });
    expect(got).toEqual([]);
    expect(amounts(w.posted)).toEqual([1]);
  });

  it("hands the page the error the work threw, and the answer with the request it was worked out on", () => {
    const w = fakeWorker();
    const ch = channelOf("changes");
    const got: Held<"changes">[] = [];
    const asked = job(1, got);
    ch.ask(asked, w.client);
    w.answer({ failed: "RangeError: no" });
    ch.ask(asked, w.client);
    w.answer({ answer: null });
    expect(got[0]).toEqual({ failed: "RangeError: no" });
    expect(got[1]).toEqual({ asked: asked.asked, answer: null });
  });
});

describe("an answer from the worker, as the page reads it (lib/invest-run.ts)", () => {
  const index = indexById(data, "index-sp500");
  if (!index) throw new Error("the collected data has the S&P 500");
  it("the view's fund records and its index are the page's own objects again", () => {
    const ask = { index, plan, yourBroker: null };
    const cloned = structuredClone(work.view(data, ask));
    const got = relink.view({ bundle: data, ask }, cloned);
    const recs = got.options.flatMap((o) => o.funds.map((f) => f.rec));
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.filter((r) => r !== data.funds.find((f) => f.id === r.id))).toEqual([]);
    expect(got.index).toBe(index);
  });

  it("the sweep's plan and shares are the request's own", () => {
    const view = work.view(data, { index, plan, yourBroker: null });
    const pick = pickOfHeadline(view);
    if (!pick) throw new Error("the S&P 500 has a pair to price");
    const ask = { index, plan, house: pick.house, fund: pick.fund, group: null, shares: [-20, 0, 20] };
    const cloned = structuredClone(work.changes(data, ask));
    if (!cloned) throw new Error("the pair has a value left on the plan");
    const got = relink.changes({ bundle: data, ask }, cloned);
    expect(got?.plan).toBe(plan);
    expect(got?.shares).toBe(ask.shares);
    expect(got?.lines).toEqual(cloned.lines);
  });

  it("a sweep is for the pair it was worked out for: another house, fund or index asked since holds it as not theirs", () => {
    const view = work.view(data, { index, plan, yourBroker: null });
    const pick = pickOfHeadline(view);
    if (!pick) throw new Error("the S&P 500 has a pair to price");
    const ask = { index, plan, house: pick.house, fund: pick.fund, group: null, shares: [0] };
    const run = work.changes(data, ask);
    if (!run) throw new Error("the pair has a value left on the plan");
    expect(forPair(run, ask)).toBe(true);
    expect(forPair(run, { ...ask, plan: { ...plan, years: plan.years + 1 } })).toBe(true);
    expect(forPair(run, { ...ask, house: `${pick.house}-other` })).toBe(false);
    expect(forPair(run, { ...ask, fund: `${pick.fund}-other` })).toBe(false);
    expect(forPair(run, { ...ask, index: { ...index, id: "index-other" } })).toBe(false);
  });
});

/** A stand-in for a Web Worker that the test drives: what it was sent, and its listeners, to give it an event. */
function standIn() {
  const sent: { id: number; data: number; bundle?: IndicesBundle; kind: string }[] = [];
  const on = new Map<string, ((e: Event) => void)[]>();
  let ended = false;
  const worker: WorkerLike = {
    postMessage: (m: (typeof sent)[number]) => void sent.push(m),
    addEventListener: (type: string, f: (e: Event) => void) => void on.set(type, [...(on.get(type) ?? []), f]),
    terminate: () => void (ended = true),
  } as WorkerLike;
  const fire = (type: string, e: Event) => {
    for (const f of on.get(type) ?? []) f(e);
  };
  return { worker, sent, fire, ended: () => ended };
}

describe("a worker that fails (lib/invest-run.ts, makeClient)", () => {
  const index = indexById(data, "index-sp500");
  if (!index) throw new Error("the collected data has the S&P 500");
  const view = work.view(data, { index, plan, yourBroker: null });
  const pick = pickOfHeadline(view);
  if (!pick) throw new Error("the S&P 500 has a pair to price");
  const ask = { index, plan, house: pick.house, fund: pick.fund, group: null, shares: [-20, 0, 20] };
  const request = (): Asked<"changes"> => ({ bundle: data, ask });
  /** A client on stand-ins, each start the next; what it warned, and what each request was answered. */
  function client() {
    const workers: ReturnType<typeof standIn>[] = [];
    const warned: string[] = [];
    const c = makeClient(() => {
      const w = standIn();
      workers.push(w);
      return w.worker;
    }, (why) => warned.push(why));
    const got: FromWorker[] = [];
    const post = () => c.post("changes", request(), (m) => got.push(m));
    const nth = (i: number) => {
      const w = workers[i];
      if (!w) throw new Error(`no worker number ${i} was started`);
      return w;
    };
    return { workers, warned, got, post, nth };
  }
  const settle = () => new Promise((r) => setTimeout(r, 0));

  it("one whose script does not load is started again and sent the request with its data; failing again, the page works the request itself", async () => {
    const c = client();
    c.post();
    expect(c.workers).toHaveLength(1);
    // a module worker that does not load gives a plain event, with no message
    c.nth(0).fire("error", new Event("error"));
    expect(c.nth(0).ended()).toBe(true);
    expect(c.workers).toHaveLength(2);
    expect(c.nth(1).sent.map((m) => !!m.bundle)).toEqual([true]);
    c.nth(1).fire("error", new Event("error"));
    expect(c.workers).toHaveLength(2);
    await settle();
    expect(c.got).toEqual([{ id: 1, answer: work.changes(data, ask) }]);
    expect(c.warned).toHaveLength(2);
    expect(c.warned.join(" ")).not.toContain("undefined");
    // a later request is worked on the page too, with no worker to wait for
    c.post();
    await settle();
    expect(c.got.map((m) => m.id)).toEqual([1, 2]);
  });

  it("one that never answers is taken as stuck after a generous wait, and so is the one started in its place", async () => {
    vi.useFakeTimers();
    try {
      const c = client();
      c.post();
      vi.advanceTimersByTime(ANSWER_WITHIN_MS - 1);
      expect(c.workers).toHaveLength(1);
      vi.advanceTimersByTime(1);
      expect(c.workers).toHaveLength(2);
      expect(c.nth(1).sent).toHaveLength(1);
      vi.advanceTimersByTime(ANSWER_WITHIN_MS);
      vi.advanceTimersByTime(1);
      expect(c.got).toEqual([{ id: 1, answer: work.changes(data, ask) }]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("an answer it cannot send to the page counts as a failure, and the answer of the worker started again is the request's", () => {
    const c = client();
    c.post();
    c.nth(0).fire("messageerror", new Event("messageerror"));
    expect(c.workers).toHaveLength(2);
    const answer = { id: c.nth(1).sent[0]?.id, answer: null };
    c.nth(1).fire("message", new MessageEvent("message", { data: answer }));
    expect(c.got).toEqual([answer]);
  });
});
