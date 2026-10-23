// Golden scenarios (tests/golden/scenarios.md) for the formulas release 1 computes (docs/architecture.md §7).
// Inputs are the scenario's own; expected values are the approved independent check.
import { describe, expect, it } from "vitest";
import {
  runBond,
  runChildSavings,
  runDeposit,
  runMakam,
  runProvident,
  runSecurities,
  timeline,
  type RunResult,
  type SecuritiesInput,
} from "../../src/index.ts";
import { context, golden } from "./harness.ts";

const ctx = context();
const flagCodes = (r: RunResult) => r.flags.map((f) => f.code);
const labelOf = (r: RunResult, ruleId: string) => r.labels.find((l) => l.ruleId === ruleId)?.code;
const yearEnd = (r: RunResult, year: number) => r.series[12 * year]!;

// S14's Israeli accumulating ETF at a bank brokerage: reused by S33, S34, S36 and S47.
const s14Fund = {
  kind: "israeli-fund" as const,
  drag: { management: 0.008, variable: 0.003, trustee: 0.000085 },
  halfSpread: 0.0005,
};
const s14Tariff = {
  buy: { rate: 0.003, min: 25 },
  sell: { rate: 0.003, min: 25 },
  custody: { rate: 0.0015, min: 15, everyMonths: 3 },
};
const s08Bond = { coupon: 0.0375, linkage: "unlinked" as const, couponEveryMonths: 12 };
const s08Tariff = {
  buy: { rate: 0.002, min: 30 },
  sell: { rate: 0.002, min: 30 },
  custody: { rate: 0.001, min: 10, everyMonths: 3 },
};

const s11: SecuritiesInput = {
  goal: { amountNow: 50_000, monthly: 1_000, months: 24 },
  market: { grossReturn: 0.0325, inflation: 0.03 },
  fund: { kind: "money-market-daily", drag: { management: 0.0016, trustee: 0.0002 } },
  tariff: {},
  profile: {},
};

