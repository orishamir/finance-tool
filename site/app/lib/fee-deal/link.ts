// The fee page's address: `/deal#d=…` carries a whole deal, compressed, in the address's fragment, which the browser never sends to the
// server (GitHub Pages refuses a query of more than about 8,000 characters, and a house's whole price list is longer); `/deal?d=…`, the
// deal uncompressed in the query as the site wrote it before, still opens. `/deal?wrapper=<id>` opens a new deal of that kind and
// `/deal?track=<fundId>` a new deal of the track's kind filled from the track. A link is read with every field checked (`readLinkedDeal`):
// a broken or hostile value opens an empty deal with the reason it failed, and never throws; a fee in it that does not open is left out
// and named, and the rest of the deal opens.
import type { FeesData } from "../fee-page-data";
import { dealPagePath } from "../site-paths";
import { isProductId, newDeal, newDealId, newFeeId, readLinkedDeal, type FeeDeal, type FeeLeftOut, type Sourced } from "./model";
import type { PartKey } from "./offers/capabilities";
import { FIGURE_IDS, FIGURES, type FigureKey } from "./offers/figures";
import { dealFromTrack } from "./templates";

// ---------------------------------------------------------------- the subject in the address

/** The product or the track the address names (`?wrapper=`, `?track=`), or null. */
export function parseSubject(search: string): { kind: "wrapper"; wrapperId: string } | { kind: "track"; trackId: number } | null {
  const q = new URLSearchParams(search);
  const wrapper = q.get("wrapper");
  const track = q.get("track");
  if (wrapper) return { kind: "wrapper", wrapperId: wrapper };
  if (track && /^\d+$/.test(track)) return { kind: "track", trackId: Number(track) };
  return null;
}

// ---------------------------------------------------------------- a deal in the address

/**
 * The version the link's payload starts with. Version 2 carries cases, a price's parts and the reading's picks; a link of version 1 (a deal
 * before cases, which said what it held) is read the same way and opens as it was (`readDeal`). A link of another version opens an empty
 * deal.
 */
const LINK_VERSION = 2;
const READ_VERSIONS: readonly number[] = [1, 2];
/** No `?d=` is longer than this: the site wrote no longer one there, and a server refuses a query much longer. */
const QUERY_MAX = 12_000;
/**
 * No `#d=` is longer than this, compressed, nor its deal longer than `TEXT_MAX` once opened: a longer one is not one the site wrote. A
 * house's whole price list with its cases and each figure's source comes to about 21,000 characters, and about 2,200 compressed (FIBI's,
 * the longest).
 */
export const PACKED_MAX = 12_000;
const TEXT_MAX = 200_000;

/**
 * Why a link's deal did not open: `empty` (its `d` holds nothing), `broken` (cut short or changed: it does not decode, or what it holds
 * is not a deal), `version` (written in a version of the link this page does not read), `wrapper` (a kind the data does not have),
 * `track` (a track the data does not have).
 */
export type LinkFailure = "empty" | "broken" | "version" | "wrapper" | "track";

/** A deal a link carried, with the fees in it that did not open (`readLinkedDeal`); or why the link did not open. */
type Unpacked = { deal: FeeDeal; left: FeeLeftOut[] } | { failed: LinkFailure };
const failed = (why: LinkFailure): Unpacked => ({ failed: why });

/**
 * The short name in a link of each key a price's parts are kept in (capabilities.ts) and of each key a figure is kept under (figures.ts):
 * typed by those keys, so a new part's or figure's key cannot be left out of links.
 */
const PART_SHORT: Readonly<Record<PartKey, string>> = { min: "m", max: "x", cap: "Cp", flat: "Fl", perSecurity: "Ps", inTrade: "It", discount: "Di", third: "Th", notes: "No", offset: "Of", refund: "Rf" };
const FIGURE_SHORT: Readonly<Record<FigureKey, string>> = { rate: "r", amount: "a", min: "m", max: "x", cap: "Cp", upTo: "Ut", pct: "Pc", perSecurity: "Ps", refund: "Rf" };

/** Each field's short name in a link, both ways; a key not named here is not carried, and is dropped on the way in. */
const SHORT: Record<string, string> = {
  name: "n", kind: "k", provider: "p", held: "h", fees: "f", template: "T", stages: "s", sale: "S", price: "P", until: "u", form: "F",
  currency: "c", per: "q", every: "e", place: "l", payout: "o", id: "i",
  url: "U", title: "Ti", publisher: "Pu", strength: "St", checked: "Ch", effectiveFrom: "Ef", effectiveTo: "Et", ruleIds: "Ri", own: "Ow", feesKept: "Fk", page: "Pg",
  by: "B", cases: "C", when: "W", mine: "Mi", readFor: "R", is: "Is", label: "Lb", unit: "Un", tops: "Tp",
  alsoMin: "Am", who: "Wh", boundsEvery: "Be", src: "Sr", questions: "Qs",
  spans: "Sp", row: "Rw", along: "Al", span: "Sn", rank: "Rk", house: "Ho",
  ...PART_SHORT,
  ...FIGURE_SHORT,
};
const LONG: Record<string, string> = Object.fromEntries(Object.entries(SHORT).map(([k, v]) => [v, k]));
/**
 * The keys that hold a figure (`Num`): every figure's key in a price or its part (offers/figures.ts: a flat price's two, a discount's
 * share, a third party's figure and bounds, a refund), and a range's tops (`tops`, a list of figures). A link writes a figure as its
 * number, `[number, source]` where it is sourced, or `null` where it is not given yet (`Num.blank`).
 */
