// F-102 (D64): a bank's current account, counted on its row unless the person marks the bank as their own. F-103 (D67): a charge for each
// corporate event abroad, priced on each dividend of a fund bought abroad that pays dividends. The snapshots are copies of real records with
// the value under test set here, so the test does not move when a record is refreshed.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { corporateEventFee, countsCurrentAccount, currentAccountFee, providerWorkbench, runSecurities, withFeeRate, withoutFeeLine, type ComparedProvider, type ProviderInput, type SecuritiesInput, type WorkbenchInput } from "../src/index.ts";
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

/** Printed by tests/golden/expected_d64_d67.py, from docs/method.md alone, at no return, inflation, fund cost or exchange-rate change. */
const EXPECTED = {
  account_all_along: { account: 132.0, custody: 198.3403654080676, left: 21518.129954977325, trade: 151.52967961461155 },
  account_exempt_12: { account: 66.0, custody: 198.94839617249312, left: 21583.45653224366, trade: 151.59507158384713 },
  account_runs_out: { account: 20.0, custody: 0.0, left: 0.0, trade: 0.0 },
  dividends_24: { custody: 1480.0, fx: 392.7085267985702, left: 96161.55487248652, taxDuring: 1965.7366007149062 },
  dividends_run_out: { custody: 398.3938375, fx: 0.0, left: 0.0, taxDuring: 1.6061625000000002 },
};

describe("golden figures of F-102 and F-103 (finance review 2, should-fix 10)", () => {
  const LIST = { rate: 0.001, min: 5 };
  const CUSTODY = { rate: 0.0015, everyMonths: 3 };
  const israeliRun = (tariff: SecuritiesInput["tariff"], goal: SecuritiesInput["goal"]) =>
    runSecurities({ goal, market: { grossReturn: 0, inflation: 0 }, fund: { kind: "israeli-fund", drag: {} }, tariff, profile: {} }, ctx);
  const plan24 = { amountNow: 10_000, monthly: 500, months: 24 };

  it("a current account paid each month after custody, at 5.50 all along", () => {
    const r = israeliRun({ buy: LIST, sell: LIST, custody: CUSTODY, currentAccount: 5.5 }, plan24);
    const e = EXPECTED.account_all_along;
    expect(r.fees.account).toBeCloseTo(e.account, 6);
    expect(r.fees.custody).toBeCloseTo(e.custody, 6);
    expect(r.fees.trade).toBeCloseTo(e.trade, 6);
    expect(r.nominal).toBeCloseTo(e.left, 6);
    expect(r.taxAtExit).toBe(0);
    expect(r.formulas).toContain("F-102");
  });

  it("a group exempt for 12 months pays nothing for them, then the ordinary minimum (F-101)", () => {
    const r = israeliRun({ buy: LIST, sell: LIST, custody: CUSTODY, currentAccount: 0, until: { months: 12, then: { buy: LIST, sell: LIST, custody: CUSTODY, currentAccount: 5.5 } } }, plan24);
    const e = EXPECTED.account_exempt_12;
    expect(r.fees.account).toBeCloseTo(e.account, 6);
    expect(r.fees.custody).toBeCloseTo(e.custody, 6);
    expect(r.fees.trade).toBeCloseTo(e.trade, 6);
    expect(r.nominal).toBeCloseTo(e.left, 6);
  });

  it("never more than is held: 20 held pays 5.50, 5.50, 5.50, then 3.50 and nothing", () => {
    const r = israeliRun({ currentAccount: 5.5 }, { amountNow: 20, monthly: 0, months: 6 });
    expect(r.fees.account).toBeCloseTo(EXPECTED.account_runs_out.account, 9);
    expect(r.nominal).toBeCloseTo(EXPECTED.account_runs_out.left, 9);
  });

  const abroadRun = (amountNow: number, months: number, fx: number) =>
    runSecurities(
      {
        goal: { amountNow, monthly: 0, months },
        market: { grossReturn: 0, inflation: 0, returnIn: "instrument", fxChange: 0 },
        fund: { kind: "foreign-fund", drag: {}, domicile: "ireland", distribution: { yield: 0.04, perYear: 4 } },
        tariff: { currency: { code: "USD", startRate: 3.7 }, fx, perDividend: 50 },
        profile: {},
      },
      ctx,
    );

  it("50 dollars on each of eight dividends, after the dividend is taxed and reinvested", () => {
    const r = abroadRun(100_000, 24, 0.002);
    const e = EXPECTED.dividends_24;
    expect(r.fees.custody).toBeCloseTo(e.custody, 6);
    expect(r.fees.fx).toBeCloseTo(e.fx, 6);
    expect(r.taxDuring).toBeCloseTo(e.taxDuring, 6);
    expect(r.nominal).toBeCloseTo(e.left, 6);
    expect(r.formulas).toContain("F-103");
  });

  it("never more than is held: 400 held pays 185, 185 and what is left", () => {
    const r = abroadRun(400, 12, 0);
    expect(r.fees.custody).toBeCloseTo(EXPECTED.dividends_run_out.custody, 9);
    expect(r.nominal).toBeCloseTo(EXPECTED.dividends_run_out.left, 9);
  });
});

