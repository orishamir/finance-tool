// The validator: docs/data-schema.md §4 and docs/architecture.md 3.2. A problem fails the run; a warning (rule sources, dates) is printed in
// one line per category and does not.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { z } from "zod";
import {
  abroadRecord,
  catalogEntry,
  cmaPeriodFile,
  depositTerms,
  dimensionRecord,
  exposureRecord,
  feesSnapshot,
  fundListFile,
  fundRecord,
  type AbroadRecord,
  type AbroadSource,
  type FundRecord,
  type FundListFile,
  openQuestionsFile,
  type OpenQuestionEntry,
  parameterRecord,
  ruleRecord,
  seriesRecord,
  termRecord,
  securityRecord,
  productId,
  wrapperRecord,
  type SeriesRecord,
  sourcesFile,
  israelToday,
  isReligiousLaw,
  EFFECTIVE_RATE_PATHS,
} from "@finance-tool/schema";
import { questionCodesIn, questionWordsIn, urlInBlock, type RuleBaseIds } from "./references.ts";
import { checkScope } from "./scope.ts";

/**
 * Collection folder → schema. A file in a folder with no schema yet is an error: schema first, then data.
 * Nested folders (`instruments/wrappers`) are matched on their full path first, then on the top folder.
 */
const collections: Record<string, z.ZodType> = {
  rules: ruleRecord,
  parameters: parameterRecord,
  cma: cmaPeriodFile,
  "instruments/wrappers": wrapperRecord,
  "instruments/securities": securityRecord,
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
  "open-questions.json": openQuestionsFile,
  abroad: abroadRecord,
};

export interface ValidationContext {
  dataDir: string;
  ruleBase: RuleBaseIds;
  formulas: Set<string>;
  /** Today as YYYY-MM-DD, for the date warnings; default: the system date. */
  today?: string;
  /** Receives each warning category as one line; default: console.warn. */
  warn?: (line: string) => void;
  /**
   * Files outside data/ whose question codes are checked too (docs, the rule base, the packages' sources), and the rule base's
   * file-to-prefix table for the questions its files name in words; absent in hand-built contexts.
   */
  citing?: { files: string[]; prefixOf: Map<string, string> };
  /** The number of pages of each filed PDF by its address without the `#…` part (research/library/index.jsonl); absent in hand-built contexts. */
  filePages?: Map<string, number>;
}

export interface Problem {
  file: string;
  message: string;
}

/**
 * data-schema §2: a value in `pct_per_year_effective` stands only where a rate may be either kind (`EFFECTIVE_RATE_PATHS`); anywhere
 * else nothing reads the unit, so a rate there would be run as nominal whatever it says.
 */
export function checkEffectiveRateUnit(collection: string, record: unknown): string[] {
  const allowed = new Set(EFFECTIVE_RATE_PATHS.filter((p) => p.collection === collection).map((p) => p.path));
  const out: string[] = [];
  const walk = (v: unknown, at: string) => {
    if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${at}[${i}]`));
    else if (v && typeof v === "object") {
      if ((v as { unit?: unknown }).unit === "pct_per_year_effective" && !allowed.has(at))
        out.push(`${at || "(record)"}: unit pct_per_year_effective is read only in ${EFFECTIVE_RATE_PATHS.map((p) => `${p.collection} ${p.path}`).join(" and ")} (data-schema §2)`);
      for (const [k, x] of Object.entries(v)) walk(x, at ? `${at}.${k}` : k);
    }
  };
  walk(record, "");
  return out;
}

/** The first string anywhere in a parsed JSON value that names a product defined by religious law, if any. */
function religiousLawText(v: unknown): string | undefined {
  if (typeof v === "string") return isReligiousLaw(v) ? v : undefined;
  const items = Array.isArray(v) ? v : v && typeof v === "object" ? Object.values(v) : [];
  for (const x of items) {
    const hit = religiousLawText(x);
    if (hit !== undefined) return hit;
  }
  return undefined;
}

/** Every object key anywhere in a parsed JSON value. */
function collectKeys(v: unknown, out = new Set<string>()): Set<string> {
  if (Array.isArray(v)) for (const x of v) collectKeys(x, out);
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) out.add(k), collectKeys(x, out);
  return out;
}

export function validateData(ctx: ValidationContext): Problem[] {
  const problems: Problem[] = [];
  const report = (file: string, message: string) => problems.push({ file: relative(ctx.dataDir, file), message });

  const files = listFiles(ctx.dataDir);
  const ruleDimensions = readRuleDimensions(files, ctx.dataDir);
  const cmaFundIds = readLatestCmaFundIds(files, ctx.dataDir);
  const fundIds = readFundIds(files, ctx.dataDir);
  const ruleRecords = readRuleRecords(files, ctx.dataDir);
  const feeCaps = readFeeCaps(files, ctx.dataDir);
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
    // the words a cited page opens at live in data/sources/fragments.json only; the site attaches them to the record when it reads it
    if (rel !== join("sources", "fragments.json") && collectKeys(parsed.value).has("fragment"))
      report(file, "fragment: written only in data/sources/fragments.json (by tools/quote-fragments.mjs), never in a record");
    // products defined by religious law are not kept (guidelines/project.md): a refresh drops them, and a hand collection may not add one
    const religious = religiousLawText(parsed.value);
    if (religious !== undefined) report(file, `names a product defined by religious law ("${religious.slice(0, 80)}"); such products are not kept in data/`);

    for (const id of collectStrings(parsed.value, "rule_ids")) {
      if (!ctx.ruleBase.rules.has(id)) report(file, `rule_ids: ${id} is not a rule in il-finance (data-schema §4 item 2)`);
    }
    for (const key of ["blocked_by", "open_questions"]) {
      for (const id of collectStrings(parsed.value, key)) {
        if (!ctx.ruleBase.openQuestions.has(id)) report(file, `${key}: ${id} is not an open question in il-finance`);
      }
    }
    for (const id of collectStrings(parsed.value, "formula")) {
      if (/^F-\d{2,3}$/.test(id) && !ctx.formulas.has(id)) report(file, `formula: ${id} is not defined in docs/method.md (data-schema §4 item 6)`);
    }
    for (const message of checkCitedPages(parsed.value, ctx.filePages)) report(file, message);
    for (const message of checkEffectiveRateUnit(collection, parsed.value)) report(file, message);
    if (collection === "terms/deposits" && result.success) for (const message of checkFirstExitPoint(parsed.value)) report(file, message);
    if (collection === "rules" && result.success) {
      const rec = parsed.value as RuleLike;
      for (const message of checkRuleSources(rec, ctx, ruleRecords, warn)) report(file, message);
    }
    // data-schema §3.16: one record per guide page, named by the guide's id
    if (collection === "abroad" && result.success && (parsed.value as { id: string }).id !== parts[parts.length - 1]!.replace(/\.json$/, ""))
      report(file, `id ${(parsed.value as { id: string }).id} differs from the file name: data/abroad/<guide id>.json`);
    if (collection === "abroad" && result.success) for (const at of supersededAbroad(parsed.value as AbroadRecord, ctx.today ?? israelToday())) warn("note on other countries cites a text no longer in force: move the source", at);
    if (collection === "series" && result.success) {
      for (const message of checkSeries(parsed.value as SeriesRecord)) report(file, message);
    }
    if (collection === "fund-lists" && result.success) {
      for (const message of checkFundList(parsed.value as FundListFile, parts[parts.length - 1]!)) report(file, message);
    }
    if (collection === "funds" && result.success) {
      for (const message of checkFundLoad(parsed.value as Pick<FundRecord, "fees">)) report(file, message);
      for (const message of checkFundDistribution(parsed.value as Pick<FundRecord, "distribution_policy" | "distribution">)) report(file, message);
      for (const message of checkFundNames(parsed.value as Pick<FundRecord, "names">)) report(file, message);
      for (const message of checkTrackingRecord(parsed.value as Pick<FundRecord, "exposure_id" | "tracking_record" | "domicile" | "fees">)) report(file, message);
      for (const message of checkSharePrice(parsed.value as Pick<FundRecord, "share_price">)) report(file, message);
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
    if (collection === "fees" && result.success) {
      // S1: a foreign broker is regulated abroad and says by whom; the schema refine checks the pair
      // regulator/regulator_foreign, this checks the class too, and that availability does not name a class twice.
      const snap = parsed.value as { provider: { class: string; regulator: string }; availability?: { applies_to: string[] }[] };
      if ((snap.provider.class === "foreign_broker") !== (snap.provider.regulator === "foreign"))
        report(file, 'provider.class "foreign_broker" and provider.regulator "foreign" go together (data-schema §3.6, S1)');
      const seen = new Set<string>();
      for (const a of snap.availability ?? [])
        for (const c of a.applies_to) {
          if (seen.has(c)) report(file, `availability: class ${c} appears in two entries`);
          seen.add(c);
        }
      // only a provider's latest record ranks; an older one stands as it was read
      const name = rel.split(/[\\/]/).pop()!;
      const isLatest = !files.some((f) => { const n = f.split(/[\\/]/).pop()!; return n.startsWith(`${name.split("@")[0]}@`) && n > name; });
      if (isLatest) for (const message of checkPricePremises(parsed.value as PremiseSnapshot)) report(file, message);
      if (isLatest) for (const message of checkLinesUnderCap(parsed.value as DiscountSnapshot, feeCaps)) report(file, message);
      // a house that is part of another (D43) names one that has a record, and not itself
      const partOf = (parsed.value as { provider: { part_of?: string } }).provider.part_of;
      if (partOf && (partOf === name.split("@")[0] || !files.some((f) => f.split(/[\\/]/).pop()!.startsWith(`${partOf}@`))))
        report(file, `provider.part_of: ${partOf} is no other house with a record under data/fees/`);
      for (const message of checkTariffTitle((parsed.value as { tariff: { title: string } }).tariff.title)) report(file, message);
      for (const message of checkDiscountLines(parsed.value as DiscountSnapshot)) report(file, message);
      for (const message of checkByAmount(parsed.value as ByAmountSnapshot)) report(file, message);
      if (isLatest) for (const message of checkTariffDate(parsed.value as TariffDateSnapshot)) report(file, message);
      if (isLatest) for (const message of checkCutSourceTitles(parsed.value)) report(file, message);
    }
    if (collection === "instruments/exposures" && result.success && fundIds) {
      for (const v of (parsed.value as { variants: string[] }).variants) {
        if (v.startsWith("fund:") && !fundIds.has(v.slice("fund:".length)))
          report(file, `variants: ${v} has no record under data/funds/ (data-schema §3.4)`);
      }
    }
    if ((collection === "instruments/wrappers" || collection === "instruments/securities") && result.success) {
      for (const message of checkDimensionMarks(parsed.value as Record<string, unknown>, ruleDimensions, ctx.ruleBase)) report(file, message);
    }
  }
  checkStaleUnknowns(files, ctx.dataDir, ruleRecords, warn);
  checkUnofficialSources(files, ctx.dataDir, report);
  checkInstrumentsMap(files, ctx.dataDir, ruleDimensions, report);
  checkHoldingParameter(files, ctx.dataDir, report);
  checkPinnedRules(files, ctx.dataDir, ruleRecords, report);
  checkHomeGuideDoor(files, ctx.dataDir, report);
  checkDepositAmounts(files, ctx.dataDir, report);
  checkTermNames(files, ctx.dataDir, report);
  checkOpenQuestions(files, ctx, report, warn);
  // who each rule applies to and where it may appear (D30; 8dd1f013:research/specs/2026-10-25-rules-scope/spec.md §3): scope.ts
  const scopeCounts = checkScope(ctx, ruleRecords, report, warn);
  const emit = ctx.warn ?? ((line: string) => console.warn(line));
  emit(`scope: ${scopeCounts.general} general, ${scopeCounts.institution} institution, ${scopeCounts.unsettled} unsettled`);
  for (const [category, ids] of warnings) {
    emit(`warning: ${category}: ${ids.length} (${ids.slice(0, 6).join(", ")}${ids.length > 6 ? ", ..." : ""})`);
  }
  return problems;
}

/**
 * data-schema §3.5 and §4 item 15: the page shows no load and prices none while every collected load is zero. A load
 * above zero would be a cost the reader never sees, so it fails until the page prices it.
 */
export function checkFundLoad(record: Pick<FundRecord, "fees">): string[] {
  const value = record.fees.load?.value;
  if (typeof value !== "number" || value <= 0) return [];
  return [`fees.load: this fund charges a load on purchase of ${value}%, and the page does not yet price it; show and price the load before adding this value`];
}

/** data-schema §3.5 (A-10): a yield belongs to a distributing fund, as a number in percent a year from a document. */
export function checkFundDistribution(record: Pick<FundRecord, "distribution_policy" | "distribution">): string[] {
  const d = record.distribution;
  if (!d) return [];
  const out: string[] = [];
  if (record.distribution_policy !== "distributing") out.push("distribution: a yield on a fund that does not distribute");
  if (d.yield.unit !== "pct_per_year" || typeof d.yield.value !== "number" || d.yield.value <= 0) out.push("distribution.yield: a number above zero in pct_per_year, read from the fund's document");
  return out;
}

/** The rule that records how each Tel Aviv index counts dividends (gross, GTR), by the exposure the fund follows (F-92 (d)); the same three
 * indices as the engine's GROSS_COMPARED_INDICES (fund-gap.ts), which a pipeline test holds together. */
export const GROSS_INDEX_RULE: Record<string, string> = { "index-ta125": "ETF-42", "index-ta35": "ETF-44", "index-ta90": "ETF-45" };

/**
 * data-schema §3.5 and §4 item 17. A tracking record holds every full calendar year its
 * report prints, no fewer and no more: `years` against `years_printed`, each year once. A `gross` benchmark is admitted only on an index
 * the method names (TA-125, TA-35, TA-90), with the document that says so (its own source, or the report's page) and that index's own
 * rule; another rule id fails. An Israeli record carries the fees charged in each of its years and the page that prints them (F-92 (b): every Israeli annual
 * report prints them in "הוצאות שנפרעו מנכסי הקרן"); fees charged without their page fail anywhere.
 */
export function checkTrackingRecord(record: Pick<FundRecord, "exposure_id" | "tracking_record"> & { domicile?: string; fees?: Pick<FundRecord["fees"], "variable_management"> }): string[] {
  const t = record.tracking_record;
  if (!t) return [];
  const out: string[] = [];
  const held = t.years.map((y) => y.year);
  if (new Set(held).size !== held.length) out.push("tracking_record.years: a year appears twice");
  if (new Set(t.years_printed).size !== t.years_printed.length) out.push("tracking_record.years_printed: a year appears twice");
  const printed = [...t.years_printed].sort((a, b) => a - b);
  const missing = printed.filter((y) => !held.includes(y));
  const extra = held.filter((y) => !printed.includes(y));
  if (missing.length) out.push(`tracking_record.years: the report prints ${missing.join(", ")} and the record leaves ${missing.length > 1 ? "them" : "it"} out; copy every full year the report prints (F-92 (a))`);
  if (extra.length) out.push(`tracking_record.years: ${extra.join(", ")} ${extra.length > 1 ? "are" : "is"} not in years_printed; a part year is left out, and a year the report does not print has no source`);
  const charged = t.years.filter((y) => y.fees_charged);
  if (charged.length && !t.fees_page) out.push("tracking_record.fees_page: the fees charged in each year name the page of the report that prints them");
  if (record.domicile === "IL") {
    const bare = t.years.filter((y) => !y.fees_charged).map((y) => y.year);
    if (bare.length) out.push(`tracking_record.years: ${bare.join(", ")} ${bare.length > 1 ? "have" : "has"} no fees_charged; an Israeli annual report prints them in "הוצאות שנפרעו מנכסי הקרן" (F-92 (b))`);
    // F-92 (b): the variable fee counted forward rests on the years charged at today's rate, which the report's table of changes dates
    if (t.fees_page && (t.variable_rate_since === undefined || !t.changes_page)) out.push('tracking_record: an Israeli record with fees_page names changes_page and variable_rate_since (null when its table "שינויים במאפייני הקרן" prints no change of the variable fee) (F-92 (b))');
  }
  if ((t.variable_rate_since !== undefined || t.variable_positive_only) && !charged.length) out.push("tracking_record: variable_rate_since and variable_positive_only speak of the fees charged, which the record does not hold");
  // the variable fee is paid back at the published rate (ETF-14) and, by each prospectus's own mechanism, charged at most at it (ETF-14 open
  // question 8): a year at today's rate charged beyond it either way is a misread cell, not a fact. The site's check, not a rule.
  const listed = record.fees?.variable_management?.value;
  if (typeof listed === "number" && t.variable_rate_since !== undefined) {
    const from = t.variable_rate_since;
    const over = charged.filter((y) => (from === null || y.year >= firstFullYear(from)) && Math.abs(y.fees_charged!.variable) > listed + 1e-9).map((y) => y.year);
    if (over.length) out.push(`tracking_record.years: ${over.join(", ")} charged a variable fee beyond today's rate of ${listed}% in a year at that rate; read the cell again`);
  }
  if (t.benchmark.dividends === "gross") {
    const rule = GROSS_INDEX_RULE[record.exposure_id];
    if (!rule) out.push(`tracking_record.benchmark: a gross benchmark on ${record.exposure_id}, which is not a Tel Aviv index the method compares gross (F-92 (d))`);
    // the document that says the index is gross: its own `source`, or the record's report at `page`
    if (!t.benchmark.source && !t.benchmark.page) out.push("tracking_record.benchmark: a gross benchmark names the document that says so, in its own source or by the page of the record's report");
    if (rule && !(t.benchmark.rule_ids ?? []).includes(rule)) out.push(`tracking_record.benchmark.rule_ids: ${record.exposure_id} is recorded by ${rule}, not ${(t.benchmark.rule_ids ?? []).join(", ") || "nothing"}`);
    const wrong = (t.benchmark.rule_ids ?? []).filter((id) => Object.values(GROSS_INDEX_RULE).includes(id) && id !== rule);
    if (rule && wrong.length) out.push(`tracking_record.benchmark.rule_ids: ${wrong.join(", ")} records another index`);
  }
  return out;
}

