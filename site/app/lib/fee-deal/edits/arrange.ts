// The changes the fee page makes to how a fee's cases and a deal's fees stand (F-114), each a pure function: a table's column or a grid's
// row or column moved, a value of a thing taken away with its cases, a ladder's step taken away into its neighbour, a row or column
// duplicated, the two things of a grid swapped, and the deal's fees put in the person's order. A move sets ranks (`Rank`), the page's
// order, and never the order the reading reads (F-114 reads a fee's cases and the deal's fees in their own order), so it changes no reading.
import { byRank, copiedPriced, hasCases, isRange, NAME_MAX, namesPlaces, newCaseId, spansWithout, type By, type Case, type CasesFee, type Fee, type FeeDeal, type Priced, type When } from "../model";
import { valueKey } from "../layout";
import { WHAT_VALUES } from "../shapes";

/** The values of thing `t` in the order a grid stands them: the order the cases, as the page shows them (`byRank`), first name them. */
function valuesOf(fee: CasesFee, t: number): string[] {
  return [...new Set(byRank(fee.cases).map((c) => valueKey(c.when[t]!)))];
}

/** A fee whose cases stand on the page in the order of `shown` (case ids): each takes its place there as its rank. */
const ranked = (fee: CasesFee, shown: readonly string[]): CasesFee => ({ ...fee, cases: fee.cases.map((c) => ({ ...c, rank: shown.indexOf(c.id) })) });

/** A list moved: its item at `from` put at `to`. */
function moved<T>(list: readonly T[], from: number, to: number): T[] {
  const out = [...list];
  const [x] = out.splice(from, 1);
  out.splice(Math.max(0, Math.min(to, out.length)), 0, x!);
  return out;
}

/**
 * A fee whose case `caseId` stands where case `at` stands on the page now (`byRank`), the cases between them moving one place toward where
 * it was: a table's column moved. A range's steps keep their order.
 */
export function moveCase(fee: Fee, caseId: string, at: string): Fee {
  if (!hasCases(fee) || fee.by.length !== 1 || isRange(fee.by[0]!)) return fee;
  const shown = byRank(fee.cases).map((c) => c.id);
  const from = shown.indexOf(caseId), to = shown.indexOf(at);
  if (from < 0 || to < 0 || from === to) return fee;
  return ranked(fee, moved(shown, from, to));
}

/**
 * A fee whose value `key` (`valueKey`) of thing `t` stands where its value `at` stands on the page now (`valuesOf`), the values between
 * them moving one place toward where it was: a grid's row or column moved. The cases
 * are put in order by each thing's values in turn (the first thing's first), the moved thing's in its new order, so every other thing's
 * values keep theirs where each row names every column. A range's values keep their order (they ascend).
 */
export function moveValue(fee: Fee, t: number, key: string, at: string): Fee {
  if (!hasCases(fee) || !fee.by[t] || isRange(fee.by[t]!)) return fee;
  const orders = fee.by.map((_, j) => valuesOf(fee, j));
  const from = orders[t]!.indexOf(key), to = orders[t]!.indexOf(at);
  if (from < 0 || to < 0 || from === to) return fee;
  orders[t] = moved(orders[t]!, from, to);
  const place = (c: Case) => fee.by.map((_, j) => orders[j]!.indexOf(valueKey(c.when[j]!)));
  const shown = byRank(fee.cases).map((c, i) => ({ c, i, r: place(c) })).sort((a, b) => {
    for (let j = 0; j < a.r.length; j++) if (a.r[j] !== b.r[j]) return a.r[j]! - b.r[j]!;
    return a.i - b.i;
  });
  return ranked(fee, shown.map((x) => x.c.id));
}

/**
 * A fee without value `key` of thing `t`: a grid's row or column taken away with the cases on it. A value whose cases are all the fee's
 * is never taken away: a fee needs a price. The undo keeps what this takes (undo.ts).
 */
