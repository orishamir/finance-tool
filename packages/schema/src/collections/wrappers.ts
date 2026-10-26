// data/instruments/wrappers/: one record per wrapper (D6). docs/data-schema.md §3.3.
// Strict at every level: a field the doc does not name is an error, so a typo cannot pass as data.
import { z } from "zod";
import { feeBase, isoDate, valueObject, wrapperId } from "../value.ts";

const formulaId = z.string().regex(/^F-\d{2}$/, "formula must be a method.md ID, e.g. F-44");
const ruleIds = z.array(z.string().min(1));

const taxStep = z.strictObject({ formula: formulaId, rule_ids: ruleIds });

const recordId = z.string().regex(/^[A-Z0-9]+-[A-Z0-9]+$/);
/** One entry of `company_terms`: a record id, or the record with the companies (registry ids) whose own term on the property it states. */
export const companyTermRef = z.union([recordId, z.strictObject({ rule: recordId, companies: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1) })]);
export type CompanyTermRef = z.infer<typeof companyTermRef>;
/** The record id of a `company_terms` entry. */
export const companyTermRule = (ref: CompanyTermRef): string => (typeof ref === "string" ? ref : ref.rule);

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
  // `kind` vocabulary (data-schema §3.3): any_time | at_maturity | after_years | at_age | at_child_age | trading_day.
  lawful_exit: z.strictObject({
    kind: z.string().min(1),
    payout_business_days: valueObject.optional(),
    years: valueObject.optional(),
    age: valueObject.optional(),
    term_months: valueObject.optional(),
    text: z.string().min(1).optional(),
  }),
  switch_is_tax_event: valueObject,
  transfer_routes: z.array(z.strictObject({ to: wrapperId, condition: z.string().min(1).optional(), rule_ids: ruleIds })),
  eligibility: z.strictObject({ rule_ids: ruleIds, text: z.string().min(1) }),
  protection: z.strictObject({ rule_ids: ruleIds, text: z.string().min(1) }),
  dimensions: z.record(z.string(), z.string().regex(/^(covered|blocked)(:[A-Z0-9-]+)?$/)),
  /**
   * A property that each company sets for itself (D30, spec 2026-10-25-rules-scope §4): dimension id → the `institution` or
   * `unsettled` records that hold the companies' own terms. The guide says "תלוי בחברה" there and links to those companies' pages;
   * the records are never cited as the product's (they are not `rule_ids`, so they mark no dimension). An entry is a record id (every
   * company whose section lists it), or `{ rule, companies }` when the record states the property for only some of its companies
   * (BRK-28 gives a minimum for Meitav Trade and Fair, not for Leumi or Psagot: review, 2026-10-26).
   */
  company_terms: z.record(z.string(), z.array(companyTermRef).min(1)).optional(),
  tier: z.union([z.literal(1), z.literal(2)]),
  open_questions: z.array(z.string()),
  /** Set when the wrapper closes (D6); absent or null while it is open. */
  effective_to: isoDate.nullable().optional(),
  checked: isoDate,
});

export type WrapperRecord = z.infer<typeof wrapperRecord>;
