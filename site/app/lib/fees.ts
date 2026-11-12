// The fee page's analysis in the browser (flows 20, 21, 27; design-spec 11 and 12): the subject becomes a run plan
// (the saved goal's, or the illustrative scenario's), the engine's F-61 gives each fee's cost, F-68 and the rule
// base give the reference and the cap, F-62 gives the verdict, F-81 asks what would change it. No rate, fee or rule
// figure is written here: it all comes from the bundles or from the person. Every number leaves as a value object.
import {
  feeCap,
  feeLines,
  feeMateriality,
  feeMaterialitySeries,
  feeThresholds,
  feeVerdict,
  rateAfterDiscount,
  sensitivity,
  sensitivityAxes,
  valueOfReduction,
  BlockedError,
  type Candidate,
  type Discount,
  type FeeLine,
  type FeeMaterialitySeries,
  type FeeMateriality,
  type FeeThresholds,
  type FeeVerdict,
  type RunContext,
  type RunPlan,
  type UsedRule,
} from "@finance-tool/engine";
import type { RuleRecord, ValueObject } from "@finance-tool/schema";
import { computedInputs as ci, formulaNames, r3fees } from "../copy";
import { asParameter, evaluate, fundCostOf, goalValueObjects, horizonFloorOf, nothingToCompare, parameterOf, placeGroups, runInputs, type CompareBundle, type FeeKind, type PlanValues, type RunGoal, type WrapperEntry } from "./compare";
import { fmt } from "./format";
import { blockedHe } from "./failure-he";
import type { InputsState } from "./inputs";
import type { FieldKey } from "./goal";
import { asField, computed, depositFeeNoneByRule, entered as enteredValue, ruleFigure, staleCmaFee, weaker, type SiteValue, type Strength } from "./value";
import { classKey, trackFees, type FeesData, type TrackLite } from "./fee-page-data";
import type { RefLink } from "./sources";
import type { SubjectSpec } from "./fee-deal/link";

Object.assign(formulaNames, { "F-62": "פסק דין על עמלה", "F-68": "ממוצע הרשות למסלולי הסיווג", "F-61": "עלות דמי הניהול" });

// ---------------------------------------------------------------- the data (fees.server.ts) and the subject in the address

export { classKey, loadFeesData, type FeesData, type TrackLite } from "./fee-page-data";
export { parseSubject, type SubjectSpec } from "./fee-deal/link";

// ---------------------------------------------------------------- the inputs

export interface FeeInputs {
  g: RunGoal;
  /** The saved goal has what a run needs, so the numbers are its own. */
  fromGoal: boolean;
  /** No return was entered: the run uses the scenario's (a site parameter). */
  returnFromParameter: boolean;
  /** The goal as saved, for the comparison (a return it does not hold stays missing, D9). */
  goalG: RunGoal | null;
  values: { amount: SiteValue; monthly: SiteValue; years: SiteValue; inflation: SiteValue; returnV: SiteValue; insurance?: SiteValue; available?: SiteValue; income?: { name: string; value: SiteValue } };
  /** The values the plan's fields start at (P-05's scenario): what each field's reset goes back to, "חזרה ל־10". */
  starts?: { amount: number; monthly: number; years: number; inflation: number; returnV: number };
}

const p05Inputs = (bundle: CompareBundle) => (parameterOf(bundle, "P-05") as unknown as { inputs: Record<string, ValueObject> }).inputs;

/** The numbers the page runs on: the saved goal when it has a horizon and money, else P-05's scenario with whatever the guide pages hold. */
export function feeInputs(bundle: CompareBundle, goalG: RunGoal | null, released: InputsState): FeeInputs {
  const p05 = parameterOf(bundle, "P-05");
  const inp = p05Inputs(bundle);
  const param = (key: string) => asParameter(p05, inp[key]!);
  const num = (key: string) => inp[key]!.value as number;
  const meaningful = goalG !== null && !nothingToCompare(goalG);
  const starts = { amount: num("amount_now"), monthly: num("monthly_deposit"), years: num("horizon_years"), inflation: num("A-02"), returnV: num("A-01") };
  if (meaningful) {
    const gv = goalValueObjects(bundle, goalG);
    const returnFromParameter = goalG.returnPct === null;
    const g: RunGoal = { ...goalG, returnPct: goalG.returnPct ?? num("A-01") };
    return { g, fromGoal: true, returnFromParameter, goalG, starts, values: { amount: gv.amountNow, monthly: gv.monthly, years: gv.horizon, inflation: gv.inflation, returnV: gv.returnV ?? param("A-01"), available: gv.available } };
  }
  const e = released.entered;
  // each is a field's value on the page, its default or what the reader typed: a plain number wherever it shows
  const val = (key: "amount_now" | "monthly_deposit" | "horizon_years" | "A-01" | "A-02", unit: ValueObject["unit"], about: string) => asField(e[key] !== undefined ? enteredValue(e[key]!, unit, bundle.runDate, about) : param(key));
  const amount = val("amount_now", "nis", ci.amountNow);
  const monthly = val("monthly_deposit", "nis_per_month", ci.monthly);
  const years = val("horizon_years", "years", ci.years);
  const returnV = val("A-01", "pct_per_year", ci.grossReturn);
  const inflation = val("A-02", "pct_per_year", ci.inflation);
  const income = e.annual_income !== undefined ? e.annual_income : num("annual_income");
  // the yearly income the runs take (their g.salary is it over 12): what the reader entered, else P-05's, as the value its sheet opens
  const incomeV = asField(e.annual_income !== undefined ? enteredValue(e.annual_income, "nis", bundle.runDate, ci.annualIncome) : param("annual_income"));
  // A-17 has no default (G-12): only what the person entered on a pension fund's fee page
  const insurancePct = typeof released.insurance === "number" ? released.insurance : null;
  const g: RunGoal = {
    horizonYears: years.value as number,
    amountNow: amount.value as number,
    monthly: monthly.value as number,
    available: 0,
    anytime: false,
    returnPct: returnV.value as number,
    inflationPct: e["A-02"] ?? null,
    age: released.age,
    employment: released.employment,
    salary: income / 12,
    pensionEmployee: null,
    pensionEmployer: null,
    insurancePct,
    preset: "none",
    fromPreset: { horizon: false, monthly: false, available: false },
  };
  const insurance = insurancePct !== null ? asField(enteredValue(insurancePct, "pct", bundle.runDate, ci.insurance)) : undefined;
  return { g, fromGoal: false, returnFromParameter: e["A-01"] === undefined, goalG, starts, values: { amount, monthly, years, inflation, returnV, ...(insurance ? { insurance } : {}), income: { name: ci.annualIncome, value: incomeV } } };
}

// ---------------------------------------------------------------- value factory

const rulesOf = (used: readonly UsedRule[]) => used.map((u) => ({ id: u.id, strength: u.figures.reduce<Strength>((w, f) => weaker(w, f.strength as Strength) ?? w, u.strength) }));

export type Factory = ReturnType<typeof factory>;

/**
 * The fee page's figures, each listing what the run of the subject reads (`runInputs`, the comparison's one helper): the plan's money,
 * the return or, for a cash-like product, its own rate, and the profile only where the run reads it. `goal` is the
 * page's fields as values: an assumption's value now is the field itself (F-81 moves from it).
 */
export function factory(bundle: CompareBundle, inputs: FeeInputs, wrapper?: WrapperEntry) {
  const today = bundle.runDate;
  const v = inputs.values;
  const plan: PlanValues = { amount: v.amount, monthly: v.monthly, years: v.years, inflation: v.inflation, returnV: v.returnV, ...(v.available ? { available: v.available } : {}), ...(v.insurance ? { insurance: v.insurance } : {}), ...(v.income ? { income: v.income } : {}) };
  const w = wrapper ? (bundle.wrappers.find((x) => x.id === wrapper.id) ?? wrapper) : undefined;
  const inputsOf = (used: readonly UsedRule[] = []) => runInputs(bundle, inputs.g, plan, w, used);
  return {
    nis(value: number, formula: string, about: string, run?: { rules: readonly UsedRule[]; flags?: { code: string }[]; labels?: { code: string; ruleId: string }[] }, extra?: Record<string, SiteValue>): SiteValue {
      return computed(value, "nis", formula, { ...inputsOf(run?.rules), ...(extra ?? {}) }, { today, about, rules: run ? rulesOf(run.rules) : [], flags: run?.flags?.map((f) => f.code), labels: run?.labels?.map((l) => ({ code: l.code, ruleId: l.ruleId })) });
    },
    plain(value: number, unit: ValueObject["unit"], formula: string, about: string, extra?: Record<string, SiteValue>): SiteValue {
      return computed(value, unit, formula, { ...inputsOf(), ...(extra ?? {}) }, { today, about });
    },
    goal: v,
  };
}

