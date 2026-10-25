// The inputs the page runs on, as chips (design-spec 12): amount, monthly, years, return, inflation, all. A chip is
// blue when the person typed it and plain when it is a site parameter (the scenario's, or a preset's).
import { r3fees } from "../../copy";
import type { FeeInputs } from "../../lib/fees";
import { fmt } from "../../lib/format";
import type { FieldKey } from "../../lib/goal";
import { cx } from "../kit";

export function FeeChips({ inputs, onOpen }: { inputs: FeeInputs; onOpen: (f: FieldKey | "all") => void }) {
  const v = inputs.values;
  const c = r3fees.chips;
  const chips: { field: FieldKey; label: string; text: string; entered: boolean }[] = [
    { field: "amountNow", label: c.amount, text: fmt.nisWhole(v.amount.value as number), entered: v.amount.state === "entered" },
    { field: "monthly", label: c.monthly, text: fmt.nisWhole(v.monthly.value as number), entered: v.monthly.state === "entered" },
    { field: "horizonYears", label: c.years, text: fmt.years(v.years.value as number), entered: v.years.state === "entered" },
    { field: "return", label: c.return, text: fmt.pct(v.returnV.value as number), entered: v.returnV.state === "entered" },
    { field: "inflation", label: c.inflation, text: fmt.pct(v.inflation.value as number), entered: v.inflation.state === "entered" },
  ];
  return (
    <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto md:overflow-visible flex md:flex-wrap gap-2 pb-1 scrollbar-none">
      {chips.map((x) =>
        inputs.fixed?.includes(x.field as "amountNow" | "monthly") ? (
          <span key={x.field} className={cx("a-chip shrink-0 cursor-default", x.entered && "a-chip-entered")}>
            <span className="text-muted-foreground">{x.label}</span>
            <bdi dir="ltr" className={cx("font-medium", x.entered && "text-entered")}>
              {x.text}
            </bdi>
          </span>
        ) : (
        <button key={x.field} type="button" onClick={() => onOpen(x.field)} className={cx("a-chip shrink-0", x.entered && "a-chip-entered")}>
          <span className="text-muted-foreground">{x.label}</span>
          <bdi dir="ltr" className={cx("font-medium", x.entered && "text-entered")}>
            {x.text}
          </bdi>
        </button>
        ),
      )}
      <button type="button" onClick={() => onOpen("all")} className="a-chip shrink-0">
        {c.all}
      </button>
    </div>
  );
}
