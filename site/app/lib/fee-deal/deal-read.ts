// What every view of a deal is built from (method §10.6): the deal read once by the engine (F-110) for the reading's picks (F-114), each
// price as the page shows it with its figures in their number states, each price's standing against the cap (F-113) and what a fee is
// charged on (F-111). The views (rows.ts, panel.ts, reading.ts, charts.ts) only arrange these.
import { chargedOn, dealPeriods, groupAction, type CalendarMonth, type ChargedOn, type Deal, type DealAction, type DealReading } from "@finance-tool/engine";
import { assertNever, type FeeCap } from "@finance-tool/schema";
import type { SiteValue } from "../value";
import { feeOf, readFees, type MonthHeld, type ReadFee } from "./cases";
import { capOf, kindById, standingOf, type BanSaid, type DealKind, type Standing } from "./kinds";
import { feeInOrder, feePriced, mainFigure, monthKey, monthOf, monthOfDate, monthsBetween, type FeeDeal, type MonthKey, type Months, type Note, type Price, type ReadPick, type SlimFee } from "./model";
import { charged, onAction } from "./offers/capabilities";
import { banFor, type Ban } from "./offers/offer";
import { type FeeKindId, type FormId } from "./shapes";
import { engineDeal, engineFee } from "./to-engine";
import { figure, freeValue, inputKey, priceFigures, reading, sumUnit, type PriceFigures } from "./values";
import { unpricedOf, type Unpriced } from "./unpriced";
import { feeNameOf } from "./part-words";

/**
 * Why a fee is not read, in the order the page says it: banned here, its sums in a currency the deal does not know, its sums printed for
 * other currencies than the trade's, no case for the picks, or a price not given yet. Its card and its line in what the reading leaves out both say this one reason.
 */
export const unreadReason = (x: { banned?: BanSaid | undefined; noCurrency?: boolean; notPrinted?: boolean; unmatched?: boolean }): "banned" | "noCurrency" | "notPrinted" | "unmatched" | "noPrice" =>
  x.banned ? "banned" : x.noCurrency ? "noCurrency" : x.notPrinted ? "notPrinted" : x.unmatched ? "unmatched" : "noPrice";

export const banSaid = (b: Ban): BanSaid => ({ rules: b.cite, ...(b.reading ? { reading: true as const } : {}), ...(b.distribution ? { distribution: true as const } : {}) });

/** A deal read once: the fees F-110 can read (in order), the engine's deal over them, its reading, and the day and month it is for. */
export interface DealRead {
  deal: FeeDeal;
  kind: DealKind | null;
  /** The fees read, in the deal's order, each in the case the picks give it (F-114); the engine's indices are indices into this. */
  fees: ReadFee[];
  /** The picks the deal is read for (F-114): its own, and the start of every thing it does not pick. */
  picks: ReadPick[];
  /** The ids of the deal's fees left out of the reading because their prices are not in order yet (F-110). */
  unread: string[];
  /** The ids of the deal's fees in order left out of the reading because a price of theirs is not given yet (`feePriced`). */
  unpriced: string[];
  /** Each fee of `unpriced`, by id: the cases the reading reads it in with a price not given, and the figure missing (`Unpriced`). */
  unpricedAt: Record<string, Unpriced>;
  /** The ids of the deal's fees the picks give no case (F-114): the price list prints no price for what is picked. */
  unmatched: string[];
  /** Of `unmatched`, the fees read in a case whose sums are in the action's currency, which the deal does not know for the picks (`inTrade`). */
  noCurrency: string[];
  /** Of `unmatched`, the fees read in a case whose sums in the action's currency the list prints for other currencies only (F-114). */
  notPrinted: string[];
  /**
   * The deal's fees the law bans here (the rule table's `ban`, `banFor`), with the rules that ban them: read as nothing charged, so left out
   * of the reading whatever their prices, and said as banned.
   */
  banned: ({ fee: string } & BanSaid)[];
  engine: Deal;
  reading: DealReading;
  /** The device's day, YYYY-MM-DD, and its month. */
  today: string;
  month: CalendarMonth;
  /**
   * The deal's fees filled from another house's price list than the deal's own (a fee copied from it, beside the deal's or in place of
   * it), by id: that house's name, which every place that names the fee says after its name, so two fees of one kind never read alike.
   */
  copied: Record<string, string>;
}

/** The house part of a price list's id (`house:<id>`, or `house:<id>/<line>`). */
const houseOfId = (id: string) => id.split("/", 1)[0]!;

