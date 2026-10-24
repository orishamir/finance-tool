// The saved comparison and its revisit (release 5, flow 35, design-spec 21.5 and 23). "בחרתי בזה" and "לשמור את
// ההשוואה" freeze the versions a run rested on (the engine's `saveComparison`); a later visit re-runs the saved goal
// at today's bundle and lists what differs (`diffVersions`) with whether the top option and the tie set held.
//
// The engine's `revisit` covers wrapper mode by calling `buildCandidateSet`. The site re-runs through its own
// `evaluate` instead (and, for exposure mode, `computeExposureMode`), because the site's reading of D9 ("a run that
// rests on a return the person has not entered is not evaluated") is applied after the engine's set is built; the
// engine's own re-run would rank those wrappers at P-05's starting return and report a change that is not one.
// The diff, the result shape and the value changes are the engine's pieces (`diffVersions`, `resultOf`).
import {
  assumptionVersions,
  diffVersions,
  parameterVersions,
  resultOf,
  ruleFigureVersion,
  saveComparison,
  type AssumptionVersion,
  type CandidateSet,
  type ComparisonResult,
  type DiffKind,
  type VersionDiff,
  type Versions,
} from "@finance-tool/engine";
import type { ValueObject } from "@finance-tool/schema";
import { parametersPage, r2, r5 } from "../copy";
import { applyProviders, comparisonGoal, evaluate, type CompareBundle, type RunGoal } from "./compare";
import { computeExposureMode, type ExposureResultView } from "./exposure-mode";
import type { Goal } from "./goal";
import { isReadableSaved, type CompareMode, type SavedComparisonRecord } from "./state";
import type { SiteValue } from "./value";

const WRAPPER_PARAMETERS = ["P-01", "P-02", "P-05"];
const EXPOSURE_PARAMETERS = ["P-01", "P-05", "P-08"];

const idOf = (p: unknown) => (p as { method_id?: string }).method_id ?? "";

/** The parameters a mode's runs read (the rest of the bundle's records are the form's). */
function parametersFor(bundle: CompareBundle, mode: CompareMode): unknown[] {
  const wanted = mode === "wrapper" ? WRAPPER_PARAMETERS : EXPOSURE_PARAMETERS;
  return bundle.parameters.filter((p) => wanted.includes(idOf(p)));
}

/** The data files a mode's runs read: the records of the wrappers (or exposures and their holding wrappers) and the fee snapshots. */
function dataFor(bundle: CompareBundle, mode: CompareMode, exposureWrappers: readonly string[]): { path: string; checked: string | null }[] {
  const files = bundle.dataFiles ?? [];
  const exposureIds = new Set((bundle.exposures ?? []).map((e) => e.record.id));
  return files
    .filter((f) => {
      const isExposure = f.path.startsWith("data/instruments/exposures/");
      if (mode === "wrapper") return !isExposure;
      if (isExposure || f.for.length === 0) return true;
      return f.for.some((id) => exposureIds.has(id) || exposureWrappers.includes(id));
    })
    .map((f) => ({ path: f.path, checked: f.checked }));
}

const stateOfVo = (v: ValueObject): AssumptionVersion["state"] => v.state;

/** Exposure mode's assumptions beyond A-02: each exposure's return (A-01), the worst falls and the accepted falls (A-29). */
export function exposureAssumptions(view: ExposureResultView, goal: Goal): AssumptionVersion[] {
  const out: AssumptionVersion[] = [];
  for (const [id, r] of Object.entries(view.returns)) out.push({ id: `A-01:${id}`, value: r.value, state: stateOfVo(r) });
  for (const [id, f] of Object.entries(view.lossFilter.worstFall)) if (f) out.push({ id: `A-29:worst:${id}`, value: f.value, state: stateOfVo(f) });
  if (view.lossFilter.acceptedFall) out.push({ id: "A-29", value: view.lossFilter.acceptedFall.value, state: "entered" });
  for (const [id, f] of Object.entries(view.lossFilter.acceptedFallById ?? {})) if (f) out.push({ id: `A-29:accepted:${id}`, value: f.value, state: stateOfVo(f) });
  void goal;
  return out;
}

