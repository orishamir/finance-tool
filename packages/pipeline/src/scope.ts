// Who a rule applies to (D30; research/specs/2026-10-25-rules-scope/spec.md §3): reading the `- Scope:` line of a rule-base block,
// resolving the company names it writes against data/sources/institutions.json, and the validator's scope checks. The extraction
// (scripts/extract-sources.ts) writes what `scopeFromLine` returns; the validator re-reads the line and fails a record that drifted.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { companyTermRule, generalSourceKinds, listedAt, notRuleAllowedIn, notRules, ownContextExposures, ownDocumentCompanies, type CompanyTermRef, type InstitutionRegistryRow, type RuleScope, type ScopeInstitution } from "@finance-tool/schema";
import type { RuleBaseIds } from "./references.ts";

export interface ScopeFields {
  scope: RuleScope;
  scope_institutions?: ScopeInstitution[];
  scope_settle?: string;
}

/** The text after `- Scope:` in a block, or undefined when the block has none. */
export function scopeLineOf(body: string): string | undefined {
  const line = body.split("\n").find((l) => /^- Scope:/.test(l.trim()));
  return line?.trim().replace(/^- Scope:\s*/, "").trim();
}

/** Splits a list of names written "A, B, C". */
const splitNames = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

/**
 * The company a name means for one record: the registry row that lists the name with this record in `only_records`, else the one
 * row that lists it with no `only_records` (the default). Undefined when no row has it, or when two defaults share it.
 */
export function resolveInstitution(name: string, ruleId: string, registry: readonly InstitutionRegistryRow[]): InstitutionRegistryRow | undefined {
  const rows = registry.filter((r) => r.scope_names.some((n) => n.name === name));
  const special = rows.filter((r) => r.scope_names.some((n) => n.name === name && n.only_records?.includes(ruleId)));
  if (special.length === 1) return special[0];
  const defaults = rows.filter((r) => r.scope_names.some((n) => n.name === name && !n.only_records));
  return defaults.length === 1 ? defaults[0] : undefined;
}

/**
 * Reads one Scope line (the three forms of settle-brief.md): `general`; `institution: <names>`; `unsettled: <what would settle it>`
 * with an optional `; seen at: <names>` (also written `unsettled; seen at: ...`). Returns the fields, or the problems that stop it.
 */
export function scopeFromLine(line: string, ruleId: string, registry: readonly InstitutionRegistryRow[]): { fields?: ScopeFields; problems: string[] } {
  const problems: string[] = [];
  const resolve = (names: string[]): ScopeInstitution[] => {
    const out: ScopeInstitution[] = [];
    for (const n of names) {
      const row = resolveInstitution(n, ruleId, registry);
      if (!row) problems.push(`Scope line names "${n}", which no row of data/sources/institutions.json resolves for ${ruleId}`);
      else if (!out.some((o) => o.id === row.id)) out.push({ id: row.id, name_he: row.name_he });
    }
    return out;
  };
  if (line === "general") return { fields: { scope: "general" }, problems };
  const inst = /^institution:\s*(.+)$/.exec(line);
  if (inst) {
    const list = resolve(splitNames(inst[1]!));
    if (problems.length > 0) return { problems };
    if (list.length === 0) return { problems: [`Scope line "${line}" names no company`] };
    return { fields: { scope: "institution", scope_institutions: list }, problems };
  }
  const uns = /^unsettled(?::\s*(.*?))?(?:;\s*seen at:\s*(.+))?$/.exec(line);
  if (uns) {
    const settle = (uns[1] ?? "").trim();
    const seen = uns[2] ? resolve(splitNames(uns[2])) : [];
    if (problems.length > 0) return { problems };
    if (!settle) return { problems: [`Scope line "${line}" says unsettled but not what would settle it`] };
    return { fields: { scope: "unsettled", scope_settle: settle, ...(seen.length > 0 ? { scope_institutions: seen } : {}) }, problems };
  }
  return { problems: [`Scope line "${line}" is none of the three forms (general; institution: <names>; unsettled: <what would settle it>[; seen at: <names>])`] };
}

/** data/sources/institutions.json, or an empty list when it is absent (hand-built test folders). */
export function readRegistry(dataDir: string): InstitutionRegistryRow[] {
  const path = join(dataDir, "sources/institutions.json");
  return existsSync(path) ? (JSON.parse(readFileSync(path, "utf8")) as InstitutionRegistryRow[]) : [];
}

