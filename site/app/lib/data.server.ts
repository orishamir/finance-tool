// Reads data/, docs/ and research/ at build time for the route loaders (architecture 3.5: every page is
// generated from data/ at build). Server-only: the `.server` suffix keeps node:fs out of the browser bundle.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import {
  cmaPeriodFile,
  dimensionId,
  dimensionRecord,
  feesSnapshot,
  openQuestionsFile,
  parameterRecord,
  ruleRecord,
  termRecord,
  securityRecord,
  wrapperRecord,
  type CmaPeriodFile,
  type FeesSnapshot,
  type ParameterRecord,
  type RuleRecord,
  type ValueObject,
  type WrapperId,
  type WrapperRecord,
  type SecurityRecord,
  type ProductRecord,
} from "@finance-tool/schema";
import type { z } from "zod";
import { parseMdLink } from "./md-link";
import { newestChecked } from "./data-as-of";
import { staleCma, type SiteValue } from "./value";
import { pointedIds } from "./scope";

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

/**
 * The records a page's rule cards point at (`derived_from`, a general rule's `examples`, and the rules its figures cite, which a
 * figure's sheet shows as chips), and the ones those point at in turn, that the page does not hold itself: a page passes them as
 * `ProvenanceData.pointed`, so every chip on a card opens its record (reviews, 2026-10-26: BRK-35's "לדוגמה" chip, then TXG-04's
 * figure chips TXG-02 and TXG-03, opened empty cards). They never join the page's own rules, which its checklist and its runs read.
 */
export function pointedRecords(have: Record<string, RuleRecord> | readonly RuleRecord[], all: Record<string, RuleRecord> = loadRules()): Record<string, RuleRecord> {
  const own = new Set(Array.isArray(have) ? have.map((r) => r.id) : Object.keys(have));
  const out: Record<string, RuleRecord> = {};
  const queue = (Array.isArray(have) ? [...have] : Object.values(have)) as RuleRecord[];
  while (queue.length > 0) {
    const r = queue.pop()!;
    for (const id of pointedIds(r)) {
      if (own.has(id) || out[id] || !all[id]) continue;
      out[id] = all[id]!;
      queue.push(all[id]!);
    }
  }
  return out;
}

export function loadParameters(): ParameterRecord[] {
  return readDir("data/parameters", parameterRecord);
}

/** The wrappers only (D6): the containers whose rules apply to whatever they hold. */
export function loadWrappers(): WrapperRecord[] {
  return readDir("data/instruments/wrappers", wrapperRecord);
}

/** The securities (D6, amended 2026-10-26): makam, government bonds and the money-market funds, each held in a securities account. */
export function loadSecurities(): SecurityRecord[] {
  return readDir("data/instruments/securities", securityRecord);
}

/** Every product a person chooses between, a wrapper or a security held in one: what the guide, the comparison and the rules page list. */
export function loadProducts(): ProductRecord[] {
  return [...loadWrappers(), ...loadSecurities()];
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

/** The inverse of `loadParameterUses`: per formula, the site parameters it uses (the formula sheet's list). */
export function loadFormulaParameters(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [param, formulas] of Object.entries(loadParameterUses())) for (const f of formulas) (out[f] ??= []).push(param);
  return out;
}

/** The Hebrew name of each source host (`data/sources/publishers.json`): a data file names its company in English ("Bank Leumi le-Israel B.M."), and the sheet's source line shows the Hebrew one (founder, 2026-10-26). */
export function loadPublishersHe(): Record<string, string> {
  const rows = JSON.parse(readFileSync(join(root, "data/sources/publishers.json"), "utf8")) as Record<string, { publisher_he?: string }>;
  return Object.fromEntries(Object.entries(rows).flatMap(([host, r]) => (r.publisher_he ? [[host, r.publisher_he]] : [])));
}

/** What a question sheet knows about an open question, by its code (`TX2 OQ6`): its status, the closing date, and its Hebrew lines. */
export type OpenQuestionView = { status: "open" | "narrowed" | "closed"; closed_on?: string; title_he?: string; blocks_he?: string };

/**
 * data/open-questions.json (data-schema 3.15) for every page's sheets, through the root loader (2026-10-26). Only the questions a
 * sheet has something to say about: a closed one (its chip shows the closure wherever it appears) and one with Hebrew lines (every
 * question the site names). Any other code opens the sheet's general lines, which are true of an open question.
 */
export function loadOpenQuestions(): Record<string, OpenQuestionView> {
  const out: Record<string, OpenQuestionView> = {};
  for (const q of readJson(join(root, "data/open-questions.json"), openQuestionsFile)) {
    if (q.status !== "closed" && !q.title_he && !q.blocks_he) continue;
    out[q.id] = { status: q.status, ...(q.closed_on ? { closed_on: q.closed_on } : {}), ...(q.title_he ? { title_he: q.title_he } : {}), ...(q.blocks_he ? { blocks_he: q.blocks_he } : {}) };
  }
  return out;
}

/** Which card on /parameters each id answers to: `P-01` to itself, and an `A-01` that a card holds as an input key to that card. */
export function loadParameterAnchors(): Record<string, string> {
  const out: Record<string, string> = {};
  const scan = (node: unknown, card: string) => {
    if (Array.isArray(node)) node.forEach((n) => scan(n, card));
    else if (node && typeof node === "object")
      for (const [k, v] of Object.entries(node)) {
        if (/^A-\d+$/.test(k)) out[k] ??= card;
        scan(v, card);
      }
  };
  const cards = loadParameters().sort((a, b) => a.method_id.localeCompare(b.method_id));
  for (const p of cards) out[p.method_id] = p.method_id;
  for (const p of cards) scan(p, p.method_id);
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

/** data/parameters/home-guide-door.json (P-10): the guide pages the first page's guide door names, as id and name, in order. */
export function loadHomeGuideDoor(): { id: string; name: string }[] {
  const ids = (JSON.parse(readFileSync(join(root, "data/parameters/home-guide-door.json"), "utf8")) as { wrappers: string[] }).wrappers;
  const names = new Map<string, string>(loadProducts().map((w) => [w.id, w.names.he[0]!]));
  return ids.filter((id) => names.has(id)).map((id) => ({ id, name: names.get(id)! }));
}

/** data/parameters/pinned-rules.json (P-09): the questions at the top of the rules page and the facts per guide page. A site judgement, not a rule. */
export function loadPinnedRules(): PinnedRules {
  return JSON.parse(readFileSync(join(root, "data/parameters/pinned-rules.json"), "utf8")) as PinnedRules;
}
