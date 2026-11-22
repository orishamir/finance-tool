// The index page's heavy work, pure and in plain data both ways, so it runs in a Web Worker (lib/invest-worker.ts) as well as on the page
// (lib/invest-run.ts): the view of one plan (`buildInvest`, about 830 ms on a phone slowed four times for the S&P 500), and what each plan
// number changed by the same share does to one pair's result (F-89, F-90: 4 lines of 21 runs). A request names its data by number, and
// carries it only the first time: the worker keeps the latest it was sent.
import { changedByShare, sweep } from "@finance-tool/engine";
import { withGroup, type GroupAsk } from "./group-pick";
import { buildInvest, pairCosts, pairLeft, type IndexRef, type InvestView } from "./invest";
import type { IndicesBundle, WorkbenchInputs } from "./providers";
import type { SiteValue } from "./value";

/** The view of one plan on one index. */
interface ViewAsk {
  index: IndexRef;
  plan: WorkbenchInputs;
  yourBroker: string | null;
}

/**
 * F-89 and F-90 on the pair the page prices: each share of `shares` is a percent. Where a house's group is picked, `house` is the group's
 * account, which the worker adds to the data it holds by the group's name (`group`), so a pick never sends the data again.
 */
interface ChangesAsk {
  index: IndexRef;
  plan: WorkbenchInputs;
  house: string;
  fund: string;
  group: GroupAsk | null;
  shares: number[];
}

/** The plan numbers F-89 changes: each one's field in the plan, and how its slider reads it (a return is a fraction in the plan, percent on the slider). */
const CHANGED = [
  { id: "amount", key: "amountNow", scale: 1 },
  { id: "monthly", key: "monthly", scale: 1 },
  { id: "years", key: "years", scale: 1 },
  { id: "ret", key: "grossReturn", scale: 100 },
] as const satisfies readonly { id: string; key: keyof WorkbenchInputs; scale: number }[];

/**
 * F-89 and F-90: the value left on the plan (F-65's figure, with what it reads), and for each number the values it is changed to and what is
 * left after each; with the pair it was worked out for (the index, the house or the group's account, and the fund), and its plan and shares.
 */
export interface PlanChanges {
  index: string;
  house: string;
  fund: string;
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
function planChanges(held: IndicesBundle, a: ChangesAsk): PlanChanges | null {
  const bundle = a.group ? withGroup(held, a.group)?.bundle : held;
  if (!bundle) return null;
  const pair = { bundle, index: a.index, fundId: a.fund, providerId: a.house };
  const base = pairCosts({ ...pair, plan: a.plan })?.left ?? null;
  if (!base) return null;
  const left = (p: WorkbenchInputs) => pairLeft({ ...pair, plan: p });
  const lines = CHANGED.map(({ id, key, scale }) => {
    const tos = a.shares.map((sh) => changedByShare(a.plan[key] * scale, sh / 100, id === "years"));
    return { id, key, scale, tos, ys: sweep(left, a.plan, key, tos, scale) };
  });
  return { index: a.index.id, house: a.house, fund: a.fund, plan: a.plan, shares: a.shares, base, lines };
}

/** The work of each kind, on the data it names. */
export const work: { [K in WorkKind]: (bundle: IndicesBundle, ask: Works[K]["ask"]) => Works[K]["answer"] } = {
  view: (bundle, a) => buildInvest({ bundle, index: a.index, plan: a.plan, yourBroker: a.yourBroker }),
  changes: planChanges,
};

/**
 * How many sets of data the worker keeps, the latest sent: the page's own and the one its last answer was worked out on. The page keeps the
 * same list of what it sent, letting go of the oldest the same way, and its one worker reads messages in the order they were sent, so a
 * request that names its data by number always finds it there.
 */
export const KEPT_DATA = 2;

/** What the page sends the worker: a request on the data of its number, with the data the first time; every message is answered once. */
export type ToWorker = { id: number; data: number; bundle?: IndicesBundle } & { [K in WorkKind]: { kind: K; ask: Works[K]["ask"] } }[WorkKind];

/** What the worker answers a request: its result, or the error it threw. */
export type FromWorker = { id: number; answer: Works[WorkKind]["answer"] } | { id: number; failed: string };
