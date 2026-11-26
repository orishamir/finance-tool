// A figure from a run lists the rules that changed its part of the run, with the strength of what those uses read.
import { describe, expect, it } from "vitest";
import { calendarMonthOf, employerLinePension, mergedRules, ruleBook, runInputs, type UsedRule } from "@finance-tool/engine";
import { p05Number } from "./engine";
import { buildGuidePage } from "./guide.server";
import { fact } from "./guide-signature";
import { pensionModel, studyYears } from "./guide-signature-g2";
import { ACCOUNT_LINES, FUND_LINES, SALARY_TAX_RULES, rulesOfRun, rulesOfRuns, salaryTaxOnly, withoutSalaryTax } from "./run-rules";
import { entered } from "./value";

const rule = (id: string, uses: UsedRule["uses"], figures: UsedRule["figures"] = [], strength: UsedRule["strength"] = "primary"): UsedRule => ({ id, strength, dimensions: [], figures, uses });

const custody = rule("BRK-17", [{ part: "fees", line: "custody", changed: true, figures: ["custody_pct"] }], [{ name: "custody_pct", strength: "institution" }]);
const drag = rule("TXF-16", [{ part: "fees", line: "fund", changed: true, figures: [] }]);
const exitTax = rule("TXS-02", [{ part: "taxAtExit", changed: true, figures: ["rate"] }], [{ name: "rate", strength: "primary" }]);
const looked = rule("TXI-03", [{ part: "taxDuring", changed: false, figures: ["rate"] }], [{ name: "rate", strength: "primary" }]);
const root = rule("MF-26", [{ part: null, changed: true, figures: [] }]);
const run = [custody, drag, exitTax, looked, root];

describe("rulesOfRun", () => {
  it("keeps a rule only where a changed use is on a selected part and line", () => {
    expect(rulesOfRun(run, [{ part: "fees", lines: ["custody"] }]).map((r) => r.id)).toEqual(["BRK-17"]);
    expect(rulesOfRun(run, [{ part: "fees", lines: ACCOUNT_LINES }]).map((r) => r.id)).toEqual(["BRK-17"]);
    expect(rulesOfRun(run, [{ part: "fees", lines: FUND_LINES }]).map((r) => r.id)).toEqual(["TXF-16"]);
    expect(rulesOfRun(run, ["fees"]).map((r) => r.id)).toEqual(["BRK-17", "TXF-16"]);
    expect(rulesOfRun(run, ["taxDuring", "taxAtExit"]).map((r) => r.id)).toEqual(["TXS-02"]);
    expect(rulesOfRun(run, [])).toEqual([]);
  });
  it("lists no rule only looked at, on any selection", () => {
    expect(rulesOfRun(run, ["taxDuring"])).toEqual([]);
    expect(rulesOfRun(run, "all").map((r) => r.id)).not.toContain("TXI-03");
  });
  it("'all' takes every changed use, the root book's among them", () => {
    expect(rulesOfRun(run, "all").map((r) => r.id)).toEqual(["BRK-17", "TXF-16", "TXS-02", "MF-26"]);
    expect(rulesOfRun(run, ["fees", "taxDuring", "taxAtExit"]).map((r) => r.id)).not.toContain("MF-26");
  });
  it("takes the weakest of the rule and the figures its changed uses read, and no figure of a use that changed nothing", () => {
    expect(rulesOfRun(run, ["fees"]).find((r) => r.id === "BRK-17")?.strength).toBe("institution");
    const mixed = rule(
      "BANK-09",
      [
        { part: "taxDuring", changed: true, figures: ["rate"] },
        { part: "fees", line: "account", changed: false, figures: ["ceiling"] },
      ],
      [
        { name: "rate", strength: "primary" },
        { name: "ceiling", strength: "secondary" },
      ],
    );
    expect(rulesOfRun([mixed], "all")).toEqual([{ id: "BANK-09", strength: "primary" }]);
  });
});

describe("rulesOfRuns", () => {
  it("merges the runs first: a use changed in any run is changed", () => {
    const year1 = [rule("TXH-09", [{ part: "taxAtExit", changed: false, figures: [] }])];
    const year6 = [rule("TXH-09", [{ part: "taxAtExit", changed: true, figures: [] }])];
    expect(rulesOfRuns([{ rules: year1 }], ["taxAtExit"])).toEqual([]);
    expect(rulesOfRuns([{ rules: year1 }, { rules: year6 }], ["taxAtExit"]).map((r) => r.id)).toEqual(["TXH-09"]);
  });
});

