// The comparison in the browser (flows 13 to 16, design-spec 8): the saved goal goes through the engine's
// candidate set (F-83), ranking (F-80) and sensitivity (F-81), and the result is shaped into what the screen
// shows. No rate, fee or rule figure is written here: everything comes from the bundle (compare.server.ts) or
// from the person, and every number leaves as a value object so the provenance sheet can open it.
import {
  buildCandidateSet,
  coverageLine,
  decompose,
  executeCandidate,
  enteredGoal,
  isTie,
  outcomeOrder,
  rankCandidates,
  runPlanned,
  sensitivity,
  sensitivityAxes,
  tieThreshold,
  type Candidate,
  type CandidateSet,
  type CandidateSetInput,
  type ComparisonGoal,
  type CoverageLine,
  type Decomposition,
  type DecidingFormula,
  type InstrumentTerms,
  type OutcomeKind,
  type Ranking,
  type Reason,
  type RunContext,
  type RunResult,
  type Sensitivity,
  type SensitivityAxis,
  type UsedRule,
} from "@finance-tool/engine";
import type { ExposureRecord, ParameterRecord, RuleRecord, ValueObject, WrapperId, WrapperRecord } from "@finance-tool/schema";
import { computedInputs as ci, formulaNames, guideBlocks, r2 } from "../copy";
import { fmt } from "./format";
import type { Employment } from "./inputs";
import type { FieldKey, Goal, PresetId, Presets, ResolvedGoal } from "./goal";
import { computed, entered as enteredValue, weaker, type SiteValue, type Strength } from "./value";

// Formula names this screen's numbers use that the release 1 table does not hold yet (method.md F-30, F-61, F-80, F-81).
Object.assign(formulaNames, {
  "F-30": "הטבת מס בהפקדה",
  "F-61": "עלות דמי הניהול",
  "F-80": "דירוג ותיקו",
  "F-81": "מה היה משנה את התשובה",
  "P-07": "נקודת התחלה",
});

// ---------------------------------------------------------------- the bundle (built at build time)

export type Family = "provident" | "pension" | "deposit" | "securities" | "makam" | "bond";

export interface WrapperEntry {
  id: WrapperId;
  /** The glossary name: the record's first Hebrew name. */
  name: string;
  family: Family | null;
  record: WrapperRecord;
  /** The instrument terms the guide page uses for it; absent when a record the run needs is missing. */
  terms?: InstrumentTerms;
  /** The list-fee lines the terms came from, with their sources. */
  feeValues: Record<string, SiteValue>;
  /** A deposit-family wrapper's own published rate (A-21, A-25; D20): its deposit-terms record's `rate_offered`, as the record holds it. */
  cashRate?: SiteValue;
  /** The amounts the published rate applies to (the deposit record's `amount_range`); absent when the bundle does not carry it (audit 2026-10-24, A8). */
  cashRange?: { min: SiteValue; max: SiteValue | null };
  /** The instrument the run rests on, named for the card (audit 2026-10-24, A10): the fund or track P-05 names, and the provider whose tariff is used. Absent when the bundle does not carry it. */
  representative?: { name: string; provider?: string };
  /** Why there are no terms, one line each (log text, not shown). */
  missing: string[];
}

export interface Tier2Row {
  id: string;
  name: string;
  /** The open question or questions that block it, as the method names them. */
  openQuestion: string;
}

/** One exposure record as exposure mode needs it (release 5): the record, its Hebrew name and where its pages are. */
export interface ExposureEntry {
  record: ExposureRecord;
  name: string;
  oneLine: string | null;
  guideHref: string;
  /** `/workbench/funds/{id}` when a fund record exists for it. */
  variantsHref: string | null;
}

/** The terms of a securities-family wrapper holding one exposure through the fund collected for it (`exposure_id`). */
export interface HoldingTerms {
  fundId: string;
  terms: InstrumentTerms;
  feeValues: Record<string, SiteValue>;
}

/** A data file a comparison reads, by path and its `checked` date (F-82); `for` names the wrapper or exposure ids it feeds (empty: every comparison). */
export interface BundleDataFile {
  path: string;
  checked: string | null;
  for: string[];
}

export interface CompareBundle {
  runDate: string;
  wrappers: WrapperEntry[];
  /** P-01, P-02, P-05 and P-07 as the data files hold them. */
  parameters: ParameterRecord[];
  tier2: Tier2Row[];
  rules: RuleRecord[];
  checklist: { id: string; name: string; explanation: string }[];
  /** The Bank of Israel page a cash-like rate comes from (BANK-22), for the link-out. */
  cashLink: { href: string; title: string; ruleId: string } | null;
  /** Release 5: every exposure record (F-83's candidate set in exposure mode). Absent in a bundle from before it. */
  exposures?: ExposureEntry[];
  /** Release 5: per exposure and securities-family wrapper, the terms through the fund collected for the exposure. */
  exposureTerms?: Record<string, Record<string, HoldingTerms>>;
  /** Release 5: the data files the runs read, for the saved comparison's versions (F-82). */
  dataFiles?: BundleDataFile[];
  /** Release 5: the build's version and data snapshot, written into a saved comparison (as `StateFile.site`). */
  site?: { version: string; data: string };
}

// ---------------------------------------------------------------- the goal as numbers

export interface RunGoal {
  horizonYears: number;
  amountNow: number;
  monthly: number;
  available: number;
  anytime: boolean;
  returnPct: number | null;
  inflationPct: number | null;
  age: number | null;
  employment: Employment | null;
  salary: number | null;
  /** The person's own pension deposit rates through work, % of salary (A-12). */
  pensionEmployee: number | null;
  pensionEmployer: number | null;
  /** A-17, entered: the insurance cost inside a pension fund, % of deposits (G-12). */
  insurancePct: number | null;
  /** The preset the goal started from, and which of its numbers still come from that preset (shown as a site parameter until the person edits them). */
  preset: PresetId;
  fromPreset: { horizon: boolean; monthly: boolean; available: boolean };
  /** Employment was not entered; "employee" is taken because the person says they have a pension or study fund through work (audit 2026-10-24, A3). */
  employmentInferred?: boolean;
  /** The person's own rate for a deposit-family wrapper whose published rate does not apply to the amount (A8), % a year, by wrapper id. Entered. */
  ownRates?: Record<string, number>;
}