describe("flags and records of F-102 and F-103 (finance review 2)", () => {
  const israeliRun = (tariff: SecuritiesInput["tariff"], months: number) =>
    runSecurities({ goal: { amountNow: 10_000, monthly: 500, months }, market: { grossReturn: 0.05, inflation: 0.02 }, fund: { kind: "israeli-fund", drag: {} }, tariff, profile: {} }, ctx);

  it("BANK-35 sits on the first month from the cap's start that charges above it: an exempt stretch charges nothing", () => {
    // the run date is 2026-10-23: 1.7.2027 is month 9; a group exempt for 48 months first charges in month 49
    const exempt = israeliRun({ currentAccount: 0, until: { months: 48, then: { currentAccount: 5.5 } } }, 120);
    expect(exempt.flags.filter((f) => f.code === "BANK-35")).toEqual([{ code: "BANK-35", month: 49 }]);
    // exempt for the whole plan: no flag
    expect(israeliRun({ currentAccount: 0, until: { months: 48, then: { currentAccount: 5.5 } } }, 48).flags.map((f) => f.code)).not.toContain("BANK-35");
    expect(israeliRun({ currentAccount: 5.5 }, 120).flags).toContainEqual({ code: "BANK-35", month: 9 });
  });

  it("names F-102 and F-103 among the run's formulas only where they charge", () => {
    expect(israeliRun({ currentAccount: 5.5 }, 24).formulas).toContain("F-102");
    expect(israeliRun({ currentAccount: 0 }, 24).formulas).not.toContain("F-102");
    expect(israeliRun({}, 24).formulas).not.toContain("F-103");
  });

  it("flags G-32 on the first charge per dividend in the exit tax year (TXS-06 unsettled), and not before it", () => {
    const run = (months: number) =>
      runSecurities(
        {
          goal: { amountNow: 50_000, monthly: 0, months, firstMonth: 1 },
          market: { grossReturn: 0.06, inflation: 0.02, returnIn: "instrument", fxChange: 0 },
          fund: { kind: "foreign-fund", drag: {}, domicile: "ireland", distribution: { yield: 0.02, perYear: 4 } },
          tariff: { currency: { code: "USD", startRate: 3.7 }, fx: 0, perDividend: 50 },
          profile: {},
        },
        ctx,
      );
    // the run starts in January: months 13 to 24 are the exit tax year of a 24-month plan, and its first dividend is month 15
    expect(run(24).flags.filter((f) => f.code === "G-32")).toEqual([{ code: "G-32", month: 15 }]);
    // a plan that ends in month 14 sells before any dividend of its tax year
    expect(run(14).flags.map((f) => f.code)).not.toContain("G-32");
  });

  it("keeps the current account's sources for every stretch: the group's exemption and the ordinary minimum after it", () => {
    const exemptSource = { url: "https://example.org/annex.pdf", title: "נספח", page: 34 };
    const row = compared(
      israeli({ snapshot: leumi, level: "entered", currentAccount: true, entered: { currentAccount: 0, currentAccountSource: exemptSource, until: { months: 48, then: {} } } }),
    );
    const sources = row.lineSources.filter((x) => x.lineId === "current-account");
    expect(sources.map((x) => [x.level, x.url])).toEqual([
      ["entered", exemptSource.url],
      ["list", leumi.current_account.monthly_minimum.source.url],
    ]);
  });

  it("the sensitivity run: the current account changes in every stretch that charges, and the charge per dividend moves with custody", () => {
    const tariff: SecuritiesInput["tariff"] = { currentAccount: 0, until: { months: 48, then: { currentAccount: 5.5 } } };
    const plan = { run: "runSecurities" as const, input: { goal: { amountNow: 10_000, monthly: 500, months: 120 }, market: { grossReturn: 0.05, inflation: 0.02 }, fund: { kind: "israeli-fund" as const, drag: {} }, tariff, profile: {} } };
    const at3 = withFeeRate(plan, "account", 3);
    expect(at3.run === "runSecurities" ? [at3.input.tariff.currentAccount, at3.input.tariff.until?.then.currentAccount] : null).toEqual([0, 3]);
    const none = withoutFeeLine(plan, "account");
    expect(none.run === "runSecurities" ? [none.input.tariff.currentAccount, none.input.tariff.until?.then.currentAccount] : null).toEqual([undefined, undefined]);
    const abroad = { run: "runSecurities" as const, input: { ...plan.input, tariff: { custody: { rate: 0.001, everyMonths: 3 }, perDividend: 50, currency: { code: "USD", startRate: 3.7 } } } };
    const half = withFeeRate(abroad, "custody", 0.0005);
    expect(half.run === "runSecurities" ? half.input.tariff.perDividend : null).toBeCloseTo(25, 9);
  });
});

