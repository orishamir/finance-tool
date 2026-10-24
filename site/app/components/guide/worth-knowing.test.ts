import { describe, expect, it } from "vitest";
import type { RuleRecord } from "@finance-tool/schema";
import { worthRows } from "./worth-knowing";

const rule = (id: string, extra: object = {}) => ({ id, title_he: `כלל ${id}`, strength: "primary", ...extra }) as unknown as RuleRecord;

describe("worthRows", () => {
  it("skips missing rules and rules without a Hebrew title, caps at three", () => {
    const rules = { A: rule("A"), B: rule("B", { title_he: undefined }), C: rule("C"), D: rule("D"), E: rule("E") };
    expect(worthRows(["A", "X", "B", "C", "D", "E"], rules, "2026-10-24").map((r) => r.id)).toEqual(["A", "C", "D"]);
    expect(worthRows(undefined, rules, "2026-10-24")).toEqual([]);
  });
  it("marks weak strength", () => {
    expect(worthRows(["A"], { A: rule("A", { strength: "secondary" }) }, "2026-10-24")[0]!.weak).toBe("secondary");
  });
});