/** The numbers a goal runs on, or null when it has no horizon or no money yet. */
export function runGoalOf(goal: Goal, r: ResolvedGoal): RunGoal | null {
  if (r.horizonYears === null || r.horizonYears < 1 || !Number.isInteger(r.horizonYears)) return null;
  // A3: "יש פנסיה / קרן השתלמות דרך העבודה" means an employee; the person can flip it on the form.
  const inferred = goal.profile.employment === null && (goal.profile.hasPension === true || goal.profile.hasHishtalmut === true);
  return {
    horizonYears: r.horizonYears,
    amountNow: r.amountNow ?? 0,
    monthly: r.monthly ?? 0,
    available: Math.min(r.available ?? 0, r.amountNow ?? 0),
    anytime: r.anytime,
    returnPct: goal.assumptions.return,
    inflationPct: goal.assumptions.inflation,
    age: goal.profile.age,
    employment: inferred ? "employee" : goal.profile.employment,
    salary: goal.profile.salary,
    pensionEmployee: goal.profile.pension?.employee ?? null,
    pensionEmployer: goal.profile.pension?.employer ?? null,
    insurancePct: goal.assumptions.insurance ?? null,
    preset: goal.preset,
    fromPreset: { horizon: r.source.horizonYears === "preset", monthly: r.source.monthly === "preset", available: r.source.available === "preset" },
    ...(inferred ? { employmentInferred: true } : {}),
  };
}

/** Everything compared is the amount now less the part kept available, plus the monthly deposit. */
export function nothingToCompare(g: RunGoal): boolean {
  return g.amountNow - g.available <= 0 && g.monthly <= 0;
}

export function parameterOf(bundle: CompareBundle, method: string): ParameterRecord {
  const p = bundle.parameters.find((x) => (x as { method_id?: string }).method_id === method);
  if (!p) throw new Error(`the bundle holds no parameter ${method}`);
  return p;
}

/** A parameter's value object with the parameter marker the provenance sheet reads ("פרמטר של האתר"). */
export function asParameter(p: ParameterRecord, v: ValueObject): SiteValue {
  return { ...v, parameter: { rationale: p.rationale, rationaleHe: p.rationale_he ?? null, signedOffOn: p.signed_off_on ?? null, provisional: (v.notes ?? "").startsWith("provisional") } };
}

// ---------------------------------------------------------------- terms for one run

const fundsWithReturn = new Set(["israeli-fund", "tase-foreign-fund", "foreign-fund"]);

/** Whether a wrapper's run rests on the person's return (A-01); the others rest on a cash rate. */
export function needsReturn(w: WrapperEntry): boolean {
  if (w.family === "provident" || w.family === "pension") return true;
  if (w.family === "securities") return fundsWithReturn.has(w.terms?.fund?.kind ?? "") || w.id === "ira-hishtalmut";
  return false;
}

export function isCashLike(w: WrapperEntry): boolean {
  return !needsReturn(w) && (w.family === "deposit" || w.family === "makam" || w.family === "bond" || w.family === "securities");
}

/** The rate a deposit-family wrapper runs on: the person's own (entered, A8), else the bank's published one. */
export function cashRateFor(w: WrapperEntry, g: RunGoal, today: string): SiteValue | undefined {
  const own = g.ownRates?.[w.id];
  if (own !== undefined && Number.isFinite(own)) return enteredValue(own, "pct_per_year", today, r2.result.ownRate.about);
  return w.cashRate;
}

/** A published deposit rate that does not apply to the amount compared (A8): the record's `amount_range` is one tier of the bank's table. */
export interface DepositRangeFlag {
  id: string;
  amount: number;
  min: SiteValue;
  max: SiteValue | null;
  side: "below" | "above";
}

/**
 * The flag for a one-off deposit whose amount (what is compared now, less what stays available) falls outside the range the
 * record's rate was read for. No flag without the range in the bundle, with no amount, or once the person has entered a rate.
 */
export function depositRangeFlag(w: Pick<WrapperEntry, "id" | "family" | "cashRange">, g: Pick<RunGoal, "amountNow" | "available" | "ownRates"> & { monthly?: number }): DepositRangeFlag | null {
  if (w.id !== "bank-deposit" || !w.cashRange) return null;
  if (g.ownRates?.[w.id] !== undefined) return null;
  const amount = g.amountNow - g.available;
  const min = w.cashRange.min.value;
  const max = w.cashRange.max?.value;
  if (amount > 0) {
    if (typeof min === "number" && amount < min) return { id: w.id, amount, min: w.cashRange.min, max: w.cashRange.max, side: "below" };
    if (typeof max === "number" && amount > max) return { id: w.id, amount, min: w.cashRange.min, max: w.cashRange.max, side: "above" };
  }
  // F-21 runs each monthly amount as its own deposit (2026-10-24): a monthly amount below the range's minimum is out of range too
  const monthly = g.monthly ?? 0;
  if (monthly > 0 && typeof min === "number" && monthly < min) return { id: w.id, amount: monthly, min: w.cashRange.min, max: w.cashRange.max, side: "below" };
  return null;
}

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

export type FeeKind = "balance" | "deposit" | "direct" | "fund" | "trade" | "custody";

/** The fees of a wrapper's terms, one entry per kind with a non-zero rate (F-81 moves each one at a time). */
export function feeKinds(terms: InstrumentTerms | undefined): FeeKind[] {
  const out: FeeKind[] = [];
  if (!terms) return out;
  if ((terms.fees?.balance ?? 0) > 0) out.push("balance");
  if ((terms.fees?.deposit ?? 0) > 0) out.push("deposit");
  if ((terms.fees?.direct ?? 0) > 0) out.push("direct");
  const drag = terms.fund?.drag;
  if (drag && Object.entries(drag).some(([k, v]) => (k === "management" || k === "variable" || k === "trustee") && (v ?? 0) > 0)) out.push("fund");
  const t = terms.tariff;
  if ((t?.buy?.rate ?? 0) > 0 || (t?.sell?.rate ?? 0) > 0) out.push("trade");
  if ((t?.custody?.rate ?? 0) > 0) out.push("custody");
  return out;
}

function scaleTerms(terms: InstrumentTerms, id: string, scale: Record<string, number>): InstrumentTerms {
  const k = (kind: FeeKind) => scale[`${id}:${kind}`] ?? 1;
  if (Object.keys(scale).every((key) => !key.startsWith(`${id}:`))) return terms;
  const t = clone(terms);
  if (t.fees) {
    t.fees.balance *= k("balance");
    t.fees.deposit *= k("deposit");
    t.fees.direct *= k("direct");
  }
  if (t.fund?.drag) {
    const d = t.fund.drag;
    for (const f of ["management", "variable", "trustee"] as const) if (d[f] !== undefined) d[f] = d[f]! * k("fund");
  }
  if (t.tariff) {
    if (t.tariff.buy) t.tariff.buy.rate *= k("trade");
    if (t.tariff.sell) t.tariff.sell.rate *= k("trade");
    if (t.tariff.custody) t.tariff.custody.rate *= k("custody");
  }
  return t;
}

