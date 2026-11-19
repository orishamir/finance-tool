// The changes the fee page makes to what a fee's price changes by (F-114), each a pure function from a fee to the next: a thing added or
// taken away, a case made, copied or taken away, a case's values, and a range's tops and steps.
import { blankPrice, byRank, copiedPriced, hasCases, isList, isRange, namesPlaces, newCaseId, pickKey, retyped, sameContent, spansWithout, thingValues, typed, withNamed, type By, type Case, type CasesFee, type Fee, type OwnPlace, type Priced, type SlimFee, type When } from "../model";
import { capacity } from "../offers/capacity";
import { WHAT_VALUES } from "../shapes";
import { caseFor } from "@finance-tool/engine";
import { condsOf } from "../cases";
import { held } from "../limits";
import { BY_MAX, CONDITIONS, conditionsFor, isPlaceKind, isRangeKind, LIST_IDS, RANGE_UNITS, thingKey, type ByKind, type PlaceKind, type RangeUnit, type ValuesOf } from "../offers/conditions";

// ---------------------------------------------------------------- what a fee's price changes by (F-114)

/**
 * A thing to add to a fee, with its values asked once: a list thing with the values ticked (the site's ids or the person's words; for what
 * is bought or held, a value of the person's own with where it is bought and its currency, `own`); a track or a condition with its values
 * in the person's words (a condition with its name); a range with its first top and its unit. Each thing's shape follows how the
 * conditions registry names its values (`ValuesOf`).
 */
export type NewBy = { [K in ByKind]: NewByOf<K> }[ByKind];
type NewByOf<K extends ByKind> =
  ValuesOf<K> extends { kind: "range" } ? { kind: K; unit: RangeUnit; top: number }
  : ValuesOf<K> extends { kind: "own" } ? { kind: K; label: string; values: string[] }
  : ValuesOf<K> extends { places: true } ? { kind: K; values: string[]; own?: OwnPlace[] }
  : { kind: K; values: string[] };

/** What the person gave in a thing's question (`AskThing`): the values ticked, the values of their own with their places, a name, a top and its unit. */
export interface ThingAnswers {
  values: string[];
  own: OwnPlace[];
  label: string;
  top: number | null;
  unit: RangeUnit | null;
}

/** The thing to add that a question's answers make, as the conditions registry says its values are named; null where a range has no top or unit. */
export function newBy(kind: ByKind, a: ThingAnswers): NewBy | null {
  if (isRangeKind(kind)) return a.top === null || !a.unit ? null : { kind, unit: a.unit, top: a.top };
  if (CONDITIONS[kind].values.kind === "own") return { kind, label: a.label, values: a.values } as NewBy;
  if (isPlaceKind(kind)) return { kind, values: a.values, ...(a.own.length ? { own: a.own.filter((o) => a.values.includes(o.name)) } : {}) };
  return { kind, values: a.values } as NewBy;
}

/** A case with its prices replaced (its id, values, mark and spans kept). */
const withPriced = (c: Case, x: Priced): Case => {
  const { stages: _s, sale: _sale, ...head } = c;
  return { ...head, stages: x.stages, ...(x.sale ? { sale: x.sale } : {}) };
};

/** A case copied to a place the list does not price as it does its own: its figures the person's (`copiedPriced` onto nothing). */
const asNew = (c: Case): Case => withPriced(c, copiedPriced(c));

/** A case copied with a new id, its track no longer marked as the person's (`mine` names one track, which the copy may not be). */
const copyOf = (c: Case, when: When[]): Case => {
  const { mine: _m, id: _id, ...rest } = structuredClone(c);
  return { ...rest, id: newCaseId(), when };
};

