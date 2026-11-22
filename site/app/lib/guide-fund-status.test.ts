// A representative fund whose status as a foreign-investment fund is not known (TXS-14, F-04, method §13): the guides run it under both
// readings of TXS OQ26, and a plan whose two readings give different taxes stops the example on the question.
import { describe, expect, it } from "vitest";
import { loadFees, loadParameters, loadProducts, loadRules, today } from "./data.server";
import { runTimeline } from "./engine";
import { buildInstrumentTerms, loadFunds } from "./instruments.server";

const BRK = "brokerage-account";

describe("a representative fund whose status as a foreign-investment fund is not known", () => {
  // a fund on a dollar index, its status set by the test: the guides read it through the indices page's path (fundOf), and run it with
  // A-03 at its default of 0 against the plan's inflation, so the two readings of TXS OQ26 give the plan different taxes
  const rec = loadFunds().find((f) => f.exposure_id === "index-sp500" && f.domicile === "IL" && f.tax_status.il_fund_tax_track === "exempt" && f.tax_status.foreign_investment_fund);
  const status = rec?.tax_status.foreign_investment_fund;
  if (!rec || !status) throw new Error("an exempt Israeli fund on the S&P 500 with a status is in the data");
  const runDate = today();
  const withStatus = (value: string | false | null) => ({ ...rec, tax_status: { ...rec.tax_status, foreign_investment_fund: { ...status, value, notes: "as the test sets it" } } });
  const termsOf = (value: string | false | null) => {
    const built = buildInstrumentTerms(BRK, "securities", { fund: rec.id, tariff: "leumi" }, { fees: loadFees(), funds: [withStatus(value)], deposits: [], rules: loadRules(), today: runDate });
    if (!("terms" in built)) throw new Error(built.missing.join("; "));
    return built;
  };
  const record = loadProducts().find((w) => w.id === BRK);
  const p05 = loadParameters().find((p) => p.method_id === "P-05");
  if (!record || !p05) throw new Error("the brokerage account's record and P-05 are in data/");

  it("is run under both readings, with the index's currency as the candidate and A-03 at 0", () => {
    const { terms } = termsOf(null);
    expect(terms.fund?.principalCurrency).toBe("USD");
    expect(terms.currency).toEqual({ principalFxChange: 0 });
    expect(termsOf(false).terms.fund?.principalCurrency).toBeUndefined();
  });

  it("stops the guide's example on TXS-14 with the question, where a fund known not to be one runs on the CPI alone", () => {
    const timeline = (value: string | false | null) => {
      const { terms, feeValues } = termsOf(value);
      return runTimeline({ record, p05, terms, feeValues, rules: Object.values(loadRules()), runDate }, { entered: {}, age: null });
    };
    expect(timeline(null)).toMatchObject({ kind: "blocked", ruleId: "TXS-14", question: "TXS OQ26" });
    const settled = timeline(false);
    expect(settled.kind).toBe("ok");
    if (settled.kind === "ok") expect(settled.flags).not.toContain("TXS-OQ26");
  });
});
