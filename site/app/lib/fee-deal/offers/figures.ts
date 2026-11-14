// Where each figure of a price sits (method §10.6, F-110, F-116, F-117): its rate or sum, its bounds, its percent maximum, its flat price's
// two figures, a discount's share, a third party's figure and bounds, a refund. Reading, setting and owning a figure, and listing a price's
// figures, all go through this table. Pure; it imports no code of the model, so the model can list a price's figures through it.
import type { BoundCurrency, Num, Price, ThirdPrice } from "../core";
import { boundsAction, byAmount, byRate, charged, hasBounds, onAction } from "./capabilities";

/**
 * A figure of a price the screen edits: its rate, its bounds, its sum (a sum per unit's among them), its percent maximum (`cap`), its
 * flat price's two figures (`flat`, the price; `upTo`, the sum it holds up to), a discount's share (`discount`, F-116), a third party's
 * rate or sum and bounds (`third`, `thirdMin`, `thirdMax`, F-117), a refund (`refund`), and a held share's maximum on each security
 * (`perSecurity`), the last two §10.6's stated parts.
 */
export type Figure = "rate" | "min" | "max" | "amount" | "cap" | "flat" | "upTo" | "discount" | "third" | "thirdMin" | "thirdMax" | "refund" | "perSecurity";

/** A key a figure is kept under, in the price or in its part (a flat price's two, a discount's share, a third party's figure and bounds). */
export type FigureKey = "rate" | "amount" | "min" | "max" | "cap" | "upTo" | "pct" | "perSecurity" | "refund";

/** What a figure is counted in: a percent, or a sum in a currency (the shekel where none is named). */
export type FigureUnit = { pct: true } | { currency: BoundCurrency | undefined };

interface FigureDef {
  /** The figure as it stands, with its source; none where the price has no place for it, or has not the part that holds it. */
  get: (p: Price) => Num | undefined;
  /** The price with the figure set (`n`), or taken away (`undefined`); a price with no place for it is left as it is. */
  set: (p: Price, n: Num | undefined) => Price;
  /** What emptying the figure does: a bound or a percent maximum goes, any other figure stands blank (`Num.blank`) until typed. */
  emptied: "removed" | "blank";
  /** Whether the price has a place for the figure now, given or not (an optional bound's box stands empty). */
  placed: (p: Price) => boolean;
  /** What the figure is counted in, for its box's sign. */
  unit: (p: Price) => FigureUnit;
  /** The key the figure is kept under in the price, or in its part (a link writes every figure under these keys as a number). */
  keys: readonly FigureKey[];
}

const PCT: FigureUnit = { pct: true };
/** The price's own currency, for a sum (a share of what is held and a sum per period are in shekels). */
const inPrice = (p: Price): FigureUnit => ({ currency: onAction(p) ? p.currency : undefined });

/** A key of a price set to a figure, or taken away. */
function keyed<P extends object>(p: P, key: string, n: Num | undefined): P {
  const next = { ...p, [key]: n } as Record<string, unknown>;
  if (n === undefined) delete next[key];
  return next as P;
}

/** A third party's price, where the price has one with a figure. */
const thirdOf = (p: Price): ThirdPrice | undefined => (onAction(p) ? p.third?.price : undefined);

/** A third party's price with one figure set; its bounds only where it has them (a sum per action has none). */
const setThird = (p: Price, fn: (t: ThirdPrice) => ThirdPrice): Price => (onAction(p) && p.third?.price ? { ...p, third: { ...p.third, price: fn(p.third.price) } } : p);

/** A third party's bound (F-117): its minimum or maximum, none on a sum per action. */
const thirdBound = (key: "min" | "max"): FigureDef => ({
  get: (p) => {
    const t = thirdOf(p);
    return t && t.form !== "perAction" ? t[key] : undefined;
  },
  set: (p, n) => setThird(p, (t) => (t.form === "perAction" ? t : keyed(t, key, n))),
  emptied: "removed",
  placed: (p) => {
    const t = thirdOf(p);
    return !!t && t.form !== "perAction";
  },
  unit: (p) => ({ currency: thirdOf(p)?.currency }),
  keys: [key],
});

