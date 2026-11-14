// How much one deal may hold. The reader (`readDeal`, model.ts) refuses a deal past any of these, so every edit (edits/*, templates.ts)
// refuses a change that would pass one: a deal the page saved always opens again. Each is far above what a price list prints: the
// houses' price lists the site holds fill at most six cases in one fee, and one price over time each.
//
// An edit that refuses leaves its fee as it was, and marks that fee with the limit it met (`refuse`) for the rest of the task the edit ran
// in: the page, handed the same fee back, asks `takeRefusal` and says why at the fee. The mark is gone by the next task, so a fee handed
// back unchanged later for another reason says nothing.
import type { Fee, FeeDeal } from "./model";

/** Fees in one deal: the kinds a product is charged are about 20, and a fee of the person's own may be added more than once. */
export const FEES_MAX = 40;
/** Prices over time in one list (a fee's, a case's, or a sale's): eleven changes of price. */
export const STAGES_MAX = 12;
/** Cases of one fee (F-114): a fee that changes by three things reaches about 75 (five things held, three channels, five size steps). */
export const CASES_MAX = 120;
/** Tops of one range: thirteen steps. */
export const TOPS_MAX = 12;
/** Values a case names of one thing, and values of the person's own that a thing names. */
export const VALUES_MAX = 20;
/** The reading's picks: one for each thing the deal's fees change by. */
export const PICKS_MAX = 12;

/** A limit a deal may meet. */
export type Limit = "fees" | "stages" | "cases" | "tops" | "values" | "picks";

/** Each limit's number, for the words that say it. */
export const LIMITS: Readonly<Record<Limit, number>> = { fees: FEES_MAX, stages: STAGES_MAX, cases: CASES_MAX, tops: TOPS_MAX, values: VALUES_MAX, picks: PICKS_MAX };

const stagesOver = (x: { stages: readonly unknown[]; sale?: readonly unknown[] }): boolean => x.stages.length > STAGES_MAX || (x.sale?.length ?? 0) > STAGES_MAX;

/** The first limit a fee passes, or null. */
export function feeBreach(fee: Fee): Limit | null {
  if (fee.cases === undefined) return stagesOver(fee) ? "stages" : null;
  if (fee.cases.length > CASES_MAX) return "cases";
  for (const b of fee.by) {
    if ("tops" in b && b.tops.length > TOPS_MAX) return "tops";
    if ("own" in b && b.own && b.own.length > VALUES_MAX) return "values";
  }
  for (const c of fee.cases) {
    if (stagesOver(c)) return "stages";
    if (c.when.some((w) => Array.isArray(w) && w.length > VALUES_MAX)) return "values";
  }
  return null;
}

/** The first limit a deal passes, and the fee that passes it where one does; null where it passes none. */
export function dealBreach(deal: FeeDeal): { limit: Limit; feeId: string | null } | null {
  if (deal.fees.length > FEES_MAX) return { limit: "fees", feeId: null };
  if ((deal.readFor?.length ?? 0) > PICKS_MAX) return { limit: "picks", feeId: null };
  for (const f of deal.fees) {
    const limit = feeBreach(f);
    if (limit) return { limit, feeId: f.id };
  }
  return null;
}

/** Whether a deal has room for one more fee. */
export const feeRoom = (deal: FeeDeal): boolean => deal.fees.length < FEES_MAX;

// ---------------------------------------------------------------- refusing an edit

const marks = new WeakMap<Fee, Limit>();

/** Marks `fee` as handed back unchanged because of `limit`, until the task ends (see the head of this file); returns it. */
function refuse<F extends Fee>(fee: F, limit: Limit): F {
  marks.set(fee, limit);
  queueMicrotask(() => marks.delete(fee));
  return fee;
}

/** The limit an edit just met on `fee`, handed back unchanged, or null; the mark is taken, so it is said once. */
export function takeRefusal(fee: Fee): Limit | null {
  const limit = marks.get(fee) ?? null;
  marks.delete(fee);
  return limit;
}

/** An edit's result where it passes no limit `before` did not; else `before` itself, marked with the limit (`refuse`). */
export function held<F extends Fee>(before: F, after: F): F {
  if (after === before) return after;
  const limit = feeBreach(after);
  return limit && limit !== feeBreach(before) ? refuse(before, limit) : after;
}
