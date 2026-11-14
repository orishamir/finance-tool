// The deals saved on this device: a side store (`side-stores.ts`) under its own key, each deal checked on read (`readDeal`), carried by
// the export file and merged by import as the other side stores are. Saving a deal puts it first, in place of the one with its id, and
// stamps the day; the deal last on screen is kept by its id (`OPEN_KEY`), which a reload opens. A stored deal the page cannot open (one
// a later site wrote, or one damaged) is never dropped: it is kept as stored, written back after the deals the page reads on every save,
// and the page says one could not be opened.
import { deviceStore } from "../device-store";
import { readDeal, sameContent, type FeeDeal } from "./model";

export const DEALS_KEY = "mekor.v2.fee-deals";

/**
 * A stored document read: the deals in it that open, each checked, and the entries that do not (`unread`), as they are stored. A second
 * deal with an id one before it has is kept as stored too, so nothing is lost. A document that is not the version this page writes is kept
 * whole as one entry.
 */
export function readDealsDoc(raw: unknown): { deals: FeeDeal[]; unread: unknown[] } {
  if (raw === null || raw === undefined) return { deals: [], unread: [] };
  const deals = typeof raw === "object" && (raw as { version?: unknown }).version === 1 ? (raw as { deals?: unknown }).deals : undefined;
  if (!Array.isArray(deals)) return { deals: [], unread: [raw] };
  const out: FeeDeal[] = [];
  const unread: unknown[] = [];
  for (const d of deals) {
    const deal = readDeal(d);
    if (deal && !out.some((x) => x.id === deal.id)) out.push(deal);
    else unread.push(d);
  }
  return { deals: out, unread };
}

/** The deals a stored document holds that open (`readDealsDoc`). */
export const parseDeals = (raw: unknown): FeeDeal[] => readDealsDoc(raw).deals;

/** The document the device keeps the deals in: the deals, then the stored entries the page could not open, untouched. */
export const dealsDoc = (deals: readonly FeeDeal[], unread: readonly unknown[] = []) => ({ version: 1, deals: [...deals, ...unread] });

/** The stored entries the deal store last read and could not open, written back with every save. */
let unreadNow: unknown[] = [];

/** The saved deals, read after hydration and followed across tabs (browser only); entries that do not open are kept as stored. */
export const dealStore = deviceStore<FeeDeal[]>(
  DEALS_KEY,
  [],
  (raw) => {
    const r = readDealsDoc(raw);
    unreadNow = r.unread;
    return r.deals;
  },
  (deals) => dealsDoc(deals, unreadNow),
);

/** How many stored entries the deal store could not open, as last read. */
export const unreadDeals = (): number => unreadNow.length;

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

/** The key of the deal last on screen on this device, so a reload opens that deal again rather than the one last saved. */
export const OPEN_KEY = "mekor.v2.fee-deal-open";

/** The id of the deal last on screen on this device, or null (none kept, or the device keeps nothing). */
export function lastOpenId(): string | null {
  try {
    return window.localStorage.getItem(OPEN_KEY);
  } catch {
    return null;
  }
}

/** Keeps `id` as the deal on screen on this device; a device that keeps nothing keeps nothing. */
export function rememberOpen(id: string): void {
  try {
    window.localStorage.setItem(OPEN_KEY, id);
  } catch {
    // private mode or a full disk: a reload opens the deal last saved
  }
}

/** The saved deal a page opens with no address: the one last on screen (`lastOpenId`), else the one last saved. */
export const reopened = (deals: readonly FeeDeal[], lastId: string | null): FeeDeal | undefined => deals.find((d) => d.id === lastId) ?? deals[0];

/** Whether two states of one deal hold the same, whatever day each was saved. */
export const sameDeal = (a: FeeDeal, b: FeeDeal): boolean => sameContent({ ...a, saved: undefined }, { ...b, saved: undefined });
