// The numbers behind the second wave of "what makes it different" visuals (D29): the study fund, the provident fund for investing and the
// pensions. Pure functions over the data the page loader ships (`SignatureData`): each figure is an engine run on a bundle, or an engine
// formula (F-31, F-32, F-53) over a sourced figure, never a number typed here. The components wrap the results in `computed(...)` value objects.
import {
  beneficiaryRelief,
  employeeCredit,
  employerLinePension,
  withFee,
  insuranceCost,
  limitStanding,
  moneyStory,
  ruleBook,
  runInputs,
  runPlanned,
  type InstrumentTerms,
  type LimitStanding,
  type MoneyStory,
  type P05Input,
  type Profile,
  type RunResult,
} from "@finance-tool/engine";
import type { RuleRecord, ValueObject } from "@finance-tool/schema";
import { paidInToday, type Bundle } from "./engine";
import type { SignatureData } from "./guide-signature";
import { factNumber } from "./guide-signature";
import { entered as enteredValue, p05Units } from "./value";

export type Employment = "employee" | "self-employed";

// ---------------------------------------------------------------- one engine run, with the terms and the profile changed

export interface RunOver {
  terms?: InstrumentTerms;
  profile?: Profile;
}

export type RunOutcome = { run: RunResult } | { error: string };

