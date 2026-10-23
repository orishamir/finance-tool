// The validator: docs/data-schema.md §4 and docs/architecture.md 3.2. It fails; it never warns and continues.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { z } from "zod";
import {
  catalogEntry,
  changelogLine,
  cmaPeriodFile,
  depositTerms,
  dimensionRecord,
  exposureRecord,
  feesSnapshot,
  fundRecord,
  parameterRecord,
  ruleRecord,
  seriesRecord,
  termRecord,
  wrapperId,
  wrapperRecord,
  type SeriesRecord,
} from "@finance-tool/schema";
import type { RuleBaseIds } from "./references.ts";

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
  "terms/deposits": depositTerms,
  terms: termRecord,
  dimensions: dimensionRecord,
  catalog: catalogEntry,
  series: seriesRecord,
};

export interface ValidationContext {
  dataDir: string;
  ruleBase: RuleBaseIds;
  formulas: Set<string>;
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

  for (const file of files) {
    const rel = relative(ctx.dataDir, file);
    if (rel === ".gitkeep") continue;

    if (rel === "changelog.jsonl") {
      readFileSync(file, "utf8")
        .split("\n")
        .forEach((line, i) => {
          if (line.trim() === "") return;
          const parsed = parseJson(line);
          if (parsed.error) return report(file, `line ${i + 1}: ${parsed.error}`);
          const result = changelogLine.safeParse(parsed.value);
          if (!result.success) report(file, `line ${i + 1}: ${formatIssues(result.error)}`);
        });
      continue;
    }

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
    if (collection === "series" && result.success) {
      for (const message of checkSeries(parsed.value as SeriesRecord)) report(file, message);
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
  return problems;
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
