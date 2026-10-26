// Golden scenarios S51 to S55 (tests/golden/scenarios.md, Part E, 2026-10-26): the falling index (TXS-02, TXF-03), the
// relief from 60 on a kupat gemel lehashkaa lump sum (TXK-06, F-42 at F-44), the child-savings fee after 21 at the legal
// cap (CS-18) or an entered rate, and money-market custody at a non-bank member (F-14). Expected values are the independent
// check's (tests/golden/expected_calc.py), never the engine's; golden() confirms each one is printed in its scenario.
import { describe, expect, it } from "vitest";
import { runChildSavings, runProvident, runSecurities, type RunResult, type SecuritiesInput } from "../../src/index.ts";
import { context, golden } from "./harness.ts";

const ctx = context();
const flagCodes = (r: RunResult) => r.flags.map((f) => f.code);
const labelOf = (r: RunResult, ruleId: string) => r.labels.find((l) => l.ruleId === ruleId)?.code;
const ruleIds = (r: RunResult) => r.rules.map((u) => u.id);

const s14Fund = { kind: "israeli-fund" as const, drag: { management: 0.008, variable: 0.003, trustee: 0.000085 }, halfSpread: 0.0005 };
const s14Tariff = { buy: { rate: 0.003, min: 25 }, sell: { rate: 0.003, min: 25 }, custody: { rate: 0.0015, min: 15, everyMonths: 3 } };
const kglFees = { deposit: 0, balance: 0.008, direct: 0.001 };

