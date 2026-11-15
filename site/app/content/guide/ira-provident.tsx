// Guide prose for קופת גמל בניהול אישי, the provident fund for tagmulim (architecture 3.5: prose lives in
// content files; every figure is a Num). Written from the rule base (IRA, PEN, TXP, TXK, PF, REG); the words
// that state a rule open it (Ruled, D116), and a figure from a rule opens it from its sheet. NEW copy for the
// founder to review (docs/copy.md holds only labels).
import type { GuideContent } from "./types";
import { IdRef, Num, Ruled, Term, VariesByCompany } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";

export const content: GuideContent = {
  what: ({ figure }) => {
    const age = figure("PEN-26", "early_retirement_age");
    const rate = figure("TXP-18", "minimum_rate");
    const multiple = figure("IRA-07", "cap_multiple");
    return (
      <>
        <p className="max-w-measure">
          בחוק היא <Term id="תגמולים ואישית לפיצויים">קופת גמל לתגמולים</Term> או <Term prefix="ל" id="קצבה">קצבה</Term> של <Term id="עמית">עמית</Term> אחד, <Ruled id="IRA-01">שרשאי לתת הוראות להשקעת הכסף</Ruled>. <Ruled id="IRA-11">מותר להחזיק</Ruled> <Term id="נייר ערך">ניירות ערך</Term> סחירים, קרנות, <Term id="פיקדון">פיקדונות</Term> <Term prefix="ו" id="מטבע חוץ">מטבע חוץ</Term>, בישראל ובמדינות מאושרות.
        </p>
        <p className="max-w-measure">
          <Ruled id="IRA-07">נכנסים אליה רק סוגי כסף מסוימים</Ruled>: כספים הוניים שאפשר למשוך, כסף במוצרים עוקבי מדד, כסף בחשבון חדש, או כסף של מי שכבר מקבל קצבה בגובה הקצבה המזערית או צבר את <Term id="הסכום הקובע">הסכום הקובע</Term> בקופה לקצבה. לשלושת הסוגים האחרונים יש תקרה משותפת: פי {multiple ? <Num value={multiple} /> : null} מהסכום הקובע, על כל חשבונות הניהול האישי יחד, פחות הכספים ההוניים שכבר נכנסו. על הכספים ההוניים עצמם התקרה הזו לא חלה.
        </p>
        <p className="max-w-measure">
          <Term id="קרן פנסיה">קרן פנסיה</Term> עצמה <Ruled id="IRA-02">לא יכולה להיות בניהול אישי</Ruled>. לפי קריאה של האתר בתקנות, כסף מקרן פנסיה חדשה <Ruled id="SW-22">יכול לעבור במזומן לקופה בניהול אישי</Ruled> שאושרה <Term prefix="כ" id="קופת גמל לקצבה">קופת גמל לקצבה</Term>, רק בסוגי הכסף שהתקנות מתירות ועד התקרה. שום טקסט רשמי לא אומר זאת במשפט אחד. לקופה שאושרה לתגמולים אין מסלול כתוב. עוד לא נמצא אילו קופות אושרו כקופה לקצבה. שאלה פתוחה <IdRef id="IRA OQ16" end="." /> העברה כזו משפיעה על הכיסוי הביטוחי: על הסכום שהועבר <Term prefix="מ" id="מרכיב התגמולים">מרכיב התגמולים</Term> חלה <Term id="תקופת אכשרה">תקופת אכשרה</Term> חדשה לאירוע של מוות.
        </p>
        <Sentence measure>
          כסף לקצבה יוצא בסוף כמו מקופת גמל לקצבה: קצבה, <Ruled id="PEN-34">דרך העברה לקרן פנסיה או לחברת ביטוח</Ruled>. בקרן פנסיה <Ruled id="PEN-26">אפשר לקבל קצבה</Ruled> מגיל {age ? <Num value={age} /> : null}; מאיזה גיל בחברת ביטוח, האתר לא מצא בכללים שקרא. כספים הוניים שאפשר למשוך הם כסף שהופקד לשנות מס שלפני <bdi>2008</bdi>. הם יוצאים בסכום חד־פעמי, לא כקצבה, ורק כשהתקנות כבר מתירות למשוך אותם כך. אילו כספים בדיוק ומתי, שאלה פתוחה <IdRef id="IRA OQ9" end="." /> לפי קריאה של האתר בפקודת מס הכנסה, <Term id="משיכה">משיכה</Term> כדין של הכספים האלה <Ruled id="TXK-31">לא ממוסה</Ruled>. הקריאה הזו לא חלה על כסף שהמעסיק הפקיד מעל השיעורים שבחוק ולא שולם עליו מס בהפקדה, והמס עליו לא נבדק. כסף שהופקד משנת <bdi>2008</bdi> ואילך הוא כסף לקצבה: הוא יוצא כקצבה או <Term prefix="ב" id="היוון">היוון</Term> שלה. משיכה בסכום חד־פעמי שהכללים <Ruled id="TXP-18">לא מתירים</Ruled> ממוסה ב־{rate ? <Num value={rate} /> : null} לפחות, חוץ מחריגים. <Ruled id="TXK-17">בתוך הקופה קונים ומוכרים</Ruled> בלי <Term id="מס רווחי הון">מס רווחי הון</Term>.
        </Sentence>
      </>
    );
  },
  who: () => (
    <>
      <p className="max-w-measure">
        <Term id="חברה מנהלת">חברות מנהלות</Term> של <Term id="קופת גמל">קופות גמל</Term> שאושרה להן קופה בניהול אישי, בפיקוח <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון, ביטוח וחיסכון</Term>.
      </p>
      <p className="max-w-measure">
        המסחר עצמו נעשה דרך <Term id="ברוקר">ברוקר</Term>. החברה בוחרת ברוקרים <Term prefix="ב" id="הליך תחרותי">הליך תחרותי</Term>, ואפשר <Ruled id="IRA-18">לבחור גם ברוקר אחר</Ruled>, בתנאי שהוצגו לכם התנאים שהחברה סיכמה עם הזוכים.
      </p>
      <p className="max-w-measure">
        <VariesByCompany ids={["IRA-21"]} lead="אילו ברוקרים ובאילו עמלות תלוי בחברה המנהלת" />
      </p>
    </>
  ),
  switchLine: (
    <>
      קנייה ומכירה בתוך הקופה <Ruled id="TXK-17">בלי מס רווחי הון</Ruled>. אפשר גם לעבור לקופה אישית אחרת, <Ruled id="IRA-23">במזומן או בניירות</Ruled>, או לקופת גמל רגילה, בדרך שהקופה הקולטת בוחרת.
    </>
  ),
  termIds: ["קופת גמל בניהול אישי", "עמלת ניהול חיצוני", "היוון", "הוצאות ישירות", "מס רווחי הון", "קרן חוץ", "ניהול עצמי", "מנהל תיקים", "הסכום הקובע", "תקופת אכשרה", "חברה מנהלת", "הליך תחרותי", "עמלות ברוקראז'", "דמי ניהול פיקדון ניירות ערך", "דמי ניהול", "משיכה שלא כדין", "עמית", "ותק", "קרן פנסיה", "מטבע חוץ", "מנהל מורשה", "איגרות חוב ממשלתיות", "תעודות סל", "דמי ניהול מהפקדה", "מקדם המרה", "רשות שוק ההון ביטוח וחיסכון", "קופת גמל", "עמלת קנייה ומכירה", "מרכיב התגמולים", "קופת גמל לקצבה", "פיקדון", "נייר ערך", "קצבה", "תגמולים ואישית לפיצויים"],
  afterTax: ({ figure }) => {
    const rate = figure("TXP-18", "minimum_rate");
    const cap = figure("IRA-17", "balance_cap");
    return (
      <>
        <Callout tone="blocked" className="max-w-measure">
          <span className="font-medium">את המס ביציאה האתר לא מחשב.</span> הקצבה דורשת <Term id="מקדם המרה">מקדמי המרה</Term> שלא נאספו, והקופה עצמה לא משלמת קצבה. שאלה פתוחה <IdRef id="PEN OQ7" end="." /> מי שמושך כסף לקצבה בסכום אחד <Ruled id="PEN-30">כשהכללים לא מתירים</Ruled>, מה שהחוק קורא לו <Term id="משיכה שלא כדין">משיכה שלא כדין</Term>, משלם {rate ? <Num value={rate} /> : null} לפחות <Ruled id="TXP-18">על כל הסכום שמשולם</Ruled>, חוץ מחריגים. משיכה של כספים הוניים כשהתקנות מתירות אותה היא <Ruled id="TXK-31">לא משיכה שלא כדין</Ruled>.
        </Callout>
        <Callout tone="caution" className="max-w-measure">
          <span className="font-medium">מה משלמים מעבר <Term prefix="ל" id="דמי ניהול">דמי הניהול</Term>.</span> <Term id="עמלות ברוקראז'">עמלות ברוקראז׳</Term> על כל קנייה ומכירה, <Term id="דמי ניהול פיקדון ניירות ערך">דמי משמרת</Term> ודמי ניהול של הקרנות שמחזיקים. אלה נגבים מהקופה, ומעבר לרשימה שבתקנות <Ruled id="IRA-16">אי אפשר לגבות דבר</Ruled>. התקרה לדמי הניהול של קופה אישית היא {cap ? <Num value={cap} /> : null} בשנה מהיתרה, <Ruled id={["PF-06", "IRA-17"]} prefix="ו">אין בתקנות</Ruled> <Term id="דמי ניהול מהפקדה">דמי ניהול מהפקדה</Term>.
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
        <p className="max-w-measure">נכסי הקופה <Ruled id="REG-18">מוחזקים בנאמנות</Ruled>, בנפרד מרכוש החברה המנהלת, ואם היא קורסת, הניהול <Ruled id="REG-19">עובר לחברה אחרת</Ruled>. מה קורה לניירות אם החברה או הברוקר קורסים, לא נמצא במקור.</p>
        <p className="max-w-measure">האתר מצא מקרה אחד: רשות שוק ההון מינתה <Term id="מנהל מורשה">מנהל מורשה</Term> לסלייס גמל, שמנהלת קופות אישיות, <Ruled id="IRA-28">אחרי כשלים שמצאה בביקורת</Ruled>.</p>
        <p className="max-w-measure">טיוטת תקנות חדשה <Ruled id="IRA-27">תצמצם את מי שיכול להיכנס ואת מה שמותר להחזיק</Ruled>. זו טיוטה, ולא נמצא אם היא נחתמה.</p>
      </>
    );
  },
  use: () => (
    <>
      <p className="max-w-measure">
        למי שיש <Ruled id={["IRA-07", "IRA-02"]}>כספי גמל הוניים או צבירה גדולה לקצבה</Ruled>, ורוצה לנהל אותם בעצמו עד הפרישה ויודע איך. מי שמסתפק במסלול מנוהל נשאר בקופה רגילה. שם לא משלמים <Term id="עמלת קנייה ומכירה">עמלות מסחר</Term> על כל קנייה ומכירה: עלויות המסחר יורדות מהכסף שבקופה <Term prefix="כ" id="הוצאות ישירות">הוצאות ישירות</Term>, <Ruled id="PF-10" prefix="ו">לא נמצאה</Ruled> להן תקרה כוללת, חוץ מתקרה <Term prefix="ל" id="עמלת ניהול חיצוני">עמלת ניהול חיצוני</Term>, שכל חברה <Ruled id="PF-11">קובעת לעצמה</Ruled>.
      </p>
    </>
  ),
};
