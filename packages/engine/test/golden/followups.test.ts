// Golden scenarios S51 to S55 (tests/golden/scenarios.md, Part E, 2026-10-26): the falling index (TXS-02, TXF-03), the
// relief from 60 on a kupat gemel lehashkaa lump sum (TXK-06, F-42 at F-44), the child-savings fee after 21 at the legal
// cap (CS-18) or an entered rate, and money-market custody at a non-bank member (F-14). Expected values are the independent
// check's (tests/golden/expected_calc.py), never the engine's; golden() confirms each one is printed in its scenario.
import { describe, expect, it } from "vitest";
import { memberKindOf, runProvident, runSecurities, type RunResult, type SecuritiesInput } from "../../src/index.ts";
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
    // The manager withholds 20% (TXK-26) and the final tax is settled in the return: flagged as TXK-26, not G-21 (a bank's withholding).
    expect(flagCodes(r)).toContain("TXK-26");
    expect(flagCodes(r)).not.toContain("G-21");
    expect(ruleIds(r)).toContain("TXK-26");
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
    expect(flagCodes(r)).not.toContain("TXK-26");
  });

  const s52 = (grossReturn: number): SecuritiesInput => ({
    goal: { amountNow: 100_000, monthly: 0, months: 60 },
    market: { grossReturn, inflation: 0.025, fxChange: -0.03 },
    fund: { kind: "tase-foreign-fund", recordCurrency: "USD", drag: { management: 0.0007, foreignWithholding: 0.0023 } },
    tariff: { ...s14Tariff, custody: { rate: 0.0015, everyMonths: 3 } },
    profile: {},
  });

  // the fund's annex states no index, so TXF OQ10 holds it between the exchange rate and the CPI (F-04); S52's arithmetic is the exchange
  // rate's, made under that reading
  const fxCtx = { ...ctx, readings: { "TXF OQ10": "fx" as const } };

  it("S52 (a) TASE foreign fund when the shekel strengthens: the real gain is the nominal gain (TXS-02, TXF OQ10)", () => {
    const r = runSecurities(s52(0.06), fxCtx);
    const g = golden("S52");
    g.value("real gain", r.detail.realGain, 30_052.89);
    g.value("tax at exit", r.taxAtExit, 7_513.22);
    g.value("nominal", r.nominal, 119_661.64);
    g.value("real", r.real, 105_763.45);
    g.done();
    expect(r.detail.realGain!).toBeLessThanOrEqual(r.detail.nominalGain!);
    // A TASE foreign fund takes the exchange rate as its index as a reading of TXF-04, which gives the run nothing to read, not under TXF-03
    // (which sends such a fund to TXF-04).
    expect(ruleIds(r)).toContain("TXS-02");
    expect(ruleIds(r)).not.toContain("TXF-04");
    expect(ruleIds(r)).not.toContain("TXF-03");
  });

  it("S52 (b) a nominal loss smaller than the currency's fall: none of it is allowable, and no tax", () => {
    const r = runSecurities(s52(-0.01), fxCtx);
    const g = golden("S52");
    g.value("real gain", r.detail.realGain, -548.57);
    g.value("tax at exit", r.taxAtExit, 0);
    g.value("nominal", r.nominal, 90_367.21);
    g.value("real", r.real, 79_871.45);
    g.done();
    expect(r.detail.fallDisallowed!).toBeGreaterThan(0);
    expect(flagCodes(r)).toContain("G-07");
  });

  // S53 reads 2028 to 2030 at a falling CPI: the exit's surtax threshold, and the kupat gemel lehashkaa's yearly ceiling, are open readings
  // (TXG OQ17, KGL OQ15); every reading gives the same run, since the scenario's income never reaches the threshold and its deposits never
  // reach the ceiling, so the figures stand on the data and carry the questions (method §13)
  const s53a = { goal: { amountNow: 20_000, monthly: 2_000, months: 60 }, market: { grossReturn: 0.06, inflation: -0.01 }, fund: s14Fund, tariff: s14Tariff, profile: {} };
  it("S53 on the data: the same run under every reading of TXG OQ17 and KGL OQ15, flagged with both", () => {
    const r = runSecurities(s53a, ctx);
    expect(r.outcome).toEqual({ code: "eligible" });
    expect(r.flags.map((f) => f.code)).toContain("TXG-OQ17");
    const k = runProvident({ wrapper: "kupat-gemel-lehashkaa", goal: { amountNow: 20_000, monthly: 2_000, months: 60 }, market: { grossReturn: 0.06, inflation: -0.01 }, fees: kglFees, profile: {} }, ctx);
    expect(k.flags.map((f) => f.code)).toEqual(expect.arrayContaining(["TXG-OQ17", "KGL-OQ15"]));
  });
  it("S53 (a) Israeli ETF under CPI deflation: the inflationary amount is zero", () => {
    const r = runSecurities(s53a, ctx);
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

  it("only a bank is a bank for the custody ban: a broker and a foreign broker are non-bank (F-14, 2026-10-26 review)", () => {
    expect(memberKindOf("bank")).toBe("bank");
    expect(memberKindOf("broker")).toBe("non-bank");
    expect(memberKindOf("foreign_broker")).toBe("non-bank");
  });
});
