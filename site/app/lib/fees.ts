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
  sensitivity,
  sensitivityAxes,
  valueOfReduction,
  BlockedError,
  MissingRuleError,
  RecordInputError,
  type Candidate,
  type FeeLine,
  type FeeMaterialitySeries,
  type FeeMateriality,
  type FeeThresholds,
  type FeeVerdict,
  type RegulatorReference,
  type RunContext,
  type RunPlan,
  type UsedRule,
} from "@finance-tool/engine";
import type { ParameterRecord, RuleRecord, ValueObject } from "@finance-tool/schema";
import { computedInputs as ci, formulaNames, r3fees } from "../copy";
import { asParameter, evaluate, goalValueObjects, nothingToCompare, parameterOf, placeGroups, type CompareBundle, type FeeKind, type RunGoal, type WrapperEntry } from "./compare";
import { fmt } from "./format";
import { holdingName, holdingPlan } from "./holdings";
import { blockedHe, failureHe } from "./failure-he";
import type { Holding } from "./state";
import type { InputsState } from "./inputs";
import { computed, depositFeeNoneByRule, entered as enteredValue, expandFee, staleCmaFee, weaker, type CompactFee, type SiteValue, type Strength } from "./value";

Object.assign(formulaNames, { "F-62": "פסק דין על עמלה", "F-68": "ממוצע הרשות למסלולי הסיווג", "F-61": "עלות דמי הניהול" });

// ---------------------------------------------------------------- the data (fees.server.ts)

export interface LinkOut {
  href: string;
  title: string;
  ruleId: string;
}

export interface TrackLite {
  id: number;
  name: string;
  company: string;
  companyId: string;
  classification: string;
  specialization: string;
  wrapperId: string | null;
  dataset: string;
  period: string;
  b: CompactFee;
  d: CompactFee;
}

export interface FeesData {
  today: string;
  p03: ParameterRecord;
  rules: RuleRecord[];
  /** The records those rules' cards point at (derived_from, examples) that the bundle does not ship: only chips and cards read them (review, 2026-10-26). */
  pointed?: RuleRecord[];
  /** F-68 for every provident-family class, by `classKey`. */
  references: Record<string, RegulatorReference>;
  /** The value object shared by a dataset's tracks (source, dates, rule ids), per fee. */
  templates: Record<string, { balance: ValueObject; deposit: ValueObject }>;
  tracks: TrackLite[];
  /** The track P-05 names for a wrapper (its representative instrument, D21). */
  wrapperTrack: Record<string, number>;
  /** The class of the provider whose tariff a securities wrapper uses (`bank`, ...). */
  tariffClass: Record<string, string>;
  links: { boi: LinkOut | null; isa: LinkOut | null; tase: LinkOut | null };
}

export const classKey = (classification: string, specialization: string) => `${classification.trim()}|${specialization.trim()}`;

// ---------------------------------------------------------------- the subject

export type SubjectSpec = { kind: "wrapper"; wrapperId: string; from: "compare" | "guide" } | { kind: "track"; trackId: number } | { kind: "holding"; holdingId: string };

export function parseSubject(search: string): SubjectSpec | null {
  const q = new URLSearchParams(search);
  const wrapper = q.get("wrapper");
  const track = q.get("track");
  const holding = q.get("holding");
  if (wrapper) return { kind: "wrapper", wrapperId: wrapper, from: q.get("from") === "compare" ? "compare" : "guide" };
  if (track && /^\d+$/.test(track)) return { kind: "track", trackId: Number(track) };
  if (holding) return { kind: "holding", holdingId: holding };
  return null;
}

// ---------------------------------------------------------------- the inputs

export interface FeeInputs {
  g: RunGoal;
  /** The saved goal has what a run needs, so the numbers are its own. */
  fromGoal: boolean;
  /** No return was entered: the run uses the scenario's (a site parameter). */
  returnFromParameter: boolean;
  /** The goal as saved, for the comparison (a return it does not hold stays missing, D9). */
  goalG: RunGoal | null;
  /** Fields whose value comes from the subject and not the goal (a holding's balance and deposits): shown, not editable here. */
  fixed?: ("amountNow" | "monthly")[];
  values: { amount: SiteValue; monthly: SiteValue; years: SiteValue; inflation: SiteValue; returnV: SiteValue };
}

