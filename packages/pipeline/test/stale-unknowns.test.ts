import { describe, expect, it } from "vitest";
import { staleUnknowns, type RuleLike } from "../src/validate";

const rule = (id: string, checked: string, sources: string[] = []): RuleLike =>
  ({ id, strength: "primary", checked, sources: sources.map((c) => ({ url: "https://example.gov.il", checked: c })) }) as RuleLike;

describe("staleUnknowns", () => {
  const rules = new Map([["TXK-04", rule("TXK-04", "2026-10-20", ["2026-11-06"])], ["CS-11", rule("CS-11", "2026-10-20")]]);

  it("lists a value left unknown whose rule was checked after it", () => {
    const rec = { switch_is_tax_event: { value: null, checked: "2026-10-22", rule_ids: ["TXK-04", "CS-11"] } };
    expect(staleUnknowns(rec, rules)).toEqual(["switch_is_tax_event (TXK-04)"]);
  });

  it("leaves a known value, or an unknown checked after its rules", () => {
    expect(staleUnknowns({ a: { value: false, checked: "2026-10-01", rule_ids: ["TXK-04"] } }, rules)).toEqual([]);
    expect(staleUnknowns({ a: { value: null, checked: "2026-11-07", rule_ids: ["TXK-04"] } }, rules)).toEqual([]);
  });

  it("walks nested fields", () => {
    const rec = { exit: { tax: { value: null, checked: "2026-10-01", rule_ids: ["CS-11"] } } };
    expect(staleUnknowns(rec, rules)).toEqual(["exit.tax (CS-11)"]);
  });

  it("skips fee caps, where null means no cap", () => {
    const rec = { fee_caps: { trustee: { value: null, checked: "2026-10-01", rule_ids: ["CS-11"] } } };
    expect(staleUnknowns(rec, rules)).toEqual([]);
  });
});
