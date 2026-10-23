// F-52 Employer line (B2): money only a salary wrapper receives, run through the same engine and reported
// as its own line, never ranked.
import { runProvident, type ProvidentInput, type ProvidentResult } from "./provident.ts";
import { employerLinePension, type PensionEmployerLine, type PensionInput } from "./pension.ts";
import type { RunContext } from "../result.ts";

export type EmployerLineInput =
  | { kind: "hishtalmut"; input: ProvidentInput }
  | { kind: "pension"; input: PensionInput };

/** The "value at the horizon of money only available here" (F-52), and why it is not ranked (B2). */
export type EmployerLine = (Omit<ProvidentResult, "routed"> & { line: "only-available-here"; ranked: false }) | PensionEmployerLine;

/**
 * F-52 Employer line. For a keren hishtalmut, the employer deposits `employer rate × salary` a month as on the
 * payslip (A-12, KH-04 gives the common 7.5%), constant in nominal terms like the salary; up to 7.5% of the
 * determining salary (TXH-01) is not taxed when paid, and the rest is salary when paid (TXH-03): its income
 * tax (TXG-02) and National Insurance and health (TXG-35, a reading) are subtracted at face value, and its gains are
 * taxed at 25% of the real gain at withdrawal (TXH-11, institution). The line runs through F-08 with the
 * wrapper's fees and its exit (F-46, or F-47 on the person's opt-in), and is returned with its value, never
 * ranked. For a pension, the employer's pension and severance deposits (PEN-03, TXP-10, TXP-11) run through
 * the pension ledger with the wrapper's fees and insurance; the exit is blocked (F-49).
 *
 * The method's text gives the study-fund deposit as `7.5% × min(salary, 15,712)`, which would leave no
 * excess to tax; the independent check deposits the payslip rate on the whole salary and taxes the part above
 * the limit (S25: 1,500 a month on a 20,000 salary), and so does this function.
 */
export function employerLine(i: EmployerLineInput, ctx: RunContext): EmployerLine {
  if (i.kind === "pension") return employerLinePension(i.input, ctx);
  const h = i.input.hishtalmut;
  if (!h || h.employment !== "employee") throw new RangeError("the employer line needs an employee's keren hishtalmut (hishtalmut.employment)");
  if (!(h.employerRate !== undefined && h.employerRate > 0) || !(h.monthlySalary !== undefined && h.monthlySalary > 0)) {
    throw new RangeError("hishtalmut.employerRate and hishtalmut.monthlySalary are required for the employer line (A-12)");
  }
  const { routed: _routed, ...run } = runProvident(
    {
      ...i.input,
      goal: { ...i.input.goal, amountNow: 0, monthly: h.employerRate * h.monthlySalary, contributions: "nominal" },
      hishtalmut: { ...h, money: "employer" },
    },
    ctx,
  );
  const untilMonth = run.outcome.code === "listed-not-ranked" ? run.outcome.untilMonth : undefined;
  return {
    ...run,
    outcome: { code: "listed-not-ranked", reason: "B2", ...(untilMonth === undefined ? {} : { untilMonth }) },
    line: "only-available-here",
    ranked: false,
  };
}
