// A deal through a link and back, for the tests, on the path the page takes: `packDeal` writes the fragment's `d` and `dealOfAddress`
// opens it. A link in the query, which the page also opens, carries the same text uncompressed.
import { inflateRawSync } from "node:zlib";
import { dealOfAddress, packDeal } from "./link";
import type { FeeDeal } from "./model";

/** No kinds, houses, tracks or templates: a link carrying a deal reads none of them. */
const NO_DATA: Parameters<typeof dealOfAddress>[2] = { kinds: [], houses: [], tracks: [], templates: {} };

/** The deal an address opens as a given deal; null where it opens none, or an empty one because the link failed. */
async function opened(search: string, hash: string): Promise<FeeDeal | null> {
  const r = await dealOfAddress(search, hash, NO_DATA, "2026-11-12");
  return r?.given ? r.deal : null;
}

/** The fragment's `d` of a deal's link; a deal whose link would be too long to open fails the test. */
async function packed(deal: FeeDeal): Promise<string> {
  const d = await packDeal(deal);
  if (d === null) throw new Error("the deal's link is too long to open");
  return d;
}

/** The deal as the page opens it from its link. */
export const throughLink = async (deal: FeeDeal): Promise<FeeDeal | null> => opened("", `#d=${await packed(deal)}`);

/** The text a deal's link carries (`packDeal` compresses it). */
export const linkText = async (deal: FeeDeal): Promise<string> => inflateRawSync(Buffer.from(await packed(deal), "base64url")).toString("utf8");

/** A link's text as the `d` of a link in the query: uncompressed, base64url. */
export const queryD = (text: string): string => Buffer.from(text, "utf8").toString("base64url");

/** The deal as the `d` of a link in the query. */
export const queryLink = async (deal: FeeDeal): Promise<string> => queryD(await linkText(deal));

/** The deal a link in the query opens (`?d=`); null where it opens none. */
export const openQueryLink = (d: string): Promise<FeeDeal | null> => opened(`?d=${d}`, "");
