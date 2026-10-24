// The saved state, version 3 (design-spec 11.5 and 21.5, flows 17, 26 and 35): one document `mekor.v2.state` on the device that
// holds the guide inputs, the goals, the holdings and the names not catalogued yet, plus the record of imports, and
// since release 5 the saved comparisons. The storage key is unchanged (the document's own `version`
// says what it is; an older site that finds version 3 there refuses it and leaves it alone); version 2 migrates on load.
// It replaces the release 2 keys `mekor.v1.inputs`, `mekor.v1.goals` and `mekor.v1.uncatalogued`: the first load
// after the release migrates them once and removes them after a successful write. Browser only; nothing is
// sent anywhere. `lib/inputs.tsx` and `lib/goal.ts` keep their APIs and read and write through this store.
//
// The export file (`StateFile`) is this document with a header; the import checks it before anything changes.
import { useSyncExternalStore } from "react";
import { valueObject, type ValueObject, type WrapperId } from "@finance-tool/schema";
import type { ComparisonResult, Versions } from "@finance-tool/engine";
import type { RunGoal } from "./compare";
import type { Goal } from "./goal";
import { todayLocal } from "./today";
import { entered as enteredValue } from "./value";
import { sanitizeRawState, type Rejected } from "./import-check";
import { IMPORTED_SIDE_KEY, mergeSide, noSideCounts, readImportedSide, readSideFile, readSideStores, removeImportedSide, sideCounts, sideTotal, sideIsEmpty, writeSideStores, type SideCounts, type SideMerge, type SideProblem, type SideStores } from "./side-stores";

export const STATE_KEY = "mekor.v2.state";
export const STATE_VERSION = 3;
const V1_INPUTS = "mekor.v1.inputs";
const V1_GOALS = "mekor.v1.goals";
const V1_UNCAT = "mekor.v1.uncatalogued";
const EXPORTS_KEY = "mekor.v2.exports";

// ---------------------------------------------------------------- types

export const transferBars = ["loan", "attachment", "annuityStarted", "disabilityAnnuityClaimed", "memberDied", "receivingFundClosed", "appliedToComprehensivePension"] as const;
export type TransferBar = (typeof transferBars)[number];

/** One account the person already has, entered from the annual statement (design-spec 11.2). Figures are `entered` value objects. */
export interface Holding {
  id: string;
  wrapperId: WrapperId;
  /** The managing company, or for a child plan at a bank the bank. */
  company: { name: string; legalId?: string };
  /** The track found in the regulator's data. */
  track?: { fundId: number; name: string };
  /** The name as typed when no track was found (also recorded as "not catalogued yet"). */
  typedName?: string;
  balance: ValueObject;
  /** Fee on balance (% a year) and fee on deposits (% of each deposit), as the statement states them; absent for a child plan (the NII pays until 21). */
  feeBalance?: ValueObject;
  feeDeposit?: ValueObject;
  directExpenses?: ValueObject;
  monthlyOwn?: ValueObject;
  monthlyEmployer?: ValueObject;
  /** Kupat gemel lehashkaa: the gain already inside the balance, from the detailed statement (PF-36), NIS. */
  embeddedGain?: ValueObject;
  /** The bars of PF-17 the person says apply (the transfer is barred while one does); left out means not stated. */
  bars?: Partial<Record<TransferBar, boolean>>;
  /** `YYYY-MM-DD`, a study fund's first deposit (TXH-09). */
  firstDeposit?: ValueObject;
  /** `YYYY-MM-DD`, the date the statement is correct to. */
  statementDate: ValueObject;
  child?: { route: "provident" | "bank" };
  /** Set by import "add": the day it was imported. */
  importedAt?: string;
  order: number;
}

export interface Uncatalogued {
  name: string;
  seen: string;
  context?: string;
  importedAt?: string;
}

export interface ImportRecord {
  at: string;
  mode: "add" | "replace";
  goals: number;
  holdings: number;
  names: number;
  skipped: number;
}

/** Version 2, as release 3 and 4 wrote it; read only to migrate. */
export interface StateV2 {
  version: 2;
  goals: Goal[];
  currentId?: string;
  bank?: string;
  /** The guide inputs (A-01, A-02, the P-05 amounts, age, employment), each a value object. */
  inputs: Record<string, ValueObject>;
  holdings: Holding[];
  uncatalogued: Uncatalogued[];
  imports: ImportRecord[];
}

export type CompareMode = "wrapper" | "exposure";
export const compareModes: readonly CompareMode[] = ["wrapper", "exposure"];

/**
 * The device shape of the engine's `SavedComparison` (design-spec 21.2, flow 35): ids, not wrapper records, so the
 * re-run uses today's records. `goal` is the goal by value (with its exposure inputs and accepted fall) and `run`
 * the numbers it ran on after the presets were resolved, so a later change of a preset is not a change of the inputs.
 */
export interface SavedComparisonRecord {
  id: string;
  goalId: string;
  mode: CompareMode;
  /** `YYYY-MM-DD`. */
  savedOn: string;
  site: { version: string; data: string };
  goal: Goal;
  run: RunGoal;
  wrapperIds: string[];
  tier2Ids: string[];
  /** The rule figures, parameters, data files and assumptions the run read (engine `Versions`). */
  versions: Versions;
  /** The top option, the tie set and each ranked value at the time (engine `ComparisonResult`). */
  result: ComparisonResult;
  choice?: { id: string; name: string };
  /** Exposure mode: the loss filter's numbers, each exposure's return and the holding wrapper that ran. */
  exposure?: { lossFilter: { worstFall: Record<string, ValueObject>; acceptedFall?: ValueObject; acceptedFallById?: Record<string, ValueObject> }; returns: Record<string, ValueObject>; holding: Record<string, string> };
}

