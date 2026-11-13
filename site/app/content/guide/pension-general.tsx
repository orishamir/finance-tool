// Guide prose for קרן חדשה כללית (new general pension fund). Same shape and register as
// kupat-gemel-lehashkaa.tsx; checked against the rule base (PEN, TXP, PF); each block ends with the rules
// it rests on. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import type { SiteValue } from "../../lib/value";
import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout } from "../../components/kit";
import { disabilityRetirement, ExemptShare } from "./pension-parts";

const N = ({ v }: { v: SiteValue | null }) => (v ? <Num value={v} /> : null);

export const content: GuideContent = {
  what: ({ figure }) => (
    <>
      <p className="max-w-measure">
        <Term id="תקרת הפקדה">תקרת ההפקדה</Term> החודשית לקרן המקיפה, של המעסיק ושלכם יחד, היא <N v={figure("PEN-08", "monthly_deposit_ceiling")} />. העודף עובר לקרן הכללית אוטומטית, אצל אותה <Term id="חברה מנהלת">חברה מנהלת</Term>.
      </p>
      <p className="max-w-measure">
        כללי <Term prefix="ה" id="קצבה">קצבה</Term> והמס הם כמו במקיפה, אבל אין <Term id="השלמת תשואה">השלמת תשואה</Term> של המדינה. תקרת דמי הניהול מהחיסכון גבוהה יותר, <N v={figure("PF-05", "balance_cap")} /> מול <N v={figure("PF-04", "balance_cap")} />, ותקרת דמי הניהול מההפקדה נמוכה יותר, <N v={figure("PF-05", "deposit_cap")} /> מול <N v={figure("PF-04", "deposit_cap")} />.
      </p>
      <RulesLine ids={["PEN-10", "PEN-08", "PEN-18", "PF-05", "PF-04"]} />
    </>
  ),
  who: () => (
    <>
      <p className="max-w-measure">אותן חברות מנהלות של קרנות הפנסיה, בפיקוח <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון, ביטוח וחיסכון</Term>. לכל קרן מקיפה יש קרן כללית אחות, ואליה העודף עובר.</p>
      <RulesLine ids={["REG-17", "PEN-10"]} />
    </>
  ),
  switchLine: (
    <>
      בלי מס הכנסה, גם בין מסלולים בתוך הקרן וגם במעבר לקרן פנסיה אחרת. לקרן המקיפה אפשר לחזור רק כשאתם לא <Term id="עמית">עמיתים</Term> פעילים בקרן הכללית.
    </>
  ),
  switchRules: ["PEN-17", "PF-23", "SW-22"],
  termIds: ["זיכוי ממס", "הכנסה מזכה", "מקדם המרה", "קצבה מזכה", "משיכה שלא כדין", "איזון אקטוארי", "קופת גמל לקצבה", "קרן פנסיה", "עמית", "משיכה", "גיל הפרישה", "הפקדות המעסיק", "רשות שוק ההון ביטוח וחיסכון", "השלמת תשואה", "קצבה", "חברה מנהלת", "אינפלציה", "תקרת הפקדה"],
  afterTax: ({ figure }) => (
    <>
      <p className="max-w-measure">
        הכללים זהים למקיפה, כי בחוק שתיהן <Term id="קופת גמל לקצבה">קופת גמל לקצבה</Term>. ההפקדה שלכם מורידה את מס ההכנסה ב־<N v={figure("TXP-01", "credit_pct")} /> מסכום ההפקדה, בלי קשר למדרגת המס שלכם. זה <Term id="זיכוי ממס">זיכוי ממס</Term>, והוא חל על הפקדה של עד <N v={figure("TXP-02", "credited_pct_of_income")} /> <Term prefix="מ" id="הכנסה מזכה">הכנסה מזכה</Term> של עד <N v={figure("TXP-02", "eligible_income_cap")} /> בשנה.
      </p>
      <p className="max-w-measure">
        <Term id="הפקדות המעסיק">הפקדות המעסיק</Term> לא ממוסות בהפקדה, עד <N v={figure("TXP-10", "employer_exempt_pct")} /> מהשכר ועד שכר של <N v={figure("TXP-10", "employer_ceiling")} /> בחודש.
      </p>
      <RulesLine ids={["TXP-01", "TXP-02", "TXP-10", "TXP-24"]} />
      <Callout tone="blocked" className="max-w-measure">
        <span className="font-medium">את הקצבה האתר עוד לא מחשב, כי חסרים <Term id="מקדם המרה">מקדמי ההמרה</Term>.</span> שאלה פתוחה <IdRef id="PEN OQ7" end="." />
      </Callout>
      <p className="max-w-measure">
        קצבה אפשר לקבל מגיל <N v={figure("PEN-26", "early_retirement_age")} />, אבל הפטור ממס מתחיל רק <Term prefix="ב" id="גיל הפרישה">גיל הפרישה</Term> לפי החוק: <N v={figure("PEN-26", "retirement_age_men")} /> לגברים ו־<N v={figure("PEN-26", "retirement_age_women")} /> לנשים. לנשים שנולדו עד סוף שנות השישים הגיל מדורג לפי שנת הלידה. {disabilityRetirement}
      </p>
      <ExemptShare figure={figure} />
      <p className="max-w-measure">
        <Term id="משיכה">משיכה</Term> שלא כקצבה אפשרית רק במקרים מסוימים. החוק קורא לה <Term id="משיכה שלא כדין">משיכה שלא כדין</Term>, והיא ממוסה על כל הסכום שמשולם: הגבוה מבין <N v={figure("TXP-18", "minimum_rate")} /> והשיעור השולי <RuleRef id="TXP-18" end="." /> יש חריגים, כמו הוצאות רפואיות גבוהות.
      </p>
      <RulesLine ids={["TXP-14", "TXP-18", "PEN-26", "PEN-27", "PEN-30"]} />
    </>
  ),
  risks: () => (
    <>
      <p className="max-w-measure">הנכסים מוחזקים בנאמנות, בנפרד מהרכוש של החברה המנהלת, ואי אפשר לעקל אותם. זכויות של עמית אפשר לעקל רק לפי כללים שהשר קובע. אם החברה המנהלת קורסת, הניהול עובר לחברה אחרת.</p>
      <p className="max-w-measure">אין כאן את המסלול עם השלמת <Term prefix="ה" id="תשואה">תשואה</Term> של המדינה: כל היתרה עולה ויורדת עם המסלול שבחרתם. כל רבעון היא מתעדכנת גם לפי <Term id="איזון אקטוארי">איזון אקטוארי</Term>: העודף או הגירעון שנובעים מגורמים דמוגרפיים, כמו תמותה ונכות.</p>
      <RulesLine ids={["PF-29", "REG-18", "REG-19", "PEN-18", "PEN-19"]} />
    </>
  ),
  use: () => (
    <>
      <p className="max-w-measure">
        הכסף מגיע לכאן אוטומטית כשההפקדה עוברת את התקרה של המקיפה. דמי הניהול על הכסף הזה לא יכולים להיות גבוהים מדמי הניהול שלכם במקיפה, אלא אם סוכם אחרת במפורש. החברה מודיעה בכתב, בתוך שבועיים מההעברה הראשונה, על ההעברה, על דמי הניהול ועל הכיסוי הביטוחי.
      </p>
      <p className="max-w-measure">
        מה שכן בוחרים הוא המסלול. תנאי המכרז של הקרנות הנבחרות לא חלים כאן, ולכן שווה לבדוק את דמי הניהול.
      </p>
      <RulesLine ids={["PEN-10", "PEN-23", "PF-05"]} />
    </>
  ),
};

export { RuleRef };
