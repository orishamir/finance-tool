// F-63: a provider's run its ledger lists on a method gap (G-38: a figure linked to the CPI every 1 January, of a rule no open reading covers,
// at a falling CPI) never charged its exit tax, so the workbench does not compare it: the row is not comparable on the rule, with the gap.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { providerWorkbench, runSecurities, type ComparedProvider, type WorkbenchInput } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

const hapoalim = JSON.parse(readFileSync(new URL("../../../data/fees/hapoalim@2026-10-23.json", import.meta.url), "utf8")) as unknown;
const rules = loadRules();
// the surtax threshold read as linked every 1 January instead of frozen: no open reading covers it, so at a fall it has no reading (G-38)
const linked = rules.map((r) =>
  r.id === "TXG-09" ? { ...r, figures: { ...r.figures, threshold: { ...(r.figures?.threshold as object), update_rule: "cpi-linked 1 jan" } } } : r,
) as typeof rules;

const input = (inflation: number): WorkbenchInput => ({
  goal: { amountNow: 10_000, monthly: 500, months: 36 },
  market: { grossReturn: 0.05, inflation },
  fund: { kind: "israeli-fund" },
  profile: {},
  instrumentClass: "etf_units",
  channel: "branch",
  theta: 0.005,
  providers: [{ snapshot: hapoalim, level: "list" }],
});

describe("F-63 a run listed on a method gap", () => {
  it("is not compared as if its exit tax were zero: the row is not comparable on the rule, naming G-38", () => {
    const ctx = context(linked);
    // the ledger lists the run on the gap, its exit tax uncharged
    const run = runSecurities({ goal: input(-0.01).goal, market: input(-0.01).market, fund: { kind: "israeli-fund" }, tariff: {}, profile: {} }, ctx);
    expect(run.outcome).toMatchObject({ code: "listed-not-ranked", reason: "TXG-09", gap: "G-38" });
    const row = providerWorkbench(input(-0.01), ctx).rows[0]!;
    expect(row.kind).toBe("not-comparable");
    if (row.kind === "not-comparable") expect(row.reason).toEqual({ code: "rule-open", ruleId: "TXG-09", gap: "G-38" });
    // at a rising CPI the same figure reads by F-120, and the row is compared
    expect((providerWorkbench(input(0.02), ctx).rows[0] as ComparedProvider).kind).toBe("compared");
  });
});
