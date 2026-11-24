// The account map (F-131): for one fund and the plan's years, return and inflation, which account leaves the most at each mix of today's
// amount and monthly deposit, how far ahead of the next it is against the site's tie threshold θ (P-01), and where another account becomes
// clearly cheaper along the plan's own lines. What an account leaves is the figure the account list ranks the fund's pairs by
// (`WayPrice.valueN`, F-65 on F-63), handed in as `LeftAt`; the list itself ranks each account by its cheapest fund of the kind, so the map,
// which holds the pair's one fund, can name another account first than the list does. This module decides where to ask and draws nothing.
//
// Every point is a run per account, so it asks as little as it can. Every account is priced on a coarse grid, with a finer step in the
// lowest part of each axis, where a per-trade minimum (F-12) bends the figures most; only the accounts first or second there, or within a few
// θ of the first, are priced after that. A cell is split in four where its centre, priced, does not read as its corners say (another
// first, another second near the first, or another lead), and where its corners have different firsts, down to a smallest cell. Inside a
// cell each account's figure is taken as the even blend of its corners' (bilinear), and the leads on the drawn grid are read from those:
// near a border every account's figure is close to a plane, so the place where two are equal and the band where they are within θ come
// out where the figures put them, not where a grid happened to step.
//
// The axes are fitted to the plan: a few times its own values, past the nearest change up each of its lines. Every account is priced on
// the coarse grid, so every account clearly first somewhere within that range has an area on the map; one first only farther out does not.
//
// No monthly deposit at all is one value, not the bottom of a range: the map's areas start just above it, and the bottom edge (`edge`) is
// priced at 0 ₪ a month exactly, along today's amount alone. At 0 ₪ today and 0 ₪ a month every account leaves 0 and none leads: the edge
// starts at a thousandth of its axis, and a plan of nothing at all is a case of its own (`PlanLead`).
import { isTie, relativeGap } from "@finance-tool/engine";
import { rankByValue } from "./rank";

/** A point of the map: today's amount, and the monthly deposit, in shekels. */
type MapPoint = readonly [amount: number, monthly: number];

/** What each account leaves at a point, as the account list ranks them (accounts the list does not rank are absent); `houses` limits the
 *  pricing to those accounts, null for all of them. */
export type LeftAt = (amount: number, monthly: number, houses: readonly string[] | null) => ReadonlyMap<string, number>;

/** Where another account becomes clearly cheaper along one of the plan's own lines: at `at` shekels (today's amount, or a month), `to` being
 *  the account cheapest just past it. */
export interface MapSwitch {
  at: number;
  /** Up: at more than the plan's own value; down: at less. */
  dir: "up" | "down";
  to: string;
}

/** A stretch of one of the plan's lines where another account is clearly cheaper than the plan's, though not to the end of the search (so
 *  no switch): from `lo` to `hi` shekels (today's amount, or a month), `to` being the account clearly cheaper there. */
interface MapStretch {
  lo: number;
  hi: number;
  /** Up: at more than the plan's own value; down: at less. */
  dir: "up" | "down";
  to: string;
  /** The switch past it the same way along the line, by this account or another, where the line has one: the words name it after the
   *  stretch. Only the first stretch is named, and this switch; a second stretch after the first, with no switch, is not. */
  then?: MapSwitch | null;
}

/** The plan's own point: no money at all, one account at least θ ahead of every other, or several within θ of the first (the first first). */
type PlanLead = { kind: "empty" } | { kind: "clear"; first: string } | { kind: "near"; tied: [string, string, ...string[]] };

/**
 * Who leads at each node of an even grid, row by row from the bottom, left to right: the index in `AccountMap.accounts` of the account that
 * leaves the most (`first`) and of the next (`second`, -1 where it does not show: none, or the first is at least θ ahead), and how far ahead
 * the first is, from 0 (the two leave the same) to 1 (θ ahead or more).
 */
export interface MapField {
  cols: number;
  rows: number;
  first: number[];
  second: number[];
  ahead: number[];
  /** At each node, the accounts asked for there that have no ranked price (F-80), as bits over `AccountMap.asked` (bit k for its k-th
   *  account; the first 31 only); absent, none. The first is the first among the accounts priced there. */
  missing?: number[];
}