describe("F-103 at an average level follows custody (finance review 2, should-fix 7)", () => {
  it("is left out where an average replaces the custody line, and charged where custody is at the list", () => {
    const custody = oneZeroEvents.lines.find((l: { base: string; applies_to: string[] }) => l.base === "custody" && l.applies_to.includes("foreign_securities"));
    expect(custody).toBeDefined();
    // the record's line is 0% with no period; the test gives it a quarter, so an average can be charged on it
    const lines = oneZeroEvents.lines.map((l: { id: string }) => (l.id === custody.id ? { ...l, period: "quarter" } : l));
    const averaged = { ...oneZeroEvents, lines, averages: [{ line_id: custody.id, level: "regulator_average", band: null, rate: vo(0.025, "pct_of_balance_per_period") }] };
    const input = (snapshot: unknown, level: ProviderInput["level"]): WorkbenchInput => ({
      goal: { amountNow: 50_000, monthly: 0, months: 60 },
      market: { grossReturn: 0.06, inflation: 0.02, returnIn: "instrument", fxChange: 0 },
      fund: { kind: "foreign-fund", drag: { management: 0.0003 }, domicile: "us", w8ben: true, distribution: { yield: 0.015, perYear: 4 } },
      profile: {},
      instrumentClass: "foreign_securities",
      channel: "direct",
      currency: { code: "USD", startRate: 3.7 },
      fx: { USD: 3.7 },
      theta: 0.005,
      providers: [{ snapshot, level } as ProviderInput],
    });
    expect(compared(input(averaged, "list")).linesUsed).toContain("one-zero-test-corporate-event");
    const avg = compared(input(averaged, "regulator_average"));
    expect(avg.linesUsed).not.toContain("one-zero-test-corporate-event");
    expect(avg.run.fees.custody).toBeGreaterThan(0);
  });
});
