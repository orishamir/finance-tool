// The changes the fee page makes to a deal, each a pure function from a deal to the next: the screen calls them and saves what they
// return. A figure the person types becomes theirs (`retyped`): it loses a template's source unless it is the same number. A price whose
// terms the person changes (its months, its bounds' currency, its form) becomes theirs whole (`owned`): the source states another price.
import type { ProductId } from "@finance-tool/schema";
import { blankPrice, newFee, retyped, typed, type BoundCurrency, type Fee, type FeeDeal, type MonthKey, type Months, type Num, type Price, type Stage } from "./model";
import { holdsFunds, type FeeKindId, type FormId, type Held } from "./shapes";

/** Which prices of a fee: its purchase's (or its only ones), or a sale's priced apart. */
export type Side = "buy" | "sell";

/** A figure of a price the screen edits. */
export type Figure = "rate" | "min" | "max" | "amount";

const stagesOf = (fee: Fee, side: Side): Stage[] => (side === "sell" && fee.sale ? fee.sale : fee.stages);
const withStages = (fee: Fee, side: Side, stages: Stage[]): Fee => (side === "sell" && fee.sale ? { ...fee, sale: stages } : { ...fee, stages });

/** The deal with one fee replaced by `fn` of it. */
export const updateFee = (deal: FeeDeal, feeId: string, fn: (f: Fee) => Fee): FeeDeal => ({ ...deal, fees: deal.fees.map((f) => (f.id === feeId ? fn(f) : f)) });

/** The deal with a new fee of a kind at the end. */
export function addFee(deal: FeeDeal, kind: FeeKindId): { deal: FeeDeal; fee: Fee } {
  const fee = newFee(kind);
  return { deal: { ...deal, fees: [...deal.fees, fee] }, fee };
}

export const removeFee = (deal: FeeDeal, feeId: string): FeeDeal => ({ ...deal, fees: deal.fees.filter((f) => f.id !== feeId) });

/** A deal of another kind: what it holds goes where the new kind holds no funds; its fees stay as typed. */
export function setKind(deal: FeeDeal, kind: ProductId): FeeDeal {
  const { held: _held, ...rest } = deal;
  return holdsFunds(kind) && deal.held ? { ...deal, kind } : { ...rest, kind };
}

export const setHeld = (deal: FeeDeal, held: Held): FeeDeal => ({ ...deal, held });

export const setName = (deal: FeeDeal, name: string): FeeDeal => ({ ...deal, name });

export function setStart(deal: FeeDeal, start: MonthKey | null): FeeDeal {
  const { start: _start, ...rest } = deal;
  return start === null ? rest : { ...rest, start };
}

/** A price with one figure typed, or a bound cleared (`null`). */
export function withFigure(p: Price, figure: Figure, n: number | null): Price {
  const keep = (old: Num | undefined): Num | undefined => (n === null ? undefined : old ? retyped(old, n) : typed(n));
  switch (p.form) {
    case "action":
    case "held": {
      if (figure === "rate") return n === null ? p : { ...p, rate: keep(p.rate)! };
      if (figure !== "min" && figure !== "max") return p;
      const next = { ...p, [figure]: keep(p[figure]) };
      if (next[figure] === undefined) delete next[figure];
      return next;
    }
    case "sum":
    case "perAction":
      return figure === "amount" && n !== null ? { ...p, amount: keep(p.amount)! } : p;
    default:
      return p;
  }
}

/**
 * A price the person changed the terms of is theirs: every figure in it loses a template's source, which states the price as it was (the
 * same percent for another period, or the same sum in another currency, is a price the source does not give).
 */
function owned(p: Price): Price {
  switch (p.form) {
    case "action":
    case "held":
      return { ...p, rate: typed(p.rate.v), ...(p.min ? { min: typed(p.min.v) } : {}), ...(p.max ? { max: typed(p.max.v) } : {}) };
    case "sum":
    case "perAction":
      return { ...p, amount: typed(p.amount.v) };
    default:
      return p;
  }
}

/**
 * A price in another form: the rate or the sum typed so far carries over where the new form has one, as the person's own figure (`owned`);
 * the rest starts empty.
 */
export function withForm(p: Price, form: FormId): Price {
  if (p.form === form) return p;
  const next = blankPrice(form);
  const rate = p.form === "action" || p.form === "held" ? p.rate : null;
  const amount = p.form === "sum" || p.form === "perAction" ? p.amount : null;
  if ((next.form === "action" || next.form === "held") && rate) return owned({ ...next, rate });
  if ((next.form === "sum" || next.form === "perAction") && amount) return owned({ ...next, amount });
  return next;
}

/**
 * A held price's months: the rate's period (`per`) or how often it is charged (`every`); a sum's period (`every`). Months that differ
 * from the price's make it the person's (`owned`).
 */
export function withMonths(p: Price, which: "per" | "every", months: Months): Price {
  if (p.form === "held") return p[which] === months ? p : owned({ ...p, [which]: months });
  if (p.form === "sum" && which === "every") return p.every === months ? p : owned({ ...p, every: months });
  return p;
}

/** An action's bounds in another currency: the shekel is left unsaid. A currency that differs from the price's makes it the person's (`owned`). */
export function withCurrency(p: Price, currency: BoundCurrency): Price {
  if (p.form !== "action" || (p.currency ?? "ILS") === currency) return p;
  const { currency: _c, ...rest } = p;
  return owned(currency === "ILS" ? rest : { ...rest, currency });
}

/** A fee with the price of one stage replaced by `fn` of it. */
export const editPrice = (fee: Fee, side: Side, k: number, fn: (p: Price) => Price): Fee => withStages(fee, side, stagesOf(fee, side).map((s, j) => (j === k ? { ...s, price: fn(s.price) } : s)));

/** A fee whose stage `k` ends at the start of `month`, or has no end given yet (`null`). */
export function setUntil(fee: Fee, side: Side, k: number, month: MonthKey | null): Fee {
  return withStages(
    fee,
    side,
    stagesOf(fee, side).map((s, j) => {
      if (j !== k) return s;
      const { until: _u, ...rest } = s;
      return month === null ? rest : { ...rest, until: month };
    }),
  );
}

/**
 * A fee with another price after its last: the new last starts as a copy of the one before it, and the one before it waits for the
 * month it ends, which only the person can say (until then the fee's prices are not in order, and it is left out of the reading).
 */
export function addStage(fee: Fee, side: Side): Fee {
  const stages = stagesOf(fee, side);
  const last = stages.at(-1)!;
  return withStages(fee, side, [...stages, { price: structuredClone(last.price) }]);
}

/** A fee without stage `k`; the price left last has no end. The only price is never removed. */
export function removeStage(fee: Fee, side: Side, k: number): Fee {
  const stages = stagesOf(fee, side);
  if (stages.length < 2) return fee;
  const rest = stages.filter((_, j) => j !== k);
  const last = rest.at(-1)!;
  const { until: _u, ...open } = last;
  return withStages(fee, side, [...rest.slice(0, -1), open]);
}

/** A fee whose sale is priced as its purchase, or apart from it (starting as a copy of the purchase's prices). */
export function setSaleApart(fee: Fee, apart: boolean): Fee {
  const { sale: _s, ...rest } = fee;
  return apart ? { ...rest, sale: structuredClone(fee.stages) } : rest;
}

/** A fee of the person's own with its name. */
export const setFeeName = (fee: Fee, name: string): Fee => ({ ...fee, name });
