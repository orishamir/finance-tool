// The terms the person enters for a wrapper in one goal: the rate of a deposit whose published rate was read for another
// amount (audit 2026-10-24, A8) and the fee level of the representative instrument (D4, 2026-10-24: an entered fee replaces
// the instrument's fee in the ranking). Entered, so shown in blue wherever used; kept on this device under one key per goal
// until the saved state takes it in (see device-store.ts). The key and the file shape keep the old name "own-rates":
// a stored number is a rate (the form before fees existed), a stored object holds `{ rate?, fee? }`.
import { deviceStore } from "./device-store";

/** One wrapper's entered terms: `rate` and `fee` in % a year; `provider` is the id of the broker whose tariff the brokerage option runs on (2026-10-24, the person's choice among the providers the workbench ranks). */
export interface OwnTerms {
  rate?: number;
  fee?: number;
  provider?: string;
  /** The index the person chose for the brokerage option (D27: none until they choose), an `equity_index` exposure id. */
  index?: string;
}

/** As stored: a bare number is a rate (older files and devices), an object holds either or both. */
export type OwnTermsStored = number | OwnTerms;

/** goal id -> wrapper id -> the entered terms as stored. */
export type OwnRates = Record<string, Record<string, OwnTermsStored>>;

const okPct = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 50;

const okProvider = (v: unknown): v is string => typeof v === "string" && /^[a-z0-9][a-z0-9-]{0,63}$/.test(v);

/** One stored value as terms, or null when nothing in it is usable. */
export function termsOfStored(v: unknown): OwnTerms | null {
  if (okPct(v)) return { rate: v };
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const out: OwnTerms = {};
  if (okPct(o.rate)) out.rate = o.rate;
  if (okPct(o.fee)) out.fee = o.fee;
  if (okProvider(o.provider)) out.provider = o.provider;
  if (okProvider(o.index)) out.index = o.index;
  return Object.keys(out).length > 0 ? out : null;
}

/** The canonical stored form: a bare number when only a rate is held (the old shape), else the object. */
export function storedOfTerms(t: OwnTerms): OwnTermsStored {
  return t.fee === undefined && t.provider === undefined && t.index === undefined && t.rate !== undefined ? t.rate : t;
}

export function parseOwnRates(raw: unknown): OwnRates {
  const out: OwnRates = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [goal, rates] of Object.entries(raw as Record<string, unknown>)) {
    if (!rates || typeof rates !== "object") continue;
    const clean: Record<string, OwnTermsStored> = {};
    for (const [w, v] of Object.entries(rates as Record<string, unknown>)) {
      const t = termsOfStored(v);
      if (t) clean[w] = storedOfTerms(t);
    }
    if (Object.keys(clean).length > 0) out[goal] = clean;
  }
  return out;
}

/** The goal's terms by wrapper id, in the one shape the screens read. */
export function termsOfGoal(stored: Record<string, OwnTermsStored> | undefined): Record<string, OwnTerms> {
  const out: Record<string, OwnTerms> = {};
  for (const [w, v] of Object.entries(stored ?? {})) {
    const t = termsOfStored(v);
    if (t) out[w] = t;
  }
  return out;
}

/** What `RunGoal` takes: the entered rates, the entered fees and the chosen providers, by wrapper id. */
export function splitOwnTerms(terms: Record<string, OwnTerms>): { ownRates: Record<string, number>; ownFees: Record<string, number>; ownProviders: Record<string, string>; ownIndices: Record<string, string> } {
  const ownRates: Record<string, number> = {};
  const ownFees: Record<string, number> = {};
  const ownProviders: Record<string, string> = {};
  const ownIndices: Record<string, string> = {};
  for (const [w, t] of Object.entries(terms)) {
    if (t.rate !== undefined) ownRates[w] = t.rate;
    if (t.fee !== undefined) ownFees[w] = t.fee;
    if (t.provider !== undefined) ownProviders[w] = t.provider;
    if (t.index !== undefined) ownIndices[w] = t.index;
  }
  return { ownRates, ownFees, ownProviders, ownIndices };
}

const store = deviceStore<OwnRates>("mekor.v2.own-rates", {}, parseOwnRates, (v) => v);

type Patch = { rate?: number | undefined; fee?: number | undefined; provider?: string | undefined; index?: string | undefined };

function apply(all: OwnRates, goalId: string, wrapperId: string, patch: Patch, keys: readonly (keyof Patch)[]): OwnRates {
  const mine = { ...(all[goalId] ?? {}) };
  const cur: OwnTerms = { ...(termsOfStored(mine[wrapperId]) ?? {}) };
  for (const k of keys) {
    const v = patch[k];
    if (v === undefined) delete cur[k];
    else if (k === "provider") cur.provider = v as string;
    else if (k === "index") cur.index = v as string;
    else cur[k] = v as number;
  }
  if (Object.keys(cur).length === 0) delete mine[wrapperId];
  else mine[wrapperId] = storedOfTerms(cur);
  const next = { ...all };
  if (Object.keys(mine).length === 0) delete next[goalId];
  else next[goalId] = mine;
  return next;
}

/** Sets one field of one wrapper's terms: a percentage for `rate` and `fee`, a provider id for `provider`; undefined clears it. */
export type OwnTermsSetter = {
  (wrapperId: string, field: "rate" | "fee", pct: number | undefined): void;
  (wrapperId: string, field: "provider" | "index", id: string | undefined): void;
};

/** The goal's entered terms by wrapper id, and a setter for one field of one wrapper (undefined clears it). Reads after hydration. */
export function useOwnTerms(goalId: string): [Record<string, OwnTerms>, OwnTermsSetter] {
  const { value } = store.use();
  const set: OwnTermsSetter = (wrapperId, field, v) => store.update((all) => apply(all, goalId, wrapperId, { [field]: v }, [field]));
  return [termsOfGoal(value[goalId]), set];
}

/** The goal's own rates by wrapper id, and the setter (a number sets, undefined clears); an entered fee is kept. Reads after hydration. */
export function useOwnRates(goalId: string): [Record<string, number>, (wrapperId: string, pct: number | undefined) => void] {
  const [terms, set] = useOwnTerms(goalId);
  return [splitOwnTerms(terms).ownRates, (w, pct) => set(w, "rate", pct)];
}

export const ownRatesStore = store;
