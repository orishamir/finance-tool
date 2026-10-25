// data/funds/: hand-collected fund details. docs/data-schema.md §3.5.
// Strict: a field the doc does not name is an error. Every fee entry is a value object or null.
import { z } from "zod";
import { isoDate, valueObject } from "../value.ts";

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
  /** S4: the price of one unit, in a currency unit, for per-share commissions. */
  share_price: valueObject.optional(),
  snapshot: isoDate,
});

export type FundRecord = z.infer<typeof fundRecord>;
