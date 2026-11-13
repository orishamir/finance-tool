// A deal's numbers as the site shows them (design.md, the three number states): a figure the person typed is entered, a figure a
// template or a record filled is sourced, and a reading of §10.6 is computed with its formula id and the figures it rests on. The inputs
// of a reading are keyed in English (`inputKey`); the sheet names them through the copy's computed-input names.
import type { ValueObject } from "@finance-tool/schema";
import { computed, entered, type SiteValue } from "../value";
import type { Fee, Num, Price, Sourced, ThirdPrice } from "./model";
import { FEE_SHAPES } from "./shapes";

export type Unit = ValueObject["unit"];

/** The page a value's source gives, where it gives one. */
const pageOf = (v: ValueObject): number | undefined => {
  const page = (v.source as { page?: unknown }).page;
  return typeof page === "number" && Number.isInteger(page) && page > 0 ? page : undefined;
};

/** A value object's source as a template keeps it on a deal's figure (`Num.src`). */
export function sourcedOf(v: ValueObject, own?: string): Sourced {
  return {
    url: v.source.url,
    title: v.source.title,
    publisher: v.source.publisher,
    strength: v.source.strength,
    checked: v.checked,
    // a price list's figure carries the page it stands on (data-schema §3.6, `page` beside the source)
    ...(pageOf(v) ? { page: pageOf(v)! } : {}),
    ...(v.effective_from ? { effectiveFrom: v.effective_from } : {}),
    ...(v.effective_to ? { effectiveTo: v.effective_to } : {}),
    ...(v.rule_ids?.length ? { ruleIds: v.rule_ids } : {}),
    // D31: a company's figure about its own product is shown on that product as plain sourced
    ...(own && v.source.strength === "institution" ? { own } : {}),
  };
}

/** A figure of a deal as a value object: sourced with its record's source where a template filled it, else entered by the person. */
export function figure(n: Num, unit: Unit, today: string, about?: string): SiteValue {
  if (!n.src) return entered(n.v, unit, today, about);
  const s = n.src;
  return {
    value: n.v,
    unit,
    source: { url: s.url, title: s.title, publisher: s.publisher, strength: s.strength, ...(s.page ? { page: s.page } : {}) },
    checked: s.checked,
    effective_from: s.effectiveFrom ?? null,
    effective_to: s.effectiveTo ?? null,
    update_rule: "market",
    state: "sourced",
    ...(s.ruleIds ? { rule_ids: s.ruleIds } : {}),
    ...(s.own ? { own: s.own } : {}),
    ...(about ? { about } : {}),
  };
}

/** A reading of §10.6 (`formula` F-110 to F-113) as a computed value, with the figures it rests on. */
export function reading(value: number, unit: Unit, formula: string, inputs: Record<string, SiteValue>, today: string): SiteValue {
  return computed(value, unit, formula, inputs, { today });
}

/** A record's value object as the site shows it (a cap of the kind's record): sourced, as the record holds it. */
export const recordValue = (v: ValueObject): SiteValue => ({ ...v });

/** The unit of an action's rate: a share of each deposit for a deposit fee, of each trade or conversion otherwise. */
export const actionRateUnit = (fee: Pick<Fee, "kind">): Unit => (fee.kind === "deposit" ? "pct_of_deposit" : fee.kind === "exit" ? "pct" : "pct_of_trade");

/** The unit of a bound in a currency, per action. */
export function boundUnit(currency: string | undefined): Unit {
  switch (currency ?? "ILS") {
    case "USD":
      return "usd_per_trade";
    case "EUR":
      return "eur";
    case "GBP":
      return "gbp_per_trade";
    default:
      return "nis_per_trade";
  }
}

/** The unit of a sum of money in a currency, on its own (a flat price's sum, a mark's): shekels, dollars, euros or pounds. */
export function sumUnit(currency: string | undefined): Unit {
  switch (currency ?? "ILS") {
    case "USD":
      return "usd";
    case "EUR":
      return "eur";
    case "GBP":
      return "gbp_per_trade";
    default:
      return "nis";
  }
}

/** The unit of a sum for each unit traded, in its currency (F-12's price per share). */
export function perUnitUnit(currency: string | undefined): Unit {
  switch (currency ?? "ILS") {
    case "USD":
      return "usd_per_share";
    case "EUR":
      return "eur_per_share";
    case "GBP":
      return "gbp_per_share";
    default:
      return "nis_per_share";
  }
}

/** The unit of a sum per period: a month's, else a sum for the period (the period is said beside it). */
export const periodSumUnit = (every: number): Unit => (every === 1 ? "nis_per_month" : "nis");

/**
 * The unit of a sum on each action: in shekels, on each transfer for a transfer out and on each action otherwise; in another currency, on
 * each event for a corporate event (F-103) and the bound's unit otherwise.
 */
export function perActionUnit(fee: Pick<Fee, "kind">, currency?: string): Unit {
  if (currency && currency !== "ILS") return fee.kind === "corporate_event" && currency === "USD" ? "usd_per_event" : boundUnit(currency);
  return fee.kind === "transfer_out" ? "nis_per_transfer" : "nis_per_trade";
}

/** The unit of a held rate as typed: a year's where it is for a year, a period's otherwise. */
export const heldRateUnit = (per: number): Unit => (per === 12 ? "pct_per_year" : "pct_of_balance_per_period");

