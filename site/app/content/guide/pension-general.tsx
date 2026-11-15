// Guide prose for קרן חדשה כללית (new general pension fund). Same shape and register as
// kupat-gemel-lehashkaa.tsx; checked against the rule base (PEN, TXP, PF); the words that state a rule open it
// (Ruled, D116), and a figure from a rule opens it from its sheet. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import type { SiteValue } from "../../lib/value";
import { IdRef, Num, Ruled, Term } from "../../components/provenance";
import { Callout } from "../../components/kit";
import { disabilityRetirement, EmployerUntaxed, ExemptShare, LumpSums } from "./pension-parts";

const N = ({ v }: { v: SiteValue | null }) => (v ? <Num value={v} /> : null);

export const content: GuideContent = {
  what: ({ figure }) => (
    <>
      <p className="max-w-measure">
        <Term id="תקרת הפקדה">תקרת ההפקדה</Term> החודשית לקרן המקיפה, של המעסיק ושלכם יחד, היא <N v={figure("PEN-08", "monthly_deposit_ceiling")} />. העודף <Ruled id={["PEN-08", "PEN-10"]}>עובר לקרן הכללית אוטומטית</Ruled>, אצל אותה <Term id="חברה מנהלת">חברה מנהלת</Term>.
      </p>
      <p className="max-w-measure">
        כללי <Term prefix="ה" id="קצבה">קצבה</Term> והמס הם כמו במקיפה, אבל <Ruled id="PEN-18">אין</Ruled> <Term id="השלמת תשואה">השלמת תשואה</Term> של המדינה. תקרת דמי הניהול מהחיסכון גבוהה יותר, <N v={figure("PF-05", "balance_cap")} /> מול <N v={figure("PF-04", "balance_cap")} />, ותקרת דמי הניהול מההפקדה נמוכה יותר, <N v={figure("PF-05", "deposit_cap")} /> מול <N v={figure("PF-04", "deposit_cap")} />.
      </p>
    </>
  ),
  who: () => (
    <>
      <p className="max-w-measure">אותן חברות מנהלות של קרנות הפנסיה, <Ruled id="REG-17" prefix="ב">פיקוח</Ruled> <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון, ביטוח וחיסכון</Term>. לכל קרן מקיפה יש קרן כללית אחות, <Ruled id="PEN-10" prefix="ו">אליה העודף עובר</Ruled>.</p>
    </>
  ),
  switchLine: (
    <>
      <Ruled id="TXP-32">בלי מס הכנסה</Ruled>, גם בין מסלולים בתוך הקרן וגם במעבר לקרן פנסיה אחרת. <Ruled id="SW-22">לקרן המקיפה אפשר לחזור רק</Ruled> כשאתם לא <Term id="עמית">עמיתים</Term> פעילים בקרן הכללית.
    </>
  ),
  termIds: ["קרן נבחרת", "זיכוי ממס", "הכנסה מזכה", "מקדם המרה", "קצבה מזכה", "משיכה שלא כדין", "איזון אקטוארי", "קופת גמל לקצבה", "קרן פנסיה", "עמית", "משיכה", "גיל הפרישה", "תגמולי מעסיק", "מרכיב הפיצויים", "רשות שוק ההון ביטוח וחיסכון", "השלמת תשואה", "קצבה", "חברה מנהלת", "אינפלציה", "תקרת הפקדה"],
  afterTax: ({ figure }) => (
    <>
      <p className="max-w-measure">
        <Ruled id="TXP-24" prefix="ה">כללים זהים למקיפה</Ruled>, כי בתקנות מס הכנסה שתיהן <Term id="קופת גמל לקצבה">קופת גמל לקצבה</Term>. ההפקדה שלכם מורידה את מס ההכנסה ב־<N v={figure("TXP-01", "credit_pct")} /> מסכום ההפקדה, <Ruled id="TXP-01">בלי קשר למדרגת המס שלכם</Ruled>, ולפי הנחה של האתר עד גובה המס שאתם משלמים באותה שנה. זה <Term id="זיכוי ממס">זיכוי ממס</Term>, והוא חל על הפקדה של עד <N v={figure("TXP-02", "credited_pct_of_income")} /> <Term prefix="מ" id="הכנסה מזכה">הכנסה מזכה</Term> של עד <N v={figure("TXP-02", "eligible_income_cap")} /> בשנה.
      </p>
      <EmployerUntaxed figure={figure} />
      <Callout tone="blocked" className="max-w-measure">
        <span className="font-medium">את הקצבה האתר עוד לא מחשב, כי חסרים <Term id="מקדם המרה">מקדמי ההמרה</Term>.</span> שאלה פתוחה <IdRef id="PEN OQ7" end="." />
      </Callout>
      <p className="max-w-measure">
        <Ruled id="PEN-27">קצבה אפשר לקבל</Ruled> מגיל <N v={figure("PEN-26", "early_retirement_age")} />, אבל <Ruled id="TXP-14" prefix="ה">פטור ממס</Ruled> מתחיל רק <Term prefix="ב" id="גיל הפרישה">גיל הפרישה</Term> לפי החוק: <N v={figure("PEN-26", "retirement_age_men")} /> לגברים ו־<N v={figure("PEN-26", "retirement_age_women")} /> לנשים. לנשים שנולדו עד <N v={figure("PEN-26", "graded_women_born_until")} /> הגיל <Ruled id="PEN-26">מדורג לפי שנת הלידה</Ruled>. {disabilityRetirement}
      </p>
      <ExemptShare figure={figure} />
      <LumpSums figure={figure} />
    </>
  ),
  risks: ({ figure }) => (
    <>
      <p className="max-w-measure">הנכסים <Ruled id="PF-29">מוחזקים בנאמנות</Ruled>, בנפרד מהרכוש של החברה המנהלת, ואי אפשר לעקל אותם. זכויות של עמית <Ruled id="REG-18">אפשר לעקל רק לפי כללים שהשר קובע</Ruled>. אם החברה המנהלת קורסת, הניהול <Ruled id="REG-19">עובר לחברה אחרת</Ruled>.</p>
      <p className="max-w-measure"><Ruled id="PEN-18">אין כאן את המסלול</Ruled> עם השלמת <Term prefix="ה" id="תשואה">תשואה</Term> של המדינה: כל היתרה עולה ויורדת עם המסלול שבחרתם. כל <N v={figure("PEN-19", "balancing_every_months")} /> חודשים <Ruled id="PEN-19">היא מתעדכנת</Ruled> גם לפי <Term id="איזון אקטוארי">איזון אקטוארי</Term>: העודף או הגירעון שנובעים מגורמים דמוגרפיים, כמו תמותה ונכות.</p>
    </>
  ),
  use: () => (
    <>
      <p className="max-w-measure">
        הכסף מגיע לכאן אוטומטית כשההפקדה עוברת את התקרה של המקיפה. דמי הניהול על הכסף הזה <Ruled id="PEN-10">לא יכולים להיות גבוהים מדמי הניהול שלכם במקיפה</Ruled>, אלא אם סוכם אחרת במפורש. החברה מודיעה בכתב, בתוך שבועיים מההעברה הראשונה, על ההעברה, על דמי הניהול ועל הכיסוי הביטוחי.
      </p>
      <p className="max-w-measure">
        מה שכן בוחרים הוא המסלול. <Term prefix="ה" id="קרן נבחרת">קרנות הנבחרות</Term> <Ruled id="PEN-23">הן קרנות מקיפות</Ruled>. כאן שווה לבדוק את דמי הניהול.
      </p>
    </>
  ),
};
