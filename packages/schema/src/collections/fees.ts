// data/fees/: provider tariffs, dated snapshots. docs/data-schema.md §3.6.
// One file per provider per snapshot: fees/<provider-id>@<date>.json. In R1 only the list fees the
// illustrative guide timeline runs on are collected (method F-67, scenario S47); the workbench's
// averages, bands and minimums arrive with R4.
import { z } from "zod";
import { feeBase, instrumentClass, isoDate, source, textFragment, valueObject } from "../value.ts";
import { companyName } from "../scope.ts";

const ruleIds = z.array(z.string().min(1));

/**
 * Where in the document a fee value stands. `page` is the file's own page of a
 * PDF (the library's count, not the number printed on the sheet); `quote` is the document's own words,
 * at most 240 characters. A web page has only `quote`. Both optional: no page means not yet confirmed.
 */
const place = { page: z.number().int().positive().optional(), quote: z.string().min(1).max(240).optional(), fragment: textFragment.optional() };
const feeValue = valueObject.safeExtend({ source: source.extend(place) });
/** A document's place where a fact that is not a value stands: its link, name, the day it was read, its page in a PDF and its own words. */
const quotedSource = z.strictObject({ url: z.string().min(1), title: z.string().min(1), checked: isoDate, page: z.number().int().positive().optional(), quote: z.string().min(1).max(240), fragment: textFragment.optional() });

/**
 * data-schema §3.6a item 3: one step of a conversion priced by its size, as the list prints it. `up_to` is the step's top in dollars (`usd`;
 * the last step `null`, everything above the one before). `on` says what the step prices: the conversion fee (`fee`) or the spread the line
 * records (`spread`). Exactly one price: `exempt` (nothing), `discount_pct` off the line's own price (unit `pct`; `minimum_included` where the
 * words take the minimum down too), `flat` (a sum in `usd`) or `rate` (the spread in that step, `pct_of_trade`). The line's `flat_up_to`, where it
 * has one, is the step the run prices (F-13), and the data check holds the two together.
 */
