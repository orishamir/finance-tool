// The person's own offers per provider (flow 29, design-spec 16.2 `EnteredOffer`, 16.5): the fee lines a bank or broker
// offered, who offered them and when. Kept on this device only. Every number is a value object in state "entered".
//
// TODO(state v3): this module keeps its own key (`mekor.v2.offers`, via lib/device-store.ts) while `lib/state.ts` belongs
// to the holdings work; merge it into `StateV3.offers` (design-spec 16.5) when that file is free, and add the offers to
// the export file, the import check and its contents line then. Nothing outside this file reads the key.
import type { EnteredTariff } from "@finance-tool/engine";
import { valueObject, type ValueObject } from "@finance-tool/schema";
import { deviceStore } from "./device-store";
import { entered as enteredValue } from "./value";

export const OFFERS_KEY = "mekor.v2.offers";

/** The fee lines of an offer, each number an entered value object (data-schema §1). A line is the person's as a whole: its rate, and the bounds they gave (none when empty). */
export interface OfferLines {
  /** Buy and sell: the snapshot's trade line has no split, so one offer prices both orders. */
  trade?: { rate: ValueObject; min?: ValueObject; max?: ValueObject };
  /** The rate of the balance per `everyMonths` (the tariff's own period), with the bounds. */
  custody?: { rate: ValueObject; everyMonths: number; min?: ValueObject; max?: ValueObject };
  /** A percentage of each conversion. */
  fx?: { rate: ValueObject };
  /** Shekels a month. */
  monthlyFee?: ValueObject;
}

export interface EnteredOffer {
  providerId: string;
  lines: OfferLines;
  offeredBy?: string;
  /** The date the offer was made, an entered text value (`YYYY-MM-DD`). */
  offeredOn?: ValueObject;
  /** `YYYY-MM-DD` of the save. */
  savedAt: string;
}

/** Reads what the device holds; anything that does not check out is dropped (the page then starts without that offer). */
function parseStored(raw: unknown): EnteredOffer[] {
  const vo = (v: unknown): ValueObject | null => {
    const r = valueObject.safeParse(v);
    return r.success ? r.data : null;
  };
  const rec = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
  if (!rec(raw) || raw.version !== 1 || !Array.isArray(raw.offers)) return [];
  const out: EnteredOffer[] = [];
  for (const o of raw.offers) {
    if (!rec(o) || typeof o.providerId !== "string" || !rec(o.lines) || typeof o.savedAt !== "string") continue;
    const lines: OfferLines = {};
    const l = o.lines;
    let ok = true;
    const bounds = (x: Record<string, unknown>) => {
      const b: { min?: ValueObject; max?: ValueObject } = {};
      for (const k of ["min", "max"] as const) {
        if (x[k] === undefined) continue;
        const v = vo(x[k]);
        if (v) b[k] = v;
        else ok = false;
      }
      return b;
    };
    if (rec(l.trade)) {
      const rate = vo(l.trade.rate);
      if (rate) lines.trade = { rate, ...bounds(l.trade) };
      else ok = false;
    }
    if (rec(l.custody)) {
      const rate = vo(l.custody.rate);
      const every = l.custody.everyMonths;
      if (rate && typeof every === "number" && every > 0) lines.custody = { rate, everyMonths: every, ...bounds(l.custody) };
      else ok = false;
    }
    if (rec(l.fx)) {
      const rate = vo(l.fx.rate);
      if (rate) lines.fx = { rate };
      else ok = false;
    }
    if (l.monthlyFee !== undefined) {
      const fee = vo(l.monthlyFee);
      if (fee) lines.monthlyFee = fee;
      else ok = false;
    }
    if (!ok) continue;
    const offer: EnteredOffer = { providerId: o.providerId, lines, savedAt: o.savedAt };
    if (typeof o.offeredBy === "string") offer.offeredBy = o.offeredBy;
    const on = o.offeredOn === undefined ? null : vo(o.offeredOn);
    if (on) offer.offeredOn = on;
    out.push(offer);
  }
  return out;
}

// ---------------------------------------------------------------- what a person typed

