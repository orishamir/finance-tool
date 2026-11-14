// The builder column (method §10.6): a block per fee, either a slim price or the band of its cases (F-114) with each case's value per thing
// and its parts in short; the case open in place, its slots and its parts with the figures it edits (`panel`); the toolbox's groups of
// parts for that case, the question a thing asks when it is added and a slot opened; the fees to suggest; and each fee's facts beside its
// prices and its standing against the cap now and where it next changes (the prices against the cap are the reading's law row,
// reading.ts). Every word a block shows is here, from the copy; a component only lays them out.
import type { ChangeKind } from "@finance-tool/engine";
import { feeDeal as copy, guideBlocks } from "../../copy";
import type { SiteValue } from "../value";
import { feeOf, picked } from "./cases";
import { feeInOrder, feePriced, hasCases, isRange, monthKey, pickKey, pricedOf, type Case, type CasesFee, type Fee, type MonthKey, type Num, type Price, type Priced, type Stage, type When } from "./model";
import { canAddBy, removeBy, type Figure, type PartId } from "./edit";
import { managementFee } from "./kinds";
import { charged, hasBounds, hasCap, hasCurrency, hasFlat, onAction } from "./offers/capabilities";
import { priceView, refOf, standingView, type DealRead, type FeeRef, type PriceView, type StandingView } from "./parts";
import { BY_MAX, byKindsFor, FEE_SHAPES, isConversion, isRangeKind, LIST_IDS, onHolding, ONE_SIDE, RANGE_UNITS, suggestions, WHAT_VALUES, type ByKind, type FeeKindId, type FieldId, type ListKind, type RangeUnit } from "./shapes";
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

/**
 * The words of one part of a price, in order: `lead` before its figure, the figure (`figure`, in its number state), `mid` and a second
 * figure (`second`: a flat price's top), a month (`month`, said as the page says months), `tail` after them, and `quiet` said fainter at the
 * end ("בלי סכום בתעריפון"). Any of them may be absent.
 */
export interface PartWords {
  lead?: string;
  figure?: SiteValue;
  mid?: string;
  second?: SiteValue;
  month?: MonthKey;
  tail?: string;
  quiet?: string;
}

/**
 * The kind of a part, which gives its colour and icon: `price` (a share, a sum, a discount, a third party's fee, a time limit; neutral),
 * `bound` (a minimum, a maximum, a percent maximum, a flat price for a small action), `link` (an offset or a refund), `note` (words on an
 * order, a sale priced apart; a dashed edge).
 */
export type PartKind = "price" | "bound" | "link" | "note";

export type { PartId } from "./edit";

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

/** A fee's name as the page writes it: the guide's for a base the records list, else the page's own, or the person's for their own. */
export const feeNameOf = (kind: FeeKindId, own?: string): string => (kind === "own" && own ? own : ((guideBlocks.fees[kind] as { name?: string } | undefined)?.name ?? copy.names[kind] ?? kind));

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

const perAction = (kind: FeeKindId): string => copy.price.perAction[kind] ?? copy.price.perAction.default!;
/**
 * A thing a fee's price changes by, in words that follow the fee: the size of its own action ("גודל ההמרה" on a conversion), a condition
 * of the person's own by its name, any other thing by its name.
 */
export const thingName = (kind: FeeKindId, b: { kind: ByKind; label?: string }): string =>
  b.kind === "own" ? (b.label ?? copy.cases.things.own!) : b.kind === "actionSize" ? (copy.cases.actionSize[kind] ?? copy.cases.actionSize.default!) : copy.cases.things[b.kind]!;
const shareOf = (kind: FeeKindId): string => copy.price.of[kind] ?? copy.price.of.default!;
const boundPer = (kind: FeeKindId): string => copy.cases.parts.boundPer[kind] ?? copy.cases.parts.boundPer.default!;

