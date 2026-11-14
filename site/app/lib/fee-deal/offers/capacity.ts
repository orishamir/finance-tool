// What each fee kind's price can hold (method §10.6, F-110): the forms it can take, its usual form, the fields of each form, whether a
// sale may be priced apart, the side it is charged on alone, and the record's fee base it is. This is the model's limit and the one
// answer to what a fee can hold: a part stands on a price only where its form's fields list the part's field (offers/parts.ts), a price
// is read only with the fields its form lists (`readPrice`), and a price's sums are in a currency of their own only where the form lists
// one (`sumCurrency`). No product narrows it, so every saved deal and link that held a price of these forms and fields still opens. What a
// product's fee is offered (the toolbox, a template) is narrower, and is decided in offer.ts. Pure data; no Hebrew.
import type { FeeBase } from "@finance-tool/schema";
import type { BoundCurrency, FeeKindId, FormId, Price, Side } from "../core";
import { onAction } from "./capabilities";

/**
 * A field of a price: its rate, the months the rate is for, the months between charges, its bounds, the currency of its sums, a sum (a
 * sum per unit's among them), the percent maximum (`cap`, a share of the action that wins over the minimum, F-12) and the flat price for a
 * small action (`flat`, its price and the sum it holds up to, F-12, F-13), a held share's maximum on each security (`perSecurity`,
 * §10.6's stated parts), and sums in the currency the action is made in (`inTrade`, §10.6). Each field but a form's own (its rate or sum
 * and its periods) is kept in the price under its own name.
 */
export type FieldId = "rate" | "per" | "every" | "min" | "max" | "currency" | "amount" | "cap" | "flat" | "perSecurity" | "inTrade";

/** The fields a price holds beside its form's own figure and periods, each kept in the price under its own name (`Price[field]`). */
export const PART_FIELDS = ["min", "max", "currency", "cap", "flat", "perSecurity", "inTrade"] as const satisfies readonly FieldId[];
export type PartFieldId = (typeof PART_FIELDS)[number];

/** A form that charges something: every form but free, which every price can be. */
export type ChargedForm = Exclude<FormId, "free">;

export interface Capacity {
  /** The record's fee base the fee is, which gives its cap (F-113); null for a fee no record names. */
  base: FeeBase | null;
  /** The forms it can take besides `free`. */
  forms: readonly ChargedForm[];
  /** The form a new price of it takes. */
  usual: ChargedForm;
  /** The fields of each form. */
  fields: Partial<Record<ChargedForm, readonly FieldId[]>>;
  /** Whether a sale may be priced apart from a purchase. */
  saleApart: boolean;
  /** The side of a trade it is charged on alone (F-111): a load on a purchase, a redemption deduction on a sale. */
  oneSide?: Side;
}

const ACTION_ALL: readonly FieldId[] = ["rate", "min", "max", "currency"];
/** The trade fee's share of an action: its bounds, the percent maximum and the flat price (F-12), its sums in the trade's currency. */
const TRADE: readonly FieldId[] = ["rate", "min", "max", "cap", "flat", "currency", "inTrade"];
/** The trade fee's sum per unit (F-12's price per share), with the same parts. */
const PER_UNIT: readonly FieldId[] = ["amount", "min", "max", "cap", "flat", "currency", "inTrade"];
/** The conversion's share: its bounds and the flat price (F-13). */
const FX: readonly FieldId[] = ["rate", "min", "max", "flat", "currency"];
const RATE: readonly FieldId[] = ["rate"];
const HELD: readonly FieldId[] = ["rate", "per", "every"];
const HELD_BOUNDED: readonly FieldId[] = ["rate", "per", "every", "min", "max"];
/** Custody's share of what is held: its bounds per charge, and a maximum on each security that the page states (§10.6's stated parts). */
const CUSTODY: readonly FieldId[] = [...HELD_BOUNDED, "perSecurity"];
const SUM: readonly FieldId[] = ["amount", "every"];
const AMOUNT: readonly FieldId[] = ["amount"];
/** A sum per action in a currency of its own (F-103's charge in dollars for each corporate event). */
const AMOUNT_IN: readonly FieldId[] = ["amount", "currency"];
/** A trade's sum on each order, in its currency or the trade's, under a percent ceiling where the list prints one (Excellence's US fixed track). */
const AMOUNT_IN_CAP: readonly FieldId[] = ["amount", "currency", "cap", "inTrade"];

