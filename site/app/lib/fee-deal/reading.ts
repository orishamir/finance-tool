// The reading of a deal (method §10.6): the picks it is read for (F-114), its periods as cards (F-110), the two panels of charts and the
// timeline (charts.ts: F-112's curves as F-123's share, F-124 to F-127), the law rows for the deal's own fees that have a cap on the kind's
// record (F-113), and the parts of a price it states without computing (§10.6, "What the page states and does not compute").
import { changeKind, type ChangeKind, type DealPeriod, type DealSide } from "@finance-tool/engine";
import { feeDeal as copy } from "../../copy";
import type { FxSnapshot } from "../fx";
import { entered, type SiteValue } from "../value";
import { panelsOf, timelineOf, type Panels, type TimelinePeriod } from "./charts";
import { thingName, whenWords, type WhenWords } from "./case-words";
import { STATED, type PartWords } from "./part-words";
import { isPicked, pickKind } from "./offers/conditions";
import { PARTS, partsSaid, type PartId, type StatedPartId } from "./offers/parts";
import { picked, stepPick, type ReadFee } from "./cases";
import { capLine, type CapLine } from "./kinds";
import { hasCases, isRange, monthKey, pickKey, pickedPlace, pricesFrom, thingValues, type MonthKey, type Stage } from "./model";
import { charged } from "./offers/capabilities";
import { monthsValue, priceAt, priceView, refOf, stageIn, standingView, type DealRead, type FeeRef, type PriceView, type StandingView } from "./deal-read";
import { holdsFunds } from "./shapes";
import { capacity } from "./offers/capacity";
import { priceFigures, sumUnit } from "./values";

// ---------------------------------------------------------------- the periods

/** A fee in a period: its price (and its sale's), how each changed at the period's start, and each one's standing against the cap. */
export interface PeriodRow extends FeeRef {
  price: PriceView;
  standing: StandingView;
  /** How the price changed at the period's start (F-110); absent in the first period and where it did not change. */
  change?: ChangeKind;
  sale?: { price: PriceView; standing: StandingView; change?: ChangeKind };
}

/** A period of F-110 as a card. */
export interface PeriodCard {
  from: MonthKey;
  /** The month at whose start it ends; null for the last. */
  to: MonthKey | null;
  /** Whether today's month is in it, and whether it has begun (the first period always has; a later one has not). */
  current: boolean;
  started: boolean;
  /** Its length in months, where it ends (F-110). */
  length: SiteValue | null;
  /** The months from the device's month to its end, for the current period where it ends (F-110). */
  left: SiteValue | null;
  rows: PeriodRow[];
}

function cardOf(r: DealRead, k: number): PeriodCard {
  const p = r.reading.periods[k]!;
  const prev = k > 0 ? r.reading.periods[k - 1]! : null;
  const started = monthKey(p.from) <= monthKey(r.month);
  const current = started && (p.to === null || monthKey(p.to) > monthKey(r.month));
  const rows = r.fees.map((fee, i): PeriodRow => {
    const now = p.prices[i]!;
    const before = prev?.prices[i];
    const pr = priceAt(fee, p.from);
    const view = priceView(r.fees, i, pr, r.today);
    const change = before ? changeKind(before.price, now.price) : null;
    let sale: PeriodRow["sale"];
    if (fee.sale && now.sale) {
      const sp = priceAt(fee, p.from, true);
      const sv = priceView(r.fees, i, sp, r.today);
      const sc = before?.sale ? changeKind(before.sale, now.sale) : null;
      sale = { price: sv, standing: standingView(r, r.fees, i, sp, sv), ...(sc ? { change: sc } : {}) };
    }
    return { ...refOf(fee, r.today), price: view, standing: standingView(r, r.fees, i, pr, view), ...(change ? { change } : {}), ...(sale ? { sale } : {}) };
  });
  return {
    from: monthKey(p.from),
    to: p.to ? monthKey(p.to) : null,
    current,
    started,
    length: p.to ? monthsValue(p.from, p.to, r.today) : null,
    left: current && p.to ? monthsValue(r.month, p.to, r.today) : null,
    rows,
  };
}

// ---------------------------------------------------------------- the unit's price

/**
 * The unit's price a chart of a sum per unit needs (F-112): a figure the person gives beside the chart, one for the deal, in the currency of
 * what the deal holds where it says, else in the currency of its first sum per unit (F-12 reads the unit's price in the fund's currency).
 * `value` is the price given, as an entered figure; null until it is.
 */
export interface UnitPrice {
  currency: string;
  value: SiteValue | null;
}

/** A price's sum per unit, its own or its third party's (F-117), where it has one. */
function perUnitOf(x: DealPeriod["prices"][number]["price"]): { currency?: string } | null {
  if (x.kind === "perUnit") return x;
  return (x.kind === "action" || x.kind === "perAction") && x.third?.kind === "perUnit" ? x.third : null;
}

/**
 * The currency a deal's unit price is asked in (`UnitPrice`): that of what is bought, by the pick (F-114), where the deal holds funds and the
 * pick names one; else that of its first sum per unit, a third party's among them. Null where no price the reading reads has a sum per unit.
 */