export function removeValue(fee: Fee, t: number, key: string): Fee {
  if (!hasCases(fee) || !fee.by[t]) return fee;
  const cases = fee.cases.filter((c) => valueKey(c.when[t]!) !== key);
  if (cases.length === 0 || cases.length === fee.cases.length) return fee;
  return { ...fee, cases };
}

/** A case with its prices replaced (its id, values, mark and spans kept). */
const withPriced = (c: Case, x: Priced): Case => {
  const { stages: _s, sale: _sale, ...head } = c;
  return { ...head, stages: x.stages, ...(x.sale ? { sale: x.sale } : {}) };
};
const pricedOf = (c: Case): Priced => ({ stages: c.stages, ...(c.sale ? { sale: c.sale } : {}) });

/**
 * A fee whose range `t` loses step `step`, its sizes going to the step before it (the first step's to the step after it): the top between
 * them goes, and the cases on later steps move down one. For each set of the other things' values: where a case on the step it joins
 * stands, or else a case on any size (which reads the step it joins), that case reads the joined sizes too and the removed step's case
 * goes, as where two steps become none; where neither does, the removed step's case moves onto the step it joins, so no size is left
 * without a case. A case on any size stays as it is. A case that now
 * prices sizes the list priced in another case keeps a figure's source only where that case held it so (`copiedPriced`). A range of two
 * steps becomes none: the fee no longer changes by it, each set of the other values priced by its case on the other step, else its case on
 * any size, else the removed step's. The undo keeps what this takes (undo.ts).
 */
export function removeStep(fee: Fee, t: number, step: number): Fee {
  const b = fee.by?.[t];
  if (!hasCases(fee) || !b || !isRange(b) || !Number.isInteger(step) || step < 0 || step > b.tops.length) return fee;
  const others = (c: Case) => JSON.stringify(c.when.map((w, k) => (k === t ? null : valueKey(w))));
  const groups = new Map<string, Case[]>();
  for (const c of fee.cases) groups.set(others(c), [...(groups.get(others(c)) ?? []), c]);
  if (b.tops.length === 1) {
    const rest = 1 - step;
    const kept = [...groups.values()].map((g) => {
      const c = g.find((x) => x.when[t] === rest) ?? g.find((x) => x.when[t] === "any") ?? g.find((x) => x.when[t] === step)!;
      const merged = g.filter((x) => x !== c).reduce((x: Priced, o) => copiedPriced(x, o), pricedOf(c));
      return spansWithout(withPriced({ ...c, when: c.when.filter((_, k) => k !== t) }, merged), t);
    });
    if (fee.by.length === 1) {
      const one = kept[0]!;
      const { by: _b, cases: _c, ...head } = fee;
      return { ...head, stages: one.stages, ...(one.sale ? { sale: one.sale } : {}) } as Fee;
    }
    return { ...fee, by: fee.by.filter((_, k) => k !== t), cases: kept };
  }
  // the step whose sizes it joins, and the top between them, which goes
  const into = step === 0 ? 1 : step - 1;
  const gone = step === 0 ? 0 : step - 1;
  const cases = fee.cases.flatMap((c): Case[] => {
    const g = groups.get(others(c))!;
    const removed = g.find((x) => x.when[t] === step);
    if (c.when[t] === step) {
      // a case on the step it joins, or on any size, reads the joined sizes: this one goes
      if (g.some((x) => x.when[t] === into || x.when[t] === "any")) return [];
      // no case on the step it joins: this one moves there, now pricing sizes the list did not give it
      return [withPriced({ ...c, when: c.when.map((w, k) => (k === t ? into : w)) }, copiedPriced(pricedOf(c)))];
    }
    if (c.when[t] === into && removed) return [withPriced(c, copiedPriced(pricedOf(c), removed))];
    return [c];
  });
  return {
    ...fee,
    by: fee.by.map((x, k) => (k === t ? { ...b, tops: b.tops.filter((_, i) => i !== gone) } : x)) as By[],
    cases: cases.map((c) => {
      const w = c.when[t]!;
      return typeof w === "number" && w > step ? { ...c, when: c.when.map((x, k) => (k === t ? w - 1 : x)) } : c;
    }),
  };
}

