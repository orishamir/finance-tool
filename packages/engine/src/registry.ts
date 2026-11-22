// Formula registry: method.md F-ID → implementation (docs/architecture.md 3.4).
// Wrapper records name their formulas; the engine dispatches through this map. A test checks every key
// against docs/method.md, and that every F-ID in the method is either here or in `pending`.
import { acrossDrop, actionShare, capStanding, caseFor, costShare, coverFrom, dealMarks, dealPeriods, discounted, groupRate, heldCrossover, idleMonth, inStep } from "./formulas/deal.ts";
import { dealCharges } from "./ledgers/deal-account.ts";
import { balanceFee, corporateEventFee, currentAccountFee, custodyFee, depositFee, feeForMonth, fixedFee, navBought, tradeCommission } from "./formulas/fees.ts";
import { earlySettlement, limitStanding, moneyStory } from "./formulas/study-story.ts";
import { kindRecord, stretchRange, trackingBeyondFees } from "./formulas/fund-gap.ts";
import { irishFundUsWithholding } from "./formulas/fund-withholding.ts";
import { averageRange, promotedDrag } from "./formulas/fund-promotion.ts";
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
} from "./formulas/holding-tax.ts";
import { bestOpenOffer, breakCount, listFeeRange, mostCommonRate, rateRange } from "./formulas/account-interest.ts";
import { currencyExposureShare, stockExposureShare } from "./formulas/track-exposure.ts";
import { companyAssets, groupFeeRange } from "./formulas/track-groups.ts";
import { changedByShare, sweep } from "./formulas/step-effect.ts";
import { annualToMonthly, contributions, cpiPath, crossRate, fxPath, monthlyInflation, paidInAsEntered, taxYearOf } from "./formulas/time.ts";
import { runBond } from "./ledgers/bond.ts";
import { runDeposit } from "./ledgers/deposit.ts";
import { runMakam } from "./ledgers/makam.ts";
import { runProvident } from "./ledgers/provident.ts";
import { employerLinePension, runPension } from "./ledgers/pension.ts";
import { beneficiaryRelief, employeeCredit, equalNetOutlay } from "./formulas/deposit-side.ts";
import { studyFundEarlyWithdrawal } from "./formulas/early-withdrawal.ts";
import { blockedWrapperExit } from "./formulas/blocked-exit.ts";
import { insuranceCost } from "./formulas/insurance.ts";
import { runSecurities, runSecuritiesBeforeTax } from "./ledgers/securities.ts";
import { cpiLinkedAmount, indexedAmount } from "./formulas/indexation.ts";
import { buildCandidateSet } from "./compare/candidates.ts";
import { rankCandidates } from "./compare/ranking.ts";
import { costByWho, providerWorkbench } from "./providers/workbench.ts";

export const formulas = {
  "F-01": taxYearOf,
  "F-02": monthlyInflation,
  "F-03": cpiPath,
  "F-04": fxPath,
  "F-05": contributions,
  "F-106": paidInAsEntered,
  "F-107": irishFundUsWithholding,
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
  "F-52": employerLinePension,
  "F-53": insuranceCost,
  "F-63": providerWorkbench,
  "F-80": rankCandidates,
  "F-83": buildCandidateSet,
  "F-84": crossRate,
  "F-85": mostCommonRate,
  "F-86": rateRange,
  "F-104": breakCount,
  "F-87": stockExposureShare,
  "F-88": currencyExposureShare,
  "F-89": changedByShare,
  "F-90": sweep,
  "F-91": costByWho,
  "F-92": trackingBeyondFees,
  "F-93": stretchRange,
  "F-95": kindRecord,
  "F-96": moneyStory,
  "F-97": limitStanding,
  "F-98": earlySettlement,
  "F-99": companyAssets,
  "F-100": groupFeeRange,
  "F-101": runSecurities,
  "F-102": currentAccountFee,
  "F-103": corporateEventFee,
  "F-105": listFeeRange,
  "F-108": bestOpenOffer,
  "F-109": runSecurities,
  "F-110": dealPeriods,
  "F-111": groupRate,
  "F-112": dealMarks,
  "F-113": capStanding,
  "F-114": caseFor,
  "F-115": inStep,
  "F-116": discounted,
  "F-117": actionShare,
  "F-118": runSecuritiesBeforeTax,
  "F-119": indexedAmount,
  "F-120": cpiLinkedAmount,
  "F-121": promotedDrag,
  "F-122": averageRange,
  "F-123": costShare,
  "F-124": heldCrossover,
  "F-125": acrossDrop,
  "F-126": idleMonth,
  "F-127": coverFrom,
  "F-128": dealCharges,
} as const;

/** Ledger runs, by the instrument family they model. */
export const runs = { runBond, runDeposit, runMakam, runPension, runProvident, runSecurities } as const;

/**
 * Formulas in docs/method.md the engine does not compute, each with why: one not built yet (with the release that brings it,
 * architecture §7), one no page uses and whose code is removed (marked not built in the method), or one computed elsewhere.
 */
export const pending: Record<string, string> = {
  "F-18": "R4: interest and dividend handling fee, with full tariff detail",
  "F-129": "computed where it is read: the indices page's receipt multiplies F-91's figures by the run's I_T (site/app/components/invest/receipt.tsx, site/app/lib/receipt.ts)",
  "F-130": "computed where it is read: the receipt's end in the shekels of the horizon less its end in today's money (site/app/components/invest/receipt.tsx)",
  "F-06": "computed where it is read: a run's real value is V_T / I_T (RunResult.real), and site/app/lib/engine.ts divides each month of a run by its index",
  "F-28": "computed by the ledgers, which charge no National Insurance or health on what it covers and cite its rules (TXK-27 in provident.ts)",
  "F-54": "not built: no page uses this formula; its code is removed",
  "F-60": "not built: no page uses this formula; its code is removed, but for the cash rate in the form a formula reads it (`cashRateIn`)",
  "F-61": "not built: no page uses this formula; its code is removed, but for the plan without one fee line (fees/materiality.ts), which F-63 prices each provider line by",
  "F-62": "not built: no page uses this formula; its code is removed",
  "F-64": "not built: no page uses this formula; its code is removed, but for the guides' range of the fees reported on the tracks (site/app/lib/guide.server.ts)",
  "F-65": "computed on the site for the funds with a record: site/app/lib/invest.ts, each fund built by `fundOf`; the candidates from the fund lists are not built",
  "F-66": "not built: no page uses this formula; its code is removed",
  "F-67": "computed on the site from each run's series: site/app/lib/engine.ts `runTimeline`, and the guide signatures' own year-by-year models",
  "F-68": "not built: no page uses this formula; its code is removed",
  "F-70": "computed on the site: site/app/lib/fit.ts `fitOf`",
  "F-71": "computed on the site for a track's classification: site/app/lib/fit.ts `fitOf`; exposure mode is not built",
  "F-72": "not built: no page uses this formula; its code is removed",
  "F-81": "not built: no page uses this formula; its code is removed",
  "F-82": "not built: no page uses this formula; its code is removed",
  "F-94": "computed on the site: site/app/lib/invest.ts (hedged or not, across the dollar) and site/app/components/invest/lists.tsx",
};

export type FormulaId = keyof typeof formulas;
