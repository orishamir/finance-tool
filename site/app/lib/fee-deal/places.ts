// Where a toolbox card can go in the case open in place (method §10.6), a card held while the person picks one of several, and a part
// waiting at its place for what it asks. A card's places are found from the part registry (`partGoes`, `holds`, `used`): a part a price
// keeps goes on each price that can hold it and has it not yet; a charge (a form of the price) goes only on a price that charges nothing,
// so the toolbox never swaps one charge for another; the month a price changes from goes on each side's prices as a whole (the
// purchase's, a sale priced apart's), its month then deciding which price splits; a sale priced apart goes on the case as a whole. A tap
// on a card with one place adds it there; with several it holds the card, each place drawing a round "+" until one is tapped or the hold
// ends (`tapStep`, `letGoStep`). A card dropped on a case goes where it has one place there (`dropTakes`). A part added that asks for
// something waits at its place while that place and its side's prices stay as they were, and is dropped otherwise (`stillWaits`). Pure;
// its words come from the copy.
import { feeDeal as copy } from "../../copy";
import { fmt, joinLead } from "../format";
import { monthKey, monthOf, type MonthKey, type Price, type Priced, type Side } from "./model";
import { charged } from "./offers/capabilities";
import { isFormPart, PARTS, partGoes, type PartAt, type PartId, type PendingPart } from "./offers/parts";
import type { FeeKindId } from "./shapes";

/**
 * A place a toolbox card can go in the open case: one of its prices (`price`, price `k` among those on `side`), one side's prices as a
 * whole (`side`), or the case, or a slim fee, as a whole (`fee`).
 */
export type Place = { on: "price"; side: Side; k: number } | { on: "side"; side: Side } | { on: "fee" };

/** Whether two places are the same. */
export const samePlace = (a: Place, b: Place): boolean => placeKey(a) === placeKey(b);

/** A place as a short key, unique within a case: "buy1", "sell", "fee". */
export const placeKey = (p: Place): string => (p.on === "price" ? `${p.side}${p.k}` : p.on === "side" ? p.side : "fee");

/** Where a part added at a place goes, as the part's edit names it (`setPart`), in case `caseId` where the fee has cases. */
export const partAt = (p: Place, caseId?: string | null): PartAt => ({
  ...(caseId ? { caseId } : {}),
  ...(p.on === "price" ? { side: p.side, k: p.k } : p.on === "side" ? { side: p.side } : {}),
});

/** The sides a case's prices stand on: the purchase's, then a sale priced apart's. */
const sidesOf = (x: Priced): Side[] => (x.sale ? ["buy", "sell"] : ["buy"]);

/** The prices on a side of a case. */
const stagesOn = (x: Priced, side: Side) => (side === "sell" && x.sale ? x.sale : x.stages);

/**
 * The price whose words a part at place `p` of case `x` follows (its sign, its period): its own price; for a side's prices as a whole,
 * their last, at whose foot it asks; for the case as a whole, the purchase's last.
 */
export const placePrice = (x: Priced, p: Place): Price => (p.on === "price" ? stagesOn(x, p.side)[p.k]!.price : (p.on === "side" ? stagesOn(x, p.side) : x.stages).at(-1)!.price);

/**
 * Where a card for part `part` can go in a case of a fee of `kind` (its prices `x`): `fits`, how many places can take the part at all (a
 * price that can hold it, and for a charge one that charges nothing or charges in that form already); `places`, those of them that have
 * it not yet, where a tap or a drop adds it.
 */
export interface CardPlaces {
  fits: number;
  places: Place[];
}

export function cardPlaces(kind: FeeKindId, x: Priced, part: PartId): CardPlaces {
  const def = PARTS[part];
  const goes = partGoes(part);
  if (goes === "side") {
    const places = sidesOf(x).map((side): Place => ({ on: "side", side }));
    return { fits: places.length, places };
  }
  if (goes === "fee") {
    const p = x.stages[0]!.price;
    if (!def.holds(kind, p)) return { fits: 0, places: [] };
    return { fits: 1, places: def.used(p, x) ? [] : [{ on: "fee" }] };
  }
  // a charge stands only on a price that charges nothing, or charges in that very form: a price that charges otherwise is no place for it
  const fitsOn = (p: Priced["stages"][number]["price"]) => def.holds(kind, p) && (!isFormPart(part) || !charged(p) || p.form === def.form);
  const fit = sidesOf(x).flatMap((side) => stagesOn(x, side).flatMap((s, k) => (fitsOn(s.price) ? [{ side, k, price: s.price }] : [])));
  return { fits: fit.length, places: fit.filter((f) => !def.used(f.price, x)).map((f): Place => ({ on: "price", side: f.side, k: f.k })) };
}

/** What a card is: one to add (a place to go), had already (✓: every place that fits it has it), or off (no place fits it). */
export const cardState = (c: CardPlaces): "add" | "used" | "off" => (c.fits === 0 ? "off" : c.places.length === 0 ? "used" : "add");

// ---------------------------------------------------------------- a held card

/** A toolbox card held while the person picks where it goes: the card (its id), on the fee and case it was tapped for (null for a slim fee). */
export interface Held {
  fee: string;
  case: string | null;
  card: string;
}

/** Whether `held` is the card held for fee `fee`'s case `caseId`. */
export const heldOn = (held: Held | null, fee: string | null, caseId: string | null): Held | null => (held && held.fee === fee && held.case === caseId ? held : null);

/**
 * What a tap on card `card` does, its places `places`, while `now` is held: the held card tapped again lets go; a card with one place adds
 * there at once; with several it is held (in place of any other); with none, nothing.
 */
export type Tap = { k: "add"; place: Place } | { k: "hold"; held: Held } | { k: "letGo" } | { k: "none" };

