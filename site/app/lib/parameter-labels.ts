// Hebrew labels and unit text for the parameters page (F6): one label per parameter field, and the unit shown with every number.
import { parametersPage as copy, provenance } from "../copy";
import { fmt } from "./format";
import type { SiteValue } from "./value";

/** The label of one parameter field, in words only (no assumption or parameter code). */
export function fieldLabel(methodId: string, path: string): string {
  const parts = path.split(".");
  const fill = (key: string, vars: Record<string, string>) => (copy.fields[key] ?? "").replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");
  if (methodId === "P-02" && parts[0] === "bounds") return fill(`P-02.bounds.${parts[2]}`, { name: copy.boundNames[parts[1]!] ?? "" });
  return copy.fields[`${methodId}.${path}`] ?? "";
}

/** What the page prints for a value: the text (when the plain formatting hides the unit) and the unit word after it. */
export function unitText(path: string, v: SiteValue): { display?: string; suffix: string } {
  const n = typeof v.value === "number" ? v.value : null;
  if (v.value === null) return { display: copy.noCeiling, suffix: "" };
  if (n === null) return { suffix: "" };
  if (v.unit === "years") {
    if (path.startsWith("bounds.horizon.")) return { display: `${n < 0 ? "−" : "+"}${Math.abs(n)} ${copy.yearsWord}`, suffix: "" };
    return { display: fmt.years(n), suffix: "" };
  }
  if (v.unit === "count") return { display: `×${fmt.number(n)}`, suffix: "" };
  const suffix = (provenance.unit as Record<string, string>)[v.unit] ?? "";
  return { suffix };
}
