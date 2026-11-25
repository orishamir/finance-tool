// D31: a company's figure about its own product is not weak; the same figure out of context is.
import { describe, expect, it } from "vitest";
import { foreignInvestmentFundIndex, openReadings, type FundStatement, type Label } from "@finance-tool/engine";
import { numbers } from "../copy";
import { carriedBy, compactFee, computed, figureYear, depositFeeNoneByRule, differenceOf, entered, sumOf, expandFee, isWeak, ownBy, ownEach, recheckStale, staleCma, staleCmaFee, type SiteValue } from "./value";

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

describe("a fund's own statement a computed figure reads (D84)", () => {
  const today = "2026-10-26";
  const statement: FundStatement = {
    term: "tax-index",
    index: "fx",
    currency: "USD",
    source: { url: "https://mayafiles.tase.co.il/rpdf/1244001-1245000/P1244042-01.pdf", title: "נספח לתשקיף קרן חוץ נסחרת", publisher: "BlackRock (iShares VII plc)", strength: "institution" },
    page: 17,
    quote: "בסיס המדד לחישוב סכום אינפלציוני יהא על פי השינוי בשער המטבע העיקרי",
    checked: "2026-11-25",
  };
  it("is as weak as its document: a company's, where the inputs and the rules are primary", () => {
    const v = computed(2, "nis", "F-65", { rate: fig("primary") }, { today, rules: [{ id: "TXS-02", strength: "primary" }], statements: [statement] });
    expect(v.weakest).toBe("institution");
    expect(v.statements).toEqual([statement]);
    expect(computed(2, "nis", "F-65", { rate: fig("primary") }, { today, rules: [{ id: "TXS-02", strength: "primary" }] }).weakest).toBe("primary");
  });
  it("is carried once by a figure made of two values that each read it (carriedBy)", () => {
    const a = computed(1, "nis", "F-65", { rate: fig("primary") }, { today, statements: [statement] });
    const b = computed(2, "nis", "F-65", { rate: fig("primary") }, { today, statements: [{ ...statement }] });
    expect(carriedBy([a, b]).statements).toEqual([statement]);
    expect(carriedBy([fig("primary")]).statements).toEqual([]);
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
  it("take a difference of the figures as the page writes them, so it matches them", () => {
    // the current account's cost: 10,768 ₪ in the fund less 8,203 ₪ in the account is 2,565 ₪, though the unrounded gap is 2,564.8
    const fund = computed(10_767.6, "nis", "F-67", {}, { today });
    const account = computed(8_202.8, "nis", "F-67", {}, { today });
    expect(differenceOf(["א", fund], ["ב", account], "F-67", { today }).value).toBe(2_565);
    // a computed sum under 10 ₪ keeps its agorot on the page, and so in the difference; a sourced price keeps the agorot it prints
    expect(differenceOf(["א", computed(9.996, "nis", "F-67", {}, { today })], ["ב", computed(3.204, "nis", "F-67", {}, { today })], "F-67", { today }).value).toBeCloseTo(6.8, 9);
    const price: SiteValue = { ...a, state: "sourced", update_rule: "market", value: 1_234.56 };
    expect(differenceOf(["א", price], ["ב", b], "F-67", { today }).value).toBeCloseTo(1_034.56, 9);
    // a unit that is not a sum of shekels is not rounded
    expect(differenceOf(["א", computed(2.345, "pct_per_year", "F-67", {}, { today })], ["ב", computed(1.2, "pct_per_year", "F-67", {}, { today })], "F-67", { today }).value).toBeCloseTo(1.145, 9);
  });
  it("are null when a figure is not a number", () => {
    expect(differenceOf(["א", a], ["ב", { ...b, value: null }], "F-91", { today }).value).toBeNull();
    expect(sumOf({}, "F-91", { today }).value).toBeNull();
  });
  it("a difference wears the doubt of either figure it is worked out from", () => {
    const cautious = computed(900, "nis", "F-65", {}, { today, labels: [{ code: "cautious", ruleId: "TXF-04" }] });
    const plain = computed(800, "nis", "F-65", {}, { today });
    expect(cautious.doubt).toBe(numbers.readingDoubt["TXF-04"]?.known);
    for (const d of [differenceOf(["א", cautious], ["ב", plain], "F-65", { today }), differenceOf(["א", plain], ["ב", cautious], "F-65", { today })]) {
      expect(d.doubt).toBe(cautious.doubt);
      expect(d.doubtRules).toEqual(["TXF-04"]);
    }
    expect(differenceOf(["א", plain], ["ב", plain], "F-65", { today }).doubt).toBeUndefined();
  });
});

describe("the doubt of the site's cautious reading (method §13)", () => {
  const today = "2026-11-08";
  it("has words for the rule of every open case whose split takes the cautious reading, and for no other", () => {
    expect(Object.keys(numbers.readingDoubt).sort()).toEqual(openReadings.filter((o) => o.onSplit === "cautious").map((o) => o.ruleId).sort());
  });
  it("has words for every fund a cautious case is met for: one whose documents were read, one the person typed, and one whose status is not known where the case reads a status", () => {
    for (const o of openReadings.filter((x) => x.onSplit === "cautious")) {
      const words = numbers.readingDoubt[o.ruleId];
      expect(words?.known, o.ruleId).toBeTruthy();
      expect(words?.documents, o.ruleId).toBeTruthy();
    }
    expect(numbers.readingDoubt[foreignInvestmentFundIndex.ruleId]?.status).toBeTruthy();
  });
  it("takes the words for what the label says the site does not know, and wears no doubt for a rule's own reading", () => {
    const of = (label: Label) => computed(1, "nis", "F-65", {}, { today, labels: [label] });
    expect(of({ code: "cautious", ruleId: "TXS-14", notKnown: "status" }).doubt).toBe(numbers.readingDoubt["TXS-14"]?.status);
    expect(of({ code: "cautious", ruleId: "TXS-14", notKnown: "documents" }).doubt).toBe(numbers.readingDoubt["TXS-14"]?.documents);
    expect(of({ code: "cautious", ruleId: "TXF-04", notKnown: "documents" }).doubt).toBe(numbers.readingDoubt["TXF-04"]?.documents);
    expect(of({ code: "reading", ruleId: "TXF-04" }).doubt).toBeUndefined();
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
