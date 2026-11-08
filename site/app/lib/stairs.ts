// The stairs on the indices page (founder, 2026-11-01, drawing A of 8dd1f013:research/specs/2026-11-01-indices-general/stairs.html): start from one
// account and one fund, see which single change leaves more at the end, take it, and see what the next single change adds.
// This module is the selection logic only: rows, climb, ceiling, scale. It reads a grid of account x fund prices (the page's
// `buildInvest` output, `gridOf`) and writes no figure of its own beyond differences between two of them (F-91: the gap in what is
// left between two ways on one plan is the gap in their costs). No I/O, no React.
import { isGroupProvider } from "./group-pick";
import type { FeesSnapshot } from "@finance-tool/schema";
import { doubtOf, leftEmpty, type InvestView, type OptionId } from "./invest";

export type Lane = "account" | "kind" | "fund";
export const LANES: readonly Lane[] = ["account", "kind", "fund"];

export interface Pos {
  /** The account (house) id. */
  a: string;
  /** The fund record id. */
  f: string;
}

/** Why a pair has no price: not sold there (a sourced fact), no price in the data, or the documents leave it open (`doubtOf`). */
export type Why = "u" | "n" | "d";

export interface StairFund {
  id: string;
  /** The kind of fund (an `OptionId` on the page): the "another kind" lane changes it. */
  kind: string;
  hedged: boolean;
}

export interface Grid {
  accounts: readonly string[];
  funds: readonly StairFund[];
  /** The kinds in the order the lane lists them. */
  kinds: readonly string[];
  /** Real value left at the horizon (F-65) and whether it rests on an open rule; null when the pair has no price. */
  cell(a: string, f: string): { v: number; open: boolean } | null;
  why(a: string, f: string): Why;
}

/** The grid of the page's view: every account that is a row of it, every fund of an option that exists for the index. */
export function gridOf(view: InvestView, snapshots: readonly FeesSnapshot[]): Grid {
  const options = view.options.filter((o) => o.exists);
  const funds: StairFund[] = [];
  const optionOf = new Map<string, OptionId>();
  for (const o of options) for (const f of o.funds) if (!optionOf.has(f.rec.id)) { funds.push({ id: f.rec.id, kind: o.id, hedged: f.rec.hedged === true }); optionOf.set(f.rec.id, o.id); }
  const byFund = new Map(options.flatMap((o) => o.funds).map((f) => [f.rec.id, f] as const));
  const snap = new Map(snapshots.map((s) => [s.id, s] as const));
  return {
    // a picked group's held account is not a house to climb to (D43)
    accounts: view.providers.filter((p) => !isGroupProvider(p)).map((p) => p.id),
    funds,
    kinds: options.filter((o) => o.funds.length > 0).map((o) => o.id),
    cell(a, f) {
      const at = byFund.get(f)?.byHouse[a];
      return at && "valueN" in at ? { v: at.valueN, open: at.open } : null;
    },
    why(a, f) {
      const w = byFund.get(f);
      const at = w?.byHouse[a];
      if (at && "availability" in at && at.availability) return "u";
      // a conversion the person left empty is a price not known, not a doubt of the documents
      const s = snap.get(a), o = optionOf.get(f)!;
      return w && doubtOf(s, o) && !leftEmpty(s, o) ? "d" : "n";
    },
  };
}

// ---------------------------------------------------------------- one position

const fundOf = (g: Grid, id: string): StairFund => g.funds.find((x) => x.id === id)!;
const val = (g: Grid, p: Pos): number | null => g.cell(p.a, p.f)?.v ?? null;
const openAt = (g: Grid, p: Pos): boolean => g.cell(p.a, p.f)?.open ?? false;
const fundsOfKind = (g: Grid, kind: string): StairFund[] => g.funds.filter((x) => x.kind === kind);

export interface Row {
  lane: Lane;
  to: Pos;
  /** Stable across plans: the lane and what changes. */
  key: string;
  /** For the kind lane, the kind it changes to. */
  kind: string | null;
  v: number | null;
  /** The value left at `to` less the value left at the current position, each in whole shekels as shown, so the figures on the page add up; null when either has no price. */
  d: number | null;
  open: boolean;
  hedged: boolean;
  why: Why | null;
}

/** Every single change from one holding: another account, another kind of fund, another fund of the same kind. */
const rowOf = (g: Grid, cur: number | null, lane: Lane, to: Pos, key: string, kind: string | null): Row => {
  const v = val(g, to);
  return { lane, to, key: `${lane}|${key}`, kind, v, d: v == null || cur == null ? null : Math.round(v) - Math.round(cur), open: openAt(g, to), hedged: fundOf(g, to.f).hedged, why: v == null ? g.why(to.a, to.f) : null };
};
/** The kind lane's row for kind `k` at account `a`: the kind's fund that leaves the most there; a currency-hedged fund is another holding, so it does not stand for the kind. */
const kindRow = (g: Grid, cur: number | null, a: string, k: string): Row | null => {
  const cand = fundsOfKind(g, k).filter((x) => !x.hedged);
  if (!cand.length) return null;
  const priced = cand.filter((x) => val(g, { a, f: x.id }) != null).sort((x, y) => val(g, { a, f: y.id })! - val(g, { a, f: x.id })!);
  return rowOf(g, cur, "kind", { a, f: (priced[0] ?? cand[0]!).id }, k, k);
};

