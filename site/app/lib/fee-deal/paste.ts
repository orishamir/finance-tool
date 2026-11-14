// What several cells or a copied cell do at once on the fee page (method §10.6, F-114): a cell or a part copied (Ctrl+C) and pasted
// (Ctrl+V) onto another cell, a head or every cell chosen, and the cells chosen taken away together. A paste is the drop of a copy of the
// thing on the cases of each place (lifted.ts: `liftDrop` onto a `cases` place, `partToCases`), so it replaces what they held, keeps a sum
// in its own currency or names the case it leaves out (`currencyClash`), and says what it replaced; a grid's whole case pasted gives each
// case of the place its whole price. Several places are one change, with one undo line. Pure.
import { feeDeal as copy } from "../../copy";
import { hasCases, sameContent, type Fee, type FeeDeal } from "./model";
import { WHOLE } from "./layout";
import { pricesOf, withCell, withPrices } from "./edits/cells";
import { updateFee } from "./edits/deal";
import { liftDrop, liftRemove, type Lifted, type LiftResult, type LiftTarget } from "./lifted";

/** What Ctrl+C copied: a cell (a part row of its cases, or a grid's whole case) or a part of the open case, as its grip lifts it. */
export type Clip = Extract<Lifted, { k: "cell" } | { k: "part" }>;

/** A place a paste goes into: the cases of a cell, a head or the fee, each named by what tells it apart (lifted.ts). */
export type PastePlace = Extract<LiftTarget, { k: "cases" }>;

const feeOf = (deal: FeeDeal, id: string) => deal.fees.find((f) => f.id === id);

/**
 * A grid's whole case (`clip`) pasted on a place: each of its cases, but the copied one, takes the case's whole price (`withCell`, a figure
 * keeping its source only where the case held it so), in a fee of the same kind; the undo line names the cases whose price it replaced.
 */
function wholeOnto(deal: FeeDeal, clip: Extract<Clip, { k: "cell" }>, on: PastePlace): LiftResult | null {
  const from = feeOf(deal, clip.fee), to = feeOf(deal, on.fee);
  const src = from && pricesOf(from, clip.cases[0]!);
  if (!from || !to || !src || !hasCases(to) || from.kind !== to.kind) return null;
  let next: Fee = to;
  const replaced: string[] = [];
  for (const id of on.cases) {
    if (id === clip.cases[0]) continue;
    const c = to.cases.find((x) => x.id === id);
    const x = c && withCell(to.kind, src, c, WHOLE);
    if (!c || !x || sameContent(x.stages, c.stages)) continue;
    next = withPrices(next, id, x);
    replaced.push(id);
  }
  if (next === to) return null;
  return { deal: updateFee(deal, to.id, () => next), kept: { feeId: to.id, words: copy.cases.pastedWhole.replace("{where}", replaced.map((id) => on.names[id] ?? "").join(", ")) } };
}

/** `clip` pasted on one place: a copy of it dropped on the place's cases (`liftDrop`), or a whole case's price (`wholeOnto`); null where it changes nothing. */
export function pasteOn(deal: FeeDeal, clip: Clip, on: PastePlace): LiftResult | null {
  if (clip.k === "cell" && clip.row === WHOLE) return wholeOnto(deal, clip, on);
  return liftDrop(deal, clip, on, { copy: true });
}

/** Results made one after another, as one change: the last deal, and the undo lines' words joined, kept on the fee the last one kept on. */
function chained(deal: FeeDeal, steps: readonly ((d: FeeDeal) => LiftResult | null)[], words?: (said: string[]) => string): LiftResult | null {
  let now = deal;
  let feeId: string | null = null;
  const said: string[] = [];
  for (const step of steps) {
    const r = step(now);
    if (!r) continue;
    now = r.deal;
    if (r.kept) {
      feeId = r.kept.feeId;
      said.push(r.kept.words);
    }
  }
  if (now === deal) return null;
  return { deal: now, ...(feeId && said.length ? { kept: { feeId, words: words ? words(said) : said.join(" ") } } : {}) };
}

/** `clip` pasted on each of several places (the cells chosen), as one change with one undo line; null where it changes nothing. */
export const pasteOnAll = (deal: FeeDeal, clip: Clip, places: readonly PastePlace[]): LiftResult | null => chained(deal, places.map((on) => (d: FeeDeal) => pasteOn(d, clip, on)));

/**
 * The cells chosen taken away together (`liftRemove` for each, as its bin does), as one change: the undo line says how many went, or the
 * one's own words. A cell that cannot be taken away (a fee's last case) is left.
 */
export function removeAll(deal: FeeDeal, cells: readonly Lifted[]): LiftResult | null {
  let gone = 0;
  return chained(
    deal,
    cells.map((l) => (d: FeeDeal) => {
      const r = liftRemove(d, l);
      if (r) gone++;
      return r;
    }),
    (said) => (gone > 1 ? copy.cases.selection.removed.replace("{n}", String(gone)) : said.join(" ")),
  );
}
