// The changes the fee page makes to a deal, each a pure function from a deal to the next: the screen calls them and saves what they
// return. A figure the person types becomes theirs (`retyped`): it loses a template's source unless it is the same number. A price whose
// terms the person changes (its months, its bounds' currency, its form) becomes theirs whole (`owned`): the source states another price.
// A fee whose price changes by things (F-114) keeps its prices in its cases: the edits of prices take the case they edit (`caseId`; a fee
// with cases is edited in its first case where none is named), and the case edits below make, copy and remove cases.
import {
  blankFigure,
  blankPrice,
  hasCases,
  isRange,
  mainFigure,
  newCaseId,
  newFee,
  pickKey,
  pricedOf,
  pricesOn,
  retyped,
  sameContent,
  typed,
  type BoundCurrency,
  type By,
  type Case,
  type CasesFee,
  type Fee,
  type FeeDeal,
  type MonthKey,
  type Months,
  type Note,
  type Num,
  type OwnPlace,
  type Price,
  type Priced,
  type ReadPick,
  type Side,
  type SlimFee,
  type Stage,
  type ThirdPrice,
  type When,
} from "./model";
import type { DealKind } from "./kinds";
import { BY_MAX, byKindsFor, FEE_SHAPES, isRangeKind, kindHas, LIST_IDS, RANGE_UNITS, WHAT_VALUES, type ByKind, type FeeKindId, type FormId, type RangeKind, type RangeUnit } from "./shapes";

export type { Side } from "./model";

/** The deal with one fee replaced by `fn` of it. */
export const updateFee = (deal: FeeDeal, feeId: string, fn: (f: Fee) => Fee): FeeDeal => ({ ...deal, fees: deal.fees.map((f) => (f.id === feeId ? fn(f) : f)) });

/** The deal with a new fee of a kind at the end. */
export function addFee(deal: FeeDeal, kind: FeeKindId): { deal: FeeDeal; fee: Fee } {
  const fee = newFee(kind);
  return { deal: { ...deal, fees: [...deal.fees, fee] }, fee };
}

export const removeFee = (deal: FeeDeal, feeId: string): FeeDeal => ({ ...deal, fees: deal.fees.filter((f) => f.id !== feeId) });

/**
 * A deal of another kind: a fee the new kind does not have (`kindHas`), or may not charge by rule (`barred`), leaves it, and the fees of
 * kinds both have stay as typed, a fee of the person's own among them. Its template goes, with the provider kind the template gave: a
 * template belongs to one kind (a house's price list to the securities account, a track to its product). The reading's picks stay. The
 * same kind leaves the deal as it is.
 */
export function setKind(deal: FeeDeal, kind: DealKind, barred: readonly FeeKindId[] = []): FeeDeal {
  if (deal.kind === kind.id) return deal;
  const { template: _template, provider: _provider, ...rest } = deal;
  const fees = deal.fees.filter((f) => kindHas(kind.id, kind.bases, f.kind) && !barred.includes(f.kind));
  return { ...rest, kind: kind.id, fees };
}

export const setName = (deal: FeeDeal, name: string): FeeDeal => ({ ...deal, name });

export function setStart(deal: FeeDeal, start: MonthKey | null): FeeDeal {
  const { start: _start, ...rest } = deal;
  return start === null ? rest : { ...rest, start };
}

// ---------------------------------------------------------------- the reading's picks (F-114)

/** The deal read for `is` of the thing keyed `by` (`pickKey`); `null` takes the pick away, and the thing starts as F-114 says. */
export function setPick(deal: FeeDeal, by: string, is: string | null): FeeDeal {
  const { readFor: _r, ...rest } = deal;
  const picks: ReadPick[] = [...(deal.readFor ?? []).filter((p) => p.by !== by), ...(is === null ? [] : [{ by, is }])];
  return picks.length ? { ...rest, readFor: picks } : rest;
}

// ---------------------------------------------------------------- a price's figures

/**
 * A figure of a price the screen edits: its rate, its bounds, its sum (a sum per unit's among them), its percent maximum (`cap`), its
 * flat price's two figures (`flat`, the price; `upTo`, the sum it holds up to), a discount's share (`discount`, F-116), a third party's
 * rate or sum and bounds (`third`, `thirdMin`, `thirdMax`, F-117), and a refund (`refund`, §10.6's stated parts).
 */
export type Figure = "rate" | "min" | "max" | "amount" | "cap" | "flat" | "upTo" | "discount" | "third" | "thirdMin" | "thirdMax" | "refund";

/** A price that may have bounds, a cap and a flat price: a share of an action or a sum per unit. */
type Bounded = Extract<Price, { form: "action" | "perUnit" }>;
const isBounded = (p: Price): p is Bounded => p.form === "action" || p.form === "perUnit";
/** A price on an action, which may carry a discount, a third party's fee and notes (F-116, F-117 and §10.6's stated parts). */
type OnAction = Extract<Price, { form: "action" | "perUnit" | "perAction" }>;
const isOnAction = (p: Price): p is OnAction => p.form === "action" || p.form === "perUnit" || p.form === "perAction";

/** A price's main figure's key: the rate of a share, the sum of the rest. */
const mainKey = (p: Price): "rate" | "amount" | null => (p.form === "action" || p.form === "held" ? "rate" : p.form === "free" ? null : "amount");

