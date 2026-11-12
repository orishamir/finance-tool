// F-41: a deposit record's exit points reach the deposit run's input as the months to the first one (`first_after_months`) and the
// interval after it (`every_months`), each only as a positive whole number of months. Without a first the run knows no exit point,
// so a record that prints only how often exit points come (`every_months` alone) leaves every piece inside its term flagged G-16.
import { describe, expect, it } from "vitest";
import { runInputs, runPlanned } from "@finance-tool/engine";
import type { DepositTerms } from "@finance-tool/schema";
import { flags as flagWords } from "../copy";
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

  // each "passes no…" below stands beside the same record with a good figure, which is passed: the figure was read, then left out
  it("passes no first when the record prints only how often exit points come, so the run knows none", () => {
    expect(depositOf(build(withExits({ exists: true, every_months: 3, first_after_months: 3 })))).toMatchObject({ exitFirstMonth: 3, exitEveryMonths: 3 });
    const terms = depositOf(build(withExits({ exists: true, every_months: 3, first_after_months: null })));
    expect(terms).not.toHaveProperty("exitFirstMonth");
    // the interval still reaches the run, which knows no exit point without a first (the engine's own test)
    expect(terms.exitEveryMonths).toBe(3);
  });

  it("passes no first that is not a whole number of months (a week is 0.25)", () => {
    expect(depositOf(build(withExits({ exists: true, every_months: null, first_after_months: 1 }))).exitFirstMonth).toBe(1);
    expect(depositOf(build(withExits({ exists: true, every_months: null, first_after_months: 0.25 })))).not.toHaveProperty("exitFirstMonth");
    const half = depositOf(build(withExits({ exists: true, every_months: 1.5, first_after_months: 3 })));
    expect(half.exitFirstMonth).toBe(3);
    expect(half).not.toHaveProperty("exitEveryMonths");
  });

  it("passes nothing when the record has no exit points, or exit points with neither figure", () => {
    expect(depositOf(build(withExits({ exists: false, every_months: null })))).not.toHaveProperty("exitFirstMonth");
    const none = depositOf(build(withExits({ exists: true, every_months: null, first_after_months: null })));
    expect(none).not.toHaveProperty("exitFirstMonth");
    expect(none).not.toHaveProperty("exitEveryMonths");
  });

  it("passes no exit points for a savings plan that renews: the run takes a plan that has ended as paid out", () => {
    const plan = deposits.find((d) => d.id === "leumi-tashlumim-prime-3y")!;
    expect(plan.auto_renew.value).toBe(false);
    const buildPlan = (rec: DepositTerms) => buildInstrumentTerms("savings-plan", "deposit", { deposit_terms: rec.id }, { fees: [], funds: [], deposits: [...deposits, rec], rules, today: "2026-11-12" });
    // the plan as collected, which does not renew, is passed with its exit points
    expect(depositOf(buildPlan({ ...plan, id: "plan-probe" }))).toMatchObject({ exitFirstMonth: 6, exitEveryMonths: 3 });
    const renewing = depositOf(buildPlan({ ...plan, id: "plan-probe", auto_renew: { value: true, max_renewals: null } }));
    expect(renewing).not.toHaveProperty("exitFirstMonth");
    expect(renewing).not.toHaveProperty("exitEveryMonths");
    // a deposit that renews keeps its exit points: each of its pieces counts from its own start, renewed or not
    const deposit = depositOf(build({ ...withExits({ exists: true, every_months: 3, first_after_months: 6 }), auto_renew: { value: true, max_renewals: null } }));
    expect(deposit).toMatchObject({ exitFirstMonth: 6, exitEveryMonths: 3 });
  });

  it("passes nothing for a current account, which has no term", () => {
    // the same exit points on a deposit are passed; on a current account they are not
    expect(depositOf(build(withExits({ exists: true, every_months: 1, first_after_months: 1 })))).toMatchObject({ exitFirstMonth: 1, exitEveryMonths: 1 });
    const terms = depositOf(build(withExits({ exists: true, every_months: 1, first_after_months: 1 }, account), "current-account"));
    expect(terms.termMonths).toBe(1);
    expect(terms).not.toHaveProperty("exitFirstMonth");
    expect(terms).not.toHaveProperty("exitEveryMonths");
  });

  it("carries a collected plan's first exit point from its record to the note on the number (Bank Leumi's prime plan: after 6 months, then every 3)", () => {
    const rec = deposits.find((d) => d.id === "leumi-tashlumim-prime-3y")!;
    expect(rec.exit_points).toEqual({ exists: true, every_months: 3, first_after_months: 6 });
    const built = buildInstrumentTerms("savings-plan", "deposit", { deposit_terms: rec.id }, { fees: [], funds: [], deposits, rules, today: "2026-11-12" });
    const terms = depositOf(built);
    expect(terms).toMatchObject({ termMonths: 36, exitFirstMonth: 6, exitEveryMonths: 3 });
    const plan = runInputs(loadWrappers().find((w) => w.id === "savings-plan")!, loadParameters(), { deposit: terms });
    // one sum paid in on the first month, so the plan and its one piece count alike; what the last day says of money inside its term
    const said = (months: number) => {
      const codes = runPlanned({ ...plan, input: { ...plan.input, goal: { ...plan.input.goal, monthly: 0, months } } } as typeof plan, { rules: Object.values(rules), runDate: "2026-11-12" }).flags.map((f) => f.code);
      return ["G-16", "G-34"].filter((c) => codes.includes(c)).join(" ");
    };
    expect(said(3)).toBe("G-16"); // one interval after the start is no exit point: the first comes after six months
    expect(said(6)).toBe("G-34");
    expect(said(7)).toBe("G-16");
    expect(said(9)).toBe("G-34");
    expect(said(36)).toBe(""); // the plan's end
    // and the note has its sentence on the page
    expect(flagWords["G-34"]).toMatch(/תחנת יציאה/);
  });
});
