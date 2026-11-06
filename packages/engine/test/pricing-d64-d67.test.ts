// F-102 (D64): a bank's current account, counted on its row unless the person marks the bank as their own. F-103 (D67): a charge for each
// corporate event abroad, priced on each dividend of a fund bought abroad that pays dividends. The snapshots are copies of real records with
// the value under test set here, so the test does not move when a record is refreshed.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { corporateEventFee, countsCurrentAccount, currentAccountFee, providerWorkbench, type ComparedProvider, type ProviderInput, type WorkbenchInput } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";

const ctx = context(loadRules());
const read = (p: string) => JSON.parse(readFileSync(new URL(`../../../data/${p}`, import.meta.url), "utf8"));
const source = { url: "https://example.org/tariff.pdf", title: "תעריפון", publisher: "Test bank", strength: "institution" as const };
const vo = (value: number, unit: string) => ({ value, unit, source, checked: "2026-11-06", effective_from: null, effective_to: null, update_rule: "provider-set", state: "sourced" });
const leumi = { ...read("fees/leumi@2026-11-04.json"), current_account: { monthly_minimum: vo(5.5, "nis_per_month") } };
// the indices page reads a conversion between two foreign currencies apart (site lib/invest `scoped`); so does this test
const oneZeroRecord = read("fees/one-zero@2026-11-04.json");
// and without its own corporate-event line (D67), so the test sets the line it measures
const oneZero = { ...oneZeroRecord, lines: oneZeroRecord.lines.filter((l: { id: string; base: string }) => !l.id.endsWith("fx-to-fx") && l.base !== "corporate_event") };
const eventLine = { id: "one-zero-test-corporate-event", base: "corporate_event", applies_to: ["foreign_securities"], level: "list", rate: vo(50, "usd_per_event"), min: null, max: null, period: null, channel: null, band: null, statement_code: null, names: { tariff: ["הוצאות קסטודיאן בחו\"ל"] } };
const oneZeroEvents = { ...oneZero, lines: [...oneZero.lines.filter((l: { base: string }) => l.base !== "corporate_event"), eventLine] };

const compared = (input: WorkbenchInput): ComparedProvider => {
  const row = providerWorkbench(input, ctx).rows[0]!;
  if (row.kind !== "compared") throw new Error(`${row.id} was not compared: ${JSON.stringify(row.reason)}`);
  return row;
};
const israeli = (p: ProviderInput): WorkbenchInput => ({
  goal: { amountNow: 10_000, monthly: 500, months: 120 },
  market: { grossReturn: 0.06, inflation: 0.02 },
  fund: { kind: "israeli-fund", drag: { management: 0.001 } },
  profile: {},
  behaviour: { ordersPerMonth: 1 },
  instrumentClass: "mutual_fund_units",
  channel: "direct",
  theta: 0.005,
  providers: [p],
});

describe("F-102 the current account at a bank (D64)", () => {
  it("charges the monthly minimum out of what is held, never more than is held", () => {
    expect(currentAccountFee(5.5, 1_000)).toBe(5.5);
    expect(currentAccountFee(5.5, 3)).toBe(3);
    expect(currentAccountFee(undefined, 1_000)).toBe(0);
    expect(currentAccountFee(5.5, -1)).toBe(0);
  });

  it("counts every bank with a current account except the one the person marks, and no house without one", () => {
    expect(countsCurrentAccount(leumi, null)).toBe(true);
    expect(countsCurrentAccount(leumi, "hapoalim")).toBe(true);
    expect(countsCurrentAccount(leumi, "leumi")).toBe(false);
    expect(countsCurrentAccount({ id: "psagot", current_account: undefined }, null)).toBe(false);
  });

  it("a counted current account is a line of its own: 120 monthly minimums paid, and the row's cost grows by about them and their growth", () => {
    const without = compared(israeli({ snapshot: leumi, level: "list" }));
    const counted = compared(israeli({ snapshot: leumi, level: "list", currentAccount: true }));
    expect(without.run.fees.account).toBe(0);
    expect(counted.run.fees.account).toBeCloseTo(120 * 5.5, 6);
    expect(counted.byType.map((t) => t.line)).toContain("account");
    expect(without.byType.map((t) => t.line)).not.toContain("account");
    // the shekels paid, less what inflation takes; more than none and less than they would have grown to at 6% a year
    const extra = counted.horizonCost.value as number;
    const base = without.horizonCost.value as number;
    expect(extra - base).toBeGreaterThan(400);
    expect(extra - base).toBeLessThan(120 * 5.5 * 1.4);
    expect(counted.lineSources.some((s) => s.lineId === "current-account")).toBe(true);
  });

  it("is not a fee the sale gain is reduced by (TXS-06): the exit tax does not fall when it is counted", () => {
    const without = compared(israeli({ snapshot: leumi, level: "list" }));
    const counted = compared(israeli({ snapshot: leumi, level: "list", currentAccount: true }));
    // units removed lower the gain a little, so the tax falls by no more than 25% of the gain those units would have made
    const fall = without.run.taxAtExit - counted.run.taxAtExit;
    expect(fall).toBeGreaterThanOrEqual(0);
    expect(fall).toBeLessThan(0.25 * (counted.run.fees.account * 0.6));
  });
});