const p05Inputs = (bundle: CompareBundle) => (parameterOf(bundle, "P-05") as unknown as { inputs: Record<string, ValueObject> }).inputs;

/** The numbers the page runs on: the saved goal when it has a horizon and money, else P-05's scenario with whatever the guide pages hold. */
export function feeInputs(bundle: CompareBundle, goalG: RunGoal | null, released: InputsState): FeeInputs {
  const p05 = parameterOf(bundle, "P-05");
  const inp = p05Inputs(bundle);
  const param = (key: string) => asParameter(p05, inp[key]!);
  const num = (key: string) => inp[key]!.value as number;
  const meaningful = goalG !== null && !nothingToCompare(goalG);
  if (meaningful) {
    const gv = goalValueObjects(bundle, goalG);
    const returnFromParameter = goalG.returnPct === null;
    const g: RunGoal = { ...goalG, returnPct: goalG.returnPct ?? num("A-01") };
    return { g, fromGoal: true, returnFromParameter, goalG, values: { amount: gv.amountNow, monthly: gv.monthly, years: gv.horizon, inflation: gv.inflation, returnV: gv.returnV ?? param("A-01") } };
  }
  const e = released.entered;
  const val = (key: "amount_now" | "monthly_deposit" | "horizon_years" | "A-01" | "A-02", unit: ValueObject["unit"], about: string) => (e[key] !== undefined ? enteredValue(e[key]!, unit, bundle.runDate, about) : param(key));
  const amount = val("amount_now", "nis", ci.amountNow);
  const monthly = val("monthly_deposit", "nis_per_month", ci.monthly);
  const years = val("horizon_years", "years", ci.years);
  const returnV = val("A-01", "pct_per_year", ci.grossReturn);
  const inflation = val("A-02", "pct_per_year", ci.inflation);
  const income = e.annual_income !== undefined ? e.annual_income : num("annual_income");
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
    insurancePct: null,
    preset: "none",
    fromPreset: { horizon: false, monthly: false, available: false },
  };
  return { g, fromGoal: false, returnFromParameter: e["A-01"] === undefined, goalG, values: { amount, monthly, years, inflation, returnV } };
}

// ---------------------------------------------------------------- value factory

function makeInputsMap(inputs: FeeInputs): Record<string, SiteValue> {
  const v = inputs.values;
  return { [ci.amountNow]: v.amount, [ci.monthly]: v.monthly, [ci.years]: v.years, [ci.grossReturn]: v.returnV, [ci.inflation]: v.inflation };
}

const rulesOf = (used: readonly UsedRule[]) => used.map((u) => ({ id: u.id, strength: u.figures.reduce<Strength>((w, f) => weaker(w, f.strength as Strength) ?? w, u.strength) }));

export type Factory = ReturnType<typeof factory>;

export function factory(bundle: CompareBundle, inputs: FeeInputs) {
  const today = bundle.runDate;
  const base = makeInputsMap(inputs);
  return {
    nis(value: number, formula: string, about: string, run?: { rules: readonly UsedRule[]; flags?: { code: string }[]; labels?: { code: string; ruleId: string }[] }, extra?: Record<string, SiteValue>): SiteValue {
      return computed(value, "nis", formula, { ...base, ...(extra ?? {}) }, { today, about, rules: run ? rulesOf(run.rules) : [], flags: run?.flags?.map((f) => f.code), labels: run?.labels?.map((l) => ({ code: l.code, ruleId: l.ruleId })) });
    },
    count(value: number, about: string): SiteValue {
      return computed(value, "count", "F-83", {}, { today, about });
    },
    plain(value: number, unit: ValueObject["unit"], formula: string, about: string, extra?: Record<string, SiteValue>): SiteValue {
      return computed(value, unit, formula, { ...base, ...(extra ?? {}) }, { today, about });
    },
    base,
  };
}

