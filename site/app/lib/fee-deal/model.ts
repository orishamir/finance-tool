// The deal as the device keeps it (method §10.6): one product's fees as the person typed them or a template filled them, each fee
// with its prices over time, or, for a fee whose price changes by things (F-114), its cases, each with its own prices over time; and the
// reading's picks. Rates are typed in percent; `engineDeal` (to-engine.ts) is the one place they become the engine's fractions. `readDeal`
// checks every field of a deal from the device, a file or a link, and drops whatever is not a deal. No engine at run time: the side
// stores read this file on every page.
import { productIds, type ProductId, type ValueObject } from "@finance-tool/schema";
import type { CalendarMonth } from "@finance-tool/engine";
import { newId } from "../ids";
import {
  BY_MAX,
  byKindsFor,
  FEE_SHAPES,
  holdsFunds,
  isFeeKindId,
  isRangeKind,
  LIST_IDS,
  ONE_SIDE,
  RANGE_UNITS,
  WHAT_VALUES,
  type ByKind,
  type FeeKindId,
  type FieldId,
  type FormId,
  type Place,
  type RangeKind,
  type RangeUnit,
} from "./shapes";

export type Strength = ValueObject["source"]["strength"];

/** Where a figure a template filled comes from: the record's source and dates, kept until the person changes the figure. */
export interface Sourced {
  url: string;
  title: string;
  publisher: string;
  strength: Strength;
  /** When the record was read, YYYY-MM-DD. */
  checked: string;
  /** The page of the document the figure stands on, where the record gives it (a PDF's own page count). */
  page?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  ruleIds?: string[];
  /** D31: the company whose own product the figure prices, where the deal is that company's product. */
  own?: string;
}

/**
 * A figure of a deal: entered by the person where it has no `src`, sourced where a template filled it and the person left it. `blank`: a
 * rate or a sum nobody typed and no template filled (a new fee's, a later price just added); its box is empty and its `v` (0) means
 * nothing. A price with a blank figure states no price, so its fee is not read until the figure is typed or the price is made free.
 */
export interface Num {
  v: number;
  src?: Sourced;
  blank?: true;
}

/** Months a rate is for or between charges: a month, a quarter, half a year, a year. */
export type Months = 1 | 3 | 6 | 12;
export const MONTHS: readonly Months[] = [1, 3, 6, 12];

/**
 * A flat price for a small action (F-12, F-13): an action of at most `upTo` pays `amount`, both in the price's currency. Its figures are
 * blank until typed (a switch to a flat price starts it empty), and a price whose flat price is not given states no price yet.
 */
export interface Flat {
  amount: Num;
  upTo: Num;
}

/** A share off a price (F-116): `pct` percent off its rate or sum, and off its minimum too where the list says so (`alsoMin`). */
export interface Discount {
  pct: Num;
  alsoMin?: true;
}

/**
 * A third party's fee with its figure (F-117): a share of the action (`rate` percent), a sum for each unit, or a sum on each action, with
 * its own bounds, each sum in `currency` (the shekel where absent).
 */
export type ThirdPrice =
  | { form: "action"; rate: Num; min?: Num; max?: Num; currency?: BoundCurrency }
  | { form: "perUnit"; amount: Num; min?: Num; max?: Num; currency?: BoundCurrency }
  | { form: "perAction"; amount: Num; currency?: BoundCurrency };

/**
 * A third party's fee printed with a price: whose it is, in the list's words where it names one (`who`: "הברוקר", "הבורסה והסליקה"), and
 * its figure (`price`, F-117), or none where the list gives none ("בלי סכום בתעריפון", §10.6's stated parts).
 */
export interface Third {
  who?: string;
  price?: ThirdPrice;
}

/** A fee a price is offset against: that month's charges of the deal's fee of this kind, up to the price's own sum (§10.6's stated parts). */
export interface Offset {
  kind: FeeKindId;
}

/** What a price list says of an order, beside its price (§10.6's stated parts): charged on an order not carried out too, each partial fill charged apart. */
export type Note = "unfilled" | "partial";
export const NOTES: readonly Note[] = ["unfilled", "partial"];

/** The parts of a price beside its figures that tie it to another fee (§10.6's stated parts): an offset, and a refund in the price's currency. */
interface Linked {
  offset?: Offset;
  refund?: Num;
}

/** The parts of a price on an action beside its figures: a discount (F-116), a third party's fee (F-117), and notes on an order (§10.6's stated parts). */
interface OnAction extends Linked {
  discount?: Discount;
  third?: Third;
  notes?: Note[];
}

/**
 * A price as typed (F-110). Rates and caps are percent; bounds, flat prices and sums are shekels unless the price's `currency` names
 * their currency.
 */
