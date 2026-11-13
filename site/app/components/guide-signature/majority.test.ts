// "רוב הבנקים" is said only for more than half the banks (F-85 is the most common rate, which may be a half or less).
import { describe, expect, it } from "vitest";
import { isMajority } from "./kit";
import type { SiteValue } from "../../lib/value";

const count = (n: number) => ({ value: n, unit: "count" }) as unknown as SiteValue;

describe("most banks", () => {
  it("is more than half, never half", () => {
    expect(isMajority(count(5), count(8))).toBe(true);
    expect(isMajority(count(4), count(8))).toBe(false);
    expect(isMajority(count(3), count(8))).toBe(false);
  });
});
