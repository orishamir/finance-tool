// A deal read for the reading's picks (method §10.6, F-114 and F-115): each fee whose price changes by things is read in the case the picks
// give it, and a price that changes by a size read across sizes as one fee per step, charged on that step's sizes alone. A fee whose price
// changes by nothing is read as it is. What the views read (parts.ts) is the result: plain fees with their prices over time.
import { caseFor, stepOf, type CaseCond } from "@finance-tool/engine";
import { BOUND_CURRENCIES, pickKey, pickedPlace, hasCases, isRange, type BoundCurrency, type Price, type Stage, type By, type Case, type CasesFee, type Fee, type FeeDeal, type Num, type ReadPick, type RangeBy, type SlimFee, type When } from "./model";
import { CURRENCY_IDS, holdsFunds, onHolding } from "./shapes";
import { readAcross } from "./offers/conditions";

/**
 * Where a read fee comes from (F-114, F-115): the deal's fee (`of`), the case it is read in where the fee has cases, and, where its price
 * changes by a size read across sizes, the stretch it is charged on (`step`: what it is charged on, its bottom and top as the range's
 * figures, none for the first step's bottom and the last's top, and their currency).
 */
export interface ReadOf {
  of: string;
  case?: string;
  step?: { on: "action" | "held"; from: Num | null; to: Num | null; currency: BoundCurrency };
}

/** A fee as the reading reads it: a fee whose price changes by nothing, with where it comes from where it was read from a case. */
export type ReadFee = SlimFee & { read?: ReadOf };

/** The deal fee a read fee is from: its own id, or the fee it was read from. */
export const feeOf = (f: ReadFee): string => f.read?.of ?? f.id;

/** A range's pick as the reading keeps it: up to a top (`<=N`), or above the last (`>N`). */
export const stepPick = (top: number, above = false): string => `${above ? ">" : "<="}${top}`;

/** The step of a range a pick of it holds (`stepPick`): the first whose top holds the picked top, above it for "above"; null where it is not one. */
export function stepForPick(tops: readonly number[], is: string): number | null {
  const m = /^(<=|>)(\d+(?:\.\d+)?)$/.exec(is);
  if (!m) return null;
  const x = Number(m[2]);
  if (m[1] === "<=") return stepOf(tops, x);
  const k = tops.findIndex((t) => t > x);
  return k < 0 ? tops.length : k;
}

/**
 * Whether a fee is charged on what is held or on the account, by its prices' form (F-115, F-111): every price of it that is not free is a
 * share of what is held or a sum per period. A fee whose every price is free is placed by its kind's usual form.
 */
export function chargedOnHolding(fee: Fee): boolean {
  const forms = (hasCases(fee) ? fee.cases : [fee]).flatMap((x) => [...x.stages, ...(x.sale ?? [])]).map((s) => s.price.form).filter((f) => f !== "free");
  return forms.length ? forms.every((f) => f === "held" || f === "sum") : onHolding(fee.kind);
}

/** A thing whose values the reading picks: every one but a size read across sizes (F-115). */
export const picked = (fee: Fee, b: By): boolean => !(isRange(b) && readAcross(chargedOnHolding(fee), b.kind));

/** The first value a case names for thing `t`, where it names one (a range's step as its pick). */
function valueOf(fee: CasesFee, c: Case, t: number): string | null {
  const w = c.when[t]!;
  const b = fee.by[t]!;
  if (w === "any") return null;
  if (typeof w === "number") return isRange(b) ? (w < b.tops.length ? stepPick(b.tops[w]!.v) : stepPick(b.tops.at(-1)!.v, true)) : null;
  return w[0] ?? null;
}

/**
 * The currency a conversion is read for (F-114): not a pick of its own but that of what is bought, where it is foreign: its currency where
 * the site names it (dollars, euros, pounds), else "other". Null where what is bought is in shekels or not said: then no currency is
 * picked, and a conversion priced by currency is read only in a case for any currency.
 */
