// The things a fee's price may change by (method §10.6, F-114, F-115), one definition each: how its values are named (from a list, a
// range's steps, the person's track or condition), which fees it can split, a range's units, and whether a range is read across sizes.
// The toolbox's things, the question a thing asks when it is added, a deal read from the device or a link, and the reading's picks all
// read this registry. Pure; no Hebrew.
import type { FeeKindId } from "../core";
import { CHANNEL_IDS, CURRENCY_IDS, isConversion, onHolding, WHAT_IDS } from "../shapes";

/**
 * A thing a fee's price may change by (F-114): what is bought (`what`), what is held (`held`, the same values, for a fee on what is held),
 * the channel, the track the person chose, the currency (a conversion's), the size of the action, the size of the portfolio, the trading
 * in a month (`volume`), the number of actions in a month (`count`), or a condition in the person's own words (`own`).
 */
export type ByKind = "what" | "held" | "channel" | "track" | "currency" | "actionSize" | "portfolioSize" | "volume" | "count" | "own";

/** The things whose values are steps of a range, each with its tops (F-114). */
export type RangeKind = "actionSize" | "portfolioSize" | "volume" | "count";

/** The things whose values are named from a list the site knows, or in the person's words: what is bought or held, the channel, the currency. */
export type ListKind = "what" | "held" | "channel" | "currency";

/** The list things whose values say where they are bought and in what currency: what is bought, what is held. */
export type PlaceKind = "what" | "held";

/**
 * What a range's tops count: a sum in a currency (the size of an action, of the portfolio, of a month's trading), units (a month's trading
 * in shares), or actions (the number of actions in a month).
 */
export type RangeUnit = "ILS" | "USD" | "EUR" | "GBP" | "units" | "actions";

/**
 * How a thing's values are named: from a list the site knows, or in the person's words beside it (`list`, with the site's ids); as steps
 * of a range, with its tops in a unit (`range`, its units, the first the usual one); a list whose values the person names says where each
 * is bought and its currency (`places`); a track's name in the person's words (`track`); a
 * condition's value under its own name (`own`).
 */
export type ConditionValues = { kind: "list"; ids: readonly string[]; places?: true } | { kind: "range"; units: readonly RangeUnit[] } | { kind: "track" } | { kind: "own" };

export interface ConditionDef {
  id: ByKind;
  values: ConditionValues;
  /** Whether a fee of `kind` can change by it: what is bought on an action, what is held on a holding, the currency on a conversion. */
  fits: (kind: FeeKindId) => boolean;
  /**
   * Whether a range is read across sizes rather than picked (F-115), on a fee charged on what is held or on the account (`onHoldingFee`,
   * by its prices' form) or not. Every other thing is picked.
   */
  readAcross?: (onHoldingFee: boolean) => boolean;
}

const SUMS: readonly RangeUnit[] = ["ILS", "USD", "EUR", "GBP"];
const always = () => true;
/** A fee on an action: what is bought and the size of the action split it; a fee on what is held or on the account is split by what is held. */
const onAction = (kind: FeeKindId) => !onHolding(kind);

/** Every thing, in the toolbox's order: what is bought (or held, or the currency), the track, the channel, then the sizes, then a condition. */
export const CONDITIONS: Readonly<Record<ByKind, ConditionDef>> = {
  what: { id: "what", values: { kind: "list", ids: WHAT_IDS, places: true }, fits: (k) => !isConversion(k) && onAction(k) },
  held: { id: "held", values: { kind: "list", ids: WHAT_IDS, places: true }, fits: (k) => !isConversion(k) && onHolding(k) },
  currency: { id: "currency", values: { kind: "list", ids: CURRENCY_IDS }, fits: isConversion },
  track: { id: "track", values: { kind: "track" }, fits: always },
  channel: { id: "channel", values: { kind: "list", ids: CHANNEL_IDS }, fits: always },
  actionSize: { id: "actionSize", values: { kind: "range", units: SUMS }, fits: onAction, readAcross: always },
  portfolioSize: { id: "portfolioSize", values: { kind: "range", units: SUMS }, fits: always, readAcross: (onHoldingFee) => onHoldingFee },
  volume: { id: "volume", values: { kind: "range", units: [...SUMS, "units"] }, fits: always },
  count: { id: "count", values: { kind: "range", units: ["actions"] }, fits: always },
  own: { id: "own", values: { kind: "own" }, fits: always },
};

export const BY_KINDS = Object.keys(CONDITIONS) as ByKind[];

/** The most things one fee's price changes by. */
export const BY_MAX = 3;

/** The things a fee may change by, in the toolbox's order (`CONDITIONS`). */
export const conditionsFor = (kind: FeeKindId): ByKind[] => BY_KINDS.filter((k) => CONDITIONS[k].fits(kind));

export const isRangeKind = (k: ByKind): k is RangeKind => CONDITIONS[k].values.kind === "range";
export const isListKind = (k: ByKind): k is ListKind => CONDITIONS[k].values.kind === "list";
/** Whether a thing's values say where they are bought and their currency (what is bought or held). */
export const isPlaceKind = (k: ByKind): k is PlaceKind => { const v = CONDITIONS[k].values; return v.kind === "list" && !!v.places; };
export const RANGE_KINDS = BY_KINDS.filter(isRangeKind);

/** The units each range may count in, the first its usual one. */
export const RANGE_UNITS = Object.fromEntries(RANGE_KINDS.map((k) => [k, (CONDITIONS[k].values as Extract<ConditionValues, { kind: "range" }>).units])) as Readonly<Record<RangeKind, readonly RangeUnit[]>>;

/** The values the site names for each list thing, in the order a list shows them. */
export const LIST_IDS = Object.fromEntries(BY_KINDS.filter(isListKind).map((k) => [k, (CONDITIONS[k].values as Extract<ConditionValues, { kind: "list" }>).ids])) as Readonly<Record<ListKind, readonly string[]>>;

/** Whether a range is read across sizes rather than picked (F-115): the size of the action always, the size of the portfolio on a holding. */
export const readAcross = (onHoldingFee: boolean, by: ByKind): boolean => !!CONDITIONS[by].readAcross?.(onHoldingFee);
