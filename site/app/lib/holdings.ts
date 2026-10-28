// Holdings in the browser (design-spec 11.2, 13; flows 22 to 24): the bundle's shapes, a holding as the page reads it
// (the regulator's facts, the fit mark, F-68's class reference, F-61's fee cost with the existing balance) and the
// consolidation groups (F-72) with the worth of consolidating (F-61's value of a stated reduction). No rate, fee or rule
// figure is written here: every number comes from the bundle, from the engine or from the person, and leaves as a
// value object. The fee page reads a holding from the device with `useHolding(id)` and its run with `holdingPlan`.
import {
  consolidation as runConsolidation,
  feeCap,
  feeMateriality,
  runInputs,
  valueOfReduction,
  MissingRuleError,
  type CmaTrack,
  type ConsolidationPair,
  type Holding as EngineHolding,
  type RunContext,
  type RunPlan,
} from "@finance-tool/engine";
import type { RuleRecord, ValueObject, WrapperId } from "@finance-tool/schema";
import { formulaNames } from "../copy";
import { goalValueObjects, runGoalOf, type CompareBundle, type RunGoal } from "./compare";
import { p05Units } from "./engine";
import { referenceOfClass, tracksBehind } from "./class-reference";
import { fitOf, type FitTableData } from "./fit";
import { failureHe } from "./failure-he";
import { fmt } from "./format";
import type { Goal, ResolvedGoal } from "./goal";
import { normalize } from "./search";
import { sortedHoldings, useStateStore, type Holding, type TransferBar } from "./state";
import { computed, entered as enteredValue, expandFee, ruleFigure, type CompactFee, type SiteValue, type Staleness } from "./value";

Object.assign(formulaNames, {
  "F-61": "עלות דמי הניהול",
  "F-68": "ממוצע הרשות למסלולי הסיווג",
  "F-72": "איחוד חשבונות",
});

// ---------------------------------------------------------------- the bundle (holdings.server.ts)

export interface HWrapper {
  id: WrapperId;
  kind: "provident" | "pension" | "ira" | "child";
  /** The glossary name. */
  name: string;
}

/** One regulator track, compact: the fee values are the bundle's template with the track's own number. */
export interface HTrack {
  id: number;
  n: string;
  /** Index into `companies`. */
  c: number;
  w: WrapperId;
  /** Index into `classifications` (the regulator's FUND_CLASSIFICATION). */
  k: number;
  /** 0 gemelnet, 1 pensia-net (a pension fund's averages are for the fund as a whole, CAT-39). */
  d: 0 | 1;
  s: string;
  ss: string;
  fb: CompactFee;
  fd: CompactFee;
}

export interface HoldingsBundle {
  today: string;
  /** The ids the export file carries (design-spec 11.5). */
  site: { version: string; data: string };
  period: SiteValue;
  fit: FitTableData;
  wrappers: HWrapper[];
  classifications: string[];
  companies: { id: string; name: string }[];
  tracks: HTrack[];
  fees: Partial<Record<"gemelnet" | "pensia-net", { balance: SiteValue; deposit: SiteValue }>>;
  rules: RuleRecord[];
  /** The records those rules' cards point at (derived_from, examples) that the bundle does not ship: only chips and cards read them (review, 2026-10-26). */
  pointed?: RuleRecord[];
  spellings: { balanceFee: string[]; depositFee: string[]; balance: string[]; direct: string[] };
}

let bundlePromise: Promise<HoldingsBundle> | null = null;

/** Fetched once per visit (the file is pre-rendered like the comparison bundle). */
export function loadHoldingsBundle(): Promise<HoldingsBundle> {
  if (!bundlePromise) bundlePromise = fetch(`${import.meta.env.BASE_URL}holdings-bundle.json`).then((r) => r.json() as Promise<HoldingsBundle>);
  return bundlePromise;
}

// ---------------------------------------------------------------- tracks

const cmaCache = new WeakMap<HoldingsBundle, CmaTrack[]>();

const datasetOf = (t: HTrack) => (t.d === 1 ? ("pensia-net" as const) : ("gemelnet" as const));

export function trackFees(hb: HoldingsBundle, t: HTrack): { balance: SiteValue; deposit: SiteValue } {
  const tmpl = hb.fees[datasetOf(t)]!;
  return { balance: expandFee(t.fb, tmpl.balance), deposit: expandFee(t.fd, tmpl.deposit) };
}

/** The track records F-68 reads, rebuilt from the compact list. */
export function cmaTracks(hb: HoldingsBundle): CmaTrack[] {
  let out = cmaCache.get(hb);
  if (!out) {
    out = hb.tracks.map((t) => {
      const f = trackFees(hb, t);
      return {
        fund_id: t.id,
        fund_classification: hb.classifications[t.k]!,
        specialization: t.s,
        sub_specialization: t.ss,
        dataset: datasetOf(t),
        report_period: String(hb.period.value),
        source: hb.period.source,
        checked: hb.period.checked,
        fees: { avg_annual_management_fee: f.balance, avg_deposit_fee: f.deposit },
      } as unknown as CmaTrack;
    });
    cmaCache.set(hb, out);
  }
  return out;
}

export const trackOf = (hb: HoldingsBundle, fundId: number): HTrack | undefined => hb.tracks.find((t) => t.id === fundId);

/** The wrappers a company has tracks for in the data, for the company filter of the sheet. */
export function companiesFor(hb: HoldingsBundle, wrapperId: WrapperId): { id: string; name: string; count: number }[] {
  const counts = new Map<number, number>();
  for (const t of hb.tracks) if (t.w === wrapperId) counts.set(t.c, (counts.get(t.c) ?? 0) + 1);
  return [...counts.entries()].map(([c, count]) => ({ ...hb.companies[c]!, count })).sort((a, b) => a.name.localeCompare(b.name, "he"));
}

export function tracksFor(hb: HoldingsBundle, wrapperId: WrapperId, companyId: string): HTrack[] {
  return hb.tracks.filter((t) => t.w === wrapperId && hb.companies[t.c]!.id === companyId).sort((a, b) => a.n.localeCompare(b.n, "he"));
}

/** How a pasted text matched the tracks: by fund number, by the exact name, by part of a name, by all its words, or not at all. */
export type TrackMatchKind = "number" | "exact" | "part" | "words" | "none";

const tokensOf = (q: string): string[] => q.split(/[\s,;:()\-]+/).filter((w) => w.length >= 2);

/**
 * A name pasted from a statement against the tracks of a wrapper (flow 6): a fund number ("1377" or "קופה 1377"), else the
 * exact name, else names that contain it, else names (with their company's name) that contain every word of it.
 */
