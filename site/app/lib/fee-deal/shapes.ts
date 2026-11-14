// The fee page's fee kinds (method §10.6): every fee a deal can hold, its engine base, which suggestions fit what an account holds, and
// the values a price may change by. What each kind's price can hold is in offers/capacity.ts, the things it may change by in
// offers/conditions.ts. The ids are stable: the copy names each fee by its id. Pure data and small functions; no Hebrew (the names are in
// copy.ts, under the guide's fee names and the fee page's own keys).
import type { DealBase, DealPrice } from "@finance-tool/engine";
import type { FeeBase, ProductId } from "@finance-tool/schema";
import { formOnHolding } from "./offers/capabilities";
import { CAPACITY } from "./offers/capacity";

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

/** Every fee kind, in the order the page lists fees (`CAPACITY`'s). */
export const FEE_KIND_IDS = Object.keys(CAPACITY) as FeeKindId[];

export const isFeeKindId = (x: unknown): x is FeeKindId => typeof x === "string" && Object.hasOwn(CAPACITY, x);

/**
 * The engine's base of a fee (§10.6): a record base as itself; the spread of a conversion as a conversion (F-13: it is part of the
 * conversion's price); the fund's own fee and a current account as named fees, which F-111 places by their price's form.
 */
export function engineBase(kind: FeeKindId): DealBase {
  if (kind === "fx_spread") return { key: "fx" };
  const base = CAPACITY[kind].base;
  return base ? { key: base } : { name: kind };
}

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

// ---------------------------------------------------------------- the values a price may change by (F-114)

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

/**
 * Whether a fee of a kind is usually charged on what is held or on the account (its usual form is a share of what is held or a sum per
 * period): the things the toolbox offers it go by this. What a fee's own prices are charged on goes by their form (`chargedOnHolding`).
 */
export const onHolding = (kind: FeeKindId): boolean => formOnHolding(CAPACITY[kind].usual);

/** Whether a fee is a conversion, whose price changes by the currency rather than by what is bought. */
export const isConversion = (kind: FeeKindId): boolean => kind === "fx" || kind === "fx_spread";
