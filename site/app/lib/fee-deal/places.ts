// Where a toolbox card can go in the case open in place (method §10.6), and a card held while the person picks one of several. A card's
// places are found from the part registry (`partGoes`, `holds`, `used`): a part a price keeps goes on each price that can hold it and has
// it not yet; a charge (a form of the price) goes only on a price that charges nothing, so the toolbox never swaps one charge for another;
// the month a price changes from goes on each side's prices as a whole (the purchase's, a sale priced apart's), its month then deciding
// which price splits; a sale priced apart goes on the case as a whole. A tap on a card with one place adds it there; with several it holds
// the card, each place drawing a round "+" until one is tapped or the hold ends. Pure; its words come from the copy.
import { feeDeal as copy } from "../../copy";
import { fmt, joinLead } from "../format";
import { monthKey, monthOf, type MonthKey, type Priced, type Side } from "./model";
import { charged } from "./offers/capabilities";
import { isFormPart, PARTS, partGoes, type PartAt, type PartId } from "./offers/parts";
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
