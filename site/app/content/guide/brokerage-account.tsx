// Guide prose for חשבון ניירות ערך (architecture 3.5: prose lives in content files; every figure is a Num).
// Written 2026-10-23 from the rule base (BRK, REG, TXS, TXF, TXG, SW, ETF, KGL, TXK); each block ends with
// the rules it rests on. Same shape and register as kupat-gemel-lehashkaa.tsx. NEW copy for the founder to
// review (docs/copy.md holds only labels).
import type { GuideContent } from "./types";
import { fmt } from "../../lib/format";
import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";

export const content: GuideContent = {
  what: ({ figure }) => {
    const rate = figure("TXS-05", "withholding_rate_real_gain");
    return (
      <>
        <p className="max-w-measure">
          חשבון בבנק או בבית השקעות שהוא <Term id="חבר בורסה">חבר בורסה</Term>, שבו קונים, מוכרים ומחזיקים ניירות ערך: קרנות סל וקרנות מחקות ישראליות, קרנות חוץ שנסחרות בתל אביב, מק״מ ואיגרות חוב ממשלתיות. דרך <Term id="ברוקר זר">ברוקר זר</Term> אפשר לקנות גם <Term id="קרן זרה">קרנות זרות</Term> בבורסות בחו״ל.
        </p>
        <p className="max-w-measure">אין תקרת הפקדה ואין נעילה: מוכרים בכל יום מסחר, והבורסה פתוחה מיום שני עד יום שישי.</p>
        <Sentence measure>
          על רווח ממכירה משלמים <Term id="מס רווחי הון">מס רווחי הון</Term>, ורק כשמוכרים. על דיבידנד או חלוקה מקרן משלמים כשהם משולמים. בבנק או אצל חבר בורסה בישראל המס מנוכה במקור במכירה: {rate ? <Num value={rate} /> : null} <Term prefix="מה" id="רווח הון ריאלי">רווח הריאלי</Term>, כלומר מהרווח שמעבר לאינפלציה. בנייר ערך שנסחר בישראל ונקוב במטבע חוץ או צמוד אליו, זה הרווח שמעבר לשינוי בשער של המטבע. גם <Term id="מכירה">מכירה</Term> של קרן אחת כדי לקנות אחרת ממוסה, אף שהכסף נשאר בחשבון.
        </Sentence>
        <RulesLine ids={["BRK-01", "BRK-32", "BRK-29", "TXS-01", "TXS-04", "TXS-05", "TXS-21", "TXS-12", "TXF-11", "ETF-04", "ETF-26"]} />
      </>
    );
  },
  who: ({ figure }) => {
    const members = figure("REG-14", "member_count");
    return (
      <>
        <Sentence measure>
          רק דרך חבר בורסה אפשר לקנות ולמכור בבורסה בתל אביב. יש {members ? <Num value={members} /> : null} חברים: בנקים, בתי השקעות שהם <Term id="חש&quot;ב">חש״בים</Term> וחברים רחוקים, ולא כולם משרתים לקוחות פרטיים.
        </Sentence>
        <p className="max-w-measure">
          כל אחד מהם קובע <Term id="התעריפון המלא">תעריפון</Term> משלו. הבורסה מפרסמת לכל חבר גם את העמלות שגבה בפועל, לפי סוג נייר וגודל התיק, וחבר בורסה חייב לומר לכם על הפרסום הזה לפני פתיחת החשבון.
        </p>
        <p className="max-w-measure">
          ברוקר זר שמציע לציבור בישראל מסחר בבורסות בחו״ל צריך <Term id="היתר לפי סעיף 49א">היתר לפי סעיף 49א</Term>. הוא לא בפיקוח רשות ניירות ערך, וההיתר לא אומר דבר על איכות השירות או על הסיכון. הרשות מפרסמת את רשימת בעלי ההיתר. בלי היתר מותר לפנות לגוף זר רק ביוזמתכם, ורק אם הוא לא פועל בישראל ולא פנה לאיש בישראל.
        </p>
        <RulesLine ids={["BRK-01", "BRK-32", "REG-14", "BRK-15", "BRK-33", "BRK-06"]} />
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
    const usTreaty = figure("TXF-12", "us_withholding");
    const usNoForm = figure("TXF-13", "us_withholding_without_form");
    return (
      <>
        <Sentence measure>
          על מק״מ ואיגרת חוב לא צמודה המס במכירה הוא {unlinked ? <Num value={unlinked} /> : null} מכל הרווח, בלי הפחתה של האינפלציה.
        </Sentence>
        <p className="max-w-measure">
          הפסד ממכירה מתקזז מרווחים של אותה שנה באותו בנק או בית השקעות. <Term id="קיזוז הפסדים">קיזוז</Term> בין מוסדות, או <Term id="הפסד מועבר">העברת הפסד</Term> לשנים הבאות, דורשים דוח שנתי.
        </p>
        <Sentence measure>
          מי שכל המס נוכה לו במקור, ותמורת המכירות שלו נמוכה מ־{ceiling ? <Num value={ceiling} display={fmt.nisWhole(Number(ceiling.value))} /> : null} בשנה, לא חייב בדוח שנתי רק בגלל החשבון.
        </Sentence>
        <p className="max-w-measure">אצל ברוקר זר לא מנכים מס בישראל. מדווחים ומשלמים מקדמה פעמיים בשנה, ומגישים דוח שנתי.</p>
        <Sentence measure>
          על דיבידנד מחברה אמריקאית יש גם מס בארצות הברית: עד {usTreaty ? <Num value={usTreaty} /> : null} למי שמסר לברוקר טופס W-8BEN, ובלי הטופס הניכוי עשוי להיות {usNoForm ? <Num value={usNoForm} /> : null}. את המס הזה מקזזים מהמס בישראל, עד גובה המס הישראלי על אותה הכנסה.
        </Sentence>
        <Callout tone="blocked" className="max-w-measure">
          <span className="font-medium">קרן זרה צוברת, שלא מחלקת דיבידנד.</span> חלק מהקרנות האלה מדווחות בנספח לתשקיף הישראלי שלהן שקיבלו החלטת מיסוי מרשות המסים: מס רק במכירה ובחלוקה. קרן כזו האתר מחשב לפי ההחלטה ומדרג. על קרן צוברת בלי החלטה כזו שום מקור רשמי לא אומר זאת במפורש: האתר מניח שמשלמים עליה מס רק במכירה, מסמן זאת ״מקור משני״ ואינו מדרג אותה. שאלה פתוחה (<IdRef id="TXF OQ1" />).
        </Callout>
        <RulesLine ids={["TXS-03", "TXI-12", "TXS-17", "TXS-18", "TXS-19", "TXG-17", "TXF-22", "TXG-20", "TXF-12", "TXF-13", "TXF-18", "TXF-11"]} />
      </>
    );
  },
  risks: ({ figure }) => {
    const estate = figure("TXF-27", "estate_threshold");
    return (
      <>
        <p className="max-w-measure">
          השווי עולה ויורד כל יום עם מחירי ניירות הערך שבחשבון, ובקרן על מדד זר גם עם שער המטבע. אין ערבות של המדינה, ולא נמצאה בישראל קרן פיצוי למשקיעים.
        </p>
        <p className="max-w-measure">
          בבית השקעות שהוא חש״ב, כללי הבורסה מחייבים להחזיק את ניירות הערך והכסף של הלקוחות בנפרד מרכוש החברה, בנאמנות, <Term prefix="ב" id="מסלקת הבורסה">מסלקת הבורסה</Term> ובבנקים, עם ביקורת שנתית. בבנק, המפקח על הבנקים מחייב לרשום ולהפריד את נכסי הלקוחות כך שאפשר לזהות אותם בנפרד מנכסי הבנק, ולעבור ביקורת חיצונית לפחות פעם בשנה.
        </p>
        <p className="max-w-measure">
          מה קורה לנכסים אם הבנק או בית ההשקעות קורסים, לא נמצא בשום חוק. שאלות פתוחות (<IdRef id="REG OQ9" />, <IdRef id="REG OQ10" />).
        </p>
        <Sentence measure>
          אצל ברוקר אמריקאי שחבר ב־<Term id="SIPC">SIPC</Term>, הגוף הזה מפצה עד תקרה אם הברוקר קורס, אבל לא על ירידת ערך. ההגנה לא חלה על חברות לא אמריקאיות באותה קבוצה.
        </Sentence>
        <Sentence measure>
          מניות של חברה אמריקאית, כולל קרן סל שהתאגדה בארצות הברית, נחשבות נכס אמריקאי. אם הנכסים האלה עולים על {estate ? <><Num value={estate} /> דולר</> : "סף נמוך"} במות המחזיק, מנהל העיזבון חייב להגיש דוח מס ירושה אמריקאי, כי לישראל אין אמנה בנושא. מניות של קרן אירית הן נכס שמחוץ לארצות הברית. אם קרן אמריקאית שמאוגדת כנאמנות נספרת, ומהם שיעורי המס, לא נבדק.
        </Sentence>
        <RulesLine ids={["BRK-07", "BRK-08", "BRK-10", "REG-15", "REG-16", "REG-04", "REG-27", "TXF-27", "ETF-10"]} />
      </>
    );
  },
  use: () => (
    <>
      <p className="max-w-measure">
        כסף שרוצים להשקיע בקרן על מדד בלי תקרה ובלי נעילה. זה מתאים במיוחד כשעוברים את תקרת ההפקדה השנתית של קופת גמל להשקעה, או כשמתכוונים לקנות קרן אחת ולהחזיק אותה שנים. משלמים עמלות על פעולות ועל ההחזקה לפי התעריפון, ודמי הניהול של קרן סל או קרן מחקה נמוכים בממוצע מהתקרה של קופת גמל.
      </p>
      {/* audit A84: the costs in the example chart above, from the records the example reads (P-05's fund 5139282; the tariff is the site's pick, F-80, named in the terms block, 2026-10-31) */}
      <p className="max-w-measure text-sm text-muted-foreground">
        ההוצאות בדוגמה שלמעלה הן שתיים. האחת היא העלות בתוך הקרן שנבחרה לדוגמה, <bdi>ילין לפידות מחקה (4D) S&amp;P 500</bdi>: <bdi>0.02%</bdi> בשנה, כולה שכר נאמן, ודמי ניהול של <bdi>0%</bdi>, לפי רשומת הקרן והדוח השנתי של מנהל הקרן. אפשר להחליף אותה בקרן אחרת בכרטיס ההשוואה. השנייה היא העמלות על קנייה, מכירה והחזקה, לפי התעריפון שהאתר בחר, ששמו מופיע בתנאי המוצר בדוגמה. בבנק או בבית השקעות אחר העמלות שונות. בקופת גמל אין להן שורה מקבילה בדמי הניהול, כי עלויות המסחר שם נכנסות להוצאות הישירות.
      </p>
      <p className="max-w-measure">
        קופת גמל להשקעה עדיפה כשצפויים להחליף השקעה בדרך: שם מעבר בין מסלולים לא נחשב מכירה, וכאן כל החלפת קרן ממוסה ומקטינה את הצבירה. היא עדיפה גם למי שרוצה את האפשרות, מגיל פרישה מוקדמת, להעביר את הכסף לקצבה פטורה ממס.
      </p>
      <RulesLine ids={["KGL-02", "KGL-03", "PF-02", "PF-12", "ETF-13", "ETF-17", "BRK-16", "TXS-21", "TXK-04", "TXK-10", "TXS-09"]} />
    </>
  ),
};

export { RuleRef };
