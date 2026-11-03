// Guide prose for קרן השתלמות (architecture 3.5: prose lives in content files; every figure is a Num).
// Same shape and register as kupat-gemel-lehashkaa.tsx; checked against the rule base (KH, TXH, PF);
// each block ends with the rules it rests on. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import type { SiteValue } from "../../lib/value";
import { Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout, ProseList } from "../../components/kit";
import { sectionTitle } from "../../lib/guide-nav";
import { fmt } from "../../lib/format";

const N = ({ v }: { v: SiteValue | null }) => (v ? <Num value={v} /> : null);
const Whole = ({ v }: { v: SiteValue | null }) => (v ? <Num value={v} display={fmt.nisWhole} /> : null);

export const content: GuideContent = {
  what: ({ figure }) => (
    <>
      <p className="max-w-measure">
        קרן השתלמות היא קופת גמל שבה הכסף מושקע <Term prefix="ב" id="מסלול השקעה">מסלול השקעה</Term> לבחירתכם.
      </p>
      <p className="max-w-measure">
        אם הסכם העבודה כולל קרן השתלמות, <Term id="הפקדות המעסיק">המעסיק</Term> מפקיד לקרן כל חודש כסף בנוסף לשכר הברוטו, ואתם מפקידים חלק מהשכר שלכם. האחוז שכל צד מעביר לקרן כתוב בהסכם העבודה. <Term id="עמית-עצמאי">עצמאים</Term> מפקידים בעצמם.
      </p>
      <p className="max-w-measure">
        אחרי <N v={figure("TXH-09", "lock_years")} /> שנים <Term prefix="מ" id="מועד התשלום הראשון">ההפקדה הראשונה</Term> אפשר <Term id="משיכה">למשוך</Term> את הכסף בלי מס הכנסה ובלי <Term id="מס רווחי הון">מס רווחי הון</Term>. למי שהגיע <Term prefix="ל" id="גיל הפרישה">גיל הפרישה</Term> מספיקות <N v={figure("TXH-10", "lock_years")} /> שנים. גם על כסף שמושכים כדי לשלם על לימודים מספיקות <N v={figure("TXH-10", "lock_years")} /> שנים: בחוק זה נקרא ״השתלמות״, ומכאן שם הקרן. אילו לימודים נחשבים נקבע גם בתקנון של כל קרן.
      </p>
      <p className="max-w-measure">
        הפטור לא חל על כל סכום. לשכירים הוא חל על הפקדות של עד <N v={figure("KH-04", "employer_pct")} /> מהשכר מהמעסיק ועד <N v={figure("KH-04", "employee_pct")} /> מהשכר שלכם, ורק על שכר של עד <Whole v={figure("TXH-02", "determining_salary_cap")} /> בחודש: גם מי שמרוויח יותר מחשב את האחוזים לפי <Whole v={figure("TXH-02", "determining_salary_cap")} />. לעצמאים הוא חל על הפקדות של עד <Whole v={figure("TXH-08", "self_employed_benefited")} /> בשנה.
      </p>
      <p className="max-w-measure">
        אפשר להפקיד גם יותר, אבל על הרווח מהכסף שמעל הגבול הפטור לא חל. בשאר המקרים אפשר למשוך גם לפני <N v={figure("TXH-09", "lock_years")} /> השנים, אבל אז משלמים מס. כמה משלמים בכל מקרה כתוב ב״{sectionTitle("keren-hishtalmut", "tax")}״.
      </p>
      <RulesLine ids={["KH-01", "KH-02", "KH-03", "KH-04", "KH-10", "TXH-09", "TXH-10", "TXH-02", "TXH-08", "TXH-03"]} />
    </>
  ),
  who: () => (
    <>
      <p className="max-w-measure">
        <Term id="חברה מנהלת">חברות מנהלות</Term> של קופות גמל, בפיקוח רשות שוק ההון, ביטוח וחיסכון.
      </p>
      <p className="max-w-measure">
        <Term id="עמית-שכיר">שכירים</Term> מצטרפים דרך המעסיק ובוחרים את הקרן בעצמם: המעסיק לא יכול לדרוש קרן מסוימת כתנאי להפקדה. שכיר בלי הכנסה מעסק לא יכול לפתוח קרן לבד. עצמאים פותחים קרן ישירות.
      </p>
      <p className="max-w-measure">האתר לא מצא חוק שמחייב כל מעסיק להפקיד לקרן השתלמות. חובה כזו, אם יש, באה מהסכם העבודה או מהסכם שחל על כל הענף (צו הרחבה).</p>
      <RulesLine ids={["REG-17", "KH-02", "KH-03"]} />
    </>
  ),
  omitFreeRow: true,
  omitCompanyTerms: ["fee-change-over-time"],
  relatedIds: ["kupat-gemel-lehashkaa", "ira-hishtalmut"],
  switchLine: ({ figure }) => (
    <>
      בלי עמלה, בתוך <N v={figure("PF-23", "switch_business_days")} /> ימי עסקים לכל היותר
    </>
  ),
  switchRules: ["PF-23", "KH-18"],
  inoutRows: () => [
    {
      id: "new-fund",
      label: "הפקדות חדשות בקרן אחרת",
      value: "אם ההפקדות עוברות לקרן אחרת, והכסף הישן נשאר במקומו בלי שנמשך ממנו כסף בפטור ממס, השנים של הישן נספרות גם לחדש: שני החשבונות נחשבים חשבון אחד. התנאי: העובד והמעסיק הודיעו לשתי הקרנות שכל ההפקדות עוברות לקרן החדשה. מהחשבון הישן מושכים רק אחרי שמשכו את כל הכסף מהחדש. אותו כלל חל במעבר משכיר לעצמאי ולהפך.",
      rules: ["KH-14"],
    },
    {
      id: "other-kind",
      label: "מעבר לקופה מסוג אחר",
      value: "לקופה שמשלמת קצבה, כמו קרן פנסיה: רק אם אפשר כבר למשוך את הכסף בפטור ממס. לקופת גמל להשקעה: בתקנות לא נמצאה דרך כזו, חוץ מאישור מיוחד.",
      rules: ["KH-17", "PF-17"],
    },
  ],
  termIds: ["הפקדות המעסיק", "עמית-עצמאי", "עמית-שכיר", "מסלול השקעה", "מועד התשלום הראשון", "משיכה", "חברה מנהלת", "הפקדה מוטבת", "משכורת קובעת", "הרווח הריאלי", "ותק"],
  afterTax: ({ figure }) => (
    <>
      <p className="max-w-measure font-medium">משיכה לפני <N v={figure("TXH-09", "lock_years")} /> שנים: מה משלמים שכירים</p>
      <ProseList
        items={[
          <>על כסף שהמעסיק הפקיד עד הגבול: מס הכנסה, כמו על משכורת.</>,
          <>על הרווח מההשקעות: מס הכנסה, ולא מס רווחי הון. למי שמתחת לגיל <N v={figure("TXG-04", "age")} /> זה לפחות <N v={figure("TXG-03", "first_rate")} />; מגיל <N v={figure("TXG-04", "age")} /> המדרגות מתחילות נמוך יותר.</>,
          <>על כסף שהפקדתם מהשכר: לא משלמים שוב, כי כבר שילמתם עליו מס כשקיבלתם את השכר.</>,
        ]}
      />
      <p className="max-w-measure">עצמאים משלמים מס הכנסה, כמו על הכנסה מהעסק, על הרווח ועל ההפקדות שקיבלו עליהן ניכוי ממס.</p>
      <RulesLine ids={["TXH-13", "TXH-04", "TXG-03", "TXG-04"]} />
      <Callout tone="caution" className="max-w-measure">
        <span className="font-medium">לא כל הסכום מגיע לחשבון.</span> במשיכה לפני הזמן, מהכסף שחייב במס הקרן מעבירה <N v={figure("TXH-15", "withholding_early")} /> ישירות למס הכנסה. זה לא בהכרח המס שלכם: מי שהמס שלו נמוך יותר מקבל את ההפרש בחזרה רק אם מבקש החזר ממס הכנסה. לשכירים הסכומים מופיעים למעלה, ב״{sectionTitle("keren-hishtalmut", "different")}״, כשבוחרים פחות מ־<N v={figure("TXH-09", "lock_years")} /> שנים; לעצמאים האתר עוד לא מחשב אותם.
      </Callout>
      <RulesLine ids={["TXH-13", "TXH-15"]} />
      <p className="max-w-measure text-sm text-muted-foreground">
        הכלכלן הראשי במשרד האוצר המליץ לצמצם את ההטבה, בעיקר בהורדת תקרת השכר, ובדק גם ביטול של הפטור על הרווח, או הגבלה שלו לרווח של <N v={figure("TXH-09", "lock_years")} /> השנים הראשונות. זו המלצה, לא החלטה: לא נמצאה הצעת חוק, וכרגע הפטור בתוקף.
      </p>
      <RulesLine ids={["TXH-22"]} />
    </>
  ),
  risks: () => (
    <>
      <p className="max-w-measure">הפסד בהשקעות הוא שלכם: שווי הקרן עולה ויורד עם ההשקעות של המסלול שבחרתם, והמדינה לא ערבה לו.</p>
      <p className="max-w-measure">החברה המנהלת מחזיקה את הכסף בנפרד מהרכוש שלה, ומי שהיא חייבת לו כסף לא יכול לעקל אותו. אם היא קורסת, הניהול עובר לחברה אחרת. ומי שאתם חייבים לו כסף יכול לעקל את הזכויות שלכם בקרן רק לפי כללים מיוחדים.</p>
      <RulesLine ids={["PF-29", "REG-18", "REG-19"]} />
    </>
  ),
};

export { RuleRef };
