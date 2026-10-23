// Guide prose for קרן חדשה מקיפה (new comprehensive pension fund). Same shape and register as
// kupat-gemel-lehashkaa.tsx; checked against the rule base (PEN, TXP, PF, REG); each block ends with the
// rules it rests on. No <Term>: the glossary tags the pension terms under guide:pension-and-gemel-lekitzba,
// not under this wrapper id. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import type { SiteValue } from "../../lib/value";
import { Num, RuleRef, RulesLine } from "../../components/provenance";
import { Callout } from "../../components/ui";

const N = ({ v }: { v: SiteValue | null }) => (v ? <Num value={v} /> : null);

export const content: GuideContent = {
  what: ({ figure }) => (
    <>
      <p className="max-w-measure">
        קרן הפנסיה שכמעט כל שכיר מבוטח בה דרך המעסיק: לפחות <N v={figure("PEN-03", "employee_pct")} /> מכם, <N v={figure("PEN-03", "employer_pct")} /> מהמעסיק ו־
        <N v={figure("PEN-03", "severance_pct")} /> לפיצויים, מהשכר עד השכר הממוצע במשק. הכסף חוסך לקצבה חודשית מגיל <N v={figure("PEN-26", "early_retirement_age")} /> ומעלה, והקרן
        כוללת גם ביטוח נכות וביטוח שאירים שמשולם מהחשבון. <N v={figure("PEN-18", "guaranteed_share")} /> מהנכסים נמצאים במסלול עם הבטחת תשואה של המדינה.
      </p>
      <RulesLine ids={["PEN-01", "PEN-03", "PEN-04", "PEN-11", "PEN-15", "PEN-18", "PEN-27"]} />
    </>
  ),
  who: ({ figure }) => (
    <>
      <p className="max-w-measure">
        חברות מנהלות של קרנות פנסיה, בפיקוח רשות שוק ההון, ביטוח וחיסכון. מי שלא בוחר קרן מצורף לאחת מארבע הקרנות הנבחרות, בדמי ניהול של <N v={figure("PEN-23", "selected_deposit_fee")} /> מההפקדה ו־
        <N v={figure("PEN-23", "selected_balance_fee")} /> מהצבירה, שמובטחים לפחות <N v={figure("PEN-23", "guarantee_years")} /> שנים.
      </p>
      <RulesLine ids={["REG-17", "PEN-06", "PEN-23"]} />
    </>
  ),
  switchLine: "בלי מס. מעבר לקרן פנסיה אחרת מתחיל מחדש את תקופת האכשרה של הביטוח",
  switchRules: ["PEN-17", "PF-23", "SW-22", "PF-28"],
  termIds: [],
  afterTax: ({ figure }) => (
    <>
      <p className="max-w-measure">
        ההפקדה שלכם מזכה בזיכוי של <N v={figure("TXP-01", "credit_pct")} /> ממנה, על הפקדה של עד <N v={figure("TXP-02", "credited_pct_of_income")} /> מהכנסה מזכה של עד{" "}
        <N v={figure("TXP-02", "eligible_income_cap")} /> בשנה. הפקדות המעסיק עד <N v={figure("TXP-10", "employer_exempt_pct")} /> מהשכר, ועד שכר של <N v={figure("TXP-10", "employer_ceiling")} /> בחודש,
        לא ממוסות בהפקדה.
      </p>
      <RulesLine ids={["TXP-01", "TXP-02", "TXP-10", "TXP-11"]} />
      <Callout tone="blocked" className="max-w-measure">
        <span className="font-medium">את הקצבה האתר עוד לא מחשב, כי חסרים מקדמי ההמרה.</span> שאלה פתוחה: <bdi dir="ltr" className="whitespace-nowrap">PEN OQ7</bdi>. מגיל הפרישה חלק מהקצבה פטור ממס:{" "}
        <N v={figure("TXP-14", "exempt_share")} /> מתקרה של <N v={figure("TXP-14", "annuity_ceiling")} /> בחודש, והשיעור עולה בחוק ב־2027 וב־2028. משיכה שלא כדין לפני הפרישה ממוסה לפחות ב־
        <N v={figure("TXP-18", "minimum_rate")} />, ועל איזה סכום בדיוק: שאלה פתוחה <bdi dir="ltr" className="whitespace-nowrap">TXP OQ3</bdi>.
      </Callout>
      <RulesLine ids={["TXP-14", "TXP-15", "TXP-18", "PEN-27", "PEN-30"]} />
    </>
  ),
  risks: ({ figure }) => (
    <>
      <p className="max-w-measure">הנכסים מוחזקים בנאמנות, בנפרד מהרכוש של החברה המנהלת, ואי אפשר לעקל אותם. אם החברה המנהלת קורסת, הניהול עובר לחברה אחרת.</p>
      <p className="max-w-measure">
        היתרה שלכם משתנה גם בלי קשר להשקעות: פעם בשנה הקרן מעדכנת את כל החשבונות לפי העודף או הגירעון האקטוארי. דמי הביטוח יורדים מהחיסכון כל חודש. על <N v={figure("PEN-18", "guaranteed_share")} /> מהנכסים
        המדינה משלימה תשואה ליעד של <N v={figure("PEN-18", "target_return")} /> בשנה, נבדק כל חמש שנים; אם היעד צמוד למדד: שאלה פתוחה <bdi dir="ltr" className="whitespace-nowrap">PEN OQ8</bdi>. השאר עולה ויורד עם המסלול.
      </p>
      <RulesLine ids={["PF-29", "REG-18", "REG-19", "REG-21", "PEN-18", "PEN-19", "PEN-15"]} />
    </>
  ),
  use: () => (
    <>
      <p className="max-w-measure">
        הבסיס של כל חוסך שכיר: המעסיק מפקיד רק לכאן או לקופת גמל לקצבה, ההפקדה שלכם מזכה בזיכוי ממס, וחלק מהנכסים בהבטחת תשואה. התמורה: הכסף נעול עד הפרישה ויוצא כקצבה, לא כסכום אחד.
        לעומת קופת גמל לקצבה יש כאן ביטוח ואיזון אקטוארי, ודמי ניהול עם תקרה נמוכה יותר.
      </p>
      <RulesLine ids={["PEN-05", "TXP-01", "PEN-18", "PEN-35", "PF-04"]} />
    </>
  ),
};

export { RuleRef };
