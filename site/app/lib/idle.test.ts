// The idle-cash screen's run (F-60): the one-year verdict on a bank's offer, the P-03 reading over a year, the small-sum flag.
import { describe, expect, it } from "vitest";
import { compareBundle } from "./compare.server";
import { loadParameters } from "./data.server";
import { buildIdle, negotiateThreshold, type IdleView } from "./idle";

const bundle = compareBundle();
const threshold = negotiateThreshold(loadParameters().find((p) => (p as { method_id?: string }).method_id === "P-03"));
const ok = (balance: number, keep: number, offer: number | null, term: number | null): IdleView => {
  const out = buildIdle(bundle, balance, keep, offer, term, threshold);
  if (out.kind !== "ok") throw new Error(out.kind === "error" ? out.message : out.kind);
  return out;
};

describe("idle cash: the offer on its term (scenario audit 2026-10-24, 7 and 8)", () => {
  it("the renewal case: 100,000 at 3.8 % for a year pays 15 % tax on all of the interest, and the verdict reads the gap against P-03", () => {
    const v = ok(100_000, 0, 3.8, 12);
    expect(v.verdict).not.toBeNull();
    const d = v.verdict!;
    expect(d.termMonths).toBe(12);
    expect(d.offerAfterTax.value).toBeCloseTo(3230, 6); // 3,800 less TXI-03's 15 %
    expect(d.fundAfterTax.value as number).toBeGreaterThan(2000);
    expect(d.gap.value).toBeCloseTo(Math.abs((d.offerAfterTax.value as number) - (d.fundAfterTax.value as number)), 6);
    expect(d.better).toBe("offer");
    expect(d.threshold.value).toBe(1000);
    expect(d.threshold.parameter).toBeTruthy();
    expect(d.worth).toBe((d.gap.value as number) >= 1000);
    expect(d.offerRate.state).toBe("entered");
    expect(d.offerAfterTax.rulesUsed?.some((r) => r.id === "TXI-03")).toBe(true);
    // the verdict is the judgement line, and a hundred thousand is not a small sum
    expect(v.materiality?.amount).toBe(d.gap);
    expect(v.smallSum).toBe(false);
  });
  it("a shorter term rolls the deposit at the same rate, with tax withheld at each maturity: a hair under the single year, not a different answer", () => {
    const year = ok(100_000, 0, 3.8, 12).verdict!;
    const quarter = ok(100_000, 0, 3.8, 3).verdict!;
    expect(quarter.termMonths).toBe(3);
    expect(quarter.offerAfterTax.value as number).toBeLessThan(year.offerAfterTax.value as number);
    expect((year.offerAfterTax.value as number) - (quarter.offerAfterTax.value as number)).toBeLessThan(50);
  });
  it("no term or no offer, no verdict; no threshold, no judgement", () => {
    expect(ok(100_000, 0, 3.8, null).verdict).toBeNull();
    expect(ok(100_000, 0, null, 12).verdict).toBeNull();
    const out = buildIdle(bundle, 100_000, 0, 3.8, 12, null);
    expect(out.kind === "ok" && out.verdict === null && out.materiality === null && out.smallSum === false).toBe(true);
  });
  it("a term over a year is read as a year of it", () => {
    const v = ok(100_000, 0, 3.8, 24).verdict!;
    expect(v.termMonths).toBe(24);
    expect(v.offerAfterTax.value).toBeCloseTo(3230, 6);
  });
  it("the student case: 12,000 less the 300 that must stay is a small sum, judged below the threshold", () => {
    const v = ok(12_000, 300, null, null);
    expect(v.verdict).toBeNull();
    expect(v.smallSum).toBe(true);
    expect(v.materiality?.worth).toBe(false);
    expect(v.materiality?.amount.value as number).toBeLessThan(1000);
  });
});

describe("idle cash: an open minimum keeps makam out of the ranking (review fix 2026-10-24, GOV OQ7)", () => {
  it("has no makam row, lists makam as not evaluated with the open-question reason, and counts it so", () => {
    const v = ok(100_000, 0, null, null);
    expect(v.rows.some((r) => r.id === "makam")).toBe(false);
    const f = v.failed.find((x) => x.id === "makam");
    expect(f?.reasons[0]).toMatchObject({ code: "rule-open", detail: "minimum:GOV-OQ7" });
    expect(v.coverageRows.find((r) => r.id === "makam")?.reasons[0]).toMatchObject({ detail: "minimum:GOV-OQ7" });
    expect(v.rows.some((r) => r.id === "money-market-fund-daily")).toBe(true);
  });
});