/** The pension run's profile (A-12) and insurance (A-17) come from the person; a provident fund for annuity has no insurance (PEN-35). */
function pensionTerms(w: WrapperEntry, t: InstrumentTerms, g: RunGoal, needs: Partial<Record<string, FieldKey>>): InstrumentTerms {
  const next = t === w.terms ? clone(t) : t;
  const salary = g.salary !== null && g.salary > 0 ? g.salary : null;
  if (g.employment === "self-employed" && salary !== null) next.pension = { employment: "self-employed", annualIncome: 12 * salary };
  else if (g.employment === "employee" && salary !== null) {
    // The deposits the person already makes through work use the credit cap first (TXP-02). The form asks for one employer rate (tagmulim); the severance share is not asked, so it is not passed (0).
    next.pension = {
      employment: "employee",
      monthlySalary: salary,
      ...(g.pensionEmployee !== null ? { existingEmployeeRate: g.pensionEmployee / 100 } : {}),
      ...(g.pensionEmployer !== null && g.pensionEmployer > 0 ? { employer: { pensionRate: g.pensionEmployer / 100, severanceRate: 0 } } : {}),
    };
  } else needs[w.id] = g.employment === null ? "employment" : "salary";
  if (w.id !== "provident-for-annuity") {
    if (g.insurancePct !== null) next.insurance = { rate: g.insurancePct / 100 };
    else if (next.pension) needs[w.id] = "insurance";
  }
  return next;
}

/** The study fund's terms come from the person: employment, and an employee's salary (A-12). */
export function termsFor(w: WrapperEntry, g: RunGoal, scale: Record<string, number>, needs: Partial<Record<string, FieldKey>>): InstrumentTerms | undefined {
  if (!w.terms) return undefined;
  const t = scale ? scaleTerms(w.terms, w.id, scale) : w.terms;
  if (w.family === "pension") return pensionTerms(w, t, g, needs);
  if (w.id !== "keren-hishtalmut") return t;
  const next = t === w.terms ? clone(t) : t;
  if (g.employment === "self-employed") next.hishtalmut = { employment: "self-employed", clockStartMonth: 0 };
  else if (g.employment === "employee" && g.salary !== null && g.salary > 0) next.hishtalmut = { employment: "employee", monthlySalary: g.salary, clockStartMonth: 0 };
  else needs[w.id] = g.employment === "employee" ? "salary" : "employment";
  return next;
}

// ---------------------------------------------------------------- evaluation

export interface Evaluated {
  set: CandidateSet;
  candidates: Candidate[];
  coverage: CoverageLine<OutcomeKind>;
  ranking: Ranking;
  /** The field the person can fill to move a not-evaluated candidate, by candidate id. */
  fields: Partial<Record<string, FieldKey>>;
  ctx: RunContext;
  goal: ComparisonGoal;
  theta: number;
  /** What went into the candidate set (the saved comparison's record of the run, F-82). */
  inputs: CandidateSetInput;
}

interface EvalOptions {
  /** Only these wrappers, no tier 2 (the sensitivity re-runs). */
  only?: Set<string>;
  scale?: Record<string, number>;
  full?: boolean;
}

export function comparisonGoal(g: RunGoal): ComparisonGoal {
  const goal: ComparisonGoal = { amountNow: g.amountNow, monthly: g.monthly, horizonYears: g.horizonYears };
  if (g.returnPct !== null) goal.grossReturnPct = g.returnPct;
  if (g.inflationPct !== null) goal.inflationPct = g.inflationPct;
  if (g.available > 0) goal.keepAvailable = { amount: g.available, in: "current-account" };
  if (g.anytime) goal.mustBeWithdrawableAnytime = true;
  const profile: NonNullable<ComparisonGoal["profile"]> = {};
  if (g.age !== null) profile.ageAtStart = g.age;
  if (g.salary !== null && g.salary > 0) profile.annualIncome = 12 * g.salary;
  goal.profile = profile;
  return goal;
}

export function evaluate(bundle: CompareBundle, g: RunGoal, options: EvalOptions = {}): Evaluated {
  const ctx: RunContext = { rules: bundle.rules, runDate: bundle.runDate };
  const needs: Partial<Record<string, FieldKey>> = {};
  const scale = options.scale ?? {};
  const entries = bundle.wrappers.filter((w) => !options.only || options.only.has(w.id));
  const goal = comparisonGoal(g);
  const inputs: CandidateSetInput = {
    wrappers: entries.map((w) => {
      const terms = termsFor(w, g, scale, needs);
      const rate = cashRateFor(w, g, bundle.runDate);
      return { record: w.record, ...(terms ? { terms } : {}), ...(rate ? { cashRate: rate } : {}) };
    }),
    tier2: options.only ? [] : bundle.tier2,
    parameters: bundle.parameters,
    goal,
    restricted: !!options.only,
  };
  const set = buildCandidateSet(inputs, ctx);

  // D9: the site holds no return. A candidate whose run rests on one is "not evaluated: enter a return"
  // until the person enters it; the engine would otherwise fall back on P-05's starting value.
  const byId = new Map(bundle.wrappers.map((w) => [w.id as string, w]));
  const candidates = set.candidates.map((c): Candidate => {
    const w = byId.get(c.id);
    if (g.returnPct === null && w && c.run && needsReturn(w)) {
      return { id: c.id, tier: 1, kind: "not-evaluated", reasons: [{ code: "missing-input", ruleIds: [], gapIds: [], detail: "A-01" }] };
    }
    return c;
  });
  const fields: Partial<Record<string, FieldKey>> = {};
  for (const c of candidates) {
    if (c.kind !== "not-evaluated") continue;
    const r = c.reasons[0];
    if (r?.code !== "missing-input") continue;
    if (r.detail === "A-01") fields[c.id] = "return";
    else if (r.detail === "profile.ageAtStart") fields[c.id] = "age";
    else if (needs[c.id] && /hishtalmut|pension|insurance/.test(r.detail ?? "")) fields[c.id] = needs[c.id]!;
  }
  const coverage = coverageLine(candidates, outcomeOrder, ["ranked"]);
  const theta = tieThreshold(bundle.parameters);
  const ranking = rankCandidates(candidates, { theta, ctx });
  return { set, candidates, coverage, ranking, fields, ctx, goal, theta, inputs };
}

