// A map of areas over two amounts: which of a few options leads at each point of a plane, and by how much. Each point is filled with the
// colour of the option that leads there; where two are close, a mix of their two colours that runs on across the line where they are
// equal, half and half on it and each one's own colour once one is clearly ahead: a smooth part eased narrowly towards the line, and 45°
// stripes whose width follows the lead, so the whole band where the two are close shows (`bandWeight`). The areas are a small grid of
// colours the browser scales up smoothly (a canvas); the band is a layer of its own at the screen's pixels, so its stripes stay sharp
// (`bandLayer`). Where two areas meet, the two are equal: a thin line marks it over the band, through the points where the leads either
// side cancel, found between the grid's nodes, so it runs smooth rather than along the grid's cells.
// Each area's name stands inside it, and the legend's last items say what the band means, one for each pair whose band shows; a marked
// point (the reader's own) has dashed guides from it along each axis; and a value of the bottom edge is drawn apart as a thick line in the
// smooth mix alone, each area along it named over its stretch where the words fit. The x axis grows left to right and the y axis up from 0
// (charts.md).
// The pointer reads any point: on a computer a box follows it (nothing is lit under it: the areas are a coarse grid smoothed by the browser
// under a band drawn at the screen's pixels, and lighting one area's nodes showed the grid's cells at the band's edge); a click or a tap keeps a point (its mark and
// its box stay, and the box's figures can be tapped), a second one elsewhere moves it, and a tap on it or Escape lets it go. The map takes
// the focus, and the arrow keys move the kept point (from the marked one; with Shift in larger steps). A legend item or an area's name sets
// that area apart while pointed at, and keeps it on a click or a tap, without keeping a point.
// The caller gives who leads at each node of an even grid and says what a reading holds; the piece draws and answers the pointer.
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { scaleLinear } from "d3-scale";
import { pickDim, useChartPick, ChartTip } from "./chart-interact";
import { ChartLegend, Swatch, type ReadoutRow } from "./chart-parts";
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

/** What a point holds, in its box: a head line, then a row for each option read there, the one the reading is about set apart (`wash`). */
export interface RegionReading {
  head: ReactNode;
  rows: ReadoutRow[];
}

/** A guide from the marked point along one axis to `at`, ending in a dot with its words; with no words, it runs on with no dot. */
export interface RegionGuide {
  axis: "x" | "y";
  at: number;
  label?: RegionWords;
}

const TOP = 12;
const BOTTOM = 30;
const RIGHT = 16;
/** The bottom edge's line: thick, so a value with no range still reads as a mark of its own. */
const EDGE_PX = 6;
/** The shortest guide drawn, in px: about the mark's dot across with room. */
const GUIDE_MIN = 16;
/** A finger's or a pointer's reach around a point: the site's touch size, 44 px across. */
const REACH = 22;
/** How far a set-back area fades into the card. */
const DIMMED = 0.75;
/** A name stands where its area leads by θ or more (F-80: under it the two are a tie). */
const CLEAR = 1;
/**
 * Where two areas are close (the leader's lead `s` under 1), the point is a mix of the pair's two colours, P the area earlier in the list
 * and Q the later: Q's share is half of (1 − s) where P leads and the rest where Q leads, so the mix runs on across the line where they are
 * equal with nothing swapping there, half and half on it and each one's own colour at s = 1 (`laterShare`). Of the mix, a smooth part
 * eased narrowly towards the line (`ease`) and a texture of 45° stripes, Q's where the pattern is under its share, so the stripes thin out
 * on each side as the lead grows (`bandColour`); the texture's weight and the pattern's period are the theme's.
 */
export function laterShare(first: number, second: number, ahead: number): number {
  const q2 = (1 - Math.min(1, Math.max(0, ahead))) / 2;
  return first > second ? 1 - q2 : q2;
}
/** The smooth part's ease: 0 and 1 at the ends, a half at a half, and steep around it, so the soft change stays close to the equal line. */
export const ease = (q: number): number => 0.5 + (Math.sign(q - 0.5) * Math.abs(2 * (q - 0.5)) ** 0.35) / 2;
/**
 * Q's weight in the colour at a point of the pattern (x, y in CSS px), Q's share there being `q`: the smooth part and the stripes, Q's
 * where fract((x + y) / period) is under `q`. With `pixel` (a screen pixel's size in CSS px) the stripe counts by how much of the pixel it
 * covers, so a stripe thinner than a pixel fades out with its share instead of stopping at a pixel's edge.
 */
export function bandWeight(q: number, x: number, y: number, look: { period: number; texture: number }, pixel = 0): number {
  const u = ((((x + y) % look.period) + look.period) % look.period);
  const wide = q * look.period;
  let hard: number;
  if (pixel <= 0) hard = u < wide ? 1 : 0;
  else {
    // along x + y a pixel spans `pixel` on each side of its centre; the stripes lie on [k period, k period + wide)
    const [a, b] = [u - pixel, u + pixel];
    let cover = 0;
    for (const k of [-1, 0, 1]) cover += Math.max(0, Math.min(b, k * look.period + wide) - Math.max(a, k * look.period));
    hard = Math.min(1, cover / (2 * pixel));
  }
  return (1 - look.texture) * ease(q) + look.texture * hard;
}

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

