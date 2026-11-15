// Prose the guides for the comprehensive and the general pension fund and the provident fund for annuity share: the age-60
// annuity exemption (TXP-14), its share as it stands this tax year and the shares the law already sets for the years after,
// who counts as having reached retirement age for it, and which lump sums the law allows and how each is taxed.
import { Fragment } from "react";
import type { ContentProps } from "./types";
import { Num, Ruled, Term } from "../../components/provenance";

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

/**
 * Which lump sums the law allows from a pension fund or a provident fund for annuity and how each is taxed, then the one it does not:
 * severance money when the job with that employer has ended (PEN-31), a retirement grant exempt per year of work (TXP-19) that lowers
 * the later annuity exemption (TXP-15); a commutation (TXP-17) and the other cases of PEN-30; and only a payment against s.23 is
 * "משיכה שלא כדין" (TXP-18). The words that state each rule open it (Ruled); every guide that imports this part
 * ships the rules it names (scanRuleIds follows a guide's imports).
 */
export function LumpSums({ figure }: ContentProps) {
  const perYear = figure("TXP-19", "exempt_grant_per_year_of_work");
  const rate = figure("TXP-18", "minimum_rate");
  return (
    <>
      <p className="max-w-measure">
        בסכום אחד, ולא כקצבה, <Ruled id="PEN-30">אפשר למשוך רק במקרים שהחוק מתיר</Ruled>. אחד מהם: כספי הפיצויים שהמעסיק הפקיד, <Ruled id="PEN-31">כשהעבודה אצלו נגמרה</Ruled> והחוק מזכה אתכם בהם. הם ממוסים כמענק פרישה: <Ruled id="TXP-19">פטורים ממס עד משכורת חודשית אחרונה לכל שנת עבודה</Ruled>, ולא יותר מ־{perYear ? <Num value={perYear} /> : null} לשנת עבודה. מי שמושך אותם בפטור <Ruled id="TXP-15">מקטין את הפטור על הקצבה</Ruled> בהמשך. גם <Ruled id="TXP-17">היוון של הקצבה מותר</Ruled>, בתנאים שבחוק.
      </p>
      <p className="max-w-measure">
        משיכה שהחוק לא מתיר היא <Term id="משיכה שלא כדין">משיכה שלא כדין</Term>, והיא <Ruled id="TXP-18">ממוסה על כל הסכום שמשולם</Ruled>: הגבוה מבין {rate ? <Num value={rate} /> : null} והשיעור השולי. יש חריגים, כמו הוצאות רפואיות גבוהות.
      </p>
    </>
  );
}

/**
 * What the employer deposits without income tax at deposit, each part by its own rule: the employer's contribution component up to TXP-10's
 * rate of salary and salary ceiling, and severance up to TXP-11's ceiling, applied each month as the lower of the salary times the highest
 * severance rate and a twelfth of the yearly figure (TXP-11's record says it so, with the yearly figure). Every guide that imports
 * this part ships both rules (scanRuleIds follows a guide's imports).
 */
export function EmployerUntaxed({ figure }: ContentProps) {
  const pct = figure("TXP-10", "employer_exempt_pct");
  const ceiling = figure("TXP-10", "employer_ceiling");
  const severance = figure("TXP-11", "severance_ceiling");
  return (
    <p className="max-w-measure">
      <Term id="תגמולי מעסיק">תגמולי המעסיק</Term> <Ruled id="TXP-10">לא ממוסים בהפקדה</Ruled>, עד {pct ? <Num value={pct} /> : null} מהשכר ועד שכר של {ceiling ? <Num value={ceiling} /> : null} בחודש. להפקדת המעסיק <Term prefix="ל" id="מרכיב הפיצויים">מרכיב הפיצויים</Term> <Ruled id="TXP-11">יש תקרה משלה</Ruled>: בכל חודש, הנמוך מבין השכר כפול שיעור ההפקדה המרבי לפיצויים, לבין חלק אחד משנים עשר מ־{severance ? <Num value={severance} /> : null} בשנה.
    </p>
  );
}
