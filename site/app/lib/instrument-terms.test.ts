// F-41: a deposit record's exit points reach the deposit run's input as the months to the first one (`first_after_months`) and the
// interval after it (`every_months`), each only as a positive whole number of months. Without a first the run knows no exit point,
// so a record that prints only how often exit points come (`every_months` alone) leaves every piece inside its term flagged G-16.
import { describe, expect, it } from "vitest";
import { runInputs } from "@finance-tool/engine";
import type { DepositTerms } from "@finance-tool/schema";
import { loadParameters, loadRules, loadWrappers } from "./data.server";
import { buildInstrumentTerms, loadDepositTerms } from "./instruments.server";

const deposits = loadDepositTerms();
const rules = loadRules();
const record = deposits.find((d) => d.wrapper_id === "bank-deposit" && d.linkage === "none" && d.term_months.value === 12)!;
const account = deposits.find((d) => d.wrapper_id === "current-account")!;
const withExits = (exit_points: DepositTerms["exit_points"], base: DepositTerms = record): DepositTerms => ({ ...base, id: "exit-points-probe", exit_points });
const build = (rec: DepositTerms, wrapperId: "bank-deposit" | "current-account" = "bank-deposit") =>
  buildInstrumentTerms(wrapperId, "deposit", { deposit_terms: rec.id }, { fees: [], funds: [], deposits: [...deposits, rec], rules, today: "2026-11-12" });
const depositOf = (r: ReturnType<typeof build>) => {
  if ("missing" in r) throw new Error(r.missing.join("; "));
  return r.terms.deposit!;
};

describe("buildInstrumentTerms: a deposit's exit points", () => {
  it("passes the first exit point and the interval after it to the run's input", () => {
    // Bank Hapoalim's "after 120 months and every 12 months after that"
    const terms = depositOf(build(withExits({ exists: true, every_months: 12, first_after_months: 120 })));
    expect(terms).toMatchObject({ exitFirstMonth: 120, exitEveryMonths: 12 });
    const wrapper = loadWrappers().find((w) => w.id === "bank-deposit")!;
    const plan = runInputs(wrapper, loadParameters(), { deposit: terms });
    expect(plan.run).toBe("runDeposit");
    expect((plan.input as { deposit: { exitFirstMonth?: number; exitEveryMonths?: number } }).deposit).toMatchObject({ exitFirstMonth: 120, exitEveryMonths: 12 });
  });

  it("passes the first alone when the record gives no interval", () => {
    const terms = depositOf(build(withExits({ exists: true, every_months: null, first_after_months: 6 })));
    expect(terms.exitFirstMonth).toBe(6);
    expect(terms).not.toHaveProperty("exitEveryMonths");
  });

  it("passes no first when the record prints only how often exit points come, so the run knows none", () => {
    const terms = depositOf(build(withExits({ exists: true, every_months: 3 })));
    expect(terms).not.toHaveProperty("exitFirstMonth");
    expect(depositOf(build(withExits({ exists: true, every_months: 3, first_after_months: null })))).not.toHaveProperty("exitFirstMonth");
  });

  it("passes no first that is not a whole number of months (a week is 0.25)", () => {
    expect(depositOf(build(withExits({ exists: true, every_months: null, first_after_months: 0.25 })))).not.toHaveProperty("exitFirstMonth");
    expect(depositOf(build(withExits({ exists: true, every_months: 1.5, first_after_months: 3 })))).not.toHaveProperty("exitEveryMonths");
  });

  it("passes nothing when the record has no exit points, or exit points with neither figure", () => {
    expect(depositOf(build(withExits({ exists: false, every_months: null })))).not.toHaveProperty("exitFirstMonth");
    const none = depositOf(build(withExits({ exists: true, every_months: null, first_after_months: null })));
    expect(none).not.toHaveProperty("exitFirstMonth");
    expect(none).not.toHaveProperty("exitEveryMonths");
  });

  it("passes nothing for a current account, which has no term", () => {
    const terms = depositOf(build(withExits({ exists: true, every_months: 1, first_after_months: 1 }, account), "current-account"));
    expect(terms.termMonths).toBe(1);
    expect(terms).not.toHaveProperty("exitFirstMonth");
    expect(terms).not.toHaveProperty("exitEveryMonths");
  });
});
