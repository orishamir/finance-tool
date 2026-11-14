// The year a yearly amount in guide prose is for, after the amount: "(הסכומים של 2026)". A ceiling or a grant that changes each year
// never reads as always true; an amount not tied to a year shows nothing.
import { figureYear, type SiteValue } from "../../lib/value";

export function YearOf({ v, plural = false }: { v: SiteValue | null; plural?: boolean }) {
  const year = v ? figureYear(v) : null;
  if (!year) return null;
  return (
    <>
      {" "}
      ({plural ? "הסכומים" : "הסכום"} של <bdi dir="ltr">{year}</bdi>)
    </>
  );
}
