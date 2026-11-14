// Where a carried thing lands among the things of a sortable list, and how far each of them slides aside to open its gap (design-system
// 11, `Grip`). A list is its members' boxes as they stood when the thing was lifted, in reading order, along one axis: across (right to
// left, the page's reading order) or down. The thing carried is one of them (`source`), or comes from outside (null). The pointer's place
// along the axis picks the landing: every place between two members and both ends is one, so no member has to be hit. Pure: it reads
// boxes and a point, and touches no page.

/** A box on the page, in the page's coordinates (scrolling moves none of them). */
export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Along which a list runs: across (`x`, right to left) or down (`y`). */
export type Axis = "x" | "y";

/** A box's start and end along the axis in reading order: right to left across, so its start is its right edge, read as a falling number. */
const span = (b: Box, axis: Axis): { start: number; end: number } => (axis === "y" ? { start: b.top, end: b.bottom } : { start: -b.right, end: -b.left });

/** A point's place along the axis, in the same reading order as `span`. */
const at = (p: { x: number; y: number }, axis: Axis): number => (axis === "y" ? p.y : -p.x);

/** The members of a list in reading order: the indexes of `boxes` sorted by where each starts along the axis. */
export function readingOrder(boxes: readonly Box[], axis: Axis): number[] {
  return boxes.map((_, i) => i).sort((a, b) => span(boxes[a]!, axis).start - span(boxes[b]!, axis).start);
}

/**
 * Where the carried thing lands: its place among the members once it is put there (0 the first, `boxes.length - 1` the last when it is one
 * of them, `boxes.length` after the last when it comes from outside). It passes every other member whose middle the pointer has passed,
 * along the axis in reading order. `boxes` stand in reading order (`readingOrder`).
 */
export function landing(boxes: readonly Box[], source: number | null, p: { x: number; y: number }, axis: Axis): number {
  const here = at(p, axis);
  let k = 0;
  boxes.forEach((b, j) => {
    if (j === source) return;
    const s = span(b, axis);
    if ((s.start + s.end) / 2 < here) k++;
  });
  return k;
}

/** Whether a point stands in a box grown by `margin` on every side. */
export const inside = (b: Box, p: { x: number; y: number }, margin = 0): boolean => p.x >= b.left - margin && p.x <= b.right + margin && p.y >= b.top - margin && p.y <= b.bottom + margin;

/** The box around every one of `boxes`. */
export function around(boxes: readonly Box[]): Box {
  return {
    left: Math.min(...boxes.map((b) => b.left)),
    top: Math.min(...boxes.map((b) => b.top)),
    right: Math.max(...boxes.map((b) => b.right)),
    bottom: Math.max(...boxes.map((b) => b.bottom)),
  };
}

/**
 * How far each member slides, on the screen, once the thing carried (member `source`) lands at `to`: the members between its place and
 * `to` slide one place toward where it was, by its size and the room between members, and the thing's own gap moves to `to`, past them.
 * Each member keeps its size, and the room between the first two stands between every two (a list of one member has none). `boxes` stand
 * in reading order. Across, a positive number is to the right.
 */
export function shifts(boxes: readonly Box[], source: number, to: number, axis: Axis): number[] {
  const spans = boxes.map((b) => span(b, axis));
  const gap = spans.length > 1 ? Math.max(0, spans[1]!.start - spans[0]!.end) : 0;
  const order = boxes.map((_, i) => i);
  order.splice(source, 1);
  order.splice(Math.max(0, Math.min(to, order.length)), 0, source);
  const moved = new Array<number>(boxes.length).fill(0);
  let next = spans[0]?.start ?? 0;
  for (const i of order) {
    moved[i] = next - spans[i]!.start;
    next += spans[i]!.end - spans[i]!.start + gap;
  }
  // reading order across is right to left: a step on in reading order is a step to the left on the screen
  return axis === "y" ? moved : moved.map((d) => (d === 0 ? 0 : -d));
}
