// Reads data/, docs/ and research/ at build time for the route loaders (architecture 3.5: every page is
// generated from data/ at build). Server-only: the `.server` suffix keeps node:fs out of the browser bundle.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  cmaPeriodFile,
  dimensionId,
  dimensionRecord,
  feesSnapshot,
  parameterRecord,
  ruleRecord,
  termRecord,
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
import { parseMdLink } from "./md-link";
import { newestChecked } from "./data-as-of";
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

/** The newest `checked` date on any record under data/ (audit 2026-10-24, A29): what "data as of" in the footer says. */
export function dataAsOf(): string {
  return newestChecked(join(root, "data"));
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

function latestCmaFiles(): Map<string, CmaPeriodFile> {
  const files = readDir("data/cma", cmaPeriodFile);
  const latest = new Map<string, CmaPeriodFile>();
  for (const f of files) {
    const prev = latest.get(f.dataset);
    if (!prev || prev.report_period < f.report_period) latest.set(f.dataset, f);
  }
  return latest;
}

/** The regulator's two fee averages of every track in the latest period, as the file holds them (value objects). */
export function loadCmaFees(): Map<number, { balance: ValueObject; deposit: ValueObject }> {
  const out = new Map<number, { balance: ValueObject; deposit: ValueObject }>();
  for (const f of latestCmaFiles().values()) for (const fund of f.funds) out.set(fund.fund_id, { balance: fund.fees.avg_annual_management_fee, deposit: fund.fees.avg_deposit_fee });
  return out;
}

export function loadCma(): CmaData {
  const latest = latestCmaFiles();
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

/** data/dimensions/: the 26 checklist rows, in the order of the schema's `dimensionId` enum (docs/glossary.md section 2). */
export function loadChecklistRows(): ChecklistRow[] {
  const order: string[] = [...dimensionId.options];
  return readDir("data/dimensions", dimensionRecord)
    .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
    .map((d) => ({ id: d.id, name: d.he, explanation: d.one_line }));
}

export interface TermSource {
  title: string;
  url: string;
  checked: string;
  strength: ValueObject["source"]["strength"];
}

export interface TermRow {
  he: string;
  explanation: string;
  variants: string[];
  ruleIds: string[];
  source: TermSource | null;
  /** The places a reader meets the term (data-schema 3.11 `where`). */
  where: string[];
  /** The guide pages (wrapper ids) the term belongs to. */
  wrapperIds: string[];
  /** The exposure records the term belongs to. */
  exposureIds: string[];
}

/**
 * The glossary rows (docs/glossary.md section 1), read from data/terms/ (generated from research/glossary
 * by packages/pipeline/scripts/gen-terms.ts, which keeps the strongest source per spelling). Sorted with the
 * Hebrew collator.
 */
export function loadTerms(): TermRow[] {
  return readDir("data/terms", termRecord)
    .map((t) => ({
      he: t.he,
      explanation: t.meaning,
      variants: t.variants,
      ruleIds: t.rule_ids,
      source: { title: t.source.title, url: t.source.url, checked: t.source.checked, strength: t.source.strength },
      where: t.where,
      wrapperIds: t.wrapper_ids,
      exposureIds: t.exposure_ids ?? [],
    }))
    .sort((a, b) => collator.compare(a.he, b.he));
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
    const link = parseMdLink(cell);
    const ids = cell.split(" · ")[0]!.match(/^[A-Z0-9-]+(?:, [A-Z0-9-]+)*$/) ? cell.split(" · ")[0]!.split(", ") : [];
    const checked = cell.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? "";
    const strengthHe = cell.split(" · ").at(-1) ?? "";
    const strength = strengthHe.includes("(עותק)") ? "primary-mirror" : strengthHe.includes("ראשי") ? "primary" : strengthHe.includes("מוסדי") ? "institution" : "secondary";
    return {
      he: m[1]!,
      explanation: m[2]!.trim(),
      variants: m[3]!.trim() ? m[3]!.split(" · ").map((v) => v.trim()) : [],
      ruleIds: ids,
      source: link ? { title: link.text, url: link.url, checked, strength } : null,
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

// ---------------------------------------------------------------- P-09 pinned rules

export interface PinnedRules {
  rows: { ids: string[]; question_he: string; answer_he?: string }[];
  /** Wrapper id → two or three rule ids for its guide page's "worth knowing" block. */
  guide_blocks: Record<string, string[]>;
  rationale_he?: string;
  provisional?: boolean;
  signed_off_on: string;
}

/** data/parameters/pinned-rules.json (P-09): the questions at the top of the rules page and the facts per guide page. A site judgement, not a rule. */
export function loadPinnedRules(): PinnedRules {
  return JSON.parse(readFileSync(join(root, "data/parameters/pinned-rules.json"), "utf8")) as PinnedRules;
}
