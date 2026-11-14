// One fee open in place (method §10.6, `panel`): the case open, its slots, and each price's parts with the figures each edits and the
// currency chooser beside its first sum, a part the toolbox added that asks for what it needs on the price the toolbox acts on, and what
// the case can do (be copied, be taken away).
import type { SiteValue } from "../value";
import { feeOf } from "./cases";
import { anySourced, hasCases, pricedOf, toolPrice, type BoundCurrency, type Case, type Fee, type MonthKey, type Price, type Stage } from "./model";
import { boundsAction } from "./offers/capabilities";
import { keeps, sumCurrency } from "./offers/capacity";
import { FIGURES, type Figure } from "./offers/figures";
import { PART_IDS, PARTS, type Ask, type PartId, type PartKind, type PendingPart } from "./offers/parts";
import { FLAT_BLANK, PENDING, signOfUnit, type PartWords, type PendingWords } from "./part-words";
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
  /** Its box draws no sign of its own: the currency chooser stands beside it and shows the currency once. */
  bare?: true;
}

/**
 * A part of the open case's price: its id, kind, words around its fields, and its fields. Every part can be taken away but the price
 * itself. The month a price changes from is no part of a price: it is the divider between two prices (`OpenStage.until`).
 */
export type LinePart = Exclude<PartId, "until">;
export interface OpenPart {
  id: LinePart;
  kind: PartKind;
  words: PartWords;
  fields: PartField[];
  /** What its bin does: takes the part away (a form of the price makes it free); or nothing, for a free price, which has no bin. */
  remove: "part" | null;
  /** The price's currency chooser stands beside it (`OpenStage.chooser`). */
  chooser?: true;
}

/**
 * A price's currency, where the fee may keep its sums in another: chosen beside the price's first sum (a sum per unit's or per action's,
 * else the minimum's, else the maximum's), shown plain while the price still holds a figure a template filled (a change of currency makes
 * the whole price the person's).
 */
export interface Chooser {
  currency: BoundCurrency;
  plain: boolean;
}

/**
 * One price of the open case: its place among its side's prices, the month it ends (the divider after it, where the next price starts), its
 * parts, and its currency chooser (none where it has no sum to stand beside).
 */
export interface OpenStage {
  k: number;
  until?: MonthKey;
  parts: OpenPart[];
  chooser: Chooser | null;
}

/**
 * A part the toolbox added that asks, where it will stand, for what it needs: the part and what it asks, the price it goes on (`k`, of the
 * purchase: the toolbox's, `toolPrice`), its words, its box's spoken name and sign (`PENDING`), and the figure whose box it becomes once
 * given.
 */
export interface OpenPending extends PendingWords {
  part: PendingPart;
  ask: Exclude<Ask, null>;
  k: number;
  figure?: Figure;
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
  buy: OpenStage[];
  sell?: OpenStage[];
  /** A part the toolbox added that still asks for what it needs, on this case; null where none does. */
  pending: OpenPending | null;
  canCopy: boolean;
  canRemove: boolean;
}

/** A part's fields: each figure it holds that the price has a place for, with its value and its box's sign. */
const figureFields = (id: PartId, p: Price, view: PriceView): PartField[] =>
  PARTS[id].figures.filter((f) => FIGURES[f].placed(p)).map((f) => ({ figure: f, value: view.figures[f] ?? null, sign: signOfUnit(FIGURES[f].unit(p)) }));

/**
 * A price's parts with the figures each edits, in the order a line says them, and a sale priced apart where the line has one. Every part
 * can be taken away but the price's form.
 */
function openParts(fee: Fee, p: Price, view: PriceView, line: { sale: boolean }): OpenPart[] {
  const said = saidParts({ kind: fee.kind, p, view }, line.sale).filter((x): x is typeof x & { id: LinePart } => x.id !== "until");
  // a flat price nobody typed yet is in the price too: it shows as an empty part where a typed one stands, after the bounds
  if (boundsAction(p) && p.flat && !said.some((x) => x.id === "flat")) {
    const at = said.findIndex((x) => PART_IDS.indexOf(x.id) > PART_IDS.indexOf("flat"));
    said.splice(at < 0 ? said.length : at, 0, { id: "flat", kind: PARTS.flat.kind, words: FLAT_BLANK });
  }
  return said.map((x) => ({ ...x, fields: figureFields(x.id, p, view), remove: x.id === "free" ? null : "part" }));
}