/** The class and the period of the regulator's file (F-68's class key): texts of that file, sourced as its values are (`src`, a value of the same file). */
const classTextKeys = ["fund_classification", "specialization", "period"] as const;
function classTexts(raw: Record<string, unknown>, src: ValueObject): Record<string, SiteValue> {
  const out: Record<string, SiteValue> = {};
  for (const k of classTextKeys) if (typeof raw[k] === "string") out[k] = { ...src, value: raw[k] as string, unit: "text", computed_from: undefined, about: k } as SiteValue;
  return out;
}

/**
 * The engine's computed value, its raw inputs turned into values the provenance sheet can open, and the clock of the fee year. The class
 * and the period are the regulator's file's own texts (`classTexts`, sourced from `src`); the count and the words of the formula stay its own.
 */
function lift(v: ValueObject, stale: SiteValue["stale"], today: string, src?: ValueObject): SiteValue {
  const inputs: Record<string, SiteValue> = {};
  if (v.computed_from) {
    const texts = src ? classTexts(v.computed_from.inputs as Record<string, unknown>, src) : {};
    for (const [label, raw] of Object.entries(v.computed_from.inputs)) {
      const isNum = typeof raw === "number";
      // a count over the file (F-68's tracks of one class in one period) lists that class and period, as the count beside the average does
      inputs[label] = texts[label] ?? { ...computed(isNum ? raw : null, isNum ? "count" : "text", v.computed_from.formula, isNum ? texts : {}, { today, about: label }), ...(isNum ? {} : { value: String(raw) }) };
    }
  }
  return { ...v, computed_from: v.computed_from ? { formula: v.computed_from.formula, inputs } : undefined, weakest: v.source.strength, stale: stale ?? null, rulesUsed: (v.rule_ids ?? []).map((id) => ({ id, strength: v.source.strength })) } as SiteValue;
}

// ---------------------------------------------------------------- plans

export type PlanError =
  | { kind: "no-wrapper" }
  | { kind: "no-terms" }
  | { kind: "need-input"; detail: string; field: NeedField | null }
  /** G-30: monthly deposits into a renewable money-market fund have no run yet; with no monthly deposit the page has a result. */
  | { kind: "monthly-not-run"; code: string }
  | { kind: "no-run"; code: string; messageHe?: string }
  | { kind: "no-fee"; detail: string };

export interface SubjectRun {
  plan: RunPlan;
  wrapper: WrapperEntry;
  candidate: Candidate;
  /** The bundle the plan was built on (the track's fees replace the wrapper's for a track). */
  runBundle: CompareBundle;
  preTax: string[];
}

function candidateOf(bundle: CompareBundle, wrapperId: string, g: RunGoal, scale?: Record<string, number>): { candidate: Candidate | null; field?: FieldKey } {
  const ev = evaluate(bundle, g, { only: new Set([wrapperId]), ...(scale ? { scale } : {}) });
  return { candidate: ev.candidates.find((c) => c.id === wrapperId) ?? null, field: ev.fields[wrapperId] };
}

// ---------------------------------------------------------------- the fields a run needs

/** A number the page names when a run cannot go without it. */
export type NeedField = "age" | "employment" | "insurance" | "salary" | "return";

/**
 * The field a missing input is, from the comparison's own reading (`evaluate`'s fields, which knows which pension or study-fund term
 * was not built) and else from the engine's detail, so the page always names the field and never "one of the values" ("instrument.pension is missing" matched none of the names).
 */
export function needFieldOf(detail: string, inferred?: FieldKey): NeedField | null {
  if (inferred === "age" || inferred === "employment" || inferred === "insurance" || inferred === "salary" || inferred === "return") return inferred;
  if (/\binsurance\b/.test(detail)) return "insurance";
  if (/ageAtStart/.test(detail)) return "age";
  if (/annualIncome|salary/i.test(detail)) return "salary";
  if (/instrument\.(pension|hishtalmut)\b/.test(detail)) return "employment";
  if (detail === "A-01") return "return";
  return null;
}

export type FieldNeed = "required" | "optional" | null;

/** The fields of the page's "more assumptions" for a wrapper, and which of them its run cannot go without. */
export interface PageFields {
  /** Required where the lawful exit is an age (the run must know whether it falls inside the years, B3); optional where an exit rule reads it. */
  age: FieldNeed;
  /** Required for the pension family (A-12: what is deposited and how it is relieved follow it); optional for a study fund, whose P-05 entry names one. */
  employment: FieldNeed;
  /** A-17, entered: the two pension funds; a provident fund for annuity has no pooled insurance (PEN-35). */
  insurance: FieldNeed;
}

/** Wrappers where an exit or annuity rule reads the age, as the guide page asks it. */
const AGE_WRAPPERS = new Set(["kupat-gemel-lehashkaa", "ira-provident"]);
const STUDY_WRAPPERS = new Set(["keren-hishtalmut", "ira-hishtalmut"]);

export function pageFields(bundle: CompareBundle, wrapperId: string | null): PageFields {
  const w = wrapperId ? bundle.wrappers.find((x) => x.id === wrapperId) : undefined;
  if (!w) return { age: null, employment: null, insurance: null };
  const exitAge = w.record.lawful_exit?.kind === "at_age" && typeof w.record.lawful_exit.age?.value === "number";
  const pension = w.family === "pension";
  const need = (required: boolean, optional: boolean): FieldNeed => (required ? "required" : optional ? "optional" : null);
  return {
    age: need(exitAge, AGE_WRAPPERS.has(w.id)),
    employment: need(pension, STUDY_WRAPPERS.has(w.id)),
    insurance: need(pension && w.id !== "provident-for-annuity", false),
  };
}

/** The wrapper whose fields the page offers: the subject's own, a track's from its record even when its run stops (a pension track asked for fields its sheet did not have). */
export function subjectWrapperId(subject: SubjectSpec, data: FeesData): string | null {
  if (subject.kind === "wrapper") return subject.wrapperId;
  return data.tracks.find((t) => t.id === subject.trackId)?.wrapperId ?? null;
}

/** Whether the fee page can answer for a wrapper at all: it has fee terms to run on. A guide links to it only then. */
export const feePageAnswers = (bundle: CompareBundle, wrapperId: string): boolean => !!bundle.wrappers.find((w) => w.id === wrapperId)?.terms;

/** The bundle with a track's two averages as the wrapper's fees. */
export function withTrackFees(bundle: CompareBundle, wrapperId: string, track: TrackLite, data: FeesData): { bundle: CompareBundle; missing: string[] } | PlanError {
  const w = bundle.wrappers.find((x) => x.id === wrapperId);
  if (!w || !w.terms) return { kind: "no-terms" };
  const fees = trackFees(track, data, bundle.runDate);
  if (!fees) return { kind: "no-fee", detail: "template" };
  if (track.b.value === null || track.b.value < 0) return { kind: "no-fee", detail: "balance" };
  const num = (v: SiteValue) => (typeof v.value === "number" ? v.value : null);
  const { balance: bal, deposit: dep } = fees;
  const missing: string[] = [];
  let depositFraction = 0;
  const depV = num(dep);
  if (depV !== null && depV >= 0) depositFraction = depV / 100;
  else if (!depositFeeNoneByRule(dep)) missing.push("deposit"); // a product with no deposit-fee item (PF-06) takes 0
  const terms = { ...w.terms, fees: { balance: num(bal)! / 100, deposit: depositFraction, direct: 0 } };
  const feeValues: Record<string, SiteValue> = { balance: bal };
  if (depV !== null && depV >= 0) feeValues.deposit = dep;
  const wrappers = bundle.wrappers.map((x) => (x.id === wrapperId ? { ...x, terms, feeValues } : x));
  return { bundle: { ...bundle, wrappers }, missing };
}

