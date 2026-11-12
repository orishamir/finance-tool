// A deposit's exit points in words (F-41, 2026-11-12): the interval between them is not the date of the first. Where the record says
// when the first falls (`first_after_months`) and it is not one interval after the start, the words say both ("אחרי 120 חודשים, ואז כל
// 12 חודשים", Bank Hapoalim's חושבים קדימה), and wherever two deposits are told apart by their exit points, the first counts too.
import { describe, expect, it } from "vitest";
import { r4catalogue } from "../copy";
import type { ProductRowData } from "../components/decoder/institutions/types";
import type { DepositTerms } from "@finance-tool/schema";
import { sharedFacts } from "./bank-table";
import { accessOf, rowSplit, rowsOf, sheetNames, type DbData, type DbOffer } from "./deposit-browser";
import { exitPointsOf, exitsText, exitTiming, exitWords, type ExitPoints } from "./deposit-kind";
import { depositSheetNames } from "./guide.server";
import type { SiteValue } from "./value";

const e = (exists: boolean, everyMonths: number | null, firstMonths: number | null = null): ExitPoints => ({ exists, everyMonths, firstMonths });

describe("exitWords", () => {
  it("says none, or some where the record gives no timing", () => {
    expect(exitWords(e(false, null))).toBe(r4catalogue.exits.none);
    expect(exitWords(e(true, null))).toBe(r4catalogue.exits.some);
  });

  it("says a bank's interval alone in its own words", () => {
    expect(exitWords(e(true, 3))).toBe("כל 3 חודשים");
    expect(exitWords(e(true, 1))).toBe("כל חודש");
  });

  it("says a first exit point later than the interval, then the interval", () => {
    expect(exitWords(e(true, 12, 120))).toBe("אחרי 120 חודשים, ואז כל 12 חודשים");
    expect(exitWords(e(true, 3, 6))).toBe("אחרי 6 חודשים, ואז כל 3 חודשים");
    expect(exitWords(e(true, 12, 2))).toBe("אחרי חודשיים, ואז כל 12 חודשים");
  });

  it("says the interval alone where the first falls one interval after the start", () => {
    expect(exitWords(e(true, 3, 3))).toBe("כל 3 חודשים");
  });

  it("says when the first falls where the record gives no interval", () => {
    expect(exitWords(e(true, null, 6))).toBe("הראשונה אחרי 6 חודשים");
    expect(exitTiming(e(true, null, 1))).toBe("הראשונה אחרי חודש");
  });

  it("does not word a first that is not a whole number of months, nor the interval alone after it", () => {
    expect(exitWords(e(true, null, 0.25))).toBe(r4catalogue.exits.some);
    // "כל חודש" alone would hide that the first exit comes after a week
    expect(exitWords(e(true, 1, 0.25))).toBe(r4catalogue.exits.some);
    expect(exitTiming(e(true, 1, 0.25))).toBeNull();
    expect(exitsText(e(true, 1, 0.25), "x")).toBe(r4catalogue.exits.someCard);
  });

  it("points a bank page to the bank's conditions only where the record gives no timing", () => {
    expect(exitsText(e(true, null), "x")).toBe(r4catalogue.exits.someCard);
    expect(exitsText(e(true, null, 6), "x")).toBe("הראשונה אחרי 6 חודשים");
    expect(exitsText(e(true, 12, 120), "x")).toBe("אחרי 120 חודשים, ואז כל 12 חודשים");
    expect(exitsText(e(false, null), "x")).toBe(r4catalogue.exits.none);
  });

  it("reads the record's first exit point, absent or null as unknown", () => {
    expect(exitPointsOf({ exists: true, every_months: 12, first_after_months: 120 })).toEqual(e(true, 12, 120));
    expect(exitPointsOf({ exists: true, every_months: 12 })).toEqual(e(true, 12, null));
    expect(exitPointsOf({ exists: false, every_months: null, first_after_months: null })).toEqual(e(false, null, null));
  });
});

const v = (value: number): SiteValue => ({ value, unit: "pct_per_year", state: "sourced", source: { url: "https://example.org", title: "t", publisher: "p", strength: "institution" }, checked: "2026-11-09", effective_from: "2026-11-09", effective_to: null }) as unknown as SiteValue;
const offer = (id: string, rate: number, exits: ExitPoints): DbOffer => ({
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
  amount_range: { min: v(1000), max: null },
  breakTerm: "not_allowed",
  exits,
});

