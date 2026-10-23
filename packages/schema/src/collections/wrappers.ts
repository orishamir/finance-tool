// data/instruments/wrappers/: one record per wrapper (D6). docs/data-schema.md §3.3.
// Strict at every level: a field the doc does not name is an error, so a typo cannot pass as data.
import { z } from "zod";
import { feeBase, isoDate, valueObject, wrapperId } from "../value.ts";

const formulaId = z.string().regex(/^F-\d{2}$/, "formula must be a method.md ID, e.g. F-44");
const ruleIds = z.array(z.string().min(1));

const taxStep = z.strictObject({ formula: formulaId, rule_ids: ruleIds });

export const wrapperRecord = z.strictObject({
  id: wrapperId,
  names: z.strictObject({ he: z.array(z.string().min(1)), statement: z.array(z.string()), app: z.array(z.string()) }),
  regulator: valueObject,
  fee_bases_allowed: z.array(feeBase),
  fee_caps: z.partialRecord(feeBase, valueObject),
  ceiling: z.strictObject({ per: z.string().min(1), amount: valueObject }).nullable(),
  deposit_side_tax: taxStep,
  tax_during: taxStep,
  tax_at_exit: taxStep.extend({ blocked_by: z.array(z.string()), labels: z.array(z.string()) }),
  // Only the "any_time" shape is in the doc so far; other kinds add their fields when their records are written.
  lawful_exit: z.strictObject({ kind: z.string().min(1), payout_business_days: valueObject.optional() }),
  switch_is_tax_event: valueObject,
  transfer_routes: z.array(z.strictObject({ to: wrapperId, condition: z.string().min(1).optional(), rule_ids: ruleIds })),
  eligibility: z.strictObject({ rule_ids: ruleIds, text: z.string().min(1) }),
  protection: z.strictObject({ rule_ids: ruleIds, text: z.string().min(1) }),
  dimensions: z.record(z.string(), z.string().regex(/^(covered|blocked)(:[A-Z0-9-]+)?$/)),
  tier: z.union([z.literal(1), z.literal(2)]),
  open_questions: z.array(z.string()),
  /** Set when the wrapper closes (D6); absent or null while it is open. */
  effective_to: isoDate.nullable().optional(),
  checked: isoDate,
});

export type WrapperRecord = z.infer<typeof wrapperRecord>;
