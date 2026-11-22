// The comparison in the browser: the bundle's shapes (compare.server.ts), the person's numbers as a run goal, and the engine's
// candidate set (F-83) and ranking (F-80) over them. No rate, fee or rule figure is
// written here: everything comes from the bundle or from the person, and every number leaves as a value object so the provenance
// sheet can open it.
import { buildCandidateSet, calendarMonthOf, coverageLine, withHeldRate, outcomeOrder, rankCandidates, tieThreshold, type Candidate, type CandidateSet, type CandidateSetInput, type ComparisonGoal, type CoverageLine, type InstrumentTerms, type OutcomeKind, type Ranking, type Reason, type RunContext } from "@finance-tool/engine";
import type { ExposureRecord, ParameterRecord, RuleRecord, ValueObject, ProductId, ProductRecord } from "@finance-tool/schema";
import { formulaNames, guideBlocks, ownTermsCopy, r2 } from "../copy";
import type { Employment } from "./inputs";
import type { FieldKey, PresetId, Presets } from "./goal";
import { fitOf, type FitTableData } from "./fit";
import { entered as enteredValue, sumOf as sumValues, type SiteValue } from "./value";


// A name this screen's numbers use that copy.ts's table does not hold (P-07, the goal presets); the formulas' names are copy.ts's own.
Object.assign(formulaNames, {
  "P-07": "נקודת התחלה",
});

// ---------------------------------------------------------------- the bundle (built at build time)

export type Family = "provident" | "pension" | "deposit" | "securities" | "makam" | "bond";

export interface WrapperEntry {
  id: ProductId;
  /** The glossary name: the record's first Hebrew name. */
  name: string;
  family: Family | null;
  record: ProductRecord;
  /** The instrument terms the guide page uses for it; absent when a record the run needs is missing. */
  terms?: InstrumentTerms;
  /** The list-fee lines the terms came from, with their sources. */
  feeValues: Record<string, SiteValue>;
  /** A deposit-family wrapper's own published rate (A-21, A-25; D20): its deposit-terms record's `rate_offered`, as the record holds it. */
  cashRate?: SiteValue;
  /** The amounts the published rate applies to (the deposit record's `amount_range`); absent when the bundle does not carry it. */
  cashRange?: { min: SiteValue; max: SiteValue | null };
  /** The current account's balance ceiling the published rate is paid up to (F-26, BANK-09), the value behind `terms.deposit.balanceCeiling`; a figure that rests on it lists it. */
  cashCeiling?: SiteValue;
  /** The instrument the run rests on, named for the card: the fund or track P-05 names, and the provider whose tariff is used. Absent when the bundle does not carry it. */
  representative?: {
    name: string;
    provider?: string;
    /** The id of that provider's snapshot, when the wrapper carries `providers`. */
    providerId?: string;
    /** The channel of the trade line the site's own tariff reads (P-05's provider); the first list line of the snapshot with the direct channel (or none) first, as the guide pages read it. Absent when the snapshot's lines carry none. */
    channel?: string;
    /** The run rests on a way over the indices: `range`, the lowest of the ways over the known indices (nothing chosen, D27), or `chosen`, the cheapest way for the index the person chose. */
    viaIndex?: "range" | "chosen";
    /** The in-fund cost (brokerage and the like) or the track's balance fee the run takes, as a value object (sourced, or computed when it is a sum of the fund's lines), % a year. */
    fee?: SiteValue;
    /** The lowest in-fund cost among the fund records collected for the same exposure (same measure as `fee`), % a year. */
    classMinFee?: SiteValue;
  };
  /**
   * The providers whose tariff the person may run the wrapper on (brokerage only): every bank and broker snapshot
   * the providers workbench ranks, by provider id, with the tariff lines the run reads and the value objects behind them.
   */
  providers?: Record<string, ProviderTariff>;
  /**
   * What P-04 judges the run's instrument by: the representative track's regulator classification for a provident or
   * pension wrapper, or "equity" for a fund-based wrapper whose fund holds an equity-index exposure. Absent: no classification, never demoted.
   */
  fitBasis?: { track: { specialization: string; subSpecialization: string; classification: string } } | { equity: true };
  /**
   * A provident or pension wrapper's balance fee as the person may enter it (D86): a rate below `revertsTo` holds for `months` (PF-13's
   * period, `years` as the rule's figure) and then returns to `revertsTo`, a fraction (`rate`, its value object): the rate the record's
   * discount reverts to, else the record's own rate. Absent when the record gives neither.
   */
  ownFeeHold?: { months: number; years: SiteValue; revertsTo: number; rate: SiteValue };
  /** Why there are no terms, one line each (log text, not shown). */
  missing: string[];
}

