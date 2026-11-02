// Guide prose for פיקדון (architecture 3.5: prose lives in content files; every figure is a Num).
// Written 2026-10-23 from the il-finance rules cited under each block (BANK, TXI, REG, SW, MF); same shape
// and register as kupat-gemel-lehashkaa.tsx. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import { IdRef, Num, RuleRef, RulesLine, Term, VariesByCompany } from "../../components/provenance";
import { Link } from "react-router";
import { Callout, Sentence } from "../../components/kit";
import { shown } from "../../lib/review";

export const content: GuideContent = {
  what: ({ figure }) => {
    const types = figure("BANK-14", "standard_deposit_types");
    return (
      <>
        <p className="max-w-measure">
          כסף שמפקידים בבנק לתקופה קצובה, מיום אחד ועד כמה שנים, והבנק משלם עליו ריבית. הריבית <Term id="ריבית קבועה">קבועה</Term> וידועה מראש, או <Term id="ריבית משתנה">משתנה</Term>, כלומר ריבית עוגן ועוד או פחות מרווח ידוע מראש. בסוף התקופה הכסף חוזר לעו״ש או <Term id="חידוש אוטומטי">מתחדש אוטומטית</Term>, לפי מה שבחרתם.
        </p>
        {/* D30: "usually prime" is the Bank of Israel's word (BANK-47); each bank's definition of prime is its own term (BANK-34, nine banks) */}
        <p className="max-w-measure">
          <VariesByCompany ids={[{ rule: "BANK-34", companies: ["leumi", "hapoalim", "discount", "mercantile", "mizrahi-tefahot", "fibi", "massad", "yahav", "jerusalem"] }]} lead="העוגן הוא בדרך כלל ריבית הפריים, וכל בנק קובע אותה בעצמו" />
        </p>
        <p className="max-w-measure">
          פיקדון <Term id="לא צמוד">לא צמוד</Term> מחזיר את הקרן ועוד ריבית, גם אם המחירים עלו. פיקדון <Term id="צמוד למדד המחירים לצרכן">צמוד למדד</Term> מעדכן את הקרן לפי המדד, והריבית באה בנוסף. אם המדד יורד, מה שקורה לקרן תלוי בתנאי המוצר (<Term id="הבטחת קרן">הבטחת קרן</Term>); החוק לא קובע זאת.
        </p>
        <Sentence measure>
          כדי שאפשר יהיה להשוות, כל בנק חייב לפרסם טבלה אחידה של {types ? <Num value={types} /> : null} <Term id="סוגי הפיקדונות השקליים המקובלים">סוגי פיקדון מקובלים</Term>. לכל סוג מופיעים <Term id="שיעור הריבית המוצעת">הריבית המוצעת</Term>, לשנה ולפני מס, אפשרות <Term prefix="ה" id="שבירת פיקדון">שבירה</Term>, ובסוגים של שנה ומעלה גם <Term id="תחנת יציאה">תחנות היציאה</Term>.
        </Sentence>
        <RulesLine ids={["BANK-13", "BANK-14", "BANK-25", "BANK-46", "BANK-47", "BANK-26", "BANK-05"]} />
      </>
    );
  },
  who: ({ figure }) => {
    const since = figure("BANK-21", "in_force_from");
    return (
      <>
        <p className="max-w-measure">
          כל הבנקים שברשימת בנק ישראל, בפיקוח המפקח על הבנקים. בנק לא יכול לסרב לקבל פיקדון בלי סיבה סבירה.
        </p>
        <Sentence measure>
          {since ? <>מאז <Num value={since} /> </> : null}אפשר לפתוח פיקדון שקלי גם בבנק אחר, בלי לפתוח בו עו״ש, דרך <Term id="חשבון במערכת סגורה">חשבון במערכת סגורה</Term>: הכסף מגיע רק מהחשבון שלכם בבנק אחר וחוזר רק אליו. החובה לאפשר זאת לא חלה על בנקים קטנים וזעירים.
        </Sentence>
        <RulesLine ids={["REG-01", "REG-03", "BANK-01", "BANK-21"]} />
      </>
    );
  },
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
        <Sentence measure>
          למי שההכנסה שלו ושל בן או בת הזוג {ceiling ? <>עד <Num value={ceiling} /> </> : "נמוכה "}בשנה יש <Term id="פטור למעוט הכנסה">פטור למעוט הכנסה</Term>{deduction ? <>: עד <Num value={deduction} /> בשנה</> : null} מהריבית על פיקדונות ותוכניות חיסכון. מעל התקרה הפטור הולך וקטן. בדוח השנתי הוא מחושב אוטומטית, ובמהלך השנה מקבלים אותו בתיאום מס.
        </Sentence>
        <RulesLine ids={["TXI-20"]} />
        <Sentence measure>
          הפסד ממכירת ניירות ערך לא מתקזז מריבית על פיקדון. הוא מתקזז מרווח הון, ובאותה שנה גם מריבית או דיבידנד על ניירות ערך, ופיקדון בנקאי הוא לא נייר ערך <RuleRef id="TXI-17" />.
        </Sentence>
        <RulesLine ids={["TXI-17"]} />
        <Sentence measure>
          פיקדון צמוד פריים ממוסה כפיקדון לא צמוד, על כל הריבית: בחוק ״מדד״ הוא מדד המחירים לצרכן או שער מטבע, והפריים לא אחד מהם <RuleRef id="TXI-04" />.
        </Sentence>
        <Callout tone="blocked" className="max-w-measure">
          <span className="font-medium">שבירת פיקדון לפני הזמן: האתר לא מחשב אותה.</span> <Term prefix="ה" id="קנס שבירה">קנס</Term> הוא תנאי של כל בנק, ובטבלת הריביות מסומן לכל סוג פיקדון אם אפשר לשבור ואם יש קנס. הבנק מנכה מס מהריבית שהוא משלם בפועל, אבל מה קורה במס כשהשבירה פוגעת גם בקרן, לא נאמר בשום מקור. שאלה פתוחה (<IdRef id="TXI OQ14" />).
        </Callout>
        <RulesLine ids={["BANK-06", "TXI-07", "TXI-04"]} />
      </>
    );
  },
  risks: ({ figure }) => {
    const months = figure("REG-04", "examination_deadline_months");
    const proposed = figure("REG-05", "proposed_guarantee");
    return (
      <>
        <p className="max-w-measure">
          אין בישראל <Term id="ביטוח פיקדונות">ביטוח פיקדונות</Term>: אם בנק קורס, אין חוק שמחזיר לכם את הכסף. נגיד בנק ישראל יכול למנות לבנק מנהל מורשה ולהעביר את הפיקדונות לבנק אחר, ובאישור הממשלה גם להכריז על ערבות לפיקדונות. אלה סמכויות שלו, לא זכויות שלכם.
        </p>
        <Sentence measure>
          חוק משנת 2026 מחייב את שר האוצר ואת הנגיד לבחון {months ? <>תוך <Num value={months} /> חודשים </> : null}אם צריך ביטוח פיקדונות; זו חובת בדיקה, לא ביטוח. הצעת חוק פרטית מציעה ערבות {proposed ? <>של עד <Num value={proposed} /> </> : null}ללקוח בבנקים קטנים, אבל היא רק הצעה.
        </Sentence>
        <p className="max-w-measure">פיקדון בריבית משתנה זז עם ריבית העוגן שלו. פיקדון לא צמוד לא מגן מפני עליית מחירים.</p>
        <RulesLine ids={["REG-04", "REG-05", "REG-06", "BANK-23", "BANK-25", "BANK-26"]} />
      </>
    );
  },
  use: () => (
    <>
      <p className="max-w-measure">
        כסף שיודעים מתי יצטרכו אותו, ורוצים עליו ריבית בלי תנודות. בוחרים תקופה שמתאימה למועד, או פיקדון עם תחנות יציאה אם המועד לא בטוח. כדי להשוות, בבנק הפיקדונות מוצגים יחד עם קרנות כספיות ומק״מ תחת <Term id="מוצרי שוק הכסף">מוצרי שוק הכסף</Term>, בלי העדפה של אף מוצר.
      </p>
      <p className="max-w-measure">
        פיקדון עדיף על קרן כספית יומית כשרוצים לדעת את הריבית ביום ההפקדה: בפיקדון בריבית קבועה היא ננעלת לכל התקופה, ובקרן היומית התשואה לא ידועה מראש וזזה עם ריבית בנק ישראל.
      </p>
      <RulesLine ids={["BANK-15", "BANK-25", "MF-34", "MF-41"]} />
      {/* NEW 2026-10-24 (scenario audit 7): the door from the guide to the page that checks a bank's offer; hidden while that
          page is held for review (lib/review.ts) */}
      {shown("/idle-cash") && (
        <p className="max-w-measure">
          קיבלתם הצעה מהבנק?{" "}
          <Link to="/idle-cash" className="text-link hover:underline">
            בדקו אותה בעמוד כסף שיושב בעו״ש
          </Link>
          .
        </p>
      )}
    </>
  ),
};

export { RuleRef };
