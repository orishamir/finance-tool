// The deal as the device keeps it (method §10.6): one product's fees as the person typed them or a template filled them, each fee
// with its prices over time. Rates are typed in percent; `engineDeal` is the one place they become the engine's fractions. `readDeal`
// checks every field of a deal from the device, a file or a link, and drops whatever is not a deal. No engine at run time: the
// side stores read this file on every page.
import { productIds, type ProductId, type ValueObject } from "@finance-tool/schema";
import type { CalendarMonth, Deal, DealFee, DealPrice, DealStage } from "@finance-tool/engine";
import { newId } from "../ids";
import { engineBase, FEE_SHAPES, holdsFunds, isFeeKindId, ONE_SIDE, type FeeKindId, type FormId, type Held } from "./shapes";

export type Strength = ValueObject["source"]["strength"];

/** Where a figure a template filled comes from: the record's source and dates, kept until the person changes the figure. */
export interface Sourced {
  url: string;
  title: string;
  publisher: string;
  strength: Strength;
  /** When the record was read, YYYY-MM-DD. */
  checked: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  ruleIds?: string[];
  /** D31: the company whose own product the figure prices, where the deal is that company's product. */
  own?: string;
}

/** A figure of a deal: entered by the person where it has no `src`, sourced where a template filled it and the person left it. */
export interface Num {
  v: number;
  src?: Sourced;
}

/** Months a rate is for or between charges: a month, a quarter, half a year, a year. */
export type Months = 1 | 3 | 6 | 12;
export const MONTHS: readonly Months[] = [1, 3, 6, 12];

/** A price as typed (F-110). Rates are percent; bounds and sums are shekels unless an action's `currency` names their currency. */
export type Price =
  | { form: "free" }
  /** A share of each action, `rate` percent, with a minimum and a maximum per action in `currency` (the shekel where absent). */
  | { form: "action"; rate: Num; min?: Num; max?: Num; currency?: BoundCurrency }
  /** A share of what is held, `rate` percent for each `per` months, charged every `every` months, with shekel bounds per charge. */
  | { form: "held"; rate: Num; per: Months; every: Months; min?: Num; max?: Num }
  /** A sum in shekels every `every` months, whatever the account holds. */
  | { form: "sum"; amount: Num; every: Months }
  /** A sum in shekels on each action. */
  | { form: "perAction"; amount: Num };

/** The currencies a bound may be typed in: the ones the price lists print bounds in (F-12, F-13). */
export type BoundCurrency = "ILS" | "USD" | "EUR" | "GBP";
export const BOUND_CURRENCIES: readonly BoundCurrency[] = ["ILS", "USD", "EUR", "GBP"];

/** A calendar month, `YYYY-MM`. */
export type MonthKey = string;

/** A price, and the month at whose start it ends; the last price of a fee has no end (F-110). */
export interface Stage {
  price: Price;
  until?: MonthKey;
}

/** One fee: what it is, its prices in order, and a sale's own prices where a sale is priced apart. */
export interface Fee {
  /** The fee's id within the deal, for the screen's keys and the panel's choice. */
  id: string;
  kind: FeeKindId;
  /** The person's own name for a fee of their own (`own`). */
  name?: string;
  stages: Stage[];
  sale?: Stage[];
}

/** The provider kind a deal names: a cap that binds only some providers is judged by it (F-113). */
export type ProviderKind = "bank" | "non-bank";

export interface FeeDeal {
  id: string;
  /** The person's name for the deal. */
  name: string;
  /** The product the deal is: a record of the kinds (a wrapper or a security); null before one is chosen. */
  kind: ProductId | null;
  /** The month the deal started or starts, where the person gave one. */
  start?: MonthKey;
  provider?: ProviderKind;
  /** What a kind that holds funds holds. */
  held?: Held;
  fees: Fee[];
  /** The template the deal was filled from, where one was. */
  template?: { id: string; name: string };
  /** When the deal was last saved on the device, YYYY-MM-DD. */
  saved?: string;
}

/** Whether a string is a product id of the records. */
export const isProductId = (x: unknown): x is ProductId => productIds.includes(x as ProductId);

