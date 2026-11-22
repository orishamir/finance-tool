import { describe, expect, it } from "vitest";
import type { FromWorker } from "./invest-work";
import { channelOf, type Client, type Held, type Job } from "./invest-run";
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
  return { bundle, ask: { index: { id: "i" } as Job<"changes">["ask"]["index"], plan, house: "h", fund: "f", shares: [0] }, live: true, done: (h) => got.push(h) };
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

  it("sends a request again when its data was let go before it ran, unless a newer one waits", () => {
    const w = fakeWorker();
    const ch = channelOf("changes");
    const got: Held<"changes">[] = [];
    ch.ask(job(1, got), w.client);
    w.answer({ stale: true });
    expect(amounts(w.posted)).toEqual([1, 1]);
    ch.ask(job(2, got), w.client);
    w.answer({ stale: true });
    expect(amounts(w.posted)).toEqual([1, 1, 2]);
    expect(got).toEqual([]);
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