/** The ids tied for first, as one key: F-81 compares this between runs, so a move that breaks a tie shows. */
function topKey(candidates: readonly Candidate[], theta: number): string {
  const ranked = candidates.filter((c) => c.kind === "ranked" && c.run).map((c, i) => ({ c, i })).sort((a, b) => b.c.run!.real - a.c.run!.real || a.i - b.i).map((x) => x.c);
  const first = ranked[0];
  if (!first) return "";
  return ranked.filter((c) => c === first || isTie(first.run!.real, c.run!.real, theta)).map((c) => c.id).join("|");
}

// ---------------------------------------------------------------- the view of a result

export interface Chip {
  key: string;
  label: string;
  value: SiteValue;
  /** The goal field a tap opens, when the chip is one of the goal's. */
  field?: FieldKey;
  display?: string;
}

export interface Breakdown {
  relief: number;
  fees: number;
  taxDuring: number;
  taxExit: number;
  lockUp: number;
  result: number;
}

export interface RankedOption {
  id: string;
  name: string;
  rank: number;
  tiedWith: string[];
  candidate: Candidate;
  run: RunResult;
  real: number;
  nominal: number;
  breakdown: Breakdown;
  decomposition: Decomposition;
  /** Against the row above: the formula with the biggest gap, and both options' figures (real NIS). */
  deciding?: { formula: DecidingFormula; mine: number; above: number };
  enteredReturn: boolean;
  cashLike: boolean;
  secondaryRules: string[];
  staleRules: { id: string; since: string }[];
  usedRules: UsedRule[];
  chips: Chip[];
}

export interface ListedOption {
  id: string;
  name: string;
  candidate: Candidate;
  reasons: ReasonView[];
  /** The value of its own run, when there is one, and what it is the value of. */
  value?: { real: number; nominal: number; kind: "unlock" | "pre-tax" | "horizon"; month: number };
  breakdown?: Breakdown;
  blockedBy: string[];
  usedRules: UsedRule[];
}

export interface ReasonView extends Reason {
  field?: FieldKey;
  fixableBy?: "person" | "site";
}

export interface CoverageRow {
  id: string;
  name: string;
  tier: 1 | 2;
  kind: OutcomeKind;
  reasons: ReasonView[];
  /** The guide page of a tier-1 option. */
  href?: string;
}

export interface SeriesLine {
  id: string;
  name: string;
  role: "option-1" | "option-2" | "option-3" | "baseline";
  /** One point per year from 0 (the amount now). */
  points: { year: number; real: number; nominal: number }[];
  enteredReturn: boolean;
  tiedWith: string[];
}

export interface MarkRow {
  id: string;
  name: string;
  explanation: string;
  mark: "covered" | "na" | "blocked";
  code?: string;
  rules: string[];
  /** The options the dimension affected (covered) or keeps from being ranked (blocked). */
  options: string[];
}

export type HeadlineKind = "winner" | "single" | "tie" | "all-tied" | "only-baseline" | "nothing-ranked" | "excludes-all";

export interface Kept {
  amount: number;
  where: "current-account" | "money-market-fund-daily";
  real: number | null;
  run: RunResult | null;
}

export interface CompareView {
  kind: "ok";
  evaluated: Evaluated;
  ranked: RankedOption[];
  listed: ListedOption[];
  coverageRows: CoverageRow[];
  kept: Kept | null;
  series: SeriesLine[];
  marks: MarkRow[];
  headline: HeadlineKind;
  /** The ranked options tied with the top, in order. */
  topTie: string[];
  topTwo: Ranking["topTwo"] | null;
  rulesUsed: string[];
  usedAll: UsedRule[];
  /** Whether any ranked option rests on a rule past its re-check date. */
  stale: { since: string } | null;
  names: Record<string, string>;
  /** Cash-like options ran on P-05's cash rate, because the Bank of Israel series may not be republished. */
  cashRate: SiteValue | null;
  excludedAll: boolean;
}

export type CompareOutcome = CompareView | { kind: "nothing-to-compare" } | { kind: "need-more" } | { kind: "error"; message: string };

const realOf = (run: RunResult) => run.real;
const sumOf = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0);

function breakdownOf(run: RunResult, d: Decomposition): Breakdown {
  const idx = run.real === 0 ? 1 : run.nominal / run.real;
  return { relief: -d.depositSideRelief, fees: d.feeDrag, taxDuring: run.taxDuring / idx, taxExit: run.taxAtExit / idx, lockUp: d.lockUp, result: run.real };
}

function staleOf(rules: readonly UsedRule[], bundle: CompareBundle): { id: string; since: string }[] {
  const out: { id: string; since: string }[] = [];
  for (const u of rules) {
    const r = bundle.rules.find((x) => x.id === u.id);
    if (r?.recheck_date && r.recheck_date < bundle.runDate) out.push({ id: r.id, since: r.checked });
  }
  return out;
}

/** The years a ranked option's line is drawn at: a run with the horizon set to each year (as the guide's graph does). */
export function yearSeries(c: Candidate, ctx: RunContext, years: number, amountNow: number): SeriesLine["points"] {
  const points = [{ year: 0, real: amountNow, nominal: amountNow }];
  const plan = c.plan!;
  for (let n = 1; n <= years; n++) {
    try {
      const yearPlan = { ...plan, input: { ...plan.input, goal: { ...plan.input.goal, months: 12 * n } } } as typeof plan;
      const run = runPlanned(yearPlan, ctx);
      points.push({ year: n, real: run.real, nominal: run.nominal });
    } catch {
      break;
    }
  }
  return points;
}

const strengthOfUsed = (u: UsedRule): Strength => u.figures.reduce<Strength>((w, f) => weaker(w, f.strength as Strength) ?? w, u.strength);

export function buildView(bundle: CompareBundle, g: RunGoal): CompareOutcome {
  let ev: Evaluated;
  try {
    ev = evaluate(bundle, g);
  } catch (e) {
    return { kind: "error", message: e instanceof Error ? e.message : String(e) };
  }
  try {
    return view(bundle, g, ev);
  } catch (e) {
    return { kind: "error", message: e instanceof Error ? e.message : String(e) };
  }
}