export function rowsAt(g: Grid, pos: Pos): Row[] {
  const cur = val(g, pos);
  const out: Row[] = [];
  for (const a of g.accounts) if (a !== pos.a) out.push(rowOf(g, cur, "account", { a, f: pos.f }, a, null));
  const here = fundOf(g, pos.f).kind;
  for (const k of g.kinds) {
    if (k === here) continue;
    const r = kindRow(g, cur, pos.a, k);
    if (r) out.push(r);
  }
  for (const x of fundsOfKind(g, here)) if (x.id !== pos.f) out.push(rowOf(g, cur, "fund", { a: pos.a, f: x.id }, x.id, null));
  return out;
}

/**
 * Every list a lane can show on this grid, each one row longer than any start can show (the start's own row is among them), told apart
 * by what sets a row's height (priced or why not, open, hedged, the kind's fund) and kept once: what each lane's held height is measured
 * from, so a pick or a step moves nothing below a lane (on a phone the lanes stand one under another, and a fund bought abroad
 * after one bought here grew the account lane by 357 px). The figures are any priced start's; only their presence counts.
 */
export function laneCases(g: Grid): Record<Lane, Row[][]> {
  const seen: Record<Lane, Map<string, Row[]>> = { account: new Map(), kind: new Map(), fund: new Map() };
  const add = (lane: Lane, rows: Row[]) => {
    if (!rows.length) return;
    const sig = rows.map((r) => `${r.key}:${r.d == null ? r.why : "p"}:${r.open ? 1 : 0}:${r.hedged ? 1 : 0}:${r.lane === "kind" ? r.to.f : ""}`).join(",");
    if (!seen[lane].has(sig)) seen[lane].set(sig, rows);
  };
  const anyAt = (pick: (a: string) => number | null) => {
    for (const a of g.accounts) {
      const v = pick(a);
      if (v != null) return v;
    }
    return null;
  };
  for (const f of g.funds) {
    const cur = anyAt((a) => val(g, { a, f: f.id }));
    if (cur != null) add("account", g.accounts.map((a) => rowOf(g, cur, "account", { a, f: f.id }, a, null)));
  }
  for (const a of g.accounts) {
    const cur = g.funds.map((f) => val(g, { a, f: f.id })).find((v) => v != null) ?? null;
    if (cur == null) continue;
    add("kind", g.kinds.map((k) => kindRow(g, cur, a, k)).filter((r): r is Row => r != null));
    for (const k of g.kinds) add("fund", fundsOfKind(g, k).map((x) => rowOf(g, cur, "fund", { a, f: x.id }, x.id, null)));
  }
  return { account: [...seen.account.values()], kind: [...seen.kind.values()], fund: [...seen.fund.values()] };
}

/** The larger gain first; a row with no figure last. */
export const byGain = (x: Row, y: Row): number => (y.d ?? -Infinity) - (x.d ?? -Infinity);
/** A row ranks when it has a figure, rests on no open rule and is not a currency-hedged holding (hedging is a label, not a filter, D28). */
export const ranks = (r: Row): boolean => r.d != null && !r.open && !r.hedged;

export interface Top {
  v: number;
  pos: Pos;
}

function topOf(g: Grid, wantOpen: boolean): Top | null {
  let top: Top | null = null;
  for (const f of g.funds) {
    if (f.hedged) continue;
    for (const a of g.accounts) {
      const c = g.cell(a, f.id);
      if (!c || c.open !== wantOpen) continue;
      if (!top || c.v > top.v) top = { v: c.v, pos: { a, f: f.id } };
    }
  }
  return top;
}
/** The most left over every priced pair that ranks. */
export const ceilingOf = (g: Grid): Top | null => topOf(g, false);
/** The most left over pairs on an open rule: shown beside the ceiling, never counted in it. */
export const openTopOf = (g: Grid): Top | null => topOf(g, true);

/** The largest single gain each time, from `from`, until none is left (at most six). */
export function climbFrom(g: Grid, from: Pos, limit = 6): Row[] {
  const path: Row[] = [];
  let at = from;
  for (let i = 0; i < limit; i++) {
    const best = rowsAt(g, at).filter((r) => ranks(r) && r.d! > 0).sort(byGain)[0];
    if (!best) break;
    path.push(best);
    at = best.to;
  }
  return path;
}

// ---------------------------------------------------------------- the chain

