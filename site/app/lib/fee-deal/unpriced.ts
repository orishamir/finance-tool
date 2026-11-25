// A fee the reading leaves out because a figure of its price is not given yet (method §10.6, `feePriced`): the cases the reading reads
// it in whose price is not given, and the figure missing there. Its card's note, the cell of that case and the reading's tab for its
// action all say it from here.
import { feeOf, type ReadFee } from "./cases";
import { mainFigure, pricePriced, pricesFrom, type MonthKey, type Price } from "./model";
import type { FormId } from "./shapes";

/**
 * The figure a price is missing, as the page names it: its rate (a share of an action or of what is held), its sum per unit, its sum (per
 * action or per period), or another figure of its price (a flat price, a discount, a third party's figure, a refund).
 */
export type Missing = "rate" | "unit" | "sum" | "price";

/** The main figure of a price of form `form`, as `Missing` names it; none for a free price, which has no figure. */
export const missingOfForm = (form: FormId): Exclude<Missing, "price"> | null =>
  form === "action" || form === "held" ? "rate" : form === "perUnit" ? "unit" : form === "perAction" || form === "sum" || form === "perDollar" ? "sum" : null;

/** The figure a price not given is missing: its main figure where that is blank, else another of its figures. */
export const missingOf = (p: Price): Missing => (mainFigure(p)?.blank ? (missingOfForm(p.form) ?? "price") : "price");

/** Where a fee left out for a price not given is missing it: the cases the reading reads it in with a price not given, and the figure. */
export interface Unpriced {
  /** The cases, in the fee's order; none for a fee whose price changes by nothing. */
  cases: string[];
  /** The figure missing in the first price not given, from the reading's month on. */
  missing: Missing;
}

/**
 * Where fee `id`, left out of the reading for a price not given (`DealRead.unpriced`), is missing it: of its read fees (`readFees`), the
 * cases whose prices from `from` on are not all given, and the figure missing in the first of those prices.
 */
export function unpricedOf(fees: readonly ReadFee[], id: string, from: MonthKey): Unpriced {
  const mine = fees.filter((f) => feeOf(f) === id);
  const prices = (f: ReadFee): Price[] => [f.stages, ...(f.sale ? [f.sale] : [])].flatMap((st) => pricesFrom(st, from).map((s) => s.price));
  const blank = mine.filter((f) => prices(f).some((p) => !pricePriced(p)));
  const first = blank.flatMap(prices).find((p) => !pricePriced(p));
  return { cases: [...new Set(blank.flatMap((f) => (f.read?.case ? [f.read.case] : [])))], missing: first ? missingOf(first) : "price" };
}