export function unitCurrency(r: DealRead): string | null {
  const per = r.reading.periods.flatMap((p) => p.prices.flatMap((x) => [x.price, ...(x.sale ? [x.sale] : [])])).map(perUnitOf).find((x) => x !== null);
  if (!per) return null;
  const what = r.picks.find((p) => p.by === "what");
  const bought = what && holdsFunds(r.deal.kind) ? pickedPlace(r.deal.fees, what)?.currency : null;
  return bought ?? per.currency ?? "ILS";
}

// ---------------------------------------------------------------- the law

/** A price of a fee in the reading against the cap, with the months it holds from and to and its side. */
export interface LawPrice {
  from: MonthKey;
  to: MonthKey | null;
  side: DealSide;
  price: PriceView;
  standing: StandingView;
}

/**
 * A fee of the deal whose kind has a line in the record's caps: the line and each of the fee's prices read against it (F-113), and what
 * its tag shows: the standing of its first price that is judged. A fee the law bans here is a row of its own, its line `banned`, with no
 * price, after the rest.
 */
export interface LawRow extends FeeRef {
  cap: CapLine;
  prices: LawPrice[];
  now?: StandingView;
}

function lawOf(r: DealRead): LawRow[] {
  return r.fees.flatMap((fee, i) => {
    const cap = capLine(r.kind, fee.kind);
    if (cap.state === "absent") return [];
    const prices: LawPrice[] = [];
    const sides: { side: DealSide; sale: boolean }[] = fee.sale ? [{ side: "buy", sale: false }, { side: "sell", sale: true }] : [{ side: capacity(fee.kind).oneSide ?? "all", sale: false }];
    for (const { side, sale } of sides) {
      // a stage held over several periods is one row, from its first period to the end of its last
      let last = null as { stage: Stage; row: LawPrice } | null;
      const stages = sale && fee.sale ? fee.sale : fee.stages;
      for (const p of r.reading.periods) {
        const stage = stages[stageIn(stages, p.from)]!;
        if (last?.stage === stage) {
          last.row.to = p.to ? monthKey(p.to) : null;
          continue;
        }
        const view = priceView(r.fees, i, stage.price, r.today);
        const row: LawPrice = { from: monthKey(p.from), to: p.to ? monthKey(p.to) : null, side, price: view, standing: standingView(r, r.fees, i, stage.price, view) };
        prices.push(row);
        last = { stage, row };
      }
    }
    const judged = prices.filter((x) => x.standing.standing.judged);
    const now = judged[0];
    return [{ ...refOf(fee, r.today), cap, prices, ...(now ? { now: now.standing } : {}) }];
  }).concat(
    r.banned.map(({ fee: id, ...ban }) => {
      const f = r.deal.fees.find((x) => x.id === id)!;
      return { fee: id, kind: f.kind, ...(f.name ? { name: f.name } : {}), cap: { state: "banned", ban }, prices: [] };
    }),
  );
}

// ---------------------------------------------------------------- the reading

// ---------------------------------------------------------------- the picks (F-114)

/** One value the reading may be read for: its pick (`is`) and how it is said (the site's words, the person's, or a range's step). */
export interface PickOption {
  is: string;
  words: Omit<WhenWords, "thing">;
}

/** One thing the reading picks: its key, its words (the chip's name), its values in the order the fees name them, and the one picked. */
export interface PickThing {
  by: string;
  words: string;
  options: PickOption[];
  chosen: string;
}

/**
 * The reading's first line: its head, one chip per thing the deal's fees change by that the reading picks, and the line under them.
 * Null for a deal with no fee that changes by a thing picked.
 */
export interface PickLine {
  title: string;
  things: PickThing[];
  line: string;
}

export function pickLine(r: DealRead): PickLine | null {
  const things = new Map<string, PickThing>();
  for (const fee of r.deal.fees) {
    if (!hasCases(fee)) continue;
    fee.by.forEach((b, t) => {
      // a thing the reading takes from another pick is never a pick of its own (the currency, from what is bought, F-114)
      if (!picked(fee, b) || !isPicked(b.kind)) return;
      const key = pickKey(b);
      const thing = things.get(key) ?? { by: key, words: thingName(fee.kind, { ...b, kind: pickKind(b.kind) }), options: [], chosen: r.picks.find((p) => p.by === key)?.is ?? "" };
      things.set(key, thing);
      const add = (is: string, words: Omit<WhenWords, "thing">) => {
        if (!thing.options.some((o) => o.is === is)) thing.options.push({ is, words });
      };
      if (isRange(b)) {
        b.tops.forEach((_, k) => add(stepPick(b.tops[k]!.v), whenWords(fee, k, t, r.today)));
        add(stepPick(b.tops.at(-1)!.v, true), whenWords(fee, b.tops.length, t, r.today));
        return;
      }
      // every value the thing keeps, in the page's order, one no case names among them: the fee is then not read, unless a case on any
      // value of the thing holds it (F-114)
      for (const v of thingValues(fee, t)) add(v, whenWords(fee, [v], t, r.today));
    });
  }
  // a range's steps across fees in order of their tops, "מעל" last
  for (const thing of things.values()) {
    if (!thing.options.every((o) => /^(<=|>)/.test(o.is))) continue;
    const top = (o: PickOption) => Number(o.is.replace(/^(<=|>)/, "")) + (o.is.startsWith(">") ? 0.5 : 0);
    thing.options.sort((a, b) => top(a) - top(b));
  }
  if (things.size === 0) return null;
  return { title: copy.cases.readFor, things: [...things.values()], line: copy.cases.readForLine };
}

