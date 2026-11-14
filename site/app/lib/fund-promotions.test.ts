// A fund's fee lowered for a stated period (F-121) shows beside the fee until its last day, as the fund's own figure.
import { describe, expect, it } from "vitest";
import { fundPromotions } from "./fund-promotions";
import { loadFunds } from "./instruments.server";

describe("a fund's promotion where its fees show", () => {
  const rec = loadFunds().find((f) => f.id === "1148162")!;
  it("the latest record is the one with the promotion", () => expect(rec.snapshot).toBe("2026-11-14"));
  it("shows until its last day, and not after", () => {
    expect(fundPromotions(rec, "2026-11-14")).toMatchObject([{ fee: "trustee", value: { value: 0.0085 }, until: "2026-12-31" }]);
    expect(fundPromotions(rec, "2026-12-31")).toHaveLength(1);
    expect(fundPromotions(rec, "2027-01-01")).toEqual([]);
    expect(fundPromotions(loadFunds().find((f) => f.id === "1223866")!, "2026-11-14")).toMatchObject([{ fee: "trustee", value: { value: 0.007 } }]);
  });
});
