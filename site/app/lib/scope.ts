// Who a rule applies to, on the site (D30; research/specs/2026-10-25-rules-scope/spec.md §4). Pure helpers, safe in the browser:
// the record carries its scope and the companies it names (extracted from the rule base), and the root loader gives every page the
// link of each company (`ProvenanceData.companies`).
import type { RuleRecord } from "@finance-tool/schema";
import { scopeWords } from "../copy";

export type Scope = RuleRecord["scope"];

/** A company a page can link to: its Hebrew name and where the site lists its terms (its page, or its group on /companies). */
export interface CompanyLink {
  name: string;
  href: string;
  /** False when the site has no page of its own for the company (a fund manager, an index provider, a foreign broker): `href` is then its group on /companies. */
  hasPage: boolean;
}

/** The anchor of the company-terms section on a company page, and of a company's group on /companies. */
export const companyTermsAnchor = "company-terms";
export const noPageAnchor = (id: string) => `terms-${id}`;
/** The group on /companies for records that name no company (unsettled, seen in the press or a forum only). */
export const noCompanyAnchor = "terms-none";

export const isGeneral = (rule: Pick<RuleRecord, "scope"> | undefined): boolean => rule?.scope === "general";

/** The companies a record names, in its order: the institution's own, or where an unsettled one was seen. */
export function scopeCompanies(rule: Pick<RuleRecord, "scope_institutions">): { id: string; name_he: string }[] {
  return rule.scope_institutions ?? [];
}

/**
 * Of a list of rule ids, the ones a product context may show: those whose record is general. An id with no record on the page is
 * kept (its chip says the text is missing; nothing about a company is claimed).
 */
export function generalOnly(ids: readonly string[], rules: Record<string, Pick<RuleRecord, "scope">>): string[] {
  return ids.filter((id) => !rules[id] || isGeneral(rules[id]));
}

/** The link of each company a record names: the page's own map first, then the company's group on /companies. */
export function companyLinksOf(rule: Pick<RuleRecord, "scope_institutions">, companies: Record<string, CompanyLink> | undefined): (CompanyLink & { id: string })[] {
  return scopeCompanies(rule).map((c) => ({ id: c.id, name: c.name_he, href: companies?.[c.id]?.href ?? `/companies#${noPageAnchor(c.id)}`, hasPage: companies?.[c.id]?.hasPage ?? false }));
}

/**
 * Where a record that is not general is listed: the first company that has a page (its card on that page), else the first company's
 * group on /companies, else the /companies group of records that name no company.
 */
export function companyTermsHref(rule: Pick<RuleRecord, "id" | "scope_institutions">, companies: Record<string, CompanyLink> | undefined): string {
  const links = companyLinksOf(rule, companies);
  const page = links.find((l) => l.hasPage);
  if (page) return `${page.href}#${rule.id}`;
  return links[0]?.href ?? `/companies#${noCompanyAnchor}`;
}

/**
 * The chip's words for a record that is not general (spec §4: the chip shows the company's name, not a code): the page's own company
 * when the record names it, else the first company, with "and N more" (copy) and the count of the others. Null when it names none (the code stays).
 */
export function chipName(rule: Pick<RuleRecord, "scope_institutions">, current: string | undefined, more: (n: number) => string): string | null {
  const list = scopeCompanies(rule);
  if (list.length === 0) return null;
  const first = list.find((c) => c.id === current) ?? list[0]!;
  return list.length === 1 ? first.name_he : `${first.name_he} ${more(list.length - 1)}`;
}

/** A Hebrew list of names (copy.md 10.4): commas, and the conjunction only before the last. */
export function joinNames(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  const last = names[names.length - 1]!;
  // a maqaf between the conjunction and a Latin name (copy.md 10.4), none before a Hebrew one
  return `${names.slice(0, -1).join(", ")} ${/^[\u05D0-\u05EA]/.test(last) ? scopeWords.and.hebrew : scopeWords.and.latin}${last}`;
}
