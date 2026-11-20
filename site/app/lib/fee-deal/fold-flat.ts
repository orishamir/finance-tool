// A flat price for a small action, folded into the size of the action (method §10.6; founder, 2026-11-19): a price list's "מחיר קבוע 1.50 $
// עד 100 $" is the price of every action up to that sum, which is what the first step of a range of the size of the action says. F-12
// reads a price on an action as `fee(a) = flat` where `a ≤ upTo`, else the rate held to its bounds; F-114 cuts a range at its tops, a step
// at most its top. So a price with a flat price reads the same as the fee changing by the size of the action at `upTo`: a sum on each
// action up to it, the price without its flat price above it. A template fills it so, and the page draws it as the size's columns. The same
// fold fills a conversion a list prices by its size in steps (data-schema §3.6a item 3: free up to 10 $, half price up to 100 $; a lower
// spread above 15,000 $), each step one step of the size of the action, given by the template (`SizeSteps`). Pure.
import { capacity, takes } from "./offers/capacity";
import { BY_MAX, conditionsFor } from "./offers/conditions";
import { hasCases, type BoundCurrency, type By, type Case, type Fee, type Num, type Price, type Priced, type When } from "./model";

/** A price that may hold a flat price: a share of an action or a sum per unit. */
type FlatHolder = Extract<Price, { form: "action" | "perUnit" }>;
const flatOf = (p: Price): FlatHolder | null => ((p.form === "action" || p.form === "perUnit") && p.flat ? p : null);

/** A fee as a template fills it: without its id, or with one. */
type AnyFee = Fee | Omit<Fee, "id">;

/**
 * The price of one step of the size of the action, for a price with a flat price up to `upTo`: up to it (`small`), the flat sum on each
 * action, in the price's currency and with its parts (a discount, a third party's fee, notes), since the flat price is the whole fee there;
 * above it, the price without its flat price.
 */
function stepPrice(p: FlatHolder, small: boolean): Price {
  const { flat, form: _form, min: _min, max: _max, cap: _cap, ...rest } = p;
  if (!small) {
    const { flat: _f, ...above } = p;
    return above;
  }
  const { rate: _r, amount: _a, ...parts } = rest as typeof rest & { rate?: Num; amount?: Num };
  return { ...parts, form: "perAction", amount: flat!.amount };
}

/** Whether a fee's prices with a flat price can be folded: each alone over time with no sale apart, its figures given, its sums in its own currency. */
function foldable(x: Priced): boolean {
  const flats = x.stages.filter((s) => flatOf(s.price));
  if (flats.length === 0) return true;
  if (x.stages.length > 1 || x.sale) return false;
  const p = flatOf(x.stages[0]!.price)!;
  return !p.flat!.amount.blank && !p.flat!.upTo.blank && !p.inTrade;
}

/**
 * A price's steps of the size of the action as a list prints them: each step's top, in `unit`, and its price up to it from the step below,
 * in order; and the price above the last (`above`). A template gives them for a case (or for a fee with no cases, `null`) from the line it
 * read; null where the line prints none.
 */
export interface SizeSteps {
  unit: BoundCurrency;
  steps: { upTo: Num; price: Price }[];
  above: Price;
}

/** A case's steps: those the template gives (on a price alone over time, with no sale apart), else its flat price's one step, else none. */
function stepsOf(x: Priced, given: SizeSteps | null): SizeSteps | null {
  if (given) return x.stages.length === 1 && !x.sale ? given : null;
  const p = flatOf(x.stages[0]?.price ?? { form: "free" });
  if (!p || x.stages.length > 1) return null;
  return { unit: p.currency ?? "ILS", steps: [{ upTo: p.flat!.upTo, price: stepPrice(p, true) }], above: stepPrice(p, false) };
}

/**
 * `fee`, its flat prices for a small action, and the steps by size a template gives for a case (`given`, by case id, `null` for a fee with
 * no cases), folded into the size of the action: the fee then changes by the size of the action too, cut at each step's top (a flat
 * price's sum), each case with steps one case for each step, the rest any size. The fee is left as it is where it has no
 * flat price, or where the fold cannot say it the same way: a price that changes over time or prices a sale apart, a flat price not yet
 * typed, sums in the trade's currency, steps in two currencies (a range has one unit), a fee that already changes by the size of the action
 * or by three things, or one that cannot be priced by a sum on each action where a step is one.
 */
export function foldFlat<F extends AnyFee>(fee: F, given: (caseId: string | null) => SizeSteps | null = () => null): F {
  const cased = hasCases(fee as Fee);
  const priced: Priced[] = cased ? (fee as Extract<F, { cases: Case[] }>).cases : [fee as Priced];
  const stepped = new Map(priced.map((x) => [x, stepsOf(x, given(cased ? (x as Case).id : null))]));
  const all = [...stepped.values()].filter((x): x is SizeSteps => !!x);
  if (all.length === 0) return fee;
  const by: By[] = cased ? (fee as Extract<F, { by: By[] }>).by : [];
  const currencies = new Set(all.map((x) => x.unit));
  // the sums on each action the steps price (a flat price), which the fee must take, in their currency
  const sums = all.flatMap((x) => [...x.steps.map((st) => st.price), x.above]).flatMap((p) => (p.form === "perAction" ? [p.currency ?? "ILS"] : []));
  if (
    !priced.every(foldable) ||
    currencies.size > 1 ||
    by.length >= BY_MAX ||
    by.some((b) => b.kind === "actionSize") ||
    !conditionsFor(fee.kind).includes("actionSize") ||
    (sums.length > 0 && !takes(fee.kind, "perAction")) ||
    (sums.some((c) => c !== "ILS") && !capacity(fee.kind).fields.perAction?.includes("currency"))
  )
    return fee;
  const unit = [...currencies][0] as BoundCurrency;
  // the range's tops: each step's top, once, in order, with the source of the first line that printed it
  const tops: Num[] = [];
  for (const x of all) for (const st of x.steps) if (!tops.some((t) => t.v === st.upTo.v)) tops.push(st.upTo);
  tops.sort((a, b) => a.v - b.v);
  const range = { kind: "actionSize" as const, unit, tops };
  const steps = tops.length + 1;
  // step `i` of the range (above the top before it, at most its own) is priced by the case's first step whose top it does not pass
  const priceAt = (x: SizeSteps, i: number): Price => (i < tops.length ? (x.steps.find((st) => tops[i]!.v <= st.upTo.v)?.price ?? x.above) : x.above);
  // a case with steps is a case for each step of the range; any other case is any size
  const split = (x: Priced, when: When[], id: string): Case[] => {
    const own = stepped.get(x);
    if (!own) return [{ ...x, id, when: [...when, "any"] } as Case];
    return Array.from({ length: steps }, (_, i) => ({ id: i === 0 ? id : `${id}-s${i}`, when: [...when, i], stages: [{ price: priceAt(own, i) }] }));
  };
  if (hasCases(fee as Fee)) {
    const f = fee as Extract<F, { cases: Case[] }>;
    return { ...f, by: [...f.by, range], cases: f.cases.flatMap((c) => split(c, c.when, c.id).map((n, k) => (k === 0 ? { ...c, ...n } : n))) } as F;
  }
  const { stages: _stages, sale: _sale, ...head } = fee as Extract<F, { stages: unknown }>;
  return { ...head, by: [range], cases: split(priced[0]!, [], "c1") } as unknown as F;
}
