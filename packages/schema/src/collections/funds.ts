// data/funds/: hand-collected fund details. docs/data-schema.md §3.5.
// Strict: a field the doc does not name is an error. Every fee entry is a value object or null.
import { z } from "zod";
import { isoDate, source, valueObject } from "../value.ts";

const fee = valueObject.nullable().optional();

/**
 * data-schema §3.5: a fee lowered for a stated period, as the manager or the trustee reports it ("מבצע"). `fee` names the key of `fees` it
 * lowers; `rate` is the rate charged during the promotion, in the fee's unit, its `effective_from` and `effective_to` the promotion's first and
 * last days as the report prints them, its source the report. The fee's own value holds the rate outside the promotion; F-121 charges the
 * promotion's rate in a run's months before it ends and the fee's own rate after.
 */
export const fundPromotion = z.strictObject({
  fee: z.enum(["fixed_management", "variable_management", "trustee"]),
  rate: valueObject,
});

export const fundRecord = z.strictObject({
  /** Lowercase ASCII, digits and hyphens, e.g. "ie00b5bmr087"; an exposure's variants name it as `fund:<id>`. */
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "id is lowercase ASCII, digits and single hyphens"),
  names: z.strictObject({ en: z.array(z.string()), he: z.array(z.string()), tase: z.array(z.string()) }),
  identifiers: z.strictObject({
    isin: z.string().nullable(),
    tase_number: z.string().nullable(),
    cusip: z.string().nullable(),
    ticker: z.record(z.string(), z.string()),
  }),
  manager: z.string().min(1),
  domicile: z.string().min(1),
  legal_form: z.string().min(1),
  exposure_id: z.string().min(1),
  currency: z.string().min(1),
  trading_currency_on_tase: z.string().min(1).nullable(),
  distribution_policy: z.enum(["accumulating", "distributing"]).nullable(),
  tax_status: z.strictObject({
    il_fund_tax_track: z.enum(["exempt", "taxable"]).nullable(),
    tase_foreign_fund_90pct_test: valueObject.nullable(),
  }),
  fees: z.strictObject({
    fixed_management: fee,
    trustee: fee,
    variable_management: fee,
    tracking_difference_12m: fee,
    median_spread: fee,
    fund_level_withholding_drag: fee,
    /**
     * MF-21: the load on purchase (שיעור הוספה), unit `pct_of_trade`, from the fund's own document. `0` means a document
     * was read and says zero; left out means not read, so a missing value is never a zero. ETFs and foreign funds leave it out.
     * The validator fails a load above zero until the page prices one.
     */
    load: fee,
  }),
  dimensions: z.record(z.string(), z.string().regex(/^(covered|blocked)(:[A-Z0-9-]+)?$/)),
  prospectus: z.strictObject({ url: z.string().min(1), date: z.string().nullable() }),
  // Israeli funds only (Maya export, data-schema §3.5 paragraph under the example).
  exposure_code: z.string().nullable().optional(),
  distribution_fee_type: z.string().nullable().optional(),
  creation_redemption_fee_category: z.string().nullable().optional(),
  /** S4: how the fund follows its index, with the page that says so. */
  replication: z
    .strictObject({
      method: z.enum(["physical", "swap", "futures", "mixed"]),
      source: z.strictObject({ url: z.string().min(1), page: z.number().int().positive().optional(), checked: isoDate }),
    })
    .optional(),
  /** S4: true when the fund neutralises the currency (מנוטרלת מט"ח). */
  hedged: z.boolean().optional(),
  /**
   * F-92: the fund's return and its tracking asset's in each full calendar year its report prints, in percent, from the
   * report named in `source` (the same as `fees.tracking_difference_12m`). A part year is left out; no full year leaves the field out.
   */
  tracking_record: z
    .strictObject({
      years: z
        .array(
          z.strictObject({
            year: z.number().int().min(1990),
            fund_pct: z.number(),
            tracking_pct: z.number(),
            /**
             * F-92 (b): the fees charged that calendar year, in percent of the fund's average net
             * assets, as an Israeli annual report's table "הוצאות שנפרעו מנכסי הקרן" prints them on `fees_page`: the fixed management fee,
             * the variable management fee (negative when the fund was paid back) and the trustee's fee. A cell printed "-" or "* שיעור זניח"
             * and a row the table does not print are 0. The variable fee stays within the highest category cap, 0.3% either way (ETF-14). Every year of an Israeli record carries it; a foreign document prints no such
             * table, so a foreign record leaves it out and F-92 (b) uses today's listed fees for that year.
             */
            fees_charged: z.strictObject({ fixed: z.number().min(0), variable: z.number().min(-0.3).max(0.3), trustee: z.number().min(0) }).optional(),
          }),
        )
        .min(1),
      /**
       * every full calendar year the report's returns table prints, read off the page in
       * `page`, oldest first. The validator holds `years` to it (data-schema §4 item 17), and where the report's text is in the research
       * library a test reads the page and holds this field to it (packages/pipeline/test/tracking-years-library.test.ts).
       */
      years_printed: z.array(z.number().int().min(1990)).min(1),
      source,
      page: z.number().int().positive().nullable(),
      /** The PDF page of the same report that prints `years[].fees_charged`; required with them (data-schema §4 item 17). */
      fees_page: z.number().int().positive().optional(),
      /** F-92 (b): the PDF page of the same report whose table "שינויים במאפייני הקרן" lists the changes of its fees; required with `fees_page`. */
      changes_page: z.number().int().positive().optional(),
      /**
       * F-92 (b): the day today's listed variable management fee came into force, as that table prints it, or null
       * when it prints no change of the variable fee in the years it covers nor after them. The years charged at today's rate (a whole
       * calendar year from that day on) give the variable fee counted forward. Required on an Israeli record with `fees_page`.
       */
      variable_rate_since: isoDate.nullable().optional(),
      /**
       * the report's footnote to the variable fee says its table prints only the positive fees ("לא מקבל ביטוי
       * בטבלה" for the negative ones), so `fees_charged.variable` may overstate what the fund paid net. No net figure is estimated.
       */
      variable_positive_only: z.literal(true).optional(),
      checked: isoDate,
      /**
       * former ground rule 2: the benchmark the document compares the fund with, by the name it prints, and whether that
       * index counts dividends after the tax withheld at source (`net`), before it (`gross`), or no official document says (`unstated`).
       * Every record carries it, Israeli and foreign alike: a `net` record shows a gap and takes A-07 from its years, a `gross` one only on the list F-92 (d) allows.
       * `source`: the document that says so, when it is not the one in `source` above; `page`: its PDF page; `rule_ids`: the rule that
       * says how the index is computed, where the rule base has one (a Tel Aviv index: ETF-42, ETF-44, ETF-45).
       */
      benchmark: z.strictObject({
        name: z.string().min(1),
        dividends: z.enum(["net", "gross", "unstated"]),
        source: source.optional(),
        page: z.number().int().positive().optional(),
        rule_ids: z.array(z.string()).optional(),
      }),
    })
    .optional(),
  /**
   * A-10: a distributing fund's yield, a value object in `pct_per_year` read from the fund's own factsheet or the
   * manager's page with its date, and the payments a year the same source prints. Left out when it was not read: the fund then has no price.
   */
  distribution: z
    .strictObject({
      yield: valueObject,
      per_year: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(6), z.literal(12)]),
    })
    .optional(),
  /**
   * TXF-11: the fund's own Israeli prospectus annex ("נספח לתשקיף קרן חוץ נסחרת") reports a Tax Authority ruling given
   * to the fund, and names a sale and a distribution as the only taxed events. D10 judges that enough for that fund: an
   * accumulating fund with it is ranked, not listed under G-18. Units of the same ISIN bought abroad are the same units, so both records carry it.
   */
  tax_ruling: z
    .strictObject({
      ruling_date: isoDate,
      source,
      /** The PDF pages of the ruling's report, the sale and the distribution. */
      pages: z.strictObject({ ruling: z.number().int().positive(), sale: z.number().int().positive(), distribution: z.number().int().positive() }),
      quote: z.string().min(1),
      checked: isoDate,
    })
    .optional(),
  /**
   * S4, F-109: the price of one unit, in a currency unit (`usd`, `nis`, `eur`), from the issuer's own page, for per-share commissions and for
   * buying whole units. A Tel Aviv line of a foreign fund takes its issuer's NAV of the same share class, which the line's own Israeli
   * document names; never a price from TASE or Maya (the data check refuses one).
   */
  share_price: valueObject.optional(),
  /** data-schema §3.5: the fund's fees lowered for a stated period (F-121); the data check holds each to its fee. */
  promotions: z.array(fundPromotion).min(1).optional(),
  snapshot: isoDate,
});

export type FundRecord = z.infer<typeof fundRecord>;
export type FundPromotion = z.infer<typeof fundPromotion>;
