// Guide prose for חיסכון לכל ילד in a provident fund (architecture 3.5: prose lives in content files; every
// figure is a Num). Written 2026-10-23 from the rule base (CS, TXK, REG); each block ends with the rules it
// rests on. NEW copy for the founder to review (docs/copy.md holds only labels).
import type { GuideContent } from "./types";
import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";

export const content: GuideContent = {
  what: ({ figure }) => {
    const monthly = figure("CS-03", "monthly_deposit");
    const until = figure("CS-14", "withdrawal_age");
    const grantYoung = figure("CS-13", "grant_age_3");
    const ageFirst = figure("CS-13", "age_first_grant");
    const grantLast = figure("CS-13", "grant_age_21");
    const ageLast = figure("CS-13", "age_last_grant");
    const months = figure("CS-06", "choice_months");
    return (
      <>
        <Sentence measure>
          <Term id="חיסכון לכל ילד">חיסכון</Term> שהביטוח הלאומי פותח לכל ילד שמשולמת עבורו קצבת ילדים. בכל חודש מופקדים {monthly ? <Num value={monthly} /> : null} עד גיל {until ? <Num value={until} /> : null} (<Term id="סכום החיסכון הבסיסי">סכום החיסכון הבסיסי</Term>), ואתם יכולים להורות להכפיל אותם מתוך קצבת הילדים (
          <Term id="סכום החיסכון הנוסף">סכום החיסכון הנוסף</Term>). כסף אחר אי אפשר להפקיד.
        </Sentence>
        <Sentence measure>
          בגילים קבועים הביטוח הלאומי מוסיף <Term id="מענק">מענקים</Term>: לילדים שנולדו מאז תחילת התכנית {grantYoung ? <Num value={grantYoung} /> : null} בגיל {ageFirst ? <Num value={ageFirst} /> : null} ושוב בגיל בר או בת מצווה, ולילדים שנולדו לפני כן מענק אחד בגיל הפדיון. לכולם {grantLast ? <Num value={grantLast} /> : null} בגיל {ageLast ? <Num value={ageLast} /> : null}, רק אם לא משכו קודם.
        </Sentence>
        <Sentence measure>
          במסלול הזה הכסף מנוהל בקופת גמל ייעודית, <Term prefix="ב" id="מסלול השקעה">מסלול השקעה</Term> שבוחרים מתוך הרשימה של הקופה. אם לא בוחרים בתוך {months ? <Num value={months} /> : null} חודשים מהלידה, הכסף נכנס לקופת גמל <Term prefix="ב" id="מסלול ברירת מחדל">מסלול ברירת המחדל</Term>: <Term id="חוסכים המעדיפים סיכון מוגבר">חוסכים המעדיפים סיכון מוגבר</Term>, או הקופה והמסלול של אח גדול.
        </Sentence>
        <RulesLine ids={["CS-02", "CS-03", "CS-04", "CS-13", "CS-06", "CS-07", "CS-08"]} />
      </>
    );
  },
  who: () => (
    <>
      <p className="max-w-measure">
        <Term id="חברה מנהלת">חברות מנהלות</Term> של קופות גמל שזכו במכרז של משרד האוצר ומופיעות ברשימה של הביטוח הלאומי, בפיקוח רשות שוק ההון, ביטוח וחיסכון. את הבחירה הראשונה עושים דרך הביטוח הלאומי; מעבר בין קופות ומסלולים דרך הקופה הקולטת.
      </p>
      <RulesLine ids={["CS-08", "CS-06", "CS-11", "REG-23"]} />
    </>
  ),
  switchLine: "בכל עת: מסלול אחר, או קופה אחרת מהרשימה; לא לבנק. האם יש מס במעבר לא נאמר במקור רשמי",
  switchRules: ["CS-11", "TXK-22"],
  termIds: ["חיסכון לכל ילד", "סכום החיסכון הבסיסי", "סכום החיסכון הנוסף", "מענק", "מסלול השקעה", "מסלול ברירת מחדל", "חוסכים המעדיפים סיכון מוגבר", "חברה מנהלת", "משיכה", "גיל הפדיון", "קצבה", "דמי ניהול", "מס רווחי הון"],
  afterTax: () => (
    <>
      <Callout tone="caution" className="max-w-measure">
        <span className="font-medium">שיעור המס <Term prefix="ב" id="משיכה">משיכה</Term> מגיע ממקור משני.</span> הביטוח הלאומי אומר רק שבמשיכה משלמים <Term id="מס רווחי הון">מס רווחי הון</Term>, בלי שיעור; החוק מתייחס לקופת גמל להשקעה בלי לנקוב בחיסכון לכל ילד. שאלה פתוחה: <IdRef id="TXK OQ1" />.
      </Callout>
      <Callout tone="blocked" className="max-w-measure">
        <span className="font-medium">הביטוח הלאומי מתאר גם מסלול <Term id="קצבה">קצבה</Term>:</span> להשאיר את הכסף בקופה עד הפרישה ולקבל אותו כקצבה בלי מס. הבסיס לכך בחוק לא נמצא, והאתר לא מחשב אותו.
      </Callout>
      <RulesLine ids={["TXK-20", "TXK-23", "TXK-25"]} />
    </>
  ),
  risks: () => (
    <>
      <p className="max-w-measure">הכסף שייך לילד, מוחזק בנאמנות של ההורה שמקבל את הקצבה, ואי אפשר להעביר, לשעבד או לעקל אותו. נכסי הקופה מופרדים מרכוש החברה המנהלת; אם היא קורסת, הניהול עובר לחברה אחרת.</p>
      <p className="max-w-measure">אין הבטחת קרן: השווי עולה ויורד עם המסלול. כל קופה מציעה שלושה מסלולי סיכון, ומסלול ברירת המחדל לילד שמצטרף היום הוא מסלול הסיכון המוגבר; כמה מכל מסלול מושקע במניות קובעת החברה המנהלת, באישור הממונה. מי שרוצה שהקרן לא תרד בוחר בבנק.</p>
      <RulesLine ids={["CS-05", "REG-18", "REG-19", "CS-26", "CS-25"]} />
    </>
  ),
  use: ({ figure }) => {
    const after21 = figure("CS-30", "fee_after_21");
    const balanceCap = figure("CS-18", "balance_cap_after_21");
    const depositCap = figure("CS-18", "deposit_cap_after_21");
    return (
    <>
      <p className="max-w-measure">
        חיסכון שנפתח ממילא, ומי שלא צריך את הכסף עד שהילד מתבגר מרוויח ממנו פעמיים: הביטוח הלאומי משלם את <Term id="דמי ניהול">דמי הניהול</Term> עד גיל עשרים ואחת, והמענק האחרון ניתן רק למי שמחכה. אחרי גיל עשרים ואחת דמי הניהול יורדים מהחיסכון. כל חברה קובעת שיעור משלה, עד התקרה שבחוק{balanceCap ? <>: עד <Num value={balanceCap} /> בשנה מהיתרה</> : null}{depositCap ? <> ועד <Num value={depositCap} /> מכל הפקדה</> : null}. בהראל ובאלטשולר שחם, לדוגמה, {after21 ? <Num value={after21} /> : null} בשנה מהיתרה בלבד; בשאר החברות זה לא נבדק. ההחלטות שלכם הן שתיים: האם להכפיל את ההפקדה מקצבת הילדים, ובאיזו רמת סיכון. בלי בחירה הכסף הולך למסלול הסיכון המוגבר.
      </p>
      <RulesLine ids={["CS-04", "CS-18", "CS-30", "CS-13", "CS-07"]} />
    </>
    );
  },
};

export { RuleRef };
