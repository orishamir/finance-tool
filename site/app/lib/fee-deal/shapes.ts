// The fee page's fee shapes (method §10.6): every fee a deal can hold, the price forms it can take, its usual form and the fields
// each form has, and which suggestions fit what an account holds. The ids are stable: the copy names each fee by its id. Pure data and
// small functions; no Hebrew (the names are in copy.ts, under the guide's fee names and the fee page's own keys).
import type { DealBase, DealPrice } from "@finance-tool/engine";
import type { FeeBase, ProductId } from "@finance-tool/schema";

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

/**
 * A field of a price: its rate, the months the rate is for, the months between charges, its bounds, the currency of its sums, a sum (a
 * sum per unit's among them), the percent maximum (`cap`, a share of the action that wins over the minimum, F-12) and the flat price for a
 * small action (`flat`, its price and the sum it holds up to, F-12, F-13).
 */
export type FieldId = "rate" | "per" | "every" | "min" | "max" | "currency" | "amount" | "cap" | "flat";

export interface FeeShape {
  /** The record's fee base the fee is, which gives its cap (F-113); null for a fee no record names. */
  base: FeeBase | null;
  /** The forms it can take besides `free`, which every price can be. */
  forms: readonly Exclude<FormId, "free">[];
  /** The form a new price of it takes. */
  usual: Exclude<FormId, "free">;
  /** The fields of each form. */
  fields: Partial<Record<Exclude<FormId, "free">, readonly FieldId[]>>;
  /** Whether a sale may be priced apart from a purchase. */
  saleApart: boolean;
}

const ACTION_ALL: readonly FieldId[] = ["rate", "min", "max", "currency"];
/** The trade fee's share of an action: its bounds, the percent maximum and the flat price (F-12). */
const TRADE: readonly FieldId[] = ["rate", "min", "max", "cap", "flat", "currency"];
/** The trade fee's sum per unit (F-12's price per share), with the same parts. */
const PER_UNIT: readonly FieldId[] = ["amount", "min", "max", "cap", "flat", "currency"];
/** The conversion's share: its bounds and the flat price (F-13). */
const FX: readonly FieldId[] = ["rate", "min", "max", "flat", "currency"];
const RATE: readonly FieldId[] = ["rate"];
const HELD: readonly FieldId[] = ["rate", "per", "every"];
const HELD_BOUNDED: readonly FieldId[] = ["rate", "per", "every", "min", "max"];
const SUM: readonly FieldId[] = ["amount", "every"];
const AMOUNT: readonly FieldId[] = ["amount"];
/** A sum per action in a currency of its own (F-103's charge in dollars for each corporate event). */
const AMOUNT_IN: readonly FieldId[] = ["amount", "currency"];

const action = (fields: readonly FieldId[], saleApart = false): FeeShape => ({ base: null, forms: ["action"], usual: "action", fields: { action: fields }, saleApart });
const held = (fields: readonly FieldId[] = HELD): FeeShape => ({ base: null, forms: ["held"], usual: "held", fields: { held: fields }, saleApart: false });
const sum = (): FeeShape => ({ base: null, forms: ["sum"], usual: "sum", fields: { sum: SUM }, saleApart: false });

/** Every fee's shape. A record base is its own `base`; the four the records do not list take the base whose cap would apply, or none. */
export const FEE_SHAPES: Readonly<Record<FeeKindId, FeeShape>> = {
  trade: { base: "trade", forms: ["action", "perUnit", "perAction"], usual: "action", fields: { action: TRADE, perUnit: PER_UNIT, perAction: AMOUNT }, saleApart: true },
  spread: { ...action(RATE), base: "spread" },
  creation_redemption: { ...action(RATE, true), base: "creation_redemption" },
  load: { ...action(RATE), base: "load" },
  redemption_deduction: { ...action(RATE), base: "redemption_deduction" },
  fx: { ...action(FX), base: "fx" },
  fx_spread: { ...action(RATE), base: null },
  deposit: { ...action(RATE), base: "deposit" },
  distribution_handling: { base: "distribution_handling", forms: ["action", "perAction"], usual: "action", fields: { action: ACTION_ALL, perAction: AMOUNT }, saleApart: false },
  corporate_event: { base: "corporate_event", forms: ["perAction"], usual: "perAction", fields: { perAction: AMOUNT_IN }, saleApart: false },
  transfer_out: { base: "transfer_out", forms: ["perAction", "action"], usual: "perAction", fields: { perAction: AMOUNT, action: ACTION_ALL }, saleApart: false },
  exit: { base: "exit", forms: ["action", "perAction"], usual: "action", fields: { action: ACTION_ALL, perAction: AMOUNT }, saleApart: false },
  balance: { ...held(), base: "balance" },
  custody: { base: "custody", forms: ["held", "sum"], usual: "held", fields: { held: HELD_BOUNDED, sum: SUM }, saleApart: false },
  variable_management: { ...held(), base: "variable_management" },
  trustee: { ...held(), base: "trustee" },
  direct_expenses: { ...held(), base: "direct_expenses" },
  fund_management: held(),
  fixed_period: { ...sum(), base: "fixed_period" },
  current_account: sum(),
  insurance_premium: { base: "insurance_premium", forms: ["sum", "held", "action"], usual: "sum", fields: { sum: SUM, held: HELD, action: RATE }, saleApart: false },
  own: { base: null, forms: ["action", "held", "sum", "perAction"], usual: "action", fields: { action: ACTION_ALL, held: HELD_BOUNDED, sum: SUM, perAction: AMOUNT }, saleApart: true },
};

