// A map of areas over two amounts: which of a few options holds at each point of a plane, each option's area filled in its own light
// colour with its name inside it, a line along each border, a marked point (the reader's own) with dashed guides from it to the nearest
// border along each axis, and a value of the bottom edge drawn apart as a thick line in the colour of the option that holds there. The
// x axis grows left to right and the y axis up from 0 (charts.md). The pointer reads any point: on a computer a box follows it and the area
// under it lightens; a click or a tap keeps a point (its mark stays, and the reading under the map is that point's), a second one elsewhere
// moves it, and a tap on it or Escape lets it go. The map takes the focus, and the arrow keys move the kept point (from the marked one;
// with Shift in larger steps). A legend item or an area's name sets that area apart while pointed at, and keeps it on a click or a tap.
// The caller gives the areas as polygons in the plot's own units and says what a reading holds; the piece draws and answers the pointer.
import { useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { scaleLinear } from "d3-scale";
import { line as d3line, curveCatmullRom } from "d3-shape";
import { pickDim, useChartPick, ChartTip } from "./chart-interact";
import { ChartLegend, Swatch } from "./chart-parts";
import { chartTextWidth } from "./chart-text";
import { cx } from "./cx";
import { useWidth } from "./marker";

/** A point of the plot, in its own units. */
export type RegionPoint = readonly [x: number, y: number];

/** An area's colour, in the order the areas are given out; `other` gathers what is past the fourth. */
export type RegionTone = "region-1" | "region-2" | "region-3" | "region-4" | "other";

const FILL: Record<RegionTone, string> = {
  "region-1": "fill-chart-region-1",
  "region-2": "fill-chart-region-2",
  "region-3": "fill-chart-region-3",
  "region-4": "fill-chart-region-4",
  other: "fill-chart-region-other",
};
const STROKE: Record<RegionTone, string> = {
  "region-1": "stroke-chart-region-1",
  "region-2": "stroke-chart-region-2",
  "region-3": "stroke-chart-region-3",
  "region-4": "stroke-chart-region-4",
  other: "stroke-chart-region-other",
};
const SWATCH: Record<RegionTone, string> = {
  "region-1": "bg-chart-region-1",
  "region-2": "bg-chart-region-2",
  "region-3": "bg-chart-region-3",
  "region-4": "bg-chart-region-4",
  other: "bg-chart-region-other",
};

export interface RegionArea {
  id: string;
  name: string;
  tone: RegionTone;
}

/** A polygon of one area. */
export interface RegionTile {
  id: string;
  poly: readonly RegionPoint[];
}

/** A stretch of the bottom edge one area holds, from `from` to `to` along x. */
export interface RegionEdge {
  id: string;
  from: number;
  to: number;
}

/** Words drawn on the map over the drawing, in HTML so a figure among them keeps its order on every browser and opens its source:
 *  `text` is what they say, for their measure, and `node` how they are written (the text itself where none is given). */
export interface RegionWords {
  text: string;
  node?: ReactNode;
}

/** A guide from the marked point to a border along one axis, ending in a dot with its words. */
export interface RegionGuide {
  axis: "x" | "y";
  at: number;
  label: RegionWords;
}

const TOP = 12;
const BOTTOM = 30;
const RIGHT = 16;
/** The bottom edge's line: thick, so a value with no range still reads as a mark of its own. */
const EDGE_PX = 6;
/** A finger's or a pointer's reach around a point: the site's touch size, 44 px across. */
const REACH = 22;

/** The point under a pointer event, in the plot's units, held inside the plot. */
function pointOf(e: PointerEvent<SVGSVGElement>, x: (px: number) => number, y: (px: number) => number): RegionPoint {
  const box = e.currentTarget.getBoundingClientRect();
  return [x(e.clientX - box.left), y(e.clientY - box.top)];
}

/** Whether a point is inside a polygon (even-odd). */
function inside(p: RegionPoint, poly: readonly RegionPoint[]): boolean {
  let hit = false;
  poly.forEach(([xi, yi], i) => {
    const [xj, yj] = poly[(i + poly.length - 1) % poly.length] ?? [xi, yi];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) hit = !hit;
  });
  return hit;
}

