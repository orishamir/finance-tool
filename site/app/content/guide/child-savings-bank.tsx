// Guide prose for חיסכון לכל ילד at a bank (architecture 3.5: prose lives in content files; every figure is
// a Num). Written 2026-10-23 from the rule base (CS, TXK, REG); each block ends with the rules it rests on.
// NEW copy for the founder to review (docs/copy.md holds only labels).
import type { GuideContent } from "./types";
import { Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout } from "../../components/ui";

export const content: GuideContent = {
  what: ({ figure }) => {
    const monthly = figure("CS-03", "monthly_deposit");
    const until = figure("CS-14", "withdrawal_age");
    const grantLast = figure("CS-13", "grant_age_21");
    const ageLast = figure("CS-13", "age_last_grant");
    const months = figure("CS-06", "choice_months");
    const station = figure("CS-10", "exit_station_years");
    return (
      <>
        <p className="max-w-measure">
          אותו <Term id="חיסכון לכל ילד">חיסכון לכל ילד</Term>, כשההורים בחרו בנק במקום קופת גמל: הביטוח הלאומי מפקיד {monthly ? <Num value={monthly} /> : null} בחודש עד גיל {until ? <Num value={until} /> : null} (<Term id="סכום החיסכון הבסיסי">סכום החיסכון הבסיסי</Term>), אתם יכולים להכפיל מתוך קצבת הילדים (<Term id="סכום החיסכון הנוסף">סכום החיסכון הנוסף</Term>), <Term prefix="וה" id="מענק">מענקים</Term> מתווספים באותם גילים, כולל {grantLast ? <Num value={grantLast} /> : null} בגיל {ageLast ? <Num value={ageLast} /> : null} למי שלא משך קודם.
        </p>
        <p className="max-w-measure">
          בבנק הכסף נכנס לתכנית חיסכון באחד משלושה מסלולים: <Term id="ריבית קבועה לא צמודה">ריבית קבועה לא צמודה</Term>, <Term id="ריבית משתנה (פריים)">ריבית משתנה (פריים)</Term> או <Term id="ריבית קבועה צמודה">ריבית קבועה צמודה</Term> למדד; כל אחד בלי <Term id="תחנת יציאה">תחנות יציאה</Term> עד גיל הפדיון, או עם תחנת יציאה כל {station ? <Num value={station} /> : null} שנים. הריבית נקבעת ביום הפתיחה לכל התקופה. את הבנק צריך לבחור בפועל בתוך {months ? <Num value={months} /> : null} חודשים מהלידה; בלי בחירה הכסף הולך לקופת גמל.
        </p>
        <RulesLine ids={["CS-02", "CS-03", "CS-04", "CS-13", "CS-10", "CS-06", "CS-07"]} />
      </>
    );
  },
  who: ({ figure }) => {
    const banks = figure("CS-22", "bank_count");
    return (
      <>
        <p className="max-w-measure">
          {banks ? <Num value={banks} /> : null} בנקים שזכו במכרז של משרד האוצר, בפיקוח בנק ישראל. את הבחירה עושים דרך הביטוח הלאומי; את המשיכה דרך הבנק.
        </p>
        <RulesLine ids={["CS-22", "REG-23", "REG-01"]} />
      </>
    );
  },
  switchLine: "רק בתחנת יציאה, ורק אם נבחר מסלול עם תחנות; לבנק אחר אי אפשר. האם יש מס במעבר לא נאמר במקור רשמי",
  switchRules: ["CS-12", "CS-10", "TXK-22"],
  termIds: ["חיסכון לכל ילד", "סכום החיסכון הבסיסי", "סכום החיסכון הנוסף", "מענק", "ריבית קבועה לא צמודה", "ריבית משתנה (פריים)", "ריבית קבועה צמודה", "תחנת יציאה", "משיכה", "גיל הפדיון", "מס רווחי הון", "הגוף החוסך"],
  afterTax: () => (
    <>
      <Callout tone="caution" className="max-w-measure">
        <span className="font-medium">שיעור המס <Term prefix="ב" id="משיכה">משיכה</Term> מגיע ממקור משני.</span> הביטוח הלאומי אומר רק שבמשיכה משלמים <Term id="מס רווחי הון">מס רווחי הון</Term>, בלי שיעור ובלי להבחין בין מסלול צמוד למסלול לא צמוד. שאלה פתוחה: <bdi dir="ltr" className="whitespace-nowrap">TXK OQ1</bdi>.
      </Callout>
      <RulesLine ids={["TXK-20", "TXK-23"]} />
    </>
  ),
  risks: () => (
    <>
      <p className="max-w-measure">הכסף שייך לילד, מוחזק בנאמנות של ההורה, ואי אפשר להעביר, לשעבד או לעקל אותו. הבנק מתחייב שהיתרה לא תרד מהסכומים שהביטוח הלאומי הפקיד, במונחים נומינליים, והריבית ידועה מראש.</p>
      <p className="max-w-measure">זה פיקדון בבנק: אין בישראל ביטוח פיקדונות. אם בנק קורס, הנגיד רשאי, באישור הממשלה, להכריז על ערבות לפיקדונות, אבל לא חייב. ומה שנקבע בפתיחה נשאר: אי אפשר לעבור לבנק אחר, ומסלול משנים רק בתחנת יציאה.</p>
      <RulesLine ids={["CS-05", "CS-25", "REG-04", "REG-06", "CS-12"]} />
    </>
  ),
  use: () => (
    <>
      <p className="max-w-measure">
        למי שמעדיף ריבית ידועה מראש והבטחה שהקרן לא תרד, ומוכן לוותר על הגמישות של קופת גמל. הבחירה בבנק חייבת להיעשות בזמן, כי ברירת המחדל היא קופה. מי שכבר בבנק ורוצה להעביר את <Term prefix="ה" id="הגוף החוסך">גוף החוסך</Term> יכול להפנות את ההפקדות הבאות לקופת גמל, פעם אחת; מה שנצבר נשאר בבנק.
      </p>
      <RulesLine ids={["CS-25", "CS-07", "CS-12"]} />
    </>
  ),
};

export { RuleRef };