export const sizeTier = z
  .strictObject({
    up_to: feeValue.nullable(),
    on: z.enum(["fee", "spread"]),
    exempt: z.literal(true).optional(),
    discount_pct: feeValue.optional(),
    minimum_included: z.boolean().optional(),
    flat: feeValue.optional(),
    rate: feeValue.optional(),
    source: quotedSource,
  })
  .superRefine((t, ctx) => {
    const kinds = [t.exempt, t.discount_pct, t.flat, t.rate].filter((x) => x !== undefined);
    if (kinds.length !== 1) ctx.addIssue({ code: "custom", message: "a size step has exactly one of exempt, discount_pct, flat, rate" });
    if (t.up_to && t.up_to.unit !== "usd") ctx.addIssue({ code: "custom", path: ["up_to"], message: "a size step's top is in usd" });
    if (t.flat && t.flat.unit !== "usd") ctx.addIssue({ code: "custom", path: ["flat"], message: "a size step's flat price is in usd" });
    if (t.discount_pct && t.discount_pct.unit !== "pct") ctx.addIssue({ code: "custom", path: ["discount_pct"], message: "a discount is in pct" });
    if (t.rate && t.rate.unit !== "pct_of_trade") ctx.addIssue({ code: "custom", path: ["rate"], message: "a step's spread is in pct_of_trade" });
    if (t.rate && t.on !== "spread") ctx.addIssue({ code: "custom", path: ["rate"], message: "a rate prices the spread: on spread" });
    if (t.minimum_included !== undefined && !t.discount_pct) ctx.addIssue({ code: "custom", path: ["minimum_included"], message: "minimum_included belongs to discount_pct" });
  });

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
  /** S2: a cap as a share of the trade value (unit `pct_of_trade`): commission = min(cap x trade, max(min, rate x base)). */
  cap: feeValue.optional(),
  /** F-12: a flat price for an order up to a sum; a larger order pays the line's rate, minimum and maximum. */
  flat_up_to: z.strictObject({ amount: feeValue, up_to: feeValue }).optional(),
  spread: feeValue.nullable().optional(),
  period: z.enum(["month", "quarter", "year"]).nullable(),
  channel: z.string().nullable(),
  band: z.string().nullable(),
  /** F-13: a conversion line for one currency (ISO code); it prices a fund in that currency, and a line with no currency prices the others. */
  conversion_currency: z.string().regex(/^[A-Z]{3}$/).optional(),
  statement_code: z.string().nullable(),
  /** The CMA fund number, when the line is for one track. */
  track_id: z.number().int().positive().optional(),
  /** A-19: how long a discount lasts, and the list fee it reverts to. */
  discount_months: feeValue.optional(),
  reverts_to: feeValue.optional(),
  /**
   * D56: the document's own words that make the printed `rate` an offer, a rate conditional on a document that is not
   * published (a discount letter sent after joining). The row shows the rate with these words; the ranking and the example price the
   * line at `reverts_to` from the start. Requires `reverts_to`.
   */
  offer_he: z.string().min(1).max(240).optional(),
  /**
   * D41, D56: the price list prints the line, but the house's own documents do not show that an ordinary customer can use it for
   * the holdings it names (a service limited to a list of funds the house does not publish, or one no document says where to set up).
   * `reason_he` says so in the reader's words, `source` is the document whose words (or silence) it rests on. The ranked price never
   * reads the line: the regular line prices those orders, and the indices page shows the line beside the row with the reason. Only on
   * a banded line, so the standard line still prices the holding. The company pages show the line as printed.
   */
  not_ranked: z
    .strictObject({
      reason_he: z.string().min(1).max(240),
      source: z.strictObject({ url: z.string().min(1), title: z.string().min(1), checked: isoDate, page: z.number().int().positive().optional(), quote: z.string().min(1).max(240), fragment: textFragment.optional() }),
    })
    .optional(),
  names: z.strictObject({ tariff: z.array(z.string()) }),
  /**
   * data-schema §3.6a item 1: the currencies a bound in the trade's currency (`trade_ccy_per_trade`) is printed for, where the list's words
   * name them (Excellence's "בש\"ח/$ ארה\"ב/יורו"); absent, it holds in whatever currency the trade is in. ISO codes.
   */
  trade_currencies: z.array(z.string().regex(/^[A-Z]{3}$/)).min(1).optional(),
  /**
   * data-schema §3.6a item 1: the currencies a bound in `dearer_ccy_per_trade` may be in, where the list's words leave its currency open between
   * them (Interactive Israel's European minimum: dollars or pounds, BRK-40), and the open questions that leave it so. A run prices the bound in
   * the dearer of them at its rates (F-12, F-84).
   */
  bound_readings: z.strictObject({ currencies: z.array(z.string().regex(/^[A-Z]{3}$/)).min(2), open_questions: z.array(z.string().regex(/^[A-Z0-9]+-OQ\d+$/)).min(1) }).optional(),
  /**
   * data-schema §3.6a item 2: what a custody line's `max` bounds: each security (`security`), the whole securities deposit (`deposit`), or the
   * list prints the figure with no scope (`unstated`). Required on a custody line with a maximum (the data check, on a house's latest record).
   */
  max_per: z.enum(["security", "deposit", "unstated"]).optional(),
  /**
   * data-schema §3.6a item 2: where the scope is read from another document of the house than the one `max` quotes (the house's own sheet in
   * TASE's fee calculator, which the house fills, BRK-24), that document's place, the house's own words and the day it was read.
   */
  max_per_source: source.extend({ ...place, quote: z.string().min(1).max(240), checked: isoDate }).optional(),
  /** data-schema §3.6a item 2: a second maximum on the whole deposit, printed beside a `max` on each security (unit `nis`, with its quote). */
  max_deposit: feeValue.optional(),
  /** data-schema §3.6a item 3: a conversion priced by its size, step by step from the smallest (`fx` lines); no page reads the steps yet. */
  size_tiers: z.array(sizeTier).min(1).optional(),
  /**
   * data-schema §3.6a item 4: a fixed fee that the trade fees charged in the same month reduce, never below zero (`fixed_period` lines), with the
   * list's words.
   */
  offset: z.strictObject({ against: z.literal("trade_fees_same_month"), source: quotedSource }).optional(),
  /**
   * data-schema §3.6a item 6: when the fee is collected, in the list's words in its "מועד הגביה" column (`custody` and `fixed_period` lines). It is
   * not the price's period (`period`), and no calculation reads it.
   */
  collection: z.strictObject({ words_he: z.string().min(1).max(80), source: quotedSource }).optional(),
});