export interface StateV3 extends Omit<StateV2, "version"> {
  version: 3;
  /** One per goal and mode. A record this release cannot read is kept as it is (see `isReadableSaved`). */
  savedComparisons: SavedComparisonRecord[];
}

export interface StateFile {
  format: "mekor-state";
  version: number;
  exported: string;
  site: { version: string; data: string };
  state: StateV3;
  /**
   * The entered offers, the variant assumptions and the playbook ticks, which live in their own device keys until the
   * founder approves their merge into the document (audit 2026-10-24, A32). Absent in a file from before; the version stays 3.
   */
  sideStores?: SideStores;
}

export function emptyState(): StateV3 {
  return { version: 3, goals: [], inputs: {}, holdings: [], uncatalogued: [], imports: [], savedComparisons: [] };
}

/** The device's calendar date (local, not UTC): see `today.ts`. */
export const isoToday = (): string => todayLocal();

// ---------------------------------------------------------------- the guide inputs, as value objects

export type Employment = "employee" | "self-employed";

export interface InputsLike {
  entered: Record<string, number>;
  age: number | null;
  employment: Employment | null;
}

const inputUnits: Record<string, ValueObject["unit"]> = {
  amount_now: "nis",
  monthly_deposit: "nis_per_month",
  horizon_years: "years",
  "A-01": "pct_per_year",
  "A-02": "pct_per_year",
  cash_rate: "pct_per_year",
  annual_income: "nis",
};

/** The release 1 inputs as the v2 document keeps them: every number a value object in state `entered`. */
export function inputsToRecord(i: InputsLike, today = isoToday()): Record<string, ValueObject> {
  const out: Record<string, ValueObject> = {};
  for (const [k, v] of Object.entries(i.entered)) if (Number.isFinite(v)) out[k] = enteredValue(v, inputUnits[k] ?? "count", today);
  if (i.age !== null) out.age = enteredValue(i.age, "years", today);
  if (i.employment !== null) out.employment = { ...enteredValue(0, "text", today), value: i.employment };
  return out;
}

export function inputsFromRecord(rec: Record<string, ValueObject>): InputsLike {
  const entered: Record<string, number> = {};
  for (const [k, v] of Object.entries(rec)) if (k !== "age" && k !== "employment" && typeof v.value === "number") entered[k] = v.value;
  const age = typeof rec.age?.value === "number" ? rec.age.value : null;
  const e = rec.employment?.value;
  return { entered, age, employment: e === "employee" || e === "self-employed" ? e : null };
}

// ---------------------------------------------------------------- reading and checking a document

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);

function isGoalLike(x: unknown): boolean {
  return isObj(x) && typeof x.id === "string" && typeof x.preset === "string" && isObj(x.horizonYears) && isObj(x.profile) && isObj(x.assumptions);
}

export type Refusal =
  | { kind: "unreadable" }
  | { kind: "format" }
  | { kind: "newer" }
  | { kind: "invalid"; field: string };

const wrapperIds = new Set<string>([
  "kupat-gemel-lehashkaa",
  "keren-hishtalmut",
  "pension-comprehensive",
  "pension-general",
  "provident-for-annuity",
  "ira-hishtalmut",
  "ira-provident",
  "child-savings-provident",
  "child-savings-bank",
]);

const holdingValueFields = ["balance", "embeddedGain", "feeBalance", "feeDeposit", "directExpenses", "monthlyOwn", "monthlyEmployer", "firstDeposit", "statementDate"] as const;

function voAt(v: unknown, path: string): string | null {
  const r = valueObject.safeParse(v);
  if (r.success) return null;
  const issue = r.error.issues[0]!;
  return [path, ...issue.path.map(String)].join(".");
}

/** What a saved comparison must have for the revisit to run on it; anything else is "unreadable" and kept as it is (design-spec 21.5). */
export function isReadableSaved(x: unknown): x is SavedComparisonRecord {
  if (!isObj(x)) return false;
  if (typeof x.id !== "string" || typeof x.goalId !== "string" || !compareModes.includes(x.mode as CompareMode)) return false;
  if (typeof x.savedOn !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(x.savedOn)) return false;
  if (!isObj(x.goal) || !isGoalLike(x.goal) || !isObj(x.run) || !Array.isArray(x.wrapperIds) || !Array.isArray(x.tier2Ids)) return false;
  const v = x.versions;
  if (!isObj(v) || !Array.isArray(v.rules) || !Array.isArray(v.parameters) || !Array.isArray(v.data) || !Array.isArray(v.assumptions)) return false;
  const r = x.result;
  if (!isObj(r) || !Array.isArray(r.tieSet) || !Array.isArray(r.entries)) return false;
  if (x.mode === "exposure" && !isObj(x.exposure)) return false;
  return true;
}

