// The rules a figure from an engine run lists: those whose read changed the part of the run the figure is made of (method §13, architecture
// 3.4 `RuleUse`). Every read stays in the run's trail; a figure lists only the rules that changed what it shows.
import { mergedRules, type FeeType, type RunPart, type TaxLine, type UsedRule } from "@finance-tool/engine";
import { weaker, type Strength } from "./value";

/** Some fee lines of a run. */
export type FeeLines = readonly FeeType[];

/**
 * One part of a run a figure is made of: a part by name ("fees" is every fee line, "taxDuring" every line of the tax during the run), some
 * fee lines only, or the tax during the run less some of its lines (`DISTRIBUTION_TAX`).
 */
export type RunSel = Exclude<RunPart, "fees"> | "fees" | { part: "fees"; lines: readonly FeeType[] } | { part: "taxDuring"; without: readonly TaxLine[] };

/** The parts a figure is made of: "all" for a figure of the whole result (what is left), which reads the root book's uses too. */
export type RunParts = "all" | readonly RunSel[];

/** The fee lines an account charges (the account's cost before tax, F-91): every line the Tally books for the account, none of the fund's. */
export const ACCOUNT_LINES: readonly FeeType[] = ["trade", "custody", "fx", "fixed", "account", "manager"];

/** The fee lines a fund carries inside its price (the fund's own costs, F-91): its drag and the spread. */
export const FUND_LINES: readonly FeeType[] = ["fund", "spread"];

/**
 * The tax on a distribution that a shekel held pays (F-91's `t`, F-20: the Israeli rate, the foreign withholding and its credit): the
 * `taxDuring` part without its `surtax` line. The surtax (F-43) is settled on the year's whole income against its threshold, so a shekel of
 * distribution moves it only above the threshold. A money carried to the horizon on a fund that pays out (a line in whole units, a deal's
 * fee, the cash waiting for a unit) grows at the fund's return less that tax, so it rests on these rules and on no surtax.
 */
export const DISTRIBUTION_TAX: RunSel = { part: "taxDuring", without: ["surtax"] };

/** A figure of `rules`, as a computed value lists it (`computed` options' `rules`). */
export interface ListedRule {
  id: string;
  strength: Strength;
}

function selects(parts: RunParts, use: UsedRule["uses"][number]): boolean {
  if (parts === "all") return true;
  return parts.some((sel) => {
    if (typeof sel === "string") return use.part === sel;
    if ("without" in sel) return use.part === sel.part && !sel.without.some((line) => line === use.line);
    return use.part === "fees" && sel.lines.some((line) => line === use.line);
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

/** A use of the F-52 salary tax: the run's `salaryTax` line of the tax during the run (`TaxLine`), which its `taxDuring` field does not hold. */
const salaryTaxUse = (u: UsedRule["uses"][number]) => u.part === "taxDuring" && u.line === "salaryTax";

/** The run's rules without the uses of the F-52 salary tax: for a figure of the run's tax fields, or of a balance before that tax. */
export function withoutSalaryTax(rules: readonly UsedRule[]): UsedRule[] {
  return rules.map((r) => ({ ...r, uses: r.uses.filter((u) => !salaryTaxUse(u)) }));
}

/** The run's rules with only the uses of the F-52 salary tax: for the figure of the tax the salary pays on the employer's deposits. */
export function salaryTaxOnly(rules: readonly UsedRule[]): UsedRule[] {
  return rules.map((r) => ({ ...r, uses: r.uses.filter(salaryTaxUse) }));
}