export function subjectRun(bundle: CompareBundle, wrapperId: string, g: RunGoal, scale?: Record<string, number>): SubjectRun | PlanError {
  const wrapper = bundle.wrappers.find((w) => w.id === wrapperId);
  if (!wrapper) return { kind: "no-wrapper" };
  if (!wrapper.terms) return { kind: "no-terms" };
  const { candidate, field } = candidateOf(bundle, wrapperId, g, scale);
  if (!candidate) return { kind: "no-wrapper" };
  if (!candidate.plan) {
    const r = candidate.reasons[0];
    if (candidate.kind === "not-evaluated" && r?.code === "missing-input") return { kind: "need-input", detail: r.detail ?? "", field: needFieldOf(r.detail ?? "", field) };
    if (r?.code === "gap" && r.gapIds.includes("G-30") && g.monthly > 0) return { kind: "monthly-not-run", code: "G-30" };
    // a gap is the method's, not the person's: its id, and a reason that does not send them to check what they entered
    if (r?.code === "gap") return { kind: "no-run", code: r.gapIds[0] ?? "gap", messageHe: r3fees.review.gapFail };
    return { kind: "no-run", code: r?.code ?? candidate.kind };
  }
  const preTax = candidate.reasons.filter((r) => r.code === "exit-blocked").flatMap((r) => [...r.ruleIds, ...r.gapIds]);
  return { plan: candidate.plan, wrapper, candidate, runBundle: bundle, preTax };
}

// ---------------------------------------------------------------- lines

const rateOf: Record<FeeLine, (p: RunPlan) => number | undefined> = {
  balance: (p) => (p.run === "runProvident" || p.run === "runPension" ? p.input.fees.balance : undefined),
  deposit: (p) => (p.run === "runProvident" || p.run === "runPension" ? p.input.fees.deposit : undefined),
  direct: (p) => (p.run === "runProvident" || p.run === "runPension" ? p.input.fees.direct : undefined),
  trade: (p) => {
    const t = (p.run === "runSecurities" ? p.input.tariff : p.run === "runMakam" || p.run === "runBond" ? (p.input.tariff as { buy?: { rate: number }; sell?: { rate: number } }) : undefined) as { buy?: { rate: number }; sell?: { rate: number } } | undefined;
    return t?.buy?.rate ?? t?.sell?.rate;
  },
  custody: (p) => (p.run === "runSecurities" ? p.input.tariff.custody?.rate : p.run === "runMakam" || p.run === "runBond" ? (p.input.tariff as { custody?: { rate: number } }).custody?.rate : undefined),
  fx: (p) => {
    if (p.run !== "runSecurities") return undefined;
    const fx = p.input.tariff.fx as number | { rate: number } | undefined;
    const rate = typeof fx === "object" ? fx.rate : fx;
    // F-13 (D65): the spread is part of the conversion's price, and a rate set for the line replaces both (F-61)
    return rate === undefined ? undefined : rate + (p.input.tariff.fxSpread ?? 0);
  },
  fixed: (p) => (p.run === "runSecurities" ? p.input.tariff.monthlyFee : undefined),
  // F-102: the indices page alone counts a bank's current account; this page never runs it
  account: (p) => (p.run === "runSecurities" ? p.input.tariff.currentAccount : undefined),
  spread: (p) => (p.run === "runSecurities" ? p.input.fund.halfSpread : undefined),
  fund: (p) => {
    if (p.run !== "runSecurities") return undefined;
    const d = p.input.fund.drag;
    return (d?.management ?? 0) + (d?.variable ?? 0) + (d?.trustee ?? 0);
  },
  manager: (p) => (p.run === "runSecurities" ? p.input.wrapper?.managerFee : undefined),
};

/** A fee's current rate as a fraction (for the lines a percentage describes); fixed NIS a month and the spread's share are not offered a reduction. */
export function lineRate(plan: RunPlan, line: FeeLine): number | undefined {
  return rateOf[line](plan);
}

/** The lines a typed reduction applies to: a rate of a base, not a monthly sum. */
export const reducible = (line: FeeLine) => line !== "fixed" && line !== "account" && line !== "spread";

const feeKindOf: Partial<Record<FeeLine, FeeKind>> = { balance: "balance", deposit: "deposit", direct: "direct", fund: "fund", trade: "trade", custody: "custody" };

const feeValueKey: Record<FeeLine, string | null> = { balance: "balance", deposit: "deposit", direct: "direct", trade: "tradeRate", custody: "custodyRate", fx: "fxRate", fixed: "monthlyFee", account: null, spread: "fundHalfSpread", fund: null, manager: "iraManagerFee" };
const dragKeys = ["fundManagement", "fundVariable", "fundTrustee"] as const;

/** A provident line's discount in the plan (A-19), if it has one. */
function discountOf(plan: RunPlan, line: FeeLine): Discount | undefined {
  if (plan.run !== "runProvident" && plan.run !== "runPension") return undefined;
  const f = plan.input.fees;
  return line === "balance" ? f.discount : line === "deposit" && "depositDiscount" in f ? f.depositDiscount : undefined;
}

/** The second period of a discounted line, from the plan's discount and the record's values behind it (A-19, F-16). One period serves both lines: the data check fails two that differ (`checkDiscountLines`). */
function afterOf(wrapper: WrapperEntry, plan: RunPlan, line: FeeLine): LineView["after"] {
  if (!discountOf(plan, line)) return undefined;
  const rate = wrapper.feeValues[line === "balance" ? "afterBalance" : "afterDeposit"];
  const months = wrapper.feeValues.discountMonths;
  const years = wrapper.feeValues.discountYears;
  if (!rate || (!months && !years)) return undefined;
  return months ? { rate, period: months, unit: "months" } : { rate, period: years!, unit: "years" };
}

/** D86: how long a stated reduction on a provident or pension line holds, and what the line rises to after it (`LineView.held`). */
function heldOf(plan: RunPlan, line: FeeLine, after: LineView["after"], rate: SiteValue | null, rules: Map<string, RuleRecord>, today: string): LineView["held"] {
  if (plan.run !== "runProvident" && plan.run !== "runPension") return undefined;
  if (line !== "balance" && line !== "deposit") return undefined;
  if (after) return after;
  if (!rate) return undefined;
  const pf13 = rules.get("PF-13");
  const years = pf13 ? ruleFigure(pf13, "min_discount_years", today) : null;
  return years ? { rate, period: years, unit: "years" } : undefined;
}

function rateValue(wrapper: WrapperEntry, line: FeeLine, today: string): SiteValue | null {
  // the cost inside the fund is the sum of its lines (F-10), as the comparison's chip says it (`fundCostOf`)
  if (line === "fund") return fundCostOf(wrapper.feeValues, dragKeys, r3fees.names.fund!, today) ?? null;
  const key = feeValueKey[line];
  return key ? wrapper.feeValues[key] ?? null : null;
}

export type CapView = { state: "sourced"; rate: SiteValue; word: "per-year" | "per-deposit"; ruleIds: string[] } | { state: "none" } | { state: "each-manager"; ruleIds: string[] } | { state: "open"; code: string };

const capWrappers = new Set(["kupat-gemel-lehashkaa", "keren-hishtalmut", "pension-comprehensive", "pension-general", "provident-for-annuity"]);

function capOf(plan: RunPlan, line: FeeLine, ctx: RunContext, rules: Map<string, RuleRecord>, today: string): CapView {
  if (plan.run !== "runProvident" && plan.run !== "runPension") return { state: "none" };
  if (line === "direct") return { state: "each-manager", ruleIds: ["PF-11"] };
  if (line !== "balance" && line !== "deposit") return { state: "none" };
  const wrapper = plan.input.wrapper;
  if (!capWrappers.has(wrapper)) return { state: "none" };
  let cap;
  try {
    cap = feeCap(plan, line, ctx);
  } catch {
    cap = undefined;
  }
  if (!cap) {
    const id = ({ "kupat-gemel-lehashkaa": "PF-02", "keren-hishtalmut": "PF-06", "pension-comprehensive": "PF-04", "pension-general": "PF-05", "provident-for-annuity": "PEN-22" } as Record<string, string>)[wrapper] ?? "";
    return { state: "open", code: id };
  }
  const rec = rules.get(cap.ruleId);
  const fig = rec?.figures?.[cap.figure];
  if (!rec || !fig || Array.isArray(fig) || "by_tax_year" in fig) return { state: "open", code: cap.ruleId };
  const stale = rec.recheck_date && rec.recheck_date < today ? { since: rec.checked, cadence: "yearly" as const } : null;
  return { state: "sourced", rate: { ...(fig as ValueObject), stale, rule_ids: (fig as ValueObject).rule_ids ?? [rec.id] }, word: line === "deposit" ? "per-deposit" : "per-year", ruleIds: cap.ruleIds ?? [cap.ruleId] };
}

// ---------------------------------------------------------------- references

export type NoRefReason = "D20" | "isa-unconfirmed" | "tase-uncollected" | "G-14" | "no-cma-track" | "no-class" | "empty-class";

