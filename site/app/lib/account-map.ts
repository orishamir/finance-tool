// The account map (F-131): for one fund and the plan's years, return and inflation, which account leaves the most at each mix of today's
// amount and monthly deposit, and where that changes. What an account leaves is the figure the account list ranks by (`WayPrice.valueN`,
// F-65 on F-63), handed in as `LeftAt`, so the map and the list never disagree; this module only decides where to ask and draws nothing.
//
// It asks as little as it can, since every point is a run per account. All the accounts are priced on a coarse grid and along the plan's own
// row and column; only those first or second somewhere there are priced after that. A coarse cell whose corners have different winners is
// split in four, down to a smallest cell, and on each side of a smallest cell where the winner changes, the point where the two accounts
// leave the same is found by regula falsi on the difference of their figures. The borders are drawn through those points, so a border is
// where the two figures are equal, not where a grid happened to step: a straight border stays straight and a real corner (a per-trade
// minimum, a tier in a price list) stays where it is, since every point on it is a root of the difference.
//
// No monthly deposit at all is one value, not a range: the map's areas start just above it, and the line along its bottom edge (`edge`) is
// priced at 0 ₪ a month exactly. At 0 ₪ today and 0 ₪ a month every account leaves 0 and there is no winner; the edge line takes the
// winner just above 0 ₪ from its start.

/** A point of the map: today's amount, and the monthly deposit, in shekels. */
type MapPoint = readonly [amount: number, monthly: number];

/** What each account leaves at a point, as the account list ranks them (accounts the list does not rank are absent); `houses` limits the
 *  pricing to those accounts, null for all of them. */
export type LeftAt = (amount: number, monthly: number, houses: readonly string[] | null) => ReadonlyMap<string, number>;

/** Where the winner changes along one of the plan's own lines: from the plan's winner to `to`, at `at` shekels (today's amount, or a month). */
export interface MapSwitch {
  at: number;
  /** Up: at more than the plan's own value; down: at less. */
  dir: "up" | "down";
  to: string;
}

/** A polygon of the map that one account wins, in map points, counter-clockwise. */
interface MapTile {
  id: string;
  poly: MapPoint[];
}

/** A border between two accounts' areas: map points where the two leave the same, in order. */
interface MapBorder {
  a: string;
  b: string;
  points: MapPoint[];
}

/** A stretch of the bottom edge (no monthly deposit) that one account wins, from `from` to `to` shekels today. */
interface EdgeStretch {
  id: string;
  from: number;
  to: number;
}

export interface AccountMap {
  /** The map runs from 0 to `amount` today and from 0 to `monthly` a month. */
  max: { amount: number; monthly: number };
  plan: { amount: number; monthly: number; winner: string };
  /** The accounts that win somewhere on the map (the areas and the edge): the plan's winner first, then by the area each wins, largest first. */
  winners: string[];
  tiles: MapTile[];
  borders: MapBorder[];
  edge: EdgeStretch[];
  /** The change of winner from the plan along today's amount (the monthly deposit held), and along the monthly deposit: the nearest above
   *  the plan, else the nearest below it. */
  switches: { amount: MapSwitch | null; monthly: MapSwitch | null };
}

/** The coarse grid's cells along each axis, and how many times a cell with a change of winner inside is split in four. */
const COARSE = 6;
const DEPTH = 3;
/** Samples along each of the plan's own lines when looking for its switches, and along the bottom edge. */
const LINE_SAMPLES = 24;
const EDGE_SAMPLES = 48;
/** The map's areas start this share of the monthly range above 0: what is under it is the bottom edge's (no deposit). */
const ABOVE_EDGE = 0.01;
/** A root of the difference of two accounts' figures is taken as found within this many shekels, or within this share of its side. */
const ROOT_NIS = 0.05;
const ROOT_SHARE = 1 / 4096;
const ROOT_STEPS = 12;
/** The axis's end is past the plan and its farthest switch by this factor, rounded up to a clean value. */
const ROOM = 1.5;