/** Paints a grid into a canvas a pixel a node, the top row last (the grid's first row is its bottom): each node its leader's colour, or with
 *  `smooth` the pair's smooth mix (the bottom edge, too thin for the stripes). */
function paint(canvas: HTMLCanvasElement, grid: RegionGrid, colour: (area: number) => Rgb, empty: Rgb, smooth: boolean) {
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
      const c = !smooth || s < 0 || f < 0 ? lead : mixRgb(colour(Math.min(f, s)), colour(Math.max(f, s)), ease(laterShare(f, s, grid.ahead[k] ?? 1)));
      const o = ((grid.rows - 1 - j) * grid.cols + i) * 4;
      img.data[o] = c[0];
      img.data[o + 1] = c[1];
      img.data[o + 2] = c[2];
      img.data[o + 3] = 255;
    }
  ctx.putImageData(img, 0, 0);
}

/**
 * The band over a grid's plane, as the RGBA pixels of a `w` × `h` layer whose corners are the grid's corner nodes (its top row the grid's
 * last), `scale` pixels to a CSS px: at each pixel where two areas are close, Q's share blended from the four nodes around it for the pair
 * of the nearest node that has one (a node of P alone counts as none of Q, of Q alone as all of it), and the colour from it and the
 * pattern (`bandWeight`); clear where one area is clearly ahead, the grid's own colour showing there.
 */
export function bandLayer(grid: RegionGrid, w: number, h: number, look: { period: number; texture: number; scale: number }, colour: (area: number) => Rgb): Uint8ClampedArray {
  const out = new Uint8ClampedArray(w * h * 4);
  const { cols, rows, first, second, ahead } = grid;
  // Q's share at a node for the pair (p, q): from its lead where its pair is that one, none or all where p or q leads it clearly; null
  // where another area leads it
  const shareAt = (k: number, p: number, q: number): number | null => {
    const f = first[k] ?? -1;
    const sc = second[k] ?? -1;
    const close = sc >= 0 && (ahead[k] ?? 1) < 1;
    if (close && ((f === p && sc === q) || (f === q && sc === p))) return laterShare(f, sc, ahead[k] ?? 1);
    if (f === p) return 0;
    if (f === q) return 1;
    return null;
  };
  for (let py = 0; py < h; py++) {
    const gy = (rows - 1) * (1 - py / Math.max(1, h - 1));
    const j0 = Math.min(rows - 2, Math.max(0, Math.floor(gy)));
    const v = gy - j0;
    for (let px = 0; px < w; px++) {
      const gx = (cols - 1) * (px / Math.max(1, w - 1));
      const i0 = Math.min(cols - 2, Math.max(0, Math.floor(gx)));
      const u = gx - i0;
      const corners = [
        [j0 * cols + i0, (1 - u) * (1 - v)],
        [j0 * cols + i0 + 1, u * (1 - v)],
        [(j0 + 1) * cols + i0 + 1, u * v],
        [(j0 + 1) * cols + i0, (1 - u) * v],
      ] as const;
      let near: (typeof corners)[number] | undefined;
      for (const c of corners) if ((second[c[0]] ?? -1) >= 0 && (ahead[c[0]] ?? 1) < 1 && (!near || c[1] > near[1])) near = c;
      if (!near) continue;
      const f0 = first[near[0]] ?? 0;
      const s0 = second[near[0]] ?? 0;
      const [p, q] = [Math.min(f0, s0), Math.max(f0, s0)];
      let share = 0;
      let weight = 0;
      for (const [k, wt] of corners) {
        const of = shareAt(k, p, q);
        if (of === null) continue;
        share += wt * of;
        weight += wt;
      }
      if (weight <= 0) continue;
      share /= weight;
      if (share <= 0 || share >= 1) continue;
      const c = mixRgb(colour(p), colour(q), bandWeight(share, (px + 0.5) / look.scale, (py + 0.5) / look.scale, look, 1 / look.scale));
      const o = (py * w + px) * 4;
      out[o] = c[0];
      out[o + 1] = c[1];
      out[o + 2] = c[2];
      out[o + 3] = 255;
    }
  }
  return out;
}

/** A legend item for a pair's band shows where it covers at least this share of the plot's nodes: a hundredth, about 50 by 100 px on a
 *  computer and 30 by 25 on a phone, a patch the eye finds. */
const STRIPES_SEEN = 0.01;

