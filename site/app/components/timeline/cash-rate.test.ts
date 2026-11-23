// The cash rate a guide's timeline runs: the field takes P-05's range of the wrapper's kind (`cashRateRange`), the device keeps what was
// typed within the widest of those ranges, and the run takes it. A money-market fund's return may fall below zero (P-05 ranges.pct), so −1% is typed, kept and run; an
// interest rate starts at 0 (P-05 ranges.interest, method G-41), and a negative one kept from elsewhere stops the run with G-41's line.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { buildGuidePage } from "../../lib/guide.server";
import { p05Range, runTimeline } from "../../lib/engine";
import { cashRateRange, cashRateRangeOf } from "../../lib/guide-signature";
import { parseOwnRates, STORED_RATE_RANGE, termsOfGoal } from "../../lib/own-rate";
import { cashRateCheck } from "./Timeline";

const bundleOf = (id: string) => {
  const b = buildGuidePage(id)?.bundle;
  if (!b) throw new Error(`${id}: no bundle`);
  return b;
};
const kindOf = (id: string) => {
  const k = cashRateRangeOf(id);
  if (!k) throw new Error(`${id}: not a cash-rate page`);
  return k;
};

describe("a cash rate below zero, from the field to the run", () => {
  it("a money-market fund at −1%: the field takes it, the device keeps it, the run runs it", () => {
    const id = "money-market-fund-daily";
    const b = bundleOf(id);
    expect(cashRateCheck(b.p05, kindOf(id))(-1)).toBeNull();
    const kept = termsOfGoal(parseOwnRates({ guide: { [id]: -1 } }).guide)[id]?.rate;
    expect(kept).toBe(-1);
    const t = runTimeline(b, { entered: { cash_rate: kept }, age: null });
    if (t.kind !== "ok") throw new Error(`the run did not run: ${t.kind}`);
    const last = t.years.at(-1);
    // a return below zero leaves less than was paid in
    expect(last && last.nominal < last.paidIn).toBe(true);
  });

  it("a bank deposit at −1%: the field refuses it, and one kept from elsewhere stops the run on G-41", () => {
    const id = "bank-deposit";
    const b = bundleOf(id);
    expect(cashRateCheck(b.p05, kindOf(id))(-1)).not.toBeNull();
    expect(cashRateCheck(b.p05, kindOf(id))(0)).toBeNull();
    const kept = termsOfGoal(parseOwnRates({ guide: { [id]: -1 } }).guide)[id]?.rate;
    const t = runTimeline(b, { entered: { cash_rate: kept }, age: null });
    expect(t.kind === "blocked" ? t.gap : t.kind).toBe("G-41");
  });

  it("the device keeps every rate a cash-rate field takes, and none no field takes: its range is P-05's widest", () => {
    const p05 = bundleOf("bank-deposit").p05;
    expect(p05Range(p05, "ranges", "pct")).toMatchObject(STORED_RATE_RANGE);
    for (const kind of new Set(Object.values(cashRateRange))) {
      const r = p05Range(p05, "ranges", kind);
      expect(r && r.min >= STORED_RATE_RANGE.min && r.max <= STORED_RATE_RANGE.max, kind).toBe(true);
    }
  });

  it("the timeline's cash-rate field checks by the wrapper's kind, not by the shared percent range", () => {
    // the field's `validate` is what refuses or takes a typed rate: it is the wrapper's kind's check, not the shared percent check
    const src = readFileSync(new URL("./Timeline.tsx", import.meta.url), "utf8");
    const field = src.split("\n").find((l) => l.includes('data-field="cash_rate"'));
    expect(field).toContain("validate={cashCheck}");
    expect(src).toMatch(/const cashCheck = cash \? cashRateCheck\(p05, cash\.rateRange\)/);
  });
});
