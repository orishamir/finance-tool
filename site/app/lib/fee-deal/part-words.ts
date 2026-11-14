// The words of each part of a price (method §10.6), keyed by the part registry's ids (offers/parts.ts): as a slim line, a case's row and
// the open case say a part the price has, and as the toolbox's card offers a part to add. Every word is from the copy; the views
// (builder.ts) only arrange them, and a component only lays them out.
import { feeDeal as copy, guideBlocks } from "../../copy";
import type { SiteValue } from "../value";
import type { MonthKey, Price } from "./model";
import { charged, hasCurrency, onAction } from "./offers/capabilities";
import type { FigureUnit } from "./offers/figures";
import type { PartId } from "./offers/parts";
import type { PriceView } from "./parts";
import { type FeeKindId } from "./shapes";
import { fieldsOf } from "./offers/capacity";

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

/** A fee's name as the page writes it: the guide's for a base the records list, else the page's own, or the person's for their own. */
export const feeNameOf = (kind: FeeKindId, own?: string): string => (kind === "own" && own ? own : ((guideBlocks.fees[kind] as { name?: string } | undefined)?.name ?? copy.names[kind] ?? kind));

/** The sign after a sum's box: its currency's. */
export const signOf = (currency: string | undefined): string => copy.panel.signs[currency ?? "ILS"] ?? "₪";

/** The sign after a figure's box: a percent, or its currency's sign. */
export const signOfUnit = (u: FigureUnit): "pct" | string => ("pct" in u ? "pct" : signOf(u.currency));

const pp = copy.cases.parts;
const perAction = (kind: FeeKindId): string => copy.price.perAction[kind] ?? copy.price.perAction.default!;
const shareOf = (kind: FeeKindId): string => copy.price.of[kind] ?? copy.price.of.default!;
const boundPer = (kind: FeeKindId): string => pp.boundPer[kind] ?? pp.boundPer.default!;
const fig = (v: SiteValue | undefined) => (v ? { figure: v } : {});

/** What a part's words are made from: the fee's kind, the price and its view, and the month the price ends, where it ends. */
export interface PartContext {
  kind: FeeKindId;
  p: Price;
  view: PriceView;
  until?: MonthKey;
}

/** A bound's period: per action (or per the fee's own unit), per charge for a share of what is held, or as the price list prints it. */
const boundTail = ({ kind, view }: PartContext): string => ` ${view.form === "held" ? (view.boundsEvery ? copy.price.per[view.boundsEvery] : copy.panel.perCharge) : boundPer(kind)}`;

const note = (id: "unfilled" | "unfilledClerk" | "partial") => (): PartWords => ({ lead: pp.notes[id]! });

/**
 * Each part's words where the price has it, at rest and in the open case; null where it has nothing to say yet (a bound or a flat price
 * not given, a price of another form).
 */
export const SAID: Readonly<Record<PartId, (c: PartContext) => PartWords | null>> = {
  free: () => ({ lead: copy.price.free }),
  share: ({ kind, view }) => ({ ...fig(view.figures.rate), tail: ` ${perAction(kind)}` }),
  perUnit: ({ view }) => ({ ...fig(view.figures.amount), tail: ` ${pp.perUnit}` }),
  perAction: ({ kind, view }) => ({ ...fig(view.figures.amount), tail: ` ${perAction(kind)}` }),
  held: ({ p, view }) => (p.form === "held" ? { ...fig(view.figures.rate), tail: ` ${copy.price.per[p.per]}` } : null),
  sum: ({ p, view }) => (p.form === "sum" ? { ...fig(view.figures.amount), tail: ` ${copy.price.per[p.every]}` } : null),
  discount: ({ p, view }) => (onAction(p) && p.discount ? { lead: pp.discount.lead, ...fig(view.figures.discount), tail: `${pp.discount.tail}${p.discount.alsoMin ? pp.discount.alsoMin : ""}` } : null),
  third: ({ p, view }) => {
    if (!onAction(p) || !p.third) return null;
    const lead = p.third.who ? `${pp.thirdOf}${p.third.who}` : pp.third;
    return p.third.price ? { lead: `${lead} `, ...fig(view.figures.third) } : { lead, quiet: ` ${pp.thirdNone}` };
  },
  until: ({ until }) => (until ? { lead: pp.until, month: until } : null),
  min: (c) => (c.view.figures.min ? { lead: pp.min, figure: c.view.figures.min, tail: boundTail(c) } : null),
  max: (c) => (c.view.figures.max ? { lead: pp.max, figure: c.view.figures.max, tail: boundTail(c) } : null),
  cap: ({ kind, view }) => (view.figures.cap ? { lead: pp.max, figure: view.figures.cap, tail: ` ${shareOf(kind)}` } : null),
  flat: ({ view }) => (view.figures.flat ? { lead: pp.flat.lead, figure: view.figures.flat, mid: pp.flat.tail, ...(view.figures.upTo ? { second: view.figures.upTo } : {}) } : null),
  offset: ({ p }) => (charged(p) && p.offset ? { lead: `${pp.offsetOf.lead}${feeNameOf(p.offset.kind)}${pp.offsetOf.tail}` } : null),
  refund: ({ view }) => ({ lead: pp.refund, ...fig(view.figures.refund) }),
  unfilled: note("unfilled"),
  unfilledClerk: note("unfilledClerk"),
  partial: note("partial"),
  sale: () => ({ lead: pp.notes.sale! }),
};

