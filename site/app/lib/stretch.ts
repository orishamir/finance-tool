// The index page's stretches: an account is a stretch of the money ruler, from what is left with its dearest fund to what is left with its
// cheapest, and a fund is a spot inside the chosen account's stretch. Every figure here is a pair's value as the lists price it (`valueN`,
// F-65 on F-63) or the difference of two of them: no formula of its own. Only ranked pairs make a stretch: a pair on an open rule (G-18) is
// shown, not ranked, so it is in no stretch, spot or scale. The caller gives the funds of one kind (an index with both kinds: the chosen
// fund's), since a hedged fund is another holding (D28). Pure, for the lists, the ruler and the small bars.
import type { FundWay, WayPrice } from "./invest";

/** A ranked pair: priced, and not on an open rule. */
export const rankedAt = (x: FundWay["byHouse"][string] | undefined): x is WayPrice => !!x && "valueN" in x && !x.open;

/** One fund's spot in an account's stretch: the pair's value. */
export interface Spot {
  fund: string;
  value: number;
}

/** An account's stretch: what is left with its cheapest fund (`best`) and with its dearest (`worst`), and every fund's spot, most first. */
export interface Stretch {
  house: string;
  best: number;
  worst: number;
  /** The fund at `best`. */
  bestFund: string;
  spots: Spot[];
}

/** An account's stretch over the funds it ranks; null where it ranks none. */
export function stretchOf(funds: readonly FundWay[], house: string): Stretch | null {
  const spots = funds.flatMap((f) => {
    const at = f.byHouse[house];
    return rankedAt(at) ? [{ fund: f.rec.id, value: at.valueN }] : [];
  });
  if (spots.length === 0) return null;
  spots.sort((a, b) => b.value - a.value || (a.fund < b.fund ? -1 : a.fund > b.fund ? 1 : 0));
  return { house, best: spots[0]!.value, worst: spots.at(-1)!.value, bestFund: spots[0]!.fund, spots };
}

/** Every account's stretch, in the order given; an account that ranks no fund is left out. */
export function stretchesOf(funds: readonly FundWay[], houses: readonly string[]): Stretch[] {
  return houses.flatMap((h) => {
    const s = stretchOf(funds, h);
    return s ? [s] : [];
  });
}

/** The ruler's scale: from the lowest to the highest value over every stretch; null with none. */
export interface Scale {
  lo: number;
  hi: number;
}
export function scaleOf(stretches: readonly Stretch[]): Scale | null {
  if (stretches.length === 0) return null;
  return { lo: Math.min(...stretches.map((s) => s.worst)), hi: Math.max(...stretches.map((s) => s.best)) };
}

/**
 * Where a value stands on the scale, from 0 at its highest end to 1 at its lowest (the ruler reads down, the most at the top). A scale of
 * one value puts everything in its middle; a value past an end stays at that end.
 */
export function placeOn(scale: Scale, v: number): number {
  if (scale.hi <= scale.lo) return 0.5;
  return Math.min(1, Math.max(0, (scale.hi - v) / (scale.hi - scale.lo)));
}

/** A clean step for ticks over `span` with about `most` ticks at most: 1, 2, 2.5 or 5 times a power of ten. */
export function cleanStep(span: number, most: number): number {
  if (!(span > 0) || most < 1) return 0;
  const raw = span / most;
  const pow = 10 ** Math.floor(Math.log10(raw));
  return ([1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? 10 * pow);
}

/** The clean values inside the scale, highest first, a step apart, about `most` of them at most. */
export function ticksOf(scale: Scale, most: number): number[] {
  const step = cleanStep(scale.hi - scale.lo, most);
  if (step === 0) return [];
  const out: number[] = [];
  for (let v = Math.floor(scale.hi / step) * step; v >= scale.lo - 1e-9; v -= step) out.push(Math.round(v * 1e6) / 1e6);
  return out;
}
