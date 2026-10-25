// Guide prose for קרן השתלמות (architecture 3.5: prose lives in content files; every figure is a Num).
// Same shape and register as kupat-gemel-lehashkaa.tsx; checked against the rule base (KH, TXH, PF);
// each block ends with the rules it rests on. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import type { SiteValue } from "../../lib/value";
import { Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout } from "../../components/ui";

const N = ({ v }: { v: SiteValue | null }) => (v ? <Num value={v} /> : null);

export const content: GuideContent = {
  what: ({ figure }) => (
    <>
      <p className="max-w-measure">
        חיסכון <Term prefix="ש" id="הפקדות המעסיק">המעסיק</Term> ואתם מפקידים אליו מהשכר, בדרך כלל <N v={figure("KH-04", "employer_pct")} /> מהמעסיק ו־
        <N v={figure("KH-04", "employee_pct")} /> מכם; <Term id="עמית-עצמאי">עצמאים</Term> מפקידים בעצמם. הכסף מושקע <Term prefix="ב" id="מסלול השקעה">מסלול השקעה</Term> שבוחרים, ועל הרווחים לא
        משלמים מס כל עוד הוא בפנים. <N v={figure("TXH-09", "lock_years")} /> שנים אחרי <Term id="מועד התשלום הראשון">התשלום הראשון</Term> אפשר <Term id="משיכה">למשוך</Term> הכול בפטור
        ממס; לפני כן משיכה אפשרית, אבל ממוסה.
      </p>
      <RulesLine ids={["KH-01", "KH-02", "KH-04", "TXH-18", "TXH-09", "KH-10"]} />
    </>
  ),
  who: () => (
    <>
      <p className="max-w-measure">
        <Term id="חברה מנהלת">חברות מנהלות</Term> של קופות גמל, בפיקוח רשות שוק ההון, ביטוח וחיסכון. <Term id="עמית-שכיר">שכירים</Term> מצטרפים דרך המעסיק ובוחרים את הקרן בעצמם; המעסיק לא יכול להתנות
        את ההפקדה בקרן מסוימת. עצמאים פותחים ישירות, בכל עת.
      </p>
      <RulesLine ids={["REG-17", "KH-02", "KH-03"]} />
    </>
  ),
  switchLine: "בלי מס. לקרן השתלמות אחרת עוברת כל היתרה בלבד, והוותק נשמר",
  switchRules: ["TXH-17", "PF-23", "KH-17", "PF-18", "TXH-19"],
  termIds: ["הפקדות המעסיק", "עמית-עצמאי", "עמית-שכיר", "מסלול השקעה", "מועד התשלום הראשון", "משיכה", "חברה מנהלת", "הפקדה מוטבת", "משכורת קובעת", "הרווח הריאלי", "ותק"],
  afterTax: ({ figure }) => (
    <>
      <p className="max-w-measure">
        הפטור חל על <Term id="הפקדה מוטבת">הפקדה מוטבת</Term>: עד <N v={figure("TXH-01", "employer_exempt_pct")} /> מהמעסיק ועד <N v={figure("TXH-08", "own_benefited_pct")} /> מכם, מ
        <Term id="משכורת קובעת">משכורת קובעת</Term> של עד <N v={figure("TXH-02", "determining_salary_cap")} /> בחודש; לעצמאים עד <N v={figure("TXH-08", "self_employed_benefited")} /> בשנה. על
        הרווחים מהפקדות שמעבר לכך משלמים במשיכה עד <N v={figure("TXH-11", "rate")} /> <Term prefix="מ" id="הרווח הריאלי">הרווח הריאלי</Term>.
      </p>
      <RulesLine ids={["TXH-01", "TXH-08", "TXH-02", "TXH-11", "TXH-03"]} />
      <Callout tone="caution" className="max-w-measure">
        <span className="font-medium">משיכה לפני הזמן אפשרית, אבל יקרה.</span> הפקדות המעסיק ממוסות כשכר, הרווחים לפי מדרגות המס של הכנסה שלא מיגיעה אישית, והקרן מנכה במקור{" "}
        <N v={figure("TXH-15", "withholding_early")} />. למי ששכיר, כמה זה עולה מופיע למעלה, ב"מה מייחד"; לעצמאים האתר עוד לא מחשב את זה.
      </Callout>
      <RulesLine ids={["TXH-13", "TXH-15", "TXG-03"]} />
      <p className="max-w-measure text-sm text-muted-foreground">באוצר דנים בצמצום ההטבה. נכון להיום החוק לא השתנה; האתר יעודכן אם ישתנה.</p>
      <RulesLine ids={["TXH-22"]} />
    </>
  ),
  risks: () => (
    <>
      <p className="max-w-measure">הנכסים מוחזקים בנאמנות, בנפרד מהרכוש של החברה המנהלת, ואי אפשר לעקל אותם. אם החברה המנהלת קורסת, הניהול עובר לחברה אחרת. אין ערבות של המדינה לשווי הקרן.</p>
      <p className="max-w-measure">השווי עולה ויורד עם ההשקעות של המסלול שבחרתם. אחרי משיכה החשבון נסגר להפקדות, והפקדות חדשות פותחות חשבון עם <Term id="ותק">ותק</Term> חדש.</p>
      <RulesLine ids={["PF-29", "REG-18", "REG-19", "KH-15"]} />
    </>
  ),
  use: () => (
    <>
      <p className="max-w-measure">
        לשכירים עם מעסיק שמפקיד זה כמעט תמיד הצעד הראשון: הפקדות המעסיק קיימות רק כאן, והרווחים פטורים ממס אחרי התקופה. המחיר לעומת קופת גמל להשקעה: הכסף לא זמין בלי מס עד שהקרן
        נזילה. עצמאים מקבלים ניכוי בהפקדה ואת אותו פטור, בלי מעסיק.
      </p>
      <RulesLine ids={["KH-04", "TXH-09", "TXH-13", "TXH-05"]} />
    </>
  ),
};

export { RuleRef };
