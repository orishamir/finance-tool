// data/fees/: provider tariffs, dated snapshots. docs/data-schema.md §3.6.
// One file per provider per snapshot: fees/<provider-id>@<date>.json. In R1 only the list fees the
// illustrative guide timeline runs on are collected (method F-67, scenario S47); the workbench's
// averages, bands and minimums arrive with R4.
import { z } from "zod";
import { feeBase, instrumentClass, isoDate, source, valueObject } from "../value.ts";
import { companyName } from "../scope.ts";

const ruleIds = z.array(z.string().min(1));

/**
 * Issue 19 (2026-10-31): where in the document a fee value stands. `page` is the file's own page of a
 * PDF (the library's count, not the number printed on the sheet); `quote` is the document's own words,
 * at most 240 characters. A web page has only `quote`. Both optional: no page means not yet confirmed.
 */
const place = { page: z.number().int().positive().optional(), quote: z.string().min(1).max(240).optional() };
const feeValue = valueObject.safeExtend({ source: source.extend(place) });

export const feeLine = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  base: feeBase,
  /** Wrapper IDs or instrument classes the line applies to (`all` for every one). */
  applies_to: z.array(z.string().min(1)).min(1),
  excludes: z.array(z.string()).optional(),
  excludes_rule_ids: ruleIds.optional(),
  /** D4: a list price, a regulator average, a TASE average. An `entered` line never lives under data/. */
  level: z.enum(["list", "regulator_average", "tase_average"]),
  rate: feeValue,
  min: feeValue.nullable(),
  max: feeValue.nullable(),
  /** S2 (2026-10-25): a cap as a share of the trade value (unit `pct_of_trade`): commission = min(cap x trade, max(min, rate x base)). */
  cap: feeValue.optional(),
  /** F-12 (2026-10-31): a flat price for an order up to a sum; a larger order pays the line's rate, minimum and maximum. */
  flat_up_to: z.strictObject({ amount: feeValue, up_to: feeValue }).optional(),
  spread: feeValue.nullable().optional(),
  period: z.enum(["month", "quarter", "year"]).nullable(),
  channel: z.string().nullable(),
  band: z.string().nullable(),
  /** F-13 (2026-10-31): a conversion line for one currency (ISO code); it prices a fund in that currency, and a line with no currency prices the others. */
  conversion_currency: z.string().regex(/^[A-Z]{3}$/).optional(),
  statement_code: z.string().nullable(),
  /** The CMA fund number, when the line is for one track. */
  track_id: z.number().int().positive().optional(),
  /** A-19: how long a discount lasts, and the list fee it reverts to. */
  discount_months: feeValue.optional(),
  reverts_to: feeValue.optional(),
  names: z.strictObject({ tariff: z.array(z.string()) }),
});

/** S3 (2026-10-25): sourced availability of an instrument class at the provider. */
export const availabilityEntry = z.strictObject({
  applies_to: z.array(instrumentClass).min(1),
  /** "unknown" (2026-10-31): the documents leave it open, so the class is not priced anywhere and the row says why in `reason_he`. */
  available: z.union([z.boolean(), z.literal("unknown")]),
  source: z.strictObject({ url: z.string().min(1), title: z.string().min(1), checked: isoDate, ...place }),
  note: z.string().optional(),
  reason_he: z.string().min(1).optional(),
});