/** The first calendar year wholly at a rate in force from `since` (YYYY-MM-DD): its own year when it starts on 1 January, else the next (F-92 (b)). */
export const firstFullYear = (since: string): number => Number(since.slice(0, 4)) + (since.slice(5) === "01-01" ? 0 : 1);

/** A name's brackets close in order, and no Hebrew letter is glued to the outside of one: names read off a report's PDF came out as
 * "MTF סל (S&P 500 (4D" and "מור סל (4D)י S&P 500", and the page showed them so. */
export function checkFundNames(record: Pick<FundRecord, "names">): string[] {
  const out: string[] = [];
  for (const name of [...record.names.he, ...record.names.en]) {
    let depth = 0;
    for (const ch of name) {
      if (ch === "(") depth++;
      else if (ch === ")" && --depth < 0) break;
    }
    if (depth !== 0) out.push(`names: "${name}" has a bracket that does not close in order; copy the name from the fund's report`);
    if (/[\u05d0-\u05ea]\(|\)[\u05d0-\u05ea]/.test(name)) out.push(`names: "${name}" has a Hebrew letter glued to the outside of a bracket; copy the name from the fund's report`);
  }
  return out;
}

/**
 * A document's title that quotes a fund's name broken by the right-to-left copy: a bracket that does not close in order ("MTF מחקה (Nasdaq
 * 100 (4D" for "MTF מחקה (4D) Nasdaq 100"), or a class mark glued to a Hebrew letter ("(4D)י"). Rule records' titles, their figures' too,
 * and the rule base's source lines (the fund records were checked, the titles that quote them were not).
 */
export function checkTitleBrackets(title: string): string[] {
  let depth = 0;
  for (const ch of title) {
    if (ch === "(") depth++;
    else if (ch === ")" && --depth < 0) break;
  }
  const out: string[] = [];
  if (depth !== 0) out.push(`"${title.slice(0, 80)}" has a bracket that does not close in order; copy the name from the document`);
  if (/\(\d[A-Z]\)[\u05d0-\u05ea]|[\u05d0-\u05ea]\(\d[A-Z]\)/.test(title)) out.push(`"${title.slice(0, 80)}" has a class mark glued to a Hebrew letter; copy the name from the document`);
  return out;
}

/** Every `title` and `title_he` in a record, with where it is. */
function titlesOf(o: unknown, at = ""): [string, string][] {
  if (Array.isArray(o)) return o.flatMap((x, i) => titlesOf(x, `${at}[${i}]`));
  if (!o || typeof o !== "object") return [];
  return Object.entries(o).flatMap(([k, v]) => ((k === "title" || k === "title_he") && typeof v === "string" ? [[`${at}.${k}`, v] as [string, string]] : titlesOf(v, `${at}.${k}`)));
}

/** The words of a reading note, not of a document's name (a 1, 321-character note stood as a bank's tariff name on its page). */
const READING_NOTE = /https?:\/\/|Chrome|curl|founder|pdf\.js|script|סקריפט|מטא-נתוני|אינו נושא תאריך|אינו מודפס/;
/** A tariff's title is the document's name, which the site shows as the source; the notes on how it was read go in `tariff.notes`. */
export function checkTariffTitle(title: string): string[] {
  const out: string[] = [];
  if (title.length > 100) out.push(`tariff.title: ${title.length} characters; the document's name only, notes in tariff.notes`);
  if (READING_NOTE.test(title)) out.push("tariff.title: holds a link or a note on how the document was read; move it to tariff.notes");
  return out;
}

interface TariffDateSnapshot {
  missing: boolean;
  tariff: { published: string | null; printed?: { kind: string; date?: string | null; as_printed?: string } };
}
/**
 * A collected price list's date line says what the document prints (a bare "ללא תאריך פרסום" taught nothing): a
 * latest record with no `published` says in `tariff.printed` whether the document dates each part, prints a version, or prints nothing,
 * and one with `published` carries no `printed`. A part's date is the date it prints: a misprint is `null`, never a guess.
 */