export type Price =
  | { form: "free" }
  /**
   * A share of each action, `rate` percent, with a minimum and a maximum per action, a cap as a percent of the action (`cap`, the percent
   * maximum) and a flat price for a small action, each sum in `currency` (the shekel where absent).
   */
  | ({ form: "action"; rate: Num; min?: Num; max?: Num; cap?: Num; flat?: Flat; currency?: BoundCurrency } & OnAction)
  /** A sum for each unit traded, `amount` in `currency`, with the same minimum, maximum, cap and flat price as a share of an action. */
  | ({ form: "perUnit"; amount: Num; min?: Num; max?: Num; cap?: Num; flat?: Flat; currency?: BoundCurrency } & OnAction)
  /** A share of what is held, `rate` percent for each `per` months, charged every `every` months, with shekel bounds per charge. */
  | ({ form: "held"; rate: Num; per: Months; every: Months; min?: Num; max?: Num } & Linked)
  /** A sum in shekels every `every` months, whatever the account holds. */
  | ({ form: "sum"; amount: Num; every: Months } & Linked)
  /** A sum on each action, in `currency` (the shekel where absent). */
  | ({ form: "perAction"; amount: Num; currency?: BoundCurrency } & OnAction);

/** Whether a price is on an action, and so may carry a discount, a third party's fee and notes on an order. */
export const onAction = (p: Price): p is PricedIn => p.form === "action" || p.form === "perUnit" || p.form === "perAction";

/** A price whose sums may be in a currency other than the shekel: a share of an action, a sum per unit, a sum per action. */
export type PricedIn = Extract<Price, { form: "action" | "perUnit" | "perAction" }>;

/** The currencies a bound, a flat price, a sum per unit or a sum per action may be typed in: the ones the price lists print (F-12, F-13, F-103). */
export type BoundCurrency = "ILS" | "USD" | "EUR" | "GBP";
export const BOUND_CURRENCIES: readonly BoundCurrency[] = ["ILS", "USD", "EUR", "GBP"];

/** A calendar month, `YYYY-MM`. */
export type MonthKey = string;

/** A price, and the month at whose start it ends; the last price of a fee has no end (F-110). */
export interface Stage {
  price: Price;
  until?: MonthKey;
}

/** Prices over time: a fee's whose price changes by nothing, or one case's; a sale's own where a sale is priced apart. */
export interface Priced {
  stages: Stage[];
  sale?: Stage[];
}

/** A value of what is bought or held that the person named, with where it is bought and its currency (null: a foreign one not named). */
export interface OwnPlace {
  name: string;
  place: Place;
  currency: string | null;
}

/**
 * A thing a fee's price changes by (F-114). A list thing (what is bought or held, the channel, the currency) names its values in the
 * cases, as the site's ids or in the person's words; what is bought or held keeps where each value of the person's own is bought and its
 * currency (`own`). A track's and a condition's values are the person's words; a condition has a name (`label`). A range has its tops
 * (`tops`, in order, each above the one before) in a unit (`unit`); its cases name steps.
 */
export type By =
  | { kind: "what" | "held"; own?: OwnPlace[] }
  | { kind: "channel" | "currency" | "track" }
  | { kind: "own"; label: string }
  | { kind: RangeKind; unit: RangeUnit; tops: Num[] };

/** A range thing of a fee. */
export type RangeBy = Extract<By, { tops: Num[] }>;
export const isRange = (b: By): b is RangeBy => isRangeKind(b.kind);

/**
 * What a case says of one thing (F-114): any value (`"any"`), named values (several may be named: the site's ids, or the person's words), or
 * a step of a range (its index: 0 is "עד" the first top, the last "מעל" the last top).
 */
export type When = "any" | string[] | number;

/** One case of a fee whose price changes: its value for each thing (in the fee's order), whether its track is the person's, and its prices. */
export interface Case extends Priced {
  id: string;
  when: When[];
  /** The case's track is the person's own (one track of a fee is; F-114 reads it). */
  mine?: true;
}

interface FeeHead {
  /** The fee's id within the deal, for the screen's keys and the panel's choice. */
  id: string;
  kind: FeeKindId;
  /** The person's own name for a fee of their own (`own`). */
  name?: string;
}

/** A fee whose price changes by nothing: its prices in order, and a sale's own prices where a sale is priced apart. */
export interface SlimFee extends FeeHead, Priced {
  by?: undefined;
  cases?: undefined;
}

/** A fee whose price changes by one to three things (F-114): the things, and one flat case for each set of their values. */
export interface CasesFee extends FeeHead {
  by: By[];
  cases: Case[];
  stages?: undefined;
  sale?: undefined;
}

/** One fee: what it is, and its prices, whole or by case. */
export type Fee = SlimFee | CasesFee;

export const hasCases = (f: Fee): f is CasesFee => f.cases !== undefined;

/**
 * The key a thing is picked by in the reading: its kind (what is bought and what is held share one, `what`), or a condition's name after
 * `own:`.
 */
export const pickKey = (b: By): string => (b.kind === "own" ? `own:${b.label}` : b.kind === "held" ? "what" : b.kind);

