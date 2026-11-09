// The comparison in the browser: the bundle's shapes (compare.server.ts), the person's numbers as a run goal, and the engine's
// candidate set (F-83) and ranking (F-80) over them, which the fee page and the indices page run on. No rate, fee or rule figure is
// written here: everything comes from the bundle or from the person, and every number leaves as a value object so the provenance
// sheet can open it.
import { buildCandidateSet, coverageLine, withHeldRate, withFeeScaled, outcomeOrder, rankCandidates, tieThreshold, type Candidate, type CandidateSet, type CandidateSetInput, type ComparisonGoal, type CoverageLine, type InstrumentTerms, type OutcomeKind, type Ranking, type Reason, type RunContext, type RunResult, type UsedRule } from "@finance-tool/engine";
import type { ExposureRecord, ParameterRecord, RuleRecord, ValueObject, ProductId, ProductRecord } from "@finance-tool/schema";
import { computedInputs as ci, formulaNames, guideBlocks, ownTermsCopy, r2 } from "../copy";
import type { Employment } from "./inputs";
import type { FieldKey, PresetId, Presets } from "./goal";
import { fitOf, type FitTableData } from "./fit";
import { computed, entered as enteredValue, sumOf as sumValues, weaker, type SiteValue, type Strength } from "./value";


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
    /** True when the provider is the person's choice and not the one P-05 names (`applyOwnProviders`). */
    chosen?: boolean;
    /** The site picked this provider for the goal (F-80, Doron's case): of the collected list tariffs, the one that leaves this goal the most; `compared` is how many were run (`applyProviders`). */
    pickedBy?: "site";
    compared?: number;
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
  /** The fee level the person enters for a wrapper's representative instrument (D4), % a year, by wrapper id. Entered. It replaces the instrument's fee in F-80 and F-81. */
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
  return { ...v, parameter: { rationale: p.rationale, rationaleHe: p.rationale_he ?? null } };
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
 * management, variable and trustee lines added (the lines F-81 moves together as "the cost inside the fund"). Undefined when it has none.
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
export function withOwnFee(w: WrapperEntry, terms: InstrumentTerms, g: Pick<RunGoal, "ownFees">): InstrumentTerms {
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

const tariffValueKeys = ["tradeRate", "tradeMin", "tradeMax", "standingRate", "standingMin", "standingMax", "custodyRate", "custodyMin", "custodyMax", "fxRate", "monthlyFee"] as const;

/**
 * The bundle with the person's chosen providers in place (D4 and D21: the representative provider is a parameter the
 * person may override): for a wrapper in `g.ownProviders` whose entry carries that provider, the wrapper's tariff and the sourced
 * tariff lines behind it are the provider's, and its representative names the provider and says it was chosen. The fund, its costs
 * and every other term stay. An id the wrapper does not carry is ignored. Returns `bundle` itself when nothing changes.
 */
export function applyOwnProviders(bundle: CompareBundle, g: Pick<RunGoal, "ownProviders">): CompareBundle {
  const own = g.ownProviders;
  if (!own || Object.keys(own).length === 0) return bundle;
  let changed = false;
  const wrappers = bundle.wrappers.map((w) => {
    const id = own[w.id];
    const p = id !== undefined ? w.providers?.[id] : undefined;
    if (!p || !w.terms) return w;
    changed = true;
    const feeValues = { ...w.feeValues };
    for (const k of tariffValueKeys) delete feeValues[k];
    Object.assign(feeValues, p.feeValues);
    // the member's kind decides custody on makam (F-14, BRK-17); a bond run takes no such input
    const memberKind = p.memberKind && (w.family === "makam" || w.family === "securities") ? { memberKind: p.memberKind } : {};
    return { ...w, terms: { ...w.terms, tariff: clone(p.tariff), ...memberKind }, feeValues, representative: { ...(w.representative ?? { name: w.name }), provider: p.name, providerId: id!, chosen: true } };
  });
  return changed ? { ...bundle, wrappers } : bundle;
}

/**
 * The bundle with each provider-carrying wrapper (the brokerage account) priced on the collected list tariff that leaves this goal the
 * most (F-80, Doron's case): the person's chosen provider first (`applyOwnProviders`); then, for a wrapper with no choice,
 * every tariff in `providers` is run once and the best becomes the representative, marked `pickedBy: "site"` with the number compared.
 * The pick is made once per goal, so F-81's moves, the picker and a saved comparison's re-run all rest on it. A wrapper whose run cannot
 * be made yet (no return entered) keeps P-05's tariff. Returns `bundle` itself when nothing changes.
 */
export function applyProviders(bundle: CompareBundle, g: RunGoal): CompareBundle {
  const withOwn = applyOwnProviders(bundle, g);
  let out = withOwn;
  for (const w of withOwn.wrappers) {
    if (!w.providers || !w.terms || g.ownProviders?.[w.id] !== undefined || w.representative?.viaIndex) continue;
    const ids = Object.keys(w.providers);
    if (ids.length === 0) continue;
    let best: { id: string; real: number } | null = null;
    for (const id of ids) {
      const run = evaluate(applyOwnProviders(withOwn, { ownProviders: { [w.id]: id } }), g, { only: new Set([w.id]) }).candidates.find((c) => c.id === w.id)?.run;
      if (!run) {
        best = null;
        break;
      }
      if (!best || run.real > best.real) best = { id, real: run.real };
    }
    if (!best) continue;
    const picked = applyOwnProviders(out, { ownProviders: { [w.id]: best.id } });
    out = {
      ...picked,
      wrappers: picked.wrappers.map((x) => {
        if (x.id !== w.id || !x.representative) return x;
        const { chosen: _chosen, ...rep } = x.representative;
        return { ...x, representative: { ...rep, pickedBy: "site" as const, compared: ids.length } };
      }),
    };
  }
  return out;
}

export type FeeKind = "balance" | "deposit" | "direct" | "fund" | "trade" | "custody";

function scaleTerms(terms: InstrumentTerms, id: string, scale: Record<string, number>): InstrumentTerms {
  const k = (kind: FeeKind) => scale[`${id}:${kind}`] ?? 1;
  if (Object.keys(scale).every((key) => !key.startsWith(`${id}:`))) return terms;
  const t = clone(terms);
  // a discounted line moves in both of its periods (F-81 with A-19): the discounted rate and the rate it reverts to
  if (t.fees) t.fees = withFeeScaled(withFeeScaled(withFeeScaled(t.fees, "balance", k("balance")), "deposit", k("deposit")), "direct", k("direct"));
  if (t.fund?.drag) {
    const d = t.fund.drag;
    for (const f of ["management", "variable", "trustee"] as const) if (d[f] !== undefined) d[f] = d[f]! * k("fund");
  }
  if (t.tariff) {
    if (t.tariff.buy) t.tariff.buy.rate *= k("trade");
    if (t.tariff.buyStanding) t.tariff.buyStanding.rate *= k("trade");
    if (t.tariff.sell) t.tariff.sell.rate *= k("trade");
    if (t.tariff.redeem) t.tariff.redeem.rate *= k("trade");
    if (t.tariff.custody) t.tariff.custody.rate *= k("custody");
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
export function termsFor(w: WrapperEntry, g: RunGoal, scale: Record<string, number>, needs: Partial<Record<string, FieldKey>>): InstrumentTerms | undefined {
  if (!w.terms) return undefined;
  let t = scaleTerms(withOwnFee(w, w.terms, g), w.id, scale);
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

const realOf = (run: RunResult) => run.real;
const sumOf = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0);

const strengthOfUsed = (u: UsedRule): Strength => u.figures.reduce<Strength>((w, f) => weaker(w, f.strength as Strength) ?? w, u.strength);

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

// ---------------------------------------------------------------- what a run reads

/** The goal's numbers as the values their sheets open: the comparison's own (`goalValueObjects`) or the fee page's fields. */
export interface PlanValues {
  amount: SiteValue;
  monthly: SiteValue;
  years: SiteValue;
  inflation: SiteValue;
  /** The return (A-01) a run that rests on one takes; null while none is entered. */
  returnV: SiteValue | null;
  /** The part kept available: every run starts from the amount now less it. */
  available?: SiteValue;
  /** A-17, the insurance inside a pension fund, when it was entered. */
  insurance?: SiteValue;
  /** The income the runs take when it is not the goal's monthly salary (the fee page's yearly income, entered or the scenario's), with its name. */
  income?: { name: string; value: SiteValue };
}

/** The money every run of the goal reads: the amount now, what stays available when part does (each run starts from the difference), the deposit, the years and the inflation. */
export function planMoney(g: Pick<RunGoal, "available">, v: PlanValues): Record<string, SiteValue> {
  return { [ci.amountNow]: v.amount, ...(g.available > 0 && v.available ? { [ci.names.keep!]: v.available } : {}), [ci.monthly]: v.monthly, [ci.years]: v.years, [ci.inflation]: v.inflation };
}

/** The rate a cash-like option's run takes (method 2.4, F-67): the person's own or the bank's published one (`cashRateFor`), else P-05's cash rate as a site parameter. Undefined for an option that rests on the return. */
export function runRateOf(bundle: CompareBundle, w: WrapperEntry, g: RunGoal): SiteValue | undefined {
  if (needsReturn(w)) return undefined;
  return cashRateFor(w, g, bundle.runDate) ?? (isCashLike(w) && bundle.parameters.length ? cashRateOf(bundle) : undefined);
}

/** The current account's balance ceiling (F-26), when the run takes it (no rate of the person's, which applies to the whole balance) and the money compared can pass it. */
function ceilingRead(w: WrapperEntry, g: RunGoal): SiteValue | undefined {
  const ceiling = w.terms?.deposit?.balanceCeiling;
  if (ceiling === undefined || !w.cashCeiling || g.ownRates?.[w.id] !== undefined) return undefined;
  return g.amountNow - g.available + 12 * g.horizonYears * g.monthly > ceiling ? w.cashCeiling : undefined;
}

/**
 * The person's age, income, deposits through work and pension insurance, each only where the run reads it: a pension's (A-12, A-17,
 * PEN-26), the study fund's (its deposits, TXH-05, the shorter lock at retirement age TXH-10), a lock to an age (B3), the reduced brackets
 * from 60 over the other income (F-42: the run cites TXG-07 only then) and the low-income deduction on deposit interest (TXI-20).
 */
function profileInputs(g: RunGoal, w: WrapperEntry | undefined, used: readonly UsedRule[], today: string, v: PlanValues): Record<string, SiteValue> {
  const out: Record<string, SiteValue> = {};
  if (!w) return out;
  const cited = (id: string) => used.some((u) => u.id === id);
  const pension = w.family === "pension";
  const studyFund = w.id === "keren-hishtalmut";
  const fromSixty = cited("TXG-07");
  if (g.age !== null && (pension || studyFund || w.record.lawful_exit?.kind === "at_age" || fromSixty)) out[ci.age] = enteredValue(g.age, "years", today, ci.age);
  const salary = g.salary !== null && g.salary > 0 ? g.salary : null;
  const income = v.income ?? (salary !== null ? { name: ci.salary, value: enteredValue(salary, "nis_per_month", today, ci.salary) } : null);
  if (income && (pension || studyFund || fromSixty || cited("TXI-20"))) out[income.name] = income.value;
  if (pension && g.employment === "employee" && salary !== null) {
    if (g.pensionEmployee !== null) out[ci.pensionEmployee] = enteredValue(g.pensionEmployee, "pct", today, ci.pensionEmployee);
    if (g.pensionEmployer !== null && g.pensionEmployer > 0) out[ci.pensionEmployer] = enteredValue(g.pensionEmployer, "pct", today, ci.pensionEmployer);
  }
  const insurance = v.insurance ?? (g.insurancePct !== null ? enteredValue(g.insurancePct, "pct", today, ci.insurance) : undefined);
  if (pension && w.id !== "provident-for-annuity" && insurance) out[ci.insurance] = insurance;
  return out;
}

/**
 * What one candidate's run reads, each as the value its sheet opens, so a figure of that run lists only what it rests on: the
 * goal's money (`planMoney`); the return for a run that rests on one,
 * or the option's own rate for a cash-like one (method 2.4, F-67), with the current account's balance ceiling when it bites (F-26); and
 * the person's profile where the run reads it. `rate` is the return the run took when it is the run's own (an exposure's, F-71).
 * The one helper behind every figure of a run: the comparison's (`makeValues`) and the fee page's (`factory`).
 */
export function runInputs(bundle: CompareBundle, g: RunGoal, v: PlanValues, w: WrapperEntry | undefined, used: readonly UsedRule[] = [], rate?: SiteValue): Record<string, SiteValue> {
  const out = planMoney(g, v);
  if (w && !needsReturn(w)) {
    const r = rate ?? runRateOf(bundle, w, g);
    if (r) out[ci.cashRate] = r;
    const ceiling = ceilingRead(w, g);
    if (ceiling) out[guideBlocks.terms.labels.balanceCeiling!] = ceiling;
  } else {
    const r = rate ?? v.returnV;
    if (r) out[ci.grossReturn] = r;
  }
  return Object.assign(out, profileInputs(g, w, used, bundle.runDate, v));
}

/**
 * What the run of the part kept available reads (`enteredGoal(goal, keep, 0)`, the view's `kept`): that part alone, with no deposit, the
 * years, the inflation, the rate of where it is kept (the current account's, with its ceiling when the part passes it, or the money-market
 * fund's, P-05's cash rate) and the profile where that run reads it. `runInputs` over the part as the run's whole amount.
 */
export function keptInputs(bundle: CompareBundle, g: RunGoal, v: PlanValues, w: WrapperEntry | undefined, used: readonly UsedRule[] = []): Record<string, SiteValue> {
  const { [ci.amountNow]: _amount, [ci.monthly]: _monthly, ...rest } = runInputs(bundle, { ...g, amountNow: g.available, available: 0, monthly: 0 }, v, w, used);
  return { [ci.names.keep!]: v.available ?? v.amount, ...rest };
}

/** The run a figure comes from: the wrapper it ran (its id), the rules it cited, and the return it ran at when that is its own (an exposure's). */
export interface RunRef {
  id?: string;
  usedRules: readonly UsedRule[];
  flags?: readonly { code: string }[];
  labels?: readonly { code: string; ruleId: string }[];
  rate?: SiteValue;
}

/** A computed number (D7) with the inputs it came from, for every figure the result shows. */
export function makeValues(bundle: CompareBundle, g: RunGoal) {
  const today = bundle.runDate;
  const gv = goalValueObjects(bundle, g);
  const plan: PlanValues = { amount: gv.amountNow, monthly: gv.monthly, years: gv.horizon, inflation: gv.inflation, returnV: gv.returnV, available: gv.available };
  const byId = new Map(bundle.wrappers.map((w) => [w.id as string, w]));
  const rulesOf = (used: readonly UsedRule[]) => used.map((u) => ({ id: u.id, strength: strengthOfUsed(u) }));
  /** What the run behind a figure reads (`runInputs`); with no run named, the goal's money and its return: what every run of the comparison shares. */
  const inputsOf = (run?: RunRef): Record<string, SiteValue> => runInputs(bundle, g, plan, run?.id ? byId.get(run.id) : undefined, run?.usedRules ?? [], run?.rate);
  /** A figure of one run (a NIS amount at the horizon): its inputs are what that run read. */
  const nis = (value: number, formula: string, about: string, run?: RunRef, extra?: Record<string, SiteValue>): SiteValue =>
    computed(value, "nis", formula, { ...inputsOf(run), ...(extra ?? {}) }, { today, about, rules: run ? rulesOf(run.usedRules) : [], flags: run?.flags?.map((f) => f.code), labels: run?.labels?.map((l) => ({ code: l.code, ruleId: l.ruleId })) });
  type Tied = { name: string; real: number; run?: RunRef | undefined };
  return {
    goal: gv,
    /** The money every run reads (`planMoney`): what a figure over the goal's amounts alone starts from. */
    money: planMoney(g, plan),
    inputsOf,
    nis,
    /** F-80's gap between the first and the last of a tie, % of the larger real value: it lists those two values, each from its own run. */
    tieGap(gap: number, a: Tied, b: Tied): SiteValue {
      return computed(gap, "pct", "F-80", { [a.name]: nis(a.real, "F-06", r2.realLabel, a.run), [b.name]: nis(b.real, "F-06", r2.realLabel, b.run) }, { today, about: r2.result.tieMid });
    },
    /** A figure of the run of the part kept available, kept `where` (`keptInputs`). */
    keptNis(value: number, formula: string, about: string, where: string, run?: RunRef): SiteValue {
      return computed(value, "nis", formula, keptInputs(bundle, g, plan, byId.get(where), run?.usedRules ?? []), { today, about, rules: run ? rulesOf(run.usedRules) : [], flags: run?.flags?.map((f) => f.code), labels: run?.labels?.map((l) => ({ code: l.code, ruleId: l.ruleId })) });
    },
    /** A figure over exactly the inputs given: arithmetic over a few of the goal's numbers, or a gap between two figures on the page. */
    of(value: number, unit: ValueObject["unit"], formula: string, about: string, inputs: Record<string, SiteValue>): SiteValue {
      return computed(value, unit, formula, inputs, { today, about });
    },
    /** A rate or a multiplier or a number of years that a sensitivity row reports: F-81 re-runs the whole comparison, so it rests on what every run shares. */
    plain(value: number, unit: ValueObject["unit"], formula: string, about: string, extra?: Record<string, SiteValue>): SiteValue {
      return computed(value, unit, formula, { ...inputsOf(), ...(extra ?? {}) }, { today, about });
    },
    date(iso: string, about: string): SiteValue {
      return { ...computed(null, "text", "B3", {}, { today, about }), value: iso };
    },
    count(value: number, about: string): SiteValue {
      return computed(value, "count", "F-83", {}, { today, about });
    },
  };
}

// ---------------------------------------------------------------- places and the sensitivity axes (F-80, F-81)

/**
 * Place groups for ranked entries in order (F-80): the tie set is pairwise with the top (the engine's
 * `ranking.tieSet`), not transitive. Its members share the first place; every other entry has its own place by the engine's order.
 */
export function placeGroups(entries: readonly { id: string }[], tieSet: readonly string[]): number[] {
  const tied = new Set(tieSet.length > 1 ? tieSet : []);
  return entries.map((e, i) => (tied.has(e.id) ? 0 : i));
}

/** F-81: the shortest holding period the horizon axis tests, P-05's slider minimum, so a page never says "0 years" (fee page). */
export function horizonFloorOf(bundle: CompareBundle): number | undefined {
  const min = (parameterOf(bundle, "P-05") as unknown as { sliders?: Record<string, { min?: ValueObject }> }).sliders?.horizon_years?.min?.value;
  return typeof min === "number" ? min : undefined;
}

export { realOf, sumOf };
export type { PresetId, Presets };