/** The fields of the entered-offer card as numbers (null = left empty). */
export interface OfferDraft {
  tradeRate: number | null;
  tradeMin: number | null;
  tradeMax: number | null;
  custodyRate: number | null;
  custodyMin: number | null;
  custodyMax: number | null;
  custodyEveryMonths: number;
  fxRate: number | null;
  monthlyFee: number | null;
  offeredBy: string;
  /** `YYYY-MM-DD` or "". */
  offeredOn: string;
}

export const emptyDraft = (everyMonths = 12): OfferDraft => ({ tradeRate: null, tradeMin: null, tradeMax: null, custodyRate: null, custodyMin: null, custodyMax: null, custodyEveryMonths: everyMonths, fxRate: null, monthlyFee: null, offeredBy: "", offeredOn: "" });

export type DraftField = keyof Omit<OfferDraft, "custodyEveryMonths" | "offeredBy" | "offeredOn"> | "offeredOn" | "tradeBounds" | "custodyBounds" | "empty";
export type DraftErrors = Partial<Record<DraftField, "percent" | "negative" | "future" | "min-above-max" | "need-rate" | "empty">>;

/** The checks of flow 29: a percent up to 100, no negative amount, a minimum not above the maximum, a date that has come, a rate wherever a bound is given. */
export function validateDraft(d: OfferDraft, today: string): DraftErrors {
  const e: DraftErrors = {};
  const pct = (k: "tradeRate" | "custodyRate" | "fxRate") => {
    const v = d[k];
    if (v === null) return;
    if (v < 0) e[k] = "negative";
    else if (v > 100) e[k] = "percent";
  };
  const amount = (k: "tradeMin" | "tradeMax" | "custodyMin" | "custodyMax" | "monthlyFee") => {
    const v = d[k];
    if (v !== null && v < 0) e[k] = "negative";
  };
  pct("tradeRate");
  pct("custodyRate");
  pct("fxRate");
  (["tradeMin", "tradeMax", "custodyMin", "custodyMax", "monthlyFee"] as const).forEach(amount);
  if (d.tradeMin !== null && d.tradeMax !== null && d.tradeMin > d.tradeMax) e.tradeBounds = "min-above-max";
  if (d.custodyMin !== null && d.custodyMax !== null && d.custodyMin > d.custodyMax) e.custodyBounds = "min-above-max";
  if (d.tradeRate === null && (d.tradeMin !== null || d.tradeMax !== null)) e.tradeRate = "need-rate";
  if (d.custodyRate === null && (d.custodyMin !== null || d.custodyMax !== null)) e.custodyRate = "need-rate";
  if (d.offeredOn && d.offeredOn > today) e.offeredOn = "future";
  const any = [d.tradeRate, d.custodyRate, d.fxRate, d.monthlyFee].some((v) => v !== null);
  if (!any) e.empty = "empty";
  return e;
}

export const hasErrors = (e: DraftErrors) => Object.keys(e).length > 0;

const about = { rate: "שיעור שהוצע לכם", min: "מינימום שהוצע לכם", max: "מקסימום שהוצע לכם", fee: "דמי חשבון שהוצעו לכם" };

/** A draft that passed `validateDraft` as an offer, every number an entered value object dated `today`. */
export function offerFromDraft(providerId: string, d: OfferDraft, today: string): EnteredOffer {
  const lines: OfferLines = {};
  if (d.tradeRate !== null) {
    lines.trade = { rate: enteredValue(d.tradeRate, "pct_of_trade", today, about.rate) };
    if (d.tradeMin !== null) lines.trade.min = enteredValue(d.tradeMin, "nis_per_trade", today, about.min);
    if (d.tradeMax !== null) lines.trade.max = enteredValue(d.tradeMax, "nis_per_trade", today, about.max);
  }
  if (d.custodyRate !== null) {
    lines.custody = { rate: enteredValue(d.custodyRate, "pct_of_balance_per_period", today, about.rate), everyMonths: d.custodyEveryMonths };
    if (d.custodyMin !== null) lines.custody.min = enteredValue(d.custodyMin, "nis", today, about.min);
    if (d.custodyMax !== null) lines.custody.max = enteredValue(d.custodyMax, "nis", today, about.max);
  }
  if (d.fxRate !== null) lines.fx = { rate: enteredValue(d.fxRate, "pct_of_trade", today, about.rate) };
  if (d.monthlyFee !== null) lines.monthlyFee = enteredValue(d.monthlyFee, "nis_per_month", today, about.fee);
  const offer: EnteredOffer = { providerId, lines, savedAt: today };
  if (d.offeredBy.trim()) offer.offeredBy = d.offeredBy.trim();
  if (d.offeredOn) offer.offeredOn = { ...enteredValue(0, "text", today, "מתי הוצעה ההצעה"), value: d.offeredOn };
  return offer;
}