/** The exchanges the site tells apart for a fund bought abroad: `us`, and `europe` for every exchange outside the US (a trade line's band, `venueOfBand`). */
export const venue = z.enum(["us", "europe"]);

/** S3: sourced availability of an instrument class at the provider. */
export const availabilityEntry = z.strictObject({
  applies_to: z.array(instrumentClass).min(1),
  /** "unknown": the documents leave it open, so the class is not priced anywhere and the row says why in `reason_he`. */
  available: z.union([z.boolean(), z.literal("unknown")]),
  source: z.strictObject({ url: z.string().min(1), title: z.string().min(1), checked: isoDate, ...place }),
  note: z.string().optional(),
  reason_he: z.string().min(1).optional(),
  /** The rules of the rule base that hold this fact: the house's row opens their cards from the words that say the class cannot be bought there, or that it is unclear. Display only; it changes no price and no ranking. */
  rule_ids: ruleIds.optional(),
  /**
   * the class can be bought there only by phone (through the house's trading desk), as the house's own words say, with their
   * own source and its quote; with `venues`, only a fund bought on those exchanges (a class of funds bought abroad). A sourced fact shown
   * beside the house; it changes no price and no ranking. Only on an entry that says the class can be bought (`available: true`).
   */
  phone_only: z
    .strictObject({
      venues: z.array(venue).min(1).optional(),
      source: z.strictObject({ url: z.string().min(1), title: z.string().min(1), checked: isoDate, page: z.number().int().positive().optional(), quote: z.string().min(1).max(240), fragment: textFragment.optional() }),
      note: z.string().optional(),
    })
    .optional(),
});

/**
 * D94, F-109: a listing a house sells by amount (an order in money, or in fractions of a unit), where its own document says so. Silence is
 * whole units (D56). `orders`: `all` for every order on the listing, `recurring_plan` only for the monthly purchases of the house's recurring
 * plan (the ones its recurring-plan conversion line prices, F-13). `list_only`: the document limits it to a list of securities it does not
 * publish and names none of the site's funds, so no fund is bought by amount on it (D42); the entry is kept so the page and the data say
 * why. `source.quote` is the document's own words.
 */
export const byAmountEntry = z.strictObject({
  venue,
  orders: z.enum(["all", "recurring_plan"]),
  list_only: z.boolean(),
  /** The words name shares and no exchange-traded fund: for a fund that is silence (D56), so the entry is kept for its reason and changes nothing. */
  shares_only: z.literal(true).optional(),
  source: z.strictObject({ url: z.string().min(1), title: z.string().min(1), checked: isoDate, page: z.number().int().positive().optional(), quote: z.string().min(1).max(240), fragment: textFragment.optional() }),
  note: z.string().optional(),
});

