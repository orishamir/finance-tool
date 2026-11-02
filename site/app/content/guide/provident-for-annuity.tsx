// Guide prose for תגמולים ואישית לפיצויים (provident fund for annuity: tagmulim and personal severance).
// Same shape and register as kupat-gemel-lehashkaa.tsx; checked against the rule base (PEN, TXP, PF); each
// block ends with the rules it rests on. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import type { SiteValue } from "../../lib/value";
import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout } from "../../components/kit";
import { OpenSwitchTax } from "./open-tax";

const N = ({ v }: { v: SiteValue | null }) => (v ? <Num value={v} /> : null);

export const content: GuideContent = {
  what: () => (
    <>
      <p className="max-w-measure">
        <Term id="קופת גמל לקצבה">קופת גמל לחיסכון לפרישה</Term>. המעסיק ואתם, או עצמאים בעצמם, מפקידים לפי אותן תקרות מס כמו בקרן פנסיה.
      </p>
      <p className="max-w-measure">
        ההבדלים מקרן פנסיה: הקופה לא כוללת מעצמה ביטוח נכות ושאירים, ואם יש כיסוי, הוא תלוי בחברה המנהלת. אין הבטחת תשואה של המדינה ואין <Term id="איזון אקטוארי">איזון אקטוארי</Term>.
      </p>
      <p className="max-w-measure">
        הקופה עצמה לא משלמת קצבה: בפרישה מעבירים את הכסף לקרן פנסיה או לחברת ביטוח, והן משלמות.
      </p>
      <RulesLine ids={["PEN-34", "PEN-35", "TXP-24"]} />
    </>
  ),
  who: () => (
    <>
      <p className="max-w-measure">חברות מנהלות של קופות גמל, בפיקוח רשות שוק ההון, ביטוח וחיסכון. בגמל נט הקופות האלה מסווגות ״תגמולים ואישית לפיצויים״.</p>
      <RulesLine ids={["REG-17", "PEN-34"]} />
    </>
  ),
  switchLine: "בין מסלולים בתוך הקופה בלי מס. אפשר לעבור לקופה אחרת או לקרן פנסיה",
  switchRules: ["PF-23", "SW-23"],
  termIds: ["קופת גמל לקצבה", "זיכוי ממס", "הכנסה מזכה", "קצבה מזכה", "משיכה שלא כדין", "איזון אקטוארי"],
  afterTax: ({ figure }) => (
    <>
      <p className="max-w-measure">
        ההפקדה שלכם מורידה את המס ב־<N v={figure("TXP-01", "credit_pct")} /> מסכום ההפקדה, בלי קשר למדרגת המס שלכם. זה <Term id="זיכוי ממס">זיכוי ממס</Term>, והוא חל על הפקדה של עד <N v={figure("TXP-02", "credited_pct_of_income")} /> <Term prefix="מ" id="הכנסה מזכה">הכנסה מזכה</Term> של עד <N v={figure("TXP-02", "eligible_income_cap")} /> בשנה. עצמאים שמפקידים יותר מקבלים גם ניכוי.
      </p>
      <p className="max-w-measure">
        הפקדות המעסיק לא ממוסות בהפקדה, עד <N v={figure("TXP-10", "employer_exempt_pct")} /> מהשכר ועד שכר של <N v={figure("TXP-10", "employer_ceiling")} /> בחודש.
      </p>
      <RulesLine ids={["TXP-01", "TXP-02", "TXP-10", "TXP-06", "TXP-24"]} />
      <Callout tone="blocked" className="max-w-measure">
        <span className="font-medium">את הקצבה האתר עוד לא מחשב.</span> הקופה לא משלמת אותה בעצמה, ומי מקבל את הכסף ובאילו מקדמים, עוד לא נמצא. שאלה פתוחה (<IdRef id="PEN OQ19" />).
      </Callout>
      <p className="max-w-measure">
        הפטור ממס מתחיל בגיל הפרישה לפי החוק: <N v={figure("PEN-26", "retirement_age_men")} /> לגברים ו־<N v={figure("PEN-26", "retirement_age_women")} /> לנשים. לנשים שנולדו עד סוף שנות השישים הגיל מדורג לפי שנת הלידה.
      </p>
      <p className="max-w-measure">
        הפטור הוא סכום, זהה לכל מי שזכאי, ולא חלק מהקצבה של כל אדם: <N v={figure("TXP-14", "exempt_share")} /> מתקרה של <N v={figure("TXP-14", "annuity_ceiling")} /> בחודש על <Term id="קצבה מזכה">קצבה מזכה</Term>.
      </p>
      <p className="max-w-measure">
        משיכה שלא כקצבה אפשרית רק במקרים מסוימים. החוק קורא לה <Term id="משיכה שלא כדין">משיכה שלא כדין</Term>, והיא ממוסה על כל הסכום שמשולם: הגבוה מבין <N v={figure("TXP-18", "minimum_rate")} /> והשיעור השולי <RuleRef id="TXP-18" />. יש חריגים, כמו הוצאות רפואיות גבוהות.
      </p>
      <RulesLine ids={["PEN-34", "PEN-26", "TXP-14", "TXP-18", "PEN-29"]} />
      <OpenSwitchTax />
    </>
  ),
  risks: () => (
    <>
      <p className="max-w-measure">הנכסים מוחזקים בנאמנות, בנפרד מהרכוש של החברה המנהלת, ואי אפשר לעקל אותם. זכויות של עמית אפשר לעקל רק לפי כללים שהשר קובע. אם החברה המנהלת קורסת, הניהול עובר לחברה אחרת. אין ערבות של המדינה לשווי הקופה.</p>
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
        לעומת קרן פנסיה מקיפה אין הבטחת תשואה, ובפרישה צריך למצוא מי שישלם את הקצבה. תקרת דמי הניהול מהחיסכון גבוהה יותר, <N v={figure("PF-02", "balance_cap")} /> מול <N v={figure("PF-04", "balance_cap")} />, ותקרת דמי הניהול מההפקדה נמוכה יותר, <N v={figure("PF-02", "deposit_cap")} /> מול <N v={figure("PF-04", "deposit_cap")} />.
      </p>
      <RulesLine ids={["PEN-35", "PEN-05", "PEN-22", "PF-02", "PF-04"]} />
    </>
  ),
};

export { RuleRef };
