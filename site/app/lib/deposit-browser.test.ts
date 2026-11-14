// The deposits page's list (D92): offers a bank prints under one name stand as one row, linked offers never rank among unlinked ones, and
// a chip counts the offers the chosen amount opens, as the count line does.
import { describe, expect, it } from "vitest";
import { buildDepositBrowser } from "./deposit-browser.server";
import { TERMS, accessOf, interestOn, interestUnknown, isLinked, offersOf, periodBest, rowSplit, rowsOf, sortRows, type DbData, type DbOffer } from "./deposit-browser";
import { depositName, shownName } from "./deposit-kind";
import { entered } from "./value";
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
    exits: { exists: false, everyMonths: null, firstMonths: null },
    ...rest,
  };
};

describe("rows of one name", () => {
  const plain = offer("a", { rate: 2.25 });
  const monthly = offer("b", { rate: 0.5, exits: { exists: true, everyMonths: 1, firstMonths: null } });
  const quarterly = offer("c", { rate: 1, exits: { exists: true, everyMonths: 3, firstMonths: null } });

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
    const sorted = sortRows(rows, { id: "rate", dir: 1 });
    expect(sorted.map((r) => r.offers[0]!.id)).toEqual(["x", "a", "y", "z"]);
    const up = sortRows(rows, { id: "rate", dir: -1 });
    expect(up.map((r) => r.offers[0]!.id)).toEqual(["y", "a", "x", "z"]);
  });
});

describe("on the site's own deposits", () => {
  const data: DbData = buildDepositBrowser();

  it("a period's bar is the highest rate open to everyone that the amount opens, and none is higher in the list", () => {
    for (const a of data.amounts) {
      const amount = a.value as number;
      for (const kind of ["fixed", "variable"] as const)
        for (const term of TERMS) {
          const { pick, gap } = periodBest(data, term, kind, amount);
          const open = offersOf(data, term, kind).filter((o) => !isLinked(o) && !o.limited && typeof o.rate_offered.value === "number" && o.amount_range.min.value !== null && amount >= (o.amount_range.min.value as number) && (o.amount_range.max === null || amount <= (o.amount_range.max.value as number)));
          if (pick) expect(open.every((o) => (o.rate_offered.value as number) <= (pick.rate_offered.value as number))).toBe(true);
          else expect(gap).not.toBeNull();
        }
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
      const sorted = sortRows(rowsOf(offersOf(data, null, kind)), { id: "rate", dir: 1 });
      const firstLinked = sorted.findIndex((r) => isLinked(r.offers[0]!));
      if (firstLinked >= 0) expect(sorted.slice(firstLinked).every((r) => isLinked(r.offers[0]!))).toBe(true);
    }
  });
});

describe("an offer's words and interest", () => {
  it("ranks an offer only some may open among the others, by its rate", () => {
    const rows = rowsOf([offer("a", { rate: 2 }), offer("b", { rate: 3, bank: "b2", limited: true }), offer("c", { rate: 1, bank: "b3" })]);
    expect(sortRows(rows, { id: "rate", dir: 1 }).map((r) => r.offers[0]!.id)).toEqual(["b", "a", "c"]);
  });

  it("says how the money comes out: exit points, a break, or locked to the end", () => {
    expect(accessOf(offer("a", { rate: 1 })).map((x) => x.kind)).toEqual(["locked"]);
    expect(accessOf(offer("b", { rate: 1, breakTerm: "with_penalty" })).map((x) => x.words)).toEqual(["שבירה בקנס"]);
    expect(accessOf(offer("c", { rate: 1, exits: { exists: true, everyMonths: 3, firstMonths: null } }))[0]!.words).toBe("יציאה כל 3 חודשים");
    expect(accessOf(offer("d", { rate: 1, exits: { exists: true, everyMonths: null, firstMonths: null } }))[0]!.words).toBe("יש תחנות יציאה");
  });

  it("computes the interest over the term by F-21: a year's at the rate, a shorter term's at the rate × its share of the year (BANK-50), a longer one yearly", () => {
    const amount = entered(10000, "nis", "2026-11-10");
    const real = buildDepositBrowser().offers.find((o) => typeof o.rate_offered.value === "number")!;
    const plain = { ...real, termDays: undefined, calc: undefined, paidOut: undefined };
    const at = (rate: number, term: DbOffer["term"], more: Partial<DbOffer> = {}) => interestOn({ ...plain, ...more, term, rate_offered: { ...real.rate_offered, value: rate } }, 10000, amount, "2026-11-10")?.value as number | undefined;
    expect(at(3.25, "y1")).toBeCloseTo(325, 6);
    // three months paid at maturity: 10,000 × 2.2% × 3/12 = 55
    expect(at(2.2, "m3")).toBeCloseTo(55, 6);
    // a day: 10,000 × 3.65% / 365 = 1
    expect(at(3.65, "day")).toBeCloseTo(1, 6);
    // Yahav's "(90 יום)": 10,000 × 2.2% × 90/365
    expect(at(2.2, "m3", { termDays: 90 })).toBeCloseTo(10000 * 0.022 * 90 / 365, 6);
    // two years: only at the effective rate the record prints (Mizrahi-Tefahot 166: 2.00%, effective 2.02%), else unknown (BANK OQ21)
    expect(at(2, "y2", { calc: { effectiveAnnual: { ...real.rate_offered, value: 2.02 } } })).toBeCloseTo(10000 * (1.0202 * 1.0202 - 1), 6);
    expect(at(3.5, "y2")).toBeUndefined();
    expect(interestUnknown({ ...plain, term: "y2" })).toBe(true);
    expect(interestUnknown({ ...plain, term: "y1" })).toBe(false);
  });

  it("puts back a parenthesis a table read in visual order left at the name's start", () => {
    expect(shownName("(איתן-בשקלים בריבית קבועה (לשנה ויותר")).toBe("איתן-בשקלים בריבית קבועה (לשנה ויותר)");
    expect(shownName("פיקדון לשנה (365 יום)")).toBe("פיקדון לשנה (365 יום)");
  });

  it("names a deposit by the bank's own name, after the model number where the table prints the kind first (Leumi)", () => {
    expect(depositName({ names: { "447": ["פיקדון לשנה", "דגם: 231/1 חסכון שקלי לשנה", "חסכון שקלי לשנה"] }, type_447: "פיקדון לשנה" } as never)).toBe("חסכון שקלי לשנה");
    expect(depositName({ names: { "447": ["(איתן-בשקלים בריבית קבועה (לשנה ויותר"] }, type_447: "פיקדון לשנה" } as never)).toBe("איתן-בשקלים בריבית קבועה (לשנה ויותר)");
    expect(depositName({ names: { "447": [] }, type_447: "פיקדון לשנה" } as never)).toBe("פיקדון לשנה");
  });
});
