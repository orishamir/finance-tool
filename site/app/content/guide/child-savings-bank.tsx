// Guide prose for חיסכון לכל ילד at a bank (architecture 3.5: prose lives in content files; every figure is
// a Num). Written 2026-10-23 from the rule base (CS, TXK, REG); each block ends with the rules it rests on.
// NEW copy for the founder to review (docs/copy.md holds only labels).
import type { GuideContent } from "./types";
import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";

export const content: GuideContent = {
  what: ({ figure }) => {
    const monthly = figure("CS-03", "monthly_deposit");
    const until = figure("CS-14", "withdrawal_age");
    const parentUntil = figure("CS-14", "parent_signature_until_age");
    const grantLast = figure("CS-13", "grant_age_21");
    const ageLast = figure("CS-13", "age_last_grant");
    const months = figure("CS-06", "choice_months");
    const station = figure("CS-10", "exit_station_years");
    return (
      <>
        <Sentence measure>
          אותו <Term id="חיסכון לכל ילד">חיסכון לכל ילד</Term>, כשההורים בחרו בבנק במקום בקופת גמל. הביטוח הלאומי מפקיד {monthly ? <Num value={monthly} /> : null} בחודש עד גיל {until ? <Num value={until} /> : null} (<Term id="סכום החיסכון הבסיסי">סכום החיסכון הבסיסי</Term>), ואפשר להכפיל את הסכום מתוך קצבת הילדים (<Term id="סכום החיסכון הנוסף">סכום החיסכון הנוסף</Term>). בגילים קבועים מתווספים <Term id="מענק">מענקים</Term>, כולל {grantLast ? <Num value={grantLast} /> : null} בגיל {ageLast ? <Num value={ageLast} /> : null} למי שלא משך כלום קודם.
        </Sentence>
        <Sentence measure>
          הכסף פנוי כשהילד מגיע לגיל {until ? <Num value={until} /> : null}. לפני כן מושכים רק למימון צרכים רפואיים של הילד, כשמצב רפואי מסכן את חייו, גופו או נפשו ורופא מטעם הביטוח הלאומי אישר. עד גיל {parentUntil ? <Num value={parentUntil} /> : null} ההורה חותם על המשיכה, ואחר כך הילד מושך לבד. כסף שלא נמשך נשאר בבנק, ואי אפשר להוסיף אליו כסף חדש. העלות של שבירת תקופה נקבעת בהסכם של כל בנק.
        </Sentence>
        <Sentence measure>
          בבנק הכסף נכנס לתוכנית חיסכון באחד משלושה מסלולים: <Term id="ריבית קבועה לא צמודה">ריבית קבועה לא צמודה</Term>, <Term id="ריבית משתנה (פריים)">ריבית משתנה (פריים)</Term> או <Term id="ריבית קבועה צמודה">ריבית קבועה צמודה</Term> למדד. כל אחד מהם בא בלי <Term id="תחנת יציאה">תחנות יציאה</Term> עד גיל הפדיון, או עם תחנת יציאה כל {station ? <Num value={station} /> : null} שנים.
        </Sentence>
        <p className="max-w-measure">
          הריבית ידועה מראש לפי המסלול שנבחר. איך כל בנק קובע אותה כתוב בהסכם שלו.
        </p>
        <Sentence measure>
          את הבנק צריך לבחור בפועל בתוך {months ? <Num value={months} /> : null} חודשים מהלידה. בלי בחירה הכסף הולך לקופת גמל.
        </Sentence>
        <RulesLine ids={["CS-02", "CS-03", "CS-04", "CS-13", "CS-14", "CS-15", "CS-16", "CS-10", "CS-06", "CS-07"]} />
      </>
    );
  },
  who: ({ figure }) => {
    const banks = figure("CS-22", "bank_count");
    return (
      <>
        <Sentence measure>
          {banks ? <Num value={banks} /> : null} בנקים שזכו במכרז של משרד האוצר, בפיקוח בנק ישראל. את הבחירה עושים דרך הביטוח הלאומי, ואת המשיכה דרך הבנק.
        </Sentence>
        <RulesLine ids={["CS-22", "REG-23", "REG-01"]} />
      </>
    );
  },
  termIds: ["חיסכון לכל ילד", "סכום החיסכון הבסיסי", "סכום החיסכון הנוסף", "מענק", "ריבית קבועה לא צמודה", "ריבית משתנה (פריים)", "ריבית קבועה צמודה", "תחנת יציאה", "משיכה", "גיל הפדיון", "מס רווחי הון", "הגוף החוסך"],
  afterTax: ({ figure }) => {
    const niiRate = figure("TXK-20", "nii_circular_rate");
    return (
      <>
        <Callout tone="caution" className="max-w-measure">
          <span className="font-medium">שיעור המס <Term prefix="ב" id="משיכה">משיכה</Term> לא מופיע בשום טקסט של רשות המסים.</span> הביטוח הלאומי כותב בחוזר שלו שבמשיכה משלמים <Term id="מס רווחי הון">מס רווחי הון</Term>{niiRate ? <> בשיעור <Num value={niiRate} /> מהרווחים</> : null}, בלי להבחין בין המסלולים. לפי הכללים הרגילים לריבית מפיקדון, במסלולים שאינם צמודים למדד השיעור נמוך יותר, אבל זה היסק ולא נוסח רשמי. בחישוב משמשים שיעורים ממקור משני. שאלה פתוחה (<IdRef id="TXK OQ1" />).
        </Callout>
        <RulesLine ids={["TXK-20", "TXK-29", "TXK-23"]} />
      </>
    );
  },
  risks: () => (
    <>
      <p className="max-w-measure">הכסף שייך לילד ומוחזק בנאמנות של ההורה, ואי אפשר להעביר, לשעבד או לעקל אותו. הבנק מבטיח שבסוף התקופה הילד יקבל לפחות את הסכומים שהופקדו.</p>
      <p className="max-w-measure">זה פיקדון בבנק, ואין בישראל ביטוח פיקדונות. אם בנק קורס, הנגיד יכול, באישור הממשלה, להכריז על ערבות לפיקדונות, אבל לא חייב.</p>
      <p className="max-w-measure">ומה שנקבע בפתיחה נשאר: אי אפשר לעבור לבנק אחר, ומסלול משנים רק בתחנת יציאה.</p>
      <RulesLine ids={["CS-05", "CS-25", "REG-04", "REG-06", "CS-12"]} />
    </>
  ),
  use: () => (
    <>
      <p className="max-w-measure">
        למי שמעדיף ריבית ידועה מראש והבטחה שבסוף התקופה הילד יקבל לפחות את מה שהופקד, ומוכן לוותר על הגמישות של קופת גמל. את הבנק צריך לבחור בזמן, כי ברירת המחדל היא קופת גמל.
      </p>
      <p className="max-w-measure">
        מי שכבר בבנק ורוצה להחליף את <Term prefix="ה" id="הגוף החוסך">גוף החוסך</Term> יכול להפנות את ההפקדות הבאות לקופת גמל, פעם אחת. מה שנצבר נשאר בבנק.
      </p>
      <RulesLine ids={["CS-25", "CS-07", "CS-12"]} />
    </>
  ),
};

export { RuleRef };