/** A group price's place in a document: its page or sheet row, and the document's own words there (2026-10-31, issue 140). */
export const groupSource = z.strictObject({
  url: z.string().min(1),
  title: z.string().min(1),
  page: z.number().int().positive().optional(),
  row: z.number().int().positive().optional(),
  quote: z.string().min(1),
});
/**
 * A group price's numbers, as the words state them and nothing more (2026-11-04, own account on a house, F-101). Exactly one kind of price:
 * `exempt` ("פטור", "0 עמלה"); `discount_pct` off the house's own price for the same fee ("50% הנחה", with `not_below_pct` where the words
 * floor it); `rate_pct` of the trade value (`per: "trade"`) or of the balance for each `per` ("0.075% לרבעון"); `flat` for each operation, up to
 * `flat_up_to` where the words limit the order's size; `per_share_cents` for each share. `side` (`buy` or `sell`) only where the words name a purchase only or a sale only (Mercantile Top's "עמלת קניה בחו\"ל"); absent, the price is for both. `min` and `max` are the bounds the words print
 * (a custody `max` is the one per security); a bound the words do not print is left out, and the house's own stays (silence is not zero).
 * Amounts are in `currency`. `for_months` is how long the price holds from joining where the price's words say so, or its entry's printed end
 * is a plain period from joining ("3 שנים ממועד ההצטרפות"). A price whose words give two prices, tiers, a condition on the balance or on the
 * order count, or an extra fee they do not size has no `value`: the words alone stand. The data check holds each number to the price's words
 * or its quote.
 */
export const groupPriceValue = z
  .strictObject({
    rate_pct: z.number().min(0).max(100).optional(),
    per: z.enum(["trade", "month", "quarter", "year"]).optional(),
    /** Set only where the words name a purchase only or a sale only; absent means both sides (2026-11-04, finance review). A trade price only. */
    side: z.enum(["buy", "sell"]).optional(),
    flat: z.number().positive().optional(),
    flat_up_to: z.number().positive().optional(),
    per_share_cents: z.number().positive().optional(),
    discount_pct: z.number().positive().max(100).optional(),
    not_below_pct: z.number().positive().max(100).optional(),
    exempt: z.literal(true).optional(),
    min: z.number().positive().optional(),
    max: z.number().positive().optional(),
    currency: z.enum(["ILS", "USD"]).optional(),
    for_months: z.number().int().positive().optional(),
  })
  .superRefine((v, ctx) => {
    const kinds = [v.exempt, v.discount_pct, v.rate_pct, v.flat, v.per_share_cents].filter((x) => x !== undefined);
    if (kinds.length !== 1) ctx.addIssue({ code: "custom", message: "a price value is exactly one of exempt, discount_pct, rate_pct, flat, per_share_cents" });
    if (v.rate_pct !== undefined && v.per === undefined) ctx.addIssue({ code: "custom", path: ["per"], message: "a rate says what it is of: per" });
    if (v.rate_pct === undefined && v.per !== undefined) ctx.addIssue({ code: "custom", path: ["per"], message: "per belongs to a rate" });
    if ((v.flat !== undefined || v.per_share_cents !== undefined || v.min !== undefined || v.max !== undefined) && v.currency === undefined) ctx.addIssue({ code: "custom", path: ["currency"], message: "an amount says its currency" });
    if (v.flat_up_to !== undefined && v.flat === undefined) ctx.addIssue({ code: "custom", path: ["flat_up_to"], message: "flat_up_to belongs to flat" });
    if (v.not_below_pct !== undefined && v.discount_pct === undefined) ctx.addIssue({ code: "custom", path: ["not_below_pct"], message: "not_below_pct belongs to discount_pct" });
    if (v.exempt && (v.min !== undefined || v.max !== undefined)) ctx.addIssue({ code: "custom", message: "an exempt price has no bounds" });
  });