// ---------------------------------------------------------------- the validator's checks

interface ScopedRule {
  id: string;
  scope?: string;
  scope_institutions?: { id: string; name_he: string }[];
  scope_settle?: string;
  sources?: { url: string; title: string; title_he?: string; kind: string; strength: string }[];
  derived_from?: string[];
  examples?: string[];
}

type Report = (file: string, message: string) => void;

function listJson(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? listJson(join(dir, e.name)) : e.name.endsWith(".json") ? [join(dir, e.name)] : []));
}

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return undefined;
  }
}

/** Every rule id under a `rule_ids` key, with the JSON path where it sits. */
function ruleIdsWithPaths(node: unknown, path = ""): { id: string; path: string }[] {
  if (Array.isArray(node)) return node.flatMap((n, i) => ruleIdsWithPaths(n, `${path}[${i}]`));
  if (node === null || typeof node !== "object") return [];
  return Object.entries(node).flatMap(([k, v]) => {
    const here = path ? `${path}.${k}` : k;
    if (k === "rule_ids" && Array.isArray(v)) return v.filter((x): x is string => typeof x === "string").map((id) => ({ id, path: here }));
    return ruleIdsWithPaths(v, here);
  });
}

/** Every value object (an object with `source` and `unit`), with its JSON path. */
function valueObjects(node: unknown, path = ""): { path: string; value: { source?: { strength?: string; title?: string } } }[] {
  if (Array.isArray(node)) return node.flatMap((n, i) => valueObjects(n, `${path}[${i}]`));
  if (node === null || typeof node !== "object") return [];
  const o = node as Record<string, unknown>;
  const here = "source" in o && "unit" in o ? [{ path: path || "(root)", value: o as { source?: { strength?: string; title?: string } } }] : [];
  return [...here, ...Object.entries(o).flatMap(([k, v]) => valueObjects(v, path ? `${path}.${k}` : k))];
}

export interface ScopeCounts {
  general: number;
  institution: number;
  unsettled: number;
}

/**
 * The scope checks (spec §3), run by `validateData` after the per-file schema checks. Fails:
 *  - the registry: a duplicate id, a name two rows both claim as default, a CMA id, fee snapshot or deposit bank that does not exist;
 *  - a rule's scope differs from its rule-base Scope line (the extraction was not re-run), or the line does not resolve;
 *  - an `institution` or `unsettled` rule names a company the registry does not have, or under another Hebrew name;
 *  - a `general` rule's first source is a company's document (kind `institution_doc` or strength `institution`), or is neither a general
 *    kind (law, regulation, circular, regulator page, official PDF, exchange rule, dataset) nor another official text of strength
 *    primary or primary-mirror (a court ruling, a government form, a foreign regulator's page: kinds `other` and `form`);
 *  - a `general` rule derives from (`derived_from`) a rule that is not general, or names as an example (`examples`) one that is
 *    (review, 2026-10-26: a company's term a general rule's Source line mentions is an example, never a derivation);
 *  - a record that is not general, and not a not-rule, cites no own document of any company it names (the registry's `own_hosts` and
 *    `filing_names`): a company's section lists only records from that company's own documents, so it would be listed nowhere;
 *  - the questions page rows and the "שווה לדעת" blocks (P-09) hold a rule that is not general;
 *  - a wrapper record cites a rule that is not general, or holds a value whose source is one company's document; its `company_terms`
 *    (a property each company sets) name records that are not general and carry that dimension, an entry whose record names several
 *    companies says which (`{ rule, companies }`: those whose own term on the property the record states), and an entry's
 *    `companies` are companies whose section lists the record;
 *  - an exposure record cites a rule that is not general, other than the records `ownContextExposures` names for it (D31), each the
 *    index provider's own.
 * A record the rule base keeps that is not a rule (`notRules`) and is not general is cited only in the files its entry names: every
 * `rule_ids` under data/ (but data/rules and data/sources) is read, and a data file the entry names must exist and still cite it (the
 * list only shrinks; the site test checks the site files the same way). Warns: a general rule with no source to check; a glossary
 * term that cites a rule that is not general (the term card shows only the general ones).
 */
