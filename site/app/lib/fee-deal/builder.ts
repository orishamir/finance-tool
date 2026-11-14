// The builder column (method §10.6): a block per fee, either a slim price or the band of its cases (F-114) with each case's value per thing
// and its parts in short; the case open in place, its slots and its parts with the figures it edits (`panel`); the toolbox's groups of
// parts for that case, the question a thing asks when it is added and a slot opened; the fees to suggest; and each fee's facts beside its
// prices and its standing against the cap now and where it next changes (the prices against the cap are the reading's law row,
// reading.ts). Every word a block shows is here, from the copy; a component only lays them out.
import type { ChangeKind } from "@finance-tool/engine";
import { feeDeal as copy } from "../../copy";
import type { SiteValue } from "../value";
import { feeOf, picked } from "./cases";
import { feeInOrder, feePriced, hasCases, isRange, monthKey, namesPlaces, pickKey, pricedOf, type Case, type CasesFee, type Fee, type MonthKey, type Num, type Price, type Priced, type Stage, type When } from "./model";
import { canAddBy, removeBy } from "./edit";
import { hasFlat } from "./offers/capabilities";
import { FIGURES, type Figure } from "./offers/figures";
import { feeOffered, offerFor } from "./offers/offer";
import { PART_IDS, PARTS, partsSaid, type PartId, type PartKind } from "./offers/parts";
import { FLAT_BLANK, OFFERED, SAID, feeNameOf, signOfUnit, type PartContext, type PartWords, type ToolBox, type ToolPartId } from "./part-words";
import { priceView, refOf, standingView, type DealRead, type FeeRef, type PriceView, type StandingView } from "./parts";
import { isConversion, onHolding, suggestions, WHAT_VALUES, type FeeKindId } from "./shapes";
import { BY_MAX, CONDITIONS, isRangeKind, type ByKind, type RangeUnit } from "./offers/conditions";
import { figure, insideFund, sumUnit } from "./values";

/** A price of a fee as a row shows it: the price, the month it ends where it ends, and its standing against the cap. */
export interface StageView {
  price: PriceView;
  until?: MonthKey;
  standing: StandingView;
}

/** One fee's next change after the reading's month, where it has one (F-110). */
export interface NextChange {
  at: MonthKey;
  change: ChangeKind;
}

/**
 * A fee's row in the builder: its prices in short and the facts beside them; for a fee with cases, those of its first case, the one the
 * edits edit where they name no case, so a card that shows one price shows and edits that one; and the fee as a block, every case in it.
 */
export interface BuilderRow extends FeeRef {
  stages: StageView[];
  /**
   * Whether every price the row shows is given (`feePriced`) and the fee is read: a fee with a price not given yet, or one the picks give no
   * case, shows its boxes and no standing or change.
   */
  priced: boolean;
  /** Whether the picks give the fee no case (F-114): it is not read, and its card says so rather than that a price is missing. */
  unmatched: boolean;
  /** A sale's own prices from the reading's month on, where a sale is priced apart. */
  sale?: StageView[];
  /** The fee's next change, and whether it is a start from free. */
  next?: NextChange;
  /** Whether the price now has a minimum and a maximum (on any side). */
  bounds: { min: boolean; max: boolean };
  /** Whether the fee is charged inside a fund. */
  insideFund: boolean;
  /** The standing now; a later price's is said with that price. */
  standingNow: StandingView;
  /** The fee as a block: a slim price, or the band of its cases. */
  block: FeeBlock;
}

/** A part as a slim line shows it: its id, its kind and its words. */
export interface SlimPart {
  id: PartId;
  kind: PartKind;
  words: PartWords;
}

/**
 * How a case names its value for one thing, as its band row and its slot say it: `any`, said fainter ("בכל מסלול"); otherwise its words
 * (`text`: the named values, joined), or for a range its step (`lead` "עד" or "מעל" and the top as a figure).
 */
export interface WhenWords {
  thing: number;
  any: boolean;
  text?: string;
  lead?: string;
  figure?: SiteValue;
}

/** A case as a band row shows it: its id, its value per thing, whether its track is the person's, whether it is open, and its parts. */
export interface CaseRow {
  case: string;
  when: WhenWords[];
  mine: boolean;
  open: boolean;
  /** Whether its prices are given and in order: a case still asking for a figure is read nowhere until it is. */
  priced: boolean;
  parts: SlimPart[];
  /**
   * Its price now against the cap (F-113), as a slim fee's row says it: the price charged, after its discount and without a third party's
   * fee, whichever case the reading reads.
   */
  standing: StandingView;
}