export function checkTariffDate(snap: TariffDateSnapshot): string[] {
  const { published, printed } = snap.tariff;
  if (published && printed) return ["tariff.printed: only where the document prints no date for the whole (tariff.published is null)"];
  if (!published && !printed && !snap.missing)
    return ["tariff.printed: a collected price list with no published date says what it prints instead (part, version or none), so the page can say it"];
  if (printed?.kind === "part" && printed.as_printed !== undefined) {
    // a print reads day, month, year (Israeli order); a year of other than four digits, or a day or month out of range, is no date
    const m = /^\s*(\d{1,2})[./-](\d{1,2})[./-](\d+)\s*$/.exec(printed.as_printed);
    const read = m && m[3]!.length === 4 && +m[2]! >= 1 && +m[2]! <= 12 && +m[1]! >= 1 && +m[1]! <= 31 ? `${m[3]}-${m[2]!.padStart(2, "0")}-${m[1]!.padStart(2, "0")}` : null;
    if ((printed.date ?? null) !== read)
      return [read ? `tariff.printed.date: ${printed.date ?? "null"} is not the date printed on the part (${printed.as_printed})` : `tariff.printed.date: the part prints no real date (${printed.as_printed}), so it is null, never a guess`];
  }
  return [];
}

/**
 * A figure's source title is the document's name and its section, shown on the page; one cut off inside a bracket is a copy of the
 * reading notes trimmed to a length (seven latest records showed "... כפי שמודפס, כנראה" and "אין תאריך
 * כולל, כל חלק נושא 'מעודכ" under "מה אפשר לקנות כאן").
 */
export function checkCutSourceTitles(snap: unknown): string[] {
  const out: string[] = [];
  const walk = (o: unknown, path: string) => {
    if (!o || typeof o !== "object") return;
    const title = (o as { source?: { title?: unknown } }).source?.title;
    if (typeof title === "string") {
      let depth = 0;
      for (const ch of title) if ((depth += ch === "(" ? 1 : ch === ")" ? -1 : 0) < 0) break;
      if (depth !== 0) out.push(`${path}.source.title: a bracket is left open, so the title was cut off ("…${title.slice(-30)}"); write the document's name and section`);
    }
    for (const [k, v] of Object.entries(o)) walk(v, path ? `${path}.${k}` : k);
  };
  walk(snap, "");
  return out;
}

/** The words a document must use before a house ranks on a kind of holding (no price from analogy). */
const NAMES_CLASS: Record<string, RegExp> = {
  mutual_fund_units: /קרן מחקה|קרנות מחקות|קרנות נאמנות|נאמנות וסל/,
  etf_units: /קרן סל|קרנות סל|תעודו?ת סל|ETF|קרן מחקה|קרנות מחקות|נאמנות וסל/,
  tase_foreign_fund_units: /קרן חוץ|קרנות חוץ|רשומות בבורסה/,
  // a fund abroad, in words or as a security with nothing narrowing it to shares; a place alone names no holding
  foreign_securities: /קרנות|קרן|ETF|תעודו?ת סל|ניירות ערך בחוץ לארץ(?!\s*-)/,
};
interface PremiseSnapshot {
  provider: { class: string; part_of?: string };
  current_account?: { monthly_minimum: { value: unknown; unit: string; source?: { quote?: string } } };
  missing?: boolean;
  price_for_he?: string;
  left_out?: unknown[];
  lines: FlatLineLike[];
  availability?: {
    applies_to: string[];
    available: boolean | "unknown";
    reason_he?: string;
    source: { quote?: string };
    phone_only?: { venues?: string[]; source: { quote: string } };
  }[];
  groups?: { state: string; entries: GroupEntryLike[] };
  snapshot?: string;
  tariff?: { url: string };
  advertising?: AdvertisingLike[];
}
interface FlatLineLike {
  id?: string;
  base: string;
  applies_to: string[];
  rate?: { value?: number | null; source?: { url?: string } } | null;
  min?: { value?: number | null; unit?: string } | null;
  max?: { value?: number | null; unit?: string } | null;
  flat_up_to?: { amount: { value?: number | null; unit?: string }; up_to: { value?: number | null; unit?: string } };
}

const currencyOfUnit = (unit: string | undefined) => (unit && /^usd/.test(unit) ? "usd" : unit && /^nis/.test(unit) ? "nis" : unit);

/**
 * F-12, F-13: a flat price for an order or a conversion up to a sum is below the line's minimum, in the same currency. The engine settles the
 * flat price before it iterates (`buyWithCash`, `convertFor`) and counts on the line being dearer just past the sum; a flat price at or above
 * the minimum would make an order just past the sum cheaper than one under it, which no recorded price list prints.
 */
export function checkFlatPrices(snap: { lines: FlatLineLike[] }): string[] {
  const out: string[] = [];
  for (const l of snap.lines) {
    const f = l.flat_up_to;
    if (!f) continue;
    const name = l.id ?? l.base;
    if (!f.amount.unit || !f.up_to.unit) {
      out.push(`${name}: flat_up_to's amount and up_to each need a unit`);
      continue;
    }
    if (currencyOfUnit(f.amount.unit) !== currencyOfUnit(f.up_to.unit)) out.push(`${name}: flat_up_to's amount and up_to are in different currencies`);
    // a conversion line's flat price is settled before the iteration, which counts on a numeric minimum above it (`convertFor`)
    const min = l.min;
    if (!min || typeof min.value !== "number") {
      if (l.base === "fx") out.push(`${name}: a flat price on a conversion line needs the line's numeric minimum`);
      continue;
    }
    if (typeof f.amount.value !== "number") continue;
    if (currencyOfUnit(min.unit) !== currencyOfUnit(f.amount.unit)) out.push(`${name}: flat_up_to is in another currency than the line's minimum; a line holds one`);
    else if (f.amount.value >= min.value) out.push(`${name}: the flat price ${f.amount.value} is not below the line's minimum ${min.value}`);
    const max = l.max;
    if (l.base === "fx" && max && typeof max.value === "number" && currencyOfUnit(max.unit) !== currencyOfUnit(f.amount.unit)) out.push(`${name}: flat_up_to is in another currency than the line's maximum; a line holds one`);
  }
  return out;
}

interface GroupEntryLike {
  kind?: string;
  name_he: string;
  who_he?: string;
  ends_he?: string;
  ends_printed: boolean;
  ends_source?: unknown;
  who_short_he?: string;
  cheaper_he?: string;
  ends_short_he?: string;
  prices: { fee?: string; price_he: string; holdings_he: string; names_fund: boolean; value?: GroupValueLike; source?: { quote?: string } }[];
  current_account?: { price_he: string; for_months: number; source: { quote: string } };
}
/** The structured numbers of a group price (schema `groupPriceValue`); the check below reads them against the price's words. */
interface GroupValueLike {
  rate_pct?: number;
  per?: string;
  side?: string;
  flat?: number;
  flat_up_to?: number;
  per_share_cents?: number;
  discount_pct?: number;
  not_below_pct?: number;
  exempt?: boolean;
  min?: number;
  max?: number;
  currency?: string;
  for_months?: number;
}
interface AdvertisingLike {
  fee: string;
  verdict: string;
  claim_he: string;
  claim_source: { url: string; seen: string };
  binding_he?: string;
  binding_source: { kind: string; url: string; dated: string; checked: string };
}

