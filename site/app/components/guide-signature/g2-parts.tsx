// What the second-wave visuals (D29, builder G2) share beyond ./kit: a text fact of the page's data.
import { fact } from "../../lib/guide-signature";
import type { SignatureData } from "../../lib/guide-signature";

/** A text fact of the page's data (a name), or "". */
export const text = (d: SignatureData, key: string): string => {
  const v = fact(d, key)?.value;
  return typeof v === "string" ? v : "";
};
