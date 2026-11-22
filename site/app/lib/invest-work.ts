// The index page's heavy work, pure and in plain data both ways, so it runs in a Web Worker (lib/invest-worker.ts) as well as on the page
// (lib/invest-run.ts): the view of one plan (`buildInvest`, about 830 ms on a phone slowed four times for the S&P 500), and what each plan
// number changed by the same share does to one pair's result (F-89, F-90: 4 lines of 21 runs). A request names its data by number, and
// carries it only the first time: the worker keeps the latest it was sent.
import { changedByShare, sweep } from "@finance-tool/engine";
import { buildInvest, pairCosts, pairLeft, type IndexRef, type InvestView } from "./invest";
import type { IndicesBundle, WorkbenchInputs } from "./providers";
import type { SiteValue } from "./value";

/** The view of one plan on one index. */
interface ViewAsk {
  index: IndexRef;
  plan: WorkbenchInputs;
  yourBroker: string | null;
}

/** F-89 and F-90 on the pair the page prices: each share of `shares` is a percent. */
interface ChangesAsk {
  index: IndexRef;
  plan: WorkbenchInputs;
  house: string;
  fund: string;
  shares: number[];
}

/** The plan numbers F-89 changes: each one's field in the plan, and how its slider reads it (a return is a fraction in the plan, percent on the slider). */
const CHANGED = [
  { id: "amount", key: "amountNow", scale: 1 },
  { id: "monthly", key: "monthly", scale: 1 },
  { id: "years", key: "years", scale: 1 },
  { id: "ret", key: "grossReturn", scale: 100 },
] as const satisfies readonly { id: string; key: keyof WorkbenchInputs; scale: number }[];

/** F-89 and F-90: the value left on the plan (F-65's figure, with what it reads), and for each number the values it is changed to and what is left after each. */
export interface PlanChanges {
  plan: WorkbenchInputs;
  shares: number[];
  base: SiteValue;
  lines: { id: (typeof CHANGED)[number]["id"]; key: (typeof CHANGED)[number]["key"]; scale: number; tos: number[]; ys: (number | null)[] }[];
}

/** Each kind of work: what it is asked, and what it answers. */
export interface Works {
  view: { ask: ViewAsk; answer: InvestView };
  changes: { ask: ChangesAsk; answer: PlanChanges | null };
}
export type WorkKind = keyof Works;

/** F-89 and F-90: every plan number changed by the same share; null where the pair has no value left on the plan. */
function planChanges(bundle: IndicesBundle, a: ChangesAsk): PlanChanges | null {
  const pair = { bundle, index: a.index, fundId: a.fund, providerId: a.house };
  const base = pairCosts({ ...pair, plan: a.plan })?.left ?? null;
  if (!base) return null;
  const left = (p: WorkbenchInputs) => pairLeft({ ...pair, plan: p });
  const lines = CHANGED.map(({ id, key, scale }) => {
    const tos = a.shares.map((sh) => changedByShare(a.plan[key] * scale, sh / 100, id === "years"));
    return { id, key, scale, tos, ys: sweep(left, a.plan, key, tos, scale) };
  });
  return { plan: a.plan, shares: a.shares, base, lines };
}

/** The work of each kind, on the data it names. */
export const work: { [K in WorkKind]: (bundle: IndicesBundle, ask: Works[K]["ask"]) => Works[K]["answer"] } = {
  view: (bundle, a) => buildInvest({ bundle, index: a.index, plan: a.plan, yourBroker: a.yourBroker }),
  changes: planChanges,
};

/** How many sets of data the worker keeps, the latest sent: the page's own and the one its last answer was worked out on. */
export const KEPT_DATA = 2;

/** What the page sends the worker: a request on the data of its number, with the data the first time; every message is answered once. */
export type ToWorker = { id: number; data: number; bundle?: IndicesBundle } & { [K in WorkKind]: { kind: K; ask: Works[K]["ask"] } }[WorkKind];

/** What the worker answers a request: its result, the error it threw, or that the data it names was replaced before it ran. */
export type FromWorker = { id: number; answer: Works[WorkKind]["answer"] } | { id: number; failed: string } | { id: number; stale: true };
