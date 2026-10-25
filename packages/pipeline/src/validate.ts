// The validator: docs/data-schema.md §4 and docs/architecture.md 3.2. A problem fails the run; a warning (rule sources, dates) is printed in
// one line per category and does not.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { z } from "zod";
import {
  catalogEntry,
  cmaPeriodFile,
  depositTerms,
  dimensionRecord,
  exposureRecord,
  feesSnapshot,
  fundListFile,
  fundRecord,
  type FundListFile,
  parameterRecord,
  ruleRecord,
  seriesRecord,
  termRecord,
  wrapperId,
  wrapperRecord,
  type SeriesRecord,
  sourcesFile,
} from "@finance-tool/schema";
import { urlInBlock, type RuleBaseIds } from "./references.ts";

/**
 * Collection folder → schema. A file in a folder with no schema yet is an error: schema first, then data.
 * Nested folders (`instruments/wrappers`) are matched on their full path first, then on the top folder.
 */
const collections: Record<string, z.ZodType> = {
  rules: ruleRecord,
  parameters: parameterRecord,
  cma: cmaPeriodFile,
  "instruments/wrappers": wrapperRecord,
  "instruments/exposures": exposureRecord,
  fees: feesSnapshot,
  funds: fundRecord,
  "fund-lists": fundListFile,
  "terms/deposits": depositTerms,
  terms: termRecord,
  dimensions: dimensionRecord,
  catalog: catalogEntry,
  series: seriesRecord,
  sources: sourcesFile,
};

export interface ValidationContext {
  dataDir: string;
  ruleBase: RuleBaseIds;
  formulas: Set<string>;
  /** Today as YYYY-MM-DD, for the date warnings; default: the system date. */
  today?: string;
  /** Receives each warning category as one line; default: console.warn. */
  warn?: (line: string) => void;
}

export interface Problem {
  file: string;
  message: string;
}

export function validateData(ctx: ValidationContext): Problem[] {
  const problems: Problem[] = [];
  const report = (file: string, message: string) => problems.push({ file: relative(ctx.dataDir, file), message });

  const files = listFiles(ctx.dataDir);
  const ruleDimensions = readRuleDimensions(files, ctx.dataDir);
  const cmaFundIds = readLatestCmaFundIds(files, ctx.dataDir);
  const fundIds = readFundIds(files, ctx.dataDir);
  const ruleRecords = readRuleRecords(files, ctx.dataDir);
  const warnings = new Map<string, string[]>();
  const warn = (category: string, id: string) => warnings.set(category, [...(warnings.get(category) ?? []), id]);

  for (const file of files) {
    const rel = relative(ctx.dataDir, file);
    if (rel === ".gitkeep") continue;

    const parts = rel.split(/[\\/]/);
    const collection = parts.length > 2 && collections[`${parts[0]}/${parts[1]}`] ? `${parts[0]}/${parts[1]}` : parts[0]!;
    const schema = collections[collection];
    if (!schema) {
      report(file, `no schema for collection "${collection}" yet; add it to packages/schema first`);
      continue;
    }
    if (!file.endsWith(".json")) {
      report(file, "data files are JSON (data-schema §1)");
      continue;
    }
    const parsed = parseJson(readFileSync(file, "utf8"));
    if (parsed.error) {
      report(file, parsed.error);
      continue;
    }
    const result = schema.safeParse(parsed.value);
    if (!result.success) report(file, formatIssues(result.error));

    for (const id of collectStrings(parsed.value, "rule_ids")) {
      if (!ctx.ruleBase.rules.has(id)) report(file, `rule_ids: ${id} is not a rule in il-finance (data-schema §4 item 2)`);
    }
    for (const key of ["blocked_by", "open_questions"]) {
      for (const id of collectStrings(parsed.value, key)) {
        if (!ctx.ruleBase.openQuestions.has(id)) report(file, `${key}: ${id} is not an open question in il-finance`);
      }
    }
    for (const id of collectStrings(parsed.value, "formula")) {
      if (/^F-\d{2}$/.test(id) && !ctx.formulas.has(id)) report(file, `formula: ${id} is not defined in docs/method.md (data-schema §4 item 6)`);
    }
    if (collection === "rules" && result.success) {
      const rec = parsed.value as RuleLike;
      for (const message of checkRuleSources(rec, ctx, ruleRecords, warn)) report(file, message);
    }
    if (collection === "series" && result.success) {
      for (const message of checkSeries(parsed.value as SeriesRecord)) report(file, message);
    }
    if (collection === "fund-lists" && result.success) {
      for (const message of checkFundList(parsed.value as FundListFile, parts[parts.length - 1]!)) report(file, message);
    }
    if (collection === "catalog" && result.success && cmaFundIds) {
      const maps = (parsed.value as { maps_to: { cma_fund_id: number | null; track_ids: number[] } }).maps_to;
      // `cma_fund_id` is the fund (קופה) number from the institution's documents and transfer_bank (CAT-09); the
      // monthly datasets list tracks only, so just `track_ids` are checked against them.
      const ids = [...maps.track_ids];
      for (const id of ids) {
        if (!cmaFundIds.has(id)) report(file, `maps_to: fund ${id} is not in the latest data/cma/ period (data-schema §4 item 10)`);
      }
    }
    if (collection === "instruments/exposures" && result.success && fundIds) {
      for (const v of (parsed.value as { variants: string[] }).variants) {
        if (v.startsWith("fund:") && !fundIds.has(v.slice("fund:".length)))
          report(file, `variants: ${v} has no record under data/funds/ (data-schema §3.4)`);
      }
    }
    if (collection === "instruments/wrappers" && result.success) {
      for (const message of checkDimensionMarks(parsed.value as Record<string, unknown>, ruleDimensions, ctx.ruleBase)) report(file, message);
    }
  }
  checkInstrumentsMap(files, ctx.dataDir, ruleDimensions, report);
  checkHoldingParameter(files, ctx.dataDir, report);
  checkPinnedRules(files, ctx.dataDir, ruleRecords, report);
  const emit = ctx.warn ?? ((line: string) => console.warn(line));
  for (const [category, ids] of warnings) {
    emit(`warning: ${category}: ${ids.length} (${ids.slice(0, 6).join(", ")}${ids.length > 6 ? ", ..." : ""})`);
  }
  return problems;
}