describe("Part A: the ledger on single instruments", () => {
  it("S01 unlinked bank deposit, one-month ladder", () => {
    const r = runDeposit(
      {
        goal: { amountNow: 50_000, monthly: 1_000, months: 36 },
        market: { inflation: 0.03 },
        deposit: { rate: 0.035, termMonths: 1, linkage: "unlinked" },
        profile: { annualIncome: 144_000 },
      },
      ctx,
    );
    const g = golden("S01");
    g.value("real", r.real, 86_024.8);
    g.value("nominal", r.nominal, 94_001.62);
    g.value("paid in", r.paidIn, 87_690.8);
    g.value("interest", r.detail.interest, 7_424.49);
    g.value("tax during", r.taxDuring, 1_113.67);
    g.value("tax at exit", r.taxAtExit, 0);
    g.value("TXI-20 deduction", r.detail.txi20Deduction, 0);
    g.value("year 1 balance", yearEnd(r, 1).balance, 63_872.36);
    g.value("year 2 tax to date", yearEnd(r, 2).taxDuring, 666.01);
    g.done();
  });

  it("S02 same deposit, contributions constant in nominal terms", () => {
    const r = runDeposit(
      {
        goal: { amountNow: 50_000, monthly: 1_000, months: 36, contributions: "nominal" },
        market: { inflation: 0.03 },
        deposit: { rate: 0.035, termMonths: 1, linkage: "unlinked" },
        profile: { annualIncome: 144_000 },
      },
      ctx,
    );
    const g = golden("S02");
    g.value("real", r.real, 84_428.96);
    g.value("nominal", r.nominal, 92_257.81);
    g.value("paid in", r.paidIn, 86_000);
    g.value("tax during", r.taxDuring, 1_104.32);
    g.value("tax at exit", r.taxAtExit, 0);
    g.done();
  });

  it("S03 CPI-linked one-year deposit", () => {
    const r = runDeposit(
      {
        goal: { amountNow: 100_000, monthly: 0, months: 36 },
        market: { inflation: 0.03 },
        deposit: { rate: 0.012, termMonths: 12, linkage: "cpi" },
        profile: {},
      },
      ctx,
    );
    const g = golden("S03");
    g.value("real", r.real, 102_724.37);
    g.value("nominal", r.nominal, 112_249.7);
    g.value("tax during", r.taxDuring, 963.88);
    g.value("tax at exit", r.taxAtExit, 0);
    g.value("year 1 tax", yearEnd(r, 1).taxDuring, 309);
    g.done();
  });

  it("S04 prime-linked monthly deposit, 15% bucket by reading", () => {
    const r = runDeposit(
      {
        goal: { amountNow: 50_000, monthly: 1_000, months: 36 },
        market: { inflation: 0.03 },
        deposit: { rate: 0.0475 - 0.014, termMonths: 1, linkage: "prime" },
        profile: { annualIncome: 144_000 },
      },
      ctx,
    );
    const g = golden("S04");
    g.value("real", r.real, 85_771.83);
    g.value("nominal", r.nominal, 93_725.19);
    g.value("tax during", r.taxDuring, 1_064.89);
    g.value("tax at exit", r.taxAtExit, 0);
    g.done();
    expect(labelOf(r, "TXI-04")).toBe("reading");
  });

  it("S05 current-account credit balance", () => {
    const r = runDeposit(
      {
        goal: { amountNow: 30_000, monthly: 0, months: 12 },
        market: { inflation: 0.03 },
        deposit: { kind: "current-account", rate: 0.005, termMonths: 1, linkage: "unlinked" },
        profile: {},
      },
      ctx,
    );
    const g = golden("S05");
    g.value("real", r.real, 29_249.96);
    g.value("nominal", r.nominal, 30_127.46);
    g.value("tax during", r.taxDuring, 22.49);
    g.value("tax at exit", r.taxAtExit, 0);
    g.done();
  });

  it("S06 makam rolled yearly", () => {
    const r = runMakam(
      {
        goal: { amountNow: 100_000, monthly: 0, months: 24 },
        market: { inflation: 0.03 },
        makam: { yield: 0.039 },
        tariff: { buy: { rate: 0.001, min: 20 } },
      },
      ctx,
    );
    const g = golden("S06");
    g.value("real", r.real, 100_411.66);
    g.value("nominal", r.nominal, 106_526.73);
    g.value("trade", r.fees.trade, 203.01);
    g.value("custody", r.fees.custody, 0);
    g.value("tax on the discount", r.taxDuring, 1_187.6);
    g.done();
    expect(r.taxAtExit).toBe(0);
    expect(flagCodes(r)).toContain("G-09");
  });

  it("S07 makam sold before redemption", () => {
    const r = runMakam(
      {
        goal: { amountNow: 100_000, monthly: 0, months: 18 },
        market: { inflation: 0.03 },
        makam: { yield: 0.039 },
        tariff: { buy: { rate: 0.001, min: 20 }, sell: { rate: 0.001, min: 20 } },
      },
      ctx,
    );
    const g = golden("S07");
    g.value("real", r.real, 100_155.62);
    g.value("nominal", r.nominal, 104_696.26);
    g.value("trade", r.fees.trade, 308.11);
    g.value("tax during", r.taxDuring, 584.42);
    g.value("tax at exit", r.taxAtExit, 298.71);
    g.done();
  });

  it("S08 unlinked fixed-rate government bond", () => {
    const r = runBond(
      {
        goal: { amountNow: 100_000, monthly: 0, months: 36 },
        market: { inflation: 0.03 },
        bond: s08Bond,
        tariff: s08Tariff,
        profile: {},
      },
      ctx,
    );
    const g = golden("S08");
    g.value("real", r.real, 98_902.71);
    g.value("nominal", r.nominal, 108_073.66);
    g.value("trade", r.fees.trade, 469.47);
    g.value("custody", r.fees.custody, 1_235.31);
    g.value("tax during", r.taxDuring, 1_725.61);
    g.value("tax at exit", r.taxAtExit, 0);
    g.value("year 1 coupon", r.detail.coupon1, 3_731.3);
    g.value("gain at exit", r.detail.gain, -420.79);
    g.done();
  });

  it("S09 CPI-linked government bond", () => {
    const r = runBond(
      {
        goal: { amountNow: 100_000, monthly: 0, months: 36 },
        market: { inflation: 0.03 },
        bond: { coupon: 0.019, linkage: "cpi", couponEveryMonths: 12 },
        tariff: s08Tariff,
        profile: {},
      },
      ctx,
    );
    const g = golden("S09");
    g.value("real", r.real, 102_625.72);
    g.value("nominal", r.nominal, 112_141.89);
    g.value("trade", r.fees.trade, 481.17);
    g.value("custody", r.fees.custody, 1_270.69);
    g.value("tax during", r.taxDuring, 1_519.94);
    g.value("tax at exit", r.taxAtExit, 0);
    g.value("real gain at exit", r.detail.gain, -439.36);
    g.done();
  });

  it("S10 CPI-linked bond under deflation, no floor", () => {
    const r = runBond(
      {
        goal: { amountNow: 100_000, monthly: 0, months: 36 },
        market: { inflation: -0.01 },
        bond: { coupon: 0.019, linkage: "cpi", couponEveryMonths: 12 },
        tariff: s08Tariff,
        profile: {},
      },
      ctx,
    );
    const g = golden("S10");
    g.value("real", r.real, 102_622.17);
    g.value("nominal", r.nominal, 99_574.19);
    g.value("trade", r.fees.trade, 456.34);
    g.value("custody", r.fees.custody, 1_190.84);
    g.value("tax during", r.taxDuring, 1_403.43);
    g.value("tax at exit", r.taxAtExit, 0);
    g.done();
    expect(flagCodes(r)).toContain("G-07");
  });

  it("S11 daily money-market fund at a bank", () => {
    const r = runSecurities(s11, ctx);
    const g = golden("S11");
    g.value("real", r.real, 74_103.42);
    g.value("nominal", r.nominal, 78_616.31);
    g.value("paid in", r.paidIn, 74_754.06);
    g.value("fund", r.fees.fund, 232.18);
    g.value("trade", r.fees.trade, 0);
    g.value("custody", r.fees.custody, 0);
    g.value("tax during", r.taxDuring, 0);
    g.value("tax at exit", r.taxAtExit, 36.57);
    g.value("real gain", r.detail.realGain, 146.29);
    g.value("year 1 balance", yearEnd(r, 1).balance, 63_927.1);
    g.done();
    expect(labelOf(r, "MF-34")).toBe("proxy");
  });

  it("S12 renewable money-market fund, quarterly dates", () => {
    const r = runSecurities(
      {
        goal: { amountNow: 100_000, monthly: 0, months: 14 },
        market: { grossReturn: 0.0357, inflation: 0.03 },
        fund: { kind: "money-market-renewable", fixedDatesEveryMonths: 3 },
        tariff: {},
        profile: {},
      },
      ctx,
    );
    const g = golden("S12");
    g.value("nominal", r.nominal, 103_427.5);
    g.value("real at the exit date", r.real, 100_415.05);
    g.value("tax at exit", r.taxAtExit, 142.5);
    g.done();
    expect(r.exitMonth).toBe(12);
    expect(Object.values(r.fees).reduce((a, b) => a + b, 0)).toBe(0);
  });

  it("S13 taxable shekel money-market fund (derived)", () => {
    const r = runSecurities({ ...s11, fund: { ...s11.fund, kind: "money-market-taxable" } }, ctx);
    const g = golden("S13");
    g.value("real", r.real, 73_540.48);
    g.value("nominal", r.nominal, 78_019.09);
    g.value("fund", r.fees.fund, 231.18);
    g.value("fund-level tax", r.detail.fundLevelTax, 616.98);
    g.value("tax during", r.taxDuring, 0);
    g.value("tax at exit", r.taxAtExit, 0);
    g.done();
    expect(labelOf(r, "TXS-12")).toBe("derived");
  });

  it("S14 Israeli accumulating ETF on a foreign index, bank brokerage", () => {
    const r = runSecurities(
      {
        goal: { amountNow: 20_000, monthly: 2_000, months: 60 },
        market: { grossReturn: 0.06, inflation: 0.025 },
        fund: s14Fund,
        tariff: s14Tariff,
        profile: {},
      },
      ctx,
    );
    const g = golden("S14");
    g.value("real", r.real, 142_870.22);
    g.value("nominal", r.nominal, 161_644.54);
    g.value("paid in", r.paidIn, 147_853.75);
    g.value("trade", r.fees.trade, 2_053.41);
    g.value("spread", r.fees.spread, 155.42);
    g.value("custody", r.fees.custody, 2_767.14);
    g.value("fund", r.fees.fund, 4_956.03);
    g.value("tax during", r.taxDuring, 0);
    g.value("tax at exit", r.taxAtExit, 2_392.18);
    g.value("real gain", r.detail.realGain, 9_568.74);
    g.value("exit-year custody deducted", r.detail.exitYearFees, 914.59);
    g.value("year 1 balance", yearEnd(r, 1).balance, 45_310.46);
    g.value("year 3 fees to date", yearEnd(r, 3).fees, 4_139.61);
    g.done();
  });

  it("S15 Israeli open tracking fund, same index, no trading costs", () => {
    const r = runSecurities(
      {
        goal: { amountNow: 20_000, monthly: 2_000, months: 60 },
        market: { grossReturn: 0.06, inflation: 0.025 },
        fund: { kind: "israeli-fund", drag: { trustee: 0.0002 } },
        tariff: { ...s14Tariff, buy: { rate: 0.001, min: 10 }, sell: { rate: 0.001, min: 10 } },
        profile: {},
      },
      ctx,
    );
    const g = golden("S15");
    g.value("real", r.real, 147_761.09);
    g.value("nominal", r.nominal, 167_178.12);
    g.value("trade", r.fees.trade, 791.11);
    g.value("spread", r.fees.spread, 0);
    g.value("custody", r.fees.custody, 2_846.86);
    g.value("fund", r.fees.fund, 91.87);
    g.value("tax at exit", r.taxAtExit, 3_777.28);
    g.done();
  });

  it("S16 TASE-registered foreign fund, FX index for tax", () => {
    const r = runSecurities(
      {
        goal: { amountNow: 100_000, monthly: 0, months: 60 },
        market: { grossReturn: 0.06, inflation: 0.025, fxChange: 0.01 },
        fund: { kind: "tase-foreign-fund", ninetyPercentTest: true, drag: { management: 0.0007, foreignWithholding: 0.0023 } },
        tariff: { ...s14Tariff, custody: { rate: 0.0015, everyMonths: 3 } },
        profile: {},
      },
      ctx,
    );
    const g = golden("S16");
    g.value("real", r.real, 106_853.98);
    g.value("nominal", r.nominal, 120_895.47);
    g.value("trade", r.fees.trade, 681.78);
    g.value("spread", r.fees.spread, 0);
    g.value("custody", r.fees.custody, 3_417.8);
    g.value("fund", r.fees.fund, 1_693.24);
    g.value("tax at exit", r.taxAtExit, 6_279.39);
    g.value("real gain vs the exchange rate", r.detail.realGain, 25_117.56);
    g.done();
    expect(labelOf(r, "TXF-11")).toBe("secondary-source");
    expect(r.outcome).toMatchObject({ code: "listed-not-ranked", reason: "G-18" });
  });

  // S17 to S19: a distributing ETF at a foreign broker, in USD. Filled in (Q5): 3.107 NIS/USD, USD 776.56 a share.
  const s17: SecuritiesInput = {
    goal: { amountNow: 100_000, monthly: 2_000, months: 60 },
    market: { grossReturn: 0.06, returnIn: "instrument", inflation: 0.025, fxChange: 0.01 },
    fund: {
      kind: "foreign-fund",
      domicile: "us",
      w8ben: true,
      drag: { management: 0.0003 },
      distribution: { yield: 0.013, perYear: 4 },
      sharePrice: 776.56,
    },
    tariff: {
      currency: { code: "USD", startRate: 3.107 },
      buy: { rate: 0, min: 2.5, in: "instrument", perShareAbove: { shares: 250, perShare: 0.01 } },
      sell: { rate: 0, min: 2.5, in: "instrument", perShareAbove: { shares: 250, perShare: 0.01 } },
      fx: 0.002,
    },
    broker: "foreign",
    profile: {},
  };

  it("S17 US-domiciled distributing ETF at a foreign broker, with W-8BEN", () => {
    const r = runSecurities(s17, ctx);
    const g = golden("S17");
    g.value("real", r.real, 244_184.11);
    g.value("nominal", r.nominal, 276_271.91);
    g.value("trade", r.fees.trade, 653.45);
    g.value("spread", r.fees.spread, 0);
    g.value("custody", r.fees.custody, 0);
    g.value("fund", r.fees.fund, 281.95);
    g.value("fx", r.fees.fx, 1_030.98);
    g.value("foreign tax", r.detail.foreignTax, 3_123.76);
    g.value("Israeli tax", r.detail.israeliTaxOnDistributions, 0);
    g.value("tax at exit", r.taxAtExit, 10_788.08);
    g.value("real gain", r.detail.realGain, 43_152.3);
    g.done();
    expect(r.flags).toContainEqual({ code: "TXF-27", month: 33 });
    expect(flagCodes(r)).toContain("TXF-21");
  });

  it("S18 same ETF without a W-8BEN", () => {
    const r = runSecurities({ ...s17, fund: { ...s17.fund, w8ben: false } }, ctx);
    const g = golden("S18");
    g.value("real", r.real, 243_570.25);
    g.value("nominal", r.nominal, 275_577.38);
    g.value("trade", r.fees.trade, 653.45);
    g.value("fund", r.fees.fund, 281.54);
    g.value("fx", r.fees.fx, 1_029.56);
    g.value("foreign tax", r.detail.foreignTax, 3_743.19);
    g.value("Israeli tax", r.detail.israeliTaxOnDistributions, 0);
    g.value("tax at exit", r.taxAtExit, 10_772.67);
    g.done();
    expect(r.flags).toContainEqual({ code: "TXF-27", month: 33 });
  });

  it("S19 Irish distributing ETF at a foreign broker", () => {
    const r = runSecurities(
      {
        ...s17,
        fund: { ...s17.fund, domicile: "ireland", drag: { management: 0.0007, foreignWithholding: 0.0023 } },
      },
      ctx,
    );
    const g = golden("S19");
    g.value("real", r.real, 242_260.32);
    g.value("nominal", r.nominal, 274_095.31);
    g.value("trade", r.fees.trade, 653.45);
    g.value("fund", r.fees.fund, 2_802.4);
    g.value("fx", r.fees.fx, 1_025.2);
    g.value("foreign tax", r.detail.foreignTax, 0);
    g.value("Israeli tax", r.detail.israeliTaxOnDistributions, 3_103.69);
    g.value("tax at exit", r.taxAtExit, 10_080.97);
    g.done();
    expect(flagCodes(r)).toContain("G-05");
    expect(flagCodes(r)).not.toContain("TXF-27");
  });
});