/** A third party's price with one figure set, or a bound emptied (`n` undefined); its rate or sum emptied is blank again. */
function setThirdFigure(t: ThirdPrice, figure: "third" | "thirdMin" | "thirdMax", n: Num | undefined): ThirdPrice {
  if (figure === "third") return t.form === "action" ? { ...t, rate: n ?? blankFigure() } : { ...t, amount: n ?? blankFigure() };
  if (t.form === "perAction") return t;
  const key = figure === "thirdMin" ? "min" : "max";
  const next = { ...t, [key]: n };
  if (n === undefined) delete next[key];
  return next;
}

/**
 * A price with one figure set to `n`, or emptied (`n` undefined): an emptied bound or cap is taken away, an emptied rate, sum, figure of a
 * flat price, discount's share, third party's rate or sum, or refund is blank again (`blankFigure`). A figure the price's form has no place
 * for, or a part's figure where the price has not that part, leaves it as it is.
 */
function setFigure(p: Price, figure: Figure, n: Num | undefined): Price {
  if (figure === "rate" || figure === "amount") return mainKey(p) === figure ? ({ ...p, [figure]: n ?? blankFigure() } as Price) : p;
  if (figure === "refund") return p.form === "free" || p.refund === undefined ? p : ({ ...p, refund: n ?? blankFigure() } as Price);
  if (figure === "discount") return isOnAction(p) && p.discount ? { ...p, discount: { ...p.discount, pct: n ?? blankFigure() } } : p;
  if (figure === "third" || figure === "thirdMin" || figure === "thirdMax") return isOnAction(p) && p.third?.price ? { ...p, third: { ...p.third, price: setThirdFigure(p.third.price, figure, n) } } : p;
  if (figure === "min" || figure === "max") {
    if (!isBounded(p) && p.form !== "held") return p;
    const next = { ...p, [figure]: n };
    if (n === undefined) delete next[figure];
    return next;
  }
  if (figure === "cap") {
    // a share's, a sum per unit's or a sum per action's percent maximum
    if (!isBounded(p) && p.form !== "perAction") return p;
    const { cap: _c, ...rest } = p;
    return (n === undefined ? rest : { ...rest, cap: n }) as Price;
  }
  if (!isBounded(p)) return p;
  if (!p.flat) return p;
  return { ...p, flat: { ...p.flat, [figure === "flat" ? "amount" : "upTo"]: n ?? blankFigure() } };
}

/** A price with one figure typed, or emptied (`null`): an emptied bound or cap is taken away, an emptied rate, sum or part's figure is blank again. */
export function withFigure(p: Price, figure: Figure, n: number | null): Price {
  const old = figureOf(p, figure);
  return setFigure(p, figure, n === null ? undefined : old && !old.blank ? retyped(old, n) : typed(n));
}

/** One figure of a price as it stands, with its source; none where the price has no such figure. */
export function figureOf(p: Price, figure: Figure): Num | undefined {
  if (figure === "rate" || figure === "amount") return mainKey(p) === figure ? (mainFigure(p) ?? undefined) : undefined;
  if (figure === "refund") return p.form === "free" ? undefined : p.refund;
  if (figure === "discount") return isOnAction(p) ? p.discount?.pct : undefined;
  if (figure === "third" || figure === "thirdMin" || figure === "thirdMax") {
    const t = isOnAction(p) ? p.third?.price : undefined;
    if (!t) return undefined;
    if (figure === "third") return t.form === "action" ? t.rate : t.amount;
    return t.form === "perAction" ? undefined : figure === "thirdMin" ? t.min : t.max;
  }
  if (figure === "min" || figure === "max") return isBounded(p) || p.form === "held" ? p[figure] : undefined;
  if (figure === "cap") return isBounded(p) || p.form === "perAction" ? p.cap : undefined;
  if (!isBounded(p)) return undefined;
  return figure === "flat" ? p.flat?.amount : p.flat?.upTo;
}

/**
 * A price with one figure put back as it stood (`figureOf`), its source with it: none takes a bound or a cap away and leaves a rate, a sum
 * or a part's figure blank. A price of another form than the figure's is left as it is.
 */
export const figureBack = (p: Price, figure: Figure, n: Num | undefined): Price => setFigure(p, figure, n);

/**
 * A price the person changed the terms of is theirs: every figure in it loses a template's source, which states the price as it was (the
 * same percent for another period, or the same sum in another currency, is a price the source does not give). A blank figure stays blank.
 */
function owned(p: Price): Price {
  const own = (n: Num): Num => (n.blank ? n : typed(n.v));
  const opt = <K extends "min" | "max" | "cap">(k: K, n: Num | undefined) => (n ? { [k]: own(n) } : {});
  const refund = p.form !== "free" && p.refund ? { refund: own(p.refund) } : {};
  const parts = (x: OnAction) => ({
    ...(x.discount ? { discount: { ...x.discount, pct: own(x.discount.pct) } } : {}),
    ...(x.third?.price ? { third: { ...x.third, price: ownThird(x.third.price, own) } } : {}),
  });
  switch (p.form) {
    case "action":
    case "perUnit": {
      const main = p.form === "action" ? { rate: own(p.rate) } : { amount: own(p.amount) };
      return { ...p, ...main, ...opt("min", p.min), ...opt("max", p.max), ...opt("cap", p.cap), ...(p.flat ? { flat: { amount: own(p.flat.amount), upTo: own(p.flat.upTo) } } : {}), ...parts(p), ...refund } as Price;
    }
    case "held":
      return { ...p, rate: own(p.rate), ...opt("min", p.min), ...opt("max", p.max), ...refund };
    case "sum":
      return { ...p, amount: own(p.amount), ...refund };
    case "perAction":
      return { ...p, amount: own(p.amount), ...opt("cap", p.cap), ...parts(p), ...refund };
    default:
      return p;
  }
}

