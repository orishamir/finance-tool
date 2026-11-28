// Guide prose for חשבון ניירות ערך (architecture 3.5: prose lives in content files; every figure is a Num).
// Written from the rule base (BRK, REG, TXS, TXF, TXG, ETF, KGL, TXK, PF); the words that state a rule open it
// (Ruled, D116), and a figure from a rule opens it from its sheet. Same shape and register as
// kupat-gemel-lehashkaa.tsx. NEW copy for the founder to review (docs/copy.md holds only labels).
import type { GuideContent } from "./types";
import { YearOf } from "./year";
import { fmt } from "../../lib/format";
import { IdRef, Num, Ruled, Term } from "../../components/provenance";
import { Callout, Sentence, MixedName } from "../../components/kit";
import { GuideFold, GuidePart } from "../../components/guide/sections";

export const content: GuideContent = {
  what: ({ figure }) => {
    const rate = figure("TXS-05", "withholding_rate_real_gain");
    return (
      <>
        <p className="max-w-measure">
          חשבון ניירות ערך הוא חשבון בבנק או <Term prefix="ב" id="בית השקעות">בית השקעות</Term>, שבו קונים <Term id="נייר ערך">ניירות ערך</Term>, מחזיקים אותם ומוכרים אותם.
        </p>
        <p className="max-w-measure">
          הכסף לא נעול: <Ruled id="BRK-29">אפשר למכור בכל יום מסחר</Ruled>. כשמחיר של נייר עולה, משלמים <Term id="מס רווחי הון">מס רווחי הון</Term> על הרווח <Ruled id={["TXS-13", "TXF-11"]}>רק כשמוכרים אותו</Ruled>, <Ruled id="TXS-21">גם כשמוכרים קרן אחת כדי לקנות אחרת והכסף לא יצא מהחשבון</Ruled>.
        </p>
        <GuidePart title="מה מחזיקים בו">
          <p className="max-w-measure">
            בחשבון בבנק או בבית השקעות שהוא <Term id="חבר בורסה">חבר בורסה</Term> אפשר להחזיק, למשל, <Term id="קרן סל">קרנות סל</Term> <Term prefix="ו" id="קרן מחקה">קרנות מחקות</Term> ישראליות, <Term id="קרן חוץ">קרנות חוץ</Term> <Ruled id="ETF-26" prefix="ש">נסחרות בתל אביב</Ruled>, <Term id={'מק"מ'}>מק״מ</Term> <Term prefix="ו" id="איגרות חוב ממשלתיות">איגרות חוב ממשלתיות</Term>. דרך <Term id="ברוקר זר">ברוקר זר</Term> אפשר לקנות גם <Term id="קרן זרה">קרנות זרות</Term> בבורסות בחו״ל.
          </p>
        </GuidePart>
        <GuidePart title="בלי נעילה ובלי תקרה">
          <p className="max-w-measure"><Term prefix="ה" id="בורסה">בורסה</Term> <Ruled id="BRK-29">פתוחה מיום שני עד יום שישי</Ruled>. האתר לא מצא בכללים שקרא <Term id="תקרת הפקדה">תקרת הפקדה</Term> לחשבון כזה.</p>
        </GuidePart>
        <GuidePart title="המס כשמוכרים">
          <Sentence measure>
            <Ruled id="TXF-01">על רווח</Ruled> <Term prefix="מ" id="מכירה">מכירה</Term> משלמים מס רווחי הון. על <Term id="דיבידנד">דיבידנד</Term> או חלוקה מקרן משלמים כשהם משולמים, <Ruled id="TXS-11">חוץ מחלוקה</Ruled> של <Term id="קרן נאמנות חייבת">קרן חייבת</Term>. בבנק או אצל חבר בורסה בישראל המס <Ruled id="TXS-05">מנוכה במקור במכירה</Ruled>: {rate ? <Num value={rate} /> : null} <Term prefix="מה" id="רווח הון ריאלי">רווח הריאלי</Term>, כלומר מהרווח שמעבר <Term prefix="ל" id="אינפלציה">אינפלציה</Term>.
          </Sentence>
          <GuideFold label="נייר שנקוב במטבע אחר">
            <p className="max-w-measure">
              בנייר ערך שנסחר בישראל ונקוב <Term prefix="ב" id="מטבע חוץ">מטבע חוץ</Term> או צמוד אליו, הרווח שממוסה <Ruled id="TXS-04">הוא הרווח שמעבר לשינוי בשער של המטבע</Ruled>.
            </p>
          </GuideFold>
        </GuidePart>
      </>
    );
  },
  who: ({ figure }) => {
    const members = figure("REG-14", "member_count");
    return (
      <>
        <Sentence measure>
          <Ruled id="BRK-01">רק דרך חבר בורסה</Ruled> אפשר לקנות ולמכור בבורסה בתל אביב. יש {members ? <Num value={members} /> : null} חברים: בנקים, בתי השקעות שהם <Term id="חש&quot;ב">חש״בים</Term> <Ruled id="BRK-02" prefix="ו">חברים רחוקים</Ruled>, <Ruled id="BRK-32" prefix="ו">לא כולם משרתים</Ruled> לקוחות פרטיים.
        </Sentence>
        <p className="max-w-measure">
          כל אחד מהם קובע <Term id="התעריפון המלא">תעריפון</Term> משלו. הבורסה <Ruled id="BRK-33">מפרסמת לכל חבר את העמלות הממוצעות שגבה בפועל</Ruled> או את העמלות שבתעריפון שלו, לפי סוג נייר וגודל התיק. חבר בורסה <Ruled id="BRK-15">חייב לומר לכם על הפרסום הזה</Ruled> לפני פתיחת החשבון.
        </p>
        <p className="max-w-measure">
          ברוקר זר שמציע לציבור בישראל מסחר בבורסות בחו״ל צריך <Term id="היתר לפי סעיף 49א">היתר לפי סעיף 49א</Term>. הוא <Ruled id="BRK-06">לא בפיקוח</Ruled> <Term id="רשות ניירות ערך">רשות ניירות ערך</Term>, וההיתר לא אומר דבר על איכות השירות או על הסיכון. הרשות מפרסמת את רשימת בעלי ההיתר. לפי הרשות, <Ruled id="BRK-70">החוק לא אוסר לפנות ביוזמתכם בלבד</Ruled> לגוף זר בלי היתר, אם הוא לא פועל בישראל, לא פנה לאיש בישראל, והשירות נשאר זה שביקשתם.
        </p>
      </>
    );
  },
  termIds: [
    "חבר בורסה",
    "ברוקר זר",
    "קרן זרה",
    "מס רווחי הון",
    "רווח הון ריאלי",
    "מכירה",
    "חש\"ב",
    "התעריפון המלא",
    "היתר לפי סעיף 49א",
    "עמלת קנייה ומכירה",
    "דמי ניהול פיקדון ניירות ערך",
    "יחידה",
    "עמלת חליפין",
    "מרווח המרה",
    "דמי טיפול",
    "ריבית זכות",
    "העברת ניירות ערך",
    "מסלקת הבורסה",
    "החברה לרישומים",
    "SIPC",
    "קיזוז הפסדים",
    "הפסד מועבר",
    "ניכוי מס במקור",
    "טופס 867",
    "טופס 1322",
    "נייר ערך",
    "מטבע חוץ",
    "איגרת חוב",
    "ביטוח פיקדונות",
    "פיקדון",
    "המפקח על הבנקים",
    "קרן שאינה מחלקת",
    "תשקיף",
    "טופס W-8BEN",
    "דוח שנתי",
    "רשות ניירות ערך",
    "קצבה",
    "גיל פרישה מוקדמת",
    "העברת כספים בין מסלולי השקעה",
    "מנהל קרן",
    "דמי ניהול",
    "שכר נאמן",
    "קופת גמל",
    "קופת גמל להשקעה",
    "דיבידנד",
    "בורסה",
    "תקרת הפקדה",
    "איגרות חוב ממשלתיות",
    'מק"מ',
    "קרן מחקה",
    "קרן סל",
    'מגודרות מט"ח',
    "קרן נאמנות חייבת",
  ],
  afterTax: ({ figure }) => {
    const unlinked = figure("TXS-05", "withholding_rate_unlinked");
    const ceiling = figure("TXG-17", "securities_proceeds_ceiling");
    const usTreaty = figure("TXF-12", "us_withholding");
    const usNoForm = figure("TXF-13", "us_withholding_without_form");
    const reports = figure("TXS-05", "reports_per_year");
    return (
      <>
        <Sentence measure>
          על מק״מ <Term prefix="ו" id="איגרת חוב">איגרת חוב</Term> לא צמודה מס רווחי הון שמנוכה במכירה הוא {unlinked ? <Num value={unlinked} /> : null} מכל הרווח, <Ruled id={["TXS-03", "TXI-12"]}>בלי הפחתה של האינפלציה</Ruled>.
        </Sentence>
        <p className="max-w-measure">
          הפסד ממכירה <Ruled id={["TXS-17", "TXS-19"]}>מתקזז מרווחים של אותה שנה באותו בנק או בית השקעות</Ruled>. <Term id="קיזוז הפסדים">קיזוז</Term> בין מוסדות, או <Term id="הפסד מועבר">העברת הפסד</Term> לשנים הבאות, <Ruled id="TXS-18">דורשים</Ruled> <Term id="דוח שנתי">דוח שנתי</Term>.
        </p>
        <Sentence measure>
          מי שכל המס נוכה לו במקור, ותמורת המכירות שלו לא עולה על {ceiling ? <Num value={ceiling} display={fmt.nisWhole(Number(ceiling.value))} /> : null} בשנה<YearOf v={ceiling} />, <Ruled id="TXG-17">לא חייב בדוח שנתי</Ruled> רק בגלל החשבון. <Ruled id="TXG-18">זה לא חל</Ruled> על מי ששולט בחברה. זה גם לא חל על מי שלו, לבן הזוג או לילד מתחת לגיל <bdi>18</bdi> יש נכסים בחו״ל או חשבונות בבנק בחו״ל מעל הסף שבתקנות.
        </Sentence>
        <p className="max-w-measure">בחשבון ישיר אצל ברוקר זר <Ruled id="BRK-27">לא מנכים מס בישראל</Ruled>. <Ruled id={["TXG-20", "TXF-22"]}>מדווחים ומשלמים מקדמה</Ruled> {reports ? <Num value={reports} /> : null} פעמים בשנה, ומגישים דוח שנתי.</p>
        <Sentence measure>
          על דיבידנד מחברה אמריקאית יש גם מס בארצות הברית: עד {usTreaty ? <Num value={usTreaty} /> : null} למי שמסר <Term prefix="ל" id="ברוקר">ברוקר</Term> <Term id="טופס W-8BEN">טופס W-8BEN</Term>, ובלי הטופס הניכוי עשוי להיות {usNoForm ? <Num value={usNoForm} /> : null}. את המס הזה מורידים מהמס בישראל, <Ruled id="TXF-18">עד גובה המס הישראלי על אותה הכנסה</Ruled>.
        </Sentence>
        <Callout tone="info" className="max-w-measure">
          <span className="font-medium">קרן זרה צוברת, שלא מחלקת דיבידנד.</span> חלק מהקרנות האלה מדווחות בנספח לתשקיף הישראלי שלהן: הן קיבלו החלטת מיסוי <Term prefix="מ" id="רשות המסים">רשות המסים</Term>, ולפיה משלמים מס רק במכירה ובחלוקה. האתר מחשב קרן כזו לפי ההחלטה. על <Term id="קרן שאינה מחלקת">קרן צוברת</Term> בלי החלטה כזו שום מקור רשמי לא אומר זאת במפורש. האתר קורא את הפקודה כך <Ruled id="TXF-11">שגם עליה משלמים מס רק במכירה ובחלוקה</Ruled>, ומחשב אותה כך. את שתיהן האתר מדרג כמו כל קרן אחרת. בגיליון של כל סכום שנשען על הקריאה הזו כתוב שזו קריאה של האתר. שאלה פתוחה <IdRef id="TXF OQ1" end="." />
        </Callout>
      </>
    );
  },
  risks: ({ figure }) => {
    const estate = figure("TXF-27", "estate_threshold");
    return (
      <>
        <p className="max-w-measure">
          השווי עולה ויורד כל יום עם מחירי ניירות הערך שבחשבון, <Ruled id="ETF-10" prefix="ו">בקרן על מדד זר</Ruled> שלא <Term id={'מגודרות מט"ח'}>מגודרת מט״ח</Term>, גם עם <Term id="שער חליפין">שער המטבע</Term>. אין ערבות של המדינה, ולא נמצאה בישראל קרן פיצוי למשקיעים.
        </p>
        <p className="max-w-measure">
          בבית השקעות שהוא חש״ב, כללי הבורסה מחייבים להחזיק את ניירות הערך והכסף של הלקוחות <Ruled id={["REG-16", "BRK-07", "BRK-08"]}>בנפרד מרכוש החברה</Ruled>, בנאמנות, <Term prefix="ב" id="מסלקת הבורסה">מסלקת הבורסה</Term> ובבנקים, עם ביקורת שנתית. בבנק, <Term id="המפקח על הבנקים">המפקח על הבנקים</Term> <Ruled id="BRK-10">מחייב לרשום ולהפריד את נכסי הלקוחות</Ruled> כך שאפשר לזהות אותם בנפרד מנכסי הבנק. הבנק חייב גם לעבור ביקורת חיצונית לפחות פעם בשנה.
        </p>
        <p className="max-w-measure">
          בבנק, ובבית השקעות שחבר במסלקת הבורסה, ניירות ערך של לקוחות שמופקדים במסלקה <Ruled id={["BRK-58", "REG-35"]}>רשומים בה על שם הבנק או בית ההשקעות</Ruled>. הבנק או בית ההשקעות מחזיקים בהם בנאמנות עבור הלקוחות, בחשבון נפרד מזה של החברה עצמה. חבר בורסה שלא חבר במסלקה סולק דרך חבר במסלקה. ניירות הערך של הלקוחות שלו רשומים על שם אותו חבר, בנאמנות גם עבורם. לפי הבורסה, <Ruled id="REG-14">זה יכול להיעשות בלי הפרדה</Ruled> בין ניירות הערך של הלקוחות לאלה של החבר, אלא אם משתמשים בחשבון משנה נפרד. לפי חוק הנאמנות, הנושים של מי שמחזיק נכסים בנאמנות <Ruled id="REG-34">לא יכולים לגבות מהם את החובות שלו</Ruled>.
        </p>
        <p className="max-w-measure">
          אף חוק לא אומר במפורש מה זה אומר כשהבנק או בית ההשקעות קורסים, ולא נמצאה החלטת בית משפט. <Ruled id="REG-34">הקריאה של האתר</Ruled>: ניירות הערך של הלקוחות נשארים מחוץ להישג הנושים, ואם חסר משהו, התביעה על החוסר היא חוב רגיל של החברה. <Ruled id="REG-35">כסף בחשבון ניירות ערך בבנק</Ruled> הוא <Term id="פיקדון">פיקדון</Term>, <Ruled id="REG-04" prefix="ו">אין</Ruled> <Term id="ביטוח פיקדונות">ביטוח פיקדונות</Term>. עוד לא נמצא: מי מעביר את החשבונות לחברה אחרת, מה קורה לניירות ערך זרים שמוחזקים דרך בנק שקורס, והאם <Ruled id="REG-15" prefix="ה">שעבוד</Ruled> של מסלקת הבורסה על נכסי חבר שקורס מגיע גם לניירות הערך של הלקוחות. שאלות פתוחות: <IdRef id="REG OQ9" end="," /> <IdRef id="REG OQ10" end="," /> <IdRef id="REG OQ23" end="," /> <IdRef id="BRK OQ23" end="." />
        </p>
        <Sentence measure>
          אצל ברוקר אמריקאי שחבר ב־<Term id="SIPC">SIPC</Term>, הגוף הזה <Ruled id="REG-27">מפצה עד תקרה אם הברוקר קורס</Ruled>, אבל לא על ירידת ערך. ההגנה לא חלה על חברות לא אמריקאיות באותה קבוצה.
        </Sentence>
        <Sentence measure>
          מניות של חברה אמריקאית, כולל קרן סל שהתאגדה בארצות הברית, נחשבות נכס אמריקאי. אם הנכסים האלה עולים על {estate ? <Num value={estate} display={fmt.usdWhole(Number(estate.value))} /> : "סף נמוך"} במות המחזיק, מנהל העיזבון <Ruled id="TXF-27">חייב להגיש דוח מס ירושה אמריקאי</Ruled>, כי לישראל אין אמנה בנושא. המס עולה במדרגות. לפי טבלת המס האמריקאית הזיכוי שמגיע לעיזבון כזה מכסה בערך את המס על הסכום שעד הסף. מניות של קרן אירית הן נכס שמחוץ לארצות הברית. קרן אמריקאית שמאוגדת כנאמנות, ועומדת בהגדרה של חוק המס האמריקאי לחברת השקעות, נספרת כנראה גם היא. זו הקריאה של האתר, ואף מסמך רשמי שנקרא לא אומר זאת במפורש.
        </Sentence>
      </>
    );
  },
  use: ({ exampleFund }) => (
    <>
      <p className="max-w-measure">
        כסף שרוצים להשקיע בקרן על מדד בלי נעילה, למשל כשמתכוונים לקנות קרן אחת ולהחזיק אותה שנים. משלמים <Ruled id="BRK-16">עמלות על פעולות ועל ההחזקה</Ruled> לפי התעריפון, ועוד <Ruled id="ETF-13" prefix="ה">עלות שבתוך הקרן</Ruled>. הממוצע לקרנות הסל ולקרנות המחקות <Ruled id="ETF-17">מתפרסם פעם בשנה</Ruled>. מה ששילמו בממוצע ב<Term id="קופת גמל להשקעה">קופת גמל להשקעה</Term> כתוב בעמוד שלה.
      </p>
      {/* the costs in the example chart above, from the records the example reads (P-05's fund, named from its record; the tariff is the site's pick, F-80, named in the terms block) */}
      <p className="max-w-measure text-sm text-muted-foreground">
        ההוצאות בדוגמה שלמעלה הן שתיים. האחת היא העלות בתוך הקרן שנבחרה לדוגמה{exampleFund ? <>, <MixedName>{exampleFund}</MixedName>,</> : ","} לפי הרשומה שנאספה על הקרן ולפי הדוח השנתי של <Term id="מנהל קרן">מנהל הקרן</Term>. בדוגמה העלות הזו נשארת כמו שפורסמה בכל השנים. קרן יכולה להעלות את דמי הניהול. מנהלי הקרנות מתחייבים <Term prefix="ב" id="תשקיף">תשקיף</Term> <Ruled id="MF-17">להעלות אותם רק ב־1 בינואר</Ruled>. זו התחייבות, לא חוק. מנהל יכול לחזור בו ממנה באותו יום. אפשר להחליף את הקרן בקרן אחרת בכרטיס ההשוואה. השנייה היא העמלות על קנייה, מכירה והחזקה, לפי התעריפון שהאתר בחר. שם התעריפון מופיע בתנאי המוצר בדוגמה. בבנק או בבית השקעות אחר העמלות שונות. בתעריפונים של רוב בתי ההשקעות שנבדקו כתובים <Term id="דמי ניהול פיקדון ניירות ערך">דמי ניהול פיקדון ניירות ערך</Term> גם על <Term id="יחידה">יחידות</Term> של קרנות. הדוגמה גובה אותם לפי התעריפון. לפי דוח משותף של הרגולטורים, בבתי השקעות מקובל שדמי משמרת <Ruled id="MF-70">לא נגבים בפועל</Ruled>. לכן העלות שם יכולה להיות נמוכה מזו שבדוגמה. <Term prefix="ל" id="קופת גמל">קופות גמל</Term> אין שורה מקבילה בדמי הניהול, כי <Ruled id="PF-10">עלויות המסחר שם נכנסות להוצאות הישירות</Ruled>.
      </p>
      <p className="max-w-measure">
        בחשבון ניירות ערך <Ruled id={["TXS-21", "TXS-09"]}>החלפת קרן ממוסה</Ruled>. בקופת גמל להשקעה <Term id="העברת כספים בין מסלולי השקעה">מעבר בין מסלולים</Term> לא ממוסה, <Ruled id="TXK-04">לפי הקריאה של האתר</Ruled>. <Term prefix="מ" id="גיל פרישה מוקדמת">גיל פרישה מוקדמת</Term> <Ruled id="KGL-09">אפשר להעביר את הכסף</Ruled> <Term prefix="ל" id="קצבה">קצבה</Term> <Ruled id="TXK-09">פטורה ממס</Ruled>.
      </p>
    </>
  ),
};
