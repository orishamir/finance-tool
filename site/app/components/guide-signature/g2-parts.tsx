// Parts the three second-wave visuals share (D29, builder G2): the plan inputs behind a fold, the lines that say what is held on each side,
// and the range lines (rule 3: what depends on the bank, broker or manager is a range, not one number).
import { guideSignature as copy, values as valuesCopy } from "../../copy";
import { fact } from "../../lib/guide-signature";
import type { SignatureData } from "../../lib/guide-signature";
import type { Bundle } from "../../lib/engine";
import { Num } from "../provenance";
import { Disclosure, GapNote, NumberField, Sentence } from "../kit";
import { SourceLine, inputSite, type SigInputs } from "./kit";

/** The amount now and the monthly deposit: a sentence with both as numbers, and the fields behind a fold (they write the guide's own fields, the ones the timeline reads). */
export function PlanInputs({ bundle, inputs, today }: { bundle: Bundle; inputs: SigInputs; today: string }) {
  const amount = inputSite(bundle, "amount_now", inputs.amount, inputs.source.amount, today, copy.common.inputNames.amount);
  const monthly = inputSite(bundle, "monthly_deposit", inputs.monthly, inputs.source.monthly, today, copy.common.inputNames.monthly);
  return (
    <div className="flex flex-col gap-1">
      <Sentence size="sm">
        {copy.g2.plan.before} <Num value={amount} /> {copy.g2.plan.middle} <Num value={monthly} /> {copy.g2.plan.after}
      </Sentence>
      <SourceLine sources={[inputs.source.amount, inputs.source.monthly]} />
      <Disclosure label={<span className="text-sm text-link">{copy.g2.plan.change}</span>} openLabel={<span className="text-sm text-link">{copy.g2.plan.hide}</span>}>
        <div className="grid gap-4 sm:grid-cols-2 pt-2 pb-3">
          <NumberField
            label={copy.g2.plan.amount}
            unit="nis"
            value={inputs.amount}
            isEntered={inputs.source.amount === "guide"}
            validate={(n) => (n < 0 ? valuesCopy.errors.negative : null)}
            onCommit={inputs.setAmount}
            onReset={() => inputs.setAmount(null)}
            disabled={!inputs.ready}
          />
          <NumberField
            label={copy.g2.plan.monthly}
            unit="nis"
            value={inputs.monthly}
            isEntered={inputs.source.monthly === "guide"}
            validate={(n) => (n < 0 ? valuesCopy.errors.negative : null)}
            onCommit={inputs.setMonthly}
            onReset={() => inputs.setMonthly(null)}
            disabled={!inputs.ready}
          />
        </div>
      </Disclosure>
    </div>
  );
}

/** A text fact of the page's data (a name), or "". */
export const text = (d: SignatureData, key: string): string => {
  const v = fact(d, key)?.value;
  return typeof v === "string" ? v : "";
};

/** Who holds what: a swatch in the bar's colour, the container, and what it holds. Rule 2: a container has no result without a named holding. */
export function HoldRow({ tone, name, children }: { tone: "value" | "alt"; name: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 items-start">
      <span aria-hidden="true" className={`mt-1.5 size-2.5 rounded-sm shrink-0 ${tone === "alt" ? "bg-chart-alt" : "bg-chart-value"}`} />
      <span className="min-w-0">
        <span className="font-medium">{name}:</span> {children}
      </span>
    </li>
  );
}

/** "עוד לא חושב" with its reason, from this wave's own reasons (copy `g2.gaps`). */
export function G2Gap({ id, className }: { id: string; className?: string }) {
  const reason = (copy.g2.gaps as Record<string, string>)[id.split(":")[0]!] ?? copy.common.gapFallback;
  return <GapNote reason={reason} className={className} />;
}