/** The winner among `left`: the most left, a tie (within a thousandth of a shekel) to the account earlier in `order`, as the list breaks it. */
function winnerOf(left: ReadonlyMap<string, number>, order: readonly string[]): string | null {
  let best: string | null = null;
  let bestV = -Infinity;
  for (const id of order) {
    const v = left.get(id);
    if (v === undefined) continue;
    if (v > bestV + 1e-3) {
      best = id;
      bestV = v;
    }
  }
  return best;
}

/** The first two accounts at a point, in the list's order. */
function firstTwo(left: ReadonlyMap<string, number>, order: readonly string[]): string[] {
  const v = (id: string) => left.get(id) ?? -Infinity;
  return order.filter((id) => left.has(id)).sort((a, b) => v(b) - v(a) || order.indexOf(a) - order.indexOf(b)).slice(0, 2);
}

/** A clean value at or above `v`: 1, 1.5, 2, 2.5, 3, 4, 5, 6 or 8 times a power of ten. */
export function cleanUp(v: number): number {
  if (v <= 0) return 0;
  const p = 10 ** Math.floor(Math.log10(v));
  for (const k of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (k * p >= v - 1e-9 * p) return k * p;
  return 10 * p;
}

/**
 * Where `a` and `b` leave the same between `p0` (where `a` wins) and `p1` (where `b` does): regula falsi with the Illinois step on the
 * difference of their figures, which keeps the root between its two ends, so a difference that jumps (a tier) still ends at the jump.
 */
function rootBetween(leftAt: LeftAt, a: string, b: string, p0: MapPoint, p1: MapPoint, ends?: readonly [ReadonlyMap<string, number>, ReadonlyMap<string, number>]): MapPoint {
  const g = (t: number) => {
    const m = leftAt(p0[0] + t * (p1[0] - p0[0]), p0[1] + t * (p1[1] - p0[1]), [a, b]);
    return (m.get(a) ?? -Infinity) - (m.get(b) ?? -Infinity);
  };
  let t0 = 0;
  let t1 = 1;
  const at = (m: ReadonlyMap<string, number>) => (m.get(a) ?? -Infinity) - (m.get(b) ?? -Infinity);
  // what the two leave at the ends, where the caller has already priced them
  let g0 = ends ? at(ends[0]) : g(0);
  let g1 = ends ? at(ends[1]) : g(1);
  let side = 0;
  let t = 0.5;
  for (let i = 0; i < ROOT_STEPS; i++) {
    t = Number.isFinite(g0) && Number.isFinite(g1) && g0 !== g1 ? (t0 * g1 - t1 * g0) / (g1 - g0) : (t0 + t1) / 2;
    if (!(t > t0 && t < t1)) t = (t0 + t1) / 2;
    const gt = g(t);
    if (Math.abs(gt) < ROOT_NIS || t1 - t0 < ROOT_SHARE) break;
    if (gt > 0) {
      t0 = t;
      g0 = gt;
      if (side === 1) g1 /= 2;
      side = 1;
    } else {
      t1 = t;
      g1 = gt;
      if (side === -1) g0 /= 2;
      side = -1;
    }
  }
  return [p0[0] + t * (p1[0] - p0[0]), p0[1] + t * (p1[1] - p0[1])];
}

/**
 * The change of winner from the plan along one of its lines: samples from the plan up to `reach` (denser near 0), the first whose winner is
 * not the plan's, and the point between it and the sample before where the two leave the same; where none comes up, the same down to `low`.
 */
function switchAlong(leftAt: LeftAt, order: readonly string[], plan: MapPoint, winner: string, axis: 0 | 1, low: number, reach: number): MapSwitch | null {
  const at = (v: number): MapPoint => (axis === 0 ? [v, plan[1]] : [plan[0], v]);
  const own = plan[axis];
  const samples = Array.from({ length: LINE_SAMPLES }, (_, k) => low + (reach - low) * ((k + 1) / LINE_SAMPLES) ** 2);
  const find = (vs: number[], dir: MapSwitch["dir"]): MapSwitch | null => {
    let prev = own;
    for (const v of vs) {
      const w = winnerOf(leftAt(...at(v), null), order);
      if (w && w !== winner) return { at: rootBetween(leftAt, winner, w, at(prev), at(v))[axis], dir, to: w };
      prev = v;
    }
    return null;
  };
  // a switch up is the one the map points at where there is one: toward 0 a few shekels can change the winner (a month's deposit under a
  // minimum fee), which is no reason to name it over a switch at a real amount
  return find(samples.filter((v) => v > own), "up") ?? (own > low ? find([...samples.filter((v) => v < own).reverse(), low], "down") : null);
}

/**
 * The map for the plan (F-131). `order` is every account the list ranks, in its order for a tie; `reach` the farthest today's amount and
 * monthly deposit a switch is looked for (the plan's sliders' ends, or the plan's own values where they are past them). Null where no account
 * is ranked at the plan.
 */
export function accountMap({ leftAt, order, plan, reach }: { leftAt: LeftAt; order: readonly string[]; plan: { amount: number; monthly: number }; reach: { amount: number; monthly: number } }): AccountMap | null {
  const planPt: MapPoint = [plan.amount, plan.monthly];
  const winner = winnerOf(leftAt(plan.amount, plan.monthly, null), order);
  if (!winner) return null;
  const reachA = Math.max(reach.amount, plan.amount * 2);
  const reachM = Math.max(reach.monthly, plan.monthly * 2);
  // the monthly line starts just above no deposit at all, which is the bottom edge's
  const lowM = (reachM * ABOVE_EDGE) / 10;
  const switches = {
    amount: switchAlong(leftAt, order, planPt, winner, 0, 0, reachA),
    monthly: plan.monthly > 0 ? switchAlong(leftAt, order, planPt, winner, 1, lowM, reachM) : null,
  };
  // the axes: past the plan and its switches with room, at a clean value, and at least a tenth of the sliders' reach
  const maxA = Math.min(cleanUp(Math.max(ROOM * Math.max(plan.amount, switches.amount?.at ?? 0), reach.amount / 10)), cleanUp(reachA));
  const maxM = Math.min(cleanUp(Math.max(ROOM * Math.max(plan.monthly, switches.monthly?.at ?? 0), reach.monthly / 10)), cleanUp(reachM));
  const bottom = maxM * ABOVE_EDGE;

  // ------------------------------------------------ the coarse grid, every account: who can win
  const n = COARSE * 2 ** DEPTH;
  const xOf = (i: number) => (maxA * i) / n;
  const yOf = (j: number) => bottom + ((maxM - bottom) * j) / n;
  const known = new Map<number, { left: ReadonlyMap<string, number>; w: string | null }>();
  const key = (i: number, j: number) => i * (n + 1) + j;
  const can = new Set<string>([winner]);
  for (const s of [switches.amount, switches.monthly]) if (s) can.add(s.to);
  const step = 2 ** DEPTH;
  for (let i = 0; i <= n; i += step)
    for (let j = 0; j <= n; j += step) {
      const left = leftAt(xOf(i), yOf(j), null);
      known.set(key(i, j), { left, w: winnerOf(left, order) });
      for (const id of firstTwo(left, order)) can.add(id);
    }
  const candidates = order.filter((id) => can.has(id));
  const pricedAt = (i: number, j: number) => {
    const k = key(i, j);
    let got = known.get(k);
    if (!got) {
      const left = leftAt(xOf(i), yOf(j), candidates);
      got = { left, w: winnerOf(left, order) };
      known.set(k, got);
    }
    return got;
  };
  const winAt = (i: number, j: number): string | null => pricedAt(i, j).w;

  // ------------------------------------------------ the cells, split where the winner changes inside
  const tiles: MapTile[] = [];
  const segments: { a: string; b: string; p: string; q: string }[] = [];
  const points = new Map<string, MapPoint>();
  const crossing = (i0: number, j0: number, i1: number, j1: number, a: string, b: string): string => {
    const k = `${Math.min(i0, i1)},${Math.min(j0, j1)},${Math.max(i0, i1)},${Math.max(j0, j1)}`;
    if (!points.has(k)) points.set(k, rootBetween(leftAt, a, b, [xOf(i0), yOf(j0)], [xOf(i1), yOf(j1)], [pricedAt(i0, j0).left, pricedAt(i1, j1).left]));
    return k;
  };
  const at = (k: string): MapPoint[] => {
    const p = points.get(k);
    return p ? [p] : [];
  };
  const leaf = (i: number, j: number, s: number) => {
    // the corners counter-clockwise from the bottom left, each with its winner
    const corners = ([[i, j], [i + s, j], [i + s, j + s], [i, j + s]] as const).map(([ci, cj]) => ({ ci, cj, k: `${ci},${cj}`, w: winAt(ci, cj) }));
    const known = corners.flatMap((c) => (c.w === null ? [] : [{ ...c, w: c.w }]));
    if (known.length < 4) return;
    for (const c of known) points.set(c.k, [xOf(c.ci), yOf(c.cj)]);
    const first = known[0]?.w ?? "";
    if (known.every((c) => c.w === first)) {
      tiles.push({ id: first, poly: known.flatMap((c) => at(c.k)) });
      return;
    }
    // the cell's outline with the crossings on its sides; with more than two crossings, the borders meet at the cell's middle
    type Cross = { cross: string; a: string; b: string };
    const walk: ({ corner: string; k: string } | Cross)[] = [];
    known.forEach((c, n) => {
      const d = known[(n + 1) % 4] ?? c;
      walk.push({ corner: c.w, k: c.k });
      if (c.w !== d.w) walk.push({ cross: crossing(c.ci, c.cj, d.ci, d.cj, c.w, d.w), a: c.w, b: d.w });
    });
    const crosses = walk.filter((x): x is Cross => "cross" in x);
    const mid = `m${i},${j},${s}`;
    if (crosses.length > 2) points.set(mid, [xOf(i + s / 2), yOf(j + s / 2)]);
    // each run of corners one account wins, from one crossing to the next, is a polygon of that account's (closed through the middle
    // where more than two borders meet in the cell)
    const start = walk.findIndex((x) => "cross" in x);
    const turned = [...walk.slice(start), ...walk.slice(0, start)];
    let ring: string[] = [];
    let owner = "";
    for (const x of [...turned, ...turned.slice(0, 1)]) {
      if ("corner" in x) {
        owner = x.corner;
        ring.push(x.k);
        continue;
      }
      if (ring.length > 0) {
        ring.push(x.cross);
        if (crosses.length > 2) ring.push(mid);
        tiles.push({ id: owner, poly: ring.flatMap(at) });
      }
      ring = [x.cross];
    }
    const [c0, c1] = crosses;
    if (crosses.length === 2 && c0 && c1) segments.push({ a: c0.a, b: c0.b, p: c0.cross, q: c1.cross });
    else for (const c of crosses) segments.push({ a: c.a, b: c.b, p: c.cross, q: mid });
  };
  const cell = (i: number, j: number, s: number) => {
    const ws = [winAt(i, j), winAt(i + s, j), winAt(i + s, j + s), winAt(i, j + s)];
    if (s > 1 && ws.some((w) => w !== ws[0])) {
      const h = s / 2;
      for (const [di, dj] of [[0, 0], [h, 0], [h, h], [0, h]] as const) cell(i + di, j + dj, h);
      return;
    }
    leaf(i, j, s);
  };
  for (let i = 0; i < n; i += step) for (let j = 0; j < n; j += step) cell(i, j, step);

  // ------------------------------------------------ the bottom edge: no monthly deposit at all
  const edge: EdgeStretch[] = [];
  const edgeCan = new Set(candidates);
  const edgeAt = (a: number, houses: readonly string[] | null) => winnerOf(leftAt(a, 0, houses), order);
  for (let k = 1; k <= COARSE * 2; k++) {
    const left = leftAt((maxA * k) / (COARSE * 2), 0, null);
    for (const id of firstTwo(left, order)) edgeCan.add(id);
  }
  const edgeHouses = order.filter((id) => edgeCan.has(id));
  // the first sample just above 0 ₪: at 0 itself every account leaves 0, and the line takes this winner from its start
  const xs = [maxA * ROOT_SHARE, ...Array.from({ length: EDGE_SAMPLES }, (_, k) => (maxA * (k + 1)) / EDGE_SAMPLES)];
  let from = 0;
  let prevX = maxA * ROOT_SHARE;
  let cur = edgeAt(prevX, edgeHouses);
  for (const x of xs.slice(1)) {
    const w = edgeAt(x, edgeHouses);
    if (w !== cur && cur && w) {
      const at = rootBetween(leftAt, cur, w, [prevX, 0], [x, 0])[0];
      edge.push({ id: cur, from, to: at });
      from = at;
    }
    if (w) cur = w;
    prevX = x;
  }
  if (cur) edge.push({ id: cur, from, to: maxA });

  // ------------------------------------------------ the borders, chained from their segments
  const borders = chain(segments, points);
  const area = new Map<string, number>();
  for (const t of tiles) area.set(t.id, (area.get(t.id) ?? 0) + Math.abs(shoelace(t.poly)));
  for (const e of edge) if (!area.has(e.id)) area.set(e.id, 0);
  const size = (id: string) => area.get(id) ?? 0;
  const winners = [...area.keys()].sort((a, b) => Number(b === winner) - Number(a === winner) || size(b) - size(a) || order.indexOf(a) - order.indexOf(b));
  return { max: { amount: maxA, monthly: maxM }, plan: { ...plan, winner }, winners, tiles, borders, edge, switches };
}

/** Twice a polygon's signed area. */
function shoelace(poly: readonly MapPoint[]): number {
  let s = 0;
  for (const [k, p] of poly.entries()) {
    const q = poly[(k + 1) % poly.length] ?? p;
    s += p[0] * q[1] - q[0] * p[1];
  }
  return s / 2;
}

/** Joins segments that share an end into lines, one per pair of accounts; a point where three or more meet ends the lines through it. */
function chain(segments: readonly { a: string; b: string; p: string; q: string }[], points: ReadonlyMap<string, MapPoint>): MapBorder[] {
  const out: MapBorder[] = [];
  const byPair = new Map<string, { a: string; b: string; segs: { p: string; q: string }[] }>();
  for (const s of segments) {
    const [a, b] = s.a < s.b ? [s.a, s.b] : [s.b, s.a];
    const got = byPair.get(`${a}|${b}`) ?? { a, b, segs: [] };
    got.segs.push({ p: s.p, q: s.q });
    byPair.set(`${a}|${b}`, got);
  }
  const pointsOf = (keys: string[]) => keys.flatMap((k) => {
    const p = points.get(k);
    return p ? [p] : [];
  });
  for (const { a, b, segs } of byPair.values()) {
    const at = new Map<string, number[]>();
    segs.forEach((s, k) => {
      at.set(s.p, [...(at.get(s.p) ?? []), k]);
      at.set(s.q, [...(at.get(s.q) ?? []), k]);
    });
    const used = new Set<number>();
    const walkFrom = (start: string, first: number): string[] => {
      const line = [start];
      let here = start;
      let k: number | undefined = first;
      while (k !== undefined && !used.has(k)) {
        const s = segs[k];
        if (!s) break;
        used.add(k);
        here = s.p === here ? s.q : s.p;
        line.push(here);
        const next = at.get(here) ?? [];
        k = next.length === 2 ? next.find((x) => !used.has(x)) : undefined;
      }
      return line;
    };
    // open lines first, from an end (or a meeting point), then the closed ones
    for (const [pt, ks] of at) if (ks.length !== 2) for (const k of ks) if (!used.has(k)) out.push({ a, b, points: pointsOf(walkFrom(pt, k)) });
    segs.forEach((s, k) => {
      if (!used.has(k)) out.push({ a, b, points: pointsOf(walkFrom(s.p, k)) });
    });
  }
  return out;
}
