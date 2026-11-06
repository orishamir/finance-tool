// Guide prose for קרן חדשה כללית (new general pension fund). Same shape and register as
// kupat-gemel-lehashkaa.tsx; checked against the rule base (PEN, TXP, PF); each block ends with the rules
// it rests on. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import type { SiteValue } from "../../lib/value";
import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout } from "../../components/kit";

const N = ({ v }: { v: SiteValue | null }) => (v ? <Num value={v} /> : null);

export const content: GuideContent = {
  what: ({ figure }) => (
    <>
      <p className="max-w-measure">
        קרן פנסיה שמקבלת את ההפקדות שמעל התקרה החודשית של הקרן המקיפה, <N v={figure("PEN-08", "monthly_deposit_ceiling")} /> בחודש. העודף עובר אליה אוטומטית, אצל אותה חברה מנהלת.
      </p>
      <p className="max-w-measure">
        כללי הקצבה והמס הם כמו במקיפה, אבל אין הבטחת תשואה של המדינה. תקרת דמי הניהול מהחיסכון גבוהה יותר, <N v={figure("PF-05", "balance_cap")} /> מול <N v={figure("PF-04", "balance_cap")} />, ותקרת דמי הניהול מההפקדה נמוכה יותר, <N v={figure("PF-05", "deposit_cap")} /> מול <N v={figure("PF-04", "deposit_cap")} />.
      </p>
      <RulesLine ids={["PEN-10", "PEN-08", "PEN-18", "PF-05", "PF-04"]} />
    </>
  ),
  who: () => (
    <>
      <p className="max-w-measure">אותן חברות מנהלות של קרנות הפנסיה, בפיקוח רשות שוק ההון, ביטוח וחיסכון. לכל קרן מקיפה יש קרן כללית אחות, ואליה העודף עובר.</p>
      <RulesLine ids={["REG-17", "PEN-10"]} />
    </>
  ),
  switchLine: "בלי מס הכנסה, גם בין מסלולים בתוך הקרן וגם במעבר לקרן פנסיה אחרת. לקרן המקיפה אפשר לחזור רק כשאתם לא עמיתים פעילים בקרן הכללית",
  switchRules: ["PEN-17", "PF-23", "SW-22"],
  termIds: ["זיכוי ממס", "הכנסה מזכה", "מקדם המרה", "קצבה מזכה", "משיכה שלא כדין", "איזון אקטוארי", "קופת גמל לקצבה"],
  afterTax: ({ figure }) => (
    <>
      <p className="max-w-measure">
        הכללים זהים למקיפה, כי בחוק שתיהן <Term id="קופת גמל לקצבה">קופת גמל לקצבה</Term>. ההפקדה שלכם מורידה את המס ב־<N v={figure("TXP-01", "credit_pct")} /> מסכום ההפקדה, בלי קשר למדרגת המס שלכם. זה <Term id="זיכוי ממס">זיכוי ממס</Term>, והוא חל על הפקדה של עד <N v={figure("TXP-02", "credited_pct_of_income")} /> <Term prefix="מ" id="הכנסה מזכה">הכנסה מזכה</Term> של עד <N v={figure("TXP-02", "eligible_income_cap")} /> בשנה.
      </p>
      <p className="max-w-measure">
        הפקדות המעסיק לא ממוסות בהפקדה, עד <N v={figure("TXP-10", "employer_exempt_pct")} /> מהשכר ועד שכר של <N v={figure("TXP-10", "employer_ceiling")} /> בחודש.
      </p>
      <RulesLine ids={["TXP-01", "TXP-02", "TXP-10", "TXP-24"]} />
      <Callout tone="blocked" className="max-w-measure">
        <span className="font-medium">את הקצבה האתר עוד לא מחשב, כי חסרים <Term id="מקדם המרה">מקדמי ההמרה</Term>.</span> שאלה פתוחה (<IdRef id="PEN OQ7" />).
      </Callout>
      <p className="max-w-measure">
        קצבה אפשר לקבל מגיל <N v={figure("PEN-26", "early_retirement_age")} />, אבל הפטור ממס מתחיל רק בגיל הפרישה לפי החוק: <N v={figure("PEN-26", "retirement_age_men")} /> לגברים ו־<N v={figure("PEN-26", "retirement_age_women")} /> לנשים. לנשים שנולדו עד סוף שנות השישים הגיל מדורג לפי שנת הלידה.
      </p>
      <p className="max-w-measure">
        הפטור הוא סכום, זהה לכל מי שזכאי, ולא חלק מהקצבה של כל אדם: <N v={figure("TXP-14", "exempt_share")} /> מתקרה של <N v={figure("TXP-14", "annuity_ceiling")} /> בחודש על <Term id="קצבה מזכה">קצבה מזכה</Term>.
      </p>
      <p className="max-w-measure">
        משיכה שלא כקצבה אפשרית רק במקרים מסוימים. החוק קורא לה <Term id="משיכה שלא כדין">משיכה שלא כדין</Term>, והיא ממוסה על כל הסכום שמשולם: הגבוה מבין <N v={figure("TXP-18", "minimum_rate")} /> והשיעור השולי <RuleRef id="TXP-18" />. יש חריגים, כמו הוצאות רפואיות גבוהות.
      </p>
      <RulesLine ids={["TXP-14", "TXP-18", "PEN-26", "PEN-27", "PEN-30"]} />
    </>
  ),
  risks: () => (
    <>
      <p className="max-w-measure">הנכסים מוחזקים בנאמנות, בנפרד מהרכוש של החברה המנהלת, ואי אפשר לעקל אותם. זכויות של עמית אפשר לעקל רק לפי כללים שהשר קובע. אם החברה המנהלת קורסת, הניהול עובר לחברה אחרת.</p>
      <p className="max-w-measure">אין כאן את המסלול עם הבטחת התשואה של המדינה: כל היתרה עולה ויורדת עם המסלול שבחרתם. כל רבעון היא מתעדכנת גם לפי <Term id="איזון אקטוארי">איזון אקטוארי</Term>: העודף או הגירעון שנובעים מגורמים דמוגרפיים, כמו תמותה ונכות.</p>
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
