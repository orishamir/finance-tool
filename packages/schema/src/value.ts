// The value object and the shared vocabularies: docs/data-schema.md §1 and §2.
import { z } from "zod";

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");

/** data-schema §2, units. */
export const unit = z.enum([
  "nis",
  "pct",
  "pct_per_year",
  "pct_of_deposit",
  "pct_of_trade",
  "pct_of_balance_per_period",
  "nis_per_month",
  "nis_per_trade",
  "nis_per_transfer",
  "months",
  "years",
  "days",
  "business_days",
  "index_points",
  "count",
  "boolean",
  "text",
]);

/** data-schema §1, strength vocabulary (il-finance README plus primary-mirror and entered). */
export const strength = z.enum(["primary", "primary-mirror", "institution", "secondary", "open", "entered"]);

/** D7: the three number states. */
export const numberState = z.enum(["sourced", "computed", "entered"]);

/** data-schema §1, update_rule. "frozen YYYY-YYYY" carries its own years. */
export const updateRule = z.union([
  z.enum([
    "fixed in law",
    "fixed in regulation",
    "cpi-linked 1 jan",
    "average-wage-linked",
    "provider-set",
    "market",
    "founder",
  ]),
  z.string().regex(/^frozen \d{4}-\d{4}$/, 'update_rule "frozen" must name its years, e.g. "frozen 2025-2027"'),
]);

export const source = z.object({
  url: z.string().min(1),
  title: z.string().min(1),
  publisher: z.string().min(1),
  strength,
});

export const computedFrom = z.object({
  formula: z.string().regex(/^[FA]-\d{2}$/),
  inputs: z.record(z.string(), z.unknown()),
});

/** data-schema §1: a number never appears bare. */
export const valueObject = z
  .object({
    value: z.union([z.number(), z.string(), z.boolean(), z.null()]),
    unit,
    source,
    checked: isoDate,
    effective_from: isoDate.nullable(),
    effective_to: isoDate.nullable(),
    tax_year: z.number().int().nullable().optional(),
    update_rule: updateRule,
    rule_ids: z.array(z.string()).optional(),
    state: numberState,
    computed_from: computedFrom.optional(),
    notes: z.string().optional(),
  })
  .refine((v) => v.value !== null || (v.notes ?? "").trim() !== "", {
    message: "value is null, so notes must say why",
    path: ["notes"],
  })
  .refine((v) => v.state !== "computed" || v.computed_from !== undefined, {
    message: "a computed value must carry computed_from",
    path: ["computed_from"],
  });

export type ValueObject = z.infer<typeof valueObject>;
