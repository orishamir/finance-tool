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
   * for it (method §2.4). The run labels them as an average actually charged, not a list price. Where a managing company does publish
   * one, the run prices that list (F-80, D56) and the track only names the class whose averages the fee page compares with (F-68, D88).
   */
  track: z.number().int().positive().optional(),
  /** Who chose this instrument when it was not chosen with the record (2026-11-07, D88: the provident fund for investing's track). */
  chosen_by: z.string().min(1).optional(),
  /**
   * `false` when the entry was chosen after the record's `signed_off_on` and the founder has not signed it off: the record's sign-off does
   * not cover it, and nothing that rests on it claims his sign-off (2026-11-07: the provident fund for investing's track 7978).
   */
  signed_off: z.boolean().optional(),
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