/** A flat price nobody has typed yet, as the open case shows it while it stands empty. */
export const FLAT_BLANK: PartWords = { lead: pp.flat.lead, mid: pp.flat.tail };

/** The parts the toolbox offers: every part but free (a price's ✕ makes it free) and a bank clerk's note (a bank's template fills it, BRK-16). */
export type ToolPartId = Exclude<PartId, "free" | "unfilledClerk">;

/** The box a toolbox card shows: a percent, a sum in a currency (its sign), a month, or none. */
export type ToolBox = "pct" | "month" | { sign: string };

/** A toolbox card's words for the fee's kind, around the box it asks for. */
export interface ToolWords {
  words: PartWords;
  box?: ToolBox;
}

/** What a card's words are made from: the fee's kind and the open case's price. */
export interface ToolContext {
  kind: FeeKindId;
  p: Price;
}

/** The currency the open case's price keeps its sums in, a new sum's box drawn in it: the shekel where it names none. */
const priceCurrency = (p: Price): string => (hasCurrency(p) && p.currency ? p.currency : "ILS");
const inPrice = ({ p }: ToolContext): ToolBox => ({ sign: signOf(priceCurrency(p)) });

/** Each card's words and box, its words following the fee (a conversion's "לכל המרה", "מההמרה"). */
export const OFFERED: Readonly<Record<ToolPartId, (c: ToolContext) => ToolWords>> = {
  share: ({ kind }) => ({ words: { tail: ` ${perAction(kind)}` }, box: "pct" }),
  perUnit: (c) => ({ words: { tail: ` ${pp.perUnit}` }, box: inPrice(c) }),
  // a sum per action keeps the price's currency only where the fee may hold one for it (its capacity), else it is in shekels
  perAction: ({ kind, p }) => ({ words: { tail: ` ${perAction(kind)}` }, box: { sign: signOf(fieldsOf(kind, "perAction").includes("currency") ? priceCurrency(p) : "ILS") } }),
  held: () => ({ words: { tail: ` ${copy.price.per[12]}` }, box: "pct" }),
  sum: () => ({ words: { tail: ` ${copy.price.per[1]}` }, box: { sign: signOf("ILS") } }),
  discount: () => ({ words: { lead: pp.discount.lead, tail: pp.discount.tail }, box: "pct" }),
  third: () => ({ words: { lead: pp.third } }),
  // a flat price for a small action, where the fee's price list may print one (a trade, a conversion)
  flat: (c) => ({ words: { lead: pp.flatSmall[c.kind] ?? pp.flatSmall.default! }, box: inPrice(c) }),
  until: () => ({ words: { lead: pp.until }, box: "month" }),
  min: (c) => ({ words: { lead: pp.min }, box: inPrice(c) }),
  max: (c) => ({ words: { lead: pp.max }, box: inPrice(c) }),
  cap: ({ kind }) => ({ words: { lead: pp.max, tail: ` ${shareOf(kind)}` }, box: "pct" }),
  offset: () => ({ words: { lead: pp.offset } }),
  refund: (c) => ({ words: { lead: pp.refund.trim() }, box: inPrice(c) }),
  unfilled: () => ({ words: { lead: pp.notes.unfilled! } }),
  partial: () => ({ words: { lead: pp.notes.partial! } }),
  sale: () => ({ words: { lead: pp.notes.sale! } }),
};