export function matchTracksKind(hb: HoldingsBundle, wrapperId: WrapperId, text: string, companyId?: string): { kind: TrackMatchKind; tracks: HTrack[] } {
  const q = normalize(text);
  const none = { kind: "none" as const, tracks: [] as HTrack[] };
  if (q.length < 2) return none;
  const pool = hb.tracks.filter((t) => t.w === wrapperId);
  const num = /^(?:קופה\s*)?#?(\d{2,7})$/.exec(q);
  if (num) {
    const byId = pool.filter((t) => t.id === Number(num[1]));
    return byId.length > 0 ? { kind: "number", tracks: byId } : none;
  }
  const inCompany = companyId ? pool.filter((t) => hb.companies[t.c]!.id === companyId) : [];
  for (const set of [inCompany, pool]) {
    const exact = set.filter((t) => normalize(t.n) === q);
    if (exact.length > 0) return { kind: "exact", tracks: exact };
  }
  for (const set of [inCompany, pool]) {
    const part = set.filter((t) => normalize(t.n).includes(q));
    if (part.length > 0) return { kind: "part", tracks: part.slice(0, 8) };
  }
  const words = tokensOf(q);
  if (words.length >= 2) {
    for (const set of [inCompany, pool]) {
      const all = set.filter((t) => {
        const hay = normalize(`${hb.companies[t.c]!.name} ${t.n}`);
        return words.every((w) => hay.includes(w));
      });
      if (all.length > 0) return { kind: "words", tracks: all.slice(0, 8) };
    }
  }
  return none;
}

export const matchTracks = (hb: HoldingsBundle, wrapperId: WrapperId, text: string, companyId?: string): HTrack[] => matchTracksKind(hb, wrapperId, text, companyId).tracks;

/**
 * The companies a typed filter points at. A filter that is part of one name is that name; a filter with extra words
 * ("הפניקס פנסיה מקיפה מסלול כללי") points at the companies whose names hold its rarest words, so the list stays and
 * the person picks. `partial` is true when only some of the words were found.
 */
export function matchCompanies<C extends { name: string }>(companies: C[], filter: string): { list: C[]; partial: boolean } {
  const q = normalize(filter);
  if (q === "") return { list: companies, partial: false };
  const direct = companies.filter((c) => normalize(c.name).includes(q));
  if (direct.length > 0) return { list: direct, partial: false };
  const words = tokensOf(q);
  if (words.length === 0) return { list: [], partial: false };
  const names = companies.map((c) => normalize(c.name));
  const weight = (w: string) => {
    const df = names.filter((n) => n.includes(w)).length;
    return df === 0 ? 0 : 1 / df;
  };
  const weights = words.map(weight);
  const scored = companies.map((c, i) => ({ c, score: words.reduce((sum, w, k) => (names[i]!.includes(w) ? sum + weights[k]! : sum), 0) })).filter((x) => x.score > 0);
  if (scored.length === 0) return { list: [], partial: false };
  const best = Math.max(...scored.map((x) => x.score));
  return { list: scored.filter((x) => x.score >= best * 0.5).sort((a, b) => b.score - a.score).slice(0, 6).map((x) => x.c), partial: true };
}

// ---------------------------------------------------------------- the context a page builds once

export interface HoldingsCtx {
  hb: HoldingsBundle;
  /** The comparison bundle: wrapper records, P-05, the rules a run reads. Absent while it loads. */
  cb: CompareBundle | null;
  /** The page's numbers (the entered values, else the site's example; never the saved goal, founder 2026-10-28), or null while the comparison bundle loads. */
  goal: { years: number; name: string; run: RunGoal } | null;
  rules: Record<string, RuleRecord>;
  today: string;
}

export function mergedRules(hb: HoldingsBundle, cb: CompareBundle | null): Record<string, RuleRecord> {
  return Object.fromEntries([...(cb?.rules ?? []), ...hb.rules].map((r) => [r.id, r]));
}

export function buildCtx(hb: HoldingsBundle, cb: CompareBundle | null, run: RunGoal | null): HoldingsCtx {
  const g: HoldingsCtx["goal"] = run ? { years: run.horizonYears, name: "", run } : null;
  return { hb, cb, goal: g, rules: mergedRules(hb, cb), today: cb?.runDate ?? hb.today };
}

// ---------------------------------------------------------------- one holding as the card reads it

export type Fit = "fits" | "no-fit" | "no-rule" | "no-goal" | "no-track";

export interface ClassReference {
  classification: string;
  /** The tracks the balance-fee mean is over, and the deposit-fee mean (those that report the fee). */
  count: SiteValue;
  countDeposit: SiteValue;
  meanBalance: SiteValue;
  medianBalance: SiteValue;
  meanDeposit: SiteValue;
  medianDeposit: SiteValue;
}

export interface FeeCost {
  total: SiteValue;
  /** F-61's value of the balance fee falling to the class mean (the fee page's what-if, same function); absent when the fee is not above it. */
  atAverage?: SiteValue;
  horizonYears: SiteValue;
  /** Exit tax is blocked (G-03): the figure is before it. */
  preTax?: { blockedBy: string };
  /** The deposits are not in the run: there was no salary to run the pension relief on. */
  depositsLeftOut?: boolean;
  /** The goal gave no return, so the site's example return (P-05) was used. */
  returnFromParameter: boolean;
}

export type FeeCostResult = { kind: "ok"; cost: FeeCost } | { kind: "no-goal" } | { kind: "unsupported" } | { kind: "needs-pf36" } | { kind: "needs-first-deposit" } | { kind: "failed"; message: string; messageHe: string; /** The rule or gap id the engine message names, for the chip after the plain words. */ code?: string };

/** The rule or gap id an engine message names, if any (never the English message itself). */
export const failureCode = (message: string | undefined): string | undefined => (message ? /\b(?:G|PF|OQ|TXH|TXK|KH|KGL|SW|PEN)-\d+\b/.exec(message)?.[0] : undefined);
const failed = (message: string): FeeCostResult => {
  const code = failureCode(message);
  return { kind: "failed", message, messageHe: failureHe(message), ...(code ? { code } : {}) };
};

export interface CapWarning {
  feeType: "balance" | "deposit";
  /** The law's maximum, a rule's figure. */
  cap: SiteValue;
  ruleId: string;
}

export interface HoldingView {
  holding: Holding;
  companyName: string;
  track?: HTrack;
  cma?: {
    classification: string;
    subSpecialization: string;
    classNames: string;
    period: SiteValue;
    avgBalance: SiteValue;
    avgDeposit: SiteValue;
    perFund: boolean;
    stale: Staleness | null;
  };
  reference?: ClassReference | null;
  fit: Fit;
  /** The P-04 row the mark came from, for the rule line. */
  fitRule?: { classification: string; minYears: SiteValue | null };
  fees: FeeCostResult;
  capWarnings: CapWarning[];
}

