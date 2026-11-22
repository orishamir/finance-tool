// What a house's documents hold that its price leaves out (D106), from its price record's `left_out`: the things that can change what some
// reader pays (`could_change_price`, with the reason in plain Hebrew, `why_he`) are said beside the house's price, each with its reason and
// the document it quotes at its page (the entry's own `source`, else the price list); the rest are listed under a second heading by their
// names only. The record's English working note (`why`) is never shown. Shared by the indices page and a company's price card.
import type { FeesSnapshot } from "@finance-tool/schema";
import { leftOut as c } from "../copy";
import { gershayim } from "./format";
import { isPdfUrl, sourceHref, withoutCodes } from "./sources";

/** One of the sheet's parts (the shape of `SheetPart` in components/provenance). */
export interface LeftOutPart {
  head?: string;
  text: string;
  doc?: { href: string; title: string };
  group?: string;
}

export interface LeftOutView {
  /** How many things can change what some reader pays: said as a warning beside the price. */
  warn: number;
  /** How many other things the documents hold and the price leaves out. */
  other: number;
  /** The sheet: the lead, then each warning (what, why, the document at its page), then the others as a list, under their own heading after the warnings. */
  lead: string;
  parts: LeftOutPart[];
}

type Record_ = Pick<FeesSnapshot, "left_out"> & { tariff: Pick<FeesSnapshot["tariff"], "url" | "title"> };
type Entry = NonNullable<FeesSnapshot["left_out"]>[number];

/** What the record leaves out, or null where it lists nothing. */
export function leftOutOf(snap: Record_ | undefined | null): LeftOutView | null {
  const list = snap?.left_out ?? [];
  if (!snap || list.length === 0) return null;
  const shown = list.filter((e) => e.could_change_price === true && !!e.why_he);
  const rest = list.filter((e) => !shown.includes(e));
  const tariff = snap.tariff;
  // the entry's own document where it quotes one, else the price list
  const doc = ({ source, page }: Entry) => {
    const { url, title } = source ?? tariff;
    const name = withoutCodes(title);
    return { href: sourceHref({ url, page: page ?? null }), title: page && isPdfUrl(url) ? c.page(name, page) : name };
  };
  const others = [...new Set(rest.map((e) => gershayim(e.what)))];
  return {
    warn: shown.length,
    other: others.length,
    lead: shown.length > 0 ? c.sheetLead : c.sheetLeadOther,
    parts: [...shown.map((e) => ({ head: gershayim(e.what), text: gershayim(e.why_he!), doc: doc(e) })), ...others.map((text) => ({ text, group: shown.length > 0 ? c.other : "" }))],
  };
}
