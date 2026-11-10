import { describe, expect, it } from "vitest";
import { chooseProduct, chooseType, countMark, countWords, matches, searchFocus, searchToState, stateToSearch, statusLine, toggleFromPane, typeCounts, type FocusCompany, type FocusData, type FocusProductKind } from "./company-focus";

const kinds: FocusProductKind[] = [
  { id: "keren-hishtalmut", name: "קרן השתלמות", type: "savings", unit: "tracks" },
  { id: "kupat-gemel-lehashkaa", name: "קופת גמל להשקעה", type: "savings", unit: "tracks" },
  { id: "funds-etf", name: "קרנות סל", type: "funds", unit: "funds" },
  { id: "brokerage", name: "חשבון ניירות ערך", type: "trade", unit: "has" },
];
const co = (id: string, name: string, products: string[], group: FocusCompany["group"] = "houses"): FocusCompany => ({ id, name, short: name, group, match: "", line: null, products: products.map((p) => ({ id: p, count: p === "brokerage" ? null : 3, href: `/companies/${id}` })), sections: [], terms: 0 });
const companies = [co("a", "אלפא", ["keren-hishtalmut", "brokerage"]), co("b", "בטא", ["keren-hishtalmut", "kupat-gemel-lehashkaa"], "managers"), co("c", "גמא", ["funds-etf"])];
const data: FocusData = { kinds, companies };
const all = { type: "all" as const, product: null, q: "" };

describe("the two-level filter", () => {
  it("a type with one product behaves as if that product was chosen", () => {
    expect(chooseType(kinds, "trade")).toEqual({ type: "trade", product: "brokerage" });
    expect(chooseType(kinds, "savings")).toEqual({ type: "savings", product: null });
  });
  it("the chosen product chosen again goes back to its type, or to everything when the type has that one product", () => {
    expect(chooseProduct(kinds, { type: "savings", product: "keren-hishtalmut" }, "keren-hishtalmut")).toEqual({ type: "savings", product: null });
    expect(chooseProduct(kinds, { type: "trade", product: "brokerage" }, "brokerage")).toEqual({ type: "all", product: null });
  });
  it("a product row in the pane lights its type and product; chosen again, it returns to everything", () => {
    expect(toggleFromPane(kinds, { type: "all", product: null }, "keren-hishtalmut")).toEqual({ type: "savings", product: "keren-hishtalmut" });
    expect(toggleFromPane(kinds, { type: "savings", product: "keren-hishtalmut" }, "keren-hishtalmut")).toEqual({ type: "all", product: null });
  });
  it("matches by product, by type and by name", () => {
    expect(companies.filter((c) => matches(kinds, c, { ...all, product: "keren-hishtalmut", type: "savings" })).map((c) => c.id)).toEqual(["a", "b"]);
    expect(companies.filter((c) => matches(kinds, c, { ...all, type: "funds" })).map((c) => c.id)).toEqual(["c"]);
    expect(companies.filter((c) => matches(kinds, c, { ...all, q: "בט" })).map((c) => c.id)).toEqual(["b"]);
  });
  it("counts the companies of each type", () => {
    expect(typeCounts(kinds, companies)).toEqual({ all: 3, savings: 2, funds: 1, trade: 1, bank: 0 });
  });
  it("brings the one company a search matches into focus, and none when several match", () => {
    expect(searchFocus(kinds, companies, { ...all, q: "גמ" })).toBe("c");
    expect(searchFocus(kinds, companies, { ...all, q: "א" })).toBe(null);
  });
});

describe("the words", () => {
  it("says one and two as words", () => {
    expect(countWords("tracks", 1)).toBe("מסלול אחד");
    expect(countWords("funds", 2)).toBe("שתי קרנות");
    expect(countWords("deposits", 12)).toBe("12 פיקדונות");
    expect(countWords("has", null)).toBe("יש");
    expect(countMark({ id: "brokerage", count: null, href: "" })).toBe("✓");
  });
  it("the status line follows what is chosen", () => {
    expect(statusLine(kinds, companies, all)).toBe("3 חברות. לחיצה על שם מציגה מה יש לחברה.");
    expect(statusLine(kinds, companies, { ...all, type: "savings" })).toBe("שתי חברות מציעות גמל, השתלמות ופנסיה.");
    expect(statusLine(kinds, companies, { ...all, type: "savings", product: "keren-hishtalmut" })).toBe("שתי חברות מציעות קרן השתלמות. ליד כל שם: מספר המסלולים.");
    expect(statusLine(kinds, companies, { ...all, type: "trade", product: "brokerage" })).toBe("חברה אחת מציעה חשבון ניירות ערך.");
    expect(statusLine(kinds, companies, { ...all, q: "בט" })).toBe("חברה אחת מתאימה לחיפוש.");
  });
});

describe("the address", () => {
  it("round-trips the company, the filter and the search, and leaves out what it does not know", () => {
    const s = { type: "savings" as const, product: "keren-hishtalmut", q: "בט", focus: "b" };
    expect(searchToState(stateToSearch(s, "a"), data)).toEqual(s);
    expect(stateToSearch({ ...all, focus: "a" }, "a")).toBe("");
    expect(searchToState("?company=zz&product=nope&type=savings", data)).toEqual({ type: "savings", product: null });
  });
});
