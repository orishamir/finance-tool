// data/rules/: rule figures the engine reads. docs/data-schema.md §3.1.
import { z } from "zod";
import { isoDate, valueObject } from "../value.ts";

const bracket = z.object({ up_to: valueObject, rate: valueObject });

const figure = z.union([
  valueObject,
  z.object({ by_tax_year: z.record(z.string().regex(/^\d{4}$/), valueObject) }),
  z.array(bracket),
]);

export const ruleRecord = z
  .object({
    id: z.string().regex(/^[A-Z0-9]+-[A-Z0-9]+$/),
    title: z.string().min(1),
    strength: z.enum(["primary", "primary-mirror", "institution", "secondary", "open"]),
    dimensions: z.array(z.string()),
    likely_to_change: z.enum(["yes", "no"]),
    recheck_date: isoDate.nullable().optional(),
    figures: z.record(z.string(), figure).optional(),
    il_finance_file: z.string().regex(/\.md$/),
    checked: isoDate,
  })
  .refine((r) => r.strength !== "open" || r.figures === undefined, {
    message: "an open rule carries no figures (data-schema §4 item 3)",
    path: ["figures"],
  })
  .refine((r) => r.likely_to_change !== "yes" || !!r.recheck_date, {
    message: "a rule likely to change needs a recheck_date (product.md 3.8)",
    path: ["recheck_date"],
  });

export type RuleRecord = z.infer<typeof ruleRecord>;