/**
 * The house of another price list than the deal's own that a fee was filled from, by its name (`houses`), which every place that names
 * the fee says after its name; undefined for a fee of the deal's own list or of none. The fee may be one the deal no longer holds (an
 * undo's line names a fee taken away).
 */
export function copiedHouse(deal: Pick<FeeDeal, "template">, f: { house?: string }, houses: (id: string) => string | null): string | undefined {
  const own = deal.template ? houseOfId(deal.template.id) : null;
  if (!f.house || houseOfId(f.house) === own) return undefined;
  return houses(f.house) ?? undefined;
}

/** The deal's fees filled from another house's price list than the deal's own, by id, with that house's name (`copiedHouse`). */
export function copiedFees(deal: FeeDeal, houses: (id: string) => string | null): Record<string, string> {
  return Object.fromEntries(
    deal.fees.flatMap((f) => {
      const name = copiedHouse(deal, f, houses);
      return name ? [[f.id, name]] : [];
    }),
  );
}

/**
 * Reads a deal for the views, each fee in the case the picks give it (F-114, F-115). Never throws: a fee the law bans here is listed in
 * `banned`, one whose prices are not in order in `unread`, one with a price not given yet in `unpriced`, one the picks give no case in
 * `unmatched`, and all are left out. `houses`: a house's name by its price list's id, for the fees copied from another list (`copied`).
 */
export function readDealFor(deal: FeeDeal, kinds: readonly DealKind[], today: string, houses?: (id: string) => string | null): DealRead {
  return readWith(deal, kindById(kinds, deal.kind), today, houses ? copiedFees(deal, houses) : {});
}

/**
 * The deal read again for a month the method reads as it is (F-126's month with nothing in it, F-127's month of one action): the same
 * deal, day and copied fees, each thing that counts a month's activity set to what that month holds (`MonthHeld`).
 */
export const readForMonth = (r: DealRead, month: MonthHeld): DealRead => readWith(r.deal, r.kind, r.today, r.copied, month);

function readWith(deal: FeeDeal, kind: DealKind | null, today: string, copied: Record<string, string>, held?: MonthHeld): DealRead {
  const month = monthOfDate(today);
  // the reading's first month (F-110: the device's): a price given or not before it is past
  const from = monthKey(month);
  const read = readFees(deal, held);
  const banned = deal.fees.flatMap((f) => {
    const ban = banFor(kind, f.kind, deal.provider, read.picks);
    return ban ? [{ fee: f.id, ...banSaid(ban) }] : [];
  });
  const kept = (id: string) => !banned.some((b) => b.fee === id);
  const ids = (xs: ReadFee[]) => [...new Set(xs.map(feeOf))].filter(kept);
  const unread = ids(read.fees.filter((f) => !feeInOrder(f)));
  const unpriced = ids(read.fees.filter((f) => feeInOrder(f) && !feePriced(f, from))).filter((id) => !unread.includes(id));
  // a fee is read whole or not at all: a size read across sizes with one step out of order or not priced reads none of its steps (§10.6)
  const fees = read.fees.filter((f) => kept(feeOf(f)) && !unread.includes(feeOf(f)) && !unpriced.includes(feeOf(f))).map((f) => (copied[feeOf(f)] ? { ...f, from: copied[feeOf(f)] } : f));
  const engine = engineDeal(deal, fees, read.picks);
  const unpricedAt = Object.fromEntries(unpriced.map((id) => [id, unpricedOf(read.fees, id, from)]));
  return { deal, kind, fees, picks: read.picks, unread, unpriced, unpricedAt, unmatched: read.unmatched.filter(kept), noCurrency: read.noCurrency.filter(kept), notPrinted: read.notPrinted.filter(kept), banned, engine, reading: dealPeriods(engine, month), today, month, copied };
}

// ---------------------------------------------------------------- one price

/**
 * A price as the page shows it: its form, its figures (entered or sourced), the months its rate is for and between charges, the currency
 * of its sums (a share of an action's bounds and flat price, a sum per unit, a sum per action), and its yearly figure (F-111) where it is a
 * share of what is held or a sum per period: the typed figure itself where it is already a year's, else computed.
 */
export interface PriceView {
  form: FormId;
  /** Its rate or sum is not given yet (`Num.blank`): `figures` leaves it out, and the price's box stands empty. */
  blank?: true;
  figures: PriceFigures;
  per?: Months;
  every?: Months;
  /** The months a share of what is held prints its bounds per, where not per charge ("מינימום 40 ₪ בחודש"). */
  boundsEvery?: Months;
  currency?: string;
  /** A free price a template filled: nothing charged, with its record's source (`freeValue`). */
  free?: SiteValue;
  yearly?: SiteValue;
  /** The parts of the price beside its figures (F-116, F-117, and the parts §10.6 states without computing), where it has any. */
  parts?: PartsView;
}