/** The first problem of a v2 or v3 document, as the field's path, or null. Every figure must stay a value object (data-schema §1). */
export function checkState(s: unknown): string | null {
  if (!isObj(s)) return "state";
  if (!Array.isArray(s.goals)) return "goals";
  for (const [i, g] of s.goals.entries()) if (!isGoalLike(g)) return `goals.${i}`;
  if (!isObj(s.inputs)) return "inputs";
  for (const [k, v] of Object.entries(s.inputs)) {
    const bad = voAt(v, `inputs.${k}`);
    if (bad) return bad;
  }
  if (!Array.isArray(s.holdings)) return "holdings";
  for (const [i, h] of s.holdings.entries()) {
    const at = `holdings.${i}`;
    if (!isObj(h)) return at;
    if (typeof h.id !== "string") return `${at}.id`;
    if (typeof h.wrapperId !== "string" || !wrapperIds.has(h.wrapperId)) return `${at}.wrapperId`;
    if (!isObj(h.company) || typeof h.company.name !== "string") return `${at}.company`;
    if (typeof h.order !== "number") return `${at}.order`;
    for (const f of holdingValueFields) {
      if (h[f] === undefined && (f === "balance" || f === "statementDate")) return `${at}.${f}`;
      if (h[f] === undefined) continue;
      const bad = voAt(h[f], `${at}.${f}`);
      if (bad) return bad;
    }
    if (typeof (h.balance as ValueObject).value !== "number") return `${at}.balance.value`;
    if (h.track !== undefined && !(isObj(h.track) && typeof h.track.fundId === "number" && typeof h.track.name === "string")) return `${at}.track`;
  }
  if (!Array.isArray(s.uncatalogued)) return "uncatalogued";
  for (const [i, u] of s.uncatalogued.entries()) if (!isObj(u) || typeof u.name !== "string") return `uncatalogued.${i}`;
  if (s.imports !== undefined && !Array.isArray(s.imports)) return "imports";
  // version 3 additions: exposure inputs are value objects; a saved comparison may be unreadable but must be an object
  for (const [i, g] of s.goals.entries()) {
    const ex = (g as Record<string, unknown>).exposures;
    if (ex === undefined) continue;
    if (!isObj(ex)) return `goals.${i}.exposures`;
    for (const [id, inputs] of Object.entries(ex)) {
      if (!isObj(inputs)) return `goals.${i}.exposures.${id}`;
      for (const f of ["return", "worstFall", "acceptedFall"] as const) {
        if (inputs[f] === undefined) continue;
        const bad = voAt(inputs[f], `goals.${i}.exposures.${id}.${f}`);
        if (bad) return bad;
      }
    }
  }
  if (s.version === 3) {
    if (!Array.isArray(s.savedComparisons)) return "savedComparisons";
    for (const [i, c] of s.savedComparisons.entries()) if (!isObj(c)) return `savedComparisons.${i}`;
  }
  return null;
}

/** A version 2 or 3 document as the version 3 shape: each goal gains an empty `exposures` map, the document an empty list of saved comparisons; a `visits` field of an earlier file is ignored (the migration chain, design-spec 21.5). */
function normalizeState(s: Record<string, unknown>): StateV3 {
  const base = emptyState();
  const goals = (s.goals as Goal[]).map((g) => (g.exposures ? g : { ...g, exposures: {} }));
  return {
    version: 3,
    goals,
    savedComparisons: Array.isArray(s.savedComparisons) ? (s.savedComparisons as SavedComparisonRecord[]) : base.savedComparisons,
    ...(typeof s.currentId === "string" ? { currentId: s.currentId } : {}),
    ...(typeof s.bank === "string" ? { bank: s.bank } : {}),
    inputs: s.inputs as Record<string, ValueObject>,
    holdings: s.holdings as Holding[],
    uncatalogued: s.uncatalogued as Uncatalogued[],
    imports: Array.isArray(s.imports) ? (s.imports as ImportRecord[]) : base.imports,
  };
}

/** The v1 documents (the release 2 keys), or null where a key is absent or unreadable. */
export interface V1Docs {
  inputs?: unknown;
  goals?: unknown;
  uncatalogued?: unknown;
}

/** Migration v1 → v2: the three release 2 documents become one. Returns null when there was nothing to carry over. */
export function migrateV1(v1: V1Docs, today = isoToday()): StateV3 | null {
  const s = emptyState();
  let found = false;
  if (isObj(v1.inputs)) {
    const i = v1.inputs;
    s.inputs = inputsToRecord(
      {
        entered: isObj(i.entered) ? (Object.fromEntries(Object.entries(i.entered).filter(([, v]) => typeof v === "number")) as Record<string, number>) : {},
        age: typeof i.age === "number" ? i.age : null,
        employment: i.employment === "employee" || i.employment === "self-employed" ? i.employment : null,
      },
      today,
    );
    found = true;
  }
  if (isObj(v1.goals) && v1.goals.version === 1 && Array.isArray(v1.goals.goals) && v1.goals.goals.every(isGoalLike)) {
    s.goals = v1.goals.goals as Goal[];
    if (typeof v1.goals.currentId === "string") s.currentId = v1.goals.currentId;
    if (typeof v1.goals.bank === "string") s.bank = v1.goals.bank;
    found = true;
  }
  if (Array.isArray(v1.uncatalogued)) {
    s.uncatalogued = v1.uncatalogued.filter((u): u is { name: string; date?: string } => isObj(u) && typeof u.name === "string").map((u) => ({ name: u.name, seen: typeof u.date === "string" ? u.date : today }));
    if (s.uncatalogued.length > 0) found = true;
  }
  return found ? s : null;
}

/**
 * Reads a state of any version: version 1 (the goals document alone, as a file from before release 3 would carry)
 * is migrated by the same chain the load uses; a newer version is refused; an invalid one names its first field.
 */