/** A document's address without its page anchor or a closing slash, so two links to one document compare equal. */
const docOf = (url: string) => url.replace(/#.*$/, "").replace(/\/+$/, "");
/** The site an address belongs to: the last three labels under .co.il and the like, else the last two (campaign.ibi.co.il is ibi.co.il). */
function siteOf(url: string): string {
  try {
    const labels = new URL(url).hostname.split(".");
    return labels.slice(/\.(co|org|gov|ac|net)\.[a-z]{2}$/.test(new URL(url).hostname) ? -3 : -2).join(".");
  } catch {
    return "";
  }
}

/**
 * The advertising a record sets against its binding documents (D57): each side in its own words, and the binding side a binding
 * document of the house itself (D56: the price list, the account terms, the fee annex or a promotion's terms; never an advert).
 */
export function checkAdvertising(snap: PremiseSnapshot): string[] {
  const out: string[] = [];
  const cited = new Set([snap.tariff?.url, ...snap.lines.map((l) => l.rate?.source?.url)].filter((u): u is string => !!u).map(docOf));
  const home = snap.tariff ? siteOf(snap.tariff.url) : "";
  const seen = new Set<string>();
  for (const a of snap.advertising ?? []) {
    const at = `advertising: "${a.claim_he.slice(0, 40)}"`;
    const b = a.binding_source;
    if (a.verdict !== "not_found" && !a.binding_he) out.push(`${at}: ${a.verdict} needs the binding document's words (binding_he)`);
    if (a.verdict === "not_found" && a.binding_he) out.push(`${at}: not_found has no binding words; a document that says it makes it contradicted or offer`);
    if (docOf(b.url) === docOf(a.claim_source.url)) out.push(`${at}: the binding source is the advert's own page`);
    if (b.kind === "price_list" && !cited.has(docOf(b.url))) out.push(`${at}: a price_list that is neither the record's tariff nor a document its lines cite`);
    if (b.kind !== "price_list" && siteOf(b.url) !== home) out.push(`${at}: ${b.kind} on ${siteOf(b.url)}, not on the house's own site (${home})`);
    if (b.dated > b.checked) out.push(`${at}: the document is dated after the day it was checked`);
    if (snap.snapshot && (b.checked > snap.snapshot || a.claim_source.seen > snap.snapshot)) out.push(`${at}: read after the record's snapshot date`);
    const key = `${a.fee}|${a.claim_he}`;
    if (seen.has(key)) out.push(`${at}: the same claim twice`);
    seen.add(key);
  }
  return out;
}
/** The numbers a text holds, as values ("0.500%" and "0.5%" are one number, "150,000" is 150000). */
const numbersOf = (text: string): number[] => [...text.matchAll(/\d+(?:,\d{3})*(?:\.\d+)?/g)].map(([n]) => Number(n.replace(/,/g, "")));
/** A price comparison in the short words: "X% במקום Y%", the fee named by the last fee word before it. */
const INSTEAD = /([\d.]+)%\s*במקום\s*([\d.]+)%/g;
const feeBefore = (text: string): "custody" | "trade" => {
  const custody = text.lastIndexOf("דמי ניהול");
  const trade = Math.max(text.lastIndexOf("קנייה"), text.lastIndexOf("מכירה"), text.lastIndexOf("לפעולה"));
  return custody > trade ? "custody" : "trade";
};

/**
 * The sub-row's short words (D43): each restates its entry's long words with no new fact. Every number in the who
 * and until-when words stands in the long ones; every number in what is cheaper stands in the entry's prices, except an ordinary price
 * after "במקום", which must be a rate on a line of the same fee in this record and above the group's. Entries with the same prices
 * share their words (they are one sub-row), unless one is priced (a price carries a value) and the other not priced, and entries that
 * share words name the same fees and are all priced or all not priced, since the words are what joins them into one sub-row (
 * the key kept the two apart by prices only, and two entries of the same words were still joined). An entry that is not priced is the
 * bank's advertising (D56) or a binding document whose price is not modelled (altshuler-trade, excellence, hapoalim's students,
 * meitav-trade, pepper, yahav).
 */
export function checkGroupWords(snap: PremiseSnapshot): string[] {
  const g = snap.groups;
  if (!g || g.state !== "prices") return [];
  const out: string[] = [];
  // a priced entry and one not priced are never one sub-row, whatever their prices' words
  const valued = (e: GroupEntryLike) => e.prices.some((x) => x.value != null);
  const priceKey = (e: GroupEntryLike) => JSON.stringify([valued(e), ...e.prices.map((x) => [x.fee, x.price_he.replace(/\s+/g, " ").trim()]).sort()]);
  const feeKey = (e: GroupEntryLike) => [...new Set(e.prices.map((x) => x.fee))].sort().join();
  const byPrice = new Map<string, string | undefined>();
  const byWords = new Map<string, { fees: string; valued: boolean }>();
  for (const e of g.entries) {
    const at = `groups: ${e.name_he}`;
    if (!e.who_short_he || !e.cheaper_he || !e.ends_short_he) {
      out.push(`${at}: the sub-row needs who_short_he, cheaper_he and ends_short_he`);
      continue;
    }
    const has = (pool: string, n: number) => numbersOf(pool).includes(n);
    for (const n of numbersOf(e.who_short_he)) if (!has(`${e.name_he} ${e.who_he ?? ""}`, n)) out.push(`${at}: who_short_he's ${n} is not in name_he or who_he`);
    for (const n of numbersOf(e.ends_short_he)) if (!has(e.ends_he ?? "", n)) out.push(`${at}: ends_short_he's ${n} is not in ends_he`);
    const prices = e.prices.map((x) => x.price_he).join(" ");
    const ordinary: number[] = [];
    for (const m of e.cheaper_he.matchAll(INSTEAD)) {
      const [x, y] = [Number(m[1]), Number(m[2])];
      const base = feeBefore(e.cheaper_he.slice(0, m.index));
      if (!snap.lines.some((l) => l.base === base && l.rate?.value === y)) out.push(`${at}: cheaper_he's ${y}% is no ${base} rate in this record`);
      if (!(x < y)) out.push(`${at}: cheaper_he says ${x}% instead of ${y}%, which is not cheaper`);
      // the group's own figure belongs to a price of the same fee (a custody figure cannot stand for a trade one)
      if (!has(e.prices.filter((p) => p.fee?.startsWith(`${base}_`)).map((p) => p.price_he).join(" "), x)) out.push(`${at}: cheaper_he's ${x}% is no ${base} price of the entry`);
      ordinary.push(y);
    }
    const rest = numbersOf(e.cheaper_he);
    for (const y of ordinary) rest.splice(rest.indexOf(y), 1);
    for (const n of rest) if (!has(prices, n)) out.push(`${at}: cheaper_he's ${n} is not in the entry's prices`);
    if (/פטור/.test(e.cheaper_he) && !/פטור/.test(prices)) out.push(`${at}: cheaper_he says פטור and no price of the entry does`);
    // the line above the sub-rows puts "ל" before an other entry's words ("מחיר אחר לרופאים עצמאיים")
    if (e.kind === "other" && !/^[א-דו-ת]/.test(e.who_short_he)) out.push(`${at}: who_short_he of an other entry follows "ל", so it starts with a Hebrew letter and not with the article ה`);
    const k = priceKey(e);
    if (byPrice.has(k) && byPrice.get(k) !== e.cheaper_he) out.push(`${at}: the same prices as another entry and other words, so the two are not one sub-row`);
    byPrice.set(k, e.cheaper_he);
    const w = byWords.get(e.cheaper_he);
    if (w !== undefined && w.fees !== feeKey(e)) out.push(`${at}: shares cheaper_he with an entry that names other fees`);
    if (w !== undefined && w.valued !== valued(e)) out.push(`${at}: shares cheaper_he with an entry that is ${w.valued ? "priced" : "not priced"} and this one is ${valued(e) ? "priced" : "not priced"}, so the two would be one sub-row`);
    if (w === undefined) byWords.set(e.cheaper_he, { fees: feeKey(e), valued: valued(e) });
  }
  return out;
}
/** The months a text says: "שנתיים" is 24, "4 שנים" is 48, "שנה" or "לשנה" is 12, "6 חודשים" is 6. */
const monthsIn = (text: string): number[] => {
  const out: number[] = [];
  if (/שנתיים/.test(text)) out.push(24);
  for (const [, n] of text.matchAll(/(\d+) שנים/g)) out.push(Number(n) * 12);
  for (const [, n] of text.matchAll(/(\d+) חודשים/g)) out.push(Number(n));
  if (/(?:^|[\s,ל])שנה(?![\s]*אקדמית)(?=$|[\s,.])/.test(text)) out.push(12);
  return out;
};
const PERIOD_WORD: Record<string, RegExp> = { quarter: /רבעון/, month: /חודש/, year: /שנה|שנתי/ };
const ILS_WORD = /₪|שקל|ש״ח|ש"ח/;
const USD_WORD = /דולר|\$/;

/**
 * A group price's `value` states what the price's words state and nothing more (F-101): every number is a number of the price's
 * words or of the quote it rests on, a rate says the period the words give it, an amount's currency is the one the words print, an exemption
 * is a word of the price, and the months a price holds are the months its words say or its entry's printed end says (`ends_printed`).
 */
export function checkGroupValues(snap: PremiseSnapshot): string[] {
  const g = snap.groups;
  if (!g || g.state !== "prices") return [];
  const out: string[] = [];
  for (const e of g.entries) {
    for (const x of e.prices) {
      const v = x.value;
      if (!v) continue;
      const at = `groups: ${e.name_he} ${x.fee}`;
      const pool = [...numbersOf(x.price_he), ...numbersOf(x.source?.quote ?? "")];
      const stated: [string, number | undefined][] = [["rate_pct", v.rate_pct], ["flat", v.flat], ["flat_up_to", v.flat_up_to], ["per_share_cents", v.per_share_cents], ["discount_pct", v.discount_pct], ["not_below_pct", v.not_below_pct], ["min", v.min], ["max", v.max]];
      for (const [k, n] of stated) if (n !== undefined && !pool.some((p) => Math.abs(p - n) < 1e-9)) out.push(`${at}: value.${k} ${n} is in neither the price's words nor its quote`);
      if (v.exempt && !/פטור|0 עמלה/.test(`${x.price_he} ${x.source?.quote ?? ""}`)) out.push(`${at}: value.exempt, and the words do not say פטור`);
      const trade = x.fee?.startsWith("trade");
      if (v.rate_pct !== undefined) {
        if (trade ? v.per !== "trade" : v.per === "trade" || v.per === undefined) out.push(`${at}: value.per ${v.per} does not fit a ${trade ? "trade" : "custody"} fee`);
        const word = v.per ? PERIOD_WORD[v.per] : undefined;
        if (word && !word.test(x.price_he)) out.push(`${at}: value.per ${v.per}, and the words do not say it`);
      }
      if (v.side !== undefined) {
        const words = `${x.price_he} ${x.source?.quote ?? ""}`;
        if (!trade) out.push(`${at}: value.side belongs to a trade fee`);
        const buyWord = /קני|רכיש/.test(words);
        const sellWord = /מכיר|מכר/.test(words);
        if (v.side === "buy" ? !buyWord || sellWord : !sellWord || buyWord) out.push(`${at}: value.side ${v.side}, and the words do not name ${v.side === "buy" ? "a purchase alone" : "a sale alone"}`);
      }
      if (v.side === undefined && trade) {
        const words = `${x.price_he} ${x.source?.quote ?? ""}`;
        if (/קני|רכיש/.test(words) !== /מכיר|מכר/.test(words) && (/קני|רכיש|מכיר|מכר/.test(words))) out.push(`${at}: the words name one side of a trade alone and value.side is absent`);
      }
      if (v.flat !== undefined && !trade) out.push(`${at}: a flat price per operation belongs to a trade fee`);
      if (v.currency === "USD" && !USD_WORD.test(x.price_he)) out.push(`${at}: value.currency USD, and the words print no dollar`);
      if (v.currency === "ILS" && !ILS_WORD.test(x.price_he)) out.push(`${at}: value.currency ILS, and the words print no shekel`);
      if (v.for_months !== undefined) {
        const said = [...monthsIn(x.price_he), ...(e.ends_printed ? monthsIn(e.ends_he ?? "") : [])];
        if (!said.includes(v.for_months)) out.push(`${at}: value.for_months ${v.for_months} is neither in the price's words nor in its entry's printed end`);
      }
    }
  }
  return out;
}
export interface ByAmountSnapshot {
  lines: { base: string; band?: string | null; applies_to: string[]; level?: string }[];
  by_amount?: { venue: string; orders: string; list_only: boolean; source: { url: string; quote: string } }[];
}
/**
 * F-109, D94: a listing sold by amount rests on the house's own words. Its quote says so (fractions, "שבר", or an order by sum, "סכום"); a
 * listing has one entry; the record prices funds bought abroad, the only listings an entry names; and an entry for the recurring plan stands
 * on a record that prints the plan's conversion line (F-13), the line that tells the plan's monthly purchases apart.
 */
export function checkByAmount(snap: ByAmountSnapshot): string[] {
  const out: string[] = [];
  const entries = snap.by_amount ?? [];
  const seen = new Set<string>();
  for (const e of entries) {
    if (seen.has(e.venue)) out.push(`by_amount: ${e.venue} has two entries`);
    seen.add(e.venue);
    if (!/שבר|סכום/.test(e.source.quote)) out.push(`by_amount: the quote for ${e.venue} does not say, in the house's words, that it buys fractions or by a sum`);
    if (e.orders === "recurring_plan" && !snap.lines.some((l) => l.base === "fx" && l.band === "השקעה קבועה אוטומטית"))
      out.push(`by_amount: ${e.venue} is by amount on a recurring plan, and the record prints no recurring-plan conversion line (F-13)`);
  }
  if (entries.length > 0 && !snap.lines.some((l) => l.base === "trade" && l.applies_to.includes("foreign_securities")))
    out.push("by_amount: the record prices no fund bought abroad, the only listings an entry names");
  return out;
}

/** F-109, D94: a unit's price is the issuer's NAV from its own page, never TASE's or Maya's. */
export function checkSharePrice(rec: Pick<FundRecord, "share_price">): string[] {
  const p = rec.share_price;
  if (!p) return [];
  const out: string[] = [];
  if (!["usd", "nis", "eur"].includes(p.unit)) out.push(`share_price: unit ${p.unit} is not a currency`);
  if (/tase\.co\.il/i.test(p.source.url)) out.push(`share_price: ${p.source.url} is TASE's or Maya's; a unit's price is the issuer's NAV from its own page (D94)`);
  return out;
}

interface DiscountSnapshot {
  lines: { id: string; rate: { value?: number | null }; reverts_to?: { value?: number | null }; discount_months?: unknown; offer_he?: string; level?: string; base?: string; applies_to?: string[]; band?: string | null; not_ranked?: unknown }[];
}
/**
 * A-19 and D56: a discounted line reverts to a rate no lower than its own and says how long it lasts (`value: null` when
 * nothing is printed); an offer names the rate it is priced at, so `offer_he` needs `reverts_to`. A line the ranking leaves out
 * (`not_ranked`, D41) is a banded line, so the standard line still prices the holding.
 */
export function checkDiscountLines(snap: DiscountSnapshot): string[] {
  const out: string[] = [];
  for (const l of snap.lines) {
    if (l.not_ranked !== undefined && l.band !== "הוראת קבע" && l.band !== "השקעה קבועה אוטומטית") out.push(`${l.id}: not_ranked on a line that is not a standing-order or recurring-plan line; only those may be set aside, so the regular line still prices the holding and the page lists what it set aside (D41)`);
    if (l.offer_he !== undefined && !l.reverts_to) out.push(`${l.id}: offer_he without reverts_to; an offer is priced at the rate its binding documents allow (D56)`);
    if (!l.reverts_to) continue;
    const r = l.rate.value;
    const to = l.reverts_to.value;
    if (typeof r === "number" && typeof to === "number" && to < r) out.push(`${l.id}: reverts_to ${to} is below the discounted rate ${r}`);
    if (l.discount_months === undefined) out.push(`${l.id}: reverts_to without discount_months; a period not printed is value null (A-19)`);
  }
  // the page states one discount period for a wrapper's balance and deposit lines (the terms block, the fee page's rows): two discounted
  // list lines of the same wrapper print the same period, or the page would state one line's period for the other
  const months = (l: DiscountSnapshot["lines"][number]) => { const v = (l.discount_months as { value?: unknown } | undefined)?.value; return typeof v === "number" ? v : null; };
  const discounted = snap.lines.filter((l) => l.level === "list" && (l.base === "balance" || l.base === "deposit") && l.reverts_to && !l.offer_he && typeof l.rate.value === "number" && typeof l.reverts_to.value === "number" && l.reverts_to.value > l.rate.value);
  for (const a of discounted) for (const b of discounted) {
    if (a.base !== "balance" || b.base !== "deposit") continue;
    const shared = (a.applies_to ?? []).filter((w) => (b.applies_to ?? []).includes(w));
    if (shared.length && months(a) !== months(b)) out.push(`${a.id}, ${b.id}: the balance and deposit discounts of ${shared.join(", ")} print different periods (${months(a) ?? "none"} and ${months(b) ?? "none"} months); the page states one period for both`);
  }
  return out;
}

/** The legal caps on each provident wrapper's balance and deposit fee, from the wrappers' `fee_caps` (PF-02 to PF-06). */
export type FeeCaps = Record<string, { balance?: number; deposit?: number }>;

/** The pension wrappers are left out of the check below until D83's reach over a pension's list price is settled (separate change). */
const PENSION = new Set(["pension-comprehensive", "pension-general"]);

function readFeeCaps(files: string[], dataDir: string): FeeCaps {
  const out: FeeCaps = {};
  for (const f of files) {
    const r = relative(dataDir, f).split(/[\\/]/).join("/");
    if (!r.startsWith("instruments/wrappers/") || !r.endsWith(".json")) continue;
    const rec = parseJson(readFileSync(f, "utf8")).value as { id?: string; fee_caps?: Record<string, { value?: unknown }> } | undefined;
    if (!rec?.id || !rec.fee_caps) continue;
    const num = (k: string) => (typeof rec.fee_caps![k]?.value === "number" ? (rec.fee_caps![k]!.value as number) : undefined);
    const caps = { ...(num("balance") !== undefined ? { balance: num("balance") } : {}), ...(num("deposit") !== undefined ? { deposit: num("deposit") } : {}) };
    if (Object.keys(caps).length) out[rec.id] = caps;
  }
  return out;
}

/**
 * A-19, D83: a provident list line printed below its wrapper's legal cap is a discount the company may end, so it
 * carries `reverts_to` (or is an offer, which carries it too); without it the line would run flat for the whole run and could win the
 * site's pick (`providentPick`). Read on a provider's latest record only.
 */
export function checkLinesUnderCap(snap: DiscountSnapshot, caps: FeeCaps): string[] {
  const out: string[] = [];
  for (const l of snap.lines) {
    if (l.level !== "list" || (l.base !== "balance" && l.base !== "deposit")) continue;
    // the rate a discount reverts to is what the binding documents allow, never above the regulations' cap
    const to = l.reverts_to?.value;
    const over = typeof to === "number" ? (l.applies_to ?? []).filter((w) => caps[w]?.[l.base as "balance" | "deposit"] !== undefined && to > caps[w]![l.base as "balance" | "deposit"]! + 1e-9) : [];
    if (over.length) out.push(`${l.id}: reverts_to ${to}% is above the cap of ${over.join(", ")} (${caps[over[0]!]![l.base as "balance" | "deposit"]}%); the run never charges above the cap (PF-02 to PF-06)`);
    if (l.reverts_to) continue;
    const r = l.rate.value;
    if (typeof r !== "number") continue;
    const under = (l.applies_to ?? []).filter((w) => !PENSION.has(w) && caps[w]?.[l.base as "balance" | "deposit"] !== undefined && r < caps[w]![l.base as "balance" | "deposit"]!);
    if (under.length) out.push(`${l.id}: ${r}% is below the cap of ${under.join(", ")} (${caps[under[0]!]![l.base as "balance" | "deposit"]}%) with no reverts_to; a rate under the cap is a discount that may end (A-19, D83)`);
  }
  return out;
}

/** Before a price ranks: who pays it, on what named holding, and whether a person can do it there. */
export function checkPricePremises(snap: PremiseSnapshot): string[] {
  if (!["bank", "broker", "foreign_broker"].includes(snap.provider.class) || snap.missing) return [];
  const out: string[] = [];
  if (!snap.price_for_he) out.push("price_for_he: a bank's or broker's record says who pays its prices");
  if (!snap.left_out) out.push("left_out: a bank's or broker's record lists what its documents hold that it does not use; empty means nothing was found");
  // D64: a bank's row counts the monthly minimum of a current account there (F-102); an investment house has none, and a house that is
  // part of another is priced on that house's row
  const ca = snap.current_account;
  if (snap.provider.class === "bank" && !snap.provider.part_of && !ca) out.push("current_account: a bank's record says what its current account costs a month, from its price list (D64)");
  if ((snap.provider.class !== "bank" || snap.provider.part_of) && ca) out.push("current_account: only a bank's own record carries a current account (D64)");
  if (ca && (ca.monthly_minimum.unit !== "nis_per_month" || typeof ca.monthly_minimum.value !== "number")) out.push("current_account.monthly_minimum: a number in nis_per_month (F-102)");
  // a minimum a row counts carries the price list's own words (data-schema "current_account"); a free account read only in a browser may not
  if (ca && typeof ca.monthly_minimum.value === "number" && ca.monthly_minimum.value > 0 && !ca.monthly_minimum.source?.quote) out.push("current_account.monthly_minimum: a minimum the row counts quotes its price list (source.quote)");
  const g = snap.groups;
  if (!g) out.push("groups: a bank's or broker's record says its group prices, or that it has none, or that they could not be read");
  else {
    if (g.state === "prices" ? !g.entries.length : g.entries.length > 0) out.push(`groups: state ${g.state} does not fit its entries`);
    for (const e of g.entries) {
      if (e.ends_printed && !e.ends_source) out.push(`groups: ${e.name_he} says its end is printed and does not say where`);
      // a price reaches a fund only where the row's own words name funds (D42): the same stretch as a ranked line; words after "למעט" take funds out
      for (const x of e.prices) if (x.names_fund !== /קרן|קרנות/.test(x.holdings_he.replace(/למעט[^)]*/g, ""))) out.push(`groups: ${e.name_he}: names_fund does not fit the words "${x.holdings_he}"`);
      // F-102: a group's own current-account price is a bank's, held for the entry's printed end, and its quote says it is free
      const gca = e.current_account;
      if (gca) {
        if (!ca) out.push(`groups: ${e.name_he}: current_account on a record that prices no current account (D64)`);
        if (!e.ends_printed || !monthsIn(e.ends_he ?? "").includes(gca.for_months)) out.push(`groups: ${e.name_he}: current_account.for_months ${gca.for_months} is not the entry's printed end`);
        if (!/פטור/.test(gca.source.quote) || !/פטור/.test(gca.price_he)) out.push(`groups: ${e.name_he}: current_account is exempt, and its words and quote say "פטור"`);
        // the quote names the minimum itself: a free teller action is not a free minimum (D56)
        if (!/מינימום/.test(gca.source.quote)) out.push(`groups: ${e.name_he}: current_account's quote does not name the minimum ("מינימום"); an exemption read from other rows is not recorded (D56)`);
      }
    }
    out.push(...checkGroupWords(snap));
    out.push(...checkGroupValues(snap));
  }
  out.push(...checkAdvertising(snap));
  out.push(...checkFlatPrices(snap));
  const entries = snap.availability ?? [];
  if (snap.lines.some((l) => l.base === "trade" && l.applies_to.some((c) => c === "all" || c === "brokerage-account")))
    out.push("lines: a trade line names every holding or the account, which no availability entry can vouch for; name the kinds");
  for (const c of Object.keys(NAMES_CLASS)) {
    if (!snap.lines.some((l) => l.base === "trade" && l.applies_to.includes(c))) continue;
    if (!entries.some((a) => a.applies_to.includes(c))) out.push(`availability: ${c} has a price and no entry saying a person can do it there`);
  }
  for (const a of entries) {
    if (a.available === "unknown" && !a.reason_he) out.push(`availability: ${a.applies_to.join(", ")} is unknown and gives no reason_he for the row`);
    // "by phone only" is said of a kind a person can buy there, in the house's words; its exchanges only for a fund bought abroad
    const phone = a.phone_only;
    if (phone) {
      if (a.available !== true) out.push(`availability: ${a.applies_to.join(", ")} is bought by phone only, on an entry that does not say it can be bought`);
      if (phone.venues && !(a.applies_to.length === 1 && a.applies_to[0] === "foreign_securities"))
        out.push(`availability: phone_only.venues names exchanges, which only a fund bought abroad has; give foreign_securities an entry of its own`);
      if (!/טלפון|טלפוני/.test(phone.source.quote)) out.push(`availability: phone_only's quote for ${a.applies_to.join(", ")} does not say "by phone" in the house's words`);
    }
    if (a.available !== true) continue;
    for (const c of a.applies_to) {
      const words = NAMES_CLASS[c];
      // what the words exclude does not count as naming it ("למעט קרנות נאמנות")
      if (words && !words.test((a.source.quote ?? "").replace(/למעט[^,.]*/g, ""))) out.push(`availability: the quote for ${c} does not name it in the document's words`);
    }
  }
  return out;
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
    title: string;
    strength: string;
    kind: string;
    page?: number;
    anchor?: string;
    checked: string;
    publisher_he?: string;
    title_he?: string;
  }[];
  sources_missing_reason?: string;
  derived_from?: string[];
  examples?: string[];
  scope?: string;
  scope_institutions?: { id: string; name_he: string }[];
  scope_settle?: string;
}