export interface ReferenceView {
  /** The mean, median, count and year, when F-68 gives them for this fee. */
  cma?: { mean: SiteValue; count: SiteValue; year: SiteValue | null; classification: string; specialization: string; dataset: string; period: string };
  /** The track's own average, sourced, when it is not the rate itself. */
  ownAverage?: SiteValue;
  /** The authority's official class average (PF-39), beside the computed one. */
  official?: { value: SiteValue; year: string };
  /**
   * The class comes from a track the site chose (P-05) that is not the record the run prices (a company's list): the page says so plainly,
   * and the track's own average is not "this track's" (the provident fund for investing's track 7978, chosen by Claude).
   */
  bySite?: { trackId: number; companyId: string; name: string; company: string };
  none?: { reason: NoRefReason; linkOut: RefLink | null };
  stale: SiteValue["stale"];
}

interface RefContext {
  data: FeesData;
  wrapperId: string;
  track: TrackLite | null;
  today: string;
  rules: Map<string, RuleRecord>;
  mk: Factory;
  /** The run prices the track P-05 names (its regulator averages), not another record such as a company's list. */
  recordIsTrack: boolean;
}

const officialFigure: Record<string, { balance: string; deposit?: string }> = {
  "kupat-gemel-lehashkaa": { balance: "avg_fee_from_assets_provident", deposit: "avg_fee_from_deposits_provident" },
  "keren-hishtalmut": { balance: "avg_fee_from_assets_provident" },
  "provident-for-annuity": { balance: "avg_fee_from_assets_provident", deposit: "avg_fee_from_deposits_provident" },
  "child-savings-provident": { balance: "avg_fee_from_assets_provident", deposit: "avg_fee_from_deposits_provident" },
  "pension-comprehensive": { balance: "avg_fee_from_assets_pension_comprehensive", deposit: "avg_fee_from_deposits_pension_comprehensive" },
};

/** The class the reference is computed over: the track's own, or that of the track P-05 names for the wrapper (D21). */
function classOf(c: RefContext): TrackLite | null {
  if (c.track) return c.track;
  const id = c.data.wrapperTrack[c.wrapperId];
  return id === undefined ? null : c.data.tracks.find((t) => t.id === id) ?? null;
}

function officialOf(c: RefContext, line: FeeLine): ReferenceView["official"] | undefined {
  if (line !== "balance" && line !== "deposit") return undefined;
  const fig = officialFigure[c.wrapperId];
  const name = fig ? (line === "balance" ? fig.balance : fig.deposit) : undefined;
  const rec = c.rules.get("PF-39");
  const f = name && rec ? rec.figures?.[name] : undefined;
  if (!f || Array.isArray(f) || "by_tax_year" in f) return undefined;
  const v = f as ValueObject;
  const stale = rec!.recheck_date && rec!.recheck_date < c.today ? { since: rec!.checked, cadence: "yearly" as const } : null;
  return { value: { ...v, stale, rule_ids: v.rule_ids ?? ["PF-39"] }, year: (v.effective_from ?? "").slice(0, 4) };
}

function referenceFor(c: RefContext, line: FeeLine, rate: SiteValue | null): ReferenceView {
  const view = referenceBase(c, line, rate);
  const official = officialOf(c, line);
  return official ? { ...view, official } : view;
}

function referenceBase(c: RefContext, line: FeeLine, rate: SiteValue | null): ReferenceView {
  const links = c.data.links;
  const none = (reason: NoRefReason, linkOut: RefLink | null = null): ReferenceView => ({ none: { reason, linkOut }, stale: null });
  if (line === "direct") return none("G-14");
  if (line === "balance" || line === "deposit") {
    if (!capWrappers.has(c.wrapperId) && c.wrapperId !== "child-savings-provident") return none("D20", links.boi);
    const t = classOf(c);
    if (!t) return none("no-class");
    const ref = c.data.references[classKey(t.classification, t.specialization)];
    const tpl = c.data.templates[t.dataset];
    const stale = tpl ? staleCmaFee(tpl.balance.effective_to, c.today) : null;
    const stat = ref ? (line === "balance" ? ref.management : ref.deposit) : null;
    if (!ref || !stat || stat.count === 0 || stat.mean.value === null) return { ...none("empty-class"), stale };
    const src = tpl ? (line === "balance" ? tpl.balance : tpl.deposit) : undefined;
    const year = tpl?.balance.effective_from ? tpl.balance.effective_from.slice(0, 4) : null;
    // the year of the regulator's file is a date of that file, not a figure the site computed: sourced as its values are
    const yearV: SiteValue | null = year && tpl ? ({ ...tpl.balance, value: year, unit: "text", computed_from: undefined, about: r3fees.referenceLine.yearAbout, stale } as SiteValue) : null;
    // F-68's count is of the tracks of one class in one period that report the fee: it lists that class and period (a count over the file)
    const countInputs = src && stat.mean.computed_from ? classTexts(stat.mean.computed_from.inputs as Record<string, unknown>, src) : {};
    const view: ReferenceView = {
      cma: {
        mean: lift(stat.mean, stale, c.today, src),
        count: computed(stat.count, "count", "F-68", countInputs, { today: c.today, about: r3fees.referenceLine.tracksAfter }),
        year: yearV,
        classification: t.classification,
        specialization: t.specialization,
        dataset: t.dataset,
        period: t.period,
      },
      stale,
    };
    // a class from a track the run does not price: the site chose it, and that track's average is not the product's own
    if (!c.track && !c.recordIsTrack) {
      view.bySite = { trackId: t.id, companyId: t.companyId, name: t.name, company: t.company };
      return view;
    }
    const fees = trackFees(t, c.data, c.today);
    const own = fees ? (line === "balance" ? fees.balance : fees.deposit) : null;
    if (own && own.value !== null && (rate === null || rate.value !== own.value)) view.ownAverage = own;
    return view;
  }
  if (line === "fund" || line === "spread") return none("isa-unconfirmed", links.isa);
  return c.data.tariffClass[c.wrapperId] === "bank" ? none("D20", links.boi) : none("tase-uncollected", links.tase);
}

// ---------------------------------------------------------------- the analysis

/**
 * Why a line has its verdict (D90 revised, the negotiate half judges what the cut to the average is worth). `negotiate-ends`: worth
 * negotiating now, and the discount ends within the horizon; `check-after`: not worth it now, but the discount ends within the horizon and
 * the fee can rise above the average then, so that is when to check again; `below`: the cut to the average is worth less than the threshold.
 */
export type ReasonKind = "negotiate" | "negotiate-ends" | "check-after" | "avoid" | "below" | "no-reference" | "not-below" | "nothing-removes";

/** An option in the comparison that charges no fee of this type, or (`lower`) a lower rate of it. */
export interface Alternative {
  id: string;
  name: string;
  lower: boolean;
}

export interface LineView {
  line: FeeLine;
  rate: SiteValue | null;
  /** The rate as a fraction, for the lines a percentage describes. */
  rateFraction: number | undefined;
  cost: SiteValue;
  costNis: number;
  share: number | null;
  verdict: "negotiate" | "avoid" | "not-worth";
  reason: ReasonKind;
  avoidEvaluated: boolean;
  /** The alternatives that rank above the subject (`outrankingOf`): the options the avoid test reads and the card names under "avoid". */
  removedBy: Alternative[];
  /** Every alternative, ranked above or not (`alternativesOf`): the card keeps the room of their line whatever the ranking (D63). */
  alternatives: Alternative[];
  /**
   * The room of the line that names them: every option of the comparison that could be one, whatever the plan, those without the fee and
   * the rest as if lower. The alternatives change with the sliders (a renewing money-market fund runs only with no monthly deposit), and
   * at 390 px one more name moved the card by a line.
   */
  alternativesRoom: Alternative[];
  reference: ReferenceView;
  cap: CapView;
  /** The suggestion for the reduction field, in percent: the class mean as shown, offered only where it is below the rate charged now. */
  suggestion: number | null;
  /** F-61's value of bringing the fee to `suggestion`, real NIS: the figure the negotiate test reads (D90 revised); 0 with no suggestion. */
  worthNis: number;
  /** The discount ends within the horizon and the rate after it is above the average: the fee can rise above it then (D88, D90), whatever the verdict. */
  risesAbove: boolean;
  detail: FeeVerdict;
  /**
   * A discounted line's second period (A-19, F-16): the rate it may rise to and how long the discount lasts, the printed months when the
   * company gives longer than PF-13's minimum, else PF-13's years. Absent for a line that is one rate the whole run.
   */
  after?: { rate: SiteValue; period: SiteValue; unit: "years" | "months" };
  /**
   * D86: how long a stated reduction holds and the rate the line returns to after it: a discounted line's own period and rate after it, or on
   * a provident or pension line with no discount PF-13's years and the line's own rate. Absent where a reduction is one rate for the whole run.
   */
  held?: { rate: SiteValue; period: SiteValue; unit: "years" | "months" };
  /** The rate the verdict judges, as a fraction, when it is not `rateFraction`: the rate after a discount that ends within the horizon (D88). */
  judgedFraction?: number;
}

