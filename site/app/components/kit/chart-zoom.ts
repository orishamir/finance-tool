// The arithmetic of a year chart's zoom: which years a pointer stands on, and which years a drag or a wheel turn
// leaves in view. Pure: no React, no DOM. A view is whole years, `lo` to `hi`; `band` charts (a bar per year) draw half a year around each.

export interface YearView {
  lo: number;
  hi: number;
}

export type Domain = readonly [number, number];

/** The fewest years apart a zoomed view's two ends stand: nearer, a yearly chart has too few points to draw. */
export const MIN_SPAN = 2;

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Whether a chart's whole range is longer than the narrowest view, so a zoom can show less of it. */
export const canZoomYears = (first: number, last: number) => Math.floor(last) - first > MIN_SPAN;

/** The axis domain of a view. A `last` between whole years (a fee chart's exit month) stays the end of the whole view. */
export function domainOf(view: YearView | null, first: number, last: number, band: boolean): Domain {
  const pad = band ? 0.5 : 0;
  if (!view) return [first - pad, last + pad];
  return [view.lo - pad, (view.hi >= Math.floor(last) ? last : view.hi) + pad];
}

/** The year at `px` from the plot's left edge. */
export const yearAt = (px: number, plotWidth: number, [from, to]: Domain) => from + (px / Math.max(1, plotWidth)) * (to - from);

/** The whole year a pointer reads: the nearest one in view. */
export function pickYear(px: number, plotWidth: number, domain: Domain, first: number, last: number): number {
  const lo = Math.max(first, Math.ceil(domain[0]));
  const hi = Math.min(Math.floor(last), Math.floor(domain[1]));
  return clamp(Math.round(yearAt(px, plotWidth, domain)), lo, Math.max(lo, hi));
}

/** The view a drag between two pixels asks for, widened to the narrowest view if it is narrower; null when the whole range is too short. */
export function viewFromDrag(pxA: number, pxB: number, plotWidth: number, domain: Domain, first: number, last: number): YearView | null {
  const top = Math.floor(last);
  if (!canZoomYears(first, last)) return null;
  const a = clamp(Math.round(yearAt(Math.min(pxA, pxB), plotWidth, domain)), first, top);
  const b = clamp(Math.round(yearAt(Math.max(pxA, pxB), plotWidth, domain)), first, top);
  return settle(a, Math.max(b, a + MIN_SPAN), first, top);
}

/** The view one wheel turn leaves, keeping the year under the pointer where it is; null for the whole range. */
export function viewFromWheel(view: YearView | null, anchor: number, zoomIn: boolean, first: number, last: number): YearView | null {
  const top = Math.floor(last);
  if (!canZoomYears(first, last)) return null;
  const { lo, hi } = view ?? { lo: first, hi: top };
  const span = hi - lo;
  const next = zoomIn ? Math.max(MIN_SPAN, Math.min(span - 1, Math.round(span * 0.8))) : Math.max(span + 1, Math.round(span * 1.25));
  if (next >= top - first) return null;
  const from = Math.round(anchor - ((anchor - lo) / Math.max(1, span)) * next);
  return settle(from, from + next, first, top);
}

/** Slides a view back inside the range, keeping its length. */
function settle(lo: number, hi: number, first: number, top: number): YearView {
  const span = Math.min(hi - lo, top - first);
  const start = clamp(lo, first, top - span);
  return { lo: start, hi: start + span };
}