export interface RuleLike {
  id: string;
  strength: string;
  checked: string;
  recheck_date?: string | null;
  figures?: Record<string, unknown>;
  il_finance_file?: string;
  sources?: {
    url: string;
    strength: string;
    kind: string;
    mirror_host?: string;
    page?: number;
    anchor?: string;
    checked: string;
    publisher_he?: string;
    title_he?: string;
  }[];
  sources_missing_reason?: string;
  derived_from?: string[];
}

const STRENGTH_RANK: Record<string, number> = { primary: 3, "primary-mirror": 2, institution: 1, secondary: 0 };
const MIRROR_HOSTS = ["he.wikisource.org", "nevo.co.il"];

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isPdfUrl(url: string): boolean {
  try {
    const u = new URL(url);
    // the Reshumot gazette service serves PDFs at a document key with no `.pdf` (2026-10-25)
    return /\.pdf$/i.test(u.pathname) || u.pathname.includes("BlobFolder") || (u.host === "free-justice.openapi.gov.il" && u.pathname.includes("/Documents/"));
  } catch {
    return false;
  }
}

/** Every record of data/rules/ by id (those that parse). */
function readRuleRecords(files: string[], dataDir: string): Map<string, RuleLike> {
  const out = new Map<string, RuleLike>();
  for (const file of files) {
    if (!relative(dataDir, file).startsWith("rules") || !file.endsWith(".json")) continue;
    const r = parseJson(readFileSync(file, "utf8")).value as RuleLike | undefined;
    if (r && typeof r.id === "string") out.set(r.id, r);
  }
  return out;
}

/** The tax years a rule's figures name: `tax_year` fields and `by_tax_year` keys. */
function taxYears(node: unknown): number[] {
  if (Array.isArray(node)) return node.flatMap(taxYears);
  if (node === null || typeof node !== "object") return [];
  return Object.entries(node).flatMap(([k, v]) => {
    if (k === "tax_year" && typeof v === "number") return [v];
    if (k === "by_tax_year" && v && typeof v === "object") return Object.keys(v).map(Number).filter(Number.isFinite);
    return taxYears(v);
  });
}