export interface Analysis {
  fm: FeeMateriality;
  series: FeeMaterialitySeries | null;
  /** What the exit takes off the chart's last point to give the headline (B6); null without a chart. */
  exitGap: SiteValue | null;
  lines: LineView[];
  total: SiteValue;
  withFees: SiteValue;
  withoutFees: SiteValue;
  remainder: SiteValue;
  thresholds: { negotiate: SiteValue; avoid: SiteValue; values: FeeThresholds };
  ctx: RunContext;
  plan: RunPlan;
  mk: Factory;
  omitted: FeeLine[] | string[];
  rulesUsed: string[];
}

export interface ComparisonSet {
  goalName: string;
  candidates: Candidate[];
  /** The place of each ranked option in the saved goal's comparison, ties sharing the place (as the result page numbers them). */
  ranks: Record<string, { rank: number; tied: boolean }>;
}

/** Places for ranked entries in order: the engine's tie set shares first place (F-80, pairwise with the top, not a chain); the rest follow the engine's order (lib/compare.ts `placeGroups`). */
export function ranksOf(entries: { id: string }[], tieSet: readonly string[]): ComparisonSet["ranks"] {
  const group = placeGroups(entries, tieSet);
  return Object.fromEntries(entries.map((e, i) => [e.id, { rank: group[i]! + 1, tied: group.filter((g) => g === group[i]).length > 1 }]));
}

/** What the fee page says about the subject's place in the saved goal's comparison (A9): null when it is not ranked there. */
export function rankedFor(set: ComparisonSet | null, wrapperId: string): { rank: number; tied: boolean } | null {
  return set?.ranks[wrapperId] ?? null;
}

export function comparisonFor(bundle: CompareBundle, goalG: RunGoal | null, goalName: string): ComparisonSet | null {
  if (!goalG || nothingToCompare(goalG)) return null;
  try {
    const ev = evaluate(bundle, goalG);
    return { goalName, candidates: ev.candidates, ranks: ranksOf(ev.ranking.entries, ev.ranking.tieSet) };
  } catch {
    return null;
  }
}

/**
 * The sentence above the chart (A18): the fee that is worth the most to bring down to the authority's average, and what
 * that is worth over the horizon (F-61's valueOfReduction, the same figure as the "אם יורידו ל־" field); or, when no fee is
 * above its average, the plain statement that none is, or that none is now but one is worth negotiating once its discount ends
 * (`after`). null when no fee has an average to compare with.
 */
export function headlineGap(an: Analysis): { kind: "more"; line: FeeLine; worth: SiteValue; held?: LineView["held"] } | { kind: "less" } | { kind: "after" } | null {
  let best: { line: FeeLine; worth: SiteValue; nis: number; held?: LineView["held"] } | null = null;
  let anyReference = false;
  let after = false;
  for (const l of an.lines) {
    if (!l.reference.cma || l.rateFraction === undefined || !reducible(l.line)) continue;
    anyReference = true;
    // a fee whose discount ends within the period and can rise above the average then (D88, D90): "not above average" alone would contradict its card
    // keyed on the line, not its reason: a line "worth avoiding" can rise above the average too
    if (l.risesAbove) after = true;
    // the average is not below the rate charged now: nothing to bring down (D90)
    if (l.suggestion === null) continue;
    const worth = reductionWorth(an, l.line, l.suggestion);
    if (worth && typeof worth.value === "number" && (!best || worth.value > best.nis)) best = { line: l.line, worth, nis: worth.value, ...(l.held ? { held: l.held } : {}) };
  }
  // a reduction holds only through the discount period (D86): the sentence says so, as the field does, so its figure never reads as every year's (D90)
  if (best) return { kind: "more", line: best.line, worth: best.worth, ...(best.held ? { held: best.held } : {}) };
  return after ? { kind: "after" } : anyReference ? { kind: "less" } : null;
}

/**
 * The options in the comparison that charge no fee of this type, or a lower rate of it (F-62's alternatives): ranked or listed with a run,
 * not the subject itself. Every one of them, so the card can hold the room of the longest list whatever the ranking (D63).
 */
export function alternativesOf(set: ComparisonSet | null, subjectId: string, line: FeeLine, names: Record<string, string>, subjectRate: number | undefined, rateOf: (plan: RunPlan) => number | undefined = (p) => lineRate(p, line)): Alternative[] {
  if (!set) return [];
  const out: Alternative[] = [];
  for (const c of set.candidates) {
    if (c.tier !== 1 || c.id === subjectId || !c.plan || !c.run || (c.kind !== "ranked" && c.kind !== "listed-not-ranked")) continue;
    const without = !feeLines(c.plan).includes(line);
    // on the same footing as the subject's: the rate after a discount that ends within the horizon, not the 0% during it
    const theirs = without ? undefined : rateOf(c.plan);
    const lower = !without && subjectRate !== undefined && theirs !== undefined && theirs < subjectRate - 1e-12;
    if (without || lower) out.push({ id: c.id, name: names[c.id] ?? c.id, lower });
  }
  return out;
}

/**
 * `LineView.alternativesRoom`: the candidates `alternativesOf` could name as the sliders move, for the room of their line: those with a
 * plan, and those the method cannot run only for this plan (a gap: a renewing money-market fund with a monthly deposit, G-30). Not the
 * ones closed to the person whatever the plan (another's money, held inside an IRA) or waiting for a field of the assumptions sheet.
 */
export function alternativesRoomOf(set: ComparisonSet | null, subjectId: string, line: FeeLine, names: Record<string, string>): Alternative[] {
  if (!set) return [];
  const forThisPlan = (c: ComparisonSet["candidates"][number]) => c.kind === "not-evaluated" && c.reasons.length > 0 && c.reasons.every((r) => r.code === "gap");
  return set.candidates
    .filter((c) => c.tier === 1 && c.id !== subjectId && (c.plan || forThisPlan(c)))
    .map((c) => ({ id: c.id, name: names[c.id] ?? c.id, lower: c.plan ? feeLines(c.plan).includes(line) : false }));
}

/**
 * D90 revised the same day: "worth avoiding" only when there is something better to pick. Of the alternatives, those
 * that rank above the subject on the page's own comparison for the same plan: a better place, never a shared one. A subject the comparison
 * lists without a place is below every ranked option. Readers saw "avoid" on the option ranked first and asked what to pick instead.
 */
export function outrankingOf(set: ComparisonSet | null, subjectId: string, alternatives: Alternative[]): Alternative[] {
  if (!set) return [];
  const own = set.ranks[subjectId];
  return alternatives.filter((o) => {
    const theirs = set.ranks[o.id];
    return theirs !== undefined && (own === undefined || theirs.rank < own.rank);
  });
}

export function ruleMap(bundle: CompareBundle, data: FeesData): Map<string, RuleRecord> {
  const m = new Map<string, RuleRecord>();
  for (const r of bundle.rules) m.set(r.id, r);
  for (const r of data.rules) m.set(r.id, r);
  return m;
}

export function contextFor(bundle: CompareBundle, rules: Map<string, RuleRecord>): RunContext {
  return { rules: [...rules.values()], runDate: bundle.runDate };
}

function verdictOf(args: { costNis: number; worthNis: number; rate: number | undefined; ref: number | null; total: number; removed: boolean; thresholds: FeeThresholds }) {
  return feeVerdict({ nis: args.costNis, worthNis: args.worthNis, ...(args.rate !== undefined ? { currentRate: args.rate } : {}), totalDrag: args.total, removedByAlternative: args.removed }, args.ref === null ? null : { rate: args.ref }, args.thresholds);
}

/**
 * The reference the verdict, the reduction field and the words all use (one measure): the F-68 class mean as the page shows
 * it, in percent. The card showed a median beside the mean, and a study fund's median equal to its fee read as "the fee is normal" while
 * the verdict compared with the mean.
 */
const meanShown = (reference: ReferenceView): number | null => (reference.cma && typeof reference.cma.mean.value === "number" ? fmt.pctShown(reference.cma.mean.value) : null);

