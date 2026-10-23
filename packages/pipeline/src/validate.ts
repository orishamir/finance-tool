// The validator: docs/data-schema.md §4 and docs/architecture.md 3.2. It fails; it never warns and continues.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { z } from "zod";
import { changelogLine, cmaPeriodFile, feesSnapshot, parameterRecord, ruleRecord, wrapperRecord } from "@finance-tool/schema";
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
  fees: feesSnapshot,
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
    if (collection === "instruments/wrappers" && result.success) {
      for (const message of checkDimensionMarks(parsed.value as Record<string, unknown>, ruleDimensions, ctx.ruleBase)) report(file, message);
    }
  }
  return problems;
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
