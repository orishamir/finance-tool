// The rules and note each CMA value carries, by the value's state and field (data-schema 3.13): a number names the rules that set or
// define it and carries no note beyond what is true of that number alone; an empty value names only the rule that explains it.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { OQ22_TRACKS, buildFees, buildHoldings, buildYields, readCmaFile } from "../src/adapters/cma.ts";

/** The value, or the test fails here where it is missing. */
function need<T>(v: T | null | undefined, what: string): T {
  if (v === null || v === undefined) throw new Error(`missing: ${what}`);
  return v;
}

const source = { url: "https://data.gov.il/he/datasets/cma/gemelnet", title: "t", publisher: "רשות שוק ההון, ביטוח וחיסכון", strength: "primary" as const };
const gemel = { dataset: "gemelnet" as const, report_period: "2026-09", checked: "2026-10-23", source };
const pension = { ...gemel, dataset: "pensia-net" as const };
const fees = (raw: Record<string, string>, extra: Partial<Parameters<typeof buildFees>[1]> = {}, file: typeof gemel | typeof pension = gemel) =>
  buildFees(file, { raw_fields: raw, inception_date: "2010-01-01", fund_classification: "תגמולים ואישית לפיצויים", names: { cma: ["קופה"] }, ...extra });
const UNKNOWN = "הסיבה לא ידועה.";

