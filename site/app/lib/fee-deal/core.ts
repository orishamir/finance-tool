// The deal's core types (method §10.6, F-110): a fee kind and a price's form, a figure with its source, a price and its parts, and prices
// over time. A leaf: it imports only types from the packages, so the model, the capabilities, the capacity and the figure table all read
// these without importing each other. The checks and helpers on them are in model.ts, which re-exports this file.
import type { DealPrice } from "@finance-tool/engine";
import type { FeeBase, ValueObject } from "@finance-tool/schema";

/**
 * A fee a deal can hold: a fee base of the records (`feeBase` in packages/schema), or one of the four the records do not list:
 * `fund_management`, the management fee inside a fund that is held (F-10, F-111); `fx_spread`, the spread a price list limits on a
 * conversion, priced at its ceiling beside the conversion fee (F-13); `current_account`, the monthly minimum of a current account at a
 * bank (F-102); and `own`, a fee the person names.
 */
export type FeeKindId = FeeBase | "fund_management" | "fx_spread" | "current_account" | "own";

/**
 * A price's form (F-110): `free` (nothing charged), `action` (a share of each action, with a minimum and a maximum), `perUnit` (a sum for
 * each unit traded, with the same bounds), `held` (a share of what is held, charged every few months), `sum` (a sum every few months,
 * whatever the account holds), `perAction` (a sum on each action).
 */
export type FormId = DealPrice["kind"];

export type Strength = ValueObject["source"]["strength"];

/** Where a figure a template filled comes from: the record's source and dates, kept until the person changes the figure. */
export interface Sourced {
  url: string;
  title: string;
  publisher: string;
  strength: Strength;
  /** When the record was read, YYYY-MM-DD. */
  checked: string;
  /** The page of the document the figure stands on, where the record gives it (a PDF's own page count). */
  page?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  ruleIds?: string[];
  /** D31: the company whose own product the figure prices, where the deal is that company's product. */
  own?: string;
}

/**
 * A figure of a deal: entered by the person where it has no `src`, sourced where a template filled it and the person left it. `blank`: a
 * rate or a sum nobody typed and no template filled (a new fee's, a later price just added); its box is empty and its `v` (0) means
 * nothing. A price with a blank figure states no price, so its fee is not read until the figure is typed or the price is made free.
 */
export interface Num {
  v: number;
  src?: Sourced;
  blank?: true;
}

/** Months a rate is for or between charges: a month, a quarter, half a year, a year. */
export type Months = 1 | 3 | 6 | 12;
export const MONTHS: readonly Months[] = [1, 3, 6, 12];

/**
 * A flat price for a small action (F-12, F-13): an action of at most `upTo` pays `amount`, both in the price's currency. Its figures are
 * blank until typed (a switch to a flat price starts it empty), and a price whose flat price is not given states no price yet.
 */
export interface Flat {
  amount: Num;
  upTo: Num;
}

/** A share off a price (F-116): `pct` percent off its rate or sum, and off its minimum too where the list says so (`alsoMin`). */
export interface Discount {
  pct: Num;
  alsoMin?: true;
}

/**
 * A third party's fee with its figure (F-117): a share of the action (`rate` percent), a sum for each unit, or a sum on each action, with
 * its own bounds, each sum in `currency` (the shekel where absent).
 */
export type ThirdPrice =
  | { form: "action"; rate: Num; min?: Num; max?: Num; currency?: BoundCurrency }
  | { form: "perUnit"; amount: Num; min?: Num; max?: Num; currency?: BoundCurrency }
  | { form: "perAction"; amount: Num; currency?: BoundCurrency };

/**
 * A third party's fee printed with a price: whose it is, in the list's words where it names one (`who`: "הברוקר", "הבורסה והסליקה"), and
 * its figure (`price`, F-117), or none where the list gives none ("בלי סכום בתעריפון", §10.6's stated parts).
 */
export interface Third {
  who?: string;
  price?: ThirdPrice;
}

/** A fee a price is offset against: that month's charges of the deal's fee of this kind, up to the price's own sum (§10.6's stated parts). */
export interface Offset {
  kind: FeeKindId;
}