/** The thing a `NewBy` makes, and the values each case is copied to (a range's two steps, "עד" its top and "מעל" it). */
function thingOf(n: NewBy): { by: By; values: When[] } | null {
  const how = CONDITIONS[n.kind].values.kind;
  if (how === "range") {
    const r = n as Extract<NewBy, { top: number }>;
    if (!RANGE_UNITS[r.kind].includes(r.unit) || !(r.top > 0)) return null;
    return { by: { kind: r.kind, unit: r.unit, tops: [typed(r.top)] }, values: [0, 1] };
  }
  const l = n as Exclude<NewBy, { top: number }>;
  const values = [...new Set(l.values.map((v) => v.trim()).filter(Boolean))];
  if (values.length === 0) return null;
  const each = values.map((v) => [v]);
  if (how === "own") return l.kind === "own" && l.label.trim() ? { by: { kind: "own", label: l.label.trim(), values }, values: each } : null;
  if (isPlaceKind(l.kind)) {
    const placed = l as Extract<NewBy, { kind: PlaceKind }>;
    const own = (placed.own ?? []).filter((o) => values.includes(o.name) && !Object.hasOwn(WHAT_VALUES, o.name));
    if (!values.every((v) => LIST_IDS[placed.kind].includes(v) || own.some((o) => o.name === v))) return null;
    return { by: { kind: placed.kind, values, ...(own.length ? { own } : {}) }, values: each };
  }
  return { by: { kind: l.kind, values } as By, values: each };
}

/**
 * Whether a fee can take a thing of `kind` more: one its kind may change by (`conditionsFor`), not one it changes by already (what is bought
 * and what is held count as one), and fewer than three things so far.
 */
export function canAddBy(fee: Fee, kind: ByKind, label?: string): boolean {
  if (!conditionsFor(fee.kind).includes(kind)) return false;
  const by = fee.by ?? [];
  if (by.length >= BY_MAX) return false;
  return !by.some((b) => pickKey(b) === thingKey(kind, label));
}

/**
 * A fee whose price changes by one more thing (F-114): every case is copied to each of the thing's values with its own prices (two cases
 * and two channels make four), a range's to "עד" its first top and "מעל" it; a fee whose price changed by nothing becomes one with cases,
 * its prices copied the same way. A fee that cannot take the thing (`canAddBy`), or a thing with no value, leaves it as it is.
 */
export function addBy(fee: Fee, n: NewBy): Fee {
  if (!canAddBy(fee, n.kind, "label" in n ? n.label : undefined)) return fee;
  const made = thingOf(n);
  if (!made) return fee;
  const base: Case[] = hasCases(fee) ? fee.cases : [{ id: newCaseId(), when: [], stages: fee.stages, ...(fee.sale ? { sale: fee.sale } : {}) }];
  // each case keeps its id on the first value (the case open on the screen stays open), and the person's track stays marked on its copies
  const cases = base.flatMap((c) =>
    made.values.map((v, j): Case => {
      const x = j === 0 ? { ...c, when: [...c.when, v] } : copyOf(c, [...c.when, v]);
      return c.mine ? { ...x, mine: true } : x;
    }),
  );
  const { stages: _s, sale: _sale, ...head } = fee;
  return held(fee, { ...head, by: [...(fee.by ?? []), made.by], cases } as CasesFee);
}

/**
 * The case whose prices hold when cases become one: the person's own (the case marked as their track), else the first in order. The
 * reading starts on the person's own track (F-114), so the price it read before the thing went is the price kept.
 */
export const keptOf = (cases: readonly Case[]): Case => cases.find((c) => c.mine) ?? cases[0]!;

/**
 * The cases of a fee once thing `t` is taken away, grouped: the cases that differ only in it are one group, in the order of each group's
 * first case.
 */
export function mergedWithout(fee: CasesFee, t: number): Case[][] {
  const groups: { when: When[]; cases: Case[] }[] = [];
  for (const c of fee.cases) {
    const when = c.when.filter((_, j) => j !== t);
    const g = groups.find((x) => sameContent(x.when, when));
    if (g) g.cases.push(c);
    else groups.push({ when, cases: [c] });
  }
  return groups.map((g) => g.cases);
}

/**
 * Whether taking thing `t` away keeps the person's own case's prices where the first case's would differ from them: the case kept of a group
 * that becomes one is theirs and not its first, or, the fee left with no thing, the case kept of them all is theirs.
 */