describe("fee values by state", () => {
  it("a reported balance fee names CAT-36 and CAT-37, and no note", () => {
    const v = fees({ AVG_ANNUAL_MANAGEMENT_FEE: "0.71", AVG_DEPOSIT_FEE: "0" }).avg_annual_management_fee;
    expect(v.rule_ids).toEqual(["CAT-36", "CAT-37"]);
    expect(v.notes).toBeUndefined();
  });

  it("a reported deposit fee adds CAT-35, and no note", () => {
    const v = fees({ AVG_ANNUAL_MANAGEMENT_FEE: "0.71", AVG_DEPOSIT_FEE: "0.05" }).avg_deposit_fee;
    expect(v.rule_ids).toEqual(["CAT-35", "CAT-36", "CAT-37"]);
    expect(v.notes).toBeUndefined();
  });

  it("a reported Pension-Net fee adds CAT-39 on both fields, and no note", () => {
    const v = fees({ AVG_ANNUAL_MANAGEMENT_FEE: "0.16", AVG_DEPOSIT_FEE: "1.47" }, {}, pension);
    expect(v.avg_annual_management_fee.rule_ids).toEqual(["CAT-36", "CAT-37", "CAT-39"]);
    expect(v.avg_deposit_fee.rule_ids).toEqual(["CAT-35", "CAT-36", "CAT-37", "CAT-39"]);
    expect(v.avg_annual_management_fee.notes).toBeUndefined();
    expect(v.avg_deposit_fee.notes).toBeUndefined();
  });

  it("a negative fee keeps its rules and says only that it is as reported", () => {
    const v = fees({ AVG_ANNUAL_MANAGEMENT_FEE: "0.5", AVG_DEPOSIT_FEE: "-0.21" }).avg_deposit_fee;
    expect(v.value).toBe(-0.21);
    expect(v.rule_ids).toEqual(["CAT-35", "CAT-36", "CAT-37"]);
    expect(v.notes).toBe("ערך שלילי, כפי שדווח.");
  });

  it("an empty fee of a track that started after 1 January of the fee's year names CAT-36 and sets the file's start date against that year", () => {
    const v = fees({ AVG_ANNUAL_MANAGEMENT_FEE: "", AVG_DEPOSIT_FEE: "" }, { inception_date: "2025-03-01" });
    for (const x of [v.avg_annual_management_fee, v.avg_deposit_fee]) {
      expect(x.rule_ids).toEqual(["CAT-36"]);
      expect(x.notes).toBe("הממוצע הוא של שנת 2025. תאריך ההקמה של המסלול בנתוני רשות שוק ההון הוא 01.03.2025, אחרי תחילת השנה.");
    }
  });

  it("a fee note says nothing about time since the fee's year, so a December file read the next year stays true", () => {
    const dec = { ...gemel, report_period: "2026-12" };
    const v = fees({ AVG_ANNUAL_MANAGEMENT_FEE: "", AVG_DEPOSIT_FEE: "" }, { inception_date: "2025-03-01" }, dec).avg_annual_management_fee;
    expect(v.notes).toBe("הממוצע הוא של שנת 2025. תאריך ההקמה של המסלול בנתוני רשות שוק ההון הוא 01.03.2025, אחרי תחילת השנה.");
    const later = fees({ AVG_ANNUAL_MANAGEMENT_FEE: "", AVG_DEPOSIT_FEE: "" }, { inception_date: "2026-03-26" }).avg_annual_management_fee;
    expect(later.notes).toBe("הממוצע הוא של שנת 2025. תאריך ההקמה של המסלול בנתוני רשות שוק ההון הוא 26.03.2026, אחרי סוף השנה.");
  });

  it("an empty Pension-Net fee names no rule and says the reason is unknown, whatever the track's start date", () => {
    const v = fees({ AVG_ANNUAL_MANAGEMENT_FEE: "", AVG_DEPOSIT_FEE: "" }, { inception_date: "2026-03-26" }, pension);
    for (const x of [v.avg_annual_management_fee, v.avg_deposit_fee]) {
      expect(x.rule_ids).toEqual([]);
      expect(x.notes).toBe(UNKNOWN);
    }
  });

  it("a track whose start date is 1 January of the fee's year had that full year, so its empty fee is unexplained", () => {
    const v = fees({ AVG_ANNUAL_MANAGEMENT_FEE: "", AVG_DEPOSIT_FEE: "" }, { inception_date: "2025-01-01" }).avg_annual_management_fee;
    expect(v.rule_ids).toEqual([]);
    expect(v.notes).toBe(UNKNOWN);
  });

  it("an empty fee with no known reason names no rule and says the reason is unknown, on both fields", () => {
    const v = fees({ AVG_ANNUAL_MANAGEMENT_FEE: "", AVG_DEPOSIT_FEE: "" }, { fund_id: 1514 });
    for (const x of [v.avg_annual_management_fee, v.avg_deposit_fee]) {
      expect(x.rule_ids).toEqual([]);
      expect(x.notes).toBe(UNKNOWN);
    }
  });

  it("the empty fees of the thirteen tracks open question 22 lists name it, on Gemel-Net only", () => {
    for (const fund_id of OQ22_TRACKS) {
      const v = fees({ AVG_ANNUAL_MANAGEMENT_FEE: "", AVG_DEPOSIT_FEE: "" }, { fund_id, inception_date: "2024-09-09" });
      for (const x of [v.avg_annual_management_fee, v.avg_deposit_fee]) {
        expect(x.rule_ids).toEqual([]);
        expect(x.notes).toBe("הסיבה לא ידועה (CAT OQ22).");
      }
    }
    expect(fees({ AVG_ANNUAL_MANAGEMENT_FEE: "", AVG_DEPOSIT_FEE: "" }, { fund_id: 15424 }, pension).avg_annual_management_fee.notes).toBe(UNKNOWN);
  });

  it("the list of open question 22 is the one the rule base writes", () => {
    const md = readFileSync(fileURLToPath(new URL("../../../.claude/skills/il-finance/references/tracks-catalogue-and-decoder.md", import.meta.url)), "utf8");
    const open = md.slice(md.indexOf("## Open questions"));
    const line = need(open.split("\n").find((l) => l.startsWith("22. ")), "open question 22");
    const listed = need(/\(([^)]*);/.exec(line)?.[1], "the tracks listed in open question 22");
    const ids = new Set<number>();
    for (const m of listed.matchAll(/(\d{5})(?: to (\d{5}))?/g)) for (let id = Number(m[1]); id <= Number(m[2] ?? m[1]); id++) ids.add(id);
    expect(ids.size).toBe(13);
    const byNumber = (a: number, b: number) => a - b;
    expect([...OQ22_TRACKS].sort(byNumber)).toEqual([...ids].sort(byNumber));
  });

  it("an empty deposit fee that the product's regulation has no item for names PF-06 alone", () => {
    const v = fees({ AVG_ANNUAL_MANAGEMENT_FEE: "0.5", AVG_DEPOSIT_FEE: "" }, { fund_classification: "קרנות השתלמות" }).avg_deposit_fee;
    expect(v.rule_ids).toEqual(["PF-06"]);
    expect(v.notes).toBe("אין דמי ניהול מהפקדה בסוג הקופה הזה: התקנות מתירות דמי ניהול מהיתרה בלבד, ולכן השדה ריק גם בנתוני רשות שוק ההון.");
  });
});