export const NAME_MAX = 60;
const TEXT_MAX = 400;
/** No typed percent is above this, and no sum above this many shekels: anything larger is not a price and is refused. */
const PCT_MAX = 100;
export const SUM_MAX = 1_000_000_000;
const FEES_MAX = 40;
const STAGES_MAX = 12;
const MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^[a-z0-9-]{1,40}$/;
const STRENGTHS: readonly Strength[] = ["primary", "institution", "secondary", "open", "entered"];
const CURRENCY = /^[A-Z]{3}$/;
/** A source's address: on the web over https, or a document of the repository (`docs/company-answers.md#ibi-2026-11-08`). */
const SOURCE_URL = /^(https:\/\/[^\s"<>]+|docs\/[A-Za-z0-9_./-]+(#[A-Za-z0-9_.-]+)?)$/;

// ---------------------------------------------------------------- months

/** The engine's month of a `YYYY-MM` key. */
export function monthOf(key: MonthKey): CalendarMonth {
  const m = MONTH.exec(key);
  if (!m) throw new RangeError(`not a month: ${key}`);
  return { y: Number(m[1]), m: Number(m[2]) };
}

export const monthKey = (c: CalendarMonth): MonthKey => `${c.y}-${String(c.m).padStart(2, "0")}`;

/** The month of a `YYYY-MM-DD` date. */
export const monthOfDate = (date: string): CalendarMonth => monthOf(date.slice(0, 7));

/** Whole months from `a` to `b`, negative where `b` is earlier. */
export const monthsBetween = (a: CalendarMonth, b: CalendarMonth): number => b.y * 12 + b.m - (a.y * 12 + a.m);

// ---------------------------------------------------------------- new things

// ids never repeat, however many are made in one moment (lib/ids.ts): a deal must have none repeated (readDeal refuses a repeated fee id)
export const newDealId = () => newId("deal-");
export const newFeeId = () => newId("fee-");

/** An empty deal of a kind (or of none yet). */
export function newDeal(kind: ProductId | null, name = ""): FeeDeal {
  return { id: newDealId(), name, kind, fees: [] };
}

/** A typed figure, entered by the person. */
export const typed = (v: number): Num => ({ v });

/** A figure the person changed is theirs: it loses the template's source. */
export const retyped = (n: Num, v: number): Num => (n.src && n.v === v ? n : { v });

/** A new price of a fee's usual form, with nothing typed in it yet (zero), or free. */
export function blankPrice(form: FormId): Price {
  switch (form) {
    case "free":
      return { form: "free" };
    case "action":
      return { form: "action", rate: typed(0) };
    case "held":
      return { form: "held", rate: typed(0), per: 12, every: 12 };
    case "sum":
      return { form: "sum", amount: typed(0), every: 1 };
    case "perAction":
      return { form: "perAction", amount: typed(0) };
  }
}

/** A new fee of a kind: one price of its usual form that holds throughout. */
export function newFee(kind: FeeKindId, name?: string): Fee {
  return { id: newFeeId(), kind, ...(kind === "own" && name ? { name: name.slice(0, NAME_MAX) } : {}), stages: [{ price: blankPrice(FEE_SHAPES[kind].usual) }] };
}

// ---------------------------------------------------------------- to the engine

/** A typed percent as the engine's fraction: the one place the two meet. */
export const fraction = (pct: number): number => pct / 100;

/**
 * A price as the engine reads it (F-110): a held rate becomes the share of each charge, `rate × every / per`; a bound's currency goes
 * only with a bound typed, since it prices nothing else (F-110, F-112).
 */
export function enginePrice(p: Price): DealPrice {
  switch (p.form) {
    case "free":
      return { kind: "free" };
    case "action":
      return {
        kind: "action",
        rate: fraction(p.rate.v),
        ...(p.min ? { min: p.min.v } : {}),
        ...(p.max ? { max: p.max.v } : {}),
        ...((p.min || p.max) && p.currency && p.currency !== "ILS" ? { currency: p.currency } : {}),
      };
    case "held":
      return { kind: "held", rate: (fraction(p.rate.v) * p.every) / p.per, everyMonths: p.every, ...(p.min ? { min: p.min.v } : {}), ...(p.max ? { max: p.max.v } : {}) };
    case "sum":
      return { kind: "sum", amount: p.amount.v, everyMonths: p.every };
    case "perAction":
      return { kind: "perAction", amount: p.amount.v };
  }
}

const engineStages = (stages: readonly Stage[]): DealStage[] => stages.map((s) => ({ price: enginePrice(s.price), ...(s.until ? { until: monthOf(s.until) } : {}) }));

/** A fee as the engine reads it. */
export function engineFee(f: Fee): DealFee {
  return { base: engineBase(f.kind), stages: engineStages(f.stages), ...(f.sale ? { sale: engineStages(f.sale) } : {}) };
}

/** Whether what a deal holds is in a currency other than the shekel (F-111): a purchase and a sale then carry a conversion. */
export const isForeign = (deal: Pick<FeeDeal, "kind" | "held">): boolean => holdsFunds(deal.kind) && !!deal.held && deal.held.currency !== "ILS";

/** The deal as the engine reads it (F-110 to F-113), its fees in the deal's order. */
export function engineDeal(deal: FeeDeal): Deal {
  return {
    fees: deal.fees.map(engineFee),
    foreign: isForeign(deal),
    ...(deal.start ? { start: monthOf(deal.start) } : {}),
    ...(deal.provider ? { provider: deal.provider } : {}),
  };
}

// ---------------------------------------------------------------- checking a deal

type Rec = Record<string, unknown>;
const isRec = (v: unknown): v is Rec => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, max = TEXT_MAX): v is string => typeof v === "string" && v.length <= max;

function readSourced(raw: unknown): Sourced | null {
  if (!isRec(raw)) return null;
  const { url, title, publisher, strength, checked } = raw;
  // a source opens as a link on the page: only an address on the web or one of the repository's documents, never a script or another scheme
  if (!str(url) || !SOURCE_URL.test(url) || url.includes("..") || !str(title) || !str(publisher) || !STRENGTHS.includes(strength as Strength) || !str(checked) || !DATE.test(checked)) return null;
  const out: Sourced = { url, title, publisher, strength: strength as Strength, checked };
  if (raw.effectiveFrom !== undefined) {
    if (!str(raw.effectiveFrom) || !DATE.test(raw.effectiveFrom)) return null;
    out.effectiveFrom = raw.effectiveFrom;
  }
  if (raw.effectiveTo !== undefined) {
    if (!str(raw.effectiveTo) || !DATE.test(raw.effectiveTo)) return null;
    out.effectiveTo = raw.effectiveTo;
  }
  if (raw.ruleIds !== undefined) {
    if (!Array.isArray(raw.ruleIds) || raw.ruleIds.length > 20 || !raw.ruleIds.every((r) => str(r, 20) && /^[A-Z0-9-]+$/.test(r))) return null;
    out.ruleIds = raw.ruleIds as string[];
  }
  if (raw.own !== undefined) {
    if (!str(raw.own, 120)) return null;
    out.own = raw.own;
  }
  return out;
}

function readNum(raw: unknown, max: number): Num | null {
  if (!isRec(raw) || typeof raw.v !== "number" || !Number.isFinite(raw.v) || raw.v < 0 || raw.v > max) return null;
  if (raw.src === undefined) return { v: raw.v };
  const src = readSourced(raw.src);
  return src ? { v: raw.v, src } : null;
}

/** An optional figure: absent is fine, present must be a figure. `undefined` in the result's `ok: false` means it is not one. */
function optNum(raw: unknown, max: number): { ok: true; n?: Num } | { ok: false } {
  if (raw === undefined) return { ok: true };
  const n = readNum(raw, max);
  return n ? { ok: true, n } : { ok: false };
}

const isMonths = (v: unknown): v is Months => MONTHS.includes(v as Months);

function readPrice(raw: unknown, kind: FeeKindId): Price | null {
  if (!isRec(raw)) return null;
  const shape = FEE_SHAPES[kind];
  if (raw.form === "free") return { form: "free" };
  if (!shape.forms.includes(raw.form as never)) return null;
  switch (raw.form) {
    case "action": {
      const rate = readNum(raw.rate, PCT_MAX), min = optNum(raw.min, SUM_MAX), max = optNum(raw.max, SUM_MAX);
      if (!rate || !min.ok || !max.ok) return null;
      if (raw.currency !== undefined && !(typeof raw.currency === "string" && CURRENCY.test(raw.currency) && (raw.currency as string) in currencyIndex)) return null;
      return { form: "action", rate, ...(min.n ? { min: min.n } : {}), ...(max.n ? { max: max.n } : {}), ...(raw.currency && raw.currency !== "ILS" ? { currency: raw.currency as BoundCurrency } : {}) };
    }
    case "held": {
      const rate = readNum(raw.rate, PCT_MAX), min = optNum(raw.min, SUM_MAX), max = optNum(raw.max, SUM_MAX);
      if (!rate || !min.ok || !max.ok || !isMonths(raw.per) || !isMonths(raw.every)) return null;
      return { form: "held", rate, per: raw.per, every: raw.every, ...(min.n ? { min: min.n } : {}), ...(max.n ? { max: max.n } : {}) };
    }
    case "sum": {
      const amount = readNum(raw.amount, SUM_MAX);
      return amount && isMonths(raw.every) ? { form: "sum", amount, every: raw.every } : null;
    }
    case "perAction": {
      const amount = readNum(raw.amount, SUM_MAX);
      return amount ? { form: "perAction", amount } : null;
    }
    default:
      return null;
  }
}

const currencyIndex: Record<string, true> = Object.fromEntries(BOUND_CURRENCIES.map((c) => [c, true]));

/** Whether a fee's prices are what F-110 reads: at least one, each but the last ending, the ends in order, the last with none. */
export function stagesInOrder(stages: readonly Stage[]): boolean {
  if (stages.length === 0) return false;
  return stages.every((s, k) => (k === stages.length - 1 ? s.until === undefined : s.until !== undefined && MONTH.test(s.until) && (k === 0 || s.until > stages[k - 1]!.until!)));
}

/** Whether every fee of a deal can be read (F-110): the screen leaves a fee whose prices are not in order out of the reading until they are. */
export const feeInOrder = (f: Fee): boolean => stagesInOrder(f.stages) && (!f.sale || stagesInOrder(f.sale));

function readStages(raw: unknown, kind: FeeKindId): Stage[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > STAGES_MAX) return null;
  const out: Stage[] = [];
  for (const s of raw) {
    if (!isRec(s)) return null;
    const price = readPrice(s.price, kind);
    if (!price || (s.until !== undefined && !(typeof s.until === "string" && MONTH.test(s.until)))) return null;
    out.push(s.until === undefined ? { price } : { price, until: s.until as string });
  }
  // prices out of order are kept as typed: a deal is saved while it is edited, and the reading leaves such a fee out (`feeInOrder`)
  return out;
}

