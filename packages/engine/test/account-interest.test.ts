// F-85 (the rate most banks pay on a current account) and the F-26 yearly reading used by the current-account page.
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { DepositTerms } from "@finance-tool/schema";
import { type BreakRecord, type BreakTerm, type OfferRecord, type PlainDepositRecord, amountOpens, bestOpenOffer, breakCount, breakTermOf, currentAccountYearlyInterest, formulas, listFeeRange, mostCommonRate, oneYearDeposits, plainOneYearDeposits, rateRange, middleIndex } from "../src/index.ts";

/** Every collected deposit record, the latest snapshot of each id, as the site reads them (`loadDepositTerms`): a record re-read on a later day is one record, not two. */
function collectedDeposits(): DepositTerms[] {
  const dir = new URL("../../../data/terms/deposits/", import.meta.url);
  const latest = new Map<string, DepositTerms>();
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
    const r = JSON.parse(readFileSync(new URL(f, dir), "utf8")) as DepositTerms;
    const prev = latest.get(r.id);
    if (!prev || r.snapshot > prev.snapshot) latest.set(r.id, r);
  }
  return [...latest.values()];
}

describe("F-85 the rate most banks pay", () => {
  it("is registered", () => {
    expect(formulas["F-85"]).toBe(mostCommonRate);
  });

  it("takes the most common rate and counts the banks that pay anything", () => {
    expect(mostCommonRate([0, 0, 0, 0, 3, 2, 1, 0.75])).toEqual({ rate: 0, count: 4, of: 8, paying: 4 });
    expect(mostCommonRate([1, 1, 2])).toEqual({ rate: 1, count: 2, of: 3, paying: 3 });
  });

  it("gives a tie to the lower rate", () => {
    expect(mostCommonRate([2, 2, 1, 1])).toEqual({ rate: 1, count: 2, of: 4, paying: 4 });
    expect(mostCommonRate([3, 0, 2, 1])).toEqual({ rate: 0, count: 1, of: 4, paying: 3 });
  });

  it("treats rates that differ only by float noise as one", () => {
    expect(mostCommonRate([0.1 + 0.2, 0.3, 0.3, 5])).toEqual({ rate: 0.3, count: 3, of: 4, paying: 4 });
  });

  it("is null with no bank", () => {
    expect(mostCommonRate([])).toBeNull();
  });

  it("gives 0 with 4 of 8 on the published data", () => {
    const dir = new URL("../../../data/terms/deposits/", import.meta.url);
    const records = readdirSync(dir)
      .filter((f) => f.endsWith("-current-account.json"))
      .map((f) => JSON.parse(readFileSync(new URL(f, dir), "utf8")) as { bank: string; wrapper_id: string; rate_offered: { value: number } });
    expect(records.every((r) => r.wrapper_id === "current-account")).toBe(true);
    expect(new Set(records.map((r) => r.bank)).size).toBe(8);
    expect(mostCommonRate(records.map((r) => r.rate_offered.value))).toEqual({ rate: 0, count: 4, of: 8, paying: 4 });
  });
});

describe("F-86 the range of a deposit's rate across the banks", () => {
  it("is registered", () => {
    expect(formulas["F-86"]).toBe(rateRange);
  });

  it("takes the lowest and the highest rate and counts the banks", () => {
    expect(rateRange([1.8, 1.74, 2.25, 1.55])).toEqual({ lo: 1.55, hi: 2.25, count: 4 });
    expect(rateRange([2])).toEqual({ lo: 2, hi: 2, count: 1 });
  });

  it("is null with no bank", () => {
    expect(rateRange([])).toBeNull();
  });
});

describe("F-105 a provident wrapper's list fee across the managers", () => {
  it("is registered", () => {
    expect(formulas["F-105"]).toBe(listFeeRange);
  });

  it("takes the lowest and the highest fee, counts the managers and those at the legal cap", () => {
    // the printed balance fees of 2026-11-07: Harel 0.7, Mor 0.8 (an offer), Yalin Lapidot 0.9, nine managers at PF-02's 1.05 (Meitav and
    // Ayalon among them, from their binding documents)
    expect(listFeeRange([0.7, 0.8, 0.9, 1.05, 1.05, 1.05, 1.05, 1.05, 1.05, 1.05, 1.05, 1.05], 1.05)).toEqual({ lo: 0.7, hi: 1.05, count: 12, atCap: 9 });
    expect(listFeeRange([0, 4, 0], null)).toEqual({ lo: 0, hi: 4, count: 3, atCap: 0 });
  });

  it("is null over fewer than two managers, so one company's list never stands for the product", () => {
    expect(listFeeRange([0.8], 1.05)).toBeNull();
    expect(listFeeRange([], 1.05)).toBeNull();
  });
});