const ownThird = (t: ThirdPrice, own: (n: Num) => Num): ThirdPrice =>
  t.form === "perAction" ? { ...t, amount: own(t.amount) } : t.form === "action" ? { ...t, rate: own(t.rate), ...(t.min ? { min: own(t.min) } : {}), ...(t.max ? { max: own(t.max) } : {}) } : { ...t, amount: own(t.amount), ...(t.min ? { min: own(t.min) } : {}), ...(t.max ? { max: own(t.max) } : {}) };

/** The parts a price keeps in another form: the parts on an action where the new form is on an action, and an offset and a refund always. */
function partsInto(p: Price, next: Price): Price {
  if (p.form === "free" || next.form === "free") return next;
  const linked = { ...(p.offset ? { offset: p.offset } : {}), ...(p.refund ? { refund: p.refund } : {}) };
  const onAction = isOnAction(p) && isOnAction(next) ? { ...(p.currency ? { currency: p.currency } : {}), ...(p.cap ? { cap: p.cap } : {}), ...(p.discount ? { discount: p.discount } : {}), ...(p.third ? { third: p.third } : {}), ...(p.notes ? { notes: p.notes } : {}) } : {};
  return { ...next, ...linked, ...onAction } as Price;
}

/**
 * A price in another form: the rate or the sum typed so far carries over where the new form has the same kind of figure (a share to a
 * share, a sum per period or per action to the other), as the person's own figure (`owned`); between a share of an action and a sum per
 * unit, whose figures differ in kind, the bounds, the cap, the flat price and their currency carry over instead, since they price the
 * action the same way in both. Between any two forms on an action the currency of the sums and the percent maximum carry over (a sum per
 * unit in dollars under 2% becomes a sum per action in dollars under 2%), and so do a discount, a third party's fee and notes; an offset and
 * a refund carry over between any two.
 * The rest starts empty.
 */
export function withForm(p: Price, form: FormId): Price {
  if (p.form === form) return p;
  const next = blankPrice(form);
  if (isBounded(p) && isBounded(next)) {
    const { form: _f, rate: _r, amount: _a, ...parts } = p as Bounded & { rate?: Num; amount?: Num };
    return owned({ ...next, ...parts } as Price);
  }
  const rate = p.form === "action" || p.form === "held" ? p.rate : null;
  const amount = p.form === "sum" || p.form === "perAction" ? p.amount : null;
  if ((next.form === "action" || next.form === "held") && rate) return owned(partsInto(p, { ...next, rate }));
  if ((next.form === "sum" || next.form === "perAction") && amount) return owned(partsInto(p, { ...next, amount }));
  return owned(partsInto(p, next));
}

/**
 * A held price's months: the rate's period (`per`) or how often it is charged (`every`); a sum's period (`every`). Months that differ
 * from the price's make it the person's (`owned`).
 */
export function withMonths(p: Price, which: "per" | "every", months: Months): Price {
  if (p.form === "held") return p[which] === months ? p : owned({ ...p, [which]: months });
  if (p.form === "sum" && which === "every") return p.every === months ? p : owned({ ...p, every: months });
  return p;
}

/**
 * A price's sums in another currency: a share of an action's bounds and flat price, a sum per unit with its bounds and flat price, a sum per
 * action. The shekel is left unsaid. A currency that differs from the price's makes it the person's (`owned`).
 */
export function withCurrency(p: Price, currency: BoundCurrency): Price {
  if ((p.form !== "action" && p.form !== "perUnit" && p.form !== "perAction") || (p.currency ?? "ILS") === currency) return p;
  const { currency: _c, ...rest } = p;
  return owned((currency === "ILS" ? rest : { ...rest, currency }) as Price);
}

/**
 * A share of an action or a sum per unit with a flat price for a small action (`on`), its two figures blank until typed, or without one
 * (the same price on every action). A price that already has one, or has none to take away, is left as it is.
 */
export function withFlat(p: Price, on: boolean): Price {
  if (!isBounded(p) || on === !!p.flat) return p;
  if (on) return { ...p, flat: { amount: blankFigure(), upTo: blankFigure() } };
  const { flat: _f, ...rest } = p;
  return rest;
}

// ---------------------------------------------------------------- a price's parts (F-116, F-117 and §10.6's stated parts)

/** A price on an action with a discount (its share blank until typed), or without one. Any other price is left as it is. */
export function withDiscount(p: Price, on: boolean): Price {
  if (!isOnAction(p) || on === !!p.discount) return p;
  if (on) return { ...p, discount: { pct: blankFigure() } };
  const { discount: _d, ...rest } = p;
  return rest;
}

/** A discount that is off the minimum too, where the list says so (F-116), or off the price alone. */
export function withDiscountOnMin(p: Price, on: boolean): Price {
  if (!isOnAction(p) || !p.discount || on === !!p.discount.alsoMin) return p;
  const { alsoMin: _m, ...rest } = p.discount;
  return { ...p, discount: on ? { ...rest, alsoMin: true } : rest };
}

