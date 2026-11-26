// Guide prose for קרן כספית מתחדשת (the fixed-date, renewable money-market fund). Same shape as
// kupat-gemel-lehashkaa.tsx: every figure is a Num over a rule figure; the words that state a rule open it (Ruled, D116), and a
// figure from a rule opens it from its sheet (il-finance MF, TXS, TXI, BANK, BRK, REG). NEW copy for the founder to review.
import type { GuideContent } from "./types";
import { IdRef, Num, ProofsChip, Ruled, Term } from "../../components/provenance";
import { Sentence } from "../../components/kit";
import { fmt } from "../../lib/format";

export const content: GuideContent = {
  what: ({ figure }) => {
    const maxBeyond = figure("MF-36", "max_share_maturing_after_next_fixed_date");
    const maxInterval = figure("MF-08", "max_interval_months");
    const noticeAfter = figure("MF-38", "advance_notice_min_interval_years");
    const distCap = figure("MF-24", "distribution_fee_cap_money_market");
    const foreign = figure("MF-74", "foreign_securities_line");
    return (
      <>
        <p className="max-w-measure">
          התקופה יכולה להיות, למשל, שבוע, חודש או רבעון, והכסף <Ruled id="MF-08">נעול עד המועד הקבוע הבא</Ruled>. בסוף התקופה הכסף <Ruled id="MF-35">מושקע מחדש אוטומטית לתקופה הבאה</Ruled>, אלא אם ביקשתם <Term prefix="ל" id="פדיון">פדות</Term>.
        </p>
        <Sentence measure>
          בניגוד <Term prefix="ל" id="קרנות כספיות יומיות">קרן כספית יומית</Term>, <Term id="מנהל קרן">מנהל הקרן</Term> <Ruled id="MF-36">יכול לפרסם</Ruled> <Term id="תשואה צפויה">תשואה צפויה</Term>, בתנאי שלכל היותר {maxBeyond ? <Num value={maxBeyond} /> : null} מהנכסים נפרעים אחרי המועד הקבוע הבא. היא מוצגת במונחים שנתיים, אחרי <Term id="דמי ניהול">דמי הניהול</Term> ושכר <Term prefix="ה" id="נאמן">נאמן</Term> ולפני מס. <Ruled id="MF-37">זו הערכה של מנהל הקרן, לא התחייבות</Ruled>.
        </Sentence>
        <p className="max-w-measure">
          קרנות לאותה תקופה עם מועדים שונים מוצעות כסדרות של קרן אחת, והתאריך מופיע בשם הסדרה.
        </p>
        <Sentence measure>
          <Ruled id="MF-08">המרווח בין מועדים קבועים הוא עד</Ruled> {maxInterval ? <Num value={maxInterval} /> : null} חודשים, אלא אם <Term id="רשות ניירות ערך">רשות ניירות ערך</Term> התירה יותר. רק בקרנות שבהן המרווח בין מועדים קבועים ארוך {noticeAfter ? <>מ<Num value={noticeAfter} display={fmt.years(Number(noticeAfter.value))} /></> : "מהתקופה שבתקנות"} הפדיון יכול לדרוש הודעה מוקדמת. כשהמרווח בין מועדים {noticeAfter ? <><Num value={noticeAfter} display={fmt.years(Number(noticeAfter.value))} /> או יותר</> : "ארוך"}, <Ruled id="MF-38">מנהל הקרן שולח לפני המועד תזכורת</Ruled>. <Ruled id="MF-73">מנהל הקרן מפרסם מחיר רק למועד הקבוע</Ruled>.
        </Sentence>
        <p className="max-w-measure">
          קונים <Term id="יחידה">יחידות</Term> דרך <Term id="חשבון ניירות ערך">חשבון ניירות ערך</Term> בבנק או <Term prefix="ב" id="בית השקעות">בית השקעות</Term> שהוא <Term id="חבר בורסה">חבר בורסה</Term>, לפי שם הסדרה או המספר שלה <Term prefix="ב" id="בורסה">בורסה</Term>. החוק קורא לבנק או לבית ההשקעות <Term id="מפיץ">מפיץ</Term>. <Ruled id="MF-73">ההוראה צריכה להגיע עד</Ruled> <Term id="השעה היעודה">השעה היעודה</Term> של המועד הקבוע. גם הפדיון <Ruled id="MF-35">נעשה רק במועד הקבוע</Ruled>. יחידות של סדרה חדשה מוצעות רק כמה ימים אחרי תאריך הסדרה.
        </p>
        <p className="max-w-measure">
          בטבלת <Term id="מוצרי שוק הכסף">מוצרי שוק הכסף</Term> <Ruled id={["BANK-15", "MF-37"]}>הבנק מציג קרן כזו</Ruled> רק אם מנהל הקרן דיווח על תשואה צפויה.
        </p>
        <Sentence measure>
          מתי הכסף מפדיון מגיע לחשבון תלוי בקרן. בקרן שמדיניות ההשקעות שלה מגבילה <Term id="נייר ערך">ניירות ערך</Term> זרים ל־{foreign ? <Num value={foreign} /> : null} מהנכסים, הוא מגיע באותו יום, אם ההוראה ניתנה לפני השעה היעודה. בקרן שיכולה להחזיק יותר, הוא <Ruled id="MF-74">מגיע ביום המסחר הבא</Ruled>.
        </Sentence>
        <p className="max-w-measure">
          דמי הניהול ושכר הנאמן <Ruled id="MF-37">כבר מופחתים מהתשואה הצפויה שמוצגת</Ruled>. <Ruled id="MF-18">רשות ניירות ערך מפרסמת ממוצע שנתי לקטגוריה</Ruled>. הממוצע מופיע בקישור שבכרטיס של המספר שלמטה.
        </p>
        <Sentence measure>
          בבנק: <Ruled id="MF-24">מנהל הקרן משלם לבנק</Ruled> <Term id="עמלת הפצה">עמלת הפצה</Term> של עד {distCap ? <Num value={distCap} /> : null} בשנה. כשיש הסכם הפצה כזה, <Ruled id="MF-71">הבנק לא יכול לגבות מכם</Ruled> <Term id="עמלה">עמלה</Term> על קנייה, החזקה או פדיון של <Term id="קרן כספית">קרן כספית</Term>. בלי הסכם, הוא יכול לגבות מכם עד גובה עמלת ההפצה. <Term id="דמי ניהול פיקדון ניירות ערך">דמי ניהול פיקדון ניירות ערך</Term> על קרן כספית <Ruled id={["BANK-18", "BRK-17"]}>בנק לא יכול לגבות בשום מקרה</Ruled>.
        </Sentence>
        <p className="max-w-measure">
          <Ruled id="BRK-52">רוב בתי ההשקעות הם משווקי השקעות</Ruled>. אצלם לא נמצא כלל שמגביל את העמלות, והן לפי התעריפון. בית השקעות שהוא לא משווק השקעות כפוף לאותם כללים כמו הבנק.
        </p>
        <p className="max-w-measure">תוספת בקנייה או <Term id="ניכוי בפדיון">ניכוי בפדיון</Term> <Ruled id={["MF-21", "MF-22"]}>אפשריים רק אם הסכם הקרן קובע אותם</Ruled>.</p>
      </>
    );
  },
  who: () => (
    <>
      <p className="max-w-measure">
        מנהלי <Term id="קרן נאמנות">קרנות נאמנות</Term> <Ruled id="MF-01">שקיבלו אישור מרשות ניירות ערך</Ruled>. היא מפקחת עליהם, על הנאמנים ועל הקרנות <Ruled id="REG-07">לפי חוק השקעות משותפות בנאמנות</Ruled>. <Ruled id={["MF-04", "MF-35"]}>כל הסדרות של קרן מתחדשת מוצעות לפי</Ruled> <Term id="תשקיף">תשקיף</Term> אחד שהיא התירה.
      </p>
      <p className="max-w-measure">
        לא נמצא במקור רשמי אילו מנהלים מציעים קרנות מתחדשות. שאלה פתוחה <IdRef id="MF OQ11" end="." />
      </p>
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
    "הפסד הון",
    "רשות המסים",
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
    "מטבע חוץ",
  ],
  afterTax: ({ figure }) => {
    const rate = figure("TXS-12", "rate");
    const total = figure("TXS-24", "money_market_funds_count");
    const taxable = figure("TXS-24", "money_market_funds_taxable");
    return (
      <>
        <Sentence measure>
          <Ruled id="TXS-24">רוב הקרנות הכספיות הן</Ruled> <Term id="קרן נאמנות פטורה">קרנות נאמנות פטורות</Term>: <Ruled id="TXS-08">הקרן עצמה לא משלמת מס</Ruled>. אתם משלמים מס רווחי הון <Ruled id="TXS-12">רק בפדיון</Ruled>, של עד {rate ? <Num value={rate} /> : null} <Term prefix="מ" id="רווח הון ריאלי">הרווח הריאלי</Term>, <Ruled id="TXS-09">כלומר מהרווח שמעבר לעליית</Ruled> <Term id="מדד המחירים לצרכן">מדד המחירים לצרכן</Term>. <Ruled id="MF-37">התשואה הצפויה שמוצגת היא לפני המס הזה</Ruled>. <Term id="חידוש אוטומטי">חידוש אוטומטי</Term> במועד הקבוע, בלי הוראת פדיון, <Ruled id="TXS-43">הוא לא פדיון ולא מכירה, ואין בו מס רווחי הון</Ruled>: הוא משולם כשפודים בפועל. <Term id="רשות המסים">רשות המסים</Term> לא כתבה על החידוש במפורש.
        </Sentence>
        <p className="max-w-measure">
          הבנק או בית ההשקעות מנכים את המס <Term id="ניכוי מס במקור">במקור</Term>. <Ruled id="TXS-05">אם הוא נוכה במלואו, אין צורך בדיווח נפרד</Ruled> על <Term prefix="ה" id="מכירה">מכירה</Term>. <Term id="מס נוסף">מס נוסף</Term> <Ruled id="TXG-09">על הכנסות גבוהות</Ruled>, אם הוא חל, מוסדר בדוח השנתי.
        </p>
        <p className="max-w-measure">
          הפסד בפדיון אפשר <Term id="קיזוז הפסדים">לקזז</Term> <Term prefix="מ" id="רווח הון">רווחי הון</Term> ומריבית <Term prefix="ו" id="דיבידנד">דיבידנד</Term> <Ruled id="TXS-17">על ניירות ערך באותה שנה</Ruled>. <Ruled id="TXS-18">בשנים הבאות אפשר לקזז אותו מרווחי הון בלבד</Ruled>, אם הוגש דוח לשנת ההפסד.
        </p>
        <Sentence measure>
          אם <Term prefix="ה" id="מדד">מדד</Term> יורד בתקופת ההחזקה, לא מפחיתים כלום מהרווח: המס חל על כל הרווח <Term prefix="ה" id="נומינלי">נומינלי</Term> ולא יותר ממנו. אם יש הפסד, <Ruled id="TXS-02">החלק שלו ששווה לירידת המדד לא מתקזז</Ruled>.
        </Sentence>
        <Sentence measure>
          {taxable ? <Num value={taxable} /> : null} קרנות כספיות מתוך {total ? <Num value={total} /> : null} הן <Term id="קרן נאמנות חייבת">קרנות נאמנות חייבות</Term>: <Ruled id="TXS-11">הקרן משלמת את המס בעצמה</Ruled>, אתם לא משלמים בפדיון, והפסד בהן לא מתקזז. מעמד המס של כל קרן <Ruled id="TXS-07">מופיע ברשימת הקרנות של הבורסה ובתשקיף שלה</Ruled>, בשדה <Term id="מעמד מס">מעמד המס</Term>.
        </Sentence>
      </>
    );
  },
  risks: ({ figure }) => {
    const days = figure("REG-11", "trustee_replacement_days");
    return (
      <>
        <p className="max-w-measure">
          <Ruled id="MF-02">נכסי הקרן שייכים לנאמן</Ruled> לטובת <Term id="בעלי היחידות">בעלי היחידות</Term>, <Ruled id="MF-02">בנפרד משאר הרכוש שלו, ואי אפשר לעקל אותם</Ruled>. <Ruled id="MF-03">הנאמן מפקח על מנהל הקרן</Ruled>.
        </p>
        <Sentence measure>
          אם מנהל הקרן קורס, <Ruled id="REG-11">ניהול הקרן עובר למנהל אחר</Ruled>. אם הנאמן קורס, מנהל הקרן צריך למנות נאמן מאושר אחר{days ? <> בתוך <Num value={days} /> ימים</> : null}. אם זה לא קורה, הרשות יכולה להורות להעביר את הקרן למנהל אחר. לא כתוב במפורש מה קורה לכסף בחדלות הפירעון של מנהל הקרן עצמו. שאלה פתוחה <IdRef id="REG OQ22" end="." /> אין ערבות של המדינה לשווי הקרן, וגם לפיקדונות בבנק <Ruled id="BANK-23">אין ביטוח</Ruled>.
        </Sentence>
        <p className="max-w-measure">
          <Ruled id="MF-37">התשואה הצפויה לא מובטחת</Ruled>: מנהל הקרן <Ruled id="MF-36">מעדכן אותה עד המועד הקבוע</Ruled>, ואחריו מדווח כמה התקבל בפועל. <Ruled id="MF-31">הקרן יכולה להחזיק את כל נכסיה בפיקדונות בבנקים שנפרעים לפני המועד</Ruled>. אז הסיכון הוא של הבנקים שבהם הכסף מופקד.
        </p>
        <p className="max-w-measure">
          <Ruled id="MF-35">בין מועדים אין נזילות כלל</Ruled>. במקרים חריגים <Ruled id="MF-13">אפשר להפסיק פדיונות</Ruled> לכמה ימי מסחר, ובאישור שר האוצר גם יותר. <Term id={'קרן כספית מט"ח'}>קרן כספית מט״ח</Term> <Ruled id={["MF-41", "MF-32"]}>חשופה גם</Ruled> <Term prefix="ל" id="שער חליפין">שער המטבע</Term>.
        </p>
      </>
    );
  },
  use: ({ figure }) => {
    const depositRate = figure("TXI-03", "rate");
    const fundRate = figure("TXS-12", "rate");
    return (
      <>
        <p className="max-w-measure">
          כסף שלא תצטרכו עד תאריך ידוע. <Ruled id="MF-35">בוחרים תקופה ורואים מראש את התשואה הצפויה</Ruled>. לפי רשות ניירות ערך, שינוי ב<Term id="ריבית בנק ישראל">ריבית בנק ישראל</Term> <Ruled id="MF-35">בתוך התקופה לא משפיע על</Ruled> <Term prefix="ה" id="תשואה">תשואה</Term> של הקרן. אבל <Ruled id="MF-37">היא לא מובטחת</Ruled>, ומתקופה לתקופה היא יכולה להשתנות.
        </p>
        <p className="max-w-measure">
          לכסף שצריך להישאר זמין מתאימה קרן כספית יומית, <Ruled id="MF-34" prefix="ש">נפדית בכל יום מסחר</Ruled> ושהתשואה שלה זזה עם <Term prefix="ה" id="ריבית">ריבית</Term>.
        </p>
        <p className="max-w-measure">
          מול <Term id="פיקדון">פיקדון</Term> לאותה תקופה, שניהם נעולים. אבל בפיקדון <Ruled id="BANK-25">ההסכם קובע את הריבית</Ruled> או את <Term prefix="ה" id="מרווח">מרווח</Term>. ההסכם קובע גם אם הבנק רשאי לשנות אותם, ובאילו תנאים. <Ruled id="BANK-06">הבנק יכול להסכים</Ruled> <Term prefix="ל" id="שבירת פיקדון">שבירה</Term> במחיר. בקרן אין פדיון לפני המועד, והתשואה היא הערכה.
        </p>
        <Sentence measure>
          במס, על ריבית מפיקדון שקלי <Term id="לא צמוד">לא צמוד</Term> משלמים מס הכנסה של {depositRate ? <Num value={depositRate} /> : null} מכל הריבית. בקרן כספית פטורה משלמים <Term id="מס רווחי הון">מס רווחי הון</Term> של עד {fundRate ? <Num value={fundRate} /> : null} רק מהרווח שמעבר <Term prefix="ל" id="אינפלציה">אינפלציה</Term>. באותה תשואה לפני מס, כשהאינפלציה גבוהה, בקרן משלמים פחות מס. כשהיא נמוכה, משלמים פחות מס בפיקדון. מי מנצח תלוי באינפלציה, בריבית ובתקופה. <Ruled id="TXS-17">הפסד בקרן אפשר לקזז</Ruled>. בפיקדון, <Ruled id="TXI-07">שבירה יכולה לפגוע גם בקרן</Ruled>. <Ruled id="TXI-26">החלק מהסכום שהופקד שאבד בשבירה לא מקטין את מס ההכנסה שהבנק מנכה</Ruled>. האתר לא מצא בכללים שקרא אם החלק הזה הוא <Term id="הפסד הון">הפסד הון</Term> <IdRef id="TXI OQ14" end="." /> <Ruled id="TXI-17">הפסד מניירות ערך לא מתקזז מריבית על פיקדון</Ruled>. <ProofsChip ids={["M-10"]} />
        </Sentence>
        <p className="max-w-measure">
          בנק שאפשר לקנות דרכו קרנות כספיות או <Term id={'מק"מ'}>מק״מ</Term> <Ruled id="BANK-15">חייב להציג אותם ליד הפיקדונות</Ruled>, מסוננים לפי תקופה. התשואה הצפויה שמוצגת שם היא אחרי דמי הניהול ולפני מס רווחי הון ועמלות בנק.
        </p>
        <p className="max-w-measure">
          בעמוד הזה אין חישוב לאורך זמן, כי בהפקדה חודשית לא נקבע איזו סדרה קונה כל הפקדה.
        </p>
      </>
    );
  },
};
