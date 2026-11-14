// The changes the fee page makes to a fee's prices over time, each a pure function from a fee to the next: a price edited in place, a
// price's end, a change of price added, moved or taken away, a sale priced apart. A fee whose price changes by things (F-114) keeps its prices in its
// cases: these take the case they edit (`caseId`; a fee with cases is edited in its first case where none is named).
import { held } from "../limits";
import { hasCases, pricedOf, pricesOn, sameContent, type Case, type Fee, type MonthKey, type Price, type Priced, type Side, type SlimFee, type Stage } from "../model";

// ---------------------------------------------------------------- a fee's prices over time, whole or in a case

/** A fee with the prices of `caseId` (or its own, or its first case's) replaced by `fn` of them. */
function editPriced<F extends Fee>(fee: F, caseId: string | undefined, fn: (x: Priced) => Priced): F {
  if (!hasCases(fee)) {
    const { stages, sale } = fn(fee);
    const { sale: _s, ...rest } = fee as SlimFee;
    return { ...rest, stages, ...(sale ? { sale } : {}) } as F;
  }
  const target = pricedOf(fee, caseId) as Case;
  return {
    ...fee,
    cases: fee.cases.map((c) => {
      if (c !== target) return c;
      const { stages, sale } = fn(c);
      const { sale: _s, ...rest } = c;
      return { ...rest, stages, ...(sale ? { sale } : {}) };
    }),
  };
}

const withStages = <F extends Fee>(fee: F, side: Side, stages: Stage[], caseId?: string): F =>
  editPriced(fee, caseId, (x) => (side === "sell" && x.sale ? { ...x, sale: stages } : { ...x, stages }));

/** A fee with the price of one stage replaced by `fn` of it (in case `caseId`, where the fee has cases). */
export const editPrice = <F extends Fee>(fee: F, side: Side, k: number, fn: (p: Price) => Price, caseId?: string): F =>
  withStages(fee, side, pricesOn(fee, side, caseId).map((s, j) => (j === k ? { ...s, price: fn(s.price) } : s)), caseId);

/** A fee whose stage `k` ends at the start of `month`, or has no end given yet (`null`). */
export function setUntil<F extends Fee>(fee: F, side: Side, k: number, month: MonthKey | null, caseId?: string): F {
  return withStages(
    fee,
    side,
    pricesOn(fee, side, caseId).map((s, j) => {
      if (j !== k) return s;
      const { until: _u, ...rest } = s;
      return month === null ? rest : { ...rest, until: month };
    }),
    caseId,
  );
}

// A fee's prices on a side are a sequence in time (F-110): each but the last ends at the start of a month, the next starting in it. The
// page changes it at its dividers: a change added by its month alone, a change's month moved between its neighbours, a change taken
// away.

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * A fee whose price on a side changes from `month` (F-110): the price in force then splits in two at it, both halves its price, the later
 * a copy the person then changes. A month the prices change in already, or no month, leaves the fee as it is, and so do prices that
 * number `STAGES_MAX` already (marked so, limits.ts).
 */
export function splitAt<F extends Fee>(fee: F, side: Side, month: MonthKey, caseId?: string): F {
  const stages = pricesOn(fee, side, caseId);
  if (!MONTH.test(month) || stages.some((s) => s.until === month)) return fee;
  const k = stages.findIndex((s) => s.until === undefined || s.until > month);
  const at = k < 0 ? stages.length - 1 : k;
  const s = stages[at]!;
  const later: Stage = { price: structuredClone(s.price), ...(s.until !== undefined ? { until: s.until } : {}) };
  return held(fee, withStages(fee, side, [...stages.slice(0, at), { ...s, until: month }, later, ...stages.slice(at + 1)], caseId));
}

/**
 * A fee whose change `k` (between price `k` and price `k + 1`) moves to `month`: kept after the change before it and before the change
 * after it, so the prices stay in order; a month that would pass a neighbour leaves the fee as it is.
 */
export function moveChange<F extends Fee>(fee: F, side: Side, k: number, month: MonthKey, caseId?: string): F {
  const stages = pricesOn(fee, side, caseId);
  if (!MONTH.test(month) || k >= stages.length - 1) return fee;
  const before = stages[k - 1]?.until, after = stages[k + 1]?.until;
  if ((before !== undefined && month <= before) || (after !== undefined && month >= after)) return fee;
  return setUntil(fee, side, k, month, caseId);
}

/**
 * A fee without change `k`: price `k + 1` merges back into price `k`, which holds on to where the later one ended (or with no end). The
 * undo keeps what this takes (undo.ts).
 */
export function removeChange<F extends Fee>(fee: F, side: Side, k: number, caseId?: string): F {
  const stages = pricesOn(fee, side, caseId);
  if (k < 0 || k >= stages.length - 1) return fee;
  const { until: _u, ...head } = stages[k]!;
  const end = stages[k + 1]!.until;
  return withStages(fee, side, [...stages.slice(0, k), { ...head, ...(end !== undefined ? { until: end } : {}) }, ...stages.slice(k + 2)], caseId);
}

/** Whether change `k` changes nothing: the later price is the earlier one as it was copied, so it goes without an undo. */
export const changeUntouched = (fee: Fee, side: Side, k: number, caseId?: string): boolean => {
  const stages = pricesOn(fee, side, caseId);
  return !!stages[k + 1] && sameContent(stages[k]!.price, stages[k + 1]!.price);
};

/** A fee (or its case) whose sale is priced as its purchase, or apart from it (starting as a copy of the purchase's prices). */
export function setSaleApart<F extends Fee>(fee: F, apart: boolean, caseId?: string): F {
  return editPriced(fee, caseId, (x) => (apart ? { stages: x.stages, sale: x.sale ?? structuredClone(x.stages) } : { stages: x.stages }));
}

/** A fee of the person's own with its name. */
