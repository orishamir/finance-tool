// F-96 A study fund's money, step by step: what was put in, what the return added, what fees and tax took and what is left, in today's money.
import type { RunResult } from "../result.ts";

export interface MoneyStory {
  own: number;
  /** What another hand added: the employer's deposits, or a self-employed person's tax back (F-30). */
  extra: number;
  /** The return above prices, after fees; below zero when fees and rising prices take more than the return gives. */
  gain: number;
  /** What the fees took: each month's charges at that month's index, as the deposits (F-06). The return before fees is `gain + fees`. */
  fees: number;
  /** The tax at the withdrawal, and the income tax, National Insurance and health on what the employer paid above the limit (F-52). */
  tax: number;
  /** The part of `tax` paid out of the salary month by month, on what the employer paid above the limit; the rest is paid at the withdrawal. */
  taxFromSalary: number;
  net: number;
}

/** A run's fees in today's money: each month's charges (the series is cumulative) over that month's index (F-03, F-06). */
function feesToday(r: RunResult): number {
  let total = 0;
  let prev = 0;
  for (const p of r.series) {
    total += (p.fees - prev) / p.index;
    prev = p.fees;
  }
  return total;
}

/**
 * F-96 A study fund's money at one withdrawal. `own` and `extra` are in today's money, each deposit at its own month's index (F-06); `runs` are the
 * runs that hold them, stopped at the withdrawal.
 */
export function moneyStory(own: number, extra: number, runs: readonly RunResult[]): MoneyStory {
  // what the employer's excess cost was paid over the years: the run subtracts it at face over the last index (F-52), here it counts at its own months' (F-06)
  const paid = (r: RunResult) => r.detail.employerPaidToday ?? 0;
  const index = (r: RunResult) => r.series[r.series.length - 1]!.index;
  const face = (r: RunResult) => ((r.detail.employerDepositTax ?? 0) + (r.detail.employerSocial ?? 0)) / index(r);
  const tax = runs.reduce((a, r) => a + (r.taxAtExit + r.taxDuring) / index(r) + paid(r), 0);
  const net = runs.reduce((a, r) => a + r.real + face(r) - paid(r), 0);
  return { own, extra, gain: net + tax - own - extra, fees: runs.reduce((a, r) => a + feesToday(r), 0), tax, taxFromSalary: runs.reduce((a, r) => a + paid(r), 0), net };
}

export interface LimitStanding {
  /** What each run deposits above the limit: a month's at today's amounts for an employee, the first tax year's as deposited for a self-employed person. */
  over: number[];
  /** What each run's deposit could still grow by inside its limit, for the same period; one run's room is not the other's. */
  room: number[];
  per: "month" | "year";
  /** The first year a deposit goes above the limit; null when none does in these runs. */
  firstOverYear: number | null;
}

/** F-97 Where a study fund's deposits stand against the limit (TXH-08, TXH-01), from the runs that hold them. */
export function limitStanding(runs: readonly RunResult[]): LimitStanding {
  const yearly = runs.some((r) => r.detail.excessFirstYear !== undefined);
  const months = runs.flatMap((r) => (r.detail.firstExcessMonth === undefined ? [] : [r.detail.firstExcessMonth]));
  return {
    over: runs.map((r) => (yearly ? r.detail.excessFirstYear : r.detail.excessMonthly) ?? 0),
    room: runs.map((r) => (yearly ? r.detail.roomFirstYear : r.detail.roomMonthly) ?? 0),
    per: yearly ? "year" : "month",
    firstOverYear: months.length ? Math.ceil(Math.min(...months) / 12) : null,
  };
}

export interface EarlySettlement {
  /** What the fund withholds at the withdrawal (TXH-15). */
  withheld: number;
  /** What the annual return gives back: the withheld less the tax the withdrawal owes (A-14). */
  back: number;
  /** What the annual return still asks for, when the tax is above the withheld (surtax). */
  owed: number;
  /** What reaches the account at the withdrawal, before any return. */
  first: number;
}

/** F-98 An early withdrawal's withholding and what a return gives back, in today's money. Null when no run withdraws before the lock ends. */
export function earlySettlement(runs: readonly RunResult[]): EarlySettlement | null {
  const today = (r: RunResult, v: number) => v / r.series[r.series.length - 1]!.index;
  if (!runs.some((r) => r.detail.earlyWithheld !== undefined)) return null;
  const withheld = runs.reduce((a, r) => a + today(r, r.detail.earlyWithheld ?? 0), 0);
  const due = runs.reduce((a, r) => a + today(r, r.taxAtExit), 0);
  return { withheld, back: Math.max(0, withheld - due), owed: Math.max(0, due - withheld), first: moneyStory(0, 0, runs).net + due - withheld };
}
