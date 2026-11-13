// The changes the fee page makes to a deal, each a pure function from a deal to the next: the screen calls them and saves what they
// return. A figure the person types becomes theirs (`retyped`): it loses a template's source unless it is the same number. A price whose
// terms the person changes (its months, its bounds' currency, its form) becomes theirs whole (`owned`): the source states another price.
import { blankFigure, blankPrice, newFee, pricesOn, retyped, sameContent, typed, type BoundCurrency, type Fee, type FeeDeal, type MonthKey, type Months, type Num, type Price, type Side, type Stage } from "./model";
import type { DealKind } from "./kinds";
import { FEE_SHAPES, holdsFunds, kindHas, type FeeKindId, type FormId, type Held } from "./shapes";

export type { Side } from "./model";

/** A figure of a price the screen edits. */
export type Figure = "rate" | "min" | "max" | "amount";

const stagesOf = pricesOn;
const withStages = (fee: Fee, side: Side, stages: Stage[]): Fee => (side === "sell" && fee.sale ? { ...fee, sale: stages } : { ...fee, stages });

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
 * kinds both have stay as typed, a fee of the person's own among them. What it holds goes where the new kind holds no funds. Its template
 * goes, with the provider kind the template gave: a template belongs to one kind (a house's price list to the securities account, a track
 * to its product). The same kind leaves the deal as it is.
 */
export function setKind(deal: FeeDeal, kind: DealKind, barred: readonly FeeKindId[] = []): FeeDeal {
  if (deal.kind === kind.id) return deal;
  const { held: _held, template: _template, provider: _provider, ...rest } = deal;
  const fees = deal.fees.filter((f) => kindHas(kind.id, kind.bases, f.kind) && !barred.includes(f.kind));
  return { ...rest, kind: kind.id, fees, ...(holdsFunds(kind.id) && deal.held ? { held: deal.held } : {}) };
}

export const setHeld = (deal: FeeDeal, held: Held): FeeDeal => ({ ...deal, held });

/**
 * One of the three facts of what a fund-holding deal holds, chosen on its own: the facts chosen so far, and what the deal holds once all
 * three are (null until then, so the deal says nothing of what it holds before).
 */
export function pickHeld(now: Partial<Held>, part: Partial<Held>): { draft: Partial<Held>; held: Held | null } {
  const draft = { ...now, ...part };
  return { draft, held: draft.place && draft.currency && draft.payout ? (draft as Held) : null };
}

export const setName = (deal: FeeDeal, name: string): FeeDeal => ({ ...deal, name });

export function setStart(deal: FeeDeal, start: MonthKey | null): FeeDeal {
  const { start: _start, ...rest } = deal;
  return start === null ? rest : { ...rest, start };
}

/** A price with one figure typed, or emptied (`null`): an emptied bound is taken away, an emptied rate or sum is blank again (`blankFigure`). */
export function withFigure(p: Price, figure: Figure, n: number | null): Price {
  const keep = (old: Num | undefined): Num | undefined => (n === null ? undefined : old ? retyped(old, n) : typed(n));
  switch (p.form) {
    case "action":
    case "held": {
      if (figure === "rate") return { ...p, rate: n === null ? blankFigure() : keep(p.rate)! };
      if (figure !== "min" && figure !== "max") return p;
      const next = { ...p, [figure]: keep(p[figure]) };
      if (next[figure] === undefined) delete next[figure];
      return next;
    }
    case "sum":
    case "perAction":
      return figure === "amount" ? { ...p, amount: n === null ? blankFigure() : keep(p.amount)! } : p;
    default:
      return p;
  }
}

/** One figure of a price as it stands, with its source; none where the price has no such figure. */
export function figureOf(p: Price, figure: Figure): Num | undefined {
  if (p.form === "action" || p.form === "held") return figure === "rate" ? p.rate : figure === "min" || figure === "max" ? p[figure] : undefined;
  if (p.form === "sum" || p.form === "perAction") return figure === "amount" ? p.amount : undefined;
  return undefined;
}

/**
 * A price with one figure put back as it stood (`figureOf`), its source with it: none takes a bound away and leaves a rate or a sum blank.
 * A price of another form than the figure's is left as it is.
 */
export function figureBack(p: Price, figure: Figure, n: Num | undefined): Price {
  switch (p.form) {
    case "action":
    case "held": {
      if (figure === "rate") return { ...p, rate: n ?? blankFigure() };
      if (figure !== "min" && figure !== "max") return p;
      const next = { ...p, [figure]: n };
      if (n === undefined) delete next[figure];
      return next;
    }
    case "sum":
    case "perAction":
      return figure === "amount" ? { ...p, amount: n ?? blankFigure() } : p;
    default:
      return p;
  }
}

/**
 * A price the person changed the terms of is theirs: every figure in it loses a template's source, which states the price as it was (the
 * same percent for another period, or the same sum in another currency, is a price the source does not give). A blank figure stays blank.
 */
function owned(p: Price): Price {
  const own = (n: Num): Num => (n.blank ? n : typed(n.v));
  switch (p.form) {
    case "action":
    case "held":
      return { ...p, rate: own(p.rate), ...(p.min ? { min: typed(p.min.v) } : {}), ...(p.max ? { max: typed(p.max.v) } : {}) };
    case "sum":
    case "perAction":
      return { ...p, amount: own(p.amount) };
    default:
      return p;
  }
}