export interface Taken {
  lane: Lane;
  to: Pos;
}
export interface StairsState {
  start: Pos;
  taken: Taken[];
}
export interface Stair {
  pos: Pos;
  /** What changed to get here; null for the start. */
  lane: Lane | null;
  /** Taken by the person (the start counts as taken). */
  taken: boolean;
  v: number;
  /** The value left here less the stair before; null for the start. */
  d: number | null;
  open: boolean;
}
export interface Chain {
  /** The start, what was taken, then the largest single gain left each time. */
  chain: Stair[];
  /** The index in `chain` of where the person is now. */
  here: number;
  at: Pos;
  ceiling: Top;
  /** The steps kept: a taken step whose pair the plan no longer prices ends the taken part. */
  taken: Taken[];
}

/** The chain on the grid, or null when the start has no price or nothing at all is priced. */
export function chainOf(g: Grid, s: StairsState): Chain | null {
  const ceiling = ceilingOf(g);
  const v0 = val(g, s.start);
  if (!ceiling || v0 == null) return null;
  const taken: Taken[] = [];
  for (const t of s.taken) {
    if (val(g, t.to) == null) break;
    taken.push(t);
  }
  const at = taken.length ? taken[taken.length - 1]!.to : s.start;
  const next = climbFrom(g, at);
  const items = [{ pos: s.start, lane: null as Lane | null, taken: true }, ...taken.map((t) => ({ pos: t.to, lane: t.lane as Lane | null, taken: true })), ...next.map((n) => ({ pos: n.to, lane: n.lane as Lane | null, taken: false }))];
  const chain = items.map((it, i): Stair => {
    const v = val(g, it.pos)!;
    return { ...it, v, d: i ? Math.round(v) - Math.round(val(g, items[i - 1]!.pos)!) : null, open: openAt(g, it.pos) };
  });
  return { chain, here: taken.length, at, ceiling, taken };
}

// ---------------------------------------------------------------- the scale

/** The levels the plot spans: from a little under the lowest that matters, rounded down, to the highest. The low end ignores the lowest 5% of
 *  the priced pairs. */
export function yScale(g: Grid, chain: readonly Stair[], ceiling: Top): { LO: number; HI: number } {
  const all: number[] = [];
  for (const f of g.funds) if (!f.hedged) for (const a of g.accounts) { const c = g.cell(a, f.id); if (c) all.push(c.v); }
  all.sort((x, y) => x - y);
  const lvl = chain.map((c) => c.v);
  const lo = Math.min(all[Math.floor(all.length * 0.05)] ?? Infinity, ...lvl);
  const hi = Math.max(ceiling.v, ...lvl);
  const raw = Math.max((hi - lo) / 4, 1);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((x) => x * mag).find((x) => x >= raw)!;
  const LO = Math.max(0, Math.floor((lo - (hi - lo) * 0.06) / step) * step);
  return { LO, HI: hi };
}

/**
 * One unit for every row on screen: the larger of the biggest gain and the second-largest loss among the rows that rank, so one far worse
 * choice does not flatten the rest (it is cut, with a mark, and its number says the full size). With no gain and fewer than two losses, the
 * largest loss. With nothing that ranks, the largest figure of any row with one.
 */
export function unitOf(rows: readonly Row[]): number {
  const ranked = rows.filter(ranks);
  const pool = ranked.length ? ranked : rows.filter((r) => r.d != null);
  const gains = pool.filter((r) => r.d! > 0).map((r) => r.d!).sort((x, y) => y - x);
  const losses = pool.filter((r) => r.d! < 0).map((r) => -r.d!).sort((x, y) => y - x);
  const u = Math.max(gains[0] ?? 0, losses[1] ?? (gains.length ? 0 : (losses[0] ?? 0)));
  return Math.max(1, u);
}

// ---------------------------------------------------------------- the start

/**
 * Where the stairs open with no pick: the middle exchange-traded fund and the middle account, over what is priced on the plan. The funds
 * of the first kind among exchange-traded Israeli funds, foreign funds on the exchange, then any kind that has an unhedged fund priced
 * somewhere, ordered by the middle of their values over the accounts that price them; the middle one is taken. The accounts that price
 * it (and rank) are ordered by value and the middle one is taken. Null when nothing is priced.
 */
export function middleStart(g: Grid, order: readonly string[] = ["il-etf", "tase-foreign", "il-tracking", "abroad"]): Pos | null {
  const median = (xs: number[]) => [...xs].sort((x, y) => x - y)[Math.floor((xs.length - 1) / 2)]!;
  const pricedBy = (f: StairFund) => g.accounts.flatMap((a) => { const c = g.cell(a, f.id); return c && !c.open ? [{ a, v: c.v }] : []; });
  for (const kind of order) {
    const funds = fundsOfKind(g, kind).filter((f) => !f.hedged && pricedBy(f).length > 0);
    if (!funds.length) continue;
    const sorted = funds.map((f) => ({ f, m: median(pricedBy(f).map((x) => x.v)) })).sort((x, y) => y.m - x.m || x.f.id.localeCompare(y.f.id));
    const fund = sorted[Math.floor((sorted.length - 1) / 2)]!.f;
    const accts = pricedBy(fund).sort((x, y) => y.v - x.v || x.a.localeCompare(y.a));
    return { a: accts[Math.floor((accts.length - 1) / 2)]!.a, f: fund.id };
  }
  return null;
}
