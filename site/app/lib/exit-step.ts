// The guide's exit step: the rates it shows and the mark beside it. Pure, so the mark has a test of its own (2026-11-07: a guard on
// the literal `strength="secondary"` could not see a dynamic strength rendered ahead of the reading branch).
import type { Strength } from "./value";

export interface ExitRate {
  rule: string;
  figure: string;
  copyKey: string;
  /** The rate is the law's own, but no official text says it reaches this product: the site's reading, tagged as one. */
  reading?: true;
}

/**
 * The rate each exit formula shows, as groups of candidates: from each group the first one the record's
 * `tax_at_exit.rule_ids` cites is shown, and a candidate whose rule the page does not carry is skipped.
 */
export function exitRateLines(formula: string): ExitRate[][] {
  const r = (rule: string, figure: string, copyKey: string, reading?: true): ExitRate => ({ rule, figure, copyKey, ...(reading ? { reading } : {}) });
  switch (formula) {
    case "F-41":
      return [
        [r("TXI-03", "rate", "unlinkedInterest"), r("TXI-08", "withholding_rate_unlinked", "unlinkedInterest")],
        [r("TXI-02", "rate", "linkedInterestCeiling"), r("TXI-08", "withholding_rate_linked", "linkedInterest")],
      ];
    case "F-40":
      return [
        [r("TXS-09", "rate", "realBasis"), r("TXS-13", "rate", "realBasis"), r("TXS-01", "rate", "realBasis"), r("TXI-14", "rate", "realLinkedBond")],
        [r("TXI-12", "rate", "nominalBasis"), r("TXS-03", "rate", "nominalBasis"), r("TXI-11", "rate", "nominalBasis")],
      ];
    case "F-46":
    case "F-47":
      return [[r("TXH-11", "rate", "hishtalmutExcess")]];
    case "F-50":
      // the bank route's rates are the Ordinance's own (TXK-29), but no official text says they reach child savings: the site's reading
      return [[r("TXK-23", "provident_rate", "childProvident")], [r("TXK-29", "bank_linked_rate", "childBankLinked", true)], [r("TXK-29", "bank_unlinked_rate", "childBankUnlinked", true)]];
    default:
      return [];
  }
}

/**
 * The exit step's mark: a cited rule's own weak strength first; else a rate the step shows whose source is weaker than its rule
 * ("secondary"), counting only rates that are not the site's reading; else "reading" when a rate is the site's reading (TXK-29 on
 * the child-savings bank route). A reading rate is never marked "secondary", whatever its source says: it renders ReadingTag.
 */
export function exitStepMark(ruleStrength: Extract<Strength, "institution" | "secondary"> | null, rates: readonly { reading?: true; value: { source: { strength: Strength } } }[]): Extract<Strength, "institution" | "secondary"> | "reading" | null {
  if (ruleStrength) return ruleStrength;
  if (rates.some((c) => !c.reading && c.value.source.strength === "secondary")) return "secondary";
  if (rates.some((c) => c.reading)) return "reading";
  return null;
}
