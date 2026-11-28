// The saved state, version 3 (design-spec 11.5 and 21.5, flows 17 and 26): one document `mekor.v2.state` on the device that
// holds the guide inputs, the holdings and the names not catalogued yet, the index page's own entries, plus the record of imports.
// The storage key is unchanged (the document's own `version` says what it is); version 2 migrates on load and on import. The goals
// and the saved comparisons of the version 3 shape stay as empty lists: an older tab still open reads the document as its own
// version and keeps the holdings and entries, where a newer version would have it offer to start again over them. Any goals,
// current goal or saved comparisons a document or file holds are left out without a word: no page reads them. It replaces the
// release 2 keys `mekor.v1.inputs`, `mekor.v1.goals` and `mekor.v1.uncatalogued`: the first load after the release migrates them
// once (nothing of the goals document) and removes them after a successful write. Browser only; nothing is sent anywhere.
// `lib/inputs.tsx` reads and writes through this store.
//
// The export file (`StateFile`) is this document with a header; the import checks it before anything changes.
import { useSyncExternalStore } from "react";
import { z } from "zod";
import { valueObject, type ValueObject, type WrapperId } from "@finance-tool/schema";
import type { CustomIndex } from "./invest";
import { isIndexRegion } from "./index-region";
import { validCustomBrokers, validCustomFunds, type CustomBroker, type CustomFund } from "./custom-entries";
import { todayLocal } from "./today";
import { askToKeepStorage } from "./keep-storage";
import { entered as enteredValue, p05Units } from "./value";
import { sanitizeRawState, type Rejected } from "./import-check";
import type { PlanBounds } from "./plan-bounds";
import { IMPORTED_SIDE_KEY, mergeSide, noSideCounts, readImportedSide, readSideFile, readSideStores, removeImportedSide, sideCounts, sideTotal, sideIsEmpty, writeSideStores, type DealProblem, type SideCounts, type SideMerge, type SideProblem, type SideStores } from "./side-stores";

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
  /** A study fund: the first deposit was more than six years ago, so the fund is liquid (TXH-09); entered boolean true, in place of an exact date. */
  firstDepositOverSix?: ValueObject;
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
  /** How many goals an import added: only in a record an earlier release wrote. */
  goals?: number;
  holdings: number;
  names: number;
  skipped: number;
  /** What an "add" import put on the device that is kept by id or key, not tagged: "מחיקת מה שיובא" takes exactly this away. Absent in a
   *  record written before, and in a "replace" (what it loaded is the device's own). */
  brought?: Brought;
}

/** The index page's entries and the plan numbers an "add" import put on the device: ids and keys the device did not have. */
interface Brought {
  /** The keys of the guide inputs only the file had (`inputs`). */
  inputs: string[];
  indices: string[];
  funds: string[];
  /** The typed securities accounts (`customBrokers`). */
  accounts: string[];
  /** The current broker, where the device had none. */
  broker: string | null;
}

const brought = z.object({ inputs: z.array(z.string()), indices: z.array(z.string()), funds: z.array(z.string()), accounts: z.array(z.string()), broker: z.string().nullable() });

/** Everything the device's import records say an "add" import brought; a record that is not one (an older tab's, a hand-edited file's) adds nothing. */
function broughtOf(imports: readonly unknown[]): Brought {
  const all: Brought = { inputs: [], indices: [], funds: [], accounts: [], broker: null };
  for (const r of imports) {
    const b = brought.safeParse(isObj(r) ? r.brought : undefined);
    if (!b.success) continue;
    all.inputs.push(...b.data.inputs);
    all.indices.push(...b.data.indices);
    all.funds.push(...b.data.funds);
    all.accounts.push(...b.data.accounts);
    all.broker = b.data.broker ?? all.broker;
  }
  return all;
}