/** A price on an action with a third party's fee (none of its figures given: "בלי סכום בתעריפון", §10.6's stated parts), or without one. */
export function withThird(p: Price, on: boolean): Price {
  if (!isOnAction(p) || on === !!p.third) return p;
  if (on) return { ...p, third: {} };
  const { third: _t, ...rest } = p;
  return rest;
}

/** A third party's fee named in the list's words, or unnamed (`""`). */
export function withThirdWho(p: Price, who: string): Price {
  if (!isOnAction(p) || !p.third) return p;
  const { who: _w, ...rest } = p.third;
  const name = who.trim();
  return { ...p, third: name ? { ...rest, who: name } : rest };
}

/**
 * A third party's fee with a figure of a form (its figure blank until typed, F-117), its currency carried from the form before; or with none
 * (`null`: the list gives no figure, §10.6's stated parts). The same form leaves it as it is.
 */
export function withThirdForm(p: Price, form: ThirdPrice["form"] | null): Price {
  if (!isOnAction(p) || !p.third) return p;
  const before = p.third.price;
  if ((before?.form ?? null) === form) return p;
  const { price: _p, ...rest } = p.third;
  if (form === null) return { ...p, third: rest };
  const currency = before?.currency ? { currency: before.currency } : {};
  const price: ThirdPrice = form === "action" ? { form, rate: blankFigure(), ...currency } : { form, amount: blankFigure(), ...currency };
  return { ...p, third: { ...rest, price } };
}

/** A third party's figure in another currency (the shekel is left unsaid). */
export function withThirdCurrency(p: Price, currency: BoundCurrency): Price {
  if (!isOnAction(p) || !p.third?.price || (p.third.price.currency ?? "ILS") === currency) return p;
  const { currency: _c, ...rest } = p.third.price;
  return { ...p, third: { ...p.third, price: (currency === "ILS" ? rest : { ...rest, currency }) as ThirdPrice } };
}

/** A price offset against the deal's fee of `kind` (§10.6's stated parts), or not (`null`). A free price has nothing to offset. */
export function withOffset(p: Price, kind: FeeKindId | null): Price {
  if (p.form === "free") return p;
  const { offset: _o, ...rest } = p;
  return (kind === null ? rest : { ...rest, offset: { kind } }) as Price;
}

/** A price with a refund (its sum blank until typed, §10.6's stated parts), or without one. */
export function withRefund(p: Price, on: boolean): Price {
  if (p.form === "free" || on === !!p.refund) return p;
  if (on) return { ...p, refund: blankFigure() } as Price;
  const { refund: _r, ...rest } = p;
  return rest as Price;
}

/** A price on an action with a note on an order (§10.6's stated parts), or without it; the notes keep their order. */
export function withNote(p: Price, note: Note, on: boolean): Price {
  if (!isOnAction(p) || on === !!p.notes?.includes(note)) return p;
  const notes = on ? [...(p.notes ?? []), note] : (p.notes ?? []).filter((x) => x !== note);
  const { notes: _n, ...rest } = p;
  return notes.length ? { ...rest, notes } : rest;
}

// ---------------------------------------------------------------- a fee's prices over time, whole or in a case

/** A fee with the prices of `caseId` (or its own, or its first case's) replaced by `fn` of them. */
function editPriced<F extends Fee>(fee: F, caseId: string | undefined, fn: (x: Priced) => Priced): F {
  if (!hasCases(fee)) {
    const { stages, sale } = fn(fee);
    const { sale: _s, ...rest } = fee as SlimFee;
    return { ...rest, stages, ...(sale ? { sale } : {}) } as F;
  }
  const target = pricedOf(fee, caseId) as Case;
  return {
    ...fee,
    cases: fee.cases.map((c) => {
      if (c !== target) return c;
      const { stages, sale } = fn(c);
      const { sale: _s, ...rest } = c;
      return { ...rest, stages, ...(sale ? { sale } : {}) };
    }),
  };
}

const withStages = <F extends Fee>(fee: F, side: Side, stages: Stage[], caseId?: string): F =>
  editPriced(fee, caseId, (x) => (side === "sell" && x.sale ? { ...x, sale: stages } : { ...x, stages }));

/** A fee with the price of one stage replaced by `fn` of it (in case `caseId`, where the fee has cases). */
export const editPrice = <F extends Fee>(fee: F, side: Side, k: number, fn: (p: Price) => Price, caseId?: string): F =>
  withStages(fee, side, pricesOn(fee, side, caseId).map((s, j) => (j === k ? { ...s, price: fn(s.price) } : s)), caseId);

/** A fee whose stage `k` ends at the start of `month`, or has no end given yet (`null`). */
export function setUntil<F extends Fee>(fee: F, side: Side, k: number, month: MonthKey | null, caseId?: string): F {
  return withStages(
    fee,
    side,
    pricesOn(fee, side, caseId).map((s, j) => {
      if (j !== k) return s;
      const { until: _u, ...rest } = s;
      return month === null ? rest : { ...rest, until: month };
    }),
    caseId,
  );
}

// A fee's prices on a side are a chain, each made by "עד מתי" on the one before it: "לזמן מוגבל" with a month ends a price at that month
// and adds the next one, which asks for its price; "כל הזמן" makes a price the last, taking away the prices after it.