/** One provider's tariff as a run takes it, with the sourced tariff lines it came from (`feeValues` keys as in `WrapperEntry`). */
export interface ProviderTariff {
  name: string;
  /** The channel whose trade line the tariff reads: the direct one, the branch one where the snapshot has no direct trade line. */
  channel: string;
  tariff: NonNullable<InstrumentTerms["tariff"]>;
  feeValues: Record<string, SiteValue>;
  /** F-14: whether the provider is a bank (custody barred on makam and money-market units, BRK-17) or a non-bank member. */
  memberKind?: "bank" | "non-bank";
}

export interface Tier2Row {
  id: string;
  name: string;
  /** The open question or questions that block it, as the method names them. */
  openQuestion: string;
}

/** One exposure record in the bundle (release 5): the record, its Hebrew name and where its pages are. */
export interface ExposureEntry {
  record: ExposureRecord;
  name: string;
  oneLine: string | null;
  guideHref: string;
  /** The index page, for an index with a fund record (the funds page is gone). */
  fundsHref: string | null;
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
  /** The records those rules' cards point at (derived_from, examples) that the bundle does not ship: only chips and cards read them. */
  pointed?: RuleRecord[];
  checklist: { id: string; name: string; explanation: string }[];
  /** The Bank of Israel page a cash-like rate comes from (BANK-22), for the link-out. */
  cashLink: { href: string; title: string; ruleId: string } | null;
  /** Release 5: every exposure record. Absent in a bundle from before it. */
  exposures?: ExposureEntry[];
  /** Release 5: the data files the runs read, for the saved comparison's versions (F-82). */
  dataFiles?: BundleDataFile[];
  /** Release 5: the build's version and data snapshot, written into a saved comparison (as `StateFile.site`). */
  site?: { version: string; data: string };
  /** P-04, the site's fit table: the equity row's minimum horizon and fall, for the limitation-first headline and for listing equity options the person's accepted drop does not fit. */
  fit?: FitTableData;
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
  /** Employment was not entered; "employee" is taken because the person says they have a pension or study fund through work. */
  employmentInferred?: boolean;
  /** The person's own rate for a deposit-family wrapper whose published rate does not apply to the amount (A8), % a year, by wrapper id. Entered. */
  ownRates?: Record<string, number>;
  /** The fee level the person enters for a wrapper's representative instrument (D4), % a year, by wrapper id. Entered. It replaces the instrument's fee in F-80. */
  ownFees?: Record<string, number>;
  /** The provider the person chose for a wrapper (the brokerage account), by wrapper id: its id in `WrapperEntry.providers`. A choice, not a figure; the tariff lines it brings are sourced. */
  ownProviders?: Record<string, string>;
  /** The index the person chose for a wrapper (the brokerage account, D27), by wrapper id: an `equity_index` exposure id. A choice, not a figure; with none the account names no index. */
  ownIndices?: Record<string, string>;
  /** The largest fall the person accepts (A-29), % of value; null when not entered. With P-04's equity row it decides whether an equity-exposed option is ranked (F-83). */
  acceptedFall?: number | null;
  /** A forecast worst fall the person entered for the exposure this view is about (the "באיזה מוצר" view), %; passes the F-71 filter when it does not exceed `acceptedFall`. */
  forecastFall?: number | null;
}

export function parameterOf(bundle: CompareBundle, method: string): ParameterRecord {
  const p = bundle.parameters.find((x) => (x as { method_id?: string }).method_id === method);
  if (!p) throw new Error(`the bundle holds no parameter ${method}`);
  return p;
}

/** A parameter's value object with the parameter marker the provenance sheet reads ("פרמטר של האתר"). */
export function asParameter(p: ParameterRecord, v: ValueObject): SiteValue {
  return { ...v, parameter: { rationale: p.rationale, rationaleHe: p.rationale_he ?? null } };
}

// ---------------------------------------------------------------- terms for one run

const fundsWithReturn = new Set(["israeli-fund", "tase-foreign-fund", "foreign-fund"]);

/** Whether a wrapper's run rests on the person's return (A-01); the others rest on a cash rate. */
function needsReturn(w: WrapperEntry): boolean {
  if (w.family === "provident" || w.family === "pension") return true;
  if (w.family === "securities") return fundsWithReturn.has(w.terms?.fund?.kind ?? "") || w.id === "ira-hishtalmut";
  return false;
}

/** The rate a deposit-family wrapper runs on: the person's own (entered, A8), else the bank's published one. */
function cashRateFor(w: WrapperEntry, g: RunGoal, today: string): SiteValue | undefined {
  const own = g.ownRates?.[w.id];
  if (own !== undefined && Number.isFinite(own)) return enteredValue(own, "pct_per_year", today, r2.result.ownRate.about);
  return w.cashRate;
}