/**
 * The reading's pick for one thing (F-114), by its key (`pickKey`): a named value (the site's id, or the person's words), or a step of a
 * range as its top (`<=N`) or above the last (`>N`). A pick of what is bought may say itself where it is bought and its currency (`place`,
 * `currency`), and then those are what is bought, whatever its value names: a deal saved before cases said both of what it held.
 */
export interface ReadPick {
  by: string;
  is: string;
  place?: Place;
  currency?: string;
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
  fees: Fee[];
  /** The reading's picks (F-114): what the deal is read for, one value per thing its fees change by; a thing not picked starts as F-114 says. */
  readFor?: ReadPick[];
  /**
   * The template the deal names: the one its fees were filled from, or, where `feesKept` is set, the track picked for it while it held a
   * fee the person typed or changed, which filled none of its fees.
   */
  template?: { id: string; name: string; feesKept?: true };
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

/** A figure nobody has typed yet. */
export const blankFigure = (): Num => ({ v: 0, blank: true });

/** A figure the person changed is theirs: it loses the template's source. */
export const retyped = (n: Num, v: number): Num => (n.src && n.v === v ? n : { v });

/** A third party's figures: its rate or sum and its bounds. */
const thirdFigures = (t: ThirdPrice | undefined): (Num | undefined)[] => (!t ? [] : t.form === "perAction" ? [t.amount] : [t.form === "action" ? t.rate : t.amount, t.min, t.max]);

/** The figures of a price (`Num`s): its rate or sum, its bounds, its cap, its flat price, and its parts' figures (a discount, a third party's, a refund). */
const figuresOf = (p: Price): (Num | undefined)[] => {
  const parts = (x: Partial<OnAction>) => [x.discount?.pct, ...thirdFigures(x.third?.price), x.refund];
  switch (p.form) {
    case "free":
      return [];
    case "action":
    case "perUnit":
      return [mainFigure(p)!, p.min, p.max, p.cap, p.flat?.amount, p.flat?.upTo, ...parts(p)];
    case "held":
      return [p.rate, p.min, p.max, p.refund];
    case "sum":
      return [p.amount, p.refund];
    case "perAction":
      return [p.amount, ...parts(p)];
  }
};

/**
 * Whether a fee holds nothing the person gave: one price with no end, no sale priced apart and no name of its own, and either every figure
 * still carrying a template's source (`retyped` drops the source of a figure the person changes), or its price still asking for its figure
 * with no bound (a fee just added). A fee with cases holds nothing the person gave where every case is so and nothing in its things is
 * typed (a range's tops are figures too).
 */
export function untouched(fee: Fee): boolean {
  if (fee.name !== undefined) return false;
  if (hasCases(fee)) {
    const tops = fee.by.flatMap((b) => (isRange(b) ? b.tops : []));
    return tops.every((n) => n.src !== undefined) && fee.cases.every((c) => !c.mine && pricesUntouched(c));
  }
  return pricesUntouched(fee);
}

const pricesUntouched = (x: Priced): boolean => {
  if (x.stages.length !== 1 || x.stages[0]!.until !== undefined || x.sale) return false;
  const price = x.stages[0]!.price;
  const figures = figuresOf(price).filter((n): n is Num => n !== undefined);
  if (mainFigure(price)?.blank) return figures.length === 1;
  return figures.length > 0 && figures.every((n) => n.src !== undefined);
};

/** A new price of a form, with nothing typed in it yet (its rate or sum blank), or free. */
export function blankPrice(form: FormId): Price {
  switch (form) {
    case "free":
      return { form: "free" };
    case "action":
      return { form: "action", rate: blankFigure() };
    case "held":
      return { form: "held", rate: blankFigure(), per: 12, every: 12 };
    case "sum":
      return { form: "sum", amount: blankFigure(), every: 1 };
    case "perAction":
      return { form: "perAction", amount: blankFigure() };
    case "perUnit":
      return { form: "perUnit", amount: blankFigure() };
  }
}

/** The figure that states a price: its rate, or its sum (a sum per unit's among them); none for a free price. */
export const mainFigure = (p: Price): Num | null => (p.form === "action" || p.form === "held" ? p.rate : p.form === "free" ? null : p.amount);

/**
 * Whether a price states a price: free, or its rate or sum typed or filled (not blank), and its flat price's two figures where it has one,
 * its discount's share, its third party's figure and its refund where it has them.
 */
export const pricePriced = (p: Price): boolean => figuresOf(p).every((n) => !n?.blank);

/** The prices of a stage list that hold at `from` or later: a price that ended by then is past, and F-110 does not read it. */
export const pricesFrom = (stages: readonly Stage[], from: MonthKey): Stage[] => stages.filter((s) => s.until === undefined || s.until > from);

/**
 * Whether every price of a fee (or a case) from `from` on states one (`pricePriced`): a fee with a price not yet given there is left out
 * of the reading. A price that has passed by `from` does not count, given or not. A fee with cases states its prices where every case does.
 */
export const feePriced = (f: Fee | Priced, from: MonthKey): boolean => ("cases" in f && f.cases ? f.cases.every((c) => feePriced(c, from)) : stagesPriced(f as Priced, from));

const stagesPriced = (x: Priced, from: MonthKey): boolean => [x.stages, ...(x.sale ? [x.sale] : [])].every((st) => pricesFrom(st, from).every((s) => pricePriced(s.price)));

/** Which prices of a fee: its purchase's (or its only ones), or a sale's priced apart. */
export type Side = "buy" | "sell";

/**
 * The prices a fee's card edits: a fee's whose price changes by nothing, or one case's (`caseId`; the first case where it names none or
 * one the fee does not have).
 */
export function pricedOf(fee: Fee, caseId?: string): Priced {
  if (!hasCases(fee)) return fee;
  return fee.cases.find((c) => c.id === caseId) ?? fee.cases[0]!;
}

/** A fee's prices on a side (of a case, where `caseId` names one): the sale's where it is priced apart, else the fee's own. */
export const pricesOn = (fee: Fee, side: Side, caseId?: string): Stage[] => {
  const x = pricedOf(fee, caseId);
  return side === "sell" && x.sale ? x.sale : x.stages;
};

/** Two values with the same content, whatever order their fields were set in (a deal, a fee, a price). */
export function sameContent(a: unknown, b: unknown): boolean {
  return a === b || canonical(a) === canonical(b);
}
const canonical = (v: unknown): string =>
  Array.isArray(v) ? `[${v.map(canonical).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v).sort().filter((k) => (v as Record<string, unknown>)[k] !== undefined).map((k) => `${JSON.stringify(k)}:${canonical((v as Record<string, unknown>)[k])}`).join(",")}}` : JSON.stringify(v);

export const newCaseId = () => newId("case-");

/** A new fee of a kind: one price of its usual form that holds throughout. */
export function newFee(kind: FeeKindId, name?: string): SlimFee {
  return { id: newFeeId(), kind, ...(kind === "own" && name ? { name: name.slice(0, NAME_MAX) } : {}), stages: [{ price: blankPrice(FEE_SHAPES[kind].usual) }] };
}

/** A typed percent as the engine's fraction: the one place the two meet (to-engine.ts uses it). */
export const fraction = (pct: number): number => pct / 100;

/**
 * What is bought for the reading's pick of `what` (F-114): where it is bought and its currency as the pick says them where it does (a deal
 * saved before cases), else as its value names them (`placeOf`).
 */
export const pickedPlace = (fees: readonly Fee[], pick: ReadPick): { place: Place; currency: string | null } | null =>
  pick.place !== undefined && pick.currency !== undefined ? { place: pick.place, currency: pick.currency } : placeOf(fees, pick.is);

/** What is bought or held for a value of the reading's pick of `what` (F-114): the site's values, or one the person named on a fee's thing. */
export function placeOf(fees: readonly Fee[], value: string): { place: Place; currency: string | null } | null {
  if (Object.hasOwn(WHAT_VALUES, value)) return WHAT_VALUES[value]!;
  for (const f of fees) for (const b of f.by ?? []) if ((b.kind === "what" || b.kind === "held") && b.own) for (const o of b.own) if (o.name === value) return { place: o.place, currency: o.currency };
  return null;
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
  if (raw.page !== undefined) {
    if (!(typeof raw.page === "number" && Number.isInteger(raw.page) && raw.page > 0 && raw.page < 100_000)) return null;
    out.page = raw.page;
  }
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
  // a blank figure is a zero with no source; a deal saved before figures could be blank has none, and its zeros stay prices of zero
  if (raw.blank !== undefined) return raw.blank === true && raw.v === 0 && raw.src === undefined ? blankFigure() : null;
  if (raw.src === undefined) return { v: raw.v };
  const src = readSourced(raw.src);
  return src ? { v: raw.v, src } : null;
}

/** An optional figure: absent is fine, present must be a figure. `undefined` in the result's `ok: false` means it is not one. */
function optNum(raw: unknown, max: number): { ok: true; n?: Num } | { ok: false } {
  if (raw === undefined) return { ok: true };
  const n = readNum(raw, max);
  // a bound not given is absent, never blank
  return n && !n.blank ? { ok: true, n } : { ok: false };
}

const isMonths = (v: unknown): v is Months => MONTHS.includes(v as Months);

/** A price's currency: absent, or one of the currencies a price may be typed in; `false` where it is anything else. The shekel is left unsaid. */
function readCurrency(raw: unknown): { currency?: BoundCurrency } | false {
  if (raw === undefined) return {};
  if (!(typeof raw === "string" && CURRENCY.test(raw) && raw in currencyIndex)) return false;
  return raw === "ILS" ? {} : { currency: raw as BoundCurrency };
}

/** A flat price: absent, or its two figures (each may still be blank); null where it is anything else. */
function readFlat(raw: unknown): { ok: true; flat?: Flat } | { ok: false } {
  if (raw === undefined) return { ok: true };
  if (!isRec(raw)) return { ok: false };
  const amount = readNum(raw.amount, SUM_MAX), upTo = readNum(raw.upTo, SUM_MAX);
  return amount && upTo ? { ok: true, flat: { amount, upTo } } : { ok: false };
}

/**
 * The parts a share of an action and a sum per unit share, each only where the fee's shape has its field (a cap on the trade fee alone, a
 * flat price on the trade fee and the conversion): null where one is there that the shape has no field for, or is not what it holds.
 */
function readActionParts(raw: Rec, fields: readonly FieldId[]): { min?: Num; max?: Num; cap?: Num; flat?: Flat; currency?: BoundCurrency } | null {
  const min = optNum(raw.min, SUM_MAX), max = optNum(raw.max, SUM_MAX), cap = optNum(raw.cap, PCT_MAX), flat = readFlat(raw.flat), currency = readCurrency(raw.currency);
  if (!min.ok || !max.ok || !cap.ok || !flat.ok || !currency) return null;
  if ((cap.n && !fields.includes("cap")) || (flat.flat && !fields.includes("flat"))) return null;
  return { ...(min.n ? { min: min.n } : {}), ...(max.n ? { max: max.n } : {}), ...(cap.n ? { cap: cap.n } : {}), ...(flat.flat ? { flat: flat.flat } : {}), ...currency };
}

/** A third party's fee: who it is, where named, and its figure, where the list gives one (F-117; §10.6's stated parts); null where it is anything else. */
function readThird(raw: unknown): Third | null {
  if (!isRec(raw)) return null;
  const out: Third = {};
  if (raw.who !== undefined) {
    if (!str(raw.who, NAME_MAX) || raw.who.trim() === "") return null;
    out.who = raw.who;
  }
  if (raw.price === undefined) return out;
  const p = raw.price;
  if (!isRec(p)) return null;
  const currency = readCurrency(p.currency);
  if (!currency) return null;
  if (p.form === "perAction") {
    const amount = readNum(p.amount, SUM_MAX);
    return amount ? { ...out, price: { form: "perAction", amount, ...currency } } : null;
  }
  const min = optNum(p.min, SUM_MAX), max = optNum(p.max, SUM_MAX);
  if (!min.ok || !max.ok) return null;
  const bounds = { ...(min.n ? { min: min.n } : {}), ...(max.n ? { max: max.n } : {}), ...currency };
  if (p.form === "action") {
    const rate = readNum(p.rate, PCT_MAX);
    return rate ? { ...out, price: { form: "action", rate, ...bounds } } : null;
  }
  if (p.form === "perUnit") {
    const amount = readNum(p.amount, SUM_MAX);
    return amount ? { ...out, price: { form: "perUnit", amount, ...bounds } } : null;
  }
  return null;
}

/** An optional part: absent, or what `read` makes of it; `false` where it is there and is not one. */
function optPart<T>(raw: unknown, read: (raw: unknown) => T | null): { part?: T } | false {
  if (raw === undefined) return {};
  const part = read(raw);
  return part === null ? false : { part };
}

/** The parts that tie a price to another fee (§10.6's stated parts): an offset against a fee of the deal's kinds, a refund. */
function readLinked(raw: Rec): Linked | null {
  const offset = optPart(raw.offset, (o) => (isRec(o) && isFeeKindId(o.kind) && Object.keys(o).length === 1 ? { kind: o.kind } : null));
  const refund = optPart(raw.refund, (n) => readNum(n, SUM_MAX));
  if (!offset || !refund) return null;
  return { ...(offset.part ? { offset: offset.part } : {}), ...(refund.part ? { refund: refund.part } : {}) };
}

/** The parts of a price on an action beside its figures (F-116, F-117 and §10.6's stated parts): a discount, a third party's fee, notes, and the linked parts. */
function readOnAction(raw: Rec): OnAction | null {
  const linked = readLinked(raw);
  const discount = optPart(raw.discount, (d) => {
    if (!isRec(d)) return null;
    const pct = readNum(d.pct, PCT_MAX);
    if (!pct || (d.alsoMin !== undefined && d.alsoMin !== true)) return null;
    return { pct, ...(d.alsoMin ? { alsoMin: true as const } : {}) };
  });
  const third = optPart(raw.third, readThird);
  const notes = optPart(raw.notes, (n) => (Array.isArray(n) && n.length > 0 && n.every((x) => NOTES.includes(x as Note)) && new Set(n).size === n.length ? (n as Note[]) : null));
  if (!linked || !discount || !third || !notes) return null;
  return { ...linked, ...(discount.part ? { discount: discount.part } : {}), ...(third.part ? { third: third.part } : {}), ...(notes.part ? { notes: notes.part } : {}) };
}

function readPrice(raw: unknown, kind: FeeKindId): Price | null {
  if (!isRec(raw)) return null;
  const shape = FEE_SHAPES[kind];
  if (raw.form === "free") return { form: "free" };
  if (!shape.forms.includes(raw.form as never)) return null;
  const fields = shape.fields[raw.form as Exclude<FormId, "free">] ?? [];
  switch (raw.form) {
    case "action": {
      const rate = readNum(raw.rate, PCT_MAX), parts = readActionParts(raw, fields), more = readOnAction(raw);
      return rate && parts && more ? { form: "action", rate, ...parts, ...more } : null;
    }
    case "perUnit": {
      const amount = readNum(raw.amount, SUM_MAX), parts = readActionParts(raw, fields), more = readOnAction(raw);
      return amount && parts && more ? { form: "perUnit", amount, ...parts, ...more } : null;
    }
    case "held": {
      const rate = readNum(raw.rate, PCT_MAX), min = optNum(raw.min, SUM_MAX), max = optNum(raw.max, SUM_MAX), more = readLinked(raw);
      if (!rate || !min.ok || !max.ok || !more || !isMonths(raw.per) || !isMonths(raw.every)) return null;
      return { form: "held", rate, per: raw.per, every: raw.every, ...(min.n ? { min: min.n } : {}), ...(max.n ? { max: max.n } : {}), ...more };
    }
    case "sum": {
      const amount = readNum(raw.amount, SUM_MAX), more = readLinked(raw);
      return amount && more && isMonths(raw.every) ? { form: "sum", amount, every: raw.every, ...more } : null;
    }
    case "perAction": {
      const amount = readNum(raw.amount, SUM_MAX), currency = readCurrency(raw.currency), more = readOnAction(raw);
      if (!amount || !currency || !more || (currency.currency && !fields.includes("currency"))) return null;
      return { form: "perAction", amount, ...currency, ...more };
    }
    default:
      return null;
  }
}

const currencyIndex: Record<string, true> = Object.fromEntries(BOUND_CURRENCIES.map((c) => [c, true]));

/**
 * What keeps price `k` of a list from the order F-110 reads, or null: a price before the last that has no month it ends (`missing`), a month
 * not after the one the price before it ends (`after`, that month), or a last price that has an end (`end`).
 */
export function stageFault(stages: readonly { until?: MonthKey }[], k: number): { kind: "missing" } | { kind: "after"; month: MonthKey } | { kind: "end" } | null {
  const s = stages[k]!;
  if (k === stages.length - 1) return s.until === undefined ? null : { kind: "end" };
  if (s.until === undefined || !MONTH.test(s.until)) return { kind: "missing" };
  const before = k > 0 ? stages[k - 1]!.until : undefined;
  return before !== undefined && s.until <= before ? { kind: "after", month: before } : null;
}

/**
 * The months price `k` of a list can end in and leave `stageFault` nothing to say of it or of the price after it: after the month the price
 * before it ends, and before the month the price after it ends where that price is not the last (the last has no end). A month picker
 * offers only these.
 */
export function untilRange(stages: readonly { until?: MonthKey }[], k: number): { earliest?: MonthKey; latest?: MonthKey } {
  const before = k > 0 ? stages[k - 1]!.until : undefined;
  const after = k + 1 < stages.length - 1 ? stages[k + 1]!.until : undefined;
  const shift = (key: MonthKey, by: number) => {
    const c = monthOf(key);
    const t = c.y * 12 + c.m - 1 + by;
    return monthKey({ y: Math.floor(t / 12), m: (t % 12) + 1 });
  };
  return {
    ...(before !== undefined && MONTH.test(before) ? { earliest: shift(before, 1) } : {}),
    ...(after !== undefined && MONTH.test(after) ? { latest: shift(after, -1) } : {}),
  };
}

/** Whether a fee's prices are what F-110 reads: at least one, each but the last ending, the ends in order, the last with none. */
export function stagesInOrder(stages: readonly Stage[]): boolean {
  return stages.length > 0 && stages.every((_, k) => stageFault(stages, k) === null);
}

/**
 * Whether every price of a fee (or a case) can be read (F-110): the screen leaves a fee whose prices are not in order out of the reading
 * until they are. A fee with cases is in order where every case is.
 */
export const feeInOrder = (f: Fee | Priced): boolean => ("cases" in f && f.cases ? f.cases.every(feeInOrder) : stagesInOrder(f.stages!) && (!f.sale || stagesInOrder(f.sale)));

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

/** A fee's or a case's prices, and its sale's where it prices a sale apart; null where anything in them is not prices. */
function readPriced(raw: Rec, kind: FeeKindId): Priced | null {
  const stages = readStages(raw.stages, kind);
  if (!stages) return null;
  if (raw.sale === undefined) return { stages };
  // a fee charged on one side alone has no separate sale price, and a fee whose shape prices no sale apart has none either
  if (ONE_SIDE[kind] || !FEE_SHAPES[kind].saleApart) return null;
  const sale = readStages(raw.sale, kind);
  return sale ? { stages, sale } : null;
}

const CASES_MAX = 40;
const TOPS_MAX = 12;
const VALUES_MAX = 20;
const PICKS_MAX = 12;

/** A value the person named for what is bought or held: its name, where it is bought, and its currency (a code, or null). */
function readOwnPlace(raw: unknown): OwnPlace | null {
  if (!isRec(raw) || !str(raw.name, NAME_MAX) || raw.name.trim() === "" || Object.hasOwn(WHAT_VALUES, raw.name)) return null;
  if ((raw.place !== "israel" && raw.place !== "abroad") || !(raw.currency === null || (typeof raw.currency === "string" && CURRENCY.test(raw.currency)))) return null;
  return { name: raw.name, place: raw.place, currency: raw.currency };
}

/** A thing a fee of `kind` may change by (`byKindsFor`), with its own fields; null where it is anything else. */
function readBy(raw: unknown, kind: FeeKindId): By | null {
  if (!isRec(raw) || typeof raw.kind !== "string" || !byKindsFor(kind).includes(raw.kind as ByKind)) return null;
  const k = raw.kind as ByKind;
  if (isRangeKind(k)) {
    if (!RANGE_UNITS[k].includes(raw.unit as RangeUnit) || !Array.isArray(raw.tops) || raw.tops.length === 0 || raw.tops.length > TOPS_MAX) return null;
    const tops: Num[] = [];
    for (const t of raw.tops) {
      const n = readNum(t, SUM_MAX);
      // the tops are in order, each above the one before and above nothing: the steps leave no gap and none is empty
      if (!n || n.blank || n.v <= 0 || (tops.length > 0 && n.v <= tops.at(-1)!.v)) return null;
      tops.push(n);
    }
    return { kind: k, unit: raw.unit as RangeUnit, tops };
  }
  if (k === "own") return str(raw.label, NAME_MAX) && raw.label.trim() !== "" ? { kind: "own", label: raw.label } : null;
  if (k === "what" || k === "held") {
    if (raw.own === undefined) return { kind: k };
    if (!Array.isArray(raw.own) || raw.own.length === 0 || raw.own.length > VALUES_MAX) return null;
    const own: OwnPlace[] = [];
    for (const o of raw.own) {
      const x = readOwnPlace(o);
      if (!x || own.some((y) => y.name === x.name)) return null;
      own.push(x);
    }
    return { kind: k, own };
  }
  return { kind: k };
}

/**
 * What a case says of a thing: any value; named values, each the site's id or the person's words (for what is bought or held, a value
 * the thing names with its place); or a step of a range. Null where it is not one of them, or names a value twice.
 */
function readWhen(raw: unknown, by: By): When | null {
  if (raw === "any") return "any";
  if (isRange(by)) return typeof raw === "number" && Number.isInteger(raw) && raw >= 0 && raw <= by.tops.length ? raw : null;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > VALUES_MAX || new Set(raw).size !== raw.length) return null;
  const ok = (v: unknown): v is string => {
    if (!str(v, NAME_MAX) || v.trim() === "") return false;
    if (by.kind === "what" || by.kind === "held") return LIST_IDS[by.kind].includes(v) || !!by.own?.some((o) => o.name === v);
    return true;
  };
  return raw.every(ok) ? (raw as string[]) : null;
}