/**
 * The parts of a price beside its figures, as the page says them: a discount and whether it is off the minimum too (its share is
 * `figures.discount`, F-116); a third party's fee, whose it is where the list names it, its form where it has a figure (its figures are
 * `figures.third`, `thirdMin`, `thirdMax`, F-117) and none where the list gives none; the fee a price is offset against, and a refund
 * (`figures.refund`); and the notes on an order (the last four §10.6 states without computing).
 */
export interface PartsView {
  discount?: { alsoMin: boolean };
  third?: { who?: string; form?: "action" | "perUnit" | "perAction"; currency?: string };
  offset?: FeeKindId;
  refund?: true;
  notes?: Note[];
}

function partsView(p: Price): PartsView | undefined {
  if (!charged(p)) return undefined;
  const linked = { ...(p.offset ? { offset: p.offset.kind } : {}), ...(p.refund ? { refund: true as const } : {}) };
  const own =
    onAction(p)
      ? {
          ...(p.discount ? { discount: { alsoMin: !!p.discount.alsoMin } } : {}),
          ...(p.third ? { third: { ...(p.third.who ? { who: p.third.who } : {}), ...(p.third.price ? { form: p.third.price.form, currency: p.third.price.currency ?? "ILS" } : {}) } } : {}),
          ...(p.notes ? { notes: p.notes } : {}),
        }
      : {};
  const out = { ...linked, ...own };
  return Object.keys(out).length ? out : undefined;
}

export function priceView(fees: readonly Pick<SlimFee, "kind">[], i: number, p: Price, today: string): PriceView {
  const fee = fees[i]!;
  const figures = priceFigures(fee, p, today);
  const currency = onAction(p) ? { currency: p.currency ?? "ILS" } : {};
  const pv = partsView(p);
  const parts = pv ? { parts: pv } : {};
  if (mainFigure(p)?.blank) return { form: p.form, blank: true, figures, ...(p.form === "held" ? { per: p.per, every: p.every } : p.form === "sum" ? { every: p.every } : currency), ...parts };
  switch (p.form) {
    case "held": {
      const yearly = p.per === 12 ? figures.rate! : reading((p.rate.v * 12) / p.per, "pct_per_year", "F-111", { [inputKey(fees, i)]: figures.rate! }, today, feeNameOf(fee.kind));
      return { form: "held", figures, per: p.per, every: p.every, ...(p.boundsEvery ? { boundsEvery: p.boundsEvery } : {}), yearly, ...parts };
    }
    case "sum": {
      const yearly = p.every === 12 ? figures.amount! : reading((p.amount.v * 12) / p.every, "nis", "F-111", { [inputKey(fees, i)]: figures.amount! }, today, feeNameOf(fee.kind));
      return { form: "sum", figures, every: p.every, yearly, ...parts };
    }
    case "free":
      return { form: "free", figures, ...(p.src ? { free: freeValue(p.src) } : {}) };
    case "action":
    case "perAction":
    case "perUnit":
      return { form: p.form, figures, ...currency, ...parts };
    case "perDollar":
      return { form: "perDollar", figures, ...parts };
    default:
      return assertNever(p);
  }
}

/** The figure a price is judged by against a yearly cap or added in a group: its yearly figure, its rate, or its sum. */
export const mainOf = (v: PriceView): SiteValue | undefined => v.yearly ?? v.figures.rate ?? v.figures.amount;

/**
 * F-113 for one price, and the price's share of the cap as a computed figure where it is judged and the cap is above nothing: the price
 * charged, after its discount (F-116), whose share is an input beside the typed figure.
 */
export interface StandingView {
  standing: Standing;
  share: SiteValue | null;
  /** Where the cap holds only in a case the deal does not state (`why: "caveat"`): which case, and the cap's rules. */
  caveat?: { id: NonNullable<FeeCap["caveat"]>; rules: readonly string[] };
}

export function standingView(r: Pick<DealRead, "kind" | "deal" | "today">, fees: readonly Pick<SlimFee, "kind">[], i: number, p: Price, view: PriceView): StandingView {
  const fee = fees[i]!;
  const standing = standingOf(r.kind, fee.kind, p, r.deal.provider);
  const cap = capOf(r.kind, fee.kind);
  if (!standing.judged && standing.why === "caveat" && cap?.caveat) return { standing, share: null, caveat: { id: cap.caveat, rules: cap.rule_ids ?? [] } };
  if (!standing.judged || standing.share === null || !cap) return { standing, share: null };
  const x = p.form === "free" ? null : mainOf(view);
  const inputs: Record<string, SiteValue> = { ...(x ? { [inputKey(fees, i)]: x } : {}), ...(view.figures.discount ? { [inputKey(fees, i, "discount")]: view.figures.discount } : {}), cap: { ...cap } as SiteValue };
  return { standing, share: reading(standing.share * 100, "pct", "F-113", inputs, r.today, feeNameOf(fee.kind)) };
}

