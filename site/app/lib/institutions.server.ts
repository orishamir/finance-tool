// Banks and brokers in the catalogue (flows 32, 33; design-spec 20): the institutions the fee snapshots and the
// deposit records name, one page each. Server-only. Every number keeps its value object and its source; nothing is
// computed here but the stale flag (D3: a snapshot older than three months, until the schema holds its own rule).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { feesSnapshot, institutionsTable, type DepositTerms, type FeeLine, type FeesSnapshot, type InstitutionRegistryRow, type RuleRecord, type ValueObject } from "@finance-tool/schema";
import type {
  InstitutionKind,
  InstitutionPageData,
  InstitutionRow,
  LineBase,
  ProductGroup,
  ProductRowData,
  TariffCardData,
  TariffLineRow,
} from "../components/decoder/institutions/types";
import { loadChecklistRows, loadRules, loadWrappers, root, today } from "./data.server";
import { topicName } from "../copy";
import { loadCatalog, loadDepositTerms, seenValue, seenWhere } from "./instruments.server";
import { shortName } from "./providers";
import { ownBy, type SiteValue } from "./value";
import { fileRank } from "./rule-shelves";
import { noPageAnchor, type CompanyLink } from "./scope";

/** The cadence until `docs/data-schema.md` §3.6 writes `staleTariff` (flow 33 data note): 90 days. */
const staleDays = 90;

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to + "T00:00:00Z") - Date.parse(from + "T00:00:00Z")) / 86_400_000);
}

const isStale = (snapshot: string, t: string) => daysBetween(snapshot, t) > staleDays;

/** Of the dated files of one provider (`<id>@<date>.json`), the newest. */
export function latestSnapshots(): FeesSnapshot[] {
  const dir = join(root, "data/fees");
  if (!existsSync(dir)) return [];
  const best = new Map<string, { date: string; record: FeesSnapshot }>();
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
    const record = feesSnapshot.parse(JSON.parse(readFileSync(join(dir, f), "utf8")));
    const date = /@(\d{4}-\d{2}-\d{2})\.json$/.exec(f)?.[1] ?? record.snapshot;
    const prev = best.get(record.id);
    if (!prev || date > prev.date) best.set(record.id, { date, record });
  }
  return [...best.values()].map((b) => b.record);
}

const collator = new Intl.Collator("he");

/** Banks and brokers only: a provident manager's snapshot stays with the manager's page (design-spec 20). */
function institutionSnapshots(): (FeesSnapshot & { kind: InstitutionKind })[] {
  return latestSnapshots()
    .filter((s) => s.provider.class === "bank" || s.provider.class === "broker")
    .map((s) => ({ ...s, kind: s.provider.class as InstitutionKind }));
}

/** Every institution page: the snapshots' providers, plus a bank that only has deposit records. */
export function institutionIds(): string[] {
  const ids = new Set(institutionSnapshots().map((s) => s.id));
  for (const d of loadDepositTerms()) ids.add(d.bank);
  return [...ids];
}

export function institutionRows(): InstitutionRow[] {
  const snaps = institutionSnapshots();
  const rows: InstitutionRow[] = snaps.map((s) => ({ id: s.id, name: s.provider.name_he, kind: s.kind, published: s.tariff.published, missing: s.missing, noSnapshot: false }));
  for (const d of loadDepositTerms()) {
    if (!rows.some((r) => r.id === d.bank)) rows.push({ id: d.bank, name: d.bank, kind: "bank", published: null, missing: true, noSnapshot: true });
  }
  return rows.sort((a, b) => collator.compare(a.name, b.name));
}

/** The company ids of the CMA data, so a slug never shadows one (the page resolves the CMA first). */
export function isInstitution(id: string): boolean {
  return institutionIds().includes(id);
}

// ---------------------------------------------------------------- the bank's 447 page, from the rule base

const rateTableLabel: Record<string, string> = {
  leumi: "Leumi",
  hapoalim: "Hapoalim",
  discount: "Discount",
  mercantile: "Mercantile",
  "mizrahi-tefahot": "Mizrahi-Tefahot",
  fibi: "First International",
  massad: "Massad",
  yahav: "Yahav",
  jerusalem: "Bank of Jerusalem",
  "one-zero": "One Zero",
};