/** The reduction field's suggestion: the mean as shown, only where it is below the rate charged now (D90). */
const suggestionOf = (line: FeeLine, ref: number | null, frac: number | undefined): number | null => (ref !== null && frac !== undefined && reducible(line) && ref < frac * 100 - 1e-9 ? ref : null);

/** What bringing the line to the suggestion is worth (F-61's value of a stated reduction), real NIS; 0 with nothing to bring down. */
const worthOf = (plan: RunPlan, line: FeeLine, suggestion: number | null, ctx: RunContext): number => (suggestion === null ? 0 : (valueOfReduction(plan, line, suggestion / 100, ctx).value.value as number));

/** A line that is not worth negotiating or avoiding: the negotiate half's reason first, since that is what the card's reader decides. */
function reasonOf(v: FeeVerdict, hasComparison: boolean, removedAny: boolean, refExists: boolean): ReasonKind {
  if (!refExists) return !v.reasons.includes("cost-below-avoid-threshold") && hasComparison && !removedAny ? "nothing-removes" : "no-reference";
  if (v.reasons.includes("reference-not-below-current")) return "not-below";
  return "below";
}

export interface AnalyseArgs {
  plan: RunPlan;
  runBundle: CompareBundle;
  wrapper: WrapperEntry;
  inputs: FeeInputs;
  data: FeesData;
  track: TrackLite | null;
  comparison: ComparisonSet | null;
  names: Record<string, string>;
  withSeries: boolean;
}

export function analyse(a: AnalyseArgs): Analysis {
  const rules = ruleMap(a.runBundle, a.data);
  const ctx = contextFor(a.runBundle, rules);
  const mk = factory(a.runBundle, a.inputs, a.wrapper);
  const fm = feeMateriality(a.plan, ctx);
  const thresholds = feeThresholds(a.data.p03);
  const total = fm.total.value as number;
  const today = a.runBundle.runDate;
  const run = { rules: fm.run.rules, flags: fm.run.flags, labels: fm.run.labels };
  const refW = a.runBundle.wrappers.find((x) => x.id === a.wrapper.id) ?? a.wrapper;
  const refCtx: RefContext = { data: a.data, wrapperId: a.wrapper.id, track: a.track, today, rules, mk, recordIsTrack: refW.feeValues.regBalance !== undefined };
  const lines: LineView[] = fm.lines.map((l): LineView => {
    const w = a.runBundle.wrappers.find((x) => x.id === a.wrapper.id) ?? a.wrapper;
    const rate = rateValue(w, l.line, today);
    const afterW = afterOf(w, a.plan, l.line);
    const frac = lineRate(a.plan, l.line);
    const reference = referenceFor(refCtx, l.line, rate);
    const refShown = meanShown(reference);
    const refFraction = refShown !== null ? refShown / 100 : null;
    // the field's figure: the verdict judges what bringing the fee to the average is worth, not what the fee costs (D90 revised)
    const suggestion = suggestionOf(l.line, refShown, frac);
    const worthNis = worthOf(a.plan, l.line, suggestion, ctx);
    const costNis = l.cost.value as number;
    // F-62 (D88): a discount that ends within the horizon is judged by the rate after it, not the 0% charged during it; the card then says
    // when it ends and the fee can rise, since a reduction agreed now holds only through the discount (D86) and is worth only that (D90)
    const judged = rateAfterDiscount(a.plan, l.line, fm.run.exitMonth, ctx);
    const alternatives = alternativesOf(a.comparison, a.wrapper.id, l.line, a.names, judged ?? frac, (p) => rateAfterDiscount(p, l.line, fm.run.exitMonth, ctx) ?? lineRate(p, l.line));
    const removedBy = outrankingOf(a.comparison, a.wrapper.id, alternatives);
    const detail = verdictOf({ costNis, worthNis, rate: judged ?? frac, ref: refFraction, total, removed: removedBy.length > 0, thresholds });
    // the fee can rise above the average when the discount ends: that is when to check again (D90 revised)
    const risesAbove = judged !== null && afterW !== undefined && refFraction !== null && refFraction < judged;
    const cap = capOf(a.plan, l.line, ctx, rules, today);
    const held = heldOf(a.plan, l.line, afterW, rate, rules, today);
    const without = l.cost.computed_from?.inputs.real_value_without_fee as number;
    const cost = mk.nis(costNis, "F-61", `${r3fees.names[l.line]}: ${r3fees.costIn.trim()}`, run, {
      "השווי בלי העמלה הזו": mk.nis(without, "F-06", "השווי בכסף של היום, בלי העמלה הזו", run),
      "השווי עם כל העמלות": mk.nis(fm.realWithFees, "F-06", "השווי בכסף של היום, עם כל העמלות", run),
      ...(rate ? { [r3fees.names[l.line]!]: rate } : {}),
    });
    const hasComparison = a.comparison !== null;
    const verdict = detail.verdict === "worth-negotiating" ? "negotiate" : detail.verdict === "worth-avoiding" ? "avoid" : "not-worth";
    return {
      line: l.line,
      rate,
      rateFraction: frac,
      cost,
      costNis,
      share: total > 0 ? costNis / total : null,
      verdict,
      reason:
        detail.verdict === "worth-negotiating"
          ? risesAbove
            ? "negotiate-ends"
            : "negotiate"
          : detail.verdict === "worth-avoiding"
            ? "avoid"
            : risesAbove
              ? "check-after"
              : reasonOf(detail, hasComparison, alternatives.some((o) => !o.lower), refFraction !== null),
      avoidEvaluated: hasComparison || costNis < thresholds.avoidNis,
      removedBy,
      alternatives,
      alternativesRoom: alternatives.length > 0 ? alternativesRoomOf(a.comparison, a.wrapper.id, l.line, a.names) : [],
      reference,
      cap,
      // the average is offered only where it is a reduction of the rate charged now: a field filled with "זו לא הורדה" contradicts the verdict (D90)
      suggestion,
      worthNis,
      risesAbove,
      detail,
      ...(afterW ? { after: afterW } : {}),
      ...(held ? { held } : {}),
      ...(judged !== null ? { judgedFraction: judged } : {}),
    };
  });
  const th = (name: "negotiate_nis" | "avoid_nis") => asParameter(a.data.p03, thresholds.values[name]);
  let series: FeeMaterialitySeries | null = null;
  if (a.withSeries && lines.length > 0) {
    try {
      series = feeMaterialitySeries(a.plan, ctx);
    } catch {
      series = null;
    }
  }
  return {
    fm,
    series,
    exitGap: series ? mk.nis(series.exitEffect.total, "F-61", r3fees.review.chartGross.label, run) : null,
    lines,
    total: mk.nis(total, "F-61", r3fees.chart.total, run),
    withFees: mk.nis(fm.realWithFees, "F-06", "השווי בכסף של היום, עם כל העמלות", run),
    withoutFees: mk.nis(fm.realWithoutFees, "F-06", "השווי בכסף של היום, בלי עמלות", run),
    remainder: mk.nis(fm.interaction.value as number, "F-61", r3fees.remainder.about, run),
    thresholds: { negotiate: th("negotiate_nis"), avoid: th("avoid_nis"), values: thresholds },
    ctx,
    plan: a.plan,
    mk,
    omitted: [],
    rulesUsed: fm.run.rules.map((r) => r.id),
  };
}

/** The value of a stated reduction (F-61), as a value the number sheet can open. */
export function reductionWorth(an: Analysis, line: FeeLine, toPct: number): SiteValue | null {
  const l = an.lines.find((x) => x.line === line);
  if (!l || l.rateFraction === undefined || !(toPct >= 0) || toPct / 100 >= l.rateFraction) return null;
  const r = valueOfReduction(an.plan, line, toPct / 100, an.ctx);
  const to = enteredValue(toPct, "pct", an.ctx.runDate, "העמלה שביקשתם");
  // the changed run's flags too: a held rate can give a plan a discount, and with it PF OQ18's open reading (D87)
  const flags = [...an.fm.run.flags, ...r.flags.filter((f) => !an.fm.run.flags.some((g) => g.code === f.code))];
  const labels = [...an.fm.run.labels, ...r.labels.filter((x) => !an.fm.run.labels.some((y) => y.code === x.code && y.ruleId === x.ruleId))];
  return an.mk.nis(r.value.value as number, "F-61", `${r3fees.names[line]}: ${r3fees.reduction.label}`, { rules: an.fm.run.rules, flags, labels }, { [r3fees.reduction.label.trim()]: to, ...(l.rate ? { [r3fees.names[line]!]: l.rate } : {}) });
}

// ---------------------------------------------------------------- sensitivity (F-81 on the fee page)