/** A thing a fee changes by, as the band's head names it (a pill): its place among the fee's things, its kind, and its words. */
export interface ThingPill {
  thing: number;
  kind: ByKind;
  words: string;
  /** Whether the reading picks a value of it, or reads it across sizes (F-115). */
  picked: boolean;
}

/**
 * A fee as a block: `slim`, a fee whose price changes by nothing, its parts in one line; `band`, the head's things and one row per case,
 * the cases on tracks that are not the person's folded into one line (`folded`: how many tracks, and their rows), where the person has
 * marked a track as theirs.
 */
export type FeeBlock =
  | { kind: "slim"; parts: SlimPart[]; open: boolean }
  | { kind: "band"; things: ThingPill[]; rows: CaseRow[]; folded?: { tracks: number; words: string; rows: CaseRow[] }; canAdd: boolean };

export interface Builder {
  rows: BuilderRow[];
  /** The fees to offer: the kind's that fit, then the rarer ones and the person's own. */
  suggestions: { usual: FeeKindId[]; rarer: FeeKindId[] };
}

/** A fee's prices as stage views, the fee being `fees[i]`. */
function stageViews(r: DealRead, fees: readonly Pick<Fee, "kind">[], i: number, stages: readonly Stage[]): StageView[] {
  return stages.map((s) => {
    const price = priceView(fees, i, s.price, r.today);
    return { price, ...(s.until ? { until: s.until } : {}), standing: standingView(r, fees, i, s.price, price) };
  });
}

/** The stages read from the reading's month on: those whose end is after it, and the last. */
const readStages = (r: DealRead, views: StageView[]): StageView[] => views.filter((s) => s.until === undefined || s.until > monthKey(r.reading.from));

// ---------------------------------------------------------------- the words of a price's parts

/**
 * A thing a fee's price changes by, in words that follow the fee: the size of its own action ("גודל ההמרה" on a conversion), a condition
 * of the person's own by its name, any other thing by its name.
 */
export const thingName = (kind: FeeKindId, b: { kind: ByKind; label?: string }): string =>
  b.kind === "own" ? (b.label ?? copy.cases.things.own!) : b.kind === "actionSize" ? (copy.cases.actionSize[kind] ?? copy.cases.actionSize.default!) : copy.cases.things[b.kind]!;
/** A price's parts as a slim line says them (`partsSaid`, `SAID`): its price, its end, its bounds, its links and its notes. */
export function slimParts(fee: Pick<Fee, "kind">, priced: Priced, r: Pick<DealRead, "today">): SlimPart[] {
  const stage = priced.stages[0]!;
  return saidParts({ kind: fee.kind, p: stage.price, view: priceView([fee], 0, stage.price, r.today), ...(stage.until ? { until: stage.until } : {}) }, !!priced.sale);
}

/** The parts a price says, each with its words, and a sale priced apart where the line has one; a part with nothing to say yet is left out. */
function saidParts(c: PartContext, sale: boolean): SlimPart[] {
  return partsSaid(c.p, { ...(c.until ? { until: c.until } : {}), sale }).flatMap((id) => {
    const words = SAID[id](c);
    return words ? [{ id, kind: PARTS[id].kind, words }] : [];
  });
}

// ---------------------------------------------------------------- a fee's cases

/** The words of one value the site names, or the person's own words. */
function valueWords(kind: ByKind, v: string): string {
  const list = kind === "held" ? copy.cases.values.what : (copy.cases.values as Record<string, Record<string, string>>)[kind];
  return list?.[v] ?? v;
}

/** How a case names its value for thing `t` (`WhenWords`). */
export function whenWords(fee: CasesFee, w: When, t: number, today: string): WhenWords {
  const b = fee.by[t]!;
  if (w === "any") return { thing: t, any: true, text: copy.cases.any[b.kind]! };
  if (isRange(b) && typeof w === "number") {
    const unit = b.unit === "units" || b.unit === "actions" ? "count" : sumUnit(b.unit);
    const at = w < b.tops.length ? b.tops[w]! : b.tops.at(-1)!;
    return { thing: t, any: false, lead: w < b.tops.length ? copy.cases.upTo : copy.cases.over, figure: figure(at, unit, today) };
  }
  return { thing: t, any: false, text: listWords(fee, t, w as string[]) };
}

