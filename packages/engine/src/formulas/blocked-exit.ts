// docs/method.md §7: exits the rule base cannot compute yet. The run returns the gross balance, the flag
// and the rule IDs whose text the page shows; it never returns a value after tax (D10, B3).

/** The output of a blocked exit: the pre-tax balance, why it is blocked, and the rules that describe the exit. */
export interface BlockedExit {
  formula: "F-45" | "F-48" | "F-49";
  blocked: true;
  /**
   * Why there is no value after tax: G-03 (an annuity's value needs conversion factors that are not collected), or for F-48
   * its own id: its rule is known (TXP-18; G-06 and TXP OQ3 closed 2026-10-26), but the formula is not built yet.
   */
  reason: "G-03" | "F-48";
  /** The method gap behind it, flagged on the run: G-03 for an annuity; none for F-48. */
  gap: "G-03" | null;
  /** The balance before any exit tax: the value the wrapper is listed with (B3). */
  grossBalance: number;
  /** Rules that govern the exit; their text is shown beside the figure. */
  ruleIds: readonly string[];
  /** Open questions in il-finance that block it. */
  openQuestions: readonly string[];
}

const exits = {
  "F-45": { reason: "G-03", gap: "G-03", ruleIds: ["TXK-08", "TXK-09", "TXK-10", "TXK-12"], openQuestions: ["PEN-OQ7", "TXK-OQ4"] },
  // TXP OQ3 closed 2026-10-26 (the base is the whole amount paid, TXP-18): nothing open blocks F-48 any more; it is not built yet
  "F-48": { reason: "F-48", gap: null, ruleIds: ["TXP-18", "PEN-29", "PEN-30"], openQuestions: [] },
  "F-49": { reason: "G-03", gap: "G-03", ruleIds: ["TXP-14", "TXP-15", "TXP-17", "PEN-27", "PEN-28"], openQuestions: ["PEN-OQ7"] },
} as const;

/**
 * F-45 Kupat gemel lehashkaa, annuity route from 60: the value transferred at 60 is the gross balance; the
 * annuity itself is blocked (conversion factors, PEN OQ7; commutation, TXK OQ4; G-03).
 * F-48 Pension and provident fund for annuity, early withdrawal (only if the person opts in): taxed at the higher of
 * 35% and the marginal rate on the whole amount paid (TXP-18; TXP OQ3 closed 2026-10-26, G-06 closed). The formula is
 * not built yet, so it stays blocked even when the person opts in, with "F-48" as its reason and no gap.
 * F-49 Pension and provident fund for annuity at or after retirement: the lawful exit is an annuity, partly
 * exempt (TXP-14, TXP-15) with commutation rules (TXP-17, PEN-28); its value needs conversion factors that
 * are not collected (PEN OQ7), so it is blocked (G-03).
 */
export function blockedWrapperExit(formula: BlockedExit["formula"], grossBalance: number): BlockedExit {
  const e = exits[formula];
  return { formula, blocked: true, reason: e.reason, gap: e.gap, grossBalance, ruleIds: e.ruleIds, openQuestions: e.openQuestions };
}
