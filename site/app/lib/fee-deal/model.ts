// The deal as the device keeps it (method §10.6): one product's fees as the person typed them or a template filled them, each fee
// with its prices over time, or, for a fee whose price changes by things (F-114), its cases, each with its own prices over time; and the
// reading's picks. Rates are typed in percent; `engineDeal` (to-engine.ts) is the one place they become the engine's fractions. `readDeal`
// checks every field of a deal from the device, a file or a link, and drops whatever is not a deal. No engine at run time: the side
// stores read this file on every page.
import { productIds, type ProductId } from "@finance-tool/schema";
import type { CalendarMonth } from "@finance-tool/engine";
import { newId } from "../ids";
import { byAmount, byRate, formOnAction, KEY_FORMS, type PartKey } from "./offers/capabilities";
import { FIGURE_IDS, FIGURES } from "./offers/figures";
import { holdsFunds, isFeeKindId, WHAT_VALUES, type FeeKindId, type FormId, type Place } from "./shapes";
import { capacity, fieldsOf, PART_FIELDS, pricesSaleApart, type ChargedForm, type FieldId, type PartFieldId } from "./offers/capacity";
import { BY_MAX, CONDITIONS, conditionsFor, isPlaceKind, isRangeKind, LIST_IDS, PICK_KEYS, RANGE_UNITS, thingKey, type ByKind, type PlaceKind, type RangeKind, type RangeUnit, type ValuesOf } from "./offers/conditions";

export * from "./core";
import { BOUND_CURRENCIES, MONTHS, NOTES, type BoundCurrency, type Discount, type Flat, type MonthKey, type Months, type Note, type Num, type Price, type Priced, type Side, type Sourced, type Stage, type Strength, type Third } from "./core";

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
 * (`tops`, in order, each above the one before) in a unit (`unit`); its cases name steps. Each thing's shape follows how the conditions
 * registry names its values (`ValuesOf`), so a new thing has one.
 */
export type By = { [K in ByKind]: ByOf<K> }[ByKind];
type ByOf<K extends ByKind> =
  ValuesOf<K> extends { kind: "range" } ? { kind: K; unit: RangeUnit; tops: Num[] }
  : ValuesOf<K> extends { kind: "own" } ? { kind: K; label: string }
  : ValuesOf<K> extends { places: true } ? { kind: K; own?: OwnPlace[] }
  : { kind: K };

/** A range thing of a fee. */
export type RangeBy = Extract<By, { tops: Num[] }>;
export const isRange = (b: By): b is RangeBy => isRangeKind(b.kind);

/** A thing whose values say where they are bought and their currency: what is bought or held, with the values the person named (`own`). */
export type PlaceBy = Extract<By, { kind: PlaceKind }>;
export const namesPlaces = (b: By): b is PlaceBy => isPlaceKind(b.kind);

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

/** The key a thing is picked by in the reading (`thingKey`): what it is picked as (what is held as what is bought), or a condition's name after `own:`. */
export const pickKey = (b: By): string => thingKey(b.kind, "label" in b ? b.label : undefined);

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

/** The figures of a price (`Num`s): its rate or sum, its bounds, its cap, its flat price, and its parts' figures (a discount, a third party's, a refund). */
const figuresOf = (p: Price): (Num | undefined)[] => FIGURE_IDS.map((f) => FIGURES[f].get(p));

/** Whether any figure of a price still carries a template's source: what the template filled in it stands as filled. */
export const anySourced = (p: Price): boolean => figuresOf(p).some((n) => !!n?.src);

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
export const mainFigure = (p: Price): Num | null => (byRate(p) ? p.rate : byAmount(p) ? p.amount : null);

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

