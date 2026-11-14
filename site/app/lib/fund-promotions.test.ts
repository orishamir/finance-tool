// A fund's fee lowered for a stated period (F-121) shows beside the fee from its first day to its last, as the fund's own figure, on every page
// that shows the fund's fees.
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
  it("shows from its first day, and not before", () => {
    const p = rec.promotions![0]!;
    const later = { ...rec, promotions: [{ ...p, rate: { ...p.rate, effective_from: "2026-12-01" } }] };
    expect(fundPromotions(later, "2026-11-30")).toEqual([]);
    expect(fundPromotions(later, "2026-12-01")).toHaveLength(1);
  });
});


describe("a guide run's figures list a promotion only while it is in force", async () => {
  const { buildInstrumentTerms } = await import("./instruments.server");
  const { loadFees, loadRules } = await import("./data.server");
  const src = (today: string) => ({ fees: loadFees(), funds: loadFunds(), deposits: [], rules: loadRules(), today });
  const figures = (today: string) => {
    const r = buildInstrumentTerms("brokerage-account", "securities", { fund: "1148162", tariff: "leumi" }, src(today));
    return "feeValues" in r ? Object.keys(r.feeValues) : [];
  };
  it("listed on a day inside it, not after its last day", () => {
    expect(figures("2026-11-14")).toContain("fundTrusteePromotion");
    expect(figures("2027-01-01")).not.toContain("fundTrusteePromotion");
  });
});

describe("the fee lines of a fund with a promotion", async () => {
  const { fundFeeItems } = await import("../components/invest/funds");
  it("the variable fee's charged rate stands after the variable fee and its promotion, wherever the promotions put them", () => {
    const rec = loadFunds().find((f) => f.id === "1148162")!;
    const trustee = rec.promotions![0]!;
    const variable = { ...rec.fees.trustee!, value: 0.2 };
    const withVariable = { ...rec, fees: { ...rec.fees, variable_management: variable }, promotions: [...rec.promotions!, { fee: "variable_management" as const, rate: { ...trustee.rate, value: 0.1 } }] };
    const ids = fundFeeItems(withVariable, { priced: { value: { ...variable, value: 0.15 }, years: [2025] }, today: "2026-11-14" }).map((x) => x.id);
    expect(ids).toEqual(["fixed_management", "variable_management", "variable_management-promotion", "variable_priced", "trustee", "trustee-promotion"]);
  });
});
