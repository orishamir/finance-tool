// Adding a thing a fee changes by, and a case's slot or a thing of the band opened (method §10.6, F-114): the question a thing asks once,
// what adding it does to the cases, a slot's choices, and a thing's menu. Every word is from the copy; a component only lays them out.
import { feeDeal as copy } from "../../copy";
import { hasCases, isRange, namesPlaces, type Fee } from "./model";
import { canAddBy, removeBy } from "./edits/case";
import { type DealRead } from "./deal-read";
import { BY_MAX, CONDITIONS, isPlaceKind, isRangeKind, isWordsKind, type ByKind, type ConditionValues, type RangeUnit } from "./offers/conditions";
import { thingName, valueWords, whenWords, type WhenWords } from "./case-words";

// ---------------------------------------------------------------- adding a thing, and a case's slot opened

/** A range's unit as a choice says it: a currency's sign, or the words for units or actions. */
const unitWords = (u: RangeUnit): string => (u === "units" || u === "actions" ? copy.cases.units[u]! : (copy.panel.signs[u] ?? u));

/**
 * The question a thing asks once when it is added to a fee: its words; for a list, the values the site names to tick, and the
 * line for a value in the person's own words; how such a value is typed (`typed`: its name's label, whether where it is bought and its
 * currency are asked, and whether the question opens on typing one, for a thing whose values are the person's words alone); a condition's
 * name (`label`); for a range, its units (the first its usual one); and why it cannot be added, where it cannot (`off`: a fourth thing, or
 * one the fee changes by already).
 */
export interface ByQuestion {
  kind: ByKind;
  ask: string;
  values?: { id: string; words: string }[];
  other?: string;
  typed?: { name: string; place: boolean; open: boolean };
  label?: string;
  units?: { unit: RangeUnit; words: string }[];
  add: string;
  cancel: string;
  off?: string;
}

export function byQuestion(fee: Fee, kind: ByKind): ByQuestion {
  const c = copy.cases;
  const base = { kind, add: c.add, cancel: c.cancel, ...(canAddBy(fee, kind) || kind === "own" ? {} : { off: (fee.by?.length ?? 0) >= BY_MAX ? c.full : "" }) };
  const values: ConditionValues = CONDITIONS[kind].values;
  const typed = { name: c.slot.nameBy[kind] ?? c.slot.ownName, place: isPlaceKind(kind), open: isWordsKind(kind) };
  switch (values.kind) {
    case "range":
      return { ...base, ask: c.ask.range!.replace("{thing}", thingName(fee.kind, { kind })), units: values.units.map((u) => ({ unit: u, words: unitWords(u) })) };
    case "list":
      return { ...base, ask: c.ask[kind]!, values: values.ids.map((id) => ({ id, words: valueWords(kind, id) })), other: c.otherBy[kind] ?? c.otherValue, typed };
    case "own":
      return { ...base, ask: c.ask[kind]!, typed, label: c.ownLabel };
    case "track":
      return { ...base, ask: c.ask[kind]!, typed };
  }
}

/**
 * What adding a thing does to a fee's cases, as the question says it under its values: each case copied to each value ticked (a range's to
 * "עד" and "מעל"), and how many cases there are before and after (`count`, with `{from}` and `{to}` for the two numbers; none for a fee
 * with one case, where the copies say it all).
 */
export function copiesWords(fee: Fee, kind: ByKind, ticked: number): { line: string; from: number; to: number; count: string | null } {
  const c = copy.cases.copies;
  const from = hasCases(fee) ? fee.cases.length : 1;
  const to = from * (isRangeKind(kind) ? 2 : Math.max(ticked, 1));
  const line = isRangeKind(kind) ? c.range : `${c.lead}${copy.cases.copyNoun[kind] ?? ""}${c.tail}`;
  return { line, from, to, count: from > 1 ? c.count : null };
}

/**
 * A case's slot, opened: for a list, its values to tick (several may be), any value, and the line for one in the
 * person's words; for a track, its name as the list writes it and whether it is the person's; for a condition, its value; for a range,
 * whether the case is up to a top or above the last, the top, its unit, and the case before it in the range's order.
 */