/** A case of a fee with things `by`: its id, a value per thing, the person's track mark where the fee changes by track, and its prices. */
function readCase(raw: unknown, kind: FeeKindId, by: readonly By[]): Case | null {
  if (!isRec(raw) || typeof raw.id !== "string" || !ID.test(raw.id) || !Array.isArray(raw.when) || raw.when.length !== by.length) return null;
  const when: When[] = [];
  for (let t = 0; t < by.length; t++) {
    const w = readWhen(raw.when[t], by[t]!);
    if (w === null) return null;
    when.push(w);
  }
  if (raw.mine !== undefined && !(raw.mine === true && by.some((b) => b.kind === "track"))) return null;
  const priced = readPriced(raw, kind);
  if (!priced) return null;
  return { id: raw.id, when, ...(raw.mine ? { mine: true as const } : {}), ...priced };
}

function readFee(raw: unknown): Fee | null {
  if (!isRec(raw) || typeof raw.id !== "string" || !ID.test(raw.id) || !isFeeKindId(raw.kind)) return null;
  const kind = raw.kind;
  let name: { name?: string } = {};
  if (raw.name !== undefined) {
    if (kind !== "own" || !str(raw.name, NAME_MAX)) return null;
    name = { name: raw.name };
  }
  if (raw.by === undefined) {
    if (raw.cases !== undefined) return null;
    const priced = readPriced(raw, kind);
    return priced ? { id: raw.id, kind, ...name, ...priced } : null;
  }
  // a fee with cases keeps its prices in them alone
  if (raw.stages !== undefined || raw.sale !== undefined) return null;
  if (!Array.isArray(raw.by) || raw.by.length === 0 || raw.by.length > BY_MAX || !Array.isArray(raw.cases) || raw.cases.length === 0 || raw.cases.length > CASES_MAX) return null;
  const by: By[] = [];
  for (const b of raw.by) {
    const x = readBy(b, kind);
    // what is bought and what is held are one pick: a fee changes by one of them, and by each other thing once
    if (!x || by.some((y) => pickKey(y) === pickKey(x))) return null;
    by.push(x);
  }
  const cases: Case[] = [];
  for (const c of raw.cases) {
    const x = readCase(c, kind, by);
    if (!x || cases.some((y) => y.id === x.id)) return null;
    cases.push(x);
  }
  return { id: raw.id, kind, ...name, by, cases };
}

