import { describe, expect, it } from "vitest";
import { emptyFilters, facetCounts, filtersToSearch, groupProducts, idInField, parseFilters, passesFilters, shelfGroups, shownShelf, type LightRule } from "./rules-filter";

const rule = (id: string, over: Partial<LightRule> = {}): LightRule => ({
  id,
  title: `כלל ${id}`,
  shelf: "state",
  file: "tax-hishtalmut.md",
  strength: "primary",
  score: 1,
  products: [],
  lead: "",
  pills: [],
  authority: "",
  sources: 1,
  ...over,
});

const light: LightRule[] = [
  rule("TXH-01", { score: 2, products: ["keren-hishtalmut"], recheck_date: "2027-01-15" }),
  rule("TXH-02", { score: 5, products: ["keren-hishtalmut"] }),
  rule("KH-01", { shelf: "access", file: "keren-hishtalmut.md", products: ["keren-hishtalmut"], recheck_date: "2026-12-01" }),
  rule("PF-01", { shelf: "costs", file: "provident-family-common.md", products: ["common"] }),
  rule("SW-01", { shelf: "access", file: "switching-and-transfers.md" }),
  rule("TXS-01", { file: "tax-securities-israeli.md", recheck_date: "2027-01-02" }),
];
const ids = (rs: LightRule[]) => rs.map((r) => r.id);

describe("address", () => {
  it("round-trips every parameter", () => {
    const f = { shelf: "state" as const, product: "keren-hishtalmut", changing: true, q: "מס" };
    expect(parseFilters(filtersToSearch(f))).toEqual(f);
  });
  it("empty is empty; an unknown shelf, an old prefix and old ids are dropped", () => {
    expect(filtersToSearch(emptyFilters)).toBe("");
    expect(parseFilters("?shelf=nope&prefix=txs&ids=TXS-01")).toEqual(emptyFilters);
  });
});

describe("filters", () => {
  it("combine with AND", () => {
    expect(ids(light.filter((r) => passesFilters(r, { ...emptyFilters, shelf: "access" })))).toEqual(["KH-01", "SW-01"]);
    expect(ids(light.filter((r) => passesFilters(r, { ...emptyFilters, product: "keren-hishtalmut", shelf: "state" })))).toEqual(["TXH-01", "TXH-02"]);
    expect(ids(light.filter((r) => passesFilters(r, { ...emptyFilters, changing: true })))).toEqual(["TXH-01", "KH-01", "TXS-01"]);
  });
  it("count what each choice would show given the others", () => {
    const c = facetCounts(light, { ...emptyFilters, product: "keren-hishtalmut", shelf: "access" });
    expect(c.shelf.get("state")).toBe(2);
    expect(c.shelf.get("access")).toBe(1);
    expect(c.product.get("keren-hishtalmut")).toBe(1);
    expect(c.all).toBe(2);
  });
  it("show the asked tab when it has rules, else the first that has", () => {
    const counts = new Map([["costs", 0], ["access", 3]]);
    expect(shownShelf("access", counts)).toBe("access");
    expect(shownShelf("costs", counts)).toBe("access");
    expect(shownShelf(null, new Map())).toBeNull();
  });
});

describe("shelfGroups", () => {
  it("orders files by rank and rules by score", () => {
    expect(shelfGroups(light, "state").map((g) => g.id)).toEqual(["state-tax-securities-israeli", "state-tax-hishtalmut"]);
    expect(shelfGroups(light, "state")[1]!.ids).toEqual(["TXH-02", "TXH-01"]);
    expect(shelfGroups(light, "access").map((g) => g.id)).toEqual(["access-keren-hishtalmut", "access-switching-and-transfers"]);
    expect(shelfGroups([], "state")).toEqual([]);
  });
});

describe("groupProducts", () => {
  it("keeps the layout's order, puts an unknown product last and drops empty groups", () => {
    const g = groupProducts(["keren-hishtalmut", "current-account", "new-thing"]);
    expect(g.map((x) => x.id)).toEqual(["bank", "provident", "other"]);
    expect(g[2]!.ids).toEqual(["new-thing"]);
  });
});

describe("idInField", () => {
  it("reads an id however it was typed, and nothing else", () => {
    expect(idInField(" txh-09 ")).toBe("TXH-09");
    expect(idInField("קרן השתלמות")).toBeNull();
    expect(idInField("TXH")).toBeNull();
  });
});