/** The URL column of `bank-product-names.md`'s per-bank table (BPN-02): the page a bank publishes its 447 table on. */
function rateTableUrl(bank: string): string | null {
  const label = rateTableLabel[bank];
  const path = join(root, ".claude/skills/il-finance/references/bank-product-names.md");
  if (!label || !existsSync(path)) return null;
  const doc = readFileSync(path, "utf8");
  const start = doc.indexOf("## Directive-447 publication: machine-readability per bank");
  if (start < 0) return null;
  const section = doc.slice(start);
  for (const line of section.split("\n")) {
    if (!line.startsWith(`| ${label} |`)) continue;
    const cells = line.split("|").map((c) => c.trim());
    return /https?:\/\/[^\s;]+/.exec(cells[3] ?? "")?.[0] ?? null;
  }
  return null;
}

// ---------------------------------------------------------------- value objects

// D31: everything on a company's page is that company's own figure about its own product
function site(v: ValueObject, t: string, snapshot: string, owner: string): SiteValue {
  return ownBy({ ...v, stale: isStale(snapshot, t) ? { since: snapshot, cadence: "quarterly" } : null } as SiteValue, owner);
}

function dateValue(date: string, from: Pick<ValueObject, "source">, checked: string, t: string, snapshot: string, owner: string): SiteValue {
  return ownBy({
    value: date,
    unit: "text",
    source: from.source,
    checked,
    effective_from: date,
    effective_to: null,
    update_rule: "provider-set",
    state: "sourced",
    stale: isStale(snapshot, t) ? { since: snapshot, cadence: "quarterly" } : null,
    notes: "",
  } as SiteValue, owner);
}

function textValue(value: string, from: { source: ValueObject["source"]; checked: string }, notes: string, owner: string): SiteValue {
  return ownBy({ value, unit: "text", source: from.source, checked: from.checked, effective_from: null, effective_to: null, update_rule: "provider-set", state: "sourced", notes } as SiteValue, owner);
}

// ---------------------------------------------------------------- deposits

const wrapperOrder = ["bank-deposit", "savings-plan", "current-account"];

function productRow(d: DepositTerms, t: string): ProductRowData {
  const names447 = d.names["447"];
  const model = names447.map((n) => /דגם:\s*([\d/]+)/.exec(n)?.[1]).find(Boolean) ?? null;
  const name = names447[0] ?? d.type_447;
  const also: string[] = [];
  for (const n of [...names447.slice(1), ...d.names.app, ...d.names.ad, ...d.names.abbrev]) {
    if (/^דגם:/.test(n) || n === name || also.includes(n)) continue;
    also.push(n);
  }
  const current = d.wrapper_id === "current-account";
  const asOfDate = d.rate_offered.effective_from;
  const stale = isStale(d.snapshot, t);
  const owner = shortName(d.bank, d.bank);
  const mark = (v: ValueObject) => site(v, t, d.snapshot, owner);
  return {
    id: d.id,
    name,
    model,
    alsoCalled: also,
    type447: d.type_447,
    wrapperId: d.wrapper_id,
    currentAccount: current,
    term: mark(d.term_months),
    rateType: d.rate_type,
    anchor: d.anchor ?? null,
    spread: d.spread ? mark(d.spread) : null,
    rate: mark(d.rate_offered),
    asOf: dateValue(asOfDate ?? d.snapshot, d.rate_offered, d.rate_offered.checked, t, d.snapshot, owner),
    asOfAfterRead: !!asOfDate && asOfDate > d.rate_offered.checked,
    linkage: d.linkage,
    linkageValue: textValue(d.linkage, { source: d.source, checked: d.snapshot }, `linkage "${d.linkage}" as the record holds it`, owner),
    taxBucket: mark(d.tax_bucket),
    amountMin: mark(d.amount_range.min),
    amountMax: d.amount_range.max ? mark(d.amount_range.max) : null,
    breakTerms: { penalty: d.break.penalty, text: d.break.mechanism_text, rules: d.break.rule_ids },
    exitPoints: { exists: d.exit_points.exists, everyMonths: d.exit_points.every_months },
    autoRenew: { value: d.auto_renew.value, maxRenewals: d.auto_renew.max_renewals },
    rateNote: d.rate_offered.notes ?? "",
    stale,
    snapshot: d.snapshot,
  };
}

