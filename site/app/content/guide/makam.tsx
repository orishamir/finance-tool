// Guide prose for מק״מ (architecture 3.5: prose lives in content files; every figure is a Num). Written
// from the rule base (GOV, TXI, TXS, BANK, BRK, REG); the words that state a rule open it (Ruled, D116), and a
// figure from a rule opens it from its sheet. NEW copy for the founder to review (docs/copy.md holds only labels).
import { Link } from "react-router";
import type { GuideContent } from "./types";
import { YearOf } from "./year";
import { fmt } from "../../lib/format";
import { IdRef, Num, ProofsChip, Ruled, Term } from "../../components/provenance";
import { Callout, Sentence, TextLink } from "../../components/kit";

export const content: GuideContent = {
  what: ({ figure }) => {
    const series = figure("GOV-23", "series_outstanding");
    return (
      <>
        <p className="max-w-measure">
          המק״מ לא משלם <Term id="ריבית">ריבית</Term> ולא <Term id="צמוד למדד המחירים לצרכן">צמוד למדד</Term>: קונים אותו במחיר נמוך <Term prefix="מה" id="שווי נקוב">שווי הנקוב</Term>. במועד <Term prefix="ה" id="פדיון">פדיון</Term> <Ruled id={["GOV-03", "GOV-02"]}>המדינה משלמת את השווי הנקוב במלואו</Ruled>. ההפרש הוא הרווח שלכם. במס הוא נחשב <Term id="דמי ניכיון">דמי ניכיון</Term>, <Ruled id="TXI-01">כלומר ריבית</Ruled>.
        </p>
        <Sentence measure>
          <Ruled id="GOV-23">בכל חודש מונפקת סדרה חדשה לכשנה</Ruled>, ולכן בכל רגע יש {series ? <Num value={series} /> : null} סדרות בשוק, עם מועדי פדיון שונים. מי שמחזיק עד הסוף <Ruled id="GOV-26">יודע כבר ביום הקנייה</Ruled> מה <Term prefix="ה" id="תשואה לפדיון">תשואה לפדיון</Term> שלו. אין קופונים שצריך להשקיע מחדש בדרך. לכן התשואה לפדיון <Ruled id="GOV-06">היא בדיוק הרווח לשנה עד הפדיון</Ruled>, לפני עמלות ומס הכנסה. <ProofsChip ids={["M-02"]} />
        </Sentence>
      </>
    );
  },
  who: ({ figure }) => {
    const minOrder = figure("GOV-24", "min_order_makam_face_value");
    const lastDays = figure("GOV-31", "last_trading_days");
    return (
      <>
        <p className="max-w-measure">
          <Ruled id={["GOV-22", "BRK-32"]}>קונים מק״מ דרך חשבון ניירות ערך בבנק</Ruled> או <Term prefix="ב" id="בית השקעות">בית השקעות</Term> שהוא <Term id="חבר בורסה">חבר בורסה</Term>. אפשר לקנות <Term prefix="ב" id="בורסה">בורסה</Term>, בכל יום מסחר, או בהזמנה למכרז ההנפקה החודשי. בנק שאפשר לקנות דרכו מק״מ <Ruled id="BANK-15">חייב להציג אותו ליד הפיקדונות והקרנות הכספיות</Ruled>, תחת הכותרת <Term id="מוצרי שוק הכסף">מוצרי שוק הכסף</Term>, בלי להעדיף אף מוצר.
        </p>
        <Sentence measure>
          בבורסה, במסחר הרציף, פקודה היא של {minOrder ? <Num value={minOrder} display={fmt.nisWhole(Number(minOrder.value))} /> : null} שווי נקוב לפחות. בשלבים אחרים של יום המסחר, כמו לפני הפתיחה ולפני הנעילה, הכללים מאפשרים פקודה של יחידת מסחר אחת. אבל גודל היחידה של המק״מ לא כתוב במדריך המסחר. שאלה פתוחה <IdRef id="GOV OQ7" end="." /> הבנק או בית ההשקעות <Ruled id="GOV-24">יכולים לקבוע בתעריפון מינימום משלהם</Ruled>. יום המסחר האחרון בסדרה הוא {lastDays ? <Num value={lastDays} /> : null} ימי מסחר לפני הפדיון.
        </Sentence>
        <p className="max-w-measure">
          <Term prefix="ה" id="מנפיק">מנפיק</Term> של המק״מ לציבור הוא <Term id="בנק ישראל">בנק ישראל</Term>, <Ruled id="GOV-01">שקונה אותו מהממשלה ומנהל אותו</Ruled>. במכרז עצמו <Ruled id="GOV-05">מציעים ישירות רק חברי</Ruled> <Term id="מסלקת הבורסה">מסלקת הבורסה</Term>. <Ruled id="GOV-22">בנק ישראל לא מציין</Ruled> מינימום או עמלה להזמנה של אדם פרטי במכרז. שאלה פתוחה <IdRef id="GOV OQ2" end="." />
        </p>
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
          מי שמחזיק עד הפדיון משלם מס הכנסה של {rate ? <Num value={rate} /> : null} על ההפרש, כי <Ruled id="TXI-11">ההפרש הוא ריבית והמס עליה קבוע</Ruled>.
        </Sentence>
        <Sentence measure>
          מי שמוכר לפני הפדיון משלם {saleRate ? <Num value={saleRate} /> : null} מכל הרווח, בלי ניכוי של <Term prefix="ה" id="אינפלציה">אינפלציה</Term>: הרווח כולו נחשב <Term id="רווח הון ריאלי">רווח הון ריאלי</Term>. <Ruled id="TXI-12">בחוק השיעור הזה הוא תקרה</Ruled>, וזה גם השיעור שהבנק מנכה מהרווח. עוד לא נמצא איך מחיר המכירה מתחלק בין ניכיון <Term prefix="ל" id="רווח הון">רווח הון</Term>. שאלה פתוחה <IdRef id="TXI OQ3" end="." />
        </Sentence>
        <Sentence measure>
          בפדיון מס ההכנסה <Ruled id="TXI-11">מנוכה במקור</Ruled>, ובמכירה <Ruled id="TXS-05">הבנק או חבר הבורסה מנכים</Ruled> <Term id="ניכוי מס במקור">מס במקור</Term>. תושב שכל ההכנסה שלו מהסוגים שבתקנות, כל סוג מתחת לתקרה שלו, והמס עליה נוכה במלואו במקור, <Ruled id="TXG-17">לא חייב</Ruled> <Term prefix="ב" id="דוח שנתי">דוח שנתי</Term>. התקרות שנוגעות למק״מ: {interestCeiling ? <>עד <Num value={interestCeiling} display={fmt.nisWhole(Number(interestCeiling.value))} /> ריבית בשנה</> : null}{ceiling ? <> ועד <Num value={ceiling} display={fmt.nisWhole(Number(ceiling.value))} /> תמורת מכירות בשנה</> : null}<YearOf v={interestCeiling ?? ceiling} plural />. <Ruled id="TXG-18">התקנות מוציאות מהפטור</Ruled>, בין היתר, את מי שלו, לבן או לבת הזוג או לילד מתחת לגיל 18 יש נכסים בחו״ל או חשבונות בבנק בחו״ל מעל הסף שבתקנות.
        </Sentence>
        <Callout tone="blocked" className="max-w-measure">
          <span className="font-medium">מגיל {sixty ? <Num value={sixty} /> : null}.</span> ההקלה במס לפי מדרגות נמוכות <Ruled id="TXG-04">חלה על שיעורים שהם תקרה</Ruled>. השיעור על רווח ממכירה לפני הפדיון הוא תקרה. בהכנסה נמוכה המס עליו יכול להיות נמוך יותר, אבל האתר עוד לא מחשב את זה. השיעור על ריבית לא צמודה <Ruled id="TXI-19">מנוסח כשיעור קבוע</Ruled>. לא נמצאה הכרעה של <Term id="רשות המסים">רשות המסים</Term>, ולכן האתר לא מפחית אותו. שאלה פתוחה <IdRef id="TXI OQ9" end="." />
        </Callout>
      </>
    );
  },
  risks: () => (
    <>
      <p className="max-w-measure">
        את השווי הנקוב <Ruled id="GOV-02">משלמת המדינה מהכנסותיה הכלליות</Ruled>, לא הבנק ולא <Term prefix="ה" id="ברוקר">ברוקר</Term>. בנק ישראל מתאר את המק״מ כהשקעה שנחשבת <Ruled id="GOV-26">חסרת סיכון, עם תשואה ידועה מראש</Ruled>. למי שמחזיק עד הפדיון <Ruled id="GOV-03">הסכום בשקלים ידוע מראש</Ruled>, אבל <Ruled id="BND-09">לא מה הוא יקנה</Ruled>.
      </p>
      <p className="max-w-measure">
        מי שמוכר קודם <Ruled id="BND-02">מקבל את מחיר השוק של אותו יום</Ruled>. <Ruled id="BND-01">המחיר הזה זז הפוך לריבית</Ruled>: כשהריבית במשק עולה, המחיר יורד, כי מק״מ חדש נותן תשואה גבוהה יותר. אבל <Ruled id="GOV-23">כל סדרה מונפקת לכשנה</Ruled>, ולכן שינוי בריבית מזיז את המחיר רק מעט: <Ruled id={["BND-04", "GOV-06"]}>בערך השינוי בריבית כפול החלק מהשנה שנשאר</Ruled>. באיגרת חוב ארוכה אותו שינוי מזיז את המחיר הרבה יותר, כמו שמוסבר <TextLink to="/guide/government-bond">בעמוד על האיגרות של המדינה</TextLink>. <ProofsChip ids={["M-01", "M-03"]} />
      </p>
      <p className="max-w-measure">
        <Ruled id="GOV-03">המק״מ לא צמוד למדד</Ruled>: אם המחירים עולים יותר מהתשואה, הכסף שווה פחות בסוף.
      </p>
      <p className="max-w-measure">
        {/* D6: how the account keeps the paper is the account's, said once on its page, not copied here */}
        הנייר מוחזק בחשבון ניירות ערך. איך החשבון שומר על נכסי הלקוחות, ומה קורה אם הבנק או בית ההשקעות קורסים, מוסבר בעמוד של <Link to="/guide/brokerage-account" className="text-link hover:underline">חשבון ניירות ערך</Link>.
      </p>
    </>
  ),
  use: ({ figure }) => {
    const makamMonths = figure("MF-29", "max_makam_term_months");
    const rate = figure("TXI-11", "rate");
    const fundRate = figure("TXS-12", "rate");
    return (
    <>
      <p className="max-w-measure">
        כסף שצריך לשבת כמה חודשים עד שנה, כשרוצים <Term id="תשואה">תשואה</Term> <Ruled id="GOV-26">ידועה מראש</Ruled> <Ruled id="GOV-17">ואפשרות למכור בכל יום מסחר</Ruled>.
      </p>
      <p className="max-w-measure">
        <span className="font-medium">לחדש כל שנה.</span> <Ruled id="GOV-23">אפשר לקנות מק״מ חדש בכל פדיון</Ruled>, ולהחזיק כך כסף לאורך שנים. אז המחיר כמעט לא זז בדרך, אבל הריבית לא ננעלת: <Ruled id="BND-08">בכל חידוש מקבלים את התשואה של אותו יום</Ruled>, גבוהה יותר אם הריבית עלתה ונמוכה יותר אם ירדה. מי שרוצה לדעת מראש מה ירוויח לכמה שנים צריך <Term id="איגרת חוב">איגרת חוב</Term> ארוכה יותר, שהמחיר שלה <Ruled id="BND-12">זז יותר בדרך</Ruled>. <ProofsChip ids={["M-08"]} />
      </p>
      <p className="max-w-measure">
        מול <Term id="פיקדון">פיקדון</Term> <Term id="לא צמוד">לא צמוד</Term> בבנק: כשמחזיקים עד הסוף, <Ruled id={["TXI-03", "TXI-11"]}>בשניהם המס הוא שיעור קבוע מהריבית הנומינלית</Ruled>. מק״מ שנמכר לפני הפדיון ממוסה על <Term prefix="ה" id="רווח הון">רווח הון</Term>, <Ruled id="TXI-12">בשיעור שהוא תקרה</Ruled>. בפיקדון <Term id="צמוד למדד המחירים לצרכן">צמוד למדד</Term> במלואו <Ruled id="TXI-05">המס הוא רק על הריבית שמעל עליית המדד</Ruled>. במק״מ <Ruled id="GOV-17">אין נעילה</Ruled> ואין <Term id="קנס שבירה">קנס שבירה</Term>. בנק <Ruled id="BANK-18">לא יכול לגבות עליו</Ruled> <Term id="דמי ניהול פיקדון ניירות ערך">דמי ניהול פיקדון ניירות ערך</Term>. <Ruled id="BRK-17">הכלל הזה חל על בנקים בלבד</Ruled>. מצד שני <Ruled id="BANK-18">מותר לגבות עליו עמלות קנייה, מכירה ופדיון</Ruled>. <Term prefix="ה" id="תשואה ברוטו">תשואה ברוטו</Term> שמוצגת בבנק היא לפני <Term prefix="ה" id="עמלה">עמלות</Term> והמס.
      </p>
      <p className="max-w-measure">
        מול <Term id="קרן כספית">קרן כספית</Term>: כשיש לבנק הסכם הפצה עם <Term id="מנהל קרן">מנהל הקרן</Term>, <Ruled id="MF-71">הבנק לא גובה עמלת קנייה על הקרן</Ruled>. <Term id="קרנות כספיות יומיות">קרן כספית יומית</Term> פטורה נזילה בכל יום מסחר, והמס בה <Ruled id="TXS-12">נגבה רק בפדיון</Ruled> ורק על <Term id="הרווח הריאלי">הרווח הריאלי</Term>. מי מנצח תלוי <Term prefix="ב" id="אינפלציה">אינפלציה</Term> ובעלויות. מי שמחזיק מק״מ עד הפדיון משלם מס הכנסה של {rate ? <Num value={rate} /> : null} מכל ההפרש. בקרן כספית פטורה משלמים <Term id="מס רווחי הון">מס רווחי הון</Term> של עד {fundRate ? <Num value={fundRate} /> : null} רק מהרווח שמעבר לאינפלציה. באותה תשואה לפני מס, כשהאינפלציה נמוכה, המס במק״מ נמוך יותר. כשהיא גבוהה, המס בקרן נמוך יותר. <ProofsChip ids={["M-10"]} /> מעבר למס, בקרן יורדים דמי הניהול שלה, ובמק״מ העמלות של החשבון. בסכומים קטנים או בתקופות קצרות מאוד, עמלת המינימום במק״מ יכולה להכריע.
      </p>
      <p className="max-w-measure">
        <Term prefix="ל" id={'אג"ח ממשלתית קצרה'}>אג״ח ממשלתית קצרה</Term> <Ruled id="GOV-15">של משרד האוצר יש מבנה דומה</Ruled>, אבל היא <Term id={'אג"ח סחיר'}>נייר סחיר</Term> נפרד, בלי הפטור מדמי ניהול הפיקדון.
      </p>
      <p className="max-w-measure">
        <Term id="עמלת קנייה ומכירה">עמלות הקנייה והמכירה</Term>, <Term prefix="ו" id="דמי חשבון קבועים">דמי חשבון קבועים</Term> אם החברה גובה אותם, <Ruled id={["BRK-16", "BRK-24"]}>נקבעים בידי כל חברה</Ruled>. ראו במדריך: <Link to="/guide/brokerage-account" className="text-link hover:underline">חשבון ניירות ערך</Link>.
      </p>
      {/* D6: makam's exposure page folded into this one; what it said about holding makam without buying it */}
      <Sentence measure>
        אפשר להחזיק מק״מ גם בעקיפין: <Link to="/guide/money-market-fund-daily" className="text-link hover:underline">קרן כספית</Link> יכולה להחזיק מק״מ שנותרו לו עד {makamMonths ? <Num value={makamMonths} /> : null} חודשים לפדיון, <Ruled id="MF-29">לצד איגרות חוב קצרות, פיקדונות ומזומן</Ruled>. בחשבון <Term prefix="ב" id="קופת גמל בניהול אישי">ניהול אישי</Term> <Ruled id="IRA-11">קונים אותו ישירות</Ruled>, כמו בחשבון ניירות ערך.
      </Sentence>
    </>
    );
  },
};
