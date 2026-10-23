// docs/method.md §7: exits the rule base cannot compute yet. The run returns the gross balance, the flag
// and the rule IDs whose text the page shows; it never returns a value after tax (D10, B3).

/** The output of a blocked exit: the pre-tax balance, why it is blocked, and the rules that describe the exit. */
export interface BlockedExit {
  formula: "F-45" | "F-48" | "F-49";
  blocked: true;
  /** G-03 (annuity value needs conversion factors) or G-06 (early-withdrawal base is open). */
  gap: "G-03" | "G-06";
  /** The balance before any exit tax: the value the wrapper is listed with (B3). */
  grossBalance: number;
  /** Rules that govern the exit; their text is shown beside the figure. */
  ruleIds: readonly string[];
  /** Open questions in il-finance that block it. */
  openQuestions: readonly string[];
}

const exits = {
  "F-45": { gap: "G-03", ruleIds: ["TXK-08", "TXK-09", "TXK-10", "TXK-12"], openQuestions: ["PEN-OQ7", "TXK-OQ4"] },
  "F-48": { gap: "G-06", ruleIds: ["TXP-18", "PEN-29", "PEN-30"], openQuestions: ["TXP-OQ3"] },
  "F-49": { gap: "G-03", ruleIds: ["TXP-14", "TXP-15", "TXP-17", "PEN-27", "PEN-28"], openQuestions: ["PEN-OQ7"] },
} as const;

/**
 * F-45 Kupat gemel lehashkaa, annuity route from 60: the value transferred at 60 is the gross balance; the
 * annuity itself is blocked (conversion factors, PEN OQ7; commutation, TXK OQ4; G-03).
 * F-48 Pension and provident fund for annuity, early withdrawal (only if the person opts in): the taxable
 * base is open (TXP OQ3), so it is blocked (G-06) even when the person opts in.
 * F-49 Pension and provident fund for annuity at or after retirement: the lawful exit is an annuity, partly
 * exempt (TXP-14, TXP-15) with commutation rules (TXP-17, PEN-28); its value needs conversion factors that
 * are not collected (PEN OQ7), so it is blocked (G-03).
 */
export function blockedWrapperExit(formula: BlockedExit["formula"], grossBalance: number): BlockedExit {
  const e = exits[formula];
  return { formula, blocked: true, gap: e.gap, grossBalance, ruleIds: e.ruleIds, openQuestions: e.openQuestions };
}
