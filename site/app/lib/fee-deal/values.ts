// A deal's numbers as the site shows them (design.md, the three number states): a figure the person typed is entered, a figure a
// template or a record filled is sourced, and a reading of §10.6 is computed with its formula id and the figures it rests on. The inputs
// of a reading are keyed in English (`inputKey`); the sheet names them through the copy's computed-input names.
import type { ValueObject } from "@finance-tool/schema";
import { computed, entered, type SiteValue } from "../value";
import type { Fee, Num, Price, Sourced } from "./model";
import { FEE_SHAPES } from "./shapes";

export type Unit = ValueObject["unit"];

/** A value object's source as a template keeps it on a deal's figure (`Num.src`). */
export function sourcedOf(v: ValueObject, own?: string): Sourced {
  return {
    url: v.source.url,
    title: v.source.title,
    publisher: v.source.publisher,
    strength: v.source.strength,
    checked: v.checked,
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
    source: { url: s.url, title: s.title, publisher: s.publisher, strength: s.strength },
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
export const actionRateUnit = (fee: Fee): Unit => (fee.kind === "deposit" ? "pct_of_deposit" : fee.kind === "exit" ? "pct" : "pct_of_trade");

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

/** The unit of a sum: a month's, else a sum for the period (the period is said beside it). */
export const sumUnit = (every: number): Unit => (every === 1 ? "nis_per_month" : "nis");

/** The unit of a sum on each action: on each transfer for a transfer out, on each action otherwise. */
export const perActionUnit = (fee: Fee): Unit => (fee.kind === "transfer_out" ? "nis_per_transfer" : "nis_per_trade");

/** The unit of a held rate as typed: a year's where it is for a year, a period's otherwise. */
export const heldRateUnit = (per: number): Unit => (per === 12 ? "pct_per_year" : "pct_of_balance_per_period");

/**
 * The key a fee's figure takes among a reading's inputs: `deal:` and the fee's kind, with a number after the kind where the deal has two
 * fees of it, and the field after a dot where it is not the rate or the sum (`deal:trade.min`, `deal:custody 2.yearly`). The prefix keeps
 * the keys apart from other readings' (`balance` is a run's balance there); the copy names every such key.
 */
export function inputKey(fees: readonly Fee[], i: number, field?: "min" | "max" | "yearly"): string {
  const fee = fees[i]!;
  const same = fees.filter((f) => f.kind === fee.kind);
  const n = same.length > 1 ? ` ${same.indexOf(fee) + 1}` : "";
  return `deal:${fee.kind}${n}${field ? `.${field}` : ""}`;
}

/** The figures of one price as value objects, each in its unit (a free price has none). */
export interface PriceFigures {
  rate?: SiteValue;
  min?: SiteValue;
  max?: SiteValue;
  amount?: SiteValue;
}

/** A price's figures; a blank rate or sum (`Num.blank`) is left out, since it states nothing. */
export function priceFigures(fee: Fee, p: Price, today: string): PriceFigures {
  const given = (n: Num, unit: Unit) => (n.blank ? {} : { [p.form === "sum" || p.form === "perAction" ? "amount" : "rate"]: figure(n, unit, today) });
  switch (p.form) {
    case "free":
      return {};
    case "action":
      return { ...given(p.rate, actionRateUnit(fee)), ...(p.min ? { min: figure(p.min, boundUnit(p.currency), today) } : {}), ...(p.max ? { max: figure(p.max, boundUnit(p.currency), today) } : {}) };
    case "held":
      return { ...given(p.rate, heldRateUnit(p.per)), ...(p.min ? { min: figure(p.min, "nis", today) } : {}), ...(p.max ? { max: figure(p.max, "nis", today) } : {}) };
    case "sum":
      return given(p.amount, sumUnit(p.every));
    case "perAction":
      return given(p.amount, perActionUnit(fee));
  }
}

/** Whether a fee is charged inside a fund (its management fee), which the page says beside it. */
export const insideFund = (fee: Fee): boolean => fee.kind === "fund_management" || FEE_SHAPES[fee.kind].base === "trustee" || FEE_SHAPES[fee.kind].base === "variable_management";
