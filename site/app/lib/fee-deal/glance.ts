// The deal at a glance (method §10.6): first the fees that hold throughout, grouped by what they are charged on, each group with its rate
// (F-111) where every fee of the group holds throughout; then the fees that change, grouped the
// same way at their price now, each group with its rate in the first period, all its fees together; then what changes and when, by date,
// each changed group with its rate from then, with the months from the device's month to the nearest date (F-110:
// the page says it as a time from now). Every price carries its
// standing against its cap (F-113). The sums the prices mark (F-112) are not here: the reading's points carry them (reading.ts).
import { groupRate, type ChangeKind, type DealSide } from "@finance-tool/engine";
import type { SiteValue } from "../value";
import { monthKey, monthOf, type MonthKey } from "./model";
import { engineGroupKey, groupKey, groupOn, groupRateValue, monthBefore, monthsValue, priceAt, priceView, refOf, standingView, subRead, type DealRead, type FeeRef, type GroupOn, type PriceView, type StandingView } from "./deal-read";

/** A fee in a group: its price now (and its sale's, where a sale is priced apart), each with its standing against the cap. */
export interface GlanceFee extends FeeRef {
  price: PriceView;
  standing: StandingView;
  sale?: { price: PriceView; standing: StandingView };
}

/**
 * Fees charged on one thing, with the rate their shares add to (per side of a trade where a side is priced apart). A group of fees that
 * change has its rate in the first period, with the group's fees that hold throughout added in. Where a bound, a percent maximum or a flat
 * price decides is the reading's points' to say (`Reading.statements`).
 */
export interface GlanceGroup {
  on: GroupOn;
  fees: GlanceFee[];
  rates: { side: DealSide; rate: SiteValue; fees: FeeRef[] }[];
}

/** A fee's change at a date: the two prices around it, how it changes, and the later price's standing. */
export interface GlanceChange extends FeeRef {
  side: DealSide;
  change: ChangeKind;
  from: PriceView;
  to: PriceView;
  standing: StandingView;
}

/**
 * A date something changes at: the months from the device's month to it (on the nearest date only; F-110 counts the time to a change from
 * now), the changes, and each group a changed fee is in from then.
 */
export interface GlanceDate {
  at: MonthKey;
  months: SiteValue | null;
  changes: GlanceChange[];
  groups: { on: GroupOn; side: DealSide; rate: SiteValue; fees: FeeRef[] }[];
}

export interface Glance {
  /** The month the deal is read from (F-110: the device's month). */
  from: MonthKey;
  throughout: GlanceGroup[];
  changing: GlanceGroup[];
  dates: GlanceDate[];
  /** Fees left out because their prices are not in order yet. */
  unread: string[];
  /** Fees left out because a price of theirs from the reading's month on is not given yet: the glance names them, so none vanishes. */
  unpriced: FeeRef[];
  /** Fees left out because the picks give them no case (F-114): the price list prints no price for what is picked. */
  unmatched: (FeeRef & { noCurrency?: true })[];
  /** Fees the law bans here, read as nothing charged, with the rules that ban them (`DealRead.banned`). */
  banned: (FeeRef & { rules: readonly string[] })[];
}

/** The order the groups are listed in: the actions as F-111 names them, then what is held, the account, cover, and what is not said. */
const ORDER = ["action:trade", "action:conversion", "action:deposit", "action:distribution", "action:transfer_out", "action:none", "held", "account", "cover", "unsaid"];

/** The groups the fees that change fall in, in any period and on either side. */
function touchedBy(r: DealRead, idx: readonly number[]): Set<string> {
  const keys = new Set<string>();
  for (const i of idx) {
    const fee = r.fees[i]!;
    for (const p of r.reading.periods) for (const sale of fee.sale ? [false, true] : [false]) keys.add(groupKey(groupOn(r, fee, priceAt(fee, p.from, sale))));
  }
  return keys;
}

/**
 * The fees `idx` (indices into the read fees) grouped by what their price now is charged on; with rates where `adds`. A group's rate is
 * the sum of all its fees (F-111), so where `adds` holds for only some of a group's fees (`others` touch the group in some period) the
 * group lists them with no rate.
 */