/** One fee a group pays less of, as printed. `names_fund`: the row's own words name fund units; a row that does not is never read as covering a tracking fund (D42). */
export const groupPrice = z.strictObject({
  fee: z.enum(["trade_israel", "trade_abroad", "custody_israel", "custody_abroad"]),
  price_he: z.string().min(1),
  /** The price's numbers where the words state exactly one price (see `groupPriceValue`); absent where they do not. */
  value: groupPriceValue.optional(),
  holdings_he: z.string().min(1),
  names_fund: z.boolean(),
  source: groupSource,
});
export const groupEntry = z.strictObject({
  /** `salary` (2026-11-04, D43 amended): a lower price for those who move their salary to the bank or hold a portfolio there. */
  kind: z.enum(["young", "soldier", "released", "student", "salary", "other"]),
  name_he: z.string().min(1),
  who_he: z.string().min(1),
  who_source: groupSource,
  /** Whether the document prints when the price ends; a person's leaving the group is not a printed end. */
  ends_printed: z.boolean(),
  ends_he: z.string().min(1),
  ends_source: groupSource.optional(),
  prices: z.array(groupPrice).min(1),
  /** What was inferred rather than read. */
  inferred: z.string().min(1).optional(),
  /**
   * The sub-row under the house's row (D43 amended 2026-11-04): who in a few words, what is cheaper than the record's own price, until
   * when. Each restates the long words above with no new fact: the data check holds every number in them to those words (and an
   * ordinary price after "במקום" to a line of the record). Entries with the same `cheaper_he` share one sub-row. Required of a bank's or
   * broker's latest record; who_short_he of an `other` entry follows "ל" in the line above the sub-rows ("מחיר אחר לרופאים עצמאיים").
   */
  who_short_he: z.string().min(1).max(48).optional(),
  cheaper_he: z.string().min(1).max(80).optional(),
  ends_short_he: z.string().min(1).max(40).optional(),
});
/**
 * Prices for groups such as young customers, students and released soldiers, stated beside the ranking and never part of it (D43).
 * `state`: `prices`, or `none_on_securities` (a group annex with no securities row), `no_mention` (the documents read name no group),
 * `not_read`; `note` says what was read and what came of it.
 */
export const feeGroups = z.strictObject({
  state: z.enum(["prices", "none_on_securities", "no_mention", "not_read"]),
  note: z.string().min(1),
  read: z.array(z.strictObject({ url: z.string().min(1), title: z.string().min(1), read_in: z.literal("chrome").optional() })).min(1),
  entries: z.array(groupEntry),
});

/**
 * What a house's advertising says against its binding documents (D57, 2026-11-04): one entry per claim, both sides in their own words.
 * `contradicted`: a binding document prints the fee the advert says is not charged. `offer`: the advert reads as for everyone, and the
 * binding terms give it only to some customers, or for a time, or let the house withdraw it. `not_found`: no binding document says it.
 * `binding_source` is what was read: the price list, the account terms, the fee annex or the promotion's terms, never an advertising page;
 * `dated` is the document's own date, printed on it or, when it prints none, the file's (`dated_from`). Shown on the house's page; no
 * calculation reads it (D56: advertising is a claim to check, never a price).
 */
export const advertisingEntry = z.strictObject({
  /** The fee the claim is about, in the page's words: custody, a handling or account fee, buying and selling, conversion, a standing order. */
  fee: z.enum(["custody", "account", "trade", "conversion", "standing_order"]),
  verdict: z.enum(["contradicted", "offer", "not_found"]),
  /** The advert's own words, exactly as printed; the cells of one table row are joined with " … ". */
  claim_he: z.string().min(1).max(240),
  claim_source: z.strictObject({ url: z.string().min(1), title: z.string().min(1), seen: isoDate }),
  /** The binding document's own words that differ; absent for `not_found`. Fragments of one place are joined with " … ". */
  binding_he: z.string().min(1).max(400).optional(),
  binding_source: z.strictObject({
    kind: z.enum(["price_list", "account_terms", "fee_annex", "promotion_terms"]),
    url: z.string().min(1),
    title: z.string().min(1),
    page: z.number().int().positive().optional(),
    row: z.number().int().positive().optional(),
    dated: isoDate,
    dated_from: z.enum(["printed", "file"]),
    checked: isoDate,
  }),
});

