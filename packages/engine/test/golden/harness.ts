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

/**
 * TXF-04 as it stood until 2026-11-07: a 90% main-currency test from the Tax Authority's letter of 4.7.2019, read only in a copy on a
 * third-party site. That day the copy stopped being cited (nothing unofficial is cited, CLAUDE.md) and the record became open, so a
 * TASE foreign fund that commits to the test is blocked (D10). The tests that check the arithmetic of the exchange-rate index run on
 * this stand-in: a test fixture, never data, so it carries a plain strength and only the arithmetic is tested.
 */
export function withTxf04AsTheLetterCopy(rules: RuleRecord[]): RuleRecord[] {
  return rules.map((r) =>
    r.id !== "TXF-04"
      ? r
      : ({
          ...r,
          strength: "primary",
          figures: {
            threshold_pct: {
              value: 90,
              unit: "pct",
              source: { url: "https://example.invalid/txf-04-letter-copy", title: "test fixture: TXF-04 as the letter's copy stated it", publisher: "test fixture", strength: "primary" },
              checked: "2026-10-25",
              effective_from: "2019-07-04",
              effective_to: null,
              tax_year: null,
              update_rule: "fixed in regulation",
              rule_ids: ["TXF-04"],
              state: "sourced",
            },
          },
        } as RuleRecord),
  );
}

/**
 * The rules with every amount s.120ב freezes held at its 2026 figure in every year (its `update_rule` read as "fixed in law"). At a falling
 * CPI an s.120ב amount read for a year after 2027 is open (TXG OQ17, F-119), so a run on the data that reads one is blocked; the deflation
 * scenarios (S10, S53) check their arithmetic on this stand-in, a test fixture, never data, where no figure read rests on that question.
 */
export function withS120bAmountsHeld(rules: RuleRecord[]): RuleRecord[] {
  const held = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(held);
    if (v === null || typeof v !== "object") return v;
    const o = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, held(x)]));
    return typeof o.update_rule === "string" && /^frozen /.test(o.update_rule) ? { ...o, update_rule: "fixed in law" } : o;
  };
  return rules.map((r) => (r.figures ? ({ ...r, figures: held(r.figures) } as RuleRecord) : r));
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
