// The runs rule-uses.test.ts reads the uses of: golden scenarios' own inputs (tests/golden/scenarios.md), one or more on each ledger and on
// each branch that tags a rule (architecture 3.4), and a few cases the golden set does not hold (a bank money-market fund, the current
// account's cap, an early withdrawal at 65, each relief path).
import type { PensionInput, ProvidentInput, RunContext, RunResult, SecuritiesInput } from "../src/index.ts";
import { runBond, runDeposit, runMakam, runPension, runProvident, runSecurities } from "../src/index.ts";

const s11: SecuritiesInput = {
  goal: { amountNow: 50_000, monthly: 1_000, months: 24 },
  market: { grossReturn: 0.0325, inflation: 0.03 },
  fund: { kind: "money-market-daily", drag: { management: 0.0016, trustee: 0.0002 } },
  tariff: {},
  profile: {},
};
const s14Fund = { kind: "israeli-fund" as const, drag: { management: 0.008, variable: 0.003, trustee: 0.000085 }, halfSpread: 0.0005 };
const s14Tariff = { buy: { rate: 0.003, min: 25 }, sell: { rate: 0.003, min: 25 }, custody: { rate: 0.0015, min: 15, everyMonths: 3 } };
const s08Tariff = { buy: { rate: 0.002, min: 30 }, sell: { rate: 0.002, min: 30 }, custody: { rate: 0.001, min: 10, everyMonths: 3 } };
const s17: SecuritiesInput = {
  goal: { amountNow: 100_000, monthly: 2_000, months: 60 },
  market: { grossReturn: 0.06, returnIn: "instrument", inflation: 0.025, fxChange: 0.01 },
  fund: { kind: "foreign-fund", domicile: "us", w8ben: true, drag: { management: 0.0003 }, distribution: { yield: 0.013, perYear: 4 }, sharePrice: 776.56 },
  tariff: {
    currency: { code: "USD", startRate: 3.107 },
    buy: { rate: 0, min: 2.5, in: "instrument", perShareAbove: { shares: 250, perShare: 0.01 } },
    sell: { rate: 0, min: 2.5, in: "instrument", perShareAbove: { shares: 250, perShare: 0.01 } },
    fx: 0.002,
  },
  broker: "foreign",
  profile: {},
};
const kgl: ProvidentInput = {
  wrapper: "kupat-gemel-lehashkaa",
  goal: { amountNow: 20_000, monthly: 2_000, months: 60 },
  market: { grossReturn: 0.06, inflation: 0.025 },
  fees: { deposit: 0, balance: 0.008, direct: 0.001 },
  profile: {},
};
export const s23Hishtalmut = { employment: "employee", monthlySalary: 12_000, clockStartMonth: 0 } satisfies ProvidentInput["hishtalmut"];
export const s23: ProvidentInput = {
  wrapper: "keren-hishtalmut",
  goal: { amountNow: 0, monthly: 300, months: 84, contributions: "nominal" },
  market: { grossReturn: 0.06, inflation: 0.025 },
  fees: { deposit: 0, balance: 0.006, direct: 0.0011 },
  hishtalmut: s23Hishtalmut,
  profile: {},
};
const s27: PensionInput = {
  wrapper: "pension-comprehensive",
  goal: { amountNow: 0, monthly: 300, months: 360 },
  market: { grossReturn: 0.05, inflation: 0.02 },
  fees: { deposit: 0.01, balance: 0.0022, direct: 0 },
  insurance: { rate: 0.015 },
  pension: { employment: "employee", monthlySalary: 10_000, existingEmployeeRate: 0.06, employer: { pensionRate: 0.065, severanceRate: 0.06 } },
  profile: { ageAtStart: 30 },
};

/** The relief paths of F-30 to F-32 (method), each a pension run whose every year falls on that path. */
export const reliefPaths = {
  // S27's employee on a salary whose deposits stay under 16% of the average wage: the credit under the year's tax
  "F-31": { ...s27, pension: { ...s27.pension, monthlySalary: 7_000 } },
  // an employee on so small a salary that the credit on the floor's amount passes the year's tax, and is cut to it
  "F-31, cut to the year's tax": { ...s27, pension: { ...s27.pension, monthlySalary: 400 } },
  // S28's employee depositing past 16% of the average wage with the employer's money
  "F-32, beneficiary member": { ...s27, goal: { ...s27.goal, monthly: 2_000 }, pension: { ...s27.pension, monthlySalary: 15_000 } },
  // S29: self-employed, a beneficiary member
  "F-32, self-employed beneficiary member": { ...s27, goal: { amountNow: 0, monthly: 30_415.6 / 12, months: 240, contributions: "nominal" }, pension: { employment: "self-employed", annualIncome: 240_000 }, profile: {} },
  // S30's self-employed person below the threshold: TXP-05 limb (1) with TXP-06's second-tier extras
  "F-32, self-employed": { ...s27, goal: { amountNow: 0, monthly: 300, months: 240 }, pension: { employment: "self-employed", annualIncome: 120_000 }, profile: {} },
  // an employee whose employer pays nothing in: TXP-05 limb (2) on the work income that is not insured
  "F-32, employee without employer money": { ...s27, pension: { employment: "employee", monthlySalary: 10_000 } },
} satisfies Record<string, PensionInput>;