/** The pairs of areas whose band covers at least STRIPES_SEEN of a grid (the lead under 1), most first, each as [P, Q] (the earlier first). */
export function stripedPairs(grid: RegionGrid): [number, number][] {
  const count = new Map<string, number>();
  grid.first.forEach((f, k) => {
    const s = grid.second[k] ?? -1;
    if (f < 0 || s < 0 || f === s || (grid.ahead[k] ?? 1) >= 1) return;
    const key = `${Math.min(f, s)}|${Math.max(f, s)}`;
    count.set(key, (count.get(key) ?? 0) + 1);
  });
  return [...count]
    .filter(([, n]) => n >= STRIPES_SEEN * grid.first.length)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => {
      const [p = 0, q = 0] = key.split("|").map(Number);
      return [p, q];
    });
}

/** The bottom edge names an area only where it is clear over at least this share of the edge's nodes: a tenth, about 130 px on a computer
 *  and 35 on a phone, so a name never stands for a sliver the eye cannot find. */
const EDGE_NAMED = 0.1;

/**
 * The bottom edge's stretches that carry a name: for each area, its longest run of nodes where it leads clearly (by θ or more), where that
 * run covers at least EDGE_NAMED of the edge; longest first, each as its first and last node.
 */
export function edgeStretches(edge: RegionGrid): { area: number; from: number; to: number }[] {
  const runs: { area: number; from: number; to: number }[] = [];
  edge.first.forEach((f, i) => {
    if (f < 0 || (edge.ahead[i] ?? 0) < CLEAR) return;
    const last = runs.at(-1);
    if (last && last.area === f && last.to === i - 1) last.to = i;
    else runs.push({ area: f, from: i, to: i });
  });
  const long = (r: { from: number; to: number }) => r.to - r.from + 1;
  return runs
    .filter((r) => long(r) >= EDGE_NAMED * edge.cols)
    .sort((a, b) => long(b) - long(a))
    .filter((r, k, all) => all.findIndex((x) => x.area === r.area) === k);
}

