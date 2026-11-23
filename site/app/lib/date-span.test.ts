// A date beside many figures is the span of their own dates: the oldest and the newest, one date where they agree.
import { describe, expect, it } from "vitest";
import { dateSpan, oneDay } from "./date-span";

describe("dateSpan", () => {
  const day = (x: { d: string }) => x.d;
  it("takes the oldest and the newest of the items, whatever their order", () => {
    const s = dateSpan([{ d: "2026-11-09" }, { d: "2026-10-23" }, { d: "2026-11-14" }, { d: "2026-11-01" }], day);
    expect(s).toEqual({ from: { d: "2026-10-23" }, to: { d: "2026-11-14" } });
    expect(s && oneDay(s, day)).toBe(false);
  });
  it("is one day where every item has the same date, and null for none", () => {
    const s = dateSpan([{ d: "2026-11-09" }, { d: "2026-11-09" }], day);
    expect(s && oneDay(s, day)).toBe(true);
    expect(dateSpan([], day)).toBeNull();
  });
});
