// D31: a company's figure about its own product is not weak; the same figure out of context is.
import { describe, expect, it } from "vitest";
import { foreignInvestmentFundIndex, openReadings, type FundStatement, type Label } from "@finance-tool/engine";
import { numbers } from "../copy";
import { asParameter, compactFee, computed, figureYear, depositFeeNoneByRule, differenceOf, entered, sumOf, expandFee, isParameter, isWeak, ownBy, ownEach, recheckStale, ruleFigure, sheetRules, staleCma, staleCmaFee, strengthOf, templateRow, type SiteValue } from "./value";

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
  it("is carried once by a figure computed from two values that each read it", () => {
    const a = computed(1, "nis", "F-65", { rate: fig("primary") }, { today, statements: [statement] });
    const b = computed(2, "nis", "F-65", { rate: fig("primary") }, { today, statements: [{ ...statement }] });
    expect(computed(3, "nis", "F-12", { a, b }, { today }).statements).toEqual([statement]);
  });
});

describe("a figure computed from figures on a reading carries the reading (D119, method §13)", () => {
  const today = "2026-10-26";
  const named: FundStatement = {
    term: "foreign-investment-fund",
    currency: "USD",
    source: { url: "https://example.org/report.pdf#page=1", title: "הדוח השנתי של הקרן, עמ' 1", publisher: "מנהל הקרן", strength: "institution" },
    checked: "2026-11-22",
  };
  // what a fund leaves on the site's reading of TXS-14, as a run's figure after its tax carries it, and the same on the cautious reading
  const onReading = computed(100, "nis", "F-65", { rate: fig("primary") }, { today, rules: [{ id: "TXS-14", strength: "primary" }], statements: [named], labels: [{ code: "reading", ruleId: "TXS-14" }] });
  const onCautious = computed(90, "nis", "F-65", { rate: fig("primary") }, { today, rules: [{ id: "TXS-14", strength: "primary" }], labels: [{ code: "cautious", ruleId: "TXS-14", notKnown: "status" }] });
  it("carries an input's reading label, with its rule as the input recorded it, and the fund's statements, through computed", () => {
    const share = computed(0.1, "pct", "F-95", { left: onReading, other: fig("primary") }, { today });
    expect(share.labels).toEqual([{ code: "reading", ruleId: "TXS-14" }]);
    expect(share.rulesUsed).toEqual([{ id: "TXS-14", strength: "primary" }]);
    expect(share.statements).toEqual([named]);
    expect(share.doubt).toBeUndefined();
  });
  it("a plain difference or sum lists no rule and no statement, even of an input on a reading, and keeps the label, so its sheet shows its tags and receipt only", () => {
    const other = fig("primary", { value: 50, unit: "nis" });
    for (const v of [differenceOf(["a", onReading], ["b", other], "F-80", { today }), sumOf({ a: onReading, b: other }, "F-91", { today })]) {
      expect(v.rulesUsed ?? []).toEqual([]);
      expect(v.statements ?? []).toEqual([]);
      expect(v.labels).toEqual([{ code: "reading", ruleId: "TXS-14" }]);
      expect(sheetRules(v)).toEqual([]);
      // the input it opens still lists the rule and the fund's statement
      const input = (v.computed_from!.inputs as Record<string, SiteValue>).a!;
      expect(sheetRules(input).map((r) => r.id)).toEqual(["TXS-14"]);
      expect(input.statements).toEqual([named]);
    }
  });
  it("keeps its own options first and carries each once; carries no cautious label, whose doubt only a plain difference or sum carries", () => {
    const both = computed(1, "nis", "F-80", { a: onReading, b: { ...onReading } }, { today, labels: [{ code: "derived", ruleId: "X-1" }] });
    expect(both.labels).toEqual([{ code: "derived", ruleId: "X-1" }, { code: "reading", ruleId: "TXS-14" }]);
    expect(both.statements).toEqual([named]);
    const fromCautious = computed(1, "nis", "F-95", { a: onCautious }, { today });
    expect(fromCautious.labels).toBeUndefined();
    expect(fromCautious.doubt).toBeUndefined();
    expect(differenceOf(["a", onCautious], ["b", fig("primary", { value: 50, unit: "nis" })], "F-80", { today }).doubt).toBe(onCautious.doubt);
  });
  it("leaves the strength to its inputs: a company's own figure on a reading does not weaken what is computed from it", () => {
    const own = { ...onReading, own: "מנהל הקרן", weakest: "institution" as const, source: { ...onReading.source, strength: "institution" as const } };
    expect(computed(1, "nis", "F-95", { a: own }, { today }).weakest).toBe("primary");
  });
  it("carries nothing from inputs on no reading: a cost before the exit tax stays as its options make it", () => {
    const cost = computed(5, "nis", "F-91", { fee: fig("primary") }, { today, labels: [] });
    expect(computed(1, "nis", "F-80", { a: cost, b: fig("primary") }, { today }).labels).toBeUndefined();
    expect(computed(1, "nis", "F-80", { a: cost }, { today }).statements).toBeUndefined();
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
    const cautious = computed(900, "nis", "F-65", {}, { today, labels: [{ code: "cautious", ruleId: "TXF-04", notKnown: "documents" }] });
    const plain = computed(800, "nis", "F-65", {}, { today });
    expect(cautious.doubt).toBe(numbers.readingDoubt["TXF-04"]?.documents);
    for (const d of [differenceOf(["א", cautious], ["ב", plain], "F-65", { today }), differenceOf(["א", plain], ["ב", cautious], "F-65", { today })]) {
      expect(d.doubt).toBe(cautious.doubt);
      expect(d.doubtRules).toEqual(["TXF-04"]);
    }
    expect(differenceOf(["א", plain], ["ב", plain], "F-65", { today }).doubt).toBeUndefined();
  });
  it("a difference names which of its two figures carry the doubt, with the rules of each, so its sheet can say which fund it is about", () => {
    const txf = computed(900, "nis", "F-65", {}, { today, labels: [{ code: "cautious", ruleId: "TXF-04", notKnown: "documents" }] });
    const txs = computed(850, "nis", "F-65", {}, { today, labels: [{ code: "cautious", ruleId: "TXS-14", notKnown: "status" }] });
    const plain = computed(800, "nis", "F-65", {}, { today });
    expect(differenceOf(["א", plain], ["ב", txf], "F-65", { today }).doubtFrom).toEqual(["ב"]);
    const both = differenceOf(["א", txf], ["ב", txs], "F-65", { today });
    expect(both.doubtFrom).toEqual(["א", "ב"]);
    expect(both.doubtRules).toEqual(["TXF-04", "TXS-14"]);
    expect(differenceOf(["א", plain], ["ב", plain], "F-65", { today }).doubtFrom).toBeUndefined();
    // a difference whose own run is the cautious reading says its own doubt, from no input
    expect(differenceOf(["א", plain], ["ב", txf], "F-65", { today, labels: [{ code: "cautious", ruleId: "TXS-14", notKnown: "status" }] }).doubtFrom).toBeUndefined();
  });
});