function readFee(raw: unknown): Fee | null {
  if (!isRec(raw) || typeof raw.id !== "string" || !ID.test(raw.id) || !isFeeKindId(raw.kind)) return null;
  const kind = raw.kind;
  const stages = readStages(raw.stages, kind);
  if (!stages) return null;
  const fee: Fee = { id: raw.id, kind, stages };
  if (raw.name !== undefined) {
    if (kind !== "own" || !str(raw.name, NAME_MAX)) return null;
    fee.name = raw.name;
  }
  if (raw.sale !== undefined) {
    // a fee charged on one side alone has no separate sale price, and a fee whose shape prices no sale apart has none either
    if (ONE_SIDE[kind] || !FEE_SHAPES[kind].saleApart) return null;
    const sale = readStages(raw.sale, kind);
    if (!sale) return null;
    fee.sale = sale;
  }
  return fee;
}

function readHeld(raw: unknown): Held | null {
  if (!isRec(raw)) return null;
  if ((raw.place !== "israel" && raw.place !== "abroad") || typeof raw.currency !== "string" || !CURRENCY.test(raw.currency) || (raw.payout !== "accumulating" && raw.payout !== "distributing")) return null;
  return { place: raw.place, currency: raw.currency, payout: raw.payout };
}

/** A deal from the device, a file or a link, every field checked; null where anything in it is not what a deal holds. */
export function readDeal(raw: unknown): FeeDeal | null {
  if (!isRec(raw) || typeof raw.id !== "string" || !ID.test(raw.id) || !str(raw.name, NAME_MAX)) return null;
  if (raw.kind !== null && !isProductId(raw.kind)) return null;
  const kind = raw.kind as ProductId | null;
  if (!Array.isArray(raw.fees) || raw.fees.length > FEES_MAX) return null;
  const fees: Fee[] = [];
  for (const f of raw.fees) {
    const fee = readFee(f);
    if (!fee || fees.some((x) => x.id === fee.id)) return null;
    fees.push(fee);
  }
  const deal: FeeDeal = { id: raw.id, name: raw.name, kind, fees };
  if (raw.start !== undefined) {
    if (typeof raw.start !== "string" || !MONTH.test(raw.start)) return null;
    deal.start = raw.start;
  }
  if (raw.provider !== undefined) {
    if (raw.provider !== "bank" && raw.provider !== "non-bank") return null;
    deal.provider = raw.provider;
  }
  if (raw.held !== undefined) {
    const held = readHeld(raw.held);
    if (!held || !holdsFunds(kind)) return null;
    deal.held = held;
  }
  if (raw.template !== undefined) {
    if (!isRec(raw.template) || !str(raw.template.id, 120) || !str(raw.template.name, 200)) return null;
    deal.template = { id: raw.template.id, name: raw.template.name };
  }
  if (raw.saved !== undefined) {
    if (typeof raw.saved !== "string" || !DATE.test(raw.saved)) return null;
    deal.saved = raw.saved;
  }
  return deal;
}