/** A bound of a price (its minimum or maximum, per action or per charge), its sum in the price's currency. */
const bound = (key: "min" | "max"): FigureDef => ({
  get: (p) => (hasBounds(p) ? p[key] : undefined),
  set: (p, n) => (hasBounds(p) ? keyed(p, key, n) : p),
  emptied: "removed",
  placed: hasBounds,
  unit: inPrice,
  keys: [key],
});

/** A figure of a flat price for a small action: its price (`amount`) or the sum it holds up to (`upTo`). */
const flat = (key: "amount" | "upTo"): FigureDef => ({
  get: (p) => (boundsAction(p) ? p.flat?.[key] : undefined),
  set: (p, n) => (boundsAction(p) && p.flat && n ? { ...p, flat: { ...p.flat, [key]: n } } : p),
  emptied: "blank",
  placed: (p) => boundsAction(p) && !!p.flat,
  unit: inPrice,
  keys: [key],
});

export const FIGURES: Readonly<Record<Figure, FigureDef>> = {
  rate: {
    get: (p) => (byRate(p) ? p.rate : undefined),
    set: (p, n) => (byRate(p) && n ? { ...p, rate: n } : p),
    emptied: "blank",
    placed: byRate,
    unit: () => PCT,
    keys: ["rate"],
  },
  amount: {
    get: (p) => (byAmount(p) ? p.amount : undefined),
    set: (p, n) => (byAmount(p) && n ? { ...p, amount: n } : p),
    emptied: "blank",
    placed: byAmount,
    unit: inPrice,
    keys: ["amount"],
  },
  min: bound("min"),
  max: bound("max"),
  cap: {
    get: (p) => (onAction(p) ? p.cap : undefined),
    set: (p, n) => (onAction(p) ? keyed(p, "cap", n) : p),
    emptied: "removed",
    placed: onAction,
    unit: () => PCT,
    keys: ["cap"],
  },
  flat: flat("amount"),
  upTo: flat("upTo"),
  discount: {
    get: (p) => (onAction(p) ? p.discount?.pct : undefined),
    set: (p, n) => (onAction(p) && p.discount && n ? { ...p, discount: { ...p.discount, pct: n } } : p),
    emptied: "blank",
    placed: (p) => onAction(p) && !!p.discount,
    unit: () => PCT,
    keys: ["pct"],
  },
  third: {
    get: (p) => {
      const t = thirdOf(p);
      return t && (t.form === "action" ? t.rate : t.amount);
    },
    set: (p, n) => (n ? setThird(p, (t) => (t.form === "action" ? { ...t, rate: n } : { ...t, amount: n })) : p),
    emptied: "blank",
    placed: (p) => !!thirdOf(p),
    unit: (p) => (thirdOf(p)?.form === "action" ? PCT : { currency: thirdOf(p)?.currency }),
    keys: ["rate", "amount"],
  },
  thirdMin: thirdBound("min"),
  thirdMax: thirdBound("max"),
  perSecurity: {
    get: (p) => (p.form === "held" ? p.perSecurity : undefined),
    set: (p, n) => (p.form === "held" ? keyed(p, "perSecurity", n) : p),
    emptied: "removed",
    placed: (p) => p.form === "held",
    unit: () => ({ currency: undefined }),
    keys: ["perSecurity"],
  },
  refund: {
    get: (p) => (charged(p) ? p.refund : undefined),
    set: (p, n) => (charged(p) && p.refund !== undefined && n ? ({ ...p, refund: n } as Price) : p),
    emptied: "blank",
    placed: (p) => charged(p) && p.refund !== undefined,
    unit: inPrice,
    keys: ["refund"],
  },
};

export const FIGURE_IDS = Object.keys(FIGURES) as Figure[];