const action = (fields: readonly FieldId[], saleApart = false): Capacity => ({ base: null, forms: ["action"], usual: "action", fields: { action: fields }, saleApart });
const held = (fields: readonly FieldId[] = HELD): Capacity => ({ base: null, forms: ["held"], usual: "held", fields: { held: fields }, saleApart: false });
const sum = (): Capacity => ({ base: null, forms: ["sum"], usual: "sum", fields: { sum: SUM }, saleApart: false });

/**
 * Every fee kind's capacity, in the order the page lists fees (a trade before its conversion). A record base is its own `base`; the four the
 * records do not list take the base whose cap would apply, or none.
 */
export const CAPACITY: Readonly<Record<FeeKindId, Capacity>> = {
  trade: { base: "trade", forms: ["action", "perUnit", "perAction"], usual: "action", fields: { action: TRADE, perUnit: PER_UNIT, perAction: AMOUNT_IN_CAP }, saleApart: true },
  spread: { ...action(RATE), base: "spread" },
  creation_redemption: { ...action(RATE, true), base: "creation_redemption" },
  load: { ...action(RATE), base: "load", oneSide: "buy" },
  redemption_deduction: { ...action(RATE), base: "redemption_deduction", oneSide: "sell" },
  fx: { ...action(FX), base: "fx" },
  fx_spread: { ...action(RATE), base: null },
  deposit: { ...action(RATE), base: "deposit" },
  distribution_handling: { base: "distribution_handling", forms: ["action", "perAction"], usual: "action", fields: { action: ACTION_ALL, perAction: AMOUNT }, saleApart: false },
  corporate_event: { base: "corporate_event", forms: ["perAction"], usual: "perAction", fields: { perAction: AMOUNT_IN }, saleApart: false },
  transfer_out: { base: "transfer_out", forms: ["perAction", "action"], usual: "perAction", fields: { perAction: AMOUNT, action: ACTION_ALL }, saleApart: false },
  exit: { base: "exit", forms: ["action", "perAction"], usual: "action", fields: { action: ACTION_ALL, perAction: AMOUNT }, saleApart: false },
  balance: { ...held(), base: "balance" },
  custody: { base: "custody", forms: ["held", "sum"], usual: "held", fields: { held: CUSTODY, sum: SUM }, saleApart: false },
  variable_management: { ...held(), base: "variable_management" },
  trustee: { ...held(), base: "trustee" },
  direct_expenses: { ...held(), base: "direct_expenses" },
  fund_management: held(),
  fixed_period: { ...sum(), base: "fixed_period" },
  current_account: sum(),
  insurance_premium: { base: "insurance_premium", forms: ["sum", "held", "action"], usual: "sum", fields: { sum: SUM, held: HELD, action: RATE }, saleApart: false },
  own: { base: null, forms: ["action", "held", "sum", "perAction"], usual: "action", fields: { action: ACTION_ALL, held: HELD_BOUNDED, sum: SUM, perAction: AMOUNT }, saleApart: true },
};

/** A fee kind's capacity. */
export const capacity = (kind: FeeKindId): Capacity => CAPACITY[kind];

/** Whether a fee can take a form (every fee can be free). */
export const takes = (kind: FeeKindId, form: FormId): boolean => form === "free" || CAPACITY[kind].forms.includes(form);

/** Whether a fee can take a form that `of` holds of (a capability of capabilities.ts). */
export const takesAny = (kind: FeeKindId, of: (form: FormId) => boolean): boolean => CAPACITY[kind].forms.some(of);

/** The fields a fee's form has (none for free, or a form the fee cannot take). */
export const fieldsOf = (kind: FeeKindId, form: FormId): readonly FieldId[] => (form === "free" ? [] : (CAPACITY[kind].fields[form] ?? []));

/** Whether a fee's form has a field. */
export const keeps = (kind: FeeKindId, form: FormId, field: FieldId): boolean => fieldsOf(kind, form).includes(field);

/**
 * The currency a fee's price keeps its sums in, in its own form or in `form`: the price's currency where that form of the fee has one, else
 * the shekel (a share of what is held, a sum per period, a deposit's share).
 */
export const sumCurrency = (kind: FeeKindId, p: Price, form: FormId = p.form): BoundCurrency =>
  onAction(p) && p.currency && keeps(kind, form, "currency") ? p.currency : "ILS";

/** Whether any form a fee can take has a field. */
export const anyField = (kind: FeeKindId, field: FieldId): boolean => Object.values(CAPACITY[kind].fields).some((f) => f.includes(field));

/** Whether a fee's sale may be priced apart: its capacity allows it, and it is not charged on one side alone. */
export const pricesSaleApart = (kind: FeeKindId): boolean => CAPACITY[kind].saleApart && !CAPACITY[kind].oneSide;