const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T;

// ---------------------------------------------------------------- the representative instrument's fee (D4)

/** Which of a wrapper's fees an entered fee level replaces: the track's balance fee (provident, pension) or the fund's own cost (a fund held through securities). */
export function feeTargetOf(w: Pick<WrapperEntry, "family" | "terms">): "balance" | "fund" | null {
  if ((w.family === "provident" || w.family === "pension") && w.terms?.fees) return "balance";
  const d = w.terms?.fund?.drag;
  if (w.family === "securities" && d && (d.management !== undefined || d.variable !== undefined || d.trustee !== undefined)) return "fund";
  return null;
}

export const fundCostKeys = ["fundManagement", "fundVariable", "fundTrustee"] as const;

/**
 * A fund's own cost lines added up as a run takes them, % a year (F-10's δ: the management, variable and trustee fees, and where the run
 * reads them the tracking gap and the foreign withholding), each line an input in the reader's words. Undefined when no line is stated.
 * One helper for every page that shows the sum, so none labels it with another formula.
 */
export function fundCostOf(feeValues: Record<string, SiteValue>, keys: readonly string[], about: string, today: string): SiteValue | undefined {
  const parts = keys.filter((k) => typeof feeValues[k]?.value === "number");
  if (parts.length === 0) return undefined;
  return sumValues(Object.fromEntries(parts.map((k) => [guideBlocks.terms.labels[k] ?? k, feeValues[k]!])), "F-10", { today, about, unit: "pct_per_year" });
}

/**
 * The fee the run takes for the representative instrument, % a year, as a value object: the track's balance fee, or the fund's
 * management, variable and trustee lines added ("the cost inside the fund"). Undefined when it has none.
 */
export function representativeFeeValue(w: Pick<WrapperEntry, "family" | "terms" | "feeValues">, today: string): SiteValue | undefined {
  const target = feeTargetOf(w);
  if (target === "balance") return w.feeValues.balance;
  if (target !== "fund") return undefined;
  const parts = fundCostKeys.filter((k) => typeof w.feeValues[k]?.value === "number");
  if (parts.length === 1) return w.feeValues[parts[0]!];
  return fundCostOf(w.feeValues, fundCostKeys, ownTermsCopy.fundCostLabel, today);
}

/**
 * The terms with the person's entered fee in place of the representative instrument's fee (D4): the balance fee, or the fund's management
 * line with its variable and trustee lines at zero. An entered balance fee below what the run would otherwise charge holds for PF-13's
 * period and then returns to that rate (`ownFeeHold`, D86): a lower fee a company agrees to is a discount, and no binding document
 * promises it for longer. The deposit fee keeps the record's terms, its discount included.
 */
function withOwnFee(w: WrapperEntry, terms: InstrumentTerms, g: Pick<RunGoal, "ownFees">): InstrumentTerms {
  const own = g.ownFees?.[w.id];
  const target = feeTargetOf({ family: w.family, terms });
  if (own === undefined || !Number.isFinite(own) || !target) return terms;
  const t = clone(terms);
  if (target === "balance") t.fees = withHeldRate(t.fees!, "balance", own / 100, w.ownFeeHold?.months ?? 0, w.ownFeeHold?.revertsTo);
  else {
    const d = t.fund!.drag!;
    d.management = own / 100;
    if (d.variable !== undefined) d.variable = 0;
    if (d.trustee !== undefined) d.trustee = 0;
  }
  return t;
}

