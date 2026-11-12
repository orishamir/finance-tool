// What a house's documents hold that its price leaves out (D106), from its price record's `left_out`: the things that can change what some
// reader pays (`could_change_price`, with the reason in plain Hebrew, `why_he`) are said beside the house's price, each with its reason and
// the price list at its page; the rest are listed under a second heading by their names only. The record's English working note (`why`) is
// never shown. Shared by the indices page, the fees page and a company's price card.
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

/** What the record leaves out, or null where it lists nothing. */
export function leftOutOf(snap: Record_ | undefined | null): LeftOutView | null {
  const list = snap?.left_out ?? [];
  if (list.length === 0) return null;
  const shown = list.filter((e) => e.could_change_price === true && !!e.why_he);
  const rest = list.filter((e) => !shown.includes(e));
  const title = withoutCodes(snap!.tariff.title);
  const pdf = isPdfUrl(snap!.tariff.url);
  const doc = (page: number | undefined) => ({ href: sourceHref({ url: snap!.tariff.url, page: page ?? null }), title: page && pdf ? c.page(title, page) : title });
  const others = [...new Set(rest.map((e) => gershayim(e.what)))];
  return {
    warn: shown.length,
    other: others.length,
    lead: shown.length > 0 ? c.sheetLead : c.sheetLeadOther,
    parts: [...shown.map((e) => ({ head: gershayim(e.what), text: gershayim(e.why_he!), doc: doc(e.page) })), ...others.map((text) => ({ text, group: shown.length > 0 ? c.other : "" }))],
  };
}

/** Each house's left-out things (by its record's id), and the house an address belongs to: one that only that house's record names. */
export interface LeftOutData {
  byHouse: Record<string, { house: string; view: LeftOutView }>;
  houseOf: Record<string, string>;
}

/** The houses whose price lists the fee lines cite (the fees page), each once, in the lines' order. */
export function housesOf(lines: readonly { rate: { source?: { url?: string } } | null }[], leftOut: LeftOutData): { house: string; view: LeftOutView }[] {
  const ids = [...new Set(lines.flatMap((l) => { const id = l.rate?.source?.url ? leftOut.houseOf[l.rate.source.url] : undefined; return id ? [id] : []; }))];
  return ids.map((id) => leftOut.byHouse[id]!);
}

/** `LeftOutData` over the latest records: an address counts for a house only where no other house's record names it (a page can cite the
 *  same exchange or regulator page from several records, and those name no house), a brand that is part of a house aside. */
export function leftOutData(snaps: readonly (Record_ & { id: string; provider: { name_he: string; part_of?: string | undefined } })[], cited?: ReadonlySet<string>): LeftOutData {
  const owners = new Map<string, Set<string>>();
  const urls = (node: unknown, id: string): void => {
    if (Array.isArray(node)) node.forEach((n) => urls(n, id));
    else if (node && typeof node === "object") {
      const o = node as Record<string, unknown>;
      if (typeof o.url === "string") owners.set(o.url, (owners.get(o.url) ?? new Set()).add(id));
      for (const v of Object.values(o)) urls(v, id);
    }
  };
  // the addresses a price can cite: the price list's and its lines' (not every document a record names, which the page would carry for nothing)
  for (const snap of snaps) urls([snap.tariff, (snap as { lines?: unknown }).lines], snap.id);
  const out: LeftOutData = { byHouse: {}, houseOf: {} };
  for (const snap of snaps) {
    const view = leftOutOf(snap);
    if (view) out.byHouse[snap.id] = { house: snap.provider.name_he, view };
  }
  // a brand that is part of a house and prints the house's own price list (Pepper, Leumi's) yields the address to the house
  const partOf = new Map(snaps.map((s) => [s.id, s.provider.part_of]));
  for (const [url, ids] of owners) {
    const own = [...ids].filter((id) => !ids.has(partOf.get(id) ?? ""));
    if (own.length === 1 && out.byHouse[own[0]!] && (!cited || cited.has(url))) out.houseOf[url] = own[0]!;
  }
  // with `cited` (the addresses the page's prices can cite), only the houses those name ship to the browser
  if (cited) for (const id of Object.keys(out.byHouse)) if (!Object.values(out.houseOf).includes(id)) delete out.byHouse[id];
  return out;
}
