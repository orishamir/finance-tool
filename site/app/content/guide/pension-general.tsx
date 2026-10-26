// Guide prose for קרן חדשה כללית (new general pension fund). Same shape and register as
// kupat-gemel-lehashkaa.tsx; checked against the rule base (PEN, TXP, PF); each block ends with the rules
// it rests on. No <Term>: the glossary tags the pension terms under guide:pension-and-gemel-lekitzba,
// not under this wrapper id. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import type { SiteValue } from "../../lib/value";
import { IdRef, Num, RuleRef, RulesLine } from "../../components/provenance";
import { Callout } from "../../components/kit";

const N = ({ v }: { v: SiteValue | null }) => (v ? <Num value={v} /> : null);

export const content: GuideContent = {
  what: ({ figure }) => (
    <>
      <p className="max-w-measure">
        קרן פנסיה שמקבלת את ההפקדות שמעל התקרה החודשית של הקרן המקיפה, <N v={figure("PEN-08", "monthly_deposit_ceiling")} /> בחודש: העודף עובר אליה אוטומטית, אצל אותה חברה מנהלת.
        אותם כללי קצבה ומס כמו במקיפה, אבל בלי הבטחת תשואה של המדינה, ועם תקרת דמי ניהול גבוהה יותר.
      </p>
      <RulesLine ids={["PEN-10", "PEN-08", "PEN-18", "PF-05"]} />
    </>
  ),
  who: () => (
    <>
      <p className="max-w-measure">אותן חברות מנהלות של קרנות הפנסיה, בפיקוח רשות שוק ההון, ביטוח וחיסכון. לכל קרן מקיפה יש קרן כללית אחות, ואליה העודף עובר.</p>
      <RulesLine ids={["REG-17", "PEN-10"]} />
    </>
  ),
  switchLine: "בלי מס. חזרה לקרן המקיפה אפשרית רק כשאינכם עמיתים פעילים בכללית",
  switchRules: ["PEN-17", "PF-23", "SW-22"],
  termIds: [],
  afterTax: ({ figure }) => (
    <>
      <p className="max-w-measure">
        ההפקדה שלכם מזכה בזיכוי של <N v={figure("TXP-01", "credit_pct")} /> ממנה, על הפקדה של עד <N v={figure("TXP-02", "credited_pct_of_income")} /> מהכנסה מזכה של עד{" "}
        <N v={figure("TXP-02", "eligible_income_cap")} /> בשנה. הפקדות המעסיק עד <N v={figure("TXP-10", "employer_exempt_pct")} /> מהשכר, ועד שכר של <N v={figure("TXP-10", "employer_ceiling")} /> בחודש,
        לא ממוסות בהפקדה. הכללים זהים למקיפה: בחוק שתיהן קופת גמל לקצבה.
      </p>
      <RulesLine ids={["TXP-01", "TXP-02", "TXP-10", "TXP-24"]} />
      <Callout tone="blocked" className="max-w-measure">
        <span className="font-medium">את הקצבה האתר עוד לא מחשב, כי חסרים מקדמי ההמרה.</span> שאלה פתוחה: <IdRef id="PEN OQ7" />. מגיל הפרישה חלק מהקצבה פטור ממס:{" "}
        <N v={figure("TXP-14", "exempt_share")} /> מתקרה של <N v={figure("TXP-14", "annuity_ceiling")} /> בחודש. משיכה שלא כדין ממוסה על כל הסכום שמשולם, בגבוה מבין <N v={figure("TXP-18", "minimum_rate")} />{" "}
        והשיעור השולי <RuleRef id="TXP-18" />.
      </Callout>
      <RulesLine ids={["TXP-14", "TXP-18", "PEN-27", "PEN-30"]} />
    </>
  ),
  risks: () => (
    <>
      <p className="max-w-measure">הנכסים מוחזקים בנאמנות, בנפרד מהרכוש של החברה המנהלת, ואי אפשר לעקל אותם. אם החברה המנהלת קורסת, הניהול עובר לחברה אחרת.</p>
      <p className="max-w-measure">אין כאן את המסלול עם הבטחת התשואה של המדינה: כל היתרה עולה ויורדת עם המסלול שבחרתם, ופעם בשנה היא מתעדכנת גם לפי האיזון האקטוארי של הקרן.</p>
      <RulesLine ids={["PF-29", "REG-18", "REG-19", "PEN-18", "PEN-19"]} />
    </>
  ),
  use: () => (
    <>
      <p className="max-w-measure">
        בקרן הזאת לא בוחרים: מגיעים אליה כשהשכר גבוה מספיק שההפקדה עוברת את התקרה של המקיפה. מה שכן בוחרים הוא המסלול ודמי הניהול, כי תנאי המכרז של הקרנות הנבחרות לא חלים
        עליה, ובדיקה של דמי הניהול כאן משתלמת.
      </p>
      <RulesLine ids={["PEN-10", "PEN-23", "PF-05"]} />
    </>
  ),
};

export { RuleRef };
