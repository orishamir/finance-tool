// A map of areas over two amounts: which of a few options leads at each point of a plane, and by how much. Each point is filled with the
// colour of the option that leads there, blended with the next one's where the two are close: half and half where they are equal, the
// leader's own colour once it is clearly ahead, so between two areas runs a soft band, not a line. The fill is a small grid of colours the
// browser scales up smoothly (a canvas), so the band has no steps on any screen. Each area's name stands inside it, and words of the caller's
// in the band where they fit; a marked point (the reader's own) has dashed guides from it along each axis; and a value of the bottom edge
// is drawn apart as a thick line, blended the same way. The x axis grows left to right and the y axis up from 0 (charts.md).
// The pointer reads any point: on a computer a box follows it and the area under it lightens; a click or a tap keeps a point (its mark stays,
// and the reading under the map is that point's), a second one elsewhere moves it, and a tap on it or Escape lets it go. The map takes the
// focus, and the arrow keys move the kept point (from the marked one; with Shift in larger steps). A legend item or an area's name sets that
// area apart while pointed at, and keeps it on a click or a tap, without keeping a point.
// The caller gives who leads at each node of an even grid and says what a reading holds; the piece draws and answers the pointer.
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { scaleLinear } from "d3-scale";
import { pickDim, useChartPick, ChartTip } from "./chart-interact";
import { ChartLegend, Swatch } from "./chart-parts";
import { chartTextWidth } from "./chart-text";
import { cx } from "./cx";
import { useWidth } from "./marker";

/** A point of the plot, in its own units. */
export type RegionPoint = readonly [x: number, y: number];

/** An area's colour, in the order the areas are given out; `other` is the grey for what is past the fourth. */
export type RegionTone = "region-1" | "region-2" | "region-3" | "region-4" | "other";

const SWATCH: Record<RegionTone, string> = {
  "region-1": "bg-chart-region-1",
  "region-2": "bg-chart-region-2",
  "region-3": "bg-chart-region-3",
  "region-4": "bg-chart-region-4",
  other: "bg-chart-region-other",
};
/** The colour as text, read back from the page to paint the canvas, which takes no CSS variable. */
const INK: Record<RegionTone, string> = {
  "region-1": "text-chart-region-1",
  "region-2": "text-chart-region-2",
  "region-3": "text-chart-region-3",
  "region-4": "text-chart-region-4",
  other: "text-chart-region-other",
};
/** A reading's row set apart in its area's colour: a light wash of it behind the row. */
const WASH: Record<RegionTone, string> = {
  "region-1": "bg-chart-region-1/20",
  "region-2": "bg-chart-region-2/20",
  "region-3": "bg-chart-region-3/20",
  "region-4": "bg-chart-region-4/20",
  other: "bg-chart-region-other/20",
};

export interface RegionArea {
  id: string;
  name: string;
  tone: RegionTone;
}

/**
 * Who leads at each node of an even grid, row by row from the bottom, left to right: the index in the areas of the one that leads (`first`)
 * and of the next (`second`, -1 where it does not show), and how far ahead the first is, from 0 (equal) to 1 (clearly ahead).
 */
export interface RegionGrid {
  cols: number;
  rows: number;
  first: readonly number[];
  second: readonly number[];
  ahead: readonly number[];
}

/** Words drawn on the map over the drawing, in HTML so a figure among them keeps its order on every browser and opens its source:
 *  `text` is what they say, for their measure, and `node` how they are written (the text itself where none is given). */
export interface RegionWords {
  text: string;
  node?: ReactNode;
}

/** A guide from the marked point along one axis, ending in a dot with its words. */
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
/** How much an area is lightened under the pointer, and how far a set-back area fades into the card. */
const LIT = 0.28;
const DIMMED = 0.75;
/** A name stands where its area leads at least this far ahead, and the band's words where the two are at most this far apart. */
const CLEAR = 0.9;
const BAND = 0.6;
/** A line of the words over the map. */
const LINE = 20;