/**
 * A fee with value `key` of list thing `t` duplicated (a grid's row or column, "שכפול"): each case on it copied right after it with its
 * prices, its value of `t` the person's own words `name` (for what is bought or held, a value of their own bought where the first value
 * is, in its currency). A name the thing has already leaves the fee as it is.
 */
export function duplicateValue(fee: Fee, t: number, key: string, name: string): Fee {
  const b = fee.by?.[t];
  // a value is no longer than a name may be (readWhen, readOwnPlace)
  const words = name.trim().slice(0, NAME_MAX).trim();
  if (!hasCases(fee) || !b || isRange(b) || !words) return fee;
  if (fee.cases.some((c) => Array.isArray(c.when[t]) && (c.when[t] as string[]).includes(words))) return fee;
  let by = fee.by;
  if (namesPlaces(b)) {
    if (Object.hasOwn(WHAT_VALUES, words) || b.own?.some((o) => o.name === words)) return fee;
    const first = fee.cases.find((c) => valueKey(c.when[t]!) === key)?.when[t];
    const v = Array.isArray(first) ? first[0]! : null;
    const own = v ? b.own?.find((o) => o.name === v) : undefined;
    const site = v && Object.hasOwn(WHAT_VALUES, v) ? WHAT_VALUES[v] : undefined;
    const place = own ? { place: own.place, currency: own.currency } : site ? { place: site.place, currency: site.currency } : null;
    if (!place) return fee;
    by = fee.by.map((x, k) => (k === t ? { ...b, own: [...(b.own ?? []), { name: words, ...place }] } : x)) as By[];
  }
  const copies = new Map<string, string>();
  const cases = fee.cases.flatMap((c): Case[] => {
    if (valueKey(c.when[t]!) !== key) return [c];
    // the copy stands for a value the list does not price: its figures are the person's
    const { mine: _m, id: _id, rank: _r, ...rest } = structuredClone(c);
    const id = newCaseId();
    copies.set(c.id, id);
    return [c, withPriced({ ...rest, id, when: c.when.map((w, k): When => (k === t ? [words] : w)) }, copiedPriced(pricedOf(c)))];
  });
  // on the page each copy stands right after its original
  const shown = byRank(fee.cases).flatMap((c) => (copies.has(c.id) ? [c.id, copies.get(c.id)!] : [c.id]));
  return ranked({ ...fee, by, cases }, shown);
}

/** A fee whose things `a` and `b` swap places: a grid's rows become its columns. Every case keeps its values and prices. */
export function swapThings(fee: Fee, a: number, b: number): Fee {
  if (!hasCases(fee) || a === b || !fee.by[a] || !fee.by[b]) return fee;
  const swap = (k: number) => (k === a ? b : k === b ? a : k);
  const by = fee.by.map((_, k) => fee.by[swap(k)]!);
  const cases = fee.cases.map((c) => {
    const next: Case = { ...c, when: c.when.map((_, k) => c.when[swap(k)]!) };
    return c.spans ? { ...next, spans: c.spans.map((s) => ({ ...s, along: swap(s.along) })) } : next;
  });
  return { ...fee, by, cases };
}

/**
 * A deal whose fees stand on the page in the order `ids` gives (every fee's id, each once), each its place there as its rank: each group
 * then shows its fees in it. The deal's own order, which the reading walks, stays. Any other list leaves the deal as it is.
 */
export function orderFees(deal: FeeDeal, ids: readonly string[]): FeeDeal {
  if (ids.length !== deal.fees.length || new Set(ids).size !== ids.length || ids.some((id) => !deal.fees.some((f) => f.id === id))) return deal;
  return { ...deal, fees: deal.fees.map((f) => ({ ...f, rank: ids.indexOf(f.id) })) };
}