describe("Part B: provident-family wrappers", () => {
  const kgl = {
    wrapper: "kupat-gemel-lehashkaa" as const,
    goal: { amountNow: 20_000, monthly: 2_000, months: 60 },
    market: { grossReturn: 0.06, inflation: 0.025 },
    fees: { deposit: 0, balance: 0.008, direct: 0.001 },
    profile: {},
  };

  it("S20 kupat gemel lehashkaa, list fees", () => {
    const r = runProvident(kgl, ctx);
    const g = golden("S20");
    g.value("real", r.real, 148_018.98);
    g.value("nominal", r.nominal, 167_469.89);
    g.value("alternative real", r.detail.altReal, 147_690.35);
    g.value("alternative nominal", r.detail.altNominal, 167_098.08);
    g.value("gross balance", r.detail.grossBalance, 170_494.14);
    g.value("balance fees", r.fees.balance, 3_686.78);
    g.value("direct expenses", r.fees.direct, 460.85);
    g.value("deposit fees", r.fees.deposit, 0);
    g.value("tax during", r.taxDuring, 0);
    g.value("tax at exit", r.taxAtExit, 3_024.25);
    g.value("alternative tax", r.detail.altTaxAtExit, 3_396.06);
    g.value("year 2 balance", yearEnd(r, 2).balance, 73_920.26);
    g.done();
    expect(r.routed).toEqual([]);
    expect(flagCodes(r)).toEqual(expect.arrayContaining(["G-11", "G-02"]));
    expect(labelOf(r, "TXK-07")).toBe("institution-source");
  });

  it("S21 kupat gemel lehashkaa, ceiling breached", () => {
    const r = runProvident({ ...kgl, goal: { amountNow: 90_000, monthly: 0, months: 12 } }, ctx);
    const g = golden("S21");
    g.value("accepted", r.paidIn, 83_641);
    g.value("routed", r.routed.reduce((a, x) => a + x.amount, 0), 6_359);
    g.done();
    expect(r.routed).toEqual([{ month: 0, amount: 6_359 }]);
  });

  it("S22 kupat gemel lehashkaa, fee discount cannot end inside 5 years", () => {
    const r = runProvident(
      { ...kgl, fees: { ...kgl.fees, balance: 0.005, discount: { months: 24, listRate: 0.0105 } } },
      ctx,
    );
    const g = golden("S22");
    g.value("real", r.real, 149_026.95);
    g.value("nominal", r.nominal, 168_610.32);
    g.value("alternative real", r.detail.altReal, 148_832.72);
    g.value("balance fees", r.fees.balance, 2_317.48);
    g.value("tax at exit", r.taxAtExit, 3_404.39);
    g.done();
    expect(flagCodes(r)).toContain("PF-13");
  });

  const s23 = {
    wrapper: "keren-hishtalmut" as const,
    goal: { amountNow: 0, monthly: 300, months: 84, contributions: "nominal" as const },
    market: { grossReturn: 0.06, inflation: 0.025 },
    fees: { deposit: 0, balance: 0.006, direct: 0.0011 },
    hishtalmut: { employment: "employee" as const, monthlySalary: 12_000, clockStartMonth: 0 },
    profile: {},
  };

  it("S23 keren hishtalmut, employee, own money past 6 years", () => {
    const r = runProvident(s23, ctx);
    const g = golden("S23");
    g.value("real", r.real, 25_547.77);
    g.value("nominal", r.nominal, 30_368.28);
    g.value("paid in", r.paidIn, 25_200);
    g.value("balance fees", r.fees.balance, 607.7);
    g.value("direct expenses", r.fees.direct, 111.41);
    g.value("tax at exit", r.taxAtExit, 0);
    g.done();
    expect(r.outcome.code).toBe("eligible");
  });

  it("S24(a) keren hishtalmut, horizon 4 years: listed with its value at the 6-year exit", () => {
    const r = runProvident({ ...s23, goal: { ...s23.goal, months: 48 } }, ctx);
    const g = golden("S24");
    g.value("value at month 72", r.nominal, 17_739.1);
    g.value("real at month 72", r.real, 15_296.37);
    g.value("balance at month 48", r.series[48]!.balance, 16_013.59);
    g.done();
    expect(r.exitMonth).toBe(72);
    expect(r.outcome).toMatchObject({ code: "listed-not-ranked", reason: "B3", untilMonth: 72 });
  });

  it("S25 keren hishtalmut, salary above the determining-salary cap (own money)", () => {
    const r = runProvident(
      { ...s23, goal: { ...s23.goal, monthly: 500 }, hishtalmut: { ...s23.hishtalmut, monthlySalary: 20_000 } },
      ctx,
    );
    const g = golden("S25");
    g.value("real", r.real, 42_362.61);
    g.value("nominal", r.nominal, 50_355.83);
    g.value("benefited a month", r.detail.benefitedMonthly, 392.8);
    g.value("excess a month", r.detail.excessMonthly, 107.2);
    g.value("tax on the excess gains", r.taxAtExit, 257.96);
    g.done();
    expect(labelOf(r, "TXH-11")).toBe("institution-source");
  });

  for (const sex of ["boy", "girl"] as const) {
    it(`S31 child savings, provident route, doubled (${sex})`, () => {
      const r = runChildSavings(
        { route: "provident", doubling: true, sex, months: 252, market: { grossReturn: 0.06, inflation: 0.02 } },
        ctx,
      );
      const at18 = r.checkpoints.find((c) => c.month === 216)!;
      const g = golden("S31");
      const [b18, real18, tax18, paid18, gain18, b21, real21, tax21, gain21] =
        sex === "boy"
          ? [52_470.43, 36_737.67, 4_058.57, 30_491.19, 16_234.29, 63_375.24, 41_813.45, 6_009.76, 24_039.04]
          : [52_490.19, 36_751.5, 4_063.51, 30_483.81, 16_254.04, 63_398.77, 41_828.98, 6_015.64, 24_062.57];
      g.value("balance at 18", at18.balance, b18);
      g.value("real at 18", at18.real, real18);
      g.value("tax at 18", at18.taxIfWithdrawn, tax18);
      g.value("paid in by 18", at18.paidIn, paid18);
      g.value("real gain at 18", at18.realGain, gain18);
      g.value("balance at 21", r.detail.grossBalance, b21);
      g.value("real at 21", r.detail.grossBalance! / r.series[252]!.index, real21);
      g.value("tax at 21", r.taxAtExit, tax21);
      g.value("real gain at 21", r.detail.realGain, gain21);
      g.value("grant at 3", r.grants[0]!.amount, 308.81);
      g.value("grant at 12 or 13", r.grants[1]!.amount, sex === "boy" ? 376.44 : 369.06);
      g.value("grant at 21", r.grants[2]!.amount, 882.12);
      g.done();
      expect(r.grants.map((x) => x.month)).toEqual([36, sex === "boy" ? 156 : 144, 252]);
      expect(labelOf(r, "TXK-23")).toBe("secondary-source");
    });
  }

  it("S32 child savings, bank route", () => {
    const r = runChildSavings(
      { route: "bank", doubling: true, sex: "boy", months: 252, market: { rate: 0.03, inflation: 0.02 } },
      ctx,
    );
    const at18 = r.checkpoints.find((c) => c.month === 216)!;
    const g = golden("S32");
    g.value("nominal at 18", at18.balance, 39_701.73);
    g.value("real at 18", at18.real, 27_797.54);
    g.value("interest at 18", at18.gain, 9_210.54);
    g.value("tax at 18", at18.taxIfWithdrawn, 1_381.58);
    g.value("nominal at 21", r.detail.grossBalance, 44_265.27);
    g.value("real at 21", r.detail.grossBalance! / r.series[252]!.index, 29_205.15);
    g.value("interest at 21", r.detail.gain, 12_891.96);
    g.value("tax at 21", r.taxAtExit, 1_933.79);
    g.value("net at 21", r.nominal, 42_331.47);
    g.done();
    expect(flagCodes(r)).toContain("CS-23");
  });

  it("S33 IRA hishtalmut with brokerage inside", () => {
    const r = runSecurities(
      {
        goal: { amountNow: 250_000, monthly: 0, months: 60 },
        market: { grossReturn: 0.06, inflation: 0.025 },
        fund: s14Fund,
        tariff: {
          buy: { rate: 0.001, min: 15 },
          sell: { rate: 0.001, min: 15 },
          custody: { rate: 0.0005, everyMonths: 3 },
        },
        wrapper: { kind: "ira-hishtalmut", managerFee: 0.003, clockStartMonth: -72 },
        profile: {},
      },
      ctx,
    );
    const g = golden("S33");
    g.value("real", r.real, 272_096.32);
    g.value("nominal", r.nominal, 307_852.01);
    g.value("trade", r.fees.trade, 557.91);
    g.value("spread", r.fees.spread, 278.97);
    g.value("custody", r.fees.custody, 2_795.48);
    g.value("fund", r.fees.fund, 15_380.19);
    g.value("IRA manager", r.fees.manager, 4_178.85);
    g.value("tax", r.taxAtExit + r.taxDuring, 0);
    g.value("year 1 balance", yearEnd(r, 1).balance, 260_393.3);
    g.done();
  });
});

