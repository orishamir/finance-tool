// The toolbox for the case open in place (method §10.6): the parts the product's fee is offered that some price of the case can hold, in
// the toolbox's groups and order, each with its words, its box and the places it can go (places.ts), and the things the fee may change
// by. A card adds, but for "חינם": a charge goes on a price that charges nothing, never in place of another charge, and "חינם" goes on a
// price that charges something, in place of its charge and its parts. The same toolbox for several of a
// fee's cases at once (`casesToolbox`), which adds only what then stands in every one of them alike.
import { feeDeal as copy } from "../../copy";
import { hasCases, pricedOf, type Case, type CasesFee, type Fee, type Price, type Priced } from "./model";
import { offerFor } from "./offers/offer";
import { PARTS, besideThePrice, isPending, type PartId, type PartKind, type ToolGroupId, type ToolPartId, type ToolPartIn } from "./offers/parts";
import { holdsPart, partAcross, standsBeside } from "./edits/cells";
import { askAcross, type CasesAsk } from "./every-case";
import { OFFERED, PENDING, type PartWords, type ToolBox } from "./part-words";
import { formCharged } from "./offers/capabilities";
import { type DealRead } from "./deal-read";
import { BY_MAX, isOwnKind, isRangeKind, pickKind, type ByKind } from "./offers/conditions";
import { firstCase, thingName, whenWords, type WhenWords } from "./case-words";
import { cardPlaces, cardState, type Place } from "./places";

// ---------------------------------------------------------------- the toolbox

/**
 * A part as a toolbox card: its id, its words for the fee's kind (around the box it asks for: a percent, a sum, a month), whether the case
 * has it wherever it fits, and the places of the open case it can go.
 */
export interface ToolPart {
  id: PartId | `by:${ByKind}`;
  kind: PartKind | "by";
  words: PartWords;
  /** The box the card shows: a percent, a sum in a currency (its sign), a month, or none. */
  box?: ToolBox;
  /** Every place that fits it has it already: a ✓, muted, not removed. */
  used: boolean;
  /** It cannot be added, with why (a fourth thing to change by; a charge where every price charges in another way). */
  off?: string;
  /** Where the price changes by it: what is bought and where (`what`, a sale priced apart among them), or a size or an amount (`size`, a range). */
  row?: "what" | "size";
  /**
   * The places of the open case it can go (places.ts): one, and a tap adds it there; several, and a tap holds it until one is picked. A
   * thing to change by goes on the fee as a whole. The toolbox for several cases at once lists none: its card goes into its cases
   * (`casesTool`).
   */
  places: Place[];
}

/** The thing to change by that a toolbox card adds (its id `by:<thing>`), or null where the card is a part. */
export const cardThing = (id: string): ByKind | null => (id.startsWith("by:") ? (id.slice(3) as ByKind) : null);

/**
 * A toolbox card drawn as the line it adds to the open case, across its group: the month a price changes from (F-110). Its places are the
 * case's sides (the purchase's prices, a sale priced apart's); at the one picked it asks the month at the foot of the side's prices, and
 * the price in force that month splits there (`until`, a part that asks for its month); it splits the price in time, never the fee into
 * cases, so it is no thing's card.
 */
export interface ToolLine {
  id: LinePartId;
  words: string;
  /** Its words while it is held: what the toolbox's line says is being added. */
  held: string;
  /** It cannot be added here, with why (several cases at once, whose prices it would split apart). */
  off?: string;
  places: Place[];
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
 * The toolbox for the case open in place: the line naming what it adds to (`addTo`: "להוסיף למקרה: " and the case's values; none for a
 * slim fee, whose block it stands beside), and its groups in order, by what a card does to the price: what is charged, what comes off it,
 * its floor and ceiling, what it changes by, and the rules of the charge; each part's words follow the fee (a conversion's "לכל המרה",
 * "מההמרה"). A group shows what the product's fee is offered (`offerFor`, narrowed by the rule table) that some price of the case can
 * hold; what a deal already holds beyond the offer still opens and reads.
 */
export interface Toolbox {
  addTo: { lead: string; when?: WhenWords[] } | null;
  groups: ToolGroup[];
}