export interface AccountMap {
  /** The map runs from 0 to `amount` today and from 0 to `monthly` a month; its areas' rows from `bottom` a month up. */
  max: { amount: number; monthly: number };
  bottom: number;
  plan: { amount: number; monthly: number; lead: PlanLead };
  /** The accounts the map shows: first somewhere, or within θ of the first somewhere. The plan's first comes first, then by the area each is
   *  first in, largest first. */
  accounts: string[];
  /** The least today's amount and monthly deposit the search reads (a hundredth of the sliders' reach): a switch down holds from there
   *  to its point, so its words name that range. */
  floor: { amount: number; monthly: number };
  /** The accounts priced on the map, in the order `MapField.missing` names them by. */
  asked: string[];
  /** The areas: `cols` nodes from 0 to the amount's end, `rows` from `bottom` to the monthly end. */
  field: MapField;
  /** The bottom edge, no monthly deposit: one row of nodes along today's amount. */
  edge: MapField;
  /** The nearest point along today's amount (the monthly deposit held), and along the monthly deposit, where another account becomes clearly
   *  cheaper and stays so to the end of the search, up or down. */
  switches: { amount: MapSwitch | null; monthly: MapSwitch | null };
  /** Along a line with no switch, the stretch nearest the plan where another account is clearly cheaper, as the line's samples find it. */
  stretches: { amount: MapStretch | null; monthly: MapStretch | null };
  /** Up each of the plan's lines from the plan, the first points where its reading changes, within the search's reach: where the plan's
   *  first stops being θ ahead (`band`; null where it is not θ ahead at the plan) and where another account leaves more (`even`). */
  changes: { amount: LineChanges; monthly: LineChanges };
  /** The nearest point along each of the plan's lines, up or down, where another account leaves as much as the plan's first (`to`, the one
   *  that leaves more just past it): where the line crosses the place the two are equal. */
  equal: { amount: MapSwitch | null; monthly: MapSwitch | null };
}

/** Where the reading first changes up one of the plan's lines; null where it does not within the search's reach. */
interface LineChanges {
  band: number | null;
  even: number | null;
}

/** An equal point is named only where the leads either side of it are each under this share of θ: where the gap jumps across zero (a step
 *  in a price list), the two never leave the same amount. */
const EVEN_JUMP = 0.25;
/** The coarse grid's cells along each axis, and how many times a cell is split in four at most. */
const COARSE = 6;
const DEPTH = 4;
/** The grid's step, in cells of the smallest size, along each axis. */
const N = COARSE * 2 ** DEPTH;
/** Cells whose corners have different firsts are split down to this size (of N), so a border is read at least this finely. */
const BORDER_CELL = 4;
/** A centre whose lead differs from its corners' blend by more than this share of θ splits its cell. */
const AHEAD_TOLERANCE = 0.05;
/** An account within this many θ of the first at a point priced with every account is priced at every point after. */
const NEAR = 4;
/** Samples along each of the plan's own lines, each way, with every account and then with those near the top, before the switch is narrowed
 *  down, and the steps narrowing it. */
const LINE_SAMPLES = 8;
const DENSE_SAMPLES = 32;
const FINE_SAMPLES = 16;
const FINE_ROUNDS = 2;
const BISECT = 8;
/** The map's areas start this share of the monthly range above 0: what is under it is the bottom edge's (no deposit). */
const ABOVE_EDGE = 0.01;
/** The least amount a search reaches, as a share of its reach, where the other axis is 0 (so it never lands on 0 ₪ and 0 ₪ a month), and the
 *  least monthly deposit (no deposit at all is the edge's). The edge starts at the same share of its axis. */
const LOWEST = 1 / 1000;
/** The searches read nothing under this share of the sliders' reach (5,000 ₪ today, 100 ₪ a month): the step a reader moves a slider by
 *  at its low end, where a point is no decision anyone makes, and where two accounts that differ by a few shekels flip on rounding. */
const NAMED = 1 / 100;
/** The axis's end is past the first change named up its line by this factor (and the cap past a plan beyond the sliders' reach), rounded up to a clean value. */
const ROOM = 1.5;
/** An axis runs to this many times the plan's own value on it (the plan at a third of the way), so a small plan is not a dot in a corner. */
const PLAN_SPAN = 3;
/** The least share of the sliders' reach an axis spans: 10,000 ₪ today and 200 ₪ a month, what a plan of a few thousand shekels and a
 *  small deposit spans, so a plan of nothing on an axis still shows a modest range from 0, never the whole reach. */
const MIN_SPAN = 1 / 50;

/** The accounts at a point, most first, a tie to the earlier in `order` (as the headline breaks it, `rankByValue`). */
function rankedAt(left: ReadonlyMap<string, number>, order: readonly string[]): { id: string; v: number }[] {
  return rankByValue(
    order.flatMap((id) => {
      const v = left.get(id);
      return v === undefined ? [] : [{ id, v }];
    }),
    (x) => x.v,
  );
}

