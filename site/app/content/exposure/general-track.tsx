// Exposure prose for מסלול כללי (flows 6.6). Written from the rule base (CAT, PF, TXK, REG); the words that state a rule open it
// (Ruled, D116), and a figure from a rule opens it from its sheet. NEW copy for the founder to review.
import type { ExposureContent } from "../guide/types";
import type { GlanceItem } from "../../components/guide/sections";
import { RuleRows } from "../../components/guide/sections";
import { Num, Ruled, Term } from "../../components/provenance";
import { Sentence } from "../../components/kit";

export const content: ExposureContent = {
  glance: ({ figure }) => {
    const days = figure("PF-23", "switch_business_days");
    const items: (GlanceItem | null)[] = [days && { id: "switch", label: "מעבר למסלול אחר באותה קופה", value: <Sentence as="span">תוך <Num value={days} /> ימי עסקים</Sentence> }];
    return items.filter((g) => g !== null);
  },
  what: ({ figure }) => {
    const days = figure("PF-23", "switch_business_days");
    return (
      <>
        <p className="max-w-measure">
          הכסף <Ruled id="CAT-23">חשוף לנכסים מסוגים שונים, בלי תמהיל קבוע</Ruled>. את התמהיל קובעת ועדת ההשקעות של <Term prefix="ה" id="חברה מנהלת">חברה המנהלת</Term>, לפי שיקול דעתה ובכפוף לדין.
        </p>
        <p className="max-w-measure">
          בחוזר <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון</Term>, מסלול כללי הוא <Ruled id="CAT-17">מסלול שלא מתמחה</Ruled>, לא <Term id="מסלול ברירת מחדל">ברירת מחדל</Term> ולא מסלול למקבלי <Term id="קצבה">קצבה</Term>. <Ruled id={["CAT-15", "CAT-24"]}>השם מחייב רק את המדיניות התקנונית</Ruled>. התמהיל בפועל יכול להשתנות בלי שהשם ישתנה.
        </p>
        <Sentence measure>
          <Term prefix="ב" id="קופת גמל להשקעה">קופת גמל להשקעה</Term> <Term prefix="וב" id="קרן השתלמות">קרן השתלמות</Term> החברה <Ruled id="CAT-18">רשאית לנהל מסלול כללי</Ruled> לצד המסלולים המתמחים. בקרן השתלמות הוא <Ruled id={["KH-19", "PF-24"]}>אחת משתי האפשרויות לברירת מחדל</Ruled>. מעבר ממנו למסלול אחר באותה קופה נעשה תוך {days ? <Num value={days} /> : null} ימי עסקים, <Ruled id="PF-23">בלי</Ruled> <Term id="עמלה">עמלה</Term> <Ruled prefix="ו" id={["TXK-04", "TXH-17"]}>בלי מס</Ruled>.
        </Sentence>
      </>
    );
  },
  holdNote: ({ figure }) => {
    const age = figure("CAT-58", "age_band_1");
    return (
      <RuleRows
        items={[
          { id: "funds", label: "בקופת גמל להשקעה ובקרן השתלמות", value: <><Ruled id="CAT-18">החברה המנהלת רשאית לנהל אותו</Ruled>, ומחזיקים אותו דרך הקופה.</> },
          {
            id: "pension",
            label: (
              <>
                <Term prefix="ב" id="קרן פנסיה">קרנות פנסיה</Term> <Term prefix="וב" id="קופת גמל">קופות גמל</Term> לקצבה
              </>
            ),
            value: (
              <>
                המסלול הכללי <Ruled id="CAT-19">סגור למצטרפים חדשים</Ruled>. מי שכבר היה בו יכול להישאר. הכלל הזה לא חל על כמה סוגים של קופות גמל, למשל קופות לדמי מחלה <Term prefix="ו" id="קופת גמל בניהול אישי">קופות בניהול אישי</Term>.
              </>
            ),
            line: <Sentence as="span">מצטרפים חדשים שלא בחרו מסלול <Ruled id="CAT-58">נכנסים למסלול לפי הגיל שלהם</Ruled>: הראשון עד גיל {age ? <Num value={age} /> : null}, וכן הלאה.</Sentence>,
          },
          {
            id: "account",
            label: <Term prefix="ב" id="חשבון ניירות ערך">חשבון ניירות ערך</Term>,
            value: <>מסלול כללי <Ruled id="CAT-18">מנוהל בתוך קופה או פוליסה</Ruled>. האתר לא מצא בכללים שקרא דרך לקנות אותו בחשבון ניירות ערך.</>,
          },
        ]}
      />
    );
  },
  risks: () => (
    <>
      <p className="max-w-measure">
        השווי עולה ויורד עם כל הנכסים שבמסלול. שני מסלולים באותו שם אצל חברות שונות <Ruled id="CAT-24">יכולים להחזיק תמהילים שונים מאוד</Ruled>. מה ש<Term prefix="ה" id="מסלול השקעה">מסלול</Term> מחזיק נמדד לפי החשיפה בפועל בנתוני רשות שוק ההון, לא לפי השם.
      </p>
      <p className="max-w-measure">
        מעבר לדמי הניהול, המסלול נושא <Term id="הוצאות ישירות">הוצאות ישירות</Term> שהחברה גובה מהנכסים. בתקנות <Ruled id="PF-10">לא נמצאה תקרה כוללת</Ruled> להוצאות האלה. תקרה יש רק לאחת מהן, עמלת הניהול החיצוני: החברה <Ruled id="PF-11">קובעת אותה לכל מסלול לשנה ומפרסמת אותה מראש</Ruled>.
      </p>
      <p className="max-w-measure">
        הנכסים <Ruled id="PF-29">מוחזקים בנאמנות</Ruled>, בנפרד מרכוש החברה המנהלת, ואי אפשר לעקל אותם. את המדיניות שכל שם מסלול מחייב <Ruled id="CAT-15">קובעת רשימת מסלולי ההשקעה</Ruled> של רשות שוק ההון. במסלול כללי הנכסים חשופים לנכסים מסוגים שונים, בכפוף לדין ולשיקול דעת ועדת ההשקעות, <Ruled id="CAT-23">בלי תמהיל קבוע</Ruled>.
      </p>
    </>
  ),
  termIds: ["מסלול כללי", "מסלול ברירת מחדל", "קופת גמל בניהול אישי", "מסלול השקעה", "העברת כספים בין מסלולי השקעה", "מסלול השקעה מתמחה", "רשימת מסלולי השקעה", "הוצאות ישירות", "חשבון ניירות ערך", "קופת גמל", "קרן פנסיה", "קרן השתלמות", "קופת גמל להשקעה", "קצבה", "רשות שוק ההון ביטוח וחיסכון", "חברה מנהלת"],
};
