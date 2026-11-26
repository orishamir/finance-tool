// Guide prose for חיסכון לכל ילד at a bank (architecture 3.5: prose lives in content files; every figure is
// a Num). Written from the rule base (CS, TXK, TXI, REG); the words that state a rule open it (Ruled, D116),
// and a figure from a rule opens it from its sheet. NEW copy for the founder to review (docs/copy.md holds
// only labels).
import type { GuideContent } from "./types";
import { YearOf } from "./year";
import { IdRef, Num, Ruled, Term } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";

export const content: GuideContent = {
  what: ({ figure }) => {
    const monthly = figure("CS-03", "monthly_deposit");
    const until = figure("CS-14", "withdrawal_age");
    const depositsUntil = figure("CS-02", "deposits_until_age");
    const parentUntil = figure("CS-14", "parent_signature_until_age");
    const grantLast = figure("CS-13", "grant_age_21");
    const ageLast = figure("CS-13", "age_last_grant");
    const months = figure("CS-06", "choice_months");
    const station = figure("CS-10", "exit_station_years");
    return (
      <>
        <Sentence measure>
          <Term id="הביטוח הלאומי">הביטוח הלאומי</Term> <Ruled id="CS-02">מפקיד</Ruled> {monthly ? <Num value={monthly} /> : null} בחודש<YearOf v={monthly} /> עד גיל {depositsUntil ? <Num value={depositsUntil} /> : null} (<Term id="סכום החיסכון הבסיסי">סכום החיסכון הבסיסי</Term>). ההורה שמקבל את קצבת הילדים <Ruled id="CS-04">יכול להכפיל את הסכום מתוכה</Ruled> (<Term id="סכום החיסכון הנוסף">סכום החיסכון הנוסף</Term>). בגילים קבועים מתווספים <Term id="מענק">מענקים</Term>, כולל {grantLast ? <Num value={grantLast} /> : null}<YearOf v={grantLast} /> בגיל {ageLast ? <Num value={ageLast} /> : null} <Ruled id="CS-13">למי שלא משך כלום קודם</Ruled>.
        </Sentence>
        <Sentence measure>
          הכסף פנוי כשהילד מגיע לגיל {until ? <Num value={until} /> : null}. לפני כן <Ruled id="CS-15">מושכים רק למימון צרכים רפואיים של הילד</Ruled>. זה אפשרי רק כשמצב רפואי מסכן את חייו, גופו או נפשו, ורופא מטעם הביטוח הלאומי אישר. עד גיל {parentUntil ? <Num value={parentUntil} /> : null} ההורה חותם על <Term prefix="ה" id="משיכה">משיכה</Term>, ואחר כך הילד <Ruled id="CS-14">מושך לבד</Ruled>. כסף שלא נמשך נשאר בבנק, <Ruled id="CS-16" prefix="ו">אי אפשר להוסיף</Ruled> אליו כסף חדש. העלות של שבירת תקופה נקבעת בהסכם של כל בנק.
        </Sentence>
        <Sentence measure>
          בבנק הכסף נכנס <Term prefix="ל" id="תוכנית חיסכון">תוכנית חיסכון</Term> <Ruled id="CS-10" prefix="ב">אחד משלושה מסלולים</Ruled>: <Term id="ריבית קבועה לא צמודה">ריבית קבועה לא צמודה</Term>, <Term id="ריבית משתנה (פריים)">ריבית משתנה (פריים)</Term> או <Term id="ריבית קבועה צמודה">ריבית קבועה צמודה</Term> <Term prefix="ל" id="מדד">מדד</Term>. כל אחד מהם בא בלי <Term id="תחנת יציאה">תחנות יציאה</Term> עד <Term id="גיל הפדיון">גיל הפדיון</Term>, או עם תחנת יציאה כל {station ? <Num value={station} /> : null} שנים.
        </Sentence>
        <p className="max-w-measure">
          <Term prefix="ה" id="ריבית">ריבית</Term> <Ruled id="CS-10">ידועה מראש לפי המסלול שנבחר</Ruled>. איך כל בנק קובע אותה כתוב בהסכם שלו.
        </p>
        <Sentence measure>
          את הבנק צריך לבחור בפועל בתוך {months ? <Num value={months} /> : null} חודשים מהלידה. <Ruled id="CS-07">בלי בחירה הכסף הולך</Ruled> <Term prefix="ל" id="קופת גמל">קופת גמל</Term>.
        </Sentence>
      </>
    );
  },
  who: ({ figure }) => {
    const banks = figure("CS-22", "bank_count");
    return (
      <>
        <Sentence measure>
          {banks ? <Num value={banks} /> : null} בנקים <Ruled id="CS-22" prefix="ש">זכו במכרז</Ruled> של משרד האוצר, <Ruled id="REG-01" prefix="ב">פיקוח</Ruled> <Term id="בנק ישראל">בנק ישראל</Term>. את הבחירה הראשונה <Ruled id="CS-06">עושים דרך הביטוח הלאומי</Ruled>, ואת <Ruled id="CS-14">המשיכה דרך הבנק</Ruled>.
        </Sentence>
      </>
    );
  },
  termIds: ["חיסכון לכל ילד", "סכום החיסכון הבסיסי", "סכום החיסכון הנוסף", "מענק", "ריבית קבועה לא צמודה", "ריבית משתנה (פריים)", "ריבית קבועה צמודה", "תחנת יציאה", "משיכה", "גיל הפדיון", "מס רווחי הון", "הגוף החוסך", "ביטוח פיקדונות", "פיקדון", "ריבית", "תוכנית חיסכון", "קופת גמל", "מדד"],
  afterTax: ({ figure }) => {
    const niiRate = figure("TXK-20", "nii_circular_rate");
    return (
      <>
        <Callout tone="caution" className="max-w-measure">
          <span className="font-medium">שיעור המס במשיכה <Ruled id="TXK-20">לא מופיע בשום טקסט</Ruled> של <Term id="רשות המסים">רשות המסים</Term>.</span> הביטוח הלאומי כותב בחוזר שלו שבמשיכה משלמים <Term id="מס רווחי הון">מס רווחי הון</Term>{niiRate ? <> בשיעור <Num value={niiRate} /> מהרווחים</> : null}, בלי להבחין בין המסלולים. <Ruled id="TXI-02">לפי הכללים הרגילים של פקודת מס הכנסה לריבית</Ruled> <Term prefix="מ" id="פיקדון">פיקדון</Term>, במסלולים <Ruled id="TXI-03" prefix="ש">לא צמודים</Ruled> למדד השיעור נמוך יותר. האתר מחשב לפי הכללים האלה. אבל <Ruled id="TXK-29">זו קריאה של האתר, לא נוסח רשמי</Ruled>, שהם חלים על <Term id="חיסכון לכל ילד">חיסכון לכל ילד</Term>. שאלה פתוחה <IdRef id="TXK OQ1" end="." />
        </Callout>
      </>
    );
  },
  risks: () => (
    <>
      <p className="max-w-measure">הכסף <Ruled id="CS-05">שייך לילד ומוחזק בנאמנות של ההורה</Ruled>, ואי אפשר להעביר, לשעבד או לעקל אותו. הבנק מבטיח שבסוף התקופה הילד <Ruled id="CS-10">יקבל לפחות את הסכומים שהופקדו</Ruled>.</p>
      <p className="max-w-measure">זה פיקדון בבנק, <Ruled id="REG-04" prefix="ו">אין בישראל</Ruled> <Term id="ביטוח פיקדונות">ביטוח פיקדונות</Term>. אם בנק קורס, הנגיד יכול, באישור הממשלה, <Ruled id="REG-06">להכריז על ערבות לפיקדונות</Ruled>, אבל לא חייב.</p>
      <p className="max-w-measure">ומה שנקבע בפתיחה נשאר: <Ruled id="CS-12">אי אפשר לעבור לבנק אחר</Ruled>, ומסלול משנים רק בתחנת יציאה.</p>
    </>
  ),
  use: () => (
    <>
      <p className="max-w-measure">
        למי שמעדיף <Ruled id="CS-10">ריבית ידועה מראש</Ruled> והבטחה שבסוף התקופה הילד יקבל לפחות את מה שהופקד, ומוכן לוותר על הגמישות של קופת גמל. את הבנק צריך לבחור בזמן, כי <Ruled id="CS-07">ברירת המחדל היא קופת גמל</Ruled>.
      </p>
      <p className="max-w-measure">
        מי שכבר בבנק ורוצה להחליף את <Term prefix="ה" id="הגוף החוסך">גוף החוסך</Term> יכול <Ruled id="CS-12">להפנות את ההפקדות הבאות לקופת גמל</Ruled>, פעם אחת. מה שנצבר נשאר בבנק.
      </p>
    </>
  ),
};
