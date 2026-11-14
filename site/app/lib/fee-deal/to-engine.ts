// A deal as the engine reads it (method §10.6): typed percents become the engine's fractions here and nowhere else, a discount lowers the
// price it is off (F-116), a third party's fee with a figure goes with its price (F-117), and a fee read on one step of sizes carries its
// stretch (F-115). The parts the page states without computing (§10.6's stated parts) do not go to the engine.
import { discounted, type Deal, type DealFee, type DealPrice, type DealStage, type DealThird } from "@finance-tool/engine";
import { isForeign, readFees, type ReadFee } from "./cases";
import { fraction, monthOf, type FeeDeal, type Price, type ReadPick, type Stage, type ThirdPrice } from "./model";
import { engineBase } from "./shapes";

/** The parts a share of an action and a sum per unit share: bounds, the cap as a fraction, and the flat price where both its figures are given. */
const actionParts = (p: Extract<Price, { form: "action" | "perUnit" }>) => ({
  ...(p.min ? { min: p.min.v } : {}),
  ...(p.max ? { max: p.max.v } : {}),
  ...(p.cap ? { cap: fraction(p.cap.v) } : {}),
  ...(p.flat && !p.flat.amount.blank && !p.flat.upTo.blank ? { flat: { amount: p.flat.amount.v, upTo: p.flat.upTo.v } } : {}),
});

const currencyOf = (c: string | undefined) => (c && c !== "ILS" ? { currency: c } : {});

/** A third party's fee with its figure as the engine reads it (F-117): a share's currency only with a bound typed, a sum's always. */
function engineThird(t: ThirdPrice): DealThird {
  const bounds = t.form === "perAction" ? {} : { ...(t.min ? { min: t.min.v } : {}), ...(t.max ? { max: t.max.v } : {}) };
  switch (t.form) {
    case "action":
      return { kind: "action", rate: fraction(t.rate.v), ...bounds, ...(t.min || t.max ? currencyOf(t.currency) : {}) };
    case "perUnit":
      return { kind: "perUnit", amount: t.amount.v, ...bounds, ...currencyOf(t.currency) };
    case "perAction":
      return { kind: "perAction", amount: t.amount.v, ...currencyOf(t.currency) };
  }
}

/**
 * A price as the engine reads it (F-110): a held rate becomes the share of each charge, `rate × every / per`, its bounds a charge's
 * bounds where the list prints them per another period (F-14), and a cap a fraction; a
 * share's currency goes only with a bound or a flat price typed, since it prices nothing else (F-110, F-112); a sum's always. A third
 * party's fee with its figure goes with the price (F-117), and a discount lowers the price as F-116 says.
 */
export function enginePrice(p: Price): DealPrice {
  const base = basePrice(p);
  if (p.form !== "action" && p.form !== "perUnit" && p.form !== "perAction") return base;
  const withThird: DealPrice = p.third?.price ? ({ ...base, third: engineThird(p.third.price) } as DealPrice) : base;
  return p.discount ? discounted(withThird, fraction(p.discount.pct.v), !!p.discount.alsoMin) : withThird;
}

function basePrice(p: Price): DealPrice {
  switch (p.form) {
    case "free":
      return { kind: "free" };
    case "action":
      return { kind: "action", rate: fraction(p.rate.v), ...actionParts(p), ...(p.min || p.max || p.flat ? currencyOf(p.currency) : {}) };
    case "perUnit":
      return { kind: "perUnit", amount: p.amount.v, ...actionParts(p), ...currencyOf(p.currency) };
    case "held": {
      // F-14: a bound printed per `boundsEvery` months is multiplied by the months in the charging period
      const charge = (n: number) => (p.boundsEvery ? (n * p.every) / p.boundsEvery : n);
      return { kind: "held", rate: (fraction(p.rate.v) * p.every) / p.per, everyMonths: p.every, ...(p.min ? { min: charge(p.min.v) } : {}), ...(p.max ? { max: charge(p.max.v) } : {}) };
    }
    case "sum":
      return { kind: "sum", amount: p.amount.v, everyMonths: p.every };
    case "perAction":
      return { kind: "perAction", amount: p.amount.v, ...(p.cap ? { cap: fraction(p.cap.v) } : {}), ...currencyOf(p.currency) };
  }
}

const engineStages = (stages: readonly Stage[]): DealStage[] => stages.map((s) => ({ price: enginePrice(s.price), ...(s.until ? { until: monthOf(s.until) } : {}) }));

/** A fee as the engine reads it, with the stretch of sizes it is charged on where it is one step of a size read across sizes (F-115). */
export function engineFee(f: ReadFee): DealFee {
  const step = f.read?.step;
  return {
    base: engineBase(f.kind),
    stages: engineStages(f.stages),
    ...(f.sale ? { sale: engineStages(f.sale) } : {}),
    ...(step ? { within: { on: step.on, from: step.from?.v ?? 0, to: step.to?.v ?? null, currency: step.currency } } : {}),
  };
}

/**
 * The deal as the engine reads it (F-110 to F-117), its fees in the deal's order: the fees `fees` where given (the ones the reading reads),
 * else every fee read for the deal's picks (`readFees`); what is bought foreign by the picks (F-114).
 */
export function engineDeal(deal: FeeDeal, fees?: readonly ReadFee[], picks?: readonly ReadPick[]): Deal {
  const read = fees && picks ? { fees, picks } : readFees(deal);
  return {
    fees: read.fees.map(engineFee),
    foreign: isForeign(deal, read.picks),
    ...(deal.provider ? { provider: deal.provider } : {}),
  };
}