export function ownKept(fee: CasesFee, t: number): boolean {
  if (fee.by.length === 1) return !!keptOf(fee.cases).mine;
  return mergedWithout(fee, t).some((g) => keptOf(g) !== g[0]);
}

/**
 * A fee without thing `t`: the cases that differ only in it become one, at the first one's place, priced as the one `keptOf` keeps, so
 * no price is read twice; a fee left with no thing changes by nothing again, priced as the case `keptOf` keeps of them all. The undo keeps
 * what this takes (undo.ts).
 */
export function removeBy(fee: Fee, t: number): Fee {
  if (!hasCases(fee) || !fee.by[t]) return fee;
  // the case kept now stands for the others too: a figure keeps its source only where every one of them held it so (`copiedPriced`)
  const merged = (g: readonly Case[], c: Case): Priced => g.filter((x) => x !== c).reduce((x: Priced, o) => copiedPriced(x, o), { stages: c.stages, ...(c.sale ? { sale: c.sale } : {}) });
  if (fee.by.length === 1) {
    const one = merged(fee.cases, keptOf(fee.cases));
    const { by: _b, cases: _c, ...head } = fee;
    return { ...head, stages: one.stages, ...(one.sale ? { sale: one.sale } : {}) } as SlimFee;
  }
  const kept = mergedWithout(fee, t).map((g) => {
    const c = keptOf(g);
    return spansWithout(withPriced({ ...c, when: c.when.filter((_, j) => j !== t) }, merged(g, c)), t);
  });
  const by = fee.by.filter((_, j) => j !== t);
  const track = by.some((b) => b.kind === "track");
  return { ...fee, by, cases: track ? kept : kept.map(({ mine: _m, ...c }) => c) };
}

/** A fee with one more case at its end: a copy of case `fromId` (or of the last case), with its prices. A fee with no cases is left as it is. */
export function addCase(fee: Fee, fromId?: string): Fee {
  if (!hasCases(fee)) return fee;
  const from = fee.cases.find((c) => c.id === fromId) ?? fee.cases.at(-1)!;
  return held(fee, { ...fee, cases: [...fee.cases, copyOf(from, [...from.when])] });
}

/** A fee with case `caseId` copied right after it, with its prices ("להעתיק את המקרה"). */
export function copyCase(fee: Fee, caseId: string): Fee {
  if (!hasCases(fee)) return fee;
  const at = fee.cases.findIndex((c) => c.id === caseId);
  if (at < 0) return fee;
  const from = fee.cases[at]!;
  return held(fee, { ...fee, cases: [...fee.cases.slice(0, at + 1), copyOf(from, [...from.when]), ...fee.cases.slice(at + 1)] });
}

/** A fee without case `caseId`. The only case is never removed: a fee needs a price. The undo keeps what this takes (undo.ts). */
export function removeCase(fee: Fee, caseId: string): Fee {
  if (!hasCases(fee) || fee.cases.length < 2 || !fee.cases.some((c) => c.id === caseId)) return fee;
  return { ...fee, cases: fee.cases.filter((c) => c.id !== caseId) };
}

/** Whether a value fits thing `b`: any value; for a list, values the thing knows (what is bought or held: the site's ids or its own); a range's step. */
function fits(b: By, w: When): boolean {
  if (w === "any") return true;
  if (isRange(b)) return typeof w === "number" && Number.isInteger(w) && w >= 0 && w <= b.tops.length;
  if (!Array.isArray(w) || w.length === 0 || new Set(w).size !== w.length || w.some((v) => !v.trim())) return false;
  if (namesPlaces(b)) return w.every((v) => LIST_IDS[b.kind].includes(v) || !!b.own?.some((o) => o.name === v));
  return true;
}

/**
 * A fee whose case `caseId` says `when` of thing `t` (several values may be named, F-114), a value new to the thing kept after its values
 * (`withNamed`); the value it named before stays the thing's, with no case where none other names it. A value that does not fit the thing
 * leaves it as it is.
 */
