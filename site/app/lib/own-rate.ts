// The rate the person enters for a wrapper whose published rate was read for another amount (the guide pages' timeline, under the goal id
// "guide"). Entered, so shown in blue wherever used; kept on this device under one key per goal id until the saved state takes it in (see
// device-store.ts), and carried by the export file (side-stores.ts). A stored number is a rate; a stored object holds `{ rate?, fee?,
// provider?, index? }`. No page reads `fee`, `provider` or `index`: they are kept so the store and the export file hold what the device holds.
// A rate is kept within the widest range any rate field takes (`STORED_RATE_RANGE`, P-05 `ranges.pct`, which a test holds equal). Which
// range a guide's field takes is a site parameter by the wrapper's kind (P-05 `ranges.interest` or `ranges.pct`, `cashRateRange`), and
// the field applies it (`cashRateCheck`): a money-market fund's −1% is kept and run, and a negative interest rate kept from an older device
// or an imported file reaches the run, which says why it stops (method G-41).
import { deviceStore } from "./device-store";

/** One wrapper's stored terms: `rate` and `fee` in % a year, `provider` and `index` ids. */
export interface OwnTerms {
  rate?: number;
  fee?: number;
  provider?: string;
  index?: string;
}

/** As stored: a bare number is a rate (older files and devices), an object holds either or both. */
export type OwnTermsStored = number | OwnTerms;

/** goal id -> wrapper id -> the entered terms as stored. */
export type OwnRates = Record<string, Record<string, OwnTermsStored>>;

/** The widest range, in % a year, of any rate field the stored rate comes from: P-05 `ranges.pct`, which a test holds equal. */
export const STORED_RATE_RANGE = { min: -50, max: 50 } as const;

const okRate = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= STORED_RATE_RANGE.min && v <= STORED_RATE_RANGE.max;
const okFee = (v: unknown): v is number => okRate(v) && v >= 0 && v <= 50;

const okProvider = (v: unknown): v is string => typeof v === "string" && /^[a-z0-9][a-z0-9-]{0,63}$/.test(v);

/** One stored value as terms, or null when nothing in it is usable. */
function termsOfStored(v: unknown): OwnTerms | null {
  if (okRate(v)) return { rate: v };
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const out: OwnTerms = {};
  if (okRate(o.rate)) out.rate = o.rate;
  if (okFee(o.fee)) out.fee = o.fee;
  if (okProvider(o.provider)) out.provider = o.provider;
  if (okProvider(o.index)) out.index = o.index;
  return Object.keys(out).length > 0 ? out : null;
}

/** The canonical stored form: a bare number when only a rate is held (the old shape), else the object. */
function storedOfTerms(t: OwnTerms): OwnTermsStored {
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

/** Where the device keeps the entered terms; side-stores.ts names it in `SIDE_KEYS` (which imports this file, so the key is defined here). */
export const OWN_RATES_KEY = "mekor.v2.own-rates";
const store = deviceStore<OwnRates>(OWN_RATES_KEY, {}, parseOwnRates, (v) => v, { holds: "made" });

/** Sets one wrapper's rate in one goal's terms (undefined clears it), keeping whatever else the stored entry holds. */
function withRate(all: OwnRates, goalId: string, wrapperId: string, pct: number | undefined): OwnRates {
  const mine = { ...(all[goalId] ?? {}) };
  const cur: OwnTerms = { ...(termsOfStored(mine[wrapperId]) ?? {}) };
  if (pct === undefined) delete cur.rate;
  else cur.rate = pct;
  if (Object.keys(cur).length === 0) delete mine[wrapperId];
  else mine[wrapperId] = storedOfTerms(cur);
  const next = { ...all };
  if (Object.keys(mine).length === 0) delete next[goalId];
  else next[goalId] = mine;
  return next;
}

/** The goal's own rates by wrapper id, and the setter (a number sets, undefined clears); the rest of a stored entry is kept. Reads after hydration. */
export function useOwnRates(goalId: string): [Record<string, number>, (wrapperId: string, pct: number | undefined) => void] {
  const { value } = store.use();
  const rates: Record<string, number> = {};
  for (const [w, t] of Object.entries(termsOfGoal(value[goalId]))) if (t.rate !== undefined) rates[w] = t.rate;
  return [rates, (w, pct) => store.update((all) => withRate(all, goalId, w, pct))];
}
