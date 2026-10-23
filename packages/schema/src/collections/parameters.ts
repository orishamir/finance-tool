// data/parameters/: site parameters. docs/data-schema.md §3.2.
// Parameter-specific fields (lo/hi bounds, thresholds, the fit table) are kept loose until the
// founder's first values are written (N1); each gets its own shape then.
import { z } from "zod";
import { isoDate, valueObject } from "../value.ts";

/**
 * P-05 `instruments` (data-schema §3.2): per wrapper id, the data records of the representative instrument the
 * illustrative run takes its terms from. Each key names a record by id; which keys a wrapper needs is in
 * docs/method.md §2.4 "Instrument terms".
 */
export const instrumentSpec = z.strictObject({
  /** `data/terms/deposits/` record id (deposit family). */
  deposit_terms: z.string().min(1).optional(),
  /** `data/funds/` record id (securities family). */
  fund: z.string().min(1).optional(),
  /** `data/fees/` provider id whose list lines are the tariff (securities, makam, bond). */
  tariff: z.string().min(1).optional(),
  /** `data/fees/` provider id of the IRA manager's balance line (`ira-hishtalmut`, F-51). */
  ira_fees: z.string().min(1).optional(),
  /** `data/rules/` GOV rule id whose figures give the series (bond: linkage, coupon_every_months; makam: term_months). */
  series_rule: z.string().min(1).optional(),
  /**
   * A CMA `fund_id` (latest `data/cma/` period): the track whose regulator average fees (`avg_annual_management_fee`,
   * `avg_deposit_fee`) the run uses for a provident-family wrapper when no managing company publishes a list fee
   * for it (method §2.4). The run labels them as an average actually charged, not a list price.
   */
  track: z.number().int().positive().optional(),
  /** `keren-hishtalmut` only: the employment type the illustrative run uses (an employee's salary would come from the person's entered profile). */
  employment: z.enum(["self-employed", "employee"]).optional(),
});

export const parameterRecord = z.looseObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  method_id: z.string().regex(/^P-\d{2}$/),
  value: valueObject.optional(),
  rationale: z.string().min(1),
  rationale_he: z.string().min(1).optional(),
  signed_off_by: z.literal("founder"),
  signed_off_on: isoDate,
  shown_as: z.literal("site parameter"),
  /** P-05 only. */
  instruments: z.record(z.string().min(1), instrumentSpec).optional(),
});

export type ParameterRecord = z.infer<typeof parameterRecord>;