export function readState(raw: unknown, version: number): { ok: true; state: StateV3; migrated: boolean } | { ok: false; refusal: Refusal } {
  if (!Number.isInteger(version) || version < 1) return { ok: false, refusal: { kind: "format" } };
  if (version > STATE_VERSION) return { ok: false, refusal: { kind: "newer" } };
  if (version === 1) {
    if (!isObj(raw)) return { ok: false, refusal: { kind: "invalid", field: "state" } };
    const looksLikeBundle = "goals" in raw && !Array.isArray(raw.goals);
    const v1: V1Docs = looksLikeBundle ? { goals: raw.goals, inputs: raw.inputs, uncatalogued: raw.uncatalogued } : { goals: raw };
    const migrated = migrateV1(v1);
    if (!migrated) return { ok: false, refusal: { kind: "invalid", field: "goals" } };
    return { ok: true, state: migrated, migrated: true };
  }
  const bad = checkState({ ...(raw as Record<string, unknown>), version });
  if (bad) return { ok: false, refusal: { kind: "invalid", field: bad } };
  return { ok: true, state: normalizeState(raw as Record<string, unknown>), migrated: version < STATE_VERSION };
}

// ---------------------------------------------------------------- the store

export type StoreStatus = "loading" | "ok" | "old-version" | "unavailable";

export interface Snapshot {
  status: StoreStatus;
  /** False until the device has been read after hydration (the pre-rendered page has no state). */
  ready: boolean;
  /** False when the last write failed (private mode, full storage): the visit still works. */
  saved: boolean;
  state: StateV3;
  /** Bumped by changes that did not come from a provider's own edit: import, delete imported, another tab. */
  external: number;
}

type Storage = Pick<globalThis.Storage, "getItem" | "setItem" | "removeItem">;

let storage: Storage | null | undefined;
let snap: Snapshot = { status: "loading", ready: false, saved: true, state: emptyState(), external: 0 };
/** With storage unavailable the state still crosses pages within the visit. */
let memory: StateV3 | null = null;
let readOnly = false;
/** A goals document of release 2 this release could not read stays under its v1 key until the person starts again or deletes it. */
let keepV1Goals = false;
/** An edit is waiting to be written: pagehide and the timer write only then (a document someone cleared is not put back). */
let dirty = false;
let timer: ReturnType<typeof setTimeout> | null = null;
let listening = false;
const listeners = new Set<() => void>();

function theStorage(): Storage | null {
  if (storage !== undefined) return storage;
  try {
    storage = typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    storage = null;
  }
  return storage;
}

/** For tests: replaces the device storage and forgets everything read. */
export function resetStore(s?: Storage | null) {
  storage = s === undefined ? undefined : s;
  snap = { status: "loading", ready: false, saved: true, state: emptyState(), external: 0 };
  memory = null;
  readOnly = false;
  keepV1Goals = false;
  dirty = false;
  if (timer) clearTimeout(timer);
  timer = null;
  listeners.forEach((l) => l());
}

function emit() {
  listeners.forEach((l) => l());
}

function set(next: Partial<Snapshot>) {
  snap = { ...snap, ...next };
  emit();
}

export function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getSnapshot(): Snapshot {
  return snap;
}

const loadingSnapshot: Snapshot = snap;

/** The store as a React hook; the server render and the first client render both see the loading snapshot. */
export function useStateStore(): Snapshot {
  return useSyncExternalStore(subscribe, getSnapshot, () => loadingSnapshot);
}

function readJson(s: Storage, key: string): { present: boolean; value?: unknown } {
  const raw = s.getItem(key);
  if (raw === null) return { present: false };
  try {
    return { present: true, value: JSON.parse(raw) };
  } catch {
    return { present: true };
  }
}

function listen() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("pagehide", () => flush());
  document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && flush());
  // another tab changed the document: re-read it, and let the providers re-read theirs
  window.addEventListener("storage", (e) => {
    if (e.key !== STATE_KEY) return;
    const s = theStorage();
    if (!s) return;
    const r = readJson(s, STATE_KEY);
    const parsed = r.present && isObj(r.value) && (r.value.version === 2 || r.value.version === 3) && checkState(r.value) === null ? normalizeState(r.value) : e.newValue === null ? emptyState() : null;
    if (parsed) set({ state: parsed, external: snap.external + 1 });
  });
}

/**
 * Reads the device once, after hydration: the v2 document, or the v1 keys migrated (written first, the v1 keys
 * removed only after the write succeeded). Safe to call from every provider.
 */
