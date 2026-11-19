// The toolbox for the case open in place (method §10.6): the parts the product's fee is offered that the price it acts on can hold now (the
// purchase's last, `toolPrice`), in the toolbox's groups and order, each with its words and its box, and the things the fee may change by.
import { feeDeal as copy } from "../../copy";
import { hasCases, monthKey, monthOf, pricedOf, toolPrice, toolStages, type Case, type Fee, type MonthKey, type Side } from "./model";
import { fmt, joinLead } from "../format";
import { offerFor } from "./offers/offer";
import { PARTS, isFormPart, type PartId, type PartKind, type ToolGroupId, type ToolPartId, type ToolPartIn } from "./offers/parts";
import { OFFERED, feeNameOf, type PartWords, type ToolBox } from "./part-words";
import { type DealRead } from "./deal-read";
import { BY_MAX, isOwnKind, isRangeKind, pickKind, type ByKind } from "./offers/conditions";
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
  /** A form of the price: the forms are one choice, the one the price has chosen. */
  form?: true;
  /** Where the price changes by it: what is bought and where (`what`, a sale priced apart among them), or a size or an amount (`size`, a range). */
  row?: "what" | "size";
}

/** The thing to change by that a toolbox card adds (its id `by:<thing>`), or null where the card is a part. */
export const cardThing = (id: string): ByKind | null => (id.startsWith("by:") ? (id.slice(3) as ByKind) : null);

/**
 * A toolbox card drawn as the line it adds to the open case, across its group: the month the price it acts on changes from (F-110). A tap
 * asks for the month on that price, which then splits in two there (`until`, a part that asks for its month); it splits the price in time,
 * never the fee into cases, so it is no thing's card.
 */
export interface ToolLine {
  id: LinePartId;
  words: string;
}

/** The parts the toolbox draws as lines. */
type LinePartId = "until";

/** A toolbox group: its kind and head, its parts in order, and its lines after them. */
export interface ToolGroup {
  group: ToolGroupId;
  head: string;
  parts: ToolPart[];
  lines: ToolLine[];
}

/**
 * The toolbox for the case open in place: the line naming what it adds to (the case's values, joined; a slim fee's own name), and its
 * groups in order, by what a card does to the price: what is charged, what comes off it, its floor and ceiling, what it changes by, and the
 * rules of the charge;
 * each part's words follow the fee (a conversion's "לכל המרה", "מההמרה"), and a part the case already has is `used`. A group shows what the
 * product's fee is offered (`offerFor`, narrowed by the rule table) that its price can hold now; what a deal already holds beyond the offer
 * still opens and reads.
 */
export interface Toolbox {
  /**
   * "להוסיף למקרה: " and the open case's values (`when`), or a slim fee's name (`name`); where the case's price changes over time, which of
   * its prices the toolbox adds to (`price`), and each price's months (`periods`, in time order), to switch to another.
   */
  addTo: { lead: string; when?: WhenWords[]; name?: string; price?: string; periods?: string[] };
  /** The price it acts on, by its place among its side's prices (`toolPrice`): a part tapped goes on it, a form of the price changes it. */
  k: number;
  /** The side it acts on: the purchase's prices, or a sale priced apart, once the person is in it (founder, 2026-11-19). */
  side: Side;
  groups: ToolGroup[];
}

/**
 * The order of each toolbox group's cards: the parts the registry puts in the group (`PARTS[id].tool`). The compiler checks that no other
 * part stands in a group, and offers/parts.test.ts that every one of them does. Free stands beside the price's forms, for the price the
 * toolbox acts on. A sale priced apart stands with the fee's things, as what the price changes by. A flat price for a small action has
 * no card: it is the price of the first size of the action (§10.6, a size of the action's first range).
 */
export const TOOL_ORDER = {
  charge: ["share", "perUnit", "perAction", "held", "sum", "free", "third"],
  off: ["discount", "offset", "refund"],
  bound: ["min", "max", "cap", "maxPerSecurity"],
  by: ["sale"],
  rule: ["unfilled", "partial", "inTrade"],
} as const satisfies { [G in ToolGroupId]: readonly ToolPartIn<G>[] };
/**
 * The toolbox's groups in order, each with its cards' kind; what the price changes by is the fee's things (`conditionsFor`), then its parts,
 * then the month the price changes from, drawn as a line.
 */
