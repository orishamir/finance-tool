// Exposure prose for מזומן שקלי (flows 6.6). Written 2026-10-23 from the rule base (BANK, TXI, MF, REG, CAT,
// BRK); each block ends with the rules it rests on. NEW copy for the founder to review.
import type { ExposureContent } from "../guide/types";
import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Sentence } from "../../components/kit";

export const content: ExposureContent = {
  what: ({ figure }) => {
    const unlinked = figure("TXI-03", "rate");
    return (
      <>
        <p className="max-w-measure">
          הכסף נשאר בשקלים ומקבל <Term id="ריבית">ריבית</Term>: <Term prefix="ב" id="חשבון עובר ושב">עו"ש</Term>, <Term prefix="ב" id="פיקדון">פיקדון</Term> לתקופה, בתכנית חיסכון, או בקרן כספית שמחזיקה פיקדונות, מק״מ ואיגרות חוב קצרות. הקרן אינה מושקעת במניות ואינה צמודה למטבע, ולכן בשקלים היא לא יורדת; מה שמשתנה הוא הריבית, שעוקבת אחרי <Term id="ריבית בנק ישראל">ריבית בנק ישראל</Term>.
        </p>
        <Sentence measure>
          כל בנק חייב לפרסם טבלה אחידה של סוגי הפיקדונות והריבית עליהם, ובנק ישראל מפרסם כל חודש את הריבית ששילם כל בנק בפועל. על ריבית מפיקדון שאינו צמוד למדד משלמים מס של {unlinked ? <Num value={unlinked} /> : null} מכל הריבית, והבנק מנכה אותו בתשלום; בקרן כספית משלמים רק בפדיון, על הרווח שמעבר לעליית המדד.
        </Sentence>
        <RulesLine ids={["BANK-09", "BANK-13", "BANK-14", "BANK-22", "BANK-25", "MF-07", "MF-29", "TXI-03", "TXI-07", "TXI-08", "TXS-12"]} />
      </>
    );
  },
  holdNote: () => (
    <>
      <p className="max-w-measure">
        בחשבון ניירות ערך הכסף הפנוי יושב ביתרת זכות, ואצל חש"ב הריבית עליה היא שורה בתעריפון עם תנאים. בקופת גמל להשקעה ובקרן השתלמות יש <Term id="מסלול השקעה">מסלול</Term> "כספי (שקלי)"; לפי רשימת מסלולי ההשקעה של רשות שוק ההון הוא מחזיק נכסים שקליים לא צמודים: פיקדונות, מלוות ממשלה, הלוואות ואיגרות חוב בשקלים <RuleRef id="CAT-23" />; בניהול אישי מותר להחזיק פיקדונות.
      </p>
      <RulesLine ids={["BRK-25", "CAT-23", "CAT-20", "IRA-11", "MF-34", "MF-35"]} />
    </>
  ),
  risks: () => (
    <>
      <p className="max-w-measure">
        הסיכון העיקרי הוא שהמחירים עולים מהר מהריבית, וכוח הקנייה של הכסף נשחק. בפיקדון לתקופה הכסף נעול עד המועד או עד <Term id="תחנת יציאה">תחנת היציאה</Term>, ושבירה לפני כן תלויה בהסכמת הבנק ובמחיר שהוא קובע.
      </p>
      <p className="max-w-measure">
        אין בישראל ביטוח פיקדונות. חוק משנת 2026 מחייב את שר האוצר ואת הנגיד לבחון אם צריך כזה. אם בנק נקלע לקשיים, הנגיד רשאי, באישור הממשלה, להכריז על ערבות לפיקדונות, אבל זו סמכות ולא חובה. מה הפיקוח מגן בפועל נשאר פתוח: <IdRef id="BANK OQ8" />.
      </p>
      <RulesLine ids={["TXI-25", "BANK-27", "BANK-06", "REG-04", "REG-06", "TXI-20"]} />
    </>
  ),
  termIds: ["ריבית", "חשבון עובר ושב", "פיקדון", "ריבית בנק ישראל", "מסלול השקעה", "תחנת יציאה", "יתרת זכות בחשבון", "קרן כספית", "מוצרי שוק הכסף"],
};