/**
 * What a price list says of an order, beside its price (§10.6's stated parts): charged on an order not carried out too; at a bank, an order
 * through a clerk not carried out for a reason on the client's side charged its minimum, on the Tel Aviv exchange (`unfilledClerk`, BRK-16,
 * notes to part 4(א)(1)) and abroad (`unfilledClerkAbroad`, BRK-16, part 4(א)(4) note 1); each partial fill charged apart; and, where the
 * list prints a percent maximum beside a minimum and does not say which wins on a small action, that the page reads the maximum as
 * winning (`capRead`, F-12: the site's reading, not the list's words).
 */
export type Note = "unfilled" | "unfilledClerk" | "unfilledClerkAbroad" | "capRead" | "partial";
export const NOTES: readonly Note[] = ["unfilled", "unfilledClerk", "unfilledClerkAbroad", "capRead", "partial"];

/** The parts of a price beside its figures that tie it to another fee (§10.6's stated parts): an offset, and a refund in the price's currency. */
interface Linked {
  offset?: Offset;
  refund?: Num;
}

/**
 * The parts of a price on an action beside its figures: a discount (F-116), a third party's fee (F-117), notes on an order (§10.6's stated
 * parts), and that its sums are in the currency the action is made in (`inTrade`: "מינימום 30 במטבע העסקה"), which a reading takes from
 * what is bought where the deal knows its currency (its `currency` is then that one) and otherwise does not read the fee.
 */
interface ActionParts extends Linked {
  discount?: Discount;
  third?: Third;
  notes?: Note[];
  inTrade?: true;
}

/**
 * A price as typed (F-110). Rates and caps are percent; bounds, flat prices and sums are shekels unless the price's `currency` names
 * their currency.
 */
export type Price =
  | { form: "free" }
  /**
   * A share of each action, `rate` percent, with a minimum and a maximum per action, a cap as a percent of the action (`cap`, the percent
   * maximum) and a flat price for a small action, each sum in `currency` (the shekel where absent).
   */
  | ({ form: "action"; rate: Num; min?: Num; max?: Num; cap?: Num; flat?: Flat; currency?: BoundCurrency } & ActionParts)
  /** A sum for each unit traded, `amount` in `currency`, with the same minimum, maximum, cap and flat price as a share of an action. */
  | ({ form: "perUnit"; amount: Num; min?: Num; max?: Num; cap?: Num; flat?: Flat; currency?: BoundCurrency } & ActionParts)
  /**
   * A share of what is held, `rate` percent for each `per` months, charged every `every` months, with shekel bounds per charge, or per
   * month where the price list prints them so (`boundsEvery: 1`, "מינימום 40 ₪ לחודש"), which F-14 turns into a charge's bounds; F-14
   * names no other period a bound is printed in. `perSecurity` is a maximum in shekels on each security held, in the bounds' period
   * ("₪ 7,500 לני״ע לרבעון"): §10.6 states it and never computes it, since the charge it bounds depends on how many securities are held.
   */
  | ({ form: "held"; rate: Num; per: Months; every: Months; min?: Num; max?: Num; perSecurity?: Num; boundsEvery?: 1 } & Linked)
  /** A sum in shekels every `every` months, whatever the account holds. */
  | ({ form: "sum"; amount: Num; every: Months } & Linked)
  /**
   * A sum on each action, in `currency` (the shekel where absent), held to a percent of the action (`cap`, the percent maximum) where the
   * list prints one over it ("11$ פיקס לעסקה" under "עמלת מקסימום 2% משווי העסקה").
   */
  | ({ form: "perAction"; amount: Num; cap?: Num; currency?: BoundCurrency } & ActionParts);

/** The currencies a bound, a flat price, a sum per unit or a sum per action may be typed in: the ones the price lists print (F-12, F-13, F-103). */
export type BoundCurrency = "ILS" | "USD" | "EUR" | "GBP";
export const BOUND_CURRENCIES: readonly BoundCurrency[] = ["ILS", "USD", "EUR", "GBP"];

/** A calendar month, `YYYY-MM`. */
export type MonthKey = string;

/** A price, and the month at whose start it ends; the last price of a fee has no end (F-110). */
export interface Stage {
  price: Price;
  until?: MonthKey;
}

/** Prices over time: a fee's whose price changes by nothing, or one case's; a sale's own where a sale is priced apart. */
export interface Priced {
  stages: Stage[];
  sale?: Stage[];
}

/** Which prices of a fee: its purchase's (or its only ones), or a sale's priced apart. */
export type Side = "buy" | "sell";
