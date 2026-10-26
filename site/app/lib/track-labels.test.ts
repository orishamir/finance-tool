import { describe, expect, it } from "vitest";
import { trackLabels } from "./track-labels";

describe("track labels", () => {
  const base = { inception: "2016-11-10", targetPopulation: "כלל האוכלוסיה", reportPeriod: "2026-09" };
  it("a track open to all, with a full year of fees, has none", () => {
    expect(trackLabels(base)).toEqual([]);
  });
  it("a track opened in or after the fee year is new (Altshuler 15541, opened 02.2025; Menora 15724, 08.2025)", () => {
    expect(trackLabels({ ...base, inception: "2025-02-23" })).toEqual(["new"]);
    expect(trackLabels({ ...base, inception: "2024-12-31" })).toEqual([]);
  });
  it("the CMA's target population gives the employees-only labels", () => {
    expect(trackLabels({ ...base, targetPopulation: "עובדי סקטור מסויים" })).toEqual(["sector"]);
    expect(trackLabels({ ...base, targetPopulation: "עובדי מפעל/גוף מסויים " })).toEqual(["body"]);
    expect(trackLabels({ ...base, targetPopulation: "" })).toEqual([]);
  });
});