/** The engine's computed value, its raw inputs turned into values the provenance sheet can open, and the clock of the fee year. */
function lift(v: ValueObject, stale: SiteValue["stale"], today: string): SiteValue {
  const inputs: Record<string, SiteValue> = {};
  if (v.computed_from) {
    for (const [label, raw] of Object.entries(v.computed_from.inputs)) {
      const isNum = typeof raw === "number";
      inputs[label] = { ...computed(isNum ? raw : null, isNum ? "count" : "text", v.computed_from.formula, {}, { today, about: label }), ...(isNum ? {} : { value: String(raw) }) };
    }
  }
  return { ...v, computed_from: v.computed_from ? { formula: v.computed_from.formula, inputs } : undefined, weakest: v.source.strength, stale: stale ?? null, rulesUsed: (v.rule_ids ?? []).map((id) => ({ id, strength: v.source.strength })) } as SiteValue;
}

// ---------------------------------------------------------------- plans

export type PlanError =
  | { kind: "no-wrapper" }
  | { kind: "no-terms" }
  | { kind: "need-input"; detail: string }
  | { kind: "no-run"; code: string; messageHe?: string }
  | { kind: "needs-pf36" }
  | { kind: "needs-first-deposit" }
  | { kind: "no-fee"; detail: string };

/** The rule or gap id an engine message names, or "failed": the page shows ids, never the English message (B3). */
export const codeOfMessage = (message: string | undefined): string => (message ? /\b(?:G|PF|OQ|TXH|TXK|KH|KGL|SW|PEN)-\d+\b/.exec(message)?.[0] ?? "failed" : "failed");

export interface SubjectRun {
  plan: RunPlan;
  wrapper: WrapperEntry;
  candidate: Candidate;
  /** The bundle the plan was built on (the track's fees replace the wrapper's for a track). */
  runBundle: CompareBundle;
  preTax: string[];
}

function candidateOf(bundle: CompareBundle, wrapperId: string, g: RunGoal, scale?: Record<string, number>): Candidate | null {
  const ev = evaluate(bundle, g, { only: new Set([wrapperId]), ...(scale ? { scale } : {}) });
  return ev.candidates.find((c) => c.id === wrapperId) ?? null;
}