/** The reading's picks: each a thing's key and a value, no key twice; a pick of what is bought with its place and currency, both or neither. */
function readPicks(raw: unknown): ReadPick[] | null {
  if (!Array.isArray(raw) || raw.length > PICKS_MAX) return null;
  const out: ReadPick[] = [];
  for (const p of raw) {
    if (!isRec(p) || !str(p.by, NAME_MAX + 4) || !str(p.is, NAME_MAX + 4) || p.is.trim() === "" || out.some((x) => x.by === p.by)) return null;
    if (!PICK_KEYS.includes(p.by) && !(p.by.startsWith("own:") && p.by.length > 4)) return null;
    if (p.place === undefined && p.currency === undefined) {
      out.push({ by: p.by, is: p.is });
      continue;
    }
    if (p.by !== "what" || (p.place !== "israel" && p.place !== "abroad") || typeof p.currency !== "string" || !CURRENCY.test(p.currency)) return null;
    out.push({ by: p.by, is: p.is, place: p.place, currency: p.currency });
  }
  return out;
}

const PICK_KEYS: readonly string[] = ["what", "channel", "track", "currency", "portfolioSize", "volume", "count"];

/**
 * What a deal saved before cases said it held, as the reading's pick of what is bought (F-114): a fund on the Tel Aviv exchange is a
 * security there; one abroad in dollars or euros is one in the United States or in Europe, and in any other currency one elsewhere. The
 * pick carries the place and the currency the deal said, so a fund on the exchange in dollars still puts a conversion on a purchase and
 * one abroad in shekels does not, as they did before cases (F-111's `foreign`).
 */