describe("Part E: follow-ups of 2026-10-26", () => {
  it("S51 kupat gemel lehashkaa, lump sum at 60 with low other income: the reduced brackets apply first (F-44 with F-42)", () => {
    const r = runProvident(
      {
        wrapper: "kupat-gemel-lehashkaa",
        goal: { amountNow: 80_000, monthly: 0, months: 60 },
        market: { grossReturn: 0.06, inflation: 0.025 },
        fees: kglFees,
        profile: { ageAtStart: 55, otherIncome: 60_000 },
      },
      ctx,
    );
    const g = golden("S51");
    g.value("gross balance", r.detail.grossBalance, 102_345.49);
    g.value("real gain", r.detail.realGain, 11_832.84);
    g.value("tax at the brackets", r.taxAtExit, 1_183.28);
    g.value("tax at the full rate", r.detail.fullRateTax, 2_958.21);
    g.value("nominal", r.nominal, 101_162.21);
    g.value("real", r.real, 89_412.65);
    g.value("balance fees", r.fees.balance, 3_638.76);
    g.value("direct expenses", r.fees.direct, 454.85);
    g.done();
    expect(flagCodes(r)).toContain("G-21");
    expect(flagCodes(r)).not.toContain("TXK-06");
    expect(r.formulas).toContain("F-42");
    // The manager's withholding has no age rule, but it is not the securities regulations' (TXS-23).
    expect(ruleIds(r)).not.toContain("TXS-23");
  });

  it("S51 with the refund not claimed (A-14 off): the full rate stays and the run flags the relief it leaves out", () => {
    const r = runProvident(
      {
        wrapper: "kupat-gemel-lehashkaa",
        goal: { amountNow: 80_000, monthly: 0, months: 60 },
        market: { grossReturn: 0.06, inflation: 0.025 },
        fees: kglFees,
        profile: { ageAtStart: 55, otherIncome: 60_000, refundClaimed: false },
      },
      ctx,
    );
    const g = golden("S51");
    g.value("tax at the full rate", r.taxAtExit, 2_958.21);
    g.done();
    expect(flagCodes(r)).toContain("TXK-06");
    expect(flagCodes(r)).not.toContain("G-21");
  });

  const s52 = (grossReturn: number): SecuritiesInput => ({
    goal: { amountNow: 100_000, monthly: 0, months: 60 },
    market: { grossReturn, inflation: 0.025, fxChange: -0.03 },
    fund: { kind: "tase-foreign-fund", ninetyPercentTest: true, drag: { management: 0.0007, foreignWithholding: 0.0023 } },
    tariff: { ...s14Tariff, custody: { rate: 0.0015, everyMonths: 3 } },
    profile: {},
  });

  it("S52 (a) TASE foreign fund when the shekel strengthens: the real gain is the nominal gain (TXS-02, TXF-03)", () => {
    const r = runSecurities(s52(0.06), ctx);
    const g = golden("S52");
    g.value("real gain", r.detail.realGain, 30_052.89);
    g.value("tax at exit", r.taxAtExit, 7_513.22);
    g.value("nominal", r.nominal, 119_661.64);
    g.value("real", r.real, 105_763.45);
    g.done();
    expect(r.detail.realGain!).toBeLessThanOrEqual(r.detail.nominalGain!);
    expect(ruleIds(r)).toEqual(expect.arrayContaining(["TXS-02", "TXF-03"]));
  });

  it("S52 (b) a nominal loss smaller than the currency's fall: none of it is allowable, and no tax", () => {
    const r = runSecurities(s52(-0.01), ctx);
    const g = golden("S52");
    g.value("real gain", r.detail.realGain, -548.57);
    g.value("tax at exit", r.taxAtExit, 0);
    g.value("nominal", r.nominal, 90_367.21);
    g.value("real", r.real, 79_871.45);
    g.done();
    expect(r.detail.fallDisallowed!).toBeGreaterThan(0);
    expect(flagCodes(r)).toContain("G-07");
  });

  it("S53 (a) Israeli ETF under CPI deflation: the inflationary amount is zero", () => {
    const r = runSecurities(
      { goal: { amountNow: 20_000, monthly: 2_000, months: 60 }, market: { grossReturn: 0.06, inflation: -0.01 }, fund: s14Fund, tariff: s14Tariff, profile: {} },
      ctx,
    );
    const g = golden("S53");
    g.value("nominal gain", r.detail.nominalGain, 19_717.36);
    g.value("real gain", r.detail.realGain, 18_862.65);
    g.value("tax at exit", r.taxAtExit, 4_715.66);
    g.value("nominal", r.nominal, 147_697.08);
    g.value("real", r.real, 155_308.75);
    g.done();
  });

  it("S53 (b) kupat gemel lehashkaa under CPI deflation: the base is the nominal gain, labelled a reading", () => {
    const r = runProvident(
      { wrapper: "kupat-gemel-lehashkaa", goal: { amountNow: 20_000, monthly: 2_000, months: 60 }, market: { grossReturn: 0.06, inflation: -0.01 }, fees: kglFees, profile: {} },
      ctx,
    );
    const g = golden("S53");
    g.value("real gain", r.detail.realGain, 21_663.9);
    g.value("tax at exit", r.taxAtExit, 5_415.98);
    g.value("nominal", r.nominal, 153_233.7);
    g.value("real", r.real, 161_130.71);
    g.done();
    expect(labelOf(r, "TXK-07")).toBe("reading");
  });

  for (const [label, feeAfter21, expected] of [
    ["(a) at the legal cap", undefined, { balance: 76_717.55, fees: 2_941.45, tax: 8_534.69, realGain: 34_138.78, net: 68_182.86, real: 41_559.56 }],
    ["(b) at an entered 0.23%", 0.0023, { balance: 79_277, fees: 655.12, tax: 9_174.56, net: 70_102.44, real: 42_729.6 }],
  ] as const) {
    it(`S54 child savings withdrawn at 25, the fee after 21 ${label}`, () => {
      const r = runChildSavings(
        {
          route: "provident",
          doubling: true,
          sex: "boy",
          months: 300,
          market: { grossReturn: 0.06, inflation: 0.02 },
          ...(feeAfter21 === undefined ? {} : { feeAfter21 }),
        },
        ctx,
      );
      const g = golden("S54");
      g.value("balance at 25", r.detail.grossBalance, expected.balance);
      g.value("fees after 21", r.fees.balance, expected.fees);
      g.value("tax if withdrawn", r.taxAtExit, expected.tax);
      if ("realGain" in expected) g.value("real gain", r.detail.realGain, expected.realGain);
      g.value("net", r.nominal, expected.net);
      g.value("real", r.real, expected.real);
      g.done();
      expect(r.feeAfter21).toEqual(feeAfter21 === undefined ? { rate: 0.0105, basis: "cap" } : { rate: 0.0023, basis: "entered" });
      if (feeAfter21 === undefined) expect(flagCodes(r)).toContain("CS-18");
      else expect(flagCodes(r)).not.toContain("CS-18");
      // CS-30 is two companies' own rate: a named example on the guide, never the run's figure.
      expect(ruleIds(r)).not.toContain("CS-30");
    });
  }

  it("S54 an entered rate above the legal cap is bounded by it (CS-18, as F-15 caps every provident fee)", () => {
    const r = runChildSavings({ route: "provident", doubling: true, sex: "boy", months: 300, market: { grossReturn: 0.06, inflation: 0.02 }, feeAfter21: 0.02 }, ctx);
    expect(r.feeAfter21).toEqual({ rate: 0.0105, basis: "entered" });
    const g = golden("S54");
    g.value("fees after 21 at the cap", r.fees.balance, 2_941.45);
    g.done();
  });

  it("S55 daily money-market fund at a non-bank member: its custody line applies (F-14)", () => {
    const r = runSecurities(
      {
        goal: { amountNow: 50_000, monthly: 1_000, months: 24 },
        market: { grossReturn: 0.0325, inflation: 0.03 },
        fund: { kind: "money-market-daily", drag: { management: 0.0016, trustee: 0.0002 } },
        tariff: { custody: { rate: 0.001, everyMonths: 3 } },
        memberKind: "non-bank",
        profile: {},
      },
      ctx,
    );
    const g = golden("S55");
    g.value("real", r.real, 73_630.68);
    g.value("nominal", r.nominal, 78_114.79);
    g.value("fund", r.fees.fund, 231.41);
    g.value("custody", r.fees.custody, 525.11);
    g.value("real gain", r.detail.realGain, -145.27);
    g.value("tax at exit", r.taxAtExit, 0);
    g.done();
    expect(ruleIds(r)).not.toContain("BANK-18");
  });

  it("S55's fund at a bank pays no custody, whatever the tariff says (BRK-17, BANK-18)", () => {
    const r = runSecurities(
      {
        goal: { amountNow: 50_000, monthly: 1_000, months: 24 },
        market: { grossReturn: 0.0325, inflation: 0.03 },
        fund: { kind: "money-market-daily", drag: { management: 0.0016, trustee: 0.0002 } },
        tariff: { custody: { rate: 0.001, everyMonths: 3 } },
        profile: {},
      },
      ctx,
    );
    expect(r.fees.custody).toBe(0);
    expect(ruleIds(r)).toContain("BANK-18");
  });
});