/** A new fee of a kind: one price that holds throughout, of the form given (the first its product's fee is offered in), else its kind's usual one. */
export function newFee(kind: FeeKindId, name?: string, form: FormId = capacity(kind).usual): SlimFee {
  return { id: newFeeId(), kind, ...(kind === "own" && name ? { name: name.slice(0, NAME_MAX) } : {}), stages: [{ price: blankPrice(form) }] };
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
  for (const f of fees) for (const b of f.by ?? []) if (namesPlaces(b) && b.own) for (const o of b.own) if (o.name === value) return { place: o.place, currency: o.currency };
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

/** A flat price: its two figures (each may still be blank); null where it is anything else. */
function readFlat(raw: unknown): Flat | null {
  if (!isRec(raw)) return null;
  const amount = readNum(raw.amount, SUM_MAX), upTo = readNum(raw.upTo, SUM_MAX);
  return amount && upTo ? { amount, upTo } : null;
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

/** A figure given beside a price's own (a bound, a percent maximum): never blank; null where it is anything else. */
const given = (max: number) => (raw: unknown): Num | null => {
  const n = readNum(raw, max);
  return n && !n.blank ? n : null;
};

/** A discount (F-116): its share, and whether it is off the minimum too; null where it is anything else. */
function readDiscount(raw: unknown): Discount | null {
  if (!isRec(raw)) return null;
  const pct = readNum(raw.pct, PCT_MAX);
  if (!pct || (raw.alsoMin !== undefined && raw.alsoMin !== true)) return null;
  return { pct, ...(raw.alsoMin ? { alsoMin: true as const } : {}) };
}

/**
 * How each key of a price beside its form's own figure is read, in the order a price keeps them: `undefined` where it is left unsaid (a
 * shekel; months a bound is printed per where the price has no bound), null where it is there and is not what it holds. Typed by the
 * parts' keys (capabilities.ts), so a new part's key cannot go unread.
 */
const READ_KEY: Readonly<Record<PartKey | "currency" | "boundsEvery", (raw: unknown, read: Readonly<Record<string, unknown>>) => unknown>> = {
  min: given(SUM_MAX),
  max: given(SUM_MAX),
  cap: given(PCT_MAX),
  flat: readFlat,
  perSecurity: given(SUM_MAX),
  currency: (raw) => {
    const c = readCurrency(raw);
    return c === false ? null : c.currency;
  },
  // bounds printed per month (F-14) are the only period a bound is printed in, and say nothing on a price with no bound
  boundsEvery: (raw, read) => (raw !== 1 ? null : read.min || read.max || read.perSecurity ? 1 : undefined),
  offset: (o) => (isRec(o) && isFeeKindId(o.kind) && Object.keys(o).length === 1 ? { kind: o.kind } : null),
  refund: (n) => readNum(n, SUM_MAX),
  discount: readDiscount,
  third: readThird,
  notes: (n) => (Array.isArray(n) && n.length > 0 && n.every((x) => NOTES.includes(x as Note)) && new Set(n).size === n.length ? n : null),
  inTrade: (raw) => (raw === true ? true : null),
};

/** Where the currency and the months a bound is printed per have a place: a price on an action's sums, a share of what is held's bounds. */
const OWN_KEY_FORMS: Readonly<Record<"currency" | "boundsEvery", (form: FormId) => boolean>> = { currency: formOnAction, boundsEvery: (form) => form === "held" };
const keyPlaced = (key: keyof typeof READ_KEY, form: FormId): boolean => (key === "currency" || key === "boundsEvery" ? OWN_KEY_FORMS[key](form) : KEY_FORMS[key](form));

/** Each form's own figure and periods: a share's rate, a sum's amount, a held share's months; null where they are not given. */
const READ_FORM: Readonly<Record<ChargedForm, (raw: Rec) => Rec | null>> = {
  action: (raw) => figureOf("rate", readNum(raw.rate, PCT_MAX)),
  perUnit: (raw) => figureOf("amount", readNum(raw.amount, SUM_MAX)),
  perAction: (raw) => figureOf("amount", readNum(raw.amount, SUM_MAX)),
  held: (raw) => (isMonths(raw.per) && isMonths(raw.every) ? withMain(figureOf("rate", readNum(raw.rate, PCT_MAX)), { per: raw.per, every: raw.every }) : null),
  sum: (raw) => (isMonths(raw.every) ? withMain(figureOf("amount", readNum(raw.amount, SUM_MAX)), { every: raw.every }) : null),
};
const figureOf = (key: "rate" | "amount", n: Num | null): Rec | null => (n ? { [key]: n } : null);
const withMain = (main: Rec | null, more: Rec): Rec | null => (main ? { ...main, ...more } : null);

/**
 * The fields a price of a form was read with before its fee's capacity was the reader's limit, beyond what the capacity lists: bounds and a
 * currency on a share of an action or a sum per unit, bounds on a share of what is held. A deal saved with them (a spread's minimum, a
 * held insurance premium's) still opens as it was; nothing puts them on a fee whose capacity does not list them now.
 */
const READ_BEYOND: Partial<Record<FormId, readonly FieldId[]>> = { action: ["min", "max", "currency"], perUnit: ["min", "max", "currency"], held: ["min", "max"] };

/**
 * A price of a fee of `kind`, read against its kind's capacity, which no product narrows: its form's own figure and periods, then each key
 * that has a place in its form (`KEY_FORMS`), read as `READ_KEY` says. A key with a place in the form whose field the fee's form does not
 * list (`fieldsOf`, or `READ_BEYOND`) is not one of its prices; a key with no place in the form is left out, as it always was.
 */
function readPrice(raw: unknown, kind: FeeKindId): Price | null {
  if (!isRec(raw)) return null;
  if (raw.form === "free") return { form: "free" };
  if (!capacity(kind).forms.includes(raw.form as never)) return null;
  const form = raw.form as ChargedForm;
  const fields = [...fieldsOf(kind, form), ...(READ_BEYOND[form] ?? [])];
  const own = READ_FORM[form](raw);
  if (!own) return null;
  const out: Rec = { form, ...own };
  for (const key of Object.keys(READ_KEY) as (keyof typeof READ_KEY)[]) {
    if (raw[key] === undefined || !keyPlaced(key, form)) continue;
    const v = READ_KEY[key](raw[key], out);
    if (v === null) return null;
    if (v === undefined) continue;
    if (isPartField(key) && !fields.includes(key)) return null;
    out[key] = v;
  }
  return out as Price;
}

const isPartField = (key: string): key is PartFieldId => (PART_FIELDS as readonly string[]).includes(key);

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
  if (!pricesSaleApart(kind)) return null;
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

/** A thing a fee of `kind` may change by (`conditionsFor`), with its own fields; null where it is anything else. */
function readBy(raw: unknown, kind: FeeKindId): By | null {
  if (!isRec(raw) || typeof raw.kind !== "string" || !conditionsFor(kind).includes(raw.kind as ByKind)) return null;
  const k = raw.kind as ByKind;
  switch (CONDITIONS[k].values.kind) {
    case "range": {
      const r = k as RangeKind;
      if (!RANGE_UNITS[r].includes(raw.unit as RangeUnit) || !Array.isArray(raw.tops) || raw.tops.length === 0 || raw.tops.length > TOPS_MAX) return null;
      const tops: Num[] = [];
      for (const t of raw.tops) {
        const n = readNum(t, SUM_MAX);
        // the tops are in order, each above the one before and above nothing: the steps leave no gap and none is empty
        if (!n || n.blank || n.v <= 0 || (tops.length > 0 && n.v <= tops.at(-1)!.v)) return null;
        tops.push(n);
      }
      return { kind: r, unit: raw.unit as RangeUnit, tops };
    }
    case "own":
      return str(raw.label, NAME_MAX) && raw.label.trim() !== "" ? { kind: "own", label: raw.label } : null;
    case "track":
      return { kind: "track" };
    case "list": {
      if (!isPlaceKind(k) || raw.own === undefined) return { kind: k } as By;
      if (!Array.isArray(raw.own) || raw.own.length === 0 || raw.own.length > VALUES_MAX) return null;
      const own: OwnPlace[] = [];
      for (const o of raw.own) {
        const x = readOwnPlace(o);
        if (!x || own.some((y) => y.name === x.name)) return null;
        own.push(x);
      }
      return { kind: k, own };
    }
  }
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
    if (namesPlaces(by)) return LIST_IDS[by.kind].includes(v) || !!by.own?.some((o) => o.name === v);
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
    // a pick of a thing the page no longer has, or not yet, is left out: the deal opens without it
    if (!PICK_KEYS.includes(p.by) && !(p.by.startsWith("own:") && p.by.length > 4)) continue;
    if (p.place === undefined && p.currency === undefined) {
      out.push({ by: p.by, is: p.is });
      continue;
    }
    if (p.by !== "what" || (p.place !== "israel" && p.place !== "abroad") || typeof p.currency !== "string" || !CURRENCY.test(p.currency)) return null;
    out.push({ by: p.by, is: p.is, place: p.place, currency: p.currency });
  }
  return out;
}


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
  // a deal saved with a start month (the field was removed on 2026-11-14) opens without it: the reading is for the device's month
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