describe("the doubt of the site's cautious reading (method §13)", () => {
  const today = "2026-11-08";
  it("has words for the rule of every open case whose split takes the cautious reading, and for no other", () => {
    expect(Object.keys(numbers.readingDoubt).sort()).toEqual(openReadings.filter((o) => o.onSplit === "cautious").map((o) => o.ruleId).sort());
  });
  it("has words for every fund a cautious case is met for, one the site does not know: one the person typed, and one whose status is not known where the case reads a status, and none for a fund whose documents were read, which takes the site's own reading (D119)", () => {
    for (const o of openReadings.filter((x) => x.onSplit === "cautious")) {
      const words = numbers.readingDoubt[o.ruleId];
      expect(words?.documents, o.ruleId).toBeTruthy();
      expect(Object.keys(words ?? {}).every((k) => k === "documents" || k === "status"), o.ruleId).toBe(true);
    }
    expect(numbers.readingDoubt[foreignInvestmentFundIndex.ruleId]?.status).toBeTruthy();
  });
  it("takes the words for what the label says the site does not know, and wears no doubt for a rule's own reading", () => {
    const of = (label: Label) => computed(1, "nis", "F-65", {}, { today, labels: [label] });
    expect(of({ code: "cautious", ruleId: "TXS-14", notKnown: "status" }).doubt).toBe(numbers.readingDoubt["TXS-14"]?.status);
    expect(of({ code: "cautious", ruleId: "TXS-14", notKnown: "documents" }).doubt).toBe(numbers.readingDoubt["TXS-14"]?.documents);
    expect(of({ code: "cautious", ruleId: "TXF-04", notKnown: "documents" }).doubt).toBe(numbers.readingDoubt["TXF-04"]?.documents);
    expect(of({ code: "reading", ruleId: "TXF-04" }).doubt).toBeUndefined();
    expect(of({ code: "reading", ruleId: "TXS-14" }).doubt).toBeUndefined();
  });
  it("names in the sheet the open rule the site reads for the fund, which the run did not read, after the rules it read (D119)", () => {
    const read = [{ id: "TXS-09", strength: "primary" as const }];
    expect(sheetRules({ rulesUsed: read, labels: [{ code: "reading", ruleId: "TXF-04" }] })).toEqual([...read, { id: "TXF-04", strength: null }]);
    // a rule read is named once, with its strength; a label of another kind names nothing
    expect(sheetRules({ rulesUsed: [{ id: "TXS-14", strength: "primary" }], labels: [{ code: "reading", ruleId: "TXS-14" }] })).toEqual([{ id: "TXS-14", strength: "primary" }]);
    expect(sheetRules({ rulesUsed: read, labels: [{ code: "cautious", ruleId: "TXF-04", notKnown: "documents" }] })).toEqual(read);
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

describe("computed() lists only the rules its own calculation adds (method §13)", () => {
  const today = "2026-11-26";
  const fee = computed(10, "nis", "F-67", { a: fig("primary") }, { today, rules: [{ id: "PF-01", strength: "primary" }] });
  const tax = computed(5, "nis", "F-40", { a: fig("primary") }, { today, rules: [{ id: "TXS-02", strength: "primary" }] });
  it("drops a rule that a computed input already lists, whose row opens it", () => {
    const net = computed(85, "nis", "F-67", { fee, tax }, { today, rules: [{ id: "PF-01", strength: "primary" }, { id: "TXS-02", strength: "primary" }, { id: "PF-13", strength: "primary" }] });
    expect(net.rulesUsed).toEqual([{ id: "PF-13", strength: "primary" }]);
  });
  it("keeps a rule a sourced input names, which no input's sheet lists as read", () => {
    const v = computed(1, "nis", "F-1", { a: fig("primary", { rule_ids: ["PF-01"] }) }, { today, rules: [{ id: "PF-01", strength: "primary" }] });
    expect(v.rulesUsed).toEqual([{ id: "PF-01", strength: "primary" }]);
  });
  it("a value that is null lists no rule, or only the open rule that left it empty (blockedBy)", () => {
    expect(computed(null, "nis", "F-1", { fee }, { today, rules: [{ id: "TXS-02", strength: "primary" }] }).rulesUsed).toEqual([]);
    expect(computed(null, "nis", "F-1", { fee }, { today, rules: [{ id: "TXS-02", strength: "primary" }], blockedBy: "TXG-09" }).rulesUsed).toEqual([{ id: "TXG-09", strength: "open" }]);
  });
});

describe("computed() carries the inputs' staleness and flags, and a plain sum their doubt too", () => {
  const today = "2026-11-26";
  const old = fig("primary", { value: 1, unit: "nis", stale: { since: "2026-01-31", cadence: "monthly" } });
  const older = fig("primary", { value: 2, unit: "nis", stale: { since: "2025-12-31", cadence: "yearly" } });
  it("takes the stalest input's staleness", () => {
    expect(computed(3, "nis", "F-1", { a: old, b: older }, { today }).stale).toEqual(older.stale);
    expect(sumOf({ a: old, b: fig("primary", { value: 2, unit: "nis" }) }, "F-91", { today }).stale).toEqual(old.stale);
    expect(computed(3, "nis", "F-1", { a: fig("primary") }, { today }).stale).toBeUndefined();
  });
  it("a sum takes every input's doubt once, with the rules of each and which inputs carry it; a tally computed from them does not", () => {
    const d1 = fig("primary", { value: 1, unit: "nis", doubt: "ספק א", doubtRules: ["BANK-09"] });
    const d2 = fig("primary", { value: 2, unit: "nis", doubt: "ספק ב", doubtRules: ["BANK-13"] });
    const v = sumOf({ a: d1, b: d2, c: { ...d1 } }, "F-91", { today });
    expect(v.doubt).toBe("ספק א ספק ב");
    expect(v.doubtRules).toEqual(["BANK-09", "BANK-13"]);
    expect(v.doubtFrom).toEqual(["a", "b", "c"]);
    expect(computed(3, "nis", "F-85", { a: d1, b: d2 }, { today }).doubt).toBeUndefined();
  });
  it("takes every flag once, each with the earliest month given for it, and an engine flag keeps its month", () => {
    const a = computed(1, "nis", "F-1", {}, { today, flags: [{ code: "BANK-35", month: 7 }, "G-14"] });
    const b = computed(2, "nis", "F-1", {}, { today, flags: [{ code: "BANK-35", month: 3 }] });
    expect(a.flags).toEqual(["BANK-35", "G-14"]);
    expect(a.flagMonths).toEqual({ "BANK-35": 7 });
    const s = sumOf({ a, b }, "F-91", { today });
    expect(s.flags).toEqual(["BANK-35", "G-14"]);
    expect(s.flagMonths).toEqual({ "BANK-35": 3 });
    // a flag given once with no month applies throughout
    expect(computed(3, "nis", "F-1", { a, c: computed(1, "nis", "F-1", {}, { today, flags: ["BANK-35"] }) }, { today }).flagMonths).toBeUndefined();
  });
});

describe("strengthOf has no default of its own", () => {
  it("a computed value with no weakest takes its own source's strength", () => {
    const hand = { ...fig("institution"), state: "computed" as const };
    expect(strengthOf(hand)).toBe("institution");
    expect(isWeak(hand)).toBe(true);
  });
});

describe("a site parameter's value shows its rationale whatever its update rule (data/parameters)", () => {
  const p05 = { id: "P-05", rationale: "why", rationale_he: "למה" } as unknown as Parameters<typeof asParameter>[0];
  it("P-05's cash rate, which quotes the Bank of Israel's published rate, is a parameter", () => {
    const cash = fig("primary", { value: 3.25, update_rule: "market" });
    expect(isParameter(asParameter(p05, cash))).toBe(true);
    expect(asParameter(p05, cash).parameter?.rationaleHe).toBe("למה");
  });
  it("a value no parameter marks is none, unless the founder updates it, which only a parameter's is", () => {
    expect(isParameter(fig("primary", { update_rule: "founder" }))).toBe(true);
    expect(isParameter(fig("primary", { update_rule: "market" }))).toBe(false);
    expect(isParameter(entered(5, "nis", "2026-11-26"))).toBe(false);
  });
});

describe("plain differences and sums", () => {
  const today = "2026-11-26";
  const a = entered(500, "nis", today);
  it("take no rules and no statements of their own (a type check)", () => {
    // @ts-expect-error a plain difference adds no rule
    differenceOf(["א", a], ["ב", a], "F-91", { today, rules: [] });
    // @ts-expect-error a plain sum adds no statement
    sumOf({ א: a }, "F-91", { today, statements: [] });
    expect(true).toBe(true);
  });
  it("a difference of two figures under one name keeps both, the second told apart by its order, and shows no working", () => {
    const d = differenceOf(["א", a], ["א", entered(200, "nis", today)], "F-91", { today });
    expect(d.value).toBe(300);
    expect(Object.keys(d.computed_from!.inputs)).toEqual(["א", "א (2)"]);
    expect(d.computed_from!.working).toBeUndefined();
  });
  it("the gate sends these back to the input list, with no receipt: agorot that miss the total, a figure a phone row may write short, a figure that does not read back", () => {
    const working = (v: SiteValue) => v.computed_from?.working?.kind;
    const c = (n: number, unit: SiteValue["unit"] = "nis") => computed(n, unit, "F-1", {}, { today });
    // whole shekels each, the agorot of two lines add up to a shekel the total shows
    expect(working(sumOf({ x: c(10.4), y: c(10.4) }, "F-91", { today }))).toBeUndefined();
    // at or above 100 million shekels a phone's row writes a figure short, so the lines no longer add up as read
    expect(working(sumOf({ x: c(60_000_000), y: c(50_000_000) }, "F-91", { today }))).toBeUndefined();
    expect(working(differenceOf(["x", c(150_000_000)], ["y", c(1_000)], "F-91", { today }))).toBeUndefined();
    // shekels per dollar are written in agorot, which does not read back as the number
    expect(working(differenceOf(["x", c(3.71, "nis_per_usd")], ["y", c(3.6, "nis_per_usd")], "F-93", { today }))).toBeUndefined();
    // and these come to the figure as written, so they keep the receipt
    expect(working(sumOf({ x: c(10), y: c(20) }, "F-91", { today }))).toBe("sum");
    expect(working(differenceOf(["x", c(99_999_999)], ["y", c(1)], "F-91", { today }))).toBe("difference");
  });
});

describe("a rule's figure says what it is (ruleFigure)", () => {
  const rule = {
    id: "TXX-01",
    strength: "primary",
    checked: "2026-11-01",
    figures: {
      rate: { value: 15, unit: "pct", source: { url: "https://example.org", title: "t", publisher: "p", strength: "primary" }, checked: "2026-11-01", effective_from: null, effective_to: null, update_rule: "fixed in law", state: "sourced" },
      cap: { by_tax_year: { "2026": { value: 100, unit: "nis", source: { url: "https://example.org", title: "t", publisher: "p", strength: "primary" }, checked: "2026-11-01", effective_from: null, effective_to: null, update_rule: "cpi-linked 1 jan", state: "sourced", tax_year: 2026 }, "2027": { value: 110, unit: "nis", source: { url: "https://example.org", title: "t", publisher: "p", strength: "primary" }, checked: "2026-11-01", effective_from: null, effective_to: null, update_rule: "cpi-linked 1 jan", state: "sourced", tax_year: 2027 } } },
    },
    figure_names_he: { rate: "שיעור המס", cap: "התקרה" },
  } as unknown as Parameters<typeof ruleFigure>[0];
  it("takes its Hebrew name, with the year for a figure set by tax year", () => {
    expect(ruleFigure(rule, "rate", "2026-11-26")?.about).toBe("שיעור המס");
    expect(ruleFigure(rule, "cap", "2026-11-26")?.about).toBe("התקרה 2026");
    expect(ruleFigure(rule, "cap@2027", "2026-11-26")?.about).toBe("התקרה 2027");
    expect(ruleFigure(rule, "cap", "2030-01-01")?.value).toBe(110);
    expect(ruleFigure(rule, "cap", "2030-01-01")?.about).toBe("התקרה 2027");
  });
});

describe("compact rows keep their own note, never the template's", () => {
  const tplNote = fig("primary", { value: 0.1, notes: "הערה של התבנית" });
  const tplNone = fig("primary", { value: 0.2 });
  it("a row with no note under a template with one ships no note back", () => {
    const row = fig("primary", { value: 0.3 });
    expect(compactFee(row, tplNote)).toEqual({ value: 0.3, notes: "" });
    expect(expandFee(compactFee(row, tplNote), tplNote).notes).toBeUndefined();
  });
  it("a row with a note under a template with none keeps it", () => {
    const row = fig("primary", { value: null, notes: "לא דווח" });
    expect(expandFee(compactFee(row, tplNone), tplNone).notes).toBe("לא דווח");
    expect(compactFee(tplNone, tplNone)).toEqual({ value: 0.2 });
  });
  it("a list's template is a row with a number and no note where one exists", () => {
    const rows = [fig("primary", { value: null, notes: "לא דווח" }), tplNote, tplNone];
    expect(templateRow(rows, (r) => r)).toBe(tplNone);
    expect(templateRow([rows[0]!, tplNote], (r) => r)).toBe(tplNote);
    expect(templateRow([rows[0]!], (r) => r)).toBe(rows[0]);
  });
});