/** The parts the currency chooser may stand beside, in the order it looks for them: a sum per unit's or per action's, a minimum's, a maximum's. */
const CHOOSER_ON: readonly PartId[] = ["perUnit", "perAction", "min", "max"];

/** A price's parts with its currency chooser beside its first sum, where the fee may keep the price's sums in another currency. */
function withChooser(fee: Fee, p: Price, parts: OpenPart[]): { parts: OpenPart[]; chooser: Chooser | null } {
  const on = keeps(fee.kind, p.form, "currency") ? CHOOSER_ON.find((id) => parts.some((x) => x.id === id)) : undefined;
  if (!on) return { parts, chooser: null };
  const marked = parts.map((x) => (x.id === on ? { ...x, chooser: true as const, fields: x.fields.map((f) => (f.figure === "rate" ? f : { ...f, bare: true as const })) } : x));
  return { parts: marked, chooser: { currency: sumCurrency(fee.kind, p) as BoundCurrency, plain: anySourced(p) } };
}

/** A pending part as the open case asks it, on the price the toolbox acts on. */
function pendingOn(fee: Fee, stages: readonly Stage[], k: number, part: PendingPart): OpenPending {
  const ask = PARTS[part].ask;
  const figure = ask === "sum" || ask === "pct" ? PARTS[part].figures[0] : undefined;
  return { part, ask, k, ...PENDING[part]({ kind: fee.kind, p: stages[k]!.price }), ...(figure ? { figure } : {}) };
}

/** The case open in place: the fee's slots for the case, its prices' parts, and the part `pending` asking on the toolbox's price. */
export function openCase(r: DealRead, fee: Fee, caseId: string | undefined, pending: PendingPart | null = null): OpenCase {
  const priced = pricedOf(fee, caseId);
  const c = hasCases(fee) ? (priced as Case) : null;
  const stagesOf = (stages: readonly Stage[], apart: boolean): OpenStage[] =>
    stages.map((s, k) => ({ k, ...(s.until ? { until: s.until } : {}), ...withChooser(fee, s.price, openParts(fee, s.price, priceView([fee], 0, s.price, r.today), { sale: apart && k === 0 })) }));
  return {
    case: c?.id ?? null,
    slots: c && hasCases(fee) ? fee.by.map((b, t) => ({ thing: t, kind: b.kind, words: whenWords(fee, c.when[t]!, t, r.today), ...(b.kind === "track" ? { mine: !!c.mine } : {}) })) : [],
    buy: stagesOf(priced.stages, !!priced.sale),
    ...(priced.sale ? { sell: stagesOf(priced.sale, false) } : {}),
    pending: pending ? pendingOn(fee, priced.stages, toolPrice(priced), pending) : null,
    canCopy: !!c,
    canRemove: !!c && hasCases(fee) && fee.cases.length > 1,
  };
}

/**
 * One fee open in place, from the deal read once (`readDealFor`); null where the deal has no fee with that id. For a fee with cases, the
 * case open is `caseId`, else its first, which the edits edit where they name no case. Every price is there as typed, the passed ones too:
 * the open case edits them all. `pending`: a part the toolbox added that asks for what it needs in the case open.
 */
export function panel(r: DealRead, feeId: string, caseId?: string, pending: PendingPart | null = null): Panel | null {
  const fee = r.deal.fees.find((f) => f.id === feeId);
  if (!fee) return null;
  const shown = caseId ?? firstCase(fee);
  const priced = pricedOf(fee, shown);
  // a fee not read (prices out of order, not given, no case for the picks) is named on its own
  const at = r.fees.findIndex((x) => feeOf(x) === fee.id && (!hasCases(fee) || x.read?.case === (priced as Case).id));
  return { ...refOf(at >= 0 ? r.fees[at]! : { fee: fee.id, kind: fee.kind, ...(fee.name ? { name: fee.name } : {}) }, r.today), fee: fee.id, open: openCase(r, fee, shown, pending) };
}