export interface FeeSensRow {
  key: string;
  label: string;
  unit: "fraction" | "multiplier" | "years";
  current: number;
  lo: number;
  hi: number;
  /** For a fee axis: the current rate in percent, to show the multiplier as a rate. */
  ratePct?: number;
  /** For a discounted fee axis: the rate it may rise to after the discount, in percent; the multiplier moves both (F-81, A-19). */
  afterPct?: number;
  /** For a fee axis with a legal cap (PF-02): the cap in percent; the run never charges above it, so the page never shows above it. */
  capPct?: number;
  field: "return" | "inflation" | "horizonYears" | null;
  flip?: { from: number; to: number; side: "lo" | "hi"; kind: "verdict" | "largest"; line?: FeeLine; newVerdict?: LineView["verdict"]; newLargest?: FeeLine };
}

export interface FeeSensitivity {
  rows: FeeSensRow[];
  noFlip: boolean;
  /** Per line not worth negotiating now: the amount today or the horizon at which the cut to the average reaches the threshold (`reachOf`). */
  reach: Partial<Record<FeeLine, FeeReach>>;
}

/**
 * What would make a cut worth negotiating: the
 * smallest amount today, in a round sum, and the fewest whole years, each with every other number as it is, at which F-61's value of
 * bringing the fee to the average reaches the negotiate threshold. Absent where none is found within the bounds searched.
 */
export interface FeeReach {
  amountNow?: number;
  horizonYears?: number;
}

/** A round sum a reader means, up from `x`: to 500 ₪ under 10,000, 1,000 under 100,000, 10,000 under a million, then 100,000. */
export const roundSumUp = (x: number) => {
  const step = x < 10_000 ? 500 : x < 100_000 ? 1_000 : x < 1_000_000 ? 10_000 : 100_000;
  return Math.ceil(x / step - 1e-9) * step;
};

/** The longest horizon and the largest amount the reach search tries: past them the line says nothing. */
export const REACH_LIMITS = { years: 40, amountNow: 10_000_000 };

function signature(lines: { line: FeeLine; costNis: number; verdict: string }[]): string {
  const largest = [...lines].sort((a, b) => b.costNis - a.costNis)[0]?.line ?? "";
  return [`largest=${largest}`, ...[...lines].sort((a, b) => (a.line < b.line ? -1 : 1)).map((l) => `${l.line}=${l.verdict}`)].join(";");
}

function parseSignature(s: string): { largest: FeeLine | ""; verdicts: Record<string, LineView["verdict"]> } {
  const out: { largest: FeeLine | ""; verdicts: Record<string, LineView["verdict"]> } = { largest: "", verdicts: {} };
  for (const part of s.split(";")) {
    const [k, v] = part.split("=");
    if (k === "largest") out.largest = (v ?? "") as FeeLine | "";
    else if (k && v) out.verdicts[k] = v as LineView["verdict"];
  }
  return out;
}

export function feeSensitivity(a: AnalyseArgs, base: Analysis, runBundle: CompareBundle): FeeSensitivity | null {
  const thresholds = base.thresholds.values;
  const g = a.inputs.g;
  const wrapperId = a.wrapper.id;
  // a line at 0% whose discount reverts to a positive rate moves too: the multiplier scales both of its periods (A-19)
  const scalable = base.lines.filter((l) => feeKindOf[l.line] && l.rateFraction !== undefined && (l.rateFraction > 0 || l.after !== undefined));
  const p05 = parameterOf(runBundle, "P-05");
  const inflationNow = g.inflationPct ?? ((p05 as unknown as { inputs: Record<string, ValueObject> }).inputs["A-02"]!.value as number);
  const floor = horizonFloorOf(runBundle);
  const axes = sensitivityAxes(runBundle.parameters, {
    current: { "A-01": (g.returnPct ?? 0) / 100, "A-02": inflationNow / 100 },
    horizonYears: g.horizonYears,
    ...(floor !== undefined ? { horizonMinYears: floor } : {}),
    fees: scalable.map((l) => ({ key: l.line, label: r3fees.names[l.line]! })),
  });
  // a fee at 0% during its discount moves only after it (A-19): the row is named for the rate after the discount
  const zeroUntilAfter = (key: string) => scalable.some((l) => `fee:${l.line}` === key && l.rateFraction === 0 && l.after !== undefined);
  for (const ax of axes) ax.label = ax.key === "A-01" ? r3fees.sens.axes.ret : ax.key === "A-02" ? r3fees.sens.axes.inflation : ax.key === "horizon" ? r3fees.sens.axes.years : `${ax.label}${zeroUntilAfter(ax.key) ? r3fees.sens.afterAxis : ""}`;
  const totalFor = (fm: FeeMateriality) => fm.total.value as number;
  const topOf = (key: string, value: number): string => {
    const goal: RunGoal = { ...g };
    let scale: Record<string, number> | undefined;
    if (key === "A-01") goal.returnPct = value * 100;
    else if (key === "A-02") goal.inflationPct = value * 100;
    else if (key === "horizon") goal.horizonYears = value;
    else {
      const kind = feeKindOf[key.slice(4) as FeeLine];
      scale = { [`${wrapperId}:${kind}`]: value };
    }
    const r = subjectRun(runBundle, wrapperId, goal, scale);
    if ("kind" in r) return "";
    const fm = feeMateriality(r.plan, base.ctx);
    const rows = fm.lines.map((l) => {
      const costNis = l.cost.value as number;
      const frac = lineRate(r.plan, l.line);
      const baseLine = base.lines.find((x) => x.line === l.line);
      const refShown = baseLine ? meanShown(baseLine.reference) : null;
      const ref = refShown !== null ? refShown / 100 : null;
      // the rate the card judges (D88, D90): a discount that ends within the moved horizon is judged by the rate after it, so a flip is one the card would show
      // both are held at the line's regulated cap, the most the run charges, when the multiplier scales a rate past it (F-11, F-15)
      const judged = rateAfterDiscount(r.plan, l.line, fm.run.exitMonth, base.ctx);
      const cap = feeCap(r.plan, l.line, base.ctx)?.rate;
      const now = frac !== undefined && cap !== undefined ? Math.min(frac, cap) : frac;
      // the card's test: what bringing the fee charged now to the average is worth (D90 revised), on the moved plan
      const worthNis = worthOf(r.plan, l.line, suggestionOf(l.line, refShown, now), base.ctx);
      const v = verdictOf({ costNis, worthNis, rate: judged ?? now, ref, total: totalFor(fm), removed: (baseLine?.removedBy.length ?? 0) > 0, thresholds });
      return { line: l.line, costNis, verdict: v.verdict === "worth-negotiating" ? "negotiate" : v.verdict === "worth-avoiding" ? "avoid" : "not-worth" };
    });
    return signature(rows);
  };
  const s = sensitivity(axes, topOf);
  const reach = reachOf(a, base, runBundle);
  const baseSig = parseSignature(s.baseTop ?? "");
  const rows: FeeSensRow[] = s.rows.map((r) => {
    const sides = (["lo", "hi"] as const).filter((x) => r[x].flips).map((side) => ({ side, to: r[side].flipsAt!, after: r[side].topAfter ?? "" }));
    const best = sides.sort((x, y) => Math.abs(x.to - r.current) - Math.abs(y.to - r.current))[0];
    const feeLine = r.key.startsWith("fee:") ? (r.key.slice(4) as FeeLine) : null;
    const feeRate = feeLine ? base.lines.find((l) => l.line === feeLine)?.rateFraction : undefined;
    const afterRate = feeLine ? discountOf(base.plan, feeLine)?.listRate : undefined;
    const cap = feeLine ? base.lines.find((l) => l.line === feeLine)?.cap : undefined;
    const capPct = cap?.state === "sourced" && typeof cap.rate.value === "number" ? cap.rate.value : undefined;
    const row: FeeSensRow = {
      key: r.key,
      label: r.label,
      unit: r.unit,
      current: r.current,
      lo: r.lo.bound,
      hi: r.hi.bound,
      field: r.key === "A-01" ? "return" : r.key === "A-02" ? "inflation" : r.key === "horizon" ? "horizonYears" : null,
      ...(feeRate !== undefined ? { ratePct: feeRate * 100 } : {}),
      ...(afterRate !== undefined ? { afterPct: afterRate * 100 } : {}),
      ...(capPct !== undefined ? { capPct } : {}),
    };
    if (best) {
      const after = parseSignature(best.after);
      const changed = Object.keys(after.verdicts).find((k) => after.verdicts[k] !== baseSig.verdicts[k]) as FeeLine | undefined;
      if (changed) row.flip = { from: r.current, to: best.to, side: best.side, kind: "verdict", line: changed, newVerdict: after.verdicts[changed]! };
      else if (after.largest && after.largest !== baseSig.largest) row.flip = { from: r.current, to: best.to, side: best.side, kind: "largest", newLargest: after.largest };
    }
    return row;
  });
  rows.sort((x, y) => {
    if (!!x.flip !== !!y.flip) return x.flip ? -1 : 1;
    if (x.flip && y.flip) return Math.abs(x.flip.to - x.flip.from) / Math.abs(x.flip.from || 1) - Math.abs(y.flip.to - y.flip.from) / Math.abs(y.flip.from || 1);
    return 0;
  });
  return { rows, noFlip: s.noFlip, reach };
}

