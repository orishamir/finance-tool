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
import { runPension } from "./ledgers/pension.ts";
import { employerLine } from "./ledgers/employer-line.ts";
import { beneficiaryRelief, employeeCredit, equalNetOutlay } from "./formulas/deposit-side.ts";
import { studyFundEarlyWithdrawal } from "./formulas/early-withdrawal.ts";
import { blockedWrapperExit } from "./formulas/blocked-exit.ts";
import { insuranceCost } from "./formulas/insurance.ts";
import { runSecurities } from "./ledgers/securities.ts";
import { buildCandidateSet } from "./compare/candidates.ts";
import { idleCash } from "./compare/idle-cash.ts";
import { lossFilter } from "./compare/loss-filter.ts";
import { rankCandidates } from "./compare/ranking.ts";
import { revisit } from "./compare/revisit.ts";
import { sensitivity } from "./compare/sensitivity.ts";
import { timeline } from "./timeline.ts";
import { feeMateriality } from "./fees/materiality.ts";
import { regulatorReference } from "./fees/reference.ts";
import { feeVerdict } from "./fees/verdict.ts";
import { consolidation } from "./holdings/consolidation.ts";
import { classificationFit } from "./holdings/fit.ts";
import { trackWorkbench } from "./holdings/workbench.ts";
import { providerWorkbench } from "./providers/workbench.ts";
import { fundVariants } from "./variants/fund-variants.ts";
import { switchingCost } from "./variants/switching.ts";

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
  "F-30": equalNetOutlay,
  "F-31": employeeCredit,
  "F-32": beneficiaryRelief,
  "F-33": runProvident,
  "F-40": capitalGainsTax,
  "F-41": runDeposit,
  "F-42": bracketTaxOnTopSlice,
  "F-43": surtax,
  "F-44": kglExitTax,
  "F-45": blockedWrapperExit,
  "F-46": hishtalmutExitTax,
  "F-47": studyFundEarlyWithdrawal,
  "F-48": blockedWrapperExit,
  "F-49": blockedWrapperExit,
  "F-50": childSavingsExitTax,
  "F-51": runSecurities,
  "F-52": employerLine,
  "F-53": insuranceCost,
  "F-54": runChildSavings,
  "F-60": idleCash,
  "F-61": feeMateriality,
  "F-62": feeVerdict,
  "F-63": providerWorkbench,
  "F-64": trackWorkbench,
  "F-65": fundVariants,
  "F-66": switchingCost,
  "F-67": timeline,
  "F-68": regulatorReference,
  "F-70": classificationFit,
  "F-71": lossFilter,
  "F-72": consolidation,
  "F-80": rankCandidates,
  "F-81": sensitivity,
  "F-82": revisit,
  "F-83": buildCandidateSet,
} as const;

/** Ledger runs, by the instrument family they model. */
export const runs = { runBond, runChildSavings, runDeposit, runMakam, runPension, runProvident, runSecurities } as const;

/** Formulas in docs/method.md not implemented yet, with the release that brings them (architecture §7). */
export const pending: Record<string, string> = {
  "F-18": "R4: interest and dividend handling fee, with full tariff detail",
};

export type FormulaId = keyof typeof formulas;
