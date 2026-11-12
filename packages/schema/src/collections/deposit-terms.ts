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
  /**
   * The rate the bank prints in a column of its own beside the offered rate ("ריבית אפקטיבית", Mizrahi-Tefahot's table), recorded only where
   * the offered rate is not one number (a rate for each period between exit points), so a page has the bank's one figure to show. The bank
   * defines the column only in some product terms, as an average where the rate is not uniform over the term. Absent otherwise.
   */
  rate_effective: valueObject.optional(),
  linkage: z.enum(["none", "cpi", "fx"]),
  // null only with an open source: a null bucket at another strength would read "not found in the source", not the open question and its lock
  tax_bucket: valueObject.and(z.object({ value: taxBucket.nullable() })).refine((t) => t.value !== null || t.source.strength === "open", {
    message: 'tax_bucket.value is null only when its source strength is "open"',
    path: ["value"],
  }),
  amount_range: z.strictObject({ min: valueObject, max: valueObject.nullable() }),
  break: breakTerms,
  exit_points: z
    .strictObject({
      exists: z.boolean(),
      /** The interval between exit points in months, as the bank prints how often they come; not the date of the first one. Null where there are none or the bank prints no interval. */
      every_months: z.number().positive().nullable(),
      /**
       * Months from the deposit's start to its first exit point, as the bank prints it ("בתום 6 חודשים, וכל 3 חודשים לאחר מכן" is 6, added
       * 2026-11-12). A record with exit points always carries the key: a number, or null when the bank prints only how often the exit
       * points come. The first one is then not known, and no reader may take it to fall one interval after the start (a plan with yearly
       * exit points may open its first after ten years). A record without exit points leaves it out or null.
       */
      first_after_months: z.number().positive().nullable().optional(),
    })
    .refine((e) => e.exists || e.every_months === null, { message: "every_months is set only where exit points exist", path: ["every_months"] })
    .refine((e) => e.exists || (e.first_after_months ?? null) === null, { message: "first_after_months is set only where exit points exist", path: ["first_after_months"] })
    .refine((e) => !e.exists || e.first_after_months !== undefined, {
      message: "a deposit with exit points says when the first one falls (first_after_months), or null where the bank prints only how often they come",
      path: ["first_after_months"],
    }),
  auto_renew: z.strictObject({ value: z.boolean(), max_renewals: z.number().int().nullable() }),
  /**
   * A short plain-Hebrew summary of the conditions the bank prints for the rate (guide page of the current account). Faithful to the
   * printed text quoted in the notes of `rate_offered`; it adds nothing that is not printed. Absent when the page has no summary yet.
   */
  conditions_he: z.string().min(1).optional(),
  /**
   * What sets the deposit apart from the bank's plain deposit of its term and kind, as the bank's own table or terms print it (F-86 reads
   * one plain deposit per bank): a campaign product, a deposit through a closed-system account (the money comes only from and returns only
   * to the person's account at another bank, BANK-21; who may open one is the bank's own term), a deposit only for people who join the bank, until a date it prints, interest paid during the term instead of at
   * its end, or a choice at the end between two returns. Absent on a plain deposit. Exit points
   * and linkage have fields of their own.
   */
  variant: z.array(z.enum(["campaign", "closed_system", "new_customers", "interest_during_term", "best_of"])).min(1).optional(),
  /** One plain-Hebrew sentence on an open doubt about the record (the printed rate and its conditions disagree, a stated end date has passed). The page shows it beside the figure. Absent when there is none. */
  doubt_he: z.string().min(1).optional(),
  snapshot: isoDate,
  source,
})
  // an exit point is a day inside the term: a first one at the term's end or after it is the maturity, or a misread figure. A term
  // in days is set against the first in months by the average month (365.25 / 12 days), a term in years by twelve months a year.
  .refine(
    (d) => {
      const first = d.exit_points.first_after_months;
      const term = d.term_months.value;
      if (typeof first !== "number" || typeof term !== "number") return true;
      const months = d.term_months.unit === "months" ? term : d.term_months.unit === "days" ? term / (365.25 / 12) : d.term_months.unit === "years" ? term * 12 : null;
      return months === null || first < months;
    },
    { message: "the first exit point falls at or after the end of the term", path: ["exit_points", "first_after_months"] },
  );

export type DepositTerms = z.infer<typeof depositTerms>;