/** The bundle with a track's two averages as the wrapper's fees. */
export function withTrackFees(bundle: CompareBundle, wrapperId: string, track: TrackLite, data: FeesData): { bundle: CompareBundle; missing: string[] } | PlanError {
  const w = bundle.wrappers.find((x) => x.id === wrapperId);
  if (!w || !w.terms) return { kind: "no-terms" };
  const tpl = data.templates[track.dataset];
  if (!tpl) return { kind: "no-fee", detail: "template" };
  if (track.b.value === null || track.b.value < 0) return { kind: "no-fee", detail: "balance" };
  const num = (v: SiteValue) => (typeof v.value === "number" ? v.value : null);
  const bal = expandFee(track.b, { ...tpl.balance, stale: staleCmaFee(tpl.balance.effective_to, bundle.runDate) });
  const dep = expandFee(track.d, { ...tpl.deposit, stale: staleCmaFee(tpl.deposit.effective_to, bundle.runDate) });
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
  const candidate = candidateOf(bundle, wrapperId, g, scale);
  if (!candidate) return { kind: "no-wrapper" };
  if (!candidate.plan) {
    const r = candidate.reasons[0];
    if (candidate.kind === "not-evaluated" && r?.code === "missing-input") return { kind: "need-input", detail: r.detail ?? "" };
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
    return typeof fx === "object" ? fx.rate : fx;
  },
  fixed: (p) => (p.run === "runSecurities" ? p.input.tariff.monthlyFee : undefined),
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
export const reducible = (line: FeeLine) => line !== "fixed" && line !== "spread";

const feeKindOf: Partial<Record<FeeLine, FeeKind>> = { balance: "balance", deposit: "deposit", direct: "direct", fund: "fund", trade: "trade", custody: "custody" };

const feeValueKey: Record<FeeLine, string | null> = { balance: "balance", deposit: "deposit", direct: "direct", trade: "tradeRate", custody: "custodyRate", fx: "fxRate", fixed: "monthlyFee", spread: "fundHalfSpread", fund: null, manager: "iraManagerFee" };
const dragKeys = ["fundManagement", "fundVariable", "fundTrustee"] as const;

function rateValue(wrapper: WrapperEntry, line: FeeLine, today: string): SiteValue | null {
  if (line === "fund") {
    const parts = dragKeys.filter((d) => typeof wrapper.feeValues[d]?.value === "number");
    const total = parts.reduce((s, d) => s + (wrapper.feeValues[d]!.value as number), 0);
    if (parts.length === 0) return null;
    return computed(total, "pct_per_year", "A-06", Object.fromEntries(parts.map((d) => [d, wrapper.feeValues[d]!])), { today, about: r3fees.names.fund! });
  }
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
  cma?: { mean: SiteValue; median: SiteValue; count: SiteValue; year: SiteValue | null; classification: string; specialization: string; dataset: string; period: string };
  /** The track's own average, sourced, when it is not the rate itself. */
  ownAverage?: SiteValue;
  /** The authority's official class average (PF-39), beside the computed one. */
  official?: { value: SiteValue; year: string };
  none?: { reason: NoRefReason; linkOut: LinkOut | null };
  stale: SiteValue["stale"];
}

interface RefContext {
  data: FeesData;
  wrapperId: string;
  track: TrackLite | null;
  today: string;
  rules: Map<string, RuleRecord>;
  mk: Factory;
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
  const none = (reason: NoRefReason, linkOut: LinkOut | null = null): ReferenceView => ({ none: { reason, linkOut }, stale: null });
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
    const year = tpl?.balance.effective_from ? tpl.balance.effective_from.slice(0, 4) : null;
    const yearV: SiteValue | null = year ? { ...computed(Number(year), "text", "F-68", {}, { today: c.today, about: "שנת הממוצע" }), value: year } : null;
    const view: ReferenceView = {
      cma: {
        mean: lift(stat.mean, stale, c.today),
        median: lift(stat.median, stale, c.today),
        count: c.mk.count(stat.count, r3fees.referenceLine.tracksAfter),
        year: yearV,
        classification: t.classification,
        specialization: t.specialization,
        dataset: t.dataset,
        period: t.period,
      },
      stale,
    };
    const own = line === "balance" ? (tpl ? expandFee(t.b, { ...tpl.balance, stale }) : null) : tpl ? expandFee(t.d, { ...tpl.deposit, stale }) : null;
    if (own && own.value !== null && (rate === null || rate.value !== own.value)) view.ownAverage = own;
    return view;
  }
  if (line === "fund" || line === "spread") return none("isa-unconfirmed", links.isa);
  return c.data.tariffClass[c.wrapperId] === "bank" ? none("D20", links.boi) : none("tase-uncollected", links.tase);
}

// ---------------------------------------------------------------- the analysis

export type ReasonKind = "negotiate" | "avoid" | "below" | "no-reference" | "not-below" | "nothing-removes" | "avoid-and-below";

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
  removedBy: { id: string; name: string }[];
  reference: ReferenceView;
  cap: CapView;
  /** The suggestion for the reduction field, in percent. */
  suggestion: number | null;
  detail: FeeVerdict;
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

/**
 * Presentation rule over P-03 (A9, lead decision 4c): P-03 judges the fee's cost, the ranking judges the net result, and both
 * are right. When the saved goal ranks the product first, the "avoid" badge is worded as a relative statement; the verdict
 * itself, its threshold and its reason are unchanged.
 */
export const softensAvoid = (verdict: LineView["verdict"], place: { rank: number } | null) => verdict === "avoid" && place?.rank === 1;

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
 * above its average, the plain statement that none is. null when no fee has an average to compare with.
 */