/** A group price's place in a document: its page or sheet row, and the document's own words there. */
export const groupSource = z.strictObject({
  url: z.string().min(1),
  title: z.string().min(1),
  page: z.number().int().positive().optional(),
  row: z.number().int().positive().optional(),
  quote: z.string().min(1),
  fragment: textFragment.optional(),
});
/**
 * A group price's numbers, as the words state them and nothing more (own account on a house, F-101). Exactly one kind of price:
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
    /** Set only where the words name a purchase only or a sale only; absent means both sides. A trade price only. */
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
  /** `salary` (D43 amended): a lower price for those who move their salary to the bank or hold a portfolio there. */
  kind: z.enum(["young", "soldier", "released", "student", "salary", "other"]),
  name_he: z.string().min(1),
  who_he: z.string().min(1),
  who_source: groupSource,
  /** Whether the document prints when the price ends; a person's leaving the group is not a printed end. */
  ends_printed: z.boolean(),
  ends_he: z.string().min(1),
  ends_source: groupSource.optional(),
  prices: z.array(groupPrice).min(1),
  /**
   * F-102 (D64): the group's own price for the current account a bank's row counts, where the group's annex prints the minimum itself
   * free: `exempt` from the monthly minimum for `for_months` from joining (the entry's printed end), then the bank's ordinary minimum.
   * Absent: the annex was not read for it, prints nothing, or leaves it unclear, and the group pays the ordinary minimum, the most the
   * documents allow (D56). An exemption inferred from other rows (a free teller action under a minimum bounded by its price) is never
   * recorded.
   */
  current_account: z
    .strictObject({ price_he: z.string().min(1), exempt: z.literal(true), for_months: z.number().int().positive(), source: groupSource })
    .optional(),
  /** What was inferred rather than read. */
  inferred: z.string().min(1).optional(),
  /**
   * The sub-row under the house's row (D43): who in a few words, what is cheaper than the record's own price, until
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
 * What a house's advertising says against its binding documents (D57): one entry per claim, both sides in their own words.
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
  claim_source: z.strictObject({ url: z.string().min(1), title: z.string().min(1), seen: isoDate, fragment: textFragment.optional() }),
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
    fragment: textFragment.optional(),
  }),
});

/**
 * data-schema §3.6a item 5: a place where the house's document says a third party's fee may be charged on top of its own. `fee` names the kind
 * of fee, `venues` the markets where the words name them, `ceiling` the most the document prints it may be (a value object) or `null` where it
 * prints none ("לפי הגביה בפועל"). `words_he` is the document's words. Read by no price and shown by no page yet (no record carries one).
 */
export const thirdPartyEntry = z.strictObject({
  fee: z.enum(["trade", "custody", "conversion", "transfer", "corporate_event", "other"]),
  venues: z.array(z.enum(["us", "europe", "other"])).min(1).optional(),
  ceiling: feeValue.nullable(),
  words_he: z.string().min(1).max(240),
  source: quotedSource.omit({ quote: true }).extend({ quote: z.string().min(1).max(240).optional() }),
});

/**
 * data-schema §3.6 (BRK-38): the funds a house sells fund by fund, under the distribution agreements their managers report. `applies_to`: the
 * classes whose availability the agreements decide for each fund. `searched` is the search that found the reports. Each report names, as
 * strings, every fund number it lists (the products defined by religious law left out); `ends` is the report that ends the agreement, where
 * one was found. A fund a report that has not ended names is sold there. Whether any other fund of the class is sold there stays open: the
 * search is a lead, not the house's list, and `unnamed` holds what a page says of such a fund (its reason, its rules and open questions).
 */
export const distributionReport = z.strictObject({
  url: z.string().min(1),
  file: z.string().min(1),
  manager: z.string().min(1),
  published: isoDate,
  reference: z.string().min(1),
  agreement_date: isoDate,
  checked: isoDate,
  ends: z.strictObject({ url: z.string().min(1), published: isoDate, reference: z.string().min(1), checked: isoDate }).optional(),
  funds: z.array(z.string().regex(/^\d+$/)).min(1),
});
export const distributionAgreements = z.strictObject({
  applies_to: z.array(instrumentClass).min(1),
  distributor_he: z.string().min(1),
  searched: z.strictObject({ url: z.string().min(1), words: z.string().min(1), checked: isoDate, result: z.string().min(1) }),
  reports: z.array(distributionReport),
  unnamed: z.strictObject({ reason_he: z.string().min(1), rule_ids: ruleIds.min(1), open_questions: z.array(z.string().regex(/^[A-Z0-9]+-OQ\d+$/)).min(1) }),
});