/**
 * F-61 searched (`FeeReach`): for each line not worth negotiating now with a cut to ask for, the amount today at which the cut is worth
 * the threshold, from two runs (the worth grows in a straight line with the amount),
 * then checked on the round sum; and the fewest whole years up to `REACH_LIMITS.years` by halving, the worth growing with the years.
 */
export function reachOf(a: AnalyseArgs, base: Analysis, runBundle: CompareBundle): Partial<Record<FeeLine, FeeReach>> {
  const T = base.thresholds.values.negotiateNis;
  const g = a.inputs.g;
  const targets = base.lines.filter((l) => l.verdict === "not-worth" && (l.reason === "below" || l.reason === "check-after") && l.suggestion !== null && l.worthNis > 0 && l.worthNis < T);
  if (targets.length === 0) return {};
  const planFor = (goal: RunGoal): RunPlan | null => {
    try {
      const r = subjectRun(runBundle, a.wrapper.id, goal);
      return "kind" in r ? null : r.plan;
    } catch {
      return null;
    }
  };
  const worth = (plan: RunPlan | null, l: LineView): number => {
    if (!plan) return 0;
    try {
      return worthOf(plan, l.line, l.suggestion, base.ctx);
    } catch {
      return 0;
    }
  };
  const out: Partial<Record<FeeLine, FeeReach>> = {};
  for (const l of targets) out[l.line] = {};
  // the amount today: a straight line through two runs, then the round sum checked, and raised a tenth at a time up to three times
  if (g.amountNow !== null) {
    const a0 = g.amountNow;
    const a1 = a0 > 0 ? a0 * 2 : 50_000;
    const p1 = planFor({ ...g, amountNow: a1 });
    for (const l of targets) {
      const k = (worth(p1, l) - l.worthNis) / (a1 - a0);
      if (!(k > 0)) continue;
      let at = roundSumUp(a0 + (T - l.worthNis) / k);
      for (let tries = 0; tries < 3 && at <= REACH_LIMITS.amountNow; tries++) {
        if (worth(planFor({ ...g, amountNow: at }), l) >= T) {
          out[l.line]!.amountNow = at;
          break;
        }
        at = roundSumUp(at * 1.1);
      }
    }
  }
  // the horizon: the fewest whole years past the one entered, by halving, where the worth at the longest horizon searched reaches it
  if (g.horizonYears !== null && g.horizonYears < REACH_LIMITS.years) {
    const at = (years: number) => planFor({ ...g, horizonYears: years });
    const cache = new Map<number, RunPlan | null>();
    const planAt = (years: number) => (cache.has(years) ? cache.get(years)! : (cache.set(years, at(years)), cache.get(years)!));
    for (const l of targets) {
      if (worth(planAt(REACH_LIMITS.years), l) < T) continue;
      let lo = g.horizonYears;
      let hi = REACH_LIMITS.years;
      while (hi - lo > 1) {
        const mid = Math.floor((lo + hi) / 2);
        if (worth(planAt(mid), l) >= T) hi = mid;
        else lo = mid;
      }
      out[l.line]!.horizonYears = hi;
    }
  }
  return out;
}

// ---------------------------------------------------------------- the whole page

export type FeesResult =
  | { kind: "ok"; subject: SubjectView; analysis: Analysis; args: AnalyseArgs; inputs: FeeInputs; comparison: ComparisonSet | null; preTax: string[]; omitted: string[]; blocked?: undefined }
  | { kind: "error"; error: PlanError }
  | { kind: "blocked"; ruleId: string; messageHe: string };

export interface SubjectView {
  kind: "wrapper" | "track";
  from: "guide" | "track";
  wrapperId: string;
  productName: string;
  record: string;
  recordSource: SiteValue | null;
  track: TrackLite | null;
  /** The calendar year of the CMA fee averages the set rests on (a track subject). */
  feeYear: string | null;
  /** The page the subject came from. */
  fromHref: string | null;
}

/**
 * `inputs` with no saved goal (the fee page): the comparison behind "avoid" runs on the page's own numbers,
 * every option at once, so the verdict is evaluated without a goal.
 */
export function buildFees(bundle: CompareBundle, data: FeesData, subject: SubjectSpec, inputs: FeeInputs, goalName = ""): FeesResult {
  const names: Record<string, string> = Object.fromEntries(bundle.wrappers.map((w) => [w.id, w.name]));
  let wrapperId: string;
  let track: TrackLite | null = null;
  let runBundle = bundle;
  let omitted: string[] = [];
  if (subject.kind === "track") {
    track = data.tracks.find((t) => t.id === subject.trackId) ?? null;
    if (!track || !track.wrapperId) return { kind: "error", error: { kind: "no-wrapper" } };
    wrapperId = track.wrapperId;
    const r = withTrackFees(bundle, wrapperId, track, data);
    if ("kind" in r) return { kind: "error", error: r };
    runBundle = r.bundle;
    omitted = r.missing;
  } else wrapperId = subject.wrapperId;
  // No saved goal: the run is the entered values or P-05's, and a study fund with no employment entered takes the one its `instruments` entry names, as the guide page does (B3).
  if (!inputs.fromGoal && inputs.g.employment === null) {
    const spec = (parameterOf(bundle, "P-05") as unknown as { instruments?: Record<string, { employment?: "employee" | "self-employed" }> }).instruments?.[wrapperId];
    if (spec?.employment) inputs = { ...inputs, g: { ...inputs.g, employment: spec.employment } };
  }
  // a track runs at its own fees in the comparison too: its place, and so "is anything better above it", is its own,
  // not the place of the site's sample track for the product
  const comparison = comparisonFor(runBundle, inputs.goalG ?? inputs.g, goalName);

  const run = (() => {
    try {
      return subjectRun(runBundle, wrapperId, inputs.g);
    } catch (e) {
      if (e instanceof BlockedError) return { kind: "no-run", code: e.ruleId, messageHe: blockedHe } as PlanError;
      throw e;
    }
  })();
  if ("kind" in run) return { kind: "error", error: run };
  const record = recordOf(run.wrapper, wrapperId, track, data);
  const sv: SubjectView = {
    kind: subject.kind,
    from: subject.kind === "track" ? "track" : "guide",
    wrapperId,
    productName: run.wrapper.name,
    record: record.name,
    recordSource: record.source,
    track,
    feeYear: track ? (data.templates[track.dataset]?.balance.effective_from ?? "").slice(0, 4) || null : null,
    fromHref: subject.kind === "track" ? `/companies/${track!.companyId}/${track!.id}` : `/guide/${wrapperId}`,
  };
  const args: AnalyseArgs = { plan: run.plan, runBundle, wrapper: run.wrapper, inputs, data, track, comparison, names, withSeries: true };
  try {
    const analysis = analyse(args);
    return { kind: "ok", subject: sv, analysis, args, inputs, comparison, preTax: run.preTax, omitted };
  } catch (e) {
    if (e instanceof BlockedError) return { kind: "blocked", ruleId: e.ruleId, messageHe: blockedHe };
    throw e;
  }
}

function recordOf(w: WrapperEntry, wrapperId: string, track: TrackLite | null, data: FeesData): { name: string; source: SiteValue | null } {
  if (track) return { name: `${track.name} (${track.company})`, source: null };
  const bal = w.feeValues.balance;
  if (w.feeValues.regBalance) {
    const t = data.tracks.find((x) => x.id === data.wrapperTrack[wrapperId]);
    if (t) return { name: `ממוצע דמי הניהול של המסלול ${t.name} (${t.company})`, source: bal ?? null };
  }
  const first = Object.values(w.feeValues).find((v) => v.source?.title);
  const v = bal ?? first ?? null;
  return { name: v ? v.source.publisher || v.source.title : w.name, source: v };
}

export const fmtPct = (n: number) => fmt.pct(n);

