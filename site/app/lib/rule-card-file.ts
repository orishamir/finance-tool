// What a page carries of a rule its cards point at but does not hold in full (a head), and the file of one rule's card that the browser
// fetches when such a chip is tapped (/rule-card/<id>.json, routes/rule-card.ts). Shared by the loaders, the route and the sheet.
import { z } from "zod";
import { ruleRecord, type RuleRecord } from "@finance-tool/schema";
import { ruleTitle } from "./rule-title";
import type { SlotSource } from "./figure-slots";

/**
 * What a chip and a card's heading need of a rule the page does not hold in full: its title as the page shows it (`ruleTitle`, its
 * slots filled), its strength (an open question heads its card so), and who it applies to (the chip's company, the card's tag).
 */
export const ruleHead = z.object({
  id: ruleRecord.shape.id,
  title: z.object({ text: z.string().min(1), english: z.boolean() }),
  strength: ruleRecord.shape.strength,
  scope: ruleRecord.shape.scope,
  scope_institutions: ruleRecord.shape.scope_institutions,
});
export type RuleHead = z.infer<typeof ruleHead>;

/** A rule's head, from its record: its title read with `slots` (the records whose figures fill its text's slots, and the day). */
export function ruleHeadOf(rule: RuleRecord, slots: SlotSource): RuleHead {
  return { id: rule.id, title: ruleTitle(rule, slots), strength: rule.strength, scope: rule.scope, ...(rule.scope_institutions ? { scope_institutions: rule.scope_institutions } : {}) };
}

/** Where a rule is used, as its card says it (`RuleUses` in provenance.tsx). */
const ruleUses = z.object({ pages: z.array(z.object({ href: z.string(), label: z.string() })), engine: z.boolean() });

/**
 * One rule's card file: its record; in full, the records whose figures fill the slots of its text (and theirs), which the card draws;
 * the head of every other rule those cards point at, so each chip says its title and opens by its own file; and where each record in
 * full is used.
 */
export const ruleCardFile = z.object({
  record: ruleRecord,
  pointed: z.record(z.string(), ruleRecord),
  heads: z.record(z.string(), ruleHead),
  uses: z.record(z.string(), ruleUses),
});
export type RuleCardFile = z.infer<typeof ruleCardFile>;

/** The address of a rule's card file, under the site's base. */
export const ruleCardPath = (id: string): string => `/rule-card/${id}.json`;
