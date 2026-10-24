// Guide prose for פיקדון (architecture 3.5: prose lives in content files; every figure is a Num).
// Written 2026-10-23 from the il-finance rules cited under each block (BANK, TXI, REG, SW, MF); same shape
// and register as kupat-gemel-lehashkaa.tsx. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import { Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout } from "../../components/ui";

export const content: GuideContent = {
  what: ({ figure }) => {
    const types = figure("BANK-14", "standard_deposit_types");
    return (
      <>
        <p className="max-w-measure">
          כסף שמפקידים בבנק לתקופה קצובה, מיום אחד ועד כמה שנים, והבנק משלם עליו ריבית: <Term id="ריבית קבועה">קבועה</Term>, שידועה מראש, או <Term id="ריבית משתנה">משתנה</Term>, שנגזרת <Term prefix="מ" id="ריבית הפריים">ריבית הפריים</Term>. בסוף התקופה הכסף חוזר לעו"ש או <Term id="חידוש אוטומטי">מתחדש אוטומטית</Term>, לפי מה שבחרתם.
        </p>
        <p className="max-w-measure">
          כל בנק חייב לפרסם טבלה אחידה של {types ? <Num value={types} /> : null} <Term id="סוגי הפיקדונות השקליים המקובלים">סוגי פיקדון מקובלים</Term>, עם <Term id="שיעור הריבית המוצעת">הריבית המוצעת</Term>, אפשרות <Term prefix="ה" id="שבירת פיקדון">שבירה</Term> <Term prefix="ו" id="תחנת יציאה">תחנות היציאה</Term>; כך משווים בין בנקים. הריבית בטבלה היא לשנה, לפני מס.
        </p>
        <p className="max-w-measure">
          פיקדון <Term id="לא צמוד">לא צמוד</Term> מחזיר את הקרן ועוד ריבית, גם אם המחירים עלו; פיקדון <Term id="צמוד למדד המחירים לצרכן">צמוד למדד</Term> מעדכן את הקרן לפי המדד, והריבית באה בנוסף. האם הקרן מוגנת כשהמדד יורד הוא תנאי של המוצר (<Term id="הבטחת קרן">הבטחת קרן</Term>), לא כלל.
        </p>
        <RulesLine ids={["BANK-13", "BANK-14", "BANK-25", "BANK-26", "BANK-05"]} />
      </>
    );
  },
  who: ({ figure }) => {
    const since = figure("BANK-21", "in_force_from");
    return (
      <>
        <p className="max-w-measure">
          כל הבנקים שברשימת בנק ישראל, בפיקוח המפקח על הבנקים. בנק לא רשאי לסרב סירוב בלתי סביר לקבל פיקדון. {since ? <>מאז <Num value={since} /> </> : null}אפשר לפתוח פיקדון שקלי גם בבנק שאינו שלכם, בלי לפתוח בו עו"ש, דרך <Term id="חשבון במערכת סגורה">חשבון במערכת סגורה</Term>: הכסף מגיע רק מהחשבון שלכם וחוזר רק אליו.
        </p>
        <RulesLine ids={["REG-01", "REG-03", "BANK-01", "BANK-21"]} />
      </>
    );
  },
  switchLine: "פיקדון רץ לא עובר לבנק אחר: הוא נפרע בסוף התקופה או בתחנת יציאה, או נשבר לפי תנאי הבנק, והריבית ממוסה כרגיל",
  switchRules: ["SW-32", "BANK-06"],
  termIds: [
    "ריבית קבועה",
    "ריבית משתנה",
    "ריבית הפריים",
    "חידוש אוטומטי",
    "סוגי הפיקדונות השקליים המקובלים",
    "שיעור הריבית המוצעת",
    "שבירת פיקדון",
    "קנס שבירה",
    "תחנת יציאה",
    "לא צמוד",
    "צמוד למדד המחירים לצרכן",
    "הבטחת קרן",
    "חשבון במערכת סגורה",
    "ביטוח פיקדונות",
    "פטור למעוט הכנסה",
    "מוצרי שוק הכסף",
  ],
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
          <span className="font-medium">שבירת פיקדון לפני הזמן: האתר לא מחשב אותה.</span> <Term prefix="ה" id="קנס שבירה">קנס</Term> הוא תנאי של הבנק, ואיך המס מתייחס לפיקדון שנשבר עוד פתוח. שאלה פתוחה: <bdi dir="ltr" className="whitespace-nowrap">TXI OQ14</bdi>.
        </Callout>
        <p className="max-w-measure text-sm text-muted-foreground">
          פיקדון צמוד פריים ממוסה כאן כפיקדון לא צמוד, לפי קריאה של הגדרת המדד בחוק ולא לפי פרסום רשמי. שאלה פתוחה: <bdi dir="ltr" className="whitespace-nowrap">TXI OQ2</bdi>.
        </p>
        <RulesLine ids={["BANK-06", "TXI-04"]} />
      </>
    );
  },
  risks: ({ figure }) => {
    const months = figure("REG-04", "examination_deadline_months");
    const proposed = figure("REG-05", "proposed_guarantee");
    return (
      <>
        <p className="max-w-measure">
          אין בישראל <Term id="ביטוח פיקדונות">ביטוח פיקדונות</Term>: אם בנק קורס, אין חוק שמחזיר לכם את הכסף. נגיד בנק ישראל רשאי למנות מנהל מורשה ולהעביר את הפיקדונות לבנק אחר, ובאישור הממשלה גם להכריז על ערבות; זו סמכות, לא זכות.
        </p>
        <p className="max-w-measure">
          חוק חדש מחייב לבחון {months ? <>תוך <Num value={months} /> חודשים </> : null}אם צריך ביטוח פיקדונות, והצעת חוק פרטית מציעה ערבות {proposed ? <>של <Num value={proposed} /> </> : null}בבנקים קטנים; היא רק הצעה.
        </p>
        <p className="max-w-measure">פיקדון בריבית משתנה זז עם הפריים: כשריבית בנק ישראל יורדת, גם הריבית שלכם. פיקדון לא צמוד לא מגן מעליית מחירים.</p>
        <RulesLine ids={["REG-04", "REG-05", "REG-06", "BANK-23", "BANK-25", "BANK-26"]} />
      </>
    );
  },
  use: () => (
    <>
      <p className="max-w-measure">
        כסף שאתם יודעים מתי תצטרכו, ורוצים עליו ריבית בלי תנודות: בוחרים תקופה שמתאימה למועד, או פיקדון עם תחנות יציאה אם לא בטוחים. בבנק הפיקדונות מוצגים יחד עם קרנות כספיות ומק״מ תחת <Term id="מוצרי שוק הכסף">מוצרי שוק הכסף</Term>, בלי להעדיף אף אחד, ושם משווים.
      </p>
      <p className="max-w-measure">
        פיקדון עדיף על קרן כספית יומית כשרוצים ריבית שנקבעת ביום ההפקדה: בקרן היומית התשואה לא ידועה מראש וזזה עם ריבית בנק ישראל, ובפיקדון בריבית קבועה היא ננעלת לכל התקופה.
      </p>
      <RulesLine ids={["BANK-15", "BANK-25", "MF-34", "MF-41"]} />
    </>
  ),
};

export { RuleRef };
