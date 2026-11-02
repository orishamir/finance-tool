// Guide prose for קרן השתלמות (architecture 3.5: prose lives in content files; every figure is a Num).
// Same shape and register as kupat-gemel-lehashkaa.tsx; checked against the rule base (KH, TXH, PF);
// each block ends with the rules it rests on. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import type { SiteValue } from "../../lib/value";
import { Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout } from "../../components/kit";

const N = ({ v }: { v: SiteValue | null }) => (v ? <Num value={v} /> : null);

export const content: GuideContent = {
  what: ({ figure }) => (
    <>
      <p className="max-w-measure">
        חיסכון <Term prefix="ש" id="הפקדות המעסיק">המעסיק</Term> ואתם מפקידים אליו כל חודש מהשכר, בשיעורים שבהסכם העבודה. <Term id="עמית-עצמאי">עצמאים</Term> מפקידים בעצמם. הכסף מושקע <Term prefix="ב" id="מסלול השקעה">מסלול השקעה</Term> שבוחרים, וכל עוד הוא בקרן לא משלמים מס על הרווחים.
      </p>
      <p className="max-w-measure">
        <N v={figure("TXH-09", "lock_years")} /> שנים אחרי <Term id="מועד התשלום הראשון">התשלום הראשון</Term> אפשר <Term id="משיכה">למשוך</Term> את הכסף, והרווחים מההפקדות שעד התקרה פטורים ממס. למי שהגיע לגיל הפרישה, או למי שמושך לצורך השתלמות, התקופה היא <N v={figure("TXH-10", "lock_years")} /> שנים. אפשר למשוך גם קודם: הכסף לא נעול, אבל המשיכה ממוסה.
      </p>
      <p className="max-w-measure">
        הטבת המס חלה על הפקדות של עד <N v={figure("KH-04", "employer_pct")} /> מהשכר מהמעסיק ועד <N v={figure("KH-04", "employee_pct")} /> מכם. החלק שלכם חייב להיות לפחות שליש ממה שהמעסיק מפקיד.
      </p>
      <RulesLine ids={["KH-01", "KH-02", "KH-04", "TXH-18", "TXH-09", "TXH-10", "KH-10"]} />
    </>
  ),
  who: () => (
    <>
      <p className="max-w-measure">
        <Term id="חברה מנהלת">חברות מנהלות</Term> של קופות גמל, בפיקוח רשות שוק ההון, ביטוח וחיסכון.
      </p>
      <p className="max-w-measure">
        <Term id="עמית-שכיר">שכירים</Term> מצטרפים דרך המעסיק ובוחרים את הקרן בעצמם; המעסיק לא יכול להתנות את ההפקדה בקרן מסוימת. שכיר בלי הכנסה מעסק לא יכול לפתוח קרן לבד. לא נמצא חוק שמחייב כל מעסיק להפקיד: חובה כזו, אם יש, באה מהסכם העבודה או מצו הרחבה בענף. עצמאים פותחים ישירות, בכל עת.
      </p>
      <RulesLine ids={["REG-17", "KH-02", "KH-03"]} />
    </>
  ),
  switchLine: "בלי מס. אפשר גם לעבור לקרן השתלמות אחרת, רק עם כל היתרה ולא עם חלק ממנה; הוותק נשמר",
  switchRules: ["TXH-17", "PF-23", "KH-17", "PF-18", "TXH-19"],
  termIds: ["הפקדות המעסיק", "עמית-עצמאי", "עמית-שכיר", "מסלול השקעה", "מועד התשלום הראשון", "משיכה", "חברה מנהלת", "הפקדה מוטבת", "משכורת קובעת", "הרווח הריאלי", "ותק"],
  afterTax: ({ figure }) => (
    <>
      <p className="max-w-measure">
        הפטור ממס חל על רווחים <Term prefix="מ" id="הפקדה מוטבת">הפקדה מוטבת</Term>, כלומר מהפקדה שעד התקרה: עד <N v={figure("TXH-01", "employer_exempt_pct")} /> מהמעסיק ועד <N v={figure("TXH-08", "own_benefited_pct")} /> מכם, <Term prefix="מ" id="משכורת קובעת">משכורת קובעת</Term> של עד <N v={figure("TXH-02", "determining_salary_cap")} /> בחודש. לעצמאים התקרה היא <N v={figure("TXH-08", "self_employed_benefited")} /> בשנה.
      </p>
      <p className="max-w-measure">
        על רווחים מהפקדות שמעל התקרה משלמים במשיכה עד <N v={figure("TXH-11", "rate")} /> <Term prefix="מ" id="הרווח הריאלי">הרווח הריאלי</Term>.
      </p>
      <RulesLine ids={["TXH-01", "TXH-08", "TXH-02", "TXH-11", "TXH-03"]} />
      <Callout tone="caution" className="max-w-measure">
        <span className="font-medium">משיכה לפני הזמן אפשרית, אבל יקרה.</span> הפקדות המעסיק ממוסות כשכר, והרווחים לפי מדרגות המס של הכנסה שלא מיגיעה אישית, שמתחת לגיל <N v={figure("TXG-04", "age")} /> מתחילות ב־<N v={figure("TXG-03", "first_rate")} />. ההפקדות שלכם לא ממוסות שוב. הקרן מנכה במקור <N v={figure("TXH-15", "withholding_early")} /> מהסכומים החייבים; זה לא המס הסופי, ומי ששיעור המס שלו נמוך יותר מקבל את ההפרש בדוח שנתי. לשכירים הסכום מופיע למעלה, ב״מה מייחד״; לעצמאים האתר עוד לא מחשב אותו.
      </Callout>
      <RulesLine ids={["TXH-13", "TXH-15", "TXG-03", "TXG-04"]} />
      <p className="max-w-measure text-sm text-muted-foreground">הכלכלן הראשי במשרד האוצר המליץ לצמצם את ההטבה. זו המלצה בלבד: לא נמצאה הצעת חוק, והחוק לא השתנה.</p>
      <RulesLine ids={["TXH-22"]} />
    </>
  ),
  risks: () => (
    <>
      <p className="max-w-measure">הנכסים מוחזקים בנאמנות, בנפרד מהרכוש של החברה המנהלת, ואי אפשר לעקל אותם. זכויות של עמית אפשר לעקל רק לפי כללים שהשר קובע. אם החברה המנהלת קורסת, הניהול עובר לחברה אחרת. המדינה לא ערבה לשווי הקרן, והוא עולה ויורד עם ההשקעות של המסלול שבחרתם.</p>
      <p className="max-w-measure">משיכה סוגרת את החשבון להפקדות נוספות. הפקדות חדשות הולכות לחשבון אחר, עם <Term id="ותק">ותק</Term> שמתחיל מחדש. החריג הוא משיכה להשתלמות בארץ של עד שליש מהיתרה, אם לא הייתה משיכה כזו בשנה שלפניה.</p>
      <RulesLine ids={["PF-29", "REG-18", "REG-19", "KH-15"]} />
    </>
  ),
  use: () => (
    <>
      <p className="max-w-measure">
        לשכירים שהמעסיק מפקיד להם זה בדרך כלל הצעד הראשון: הפקדת המעסיק מגיעה רק לכאן, ואחרי התקופה הרווחים פטורים ממס. המחיר, לעומת קופת גמל להשקעה: עד סוף התקופה, משיכה של כספי המעסיק ושל הרווחים ממוסה בכבדות.
      </p>
      <p className="max-w-measure">עצמאים מקבלים ניכוי על ההפקדה ואת אותו פטור על הרווחים, בלי מעסיק.</p>
      <RulesLine ids={["KH-04", "TXH-09", "TXH-13", "TXH-05"]} />
    </>
  ),
};

export { RuleRef };