function view(bundle: CompareBundle, g: RunGoal, ev: Evaluated): CompareView {
  const byId = new Map(bundle.wrappers.map((w) => [w.id as string, w]));
  const tier2 = new Map(bundle.tier2.map((t) => [t.id, t]));
  const names: Record<string, string> = {};
  for (const w of bundle.wrappers) names[w.id] = w.name;
  for (const t of bundle.tier2) names[t.id] = t.name;
  const cand = new Map(ev.candidates.map((c) => [c.id, c]));
  const ctx = ev.ctx;

  const reasonView = (c: Candidate, r: Reason): ReasonView => {
    const out: ReasonView = { ...r };
    const field = c.kind === "not-evaluated" ? ev.fields[c.id] : undefined;
    if (field && r.code === "missing-input") {
      out.field = field;
      out.fixableBy = "person";
    } else if (c.kind === "not-evaluated") out.fixableBy = "site";
    return out;
  };

  // ---- ranked options, with their ties and the formula that decides each against the row above
  const rankedCands = ev.ranking.entries.map((e) => cand.get(e.id)!).filter(Boolean);
  const entries = ev.ranking.entries;
  const groups = placeGroups(entries, ev.ranking.tieSet);
  const decomps = rankedCands.map((c) => decompose(c.plan!, c.run!, ctx));
  const cashRate = bundle.parameters.length ? cashRateOf(bundle) : null;
  const goalValues = goalValueObjects(bundle, g);
  const ranked: RankedOption[] = rankedCands.map((c, i) => {
    const w = byId.get(c.id)!;
    const run = c.run!;
    const group = entries.map((_, j) => j).filter((j) => groups[j] === groups[i]);
    const above = i > 0 ? rankedCands[i - 1]! : null;
    let deciding: RankedOption["deciding"];
    if (above) {
      const pair = rankCandidates([above, c], { theta: ev.theta, ctx }).topTwo?.deciding;
      if (pair?.formula) {
        const f = pair.formula;
        const pick = (d: Decomposition): number => (f === "deposit-side-relief" ? -d.depositSideRelief : f === "fee-drag" ? d.feeDrag : f === "tax-at-exit" ? d.taxAtExit : d.lockUp);
        deciding = { formula: f, mine: pick(pair.second), above: pick(pair.top) };
      }
    }
    const enteredReturn = needsReturn(w) && g.returnPct !== null;
    const secondaryRules = run.labels.filter((l) => l.code === "secondary-source").map((l) => l.ruleId);
    const chips = chipsFor(w, g, goalValues, cashRate, bundle.runDate);
    return {
      id: c.id,
      name: w.name,
      rank: groups[i]! + 1,
      tiedWith: group.map((j) => entries[j]!.id).filter((id) => id !== c.id),
      candidate: c,
      run,
      real: run.real,
      nominal: run.nominal,
      breakdown: breakdownOf(run, decomps[i]!),
      decomposition: decomps[i]!,
      ...(deciding ? { deciding } : {}),
      enteredReturn,
      cashLike: isCashLike(w),
      secondaryRules,
      staleRules: staleOf(run.rules, bundle),
      usedRules: run.rules,
      chips,
    };
  });

  // ---- listed, not ranked
  const listed: ListedOption[] = ev.candidates
    .filter((c) => c.kind === "listed-not-ranked")
    .map((c) => {
      const reasons = c.reasons.map((r) => reasonView(c, r));
      const blocked = reasons.filter((r) => r.code === "exit-blocked").flatMap((r) => [...r.ruleIds, ...r.gapIds]);
      const opt: ListedOption = { id: c.id, name: names[c.id] ?? c.id, candidate: c, reasons, blockedBy: blocked, usedRules: c.run?.rules ?? [] };
      if (c.run) {
        const locked = reasons.some((r) => r.code === "locked-until" || r.code === "locked-to-age");
        const preTax = blocked.length > 0;
        opt.value = { real: c.run.real, nominal: c.run.nominal, kind: preTax ? "pre-tax" : locked ? "unlock" : "horizon", month: c.run.exitMonth };
        opt.breakdown = breakdownOf(c.run, decompose(c.plan!, c.run, ctx));
      }
      return opt;
    });

  // ---- the coverage list: every candidate once
  const coverageRows: CoverageRow[] = ev.candidates.map((c) => {
    const t2 = tier2.get(c.id);
    return {
      id: c.id,
      name: names[c.id] ?? t2?.name ?? c.id,
      tier: c.tier,
      kind: c.kind,
      reasons: c.reasons.map((r) => reasonView(c, r)),
      ...(c.tier === 1 ? { href: `/guide/${c.id}` } : {}),
    };
  });

  // ---- the part kept available
  let kept: Kept | null = null;
  if (g.available > 0) {
    const k = ev.set.keptAvailable;
    if (k?.run) kept = { amount: g.available, where: "current-account", real: k.run.real, run: k.run };
    else {
      const mmf = byId.get("money-market-fund-daily");
      let run: RunResult | null = null;
      if (mmf?.terms) {
        const ex = executeCandidate({ record: mmf.record, terms: mmf.terms }, bundle.parameters, enteredGoal(ev.goal, g.available, 0, bundle.runDate), ev.goal.profile ?? {}, ctx);
        if (ex.ok) run = ex.run;
      }
      kept = { amount: g.available, where: run ? "money-market-fund-daily" : "current-account", real: run ? run.real : null, run };
    }
  }

  // ---- chart lines: the top three and the baseline
  const series: SeriesLine[] = [];
  const baselineId = "current-account";
  const top3 = ranked.filter((o) => o.id !== baselineId).slice(0, 3);
  top3.forEach((o, i) => {
    series.push({ id: o.id, name: o.name, role: (["option-1", "option-2", "option-3"] as const)[i]!, points: yearSeries(o.candidate, ctx, g.horizonYears, g.amountNow - g.available), enteredReturn: o.enteredReturn, tiedWith: o.tiedWith });
  });
  const base = ranked.find((o) => o.id === baselineId);
  if (base) series.push({ id: base.id, name: base.name, role: "baseline", points: yearSeries(base.candidate, ctx, g.horizonYears, g.amountNow - g.available), enteredReturn: false, tiedWith: base.tiedWith });

  // ---- headline kind
  const topTie = ev.ranking.tieSet.length > 1 ? ev.ranking.tieSet : [];
  let headline: HeadlineKind = "winner";
  const excludedAll = ranked.length === 0 && listed.length === 0 && ev.candidates.filter((c) => c.tier === 1).every((c) => c.kind === "excluded" || c.kind === "not-eligible") && ev.candidates.some((c) => c.kind === "excluded");
  if (excludedAll) headline = "excludes-all";
  else if (ranked.length === 0) headline = "nothing-ranked";
  else if (ranked.length === 1 && ranked[0]!.id === baselineId) headline = "only-baseline";
  else if (ranked.length === 1) headline = "single";
  else if (topTie.length === ranked.length) headline = "all-tied";
  else if (topTie.length > 1) headline = "tie";

  // ---- dimension marks: from the rules the ranked runs read, and the open questions of the options shown
  const dimRules = new Map<string, Set<string>>();
  const dimOptions = new Map<string, Set<string>>();
  for (const o of ranked) {
    for (const u of o.usedRules) {
      for (const d of u.dimensions) {
        (dimRules.get(d) ?? dimRules.set(d, new Set()).get(d)!).add(u.id);
        (dimOptions.get(d) ?? dimOptions.set(d, new Set()).get(d)!).add(o.id);
      }
    }
  }
  const blockedDims = new Map<string, { code: string; options: Set<string> }>();
  for (const c of [...ranked.map((o) => o.candidate), ...listed.map((l) => l.candidate)]) {
    const w = byId.get(c.id);
    for (const [d, m] of Object.entries(w?.record.dimensions ?? {})) {
      if (!m.startsWith("blocked:")) continue;
      const b = blockedDims.get(d) ?? { code: m.slice("blocked:".length), options: new Set<string>() };
      b.options.add(c.id);
      blockedDims.set(d, b);
    }
  }
  const marks: MarkRow[] = bundle.checklist.map((row) => {
    const rules = [...(dimRules.get(row.id) ?? [])];
    const covered = rules.length > 0;
    const blocked = blockedDims.get(row.id);
    if (covered) return { ...row, mark: "covered", rules, options: [...(dimOptions.get(row.id) ?? [])] };
    if (blocked) return { ...row, mark: "blocked", code: blocked.code, rules: [], options: [...blocked.options] };
    return { ...row, mark: "na", rules: [], options: [] };
  });

  const usedAll = new Map<string, UsedRule>();
  for (const o of ranked) for (const u of o.usedRules) usedAll.set(u.id, u);
  const staleAll = ranked.flatMap((o) => o.staleRules);
  const stale = staleAll.length > 0 ? { since: staleAll.map((s) => s.since).sort()[0]! } : null;
  // Only what runs on P-05's cash rate needs the site-parameter line; the deposits run on the bank's own published rate.
  const anyCash = ranked.some((o) => o.cashLike && !cashRateFor(byId.get(o.id)!, g, bundle.runDate)) || kept?.where === "money-market-fund-daily";

  return {
    kind: "ok",
    evaluated: ev,
    ranked,
    listed,
    coverageRows,
    kept,
    series,
    marks,
    headline,
    topTie,
    topTwo: ev.ranking.topTwo ?? null,
    rulesUsed: [...usedAll.keys()],
    usedAll: [...usedAll.values()],
    stale,
    names,
    cashRate: anyCash ? cashRate : null,
    excludedAll,
  };
}

