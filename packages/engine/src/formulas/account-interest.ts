// What banks pay on a current account (guide page of the current account, 2026-10-25): the rate most of them pay, and the most one
// of them pays in a year on a given balance; and the range of a one-year deposit's rate across the banks (2026-10-26). Pure functions over published figures; the page supplies the bank records.
import type { DepositTerms } from "@finance-tool/schema";

/** The answer of F-85: the rate, how many of the banks pay it, how many banks were collected, and how many of them pay anything. */
export interface CommonRate {
  /** The most common rate, % a year. */
  rate: number;
  /** Banks that publish exactly that rate. */
  count: number;
  /** Banks collected (one rate each). */
  of: number;
  /** Banks that publish a rate above 0. */
  paying: number;
}

/**
 * F-85 The rate most banks pay on a current account. The most common published rate among the banks collected, one rate per bank;
 * a tie goes to the lower rate. Also counts the banks that publish a rate above 0. Null when no bank was collected. A bank that prints
 * that it offers no interest counts as a rate of 0 (BANK-09).
 */
export function mostCommonRate(rates: readonly number[]): CommonRate | null {
  if (rates.length === 0) return null;
  const counts = new Map<number, number>();
  for (const r of rates) {
    const key = Math.round(r * 1e9) / 1e9;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let best: [number, number] | null = null;
  for (const [rate, count] of counts) if (best === null || count > best[1] || (count === best[1] && rate < best[0])) best = [rate, count];
  return { rate: best![0], count: best![1], of: rates.length, paying: rates.filter((r) => r > 0).length };
}

/** The answer of F-86: the lowest and the highest published rate, and how many banks were collected. */
export interface RateRange {
  /** The lowest rate, % a year. */
  lo: number;
  /** The highest rate, % a year. */
  hi: number;
  /** Banks collected (one rate each). */
  count: number;
}

/**
 * F-86 The range of a deposit's rate across the banks. The lowest and the highest published rate among the banks collected, one rate
 * per bank. Null when no bank was collected.
 */
export function rateRange(rates: readonly number[]): RateRange | null {
  if (rates.length === 0) return null;
  return { lo: Math.min(...rates), hi: Math.max(...rates), count: rates.length };
}

/** F-105: one fee base's list fees across the managers collected. */
export interface ListFeeRange {
  /** The lowest list fee, in the fee's own unit. */
  lo: number;
  /** The highest. */
  hi: number;
  /** Managers collected (one list each). */
  count: number;
  /** How many of them print the legal cap: the managers that publish no lower rate. */
  atCap: number;
}

/**
 * F-105 A provident wrapper's list fee for one base across the managers collected: the lowest, the highest, how many, and how many print
 * `cap` (null when the law sets none). Shown only over two or more managers, so a single company's list never stands for the product.
 */
export function listFeeRange(fees: readonly number[], cap: number | null): ListFeeRange | null {
  if (fees.length < 2) return null;
  return { lo: Math.min(...fees), hi: Math.max(...fees), count: fees.length, atCap: cap === null ? 0 : fees.filter((f) => f === cap).length };
}

/**
 * F-86 (2026-10-31): the index of the middle rate among rates of one kind, in their ascending order; of an even count, the lower of the two
 * middle ones. The guide's example, so that it rests on neither the top nor the bottom of what was collected.
 */
export function middleIndex(count: number): number | null {
  return count > 0 ? Math.floor((count - 1) / 2) : null;
}

/**
 * F-26 (one year at a flat balance). The most a bank pays in a year on `balance`: the rate on the first `ceiling` of it, less the tax
 * the bank withholds on the interest (TXI-08, TXI-03). `ratePct` and `taxPct` are percents; `ceiling` is null when the record prints
 * none. No compounding and no change of balance: the figure is the ceiling of what the arrangement can pay, only to a customer who
 * meets the bank's conditions.
 */
export function currentAccountYearlyInterest(balance: number, ratePct: number, ceiling: number | null, taxPct: number): number {
  const earning = ceiling === null ? Math.max(0, balance) : Math.max(0, Math.min(balance, ceiling));
  return earning * (ratePct / 100) * (1 - taxPct / 100);
}

/** A deposit's break column (directive 447): it cannot be broken, it can be broken with a penalty, or without one. */
export type BreakTerm = "not_allowed" | "with_penalty" | "none";

/** The fields of a collected deposit record F-104 reads. */
export type BreakRecord = Pick<DepositTerms, "bank" | "wrapper_id" | "term_months" | "break" | "exit_points">;

/** The fields of a collected deposit record F-86's per-bank pick reads. */
export type PlainDepositRecord = Pick<DepositTerms, "id" | "bank" | "wrapper_id" | "term_months" | "rate_type" | "linkage" | "exit_points" | "variant" | "snapshot">;

/** A record's break column as F-104 reads it: `break.allowed` false is "cannot be broken"; otherwise its `break.penalty`. */
export function breakTermOf(b: BreakRecord["break"]): BreakTerm {
  return b.allowed ? b.penalty : "not_allowed";
}

/**
 * F-104's records: every collected one-year bank deposit (wrapper `bank-deposit`, `term_months` 12), of every rate type, linkage and
 * variant, in the order given. The page's sheet lists exactly these.
 */
export function oneYearDeposits<T extends BreakRecord>(records: readonly T[]): T[] {
  return records.filter((r) => r.wrapper_id === "bank-deposit" && r.term_months.value === 12);
}

/**
 * F-86's records: each bank's plain one-year deposit, at a fixed rate with no linkage, no exit points and no `variant` (a campaign, a
 * closed-system deposit, interest paid during the term, a best-of choice), the latest by snapshot, two of one snapshot by the smaller id
 * (so the pick never rests on the order the files are read in); one per bank, sorted by bank.
 */
export function plainOneYearDeposits<T extends PlainDepositRecord>(records: readonly T[]): T[] {
  const latest = new Map<string, T>();
  for (const d of records) {
    if (d.wrapper_id !== "bank-deposit" || d.rate_type !== "fixed" || d.linkage !== "none" || d.term_months.value !== 12) continue;
    if (d.exit_points.exists || d.variant) continue;
    const prev = latest.get(d.bank);
    if (!prev || d.snapshot > prev.snapshot || (d.snapshot === prev.snapshot && d.id < prev.id)) latest.set(d.bank, d);
  }
  return [...latest.values()].sort((a, b) => (a.bank < b.bank ? -1 : a.bank > b.bank ? 1 : 0));
}

/** One bank with a deposit that can be broken, as F-104 gives it: its deposits collected, and how many can be broken with a penalty and without one. */
export interface BankBreak {
  bank: string;
  deposits: number;
  withPenalty: number;
  free: number;
}

/**
 * The answer of F-104: what the collected deposits say about breaking them, counted over the banks (ground rule 2: a bank whose rows
 * were collected in larger number does not weigh more), with the deposits counted only for the sheet.
 */
export interface BreakCount {
  /** Deposits collected, and the banks they come from. */
  deposits: number;
  banks: number;
  /** Banks none of whose collected deposits can be broken, and how many of those have a deposit with exit points. */
  lockedBanks: number;
  lockedBanksWithExits: number;
  /** Each bank with a deposit that can be broken, in order of first appearance; its penalty is its own term. */
  breakable: BankBreak[];
}

/**
 * F-104 Breaking a deposit, over the collected one-year deposits (`oneYearDeposits`). For each bank, whether any of its deposits can be
 * broken (`breakTermOf`); counts the banks none of whose deposits can be, and gives each other bank with how many of its deposits can be
 * broken, with a penalty and without one. Null when no one-year deposit was collected.
 */
export function breakCount(records: readonly BreakRecord[]): BreakCount | null {
  const rows = oneYearDeposits(records).map((r) => ({ bank: r.bank, term: breakTermOf(r.break), exits: r.exit_points.exists }));
  if (rows.length === 0) return null;
  const byBank = new Map<string, typeof rows>();
  for (const r of rows) byBank.set(r.bank, [...(byBank.get(r.bank) ?? []), r]);
  const isLocked = (list: typeof rows) => list.every((r) => r.term === "not_allowed");
  const locked = [...byBank.values()].filter(isLocked);
  const breakable: BankBreak[] = [];
  for (const [bank, list] of byBank) {
    if (isLocked(list)) continue;
    breakable.push({ bank, deposits: list.length, withPenalty: list.filter((r) => r.term === "with_penalty").length, free: list.filter((r) => r.term === "none").length });
  }
  return {
    deposits: rows.length,
    banks: byBank.size,
    lockedBanks: locked.length,
    lockedBanksWithExits: locked.filter((list) => list.some((r) => r.exits)).length,
    breakable,
  };
}
