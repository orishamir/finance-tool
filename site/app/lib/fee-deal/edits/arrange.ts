// The changes the fee page makes to how a fee's cases and a deal's fees stand (F-114), each a pure function: a table's column or a grid's
// row or column moved, a value of a thing taken away with its cases, a ladder's step taken away into its neighbour, a row or column
// duplicated, the two things of a grid swapped, and the deal's fees put in the person's order. A move sets a list thing's values' order
// (`By.values`) and ranks (`Rank`), the page's order, and never the order the reading reads (F-114 reads a fee's cases and the deal's fees
// in their own order), so it changes no reading.
import { byRank, copiedPriced, hasCases, isList, isRange, NAME_MAX, namesPlaces, newCaseId, sameContent, spansWithout, thingValues, type By, type Case, type CasesFee, type Fee, type FeeDeal, type Priced, type When } from "../model";
import { thingHeads, valueKey, type Head } from "../layout";
import { WHAT_VALUES } from "../shapes";

/** The heads of thing `t` in the order the page stands them (layout.ts): its values as the cases name them, and those no case names. */
function headsOf(fee: CasesFee, t: number): Head[] {
  return thingHeads({ things: fee.by.map((x, j) => (isRange(x) ? { range: true } : { range: false, values: thingValues(fee, j) })), cases: byRank(fee.cases).map((c) => ({ id: c.id, when: c.when, parts: [] })), rows: [] }, t);
}

/** A fee whose list thing `t` keeps `values` (in that order). */
const withValues = (fee: CasesFee, t: number, values: readonly string[]): CasesFee => ({ ...fee, by: fee.by.map((b, j) => (j === t && isList(b) ? { ...b, values: [...values] } : b)) as By[] });

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
  // a column on another value moves its value (the columns stand in their values' order); one on the same value, among its value's columns
  const key = valueKey(fee.cases.find((c) => c.id === caseId)!.when[0]!), atKey = valueKey(fee.cases.find((c) => c.id === at)!.when[0]!);
  if (key !== atKey) return moveValue(fee, 0, key, atKey);
  return ranked(fee, moved(shown, from, to));
}

/**
 * A fee whose value `key` (`valueKey`) of list thing `t` stands where its value `at` stands on the page now (`headsOf`), the values between
 * them moving one place toward where it was: a grid's row or column moved, the thing's values (`By.values`) in their new order, a value
 * of several at the place of the first of them. The cases are put in order by each thing's values in turn (the first thing's first), the
 * moved thing's in its new order, so every other thing's values keep theirs where each row names every column. A range's values keep
 * their order (they ascend), and so does any value (always last).
 */
export function moveValue(fee: Fee, t: number, key: string, at: string): Fee {
  if (!hasCases(fee) || !fee.by[t] || isRange(fee.by[t]!) || key === valueKey("any") || at === valueKey("any")) return fee;
  const heads = fee.by.map((_, j) => headsOf(fee, j));
  const orders = heads.map((hs) => hs.map((h) => h.key));
  const from = orders[t]!.indexOf(key), to = orders[t]!.indexOf(at);
  if (from < 0 || to < 0 || from === to) return fee;
  orders[t] = moved(orders[t]!, from, to);
  const was = thingValues(fee, t);
  const inHead = (k: string) => {
    const w = heads[t]!.find((h) => h.key === k)!.when;
    return Array.isArray(w) ? [...w].sort((a, b) => was.indexOf(a) - was.indexOf(b)) : [];
  };
  const values = [...new Set([...orders[t]!.flatMap(inHead), ...was])];
  const place = (c: Case) => fee.by.map((_, j) => orders[j]!.indexOf(valueKey(c.when[j]!)));
  const shown = byRank(fee.cases).map((c, i) => ({ c, i, r: place(c) })).sort((a, b) => {
    for (let j = 0; j < a.r.length; j++) if (a.r[j] !== b.r[j]) return a.r[j]! - b.r[j]!;
    return a.i - b.i;
  });
  return ranked(withValues(fee, t, values), shown.map((x) => x.c.id));
}

/**
 * A fee without value `key` of thing `t`: a grid's row or column, or a table's column with no case, taken away with the cases on it, and a
 * list thing's values that then no case names (`By.values`). A value whose cases are all the fee's is never taken away: a fee needs a
 * price. The undo keeps what this takes (undo.ts).
 */
export function removeValue(fee: Fee, t: number, key: string): Fee {
  if (!hasCases(fee) || !fee.by[t]) return fee;
  const cases = fee.cases.filter((c) => valueKey(c.when[t]!) !== key);
  if (cases.length === 0) return fee;
  const w = JSON.parse(key) as When;
  return withoutUnnamed({ ...fee, cases }, t, Array.isArray(w) ? w : [], fee);
}

