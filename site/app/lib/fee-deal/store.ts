// The deals saved on this device: a side store (`side-stores.ts`) under its own key, each deal checked on read (`readDeal`), carried by
// the export file and merged by import as the other side stores are. Saving a deal puts it first, in place of the one with its id, and
// stamps the day: the first deal is the one last worked on, which the fee page opens when its address names none.
import { deviceStore } from "../device-store";
import { readDeal, sameContent, type FeeDeal } from "./model";

export const DEALS_KEY = "mekor.v2.fee-deals";

/** The deals a stored document holds, each checked; a deal that does not check out is left out. */
export function parseDeals(raw: unknown): FeeDeal[] {
  if (typeof raw !== "object" || raw === null || (raw as { version?: unknown }).version !== 1) return [];
  const deals = (raw as { deals?: unknown }).deals;
  if (!Array.isArray(deals)) return [];
  const out: FeeDeal[] = [];
  for (const d of deals) {
    const deal = readDeal(d);
    if (deal && !out.some((x) => x.id === deal.id)) out.push(deal);
  }
  return out;
}

/** The document the device keeps the deals in. */
export const dealsDoc = (deals: readonly FeeDeal[]) => ({ version: 1, deals });

/** The saved deals, read after hydration and followed across tabs (browser only). */
export const dealStore = deviceStore<FeeDeal[]>(DEALS_KEY, [], parseDeals, dealsDoc);

/** The deals with `deal` saved: first, stamped with `today`, in place of the one with its id. */
export function savedWith(deals: readonly FeeDeal[], deal: FeeDeal, today: string): FeeDeal[] {
  return [{ ...deal, saved: today }, ...deals.filter((d) => d.id !== deal.id)];
}

/** The deals without the one with `id`. */
export const without = (deals: readonly FeeDeal[], id: string): FeeDeal[] => deals.filter((d) => d.id !== id);

/**
 * Whether a deal is kept on the device: from its first fee or a name typed, or once it is kept already. A kind chosen alone is not yet a
 * deal worth a row in "העסקאות שלי".
 */
export const worthSaving = (deal: FeeDeal, deals: readonly FeeDeal[]): boolean => deal.fees.length > 0 || deal.name.trim() !== "" || deals.some((d) => d.id === deal.id);

/** The deals with `deal` saved where it is worth saving (`worthSaving`), whether it was typed or opened from an address; else null. */
export const savedIfWorth = (deals: readonly FeeDeal[], deal: FeeDeal, today: string): FeeDeal[] | null => (worthSaving(deal, deals) ? savedWith(deals, deal, today) : null);

/** A deal as a link carries it: no id, no saved day, no fee ids (link.ts). */
const asCarried = (d: FeeDeal) => {
  const { id: _id, saved: _saved, ...rest } = d;
  return { ...rest, fees: d.fees.map(({ id: _f, ...f }) => f) };
};

/** The saved deal a deal from a link is the same as (everything a link carries alike), or none: opening the link opens it and adds nothing. */
export const savedTwin = (deal: FeeDeal, deals: readonly FeeDeal[]): FeeDeal | undefined => deals.find((d) => sameContent(asCarried(d), asCarried(deal)));
