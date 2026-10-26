// Who a rule applies to (D30; research/specs/2026-10-25-rules-scope/spec.md §3): reading the `- Scope:` line of a rule-base block,
// resolving the company names it writes against data/sources/institutions.json, and the validator's scope checks. The extraction
// (scripts/extract-sources.ts) writes what `scopeFromLine` returns; the validator re-reads the line and fails a record that drifted.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { generalSourceKinds, notRules, ownContextExposures, type InstitutionRegistryRow, type RuleScope, type ScopeInstitution } from "@finance-tool/schema";
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
  sources?: { kind: string; strength: string }[];
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
 *  - the questions page rows and the "שווה לדעת" blocks (P-09) hold a rule that is not general;
 *  - a wrapper record cites a rule that is not general, or holds a value whose source is one company's document; its `company_terms`
 *    (a property each company sets) name records that are not general and carry that dimension;
 *  - an exposure record cites a rule that is not general, other than its index provider's own (D31).
 * The records the rule base keeps that are not rules (`notRules`) are skipped by the last three, by name. Warns: a general rule with no
 * source to check; a glossary term that cites a rule that is not general (the term card shows only the general ones).
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
    if (rule.scope === "general") {
      const first = rule.sources?.[0];
      if (!first) warn("general rule with no source to check", rule.id);
      else if (first.kind === "institution_doc" || first.strength === "institution") report(file, `scope: a general rule's first source is a company's document (${first.kind}, ${first.strength}); cite the law or regulator first, or the scope is not general`);
      else if (!generalSourceKinds.has(first.kind) && !(first.strength === "primary" || first.strength === "primary-mirror")) report(file, `scope: a general rule's first source is ${first.kind} (${first.strength}), not a general source (law, regulation, circular, regulator page, official PDF, exchange rule, dataset, or another official text: a ruling, a government form)`);
    }
  }

  const isGeneral = (id: string) => rules.get(id)?.scope === "general";
  const named = (id: string) => Object.hasOwn(notRules, id);
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
    for (const [dim, ids] of Object.entries((rec as { company_terms?: Record<string, string[]> } | undefined)?.company_terms ?? {})) {
      for (const id of ids) {
        const r = rules.get(id) as (ScopedRule & { dimensions?: string[] }) | undefined;
        if (!r) report(file, `company_terms.${dim}: ${id} has no record under data/rules/`);
        else if (r.scope === "general") report(file, `company_terms.${dim}: ${id} is general; cite it in rule_ids, company_terms holds companies' own terms`);
        else if (!(r.dimensions ?? []).includes(dim)) report(file, `company_terms.${dim}: ${id} does not carry the dimension ${dim}`);
      }
    }
    for (const { id, path } of ruleIdsWithPaths(rec)) if (rules.has(id) && !isGeneral(id) && !named(id)) report(file, `${path}: a wrapper is a product context and cites general rules only; ${id} is ${scopeWord(id)} (D30)`);
    for (const { path, value } of valueObjects(rec)) if (value.source?.strength === "institution") report(file, `${path}: a product field holds a value whose source is a company's document ("${value.source.title ?? ""}"); a company's term belongs on its page (D30)`);
  }

  // ---- exposures: the index page may cite its own index provider (D31)
  for (const file of listJson(join(dataDir, "instruments/exposures"))) {
    const rec = readJson(file) as { id?: string } | undefined;
    const own = new Set(ownContextExposures[rec?.id ?? ""] ?? []);
    for (const { id, path } of ruleIdsWithPaths(rec)) {
      const r = rules.get(id);
      if (!r || isGeneral(id) || named(id)) continue;
      const ownOnly = (r.scope_institutions ?? []).length > 0 && (r.scope_institutions ?? []).every((i) => own.has(i.id));
      if (!ownOnly) report(file, `${path}: an exposure page cites general rules only, and its index provider's own; ${id} is ${scopeWord(id)} (D30, D31)`);
    }
  }

  // ---- glossary terms (a warning: the term card shows only the general rules)
  for (const file of listJson(join(dataDir, "terms"))) {
    if (relative(dataDir, file).split(/[\\/]/)[1] === "deposits") continue;
    for (const { id } of ruleIdsWithPaths(readJson(file))) if (rules.has(id) && !isGeneral(id)) warn("glossary term cites a rule that is not general (its card leaves it out)", id);
  }
  return counts;
}
