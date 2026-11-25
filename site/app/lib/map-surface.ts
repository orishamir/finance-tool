// The account map's prices kept between maps (F-131): what each account leaves with one fund at a point depends on the index, the fund,
// the plan's numbers other than today's amount and the monthly deposit, and the data, never on those two, and the map reads only points
// that do not move with the plan (lib/account-map.ts). So the prices a map read are kept by point under that key (a surface), and a map for
// a plan whose amount or deposit moved, or a window seen before, reads them again instead of pricing them. Only points a map asks for are
// priced: nothing is worked out ahead for settings the person has not asked for.
import type { LeftAt } from "./account-map";

/** One surface: by point, what each account priced there leaves and the accounts asked for there (null: every account). */
interface Surface {
  points: Map<string, { left: Map<string, number>; asked: Set<string> | null }>;
  bytes: number;
}

/** An estimate of what a point and a price take in memory: the point's key, its entry and its maps, and a price's entry. */
const POINT_BYTES = 400;
const PRICE_BYTES = 80;

/**
 * The surfaces kept, the latest used last, at most `keys` of them and about `budget` bytes in all (by POINT_BYTES and PRICE_BYTES), the one
 * in use always kept: past either, the oldest go. The bound is there so a long session's memory does not grow without end.
 */
export class SurfaceCache {
  private surfaces = new Map<string, Surface>();
  private readonly keys: number;
  private readonly budget: number;
  constructor(keys: number, budget: number) {
    this.keys = keys;
    this.budget = budget;
  }

  /** `price` read through the surface `key`, made the latest: a point priced before for the accounts asked is read from it, else only the
   *  accounts not yet priced there are priced, and kept. */
  left(key: string, price: LeftAt): LeftAt {
    const surface = this.surfaces.get(key) ?? { points: new Map(), bytes: 0 };
    this.surfaces.delete(key);
    this.surfaces.set(key, surface);
    return (amount, monthly, houses) => {
      const k = `${amount}|${monthly}`;
      const was = surface.points.get(k);
      const missing = !was ? houses : was.asked === null ? [] : houses ? houses.filter((id) => !was.asked?.has(id)) : null;
      const had = was ?? { left: new Map<string, number>(), asked: new Set<string>() };
      if (!was) {
        surface.points.set(k, had);
        surface.bytes += POINT_BYTES;
      }
      if (missing === null || missing.length > 0) {
        const got = price(amount, monthly, missing);
        for (const [id, v] of got) had.left.set(id, v);
        if (missing === null) had.asked = null;
        else for (const id of missing) had.asked?.add(id);
        surface.bytes += got.size * PRICE_BYTES;
      }
      if (!houses) return had.left;
      const out = new Map<string, number>();
      for (const id of houses) {
        const v = had.left.get(id);
        if (v !== undefined) out.set(id, v);
      }
      return out;
    };
  }

  /** Drops the oldest surfaces past the bound, never the latest. */
  bound(): void {
    let total = this.size().bytes;
    for (const [key, s] of this.surfaces) {
      if (this.surfaces.size <= 1 || (this.surfaces.size <= this.keys && total <= this.budget)) break;
      this.surfaces.delete(key);
      total -= s.bytes;
    }
  }

  /** How many surfaces are kept, the points they hold, and the bytes estimated. */
  size(): { keys: number; points: number; bytes: number } {
    let points = 0;
    let bytes = 0;
    for (const s of this.surfaces.values()) {
      points += s.points.size;
      bytes += s.bytes;
    }
    return { keys: this.surfaces.size, points, bytes };
  }
}
