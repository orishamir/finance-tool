// The rules a figure from an engine run lists: those whose read changed the part of the run the figure is made of (method §13, architecture
// 3.4 `RuleUse`). Every read stays in the run's trail; a figure lists only the rules that changed what it shows.
import { mergedRules, type FeeType, type RunPart, type UsedRule } from "@finance-tool/engine";
import { weaker, type Strength } from "./value";

/** One part of a run a figure is made of: a part by name ("fees" is every fee line), or some fee lines only. */
export type RunSel = Exclude<RunPart, "fees"> | "fees" | { part: "fees"; lines: readonly FeeType[] };

/** The parts a figure is made of: "all" for a figure of the whole result (what is left), which reads the root book's uses too. */
export type RunParts = "all" | readonly RunSel[];

/** The fee lines an account charges (the account's cost before tax, F-91): every line the Tally books for the account, none of the fund's. */
export const ACCOUNT_LINES: readonly FeeType[] = ["trade", "custody", "fx", "fixed", "account", "manager"];

/** The fee lines a fund carries inside its price (the fund's own costs, F-91): its drag and the spread. */
export const FUND_LINES: readonly FeeType[] = ["fund", "spread"];

/** A figure of `rules`, as a computed value lists it (`computed` options' `rules`). */
export interface ListedRule {
  id: string;
  strength: Strength;
}

function selects(parts: RunParts, use: UsedRule["uses"][number]): boolean {
  if (parts === "all") return true;
  return parts.some((sel) => {
    if (typeof sel === "string") return use.part === sel;
    return use.part === "fees" && use.line !== undefined && sel.lines.includes(use.line);
  });
}

/**
 * The rules of a run a figure made of `parts` lists: each rule with a use that changed the number on a selected part (and fee line), with
 * the weakest of the rule's own strength and the strength of each figure those changed uses read. A rule only looked at (`peek`), or read
 * for another part, is left out of the figure and stays in the run's trail.
 */
export function rulesOfRun(rules: readonly UsedRule[], parts: RunParts): ListedRule[] {
  const out: ListedRule[] = [];
  for (const r of rules) {
    const uses = r.uses.filter((u) => u.changed && selects(parts, u));
    if (uses.length === 0) continue;
    const names = new Set(uses.flatMap((u) => u.figures));
    const strength = r.figures.filter((f) => names.has(f.name)).reduce<Strength>((w, f) => weaker(w, f.strength as Strength) ?? w, r.strength as Strength);
    out.push({ id: r.id, strength });
  }
  return out;
}

/** `rulesOfRun` over several runs a figure rests on, their uses merged first (a use changed in any run is changed). */
export function rulesOfRuns(runs: readonly { rules?: readonly UsedRule[] }[], parts: RunParts): ListedRule[] {
  return rulesOfRun(mergedRules(runs), parts);
}

/**
 * The rules the F-52 salary tax reads on the `taxDuring` part: the tax a salary pays on an employer's deposit above its exempt limit (TXH-03
 * for a study fund, TXP-10 and the severance ceiling TXP-11 for a pension), at the brackets (TXG-02), with national insurance on it (TXG-35).
 * A run deducts that tax from what is left as a detail (`employerDepositTax`, `depositTax`) and does not add it to its `taxDuring` field
 * (architecture 3.4), and a run's uses carry no mark of it, so these ids, the only ones the provident and pension ledgers read on their
 * salary-tax view, tell its uses apart: no other read of these rules goes into `taxDuring`.
 */
export const SALARY_TAX_RULES: readonly string[] = ["TXH-03", "TXP-10", "TXP-11", "TXG-02", "TXG-35"];

const salaryTaxUse = (r: UsedRule, u: UsedRule["uses"][number]) => u.part === "taxDuring" && SALARY_TAX_RULES.includes(r.id);

/** The run's rules without the uses of the F-52 salary tax (`SALARY_TAX_RULES`): for a figure of the run's tax fields, or of a balance before that tax. */
export function withoutSalaryTax(rules: readonly UsedRule[]): UsedRule[] {
  return rules.map((r) => ({ ...r, uses: r.uses.filter((u) => !salaryTaxUse(r, u)) }));
}

/** The run's rules with only the uses of the F-52 salary tax (`SALARY_TAX_RULES`): for the figure of the tax the salary pays on the employer's deposits. */
export function salaryTaxOnly(rules: readonly UsedRule[]): UsedRule[] {
  return rules.map((r) => ({ ...r, uses: r.uses.filter((u) => salaryTaxUse(r, u)) }));
}
