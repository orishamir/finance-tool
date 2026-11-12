// Exposure prose for מסלול כללי (flows 6.6). Written from the rule base (CAT, PF, TXK, REG); each
// block ends with the rules it rests on. NEW copy for the founder to review.
import type { ExposureContent } from "../guide/types";
import type { GlanceItem } from "../../components/guide/sections";
import { RuleRows } from "../../components/guide/sections";
import { Num, RuleRef, RulesLine, Term } from "../../components/provenance";
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
          הכסף מושקע בתמהיל של נכסים מסוגים שונים: מניות, <Term id="איגרת חוב">איגרות חוב</Term>, <Term id="פיקדון">פיקדונות</Term> ונכסים לא סחירים, בארץ ובחו״ל. את התמהיל קובעת ועדת ההשקעות של <Term prefix="ה" id="חברה מנהלת">חברה המנהלת</Term>, לפי שיקול דעתה.
        </p>
        <p className="max-w-measure">
          בחוזר <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון</Term>, מסלול כללי הוא מסלול שלא מתמחה, לא <Term id="מסלול ברירת מחדל">ברירת מחדל</Term> ולא מסלול למקבלי <Term id="קצבה">קצבה</Term>. השם מחייב רק את המדיניות התקנונית. התמהיל בפועל יכול להשתנות בלי שהשם ישתנה.
        </p>
        <Sentence measure>
          <Term prefix="ב" id="קופת גמל להשקעה">קופת גמל להשקעה</Term> <Term prefix="וב" id="קרן השתלמות">קרן השתלמות</Term> החברה רשאית לנהל מסלול כללי לצד המסלולים המתמחים. בקרן השתלמות הוא אחת משתי האפשרויות לברירת מחדל. מעבר ממנו למסלול אחר באותה קופה נעשה תוך {days ? <Num value={days} /> : null} ימי עסקים, בלי <Term id="עמלה">עמלה</Term> ובלי מס.
        </Sentence>
        <RulesLine ids={["CAT-17", "CAT-15", "CAT-24", "CAT-18", "PF-23", "PF-24", "KH-19", "TXK-04"]} />
      </>
    );
  },
  holdNote: ({ figure }) => {
    const age = figure("CAT-19", "age_band_1");
    return (
      <RuleRows
        items={[
          { id: "funds", label: "בקופת גמל להשקעה ובקרן השתלמות", value: "מחזיקים אותו רק דרך קופה כזו, שחברה מנהלת מנהלת.", rules: ["CAT-18"] },
          {
            id: "pension",
            label: (
              <>
                <Term prefix="ב" id="קרן פנסיה">קרנות פנסיה</Term> <Term prefix="וב" id="קופת גמל">קופות גמל</Term> לקצבה
              </>
            ),
            value: "המסלול הכללי סגור למצטרפים חדשים. מי שכבר היה בו יכול להישאר.",
            line: <Sentence as="span">מצטרפים חדשים נכנסים למסלול לפי הגיל שלהם: הראשון עד גיל {age ? <Num value={age} /> : null}, וכן הלאה.</Sentence>,
            rules: ["CAT-18", "CAT-19"],
          },
          {
            id: "account",
            label: <Term prefix="ב" id="חשבון ניירות ערך">חשבון ניירות ערך</Term>,
            value: "אי אפשר לקנות ״מסלול כללי״.",
            rules: ["CAT-10"],
          },
        ]}
      />
    );
  },
  risks: () => (
    <>
      <p className="max-w-measure">
        השווי עולה ויורד עם כל הנכסים שבמסלול. שני מסלולים באותו שם אצל חברות שונות יכולים להחזיק תמהילים שונים מאוד. מה ש<Term prefix="ה" id="מסלול השקעה">מסלול</Term> מחזיק נמדד לפי החשיפה בפועל בנתוני רשות שוק ההון, לא לפי השם.
      </p>
      <p className="max-w-measure">
        מעבר לדמי הניהול, המסלול נושא <Term id="הוצאות ישירות">הוצאות ישירות</Term> שהחברה גובה מהנכסים, עד תקרה שהיא קובעת ומפרסמת לכל מסלול.
      </p>
      <p className="max-w-measure">
        הנכסים מוחזקים בנאמנות, בנפרד מרכוש החברה המנהלת, ואי אפשר לעקל אותם. את המדיניות שכל שם מסלול מחייב קובעת רשימת מסלולי ההשקעה של רשות שוק ההון. במסלול כללי הנכסים חשופים לנכסים מסוגים שונים, בכפוף לדין ולשיקול דעת ועדת ההשקעות, בלי תמהיל קבוע <RuleRef id="CAT-23" end="." />
      </p>
      <RulesLine ids={["CAT-24", "CAT-16", "PF-10", "PF-29", "REG-18", "TXK-03", "CAT-23", "CAT-15"]} />
    </>
  ),
  termIds: ["מסלול כללי", "מסלול ברירת מחדל", "מסלול השקעה", "העברת כספים בין מסלולי השקעה", "מסלול השקעה מתמחה", "רשימת מסלולי השקעה", "הוצאות ישירות", "חשבון ניירות ערך", "קופת גמל", "קרן פנסיה", "קרן השתלמות", "קופת גמל להשקעה", "קצבה", "רשות שוק ההון ביטוח וחיסכון", "חברה מנהלת", "פיקדון", "איגרת חוב"],
};