// ---------------------------------------------------------------- the tariff

const tasePapers = ["tase_shares_bonds", "etf_units"];
const custodyPapers = [...tasePapers, "foreign_securities"];

function lineRow(l: FeeLine, t: string, snapshot: string, owner: string): TariffLineRow {
  return {
    id: l.id,
    base: l.base as LineBase,
    classes: l.applies_to,
    channel: l.channel === "direct" || l.channel === "branch" ? l.channel : null,
    rate: site(l.rate, t, snapshot, owner),
    period: l.period,
    min: l.min ? site(l.min, t, snapshot, owner) : null,
    max: l.max ? site(l.max, t, snapshot, owner) : null,
  };
}

function tariffCard(s: FeesSnapshot, rules: Record<string, RuleRecord>, t: string): TariffCardData {
  const from = { source: { url: s.tariff.url, title: s.tariff.title, publisher: s.provider.name_he, strength: "institution" as const } };
  const stale = isStale(s.snapshot, t);
  const lines: TariffLineRow[] = [];
  for (const l of s.lines) {
    if (l.level !== "list") continue;
    const covers = (papers: string[]) => l.applies_to.some((a) => papers.includes(a));
    if (l.base === "trade" && covers(tasePapers)) lines.push(lineRow(l, t, s.snapshot, s.provider.name_he));
    else if (l.base === "custody" && covers(custodyPapers)) lines.push(lineRow(l, t, s.snapshot, s.provider.name_he));
    else if (l.base === "fx") lines.push(lineRow(l, t, s.snapshot, s.provider.name_he));
  }
  const bases = [...new Set(s.lines.map((l) => l.base as string))];
  const min = s.minimums.account_opening;
  return {
    missing: s.missing,
    reason: s.missing_reason,
    title: s.tariff.title,
    url: s.tariff.url,
    format: s.tariff.format,
    published: s.tariff.published ? dateValue(s.tariff.published, from, s.snapshot, t, s.snapshot, s.provider.name_he) : null,
    snapshot: dateValue(s.snapshot, from, s.snapshot, t, s.snapshot, s.provider.name_he),
    stale,
    lineCount: s.lines.length,
    bases,
    lines,
    minimum: min ? site(min, t, s.snapshot, s.provider.name_he) : null,
    regulator: s.provider.regulator,
    ...(s.provider.regulator_foreign ? { foreignRegulator: s.provider.regulator_foreign.name_he } : {}),
    tase: s.provider.tase_member,
    protection: s.provider.protection_rule_ids.filter((id) => rules[id]).map((id) => ({ id, title: rules[id]!.title_he ?? rules[id]!.title })),
    notice: s.notice_rule_ids.filter((id) => rules[id]),
    providerName: s.provider.name_he,
  };
}

// ---------------------------------------------------------------- the page