export const feesSnapshot = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  provider: z.strictObject({
    name_he: companyName,
    class: z.enum(["bank", "broker", "foreign_broker", "provident-manager", "fund-manager", "insurer"]),
    regulator: z.enum(["BoI", "ISA", "CMA", "foreign"]),
    /** S1: required when `regulator` is `foreign`. */
    regulator_foreign: z.strictObject({ name: z.string().min(1), name_he: z.string().min(1), country: z.string().min(1) }).optional(),
    tase_member: z.boolean(),
    /** A foreign broker whose own terms offer a service that withholds Israeli tax for those who join (BRK-36). */
    israeli_tax_service: z.boolean().optional(),
    protection_rule_ids: ruleIds,
    /**
     * The house whose price list holds this one's prices (D43 amended): PEPPER's customers trade in Leumi's app at the
     * prices of the PEPPER annex of Leumi's price list, stated there as a group. Such a record stays as it was read; the indices page
     * lists it under that house, not as a house of its own.
     */
    part_of: z.string().regex(/^[a-z0-9-]+$/).optional(),
  }),
  tariff: z.strictObject({
    url: z.string().min(1),
    /** The document's name as its publisher writes it: the site shows it as the source's name. */
    title: z.string().min(1),
    /** How the document was read: its parts, pages and dates per part, files read alongside, what it leaves out. Kept with the data, not shown. */
    notes: z.string().min(1).optional(),
    /** The date the document prints; a month (YYYY-MM) when it prints only a month ("11/2025"), so no day is invented. */
    published: z.union([isoDate, z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "month must be YYYY-MM, 01 to 12")]).nullable(),
    /**
     * What the document prints instead, when it prints no date for the whole (`published` null; a bare "no
     * publication date" reads as a fault and says nothing). `part`: a date on each part and none for the whole, so the date of the part
     * the site reads, the part as the site names it, and the date as printed (`date` null where the print is no real date, such as
     * "06/02/20217"); `version`: a version printed in place of a date ("גרסת 04/2026" is `04/2026`); `none`: nothing printed. The data
     * check asks for it on every latest record that has no `published` and was collected.
     */
    printed: z
      .discriminatedUnion("kind", [
        z.strictObject({ kind: z.literal("part"), part_he: z.string().min(1), date: isoDate.nullable(), as_printed: z.string().min(1) }),
        z.strictObject({ kind: z.literal("version"), version: z.string().min(1) }),
        z.strictObject({ kind: z.literal("none") }),
      ])
      .optional(),
    format: z.enum(["pdf", "html", "xlsx"]),
  }),
  snapshot: isoDate,
  missing: z.boolean(),
  /** The reason in Hebrew, for the page, where the plain "not collected" would be untrue. */
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
   * D64: what a current account at the bank costs an ordinary customer a month, the price list's monthly minimum (unit `nis_per_month`).
   * Required of a bank's latest record by the data check, and absent from an investment house. F-102 counts it on the bank's row unless the
   * person marks the bank as their own. That a bank's securities account needs a current account there is D64's premise, not a rule of the
   * rule base (F-102).
   */
  current_account: z.strictObject({ monthly_minimum: feeValue }).optional(),
  notice_rule_ids: ruleIds,
  availability: z.array(availabilityEntry).optional(),
  /** D94, F-109: the listings the house's own documents say it sells by amount; a listing with no entry is bought in whole units. */
  by_amount: z.array(byAmountEntry).optional(),
  /** Who pays the prices on this record: required of a bank's or broker's record by the data check. */
  price_for_he: z.string().min(1).optional(),
  /**
   * What the documents hold that this record does not use, and why; empty means nothing was found. `why` is the working note. `why_he` is
   * the same reason in plain Hebrew for the reader, and `could_change_price` says whether leaving it out can make what some reader pays
   * differ from the price shown (another plan, a tier, a minimum by activity): a page tells the reader of those beside the house's price.
   */
  left_out: z.array(z.strictObject({ what: z.string().min(1), page: z.number().int().positive().optional(), why: z.string().min(1), why_he: z.string().min(1).optional(), could_change_price: z.boolean().optional() })).optional(),
  groups: feeGroups.optional(),
  /** What the house's advertising says against its binding documents (D57); absent or empty when nothing was found. */
  advertising: z.array(advertisingEntry).optional(),
  /** data-schema §3.6a item 5: where the house's document says third parties' fees may be added to its own; read by no price, shown by no page yet. */
  third_party: z.array(thirdPartyEntry).optional(),
  /** data-schema §3.6 (BRK-38): the funds the house sells fund by fund, under its distribution agreements. */
  distribution_agreements: distributionAgreements.optional(),
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
export type SizeTier = z.infer<typeof sizeTier>;
export type ThirdPartyEntry = z.infer<typeof thirdPartyEntry>;
export type DistributionAgreements = z.infer<typeof distributionAgreements>;
export type FeesSnapshot = z.infer<typeof feesSnapshot>;