export const isChild = (w: WrapperId) => w === "child-savings-provident" || w === "child-savings-bank";

export function holdingName(h: Holding): string {
  return h.track?.name ?? h.typedName ?? h.company.name;
}

const sameClass = (a: string, b: string) => a.trim() === b.trim();

function referenceFor(hb: HoldingsBundle, track: HTrack, today: string): ClassReference {
  const classification = hb.classifications[track.k]!;
  const ref = referenceOfClass(cmaTracks(hb), classification, track.s);
  const countOf = (fee: "management" | "deposit") => computed(tracksBehind(ref, fee), "count", "F-68", {}, { today, about: "מספר המסלולים בסיווג שמדווחים על העמלה הזו" });
  const count = countOf("management");
  const inputs = { "המסלולים בסיווג": count, "נכון לחודש": hb.period };
  const mk = (value: number | null, unit: ValueObject["unit"], about: string): SiteValue => computed(value, unit, "F-68", inputs, { today, about });
  const m = (v: ValueObject) => (typeof v.value === "number" ? v.value : null);
  return {
    classification: track.s || track.ss || classification,
    count,
    countDeposit: countOf("deposit"),
    meanBalance: mk(m(ref.management.mean), "pct_per_year", "הממוצע של מסלולי הסיווג, מדמי הניהול מחיסכון שהרשות מפרסמת"),
    medianBalance: mk(m(ref.management.median), "pct_per_year", "החציון של מסלולי הסיווג, מדמי הניהול מחיסכון שהרשות מפרסמת"),
    meanDeposit: mk(m(ref.deposit.mean), "pct_of_deposit", "הממוצע של מסלולי הסיווג, מדמי הניהול מהפקדה שהרשות מפרסמת"),
    medianDeposit: mk(m(ref.deposit.median), "pct_of_deposit", "החציון של מסלולי הסיווג, מדמי הניהול מהפקדה שהרשות מפרסמת"),
  };
}

// ---------------------------------------------------------------- the run of a holding (F-61 with the existing balance)

const pensionFamily = new Set<WrapperId>(["pension-comprehensive", "pension-general", "provident-for-annuity"]);
const providentFamily = new Set<WrapperId>(["kupat-gemel-lehashkaa", "keren-hishtalmut"]);

/** Whether the engine can run the holding's wrapper with an existing balance: the pension ledger and the provident run (an IRA study fund has no such path yet). */
export const canRunHolding = (w: WrapperId): boolean => pensionFamily.has(w) || providentFamily.has(w);

const monthsBetweenIso = (from: string, to: string): number => {
  const [fy, fm, fd] = from.split("-").map(Number) as [number, number, number];
  const [ty, tm, td] = to.split("-").map(Number) as [number, number, number];
  return (ty - fy) * 12 + (tm - fm) - (td < fd ? 1 : 0);
};

export type HoldingPlan =
  | { ok: true; plan: RunPlan; ctx: RunContext; horizonYears: number; depositsLeftOut: boolean; returnFromParameter: boolean }
  | { ok: false; reason: "no-goal" | "unsupported" | "needs-pf36" | "needs-first-deposit" | "failed"; message?: string };

const pct = (v: ValueObject | undefined): number => (v && typeof v.value === "number" ? v.value / 100 : 0);

/**
 * The run plan of a holding under review (method F-61): the balance as it stands enters the ledger with no deposit fee,
 * no deposit-side relief and nothing counted as paid in; the fee set is the statement's (entered); the horizon, the
 * return and inflation are the goal's. Monthly deposits are added when the goal has the salary the pension relief needs.
 * `balance` and `feeBalance` replace the holding's own (the consolidation card asks "what if this balance paid that fee").
 * The fee page reads this to open `/fees?holding=<id>`.
 */
export function holdingPlan(h: Holding, cb: CompareBundle | null, goal: HoldingsCtx["goal"], rules: Record<string, RuleRecord>, over: { balance?: number; feeBalance?: number } = {}): HoldingPlan {
  if (!canRunHolding(h.wrapperId)) return { ok: false, reason: "unsupported" };
  if (!goal) return { ok: false, reason: "no-goal" };
  if (!cb) return { ok: false, reason: "failed", message: "bundle" };
  const entry = cb.wrappers.find((w) => w.id === h.wrapperId);
  if (!entry) return { ok: false, reason: "failed", message: `no wrapper record ${h.wrapperId}` };
  const g = goal.run;
  const today = cb.runDate;
  const p05 = cb.parameters.find((p) => (p as { method_id?: string }).method_id === "P-05");
  if (!p05) return { ok: false, reason: "failed", message: "P-05" };
  try {
    const monthlyOwn = typeof h.monthlyOwn?.value === "number" ? h.monthlyOwn.value : 0;
    // a study fund's employer deposit is a part of the monthly money (the engine splits goal.monthly into own and employer, F-46)
    const monthlyEmployer = h.wrapperId === "keren-hishtalmut" && typeof h.monthlyEmployer?.value === "number" ? h.monthlyEmployer.value : 0;
    const salary = g.salary;
    const hasSalary = salary !== null && salary > 0;
    const pensionLike = pensionFamily.has(h.wrapperId);
    // a pension fund and a study fund need the salary to run deposits; a kupat gemel lehashkaa does not
    const deposits = monthlyOwn + monthlyEmployer > 0 && (h.wrapperId === "kupat-gemel-lehashkaa" || hasSalary);
    const employment = g.employment ?? "employee";
    const enteredP05: Record<string, ValueObject> = {
      amount_now: enteredValue(0, p05Units.amount_now, today),
      monthly_deposit: enteredValue(deposits ? monthlyOwn + monthlyEmployer : 0, p05Units.monthly_deposit, today),
      horizon_years: enteredValue(g.horizonYears, p05Units.horizon_years, today),
    };
    if (g.returnPct !== null) enteredP05["A-01"] = enteredValue(g.returnPct, p05Units["A-01"], today);
    if (g.inflationPct !== null) enteredP05["A-02"] = enteredValue(g.inflationPct, p05Units["A-02"], today);
    const fees = { deposit: pct(h.feeDeposit), balance: over.feeBalance ?? pct(h.feeBalance), direct: pct(h.directExpenses) };
    const terms: Parameters<typeof runInputs>[2] = { fees };
    if (pensionLike) {
      const pension: NonNullable<Parameters<typeof runInputs>[2]["pension"]> = { employment };
      if (employment === "employee" && hasSalary) pension.monthlySalary = salary!;
      if (employment === "self-employed" && hasSalary) pension.annualIncome = 12 * salary!;
      terms.pension = pension;
      if (h.wrapperId !== "provident-for-annuity") terms.insurance = { rate: (g.insurancePct ?? 0) / 100 };
    }
    if (h.wrapperId === "keren-hishtalmut") {
      // the 6-year clock starts at the first deposit: months from the start of the run (negative when it began before)
      const first = h.firstDeposit?.value;
      // scenario fix 2026-10-24: "more than six years" starts the run with the wait already over
      const lock = lockYearsOf(rules, today);
      if (typeof first !== "string" && !(overSixOf(h) && lock)) return { ok: false, reason: "needs-first-deposit" };
      terms.hishtalmut = { employment, clockStartMonth: typeof first === "string" ? -monthsBetweenIso(first, today) : overSixClockStart(lock!), ...(employment === "employee" && hasSalary ? { monthlySalary: salary! } : {}), ...(employment === "employee" && deposits && monthlyEmployer > 0 ? { employerMonthly: monthlyEmployer } : {}) };
    }
    const profile = { ...(g.age === null ? {} : { ageAtStart: g.age }), ...(employment === "self-employed" && hasSalary ? { annualIncome: 12 * salary! } : {}) };
    const plan = runInputs(entry.record, [p05], terms, { entered: enteredP05 as never, profile });
    // the statement's deposits are the flat amounts it prints (scenario S42, workings Q20: "constant nominal"), not A-04's real-terms pattern for a goal's saving
    if (plan.run === "runPension" || plan.run === "runProvident") plan.input.goal.contributions = "nominal";
    const balance = over.balance ?? (h.balance.value as number);
    if (plan.run === "runPension") plan.input.existingBalance = balance;
    else if (plan.run === "runProvident") {
      plan.input.existingBalance = balance;
      const gain = h.embeddedGain?.value;
      if (h.wrapperId === "kupat-gemel-lehashkaa" && typeof gain === "number" && over.balance === undefined) plan.input.embeddedGain = Math.min(gain, balance);
    } else return { ok: false, reason: "unsupported" };
    return { ok: true, plan, ctx: { rules: Object.values(rules), runDate: today }, horizonYears: g.horizonYears, depositsLeftOut: monthlyOwn + monthlyEmployer > 0 && !deposits, returnFromParameter: g.returnPct === null };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // the study fund still inside its lock: the engine asks for the tax-layer split of the detailed statement (PF-36)
    if (/PF-36/.test(message) && h.wrapperId === "keren-hishtalmut") return { ok: false, reason: "needs-pf36", message };
    return { ok: false, reason: "failed", message };
  }
}

