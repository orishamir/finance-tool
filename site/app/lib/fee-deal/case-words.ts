// The words of a fee's cases and parts (method §10.6, F-114): a thing's name, a case's value for each thing as a row and a slot say it, a
// list's values with a lead they share, and a price's parts as a slim line says them. Every word is from the copy; the rows, the panel
// and the undo's lines arrange them.
import { feeDeal as copy } from "../../copy";
import type { SiteValue } from "../value";
import { hasCases, isRange, namesPlaces, type CasesFee, type Fee, type Price, type Priced, type When } from "./model";
import { FIGURES, type Figure } from "./offers/figures";
import { PARTS, partsSaid, type PartId, type PartKind } from "./offers/parts";
import { SAID, signOfUnit, type PartContext, type PartWords } from "./part-words";
import { priceView, type DealRead, type PriceView } from "./deal-read";
import { WHAT_VALUES, type FeeKindId } from "./shapes";
import { pickKind, type ByKind } from "./offers/conditions";
import { figure, sumUnit } from "./values";

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

/**
 * A part as a slim line shows it: its id, its kind and its words; `stage`, its price's place among the prices where it is a later one;
 * and its figures as a box would edit them (`fields`), so a figure read on a closed fee is edited where it is read.
 */
export interface SlimPart {
  id: PartId;
  kind: PartKind;
  words: PartWords;
  stage?: number;
  fields?: PartField[];
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
 * time, after each price the month the next starts ("ומינואר 2027", `SAID.until`) and then that price's parts (`stage`, its place among
 * the prices), so a closed fee reads its whole sequence on one line: "חינם · ומינואר 2027 · 20 ₪ בחודש".
 */
export function slimParts(fee: Pick<Fee, "kind">, priced: Priced, r: Pick<DealRead, "today">): SlimPart[] {
  return priced.stages.flatMap((stage, k) => {
    const view = priceView([fee], 0, stage.price, r.today);
    const said = saidParts({ kind: fee.kind, p: stage.price, view, ...(stage.until ? { until: stage.until } : {}) }, k === 0 && !!priced.sale);
    const parts = said.filter((x) => x.id !== "until").map((x) => {
      const fields = figureFields(x.id, stage.price, view);
      return { ...x, ...(k ? { stage: k } : {}), ...(fields.length ? { fields } : {}) };
    });
    const change = said.find((x) => x.id === "until");
    return change ? [...parts, { ...change, stage: k + 1 }] : parts;
  });
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

/** Words that share a lead ending in ", " say it once: "בחו״ל, באירופה, בשאר העולם". */
function sharedLead(words: readonly string[]): string {
  const cut = words[0]?.indexOf(", ") ?? -1;
  const lead = cut > 0 ? words[0]!.slice(0, cut + 2) : "";
  if (words.length < 2 || !lead || !words.every((x) => x.startsWith(lead) && x.length > lead.length)) return words.join(", ");
  return lead + words.map((x) => x.slice(lead.length)).join(", ");
}

/**
 * A case's values of a list thing in words. Where the case names every value abroad and nothing else, the lead they share alone
 * ("בחו״ל"); where it names every value abroad but those the fee's other cases name, "מחוץ ל" theirs after that lead ("בחו״ל, מחוץ
 * לארה״ב"); else its values, a lead they share said once (`sharedLead`).
 */
function listWords(fee: CasesFee, t: number, values: readonly string[]): string {
  const b = fee.by[t]!;
  const words = values.map((v) => valueWords(b.kind, v));
  if (!namesPlaces(b)) return sharedLead(words);
  const abroad = Object.keys(WHAT_VALUES).filter((v) => WHAT_VALUES[v]!.place === "abroad");
  // every value abroad and nothing else: the lead they share alone ("בחו״ל")
  if (values.length > 1 && values.length === abroad.length && abroad.every((v) => values.includes(v))) return valueWords(b.kind, abroad[0]!).split(", ")[0]!;
  const others = new Set(fee.cases.flatMap((c) => (Array.isArray(c.when[t]) && c.when[t] !== values ? (c.when[t] as string[]).filter((v) => abroad.includes(v) && !values.includes(v)) : [])));
  const all = values.length > 1 && values.every((v) => abroad.includes(v)) && others.size > 0 && abroad.every((v) => values.includes(v) || others.has(v));
  if (!all) return sharedLead(words);
  const o = copy.cases.outside;
  // the lead the values abroad share ("בחו״ל")
  const lead = valueWords(b.kind, abroad[0]!).split(", ")[0]!;
  const names = abroad.filter((v) => others.has(v)).map((v) => o.names[v] ?? valueWords(b.kind, v));
  return `${lead}, ${o.lead}${names.join(o.and)}`;
}

/** The case a fee's card, panel and toolbox show where none is named: its first, the one the edits edit where none is named (edits/stage.ts). */
export const firstCase = (fee: Fee): string | undefined => (hasCases(fee) ? fee.cases[0]!.id : undefined);
