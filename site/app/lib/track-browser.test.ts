// The track browser's pure logic over the real September 2026 tracks (data/cma/): the order of the groups (F-99, F-100), the filter, the
// search, the sort and its missing figures, and the group headings' figures.
import { describe, expect, it } from "vitest";
import { SORTS, sortInForce, sortableIn, ascending, buildGroups, buildProductView, defaultSort, feeRangeOf, filterTracks, missingYield, pressSort, showsKindChip, showsShortName, sortTracks, type ProductView, type TbData } from "./track-browser";
import { buildTrackBrowser, defaultProduct, trackProductIds } from "./track-browser.server";

const data: TbData = buildTrackBrowser();
const view = (id: string): ProductView => buildProductView(data, id)!;
const gemel = view("kupat-gemel-lehashkaa");

describe("the data the loader ships", () => {
  it("has the six products, the default among them, and every company's name", () => {
    expect(data.products.map((p) => p.id)).toEqual([...trackProductIds]);
    expect(trackProductIds).toContain(defaultProduct);
    expect(gemel.tracks).toHaveLength(143);
    expect(gemel.companies).toHaveLength(12);
    expect(view("provident-for-annuity").tracks).toHaveLength(182);
    expect(view("child-savings-provident").tracks).toHaveLength(41);
    expect(view("pension-comprehensive").tracks).toHaveLength(139);
    expect(view("pension-general").tracks).toHaveLength(131);
  });

  it("the pension products have no kinds, and say so", () => {
    expect(view("pension-comprehensive").hasKinds).toBe(false);
    expect(view("pension-general").hasKinds).toBe(false);
    expect(gemel.hasKinds).toBe(true);
    expect(view("pension-comprehensive").kinds).toEqual([]);
  });

  it("every figure is a sourced value of the regulator's file, with the stale rule", () => {
    const x = gemel.tracks.find((t) => t.id === 13414)!;
    expect(x.fee.source.publisher).toContain("Capital Market");
    expect(x.fee.state).toBe("sourced");
    expect(x.y3?.unit).toBe("pct_per_year");
    expect(x.y3?.rule_ids).toEqual(["CAT-04", "CAT-05"]);
    expect(x.assets?.unit).toBe("nis_millions");
    expect(x.exposure?.stock?.state).toBe("computed");
    expect(x.exposure?.stock?.computed_from?.formula).toBe("F-87");
  });
});

describe("the order of the groups", () => {
  it("companies by their assets in the product, the largest first (F-99)", () => {
    const assets = gemel.companies.map((c) => c.assets!.value as number);
    expect([...assets].sort((a, b) => b - a)).toEqual(assets);
    const harel = gemel.companies.find((c) => c.name === "הראל")!;
    expect(harel.assets!.value as number).toBeCloseTo(19107.85, 2);
    expect(harel.assets!.computed_from?.formula).toBe("F-99");
    expect(harel.tracks).toHaveLength(16);
  });

  it("kinds by the median stock share, the highest first, ties by size (F-100)", () => {
    expect(gemel.kinds[0]!.sub).toBe("עוקב מדד s&p 500");
    expect(gemel.kinds[0]!.median!).toBeCloseTo(99.49, 2);
    const names = gemel.kinds.map((k) => k.sub);
    expect(names.slice(-3)).toEqual(["כספי (שקלי)", "אג\"ח ממשלות", "אג\"ח ממשלתי סחיר"]);
    const medians = gemel.kinds.map((k) => k.median ?? -1);
    expect([...medians].sort((a, b) => b - a)).toEqual(medians);
  });
});

describe("filter and search", () => {
  it("a kind keeps only its tracks; the search matches the name as the company writes it and the company's name", () => {
    expect(filterTracks(gemel, { kind: "מניות", q: "" })).toHaveLength(12);
    expect(filterTracks(gemel, { kind: "", q: "הראל" }).length).toBe(16);
    expect(filterTracks(gemel, { kind: "", q: "xyz-nothing" })).toEqual([]);
    expect(filterTracks(gemel, { kind: "", q: "" })).toHaveLength(143);
  });

  it("quotes, dashes and spaces do not matter in the search", () => {
    const a = filterTracks(gemel, { kind: "", q: 'אג"ח ממשלות' });
    const b = filterTracks(gemel, { kind: "", q: "אגח   ממשלות" });
    expect(a.length).toBeGreaterThan(0);
    expect(b.map((x) => x.id)).toEqual(a.map((x) => x.id));
  });

  it("the search also finds a track by the legal name of its company", () => {
    expect(filterTracks(gemel, { kind: "", q: "הראל פנסיה וגמל" }).length).toBe(16);
  });
});

