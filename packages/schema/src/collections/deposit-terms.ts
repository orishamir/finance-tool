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

/** How an amount at one bound of a deposit's amount range stands (F-108): outside the range, or not known from the bank's table. */
export const amountEdge = z.enum(["excluded", "unknown"]);

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
  /**
   * The term in days, where the bank's table prints it as one count of days beside the term ("פיקדון ל-3 חודשים (90 יום)", "30 יום"),
   * a value object in `days` whose notes quote it. F-21 counts a term under a year by these days. Absent where the table prints none, or
   * prints a range of days ("30-59 יום").
   */
  term_days: valueObject.optional(),
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
  /**
   * How the product calculates interest, where the bank prints it (BANK-50: the disclosure rules' Schedule A leaves `m`, the times a year
   * interest is calculated, to each product): `effective_annual`, the effective annual rate the bank prints beside the nominal one ("ריבית
   * מתואמת", Mizrahi-Tefahot's "ריבית אפקטיבית"), in `pct_per_year`; `periods_per_year`, the times a year the bank's words say interest is
   * calculated or credited ("בריבית דריבית חודשית" is 12, "בכל סוף רבעון" 4), in `count`. Each value's notes quote the record. F-21 reads it
   * for a term over a year and F-26 for a current account. Absent where the bank prints neither.
   */
  interest_calc: z
    .strictObject({ effective_annual: valueObject.optional(), periods_per_year: valueObject.optional() })
    .refine((c) => c.effective_annual !== undefined || c.periods_per_year !== undefined, { message: "interest_calc holds an effective annual rate or the times a year interest is calculated" })
    .optional(),
  linkage: z.enum(["none", "cpi", "fx"]),
  // null only with an open source: a null bucket at another strength would read "not found in the source", not the open question and its lock
  tax_bucket: valueObject.and(z.object({ value: taxBucket.nullable() })).refine((t) => t.value !== null || t.source.strength === "open", {
    message: 'tax_bucket.value is null only when its source strength is "open"',
    path: ["value"],
  }),
  amount_range: z
    .strictObject({
      min: valueObject,
      max: valueObject.nullable(),
      /**
       * Whether the amount at a bound is inside the range (F-108). Absent: the bound is included, as "מ־X" and "עד X" read. `excluded`:
       * the bank's table prints the bound as not included ("לא כולל" in its head, or "מעל X"). `unknown`: two amount tiers of one
       * product print the same figure, each as its own ("עד 50,000" and "50,000 ומעלה"), so which rate that amount gets is not in the
       * source. Set only on a bound that is a number.
       */
      min_edge: amountEdge.optional(),
      max_edge: amountEdge.optional(),
    })
    .refine((a) => a.min_edge === undefined || typeof a.min.value === "number", { message: "min_edge is set only on a minimum that is a number", path: ["min_edge"] })
    .refine((a) => a.max_edge === undefined || (a.max !== null && typeof a.max.value === "number"), { message: "max_edge is set only on a maximum that is a number", path: ["max_edge"] }),
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
   * The bank's printed conditions on the balance itself, for a current account (F-26): the rate is paid only while the balance, or all
   * the customer's assets in the account, stay on one side of a figure. `measure`: `daily_balance` (the balance on every day of the
   * month), `average_balance` (the month's average balance), `total_assets` (everything the customer holds in the account: the current
   * account, securities, deposits). `bound`: `min` or `max`; `inclusive` is false where the bank prints "below" or "above" rather than
   * "up to" or "and more". `value` is the figure in `nis`, its notes quoting the bank's words. A condition that is not a figure on a
   * balance (a salary, card spending, a tariff track) stays in `conditions_he` only. Absent where the bank prints none.
   */
  balance_conditions: z
    .array(
      z.strictObject({
        measure: z.enum(["daily_balance", "average_balance", "total_assets"]),
        bound: z.enum(["min", "max"]),
        inclusive: z.boolean(),
        value: valueObject,
      }),
    )
    .min(1)
    .optional(),
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