/** A fee whose list thing `t` no longer keeps those of `values` its cases no longer name; `was` itself where nothing changed. */
function withoutUnnamed(fee: CasesFee, t: number, values: readonly string[], was: CasesFee): Fee {
  const b = fee.by[t]!;
  const named = new Set(fee.cases.flatMap((c) => (Array.isArray(c.when[t]) ? (c.when[t] as string[]) : [])));
  const next = isList(b) ? withValues(fee, t, b.values.filter((v) => !values.includes(v) || named.has(v))) : fee;
  return next.cases.length === was.cases.length && sameContent(next.by, was.by) ? was : next;
}

/**
 * A fee without the case of a table's column (`caseId`), taken away by its head, with the values of its one thing that then no case names:
 * the head of a column is its value's. The only case is never taken away. The undo keeps what this takes (undo.ts).
 */
export function removeColumn(fee: Fee, caseId: string): Fee {
  const c = hasCases(fee) ? fee.cases.find((x) => x.id === caseId) : undefined;
  if (!hasCases(fee) || !c || fee.cases.length < 2) return fee;
  return withoutUnnamed({ ...fee, cases: fee.cases.filter((x) => x.id !== caseId) }, 0, Array.isArray(c.when[0]) ? (c.when[0] as string[]) : [], fee);
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
  if (thingValues(fee, t).includes(words)) return fee;
  let by = fee.by;
  if (namesPlaces(b)) {
    if (Object.hasOwn(WHAT_VALUES, words) || b.own?.some((o) => o.name === words)) return fee;
    const first = fee.cases.find((c) => valueKey(c.when[t]!) === key)?.when[t] ?? (JSON.parse(key) as When);
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
  // on the page each copy stands right after its original, and the new value right after the value's last
  const shown = byRank(fee.cases).flatMap((c) => (copies.has(c.id) ? [c.id, copies.get(c.id)!] : [c.id]));
  const values = thingValues(fee, t);
  const of = JSON.parse(key) as When;
  const after = Array.isArray(of) ? Math.max(...of.map((v) => values.indexOf(v))) + 1 : values.length;
  return ranked(withValues({ ...fee, by, cases }, t, [...values.slice(0, after), words, ...values.slice(after)]), shown);
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

/** A fee with no ranks and its list things' values in one order: what it holds, whatever the order the page shows it and its cases in. */
const unranked = (fee: Fee): Fee => {
  const { rank: _r, ...head } = fee as Fee & { rank?: number };
  if (!hasCases(fee)) return head as Fee;
  return { ...head, by: fee.by.map((b) => (isList(b) ? { ...b, values: [...b.values].sort() } : b)), cases: fee.cases.map(({ rank: _c, ...c }) => c) } as Fee;
};

/** Whether two fees hold the same and differ at most in the order the page shows them and their cases in (`Rank`: a move). */
export const sameButOrder = (a: Fee, b: Fee): boolean => sameContent(unranked(a), unranked(b));

/**
 * Fee `was` put back in the order `now` stands in on the page: its own rank, each of its cases' that `now` still has, and its list things'
 * values in `now`'s order, a value `now` lacks right after the value it followed in `was`, so an undo of a change made before a move keeps
 * the move.
 */
export function inOrderOf(was: Fee, now: Fee): Fee {
  const { rank: _r, ...head } = was as Fee & { rank?: number };
  const rank = (now as Fee & { rank?: number }).rank;
  const ranked = { ...head, ...(rank !== undefined ? { rank } : {}) } as Fee;
  if (!hasCases(ranked) || !hasCases(now)) return ranked;
  const ranks = new Map(now.cases.map((c) => [c.id, c.rank]));
  const by = ranked.by.map((b, t) => {
    const n = now.by[t];
    return isList(b) && n && isList(n) && n.kind === b.kind ? { ...b, values: valuesInOrder(b.values, n.values) } : b;
  }) as By[];
  return { ...ranked, by, cases: ranked.cases.map((c) => (ranks.has(c.id) ? (({ rank: _c, ...x }) => ({ ...x, ...(ranks.get(c.id) !== undefined ? { rank: ranks.get(c.id)! } : {}) }))(c) : c)) };
}

/** Values `was` in the order of `now`: those both hold as `now` has them, each `now` lacks right after the value before it in `was`. */
function valuesInOrder(was: readonly string[], now: readonly string[]): string[] {
  const out = now.filter((v) => was.includes(v));
  was.forEach((v, i) => {
    if (out.includes(v)) return;
    const before = was.slice(0, i).reverse().find((x) => out.includes(x));
    out.splice(before === undefined ? 0 : out.indexOf(before) + 1, 0, v);
  });
  return out;
}
