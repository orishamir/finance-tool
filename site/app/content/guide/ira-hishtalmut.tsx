// Guide prose for קרן השתלמות בניהול אישי (architecture 3.5: prose lives in content files; every figure is a
// Num). Written 2026-10-23 from the rule base (IRA, KH, TXH, TXK, PF, REG); each block ends with the rules it
// rests on. NEW copy for the founder to review (docs/copy.md holds only labels).
import type { GuideContent } from "./types";
import { Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";

export const content: GuideContent = {
  what: ({ figure }) => {
    const years = figure("TXH-09", "lock_years");
    const short = figure("TXH-10", "lock_years");
    return (
      <>
        <p className="max-w-measure">
          <Term id="קופת גמל בניהול אישי">קרן השתלמות בניהול אישי</Term>: קרן השתלמות שבה אתם, <Term prefix="ב" id="ניהול עצמי">ניהול עצמי</Term> או דרך <Term id="מנהל תיקים">מנהל תיקים</Term> שבחרתם, מחליטים במה להשקיע. מותר להחזיק ניירות ערך סחירים, קרנות, פיקדונות ומטבע חוץ, בישראל ובמדינות מאושרות, בלי ועדת השקעות של החברה.
        </p>
        <Sentence measure>
          כללי המס והנזילות הם של קרן השתלמות רגילה: אחרי {years ? <Num value={years} /> : null} שנים מהתשלום הראשון מושכים בפטור ממס על הרווחים מההפקדות המוטבות, ואחרי {short ? <Num value={short} /> : null} שנים בגיל פרישה או לצורך השתלמות. <Term prefix="ה" id="ותק">ותק</Term> של קרן שמעבירים נשמר. בתוך הקופה קונים ומוכרים בלי מס.
        </Sentence>
        <RulesLine ids={["IRA-01", "IRA-05", "IRA-11", "TXH-09", "TXH-10", "IRA-23", "TXK-17"]} />
      </>
    );
  },
  who: () => (
    <>
      <p className="max-w-measure">
        <Term id="חברה מנהלת">חברות מנהלות</Term> של קופות גמל שאושרה להן קרן בניהול אישי, בפיקוח רשות שוק ההון, ביטוח וחיסכון. המסחר עצמו מתבצע דרך ברוקר שבוחרים מרשימה שהחברה קובעת <Term prefix="ב" id="הליך תחרותי">הליך תחרותי</Term>.
      </p>
      <RulesLine ids={["IRA-03", "IRA-18", "IRA-21"]} />
    </>
  ),
  switchLine: "קנייה ומכירה בתוך הקופה בלי מס; מעבר לקרן השתלמות אחרת או לקופה אישית אחרת, במזומן או בניירות",
  switchRules: ["TXH-17", "IRA-23", "KH-17"],
  termIds: ["קופת גמל בניהול אישי", "ניהול עצמי", "מנהל תיקים", "ותק", "חברה מנהלת", "הליך תחרותי", "עמלות ברוקראז'", "דמי משמרת", "דמי ניהול", "הסכום הקובע", "משיכה", "עמית"],
  afterTax: () => (
    <>
      <Callout tone="caution" className="max-w-measure">
        <span className="font-medium">מה משלמים מעבר <Term prefix="ל" id="דמי ניהול">דמי הניהול</Term>.</span> <Term id="עמלות ברוקראז'">עמלות ברוקראז'</Term> על כל קנייה ומכירה, <Term id="דמי משמרת">דמי משמרת</Term> ודמי ניהול של הקרנות שמחזיקים נגבים מהקופה לפי תעריף הברוקר שבחרתם. התקרה לדמי הניהול של קופה אישית אחרי תיקון התקנות לא אותרה; האתר מציג את תקרת תקנה 4. שאלה פתוחה: <bdi dir="ltr" className="whitespace-nowrap">IRA OQ3</bdi>.
      </Callout>
      <RulesLine ids={["IRA-16", "IRA-17", "PF-06", "IRA-21"]} />
    </>
  ),
  risks: ({ figure }) => {
    const issuer = figure("IRA-12", "single_issuer_cap");
    return (
      <>
        <Sentence measure>הסיכון כולו שלכם: אין ועדת השקעות, והרגולטור עצמו כותב שהגמישות חושפת לסיכוני השקעה גדולים יותר. התקנות מגבילות ריכוז (עד {issuer ? <Num value={issuer} /> : null} מהקופה בתאגיד אחד) ואוסרות אשראי ומינוף; חריגה שלא תוקנה חוסמת את החשבון.</Sentence>
        <p className="max-w-measure">נכסי הקופה מוחזקים בנאמנות, בנפרד מרכוש החברה המנהלת, ואם היא קורסת הניהול עובר לחברה אחרת. מה קורה לניירות אם החברה או הברוקר קורסים לא נמצא במקור, ושני גופים שניהלו קופות אישיות כשלו בשנים האחרונות. מס זר שנוכה על דיבידנדים בתוך הקופה הוא עלות.</p>
        <RulesLine ids={["IRA-26", "IRA-12", "IRA-13", "IRA-14", "REG-18", "REG-19", "IRA-28", "TXK-18"]} />
      </>
    );
  },
  use: () => (
    <>
      <p className="max-w-measure">
        למי שכבר יש קרן השתלמות בסכום משמעותי, שיודע לבנות תיק בעצמו או עם מנהל תיקים, ורוצה לבחור ניירות ספציפיים, כמו קרנות סל זרות, בלי לוותר על הפטור של קרן ההשתלמות. למי שמסתפק במסלול מנוהל, קרן רגילה פשוטה יותר ובלי עמלות מסחר. חברה אחת ממליצה על המוצר רק מסכום שהיא נוקבת בו.
      </p>
      <RulesLine ids={["IRA-10", "IRA-16", "IRA-07"]} />
    </>
  ),
};

export { RuleRef };
