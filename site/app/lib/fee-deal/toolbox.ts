// The toolbox for the case open in place (method §10.6): the parts the product's fee is offered that the price it acts on can hold now (the
// purchase's last, `toolPrice`), in the toolbox's groups and order, each with its words and its box, and the things the fee may change by.
import { feeDeal as copy } from "../../copy";
import { hasCases, monthKey, monthOf, pricedOf, toolPrice, type Case, type Fee, type MonthKey } from "./model";
import { fmt, joinLead } from "../format";
import { offerFor } from "./offers/offer";
import { PARTS, type PartId, type PartKind, type ToolGroupId, type ToolPartId, type ToolPartIn } from "./offers/parts";
import { OFFERED, feeNameOf, type PartWords, type ToolBox } from "./part-words";
import { type DealRead } from "./deal-read";
import { BY_MAX, isOwnKind, pickKind, type ByKind } from "./offers/conditions";
import { firstCase, thingName, whenWords, type WhenWords } from "./case-words";

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

/** The thing to change by that a toolbox card adds (its id `by:<thing>`), or null where the card is a part. */
export const cardThing = (id: string): ByKind | null => (id.startsWith("by:") ? (id.slice(3) as ByKind) : null);

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
  addTo: { lead: string; when?: WhenWords[]; name?: string; price?: string };
  /** The price it acts on, by its place among the purchase's prices (`toolPrice`): a part tapped goes on it, a form of the price changes it. */
  k: number;
  groups: ToolGroup[];
}

/**
 * The order of each toolbox group's cards: the parts the registry puts in the group (`PARTS[id].tool`). The compiler checks that no other
 * part stands in a group, and offers/parts.test.ts that every one of them does. Free stands beside the price's forms, for the price the
 * toolbox acts on. A flat price stands among the price's cards, though a line says it among the bounds.
 */
export const TOOL_ORDER = {
  price: ["share", "perUnit", "perAction", "held", "sum", "free", "discount", "third", "flat"],
  bound: ["min", "max", "cap", "maxPerSecurity"],
  link: ["offset", "refund"],
  more: ["unfilled", "partial", "inTrade", "sale"],
} as const satisfies { [G in ToolGroupId]: readonly ToolPartIn<G>[] };
/** The toolbox's groups in order, each with its cards' kind; what the price changes by is the fee's things (`conditionsFor`). */
const TOOLBOX: readonly { group: ToolGroup["group"]; kind: ToolPart["kind"]; parts: readonly ToolPartId[] }[] = [
  { group: "price", kind: "price", parts: TOOL_ORDER.price },
  { group: "bound", kind: "bound", parts: TOOL_ORDER.bound },
  { group: "by", kind: "by", parts: [] },
  { group: "link", kind: "link", parts: TOOL_ORDER.link },
  { group: "more", kind: "note", parts: TOOL_ORDER.more },
];

export function toolbox(r: DealRead, feeId: string, caseId?: string, at?: number): Toolbox | null {
  const fee = r.deal.fees.find((f) => f.id === feeId);
  if (!fee) return null;
  const shown = caseId ?? firstCase(fee);
  const priced = pricedOf(fee, shown);
  const k = toolPrice(priced, at);
  const p = priced.stages[k]!.price;
  // what the product's fee is offered (the rule table narrows it), of which the parts its price can hold now
  const offer = offerFor(r.kind, fee.kind);
  const parts = (g: (typeof TOOLBOX)[number]): ToolPart[] =>
    g.group === "by"
      ? byParts(fee, offer.conditions)
      : g.parts.filter((id) => offer.parts.includes(id) && PARTS[id].holds(fee.kind, p)).map((id) => ({ id, kind: g.kind, ...OFFERED[id]({ kind: fee.kind, p }), used: PARTS[id].used(p, priced) }));
  const c = hasCases(fee) ? (priced as Case) : null;
  const base = c && hasCases(fee) ? { lead: copy.cases.addTo, when: c.when.map((w, t) => whenWords(fee, w, t, r.today)) } : { lead: copy.cases.addTo, name: feeNameOf(fee.kind, fee.name) };
  const addTo = priced.stages.length > 1 ? { ...base, price: priceWords(priced.stages, k) } : base;
  const groups = TOOLBOX.map((g) => ({ group: g.group, head: copy.cases.groups[g.group]!, parts: parts(g) }));
  return { addTo, k, groups: groups.filter((g) => g.parts.length > 0) };
}

/** The month before `m`: a price that ends at the start of `m` holds through it. */
const monthBefore = (m: MonthKey): MonthKey => {
  const c = monthOf(m);
  return c.m === 1 ? monthKey({ y: c.y - 1, m: 12 }) : monthKey({ y: c.y, m: c.m - 1 });
};

/**
 * Which of several prices the toolbox adds to, in words: "להוסיף למחיר עד דצמבר 2026", "…ממינואר 2027", "…מינואר 2027 עד דצמבר 2027"; its
 * first month the end of the price before it, its last the month before its own end.
 */
function priceWords(stages: readonly { until?: MonthKey }[], k: number): string {
  const w = copy.cases.toolPrice;
  const from = stages[k - 1]?.until;
  const until = stages[k]!.until;
  const fromWords = from ? (() => { const d = fmt.date(from); return `${joinLead(w.from, d)}${d}`; })() : "";
  const untilWords = until ? `${w.until}${fmt.date(monthBefore(until))}` : "";
  return [w.lead, fromWords, untilWords].filter(Boolean).join(" ");
}

/** The things a fee is offered to change by, as the toolbox's cards: one it changes by already is used, and none more can be added past three. */
function byParts(fee: Fee, offered: readonly ByKind[]): ToolPart[] {
  const have = new Set((fee.by ?? []).map((b) => pickKind(b.kind)));
  const full = (fee.by?.length ?? 0) >= BY_MAX;
  return offered.map((k) => {
    const used = !isOwnKind(k) && have.has(pickKind(k));
    return { id: `by:${k}` as const, kind: "by" as const, words: { lead: thingName(fee.kind, { kind: k }) }, used, ...(full && !used ? { off: copy.cases.full } : {}) };
  });
}
