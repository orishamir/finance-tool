// F-96 A study fund's money, step by step: what was put in, what the return added after fees, what tax took and what is left, in today's money.
import type { RunResult } from "../result.ts";

export interface MoneyStory {
  own: number;
  /** What another hand added: the employer's deposits, or a self-employed person's tax back (F-30). */
  extra: number;
  /** The return above prices, after fees; below zero when fees and rising prices take more than the return gives. */
  gain: number;
  /** The tax at the withdrawal, and the income tax, National Insurance and health on what the employer paid above the limit (F-52). */
  tax: number;
  net: number;
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
  return { own, extra, gain: net + tax - own - extra, tax, net };
}
