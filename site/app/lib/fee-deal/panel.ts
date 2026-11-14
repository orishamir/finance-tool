// One fee open in place (method §10.6, `panel`): the case open, its slots, and each price's parts with the figures each edits, the form a
// later price takes after a free one, and what the case can do (be copied, be taken away).
import type { SiteValue } from "../value";
import { feeOf } from "./cases";
import { hasCases, pricedOf, type Case, type Fee, type MonthKey, type Price, type Stage } from "./model";
import { boundsAction } from "./offers/capabilities";
import { capacity, type ChargedForm } from "./offers/capacity";
import { FIGURES, type Figure } from "./offers/figures";
import { offerFor } from "./offers/offer";
import { PART_IDS, PARTS, type PartId, type PartKind } from "./offers/parts";
import { FLAT_BLANK, signOfUnit, type PartWords } from "./part-words";
import { priceView, refOf, type DealRead, type FeeRef, type PriceView } from "./deal-read";
import { type ByKind } from "./offers/conditions";
import { firstCase, saidParts, whenWords, type WhenWords } from "./case-words";

// ---------------------------------------------------------------- one fee's panel, and the case open in place

/** One fee open in place: the fee, and its case open (a slim fee's price, which opens the same way) with its slots and its parts' fields. */
export interface Panel extends FeeRef {
  open: OpenCase;
}

/**
 * A field of a part in the open case: the figure it edits (`Figure`, offers/figures.ts), its value (null while it is blank or absent), and the sign
 * after its box (a percent, or a currency's sign; none for a sum per period, whose period is said after it).
 */
export interface PartField {
  figure: Figure;
  value: SiteValue | null;
  sign: "pct" | string;
}

/** A part of the open case's price: its id, kind, words around its fields, and its fields. Every part can be taken away but the price itself. */
export interface OpenPart {
  id: PartId;
  kind: PartKind;
  words: PartWords;
  fields: PartField[];
  /**
   * What its ✕ does: takes the part away (a form of the price makes it free); holds the price on with no end, taking the prices after it
   * away with an undo (a later price, `until`); or nothing, for a free price, which has no ✕.
   */
  remove: "part" | "hold" | null;
}

/** A slot of the open case: one thing, how the case names it now, and whether its track is the person's. */
export interface Slot {
  thing: number;
  kind: ByKind;
  words: WhenWords;
  mine?: boolean;
}

/**
 * The case open in place (or a slim fee's price): its id (null for a slim fee), its slots, each of its prices on each side with their
 * parts in the toolbox's order of kinds, and whether it may be copied (a fee with cases) and removed (one of two or more cases).
 */
export interface OpenCase {
  case: string | null;
  slots: Slot[];
  buy: { k: number; until?: MonthKey; parts: OpenPart[] }[];
  sell?: { k: number; until?: MonthKey; parts: OpenPart[] }[];
  canCopy: boolean;
  canRemove: boolean;
  /** The form a price added after a free one takes: the first form the product's fee is offered in (`Offer.usual`). */
  later: ChargedForm;
}

/** A part's fields: each figure it holds that the price has a place for, with its value and its box's sign. */
const figureFields = (id: PartId, p: Price, view: PriceView): PartField[] =>
  PARTS[id].figures.filter((f) => FIGURES[f].placed(p)).map((f) => ({ figure: f, value: view.figures[f] ?? null, sign: signOfUnit(FIGURES[f].unit(p)) }));

/**
 * A price's parts with the figures each edits, in the order a line says them, its end among them where it ends (`until`) and a sale priced
 * apart where the line has one. Every part can be taken away but the price's form.
 */
function openParts(fee: Fee, p: Price, view: PriceView, line: { until?: MonthKey; sale: boolean }): OpenPart[] {
  const said = saidParts({ kind: fee.kind, p, view, ...(line.until ? { until: line.until } : {}) }, line.sale);
  // a flat price nobody typed yet is in the price too: it shows as an empty part where a typed one stands, after the bounds
  if (boundsAction(p) && p.flat && !said.some((x) => x.id === "flat")) {
    const at = said.findIndex((x) => PART_IDS.indexOf(x.id) > PART_IDS.indexOf("flat"));
    said.splice(at < 0 ? said.length : at, 0, { id: "flat", kind: PARTS.flat.kind, words: FLAT_BLANK });
  }
  return said.map((x) => ({ ...x, fields: figureFields(x.id, p, view), remove: x.id === "free" ? null : x.id === "until" ? "hold" : "part" }));
}

/** The case open in place: the fee's slots for the case, and its prices' parts. */
export function openCase(r: DealRead, fee: Fee, caseId: string | undefined): OpenCase {
  const priced = pricedOf(fee, caseId);
  const c = hasCases(fee) ? (priced as Case) : null;
  const stagesOf = (stages: readonly Stage[], apart: boolean) =>
    stages.map((s, k) => ({ k, ...(s.until ? { until: s.until } : {}), parts: openParts(fee, s.price, priceView([fee], 0, s.price, r.today), { ...(s.until ? { until: s.until } : {}), sale: apart && k === 0 }) }));
  return {
    case: c?.id ?? null,
    slots: c && hasCases(fee) ? fee.by.map((b, t) => ({ thing: t, kind: b.kind, words: whenWords(fee, c.when[t]!, t, r.today), ...(b.kind === "track" ? { mine: !!c.mine } : {}) })) : [],
    buy: stagesOf(priced.stages, !!priced.sale),
    ...(priced.sale ? { sell: stagesOf(priced.sale, false) } : {}),
    canCopy: !!c,
    canRemove: !!c && hasCases(fee) && fee.cases.length > 1,
    later: offerFor(r.kind, fee.kind).usual ?? capacity(fee.kind).usual,
  };
}

/**
 * One fee open in place, from the deal read once (`readDealFor`); null where the deal has no fee with that id. For a fee with cases, the
 * case open is `caseId`, else its first, which the edits edit where they name no case. Every price is there as typed, the passed ones too:
 * the open case edits them all.
 */
export function panel(r: DealRead, feeId: string, caseId?: string): Panel | null {
  const fee = r.deal.fees.find((f) => f.id === feeId);
  if (!fee) return null;
  const shown = caseId ?? firstCase(fee);
  const priced = pricedOf(fee, shown);
  // a fee not read (prices out of order, not given, no case for the picks) is named on its own
  const at = r.fees.findIndex((x) => feeOf(x) === fee.id && (!hasCases(fee) || x.read?.case === (priced as Case).id));
  return { ...refOf(at >= 0 ? r.fees[at]! : { fee: fee.id, kind: fee.kind, ...(fee.name ? { name: fee.name } : {}) }, r.today), fee: fee.id, open: openCase(r, fee, shown) };
}
