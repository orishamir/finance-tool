// The arithmetic of a chart's glide (founder, 2026-11-01: sliding a number made the graphs jump). Pure: no React, no DOM.

export interface GlidePoint {
  year: number;
  v: number;
}

export type GlideSeries = Record<string, GlidePoint[]>;

/** A line's value at a year between its points, read on the straight segment drawn there; past its ends, its end value. */
export function valueOn(pts: readonly GlidePoint[], year: number): number {
  const i = pts.findIndex((p) => p.year >= year);
  if (i === -1) return pts[pts.length - 1]?.v ?? 0;
  const b = pts[i]!;
  if (i === 0 || b.year === year) return b.v;
  const a = pts[i - 1]!;
  return a.v + ((b.v - a.v) * (year - a.year)) / (b.year - a.year || 1);
}

/** Whether two sets of lines are the same, so that a render with new arrays and the same numbers starts no glide. */
export function sameSeries(a: GlideSeries, b: GlideSeries): boolean {
  if (a === b) return true;
  const ids = Object.keys(a);
  if (ids.length !== Object.keys(b).length) return false;
  return ids.every((id) => {
    const p = a[id];
    const q = b[id];
    return !!p && !!q && p.length === q.length && p.every((pt, i) => pt.year === q[i]!.year && Object.is(pt.v, q[i]!.v));
  });
}

const within = (pts: readonly GlidePoint[], year: number) => pts.length > 0 && year >= pts[0]!.year && year <= pts[pts.length - 1]!.year;

/**
 * A line on its way from what is drawn to what it should be, on the years of both. A year only one of them has does not move: a longer
 * horizon adds years that are already in their place beyond the plot's edge, and the axis's glide brings them in, so a line never
 * stretches like rubber. A line that was not drawn is there at once.
 */
export function alignLine(from: readonly GlidePoint[] | undefined, to: readonly GlidePoint[]): { years: number[]; now: number[]; goal: number[] } {
  if (!from || from.length === 0) return { years: to.map((p) => p.year), now: to.map((p) => p.v), goal: to.map((p) => p.v) };
  const years = [...new Set([...from.map((p) => p.year), ...to.map((p) => p.year)])].sort((a, b) => a - b);
  const old = (y: number) => valueOn(from, y);
  const next = (y: number) => valueOn(to, y);
  return {
    years,
    now: years.map((y) => (within(from, y) ? old(y) : next(y))),
    goal: years.map((y) => (within(to, y) ? next(y) : old(y))),
  };
}

/** One frame of following: `k` of the way to the goal. A value that cannot be drawn (NaN, no price) takes the goal at once, either way. */
export const follow = (now: number, goal: number, k: number) => (Number.isFinite(now) && Number.isFinite(goal) ? now + (goal - now) * k : goal);

export interface GlideTick {
  value: number;
  phase: "still" | "in" | "out";
}

/** The ticks to draw when the axis's ticks change: the kept ones stay, new ones fade in, gone ones fade out and are removed later. */
export function mergeTicks(prev: readonly GlideTick[], next: readonly number[]): GlideTick[] {
  const kept = prev.map((t): GlideTick => (next.includes(t.value) ? (t.phase === "out" ? { value: t.value, phase: "in" } : t) : { value: t.value, phase: "out" }));
  const added = next.filter((v) => !prev.some((t) => t.value === v)).map((value): GlideTick => ({ value, phase: "in" }));
  return [...kept, ...added];
}

/** A CSS time in ms. The built stylesheet writes 400ms as .4s, so the unit has to be read: taken as a bare number, every glide lasted under a ms. */
export function cssMs(text: string): number {
  const v = parseFloat(text) || 0;
  return /ms\s*$/.test(text) ? v : v * 1000;
}