/** Words that share a lead ending in ", " say it once: "בחו״ל, באירופה, בשאר העולם". */
function sharedLead(words: readonly string[]): string {
  const cut = words[0]?.indexOf(", ") ?? -1;
  const lead = cut > 0 ? words[0]!.slice(0, cut + 2) : "";
  if (words.length < 2 || !lead || !words.every((x) => x.startsWith(lead) && x.length > lead.length)) return words.join(", ");
  return lead + words.map((x) => x.slice(lead.length)).join(", ");
}

/**
 * A case's values of a list thing in words. Where the case names every value abroad but those the fee's other cases name, it says "מחוץ ל"
 * theirs after the lead they share ("בחו״ל, מחוץ לארה״ב"); else its values, a lead they share said once (`sharedLead`).
 */
function listWords(fee: CasesFee, t: number, values: readonly string[]): string {
  const b = fee.by[t]!;
  const words = values.map((v) => valueWords(b.kind, v));
  if (b.kind !== "what" && b.kind !== "held") return sharedLead(words);
  const abroad = Object.keys(WHAT_VALUES).filter((v) => WHAT_VALUES[v]!.place === "abroad");
  const others = new Set(fee.cases.flatMap((c) => (Array.isArray(c.when[t]) && c.when[t] !== values ? (c.when[t] as string[]).filter((v) => abroad.includes(v) && !values.includes(v)) : [])));
  const all = values.length > 1 && values.every((v) => abroad.includes(v)) && others.size > 0 && abroad.every((v) => values.includes(v) || others.has(v));
  if (!all) return sharedLead(words);
  const o = copy.cases.outside;
  // the lead the values abroad share ("בחו״ל")
  const lead = valueWords(b.kind, abroad[0]!).split(", ")[0]!;
  const names = abroad.filter((v) => others.has(v)).map((v) => o.names[v] ?? valueWords(b.kind, v));
  return `${lead}, ${o.lead}${names.join(o.and)}`;
}

/** A fee's things as the band's pills. */
const pillsOf = (fee: CasesFee): ThingPill[] => fee.by.map((b, t) => ({ thing: t, kind: b.kind, words: thingName(fee.kind, b), picked: picked(fee, b) }));

/** A case as its band row (`open`: the case open in place). */
function caseRow(r: DealRead, fee: CasesFee, c: Case, open: string | null): CaseRow {
  const from = monthKey(r.reading.from);
  return { case: c.id, when: c.when.map((w, t) => whenWords(fee, w, t, r.today)), mine: !!c.mine, open: c.id === open, priced: feeInOrder(c) && feePriced(c, from), parts: slimParts(fee, c, r), standing: standingNow(r, fee, c, c.id) };
}

/** The count of a number of tracks in words. */
const tracksWords = (n: number): string => (n === 1 ? copy.cases.folded.one : n === 2 ? copy.cases.folded.two : copy.cases.folded.many.replace("{n}", String(n)));

/**
 * A fee's block: slim, or its band. Where the person marked a track as theirs, the cases of the other tracks fold into one line, with how
 * many tracks they are; a case on any track stays in the band, and so does the open case.
 */
function blockOf(r: DealRead, fee: Fee, open: { fee: string; case: string | null } | null): FeeBlock {
  const isOpen = open?.fee === fee.id;
  if (!hasCases(fee)) return { kind: "slim", parts: slimParts(fee, fee, r), open: isOpen };
  const openCase = isOpen ? (open!.case ?? fee.cases[0]!.id) : null;
  const t = fee.by.findIndex((b) => b.kind === "track");
  const marked = t >= 0 && fee.cases.some((c) => c.mine);
  const foldedCase = (c: Case) => marked && !c.mine && c.when[t] !== "any" && c.id !== openCase;
  const rows = fee.cases.filter((c) => !foldedCase(c)).map((c) => caseRow(r, fee, c, openCase));
  const other = fee.cases.filter(foldedCase);
  const tracks = new Set(other.flatMap((c) => c.when[t] as string[])).size;
  return {
    kind: "band",
    things: pillsOf(fee),
    rows,
    ...(other.length ? { folded: { tracks, words: tracksWords(tracks), rows: other.map((c) => caseRow(r, fee, c, openCase)) } } : {}),
    canAdd: fee.by.length < BY_MAX,
  };
}

// ---------------------------------------------------------------- the rows