/**
 * The order of each toolbox group's cards: the parts the registry puts in the group (`PARTS[id].tool`). The compiler checks that no other
 * part stands in a group, and offers/parts.test.ts that every one of them does. The charges add to a price that charges nothing; "חינם",
 * last of them, is the one card that replaces: it makes a price that charges something free. A sale priced apart stands with the fee's
 * things, as what the price changes by. A flat price for a small action has no card: it is the price of the first size of the action
 * (§10.6, a size of the action's first range).
 */
export const TOOL_ORDER = {
  charge: ["share", "perUnit", "perAction", "held", "sum", "third", "free"],
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

/** Every price of a case, the purchase's then a sale priced apart's. */
const allPrices = (x: Priced): Price[] => [...x.stages, ...(x.sale ?? [])].map((s) => s.price);

/**
 * A part as a card of group `g` for case `x` of fee `fee`: its words for the fee's kind, said for the first price it can go on (else the
 * case's last), whether every place that fits it has it, why it is off where none fits (a charge where every price charges otherwise),
 * and its places.
 */
function partCard(g: (typeof TOOLBOX)[number], id: ToolPartId, fee: Fee, x: Priced): ToolPart {
  const c = cardPlaces(fee.kind, x, id);
  const state = cardState(c);
  const first = c.places.find((p) => p.on === "price");
  const p = first && first.on === "price" ? (first.side === "sell" && x.sale ? x.sale : x.stages)[first.k]!.price : x.stages.at(-1)!.price;
  return {
    id,
    kind: g.kind,
    ...OFFERED[id]({ kind: fee.kind, p }),
    used: state === "used",
    ...(state === "off" ? { off: offWhy(id) } : {}),
    ...(g.group === "by" ? { row: "what" as const } : {}),
    places: c.places,
  };
}

/**
 * Why a card no price of the case can take is off: a charge, where every price charges in another way; "חינם", a form that charges nothing,
 * where every price is free already.
 */
const offWhy = (id: ToolPartId): string => (frees(id) ? copy.cases.allFree : copy.cases.charging);

/** Whether part `id` is "חינם", the form that charges nothing: the one card that replaces a price's charge and its parts. */
const frees = (id: PartId): boolean => {
  const form = PARTS[id].form;
  return form !== undefined && !formCharged(form);
};

/** Each line's words on its card, and while it is held. */
const LINE_WORDS: Readonly<Record<LinePartId, { words: string; held: string }>> = { until: { words: copy.cases.dateLine, held: copy.cases.dateHeld } };

export function toolbox(r: DealRead, feeId: string, caseId?: string): Toolbox | null {
  const fee = r.deal.fees.find((f) => f.id === feeId);
  if (!fee) return null;
  const shown = caseId ?? firstCase(fee);
  const priced = pricedOf(fee, shown);
  // what the product's fee is offered (the rule table narrows it), of which the parts some price of the case can hold
  const offer = offerFor(r.kind, fee.kind);
  const prices = allPrices(priced);
  const own = (g: (typeof TOOLBOX)[number]): ToolPart[] => g.parts.filter((id) => offer.parts.includes(id) && prices.some((p) => PARTS[id].holds(fee.kind, p))).map((id) => partCard(g, id, fee, priced));
  const parts = (g: (typeof TOOLBOX)[number]): ToolPart[] => (g.group === "by" ? [...byParts(fee, offer.conditions), ...own(g)] : own(g));
  const c = hasCases(fee) ? (priced as Case) : null;
  const addTo = c && hasCases(fee) ? { lead: copy.cases.addTo, when: c.when.map((w, t) => whenWords(fee, w, t, r.today)) } : null;
  const lines = (g: (typeof TOOLBOX)[number]): ToolLine[] => (g.lines ?? []).filter((id) => offer.parts.includes(id)).map((id) => ({ id, ...LINE_WORDS[id], places: cardPlaces(fee.kind, priced, id).places }));
  const groups = TOOLBOX.map((g) => ({ group: g.group, head: copy.cases.groups[g.group]!, parts: parts(g), lines: lines(g) }));
  return { addTo, groups: groups.filter((g) => g.parts.length > 0 || g.lines.length > 0) };
}

/** A card of the toolbox, told by what it is: a part's card (`part`), or a line's (`line`). */
export type ToolCard = ({ k: "part" } & ToolPart) | ({ k: "line" } & ToolLine);

/** A card of the toolbox by its id (a part's or a line's), with its places; null where the toolbox has none. */
export function cardOf(box: Toolbox, id: string): ToolCard | null {
  for (const g of box.groups) {
    const part = g.parts.find((p) => p.id === id);
    if (part) return { k: "part", ...part };
    const line = g.lines.find((l) => l.id === id);
    if (line) return { k: "line", ...line };
  }
  return null;
}

/**
 * The things a fee is offered to change by, as the toolbox's cards, each going on the fee as a whole: one it changes by already is used
 * (a tap stops it), and none more can be added past three.
 */
function byParts(fee: Fee, offered: readonly ByKind[]): ToolPart[] {
  const have = new Set((fee.by ?? []).map((b) => pickKind(b.kind)));
  const full = (fee.by?.length ?? 0) >= BY_MAX;
  return offered.map((k) => {
    const used = !isOwnKind(k) && have.has(pickKind(k));
    const off = full && !used;
    return { id: `by:${k}` as const, kind: "by" as const, words: { lead: thingName(fee.kind, { kind: k }) }, used, row: isRangeKind(k) ? ("size" as const) : ("what" as const), ...(off ? { off: copy.cases.full } : {}), places: off ? [] : [{ on: "fee" as const }] };
  });
}

// ---------------------------------------------------------------- several cases at once

/**
 * Several of a fee's cases the toolbox adds to at once: every case of the fee ("+ חלק לכל המקרים"), or a grid row's ("+ חלק לכל השורה",
 * `row`, the key of its value of the grid's first thing), as they were shown when it opened, with the thing they stand along (`along`: a
 * part they all take joins one span of it). A card adds to them only what then stands in every one of them alike, on its first price.
 */
export interface CasesTarget {
  fee: string;
  cases: string[];
  along: number;
  row?: string;
}

/** The fee of a target and those of its cases the fee still has; null where the fee is gone, changes by nothing, or has none of them. */
export function targetCases(r: DealRead, target: CasesTarget): { fee: CasesFee; cases: string[] } | null {
  const fee = r.deal.fees.find((f) => f.id === target.fee);
  if (!fee || !hasCases(fee)) return null;
  const cases = target.cases.filter((id) => fee.cases.some((c) => c.id === id));
  return cases.length ? { fee, cases } : null;
}

/**
 * Why a card cannot be added to several cases at once: it is set in each case on its own (a form of the price, a sale priced apart, the
 * month a price changes from: what tells the cases apart), some of them have it and others not, they would ask its amount in different
 * currencies or over different periods, or some case's price cannot hold it. Each is a sentence of `copy.cases.casesOff`.
 */
export type CasesOff = "perCase" | "someHave" | "currencies" | "periods" | "cannot";

/** What a card is for several cases at once: one every one of them has (`used`), one added to cases `cases`, or one that cannot be added (`off`, with why). */
type CasesCard = { k: "used" } | { k: "add"; cases: string[] } | { k: "off"; why: CasesOff };

/** Part `part` as a card of `box`, where the box lists it. */
const cardIn = (box: Toolbox | undefined, part: string): ToolPart | undefined => box?.groups.flatMap((g) => g.parts).find((p) => p.id === part);

/**
 * Part `part` for cases `cases` of `fee`, their toolboxes `boxes`: "חינם", which replaces a price's charge, set in each case on its own;
 * any other, had where every one of them has it; else added only where it then
 * stands in every one alike, so it reads once for them all (`everyCaseRows`): a part a price keeps beside its main figure
 * (`besideThePrice`), which every case's price can hold, none has in its row yet, and that all ask for alike (`askAcross`); a note, which
 * stands beside a case's other notes, goes into those that lack that very note.
 */
function casesCard(fee: CasesFee, boxes: ReadonlyMap<string, Toolbox>, cases: readonly string[], part: PartId): CasesCard {
  const listed = cases.map((id) => cardIn(boxes.get(id), part));
  // a case whose first price is free may have a later one that charges: "חינם" is never had across cases
  if (frees(part)) return { k: "off", why: "perCase" };
  const has = cases.map((id, j) => holdsPart(fee.cases.find((c) => c.id === id)!, part) || !!listed[j]?.used);
  if (has.every(Boolean)) return { k: "used" };
  if (!besideThePrice(part)) return { k: "off", why: "perCase" };
  if (listed.some((x, j) => !has[j] && (!x || x.off))) return { k: "off", why: "cannot" };
  const lacking = cases.filter((_, j) => !has[j]);
  if (standsBeside(part)) return { k: "add", cases: lacking };
  if (lacking.length < cases.length) return { k: "off", why: "someHave" };
  if (isPending(part) && !askAcross(fee, cases, part)) {
    const signs = new Set(cases.map((id) => PENDING[part]({ kind: fee.kind, p: fee.cases.find((c) => c.id === id)!.stages[0]!.price }).sign));
    return { k: "off", why: signs.size > 1 ? "currencies" : "periods" };
  }
  return { k: "add", cases: [...cases] };
}

/** The toolbox of each of cases `cases` of fee `feeId`, by case; a case with none is left out. */
function boxesOf(r: DealRead, feeId: string, cases: readonly string[]): Map<string, Toolbox> {
  return new Map(
    cases.flatMap((id) => {
      const b = toolbox(r, feeId, id);
      return b ? [[id, b] as const] : [];
    }),
  );
}

/**
 * The regular toolbox, for several of a fee's cases at once (`CasesTarget`): "להוסיף לכל המקרים", or "להוסיף לכל השורה: " and the row's
 * value; every card the fee is offered, in its words for the first case that lists it; the things to change by as for one case, since
 * they change the fee. A part is had (`used`) where every case has it, can be added where it then stands in every case alike
 * (`casesCard`), and is off with why otherwise, as is the line of the month a price changes from, which splits each case's price apart.
 */
export function casesToolbox(r: DealRead, target: CasesTarget): Toolbox | null {
  const t = targetCases(r, target);
  if (!t) return null;
  const { fee, cases } = t;
  const boxes = boxesOf(r, fee.id, cases);
  const offer = offerFor(r.kind, fee.kind);
  const first = fee.cases.find((c) => c.id === cases[0])!;
  const card = (g: (typeof TOOLBOX)[number], id: ToolPartId): ToolPart => {
    const { off: _off, ...base } = cases.map((c) => cardIn(boxes.get(c), id)).find(Boolean) ?? partCard(g, id, fee, first);
    const c = casesCard(fee, boxes, cases, id);
    return { ...base, used: c.k === "used", ...(c.k === "off" ? { off: copy.cases.casesOff[c.why] } : {}), places: [] };
  };
  const parts = (g: (typeof TOOLBOX)[number]): ToolPart[] => [...(g.group === "by" ? byParts(fee, offer.conditions) : []), ...g.parts.filter((id) => offer.parts.includes(id)).map((id) => card(g, id))];
  const lines = (g: (typeof TOOLBOX)[number]): ToolLine[] => (g.lines ?? []).filter((id) => offer.parts.includes(id)).map((id) => ({ id, ...LINE_WORDS[id], off: copy.cases.casesOff.perCase, places: [] }));
  const groups = TOOLBOX.map((g) => ({ group: g.group, head: copy.cases.groups[g.group]!, parts: parts(g), lines: lines(g) }));
  const addTo = target.row !== undefined ? { lead: copy.cases.addToRow, when: [whenWords(fee, first.when[0]!, 0, r.today)] } : { lead: copy.cases.addToAll };
  return { addTo, groups: groups.filter((g) => g.parts.length > 0 || g.lines.length > 0) };
}

/**
 * What a toolbox card (`item`, its id) does to several cases at once, as its tap does to one open case: a thing to change by asks its
 * question, for the whole fee (`thing`); a part that asks for something asks it once, in the target's place (`ask`); any other part goes
 * into its cases (`fee`, `partAcross`). Null where the card is had or off there (`casesCard`). A tap and a drop on the target both do this.
 */
export type CasesTool = { k: "thing"; kind: ByKind } | { k: "ask"; ask: CasesAsk } | { k: "fee"; fee: Fee };

export function casesTool(r: DealRead, target: CasesTarget, item: string): CasesTool | null {
  const thing = cardThing(item);
  if (thing) return { k: "thing", kind: thing };
  const t = targetCases(r, target);
  if (!t || !(item in PARTS)) return null;
  const id = item as PartId;
  const c = casesCard(t.fee, boxesOf(r, t.fee.id, t.cases), t.cases, id);
  if (c.k !== "add") return null;
  if (isPending(id)) return { k: "ask", ask: { part: id, cases: c.cases, along: target.along } };
  const next = partAcross(t.fee, c.cases, id, target.along);
  return next === t.fee ? null : { k: "fee", fee: next };
}