const STRENGTH_RANK: Record<string, number> = { primary: 2, institution: 1, secondary: 0 };
/**
 * Copies kept on an official host, named by path because the rest of the host is official:
 * National Insurance's Laws1 folder holds its own consolidated copies of laws and regulations it does not publish
 * (the Income Tax Ordinance, the 2002 and 2005 withholding regulations, its own law), while its other pages are the
 * regulator's. A copy is a lead; the official text is the Tax Authority's (gov.il) or Reshumot and the Knesset.
 */
const COPY_PATHS = ["btl.gov.il/Laws1/"];

export function isCopyPath(url: string): boolean {
  try {
    const u = new URL(url);
    const at = u.host.replace(/^www\./, "") + u.pathname;
    return COPY_PATHS.some((p) => at.toLowerCase().startsWith(p.toLowerCase()));
  } catch {
    return false;
  }
}

/**
 * Hosts that only copy official texts (glossary sweep): Wikisource, Nevo, Olaw, Capitax and Funder's file host. A
 * source on one of them is a copy whatever strength it was given, so it fails: a copy is a lead, never a source (CLAUDE.md).
 */
const COPY_HOSTS = ["he.wikisource.org", "nevo.co.il", "olaw.org.il", "olaw.co.il", "capitax.co.il", "funder.co.il"];

