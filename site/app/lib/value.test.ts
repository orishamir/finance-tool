// D31: a company's figure about its own product is not weak; the same figure out of context is.
import { describe, expect, it } from "vitest";
import { compactFee, computed, depositFeeNoneByRule, expandFee, isWeak, ownBy, ownEach, type SiteValue } from "./value";

const fig = (strength: SiteValue["source"]["strength"], extra: Partial<SiteValue> = {}): SiteValue => ({
  value: 0.24,
  unit: "pct_per_year",
  source: { url: "https://example.org/report.pdf", title: "הדוח של הקרן", publisher: "הראל", strength },
  checked: "2026-10-26",
  effective_from: null,
  effective_to: null,
  update_rule: "provider-set",
  state: "sourced",
  ...extra,
});

describe("isWeak", () => {
  it("a secondary source is weak, own or not", () => {
    expect(isWeak(fig("secondary"))).toBe(true);
    expect(isWeak(fig("secondary", { own: "הראל" }))).toBe(true);
  });
  it("a company's figure is weak out of its own context and not weak with an owner", () => {
    expect(isWeak(fig("institution"))).toBe(true);
    expect(isWeak(fig("institution", { own: "הראל" }))).toBe(false);
  });
  it("primary and entered figures are never weak", () => {
    expect(isWeak(fig("primary"))).toBe(false);
    expect(isWeak(fig("primary-mirror"))).toBe(false);
    expect(isWeak(fig("entered", { state: "entered" }))).toBe(false);
  });
  it("a computed figure is weak by its weakest input", () => {
    const weak = computed(1, "nis", "F-1", { a: fig("institution") }, { today: "2026-10-26" });
    expect(isWeak(weak)).toBe(true);
  });
});

describe("ownBy", () => {
  it("marks only a company's figure", () => {
    expect(ownBy(fig("institution"), "הראל").own).toBe("הראל");
    expect(ownBy(fig("primary"), "הראל").own).toBeUndefined();
  });
  it("ownEach marks the keys picked", () => {
    const out = ownEach({ a: fig("institution"), b: fig("institution") }, "הראל", (k) => k === "a");
    expect(out.a!.own).toBe("הראל");
    expect(out.b!.own).toBeUndefined();
  });
});

describe("computed() weakest", () => {
  const today = "2026-10-26";
  it("skips inputs that are a company's own figure", () => {
    const v = computed(2, "nis", "F-1", { fee: fig("institution", { own: "הראל" }), rate: fig("primary") }, { today });
    expect(v.weakest).toBe("primary");
    expect(isWeak(v)).toBe(false);
  });
  it("one out-of-context input keeps the caution", () => {
    const v = computed(2, "nis", "F-1", { fee: fig("institution", { own: "הראל" }), other: fig("institution") }, { today });
    expect(v.weakest).toBe("institution");
    expect(isWeak(v)).toBe(true);
  });
  it("a secondary input stays weak next to an own one", () => {
    const v = computed(2, "nis", "F-1", { fee: fig("institution", { own: "הראל" }), s: fig("secondary") }, { today });
    expect(v.weakest).toBe("secondary");
  });
});

describe("compact fees keep the rule that explains an empty deposit fee (PF-06)", () => {
  const tpl = fig("primary", { value: 0.1, rule_ids: ["CAT-35"], notes: "ממוצע" });
  const none = fig("primary", { value: null, rule_ids: ["CAT-35", "PF-06"], notes: "לא דווח: PF-06" });
  const unknown = fig("primary", { value: null, rule_ids: ["CAT-35"], notes: "לא דווח: הסיבה לא ידועה." });
  it("round-trips the rule ids only when they differ from the template's", () => {
    expect(compactFee(tpl, tpl)).toEqual({ value: 0.1 });
    expect(depositFeeNoneByRule(expandFee(compactFee(none, tpl), tpl))).toBe(true);
    expect(depositFeeNoneByRule(expandFee(compactFee(unknown, tpl), tpl))).toBe(false);
    // a template that carries the rule does not lend it to a reported value
    expect(depositFeeNoneByRule(expandFee(compactFee(unknown, none), none))).toBe(false);
  });
  it("a reported value is never 'none by rule'", () => {
    expect(depositFeeNoneByRule({ value: 0, rule_ids: ["PF-06"] })).toBe(false);
  });
});
