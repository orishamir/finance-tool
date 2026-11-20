// The arithmetic of an amount axis drawn on a log scale (the deal's charts of what a fee costs by size, method F-112): where an amount
// stands, which amounts are written under it, and the nice steps of a share axis from zero. Pure: no React, no DOM.
import { numbers } from "../../copy";
import { fmt } from "../../lib/format";

/** A range of amounts, its bottom above nothing. */
export interface LogRange {
  lo: number;
  hi: number;
}

/** Where an amount stands along a log axis, from 0 at `lo` to 1 at `hi`; and the amount at a place along it. */
export const logAt = ({ lo, hi }: LogRange, a: number): number => (Math.log(a) - Math.log(lo)) / (Math.log(hi) - Math.log(lo) || 1);
export const amountAt = ({ lo, hi }: LogRange, t: number): number => Math.exp(Math.log(lo) + t * (Math.log(hi) - Math.log(lo)));

/**
 * The amounts written under a log axis: each power of ten inside it, and where the range spans fewer than three powers of ten, the 2 and the
 * 5 of each too, so a narrowed range still carries several amounts. On a phone (`narrow`) the axis says less: the 2 and the 5 only where the
 * range spans under 1.4 powers of ten, and over a range of more than three powers of ten every other power only, the even ones (10,000,
 * 1 מיליון), so the amounts stand well apart on a narrow plot.
 */
export function logTicks({ lo, hi }: LogRange, narrow = false): number[] {
  const span = Math.log10(hi / lo);
  const steps = span < (narrow ? 1.4 : 3) ? [1, 2, 5] : [1];
  const out: number[] = [];
  for (let p = Math.floor(Math.log10(lo)); p <= Math.ceil(Math.log10(hi)); p++) {
    if (narrow && span > 3 && p % 2 !== 0) continue;
    for (const k of steps) {
      const v = k * 10 ** p;
      if (v >= lo * (1 - 1e-9) && v <= hi * (1 + 1e-9)) out.push(v);
    }
  }
  return out;
}

/**
 * An amount as an axis writes it: its digits up to a million ("100,000"), from a million on its millions and the word, in visual
 * left-to-right order inside an isolate for an SVG text ("מיליון 2" drawn as "2 מיליון").
 */
export function amountTick(v: number): string {
  if (v < 1e6) return fmt.number(v);
  return `⁦${numbers.compact.million} ${fmt.number(v / 1e6)}⁩`;
}

/**
 * The steps of a share axis from zero to at least `max` (a percent, 1.2 for 1.2%): about `count` of them, each 1, 2, 2.5 or 5 times a
 * power of ten, the last at or above `max`.
 */
export function shareTicks(max: number, count = 7): number[] {
  if (!(max > 0)) return [0];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((s) => s >= raw * (1 - 1e-9)) ?? 10 * mag;
  const n = Math.ceil(max / step - 1e-9);
  return Array.from({ length: n + 1 }, (_, i) => +(i * step).toPrecision(12));
}
