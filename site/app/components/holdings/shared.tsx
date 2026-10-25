// Small pieces the holdings screens share: an open question as the blocked tag, a rule's text with its chip,
// a sourced text value for the card (a classification is the regulator's word, so it goes through Num too).
import type { ReactNode } from "react";
import type { RuleRecord } from "@finance-tool/schema";
import { r3holdings as copy } from "../../copy";
import { fmt } from "../../lib/format";
import { ruleTitle } from "../../lib/rule-title";
import type { SiteValue } from "../../lib/value";
import { IconLock } from "../icons";
import { IdRef, Num, RuleRef } from "../provenance";
import { Tag } from "../kit";

export type RuleMap = Record<string, RuleRecord>;

/** "שאלה פתוחה CS OQ10": the lock tag and the code's chip, one inline unit (a flex row's gap never splits them); the chip opens the question's sheet. */
export function OpenQuestion({ code }: { code: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Tag tone="blocked" icon={<IconLock size={14} />}>
        {copy.openQuestion}
      </Tag>
      <IdRef id={code} />
    </span>
  );
}

/** A rule's Hebrew text from the rule base, then its chip. A rule the base has no record of shows its chip and says so. */
export function RuleText({ id, rules, className }: { id: string; rules: RuleMap; className?: string }) {
  const r = rules[id];
  return (
    <p className={className ?? "text-sm"}>
      {r?.text_he ?? <span className="text-muted-foreground">{copy.statementDisclosure.ruleMissing}</span>} <RuleRef id={id} />
    </p>
  );
}

/** One item of a conditions list: the rule's title with its chip (the card opens the full text). */
export function RuleBullet({ id, rules, children }: { id: string; rules: RuleMap; children?: ReactNode }) {
  const r = rules[id];
  return (
    <li className="text-sm">
      {children ?? (r ? ruleTitle(r).text : copy.statementDisclosure.ruleMissing)} <RuleRef id={id} />
    </li>
  );
}

/** A text the record's source gives (the classification, a fund's name) as a sourced value for `Num`. */
export function sourcedText(value: string, from: SiteValue, about?: string): SiteValue {
  return { value, unit: "text", source: from.source, checked: from.checked, effective_from: from.effective_from, effective_to: from.effective_to, update_rule: "market", state: "sourced", stale: from.stale, notes: "", about };
}

/**
 * Years as a number, then the word outside the number's isolated span ("15" then "שנים"), so the digits and the word read
 * in order in right-to-left text; one and two years are the single words שנה and שנתיים.
 */
export function YearsNum({ value }: { value: SiteValue }) {
  const n = value.value as number;
  if (n === 1 || n === 2) return <Num value={value} display={fmt.years(n)} />;
  return (
    <>
      <Num value={value} display={fmt.number(n)} /> שנים
    </>
  );
}