function feeCostOf(h: Holding, ctx: HoldingsCtx, meanBalance: SiteValue | null): FeeCostResult {
  const p = holdingPlan(h, ctx.cb, ctx.goal, ctx.rules);
  if (!p.ok) return p.reason === "failed" ? failed(p.message ?? "") : { kind: p.reason };
  try {
    const fm = feeMateriality(p.plan, p.ctx);
    const gv = goalValueObjects(ctx.cb!, ctx.goal!.run);
    const inputs: Record<string, SiteValue> = { "יתרה": h.balance as SiteValue, "שנים": gv.horizon, "אינפלציה בשנה": gv.inflation };
    if (gv.returnV) inputs["תשואה בשנה"] = gv.returnV;
    if (h.feeBalance) inputs["דמי ניהול מחיסכון"] = h.feeBalance as SiteValue;
    if (h.feeDeposit) inputs["דמי ניהול מהפקדה"] = h.feeDeposit as SiteValue;
    const usedRules = fm.run.rules.map((r) => ({ id: r.id, strength: r.strength as SiteValue["source"]["strength"] }));
    const total = computed(fm.total.value as number, "nis", "F-61", inputs, {
      today: p.ctx.runDate,
      rules: usedRules,
      flags: fm.run.flags.map((f) => f.code),
      labels: fm.run.labels.map((l) => ({ code: l.code, ruleId: l.ruleId })),
      about: "מה דמי הניהול לוקחים מהחשבון הזה עד סוף התקופה, בכסף של היום: השווי בלי דמי ניהול פחות השווי איתם",
    });
    const blocked = fm.run.outcome.code === "listed-not-ranked" && (fm.run.outcome as { reason?: string }).reason === "G-03" ? "G-03" : fm.run.flags.some((f) => f.code === "PF-36") ? "PF-36" : undefined;
    // the fee page's what-if (F-61 value of a stated reduction) with the class mean as the stated rate; nothing new is computed
    let atAverage: SiteValue | undefined;
    const feeNow = typeof h.feeBalance?.value === "number" ? h.feeBalance.value : null;
    const meanNow = meanBalance && typeof meanBalance.value === "number" ? fmt.pctShown(meanBalance.value) : null;
    if (feeNow !== null && meanNow !== null && meanNow < feeNow) {
      const r = valueOfReduction(p.plan, "balance", meanNow / 100, p.ctx);
      if ((r.value.value as number) > 0) {
        atAverage = computed(r.value.value as number, "nis", "F-61", { "דמי ניהול מחיסכון": h.feeBalance as SiteValue, "ממוצע הסיווג": meanBalance as SiteValue, "שנים": gv.horizon }, { today: p.ctx.runDate, rules: usedRules, about: "מה שווה להוריד את דמי הניהול מחיסכון לממוצע של הסיווג, בכסף של היום: השווי עם הדמי ניהול החדשים פחות השווי עכשיו" });
      }
    }
    return {
      kind: "ok",
      cost: { total, ...(atAverage ? { atAverage } : {}), horizonYears: gv.horizon, ...(blocked ? { preTax: { blockedBy: blocked } } : {}), ...(p.depositsLeftOut ? { depositsLeftOut: true } : {}), returnFromParameter: p.returnFromParameter },
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // a study fund still inside its lock: the engine asks for the tax-layer split of the detailed statement (PF-36)
    if (/PF-36/.test(message) && h.wrapperId === "keren-hishtalmut") return { kind: "needs-pf36" };
    return failed(message);
  }
}

// ---------------------------------------------------------------- caps

function capWarnings(h: Holding, ctx: HoldingsCtx): CapWarning[] {
  if (!ctx.cb || h.wrapperId === "ira-hishtalmut" || h.wrapperId === "ira-provident" || isChild(h.wrapperId)) return [];
  const family = pensionFamily.has(h.wrapperId) ? "runPension" : "runProvident";
  const plan = { run: family, input: { wrapper: h.wrapperId } } as unknown as RunPlan;
  const rc: RunContext = { rules: Object.values(ctx.rules), runDate: ctx.today };
  const out: CapWarning[] = [];
  for (const [line, field, feeType] of [["balance", h.feeBalance, "balance"], ["deposit", h.feeDeposit, "deposit"]] as const) {
    if (!field || typeof field.value !== "number") continue;
    let cap;
    try {
      cap = feeCap(plan, line, rc);
    } catch (e) {
      if (e instanceof MissingRuleError) continue;
      throw e;
    }
    const rule = cap && ctx.rules[cap.ruleId];
    const figure = cap && rule ? ruleFigure(rule, cap.figure, ctx.today) : null;
    if (cap && figure && typeof figure.value === "number" && field.value > figure.value) out.push({ feeType, cap: figure, ruleId: cap.ruleId });
  }
  return out;
}

// ---------------------------------------------------------------- the view

export function viewOf(h: Holding, ctx: HoldingsCtx): HoldingView {
  const { hb } = ctx;
  const track = h.track ? trackOf(hb, h.track.fundId) : undefined;
  const companyName = track ? hb.companies[track.c]!.name : h.company.name;
  const view: HoldingView = { holding: h, companyName, fit: "no-track", fees: { kind: "no-goal" }, capWarnings: [] };
  if (isChild(h.wrapperId)) {
    view.fit = track ? fitFor(track, ctx, view) : "no-track";
    if (track) attachCma(view, track, ctx);
    return view;
  }
  if (track) {
    attachCma(view, track, ctx);
    view.fit = fitFor(track, ctx, view);
    view.reference = referenceFor(hb, track, ctx.today);
  }
  view.fees = feeCostOf(h, ctx, view.reference && (view.reference.count.value as number) > 0 ? view.reference.meanBalance : null);
  view.capWarnings = capWarnings(h, ctx);
  return view;
}

function attachCma(view: HoldingView, track: HTrack, ctx: HoldingsCtx) {
  const f = trackFees(ctx.hb, track);
  view.track = track;
  view.cma = {
    classification: track.s || track.ss || "",
    subSpecialization: track.ss,
    classNames: ctx.hb.classifications[track.k]!,
    period: ctx.hb.period,
    avgBalance: f.balance,
    avgDeposit: f.deposit,
    perFund: track.d === 1,
    stale: ctx.hb.period.stale ?? null,
  };
}

function fitFor(track: HTrack, ctx: HoldingsCtx, view: HoldingView): Fit {
  if (!ctx.goal) return "no-goal";
  const r = fitOf(ctx.hb.fit, { specialization: track.s, subSpecialization: track.ss, classification: ctx.hb.classifications[track.k]! }, ctx.goal.years);
  view.fitRule = { classification: r.classification, minYears: r.kind === "no-rule" ? null : r.minYears };
  return r.kind;
}

// ---------------------------------------------------------------- consolidation (F-72)

export type Outcome = "allowed" | "allowed-separate-account" | "not-allowed" | "not-sourced" | "blocked";

export interface ConsolidationGroup {
  wrapperId: WrapperId;
  wrapperName: string;
  holdingIds: string[];
  outcome: Outcome;
  /** All the group's holdings are at one manager: a merger of accounts is the manager's process (PF-18). */
  sameManager: boolean;
  route?: { ruleIds: string[]; condition?: string };
  conditionRules: string[];
  /** A hishtalmut account that is not yet liquid: from when it is (TXH-09). */
  notYet?: { holdingId: string; liquidFrom: SiteValue; ruleIds: string[] };
  /** A study fund that is not yet liquid moves whole as a separate account (SW-39). */
  separate?: { ruleIds: string[] };
  missingFirstDeposit?: string[];
  /** The holding the others would move into (the lowest entered balance fee) and its mark. */
  target?: { holdingId: string; fit: Fit };
  /** F-61's value of moving the other balances into the target's fee, real; absent when it was not computed. */
  worth?: SiteValue;
  /** `true` when the target has the same or a higher fee (consolidating saves nothing on fees). */
  noSaving: boolean;
  worthUnavailable?: "unsupported" | "no-goal" | "failed";
  costRules: string[];
  openQuestion?: string;
}

const addMonthsIso = (iso: string, months: number) => {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1 + months, d)).toISOString().slice(0, 10);
};

