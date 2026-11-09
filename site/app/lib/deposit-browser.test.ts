// The deposits page's list (D92): offers a bank prints under one name stand as one row, linked offers never rank among unlinked ones, and
// a chip counts the offers the chosen amount opens, as the count line does.
import { describe, expect, it } from "vitest";
import { buildDepositBrowser } from "./deposit-browser.server";
import { TERMS, isLinked, offersOf, openCount, opens, rowSplit, rowsOf, sortRows, type DbData, type DbOffer } from "./deposit-browser";
import type { SiteValue } from "./value";

const v = (n: number): SiteValue => ({ value: n }) as unknown as SiteValue;
const offer = (id: string, over: Partial<DbOffer> & { rate: number; min?: number; max?: number | null }): DbOffer => {
  const { rate, min = 1000, max = null, ...rest } = over;
  return {
    id,
    bank: "b1",
    term: "y1",
    name: "פיקדון לשנה",
    kind: "fixed",
    linkage: "none",
    limited: false,
    labels: [],
    rate_offered: v(rate),
    anchor: null,
    spread: null,
    amount_range: { min: v(min), max: max === null ? null : v(max) },
    breakTerm: "not_allowed",
    exits: { exists: false, everyMonths: null },
    ...rest,
  };
};
const names = (id: string) => id;

describe("rows of one name", () => {
  const plain = offer("a", { rate: 2.25 });
  const monthly = offer("b", { rate: 0.5, exits: { exists: true, everyMonths: 1 } });
  const quarterly = offer("c", { rate: 1, exits: { exists: true, everyMonths: 3 } });

  it("merges a bank's offers of one term, kind and name, best rate first, and says what sets them apart", () => {
    const rows = rowsOf([monthly, quarterly, plain]);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.offers.map((o) => o.id)).toEqual(["a", "c", "b"]);
    expect(rowSplit(rows[0]!)).toEqual({ amount: false, exits: true, break: false });
  });

  it("keeps apart what differs in more than the row shows: another bank, term, kind, linkage, kinds or name", () => {
    const others = [
      offer("d", { rate: 1, bank: "b2" }),
      offer("e", { rate: 1, term: "y2" }),
      offer("f", { rate: 1, kind: "variable" }),
      offer("g", { rate: 1, linkage: "cpi" }),
      offer("h", { rate: 1, labels: [{ id: "deposit-campaign" } as DbOffer["labels"][number]] }),
      offer("i", { rate: 1, name: "פיקדון אחר" }),
    ];
    expect(rowsOf([plain, ...others])).toHaveLength(7);
  });

  it("sorts a row by its best rate, and puts linked rows after unlinked ones", () => {
    const rows = rowsOf([monthly, quarterly, plain, offer("x", { rate: 2.3, bank: "b2" }), offer("y", { rate: 2.24, bank: "b3" }), offer("z", { rate: 9, bank: "b4", linkage: "cpi" })]);
    const sorted = sortRows(rows, { id: "rate", dir: 1 }, names);
    expect(sorted.map((r) => r.offers[0]!.id)).toEqual(["x", "a", "y", "z"]);
    const up = sortRows(rows, { id: "rate", dir: -1 }, names);
    expect(up.map((r) => r.offers[0]!.id)).toEqual(["y", "a", "x", "z"]);
  });
});

describe("on the site's own deposits", () => {
  const data: DbData = buildDepositBrowser();

  it("a chip counts only the offers the amount opens", () => {
    for (const a of data.amounts) {
      const amount = a.value as number;
      for (const kind of ["fixed", "variable"] as const)
        for (const term of [null, ...TERMS]) expect(openCount(data, term, kind, amount)).toBe(offersOf(data, term, kind).filter((o) => opens(o, amount)).length);
    }
  });

  it("a row's offers differ only in what its lines show, and every offer stands in one row", () => {
    for (const kind of ["fixed", "variable"] as const)
      for (const term of TERMS) {
        const offers = offersOf(data, term, kind);
        const rows = rowsOf(offers);
        expect(rows.flatMap((r) => r.offers).length).toBe(offers.length);
        for (const r of rows) {
          const same = (f: (o: DbOffer) => unknown) => new Set(r.offers.map((o) => JSON.stringify(f(o)))).size;
          expect(same((o) => [o.bank, o.term, o.kind, o.linkage, o.limited, o.labels.map((l) => l.id), o.anchor, o.name]), r.key).toBe(1);
        }
      }
  });

  it("a linked row is never ranked among the unlinked ones", () => {
    for (const kind of ["fixed", "variable"] as const) {
      const sorted = sortRows(rowsOf(offersOf(data, null, kind)), { id: "rate", dir: 1 }, names);
      const firstLinked = sorted.findIndex((r) => isLinked(r.offers[0]!));
      if (firstLinked >= 0) expect(sorted.slice(firstLinked).every((r) => isLinked(r.offers[0]!))).toBe(true);
    }
  });
});
