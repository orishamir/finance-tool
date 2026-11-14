// When a later price of a fee holds a part exactly as the price before it (F-110's sequence of prices): what a table, a grid and the cases
// read as rows leave unsaid with the later price (`laterChanges`, band-layout.ts), and what an edit of the earlier figure in place carries
// on to (`figureOnward`, edits/cells.ts). One notion for both, so nothing is carried that is shown, and nothing hidden that is not carried.
// Pure; it reads the model and the part and figure registries alone.
import type { Num, Price } from "./core";
import { FIGURES, type Figure } from "./offers/figures";
import { PARTS, partsSaid, type PartId } from "./offers/parts";

/** A JSON text of `x` with its keys in order, each figure (`Num`) in it written as `#`: a price's terms, whatever its figures are. */
function termsKey(x: unknown): string {
  return JSON.stringify(x, (_, v) => {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      if (typeof (v as Num).v === "number" && Object.keys(v).every((k) => k === "v" || k === "src" || k === "blank")) return "#";
      return Object.fromEntries(Object.keys(v).sort().map((k) => [k, (v as Record<string, unknown>)[k]]));
    }
    return v;
  });
}

/** A figure as the page reads and shows it: its number (or not given), and where it is from (the person, or a source and its page). */
const figureKey = (n: Num | undefined): string | null =>
  n ? JSON.stringify([n.blank ? null : n.v, n.src ? [n.src.url, n.src.own ?? null, n.src.page ?? null] : "entered"]) : null;

/** A part's figures in a price, in the registry's order, those the price has a place for. */
const placed = (p: Price, part: PartId): Figure[] => PARTS[part].figures.filter((f) => FIGURES[f].placed(p));

/**
 * How many of a part's figures its words show (part-words.ts, `SAID`): its first, and a flat price's sum it holds up to as its second; a
 * third party's minimum and maximum, after its rate, are not shown.
 */
const SHOWN: Partial<Record<PartId, number>> = { flat: 2 };

/**
 * Whether price `b`, which follows price `a`, is said whole where a later price says only what it changes: it lacks a part `a` says; its
 * terms differ from `a`'s in anything that is not a figure (a held share's period or charging months, a sum's period, a bound's currency
 * and period, a discount's reach, its notes, its form), which the reading reads but a part's words may not show; or a figure of a part
 * that its words do not show (a third party's minimum and maximum, after its rate) differs. Said whole, it leaves nothing unsaid and
 * takes no carried edit.
 */
export function saidWhole(a: Price, b: Price): boolean {
  const before = partsSaid(a, {}), after = partsSaid(b, {});
  if (!before.every((id) => after.includes(id))) return true;
  if (termsKey(a) !== termsKey(b)) return true;
  return before.some((id) => placed(a, id).slice(SHOWN[id] ?? 1).some((f) => figureKey(FIGURES[f].get(a)) !== figureKey(FIGURES[f].get(b))));
}

/**
 * Whether price `b`, which follows price `a`, holds part `part` exactly as `a` does, so a later price leaves it unsaid and an edit of it in
 * `a` goes on to `b`: `b` is not said whole (`saidWhole`), both say the part, and each of its figures is the same number from the same
 * place (the person, or one source and its page).
 */
export function heldAlike(a: Price, b: Price, part: PartId): boolean {
  if (saidWhole(a, b) || !partsSaid(a, {}).includes(part) || !partsSaid(b, {}).includes(part)) return false;
  return PARTS[part].figures.every((f) => figureKey(FIGURES[f].get(a)) === figureKey(FIGURES[f].get(b)));
}
