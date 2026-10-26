// Who a rule applies to (D30, research/specs/2026-10-25-rules-scope/spec.md §1 and §3), shared by the validator and the site so
// both read the same lists: the scope words, the source kinds a general rule may be cited from first, the records the rule base
// keeps that are not rules (left where they are for now), and the index pages that are an index provider's own context (D31).
import { z } from "zod";

/** `general`: a law, regulation, regulator or exchange rule says it; `institution`: one named company's own term; `unsettled`: reads like a general rule, but only company documents (or the press) support it. */
export const ruleScope = z.enum(["general", "institution", "unsettled"]);
export type RuleScope = z.infer<typeof ruleScope>;

/** A company a scope names: its id in `data/sources/institutions.json` and the Hebrew name the site shows. */
export const scopeInstitution = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name_he: z.string().min(1),
});
export type ScopeInstitution = z.infer<typeof scopeInstitution>;

/**
 * The first source of a `general` rule is one of these kinds (spec §3: law, regulation, circular, regulator page, exchange rule,
 * dataset; an official PDF is a regulator's or ministry's own file). Never `institution_doc`, and never a source whose strength is
 * `institution`.
 */
export const generalSourceKinds: ReadonlySet<string> = new Set(["law", "regulation", "circular", "regulator_page", "official_pdf", "exchange_rules", "dataset"]);

/**
 * Records the rule base keeps that are not rules (research/knowledge/2026-10-25-scope/requests.md §4, a judgement call: listed,
 * not moved). The lead's brief of 2026-10-26: leave them where they are for now. The scope checks of product contexts skip them;
 * each still carries its scope, and the rule card says it. The list only shrinks as each one moves to `data/` or the open questions.
 */
export const notRules: Readonly<Record<string, string>> = {
  "SW-X01": "forum post",
  "SW-X02": "forum post",
  "SW-X03": "forum post",
  "SW-X04": "forum post",
  "IRA-28": "press report (events at Slice and Globalnet)",
  "TXH-24": "press report",
  "MKT-01": "a series (J.P. Morgan's past-return slide)",
  "PEN-46": "a per-fund series",
  "PF-41": "a per-fund series",
  "MF-18": "a series (the Securities Authority's yearly averages)",
  "CS-20": "a share (tracks chosen by parents)",
  "CS-22": "market shares",
  "CS-08": "figures (the rule part is general)",
  "SW-53": "two brokers' tariffs (belong in data/fees)",
  "TXS-26": "a tax-track field of named funds",
  "TXS-27": "a tax-track field of named funds",
  "IRA-03": "a count",
  "IRA-17": "a range of fee averages",
  "ETF-32": "a list",
  "ETF-43": "a count",
  "ETF-50": "a count",
  "BRK-32": "TASE's member register",
  "TXS-24": "a count over Maya's export",
  "CAT-42": "Maya's counts and download steps",
  "MF-52": "a count",
  "REG-03": "a list (the Bank of Israel's banking corporations)",
  "REG-14": "a list (TASE's members)",
  "MGD-23": "a count",
  "ETF-17": "the Securities Authority's own count",
  "ETF-18": "the Securities Authority's own count",
  "ETF-26": "the Securities Authority's own count",
  "MF-55": "website terms (the Securities Authority's)",
  "CAT-43": "website terms (TASE's)",
  "GOV-19": "where official yields are published",
  "PF-39": "website terms paragraph",
  "KGL-24": "a computation check",
  "TXS-22": "a summary",
  "BANK-23": "\"no rule exists\" record",
  "BANK-27": "\"no rule exists\" record",
  "IRA-10": "\"no rule exists\" record",
  "SW-19": "\"no rule exists\" record",
  "SW-34": "\"no rule exists\" record",
  "SW-37": "\"no rule exists\" record",
};

/**
 * An index page is the index provider's own context (D31; requests.md §5: "ETF-37 to ETF-40 may stay on index-sp500"): the
 * provider's rulebook about its own index may be cited there. Exposure id → registry ids of the providers whose terms it may cite.
 */
export const ownContextExposures: Readonly<Record<string, readonly string[]>> = {
  "index-sp500": ["sp-dji"],
  "index-nasdaq100": ["nasdaq"],
  "index-msci-world": ["msci"],
  "index-msci-acwi": ["msci"],
  "index-ta35": ["tase"],
  "index-ta90": ["tase"],
  "index-ta125": ["tase"],
};
