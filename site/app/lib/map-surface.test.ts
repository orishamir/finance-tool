import { describe, expect, it } from "vitest";
import { SurfaceCache } from "./map-surface";
import type { LeftAt } from "./account-map";

/** Two made-up accounts, counting every account priced. */
function counted() {
  const asked: string[] = [];
  const price: LeftAt = (a, m, houses) => new Map((houses ?? ["a", "b"]).map((id) => (asked.push(`${id}@${a}|${m}`), [id, id === "a" ? a + m : a - m] as const)));
  return { asked, price };
}

describe("the account map's prices kept between maps (F-131)", () => {
  it("reads a point priced before again, and prices only the accounts not yet priced there", () => {
    const cache = new SurfaceCache(8, 100e6);
    const { asked, price } = counted();
    const left = cache.left("k", price);
    expect([...left(10, 1, ["a"])]).toEqual([["a", 11]]);
    expect([...left(10, 1, ["a"])]).toEqual([["a", 11]]);
    expect([...left(10, 1, null)]).toEqual([["a", 11], ["b", 9]]);
    expect([...left(10, 1, ["b"])]).toEqual([["b", 9]]);
    // a later map on the same surface reads them too
    expect([...cache.left("k", price)(10, 1, ["a", "b"])]).toEqual([["a", 11], ["b", 9]]);
    // asked for every account, a point is priced for every account (which accounts there are is the pricing's to say)
    expect(asked).toEqual(["a@10|1", "a@10|1", "b@10|1"]);
    // another surface prices its own
    cache.left("other", price)(10, 1, ["a"]);
    expect(asked).toHaveLength(4);
  });

  it("keeps at most its number of surfaces and about its bytes, dropping the oldest, never the one in use", () => {
    const cache = new SurfaceCache(3, 100e6);
    const { price } = counted();
    for (const k of ["1", "2", "3", "4"]) cache.left(k, price)(1, 1, null);
    cache.bound();
    expect(cache.size().keys).toBe(3);
    // the one used again is the latest: not dropped next
    cache.left("2", price);
    cache.left("5", price)(1, 1, null);
    cache.bound();
    const small = new SurfaceCache(8, 1);
    small.left("a", price)(1, 1, null);
    small.left("b", price)(2, 1, null);
    small.bound();
    expect(small.size().keys).toBe(1);
    expect(cache.size()).toMatchObject({ keys: 3, points: 3 });
  });
});