export type SlotEdit =
  | { kind: "list"; title: string; options: { id: string; words: string; ticked: boolean }[]; any: { words: string; ticked: boolean }; other: string }
  | { kind: "track"; title: string; name: string | null; any: { words: string; ticked: boolean }; mine: boolean; myTrack: string }
  | { kind: "own"; title: string; name: string | null; any: { words: string; ticked: boolean } }
  | { kind: "range"; title: string; upTo: number | null; any: { words: string; ticked: boolean }; unit: RangeUnit; units: { unit: RangeUnit; words: string }[]; before: WhenWords | null };

export function slotEdit(r: DealRead, feeId: string, caseId: string, t: number): SlotEdit | null {
  const fee = r.deal.fees.find((f) => f.id === feeId);
  if (!fee || !hasCases(fee)) return null;
  const c = fee.cases.find((x) => x.id === caseId);
  const b = fee.by[t];
  if (!c || !b) return null;
  const w = c.when[t]!;
  const any = { words: copy.cases.any[b.kind]!, ticked: w === "any" };
  const thing = thingName(fee.kind, b);
  const named = Array.isArray(w) ? w : [];
  const values = CONDITIONS[b.kind].values;
  switch (values.kind) {
    case "range": {
      if (!isRange(b)) return null;
      const step = typeof w === "number" ? w : null;
      const before = step !== null && step > 0 ? whenWords(fee, step - 1, t, r.today) : null;
      return { kind: "range", title: copy.cases.slot.range.replace("{thing}", thing), upTo: step !== null && step < b.tops.length ? b.tops[step]!.v : null, any, unit: b.unit, units: values.units.map((u) => ({ unit: u, words: unitWords(u) })), before };
    }
    case "track":
      return { kind: "track", title: copy.cases.slot.trackName, name: named[0] ?? null, any, mine: !!c.mine, myTrack: copy.cases.slot.myTrack };
    case "own":
      return { kind: "own", title: thing, name: named[0] ?? null, any };
    case "list": {
      const ids = [...values.ids, ...(namesPlaces(b) && b.own ? b.own.map((o) => o.name) : [])];
      // a value of the person's own a case names that the thing's list does not (a channel, a currency) is a choice too
      for (const v of fee.cases.flatMap((x) => (Array.isArray(x.when[t]) ? (x.when[t] as string[]) : []))) if (!ids.includes(v)) ids.push(v);
      return { kind: "list", title: copy.cases.slot.list.replace("{thing}", thing), options: ids.map((id) => ({ id, words: valueWords(b.kind, id), ticked: named.includes(id) })), any, other: copy.cases.otherBy[b.kind] ?? copy.cases.otherValue };
    }
  }
}

// ---------------------------------------------------------------- a thing of the band's head, opened

/**
 * A thing of a fee's band head, opened while the fee is open: its spoken name, its values as the cases name them, each once in the cases' order; the action
 * that stops the price changing by it (`removeBy`); and what that does to the cases (`after`): how many there are before and after where
 * cases merge, that they stay as they are where none merge, or that the fee keeps its first case's price where it was its only thing.
 */
export interface ThingMenu {
  /** The menu's spoken name: "המחיר משתנה לפי {thing}". */
  name: string;
  title: string;
  values: WhenWords[];
  stop: string;
  after: string;
}

export function thingMenu(r: DealRead, feeId: string, t: number): ThingMenu | null {
  const fee = r.deal.fees.find((f) => f.id === feeId);
  if (!fee || !hasCases(fee) || !fee.by[t]) return null;
  const m = copy.cases.thingMenu;
  const b = fee.by[t];
  const thing = thingName(fee.kind, b);
  const seen = new Set<string>();
  const values: WhenWords[] = [];
  for (const c of fee.cases) {
    const key = JSON.stringify(c.when[t]);
    if (seen.has(key)) continue;
    seen.add(key);
    values.push(whenWords(fee, c.when[t]!, t, r.today));
  }
  const left = removeBy(fee, t);
  const from = fee.cases.length;
  const to = hasCases(left) ? left.cases.length : 1;
  const after = !hasCases(left) ? m.slim : to < from ? m.merge.replace("{from}", String(from)).replace("{to}", String(to)) : m.kept;
  return { name: `${copy.cases.changesBy} ${thing}`, title: m.title, values, stop: m.stop.replace("{thing}", thing), after };
}