const TOOLBOX: readonly { group: ToolGroupId; kind: ToolPart["kind"]; parts: readonly ToolPartId[]; lines?: readonly LinePartId[] }[] = [
  { group: "charge", kind: "charge", parts: TOOL_ORDER.charge },
  { group: "off", kind: "off", parts: TOOL_ORDER.off },
  { group: "bound", kind: "bound", parts: TOOL_ORDER.bound },
  { group: "by", kind: "by", parts: TOOL_ORDER.by, lines: ["until"] },
  { group: "rule", kind: "rule", parts: TOOL_ORDER.rule },
];

/** Each line's words on its card. */
const LINE_WORDS: Readonly<Record<LinePartId, string>> = { until: copy.cases.dateLine };

export function toolbox(r: DealRead, feeId: string, caseId?: string, at?: number, on: Side = "buy"): Toolbox | null {
  const fee = r.deal.fees.find((f) => f.id === feeId);
  if (!fee) return null;
  const shown = caseId ?? firstCase(fee);
  const priced = pricedOf(fee, shown);
  const side: Side = on === "sell" && priced.sale ? "sell" : "buy";
  const stages = toolStages(priced, side);
  const k = toolPrice({ stages }, at);
  const p = stages[k]!.price;
  // what the product's fee is offered (the rule table narrows it), of which the parts its price can hold now
  const offer = offerFor(r.kind, fee.kind);
  const own = (g: (typeof TOOLBOX)[number]): ToolPart[] =>
    g.parts
      .filter((id) => offer.parts.includes(id) && PARTS[id].holds(fee.kind, p))
      .map((id) => ({ id, kind: g.kind, ...OFFERED[id]({ kind: fee.kind, p }), used: PARTS[id].used(p, priced), ...(isFormPart(id) ? { form: true as const } : {}), ...(g.group === "by" ? { row: "what" as const } : {}) }));
  const parts = (g: (typeof TOOLBOX)[number]): ToolPart[] => (g.group === "by" ? [...byParts(fee, offer.conditions), ...own(g)] : own(g));
  const c = hasCases(fee) ? (priced as Case) : null;
  const lead = side === "sell" ? copy.cases.addToSale : copy.cases.addTo;
  const base = c && hasCases(fee) ? { lead, when: c.when.map((w, t) => whenWords(fee, w, t, r.today)) } : { lead, name: feeNameOf(fee.kind, fee.name) };
  const addTo = stages.length > 1 ? { ...base, price: priceWords(stages, k), periods: stages.map((_, j) => periodWords(stages, j)) } : base;
  const lines = (g: (typeof TOOLBOX)[number]): ToolLine[] => (g.lines ?? []).filter((id) => offer.parts.includes(id)).map((id) => ({ id, words: LINE_WORDS[id] }));
  const groups = TOOLBOX.map((g) => ({ group: g.group, head: copy.cases.groups[g.group]!, parts: parts(g), lines: lines(g) }));
  return { addTo, k, side, groups: groups.filter((g) => g.parts.length > 0 || g.lines.length > 0) };
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
  return [copy.cases.toolPrice.lead, periodWords(stages, k)].join(" ");
}

/** A price's months among several, in words: "עד דצמבר 2026", "ממינואר 2027", "מינואר 2027 עד דצמבר 2027". */
function periodWords(stages: readonly { until?: MonthKey }[], k: number): string {
  const w = copy.cases.toolPrice;
  const from = stages[k - 1]?.until;
  const until = stages[k]!.until;
  const fromWords = from ? (() => { const d = fmt.date(from); return `${joinLead(w.from, d)}${d}`; })() : "";
  const untilWords = until ? `${w.until}${fmt.date(monthBefore(until))}` : "";
  return [fromWords, untilWords].filter(Boolean).join(" ");
}

/** The things a fee is offered to change by, as the toolbox's cards: one it changes by already is used, and none more can be added past three. */
function byParts(fee: Fee, offered: readonly ByKind[]): ToolPart[] {
  const have = new Set((fee.by ?? []).map((b) => pickKind(b.kind)));
  const full = (fee.by?.length ?? 0) >= BY_MAX;
  return offered.map((k) => {
    const used = !isOwnKind(k) && have.has(pickKind(k));
    return { id: `by:${k}` as const, kind: "by" as const, words: { lead: thingName(fee.kind, { kind: k }) }, used, row: isRangeKind(k) ? ("size" as const) : ("what" as const), ...(full && !used ? { off: copy.cases.full } : {}) };
  });
}
