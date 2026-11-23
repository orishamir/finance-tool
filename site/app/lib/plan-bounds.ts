// The bounds a plan number the person entered keeps, as P-05 writes them (`p05Bounds` in lib/engine.ts reads them): the years the horizon
// slider's ends, as the guide pages' years field takes them; the amount and the monthly deposit from their slider's start, with no top (P-05:
// a larger amount may be typed); each percentage P-05's `pct` range and the age its `age` range. The indices page's fields, the plan it reads
// from the device and the import's check all hold the same bounds, so a value one of them refuses never reaches a run through another.
// Pure, no data: the bounds come in.

/** The plan numbers that carry a bound. */
export const boundedInputs = ["amount_now", "monthly_deposit", "horizon_years", "A-01", "A-02", "age"] as const;
export type BoundedInput = (typeof boundedInputs)[number];

/** A number's bound: its least value, its greatest (null: no top) and whether it must be whole. */
export interface Bound {
  min: number;
  max: number | null;
  whole: boolean;
}
/** A bound with a top. */
export type ClosedBound = Bound & { max: number };
/** Every bounded number's bound; the years, the percentages and the age have a top. */
export interface PlanBounds {
  amount_now: Bound;
  monthly_deposit: Bound;
  horizon_years: ClosedBound;
  "A-01": ClosedBound;
  "A-02": ClosedBound;
  age: ClosedBound;
}

/** What is wrong with a number against its bound, or null where it keeps it. */
export type BoundProblem = "below" | "above" | "not-whole";

export function boundProblem(b: Bound, n: number): BoundProblem | null {
  if (n < b.min) return "below";
  if (b.max !== null && n > b.max) return "above";
  if (b.whole && !Number.isInteger(n)) return "not-whole";
  return null;
}

export const isBounded = (key: string): key is BoundedInput => (boundedInputs as readonly string[]).includes(key);

/** The entered numbers that keep their bounds: one outside them reads as not entered, so the page runs on the site's example in its place. */
export function withinBounds<T extends Partial<Record<string, number>>>(entered: T, bounds: PlanBounds): T {
  // the same keys and values less some: still a T
  return Object.fromEntries(Object.entries(entered).filter(([k, v]) => !(isBounded(k) && typeof v === "number" && boundProblem(bounds[k], v)))) as T;
}