/**
 * A fee whose last price on a side ends at the start of `until`, with one more price after it: of the form the last had (the fee's usual
 * form after a free price), its rate or sum blank, so the fee is not read until the person gives it (`feePriced`). The person says the
 * month first, so the prices are in order from the start.
 */
export function addLater<F extends Fee>(fee: F, side: Side, until: MonthKey, caseId?: string): F {
  const stages = pricesOn(fee, side, caseId);
  const last = stages.at(-1)!;
  return withStages(fee, side, [...stages.slice(0, -1), { ...last, until }, { price: blankPrice(laterForm(fee, last.price)) }], caseId);
}

/** The form of the price that follows `before`: the same form, or the fee's usual one after a free price. */
const laterForm = (fee: Fee, before: Price): FormId => (before.form === "free" ? FEE_SHAPES[fee.kind].usual : before.form);

/** Price `k` for a limited time, up to the start of `month`: the last price ends there and the next one follows it (`addLater`); another moves its end. */
export function setLimited<F extends Fee>(fee: F, side: Side, k: number, month: MonthKey, caseId?: string): F {
  return k === pricesOn(fee, side, caseId).length - 1 ? addLater(fee, side, month, caseId) : setUntil(fee, side, k, month, caseId);
}

/** Price `k` held on with no end: the prices after it go. */
export function holdOn<F extends Fee>(fee: F, side: Side, k: number, caseId?: string): F {
  const stages = pricesOn(fee, side, caseId);
  if (!stages[k]) return fee;
  const { until: _u, ...open } = stages[k]!;
  return withStages(fee, side, [...stages.slice(0, k), open], caseId);
}

/**
 * Whether the prices after `k` hold nothing the person gave: one price only, as "לזמן מוגבל" added it (no month, its form the one it
 * came with, its figures, periods and currency untouched). Anything chosen in it counts. They go then without an undo.
 */
export function laterUntouched(fee: Fee, side: Side, k: number, caseId?: string): boolean {
  const stages = pricesOn(fee, side, caseId);
  const later = stages.slice(k + 1);
  return later.length === 1 && later[0]!.until === undefined && sameContent(later[0]!.price, blankPrice(laterForm(fee, stages[k]!.price)));
}

/**
 * A fee without price `k`, its neighbours' times joined: the price before a middle one runs until the end of the one taken away, the next
 * one starting where it did; the price left last has no end. The only price is never removed.
 */
export function removeStage<F extends Fee>(fee: F, side: Side, k: number, caseId?: string): F {
  const stages = pricesOn(fee, side, caseId);
  if (stages.length < 2 || !stages[k]) return fee;
  const rest = stages.filter((_, j) => j !== k);
  const end = stages[k]!.until;
  if (k > 0 && k < stages.length - 1 && end) rest[k - 1] = { ...rest[k - 1]!, until: end };
  const { until: _u, ...open } = rest.at(-1)!;
  return withStages(fee, side, [...rest.slice(0, -1), open], caseId);
}

/** A fee (or its case) whose sale is priced as its purchase, or apart from it (starting as a copy of the purchase's prices). */
export function setSaleApart<F extends Fee>(fee: F, apart: boolean, caseId?: string): F {
  return editPriced(fee, caseId, (x) => (apart ? { stages: x.stages, sale: x.sale ?? structuredClone(x.stages) } : { stages: x.stages }));
}

/** A fee of the person's own with its name. */
export const setFeeName = <F extends Fee>(fee: F, name: string): F => ({ ...fee, name });

// ---------------------------------------------------------------- what a fee's price changes by (F-114)

/**
 * A thing to add to a fee, with its values asked once: a list thing with the values ticked (the site's ids or the person's words; for what
 * is bought or held, a value of the person's own with where it is bought and its currency, `own`); a track or a condition with its values
 * in the person's words (a condition with its name); a range with its first top and its unit.
 */
export type NewBy =
  | { kind: "what" | "held"; values: string[]; own?: OwnPlace[] }
  | { kind: "channel" | "currency"; values: string[] }
  | { kind: "track"; values: string[] }
  | { kind: "own"; label: string; values: string[] }
  | { kind: RangeKind; unit: RangeUnit; top: number };

/** A case copied with a new id, its track no longer marked as the person's (`mine` names one track, which the copy may not be). */
const copyOf = (c: Case, when: When[]): Case => {
  const { mine: _m, id: _id, ...rest } = structuredClone(c);
  return { ...rest, id: newCaseId(), when };
};

/** The thing a `NewBy` makes, and the values each case is copied to (a range's two steps, "עד" its top and "מעל" it). */
function thingOf(n: NewBy): { by: By; values: When[] } | null {
  if (isRangeKind(n.kind)) {
    const r = n as Extract<NewBy, { top: number }>;
    if (!RANGE_UNITS[r.kind].includes(r.unit) || !(r.top > 0)) return null;
    return { by: { kind: r.kind, unit: r.unit, tops: [typed(r.top)] }, values: [0, 1] };
  }
  const l = n as Exclude<NewBy, { top: number }>;
  const values = [...new Set(l.values.map((v) => v.trim()).filter(Boolean))];
  if (values.length === 0) return null;
  if (l.kind === "own") return l.label.trim() ? { by: { kind: "own", label: l.label.trim() }, values: values.map((v) => [v]) } : null;
  if (l.kind === "what" || l.kind === "held") {
    const own = (l.own ?? []).filter((o) => values.includes(o.name) && !Object.hasOwn(WHAT_VALUES, o.name));
    if (!values.every((v) => LIST_IDS[l.kind].includes(v) || own.some((o) => o.name === v))) return null;
    return { by: { kind: l.kind, ...(own.length ? { own } : {}) }, values: values.map((v) => [v]) };
  }
  return { by: { kind: l.kind }, values: values.map((v) => [v]) };
}

