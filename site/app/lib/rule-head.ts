// A rule's head (`RuleHead`, lib/rule-card-file.ts) read from its record: what a chip names of a rule and what a page ships of a rule its
// cards point at but does not hold in full. Apart from the file's schema, so the chips' script carries no schema.
import type { RuleRecord } from "@finance-tool/schema";
import type { RuleHead } from "./rule-card-file";
import { ruleTitle } from "./rule-title";
import type { SlotSource } from "./figure-slots";

/** A rule's head, from its record: its title read with `slots` (the records whose figures fill its text's slots, and the day). */
export function ruleHeadOf(rule: RuleRecord, slots: SlotSource): RuleHead {
  return { id: rule.id, title: ruleTitle(rule, slots), strength: rule.strength, scope: rule.scope, ...(rule.scope_institutions ? { scope_institutions: rule.scope_institutions } : {}) };
}