/**
 * Rule sources (docs/data-schema.md §3.1, §4). Failures are returned; the dated and drift checks go to `warn`.
 * A rule with neither `sources` nor `sources_missing_reason` is a failure once any record of the data directory has
 * them (the extraction is committed), and a warning before that.
 */
function checkRuleSources(rule: RuleLike, ctx: ValidationContext, all: Map<string, RuleLike>, warn: (category: string, id: string) => void): string[] {
  const out: string[] = [];
  const today = ctx.today ?? new Date().toISOString().slice(0, 10);
  const extractionLanded = [...all.values()].some((r) => r.sources !== undefined || r.sources_missing_reason !== undefined);
  const sources = rule.sources ?? [];
  if (sources.length === 0 && !rule.sources_missing_reason) {
    if (extractionLanded) out.push("rule has neither sources nor sources_missing_reason (data-schema §3.1)");
    else warn("rules with neither sources nor sources_missing_reason (extraction not run)", rule.id);
  }
  const block = ctx.ruleBase.blocks?.get(rule.id);
  sources.forEach((s, i) => {
    const at = `sources[${i}]`;
    const host = hostOf(s.url);
    if (MIRROR_HOSTS.includes(host) && s.strength === "primary") out.push(`${at}: a ${host} copy is primary-mirror, never primary`);
    if ((s.strength === "primary-mirror") !== (s.mirror_host !== undefined)) out.push(`${at}: mirror_host is set exactly when strength is primary-mirror`);
    if (s.page !== undefined && !isPdfUrl(s.url)) out.push(`${at}: page is only for a PDF URL`);
    if (s.anchor !== undefined && isPdfUrl(s.url)) out.push(`${at}: anchor is only for an HTML URL`);
    if (block && !urlInBlock(s.url, block)) out.push(`${at}: ${s.url} is not in the markdown block of ${rule.id} (verbatim or as a raw-Wikisource rewrite)`);
    if (s.checked > rule.checked) warn("source checked later than the rule's checked", rule.id);
  });
  if (sources.length > 0 && rule.strength !== "open") {
    const best = Math.max(...sources.map((s) => STRENGTH_RANK[s.strength] ?? -1));
    if ((STRENGTH_RANK[rule.strength] ?? -1) !== best) warn("rule strength differs from its strongest source", rule.id);
  }
  const first = sources[0];
  if (first && (!first.publisher_he || !first.title_he)) warn("first source lacks publisher_he or title_he", rule.id);
  for (const id of rule.derived_from ?? []) {
    if (!all.has(id)) out.push(`derived_from: ${id} has no record under data/rules/`);
  }
  if (rule.recheck_date && rule.recheck_date < today) warn("recheck_date has passed", rule.id);
  const years = taxYears(rule.figures);
  if (years.length > 0 && Math.max(...years) < Number(today.slice(0, 4))) warn("figures are behind the current tax year", rule.id);
  return out;
}

/** P-09 (`data/parameters/pinned-rules.json`): its ids exist, and a row's first rule has a primary or primary-mirror source. */
function checkPinnedRules(files: string[], dataDir: string, all: Map<string, RuleLike>, report: (file: string, message: string) => void) {
  const file = files.find((f) => relative(dataDir, f).replace(/\\/g, "/") === "parameters/pinned-rules.json");
  if (!file) return;
  const rec = parseJson(readFileSync(file, "utf8")).value as { rows?: { ids?: string[]; answer_he?: string }[]; guide_blocks?: Record<string, string[]> } | undefined;
  if (!rec) return;
  const ids = [...(rec.rows ?? []).flatMap((r) => r.ids ?? []), ...Object.values(rec.guide_blocks ?? {}).flat()];
  for (const id of new Set(ids)) if (!all.has(id)) report(file, `pinned-rules: ${id} has no record under data/rules/`);
  for (const row of rec.rows ?? []) {
    const first = row.ids?.[0];
    const rule = first ? all.get(first) : undefined;
    if (rule?.sources && !rule.sources.some((s) => s.strength === "primary" || s.strength === "primary-mirror"))
      report(file, `pinned-rules: the first rule of a row (${first}) has no primary or primary-mirror source`);
    // the answer line of the questions page: no digit typed by hand; every figure is a {ID:figure} slot over one of the row's rules
    if (typeof row.answer_he === "string") {
      const plain = row.answer_he.replace(/\{[A-Z0-9-]+:[a-z0-9_]+\}/g, "");
      if (/\d/.test(plain)) report(file, `pinned-rules: the answer to "${row.ids?.join(",")}" carries a typed digit; use a {ID:figure} slot`);
      for (const m of row.answer_he.matchAll(/\{([A-Z0-9-]+):([a-z0-9_]+)\}/g)) {
        const [, id, figure] = m as unknown as [string, string, string];
        if (!row.ids?.includes(id)) report(file, `pinned-rules: the answer slot {${id}:${figure}} names a rule outside the row (${row.ids?.join(",")})`);
        const figures = (all.get(id) as { figures?: Record<string, unknown> } | undefined)?.figures ?? {};
        if (!(figure in figures)) report(file, `pinned-rules: the answer slot {${id}:${figure}} names a figure ${id} does not have (${Object.keys(figures).join(",") || "none"})`);
      }
    }
  }
}

