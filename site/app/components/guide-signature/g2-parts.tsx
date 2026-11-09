// Parts the second-wave visuals share (D29, builder G2): a text fact of the page's data and the gap note with this wave's reasons.
import { guideSignature as copy } from "../../copy";
import { fact } from "../../lib/guide-signature";
import type { SignatureData } from "../../lib/guide-signature";
import { IdText } from "../provenance";
import { GapNote } from "../kit";

/** A text fact of the page's data (a name), or "". */
export const text = (d: SignatureData, key: string): string => {
  const v = fact(d, key)?.value;
  return typeof v === "string" ? v : "";
};

/** "עוד לא חושב" with its reason, from this wave's own reasons (copy `g2.gaps`). */
export function G2Gap({ id, className }: { id: string; className?: string }) {
  const reason = (copy.g2.gaps as Record<string, string>)[id.split(":")[0]!] ?? copy.common.gapFallback;
  return <GapNote reason={<IdText text={reason} />} className={className} />;
}