describe("holdings values by state", () => {
  const h = need(buildHoldings(gemel, { raw_fields: { TOTAL_ASSETS: "699.8", STOCK_MARKET_EXPOSURE: "681.81", FOREIGN_CURRENCY_EXPOSURE: "-2.1" } }), "holdings");

  it("a reported total names no rule and carries no note", () => {
    expect(h.total_assets.rule_ids).toEqual([]);
    expect(h.total_assets.notes).toBeUndefined();
  });

  it("a reported stock exposure names CAT-44 alone, with the unit and the look-through silence, and nothing CAT-44 contradicts", () => {
    const v = h.stock_market_exposure;
    expect(v.rule_ids).toEqual(["CAT-44"]);
    expect(v.notes).toContain("היחידה של הסכום היא מיליון ₪");
    expect(v.notes).toContain("נלמדת מהשוואה לסך הנכסים");
    expect(v.notes).not.toContain("ש״ח");
    expect(v.notes).toContain("(CAT OQ4)");
    expect(v.notes).toContain("דרך קרן נאמנות, קרן סל או קרן בחו״ל");
    expect(v.notes).not.toContain("נגזרים");
    expect(v.notes).not.toContain("החשיפה של המסלול לשוק המניות בסוף");
  });

  it("a reported currency exposure, negative ones included, carries the same rule and note", () => {
    expect(need(h.foreign_currency_exposure, "currency exposure").rule_ids).toEqual(["CAT-44"]);
    expect(need(h.foreign_currency_exposure, "currency exposure").notes).toBe(h.stock_market_exposure.notes);
  });

  it("an empty total or exposure names no rule and says the reason is unknown", () => {
    const e = need(buildHoldings(gemel, { raw_fields: { TOTAL_ASSETS: "", STOCK_MARKET_EXPOSURE: "", FOREIGN_CURRENCY_EXPOSURE: "" } }), "holdings");
    for (const v of [e.total_assets, e.stock_market_exposure, need(e.foreign_currency_exposure, "currency exposure")]) {
      expect(v.rule_ids).toEqual([]);
      expect(v.notes).toBe(UNKNOWN);
    }
  });
});

