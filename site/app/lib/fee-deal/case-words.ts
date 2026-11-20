// The words of a fee's cases and parts (method §10.6, F-114): a thing's name, a case's value for each thing as a row and a slot say it, a
// list's values with a lead they share, and a price's parts as a slim line says them. Every word is from the copy; the rows, the panel
// and the undo's lines arrange them.
import { feeDeal as copy } from "../../copy";
import type { SiteValue } from "../value";
import { hasCases, isRange, namesPlaces, thingValues, type CasesFee, type Fee, type Price, type Priced, type Stage, type When } from "./model";
import { amountWords, formatValue, joinLead } from "../format";
import { FIGURES, type Figure } from "./offers/figures";
import { PARTS, partsSaid, type PartId, type PartKind } from "./offers/parts";
import { SAID, signOfUnit, type PartContext, type PartWords } from "./part-words";
import { priceView, type DealRead, type PriceView } from "./deal-read";
import { WHAT_VALUES, type FeeKindId } from "./shapes";
import { CONDITIONS, pickKind, type ByKind } from "./offers/conditions";
import { figure, sumUnit } from "./values";
import { heldAlike } from "./alike";
import type { Unpriced } from "./unpriced";

/** A figure of a part, as its box edits it: which figure of the price, its value, and its box's sign (a percent, or a currency's sign). */
export interface PartField {
  figure: Figure;
  value: SiteValue | null;
  sign: "pct" | string;
  /** Its box draws no sign of its own: the currency chooser stands beside it and shows the currency once. */
  bare?: true;
}

/** A part's fields: each figure it holds that the price has a place for, with its value and its box's sign. */
export const figureFields = (id: PartId, p: Price, view: PriceView): PartField[] =>
  PARTS[id].figures.filter((f) => FIGURES[f].placed(p)).map((f) => ({ figure: f, value: view.figures[f] ?? null, sign: signOfUnit(FIGURES[f].unit(p)) }));

/** Each case a cell covers and its value of one figure, where the cases hold that figure from more than one place (`mergedParts`). */
export type FigureFroms = readonly { case: string; value: SiteValue }[];

/**
 * A part as a slim line shows it: its id, its kind and its words; `stage`, its price's place among the prices where it is a later one;
 * and its figures as a box would edit them (`fields`), so a figure read on a closed fee is edited where it is read. `froms`, by figure
 * (the first, then the second): where a cell covers several cases that hold the figure from different places, each case's.
 */
