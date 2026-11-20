// The fees the reading leaves out (method §10.6), said above its panels so none drops out of it unseen: a fee whose prices' months are not
// in order yet, a fee with a price not given, a fee the picks give no case (F-114), and a fee the law bans here.
import type { BanSaid } from "./kinds";
import type { DealRead, FeeRef } from "./deal-read";

export interface LeftOut {
  /** Fees left out because their prices are not in order yet, by name. */
  unread: string[];
  /** Fees left out because a price of theirs from the reading's month on is not given yet. */
  unpriced: FeeRef[];
  /** Fees left out because the picks give them no case (F-114): the price list prints no price for what is picked. */
  unmatched: (FeeRef & { noCurrency?: true; notPrinted?: true })[];
  /** Fees the law bans here, read as nothing charged, with the rules that ban them (`DealRead.banned`). */
  banned: (FeeRef & { ban: BanSaid })[];
}

/** The fees the reading leaves out, from the deal read once (`readDealFor`). */
export function leftOut(r: DealRead): LeftOut {
  const refs = (ids: readonly string[]) => r.deal.fees.filter((f) => ids.includes(f.id)).map((f): FeeRef => ({ fee: f.id, kind: f.kind, ...(f.name ? { name: f.name } : {}), ...(r.copied[f.id] ? { house: r.copied[f.id] } : {}) }));
  return {
    unread: r.unread,
    unpriced: refs(r.unpriced),
    unmatched: refs(r.unmatched).map((f) => (r.noCurrency.includes(f.fee) ? { ...f, noCurrency: true as const } : r.notPrinted.includes(f.fee) ? { ...f, notPrinted: true as const } : f)),
    banned: r.banned.map(({ fee, ...ban }) => ({ ...refs([fee])[0]!, ban })),
  };
}

/** Whether the reading leaves any fee out. */
export const leavesOut = (l: LeftOut) => l.unread.length + l.unpriced.length + l.unmatched.length + l.banned.length > 0;