export const feesSnapshot = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  provider: z.strictObject({
    name_he: companyName,
    class: z.enum(["bank", "broker", "foreign_broker", "provident-manager", "fund-manager", "insurer"]),
    regulator: z.enum(["BoI", "ISA", "CMA", "foreign"]),
    /** S1 (2026-10-25): required when `regulator` is `foreign`. */
    regulator_foreign: z.strictObject({ name: z.string().min(1), name_he: z.string().min(1), country: z.string().min(1) }).optional(),
    tase_member: z.boolean(),
    /** A foreign broker whose own terms offer a service that withholds Israeli tax for those who join (2026-10-31, BRK-36). */
    israeli_tax_service: z.boolean().optional(),
    protection_rule_ids: ruleIds,
    /**
     * The house whose price list holds this one's prices (2026-11-04, D43 amended): PEPPER's customers trade in Leumi's app at the
     * prices of the PEPPER annex of Leumi's price list, stated there as a group. Such a record stays as it was read; the indices page
     * lists it under that house, not as a house of its own.
     */
    part_of: z.string().regex(/^[a-z0-9-]+$/).optional(),
  }),
  tariff: z.strictObject({
    url: z.string().min(1),
    /** The document's name as its publisher writes it: the site shows it as the source's name (2026-11-03). */
    title: z.string().min(1),
    /** How the document was read: its parts, pages and dates per part, files read alongside, what it leaves out. Kept with the data, not shown. */
    notes: z.string().min(1).optional(),
    published: isoDate.nullable(),
    format: z.enum(["pdf", "html", "xlsx"]),
  }),
  snapshot: isoDate,
  missing: z.boolean(),
  /** The reason in Hebrew, for the page, where the plain "not collected" would be untrue (2026-10-31). */
  missing_reason_he: z.string().min(1).optional(),
  missing_reason: z.string().nullable(),
  lines: z.array(feeLine),
  averages: z.array(
    z.strictObject({
      line_id: z.string().min(1),
      level: z.enum(["regulator_average", "tase_average"]),
      band: z.string().nullable(),
      rate: feeValue,
    }),
  ),
  minimums: z.strictObject({ account_opening: feeValue.nullable() }),
  /**
   * D64: what the current account a bank's securities account rests on costs an ordinary customer a month, the price list's monthly
   * minimum (unit `nis_per_month`). Required of a bank's latest record by the data check, and absent from a house that needs no current
   * account with it. F-102 counts it on the bank's row unless the person marks the bank as their own.
   */
  current_account: z.strictObject({ monthly_minimum: feeValue }).optional(),
  notice_rule_ids: ruleIds,
  availability: z.array(availabilityEntry).optional(),
  /** Who pays the prices on this record (2026-10-31): required of a bank's or broker's record by the data check. */
  price_for_he: z.string().min(1).optional(),
  /** What the documents hold that this record does not use, and why (2026-10-31); empty means nothing was found. */
  left_out: z.array(z.strictObject({ what: z.string().min(1), page: z.number().int().positive().optional(), why: z.string().min(1) })).optional(),
  groups: feeGroups.optional(),
  /** What the house's advertising says against its binding documents (D57); absent or empty when nothing was found. */
  advertising: z.array(advertisingEntry).optional(),
})
  .superRefine((snap, ctx) => {
    const { regulator, regulator_foreign } = snap.provider;
    if (regulator === "foreign" && !regulator_foreign)
      ctx.addIssue({ code: "custom", path: ["provider", "regulator_foreign"], message: 'regulator "foreign" requires regulator_foreign' });
    if (regulator !== "foreign" && regulator_foreign)
      ctx.addIssue({ code: "custom", path: ["provider", "regulator_foreign"], message: 'regulator_foreign is only for regulator "foreign"' });
  });

export type FeeLine = z.infer<typeof feeLine>;
export type GroupPrice = z.infer<typeof groupPrice>;
export type GroupPriceValue = z.infer<typeof groupPriceValue>;
export type GroupSource = z.infer<typeof groupSource>;
export type GroupEntry = z.infer<typeof groupEntry>;
export type AdvertisingEntry = z.infer<typeof advertisingEntry>;
export type FeesSnapshot = z.infer<typeof feesSnapshot>;