// ---------------------------------------------------------------- value objects of the goal and of a result

export interface GoalValues {
  horizon: SiteValue;
  amountNow: SiteValue;
  monthly: SiteValue;
  available: SiteValue;
  inflation: SiteValue;
  returnV: SiteValue | null;
}

export function cashRateOf(bundle: CompareBundle): SiteValue {
  const p05 = parameterOf(bundle, "P-05");
  return asParameter(p05, (p05 as unknown as { inputs: Record<string, ValueObject> }).inputs.cash_rate!);
}

/** Goal fields as value objects: entered by the person, or the site parameter a preset filled (design-spec 6.2). */
export function goalValueObjects(bundle: CompareBundle, g: RunGoal): GoalValues {
  const today = bundle.runDate;
  const p05 = parameterOf(bundle, "P-05");
  const inputs = (p05 as unknown as { inputs: Record<string, ValueObject> }).inputs;
  // A number a preset filled (P-07) stays a site parameter until the person edits it (D7).
  const p07 = bundle.parameters.find((x) => (x as { method_id?: string }).method_id === "P-07");
  const presetRec = g.preset === "none" ? undefined : (p07 as unknown as { presets?: Record<string, Record<string, ValueObject>> } | undefined)?.presets?.[g.preset];
  const fromPreset = (field: string, value: number, unit: ValueObject["unit"], notes: string): SiteValue | null => {
    const v = presetRec?.[field];
    return v && p07 ? asParameter(p07, { ...v, value, unit, notes }) : null;
  };
  return {
    horizon: (g.fromPreset.horizon && fromPreset("horizon_years", g.horizonYears, "years", "")) || enteredValue(g.horizonYears, "years", today, ci.years),
    amountNow: enteredValue(g.amountNow, "nis", today, ci.amountNow),
    monthly: (g.fromPreset.monthly && fromPreset("monthly_deposit", g.monthly, "nis_per_month", "")) || enteredValue(g.monthly, "nis_per_month", today, ci.monthly),
    available: (g.fromPreset.available && fromPreset("must_stay_available_share", g.available, "nis", `${presetRec?.must_stay_available_share?.value}% מהסכום היום, לפי נקודת ההתחלה`)) || enteredValue(g.available, "nis", today, ""),
    inflation: g.inflationPct !== null ? enteredValue(g.inflationPct, "pct_per_year", today, ci.inflation) : asParameter(p05, inputs["A-02"]!),
    returnV: g.returnPct !== null ? enteredValue(g.returnPct, "pct_per_year", today, ci.grossReturn) : null,
  };
}

/** The fund's costs the run takes as its drag (A-06 to A-09 and the other fund-level lines of F-10), in the order the run reads them. */
const dragKeys = ["fundManagement", "fundVariable", "fundTrustee", "fundTracking", "fundWithholding"] as const;

