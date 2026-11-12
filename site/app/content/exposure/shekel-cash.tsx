// Exposure prose for מזומן שקלי (flows 6.6). Written from the rule base (BANK, TXI, MF, REG, CAT,
// BRK); each block ends with the rules it rests on. NEW copy for the founder to review.
import { Link } from "react-router";
import type { ExposureContent } from "../guide/types";
import type { GlanceItem } from "../../components/guide/sections";
import { RuleRows } from "../../components/guide/sections";
import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";
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
          כל בנק חייב לפרסם טבלה אחידה של סוגי הפיקדונות והריבית עליהם. <Term id="בנק ישראל">בנק ישראל</Term> מפרסם כל חודש את הריבית ששילם כל בנק בפועל. על ריבית מפיקדון <Term prefix="ש" id="לא צמוד">לא צמוד למדד</Term> משלמים מס הכנסה של {unlinked ? <Num value={unlinked} /> : null} מכל הריבית, והבנק מנכה אותו בתשלום.
        </Sentence>
        {/* D6: a money-market fund holds more than cash, so it has its own entry and page */}
        <p className="max-w-measure">
          <Link to="/guide/money-market-fund-daily" className="text-link hover:underline">קרן כספית</Link> היא דרך אחרת להחזיק כסף לטווח קצר, אבל היא לא מזומן. לפי החוק היא מחזיקה גם <Link to="/guide/makam" className="text-link hover:underline">מק״מ</Link> <Term prefix="ו" id={'אג"ח ממשלתית קצרה'}>איגרות חוב קצרות</Term> בדירוג גבוה, לצד פיקדונות ומזומן. גם המס בה נגבה אחרת. לכל אחת מהן עמוד משלה.
        </p>
        <RulesLine ids={["BANK-09", "BANK-13", "BANK-14", "BANK-22", "BANK-25", "MF-07", "MF-29", "MF-34", "MF-35", "TXI-03", "TXI-07", "TXI-08"]} />
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
              הכסף הפנוי יושב <Term prefix="ב" id="יתרת זכות בחשבון">יתרת זכות</Term>. אצל <Term id="חש&quot;ב">חש״ב</Term> הריבית עליה היא שורה בתעריפון עם תנאים.
            </>
          ),
          rules: ["BRK-25"],
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
              לפי רשימת מסלולי ההשקעה של <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון</Term> הוא מחזיק נכסים שקליים לא צמודים: פיקדונות, מלוות ממשלה, הלוואות <Term prefix="ו" id="איגרת חוב">איגרות חוב</Term> בשקלים <RuleRef id="CAT-23" end="." />
            </>
          ),
          rules: ["CAT-23", "CAT-20"],
        },
        {
          id: "ira",
          label: <Term prefix="ב" id="קופת גמל בניהול אישי">ניהול אישי</Term>,
          value: "מותר להחזיק פיקדונות.",
          rules: ["IRA-11"],
        },
      ]}
    />
  ),
  risks: () => (
    <>
      <p className="max-w-measure">
        הסיכון העיקרי הוא שהמחירים עולים מהר מהריבית, וכוח הקנייה של הכסף נשחק. בפיקדון לתקופה הכסף נעול עד המועד או עד <Term id="תחנת יציאה">תחנת היציאה</Term>. שבירה לפני כן תלויה בהסכמת הבנק ובמחיר שהוא קובע.
      </p>
      <p className="max-w-measure">
        אין בישראל <Term id="ביטוח פיקדונות">ביטוח פיקדונות</Term>. חוק משנת 2026 מחייב את שר האוצר ואת הנגיד לבחון אם צריך כזה. אם בנק נקלע לקשיים, הנגיד רשאי, באישור הממשלה, להכריז על ערבות לפיקדונות, אבל זו סמכות ולא חובה. על מה הפיקוח מגן בפועל, זו שאלה פתוחה <IdRef id="BANK OQ8" end="." />
      </p>
      <RulesLine ids={["TXI-25", "BANK-27", "BANK-06", "REG-04", "REG-06", "TXI-20"]} />
    </>
  ),
  termIds: ["ריבית", "חשבון עובר ושב", "פיקדון", "ריבית בנק ישראל", "מסלול השקעה", "תחנת יציאה", "יתרת זכות בחשבון", "קרן כספית", "מוצרי שוק הכסף", "ביטוח פיקדונות", "קופת גמל בניהול אישי", "כספי (שקלי)", "חשבון ניירות ערך", 'אג"ח ממשלתית קצרה', "לא צמוד", "תוכנית חיסכון", 'חש"ב', "קופת גמל להשקעה", "קרן השתלמות", "רשות שוק ההון ביטוח וחיסכון", "איגרת חוב"],
};
