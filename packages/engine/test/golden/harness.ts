// Shared test harness: the rule bundle from data/rules/ and a checker that compares the engine with the
// golden values within P-06 and confirms each golden value is printed in its scenario.
import { readdirSync, readFileSync } from "node:fs";
import { expect } from "vitest";
import type { RuleRecord } from "@finance-tool/schema";
import type { RunContext } from "../../src/index.ts";
import { isPrinted, printed, sectionText, withinTolerance } from "./expected.ts";

const rulesDir = new URL("../../../../data/rules/", import.meta.url);

export function loadRules(): RuleRecord[] {
  return readdirSync(rulesDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(new URL(f, rulesDir), "utf8")) as RuleRecord);
}

/** Run date of the golden scenarios: tax year 2026 for every figure (scenarios.md header). */
export const runDate = "2026-10-23";

export function context(rules: RuleRecord[] = loadRules()): RunContext {
  return { rules, runDate };
}

/**
 * Collects every mismatch of one scenario, then fails once with the whole list, so a run shows all the
 * numbers that are off rather than the first one.
 */
export function golden(id: string) {
  const text = sectionText(id);
  const problems: string[] = [];
  return {
    value(label: string, actual: number | undefined, expected: number) {
      if (!isPrinted(text, expected)) problems.push(`${label}: ${printed(expected)} is not printed in ${id}`);
      if (process.env.GOLDEN_REPORT && actual !== undefined)
        console.log(`${id}\t${label}\t${(actual - expected).toFixed(2)}`);
      if (actual === undefined || !Number.isFinite(actual)) problems.push(`${label}: engine gave ${actual}`);
      else if (!withinTolerance(actual, expected))
        problems.push(`${label}: engine ${actual.toFixed(2)}, golden ${printed(expected)} (diff ${(actual - expected).toFixed(2)})`);
    },
    done() {
      expect(problems, `${id}\n${problems.join("\n")}`).toEqual([]);
    },
  };
}
