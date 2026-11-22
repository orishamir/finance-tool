// What every test run holds whatever machine it runs on (vitest.config.ts): Israel's clock zone, inside the workers, for `Date` and for
// `Intl` alike, and the number of cases the project gives each property.
import fc from "fast-check";
import { describe, expect, inject, it } from "vitest";

describe("the test run's clock zone", () => {
  it("is Asia/Jerusalem for Intl", () => {
    expect(process.env.TZ).toBe("Asia/Jerusalem");
    expect(new Intl.DateTimeFormat().resolvedOptions().timeZone).toBe("Asia/Jerusalem");
  });

  it("is Israel's offset for Date: two hours ahead of UTC in winter, three in summer", () => {
    expect(new Date("2026-01-15T12:00:00Z").getTimezoneOffset()).toBe(-120);
    expect(new Date("2026-07-15T12:00:00Z").getTimezoneOffset()).toBe(-180);
    // 22:30 UTC is already the next day in Israel
    expect(new Date("2026-01-15T22:30:00Z").getDate()).toBe(16);
  });
});

describe("the property tests' number of cases", () => {
  it("is the project's, for every property", () => {
    expect(inject("propertyRuns")).toBeGreaterThan(0);
    expect(fc.readConfigureGlobal().numRuns).toBe(inject("propertyRuns"));
  });
});
