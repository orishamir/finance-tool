import { describe, expect, it } from "vitest";
import { bundle as data, plan } from "../components/invest/render-fixtures";
import { pickOfHeadline } from "../components/invest/pair";
import { indexById } from "./invest";
import { work, type FromWorker } from "./invest-work";
import { channelOf, forPair, relink, type Client, type Held, type Job } from "./invest-run";
import type { IndicesBundle } from "./providers";

/** A worker that answers when the test says: what was posted, in order, and the replies still owed. */
function fakeWorker() {
  const posted: Job<"changes">[] = [];
  const owed: ((m: FromWorker) => void)[] = [];
  const client: Client = {
    post: (_kind, job, reply) => {
      posted.push(job as Job<"changes">);
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
  const plan = { amountNow: amount } as Job<"changes">["ask"]["plan"];
  return { bundle, ask: { index: { id: "i" } as Job<"changes">["ask"]["index"], plan, house: "h", fund: "f", group: null, shares: [0] }, live: true, done: (h) => got.push(h) };
}
const amounts = (posted: Job<"changes">[]) => posted.map((j) => j.ask.plan.amountNow);

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
    expect(got[1]).toMatchObject({ bundle, ask: asked.ask, answer: null });
  });
});

describe("an answer from the worker, as the page reads it (lib/invest-run.ts)", () => {
  const index = indexById(data, "index-sp500");
  if (!index) throw new Error("the collected data has the S&P 500");
  it("the view's fund records and its index are the page's own objects again", () => {
    const ask = { index, plan, yourBroker: null };
    const cloned = structuredClone(work.view(data, ask));
    const got = relink.view({ bundle: data, ask, answer: cloned });
    const recs = got.answer.options.flatMap((o) => o.funds.map((f) => f.rec));
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.filter((r) => r !== data.funds.find((f) => f.id === r.id))).toEqual([]);
    expect(got.answer.index).toBe(index);
  });

  it("the sweep's plan and shares are the request's own", () => {
    const view = work.view(data, { index, plan, yourBroker: null });
    const pick = pickOfHeadline(view);
    if (!pick) throw new Error("the S&P 500 has a pair to price");
    const ask = { index, plan, house: pick.house, fund: pick.fund, group: null, shares: [-20, 0, 20] };
    const cloned = structuredClone(work.changes(data, ask));
    if (!cloned) throw new Error("the pair has a value left on the plan");
    const got = relink.changes({ bundle: data, ask, answer: cloned });
    expect(got.answer?.plan).toBe(plan);
    expect(got.answer?.shares).toBe(ask.shares);
    expect(got.answer?.lines).toEqual(cloned.lines);
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
