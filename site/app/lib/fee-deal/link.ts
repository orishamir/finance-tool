// The fee page's address: `/deal#d=…` carries a whole deal, compressed, in the address's fragment, which the browser never sends to the
// server (GitHub Pages refuses a query of more than about 8,000 characters, and a house's whole price list is longer); `/deal?d=…`, the
// deal uncompressed in the query as the site wrote it before, still opens. `/deal?wrapper=<id>` opens a new deal of that kind and
// `/deal?track=<fundId>` a new deal of the track's kind filled from the track. A link is read with every field checked (`readDeal`): a
// broken or hostile value opens an empty deal and never throws.
import type { FeesData } from "../fee-page-data";
import { dealPagePath } from "../site-paths";
import { isProductId, newDeal, newDealId, newFeeId, readDeal, type FeeDeal, type Sourced } from "./model";
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
const PACKED_MAX = 12_000;
const TEXT_MAX = 200_000;

/** Each field's short name in a link, both ways; a key not named here is not carried, and is dropped on the way in. */
const SHORT: Record<string, string> = {
  name: "n", kind: "k", provider: "p", held: "h", fees: "f", template: "T", stages: "s", sale: "S", price: "P", until: "u", form: "F",
  rate: "r", min: "m", max: "x", currency: "c", per: "q", every: "e", amount: "a", place: "l", payout: "o", id: "i", cap: "Cp", flat: "Fl", upTo: "Ut",
  url: "U", title: "Ti", publisher: "Pu", strength: "St", checked: "Ch", effectiveFrom: "Ef", effectiveTo: "Et", ruleIds: "Ri", own: "Ow", feesKept: "Fk", page: "Pg",
  by: "B", cases: "C", when: "W", mine: "Mi", readFor: "R", is: "Is", label: "Lb", unit: "Un", tops: "Tp",
  discount: "Di", pct: "Pc", alsoMin: "Am", third: "Th", who: "Wh", offset: "Of", refund: "Rf", notes: "No", boundsEvery: "Be",
};
const LONG: Record<string, string> = Object.fromEntries(Object.entries(SHORT).map(([k, v]) => [v, k]));
/**
 * The fields of a price that hold a figure (`Num`), a flat price's two among them (`amount`, `upTo`), a discount's share (`pct`), a refund,
 * and a range's tops (`tops`, a list of figures): a link writes a figure as its number, `[number, source]` where it is sourced, or `null`
 * where it is not given yet (`Num.blank`).
 */
const FIGURES = new Set(["rate", "min", "max", "amount", "cap", "upTo", "pct", "refund", "tops"]);

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
    out[to] = !FIGURES.has(long) ? renamed(x, names, figure) : long === "tops" && Array.isArray(x) ? x.map((n) => figure(long, n)) : figure(long, x);
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

/** A deal from the text of a link, every field checked, with new ids; null where it is not a deal the site wrote. */
function dealOfText(text: string): FeeDeal | null {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (!Array.isArray(raw) || raw.length !== 3 || !READ_VERSIONS.includes(raw[0] as number) || !isObj(raw[1]) || !Array.isArray(raw[2])) return null;
  const table = raw[2].map((s) => renamed(s, LONG, (_k, x) => x));
  const figure = (_k: string, x: unknown): unknown => {
    if (typeof x === "number") return { v: x };
    if (x === null) return { v: 0, blank: true };
    if (Array.isArray(x) && x.length === 2 && typeof x[0] === "number" && Number.isInteger(x[1]) && x[1] >= 0 && x[1] < table.length) return { v: x[0], src: table[x[1]] };
    return null;
  };
  const long = renamed(raw[1], LONG, figure) as Record<string, unknown>;
  const fees = Array.isArray(long.fees) ? long.fees.map((f) => (isObj(f) ? { ...f, id: newFeeId() } : f)) : long.fees;
  return readDeal({ ...long, id: newDealId(), fees });
}

/** A deal as the `d` of a link in the query, as the site wrote links before they moved to the fragment: its text, base64url. */
export const encodeDeal = (deal: FeeDeal): string => bytesToBase64Url(new TextEncoder().encode(dealText(deal)));

/** A deal from the `d` of a link in the query (`encodeDeal`); null where `d` is not a deal the site wrote. */
export function decodeDeal(d: string): FeeDeal | null {
  if (d.length === 0 || d.length > QUERY_MAX || !/^[A-Za-z0-9_-]+$/.test(d)) return null;
  try {
    return dealOfText(utf8(base64UrlToBytes(d)));
  } catch {
    return null;
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

/** A deal as the `d` of its link in the fragment: its text, compressed (deflate-raw), base64url. */
export async function packDeal(deal: FeeDeal): Promise<string> {
  const packed = await through(new TextEncoder().encode(dealText(deal)), new CompressionStream("deflate-raw"));
  return bytesToBase64Url(packed!);
}

/** A deal from the `d` of a link in the fragment (`packDeal`); null where `d` is not a deal the site wrote. */
export async function unpackDeal(d: string): Promise<FeeDeal | null> {
  if (d.length === 0 || d.length > PACKED_MAX || !/^[A-Za-z0-9_-]+$/.test(d)) return null;
  let bytes: Uint8Array;
  try {
    bytes = base64UrlToBytes(d);
  } catch {
    return null;
  }
  const text = await through(bytes, new DecompressionStream("deflate-raw"), TEXT_MAX);
  if (!text) return null;
  try {
    return dealOfText(utf8(text));
  } catch {
    return null;
  }
}

/** The address of a deal: the fee page with the deal in the fragment's `d` (site-paths.ts). */
export const encodedDealPath = async (deal: FeeDeal): Promise<string> => dealPagePath({ deal: await packDeal(deal) });

/**
 * The deal the address opens (`search` its query, `hash` its fragment): a deal in the fragment's `d`, or in the query's `d` as the site wrote
 * links before; a new deal of the kind `wrapper` names, where it names a kind of the data; a new deal filled from the track `track` names.
 * `given` says the address gave that deal; where `d` is broken or the kind or the track is unknown, an empty deal opens and `given` is
 * false, so the page keeps nothing of it. Null where the address names none of them, and the page opens what the device holds.
 */
export async function dealOfAddress(search: string, hash: string, data: Pick<FeesData, "kinds" | "houses" | "tracks" | "templates">, today: string): Promise<{ deal: FeeDeal; given: boolean } | null> {
  const opened = (deal: FeeDeal | null) => (deal ? { deal, given: true } : { deal: newDeal(null), given: false });
  const packed = new URLSearchParams(hash.replace(/^#/, "")).get("d");
  if (packed !== null) return opened(await unpackDeal(packed));
  const d = new URLSearchParams(search).get("d");
  if (d !== null) return opened(decodeDeal(d));
  const subject = parseSubject(search);
  if (!subject) return null;
  if (subject.kind === "wrapper") return opened(isProductId(subject.wrapperId) && data.kinds.some((k) => k.id === subject.wrapperId) ? newDeal(subject.wrapperId) : null);
  return opened(dealFromTrack(subject.trackId, data, today));
}
