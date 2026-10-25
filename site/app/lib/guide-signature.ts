// The numbers behind the "what makes it different" visuals of the guide pages (D29, research/specs/2026-10-25-guide-signatures).
// Everything here is a pure function over the data the page loader ships (`SignatureData`): each figure is an engine run on a
// bundle (`runTimeline`, `runAtMonths`) or an engine formula over a sourced figure, never a number typed here. The components
// wrap the results in `computed(...)` value objects so every figure goes through `Num` with its state.
import { bondPrice, makamPrice, runInputs, runPlanned, type P05Input, type RunResult } from "@finance-tool/engine";
import type { ValueObject } from "@finance-tool/schema";
import { p05Number, p05Units, runTimeline, type Bundle } from "./engine";
import { entered as enteredValue, type SiteValue } from "./value";

/** What the loader ships for a page with a visual. Plain data: bundles to run, sourced figures by name, and what is missing. */
export interface SignatureData {
  id: string;
  /** Engine bundles by wrapper id: the page's own and the ones it is set against. */
  bundles: Record<string, Bundle>;
  /** Sourced figures by name (a record's rate, a rule's figure, P-05's assumption). */
  facts: Record<string, SiteValue>;
  /** Things the visual needs that the data does not hold yet: each shows "עוד לא חושב" with its reason (copy `guideSignature.gaps`). */
  gaps: string[];
  /** Rule ids the visual cites beyond those its bundles read. */
  ruleIds: string[];
}

/** The wrappers whose illustrative run rests on a cash rate, not on A-01 (the timeline edits "ריבית בשנה" for them). */
export const cashLikeIds = ["current-account", "bank-deposit", "savings-plan", "money-market-fund-daily", "money-market-fund-renewable", "makam", "government-bond"];

export const fact = (d: SignatureData, key: string): SiteValue | undefined => d.facts[key];
export const factNumber = (d: SignatureData, key: string): number | null => {
  const v = d.facts[key]?.value;
  return typeof v === "number" ? v : null;
};

/** One engine run of `bundle` with the entered values, stopped after `months` months (a sale or a withdrawal that month). Null when the run cannot happen. */
export function runAtMonths(bundle: Bundle, entered: Partial<Record<P05Input, number>>, months: number): RunResult | null {
  try {
    const e: Partial<Record<P05Input, ValueObject>> = {};
    for (const [key, value] of Object.entries(entered) as [P05Input, number][]) if (Number.isFinite(value)) e[key] = enteredValue(value, p05Units[key], bundle.runDate);
    const plan = runInputs(bundle.record, [bundle.p05], bundle.terms, { entered: e, profile: {}, scenarioIncome: true });
    const stepped = { ...plan, input: { ...plan.input, goal: { ...plan.input.goal, months } } } as typeof plan;
    return runPlanned(stepped, { rules: bundle.rules, runDate: bundle.runDate });
  } catch {
    return null;
  }
}

const totalFees = (r: RunResult) => Object.values(r.fees).reduce((a, b) => a + b, 0);

// ---------------------------------------------------------------- current account

export interface AccountModel {
  /** In today's money, year 0 to `years`. */
  points: { year: number; account: number; fund: number }[];
  start: number;
  end: { account: number; fund: number; cost: number };
}

/**
 * What money costs while it sits in the current account, against a daily money-market fund (F-26 with its ceiling, F-23): both runs
 * in today's money with no monthly deposit. Without the bank's conditions the account pays no interest (BANK-09: the table pays
 * customers who meet them), which the run takes as a rate of 0.
 */
export function currentAccountModel(d: SignatureData, c: { balance: number; years: number; conditionsMet: boolean }): AccountModel | null {
  const account = d.bundles["current-account"];
  const fund = d.bundles["money-market-fund-daily"];
  if (!account || !fund) return null;
  const entered = { amount_now: c.balance, monthly_deposit: 0, horizon_years: c.years };
  const a = runTimeline(account, { entered: c.conditionsMet ? entered : { ...entered, cash_rate: 0 }, age: null });
  const f = runTimeline(fund, { entered, age: null });
  if (a.kind !== "ok" || f.kind !== "ok") return null;
  const points = [{ year: 0, account: c.balance, fund: c.balance }, ...a.years.map((p, i) => ({ year: p.year, account: p.real, fund: f.years[i]!.real }))];
  const last = points[points.length - 1]!;
  return { points, start: c.balance, end: { account: last.account, fund: last.fund, cost: last.fund - last.account } };
}

// ---------------------------------------------------------------- bank deposit

export type BreakKind = "not-allowed" | "free" | "other";

/**
 * What the deposit record says about breaking it, as the fact `break` holds it (value `not_allowed`, `none` or the penalty kind):
 * `not-allowed` and `free` are computable; anything else is the bank's words and "עוד לא חושב" (the engine does not model a break, G-16).
 */
export function breakKindOf(v: SiteValue | undefined): BreakKind {
  if (!v) return "other";
  if (v.value === "not_allowed") return "not-allowed";
  return v.value === "none" ? "free" : "other";
}

