// The rate the person enters for a deposit whose published rate was read for another amount (audit 2026-10-24, A8).
// Entered, so it is shown in blue wherever it is used; kept on this device under its own key per goal until the saved
// state takes it in (see device-store.ts: the keys of these side stores belong inside the state document).
import { deviceStore } from "./device-store";

/** goal id -> wrapper id -> % a year. */
export type OwnRates = Record<string, Record<string, number>>;

export function parseOwnRates(raw: unknown): OwnRates {
  const out: OwnRates = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [goal, rates] of Object.entries(raw as Record<string, unknown>)) {
    if (!rates || typeof rates !== "object") continue;
    const clean: Record<string, number> = {};
    for (const [w, v] of Object.entries(rates as Record<string, unknown>)) if (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 50) clean[w] = v;
    if (Object.keys(clean).length > 0) out[goal] = clean;
  }
  return out;
}

const store = deviceStore<OwnRates>("mekor.v2.own-rates", {}, parseOwnRates, (v) => v);

/** The goal's own rates by wrapper id, and the setter (a number sets, undefined clears). Reads after hydration. */
export function useOwnRates(goalId: string): [Record<string, number>, (wrapperId: string, pct: number | undefined) => void] {
  const { value } = store.use();
  const set = (wrapperId: string, pct: number | undefined) =>
    store.update((all) => {
      const mine = { ...(all[goalId] ?? {}) };
      if (pct === undefined) delete mine[wrapperId];
      else mine[wrapperId] = pct;
      const next = { ...all };
      if (Object.keys(mine).length === 0) delete next[goalId];
      else next[goalId] = mine;
      return next;
    });
  return [value[goalId] ?? {}, set];
}

export const ownRatesStore = store;
