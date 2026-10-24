import { describe, expect, it } from "vitest";
import { buildSections, emptyFilters, filtersToSearch, fullHaystack, isFiltering, lightHaystack, matchRules, norm, parseFilters, type Haystacks, type LightRule } from "./rules-filter";

const rule = (id: string, over: Partial<LightRule> = {}): LightRule => ({
  id,
  title: `כלל ${id}`,
  shelf: "state",
  file: "tax-hishtalmut.md",
  strength: "primary",
  score: 1,
  prefix: id.split("-")[0]!,
  products: [],
  ...over,
});

const light: LightRule[] = [
  rule("TXH-01", { score: 2, products: ["keren-hishtalmut"], recheck_date: "2027-01-15" }),
  rule("TXH-02", { score: 5, products: ["keren-hishtalmut"] }),
  rule("KH-01", { shelf: "access", file: "keren-hishtalmut.md", products: ["keren-hishtalmut"], recheck_date: "2026-12-01" }),
  rule("PF-01", { shelf: "costs", file: "provident-family-common.md", products: ["common"] }),
  rule("SW-X01", { shelf: "access", file: "switching-and-transfers.md" }),
  rule("TXS-01", { file: "tax-securities-israeli.md", recheck_date: "2027-01-02" }),
];
const hay = (full: Record<string, string> = {}): Haystacks => ({ light: new Map(light.map((r) => [r.id, lightHaystack(r)])), full: new Map(Object.entries(full).map(([k, v]) => [k, norm(v)])) });
const ids = (rs: LightRule[]) => rs.map((r) => r.id);

describe("address", () => {
  it("round-trips every parameter", () => {
    const f = { shelf: "state" as const, product: "keren-hishtalmut", prefix: "TXS", changing: true, ids: ["TXS-01", "TXS-02"], q: "מס" };
    expect(parseFilters(filtersToSearch(f))).toEqual(f);
    expect(filtersToSearch(f)).toContain("ids=TXS-01,TXS-02");
  });
  it("empty is empty, unknown shelf is dropped, prefix is upper-cased", () => {
    expect(filtersToSearch(emptyFilters)).toBe("");
    expect(parseFilters("?shelf=nope&prefix=txs").shelf).toBeNull();
    expect(parseFilters("?prefix=txs").prefix).toBe("TXS");
    expect(isFiltering(parseFilters("?q=%20"))).toBe(false);
    expect(isFiltering(parseFilters("?changing=1"))).toBe(true);
  });
});

describe("matchRules", () => {
  it("combines filters with AND", () => {
    expect(ids(matchRules(light, { ...emptyFilters, shelf: "access" }, hay()))).toEqual(["KH-01", "SW-X01"]);
    expect(ids(matchRules(light, { ...emptyFilters, product: "keren-hishtalmut", shelf: "state" }, hay()))).toEqual(["TXH-01", "TXH-02"]);
    expect(ids(matchRules(light, { ...emptyFilters, prefix: "TXH" }, hay()))).toEqual(["TXH-01", "TXH-02"]);
    expect(ids(matchRules(light, { ...emptyFilters, changing: true }, hay()))).toEqual(["TXH-01", "KH-01", "TXS-01"]);
    expect(ids(matchRules(light, { ...emptyFilters, ids: ["PF-01", "NOPE-1"] }, hay()))).toEqual(["PF-01"]);
  });
  it("text matches id and title at once, the full text once loaded", () => {
    expect(ids(matchRules(light, { ...emptyFilters, q: "txh-02" }, hay()))).toEqual(["TXH-02"]);
    expect(ids(matchRules(light, { ...emptyFilters, q: "פטור" }, hay()))).toEqual([]);
    expect(ids(matchRules(light, { ...emptyFilters, q: "פטור" }, hay({ "PF-01": "יש פטור מלא" })))).toEqual(["PF-01"]);
  });
  it("full haystack reads the sources' publisher and document", () => {
    const h = fullHaystack({ id: "X-1", title: "t", title_he: "כותרת", text_he: "גוף", sources: [{ publisher_he: "רשות המסים", title_he: "פקודת מס הכנסה" }] } as never);
    expect(h).toContain("רשות המסים");
    expect(h).toContain("פקודת מס הכנסה");
  });
});

describe("buildSections", () => {
  it("orders shelves, files by rank and cards by score; experience last in access", () => {
    const s = buildSections(light, false);
    expect(s.map((x) => x.shelf)).toEqual(["state", "costs", "access"]);
    const state = s[0]!;
    expect(state.groups.map((g) => g.id)).toEqual(["state-tax-securities-israeli", "state-tax-hishtalmut"]);
    expect(state.groups[1]!.ids).toEqual(["TXH-02", "TXH-01"]);
    const access = s[2]!;
    expect(access.groups.map((g) => g.id)).toEqual(["access-keren-hishtalmut", "access-experience"]);
    expect(access.groups.at(-1)!.kind).toBe("experience");
  });
  it("groups by recheck month, earliest first, when changing", () => {
    const s = buildSections(matchRules(light, { ...emptyFilters, changing: true }, hay()), true);
    expect(s).toHaveLength(1);
    expect(s[0]!.shelf).toBeNull();
    expect(s[0]!.groups.map((g) => g.id)).toEqual(["month-2026-12", "month-2027-01"]);
    expect(s[0]!.groups[1]!.ids).toEqual(["TXS-01", "TXH-01"]);
  });
  it("empty matches give no section", () => {
    expect(buildSections([], false)).toEqual([]);
    expect(buildSections([], true)).toEqual([]);
  });
});