export interface DepositModel {
  term: number;
  /** Net amount of the deposit at the end of its term (F-21 with the bank's withholding), nominal. */
  atTerm: number;
  /** Net amount of the daily fund if the money is taken out after `month` months, nominal. */
  fundAt: (month: number) => number | null;
  fundAtTerm: number;
  /** The gap at the end of the term: fund less deposit (negative when the deposit pays more). */
  gap: number;
}

export function depositModel(d: SignatureData, c: { amount: number }): DepositModel | null {
  const dep = d.bundles["bank-deposit"];
  const fund = d.bundles["money-market-fund-daily"];
  const term = factNumber(d, "term");
  if (!dep || !fund || term === null) return null;
  const base = { amount_now: c.amount, monthly_deposit: 0 };
  const end = runAtMonths(dep, base, term);
  const fundEnd = runAtMonths(fund, base, term);
  if (!end || !fundEnd) return null;
  const fundAt = (month: number) => (month <= 0 ? c.amount : (runAtMonths(fund, base, month)?.nominal ?? null));
  return { term, atTerm: end.nominal, fundAt, fundAtTerm: fundEnd.nominal, gap: fundEnd.nominal - end.nominal };
}

// ---------------------------------------------------------------- savings plan

export interface PlanRow {
  /** Month the deposit goes in, counted from the plan's start (0 is the first). */
  from: number;
  /** The month its lock ends (F-22 reading: each deposit has the plan's term). */
  unlock: number;
}

export interface PlanModel {
  term: number;
  rows: PlanRow[];
  /** The net value of one deposit when its term ends (an engine run of the plan's record for one deposit). */
  perDeposit: number;
  lastUnlock: number;
  at: (month: number) => { free: number; locked: number; freeValue: number; lockedPrincipal: number; notYet: number };
}

export function planModel(d: SignatureData, c: { monthly: number; deposits: number }): PlanModel | null {
  const plan = d.bundles["savings-plan"];
  const term = factNumber(d, "term");
  if (!plan || term === null) return null;
  const one = runAtMonths(plan, { amount_now: c.monthly, monthly_deposit: 0 }, term);
  if (!one) return null;
  const rows: PlanRow[] = Array.from({ length: c.deposits }, (_, from) => ({ from, unlock: from + term }));
  return {
    term,
    rows,
    perDeposit: one.nominal,
    lastUnlock: rows[rows.length - 1]!.unlock,
    at: (month) => {
      const free = rows.filter((r) => r.unlock <= month).length;
      const locked = rows.filter((r) => r.from <= month && r.unlock > month).length;
      return { free, locked, freeValue: free * one.nominal, lockedPrincipal: locked * c.monthly, notYet: c.deposits - free - locked };
    },
  };
}

// ---------------------------------------------------------------- the ladder (daily money-market fund)

export type Speed = "any-time" | "trading-day" | "fixed-dates" | "at-maturity";
export const speedOrder: Speed[] = ["any-time", "trading-day", "fixed-dates", "at-maturity"];

export interface LadderRow {
  id: string;
  speed: Speed;
  rate: SiteValue;
  /** `published`: a bank's own table; `assumption`: the site's P-05 `cash_rate` (D20). */
  kind: "published" | "assumption";
  /** The term of a row that comes back only at its end. */
  term?: SiteValue;
  /** The balance that earns the rate, of a current account. */
  ceiling?: SiteValue;
}

/** The four products on the ladder, from the fastest to the slowest, each with its rate and where the rate comes from. */
export function ladderRows(d: SignatureData): LadderRow[] {
  const rows: LadderRow[] = [];
  const cur = fact(d, "currentRate");
  if (cur) rows.push({ id: "current-account", speed: "any-time", rate: cur, kind: "published", ...(fact(d, "currentCeiling") ? { ceiling: fact(d, "currentCeiling")! } : {}) });
  const assumed = fact(d, "cashRate");
  if (assumed) {
    rows.push({ id: "money-market-fund-daily", speed: "trading-day", rate: assumed, kind: "assumption" });
    rows.push({ id: "money-market-fund-renewable", speed: "fixed-dates", rate: assumed, kind: "assumption" });
  }
  const dep = fact(d, "depositRate");
  if (dep) rows.push({ id: "bank-deposit", speed: "at-maturity", rate: dep, kind: "published", ...(fact(d, "depositTerm") ? { term: fact(d, "depositTerm")! } : {}) });
  return rows.sort((a, b) => speedOrder.indexOf(a.speed) - speedOrder.indexOf(b.speed));
}

/** The best rate among the rows that bring the money back within `need` (the order of `speedOrder`). */
export function bestWithin(rows: LadderRow[], need: Speed): LadderRow | null {
  const ok = rows.filter((r) => speedOrder.indexOf(r.speed) <= speedOrder.indexOf(need));
  return ok.reduce<LadderRow | null>((best, r) => (best === null || (r.rate.value as number) > (best.rate.value as number) ? r : best), null);
}

// ---------------------------------------------------------------- renewable money-market fund

