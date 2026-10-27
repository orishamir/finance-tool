// The regulator's fee averages of a track (data-schema 3.13, CAT-35 to CAT-40) as provenance numbers.
// An empty field reads "עוד לא דווח" with the reason behind the tap and the caution mark; an empty deposit fee of a product
// that may charge from the balance only reads "אין", without the mark (PF-06). A negative one is shown as printed, with the mark.
// Nothing here ranks a track or calls one the cheapest.
import { r3workbench, track as copy } from "../../copy";
import { depositFeeNoneByRule, type SiteValue } from "../../lib/value";
export { feeLabel } from "../../lib/value";
import { IconAlert } from "../icons";
import { IdRef, Num } from "../provenance";

export function FeeNum({ value, size = "inline" }: { value: SiteValue; size?: "inline" | "cell" }) {
  const none = depositFeeNoneByRule(value);
  const missing = value.value === null && !none;
  const negative = typeof value.value === "number" && value.value < 0;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Num value={value} size={size} display={none ? copy.feeNone : missing ? copy.feeNotReported : undefined} />
      {(missing || negative) && <IconAlert size={16} className="text-caution shrink-0" />}
    </span>
  );
}

/** The key under a fee table: one line for each of the two empty-cell words the table shows ("אין", "עוד לא דווח"). */
export function FeeKey({ values, className }: { values: (SiteValue | null | undefined)[]; className?: string }) {
  const empty = values.filter((v): v is SiteValue => !!v && v.value === null);
  const none = empty.some(depositFeeNoneByRule);
  const missing = empty.some((v) => !depositFeeNoneByRule(v));
  if (!none && !missing) return null;
  return (
    <div className={className}>
      {none && (
        <p>
          {r3workbench.noneKey} <IdRef id="PF-06" />
        </p>
      )}
      {missing && <p>{r3workbench.missingKey}</p>}
    </div>
  );
}
