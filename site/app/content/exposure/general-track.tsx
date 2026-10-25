// Exposure prose for מסלול כללי (flows 6.6). Written 2026-10-23 from the rule base (CAT, PF, TXK, REG); each
// block ends with the rules it rests on. NEW copy for the founder to review.
import type { ExposureContent } from "../guide/types";
import { Num, RulesLine, Term } from "../../components/provenance";
import { Sentence } from "../../components/kit";

const OQ = ({ id }: { id: string }) => (
  <bdi dir="ltr" className="whitespace-nowrap">
    {id}
  </bdi>
);

export const content: ExposureContent = {
  what: ({ figure }) => {
    const days = figure("PF-23", "switch_business_days");
    return (
      <>
        <p className="max-w-measure">
          הכסף מושקע בתמהיל של נכסים מסוגים שונים, מניות, איגרות חוב, פיקדונות ונכסים לא סחירים, בארץ ובחו"ל, לפי שיקול דעת ועדת ההשקעות של החברה המנהלת. בחוזר רשות שוק ההון <Term id="מסלול כללי">מסלול כללי</Term> הוא מסלול שאינו מתמחה, אינו <Term id="מסלול ברירת מחדל">ברירת מחדל</Term> ואינו מסלול למקבלי קצבה; השם מחייב רק את המדיניות התקנונית, והתמהיל בפועל יכול להשתנות בלי שהשם ישתנה.
        </p>
        <Sentence measure>
          בקופת גמל להשקעה ובקרן השתלמות החברה רשאית לנהל מסלול כללי לצד המסלולים המתמחים, ובקרן השתלמות הוא אחת משתי האפשרויות לברירת מחדל. מעבר ממנו למסלול אחר באותה קופה נעשה תוך {days ? <Num value={days} /> : null} ימי עסקים, בלי עמלה ובלי מס.
        </Sentence>
        <RulesLine ids={["CAT-17", "CAT-15", "CAT-24", "CAT-18", "PF-23", "PF-24", "KH-19", "TXK-04"]} />
      </>
    );
  },
  holdNote: ({ figure }) => {
    const age = figure("CAT-19", "age_band_1");
    return (
      <>
        <Sentence measure>
          מחזיקים אותו רק דרך קופה שחברה מנהלת מנהלת: קופת גמל להשקעה או קרן השתלמות. בקרנות פנסיה ובקופות גמל לקצבה המסלול הכללי סגור למצטרפים חדשים, שנכנסים למסלול לפי גיל, עד {age ? <Num value={age} /> : null} וכן הלאה; מי שכבר היה בו יכול להישאר. אי אפשר לקנות "מסלול כללי" בחשבון ניירות ערך.
        </Sentence>
        <RulesLine ids={["CAT-18", "CAT-19", "CAT-10"]} />
      </>
    );
  },
  risks: () => (
    <>
      <p className="max-w-measure">
        השווי עולה ויורד עם כל הנכסים שבמסלול, ושני מסלולים באותו שם אצל חברות שונות יכולים להחזיק תמהילים שונים מאוד; <Term prefix="ה" id="מסלול השקעה">מסלול</Term> הנכון נמדד לפי החשיפה בפועל בנתוני רשות שוק ההון, לא לפי השם. מעבר לדמי הניהול, המסלול נושא הוצאות ישירות שהחברה גובה מהנכסים, עד תקרה שהיא קובעת ומפרסמת לכל מסלול.
      </p>
      <p className="max-w-measure">
        הנכסים מוחזקים בנאמנות, בנפרד מרכוש החברה המנהלת, ואי אפשר לעקל אותם. רשימת המסלולים הרשמית של רשות שוק ההון, עם המדיניות שכל שם מחייב, עדיין לא הושגה: <OQ id="CAT OQ9" />.
      </p>
      <RulesLine ids={["CAT-24", "CAT-16", "PF-10", "PF-29", "REG-18", "TXK-03"]} />
    </>
  ),
  termIds: ["מסלול כללי", "מסלול ברירת מחדל", "מסלול השקעה", "העברת כספים בין מסלולי השקעה", "מסלול השקעה מתמחה", "רשימת מסלולי השקעה"],
};