describe("the guides' runs: each figure lists the rules of its part", () => {
  const signature = (id: string) => buildGuidePage(id)!.signature!;
  const ids = (rules: readonly { id: string }[]) => rules.map((r) => r.id).sort();

  it("a pension deposit is the minimum rates, and the average wage only where the salary is above it (PEN-03, PEN-04)", () => {
    const d = signature("provident-for-annuity");
    const b = d.bundles["provident-for-annuity"]!;
    const average = ruleBook({ rules: b.rules, runDate: b.runDate }).amount("PEN-04", "average_wage");
    const below = pensionModel(d, "provident-for-annuity", { salary: Math.round(average / 2), years: 10, insurancePct: null })!;
    const above = pensionModel(d, "provident-for-annuity", { salary: Math.round(average * 2), years: 10, insurancePct: null })!;
    expect(ids(rulesOfRun(below.used, ["deposit"]))).toEqual(["PEN-03"]);
    expect(ids(rulesOfRun(above.used, ["deposit"]))).toEqual(["PEN-03", "PEN-04"]);
    // an employee's credit (F-31) rests on its rate and its cap, and on the brackets only where the year's tax caps it
    expect(below.relief.formula).toBe("F-31");
    const relief = ids(rulesOfRun(below.used, ["relief"]));
    expect(relief).toEqual(expect.arrayContaining(["TXP-01", "TXP-02"]));
    for (const id of relief) expect(id.startsWith("TXP-") || id === "TXG-02", id).toBe(true);
    // every read stays in the trail the page ships
    expect(below.rules).toEqual(expect.arrayContaining(["PEN-04", "TXP-03"]));
  });

  it("a study fund's salary tax on the employer's money above its limit goes on its own figure, not on the run's tax (F-52)", () => {
    const d = signature("keren-hishtalmut");
    const p05 = d.bundles["keren-hishtalmut"]!.p05;
    const income = 40_000;
    const plan = { employment: "employee" as const, income, ownMonthly: (income * Number(fact(d, "ownPct")!.value)) / 100, employerMonthly: (income * Number(fact(d, "employerPct")!.value)) / 100, returnPct: p05Number(p05, "A-01"), feePct: null };
    const year = studyYears(d, plan, 8)[7]!;
    expect(year.slice?.taxFromSalary ?? 0).toBeGreaterThan(0);
    const rules = mergedRules(year.runs);
    expect(rulesOfRun(rules, ["taxDuring"]).map((r) => r.id)).toContain("TXH-03");
    const taxFields = ids(rulesOfRun(withoutSalaryTax(rules), ["taxDuring", "taxAtExit"]));
    for (const id of SALARY_TAX_RULES.filter((x) => x !== "TXG-02")) expect(taxFields, id).not.toContain(id);
    const salary = ids(rulesOfRun(salaryTaxOnly(rules), ["taxDuring"]));
    expect(salary).toContain("TXH-03");
    for (const id of salary) expect(SALARY_TAX_RULES, id).toContain(id);
  });

  it("a pension employer line above TXP-10's limit: its salary tax stays off a balance before that tax", () => {
    const d = signature("provident-for-annuity");
    const b = d.bundles["provident-for-annuity"]!;
    const salary = 60_000;
    const terms = { ...b.terms, pension: { employment: "employee" as const, monthlySalary: salary, existingEmployeeRate: 0, employer: { pensionRate: 0.2, severanceRate: 0.0833, salary } } };
    const plan = runInputs(b.record, [b.p05], terms, { entered: { amount_now: entered(0, "nis", b.runDate), monthly_deposit: entered(1000, "nis_per_month", b.runDate), horizon_years: entered(10, "years", b.runDate) }, profile: { annualIncome: 12 * salary }, scenarioIncome: true, firstMonth: calendarMonthOf(b.runDate) });
    const line = employerLinePension(plan.input as Parameters<typeof employerLinePension>[0], { rules: b.rules, runDate: b.runDate });
    expect(line.detail.depositTax ?? 0).toBeGreaterThan(0);
    expect(ids(rulesOfRun(line.rules, ["taxDuring"]))).toEqual(expect.arrayContaining(["TXG-02", "TXP-10"]));
    expect(ids(rulesOfRun(withoutSalaryTax(line.rules), "all")).filter((id) => ["TXG-02", "TXP-10"].includes(id))).toEqual([]);
    expect(ids(rulesOfRun(salaryTaxOnly(line.rules), ["taxDuring"]))).toEqual(expect.arrayContaining(["TXG-02", "TXP-10"]));
  });
});