export function tapCard(now: Held | null, card: Held, places: readonly Place[]): Tap {
  if (now && now.fee === card.fee && now.case === card.case && now.card === card.card) return { k: "letGo" };
  if (places.length === 0) return { k: "none" };
  if (places.length === 1) return { k: "add", place: places[0]! };
  return { k: "hold", held: card };
}

/**
 * The toolbox's line while a card is held, its words `card`, its places `places`: what to tap, by the kind of place it goes (`Place`:
 * the places of one card are all of one kind); null where it has no place, and so is not held.
 */
export const holdWords = (card: string, places: readonly Place[]): string | null => (places[0] ? copy.cases.hold[places[0].on].replace("{card}", card) : null);

/**
 * Whether a card dropped on a case takes it there, its places in that case `places`: where it has one place. On the case open in place
 * (`open`), a price takes its own drop by its round "+", so the case as a whole takes a card only where its one place is no single price.
 */
export const dropTakes = (places: readonly Place[], open: boolean): boolean => places.length === 1 && (!open || places[0]!.on !== "price");

/** What the page does after a tap on a card, or as the hold ends: the card held next, the place to add it at, and where the focus goes. */
export interface HoldStep {
  held: Held | null;
  add: Place | null;
  /** The earliest place's round "+" (`plus`), so Enter adds there; the card the hold was on (`card`); or left where it is. */
  focus: { on: "plus" } | { on: "card"; card: string } | null;
}

/** The hold on `now` ended ("ביטול", Escape, a tap elsewhere): nothing held, the focus back on its card (`refocus`); null where none is held. */
export const letGoStep = (now: Held | null, refocus: boolean): HoldStep | null => (now ? { held: null, add: null, focus: refocus ? { on: "card", card: now.card } : null } : null);

/** A tap on card `card`, its places `places`, while `now` is held, as the page carries it out (`tapCard`). */
export function tapStep(now: Held | null, card: Held, places: readonly Place[]): HoldStep {
  const t = tapCard(now, card, places);
  if (t.k === "letGo") return letGoStep(now, true)!;
  if (t.k === "hold") return { held: t.held, add: null, focus: { on: "plus" } };
  return { held: null, add: t.k === "add" ? t.place : null, focus: null };
}

// ---------------------------------------------------------------- a part waiting at its place

/** The prices on a side of case `x` by the months they change in, in order; null where the case has no such side (a sale priced apart gone). */
const sideMonths = (x: Priced, side: Side): string | null => {
  const stages = side === "sell" ? x.sale : x.stages;
  return stages ? stages.map((s) => s.until ?? "").join(",") : null;
};

/** The prices place `p` of case `x` stands among, as a part waiting there remembers them: its side's months; the case as a whole, none. */
const seenAt = (x: Priced, p: Place): string | null => (p.on === "fee" ? "" : sideMonths(x, p.side));

/**
 * A part the toolbox added that waits for what it asks (a figure, a fee, a month) at the place it was added, with that place's prices as
 * they were then (`seen`: its side's prices by the months they change in). A price's place is its index among its side's prices, so the
 * part keeps to its price only while those prices stay as they were.
 */
export interface Waiting {
  part: PendingPart;
  place: Place;
  seen: string | null;
}

/** Part `part` waiting at place `place` of case `x`, as its prices are now. */
export const waitAt = (x: Priced, part: PendingPart, place: Place): Waiting => ({ part, place, seen: seenAt(x, place) });

/**
 * Whether a waiting part still waits in case `x` of a fee of `kind`: its side is still there with its prices as they were (none taken
 * away, split or moved, a sale priced apart not gone), and its place still takes it (`cardPlaces`: a price that can still hold it and has
 * it not yet). Where not, the part is dropped: it never moves to another price or another side.
 */
export const stillWaits = (kind: FeeKindId, x: Priced, w: Waiting): boolean =>
  w.seen !== null && seenAt(x, w.place) === w.seen && cardPlaces(kind, x, w.part).places.some((p) => samePlace(p, w.place));

// ---------------------------------------------------------------- a place in words

/** The month before `m`: a price that ends at the start of `m` holds through it. */
const monthBefore = (m: MonthKey): MonthKey => {
  const c = monthOf(m);
  return c.m === 1 ? monthKey({ y: c.y - 1, m: 12 }) : monthKey({ y: c.y, m: c.m - 1 });
};

/** A price's months among several, in words: "עד דצמבר 2026", "ממינואר 2027", "מינואר 2027 עד דצמבר 2027"; none for a side's one price. */
function monthsWords(stages: readonly { until?: MonthKey }[], k: number): string {
  const w = copy.cases.place;
  const from = stages[k - 1]?.until;
  const until = stages[k]?.until;
  const fromWords = from ? (() => { const d = fmt.date(from); return `${joinLead(w.from, d)}${d}`; })() : "";
  const untilWords = until ? `${w.until}${fmt.date(monthBefore(until))}` : "";
  return [fromWords, untilWords].filter(Boolean).join(" ");
}

/**
 * A place of case `x` in words, for its round "+"'s spoken name: "למחיר מינואר 2027", "למחיר במכירה עד דצמבר 2026", a side's "למחיר
 * בקנייה" where the sale is priced apart; the case as a whole, "למקרה" (a slim fee's, "לעמלה").
 */
export function placeWords(x: Priced, p: Place, slim: boolean): string {
  const w = copy.cases.place;
  if (p.on === "fee") return slim ? w.fee : w.case;
  const side = x.sale ? w.sides[p.side]! : "";
  const months = p.on === "price" ? monthsWords(stagesOn(x, p.side), p.k) : "";
  return [w.price, side, months].filter(Boolean).join(" ");
}