/** Every named run, made on demand with the context given. */
export function runs(ctx: RunContext): Record<string, () => RunResult> {
  return {
    "S01 unlinked deposit": () => runDeposit({ goal: { amountNow: 50_000, monthly: 1_000, months: 36 }, market: { inflation: 0.03 }, deposit: { rate: 0.035, termMonths: 1, linkage: "unlinked" }, profile: { annualIncome: 144_000 } }, ctx),
    "S03 linked deposit": () => runDeposit({ goal: { amountNow: 100_000, monthly: 0, months: 36 }, market: { inflation: 0.03 }, deposit: { rate: 0.012, termMonths: 12, linkage: "cpi" }, profile: {} }, ctx),
    "S03 linked deposit, TXI-20": () => runDeposit({ goal: { amountNow: 100_000, monthly: 0, months: 36 }, market: { inflation: 0.03 }, deposit: { rate: 0.012, termMonths: 12, linkage: "cpi" }, profile: { annualIncome: 60_000, ageAtStart: 62 } }, ctx),
    "S04 prime deposit": () => runDeposit({ goal: { amountNow: 50_000, monthly: 1_000, months: 36 }, market: { inflation: 0.03 }, deposit: { rate: 0.0475 - 0.014, termMonths: 1, linkage: "prime" }, profile: { annualIncome: 144_000 } }, ctx),
    "S05 current account": () => runDeposit({ goal: { amountNow: 30_000, monthly: 0, months: 12 }, market: { inflation: 0.03 }, deposit: { kind: "current-account", rate: 0.005, termMonths: 1, linkage: "unlinked" }, profile: {} }, ctx),
    "current account at 0%": () => runDeposit({ goal: { amountNow: 30_000, monthly: 0, months: 12 }, market: { inflation: 0.03 }, deposit: { kind: "current-account", rate: 0, termMonths: 1, linkage: "unlinked" }, profile: {} }, ctx),
    "S06 makam rolled": () => runMakam({ goal: { amountNow: 100_000, monthly: 0, months: 24 }, market: { inflation: 0.03 }, makam: { yield: 0.039 }, tariff: { buy: { rate: 0.001, min: 20 } } }, ctx),
    "S07 makam sold": () => runMakam({ goal: { amountNow: 100_000, monthly: 0, months: 18 }, market: { inflation: 0.03 }, makam: { yield: 0.039 }, tariff: { buy: { rate: 0.001, min: 20 }, sell: { rate: 0.001, min: 20 } } }, ctx),
    "makam at a non-bank member": () => runMakam({ goal: { amountNow: 100_000, monthly: 0, months: 18 }, market: { inflation: 0.03 }, makam: { yield: 0.039 }, tariff: { buy: { rate: 0.001, min: 20 }, custody: { rate: 0.001, everyMonths: 3 } }, memberKind: "non-bank" }, ctx),
    "S08 unlinked bond": () => runBond({ goal: { amountNow: 100_000, monthly: 0, months: 36 }, market: { inflation: 0.03 }, bond: { coupon: 0.0375, linkage: "unlinked", couponEveryMonths: 12 }, tariff: s08Tariff, profile: {} }, ctx),
    "S09 linked bond": () => runBond({ goal: { amountNow: 100_000, monthly: 0, months: 36 }, market: { inflation: 0.03 }, bond: { coupon: 0.019, linkage: "cpi", couponEveryMonths: 12 }, tariff: s08Tariff, profile: {} }, ctx),
    "S35 unlinked bond at 60": () => runBond({ goal: { amountNow: 300_000, monthly: 0, months: 60 }, market: { inflation: 0.025 }, bond: { coupon: 0.0375, linkage: "unlinked", couponEveryMonths: 12 }, tariff: s08Tariff, profile: { ageAtStart: 55, otherIncome: 60_000 } }, ctx),
    "S11 money-market fund": () => runSecurities(s11, ctx),
    "money-market fund at a bank member": () => runSecurities({ ...s11, tariff: { custody: { rate: 0.001, everyMonths: 3 } }, memberKind: "bank" }, ctx),
    "money-market fund at a non-bank member": () => runSecurities({ ...s11, tariff: { custody: { rate: 0.001, everyMonths: 3 } }, memberKind: "non-bank" }, ctx),
    "S12 renewable money-market fund": () => runSecurities({ ...s11, goal: { amountNow: 50_000, monthly: 0, months: 24 }, fund: { kind: "money-market-renewable", fixedDatesEveryMonths: 3, drag: { management: 0.0016 } } }, ctx),
    "S13 taxable money-market fund": () => runSecurities({ ...s11, fund: { ...s11.fund, kind: "money-market-taxable" } }, ctx),
    "S14 Israeli ETF": () => runSecurities({ goal: { amountNow: 50_000, monthly: 1_000, months: 120 }, market: { grossReturn: 0.06, inflation: 0.025 }, fund: s14Fund, tariff: s14Tariff, profile: {} }, ctx),
    "S14 Israeli ETF with a current account": () => runSecurities({ goal: { amountNow: 50_000, monthly: 1_000, months: 60 }, market: { grossReturn: 0.06, inflation: 0.025 }, fund: s14Fund, tariff: { ...s14Tariff, currentAccount: 10 }, profile: {} }, ctx),
    "S17 US ETF with a W-8BEN": () => runSecurities(s17, ctx),
    "S18 US ETF without a W-8BEN": () => runSecurities({ ...s17, fund: { ...s17.fund, w8ben: false } }, ctx),
    "S19 Irish ETF": () => runSecurities({ ...s17, fund: { ...s17.fund, domicile: "ireland", drag: { management: 0.0007, foreignWithholding: 0.0023 } } }, ctx),
    "S20 kupat gemel lehashkaa": () => runProvident(kgl, ctx),
    "S21 kupat gemel lehashkaa past its ceiling": () => runProvident({ ...kgl, goal: { amountNow: 90_000, monthly: 0, months: 12 } }, ctx),
    "kupat gemel lehashkaa at 60, fees above the caps": () => runProvident({ ...kgl, fees: { deposit: 0.05, balance: 0.02, direct: 0 }, profile: { ageAtStart: 58, otherIncome: 60_000 } }, ctx),
    "S23 keren hishtalmut": () => runProvident(s23, ctx),
    "S24 keren hishtalmut before the lock": () => runProvident({ ...s23, goal: { ...s23.goal, months: 48 } }, ctx),
    "S24 keren hishtalmut, early withdrawal": () => runProvident({ ...s23, goal: { ...s23.goal, months: 48 }, hishtalmut: { ...s23Hishtalmut, earlyWithdrawal: true } }, ctx),
    "keren hishtalmut, early withdrawal at 65": () => runProvident({ ...s23, goal: { ...s23.goal, months: 48 }, hishtalmut: { ...s23Hishtalmut, earlyWithdrawal: true }, profile: { ageAtStart: 61 } }, ctx),
    "keren hishtalmut, the short lock at 67": () => runProvident({ ...s23, goal: { ...s23.goal, months: 48 }, hishtalmut: { ...s23Hishtalmut, clockStartMonth: 12 }, profile: { ageAtStart: 63 } }, ctx),
    "S25 keren hishtalmut above the determining salary": () => runProvident({ ...s23, goal: { ...s23.goal, monthly: 500 }, hishtalmut: { ...s23Hishtalmut, monthlySalary: 20_000 } }, ctx),
    "keren hishtalmut, employer money above its limit": () => runProvident({ ...s23, goal: { ...s23.goal, monthly: 1_500 }, hishtalmut: { ...s23Hishtalmut, money: "employer" } }, ctx),
    "keren hishtalmut, self-employed": () => runProvident({ ...s23, hishtalmut: { employment: "self-employed", clockStartMonth: 0 }, profile: { annualIncome: 200_000 } }, ctx),
    "S33 IRA hishtalmut": () => runSecurities({ goal: { amountNow: 250_000, monthly: 0, months: 60 }, market: { grossReturn: 0.06, inflation: 0.025 }, fund: s14Fund, tariff: { buy: { rate: 0.001, min: 15 }, sell: { rate: 0.001, min: 15 }, custody: { rate: 0.0005, everyMonths: 3 } }, wrapper: { kind: "ira-hishtalmut", managerFee: 0.003, clockStartMonth: -72 }, profile: {} }, ctx),
    "S34 exit at 60": () => runSecurities({ goal: { amountNow: 300_000, monthly: 0, months: 60 }, market: { grossReturn: 0.06, inflation: 0.025 }, fund: s14Fund, tariff: s14Tariff, profile: { ageAtStart: 55, otherIncome: 60_000 } }, ctx),
    "S36 surtax year": () => runSecurities({ goal: { amountNow: 2_000_000, monthly: 0, months: 36 }, market: { grossReturn: 0.08, inflation: 0.02 }, fund: s14Fund, tariff: s14Tariff, profile: { otherIncome: 600_000 } }, ctx),
    "S37 negative real gain": () => runSecurities({ ...s11, goal: { amountNow: 100_000, monthly: 0, months: 24 }, market: { grossReturn: 0.01, inflation: 0.03 } }, ctx),
    ...Object.fromEntries(Object.entries(reliefPaths).map(([name, input]) => [`pension, ${name}`, () => runPension(input, ctx)])),
  };
}
