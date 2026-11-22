// The fees of a deal switched off for this visit (method §10.6): an off fee is left out of every figure, the reading on /deal, the indices
// popup's tiles, plan figures and abroad lines, and the deal's row in the indices page's account list, until it is switched back on. The
// editor's columns still draw it, dimmed, and everything that writes the deal (saving, the undo, the link, the export file) sees the whole
// deal. It is held in memory only: it holds across client-side navigation within one visit, and a reload brings every fee back on.
// `countedDeal` is the one place the deal as it is counted is made; nothing threads the off state through the engine or the plan code.
import { useSyncExternalStore } from "react";
import type { FeeDeal } from "./model";

/** The fees switched off, each deal's fee ids by deal id. Never changed in place: a switch makes a new one, so it is its own snapshot. */
export type FeesOff = ReadonlyMap<string, ReadonlySet<string>>;

/** No fee off: the server's snapshot and the store's start, so the first render matches the pre-rendered page. */
const NONE: FeesOff = new Map();

let current: FeesOff = NONE;
const listeners = new Set<() => void>();

const subscribe = (on: () => void) => {
  listeners.add(on);
  return () => {
    listeners.delete(on);
  };
};

const publish = (next: FeesOff) => {
  current = next;
  for (const on of listeners) on();
};

/** The deal as it is counted: the deal without its fees switched off; the same object where none of its fees is off. */
export function countedDeal(deal: FeeDeal, off: FeesOff): FeeDeal {
  const ids = off.get(deal.id);
  if (!ids || !deal.fees.some((f) => ids.has(f.id))) return deal;
  return { ...deal, fees: deal.fees.filter((f) => !ids.has(f.id)) };
}

/** Whether fee `feeId` of deal `dealId` is switched off. */
export const isFeeOff = (off: FeesOff, dealId: string, feeId: string): boolean => off.get(dealId)?.has(feeId) ?? false;

/** The fees switched off in this visit, read through `useSyncExternalStore` (nothing off before the page is hydrated). */
export const feesOff = {
  use: (): FeesOff => useSyncExternalStore(subscribe, () => current, () => NONE),
  get: (): FeesOff => current,
  subscribe,
  /**
   * Fee `feeId` of `deal` switched off or back on. The deal's other ids that name no fee of it any more (a fee taken away) are dropped
   * here, so an id left behind never outlives the next switch.
   */
  set: (deal: FeeDeal, feeId: string, off: boolean): void => {
    const ids = new Set([...(current.get(deal.id) ?? [])].filter((id) => deal.fees.some((f) => f.id === id)));
    if (off && deal.fees.some((f) => f.id === feeId)) ids.add(feeId);
    else ids.delete(feeId);
    const next = new Map(current);
    if (ids.size > 0) next.set(deal.id, ids);
    else next.delete(deal.id);
    publish(next);
  },
  /** Every fee back on, as a reload leaves them. */
  reset: (): void => publish(NONE),
};