/** The case a fee's card, panel and toolbox show where none is named: its first, the one the edits edit where none is named (edit.ts). */
const firstCase = (fee: Fee): string | undefined => (hasCases(fee) ? fee.cases[0]!.id : undefined);

/**
 * A fee's row: the prices of its first case (or its own), from the reading where the reading reads that case, or on their own where it does
 * not (the picks give the fee another case, or none, or a price is not given yet).
 */
/**
 * The price now of a fee's case (or its own, `caseId` none) against the cap: from the reading where the reading reads that case, so its
 * share opens the reading's own calculation, else on its own.
 */
function standingNow(r: DealRead, fee: Fee, priced: Priced, caseId: string | undefined): StandingView {
  const i = r.fees.findIndex((x) => feeOf(x) === fee.id && x.read?.case === caseId);
  const fees = i >= 0 ? r.fees : [fee];
  const views = stageViews(r, fees, Math.max(i, 0), priced.stages);
  return (readStages(r, views)[0] ?? views.at(-1)!).standing;
}

function rowOf(r: DealRead, fee: Fee, open: { fee: string; case: string | null } | null): BuilderRow {
  const caseId = firstCase(fee);
  const i = r.fees.findIndex((x) => feeOf(x) === fee.id && x.read?.case === caseId);
  const priced = pricedOf(fee, caseId);
  // a fee the picks give no case is not read, whatever its first case states: its card says so (`unmatched`)
  const given = i >= 0 || (hasCases(fee) && !r.unmatched.includes(fee.id) && feeInOrder(priced) && feePriced(priced, monthKey(r.reading.from)));
  const fees = i >= 0 ? r.fees : [fee];
  const at = Math.max(i, 0);
  const stages = readStages(r, stageViews(r, fees, at, priced.stages));
  const sale = priced.sale ? readStages(r, stageViews(r, fees, at, priced.sale)) : undefined;
  const c = i < 0 ? undefined : r.reading.fees[i]!.changes[0];
  const now = stages[0] ?? stageViews(r, fees, at, priced.stages).at(-1)!;
  const has = (k: "min" | "max") => !!now.price.figures[k] || !!sale?.[0]?.price.figures[k];
  return {
    ...refOf(i >= 0 ? r.fees[i]! : { fee: fee.id, kind: fee.kind, ...(fee.name ? { name: fee.name } : {}) }, r.today),
    fee: fee.id,
    stages: stages.length ? stages : [now],
    priced: given,
    unmatched: r.unmatched.includes(fee.id),
    ...(sale ? { sale } : {}),
    ...(c ? { next: { at: monthKey(c.at), change: c.kind } } : {}),
    bounds: { min: has("min"), max: has("max") },
    insideFund: insideFund(fee),
    standingNow: now.standing,
    block: blockOf(r, fee, open),
  };
}

/** The suggestions the deal's product is offered (`feeOffered`, the rule table) and may charge (`barred`). */
const offered = (s: Builder["suggestions"], product: DealRead["kind"], barred: readonly FeeKindId[]): Builder["suggestions"] => {
  const ok = (k: FeeKindId) => !barred.includes(k) && feeOffered(product, k);
  return { usual: s.usual.filter(ok), rarer: s.rarer.filter(ok) };
};

/**
 * The builder column of a deal, from the deal read once (`readDealFor`): a row per fee, the read ones and those not read for a price not
 * given or for no case for the picks, each with its block; a fee whose prices are out of order has none (the glance names it, `unread`).
 * `barred`: fees the deal's product may not charge by rule, never offered, nor is a fee its product is not offered (`feeOffered`). `open`:
 * the fee open in place, and its case (the first where none is named).
 */
export function builder(r: DealRead, barred: readonly FeeKindId[] = [], open: { fee: string; case: string | null } | null = null): Builder {
  const deal = r.deal;
  return {
    rows: deal.fees.filter((fee) => !r.unread.includes(fee.id)).map((fee) => rowOf(r, fee, open)),
    suggestions: deal.kind && r.kind ? offered(suggestions(deal.kind, r.kind.bases, deal.fees.map((f) => f.kind), undefined), r.kind, barred) : { usual: [], rarer: ["own"] },
  };
}

// ---------------------------------------------------------------- one fee's panel, and the case open in place

/** One fee open in place: the fee, and its case open (a slim fee's price, which opens the same way) with its slots and its parts' fields. */
export interface Panel extends FeeRef {
  open: OpenCase;
}

