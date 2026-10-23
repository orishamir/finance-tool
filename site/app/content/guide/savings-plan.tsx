// Guide prose for תכנית חיסכון (architecture 3.5: prose lives in content files; every figure is a Num).
// Written 2026-10-23 from the il-finance rules cited under each block (BANK, BPN, TXI, REG, SW, MF); same
// shape and register as kupat-gemel-lehashkaa.tsx. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import { Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout } from "../../components/ui";

export const content: GuideContent = {
  what: () => (
    <>
      <p className="max-w-measure">
        <Term id="תכנית חיסכון">תכנית חיסכון</Term> היא פיקדון שמפקידים אליו מדי פעם, לרוב סכום קבוע כל חודש ב<Term id="פיקדון בהוראת קבע">הוראת קבע</Term>, לתקופה של יותר משנה. ההסכם חייב לקבוע את לוח ההפקדות ואת הגבולות על הסכומים והמועדים, ואת הריבית: קבועה, או <Term id="ריבית משתנה">משתנה</Term> לפי <Term id="ריבית הפריים">הפריים</Term>; לא צמודה או <Term id="צמוד למדד המחירים לצרכן">צמודה למדד</Term>. אין הוראה של בנק ישראל שמיוחדת לתוכניות חיסכון, וכל בנק בונה אותן אחרת.
      </p>
      <p className="max-w-measure">
        בתוכניות שנקראו ברמת החוזה, בבנק אחד, <Term id="תחנת יציאה">תחנות היציאה</Term> נספרות מתחילת התוכנית וחלות על כל ההפקדות, ומושכים בהן רק את כל הסכום בבת אחת.
      </p>
      <RulesLine ids={["BANK-28", "BANK-25", "BANK-26", "BPN-10"]} />
    </>
  ),
  who: () => (
    <>
      <p className="max-w-measure">
        כל הבנקים שברשימת בנק ישראל, בפיקוח המפקח על הבנקים. בנק לא רשאי לסרב סירוב בלתי סביר לקבל פיקדון. ההפקדות עוברות לתוכנית מהעו"ש, לרוב בהוראת קבע חודשית.
      </p>
      <RulesLine ids={["REG-01", "REG-03", "BANK-01", "BANK-28"]} />
    </>
  ),
  switchLine: "תוכנית רצה לא עוברת לבנק אחר: מושכים בתחנת יציאה או בסוף התקופה, או שוברים לפי תנאי הבנק, והריבית ממוסה כרגיל",
  switchRules: ["SW-32", "BANK-06"],
  termIds: ["תכנית חיסכון", "פיקדון בהוראת קבע", "ריבית משתנה", "ריבית הפריים", "צמוד למדד המחירים לצרכן", "תחנת יציאה", "שבירת פיקדון", "פטור למעוט הכנסה"],
  afterTax: ({ figure }) => {
    const ceiling = figure("TXI-20", "favoured_ceiling");
    const deduction = figure("TXI-20", "deduction");
    return (
      <>
        <p className="max-w-measure">
          למי שההכנסה שלו ושל בן או בת הזוג בשנה {ceiling ? <>עד <Num value={ceiling} /> </> : "נמוכה "}יש <Term id="פטור למעוט הכנסה">פטור למעוט הכנסה</Term>{deduction ? <> של עד <Num value={deduction} /> בשנה</> : null} מהריבית על פיקדונות ותוכניות חיסכון. בדוח השנתי הוא מחושב אוטומטית; במהלך השנה מקבלים אותו דרך תיאום מס.
        </p>
        <RulesLine ids={["TXI-20"]} />
        <Callout tone="blocked" className="max-w-measure">
          <span className="font-medium"><Term id="שבירת פיקדון">שבירה</Term> של תוכנית חיסכון: האתר לא מחשב אותה.</span> איך בנק מתמחר שבירה, האם לכל הפקדה חודשית נעילה משלה, ואיך המס מתייחס לתוכנית שנשברה עוד פתוח. שאלות פתוחות: <bdi dir="ltr" className="whitespace-nowrap">BANK OQ12</bdi>, <bdi dir="ltr" className="whitespace-nowrap">TXI OQ14</bdi>.
        </Callout>
        <RulesLine ids={["BANK-06", "BANK-28"]} />
      </>
    );
  },
  risks: ({ figure }) => {
    const months = figure("REG-04", "examination_deadline_months");
    const proposed = figure("REG-05", "proposed_guarantee");
    return (
      <>
        <p className="max-w-measure">
          אין בישראל ביטוח פיקדונות: אם בנק קורס, אין חוק שמחזיר לכם את הכסף. נגיד בנק ישראל רשאי למנות מנהל מורשה ולהעביר את הפיקדונות לבנק אחר, ובאישור הממשלה גם להכריז על ערבות; זו סמכות, לא זכות.
        </p>
        <p className="max-w-measure">
          חוק חדש מחייב לבחון {months ? <>תוך <Num value={months} /> חודשים </> : null}אם צריך ביטוח פיקדונות, והצעת חוק פרטית מציעה ערבות {proposed ? <>של <Num value={proposed} /> </> : null}בבנקים קטנים; היא רק הצעה.
        </p>
        <p className="max-w-measure">תוכנית בריבית משתנה זזה עם הפריים לאורך כל השנים; תוכנית לא צמודה לא מגינה מעליית מחירים לאורך תקופה ארוכה.</p>
        <RulesLine ids={["REG-04", "REG-05", "REG-06", "BANK-23", "BANK-25", "BANK-26"]} />
      </>
    );
  },
  use: () => (
    <>
      <p className="max-w-measure">
        חיסכון למטרה עם תאריך, שבונים אותו מהמשכורת כל חודש בלי לחשוב: הוראת הקבע עושה את העבודה, וכל ההפקדות מקבלות את תנאי התוכנית.
      </p>
      <p className="max-w-measure">
        מול פיקדון רגיל, תוכנית חיסכון עדיפה כשמפקידים כל חודש: לא פותחים פיקדון חדש בכל פעם, ותחנות היציאה נספרות מתחילת התוכנית. מול קרן כספית יומית היא עדיפה כשרוצים ריבית שנקבעת מראש לכל התקופה: בקרן היומית התשואה זזה עם ריבית בנק ישראל.
      </p>
      <RulesLine ids={["BANK-28", "BPN-10", "BANK-25", "MF-34"]} />
    </>
  ),
};

export { RuleRef };
