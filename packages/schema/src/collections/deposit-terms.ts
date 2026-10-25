// data/terms/deposits/: deposit and savings-plan product terms. docs/data-schema.md §3.7.
// Strict: a field the doc does not name is an error.
import { z } from "zod";
import { isoDate, source, valueObject, wrapperId } from "../value.ts";

export const depositTerms = z.strictObject({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  bank: z.string().min(1),
  names: z.strictObject({
    "447": z.array(z.string()),
    app: z.array(z.string()),
    ad: z.array(z.string()),
    abbrev: z.array(z.string()),
  }),
  type_447: z.string().min(1),
  wrapper_id: wrapperId,
  term_months: valueObject,
  rate_type: z.enum(["fixed", "variable"]),
  /** What a variable rate is tied to (e.g. "prime"); null for a fixed rate. */
  anchor: z.string().min(1).nullable().optional(),
  spread: valueObject.nullable().optional(),
  rate_offered: valueObject,
  linkage: z.enum(["none", "cpi", "fx"]),
  tax_bucket: valueObject,
  amount_range: z.strictObject({ min: valueObject, max: valueObject.nullable() }),
  break: z.strictObject({
    allowed: z.boolean(),
    penalty: z.enum(["none", "with_penalty", "not_allowed"]),
    mechanism_text: z.string(),
    rule_ids: z.array(z.string().min(1)),
  }),
  exit_points: z.strictObject({ exists: z.boolean(), every_months: z.number().nullable() }),
  auto_renew: z.strictObject({ value: z.boolean(), max_renewals: z.number().int().nullable() }),
  /**
   * A short plain-Hebrew summary of the conditions the bank prints for the rate (2026-10-25, guide page of the current account). Faithful to the
   * printed text quoted in the notes of `rate_offered`; it adds nothing that is not printed. Absent when the page has no summary yet.
   */
  conditions_he: z.string().min(1).optional(),
  /** One plain-Hebrew sentence on an open doubt about the record (the printed rate and its conditions disagree, a stated end date has passed). The page shows it beside the figure. Absent when there is none. */
  doubt_he: z.string().min(1).optional(),
  snapshot: isoDate,
  source,
});

export type DepositTerms = z.infer<typeof depositTerms>;
