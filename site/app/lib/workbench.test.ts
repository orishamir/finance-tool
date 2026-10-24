// The track workbench's pure parts: who is eligible, the address round trip, the sort and its reversal.
import { describe, expect, it } from "vitest";
import { defaultWbQuery, eligibleOnly, NO_CLASS, parseWbQuery, pressSort, sortRows, wbQueryString, type WbQuery, type WorkbenchRow } from "./workbench";

const fee = (value: number | null) => ({ value }) as never;
const w = (f: number, name: string, over: Partial<WorkbenchRow> = {}, b: number | null = 0.5, pop = ""): WorkbenchRow =>
  ({
    row: { f, c: 0, n: name, sp: "מניות", sub: "", pop, b: fee(b), d: fee(null) },
    company: { name: "חברה", href: "/companies/1" },
    track: { fundId: f, name, href: `/companies/1/${f}` },
    fit: "no-goal",
    outcome: pop ? "ineligible" : "shown",
    key: pop ? "ineligible" : "fits",
    feesHref: "",
    ...over,
  }) as WorkbenchRow;

describe("eligibleOnly", () => {
  const rows = [w(1, "א"), w(2, "ב", {}, 0.1, "עובדי מגזר"), w(3, "ג")];
  it("hides the sector tracks by default and keeps everything when the toggle is off", () => {
    expect(eligibleOnly(rows, true).map((r) => r.row.f)).toEqual([1, 3]);
    expect(eligibleOnly(rows, false).map((r) => r.row.f)).toEqual([1, 2, 3]);
  });
});

describe("the address", () => {
  it("is empty for the defaults", () => {
    expect(wbQueryString(defaultWbQuery)).toBe("");
    expect(parseWbQuery("")).toEqual(defaultWbQuery);
  });
  it("round-trips every control, the no-class chip included", () => {
    const qs: WbQuery[] = [
      { q: "880", sort: "fee-balance", dir: "desc", chip: "מניות", openToAll: false },
      { q: "", sort: "name", dir: "asc", chip: NO_CLASS, openToAll: true },
      { q: "מגדל", sort: "company", dir: "desc", chip: "all", openToAll: true },
    ];
    for (const q of qs) expect(parseWbQuery(wbQueryString(q))).toEqual(q);
  });
  it("falls back on a sort it does not know", () => {
    expect(parseWbQuery("?sort=rank").sort).toBe("company");
  });
});

describe("sort", () => {
  it("a second press reverses, another key starts ascending", () => {
    expect(pressSort({ sort: "company", dir: "asc" }, "company")).toEqual({ sort: "company", dir: "desc" });
    expect(pressSort({ sort: "company", dir: "desc" }, "company")).toEqual({ sort: "company", dir: "asc" });
    expect(pressSort({ sort: "company", dir: "desc" }, "fee-balance")).toEqual({ sort: "fee-balance", dir: "asc" });
  });
  it("descending flips the fees but keeps the unreported ones last", () => {
    const rows = [w(1, "א", {}, 0.3), w(2, "ב", {}, null), w(3, "ג", {}, 0.9)];
    expect(sortRows(rows, "fee-balance", "asc").map((r) => r.row.f)).toEqual([1, 3, 2]);
    expect(sortRows(rows, "fee-balance", "desc").map((r) => r.row.f)).toEqual([3, 1, 2]);
  });
});