/** A price's parts as a slim line says them, in the toolbox's order of kinds: its price, its bounds, its links and its notes. */
export function slimParts(fee: Pick<Fee, "kind">, priced: Priced, r: Pick<DealRead, "today">): SlimPart[] {
  const stage = priced.stages[0]!;
  const view = priceView([fee], 0, stage.price, r.today);
  const out: SlimPart[] = [...priceParts(fee.kind, stage.price, view)];
  // a later price, said by when this one ends
  if (stage.until) out.push({ id: "until", kind: "price", words: { lead: copy.cases.parts.until, month: stage.until } });
  out.push(...boundParts(fee.kind, view), ...linkParts(stage.price, view), ...noteParts(stage.price, !!priced.sale));
  return out;
}

/** The words of a price's main figure, and of its discount and third party's fee. */
function priceParts(kind: FeeKindId, p: Price, view: PriceView): SlimPart[] {
  const f = view.figures;
  const out: SlimPart[] = [];
  switch (p.form) {
    case "free":
      return [{ id: "free", kind: "price", words: { lead: copy.price.free } }];
    case "action":
      out.push({ id: "share", kind: "price", words: { ...(f.rate ? { figure: f.rate } : {}), tail: ` ${perAction(kind)}` } });
      break;
    case "perUnit":
      out.push({ id: "perUnit", kind: "price", words: { ...(f.amount ? { figure: f.amount } : {}), tail: ` ${copy.cases.parts.perUnit}` } });
      break;
    case "perAction":
      out.push({ id: "perAction", kind: "price", words: { ...(f.amount ? { figure: f.amount } : {}), tail: ` ${perAction(kind)}` } });
      break;
    case "held":
      out.push({ id: "held", kind: "price", words: { ...(f.rate ? { figure: f.rate } : {}), tail: ` ${copy.price.per[p.per]}` } });
      break;
    case "sum":
      out.push({ id: "sum", kind: "price", words: { ...(f.amount ? { figure: f.amount } : {}), tail: ` ${copy.price.per[p.every]}` } });
      break;
  }
  if (onAction(p)) {
    const d = copy.cases.parts.discount;
    if (p.discount) out.push({ id: "discount", kind: "price", words: { lead: d.lead, ...(f.discount ? { figure: f.discount } : {}), tail: `${d.tail}${p.discount.alsoMin ? d.alsoMin : ""}` } });
    if (p.third) {
      const lead = p.third.who ? `${copy.cases.parts.thirdOf}${p.third.who}` : copy.cases.parts.third;
      out.push({ id: "third", kind: "price", words: p.third.price ? { lead: `${lead} `, ...(f.third ? { figure: f.third } : {}) } : { lead, quiet: ` ${copy.cases.parts.thirdNone}` } });
    }
  }
  return out;
}

/** The words of a price's bounds: its minimum and maximum on each action (or charge), its percent maximum, its flat price. */
function boundParts(kind: FeeKindId, view: PriceView): SlimPart[] {
  const f = view.figures;
  const pp = copy.cases.parts;
  // a held share's bounds are per charge, or in the period the price list prints them ("מינימום 40 ₪ בחודש")
  const per = view.form === "held" ? ` ${view.boundsEvery ? copy.price.per[view.boundsEvery] : copy.panel.perCharge}` : ` ${boundPer(kind)}`;
  return [
    ...(f.min ? [{ id: "min" as const, kind: "bound" as const, words: { lead: pp.min, figure: f.min, tail: per } }] : []),
    ...(f.max ? [{ id: "max" as const, kind: "bound" as const, words: { lead: pp.max, figure: f.max, tail: per } }] : []),
    ...(f.cap ? [{ id: "cap" as const, kind: "bound" as const, words: { lead: pp.max, figure: f.cap, tail: ` ${shareOf(kind)}` } }] : []),
    ...(f.flat ? [{ id: "flat" as const, kind: "bound" as const, words: { lead: pp.flat.lead, figure: f.flat, mid: pp.flat.tail, ...(f.upTo ? { second: f.upTo } : {}) } }] : []),
  ];
}

