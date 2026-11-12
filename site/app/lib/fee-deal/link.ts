// The fee page's address: `/deal?d=…` carries a whole deal, encoded compactly; `/deal?wrapper=<id>` opens a new deal of that kind and
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

/** The version the link's payload starts with: a link of another version opens an empty deal. */
const LINK_VERSION = 1;
/** No link is longer than this: a longer `d` is not one the site wrote. */
const LINK_MAX = 12_000;

/** Each field's short name in a link, both ways; a key not named here is not carried, and is dropped on the way in. */
const SHORT: Record<string, string> = {
  name: "n", kind: "k", start: "t", provider: "p", held: "h", fees: "f", template: "T", stages: "s", sale: "S", price: "P", until: "u", form: "F",
  rate: "r", min: "m", max: "x", currency: "c", per: "q", every: "e", amount: "a", place: "l", payout: "o", id: "i",
  url: "U", title: "Ti", publisher: "Pu", strength: "St", checked: "Ch", effectiveFrom: "Ef", effectiveTo: "Et", ruleIds: "Ri", own: "Ow", feesKept: "Fk",
};
const LONG: Record<string, string> = Object.fromEntries(Object.entries(SHORT).map(([k, v]) => [v, k]));
/** The fields of a price that hold a figure (`Num`): a link writes a figure as its number, or `[number, source]` where it is sourced. */
const FIGURES = new Set(["rate", "min", "max", "amount"]);

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
    out[to] = FIGURES.has(long) ? figure(long, x) : renamed(x, names, figure);
  }
  return out;
}

const toBase64Url = (text: string): string => {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (s: string): string => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

/**
 * A deal as the `d` of its link: its fields under short names, each figure as its number (or its number and the index of its source in a
 * table, where a template filled it), base64url. The deal's id, its fees' ids and when it was saved are left out: a link opens a new deal.
 */
export function encodeDeal(deal: FeeDeal): string {
  const sources: Sourced[] = [];
  const keyOf = (s: Sourced) => JSON.stringify(s);
  const { id: _id, saved: _saved, ...rest } = deal;
  const body = { ...rest, fees: deal.fees.map(({ id: _f, ...f }) => f) };
  const figure = (_k: string, x: unknown): Json => {
    const n = x as { v: number; src?: Sourced };
    if (!n.src) return n.v;
    let at = sources.findIndex((s) => keyOf(s) === keyOf(n.src!));
    if (at < 0) at = sources.push(n.src) - 1;
    return [n.v, at];
  };
  const short = renamed(body, SHORT, figure);
  const table = sources.map((s) => renamed(s, SHORT, (_k, x) => x));
  return toBase64Url(JSON.stringify([LINK_VERSION, short, table]));
}

/** A deal from the `d` of a link, every field checked, with new ids; null where `d` is not a deal the site wrote. */
export function decodeDeal(d: string): FeeDeal | null {
  if (d.length === 0 || d.length > LINK_MAX || !/^[A-Za-z0-9_-]+$/.test(d)) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(fromBase64Url(d));
  } catch {
    return null;
  }
  if (!Array.isArray(raw) || raw.length !== 3 || raw[0] !== LINK_VERSION || !isObj(raw[1]) || !Array.isArray(raw[2])) return null;
  const table = raw[2].map((s) => renamed(s, LONG, (_k, x) => x));
  const figure = (_k: string, x: unknown): unknown => {
    if (typeof x === "number") return { v: x };
    if (Array.isArray(x) && x.length === 2 && typeof x[0] === "number" && Number.isInteger(x[1]) && x[1] >= 0 && x[1] < table.length) return { v: x[0], src: table[x[1]] };
    return null;
  };
  const long = renamed(raw[1], LONG, figure) as Record<string, unknown>;
  const fees = Array.isArray(long.fees) ? long.fees.map((f) => (isObj(f) ? { ...f, id: newFeeId() } : f)) : long.fees;
  return readDeal({ ...long, id: newDealId(), fees });
}

/** The address of a deal: the fee page with the deal in `d` (site-paths.ts). */
export const encodedDealPath = (deal: FeeDeal): string => dealPagePath({ deal: encodeDeal(deal) });

/**
 * The deal the address opens: a deal in `d`; a new deal of the kind `wrapper` names, where it names a kind of the data; a new deal filled
 * from the track `track` names. `given` says the address gave that deal; where `d` is broken or the kind or the track is unknown, an empty
 * deal opens and `given` is false, so the page keeps nothing of it. Null where the address names none of them, and the page opens what
 * the device holds.
 */
export function dealOfAddress(search: string, data: Pick<FeesData, "kinds" | "houses" | "tracks" | "templates">, today: string): { deal: FeeDeal; given: boolean } | null {
  const q = new URLSearchParams(search);
  const d = q.get("d");
  const opened = (deal: FeeDeal | null) => (deal ? { deal, given: true } : { deal: newDeal(null), given: false });
  if (d !== null) return opened(decodeDeal(d));
  const subject = parseSubject(search);
  if (!subject) return null;
  if (subject.kind === "wrapper") return opened(isProductId(subject.wrapperId) && data.kinds.some((k) => k.id === subject.wrapperId) ? newDeal(subject.wrapperId) : null);
  return opened(dealFromTrack(subject.trackId, data, today));
}