/**
 * data-schema §3.8 and docs/architecture.md 3.3: the terms gate (a series whose terms are not `confirmed` is not
 * shipped), observations sorted by date (then key) and no two with the same date and key.
 */
export function checkSeries(record: SeriesRecord): string[] {
  const out: string[] = [];
  if (record.terms_of_use.status !== "confirmed") {
    out.push(`terms gate: not shipped (terms_of_use.status is "${record.terms_of_use.status}", it must be "confirmed"; architecture 3.3)`);
  }
  const order = (o: { date: string; key?: string | undefined }) => `${o.date}\u0000${o.key ?? ""}`;
  record.observations.forEach((o, i) => {
    const prev = record.observations[i - 1];
    if (!prev) return;
    const [a, b] = [order(prev), order(o)];
    if (a === b) out.push(`observations[${i}]: duplicate of the previous one (date ${o.date}${o.key ? `, key ${o.key}` : ""})`);
    else if (a > b) out.push(`observations[${i}]: not sorted by date (${o.date} after ${prev.date})`);
  });
  return out;
}

/**
 * data-schema §3.14 and docs/architecture.md 3.3: the terms gate (a list whose terms are not `confirmed` is not
 * shipped), the file name `<list>@<snapshot>.json` matches the content, and a fund number appears once.
 * Fund lists are not fund records: exposure `variants` resolve against data/funds/ only (readFundIds).
 */
export function checkFundList(file: FundListFile, fileName: string): string[] {
  const out: string[] = [];
  if (file.terms_of_use.status !== "confirmed") {
    out.push(`terms gate: not shipped (terms_of_use.status is "${file.terms_of_use.status}", it must be "confirmed"; architecture 3.3)`);
  }
  if (fileName !== `${file.list}@${file.snapshot}.json`) out.push(`file name must be ${file.list}@${file.snapshot}.json (list and snapshot)`);
  const seen = new Set<string>();
  file.funds.forEach((f, i) => {
    if (seen.has(f.fund_number)) out.push(`funds[${i}]: fund_number ${f.fund_number} appears twice`);
    seen.add(f.fund_number);
  });
  return out;
}

/**
 * data-schema §3.2, P-05 `instruments`: every wrapper id and every record id the map names must exist: a deposit
 * terms record under data/terms/deposits/, a fund under data/funds/, a fees provider with a `list` line under
 * data/fees/, a rule record under data/rules/; a `track` must be a fund_id of the latest data/cma/ period of any dataset.
 */
