// Exposure prose for מזומן שקלי (flows 6.6). Written 2026-10-23 from the rule base (BANK, TXI, MF, REG, CAT,
// BRK); each block ends with the rules it rests on. NEW copy for the founder to review.
import { Link } from "react-router";
import type { ExposureContent } from "../guide/types";
import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Sentence } from "../../components/kit";

export const content: ExposureContent = {
  what: ({ figure }) => {
    const unlinked = figure("TXI-03", "rate");
    return (
      <>
        <p className="max-w-measure">
          הכסף נשאר בשקלים ומקבל <Term id="ריבית">ריבית</Term>: <Term prefix="ב" id="חשבון עובר ושב">עו"ש</Term>, <Term prefix="ב" id="פיקדון">פיקדון</Term> לתקופה או <Term prefix="ב" id="תכנית חיסכון">תכנית חיסכון</Term>. הוא אינו מושקע במניות ואינו צמוד למטבע, ולכן בשקלים הוא לא יורד; מה שמשתנה הוא הריבית, שעוקבת אחרי <Term id="ריבית בנק ישראל">ריבית בנק ישראל</Term>.
        </p>
        <Sentence measure>
          כל בנק חייב לפרסם טבלה אחידה של סוגי הפיקדונות והריבית עליהם, <Term prefix="ו" id="בנק ישראל">בנק ישראל</Term> מפרסם כל חודש את הריבית ששילם כל בנק בפועל. על ריבית מפיקדון <Term prefix="ש" id="לא צמוד">אינו צמוד למדד</Term> משלמים מס של {unlinked ? <Num value={unlinked} /> : null} מכל הריבית, והבנק מנכה אותו בתשלום.
        </Sentence>
        {/* D6 (amended 2026-10-27): a money-market fund holds more than cash, so it has its own entry and page */}
        <p className="max-w-measure">
          <Link to="/guide/money-market-fund-daily" className="text-link hover:underline">קרן כספית</Link> היא דרך אחרת להחזיק כסף לטווח קצר, אבל היא לא מזומן: לפי החוק היא מחזיקה גם <Link to="/guide/makam" className="text-link hover:underline">מק״מ</Link> <Term prefix="ו" id={'אג"ח ממשלתית קצרה'}>איגרות חוב קצרות</Term> בדירוג גבוה, לצד פיקדונות ומזומן, והמס בה נגבה אחרת. לכל אחת מהן עמוד משלה.
        </p>
        <RulesLine ids={["BANK-09", "BANK-13", "BANK-14", "BANK-22", "BANK-25", "MF-07", "MF-29", "TXI-03", "TXI-07", "TXI-08"]} />
      </>
    );
  },
  holdNote: () => (
    <>
      <p className="max-w-measure">
        <Term prefix="ב" id="חשבון ניירות ערך">חשבון ניירות ערך</Term> הכסף הפנוי יושב <Term prefix="ב" id="יתרת זכות בחשבון">יתרת זכות</Term>, ואצל <Term id="חש&quot;ב">חש"ב</Term> הריבית עליה היא שורה בתעריפון עם תנאים. <Term prefix="ב" id="קופת גמל להשקעה">קופת גמל להשקעה</Term> <Term prefix="וב" id="קרן השתלמות">קרן השתלמות</Term> יש <Term id="מסלול השקעה">מסלול</Term> "<Term id="כספי (שקלי)">כספי (שקלי)</Term>"; לפי רשימת מסלולי ההשקעה של <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון</Term> הוא מחזיק נכסים שקליים לא צמודים: פיקדונות, מלוות ממשלה, הלוואות <Term prefix="ו" id="איגרת חוב">איגרות חוב</Term> בשקלים <RuleRef id="CAT-23" end=";" /> <Term prefix="ב" id="קופת גמל בניהול אישי">ניהול אישי</Term> מותר להחזיק פיקדונות.
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
        אין בישראל <Term id="ביטוח פיקדונות">ביטוח פיקדונות</Term>. חוק משנת 2026 מחייב את שר האוצר ואת הנגיד לבחון אם צריך כזה. אם בנק נקלע לקשיים, הנגיד רשאי, באישור הממשלה, להכריז על ערבות לפיקדונות, אבל זו סמכות ולא חובה. מה הפיקוח מגן בפועל נשאר פתוח <IdRef id="BANK OQ8" end="." />
      </p>
      <RulesLine ids={["TXI-25", "BANK-27", "BANK-06", "REG-04", "REG-06", "TXI-20"]} />
    </>
  ),
  termIds: ["ריבית", "חשבון עובר ושב", "פיקדון", "ריבית בנק ישראל", "מסלול השקעה", "תחנת יציאה", "יתרת זכות בחשבון", "קרן כספית", "מוצרי שוק הכסף", "ביטוח פיקדונות", "קופת גמל בניהול אישי", "כספי (שקלי)", "חשבון ניירות ערך", 'אג"ח ממשלתית קצרה', "לא צמוד", "תכנית חיסכון", 'חש"ב', "קופת גמל להשקעה", "קרן השתלמות", "רשות שוק ההון ביטוח וחיסכון", "איגרת חוב"],
};
