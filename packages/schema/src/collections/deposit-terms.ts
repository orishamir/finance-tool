// data/terms/deposits/: deposit and savings-plan product terms. docs/data-schema.md §3.7.
// Strict: a field the doc does not name is an error.
import { z } from "zod";
import { isoDate, source, valueObject, wrapperId } from "../value.ts";

/**
 * The tax a deposit's interest bears (docs/data-schema.md 3.7): `unlinked_15`, 15% fixed on the whole nominal interest (TXI-03), for any
 * deposit not fully linked to the index, prime-linked ones included (TXI-04); `linked_25`, up to 25% on the interest above the linkage,
 * the linkage itself exempt (TXI-02, TXI-05), at a lower bracket from age 60 (TXI-19). Null while no rule covers the deposit (its
 * source's strength is then `open`).
 */
export const taxBucket = z.enum(["unlinked_15", "linked_25"]);

/** A deposit's break column (directive 447): the deposit can be broken exactly when its penalty is not `not_allowed`. */
const breakTerms = z
  .strictObject({
    allowed: z.boolean(),
    penalty: z.enum(["none", "with_penalty", "not_allowed"]),
    mechanism_text: z.string(),
    rule_ids: z.array(z.string().min(1)),
  })
  .refine((b) => b.allowed === (b.penalty !== "not_allowed"), {
    message: 'break.allowed is false exactly when break.penalty is "not_allowed"',
    path: ["penalty"],
  });

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
  // null only with an open source: a null bucket at another strength would read "not found in the source", not the open question and its lock
  tax_bucket: valueObject.and(z.object({ value: taxBucket.nullable() })).refine((t) => t.value !== null || t.source.strength === "open", {
    message: 'tax_bucket.value is null only when its source strength is "open"',
    path: ["value"],
  }),
  amount_range: z.strictObject({ min: valueObject, max: valueObject.nullable() }),
  break: breakTerms,
  exit_points: z.strictObject({ exists: z.boolean(), every_months: z.number().nullable() }),
  auto_renew: z.strictObject({ value: z.boolean(), max_renewals: z.number().int().nullable() }),
  /**
   * A short plain-Hebrew summary of the conditions the bank prints for the rate (2026-10-25, guide page of the current account). Faithful to the
   * printed text quoted in the notes of `rate_offered`; it adds nothing that is not printed. Absent when the page has no summary yet.
   */
  conditions_he: z.string().min(1).optional(),
  /**
   * What sets the deposit apart from the bank's plain deposit of its term and kind, as the bank's own table or terms print it (2026-11-06,
   * F-86 reads one plain deposit per bank): a campaign product, a deposit only for people with no account at the bank (closed system),
   * interest paid during the term instead of at its end, or a choice at the end between two returns. Absent on a plain deposit. Exit points
   * and linkage have fields of their own.
   */
  variant: z.array(z.enum(["campaign", "closed_system", "interest_during_term", "best_of"])).min(1).optional(),
  /** One plain-Hebrew sentence on an open doubt about the record (the printed rate and its conditions disagree, a stated end date has passed). The page shows it beside the figure. Absent when there is none. */
  doubt_he: z.string().min(1).optional(),
  snapshot: isoDate,
  source,
});

export type DepositTerms = z.infer<typeof depositTerms>;