const FIGURE_KEYS: ReadonlySet<string> = new Set([...FIGURE_IDS.flatMap((f) => FIGURES[f].keys), "tops"]);

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Renames every key by `names`, leaving out a key it does not name (so no `__proto__` or other stray key is ever set). */
function renamed(v: unknown, names: Record<string, string>, figure: (key: string, value: unknown) => unknown): unknown {
  if (Array.isArray(v)) return v.map((x) => renamed(x, names, figure));
  if (!isObj(v)) return v;
  const out: Record<string, unknown> = {};
  for (const [k, x] of Object.entries(v)) {
    const to = Object.hasOwn(names, k) ? names[k]! : undefined;
    if (to === undefined) continue;
    const long = names === SHORT ? k : to;
    out[to] = !FIGURE_KEYS.has(long) ? renamed(x, names, figure) : long === "tops" && Array.isArray(x) ? x.map((n) => figure(long, n)) : figure(long, x);
  }
  return out;
}

const bytesToBase64Url = (bytes: Uint8Array): string => {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const base64UrlToBytes = (s: string): Uint8Array => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));

const utf8 = (bytes: Uint8Array): string => new TextDecoder("utf-8", { fatal: true }).decode(bytes);

/**
 * A deal as the text its link carries: its fields under short names, each figure as its number (or its number and the index of its source
 * in a table, where a template filled it). The deal's id, its fees' ids and when it was saved are left out: a link opens a new deal. A
 * price not given yet is carried as it is (its figure `null`), so a link copied while a price is being entered keeps every other price.
 */
function dealText(deal: FeeDeal): string {
  const sources: Sourced[] = [];
  const keyOf = (s: Sourced) => JSON.stringify(s);
  const { id: _id, saved: _saved, ...rest } = deal;
  const body = { ...rest, fees: deal.fees.map(({ id: _f, ...f }) => f) };
  const figure = (_k: string, x: unknown): Json => {
    const n = x as { v: number; src?: Sourced; blank?: true };
    if (n.blank) return null;
    if (!n.src) return n.v;
    let at = sources.findIndex((s) => keyOf(s) === keyOf(n.src!));
    if (at < 0) at = sources.push(n.src) - 1;
    return [n.v, at];
  };
  const short = renamed(body, SHORT, figure);
  const table = sources.map((s) => renamed(s, SHORT, (_k, x) => x));
  return JSON.stringify([LINK_VERSION, short, table]);
}

/** A deal from the text of a link, every field checked, with new ids, and the fees in it that did not open; or why it is not a deal the site wrote. */
function dealOfText(text: string): Unpacked {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return failed("broken");
  }
  if (!Array.isArray(raw) || raw.length !== 3) return failed("broken");
  if (!READ_VERSIONS.includes(raw[0] as number)) return failed(typeof raw[0] === "number" ? "version" : "broken");
  if (!isObj(raw[1]) || !Array.isArray(raw[2])) return failed("broken");
  const table = raw[2].map((s) => renamed(s, LONG, (_k, x) => x));
  const figure = (_k: string, x: unknown): unknown => {
    if (typeof x === "number") return { v: x };
    if (x === null) return { v: 0, blank: true };
    if (Array.isArray(x) && x.length === 2 && typeof x[0] === "number" && Number.isInteger(x[1]) && x[1] >= 0 && x[1] < table.length) return { v: x[0], src: table[x[1]] };
    return null;
  };
  const long = renamed(raw[1], LONG, figure) as Record<string, unknown>;
  const fees = Array.isArray(long.fees) ? long.fees.map((f) => (isObj(f) ? { ...f, id: newFeeId() } : f)) : long.fees;
  const r = readLinkedDeal({ ...long, id: newDealId(), fees });
  // a link none of whose fees open is a broken one, not an empty deal
  return r && !(r.left.length > 0 && r.deal.fees.length === 0) ? r : failed("broken");
}

/** A deal as the `d` of a link in the query, as the site wrote links before they moved to the fragment: its text, base64url. */
export const encodeDeal = (deal: FeeDeal): string => bytesToBase64Url(new TextEncoder().encode(dealText(deal)));