/** The pension run's profile (A-12) and insurance (A-17) come from the person; a provident fund for annuity has no insurance (PEN-35). */
function pensionTerms(w: WrapperEntry, t: InstrumentTerms, g: RunGoal, needs: Partial<Record<string, FieldKey>>): InstrumentTerms {
  const next = clone(t);
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
export function termsFor(w: WrapperEntry, g: RunGoal, needs: Partial<Record<string, FieldKey>>): InstrumentTerms | undefined {
  if (!w.terms) return undefined;
  let t = withOwnFee(w, w.terms, g);
  // F-26: the published balance ceiling belongs to the published rate; a rate the person entered applies to the whole balance
  if (t.deposit?.balanceCeiling !== undefined && g.ownRates?.[w.id] !== undefined) {
    const { balanceCeiling: _ceiling, ...rest } = t.deposit;
    t = { ...t, deposit: rest };
  }
  if (w.family === "pension") return pensionTerms(w, t, g, needs);
  if (w.id !== "keren-hishtalmut") return t;
  const next = clone(t);
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
  /** Only these wrappers, no tier 2. */
  only?: Set<string>;
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


/** Dimensions of a wrapper record that decide whether this person can hold it at all (an open rule among them keeps it from being ranked). */
const eligibilityDimensions = ["minimum", "eligibility"] as const;

/**
 * F-83: an option whose minimum-amount (or other eligibility) rule is open is shown, not ranked: its ranked value would
 * rest on a purchase the site does not know is possible. The reason is `rule-open` with `detail` "minimum:GOV-OQ7" (dimension and open question).
 */
export function openConstraintOf(record: Pick<ProductRecord, "dimensions">): Reason | null {
  for (const d of eligibilityDimensions) {
    const m = (record.dimensions as Record<string, string> | undefined)?.[d];
    // a bare `blocked` (no question named; the data check refuses one, the page still must not rank on it) keeps an empty code
    if (m === "blocked" || (typeof m === "string" && m.startsWith("blocked:"))) return { code: "rule-open", ruleIds: [], gapIds: [], detail: `${d}:${m.slice("blocked:".length)}` };
  }
  return null;
}

/** P-04's equity row: the horizon from which the site's table calls an equity track fitting, and the fall it is judged to take. Null when the bundle holds no table. */
export function equityFit(bundle: Pick<CompareBundle, "fit">): { minYears: SiteValue; maxFall: SiteValue | null } | null {
  const row = bundle.fit?.rows.find((r) => r.classification === "מניות");
  if (!row || typeof row.minYears.value !== "number") return null;
  return { minYears: row.minYears, maxFall: row.maxFallPct && typeof row.maxFallPct.value === "number" ? row.maxFallPct : null };
}

/**
 * F-83: an equity-exposed option (one whose run rests on the person's entered return, A-01) is listed, not ranked, when the fall
 * the person accepts (A-29) is below the fall P-04 judges the option's own classification to take (a provident or pension wrapper: its representative track's row, so a general track is judged at the general row; a fund-based wrapper: the equity row when its exposure is an equity index; no classification: never demoted), unless they entered a forecast fall for it that passes the F-71
 * filter. The reason is `rule-open` with `detail` "fit-drop:<P-04 fall>"; nothing is a financial rule, both numbers are the person's or a site parameter (D11 unchanged).
 */
export function fitDropReason(bundle: Pick<CompareBundle, "fit">, w: WrapperEntry, g: Pick<RunGoal, "acceptedFall" | "forecastFall">): Reason | null {
  if (!needsReturn(w)) return null;
  const accepted = g.acceptedFall;
  if (accepted === null || accepted === undefined) return null;
  const basis = w.fitBasis;
  if (!basis) return null;
  let cap: SiteValue | null | undefined;
  if ("equity" in basis) cap = equityFit(bundle)?.maxFall;
  else {
    // the track's own P-04 row ("כללי" 20 %, "מניות" 30 %, ...), looked up as the fit mark does; fitOf is called with the accepted fall of 0 so it reports the row's cap
    const r = bundle.fit ? fitOf(bundle.fit, basis.track, 0, 0) : null;
    cap = r && r.kind !== "no-rule" ? r.fall?.max : null;
  }
  if (!cap || accepted >= (cap.value as number)) return null;
  if (typeof g.forecastFall === "number" && g.forecastFall <= accepted) return null;
  return { code: "rule-open", ruleIds: [], gapIds: [], detail: `fit-drop:${cap.value}` };
}

export function evaluate(bundle: CompareBundle, g: RunGoal, options: EvalOptions = {}): Evaluated {
  const ctx: RunContext = { rules: bundle.rules, runDate: bundle.runDate };
  const needs: Partial<Record<string, FieldKey>> = {};
  const entries = bundle.wrappers.filter((w) => !options.only || options.only.has(w.id));
  // each run's month 1 is the run date's month, so its tax years follow the calendar (F-01)
  const goal = { ...comparisonGoal(g), firstMonth: calendarMonthOf(bundle.runDate) };
  const inputs: CandidateSetInput = {
    wrappers: entries.map((w) => {
      const terms = termsFor(w, g, needs);
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
    const open = (c.kind === "ranked" || c.kind === "listed-not-ranked") && w ? openConstraintOf(w.record) : null;
    if (open) return { ...c, kind: "listed-not-ranked", reasons: [...c.reasons, open] };
    if (g.returnPct === null && w && c.run && needsReturn(w)) {
      return { id: c.id, tier: 1, kind: "not-evaluated", reasons: [{ code: "missing-input", ruleIds: [], gapIds: [], detail: "A-01" }] };
    }
    const unfit = (c.kind === "ranked" || c.kind === "listed-not-ranked") && w && c.run ? fitDropReason(bundle, w, g) : null;
    if (unfit) return { ...c, kind: "listed-not-ranked", reasons: [...c.reasons, unfit] };
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

export type { PresetId, Presets };
