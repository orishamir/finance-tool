// The numbers behind the second wave of "what makes it different" visuals (D29): the study fund, the provident fund for investing and the
// pensions. Pure functions over the data the page loader ships (`SignatureData`): each figure is an engine run on a bundle, or an engine
// formula (F-31, F-32, F-53) over a sourced figure, never a number typed here. The components wrap the results in `computed(...)` value objects.
import {
  beneficiaryRelief,
  employeeCredit,
  employerLinePension,
  insuranceCost,
  ruleBook,
  runInputs,
  runPlanned,
  type InstrumentTerms,
  type P05Input,
  type Profile,
  type RunResult,
} from "@finance-tool/engine";
import type { RuleRecord, ValueObject } from "@finance-tool/schema";
import { p05Units, paidInToday, type Bundle } from "./engine";
import type { SignatureData } from "./guide-signature";
import { factNumber } from "./guide-signature";
import { entered as enteredValue } from "./value";

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

export interface HishtalmutCase {
  amount: number;
  monthly: number;
  /** Years until the money is taken out. */
  years: number;
  employment: Employment;
  /** An employee's monthly salary, or a self-employed person's monthly income (A-12). */
  income: number;
}

export type HishtalmutGap = "self-employed-early" | "blocked" | "no-run";

export interface HishtalmutModel {
  years: number;
  /** The rule's lock in years (TXH-09); null when the rule's figure is missing, and then there is no study-fund side. */
  lockYears: number | null;
  /** The money is taken out before the lock ends. */
  early: boolean;
  study: Side | null;
  studyGap: HishtalmutGap | null;
  broker: Side | null;
  /** Study fund less brokerage account, both after fees and tax, in today's money; null when either side is missing. */
  diff: number | null;
  /** Rule 3: how far the difference moves with the bank or broker, and with the fund manager: the lowest and the highest difference. */
  range: { broker: DiffRange | null; manager: DiffRange | null };
  /** An employee: the part of the monthly deposit that is a benefited deposit and the part above it (F-27, TXH-08). */
  benefitedMonthly: number | null;
  excessMonthly: number | null;
  /** A self-employed person: the tax the deduction saved over the whole run and the yearly deduction ceiling (F-30, TXH-05). */
  reliefTotal: number | null;
  deductionCap: number | null;
}

export interface DiffRange {
  low: number;
  high: number;
}

/** The study fund's terms for the person: employment and the start of the six-year clock (A-12); `early` opts into withdrawing before the lock ends (B3, F-47). */
export function hishtalmutTerms(bundle: Bundle, c: { employment: Employment; income: number; early: boolean }): InstrumentTerms {
  const h: NonNullable<InstrumentTerms["hishtalmut"]> = c.employment === "employee" ? { employment: "employee", monthlySalary: c.income, clockStartMonth: 0 } : { employment: "self-employed", clockStartMonth: 0 };
  if (c.early) h.earlyWithdrawal = true;
  return { ...bundle.terms, hishtalmut: h };
}

/** The bundle's terms with the balance fee of another track (percent a year), the rest as it was. */
export function withBalanceFee(terms: InstrumentTerms, feePct: number): InstrumentTerms {
  return terms.fees ? { ...terms, fees: { ...terms.fees, balance: feePct / 100 } } : terms;
}

const rangeOf = (diffs: (number | null)[]): DiffRange | null => {
  const v = diffs.filter((x): x is number => x !== null);
  return v.length < 2 ? null : { low: Math.min(...v), high: Math.max(...v) };
};

/**
 * What the six-year lock buys (F-46, F-47 against F-08 and F-40): the same index in a study fund and in a brokerage account, the same
 * outlay, after fees and tax, taken out after `years` years. Before the lock ends the study fund is withdrawn early (F-47). A self-employed
 * person's early withdrawal is business income including the deducted deposits (TXH-07), which the engine does not compute: no figure.
 */
export function hishtalmutModel(d: SignatureData, c: HishtalmutCase): HishtalmutModel {
  const study = d.bundles["keren-hishtalmut"];
  const lockYears = factNumber(d, "lockYears");
  const early = lockYears !== null && c.years < lockYears;
  const entered = { amount_now: c.amount, monthly_deposit: c.monthly };
  const months = c.years * 12;
  const profile = { annualIncome: 12 * c.income };
  const studyRun = (feePct?: number): { side: Side | null; gap: HishtalmutGap | null; detail: Record<string, number> } => {
    if (!study || lockYears === null) return { side: null, gap: "no-run", detail: {} };
    if (early && c.employment === "self-employed") return { side: null, gap: "self-employed-early", detail: {} };
    const terms = hishtalmutTerms(study, { employment: c.employment, income: c.income, early });
    const r = runWithResult(study, entered, months, { terms: feePct === undefined ? terms : withBalanceFee(terms, feePct), profile });
    if (!("run" in r)) return { side: null, gap: "no-run", detail: {} };
    if (!settled(r.run)) return { side: null, gap: "blocked", detail: {} };
    return { side: sideOf(r.run, c.amount), gap: null, detail: r.run.detail };
  };
  const brokerSide = (key: string): Side | null => {
    const b = d.bundles[key];
    const run = b ? runWith(b, entered, months) : null;
    return run && settled(run) ? sideOf(run, c.amount) : null;
  };
  const main = studyRun();
  const broker = brokerSide("brokerage-account");
  const diff = main.side && broker ? main.side.gain - broker.gain : null;
  const diffWith = (s: Side | null, b: Side | null) => (s && b ? s.gain - b.gain : null);
  const lowFee = d.facts.rangeMin?.value;
  const highFee = d.facts.rangeMax?.value;
  const range = {
    broker: main.side ? rangeOf([diff, diffWith(main.side, brokerSide("brokerage-best")), diffWith(main.side, brokerSide("brokerage-worst"))]) : null,
    manager: broker && typeof lowFee === "number" && typeof highFee === "number" ? rangeOf([diff, diffWith(studyRun(lowFee).side, broker), diffWith(studyRun(highFee).side, broker)]) : null,
  };
  const detail = main.detail;
  return {
    years: c.years,
    lockYears,
    early,
    study: main.side,
    studyGap: main.gap,
    broker,
    diff,
    range,
    benefitedMonthly: c.employment === "employee" ? (detail.benefitedMonthly ?? null) : null,
    excessMonthly: c.employment === "employee" ? (detail.excessMonthly ?? null) : null,
    reliefTotal: c.employment === "self-employed" ? (detail.reliefTotal ?? null) : null,
    deductionCap: c.employment === "self-employed" ? (detail.deductionCap ?? null) : null,
  };
}

