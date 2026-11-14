// The changes the fee page makes to one price, each a pure function from a price to the next: its figures, its terms and its parts. A
// figure the person types becomes theirs (`retyped`): it loses a template's source unless it is the same number. A price whose terms the
// person changes (its months, its bounds' currency, its form) becomes theirs whole (`owned`): the source states another price. These read
// the model, the capabilities and the figure table alone, so the part registry (offers/parts.ts) builds its edits on them.
import { blankFigure, retyped, typed, type BoundCurrency, type Months, type Note, type Num, type Price, type ThirdPrice } from "../model";
import { boundsAction, charged, onAction } from "../offers/capabilities";
import { FIGURE_IDS, FIGURES, type Figure } from "../offers/figures";
import { type FeeKindId } from "../shapes";

// ---------------------------------------------------------------- a price's figures

/**
 * A price with one figure set to `n`, or emptied (`n` undefined): an emptied bound or cap is taken away, an emptied rate, sum, figure of a
 * flat price, discount's share, third party's rate or sum, or refund is blank again (`blankFigure`). A figure the price's form has no place
 * for, or a part's figure where the price has not that part, leaves it as it is.
 */
function setFigure(p: Price, figure: Figure, n: Num | undefined): Price {
  const def = FIGURES[figure];
  return def.set(p, n ?? (def.emptied === "blank" ? blankFigure() : undefined));
}

/** A price with one figure typed, or emptied (`null`): an emptied bound or cap is taken away, an emptied rate, sum or part's figure is blank again. */
export function withFigure(p: Price, figure: Figure, n: number | null): Price {
  const old = figureOf(p, figure);
  return setFigure(p, figure, n === null ? undefined : old && !old.blank ? retyped(old, n) : typed(n));
}

/** One figure of a price as it stands, with its source; none where the price has no such figure. */
export const figureOf = (p: Price, figure: Figure): Num | undefined => FIGURES[figure].get(p);

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
  return FIGURE_IDS.reduce((x, f) => {
    const n = FIGURES[f].get(x);
    return n && !n.blank ? FIGURES[f].set(x, typed(n.v)) : x;
  }, p);
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
  if (!onAction(p) || (p.currency ?? "ILS") === currency) return p;
  const { currency: _c, ...rest } = p;
  return owned((currency === "ILS" ? rest : { ...rest, currency }) as Price);
}

/**
 * A share of an action or a sum per unit with a flat price for a small action (`on`), its two figures blank until typed, or without one
 * (the same price on every action). A price that already has one, or has none to take away, is left as it is.
 */
export function withFlat(p: Price, on: boolean): Price {
  if (!boundsAction(p) || on === !!p.flat) return p;
  if (on) return { ...p, flat: { amount: blankFigure(), upTo: blankFigure() } };
  const { flat: _f, ...rest } = p;
  return rest;
}

// ---------------------------------------------------------------- a price's parts (F-116, F-117 and §10.6's stated parts)

/** A price on an action with a discount (its share blank until typed), or without one. Any other price is left as it is. */
export function withDiscount(p: Price, on: boolean): Price {
  if (!onAction(p) || on === !!p.discount) return p;
  if (on) return { ...p, discount: { pct: blankFigure() } };
  const { discount: _d, ...rest } = p;
  return rest;
}

/** A discount that is off the minimum too, where the list says so (F-116), or off the price alone. */
export function withDiscountOnMin(p: Price, on: boolean): Price {
  if (!onAction(p) || !p.discount || on === !!p.discount.alsoMin) return p;
  const { alsoMin: _m, ...rest } = p.discount;
  return { ...p, discount: on ? { ...rest, alsoMin: true } : rest };
}

/** A price on an action with a third party's fee (none of its figures given: "בלי סכום בתעריפון", §10.6's stated parts), or without one. */
export function withThird(p: Price, on: boolean): Price {
  if (!onAction(p) || on === !!p.third) return p;
  if (on) return { ...p, third: {} };
  const { third: _t, ...rest } = p;
  return rest;
}

/** A third party's fee named in the list's words, or unnamed (`""`). */
export function withThirdWho(p: Price, who: string): Price {
  if (!onAction(p) || !p.third) return p;
  const { who: _w, ...rest } = p.third;
  const name = who.trim();
  return { ...p, third: name ? { ...rest, who: name } : rest };
}

/**
 * A third party's fee with a figure of a form (its figure blank until typed, F-117), its currency carried from the form before; or with none
 * (`null`: the list gives no figure, §10.6's stated parts). The same form leaves it as it is.
 */
export function withThirdForm(p: Price, form: ThirdPrice["form"] | null): Price {
  if (!onAction(p) || !p.third) return p;
  const before = p.third.price;
  if ((before?.form ?? null) === form) return p;
  const { price: _p, ...rest } = p.third;
  if (form === null) return { ...p, third: rest };
  const currency = before?.currency ? { currency: before.currency } : {};
  const price: ThirdPrice = form === "action" ? { form, rate: blankFigure(), ...currency } : { form, amount: blankFigure(), ...currency };
  return { ...p, third: { ...rest, price } };
}

/** A price offset against the deal's fee of `kind` (§10.6's stated parts), or not (`null`). A free price has nothing to offset. */
export function withOffset(p: Price, kind: FeeKindId | null): Price {
  if (!charged(p)) return p;
  const { offset: _o, ...rest } = p;
  return (kind === null ? rest : { ...rest, offset: { kind } }) as Price;
}

/** A price with a refund (its sum blank until typed, §10.6's stated parts), or without one. */
export function withRefund(p: Price, on: boolean): Price {
  if (!charged(p) || on === !!p.refund) return p;
  if (on) return { ...p, refund: blankFigure() } as Price;
  const { refund: _r, ...rest } = p;
  return rest as Price;
}

/** A price on an action with a note on an order (§10.6's stated parts), or without it; the notes keep their order. */
export function withNote(p: Price, note: Note, on: boolean): Price {
  if (!onAction(p) || on === !!p.notes?.includes(note)) return p;
  const notes = on ? [...(p.notes ?? []), note] : (p.notes ?? []).filter((x) => x !== note);
  const { notes: _n, ...rest } = p;
  return notes.length ? { ...rest, notes } : rest;
}