describe("Part C: exit-year tax features", () => {
  it("S34 exit at age 60 with low other income", () => {
    const r = runSecurities(
      {
        goal: { amountNow: 300_000, monthly: 0, months: 60 },
        market: { grossReturn: 0.06, inflation: 0.025 },
        fund: s14Fund,
        tariff: s14Tariff,
        profile: { ageAtStart: 55, otherIncome: 60_000 },
      },
      ctx,
    );
    const g = golden("S34");
    g.value("real gain", r.detail.realGain, 36_635.17);
    g.value("tax at the brackets", r.taxAtExit, 4_164.12);
    g.value("withheld", r.detail.withheld, 9_158.79);
    g.value("refund", r.detail.refund, 4_994.67);
    g.value("nominal after refund", r.nominal, 361_941.76);
    g.value("real", r.real, 319_903.77);
    g.value("trade", r.fees.trade, 1_998.93);
    g.value("spread", r.fees.spread, 333.17);
    g.value("custody", r.fees.custody, 10_026.38);
    g.value("fund", r.fees.fund, 18_378.58);
    g.done();
  });

  it("S35 exit at 60 holding an unlinked bond: fixed 15% unchanged", () => {
    const r = runBond(
      {
        goal: { amountNow: 300_000, monthly: 0, months: 60 },
        market: { inflation: 0.025 },
        bond: s08Bond,
        tariff: s08Tariff,
        profile: { ageAtStart: 55, otherIncome: 60_000 },
      },
      ctx,
    );
    const g = golden("S35");
    g.value("real", r.real, 302_752.55);
    g.value("nominal", r.nominal, 342_536.72);
    g.value("trade", r.fees.trade, 1_383.98);
    g.value("custody", r.fees.custody, 6_358.59);
    g.value("tax during", r.taxDuring, 8_872.82);
    g.value("tax at exit", r.taxAtExit, 0);
    g.value("gain", r.detail.gain, -1_333.69);
    g.done();
  });

  it("S36 surtax year", () => {
    const r = runSecurities(
      {
        goal: { amountNow: 2_000_000, monthly: 0, months: 36 },
        market: { grossReturn: 0.08, inflation: 0.02 },
        fund: s14Fund,
        tariff: s14Tariff,
        profile: { otherIncome: 600_000 },
      },
      ctx,
    );
    const g = golden("S36");
    g.value("real gain", r.detail.realGain, 292_128.7);
    g.value("capital-gains tax", r.detail.capitalGainsTax, 73_032.17);
    g.value("surtax 3%", r.detail.surtax, 5_117.06);
    g.value("surtax 2%", r.detail.capitalSurtax, 0);
    g.value("nominal", r.nominal, 2_299_136.04);
    g.value("real", r.real, 2_166_527.24);
    g.value("trade", r.fees.trade, 13_135.37);
    g.value("spread", r.fees.spread, 2_189.33);
    g.value("custody", r.fees.custody, 39_656.72);
    g.value("fund", r.fees.fund, 72_465.71);
    g.done();
  });

  it("S37 negative real gain", () => {
    const r = runSecurities(
      {
        ...s11,
        goal: { amountNow: 100_000, monthly: 0, months: 24 },
        market: { grossReturn: 0.01, inflation: 0.03 },
      },
      ctx,
    );
    const g = golden("S37");
    g.value("real", r.real, 95_808.94);
    g.value("nominal", r.nominal, 101_643.7);
    g.value("nominal gain", r.detail.nominalGain, 1_643.7);
    g.value("real gain", r.detail.realGain, -4_446.3);
    g.value("tax", r.taxAtExit, 0);
    g.value("fund", r.fees.fund, 362.83);
    g.done();
    expect(flagCodes(r)).toContain("G-07");
  });
});

