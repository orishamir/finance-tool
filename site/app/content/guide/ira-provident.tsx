// Guide prose for קופת גמל בניהול אישי, the provident fund for tagmulim (architecture 3.5: prose lives in
// content files; every figure is a Num). Written 2026-10-23 from the rule base (IRA, PEN, TXP, TXK, PF, REG);
// each block ends with the rules it rests on. NEW copy for the founder to review (docs/copy.md holds only labels).
import type { GuideContent } from "./types";
import { IdRef, Num, RuleRef, RulesLine, Term, VariesByCompany } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";

export const content: GuideContent = {
  what: ({ figure }) => {
    const age = figure("PEN-26", "early_retirement_age");
    return (
      <>
        <p className="max-w-measure">
          <Term id="קופת גמל בניהול אישי">קופת גמל בניהול אישי</Term> לתגמולים: קופת גמל לקצבה שבה אתם, <Term prefix="ב" id="ניהול עצמי">ניהול עצמי</Term> או דרך <Term id="מנהל תיקים">מנהל תיקים</Term> שבחרתם, מחליטים במה להשקיע: ניירות ערך סחירים, קרנות, פיקדונות ומטבע חוץ, בישראל ובמדינות מאושרות.
        </p>
        <Sentence measure>
          נכנסים אליה רק סוגי כסף מסוימים: כספים הוניים, כסף במוצרים עוקבי מדד, או כסף של מי שכבר מקבל קצבה או צבר את <Term id="הסכום הקובע">הסכום הקובע</Term> בקופה לקצבה; קרן פנסיה אי אפשר לנהל אישית. היציאה היא של קופת גמל לקצבה: קצבה מגיל {age ? <Num value={age} /> : null}, דרך העברה לקרן פנסיה או לחברת ביטוח. בתוך הקופה קונים ומוכרים בלי מס.
        </Sentence>
        <RulesLine ids={["IRA-01", "IRA-02", "IRA-07", "IRA-11", "PEN-34", "PEN-26", "TXK-17"]} />
      </>
    );
  },
  who: () => (
    <>
      <p className="max-w-measure">
        <Term id="חברה מנהלת">חברות מנהלות</Term> של קופות גמל שאושרה להן קופה בניהול אישי, בפיקוח רשות שוק ההון, ביטוח וחיסכון. המסחר עצמו מתבצע דרך ברוקר שבוחרים מרשימה שהחברה קובעת <Term prefix="ב" id="הליך תחרותי">הליך תחרותי</Term>.
      </p>
      <p className="max-w-measure">
        <VariesByCompany ids={["IRA-21"]} lead="אילו ברוקרים ובאילו עמלות תלוי בחברה המנהלת" />
      </p>
      <RulesLine ids={["IRA-03", "IRA-18"]} />
    </>
  ),
  switchLine: "קנייה ומכירה בתוך הקופה בלי מס; מעבר לקופת גמל לקצבה רגילה או לקופה אישית אחרת, במזומן או בניירות",
  switchRules: ["PF-23", "IRA-23"],
  termIds: ["קופת גמל בניהול אישי", "ניהול עצמי", "מנהל תיקים", "הסכום הקובע", "חברה מנהלת", "הליך תחרותי", "עמלות ברוקראז'", "דמי משמרת", "דמי ניהול", "משיכה", "עמית", "ותק"],
  afterTax: ({ figure }) => {
    const rate = figure("TXP-18", "minimum_rate");
    const cap = figure("IRA-17", "balance_cap");
    return (
      <>
        <Callout tone="blocked" className="max-w-measure">
          <span className="font-medium">את המס ביציאה האתר לא מחשב.</span> הקצבה דורשת מקדמי המרה שלא נאספו, והקופה עצמה לא משלמת קצבה. שאלה פתוחה: <IdRef id="PEN OQ7" />. <Term id="משיכה">משיכה</Term> שלא כדין ממוסה ב־{rate ? <Num value={rate} /> : null} לפחות, על כל הסכום שמשולם <RuleRef id="TXP-18" />.
        </Callout>
        <Callout tone="caution" className="max-w-measure">
          <span className="font-medium">מה משלמים מעבר <Term prefix="ל" id="דמי ניהול">דמי הניהול</Term>.</span> <Term id="עמלות ברוקראז'">עמלות ברוקראז'</Term> על כל קנייה ומכירה, <Term id="דמי משמרת">דמי משמרת</Term> ודמי ניהול של הקרנות שמחזיקים נגבים מהקופה לפי תעריף הברוקר שבחרתם. התקרה לדמי הניהול של קופה אישית היא {cap ? <Num value={cap} /> : null} לשנה מהיתרה, ואין בתקנות דמי ניהול מהפקדה <RuleRef id="PF-06" />.
        </Callout>
        <RulesLine ids={["TXP-14", "TXP-18", "PEN-30", "IRA-16", "IRA-17", "PF-06"]} />
      </>
    );
  },
  risks: ({ figure }) => {
    const issuer = figure("IRA-12", "single_issuer_cap");
    return (
      <>
        <Sentence measure>הסיכון כולו שלכם: אין ועדת השקעות, והרגולטור עצמו כותב שהגמישות חושפת לסיכוני השקעה גדולים יותר. התקנות מגבילות ריכוז (עד {issuer ? <Num value={issuer} /> : null} מהקופה בתאגיד אחד) ואוסרות אשראי ומינוף; חריגה שלא תוקנה חוסמת את החשבון. אין כיסוי ביטוחי, שלא כמו בקרן פנסיה.</Sentence>
        <p className="max-w-measure">נכסי הקופה מוחזקים בנאמנות, בנפרד מרכוש החברה המנהלת, ואם היא קורסת הניהול עובר לחברה אחרת. מה קורה לניירות אם החברה או הברוקר קורסים לא נמצא במקור, ושני גופים שניהלו קופות אישיות כשלו בשנים האחרונות. טיוטת תקנות חדשה תצמצם את מי שיכול להיכנס ואת מה שמותר להחזיק.</p>
        <RulesLine ids={["IRA-26", "IRA-12", "IRA-13", "IRA-14", "IRA-02", "REG-18", "REG-19", "IRA-28", "IRA-27"]} />
      </>
    );
  },
  use: () => (
    <>
      <p className="max-w-measure">
        למי שיש כספי גמל הוניים או צבירה גדולה לקצבה, שרוצה לנהל אותם בעצמו עד הפרישה ויודע איך. לרוב החוסכים הצעירים הכסף לא עומד בתנאי הכניסה, וכספי פנסיה בכלל לא נכנסים. מי שמסתפק במסלול מנוהל נשאר בקופה רגילה, בלי עמלות מסחר.
      </p>
      <RulesLine ids={["IRA-07", "IRA-02", "IRA-10", "IRA-27"]} />
    </>
  ),
};

export { RuleRef };
