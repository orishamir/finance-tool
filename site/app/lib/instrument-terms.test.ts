// F-41: a deposit record's exit points at a fixed interval reach the deposit run's input, so a piece at one on the last day is not
// flagged G-16; exit points with no interval in the record (`every_months` null) cannot be dated and reach the run as none.
import { describe, expect, it } from "vitest";
import { runInputs } from "@finance-tool/engine";
import type { DepositTerms } from "@finance-tool/schema";
import { loadParameters, loadRules, loadWrappers } from "./data.server";
import { buildInstrumentTerms, loadDepositTerms } from "./instruments.server";

const deposits = loadDepositTerms();
const rules = loadRules();
const record = deposits.find((d) => d.wrapper_id === "bank-deposit" && d.linkage === "none" && d.term_months.value === 12)!;
const withExits = (exit_points: DepositTerms["exit_points"]): DepositTerms => ({ ...record, id: "exit-points-probe", exit_points });
const build = (rec: DepositTerms) =>
  buildInstrumentTerms("bank-deposit", "deposit", { deposit_terms: rec.id }, { fees: [], funds: [], deposits: [...deposits, rec], rules, today: "2026-11-12" });
const depositOf = (r: ReturnType<typeof build>) => {
  if ("missing" in r) throw new Error(r.missing.join("; "));
  return r.terms.deposit!;
};

describe("buildInstrumentTerms: a deposit's exit points", () => {
  it("passes an interval the record holds to the run's input", () => {
    const terms = depositOf(build(withExits({ exists: true, every_months: 3 })));
    expect(terms.exitEveryMonths).toBe(3);
    const wrapper = loadWrappers().find((w) => w.id === "bank-deposit")!;
    const plan = runInputs(wrapper, loadParameters(), { deposit: terms });
    expect(plan.run).toBe("runDeposit");
    expect((plan.input as { deposit: { exitEveryMonths?: number } }).deposit.exitEveryMonths).toBe(3);
  });

  it("passes none when the record has exit points with no interval", () => {
    expect(depositOf(build(withExits({ exists: true, every_months: null })))).not.toHaveProperty("exitEveryMonths");
  });

  it("passes none when the record has no exit points", () => {
    expect(depositOf(build(withExits({ exists: false, every_months: null })))).not.toHaveProperty("exitEveryMonths");
  });
});