/** TXH-09: the clock runs from the first payment date, the end of the month of the first payment (or the month it was for); the wait ends `months` later, at a month end (review fix 2026-10-24). */
const monthEndAfter = (iso: string, months: number) => {
  const [y, m] = iso.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1 + months + 1, 0)).toISOString().slice(0, 10);
};

const feeOf = (h: Holding) => (typeof h.feeBalance?.value === "number" ? h.feeBalance.value : null);

const costRulesFor = (wrapperId: WrapperId): string[] => (wrapperId === "keren-hishtalmut" ? ["PF-19", "TXH-19", "PF-14", "SW-15"] : wrapperId === "kupat-gemel-lehashkaa" ? ["PF-19", "TXK-04", "PF-14", "SW-15"] : ["PF-19", "PF-14", "SW-15"]);

export function consolidationGroups(views: HoldingView[], ctx: HoldingsCtx): ConsolidationGroup[] {
  if (!ctx.cb) return [];
  const byType = new Map<WrapperId, HoldingView[]>();
  for (const v of views) {
    if (isChild(v.holding.wrapperId)) continue;
    byType.set(v.holding.wrapperId, [...(byType.get(v.holding.wrapperId) ?? []), v]);
  }
  const wrappers = ctx.cb.wrappers.map((w) => w.record);
  const age = ctx.goal?.run.age ?? null;
  const retirementAge = ctx.rules["PEN-26"] ? ruleFigure(ctx.rules["PEN-26"], "retirement_age_men", ctx.today) : null;
  const atRetirementAge = age !== null && retirementAge !== null && typeof retirementAge.value === "number" && age >= retirementAge.value;
  const out: ConsolidationGroup[] = [];
  const rc: RunContext = { rules: Object.values(ctx.rules), runDate: ctx.today };
  for (const [wrapperId, list] of byType) {
    if (list.length < 2) continue;
    const wrapperName = ctx.hb.wrappers.find((w) => w.id === wrapperId)?.name ?? wrapperId;
    const manager = (v: HoldingView) => v.holding.company.legalId ?? v.companyName;
    const managers = new Set(list.map(manager));
    const sameManager = managers.size === 1;
    const base = { wrapperId, wrapperName, holdingIds: list.map((v) => v.holding.id), sameManager, conditionRules: [] as string[], costRules: costRulesFor(wrapperId), noSaving: false };
    if (sameManager) {
      out.push({ ...base, outcome: "not-sourced" });
      continue;
    }
    const engineHoldings: EngineHolding[] = list.map((v) => ({
      id: v.holding.id,
      wrapper: wrapperId,
      manager: manager(v),
      ...(typeof v.holding.firstDeposit?.value === "string" ? { firstDepositDate: v.holding.firstDeposit.value } : overSixOf(v.holding) && lockYearsOf(ctx.rules, ctx.today) ? { firstDepositDate: addMonthsIso(ctx.today, -12 * (lockYearsOf(ctx.rules, ctx.today)!.value as number)) } : {}),
      ...(atRetirementAge ? { atRetirementAge: true } : {}),
      ...Object.fromEntries(Object.entries(v.holding.bars ?? {}).filter(([, on]) => on)),
    }));
    let pairs: ConsolidationPair[] = [];
    try {
      pairs = runConsolidation(engineHoldings, { wrappers, ctx: rc }).pairs.filter((p) => manager(list.find((v) => v.holding.id === p.a)!) !== manager(list.find((v) => v.holding.id === p.b)!));
    } catch (e) {
      out.push({ ...base, outcome: "not-sourced", openQuestion: e instanceof Error ? e.message : undefined });
      continue;
    }
    const kinds = pairs.map((p) => (p.result as { kind: string }).kind);
    const allowed = pairs.find((p) => p.result.kind === "allowed")?.result;
    const sep = pairs.find((p) => p.result.kind === "allowed-separate-account");
    const notAllowed = pairs.find((p) => p.result.kind === "not-allowed");
    const missing = pairs.filter((p) => p.result.kind === "missing-input");
    const group: ConsolidationGroup = { ...base, outcome: "not-sourced" };
    const record = wrappers.find((w) => w.id === wrapperId);
    const route = record?.transfer_routes.find((r) => r.to === wrapperId);
    if (allowed && allowed.kind === "allowed") {
      group.outcome = "allowed";
      group.route = { ruleIds: allowed.ruleIds, ...(allowed.condition ? { condition: allowed.condition } : {}) };
      group.conditionRules = allowed.ruleIds;
    } else if (sep && sep.result.kind === "allowed-separate-account") {
      // SW-39: a study fund not yet liquid moves whole as a separate account; the accounts merge once both are liquid (PF-18)
      group.outcome = "allowed-separate-account";
      group.route = { ruleIds: route?.rule_ids ?? [] };
      group.conditionRules = route?.rule_ids ?? [];
      group.separate = { ruleIds: sep.result.ruleIds };
      let latest: { holdingId: string; from: string; first: ValueObject; months: number; rule: string } | null = null;
      for (const n of sep.result.notLiquid) {
        const v = list.find((x) => x.holding.id === n.holding);
        const first = v?.holding.firstDeposit;
        if (!v || !first || typeof first.value !== "string") continue;
        const from = monthEndAfter(first.value, n.monthsNeeded);
        if (!latest || from > latest.from) latest = { holdingId: v.holding.id, from, first, months: n.monthsNeeded, rule: n.lockRule };
      }
      if (latest) {
        const years = computed(latest.months / 12, "years", "F-72", {}, { today: ctx.today, about: "שנים עד שהכסף בקרן נזיל ופטור ממס", rules: [{ id: latest.rule, strength: "primary" }] });
        group.notYet = {
          holdingId: latest.holdingId,
          liquidFrom: { ...computed(null, "text", "F-72", { "תאריך ההפקדה הראשונה": latest.first as SiteValue, "שנים עד שהכסף נזיל": years }, { today: ctx.today, about: "מתי החשבון נזיל: ההפקדה הראשונה ועוד התקופה שהחוק קובע", rules: [{ id: latest.rule, strength: "primary" }] }), value: latest.from },
          ruleIds: ["PF-18", latest.rule],
        };
      }
    } else if (notAllowed && notAllowed.result.kind === "not-allowed") {
      group.outcome = "not-allowed";
      group.route = { ruleIds: notAllowed.result.ruleIds };
      group.conditionRules = route?.rule_ids ?? notAllowed.result.ruleIds;
    } else if (missing.length > 0) {
      group.outcome = "not-sourced";
      group.missingFirstDeposit = [...new Set(missing.map((p) => (p.result as { holding: string }).holding))];
      group.route = { ruleIds: route?.rule_ids ?? [] };
      group.conditionRules = route?.rule_ids ?? [];
    } else if (kinds.includes("transfer-rules-not-sourced")) {
      group.outcome = "not-sourced";
    }
    if (group.outcome === "allowed" || group.outcome === "allowed-separate-account" || group.outcome === "not-allowed") worthOf(group, list, ctx);
    out.push(group);
  }
  return out;
}