describe("Part D: capability outputs (release 1 part)", () => {
  it("S47 illustrative timeline for guide pages", () => {
    const goal = { amountNow: 10_000, monthly: 500, months: 120 };
    const runs = timeline({
      deposit: () =>
        runDeposit(
          { goal, market: { inflation: 0.02 }, deposit: { rate: 0.035, termMonths: 1, linkage: "unlinked" }, profile: {} },
          ctx,
        ),
      mmf: () => runSecurities({ ...s11, goal, market: { grossReturn: 0.0325, inflation: 0.02 } }, ctx),
      etf: () =>
        runSecurities({ goal, market: { grossReturn: 0.05, inflation: 0.02 }, fund: s14Fund, tariff: s14Tariff, profile: {} }, ctx),
      kgl: () =>
        runProvident(
          {
            wrapper: "kupat-gemel-lehashkaa",
            goal,
            market: { grossReturn: 0.05, inflation: 0.02 },
            fees: { deposit: 0, balance: 0.008, direct: 0.001 },
            profile: {},
          },
          ctx,
        ),
    });
    const g = golden("S47");
    g.value("deposit exit", runs.deposit.exitReal, 74_044.07);
    g.value("MMF exit", runs.mmf.exitReal, 73_339.31);
    g.value("ETF exit", runs.etf.exitReal, 70_220.43);
    g.value("KGL exit", runs.kgl.exitReal, 76_594.44);
    g.value("deposit year 1", runs.deposit.years[0]!.real, 16_135.65);
    g.value("MMF year 5", runs.mmf.years[4]!.real, 41_389.71);
    g.value("ETF year 7", runs.etf.years[6]!.real, 52_640.88);
    g.value("ETF year 10", runs.etf.years[9]!.real, 72_132.71);
    g.value("KGL year 3", runs.kgl.years[2]!.real, 29_214.49);
    g.value("KGL year 10", runs.kgl.years[9]!.real, 78_792.58);
    g.done();
  });
});

// Scenarios that need formulas from later releases (docs/architecture.md §7). Each becomes a test with its release.
describe("later releases", () => {
  it.todo("S38 switching cost: F-66 (R4)");
  it.todo("S42, S43 fee materiality: F-61, F-62 (R3)");
  it.todo("S44, S45 provider workbench: F-63 (R4)");
  it.todo("S46 holdings review: F-70, F-72 (R3)");
  it.todo("S47 pension series: F-30, F-31, F-53 (R2)");
  it.todo("S48 revisit: F-82 (R5)");
  it.todo("S49 exposure mode and the loss filter: F-71 (R5)");
});