/**
 * A price in another form: the rate or the sum typed so far carries over where the new form has one, as the person's own figure (`owned`);
 * the rest starts empty.
 */
export function withForm(p: Price, form: FormId): Price {
  if (p.form === form) return p;
  const next = blankPrice(form);
  const rate = p.form === "action" || p.form === "held" ? p.rate : null;
  const amount = p.form === "sum" || p.form === "perAction" ? p.amount : null;
  if ((next.form === "action" || next.form === "held") && rate) return owned({ ...next, rate });
  if ((next.form === "sum" || next.form === "perAction") && amount) return owned({ ...next, amount });
  return next;
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

/** An action's bounds in another currency: the shekel is left unsaid. A currency that differs from the price's makes it the person's (`owned`). */
export function withCurrency(p: Price, currency: BoundCurrency): Price {
  if (p.form !== "action" || (p.currency ?? "ILS") === currency) return p;
  const { currency: _c, ...rest } = p;
  return owned(currency === "ILS" ? rest : { ...rest, currency });
}

/** A fee with the price of one stage replaced by `fn` of it. */
export const editPrice = (fee: Fee, side: Side, k: number, fn: (p: Price) => Price): Fee => withStages(fee, side, stagesOf(fee, side).map((s, j) => (j === k ? { ...s, price: fn(s.price) } : s)));

/** A fee whose stage `k` ends at the start of `month`, or has no end given yet (`null`). */
export function setUntil(fee: Fee, side: Side, k: number, month: MonthKey | null): Fee {
  return withStages(
    fee,
    side,
    stagesOf(fee, side).map((s, j) => {
      if (j !== k) return s;
      const { until: _u, ...rest } = s;
      return month === null ? rest : { ...rest, until: month };
    }),
  );
}

// A fee's prices on a side are a chain, each made by "עד מתי" on the one before it: "לזמן מוגבל" with a month ends a price at that month
// and adds the next one, which asks for its price; "כל הזמן" makes a price the last, taking away the prices after it.

/**
 * A fee whose last price on a side ends at the start of `until`, with one more price after it: of the form the last had (the fee's usual
 * form after a free price), its rate or sum blank, so the fee is not read until the person gives it (`feePriced`). The person says the
 * month first, so the prices are in order from the start.
 */
export function addLater(fee: Fee, side: Side, until: MonthKey): Fee {
  const stages = stagesOf(fee, side);
  const last = stages.at(-1)!;
  return withStages(fee, side, [...stages.slice(0, -1), { ...last, until }, { price: blankPrice(laterForm(fee, last.price)) }]);
}

/** The form of the price that follows `before`: the same form, or the fee's usual one after a free price. */
const laterForm = (fee: Fee, before: Price): FormId => (before.form === "free" ? FEE_SHAPES[fee.kind].usual : before.form);

/** Price `k` for a limited time, up to the start of `month`: the last price ends there and the next one follows it (`addLater`); another moves its end. */
export function setLimited(fee: Fee, side: Side, k: number, month: MonthKey): Fee {
  return k === stagesOf(fee, side).length - 1 ? addLater(fee, side, month) : setUntil(fee, side, k, month);
}

/** Price `k` held on with no end: the prices after it go. */
export function holdOn(fee: Fee, side: Side, k: number): Fee {
  const stages = stagesOf(fee, side);
  if (!stages[k]) return fee;
  const { until: _u, ...open } = stages[k]!;
  return withStages(fee, side, [...stages.slice(0, k), open]);
}

/**
 * Whether the prices after `k` hold nothing the person gave: one price only, as "לזמן מוגבל" added it (no month, its form the one it
 * came with, its figures, periods and currency untouched). Anything chosen in it counts. They go then without an undo.
 */
export function laterUntouched(fee: Fee, side: Side, k: number): boolean {
  const stages = stagesOf(fee, side);
  const later = stages.slice(k + 1);
  return later.length === 1 && later[0]!.until === undefined && sameContent(later[0]!.price, blankPrice(laterForm(fee, stages[k]!.price)));
}

/**
 * A fee without price `k`, its neighbours' times joined: the price before a middle one runs until the end of the one taken away, the next
 * one starting where it did; the price left last has no end. The only price is never removed.
 */
export function removeStage(fee: Fee, side: Side, k: number): Fee {
  const stages = stagesOf(fee, side);
  if (stages.length < 2 || !stages[k]) return fee;
  const rest = stages.filter((_, j) => j !== k);
  const end = stages[k]!.until;
  if (k > 0 && k < stages.length - 1 && end) rest[k - 1] = { ...rest[k - 1]!, until: end };
  const { until: _u, ...open } = rest.at(-1)!;
  return withStages(fee, side, [...rest.slice(0, -1), open]);
}

/** A fee whose sale is priced as its purchase, or apart from it (starting as a copy of the purchase's prices). */
export function setSaleApart(fee: Fee, apart: boolean): Fee {
  const { sale: _s, ...rest } = fee;
  return apart ? { ...rest, sale: structuredClone(fee.stages) } : rest;
}

/** A fee of the person's own with its name. */
export const setFeeName = (fee: Fee, name: string): Fee => ({ ...fee, name });