/** The target is the holding with the lowest entered balance fee; the worth is F-61's value of moving each dearer balance to that fee (method F-61 "value of a stated reduction"). */
function worthOf(group: ConsolidationGroup, list: HoldingView[], ctx: HoldingsCtx) {
  const withFee = list.filter((v) => feeOf(v.holding) !== null);
  if (withFee.length < 2) return;
  const target = withFee.reduce((a, b) => (feeOf(b.holding)! < feeOf(a.holding)! ? b : a));
  group.target = { holdingId: target.holding.id, fit: target.fit };
  const targetFee = feeOf(target.holding)!;
  const movers = withFee.filter((v) => v.holding.id !== target.holding.id && feeOf(v.holding)! > targetFee);
  if (movers.length === 0) {
    group.noSaving = true;
    return;
  }
  if (!canRunHolding(group.wrapperId)) {
    group.worthUnavailable = "unsupported";
    return;
  }
  if (!ctx.goal) {
    group.worthUnavailable = "no-goal";
    return;
  }
  let sum = 0;
  const inputs: Record<string, SiteValue> = {};
  for (const v of movers) {
    const p = holdingPlan(v.holding, ctx.cb, ctx.goal, ctx.rules);
    if (!p.ok) {
      group.worthUnavailable = "failed";
      return;
    }
    try {
      const r = valueOfReduction(p.plan, "balance", targetFee / 100, p.ctx);
      sum += r.value.value as number;
      inputs[`יתרה ב${v.companyName}`] = v.holding.balance as SiteValue;
    } catch {
      group.worthUnavailable = "failed";
      return;
    }
  }
  inputs["דמי ניהול מחיסכון ב" + target.companyName] = target.holding.feeBalance as SiteValue;
  inputs["שנים"] = goalValueObjects(ctx.cb!, ctx.goal.run).horizon;
  group.worth = computed(sum, "nis", "F-61", inputs, {
    today: ctx.today,
    about: "מה שווה להעביר את היתרות לדמי הניהול של המסלול הזול יותר: השווי בכסף של היום עם דמי הניהול החדשים פחות השווי עכשיו",
    rules: [{ id: "PF-17", strength: "primary" }],
  });
}

/** The holding as the fee page reads it from the device (design-spec 11.2, `/fees?holding=<id>`). Null until the device is read, or when it holds no such id. */
export function useHolding(id: string | null): { ready: boolean; holding: Holding | null } {
  const snap = useStateStore();
  return { ready: snap.ready, holding: id ? (sortedHoldings(snap.state.holdings).find((h) => h.id === id) ?? null) : null };
}

