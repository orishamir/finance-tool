// The fee page's fee kinds (method §10.6): every fee a deal can hold, its engine base, which suggestions fit what an account holds, and
// the values a price may change by. What each kind's price can hold is in offers/capacity.ts, the things it may change by in
// offers/conditions.ts. The ids are stable: the copy names each fee by its id. Pure data and small functions; no Hebrew (the names are in
// copy.ts, under the guide's fee names and the fee page's own keys).
import type { DealBase } from "@finance-tool/engine";
import type { ProductId } from "@finance-tool/schema";
import { formOnHolding } from "./offers/capabilities";
import { capacity, CAPACITY } from "./offers/capacity";

export type { FeeKindId, FormId } from "./core";
import type { FeeKindId } from "./core";

/** Every fee kind, in the order the page lists fees (`CAPACITY`'s). */
export const FEE_KIND_IDS = Object.keys(CAPACITY) as FeeKindId[];

export const isFeeKindId = (x: unknown): x is FeeKindId => typeof x === "string" && Object.hasOwn(CAPACITY, x);

/**
 * The engine's base of a fee (§10.6): a record base as itself; the spread of a conversion as a conversion (F-13: it is part of the
 * conversion's price); the fund's own fee and a current account as named fees, which F-111 places by their price's form.
 */
export function engineBase(kind: FeeKindId): DealBase {
  if (kind === "fx_spread") return { key: "fx" };
  const base = capacity(kind).base;
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
export const onHolding = (kind: FeeKindId): boolean => formOnHolding(capacity(kind).usual);

/** Whether a fee is a conversion, whose price changes by the currency rather than by what is bought. */
export const isConversion = (kind: FeeKindId): boolean => kind === "fx" || kind === "fx_spread";