/**
 * Whether a fee can take a thing of `kind` more: one its kind may change by (`byKindsFor`), not one it changes by already (what is bought
 * and what is held count as one), and fewer than three things so far.
 */
export function canAddBy(fee: Fee, kind: ByKind, label?: string): boolean {
  if (!byKindsFor(fee.kind).includes(kind)) return false;
  const by = fee.by ?? [];
  if (by.length >= BY_MAX) return false;
  const key = kind === "own" ? `own:${label?.trim() ?? ""}` : kind === "held" ? "what" : kind;
  return !by.some((b) => pickKey(b) === key);
}

/**
 * A fee whose price changes by one more thing (F-114): every case is copied to each of the thing's values with its own prices (two cases
 * and two channels make four), a range's to "עד" its first top and "מעל" it; a fee whose price changed by nothing becomes one with cases,
 * its prices copied the same way. A fee that cannot take the thing (`canAddBy`), or a thing with no value, leaves it as it is.
 */
export function addBy(fee: Fee, n: NewBy): Fee {
  if (!canAddBy(fee, n.kind, "label" in n ? n.label : undefined)) return fee;
  const made = thingOf(n);
  if (!made) return fee;
  const base: Case[] = hasCases(fee) ? fee.cases : [{ id: newCaseId(), when: [], stages: fee.stages, ...(fee.sale ? { sale: fee.sale } : {}) }];
  // each case keeps its id on the first value (the case open on the screen stays open), and the person's track stays marked on its copies
  const cases = base.flatMap((c) =>
    made.values.map((v, j): Case => {
      const x = j === 0 ? { ...c, when: [...c.when, v] } : copyOf(c, [...c.when, v]);
      return c.mine ? { ...x, mine: true } : x;
    }),
  );
  const { stages: _s, sale: _sale, ...head } = fee;
  return { ...head, by: [...(fee.by ?? []), made.by], cases } as CasesFee;
}

/**
 * A fee without thing `t`: the cases that differ only in it become one, the first of them in order, so no price is read twice; a fee left
 * with no thing changes by nothing again, priced as its first case. The undo keeps what this takes (undo.ts).
 */
export function removeBy(fee: Fee, t: number): Fee {
  if (!hasCases(fee) || !fee.by[t]) return fee;
  if (fee.by.length === 1) {
    const first = fee.cases[0]!;
    const { by: _b, cases: _c, ...head } = fee;
    return { ...head, stages: first.stages, ...(first.sale ? { sale: first.sale } : {}) } as SlimFee;
  }
  const kept: Case[] = [];
  for (const c of fee.cases) {
    const when = c.when.filter((_, j) => j !== t);
    if (kept.some((k) => sameContent(k.when, when))) continue;
    kept.push({ ...c, when });
  }
  const by = fee.by.filter((_, j) => j !== t);
  const track = by.some((b) => b.kind === "track");
  return { ...fee, by, cases: track ? kept : kept.map(({ mine: _m, ...c }) => c) };
}

/** A fee with one more case at its end: a copy of case `fromId` (or of the last case), with its prices. A fee with no cases is left as it is. */
export function addCase(fee: Fee, fromId?: string): Fee {
  if (!hasCases(fee)) return fee;
  const from = fee.cases.find((c) => c.id === fromId) ?? fee.cases.at(-1)!;
  return { ...fee, cases: [...fee.cases, copyOf(from, [...from.when])] };
}

/** A fee with case `caseId` copied right after it, with its prices ("להעתיק את המקרה"). */
export function copyCase(fee: Fee, caseId: string): Fee {
  if (!hasCases(fee)) return fee;
  const at = fee.cases.findIndex((c) => c.id === caseId);
  if (at < 0) return fee;
  const from = fee.cases[at]!;
  return { ...fee, cases: [...fee.cases.slice(0, at + 1), copyOf(from, [...from.when]), ...fee.cases.slice(at + 1)] };
}

/** A fee without case `caseId`. The only case is never removed: a fee needs a price. The undo keeps what this takes (undo.ts). */
export function removeCase(fee: Fee, caseId: string): Fee {
  if (!hasCases(fee) || fee.cases.length < 2 || !fee.cases.some((c) => c.id === caseId)) return fee;
  return { ...fee, cases: fee.cases.filter((c) => c.id !== caseId) };
}

/** A fee with its cases in a new order: case `caseId` moved to place `to`. */
export function moveCase(fee: Fee, caseId: string, to: number): Fee {
  if (!hasCases(fee)) return fee;
  const at = fee.cases.findIndex((c) => c.id === caseId);
  if (at < 0) return fee;
  const rest = fee.cases.filter((c) => c.id !== caseId);
  const k = Math.max(0, Math.min(to, rest.length));
  return { ...fee, cases: [...rest.slice(0, k), fee.cases[at]!, ...rest.slice(k)] };
}