function chipsFor(w: WrapperEntry, g: RunGoal, v: GoalValues, cash: SiteValue | null, today: string): Chip[] {
  const chips: Chip[] = [];
  const rate = cashRateFor(w, g, today);
  if (needsReturn(w) && v.returnV) chips.push({ key: "return", label: ci.grossReturn, value: v.returnV, field: "return" });
  if (rate && rate.state === "entered") chips.push({ key: "cash", label: r2.result.ownRate.chip, value: rate });
  else if (rate) chips.push({ key: "cash", label: `${r2.result.bankPublished}${fmt.date(rate.effective_from ?? rate.checked)}`, value: rate });
  else if (isCashLike(w) && cash) chips.push({ key: "cash", label: "ריבית נזילה", value: cash });
  chips.push({ key: "inflation", label: ci.inflation, value: v.inflation, field: "inflation" });
  const feeKey: Record<string, string[]> = { provident: ["balance"], securities: ["fundDrag", "tradeRate", "custodyRate"], makam: ["tradeRate"], bond: ["tradeRate"], deposit: [] };
  const labels: Record<string, string> = { balance: "דמי ניהול מחיסכון", fundDrag: "העלות בתוך הקרן", tradeRate: "עמלת קנייה ומכירה", custodyRate: "דמי ניהול פיקדון ניירות ערך" };
  for (const k of feeKey[w.family ?? ""] ?? []) {
    // The run takes the sum of the fund's fee lines, so the chip shows that sum (F10), with each line as an input of the computed value.
    if (k === "fundDrag") {
      const parts = dragKeys.filter((d) => typeof w.feeValues[d]?.value === "number");
      const total = parts.reduce((s, d) => s + (w.feeValues[d]!.value as number), 0);
      if (parts.length === 0 || !(total > 0)) continue;
      const inputs = Object.fromEntries(parts.map((d) => [guideBlocks.terms.labels[d] ?? d, w.feeValues[d]!]));
      chips.push({ key: k, label: labels[k]!, value: computed(total, "pct_per_year", "A-06", inputs, { today, about: labels[k]! }) });
      continue;
    }
    const val = w.feeValues[k];
    if (val && typeof val.value === "number" && val.value > 0) chips.push({ key: k, label: labels[k]!, value: val });
  }
  return chips;
}

/** A computed number (D7) with the inputs it came from, for every figure the result shows. */
export function makeValues(bundle: CompareBundle, g: RunGoal) {
  const today = bundle.runDate;
  const gv = goalValueObjects(bundle, g);
  const base: Record<string, SiteValue> = { [ci.amountNow]: gv.amountNow, [ci.monthly]: gv.monthly, [ci.years]: gv.horizon, [ci.inflation]: gv.inflation };
  if (gv.returnV) base[ci.grossReturn] = gv.returnV;
  const rulesOf = (used: readonly UsedRule[]) => used.map((u) => ({ id: u.id, strength: strengthOfUsed(u) }));
  return {
    goal: gv,
    /** A figure of one run (a NIS amount at the horizon). */
    nis(value: number, formula: string, about: string, run?: { usedRules: readonly UsedRule[]; flags?: { code: string }[] }, extra?: Record<string, SiteValue>): SiteValue {
      return computed(value, "nis", formula, { ...base, ...(extra ?? {}) }, { today, about, rules: run ? rulesOf(run.usedRules) : [], flags: run?.flags?.map((f) => f.code) });
    },
    pct(value: number, formula: string, about: string, extra?: Record<string, SiteValue>): SiteValue {
      return computed(value, "pct", formula, { ...base, ...(extra ?? {}) }, { today, about });
    },
    /** A rate or a multiplier or a number of years that a sensitivity row reports. */
    plain(value: number, unit: ValueObject["unit"], formula: string, about: string, extra?: Record<string, SiteValue>): SiteValue {
      return computed(value, unit, formula, { ...base, ...(extra ?? {}) }, { today, about });
    },
    date(iso: string, about: string): SiteValue {
      return { ...computed(null, "text", "B3", {}, { today, about }), value: iso };
    },
    count(value: number, about: string): SiteValue {
      return computed(value, "count", "F-83", {}, { today, about });
    },
  };
}

export function addMonths(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  const t = new Date(Date.UTC(y, m - 1 + months, d));
  return t.toISOString().slice(0, 10);
}

/** The formula whose figure a deciding line shows (F-80's four gaps). */
const decidingFormulaId: Record<string, string> = { "fee-drag": "F-61", "tax-at-exit": "F-40", "deposit-side-relief": "F-30", "lock-up": "B3" };
export const decidingFormulaOf = (f: string): string => decidingFormulaId[f] ?? "F-80";

/** Where the person picks the actual product the card's run stands for (A10, A14): the track, provider or fund workbench of the wrapper, when it has one. */
export function workbenchHref(wrapperId: string): string | null {
  if (["kupat-gemel-lehashkaa", "keren-hishtalmut", "pension-comprehensive", "pension-general", "provident-for-annuity"].includes(wrapperId)) return `/workbench/tracks/${wrapperId}`;
  if (wrapperId === "brokerage-account") return "/workbench/providers/brokerage-account";
  if (wrapperId === "money-market-fund-daily" || wrapperId === "money-market-fund-renewable") return "/workbench/funds/shekel-cash";
  return null;
}

// ---------------------------------------------------------------- counts with their verbs (A91)

/** A count's form: the numeral in words for one and two ("אחת", "שתיים"), the number itself otherwise, and the verb that agrees with it. */
export function countForm(n: number, forms: { one: string; other: string }, numerals: { one: string; two: string }): { numeral: string | null; word: string } {
  if (n === 1) return { numeral: numerals.one, word: forms.one };
  if (n === 2) return { numeral: numerals.two, word: forms.other };
  return { numeral: null, word: forms.other };
}

/** A whole phrase by count: `one`, `two` or `other` (with `{n}`): "אפשרות אחת לא נבדקה:", "שתי אפשרויות לא נבדקו:", "5 אפשרויות לא נבדקו:". */
export function countPhrase(n: number, forms: { one: string; two: string; other: string }): string {
  return n === 1 ? forms.one : n === 2 ? forms.two : forms.other.replace("{n}", String(n));
}

// ---------------------------------------------------------------- the headline's three lines (A3)

export interface HeadlineState {
  /** "cash-only": every option that could be ranked is a cash-like one, so the lead says so before it names a leader. */
  lead: "leader" | "cash-only";
  /** N: the options ranked. */
  ranked: number;
  /** K: the options the person can make rankable by entering something, and the fields that would do it. */
  unevaluated: number;
  fields: FieldKey[];
}

const fieldOrder: FieldKey[] = ["return", "employment", "salary", "age", "insurance"];

/** Which opening the headline takes and what its third line says, from the ranked options and the coverage rows alone. */
export function headlineState(v: { ranked: readonly { cashLike: boolean }[]; coverageRows: readonly Pick<CoverageRow, "kind" | "reasons">[] }): HeadlineState {
  const fixable = v.coverageRows.filter((r) => r.kind === "not-evaluated" && r.reasons.some((x) => x.fixableBy === "person" && x.field));
  const fields = fieldOrder.filter((f) => fixable.some((r) => r.reasons.some((x) => x.field === f)));
  const cashOnly = v.ranked.length > 0 && v.ranked.every((o) => o.cashLike) && fixable.length > 0;
  return { lead: cashOnly ? "cash-only" : "leader", ranked: v.ranked.length, unevaluated: fixable.length, fields };
}