export interface FixedDateModel {
  /** ISO date of the series' fixed redemption date (read from the fund record's name), when it is still ahead. */
  known: string | null;
  /** ISO date of the latest the date after it can be (MF-08: at most `maxInterval` months between adjacent fixed dates). */
  latestAfter: string | null;
  /** Days from `needOn` to the first fixed date on or after it; null when `needOn` is after the known date. */
  waitDays: number | null;
}

const MS = 86_400_000;
export const isoOf = (t: number) => new Date(t).toISOString().slice(0, 10);
export const dayOf = (iso: string) => Date.parse(iso + "T00:00:00Z");
export const addDays = (iso: string, n: number) => isoOf(dayOf(iso) + n * MS);
export const daysBetween = (a: string, b: string) => Math.round((dayOf(b) - dayOf(a)) / MS);

export function addMonthsIso(iso: string, months: number): string {
  const d = new Date(dayOf(iso));
  const day = d.getUTCDate();
  d.setUTCMonth(d.getUTCMonth() + months);
  if (d.getUTCDate() !== day) d.setUTCDate(0); // 31 Jan + 1 month stays inside February
  return isoOf(d.getTime());
}

export function fixedDateModel(d: SignatureData, c: { today: string; needOn: string }): FixedDateModel {
  const series = fact(d, "seriesDate");
  const max = factNumber(d, "maxInterval");
  const known = series && typeof series.value === "string" && series.value >= c.today ? series.value : null;
  const latestAfter = known && max !== null ? addMonthsIso(known, max) : null;
  const waitDays = known && c.needOn <= known ? daysBetween(c.needOn, known) : null;
  return { known, latestAfter, waitDays };
}

// ---------------------------------------------------------------- makam

export interface MakamModel {
  /** Months to redemption at purchase (the ledger's series term). */
  term: number;
  yieldPct: number;
  /** Price per 100 face value at each month 0 to `term` (F-24, GOV-06). */
  prices: number[];
  /** Price at the sale month. */
  price: number;
  /** The gain before fees and tax, from the engine run (sale gain, or the discount at redemption). */
  gain: number;
  tax: number;
  fees: number;
  net: number;
  /** True when the sale month is the redemption (the discount is taxed as interest, TXI-11) rather than a capital gain (TXI-12). */
  atRedemption: boolean;
  /** The sale is blocked by an open rule (the run lists it, not ranked). */
  blocked: string | null;
}

export function makamModel(d: SignatureData, c: { amount: number; month: number }): MakamModel | null {
  const b = d.bundles["makam"];
  if (!b) return null;
  const term = b.terms.makam?.termMonths ?? 12;
  const y = p05Number(b.p05, "cash_rate") / 100;
  const prices = Array.from({ length: term + 1 }, (_, m) => makamPrice(y, (365 * (term - m)) / 12));
  const month = Math.min(Math.max(c.month, 1), term);
  const run = runAtMonths(b, { amount_now: c.amount, monthly_deposit: 0 }, month);
  if (!run) return null;
  const fees = totalFees(run);
  const tax = run.taxDuring + run.taxAtExit;
  return { term, yieldPct: y * 100, prices, price: prices[month]!, gain: run.nominal + tax + fees - run.paidIn, tax, fees, net: run.nominal, atRedemption: month >= term, blocked: run.outcome.code === "listed-not-ranked" ? run.outcome.reason : null };
}

// ---------------------------------------------------------------- government bond

export interface BondModel {
  couponPct: number;
  perYear: number;
  years: number;
  shiftPct: number;
  /** Price per 100 face after the move (F-25, bondPrice); a sale today at this price. */
  price: number;
  /** The change of the price from par, percent. */
  changePct: number;
  /** The same shift on a makam of the ledger's term, percent (F-24): the short instrument the bond is set against. */
  makamChangePct: number;
  /** Of `amount`: what a sale today brings against the amount paid (before fees and tax). */
  saleValue: number;
  /** Held to redemption: the face value comes back (GOV-11) and the coupons were paid on the way. */
  redemption: number;
  coupons: number;
}

export function bondModel(d: SignatureData, c: { amount: number; years: number; shiftPct: number }): BondModel | null {
  const b = d.bundles["government-bond"];
  const every = factNumber(d, "couponEvery");
  if (!b || every === null) return null;
  const coupon = p05Number(b.p05, "cash_rate") / 100;
  const perYear = 12 / every;
  const y = Math.max(0.0001, coupon + c.shiftPct / 100);
  const price = bondPrice(coupon, y, c.years, perYear);
  const makamTerm = d.bundles["makam"]?.terms.makam?.termMonths ?? 12;
  const makamDays = (365 * makamTerm) / 12;
  const makamChange = (makamPrice(y, makamDays) / makamPrice(coupon, makamDays) - 1) * 100;
  return {
    couponPct: coupon * 100,
    perYear,
    years: c.years,
    shiftPct: c.shiftPct,
    price,
    changePct: price - 100,
    makamChangePct: makamChange,
    saleValue: (c.amount * price) / 100,
    redemption: c.amount,
    coupons: c.amount * coupon * c.years,
  };
}