/**
 * A field of a part in the open case: the figure it edits (`edit.ts`, `Figure`), its value (null while it is blank or absent), and the sign
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
  removable: boolean;
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
}

/** A part's fields: each figure it holds that the price has a place for, with its value and its box's sign. */
const fieldsOf = (id: PartId, p: Price, view: PriceView): PartField[] =>
  PARTS[id].figures.filter((f) => FIGURES[f].placed(p)).map((f) => ({ figure: f, value: view.figures[f] ?? null, sign: signOfUnit(FIGURES[f].unit(p)) }));

/**
 * A price's parts with the figures each edits, in the order a line says them, its end among them where it ends (`until`) and a sale priced
 * apart where the line has one. Every part can be taken away but the price's form.
 */
function openParts(fee: Fee, p: Price, view: PriceView, line: { until?: MonthKey; sale: boolean }): OpenPart[] {
  const said = saidParts({ kind: fee.kind, p, view, ...(line.until ? { until: line.until } : {}) }, line.sale);
  // a flat price nobody typed yet is in the price too: it shows as an empty part where a typed one stands, after the bounds
  if (hasFlat(p) && p.flat && !said.some((x) => x.id === "flat")) {
    const at = said.findIndex((x) => PART_IDS.indexOf(x.id) > PART_IDS.indexOf("flat"));
    said.splice(at < 0 ? said.length : at, 0, { id: "flat", kind: PARTS.flat.kind, words: FLAT_BLANK });
  }
  return said.map((x) => ({ ...x, fields: fieldsOf(x.id, p, view), removable: PARTS[x.id].form === undefined }));
}

