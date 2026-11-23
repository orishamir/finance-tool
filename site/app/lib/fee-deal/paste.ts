// A cell copied on the fee page (Ctrl+C) and pasted (Ctrl+V) onto another cell or a head (method §10.6, F-114). The copy is a snapshot of
// the cell as it stood when copied: its prices, figures and their sources, and the part row (or the grid's whole case) it holds; editing
// or deleting the cell after it changes nothing of the copy. A paste is the drop of that snapshot on the cases of the place, by the same
// path a part dropped on a head takes (lifted.ts: `liftDrop` onto a `cases` place, `partToCases`, `withCell`), so the rules are applied
// at paste time: it replaces what they held, a figure keeps its source only where the case held that very figure from it, a sum keeps its
// own currency or the case is left out and named (`currencyClash`), and the undo line says what it replaced; a grid's whole case pasted
// gives each case of the place its whole price. Pure.
import { feeDeal as copy } from "../../copy";
import { hasCases, sameContent, type Fee, type FeeDeal, type Priced } from "./model";
import { WHOLE } from "./layout";
import { isPartRow } from "./part-rows";
import { FIRST, pricesOf, withCell, withPrices, type CellRow } from "./edits/cells";
import { updateFee } from "./edits/deal";
import type { FeeKindId } from "./shapes";
import { liftDrop, type Lifted, type LiftResult, type LiftTarget } from "./lifted";

/** What Ctrl+C copied: the kind of fee it came from, its case's prices as they stood (a deep copy), and the part row it holds, or `WHOLE`. */
export interface Clip {
  kind: FeeKindId;
  from: Priced;
  row: CellRow;
}

/** A place a paste goes into: the cases of a cell, a head or the fee, each named by what tells it apart (lifted.ts). */
export type PastePlace = Extract<LiftTarget, { k: "cases" }>;

const feeOf = (deal: FeeDeal, id: string) => deal.fees.find((f) => f.id === id);

/** The snapshot of cell `l` of fee `fee` (its first case's prices) as the fee holds it now; null where the fee has no such case. */
export function clipOf(fee: Fee, l: Extract<Lifted, { k: "cell" }>): Clip | null {
  const x = pricesOf(fee, l.cases[0] ?? null);
  if (fee.id !== l.fee || !x) return null;
  return { kind: fee.kind, from: structuredClone({ stages: x.stages, ...(x.sale ? { sale: x.sale } : {}) }), row: l.row };
}

/**
 * A grid's whole case pasted on a place: each of its cases takes the copy's whole price (`withCell`, a figure keeping its source only where
 * the case held it so), in a fee of the copy's kind; the undo line names the cases whose price it replaced.
 */
function wholeOnto(deal: FeeDeal, clip: Clip, on: PastePlace): LiftResult | null {
  const to = feeOf(deal, on.fee);
  if (!to || !hasCases(to) || clip.kind !== to.kind) return null;
  let next: Fee = to;
  const replaced: string[] = [];
  for (const id of on.cases) {
    const c = to.cases.find((x) => x.id === id);
    const x = c && withCell(to.kind, clip.from, c, WHOLE);
    if (!c || !x || sameContent(x.stages, c.stages)) continue;
    next = withPrices(next, id, x);
    replaced.push(id);
  }
  if (next === to) return null;
  return { deal: updateFee(deal, to.id, () => next), kept: { feeId: to.id, words: copy.cases.pastedWhole.replace("{where}", replaced.map((id) => on.names[id] ?? "").join(", ")) } };
}

/** The id of the fee that stands for the copy while it is dropped: one no deal's fee has. */
const CLIP_FEE = "fee-clipboard";

/**
 * `clip` pasted on one place: a part row dropped, as a copy, from a fee that stands for the snapshot (a fee of its kind with its prices,
 * there only while it is dropped) onto the place's cases (`liftDrop`); a whole case's price (`wholeOnto`). Null where it changes nothing.
 */
export function pasteOn(deal: FeeDeal, clip: Clip, on: PastePlace): LiftResult | null {
  if (clip.row === WHOLE) return wholeOnto(deal, clip, on);
  if (!isPartRow(clip.row)) return null;
  const stand = { id: CLIP_FEE, kind: clip.kind, ...structuredClone(clip.from) } as Fee;
  const r = liftDrop({ ...deal, fees: [...deal.fees, stand] }, { k: "part", fee: CLIP_FEE, case: null, price: FIRST, row: clip.row }, on, { copy: true });
  if (!r) return null;
  return { deal: { ...r.deal, fees: r.deal.fees.filter((f) => f.id !== CLIP_FEE) }, ...(r.kept && r.kept.feeId !== CLIP_FEE ? { kept: r.kept } : {}) };
}
