// Guide prose for קרן כספית מתחדשת (the fixed-date, renewable money-market fund). Same shape as
// kupat-gemel-lehashkaa.tsx: every figure is a Num over a rule figure, every block ends with the rules it rests on
// (il-finance MF, TXS, TXI, BANK, BRK, REG). NEW copy for the founder to review.
import type { GuideContent } from "./types";
import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Sentence } from "../../components/kit";
import { fmt } from "../../lib/format";

export const content: GuideContent = {
  what: ({ figure }) => {
    const maxBeyond = figure("MF-36", "max_share_maturing_after_next_fixed_date");
    const maxInterval = figure("MF-08", "max_interval_months");
    const noticeAfter = figure("MF-38", "advance_notice_min_interval_years");
    const distCap = figure("MF-24", "distribution_fee_cap_money_market");
    const foreign = figure("MF-11", "foreign_securities_line");
    return (
      <>
        <p className="max-w-measure">
          התקופה יכולה להיות, למשל, שבוע, חודש או רבעון, והכסף נעול עד המועד הקבוע הבא. בסוף התקופה הכסף מושקע מחדש אוטומטית לתקופה הבאה, אלא אם ביקשתם <Term prefix="ל" id="פדיון">פדות</Term>.
        </p>
        <Sentence measure>
          בניגוד <Term prefix="ל" id="קרנות כספיות יומיות">קרן כספית יומית</Term>, <Term id="מנהל קרן">מנהל הקרן</Term> יכול לפרסם <Term id="תשואה צפויה">תשואה צפויה</Term>, בתנאי שלכל היותר {maxBeyond ? <Num value={maxBeyond} /> : null} מהנכסים נפרעים אחרי המועד הקבוע הבא. היא מוצגת במונחים שנתיים, אחרי <Term id="דמי ניהול">דמי הניהול</Term> ושכר <Term prefix="ה" id="נאמן">נאמן</Term> ולפני מס. זו הערכה של מנהל הקרן, לא התחייבות.
        </Sentence>
        <p className="max-w-measure">
          קרנות לאותה תקופה עם מועדים שונים מוצעות כסדרות של קרן אחת, והתאריך מופיע בשם הסדרה.
        </p>
        <RulesLine ids={["MF-07", "MF-08", "MF-35", "MF-36", "MF-37"]} />
        <Sentence measure>
          המרווח בין מועדים קבועים הוא עד {maxInterval ? <Num value={maxInterval} /> : null} חודשים, אלא אם <Term id="רשות ניירות ערך">רשות ניירות ערך</Term> התירה יותר. רק בקרנות שבהן המרווח בין מועדים קבועים ארוך {noticeAfter ? <>מ<Num value={noticeAfter} display={fmt.years(Number(noticeAfter.value))} /></> : "מהתקופה שבתקנות"} הפדיון יכול לדרוש הודעה מוקדמת. כשהמרווח {noticeAfter ? <><Num value={noticeAfter} display={fmt.years(Number(noticeAfter.value))} /> או יותר</> : "ארוך"}, מנהל הקרן שולח לפני המועד תזכורת. מנהל הקרן מפרסם מחיר רק למועד הקבוע.
        </Sentence>
        <RulesLine ids={["MF-08", "MF-38", "MF-09"]} />
        <p className="max-w-measure">
          קונים <Term id="יחידה">יחידות</Term> דרך <Term id="חשבון ניירות ערך">חשבון ניירות ערך</Term> בבנק או <Term prefix="ב" id="בית השקעות">בית השקעות</Term> שהוא <Term id="חבר בורסה">חבר בורסה</Term>, שהחוק קורא לו <Term id="מפיץ">מפיץ</Term>, לפי שם הסדרה או המספר שלה <Term prefix="ב" id="בורסה">בורסה</Term>. ההוראה צריכה להגיע עד <Term id="השעה היעודה">השעה היעודה</Term> של המועד הקבוע, וגם הפדיון נעשה רק במועד הקבוע. יחידות של סדרה חדשה מוצעות רק כמה ימים אחרי תאריך הסדרה.
        </p>
        <p className="max-w-measure">
          בטבלת <Term id="מוצרי שוק הכסף">מוצרי שוק הכסף</Term> הבנק מציג קרן כזו רק אם מנהל הקרן דיווח על תשואה צפויה.
        </p>
        <Sentence measure>
          מתי הכסף מפדיון מגיע לחשבון תלוי בקרן. בקרן שמדיניות ההשקעות שלה מגבילה <Term id="נייר ערך">ניירות ערך</Term> זרים ל־{foreign ? <Num value={foreign} /> : null} מהנכסים, הוא מגיע באותו יום, אם ההוראה ניתנה לפני השעה היעודה. בקרן שיכולה להחזיק יותר, הוא מגיע ביום המסחר הבא <RuleRef id="MF-11" end="." />
        </Sentence>
        <RulesLine ids={["MF-11", "MF-10", "MF-35", "BANK-15", "MF-15"]} />
        <p className="max-w-measure">
          דמי הניהול ושכר הנאמן כבר מופחתים מהתשואה הצפויה שמוצגת. רשות ניירות ערך מפרסמת ממוצע שנתי לקטגוריה; הוא מופיע בקישור שבכרטיס של המספר שלמטה.
        </p>
        <Sentence measure>
          בבנק: מתוך דמי הניהול מנהל הקרן משלם לבנק <Term id="עמלת הפצה">עמלת הפצה</Term> של עד {distCap ? <Num value={distCap} /> : null} בשנה. כשיש הסכם הפצה כזה, הבנק לא יכול לגבות מכם <Term id="עמלה">עמלה</Term> על קנייה, החזקה או פדיון של <Term id="קרן כספית">קרן כספית</Term>. בלי הסכם, הוא יכול לגבות מכם עד גובה עמלת ההפצה. <Term id="דמי ניהול פיקדון ניירות ערך">דמי ניהול פיקדון ניירות ערך</Term> על קרן כספית בנק לא יכול לגבות בשום מקרה.
        </Sentence>
        <p className="max-w-measure">
          רוב בתי ההשקעות הם משווקי השקעות, ואצלם לא נמצא כלל שמגביל את העמלות, והן לפי התעריפון. בית השקעות שהוא לא משווק השקעות כפוף לאותם כללים כמו הבנק.
        </p>
        <p className="max-w-measure">תוספת בקנייה או <Term id="ניכוי בפדיון">ניכוי בפדיון</Term> אפשריים רק אם הסכם הקרן קובע אותם.</p>
        <RulesLine ids={["MF-37", "MF-16", "MF-20", "MF-18", "MF-24", "MF-26", "BANK-18", "BRK-17", "MF-27", "MF-21", "MF-22"]} />
      </>
    );
  },
  who: () => (
    <>
      <p className="max-w-measure">
        מנהלי <Term id="קרן נאמנות">קרנות נאמנות</Term> שקיבלו אישור מרשות ניירות ערך. היא מפקחת עליהם, על הנאמנים ועל הקרנות לפי חוק השקעות משותפות בנאמנות. כל הסדרות של קרן מתחדשת מוצעות לפי <Term id="תשקיף">תשקיף</Term> אחד שהיא התירה.
      </p>
      <p className="max-w-measure">
        אילו מנהלים מציעים קרנות מתחדשות, לא נמצא במקור רשמי. שאלה פתוחה <IdRef id="MF OQ11" end="." />
      </p>
      <RulesLine ids={["REG-07", "MF-01", "MF-04", "MF-35", "MF-07"]} />
    </>
  ),
  termIds: [
    "קרן כספית",
    "קרנות כספיות יומיות",
    "מנהל קרן",
    "תשואה צפויה",
    "דמי ניהול",
    "נאמן",
    "פדיון",
    "חידוש אוטומטי",
    "יחידה",
    "חשבון ניירות ערך",
    "חבר בורסה",
    "מפיץ",
    "השעה היעודה",
    "מוצרי שוק הכסף",
    "עמלת הפצה",
    "דמי ניהול פיקדון ניירות ערך",
    "תשקיף",
    "קרן נאמנות פטורה",
    "קרן נאמנות חייבת",
    "רווח הון ריאלי", "מס רווחי הון",
    "ניכוי מס במקור",
    "קיזוז הפסדים",
    "פיקדון",
    "שבירת פיקדון",
    "ריבית בנק ישראל",
    'קרן כספית מט"ח',
    "בעלי היחידות",
    "מעמד מס",
    "נומינלי",
    "דיבידנד",
    "רווח הון",
    "מס נוסף",
    "מדד המחירים לצרכן",
    "קרן נאמנות",
    'מק"מ',
    "לא צמוד",
    "ריבית",
    "ניכוי בפדיון",
    "נייר ערך",
    "בורסה",
    "מרווח",
    "רשות ניירות ערך",
    "מדד",
    "מכירה",
  ],
  afterTax: ({ figure }) => {
    const rate = figure("TXS-12", "rate");
    const total = figure("TXS-24", "money_market_funds_count");
    const taxable = figure("TXS-24", "money_market_funds_taxable");
    return (
      <>
        <Sentence measure>
          רוב הקרנות הכספיות הן <Term id="קרן נאמנות פטורה">קרנות נאמנות פטורות</Term>: הקרן עצמה לא משלמת מס, ואתם משלמים מס רווחי הון רק בפדיון, של עד {rate ? <Num value={rate} /> : null} <Term prefix="מ" id="רווח הון ריאלי">הרווח הריאלי</Term>, כלומר מהרווח שמעבר לעליית <Term id="מדד המחירים לצרכן">מדד המחירים לצרכן</Term>. התשואה הצפויה שמוצגת היא לפני המס הזה. לפי מסקנת האתר, <Term id="חידוש אוטומטי">חידוש אוטומטי</Term> במועד הקבוע הוא לא פדיון, ולכן המס נדחה עד שפודים בפועל.
        </Sentence>
        <p className="max-w-measure">
          הבנק או בית ההשקעות מנכים את המס <Term id="ניכוי מס במקור">במקור</Term>. אם הוא נוכה במלואו, אין צורך בדיווח נפרד על <Term prefix="ה" id="מכירה">מכירה</Term>. <Term id="מס נוסף">מס נוסף</Term> על הכנסות גבוהות, אם הוא חל, מוסדר בדוח השנתי.
        </p>
        <p className="max-w-measure">
          הפסד בפדיון אפשר <Term id="קיזוז הפסדים">לקזז</Term> <Term prefix="מ" id="רווח הון">רווחי הון</Term> ומריבית <Term prefix="ו" id="דיבידנד">דיבידנד</Term> על ניירות ערך באותה שנה. בשנים הבאות אפשר לקזז אותו מרווחי הון בלבד, אם הוגש דוח לשנת ההפסד.
        </p>
        <Sentence measure>
          אם <Term prefix="ה" id="מדד">מדד</Term> יורד בתקופת ההחזקה, לא מפחיתים כלום מהרווח: המס חל על כל הרווח <Term prefix="ה" id="נומינלי">נומינלי</Term> ולא יותר ממנו. אם יש הפסד, החלק שלו ששווה לירידת המדד לא מתקזז <RuleRef id="TXS-02" end="." />
        </Sentence>
        <Sentence measure>
          {taxable ? <Num value={taxable} /> : null} קרנות כספיות מתוך {total ? <Num value={total} /> : null} הן <Term id="קרן נאמנות חייבת">קרנות נאמנות חייבות</Term>: הקרן משלמת את המס בעצמה, אתם לא משלמים בפדיון, והפסד בהן לא מתקזז. מעמד המס של כל קרן מופיע ברשימת הקרנות של הבורסה ובתשקיף שלה, בשדה <Term id="מעמד מס">מסלול המס</Term>.
        </Sentence>
        <RulesLine ids={["TXS-07", "TXS-08", "TXS-09", "TXS-12", "TXS-02", "MF-37", "MF-35", "TXS-05", "TXG-09", "TXS-17", "TXS-18", "TXS-19", "TXS-24", "TXS-11"]} />
      </>
    );
  },
  risks: ({ figure }) => {
    const days = figure("REG-11", "trustee_replacement_days");
    return (
      <>
        <p className="max-w-measure">
          נכסי הקרן שייכים לנאמן לטובת <Term id="בעלי היחידות">בעלי היחידות</Term>, בנפרד משאר הרכוש שלו, ואי אפשר לעקל אותם. הנאמן מפקח על מנהל הקרן.
        </p>
        <Sentence measure>
          אם מנהל הקרן קורס, ניהול הקרן עובר למנהל אחר. אם הנאמן קורס, מנהל הקרן צריך למנות נאמן מאושר אחר{days ? <> בתוך <Num value={days} /> ימים</> : null}, ואם זה לא קורה, הרשות יכולה להורות להעביר את הקרן למנהל אחר. מה קורה לכסף בחדלות הפירעון של מנהל הקרן עצמו לא כתוב במפורש. שאלה פתוחה <IdRef id="REG OQ22" end="." /> אין ערבות של המדינה לשווי הקרן, וגם לפיקדונות בבנק אין ביטוח.
        </Sentence>
        <p className="max-w-measure">
          התשואה הצפויה לא מובטחת: מנהל הקרן מעדכן אותה עד המועד הקבוע, ואחריו מדווח כמה התקבל בפועל. הקרן יכולה להחזיק את כל נכסיה בפיקדונות בבנקים שנפרעים לפני המועד, ואז הסיכון הוא של הבנקים שבהם הכסף מופקד.
        </p>
        <p className="max-w-measure">
          בין מועדים אין נזילות כלל, ובמקרים חריגים אפשר להפסיק פדיונות לכמה ימי מסחר. <Term id={'קרן כספית מט"ח'}>קרן כספית מט״ח</Term> חשופה גם <Term prefix="ל" id="שער חליפין">שער המטבע</Term>.
        </p>
        <RulesLine ids={["MF-02", "MF-03", "REG-10", "REG-11", "MF-36", "MF-37", "MF-31", "MF-35", "MF-13", "MF-41", "MF-32", "BANK-23"]} />
      </>
    );
  },
  use: ({ figure }) => {
    const depositRate = figure("TXI-03", "rate");
    const fundRate = figure("TXS-12", "rate");
    return (
      <>
        <p className="max-w-measure">
          כסף שלא תצטרכו עד תאריך ידוע. בוחרים תקופה ורואים מראש את התשואה הצפויה. לפי רשות ניירות ערך, שינוי ב<Term id="ריבית בנק ישראל">ריבית בנק ישראל</Term> בתוך התקופה לא משפיע על <Term prefix="ה" id="תשואה">תשואה</Term> של הקרן, אבל היא לא מובטחת, ומתקופה לתקופה היא יכולה להשתנות.
        </p>
        <p className="max-w-measure">
          לכסף שצריך להישאר זמין מתאימה קרן כספית יומית, שנפדית בכל יום מסחר ושהתשואה שלה זזה עם <Term prefix="ה" id="ריבית">ריבית</Term>.
        </p>
        <p className="max-w-measure">
          מול <Term id="פיקדון">פיקדון</Term> לאותה תקופה שניהם נעולים, אבל בפיקדון הריבית או <Term prefix="ה" id="מרווח">מרווח</Term> קבועים בהסכם, והבנק יכול להסכים <Term prefix="ל" id="שבירת פיקדון">שבירה</Term> במחיר. בקרן אין פדיון לפני המועד, והתשואה היא הערכה.
        </p>
        <Sentence measure>
          במס, על ריבית מפיקדון שקלי <Term id="לא צמוד">לא צמוד</Term> משלמים מס הכנסה של {depositRate ? <Num value={depositRate} /> : null} מכל הריבית, ובקרן כספית פטורה <Term id="מס רווחי הון">מס רווחי הון</Term> של עד {fundRate ? <Num value={fundRate} /> : null} רק מהרווח שמעבר <Term prefix="ל" id="אינפלציה">אינפלציה</Term>. כשהאינפלציה גבוהה, בקרן משלמים פחות מס, וכשהיא נמוכה, בפיקדון. מי מנצח תלוי באינפלציה, בריבית ובתקופה. הפסד בקרן אפשר לקזז; הפסד בפיקדון לא.
        </Sentence>
        <p className="max-w-measure">
          הבנק חייב להציג פיקדונות, קרנות כספיות <Term prefix="ו" id={'מק"מ'}>מק״מ</Term> זה ליד זה, מסוננים לפי תקופה. התשואה הצפויה שמוצגת שם היא אחרי דמי הניהול ולפני מס רווחי הון ועמלות בנק.
        </p>
        <p className="max-w-measure">
          בעמוד הזה אין חישוב לאורך זמן, כי בהפקדה חודשית לא נקבע איזו סדרה קונה כל הפקדה.
        </p>
        <RulesLine ids={["MF-35", "MF-37", "MF-41", "MF-34", "BANK-06", "TXI-03", "TXI-07", "TXS-12", "TXS-22", "TXS-17", "TXI-25", "BANK-15"]} />
      </>
    );
  },
};

export { RuleRef };