export interface StateV3 {
  version: 3;
  /** Always empty: kept so an older tab reads the document (no page reads goals). */
  goals: [];
  /** Always empty, for the same reason. */
  savedComparisons: [];
  /** The guide inputs (A-01, A-02, the P-05 amounts, age, employment), each a value object. */
  inputs: Record<string, ValueObject>;
  holdings: Holding[];
  uncatalogued: Uncatalogued[];
  imports: ImportRecord[];
  /** "השקעה במדד" (D28): the indices the person added, kept on the device and in the export file; an older document has none. */
  customIndices?: CustomIndex[];
  /** The securities accounts typed on the index page before a deal took their place, kept until each moves into a deal (the move, method §10.4). */
  customBrokers?: CustomBroker[];
  /** The index page's own: a fund the person typed (D44), on the device and in the export file; an older document has none. */
  customFunds?: CustomFund[];
  /** The person's current broker (a fee snapshot id), optional; "החשבון שלכם" on the same page. */
  broker?: string;
}

export interface StateFile {
  format: "mekor-state";
  version: number;
  exported: string;
  site: { version: string; data: string };
  state: StateV3;
  /**
   * The entered offers, the variant assumptions and the playbook ticks, which live in their own device keys until the
   * founder approves their merge into the document. Absent in a file from before.
   */
  sideStores?: SideStores;
}

/** The export file's header, checked on import before its state is read. */
const stateFileHeader = z.object({ format: z.literal("mekor-state"), version: z.number(), exported: z.string(), site: z.object({ version: z.string(), data: z.string() }) });
type StateFileHeader = z.infer<typeof stateFileHeader>;
const headerFields = ["version", "exported", "site"] as const;

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
  /** A-17: the insurance cost of a pension fund as a percent of each deposit (G-12), as the saved state holds it; no page enters it. Absent: not entered. */
  insurance?: number | null;
}

/** The release 1 inputs as the v2 document keeps them: every number a value object in state `entered`. */
export function inputsToRecord(i: InputsLike, today = isoToday()): Record<string, ValueObject> {
  const out: Record<string, ValueObject> = {};
  for (const [k, v] of Object.entries(i.entered)) if (Number.isFinite(v)) out[k] = enteredValue(v, (p05Units as Record<string, ValueObject["unit"]>)[k] ?? "count", today);
  if (i.age !== null) out.age = enteredValue(i.age, "years", today);
  if (i.employment !== null) out.employment = { ...enteredValue(0, "text", today), value: i.employment };
  if (typeof i.insurance === "number" && Number.isFinite(i.insurance)) out.insurance = enteredValue(i.insurance, "pct", today);
  return out;
}

export function inputsFromRecord(rec: Record<string, ValueObject>): InputsLike {
  const entered: Record<string, number> = {};
  for (const [k, v] of Object.entries(rec)) if (k !== "age" && k !== "employment" && k !== "insurance" && typeof v.value === "number") entered[k] = v.value;
  const age = typeof rec.age?.value === "number" ? rec.age.value : null;
  const e = rec.employment?.value;
  const insurance = typeof rec.insurance?.value === "number" ? rec.insurance.value : null;
  return { entered, age, employment: e === "employee" || e === "self-employed" ? e : null, insurance };
}

// ---------------------------------------------------------------- reading and checking a document

const isObj = (x: unknown): x is Record<string, unknown> => typeof x === "object" && x !== null && !Array.isArray(x);

/** The document versions the store reads: 2 migrates, 3 is the current one. */
const readable = (v: unknown): boolean => v === 2 || v === STATE_VERSION;

export type Refusal =
  | { kind: "unreadable" }
  | { kind: "format" }
  /** The site's own file, cut short or changed by hand so it no longer reads. */
  | { kind: "damaged" }
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

const holdingValueFields = ["balance", "embeddedGain", "feeBalance", "feeDeposit", "directExpenses", "monthlyOwn", "monthlyEmployer", "firstDeposit", "firstDepositOverSix", "statementDate"] as const;

function voAt(v: unknown, path: string): string | null {
  const r = valueObject.safeParse(v);
  if (r.success) return null;
  const issue = r.error.issues[0]!;
  return [path, ...issue.path.map(String)].join(".");
}

/**
 * The first problem of a version 2 or 3 document, as the field's path, or null. Every figure must stay a value object (data-schema §1).
 * The goals and saved comparisons a document holds are not read, so they are not checked.
 */
export function checkState(s: unknown): string | null {
  if (!isObj(s)) return "state";
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
  return null;
}

/**
 * The custom indices of a document that pass the shape check; a bad entry is left out, never a reason to refuse the file. A region or a
 * yield that does not parse reads as not said, and the index is kept.
 */
