// The deal at a glance (method §10.6): first the fees that hold throughout, grouped by what they are charged on, each group with its rate
// (F-111) and the marks that belong to it (F-112); then the fees that change, grouped the same way at their price now; then what changes
// and when, by date, with the months from today to the nearest date. Every price carries its standing against its cap (F-113).
import { dealMarks, groupRate, type ChangeKind, type DealSide } from "@finance-tool/engine";
import type { SiteValue } from "../value";
import type { DealKind } from "./kinds";
import { monthKey, monthOf, type FeeDeal, type MonthKey } from "./model";
import {
  engineGroupKey,
  groupKey,
  groupOn,
  groupRateValue,
  markView,
  monthBefore,
  monthsValue,
  priceAt,
  priceView,
  readDealFor,
  refOf,
  standingView,
  subRead,
  type DealRead,
  type FeeRef,
  type GroupOn,
  type MarkView,
  type PriceView,
  type StandingView,
} from "./parts";

/** A fee in a group: its price now (and its sale's, where a sale is priced apart), each with its standing against the cap. */
export interface GlanceFee extends FeeRef {
  price: PriceView;
  standing: StandingView;
  sale?: { price: PriceView; standing: StandingView };
}

/** Fees charged on one thing, with the rate their shares add to (per side of a trade where a side is priced apart) and their marks. */
export interface GlanceGroup {
  on: GroupOn;
  fees: GlanceFee[];
  rates: { side: DealSide; rate: SiteValue; fees: FeeRef[] }[];
  marks: MarkView[];
}

/** A fee's change at a date: the two prices around it, how it changes, and the later price's standing. */
export interface GlanceChange extends FeeRef {
  side: DealSide;
  change: ChangeKind;
  from: PriceView;
  to: PriceView;
  standing: StandingView;
}

/** A date something changes at: the months from today (on the nearest date only), the changes, and each group a changed fee is in from then. */
export interface GlanceDate {
  at: MonthKey;
  months: SiteValue | null;
  changes: GlanceChange[];
  groups: { on: GroupOn; side: DealSide; rate: SiteValue; fees: FeeRef[] }[];
}

export interface Glance {
  /** The month the deal is read from (F-110: today, or the deal's start where it is later). */
  from: MonthKey;
  throughout: GlanceGroup[];
  changing: GlanceGroup[];
  dates: GlanceDate[];
  /** Fees left out because their prices are not in order yet. */
  unread: string[];
}

/** The order the groups are listed in: the actions as F-111 names them, then what is held, the account, cover, and what is not said. */
const ORDER = ["action:trade", "action:conversion", "action:deposit", "action:distribution", "action:transfer_out", "action:none", "held", "account", "cover", "unsaid"];

/** The fees `idx` (indices into the read fees) grouped by what their price now is charged on; with rates and marks where `adds`. */
function groupsOf(r: DealRead, idx: readonly number[], adds: boolean): GlanceGroup[] {
  const at = r.reading.periods[0]!.from;
  const byKey = new Map<string, GlanceGroup>();
  const keyOf = new Map<number, string>();
  for (const i of idx) {
    const fee = r.fees[i]!;
    const p = priceAt(fee, at);
    const on = groupOn(r, fee, p);
    const key = groupKey(on);
    keyOf.set(i, key);
    const view = priceView(r.fees, i, p, r.today);
    const sp = fee.sale ? priceAt(fee, at, true) : null;
    const sv = sp ? priceView(r.fees, i, sp, r.today) : null;
    const g = byKey.get(key) ?? { on, fees: [], rates: [], marks: [] };
    g.fees.push({ ...refOf(fee), price: view, standing: standingView(r, r.fees, i, p, view), ...(sp && sv ? { sale: { price: sv, standing: standingView(r, r.fees, i, sp, sv) } } : {}) });
    byKey.set(key, g);
  }
  if (adds && idx.length > 0) {
    const sub = subRead(r, idx);
    for (const g of groupRate(sub.engine, sub.period)) {
      const target = byKey.get(engineGroupKey(g));
      if (target) target.rates.push({ side: g.on === "action" ? g.side : "all", rate: groupRateValue(sub.fees, g, at, r.today), fees: g.fees.map((k) => refOf(sub.fees[k]!)) });
    }
    for (const m of dealMarks(sub.engine, sub.period)) {
      const key = m.kind === "meet" ? "held" : keyOf.get(idx[m.fee]!)!;
      byKey.get(key)?.marks.push(markView(m, sub.fees, sub.period, r.today));
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
      entry.changes.push({ ...refOf(fee), side: c.side, change: c.kind, from: priceView(r.fees, i, before, r.today), to, standing: standingView(r, r.fees, i, after, to) });
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
        .map((g) => ({ on: (g.on === "held" ? { on: "held" } : { on: "action", action: g.action }) as GroupOn, side: (g.on === "action" ? g.side : "all") as DealSide, rate: groupRateValue(r.fees, g, month, r.today), fees: g.fees.map((i) => refOf(r.fees[i]!)) }));
      return { at, months: k === 0 ? monthsValue(r.month, month, r.today) : null, changes: e.changes, groups };
    });
}

/** The deal at a glance, read on `today` (YYYY-MM-DD) with the kinds' records. */
export function glance(deal: FeeDeal, kinds: readonly DealKind[], today: string): Glance {
  const r = readDealFor(deal, kinds, today);
  const holds = r.reading.fees.flatMap((f, i) => (f.holds ? [i] : []));
  const changes = r.reading.fees.flatMap((f, i) => (f.holds ? [] : [i]));
  return { from: monthKey(r.reading.from), throughout: groupsOf(r, holds, true), changing: groupsOf(r, changes, false), dates: datesOf(r), unread: r.unread };
}
