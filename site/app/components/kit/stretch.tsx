// Stretches on a money ruler (the index page's accounts and funds): an account is a stretch of the ruler, from what is left with its dearest
// fund to what is left with its cheapest, and a fund is a spot inside the chosen account's stretch. `StretchBar` is a small copy of the
// ruler beside a row, one scale for every row: the row's own stretch on it, and a spot where the row is a fund. `StretchChart` sets two
// lists beside one ruler: the chosen start row opens onto its stretch, drawn as a band on the ruler, as a filled wedge; the band opens onto
// the end list as a faint one, with one thin straight line from each end row's spot on the ruler to that row, the chosen row's solid; the
// chosen pair is one point on the band, joined by a line straight up to the foot of what stands above (the receipt's total); a pair that is
// shown but not ranked (`pointOpen`) is a hollow point joined by a dashed line, with no spot. Everything it draws is placed from the rows'
// measured positions, again on every change and resize, so rows of any height join where they stand.
import { useCallback, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { placeOn, ticksOf, type Scale } from "../../lib/stretch";
import { cx } from "./cx";

/** A spot: one value, or a range drawn as a short segment (a fund whose difference runs over the dollar's range). */
export type StretchSpot = number | readonly [number, number];

const pct = (x: number) => `${(x * 100).toFixed(3)}%`;

/**
 * The small ruler beside a row: a 9 px bar, its height the caller's (`className`, `h-6` beside a 32 px row), on the list's one `scale`, the
 * stretch from `worst` to `best` filled in the account's colour, and `spot` (a fund in that stretch) as a dot in the fund's colour. Decoration
 * beside the row's own figure, which says the amount: hidden from screen readers.
 */
export function StretchBar({ scale, best, worst, spot, className }: { scale: Scale; best: number | null; worst: number | null; spot?: StretchSpot; className?: string }) {
  // no stretch (an account that ranks no fund of the kind): the empty bar
  const top = best === null ? null : placeOn(scale, best);
  const bottom = worst === null ? null : placeOn(scale, worst);
  const spotAt = spot === undefined ? null : typeof spot === "number" ? [placeOn(scale, spot), placeOn(scale, spot)] : [placeOn(scale, Math.max(...spot)), placeOn(scale, Math.min(...spot))];
  return (
    <span aria-hidden="true" className={cx("relative inline-block w-[9px] shrink-0 rounded-[4px] bg-card ring-1 ring-inset ring-muted-foreground/45", className ?? "h-6")} data-stretch-bar="">
      {top !== null && bottom !== null && <span className="absolute inset-x-[1.5px] min-h-[2.5px] rounded-[2px] bg-chart-by-account" style={{ top: `min(${pct(top)}, calc(100% - 2.5px))`, height: pct(bottom - top) }} />}
      {spotAt && (
        <span
          className="absolute left-1/2 min-h-[7px] w-[7px] -translate-x-1/2 -translate-y-[3.5px] rounded-full bg-chart-by-fund ring-[1.5px] ring-background"
          style={{ top: pct(spotAt[0]!), height: `calc(${pct(spotAt[1]! - spotAt[0]!)} + 7px)` }}
        />
      )}
    </span>
  );
}

/** How long the drawing follows the rows after what moves them changes: the rows' slide (the kit's FLIP) lasts less. */
const FOLLOW_MS = 900;
/** The space the ruler keeps above its highest value and below its lowest, inside its box, px. */
const END = 32;
/** The band's room past its two values, px, and its corners. */
const BAND_PAD = 10;
/** Ticks at least this far apart, px. */
const TICK_GAP = 56;

interface RowBox {
  top: number;
  bottom: number;
  /** The row's edge that faces the ruler. */
  edge: number;
  /** Where its line ends: the middle of its `data-spot-dot`, else its facing edge. */
  dot: number;
}
interface Geo {
  w: number;
  h: number;
  ruler: { l: number; r: number; t: number; b: number };
  /** The start list stands at the ruler's right (a right-to-left page). */
  startRight: boolean;
  start: Record<string, RowBox>;
  end: Record<string, RowBox>;
  /** The foot of what stands above, from the box's top (negative: above it). */
  above: number | null;
}

/** The rows of one list, by key, as they stand now (a row sliding to its place included). */
function rowsOf(root: HTMLElement, list: string, box: DOMRect, ruler: DOMRect): Record<string, RowBox> {
  const out: Record<string, RowBox> = {};
  const mid = ruler.left + ruler.width / 2;
  for (const el of root.querySelectorAll<HTMLElement>(`[data-anchor="${list}"] > [data-pick-key]`)) {
    const r = el.getBoundingClientRect();
    if (r.height === 0) continue;
    const right = r.left + r.width / 2 > mid;
    const edge = (right ? r.left : r.right) - box.left;
    const d = el.querySelector("[data-spot-dot]")?.getBoundingClientRect();
    out[el.dataset.pickKey!] = { top: r.top - box.top, bottom: r.bottom - box.top, edge, dot: d ? d.left + d.width / 2 - box.left : edge };
  }
  return out;
}

export interface StretchChartProps {
  /** The start side's heading, list and what stands under the list (the accounts); `end*` the same for the other side (the funds). */
  startHead: ReactNode;
  startList: ReactNode;
  startFoot?: ReactNode;
  endHead: ReactNode;
  endList: ReactNode;
  endFoot?: ReactNode;
  /** Under both sides. */
  note?: ReactNode;
  /** The lists' `data-anchor` names (`PickList` `anchor`), by which their rows are found. */
  startAnchor: string;
  endAnchor: string;
  /** One scale for the ruler and every small bar. */
  scale: Scale;
  /** The chosen start row's stretch: the band; null where the chosen account ranks no fund. */
  band: { best: number; worst: number } | null;
  /** The chosen pair's value: the point on the band. */
  point: number;
  /** The chosen pair is shown, not ranked (an open rule): a hollow point at its value, a dashed line up, and no spot. */
  pointOpen?: boolean;
  /** Each end row's spot, by its key; a row with none has no line. */
  spots: Record<string, StretchSpot>;
  chosenStart: string;
  chosenEnd: string;
  /** What stands above the chart (the receipt), whose foot the point's line reaches, over its middle. */
  above?: RefObject<HTMLElement | null>;
  /** A tick's words, as SVG text (`fmt.compactNisAxis`). */
  tick: (v: number) => string;
  /** What moves the rows (the picks, the plan, the lists' sizes): on a change the drawing follows the rows' slide for a moment. */
  watch: string;
}

/**
 * Two lists with a ruler between them. The lists are the caller's `PickList`s with `anchor`s; the heading, the list and the foot of each
 * side stand on three shared rows, so both lists start on one line, which is where the ruler's scale starts too. The ruler's height is
 * fixed (34rem of scale); a list may run past it. The drawing is hidden from screen readers: the lists say every figure it places.
 */
export function StretchChart(p: StretchChartProps) {
  const box = useRef<HTMLDivElement>(null);
  const ruler = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const { startAnchor, endAnchor, above } = p;
  const measure = useCallback(() => {
    const root = box.current;
    const rul = ruler.current;
    if (!root || !rul) return;
    const b = root.getBoundingClientRect();
    const r = rul.getBoundingClientRect();
    if (b.width === 0 || r.height === 0) return setGeo(null);
    const firstStart = root.querySelector<HTMLElement>(`[data-anchor="${startAnchor}"] > [data-pick-key]`)?.getBoundingClientRect();
    const ab = above?.current?.getBoundingClientRect();
    const next: Geo = {
      w: b.width,
      h: b.height,
      ruler: { l: r.left - b.left, r: r.right - b.left, t: r.top - b.top, b: r.bottom - b.top },
      startRight: !!firstStart && firstStart.left + firstStart.width / 2 > r.left + r.width / 2,
      start: rowsOf(root, startAnchor, b, r),
      end: rowsOf(root, endAnchor, b, r),
      above: ab && ab.height > 0 ? ab.bottom - b.top : null,
    };
    setGeo((prev) => (prev && JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [startAnchor, endAnchor, above]);
  // the box or what stands above changes size (the window, fonts, a fold that opens): drawn again
  useLayoutEffect(() => {
    const root = box.current;
    if (!root) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(root);
    if (above?.current) ro.observe(above.current);
    return () => ro.disconnect();
  }, [measure, above]);
  // the rows slide to their new places after a pick or a re-sort: the drawing follows them frame by frame for a moment
  useLayoutEffect(() => {
    measure();
    let frame = 0;
    const until = performance.now() + FOLLOW_MS;
    const follow = () => {
      measure();
      if (performance.now() < until) frame = requestAnimationFrame(follow);
    };
    frame = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(frame);
  }, [measure, p.watch]);

  return (
    <div ref={box} className="relative grid grid-cols-[minmax(0,1fr)_min(17.75rem,28%)_minmax(0,1fr)] grid-rows-[auto_auto_auto_auto] items-start gap-y-3">
      <div className="col-start-1 row-start-1 min-w-0 self-end">{p.startHead}</div>
      <div className="col-start-3 row-start-1 min-w-0 self-end">{p.endHead}</div>
      <div className="col-start-1 row-start-2 min-w-0">{p.startList}</div>
      {/* the ruler's room: its box reaches a row's half above the lists' first row, and its scale starts at that row's middle */}
      <div ref={ruler} aria-hidden="true" className="col-start-2 row-start-2 mx-auto -mt-4 h-[calc(34rem+2rem)] w-[5.25rem]" />
      <div className="col-start-3 row-start-2 min-w-0">{p.endList}</div>
      {p.startFoot && <div className="col-start-1 row-start-3 min-w-0">{p.startFoot}</div>}
      {p.endFoot && <div className="col-start-3 row-start-3 min-w-0">{p.endFoot}</div>}
      {p.note && <div className="col-span-3 row-start-4 pt-3">{p.note}</div>}
      {geo && <Drawing geo={geo} {...p} />}
    </div>
  );
}

function Drawing({ geo, scale, band, point, pointOpen = false, spots, chosenStart, chosenEnd, tick }: StretchChartProps & { geo: Geo }) {
  const { ruler: R } = geo;
  const y0 = R.t + END;
  const y1 = R.b - END;
  const y = (v: number) => y0 + placeOn(scale, v) * (y1 - y0);
  const cx0 = (R.l + R.r) / 2;
  // the ruler's sides that face each list
  const startX = geo.startRight ? R.r : R.l;
  const endX = geo.startRight ? R.l : R.r;
  const yBest = band ? y(band.best) - BAND_PAD : null;
  const yWorst = band ? y(band.worst) + BAND_PAD : null;
  const yPoint = y(point);
  const chosen = geo.start[chosenStart];
  const ends = Object.entries(geo.end).filter(([k]) => spots[k] !== undefined);
  const first = ends.length ? Math.min(...ends.map(([, r]) => r.top)) : null;
  const last = ends.length ? Math.max(...ends.map(([, r]) => r.bottom)) : null;
  const endEdge = ends[0]?.[1].edge ?? null;
  // a tick's amount never sits on the point or across the band's edge
  const ticks = ticksOf(scale, Math.max(1, Math.floor((y1 - y0) / TICK_GAP))).filter((v) => Math.abs(y(v) - yPoint) >= 16 && (yBest === null || Math.abs(y(v) - yBest) >= 11) && (yWorst === null || Math.abs(y(v) - yWorst) >= 11));
  return (
    <svg aria-hidden="true" width={geo.w} height={geo.h} className="pointer-events-none absolute inset-0 overflow-visible" data-chart="stretch">
      <rect x={R.l} y={R.t} width={R.r - R.l} height={R.b - R.t} rx={12} className="fill-card stroke-border" />
      {/* the chosen start row opens onto its stretch, and the stretch opens onto the end list */}
      {chosen && yBest !== null && yWorst !== null && <path d={`M${chosen.edge} ${chosen.top}L${startX} ${yBest}V${yWorst}L${chosen.edge} ${chosen.bottom}Z`} className="fill-chart-by-account" fillOpacity={0.2} />}
      {first !== null && last !== null && endEdge !== null && yBest !== null && yWorst !== null && <path d={`M${endX} ${yBest}L${endEdge} ${first}V${last}L${endX} ${yWorst}Z`} className="fill-chart-by-account" fillOpacity={0.07} />}
      {yBest !== null && yWorst !== null && <rect x={R.l + 1} y={yBest} width={R.r - R.l - 2} height={Math.max(yWorst - yBest, 2 * BAND_PAD)} rx={BAND_PAD} className="fill-chart-by-account" fillOpacity={0.3} />}
      {ticks.map((v) => (
        <g key={v}>
          <path d={`M${R.l} ${y(v)}h8M${R.r} ${y(v)}h-8`} className="stroke-chart-text" strokeOpacity={0.45} />
          <text x={cx0} y={y(v) + 4.5} textAnchor="middle" fontSize={13} className="fill-chart-text tabular-nums" direction="ltr">
            {tick(v)}
          </text>
        </g>
      ))}
      {/* one straight line from each end row's spot on the ruler to the row; the chosen one solid */}
      {ends.map(([k, r]) => {
        const s = spots[k]!;
        const on = k === chosenEnd;
        const [a, b] = typeof s === "number" ? [y(s), y(s)] : [y(Math.max(...s)), y(Math.min(...s))];
        const mid = (a + b) / 2;
        return (
          <g key={k}>
            {/* a faint line is a solid mix, not a see-through one: it reads as one colour over the wedge and over the card */}
            <path d={`M${endX} ${mid}L${r.dot} ${(r.top + r.bottom) / 2}`} className="stroke-chart-by-fund" style={on ? undefined : { stroke: "color-mix(in oklab, var(--chart-by-fund) 55%, var(--card))" }} strokeWidth={on ? 2.5 : 1} fill="none" />
            {b - a > 1 && <path d={`M${endX} ${a}V${b}`} className="stroke-chart-by-fund" strokeWidth={3} strokeLinecap="round" data-mark="line" />}
            {!on && <circle cx={endX} cy={mid} r={3} className="fill-background stroke-chart-by-fund" strokeWidth={1.25} data-mark="point" />}
          </g>
        );
      })}
      {/* the pair in the receipt: one point on the ruler, inside the stretch, joined straight up to the foot of what stands above; a pair
          shown but not ranked: a hollow point at its value, the line dashed, and no spot */}
      <path d={`M${cx0} ${geo.above ?? R.t}V${yPoint}`} className="stroke-primary" strokeWidth={pointOpen ? 2 : 3} {...(pointOpen ? { strokeDasharray: "5 5" } : {})} />
      {!pointOpen && <path d={`M${endX} ${yPoint}H${cx0}`} className="stroke-primary" strokeWidth={3} />}
      {!pointOpen && <circle cx={endX} cy={yPoint} r={6} className="fill-chart-by-fund" data-mark="point" />}
      {pointOpen ? <circle cx={cx0} cy={yPoint} r={6} className="fill-card stroke-primary" strokeWidth={2.5} data-mark="point" /> : <circle cx={cx0} cy={yPoint} r={7} className="fill-primary" data-mark="point" />}
    </svg>
  );
}