describe("F-26 the most a current account pays in a year", () => {
  it("is the rate on the first ceiling of the balance, less the tax withheld", () => {
    // Discount: 3% on at most 10,000 NIS, 15% withheld
    expect(currentAccountYearlyInterest(10_000, 3, 10_000, 15)).toBeCloseTo(255, 9);
    expect(currentAccountYearlyInterest(50_000, 3, 10_000, 15)).toBeCloseTo(255, 9);
    expect(currentAccountYearlyInterest(4_000, 2, 10_000, 15)).toBeCloseTo(68, 9);
  });

  it("pays nothing at a rate of 0 or on a balance of 0, and takes the whole balance when the record prints no ceiling", () => {
    expect(currentAccountYearlyInterest(10_000, 0, 10_000, 15)).toBe(0);
    expect(currentAccountYearlyInterest(0, 3, 10_000, 15)).toBe(0);
    expect(currentAccountYearlyInterest(20_000, 1, null, 15)).toBeCloseTo(170, 9);
  });
});

describe("F-86: the middle of rates of one kind (2026-10-31)", () => {
  it("is the middle one, and of an even count the lower of the two", () => {
    expect(middleIndex(3)).toBe(1);
    expect(middleIndex(4)).toBe(1);
    expect(middleIndex(1)).toBe(0);
    expect(middleIndex(0)).toBeNull();
  });
});

describe("F-104 breaking a deposit, over the collected deposits", () => {
  // a one-year bank deposit record with only the fields F-104 reads
  const rec = (bank: string, term: BreakTerm, exits = false, months = 12): BreakRecord => ({
    bank,
    wrapper_id: "bank-deposit",
    term_months: { value: months } as never,
    break: { allowed: term !== "not_allowed", penalty: term, mechanism_text: "", rule_ids: [] },
    exit_points: { exists: exits, every_months: null },
  });

  it("is registered", () => {
    expect(formulas["F-104"]).toBe(breakCount);
  });

  it("reads the break column: not allowed is cannot be broken, otherwise the penalty", () => {
    expect(breakTermOf({ allowed: false, penalty: "not_allowed", mechanism_text: "", rule_ids: [] })).toBe("not_allowed");
    expect(breakTermOf({ allowed: true, penalty: "with_penalty", mechanism_text: "", rule_ids: [] })).toBe("with_penalty");
    expect(breakTermOf({ allowed: true, penalty: "none", mechanism_text: "", rule_ids: [] })).toBe("none");
  });

  it("counts the banks by their deposits' break column and gives each bank whose deposits can be broken", () => {
    const r = breakCount([
      rec("a", "not_allowed"),
      rec("a", "not_allowed", true),
      rec("b", "with_penalty", true),
      rec("b", "with_penalty"),
      rec("c", "none"),
      rec("c", "not_allowed"),
      rec("d", "not_allowed"),
    ]);
    expect(r).toEqual({
      deposits: 7,
      banks: 4,
      lockedBanks: 2,
      lockedBanksWithExits: 1,
      breakable: [
        { bank: "b", deposits: 2, withPenalty: 2, free: 0 },
        { bank: "c", deposits: 2, withPenalty: 0, free: 1 },
      ],
    });
  });

  it("does not let a bank with more rows weigh more", () => {
    const many = Array.from({ length: 12 }, () => rec("m", "not_allowed"));
    expect(breakCount([...many, rec("x", "with_penalty")])).toMatchObject({ banks: 2, lockedBanks: 1, breakable: [{ bank: "x", deposits: 1 }] });
  });

  it("reads only one-year bank deposits", () => {
    expect(breakCount([rec("a", "not_allowed"), rec("b", "none", false, 24), { ...rec("c", "none"), wrapper_id: "current-account" }])).toMatchObject({ deposits: 1, banks: 1, breakable: [] });
  });

  it("is null with no one-year deposit", () => {
    expect(breakCount([])).toBeNull();
    expect(breakCount([rec("a", "none", false, 3)])).toBeNull();
  });

  it("gives the counts of the publications collected", () => {
    const records = collectedDeposits();
    // 100 one-year deposits at 10 banks (every row of the ten banks' standard tables, with Discount's 0811 and Mercantile's 0816
    // CPI-linked rows; no foreign-currency-linked row, tier 2, D2); at 7 banks none can be broken (FIBI, Hapoalim, Leumi, Massad and
    // Mizrahi-Tefahot have deposits with exit points), all of Discount's 11 and Mercantile's 3 can be broken with a penalty, and of One
    // Zero's 3, two with a penalty and its daily one free
    expect(oneYearDeposits(records)).toHaveLength(100);
    expect(breakCount(records)).toEqual({
      deposits: 100,
      banks: 10,
      lockedBanks: 7,
      lockedBanksWithExits: 5,
      breakable: [
        { bank: "discount", deposits: 11, withPenalty: 11, free: 0 },
        { bank: "mercantile", deposits: 3, withPenalty: 3, free: 0 },
        { bank: "one-zero", deposits: 3, withPenalty: 2, free: 1 },
      ],
    });
  });
});