/** Whether a value fits thing `b`: any value; for a list, values the thing knows (what is bought or held: the site's ids or its own); a range's step. */
function fits(b: By, w: When): boolean {
  if (w === "any") return true;
  if (isRange(b)) return typeof w === "number" && Number.isInteger(w) && w >= 0 && w <= b.tops.length;
  if (!Array.isArray(w) || w.length === 0 || new Set(w).size !== w.length || w.some((v) => !v.trim())) return false;
  if (b.kind === "what" || b.kind === "held") return w.every((v) => LIST_IDS[b.kind].includes(v) || !!b.own?.some((o) => o.name === v));
  return true;
}

/** A fee whose case `caseId` says `when` of thing `t` (several values may be named, F-114). A value that does not fit the thing leaves it as it is. */
export function setWhen(fee: Fee, caseId: string, t: number, when: When): Fee {
  if (!hasCases(fee) || !fee.by[t] || !fits(fee.by[t]!, when)) return fee;
  return { ...fee, cases: fee.cases.map((c) => (c.id === caseId ? { ...c, when: c.when.map((w, j) => (j === t ? when : w)) } : c)) };
}

/**
 * A fee with a value of what is bought or held that the person names, with where it is bought and its currency, on thing `t`; a name the
 * site already has, or the thing already names, leaves it as it is.
 */
export function addOwnPlace(fee: Fee, t: number, own: OwnPlace): Fee {
  const b = fee.by?.[t];
  const name = own.name.trim();
  if (!hasCases(fee) || !b || (b.kind !== "what" && b.kind !== "held") || !name || Object.hasOwn(WHAT_VALUES, name) || b.own?.some((o) => o.name === name)) return fee;
  return { ...fee, by: fee.by.map((x, j) => (j === t ? { ...b, own: [...(b.own ?? []), { ...own, name }] } : x)) };
}

/**
 * A fee whose case `caseId` has the person's own track (`on`), or not: every case of the same track is marked with it and no other, since
 * one track of a fee is the person's; off, the fee names none. A case on any track, or a fee with no track, is left as it is.
 */
export function setMine(fee: Fee, caseId: string, on: boolean): Fee {
  if (!hasCases(fee)) return fee;
  const t = fee.by.findIndex((b) => b.kind === "track");
  const c = fee.cases.find((x) => x.id === caseId);
  const track = c?.when[t];
  if (t < 0 || !c || !Array.isArray(track)) return fee;
  const same = (x: Case) => Array.isArray(x.when[t]) && (x.when[t] as string[]).some((v) => track.includes(v));
  return { ...fee, cases: fee.cases.map(({ mine: _m, ...x }) => (on && same({ ...x }) ? { ...x, mine: true as const } : x)) };
}

/** A range's unit (a currency, units or actions, `RANGE_UNITS`), its tops kept as typed. */
export function setRangeUnit(fee: Fee, t: number, unit: RangeUnit): Fee {
  const b = fee.by?.[t];
  if (!hasCases(fee) || !b || !isRange(b) || !RANGE_UNITS[b.kind].includes(unit) || b.unit === unit) return fee;
  return { ...fee, by: fee.by.map((x, j) => (j === t ? { ...b, unit, tops: b.tops.map((n) => typed(n.v)) } : x)) };
}

/**
 * A fee whose case `caseId` is up to `upTo` on range `t` ("עד", F-114), or above its last top (`upTo` null: "מעל"). A top the range has
 * already is that step; a new one splits the step it falls in, and every case on that step is copied to both halves with its prices, so
 * no size is left without a case; the case named takes the lower half. A top above the last makes a new last step, which the cases on the
 * last step are copied to the same way.
 */
export function setStep(fee: Fee, caseId: string, t: number, upTo: number | null): Fee {
  const b = fee.by?.[t];
  if (!hasCases(fee) || !b || !isRange(b) || !fee.cases.some((c) => c.id === caseId)) return fee;
  const tops = b.tops.map((n) => n.v);
  if (upTo === null) return setWhen(fee, caseId, t, tops.length);
  if (!(upTo > 0)) return fee;
  const at = tops.indexOf(upTo);
  if (at >= 0) return setWhen(fee, caseId, t, at);
  const j = tops.findIndex((x) => x > upTo);
  const split = j < 0 ? tops.length : j;
  const newTops = [...b.tops.slice(0, split), typed(upTo), ...b.tops.slice(split)];
  const cases = fee.cases.flatMap((c): Case[] => {
    const w = c.when[t]!;
    const shift = (s: number) => c.when.map((x, k) => (k === t ? s : x));
    if (typeof w !== "number" || w < split) return [c];
    if (w > split) return [{ ...c, when: shift(w + 1) }];
    // the step split in two: the case on its lower half, and a copy of it on the upper
    return [{ ...c, when: shift(split) }, { ...copyOf(c, shift(split + 1)), ...(c.mine ? { mine: true as const } : {}) }];
  });
  // the case named takes the lower half; a copy of it on the upper half, where it was on the step split, stays for the other sizes
  return setWhen({ ...fee, by: fee.by.map((x, k) => (k === t ? { ...b, tops: newTops } : x)), cases }, caseId, t, split);
}

/** A range's top `k` typed again (its unit kept): refused where it would not stay above the top before it and below the one after. */
export function setTop(fee: Fee, t: number, k: number, v: number): Fee {
  const b = fee.by?.[t];
  if (!hasCases(fee) || !b || !isRange(b) || !b.tops[k]) return fee;
  const before = b.tops[k - 1]?.v ?? 0, after = b.tops[k + 1]?.v ?? Infinity;
  if (!(v > before && v < after)) return fee;
  return { ...fee, by: fee.by.map((x, j) => (j === t ? { ...b, tops: b.tops.map((n, i) => (i === k ? retyped(n, v) : n)) } : x)) };
}

