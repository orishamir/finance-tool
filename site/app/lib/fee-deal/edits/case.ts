// The changes the fee page makes to what a fee's price changes by (F-114), each a pure function from a fee to the next: a thing added or
// taken away, a case made, copied or taken away, a case's values, and a range's tops and steps.
import { hasCases, isRange, namesPlaces, newCaseId, pickKey, retyped, sameContent, typed, type By, type Case, type CasesFee, type Fee, type OwnPlace, type SlimFee, type When } from "../model";
import { WHAT_VALUES } from "../shapes";
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
  if (how === "own") return l.kind === "own" && l.label.trim() ? { by: { kind: "own", label: l.label.trim() }, values: each } : null;
  if (isPlaceKind(l.kind)) {
    const placed = l as Extract<NewBy, { kind: PlaceKind }>;
    const own = (placed.own ?? []).filter((o) => values.includes(o.name) && !Object.hasOwn(WHAT_VALUES, o.name));
    if (!values.every((v) => LIST_IDS[placed.kind].includes(v) || own.some((o) => o.name === v))) return null;
    return { by: { kind: placed.kind, ...(own.length ? { own } : {}) }, values: each };
  }
  return { by: { kind: l.kind } as By, values: each };
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
  return { ...head, by: [...(fee.by ?? []), made.by], cases } as CasesFee;
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
  if (fee.by.length === 1) {
    const one = keptOf(fee.cases);
    const { by: _b, cases: _c, ...head } = fee;
    return { ...head, stages: one.stages, ...(one.sale ? { sale: one.sale } : {}) } as SlimFee;
  }
  const kept = mergedWithout(fee, t).map((g) => {
    const c = keptOf(g);
    return { ...c, when: c.when.filter((_, j) => j !== t) };
  });
  const by = fee.by.filter((_, j) => j !== t);
  const track = by.some((b) => b.kind === "track");
  return { ...fee, by, cases: track ? kept : kept.map(({ mine: _m, ...c }) => c) };
}

/** A fee with one more case at its end: a copy of case `fromId` (or of the last case), with its prices. A fee with no cases is left as it is. */
export function addCase(fee: Fee, fromId?: string): Fee {
  if (!hasCases(fee)) return fee;
  const from = fee.cases.find((c) => c.id === fromId) ?? fee.cases.at(-1)!;
  return { ...fee, cases: [...fee.cases, copyOf(from, [...from.when])] };
}

/** A fee with case `caseId` copied right after it, with its prices ("להעתיק את המקרה"). */
export function copyCase(fee: Fee, caseId: string): Fee {
  if (!hasCases(fee)) return fee;
  const at = fee.cases.findIndex((c) => c.id === caseId);
  if (at < 0) return fee;
  const from = fee.cases[at]!;
  return { ...fee, cases: [...fee.cases.slice(0, at + 1), copyOf(from, [...from.when]), ...fee.cases.slice(at + 1)] };
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

/** A fee whose case `caseId` says `when` of thing `t` (several values may be named, F-114). A value that does not fit the thing leaves it as it is. */
export function setWhen(fee: Fee, caseId: string, t: number, when: When): Fee {
  if (!hasCases(fee) || !fee.by[t] || !fits(fee.by[t]!, when)) return fee;
  return { ...fee, cases: fee.cases.map((c) => (c.id === caseId ? { ...c, when: c.when.map((w, j) => (j === t ? when : w)) } : c)) };
}

/**
 * A fee with a value of what is bought or held that the person names, with where it is bought and its currency, on thing `t`; a name the
 * site already has, or the thing already names, leaves it as it is.
 */
export function addOwnPlace(fee: Fee, t: number, own: OwnPlace): Fee {
  const b = fee.by?.[t];
  const name = own.name.trim();
  if (!hasCases(fee) || !b || !namesPlaces(b) || !name || Object.hasOwn(WHAT_VALUES, name) || b.own?.some((o) => o.name === name)) return fee;
  return { ...fee, by: fee.by.map((x, j) => (j === t ? { ...b, own: [...(b.own ?? []), { ...own, name }] } : x)) };
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
 * A fee whose case `caseId` is up to `upTo` on range `t` ("עד", F-114), or above its last top (`upTo` null: "מעל"). A top the range has
 * already is that step; a new one splits the step it falls in, and every case on that step is copied to both halves with its prices, so
 * no size is left without a case; the case named takes the lower half. A top above the last makes a new last step, which the cases on the
 * last step are copied to the same way.
 */
export function setStep(fee: Fee, caseId: string, t: number, upTo: number | null): Fee {
  const b = fee.by?.[t];
  if (!hasCases(fee) || !b || !isRange(b) || !fee.cases.some((c) => c.id === caseId)) return fee;
  const tops = b.tops.map((n) => n.v);
  if (upTo === null) return setWhen(fee, caseId, t, tops.length);
  if (!(upTo > 0)) return fee;
  const at = tops.indexOf(upTo);
  if (at >= 0) return setWhen(fee, caseId, t, at);
  const j = tops.findIndex((x) => x > upTo);
  const split = j < 0 ? tops.length : j;
  const newTops = [...b.tops.slice(0, split), typed(upTo), ...b.tops.slice(split)];
  const cases = fee.cases.flatMap((c): Case[] => {
    const w = c.when[t]!;
    const shift = (s: number) => c.when.map((x, k) => (k === t ? s : x));
    if (typeof w !== "number" || w < split) return [c];
    if (w > split) return [{ ...c, when: shift(w + 1) }];
    // the step split in two: the case on its lower half, and a copy of it on the upper
    return [{ ...c, when: shift(split) }, { ...copyOf(c, shift(split + 1)), ...(c.mine ? { mine: true as const } : {}) }];
  });
  // the case named takes the lower half; a copy of it on the upper half, where it was on the step split, stays for the other sizes
  return setWhen({ ...fee, by: fee.by.map((x, k) => (k === t ? { ...b, tops: newTops } : x)), cases }, caseId, t, split);
}

/** A range's top `k` typed again (its unit kept): refused where it would not stay above the top before it and below the one after. */
export function setTop(fee: Fee, t: number, k: number, v: number): Fee {
  const b = fee.by?.[t];
  if (!hasCases(fee) || !b || !isRange(b) || !b.tops[k]) return fee;
  const before = b.tops[k - 1]?.v ?? 0, after = b.tops[k + 1]?.v ?? Infinity;
  if (!(v > before && v < after)) return fee;
  return { ...fee, by: fee.by.map((x, j) => (j === t ? { ...b, tops: b.tops.map((n, i) => (i === k ? retyped(n, v) : n)) } : x)) };
}
