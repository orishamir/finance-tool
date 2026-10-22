// The validator: docs/data-schema.md §4 and docs/architecture.md 3.2. It fails; it never warns and continues.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { z } from "zod";
import { changelogLine, cmaPeriodFile, parameterRecord, ruleRecord } from "@finance-tool/schema";
import type { RuleBaseIds } from "./references.ts";

/** Collection folder → schema. A file in a folder with no schema yet is an error: schema first, then data. */
const collections: Record<string, z.ZodType> = {
  rules: ruleRecord,
  parameters: parameterRecord,
  cma: cmaPeriodFile,
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

  for (const file of listFiles(ctx.dataDir)) {
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

    const collection = rel.split(/[\\/]/)[0]!;
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
    for (const id of collectStrings(parsed.value, "blocked_by")) {
      if (!ctx.ruleBase.openQuestions.has(id)) report(file, `blocked_by: ${id} is not an open question in il-finance`);
    }
    for (const id of collectStrings(parsed.value, "formula")) {
      if (/^F-\d{2}$/.test(id) && !ctx.formulas.has(id)) report(file, `formula: ${id} is not defined in docs/method.md (data-schema §4 item 6)`);
    }
  }
  return problems;
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