export function setWhen(fee: Fee, caseId: string, t: number, when: When): Fee {
  if (!hasCases(fee) || !fee.by[t] || !fits(fee.by[t]!, when)) return fee;
  // the case's prices now hold for another value, which the list may price otherwise: its figures become the person's
  return held(fee, withNamed({ ...fee, cases: fee.cases.map((c) => (c.id === caseId && !sameContent(c.when[t], when) ? asNew({ ...c, when: c.when.map((w, j) => (j === t ? when : w)) }) : c)) }));
}

/**
 * A fee with a value of what is bought or held that the person names, with where it is bought and its currency, on thing `t`; a name the
 * site already has, or the thing already names, leaves it as it is.
 */
export function addOwnPlace(fee: Fee, t: number, own: OwnPlace): Fee {
  const b = fee.by?.[t];
  const name = own.name.trim();
  if (!hasCases(fee) || !b || !namesPlaces(b) || !name || Object.hasOwn(WHAT_VALUES, name) || b.own?.some((o) => o.name === name)) return fee;
  return held(fee, { ...fee, by: fee.by.map((x, j) => (j === t ? { ...b, own: [...(b.own ?? []), { ...own, name }] } : x)) });
}

/**
 * A fee whose case `caseId` has the person's own track (`on`), or not: every case of the same track is marked with it and no other, since
 * one track of a fee is the person's; off, the fee names none. A case on any track, or a fee with no track, is left as it is.
 */
export function setMine(fee: Fee, caseId: string, on: boolean): Fee {
  if (!hasCases(fee)) return fee;
  const t = fee.by.findIndex((b) => b.kind === "track");
  const c = fee.cases.find((x) => x.id === caseId);
  const track = c?.when[t];
  if (t < 0 || !c || !Array.isArray(track)) return fee;
  const same = (x: Case) => Array.isArray(x.when[t]) && (x.when[t] as string[]).some((v) => track.includes(v));
  return { ...fee, cases: fee.cases.map(({ mine: _m, ...x }) => (on && same({ ...x }) ? { ...x, mine: true as const } : x)) };
}

/** A range's unit (a currency, units or actions, `RANGE_UNITS`), its tops kept as typed. */
export function setRangeUnit(fee: Fee, t: number, unit: RangeUnit): Fee {
  const b = fee.by?.[t];
  if (!hasCases(fee) || !b || !isRange(b) || !RANGE_UNITS[b.kind].includes(unit) || b.unit === unit) return fee;
  return { ...fee, by: fee.by.map((x, j) => (j === t ? { ...b, unit, tops: b.tops.map((n) => typed(n.v)) } : x)) };
}

/**
 * A fee whose range `t` has one more top, `top`, splitting the step it falls in: every case on that step is copied to both halves with its
 * prices (the case itself on the lower half, its copy on the upper), so no size is left without a case and both halves keep the step's
 * price until it is changed; the cases on later steps move up one. A top above the last splits the last step ("מעל"). The new top's place
 * among the tops (`split`); null where the fee has no such range or the top is no figure above zero or one the range has already.
 */
function splitStep(fee: Fee, t: number, top: number): { fee: CasesFee; split: number } | null {
  const b = fee.by?.[t];
  if (!hasCases(fee) || !b || !isRange(b) || !(top > 0) || b.tops.some((n) => n.v === top)) return null;
  const j = b.tops.findIndex((n) => n.v > top);
  const split = j < 0 ? b.tops.length : j;
  const tops = [...b.tops.slice(0, split), typed(top), ...b.tops.slice(split)];
  const cases = fee.cases.flatMap((c): Case[] => {
    const w = c.when[t]!;
    const shift = (s: number) => c.when.map((x, k) => (k === t ? s : x));
    if (typeof w !== "number" || w < split) return [c];
    if (w > split) return [{ ...c, when: shift(w + 1) }];
    return [{ ...c, when: shift(split) }, { ...copyOf(c, shift(split + 1)), ...(c.mine ? { mine: true as const } : {}) }];
  });
  return { fee: { ...fee, by: fee.by.map((x, k) => (k === t ? { ...b, tops } : x)), cases }, split };
}

