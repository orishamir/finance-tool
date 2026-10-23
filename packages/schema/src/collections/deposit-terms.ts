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
  snapshot: isoDate,
  source,
});

export type DepositTerms = z.infer<typeof depositTerms>;
