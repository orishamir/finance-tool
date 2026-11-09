// A price list's date line: what the document itself prints, in plain colour. A document with one date shows it; one that
// dates each part shows the part the site reads; a misprinted date is shown as printed and marked as the source's; a version says so;
// a document that prints nothing says that and then the day the site collected it. Never a bare warning that something is missing (copy.md 3, "Say what the source gives").
import type { ReactNode } from "react";
import { kit as kitCopy } from "../../copy";
import type { TariffDated } from "../../lib/tariff-date";
import { LeadTail } from "../provenance";
import { When } from "./when";

const w = kitCopy.tariffDate;

/**
 * `date` writes a printed date after its lead (a page whose dates open their source passes a provenance figure); by default a plain date.
 * `checked` false leaves out the day the site checked, where the line already shows when the list was collected.
 * `titled` is for a line under a heading that already names the price list ("תעריפון {provider}"): the word is not said twice.
 */
export function TariffDate({ dated, checked = true, titled = false, date }: { dated: TariffDated; checked?: boolean; titled?: boolean; date?: (lead: string, iso: string) => ReactNode }) {
  // a document that prints only a month ("2025-11") is said in words, and a maqaf lead writes its letter on it: "תעריפון מנובמבר 2025"
  const at = date ?? ((lead: string, iso: string) => <When iso={iso} lead={lead} />);
  const tail = (iso: string) =>
    checked ? (
      <>
        {" · "}
        {/* "נאסף ב־" and its day stay on one line: a phone row broke after the word */}
        <span className="whitespace-nowrap">
          <When iso={iso} lead={w.checked} />
        </span>
      </>
    ) : null;
  switch (dated.kind) {
    case "published":
      return <>{at(titled ? w.titled.published : w.published, dated.date)}</>;
    case "part":
      return <>{at(w.part.replace("{part}", dated.part), dated.date)}</>;
    case "misprinted":
      return (
        <>
          <LeadTail lead={w.misprinted.before.replace("{part}", dated.part)}>
            <bdi dir="ltr" className="tabular-nums">
              {dated.printed}
            </bdi>
          </LeadTail>
          {w.misprinted.after}
          {tail(dated.checked)}
        </>
      );
    case "version":
      return (
        <>
          <LeadTail lead={titled ? w.titled.version : w.version}>
            <bdi dir="ltr" className="tabular-nums">
              {dated.version}
            </bdi>
          </LeadTail>
        </>
      );
    case "none":
      return (
        <>
          {w.none}
          {tail(dated.checked)}
        </>
      );
  }
}