function conversionCurrency(fees: readonly Fee[], picks: readonly ReadPick[]): string | null {
  const what = picks.find((p) => p.by === "what");
  const place = what ? pickedPlace(fees, what) : null;
  if (!place || place.currency === "ILS") return null;
  return place.currency !== null && CURRENCY_IDS.includes(place.currency) ? place.currency : "other";
}

/**
 * The reading's picks as F-114 reads them: the deal's own (`readFor`), and for every other thing its fees change by and the reading picks,
 * its start: the person's own track (the track of a case marked as theirs), and otherwise the first case that names a value, in the order
 * the fees name the things. The currency is never the deal's own pick nor a case's: it is what is bought's (`conversionCurrency`), last.
 */
export function picksOf(deal: Pick<FeeDeal, "fees" | "readFor">): ReadPick[] {
  const out: ReadPick[] = (deal.readFor ?? []).filter((p) => p.by !== "currency");
  const has = (key: string) => out.some((p) => p.by === key);
  for (const fee of deal.fees) {
    if (!hasCases(fee)) continue;
    fee.by.forEach((b, t) => {
      const key = pickKey(b);
      if (b.kind === "currency" || has(key) || !picked(fee, b)) return;
      let is: string | null = null;
      if (b.kind === "track") {
        const mine = fee.cases.find((c) => c.mine);
        is = mine ? valueOf(fee, mine, t) : null;
      }
      is ??= fee.cases.map((c) => valueOf(fee, c, t)).find((v) => v !== null) ?? null;
      if (is !== null) out.push({ by: key, is });
    });
  }
  const currency = deal.fees.some((f) => hasCases(f) && f.by.some((b) => b.kind === "currency")) ? conversionCurrency(deal.fees, out) : null;
  if (currency !== null) out.push({ by: "currency", is: currency });
  return out;
}

/** A case's conditions as the engine reads them (F-114). */
const condsOf = (c: Case): CaseCond[] => c.when.map((w: When): CaseCond => (w === "any" ? { any: true } : typeof w === "number" ? { step: w } : { values: w }));

/** A fee read from one case: the case's prices under the fee's id (or a step's), with where it comes from. */
function fromCase(fee: CasesFee, c: Case, id: string, step?: ReadOf["step"]): ReadFee {
  return { id, kind: fee.kind, ...(fee.name !== undefined ? { name: fee.name } : {}), stages: c.stages, ...(c.sale ? { sale: c.sale } : {}), read: { of: fee.id, case: c.id, ...(step ? { step } : {}) } };
}

/**
 * F-114, F-115 A fee as the reading reads it for the picks: a fee whose price changes by nothing, as it is; a fee with cases, in the case
 * the picks give it; where its price changes by a size read across sizes, one fee per stretch of steps read in one case (neighbouring steps
 * in the same case are one stretch, and a single stretch is the fee itself). Null where the picks give it no case, or a step none.
 */
export function readFee(fee: Fee, picks: readonly ReadPick[]): ReadFee[] | null {
  if (!hasCases(fee)) return [fee];
  const across = fee.by.findIndex((b) => !picked(fee, b));
  const vector = fee.by.map((b, t): string | number => {
    if (t === across) return 0;
    const is = picks.find((p) => p.by === pickKey(b))?.is;
    if (isRange(b)) return is === undefined ? 0 : (stepForPick(b.tops.map((n) => n.v), is) ?? -1);
    return is ?? "";
  });
  const conds = fee.cases.map(condsOf);
  if (across < 0) {
    const k = caseFor(conds, vector);
    return k === null ? null : [fromCase(fee, fee.cases[k]!, fee.id)];
  }
  const range = fee.by[across] as RangeBy;
  const steps: number[] = [];
  for (let s = 0; s <= range.tops.length; s++) {
    const k = caseFor(conds, vector.map((v, t) => (t === across ? s : v)));
    if (k === null) return null;
    steps.push(k);
  }
  // neighbouring steps read in one case are one stretch
  const stretches: { k: number; from: number; to: number }[] = [];
  steps.forEach((k, s) => {
    const last = stretches.at(-1);
    if (last && last.k === k) last.to = s;
    else stretches.push({ k, from: s, to: s });
  });
  if (stretches.length === 1) return [fromCase(fee, fee.cases[stretches[0]!.k]!, fee.id)];
  // the size of the action is read across on an action, the size of the portfolio on what is held (F-115)
  const on = range.kind === "actionSize" ? "action" : "held";
  const currency = range.unit as BoundCurrency;
  return stretches.map((x, j) =>
    fromCase(fee, fee.cases[x.k]!, `${fee.id}-s${j}`, { on, from: x.from === 0 ? null : range.tops[x.from - 1]!, to: x.to < range.tops.length ? range.tops[x.to]! : null, currency }),
  );
}

