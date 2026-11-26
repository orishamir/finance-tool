// Guide prose for קרן השתלמות בניהול אישי (architecture 3.5: prose lives in content files; every figure is a
// Num). Written from the rule base (IRA, KH, TXH, TXK, PF, REG); the words that state a rule open it (Ruled,
// D116), and a figure from a rule opens it from its sheet. NEW copy for the founder to review (docs/copy.md
// holds only labels).
import type { GuideContent } from "./types";
import { Num, Ruled, Term, VariesByCompany } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";

export const content: GuideContent = {
  what: ({ figure }) => {
    const years = figure("TXH-09", "lock_years");
    const short = figure("TXH-10", "lock_years");
    const multiple = figure("IRA-07", "cap_multiple");
    return (
      <>
        <p className="max-w-measure">
          <Ruled id="IRA-01">בחוק היא</Ruled> <Term id="קופת גמל בניהול אישי">קופת גמל בניהול אישי</Term>. <Ruled id="IRA-11">מותר להחזיק</Ruled> <Term id="נייר ערך">ניירות ערך</Term> סחירים, קרנות, <Term id="פיקדון">פיקדונות</Term> <Term prefix="ו" id="מטבע חוץ">מטבע חוץ</Term>, בישראל ובמדינות מאושרות. הכסף מושקע <Ruled id="IRA-05">לפי ההוראות שלכם</Ruled>, בלי ועדת השקעות של החברה.
        </p>
        <Sentence measure>
          כללי מס ההכנסה והנזילות הם של <Term id="קרן השתלמות">קרן השתלמות</Term> רגילה. אחרי {years ? <Num value={years} /> : null} שנים מהתשלום הראשון <Ruled id="TXH-09">מושכים בפטור ממס הכנסה</Ruled> על הרווחים מההפקדות המוטבות. אחרי {short ? <Num value={short} /> : null} שנים מושכים כך <Term prefix="ב" id="גיל פרישה">גיל פרישה</Term> או <Ruled id="TXH-10" prefix="ל">צורך השתלמות</Ruled>. <Term prefix="ה" id="ותק">וותק</Term> <Ruled id="IRA-23">של קרן שמעבירים נשמר</Ruled>. <Ruled id="TXK-17">בתוך הקופה קונים ומוכרים</Ruled> בלי <Term id="מס רווחי הון">מס רווחי הון</Term>.
        </Sentence>
        <p className="max-w-measure">
          הכסף שאפשר להכניס מוגבל: עד פי {multiple ? <Num value={multiple} /> : null} <Term prefix="מ" id="הסכום הקובע">הסכום הקובע</Term>, <Ruled id="IRA-07">על כל חשבונות ההשתלמות יחד</Ruled>.
        </p>
      </>
    );
  },
  who: () => (
    <>
      <p className="max-w-measure">
        <Term id="חברה מנהלת">חברות מנהלות</Term> של <Term id="קופת גמל">קופות גמל</Term> שאושרה להן קרן בניהול אישי, בפיקוח <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון, ביטוח וחיסכון</Term>.
      </p>
      <p className="max-w-measure">
        המסחר עצמו נעשה דרך <Term id="ברוקר">ברוקר</Term>. החברה בוחרת ברוקרים <Term prefix="ב" id="הליך תחרותי">הליך תחרותי</Term>. אפשר <Ruled id="IRA-18">לבחור גם ברוקר אחר</Ruled>, בתנאי שהוצגו לכם התנאים שהחברה סיכמה עם הזוכים.
      </p>
      <p className="max-w-measure">
        <VariesByCompany ids={["IRA-21"]} lead="אילו ברוקרים ובאילו עמלות תלוי בחברה המנהלת" />
      </p>
    </>
  ),
  switchLine: (
    <>
      קנייה ומכירה בתוך הקופה <Ruled id={["TXK-17", "TXH-17"]}>בלי מס רווחי הון</Ruled>. אפשר גם לעבור לקופה אישית אחרת, <Ruled id="IRA-23">במזומן או בניירות</Ruled>, או <Ruled id="KH-17" prefix="ל">קרן השתלמות רגילה</Ruled>, בדרך שהקרן הקולטת בוחרת.
    </>
  ),
  termIds: ["קופת גמל בניהול אישי", "עמלת ניהול חיצוני", "הוצאות ישירות", "מס רווחי הון", "קרן חוץ", "ניהול עצמי", "מנהל תיקים", "ותק", "חברה מנהלת", "הליך תחרותי", "עמלות ברוקראז'", "דמי ניהול פיקדון ניירות ערך", "דמי ניהול", "הסכום הקובע", "משיכה", "עמית", "מטבע חוץ", "מנהל מורשה", "איגרות חוב ממשלתיות", "תעודות סל", "דמי ניהול מהפקדה", "רשות שוק ההון ביטוח וחיסכון", "קופת גמל", "עמלת קנייה ומכירה", "קרן סל", "גיל פרישה", "פיקדון", "נייר ערך", "קרן השתלמות"],
  afterTax: ({ figure }) => {
    const cap = figure("PF-06", "balance_cap");
    return (
    <>
      <Callout tone="caution" className="max-w-measure">
        <span className="font-medium">מה משלמים מעבר <Term prefix="ל" id="דמי ניהול">דמי הניהול</Term>.</span> <Term id="עמלות ברוקראז'">עמלות ברוקראז׳</Term> על כל קנייה ומכירה, <Term id="דמי ניהול פיקדון ניירות ערך">דמי משמרת</Term> ודמי ניהול של הקרנות שמחזיקים. אלה נגבים מהקופה, ומעבר לרשימה שבתקנות <Ruled id="IRA-16">אי אפשר לגבות דבר</Ruled>. התקרה לדמי הניהול של קופה אישית היא {cap ? <Num value={cap} /> : null} בשנה מהיתרה. <Ruled id="PF-06">אין בתקנות</Ruled> <Term id="דמי ניהול מהפקדה">דמי ניהול מהפקדה</Term>.
      </Callout>
    </>
    );
  },
  risks: ({ figure }) => {
    const issuer = figure("IRA-12", "single_issuer_cap");
    return (
      <>
        <p className="max-w-measure">הסיכון כולו שלכם: אין ועדת השקעות, ורשות שוק ההון כותבת שהגמישות <Ruled id="IRA-26">עלולה לחשוף לסיכוני השקעה גדולים יותר</Ruled>.</p>
        <Sentence measure>התקנות <Ruled id="IRA-12">מגבילות ריכוז</Ruled>: עד {issuer ? <Num value={issuer} /> : null} מהקופה בתאגיד אחד, לא כולל <Term id="תעודות סל">תעודות סל</Term>, <Term id="קרן חוץ">קרנות חוץ</Term> <Term prefix="ו" id="איגרות חוב ממשלתיות">איגרות חוב ממשלתיות</Term>. החברה המנהלת <Ruled id="IRA-13">לא נוטלת אשראי</Ruled>, ואין מסחר במינוף מעבר למגבלת הבטוחות. חריגה שלא תוקנה <Ruled id="IRA-14">חוסמת את החשבון</Ruled>.</Sentence>
        <p className="max-w-measure">נכסי הקופה <Ruled id="REG-18">מוחזקים בנאמנות</Ruled>, בנפרד מרכוש החברה המנהלת. אם היא קורסת, הניהול <Ruled id="REG-19">עובר לחברה אחרת</Ruled>. לא נמצא במקור מה קורה לניירות אם החברה או הברוקר קורסים.</p>
        <p className="max-w-measure">האתר מצא מקרה אחד: רשות שוק ההון מינתה <Term id="מנהל מורשה">מנהל מורשה</Term> לסלייס גמל, שמנהלת קופות אישיות, <Ruled id="IRA-28">אחרי כשלים שמצאה בביקורת</Ruled>.</p>
        <p className="max-w-measure">מס זר שנוכה על דיבידנדים בתוך הקופה <Ruled id="TXK-18">הוא עלות</Ruled>.</p>
      </>
    );
  },
  use: () => (
    <>
      <p className="max-w-measure">
        למי שכבר יש קרן השתלמות בסכום משמעותי, שיודע לבנות תיק בעצמו או עם <Term id="מנהל תיקים">מנהל תיקים</Term>, ורוצה לבחור ניירות ספציפיים, כמו <Term id="קרן סל">קרנות סל</Term> זרות, בלי לוותר על הפטור של קרן ההשתלמות. למי שמסתפק במסלול מנוהל, קרן רגילה פשוטה יותר. שם לא משלמים <Term id="עמלת קנייה ומכירה">עמלות מסחר</Term> על כל קנייה ומכירה: עלויות המסחר יורדות מהכסף שבקרן <Term prefix="כ" id="הוצאות ישירות">הוצאות ישירות</Term>. <Ruled id="PF-10">לא נמצאה</Ruled> להן תקרה כוללת, חוץ מתקרה <Term prefix="ל" id="עמלת ניהול חיצוני">עמלת ניהול חיצוני</Term>, שכל חברה <Ruled id="PF-11">קובעת לעצמה</Ruled>.
      </p>
      <p className="max-w-measure">
        בתקנות <Ruled id="IRA-10">אין סכום מינימום לפתיחה</Ruled>. חברה יכולה לומר מאיזה סכום המוצר מתאים לדעתה, אבל זו המלצה שלה, לא כלל.
      </p>
    </>
  ),
};