export const FEE_KIND_IDS = Object.keys(FEE_SHAPES) as FeeKindId[];

export const isFeeKindId = (x: unknown): x is FeeKindId => typeof x === "string" && Object.hasOwn(FEE_SHAPES, x);

/**
 * The engine's base of a fee (§10.6): a record base as itself; the spread of a conversion as a conversion (F-13: it is part of the
 * conversion's price); the fund's own fee and a current account as named fees, which F-111 places by their price's form.
 */
export function engineBase(kind: FeeKindId): DealBase {
  if (kind === "fx_spread") return { key: "fx" };
  const base = FEE_SHAPES[kind].base;
  return base ? { key: base } : { name: kind };
}

/** The side of a trade a fee is charged on alone (F-111): a load on a purchase, a redemption deduction on a sale. */
export const ONE_SIDE: Partial<Record<FeeKindId, "buy" | "sell">> = { load: "buy", redemption_deduction: "sell" };

// ---------------------------------------------------------------- what is held, and what fits it

/** Where a fund is bought: on the Tel Aviv exchange, or abroad. */
export type Place = "israel" | "abroad";
/** What a fund does with its dividends and interest. */
export type Payout = "accumulating" | "distributing";

/**
 * What a securities account holds, as the facts a reading or a suggestion uses: where it is bought, its currency (an ISO code; `ILS`
 * the shekel), and whether it distributes. A currency other than the shekel makes a purchase and a sale carry a conversion (F-111).
 */
export interface Held {
  place: Place;
  currency: string;
  payout: Payout;
}

/** The kinds that hold funds, whose deal says what is held: the securities account and the IRAs, which hold securities in it. */
export const HOLDS_FUNDS: readonly ProductId[] = ["brokerage-account", "ira-provident", "ira-hishtalmut"];

export const holdsFunds = (kind: ProductId | null): boolean => kind !== null && HOLDS_FUNDS.includes(kind);

/**
 * Whether a fee fits what is held, where the deal says (where it does not, every fee fits): a conversion and its spread need a currency
 * other than the shekel; a charge for a corporate event abroad needs a fund bought abroad that distributes (F-103); a fee on a
 * distribution needs a fund that distributes (F-18). Every other fee fits.
 */
export function fitsHeld(kind: FeeKindId, held: Held | undefined): boolean {
  if (!held) return true;
  if (kind === "fx" || kind === "fx_spread") return held.currency !== "ILS";
  if (kind === "corporate_event") return held.place === "abroad" && held.payout === "distributing";
  if (kind === "distribution_handling") return held.payout === "distributing";
  return true;
}

/**
 * The fees a kind offers beyond its record's bases, the rarer ones: for a kind that holds funds, the spread of a conversion, a charge for a
 * corporate event abroad and a current account at a bank. A fee of the person's own (`own`) is offered to every kind, last.
 */
export const RARER_FOR_FUNDS: readonly FeeKindId[] = ["fx_spread", "corporate_event", "current_account"];

/**
 * Whether a kind has a fee at all: one of its record's bases, for a kind that holds funds the fund's own fee and the rarer fees, and a fee
 * of the person's own, which every kind has. The fees `suggestions` offers, whatever the deal holds.
 */
export function kindHas(kind: ProductId, bases: readonly FeeBase[], fee: FeeKindId): boolean {
  return fee === "own" || (bases as readonly FeeKindId[]).includes(fee) || (holdsFunds(kind) && (fee === "fund_management" || RARER_FOR_FUNDS.includes(fee)));
}

/**
 * The fees to suggest for a deal: `usual`, the kind's record bases the deal lacks that fit what is held (and, for a kind that holds funds,
 * the fund's own fee); `rarer`, the bases that do not fit, the rarer fees, and `own`, the person's own, last. A fee on a distribution is
 * offered unless `held` says the fund accumulates, which pays nothing out to charge; a deal says nothing of what it holds (its fees change
 * by what is bought instead, F-114), so every fee its kind has is offered.
 */
export function suggestions(kind: ProductId, bases: readonly FeeBase[], present: readonly FeeKindId[], held: Held | undefined): { usual: FeeKindId[]; rarer: FeeKindId[] } {
  const lacking = (k: FeeKindId) => !present.includes(k);
  const funds = holdsFunds(kind);
  const paysOut = (k: FeeKindId) => k !== "distribution_handling" || !funds || !held || held.payout === "distributing";
  const own: FeeKindId[] = [...bases, ...(funds ? (["fund_management"] as const) : [])].filter(paysOut);
  const usual = own.filter((k) => lacking(k) && fitsHeld(k, funds ? held : undefined));
  const rarer = [...own.filter((k) => lacking(k) && !usual.includes(k)), ...(funds ? RARER_FOR_FUNDS.filter((k) => lacking(k) && !own.includes(k)) : [])];
  return { usual, rarer: [...rarer, "own"] };
}

