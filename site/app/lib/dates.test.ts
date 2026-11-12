import { describe, expect, it } from "vitest";
import { daysBetween, monthsBefore } from "./dates";

describe("daysBetween", () => {
  it("counts whole days forward and back, across a month, a year and a clock change", () => {
    expect(daysBetween("2026-11-12", "2026-11-12")).toBe(0);
    expect(daysBetween("2026-10-23", "2026-11-12")).toBe(20);
    expect(daysBetween("2026-11-12", "2026-10-23")).toBe(-20);
    expect(daysBetween("2025-12-31", "2026-01-01")).toBe(1);
    expect(daysBetween("2026-03-20", "2026-03-31")).toBe(11);
    expect(daysBetween("2024-02-28", "2024-03-01")).toBe(2);
  });
});

describe("monthsBefore", () => {
  it("steps back calendar months, across a year", () => {
    expect(monthsBefore("2026-11-13", 6)).toBe("2026-05-13");
    expect(monthsBefore("2026-02-10", 3)).toBe("2025-11-10");
    expect(monthsBefore("2026-11-13", 0)).toBe("2026-11-13");
  });
  it("runs a day the earlier month lacks into the next month", () => {
    expect(monthsBefore("2026-03-31", 1)).toBe("2026-03-03");
    expect(monthsBefore("2026-08-31", 6)).toBe("2026-03-03");
  });
});
