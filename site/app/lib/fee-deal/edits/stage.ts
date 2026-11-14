// The changes the fee page makes to a fee's prices over time, each a pure function from a fee to the next: a price edited in place, a
// price's end, a later price added or taken away, a sale priced apart. A fee whose price changes by things (F-114) keeps its prices in its
// cases: these take the case they edit (`caseId`; a fee with cases is edited in its first case where none is named).
import { blankPrice, hasCases, pricedOf, pricesOn, sameContent, type Case, type Fee, type MonthKey, type Price, type Priced, type Side, type SlimFee, type Stage } from "../model";
import type { ChargedForm } from "../offers/capacity";

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

// A fee's prices on a side are a chain, each made by "עד מתי" on the one before it: "לזמן מוגבל" with a month ends a price at that month
// and adds the next one, which asks for its price; "כל הזמן" makes a price the last, taking away the prices after it.

/**
 * A fee whose last price on a side ends at the start of `until`, with one more price after it: of the form the last had, or after a free
 * price the form `after`, which the caller takes from the offer (`OpenCase.later`: the first form the product's fee is offered in), its
 * rate or sum blank, so the fee is not read until the person gives it (`feePriced`). The person says the month first, so the prices are
 * in order from the start.
 */
export function addLater<F extends Fee>(fee: F, side: Side, until: MonthKey, after: ChargedForm, caseId?: string): F {
  const stages = pricesOn(fee, side, caseId);
  const last = stages.at(-1)!;
  return withStages(fee, side, [...stages.slice(0, -1), { ...last, until }, { price: blankPrice(last.price.form === "free" ? after : last.price.form) }], caseId);
}

/**
 * Price `k` for a limited time, up to the start of `month`: the last price ends there and the next one follows it (`addLater`, in the form
 * `after` where it follows a free price); another moves its end.
 */
export function setLimited<F extends Fee>(fee: F, side: Side, k: number, month: MonthKey, after: ChargedForm, caseId?: string): F {
  return k === pricesOn(fee, side, caseId).length - 1 ? addLater(fee, side, month, after, caseId) : setUntil(fee, side, k, month, caseId);
}

/** Price `k` held on with no end: the prices after it go. */
export function holdOn<F extends Fee>(fee: F, side: Side, k: number, caseId?: string): F {
  const stages = pricesOn(fee, side, caseId);
  if (!stages[k]) return fee;
  const { until: _u, ...open } = stages[k]!;
  return withStages(fee, side, [...stages.slice(0, k), open], caseId);
}

/**
 * Whether the prices after `k` hold nothing the person gave: one price only, as "לזמן מוגבל" added it (no month, its form the one it
 * came with, after a free price the form `after` the offer gives, its figures, periods and currency untouched). Anything chosen in it counts.
 * They go then without an undo.
 */
export function laterUntouched(fee: Fee, side: Side, k: number, after: ChargedForm, caseId?: string): boolean {
  const stages = pricesOn(fee, side, caseId);
  const later = stages.slice(k + 1);
  const form = stages[k]!.price.form === "free" ? after : stages[k]!.price.form;
  return later.length === 1 && later[0]!.until === undefined && sameContent(later[0]!.price, blankPrice(form));
}

/** A fee (or its case) whose sale is priced as its purchase, or apart from it (starting as a copy of the purchase's prices). */
export function setSaleApart<F extends Fee>(fee: F, apart: boolean, caseId?: string): F {
  return editPriced(fee, caseId, (x) => (apart ? { stages: x.stages, sale: x.sale ?? structuredClone(x.stages) } : { stages: x.stages }));
}

/** A fee of the person's own with its name. */
