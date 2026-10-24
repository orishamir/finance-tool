// Hebrew labels and unit text for the parameters page (F6): one label per parameter field, and the unit shown with every number.
import { parametersPage as copy, provenance } from "../copy";
import { fmt } from "./format";
import type { SiteValue } from "./value";

/** The label of one parameter field. `record` is the parameter file, to name a table row or a preset. */
export function fieldLabel(methodId: string, path: string, record: Record<string, unknown>): string {
  const parts = path.split(".");
  const fill = (key: string, vars: Record<string, string>) => (copy.fields[key] ?? "").replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");
  let label = "";
  if (methodId === "P-02" && parts[0] === "bounds") {
    label = fill(`P-02.bounds.${parts[2]}`, { name: copy.boundNames[parts[1]!] ?? "" });
  } else if (methodId === "P-04" && parts[0] === "table") {
    const row = (record.table as { classification: string }[] | undefined)?.[Number(parts[1])];
    label = fill(`P-04.table.${parts[2]}`, { row: row?.classification ?? "" });
  } else if (methodId === "P-07" && parts[0] === "presets") {
    const preset = (record.presets as Record<string, { name_he?: string }> | undefined)?.[parts[1]!];
    label = fill(`P-07.presets.${parts[2]}`, { preset: preset?.name_he ?? "" });
  } else {
    label = copy.fields[`${methodId}.${path}`] ?? "";
  }
  return label;
}

/** What the page prints for a value: the text (when the plain formatting hides the unit) and the unit word after it. */
export function unitText(path: string, v: SiteValue): { display?: string; suffix: string } {
  const n = typeof v.value === "number" ? v.value : null;
  if (v.value === null) return { display: copy.noCeiling, suffix: "" };
  // audit A77: P-08's wrapper ids are slugs; the page shows their Hebrew names
  if (n === null) return typeof v.value === "string" && path.endsWith("wrapper_id") ? { display: copy.wrapperNames[v.value] ?? copy.wrapperOther, suffix: "" } : { suffix: "" };
  if (v.unit === "years") {
    if (path.startsWith("bounds.horizon.")) return { display: `${n < 0 ? "−" : "+"}${Math.abs(n)} ${copy.yearsWord}`, suffix: "" };
    return { display: fmt.years(n), suffix: "" };
  }
  if (v.unit === "count") return { display: `×${fmt.number(n)}`, suffix: "" };
  const suffix = (provenance.unit as Record<string, string>)[v.unit] ?? "";
  return { suffix };
}
