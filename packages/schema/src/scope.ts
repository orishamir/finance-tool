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
 * not moved). The lead's brief of 2026-10-26: leave them where they are for now. Each names the product-context files where it may
 * stand today (a wrapper or exposure record under data/, a guide or exposure prose module under site/app/content/), so a new use
 * fails (review, 2026-10-26); a record not general that stands in none has `files: []`. Each still carries its scope, and its card
 * says it. Never listed in a company's section ("מה כתוב במסמכים של …"): a not-rule is not a company's term. The list only shrinks
 * as each one moves to `data/` or the open questions.
 */
export const notRules: Readonly<Record<string, { why: string; files: readonly string[] }>> = {
  "SW-X01": { why: "forum post", files: [] },
  "SW-X02": { why: "forum post", files: [] },
  "SW-X03": { why: "forum post", files: [] },
  "SW-X04": { why: "forum post", files: [] },
  "IRA-28": { why: "press report (events at Slice and Globalnet)", files: ["data/instruments/wrappers/ira-hishtalmut.json", "data/instruments/wrappers/ira-provident.json", "site/app/content/guide/ira-hishtalmut.tsx", "site/app/content/guide/ira-provident.tsx"] },
  "TXH-24": { why: "press report", files: [] },
  "MKT-01": { why: "a series (J.P. Morgan's past-return slide)", files: [] },
  "PEN-46": { why: "a per-fund series", files: [] },
  "PF-41": { why: "a per-fund series", files: [] },
  "MF-18": { why: "a series (the Securities Authority's yearly averages)", files: [] },
  "CS-20": { why: "a share (tracks chosen by parents)", files: [] },
  "CS-22": { why: "market shares", files: [] },
  "CS-08": { why: "figures (the rule part is general)", files: [] },
  "SW-53": { why: "two brokers' tariffs (belong in data/fees)", files: [] },
  "TXS-26": { why: "a tax-track field of named funds", files: [] },
  "TXS-27": { why: "a tax-track field of named funds", files: [] },
  "IRA-03": { why: "a count", files: [] },
  "IRA-17": { why: "a range of fee averages", files: [] },
  "ETF-32": { why: "a list", files: [] },
  "ETF-43": { why: "a count", files: [] },
  "ETF-50": { why: "a count", files: [] },
  "BRK-32": { why: "TASE's member register", files: [] },
  "TXS-24": { why: "a count over Maya's export", files: [] },
  "CAT-42": { why: "Maya's counts and download steps", files: [] },
  "MF-52": { why: "a count", files: [] },
  "REG-03": { why: "a list (the Bank of Israel's banking corporations)", files: [] },
  "REG-14": { why: "a list (TASE's members)", files: ["site/app/content/guide/brokerage-account.tsx"] },
  "MGD-23": { why: "a count", files: [] },
  "ETF-17": { why: "the Securities Authority's own count", files: [] },
  "ETF-18": { why: "the Securities Authority's own count", files: [] },
  "ETF-26": { why: "the Securities Authority's own count", files: [] },
  "MF-55": { why: "website terms (the Securities Authority's)", files: [] },
  "CAT-43": { why: "website terms (TASE's)", files: [] },
  "GOV-19": { why: "where official yields are published", files: [] },
  "PF-39": { why: "website terms paragraph", files: [] },
  "KGL-24": { why: "a computation check", files: [] },
  "TXS-22": { why: "a summary", files: [] },
  "BANK-23": { why: "\"no rule exists\" record", files: [] },
  "BANK-27": { why: "\"no rule exists\" record", files: [] },
  "IRA-10": { why: "\"no rule exists\" record", files: [] },
  "SW-19": { why: "\"no rule exists\" record", files: [] },
  "SW-34": { why: "\"no rule exists\" record", files: ["data/instruments/wrappers/brokerage-account.json"] },
  "SW-37": { why: "\"no rule exists\" record", files: [] },
};

/** Whether a not-rule may stand in this product-context file (a repo path, "data/instruments/wrappers/x.json"). */
export const notRuleAllowedIn = (id: string, file: string): boolean => Object.hasOwn(notRules, id) && notRules[id]!.files.includes(file);

/**
 * An index page is the index provider's own context (D31; requests.md §5: "ETF-37 to ETF-40 may stay on index-sp500"): the
 * provider's rulebook about its own index may be cited there. Exposure id → the records it may cite, by name (review, 2026-10-26:
 * not every record of the provider), each the provider's own (the validator checks the record names only that provider).
 */
export const ownContextExposures: Readonly<Record<string, readonly string[]>> = {
  "index-sp500": ["ETF-37", "ETF-38", "ETF-39", "ETF-40"],
};

// ---------------------------------------------------------------- a company's own document (review, 2026-10-26)

/** Hosts whose files others file: a Maya filing is its filer's own document, never the exchange's. */
export const filingHosts: ReadonlySet<string> = new Set(["mayafiles.tase.co.il"]);

/** Where a company's own documents live (`data/sources/institutions.json`): its sites, and the names its filings open with. */
export interface OwnDocumentKeys {
  own_hosts: readonly string[];
  filing_names?: readonly string[];
}

const hostOfUrl = (url: string): string => {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
};

/**
 * Whether a source is the company's own document: on one of its own sites (a subdomain counts), or, on a filing host, a filing whose
 * title opens with one of its filing names ("הראל, דוח שנתי …", "IBI ETF annual report …"). A regulator's announcement about the
 * company, a newspaper or a forum is not.
 */
export function isOwnDocument(source: { url: string; title: string; title_he?: string }, company: OwnDocumentKeys): boolean {
  const host = hostOfUrl(source.url);
  if (!host) return false;
  if (filingHosts.has(host)) return (company.filing_names ?? []).some((n) => source.title.startsWith(n) || (source.title_he ?? "").startsWith(n));
  return (company.own_hosts ?? []).some((h) => host === h || host.endsWith(`.${h}`));
}

/** Of the companies a record names, in its order, those whose own document is among its sources. */
export function ownDocumentCompanies(rule: { scope_institutions?: readonly { id: string }[]; sources?: readonly { url: string; title: string; title_he?: string }[] }, registry: ReadonlyMap<string, OwnDocumentKeys>): string[] {
  return (rule.scope_institutions ?? [])
    .map((c) => c.id)
    .filter((id) => {
      const row = registry.get(id);
      return !!row && (rule.sources ?? []).some((s) => isOwnDocument(s, row));
    });
}

/**
 * The companies whose section lists a record (spec §4, "מה כתוב במסמכים של {company}"; review, 2026-10-26): each company it names
 * whose own document it cites (`own`, from `ownDocumentCompanies`); none for a general rule or a not-rule. A press report about a
 * company, or a forum post, is never listed as that company's.
 */
export function listedAt(rule: { id: string; scope: string }, own: readonly string[]): string[] {
  return rule.scope === "general" || Object.hasOwn(notRules, rule.id) ? [] : [...own];
}