export function headlineGap(an: Analysis): { kind: "more"; line: FeeLine; worth: SiteValue } | { kind: "less" } | null {
  let best: { line: FeeLine; worth: SiteValue; nis: number } | null = null;
  let anyReference = false;
  for (const l of an.lines) {
    if (l.suggestion === null || l.rateFraction === undefined) continue;
    anyReference = true;
    const worth = reductionWorth(an, l.line, l.suggestion);
    if (worth && typeof worth.value === "number" && (!best || worth.value > best.nis)) best = { line: l.line, worth, nis: worth.value };
  }
  if (best) return { kind: "more", line: best.line, worth: best.worth };
  return anyReference ? { kind: "less" } : null;
}

/** Whether another option in the comparison charges no fee of this type (F-62's "removes it"): ranked or listed with a run, not the subject itself. */
export function removedByOf(set: ComparisonSet | null, subjectId: string, line: FeeLine, names: Record<string, string>): { id: string; name: string }[] {
  if (!set) return [];
  return set.candidates
    .filter((c) => c.tier === 1 && c.id !== subjectId && c.plan && c.run && (c.kind === "ranked" || c.kind === "listed-not-ranked"))
    .filter((c) => !feeLines(c.plan!).includes(line))
    .map((c) => ({ id: c.id, name: names[c.id] ?? c.id }));
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

function verdictOf(args: { costNis: number; rate: number | undefined; ref: number | null; total: number; removed: boolean; thresholds: FeeThresholds }) {
  return feeVerdict({ nis: args.costNis, ...(args.rate !== undefined ? { currentRate: args.rate } : {}), totalDrag: args.total, removedByAlternative: args.removed }, args.ref === null ? null : { rate: args.ref }, args.thresholds);
}

function reasonOf(v: FeeVerdict, hasComparison: boolean, removedAny: boolean, refExists: boolean): ReasonKind {
  if (v.verdict === "worth-negotiating") return "negotiate";
  if (v.verdict === "worth-avoiding") return "avoid";
  if (v.reasons.includes("cost-below-negotiate-threshold") && v.reasons.includes("cost-below-avoid-threshold")) return "below";
  if (!v.reasons.includes("cost-below-avoid-threshold") && hasComparison && !removedAny) return "nothing-removes";
  if (!refExists) return "no-reference";
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
  /** Rates the person entered (a holding's statement), which replace the record's. */
  rates?: Partial<Record<FeeLine, SiteValue>>;
  /** Re-plans the subject for another goal (F-81); absent: the wrapper's plan is rebuilt from the bundle. */
  replan?: (goal: RunGoal) => RunPlan | null;
  /** No fee axes in the sensitivity (a holding's plan cannot scale a fee). */
  noFeeAxes?: boolean;
}

export function analyse(a: AnalyseArgs): Analysis {
  const rules = ruleMap(a.runBundle, a.data);
  const ctx = contextFor(a.runBundle, rules);
  const mk = factory(a.runBundle, a.inputs);
  const fm = feeMateriality(a.plan, ctx);
  const thresholds = feeThresholds(a.data.p03);
  const total = fm.total.value as number;
  const today = a.runBundle.runDate;
  const run = { rules: fm.run.rules, flags: fm.run.flags, labels: fm.run.labels };
  const refCtx: RefContext = { data: a.data, wrapperId: a.wrapper.id, track: a.track, today, rules, mk };
  const lines: LineView[] = fm.lines.map((l): LineView => {
    const rate = a.rates?.[l.line] ?? rateValue(a.runBundle.wrappers.find((w) => w.id === a.wrapper.id) ?? a.wrapper, l.line, today);
    const frac = lineRate(a.plan, l.line);
    const reference = referenceFor(refCtx, l.line, rate);
    const refFraction = reference.cma ? (reference.cma.mean.value as number) / 100 : null;
    const removedBy = removedByOf(a.comparison, a.wrapper.id, l.line, a.names);
    const costNis = l.cost.value as number;
    const detail = verdictOf({ costNis, rate: frac, ref: refFraction, total, removed: removedBy.length > 0, thresholds });
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
      reason: reasonOf(detail, hasComparison, removedBy.length > 0, refFraction !== null),
      avoidEvaluated: hasComparison || costNis < thresholds.avoidNis,
      removedBy,
      reference,
      cap: capOf(a.plan, l.line, ctx, rules, today),
      suggestion: reference.cma && frac !== undefined && reducible(l.line) ? fmt.pctShown(reference.cma.mean.value as number) : null,
      detail,
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
    remainder: mk.nis(fm.interaction.value as number, "F-61", r3fees.remainder.before.trim(), run),
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
  return an.mk.nis(r.value.value as number, "F-61", `${r3fees.names[line]}: ${r3fees.reduction.label}`, { rules: an.fm.run.rules, flags: an.fm.run.flags, labels: an.fm.run.labels }, { [r3fees.reduction.label.trim()]: to, ...(l.rate ? { [r3fees.names[line]!]: l.rate } : {}) });
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
  field: "return" | "inflation" | "horizonYears" | null;
  flip?: { from: number; to: number; side: "lo" | "hi"; kind: "verdict" | "largest"; line?: FeeLine; newVerdict?: LineView["verdict"]; newLargest?: FeeLine };
}

export interface FeeSensitivity {
  rows: FeeSensRow[];
  noFlip: boolean;
}

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
  const scalable = a.noFeeAxes ? [] : base.lines.filter((l) => feeKindOf[l.line] && l.rateFraction !== undefined && l.rateFraction > 0);
  const p05 = parameterOf(runBundle, "P-05");
  const inflationNow = g.inflationPct ?? ((p05 as unknown as { inputs: Record<string, ValueObject> }).inputs["A-02"]!.value as number);
  const axes = sensitivityAxes(runBundle.parameters, {
    current: { "A-01": (g.returnPct ?? 0) / 100, "A-02": inflationNow / 100 },
    horizonYears: g.horizonYears,
    fees: scalable.map((l) => ({ key: l.line, label: r3fees.names[l.line]! })),
  });
  for (const ax of axes) ax.label = ax.key === "A-01" ? "תשואה שנתית" : ax.key === "A-02" ? "אינפלציה" : ax.key === "horizon" ? "שנים עד המטרה" : `${ax.label}${r3fees.sens.feeAxis}`;
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
    let plan: RunPlan;
    if (a.replan) {
      const p = a.replan(goal);
      if (!p) return "";
      plan = p;
    } else {
      const r = subjectRun(runBundle, wrapperId, goal, scale);
      if ("kind" in r) return "";
      plan = r.plan;
    }
    const r = { plan };
    const fm = feeMateriality(r.plan, base.ctx);
    const rows = fm.lines.map((l) => {
      const costNis = l.cost.value as number;
      const frac = lineRate(r.plan, l.line);
      const baseLine = base.lines.find((x) => x.line === l.line);
      const ref = baseLine?.reference.cma ? (baseLine.reference.cma.mean.value as number) / 100 : null;
      const v = verdictOf({ costNis, rate: frac, ref, total: totalFor(fm), removed: (baseLine?.removedBy.length ?? 0) > 0, thresholds });
      return { line: l.line, costNis, verdict: v.verdict === "worth-negotiating" ? "negotiate" : v.verdict === "worth-avoiding" ? "avoid" : "not-worth" };
    });
    return signature(rows);
  };
  const s = sensitivity(axes, topOf);
  const baseSig = parseSignature(s.baseTop ?? "");
  const rows: FeeSensRow[] = s.rows.map((r) => {
    const sides = (["lo", "hi"] as const).filter((x) => r[x].flips).map((side) => ({ side, to: r[side].flipsAt!, after: r[side].topAfter ?? "" }));
    const best = sides.sort((x, y) => Math.abs(x.to - r.current) - Math.abs(y.to - r.current))[0];
    const feeLine = r.key.startsWith("fee:") ? (r.key.slice(4) as FeeLine) : null;
    const feeRate = feeLine ? base.lines.find((l) => l.line === feeLine)?.rateFraction : undefined;
    const row: FeeSensRow = {
      key: r.key,
      label: r.label,
      unit: r.unit,
      current: r.current,
      lo: r.lo.bound,
      hi: r.hi.bound,
      field: r.key === "A-01" ? "return" : r.key === "A-02" ? "inflation" : r.key === "horizon" ? "horizonYears" : null,
      ...(feeRate !== undefined ? { ratePct: feeRate * 100 } : {}),
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
  return { rows, noFlip: s.noFlip };
}

// ---------------------------------------------------------------- the whole page

export type FeesResult =
  | { kind: "ok"; subject: SubjectView; analysis: Analysis; args: AnalyseArgs; inputs: FeeInputs; comparison: ComparisonSet | null; preTax: string[]; omitted: string[]; blocked?: undefined }
  | { kind: "error"; error: PlanError }
  | { kind: "blocked"; ruleId: string; messageHe: string };

export interface SubjectView {
  kind: "wrapper" | "track" | "holding";
  from: "compare" | "guide" | "track" | "holding";
  wrapperId: string;
  productName: string;
  record: string;
  recordSource: SiteValue | null;
  track: TrackLite | null;
  /** The calendar year of the CMA fee averages the set rests on (a track subject). */
  feeYear: string | null;
  fromHref: string;
}

export function holdingSubject(h: Holding, wrapper: WrapperEntry, data: FeesData): { subject: SubjectView; track: TrackLite | null } {
  const track = h.track ? data.tracks.find((t) => t.id === h.track!.fundId) ?? null : null;
  return {
    track,
    subject: { kind: "holding", from: "holding", wrapperId: h.wrapperId, productName: holdingName(h), record: holdingName(h), recordSource: null, track, feeYear: null, fromHref: "/holdings" },
  };
}

/** A holding under review (method F-61: the balance as it stands, the statement's fees); needs the pension ledger, as the holdings page does. */
/** The run's amount is the holding's balance and its monthly money the statement's own and employer deposits, not the goal's (B5). */
function holdingInputs(inputs: FeeInputs, h: Holding): FeeInputs {
  const num = (v: ValueObject | undefined) => (typeof v?.value === "number" ? v.value : 0);
  const monthly = num(h.monthlyOwn) + (h.wrapperId === "keren-hishtalmut" ? num(h.monthlyEmployer) : 0);
  const monthlyValue = h.monthlyOwn || h.monthlyEmployer ? enteredValue(monthly, "nis_per_month", inputs.values.monthly.checked, ci.monthly) : enteredValue(0, "nis_per_month", inputs.values.monthly.checked, ci.monthly);
  return {
    ...inputs,
    g: { ...inputs.g, amountNow: num(h.balance), monthly },
    values: { ...inputs.values, amount: h.balance as SiteValue, monthly: monthlyValue },
    fixed: ["amountNow", "monthly"],
  };
}

export function buildHoldingFees(bundle: CompareBundle, data: FeesData, h: Holding, inputs: FeeInputs, goalName: string): FeesResult {
  const wrapper = bundle.wrappers.find((w) => w.id === h.wrapperId);
  if (!wrapper) return { kind: "error", error: { kind: "no-wrapper" } };
  const rules = ruleMap(bundle, data);
  const rulesRecord = Object.fromEntries(rules);
  const goal = { years: inputs.g.horizonYears, name: goalName, run: inputs.g };
  inputs = holdingInputs(inputs, h);
  const hp = holdingPlan(h, bundle, goal, rulesRecord);
  if (!hp.ok)
    return {
      kind: "error",
      error: hp.reason === "unsupported" ? { kind: "no-terms" } : hp.reason === "needs-pf36" ? { kind: "needs-pf36" } : hp.reason === "needs-first-deposit" ? { kind: "needs-first-deposit" } : { kind: "no-run", code: codeOfMessage(hp.message), messageHe: failureHe(hp.message) },
    };
  const { subject, track } = holdingSubject(h, wrapper, data);
  const names: Record<string, string> = Object.fromEntries(bundle.wrappers.map((w) => [w.id, w.name]));
  const comparison = comparisonFor(bundle, inputs.goalG, goalName);
  const rates: AnalyseArgs["rates"] = {};
  if (h.feeBalance) rates.balance = h.feeBalance as SiteValue;
  if (h.feeDeposit) rates.deposit = h.feeDeposit as SiteValue;
  if (h.directExpenses) rates.direct = h.directExpenses as SiteValue;
  const args: AnalyseArgs = {
    plan: hp.plan,
    runBundle: bundle,
    wrapper,
    inputs,
    data,
    track,
    comparison,
    names,
    withSeries: true,
    rates,
    noFeeAxes: true,
    replan: (g) => {
      const r = holdingPlan(h, bundle, { years: g.horizonYears, name: goalName, run: g }, rulesRecord);
      return r.ok ? r.plan : null;
    },
  };
  try {
    const analysis = analyse(args);
    const o = analysis.fm.run.outcome;
    return { kind: "ok", subject, analysis, args, inputs, comparison, preTax: o.code === "listed-not-ranked" && o.reason ? [o.reason] : [], omitted: [] };
  } catch (e) {
    if (e instanceof BlockedError) return { kind: "blocked", ruleId: e.ruleId, messageHe: blockedHe };
    // a study fund still inside its lock: the run asks for the detailed statement's tax layers (PF-36), as the holdings card says (B2)
    const message = e instanceof Error ? e.message : String(e);
    if (/PF-36/.test(message) && h.wrapperId === "keren-hishtalmut") return { kind: "error", error: { kind: "needs-pf36" } };
    if (e instanceof RecordInputError || e instanceof MissingRuleError) return { kind: "error", error: { kind: "no-run", code: codeOfMessage(message), messageHe: failureHe(message) } };
    throw e;
  }
}

export function buildFees(bundle: CompareBundle, data: FeesData, subject: SubjectSpec, inputs: FeeInputs, goalName: string): FeesResult {
  const names: Record<string, string> = Object.fromEntries(bundle.wrappers.map((w) => [w.id, w.name]));
  const comparison = comparisonFor(bundle, inputs.goalG, goalName);
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
  } else if (subject.kind === "wrapper") wrapperId = subject.wrapperId;
  else return { kind: "error", error: { kind: "no-wrapper" } };
  // No saved goal: the run is P-05's scenario, and a study fund takes the employment its `instruments` entry names, as the guide page does (B3).
  if (!inputs.fromGoal && inputs.g.employment === null) {
    const spec = (parameterOf(bundle, "P-05") as unknown as { instruments?: Record<string, { employment?: "employee" | "self-employed" }> }).instruments?.[wrapperId];
    if (spec?.employment) inputs = { ...inputs, g: { ...inputs.g, employment: spec.employment } };
  }

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
    from: subject.kind === "track" ? "track" : subject.kind === "wrapper" ? subject.from : "guide",
    wrapperId,
    productName: run.wrapper.name,
    record: record.name,
    recordSource: record.source,
    track,
    feeYear: track ? (data.templates[track.dataset]?.balance.effective_from ?? "").slice(0, 4) || null : null,
    fromHref: subject.kind === "track" ? `/companies/${track!.companyId}/${track!.id}` : subject.from === "compare" ? "/goal/compare" : `/guide/${wrapperId}`,
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

let dataPromise: Promise<FeesData> | null = null;

/** The fee page's data (fees.server.ts), fetched once per visit. */
export function loadFeesData(): Promise<FeesData> {
  if (!dataPromise) dataPromise = fetch(`${import.meta.env.BASE_URL}fees-data.json`).then((r) => r.json() as Promise<FeesData>);
  return dataPromise;
}
