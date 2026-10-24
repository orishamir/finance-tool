// The saved goal (design-spec 6.5, flows 12 and 17): types, the preset step, the versioned document on the
// device and the React provider the goal form and the comparison share. Browser only; nothing is sent anywhere.
// The goals live in the v2 state document (lib/state.ts); this file keeps the release 2 API on top of it.
// A field the person typed is `entered`; a field a preset filled keeps no number of its own: it is read from the
// preset record each time (so a changed parameter never leaves a stale copy), and shows as a site parameter.
import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { ValueObject, WrapperId } from "@finance-tool/schema";
import { useInputs, type Employment } from "./inputs";
import { clearGoals, ensureLoaded, getSnapshot, STATE_KEY, takeOver, updateState, useStateStore } from "./state";

export type PresetId = "liquid-reserve" | "known-date" | "long-term" | "lump-sum" | "child" | "none";
export const presetIds: PresetId[] = ["liquid-reserve", "known-date", "long-term", "lump-sum", "child", "none"];

/** A number the person may have typed. `entered: false` means it follows the preset (or is empty). */
export interface NumField {
  value: number | null;
  entered: boolean;
}

/**
 * What the person entered for one exposure in exposure mode (design-spec 21.2); every figure an `entered` value object (D7, D9).
 * `wrapperId` is the holding wrapper when the person changed it; otherwise P-08's applies.
 */
export interface ExposureInputs {
  /** The exposure's gross annual return (A-01), or the person's own cash rate for a cash-like one, `pct_per_year`. */
  return?: ValueObject;
  /** The worst fall expected on the way (A-29), `pct`. */
  worstFall?: ValueObject;
  /** The largest fall accepted for this exposure alone, wins over the goal's common one (A-29), `pct`. */
  acceptedFall?: ValueObject;
  wrapperId?: WrapperId;
}

export interface Goal {
  id: string;
  name: string;
  preset: PresetId;
  horizonYears: NumField;
  amountNow: NumField;
  monthly: NumField;
  /** How much must stay available at once. Not entered with a preset that keeps a share: that share of the amount now. */
  available: NumField;
  /** "YYYY-MM" from which the part must be available; saved, not yet used by the engine. */
  availableFrom: string | null;
  anytime: { value: boolean; entered: boolean };
  profile: {
    age: number | null;
    employment: Employment | null;
    /** True when `employment` was filled in by the form (a yes to a pension or study fund through work), not chosen: the form shows it as a chip the person can flip. audit 2026-10-24 (A3) */
    employmentDefault?: boolean;
    salary: number | null;
    pension: { employer: number | null; employee: number | null };
    hishtalmut: { employer: number | null; employee: number | null; yearly: number | null };
    hasPension: boolean | null;
    hasHishtalmut: boolean | null;
  };
  assumptions: {
    /** A-01, entered; the site never guesses it (D9). */
    return: number | null;
    /** A-02, entered; null means P-05's value, shown as a site parameter. */
    inflation: number | null;
    /** A-17, entered: the insurance cost inside a pension fund, % of deposits. Absent in goals saved before it existed. */
    insurance?: number | null;
    /** A-29, entered: the largest fall the person accepts on the way to the goal, in percent of value. Never filled by a preset (D21). Absent before release 5. */
    acceptedFall?: number | null;
  };
  /** Exposure mode's inputs per exposure id (release 5). Absent in goals saved before it existed; the state migration adds `{}`. */
  exposures?: Record<string, ExposureInputs>;
  order: number;
  /** Set by an import "add": the day it was imported (design-spec 11.5). */
  importedAt?: string;
}

export interface GoalsDoc {
  version: 1;
  goals: Goal[];
  currentId: string | null;
  bank?: string;
}

/** The key the goals are saved under: since release 3 the one state document. */
export const GOALS_KEY = STATE_KEY;

export type StorageStatus = "loading" | "ok" | "old-version" | "unavailable";

// ---------------------------------------------------------------- presets

/** One entry of `data/parameters/goal-presets.json` (P-07), every attribute a value object. */
export interface PresetRecord {
  name_he: string;
  horizon_years?: ValueObject;
  monthly_deposit?: ValueObject;
  must_stay_available_share?: ValueObject;
  withdrawable_any_time?: ValueObject;
}

export type Presets = Partial<Record<Exclude<PresetId, "none">, PresetRecord>>;

const num = (v: ValueObject | undefined): number | null => (v && typeof v.value === "number" ? v.value : null);