const newId = () => `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** The goal the exposure runs take: its own `grossReturnPct` is ignored by the engine, so it is left out of the saved assumptions. */
const exposureGoal = (g: RunGoal) => comparisonGoal({ ...g, returnPct: null });

// ---------------------------------------------------------------- saving

export interface SaveArgs {
  bundle: CompareBundle;
  g: RunGoal;
  goal: Goal;
  site: { version: string; data: string };
  today: string;
  choice?: { id: string; name: string };
}

/** Wrapper mode: the record of the comparison on screen. */
export function snapshotWrapper(a: SaveArgs & { ev: ReturnType<typeof evaluate> }): SavedComparisonRecord {
  const { bundle, ev } = a;
  const saved = saveComparison({
    inputs: { ...ev.inputs, parameters: parametersFor(bundle, "wrapper") },
    // the set as the person saw it (the site's D9 override applied), so only the rules of the runs that ranked are read
    set: { ...ev.set, candidates: ev.candidates } as CandidateSet,
    ranking: ev.ranking,
    ctx: ev.ctx,
    dataFiles: dataFor(bundle, "wrapper", []),
  });
  return record(a, "wrapper", saved, ev.inputs.wrappers.map((w) => (w.record as { id: string }).id), bundle.tier2.map((t) => t.id));
}

/** Exposure mode: the same shape, with the loss filter, the returns and the holding wrappers in `exposure`. */
export function snapshotExposure(a: SaveArgs & { view: ExposureResultView }): SavedComparisonRecord {
  const { bundle, view, g, goal } = a;
  const holding = Object.values(view.holding);
  const saved = saveComparison({
    inputs: { wrappers: [], tier2: [], parameters: parametersFor(bundle, "exposure"), goal: exposureGoal(g) },
    set: { candidates: view.comparison.candidates } as unknown as CandidateSet,
    ranking: view.comparison.ranking,
    ctx: view.ctx,
    dataFiles: dataFor(bundle, "exposure", holding),
    extraAssumptions: exposureAssumptions(view, goal),
  });
  const rec = record(a, "exposure", saved, holding, []);
  rec.exposure = {
    lossFilter: { worstFall: Object.fromEntries(Object.entries(view.lossFilter.worstFall).filter(([, v]) => v) as [string, ValueObject][]), ...(view.lossFilter.acceptedFall ? { acceptedFall: view.lossFilter.acceptedFall } : {}), ...(view.lossFilter.acceptedFallById ? { acceptedFallById: Object.fromEntries(Object.entries(view.lossFilter.acceptedFallById).filter(([, v]) => v) as [string, ValueObject][]) } : {}) },
    returns: view.returns,
    holding: view.holding,
  };
  return rec;
}

function record(a: SaveArgs, mode: CompareMode, saved: { rules: Versions["rules"]; parameters: Versions["parameters"]; data: Versions["data"]; assumptions: Versions["assumptions"]; result: ComparisonResult }, wrapperIds: string[], tier2Ids: string[]): SavedComparisonRecord {
  return {
    id: newId(),
    goalId: a.goal.id,
    mode,
    savedOn: a.today,
    site: a.site,
    goal: structuredClone(a.goal),
    run: a.g,
    wrapperIds: [...new Set(wrapperIds)],
    tier2Ids,
    versions: { rules: saved.rules, parameters: saved.parameters, data: saved.data, assumptions: saved.assumptions },
    result: saved.result,
    ...(a.choice ? { choice: a.choice } : {}),
  };
}

// ---------------------------------------------------------------- the revisit view

export type RevisitStatus = "computing" | "unchanged" | "changed" | "cannot-run" | "unreadable";
export type Rendered = { kind: "num"; value: SiteValue } | { kind: "table"; rows: { upTo: number | null; rate: number }[] } | { kind: "text"; text: string; entered?: boolean } | null;

export interface DiffRowView {
  kind: DiffKind;
  key: string;
  /** A rule's id, a parameter's method id or a data file's id, for the code beside the words. */
  code: string;
  label: string;
  href?: string;
  old: Rendered;
  new: Rendered;
  oldChecked?: string | null;
  newChecked?: string | null;
  removed: boolean;
  added: boolean;
  /** An entry whose only difference is its `checked` date: the file was re-checked and its values did not change. */
  recheckedOnly: boolean;
  /** An assumption that was a parameter and is now the person's own (or the reverse). */
  stateChange?: boolean;
}

export interface ValueChange {
  id: string;
  name: string;
  before: { real: number; nominal: number } | null;
  after: { real: number; nominal: number } | null;
}

/** One input of the goal that differs from the goal the comparison was saved for (audit 2026-10-24, A30). */
export interface GoalChange {
  field: "preset" | "horizonYears" | "amountNow" | "monthly" | "available" | "anytime" | "return" | "inflation" | "insurance" | "acceptedFall" | "age" | "employment" | "salary" | "pension" | "hishtalmut" | "exposures";
  /** The numbers, when the field is one number on each side; otherwise only the field is named. */
  values?: { before: number; after: number; unit: "years" | "nis" | "nis_per_month" | "pct" };
}

const exposureValues = (g: Goal) => Object.fromEntries(Object.entries(g.exposures ?? {}).map(([id, i]) => [id, { return: i.return?.value ?? null, worstFall: i.worstFall?.value ?? null, acceptedFall: i.acceptedFall?.value ?? null }]));

/**
 * What the person changed in the goal since the comparison was saved: the saved record keeps the goal by value, the
 * current goal is the device's. Names, order and the import tag are not inputs. Empty when the inputs are the same.
 */
export function goalChanges(saved: Goal, now: Goal): GoalChange[] {
  const out: GoalChange[] = [];
  const num = (field: GoalChange["field"], a: number | null | undefined, b: number | null | undefined, unit: NonNullable<GoalChange["values"]>["unit"]) => {
    const x = a ?? null;
    const y = b ?? null;
    if (x === y) return;
    out.push({ field, ...(x !== null && y !== null ? { values: { before: x, after: y, unit } } : {}) });
  };
  if (saved.preset !== now.preset) out.push({ field: "preset" });
  num("horizonYears", saved.horizonYears?.value, now.horizonYears?.value, "years");
  num("amountNow", saved.amountNow?.value, now.amountNow?.value, "nis");
  num("monthly", saved.monthly?.value, now.monthly?.value, "nis_per_month");
  num("available", saved.available?.value, now.available?.value, "nis");
  if ((saved.anytime?.value ?? false) !== (now.anytime?.value ?? false)) out.push({ field: "anytime" });
  num("return", saved.assumptions?.return, now.assumptions?.return, "pct");
  num("inflation", saved.assumptions?.inflation, now.assumptions?.inflation, "pct");
  num("insurance", saved.assumptions?.insurance, now.assumptions?.insurance, "pct");
  num("acceptedFall", saved.assumptions?.acceptedFall, now.assumptions?.acceptedFall, "pct");
  num("age", saved.profile?.age, now.profile?.age, "years");
  if ((saved.profile?.employment ?? null) !== (now.profile?.employment ?? null)) out.push({ field: "employment" });
  num("salary", saved.profile?.salary, now.profile?.salary, "nis");
  if (!isSame(saved.profile?.pension, now.profile?.pension)) out.push({ field: "pension" });
  if (!isSame(saved.profile?.hishtalmut, now.profile?.hishtalmut)) out.push({ field: "hishtalmut" });
  if (!isSame(exposureValues(saved), exposureValues(now))) out.push({ field: "exposures" });
  return out;
}

export interface RevisitView {
  /** Set by the hook when the current goal's inputs differ from the saved goal's: the saved comparison is then not about this goal. */
  goalChanges?: GoalChange[];
  status: RevisitStatus;
  savedOn: string;
  mode: CompareMode;
  choice?: SavedComparisonRecord["choice"];
  diff: DiffRowView[];
  counts: Record<DiffKind, number>;
  /** The one changed entry, or the date to say: the entry's new `checked` date, else the saved date ("since"). */
  notice?: { single?: DiffRowView; date?: string; since: boolean };
  before?: ComparisonResult;
  after?: ComparisonResult;
  verdict?: "top-unchanged" | "top-changed" | "tie-set-changed" | "none";
  valueChanges: ValueChange[];
  choiceNow?: { kind: string; rank?: number; reason?: string };
  names: Record<string, string>;
  cannotRun?: string;
}

export function isSame(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function namesOf(bundle: CompareBundle): Record<string, string> {
  const names: Record<string, string> = {};
  for (const w of bundle.wrappers) names[w.id] = w.name;
  for (const t of bundle.tier2) names[t.id] = t.name;
  for (const e of bundle.exposures ?? []) names[e.record.id] = e.name;
  return names;
}

const assumptionNames: Record<string, string> = { "A-01": "תשואה", "A-02": "אינפלציה", "A-29": "הירידה שתסכימו לספוג", "A-20": "ריבית קרן כספית", "A-22": "ריבית מק״מ", "A-23": "ריבית אג״ח", "A-24": "ריבית קרן כספית מתחדשת", "A-25": "ריבית פיקדון" };

function assumptionLabel(key: string, names: Record<string, string>): string {
  const [base, a, b] = key.split(":");
  if (base === "A-29" && a === "worst") return `הירידה שצפויה ב${names[b!] ?? b}`;
  if (base === "A-29" && a === "accepted") return `הירידה שתסכימו לספוג ב${names[b!] ?? b}`;
  const name = assumptionNames[base!] ?? base!;
  return a ? `${name}: ${names[a] ?? a}` : name;
}

function dataLabel(path: string): string {
  const file = path.split("/").pop()!.replace(/\.json$/, "");
  return file;
}

function renderRule(bundle: CompareBundle, key: string, v: unknown, today: string): Rendered {
  if (v === null || v === undefined) return null;
  if (Array.isArray(v)) return { kind: "table", rows: (v as { upTo: number | null; rate: number }[]).map((b) => ({ upTo: b.upTo, rate: b.rate })) };
  const [ruleId, figure] = key.split("/");
  const rule = bundle.rules.find((r) => r.id === ruleId);
  const f = rule?.figures?.[figure!];
  const base = f && !Array.isArray(f) ? ("by_tax_year" in f ? Object.values(f.by_tax_year).at(-1) : f) : undefined;
  if (base && (typeof v === "number" || typeof v === "string" || typeof v === "boolean")) return { kind: "num", value: { ...base, value: v, state: "sourced", checked: base.checked ?? today } };
  return { kind: "text", text: String(v) };
}

function renderParameter(bundle: CompareBundle, methodId: string, v: unknown): Rendered {
  if (v === null || v === undefined) return null;
  const rec = bundle.parameters.find((p) => idOf(p) === methodId) as unknown as { value?: ValueObject; rationale: string; rationale_he?: string; signed_off_on?: string } | undefined;
  if (rec?.value && (typeof v === "number" || typeof v === "string")) return { kind: "num", value: { ...rec.value, value: v, parameter: { rationale: rec.rationale, rationaleHe: rec.rationale_he ?? null, signedOffOn: rec.signed_off_on ?? null, provisional: false } } };
  return { kind: "text", text: typeof v === "object" ? "ערכי הפרמטר השתנו" : String(v) };
}

function renderAssumption(key: string, v: unknown, today: string): Rendered {
  if (v === null || v === undefined) return null;
  const { value, state } = v as { value: unknown; state: "entered" | "sourced" | "computed" };
  const unit: ValueObject["unit"] = key.startsWith("A-29") ? "pct" : "pct_per_year";
  if (typeof value === "number") {
    const base: SiteValue = { value, unit, source: { url: "local", title: state === "entered" ? "הוזן על ידך" : "ממקור", publisher: state === "entered" ? "אתם" : "מקור", strength: state === "entered" ? "entered" : "institution" }, checked: today, effective_from: today, effective_to: null, update_rule: "founder", state: state === "computed" ? "computed" : state };
    return { kind: "num", value: base };
  }
  return { kind: "text", text: String(value) };
}

function diffRows(bundle: CompareBundle, diff: VersionDiff[], names: Record<string, string>, today: string): DiffRowView[] {
  return diff.map((d): DiffRowView => {
    const base = { kind: d.kind, key: d.key, removed: d.new === null, added: d.old === null, oldChecked: d.oldChecked ?? null, newChecked: d.newChecked ?? null, recheckedOnly: false };
    if (d.kind === "rule") {
      const [code, figure] = d.key.split("/");
      return { ...base, code: code!, label: `${r5.revisit.what.rule.replace("{code}", code!)}${figure ? ` · ${figure}` : ""}`, old: renderRule(bundle, d.key, d.old, today), new: renderRule(bundle, d.key, d.new, today) };
    }
    if (d.kind === "parameter") {
      return { ...base, code: d.key, label: parametersPage.names[d.key as keyof typeof parametersPage.names] ?? d.key, href: `/parameters#${d.key}`, old: renderParameter(bundle, d.key, d.old), new: renderParameter(bundle, d.key, d.new) };
    }
    if (d.kind === "data") {
      return { ...base, code: dataLabel(d.key), label: dataLabel(d.key), old: d.old === null ? null : { kind: "text", text: String(d.old) }, new: d.new === null ? null : { kind: "text", text: String(d.new) }, recheckedOnly: d.old !== null && d.new !== null };
    }
    const o = d.old as { state?: string } | null;
    const n = d.new as { state?: string } | null;
    return { ...base, code: d.key, label: assumptionLabel(d.key, names), old: renderAssumption(d.key, d.old, today), new: renderAssumption(d.key, d.new, today), ...(o && n && o.state !== n.state ? { stateChange: true } : {}) };
  });
}