describe("F-108 the best offer an amount opens", () => {
  const offer = (id: string, rate: number | null, min: number, max: number | null = null): OfferRecord => ({
    id,
    rate_offered: { value: rate } as never,
    amount_range: { min: { value: min } as never, max: max === null ? null : ({ value: max } as never) },
  });

  it("is registered", () => {
    expect(formulas["F-108"]).toBe(bestOpenOffer);
  });

  it("opens an offer at or above its minimum and at or below its maximum", () => {
    expect(amountOpens(offer("a", 1, 10_000), 10_000)).toBe(true);
    expect(amountOpens(offer("a", 1, 10_000), 9_999)).toBe(false);
    expect(amountOpens(offer("a", 1, 1_000, 99_999), 99_999)).toBe(true);
    expect(amountOpens(offer("a", 1, 1_000, 99_999), 100_000)).toBe(false);
    expect(amountOpens(offer("a", 1, 50), 5_000_000)).toBe(true);
  });

  it("reads a bound recorded with no number as unknown: nothing past the minimum opens", () => {
    // Yahav's one-year fixed deposit from 50,000 ₪: its table prints the maximum "100,00", which is recorded with no value
    const unknownMax: OfferRecord = { id: "y", rate_offered: { value: 2.15 } as never, amount_range: { min: { value: 50_000 } as never, max: { value: null } as never } };
    expect(amountOpens(unknownMax, 50_000)).toBe(true);
    expect(amountOpens(unknownMax, 50_001)).toBe(false);
    expect(amountOpens(unknownMax, 100_000)).toBe(false);
    expect(amountOpens(unknownMax, 49_999)).toBe(false);
    const unknownMin: OfferRecord = { id: "z", rate_offered: { value: 1 } as never, amount_range: { min: { value: null } as never, max: null } };
    expect(amountOpens(unknownMin, 10_000)).toBe(false);
    // so a higher tier with known bounds takes the amount, and the unknown one is no pick above its minimum
    const tiers = [unknownMax, offer("x", 2.3, 100_000, 200_000), offer("w", 1.95, 1_000, 50_000)];
    expect(bestOpenOffer(tiers, 100_000)?.id).toBe("x");
    expect(bestOpenOffer(tiers, 75_000)).toBeNull();
    expect(bestOpenOffer(tiers, 50_000)?.id).toBe("y");
  });

  it("takes the highest rate the amount opens, then the smaller id, whatever the order", () => {
    const offers = [offer("b", 1.85, 1_000, 249_999), offer("a", 1.75, 10_000, 249_999), offer("c", 2.8, 250_000), offer("d", 1.85, 1_000)];
    expect(bestOpenOffer(offers, 10_000)?.id).toBe("b");
    expect(bestOpenOffer([...offers].reverse(), 10_000)?.id).toBe("b");
    expect(bestOpenOffer(offers, 250_000)?.id).toBe("c");
    expect(bestOpenOffer(offers, 500)).toBeNull();
  });

  it("passes over an offer whose rate is not a number", () => {
    expect(bestOpenOffer([offer("a", null, 0), offer("b", 0.5, 0)], 10_000)?.id).toBe("b");
    expect(bestOpenOffer([offer("a", null, 0)], 10_000)).toBeNull();
  });
});

