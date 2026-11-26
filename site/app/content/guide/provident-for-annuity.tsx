// Guide prose for תגמולים ואישית לפיצויים (provident fund for annuity: tagmulim and personal severance).
// Same shape and register as kupat-gemel-lehashkaa.tsx; checked against the rule base (PEN, TXP, PF); the words
// that state a rule open it (Ruled, D116), and a figure from a rule opens it from its sheet. NEW copy for the
// founder to review.
import type { GuideContent } from "./types";
import type { SiteValue } from "../../lib/value";
import { IdRef, Num, Ruled, Term } from "../../components/provenance";
import { Callout } from "../../components/kit";
import { disabilityRetirement, EmployerUntaxed, ExemptShare, LumpSums } from "./pension-parts";

const N = ({ v }: { v: SiteValue | null }) => (v ? <Num value={v} /> : null);

export const content: GuideContent = {
  what: () => (
    <>
      <p className="max-w-measure">
        המעסיק ואתם, או עצמאים בעצמם, מפקידים <Ruled id="TXP-24">לפי אותן תקרות מס</Ruled> כמו <Term prefix="ב" id="קרן פנסיה">קרן פנסיה</Term>.
      </p>
      <p className="max-w-measure">
        ההבדלים מקרן פנסיה: הקופה <Ruled id="PEN-35">לא כוללת מעצמה ביטוח נכות</Ruled> <Term prefix="ו" id="שאירים">שאירים</Term>, ואם יש כיסוי, הוא תלוי <Term prefix="ב" id="חברה מנהלת">חברה המנהלת</Term>. <Ruled id="PEN-69">אין</Ruled> <Term id="השלמת תשואה">השלמת תשואה</Term> של המדינה.
      </p>
      <p className="max-w-measure">
        הקופה עצמה לא משלמת <Term id="קצבה">קצבה</Term>: בפרישה <Ruled id="PEN-34">מעבירים את הכסף לקרן פנסיה או לחברת ביטוח</Ruled>, והן משלמות, <Ruled id="PEN-63">אם הן מקבלות אותו</Ruled>.
      </p>
    </>
  ),
  who: () => (
    <>
      <p className="max-w-measure">חברות מנהלות של <Term id="קופת גמל">קופות גמל</Term>, <Ruled id="REG-17" prefix="ב">פיקוח</Ruled> <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון, ביטוח וחיסכון</Term>. <Term prefix="ב" id="גמל נט">גמל נט</Term> הקופות האלה <Ruled id="PEN-34">מסווגות ״תגמולים ואישית לפיצויים״</Ruled>.</p>
    </>
  ),
  switchLine: (
    <>
      <Ruled id={["TXP-32", "SW-22"]}>בלי מס הכנסה, לפי קריאה של האתר</Ruled>, גם בין מסלולים בתוך הקופה וגם במעבר לקופה אחרת או לקרן פנסיה. חוץ מכספי פיצויים שעוברים ל״חשבון חדש״, חשבון שאי אפשר להפקיד אליו עוד: לפני ההעברה מנכים מהם מס הכנסה על החלק שלא פטור.
    </>
  ),
  termIds: ["תקרת הפקדה", "קופת גמל לקצבה", "זיכוי ממס", "עמית מוטב", "הכנסה מזכה", "קצבה מזכה", "משיכה שלא כדין", "איזון אקטוארי", "מקדם המרה", "קרן פנסיה", "עמית", "משיכה", "גיל הפרישה", "תגמולי מעסיק", "מרכיב הפיצויים", "גמל נט", "ביטוח חיים קבוצתי", "מוטב", "רשות שוק ההון ביטוח וחיסכון", "קופת גמל", "קרן חדשה מקיפה", "קצבה", "השלמת תשואה", "חברה מנהלת", "ניכוי", "תשואה", "אינפלציה"],
  afterTax: ({ figure }) => (
    <>
      <p className="max-w-measure">
        ההפקדה שלכם מורידה את מס ההכנסה ב־<N v={figure("TXP-01", "credit_pct")} /> מסכום ההפקדה, <Ruled id="TXP-01">בלי קשר למדרגת המס שלכם</Ruled>. לפי הנחה של האתר, ההפחתה היא עד גובה המס שאתם משלמים באותה שנה. זה <Term id="זיכוי ממס">זיכוי ממס</Term>. למי שהוא לא <Term id="עמית מוטב">עמית מוטב</Term> הוא <Ruled id="TXP-02">חל על הפקדה של עד</Ruled> <N v={figure("TXP-02", "credited_pct_of_income")} /> <Term prefix="מ" id="הכנסה מזכה">הכנסה מזכה</Term> של עד <N v={figure("TXP-02", "eligible_income_cap")} /> בשנה. עמית מוטב <Ruled id="TXP-03">עובר לתקרת זיכוי אחרת</Ruled>. גם <Term id="ניכוי">ניכוי</Term> אפשר לקבל, <Ruled id={["TXP-05", "TXP-06"]}>בתנאים שונים לעמית מוטב ולמי שלא</Ruled>.
      </p>
      <EmployerUntaxed figure={figure} />
      <Callout tone="blocked" className="max-w-measure">
        <span className="font-medium">את הקצבה האתר עוד לא מחשב.</span> הקופה <Ruled id="PEN-34">לא משלמת אותה בעצמה</Ruled>: מעבירים את הכסף לקרן פנסיה או לחברת ביטוח. בקרן פנסיה הכסף <Ruled id="PEN-63">מצטרף ליתרה</Ruled> ומומר לקצבה לפי <Term id="מקדם המרה">מקדמי ההמרה</Term> של אותה קרן. לא נמצא חוק או הוראה שמחייבים קרן פנסיה או חברת ביטוח לקבל את הכסף. קרן פנסיה רשאית לדחות בקשת הצטרפות. עוד לא נמצא באילו מקדמים חברת ביטוח ממירה את הכסף. שאלה פתוחה <IdRef id="PEN OQ19" end="." />
      </Callout>
      <p className="max-w-measure">
        <Ruled id="TXP-14" prefix="ה">פטור ממס</Ruled> מתחיל <Term prefix="ב" id="גיל הפרישה">גיל הפרישה</Term> לפי החוק: <N v={figure("PEN-26", "retirement_age_men")} /> לגברים ו־<N v={figure("PEN-26", "retirement_age_women")} /> לנשים. לנשים שנולדו עד <N v={figure("PEN-26", "graded_women_born_until")} /> הגיל <Ruled id="PEN-26">מדורג לפי שנת הלידה</Ruled>. {disabilityRetirement}
      </p>
      <ExemptShare figure={figure} />
      <LumpSums figure={figure} />
    </>
  ),
  risks: () => (
    <>
      <p className="max-w-measure">הנכסים <Ruled id="PF-29">מוחזקים בנאמנות</Ruled>, בנפרד מהרכוש של החברה המנהלת, ואי אפשר לעקל אותם. זכויות של <Term id="עמית">עמית</Term> <Ruled id="REG-18">אפשר לעקל רק לפי כללים שהשר קובע</Ruled>. אם החברה המנהלת קורסת, הניהול <Ruled id="REG-19">עובר לחברה אחרת</Ruled>. אין ערבות של המדינה לשווי הקופה.</p>
      <p className="max-w-measure"><Ruled id="PEN-69">אין כאן השלמת תשואה</Ruled>: היתרה עולה ויורדת עם ההשקעות של המסלול שבחרתם. לא נמצא שיש בקופה כזו <Term id="איזון אקטוארי">איזון אקטוארי</Term>: בפרק של רשות שוק ההון על המדידה האקטוארית יש כללים כאלה לקרנות פנסיה, ואין בו כללים לקופה כזו. שאלה פתוחה <IdRef id="PEN OQ34" end="." /></p>
      <p className="max-w-measure">
        החברה המנהלת <Ruled id="PEN-66">רשאית לקנות לעמיתים ביטוח, ולא חייבת</Ruled>. מותר לה לקנות רק <Term id="ביטוח חיים קבוצתי">ביטוח חיים קבוצתי</Term> או ביטוח קבוצתי למקרה שלא תוכלו לעבוד. בלי ביטוח כזה, החוק מתיר <Term prefix="ל" id="מוטב">מוטבים</Term> למשוך את הכסף שהופקד לחשבון. האתר לא מצא בכללים שקרא תשלום גדול מהחשבון במקרה מוות או נכות.
      </p>
    </>
  ),
  use: ({ figure }) => (
    <>
      <p className="max-w-measure">
        למי שרוצה את הטבות המס של הפנסיה בלי לשלם על ביטוח בתוך הקופה: עצמאים שמבוטחים במקום אחר, או שכירים שיש להם כיסוי גם למקרה מוות וגם למקרה נכות בקופה אחרת. רק עם כיסוי כזה, באותה קופה או בקופה אחרת, הקופה <Ruled id={["PEN-05", "PEN-35"]}>עומדת בחובת הפנסיה</Ruled>.
      </p>
      <p className="max-w-measure">
        לעומת <Term id="קרן חדשה מקיפה">קרן פנסיה מקיפה</Term> אין השלמת תשואה, ובפרישה צריך למצוא מי שישלם את הקצבה. <Ruled id="PEN-22">תקרת דמי הניהול מהחיסכון</Ruled> גבוהה יותר, <N v={figure("PF-02", "balance_cap")} /> מול <N v={figure("PF-04", "balance_cap")} />, ותקרת דמי הניהול מההפקדה נמוכה יותר, <N v={figure("PF-02", "deposit_cap")} /> מול <N v={figure("PF-04", "deposit_cap")} />.
      </p>
    </>
  ),
};