export function buildInstitution(id: string): InstitutionPageData | null {
  const t = today();
  const snap = institutionSnapshots().find((s) => s.id === id);
  const deposits = loadDepositTerms().filter((d) => d.bank === id);
  if (!snap && deposits.length === 0) return null;
  const allRules = loadRules();
  const wrappers = loadWrappers();
  const rows = deposits.map((d) => productRow(d, t));
  const groups: ProductGroup[] = wrapperOrder
    .map((w) => ({ wrapperId: w, wrapperName: wrappers.find((x) => x.id === w)?.names.he[0] ?? w, products: rows.filter((r) => r.wrapperId === w).sort((a, b) => collator.compare(a.name, b.name)) }))
    .filter((g) => g.products.length > 0);
  const latest = [...deposits].sort((a, b) => ((a.rate_offered.effective_from ?? a.snapshot) < (b.rate_offered.effective_from ?? b.snapshot) ? 1 : -1))[0];
  const tariff = snap ? tariffCard(snap, allRules, t) : null;
  const catalogue = loadCatalog()
    .filter((c) => c.institution === id)
    .map((c) => ({ id: c.id, names: c.names.he, where: seenWhere(c), seen: seenValue(c) }));

  // the rules the page can open: the records that exist (a rule with no record is never cited)
  const cited = new Set<string>(["BANK-13", "BANK-06", "TXI-03", "TXI-04", "BRK-20", "BRK-21", "BRK-16", "BANK-27"]);
  for (const d of deposits) {
    for (const v of [d.term_months, d.rate_offered, d.tax_bucket, d.amount_range.min, d.amount_range.max]) for (const r of v?.rule_ids ?? []) cited.add(r);
    for (const r of d.break.rule_ids) cited.add(r);
  }
  if (snap) {
    for (const r of [...snap.provider.protection_rule_ids, ...snap.notice_rule_ids]) cited.add(r);
    for (const l of snap.lines) for (const r of l.rate.rule_ids ?? []) cited.add(r);
  }
  const rules = Object.fromEntries([...cited].filter((r) => allRules[r]).map((r) => [r, allRules[r]!]));
  // what the site found in the company's own documents (D30): the records that name it, by topic; their cards open from the same data
  const registryIds = registryIdsOfPage(id);
  const termGroups = companyTermGroups(registryIds, allRules, topicName);
  for (const rid of termGroups.flatMap((g) => g.ids)) {
    rules[rid] = allRules[rid]!;
    for (const d of (allRules[rid] as { derived_from?: string[] }).derived_from ?? []) if (allRules[d]) rules[d] = allRules[d]!;
  }

  return {
    id,
    name: snap?.provider.name_he ?? id,
    kind: snap?.kind ?? "bank",
    today: t,
    tariff,
    groups,
    hasDeposits: deposits.length > 0,
    depositsAsOf: groups.length ? rows.find((r) => r.id === latest?.id)?.asOf ?? null : null,
    rateTable: (() => {
      const href = rateTableUrl(id);
      return href ? { href } : null;
    })(),
    catalogue,
    rules,
    terms: { groups: termGroups, company: registryIds[0] ?? null, name: loadInstitutionRegistry().find((r) => r.id === registryIds[0])?.name_he ?? snap?.provider.name_he ?? id, dimensions: termGroups.length ? Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])) : {} },
  };
}

// ---------------------------------------------------------------- the search index

export interface InstitutionSearchEntry {
  name: string;
  line: string;
  href: string;
  extra?: string;
}

/** Bank and broker names, and the names every deposit record carries (447, app, ad, abbreviation). */
export function institutionSearchEntries(words: { bank: string; broker: string }): InstitutionSearchEntry[] {
  const out: InstitutionSearchEntry[] = [];
  const names = new Map<string, string>(institutionRows().map((r) => [r.id, r.name]));
  for (const r of institutionRows()) out.push({ name: r.name, line: r.kind === "bank" ? words.bank : words.broker, href: `/companies/${r.id}`, extra: r.id });
  const wrappers = loadWrappers();
  for (const d of loadDepositTerms()) {
    const wrapper = wrappers.find((w) => w.id === d.wrapper_id)?.names.he[0] ?? "";
    const line = [names.get(d.bank) ?? d.bank, wrapper].filter(Boolean).join(" · ");
    const seen = new Set<string>();
    for (const n of [...d.names["447"], ...d.names.app, ...d.names.ad, ...d.names.abbrev]) {
      if (seen.has(n)) continue;
      seen.add(n);
      out.push({ name: n, line, href: `/companies/${d.bank}#product-${d.id}` });
    }
  }
  return out;
}

// ---------------------------------------------------------------- who a rule applies to (D30, spec 2026-10-25-rules-scope §4)

/** data/sources/institutions.json: every company a rule's scope can name (spec §3). */
export function loadInstitutionRegistry(): InstitutionRegistryRow[] {
  return institutionsTable.parse(JSON.parse(readFileSync(join(root, "data/sources/institutions.json"), "utf8")));
}