function groupsOf(r: DealRead, idx: readonly number[], adds: boolean, others: Set<string> = new Set()): GlanceGroup[] {
  const at = r.reading.periods[0]!.from;
  const byKey = new Map<string, GlanceGroup>();
  for (const i of idx) {
    const fee = r.fees[i]!;
    const p = priceAt(fee, at);
    const on = groupOn(r, fee, p);
    const key = groupKey(on);
    const view = priceView(r.fees, i, p, r.today);
    const sp = fee.sale ? priceAt(fee, at, true) : null;
    const sv = sp ? priceView(r.fees, i, sp, r.today) : null;
    const g = byKey.get(key) ?? { on, fees: [], rates: [] };
    g.fees.push({ ...refOf(fee, r.today), price: view, standing: standingView(r, r.fees, i, p, view), ...(sp && sv ? { sale: { price: sv, standing: standingView(r, r.fees, i, sp, sv) } } : {}) });
    byKey.set(key, g);
  }
  if (adds && idx.length > 0) {
    const sub = subRead(r, idx);
    for (const g of groupRate(sub.engine, sub.period)) {
      const key = engineGroupKey(g);
      const target = byKey.get(key);
      if (target && !others.has(key)) target.rates.push({ side: g.on === "action" ? g.side : "all", rate: groupRateValue(sub.fees, g, at, r.today), fees: g.fees.map((k) => refOf(sub.fees[k]!, r.today)) });
    }
  }
  return [...byKey.entries()].sort(([a], [b]) => ORDER.indexOf(a) - ORDER.indexOf(b)).map(([, g]) => g);
}

/** The dates the deal changes at, from the reading's changes: each with its changes and the groups a changed fee is in from then. */
function datesOf(r: DealRead): GlanceDate[] {
  const byAt = new Map<string, { changes: GlanceChange[]; idx: Set<number> }>();
  r.reading.fees.forEach((fr, i) => {
    const fee = r.fees[i]!;
    for (const c of fr.changes) {
      const sale = c.side === "sell" && !!fee.sale;
      const before = priceAt(fee, monthBefore(c.at), sale), after = priceAt(fee, c.at, sale);
      const to = priceView(r.fees, i, after, r.today);
      const at = monthKey(c.at);
      const entry = byAt.get(at) ?? { changes: [], idx: new Set<number>() };
      entry.changes.push({ ...refOf(fee, r.today), side: c.side, change: c.kind, from: priceView(r.fees, i, before, r.today), to, standing: standingView(r, r.fees, i, after, to) });
      entry.idx.add(i);
      byAt.set(at, entry);
    }
  });
  return [...byAt.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([at, e], k) => {
      const month = monthOf(at);
      const period = r.reading.periods.find((p) => monthKey(p.from) === at)!;
      const groups = groupRate(r.engine, period)
        .filter((g) => g.fees.some((i) => e.idx.has(i)))
        .map((g) => ({ on: (g.on === "held" ? { on: "held" } : { on: "action", action: g.action }) as GroupOn, side: (g.on === "action" ? g.side : "all") as DealSide, rate: groupRateValue(r.fees, g, month, r.today), fees: g.fees.map((i) => refOf(r.fees[i]!, r.today)) }));
      return { at, months: k === 0 ? monthsValue(r.month, month, r.today) : null, changes: e.changes, groups };
    });
}

/**
 * The rates of the first period (F-111: a group's rate is given per period) on the groups of the fees that change: each such group's rate
 * is the sum of all its fees in that period, those that hold throughout among them, which the block of what holds throughout gives no
 * rate for, and a fee of it that is free now adding nothing.
 */
function withFirstRates(r: DealRead, groups: GlanceGroup[]): GlanceGroup[] {
  const first = r.reading.periods[0]!;
  for (const g of groupRate(r.engine, first)) {
    const target = groups.find((x) => groupKey(x.on) === engineGroupKey(g));
    target?.rates.push({ side: g.on === "action" ? g.side : "all", rate: groupRateValue(r.fees, g, first.from, r.today), fees: g.fees.map((i) => refOf(r.fees[i]!, r.today)) });
  }
  return groups;
}

/** The deal at a glance, from the deal read once (`readDealFor`). */
export function glance(r: DealRead): Glance {
  const holds = r.reading.fees.flatMap((f, i) => (f.holds ? [i] : []));
  const changes = r.reading.fees.flatMap((f, i) => (f.holds ? [] : [i]));
  const refs = (ids: readonly string[]) => r.deal.fees.filter((f) => ids.includes(f.id)).map((f): FeeRef => ({ fee: f.id, kind: f.kind, ...(f.name ? { name: f.name } : {}) }));
  return { from: monthKey(r.reading.from), throughout: groupsOf(r, holds, true, touchedBy(r, changes)), changing: withFirstRates(r, groupsOf(r, changes, false)), dates: datesOf(r), unread: r.unread, unpriced: refs(r.unpriced), unmatched: refs(r.unmatched).map((f) => (r.noCurrency.includes(f.fee) ? { ...f, noCurrency: true as const } : f)), banned: r.banned.map((b) => ({ ...refs([b.fee])[0]!, rules: b.rules })) };
}