describe("sorting by a column head", () => {
  const all = gemel.tracks;
  it("the first press gives the natural order: the lowest fee, the most stocks, the largest assets; the second reverses it", () => {
    let s = pressSort(defaultSort, "stock");
    expect(s).toEqual({ id: "stock", dir: 1 });
    const stocks = sortTracks(all, s, "company").map((x) => x.stock);
    expect(stocks[0]!).toBeGreaterThanOrEqual(stocks[1]!);
    expect(ascending(s)).toBe(false);
    s = pressSort(s, "stock");
    expect(ascending(s)).toBe(true);
    const up = sortTracks(all, s, "company").map((x) => x.stock!);
    expect(up[0]!).toBeLessThanOrEqual(up[1]!);

    const fees = sortTracks(all, { id: "fee", dir: 1 }, "company").map((x) => x.fee.value as number);
    expect(fees[0]!).toBeLessThanOrEqual(fees[1]!);
    const big = sortTracks(all, { id: "assets", dir: 1 }, "company").map((x) => x.assets!.value as number);
    expect(big[0]!).toBeGreaterThanOrEqual(big[1]!);
  });

  it("a missing figure is last either way", () => {
    const withGap = view("pension-general");
    const missing = withGap.tracks.filter((x) => x.fee.value === null).length;
    expect(missing).toBeGreaterThan(0);
    for (const dir of [1, -1] as const) {
      const sorted = sortTracks(withGap.tracks, { id: "fee", dir }, "company");
      expect(sorted.slice(-missing).every((x) => x.fee.value === null)).toBe(true);
      expect(sorted.slice(0, sorted.length - missing).every((x) => x.fee.value !== null)).toBe(true);
    }
  });

  it("another column starts in its own natural order", () => {
    expect(pressSort({ id: "fee", dir: -1 }, "assets")).toEqual({ id: "assets", dir: 1 });
  });

  it("there is no sort by past return", () => {
    expect(Object.keys(SORTS).sort()).toEqual(["assets", "dep", "fee", "name", "stock"]);
  });

  it("the name column sorts the short names under a company and the companies under a kind", () => {
    const byCompany = sortTracks(all, { id: "name", dir: 1 }, "company").slice(0, 3).map((x) => x.short);
    const byKind = sortTracks(all, { id: "name", dir: 1 }, "kind").slice(0, 3).map((x) => x.companyName);
    expect([...byCompany].sort((a, b) => a.localeCompare(b, "he"))).toEqual(byCompany);
    expect([...byKind].sort((a, b) => a.localeCompare(b, "he"))).toEqual(byKind);
  });
});

describe("groups", () => {
  const sorted = sortTracks(gemel.tracks, defaultSort, "company");

  it("by company: the groups keep the order of the assets, and a group's tracks the chosen sort", () => {
    const groups = buildGroups(gemel, sorted, "company", data.today);
    expect(groups.map((g) => g.title)).toEqual(gemel.companies.map((c) => c.name));
    const harel = groups.find((g) => g.title === "הראל")!;
    expect(harel.tracks).toHaveLength(16);
    expect(harel.total).toBe(16);
    const fees = harel.tracks.map((x) => x.fee.value as number);
    expect([...fees].sort((a, b) => a - b)).toEqual(fees);
    expect(harel.assets!.computed_from?.formula).toBe("F-99");
  });

  it("a group's fee range is the lowest and highest reported fee of its shown tracks (F-100: Harel 0.54% to 0.61%)", () => {
    const harel = gemel.companies.find((c) => c.name === "הראל")!;
    const range = feeRangeOf(harel.tracks, data.today)!;
    expect(range.low.value).toBe(0.54);
    expect(range.high.value).toBe(0.61);
    expect(range.low.computed_from?.formula).toBe("F-100");
    expect(range.low.unit).toBe("pct_per_year");
    // narrowed by a kind, the range follows the shown tracks
    const sp = harel.tracks.filter((x) => x.sub === "עוקב מדד s&p 500");
    expect(feeRangeOf(sp, data.today)!.low.value).toBe(sp[0]!.fee.value);
    expect(feeRangeOf([], data.today)).toBeNull();
  });

  it("a group with no reported fee has no range", () => {
    const none = view("pension-general").tracks.filter((x) => x.fee.value === null);
    expect(none.length).toBeGreaterThan(0);
    expect(feeRangeOf(none, data.today)).toBeNull();
  });

  it("a chosen kind is one list of every company's track, and the sort orders it across the companies", () => {
    // founder, 2026-11-03: "sorting by דמי ניהול doesnt work" with a kind chosen, when each company held one row under its own heading
    const kind = "עוקב מדדי מניות";
    const shown = filterTracks(gemel, { kind, q: "" });
    expect(sortableIn(gemel, "kind")).toEqual(sortableIn(gemel, "company"));
    const groups = buildGroups(gemel, sortTracks(shown, { id: "fee", dir: -1 }, "kind"), "kind", data.today);
    expect(groups).toHaveLength(1);
    expect(new Set(groups[0]!.tracks.map((x) => x.company)).size).toBe(11);
    // the highest fee first; a track that reported none is last either way
    const fees = groups[0]!.tracks.map((x) => x.fee.value as number | null);
    const reported = fees.filter((f): f is number => f !== null);
    expect(fees.slice(0, reported.length)).toEqual([...reported].sort((a, b) => b - a));
    expect(reported[0]).toBeGreaterThan(reported.at(-1)!);
  });

  it("a product without kinds is always grouped by company", () => {
    const pension = view("pension-comprehensive");
    const groups = buildGroups(pension, sortTracks(pension.tracks, defaultSort, "kind"), "kind", data.today);
    expect(groups.every((g) => g.by === "company")).toBe(true);
  });
});

