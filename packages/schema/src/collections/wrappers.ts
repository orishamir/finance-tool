// data/instruments/wrappers/: one record per wrapper; data/instruments/securities/: one record per security (D6).
// docs/data-schema.md §3.3. Strict at every level: a field the doc does not name is an error, so a typo cannot pass as data.
import { z } from "zod";
import { feeBase, securityId, isoDate, productId, valueObject, wrapperId } from "../value.ts";

const formulaId = z.string().regex(/^F-\d{2,3}$/, "formula must be a method.md ID, e.g. F-44");
const ruleIds = z.array(z.string().min(1));

const taxStep = z.strictObject({ formula: formulaId, rule_ids: ruleIds });

const recordId = z.string().regex(/^[A-Z0-9]+-[A-Z0-9]+$/);
/** One entry of `company_terms`: a record id, or the record with the companies (registry ids) whose own term on the property it states. */
export const companyTermRef = z.union([recordId, z.strictObject({ rule: recordId, companies: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1) })]);
export type CompanyTermRef = z.infer<typeof companyTermRef>;
/** The record id of a `company_terms` entry. */
export const companyTermRule = (ref: CompanyTermRef): string => (typeof ref === "string" ? ref : ref.rule);

/**
 * A legal cap on one fee base (data-schema §3.3): a value object, `binds` where the cap binds only some providers, and `caveat` where it
 * holds only in a case a deal does not state. `banks`: the cap binds banks only (the price of moving securities out, BRK-18; the ban on
 * custody of makam, BRK-17). `banks_and_fund_distributors`: the cap binds banks, and a fund's distributor that is not an investment
 * marketer where it has a distribution agreement for the fund (the ban on custody of money-market units, BANK-18, MF-26 reg. 2(ד)). The
 * fee page judges a cap with `binds` only where the deal names a bank (F-113). With a `caveat` the fee page states the cap in the
 * caveat's words and judges no price against it, at any provider (F-113): `closing_account`, a bank's price for moving securities out is
 * at most the value only when the account is being closed, with what the bank paid a third party added, and the supervised price holds
 * while it stays open (BRK-18, SW-33); `distribution_agreement`, no cap is set in general (the value is empty), but a bank or a fund's
 * distributor with a distribution agreement for the fund may charge the holder nothing for buying or redeeming its units (MF-26 reg. 2(ד)).
 */
export const feeCap = valueObject.safeExtend({
  binds: z.enum(["banks", "banks_and_fund_distributors"]).optional(),
  caveat: z.enum(["closing_account", "distribution_agreement"]).optional(),
});

export type FeeCap = z.infer<typeof feeCap>;

/** The fields a wrapper and a security share: what the product's guide page, checklist and run read (data-schema §3.3). */
const productFields = {
  names: z.strictObject({ he: z.array(z.string().min(1)), statement: z.array(z.string()), app: z.array(z.string()) }),
  regulator: valueObject,
  fee_bases_allowed: z.array(feeBase),
  fee_caps: z.partialRecord(feeBase, feeCap),
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
  transfer_routes: z.array(z.strictObject({ to: productId, condition: z.string().min(1).optional(), rule_ids: ruleIds })),
  eligibility: z.strictObject({ rule_ids: ruleIds, text: z.string().min(1) }),
  protection: z.strictObject({ rule_ids: ruleIds, text: z.string().min(1) }),
  dimensions: z.record(z.string(), z.string().regex(/^(covered|blocked)(:[A-Z0-9-]+)?$/)),
  /**
   * A property that each company sets for itself (D30, spec 2026-10-25-rules-scope §4): dimension id → the `institution` or
   * `unsettled` records that hold the companies' own terms. The guide says "תלוי בחברה" there and links to those companies' pages;
   * the records are never cited as the product's (they are not `rule_ids`, so they mark no dimension). An entry is a record id (every
   * company whose section lists it), or `{ rule, companies }` when the record states the property for only some of its companies
   * (BRK-28 gives a minimum for Meitav Trade, not for Leumi or Psagot).
   */
  company_terms: z.record(z.string(), z.array(companyTermRef).min(1)).optional(),
  tier: z.union([z.literal(1), z.literal(2)]),
  open_questions: z.array(z.string()),
  /** Set when the wrapper closes (D6); absent or null while it is open. */
  effective_to: isoDate.nullable().optional(),
  checked: isoDate,
};

/** A wrapper: a container whose rules apply to whatever it holds (D6). */
export const wrapperRecord = z.strictObject({ id: wrapperId, ...productFields });

export type WrapperRecord = z.infer<typeof wrapperRecord>;

/**
 * A security (D6): what a person buys inside a wrapper, held directly (makam, a government bond) or as fund units, and carrying rules of its own (tax
 * in a taxable account, its own liquidity, the issuer behind it, a fee rule by security type). `held_in` names the wrappers that can
 * hold it, the first being the one its guide page and its comparison option run in; what that wrapper decides (who may open it,
 * who supervises it, how client assets are kept) is read from that wrapper's record, not copied here.
 */
export const securityRecord = z.strictObject({
  id: securityId,
  /** "direct": held directly (makam, a government bond); "fund_units": units of a fund (the money-market funds). */
  held_as: z.enum(["direct", "fund_units"]),
  held_in: z.strictObject({ wrapper_ids: z.array(wrapperId).min(1), rule_ids: ruleIds, text: z.string().min(1) }),
  ...productFields,
});

export type SecurityRecord = z.infer<typeof securityRecord>;

/** A product: a wrapper or a security held in one, what a guide page and a comparison option stand for. */
export const productRecord = z.union([wrapperRecord, securityRecord]);

/** The schema a product record is checked against: a security's when it carries `held_in`, else a wrapper's (field-level errors, not the union's). */
export const productSchemaOf = (value: unknown): typeof wrapperRecord | typeof securityRecord =>
  typeof value === "object" && value !== null && "held_in" in value ? securityRecord : wrapperRecord;

export type ProductRecord = WrapperRecord | SecurityRecord;

/** Whether a product record is a security (not a wrapper). */
export const isSecurity = (r: ProductRecord): r is SecurityRecord => "held_in" in r;
