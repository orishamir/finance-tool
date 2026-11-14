// Prose the guides for the comprehensive and the general pension fund and the provident fund for annuity share: the age-60
// annuity exemption (TXP-14), its share as it stands this tax year and the shares the law already sets for the years after, and
// who counts as having reached retirement age for it.
import { Fragment } from "react";
import type { ContentProps } from "./types";
import { Num, Term } from "../../components/provenance";

/**
 * "The exemption is an amount": TXP-14's exempt share of the qualifying-annuity ceiling this tax year, then each later year's share the
 * law already sets (the figure by tax year), each with its own source.
 */
export function ExemptShare({ figure }: ContentProps) {
  const share = figure("TXP-14", "exempt_share");
  const ceiling = figure("TXP-14", "annuity_ceiling");
  const later = share?.tax_year
    ? Array.from({ length: 10 }, (_, i) => String(share.tax_year! + 1 + i)).flatMap((y) => {
        const v = figure("TXP-14", `exempt_share@${y}`);
        return v ? [{ y, v }] : [];
      })
    : [];
  return (
    <p className="max-w-measure">
      הפטור הוא סכום, זהה לכל מי שזכאי, ולא חלק מהקצבה של כל אדם: {share ? <Num value={share} /> : null} מתקרה של {ceiling ? <Num value={ceiling} /> : null} בחודש על <Term id="קצבה מזכה">קצבה מזכה</Term>.
      {later.length > 0 && (
        <>
          {" "}השיעור עולה בחוק:{" "}
          {later.map(({ y, v }, i) => (
            <Fragment key={y}>
              {i > 0 && (i === later.length - 1 ? " ו־" : ", ")}
              <Num value={v} /> ב־<bdi>{y}</bdi>
            </Fragment>
          ))}
          .
        </>
      )}
    </p>
  );
}

/** Who counts as having reached retirement age for the exemption besides the age itself (TXP-14, the Ordinance's s.1 definition). */
export const disabilityRetirement = "מי שפרש בגלל נכות קבועה בדרגה גבוהה נחשב כמי שהגיע לגיל הפרישה.";
