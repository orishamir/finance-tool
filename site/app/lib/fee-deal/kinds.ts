// The kinds a deal can be (method §10.6): every product record that lists fee bases, with its bases and its legal caps (`fee_caps`,
// data-schema §3.3), as the fee page's data carries them. F-113 judges a typed price against its fee's cap here.
import { capStanding, type CapStanding } from "@finance-tool/engine";
import type { FeeBase, FeeCap, ProductId, ProductRecord } from "@finance-tool/schema";
import type { SiteValue } from "../value";
import type { Price, ProviderKind } from "./model";
import { FEE_SHAPES, type FeeKindId } from "./shapes";
import { recordValue } from "./values";

/** One kind of deal: a product record's id, its first Hebrew name, the fee bases it allows and their caps. */
export interface DealKind {
  id: ProductId;
  name: string;
  bases: FeeBase[];
  caps: Partial<Record<FeeBase, FeeCap>>;
}

/** The kinds of the product records, for the fee page's data: every record that lists a fee base. Built at build time. */
export function dealKindsOf(records: readonly ProductRecord[]): DealKind[] {
  return records.filter((r) => r.fee_bases_allowed.length > 0).map((r) => ({ id: r.id, name: r.names.he[0]!, bases: [...r.fee_bases_allowed], caps: { ...r.fee_caps } }));
}

export const kindById = (kinds: readonly DealKind[], id: ProductId | null): DealKind | null => (id === null ? null : (kinds.find((k) => k.id === id) ?? null));

/** The record's cap entry for a fee, where the fee is a record base the record caps. */
export const capOf = (kind: DealKind | null, fee: FeeKindId): FeeCap | undefined => {
  const base = FEE_SHAPES[fee].base;
  return base && kind ? kind.caps[base] : undefined;
};

/**
 * A fee's cap line, as the page states it beside the fee: `value`, a cap with a value (zero where the law allows no such fee), with its
 * unit, whom it binds and its rules; `none`, the record says the law sets no cap (its value is empty); `absent`, the record has no entry
 * for the fee, or the fee is no record base.
 */
export type CapLine = { state: "value"; value: SiteValue; binds?: FeeCap["binds"]; ruleIds: string[] } | { state: "none"; value: SiteValue; ruleIds: string[] } | { state: "absent" };

export function capLine(kind: DealKind | null, fee: FeeKindId): CapLine {
  const cap = capOf(kind, fee);
  if (!cap) return { state: "absent" };
  const { binds, ...vo } = cap;
  const value = recordValue(vo);
  const ruleIds = cap.rule_ids ?? [];
  if (typeof cap.value !== "number") return { state: "none", value, ruleIds };
  return { state: "value", value, ...(binds ? { binds } : {}), ruleIds };
}

/**
 * A typed price in its cap's unit (F-113's `x`): a free price is 0; a share of what is held against a yearly cap is its yearly rate
 * (F-111, `rate × 12 / per`), and against a cap per period its share of each charge; a share of an action against a share of a deposit
 * or a trade is its rate; a sum on each action against a sum per transfer or trade is the sum; a sum per period against a monthly sum is
 * its month's part. Where the cap is 0 the unit does not matter: any price above nothing is above it. Undefined where the price's form
 * is not one the cap's unit states.
 */
export function inCapUnit(p: Price, unit: FeeCap["unit"], cap: number): number | undefined {
  if (p.form === "free") return 0;
  if (cap === 0) return mainFigure(p);
  switch (unit) {
    case "pct_per_year":
      return p.form === "held" ? (p.rate.v * 12) / p.per : undefined;
    case "pct_of_balance_per_period":
      return p.form === "held" ? (p.rate.v * p.every) / p.per : undefined;
    case "pct_of_deposit":
    case "pct_of_trade":
    case "pct":
      return p.form === "action" ? p.rate.v : undefined;
    case "nis_per_transfer":
    case "nis_per_trade":
      return p.form === "perAction" ? p.amount.v : undefined;
    case "nis_per_month":
      return p.form === "sum" ? p.amount.v / p.every : undefined;
    default:
      return undefined;
  }
}

/** A price's one figure: its rate, or its sum. */
const mainFigure = (p: Exclude<Price, { form: "free" }>): number => (p.form === "action" || p.form === "held" ? p.rate.v : p.amount.v);

/** F-113's answer for one price, or `other-form` where the price is typed in a form the cap's unit does not state. */
export type Standing = CapStanding | { judged: false; why: "other-form" };

/** F-113 One price of a fee against the kind's cap for it, judged for the deal's provider. */
export function standingOf(kind: DealKind | null, fee: FeeKindId, p: Price, provider: ProviderKind | undefined): Standing {
  const cap = capOf(kind, fee);
  if (!cap || typeof cap.value !== "number") return { judged: false, why: "no-cap" };
  const x = inCapUnit(p, cap.unit, cap.value);
  if (x === undefined) return { judged: false, why: "other-form" };
  return capStanding(x, cap, provider);
}
