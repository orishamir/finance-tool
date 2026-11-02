// Guide prose for קופת גמל בניהול אישי, the provident fund for tagmulim (architecture 3.5: prose lives in
// content files; every figure is a Num). Written 2026-10-23 from the rule base (IRA, PEN, TXP, TXK, PF, REG);
// each block ends with the rules it rests on. NEW copy for the founder to review (docs/copy.md holds only labels).
import type { GuideContent } from "./types";
import { IdRef, Num, RuleRef, RulesLine, Term, VariesByCompany } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";
import { OpenLossOffset } from "./open-tax";

export const content: GuideContent = {
  what: ({ figure }) => {
    const age = figure("PEN-26", "early_retirement_age");
    return (
      <>
        <p className="max-w-measure">
          <Term id="קופת גמל בניהול אישי">קופת גמל בניהול אישי</Term> לתגמולים: קופת גמל לקצבה שבה אתם מחליטים במה להשקיע, <Term prefix="ב" id="ניהול עצמי">ניהול עצמי</Term> או דרך <Term id="מנהל תיקים">מנהל תיקים</Term> שבחרתם. מותר להחזיק ניירות ערך סחירים, קרנות, פיקדונות ומטבע חוץ, בישראל ובמדינות מאושרות.
        </p>
        <p className="max-w-measure">
          נכנסים אליה רק סוגי כסף מסוימים: כספים הוניים שאפשר למשוך, כסף במוצרים עוקבי מדד, כסף בחשבון חדש, או כסף של מי שכבר מקבל קצבה בגובה הקצבה המזערית או צבר את <Term id="הסכום הקובע">הסכום הקובע</Term> בקופה לקצבה. הכול עד פי ארבעה מהסכום הקובע, על כל חשבונות הניהול האישי יחד.
        </p>
        <p className="max-w-measure">
          קרן פנסיה עצמה אי אפשר לנהל אישית. כסף שיוצא מקרן פנסיה משפיע על הכיסוי הביטוחי: על הסכום שהועבר חלה <Term id="תקופת אכשרה">תקופת אכשרה</Term> חדשה לאירוע של מוות.
        </p>
        <Sentence measure>
          בסוף הכסף יוצא כמו מקופת גמל לקצבה: קצבה מגיל {age ? <Num value={age} /> : null}, דרך העברה לקרן פנסיה או לחברת ביטוח. בתוך הקופה קונים ומוכרים בלי מס.
        </Sentence>
        <RulesLine ids={["IRA-01", "IRA-02", "IRA-07", "IRA-11", "PEN-34", "PEN-26", "TXK-17"]} />
      </>
    );
  },
  who: () => (
    <>
      <p className="max-w-measure">
        <Term id="חברה מנהלת">חברות מנהלות</Term> של קופות גמל שאושרה להן קופה בניהול אישי, בפיקוח רשות שוק ההון, ביטוח וחיסכון.
      </p>
      <p className="max-w-measure">
        המסחר עצמו נעשה דרך ברוקר. החברה בוחרת ברוקרים <Term prefix="ב" id="הליך תחרותי">הליך תחרותי</Term>, ואפשר לבחור גם ברוקר אחר, בתנאי שהוצגו לכם התנאים שהחברה סיכמה עם הזוכים.
      </p>
      <p className="max-w-measure">
        <VariesByCompany ids={["IRA-21"]} lead="אילו ברוקרים ובאילו עמלות תלוי בחברה המנהלת" />
      </p>
      <RulesLine ids={["IRA-03", "IRA-18"]} />
    </>
  ),
  switchLine: "קנייה ומכירה בתוך הקופה בלי מס. אפשר גם לעבור לקופת גמל לקצבה רגילה או לקופה אישית אחרת, במזומן או בניירות",
  switchRules: ["PF-23", "IRA-23"],
  termIds: ["קופת גמל בניהול אישי", "ניהול עצמי", "מנהל תיקים", "הסכום הקובע", "תקופת אכשרה", "חברה מנהלת", "הליך תחרותי", "עמלות ברוקראז'", "דמי משמרת", "דמי ניהול", "משיכה שלא כדין", "עמית", "ותק"],
  afterTax: ({ figure }) => {
    const rate = figure("TXP-18", "minimum_rate");
    const cap = figure("IRA-17", "balance_cap");
    return (
      <>
        <Callout tone="blocked" className="max-w-measure">
          <span className="font-medium">את המס ביציאה האתר לא מחשב.</span> הקצבה דורשת מקדמי המרה שלא נאספו, והקופה עצמה לא משלמת קצבה. שאלה פתוחה (<IdRef id="PEN OQ7" />). מי שמושך את הכסף במקום לקבל קצבה, מה שהחוק קורא לו <Term id="משיכה שלא כדין">משיכה שלא כדין</Term>, משלם {rate ? <Num value={rate} /> : null} לפחות על כל הסכום שמשולם, חוץ מחריגים <RuleRef id="TXP-18" />.
        </Callout>
        <Callout tone="caution" className="max-w-measure">
          <span className="font-medium">מה משלמים מעבר <Term prefix="ל" id="דמי ניהול">דמי הניהול</Term>.</span> <Term id="עמלות ברוקראז'">עמלות ברוקראז׳</Term> על כל קנייה ומכירה, <Term id="דמי משמרת">דמי משמרת</Term> ודמי ניהול של הקרנות שמחזיקים. אלה נגבים מהקופה, ומעבר לרשימה שבתקנות אי אפשר לגבות דבר. התקרה לדמי הניהול של קופה אישית היא {cap ? <Num value={cap} /> : null} בשנה מהיתרה, ואין בתקנות דמי ניהול מהפקדה <RuleRef id="PF-06" />.
        </Callout>
        <RulesLine ids={["TXP-14", "TXP-18", "PEN-30", "IRA-16", "IRA-17", "PF-06"]} />
        <OpenLossOffset />
      </>
    );
  },
  risks: ({ figure }) => {
    const issuer = figure("IRA-12", "single_issuer_cap");
    return (
      <>
        <p className="max-w-measure">הסיכון כולו שלכם: אין ועדת השקעות, ורשות שוק ההון כותבת שהגמישות עלולה לחשוף לסיכוני השקעה גדולים יותר. ואם יש כיסוי ביטוחי, הוא תלוי בחברה המנהלת, שלא כמו בקרן פנסיה.</p>
        <Sentence measure>התקנות מגבילות ריכוז: עד {issuer ? <Num value={issuer} /> : null} מהקופה בתאגיד אחד, לא כולל תעודות סל, קרנות חוץ ואיגרות חוב ממשלתיות. החברה המנהלת לא נוטלת אשראי, ואין מסחר במינוף מעבר למגבלת הבטוחות. חריגה שלא תוקנה חוסמת את החשבון.</Sentence>
        <p className="max-w-measure">נכסי הקופה מוחזקים בנאמנות, בנפרד מרכוש החברה המנהלת, ואם היא קורסת, הניהול עובר לחברה אחרת. מה קורה לניירות אם החברה או הברוקר קורסים, לא נמצא במקור.</p>
        <p className="max-w-measure">היו אירועים: רשות שוק ההון מינתה מנהל מורשה לחברה אחת שניהלה קופות אישיות, אחרי כשלים שמצאה בביקורת. נגד חברה אחרת, לפי העיתונות, הוגשה בקשה לתובענה ייצוגית, ובה טענות בלבד.</p>
        <p className="max-w-measure">טיוטת תקנות חדשה תצמצם את מי שיכול להיכנס ואת מה שמותר להחזיק. זו טיוטה, ולא נמצא אם היא נחתמה.</p>
        <RulesLine ids={["IRA-26", "IRA-12", "IRA-13", "IRA-14", "IRA-02", "REG-18", "REG-19", "IRA-28", "IRA-27"]} />
      </>
    );
  },
  use: () => (
    <>
      <p className="max-w-measure">
        למי שיש כספי גמל הוניים או צבירה גדולה לקצבה, ורוצה לנהל אותם בעצמו עד הפרישה ויודע איך. מי שמסתפק במסלול מנוהל נשאר בקופה רגילה, בלי עמלות מסחר.
      </p>
      <RulesLine ids={["IRA-07", "IRA-02", "IRA-10", "IRA-27"]} />
    </>
  ),
};

export { RuleRef };