describe("yield values by state", () => {
  const at = { ...gemel, report_period: "2026-10" };
  const y = (raw: Record<string, string>, inception_date: string | null) => need(buildYields(at, { raw_fields: raw, inception_date }), "yields");

  it("a reported yield names CAT-04 and CAT-05, and no note", () => {
    const v = y({ AVG_ANNUAL_YIELD_TRAILING_3YRS: "13.95", AVG_ANNUAL_YIELD_TRAILING_5YRS: "-0.4" }, "2003-09-21");
    for (const x of [v.avg_annual_yield_3y, v.avg_annual_yield_5y]) {
      expect(x.rule_ids).toEqual(["CAT-04", "CAT-05"]);
      expect(x.notes).toBeUndefined();
    }
  });

  it("an empty yield of a track younger than the window names CAT-05, with the file's start date counted to the period's end", () => {
    const v = y({ AVG_ANNUAL_YIELD_TRAILING_3YRS: "", AVG_ANNUAL_YIELD_TRAILING_5YRS: "" }, "2023-11-14");
    expect(v.avg_annual_yield_3y.rule_ids).toEqual(["CAT-05"]);
    expect(v.avg_annual_yield_3y.notes).toBe(
      "תאריך ההקמה של המסלול בנתוני רשות שוק ההון הוא 14.11.2023. מאז ועד 31.10.2026, סוף תקופת הדיווח, לא עברו 3 שנים מלאות.",
    );
    expect(v.avg_annual_yield_5y.notes).toContain("לא עברו 5 שנים מלאות");
    expect(v.avg_annual_yield_3y.notes).not.toContain("עוד לא");
  });

  it("an empty yield with no known reason names no rule and says the reason is unknown", () => {
    const v = y({ AVG_ANNUAL_YIELD_TRAILING_3YRS: "", AVG_ANNUAL_YIELD_TRAILING_5YRS: "" }, "2003-09-21");
    for (const x of [v.avg_annual_yield_3y, v.avg_annual_yield_5y]) {
      expect(x.rule_ids).toEqual([]);
      expect(x.notes).toBe(UNKNOWN);
    }
    expect(y({ AVG_ANNUAL_YIELD_TRAILING_3YRS: "" }, null).avg_annual_yield_3y.rule_ids).toEqual([]);
  });
});

describe("the stored files", () => {
  const cmaDir = fileURLToPath(new URL("../../../data/cma", import.meta.url));
  const oct = readCmaFile(cmaDir, "gemelnet", "2026-10");
  const track = (id: number) => need(oct.funds.find((f) => f.fund_id === id), `track ${id}`);

  it("hold the four worked cases: an exposure, a young track's return, a fee average and a total", () => {
    const t15256 = need(track(15256).holdings, "holdings of 15256");
    expect(t15256.stock_market_exposure).toMatchObject({ value: 681.81, rule_ids: ["CAT-44"] });
    expect(t15256.total_assets).toMatchObject({ value: 699.8, rule_ids: [] });
    expect(t15256.total_assets.notes).toBeUndefined();
    const y = need(track(14790).yields, "yields of 14790").avg_annual_yield_3y;
    expect(y).toMatchObject({ value: null, rule_ids: ["CAT-05"] });
    expect(y.notes).toBe("תאריך ההקמה של המסלול בנתוני רשות שוק ההון הוא 14.11.2023. מאז ועד 31.10.2026, סוף תקופת הדיווח, לא עברו 3 שנים מלאות.");
    const fee = track(886).fees.avg_annual_management_fee;
    expect(fee).toMatchObject({ value: 0.71, rule_ids: ["CAT-36", "CAT-37"], effective_from: "2025-01-01" });
    expect(fee.notes).toBeUndefined();
  });

  it("write no rule id, ISO date or month, or reading word into any value's note", () => {
    const bad: string[] = [];
    for (const [dataset, period] of [["gemelnet", "2026-09"], ["gemelnet", "2026-10"], ["pensia-net", "2026-09"], ["pensia-net", "2026-10"]] as const) {
      for (const f of readCmaFile(cmaDir, dataset, period).funds) {
        for (const group of [f.fees, f.holdings ?? {}, f.yields ?? {}]) {
          for (const [k, v] of Object.entries(group) as [string, { notes?: string } | undefined][]) {
            const n = v?.notes ?? "";
            if (/\([A-Z]+-\d+\)|\d{4}-\d{2}|נקראת|נקראות|נפתח/.test(n)) bad.push(`${dataset}@${period} ${f.fund_id} ${k}: ${n}`);
          }
        }
      }
    }
    expect(bad).toEqual([]);
  });
});