/** The numbers a preset stands for. */
export function presetNumbers(preset: PresetRecord | undefined) {
  return {
    horizon: num(preset?.horizon_years),
    monthly: num(preset?.monthly_deposit),
    share: num(preset?.must_stay_available_share),
    anytime: typeof preset?.withdrawable_any_time?.value === "boolean" ? (preset.withdrawable_any_time.value as boolean) : null,
  };
}

export type FieldKey = "horizonYears" | "amountNow" | "monthly" | "available" | "anytime" | "return" | "inflation" | "age" | "employment" | "salary" | "insurance" | "acceptedFall";

export type FieldSource = "entered" | "preset" | "empty";

export interface ResolvedGoal {
  horizonYears: number | null;
  amountNow: number | null;
  monthly: number | null;
  available: number | null;
  anytime: boolean;
  source: Record<"horizonYears" | "amountNow" | "monthly" | "available" | "anytime", FieldSource>;
  /** The numbers the preset holds for the fields it fills (for the reset buttons). */
  preset: ReturnType<typeof presetNumbers>;
}

/** The numbers a goal runs on: entered values, else the preset's, else nothing. */
export function resolveGoal(goal: Goal, presets: Presets): ResolvedGoal {
  const preset = goal.preset === "none" ? undefined : presets[goal.preset];
  const p = presetNumbers(preset);
  const pick = (f: NumField, fromPreset: number | null): { value: number | null; source: FieldSource } =>
    f.entered ? { value: f.value, source: "entered" } : fromPreset !== null ? { value: fromPreset, source: "preset" } : { value: null, source: "empty" };
  const horizon = pick(goal.horizonYears, p.horizon);
  const amount = pick(goal.amountNow, null);
  const monthly = pick(goal.monthly, p.monthly);
  const derived = p.share !== null && amount.value !== null ? Math.round((amount.value * p.share) / 100) : null;
  const available = pick(goal.available, derived);
  const anytime = goal.anytime.entered ? { value: goal.anytime.value, source: "entered" as const } : p.anytime !== null ? { value: p.anytime, source: "preset" as const } : { value: false, source: "empty" as const };
  return {
    horizonYears: horizon.value,
    amountNow: amount.value,
    monthly: monthly.value,
    available: available.value,
    anytime: anytime.value,
    source: { horizonYears: horizon.source, amountNow: amount.source, monthly: monthly.source, available: available.source, anytime: anytime.source },
    preset: p,
  };
}

/** The names of the fields a preset fills, for the line under the chips. */
export function filledFields(preset: PresetRecord | undefined): ("horizonYears" | "monthly" | "available" | "anytime")[] {
  const p = presetNumbers(preset);
  const out: ("horizonYears" | "monthly" | "available" | "anytime")[] = [];
  if (p.horizon !== null) out.push("horizonYears");
  if (p.monthly !== null) out.push("monthly");
  if (p.share !== null && p.share > 0) out.push("available");
  if (p.anytime !== null) out.push("anytime");
  return out;
}

/** True when choosing `to` would have overwritten something the person typed (so it is kept, flow 12). */
export function keepsEntered(goal: Goal, to: PresetRecord | undefined): boolean {
  const fields = filledFields(to);
  return fields.some((f) => (f === "anytime" ? goal.anytime.entered : goal[f].entered));
}

// ---------------------------------------------------------------- creation and the document

