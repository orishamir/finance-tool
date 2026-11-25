// The index page's heavy work, pure and in plain data both ways, so it runs in a Web Worker (lib/invest-worker.ts) as well as on the page
// (lib/invest-run.ts): the view of one plan (`buildInvest`, about 830 ms on a phone slowed four times for the S&P 500), what each plan
// number changed by the same share does to one pair's result (F-89, F-90: 4 lines of 21 runs), and which account leaves the most with one
// fund at each mix of today's amount and monthly deposit (F-131, lib/account-map.ts: a few hundred points, most at two or three
// accounts, about a second in node on the S&P 500, in a worker of its own; the prices it reads are kept between maps, lib/map-surface.ts). A request names its data by number, and carries it only the first time: the worker keeps the latest it was sent.
import { changedByShare, sweep } from "@finance-tool/engine";
import { accountMap, type AccountMap, type LeftAt } from "./account-map";
import { p05Range } from "./engine";
import { SurfaceCache } from "./map-surface";
import { buildInvest, fundWayAt, pairCosts, pairLeft, providersOfInvest, tieShareOf, type IndexRef, type InvestView } from "./invest";
import { rankedAt } from "./stretch";
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

/**
 * F-89 and F-90: the value left on the plan (F-65's figure, with what it reads), and for each number the values it is changed to and what is
 * left after each; with the pair it was worked out for (the index, the house and the fund), and its plan and shares.
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

/** F-131 on one fund: which account leaves the most at each mix of today's amount and monthly deposit, the plan's other numbers held. */
interface MapAsk {
  index: IndexRef;
  plan: WorkbenchInputs;
  fund: string;
}

/** F-131's answer: the map, or why there is none (no account is ranked with the fund: its tax rests on an open rule, G-18, or none
 *  prices it). */
export type MapAnswer = { kind: "map"; map: AccountMap } | { kind: "unranked"; why: "open-rule" | "unpriced" };

/** Each kind of work: what it is asked, and what it answers. */
export interface Works {
  view: { ask: ViewAsk; answer: InvestView };
  changes: { ask: ChangesAsk; answer: PlanChanges | null };
  map: { ask: MapAsk; answer: MapAnswer };
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
  return { index: a.index.id, house: a.house, fund: a.fund, plan: a.plan, shares: a.shares, base, lines };
}

/**
 * What each account leaves with one fund at a point (`WayPrice.valueN`, the figure the account list ranks by), only where the list ranks
 * the pair: priced as the lists price it (`fundWayAt`), the plan's other numbers held.
 */
export function leftWith(bundle: IndicesBundle, index: IndexRef, plan: WorkbenchInputs, fund: string): LeftAt {
  return (amount, monthly, houses) => {
    const way = fundWayAt({ bundle, index, plan: { ...plan, amountNow: amount, monthly }, fundId: fund, ...(houses ? { houses } : {}) });
    return new Map(Object.values(way?.byHouse ?? {}).flatMap((w) => (rankedAt(w) ? [[w.providerId, w.valueN] as const] : [])));
  };
}

/** The map's prices kept between maps (`SurfaceCache`): the last 8 surfaces, about 100 MB in all at most. */
const surfaces = new SurfaceCache(8, 100e6);
/** Each set of data by number, for the surfaces' keys. */
const dataIds = new WeakMap<IndicesBundle, number>();
let dataCount = 0;

/** The surface key of a map's request: its data, index and fund, and the plan without today's amount and the monthly deposit. */
function surfaceKey(bundle: IndicesBundle, a: MapAsk): string {
  let n = dataIds.get(bundle);
  if (n === undefined) {
    n = ++dataCount;
    dataIds.set(bundle, n);
  }
  const { amountNow: _a, monthly: _m, values, ...rest } = a.plan;
  const { amount: _va, monthly: _vm, ...others } = values;
  return JSON.stringify([n, a.index.id, a.fund, rest, others]);
}

/** The map's prices kept, for a test and a measure: how many surfaces, the points they hold, and the bytes estimated. */
export const mapCache = () => surfaces.size();

/** F-131: the map for the plan, its switches looked for as far as the plan's sliders reach (P-05), a tie to the house the headline takes. */
function mapOf(bundle: IndicesBundle, a: MapAsk): MapAnswer {
  // the reach is P-05's: with no slider range there is no axis to draw, and a map on 0 would be points at NaN, so the work fails, naming it
  const reach = (key: string) => {
    const max = p05Range(bundle.p05, "sliders", key)?.max;
    if (!(typeof max === "number" && max > 0)) throw new Error(`F-131: P-05 has no slider range for ${key}, so the account map has no reach`);
    return max;
  };
  const order = providersOfInvest(bundle).map((s) => s.id);
  const leftAt = surfaces.left(surfaceKey(bundle, a), leftWith(bundle, a.index, a.plan, a.fund));
  const map = accountMap({ leftAt, order, theta: tieShareOf(bundle), plan: { amount: a.plan.amountNow, monthly: a.plan.monthly }, reach: { amount: reach("amount_now"), monthly: reach("monthly_deposit") } });
  surfaces.bound();
  if (map) return { kind: "map", map };
  const way = fundWayAt({ bundle, index: a.index, plan: a.plan, fundId: a.fund });
  // a fund priced on an open rule (G-18) is shown, never ranked
  const open = Object.values(way?.byHouse ?? {}).some((w) => "valueN" in w && w.open);
  return { kind: "unranked", why: open ? "open-rule" : "unpriced" };
}

/** The work of each kind, on the data it names. */
export const work: { [K in WorkKind]: (bundle: IndicesBundle, ask: Works[K]["ask"]) => Works[K]["answer"] } = {
  view: (bundle, a) => buildInvest({ bundle, index: a.index, plan: a.plan, yourBroker: a.yourBroker }),
  changes: planChanges,
  map: mapOf,
};

/**
 * How many sets of data the worker keeps, the latest sent: the page's own and the one its last answer was worked out on. The page keeps the
 * same list of what it sent to each worker, letting go of the oldest the same way, and a worker reads messages in the order they were sent,
 * so a request that names its data by number always finds it there.
 */
export const KEPT_DATA = 2;

/** What the page sends the worker: a request on the data of its number, with the data the first time; every message is answered once. */
export type ToWorker = { id: number; data: number; bundle?: IndicesBundle } & { [K in WorkKind]: { kind: K; ask: Works[K]["ask"] } }[WorkKind];

/** What the worker answers a request: its result, or the error it threw. */
export type FromWorker = { id: number; answer: Works[WorkKind]["answer"] } | { id: number; failed: string };
