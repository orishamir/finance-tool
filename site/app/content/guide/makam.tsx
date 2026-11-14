// Guide prose for מק״מ (architecture 3.5: prose lives in content files; every figure is a Num). Written
// from the rule base (GOV, TXI, TXS, BANK, BRK, REG); each block ends with the rules it rests
// on. NEW copy for the founder to review (docs/copy.md holds only labels).
import { Link } from "react-router";
import type { GuideContent } from "./types";
import { YearOf } from "./year";
import { fmt } from "../../lib/format";
import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";

export const content: GuideContent = {
  what: ({ figure }) => {
    const series = figure("GOV-22", "series_outstanding");
    return (
      <>
        <p className="max-w-measure">
          המק״מ לא משלם <Term id="ריבית">ריבית</Term> ולא <Term id="צמוד למדד המחירים לצרכן">צמוד למדד</Term>: קונים אותו במחיר נמוך <Term prefix="מה" id="שווי נקוב">שווי הנקוב</Term>, ובמועד <Term prefix="ה" id="פדיון">פדיון</Term> המדינה משלמת את השווי הנקוב במלואו. ההפרש הוא הרווח שלכם, ובמס הוא נחשב <Term id="דמי ניכיון">דמי ניכיון</Term>, כלומר ריבית.
        </p>
        <Sentence measure>
          בכל חודש מונפקת סדרה חדשה לכשנה, ולכן בכל רגע יש {series ? <Num value={series} /> : null} סדרות בשוק, עם מועדי פדיון שונים. מי שמחזיק עד הסוף יודע כבר ביום הקנייה מה <Term prefix="ה" id="תשואה לפדיון">תשואה לפדיון</Term> שלו.
        </Sentence>
        <RulesLine ids={["GOV-01", "GOV-03", "GOV-22", "GOV-23", "TXI-01"]} />
      </>
    );
  },
  who: ({ figure }) => {
    const minOrder = figure("GOV-24", "min_order_makam_face_value");
    const lastDays = figure("GOV-24", "last_trading_days");
    return (
      <>
        <p className="max-w-measure">
          קונים מק״מ דרך חשבון ניירות ערך בבנק או <Term prefix="ב" id="בית השקעות">בית השקעות</Term> שהוא <Term id="חבר בורסה">חבר בורסה</Term>: <Term prefix="ב" id="בורסה">בורסה</Term>, בכל יום מסחר, או בהזמנה למכרז ההנפקה החודשי. בנק שאפשר לקנות דרכו מק״מ חייב להציג אותו ליד הפיקדונות והקרנות הכספיות, תחת הכותרת <Term id="מוצרי שוק הכסף">מוצרי שוק הכסף</Term>, בלי להעדיף אף מוצר.
        </p>
        <Sentence measure>
          בבורסה, במסחר הרציף, פקודה היא של {minOrder ? <Num value={minOrder} display={fmt.nisWhole(Number(minOrder.value))} /> : null} שווי נקוב לפחות. בשלבים אחרים של יום המסחר, כמו לפני הפתיחה ולפני הנעילה, הכללים מאפשרים פקודה של יחידת מסחר אחת, אבל גודל היחידה של המק״מ לא כתוב במדריך המסחר. שאלה פתוחה <IdRef id="GOV OQ7" end="." /> הבנק או בית ההשקעות יכולים לקבוע בתעריפון מינימום משלהם. יום המסחר האחרון בסדרה הוא {lastDays ? <Num value={lastDays} /> : null} ימי מסחר לפני הפדיון.
        </Sentence>
        <p className="max-w-measure">
          <Term prefix="ה" id="מנפיק">מנפיק</Term> של המק״מ הוא <Term id="בנק ישראל">בנק ישראל</Term>, והוא גם מנהל אותו. במכרז עצמו מציעים ישירות רק חברי <Term id="מסלקת הבורסה">מסלקת הבורסה</Term>. איך הזמנה של אדם פרטי מגיעה אליו, באיזה סכום מינימלי ובאיזו עמלה, עוד לא מתועד. שאלה פתוחה <IdRef id="GOV OQ2" end="." />
        </p>
        <RulesLine ids={["GOV-22", "GOV-05", "GOV-24", "BANK-15", "BRK-32"]} />
      </>
    );
  },
  // the run buys makam with every monthly deposit, whatever its size; the exchange's minimum order may not allow that (GOV-24, GOV OQ7)
  chartNote: ({ figure }) => {
    const minOrder = figure("GOV-24", "min_order_makam_face_value");
    return minOrder ? (
      <>
        הגרף קונה מק״מ בכל הפקדה, גם בסכום קטן. בבורסה, במסחר הרציף, פקודה היא של <Num value={minOrder} display={fmt.nisWhole(Number(minOrder.value))} /> שווי נקוב לפחות, ולכן ייתכן שהפקדה קטנה מזה לא תקנה מק״מ בפועל.
      </>
    ) : null;
  },
  termIds: ["שווי נקוב", "פדיון", "דמי ניכיון", "ריבית", "תשואה לפדיון", "מוצרי שוק הכסף", "רווח הון ריאלי", "ניכוי מס במקור", "תשואה ברוטו", "דמי ניהול פיקדון ניירות ערך", "אג\"ח סחיר", "אג\"ח ממשלתית קצרה", "לא צמוד", "איגרת חוב", "דוח שנתי", "רווח הון", "מסלקת הבורסה", "בורסה", "חבר בורסה", "קופת גמל בניהול אישי", "דמי חשבון קבועים", "הרווח הריאלי", "קרנות כספיות יומיות", "מנהל קרן", "קרן כספית", "קנס שבירה", "פיקדון", "צמוד למדד המחירים לצרכן", "עמלת קנייה ומכירה", "מס רווחי הון", "אינפלציה"],
  afterTax: ({ figure }) => {
    const rate = figure("TXI-11", "rate");
    const saleRate = figure("TXI-12", "rate");
    const sixty = figure("TXG-04", "age");
    const ceiling = figure("TXG-17", "securities_proceeds_ceiling");
    const interestCeiling = figure("TXG-17", "interest_ceiling");
    return (
      <>
        <Sentence measure>
          מי שמחזיק עד הפדיון משלם מס הכנסה של {rate ? <Num value={rate} /> : null} על ההפרש, כי ההפרש הוא ריבית והמס עליה קבוע.
        </Sentence>
        <Sentence measure>
          מי שמוכר לפני הפדיון משלם {saleRate ? <Num value={saleRate} /> : null} מכל הרווח, בלי ניכוי של <Term prefix="ה" id="אינפלציה">אינפלציה</Term>: הרווח כולו נחשב <Term id="רווח הון ריאלי">רווח הון ריאלי</Term>. בחוק השיעור הזה הוא תקרה, וזה גם השיעור שהבנק מנכה מהרווח. איך מחיר המכירה מתחלק בין ניכיון <Term prefix="ל" id="רווח הון">רווח הון</Term>, עוד לא נמצא.
        </Sentence>
        <Sentence measure>
          בשני המקרים הבנק או חבר הבורסה מבצעים <Term id="ניכוי מס במקור">ניכוי מס במקור</Term>. מי שכל המס שלו נוכה במקור, והסכומים מתחת לתקרות, לא חייב <Term prefix="ב" id="דוח שנתי">דוח שנתי</Term> רק בגלל המק״מ: {interestCeiling ? <>עד <Num value={interestCeiling} display={fmt.nisWhole(Number(interestCeiling.value))} /> ריבית בשנה</> : null}{ceiling ? <> ועד <Num value={ceiling} display={fmt.nisWhole(Number(ceiling.value))} /> תמורת מכירות בשנה</> : null}<YearOf v={interestCeiling ?? ceiling} plural />.
        </Sentence>
        <Callout tone="caution" className="max-w-measure">
          <span className="font-medium">מקור אחד סותר.</span> שורה במדריכי <Term id="רשות המסים">רשות המסים</Term>, בתוך סעיף על <Term id="איגרת חוב">איגרות חוב</Term> ישנות, נוקבת בשיעור אחר על דמי ניכיון של מק״מ. בפקודת מס הכנסה השיעור על ריבית מנכס <Term id="לא צמוד">לא צמוד</Term> הוא {rate ? <Num value={rate} /> : null}, והמדריך עצמו אומר שהחוק גובר, ולכן האתר מחשב לפי החוק. שאלה פתוחה <IdRef id="TXI OQ3" end="." />
        </Callout>
        <Callout tone="blocked" className="max-w-measure">
          <span className="font-medium">מגיל {sixty ? <Num value={sixty} /> : null}.</span> ההקלה במס לפי מדרגות נמוכות חלה על שיעורים שהם תקרה. השיעור על רווח ממכירה לפני הפדיון הוא תקרה, ובהכנסה נמוכה המס עליו יכול להיות נמוך יותר, אבל האתר עוד לא מחשב את זה. השיעור על ריבית לא צמודה מנוסח כשיעור קבוע, ולא נמצאה הכרעה של רשות המסים, ולכן האתר לא מפחית אותו. שאלה פתוחה <IdRef id="TXI OQ9" end="." />
        </Callout>
        <RulesLine ids={["TXI-11", "TXI-12", "TXI-13", "TXS-05", "TXG-17", "TXG-04", "TXI-19"]} />
      </>
    );
  },
  risks: () => (
    <>
      <p className="max-w-measure">
        את השווי הנקוב משלמת המדינה מהכנסותיה הכלליות, לא הבנק ולא <Term prefix="ה" id="ברוקר">ברוקר</Term>. בנק ישראל מתאר את המק״מ כהשקעה שנחשבת חסרת סיכון, עם תשואה ידועה מראש, למי שמחזיק עד הפדיון.
      </p>
      <p className="max-w-measure">
        מי שמוכר קודם מקבל את מחיר השוק של אותו יום, שיכול להיות נמוך ממחיר הקנייה. והמק״מ לא צמוד למדד: אם המחירים עולים יותר מהתשואה, הכסף שווה פחות בסוף.
      </p>
      <p className="max-w-measure">
        {/* D6: how the account keeps the paper is the account's, said once on its page, not copied here */}
        הנייר מוחזק בחשבון ניירות ערך. איך החשבון שומר על נכסי הלקוחות, ומה קורה אם הבנק או בית ההשקעות קורסים, מוסבר בעמוד של <Link to="/guide/brokerage-account" className="text-link hover:underline">חשבון ניירות ערך</Link>.
      </p>
      <RulesLine ids={["GOV-02", "GOV-22", "GOV-17", "GOV-03"]} />
    </>
  ),
  use: ({ figure }) => {
    const makamMonths = figure("MF-29", "max_makam_term_months");
    const rate = figure("TXI-11", "rate");
    const fundRate = figure("TXS-12", "rate");
    return (
    <>
      <p className="max-w-measure">
        כסף שצריך לשבת כמה חודשים עד שנה, כשרוצים <Term id="תשואה">תשואה</Term> ידועה מראש ואפשרות למכור בכל יום מסחר.
      </p>
      <p className="max-w-measure">
        מול <Term id="פיקדון">פיקדון</Term> <Term id="לא צמוד">לא צמוד</Term> בבנק: כשמחזיקים עד הסוף, בשניהם המס הוא שיעור קבוע מהריבית הנומינלית. מק״מ שנמכר לפני הפדיון ממוסה על <Term prefix="ה" id="רווח הון">רווח הון</Term>, בשיעור שהוא תקרה, ובפיקדון <Term id="צמוד למדד המחירים לצרכן">צמוד למדד</Term> המס הוא רק על הריבית שמעל עליית המדד. במק״מ אין נעילה ואין <Term id="קנס שבירה">קנס שבירה</Term>, ובנק לא יכול לגבות עליו <Term id="דמי ניהול פיקדון ניירות ערך">דמי ניהול פיקדון ניירות ערך</Term>; הכלל הזה חל על בנקים בלבד. מצד שני יש עמלת קנייה, ועמלת מכירה למי שלא מחכה לפדיון. <Term prefix="ה" id="תשואה ברוטו">תשואה ברוטו</Term> שמוצגת בבנק היא לפני <Term prefix="ה" id="עמלה">עמלות</Term> והמס.
      </p>
      <p className="max-w-measure">
        מול <Term id="קרן כספית">קרן כספית</Term>: כשיש לבנק הסכם הפצה עם <Term id="מנהל קרן">מנהל הקרן</Term>, הבנק לא גובה עמלת קנייה על הקרן. <Term id="קרנות כספיות יומיות">קרן כספית יומית</Term> פטורה נזילה בכל יום מסחר, והמס בה נגבה רק בפדיון ורק על <Term id="הרווח הריאלי">הרווח הריאלי</Term>. מי מנצח תלוי <Term prefix="ב" id="אינפלציה">אינפלציה</Term> ובעלויות. מי שמחזיק מק״מ עד הפדיון משלם מס הכנסה של {rate ? <Num value={rate} /> : null} מכל ההפרש, ובקרן כספית פטורה משלמים <Term id="מס רווחי הון">מס רווחי הון</Term> של עד {fundRate ? <Num value={fundRate} /> : null} רק מהרווח שמעבר לאינפלציה. כשהאינפלציה נמוכה, המס במק״מ נמוך יותר, וכשהיא גבוהה, בקרן. מעבר למס, בקרן יורדים דמי הניהול שלה, ובמק״מ העמלות של החשבון. בסכומים קטנים או בתקופות קצרות מאוד, עמלת המינימום במק״מ יכולה להכריע.
      </p>
      <p className="max-w-measure">
        <Term prefix="ל" id={'אג"ח ממשלתית קצרה'}>אג״ח ממשלתית קצרה</Term> של משרד האוצר יש מבנה דומה, אבל היא <Term id={'אג"ח סחיר'}>נייר סחיר</Term> נפרד, בלי הפטור מדמי ניהול הפיקדון.
      </p>
      <p className="max-w-measure">
        <Term id="עמלת קנייה ומכירה">עמלות הקנייה והמכירה</Term>, <Term prefix="ו" id="דמי חשבון קבועים">דמי חשבון קבועים</Term> אם החברה גובה אותם, נקבעים בתעריפון של כל חברה. ראו במדריך: <Link to="/guide/brokerage-account" className="text-link hover:underline">חשבון ניירות ערך</Link>.
      </p>
      <RulesLine ids={["TXI-03", "TXI-11", "TXI-12", "TXI-05", "TXI-02", "BANK-18", "BRK-16", "BRK-17", "BANK-15", "MF-26", "MF-35", "TXS-12", "GOV-15", "GOV-17"]} />
      {/* D6: makam's exposure page folded into this one; what it said about holding makam without buying it */}
      <Sentence measure>
        אפשר להחזיק מק״מ גם בעקיפין: <Link to="/guide/money-market-fund-daily" className="text-link hover:underline">קרן כספית</Link> יכולה להחזיק מק״מ שנותרו לו עד {makamMonths ? <Num value={makamMonths} /> : null} חודשים לפדיון, לצד איגרות חוב קצרות, פיקדונות ומזומן. בחשבון <Term prefix="ב" id="קופת גמל בניהול אישי">ניהול אישי</Term> קונים אותו ישירות, כמו בחשבון ניירות ערך.
      </Sentence>
      <RulesLine ids={["MF-29", "IRA-11"]} />
    </>
    );
  },
};

export { RuleRef };