/** The draft the card opens with for a saved offer. */
export function draftOf(o: EnteredOffer | undefined, everyMonths: number): OfferDraft {
  const n = (v: ValueObject | undefined) => (v && typeof v.value === "number" ? v.value : null);
  if (!o) return emptyDraft(everyMonths);
  const l = o.lines;
  return {
    tradeRate: n(l.trade?.rate),
    tradeMin: n(l.trade?.min),
    tradeMax: n(l.trade?.max),
    custodyRate: n(l.custody?.rate),
    custodyMin: n(l.custody?.min),
    custodyMax: n(l.custody?.max),
    custodyEveryMonths: l.custody?.everyMonths ?? everyMonths,
    fxRate: n(l.fx?.rate),
    monthlyFee: n(l.monthlyFee),
    offeredBy: o.offeredBy ?? "",
    offeredOn: typeof o.offeredOn?.value === "string" ? o.offeredOn.value : "",
  };
}

// ---------------------------------------------------------------- to the engine

/** F-63: an entered tariff replaces the lines the person gives; the rest stays at the list. Percents become fractions; a bound left empty is none. */
export function toEnteredTariff(o: EnteredOffer): EnteredTariff {
  const num = (v: ValueObject | undefined) => (v && typeof v.value === "number" ? v.value : undefined);
  const t: EnteredTariff = {};
  const l = o.lines;
  if (l.trade && num(l.trade.rate) !== undefined) {
    const c: NonNullable<EnteredTariff["buy"]> = { rate: num(l.trade.rate)! / 100 };
    const min = num(l.trade.min);
    const max = num(l.trade.max);
    if (min !== undefined) c.min = min;
    if (max !== undefined) c.max = max;
    t.buy = c;
    t.sell = { ...c };
  }
  if (l.custody && num(l.custody.rate) !== undefined) {
    const c: NonNullable<EnteredTariff["custody"]> = { rate: num(l.custody.rate)! / 100, everyMonths: l.custody.everyMonths };
    const min = num(l.custody.min);
    const max = num(l.custody.max);
    if (min !== undefined) c.min = min;
    if (max !== undefined) c.max = max;
    t.custody = c;
  }
  if (l.fx && num(l.fx.rate) !== undefined) t.fx = num(l.fx.rate)! / 100;
  if (num(l.monthlyFee) !== undefined) t.monthlyFee = num(l.monthlyFee);
  return t;
}

/** The fee bases an offer gives, in the page's order. */
export function offerBases(o: EnteredOffer): ("trade" | "custody" | "fx" | "fixed")[] {
  const out: ("trade" | "custody" | "fx" | "fixed")[] = [];
  if (o.lines.trade) out.push("trade");
  if (o.lines.custody) out.push("custody");
  if (o.lines.fx) out.push("fx");
  if (o.lines.monthlyFee) out.push("fixed");
  return out;
}

// ---------------------------------------------------------------- the store

const store = deviceStore<Record<string, EnteredOffer>>(
  OFFERS_KEY,
  {},
  (raw) => Object.fromEntries(parseStored(raw).map((o) => [o.providerId, o])),
  (offers) => ({ version: 1, offers: Object.values(offers) }),
);

export const saveOffer = (offer: EnteredOffer) => store.update((o) => ({ ...o, [offer.providerId]: offer }));
export const clearOffer = (providerId: string) =>
  store.update((o) => {
    const next = { ...o };
    delete next[providerId];
    return next;
  });
/** For tests: forget everything the module read. */
export const resetOffersStore = () => store.reset();

export function useOffers() {
  const snap = store.use();
  return { offers: snap.value, ready: snap.ready, writable: snap.writable, save: saveOffer, clear: clearOffer };
}
