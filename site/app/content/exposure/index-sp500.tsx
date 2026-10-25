// Exposure prose for מדד S&P 500 (flows 6.6). Written 2026-10-23 from the rule base (ETF, TXS, TXF, CAT, IRA,
// BRK). The index itself is explained from S&P Dow Jones Indices' own index page and methodology (ETF-37 to
// ETF-40, read in the founder's Chrome the same day; product.md D18). Each block ends with the rules it rests
// on. NEW copy for the founder to review.
import type { ExposureContent } from "../guide/types";
import { Num, RulesLine, Term } from "../../components/provenance";
import { Sentence } from "../../components/kit";

const OQ = ({ id }: { id: string }) => (
  <bdi dir="ltr" className="whitespace-nowrap">
    {id}
  </bdi>
);

export const content: ExposureContent = {
  what: ({ figure }) => {
    const onTase = figure("ETF-32", "foreign_funds_traded_on_tase");
    const companies = figure("ETF-37", "constituent_companies");
    const coverage = figure("ETF-37", "market_cap_coverage");
    const minCap = figure("ETF-38", "min_market_cap_usd");
    const notice = figure("ETF-39", "announcement_notice_business_days");
    const versions = figure("ETF-40", "return_versions");
    return (
      <>
        <p className="max-w-measure">
          הכסף מושקע, דרך קרן, במניות של חברות אמריקאיות לפי מדד S&P 500, ובדולר: <Term prefix="ה" id="נכס מעקב">נכס המעקב</Term> של קרן ישראלית על המדד הוא "S&P 500 100%, דולר ארה"ב 100%", בגרסת תשואה כוללת נטו, אלא אם הקרן <Term id="מגודרות מט&quot;ח">מנוטרלת מט"ח</Term>.
        </p>
        <Sentence measure>
          עורך המדד, S&P Dow Jones Indices, מתאר את <Term id="S&P 500">S&P 500</Term> כמדד הייחוס הטוב ביותר למניות הגדולות בארצות הברית: {companies ? <Num value={companies} /> : null} חברות מובילות, שמכסות בערך {coverage ? <Num value={coverage} /> : null} משווי השוק הזמין להשקעה, והוא מחושב בדולרים. נכנסות אליו רק חברות אמריקאיות שנסחרות בבורסה אמריקאית, עם שווי שוק של לפחות {minCap ? <Num value={minCap} display="22.7 מיליארד דולר" /> : null}, סחירות מספקת ורווח חשבונאי חיובי ברבעון האחרון ובארבעת הרבעונים האחרונים יחד; ועדת מדדים בוחרת את ההרכב לפי התנאים האלה ולפי איזון בין ענפים, ומספר החברות קבוע. משקל כל חברה הוא שווי השוק של מניותיה שבידי הציבור, בלי תקרה למניה אחת; הוועדה מחליפה חברות לפי הצורך, בהודעה של לפחות {notice ? <Num value={notice} /> : null} ימי עסקים מראש, ומספרי המניות מתעדכנים פעם ברבעון.
        </Sentence>
        <Sentence measure>
          למדד {versions ? <Num value={versions} /> : null} גרסאות: מחיר בלבד; תשואה כוללת ברוטו, שבה <Term prefix="ה" id="דיבידנד">דיבידנדים</Term> מושקעים מחדש במדד בלי מס; ותשואה כוללת נטו, שבה הם מושקעים מחדש אחרי ניכוי מס במקור בארצות הברית. הקרנות הישראליות עוקבות אחרי הגרסה נטו, כלומר מדד הייחוס שלהן כבר מניח שחלק מהדיבידנד הלך למס.
        </Sentence>
        <Sentence measure>
          יש שלוש דרכים להחזיק את המדד דרך חשבון ניירות ערך: <Term id="קרן סל">קרן סל</Term> או <Term id="קרן מחקה פתוחה">קרן מחקה</Term> ישראלית, ששתיהן קרנות נאמנות ישראליות; <Term id="קרן חוץ">קרן חוץ</Term> שרשומה למסחר בתל אביב, אחת מ{onTase ? <Num value={onTase} /> : null} קרנות כאלה, שקונים רק בבורסה; או <Term id="קרן זרה">קרן זרה</Term> בבורסה בחו"ל דרך ברוקר. קרן ישראלית על מדד זר משיגה את החשיפה בדרך כלל דרך <Term id="עסקת החלף שאינה במימון">עסקת החלף</Term>, וקרן זרה מחזיקה את המניות עצמן. רשות ניירות ערך מפרסמת ממוצע שנתי של דמי הניהול של קרנות סל על מניות חו"ל; הוא מופיע בקישור שבכרטיס הכלל. כל קרן קובעת לעצמה, ויש גם עמלת יצירה ופדיון, <Term id="דמי ניהול משתנים">דמי ניהול משתנים</Term> <Term prefix="ו" id="הפרש עקיבה">הפרש עקיבה</Term>.
        </Sentence>
        <RulesLine ids={["ETF-10", "ETF-37", "ETF-38", "ETF-39", "ETF-40", "ETF-01", "ETF-04", "ETF-26", "ETF-32", "ETF-28", "ETF-11", "ETF-13", "ETF-14", "ETF-17", "ETF-05", "ETF-09"]} />
      </>
    );
  },
  holdNote: ({ figure }) => {
    const rate = figure("TXS-09", "rate");
    const lock = figure("TXH-09", "lock_years");
    const top = figure("TXH-11", "rate");
    return (
      <>
        <Sentence measure>
          בחשבון ניירות ערך ובניהול אישי בוחרים את הקרן בעצמכם; בקופת גמל להשקעה, בקרן השתלמות ובקרן פנסיה יש מסלול "עוקב מדד S&P 500" שהחברה המנהלת מנהלת. המס שונה: בקרן ישראלית <Term id="קרן נאמנות פטורה">פטורה</Term> משלמים {rate ? <Num value={rate} /> : null} מהרווח הריאלי במכירה, והרווח הריאלי של קרן שקלית נמדד מול המדד בישראל, כך שגם עליית הדולר ממוסה; בקרן זרה הרווח נמדד מול שער הדולר, ודיבידנד מחברה אמריקאית נושא מס אמריקאי שמתקזז מהמס בישראל. בתוך קופה, רווחים ודיבידנדים של המסלול פטורים ממס בישראל כל עוד הכסף בפנים. המס נקבע במשיכה לפי סוג הקופה: בקרן השתלמות המשיכה פטורה אחרי {lock ? <Num value={lock} /> : null} שנים על רווחי ההפקדות עד התקרה, ורווח על הפקדה מעל התקרה ממוסה עד {top ? <Num value={top} /> : null}, ושאלה פתוחה אחת עדיין נשארת: האם הבסיס הוא הרווח הריאלי (<OQ id="TXH OQ1" />). מס אמריקאי שנוכה מדיבידנד בתוך קופה הוא עלות, ואין מקור שאומר אם אפשר להקטין אותו (<OQ id="TXK OQ7" />).
        </Sentence>
        <RulesLine ids={["CAT-10", "CAT-17", "CAT-18", "CAT-24", "IRA-11", "TXS-09", "TXS-13", "TXS-14", "TXF-03", "TXF-04", "TXF-08", "TXF-12", "TXF-13", "TXF-16", "TXK-03", "TXK-17", "TXK-18", "TXH-09", "TXH-11", "TXH-18", "TXP-13"]} />
      </>
    );
  },
  risks: () => (
    <>
      <p className="max-w-measure">
        השווי עולה ויורד עם מניות החברות שבמדד ועם שער הדולר, ושני הדברים יכולים לרדת יחד. מחיר קרן סל בבורסה במהלך היום יכול להיות שונה משווי הנכסים שלה, ובמסחר בתל אביב כשוול סטריט סגורה הפער גדל; קרן ישראלית שמחזיקה חוזי החלף נושאת סיכון של הצד השני לעסקה. קרן יכולה להתפרק בהודעה מראש, ומנהל רשאי להעלות דמי ניהול בתחילת שנה.
      </p>
      <p className="max-w-measure">
        קרן חוץ וקרן זרה אינן בפיקוח רשות ניירות ערך; הנספח הישראלי של קרן חוץ חייב לומר זאת. קרן זרה הרשומה בארצות הברית חושפת את העיזבון למס עיזבון אמריקאי; קרן זרה צוברת, שאינה מחלקת, ממוסה לפי קריאה שעוד לא אושרה במקור רשמי (<OQ id="TXF OQ1" />). מגבלות אירופיות על קנייה של קרנות אמריקאיות אצל ברוקר באירופה לא נבדקו (<OQ id="ETF OQ11" />).
      </p>
      <RulesLine ids={["ETF-06", "ETF-11", "ETF-21", "ETF-14", "ETF-22", "ETF-24", "TXF-27", "TXF-11"]} />
    </>
  ),
  termIds: ["נכס מעקב", "דיבידנד", "מגודרות מט\"ח", "קרן סל", "קרן מחקה פתוחה", "קרן חוץ", "קרן זרה", "עסקת החלף שאינה במימון", "דמי ניהול משתנים", "הפרש עקיבה", "קרן נאמנות פטורה", "S&P 500", "עוקב מדד S&P 500", "פרופיל חשיפה", "מספר בורסה", "ISIN", "TER", "UCITS", "קרן שאינה מחלקת", "קרן מחלקת", "טופס W-8BEN"],
};
