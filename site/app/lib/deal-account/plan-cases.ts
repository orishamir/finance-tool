// The cases of a deal's fee that the indices page's plan reads (F-128), which the popup marks "בתוכנית": the case each fee is read in for
// what the plan buys, and, for a case read within a step of the account's size (F-115 on what is held, F-128's balance on an action), the
// years of the plan whose balance falls in that step. A case read within a step of a month's orders, a month's trading or an action's own
// size is not marked: which of those steps the plan reaches is known only inside the run, which does not report it. Pure; no Hebrew.
import { feeOf } from "../fee-deal/cases";
import type { PlanRead } from "./plan";

/** A run of the plan's years, first to last, both counted: year 1 is the run's months 1 to 12. */
export interface YearSpan {
  from: number;
  to: number;
}

/** A case the plan reads: in every year (`years` null), or only in the years whose balance its step of the size holds. */
export interface PlanCase {
  years: readonly YearSpan[] | null;
}

/** A step of the account's size a read fee is charged within: above `from` (the first step holds nothing too), at most `to`, in `unit`. */
interface SizeStep {
  from: number;
  to: number | null;
  unit: string;
}

/** Whether balance `b` stands in a step of the size. */
const inStep = (b: number, s: SizeStep): boolean => (s.from === 0 ? b >= 0 : b > s.from) && (s.to === null || b <= s.to);

/** The years in order as runs of neighbours. */
export function yearSpans(years: Iterable<number>): YearSpan[] {
  const out: YearSpan[] = [];
  for (const y of [...new Set(years)].sort((a, b) => a - b)) {
    const last = out.at(-1);
    if (last && last.to === y - 1) last.to = y;
    else out.push({ from: y, to: y });
  }
  return out;
}

/**
 * F-128 The cases of fee `feeId` the plan reads (`planRead`), by case id: a case read with no step of the size in every year, a case read
 * within steps of the account's size in the years where some month's balance (`balances[m - 1]`, nominal shekels, the run's) stands in
 * them. A step in another currency than the shekel, or with no balances, gives no years and no mark; a case whose steps hold no month's
 * balance is not read on the plan and is left out.
 */
export function planCases(read: PlanRead, feeId: string, balances: readonly number[] | null): Map<string, PlanCase> {
  const always = new Set<string>();
  const years = new Map<string, Set<number>>();
  for (const x of read.fees) {
    const id = x.read?.case;
    if (feeOf(x) !== feeId || !id) continue;
    const within = read.within.get(x) ?? [];
    // a step of a month's orders or trading, or of the action's own size: the run does not say which of them it reaches
    if (within.some((w) => w.on !== "balance") || x.read?.step?.on === "action") continue;
    const steps: SizeStep[] = [
      ...(x.read?.step ? [{ from: x.read.step.from?.v ?? 0, to: x.read.step.to?.v ?? null, unit: x.read.step.currency }] : []),
      ...within.map((w) => ({ from: w.from, to: w.to, unit: w.unit })),
    ];
    if (steps.length === 0) {
      always.add(id);
      continue;
    }
    if (!balances || steps.some((s) => s.unit !== "ILS")) continue;
    const got = years.get(id) ?? new Set<number>();
    balances.forEach((b, i) => {
      if (steps.every((s) => inStep(b, s))) got.add(Math.ceil((i + 1) / 12));
    });
    years.set(id, got);
  }
  const out = new Map<string, PlanCase>();
  for (const id of always) out.set(id, { years: null });
  for (const [id, ys] of years) if (!always.has(id) && ys.size > 0) out.set(id, { years: yearSpans(ys) });
  return out;
}
