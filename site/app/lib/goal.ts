// The saved goal (design-spec 6.5, flows 12 and 17): its types, the preset record's type and the goals document on
// the device, which the transfer page exports and loads. Browser only; nothing is sent anywhere.
// The goals live in the v2 state document (lib/state.ts). A field the person typed is `entered`.
import type { ValueObject, ProductId } from "@finance-tool/schema";
import type { Employment } from "./inputs";
import { clearGoals, ensureLoaded, STATE_KEY } from "./state";

export type PresetId = "liquid-reserve" | "known-date" | "long-term" | "lump-sum" | "child" | "none";

/** A number the person may have typed. `entered: false` means it follows the preset (or is empty). */
export interface NumField {
  value: number | null;
  entered: boolean;
}

/**
 * What the person entered for one exposure (design-spec 21.2); every figure an `entered` value object (D7, D9).
 * `wrapperId` is the holding wrapper when the person changed it; otherwise P-08's applies.
 */
export interface ExposureInputs {
  /** The exposure's gross annual return (A-01), or the person's own cash rate for a cash-like one, `pct_per_year`. */
  return?: ValueObject;
  /** The worst fall expected on the way (A-29), `pct`. */
  worstFall?: ValueObject;
  /** The largest fall accepted for this exposure alone, wins over the goal's common one (A-29), `pct`. */
  acceptedFall?: ValueObject;
  wrapperId?: ProductId;
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
  /** The child's age in whole years (0 to 17), asked only with the child preset: the horizon is the preset's 18 minus it. Absent or null: the preset's own 18. */
  childAge?: number | null;
  /** What a known-date purchase costs, an entered value object in shekels; asked only with the known-date preset. Enters no ranking: the result shows the gap to the leading option. */
  targetCost?: ValueObject | null;
  profile: {
    age: number | null;
    employment: Employment | null;
    /** True when `employment` was filled in by the form (a yes to a pension or study fund through work), not chosen: the form shows it as a chip the person can flip. */
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

export type FieldKey = "horizonYears" | "amountNow" | "monthly" | "available" | "anytime" | "return" | "inflation" | "age" | "employment" | "salary" | "insurance" | "acceptedFall";

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

export type ReadResult = { status: "ok"; doc: GoalsDoc | null } | { status: "old-version" } | { status: "unavailable" };

export function readDoc(): ReadResult {
  const snap = ensureLoaded();
  if (snap.status === "unavailable") return { status: "unavailable" };
  if (snap.status === "old-version") return { status: "old-version" };
  const st = snap.state;
  if (st.goals.length === 0) return { status: "ok", doc: null };
  return { status: "ok", doc: { version: 1, goals: st.goals, currentId: st.currentId ?? null, ...(st.bank ? { bank: st.bank } : {}) } };
}

export function deleteDoc() {
  clearGoals();
}