/** A deal from the `d` of a link in the query (`encodeDeal`); null where `d` is not a deal the site wrote. */
export function decodeDeal(d: string): FeeDeal | null {
  const r = decodedDeal(d);
  return "deal" in r ? r.deal : null;
}

function decodedDeal(d: string): Unpacked {
  if (d.length === 0) return failed("empty");
  if (d.length > QUERY_MAX || !/^[A-Za-z0-9_-]+$/.test(d)) return failed("broken");
  try {
    return dealOfText(utf8(base64UrlToBytes(d)));
  } catch {
    return failed("broken");
  }
}

/** Bytes through a compression stream ("deflate-raw" either way); null where the stream fails, or its output passes `max` bytes. */
async function through(bytes: Uint8Array, stream: CompressionStream | DecompressionStream, max = Infinity): Promise<Uint8Array | null> {
  try {
    const reader = new Blob([bytes as BlobPart]).stream().pipeThrough(stream).getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > max) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
    const out = new Uint8Array(total);
    let at = 0;
    for (const c of chunks) {
      out.set(c, at);
      at += c.length;
    }
    return out;
  } catch {
    return null;
  }
}

/**
 * A deal as the `d` of its link in the fragment: its text, compressed (deflate-raw), base64url. Null where the link could not open again:
 * its `d` longer than `PACKED_MAX`, or its text longer than the reader takes.
 */
export async function packDeal(deal: FeeDeal): Promise<string | null> {
  const text = new TextEncoder().encode(dealText(deal));
  if (text.length > TEXT_MAX) return null;
  const packed = await through(text, new CompressionStream("deflate-raw"));
  const d = packed && bytesToBase64Url(packed);
  return d && d.length <= PACKED_MAX ? d : null;
}

/** A deal from the `d` of a link in the fragment (`packDeal`); null where `d` is not a deal the site wrote. */
export async function unpackDeal(d: string): Promise<FeeDeal | null> {
  const r = await unpackedDeal(d);
  return "deal" in r ? r.deal : null;
}

async function unpackedDeal(d: string): Promise<Unpacked> {
  if (d.length === 0) return failed("empty");
  if (d.length > PACKED_MAX || !/^[A-Za-z0-9_-]+$/.test(d)) return failed("broken");
  let bytes: Uint8Array;
  try {
    bytes = base64UrlToBytes(d);
  } catch {
    return failed("broken");
  }
  const text = await through(bytes, new DecompressionStream("deflate-raw"), TEXT_MAX);
  if (!text) return failed("broken");
  try {
    return dealOfText(utf8(text));
  } catch {
    return failed("broken");
  }
}

/** The address of a deal: the fee page with the deal in the fragment's `d` (site-paths.ts); null where the link would be too long to open. */
export async function encodedDealPath(deal: FeeDeal): Promise<string | null> {
  const d = await packDeal(deal);
  return d === null ? null : dealPagePath({ deal: d });
}

/**
 * What an address gave the fee page: the deal it opens, and whether it was given as a deal (`given`: a link's, rather than a kind's or a
 * track's); the fees of a link's deal left out (`left`, each with why); and where the address failed, why (`failed`: the deal is then an
 * empty one, and not given).
 */
export interface AddressDeal {
  deal: FeeDeal;
  given: boolean;
  left: FeeLeftOut[];
  failed: LinkFailure | null;
}

/**
 * The deal the address opens (`search` its query, `hash` its fragment): a deal in the fragment's `d`, or in the query's `d` as the site wrote
 * links before; a new deal of the kind `wrapper` names, where it names a kind of the data; a new deal filled from the track `track` names.
 * Where `d` is broken or the kind or the track is unknown, an empty deal opens, not given, so the page keeps nothing of it, and `failed`
 * says why (`AddressDeal`). Null where the address names none of them, and the page opens what the device holds.
 */
export async function dealOfAddress(search: string, hash: string, data: Pick<FeesData, "kinds" | "houses" | "tracks" | "templates">, today: string): Promise<AddressDeal | null> {
  const opened = (r: Unpacked): AddressDeal => ("deal" in r ? { deal: r.deal, given: true, left: r.left, failed: null } : { deal: newDeal(null), given: false, left: [], failed: r.failed });
  const made = (deal: FeeDeal | null, why: LinkFailure) => opened(deal ? { deal, left: [] } : failed(why));
  const packed = new URLSearchParams(hash.replace(/^#/, "")).get("d");
  if (packed !== null) return opened(await unpackedDeal(packed));
  const d = new URLSearchParams(search).get("d");
  if (d !== null) return opened(decodedDeal(d));
  const subject = parseSubject(search);
  if (!subject) return null;
  if (subject.kind === "wrapper") return made(isProductId(subject.wrapperId) && data.kinds.some((k) => k.id === subject.wrapperId) ? newDeal(subject.wrapperId) : null, "wrapper");
  return made(dealFromTrack(subject.trackId, data, today), "track");
}
