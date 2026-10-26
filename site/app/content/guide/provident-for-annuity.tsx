// Guide prose for תגמולים ואישית לפיצויים (provident fund for annuity: tagmulim and personal severance).
// Same shape and register as kupat-gemel-lehashkaa.tsx; checked against the rule base (PEN, TXP, PF); each
// block ends with the rules it rests on. No <Term>: the glossary tags these terms under
// guide:pension-and-gemel-lekitzba, not under this wrapper id. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import type { SiteValue } from "../../lib/value";
import { IdRef, Num, RuleRef, RulesLine } from "../../components/provenance";
import { Callout } from "../../components/kit";

const N = ({ v }: { v: SiteValue | null }) => (v ? <Num value={v} /> : null);

export const content: GuideContent = {
  what: () => (
    <>
      <p className="max-w-measure">
        קופת גמל לחיסכון לפרישה בלי ביטוח. המעסיק ואתם, או עצמאים בעצמכם, מפקידים לפי אותן תקרות מס כמו בקרן פנסיה, אבל אין כאן ביטוח נכות ושאירים, אין הבטחת תשואה של המדינה ואין איזון
        אקטוארי. הקופה עצמה לא משלמת קצבה: בפרישה מעבירים את הכסף לקרן פנסיה או לחברת ביטוח, והן משלמות.
      </p>
      <RulesLine ids={["PEN-34", "PEN-35", "TXP-24"]} />
    </>
  ),
  who: () => (
    <>
      <p className="max-w-measure">חברות מנהלות של קופות גמל, בפיקוח רשות שוק ההון, ביטוח וחיסכון. בגמל נט הקופות האלה מסווגות "תגמולים ואישית לפיצויים".</p>
      <RulesLine ids={["REG-17", "PEN-34"]} />
    </>
  ),
  switchLine: "בלי מס. לקופה אחרת או לקרן פנסיה, בלי ביטוח שצריך להעביר",
  switchRules: ["PF-23", "SW-23"],
  termIds: [],
  afterTax: ({ figure }) => (
    <>
      <p className="max-w-measure">
        ההפקדה שלכם מזכה בזיכוי של <N v={figure("TXP-01", "credit_pct")} /> ממנה, על הפקדה של עד <N v={figure("TXP-02", "credited_pct_of_income")} /> מהכנסה מזכה של עד{" "}
        <N v={figure("TXP-02", "eligible_income_cap")} /> בשנה. הפקדות המעסיק עד <N v={figure("TXP-10", "employer_exempt_pct")} /> מהשכר, ועד שכר של <N v={figure("TXP-10", "employer_ceiling")} /> בחודש,
        לא ממוסות בהפקדה. עצמאים שמפקידים יותר מקבלים גם ניכוי.
      </p>
      <RulesLine ids={["TXP-01", "TXP-02", "TXP-10", "TXP-06", "TXP-24"]} />
      <Callout tone="blocked" className="max-w-measure">
        <span className="font-medium">את הקצבה האתר עוד לא מחשב.</span> הקופה לא משלמת אותה בעצמה, ומי מקבל את הכסף ובאילו מקדמים: שאלה פתוחה <IdRef id="PEN OQ19" />. מגיל
        הפרישה חלק מהקצבה פטור ממס: <N v={figure("TXP-14", "exempt_share")} /> מתקרה של <N v={figure("TXP-14", "annuity_ceiling")} /> בחודש. משיכה שלא כדין ממוסה על כל הסכום שמשולם, בגבוה מבין{" "}
        <N v={figure("TXP-18", "minimum_rate")} /> והשיעור השולי <RuleRef id="TXP-18" />.
      </Callout>
      <RulesLine ids={["PEN-34", "TXP-14", "TXP-18", "PEN-29"]} />
    </>
  ),
  risks: () => (
    <>
      <p className="max-w-measure">הנכסים מוחזקים בנאמנות, בנפרד מהרכוש של החברה המנהלת, ואי אפשר לעקל אותם. אם החברה המנהלת קורסת, הניהול עובר לחברה אחרת. אין ערבות של המדינה לשווי הקופה.</p>
      <p className="max-w-measure">אין כאן הבטחת תשואה ואין איזון אקטוארי: היתרה עולה ויורדת רק עם ההשקעות של המסלול שבחרתם. אין גם ביטוח, אז במקרה נכות או מוות יש רק מה שנצבר.</p>
      <RulesLine ids={["PF-29", "REG-18", "REG-19", "PEN-35"]} />
    </>
  ),
  use: () => (
    <>
      <p className="max-w-measure">
        למי שרוצה את הטבות המס של הפנסיה בלי לשלם על ביטוח: עצמאים שמבוטחים במקום אחר, או שכירים שהמעסיק מסכים להפקיד לכאן. לעומת קרן פנסיה מקיפה: אין ביטוח, אין הבטחת תשואה,
        תקרת דמי הניהול גבוהה יותר, ובפרישה צריך למצוא מי שישלם את הקצבה.
      </p>
      <RulesLine ids={["PEN-35", "PEN-05", "PEN-22", "PF-04"]} />
    </>
  ),
};

export { RuleRef };
