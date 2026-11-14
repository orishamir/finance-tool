// What a price's form can hold (method §10.6, F-110): narrow questions on a price or a form, each answered from one list of forms. This is
// the only place a list of forms appears; everything else asks these. Pure; no Hebrew.
import type { BoundCurrency, Price } from "../model";
import type { FormId } from "../shapes";

/** A price on an action: a share of each action, a sum for each unit, a sum on each action. */
export type OnActionPrice = Extract<Price, { form: "action" | "perUnit" | "perAction" }>;
/** A price that bounds an action: a share of each action or a sum for each unit, which may have bounds per action and a flat price. */
export type ActionBoundedPrice = Extract<Price, { form: "action" | "perUnit" }>;
/** A price with a minimum and a maximum: per action (a share, a sum per unit) or per charge (a share of what is held). */
export type BoundedPrice = Extract<Price, { form: "action" | "perUnit" | "held" }>;
/** A price whose main figure is a rate: a share of each action, a share of what is held. */
export type RatePrice = Extract<Price, { form: "action" | "held" }>;
/** A price whose main figure is a sum: a sum for each unit, a sum per period, a sum on each action. */
export type AmountPrice = Extract<Price, { form: "perUnit" | "sum" | "perAction" }>;
/** A price that charges something: every form but free. */
export type ChargedPrice = Exclude<Price, { form: "free" }>;

const ON_ACTION: readonly FormId[] = ["action", "perUnit", "perAction"];
const BOUNDS_ACTION: readonly FormId[] = ["action", "perUnit"];
const BOUNDED: readonly FormId[] = ["action", "perUnit", "held"];
const BY_RATE: readonly FormId[] = ["action", "held"];

/**
 * What a form's main figure is: a rate (a share of each action or of what is held), a sum (per period or on each action), or a sum for
 * each unit, which is neither. A change of form carries the figure only into a form whose figure is of the same kind.
 */
const FIGURE_KIND: Readonly<Record<Exclude<FormId, "free">, "rate" | "sum" | "unit">> = { action: "rate", held: "rate", sum: "sum", perAction: "sum", perUnit: "unit" };

/** Whether a form is on an action: it may carry a discount, a third party's fee, notes on an order, a percent maximum and a currency. */
export const formOnAction = (form: FormId): boolean => ON_ACTION.includes(form);
/** Whether a form bounds an action: its minimum, maximum and flat price price the action the same way in each such form. */
export const formBoundsAction = (form: FormId): boolean => BOUNDS_ACTION.includes(form);
/** Whether a form charges something. */
export const formCharged = (form: FormId): boolean => form !== "free";
/** Whether a form is charged on what is held or on the account: a share of what is held, a sum per period. */
export const formOnHolding = (form: FormId): boolean => formCharged(form) && !formOnAction(form);
/** Whether two forms' main figures are of the same kind (`FIGURE_KIND`). */
export const sameFigureKind = (a: FormId, b: FormId): boolean => a !== "free" && b !== "free" && FIGURE_KIND[a] === FIGURE_KIND[b];

/** Whether a price is on an action (`formOnAction`). */
export const onAction = (p: Price): p is OnActionPrice => formOnAction(p.form);
/** Whether a price bounds an action (`formBoundsAction`): it may have bounds per action and a flat price. */
export const boundsAction = (p: Price): p is ActionBoundedPrice => formBoundsAction(p.form);
/** Whether a price may have a minimum and a maximum, per action or per charge. */
export const hasBounds = (p: Price): p is BoundedPrice => BOUNDED.includes(p.form);
/** Whether a price may have a percent maximum: a share of an action's, a sum per unit's, a sum per action's. */
export const hasCap = (p: Price): p is OnActionPrice => onAction(p);
/** Whether a price may have a flat price for a small action. */
export const hasFlat = (p: Price): p is ActionBoundedPrice => boundsAction(p);
/** Whether a price's sums may be in a currency other than the shekel. */
export const hasCurrency = (p: Price): p is OnActionPrice => onAction(p);
/** Whether a price charges something, and so may be offset against another fee or carry a refund. */
export const charged = (p: Price): p is ChargedPrice => formCharged(p.form);
/** Whether a price's main figure is a rate. */
export const byRate = (p: Price): p is RatePrice => BY_RATE.includes(p.form);
/** Whether a price's main figure is a sum. */
export const byAmount = (p: Price): p is AmountPrice => charged(p) && !byRate(p);

/**
 * The currency that prices something in a price (F-110, F-112): a sum per unit's and a sum per action's always, a share's only with a bound
 * or a flat price typed; none for the shekel. A currency that prices nothing is not carried into another form.
 */
export function pricedCurrency(p: Price): BoundCurrency | undefined {
  if (!hasCurrency(p) || !p.currency || p.currency === "ILS") return undefined;
  return !byRate(p) || p.min || p.max || p.flat ? p.currency : undefined;
}