/**
 * A7: the "why" sheet's informational row: the gross return each of the two options ran on, when they differ (an entered A-01 for a
 * fund, the bank's published rate or P-05's cash rate for a deposit). Not a formula, so it never carries "decisive".
 */
export function grossReturnRow(a: Pick<RankedOption, "chips">, b: Pick<RankedOption, "chips">): { a: SiteValue | null; b: SiteValue | null } | null {
  const pick = (o: Pick<RankedOption, "chips">) => o.chips.find((c) => c.key === "return" || c.key === "cash")?.value ?? null;
  const x = pick(a);
  const y = pick(b);
  if (!x && !y) return null;
  if (x && y && x.value === y.value && x.state === y.state) return null;
  return { a: x, b: y };
}

// ---------------------------------------------------------------- sensitivity (F-81)

export interface SensitivityRowView {
  key: string;
  label: string;
  /** Which goal field a flip points to; fees have none. */
  field: FieldKey | null;
  unit: SensitivityAxis["unit"];
  current: number;
  lo: number;
  hi: number;
  flip?: { from: number; to: number; side: "lo" | "hi"; topAfter: string; breaksTie: boolean };
}

export interface SensitivityView {
  rows: SensitivityRowView[];
  noFlip: boolean;
  evaluations: number;
  baseKey: string;
}

/** Whether the top after a move is the option (or one of the tied options) that is first before it. */
export function flipNamesCurrentTop(topAfter: string, base: ReadonlySet<string>): boolean {
  const first = topAfter.split("|")[0] ?? "";
  return first !== "" && base.has(first);
}

/**
 * Place groups for ranked entries in order (F-80, 2026-10-24): the tie set is pairwise with the top (the engine's
 * `ranking.tieSet`), not transitive. Its members share the first place; every other entry has its own place by the engine's order.
 */
export function placeGroups(entries: readonly { id: string }[], tieSet: readonly string[]): number[] {
  const tied = new Set(tieSet.length > 1 ? tieSet : []);
  return entries.map((e, i) => (tied.has(e.id) ? 0 : i));
}

/** F-81: a move is a change when the leading set differs from the base set at all (a sole leader turning into a tie counts), or when the first name is no longer a current leader. */
export function flipIsChange(topAfter: string, base: ReadonlySet<string>): boolean {
  const after = new Set(topAfter.split("|").filter(Boolean));
  const differs = after.size !== base.size || ![...after].every((id) => base.has(id));
  return differs || !flipNamesCurrentTop(topAfter, base);
}

export function feeAxisKey(id: string, kind: FeeKind): string {
  return `${id}:${kind}`;
}

/** F-81 over the options that ran in the base result. The bounds are P-02's; the person cannot edit them here. */
export function computeSensitivity(bundle: CompareBundle, g: RunGoal, ev: Evaluated, feeLabel: (kind: FeeKind, name: string) => string, labels: { return: string; inflation: string; horizon: string }): SensitivityView | null {
  const only = new Set(ev.candidates.filter((c) => c.tier === 1 && (c.kind === "ranked" || (c.kind === "listed-not-ranked" && c.run))).map((c) => c.id));
  if (only.size === 0 || !ev.ranking.top) return null;
  const byId = new Map(bundle.wrappers.map((w) => [w.id as string, w]));
  const fees: { key: string; label: string }[] = [];
  for (const o of ev.ranking.entries) {
    const w = byId.get(o.id);
    if (!w) continue;
    for (const kind of feeKinds(w.terms)) fees.push({ key: feeAxisKey(o.id, kind), label: feeLabel(kind, w.name) });
  }
  const p05 = parameterOf(bundle, "P-05");
  const inflationNow = g.inflationPct ?? ((p05 as unknown as { inputs: Record<string, ValueObject> }).inputs["A-02"]!.value as number);
  const current: Record<string, number> = { "A-02": inflationNow / 100 };
  if (g.returnPct !== null) current["A-01"] = g.returnPct / 100;
  const axes = sensitivityAxes(bundle.parameters, { current, horizonYears: g.horizonYears, fees });
  for (const a of axes) a.label = a.key === "A-01" ? labels.return : a.key === "A-02" ? labels.inflation : a.key === "horizon" ? labels.horizon : a.label;
  const topOf = (key: string, value: number): string => {
    const goal: RunGoal = { ...g };
    const scale: Record<string, number> = {};
    if (key === "A-01") goal.returnPct = value * 100;
    else if (key === "A-02") goal.inflationPct = value * 100;
    else if (key === "horizon") goal.horizonYears = value;
    else scale[key.slice(4)] = value;
    const e = evaluate(bundle, goal, { only, scale });
    return topKey(e.candidates, e.theta);
  };
  const s: Sensitivity = sensitivity(axes, topOf);
  const baseSet = new Set((s.baseTop ?? "").split("|"));
  const rows: SensitivityRowView[] = s.rows.map((r) => {
    const sides = (["lo", "hi"] as const).filter((x) => r[x].flips).map((side) => ({ side, to: r[side].flipsAt!, topAfter: r[side].topAfter ?? "" }));
    const best = sides.sort((a, b) => Math.abs(a.to - r.current) - Math.abs(b.to - r.current))[0];
    const field: FieldKey | null = r.key === "A-01" ? "return" : r.key === "A-02" ? "inflation" : r.key === "horizon" ? "horizonYears" : null;
    const view: SensitivityRowView = { key: r.key, label: r.label, field, unit: r.unit, current: r.current, lo: r.lo.bound, hi: r.hi.bound };
    if (best) {
      const after = new Set(best.topAfter.split("|").filter(Boolean));
      const breaksTie = baseSet.size > 1 && after.size > 0 && [...after].every((id) => baseSet.has(id)) && after.size < baseSet.size;
      // A7 and F-81 (2026-10-24): a move whose "then X first" names the option that is already first says nothing ("אז קרן כספית ראשונה" when it is): no flip
      if (breaksTie || flipIsChange(best.topAfter, baseSet)) view.flip = { from: r.current, to: best.to, side: best.side, topAfter: best.topAfter, breaksTie };
    }
    return view;
  });
  rows.sort((a, b) => {
    if (!!a.flip !== !!b.flip) return a.flip ? -1 : 1;
    if (a.flip && b.flip) return Math.abs(a.flip.to - a.flip.from) / Math.abs(a.flip.from || 1) - Math.abs(b.flip.to - b.flip.from) / Math.abs(b.flip.from || 1);
    return 0;
  });
  return { rows, noFlip: s.noFlip, evaluations: s.evaluations, baseKey: s.baseTop ?? "" };
}

export { realOf, sumOf };
export type { PresetId, Presets };
