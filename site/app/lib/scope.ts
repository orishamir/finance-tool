// Who a rule applies to, on the site (D30; research/specs/2026-10-25-rules-scope/spec.md §4). Pure helpers, safe in the browser:
// the record carries its scope and the companies it names (extracted from the rule base), and the root loader gives every page the
// link of each company (`ProvenanceData.companies`) and, per record that is not general, the companies whose own document it cites
// (`ProvenanceData.ownDocs`): only those list it in their section (review, 2026-10-26).
import { isOwnDocument, listedAt, notRules, type OwnDocumentKeys, type RuleRecord } from "@finance-tool/schema";
import { scopeWords } from "../copy";

export type Scope = RuleRecord["scope"];

/** A company a page can link to: its Hebrew name and where the site lists its terms (its page, or its group on /companies). */
export interface CompanyLink {
  name: string;
  href: string;
  /** False when the site has no page of its own for the company (a fund manager, an index provider, a foreign broker): `href` is then its group on /companies. */
  hasPage: boolean;
  /** Where its own documents live (the registry's `own_hosts`, `filing_names`): a rule card drops "לפי החברה" only on a source there (D31; review, 2026-10-26). */
  docs?: OwnDocumentKeys;
}

/** The anchor of the company-terms section on a company page, and of a company's group on /companies. */
export const companyTermsAnchor = "company-terms";
export const noPageAnchor = (id: string) => `terms-${id}`;
/** The group on /companies for records that are not general and that no company's section lists: the not-rules (a forum post, a press report, a list, a count, a site's terms). */
export const noCompanyAnchor = "terms-none";

/** Per record that is not general, the companies (registry ids) whose own document it cites; a record missing from the map cites none. */
export type OwnDocs = Record<string, readonly string[]>;

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

/** Whether a record is one the rule base keeps that is not a rule (a forum post, a press report, a list, a count, a site's terms): never in a company's section, listed on /companies under "לא נכלל ככלל". */
export const isNotRule = (id: string): boolean => Object.hasOwn(notRules, id);

/** Of the companies a record names, those whose own document it cites: the record is found in their documents. */
export function ownDocCompanies(rule: Pick<RuleRecord, "id" | "scope_institutions">, ownDocs: OwnDocs | undefined): { id: string; name_he: string }[] {
  const own = new Set(ownDocs?.[rule.id] ?? []);
  return scopeCompanies(rule).filter((c) => own.has(c.id));
}

/**
 * The companies whose section lists a record (spec §4; review, 2026-10-26): those whose own document it cites, never for a not-rule
 * (`listedAt` in the schema, which the validator shares). A press report or a forum post about a company is not that company's.
 */
export function listedCompanies(rule: Pick<RuleRecord, "id" | "scope" | "scope_institutions">, ownDocs: OwnDocs | undefined): { id: string; name_he: string }[] {
  const listed = new Set(listedAt(rule, ownDocs?.[rule.id] ?? []));
  return scopeCompanies(rule).filter((c) => listed.has(c.id));
}

/** The link of each company: the page's own map first, then the company's group on /companies. */
export function companyLinksOf(list: readonly { id: string; name_he: string }[], companies: Record<string, CompanyLink> | undefined): (CompanyLink & { id: string })[] {
  return list.map((c) => ({ id: c.id, name: c.name_he, href: companies?.[c.id]?.href ?? `/companies#${noPageAnchor(c.id)}`, hasPage: companies?.[c.id]?.hasPage ?? false }));
}

/**
 * Where a record that is not general is listed: its card on the first listing company that has a page, else that company's group on
 * /companies, else the /companies group of what no company's section lists (the not-rules).
 */
export function companyTermsHref(rule: Pick<RuleRecord, "id" | "scope" | "scope_institutions">, companies: Record<string, CompanyLink> | undefined, ownDocs: OwnDocs | undefined): string {
  const links = companyLinksOf(listedCompanies(rule, ownDocs), companies);
  const page = links.find((l) => l.hasPage);
  if (page) return `${page.href}#${rule.id}`;
  return links[0]?.href ?? `/companies#${noCompanyAnchor}`;
}

/**
 * The companies a record is shown as from (its chip, its tag, its card's line): those whose own documents it cites; a record that cites
 * none of their documents (a press report, a forum post) is shown as about every company it names (review, 2026-10-26: PEN-37 names
 * Meitav, but cites no document of Meitav, so neither its chip nor its card counts Meitav).
 */
export function shownCompanies(rule: Pick<RuleRecord, "id" | "scope_institutions">, ownDocs: OwnDocs | undefined): { id: string; name_he: string }[] {
  const own = ownDocCompanies(rule, ownDocs);
  return own.length > 0 ? own : scopeCompanies(rule);
}

/** Whether a source on a company's term is one of that company's own documents (D31: only such a source drops "לפי החברה"). */
export function isOwnSourceOf(rule: Pick<RuleRecord, "id" | "scope_institutions">, source: { url: string; title: string; title_he?: string }, ownDocs: OwnDocs | undefined, companies: Record<string, CompanyLink> | undefined): boolean {
  return ownDocCompanies(rule, ownDocs).some((c) => {
    const docs = companies?.[c.id]?.docs;
    return !!docs && isOwnDocument(source, docs);
  });
}

/**
 * The chip's words for a record that is not general (spec §4: the chip shows the company's name, not a code): the page's own company
 * when the record shows it, else the first, with "and N more" (copy) and the count of the others, over the same companies the card
 * names (`shownCompanies`). Null when it names none (the code stays).
 */
export function chipName(rule: Pick<RuleRecord, "id" | "scope_institutions">, ownDocs: OwnDocs | undefined, current: string | undefined, more: (n: number) => string): string | null {
  const list = shownCompanies(rule, ownDocs);
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

/** The records a rule card points at, its derivations and its examples (a general rule's companies' terms): they travel with the card, so its chips open. */
export function pointedIds(rule: Pick<RuleRecord, "derived_from" | "examples">): string[] {
  return [...(rule.derived_from ?? []), ...(rule.examples ?? [])];
}

/** Records by id from bundles' lists (a bundle's `pointed`), for `ProvenanceData.pointed` on a page built from bundles. */
export function recordsById(...lists: (readonly RuleRecord[] | undefined)[]): Record<string, RuleRecord> {
  return Object.fromEntries(lists.flatMap((l) => l ?? []).map((r) => [r.id, r]));
}
