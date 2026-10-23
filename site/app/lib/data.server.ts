// Reads data/, docs/ and research/ at build time for the route loaders (architecture 3.5: every page is
// generated from data/ at build). Server-only: the `.server` suffix keeps node:fs out of the browser bundle.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  cmaPeriodFile,
  feesSnapshot,
  parameterRecord,
  ruleRecord,
  wrapperRecord,
  type CmaPeriodFile,
  type FeesSnapshot,
  type ParameterRecord,
  type RuleRecord,
  type ValueObject,
  type WrapperId,
  type WrapperRecord,
} from "@finance-tool/schema";
import type { z } from "zod";
import { staleCma, type SiteValue } from "./value";

function findRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    if (existsSync(join(dir, "data")) && existsSync(join(dir, "docs")) && existsSync(join(dir, "packages"))) return dir;
    dir = resolve(dir, "..");
  }
  throw new Error("repository root (with data/, docs/, packages/) not found above " + process.cwd());
}

export const root = findRoot();

/** The run date (D3, architecture 3.4: the engine never reads a clock; the site passes the date in). */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function readJson<T extends z.ZodType>(path: string, schema: T): z.infer<T> {
  const parsed = schema.safeParse(JSON.parse(readFileSync(path, "utf8")));
  if (!parsed.success) throw new Error(`${path}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  return parsed.data;
}

function readDir<T extends z.ZodType>(sub: string, schema: T): z.infer<T>[] {
  const dir = join(root, sub);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => readJson(join(dir, f), schema));
}

export function loadRules(): Record<string, RuleRecord> {
  return Object.fromEntries(readDir("data/rules", ruleRecord).map((r) => [r.id, r]));
}

export function loadParameters(): ParameterRecord[] {
  return readDir("data/parameters", parameterRecord);
}

export function loadWrappers(): WrapperRecord[] {
  return readDir("data/instruments/wrappers", wrapperRecord);
}

export function loadFees(): FeesSnapshot[] {
  return readDir("data/fees", feesSnapshot);
}

// ---------------------------------------------------------------- CMA

export interface Company {
  id: string;
  name: string;
  classifications: string[];
  trackCount: number;
}

export interface Track {
  fundId: number;
  dataset: CmaPeriodFile["dataset"];
  name: string;
  companyId: string;
  companyName: string;
  classification: string;
  specialization: string;
  subSpecialization: string;
  targetPopulation: string;
  inception: string | null;
  reportPeriod: string;
  wrapperId: WrapperId | null;
}

/**
 * The regulator's product type (CAT-10 values) → the site's wrapper (data-schema §2). The two
 * datasets' classifications are read as written; this map is the site's reading of them (REG-17: a
 * kupat gemel lehashkaa, a study fund and the pension funds are all provident funds).
 */
export const classificationToWrapper: Record<string, WrapperId | null> = {
  "קופת גמל להשקעה": "kupat-gemel-lehashkaa",
  "קרנות השתלמות": "keren-hishtalmut",
  "תגמולים ואישית לפיצויים": "provident-for-annuity",
  "קופת גמל להשקעה - חסכון לילד": "child-savings-provident",
  "מרכזית לפיצויים": null,
  "מטרה אחרת": null,
  "קרנות חדשות": "pension-comprehensive",
  "קרנות כלליות": "pension-general",
};

export interface CmaData {
  files: { dataset: CmaPeriodFile["dataset"]; period: string; source: CmaPeriodFile["source"]; checked: string }[];
  companies: Company[];
  tracks: Track[];
  /** The latest report period across datasets, as a value object for the page line. */
  periodValue: SiteValue;
}

const collator = new Intl.Collator("he");

export function loadCma(): CmaData {
  const files = readDir("data/cma", cmaPeriodFile);
  const latest = new Map<string, CmaPeriodFile>();
  for (const f of files) {
    const prev = latest.get(f.dataset);
    if (!prev || prev.report_period < f.report_period) latest.set(f.dataset, f);
  }
  const tracks: Track[] = [];
  const byCompany = new Map<string, Company>();
  for (const f of latest.values()) {
    for (const fund of f.funds) {
      const companyId = fund.managing_corporation.legal_id;
      const companyName = fund.managing_corporation.name.trim();
      tracks.push({
        fundId: fund.fund_id,
        dataset: f.dataset,
        name: fund.names.cma[0]!.trim(),
        companyId,
        companyName,
        classification: fund.fund_classification.trim(),
        specialization: fund.specialization.trim(),
        subSpecialization: fund.sub_specialization.trim(),
        targetPopulation: fund.target_population.trim(),
        inception: fund.inception_date,
        reportPeriod: f.report_period,
        wrapperId: classificationToWrapper[fund.fund_classification.trim()] ?? null,
      });
      const c = byCompany.get(companyId) ?? { id: companyId, name: companyName, classifications: [], trackCount: 0 };
      if (!c.classifications.includes(fund.fund_classification.trim())) c.classifications.push(fund.fund_classification.trim());
      c.trackCount += 1;
      byCompany.set(companyId, c);
    }
  }
  const companies = [...byCompany.values()].sort((a, b) => collator.compare(a.name, b.name));
  const newest = [...latest.values()].sort((a, b) => (a.report_period < b.report_period ? 1 : -1))[0]!;
  const t = today();
  const periodValue: SiteValue = {
    value: newest.report_period,
    unit: "text",
    source: newest.source,
    checked: newest.checked,
    effective_from: newest.report_period + "-01",
    effective_to: null,
    update_rule: "market",
    state: "sourced",
    stale: staleCma(newest.report_period, t),
    notes: "",
  };
  return {
    files: [...latest.values()].map((f) => ({ dataset: f.dataset, period: f.report_period, source: f.source, checked: f.checked })),
    companies,
    tracks,
    periodValue,
  };
}

// ---------------------------------------------------------------- glossary and terms

export interface ChecklistRow {
  id: string;
  name: string;
  explanation: string;
}

/** docs/glossary.md section 2: the 26 checklist rows, in order. */
export function loadChecklistRows(): ChecklistRow[] {
  const doc = readFileSync(join(root, "docs/glossary.md"), "utf8");
  const section = doc.slice(doc.indexOf("## 2. The checklist"), doc.indexOf("## 3. Not covered yet"));
  return [...section.matchAll(/^\| `([a-z-]+)` \| \*\*(.+?)\*\* \| (.+?) \|$/gm)].map((m) => ({ id: m[1]!, name: m[2]!, explanation: m[3]!.trim() }));
}

export interface TermSource {
  title: string;
  url: string;
  checked: string;
  strength: ValueObject["source"]["strength"];
}

export interface TermRow {
  he: string;
  /** The research topic file the row came from (a-cash-bonds, c-gemel-hishtalmut, …). */
  topic: string;
  explanation: string;
  variants: string[];
  ruleIds: string[];
  source: TermSource | null;
  where: string[];
}

interface ResearchTerm {
  topic: string;
  kind?: string;
  term_he: string;
  variants_he?: string[];
  explain_he?: string | null;
  rule_ids?: string[];
  source?: { title?: string; url?: string; checked?: string; strength?: string } | null;
  where?: string[];
}

const rank: Record<string, number> = { primary: 0, "primary-mirror": 1, institution: 2, secondary: 3 };

/**
 * The glossary rows (docs/glossary.md section 1, generated from research/glossary/terms/*.json). Read from
 * the research files, merged as gen_glossary.py merges them: one row per spelling, strongest source kept.
 * They move to data/terms/ (data-schema §3.11) once that collection has its schema.
 */
export function loadTerms(): TermRow[] {
  const dir = join(root, "research/glossary/terms");
  const rows = readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .flatMap((f) => (JSON.parse(readFileSync(join(dir, f), "utf8")) as ResearchTerm[]).map((r) => ({ ...r, topic: f.replace(/\.json$/, "") })));
  const out = new Map<string, TermRow>();
  for (const r of rows) {
    if (r.kind === "dimension" || !r.explain_he) continue;
    const he = r.term_he.trim();
    const key = `${r.topic}|${he}`;
    const src = r.source?.url && r.source.title && r.source.checked ? { title: r.source.title, url: r.source.url, checked: r.source.checked, strength: (r.source.strength ?? "secondary") as TermSource["strength"] } : null;
    const row: TermRow = { he, topic: r.topic, explanation: r.explain_he.trim(), variants: (r.variants_he ?? []).filter((v) => v && v !== he), ruleIds: r.rule_ids ?? [], source: src, where: r.where ?? [] };
    const prev = out.get(key);
    if (!prev) {
      out.set(key, row);
      continue;
    }
    const keep = (rank[prev.source?.strength ?? "secondary"] ?? 4) <= (rank[row.source?.strength ?? "secondary"] ?? 4) ? prev : row;
    const other = keep === prev ? row : prev;
    keep.variants = [...new Set([...keep.variants, ...other.variants])];
    keep.ruleIds = [...new Set([...keep.ruleIds, ...other.ruleIds])];
    keep.where = [...new Set([...keep.where, ...other.where])];
    out.set(key, keep);
  }
  return [...out.values()].sort((a, b) => collator.compare(a.he, b.he));
}

export interface NotCoveredRow {
  he: string;
  explanation: string;
  variants: string[];
  ruleIds: string[];
  source: TermSource | null;
}

/** docs/glossary.md section 3: the products the "not covered yet" page lists. */
export function loadNotCovered(): NotCoveredRow[] {
  const doc = readFileSync(join(root, "docs/glossary.md"), "utf8");
  const section = doc.slice(doc.indexOf("## 3. Not covered yet"), doc.indexOf("## 4. Missing from the rule base"));
  return [...section.matchAll(/^\| \*\*(.+?)\*\* \| (.*?) \| (.*?) \| (.*) \|$/gm)].map((m) => {
    const cell = m[4]!;
    const link = cell.match(/\[(.+?)\]\((\S+?)\)/);
    const ids = cell.split(" · ")[0]!.match(/^[A-Z0-9-]+(?:, [A-Z0-9-]+)*$/) ? cell.split(" · ")[0]!.split(", ") : [];
    const checked = cell.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? "";
    const strengthHe = cell.split(" · ").at(-1) ?? "";
    const strength = strengthHe.includes("(עותק)") ? "primary-mirror" : strengthHe.includes("ראשי") ? "primary" : strengthHe.includes("מוסדי") ? "institution" : "secondary";
    return {
      he: m[1]!,
      explanation: m[2]!.trim(),
      variants: m[3]!.trim() ? m[3]!.split(" · ").map((v) => v.trim()) : [],
      ruleIds: ids,
      source: link ? { title: link[1]!, url: link[2]!, checked, strength } : null,
    };
  });
}

/** docs/method.md §2.3: which formulas each site parameter is used by. */
export function loadParameterUses(): Record<string, string[]> {
  const doc = readFileSync(join(root, "docs/method.md"), "utf8");
  const section = doc.slice(doc.indexOf("### 2.3"), doc.indexOf("### 2.4"));
  const out: Record<string, string[]> = {};
  for (const m of section.matchAll(/^\| (P-\d{2}) \| .+? \| (.+?) \|$/gm)) out[m[1]!] = [...m[2]!.matchAll(/F-\d{2}/g)].map((x) => x[0]);
  return out;
}