// ---------------------------------------------------------------- what is stated, not computed

/**
 * A part of a price the reading states without computing (§10.6, "What the page states and does not compute"), on the fee it is printed
 * with: each part the registry marks stated (`StatedPartId`: a third party's fee with no figure, a maximum on each security held, an offset
 * against another fee, a refund, the notes on an order), with its sentence's words.
 */
export interface StatedPart {
  fee: FeeRef;
  part: StatedPartId;
  words: PartWords;
  /** The rules its sentence states, where it states one (a bank's order through a clerk, BRK-16). */
  rules?: readonly string[];
  /** The action costs more than the chart shows (`STATED_UNDERSTATES`). */
  understates?: true;
}

/** The rules a stated part's sentence states, by the part: a bank's order through a clerk not carried out, at home and abroad (BRK-16). */
export const STATED_RULES: Partial<Record<StatedPartId, readonly string[]>> = { unfilledClerk: ["BRK-16"], unfilledClerkAbroad: ["BRK-16"] };

/**
 * The stated parts that may make an action cost more than the chart shows: a third party's fee with no figure in the list, and a maximum
 * on each security, which the chart applies as if one security were held (F-14).
 */
export const STATED_UNDERSTATES: Partial<Record<StatedPartId, true>> = { third: true, maxPerSecurity: true };

const isStated = (id: PartId): id is StatedPartId => !!PARTS[id].stated;

/** Each fee's stated parts, once each, in the order its prices' lines say them (`partsSaid`). */
function statedOf(r: DealRead): StatedPart[] {
  const out: StatedPart[] = [];
  const from = monthKey(r.reading.from);
  r.fees.forEach((fee: ReadFee) => {
    const seen = new Set<StatedPartId>();
    for (const s of [...pricesFrom(fee.stages, from), ...(fee.sale ? pricesFrom(fee.sale, from) : [])]) {
      const p = s.price;
      if (!charged(p)) continue;
      for (const part of partsSaid(p, {}).filter(isStated)) {
        const words = seen.has(part) ? null : STATED[part]({ p, figures: priceFigures(fee, p, r.today) });
        if (!words) continue;
        seen.add(part);
        const rules = STATED_RULES[part];
        out.push({ fee: refOf(fee, r.today), part, words, ...(rules ? { rules } : {}), ...(STATED_UNDERSTATES[part] ? { understates: true as const } : {}) });
      }
    }
  });
  return out;
}

// ---------------------------------------------------------------- the reading

export interface Reading {
  /** The picks the deal is read for, as its first line; null where it picks nothing. */
  picks: PickLine | null;
  /** What the reading states without computing (§10.6). */
  stated: StatedPart[];
  /** The deal's fees the picks give no case (F-114), by the deal fee's id. */
  unmatched: FeeRef[];
  from: MonthKey;
  periods: PeriodCard[];
  /** The two panels: a tab per action the deal prices, and holding (charts.ts). */
  panels: Panels;
  /** The deal's periods on the timeline (F-110, F-126, F-127). */
  timeline: TimelinePeriod[];
  law: LawRow[];
  /** The unit's price the charts of a sum per unit need, where a price the reading reads is one (the chart's field); null where none is. */
  unitPrice: UnitPrice | null;
}

/**
 * The reading of a deal, from the deal read once (`readDealFor`), with the site's exchange rates (F-84) for a sum in another currency, and
 * the unit's price the person gave beside the chart (`unitPrice`, a number in `Reading.unitPrice.currency`; absent, or not above nothing,
 * where none is given).
 */
export function readingOf(r: DealRead, fx: FxSnapshot | null, unitPrice?: number | null): Reading {
  const currency = unitCurrency(r);
  const price = unitPrice !== undefined && unitPrice !== null && Number.isFinite(unitPrice) && unitPrice > 0 ? unitPrice : null;
  const periods = r.reading.periods.map((_, k) => cardOf(r, k));
  const stated = statedOf(r);
  return {
    picks: pickLine(r),
    stated,
    unmatched: r.unmatched.map((id) => {
      const f = r.deal.fees.find((x) => x.id === id)!;
      return { fee: id, kind: f.kind, ...(f.name ? { name: f.name } : {}) };
    }),
    from: monthKey(r.reading.from),
    periods,
    panels: panelsOf(r, fx, { price, currency }, periods, stated),
    timeline: timelineOf(r, periods, fx, { price, currency }),
    law: lawOf(r),
    unitPrice: currency === null ? null : { currency, value: price === null ? null : entered(price, sumUnit(currency), r.today) },
  };
}