/**
 * A ladder's step added by its boundary alone ("+ מדרגה", F-114): the step the boundary falls in splits in two at it, both halves keeping
 * its price (`splitStep`). A boundary the range has already, or none above zero, leaves the fee as it is.
 */
export const addStep = (fee: Fee, t: number, top: number): Fee => held(fee, splitStep(fee, t, top)?.fee ?? fee);

/**
 * A fee whose case `caseId` is up to `upTo` on range `t` ("עד", F-114), or above its last top (`upTo` null: "מעל"). A top the range has
 * already is that step; a new one splits the step it falls in (`splitStep`), and the case named takes the lower half.
 */
export function setStep(fee: Fee, caseId: string, t: number, upTo: number | null): Fee {
  const b = fee.by?.[t];
  if (!hasCases(fee) || !b || !isRange(b) || !fee.cases.some((c) => c.id === caseId)) return fee;
  const tops = b.tops.map((n) => n.v);
  if (upTo === null) return setWhen(fee, caseId, t, tops.length);
  if (!(upTo > 0)) return fee;
  const at = tops.indexOf(upTo);
  if (at >= 0) return setWhen(fee, caseId, t, at);
  const made = splitStep(fee, t, upTo)!;
  return held(fee, setWhen(made.fee, caseId, t, made.split));
}

/**
 * A case added where a grid has a place no case holds (F-114): a copy of case `fromId` with its prices, its value of thing `t` set to
 * `when`, at the fee's end, on the page too (no rank of its own, so it stands after every ranked case: its row and its column are named
 * by other cases already, so the grid's order stays). A value that does not fit the thing, or a case the fee does not have, leaves it as it is.
 */
export function addCaseAt(fee: Fee, fromId: string, t: number, when: When): Fee {
  if (!hasCases(fee) || !fee.by[t] || !fits(fee.by[t]!, when)) return fee;
  const from = fee.cases.find((c) => c.id === fromId);
  if (!from) return fee;
  const { rank: _r, ...made } = asNew(copyOf(from, from.when.map((w, k) => (k === t ? when : w))));
  return held(fee, withNamed({ ...fee, cases: [...fee.cases, made] }));
}

/**
 * A case added where a place no case holds stands in a value no case names (a grid's row with no case, a table's column with none): its
 * values for each thing (`when`, one for each) and one price not given yet, in the form the fee's first case on the page is in now
 * (its kind's usual one where that is free), so it is read once a figure is typed (F-114, §10.6). At the fee's end, with no rank. Values
 * that do not fit the things leave the fee as it is.
 */
export function addBlankCase(fee: Fee, when: readonly When[]): Fee {
  if (!hasCases(fee) || when.length !== fee.by.length || !fee.by.every((b, t) => fits(b, when[t]!))) return fee;
  const form = byRank(fee.cases)[0]!.stages.at(-1)!.price.form;
  const made: Case = { id: newCaseId(), when: [...when], stages: [{ price: blankPrice(form === "free" ? capacity(fee.kind).usual : form) }] };
  return held(fee, withNamed({ ...fee, cases: [...fee.cases, made] }));
}

/**
 * New values of list thing `t` (a grid's row or column, a table's column, F-114), each named alone, kept by the thing (`By.values`) with no
 * case: every place of the new row or column is one no case holds, and the reading prints no price for it until a case is added there. A
 * value the thing has already, or one that does not fit it, is left out; values of the person's own for what is bought or held come with
 * where they are bought and their currency (`own`). They stand after the thing's values, or right before its value `before` (`valueKey`,
 * a value of several before the first of them in its order): a column or a row added between two.
 */
