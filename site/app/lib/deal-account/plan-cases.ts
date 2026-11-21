// The cases of a deal's fee that the indices page's plan reads (F-128), which the popup marks "בתוכנית": the case each fee is read in for
// what the plan buys, in every year where no step splits it; and, for a case read within steps, where the run reaches them: a step of the
// account's size (F-115 on what is held, F-128's balance on an action) with the years of the plan a charge fell in it, and a step of an
// order's own size, of a month's orders or of its trading with a plain mark where some charge of the plan fell in it. What the run reaches
// is the run's own (`dealReach`, measured at the run's rates), so a step in another currency is read as the run reads it. Pure; no Hebrew.
import { feeOf } from "../fee-deal/cases";
import { planFees, type FeeOnPlan, type PlanRead } from "./plan";

/** A run of the plan's years, first to last, both counted: year 1 is the run's months 1 to 12. */
export interface YearSpan {
  from: number;
  to: number;
}

/** A case the plan reads: plainly (`years` null), or only in the years a charge of the run fell in its steps of the account's size. */
export interface PlanCase {
  years: readonly YearSpan[] | null;
}

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
 * F-128 The cases of fee `feeId` the plan reads (`planRead`, the fees it charges `on` the plan), by case id: a case read within no step,
 * plainly; a case read within steps, where the run reached them (`reach[i]`, the run months a charge of the run's `i`th fee fell in all its
 * steps, `planFees`' order): with the years of those months where every step is of the account's size, plainly where any is of an order's own
 * size, a month's orders or its trading. A case no charge of the run reached, or with no run, is not marked; a case marked plainly by one of
 * its read fees is marked plainly.
 */
export function planCases(read: PlanRead, feeId: string, on: readonly FeeOnPlan[], reach: readonly (readonly number[])[] | null): Map<string, PlanCase> {
  const plain = new Set<string>();
  const years = new Map<string, Set<number>>();
  planFees(read, on).forEach((x, i) => {
    const id = x.read?.case;
    if (feeOf(x) !== feeId || !id) return;
    const within = read.within.get(x) ?? [];
    const step = x.read?.step;
    if (!step && within.length === 0) {
      plain.add(id);
      return;
    }
    const months = reach?.[i] ?? [];
    if (months.length === 0) return;
    // a step of the account's size gives the years the plan is in it; an order's own size, a month's orders or trading, a plain mark
    const ofSize = (!step || step.on === "held") && within.every((w) => w.on === "balance");
    if (!ofSize) {
      plain.add(id);
      return;
    }
    const got = years.get(id) ?? new Set<number>();
    for (const m of months) got.add(Math.ceil(m / 12));
    years.set(id, got);
  });
  const out = new Map<string, PlanCase>();
  for (const id of plain) out.set(id, { years: null });
  for (const [id, ys] of years) if (!plain.has(id)) out.set(id, { years: yearSpans(ys) });
  return out;
}
