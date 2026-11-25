// A representative fund whose status as a foreign-investment fund is not known (TXS-14, F-04, method §13): the guides run it under both
// readings of TXS OQ26, and a plan whose two readings give different taxes runs on the one that leaves less (method §13).
import { describe, expect, it } from "vitest";
import { loadFees, loadParameters, loadProducts, loadRules, today } from "./data.server";
import { runTimeline } from "./engine";
import { buildInstrumentTerms, loadFunds } from "./instruments.server";
import { computed } from "./value";
import { numbers } from "../copy";

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

  it("runs the guide's example on the reading that leaves less where the two split, as a fund named one runs on its currency alone and a fund known not to be one on the CPI alone", () => {
    const timeline = (value: string | false | null) => {
      const { terms, feeValues } = termsOf(value);
      return runTimeline({ record, p05, terms, feeValues, rules: Object.values(loadRules()), runDate }, { entered: {}, age: null });
    };
    const open = timeline(null);
    expect(open.kind).toBe("ok");
    // the readings split, so the question's flag, which says they agree, is not raised; the timeline carries the site's cautious reading,
    // for a fund whose status is not known, so a guide figure that rests on the exit tax wears its doubt
    if (open.kind === "ok") {
      expect(open.flags).not.toContain("TXS-OQ26");
      expect(open.labels).toContainEqual({ code: "cautious", ruleId: "TXS-14", notKnown: "status" });
      expect(computed(1, "nis", "F-67", {}, { today: runDate, labels: open.labels }).doubt).toBe(numbers.readingDoubt["TXS-14"]?.status);
    }
    // a fund whose documents name the dollar its principal currency runs on it alone, the site's reading of TXS OQ26 (D119): its timeline
    // carries the reading on TXS-14, with no cautious label and no flag of the question, so a guide figure on the exit tax wears no doubt
    const named = timeline("USD");
    expect(named.kind).toBe("ok");
    if (named.kind === "ok") {
      expect(named.flags).not.toContain("TXS-OQ26");
      expect(named.labels).toContainEqual({ code: "reading", ruleId: "TXS-14" });
      expect(named.labels.some((l) => l.code === "cautious")).toBe(false);
      expect(computed(1, "nis", "F-67", {}, { today: runDate, labels: named.labels }).doubt).toBeUndefined();
    }
    const settled = timeline(false);
    expect(settled.kind).toBe("ok");
    if (settled.kind === "ok") {
      expect(settled.flags).not.toContain("TXS-OQ26");
      expect(settled.labels.some((l) => l.code === "cautious")).toBe(false);
    }
  });
});