export function emptyGoal(order: number, seed?: { age: number | null; employment: Employment | null; return: number | null; inflation: number | null }): Goal {
  return {
    id: `g${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: "",
    preset: "none",
    horizonYears: { value: null, entered: false },
    amountNow: { value: null, entered: false },
    monthly: { value: null, entered: false },
    available: { value: null, entered: false },
    availableFrom: null,
    anytime: { value: false, entered: false },
    profile: {
      age: seed?.age ?? null,
      employment: seed?.employment ?? null,
      salary: null,
      pension: { employer: null, employee: null },
      hishtalmut: { employer: null, employee: null, yearly: null },
      hasPension: null,
      hasHishtalmut: null,
    },
    assumptions: { return: seed?.return ?? null, inflation: seed?.inflation ?? null, insurance: null, acceptedFall: null },
    exposures: {},
    order,
  };
}

const orderOf = (goals: Goal[]) => [...goals].sort((a, b) => a.order - b.order);

function isGoal(x: unknown): x is Goal {
  const g = x as Goal;
  return !!g && typeof g.id === "string" && typeof g.preset === "string" && typeof g.horizonYears === "object" && typeof g.profile === "object" && typeof g.assumptions === "object";
}

export type ReadResult = { status: "ok"; doc: GoalsDoc | null } | { status: "old-version" } | { status: "unavailable" };

export function readDoc(): ReadResult {
  const snap = ensureLoaded();
  if (snap.status === "unavailable") return { status: "unavailable" };
  if (snap.status === "old-version") return { status: "old-version" };
  const st = snap.state;
  if (st.goals.length === 0) return { status: "ok", doc: null };
  return { status: "ok", doc: { version: 1, goals: st.goals, currentId: st.currentId ?? null, ...(st.bank ? { bank: st.bank } : {}) } };
}

/** With storage unavailable the goal still crosses from the form to the result within the visit (the store keeps it). */
let memory: GoalsDoc | null = null;

function writeDoc(doc: GoalsDoc): boolean {
  updateState((s) => ({ ...s, goals: doc.goals, currentId: doc.currentId ?? undefined, ...(doc.bank ? { bank: doc.bank } : {}) }));
  return getSnapshot().saved;
}

export function deleteDoc() {
  clearGoals();
}

// ---------------------------------------------------------------- provider

export type GoalPatch = (g: Goal) => Goal;

interface GoalsApi {
  /** `loading` until the device has been read after hydration. */
  status: StorageStatus;
  /** False when the last write failed (private mode, full storage): the visit still works. */
  saved: boolean;
  goals: Goal[];
  current: Goal | null;
  presets: Presets;
  resolved: ResolvedGoal | null;
  update: (patch: GoalPatch) => void;
  /** Starts the first goal when none exists (the form opens empty and saves from the first keystroke). */
  select: (id: string) => void;
  add: () => void;
  remove: (id: string) => void;
  move: (id: string, delta: -1 | 1) => void;
  restart: () => void;
  setPreset: (preset: PresetId) => { kept: boolean };
  setEnteredReturn: (v: number | null) => void;
  /** A-29, the goal's common largest accepted fall (percent); null clears it. */
  setAcceptedFall: (v: number | null) => void;
  /** Changes one exposure's inputs; a field set to `undefined` is cleared, and an exposure with nothing left is dropped. */
  setExposureInput: (id: string, patch: Partial<ExposureInputs>) => void;
  setInflation: (v: number | null) => void;
  setAge: (v: number | null) => void;
  setEmployment: (v: Employment | null) => void;
}

const Ctx = createContext<GoalsApi | null>(null);

export function useGoals(): GoalsApi {
  const api = useContext(Ctx);
  if (!api) throw new Error("useGoals needs a GoalsProvider");
  return api;
}

export function GoalsProvider({ presets, children }: { presets: Presets; children: ReactNode }) {
  const inputs = useInputs();
  const [status, setStatus] = useState<StorageStatus>("loading");
  const [saved, setSaved] = useState(true);
  const [doc, setDoc] = useState<GoalsDoc>({ version: 1, goals: [], currentId: null });
  const loaded = useRef(false);
  const external = useStateStore().external;
  const seenExternal = useRef(external);

  // Read once after hydration, and only when the release 1 inputs have been read too (they seed a new goal).
  useEffect(() => {
    if (loaded.current || !inputs.ready) return;
    loaded.current = true;
    const r = readDoc();
    if (r.status === "old-version") {
      setStatus("old-version");
      return;
    }
    if (r.status === "unavailable" && memory && memory.goals.length > 0) {
      setDoc(memory);
    } else if (r.status === "ok" && r.doc && r.doc.goals.length > 0) {
      setDoc(r.doc);
    } else {
      const g = emptyGoal(0, { age: inputs.state.age, employment: inputs.state.employment, return: inputs.state.entered["A-01"] ?? null, inflation: inputs.state.entered["A-02"] ?? null });
      setDoc({ version: 1, goals: [g], currentId: g.id });
    }
    setStatus(r.status);
  }, [inputs.ready, inputs.state]);

  // An import, "delete what was imported" or another tab changed the document: read the goals again.
  useEffect(() => {
    if (!loaded.current || seenExternal.current === external) return;
    seenExternal.current = external;
    const r = readDoc();
    if (r.status === "ok" && r.doc && r.doc.goals.length > 0) setDoc(r.doc);
    else if (r.status === "ok") {
      const g = emptyGoal(0, { age: inputs.state.age, employment: inputs.state.employment, return: inputs.state.entered["A-01"] ?? null, inflation: inputs.state.entered["A-02"] ?? null });
      setDoc({ version: 1, goals: [g], currentId: g.id });
    }
    setStatus(r.status);
  }, [external, inputs.state]);

  // Saved on every change; a goal that holds nothing yet is not written (an empty form leaves no trace).
  const first = useRef(true);
  useEffect(() => {
    if (status === "unavailable") {
      setSaved(false);
      memory = doc;
      return;
    }
    if (status !== "ok") return;
    if (first.current) {
      first.current = false;
      return;
    }
    setSaved(writeDoc(doc));
  }, [doc, status]);

  const current = useMemo(() => doc.goals.find((g) => g.id === doc.currentId) ?? orderOf(doc.goals)[0] ?? null, [doc]);
  const resolved = useMemo(() => (current ? resolveGoal(current, presets) : null), [current, presets]);

  const update = useCallback((patch: GoalPatch) => {
    setDoc((d) => {
      const cur = d.goals.find((g) => g.id === d.currentId) ?? orderOf(d.goals)[0];
      if (!cur) return d;
      return { ...d, goals: d.goals.map((g) => (g.id === cur.id ? patch(g) : g)) };
    });
  }, []);

  const select = useCallback((id: string) => setDoc((d) => ({ ...d, currentId: id })), []);
  const add = useCallback(() => {
    setDoc((d) => {
      const g = emptyGoal(d.goals.length === 0 ? 0 : Math.max(...d.goals.map((x) => x.order)) + 1, {
        age: inputs.state.age,
        employment: inputs.state.employment,
        return: inputs.state.entered["A-01"] ?? null,
        inflation: inputs.state.entered["A-02"] ?? null,
      });
      return { ...d, goals: [...d.goals, g], currentId: g.id };
    });
  }, [inputs.state]);
  const remove = useCallback((id: string) => {
    setDoc((d) => {
      const goals = d.goals.filter((g) => g.id !== id);
      return { ...d, goals, currentId: d.currentId === id ? (orderOf(goals)[0]?.id ?? null) : d.currentId };
    });
  }, []);
  const move = useCallback((id: string, delta: -1 | 1) => {
    setDoc((d) => {
      const sorted = orderOf(d.goals);
      const i = sorted.findIndex((g) => g.id === id);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= sorted.length) return d;
      const a = sorted[i]!;
      const b = sorted[j]!;
      return { ...d, goals: d.goals.map((g) => (g.id === a.id ? { ...g, order: b.order } : g.id === b.id ? { ...g, order: a.order } : g)) };
    });
  }, []);
  const restart = useCallback(() => {
    takeOver();
    const g = emptyGoal(0);
    setDoc({ version: 1, goals: [g], currentId: g.id });
    setStatus("ok");
    first.current = false;
  }, []);

  const setPreset = useCallback(
    (preset: PresetId) => {
      const kept = current ? preset !== "none" && keepsEntered(current, presets[preset]) : false;
      update((g) => ({ ...g, preset }));
      return { kept };
    },
    [current, presets, update],
  );

  const setEnteredReturn = useCallback(
    (v: number | null) => {
      update((g) => ({ ...g, assumptions: { ...g.assumptions, return: v } }));
      inputs.setEntered("A-01", v);
    },
    [update, inputs],
  );
  const setAcceptedFall = useCallback((v: number | null) => update((g) => ({ ...g, assumptions: { ...g.assumptions, acceptedFall: v } })), [update]);
  const setExposureInput = useCallback(
    (id: string, patch: Partial<ExposureInputs>) =>
      update((g) => {
        const merged: ExposureInputs = { ...(g.exposures?.[id] ?? {}), ...patch };
        for (const k of Object.keys(merged) as (keyof ExposureInputs)[]) if (merged[k] === undefined) delete merged[k];
        const exposures = { ...(g.exposures ?? {}) };
        if (Object.keys(merged).length === 0) delete exposures[id];
        else exposures[id] = merged;
        return { ...g, exposures };
      }),
    [update],
  );
  const setInflation = useCallback(
    (v: number | null) => {
      update((g) => ({ ...g, assumptions: { ...g.assumptions, inflation: v } }));
      inputs.setEntered("A-02", v);
    },
    [update, inputs],
  );
  const setAge = useCallback(
    (v: number | null) => {
      update((g) => ({ ...g, profile: { ...g.profile, age: v } }));
      inputs.setAge(v);
    },
    [update, inputs],
  );
  const setEmployment = useCallback(
    (v: Employment | null) => {
      update((g) => ({ ...g, profile: { ...g.profile, employment: v, employmentDefault: false } }));
      inputs.setEmployment(v);
    },
    [update, inputs],
  );

  const goals = useMemo(() => orderOf(doc.goals), [doc.goals]);
  const api = useMemo<GoalsApi>(
    () => ({ status, saved, goals, current, presets, resolved, update, select, add, remove, move, restart, setPreset, setEnteredReturn, setAcceptedFall, setExposureInput, setInflation, setAge, setEmployment }),
    [status, saved, goals, current, presets, resolved, update, select, add, remove, move, restart, setPreset, setEnteredReturn, setAcceptedFall, setExposureInput, setInflation, setAge, setEmployment],
  );
  return createElement(Ctx.Provider, { value: api }, children);
}

/** A goal has something to compare when it has a horizon and money (now or monthly). */
export function hasMeaning(g: ResolvedGoal | null): boolean {
  return !!g && g.horizonYears !== null && g.horizonYears >= 1 && ((g.amountNow ?? 0) > 0 || (g.monthly ?? 0) > 0);
}

/** A goal worth keeping on the device: the person typed something or chose a preset. */
export function isBlank(g: Goal): boolean {
  return g.preset === "none" && !g.name && !g.horizonYears.entered && !g.amountNow.entered && !g.monthly.entered && !g.available.entered && !g.anytime.entered && g.profile.salary === null && g.assumptions.return === null && g.assumptions.acceptedFall == null && Object.keys(g.exposures ?? {}).length === 0;
}


// ---------------------------------------------------------------- employment default and the submit check (audit 2026-10-24: A3, A38, A61)

type Profile = Goal["profile"];

/**
 * A yes to "pension or study fund through work" means the person is an employee: when no type was chosen it is filled in
 * as `employee` with `employmentDefault: true` (the form shows a chip to flip it). When both answers stop being yes, a
 * defaulted type goes back to empty; a type the person chose is never touched.
 */
export function reconcileEmployment(p: Profile): Profile {
  const viaWork = p.hasPension === true || p.hasHishtalmut === true;
  if (p.employment === null && viaWork) return { ...p, employment: "employee", employmentDefault: true };
  if (p.employmentDefault && !viaWork) return { ...p, employment: null, employmentDefault: false };
  return p;
}

/** The field bounds the check uses (the form's parameters, P-05 and P-07). */
export interface CheckBounds {
  horizon: { min: number; max: number };
  pct: { min: number; max: number };
  age: { min: number; max: number };
}

/** One bounds table for the percent fields of the goal form: the return and inflation follow P-05's range, the insurance share cannot be negative. */
export const pctBoundsFor = (kind: "return" | "inflation" | "insurance" | "share", pct: { min: number; max: number }) => (kind === "insurance" || kind === "share" ? { min: 0, max: pct.max } : pct);

export type MissingField = "years" | "amount";
export interface GoalProblem {
  field: string;
  message: string;
}
export interface GoalCheck {
  /** What is still needed before the comparison can run. */
  missing: MissingField[];
  /** Stored values that fail their field's rule (a hand-edited file, an old goal). */
  problems: GoalProblem[];
  ready: boolean;
}

export interface CheckMessages {
  years: string;
  yearsWhole: string;
  yearsRange: string;
  negative: string;
  available: string;
  age: string;
  pct: (b: { min: number; max: number }) => string;
}

/** What blocks the comparison for this goal: the two required fields (years, and an amount now or a monthly one) and any stored value outside its bounds. Pure. */
export function checkGoal(goal: Goal, r: ResolvedGoal, b: CheckBounds, m: CheckMessages): GoalCheck {
  const missing: MissingField[] = [];
  const problems: GoalProblem[] = [];
  const years = r.horizonYears;
  if (years === null) missing.push("years");
  else if (years < 1) problems.push({ field: "years", message: m.years });
  else if (!Number.isInteger(years)) problems.push({ field: "years", message: m.yearsWhole });
  else if (years > b.horizon.max) problems.push({ field: "years", message: m.yearsRange });
  if ((r.amountNow ?? 0) <= 0 && (r.monthly ?? 0) <= 0) missing.push("amount");
  for (const [field, v] of [["amount", r.amountNow], ["monthly", r.monthly], ["available", r.available]] as const) if (v !== null && v < 0) problems.push({ field, message: m.negative });
  if (r.amountNow !== null && r.available !== null && r.available > r.amountNow) problems.push({ field: "available", message: m.available });
  const age = goal.profile.age;
  if (age !== null && (age < b.age.min || age > b.age.max)) problems.push({ field: "age", message: m.age });
  const a = goal.assumptions;
  for (const [field, v, bd] of [
    ["return", a.return, pctBoundsFor("return", b.pct)],
    ["inflation", a.inflation, pctBoundsFor("inflation", b.pct)],
    ["insurance", a.insurance ?? null, pctBoundsFor("insurance", b.pct)],
  ] as const)
    if (v !== null && (v < bd.min || v > bd.max)) problems.push({ field, message: m.pct(bd) });
  return { missing, problems, ready: missing.length === 0 && problems.length === 0 };
}