/** A copy's address: a copy-only host (or a subdomain of one) or a copy folder on an official host (COPY_PATHS). */
export function isCopySource(url: string): boolean {
  const host = hostOf(url).toLowerCase();
  return COPY_HOSTS.some((h) => host === h || host.endsWith(`.${h}`)) || isCopyPath(url);
}

/**
 * The publishers a `primary` source may sit on: the State's own sites (every
 * gov.il host: gov.il, the Knesset, Reshumot and the Ministry of Justice's services, the Tax Authority, the Capital Market Authority,
 * the Securities Authority, National Insurance outside its Laws1 copies), the Bank of Israel, the Tel Aviv Stock Exchange (its own
 * rules, guidelines and lists; an issuer's filing on Maya is the issuer's, isIssuerFiling), the SEC (for an issuer's own filings there), the United States Code as
 * the House's Office of the Law Revision Counsel publishes it and the federal regulations as the Office of the Federal Register publishes
 * them (the eCFR), and foreign regulators and statutory bodies; for the notes on other countries (data/abroad/, D114) the governments' own
 * sites of Britain (GOV.UK) and France (Service-Public.fr, under both its hosts), Italy's tax authority, and Normattiva, the Italian
 * state's portal of the law in force. A source elsewhere marked `primary` is a copy or a company's paper given a strength it does not have, and fails.
 */
const OFFICIAL_HOSTS = ["gov.il", "boi.org.il", "tase.co.il", "sec.gov", "irs.gov", "uscode.house.gov", "ecfr.gov", "europa.eu", "revenue.ie", "ccpc.ie", "sipc.org", "gov.uk", "service-public.fr", "service-public.gouv.fr", "agenziaentrate.gov.it", "normattiva.it"];
/**
 * A company's own document is marked `institution` (data-schema 3.1), never `primary`, so it is not caught here. The one kind kept
 * `primary` off those hosts is the defining text of a publisher's own index or numbering standard, cited for that index or standard:
 * the index providers' methodologies and ANNA's ISIN pages.
 */
const OWN_STANDARD_HOSTS = ["spglobal.com", "msci.com", "indexes.nasdaqomx.com", "anna-web.org"];
const onHost = (host: string, list: readonly string[]) => list.some((h) => host === h || host.endsWith(`.${h}`));

/**
 * An issuer's filing on Maya, the exchange's disclosure system: a report, prospectus or notice that a
 * company files about itself, served from mayafiles.tase.co.il or under maya.tase.co.il's reports. The host is the exchange's, the
 * paper is the company's, so it is `institution` (data-schema 3.1), never `primary`; the exchange's own lists on Maya (its fund list)
 * and its rules and guidelines on content.tase.co.il stay primary.
 */
export function isIssuerFiling(url: string): boolean {
  try {
    const u = new URL(url);
    const host = u.host.toLowerCase().replace(/^www\./, "");
    if (host === "mayafiles.tase.co.il") return true;
    return host === "maya.tase.co.il" && /^\/(?:(?:he|en)\/)?(?:reports|rpdf)(?:\/|$)/i.test(u.pathname);
  } catch {
    return false;
  }
}

/**
 * A `primary` source whose address is on no official publisher's host (OFFICIAL_HOSTS, OWN_STANDARD_HOSTS), or an issuer's filing on
 * the exchange's host (isIssuerFiling); a copy is caught apart.
 */