/** A box of words over the map, in px from the map's left and top. */
type Box = { x: number; y: number; w: number; h: number };

/** Where a border bends by more than this, the curve breaks there, so a real corner stays a corner. */
const CORNER = Math.PI / 5;

export function RegionMap({
  max,
  areas,
  tiles,
  borders,
  edge,
  edgeLabel,
  mark,
  guides,
  xTitle,
  yTitle,
  xTick,
  yTick,
  snap,
  renderTip,
  renderBelow,
}: {
  /** The plot runs from 0 to `max` on each axis. */
  max: { x: number; y: number };
  /** Every area, in the legend's order. */
  areas: RegionArea[];
  tiles: readonly RegionTile[];
  borders: readonly { points: readonly RegionPoint[] }[];
  /** The bottom edge's value: the area that holds along each stretch of it, and its words above it. */
  edge: readonly RegionEdge[];
  edgeLabel: (id: string) => RegionWords;
  /** The reader's own point, and its words under it. */
  mark: { at: RegionPoint; label: RegionWords };
  guides: readonly RegionGuide[];
  xTitle: string;
  yTitle: string;
  xTick: (v: number) => string;
  yTick: (v: number) => string;
  /** The steps a read point is rounded to, on each axis, so a reading names round amounts. */
  snap: { x: number; y: number };
  /** What a point holds, in the box that follows the pointer; `null` reads the marked point. */
  renderTip: (p: RegionPoint | null) => ReactNode;
  /** The reading under the map, of the kept point, or the marked one while none is kept; one height in every state. */
  renderBelow: (p: RegionPoint | null) => ReactNode;
}) {
  const [ref, w] = useWidth(600);
  const clip = useId();
  const pick = useChartPick();
  const [hover, setHover] = useState<{ p: RegionPoint; onMark: boolean } | null>(null);
  const [pinned, setPinned] = useState<RegionPoint | null>(null);
  const pressed = useRef<{ x: number; y: number; type: string } | null>(null);
  const tone = new Map(areas.map((a) => [a.id, a.tone]));
  const toneOf = (id: string): RegionTone => tone.get(id) ?? "other";

  // the plot: the y axis's figures measured at its start (chart-text.ts), the axis titles above and under it
  const narrow = w < 520;
  const height = narrow ? 400 : Math.min(500, Math.max(380, Math.round(w * 0.5)));
  const yTicks = scaleLinear().domain([0, max.y]).ticks(narrow ? 4 : 6);
  const left = 10 + Math.ceil(Math.max(...yTicks.map((t) => chartTextWidth(yTick(t))), chartTextWidth(xTick(0)) / 2));
  // the x axis's ticks: as many clean values as fit with room between their words, measured (chart-text.ts)
  const widest = (ts: number[]) => Math.max(0, ...ts.map((t) => chartTextWidth(xTick(t))));
  const roomFor = (ts: number[]) => ts.length < 2 || ((w - left - RIGHT) / (ts.length - 1)) > widest(ts) + 16;
  const xTicks = [6, 5, 4, 3, 2].map((n) => scaleLinear().domain([0, max.x]).ticks(n)).find(roomFor) ?? [0, max.x];
  const lastHalf = chartTextWidth(xTick(xTicks.at(-1) ?? max.x)) / 2;
  const right = w - Math.max(RIGHT, Math.ceil(lastHalf) + 4);
  const bottom = height - BOTTOM;
  const sx = scaleLinear().domain([0, max.x]).range([left, right]);
  const sy = scaleLinear().domain([0, max.y]).range([bottom, TOP]);
  const fromPx = (px: number) => Math.min(max.x, Math.max(0, sx.invert(px)));
  const fromPy = (py: number) => Math.min(max.y, Math.max(0, sy.invert(py)));
  const round = (p: RegionPoint): RegionPoint => [Math.round(p[0] / snap.x) * snap.x, Math.round(p[1] / snap.y) * snap.y];
  const poly = (pts: readonly RegionPoint[]) => `M${pts.map(([a, b]) => `${sx(a).toFixed(1)} ${sy(b).toFixed(1)}`).join("L")}Z`;

  // each area as one path of its polygons, stroked in its own colour so no seam shows between two of them
  const byArea = new Map<string, string[]>();
  for (const t of tiles) byArea.set(t.id, [...(byArea.get(t.id) ?? []), poly(t.poly)]);
  const areaAt = (p: RegionPoint) => tiles.find((t) => inside(p, t.poly))?.id ?? null;

  // a border as smooth curves through its points, broken where it bends sharply (a real corner in the prices)
  const curve = d3line<RegionPoint>()
    .x((p) => sx(p[0]))
    .y((p) => sy(p[1]))
    .curve(curveCatmullRom.alpha(0.5));
  const borderPaths = borders.flatMap((b) => {
    const pts = b.points;
    const runs: RegionPoint[][] = [];
    let run: RegionPoint[] = [];
    pts.forEach((c, k) => {
      run.push(c);
      const a = pts[k - 1];
      const d = pts[k + 1];
      if (!a || !d) return;
      const t1 = Math.atan2(sy(c[1]) - sy(a[1]), sx(c[0]) - sx(a[0]));
      const t2 = Math.atan2(sy(d[1]) - sy(c[1]), sx(d[0]) - sx(c[0]));
      const turn = Math.abs(Math.atan2(Math.sin(t2 - t1), Math.cos(t2 - t1)));
      if (turn > CORNER) {
        runs.push(run);
        run = [c];
      }
    });
    runs.push(run);
    return runs.filter((r) => r.length > 1).map((r) => curve(r) ?? "");
  });

  // the guides' ends and words: each dot's words beside it, on the side with room
  const mx = sx(mark.at[0]);
  const my = sy(mark.at[1]);
  // the words over the map, each placed clear of those placed before it: the bottom edge's, then the mark's, then each guide's; a box
  // tries its places in order and takes the first inside the plot that meets none, else the one that meets least
  const LINE = 20;
  const meets = (a: Box, b: Box) => a.x < b.x + b.w + 6 && b.x < a.x + a.w + 6 && a.y < b.y + b.h && b.y < a.y + a.h;
  const overlap = (a: Box, b: Box) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const fits = (b: Box) => b.x >= left && b.x + b.w <= right && b.y >= TOP && b.y + b.h <= bottom - EDGE_PX;
  const placed: Box[] = [];
  const clearOf = (tries: Box[]) => tries.find((b) => fits(b) && !placed.some((t) => meets(b, t)));
  const place = (tries: Box[]): Box => {
    const cost = (b: Box) => placed.reduce((n, t) => n + overlap(b, t), 0) + (fits(b) ? 0 : 1e6);
    const got = clearOf(tries) ?? [...tries].sort((x, y) => cost(x) - cost(y))[0] ?? { x: left, y: TOP, w: 0, h: 0 };
    placed.push(got);
    return got;
  };
  // the bottom edge's words, over its longest stretch, ending at the stretch's right end, on one line; where they do not fit there, they
  // stand under the map, after a piece of the edge's line
  const longest = [...edge].sort((a, b) => b.to - b.from - (a.to - a.from))[0];
  const edgeWords = longest ? edgeLabel(longest.id) : null;
  const edgeTw = edgeWords ? chartTextWidth(edgeWords.text) : 0;
  const edgeInside = longest ? clearOf([{ x: Math.max(left + 4, Math.min(right - 4, sx(longest.to) - 4) - edgeTw), y: bottom - EDGE_PX - 6 - LINE, w: edgeTw, h: LINE }]) : undefined;
  if (edgeInside) placed.push(edgeInside);
  // the mark's words: under the dot, else over it beside its vertical guide, else beside the dot
  const markTw = chartTextWidth(mark.label.text);
  const markBox = place([
    { x: Math.min(right - markTw - 4, Math.max(left + 4, mx - markTw / 2)), y: my + 10, w: markTw, h: LINE },
    { x: mx + 8, y: my - 26, w: markTw, h: LINE },
    { x: mx - 8 - markTw, y: my - 26, w: markTw, h: LINE },
    { x: mx + 12, y: my + 4, w: markTw, h: LINE },
    { x: mx - 12 - markTw, y: my + 4, w: markTw, h: LINE },
  ]);
  // each guide's dot and its words beside it: over the dashed line or under it, after the dot or before it
  const guideDraw = guides.map((g) => {
    const gx = g.axis === "x" ? sx(g.at) : mx;
    const gy = g.axis === "x" ? my : sy(g.at);
    const tw = chartTextWidth(g.label.text);
    const box = place(
      g.axis === "x"
        ? [gy - 24, gy + 4, gy - 46].flatMap((y) => [{ x: gx + 8, y, w: tw, h: LINE }, { x: gx - 8 - tw, y, w: tw, h: LINE }])
        : [{ x: gx + 8, y: gy - 10, w: tw, h: LINE }, { x: gx - 8 - tw, y: gy - 10, w: tw, h: LINE }, { x: gx + 8, y: gy - 30, w: tw, h: LINE }],
    );
    return { g, gx, gy, box };
  });
  const words = placed;
  // an area's name where it has the most room: the middle of its whole cells farthest from any border, the plot's edges and the mark
  const obstacles: [number, number][] = [
    ...borders.flatMap((b) => b.points.map((p) => [sx(p[0]), sy(p[1])] as [number, number])),
    [sx(mark.at[0]), sy(mark.at[1])],
    ...guides.map((g) => (g.axis === "x" ? [sx(g.at), sy(mark.at[1])] : [sx(mark.at[0]), sy(g.at)]) as [number, number]),
  ];
  const names = areas.flatMap((a) => {
    const tw = chartTextWidth(a.name, 16);
    let best: { x: number; y: number; room: number } | null = null;
    for (const t of tiles) {
      if (t.id !== a.id || t.poly.length !== 4) continue;
      const cx0 = t.poly.reduce((s, p) => s + sx(p[0]), 0) / 4;
      const cy0 = t.poly.reduce((s, p) => s + sy(p[1]), 0) / 4;
      const toEdge = Math.min((cx0 - left - tw / 2) * 2, (right - cx0 - tw / 2) * 2, cy0 - TOP - 12, bottom - EDGE_PX - 24 - cy0);
      const toMark = Math.min(...obstacles.map(([ox, oy]) => Math.max(Math.abs(ox - cx0) - tw / 2, Math.abs(oy - cy0) - 10) * 1.5));
      // a name never meets the words drawn over the map (a name's box, 16 px type on a 24 px line)
      const box = { x: cx0 - tw / 2 - 4, y: cy0 - 14, w: tw + 8, h: 24 };
      if (words.some((b) => meets(box, b))) continue;
      const room = Math.min(toEdge, toMark);
      if (!best || room > best.room) best = { x: cx0, y: cy0, room };
    }
    return best && best.room > 4 ? [{ a, x: best.x, y: best.y }] : [];
  });

  const set = (p: RegionPoint | null) => setPinned(p);
  const onMarkAt = (px: number, py: number) => Math.hypot(px - mx, py - my) <= REACH;
  const onPinAt = (px: number, py: number) => !!pinned && Math.hypot(px - sx(pinned[0]), py - sy(pinned[1])) <= REACH;
  const step = (e: KeyboardEvent<HTMLDivElement>) => {
    const k = e.key;
    if (k === "Escape") {
      if (pinned) {
        set(null);
        e.preventDefault();
      }
      return;
    }
    const dx = k === "ArrowRight" ? 1 : k === "ArrowLeft" ? -1 : 0;
    const dy = k === "ArrowUp" ? 1 : k === "ArrowDown" ? -1 : 0;
    if (!dx && !dy) return;
    e.preventDefault();
    const from = pinned ?? round(mark.at);
    const n = e.shiftKey ? 10 : 1;
    set([Math.min(max.x, Math.max(0, from[0] + dx * n * snap.x)), Math.min(max.y, Math.max(0, from[1] + dy * n * snap.y))]);
  };

  const lit = hover && !hover.onMark ? areaAt(hover.p) : null;
  const shownTip = hover ? (hover.onMark ? null : hover.p) : undefined;
  const tipAt = hover ? (hover.onMark ? mark.at : hover.p) : null;
  const pinX = pinned ? sx(pinned[0]) : 0;
  const pinY = pinned ? sy(pinned[1]) : 0;

  return (
    <div className="flex flex-col gap-2">
      <ChartLegend items={areas.map((a) => ({ id: a.id, swatch: <Swatch shape="box" className={SWATCH[a.tone]} />, label: a.name }))} pick={pick} />
      {/* the y axis's name over its figures, at the plot's left edge, as the axis reads left to right */}
      <p dir="ltr" className="text-xs text-muted-foreground">
        <bdi dir="rtl">{yTitle}</bdi>
      </p>
      <div
        ref={ref}
        dir="ltr"
        tabIndex={0}
        onKeyDown={step}
        className="relative select-none rounded-md outline-none focus-visible:outline-2 focus-visible:outline-ring"
      >
        <svg
          width={w}
          height={height}
          aria-hidden="true"
          className="block touch-pan-y cursor-crosshair"
          onPointerMove={(e) => {
            if (e.pointerType !== "mouse") return;
            const box = e.currentTarget.getBoundingClientRect();
            const px = e.clientX - box.left;
            const py = e.clientY - box.top;
            setHover({ p: round(pointOf(e, fromPx, fromPy)), onMark: onMarkAt(px, py) });
          }}
          onPointerLeave={() => setHover(null)}
          onPointerDown={(e) => {
            const box = e.currentTarget.getBoundingClientRect();
            pressed.current = { x: e.clientX - box.left, y: e.clientY - box.top, type: e.pointerType };
          }}
          onClick={(e) => {
            const box = e.currentTarget.getBoundingClientRect();
            const px = e.clientX - box.left;
            const py = e.clientY - box.top;
            const p = pressed.current;
            pressed.current = null;
            // a finger that moved was scrolling the page
            if (p && p.type !== "mouse" && Math.hypot(p.x - px, p.y - py) > 10) return;
            if (px < left - REACH || px > right + REACH || py < TOP - REACH || py > bottom + REACH) return;
            if (onPinAt(px, py)) set(null);
            else set(onMarkAt(px, py) ? round(mark.at) : round([fromPx(px), fromPy(py)]));
          }}
        >
          <defs>
            <clipPath id={clip}>
              <rect x={left} y={TOP} width={right - left} height={bottom - TOP} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clip})`}>
            {areas.map((a) => (
              <path key={a.id} d={(byArea.get(a.id) ?? []).join("")} className={cx(FILL[a.tone], STROKE[a.tone], pickDim(pick.active, a.id))} strokeWidth={1} strokeLinejoin="round" data-mark="area" />
            ))}
            {lit && <path d={(byArea.get(lit) ?? []).join("")} className="fill-foreground pointer-events-none" fillOpacity={0.28} />}
            {borderPaths.map((d, k) => (
              <path key={k} d={d} fill="none" className="stroke-chart-region-ink pointer-events-none" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            ))}
          </g>
          {/* the bottom edge: no range above it, one value, its own line */}
          {edge.map((s) => (
            <line key={`${s.id}-${s.from}`} x1={sx(s.from)} x2={sx(s.to)} y1={bottom - EDGE_PX / 2} y2={bottom - EDGE_PX / 2} className={cx(STROKE[toneOf(s.id)], pickDim(pick.active, s.id))} strokeWidth={EDGE_PX} data-mark="edge" />
          ))}
          {edge.length > 0 && <line x1={left} x2={right} y1={bottom - EDGE_PX - 0.5} y2={bottom - EDGE_PX - 0.5} className="stroke-chart-region-ink" strokeWidth={1} />}
          {edge.slice(1).map((s) => (
            <line key={`cut-${s.from}`} x1={sx(s.from)} x2={sx(s.from)} y1={bottom - EDGE_PX - 2} y2={bottom} className="stroke-chart-region-ink" strokeWidth={2} />
          ))}
          {/* the axes: ticks at clean values, each axis's title */}
          {yTicks.map((t) => (
            <text key={`y${t}`} x={left - 8} y={sy(t) + 4} textAnchor="end" className="fill-chart-text text-xs tabular-nums">
              {yTick(t)}
            </text>
          ))}
          {xTicks.map((t) => (
            <text key={`x${t}`} x={sx(t)} y={bottom + 20} textAnchor="middle" className="fill-chart-text text-xs tabular-nums">
              {xTick(t)}
            </text>
          ))}
          {/* the names inside their areas: a pointer on one sets its area apart */}
          {names.map((n) => (
            <text key={n.a.id} x={n.x} y={n.y + 5} textAnchor="middle" {...pick.bind(n.a.id)} className="fill-chart-region-ink text-base font-semibold cursor-pointer">
              {n.a.name}
            </text>
          ))}
          {/* the guides from the mark, and the mark itself on top */}
          {guideDraw.map(({ g, gx, gy }) => (
            <g key={g.axis} className="pointer-events-none">
              <line x1={mx} y1={my} x2={gx} y2={gy} className="stroke-chart-region-ink" strokeWidth={1.5} strokeDasharray="4 3" />
              <circle cx={gx} cy={gy} r={4} className="fill-chart-region-ink" />
            </g>
          ))}
          <circle cx={mx} cy={my} r={6.5} className="fill-card stroke-chart-region-ink pointer-events-none" strokeWidth={2.5} />
          <circle cx={mx} cy={my} r={2.5} className="fill-foreground pointer-events-none" />
          {pinned && (
            <g className="pointer-events-none">
              <circle cx={pinX} cy={pinY} r={7} className="fill-chart-region-ink" fillOpacity={0.25} />
              <circle cx={pinX} cy={pinY} r={4} className="fill-chart-region-ink stroke-card" strokeWidth={1.5} />
            </g>
          )}
        </svg>
        {/* the words on the map: in HTML over the drawing, each in its box beside what it names */}
        {guideDraw.map(({ g, box }) => (
          <Words key={g.axis} box={box} words={g.label} />
        ))}
        <Words box={markBox} words={mark.label} />
        {edgeWords && edgeInside && <Words box={edgeInside} words={edgeWords} />}
        {tipAt && (
          <ChartTip x={sx(tipAt[0])} width={w} near={{ y: sy(tipAt[1]), bottom: height }}>
            {renderTip(shownTip ?? null)}
          </ChartTip>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground" style={{ paddingLeft: left }}>
        {xTitle}
      </p>
      {edgeWords && longest && !edgeInside && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={cx("h-1.5 w-4 shrink-0 rounded-sm", SWATCH[toneOf(longest.id)])} />
          {edgeWords.node ?? edgeWords.text}
        </p>
      )}
      {renderBelow(pinned)}
    </div>
  );
}

/** The class of an area's swatch outside the map (a reading's row). */
export const regionSwatch = (t: RegionTone): string => SWATCH[t];

/** The tones in the order they are given out: the first four areas each their own, the rest gathered. */
export const regionTones = (n: number): RegionTone[] => Array.from({ length: n }, (_, k) => (k < 4 ? (`region-${k + 1}` as RegionTone) : "other"));

/** Words over the map in their box, in the dark ink the light areas take. */
function Words({ box, words }: { box: Box; words: RegionWords }) {
  return (
    <span dir="rtl" className="absolute whitespace-nowrap text-xs leading-5 font-semibold text-chart-region-ink" style={{ left: box.x, top: box.y }}>
      {words.node ?? words.text}
    </span>
  );
}