/** The first, the next, and how far ahead the first is against θ (0 to 1); null where no account is priced. */
function leadOf(left: ReadonlyMap<string, number>, order: readonly string[], theta: number): { first: string; second: string | null; ahead: number } | null {
  const [a, b] = rankedAt(left, order);
  if (!a) return null;
  return { first: a.id, second: b?.id ?? null, ahead: b ? Math.min(1, relativeGap(a.v, b.v) / theta) : 1 };
}

/** The accounts worth pricing after a point priced with every account: the first two there, and every one within NEAR θ of the first. */
function nearTop(left: ReadonlyMap<string, number>, order: readonly string[], theta: number): string[] {
  const r = rankedAt(left, order);
  const top = r[0]?.v ?? 0;
  return r.filter((x, k) => k < 2 || relativeGap(top, x.v) < NEAR * theta).map((x) => x.id);
}

/**
 * Whether the plan's accounts `tied` are clearly beaten at a point: the account that leaves the most there is at least θ ahead of every one
 * of them but itself (an account of `tied` counts too, against the others), each of them priced there; that account, else null.
 */
function clearOf(left: ReadonlyMap<string, number>, order: readonly string[], tied: readonly string[], theta: number): string | null {
  const q = rankedAt(left, order)[0];
  if (!q) return null;
  const others = tied.filter((id) => id !== q.id);
  if (others.length === 0) return null;
  // an account of the plan's with no ranked price here is not compared (F-80: an option with no value is neither ranked nor tied), so
  // nothing is clearly beaten where one is missing
  return others.every((id) => {
    const v = left.get(id);
    return v !== undefined && !isTie(q.v, v, theta);
  })
    ? q.id
    : null;
}

