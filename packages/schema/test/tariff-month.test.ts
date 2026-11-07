// A tariff dated by its month (2026-11-07): the month is 01 to 12, so "2025-00" or "2025-13" never passes as a document's date.
import { describe, expect, it } from "vitest";
import { feesSnapshot } from "../src/index.ts";

const published = feesSnapshot.shape.tariff.shape.published;

describe("a tariff's printed date", () => {
  it("is a day or a month from 01 to 12", () => {
    for (const ok of ["2025-11-01", "2025-01", "2025-12", null]) expect(published.safeParse(ok).success, String(ok)).toBe(true);
    for (const bad of ["2025-00", "2025-13", "2025-1", "11/2025"]) expect(published.safeParse(bad).success, bad).toBe(false);
  });
});
