// D31: a company's figure about its own product is not weak; the same figure out of context is.
import { describe, expect, it } from "vitest";
import { asP05Input, assumedReturn, compactFee, computed, figureYear, depositFeeNoneByRule, differenceOf, entered, sumOf, expandFee, isWeak, ownBy, ownEach, recheckStale, staleCma, staleCmaFee, type SiteValue } from "./value";

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

describe("a figure that rests on an assumed return (wording.md: hundreds of shekels)", () => {
  const t = "2026-11-22";
  const ret = assumedReturn(entered(7, "pct_per_year", t));
  const amount = entered(10_000, "nis", t);
  it("is marked from the return through every figure worked out from it, and no other", () => {
    const left = computed(19_671.5, "nis", "F-67", { amount, ret }, { today: t });
    const paid = computed(10_000, "nis", "F-106", { amount }, { today: t });
    expect(left.onAssumedReturn).toBe(true);
    expect(paid.onAssumedReturn).toBeUndefined();
    expect(differenceOf(["left", left], ["paid", paid], "F-67", { today: t }).onAssumedReturn).toBe(true);
    expect(sumOf({ paid, again: paid }, "F-91", { today: t }).onAssumedReturn).toBeUndefined();
  });
  it("comes from the P-05 inputs that are a return: the gross return and the cash rate, not the amounts or inflation", () => {
    expect(asP05Input("A-01", entered(7, "pct_per_year", t)).onAssumedReturn).toBe(true);
    expect(asP05Input("cash_rate", entered(4, "pct_per_year", t)).onAssumedReturn).toBe(true);
    expect(asP05Input("A-02", entered(2, "pct_per_year", t)).onAssumedReturn).toBeUndefined();
    expect(asP05Input("amount_now", amount).onAssumedReturn).toBeUndefined();
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

describe("staleCma allows the regulator's publication lag", () => {
  it("September's figures are current until October's are overdue", () => {
    expect(staleCma("2026-09", "2026-11-03")).toBeNull();
    expect(staleCma("2026-09", "2026-11-30")).toBeNull();
    expect(staleCma("2026-09", "2026-12-01")).toEqual({ since: "2026-09", cadence: "monthly" });
  });
  it("crosses the year end", () => {
    expect(staleCma("2026-11", "2027-01-31")).toBeNull();
    expect(staleCma("2026-11", "2027-02-01")).not.toBeNull();
  });
});

describe("staleCmaFee waits for the January rows that carry the next year's average", () => {
  it("the 2025 average is current until the January 2027 rows are overdue", () => {
    expect(staleCmaFee("2025-12-31", "2026-11-03")).toBeNull();
    expect(staleCmaFee("2025-12-31", "2027-02-28")).toBeNull();
    expect(staleCmaFee("2025-12-31", "2027-03-01")).toEqual({ since: "2025-12-31", cadence: "yearly" });
  });
});

describe("differenceOf and sumOf", () => {
  const today = "2026-11-08";
  const a = entered(500, "nis", today);
  const b = entered(200, "nis", today);
  it("work the value out from the figures they list, and list only those", () => {
    const d = differenceOf(["א", a], ["ב", b], "F-91", { today });
    expect(d.value).toBe(300);
    expect(Object.keys(d.computed_from!.inputs)).toEqual(["א", "ב"]);
    const s = sumOf({ א: a, ב: b }, "F-91", { today });
    expect(s.value).toBe(700);
    expect(Object.keys(s.computed_from!.inputs)).toEqual(["א", "ב"]);
  });
  it("are null when a figure is not a number", () => {
    expect(differenceOf(["א", a], ["ב", { ...b, value: null }], "F-91", { today }).value).toBeNull();
    expect(sumOf({}, "F-91", { today }).value).toBeNull();
  });
});

describe("recheckStale", () => {
  it("is true once a rule's re-check date has passed, never for a rule with none", () => {
    expect(recheckStale({ recheck_date: "2026-11-12" }, "2026-11-13")).toBe(true);
    expect(recheckStale({ recheck_date: "2026-11-13" }, "2026-11-13")).toBe(false);
    expect(recheckStale({ recheck_date: null }, "2026-11-13")).toBe(false);
    expect(recheckStale({}, "2026-11-13")).toBe(false);
  });
});

describe("the year a yearly amount is for (figureYear)", () => {
  const base = { effective_from: null, effective_to: null, tax_year: null, update_rule: "market" } as const;
  it("a figure for one calendar year, a tax year, or an amount indexed each 1 January", () => {
    expect(figureYear({ ...base, effective_from: "2025-01-01", effective_to: "2025-12-31" })).toBe("2025");
    expect(figureYear({ ...base, tax_year: 2026 })).toBe("2026");
    expect(figureYear({ ...base, effective_from: "2026-01-01", update_rule: "cpi-linked 1 jan" })).toBe("2026");
  });
  it("none for an amount not tied to a year", () => {
    expect(figureYear({ ...base, effective_from: "2026-10-22" })).toBeNull();
    expect(figureYear({ ...base, effective_from: "2026-01-01", update_rule: "fixed in law" })).toBeNull();
  });
});
