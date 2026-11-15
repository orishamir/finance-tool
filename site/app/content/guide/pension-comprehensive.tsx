// Guide prose for קרן חדשה מקיפה (new comprehensive pension fund). Same shape and register as
// kupat-gemel-lehashkaa.tsx; checked against the rule base (PEN, TXP, PF, REG); the words that state a rule
// open it (Ruled, D116), and a figure from a rule opens it from its sheet. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import type { SiteValue } from "../../lib/value";
import { IdRef, Num, Ruled, Term } from "../../components/provenance";
import { Callout } from "../../components/kit";
import { disabilityRetirement, EmployerUntaxed, ExemptShare, LumpSums } from "./pension-parts";

const N = ({ v, prefix }: { v: SiteValue | null; prefix?: string }) => (v ? <Num value={v} prefix={prefix} /> : null);

export const content: GuideContent = {
  what: ({ figure }) => (
    <>
      <p className="max-w-measure">
        צו ההרחבה <Ruled id="PEN-01">מחייב חיסכון לפנסיה לכל עובד</Ruled> מגיל <N v={figure("PEN-01", "minimum_age_men")} /> לגברים ומגיל <N v={figure("PEN-01", "minimum_age_women")} /> לנשים, חוץ ממי שיש לו הסדר טוב לפחות כמו זה. העובד בוחר קרן מקיפה או <Term id="קופת גמל לקצבה">קופת גמל לקצבה</Term> עם כיסוי ביטוחי. מי שלא בוחר, המעסיק <Ruled id="PEN-05">מבטח אותו בקרן מקיפה</Ruled>.
      </p>
      <p className="max-w-measure">
        ההפקדה היא לפחות <N v={figure("PEN-03", "employee_pct")} /> מכם, ומהמעסיק <N v={figure("PEN-03", "employer_pct")} /> ועוד <N v={figure("PEN-03", "severance_pct")} /> לפיצויים, <Ruled id="PEN-04" prefix="מ">השכר עד</Ruled> <Term id="השכר הממוצע במשק">השכר הממוצע במשק</Term>.
      </p>
      <p className="max-w-measure">
        הכסף נחסך <Term prefix="ל" id="קצבה">קצבה</Term> חודשית מגיל <N v={figure("PEN-26", "early_retirement_age")} /> ומעלה. הקרן <Ruled id="PEN-08">כוללת גם ביטוח נכות</Ruled> וביטוח <Term id="שאירים">שאירים</Term>, ודמי הביטוח <Ruled id="PEN-15">באים מההפקדות</Ruled>. <N v={figure("PEN-18", "guaranteed_share")} /> מהנכסים נמצאים במסלול עם <Term id="השלמת תשואה">השלמת תשואה</Term> של המדינה, ולמי שהיה זכאי לפני המועד שבחוק החלק <Ruled id="PEN-18">גדול יותר</Ruled>.
      </p>
    </>
  ),
  who: ({ figure }) => (
    <>
      <p className="max-w-measure">
        <Term id="חברה מנהלת">חברות מנהלות</Term> של <Term id="קרן פנסיה">קרנות פנסיה</Term>, <Ruled id="REG-17" prefix="ב">פיקוח</Ruled> <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון, ביטוח וחיסכון</Term>. מי שלא בוחר קרן מצורף לאחת מארבע <Term prefix="ה" id="קרן נבחרת">קרנות הנבחרות</Term>, <Term prefix="ב" id="דמי ניהול">דמי ניהול</Term> של <N v={figure("PEN-23", "selected_deposit_fee")} /> מההפקדה ו־<N v={figure("PEN-23", "selected_balance_fee")} /> מהחיסכון, שמובטחים לפחות <N v={figure("PEN-23", "guarantee_years")} /> שנים. <Ruled id="PEN-06">מעסיק יכול גם לבחור קרן</Ruled> <Term prefix="ב" id="הליך תחרותי">הליך תחרותי</Term> משלו.
      </p>
      <p className="max-w-measure">
        <N v={figure("PEN-23", "digits_from")} prefix="מ־" /> עד <N v={figure("PEN-23", "period_to")} /> הקרן הנבחרת <Ruled id="PEN-23">נקבעת לפי ספרת הביקורת בתעודת הזהות</Ruled>: <N v={figure("PEN-23", "digits_infinity")} /> אינפיניטי; <N v={figure("PEN-23", "digits_mor")} /> מור; <N v={figure("PEN-23", "digits_altshuler")} /> אלטשולר שחם; <N v={figure("PEN-23", "digits_meitav")} /> מיטב.
      </p>
    </>
  ),
  switchLine: "בלי מס הכנסה, גם בין מסלולים בתוך הקרן וגם במעבר לקרן פנסיה אחרת. במעבר חודשי הביטוח נספרים, חוץ מחריגים.",
  switchRules: ["PEN-17", "PF-23", "SW-22", "SW-12", "PF-28"],
  termIds: ["זיכוי ממס", "הכנסה מזכה", "מקדם המרה", "קצבה מזכה", "משיכה שלא כדין", "איזון אקטוארי", "קרן נבחרת", "קופת גמל לקצבה", "קרן פנסיה", "צמוד למדד המחירים לצרכן", "עמית", "גיל הפרישה", "הליך תחרותי", "דמי ניהול", "רשות שוק ההון ביטוח וחיסכון", "חברה מנהלת", "משיכה", "תגמולי מעסיק", "מרכיב הפיצויים", "השלמת תשואה", "קצבה", "השכר הממוצע במשק", "אינפלציה", "תקרת הפקדה"],
  afterTax: ({ figure }) => {
    return (
    <>
      <p className="max-w-measure">
        ההפקדה שלכם מורידה את מס ההכנסה ב־<N v={figure("TXP-01", "credit_pct")} /> מסכום ההפקדה, <Ruled id="TXP-01">בלי קשר למדרגת המס שלכם</Ruled>, ולפי הנחה של האתר עד גובה המס שאתם משלמים באותה שנה. זה <Term id="זיכוי ממס">זיכוי ממס</Term>, והוא חל על הפקדה של עד <N v={figure("TXP-02", "credited_pct_of_income")} /> <Term prefix="מ" id="הכנסה מזכה">הכנסה מזכה</Term> של עד <N v={figure("TXP-02", "eligible_income_cap")} /> בשנה.
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
    );
  },
  risks: ({ figure }) => (
    <>
      <p className="max-w-measure">הנכסים <Ruled id="PF-29">מוחזקים בנאמנות</Ruled>, בנפרד מהרכוש של החברה המנהלת, ואי אפשר לעקל אותם. זכויות של <Term id="עמית">עמית</Term> <Ruled id="REG-18">אפשר לעקל רק לפי כללים שהשר קובע</Ruled>. אם החברה המנהלת קורסת, הניהול <Ruled id="REG-19">עובר לחברה אחרת</Ruled>.</p>
      <p className="max-w-measure">
        היתרה שלכם משתנה גם בלי קשר להשקעות. כל <N v={figure("PEN-19", "balancing_every_months")} /> חודשים הקרן <Ruled id="PEN-19">מעדכנת את כל החשבונות לפי איזון אקטוארי</Ruled>: העודף או הגירעון שנובעים מגורמים דמוגרפיים, כמו תמותה ונכות. עודף או גירעון מתשואות חל רק על מקבלי הקצבה. גם <Ruled id="PEN-15">דמי הביטוח יורדים מההפקדות</Ruled>, כל עוד אתם מבוטחים.
      </p>
      <p className="max-w-measure">
        על <N v={figure("PEN-18", "guaranteed_share")} /> מהנכסים, ולמי שהיה זכאי לפני המועד שבחוק על חלק גדול יותר, <Ruled id="REG-21">המדינה משלימה</Ruled> <Term id="תשואה">תשואה</Term> ליעד של <N v={figure("PEN-18", "target_return")} /> בשנה, <Term id="צמוד למדד המחירים לצרכן">צמוד למדד</Term>, <Ruled id="PEN-18" prefix="ו">היעד נבדק</Ruled> כל <N v={figure("PEN-18", "check_period_months")} /> חודשים. השאר עולה ויורד עם המסלול.
      </p>
    </>
  ),
  use: ({ figure }) => (
    <>
      <p className="max-w-measure">
        הבסיס של החיסכון לפרישה של שכירים: <Term id="תגמולי מעסיק">תגמולי המעסיק</Term> לפנסיה <Ruled id="PEN-05">מגיעים רק לכאן או לקופת גמל לקצבה</Ruled>, ההפקדה שלכם <Ruled id="TXP-01">מורידה את מס ההכנסה</Ruled>, וחלק מהנכסים <Ruled id="PEN-18" prefix="ב">השלמת תשואה</Ruled>. המחיר: הכסף מיועד לקצבה, <Term prefix="ו" id="משיכה">משיכה</Term> בסכום אחד <Ruled id={["PEN-30", "PEN-28"]}>אפשרית רק במקרים שבחוק</Ruled> <Term prefix="וב" id="תקנון">תקנון</Term>.
      </p>
      <p className="max-w-measure">
        לעומת קופת גמל לקצבה, הביטוח כאן הוא חלק מהקרן, ויש <Term id="איזון אקטוארי">איזון אקטוארי</Term>. <Ruled id="PEN-35">תקרת דמי הניהול מהחיסכון נמוכה יותר</Ruled>, <N v={figure("PF-04", "balance_cap")} /> מול <N v={figure("PF-02", "balance_cap")} />, ותקרת דמי הניהול מההפקדה גבוהה יותר, <N v={figure("PF-04", "deposit_cap")} /> מול <N v={figure("PF-02", "deposit_cap")} />.
      </p>
    </>
  ),
};