export function checkScope(ctx: { dataDir: string; ruleBase: RuleBaseIds }, rules: Map<string, ScopedRule>, report: Report, warn: (category: string, id: string) => void): ScopeCounts {
  const dataDir = ctx.dataDir;
  const registryPath = join(dataDir, "sources/institutions.json");
  const registry = readRegistry(dataDir);
  const counts: ScopeCounts = { general: 0, institution: 0, unsettled: 0 };

  // ---- the registry
  if (registry.length > 0) {
    const seen = new Set<string>();
    for (const r of registry) {
      if (seen.has(r.id)) report(registryPath, `institutions: id ${r.id} appears twice`);
      seen.add(r.id);
    }
    const defaults = new Map<string, string[]>();
    for (const r of registry) for (const n of r.scope_names) if (!n.only_records) defaults.set(n.name, [...(defaults.get(n.name) ?? []), r.id]);
    for (const [name, ids] of defaults) if (ids.length > 1) report(registryPath, `institutions: the name "${name}" is the default of ${ids.join(" and ")}; give all but one only_records`);
    const cma = new Set<string>();
    for (const f of listJson(join(dataDir, "cma"))) for (const fund of ((readJson(f) as { funds?: { managing_corporation?: { legal_id?: string } }[] } | undefined)?.funds ?? [])) if (fund.managing_corporation?.legal_id) cma.add(fund.managing_corporation.legal_id);
    const fees = new Set(listJson(join(dataDir, "fees")).map((f) => (readJson(f) as { id?: string } | undefined)?.id).filter((x): x is string => !!x));
    const banks = new Set(listJson(join(dataDir, "terms/deposits")).map((f) => (readJson(f) as { bank?: string } | undefined)?.bank).filter((x): x is string => !!x));
    for (const r of registry) {
      if (r.cma_legal_id && cma.size > 0 && !cma.has(r.cma_legal_id)) report(registryPath, `institutions: ${r.id}: cma_legal_id ${r.cma_legal_id} is not a managing company in data/cma/`);
      if (r.fees_id && !fees.has(r.fees_id)) report(registryPath, `institutions: ${r.id}: fees_id ${r.fees_id} has no snapshot under data/fees/`);
      if (r.deposit_bank_id && !banks.has(r.deposit_bank_id)) report(registryPath, `institutions: ${r.id}: deposit_bank_id ${r.deposit_bank_id} has no record under data/terms/deposits/`);
    }
  }
  const byId = new Map(registry.map((r) => [r.id, r]));

  // ---- each rule
  const ruleFile = (id: string) => join(dataDir, "rules", `${id.toLowerCase()}.json`);
  for (const rule of rules.values()) {
    if (!rule.scope) continue; // the schema reports a missing scope
    if (rule.scope === "general" || rule.scope === "institution" || rule.scope === "unsettled") counts[rule.scope]++;
    const file = ruleFile(rule.id);
    const block = ctx.ruleBase.blocks?.get(rule.id);
    const line = block ? scopeLineOf(block.body) : undefined;
    if (block && line === undefined) report(file, `scope: the rule base block of ${rule.id} has no Scope line`);
    if (line !== undefined && registry.length > 0) {
      const { fields, problems } = scopeFromLine(line, rule.id, registry);
      problems.forEach((p) => report(file, `scope: ${p}`));
      if (fields) {
        const want = JSON.stringify([fields.scope, fields.scope_institutions ?? null, fields.scope_settle ?? null]);
        const have = JSON.stringify([rule.scope, rule.scope_institutions ?? null, rule.scope_settle ?? null]);
        if (want !== have) report(file, `scope: differs from the rule base's Scope line ("${line}"); run npm run extract:sources -w @finance-tool/pipeline`);
      }
    }
    for (const inst of rule.scope_institutions ?? []) {
      const row = byId.get(inst.id);
      if (registry.length > 0 && !row) report(file, `scope_institutions: ${inst.id} is not in data/sources/institutions.json`);
      else if (row && row.name_he !== inst.name_he) report(file, `scope_institutions: ${inst.id} is "${row.name_he}" in the registry, not "${inst.name_he}"`);
    }
    if (rule.scope !== "general" && !Object.hasOwn(notRules, rule.id) && registry.length > 0 && listedAt({ id: rule.id, scope: rule.scope }, ownDocumentCompanies(rule, byId)).length === 0) {
      const names = (rule.scope_institutions ?? []).map((i) => i.id).join(", ") || "no company";
      report(file, `scope: ${rule.id} is ${rule.scope} (${names}) but cites no own document of a company it names; a company's section lists only records from that company's own documents (add the company's site to own_hosts, or its filing names to filing_names, in data/sources/institutions.json)`);
    }
    if (rule.scope === "general") {
      for (const d of rule.derived_from ?? []) if (rules.has(d) && rules.get(d)!.scope !== "general") report(file, `derived_from: a general rule derives from general rules only; ${d} is ${rules.get(d)!.scope} (a company's term it mentions is an example: re-run npm run extract:sources -w @finance-tool/pipeline)`);
      for (const d of rule.examples ?? []) if (rules.has(d) && rules.get(d)!.scope === "general") report(file, `examples: ${d} is general; a general rule it points to belongs in derived_from`);
      const first = rule.sources?.[0];
      if (!first) warn("general rule with no source to check", rule.id);
      else if (first.kind === "institution_doc" || first.strength === "institution") report(file, `scope: a general rule's first source is a company's document (${first.kind}, ${first.strength}); cite the law or regulator first, or the scope is not general`);
      else if (!generalSourceKinds.has(first.kind) && !(first.strength === "primary" || first.strength === "primary-mirror")) report(file, `scope: a general rule's first source is ${first.kind} (${first.strength}), not a general source (law, regulation, circular, regulator page, official PDF, exchange rule, dataset, or another official text: a ruling, a government form)`);
    }
  }

  const isGeneral = (id: string) => rules.get(id)?.scope === "general";
  /** The file's path as the not-rules allowance writes it ("data/instruments/wrappers/x.json"), whatever folder the data sits in. */
  const repoPath = (file: string) => `data/${relative(dataDir, file).split(/[\\/]/).join("/")}`;
  /** A not-rule that is not general: its citations are held to the files its entry names. */
  const trackedNotRule = (id: string) => Object.hasOwn(notRules, id) && rules.has(id) && !isGeneral(id);
  const scopeWord = (id: string) => {
    const r = rules.get(id);
    if (!r) return "no record";
    const who = (r.scope_institutions ?? []).map((i) => i.id).join(", ");
    return who ? `${r.scope}: ${who}` : `${r.scope}`;
  };

  // ---- P-09: the questions page and "שווה לדעת"
  const pinnedPath = join(dataDir, "parameters/pinned-rules.json");
  const pinned = existsSync(pinnedPath) ? (readJson(pinnedPath) as { rows?: { ids?: string[] }[]; guide_blocks?: Record<string, string[]> } | undefined) : undefined;
  for (const row of pinned?.rows ?? []) for (const id of row.ids ?? []) if (rules.has(id) && !isGeneral(id)) report(pinnedPath, `pinned-rules: the questions page holds general rules only; ${id} is ${scopeWord(id)}`);
  for (const [w, ids] of Object.entries(pinned?.guide_blocks ?? {})) for (const id of ids) if (rules.has(id) && !isGeneral(id)) report(pinnedPath, `pinned-rules: "שווה לדעת" of ${w} holds general rules only; ${id} is ${scopeWord(id)}`);

  // ---- wrappers: a product field never holds a company's term
  for (const file of listJson(join(dataDir, "instruments/wrappers"))) {
    const rec = readJson(file);
    // where a property is each company's own, the record names the companies' records: those must be company terms that carry it
    for (const [dim, refs] of Object.entries((rec as { company_terms?: Record<string, CompanyTermRef[]> } | undefined)?.company_terms ?? {})) {
      for (const ref of refs) {
        const id = companyTermRule(ref);
        const r = rules.get(id) as (ScopedRule & { dimensions?: string[] }) | undefined;
        if (!r) report(file, `company_terms.${dim}: ${id} has no record under data/rules/`);
        else if (r.scope === "general") report(file, `company_terms.${dim}: ${id} is general; cite it in rule_ids, company_terms holds companies' own terms`);
        else if (!(r.dimensions ?? []).includes(dim)) report(file, `company_terms.${dim}: ${id} does not carry the dimension ${dim}`);
        // a record that names several companies rarely states the property for all of them: the entry names those it does (review, 2026-10-26)
        else if (typeof ref === "string" && (r.scope_institutions ?? []).length > 1) report(file, `company_terms.${dim}: ${id} names ${(r.scope_institutions ?? []).length} companies; write { "rule": "${id}", "companies": [...] } with only those whose own term on ${dim} the record states`);
        else if (typeof ref !== "string" && registry.length > 0) {
          // the companies an entry names are among those whose section lists the record (their own documents say it)
          const listed = new Set(listedAt({ id: r.id, scope: r.scope ?? "" }, ownDocumentCompanies(r, byId)));
          for (const c of ref.companies) if (!listed.has(c)) report(file, `company_terms.${dim}: ${id} is not listed at ${c} (the record cites no document of ${c}, or names no such company)`);
        }
      }
    }
    for (const { id, path } of ruleIdsWithPaths(rec)) {
      if (rules.has(id) && !isGeneral(id) && !notRuleAllowedIn(id, repoPath(file))) report(file, `${path}: a wrapper is a product context and cites general rules only; ${id} is ${scopeWord(id)} (D30)${Object.hasOwn(notRules, id) ? "; it is a not-rule allowed only in its own files (notRules)" : ""}`);
    }
    for (const { path, value } of valueObjects(rec)) if (value.source?.strength === "institution") report(file, `${path}: a product field holds a value whose source is a company's document ("${value.source.title ?? ""}"); a company's term belongs on its page (D30)`);
  }

  // ---- exposures: the index page may cite its own index provider (D31)
  for (const file of listJson(join(dataDir, "instruments/exposures"))) {
    const rec = readJson(file) as { id?: string } | undefined;
    const own = new Set(ownContextExposures[rec?.id ?? ""] ?? []);
    for (const { id, path } of ruleIdsWithPaths(rec)) {
      const r = rules.get(id);
      if (!r || isGeneral(id) || notRuleAllowedIn(id, repoPath(file))) continue;
      if (!own.has(id)) report(file, `${path}: an exposure page cites general rules only, and the records of its index provider that ownContextExposures names; ${id} is ${scopeWord(id)} (D30, D31)`);
    }
  }
  // the index provider's records an exposure may cite are that provider's own (an index provider's terms, nobody else's)
  for (const [exposure, ids] of Object.entries(ownContextExposures)) {
    for (const id of ids) {
      const r = rules.get(id);
      const kinds = (r?.scope_institutions ?? []).map((i) => byId.get(i.id)?.kind);
      if (r && registry.length > 0 && (r.scope === "general" || kinds.length === 0 || kinds.some((k) => k !== "index-provider"))) report(registryPath, `ownContextExposures: ${exposure} may cite ${id}, which is not an index provider's own term (${scopeWord(id)})`);
    }
  }
  // ---- the not-rules: every data file that cites one is named in its entry, and every data file named still cites it (the site test
  // does the same for the site files): a new use fails, and the lists only shrink
  const notRuleCites = new Map<string, Set<string>>();
  for (const file of listJson(dataDir)) {
    const top = relative(dataDir, file).split(/[\\/]/)[0];
    if (top === "rules" || top === "sources") continue;
    for (const { id, path } of ruleIdsWithPaths(readJson(file))) {
      if (!trackedNotRule(id)) continue;
      notRuleCites.set(repoPath(file), (notRuleCites.get(repoPath(file)) ?? new Set()).add(id));
      if (!notRuleAllowedIn(id, repoPath(file))) report(file, `${path}: ${id} is a not-rule (${notRules[id]!.why}, ${scopeWord(id)}) cited in ${repoPath(file)}, which its entry in notRules (packages/schema/src/scope.ts) does not name`);
    }
  }
  for (const [id, entry] of Object.entries(notRules)) {
    if (!trackedNotRule(id)) continue;
    for (const f of entry.files.filter((x) => x.startsWith("data/"))) {
      const path = join(dataDir, f.slice("data/".length));
      if (!existsSync(path)) report(path, `notRules: ${id} names ${f}, which does not exist; remove it from its entry in packages/schema/src/scope.ts`);
      else if (!notRuleCites.get(f)?.has(id)) report(path, `notRules: ${id} no longer stands in ${f}; remove the file from its entry in packages/schema/src/scope.ts`);
    }
  }

  // ---- glossary terms (a warning: the term card shows only the general rules)
  for (const file of listJson(join(dataDir, "terms"))) {
    if (relative(dataDir, file).split(/[\\/]/)[1] === "deposits") continue;
    for (const { id } of ruleIdsWithPaths(readJson(file))) if (rules.has(id) && !isGeneral(id)) warn("glossary term cites a rule that is not general (its card leaves it out)", id);
  }
  return counts;
}