function valueChanges(before: ComparisonResult, after: ComparisonResult, names: Record<string, string>): ValueChange[] {
  const b = new Map(before.entries.map((e) => [e.id, e]));
  const a = new Map(after.entries.map((e) => [e.id, e]));
  const out: ValueChange[] = [];
  for (const id of new Set([...b.keys(), ...a.keys()])) {
    const [o, n] = [b.get(id), a.get(id)];
    if (!o || !n || Math.abs(o.real - n.real) > 1e-9 || Math.abs(o.nominal - n.nominal) > 1e-9) {
      out.push({ id, name: names[id] ?? id, before: o ? { real: o.real, nominal: o.nominal } : null, after: n ? { real: n.real, nominal: n.nominal } : null });
    }
  }
  return out;
}

const emptyCounts = (): Record<DiffKind, number> => ({ rule: 0, parameter: 0, data: 0, assumption: 0 });

/** The reason a choice is not ranked today, in the site's words, for "בחרתם ב…; היום היא …". */
function reasonText(code: string, detail?: string): string {
  const c = r2.result.reasons;
  const map: Record<string, string> = { "missing-input": c.enterReturn, "missing-record": c.noTerms, "no-run": c.noRun, gap: c.gap, "rule-missing": c.ruleMissing, "rule-open": c.ruleOpen, "loss-filter": r5.exposure.notes.excludedLine, "no-sourced-series": r5.exposure.fields.noSeries, "locked-until": r2.lockedUntil };
  return map[code] ?? (detail ? `${code} ${detail}` : code);
}