describe("the deposits page", () => {
  it("says in the access column when the first exit point falls", () => {
    expect(accessOf(offer("a", 1, e(true, 3)))[0]!.words).toBe("יציאה כל 3 חודשים");
    expect(accessOf(offer("a", 1, e(true, 3, 6)))[0]!.words).toBe("יציאה אחרי 6 חודשים, ואז כל 3 חודשים");
    expect(accessOf(offer("a", 1, e(true, null, 6)))[0]!.words).toBe("יציאה ראשונה אחרי 6 חודשים");
    expect(accessOf(offer("a", 1, e(true, null)))[0]!.words).toBe("יש תחנות יציאה");
  });

  it("tells apart two offers of one name whose exit points differ only in the first", () => {
    const early = offer("a", 1, e(true, 3, 3));
    const late = offer("b", 0.9, e(true, 3, 6));
    const rows = rowsOf([early, late]);
    expect(rows).toHaveLength(1);
    expect(rowSplit(rows[0]!).exits).toBe(true);
    const data: DbData = { today: "2026-11-12", read: "2026-11-12", banks: [{ id: "b1", name: "בנק" }], offers: [early, late], amounts: [], start: 10000 };
    const names = sheetNames(data);
    expect(names.get("a")).toContain("כל 3 חודשים");
    expect(names.get("b")).toContain("אחרי 6 חודשים, ואז כל 3 חודשים");
  });
});

describe("the bank page and the guide's sheet", () => {
  it("does not say one exit-point line for the bank's deposits when only their first differs", () => {
    const p = (exitPoints: ExitPoints) =>
      ({ exitPoints, linkage: "none", taxBucket: { value: "unlinked_15" }, term: { value: 12, unit: "months" }, breakTerms: { penalty: "not_allowed", quotes: [] } }) as unknown as ProductRowData;
    expect(sharedFacts([p(e(true, 3, 6)), p(e(true, 3, 6))]).exits).toBe(true);
    expect(sharedFacts([p(e(true, 3, 3)), p(e(true, 3, 6))]).exits).toBe(false);
  });

  it("names two deposits of one name apart by their first exit point", () => {
    const twin = { bank: "x", names: { "447": ["פיקדון"] }, type_447: "t", rate_type: "fixed", linkage: "none" };
    const names = depositSheetNames([
      { ...twin, id: "a", exit_points: { exists: true, every_months: 12 } },
      { ...twin, id: "b", exit_points: { exists: true, every_months: 12, first_after_months: 120 } },
    ] as unknown as DepositTerms[]);
    expect(names.get("a")).toMatch(/תחנת יציאה כל 12 חודשים$/);
    expect(names.get("b")).toMatch(/תחנת יציאה אחרי 120 חודשים, ואז כל 12 חודשים$/);
  });

  it("names a deposit by its exit points in whole Hebrew, whatever the record gives", () => {
    const twin = { bank: "x", names: { "447": ["פיקדון"] }, type_447: "t", rate_type: "fixed", linkage: "cpi" };
    const names = depositSheetNames([
      { ...twin, id: "a", exit_points: { exists: true, every_months: null, first_after_months: 6 } },
      { ...twin, id: "b", exit_points: { exists: true, every_months: null, first_after_months: null } },
      { ...twin, id: "c", exit_points: { exists: true, every_months: null, first_after_months: 0.25 } },
      { ...twin, id: "d", exit_points: { exists: false, every_months: null } },
    ] as unknown as DepositTerms[]);
    // "תחנת יציאה הראשונה אחרי 6 חודשים" and "תחנת יציאה יש" were what the two parts gave when joined
    expect(names.get("a")).toMatch(/ריבית קבועה, צמוד למדד, תחנת יציאה ראשונה אחרי 6 חודשים$/);
    expect(names.get("b")).toMatch(/ריבית קבועה, צמוד למדד, עם תחנות יציאה$/);
    expect(names.get("c")).toMatch(/עם תחנות יציאה( \(\d\))?$/);
    expect(names.get("d")).toMatch(/ריבית קבועה, צמוד למדד$/);
  });
});
