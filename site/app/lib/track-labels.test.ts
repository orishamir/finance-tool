import { describe, expect, it } from "vitest";
import { trackLabels, youngerThanYears } from "./track-labels";

describe("track labels", () => {
  const base = { inception: "2016-11-10", reportPeriod: "2026-09" };
  it("a track with a full year of fees has none", () => {
    expect(trackLabels(base)).toEqual([]);
  });
  it("a track opened in or after the fee year is new (Altshuler 15541, opened 02.2025; Menora 15724, 08.2025)", () => {
    expect(trackLabels({ ...base, inception: "2025-02-23" })).toEqual(["new"]);
    expect(trackLabels({ ...base, inception: "2024-12-31" })).toEqual([]);
  });
});

describe("a track younger than a yield window", () => {
  it("opened after the window's first day: its empty yield is not a gap", () => {
    expect(youngerThanYears("2023-09-30", "2026-09", 3)).toBe(false);
    expect(youngerThanYears("2023-10-01", "2026-09", 3)).toBe(true);
    expect(youngerThanYears("2021-10-01", "2026-09", 5)).toBe(true);
    expect(youngerThanYears("2016-11-10", "2026-09", 5)).toBe(false);
    expect(youngerThanYears(null, "2026-09", 3)).toBe(false);
  });
});