/** The case open in place: the fee's slots for the case, and its prices' parts. */
function openCase(r: DealRead, fee: Fee, caseId: string | undefined): OpenCase {
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

// ---------------------------------------------------------------- the toolbox

/** A part as a toolbox card: its id, its words for the fee's kind (around the box it asks for: a percent, a sum, a month), and whether the case has it. */
export interface ToolPart {
  id: PartId | `by:${ByKind}`;
  kind: PartKind | "by";
  words: PartWords;
  /** The box the card shows: a percent, a sum in a currency (its sign), a month, or none. */
  box?: ToolBox;
  /** The case has it already: a ✓, muted, not removed. */
  used: boolean;
  /** It cannot be added, with why (a fourth thing to change by). */
  off?: string;
}

/** A toolbox group: its kind and head, and its parts in order. */
export interface ToolGroup {
  group: "price" | "bound" | "by" | "link" | "more";
  head: string;
  parts: ToolPart[];
}

/**
 * The toolbox for the case open in place: the line naming what it adds to (the case's values, joined; a slim fee's own name), and its
 * groups in order: the price, minimum and maximum, what the price changes by, a link to another fee, and more on the price;
 * each part's words follow the fee (a conversion's "לכל המרה", "מההמרה"), and a part the case already has is `used`. A group shows what the
 * product's fee is offered (`offerFor`, narrowed by the rule table) that its price can hold now; what a deal already holds beyond the offer
 * still opens and reads.
 */
export interface Toolbox {
  /** "להוסיף למקרה: " and the open case's values (`when`), or a slim fee's name (`name`). */
  addTo: { lead: string; when?: WhenWords[]; name?: string };
  groups: ToolGroup[];
}

/** The toolbox's groups in order, each with its parts in order; what the price changes by is the fee's things (`conditionsFor`). */
const TOOLBOX: readonly { group: ToolGroup["group"]; kind: ToolPart["kind"]; parts: readonly ToolPartId[] }[] = [
  { group: "price", kind: "price", parts: ["share", "perUnit", "perAction", "held", "sum", "discount", "third", "flat", "until"] },
  { group: "bound", kind: "bound", parts: ["min", "max", "cap"] },
  { group: "by", kind: "by", parts: [] },
  { group: "link", kind: "link", parts: ["offset", "refund"] },
  { group: "more", kind: "note", parts: ["unfilled", "partial", "sale"] },
];

export function toolbox(r: DealRead, feeId: string, caseId?: string): Toolbox | null {
  const fee = r.deal.fees.find((f) => f.id === feeId);
  if (!fee) return null;
  const shown = caseId ?? firstCase(fee);
  const priced = pricedOf(fee, shown);
  const p = priced.stages[0]!.price;
  // what the product's fee is offered (the rule table narrows it), of which the parts its price can hold now
  const offer = offerFor(r.kind, fee.kind);
  const parts = (g: (typeof TOOLBOX)[number]): ToolPart[] =>
    g.group === "by"
      ? byParts(fee, offer.conditions)
      : g.parts.filter((id) => offer.parts.includes(id) && PARTS[id].holds(fee.kind, p)).map((id) => ({ id, kind: g.kind, ...OFFERED[id]({ kind: fee.kind, p }), used: PARTS[id].used(p, priced) }));
  const c = hasCases(fee) ? (priced as Case) : null;
  const addTo = c && hasCases(fee) ? { lead: copy.cases.addTo, when: c.when.map((w, t) => whenWords(fee, w, t, r.today)) } : { lead: copy.cases.addTo, name: feeNameOf(fee.kind, fee.name) };
  const groups = TOOLBOX.map((g) => ({ group: g.group, head: copy.cases.groups[g.group]!, parts: parts(g) }));
  return { addTo, groups: groups.filter((g) => g.parts.length > 0) };
}

/** The things a fee is offered to change by, as the toolbox's cards: one it changes by already is used, and none more can be added past three. */
function byParts(fee: Fee, offered: readonly ByKind[]): ToolPart[] {
  const have = new Set((fee.by ?? []).map((b) => (b.kind === "held" ? "what" : b.kind)));
  const full = (fee.by?.length ?? 0) >= BY_MAX;
  return offered.map((k) => {
    const used = k !== "own" && have.has(k === "held" ? "what" : k);
    return { id: `by:${k}` as const, kind: "by" as const, words: { lead: thingName(fee.kind, { kind: k }) }, used, ...(full && !used ? { off: copy.cases.full } : {}) };
  });
}

/** Whether a fee is a conversion or charged on what is held, which words of what it changes by follow (the toolbox's first thing). */
export const firstThing = (kind: FeeKindId): ByKind => (isConversion(kind) ? "currency" : onHolding(kind) ? "held" : "what");

/** The key the reading picks a thing of a fee by (`pickKey`), for a pill that opens the reading's pick. */
export const thingKey = (fee: CasesFee, t: number): string => pickKey(fee.by[t]!);

/** A range's tops as plain numbers, for a slot's field. */
export const topsOf = (fee: CasesFee, t: number): number[] => {
  const b = fee.by[t]!;
  return isRange(b) ? b.tops.map((n: Num) => n.v) : [];
};

// ---------------------------------------------------------------- adding a thing, and a case's slot opened

/** A range's unit as a choice says it: a currency's sign, or the words for units or actions. */
const unitWords = (u: RangeUnit): string => (u === "units" || u === "actions" ? copy.cases.units[u]! : (copy.panel.signs[u] ?? u));

/**
 * The question a thing asks once when it is added to a fee: its words; for a list, the values the site names to tick, and the
 * line for a value in the person's own words; for a range, its units (the first its usual one); and why it cannot be added, where it
 * cannot (`off`: a fourth thing, or one the fee changes by already).
 */
export interface ByQuestion {
  kind: ByKind;
  ask: string;
  values?: { id: string; words: string }[];
  other?: string;
  units?: { unit: RangeUnit; words: string }[];
  add: string;
  cancel: string;
  off?: string;
}

export function byQuestion(fee: Fee, kind: ByKind): ByQuestion {
  const c = copy.cases;
  const base = { kind, add: c.add, cancel: c.cancel, ...(canAddBy(fee, kind) || kind === "own" ? {} : { off: (fee.by?.length ?? 0) >= BY_MAX ? c.full : "" }) };
  const values = CONDITIONS[kind].values;
  switch (values.kind) {
    case "range":
      return { ...base, ask: c.ask.range!.replace("{thing}", thingName(fee.kind, { kind })), units: values.units.map((u) => ({ unit: u, words: unitWords(u) })) };
    case "list":
      return { ...base, ask: c.ask[kind]!, values: values.ids.map((id) => ({ id, words: valueWords(kind, id) })), other: kind === "channel" ? c.otherChannel : c.otherValue };
    default:
      return { ...base, ask: c.ask[kind]! };
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
      return { kind: "list", title: copy.cases.slot.list.replace("{thing}", thing), options: ids.map((id) => ({ id, words: valueWords(b.kind, id), ticked: named.includes(id) })), any, other: b.kind === "channel" ? copy.cases.otherChannel : copy.cases.otherValue };
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
