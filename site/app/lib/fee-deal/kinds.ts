// The kinds a deal can be (method §10.6): every product record that lists fee bases, with its bases and its legal caps (`fee_caps`,
// data-schema §3.3), as the fee page's data carries them. F-113 judges a typed price against its fee's cap here.
import { capStanding, chargesNothing, type CapStanding } from "@finance-tool/engine";
import type { FeeBase, FeeCap, ProductId, ProductRecord } from "@finance-tool/schema";
import type { SiteValue } from "../value";
import { fraction, onAction, type Price, type ProviderKind } from "./model";
import { enginePrice } from "./to-engine";
import { FEE_SHAPES, type FeeKindId } from "./shapes";
import { recordValue } from "./values";

/**
 * One kind of deal: a product record's id, its first Hebrew name, the fee bases it allows and their caps, and whether it is of the provident
 * family (`provident`: its record names the Capital Market Authority as its regulator, which supervises the provident funds, PF-01).
 */
export interface DealKind {
  id: ProductId;
  name: string;
  bases: FeeBase[];
  caps: Partial<Record<FeeBase, FeeCap>>;
  provident?: true;
}

/** The regulator a product record of the provident family names (data-schema §3.3, `regulator`). */
const PROVIDENT_REGULATOR = "CMA";

/**
 * The kinds of the product records, for the fee page's data: every record that lists a fee base. Built at build time; each cap ships
 * without its record's working notes, which the page does not show.
 */
export function dealKindsOf(records: readonly ProductRecord[]): DealKind[] {
  const shipped = (c: FeeCap): FeeCap => {
    const { notes: _notes, ...rest } = c;
    return rest;
  };
  return records
    .filter((r) => r.fee_bases_allowed.length > 0)
    .map((r) => ({ id: r.id, name: r.names.he[0]!, bases: [...r.fee_bases_allowed], caps: Object.fromEntries(Object.entries(r.fee_caps ?? {}).map(([b, c]) => [b, shipped(c)])), ...(r.regulator.value === PROVIDENT_REGULATOR ? { provident: true as const } : {}) }));
}

/**
 * Whether a fee is a provident-family product's management fee, from each deposit or from the balance (KGL-14): its rules allow those
 * charges as rates alone (PF-01), with a discount for a period (PF-13), so the toolbox offers it no other part.
 */
export const managementFee = (kind: DealKind | null, fee: FeeKindId): boolean => !!kind?.provident && (fee === "deposit" || fee === "balance");

export const kindById = (kinds: readonly DealKind[], id: ProductId | null): DealKind | null => (id === null ? null : (kinds.find((k) => k.id === id) ?? null));

/** The record's cap entry for a fee, where the fee is a record base the record caps. */
export const capOf = (kind: DealKind | null, fee: FeeKindId): FeeCap | undefined => {
  const base = FEE_SHAPES[fee].base;
  return base && kind ? kind.caps[base] : undefined;
};

/**
 * A fee's cap line, as the page states it beside the fee: `value`, a cap with a value (zero where the law allows no such fee), with its
 * unit, whom it binds, the case it holds in alone (`caveat`) and its rules; `none`, the record says the law sets no cap (its value is
 * empty), with the case where it says one is set all the same; `absent`, the record has no entry for the fee, or the fee is no record base.
 */
export type CapLine =
  | { state: "value"; value: SiteValue; binds?: FeeCap["binds"]; caveat?: FeeCap["caveat"]; ruleIds: string[] }
  | { state: "none"; value: SiteValue; caveat?: FeeCap["caveat"]; ruleIds: string[] }
  | { state: "absent" };

export function capLine(kind: DealKind | null, fee: FeeKindId): CapLine {
  const cap = capOf(kind, fee);
  if (!cap) return { state: "absent" };
  const { binds, caveat, ...vo } = cap;
  const value = recordValue(vo);
  const ruleIds = cap.rule_ids ?? [];
  if (typeof cap.value !== "number") return { state: "none", value, ...(caveat ? { caveat } : {}), ruleIds };
  return { state: "value", value, ...(binds ? { binds } : {}), ...(caveat ? { caveat } : {}), ruleIds };
}

