// A flat price for a small action, folded into the size of the action (method §10.6; founder, 2026-11-19): a price list's "מחיר קבוע 1.50 $
// עד 100 $" is the price of every action up to that sum, which is what the first step of a range of the size of the action says. F-12
// reads a price on an action as `fee(a) = flat` where `a ≤ upTo`, else the rate held to its bounds; F-114 cuts a range at its tops, a step
// at most its top. So a price with a flat price reads the same as the fee changing by the size of the action at `upTo`: a sum on each
// action up to it, the price without its flat price above it. A template fills it so, and the page draws it as the size's columns. Pure.
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
 * `fee`, its flat prices for a small action folded into the size of the action: the fee then changes by the size of the action too, cut at
 * each flat price's sum, each case with a flat price one case for each step, the rest any size. The fee is left as it is where it has no
 * flat price, or where the fold cannot say it the same way: a price that changes over time or prices a sale apart, a flat price not yet
 * typed, sums in the trade's currency, flat prices in two currencies, a fee that already changes by the size of the action or by three
 * things, or one that cannot be priced by a sum on each action.
 */
export function foldFlat<F extends AnyFee>(fee: F): F {
  const priced: Priced[] = hasCases(fee as Fee) ? (fee as Extract<F, { cases: Case[] }>).cases : [fee as Priced];
  const flats = priced.flatMap((x) => x.stages.map((s) => flatOf(s.price)).filter((p): p is FlatHolder => !!p));
  if (flats.length === 0) return fee;
  const by: By[] = hasCases(fee as Fee) ? (fee as Extract<F, { by: By[] }>).by : [];
  const currencies = new Set(flats.map((p) => p.currency ?? "ILS"));
  if (
    !priced.every(foldable) ||
    currencies.size > 1 ||
    by.length >= BY_MAX ||
    by.some((b) => b.kind === "actionSize") ||
    !conditionsFor(fee.kind).includes("actionSize") ||
    !takes(fee.kind, "perAction") ||
    (!capacity(fee.kind).fields.perAction?.includes("currency") && !currencies.has("ILS"))
  )
    return fee;
  const unit = [...currencies][0] as BoundCurrency;
  // the range's tops: each flat price's sum, once, in order, with the source of the first line that printed it
  const tops: Num[] = [];
  for (const p of flats) if (!tops.some((t) => t.v === p.flat!.upTo.v)) tops.push(p.flat!.upTo);
  tops.sort((a, b) => a.v - b.v);
  const range = { kind: "actionSize" as const, unit, tops };
  const steps = tops.length + 1;
  // a case with a flat price is a case for each step: up to its sum the flat sum, above it the rest; any other case is any size
  const split = (x: Priced, when: When[], id: string): Case[] => {
    const p = flatOf(x.stages[0]?.price ?? { form: "free" });
    if (!p) return [{ ...x, id, when: [...when, "any"] } as Case];
    return Array.from({ length: steps }, (_, i) => ({ id: i === 0 ? id : `${id}-s${i}`, when: [...when, i], stages: [{ price: stepPrice(p, i < tops.length && tops[i]!.v <= p.flat!.upTo.v) }] }));
  };
  if (hasCases(fee as Fee)) {
    const f = fee as Extract<F, { cases: Case[] }>;
    return { ...f, by: [...f.by, range], cases: f.cases.flatMap((c) => split(c, c.when, c.id).map((n, k) => (k === 0 ? { ...c, ...n } : n))) } as F;
  }
  const { stages, sale: _sale, ...head } = fee as Extract<F, { stages: unknown }>;
  return { ...head, by: [range], cases: split({ stages }, [], "c1") } as unknown as F;
}