export function ensureLoaded(): Snapshot {
  if (snap.ready) return snap;
  listen();
  const s = theStorage();
  if (!s) {
    set({ ready: true, status: "unavailable", saved: false, state: memory ?? emptyState() });
    return snap;
  }
  try {
    const cur = readJson(s, STATE_KEY);
    if (cur.present) {
      const v = cur.value;
      if (isObj(v) && (v.version === 2 || v.version === 3) && checkState(v) === null) {
        // a version 2 document is migrated here and written as version 3 with the next edit; a version 3 one is read as it is
        const norm = normalizeState(v);
        set({ ready: true, status: "ok", state: norm });
        if (v.version === 2) schedule();
      } else {
        // a newer or unreadable document is left exactly as it is
        readOnly = true;
        set({ ready: true, status: "old-version", state: emptyState() });
      }
      return snap;
    }
    const inputs = readJson(s, V1_INPUTS);
    const goals = readJson(s, V1_GOALS);
    const uncat = readJson(s, V1_UNCAT);
    const migrated = migrateV1({ inputs: inputs.value, goals: goals.value, uncatalogued: uncat.value });
    if (goals.present && !(isObj(goals.value) && goals.value.version === 1)) {
      // a goals document this release cannot read: kept where it is, the strip offers to start again or delete
      readOnly = false;
      keepV1Goals = true;
      dirty = migrated !== null;
      set({ ready: true, status: "old-version", state: migrated ?? emptyState() });
      return snap;
    }
    if (migrated) {
      try {
        s.setItem(STATE_KEY, JSON.stringify(migrated));
        for (const k of [V1_INPUTS, V1_GOALS, V1_UNCAT]) s.removeItem(k);
        set({ ready: true, status: "ok", state: migrated });
      } catch {
        set({ ready: true, status: "unavailable", saved: false, state: migrated });
        memory = migrated;
      }
      return snap;
    }
    set({ ready: true, status: "ok", state: emptyState() });
    schedule();
  } catch {
    set({ ready: true, status: "unavailable", saved: false, state: memory ?? emptyState() });
  }
  return snap;
}

/** Writes at once when an edit is waiting (or `force`). Returns whether the device kept it. */
export function flush(force = false): boolean {
  if (timer) clearTimeout(timer);
  timer = null;
  if (!dirty && !force) return snap.saved;
  dirty = false;
  if (readOnly || !snap.ready) return snap.saved;
  const s = theStorage();
  if (!s || snap.status === "unavailable") {
    memory = snap.state;
    if (snap.saved) set({ saved: false });
    return false;
  }
  try {
    s.setItem(STATE_KEY, JSON.stringify(snap.state));
    for (const k of keepV1Goals ? [V1_INPUTS, V1_UNCAT] : [V1_INPUTS, V1_GOALS, V1_UNCAT]) s.removeItem(k);
    if (!snap.saved) set({ saved: true });
    return true;
  } catch {
    memory = snap.state;
    set({ saved: false });
    return false;
  }
}

function schedule() {
  dirty = true;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => flush(), 300);
}

/** A provider's own edit: saved after 300 ms, not announced as an outside change. */
export function updateState(fn: (s: StateV3) => StateV3): void {
  ensureLoaded();
  if (readOnly) return;
  let next = fn(snap.state);
  if (next === snap.state) return;
  // a goal that goes takes its saved comparisons with it (design-spec 21.5)
  if (next.goals !== snap.state.goals && next.savedComparisons.some((c) => isObj(c) && !next.goals.some((g) => g.id === c.goalId))) {
    next = { ...next, savedComparisons: next.savedComparisons.filter((c) => !isObj(c) || next.goals.some((g) => g.id === c.goalId)) };
  }
  // goals written over an old document: it is replaced, and the device reads as ordinary again
  const takeOver = snap.status === "old-version" && next.goals.length > 0;
  if (takeOver) keepV1Goals = false;
  set({ state: next, ...(takeOver ? { status: "ok" as const } : {}) });
  if (snap.status === "unavailable") memory = next;
  schedule();
}

/** A change the providers must re-read (import, delete imported): saved at once and announced. */
export function replaceState(next: StateV3): boolean {
  ensureLoaded();
  // an unreadable or newer document on the device is replaced only by this explicit act
  readOnly = false;
  if (snap.status === "old-version") set({ status: "ok" });
  set({ state: next, external: snap.external + 1 });
  if (snap.status === "unavailable") memory = next;
  return flush(true);
}

/** The person chose to start again or to delete an unreadable document: it may be written over. */
export function takeOver(): void {
  ensureLoaded();
  readOnly = false;
  keepV1Goals = false;
  if (snap.status === "old-version") set({ status: "ok" });
}

/** Clears the goals (the strip's "delete" when the document is old, and the release 2 `deleteDoc`). */
export function clearGoals(): void {
  ensureLoaded();
  const wasOld = snap.status === "old-version";
  takeOver();
  if (wasOld && snap.state.goals.length === 0 && Object.keys(snap.state.inputs).length === 0 && snap.state.holdings.length === 0) {
    // nothing else of the person's is in the document: write the empty one (removes any v1 goals key)
    set({ state: emptyState(), external: snap.external + 1 });
    flush(true);
    return;
  }
  updateState((st) => ({ ...st, goals: [], currentId: undefined }));
  set({ external: snap.external + 1 });
  flush(true);
}

// ---------------------------------------------------------------- holdings