describe("F-86 each bank's plain one-year deposit", () => {
  const base = { wrapper_id: "bank-deposit" as const, term_months: { value: 12 } as never, rate_type: "fixed" as const, linkage: "none" as const, exit_points: { exists: false, every_months: null }, amount_range: { min: { value: 1_000 } as never, max: null } };
  const rate = (value: number) => ({ rate_offered: { value } as never });

  it("keeps the latest fixed, unlinked one-year deposit of each bank with no exit points and no variant", () => {
    const picked = plainOneYearDeposits<PlainDepositRecord>(
      [
        { ...base, ...rate(3), id: "a-old", bank: "a", snapshot: "2026-10-01" },
        { ...base, ...rate(1), id: "a-new", bank: "a", snapshot: "2026-11-01" },
        { ...base, ...rate(9), id: "a-campaign", bank: "a", snapshot: "2026-11-06", variant: ["campaign" as const] },
        { ...base, ...rate(9), id: "a-exits", bank: "a", snapshot: "2026-11-06", exit_points: { exists: true, every_months: 1 } },
        { ...base, ...rate(9), id: "a-cpi", bank: "a", snapshot: "2026-11-06", linkage: "cpi" as const },
        { ...base, ...rate(9), id: "a-prime", bank: "a", snapshot: "2026-11-06", rate_type: "variable" as const },
        { ...base, ...rate(9), id: "b", bank: "b", snapshot: "2026-10-01", term_months: { value: 24 } as never },
      ],
      10_000,
    );
    expect(picked.map((r) => r.id)).toEqual(["a-new"]);
  });

  it("of a bank's plain deposits on one snapshot, takes the highest rate the amount opens (F-108), then the smaller id", () => {
    // plain deposits of one bank by amount: a lower rate from 10,000 ₪, a higher one from 1,000 ₪, and a tier from 250,000 ₪
    const fibi = [
      { ...base, ...rate(1.75), id: "x-760", bank: "x", snapshot: "2026-11-09", amount_range: { min: { value: 10_000 } as never, max: { value: 249_999 } as never } },
      { ...base, ...rate(1.85), id: "x-835", bank: "x", snapshot: "2026-11-09", amount_range: { min: { value: 1_000 } as never, max: { value: 249_999 } as never } },
      { ...base, ...rate(2.1), id: "x-big", bank: "x", snapshot: "2026-11-09", amount_range: { min: { value: 250_000 } as never, max: null } },
    ];
    expect(plainOneYearDeposits<PlainDepositRecord>(fibi, 10_000).map((r) => r.id)).toEqual(["x-835"]);
    expect(plainOneYearDeposits<PlainDepositRecord>(fibi, 250_000).map((r) => r.id)).toEqual(["x-big"]);
    // a bank none of whose plain deposits the amount opens is left out
    expect(plainOneYearDeposits<PlainDepositRecord>(fibi, 500)).toEqual([]);
    const twins = [{ ...base, ...rate(2), id: "c-2", bank: "c", snapshot: "2026-11-01" }, { ...base, ...rate(2), id: "c-1", bank: "c", snapshot: "2026-11-01" }];
    expect(plainOneYearDeposits<PlainDepositRecord>(twins, 10_000).map((r) => r.id)).toEqual(["c-1"]);
    expect(plainOneYearDeposits<PlainDepositRecord>([...twins].reverse(), 10_000).map((r) => r.id)).toEqual(["c-1"]);
  });

  it("picks the plain deposit of each bank in the publications collected, at P-05's 10,000 ₪", () => {
    // 2026-11-09, nine banks. FIBI and Massad each print two plain one-year deposits, their 835 at 1.85% from 1,000 ₪ (the one
    // 10,000 ₪ opens) and at 1.95% from 250,000 ₪; their 760 has a withdrawal on notice in its exit column. Leumi's 365 (1.8%, 1,000 to 99,999 ₪)
    // and Yahav's from 1,000 ₪ (1.95%, up to 50,000 ₪) are the only ones of theirs 10,000 ₪ opens; the other banks print one each.
    expect(plainOneYearDeposits(collectedDeposits(), 10_000).map((r) => r.id)).toEqual([
      "discount-pikadon-leshana-0122",
      "fibi-pikadon-leshana-kavua-835-from-1000",
      "hapoalim-pikadon-leshana-kavua",
      "jerusalem-pikadon-leshana-kavua",
      "leumi-pakam-kavua-365",
      "massad-pikadon-leshana-kavua-835-from-1000",
      "mercantile-pikadon-leshana-kavua-0122",
      "mizrahi-tefahot-pomelit-kvua-shana-131",
      "yahav-pikadon-leshana-kavua-from-1000",
    ]);
  });
});