/** A box of words over the map, in px from the map's left and top. */
type Box = { x: number; y: number; w: number; h: number };
type Rgb = [number, number, number];

const mixRgb = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** Each class's text colour on this page, as the canvas paints it: read from an element, then through a pixel of a canvas, which takes any
 *  CSS colour the browser knows (oklch among them) and gives it back in sRGB. */
function coloursOf(host: HTMLElement, classes: readonly string[]): Rgb[] {
  const px = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  return classes.map((cls) => {
    const el = document.createElement("span");
    el.className = cls;
    host.appendChild(el);
    const css = getComputedStyle(el).color;
    el.remove();
    if (!px) return [128, 128, 128];
    px.clearRect(0, 0, 1, 1);
    px.fillStyle = css;
    px.fillRect(0, 0, 1, 1);
    const [r = 128, g = 128, b = 128] = px.getImageData(0, 0, 1, 1).data;
    return [r, g, b];
  });
}

/** Paints a grid into a canvas a pixel a node, the top row last (the grid's first row is its bottom): each node the blend of its two. */
function paint(canvas: HTMLCanvasElement, grid: RegionGrid, colour: (area: number) => Rgb, empty: Rgb) {
  canvas.width = grid.cols;
  canvas.height = grid.rows;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const img = ctx.createImageData(grid.cols, grid.rows);
  for (let j = 0; j < grid.rows; j++)
    for (let i = 0; i < grid.cols; i++) {
      const k = j * grid.cols + i;
      const f = grid.first[k] ?? -1;
      const s = grid.second[k] ?? -1;
      const lead = f < 0 ? empty : colour(f);
      const c = s < 0 || f < 0 ? lead : mixRgb(colour(s), lead, 0.5 + 0.5 * (grid.ahead[k] ?? 1));
      const o = ((grid.rows - 1 - j) * grid.cols + i) * 4;
      img.data[o] = c[0];
      img.data[o + 1] = c[1];
      img.data[o + 2] = c[2];
      img.data[o + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
}

export function RegionMap({
  max,
  areas,
  field,
  edge,
  edgeLabel,
  bandLabel,
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
  /** Who leads over the plane: its columns from 0 to `max.x`, its rows from `from` to `max.y` (under `from` is the bottom edge's). */
  field: RegionGrid & { from: number };
  /** The bottom edge's value, one row from 0 to `max.x`, and the words over its longest clear stretch. */
  edge: RegionGrid;
  edgeLabel: (id: string) => RegionWords;
  /** Words for the band where two areas are close, drawn inside it where they fit. */
  bandLabel: string;
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
  /** The reading under the map, of the kept point, or the marked one while none is kept; one height in every state. Called again only when
   *  the kept point or the function changes. */
  renderBelow: (p: RegionPoint | null) => ReactNode;
}) {
  const [ref, w] = useWidth(600);
  const plane = useRef<HTMLCanvasElement>(null);
  const line = useRef<HTMLCanvasElement>(null);
  const clip = useId();
  const pick = useChartPick();
  const [hover, setHover] = useState<{ p: RegionPoint; onMark: boolean } | null>(null);
  const [pinned, setPinned] = useState<RegionPoint | null>(null);
  const pressed = useRef<{ x: number; y: number; type: string } | null>(null);

  // the plot: the y axis's figures measured at its start (chart-text.ts), the axis titles above and under it
  const narrow = w < 520;
  const height = narrow ? 400 : Math.min(500, Math.max(380, Math.round(w * 0.5)));
  const yTicks = scaleLinear().domain([0, max.y]).ticks(narrow ? 4 : 6);
  const left = 10 + Math.ceil(Math.max(...yTicks.map((t) => chartTextWidth(yTick(t))), chartTextWidth(xTick(0)) / 2));
  // the x axis's ticks: as many clean values as fit with room between their words, measured (chart-text.ts)
  const widest = (ts: number[]) => Math.max(0, ...ts.map((t) => chartTextWidth(xTick(t))));
  const roomFor = (ts: number[]) => ts.length < 2 || (w - left - RIGHT) / (ts.length - 1) > widest(ts) + 16;
  const xTicks = [6, 5, 4, 3, 2].map((n) => scaleLinear().domain([0, max.x]).ticks(n)).find(roomFor) ?? [0, max.x];
  const lastHalf = chartTextWidth(xTick(xTicks.at(-1) ?? max.x)) / 2;
  const right = w - Math.max(RIGHT, Math.ceil(lastHalf) + 4);
  const bottom = height - BOTTOM;
  const sx = scaleLinear().domain([0, max.x]).range([left, right]);
  const sy = scaleLinear().domain([0, max.y]).range([bottom, TOP]);
  const fromPx = (px: number) => Math.min(max.x, Math.max(0, sx.invert(px)));
  const fromPy = (py: number) => Math.min(max.y, Math.max(0, sy.invert(py)));
  const round = (p: RegionPoint): RegionPoint => [Math.round(p[0] / snap.x) * snap.x, Math.round(p[1] / snap.y) * snap.y];

  // the node of the field nearest a point, and of the edge
  const nodeAt = (p: RegionPoint): number => {
    const i = Math.round((p[0] / max.x) * (field.cols - 1));
    const j = Math.round(((p[1] - field.from) / (max.y - field.from)) * (field.rows - 1));
    return Math.min(field.rows - 1, Math.max(0, j)) * field.cols + Math.min(field.cols - 1, Math.max(0, i));
  };
  const areaAt = (p: RegionPoint): number | null => {
    const f = p[1] < field.from ? edge.first[Math.round((p[0] / max.x) * (edge.cols - 1))] : field.first[nodeAt(p)];
    return f === undefined || f < 0 ? null : f;
  };

  const lit = hover && !hover.onMark ? areaAt(hover.p) : null;
  const active = pick.active === null ? -1 : areas.findIndex((a) => a.id === pick.active);
  // the canvases, painted again when the field, the area set apart or the one under the pointer changes; each colour read from the page
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const [card = [0, 0, 0], light = [255, 255, 255], ...tones] = coloursOf(host, ["text-card", "text-foreground", ...areas.map((a) => INK[a.tone])]);
    const colour = (k: number): Rgb => {
      const c = tones[k] ?? card;
      if (active >= 0 && k !== active) return mixRgb(c, card, DIMMED);
      return k === lit ? mixRgb(c, light, LIT) : c;
    };
    if (plane.current) paint(plane.current, field, colour, card);
    if (line.current) paint(line.current, edge, colour, card);
  }, [ref, areas, field, edge, active, lit]);

  const mx = sx(mark.at[0]);
  const my = sy(mark.at[1]);
  // the words over the map and where they stand: worked out again only when the map or its size changes, the names' and the band's places
  // being a search over the plot
  const layout = useMemo(() => {
    const sxL = scaleLinear().domain([0, max.x]).range([left, right]);
    const syL = scaleLinear().domain([0, max.y]).range([bottom, TOP]);
    const mxL = sxL(mark.at[0]);
    const myL = syL(mark.at[1]);
    const meets = (a: Box, b: Box) => a.x < b.x + b.w + 6 && b.x < a.x + a.w + 6 && a.y < b.y + b.h && b.y < a.y + a.h;
    const overlap = (a: Box, b: Box) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    const fits = (b: Box) => b.x >= left && b.x + b.w <= right && b.y >= TOP && b.y + b.h <= bottom - EDGE_PX;

    // the bottom edge's clear stretches: runs of nodes one area leads clearly
    const runs: { area: number; from: number; to: number; last: number }[] = [];
    edge.first.forEach((f, i) => {
      const x = (max.x * i) / (edge.cols - 1);
      const last = runs.at(-1);
      if (f < 0 || (edge.ahead[i] ?? 0) < CLEAR) return;
      if (last && last.area === f && last.last === i - 1) {
        last.to = x;
        last.last = i;
      } else runs.push({ area: f, from: x, to: x, last: i });
    });
    const longest = [...runs].sort((a, b) => b.to - b.from - (a.to - a.from))[0];
    const longestArea = longest ? areas[longest.area] : undefined;
    const edgeWords = longestArea ? edgeLabel(longestArea.id) : null;

    // the words, each placed clear of those placed before it: the bottom edge's, then the mark's, then each guide's; a box tries its places
    // in order and takes the first inside the plot that meets none, else the one that meets least
    const placed: Box[] = [];
    const clearOf = (tries: Box[]) => tries.find((b) => fits(b) && !placed.some((t) => meets(b, t)));
    const place = (tries: Box[]): Box => {
      const cost = (b: Box) => placed.reduce((n, t) => n + overlap(b, t), 0) + (fits(b) ? 0 : 1e6);
      const got = clearOf(tries) ?? [...tries].sort((x, y) => cost(x) - cost(y))[0] ?? { x: left, y: TOP, w: 0, h: 0 };
      placed.push(got);
      return got;
    };
    // the bottom edge's words, over its longest clear stretch, ending at the stretch's right end, on one line; where they do not fit there,
    // they stand under the map, after a piece of the edge's line
    const edgeTw = edgeWords ? chartTextWidth(edgeWords.text) : 0;
    const edgeInside = longest ? clearOf([{ x: Math.max(left + 4, Math.min(right - 4, sxL(longest.to) - 4) - edgeTw), y: bottom - EDGE_PX - 6 - LINE, w: edgeTw, h: LINE }]) : undefined;
    if (edgeInside) placed.push(edgeInside);
    // the mark's words: under the dot, else over it beside its vertical guide, else beside the dot
    const markTw = chartTextWidth(mark.label.text);
    const markBox = place([
      { x: Math.min(right - markTw - 4, Math.max(left + 4, mxL - markTw / 2)), y: myL + 10, w: markTw, h: LINE },
      { x: mxL + 8, y: myL - 26, w: markTw, h: LINE },
      { x: mxL - 8 - markTw, y: myL - 26, w: markTw, h: LINE },
      { x: mxL + 12, y: myL + 4, w: markTw, h: LINE },
      { x: mxL - 12 - markTw, y: myL + 4, w: markTw, h: LINE },
    ]);
    // each guide's dot and its words beside it: over the dashed line or under it, after the dot or before it
    const guideDraw = guides.map((g) => {
      const gx = g.axis === "x" ? sxL(g.at) : mxL;
      const gy = g.axis === "x" ? myL : syL(g.at);
      const tw = chartTextWidth(g.label.text);
      const box = place(
        g.axis === "x"
          ? [gy - 24, gy + 4, gy - 46].flatMap((y) => [{ x: gx + 8, y, w: tw, h: LINE }, { x: gx - 8 - tw, y, w: tw, h: LINE }])
          : [{ x: gx + 8, y: gy - 10, w: tw, h: LINE }, { x: gx - 8 - tw, y: gy - 10, w: tw, h: LINE }, { x: gx + 8, y: gy - 30, w: tw, h: LINE }],
      );
      return { g, gx, gy, box };
    });

    // each area's name, and the band's words, where they have the most room: a box whose every sampled point the area leads clearly (or,
    // for the band, where the two are close), clear of the words above, as far as it can be from the mark and the guides' dots
    const node = (px: number, py: number) => {
      const i = Math.round((sxL.invert(px) / max.x) * (field.cols - 1));
      const j = Math.round(((syL.invert(py) - field.from) / (max.y - field.from)) * (field.rows - 1));
      return i < 0 || j < 0 || i >= field.cols || j >= field.rows ? -1 : j * field.cols + i;
    };
    const holds = (b: Box, ok: (k: number) => boolean) => {
      for (let a = 0; a <= 4; a++)
        for (let c = 0; c <= 2; c++) {
          const k = node(b.x + (b.w * a) / 4, b.y + (b.h * c) / 2);
          if (k < 0 || !ok(k)) return false;
        }
      return true;
    };
    const dots: [number, number][] = [[mxL, myL], ...guideDraw.map(({ gx, gy }) => [gx, gy] as [number, number])];
    const taken: Box[] = [...placed];
    const find = (tw: number, h: number, ok: (k: number) => boolean): Box | null => {
      let best: { b: Box; room: number } | null = null;
      for (let cy = TOP + h / 2 + 4; cy <= bottom - EDGE_PX - h / 2 - 4; cy += 8)
        for (let cx0 = left + tw / 2 + 8; cx0 <= right - tw / 2 - 8; cx0 += 8) {
          const b = { x: cx0 - tw / 2 - 4, y: cy - h / 2, w: tw + 8, h };
          if (!holds(b, ok) || taken.some((t) => meets(b, t))) continue;
          // the room: how far the box grows before it leaves its area, and how far it is from the mark and the guides' dots
          let grow = 0;
          for (const g of [6, 12, 20]) if (holds({ x: b.x - g, y: b.y - g / 2, w: b.w + 2 * g, h: b.h + g }, ok)) grow = g;
          const far = Math.min(40, ...dots.map(([px, py]) => Math.max(Math.abs(px - cx0) - tw / 2, Math.abs(py - cy) - h / 2)));
          if (far < 8) continue;
          const room = grow + far;
          if (!best || room > best.room) best = { b, room };
        }
      if (best) taken.push(best.b);
      return best?.b ?? null;
    };
    const names = areas.flatMap((a, n) => {
      const b = find(chartTextWidth(a.name, 16), 24, (k) => field.first[k] === n && (field.ahead[k] ?? 0) >= CLEAR);
      return b ? [{ a, b }] : [];
    });
    // the band's words: once in each band between two areas
    const pairOf = (k: number) => {
      const f = field.first[k] ?? -1;
      const s = field.second[k] ?? -1;
      return s < 0 || (field.ahead[k] ?? 1) > BAND ? null : `${Math.min(f, s)}|${Math.max(f, s)}`;
    };
    const pairs = new Set(field.first.map((_, k) => pairOf(k)).filter((x): x is string => x !== null));
    const bands = [...pairs].flatMap((pair) => {
      const b = find(chartTextWidth(bandLabel), LINE, (k) => pairOf(k) === pair);
      return b ? [{ pair, b }] : [];
    });
    return { edgeWords, edgeInside, longestArea, markBox, guideDraw, names, bands };
  }, [field, edge, areas, mark, guides, bandLabel, edgeLabel, max.x, max.y, left, right, bottom]);
  const { edgeWords, edgeInside, longestArea, markBox, guideDraw } = layout;

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

  const shownTip = hover ? (hover.onMark ? null : hover.p) : undefined;
  const tipAt = hover ? (hover.onMark ? mark.at : hover.p) : null;
  const pinX = pinned ? sx(pinned[0]) : 0;
  const pinY = pinned ? sy(pinned[1]) : 0;
  const below = useMemo(() => renderBelow(pinned), [renderBelow, pinned]);
  // the canvases reach half a node past the plot on each side, so each node's colour sits on its own point and the browser's smoothing
  // runs between them; the plot clips them
  const cellX = (right - left) / (field.cols - 1);
  const cellY = (sy(field.from) - TOP) / (field.rows - 1);

  return (
    <div className="flex flex-col gap-2">
      <ChartLegend items={areas.map((a) => ({ id: a.id, swatch: <Swatch shape="box" className={SWATCH[a.tone]} />, label: a.name }))} pick={pick} />
      {/* the y axis's name over its figures, at the plot's left edge, as the axis reads left to right */}
      <p dir="ltr" className="text-xs text-muted-foreground">
        <bdi dir="rtl">{yTitle}</bdi>
      </p>
      <div ref={ref} dir="ltr" tabIndex={0} onKeyDown={step} className="relative select-none rounded-md outline-none focus-visible:outline-2 focus-visible:outline-ring" data-region-map>
        <div className="pointer-events-none absolute overflow-clip" style={{ left, top: TOP, width: right - left, height: bottom - TOP }}>
          <canvas ref={plane} className="absolute block" style={{ left: -cellX / 2, top: -cellY / 2, width: right - left + cellX, height: sy(field.from) - TOP + cellY }} data-mark="areas" />
          <canvas ref={line} className="absolute block" style={{ left: -cellX / 2, top: bottom - TOP - EDGE_PX, width: right - left + cellX, height: EDGE_PX }} data-mark="edge" />
        </div>
        <svg
          width={w}
          height={height}
          aria-hidden="true"
          className="relative block touch-pan-y cursor-crosshair"
          onPointerMove={(e: PointerEvent<SVGSVGElement>) => {
            if (e.pointerType !== "mouse") return;
            const box = e.currentTarget.getBoundingClientRect();
            const px = e.clientX - box.left;
            const py = e.clientY - box.top;
            const p = round([fromPx(px), fromPy(py)]);
            const onMark = onMarkAt(px, py);
            // a new reading only where the rounded point or the mark under the pointer changes
            if (!hover || hover.onMark !== onMark || hover.p[0] !== p[0] || hover.p[1] !== p[1]) setHover({ p, onMark });
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
            // an area's name sets its area apart (its own handler), and keeps no point
            if (e.target instanceof Element && e.target.closest("[data-region-name]")) return;
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
          {/* the bottom edge: no range above it, one value, its own line, set off from the areas by a thin rule */}
          <line x1={left} x2={right} y1={bottom - EDGE_PX - 0.5} y2={bottom - EDGE_PX - 0.5} className="stroke-chart-region-ink" strokeWidth={1} />
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
          <g clipPath={`url(#${clip})`}>
            {/* the names inside their areas: a pointer on one sets its area apart */}
            {layout.names.map(({ a, b }) => (
              <text key={a.id} x={b.x + b.w / 2} y={b.y + b.h / 2 + 5} textAnchor="middle" {...pick.bind(a.id)} data-region-name className={cx("fill-chart-region-ink text-base font-semibold cursor-pointer", pickDim(pick.active, a.id))}>
                {a.name}
              </text>
            ))}
            {layout.bands.map(({ pair, b }) => (
              <text key={pair} x={b.x + b.w / 2} y={b.y + b.h / 2 + 4} textAnchor="middle" className="fill-chart-region-ink text-xs pointer-events-none">
                {bandLabel}
              </text>
            ))}
          </g>
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
            <g className="pointer-events-none" data-mark="pin">
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
      {edgeWords && longestArea && !edgeInside && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className={cx("h-1.5 w-4 shrink-0 rounded-sm", SWATCH[longestArea.tone])} />
          {edgeWords.node ?? edgeWords.text}
        </p>
      )}
      {below}
    </div>
  );
}

/** The class of an area's swatch outside the map (a reading's row). */
export const regionSwatch = (t: RegionTone): string => SWATCH[t];

/** The class that sets a reading's row apart in its area's colour. */
export const regionWash = (t: RegionTone): string => WASH[t];

/** The tones in the order they are given out: the first four areas each their own, the rest grey. */
export const regionTones = (n: number): RegionTone[] => Array.from({ length: n }, (_, k) => (k < 4 ? (`region-${k + 1}` as RegionTone) : "other"));

/** Words over the map in their box, in the dark ink the light areas take. */
function Words({ box, words }: { box: Box; words: RegionWords }) {
  return (
    <span dir="rtl" className="absolute whitespace-nowrap text-xs leading-5 font-semibold text-chart-region-ink" style={{ left: box.x, top: box.y }}>
      {words.node ?? words.text}
    </span>
  );
}
