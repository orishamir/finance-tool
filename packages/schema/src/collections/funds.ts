// data/funds/: hand-collected fund details. docs/data-schema.md §3.5.
// Strict: a field the doc does not name is an error. Every fee entry is a value object or null.
import { z } from "zod";
import { isoDate, source, valueObject } from "../value.ts";

const fee = valueObject.nullable().optional();

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
     * 2026-10-31 (MF-21): the load on purchase (שיעור הוספה), unit `pct_of_trade`, from the fund's own document. `0` means a document
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
  /** S4 (2026-10-25): how the fund follows its index, with the page that says so. */
  replication: z
    .strictObject({
      method: z.enum(["physical", "swap", "futures", "mixed"]),
      source: z.strictObject({ url: z.string().min(1), page: z.number().int().positive().optional(), checked: isoDate }),
    })
    .optional(),
  /** S4: true when the fund neutralises the currency (מנוטרלת מט"ח). */
  hedged: z.boolean().optional(),
  /**
   * 2026-10-29 (F-92): the fund's return and its tracking asset's in each full calendar year its report prints, in percent, from the
   * report named in `source` (the same as `fees.tracking_difference_12m`). A part year is left out; no full year leaves the field out.
   */
  tracking_record: z
    .strictObject({
      years: z.array(z.strictObject({ year: z.number().int().min(1990), fund_pct: z.number(), tracking_pct: z.number() })).min(1),
      source,
      page: z.number().int().positive().nullable(),
      checked: isoDate,
    })
    .optional(),
  /**
   * 2026-10-31 (issue 147, A-10): a distributing fund's yield, a value object in `pct_per_year` read from the fund's own factsheet or the
   * manager's page with its date, and the payments a year the same source prints. Left out when it was not read: the fund then has no price.
   */
  distribution: z
    .strictObject({
      yield: valueObject,
      per_year: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(6), z.literal(12)]),
    })
    .optional(),
  /**
   * 2026-11-04 (TXF-11, issue 75): the fund's own Israeli prospectus annex ("נספח לתשקיף קרן חוץ נסחרת") reports a Tax Authority ruling given
   * to the fund, and names a sale and a distribution as the only taxed events. The founder judged that enough for that fund (D10): an
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
  /** S4: the price of one unit, in a currency unit, for per-share commissions. */
  share_price: valueObject.optional(),
  snapshot: isoDate,
});

export type FundRecord = z.infer<typeof fundRecord>;