/** The words of a price's links: the fee it is offset against, and its refund. */
function linkParts(p: Price, view: PriceView): SlimPart[] {
  if (!charged(p)) return [];
  const o = copy.cases.parts.offsetOf;
  return [
    ...(p.offset ? [{ id: "offset" as const, kind: "link" as const, words: { lead: `${o.lead}${feeNameOf(p.offset.kind)}${o.tail}` } }] : []),
    ...(p.refund ? [{ id: "refund" as const, kind: "link" as const, words: { lead: copy.cases.parts.refund, ...(view.figures.refund ? { figure: view.figures.refund } : {}) } }] : []),
  ];
}

/** The words of a price's notes on an order, and of a sale priced apart. */
function noteParts(p: Price, saleApart: boolean): SlimPart[] {
  const notes = onAction(p) ? (p.notes ?? []) : [];
  return [...notes.map((n) => ({ id: n as PartId, kind: "note" as const, words: { lead: copy.cases.parts.notes[n]! } })), ...(saleApart ? [{ id: "sale" as const, kind: "note" as const, words: { lead: copy.cases.parts.notes.sale! } }] : [])];
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

const offered = (s: Builder["suggestions"], barred: readonly FeeKindId[]): Builder["suggestions"] => ({ usual: s.usual.filter((k) => !barred.includes(k)), rarer: s.rarer.filter((k) => !barred.includes(k)) });

/**
 * The builder column of a deal, from the deal read once (`readDealFor`): a row per fee, the read ones and those not read for a price not
 * given or for no case for the picks, each with its block; a fee whose prices are out of order has none (the glance names it, `unread`).
 * `barred`: fees the deal's product may not charge by rule, never offered. `open`: the fee open in place, and its case (the first where
 * none is named).
 */
export function builder(r: DealRead, barred: readonly FeeKindId[] = [], open: { fee: string; case: string | null } | null = null): Builder {
  const deal = r.deal;
  return {
    rows: deal.fees.filter((fee) => !r.unread.includes(fee.id)).map((fee) => rowOf(r, fee, open)),
    suggestions: deal.kind && r.kind ? offered(suggestions(deal.kind, r.kind.bases, deal.fees.map((f) => f.kind), undefined), barred) : { usual: [], rarer: ["own"] },
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

/** The sign after a sum's box: its currency's. */
const signOf = (currency: string | undefined): string => copy.panel.signs[currency ?? "ILS"] ?? "₪";

/** A price's parts with the figures each edits, from its slim words. */
function openParts(fee: Fee, p: Price, view: PriceView, saleApart: boolean): OpenPart[] {
  const f = view.figures;
  const value = (n: SiteValue | undefined) => n ?? null;
  const cur = hasCurrency(p) ? p.currency : undefined;
  const fieldsFor = (id: PartId): PartField[] => {
    switch (id) {
      case "share":
      case "held":
        return [{ figure: "rate", value: value(f.rate), sign: "pct" }];
      case "perUnit":
      case "perAction":
        return [{ figure: "amount", value: value(f.amount), sign: signOf(cur) }];
      case "sum":
        return [{ figure: "amount", value: value(f.amount), sign: signOf("ILS") }];
      case "discount":
        return [{ figure: "discount", value: value(f.discount), sign: "pct" }];
      case "third": {
        const t = onAction(p) && p.third?.price;
        if (!t) return [];
        return [{ figure: "third", value: value(f.third), sign: t.form === "action" ? "pct" : signOf(t.currency) }, ...(t.form === "perAction" ? [] : [{ figure: "thirdMin" as const, value: value(f.thirdMin), sign: signOf(t.currency) }, { figure: "thirdMax" as const, value: value(f.thirdMax), sign: signOf(t.currency) }])];
      }
      case "min":
      case "max":
        return [{ figure: id, value: value(f[id]), sign: signOf(p.form === "held" ? "ILS" : cur) }];
      case "cap":
        return [{ figure: "cap", value: value(f.cap), sign: "pct" }];
      case "flat":
        return [{ figure: "flat", value: value(f.flat), sign: signOf(cur) }, { figure: "upTo", value: value(f.upTo), sign: signOf(cur) }];
      case "refund":
        return [{ figure: "refund", value: value(f.refund), sign: signOf(cur) }];
      default:
        return [];
    }
  };
  const slim = [...priceParts(fee.kind, p, view), ...boundParts(fee.kind, view), ...linkParts(p, view), ...noteParts(p, saleApart)];
  // a bound, a cap or a flat price nobody typed yet is in the price too: it shows as an empty part while it is
  const flatBlank = hasFlat(p) && p.flat && !slim.some((x) => x.id === "flat") ? [{ id: "flat" as const, kind: "bound" as const, words: { lead: copy.cases.parts.flat.lead, mid: copy.cases.parts.flat.tail } }] : [];
  return [...slim, ...flatBlank].map((x) => ({ ...x, fields: fieldsFor(x.id), removable: x.kind !== "price" || x.id === "discount" || x.id === "third" }));
}

/** The case open in place: the fee's slots for the case, and its prices' parts. */
function openCase(r: DealRead, fee: Fee, caseId: string | undefined): OpenCase {
  const priced = pricedOf(fee, caseId);
  const c = hasCases(fee) ? (priced as Case) : null;
  // a price that ends has its month as a part, after its price's own parts ("לזמן מוגבל, עד")
  const withUntil = (parts: OpenPart[], until: MonthKey | undefined): OpenPart[] => {
    if (!until) return parts;
    const at = parts.findIndex((x) => x.kind !== "price");
    const part: OpenPart = { id: "until", kind: "price", words: { lead: copy.cases.parts.until, month: until }, fields: [], removable: true };
    return at < 0 ? [...parts, part] : [...parts.slice(0, at), part, ...parts.slice(at)];
  };
  const stagesOf = (stages: readonly Stage[], apart: boolean) => stages.map((s, k) => ({ k, ...(s.until ? { until: s.until } : {}), parts: withUntil(openParts(fee, s.price, priceView([fee], 0, s.price, r.today), apart && k === 0), s.until) }));
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
  box?: "pct" | "month" | { sign: string };
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
 * each part's words follow the fee (a conversion's "לכל המרה", "מההמרה"), and a part the case already has is `used`. A provident-family
 * product's management fee (`managementFee`) is offered only what its rules allow: its share, a price for a period, and a condition of the
 * person's own (PF-01, KGL-14, PF-13); what a deal already holds beyond that still opens and reads.
 */
export interface Toolbox {
  /** "להוסיף למקרה: " and the open case's values (`when`), or a slim fee's name (`name`). */
  addTo: { lead: string; when?: WhenWords[]; name?: string };
  groups: ToolGroup[];
}

export function toolbox(r: DealRead, feeId: string, caseId?: string): Toolbox | null {
  const fee = r.deal.fees.find((f) => f.id === feeId);
  if (!fee) return null;
  const shown = caseId ?? firstCase(fee);
  const priced = pricedOf(fee, shown);
  const p = priced.stages[0]!.price;
  const shape = FEE_SHAPES[fee.kind];
  const can = (form: Exclude<Price["form"], "free">) => shape.forms.includes(form);
  const fieldOk = (field: FieldId) => p.form !== "free" && (shape.fields[p.form] ?? []).includes(field);
  const onAct = onAction(p);
  const cur = hasCurrency(p) && p.currency ? p.currency : "ILS";
  const pp = copy.cases.parts;
  const price: ToolPart[] = [
    ...(can("action") ? [{ id: "share" as const, kind: "price" as const, words: { tail: ` ${perAction(fee.kind)}` }, box: "pct" as const, used: p.form === "action" }] : []),
    ...(can("perUnit") ? [{ id: "perUnit" as const, kind: "price" as const, words: { tail: ` ${pp.perUnit}` }, box: { sign: signOf(cur) }, used: p.form === "perUnit" }] : []),
    // a sum per action keeps the price's currency only where the fee may hold one for it (`FEE_SHAPES`), else it is in shekels
    ...(can("perAction") ? [{ id: "perAction" as const, kind: "price" as const, words: { tail: ` ${perAction(fee.kind)}` }, box: { sign: signOf((shape.fields.perAction ?? []).includes("currency") ? cur : "ILS") }, used: p.form === "perAction" }] : []),
    ...(can("held") ? [{ id: "held" as const, kind: "price" as const, words: { tail: ` ${copy.price.per[12]}` }, box: "pct" as const, used: p.form === "held" }] : []),
    ...(can("sum") ? [{ id: "sum" as const, kind: "price" as const, words: { tail: ` ${copy.price.per[1]}` }, box: { sign: signOf("ILS") }, used: p.form === "sum" }] : []),
    ...(onAct || can("action") || can("perAction") ? [{ id: "discount" as const, kind: "price" as const, words: { lead: pp.discount.lead, tail: pp.discount.tail }, box: "pct" as const, used: onAct && !!p.discount }] : []),
    ...(onAct || can("action") || can("perAction") ? [{ id: "third" as const, kind: "price" as const, words: { lead: pp.third }, used: onAct && !!p.third }] : []),
    // a flat price for a small action, where the fee's price list may print one (a trade, a conversion)
    ...((shape.fields.action ?? []).includes("flat") || (shape.fields.perUnit ?? []).includes("flat") ? [{ id: "flat" as const, kind: "price" as const, words: { lead: pp.flatSmall[fee.kind] ?? pp.flatSmall.default! }, box: { sign: signOf(cur) }, used: hasFlat(p) && !!p.flat }] : []),
    { id: "until", kind: "price", words: { lead: pp.until }, box: "month", used: priced.stages.length > 1 },
  ];
  const bound: ToolPart[] = [
    ...(fieldOk("min") || can("action") ? [{ id: "min" as const, kind: "bound" as const, words: { lead: pp.min }, box: { sign: signOf(p.form === "held" ? "ILS" : cur) }, used: hasBounds(p) && !!p.min }] : []),
    ...(fieldOk("max") || can("action") ? [{ id: "max" as const, kind: "bound" as const, words: { lead: pp.max }, box: { sign: signOf(p.form === "held" ? "ILS" : cur) }, used: hasBounds(p) && !!p.max }] : []),
    ...((shape.fields.action ?? []).includes("cap") ? [{ id: "cap" as const, kind: "bound" as const, words: { lead: pp.max, tail: ` ${shareOf(fee.kind)}` }, box: "pct" as const, used: hasCap(p) && !!p.cap }] : []),
  ];
  const kinds = byKindsFor(fee.kind);
  const have = new Set((fee.by ?? []).map((b) => (b.kind === "held" ? "what" : b.kind)));
  const full = (fee.by?.length ?? 0) >= BY_MAX;
  const by: ToolPart[] = kinds.map((k) => {
    const used = k !== "own" && have.has(k === "held" ? "what" : k);
    return { id: `by:${k}` as const, kind: "by" as const, words: { lead: thingName(fee.kind, { kind: k }) }, used, ...(full && !used ? { off: copy.cases.full } : {}) };
  });
  const link: ToolPart[] = [
    { id: "offset", kind: "link", words: { lead: pp.offset }, used: charged(p) && !!p.offset },
    { id: "refund", kind: "link", words: { lead: pp.refund.trim() }, box: { sign: signOf(cur) }, used: charged(p) && !!p.refund },
  ];
  const notes = onAct ? (p.notes ?? []) : [];
  const more: ToolPart[] = [
    ...(onAct || can("action") ? (["unfilled", "partial"] as const).map((n) => ({ id: n, kind: "note" as const, words: { lead: pp.notes[n]! }, used: notes.includes(n) })) : []),
    ...(shape.saleApart && !ONE_SIDE[fee.kind] ? [{ id: "sale" as const, kind: "note" as const, words: { lead: pp.notes.sale! }, used: !!priced.sale }] : []),
  ];
  const c = hasCases(fee) ? (priced as Case) : null;
  // a provident-family product's management fee: its share, a price for a period, and a condition of the person's own, nothing else
  // (PF-01, KGL-14, PF-13)
  const managed = managementFee(r.kind, fee.kind);
  const addTo = c && hasCases(fee) ? { lead: copy.cases.addTo, when: c.when.map((w, t) => whenWords(fee, w, t, r.today)) } : { lead: copy.cases.addTo, name: feeNameOf(fee.kind, fee.name) };
  const groups: ToolGroup[] = managed
    ? [
        { group: "price", head: copy.cases.groups.price!, parts: price.filter((x) => x.id === "share" || x.id === "held" || x.id === "until") },
        { group: "by", head: copy.cases.groups.by!, parts: by.filter((x) => x.id === "by:own") },
      ]
    : [
        { group: "price", head: copy.cases.groups.price!, parts: price },
        { group: "bound", head: copy.cases.groups.bound!, parts: bound },
        { group: "by", head: copy.cases.groups.by!, parts: by },
        { group: "link", head: copy.cases.groups.link!, parts: link },
        { group: "more", head: copy.cases.groups.more!, parts: more },
      ];
  return { addTo, groups: groups.filter((g) => g.parts.length > 0) };
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
  if (isRangeKind(kind)) return { ...base, ask: c.ask.range!.replace("{thing}", thingName(fee.kind, { kind })), units: RANGE_UNITS[kind].map((u) => ({ unit: u, words: unitWords(u) })) };
  if (kind === "track" || kind === "own") return { ...base, ask: c.ask[kind]! };
  const ids = LIST_IDS[kind as ListKind];
  return { ...base, ask: c.ask[kind]!, values: ids.map((id) => ({ id, words: valueWords(kind, id) })), other: kind === "channel" ? c.otherChannel : c.otherValue };
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
  if (isRange(b)) {
    const step = typeof w === "number" ? w : null;
    const before = step !== null && step > 0 ? whenWords(fee, step - 1, t, r.today) : null;
    return { kind: "range", title: copy.cases.slot.range.replace("{thing}", thing), upTo: step !== null && step < b.tops.length ? b.tops[step]!.v : null, any, unit: b.unit, units: RANGE_UNITS[b.kind].map((u) => ({ unit: u, words: unitWords(u) })), before };
  }
  const named = Array.isArray(w) ? w : [];
  if (b.kind === "track") return { kind: "track", title: copy.cases.slot.trackName, name: named[0] ?? null, any, mine: !!c.mine, myTrack: copy.cases.slot.myTrack };
  if (b.kind === "own") return { kind: "own", title: thing, name: named[0] ?? null, any };
  const ids = [...LIST_IDS[b.kind as ListKind], ...((b.kind === "what" || b.kind === "held") && b.own ? b.own.map((o) => o.name) : [])];
  // a value of the person's own a case names that the thing's list does not (a channel, a currency) is a choice too
  for (const v of fee.cases.flatMap((x) => (Array.isArray(x.when[t]) ? (x.when[t] as string[]) : []))) if (!ids.includes(v)) ids.push(v);
  return { kind: "list", title: copy.cases.slot.list.replace("{thing}", thing), options: ids.map((id) => ({ id, words: valueWords(b.kind, id), ticked: named.includes(id) })), any, other: b.kind === "channel" ? copy.cases.otherChannel : copy.cases.otherValue };
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