// ---------------------------------------------------------------- provident fund for investing

export interface ProvidentCase {
  amount: number;
  monthly: number;
  /** Years until the money is taken out. */
  years: number;
  /** The person's age today, when known. */
  age: number | null;
}

export interface ProvidentModel {
  years: number;
  /** The age at the marker (age today plus the years); null when the age is not known. */
  ageAtExit: number | null;
  /** From the early retirement age the money can move to an annuity fund (TXK-10); null when the age is not known. */
  annuityOpen: boolean | null;
  lump: Side | null;
  broker: Side | null;
  /** Provident less brokerage account, after fees and tax. */
  diff: number | null;
  /** Rule 3: how far the difference moves with the bank or broker and with the fund manager. */
  range: { broker: DiffRange | null; manager: DiffRange | null };
  /** The 15%-of-nominal sensitivity of the same lump sum (TXK-06 second limb, G-02): the tax and the amount left. */
  alt: { tax: number; net: number } | null;
  /** The balance that would move to an annuity fund at the marker, in today's money, before any tax (F-45). */
  transfer: number | null;
  /** The lump sum's real gain, in today's money. */
  realGain: number | null;
  /** The first year's deposits (amount now and twelve months) above the yearly ceiling (KGL-02, KGL-03); the engine routes the excess elsewhere. */
  overCeiling: boolean;
}

export function providentModel(d: SignatureData, c: ProvidentCase): ProvidentModel {
  const earlyAge = factNumber(d, "earlyAge");
  const ceiling = factNumber(d, "ceiling");
  const kgl = d.bundles["kupat-gemel-lehashkaa"];
  const entered = { amount_now: c.amount, monthly_deposit: c.monthly };
  const months = c.years * 12;
  const profile = c.age === null ? {} : { ageAtStart: c.age };
  const lumpRun = (feePct?: number) => {
    if (!kgl) return null;
    const run = runWith(kgl, entered, months, { profile, ...(feePct === undefined ? {} : { terms: withBalanceFee(kgl.terms, feePct) }) });
    return run && settled(run) ? run : null;
  };
  const brokerSide = (key: string): Side | null => {
    const b = d.bundles[key];
    const run = b ? runWith(b, entered, months) : null;
    return run && settled(run) ? sideOf(run, c.amount) : null;
  };
  const main = lumpRun();
  const lump = main ? sideOf(main, c.amount) : null;
  const broker = brokerSide("brokerage-account");
  const diff = lump && broker ? lump.gain - broker.gain : null;
  const diffWith = (s: Side | null, b: Side | null) => (s && b ? s.gain - b.gain : null);
  const sideOfFee = (fee: unknown) => {
    const run = typeof fee === "number" ? lumpRun(fee) : null;
    return run ? sideOf(run, c.amount) : null;
  };
  const range = {
    broker: lump ? rangeOf([diff, diffWith(lump, brokerSide("brokerage-best")), diffWith(lump, brokerSide("brokerage-worst"))]) : null,
    manager: broker ? rangeOf([diff, diffWith(sideOfFee(d.facts.rangeMin?.value), broker), diffWith(sideOfFee(d.facts.rangeMax?.value), broker)]) : null,
  };
  const index = main ? main.series[main.series.length - 1]!.index : 1;
  const ageAtExit = c.age === null ? null : c.age + c.years;
  return {
    years: c.years,
    ageAtExit,
    annuityOpen: ageAtExit === null || earlyAge === null ? null : ageAtExit >= earlyAge,
    lump,
    broker,
    diff,
    range,
    alt: main && main.detail.altNominal !== undefined ? { tax: (main.detail.altTaxAtExit ?? 0) / index, net: main.detail.altReal! } : null,
    transfer: main && main.detail.grossBalance !== undefined ? main.detail.grossBalance / index : null,
    realGain: main && main.detail.realGain !== undefined ? main.detail.realGain / index : null,
    overCeiling: ceiling !== null && c.amount + 12 * c.monthly > ceiling,
  };
}

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
  balanceGap: "no-fees" | "no-run" | null;
  /** Rule ids the model read: the forward relief and the engine runs. */
  rules: string[];
}

/**
 * The deposits of a salaried person at the legal minimum rates (PEN-03) on the insured wage (PEN-04), the relief on the person's own part
 * (F-31 credit, or F-32 when employee and employer together reach the beneficiary-member threshold, TXP-03: the same dispatch F-30 solves
 * for), the insurance (F-53) and, from the engine's pension ledger, what the deposits grow to. The pension itself needs conversion factors
 * the site does not hold (PEN OQ7, G-03): no figure.
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
          // a salary-based deposit stays the same in nominal terms, as the employer's line does (F-52); the holdings review runs pensions the same way
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
    return { wage, rates, you, employer, severance, total, relief, netYou: you - relief.monthly, insuranceMonthly, balance, balanceGap, rules: [...used] };
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
