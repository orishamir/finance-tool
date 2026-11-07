// Guide prose for תגמולים ואישית לפיצויים (provident fund for annuity: tagmulim and personal severance).
// Same shape and register as kupat-gemel-lehashkaa.tsx; checked against the rule base (PEN, TXP, PF); each
// block ends with the rules it rests on. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import type { SiteValue } from "../../lib/value";
import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout } from "../../components/kit";

const N = ({ v }: { v: SiteValue | null }) => (v ? <Num value={v} /> : null);

export const content: GuideContent = {
  what: () => (
    <>
      <p className="max-w-measure">
        <Term id="קופת גמל לקצבה">קופת גמל לחיסכון לפרישה</Term>. המעסיק ואתם, או עצמאים בעצמם, מפקידים לפי אותן תקרות מס כמו <Term prefix="ב" id="קרן פנסיה">קרן פנסיה</Term>.
      </p>
      <p className="max-w-measure">
        ההבדלים מקרן פנסיה: הקופה לא כוללת מעצמה ביטוח נכות <Term prefix="ו" id="שאירים">שאירים</Term>, ואם יש כיסוי, הוא תלוי <Term prefix="ב" id="חברה מנהלת">חברה המנהלת</Term>. אין <Term id="השלמת תשואה">הבטחת תשואה</Term> של המדינה ואין <Term id="איזון אקטוארי">איזון אקטוארי</Term>.
      </p>
      <p className="max-w-measure">
        הקופה עצמה לא משלמת <Term id="קצבה">קצבה</Term>: בפרישה מעבירים את הכסף לקרן פנסיה או לחברת ביטוח, והן משלמות.
      </p>
      <RulesLine ids={["PEN-34", "PEN-35", "TXP-24"]} />
    </>
  ),
  who: () => (
    <>
      <p className="max-w-measure">חברות מנהלות של <Term id="קופת גמל">קופות גמל</Term>, בפיקוח <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון, ביטוח וחיסכון</Term>. <Term prefix="ב" id="גמל נט">גמל נט</Term> הקופות האלה מסווגות ״תגמולים ואישית לפיצויים״.</p>
      <RulesLine ids={["REG-17", "PEN-34"]} />
    </>
  ),
  switchLine: "בלי מס הכנסה, גם בין מסלולים בתוך הקופה וגם במעבר לקופה אחרת או לקרן פנסיה. חוץ מכספי פיצויים שעוברים ל״חשבון חדש״, חשבון שאי אפשר להפקיד אליו עוד: לפני ההעברה מנכים מהם מס הכנסה על החלק שלא פטור",
  switchRules: ["PF-23", "SW-23"],
  termIds: ["קופת גמל לקצבה", "זיכוי ממס", "הכנסה מזכה", "קצבה מזכה", "משיכה שלא כדין", "איזון אקטוארי", "מקדם המרה", "קרן פנסיה", "עמית", "משיכה", "גיל הפרישה", "הפקדות המעסיק", "גמל נט", "רשות שוק ההון ביטוח וחיסכון", "קופת גמל", "קרן חדשה מקיפה", "קצבה", "השלמת תשואה", "חברה מנהלת", "ניכוי", "תשואה", "אינפלציה"],
  afterTax: ({ figure }) => (
    <>
      <p className="max-w-measure">
        ההפקדה שלכם מורידה את המס ב־<N v={figure("TXP-01", "credit_pct")} /> מסכום ההפקדה, בלי קשר למדרגת המס שלכם. זה <Term id="זיכוי ממס">זיכוי ממס</Term>, והוא חל על הפקדה של עד <N v={figure("TXP-02", "credited_pct_of_income")} /> <Term prefix="מ" id="הכנסה מזכה">הכנסה מזכה</Term> של עד <N v={figure("TXP-02", "eligible_income_cap")} /> בשנה. עצמאים שמפקידים יותר מקבלים גם <Term id="ניכוי">ניכוי</Term>.
      </p>
      <p className="max-w-measure">
        <Term id="הפקדות המעסיק">הפקדות המעסיק</Term> לא ממוסות בהפקדה, עד <N v={figure("TXP-10", "employer_exempt_pct")} /> מהשכר ועד שכר של <N v={figure("TXP-10", "employer_ceiling")} /> בחודש.
      </p>
      <RulesLine ids={["TXP-01", "TXP-02", "TXP-10", "TXP-06", "TXP-24"]} />
      <Callout tone="blocked" className="max-w-measure">
        <span className="font-medium">את הקצבה האתר עוד לא מחשב.</span> הקופה לא משלמת אותה בעצמה: מעבירים את הכסף לקרן פנסיה או לחברת ביטוח. בקרן פנסיה הכסף מצטרף ליתרה ומומר לקצבה לפי <Term id="מקדם המרה">מקדמי ההמרה</Term> של אותה קרן. לא נמצא חוק או הוראה שמחייבים קרן פנסיה או חברת ביטוח לקבל את הכסף, וקרן פנסיה רשאית לדחות בקשת הצטרפות. באילו מקדמים חברת ביטוח ממירה את הכסף, עוד לא נמצא. שאלה פתוחה <IdRef id="PEN OQ19" end="." />
      </Callout>
      <p className="max-w-measure">
        הפטור ממס מתחיל <Term prefix="ב" id="גיל הפרישה">גיל הפרישה</Term> לפי החוק: <N v={figure("PEN-26", "retirement_age_men")} /> לגברים ו־<N v={figure("PEN-26", "retirement_age_women")} /> לנשים. לנשים שנולדו עד סוף שנות השישים הגיל מדורג לפי שנת הלידה.
      </p>
      <p className="max-w-measure">
        הפטור הוא סכום, זהה לכל מי שזכאי, ולא חלק מהקצבה של כל אדם: <N v={figure("TXP-14", "exempt_share")} /> מתקרה של <N v={figure("TXP-14", "annuity_ceiling")} /> בחודש על <Term id="קצבה מזכה">קצבה מזכה</Term>.
      </p>
      <p className="max-w-measure">
        <Term id="משיכה">משיכה</Term> שלא כקצבה אפשרית רק במקרים מסוימים. החוק קורא לה <Term id="משיכה שלא כדין">משיכה שלא כדין</Term>, והיא ממוסה על כל הסכום שמשולם: הגבוה מבין <N v={figure("TXP-18", "minimum_rate")} /> והשיעור השולי <RuleRef id="TXP-18" end="." /> יש חריגים, כמו הוצאות רפואיות גבוהות.
      </p>
      <RulesLine ids={["PEN-34", "PEN-63", "PEN-26", "TXP-14", "TXP-18", "PEN-29"]} />
    </>
  ),
  risks: () => (
    <>
      <p className="max-w-measure">הנכסים מוחזקים בנאמנות, בנפרד מהרכוש של החברה המנהלת, ואי אפשר לעקל אותם. זכויות של <Term id="עמית">עמית</Term> אפשר לעקל רק לפי כללים שהשר קובע. אם החברה המנהלת קורסת, הניהול עובר לחברה אחרת. אין ערבות של המדינה לשווי הקופה.</p>
      <p className="max-w-measure">אין כאן הבטחת תשואה ואין איזון אקטוארי: היתרה עולה ויורדת רק עם ההשקעות של המסלול שבחרתם. בלי כיסוי ביטוחי, במקרה של נכות או מוות יש רק מה שנצבר.</p>
      <RulesLine ids={["PF-29", "REG-18", "REG-19", "PEN-35"]} />
    </>
  ),
  use: ({ figure }) => (
    <>
      <p className="max-w-measure">
        למי שרוצה את הטבות המס של הפנסיה בלי לשלם על ביטוח בתוך הקופה: עצמאים שמבוטחים במקום אחר, או שכירים שיש להם כיסוי למקרה מוות ונכות. רק עם כיסוי כזה הקופה עומדת בחובת הפנסיה.
      </p>
      <p className="max-w-measure">
        לעומת <Term id="קרן חדשה מקיפה">קרן פנסיה מקיפה</Term> אין הבטחת תשואה, ובפרישה צריך למצוא מי שישלם את הקצבה. תקרת דמי הניהול מהחיסכון גבוהה יותר, <N v={figure("PF-02", "balance_cap")} /> מול <N v={figure("PF-04", "balance_cap")} />, ותקרת דמי הניהול מההפקדה נמוכה יותר, <N v={figure("PF-02", "deposit_cap")} /> מול <N v={figure("PF-04", "deposit_cap")} />.
      </p>
      <RulesLine ids={["PEN-35", "PEN-05", "PEN-22", "PF-02", "PF-04"]} />
    </>
  ),
};

export { RuleRef };
