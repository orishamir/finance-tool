import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { readFormulaIds, readRuleBaseIds, validateData } from "../src/index.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const ruleBase = readRuleBaseIds(`${root}.claude/skills/il-finance/references`);
const formulas = readFormulaIds(`${root}docs/method.md`);

const vo = {
  value: 25,
  unit: "pct",
  source: { url: "https://example.org", title: "s.125C", publisher: "Knesset", strength: "primary" },
  checked: "2026-10-22",
  effective_from: null,
  effective_to: null,
  tax_year: 2026,
  update_rule: "fixed in law",
  rule_ids: ["TXS-09"],
  state: "sourced",
};

function dataDir(files: Record<string, unknown>): string {
  const dir = mkdtempSync(join(tmpdir(), "data-"));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), typeof content === "string" ? content : JSON.stringify(content));
  }
  return dir;
}

const rule = {
  id: "TXS-09",
  title: "Exempt fund: tax on real gain",
  strength: "primary",
  dimensions: ["tax-at-exit"],
  likely_to_change: "no",
  figures: { rate_on_real_gain: vo },
  il_finance_file: "tax-securities-israeli.md",
  checked: "2026-10-22",
};

describe("reference IDs", () => {
  it("reads rules, open questions and formulas", () => {
    expect(ruleBase.rules.has("TXS-09")).toBe(true);
    expect(ruleBase.openQuestions.has("TXK-OQ2")).toBe(true);
    expect(formulas.has("F-40")).toBe(true);
  });
});

describe("validateData", () => {
  const run = (files: Record<string, unknown>) => validateData({ dataDir: dataDir(files), ruleBase, formulas });

  it("passes the real data/ folder", () => {
    expect(validateData({ dataDir: `${root}data`, ruleBase, formulas })).toEqual([]);
  });

  it("passes a valid rule file", () => {
    expect(run({ "rules/txs-09.json": rule })).toEqual([]);
  });

  it("rejects a rule ID that is not in il-finance", () => {
    const bad = { ...rule, figures: { x: { ...vo, rule_ids: ["TXS-999"] } } };
    expect(run({ "rules/txs-09.json": bad })[0]?.message).toMatch(/TXS-999/);
  });

  it("rejects a formula that is not in method.md", () => {
    const problems = run({ "rules/txs-09.json": { ...rule, extra: { formula: "F-99" } } });
    expect(problems.some((p) => /F-99/.test(p.message))).toBe(true);
  });

  it("rejects a collection with no schema yet", () => {
    expect(run({ "funds/x.json": {} })[0]?.message).toMatch(/no schema/);
  });

  it("rejects a bad change-log line", () => {
    expect(run({ "changelog.jsonl": '{"date":"2026-10-22"}\n' })[0]?.message).toMatch(/line 1/);
  });
});
