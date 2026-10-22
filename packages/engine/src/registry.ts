// Formula registry: method.md F-ID → implementation (docs/architecture.md 3.4).
// Wrapper records name their formulas; the engine dispatches through this map. A test checks every key
// against docs/method.md, and that every F-ID in the method is either here or in `pending`.
import { balanceFee, custodyFee, depositFee, feeForMonth, fixedFee, navBought, tradeCommission } from "./formulas/fees.ts";
import {
  bracketTaxOnTopSlice,
  capitalGainsTax,
  childSavingsExitTax,
  hishtalmutExitTax,
  kglExitTax,
  surtax,
} from "./formulas/exit-tax.ts";
import {
  bondCoupon,
  currentAccountInterest,
  depositInterest,
  distributionTax,
  makamPrice,
  socialContributions,
} from "./formulas/holding-tax.ts";
import { annualToMonthly, contributions, cpiPath, fxPath, monthlyInflation, realValue, taxYearOf } from "./formulas/time.ts";
import { runBond } from "./ledgers/bond.ts";
import { runChildSavings } from "./ledgers/child-savings.ts";
import { runDeposit } from "./ledgers/deposit.ts";
import { runMakam } from "./ledgers/makam.ts";
import { runProvident } from "./ledgers/provident.ts";
import { runSecurities } from "./ledgers/securities.ts";
import { timeline } from "./timeline.ts";

export const formulas = {
  "F-01": taxYearOf,
  "F-02": monthlyInflation,
  "F-03": cpiPath,
  "F-04": fxPath,
  "F-05": contributions,
  "F-06": realValue,
  "F-07": annualToMonthly,
  "F-08": runSecurities,
  "F-09": runSecurities,
  "F-10": runSecurities,
  "F-11": depositFee,
  "F-12": tradeCommission,
  "F-13": navBought,
  "F-14": custodyFee,
  "F-15": balanceFee,
  "F-16": feeForMonth,
  "F-17": fixedFee,
  "F-20": distributionTax,
  "F-21": depositInterest,
  "F-22": runDeposit,
  "F-23": runSecurities,
  "F-24": makamPrice,
  "F-25": bondCoupon,
  "F-26": currentAccountInterest,
  "F-27": runProvident,
  "F-28": socialContributions,
  "F-33": runProvident,
  "F-40": capitalGainsTax,
  "F-41": runDeposit,
  "F-42": bracketTaxOnTopSlice,
  "F-43": surtax,
  "F-44": kglExitTax,
  "F-46": hishtalmutExitTax,
  "F-50": childSavingsExitTax,
  "F-51": runSecurities,
  "F-54": runChildSavings,
  "F-67": timeline,
} as const;

/** Ledger runs, by the instrument family they model. */
export const runs = { runBond, runChildSavings, runDeposit, runMakam, runProvident, runSecurities } as const;

/** Formulas in docs/method.md not implemented yet, with the release that brings them (architecture §7). */
export const pending: Record<string, string> = {
  "F-18": "R4: interest and dividend handling fee, with full tariff detail",
  "F-30": "R2: equal net outlay",
  "F-31": "R2: pension credit for an employee",
  "F-32": "R2: beneficiary member and self-employed",
  "F-45": "R2: annuity route from 60 is blocked (G-03); shown as guide text",
  "F-47": "R2: study-fund early withdrawal",
  "F-48": "R2: pension early withdrawal, blocked (G-06)",
  "F-49": "R2: pension at retirement, blocked (G-03)",
  "F-52": "R2: employer line",
  "F-53": "R2: pension insurance cost",
  "F-60": "R2: idle-cash preset",
  "F-61": "R3: fee materiality",
  "F-62": "R3: fee verdict",
  "F-63": "R4: provider workbench",
  "F-64": "R3: track workbench (needs CMA field confirmation)",
  "F-65": "R4: fund variants",
  "F-66": "R4: switching cost",
  "F-70": "R3: classification fit",
  "F-71": "R5: loss filter",
  "F-72": "R3: consolidation",
  "F-80": "R2: ranking and ties",
  "F-81": "R2: sensitivity panel",
  "F-82": "R5: revisit",
  "F-83": "R2: candidate set and coverage line",
};

export type FormulaId = keyof typeof formulas;