export function isUnlistedPrimary(url: string, strength: string): boolean {
  if (strength !== "primary" || !/^https?:\/\//.test(url) || isCopySource(url)) return false;
  if (isIssuerFiling(url)) return true;
  const host = hostOf(url).toLowerCase();
  return !onHost(host, OFFICIAL_HOSTS) && !onHost(host, OWN_STANDARD_HOSTS);
}

function hostOf(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * The words by which a bank's table or terms date an exit point: "בתום 3 שנים", "מתום שנתיים", "לאחר 36 חודשים", "מ 25 חודש", "בתום שנה
 * וחצי", beside the word for an exit point in Hebrew or in the collector's English ("exit points 'לאחר 120 חודשים וכל 12 חודשים
 * בהמשך'"). A number counts only with its unit, so an amount ("החל מ-1000 ₪") is no date.
 */
const EXIT_UNIT = "(?:חודש(?:ים|יים)?|שנה|שנים|שנתיים|שבוע(?:ות|יים)?|יום|ימים)";
const EXIT_WHEN = `(?:בתום|מתום|לאחר|אחרי|כעבור|החל מ|מ)[\\s־-]*(?:ה[\\s־-]*)?(?:\\d+\\s*${EXIT_UNIT}|חצי שנה|שנה|שנתיים|חודש|חודשיים|שבוע|(?:שלוש|ארבע|חמש|שש|שבע|שמונה|תשע|עשר)\\s+שנים)`;
const PRINTS_FIRST_EXIT = new RegExp(`(?:תחנ\\S*|יציאה|exit (?:points?|stations?))[^.]{0,60}?${EXIT_WHEN}|${EXIT_WHEN}[^.]{0,40}?תחנ`, "i");

/**
 * A deposit with exit points whose record gives no first one (`exit_points.first_after_months` null: the bank prints only how often
 * they come) must not itself quote the bank dating the first: "תחנות יציאה בתום 5 שנים, ואחר כך כל שנה" beside a null first leaves
 * the site saying "כל 12 חודשים" of a plan that lets nothing out for five years. On 2026-11-12, 48 records carry a first and the
 * text of each is caught by this pattern when its first is taken away; no record with a null first is. The pattern is a net for the
 * usual wording, no proof. It errs toward a false alarm, which is loud: a lone "מ" before a unit counts ("מחודש"), and so does "בתום
 * שנה" said of the term's end near the word for exit points. It does not see an abbreviated unit ("12 ח׳"), a date with no
 * preposition, or a first written only in English. Returns one line when the record's own text dates an exit point and the first is
 * null.
 */
export function checkFirstExitPoint(record: unknown): string[] {
  const e = (record as { exit_points?: { exists?: boolean; first_after_months?: number | null } }).exit_points;
  if (!e?.exists || typeof e.first_after_months === "number") return [];
  const found = PRINTS_FIRST_EXIT.exec(JSON.stringify(record));
  return found ? [`exit_points.first_after_months: null, but the record's own text dates an exit point ("${found[0].slice(0, 80)}"); give the months to the first one`] : [];
}

/**
 * A cited page is the page of the file, the one the link opens (2026-11-12, the founder: a link opens the page it cites). The site
 * opens a PDF at the address's own `#page=` and, when the address has none, at `page` (site/app/lib/sources.ts `sourceHref`), so a
 * record whose address says one page and whose `page` says another sends the reader to a page the words are not on, and a `page`
 * past the file's last page (a gazette's printed number) opens nowhere. Returns one line per such source, with its path in the record.
 */
export function checkCitedPages(record: unknown, filePages?: Map<string, number>): string[] {
  const out: string[] = [];
  const walk = (node: unknown, at: string): void => {
    if (Array.isArray(node)) return node.forEach((x, i) => walk(x, `${at}[${i}]`));
    if (!node || typeof node !== "object") return;
    const o = node as Record<string, unknown>;
    if (typeof o.url === "string" && typeof o.page === "number" && Number.isInteger(o.page)) {
      const inUrl = /#page=(\d+)/.exec(o.url);
      const opens = inUrl ? Number(inUrl[1]) : o.page;
      if (inUrl && opens !== o.page) out.push(`${at}: the link opens page ${opens} but the page cited is ${o.page}; a page is the file's page, and the address's #page= carries the same one`);
      const last = filePages?.get(o.url.replace(/#.*$/, ""));
      if (last !== undefined && opens > last) out.push(`${at}: the link opens page ${opens}, past the file's last page (${last}); write the file's page, and a printed number in the locator ("file p.3 (gazette p.375)")`);
    }
    for (const [k, v] of Object.entries(o)) walk(v, at ? `${at}.${k}` : k);
  };
  walk(record, "");
  return out;
}

function isPdfUrl(url: string): boolean {
  try {
    const u = new URL(url);
    // the Reshumot gazette service serves PDFs at a document key with no `.pdf`
    return /\.pdf$/i.test(u.pathname) || u.pathname.includes("BlobFolder") || (u.host === "free-justice.openapi.gov.il" && u.pathname.includes("/Documents/")) || (u.host === "api.justice.gov.il" && u.pathname === "/reshumot/resolver");
  } catch {
    return false;
  }
}

/** Every record of data/rules/ by id (those that parse). */
/**
 * A product value left unknown (`value: null`) whose rules were checked again after it was: the research may have
 * answered it since (child savings' switch tax stayed "unknown" two weeks after TXK-23 settled it).
 * A warning, listed by file and field, so each is re-read against today's rule base.
 */
export function staleUnknowns(record: unknown, rules: Map<string, RuleLike>): string[] {
  const out: string[] = [];
  const latest = (r: RuleLike) => [r.checked, ...(r.sources ?? []).map((s) => (s as { checked?: string }).checked ?? "")].reduce((a, b) => (b > a ? b : a), "");
  const walk = (node: unknown, path: string) => {
    if (Array.isArray(node)) return node.forEach((v, i) => walk(v, `${path}[${i}]`));
    if (!node || typeof node !== "object") return;
    const v = node as { value?: unknown; checked?: string; rule_ids?: string[] };
    if ("value" in v && v.value === null && typeof v.checked === "string" && Array.isArray(v.rule_ids)) {
      const newer = v.rule_ids.filter((id) => { const r = rules.get(id); return r !== undefined && latest(r) > v.checked!; });
      if (newer.length) out.push(`${path.slice(1)} (${newer.join(", ")})`);
    }
    // a fee cap of null means "no cap" (the guide prints it so), not unknown
    for (const [k, child] of Object.entries(node)) if (k !== "fee_caps") walk(child, `${path}.${k}`);
  };
  walk(record, "");
  return out;
}

/**
 * CLAUDE.md "General sources first": cite only official publications. A source whose strength
 * is `secondary`, whose host data/sources/publishers.json calls an `article`, or whose address is a
 * copy (COPY_HOSTS such as Wikisource, Nevo and Olaw, or COPY_PATHS: National Insurance's Laws1 folder), or that is marked
 * `primary` on a host no official publisher uses (isUnlistedPrimary), fails, unless it is
 * a leftover named in unofficial-leftovers.json (`<file> <url>`). The list only shrinks: a leftover that is gone fails
 * too, so it is struck when its source is replaced. A blog, forum, press article or copy is a lead, recorded in notes.
 */
export function unofficialSources(record: unknown, articleHosts: Set<string>): string[] {
  const out: string[] = [];
  const walk = (node: unknown) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!node || typeof node !== "object") return;
    const v = node as { url?: unknown; strength?: unknown };
    if (typeof v.url === "string" && typeof v.strength === "string" && (v.strength === "secondary" || articleHosts.has(hostOf(v.url)) || isCopySource(v.url) || isUnlistedPrimary(v.url, v.strength))) out.push(v.url);
    Object.values(node).forEach(walk);
  };
  walk(record);
  return [...new Set(out)];
}

function checkUnofficialSources(files: string[], dataDir: string, report: (file: string, message: string) => void): void {
  const pubPath = join(dataDir, "sources", "publishers.json");
  const pubs = existsSync(pubPath) ? (parseJson(readFileSync(pubPath, "utf8")).value as Record<string, { kind?: string }>) : {};
  const articleHosts = new Set(Object.entries(pubs).filter(([, p]) => p.kind === "article").map(([h]) => h));
  const leftovers = new Set<string>(JSON.parse(readFileSync(new URL("./unofficial-leftovers.json", import.meta.url), "utf8")) as string[]);
  const seen = new Set<string>();
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    const rel = relative(dataDir, f).split(/[\\/]/).join("/");
    if (rel.startsWith("sources/")) continue;
    for (const url of unofficialSources(parseJson(readFileSync(f, "utf8")).value, articleHosts)) {
      const key = `${rel} ${url}`;
      seen.add(key);
      if (leftovers.has(key)) continue;
      if (isIssuerFiling(url)) report(f, `cites ${url} as primary, but it is an issuer's filing on Maya, the company's own paper: mark it institution, or cite the law, regulation or exchange rule`);
      else report(f, `cites ${url}, which is not an official publication: cite the official text, and keep this one as a lead in notes`);
    }
  }
  // a leftover whose file is scanned here and no longer cites it is struck; a fixture directory without the file is left alone
  const scanned = new Set(files.map((f) => relative(dataDir, f).split(/[\\/]/).join("/")));
  for (const key of leftovers) {
    const file = key.slice(0, key.indexOf(" "));
    if (scanned.has(file) && !seen.has(key)) report(join(dataDir, file), `unofficial-leftovers.json still lists "${key}", which is gone: strike it (the list only shrinks)`);
  }
}

function checkStaleUnknowns(files: string[], dataDir: string, rules: Map<string, RuleLike>, warn: (category: string, id: string) => void): void {
  for (const file of files) {
    const rel = relative(dataDir, file);
    if (!rel.startsWith("instruments") || !file.endsWith(".json")) continue;
    const name = rel.split(/[\\/]/).pop()!.replace(/\.json$/, "");
    for (const at of staleUnknowns(parseJson(readFileSync(file, "utf8")).value, rules)) warn("value left unknown, its rules checked since", `${name}:${at}`);
  }
}

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
 * data-schema §3.16: the sources of a note on other countries whose text is no longer in force on `today` (`superseded.from` reached), as
 * `<guide>:<country>.<fact> -> <the text that carries it now>`. A warning: the fact may still hold, but its source must move.
 */
export function supersededAbroad(record: AbroadRecord, today: string): string[] {
  const out: string[] = [];
  for (const c of record.countries) {
    if (!c.found) continue;
    const cited: [string, AbroadSource][] = [...(c.who ? [["who", c.who.source] as [string, AbroadSource]] : []), ...Object.entries(c.facts).map(([k, f]): [string, AbroadSource] => [k, f.source])];
    for (const [key, s] of cited) if (s.superseded && s.superseded.from <= today) out.push(`${record.id}:${c.country}.${key} -> ${s.superseded.by}`);
  }
  return out;
}

/**
 * Rule sources (docs/data-schema.md §3.1, §4). Failures are returned; the dated and drift checks go to `warn`.
 * A rule with neither `sources` nor `sources_missing_reason` is a failure once any record of the data directory has
 * them (the extraction is committed), and a warning before that.
 */
function checkRuleSources(rule: RuleLike, ctx: ValidationContext, all: Map<string, RuleLike>, warn: (category: string, id: string) => void): string[] {
  const out: string[] = [];
  const today = ctx.today ?? israelToday();
  const extractionLanded = [...all.values()].some((r) => r.sources !== undefined || r.sources_missing_reason !== undefined);
  const sources = rule.sources ?? [];
  if (sources.length === 0 && !rule.sources_missing_reason) {
    if (extractionLanded) out.push("rule has neither sources nor sources_missing_reason (data-schema §3.1)");
    else warn("rules with neither sources nor sources_missing_reason (extraction not run)", rule.id);
  }
  const block = ctx.ruleBase.blocks?.get(rule.id);
  for (const [at, title] of titlesOf({ sources: rule.sources, figures: rule.figures })) for (const m of checkTitleBrackets(title)) out.push(`${at.slice(1)}: ${m}`);
  // the rule base is its owners' to fix: a broken name in its source line is said, and the record's title is held to the document
  if (block) for (const m of block.body.matchAll(/^- Source: (.*)$/gm)) for (const link of m[1]!.matchAll(/\[([^\]]+)\]\(/g)) if (checkTitleBrackets(link[1]!).length) warn("rule base source line quotes a broken fund name", rule.id);
  sources.forEach((s, i) => {
    const at = `sources[${i}]`;
    if (s.page !== undefined && !isPdfUrl(s.url)) out.push(`${at}: page is only for a PDF URL`);
    if (s.anchor !== undefined && isPdfUrl(s.url)) out.push(`${at}: anchor is only for an HTML URL`);
    if (block && !urlInBlock(s.url, block)) out.push(`${at}: ${s.url} is not in the markdown block of ${rule.id}`);
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
  for (const id of rule.examples ?? []) {
    if (!all.has(id)) out.push(`examples: ${id} has no record under data/rules/`);
  }
  if (rule.recheck_date && rule.recheck_date < today) warn("recheck_date has passed", rule.id);
  const years = taxYears(rule.figures);
  if (years.length > 0 && Math.max(...years) < Number(today.slice(0, 4))) warn("figures are behind the current tax year", rule.id);
  return out;
}

/** P-09 (`data/parameters/pinned-rules.json`): its ids exist, and a row's first rule has a primary source. */
function checkPinnedRules(files: string[], dataDir: string, all: Map<string, RuleLike>, report: (file: string, message: string) => void) {
  const file = files.find((f) => relative(dataDir, f).replace(/\\/g, "/") === "parameters/pinned-rules.json");
  if (!file) return;
  const rec = parseJson(readFileSync(file, "utf8")).value as { rows?: { ids?: string[]; answer_he?: string }[]; facts?: { id?: string; text_he?: string }[]; guide_blocks?: Record<string, string[]> } | undefined;
  if (!rec) return;
  const ids = [...(rec.rows ?? []).flatMap((r) => r.ids ?? []), ...Object.values(rec.guide_blocks ?? {}).flat()];
  for (const id of new Set(ids)) if (!all.has(id)) report(file, `pinned-rules: ${id} has no record under data/rules/`);
  // the "הידעת?" block: each fact rests on one general rule with a primary source, once; no digit typed by hand, every figure a slot over that rule
  const factIds = new Set<string>();
  for (const fact of rec.facts ?? []) {
    const id = fact.id ?? "";
    if (factIds.has(id)) report(file, `pinned-rules: fact ${id} appears twice`);
    factIds.add(id);
    const rule = all.get(id) as (RuleLike & { scope?: string; figures?: Record<string, unknown> }) | undefined;
    if (!rule) {
      report(file, `pinned-rules: fact ${id} has no record under data/rules/`);
      continue;
    }
    if (rule.scope !== "general") report(file, `pinned-rules: fact ${id} rests on a company's term, which is never a fact in general`);
    if (rule.sources && !rule.sources.some((s) => s.strength === "primary")) report(file, `pinned-rules: fact ${id} has no primary source`);
    const text = fact.text_he ?? "";
    if (text.length > 200) report(file, `pinned-rules: fact ${id} is ${text.length} characters; the block's cards hold 200`);
    if (/\d/.test(text.replace(/\{[A-Z0-9-]+:[a-z0-9_]+\}/g, ""))) report(file, `pinned-rules: fact ${id} carries a typed digit; use a {ID:figure} slot`);
    for (const m of text.matchAll(/\{([A-Z0-9-]+):([a-z0-9_]+)\}/g)) {
      const [, slotId, figure] = m as unknown as [string, string, string];
      if (slotId !== id) report(file, `pinned-rules: fact ${id} has a slot of another rule ({${slotId}:${figure}})`);
      else if (!(figure in (rule.figures ?? {}))) report(file, `pinned-rules: fact ${id} names a figure the rule does not have (${figure})`);
    }
  }
  for (const row of rec.rows ?? []) {
    const first = row.ids?.[0];
    const rule = first ? all.get(first) : undefined;
    if (rule?.sources && !rule.sources.some((s) => s.strength === "primary"))
      report(file, `pinned-rules: the first rule of a row (${first}) has no primary source`);
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

/** P-10 (`data/parameters/home-guide-door.json`): every product id it names has a record under data/instruments/wrappers/ or securities/, once. */
function checkHomeGuideDoor(files: string[], dataDir: string, report: (file: string, message: string) => void) {
  const at = (f: string) => relative(dataDir, f).replace(/\\/g, "/");
  const file = files.find((f) => at(f) === "parameters/home-guide-door.json");
  if (!file) return;
  const rec = parseJson(readFileSync(file, "utf8")).value as { wrappers?: unknown } | undefined;
  if (!Array.isArray(rec?.wrappers) || rec.wrappers.length === 0) return report(file, "home-guide-door: `wrappers` must be a non-empty list of wrapper ids");
  const known = new Set(files.filter((f) => (at(f).startsWith("instruments/wrappers/") || at(f).startsWith("instruments/securities/")) && f.endsWith(".json")).map((f) => (parseJson(readFileSync(f, "utf8")).value as { id?: string } | undefined)?.id));
  const seen = new Set<string>();
  for (const id of rec.wrappers as string[]) {
    if (!known.has(id)) report(file, `home-guide-door: ${id} has no record under data/instruments/wrappers/ or securities/`);
    if (seen.has(id)) report(file, `home-guide-door: ${id} is listed twice`);
    seen.add(id);
  }
}

/**
 * P-11 (`data/parameters/deposit-amounts.json`): the deposits page's amounts are whole shekels, rising, and P-05's amount now is one of
 * them, since the page starts there (F-108).
 */
function checkDepositAmounts(files: string[], dataDir: string, report: (file: string, message: string) => void) {
  const at = (f: string) => relative(dataDir, f).replace(/\\/g, "/");
  const file = files.find((f) => at(f) === "parameters/deposit-amounts.json");
  if (!file) return;
  const rec = parseJson(readFileSync(file, "utf8")).value as { steps?: { value?: unknown; unit?: unknown }[] } | undefined;
  const steps = rec?.steps;
  if (!Array.isArray(steps) || steps.length === 0) return report(file, "deposit-amounts: `steps` must be a non-empty list of value objects in NIS");
  const values = steps.map((s) => s?.value);
  steps.forEach((s, i) => {
    if (s?.unit !== "nis" || typeof s.value !== "number" || !Number.isInteger(s.value) || s.value <= 0) report(file, `deposit-amounts: step ${i} must be a whole positive number of NIS`);
    else if (i > 0 && typeof values[i - 1] === "number" && s.value <= (values[i - 1] as number)) report(file, `deposit-amounts: step ${i} (${s.value}) must be above the one before it`);
  });
  const p05 = files.find((f) => at(f) === "parameters/illustrative-scenario.json");
  const start = p05 ? (parseJson(readFileSync(p05, "utf8")).value as { inputs?: { amount_now?: { value?: unknown } } } | undefined)?.inputs?.amount_now?.value : undefined;
  if (typeof start !== "number" || !values.includes(start)) report(file, `deposit-amounts: P-05's amount now (${String(start)}) must be one of the steps, since the deposits page starts there`);
}

/**
 * Glossary records that share a Hebrew name (data-schema §4 item 16). A page keys its term cards by the Hebrew name, so
 * where two records of one name both belong to a page (a shared wrapper or exposure id) one wins silently, and two records of "קרן
 * מחקה" said opposite things. Two records of one name may stand only for different products; the pairs below are the leftovers,
 * each as "<id> <id>" in file order, and the list only shrinks.
 */
export const TERM_NAME_LEFTOVERS: readonly string[] = [];
function checkTermNames(files: string[], dataDir: string, report: (file: string, message: string) => void) {
  const at = (f: string) => relative(dataDir, f).replace(/\\/g, "/");
  const terms = files
    .filter((f) => /^terms\/[^/]+\.json$/.test(at(f)))
    .sort()
    .map((f) => ({ file: f, rec: parseJson(readFileSync(f, "utf8")).value as { id?: string; he?: string; wrapper_ids?: string[]; exposure_ids?: string[] } | undefined }))
    .filter((t): t is { file: string; rec: { id: string; he: string; wrapper_ids?: string[]; exposure_ids?: string[] } } => typeof t.rec?.id === "string" && typeof t.rec.he === "string");
  const used = new Set<string>();
  for (let i = 0; i < terms.length; i++) {
    for (let j = i + 1; j < terms.length; j++) {
      const a = terms[i]!.rec;
      const b = terms[j]!.rec;
      if (a.he !== b.he) continue;
      const pages = [...(a.wrapper_ids ?? []).filter((x) => b.wrapper_ids?.includes(x)), ...(a.exposure_ids ?? []).filter((x) => b.exposure_ids?.includes(x))];
      if (pages.length === 0) continue;
      const pair = `${a.id} ${b.id}`;
      if (TERM_NAME_LEFTOVERS.includes(pair)) {
        used.add(pair);
        continue;
      }
      report(terms[j]!.file, `terms: "${b.he}" has two records on the same pages (${pages.join(", ")}): ${a.id} and ${b.id}; a page shows only one, so merge them or give each its own products`);
    }
  }
  if (terms.length > 0) for (const pair of TERM_NAME_LEFTOVERS) if (!used.has(pair)) report(join(dataDir, "terms"), `terms: the leftover pair "${pair}" no longer shares a page; take it off TERM_NAME_LEFTOVERS (the list only shrinks)`);
}

/**
 * data-schema §3.15 and §4 item 13: `data/open-questions.json` against the rule base, and every question the repository names.
 * Fails: a struck item left in a rule base's open questions (an answered question is deleted once its answer is in a rule);
 * a code (`TXI OQ19`, `TXI-OQ19`) in any text of data/ or of `ctx.citing`, or a question a rule-base file names in words
 * ("open question 7"), that is not a question of the rule base; a guide record that marks a dimension a bare `blocked`, or blocks one
 * on a question its `open_questions` does not list. Warns when the file is behind the markdown (an id missing or extra).
 */
function checkOpenQuestions(files: string[], ctx: ValidationContext, report: (file: string, message: string) => void, warn: (category: string, id: string) => void) {
  const refsDir = join(ctx.dataDir, "..", ".claude/skills/il-finance/references");
  for (const q of ctx.ruleBase.questions ?? [])
    if (q.struck) report(join(refsDir, q.file), `${q.id} is struck: an answered question is deleted once its answer is in a rule (its number is never used again); delete it`);
  const known = (code: string) => ctx.ruleBase.openQuestions.has(code.replace(" OQ", "-OQ")) || (ctx.ruleBase.questions?.some((q) => q.id === code) ?? false);
  const missing = (code: string) => `${code} is not a question of the rule base (an answered question is deleted): cite the rule that answered it, or drop the citation`;
  for (const f of files) {
    const rel = relative(ctx.dataDir, f).split(/[\\/]/).join("/");
    if (rel === "open-questions.json" || !f.endsWith(".json")) continue;
    const text = readFileSync(f, "utf8");
    for (const code of new Set(questionCodesIn(text))) if (!known(code)) report(f, missing(code));
  }
  for (const f of ctx.citing?.files ?? []) {
    const text = readFileSync(f, "utf8");
    const own = ctx.citing!.prefixOf.get(f.split(/[\\/]/).pop()!);
    const codes = [...questionCodesIn(text), ...(own ? questionWordsIn(text, own, ctx.citing!.prefixOf) : [])];
    for (const code of new Set(codes)) if (!known(code)) report(f, missing(code));
  }
  const file = files.find((f) => relative(ctx.dataDir, f) === "open-questions.json");
  if (!file) return;
  const list = parseJson(readFileSync(file, "utf8")).value as OpenQuestionEntry[] | undefined;
  if (!Array.isArray(list)) return;
  const byId = new Map(list.map((q) => [q.id, q]));
  const behind = "data/open-questions.json is behind the rule base (npm run gen:open-questions -w @finance-tool/pipeline)";
  if (ctx.ruleBase.questions) {
    const md = new Set(ctx.ruleBase.questions.map((q) => q.id));
    for (const q of ctx.ruleBase.questions) if (!byId.has(q.id)) warn(behind, `${q.id} missing`);
    for (const q of list) if (!md.has(q.id)) warn(behind, `${q.id} not in the markdown`);
  }
  for (const f of files) {
    if (!relative(ctx.dataDir, f).split(/[\\/]/).join("/").startsWith("instruments/") || !f.endsWith(".json")) continue;
    const rec = parseJson(readFileSync(f, "utf8")).value;
    const marks = ((rec as { dimensions?: unknown } | undefined)?.dimensions ?? {}) as Record<string, unknown>;
    const oq = (rec as { open_questions?: unknown } | undefined)?.open_questions;
    const listed = new Set(Array.isArray(oq) ? oq.filter((x): x is string => typeof x === "string") : []);
    for (const [dim, mark] of Object.entries(marks)) {
      // a blocked mark names the question that blocks it, and the record lists that question (two
      // records marked loss offset a bare "blocked" with no question opened, and a page showed "חסום" with nothing to open)
      if (mark === "blocked" || mark === "blocked:") report(f, `dimensions.${dim}: a bare "blocked" names no open question; open one in il-finance and mark blocked:<id>`);
      else if (typeof mark === "string" && mark.startsWith("blocked:") && !listed.has(mark.slice("blocked:".length)))
        report(f, `dimensions.${dim}: ${mark.slice("blocked:".length)} blocks it but is not in the record's open_questions`);
    }
    // a dimension still marked open while the record's own value for it is known (child savings)
    const switchKnown = (rec as { switch_is_tax_event?: { value?: unknown } } | undefined)?.switch_is_tax_event?.value;
    const sw = marks["switching-tax-event"];
    if (switchKnown !== undefined && switchKnown !== null && typeof sw === "string" && sw.startsWith("blocked:"))
      report(f, `dimensions.switching-tax-event is ${sw} but switch_is_tax_event is known (${String(switchKnown)}); mark it covered`);
  }
}

/** data-schema §3.8: observations sorted by date (then key) and no two with the same date and key. */
export function checkSeries(record: SeriesRecord): string[] {
  const out: string[] = [];
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
 * data-schema §3.14: the file name `<list>@<snapshot>.json` matches the content, and a fund number appears once.
 * Fund lists are not fund records: exposure `variants` resolve against data/funds/ only (readFundIds).
 */
export function checkFundList(file: FundListFile, fileName: string): string[] {
  const out: string[] = [];
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
      if (!productId.safeParse(wrapper).success) report(file, `${at}: ${wrapper} is not a wrapper or security id`);
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
  // a security's `held_in` rules (where it is held) can cover a dimension, but a dimension only they carry need not be marked:
  // the wrapper's own dimensions are that wrapper's record's
  const { held_in: _heldIn, ...own } = record;
  const dimsOf = (ids: Iterable<string>) => {
    const union = new Set<string>();
    for (const id of ids) {
      const dims = ruleDimensions.get(id);
      if (!dims) {
        out.push(`rule ${id} is cited but has no record under data/rules/`);
        continue;
      }
      dims.forEach((d) => union.add(d));
    }
    return union;
  };
  const ownUnion = dimsOf(new Set(collectStrings(own, "rule_ids")));
  const heldUnion = _heldIn ? dimsOf(new Set(collectStrings(_heldIn, "rule_ids"))) : new Set<string>();
  const marks = (record.dimensions ?? {}) as Record<string, string>;
  for (const [dim, mark] of Object.entries(marks)) {
    if (mark === "covered" && !ownUnion.has(dim) && !heldUnion.has(dim)) out.push(`dimensions.${dim}: marked covered, but no cited rule carries it (§4 item 9)`);
    if (mark.startsWith("blocked:") && !ruleBase.openQuestions.has(mark.slice("blocked:".length)))
      out.push(`dimensions.${dim}: ${mark.slice("blocked:".length)} is not an open question in il-finance`);
  }
  for (const dim of ownUnion) {
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
