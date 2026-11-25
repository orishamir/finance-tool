// The arithmetic of a plane's view as a hand moves and zooms it (the region map, `RegionMap`): which part of the plane a drag, a pinch, a
// wheel turn or a button leaves in view. Pure: no React, no DOM. A point of the plot is given as a share of its width from the left and of
// its height from the bottom, so the arithmetic does not depend on the plot's pixels.

/** From and to, along one axis, in the plot's own units. */
export type Span = readonly [number, number];

/** The part of the plane in view. */
export interface PlaneView {
  x: Span;
  y: Span;
}

/** How far a view may reach on each axis, and the narrowest it may be. */
export interface PlaneLimits {
  x: Span;
  y: Span;
  least: { x: number; y: number };
}

/** A point of the plot as shares of its width, from the left, and of its height, from the bottom. */
export type Share = readonly [x: number, y: number];

/**
 * The view that keeps the point at `from` in `start` under `to`, the view's width and height times `f` (under 1 zooms in): on each axis no
 * narrower than the least and no wider than the limits, then moved inside them. A drag is `f` 1; a pinch or a wheel turn keeps the point
 * under the fingers or the pointer where it is.
 */
export function movedView(start: PlaneView, from: Share, to: Share, f: number, limits: PlaneLimits): PlaneView {
  const axis = ([lo, hi]: Span, a: number, b: number, [min, max]: Span, least: number): Span => {
    const at = lo + a * (hi - lo);
    const span = Math.min(max - min, Math.max(least, (hi - lo) * f));
    const start = Math.min(max - span, Math.max(min, at - b * span));
    return [start, start + span];
  };
  return { x: axis(start.x, from[0], to[0], limits.x, limits.least.x), y: axis(start.y, from[1], to[1], limits.y, limits.least.y) };
}

/** Whether two views show the same part of the plane, to a millionth of their width and height. */
export function sameView(a: PlaneView, b: PlaneView): boolean {
  const near = (p: Span, q: Span) => Math.abs(p[0] - q[0]) <= 1e-6 * (p[1] - p[0]) && Math.abs(p[1] - q[1]) <= 1e-6 * (p[1] - p[0]);
  return near(a.x, b.x) && near(a.y, b.y);
}

/** The view `t` of the way from `a` to `b` (0 to 1), each end of each axis moved evenly: the frames of a button's move. */
export function viewBetween(a: PlaneView, b: PlaneView, t: number): PlaneView {
  const mix = (p: Span, q: Span): Span => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  return { x: mix(a.x, b.x), y: mix(a.y, b.y) };
}

/** Whether a zoom by `f` would change the view at all: zooming in, past the least on some axis; out, short of the limits on some axis. */
export function canZoom(v: PlaneView, f: number, limits: PlaneLimits): boolean {
  const span = (s: Span) => s[1] - s[0];
  const room = (s: Span, [min, max]: Span, least: number) => (f < 1 ? span(s) > least * (1 + 1e-9) : span(s) < (max - min) * (1 - 1e-9));
  return room(v.x, limits.x, limits.least.x) || room(v.y, limits.y, limits.least.y);
}

/** The step a read point is rounded to on an axis: the power of ten nearest under a fiftieth of the view's width there (1,000 on 60,000, 10
 *  on 1,000), so a reading names round amounts at any zoom. */
export const snapOf = (s: Span): number => 10 ** Math.floor(Math.log10((s[1] - s[0]) / 50));
