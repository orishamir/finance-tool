// Guide prose for קרן חדשה מקיפה (new comprehensive pension fund). Same shape and register as
// kupat-gemel-lehashkaa.tsx; checked against the rule base (PEN, TXP, PF, REG); each block ends with the
// rules it rests on. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import type { SiteValue } from "../../lib/value";
import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout, When } from "../../components/kit";
import { disabilityRetirement, EmployerUntaxed, ExemptShare, LumpSums } from "./pension-parts";

const N = ({ v }: { v: SiteValue | null }) => (v ? <Num value={v} /> : null);

export const content: GuideContent = {
  what: ({ figure }) => (
    <>
      <p className="max-w-measure">
        צו ההרחבה מחייב חיסכון לפנסיה לכל עובד מגיל <N v={figure("PEN-01", "minimum_age_men")} /> לגברים ומגיל <N v={figure("PEN-01", "minimum_age_women")} /> לנשים, חוץ ממי שיש לו הסדר טוב לפחות כמו זה. העובד בוחר קרן מקיפה או <Term id="קופת גמל לקצבה">קופת גמל לקצבה</Term> עם כיסוי ביטוחי. מי שלא בוחר, המעסיק מבטח אותו בקרן מקיפה.
      </p>
      <p className="max-w-measure">
        ההפקדה היא לפחות <N v={figure("PEN-03", "employee_pct")} /> מכם, ומהמעסיק <N v={figure("PEN-03", "employer_pct")} /> ועוד <N v={figure("PEN-03", "severance_pct")} /> לפיצויים, מהשכר עד <Term id="השכר הממוצע במשק">השכר הממוצע במשק</Term>.
      </p>
      <p className="max-w-measure">
        הכסף נחסך <Term prefix="ל" id="קצבה">קצבה</Term> חודשית מגיל <N v={figure("PEN-26", "early_retirement_age")} /> ומעלה. הקרן כוללת גם ביטוח נכות וביטוח <Term id="שאירים">שאירים</Term>, ודמי הביטוח יורדים מהחשבון. <N v={figure("PEN-18", "guaranteed_share")} /> מהנכסים נמצאים במסלול עם <Term id="השלמת תשואה">השלמת תשואה</Term> של המדינה, ולמי שהיה זכאי לפני המועד שבחוק החלק גדול יותר.
      </p>
      <RulesLine ids={["PEN-01", "PEN-03", "PEN-04", "PEN-05", "PEN-11", "PEN-15", "PEN-18", "PEN-26", "PEN-27"]} />
    </>
  ),
  who: ({ figure }) => (
    <>
      <p className="max-w-measure">
        <Term id="חברה מנהלת">חברות מנהלות</Term> של <Term id="קרן פנסיה">קרנות פנסיה</Term>, בפיקוח <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון, ביטוח וחיסכון</Term>. מי שלא בוחר קרן מצורף לאחת מארבע <Term prefix="ה" id="קרן נבחרת">קרנות הנבחרות</Term>, <Term prefix="ב" id="דמי ניהול">דמי ניהול</Term> של <N v={figure("PEN-23", "selected_deposit_fee")} /> מההפקדה ו־<N v={figure("PEN-23", "selected_balance_fee")} /> מהחיסכון, שמובטחים לפחות <N v={figure("PEN-23", "guarantee_years")} /> שנים. מעסיק יכול גם לבחור קרן <Term prefix="ב" id="הליך תחרותי">הליך תחרותי</Term> משלו.
      </p>
      <p className="max-w-measure">
        <When iso="2025-06-01" lead="מ־" /> עד <When iso="2028-10-31" /> הקרן הנבחרת נקבעת לפי ספרת הביקורת בתעודת הזהות: <bdi>7, 8, 9</bdi> אינפיניטי; <bdi>4, 5, 6</bdi> מור; <bdi>2, 3</bdi> אלטשולר שחם; <bdi>0, 1</bdi> מיטב.
      </p>
      <RulesLine ids={["REG-17", "PEN-06", "PEN-23"]} />
    </>
  ),
  switchLine: "בלי מס הכנסה, גם בין מסלולים בתוך הקרן וגם במעבר לקרן פנסיה אחרת. במעבר חודשי הביטוח נספרים, חוץ מחריגים.",
  switchRules: ["PEN-17", "PF-23", "SW-22", "SW-12", "PF-28"],
  termIds: ["זיכוי ממס", "הכנסה מזכה", "מקדם המרה", "קצבה מזכה", "משיכה שלא כדין", "איזון אקטוארי", "קרן נבחרת", "קופת גמל לקצבה", "קרן פנסיה", "צמוד למדד המחירים לצרכן", "עמית", "גיל הפרישה", "הליך תחרותי", "דמי ניהול", "רשות שוק ההון ביטוח וחיסכון", "חברה מנהלת", "משיכה", "תגמולי מעסיק", "מרכיב הפיצויים", "השלמת תשואה", "קצבה", "השכר הממוצע במשק", "אינפלציה", "תקרת הפקדה"],
  afterTax: ({ figure }) => {
    return (
    <>
      <p className="max-w-measure">
        ההפקדה שלכם מורידה את מס ההכנסה ב־<N v={figure("TXP-01", "credit_pct")} /> מסכום ההפקדה, בלי קשר למדרגת המס שלכם. זה <Term id="זיכוי ממס">זיכוי ממס</Term>, והוא חל על הפקדה של עד <N v={figure("TXP-02", "credited_pct_of_income")} /> <Term prefix="מ" id="הכנסה מזכה">הכנסה מזכה</Term> של עד <N v={figure("TXP-02", "eligible_income_cap")} /> בשנה.
      </p>
      <EmployerUntaxed figure={figure} />
      <RulesLine ids={["TXP-01", "TXP-02", "TXP-10", "TXP-11"]} />
      <Callout tone="blocked" className="max-w-measure">
        <span className="font-medium">את הקצבה האתר עוד לא מחשב, כי חסרים <Term id="מקדם המרה">מקדמי ההמרה</Term>.</span> שאלה פתוחה <IdRef id="PEN OQ7" end="." />
      </Callout>
      <p className="max-w-measure">
        קצבה אפשר לקבל מגיל <N v={figure("PEN-26", "early_retirement_age")} />, אבל הפטור ממס מתחיל רק <Term prefix="ב" id="גיל הפרישה">גיל הפרישה</Term> לפי החוק: <N v={figure("PEN-26", "retirement_age_men")} /> לגברים ו־<N v={figure("PEN-26", "retirement_age_women")} /> לנשים. לנשים שנולדו עד סוף שנות השישים הגיל מדורג לפי שנת הלידה. {disabilityRetirement}
      </p>
      <ExemptShare figure={figure} />
      <LumpSums figure={figure} />
      <RulesLine ids={["TXP-14", "TXP-15", "PEN-31", "TXP-19", "TXP-17", "TXP-18", "PEN-26", "PEN-27", "PEN-30"]} />
    </>
    );
  },
  risks: ({ figure }) => (
    <>
      <p className="max-w-measure">הנכסים מוחזקים בנאמנות, בנפרד מהרכוש של החברה המנהלת, ואי אפשר לעקל אותם. זכויות של <Term id="עמית">עמית</Term> אפשר לעקל רק לפי כללים שהשר קובע. אם החברה המנהלת קורסת, הניהול עובר לחברה אחרת.</p>
      <p className="max-w-measure">
        היתרה שלכם משתנה גם בלי קשר להשקעות. כל רבעון הקרן מעדכנת את כל החשבונות לפי איזון אקטוארי: העודף או הגירעון שנובעים מגורמים דמוגרפיים, כמו תמותה ונכות. עודף או גירעון מתשואות חל רק על מקבלי הקצבה. גם דמי הביטוח יורדים מהחיסכון כל חודש.
      </p>
      <p className="max-w-measure">
        על <N v={figure("PEN-18", "guaranteed_share")} /> מהנכסים, ולמי שהיה זכאי לפני המועד שבחוק על חלק גדול יותר, המדינה משלימה <Term id="תשואה">תשואה</Term> ליעד של <N v={figure("PEN-18", "target_return")} /> בשנה, <Term id="צמוד למדד המחירים לצרכן">צמוד למדד</Term>, והיעד נבדק כל חמש שנים <RuleRef id="PEN-18" end="." /> השאר עולה ויורד עם המסלול.
      </p>
      <RulesLine ids={["PF-29", "REG-18", "REG-19", "REG-21", "PEN-18", "PEN-19", "PEN-15"]} />
    </>
  ),
  use: ({ figure }) => (
    <>
      <p className="max-w-measure">
        הבסיס של החיסכון לפרישה של שכירים: <Term id="תגמולי מעסיק">תגמולי המעסיק</Term> לפנסיה מגיעים רק לכאן או לקופת גמל לקצבה, ההפקדה שלכם מורידה את מס ההכנסה, וחלק מהנכסים בהשלמת תשואה. המחיר: הכסף מיועד לקצבה, <Term prefix="ו" id="משיכה">משיכה</Term> בסכום אחד אפשרית רק במקרים שבחוק <Term prefix="וב" id="תקנון">תקנון</Term>.
      </p>
      <p className="max-w-measure">
        לעומת קופת גמל לקצבה יש כאן ביטוח <Term prefix="ו" id="איזון אקטוארי">איזון אקטוארי</Term>. תקרת דמי הניהול מהחיסכון נמוכה יותר, <N v={figure("PF-04", "balance_cap")} /> מול <N v={figure("PF-02", "balance_cap")} />, ותקרת דמי הניהול מההפקדה גבוהה יותר, <N v={figure("PF-04", "deposit_cap")} /> מול <N v={figure("PF-02", "deposit_cap")} />.
      </p>
      <RulesLine ids={["PEN-05", "PEN-28", "PEN-30", "TXP-01", "PEN-18", "PEN-35", "PF-04", "PF-02"]} />
    </>
  ),
};

export { RuleRef };
