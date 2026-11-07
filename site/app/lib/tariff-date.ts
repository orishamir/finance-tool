// What a price list's date line can say (2026-11-07, founder: three rows said only "ללא תאריך פרסום", a warning that taught nothing).
// A line says what the document does print: its date, the date of the part the site reads, a version, or that it prints none, and then
// the day the site last checked it. The kit's TariffDate writes it; every page that dates a price list builds it here.
import type { FeesSnapshot } from "@finance-tool/schema";

export type TariffDated =
  /** the document prints one date for the whole */
  | { kind: "published"; date: string }
  /** a date on each part and none for the whole: the date of the part the site reads */
  | { kind: "part"; part: string; date: string }
  /** that part's printed date is no real date ("06/02/20217") */
  | { kind: "misprinted"; part: string; printed: string; checked: string }
  /** a version printed in place of a date ("04/2026") */
  | { kind: "version"; version: string }
  /** nothing printed */
  | { kind: "none"; checked: string };

export function tariffDated(tariff: FeesSnapshot["tariff"], snapshot: string): TariffDated {
  if (tariff.published) return { kind: "published", date: tariff.published };
  const p = tariff.printed;
  if (p?.kind === "part") return p.date ? { kind: "part", part: p.part_he, date: p.date } : { kind: "misprinted", part: p.part_he, printed: p.as_printed, checked: snapshot };
  if (p?.kind === "version") return { kind: "version", version: p.version };
  return { kind: "none", checked: snapshot };
}

/** The printed date a line shows as a figure (the whole document's, or the part's), or null when it shows none. */
export const datedDay = (d: TariffDated): string | null => (d.kind === "published" || d.kind === "part" ? d.date : null);