/** One engine run of `bundle`'s ledger stopped after `months` months, with `over` replacing the bundle's terms or profile. The reason when it cannot run. */
export function runWithResult(bundle: Bundle, entered: Partial<Record<P05Input, number>>, months: number, over: RunOver = {}): RunOutcome {
  try {
    const e: Partial<Record<P05Input, ValueObject>> = {};
    for (const [key, value] of Object.entries(entered) as [P05Input, number][]) if (Number.isFinite(value)) e[key] = enteredValue(value, p05Units[key], bundle.runDate);
    const plan = runInputs(bundle.record, [bundle.p05], over.terms ?? bundle.terms, { entered: e, profile: over.profile ?? {}, scenarioIncome: true });
    const stepped = { ...plan, input: { ...plan.input, goal: { ...plan.input.goal, months } } } as typeof plan;
    return { run: runPlanned(stepped, { rules: bundle.rules, runDate: bundle.runDate }) };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

export const runWith = (bundle: Bundle, entered: Partial<Record<P05Input, number>>, months: number, over: RunOver = {}): RunResult | null => {
  const r = runWithResult(bundle, entered, months, over);
  return "run" in r ? r.run : null;
};

/**
 * A run's end, in today's money (F-06): what is left, what was paid in, the tax and the costs. What was paid in is each deposit at its own
 * month's index (`paidInToday`, the amount now at I_0); dividing the whole sum by the last month's index would shrink every deposit by the
 * inflation of the whole horizon and show idle money as a gain. The tax is at the exit, so it is divided by the exit month's index, and the
 * costs by the same index (the site's convention, as the timeline's table).
 */
export interface Side {
  run: RunResult;
  net: number;
  paidIn: number;
  /** What is left less what was paid in. */
  gain: number;
  tax: number;
  fees: number;
}

export function sideOf(run: RunResult, amountNow: number): Side {
  const index = run.series[run.series.length - 1]!.index;
  const paidIn = paidInToday(run, amountNow);
  return { run, net: run.real, paidIn, gain: run.real - paidIn, tax: (run.taxAtExit + run.taxDuring) / index, fees: Object.values(run.fees).reduce((a, b) => a + b, 0) / index };
}

/** Whether the run is a real end value: not held back by an open rule (B3), so its tax is counted. */
export const settled = (r: RunResult) => r.outcome.code === "eligible";

// ---------------------------------------------------------------- study fund

export type HishtalmutGap = "self-employed-early" | "blocked" | "no-run";

export interface DiffRange {
  low: number;
  high: number;
  /** Where the range is over bundles: the bundle each end ran on, so its figure can name that bundle's terms. */
  lowOf?: string;
  highOf?: string;
}

/** The study fund's terms for the person: employment and the start of the six-year clock (A-12); `early` opts into withdrawing before the lock ends (B3, F-47). */
export function hishtalmutTerms(bundle: Bundle, c: { employment: Employment; income: number; early: boolean }): InstrumentTerms {
  const h: NonNullable<InstrumentTerms["hishtalmut"]> = c.employment === "employee" ? { employment: "employee", monthlySalary: c.income, clockStartMonth: 0 } : { employment: "self-employed", clockStartMonth: 0 };
  if (c.early) h.earlyWithdrawal = true;
  return { ...bundle.terms, hishtalmut: h };
}

/** The bundle's terms with the balance fee of another track (percent a year) for the whole run, its discount gone (A-19); the rest as it was. */
function withBalanceFee(terms: InstrumentTerms, feePct: number): InstrumentTerms {
  return terms.fees ? { ...terms, fees: withFee(terms.fees, "balance", feePct / 100) } : terms;
}

/** The plan the study fund's drawing runs. An employee's two deposits are a share of the salary; a self-employed person has one deposit, the net outlay. */
export interface StudyStoryCase {
  employment: Employment;
  /** An employee's monthly salary, or a self-employed person's monthly income (A-12). */
  income: number;
  /** The person's own monthly deposit: for a self-employed person, what it costs after the deduction. */
  ownMonthly: number;
  /** The employer's monthly deposit; 0 for a self-employed person. */
  employerMonthly: number;
  /** A-01, percent a year. */
  returnPct: number;
  /** The fund's balance fee, percent a year, when the person typed one; otherwise the track's. */
  feePct?: number | null;
}

export type StudySlice = MoneyStory;

export type StudyYear = { slice: StudySlice; gap: null; runs: RunResult[] } | { slice: null; gap: HishtalmutGap; runs: [] };

/**
 * One withdrawal's story (F-96). An employee's own and employer's money are two runs of F-27, each with its own limit (TXH-08, TXH-01): the
 * employer's run alone taxes its deposits at an early withdrawal (F-47). The gains of the own run are stacked on the salary plus the employer's benefited
 * deposits and gains withdrawn (a modelling choice, as in F-47; the part above the limit was income when paid, TXH-03). A self-employed person's early withdrawal is business income including the deducted deposits (TXH-07), which
 * the engine does not compute: no figure.
 */
export function studyYear(study: Bundle, lockYears: number, c: StudyStoryCase, year: number, feePct?: number): StudyYear {
  const early = year < lockYears;
  const months = year * 12;
  const annualIncome = 12 * c.income;
  const entered = (monthly: number) => ({ amount_now: 0, monthly_deposit: monthly, "A-01": c.returnPct });
  const terms = (money?: "employer") => {
    const t = hishtalmutTerms(study, { employment: c.employment, income: c.income, early });
    const withMoney = c.employment === "employee" ? { ...t, hishtalmut: { ...t.hishtalmut!, salaryFollowsPrices: true, ...(money ? { money } : {}) } } : t;
    const fee = feePct ?? c.feePct;
    return fee === undefined || fee === null ? withMoney : withBalanceFee(withMoney, fee);
  };
  const fail = (run: RunOutcome): StudyYear | null => ("error" in run ? { slice: null, gap: "no-run", runs: [] } : settled(run.run) ? null : { slice: null, gap: "blocked", runs: [] });
  if (c.employment === "self-employed") {
    if (early) return { slice: null, gap: "self-employed-early", runs: [] };
    const run = runWithResult(study, entered(c.ownMonthly), months, { terms: terms(), profile: { annualIncome } });
    if ("error" in run || !settled(run.run)) return fail(run)!;
    return { slice: moneyStory(paidInToday(run.run, 0), run.run.detail.reliefToday ?? 0, [run.run]), gap: null, runs: [run.run] };
  }
  const employer = runWithResult(study, entered(c.employerMonthly), months, { terms: terms("employer"), profile: { annualIncome } });
  if ("error" in employer || !settled(employer.run)) return fail(employer)!;
  const stacked = early ? { otherIncome: annualIncome + (employer.run.detail.earlyEmployerDeposits ?? 0) + (employer.run.detail.earlyGains ?? 0) } : {};
  const mine = runWithResult(study, entered(c.ownMonthly), months, { terms: terms(), profile: { annualIncome, ...stacked } });
  if ("error" in mine || !settled(mine.run)) return fail(mine)!;
  return { slice: moneyStory(paidInToday(mine.run, 0), paidInToday(employer.run, 0), [mine.run, employer.run]), gap: null, runs: [mine.run, employer.run] };
}

/** Every year of the drawing's strip, from the first to `years`. */
export function studyYears(d: SignatureData, c: StudyStoryCase, years: number): StudyYear[] {
  const study = d.bundles["keren-hishtalmut"];
  const lockYears = factNumber(d, "lockYears");
  const none: StudyYear = { slice: null, gap: "no-run", runs: [] };
  return Array.from({ length: years }, (_, i) => (study && lockYears !== null ? studyYear(study, lockYears, c, i + 1) : none));
}

export type StudyStanding = LimitStanding & {
  /** The salary passes the ceiling within the strip, so what is above the limit keeps growing in today's money (TXH-02). */
  grows: boolean;
};

/** F-97 over the runs of the strip's last year, which hold every deposit. */
export function studyStanding(d: SignatureData, c: StudyStoryCase, years: readonly StudyYear[]): StudyStanding | null {
  const runs = years[years.length - 1]?.runs ?? [];
  if (runs.length === 0) return null;
  const cap = factNumber(d, "determiningCap");
  const index = runs[0]!.series[runs[0]!.series.length - 1]!.index;
  return { ...limitStanding(runs), grows: c.employment === "employee" && cap !== null && c.income * index > cap };
}

/** Whether any year from the lock's end has tax: what is above the limit is taxed only where it earned more than prices rose or was the employer's (F-46, F-52). */
export const taxedAfterLock = (years: readonly StudyYear[], lockYears: number) => years.some((y, i) => i + 1 >= lockYears && (y.slice?.tax ?? 0) > 1);

export interface StudyRange {
  /** What is left at the dearest and the cheapest fee reported on the index (rule 3), everything else the same. */
  fund: DiffRange | null;
  /** A self-employed person only: the same outlay in a securities account on the same index, and how far it moves with the bank or broker. */
  account: { net: number; range: DiffRange | null } | null;
}

/** What depends on who is chosen, at the year picked. */
export function studyRange(d: SignatureData, c: StudyStoryCase, year: number): StudyRange {
  const study = d.bundles["keren-hishtalmut"];
  const lockYears = factNumber(d, "lockYears");
  const low = d.facts.rangeMin?.value;
  const high = d.facts.rangeMax?.value;
  const netAt = (fee: unknown) => (study && lockYears !== null && typeof fee === "number" ? (studyYear(study, lockYears, c, year, fee).slice?.net ?? null) : null);
  const [dear, cheap] = [netAt(high), netAt(low)];
  const fund = dear !== null && cheap !== null ? { low: Math.min(dear, cheap), high: Math.max(dear, cheap) } : null;
  if (c.employment !== "self-employed") return { fund, account: null };
  const accountNet = (key: string) => {
    const b = d.bundles[key];
    const run = b ? runWith(b, { amount_now: 0, monthly_deposit: c.ownMonthly, "A-01": c.returnPct }, year * 12, { profile: { annualIncome: 12 * c.income } }) : null;
    return run && settled(run) ? run.real : null;
  };
  const net = accountNet("brokerage-account");
  const [best, worst] = [accountNet("brokerage-best"), accountNet("brokerage-worst")];
  return { fund, account: net === null ? null : { net, range: best !== null && worst !== null ? { low: Math.min(best, worst), high: Math.max(best, worst) } : null } };
}

// ---------------------------------------------------------------- provident fund for investing

// ---------------------------------------------------------------- pension

export interface PensionCase {
  /** Monthly gross salary (A-12). */
  salary: number;
  years: number;
  /** A-17, entered by the person: the insurance cost as a percent of each deposit; null when not entered. */
  insurancePct: number | null;
}

export interface PensionModel {
  /** The salary the minimum rates apply to: the lower of the salary and the average wage (PEN-04). */
  wage: number;
  rates: { employee: number; employer: number; severance: number };
  /** Gross monthly deposits at the minimum rates, in NIS. */
  you: number;
  employer: number;
  severance: number;
  total: number;
  /** The yearly relief on the person's own deposit (F-31 credit, or F-32 with a deduction for a beneficiary member), and per month. */
  relief: { formula: "F-31" | "F-32"; beneficiary: boolean; yearly: number; monthly: number; credit: number; deductionValue: number };
  /** What the person's own deposit costs after the relief, per month. */
  netYou: number;
  /** F-53: the insurance cost inside the fund per month at A-17, or null when A-17 is not entered (or the product has none). */
  insuranceMonthly: number | null;
  /** The engine's end balance of the deposits, both lines, in today's money, before the fund turns it into a pension (F-49 blocked). */
  balance: { real: number; years: number } | null;
  /** Why there is no balance: no fees for the wrapper, a run that failed, or on the general fund's page, no deposit above the
   *  comprehensive fund's ceiling (`below-ceiling`) or an excess the rule base does not divide between the parts (`general-split`). */
  balanceGap: "no-fees" | "no-run" | "below-ceiling" | "general-split" | null;
  /** On the general fund's page only (PEN-10): the comprehensive fund's monthly deposit ceiling (PEN-08) and the part of the month's
   *  deposit above it, the money that reaches the general fund at these rates (PEN-10 names other cases the visual does not show). Null on the other pages. */
  general: { ceiling: number; toGeneral: number } | null;
  /** Rule ids the model read: the forward relief and the engine runs. */
  rules: string[];
}

/**
 * The deposits of a salaried person at the legal minimum rates (PEN-03) on the insured wage (PEN-04), the relief on the person's own part
 * (F-31 credit, or F-32 when employee and employer together reach the beneficiary-member threshold, TXP-03: the same dispatch F-30 solves
 * for), the insurance (F-53) and, from the engine's pension ledger, what the deposits grow to. The pension itself needs conversion factors
 * the site does not hold (PEN OQ7, G-03): no figure. A general fund receives only the deposit above the comprehensive fund's ceiling
 * (PEN-10, PEN-08): on its page the deposit is split at the ceiling, and with nothing above it there is no balance, insurance or fee for
 * the general fund (method F-67, "The general fund").
 */
export function pensionModel(d: SignatureData, id: string, c: PensionCase): PensionModel | null {
  const bundle = d.bundles[id];
  if (!bundle) return null;
  const book = ruleBook({ rules: bundle.rules, runDate: bundle.runDate });
  try {
    const rates = { employee: book.rate("PEN-03", "employee_pct"), employer: book.rate("PEN-03", "employer_pct"), severance: book.rate("PEN-03", "severance_pct") };
    const wage = Math.min(c.salary, book.amount("PEN-04", "average_wage"));
    const you = rates.employee * wage;
    const employer = rates.employer * wage;
    const severance = rates.severance * wage;
    const income = 12 * c.salary;
    const facts = { taxableIncome: income, insuredIncome: income, existingOwn: 0, employer: 12 * (employer + severance) };
    const brackets = book.brackets("TXG-02", "brackets");
    const beneficiary = 12 * you + facts.employer >= book.amount("TXP-03", "threshold");
    const r = beneficiary ? beneficiaryRelief(book, facts, 12 * you, brackets, true) : employeeCredit(book, facts, 12 * you);
    const relief = { formula: r.formula, beneficiary, yearly: r.relief, monthly: r.relief / 12, credit: r.credit / 12, deductionValue: r.deductionValue / 12 };
    const total = you + employer + severance;
    const hasInsurance = id !== "provident-for-annuity";
    const relieved = { wage, rates, you, employer, severance, total, relief, netYou: you - relief.monthly };

    // the general fund: only what is above the comprehensive fund's monthly ceiling reaches it (PEN-10); how an excess divides between
    // the person's, the employer's and the severance parts is not in the rule base, so a positive excess has no balance either
    if (id === "pension-general") {
      const ceiling = book.amount("PEN-08", "monthly_deposit_ceiling");
      const toGeneral = Math.max(0, total - ceiling);
      return { ...relieved, insuranceMonthly: null, balance: null, balanceGap: toGeneral > 0 ? "general-split" : "below-ceiling", general: { ceiling, toGeneral }, rules: book.used().map((u) => u.id) };
    }
    const insuranceMonthly = hasInsurance && c.insurancePct !== null ? insuranceCost(c.insurancePct / 100, total) : null;

    // the end balance: the person's own money through the pension ledger (F-30 turns the net outlay into the gross deposit), the employer's through F-52
    let balance: PensionModel["balance"] = null;
    let balanceGap: PensionModel["balanceGap"] = null;
    const used = new Set(book.used().map((u) => u.id));
    if (!bundle.terms.fees) balanceGap = "no-fees";
    else {
      const terms: InstrumentTerms = {
        ...bundle.terms,
        pension: { employment: "employee", monthlySalary: c.salary, existingEmployeeRate: 0, employer: { pensionRate: rates.employer * (wage / c.salary), severanceRate: rates.severance * (wage / c.salary) } },
        ...(hasInsurance ? { insurance: { rate: (c.insurancePct ?? 0) / 100 } } : {}),
      };
      try {
        const plan = runInputs(bundle.record, [bundle.p05], terms, {
          entered: { amount_now: enteredValue(0, "nis", bundle.runDate), monthly_deposit: enteredValue(you - relief.monthly, "nis_per_month", bundle.runDate), horizon_years: enteredValue(c.years, "years", bundle.runDate) },
          profile: { annualIncome: income },
          scenarioIncome: true,
        });
        if (plan.run !== "runPension") balanceGap = "no-run";
        else {
          // a salary-based deposit stays the same in nominal terms, as the employer's line does (F-52)
          plan.input.goal.contributions = "nominal";
          const ctx = { rules: bundle.rules, runDate: bundle.runDate };
          const own = runPlanned(plan, ctx);
          const line = employerLinePension(plan.input, ctx);
          const index = own.series[own.series.length - 1]!.index;
          balance = { real: (own.nominal + line.nominal) / index, years: c.years };
          for (const u of [...own.rules, ...line.rules]) used.add(u.id);
        }
      } catch {
        balanceGap = "no-run";
      }
    }
    return { ...relieved, insuranceMonthly, balance, balanceGap, general: null, rules: [...used] };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- the rules a bundle's variants read (build time)

/** Rule records the visual's runs may read, found by running the variants (the client runs them again for any entered value). */
export function rulesRead(bundle: Bundle, all: Record<string, RuleRecord>, variants: ((b: Bundle) => RunResult | null)[]): RuleRecord[] {
  const open: Bundle = { ...bundle, rules: Object.values(all) };
  const ids = new Set<string>();
  for (const run of variants) for (const u of run(open)?.rules ?? []) ids.add(u.id);
  return Object.values(all).filter((r) => ids.has(r.id));
}
