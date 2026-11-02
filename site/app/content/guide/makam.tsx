// Guide prose for מק״מ (architecture 3.5: prose lives in content files; every figure is a Num). Written
// 2026-10-23 from the rule base (GOV, TXI, TXS, BANK, BRK, REG); each block ends with the rules it rests
// on. NEW copy for the founder to review (docs/copy.md holds only labels).
import { Link } from "react-router";
import type { GuideContent } from "./types";
import { fmt } from "../../lib/format";
import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";

export const content: GuideContent = {
  what: ({ figure }) => {
    const series = figure("GOV-22", "series_outstanding");
    return (
      <>
        <p className="max-w-measure">
          הלוואה קצרה למדינה, לתקופה של עד שנה, שבנק ישראל מוכר לציבור. המק״מ לא משלם ריבית ולא צמוד למדד: קונים אותו במחיר נמוך <Term prefix="מה" id="שווי נקוב">שווי הנקוב</Term>, ובמועד <Term prefix="ה" id="פדיון">פדיון</Term> המדינה משלמת את השווי הנקוב במלואו. ההפרש הוא הרווח שלכם, ובמס הוא נחשב <Term id="דמי ניכיון">דמי ניכיון</Term>, כלומר <Term id="ריבית">ריבית</Term>.
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
          קונים מק״מ דרך חשבון ניירות ערך בבנק או בבית השקעות שהוא חבר בורסה: בבורסה, בכל יום מסחר, או בהזמנה למכרז ההנפקה החודשי. בנק שאפשר לקנות דרכו מק״מ חייב להציג אותו ליד הפיקדונות והקרנות הכספיות, תחת הכותרת <Term id="מוצרי שוק הכסף">מוצרי שוק הכסף</Term>, בלי להעדיף אף מוצר.
        </p>
        <Sentence measure>
          בבורסה, במסחר הרציף, פקודה היא של {minOrder ? <Num value={minOrder} display={fmt.nisWhole(Number(minOrder.value))} /> : null} שווי נקוב לפחות. בשלבים אחרים של יום המסחר, כמו לפני הפתיחה ולפני הנעילה, הכללים מאפשרים פקודה קטנה יותר, אבל יחידת המסחר של המק״מ עוד לא נמצאה. שאלה פתוחה (<IdRef id="GOV OQ7" />). הבנק או בית ההשקעות יכולים לקבוע בתעריפון מינימום משלהם. יום המסחר האחרון בסדרה הוא {lastDays ? <Num value={lastDays} /> : null} ימי מסחר לפני הפדיון.
        </Sentence>
        <p className="max-w-measure">
          את המק״מ מנפיק ומנהל בנק ישראל. במכרז עצמו מציעים ישירות רק חברי מסלקת הבורסה. איך הזמנה של אדם פרטי מגיעה אליו, באיזה סכום מינימלי ובאיזו עמלה, עוד לא מתועד. שאלה פתוחה (<IdRef id="GOV OQ2" />).
        </p>
        <RulesLine ids={["GOV-22", "GOV-05", "GOV-24", "BANK-15", "BRK-32"]} />
      </>
    );
  },
  termIds: ["שווי נקוב", "פדיון", "דמי ניכיון", "ריבית", "תשואה לפדיון", "מוצרי שוק הכסף", "רווח הון ריאלי", "ניכוי מס במקור", "תשואה ברוטו", "דמי ניהול פיקדון ניירות ערך", "אג\"ח סחיר", "אג\"ח ממשלתית קצרה"],
  afterTax: ({ figure }) => {
    const rate = figure("TXI-11", "rate");
    const saleRate = figure("TXI-12", "rate");
    const sixty = figure("TXG-04", "age");
    const ceiling = figure("TXG-17", "securities_proceeds_ceiling");
    const interestCeiling = figure("TXG-17", "interest_ceiling");
    return (
      <>
        <Sentence measure>
          מי שמחזיק עד הפדיון משלם {rate ? <Num value={rate} /> : null} על ההפרש, כי ההפרש הוא ריבית והמס עליה קבוע.
        </Sentence>
        <Sentence measure>
          מי שמוכר לפני הפדיון משלם עד {saleRate ? <Num value={saleRate} /> : null} מכל הרווח, בלי ניכוי של האינפלציה: הרווח כולו נחשב <Term id="רווח הון ריאלי">רווח הון ריאלי</Term>. איך מחיר המכירה מתחלק בין ניכיון לרווח הון, עוד לא נמצא.
        </Sentence>
        <Sentence measure>
          בשני המקרים הבנק או חבר הבורסה מבצעים <Term id="ניכוי מס במקור">ניכוי מס במקור</Term>. מי שכל המס שלו נוכה במקור, והסכומים מתחת לתקרות, לא חייב בדוח שנתי רק בגלל המק״מ: {interestCeiling ? <>עד <Num value={interestCeiling} display={fmt.nisWhole(Number(interestCeiling.value))} /> ריבית בשנה</> : null}{ceiling ? <> ועד <Num value={ceiling} display={fmt.nisWhole(Number(ceiling.value))} /> תמורת מכירות בשנה</> : null}.
        </Sentence>
        <Callout tone="caution" className="max-w-measure">
          <span className="font-medium">מקור אחד סותר.</span> שורה במדריכי רשות המסים, בתוך סעיף על איגרות חוב ישנות, נוקבת בשיעור אחר על דמי ניכיון של מק״מ. בפקודת מס הכנסה השיעור על ריבית מנכס לא צמוד הוא {rate ? <Num value={rate} /> : null}, והמדריך עצמו אומר שהחוק גובר, ולכן האתר מחשב לפי החוק. שאלה פתוחה (<IdRef id="TXI OQ3" />).
        </Callout>
        <Callout tone="blocked" className="max-w-measure">
          <span className="font-medium">מגיל {sixty ? <Num value={sixty} /> : null}.</span> ההקלה במס לפי מדרגות נמוכות חלה על שיעורים שהם תקרה. השיעור על ריבית לא צמודה מנוסח כשיעור קבוע, ולא נמצאה הכרעה של רשות המסים, ולכן האתר לא מפחית אותו. שאלה פתוחה (<IdRef id="TXI OQ9" />).
        </Callout>
        <RulesLine ids={["TXI-11", "TXI-12", "TXI-13", "TXS-05", "TXG-17", "TXG-04", "TXI-19"]} />
      </>
    );
  },
  risks: () => (
    <>
      <p className="max-w-measure">
        את השווי הנקוב משלמת המדינה מהכנסותיה הכלליות, לא הבנק ולא הברוקר. בנק ישראל מתאר את המק״מ כהשקעה שנחשבת חסרת סיכון, עם תשואה ידועה מראש, למי שמחזיק עד הפדיון.
      </p>
      <p className="max-w-measure">
        מי שמוכר קודם מקבל את מחיר השוק של אותו יום, שיכול להיות נמוך ממחיר הקנייה. והמק״מ לא צמוד למדד: אם המחירים עולים יותר מהתשואה, הכסף שווה פחות בסוף.
      </p>
      <p className="max-w-measure">
        {/* D6 (2026-10-26): how the account keeps the paper is the account's, said once on its page, not copied here */}
        הנייר מוחזק בחשבון ניירות ערך. איך החשבון שומר על נכסי הלקוחות, ומה קורה אם הבנק או בית ההשקעות קורסים, מוסבר בעמוד של <Link to="/guide/brokerage-account" className="text-link hover:underline">חשבון ניירות ערך</Link>.
      </p>
      <RulesLine ids={["GOV-02", "GOV-22", "GOV-17", "GOV-03"]} />
    </>
  ),
  use: ({ figure }) => {
    const makamMonths = figure("MF-29", "max_makam_term_months");
    return (
    <>
      <p className="max-w-measure">
        כסף שצריך לשבת כמה חודשים עד שנה, כשרוצים תשואה ידועה מראש ואפשרות למכור בכל יום מסחר.
      </p>
      <p className="max-w-measure">
        מול פיקדון בבנק: בשניהם המס הוא שיעור קבוע מהריבית הנומינלית. במק״מ אין נעילה ואין קנס שבירה, ובנק לא יכול לגבות עליו <Term id="דמי ניהול פיקדון ניירות ערך">דמי ניהול פיקדון ניירות ערך</Term>; הכלל הזה חל על בנקים בלבד. מצד שני יש עמלת קנייה, ועמלת מכירה למי שלא מחכה לפדיון. <Term prefix="ה" id="תשואה ברוטו">תשואה ברוטו</Term> שמוצגת בבנק היא לפני העמלות והמס.
      </p>
      <p className="max-w-measure">
        מול קרן כספית: כשיש לבנק הסכם הפצה עם מנהל הקרן, הוא לא גובה עמלת קנייה על הקרן. קרן כספית יומית פטורה נזילה בכל יום מסחר, והמס בה נגבה רק בפדיון ורק על הרווח הריאלי. המק״מ עדיף כשמתכוונים להחזיק עד הפדיון וכשהעמלה קטנה ביחס לסכום ולתקופה. בסכומים קטנים או בתקופות קצרות מאוד, עמלת המינימום יכולה לאכול את ההפרש.
      </p>
      <p className="max-w-measure">
        <Term prefix="ל" id={'אג"ח ממשלתית קצרה'}>אג״ח ממשלתית קצרה</Term> של משרד האוצר יש מבנה דומה, אבל היא <Term id={'אג"ח סחיר'}>נייר סחיר</Term> נפרד, בלי הפטור מדמי ניהול הפיקדון.
      </p>
      <p className="max-w-measure">
        עמלות הקנייה והמכירה, ודמי חשבון קבועים אם החברה גובה אותם, נקבעים בתעריפון של כל חברה. ראו במדריך: <Link to="/guide/brokerage-account" className="text-link hover:underline">חשבון ניירות ערך</Link>.
      </p>
      <RulesLine ids={["TXI-03", "TXI-11", "BANK-18", "BRK-16", "BRK-17", "BANK-15", "MF-26", "MF-35", "TXS-12", "GOV-15", "GOV-17"]} />
      {/* D6 (amended 2026-10-27): makam's exposure page folded into this one; what it said about holding makam without buying it */}
      <Sentence measure>
        אפשר להחזיק מק״מ גם בעקיפין: <Link to="/guide/money-market-fund-daily" className="text-link hover:underline">קרן כספית</Link> יכולה להחזיק מק״מ שנותרו לו עד {makamMonths ? <Num value={makamMonths} /> : null} חודשים לפדיון, לצד איגרות חוב קצרות, פיקדונות ומזומן. בחשבון בניהול אישי קונים אותו ישירות, כמו בחשבון ניירות ערך.
      </Sentence>
      <RulesLine ids={["MF-29", "IRA-11"]} />
    </>
    );
  },
};

export { RuleRef };