/**
 * The key a fee's figure takes among a reading's inputs: `deal:` and the fee's kind, with a number after the kind where the deal has two
 * fees of it, and the field after a dot where it is not the rate or the sum (`deal:trade.min`, `deal:custody 2.yearly`; `cap` the percent
 * maximum, `flat` a flat price and `upTo` the sum it holds up to). The prefix keeps the keys apart from other readings' (`balance` is a
 * run's balance there); the copy names every such key. A discount's share is `discount`, a third party's figure and bounds `third`,
 * `thirdMin` and `thirdMax` (F-116, F-117).
 */
export type InputField = "min" | "max" | "yearly" | "cap" | "flat" | "upTo" | "discount" | "third" | "thirdMin" | "thirdMax";

export function inputKey(fees: readonly Pick<Fee, "kind">[], i: number, field?: InputField): string {
  const fee = fees[i]!;
  const same = fees.filter((f) => f.kind === fee.kind);
  const n = same.length > 1 ? ` ${same.indexOf(fee) + 1}` : "";
  return `deal:${fee.kind}${n}${field ? `.${field}` : ""}`;
}

/**
 * The figures of one price as value objects, each in its unit (a free price has none), keyed as the screen edits them (edit.ts,
 * `Figure`): its rate or its sum (`amount`, a sum per unit's among them), its bounds, its percent maximum (`cap`, a share of the action),
 * and its flat price (`flat`, the price per action) with the sum it holds up to (`upTo`); its sums in the price's currency.
 */
export interface PriceFigures {
  rate?: SiteValue;
  min?: SiteValue;
  max?: SiteValue;
  amount?: SiteValue;
  cap?: SiteValue;
  flat?: SiteValue;
  upTo?: SiteValue;
  /** The discount's share off the price (F-116), in percent. */
  discount?: SiteValue;
  /** A third party's rate or sum and its bounds (F-117), each in its unit. */
  third?: SiteValue;
  thirdMin?: SiteValue;
  thirdMax?: SiteValue;
  /** A refund, in the price's currency (§10.6's stated parts). */
  refund?: SiteValue;
}

/** A third party's figures as value objects (F-117): its rate or sum, and its bounds, in its currency. */
function thirdFigures(fee: Pick<Fee, "kind">, t: ThirdPrice, today: string): PriceFigures {
  const main = t.form === "action" ? figure(t.rate, actionRateUnit(fee), today) : t.form === "perUnit" ? figure(t.amount, perUnitUnit(t.currency), today) : figure(t.amount, perActionUnit(fee, t.currency), today);
  const bound = (n: Num | undefined) => (n ? figure(n, boundUnit(t.currency), today) : undefined);
  const min = t.form === "perAction" ? undefined : bound(t.min);
  const max = t.form === "perAction" ? undefined : bound(t.max);
  return { ...(main && !(t.form === "action" ? t.rate : t.amount).blank ? { third: main } : {}), ...(min ? { thirdMin: min } : {}), ...(max ? { thirdMax: max } : {}) };
}

/**
 * A price's figures; a blank rate or sum (`Num.blank`), or a blank figure of a flat price, a discount, a third party's fee or a refund, is
 * left out, since it states nothing.
 */
export function priceFigures(fee: Pick<Fee, "kind">, p: Price, today: string): PriceFigures {
  const of = (key: "rate" | "amount" | "discount" | "refund", n: Num | undefined, unit: Unit) => (!n || n.blank ? {} : { [key]: figure(n, unit, today) });
  const opt = (key: "min" | "max" | "cap", n: Num | undefined, unit: Unit) => (n ? { [key]: figure(n, unit, today) } : {});
  const parts = (x: Extract<Price, { form: "action" | "perUnit" | "perAction" }>) => ({
    ...of("discount", x.discount?.pct, "pct"),
    ...(x.third?.price ? thirdFigures(fee, x.third.price, today) : {}),
    ...of("refund", x.refund, sumUnit(x.currency)),
  });
  switch (p.form) {
    case "free":
      return {};
    case "action":
    case "perUnit": {
      const main = p.form === "action" ? of("rate", p.rate, actionRateUnit(fee)) : of("amount", p.amount, perUnitUnit(p.currency));
      const flat = p.flat ? { ...(p.flat.amount.blank ? {} : { flat: figure(p.flat.amount, boundUnit(p.currency), today) }), ...(p.flat.upTo.blank ? {} : { upTo: figure(p.flat.upTo, sumUnit(p.currency), today) }) } : {};
      return { ...main, ...opt("min", p.min, boundUnit(p.currency)), ...opt("max", p.max, boundUnit(p.currency)), ...opt("cap", p.cap, "pct_of_trade"), ...flat, ...parts(p) };
    }
    case "held":
      return { ...of("rate", p.rate, heldRateUnit(p.per)), ...opt("min", p.min, "nis"), ...opt("max", p.max, "nis"), ...of("refund", p.refund, "nis") };
    case "sum":
      return { ...of("amount", p.amount, periodSumUnit(p.every)), ...of("refund", p.refund, "nis") };
    case "perAction":
      return { ...of("amount", p.amount, perActionUnit(fee, p.currency)), ...parts(p) };
  }
}

/** Whether a fee is charged inside a fund (its management fee), which the page says beside it. */
export const insideFund = (fee: Pick<Fee, "kind">): boolean => fee.kind === "fund_management" || FEE_SHAPES[fee.kind].base === "trustee" || FEE_SHAPES[fee.kind].base === "variable_management";