export function validCustomIndices(list: unknown[]): CustomIndex[] {
  const out: CustomIndex[] = [];
  for (const c of list) {
    if (!isObj(c) || typeof c.id !== "string" || !c.id || typeof c.name !== "string" || !c.name.trim() || out.some((x) => x.id === c.id)) continue;
    const region = isIndexRegion(c.region) ? c.region : null;
    const dividendYield = enteredPercent(c.dividendYield);
    out.push({ id: c.id, name: c.name, ...(typeof c.currency === "string" && c.currency ? { currency: c.currency } : {}), ...(region ? { region } : {}), ...(dividendYield ? { dividendYield } : {}), added: typeof c.added === "string" ? c.added : "" });
  }
  return out;
}

/** An entered percent a year from 0 to 100, as a typed index's dividend yield is kept; null where the value is not one. */
function enteredPercent(raw: unknown): ValueObject | null {
  const r = valueObject.safeParse(raw);
  if (!r.success || r.data.state !== "entered" || r.data.unit !== "pct_per_year") return null;
  const v = r.data.value;
  return typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100 ? r.data : null;
}

/** A version 2 or 3 document as the version 3 shape: its goals and saved comparisons become empty lists, its current goal and a `visits` field of an earlier file are left out (the migration chain, design-spec 21.5). */
function normalizeState(s: Record<string, unknown>): StateV3 {
  const base = emptyState();
  return {
    version: 3,
    goals: [],
    savedComparisons: [],
    ...(Array.isArray(s.customIndices) && validCustomIndices(s.customIndices).length ? { customIndices: validCustomIndices(s.customIndices) } : {}),
    ...(Array.isArray(s.customBrokers) && validCustomBrokers(s.customBrokers).length ? { customBrokers: validCustomBrokers(s.customBrokers) } : {}),
    ...(Array.isArray(s.customFunds) && validCustomFunds(s.customFunds).length ? { customFunds: validCustomFunds(s.customFunds) } : {}),
    ...(typeof s.broker === "string" && s.broker ? { broker: s.broker } : {}),
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

/** Migration v1 → v3: the three release 2 documents become one, nothing of the goals document. Returns null when there was nothing to carry over. */
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
  if (isObj(v1.goals) && v1.goals.version === 1 && Array.isArray(v1.goals.goals)) {
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
/** An edit is waiting to be written: pagehide and the timer write only then (a document someone cleared is not put back). */
let dirty = false;
let timer: ReturnType<typeof setTimeout> | null = null;
/** The person has changed the document on this page (an edit, an import): its first write asks the browser to keep the storage. */
let edited = false;
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
  dirty = false;
  edited = false;
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
    if (e.key === STATE_KEY) rereadState();
  });
  // the Back button brought the page back from the browser's page cache: another tab may have changed the document meanwhile
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) rereadState();
  });
}

/**
 * Reads the document again after something outside this page may have changed it, and lets the providers re-read theirs: one removed
 * reads as empty, one that does not check out leaves the page as it is. Not while the page holds an edit the device does not.
 */