/**
 * A range without its top `k`: the steps on either side of it become one, the cases on the upper one moving to it; where two cases then say
 * the same of every thing, the first stays. The last top is never removed: a range has at least one.
 */
export function removeTop(fee: Fee, t: number, k: number): Fee {
  const b = fee.by?.[t];
  if (!hasCases(fee) || !b || !isRange(b) || b.tops.length < 2 || !b.tops[k]) return fee;
  const kept: Case[] = [];
  for (const c of fee.cases) {
    const w = c.when[t]!;
    const when = c.when.map((x, j) => (j === t && typeof w === "number" && w > k ? w - 1 : x));
    if (kept.some((x) => sameContent(x.when, when))) continue;
    kept.push({ ...c, when });
  }
  return { ...fee, by: fee.by.map((x, j) => (j === t ? { ...b, tops: b.tops.filter((_, i) => i !== k) } : x)), cases: kept };
}

// ---------------------------------------------------------------- a part added or taken away, as the toolbox does

/**
 * Every part a price may have, by id (the toolbox's cards and the open case's lines): its main figure as a share of each action (`share`),
 * a sum for each unit (`perUnit`), a sum on each action (`perAction`), a share of what is held (`held`), a sum per period (`sum`), free
 * (`free`), a discount, a third party's fee, a later price (`until`); a minimum, a maximum, a percent maximum (`cap`), a flat price for a
 * small action (`flat`); an offset, a refund; notes on an order (`unfilled`, `partial`) and a sale priced apart (`sale`).
 */
export type PartId =
  | "share"
  | "perUnit"
  | "perAction"
  | "held"
  | "sum"
  | "free"
  | "discount"
  | "third"
  | "until"
  | "min"
  | "max"
  | "cap"
  | "flat"
  | "offset"
  | "refund"
  | "unfilled"
  | "partial"
  | "sale";

/** The form a price part sets: the main figure's parts are forms of the price. */
export const FORM_OF: Partial<Record<PartId, FormId>> = { share: "action", perUnit: "perUnit", perAction: "perAction", held: "held", sum: "sum", free: "free" };

/**
 * A price as a fee of `kind` may hold it (`FEE_SHAPES`): a currency carried into a form whose sums the fee keeps in shekels is dropped, and
 * so is a percent maximum carried into a form that has none.
 */
function inShape(kind: FeeKindId, p: Price): Price {
  if (p.form === "free") return p;
  const fields = FEE_SHAPES[kind].fields[p.form] ?? [];
  const { currency, cap, ...rest } = p as Price & { currency?: BoundCurrency; cap?: Num };
  return { ...rest, ...(currency !== undefined && fields.includes("currency") ? { currency } : {}), ...(cap !== undefined && fields.includes("cap") ? { cap } : {}) } as Price;
}

/**
 * Where a part goes, and what it needs: the case (`caseId`; a fee with cases is edited in its first where none is named), the side and the
 * price (`side`, `k`: the purchase's first where none is said), a bound's or a percent maximum's figure (`value`: a bound is never blank),
 * a later price's month (`month`), and the fee an offset is against (`against`).
 */
export interface PartAt {
  caseId?: string;
  side?: Side;
  k?: number;
  value?: number;
  month?: MonthKey;
  against?: FeeKindId;
}

/**
 * A fee with a part added (`on`) or taken away, as the toolbox and the open case's ✕ do: a form of the price (what it can carries over,
 * `withForm`, but a currency the fee keeps in shekels for that form; taking one away makes the price free), a discount, a third party's fee, a later price (from `month`; taken away, the
 * prices after the one named go, `holdOn`), a bound or a percent maximum (with its figure), a flat price, an offset (against `against`), a
 * refund, a note, or a sale priced apart. A part that needs what `at` does not give, or a price that cannot take it, leaves the fee as it
 * is.
 */
export function setPart<F extends Fee>(fee: F, part: PartId, on: boolean, at: PartAt = {}): F {
  const { caseId, side = "buy", k = 0 } = at;
  const edit = (fn: (p: Price) => Price) => editPrice(fee, side, k, fn, caseId);
  const form = FORM_OF[part];
  if (form) return edit((p) => (on ? inShape(fee.kind, withForm(p, form)) : p.form === form ? { form: "free" } : p));
  switch (part) {
    case "discount":
      return edit((p) => withDiscount(p, on));
    case "third":
      return edit((p) => withThird(p, on));
    case "until":
      if (on) return at.month ? setLimited(fee, side, k, at.month, caseId) : fee;
      return holdOn(fee, side, k, caseId);
    case "min":
    case "max":
    case "cap":
      if (on && at.value === undefined) return fee;
      return edit((p) => withFigure(p, part, on ? at.value! : null));
    case "flat":
      return edit((p) => withFlat(p, on));
    case "offset":
      return on && !at.against ? fee : edit((p) => withOffset(p, on ? at.against! : null));
    case "refund":
      return edit((p) => withRefund(p, on));
    case "unfilled":
    case "partial":
      return edit((p) => withNote(p, part, on));
    case "sale":
      return setSaleApart(fee, on, caseId);
    default:
      return fee;
  }
}
