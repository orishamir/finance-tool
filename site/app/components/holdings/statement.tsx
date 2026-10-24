// "איפה זה בדוח" (design-system 7.5): under each statement field, what the rule base holds about where that figure
// is and what it is called: the rule texts with their chips (PF-33 to PF-38, CS-27), then the other spellings the
// glossary records as tags, then the line for what the rules still leave open. Never a drawn statement, never a
// position on the page, never a label the rule base does not hold (G-19's discipline applied to statements).
import { r3holdings as copy } from "../../copy";
import type { WrapperId } from "@finance-tool/schema";
import type { HoldingsBundle } from "../../lib/holdings";
import { isChild } from "../../lib/holdings";
import { RuleRef } from "../provenance";
import { Disclosure, Tag } from "../ui";
import { OpenQuestion, RuleText, type RuleMap } from "./shared";

export type StatementField = "balance" | "feeBalance" | "feeDeposit" | "direct" | "embeddedGain" | "fundNumber" | "firstDeposit" | "statementDate" | "company";

const pensionWrappers: WrapperId[] = ["pension-comprehensive", "pension-general"];

/** Which rules speak about each field (PF-34: the shortened report's tables; PF-35: how the fee figures are defined; PF-36 and PF-38: the detailed report). */
function rulesFor(field: StatementField, wrapperId: WrapperId | null): string[] {
  const pension = wrapperId !== null && pensionWrappers.includes(wrapperId);
  if (wrapperId !== null && isChild(wrapperId)) return ["CS-27"];
  switch (field) {
    case "balance":
      return pension ? ["PF-38", "PF-34"] : ["PF-34"];
    case "feeBalance":
    case "feeDeposit":
      return pension ? ["PF-35", "PF-38"] : ["PF-35", "PF-34"];
    case "direct":
      return ["PF-12", "PF-35"];
    case "embeddedGain":
      return ["PF-36"];
    case "fundNumber":
      return pension ? ["PF-38"] : ["PF-36"];
    case "firstDeposit":
      return pension ? ["PF-38"] : ["PF-36"];
    case "statementDate":
      return ["PF-33", "PF-26"];
    case "company":
      return ["PF-36"];
  }
}

const spellingsOf = (field: StatementField, s: HoldingsBundle["spellings"]): string[] => (field === "feeBalance" ? s.balanceFee : field === "feeDeposit" ? s.depositFee : field === "balance" ? s.balance : field === "direct" ? s.direct : []);

export function StatementDisclosure({ field, wrapperId, rules, spellings }: { field: StatementField; wrapperId: WrapperId | null; rules: RuleMap; spellings: HoldingsBundle["spellings"] }) {
  const d = copy.statementDisclosure;
  const child = wrapperId !== null && isChild(wrapperId);
  // a rule with no record in the base is left out of the body (its chip would open an empty card), except the one the copy names
  const ids = rulesFor(field, wrapperId).filter((id) => rules[id]);
  const words = spellingsOf(field, spellings);
  // audit A64: what the statement calls the field comes first; the regulator's text and the open lines wait behind "עוד"
  const first =
    field === "fundNumber" || words.length > 0 ? (
      <>
        {field === "fundNumber" && (
          <p className="text-sm">
            {d.fundNumber} <RuleRef id="CAT-09" />
          </p>
        )}
        {words.length > 0 && (
          <p className="text-sm flex flex-wrap items-center gap-1.5">
            <span className="text-muted-foreground">{d.spellings}</span>
            {words.map((w) => (
              <Tag key={w} tone="neutral">
                {w}
              </Tag>
            ))}
          </p>
        )}
      </>
    ) : null;
  const rest = (
    <div className="flex flex-col gap-2.5 pb-2 ps-0.5">
      {child && <p className="text-sm text-muted-foreground">{d.childPlan}</p>}
      {!child && ids.length > 0 && <p className="text-sm text-muted-foreground">{d.lead}</p>}
      {ids.map((id) => (
        <RuleText key={id} id={id} rules={rules} />
      ))}
      <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
        <span>{d.openLine}</span>
        <OpenQuestion code={d.openCode} />
      </p>
      <p className="text-xs text-muted-foreground">{d.neverPosition}</p>
    </div>
  );
  return (
    <Disclosure label={<span className="text-sm text-link">{d.label}</span>} className="-mt-1" summaryClassName="min-h-9">
      <div className="flex flex-col gap-2.5 pb-2 ps-0.5">
        {first}
        {first ? (
          <Disclosure label={<span className="text-sm text-link">{d.more}</span>} summaryClassName="min-h-9">
            {rest}
          </Disclosure>
        ) : (
          rest
        )}
      </div>
    </Disclosure>
  );
}

/** The second source, the pension clearing house (PF-22), with the open question on how to get it. */
export function ClearingHouseDisclosure({ rules }: { rules: RuleMap }) {
  const c = copy.clearingHouse;
  return (
    <Disclosure label={<span className="text-sm text-link">{c.label}</span>} summaryClassName="min-h-9">
      <div className="flex flex-col gap-2.5 pb-2 ps-0.5">
        {rules["PF-22"] ? (
          <RuleText id="PF-22" rules={rules} />
        ) : (
          <p className="text-sm">
            <RuleRef id="PF-22" />
          </p>
        )}
        <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{c.last}</span>
          <OpenQuestion code={c.openCode} />
        </p>
      </div>
    </Disclosure>
  );
}