function checkInstrumentsMap(files: string[], dataDir: string, ruleIds: Map<string, string[]>, report: (file: string, message: string) => void) {
  const idsIn = (folder: string) => {
    const out = new Set<string>();
    const listed = new Set<string>();
    for (const file of files) {
      if (!relative(dataDir, file).split(/[\\/]/).join("/").startsWith(`${folder}/`) || !file.endsWith(".json")) continue;
      const v = parseJson(readFileSync(file, "utf8")).value as { id?: unknown; lines?: unknown } | undefined;
      if (typeof v?.id !== "string") continue;
      out.add(v.id);
      if (Array.isArray(v.lines) && v.lines.some((l) => (l as { level?: unknown })?.level === "list")) listed.add(v.id);
    }
    return { all: out, withList: listed };
  };
  const deposits = idsIn("terms/deposits").all;
  const funds = new Set([...(readFundIds(files, dataDir) ?? []), ...idsIn("funds").all]);
  const fees = idsIn("fees");
  const cmaFundIds = readLatestCmaFundIds(files, dataDir);
  for (const file of files) {
    if (!/^parameters[\\/]/.test(relative(dataDir, file)) || !file.endsWith(".json")) continue;
    const rec = parseJson(readFileSync(file, "utf8")).value as { method_id?: unknown; instruments?: unknown } | undefined;
    if (rec?.method_id !== "P-05" || typeof rec.instruments !== "object" || rec.instruments === null) continue;
    for (const [wrapper, spec] of Object.entries(rec.instruments as Record<string, Record<string, unknown>>)) {
      const at = `instruments.${wrapper}`;
      if (!wrapperId.safeParse(wrapper).success) report(file, `${at}: ${wrapper} is not a wrapper id`);
      const check = (key: string, known: boolean, where: string) => {
        const id = spec?.[key];
        if (typeof id === "string" && !known) report(file, `${at}.${key}: "${id}" ${where}`);
      };
      check("deposit_terms", deposits.has(spec?.deposit_terms as string), "has no record under data/terms/deposits/");
      check("fund", funds.has(spec?.fund as string), "has no record under data/funds/");
      check("tariff", fees.withList.has(spec?.tariff as string), "has no fees snapshot with a list line under data/fees/");
      check("ira_fees", fees.withList.has(spec?.ira_fees as string), "has no fees snapshot with a list line under data/fees/");
      check("series_rule", ruleIds.has(spec?.series_rule as string), "has no rule record under data/rules/");
      const track = spec?.track;
      if (track !== undefined && !(typeof track === "number" && cmaFundIds?.has(track))) report(file, `${at}.track: ${String(track)} is not a fund_id in the latest data/cma/ period`);
    }
  }
}

/**
 * P-08 (exposure holding wrapper, release 5): each `holding.<exposure id>` must name an exposure record under
 * data/instruments/exposures/, and its `wrapper_id` must be one of that record's `wrapper_ids` (the engine refuses
 * any other, "wrapper-cannot-hold", so the default may never be one).
 */
function checkHoldingParameter(files: string[], dataDir: string, report: (file: string, message: string) => void) {
  const exposures = new Map<string, string[]>();
  for (const file of files) {
    if (!relative(dataDir, file).split(/[\\/]/).join("/").startsWith("instruments/exposures/") || !file.endsWith(".json")) continue;
    const v = parseJson(readFileSync(file, "utf8")).value as { id?: unknown; wrapper_ids?: unknown } | undefined;
    if (typeof v?.id === "string") exposures.set(v.id, Array.isArray(v.wrapper_ids) ? v.wrapper_ids.filter((w): w is string => typeof w === "string") : []);
  }
  for (const file of files) {
    if (!/^parameters[\\/]/.test(relative(dataDir, file)) || !file.endsWith(".json")) continue;
    const rec = parseJson(readFileSync(file, "utf8")).value as { method_id?: unknown; holding?: unknown } | undefined;
    if (rec?.method_id !== "P-08" || typeof rec.holding !== "object" || rec.holding === null) continue;
    for (const [id, row] of Object.entries(rec.holding as Record<string, { wrapper_id?: { value?: unknown } }>)) {
      const wrapper = row?.wrapper_id?.value;
      if (!exposures.has(id)) report(file, `holding.${id}: no exposure record "${id}" under data/instruments/exposures/`);
      else if (typeof wrapper !== "string" || !exposures.get(id)!.includes(wrapper)) report(file, `holding.${id}.wrapper_id: "${String(wrapper)}" is not one of the exposure record's wrapper_ids`);
    }
  }
}

