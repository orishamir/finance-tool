// The guide's fee rows over the real product records: a fee the law bars shows from its cap of 0 without being a fee the product has.
import { describe, expect, it } from "vitest";
import { loadProducts } from "./data.server";
import { feeRowKind, type FeeFacts } from "./guide-fees";

const record = (id: string) => loadProducts().find((p) => p.id === id) as unknown as FeeFacts;

describe("the guide's fee rows", () => {
  it("show a study fund's and an IRA's fee from deposits as barred, from the record's cap of 0 (KH-22, PF-06), not as a fee they have", () => {
    for (const id of ["keren-hishtalmut", "ira-hishtalmut", "ira-provident"]) {
      expect(record(id).fee_bases_allowed, id).not.toContain("deposit");
      expect(feeRowKind(record(id), "deposit"), id).toBe("barred");
    }
    expect(feeRowKind(record("keren-hishtalmut"), "balance")).toBe("allowed");
    // an allowed base stays allowed even at a cap of 0, and a base with neither shows no row
    expect(feeRowKind(record("kupat-gemel-lehashkaa"), "deposit")).toBe("allowed");
    expect(feeRowKind(record("keren-hishtalmut"), "trade")).toBeNull();
  });
});
