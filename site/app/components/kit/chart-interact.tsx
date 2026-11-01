// How a chart answers the pointer (issue 22, 2026-11-01). A year chart reads the year under the pointer; a click or a tap keeps that year;
// on a mouse, a drag across the plot zooms to the years it covers, and ctrl with the wheel (a pinch on a touchpad) zooms around the
// pointer, so plain scrolling still moves the page. A phone keeps its scrolling: no zoom there, and a tap does not need hover. A legend's
// item, a bar or a row picks its series with `useChartPick`: a mouse previews it, a click or a tap keeps it. Nothing here moves the layout.
import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { kit as kitCopy } from "../../copy";
import { useGlidingNumbers } from "./chart-glide";
import { CountingFigures } from "./counting";
import { cx } from "./cx";
import { canZoomYears, domainOf, pickYear, viewFromDrag, viewFromWheel, yearAt, type Domain, type YearView } from "./chart-zoom";

/** Pixels a mouse must travel before a press is a drag, not a click. */
const DRAG_PX = 8;
/** The wheel's travel that makes one zoom step: one notch of a mouse, a few events of a touchpad's pinch. */
const WHEEL_STEP = 40;

export interface YearZoom {
  /** On the chart's `<svg>`. */
  svgRef: (el: SVGSVGElement | null) => void;
  handlers: {
    onPointerDown: (e: PointerEvent<SVGSVGElement>) => void;
    onPointerMove: (e: PointerEvent<SVGSVGElement>) => void;
    onPointerUp: (e: PointerEvent<SVGSVGElement>) => void;
    onPointerLeave: () => void;
    onPointerCancel: () => void;
    onDoubleClick: () => void;
  };
  /** The domain to draw with: it glides between views. */
  domain: Domain;
  /** The domain the glide ends on: the axis's year labels use it, so they do not flicker on the way. */
  settled: Domain;
  view: YearView | null;
  canZoom: boolean;
  /** Whether a year is in the part of the axis drawn right now, on the way to a new view. */
  has: (year: number) => boolean;
  /** Whether a year is in the view the glide ends on: what a chart's value axis fits, so the axis does not hunt on the way. */
  seen: (year: number) => boolean;
  /** The drag in progress, in px from the plot's left edge. */
  brush: { from: number; to: number } | null;
  reset: () => void;
}

/**
 * A year chart's pointer and zoom. `first` and `last` are the chart's whole range in years; `plotLeft` and `plotWidth` are the plot in px
 * inside the `<svg>`; `band` is a chart with a bar per year. `onHover` gets the year to read, or null for the chart's own default.
 */
export function useYearZoom({ first = 0, last, plotLeft = 0, plotWidth, band = false, onHover }: { first?: number; last: number; plotLeft?: number; plotWidth: number; band?: boolean; onHover: (year: number | null) => void }): YearZoom {
  const [view, setView] = useState<YearView | null>(null);
  const [brush, setBrush] = useState<{ from: number; to: number } | null>(null);
  const settled = domainOf(view, first, last, band);
  const glide = useGlidingNumbers(settled);
  const domain: Domain = [glide[0]!, glide[1]!];
  const canZoom = canZoomYears(first, last);

  const pin = useRef<number | null>(null);
  const press = useRef<{ x: number; mouse: boolean; year: number; slid: boolean } | null>(null);
  const live = useRef({ settled, view, first, last, plotLeft, plotWidth, canZoom, onHover });
  live.current = { settled, view, first, last, plotLeft, plotWidth, canZoom, onHover };

  // a change of range is another chart: the zoom and the kept year belong to the old one
  useEffect(() => {
    setView(null);
    pin.current = null;
    live.current.onHover(null);
  }, [first, last]);

  // zoomed in, the reading rests on the last year in view, where the chart's labels read too; the year under the pointer still wins
  const rest = () => pin.current ?? view?.hi ?? null;
  useEffect(() => {
    if (!press.current) live.current.onHover(pin.current ?? view?.hi ?? null);
  }, [view]);

  const reset = useCallback(() => {
    setView(null);
    pin.current = null;
    live.current.onHover(null);
  }, []);

  const pxOf = (clientX: number, el: Element) => clientX - el.getBoundingClientRect().left - live.current.plotLeft;
  const pick = (px: number) => pickYear(px, live.current.plotWidth, live.current.settled, live.current.first, live.current.last);

  // Plain scrolling stays the page's, so React's passive wheel event would do, but ctrl with the wheel must not zoom the whole page.
  const wheelEl = useRef<SVGSVGElement | null>(null);
  const travel = useRef(0);
  const onWheel = useCallback((e: WheelEvent) => {
    const l = live.current;
    if (!e.ctrlKey || !l.canZoom || !wheelEl.current) return;
    e.preventDefault();
    travel.current += e.deltaY;
    if (Math.abs(travel.current) < WHEEL_STEP) return;
    const zoomIn = travel.current < 0;
    travel.current = 0;
    const anchor = yearAt(e.clientX - wheelEl.current.getBoundingClientRect().left - l.plotLeft, l.plotWidth, l.settled);
    pin.current = null;
    setView(viewFromWheel(l.view, anchor, zoomIn, l.first, l.last));
  }, []);
  const svgRef = useCallback(
    (el: SVGSVGElement | null) => {
      wheelEl.current?.removeEventListener("wheel", onWheel);
      wheelEl.current = el;
      el?.addEventListener("wheel", onWheel, { passive: false });
    },
    [onWheel],
  );

  return {
    svgRef,
    domain,
    settled,
    view,
    canZoom,
    brush,
    reset,
    has: (year) => year >= Math.floor(domain[0]) && year <= Math.ceil(domain[1]),
    seen: (year) => year >= Math.floor(settled[0]) && year <= Math.ceil(settled[1]),
    handlers: {
      onPointerDown: (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        const px = pxOf(e.clientX, e.currentTarget);
        const year = pick(px);
        const mouse = e.pointerType === "mouse";
        press.current = { x: px, mouse, year, slid: false };
        if (mouse) e.currentTarget.setPointerCapture(e.pointerId);
        else onHover(year);
      },
      onPointerMove: (e) => {
        const px = pxOf(e.clientX, e.currentTarget);
        const p = press.current;
        if (p?.mouse && live.current.canZoom && (brush || Math.abs(px - p.x) >= DRAG_PX)) {
          const w = live.current.plotWidth;
          setBrush({ from: Math.max(0, Math.min(p.x, px)), to: Math.min(w, Math.max(p.x, px)) });
          return;
        }
        const year = pick(px);
        if (p && !p.mouse) {
          // a finger sliding along the chart reads every year it passes, and the last one stays when it lifts
          if (year !== p.year) p.slid = true;
          p.year = year;
          onHover(year);
        } else if (pin.current === null) onHover(year);
      },
      onPointerUp: (e) => {
        const p = press.current;
        press.current = null;
        if (!p) return;
        if (brush) {
          const l = live.current;
          setBrush(null);
          setView(viewFromDrag(brush.from, brush.to, l.plotWidth, l.settled, l.first, l.last));
          pin.current = null;
          return;
        }
        const year = p.mouse ? pick(pxOf(e.clientX, e.currentTarget)) : p.year;
        pin.current = pin.current === year && !p.slid ? null : year;
        onHover(p.mouse ? year : rest());
      },
      onPointerLeave: () => {
        if (!press.current) onHover(rest());
      },
      onPointerCancel: () => {
        press.current = null;
        setBrush(null);
        onHover(rest());
      },
      onDoubleClick: reset,
    },
  };
}

