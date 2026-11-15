// Guide prose for חיסכון לכל ילד in a provident fund (architecture 3.5: prose lives in content files; every
// figure is a Num). Written from the rule base (CS, TXK, REG); the words that state a rule open it (Ruled,
// D116), and a figure from a rule opens it from its sheet. NEW copy for the founder to review (docs/copy.md
// holds only labels).
import type { GuideContent } from "./types";
import { YearOf } from "./year";
import { Num, Ruled, Term, VariesByCompany } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";
import { OpenLossOffset } from "./open-tax";

export const content: GuideContent = {
  what: ({ figure }) => {
    const monthly = figure("CS-03", "monthly_deposit");
    const until = figure("CS-14", "withdrawal_age");
    const parentUntil = figure("CS-14", "parent_signature_until_age");
    const grantYoung = figure("CS-13", "grant_age_3");
    const ageFirst = figure("CS-13", "age_first_grant");
    const grantLast = figure("CS-13", "grant_age_21");
    const ageLast = figure("CS-13", "age_last_grant");
    const months = figure("CS-06", "choice_months");
    return (
      <>
        <Sentence measure>
          <Term id="הביטוח הלאומי">הביטוח הלאומי</Term> <Ruled id="CS-02">מפקיד בכל חודש</Ruled> {monthly ? <Num value={monthly} /> : null}<YearOf v={monthly} /> עד גיל {until ? <Num value={until} /> : null} (<Term id="סכום החיסכון הבסיסי">סכום החיסכון הבסיסי</Term>), וההורה שמקבל את קצבת הילדים <Ruled id="CS-04">יכול להורות להכפיל אותם מתוכה</Ruled> (<Term id="סכום החיסכון הנוסף">סכום החיסכון הנוסף</Term>). כסף אחר אי אפשר להפקיד.
        </Sentence>
        <Sentence measure>
          בגילים קבועים הביטוח הלאומי מוסיף <Term id="מענק">מענקים</Term>. ילדים שנולדו מאז תחילת התוכנית מקבלים {grantYoung ? <Num value={grantYoung} /> : null}<YearOf v={grantYoung} /> בגיל {ageFirst ? <Num value={ageFirst} /> : null} ושוב בגיל בר או בת מצווה. ילדים שנולדו לפני כן מקבלים מענק אחד <Term prefix="ב" id="גיל הפדיון">גיל הפדיון</Term>. כולם מקבלים עוד {grantLast ? <Num value={grantLast} /> : null}<YearOf v={grantLast} /> בגיל {ageLast ? <Num value={ageLast} /> : null}, אבל <Ruled id="CS-13">רק אם לא משכו כלום קודם</Ruled>: גם <Term id="משיכה חלקית">משיכה חלקית</Term> מבטלת את המענק הזה.
        </Sentence>
        <Sentence measure>
          הכסף פנוי כשהילד מגיע לגיל {until ? <Num value={until} /> : null}. לפני כן <Ruled id="CS-15">מושכים רק למימון צרכים רפואיים של הילד</Ruled>, כשמצב רפואי מסכן את חייו, גופו או נפשו ורופא מטעם הביטוח הלאומי אישר. עד גיל {parentUntil ? <Num value={parentUntil} /> : null} ההורה חותם על <Term prefix="ה" id="משיכה">משיכה</Term>, ואחר כך הילד <Ruled id="CS-14">מושך לבד</Ruled>.
        </Sentence>
        <Sentence measure>
          במסלול הזה הכסף מנוהל <Term prefix="ב" id="קופת גמל">קופת גמל</Term> ייעודית, <Term prefix="ב" id="מסלול השקעה">מסלול השקעה</Term> שבוחרים <Ruled id="CS-08">מתוך הרשימה של הקופה</Ruled>. מי שלא בוחר בתוך {months ? <Num value={months} /> : null} חודשים מהלידה נכנס לקופת גמל <Term prefix="ב" id="מסלול ברירת מחדל">מסלול ברירת המחדל</Term>: <Term id="חוסכים המעדיפים סיכון מוגבר">חוסכים המעדיפים סיכון מוגבר</Term>, <Ruled id="CS-07">או הקופה והמסלול של אח גדול</Ruled>.
        </Sentence>
      </>
    );
  },
  who: () => (
    <>
      <p className="max-w-measure">
        <Term id="חברה מנהלת">חברות מנהלות</Term> של קופות גמל שזכו במכרז של משרד האוצר ומופיעות ברשימה של הביטוח הלאומי, בפיקוח <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון, ביטוח וחיסכון</Term>. את הבחירה הראשונה <Ruled id="CS-06">עושים דרך הביטוח הלאומי</Ruled>, ומעבר בין קופות ומסלולים <Ruled id="CS-11">דרך הקופה שעוברים אליה</Ruled>.
      </p>
    </>
  ),
  switchLine: "בלי מס הכנסה, בכל עת: מסלול אחר, או קופה אחרת מהרשימה; לא לבנק. אחרי גיל הפדיון אפשר לעבור לכל קופת גמל להשקעה.",
  switchRules: ["CS-11", "CS-16", "TXK-22", "TXK-04"],
  termIds: ["חיסכון לכל ילד", "סכום החיסכון הבסיסי", "סכום החיסכון הנוסף", "מענק", "מסלול השקעה", "מסלול ברירת מחדל", "חוסכים המעדיפים סיכון מוגבר", "חברה מנהלת", "משיכה", "גיל הפדיון", "קצבה", "דמי ניהול", "מס רווחי הון", "הבטחת קרן", "רשות שוק ההון ביטוח וחיסכון", "קופת גמל להשקעה", "קופת גמל", "משיכה חלקית"],
  afterTax: ({ figure }) => {
    const niiRate = figure("TXK-20", "nii_circular_rate");
    return (
      <>
        <p className="max-w-measure">
          <span className="font-medium">במשיכה משלמים מס הכנסה <Ruled id="TXK-23">כמו במשיכה מקופת גמל להשקעה</Ruled>.</span> החוק מחזיק את הכסף בקופת גמל להשקעה, ורשות שוק ההון, ביטוח וחיסכון ומשרד האוצר קובעים שחלים עליה כל הכללים של קופה כזאת. <Term id="רשות המסים">רשות המסים</Term> לא כתבה זאת על <Term id="חיסכון לכל ילד">חיסכון לכל ילד</Term>. הביטוח הלאומי כותב בחוזר שלו שבמשיכה משלמים <Term id="מס רווחי הון">מס רווחי הון</Term>{niiRate ? <> בשיעור <Num value={niiRate} /> מהרווחים</> : null}, <Ruled id="TXK-20">בלי לומר על איזה רווח</Ruled>.
        </p>
        <Callout tone="blocked" className="max-w-measure">
          <span className="font-medium">הביטוח הלאומי מתאר גם מסלול <Term id="קצבה">קצבה</Term>:</span> להשאיר את הכסף בקופה עד הפרישה ולקבל אותו כקצבה בלי מס. הבסיס לכך בחוק <Ruled id="TXK-25">לא נמצא</Ruled>, והאתר לא מחשב אותו.
        </Callout>
        <OpenLossOffset />
        {/* the page holds only the rules this file names by id: OpenLossOffset states TXK-30 */}
      </>
    );
  },
  risks: () => (
    <>
      <p className="max-w-measure">הכסף <Ruled id="CS-05">שייך לילד</Ruled>, מוחזק בנאמנות של ההורה שמקבל את הקצבה, ואי אפשר להעביר, לשעבד או לעקל אותו. נכסי הקופה <Ruled id="REG-18">מופרדים מרכוש החברה המנהלת</Ruled>, ואם היא קורסת, הניהול <Ruled id="REG-19">עובר לחברה אחרת</Ruled>.</p>
      <p className="max-w-measure">אין <Term id="הבטחת קרן">הבטחת קרן</Term>: השווי עולה ויורד עם המסלול. כל קופה מציעה שלושה מסלולי סיכון, וכמה מכל מסלול מושקע במניות <Ruled id="CS-26">קובעת החברה המנהלת, באישור הממונה</Ruled>. מסלול ברירת המחדל לילד שמצטרף היום הוא מסלול הסיכון המוגבר. מי שרוצה הבטחה שהילד יקבל בסוף תקופת החיסכון <Ruled id="CS-25">לפחות את מה שהופקד</Ruled> בוחר בבנק.</p>
    </>
  ),
  use: ({ figure }) => {
    // D30: the cap after 21 is the law's (CS-18); each company's own rate is its term (CS-30), on the companies' pages
    const balanceCap = figure("CS-18", "balance_cap_after_21");
    const ageLast = figure("CS-13", "age_last_grant");
    const until = figure("CS-14", "withdrawal_age");
    return (
    <>
      <Sentence measure>
        החיסכון נפתח ממילא, וההחלטות שלכם הן שתיים: אם <Ruled id="CS-04">להכפיל את ההפקדה מקצבת הילדים</Ruled>, ובאיזו רמת סיכון. בלי בחירה הכסף <Ruled id="CS-07">הולך למסלול הסיכון המוגבר</Ruled>, או לקופה ולמסלול של אח גדול.
      </Sentence>
      <Sentence measure>
        מי שלא צריך את הכסף עד שהילד מתבגר מרוויח משני דברים: הביטוח הלאומי משלם את <Term id="דמי ניהול">דמי הניהול</Term> עד גיל {ageLast ? <Num value={ageLast} /> : null}, והמענק האחרון <Ruled id="CS-13">ניתן רק למי שלא משך</Ruled>. אחרי הגיל הזה <Ruled id="CS-18">דמי הניהול יורדים מהחיסכון</Ruled>. כל חברה קובעת שיעור משלה, עד התקרה שבתקנות{balanceCap ? <>: <Num value={balanceCap} /> בשנה מהיתרה</> : null}.
      </Sentence>
      <p className="max-w-measure">
        <VariesByCompany ids={[{ rule: "CS-30", companies: ["harel", "altshuler-shaham"] }]} lead="דמי הניהול אחרי הגיל הזה תלויים בחברה" />
      </p>
      <Sentence measure>
        כסף שלא נמשך ממשיך להתנהל בקופה, אבל <Ruled id="CS-16">אי אפשר להוסיף אליו כסף חדש</Ruled>. אחרי גיל {until ? <Num value={until} /> : null} הילד <Ruled id="TXK-04">יכול להעביר אותו בלי מס הכנסה</Ruled> לכל <Term id="קופת גמל להשקעה">קופת גמל להשקעה</Term>, גם כזו שלא נועדה לחיסכון לילד.
      </Sentence>
    </>
    );
  },
};