export function addValuesAt(fee: Fee, t: number, values: readonly string[], own: readonly OwnPlace[] = [], before?: string): Fee {
  const b = fee.by?.[t];
  if (!hasCases(fee) || !b || !isList(b)) return fee;
  let next: Fee = fee;
  for (const o of own) if (values.includes(o.name)) next = addOwnPlace(next, t, o);
  if (!hasCases(next)) return fee;
  const had = thingValues(next, t);
  const nb = next.by[t]!;
  const fresh = [...new Set(values.map((v) => v.trim()).filter((v) => v && !had.includes(v)))].filter((v) => fits(nb, [v]));
  if (fresh.length === 0) return fee;
  const w = before === undefined ? null : (JSON.parse(before) as When);
  const at = Array.isArray(w) && w.some((v) => had.includes(v)) ? Math.min(...w.filter((v) => had.includes(v)).map((v) => had.indexOf(v))) : had.length;
  const kept = [...had.slice(0, at), ...fresh, ...had.slice(at)];
  return held(fee, { ...next, by: next.by.map((x, j) => (j === t && isList(x) ? { ...x, values: kept } : x)) as By[] });
}

/**
 * Value `from` of thing `t` renamed `to` in the thing and in every case that names it (a column's or a row's head typed again, F-114): only
 * a value in the person's words (a track's, a condition's, a channel or a currency typed), never one the site names (`LIST_IDS`), which the
 * reading picks by, nor one of what is bought or held, which carries its place. An empty name, or one the thing has already, leaves it.
 */
export function renameValue(fee: Fee, t: number, from: string, to: string): Fee {
  const b = fee.by?.[t];
  const name = to.trim();
  if (!hasCases(fee) || !b || !isList(b) || !canRename(b, from) || !name || nameTaken(thingValues(fee, t), name)) return fee;
  const swap = (w: When): When => (Array.isArray(w) ? w.map((v) => (v === from ? name : v)) : w);
  return {
    ...fee,
    by: fee.by.map((x, j) => (j === t && isList(x) ? { ...x, values: x.values.map((v) => (v === from ? name : v)) } : x)) as By[],
    cases: fee.cases.map((c) => (Array.isArray(c.when[t]) && (c.when[t] as string[]).includes(from) ? { ...c, when: c.when.map((w, j) => (j === t ? swap(w) : w)) } : c)),
  };
}

/** Whether value `v` of a thing is the person's words, which a head may rename (`renameValue`). */
export function canRename(b: By, v: string): boolean {
  if (!isList(b) || namesPlaces(b)) return false;
  const how = CONDITIONS[b.kind].values;
  return how.kind !== "list" || !how.ids.includes(v);
}

/** New values of list thing `t` at the end of its values (`addValuesAt`). */
export const addValues = (fee: Fee, t: number, values: readonly string[], own: readonly OwnPlace[] = []): Fee => addValuesAt(fee, t, values, own);

/** A range's top `k` typed again (its unit kept): refused where it would not stay above the top before it and below the one after. */
export function setTop(fee: Fee, t: number, k: number, v: number): Fee {
  const b = fee.by?.[t];
  if (!hasCases(fee) || !b || !isRange(b) || !b.tops[k]) return fee;
  const before = b.tops[k - 1]?.v ?? 0, after = b.tops[k + 1]?.v ?? Infinity;
  if (!(v > before && v < after)) return fee;
  return { ...fee, by: fee.by.map((x, j) => (j === t ? { ...b, tops: b.tops.map((n, i) => (i === k ? retyped(n, v) : n)) } : x)) };
}

/**
 * Whether every set of values outside a split case's own reads the same case in `next` as in `fee` (F-114, `caseFor`): each thing's named
 * values and one none names, a range's steps; the split thing (`t` in `next`; new where `added`) taken out of `fee`'s sets.
 */