/**
 * The currency an action is made in, for a price whose sums are in it (`inTrade`): what is bought's, where the picks name it and it is one
 * a price's sums may be in; null where the deal does not know it (nothing bought is picked, or its currency is not named, "בשאר העולם").
 */
export function tradeCurrency(fees: readonly Fee[], picks: readonly ReadPick[]): BoundCurrency | null {
  const what = picks.find((p) => p.by === "what");
  const place = what ? pickedPlace(fees, what) : null;
  return place?.currency && (BOUND_CURRENCIES as readonly string[]).includes(place.currency) ? (place.currency as BoundCurrency) : null;
}

/** A price whose sums are in the action's currency, in that currency (the shekel left unsaid); any other price as it is. */
function inCurrency(p: Price, currency: BoundCurrency): Price {
  if (!("inTrade" in p) || !p.inTrade) return p;
  const { inTrade: _t, currency: _c, ...rest } = p;
  return (currency === "ILS" ? rest : { ...rest, currency }) as Price;
}

/** Whether a read fee has a price whose sums are in the action's currency. */
const asksTrade = (f: ReadFee): boolean => [...f.stages, ...(f.sale ?? [])].some((s) => "inTrade" in s.price && !!s.price.inTrade);

/**
 * The deal read for its picks: the fees read (`readFee`), in the deal's order, each price whose sums are in the action's currency in what is
 * bought's (`tradeCurrency`); the ids of the fees the picks give no case (`unmatched`), and among them the ones read in a case whose sums
 * are in a currency the deal does not know (`noCurrency`).
 */
export function readFees(deal: FeeDeal): { fees: ReadFee[]; unmatched: string[]; noCurrency: string[]; picks: ReadPick[] } {
  const picks = picksOf(deal);
  const trade = tradeCurrency(deal.fees, picks);
  const fees: ReadFee[] = [];
  const unmatched: string[] = [];
  const noCurrency: string[] = [];
  const resolve = (stages: readonly Stage[]): Stage[] => stages.map((s) => ({ ...s, price: inCurrency(s.price, trade!) }));
  for (const fee of deal.fees) {
    const read = readFee(fee, picks);
    if (!read) unmatched.push(fee.id);
    else if (read.some(asksTrade) && !trade) {
      unmatched.push(fee.id);
      noCurrency.push(fee.id);
    } else fees.push(...(trade ? read.map((f) => (asksTrade(f) ? { ...f, stages: resolve(f.stages), ...(f.sale ? { sale: resolve(f.sale) } : {}) } : f)) : read));
  }
  return { fees, unmatched, noCurrency, picks };
}

/**
 * Whether what the deal is read for is bought in a currency other than the shekel (F-114, F-111's `foreign`): the pick of what is bought,
 * by where it is bought and its currency, for a kind that holds funds.
 */
export function isForeign(deal: Pick<FeeDeal, "kind" | "fees">, picks: readonly ReadPick[]): boolean {
  if (!holdsFunds(deal.kind)) return false;
  const what = picks.find((p) => p.by === "what");
  const place = what ? pickedPlace(deal.fees, what) : null;
  return !!place && place.currency !== "ILS";
}