/**
 * A fee as a line of a view: its id (a read fee's, F-114: the deal fee's own, or a step's of it), kind and the person's name for a fee of
 * their own; where it was read from a case, the deal's fee (`of`) and the case; and where it is one step of a size read across sizes
 * (F-115), the stretch it is charged on (`step`: its bottom and top as the range's figures, none for the first's bottom and the last's top).
 */
export interface FeeRef {
  fee: string;
  kind: FeeKindId;
  name?: string;
  /** The house of another price list than the deal's that the fee was filled from (`DealRead.copied`), said after its name. */
  house?: string;
  of?: string;
  case?: string;
  step?: StepRef;
}

/** A step's stretch of sizes as a line says it: on an action or on what is held, from above `from` (none: from nothing) up to `to` (none: no top). */
export interface StepRef {
  on: "action" | "held";
  from: SiteValue | null;
  to: SiteValue | null;
}

/**
 * A fee's line, from a read fee or from a line of a view that carries more (a period's row); a step's figures need the day (`today`) to
 * carry their state, and a line made without it carries the fee's id and name alone.
 */
export const refOf = (f: ReadFee | FeeRef, today?: string): FeeRef => {
  if (!("id" in f)) return { fee: f.fee, kind: f.kind, ...(f.name ? { name: f.name } : {}), ...(f.house ? { house: f.house } : {}), ...(f.of ? { of: f.of } : {}), ...(f.case ? { case: f.case } : {}), ...(f.step ? { step: f.step } : {}) };
  const read = f.read;
  const step = read?.step && today ? { step: { on: read.step.on, from: read.step.from ? figure(read.step.from, sumUnit(read.step.currency), today) : null, to: read.step.to ? figure(read.step.to, sumUnit(read.step.currency), today) : null } } : {};
  return { fee: f.id, kind: f.kind, ...(f.name ? { name: f.name } : {}), ...(f.from ? { house: f.from } : {}), ...(read ? { of: read.of } : {}), ...(read?.case ? { case: read.case } : {}), ...step };
};

/** The stage of a fee whose price holds in month `i` (F-110: the first whose end is after it, else the last). */
export function stageIn(stages: readonly { until?: MonthKey }[], at: CalendarMonth): number {
  const k = stages.findIndex((s) => s.until !== undefined && monthsBetween(at, monthOf(s.until)) > 0);
  return k < 0 ? stages.length - 1 : k;
}

// ---------------------------------------------------------------- what a fee is charged on

/**
 * What a fee is charged on, as the views group it (F-111): an action (a conversion folded into a purchase or sale where what is held is not
 * in shekels; null where §10.6 names no action), what is held, the account, cover, or nothing said (a free price of a fee of the person's own).
 */
export type GroupOn = { on: "action"; action: DealAction | null } | { on: "held" } | { on: "account" } | { on: "cover" } | { on: "unsaid" };

export function groupOn(r: Pick<DealRead, "engine">, fee: ReadFee, p: Price): GroupOn {
  const { sale: _s, read: _r, ...plain } = fee;
  const e = engineFee({ ...plain, stages: [{ price: p }] });
  const price = e.stages[0]!.price;
  const c: ChargedOn | null = chargedOn(e.base, price);
  if (!c) return { on: "unsaid" };
  if (c.on !== "action") return { on: c.on };
  return { on: "action", action: c.action === null ? null : groupAction(r.engine, e.base, price) };
}

export const groupKey = (g: GroupOn): string => (g.on === "action" ? `action:${g.action ?? "none"}` : g.on);

/** A fee's price (or its sale's) in the month `at`. */
export function priceAt(fee: Pick<SlimFee, "stages" | "sale">, at: CalendarMonth, sale = false): Price {
  const stages = sale && fee.sale ? fee.sale : fee.stages;
  return stages[stageIn(stages, at)]!.price;
}

/** Whole months from `a` to `b` as a reading of F-110 (how far a change point is, how long a period lasts). */
export const monthsValue = (a: CalendarMonth, b: CalendarMonth, today: string): SiteValue => reading(monthsBetween(a, b), "months", "F-110", {}, today);
