// The parts every case of a fee holds alike (method §10.6, F-114): the workbench says them once, apart from the fee's table or grid, and
// leaves them out of it, so the table shows only what tells the cases apart. It is a view of the cases, not stored state: the model keeps
// the part in every case, an edit of the cell said once edits it in each of them, and an edit inside the table that makes the cases differ
// puts the part back in the table on its own. The reading never reads it. And what a part that asks an amount asks when it is added to
// several cases at once. Pure; no Hebrew.
import { pricedOf, type CasesFee } from "./model";
import { asksAmount, besideThePrice, type PartId } from "./offers/parts";
import { PART_ROWS, rowOf, type PartRow } from "./part-rows";
import { partKey } from "./band-layout";
import { PENDING, type PendingWords } from "./part-words";
import type { SlimPart } from "./case-words";

/**
 * The part rows every case holds alike, in the rows' order, for a fee of two cases or more (`rows`, each case's parts as the builder says
 * them, `slimParts`, later prices included): every case holds that row's parts on its first price and they read the same (`partKey`, so a
 * list's figure and the person's copy of it count as one; the cell names where each is from, `mergedParts`); each is a part a price keeps
 * beside its main figure (`besideThePrice`), never the price's form or a later price, which are what tells cases apart; and every later
 * price of every case holds each of them alike (`SlimPart.alike`), so the part said once reads for every price. A part only some cases
 * hold alike stays in the table.
 */
export function everyCaseRows(rows: readonly { parts: readonly SlimPart[] }[]): PartRow[] {
  if (rows.length < 2) return [];
  const keyOf = (parts: readonly SlimPart[], row: PartRow): string | null => {
    const first = parts.filter((p) => !p.stage && rowOf(p) === row);
    if (first.length === 0 || !first.every((p) => besideThePrice(p.id))) return null;
    const later = new Set(parts.flatMap((p) => (p.stage ? [p.stage] : [])));
    const held = [...later].every((s) => first.every((p) => parts.some((x) => x.stage === s && x.id === p.id && x.alike)));
    return held ? first.map(partKey).join("|") : null;
  };
  return PART_ROWS.filter((row) => {
    const keys = rows.map((r) => keyOf(r.parts, row));
    return keys[0] !== null && keys.every((k) => k === keys[0]);
  });
}

/** Each case's parts without the rows said once for every case (`every`): what the table or the grid then lays out. */
export function withoutRows<R extends { parts: readonly SlimPart[] }>(rows: readonly R[], every: readonly PartRow[]): R[] {
  if (every.length === 0) return [...rows];
  return rows.map((r) => ({ ...r, parts: r.parts.filter((p) => !every.includes(rowOf(p))) }));
}

/**
 * What a part that asks an amount (`asksAmount`) asks when cases `cases` of a fee take it at once: its words, its box's spoken name and its
 * sign as the open case asks them (`PENDING`), on each case's first price, where the part goes. Null where the part asks no amount, or where
 * the cases would ask it differently (their sums kept in two currencies), since one amount typed once cannot stand for them all.
 */
export function askAcross(fee: CasesFee, cases: readonly string[], part: PartId): PendingWords | null {
  if (!asksAmount(part) || cases.length === 0) return null;
  const asked = cases.map((id) => PENDING[part]({ kind: fee.kind, p: pricedOf(fee, id).stages[0]!.price }));
  const same = (a: PendingWords) => JSON.stringify(a) === JSON.stringify(asked[0]);
  return asked.every(same) ? asked[0]! : null;
}