export function rereadState(): void {
  // an edit not yet written, or one the device refused, is newer than what the device holds: reading it would put the page back
  if (dirty || !snap.saved || snap.status === "unavailable") return;
  const s = theStorage();
  if (!s) return;
  const r = readJson(s, STATE_KEY);
  const parsed = !r.present ? emptyState() : isObj(r.value) && readable(r.value.version) && checkState(r.value) === null ? normalizeState(r.value) : null;
  if (parsed) set({ state: parsed, external: snap.external + 1 });
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
      if (isObj(v) && readable(v.version) && checkState(v) === null) {
        // an older document, or one that still holds goals or saved comparisons, is written in the current shape at once
        const norm = normalizeState(v);
        set({ ready: true, status: "ok", state: norm });
        const held = (k: string) => (Array.isArray(v[k]) && (v[k] as unknown[]).length > 0) || (k === "currentId" && k in v);
        if (v.version !== STATE_VERSION || ["goals", "savedComparisons", "currentId"].some(held)) schedule();
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
    for (const k of [V1_INPUTS, V1_GOALS, V1_UNCAT]) s.removeItem(k);
    if (!snap.saved) set({ saved: true });
    if (edited) askToKeepStorage();
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
  const next = fn(snap.state);
  if (next === snap.state) return;
  set({ state: next });
  if (snap.status === "unavailable") memory = next;
  edited = true;
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
  edited = true;
  return flush(true);
}

/** The person chose to start again or to delete an unreadable document: it may be written over. */
export function takeOver(): void {
  ensureLoaded();
  readOnly = false;
  if (snap.status === "old-version") set({ status: "ok" });
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

/** A name from a statement the site could not match (flow 6, 22), kept once. */
export function rememberName(name: string, context?: string): void {
  updateState((s) => (s.uncatalogued.some((u) => u.name === name) ? s : { ...s, uncatalogued: [...s.uncatalogued, { name, seen: isoToday(), ...(context ? { context } : {}) }] }));
}

// ---------------------------------------------------------------- the index page's own state (D28)

export function saveCustomIndex(c: CustomIndex): void {
  updateState((s) => {
    const have = s.customIndices ?? [];
    return { ...s, customIndices: [...have.filter((x) => x.id !== c.id), c] };
  });
}

/** Renames a custom index; its id stays (it is in the address). An empty name changes nothing. */
export function renameCustomIndex(id: string, name: string): void {
  const next = name.trim();
  if (!next) return;
  updateState((s) => ({ ...s, customIndices: (s.customIndices ?? []).map((x) => (x.id === id ? { ...x, name: next } : x)) }));
}

export function removeCustomIndex(id: string): void {
  updateState((s) => {
    const next = (s.customIndices ?? []).filter((x) => x.id !== id);
    const { customIndices: _drop, ...rest } = s;
    void _drop;
    // a fund the person added belongs to its index and goes with it
    return withList(next.length ? { ...rest, customIndices: next } : rest, "customFunds", (s.customFunds ?? []).filter((f) => f.indexId !== id));
  });
}

/** The state with a list of entries, the key left out when it is empty (as a document that never had any). */
function withList<K extends "customBrokers" | "customFunds">(s: StateV3, key: K, list: NonNullable<StateV3[K]>): StateV3 {
  const { [key]: _drop, ...rest } = s;
  void _drop;
  return (list.length ? { ...rest, [key]: list } : rest) as StateV3;
}

/** Takes the typed accounts moved into deals out of the saved state (the move, method §10.4; lib/deal-account/move-run.ts). */
export function dropTypedAccounts(ids: readonly string[]): void {
  updateState((s) => withList(s, "customBrokers", (s.customBrokers ?? []).filter((x) => !ids.includes(x.id))));
}

/** Adds a fund the person typed, or replaces the one with its id (D44). */
export function saveCustomFund(f: CustomFund): void {
  updateState((s) => {
    const have = s.customFunds ?? [];
    return withList(s, "customFunds", have.some((x) => x.id === f.id) ? have.map((x) => (x.id === f.id ? f : x)) : [...have, f]);
  });
}

export function removeCustomFund(id: string): void {
  updateState((s) => withList(s, "customFunds", (s.customFunds ?? []).filter((x) => x.id !== id)));
}

/** The person's current broker for "החשבון שלכם"; null clears it. */
export function setCurrentBroker(id: string | null): void {
  updateState((s) => {
    const { broker: _drop, ...rest } = s;
    void _drop;
    return id ? { ...rest, broker: id } : rest;
  });
}

/** One empty list for every render: a new `[]` each time made the index page price every account and fund again on any change. */
const NO_CUSTOM: CustomIndex[] = [];
const NO_BROKERS: CustomBroker[] = [];
const NO_FUNDS: CustomFund[] = [];

export function useInvestState() {
  const snapshot = useStateStore();
  return { ready: snapshot.ready, status: snapshot.status, customIndices: snapshot.state.customIndices ?? NO_CUSTOM, customBrokers: snapshot.state.customBrokers ?? NO_BROKERS, customFunds: snapshot.state.customFunds ?? NO_FUNDS, broker: snapshot.state.broker ?? null, saved: snapshot.saved, add: saveCustomIndex, rename: renameCustomIndex, remove: removeCustomIndex, setBroker: setCurrentBroker, saveFund: saveCustomFund, removeFund: removeCustomFund };
}

// ---------------------------------------------------------------- imported items

/** What "add" imports put on the device that is still there: holdings and names by their tag, the rest as their records say (`Brought`). */
export function importedCount(s: StateV3): { holdings: number; names: number; inputs: number; indices: number; funds: number; accounts: number; total: number } {
  const b = broughtOf(s.imports);
  const holdings = s.holdings.filter((h) => h.importedAt).length;
  const names = s.uncatalogued.filter((u) => u.importedAt).length;
  const inputs = b.inputs.filter((k) => k in s.inputs).length;
  const indices = (s.customIndices ?? []).filter((x) => b.indices.includes(x.id)).length;
  const funds = (s.customFunds ?? []).filter((x) => b.funds.includes(x.id)).length;
  const accounts = (s.customBrokers ?? []).filter((x) => b.accounts.includes(x.id)).length;
  const broker = b.broker !== null && s.broker === b.broker ? 1 : 0;
  return { holdings, names, inputs, indices, funds, accounts, total: holdings + names + inputs + indices + funds + accounts + broker };
}

/** "מחיקת מה שיובא": every item an "add" import brought goes (the tagged holdings and names, and what the records name: the plan numbers,
 *  the indices with the funds on them, the funds, the typed accounts, the broker), the rest stays. */
export function withoutImported(s: StateV3): StateV3 {
  const b = broughtOf(s.imports);
  const { customIndices: _i, customFunds: _f, customBrokers: _a, broker: _b, ...rest } = s;
  void _i;
  void _f;
  void _a;
  void _b;
  const indices = (s.customIndices ?? []).filter((x) => !b.indices.includes(x.id));
  // a fund on an index that goes goes with it, as when the person removes the index (`removeCustomIndex`)
  const funds = (s.customFunds ?? []).filter((x) => !b.funds.includes(x.id) && !b.indices.includes(x.indexId));
  const accounts = (s.customBrokers ?? []).filter((x) => !b.accounts.includes(x.id));
  const broker = s.broker !== undefined && s.broker !== b.broker ? s.broker : null;
  return {
    ...rest,
    inputs: Object.fromEntries(Object.entries(s.inputs).filter(([k]) => !b.inputs.includes(k))),
    holdings: s.holdings.filter((h) => !h.importedAt),
    uncatalogued: s.uncatalogued.filter((u) => !u.importedAt),
    ...(indices.length ? { customIndices: indices } : {}),
    ...(funds.length ? { customFunds: funds } : {}),
    ...(accounts.length ? { customBrokers: accounts } : {}),
    ...(broker ? { broker } : {}),
    imports: [],
  };
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

export function exportCounts(s: StateV3, side?: SideStores) {
  const sc = side ? sideCounts(side) : noSideCounts();
  return {
    holdings: s.holdings.length,
    names: s.uncatalogued.length,
    inputs: Object.keys(s.inputs).length > 0,
    indices: (s.customIndices ?? []).length,
    funds: (s.customFunds ?? []).length,
    accounts: (s.customBrokers ?? []).length,
    offers: sc.offers,
    variants: sc.variants,
    ticks: sc.ticks,
    ownRates: sc.ownRates,
    deals: sc.deals,
  };
}

/** The side stores as this device holds them now (browser only; empty on the server). */
export function currentSideStores(): SideStores {
  return readSideStores(theStorage());
}

/** Nothing worth a file: no holding, no name, no guide input, no entry of the index page, no side store. */
export function isEmptyState(s: StateV3, side?: SideStores): boolean {
  const c = exportCounts(s, side);
  return c.holdings === 0 && c.names === 0 && !c.inputs && c.indices === 0 && c.funds === 0 && c.accounts === 0 && c.offers + c.variants + c.ticks + c.ownRates + c.deals === 0;
}

export function buildStateFile(s: StateV3, site: { version: string; data: string }, now = new Date(), side?: SideStores): StateFile {
  return { format: "mekor-state", version: STATE_VERSION, exported: now.toISOString(), site, state: s, ...(side && !sideIsEmpty(side) ? { sideStores: side } : {}) };
}

export function stateFileText(f: StateFile): string {
  return JSON.stringify(f, null, 2);
}

/** What the device keeps under EXPORTS_KEY: the day of the last export and how many were made that day. Anything else counts from 1. */
const exportCount = z.object({ date: z.string(), n: z.number() });

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
    const rec = raw ? exportCount.safeParse(JSON.parse(raw)) : null;
    if (rec?.success && rec.data.date === date) n = rec.data.n + 1;
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
  /** The file's header: when and by which build it was written. */
  file: StateFileHeader;
  /** The file's state as this release reads it (an older version already migrated), without the items that failed their check. */
  state: StateV3;
  migrated: boolean;
  counts: ImportCounts;
  /** The file's side stores that passed their check, or null when the file has none. */
  side: SideStores | null;
  /** Holdings and inputs left out for a field that failed (A33), and side-store items likewise. */
  rejected: Rejected[];
  sideProblems: SideProblem[];
  /** Saved deals in the file that are not deals (`readDeal`), left out. */
  dealProblems: DealProblem[];
}

/** What a file holds, by kind: the state's items and the side stores' (`inputs`: whether it holds plan numbers). */
type ImportCounts = { holdings: number; names: number; inputs: boolean; indices: number; funds: number; accounts: number } & SideCounts;

export type ImportRead = { ok: true; preview: ImportPreviewData } | { ok: false; refusal: Refusal };

/** Parses and checks text or a file's content, each plan number against its bound (`bounds`, P-05's). Nothing on the device changes. */
export function readImport(text: string, bounds: PlanBounds): ImportRead {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    // text that is not JSON at all: most likely something else was pasted (a statement); text that names the site's format is its file, damaged
    return { ok: false, refusal: { kind: text.trim() === "" ? "unreadable" : /"format"\s*:\s*"mekor-state"/.test(text) ? "damaged" : "format" } };
  }
  if (!isObj(json) || json.format !== "mekor-state") return { ok: false, refusal: { kind: "format" } };
  const head = stateFileHeader.safeParse(json);
  // the first field out of order is named, in the header's order
  if (!head.success) return { ok: false, refusal: { kind: "invalid", field: headerFields.find((f) => head.error.issues.some((i) => i.path[0] === f)) ?? "format" } };
  const { state: cleaned, rejected } = sanitizeRawState(json.state, bounds);
  const r = readState(cleaned, head.data.version);
  if (!r.ok) return r;
  const { side, problems, dealProblems } = readSideFile(json.sideStores);
  const sc = side ? sideCounts(side) : noSideCounts();
  return {
    ok: true,
    preview: {
      file: head.data,
      state: r.state,
      migrated: r.migrated,
      counts: { holdings: r.state.holdings.length, names: r.state.uncatalogued.length, inputs: Object.keys(r.state.inputs).length > 0, indices: (r.state.customIndices ?? []).length, funds: (r.state.customFunds ?? []).length, accounts: (r.state.customBrokers ?? []).length, ...sc },
      side,
      rejected,
      sideProblems: problems,
      dealProblems,
    },
  };
}

/** What makes an item the same item on another device: everything but its id, its place in the list and the import tag. */
const fingerprint = (x: object): string => {
  const { id: _id, order: _order, importedAt: _imported, ...rest } = x as { id?: string; order?: number; importedAt?: string };
  return JSON.stringify(rest);
};

/** What a load added, by kind (`inputs`: how many plan numbers only the file had). */
export type ImportAdded = { holdings: number; names: number; inputs: number; indices: number; funds: number; accounts: number };

export interface ImportResult {
  state: StateV3;
  added: ImportAdded;
  skipped: number;
}

/**
 * "Add": holdings and names are merged; an item that is already on the device is skipped and counted, whatever
 * its place in the list or import tag, and a copy an earlier import added under a new id (so the same file twice adds nothing the second time, A33); an item with the same id and
 * other content is added under a new id; appended items carry `importedAt` and an `order` after the existing ones. The guide inputs
 * are kept as they are on the device, and a value only the file has is filled in. An index, a fund or a typed account the device already has
 * (by id) stays as it is. What was added by id or key is written in the import's record (`brought`); an import that adds nothing writes none.
 * "Replace": the file's state as it is (its items carry no imported tag: they are what the device now holds).
 */
export function applyImport(current: StateV3, incoming: StateV3, mode: "add" | "replace", today = isoToday()): ImportResult {
  if (mode === "replace") {
    return {
      state: { ...incoming, imports: [...incoming.imports, { at: today, mode, holdings: incoming.holdings.length, names: incoming.uncatalogued.length, skipped: 0 }] },
      added: { holdings: incoming.holdings.length, names: incoming.uncatalogued.length, inputs: Object.keys(incoming.inputs).length, indices: (incoming.customIndices ?? []).length, funds: (incoming.customFunds ?? []).length, accounts: (incoming.customBrokers ?? []).length },
      skipped: 0,
    };
  }
  let skipped = 0;
  const added = { holdings: 0, names: 0 };
  const strip = <T extends { importedAt?: string }>(x: T): T => {
    const { importedAt: _drop, ...rest } = x;
    return rest as T;
  };
  const merge = <T extends { id: string; importedAt?: string }>(have: T[], incomingItems: T[], reid: (x: T, id: string) => T): T[] => {
    const out = [...have];
    for (const item of incomingItems) {
      // the same id and content, or a copy this device took in by an earlier import under a new id (not two accounts of the person's own that happen to read alike)
      const fp = fingerprint(item);
      const twin = out.find((x) => x.id === item.id && fingerprint(x) === fp) ?? have.find((x) => x.importedAt && fingerprint(x) === fp);
      if (twin) {
        skipped += 1;
        continue;
      }
      const clash = out.some((x) => x.id === item.id);
      const id = clash ? `${item.id}-i${Date.now().toString(36)}${out.length}` : item.id;
      out.push({ ...reid(strip(item), id), importedAt: today });
      added.holdings += 1;
    }
    return out;
  };
  const haveHoldingIds = new Set(current.holdings.map((h) => h.id));
  const topH = current.holdings.length === 0 ? -1 : Math.max(...current.holdings.map((h) => h.order));
  let kh = 0;
  const holdings = merge(current.holdings, incoming.holdings, (h, id) => ({ ...h, id })).map((h) => (h.importedAt === today && !haveHoldingIds.has(h.id) ? { ...h, order: topH + 1 + kh++ } : h));
  const names = [...current.uncatalogued];
  for (const u of incoming.uncatalogued) {
    if (names.some((x) => x.name === u.name)) skipped += 1;
    else {
      names.push({ ...strip(u), importedAt: today });
      added.names += 1;
    }
  }
  const newInputs = Object.keys(incoming.inputs).filter((k) => !(k in current.inputs));
  // an entry the device already has (by id) stays as it is and counts as skipped; the file's others are added
  const fresh = <T extends { id: string }>(have: T[] = [], file: T[] = []) => {
    const add = file.filter((c) => !have.some((x) => x.id === c.id));
    skipped += file.length - add.length;
    return { all: [...have, ...add], ids: add.map((c) => c.id) };
  };
  const indices = fresh(current.customIndices, incoming.customIndices);
  const funds = fresh(current.customFunds, incoming.customFunds);
  const accounts = fresh(current.customBrokers, incoming.customBrokers);
  // the device's own broker stays; the file's fills a device with none
  const fileBroker = current.broker === undefined && incoming.broker !== undefined ? incoming.broker : null;
  const broker = current.broker ?? incoming.broker;
  const b: Brought = { inputs: newInputs, indices: indices.ids, funds: funds.ids, accounts: accounts.ids, broker: fileBroker };
  const all: ImportAdded = { ...added, inputs: newInputs.length, indices: indices.ids.length, funds: funds.ids.length, accounts: accounts.ids.length };
  const any = Object.values(all).some((n) => n > 0) || fileBroker !== null;
  const state: StateV3 = {
    ...current,
    inputs: { ...incoming.inputs, ...current.inputs },
    holdings,
    uncatalogued: names,
    ...(indices.all.length ? { customIndices: indices.all } : {}),
    ...(accounts.all.length ? { customBrokers: accounts.all } : {}),
    ...(funds.all.length ? { customFunds: funds.all } : {}),
    ...(broker ? { broker } : {}),
    imports: any ? [...current.imports, { at: today, mode, holdings: added.holdings, names: added.names, skipped, brought: b }] : current.imports,
  };
  return { state, added: all, skipped };
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
