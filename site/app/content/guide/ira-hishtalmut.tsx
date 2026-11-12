// Guide prose for קרן השתלמות בניהול אישי (architecture 3.5: prose lives in content files; every figure is a
// Num). Written from the rule base (IRA, KH, TXH, TXK, PF, REG); each block ends with the rules it
// rests on. NEW copy for the founder to review (docs/copy.md holds only labels).
import type { GuideContent } from "./types";
import { Num, RuleRef, RulesLine, Term, VariesByCompany } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";

export const content: GuideContent = {
  what: ({ figure }) => {
    const years = figure("TXH-09", "lock_years");
    const short = figure("TXH-10", "lock_years");
    return (
      <>
        <p className="max-w-measure">
          בתקנות היא <Term id="קופת גמל בניהול אישי">קופת גמל בניהול אישי</Term>. מותר להחזיק <Term id="נייר ערך">ניירות ערך</Term> סחירים, קרנות, <Term id="פיקדון">פיקדונות</Term> <Term prefix="ו" id="מטבע חוץ">מטבע חוץ</Term>, בישראל ובמדינות מאושרות, בלי ועדת השקעות של החברה.
        </p>
        <Sentence measure>
          כללי מס ההכנסה והנזילות הם של <Term id="קרן השתלמות">קרן השתלמות</Term> רגילה. אחרי {years ? <Num value={years} /> : null} שנים מהתשלום הראשון מושכים בפטור ממס הכנסה על הרווחים מההפקדות המוטבות, ואחרי {short ? <Num value={short} /> : null} שנים <Term prefix="ב" id="גיל פרישה">גיל פרישה</Term> או לצורך השתלמות. <Term prefix="ה" id="ותק">וותק</Term> של קרן שמעבירים נשמר. בתוך הקופה קונים ומוכרים בלי <Term id="מס רווחי הון">מס רווחי הון</Term>.
        </Sentence>
        <p className="max-w-measure">
          הכסף שאפשר להכניס מוגבל: עד פי ארבעה מ<Term id="הסכום הקובע">הסכום הקובע</Term>, על כל חשבונות ההשתלמות יחד.
        </p>
        <RulesLine ids={["IRA-01", "IRA-05", "IRA-07", "IRA-11", "TXH-09", "TXH-10", "IRA-23", "TXK-17"]} />
      </>
    );
  },
  who: () => (
    <>
      <p className="max-w-measure">
        <Term id="חברה מנהלת">חברות מנהלות</Term> של <Term id="קופת גמל">קופות גמל</Term> שאושרה להן קרן בניהול אישי, בפיקוח <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון, ביטוח וחיסכון</Term>.
      </p>
      <p className="max-w-measure">
        המסחר עצמו נעשה דרך <Term id="ברוקר">ברוקר</Term>. החברה בוחרת ברוקרים <Term prefix="ב" id="הליך תחרותי">הליך תחרותי</Term>, ואפשר לבחור גם ברוקר אחר, בתנאי שהוצגו לכם התנאים שהחברה סיכמה עם הזוכים.
      </p>
      <p className="max-w-measure">
        <VariesByCompany ids={["IRA-21"]} lead="אילו ברוקרים ובאילו עמלות תלוי בחברה המנהלת" />
      </p>
      <RulesLine ids={["IRA-03", "IRA-18"]} />
    </>
  ),
  switchLine: "קנייה ומכירה בתוך הקופה בלי מס רווחי הון. אפשר גם לעבור לקרן השתלמות אחרת או לקופה אישית אחרת, במזומן או בניירות.",
  switchRules: ["TXH-17", "IRA-23", "KH-17"],
  termIds: ["קופת גמל בניהול אישי", "מס רווחי הון", "קרן חוץ", "ניהול עצמי", "מנהל תיקים", "ותק", "חברה מנהלת", "הליך תחרותי", "עמלות ברוקראז'", "דמי ניהול פיקדון ניירות ערך", "דמי ניהול", "הסכום הקובע", "משיכה", "עמית", "מטבע חוץ", "מנהל מורשה", "איגרות חוב ממשלתיות", "תעודות סל", "דמי ניהול מהפקדה", "רשות שוק ההון ביטוח וחיסכון", "קופת גמל", "עמלת קנייה ומכירה", "קרן סל", "גיל פרישה", "פיקדון", "נייר ערך", "קרן השתלמות"],
  afterTax: ({ figure }) => {
    const cap = figure("IRA-17", "balance_cap");
    return (
    <>
      <Callout tone="caution" className="max-w-measure">
        <span className="font-medium">מה משלמים מעבר <Term prefix="ל" id="דמי ניהול">דמי הניהול</Term>.</span> <Term id="עמלות ברוקראז'">עמלות ברוקראז׳</Term> על כל קנייה ומכירה, <Term id="דמי ניהול פיקדון ניירות ערך">דמי משמרת</Term> ודמי ניהול של הקרנות שמחזיקים. אלה נגבים מהקופה, ומעבר לרשימה שבתקנות אי אפשר לגבות דבר. התקרה לדמי הניהול של קופה אישית היא {cap ? <Num value={cap} /> : null} בשנה מהיתרה, ואין בתקנות <Term id="דמי ניהול מהפקדה">דמי ניהול מהפקדה</Term> <RuleRef id="PF-06" end="." />
      </Callout>
      <RulesLine ids={["IRA-16", "IRA-17", "PF-06"]} />
    </>
    );
  },
  risks: ({ figure }) => {
    const issuer = figure("IRA-12", "single_issuer_cap");
    return (
      <>
        <p className="max-w-measure">הסיכון כולו שלכם: אין ועדת השקעות, ורשות שוק ההון כותבת שהגמישות עלולה לחשוף לסיכוני השקעה גדולים יותר.</p>
        <Sentence measure>התקנות מגבילות ריכוז: עד {issuer ? <Num value={issuer} /> : null} מהקופה בתאגיד אחד, לא כולל <Term id="תעודות סל">תעודות סל</Term>, <Term id="קרן חוץ">קרנות חוץ</Term> <Term prefix="ו" id="איגרות חוב ממשלתיות">איגרות חוב ממשלתיות</Term>. החברה המנהלת לא נוטלת אשראי, ואין מסחר במינוף מעבר למגבלת הבטוחות. חריגה שלא תוקנה חוסמת את החשבון.</Sentence>
        <p className="max-w-measure">נכסי הקופה מוחזקים בנאמנות, בנפרד מרכוש החברה המנהלת, ואם היא קורסת, הניהול עובר לחברה אחרת. מה קורה לניירות אם החברה או הברוקר קורסים, לא נמצא במקור.</p>
        <p className="max-w-measure">היו אירועים: רשות שוק ההון מינתה <Term id="מנהל מורשה">מנהל מורשה</Term> לחברה אחת שניהלה קופות אישיות, אחרי כשלים שמצאה בביקורת. נגד חברה אחרת, לפי העיתונות, הוגשה בקשה לתובענה ייצוגית, ובה טענות בלבד.</p>
        <p className="max-w-measure">מס זר שנוכה על דיבידנדים בתוך הקופה הוא עלות.</p>
        <RulesLine ids={["IRA-26", "IRA-12", "IRA-13", "IRA-14", "REG-18", "REG-19", "IRA-28", "TXK-18"]} />
      </>
    );
  },
  use: () => (
    <>
      <p className="max-w-measure">
        למי שכבר יש קרן השתלמות בסכום משמעותי, שיודע לבנות תיק בעצמו או עם <Term id="מנהל תיקים">מנהל תיקים</Term>, ורוצה לבחור ניירות ספציפיים, כמו <Term id="קרן סל">קרנות סל</Term> זרות, בלי לוותר על הפטור של קרן ההשתלמות. למי שמסתפק במסלול מנוהל, קרן רגילה פשוטה יותר ובלי <Term id="עמלת קנייה ומכירה">עמלות מסחר</Term>.
      </p>
      <p className="max-w-measure">
        בתקנות אין סכום מינימום לפתיחה. חברה יכולה לומר מאיזה סכום המוצר מתאים לדעתה, אבל זו המלצה שלה, לא כלל.
      </p>
      <RulesLine ids={["IRA-10", "IRA-16", "IRA-07"]} />
    </>
  ),
};

export { RuleRef };