// ---------------------------------------------------------------- scenario fix 2026-10-24: liquidity of a study fund, fee prefill

/**
 * "The first deposit was more than six years ago", stored beside `firstDeposit` as an entered true. It lives here until
 * `Holding` in state.ts declares it (requests.md, sc-holdings); the state check keeps keys it does not know.
 */
export interface OverSix {
  firstDepositOverSix?: ValueObject;
}
export const overSixOf = (h: Holding): boolean => (h as Holding & OverSix).firstDepositOverSix?.value === true;

const addMonths = (iso: string, months: number): string => new Date(Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1 + months, Number(iso.slice(8, 10)))).toISOString().slice(0, 10);

/** The wait for a tax-free study-fund withdrawal, TXH-09's `lock_years`; null when the rule or its figure is not in the rule base. */
export function lockYearsOf(rules: Record<string, RuleRecord>, today: string): SiteValue | null {
  const r = rules["TXH-09"];
  const f = r ? ruleFigure(r, "lock_years", today) : null;
  return f && typeof f.value === "number" ? f : null;
}

export type Liquidity =
  /** `from` is the date it became liquid (first deposit plus the wait); null when only the checkbox says so. */
  | { kind: "liquid"; from: SiteValue | null; lock: SiteValue }
  | { kind: "not-yet"; from: SiteValue; lock: SiteValue }
  /** A study fund with neither a first-deposit date nor the checkbox. */
  | { kind: "unknown" }
  /** TXH-09's figure is not in the rule base: nothing is derived. */
  | { kind: "no-rule" };

/**
 * Whether a study fund can be withdrawn tax-free: six years (TXH-09) after the first deposit, the same test and the same
 * month arithmetic as the consolidation card's `notYet`. The checkbox says "more than six years" and stands for the date.
 * Other products have no such wait: null.
 */
export function liquidityOf(h: Holding, rules: Record<string, RuleRecord>, today: string): Liquidity | null {
  if (h.wrapperId !== "keren-hishtalmut") return null;
  const first = h.firstDeposit?.value;
  const hasDate = typeof first === "string" && /^\d{4}-\d{2}-\d{2}$/.test(first);
  if (!hasDate && !overSixOf(h)) return { kind: "unknown" };
  const lock = lockYearsOf(rules, today);
  if (!lock) return { kind: "no-rule" };
  if (!hasDate) return { kind: "liquid", from: null, lock };
  const months = (lock.value as number) * 12;
  const from = monthEndAfter(first as string, months);
  const years = computed(lock.value as number, "years", "F-72", {}, { today, about: "שנים עד שהכסף בקרן נזיל ופטור ממס", rules: [{ id: "TXH-09", strength: "primary" }] });
  const date: SiteValue = {
    ...computed(null, "text", "F-72", { "תאריך ההפקדה הראשונה": h.firstDeposit as SiteValue, "שנים עד שהכסף נזיל": years }, { today, about: "מתי הקרן נזילה: ההפקדה הראשונה ועוד התקופה שהחוק קובע", rules: [{ id: "TXH-09", strength: "primary" }] }),
    value: from,
  };
  return from <= today ? { kind: "liquid", from: date, lock } : { kind: "not-yet", from: date, lock };
}

/** The months of an account's age the run starts from: the checkbox stands for exactly the wait (the run only needs "already liquid"). */
export const overSixClockStart = (lock: SiteValue): number => -Math.round((lock.value as number) * 12);

/** The track's two published fee averages, as sourced values, when the regulator has a number for them. */
export function prefillFees(hb: HoldingsBundle, d: Pick<Draft, "fundId" | "wrapperId">): { balance: SiteValue | null; deposit: SiteValue | null } {
  const none = { balance: null, deposit: null };
  if (d.fundId === null || d.wrapperId === null || isChild(d.wrapperId)) return none;
  const t = trackOf(hb, d.fundId);
  if (!t) return none;
  const f = trackFees(hb, t);
  const ok = (v: SiteValue) => (typeof v.value === "number" ? v : null);
  return { balance: ok(f.balance), deposit: ok(f.deposit) };
}

// ---------------------------------------------------------------- the add sheet

export interface Draft {
  wrapperId: WrapperId | null;
  /** "provident" or "bank": for the child plan's wrapper. */
  childRoute: "provident" | "bank" | null;
  companyId: string | null;
  companyName: string;
  fundId: number | null;
  typedName: string;
  balance: number | null;
  feeBalance: number | null;
  feeDeposit: number | null;
  directExpenses: number | null;
  monthlyOwn: number | null;
  monthlyEmployer: number | null;
  embeddedGain: number | null;
  bars: Partial<Record<TransferBar, boolean>>;
  firstDeposit: string;
  /** scenario fix 2026-10-24: "the first deposit was more than six years ago" in place of the exact date (a study fund). */
  firstDepositOver: boolean;
  statementDate: string;
}

export const emptyDraft = (): Draft => ({ wrapperId: null, childRoute: null, companyId: null, companyName: "", fundId: null, typedName: "", balance: null, feeBalance: null, feeDeposit: null, directExpenses: null, monthlyOwn: null, monthlyEmployer: null, embeddedGain: null, bars: {}, firstDeposit: "", firstDepositOver: false, statementDate: "" });

export function draftOf(h: Holding, hb?: HoldingsBundle): Draft {
  const n = (v?: ValueObject) => (typeof v?.value === "number" ? v.value : null);
  // scenario fix 2026-10-24: a fee saved as the regulator's average (sourced) is a prefill again when the holding is edited, not an entered number
  const own = (v?: ValueObject) => (v?.state === "sourced" && hb && h.track && trackOf(hb, h.track.fundId) ? null : n(v));
  const s = (v?: ValueObject) => (typeof v?.value === "string" ? v.value : "");
  return {
    wrapperId: h.wrapperId,
    childRoute: h.child?.route ?? null,
    companyId: h.company.legalId ?? null,
    companyName: h.company.name,
    fundId: h.track?.fundId ?? null,
    typedName: h.typedName ?? "",
    balance: n(h.balance),
    feeBalance: own(h.feeBalance),
    feeDeposit: own(h.feeDeposit),
    directExpenses: n(h.directExpenses),
    monthlyOwn: n(h.monthlyOwn),
    monthlyEmployer: n(h.monthlyEmployer),
    embeddedGain: n(h.embeddedGain),
    bars: { ...(h.bars ?? {}) },
    firstDeposit: s(h.firstDeposit),
    firstDepositOver: overSixOf(h),
    statementDate: s(h.statementDate),
  };
}

export type DraftError = {
  field: keyof Draft | "track";
  code: "balance-negative" | "percent-over" | "statement-future" | "first-future" | "first-after-statement" | "no-track" | "required" | "gain-over-balance" | "invalid";
};

