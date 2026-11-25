// What a house's documents hold that its price leaves out (D106), from its price record's `left_out`: the things that can change what some
// reader pays (`could_change_price`, with the reason in plain Hebrew, `why_he`), each with its reason and the document it quotes at its
// page (the entry's own `source`, else the price list); the rest by their names only. The record's English working note (`why`) is never
// shown. Shared by the indices page, a company's price card and the fee page's picker; each shows it in its own place (a line whose words
// open a sheet, `sheetOf`, or a fold in the house's terms).
import type { FeesSnapshot } from "@finance-tool/schema";
import { leftOut as c } from "../copy";
import { gershayim } from "./format";
import { isPdfUrl, sourceHref, withoutCodes } from "./sources";

/** A document, at the page a thing is on where it has pages. */
export interface LeftOutDoc {
  href: string;
  title: string;
}

/** One sentence about a thing left out, with the document it rests on. */
export interface LeftOutSentence {
  text: string;
  doc?: LeftOutDoc;
}

/** A thing that can change what some reader pays: its short name, and what the documents and the record say of it. */
export interface LeftOutChange {
  head: string;
  lines: LeftOutSentence[];
}

export interface LeftOutView {
  /** The things that can change what some reader pays, said as a warning beside the price. */
  changes: LeftOutChange[];
  /** The other things the documents hold and the price leaves out, by their short names. */
  others: string[];
}

/** One of the sheet's parts (the shape of `SheetPart` in components/provenance). */
export interface LeftOutPart {
  head?: string;
  text: string;
  doc?: LeftOutDoc;
  group?: string;
}

type Record_ = Pick<FeesSnapshot, "left_out"> & { tariff: Pick<FeesSnapshot["tariff"], "url" | "title"> };
type Entry = NonNullable<FeesSnapshot["left_out"]>[number];

/** An entry's short name for the reader. `what` stands in for it until every house's latest record carries name_he. */
const nameOf = (e: Entry): string => gershayim(e.name_he ?? e.what);

/** What the record leaves out, or null where it lists nothing. */
export function leftOutOf(snap: Record_ | undefined | null): LeftOutView | null {
  const list = snap?.left_out ?? [];
  if (!snap || list.length === 0) return null;
  const shown = list.filter((e) => e.could_change_price === true && !!e.why_he);
  const rest = list.filter((e) => !shown.includes(e));
  const tariff = snap.tariff;
  // the entry's own document where it quotes one, else the price list
  const doc = ({ source, page }: Entry): LeftOutDoc => {
    const { url, title } = source ?? tariff;
    const name = withoutCodes(title);
    return { href: sourceHref({ url, page: page ?? null }), title: page && isPdfUrl(url) ? c.page(name, page) : name };
  };
  return {
    changes: shown.map((e) => ({ head: nameOf(e), lines: [{ text: gershayim(e.why_he!), doc: doc(e) }] })),
    others: [...new Set(rest.map(nameOf))],
  };
}

/**
 * The view with a price the house's documents print and the ranked price leaves out (a standing order's, D41, D56) first among the things
 * that can change what some reader pays, under `head`; the view as it was where there is none.
 */
export function withAside(view: LeftOutView | null, head: string, aside: readonly LeftOutSentence[]): LeftOutView | null {
  if (aside.length === 0) return view;
  return { changes: [{ head, lines: [...aside] }, ...(view?.changes ?? [])], others: view?.others ?? [] };
}

/**
 * The view as a sheet: its lead, then each thing that can change a price (its name over its first sentence, each sentence with its
 * document), then the others as a list, under their own heading after the warnings, or with none where nothing can change the price.
 */
export function sheetOf(view: LeftOutView): { lead: string; parts: LeftOutPart[] } {
  const warn = view.changes.length > 0;
  return {
    lead: warn ? c.sheetLead : c.sheetLeadOther,
    parts: [
      ...view.changes.flatMap((ch) => ch.lines.map((l, i) => ({ ...(i === 0 ? { head: ch.head } : {}), text: l.text, ...(l.doc ? { doc: l.doc } : {}) }))),
      ...view.others.map((text) => ({ text, group: warn ? c.other : "" })),
    ],
  };
}