/**
 * Every company's link, for every page's sheets (the root loader): a managing company's page by its CMA id, a bank's or broker's by
 * its snapshot or deposit id, else its group on /companies (a company with no page of its own here).
 */
export function companyLinks(): Record<string, CompanyLink> {
  const cmaIds = new Set(loadCmaCompanyIds());
  const pages = new Set(institutionIds());
  const out: Record<string, CompanyLink> = {};
  for (const r of loadInstitutionRegistry()) {
    const page = r.cma_legal_id && cmaIds.has(r.cma_legal_id) ? r.cma_legal_id : r.fees_id && pages.has(r.fees_id) ? r.fees_id : r.deposit_bank_id && pages.has(r.deposit_bank_id) ? r.deposit_bank_id : null;
    out[r.id] = page ? { name: r.name_he, href: `/companies/${page}`, hasPage: true } : { name: r.name_he, href: `/companies#${noPageAnchor(r.id)}`, hasPage: false };
  }
  return out;
}

function loadCmaCompanyIds(): string[] {
  const ids = new Set<string>();
  for (const f of readdirSync(join(root, "data/cma")).filter((x) => x.endsWith(".json"))) {
    const d = JSON.parse(readFileSync(join(root, "data/cma", f), "utf8")) as { funds: { managing_corporation: { legal_id: string } }[] };
    for (const fund of d.funds) ids.add(fund.managing_corporation.legal_id);
  }
  return [...ids];
}

/** The registry ids a company page stands for: the rows whose CMA id, snapshot id or deposit id is the page's id. */
export function registryIdsOfPage(pageId: string): string[] {
  return loadInstitutionRegistry()
    .filter((r) => r.cma_legal_id === pageId || r.fees_id === pageId || r.deposit_bank_id === pageId)
    .map((r) => r.id);
}

export interface CompanyTermGroup {
  /** The topic's key (the rule-base file) and its Hebrew name. */
  key: string;
  title: string;
  ids: string[];
}

/** Records that are not general and name one of these companies, grouped by topic in the rules pages' order (spec §4: "grouped by product"). */
export function companyTermGroups(registryIds: readonly string[], rules: Record<string, RuleRecord>, topic: (file: string) => string): CompanyTermGroup[] {
  const want = new Set(registryIds);
  const mine = Object.values(rules).filter((r) => r.scope !== "general" && (r.scope_institutions ?? []).some((i) => want.has(i.id)));
  return groupByTopic(mine, topic);
}

function groupByTopic(list: RuleRecord[], topic: (file: string) => string): CompanyTermGroup[] {
  const files = [...new Set(list.map((r) => r.il_finance_file))].sort((a, b) => fileRank(a) - fileRank(b));
  return files.map((f) => ({
    key: f,
    title: topic(f),
    ids: list
      .filter((r) => r.il_finance_file === f)
      .map((r) => r.id)
      .sort((a, b) => a.localeCompare(b, "en", { numeric: true })),
  }));
}

/** /companies: the companies that have no page of their own and whose terms the site holds, each with its records; then the records that name no company. */
export function noPageCompanyTerms(rules: Record<string, RuleRecord>): { companies: { id: string; name: string; ids: string[] }[]; none: string[] } {
  const links = companyLinks();
  const nonGeneral = Object.values(rules).filter((r) => r.scope !== "general");
  const companies = loadInstitutionRegistry()
    .filter((r) => !links[r.id]?.hasPage)
    .map((r) => ({ id: r.id, name: r.name_he, ids: nonGeneral.filter((x) => (x.scope_institutions ?? []).some((i) => i.id === r.id)).map((x) => x.id).sort((a, b) => a.localeCompare(b, "en", { numeric: true })) }))
    .filter((c) => c.ids.length > 0)
    .sort((a, b) => collator.compare(a.name, b.name));
  const none = nonGeneral.filter((r) => (r.scope_institutions ?? []).length === 0).map((r) => r.id).sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  return { companies, none };
}