/** Whether a line from (x0, y0) to (x1, y1) passes through a box, grown by `pad` px on each side (Liang and Barsky's clipping). */
export function lineMeetsBox(seg: readonly [number, number, number, number], b: { x: number; y: number; w: number; h: number }, pad = 2): boolean {
  const [x0, y0, x1, y1] = seg;
  const [dx, dy] = [x1 - x0, y1 - y0];
  let [t0, t1] = [0, 1];
  for (const [p, q] of [[-dx, x0 - (b.x - pad)], [dx, b.x + b.w + pad - x0], [-dy, y0 - (b.y - pad)], [dy, b.y + b.h + pad - y0]] as const) {
    if (p === 0) {
      if (q < 0) return false;
    } else {
      const t = q / p;
      if (p < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
      if (t0 > t1) return false;
    }
  }
  return true;
}

/** The fewest nodes a leader's island keeps on the equal line: fewer take the leader around them. */
const ISLAND = 6;

/** A piece of the line where two areas are equal, in the grid's own units (node columns and rows, from the bottom left). */
type Seg = readonly [x0: number, y0: number, x1: number, y1: number];

/**
 * The line where two areas are equal, over a grid: on each side between two nodes whose leaders differ, the point where the two leads
 * cancel, linearly between them (each node's lead taken as how far its leader is ahead, the other's as behind); in each cell, its two such
 * points joined, or, where more meet (three areas, or a saddle), each joined to their middle.
 */
export function equalLines(grid: RegionGrid): Seg[] {
  const { cols, rows, ahead } = grid;
  // a leader's island of fewer than ISLAND nodes takes the leader around it: two accounts a few shekels apart flip on rounding, and the
  // line would draw each flip as a coast of its own
  const first = [...grid.first];
  const seen = new Int32Array(first.length).fill(-1);
  const near4 = (k: number) => {
    const [i, j] = [k % cols, Math.floor(k / cols)];
    return [i > 0 ? k - 1 : -1, i + 1 < cols ? k + 1 : -1, j > 0 ? k - cols : -1, j + 1 < rows ? k + cols : -1].filter((n) => n >= 0);
  };
  for (let k0 = 0; k0 < first.length; k0++) {
    if (seen[k0] !== -1) continue;
    const f = first[k0] ?? -1;
    const part = [k0];
    seen[k0] = k0;
    for (let n = 0; n < part.length; n++)
      for (const m of near4(part[n] ?? 0)) if (seen[m] === -1 && first[m] === f) {
        seen[m] = k0;
        part.push(m);
      }
    if (part.length >= ISLAND) continue;
    // the leader most of its border has
    const count = new Map<number, number>();
    for (const k of part) for (const m of near4(k)) if (first[m] !== f) count.set(first[m] ?? -1, (count.get(first[m] ?? -1) ?? 0) + 1);
    const [around] = [...count].sort((a, b) => b[1] - a[1])[0] ?? [f];
    for (const k of part) first[k] = around;
  }
  // a pair neither of which is clearly ahead anywhere is about the same across the whole map: no line between them
  const clearSomewhere = new Set<number>();
  first.forEach((f, k) => (ahead[k] ?? 0) >= 1 && clearSomewhere.add(f));
  const at = (i: number, j: number) => j * cols + i;
  /** The point between two nodes where their leaders are equal, as a fraction from the first; null where one leader holds both. */
  const cross = (a: number, b: number): number | null => {
    const fa = first[a] ?? -1;
    const fb = first[b] ?? -1;
    if (fa < 0 || fb < 0 || fa === fb || (!clearSomewhere.has(fa) && !clearSomewhere.has(fb))) return null;
    const la = ahead[a] ?? 1;
    const lb = ahead[b] ?? 1;
    return la + lb === 0 ? 0.5 : la / (la + lb);
  };
  const out: Seg[] = [];
  for (let j = 0; j + 1 < rows; j++)
    for (let i = 0; i + 1 < cols; i++) {
      const pts: [number, number][] = [];
      const bottom = cross(at(i, j), at(i + 1, j));
      if (bottom !== null) pts.push([i + bottom, j]);
      const right = cross(at(i + 1, j), at(i + 1, j + 1));
      if (right !== null) pts.push([i + 1, j + right]);
      const top = cross(at(i + 1, j + 1), at(i, j + 1));
      if (top !== null) pts.push([i + 1 - top, j + 1]);
      const left = cross(at(i, j + 1), at(i, j));
      if (left !== null) pts.push([i, j + 1 - left]);
      const [p, q] = pts;
      if (!p || !q) continue;
      if (pts.length === 2) out.push([p[0], p[1], q[0], q[1]]);
      else {
        const mx = pts.reduce((n, x) => n + x[0], 0) / pts.length;
        const my = pts.reduce((n, x) => n + x[1], 0) / pts.length;
        for (const x of pts) out.push([x[0], x[1], mx, my]);
      }
    }
  return out;
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
  reading,
}: {
  /** The plot runs from 0 to `max` on each axis. */
  max: { x: number; y: number };
  /** Every area, in the legend's order. */
  areas: RegionArea[];
  /** Who leads over the plane: its columns from 0 to `max.x`, its rows from `from` to `max.y` (under `from` is the bottom edge's). */
  field: RegionGrid & { from: number };
  /** The bottom edge's value, one row from 0 to `max.x`: the words over its longest clear stretch, and each other area's name over its own
   *  (`edgeStretches`). */
  edge: RegionGrid;
  /** The edge's words for the area of its longest clear stretch; null where no area is clear over enough of it to be named, the areas
   *  there being about the same. */
  edgeLabel: (id: string | null) => RegionWords;
  /** What the stripes mean, an item in the legend for each pair whose stripes show: its words, and its title naming the pair. */
  bandLabel: { text: string; pair: (a: string, b: string) => string };
  /** The reader's own point, and its words under it. */
  mark: { at: RegionPoint; label: RegionWords };
  guides: readonly RegionGuide[];
  xTitle: string;
  yTitle: string;
  xTick: (v: number) => string;
  yTick: (v: number) => string;
  /** The steps a read point is rounded to, on each axis, so a reading names round amounts. */
  snap: { x: number; y: number };
  /** What a point holds, in the box that follows the pointer and the one that stays at a kept point; `null` reads the marked point. */
  reading: (p: RegionPoint | null) => RegionReading;
}) {
  const [ref, w] = useWidth(600);
  const plane = useRef<HTMLCanvasElement>(null);
  const line = useRef<HTMLCanvasElement>(null);
  const band = useRef<HTMLCanvasElement>(null);
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

  const active = pick.active === null ? -1 : areas.findIndex((a) => a.id === pick.active);
  // the canvases, painted again when the field or the area set apart changes; each colour read from the page
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const [card = [0, 0, 0], ...tones] = coloursOf(host, ["text-card", ...areas.map((a) => INK[a.tone])]);
    const colour = (k: number): Rgb => {
      const c = tones[k] ?? card;
      return active >= 0 && k !== active ? mixRgb(c, card, DIMMED) : c;
    };
    if (plane.current) paint(plane.current, field, colour, card, false);
    if (line.current) paint(line.current, edge, colour, card, true);
  }, [ref, areas, field, edge, active]);
  // the band over the areas, painted at the screen's own pixels so its stripes stay sharp: again when the field, its size or the area set
  // apart changes, never as the pointer moves; the stripes' weight and period are the theme's
  const plotW = right - left;
  const plotH = sy(field.from) - TOP;
  useEffect(() => {
    const host = ref.current;
    const canvas = band.current;
    if (!host || !canvas) return;
    const [card = [0, 0, 0], ...tones] = coloursOf(host, ["text-card", ...areas.map((a) => INK[a.tone])]);
    const colour = (k: number): Rgb => {
      const c = tones[k] ?? card;
      return active >= 0 && k !== active ? mixRgb(c, card, DIMMED) : c;
    };
    const scale = window.devicePixelRatio || 1;
    const [cw, ch] = [Math.max(1, Math.round(plotW * scale)), Math.max(1, Math.round(plotH * scale))];
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const token = (name: string) => Number.parseFloat(getComputedStyle(host).getPropertyValue(name));
    const look = { texture: token("--chart-region-texture") || 0, period: token("--chart-region-period") || 7, scale };
    const img = ctx.createImageData(cw, ch);
    img.data.set(bandLayer(field, cw, ch, look, colour));
    ctx.putImageData(img, 0, 0);
  }, [ref, areas, field, active, plotW, plotH]);

  const mx = sx(mark.at[0]);
  const my = sy(mark.at[1]);
  // the legend's items for the band, one for each pair whose band shows, most first, in the pair's colours as the map draws them; the title
  // naming the pair is a hint under a computer's pointer
  const { text: sameText, pair: samePair } = bandLabel;
  const striped = useMemo(
    () =>
      stripedPairs(field).flatMap(([p, q]) => {
        const [one, two] = [areas[p], areas[q]];
        if (!one || !two) return [];
        return [{ id: `${STRIPED_ID}:${one.id}:${two.id}`, swatch: <BandSwatch p={one.tone} q={two.tone} />, label: <span title={samePair(one.name, two.name)}>{sameText}</span>, still: true }];
      }),
    [field, areas, sameText, samePair],
  );
  // the words over the map and where they stand: worked out again only when the map or its size changes, the names' and the band's places
  // being a search over the plot
  const layout = useMemo(() => {
    const sxL = scaleLinear().domain([0, max.x]).range([left, right]);
    const syL = scaleLinear().domain([0, max.y]).range([bottom, TOP]);
    const mxL = sxL(mark.at[0]);
    const myL = syL(mark.at[1]);
    const meets = (a: Box, b: Box) => a.x < b.x + b.w + 6 && b.x < a.x + a.w + 6 && a.y < b.y + b.h && b.y < a.y + a.h;
    const overlap = (a: Box, b: Box) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    // the lines words keep clear of: each guide, from the mark to its end, and the line where two areas are equal
    const gxL = (i: number) => sxL((max.x * i) / (field.cols - 1));
    const gyL = (j: number) => syL(field.from + ((max.y - field.from) * j) / (field.rows - 1));
    const equalPx = equalLines(field).map(([x0, y0, x1, y1]) => [gxL(x0), gyL(y0), gxL(x1), gyL(y1)] as const);
    // a guide shorter than the mark's dot is not drawn: its line would hide under the dot and its words stand away from its point
    const shown = guides.filter((g) => Math.abs(g.axis === "x" ? sxL(g.at) - mxL : syL(g.at) - myL) >= GUIDE_MIN);
    const guidePx = shown.map((g) => [mxL, myL, g.axis === "x" ? sxL(g.at) : mxL, g.axis === "x" ? myL : syL(g.at)] as const);
    const crossed = (b: Box) => guidePx.some((l) => lineMeetsBox(l, b)) || equalPx.some((l) => lineMeetsBox(l, b));
    const inPlot = (b: Box) => b.x >= left && b.x + b.w <= right && b.y >= TOP && b.y + b.h <= bottom - EDGE_PX;
    const fits = (b: Box) => inPlot(b) && !crossed(b);

    // the bottom edge's named stretches, in px, the longest first: it carries the edge's words, each other its area's name; with none, the
    // edge's words say the areas there are about the same, over the whole edge
    const nodeX = (i: number) => (max.x * i) / (edge.cols - 1);
    const runs = edgeStretches(edge).map((r) => ({ area: r.area, from: nodeX(r.from), to: nodeX(r.to) }));
    const [longest, ...others] = runs;
    const longestArea = longest ? areas[longest.area] : undefined;
    const edgeWords = edgeLabel(longestArea?.id ?? null);

    // the words, each placed clear of those placed before it: the bottom edge's, then the mark's, then each guide's; a box tries its places
    // in order and takes the first inside the plot that meets none, else the one that meets least
    const placed: Box[] = [];
    const clearOf = (tries: Box[]) => tries.find((b) => fits(b) && !placed.some((t) => meets(b, t)));
    // where none of its places is clear, the words stand in the nearest clear place around the point they name, a line at a time further
    // up or down, beside it or held inside the plot; only where none is clear either, in the place that meets least
    const around = (b: Box, at: [number, number]): Box[] => {
      const near = [10, -30, 30, -50, 50, -70, 70, -90, 90].flatMap((dy) => [at[0] + 8, at[0] - 8 - b.w, at[0] - b.w / 2].map((x) => ({ ...b, x: Math.min(right - b.w - 4, Math.max(left + 4, x)), y: at[1] + dy - b.h / 2 })));
      // then wider, nearest first: on a phone's narrow plot the lines (a guide, the equal line) can cross every place beside the point
      const wide: Box[] = [];
      for (let dy = -150; dy <= 150; dy += 10) for (let dx = -160; dx <= 160; dx += 16) wide.push({ ...b, x: Math.min(right - b.w - 4, Math.max(left + 4, at[0] + dx - b.w / 2)), y: at[1] + dy - b.h / 2 });
      const dist = (x: Box) => Math.hypot(x.x + x.w / 2 - at[0], x.y + x.h / 2 - at[1]);
      return [...near, ...wide.sort((x, y) => dist(x) - dist(y))];
    };
    const place = (tries: Box[], at: [number, number]): Box => {
      // never out of the plot; crossed by a line before meeting other words
      const cost = (b: Box) => placed.reduce((n, t) => n + overlap(b, t), 0) + (inPlot(b) ? 0 : 1e6) + (crossed(b) ? 1e4 : 0);
      const first = tries[0];
      const wider = first ? around(first, at) : [];
      // held inside the plot, or at its left edge where the words are wider than it
      const held = (b: Box): Box => ({ ...b, x: Math.max(0, Math.min(right - b.w - 4, Math.max(left + 4, b.x))), y: Math.min(bottom - EDGE_PX - b.h, Math.max(TOP, b.y)) });
      const got = clearOf(tries) ?? clearOf(wider) ?? [...tries, ...wider].map(held).sort((x, y) => cost(x) - cost(y))[0] ?? { x: left, y: TOP, w: 0, h: 0 };
      placed.push(got);
      return got;
    };
    // the bottom edge's words, over its longest clear stretch, as far right in it as a line crosses them nowhere, on one line; where they do
    // not fit inside the stretch, they stand under the map, after a piece of the edge's line. Each other stretch carries its area's name
    // where it fits inside it, so an edge that changes hands names each account along it
    const overStretch = (r: (typeof runs)[number], tw: number) => {
      const from = Math.max(left + 4, sxL(r.from));
      const tries: Box[] = [];
      for (let x = Math.min(right - 4, sxL(r.to) - 4) - tw; x >= from; x -= 8) tries.push({ x, y: bottom - EDGE_PX - 6 - LINE, w: tw, h: LINE });
      return clearOf(tries);
    };
    const edgeInside = overStretch(longest ?? { area: -1, from: 0, to: max.x }, chartTextWidth(edgeWords.text));
    if (edgeInside) placed.push(edgeInside);
    const edgeNames = others.flatMap((r) => {
      const a = areas[r.area];
      const box = a ? overStretch(r, chartTextWidth(a.name)) : undefined;
      if (!a || !box) return [];
      placed.push(box);
      return [{ id: a.id, box, words: { text: a.name } }];
    });
    // a box's left edge moved inside the plot, where its words are narrower than the plot
    const inside = (x: number, tw: number) => Math.min(right - tw - 4, Math.max(left + 4, x));
    // the mark's words: under the dot, else over it beside its vertical guide, else beside the dot, else a line higher, held inside the plot
    const markTw = chartTextWidth(mark.label.text);
    const markBox = place([
      { x: inside(mxL - markTw / 2, markTw), y: myL + 10, w: markTw, h: LINE },
      { x: mxL + 8, y: myL - 26, w: markTw, h: LINE },
      { x: mxL - 8 - markTw, y: myL - 26, w: markTw, h: LINE },
      { x: mxL + 12, y: myL + 4, w: markTw, h: LINE },
      { x: mxL - 12 - markTw, y: myL + 4, w: markTw, h: LINE },
      ...[myL - 26, myL - 46].map((y) => ({ x: inside(mxL + 8, markTw), y, w: markTw, h: LINE })),
    ], [mxL, myL]);
    // each guide's dot and its words beside it: over the dashed line or under it, after the dot or before it
    const guideDraw = shown.map((g) => {
      const gx = g.axis === "x" ? sxL(g.at) : mxL;
      const gy = g.axis === "x" ? myL : syL(g.at);
      if (!g.label) return { g, gx, gy, box: null };
      const tw = chartTextWidth(g.label.text);
      // beside the dot, over or under its line, else held inside the plot where the words are wider than the room beside it
      const box = place(
        g.axis === "x"
          ? [gy - 24, gy + 4, gy - 46].flatMap((y) => [{ x: gx + 8, y, w: tw, h: LINE }, { x: gx - 8 - tw, y, w: tw, h: LINE }, { x: inside(gx - tw / 2, tw), y, w: tw, h: LINE }])
          : [gy - 10, gy - 30, gy + 10].flatMap((y) => [{ x: gx + 8, y, w: tw, h: LINE }, { x: gx - 8 - tw, y, w: tw, h: LINE }, { x: inside(gx + 8, tw), y, w: tw, h: LINE }]),
        [gx, gy],
      );
      return { g, gx, gy, box };
    });

    // each area's name, and the band's words, where they have the most room: a box whose every sampled point the area leads clearly (or,
    // for the band, where the next one's colour shows), clear of the words above, as far as it can be from the mark and the guides' dots
    const node = (px: number, py: number) => {
      const i = Math.round((sxL.invert(px) / max.x) * (field.cols - 1));
      const j = Math.round(((syL.invert(py) - field.from) / (max.y - field.from)) * (field.rows - 1));
      return i < 0 || j < 0 || i >= field.cols || j >= field.rows ? -1 : j * field.cols + i;
    };
    // a box's sampled points: five across, three down
    const samples = (b: Box) => Array.from({ length: 15 }, (_, n) => node(b.x + (b.w * (n % 5)) / 4, b.y + (b.h * Math.floor(n / 5)) / 2));
    const holds = (b: Box, ok: (k: number) => boolean) => samples(b).every((k) => k >= 0 && ok(k));
    const dots: [number, number][] = [[mxL, myL], ...guideDraw.flatMap(({ g, gx, gy }) => (g.label ? [[gx, gy] as [number, number]] : []))];
    const taken: Box[] = [...placed];
    // the box with the most room
    const find = (tw: number, h: number, ok: (k: number) => boolean): { b: Box; room: number } | null => {
      let best: { b: Box; room: number } | null = null;
      for (let cy = TOP + h / 2 + 4; cy <= bottom - EDGE_PX - h / 2 - 4; cy += 8)
        for (let cx0 = left + tw / 2 + 8; cx0 <= right - tw / 2 - 8; cx0 += 8) {
          const b = { x: cx0 - tw / 2 - 4, y: cy - h / 2, w: tw + 8, h };
          if (!holds(b, ok) || taken.some((t) => meets(b, t)) || crossed(b)) continue;
          // the room: how far the box grows before it leaves its area, and how far it is from the mark and the guides' dots
          let grow = 0;
          for (const g of [6, 12, 20]) if (holds({ x: b.x - g, y: b.y - g / 2, w: b.w + 2 * g, h: b.h + g }, ok)) grow = g;
          const far = Math.min(40, ...dots.map(([px, py]) => Math.max(Math.abs(px - cx0) - tw / 2, Math.abs(py - cy) - h / 2)));
          if (far < 8) continue;
          const room = grow + far;
          if (!best || room > best.room) best = { b, room };
        }
      return best;
    };
    const take = (got: { b: Box } | null | undefined): Box | null => {
      if (got) taken.push(got.b);
      return got?.b ?? null;
    };
    const names = areas.flatMap((a, n) => {
      const b = take(find(chartTextWidth(a.name, 16), 24, (k) => field.first[k] === n && (field.ahead[k] ?? 0) >= CLEAR));
      return b ? [{ a, b }] : [];
    });
    const equal = equalPx.map(([x0, y0, x1, y1]) => `M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}`).join("");
    return { edgeWords, edgeInside, edgeNames, longestArea, markBox, guideDraw, names, equal };
  }, [field, edge, areas, mark, guides, edgeLabel, max.x, max.y, left, right, bottom]);
  const { edgeWords, edgeInside, longestArea, markBox, guideDraw, equal } = layout;

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

  // the box: the kept point's while a point is kept, so the mouse can reach its figures; else the pointer's point (the marked one's words on
  // the mark) while it is over the map
  const tip: { at: RegionPoint; reads: RegionPoint | null; kept: boolean } | null = pinned ? { at: pinned, reads: pinned, kept: true } : hover ? { at: hover.onMark ? mark.at : hover.p, reads: hover.onMark ? null : hover.p, kept: false } : null;
  const pinX = pinned ? sx(pinned[0]) : 0;
  const pinY = pinned ? sy(pinned[1]) : 0;
  // the canvases reach half a node past the plot on each side, so each node's colour sits on its own point and the browser's smoothing
  // runs between them; the plot clips them
  const cellX = (right - left) / (field.cols - 1);
  const cellY = (sy(field.from) - TOP) / (field.rows - 1);
  const edgeCellX = (right - left) / (edge.cols - 1);

  return (
    <div className="flex flex-col gap-2">
      <ChartLegend items={[...areas.map((a) => ({ id: a.id, swatch: <Swatch shape="box" className={SWATCH[a.tone]} />, label: a.name })), ...striped]} pick={pick} />
      {/* the y axis's name over its figures, at the plot's left edge, as the axis reads left to right */}
      <p dir="ltr" className="text-xs text-muted-foreground">
        <bdi dir="rtl">{yTitle}</bdi>
      </p>
      <div ref={ref} dir="ltr" tabIndex={0} onKeyDown={step} className="relative select-none rounded-md outline-none focus-visible:outline-2 focus-visible:outline-ring" data-region-map>
        <div className="pointer-events-none absolute overflow-clip" style={{ left, top: TOP, width: right - left, height: bottom - TOP }}>
          <canvas ref={plane} className="absolute block" style={{ left: -cellX / 2, top: -cellY / 2, width: right - left + cellX, height: sy(field.from) - TOP + cellY }} data-mark="areas" />
          <canvas ref={band} className="absolute block" style={{ left: 0, top: 0, width: plotW, height: plotH }} data-mark="band" />
          <canvas ref={line} className="absolute block" style={{ left: -edgeCellX / 2, top: bottom - TOP - EDGE_PX, width: right - left + edgeCellX, height: EDGE_PX }} data-mark="edge" />
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
            {/* where two areas are equal, over the band */}
            {equal && <path d={equal} className="stroke-chart-region-equal pointer-events-none" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" data-mark="equal" />}
            {/* the names inside their areas: a pointer on one sets its area apart */}
            {layout.names.map(({ a, b }) => (
              <text key={a.id} x={b.x + b.w / 2} y={b.y + b.h / 2 + 5} textAnchor="middle" {...pick.bind(a.id)} data-region-name className={cx("fill-chart-region-ink text-base font-semibold cursor-pointer", pickDim(pick.active, a.id))}>
                {a.name}
              </text>
            ))}
          </g>
          {/* the guides from the mark, and the mark itself on top */}
          {guideDraw.map(({ g, gx, gy }) => (
            <g key={g.axis} className="pointer-events-none" data-mark="guide">
              <line x1={mx} y1={my} x2={gx} y2={gy} className="stroke-chart-region-ink" strokeWidth={1.5} strokeDasharray="4 3" />
              {g.label && <circle cx={gx} cy={gy} r={4} className="fill-chart-region-ink" />}
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
        {guideDraw.map(({ g, box }) => box && g.label && <Words key={g.axis} box={box} words={g.label} />)}
        <Words box={markBox} words={mark.label} />
        {edgeInside && <Words box={edgeInside} words={edgeWords} />}
        {layout.edgeNames.map((n) => (
          <Words key={n.id} box={n.box} words={n.words} />
        ))}
        {tip && (
          <div className="contents" data-region-tip={tip.kept ? "kept" : "pointer"}>
            <ChartTip x={sx(tip.at[0])} width={w} near={{ y: sy(tip.at[1]), bottom: height }} variant={tip.kept ? "kept" : "follow"}>
              <ReadingRows {...reading(tip.reads)} />
            </ChartTip>
          </div>
        )}
      </div>
      <p className="text-center text-xs text-muted-foreground" style={{ paddingLeft: left }}>
        {xTitle}
      </p>
      {!edgeInside && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          {longestArea && <span className={cx("h-1.5 w-4 shrink-0 rounded-sm", SWATCH[longestArea.tone])} />}
          {edgeWords.node ?? edgeWords.text}
        </p>
      )}
    </div>
  );
}

/** The class of an area's swatch outside the map (a reading's row). */
export const regionSwatch = (t: RegionTone): string => SWATCH[t];

/** The class that sets a reading's row apart in its area's colour. */
export const regionWash = (t: RegionTone): string => WASH[t];

/** The tones in the order they are given out: the first four areas each their own, the rest grey. */
export const regionTones = (n: number): RegionTone[] => Array.from({ length: n }, (_, k) => (k < 4 ? (`region-${k + 1}` as RegionTone) : "other"));

/** The start of the legend items' ids for the stripes, apart from every area's. */
const STRIPED_ID = "region-map:about-the-same";

/** An area's colour as a CSS variable, for the band's swatch. */
const VAR: Record<RegionTone, string> = {
  "region-1": "var(--chart-region-1)",
  "region-2": "var(--chart-region-2)",
  "region-3": "var(--chart-region-3)",
  "region-4": "var(--chart-region-4)",
  other: "var(--chart-region-other)",
};

/** The band's swatch: the pair where the two are equal, Q's share a half, in the map's own mix (`bandWeight`): its smooth half under the
 *  pattern's 45° stripes, at the theme's weight and period. Wider than an area's swatch (24 by 12 px against 10), so several stripes show
 *  and it never reads as a dot. */
function BandSwatch({ p, q }: { p: RegionTone; q: RegionTone }) {
  const mix = (weight: string) => `color-mix(in srgb, ${VAR[q]} calc(${weight} * 100%), ${VAR[p]})`;
  const soft = "(1 - var(--chart-region-texture)) * 0.5";
  const background = `repeating-linear-gradient(135deg, ${mix(`(${soft} + var(--chart-region-texture))`)} 0 calc(var(--chart-region-period) * 0.3536px), ${mix(`(${soft})`)} 0 calc(var(--chart-region-period) * 0.7071px))`;
  return <span className="h-3 w-6 shrink-0 rounded-sm" style={{ background }} data-mark="band-swatch" />;
}

/** A point's reading in its box: the head in bold, then each row's swatch, name and figure, the row set apart washed in its colour. */
function ReadingRows({ head, rows }: RegionReading) {
  return (
    <span className="flex flex-col gap-0.5">
      <span className="font-semibold">{head}</span>
      {rows.map((row) => (
        <span key={row.id} className={row.wash ? cx("flex items-center gap-1.5 rounded-sm px-1 font-semibold", row.wash) : "flex items-center gap-1.5 px-1"}>
          {row.swatch}
          <span>{row.label}</span>
          {row.value && <span>· {row.value}</span>}
        </span>
      ))}
    </span>
  );
}

/** Words over the map in their box, in the dark ink the light areas take. */
function Words({ box, words }: { box: Box; words: RegionWords }) {
  return (
    <span dir="rtl" className="absolute whitespace-nowrap text-xs leading-5 font-semibold text-chart-region-ink" style={{ left: box.x, top: box.y }} data-chart-words>
      {words.node ?? words.text}
    </span>
  );
}