// ---------------------------------------------------------------- what a price may change by (F-114)

/**
 * A thing a fee's price may change by (F-114): what is bought (`what`), what is held (`held`, the same values, for a fee on what is held),
 * the channel, the track the person chose, the currency (a conversion's), the size of the action, the size of the portfolio, the trading
 * in a month (`volume`), the number of actions in a month (`count`), or a condition in the person's own words (`own`).
 */
export type ByKind = "what" | "held" | "channel" | "track" | "currency" | "actionSize" | "portfolioSize" | "volume" | "count" | "own";

/** The things whose values are steps of a range, each with its tops (F-114). */
export type RangeKind = "actionSize" | "portfolioSize" | "volume" | "count";
export const RANGE_KINDS: readonly RangeKind[] = ["actionSize", "portfolioSize", "volume", "count"];
export const isRangeKind = (k: ByKind): k is RangeKind => (RANGE_KINDS as readonly string[]).includes(k);

/** The things whose values are named from a list the site knows, or in the person's words: what is bought or held, the channel, the currency. */
export type ListKind = "what" | "held" | "channel" | "currency";
export const isListKind = (k: ByKind): k is ListKind => k === "what" || k === "held" || k === "channel" || k === "currency";

/**
 * What a range's tops count: a sum in a currency (the size of an action, of the portfolio, of a month's trading), units (a month's trading
 * in shares), or actions (the number of actions in a month).
 */
export type RangeUnit = "ILS" | "USD" | "EUR" | "GBP" | "units" | "actions";

/** The units each range may count in, the first its usual one. */
export const RANGE_UNITS: Readonly<Record<RangeKind, readonly RangeUnit[]>> = {
  actionSize: ["ILS", "USD", "EUR", "GBP"],
  portfolioSize: ["ILS", "USD", "EUR", "GBP"],
  volume: ["ILS", "USD", "EUR", "GBP", "units"],
  count: ["actions"],
};

/**
 * What is bought or held, as the site names it (F-114): where it is bought and its currency (null: a currency other than the shekel that the
 * value does not name). A value the person names gives the same two facts once (`OwnPlace` on the thing).
 */
export const WHAT_VALUES: Readonly<Record<string, { place: Place; currency: string | null }>> = {
  tase: { place: "israel", currency: "ILS" },
  mutualFunds: { place: "israel", currency: "ILS" },
  moneyMarket: { place: "israel", currency: "ILS" },
  makam: { place: "israel", currency: "ILS" },
  us: { place: "abroad", currency: "USD" },
  europe: { place: "abroad", currency: "EUR" },
  world: { place: "abroad", currency: null },
};
export const WHAT_IDS = Object.keys(WHAT_VALUES);

/** The channels a price list prices apart: a branch, the phone, the internet and the app (`direct`). */
export const CHANNEL_IDS: readonly string[] = ["branch", "phone", "direct"];

/** The currencies a conversion is priced by: from or to dollars, euros, pounds, or another currency (`other`). */
export const CURRENCY_IDS: readonly string[] = ["USD", "EUR", "GBP", "other"];

/** The values the site names for a list thing, in the order a list shows them. */
export const LIST_IDS: Readonly<Record<ListKind, readonly string[]>> = { what: WHAT_IDS, held: WHAT_IDS, channel: CHANNEL_IDS, currency: CURRENCY_IDS };

/** Whether a fee is charged on what is held or on the account (its usual form is a share of what is held or a sum per period). */
export const onHolding = (kind: FeeKindId): boolean => FEE_SHAPES[kind].usual === "held" || FEE_SHAPES[kind].usual === "sum";

/** Whether a fee is a conversion, whose price changes by the currency rather than by what is bought. */
export const isConversion = (kind: FeeKindId): boolean => kind === "fx" || kind === "fx_spread";

/**
 * The things a fee may change by, in the toolbox's order: what is bought (what is held, for a fee on what is held or on the account; the
 * currency, for a conversion), the track, the channel, the size of the action (a fee on an action only), the size of the portfolio, the
 * trading in a month, the number of actions in a month, and a condition of the person's own.
 */
export function byKindsFor(kind: FeeKindId): ByKind[] {
  const first: ByKind = isConversion(kind) ? "currency" : onHolding(kind) ? "held" : "what";
  return [first, "track", "channel", ...(onHolding(kind) ? [] : (["actionSize"] as const)), "portfolioSize", "volume", "count", "own"];
}

/**
 * Whether a range is read across sizes rather than picked (F-115): the size of the action always, and the size of the portfolio for a fee on
 * what is held or on the account. Every other range is picked.
 */
export const readAcross = (fee: FeeKindId, by: ByKind): boolean => by === "actionSize" || (by === "portfolioSize" && onHolding(fee));

/** The most things one fee's price changes by. */
export const BY_MAX = 3;