/** Fund IDs of the latest period of each CMA dataset; null when there is no CMA file (the check is then skipped). */
function readLatestCmaFundIds(files: string[], dataDir: string): Set<number> | null {
  const latest = new Map<string, { period: string; file: string }>();
  for (const file of files) {
    const m = /^cma[\\/]([a-z0-9-]+)@(\d{4}-\d{2})\.json$/.exec(relative(dataDir, file));
    if (!m) continue;
    const prev = latest.get(m[1]!);
    if (!prev || m[2]! > prev.period) latest.set(m[1]!, { period: m[2]!, file });
  }
  if (latest.size === 0) return null;
  const ids = new Set<number>();
  for (const { file } of latest.values()) {
    const funds = (parseJson(readFileSync(file, "utf8")).value as { funds?: unknown } | undefined)?.funds;
    if (!Array.isArray(funds)) continue;
    for (const f of funds) if (typeof (f as { fund_id?: unknown })?.fund_id === "number") ids.add((f as { fund_id: number }).fund_id);
  }
  return ids;
}

/** IDs of the fund records under data/funds/ (file name without `@<date>`); null when there are none. */
function readFundIds(files: string[], dataDir: string): Set<string> | null {
  const ids = new Set<string>();
  for (const file of files) {
    const m = /^funds[\\/]([^\\/@]+)(?:@[^\\/]*)?\.json$/.exec(relative(dataDir, file));
    if (m) ids.add(m[1]!);
  }
  return ids.size > 0 ? ids : null;
}

/** Dimensions of every rule record under data/rules/, for the regeneration check (§4 item 9). */
function readRuleDimensions(files: string[], dataDir: string): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const file of files) {
    if (!relative(dataDir, file).startsWith("rules") || !file.endsWith(".json")) continue;
    const parsed = parseJson(readFileSync(file, "utf8"));
    const r = parsed.value as { id?: unknown; dimensions?: unknown } | undefined;
    if (r && typeof r.id === "string" && Array.isArray(r.dimensions)) out.set(r.id, r.dimensions.filter((d): d is string => typeof d === "string"));
  }
  return out;
}

/**
 * data-schema §3.3 and §4 item 9: a wrapper's `dimensions` is regenerated from its `rule_ids`, never edited by
 * hand. Every dimension a cited rule carries must be marked; a `covered` mark must come from a cited rule;
 * a `blocked:<OQ>` mark must name an open question of the rule base. A rule cited without a record under
 * data/rules/ is reported, because the page could not open its rule card.
 */
function checkDimensionMarks(record: Record<string, unknown>, ruleDimensions: Map<string, string[]>, ruleBase: RuleBaseIds): string[] {
  const out: string[] = [];
  const cited = new Set(collectStrings(record, "rule_ids"));
  const union = new Set<string>();
  for (const id of cited) {
    const dims = ruleDimensions.get(id);
    if (!dims) {
      out.push(`rule ${id} is cited but has no record under data/rules/`);
      continue;
    }
    dims.forEach((d) => union.add(d));
  }
  const marks = (record.dimensions ?? {}) as Record<string, string>;
  for (const [dim, mark] of Object.entries(marks)) {
    if (mark === "covered" && !union.has(dim)) out.push(`dimensions.${dim}: marked covered, but no cited rule carries it (§4 item 9)`);
    if (mark.startsWith("blocked:") && !ruleBase.openQuestions.has(mark.slice("blocked:".length)))
      out.push(`dimensions.${dim}: ${mark.slice("blocked:".length)} is not an open question in il-finance`);
  }
  for (const dim of union) {
    if (!(dim in marks)) out.push(`dimensions.${dim}: a cited rule carries it, but it is not marked (§4 item 9)`);
  }
  return out;
}

function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

function parseJson(text: string): { value?: unknown; error?: string } {
  try {
    return { value: JSON.parse(text) };
  } catch (e) {
    return { error: `invalid JSON: ${(e as Error).message}` };
  }
}

function formatIssues(error: z.ZodError): string {
  return error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
}

/** Every string under a key with this name, anywhere in the document (single values and arrays). */
function collectStrings(node: unknown, key: string): string[] {
  if (Array.isArray(node)) return node.flatMap((n) => collectStrings(n, key));
  if (node === null || typeof node !== "object") return [];
  return Object.entries(node).flatMap(([k, v]) => {
    const here = k === key ? [v].flat().filter((x): x is string => typeof x === "string") : [];
    return [...here, ...collectStrings(v, key)];
  });
}