/** A clean value at or above `v`: 1, 1.5, 2, 2.5, 3, 4, 5, 6 or 8 times a power of ten. */
export function cleanUp(v: number): number {
  if (v <= 0) return 0;
  const p = 10 ** Math.floor(Math.log10(v));
  for (const k of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (k * p >= v - 1e-9 * p) return k * p;
  return 10 * p;
}

/** A point of one of the plan's lines and what each account priced there leaves. */
type LineSample = { v: number; left: ReadonlyMap<string, number> };

/** One of the plan's lines, one way, from the plan to `end`, and how it is priced: a few samples with every account; after them, only the
 *  plan's accounts and those near the top at any of them (`houses`), at many more samples (`samples`, from the plan outwards, made when
 *  first asked) and at any point (`price`). The samples are denser near the plan (spaced by the 1.5th power). */
interface Line {
  own: number;
  end: number;
  dir: MapSwitch["dir"];
  all: LineSample[];
  samples: () => LineSample[];
  price: (v: number) => ReadonlyMap<string, number>;
}

function lineOf(leftAt: LeftAt, order: readonly string[], theta: number, tied: readonly string[], plan: MapPoint, axis: 0 | 1, dir: MapSwitch["dir"], end: number): Line | null {
  const own = plan[axis];
  if (dir === "up" ? end <= own : end >= own) return null;
  const at = (v: number): MapPoint => (axis === 0 ? [v, plan[1]] : [plan[0], v]);
  const spaced = (n: number) => Array.from({ length: n }, (_, k) => own + (end - own) * ((k + 1) / n) ** 1.5);
  const all = spaced(LINE_SAMPLES).map((v) => ({ v, left: leftAt(...at(v), null) }));
  const houses = order.filter((id) => tied.includes(id) || all.some((s) => nearTop(s.left, order, theta).includes(id)));
  const price = (v: number) => leftAt(...at(v), houses);
  let dense: LineSample[] | null = null;
  const samples = () => (dense ??= [...all, ...spaced(DENSE_SAMPLES).map((v) => ({ v, left: price(v) }))].sort((x, y) => (dir === "up" ? x.v - y.v : y.v - x.v)));
  return { own, end, dir, all, samples, price };
}

/**
 * Where another account becomes clearly cheaper along one of the plan's lines, one way, and stays so: the account that clearly beats the
 * plan's accounts at the line's end (`clearOf`); of the line's samples, the last where that account does not, and between it and the next,
 * the point past which it does, narrowed twice by finer samples (the last that fails each time), then by halving. Null where the plan's
 * accounts are not clearly beaten at the line's end. A switch holds at every sample to the end of the search, by the same account, so a
 * lead that dips under θ and back (the whole units of F-109) does not place it where it first reaches θ, and an account clearly first only
 * for a while before it is not credited with what lies past it.
 * The search reads nothing under `floor` (a hundredth of the sliders' reach, NAMED): a line down ends there, and one up from a plan under it
 * starts there, so a switch that would fall under it is placed at it, where it holds all the same.
 */
function switchAlong(line: Line | null, order: readonly string[], theta: number, tied: readonly string[], floor: number): MapSwitch | null {
  const to = line ? clearOf(line.all.at(-1)?.left ?? new Map(), order, tied, theta) : null;
  if (!line || !to) return null;
  const samples = line.samples().filter((s) => s.v >= floor);
  const holds = (left: ReadonlyMap<string, number>) => clearOf(left, order, tied, theta) === to;
  const k = samples.findLastIndex((s) => !holds(s.left));
  const test = (v: number) => holds(line.price(v));
  const from = Math.max(line.own, floor);
  const at = k < 0 && from > line.own && test(from) ? from : narrow(samples[k]?.v ?? from, samples[k + 1]?.v ?? line.end, test);
  return { at, dir: line.dir, to };
}

/**
 * The edge between a point `out` where `holds` fails and a point `inn` where it holds, the first point on the way in past which it holds:
 * twice FINE_SAMPLES − 1 points between them, the last that fails each time and the next, then halving. It holds at every sample, not
 * between samples. Returns the point on the side where it holds.
 */
function narrow(out: number, inn: number, holds: (v: number) => boolean): number {
  let [lo, hi] = [out, inn];
  for (let round = 0; round < FINE_ROUNDS; round++) {
    const fine = Array.from({ length: FINE_SAMPLES - 1 }, (_, f) => lo + ((hi - lo) * (f + 1)) / FINE_SAMPLES);
    const f = fine.findLastIndex((v) => !holds(v));
    lo = fine[f] ?? lo;
    hi = fine[f + 1] ?? hi;
  }
  for (let i = 0; i < BISECT; i++) {
    const mid = (lo + hi) / 2;
    if (holds(mid)) hi = mid;
    else lo = mid;
  }
  return hi;
}

/**
 * The first stretch along one of the plan's lines, one way, where an account clearly beats the plan's accounts (`clearOf`) though not to the
 * line's end: the first of the line's samples where it does and the run of samples after it where the same account does, each end narrowed
 * from the sample outside it as a switch is (`narrow`). Null where no sample reads so. As a switch's search, it reads nothing under `floor`:
 * a stretch that runs under it is cut at it.
 */
function stretchAlong(line: Line | null, order: readonly string[], theta: number, tied: readonly string[], floor: number): MapStretch | null {
  if (!line) return null;
  const samples = line.samples().filter((sm) => sm.v >= floor);
  const holds = samples.map((sm) => clearOf(sm.left, order, tied, theta));
  const k = holds.findIndex((h) => h !== null);
  const to = holds[k];
  const first = samples[k];
  if (!to || !first) return null;
  let e = k;
  while (holds[e + 1] === to) e++;
  const test = (v: number) => clearOf(line.price(v), order, tied, theta) === to;
  const from = Math.max(line.own, floor);
  const start = k === 0 && from > line.own && test(from) ? from : narrow(samples[k - 1]?.v ?? from, first.v, test);
  const after = samples[e + 1];
  const end = after ? narrow(after.v, samples[e]?.v ?? first.v, test) : line.end;
  const [lo, hi] = [Math.min(start, end), Math.max(start, end)];
  return { lo, hi, dir: line.dir, to };
}

/** The first point along a line where `changed` holds of the reading there: the first sample where it does, narrowed by halving from the
 *  sample before it (the plan, for the first). Null where no sample to the line's end reads changed. As a switch's search, it reads nothing
 *  under `floor`: on a line up from a plan under it, a reading changed there already is placed at it (`at` the floor, `cut`). */
function firstChange(line: Line | null, order: readonly string[], theta: number, floor: number, changed: (l: ReturnType<typeof leadOf>, left: ReadonlyMap<string, number>) => boolean): { at: number; lead: ReturnType<typeof leadOf>; before: ReturnType<typeof leadOf>; cut: boolean } | null {
  if (!line) return null;
  const samples = line.samples().filter((s) => s.v >= floor);
  const k = samples.findIndex((s) => changed(leadOf(s.left, order, theta), s.left));
  const found = samples[k];
  if (!found) return null;
  const from = Math.max(line.own, floor);
  if (k === 0 && from > line.own) {
    const left = line.price(from);
    const l = leadOf(left, order, theta);
    if (changed(l, left)) return { at: from, lead: l, before: l, cut: true };
  }
  let lo = samples[k - 1]?.v ?? from;
  let hi = found.v;
  for (let i = 0; i < BISECT; i++) {
    const mid = (lo + hi) / 2;
    const left = line.price(mid);
    if (changed(leadOf(left, order, theta), left)) hi = mid;
    else lo = mid;
  }
  return { at: hi, lead: leadOf(line.price(hi), order, theta), before: leadOf(line.price(lo), order, theta), cut: false };
}

/** The nearer of a switch up and a switch down. */
function nearer(own: number, up: MapSwitch | null, down: MapSwitch | null): MapSwitch | null {
  if (!up || !down) return up ?? down;
  return Math.abs(up.at - own) <= Math.abs(down.at - own) ? up : down;
}

/** The blend of the corners' figures at (u, w) inside a cell, 0 to 1 from its first corner, for every account priced at all four. */
function blend(corners: readonly [ReadonlyMap<string, number>, ReadonlyMap<string, number>, ReadonlyMap<string, number>, ReadonlyMap<string, number>], ids: readonly string[], u: number, w: number): Map<string, number> {
  const [c00, c10, c11, c01] = corners;
  const out = new Map<string, number>();
  for (const id of ids) {
    const a = c00.get(id);
    const b = c10.get(id);
    const c = c11.get(id);
    const d = c01.get(id);
    if (a === undefined || b === undefined || c === undefined || d === undefined) continue;
    out.set(id, (1 - u) * (1 - w) * a + u * (1 - w) * b + u * w * c + (1 - u) * w * d);
  }
  return out;
}

/** Whether a point priced reads otherwise than its cell's blend says: another first, another lead, or another second where it shows. */
function readsOtherwise(said: ReturnType<typeof leadOf>, got: ReturnType<typeof leadOf>): boolean {
  if (!said || !got) return said !== got;
  if (said.first !== got.first) return true;
  if (Math.abs(said.ahead - got.ahead) > AHEAD_TOLERANCE) return true;
  return said.second !== got.second && Math.min(said.ahead, got.ahead) < 1;
}

/**
 * The map for the plan (F-131). `order` is every account the list ranks, in the order a tie goes to the earlier (the houses', as the
 * headline); `theta` is P-01 as a share; `reach` the farthest today's amount and monthly deposit a switch is looked for (the plan's sliders'
 * ends, P-05, or the plan's own value where it is past them). Null where no account is ranked at the plan (for a plan of nothing, at a
 * tenth of the reach).
 */
export function accountMap({ leftAt, order, theta, plan, reach }: { leftAt: LeftAt; order: readonly string[]; theta: number; plan: { amount: number; monthly: number }; reach: { amount: number; monthly: number } }): AccountMap | null {
  const planPt: MapPoint = [plan.amount, plan.monthly];
  const reachA = Math.max(reach.amount, plan.amount);
  const reachM = Math.max(reach.monthly, plan.monthly);
  // a plan of nothing is read at a tenth of the reach, only to know some account is ranked with the fund
  const empty = plan.amount === 0 && plan.monthly === 0;
  const planLeft = empty ? leftAt(reachA / 10, reachM / 10, null) : leftAt(plan.amount, plan.monthly, null);
  const atPlan = rankedAt(planLeft, order);
  const top = atPlan[0];
  if (!top) return null;
  const tiedIds = atPlan.filter((x) => isTie(top.v, x.v, theta)).map((x) => x.id);
  const [t0, t1, ...rest] = tiedIds;
  const lead: PlanLead = empty ? { kind: "empty" } : t0 && t1 ? { kind: "near", tied: [t0, t1, ...rest] } : { kind: "clear", first: top.id };
  const tied = lead.kind === "empty" ? [] : tiedIds;

  // ------------------------------------------------ the plan's two lines: the switch along each, the nearer of up and down, and the changes up
  // under a hundredth of the sliders' reach no point is named, either way (NAMED): no money at all today (or a month) is a value of its
  // own, as the bottom edge is, and a change found only near it is too small to act on. The searches read nothing under it: a line down
  // ends there, and one up from a plan under it starts there
  const floor = { amount: Math.max(reachA * LOWEST, reach.amount * NAMED), monthly: Math.max(reachM * LOWEST, reach.monthly * NAMED) };
  const lineOn = (axis: 0 | 1, dir: MapSwitch["dir"], to: number) => (tied.length === 0 ? null : lineOf(leftAt, order, theta, tied, planPt, axis, dir, to));
  const lines = { amount: { up: lineOn(0, "up", reachA), down: lineOn(0, "down", floor.amount) }, monthly: { up: lineOn(1, "up", reachM), down: lineOn(1, "down", floor.monthly) } };
  // each way along each line, the first change: the switch, unless an account is clearly cheaper first for a stretch before it (its first
  // run of samples, ending before the line does), then the stretch with the switch after it, so the words name what comes first, each
  // account only where it holds, and what follows the stretch. A stretch and a switch by the same account, first at every sample between
  // them (its lead only dipping under θ, as whole units make it, F-109), are the switch alone
  const changeOn = (line: Line | null, floorAt: number): { sw: MapSwitch | null; st: MapStretch | null } => {
    const sw = switchAlong(line, order, theta, tied, floorAt);
    const st = stretchAlong(line, order, theta, tied, floorAt);
    if (!line || !st) return { sw, st: null };
    const toEnd = line.dir === "up" ? st.hi >= line.end : st.lo <= line.end;
    const gap = (v: number) => (!sw ? false : line.dir === "up" ? v > st.hi && v < sw.at : v < st.lo && v > sw.at);
    const dip = !!sw && sw.to === st.to && line.samples().every((x) => !gap(x.v) || leadOf(x.left, order, theta)?.first === st.to);
    return toEnd || dip ? { sw, st: null } : { sw: null, st: { ...st, then: sw } };
  };
  const ways = {
    amount: { up: changeOn(lines.amount.up, floor.amount), down: changeOn(lines.amount.down, floor.amount) },
    monthly: { up: changeOn(lines.monthly.up, floor.monthly), down: changeOn(lines.monthly.down, floor.monthly) },
  };
  const up = { amount: ways.amount.up.sw, monthly: ways.monthly.up.sw };
  const stretchBy = { amount: { up: ways.amount.up.st, down: ways.amount.down.st }, monthly: { up: ways.monthly.up.st, down: ways.monthly.down.st } };
  // of the two ways, the one whose change starts nearer the plan
  const nearEnd = (own: number, c: { sw: MapSwitch | null; st: MapStretch | null }) => (c.sw ? Math.abs(c.sw.at - own) : c.st ? (c.st.dir === "up" ? c.st.lo - own : own - c.st.hi) : Infinity);
  const pick = (axis: "amount" | "monthly") => {
    const own = plan[axis];
    const { up: u, down: d } = ways[axis];
    return nearEnd(own, u) <= nearEnd(own, d) ? u : d;
  };
  const picked = { amount: pick("amount"), monthly: pick("monthly") };
  const switches = { amount: picked.amount.sw, monthly: picked.monthly.sw };
  const stretches = { amount: picked.amount.st, monthly: picked.monthly.st };
  const planFirst = lead.kind === "clear" ? lead.first : lead.kind === "near" ? lead.tied[0] : null;
  // where another account first leaves more than the plan's first, up or down a line: there the two leave the same. Where the plan's first
  // has no ranked price it is not compared (F-80), so its reading has not changed there
  const firstPriced = (left: ReadonlyMap<string, number>) => planFirst !== null && left.has(planFirst);
  const evenOn = (line: Line | null, at: number): MapSwitch | null => {
    const c = firstChange(line, order, theta, at, (l, left) => firstPriced(left) && l?.first !== planFirst);
    const to = c?.lead?.first;
    // where the gap jumps across zero rather than passing through it, the two never leave the same amount
    // and where the change is under the floor already, the point where they are equal is under it too: not named
    const through = !!c && !c.cut && (c.lead?.ahead ?? 1) < EVEN_JUMP && (c.before?.ahead ?? 1) < EVEN_JUMP;
    return line && c && to && through ? { at: c.at, dir: line.dir, to } : null;
  };
  const evenUp = { amount: evenOn(lines.amount.up, floor.amount), monthly: evenOn(lines.monthly.up, floor.monthly) };
  const changesUp = (line: Line | null, at: number, even: MapSwitch | null): LineChanges => ({
    band: lead.kind === "clear" ? (firstChange(line, order, theta, at, (l, left) => firstPriced(left) && (l?.first !== planFirst || l.ahead < 1))?.at ?? null) : null,
    even: even?.at ?? null,
  });
  const changes = { amount: changesUp(lines.amount.up, floor.amount, evenUp.amount), monthly: changesUp(lines.monthly.up, floor.monthly, evenUp.monthly) };
  const equal = { amount: nearer(plan.amount, evenUp.amount, evenOn(lines.amount.down, floor.amount)), monthly: nearer(plan.monthly, evenUp.monthly, evenOn(lines.monthly.down, floor.monthly)) };

  // ------------------------------------------------ the axes
  // fitted to the plan: PLAN_SPAN times its own value, past the first change up its line with room (the switch up, else the far end of the
  // stretch up that comes first, a switch after it left to the words, else the even point, else where the plan's first stops being θ
  // ahead), at a clean value; at least MIN_SPAN of the
  // sliders' reach, so a plan of no money on an axis still has a modest span to show; at most the reach (or the plan with room, past it)
  const capA = cleanUp(Math.max(reachA, ROOM * plan.amount));
  const capM = cleanUp(Math.max(reachM, ROOM * plan.monthly));
  const nearestUp = (axis: "amount" | "monthly") => up[axis]?.at ?? stretchBy[axis].up?.hi ?? changes[axis].even ?? changes[axis].band ?? 0;
  const axisEnd = (own: number, to: number, r: number, cap: number) => Math.min(cleanUp(Math.max(PLAN_SPAN * own, ROOM * to, r * MIN_SPAN)), cap);
  const maxA = axisEnd(plan.amount, nearestUp("amount"), reach.amount, capA);
  const maxM = axisEnd(plan.monthly, nearestUp("monthly"), reach.monthly, capM);
  const bottom = maxM * ABOVE_EDGE;

  // ------------------------------------------------ the areas: every account on the coarse grid and its low rows and columns
  const xOf = (i: number) => (maxA * i) / N;
  const yOf = (j: number) => bottom + ((maxM - bottom) * j) / N;
  const key = (i: number, j: number) => i * (N + 1) + j;
  const priced = new Map<number, ReadonlyMap<string, number>>();
  const can = new Set<string>(tied);
  const coarse = N / COARSE;
  // the coarse nodes, and the middle of each cell side along the first row and the first column
  const steps = Array.from({ length: COARSE + 1 }, (_, k) => k * coarse);
  const grid = [...steps.flatMap((i) => steps.map((j) => [i, j] as const)), ...steps.flatMap((k) => [[coarse / 2, k], [k, coarse / 2]] as const), [coarse / 2, coarse / 2] as const];
  for (const [i, j] of grid) {
    if (priced.has(key(i, j))) continue;
    const left = leftAt(xOf(i), yOf(j), null);
    priced.set(key(i, j), left);
    for (const id of nearTop(left, order, theta)) can.add(id);
  }
  const houses = order.filter((id) => can.has(id));
  const at = (i: number, j: number): ReadonlyMap<string, number> => {
    const k = key(i, j);
    let got = priced.get(k);
    if (!got) {
      got = leftAt(xOf(i), yOf(j), houses);
      priced.set(k, got);
    }
    return got;
  };
  const cornersOf = (i: number, j: number, s: number) => [at(i, j), at(i + s, j), at(i + s, j + s), at(i, j + s)] as const;

  // each cell split while its centre reads otherwise than its corners' blend, or its corners have different firsts and it is large. A cell on
  // the first row also reads the point a smallest step above the middle of its bottom side, and one on the first column the point a smallest
  // step right of the middle of its left side: there the figures can turn within that step (a deposit too small for a trade's minimum,
  // F-12, or for a whole unit, F-109), and a blend from the side's corners would carry the turn across the whole cell
  const leaves: [number, number, number][] = [];
  const cell = (i: number, j: number, s: number) => {
    if (s > 1) {
      const corners = cornersOf(i, j, s);
      const firsts = new Set(corners.map((c) => leadOf(c, houses, theta)?.first));
      const h = s / 2;
      const otherwise = (u: number, w: number) => readsOtherwise(leadOf(blend(corners, houses, u / s, w / s), houses, theta), leadOf(at(i + u, j + w), houses, theta));
      if ((firsts.size > 1 && s > BORDER_CELL) || otherwise(h, h) || (j === 0 && otherwise(h, 1)) || (i === 0 && otherwise(1, h))) {
        for (const [di, dj] of [[0, 0], [h, 0], [h, h], [0, h]] as const) cell(i + di, j + dj, h);
        return;
      }
    }
    leaves.push([i, j, s]);
  };
  for (let i = 0; i < N; i += coarse) for (let j = 0; j < N; j += coarse) cell(i, j, coarse);
  // the leaf over each smallest cell
  const leafOf = new Int32Array(N * N);
  leaves.forEach(([i, j, s], n) => {
    for (let a = i; a < i + s; a++) for (let b = j; b < j + s; b++) leafOf[a * N + b] = n;
  });
  const leads: ReturnType<typeof leadOf>[] = [];
  // the accounts asked for at each node that have no ranked price there (one missing at any corner of its cell has none in the blend)
  const fieldGaps: string[][] = [];
  for (let j = 0; j <= N; j++)
    for (let i = 0; i <= N; i++) {
      const [li, lj, ls] = leaves[leafOf[Math.min(i, N - 1) * N + Math.min(j, N - 1)] ?? 0] ?? [0, 0, coarse];
      const left = blend(cornersOf(li, lj, ls), houses, (i - li) / ls, (j - lj) / ls);
      leads.push(leadOf(left, houses, theta));
      fieldGaps.push(houses.filter((id) => !left.has(id)));
    }

  // ------------------------------------------------ the bottom edge: no monthly deposit at all, from a thousandth of the axis
  const ex = (i: number) => Math.max(maxA * LOWEST, xOf(i));
  const edgePriced = new Map<number, ReadonlyMap<string, number>>();
  // the plan's accounts are asked for along the edge too, as on the areas, so one with no price there is known to have none
  const edgeCan = new Set<string>(tied);
  for (const i of [0, 2, 8, ...Array.from({ length: COARSE }, (_, k) => (k + 1) * coarse)]) {
    const left = leftAt(ex(i), 0, null);
    edgePriced.set(i, left);
    for (const id of nearTop(left, order, theta)) edgeCan.add(id);
  }
  const edgeHouses = order.filter((id) => edgeCan.has(id));
  const eAt = (i: number) => {
    let got = edgePriced.get(i);
    if (!got) {
      got = leftAt(ex(i), 0, edgeHouses);
      edgePriced.set(i, got);
    }
    return got;
  };
  const edgeLeaves: [number, number][] = [];
  const stretch = (i: number, s: number) => {
    if (s > 1) {
      const [a, b] = [eAt(i), eAt(i + s)];
      const h = s / 2;
      const firsts = new Set([leadOf(a, edgeHouses, theta)?.first, leadOf(b, edgeHouses, theta)?.first]);
      if ((firsts.size > 1 && s > BORDER_CELL / 2) || readsOtherwise(leadOf(blend([a, b, b, a], edgeHouses, 0.5, 0), edgeHouses, theta), leadOf(eAt(i + h), edgeHouses, theta))) {
        stretch(i, h);
        stretch(i + h, h);
        return;
      }
    }
    edgeLeaves.push([i, s]);
  };
  for (let i = 0; i < N; i += 8) stretch(i, 8);
  const edgeLeafOf = new Int32Array(N);
  edgeLeaves.forEach(([i, s], n) => {
    for (let a = i; a < i + s; a++) edgeLeafOf[a] = n;
  });
  const edgeGaps: string[][] = [];
  const edgeLeads = Array.from({ length: N + 1 }, (_, i) => {
    const [li, ls] = edgeLeaves[edgeLeafOf[Math.min(i, N - 1)] ?? 0] ?? [0, 8];
    const [a, b] = [eAt(li), eAt(li + ls)];
    const left = blend([a, b, b, a], edgeHouses, (i - li) / ls, 0);
    edgeGaps.push(edgeHouses.filter((id) => !left.has(id)));
    return leadOf(left, edgeHouses, theta);
  });

  // ------------------------------------------------ the accounts shown, and the leads as their indices
  const area = new Map<string, number>();
  const shows = new Set<string>();
  for (const l of [...leads, ...edgeLeads]) {
    if (!l) continue;
    area.set(l.first, (area.get(l.first) ?? 0) + 1);
    shows.add(l.first);
    if (l.second && l.ahead < 1) shows.add(l.second);
  }
  const size = (id: string) => area.get(id) ?? 0;
  const accounts = [...shows].sort((a, b) => Number(b === planFirst) - Number(a === planFirst) || size(b) - size(a) || order.indexOf(a) - order.indexOf(b));
  const index = new Map(accounts.map((id, k) => [id, k]));
  const asked = order.filter((id) => houses.includes(id) || edgeHouses.includes(id));
  const bit = new Map(asked.slice(0, 31).map((id, k) => [id, 1 << k]));
  const fieldOf = (ls: readonly (ReturnType<typeof leadOf>)[], gaps: readonly string[][], cols: number, rows: number): MapField => ({
    cols,
    rows,
    first: ls.map((l) => (l ? (index.get(l.first) ?? -1) : -1)),
    second: ls.map((l) => (l?.second && l.ahead < 1 ? (index.get(l.second) ?? -1) : -1)),
    // to a thousandth, rounded down, so a lead short of θ never reads as θ ahead
    ahead: ls.map((l) => (l ? Math.floor(l.ahead * 1000) / 1000 : 1)),
    missing: gaps.map((g) => g.reduce((m, id) => m | (bit.get(id) ?? 0), 0)),
  });
  return { max: { amount: maxA, monthly: maxM }, bottom, plan: { ...plan, lead }, accounts, floor, asked, field: fieldOf(leads, fieldGaps, N + 1, N + 1), edge: fieldOf(edgeLeads, edgeGaps, N + 1, 1), switches, stretches, changes, equal };
}
