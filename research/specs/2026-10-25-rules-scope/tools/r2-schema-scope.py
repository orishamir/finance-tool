# Rewrites the not-rules allowance and the own-context list of packages/schema/src/scope.ts into their review-2 shape
# (record id -> why and the files where it may stand; exposure id -> allowed record ids), and adds the own-document helpers.
import re
root = "/home/ori/dev/finance-tool/.claude/worktrees/wt-scope/"
path = root + "packages/schema/src/scope.ts"
src = open(path, encoding="utf-8").read()
head, rest = src.split("/**\n * Records the rule base keeps that are not rules", 1)
block = rest.split("export const notRules: Readonly<Record<string, string>> = {", 1)[1].split("};", 1)[0]
entries = re.findall(r'  "([A-Z0-9]+-[A-Z0-9]+)": ("(?:[^"\\]|\\.)*"),', block)
allowed = {
    "IRA-28": ["data/instruments/wrappers/ira-hishtalmut.json", "data/instruments/wrappers/ira-provident.json", "site/app/content/guide/ira-hishtalmut.tsx", "site/app/content/guide/ira-provident.tsx"],
    "REG-14": ["site/app/content/guide/brokerage-account.tsx"],
    "SW-34": ["data/instruments/wrappers/brokerage-account.json"],
}
lines = []
for rid, why in entries:
    files = allowed.get(rid, [])
    lines.append(f'  "{rid}": {{ why: {why}, files: [{", ".join(chr(34) + f + chr(34) for f in files)}] }},')
new_tail = '''/**
 * Records the rule base keeps that are not rules (research/knowledge/2026-10-25-scope/requests.md §4, a judgement call: listed,
 * not moved). The lead's brief of 2026-10-26: leave them where they are for now. Each names the product-context files where it may
 * stand today (a wrapper or exposure record under data/, a guide or exposure prose module under site/app/content/), so a new use
 * fails (review, 2026-10-26); a record not general that stands in none has `files: []`. Each still carries its scope, and its card
 * says it. Never listed in a company's section ("מה כתוב במסמכים של …"): a not-rule is not a company's term. The list only shrinks
 * as each one moves to `data/` or the open questions.
 */
export const notRules: Readonly<Record<string, { why: string; files: readonly string[] }>> = {
''' + "\n".join(lines) + '''
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
    return new URL(url).hostname.toLowerCase().replace(/^www\\./, "");
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
  return company.own_hosts.some((h) => host === h || host.endsWith(`.${h}`));
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
'''
out = head + new_tail
open(path, "w", encoding="utf-8").write(out)
print(len(entries), "not-rules")