export interface SlimPart {
  id: PartId;
  kind: PartKind;
  words: PartWords;
  stage?: number;
  fields?: PartField[];
  froms?: readonly (FigureFroms | null)[];
  /** A later price's part it holds exactly as the price before it (`heldAlike`): a table, a grid and the cases read as rows leave it unsaid. */
  alike?: true;
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

// ---------------------------------------------------------------- the words of a price's parts

/**
 * A thing a fee's price changes by, in words that follow the fee: the size of its own action ("גודל ההמרה" on a conversion), a condition
 * of the person's own by its name, any other thing by its name.
 */
export const thingName = (kind: FeeKindId, b: { kind: ByKind; label?: string }): string =>
  b.kind === "own" ? (b.label ?? copy.cases.things.own!) : b.kind === "actionSize" ? (copy.cases.actionSize[kind] ?? copy.cases.actionSize.default!) : copy.cases.things[b.kind]!;
/**
 * A price's parts as a slim line says them (`partsSaid`, `SAID`): its price, its bounds, its links and its notes; where it changes with
 * time, after each price the month the next starts ("מינואר 2027", `SAID.until`, of the kind `when`, which a line draws across the place)
 * and then that price's parts (`stage`, its place among the prices), so a closed fee reads its whole sequence in time: "חינם", the line
 * "מינואר 2027", "20 ₪ בחודש".
 */
export function slimParts(fee: Pick<Fee, "kind">, priced: Priced, r: Pick<DealRead, "today">): SlimPart[] {
  const sale = priced.sale ? saleWords(fee, priced.sale, r) : null;
  return priced.stages.flatMap((stage, k) => {
    const view = priceView([fee], 0, stage.price, r.today);
    const said = saidParts({ kind: fee.kind, p: stage.price, view, ...(stage.until ? { until: stage.until } : {}) }, k === 0 && !!priced.sale);
    const before = k ? priced.stages[k - 1]!.price : null;
    const parts = said.filter((x) => x.id !== "until").map((x) => {
      if (x.id === "sale" && sale) return { ...x, words: { lead: sale } };
      const fields = figureFields(x.id, stage.price, view);
      return { ...x, ...(k ? { stage: k } : {}), ...(fields.length ? { fields } : {}), ...(before && heldAlike(before, stage.price, x.id) ? { alike: true as const } : {}) };
    });
    // with a sale priced apart, the purchase's price says it is the purchase's, "בקנייה:", as the sale says "במכירה:"
    if (sale && k === 0 && parts[0]) parts[0] = { ...parts[0], words: { ...parts[0].words, lead: `${copy.cases.buySaid}${parts[0].words.lead ?? ""}` } };
    const change = said.find((x) => x.id === "until");
    return change ? [...parts, { ...change, stage: k + 1 }] : parts;
  });
}

/** A part's words as plain text: its words and figures in order. */
const wordsText = (w: PartWords): string =>
  [w.lead, w.figure && amountWords(formatValue(w.figure.value as number, w.figure.unit)), w.mid, w.second && amountWords(formatValue(w.second.value as number, w.second.unit)), w.tail].filter(Boolean).join("");

/**
 * A sale priced apart, as a line says it in place of "מכירה במחיר אחר" (founder, 2026-11-19: the note read as a fee of its own): "במכירה:"
 * and its first price's parts, "במכירה: חינם", "במכירה: 0.1% לכל פעולה, מינימום 10 ₪".
 */
function saleWords(fee: Pick<Fee, "kind">, stages: readonly Stage[], r: Pick<DealRead, "today">): string {
  const p = stages[0]!.price;
  const said = saidParts({ kind: fee.kind, p, view: priceView([fee], 0, p, r.today) }, false).filter((x) => x.id !== "until");
  return `${copy.cases.saleSaid}${said.map((x) => wordsText(x.words).trim()).join(", ")}`;
}

/** The parts a price says, each with its words, and a sale priced apart where the line has one; a part with nothing to say yet is left out. */
export function saidParts(c: PartContext, sale: boolean): SlimPart[] {
  return partsSaid(c.p, { ...(c.until ? { until: c.until } : {}), sale }).flatMap((id) => {
    const words = SAID[id](c);
    return words ? [{ id, kind: PARTS[id].kind, words }] : [];
  });
}

// ---------------------------------------------------------------- a fee's cases

/** The words of one value the site names, or the person's own words. */
export function valueWords(kind: ByKind, v: string): string {
  const list = (copy.cases.values as Record<string, Record<string, string>>)[pickKind(kind)];
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

/**
 * Words that share a lead ending in ", " say it once, each run of them where the others do not share it: "ניירות ערך בחו״ל, באירופה, בשאר
 * העולם", and "ניירות ערך בתל אביב, ניירות ערך בחו״ל, בארה״ב, באירופה" where a word without that lead comes first.
 */
function sharedLead(words: readonly string[]): string {
  const leadOf = (x: string) => {
    const cut = x.indexOf(", ");
    return cut > 0 && x.length > cut + 2 ? x.slice(0, cut + 2) : "";
  };
  const groups: { lead: string; words: string[] }[] = [];
  for (const x of words) {
    const lead = leadOf(x);
    const g = lead ? groups.find((y) => y.lead === lead) : undefined;
    if (g) g.words.push(x);
    else groups.push({ lead, words: [x] });
  }
  return groups.map((g) => (g.lead && g.words.length > 1 ? g.lead + g.words.map((x) => x.slice(g.lead.length)).join(", ") : g.words.join(", "))).join(", ");
}

/**
 * A case's values of a list thing in words. Where the case names every value abroad and nothing else, the lead they share alone
 * ("ניירות ערך בחו״ל"); where it names every value abroad but those the fee's other cases name, "מחוץ ל" theirs after that lead ("ניירות ערך בחו״ל, מחוץ
 * לארה״ב"); else its values, a lead they share said once (`sharedLead`).
 */
function listWords(fee: CasesFee, t: number, values: readonly string[]): string {
  const b = fee.by[t]!;
  const words = values.map((v) => valueWords(b.kind, v));
  if (!namesPlaces(b)) return sharedLead(words);
  const abroad = Object.keys(WHAT_VALUES).filter((v) => WHAT_VALUES[v]!.place === "abroad");
  // every value abroad and nothing else: the lead they share alone ("ניירות ערך בחו״ל"); beside other values, that lead in their place
  const everyAbroad = abroad.length > 1 && abroad.every((v) => values.includes(v));
  if (everyAbroad && values.length === abroad.length) return valueWords(b.kind, abroad[0]!).split(", ")[0]!;
  if (everyAbroad) {
    const at = values.findIndex((v) => abroad.includes(v));
    const rest = values.filter((v) => !abroad.includes(v));
    const said = rest.map((v) => valueWords(b.kind, v));
    said.splice(at, 0, valueWords(b.kind, abroad[0]!).split(", ")[0]!);
    return sharedLead(said);
  }
  // the thing's other values abroad, a row or a column no case holds among them
  const others = new Set(thingValues(fee, t).filter((v) => abroad.includes(v) && !values.includes(v)));
  const all = values.length > 1 && values.every((v) => abroad.includes(v)) && others.size > 0 && abroad.every((v) => values.includes(v) || others.has(v));
  if (!all) return sharedLead(words);
  const o = copy.cases.outside;
  // the lead the values abroad share ("בחו״ל")
  const lead = valueWords(b.kind, abroad[0]!).split(", ")[0]!;
  const names = abroad.filter((v) => others.has(v)).map((v) => o.names[v] ?? valueWords(b.kind, v));
  return `${lead}, ${o.lead}${names.join(o.and)}`;
}

/**
 * The lead of a table's line of the parts every case of it holds: the thing's any-words where its cases name every value it can take (on a
 * list the site closes, what is bought or held, the currency or the channel, every one of them and each value of the fee's own; a range's
 * steps always), else "in every case", since some values have no case there ("בכל מה שקונים" would say a price for what has none).
 */
export function onceLead(fee: CasesFee, t: number): string {
  const b = fee.by[t]!;
  const def = CONDITIONS[b.kind].values;
  const any = fee.cases.some((c) => c.when[t] === "any");
  const named = (v: string) => fee.cases.some((c) => Array.isArray(c.when[t]) && (c.when[t] as string[]).includes(v));
  const own = "own" in b && b.own ? b.own.map((o) => o.name) : [];
  const every = any || def.kind === "range" || (def.kind === "list" ? [...def.ids, ...own].every(named) : thingValues(fee, t).every(named));
  return copy.cases.onceLead.replace("{any}", every ? copy.cases.any[b.kind]! : copy.cases.everyCase.where);
}

/** The case a fee's card, panel and toolbox show where none is named: its first, the one the edits edit where none is named (edits/stage.ts). */
export const firstCase = (fee: Fee): string | undefined => (hasCases(fee) ? fee.cases[0]!.id : undefined);

// ---------------------------------------------------------------- a price not given

/**
 * A case's value of thing `t` inside a sentence: words that say a place of their own ("בסניף", "בכל ערוץ") as they are, a range's step
 * as its range ("עד 100,000 ₪"), and a named value of a thing whose words say no place after that thing's lead (`unpriced.inSentence`,
 * "בניירות ערך בתל אביב").
 */
function whenIn(fee: CasesFee, w: When, t: number, today: string): string {
  const words = whenWords(fee, w, t, today);
  if (words.figure) return `${words.lead ?? ""}${amountWords(formatValue(words.figure.value as number, words.figure.unit))}`;
  const text = words.text ?? "";
  if (words.any) return text;
  const lead = copy.unpriced.inSentence[fee.by[t]!.kind] ?? "";
  return `${joinLead(lead, text)}${text}`;
}

/**
 * Cases of a fee named inside a sentence, after what is missing there ("חסר מחיר בניירות ערך בתל אביב, באינטרנט ובאפליקציה"): each case's
 * values of its things (`whenIn`), joined, the cases in the fee's order one after the other. Null for a fee whose price changes by nothing,
 * or where none of `ids` is its case.
 */
export function casesWhere(fee: Fee, ids: readonly string[], today: string): string | null {
  if (!hasCases(fee)) return null;
  const said = fee.cases.filter((c) => ids.includes(c.id)).map((c) => c.when.map((w, t) => whenIn(fee, w, t, today)).join(copy.unpriced.thingSep));
  return said.length ? said.join(copy.unpriced.caseSep) : null;
}

/** A fee left out for a price not given (`Unpriced`), with its cases named inside a sentence (`casesWhere`; null for none). */
export interface UnpricedSaid extends Unpriced {
  where: string | null;
}

/** How fee `id` is left out for a price not given, said (`UnpricedSaid`); undefined where the reading does not leave it out so. */
export function unpricedSaid(r: Pick<DealRead, "deal" | "unpricedAt" | "today">, id: string): UnpricedSaid | undefined {
  const u = r.unpricedAt[id];
  const fee = r.deal.fees.find((f) => f.id === id);
  return u && fee ? { ...u, where: casesWhere(fee, u.cases, r.today) } : undefined;
}
