// The regulator's fee averages of a track (data-schema 3.13, CAT-35 to CAT-40) as provenance numbers.
// An empty field reads "טרם דווח" with the reason behind the tap and the caution mark; a negative one is shown as
// printed, with the same mark. Nothing here ranks a track or calls one the cheapest.
import { track as copy } from "../../copy";
import type { SiteValue } from "../../lib/value";
export { feeLabel } from "../../lib/value";
import { IconAlert } from "../icons";
import { Num } from "../provenance";

export function FeeNum({ value, size = "inline" }: { value: SiteValue; size?: "inline" | "cell" }) {
  const missing = value.value === null;
  const negative = typeof value.value === "number" && value.value < 0;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Num value={value} size={size} display={missing ? copy.feeNotReported : undefined} />
      {(missing || negative) && <IconAlert size={16} className="text-caution shrink-0" />}
    </span>
  );
}
