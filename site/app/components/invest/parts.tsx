// Shared pieces of the index page: the type tag, the "what do the labels mean" list, and the sentence for a cell the engine
// could not price. The label chip, its row and its sheet are in the kit (2026-10-27).
import type { RuleRecord } from "@finance-tool/schema";
import { invest as c, r4workbench } from "../../copy";
import { allLabels, label, optionLabels, type Label } from "../../lib/labels";
import type { OptionId } from "../../lib/invest";
import type { Reason } from "../../lib/invest";
import { reasonSentence } from "../workbench/providers/row";
import { Disclosure, LabelChip } from "../kit";

// ---------------------------------------------------------------- labels

/**
 * The type tag of a fund (the founder, 2026-10-26: the type is a byproduct of the cheapest way, not a choice): one short tag from the
 * option, opening what the option's two labels say (where it is held, how it trades) with their rules.
 */
export function OptionTag({ option }: { option: OptionId }) {
  const parts = optionLabels(option);
  const first = parts[0]!;
  const rules = [...new Set(parts.flatMap((l) => l.rules))];
  return <LabelChip label={{ ...first, text: c.typeTags[option]!, explain: parts.map((l) => l.explain).join(" "), rules }} />;
}

/** "מה אומרות התוויות?": every label of the page, by family. */
export function LabelsLegend() {
  const by = new Map<string, Label[]>();
  for (const l of allLabels()) by.set(l.family, [...(by.get(l.family) ?? []), l]);
  return (
    <Disclosure label={c.funds.whatLabels}>
      <dl className="flex flex-col gap-4 pt-2">
        {[...by.entries()].map(([family, list]) => (
          <div key={family} className="flex flex-col gap-1.5">
            <dt className="text-sm font-medium">{(c.labelFamilies as Record<string, string>)[family]}</dt>
            {list.map((l) => (
              <dd key={l.id} className="flex flex-col gap-1">
                <LabelChip label={l} />
                <span className="text-sm text-muted-foreground max-w-measure">{l.explain}</span>
              </dd>
            ))}
          </div>
        ))}
      </dl>
    </Disclosure>
  );
}

// ---------------------------------------------------------------- reasons

/** The tariff class each option is bought as, for the sentence that names a missing tariff line. */
export const optionClass = { "il-tracking": "mutual_fund_units", "il-etf": "etf_units", "tase-foreign": "tase_foreign_fund_units", abroad: "foreign_securities" } as const;

/** The sentence for a price the engine or the site could not give. */
export function reasonText(r: Reason, cls: string): string {
  switch (r.code) {
    case "fund-type":
      return c.reasons.fundType;
    case "need-yield":
      return c.reasons.needYield;
    case "need-rate":
      return c.reasons.needRate(r.currency);
    case "no-fund-rate":
      return c.reasons.noBroker;
    case "no-hedge-record":
      return c.reasons.noHedgeRecord;
    default:
      return reasonSentence(r, cls, r4workbench.providers.behaviour.channelOptions.direct);
  }
}
