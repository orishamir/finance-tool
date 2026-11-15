// Exposure prose for מזומן שקלי (flows 6.6). Written from the rule base (BANK, TXI, MF, REG, CAT,
// BRK); the words that state a rule open it (Ruled, D116), and a figure from a rule opens it from its sheet. NEW copy for the founder to review.
import { Link } from "react-router";
import type { ExposureContent } from "../guide/types";
import type { GlanceItem } from "../../components/guide/sections";
import { RuleRows } from "../../components/guide/sections";
import { IdRef, Num, Ruled, Term } from "../../components/provenance";
import { Sentence } from "../../components/kit";

export const content: ExposureContent = {
  glance: ({ figure }) => {
    const unlinked = figure("TXI-03", "rate");
    const items: (GlanceItem | null)[] = [unlinked && { id: "tax", label: (
          <span>
            מס הכנסה על <Term id="ריבית">ריבית</Term> לא צמודה
          </span>
        ),
        value: <Num value={unlinked} /> }];
    return items.filter((g) => g !== null);
  },
  what: ({ figure }) => {
    const unlinked = figure("TXI-03", "rate");
    return (
      <>
        <p className="max-w-measure">
          הכסף נשאר בשקלים ומקבל ריבית: <Term prefix="ב" id="חשבון עובר ושב">עו״ש</Term>, <Term prefix="ב" id="פיקדון">פיקדון</Term> לתקופה או <Term prefix="ב" id="תוכנית חיסכון">תוכנית חיסכון</Term>. הוא לא מושקע במניות, ושוויו לא זז עם שער של מטבע אחר, ולכן בשקלים הוא לא יורד. מה שמשתנה הוא הריבית, שעוקבת אחרי <Term id="ריבית בנק ישראל">ריבית בנק ישראל</Term>.
        </p>
        <Sentence measure>
          כל בנק <Ruled id={["BANK-13", "BANK-14"]}>חייב לפרסם טבלה אחידה</Ruled> של סוגי הפיקדונות והריבית עליהם. <Term id="בנק ישראל">בנק ישראל</Term> <Ruled id="BANK-22">מפרסם כל חודש את הריבית ששילם כל בנק בפועל</Ruled>. על ריבית מפיקדון <Term prefix="ש" id="לא צמוד">לא צמוד למדד</Term> משלמים מס הכנסה של {unlinked ? <Num value={unlinked} /> : null} מכל הריבית, והבנק <Ruled id={["TXI-07", "TXI-08"]}>מנכה אותו בתשלום</Ruled>.
        </Sentence>
        {/* D6: a money-market fund holds more than cash, so it has its own entry and page */}
        <p className="max-w-measure">
          <Link to="/guide/money-market-fund-daily" className="text-link hover:underline">קרן כספית</Link> היא דרך אחרת להחזיק כסף לטווח קצר, אבל היא לא מזומן. לפי החוק היא מחזיקה גם <Link to="/guide/makam" className="text-link hover:underline">מק״מ</Link> <Term prefix="ו" id={'אג"ח ממשלתית קצרה'}>איגרות חוב קצרות</Term> <Ruled id={["MF-07", "MF-29"]}>בדירוג גבוה</Ruled>, לצד פיקדונות ומזומן. גם המס בה נגבה אחרת. לכל אחת מהן עמוד משלה.
        </p>
      </>
    );
  },
  holdNote: () => (
    <RuleRows
      items={[
        {
          id: "account",
          label: <Term prefix="ב" id="חשבון ניירות ערך">חשבון ניירות ערך</Term>,
          value: (
            <>
              הכסף הפנוי יושב <Term prefix="ב" id="יתרת זכות בחשבון">יתרת זכות</Term>. אצל <Term id="חש&quot;ב">חש״ב</Term> הריבית עליה היא <Ruled id="BRK-25">שורה בתעריפון</Ruled> עם תנאים.
            </>
          ),
        },
        {
          id: "track",
          label: (
            <>
              <Term prefix="ב" id="קופת גמל להשקעה">קופת גמל להשקעה</Term> <Term prefix="וב" id="קרן השתלמות">קרן השתלמות</Term>
            </>
          ),
          value: (
            <>
              יש <Term id="מסלול השקעה">מסלול</Term> ״<Term id="כספי (שקלי)">כספי (שקלי)</Term>״.
            </>
          ),
          line: (
            <>
              לפי רשימת מסלולי ההשקעה של <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון</Term> הוא <Ruled id="CAT-23">מחזיק נכסים שקליים לא צמודים</Ruled>: פיקדונות, מלוות ממשלה, הלוואות <Term prefix="ו" id="איגרת חוב">איגרות חוב</Term> בשקלים.
            </>
          ),
        },
        {
          id: "ira",
          label: <Term prefix="ב" id="קופת גמל בניהול אישי">ניהול אישי</Term>,
          value: <><Ruled id="IRA-11">מותר להחזיק פיקדונות</Ruled>.</>,
        },
      ]}
    />
  ),
  risks: () => (
    <>
      <p className="max-w-measure">
        הסיכון העיקרי הוא שהמחירים עולים מהר מהריבית, וכוח הקנייה של הכסף נשחק. בפיקדון לתקופה הכסף <Ruled id="BANK-27">נעול עד המועד</Ruled> או עד <Term id="תחנת יציאה">תחנת היציאה</Term>. שבירה לפני כן <Ruled id="BANK-06">תלויה בהסכמת הבנק ובמחיר שהוא קובע</Ruled>.
      </p>
      <p className="max-w-measure">
        אין בישראל <Term id="ביטוח פיקדונות">ביטוח פיקדונות</Term>. חוק משנת 2026 <Ruled id="REG-04">מחייב את שר האוצר ואת הנגיד לבחון</Ruled> אם צריך כזה. אם בנק נקלע לקשיים, הנגיד רשאי, באישור הממשלה, <Ruled id="REG-06">להכריז על ערבות לפיקדונות</Ruled>, אבל זו סמכות ולא חובה. על מה הפיקוח מגן בפועל, זו שאלה פתוחה <IdRef id="BANK OQ8" end="." />
      </p>
    </>
  ),
  termIds: ["ריבית", "חשבון עובר ושב", "פיקדון", "ריבית בנק ישראל", "מסלול השקעה", "תחנת יציאה", "יתרת זכות בחשבון", "קרן כספית", "מוצרי שוק הכסף", "ביטוח פיקדונות", "קופת גמל בניהול אישי", "כספי (שקלי)", "חשבון ניירות ערך", 'אג"ח ממשלתית קצרה', "לא צמוד", "תוכנית חיסכון", 'חש"ב', "קופת גמל להשקעה", "קרן השתלמות", "רשות שוק ההון ביטוח וחיסכון", "איגרת חוב"],
};
