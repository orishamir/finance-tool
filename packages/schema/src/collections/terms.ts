// data/terms/<id>.json (term matching) and data/dimensions/<id>.json. docs/data-schema.md §3.11.
// Strict: a field the doc does not name is an error.
import { z } from "zod";
import { isoDate, productId, source } from "../value.ts";

const termSource = source.extend({ checked: isoDate });
const ruleIds = z.array(z.string().min(1));

/** data-schema §3.11, `where`: the places a reader meets the term. */
export const termWhere = z.enum(["statement", "bank-statement", "payslip", "app", "ad", "law", "form", "bylaws", "gemel-net", "prospectus", "tariff", "fund-name", "tax-form", "pensia-net", "provider-site"]);

export const termRecord = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  he: z.string().min(1),
  en: z.string().min(1).nullable(),
  meaning: z.string().min(1),
  where: z.array(termWhere),
  wrapper_ids: z.array(productId),
  /** Exposure records (data/instruments/exposures/) the term belongs to; ids as in the exposure collection. */
  exposure_ids: z.array(z.string().regex(/^[a-z0-9-]+$/)).optional(),
  /** Other spellings of the term. */
  variants: z.array(z.string().min(1)),
  rule_ids: ruleIds,
  source: termSource,
  /** Payslip labels carry strength "institution" and seen_by (G-19). */
  seen_by: z.string().min(1).optional(),
});

export type TermRecord = z.infer<typeof termRecord>;

/** The 26 checklist rows of docs/glossary.md section 2 (data-schema §2, Dimensions). */
export const dimensionId = z.enum([
  "tax-at-deposit",
  "tax-during",
  "tax-at-exit",
  "real-vs-nominal",
  "age-or-use-exemption",
  "switching-tax-event",
  "loss-offset",
  "foreign-withholding-domicile",
  "distribution-policy",
  "fee-management-balance",
  "fee-deposit",
  "fee-trade",
  "fee-custody",
  "fee-fx",
  "fee-exit",
  "fee-change-over-time",
  "liquidity-lockup",
  "deposit-ceiling",
  "protection",
  "currency",
  "minimum",
  "regulator",
  "reporting-obligation",
  "eligibility",
  "transfer-switch-process",
  "insurance-cover",
]);

export const dimensionRecord = z.strictObject({
  id: dimensionId,
  he: z.string().min(1),
  one_line: z.string().min(1),
  source: termSource,
  rule_ids: ruleIds,
});

export type DimensionRecord = z.infer<typeof dimensionRecord>;
