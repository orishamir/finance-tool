// The words of each part of a price (method §10.6), keyed by the part registry's ids (offers/parts.ts): as a slim line, a case's row and
// the open case say a part the price has, and as the toolbox's card offers a part to add. Every word is from the copy; the views
// (case-words.ts, panel.ts, toolbox.ts) only arrange them, and a component only lays them out.
import { feeDeal as copy, guideBlocks } from "../../copy";
import type { SiteValue } from "../value";
import type { MonthKey, Note, Price } from "./model";
import { charged, onAction } from "./offers/capabilities";
import type { FigureUnit } from "./offers/figures";
import type { PartId, StatedPartId, ToolPartId } from "./offers/parts";
import type { PriceFigures } from "./values";
import type { PriceView } from "./deal-read";
import { type FeeKindId, type FormId } from "./shapes";
import { sumCurrency } from "./offers/capacity";

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

/** A maximum on each security's period: the price list's where it prints the bounds per month, else each charge. */
const perSecurityTail = ({ view }: PartContext): string => `${pp.perSecurity.each}${view.form === "held" && view.boundsEvery ? ` ${copy.price.per[view.boundsEvery]}` : pp.perSecurity.charge}`;

const note = (id: Note) => (): PartWords => ({ lead: pp.notes[id]! });

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
  maxPerSecurity: (c) => (c.view.figures.perSecurity ? { lead: pp.max, figure: c.view.figures.perSecurity, tail: perSecurityTail(c) } : null),
  offset: ({ p }) => (charged(p) && p.offset ? { lead: `${pp.offsetOf.lead}${feeNameOf(p.offset.kind)}${pp.offsetOf.tail}` } : null),
  refund: ({ view }) => ({ lead: pp.refund, ...fig(view.figures.refund) }),
  unfilled: note("unfilled"),
  unfilledClerk: note("unfilledClerk"),
  unfilledClerkAbroad: note("unfilledClerkAbroad"),
  capRead: note("capRead"),
  partial: note("partial"),
  inTrade: () => ({ lead: pp.notes.inTrade! }),
  sale: () => ({ lead: pp.notes.sale! }),
};

/** What a stated part's sentence is made from: the price, and its figures as the reading shows them. */
export interface StatedContext {
  p: Price;
  figures: PriceFigures;
}

const st = copy.cases.stated;

/**
 * Each stated part's sentence in the reading (§10.6, "What the page states and does not compute"), where the price has it; null where it
 * has nothing to state (a third party's fee with its figure, which the reading computes; a refund not typed yet).
 */
export const STATED: Readonly<Record<StatedPartId, (c: StatedContext) => PartWords | null>> = {
  third: ({ p }) => (!onAction(p) || !p.third || p.third.price ? null : p.third.who ? { lead: `${st.thirdOf.lead}${p.third.who}`, tail: ` ${st.thirdOf.tail.trim()}` } : { lead: st.third }),
  maxPerSecurity: ({ p, figures }) => (p.form === "held" && p.perSecurity ? { lead: st.maxPerSecurity.lead, ...fig(figures.perSecurity), tail: st.maxPerSecurity.tail } : null),
  offset: ({ p }) => (charged(p) && p.offset ? { lead: `${st.offset.lead}${feeNameOf(p.offset.kind)}`, tail: st.offset.tail } : null),
  refund: ({ p, figures }) => (charged(p) && p.refund && !p.refund.blank ? { lead: st.refund.lead, ...fig(figures.refund), tail: st.refund.tail } : null),
  unfilled: () => ({ lead: st.unfilled }),
  unfilledClerk: () => ({ lead: st.unfilledClerk }),
  unfilledClerkAbroad: () => ({ lead: st.unfilledClerkAbroad }),
  capRead: () => ({ lead: st.capRead }),
  partial: () => ({ lead: st.partial }),
};

/** A flat price nobody has typed yet, as the open case shows it while it stands empty. */
export const FLAT_BLANK: PartWords = { lead: pp.flat.lead, mid: pp.flat.tail };

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

/** A new sum's box, drawn in the currency the open case's price keeps its sums in (in its own form, or in `form`: `sumCurrency`). */
const inPrice = ({ kind, p }: ToolContext, form: FormId = p.form): ToolBox => ({ sign: signOf(sumCurrency(kind, p, form)) });

/** Each card's words and box, its words following the fee (a conversion's "לכל המרה", "מההמרה"). */
export const OFFERED: Readonly<Record<ToolPartId, (c: ToolContext) => ToolWords>> = {
  share: ({ kind }) => ({ words: { tail: ` ${perAction(kind)}` }, box: "pct" }),
  perUnit: (c) => ({ words: { tail: ` ${pp.perUnit}` }, box: inPrice(c, "perUnit") }),
  perAction: (c) => ({ words: { tail: ` ${perAction(c.kind)}` }, box: inPrice(c, "perAction") }),
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
  maxPerSecurity: () => ({ words: { lead: pp.max, tail: pp.perSecurity.each }, box: { sign: signOf("ILS") } }),
  offset: () => ({ words: { lead: pp.offset } }),
  refund: (c) => ({ words: { lead: pp.refund.trim() }, box: inPrice(c) }),
  unfilled: () => ({ words: { lead: pp.notes.unfilled! } }),
  partial: () => ({ words: { lead: pp.notes.partial! } }),
  inTrade: () => ({ words: { lead: pp.notes.inTrade! } }),
  sale: () => ({ words: { lead: pp.notes.sale! } }),
};