/**
 * A price in its cap's unit (F-113's `x`), and whether it was `converted` from another period than the cap's by F-111's plain multiple. It is
 * the price charged: a discount is taken off as F-116 takes it off (its rate, its sum per action, and its minimum where the list says so),
 * and a third party's fee is not the provider's and is left out (F-117). A free price is 0; a share of what is held against a yearly cap is
 * its yearly rate (`rate × 12 / per`, converted where `per` is not a year), and against a cap per period its share of each charge (`rate ×
 * every / per`, converted where the two differ); a share of an action against a share of a deposit or a trade is its rate; a sum in shekels
 * on each action against a sum per transfer or trade is the sum; a sum per period against a monthly sum is its month's part (converted
 * where the period is not a month). A sum per unit, and a sum per action in another currency, state no figure in a cap's unit. Where the
 * cap is 0 the unit does not matter: a price that charges anything (F-110), a rate of zero with a minimum among them, is above it, so `x`
 * is its main figure, or its minimum where the rate is zero, and 0 for a price that charges nothing. Undefined where the price's form is
 * not one the cap's unit states.
 */
export function inCapUnit(p: Price, unit: FeeCap["unit"], cap: number): { x: number; converted: boolean } | undefined {
  const as = (x: number, converted = false) => ({ x, converted });
  if (p.form === "free") return as(0);
  const own = withoutThird(p);
  // F-116: the share left after the discount, on the rate or the sum, and on the minimum where the list says the discount is on it too
  const left = onAction(own) && own.discount ? 1 - fraction(own.discount.pct.v) : 1;
  const minLeft = onAction(own) && own.discount?.alsoMin ? left : 1;
  if (cap === 0) {
    if (chargesNothing(enginePrice(own))) return as(0);
    const main = mainValue(own) * (own.form === "held" ? 1 : left);
    return as(main > 0 ? main : (own.form === "action" || own.form === "perUnit" || own.form === "held") && own.min ? own.min.v * (own.form === "held" ? 1 : minLeft) : (own.form === "action" || own.form === "perUnit") && own.flat ? own.flat.amount.v : 0);
  }
  switch (unit) {
    case "pct_per_year":
      return own.form === "held" ? as((own.rate.v * 12) / own.per, own.per !== 12) : undefined;
    case "pct_of_balance_per_period":
      return own.form === "held" ? as((own.rate.v * own.every) / own.per, own.every !== own.per) : undefined;
    case "pct_of_deposit":
    case "pct_of_trade":
    case "pct":
      return own.form === "action" ? as(own.rate.v * left) : undefined;
    case "nis_per_transfer":
    case "nis_per_trade":
      return own.form === "perAction" && (own.currency ?? "ILS") === "ILS" ? as(own.amount.v * left) : undefined;
    case "nis_per_month":
      return own.form === "sum" ? as(own.amount.v / own.every, own.every !== 1) : undefined;
    default:
      return undefined;
  }
}

/** A price without its third party's fee: F-113 judges the provider's own price (F-117). */
const withoutThird = (p: Exclude<Price, { form: "free" }>): Exclude<Price, { form: "free" }> => {
  if (!onAction(p) || !p.third) return p;
  const { third: _t, ...rest } = p;
  return rest as Exclude<Price, { form: "free" }>;
};

/** A price's one figure: its rate, or its sum. */
const mainValue = (p: Exclude<Price, { form: "free" }>): number => (p.form === "action" || p.form === "held" ? p.rate.v : p.amount.v);

/** F-113's answer for one price, or `other-form` where the price is typed in a form the cap's unit does not state. */
export type Standing = CapStanding | { judged: false; why: "other-form" };

/**
 * F-113 One price of a fee against the kind's cap for it, judged for the deal's provider. A cap with a `caveat` is never judged, whatever
 * the price and the cap's value (an empty one included).
 */
export function standingOf(kind: DealKind | null, fee: FeeKindId, p: Price, provider: ProviderKind | undefined): Standing {
  const cap = capOf(kind, fee);
  if (cap?.caveat !== undefined) return capStanding(undefined, cap, provider);
  if (!cap || typeof cap.value !== "number") return { judged: false, why: "no-cap" };
  const x = inCapUnit(p, cap.unit, cap.value);
  if (x === undefined) return { judged: false, why: "other-form" };
  return capStanding(x.x, cap, provider, x.converted);
}