/**
 * The checks of the sheet's "שמירה" (design-spec 13): balance at least zero, percents 0 to 100, no date in the future.
 * "מהפקדה" is optional (a fund with no deposits prints no such line; empty is saved as 0). Each failure has its own code,
 * so the sheet says what is wrong with the field and not only that it is.
 */
export function checkDraft(d: Draft, today: string, hb?: HoldingsBundle): DraftError[] {
  const errors: DraftError[] = [];
  if (d.wrapperId === null) errors.push({ field: "wrapperId", code: "required" });
  if (d.balance === null) errors.push({ field: "balance", code: "required" });
  else if (d.balance < 0) errors.push({ field: "balance", code: "balance-negative" });
  const child = d.wrapperId === "child-savings-provident" || d.wrapperId === "child-savings-bank";
  if (!child) {
    for (const f of ["feeBalance", "feeDeposit", "directExpenses"] as const) {
      const v = d[f];
      // scenario fix 2026-10-24: the field is required only when the regulator's average for the picked track could not fill it
      if (f === "feeBalance" && v === null) {
        if (!(hb && prefillFees(hb, d).balance)) errors.push({ field: f, code: "required" });
      }
      else if (v !== null && (v < 0 || v > 100)) errors.push({ field: f, code: "percent-over" });
    }
  }
  if (d.embeddedGain !== null && d.embeddedGain < 0) errors.push({ field: "embeddedGain", code: "balance-negative" });
  else if (d.embeddedGain !== null && d.balance !== null && d.embeddedGain > d.balance) errors.push({ field: "embeddedGain", code: "gain-over-balance" });
  for (const f of ["monthlyOwn", "monthlyEmployer"] as const) if (d[f] !== null && d[f]! < 0) errors.push({ field: f, code: "balance-negative" });
  if (!d.statementDate) errors.push({ field: "statementDate", code: "required" });
  else if (d.statementDate > today) errors.push({ field: "statementDate", code: "statement-future" });
  if (d.firstDeposit && d.firstDeposit > today) errors.push({ field: "firstDeposit", code: "first-future" });
  else if (d.firstDeposit && d.statementDate && d.firstDeposit > d.statementDate) errors.push({ field: "firstDeposit", code: "first-after-statement" });
  if (d.wrapperId !== null) {
    if (!d.companyName.trim() && !d.companyId) errors.push({ field: "track", code: "no-track" });
    else if (d.fundId === null && !d.typedName.trim() && !child) errors.push({ field: "track", code: "no-track" });
  }
  return errors;
}

/** A track typed or pasted as exactly one track's name or fund number is that track: the draft links to it on save (audit A17). */
export function autoLink(hb: HoldingsBundle, d: Draft): Draft {
  if (d.fundId !== null || d.wrapperId === null || !d.typedName.trim()) return d;
  const wrapper: WrapperId = d.wrapperId === "child-savings-provident" || d.wrapperId === "child-savings-bank" ? (d.childRoute === "bank" ? "child-savings-bank" : "child-savings-provident") : d.wrapperId;
  if (wrapper === "child-savings-bank") return d;
  const m = matchTracksKind(hb, wrapper, d.typedName, d.companyId ?? undefined);
  if ((m.kind !== "exact" && m.kind !== "number") || m.tracks.length !== 1) return d;
  const t = m.tracks[0]!;
  const co = hb.companies[t.c]!;
  return { ...d, fundId: t.id, typedName: "", companyId: co.id, companyName: co.name };
}

/** The draft as a holding: every figure an `entered` value object, dated today. */
export function holdingOf(d: Draft, hb: HoldingsBundle, today: string, existing?: Holding, id?: string): Holding & OverSix {
  const track = d.fundId !== null ? trackOf(hb, d.fundId) : undefined;
  const wrapperId: WrapperId = d.wrapperId === "child-savings-provident" || d.wrapperId === "child-savings-bank" ? (d.childRoute === "bank" ? "child-savings-bank" : "child-savings-provident") : d.wrapperId!;
  const child = isChild(wrapperId);
  const company = track ? { name: hb.companies[track.c]!.name, legalId: hb.companies[track.c]!.id } : { name: d.companyName.trim(), ...(d.companyId ? { legalId: d.companyId } : {}) };
  const e = (v: number, unit: ValueObject["unit"]) => enteredValue(v, unit, today) as ValueObject;
  const text = (v: string) => ({ ...enteredValue(0, "text", today), value: v }) as ValueObject;
  // scenario fix 2026-10-24: an empty fee takes the regulator's average for the track, kept as the sourced value with its source
  const pre = prefillFees(hb, d);
  return {
    id: existing?.id ?? id ?? `h${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    wrapperId,
    company,
    ...(track ? { track: { fundId: track.id, name: track.n } } : {}),
    ...(!track && d.typedName.trim() ? { typedName: d.typedName.trim() } : {}),
    balance: e(d.balance ?? 0, "nis"),
    ...(!child && d.feeBalance !== null ? { feeBalance: e(d.feeBalance, "pct_per_year") } : !child && pre.balance ? { feeBalance: pre.balance } : {}),
    ...(!child ? { feeDeposit: d.feeDeposit !== null ? e(d.feeDeposit, "pct_of_deposit") : (pre.deposit ?? e(0, "pct_of_deposit")) } : {}),
    ...(!child && d.directExpenses !== null ? { directExpenses: e(d.directExpenses, "pct_per_year") } : {}),
    ...(!child && d.monthlyOwn !== null ? { monthlyOwn: e(d.monthlyOwn, "nis_per_month") } : {}),
    ...(!child && d.monthlyEmployer !== null ? { monthlyEmployer: e(d.monthlyEmployer, "nis_per_month") } : {}),
    ...(wrapperId === "kupat-gemel-lehashkaa" && d.embeddedGain !== null ? { embeddedGain: e(d.embeddedGain, "nis") } : {}),
    ...(Object.values(d.bars).some(Boolean) && !child ? { bars: Object.fromEntries(Object.entries(d.bars).filter(([, on]) => on)) as Holding["bars"] } : {}),
    ...(wrapperId === "keren-hishtalmut" && d.firstDeposit && !d.firstDepositOver ? { firstDeposit: text(d.firstDeposit) } : {}),
    ...(wrapperId === "keren-hishtalmut" && d.firstDepositOver ? { firstDepositOverSix: { ...enteredValue(0, "boolean", today), value: true } as ValueObject } : {}),
    statementDate: text(d.statementDate),
    ...(child ? { child: { route: wrapperId === "child-savings-bank" ? ("bank" as const) : ("provident" as const) } } : {}),
    ...(existing?.importedAt ? { importedAt: existing.importedAt } : {}),
    order: existing?.order ?? 0,
  };
}

export { fmt };