describe("rows", () => {
  it("a track is marked new when it opened in or after the fee year, and a younger one says it", () => {
    const young = gemel.tracks.find((x) => x.young3);
    expect(young).toBeDefined();
    expect(missingYield(young!, 3)).toBe("פחות מ־3 שנים");
    const old = gemel.tracks.find((x) => !x.young5 && x.y5?.value === null);
    if (old) expect(missingYield(old, 5)).toBe("לא דווח");
    expect(gemel.tracks.some((x) => x.isNew)).toBe(true);
  });

  it("the kind shows as a chip only when the short name leaves it out, and the short name under a kind only when it says more", () => {
    const hala = gemel.tracks.find((x) => x.sub === "הלכה יהודית")!;
    expect(showsKindChip(hala)).toBe(true);
    const shares = gemel.tracks.find((x) => x.sub === "מניות" && x.short === "מניות")!;
    expect(showsKindChip(shares)).toBe(false);
    expect(showsShortName(shares)).toBe(false);
    const split = gemel.tracks.find((x) => x.sub === "אשראי ואג\"ח" && x.short.includes("עם מניות"))!;
    expect(showsShortName(split)).toBe(true);
  });

  it("a self-managed fund shows no yield, and says why (the file reports 0 there; IRA-01: each member directs the money)", () => {
    const ira = view("keren-hishtalmut").tracks.find((x) => x.id === 1487)!;
    expect(ira.selfManaged).toBe(true);
    expect(ira.y3).toBeNull();
    expect(ira.y5).toBeNull();
    expect(missingYield(ira, 3)).toBe(missingYield(ira, 5));
    expect(gemel.tracks.every((x) => !x.selfManaged)).toBe(true);
  });

  it("one kind written two ways is one group (עוקב מדדים - גמיש and עוקב מדדים גמיש)", () => {
    const subs = view("provident-for-annuity").kinds.map((k) => k.sub);
    expect(subs).toContain("עוקב מדדים - גמיש");
    expect(subs).not.toContain("עוקב מדדים גמיש");
  });

  it("a head sorts only where its figure differs inside a group; a fee the rule says is none counts as 0", () => {
    expect(sortableIn(view("keren-hishtalmut"), "company").has("dep")).toBe(false);
    expect(sortableIn(view("provident-for-annuity"), "company").has("dep")).toBe(true);
    // a pension fund's fee is the fund's own, one for all its tracks: within a company it cannot sort
    const pension = sortableIn(view("pension-comprehensive"), "company");
    expect(pension.has("fee")).toBe(false);
    expect(sortInForce(defaultSort, pension)).toEqual({ id: "stock", dir: 1 });
    expect(sortableIn(gemel, "company").has("fee")).toBe(true);
  });

  it("a track's own page is under its company's", () => {
    const x = gemel.tracks[0]!;
    expect(x.href).toBe(`/companies/${data.companies[x.company]!.id}/${x.id}`);
  });
});