function readsAlike(fee: CasesFee, next: CasesFee, split: string, t: number, added: boolean): boolean {
  const values = next.by.map((b, j): (string | number)[] => (isRange(b) ? Array.from({ length: b.tops.length + 1 }, (_, k) => k) : ["", ...new Set(next.cases.flatMap((c) => (Array.isArray(c.when[j]) ? (c.when[j] as string[]) : [])))]));
  const before = fee.cases.map(condsOf);
  const after = next.cases.map(condsOf);
  const sets = values.reduce<(string | number)[][]>((acc, vs) => acc.flatMap((a) => vs.map((v) => [...a, v])), [[]]);
  return sets.every((v) => {
    const was = caseFor(before, added ? v.filter((_, j) => j !== t) : v);
    if (was === null || fee.cases[was]!.id === split) return true;
    const now = caseFor(after, v);
    return now !== null && next.cases[now]!.id === fee.cases[was]!.id;
  });
}

/**
 * A fee whose case `caseId` alone is split by a thing (F-114): the case is copied to each of the thing's values with its prices, in its
 * place, and every other case holds for any value of it, so the rest of the table stands as it was and F-114 reads each pick in one case
 * (a case on any value holds every pick; the split case's copies only theirs). A thing the fee changes by already splits the case where it
 * holds for any value of it; a range it changes by already does not (a step is added by its boundary, `addStep`). The copies stand in the
 * case's place, or after every other case where a set of values outside the case would then read another case (a tie F-114 breaks by
 * order); where that too would change one, nothing is split (`readsAlike`). A fee whose price changes by nothing splits whole (`addBy`). A
 * fee that cannot take the thing, or a thing with no value, leaves it as it is.
 */
export function splitCase(fee: Fee, caseId: string, n: NewBy): Fee {
  if (!hasCases(fee)) return addBy(fee, n);
  const at = fee.cases.findIndex((c) => c.id === caseId);
  const made = thingOf(n);
  if (at < 0 || !made) return fee;
  const c = fee.cases[at]!;
  const t = fee.by.findIndex((b) => pickKey(b) === pickKey(made.by));
  const copies = (when: (v: When) => When[]) =>
    made.values.map((v, j): Case => {
      const x = j === 0 ? { ...c, when: when(v) } : copyOf(c, when(v));
      return c.mine ? { ...x, mine: true } : x;
    });
  // on the page the copies stand where the case stood, wherever the reading's order puts them (`Rank`)
  const shownWith = (made: Case[]) => byRank(fee.cases).flatMap((x) => (x.id === caseId ? made.map((m) => m.id) : [x.id]));
  const ranked = (next: CasesFee, made: Case[]): CasesFee => {
    const shown = shownWith(made);
    return { ...next, cases: next.cases.map((x) => ({ ...x, rank: shown.indexOf(x.id) })) };
  };
  const placed = (by: By[], others: Case[], made: Case[], tAt: number, added: boolean): Fee => {
    const inPlace: CasesFee = { ...fee, by, cases: [...others.slice(0, at), ...made, ...others.slice(at)] };
    if (readsAlike(fee, inPlace, c.id, tAt, added)) return held(fee, withNamed(ranked(inPlace, made)));
    const last: CasesFee = { ...fee, by, cases: [...others, ...made] };
    return readsAlike(fee, last, c.id, tAt, added) ? held(fee, withNamed(ranked(last, made))) : fee;
  };
  const rest = fee.cases.filter((x) => x.id !== caseId);
  if (t >= 0) {
    if (isRange(fee.by[t]!) || c.when[t] !== "any" || !made.values.every((v) => fits(fee.by[t]!, v))) return fee;
    return placed(fee.by, rest, copies((v) => c.when.map((w, k) => (k === t ? v : w))), t, false);
  }
  if (!canAddBy(fee, n.kind, "label" in n ? n.label : undefined)) return fee;
  return placed([...fee.by, made.by], rest.map((x) => ({ ...x, when: [...x.when, "any"] })), copies((v) => [...c.when, v]), fee.by.length, true);
}

/**
 * Whether a value of the person's own typed as `name` is one a list has already: `known`, the list's values by their ids and their words,
 * each compared with its spaces trimmed ("בסניף" typed beside the site's "בסניף", or " בסניף ").
 */
export const nameTaken = (known: readonly string[], name: string): boolean => !!name.trim() && known.some((k) => k.trim() === name.trim());
