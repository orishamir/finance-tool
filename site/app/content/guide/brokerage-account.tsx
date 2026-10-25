// Guide prose for חשבון ניירות ערך (architecture 3.5: prose lives in content files; every figure is a Num).
// Written 2026-10-23 from the rule base (BRK, REG, TXS, TXF, TXG, SW, ETF, KGL, TXK); each block ends with
// the rules it rests on. Same shape and register as kupat-gemel-lehashkaa.tsx. NEW copy for the founder to
// review (docs/copy.md holds only labels).
import type { GuideContent } from "./types";
import { Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";

const OQ = ({ id }: { id: string }) => (
  <bdi dir="ltr" className="whitespace-nowrap">
    {id}
  </bdi>
);

export const content: GuideContent = {
  what: ({ figure }) => {
    const rate = figure("TXS-05", "withholding_rate_real_gain");
    return (
      <>
        <p className="max-w-measure">
          חשבון בבנק או בבית השקעות שהוא <Term id="חבר בורסה">חבר בורסה</Term>, שבו קונים, מוכרים ומחזיקים ניירות ערך: קרנות סל וקרנות מחקות ישראליות, קרנות חוץ שנסחרות בתל אביב, מק״מ ואיגרות חוב ממשלתיות, ודרך <Term id="ברוקר זר">ברוקר זר</Term> גם <Term id="קרן זרה">קרנות זרות</Term> בבורסות בחו"ל. אין תקרת הפקדה ואין נעילה: מוכרים בכל יום מסחר, והבורסה פתוחה מיום שני עד יום שישי.
        </p>
        <Sentence measure>
          על הרווחים משלמים <Term id="מס רווחי הון">מס רווחי הון</Term> רק כשמוכרים. בבנק או אצל חבר בורסה בישראל המס מנוכה במקור במכירה, {rate ? <Num value={rate} /> : null} <Term prefix="מה" id="רווח הון ריאלי">רווח הריאלי</Term>, כלומר מהרווח שמעבר לעליית המדד. גם <Term id="מכירה">מכירה</Term> של קרן אחת כדי לקנות אחרת היא מכירה לכל דבר, ומשלמים עליה מס אף שהכסף נשאר בחשבון.
        </Sentence>
        <RulesLine ids={["BRK-01", "BRK-32", "BRK-29", "TXS-01", "TXS-05", "TXS-21", "ETF-04", "ETF-26"]} />
      </>
    );
  },
  who: ({ figure }) => {
    const members = figure("REG-14", "member_count");
    return (
      <>
        <Sentence measure>
          רק דרך חבר בורסה אפשר לקנות ולמכור בבורסה בתל אביב: {members ? <Num value={members} /> : null} חברים, מהם בנקים ובתי השקעות שהם <Term id="חש&quot;ב">חש"בים</Term>. כל אחד מהם מפרסם <Term id="התעריפון המלא">תעריפון</Term>, והבורסה מפרסמת לכל חבר את העמלות שגבה בפועל, לפי סוג נייר וגודל התיק; חבר בורסה חייב לומר לכם זאת לפני פתיחת החשבון.
        </Sentence>
        <p className="max-w-measure">
          ברוקר זר שמציע מסחר בבורסות בחו"ל פועל בישראל לפי <Term id="היתר לפי סעיף 49א">היתר לפי סעיף 49א</Term>, ואינו בפיקוח רשות ניירות ערך. האם חשבון שנפתח ישירות אצל ברוקר בחו"ל צריך היתר כזה עדיין לא מתועד. שאלה פתוחה: <OQ id="BRK OQ9" />.
        </p>
        <RulesLine ids={["BRK-01", "BRK-32", "REG-14", "BRK-15", "BRK-33", "BRK-06"]} />
      </>
    );
  },
  switchLine: "מכירה כדי לעבור לקרן אחרת היא אירוע מס: המס על הרווח מנוכה גם כשהכסף נשאר בחשבון",
  switchRules: ["TXS-21", "TXS-05", "SW-36"],
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
  ],
  afterTax: ({ figure }) => {
    const unlinked = figure("TXS-05", "withholding_rate_unlinked");
    const ceiling = figure("TXG-17", "securities_proceeds_ceiling");
    return (
      <>
        <Sentence measure>
          על מק״מ ואיגרת חוב לא צמודה המס במכירה הוא {unlinked ? <Num value={unlinked} /> : null} מכל הרווח, בלי הפחתה של המדד. הפסד ממכירה מקזז רווחים באותה שנה בתוך אותו בנק; <Term id="קיזוז הפסדים">קיזוז</Term> בין בנקים, או <Term id="הפסד מועבר">העברת הפסד</Term> לשנים הבאות, דורשים דוח שנתי. מי שכל המס נוכה לו במקור ותמורת המכירות שלו נמוכה מ{ceiling ? <Num value={ceiling} /> : null} בשנה אינו חייב בדוח רק בגלל החשבון.
        </Sentence>
        <p className="max-w-measure">
          אצל ברוקר זר לא מנוכה מס בישראל: מדווחים ומשלמים מקדמה פעמיים בשנה, ומגישים דוח שנתי. דיבידנד מחברה אמריקאית חייב גם מס בארצות הברית, שמתקזז מהמס בישראל אם מסרתם לברוקר טופס W-8BEN.
        </p>
        <Callout tone="blocked" className="max-w-measure">
          <span className="font-medium">קרן זרה צוברת, שלא מחלקת דיבידנד:</span> שום מקור רשמי לא אומר שמשלמים עליה מס רק במכירה; הקריאה הזאת נשענת על לשון הפקודה ועל מקור משני, ולכן האתר מסמן אותה כ"מקור משני". שאלה פתוחה: <OQ id="TXF OQ1" />.
        </Callout>
        <RulesLine ids={["TXS-03", "TXI-12", "TXS-17", "TXS-18", "TXS-19", "TXG-17", "TXF-22", "TXG-20", "TXF-12", "TXF-13", "TXF-18", "TXF-11"]} />
      </>
    );
  },
  risks: () => (
    <>
      <p className="max-w-measure">
        השווי עולה ויורד כל יום עם מחירי ניירות הערך שבחשבון, ובקרן על מדד זר גם עם שער המטבע. אין ערבות של המדינה ואין בישראל קרן פיצוי למשקיעים.
      </p>
      <p className="max-w-measure">
        בבית השקעות שהוא חש"ב, כללי הבורסה מחייבים להחזיק את ניירות הערך והכסף של הלקוחות בנפרד מרכוש החברה, בנאמנות, <Term prefix="ב" id="מסלקת הבורסה">מסלקת הבורסה</Term> ובבנקים, עם ביקורת שנתית. בבנק ניירות הערך רשומים דרך <Term id="החברה לרישומים">החברה לרישומים</Term> ומופרדים בספרי הבנק מניירות הערך של הבנק עצמו. מה קורה להם אם הבנק או החבר קורסים לא נמצא בשום חוק. שאלות פתוחות: <OQ id="REG OQ9" />, <OQ id="REG OQ10" />.
      </p>
      <p className="max-w-measure">
        אצל ברוקר אמריקאי, <Term id="SIPC">SIPC</Term> מפצה עד תקרה אם הברוקר קורס, ולא על ירידת ערך; קרן זרה הרשומה בארצות הברית חושפת את העיזבון למס עיזבון אמריקאי מעל סף נמוך, בלי אמנה עם ישראל.
      </p>
      <RulesLine ids={["BRK-07", "BRK-08", "BRK-10", "BRK-12", "BRK-13", "REG-15", "REG-16", "REG-04", "REG-27", "BRK-35", "TXF-27", "ETF-10"]} />
    </>
  ),
  use: () => (
    <>
      <p className="max-w-measure">
        כסף שרוצים להשקיע בקרן על מדד בלי תקרה ובלי נעילה, בעיקר כשחוצים את תקרת ההפקדה השנתית של קופת גמל להשקעה, או כשמתכוונים לקנות קרן אחת ולהחזיק אותה שנים: העמלות הן לפי פעולה והחזקה, לא אחוז שנתי מכל החיסכון, ודמי הניהול של קרן סל או קרן מחקה נמוכים בממוצע מהתקרה של קופת גמל.
      </p>
      {/* audit A84: the example chart above shows higher costs than the study-fund page's; said here, from the records the example reads (P-05: fund 5139282, Leumi tariff; was 1148162 until 2026-10-24) */}
      <p className="max-w-measure text-sm text-muted-foreground">
        בדוגמה שלמעלה ההוצאות גבוהות יותר מאלה שבדוגמה של קופת גמל להשקעה: לעלות בתוך הקרן שנבחרה לדוגמה, <bdi>ילין לפידות מחקה (4D) S&amp;P 500</bdi> (<bdi>0.02%</bdi> בשנה, כולה שכר נאמן; דמי הניהול <bdi>0%</bdi>; לפי רשומת הקרן והדוח השנתי של מנהל הקרן; אפשר להחליף אותה בקרן אחרת בכרטיס ההשוואה), נוספות העמלות לפי התעריפון של בנק לאומי על קנייה ומכירה ועל החזקת ניירות ערך, ואין להן שורה מקבילה בדמי הניהול של קופת גמל (שם עלויות המסחר נכנסות להוצאות הישירות).
      </p>
      <p className="max-w-measure">
        קופת גמל להשקעה עדיפה כשצפויים להחליף מסלולים בדרך, כי שם מעבר בין מסלולים לא נחשב מכירה ואילו כאן כל החלפת קרן היא אירוע מס שמקטין את הצבירה; וגם למי שרוצה את האפשרות להעביר את הכסף מגיל פרישה מוקדמת לקצבה פטורה ממס.
      </p>
      <RulesLine ids={["KGL-02", "KGL-03", "PF-02", "PF-12", "ETF-13", "ETF-17", "BRK-16", "TXS-21", "TXK-04", "TXK-10", "TXS-09"]} />
    </>
  ),
};

export { RuleRef };