export function newHoldingId(): string {
  return `h${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export const sortedHoldings = (hs: readonly Holding[]): Holding[] => [...hs].sort((a, b) => a.order - b.order);

export function saveHolding(h: Holding): void {
  updateState((s) => {
    const exists = s.holdings.some((x) => x.id === h.id);
    const order = exists ? h.order : s.holdings.length === 0 ? 0 : Math.max(...s.holdings.map((x) => x.order)) + 1;
    const next = { ...h, order };
    const holdings = exists ? s.holdings.map((x) => (x.id === h.id ? next : x)) : [...s.holdings, next];
    return { ...s, holdings };
  });
}

export function removeHolding(id: string): void {
  updateState((s) => ({ ...s, holdings: s.holdings.filter((h) => h.id !== id) }));
}

export function moveHolding(id: string, delta: -1 | 1): void {
  updateState((s) => {
    const sorted = sortedHoldings(s.holdings);
    const i = sorted.findIndex((h) => h.id === id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= sorted.length) return s;
    const a = sorted[i]!;
    const b = sorted[j]!;
    return { ...s, holdings: s.holdings.map((h) => (h.id === a.id ? { ...h, order: b.order } : h.id === b.id ? { ...h, order: a.order } : h)) };
  });
}

/** A name from a statement the site could not match (flow 6, 22), kept once. */
export function rememberName(name: string, context?: string): void {
  updateState((s) => (s.uncatalogued.some((u) => u.name === name) ? s : { ...s, uncatalogued: [...s.uncatalogued, { name, seen: isoToday(), ...(context ? { context } : {}) }] }));
}

export function useHoldings() {
  const snapshot = useStateStore();
  return { ready: snapshot.ready, status: snapshot.status, saved: snapshot.saved, holdings: sortedHoldings(snapshot.state.holdings), save: saveHolding, remove: removeHolding, move: moveHolding };
}

// ---------------------------------------------------------------- saved comparisons

const sameSlot = (c: unknown, goalId: string, mode: CompareMode) => isObj(c) && c.goalId === goalId && c.mode === mode;

/** The saved comparison of a goal and mode as the device holds it; it may be a record this release cannot read (`isReadableSaved`). */
export function savedFor(s: StateV3, goalId: string, mode: CompareMode): SavedComparisonRecord | undefined {
  return s.savedComparisons.find((c) => sameSlot(c, goalId, mode));
}

/** Saves (or, with the person's confirm, replaces) the comparison of its goal and mode, at once. Returns whether the device kept it. */
export function saveComparisonRecord(rec: SavedComparisonRecord): boolean {
  updateState((s) => ({ ...s, savedComparisons: [...s.savedComparisons.filter((c) => !sameSlot(c, rec.goalId, rec.mode)), rec] }));
  return flush(true);
}

export function deleteSavedComparison(goalId: string, mode: CompareMode): void {
  updateState((s) => ({ ...s, savedComparisons: s.savedComparisons.filter((c) => !sameSlot(c, goalId, mode)) }));
  flush(true);
}

export function useSavedComparisons(): { ready: boolean; saved: boolean; status: StoreStatus; list: SavedComparisonRecord[] } {
  const snapshot = useStateStore();
  return { ready: snapshot.ready, saved: snapshot.saved, status: snapshot.status, list: snapshot.state.savedComparisons };
}

// ---------------------------------------------------------------- imported items

export function importedCount(s: StateV3): { goals: number; holdings: number; names: number; total: number } {
  const goals = s.goals.filter((g) => g.importedAt).length;
  const holdings = s.holdings.filter((h) => h.importedAt).length;
  const names = s.uncatalogued.filter((u) => u.importedAt).length;
  return { goals, holdings, names, total: goals + holdings + names };
}

/** "מחיקת מה שיובא": every item with `importedAt` goes, the rest stays (the current goal falls back if it was imported). */
export function withoutImported(s: StateV3): StateV3 {
  const goals = s.goals.filter((g) => !g.importedAt);
  const currentId = s.currentId && goals.some((g) => g.id === s.currentId) ? s.currentId : goals[0]?.id;
  return { ...s, goals, ...(currentId ? { currentId } : { currentId: undefined }), holdings: s.holdings.filter((h) => !h.importedAt), uncatalogued: s.uncatalogued.filter((u) => !u.importedAt), imports: [], savedComparisons: s.savedComparisons.filter((c) => !isObj(c) || goals.some((g) => g.id === c.goalId)) };
}

export function deleteImported(): void {
  replaceState(withoutImported(snap.state));
  removeImportedSide(theStorage());
}

/** How many side-store items an "add" import brought that are still recorded as imported (offers, assumptions, ticks, own rates). */
export function importedSideCount(): number {
  return sideTotal(readImportedSide(theStorage()));
}

export function useImportedCount(): number {
  return importedCount(useStateStore().state).total;
}

// ---------------------------------------------------------------- export

export function isBlankGoal(g: Goal): boolean {
  return g.preset === "none" && !g.name && !g.horizonYears.entered && !g.amountNow.entered && !g.monthly.entered && !g.available.entered && !g.anytime.entered && g.profile.salary === null && g.assumptions.return === null && g.assumptions.acceptedFall == null && Object.keys(g.exposures ?? {}).length === 0;
}

export function exportCounts(s: StateV3, side?: SideStores) {
  const sc = side ? sideCounts(side) : noSideCounts();
  return {
    goals: s.goals.filter((g) => !isBlankGoal(g)).length,
    holdings: s.holdings.length,
    names: s.uncatalogued.length,
    inputs: Object.keys(s.inputs).length > 0,
    comparisons: s.savedComparisons.length,
    offers: sc.offers,
    variants: sc.variants,
    ticks: sc.ticks,
    ownRates: sc.ownRates,
  };
}

/** The three side stores as this device holds them now (browser only; empty on the server). */
export function currentSideStores(): SideStores {
  return readSideStores(theStorage());
}

/** Nothing worth a file: no goal with content, no holding, no name, no guide input, no saved comparison, no side store. */
export function isEmptyState(s: StateV3, side?: SideStores): boolean {
  const c = exportCounts(s, side);
  return c.goals === 0 && c.holdings === 0 && c.names === 0 && !c.inputs && c.comparisons === 0 && c.offers + c.variants + c.ticks + c.ownRates === 0;
}

export function buildStateFile(s: StateV3, site: { version: string; data: string }, now = new Date(), side?: SideStores): StateFile {
  const goals = s.goals.filter((g) => !isBlankGoal(g));
  const currentId = s.currentId && goals.some((g) => g.id === s.currentId) ? s.currentId : undefined;
  const state: StateV3 = { ...s, goals, currentId, savedComparisons: s.savedComparisons.filter((c) => !isObj(c) || goals.some((g) => g.id === c.goalId)) };
  if (currentId === undefined) delete state.currentId;
  return { format: "mekor-state", version: STATE_VERSION, exported: now.toISOString(), site, state, ...(side && !sideIsEmpty(side) ? { sideStores: side } : {}) };
}

export function stateFileText(f: StateFile): string {
  return JSON.stringify(f, null, 2);
}

/** `mekor-state-YYYY-MM-DD.json`; a second export the same day adds `-2`, a third `-3`. */
export function exportFileName(date: string, count = 1): string {
  return `mekor-state-${date}${count > 1 ? `-${count}` : ""}.json`;
}

/** The name the next export on this device takes, and remembers it. */
export function nextExportName(date = isoToday(), remember = true): string {
  const s = theStorage();
  let n = 1;
  try {
    const raw = s?.getItem(EXPORTS_KEY);
    const rec = raw ? (JSON.parse(raw) as { date?: string; n?: number }) : null;
    if (rec && rec.date === date && typeof rec.n === "number") n = rec.n + 1;
    if (remember) s?.setItem(EXPORTS_KEY, JSON.stringify({ date, n }));
  } catch {
    /* the counter is a convenience */
  }
  return exportFileName(date, n);
}

/** What the name would be, without counting it (the line under the buttons). */
export function peekExportName(date = isoToday()): string {
  return nextExportName(date, false);
}

// ---------------------------------------------------------------- import

export interface ImportPreviewData {
  file: StateFile;
  /** The file's state as this release reads it (an older version already migrated), without the items that failed their check. */
  state: StateV3;
  migrated: boolean;
  counts: { goals: number; holdings: number; names: number; comparisons: number; offers: number; variants: number; ticks: number; ownRates: number };
  /** The file's side stores that passed their check, or null when the file has none. */
  side: SideStores | null;
  /** Goals, holdings, saved comparisons and inputs left out for a field that failed (A33), and side-store items likewise. */
  rejected: Rejected[];
  sideProblems: SideProblem[];
}

export type ImportRead = { ok: true; preview: ImportPreviewData } | { ok: false; refusal: Refusal };

/** Parses and checks text or a file's content. Nothing on the device changes. */
export function readImport(text: string): ImportRead {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    // text that is not JSON at all: most likely something else was pasted (a statement)
    return { ok: false, refusal: { kind: text.trim() === "" ? "unreadable" : "format" } };
  }
  if (!isObj(json) || json.format !== "mekor-state") return { ok: false, refusal: { kind: "format" } };
  if (typeof json.version !== "number") return { ok: false, refusal: { kind: "invalid", field: "version" } };
  if (typeof json.exported !== "string") return { ok: false, refusal: { kind: "invalid", field: "exported" } };
  if (!isObj(json.site) || typeof json.site.version !== "string" || typeof json.site.data !== "string") return { ok: false, refusal: { kind: "invalid", field: "site" } };
  const { state: cleaned, rejected } = sanitizeRawState(json.state);
  const r = readState(cleaned, json.version);
  if (!r.ok) return r;
  const { side, problems } = readSideFile(json.sideStores);
  const goals = r.state.goals.filter((g) => !isBlankGoal(g)).length;
  const sc = side ? sideCounts(side) : noSideCounts();
  return {
    ok: true,
    preview: {
      file: json as unknown as StateFile,
      state: r.state,
      migrated: r.migrated,
      counts: { goals, holdings: r.state.holdings.length, names: r.state.uncatalogued.length, comparisons: r.state.savedComparisons.length, ...sc },
      side,
      rejected,
      sideProblems: problems,
    },
  };
}

/** What makes an item the same item on another device: everything but its id, its place in the list and the import tag. */
const fingerprint = (x: object): string => {
  const { id: _id, order: _order, importedAt: _imported, ...rest } = x as { id?: string; order?: number; importedAt?: string };
  return JSON.stringify(rest);
};

export interface ImportResult {
  state: StateV3;
  added: { goals: number; holdings: number; names: number; comparisons: number };
  skipped: number;
  /** "Add": the first goal this import added, so the page can offer to switch to it (A69). */
  firstAddedGoalId?: string;
}

/**
 * "Add": goals, holdings and names are merged; an item that is already on the device is skipped and counted, whatever
 * its place in the list or import tag, and a copy an earlier import added under a new id (so the same file twice adds nothing the second time, A33); an item with the same id and
 * other content is added under a new id; appended items carry `importedAt` and an `order` after the existing ones; the
 * device's own current goal stays. The guide inputs are kept as they are on the device, and a value only the file has
 * is filled in. A saved comparison follows its goal, also to the goal that was already there.
 * "Replace": the file's state as it is (its items carry no imported tag: they are what the device now holds).
 */
export function applyImport(current: StateV3, incoming: StateV3, mode: "add" | "replace", today = isoToday()): ImportResult {
  if (mode === "replace") {
    const goals = incoming.goals.filter((g) => !isBlankGoal(g));
    const savedComparisons = incoming.savedComparisons.filter((c) => !isObj(c) || goals.some((g) => g.id === c.goalId));
    return {
      state: { ...incoming, goals, savedComparisons, imports: [...incoming.imports, { at: today, mode, goals: goals.length, holdings: incoming.holdings.length, names: incoming.uncatalogued.length, skipped: 0 }] },
      added: { goals: goals.length, holdings: incoming.holdings.length, names: incoming.uncatalogued.length, comparisons: savedComparisons.length },
      skipped: 0,
    };
  }
  let skipped = 0;
  const added = { goals: 0, holdings: 0, names: 0, comparisons: 0 };
  /** The file's goal id → the id it has on this device (the twin already there, or the new id it was added under): its saved comparisons follow. */
  const goalIds = new Map<string, string>();
  const strip = <T extends { importedAt?: string }>(x: T): T => {
    const { importedAt: _drop, ...rest } = x;
    return rest as T;
  };
  const merge = <T extends { id: string; importedAt?: string }>(have: T[], incomingItems: T[], reid: (x: T, id: string) => T, count: "goals" | "holdings"): T[] => {
    const out = [...have];
    for (const item of incomingItems) {
      // the same id and content, or a copy this device took in by an earlier import under a new id (not two accounts of the person's own that happen to read alike)
      const fp = fingerprint(item);
      const twin = out.find((x) => x.id === item.id && fingerprint(x) === fp) ?? have.find((x) => x.importedAt && fingerprint(x) === fp);
      if (twin) {
        skipped += 1;
        if (count === "goals") goalIds.set(item.id, twin.id);
        continue;
      }
      const clash = out.some((x) => x.id === item.id);
      const id = clash ? `${item.id}-i${Date.now().toString(36)}${out.length}` : item.id;
      if (count === "goals") goalIds.set(item.id, id);
      out.push({ ...reid(strip(item), id), importedAt: today });
      added[count] += 1;
    }
    return out;
  };
  const incomingGoals = incoming.goals.filter((g) => !isBlankGoal(g));
  const haveGoalIds = new Set(current.goals.map((g) => g.id));
  let goals = merge(current.goals, incomingGoals, (g, id) => ({ ...g, id }), "goals");
  const top = current.goals.length === 0 ? -1 : Math.max(...current.goals.map((g) => g.order));
  let k = 0;
  goals = goals.map((g) => (g.importedAt === today && !haveGoalIds.has(g.id) ? { ...g, order: top + 1 + k++ } : g));
  const firstAddedGoalId = goals.find((g) => g.importedAt === today && !haveGoalIds.has(g.id))?.id;
  const haveHoldingIds = new Set(current.holdings.map((h) => h.id));
  const topH = current.holdings.length === 0 ? -1 : Math.max(...current.holdings.map((h) => h.order));
  let kh = 0;
  const holdings = merge(current.holdings, incoming.holdings, (h, id) => ({ ...h, id }), "holdings").map((h) => (h.importedAt === today && !haveHoldingIds.has(h.id) ? { ...h, order: topH + 1 + kh++ } : h));
  const names = [...current.uncatalogued];
  for (const u of incoming.uncatalogued) {
    if (names.some((x) => x.name === u.name)) skipped += 1;
    else {
      names.push({ ...strip(u), importedAt: today });
      added.names += 1;
    }
  }
  const inputs = { ...incoming.inputs, ...current.inputs };
  // saved comparisons merge by goal and mode; the device's own wins when both exist (design-spec 21.5)
  const savedComparisons = [...current.savedComparisons];
  for (const c of incoming.savedComparisons) {
    if (!isObj(c) || typeof c.goalId !== "string") continue;
    const goalId = goalIds.get(c.goalId) ?? c.goalId;
    if (!goals.some((g) => g.id === goalId)) continue;
    if (savedComparisons.some((x) => isObj(x) && x.goalId === goalId && x.mode === c.mode)) {
      skipped += 1;
      continue;
    }
    savedComparisons.push({ ...c, goalId });
    added.comparisons += 1;
  }
  const state: StateV3 = {
    ...current,
    goals,
    inputs,
    savedComparisons,
    holdings,
    uncatalogued: names,
    ...(current.bank ? { bank: current.bank } : incoming.bank ? { bank: incoming.bank } : {}),
    imports: [...current.imports, { at: today, mode, goals: added.goals, holdings: added.holdings, names: added.names, skipped }],
  };
  return { state, added, skipped, ...(firstAddedGoalId ? { firstAddedGoalId } : {}) };
}

/** The current goal becomes this one (A69, "לעבור למטרה שיובאה"). */
export function switchToGoal(id: string): void {
  updateState((s) => (s.goals.some((g) => g.id === id) ? { ...s, currentId: id } : s));
  flush(true);
}

/** Merges a file's side stores into the device's and writes them. Returns what was added and skipped. */
export function applySideImport(file: SideStores | null, mode: "add" | "replace"): SideMerge & { written: boolean } {
  const r = mergeSide(currentSideStores(), file, mode);
  const st = theStorage();
  const written = file ? writeSideStores(st, r.merged) : true;
  if (file && st) {
    // "add" records what it added (on top of earlier imports); "replace" makes the file's items the device's own, untagged like holdings
    try {
      if (mode === "replace") st.removeItem(IMPORTED_SIDE_KEY);
      else if (sideTotal(r.addedItems) > 0) {
        const prev = readImportedSide(st);
        const all = mergeSide(prev, r.addedItems, "add").merged;
        st.setItem(IMPORTED_SIDE_KEY, JSON.stringify(all));
      }
    } catch {
      /* the record is a convenience: without it the undo leaves the side items */
    }
  }
  return { ...r, written };
}

export type { SideCounts, SideStores };