/** The drag in progress, in the chart's `<svg>`. `left` is the plot's left edge in px. */
export function ZoomBrush({ brush, top, bottom, left = 0 }: { brush: YearZoom["brush"]; top: number; bottom: number; left?: number }) {
  if (!brush) return null;
  return <rect x={left + brush.from} y={top} width={brush.to - brush.from} height={bottom - top} className="fill-foreground stroke-chart-crosshair" fillOpacity="0.12" strokeWidth="1" />;
}

/**
 * The line under a year chart, one height in every state: on a computer, what the pointer can do, or the years in view with the way back
 * to all of them. A phone has no zoom and needs no line. `yearWord` writes a year ("היום" for 0).
 */
export function ZoomBar({ zoom, yearWord = String }: { zoom: YearZoom; yearWord?: (year: number) => string }) {
  const { view } = zoom;
  return (
    <div className={cx("min-h-7 items-center gap-2 text-xs text-muted-foreground", view ? "flex" : "hidden [@media(pointer:fine)]:flex")}>
      {view ? (
        <>
          <span>
            {kitCopy.chart.showing} <bdi dir="ltr">{yearWord(view.lo)}</bdi> {kitCopy.chart.to} <bdi dir="ltr">{yearWord(view.hi)}</bdi>
          </span>
          <button type="button" onClick={zoom.reset} className="text-link hover:underline min-h-7 cursor-pointer">
            {kitCopy.chart.allYears}
          </button>
        </>
      ) : (
        <span>{zoom.canZoom ? kitCopy.chart.hint : kitCopy.chart.hintShort}</span>
      )}
    </div>
  );
}

export interface ChartPick<T> {
  /** What the chart shows set apart: the previewed item, else the kept one. */
  active: T | null;
  /** The item a click or a tap kept. */
  pinned: T | null;
  /** On the item's element. `tap: false` leaves clicks to what the item sits in (a bar inside a row that picks the row). */
  bind: (id: T, tap?: boolean) => { onPointerEnter: (e: PointerEvent) => void; onPointerLeave: (e: PointerEvent) => void; onClick?: () => void };
}

/** One series, bar or row set apart: a mouse previews it, a click or a tap keeps it, and the same click or tap lets it go. */
export function useChartPick<T = string>(): ChartPick<T> {
  const [preview, setPreview] = useState<T | null>(null);
  const [pinned, setPinned] = useState<T | null>(null);
  return {
    active: preview ?? pinned,
    pinned,
    bind: (id, tap = true) => ({
      onPointerEnter: (e) => {
        if (e.pointerType === "mouse") setPreview(id);
      },
      onPointerLeave: (e) => {
        if (e.pointerType === "mouse") setPreview(null);
      },
      ...(tap ? { onClick: () => setPinned((p) => (p === id ? null : id)) } : {}),
    }),
  };
}

/** The class that sets a series back while another is picked; it fades, and it holds the series' place. */
export const pickDim = (active: string | null | undefined, id: string) => cx("transition-opacity duration-[var(--duration-fast)]", active && active !== id && "opacity-20");

/**
 * A small box of values at a point of a chart, over the chart, so nothing under it moves. The parent is positioned and reads left to right;
 * `x` is its px from the parent's left, and past `width / 2` the box stands to the left of the point, so it stays on the screen.
 */
export function ChartTip({ x, top = 0, width, children }: { x: number; top?: number; width: number; children: ReactNode }) {
  return (
    <div dir="rtl" className="absolute z-20 pointer-events-none whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs leading-snug shadow-sm" style={{ left: x, top, transform: x > width / 2 ? "translateX(calc(-100% - 8px))" : "translateX(8px)" }}>
      <CountingFigures on={false}>{children}</CountingFigures>
    </div>
  );
}