/** Re-runs a saved comparison at today's bundle (flow 35). Never throws: an engine data error is "cannot run" with its text. */
export function revisitSaved(bundleOrNull: CompareBundle | null, rec: unknown, today: string): RevisitView {
  const names = bundleOrNull ? namesOf(bundleOrNull) : {};
  if (!isReadableSaved(rec) || !bundleOrNull) {
    const r = (rec ?? {}) as { savedOn?: string; mode?: CompareMode; choice?: { id: string; name: string } };
    return { status: "unreadable", savedOn: typeof r.savedOn === "string" ? r.savedOn : "", mode: r.mode === "exposure" ? "exposure" : "wrapper", ...(r.choice && typeof r.choice.name === "string" ? { choice: r.choice } : {}), diff: [], counts: emptyCounts(), valueChanges: [], names };
  }
  const bundle = bundleOrNull;
  const base = { savedOn: rec.savedOn, mode: rec.mode, ...(rec.choice ? { choice: rec.choice } : {}), names };
  try {
    let after: ComparisonResult;
    let now: Versions;
    let choiceNow: RevisitView["choiceNow"];
    const ctx = { rules: bundle.rules, runDate: bundle.runDate };
    const rules = rec.versions.rules.map((r) => ruleFigureVersion(ctx, r.ruleId, r.figure));
    if (rec.mode === "wrapper") {
      const ev = evaluate(applyProviders(bundle, rec.run), rec.run); // the same tariff pick as the page (2026-10-24)
      after = resultOf(ev.ranking);
      now = { rules, parameters: parameterVersions(parametersFor(bundle, "wrapper")), data: dataFor(bundle, "wrapper", []), assumptions: assumptionVersions(ev.goal, ev.inputs.wrappers) };
      if (rec.choice) {
        const c = ev.candidates.find((x) => x.id === rec.choice!.id);
        const rank = ev.ranking.entries.findIndex((e) => e.id === rec.choice!.id);
        choiceNow = c ? { kind: c.kind, ...(rank >= 0 ? { rank: rank + 1 } : {}), ...(c.reasons[0] ? { reason: reasonText(c.reasons[0].code, c.reasons[0].detail) } : {}) } : { kind: "gone" };
      }
    } else {
      const view = computeExposureMode({ bundle, g: rec.run, goal: rec.goal });
      after = resultOf(view.comparison.ranking);
      const holding = Object.values(view.holding);
      now = { rules, parameters: parameterVersions(parametersFor(bundle, "exposure")), data: dataFor(bundle, "exposure", holding), assumptions: assumptionVersions(exposureGoal(rec.run), [], exposureAssumptions(view, rec.goal)) };
      if (rec.choice) {
        const row = view.rows.find((x) => x.id === rec.choice!.id);
        const rank = view.comparison.ranking.entries.findIndex((e) => e.id === rec.choice!.id);
        const first = row?.reasons[0];
        choiceNow = row ? { kind: row.kind, ...(rank >= 0 ? { rank: rank + 1 } : {}), ...(first ? { reason: first.code === "engine" ? reasonText(first.reason.code, first.reason.detail) : first.code === "p08-gov" ? r5.exposure.p08.gov : first.code === "no-fund" ? r5.exposure.p08.fund : r5.exposure.coverageReasons.noTerms } : {}) } : { kind: "gone" };
      }
    }
    const diff = diffRows(bundle, diffVersions(rec.versions, now), names, today);
    const counts = emptyCounts();
    for (const d of diff) counts[d.kind] += 1;
    const topUnchanged = rec.result.top === after.top;
    const tieSetUnchanged = isSame([...rec.result.tieSet].sort(), [...after.tieSet].sort());
    const verdict: RevisitView["verdict"] = rec.result.top === undefined && after.top === undefined ? "none" : !topUnchanged ? "top-changed" : !tieSetUnchanged ? "tie-set-changed" : "top-unchanged";
    const status: RevisitStatus = diff.length === 0 && topUnchanged && tieSetUnchanged ? "unchanged" : "changed";
    const single = diff.length === 1 ? diff[0] : undefined;
    const date = single && (single.kind === "rule" || single.kind === "data") ? (single.newChecked ?? undefined) : undefined;
    return {
      ...base,
      status,
      diff,
      counts,
      notice: { ...(single ? { single } : {}), ...(date ? { date } : {}), since: !date },
      before: rec.result,
      after,
      verdict,
      valueChanges: valueChanges(rec.result, after, names),
      ...(choiceNow ? { choiceNow } : {}),
    };
  } catch (e) {
    return { ...base, status: "cannot-run", diff: [], counts: emptyCounts(), valueChanges: [], cannotRun: e instanceof Error ? e.message : String(e) };
  }
}
