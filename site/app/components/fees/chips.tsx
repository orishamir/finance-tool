// The inputs a fee-like page runs on, as the kit's PlanChips items (design-spec 12): amount, monthly, years, return, inflation.
// A chip is blue when the person typed it and plain when it is a site parameter (the scenario's, or a preset's). Also the
// scenario sentence the fields sheet shows when no goal is saved, shared by the fees page and the index page.
import { r3fees } from "../../copy";
import type { FeeInputs } from "../../lib/fees";
import { fmt } from "../../lib/format";
import type { SiteValue } from "../../lib/value";
import { Num } from "../provenance";
import type { PlanChipItem } from "../kit";

export function feePlanItems(inputs: FeeInputs, labels?: { return?: string }): PlanChipItem[] {
  const v = inputs.values;
  const c = r3fees.chips;
  const fixed = (f: "amountNow" | "monthly") => !!inputs.fixed?.includes(f);
  return [
    { field: "amountNow", label: c.amount, text: fmt.nisWhole(v.amount.value as number), entered: v.amount.state === "entered", fixed: fixed("amountNow") },
    { field: "monthly", label: c.monthly, text: fmt.nisWhole(v.monthly.value as number), entered: v.monthly.state === "entered", fixed: fixed("monthly") },
    { field: "horizonYears", label: c.years, text: fmt.years(v.years.value as number), entered: v.years.state === "entered" },
    { field: "return", label: labels?.return ?? c.return, text: fmt.pct(v.returnV.value as number), entered: v.returnV.state === "entered" },
    { field: "inflation", label: c.inflation, text: fmt.pct(v.inflation.value as number), entered: v.inflation.state === "entered" },
  ];
}

/** With no saved goal the page runs on P-05's scenario: its numbers are shown on the sheet, each opening its source (B3). */
export function ScenarioDefaults({ inputs }: { inputs: FeeInputs }) {
  const c = r3fees.chips;
  const v = inputs.values;
  const items: [string, SiteValue][] = [
    [c.years, v.years],
    [c.amount, v.amount],
    [c.monthly, v.monthly],
    [c.return, v.returnV],
    [c.inflation, v.inflation],
  ];
  return (
    <div className="flex flex-col gap-1 text-sm text-muted-foreground mb-4">
      <p>
        {r3fees.review.defaultsLead}
        {items.map(([label, value], i) => (
          <span key={label}>
            {label} <Num value={value} />
            {i < items.length - 1 ? ", " : "."}
          </span>
        ))}
      </p>
      <p>{r3fees.review.defaultsNote}</p>
    </div>
  );
}
