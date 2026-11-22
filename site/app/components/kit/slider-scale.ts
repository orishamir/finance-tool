// A slider's scale: how a value maps to a place on the track and back. The track is split into equal parts, one per segment, and each
// segment runs from where the last one ended to its own end in steps of its own size. One segment is a plain linear slider; several put a
// money slider's small amounts on as much track as its large ones (0 to 20,000 by 1,000 on the first third, 20,000 to 100,000 by 5,000 on
// the second, 100,000 to 500,000 by 25,000 on the last), so a start value of 10,000 is not pressed against the track's edge.
//
// A place is a fraction of the track, 0 at the least value and 1 at the most. A value off the steps (a typed 750 where the steps are of
// 1,000) has its own exact place; a place the hand drags to gives back the nearest step.

interface ScaleSegment {
  readonly from: number;
  readonly to: number;
  readonly step: number;
}

export interface SliderScale {
  readonly min: number;
  readonly max: number;
  readonly segments: readonly ScaleSegment[];
}

/** Decimals in a step (0.5 has one), so a value built from steps is rounded back to them rather than carrying 0.30000000000000004. */
const decimalsOf = (n: number): number => (Number.isInteger(n) ? 0 : (String(n).split(".")[1]?.length ?? 0));
const onStep = (n: number, step: number): number => {
  const p = 10 ** decimalsOf(step);
  return Math.round(n * p) / p;
};
// a quotient that lands on a whole number up to floating-point noise counts as that whole number
const EPS = 1e-9;

/**
 * A scale from `min` through each segment's end, in that segment's steps; each segment takes an equal part of the track. Throws on a
 * segment that does not grow or whose length is not a whole number of its steps: the scale is written by hand, and such a table is a typo.
 */
export function steppedScale(min: number, segments: readonly { to: number; step: number }[]): SliderScale {
  if (segments.length === 0) throw new Error("a slider scale needs at least one segment");
  let from = min;
  const out: ScaleSegment[] = segments.map(({ to, step }) => {
    const count = (to - from) / step;
    if (!(to > from) || !(step > 0) || Math.abs(count - Math.round(count)) > EPS) throw new Error(`slider scale segment ${from} to ${to} by ${step} is not a whole number of steps`);
    const seg = { from, to, step };
    from = to;
    return seg;
  });
  return { min, max: from, segments: out };
}

/** A plain slider: one segment from `min` to `max` by `step`. */
export function linearScale({ min, max, step }: { min: number; max: number; step: number }): SliderScale {
  return steppedScale(min, [{ to: max, step }]);
}

/**
 * A slider's scale from its range as the data writes it: in its `segments` where it has them (a money slider), else linear in its `step`.
 * Throws on segments that end elsewhere than `max`, and on a range with neither: the data's schema refuses both, so either is a broken invariant.
 */
export function rangeScale(range: { min: number; max: number; step?: number; segments?: readonly { to: number; step: number }[] }): SliderScale {
  if (range.segments) {
    const scale = steppedScale(range.min, range.segments);
    if (scale.max !== range.max) throw new Error(`slider scale segments end at ${scale.max}, not at the range's max ${range.max}`);
    return scale;
  }
  if (range.step === undefined) throw new Error(`slider range ${range.min} to ${range.max} has neither a step nor segments`);
  return linearScale({ min: range.min, max: range.max, step: range.step });
}

/** The place of a value on the track, 0 to 1; a value past either end stands at that end. Exact for a value off the steps. */
export function placeOf(scale: SliderScale, value: number): number {
  const n = scale.segments.length;
  if (value <= scale.min) return 0;
  if (value >= scale.max) return 1;
  const i = scale.segments.findIndex((s) => value < s.to);
  const s = scale.segments[i];
  if (!s) return 1;
  return (i + (value - s.from) / (s.to - s.from)) / n;
}

/** The value at a place on the track: the nearest step of the segment the place falls in. A place past either end gives that end. */
export function valueAt(scale: SliderScale, place: number): number {
  const n = scale.segments.length;
  if (place <= 0) return scale.min;
  if (place >= 1) return scale.max;
  const i = Math.min(n - 1, Math.floor(place * n));
  const s = scale.segments[i];
  if (!s) return scale.max;
  const along = place * n - i;
  return onStep(s.from + Math.round((along * (s.to - s.from)) / s.step) * s.step, s.step);
}

/** The next value on the scale's steps above a value (`1`) or below it (`-1`), for a key; at an end, that end. A value off the steps moves to the step beside it. */
export function stepFrom(scale: SliderScale, value: number, way: 1 | -1): number {
  if (way === 1) {
    for (const s of scale.segments) {
      if (value >= s.to) continue;
      const k = value < s.from ? 0 : Math.floor((value - s.from) / s.step + EPS) + 1;
      return Math.min(s.to, onStep(s.from + k * s.step, s.step));
    }
    return scale.max;
  }
  for (const s of [...scale.segments].reverse()) {
    if (value <= s.from) continue;
    const k = value > s.to ? Math.round((s.to - s.from) / s.step) : Math.ceil((value - s.from) / s.step - EPS) - 1;
    return Math.max(s.from, onStep(s.from + k * s.step, s.step));
  }
  return scale.min;
}