describe("F-102 with BANK-35: the payment-account cap from 1.7.2027 is flagged, not applied", () => {
  // the run date is 2026-10-23, so month 1 starts that day and 1.7.2027 falls in month 9
  it("flags the month the cap starts where a counted minimum is above the cap for two actions a month, and keeps the figure", () => {
    const counted = compared(israeli({ snapshot: leumi, level: "list", currentAccount: true }));
    expect(counted.run.flags).toContainEqual({ code: "BANK-35", month: 9 });
    expect(counted.run.fees.account).toBeCloseTo(120 * 5.5, 6);
  });
  it("does not flag a minimum at or under the cap, an account not counted, or a plan that ends before the cap", () => {
    const yahavLike = { ...leumi, current_account: { monthly_minimum: vo(4, "nis_per_month") } };
    expect(compared(israeli({ snapshot: yahavLike, level: "list", currentAccount: true })).run.flags.map((f) => f.code)).not.toContain("BANK-35");
    expect(compared(israeli({ snapshot: leumi, level: "list" })).run.flags.map((f) => f.code)).not.toContain("BANK-35");
    const short = { ...israeli({ snapshot: leumi, level: "list", currentAccount: true }), goal: { amountNow: 10_000, monthly: 500, months: 6 } };
    expect(compared(short).run.flags.map((f) => f.code)).not.toContain("BANK-35");
  });
});

describe("F-103 a charge for each corporate event abroad (D67)", () => {
  it("is the amount at the month's rate, never more than is held", () => {
    expect(corporateEventFee(50, 3.7, 10_000)).toBeCloseTo(185, 9);
    expect(corporateEventFee(50, 3.7, 100)).toBe(100);
    expect(corporateEventFee(undefined, 3.7, 10_000)).toBe(0);
  });

  const abroad = (distribution: { yield: number; perYear: number } | undefined): WorkbenchInput => ({
    goal: { amountNow: 50_000, monthly: 0, months: 60 },
    market: { grossReturn: 0.06, inflation: 0.02, returnIn: "instrument", fxChange: 0 },
    fund: { kind: "foreign-fund", drag: { management: 0.0003 }, domicile: "us", w8ben: true, ...(distribution ? { distribution } : {}) },
    profile: {},
    instrumentClass: "foreign_securities",
    channel: "direct",
    currency: { code: "USD", startRate: 3.7 },
    fx: { USD: 3.7 },
    theta: 0.005,
    providers: [{ snapshot: oneZeroEvents, level: "list" }],
  });

  it("charges 50 dollars on each dividend of a fund bought abroad: four a year for five years at a steady dollar", () => {
    const paying = compared(abroad({ yield: 0.015, perYear: 4 }));
    const plain = compared({ ...abroad({ yield: 0.015, perYear: 4 }), providers: [{ snapshot: oneZero, level: "list" }] });
    expect(paying.run.fees.custody - plain.run.fees.custody).toBeCloseTo(20 * 50 * 3.7, 6);
    expect(paying.linesUsed).toContain("one-zero-test-corporate-event");
    expect(paying.byType.map((t) => t.line)).toContain("custody");
    expect((paying.horizonCost.value as number) - (plain.horizonCost.value as number)).toBeGreaterThan(3_000);
  });

  it("the record's own line is the one measured: 50 dollars for each event, on funds bought abroad", () => {
    const own = oneZeroRecord.lines.filter((l: { base: string }) => l.base === "corporate_event");
    expect(own.map((l: { id: string; rate: { value: number; unit: string }; applies_to: string[] }) => [l.id, l.rate.value, l.rate.unit, l.applies_to])).toEqual([["one-zero-custodian-corporate-event", 50, "usd_per_event", ["foreign_securities"]]]);
  });

  it("leaves an accumulating fund at its price, and a fund in Tel Aviv too", () => {
    const acc = compared(abroad(undefined));
    const accPlain = compared({ ...abroad(undefined), providers: [{ snapshot: oneZero, level: "list" }] });
    expect(acc.run.fees.custody).toBe(accPlain.run.fees.custody);
    expect(acc.linesUsed).not.toContain("one-zero-test-corporate-event");
    const tlv = compared(israeli({ snapshot: oneZeroEvents, level: "list" }));
    const tlvPlain = compared(israeli({ snapshot: oneZero, level: "list" }));
    expect(tlv.horizonCost.value).toBe(tlvPlain.horizonCost.value);
  });

  it("leaves a foreign fund listed in Tel Aviv at its price, though it is quoted in dollars and pays dividends (D67)", () => {
    // the one case where the run has a currency: only the line's own class keeps F-103 off
    const listed = (snapshot: unknown): WorkbenchInput => ({ ...abroad({ yield: 0.015, perYear: 4 }), instrumentClass: "tase_foreign_fund_units", providers: [{ snapshot, level: "list" }] as WorkbenchInput["providers"] });
    const tlv = compared(listed(oneZeroEvents));
    const tlvPlain = compared(listed(oneZero));
    expect(tlv.linesUsed).not.toContain("one-zero-test-corporate-event");
    expect(tlv.run.fees.custody).toBe(tlvPlain.run.fees.custody);
    expect(tlv.horizonCost.value).toBe(tlvPlain.horizonCost.value);
  });
});