function heldPick(raw: unknown): ReadPick | null {
  if (!isRec(raw)) return null;
  if ((raw.place !== "israel" && raw.place !== "abroad") || typeof raw.currency !== "string" || !CURRENCY.test(raw.currency) || (raw.payout !== "accumulating" && raw.payout !== "distributing")) return null;
  const is = raw.place === "israel" ? "tase" : raw.currency === "USD" ? "us" : raw.currency === "EUR" ? "europe" : "world";
  return { by: "what", is, place: raw.place, currency: raw.currency };
}

/**
 * A deal from the device, a file or a link, every field checked; null where anything in it is not what a deal holds. A deal saved before
 * cases opens with every fee and price as it was, what it held becoming the reading's pick of what is bought.
 */
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
  if (raw.readFor !== undefined) {
    const picks = readPicks(raw.readFor);
    if (!picks) return null;
    if (picks.length) deal.readFor = picks;
  }
  if (raw.start !== undefined) {
    if (typeof raw.start !== "string" || !MONTH.test(raw.start)) return null;
    deal.start = raw.start;
  }
  if (raw.provider !== undefined) {
    if (raw.provider !== "bank" && raw.provider !== "non-bank") return null;
    deal.provider = raw.provider;
  }
  // a deal saved before cases said what it held: it opens with that as the pick of what is bought, where it picks none yet
  if (raw.held !== undefined) {
    const pick = heldPick(raw.held);
    if (!pick || !holdsFunds(kind)) return null;
    if (!deal.readFor?.some((p) => p.by === "what")) deal.readFor = [...(deal.readFor ?? []), pick];
  }
  if (raw.template !== undefined) {
    if (!isRec(raw.template) || !str(raw.template.id, 120) || !str(raw.template.name, 200)) return null;
    if (raw.template.feesKept !== undefined && raw.template.feesKept !== true) return null;
    deal.template = { id: raw.template.id, name: raw.template.name, ...(raw.template.feesKept ? { feesKept: true as const } : {}) };
  }
  if (raw.saved !== undefined) {
    if (typeof raw.saved !== "string" || !DATE.test(raw.saved)) return null;
    deal.saved = raw.saved;
  }
  return deal;
}
