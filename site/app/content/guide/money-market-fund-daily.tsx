// Guide prose for קרן כספית (the daily money-market fund). Same shape as kupat-gemel-lehashkaa.tsx: every figure
// is a Num over a rule figure; the words that state a rule open it (Ruled, D116), and a figure from a rule opens it from its
// sheet (il-finance MF, TXS, TXI, BANK, BRK, REG). NEW copy for the founder to review (docs/copy.md holds only labels).
import type { GuideContent } from "./types";
import { IdRef, Num, ProofsChip, Ruled, Term } from "../../components/provenance";
import { Sentence } from "../../components/kit";

export const content: GuideContent = {
  what: ({ figure }) => {
    const life = figure("MF-30", "max_average_life_days");
    const bondTerm = figure("MF-29", "max_bond_term_months");
    const distCap = figure("MF-24", "distribution_fee_cap_money_market");
    const foreign = figure("MF-74", "foreign_securities_line");
    return (
      <>
        <Sentence measure>
          <Ruled id="MF-29">היא מחזיקה רק נכסים מרשימה סגורה</Ruled>, כמו <Term id={'מק"מ'}>מק״מ</Term>, <Term id="איגרת חוב">איגרות חוב</Term> שנפרעות בתוך {bondTerm ? <Num value={bondTerm} /> : null} חודשים, בדירוג גבוה אם לא המדינה הנפיקה אותן, <Term id="פיקדון">פיקדונות</Term> בבנקים ומזומן. <Ruled id="MF-30">משך החיים הממוצע של הנכסים הוא עד</Ruled> {life ? <Num value={life} /> : null} ימים.
        </Sentence>
        <p className="max-w-measure">
          <Term prefix="ב" id="קרנות כספיות יומיות">קרן כספית יומית</Term> אין <Term id="תשואה">תשואה</Term> מובטחת ואין <Term id="תשואה צפויה">תשואה צפויה</Term>. לפי <Term id="רשות ניירות ערך">רשות ניירות ערך</Term>, <Ruled id="MF-34">התשואה נעה בעקבות</Ruled> <Term id="ריבית בנק ישראל">ריבית בנק ישראל</Term>, פחות העלויות של הקרן. <Ruled id="MF-01">את הנכסים מחזיק</Ruled> <Term id="נאמן">נאמן</Term>, גוף נפרד <Term prefix="מ" id="מנהל קרן">מנהל הקרן</Term> שמשקיע אותם.
        </p>
        <p className="max-w-measure">
          קונים ופודים <Term id="יחידה">יחידות</Term> <Ruled id="MF-34">בכל יום מסחר</Ruled>, ובדרך כלל <Ruled id="MF-15">בלי סכום מינימלי</Ruled>. עושים זאת דרך <Term id="חשבון ניירות ערך">חשבון ניירות ערך</Term> בבנק או <Term prefix="ב" id="בית השקעות">בית השקעות</Term> שהוא <Term id="חבר בורסה">חבר בורסה</Term>, לפי שם הקרן או המספר שלה <Term prefix="ב" id="בורסה">בורסה</Term>. החוק קורא לבנק או לבית ההשקעות <Term id="מפיץ">מפיץ</Term>.
        </p>
        <p className="max-w-measure">
          קונים בסכום בשקלים ומקבלים יחידות לפי מחיר שמנהל הקרן <Ruled id="MF-09">מחשב פעם ביום, לפי שווי הנכסים</Ruled>. הוראה שמגיעה לפני <Term id="השעה היעודה">השעה היעודה</Term> של הקרן <Ruled id="MF-10">מקבלת את המחיר של אותו יום</Ruled>. הוראה מאוחרת יותר מקבלת את המחיר של יום החישוב הבא. לכן המחיר המדויק לא ידוע ברגע ההוראה.
        </p>
        <Sentence measure>
          מתי הכסף <Term prefix="מה" id="פדיון">פדיון</Term> מגיע לחשבון תלוי בקרן. בקרן שמדיניות ההשקעות שלה מגבילה <Term id="נייר ערך">ניירות ערך</Term> זרים ל־{foreign ? <Num value={foreign} /> : null} מהנכסים, הוא מגיע באותו יום, אם ההוראה ניתנה לפני השעה היעודה. בקרן שיכולה להחזיק יותר, הוא <Ruled id="MF-74">מגיע ביום המסחר הבא</Ruled>.
        </Sentence>
        <p className="max-w-measure">
          <Ruled id="BRK-29">הבורסה עברה למסחר מיום שני עד יום שישי</Ruled>. בקרן שמגבילה ניירות ערך זרים <Ruled id={["MF-68", "MF-69"]}>אפשר לתת הוראה גם ביום שישי</Ruled>. ההוראה מבוצעת ביום ראשון לפי מחיר הסגירה של יום שישי. הכסף מגיע בדרך כלל ביום שני. בקרן שיכולה להחזיק יותר, הוראות מתקבלות רק מיום שני עד יום חמישי.
        </p>
        <p className="max-w-measure">
          העלות העיקרית היא <Term id="דמי ניהול">דמי הניהול</Term> ושכר הנאמן: <Ruled id={["MF-16", "MF-20"]}>אחוז שנתי מהנכסים שיורד מהמחיר כל יום</Ruled>, ולכן לא רואים אותו כחיוב נפרד. רשות ניירות ערך <Ruled id="MF-18">מפרסמת ממוצע שנתי לקטגוריה</Ruled>. הממוצע מופיע בקישור שבכרטיס של המספר שלמטה.
        </p>
        <Sentence measure>
          בבנק: <Ruled id="MF-24">מנהל הקרן משלם לבנק</Ruled> <Term id="עמלת הפצה">עמלת הפצה</Term> של עד {distCap ? <Num value={distCap} /> : null} בשנה. כשיש הסכם הפצה כזה, <Ruled id="MF-71">הבנק לא יכול לגבות מכם</Ruled> <Term id="עמלה">עמלה</Term> על קנייה, החזקה או פדיון של קרן כספית. בלי הסכם, הוא יכול לגבות מכם עד גובה עמלת ההפצה. <Term id="דמי ניהול פיקדון ניירות ערך">דמי ניהול פיקדון ניירות ערך</Term> על קרן כספית <Ruled id="BRK-17">בנק לא יכול לגבות בשום מקרה</Ruled>.
        </Sentence>
        <p className="max-w-measure">
          לפי דוח משותף של הרגולטורים, <Ruled id="BRK-52">רוב בתי ההשקעות הם משווקי השקעות</Ruled>. אצלם אין כלל שמגביל את דמי ניהול פיקדון ניירות ערך ואת עמלות הקנייה, המכירה והפדיון על קרן כספית, והן לפי התעריפון. בית השקעות שהוא לא משווק השקעות <Ruled id="MF-26">כפוף לתקנות עמלת ההפצה</Ruled>. כשיש הסכם הפצה, הוא לא רשאי לגבות מכם עמלה על קנייה, החזקה או פדיון של קרן כספית. בלי הסכם, הוא רשאי לגבות עד גובה עמלת ההפצה.
        </p>
        <p className="max-w-measure">תוספת בקנייה או <Term id="ניכוי בפדיון">ניכוי בפדיון</Term> <Ruled id={["MF-21", "MF-22"]}>אפשריים רק אם הסכם הקרן קובע אותם</Ruled>, ורוב הקרנות לא גובות תוספת.</p>
      </>
    );
  },
  who: () => (
    <>
      <p className="max-w-measure">
        מנהלי <Term id="קרן נאמנות">קרנות נאמנות</Term> <Ruled id="MF-01">שקיבלו אישור מרשות ניירות ערך</Ruled>. היא מפקחת עליהם, על הנאמנים ועל הקרנות <Ruled id="REG-07">לפי חוק השקעות משותפות בנאמנות</Ruled>. יחידות <Ruled id="MF-04">מוצעות לציבור רק לפי</Ruled> <Term id="תשקיף">תשקיף</Term> שהיא התירה.
      </p>
      <p className="max-w-measure">
        את הקרנות עצמן קונים דרך הבנקים ובתי ההשקעות. בנק שאפשר לקנות דרכו קרנות כספיות או מק״מ <Ruled id="BANK-15">חייב להציג אותן ליד הפיקדונות והמק״מ</Ruled>, תחת הכותרת <Term id="מוצרי שוק הכסף">מוצרי שוק הכסף</Term>, בלי להעדיף אף מוצר.
      </p>
    </>
  ),
  termIds: [
    "קרן נאמנות",
    'מק"מ',
    "קרנות כספיות יומיות",
    "ריבית בנק ישראל",
    "נאמן",
    "מנהל קרן",
    "יחידה",
    "חשבון ניירות ערך",
    "חבר בורסה",
    "מפיץ",
    "השעה היעודה",
    "פדיון",
    "דמי ניהול",
    "עמלת הפצה",
    "דמי ניהול פיקדון ניירות ערך",
    "תשקיף",
    "מוצרי שוק הכסף",
    "קרן נאמנות פטורה",
    "קרן נאמנות חייבת",
    "רווח הון ריאלי", "מס רווחי הון",
    "ניכוי מס במקור",
    "קיזוז הפסדים",
    'קרן כספית מט"ח',
    "פיקדון",
    "תחנת יציאה",
    "שבירת פיקדון",
    "הפסד הון",
    "קרן כספית מתחדשת",
    "בעלי היחידות",
    "מעמד מס",
    "נומינלי",
    "דוח שנתי",
    "דיבידנד",
    "רווח הון",
    "מס נוסף",
    "מדד המחירים לצרכן",
    "לא צמוד",
    "ריבית",
    "ניכוי בפדיון",
    "רשות ניירות ערך",
    "נייר ערך",
    "בורסה",
    "תשואה צפויה",
    "איגרת חוב",
    "מדד",
    "מכירה",
    "חשבון עובר ושב",
    "מטבע חוץ",
  ],
  afterTax: ({ figure }) => {
    const rate = figure("TXS-12", "rate");
    const total = figure("TXS-24", "money_market_funds_count");
    const taxable = figure("TXS-24", "money_market_funds_taxable");
    return (
      <>
        <Sentence measure>
          <Ruled id="TXS-24">רוב הקרנות הכספיות הן</Ruled> <Term id="קרן נאמנות פטורה">קרנות נאמנות פטורות</Term>: <Ruled id="TXS-08">הקרן עצמה לא משלמת מס</Ruled>. אתם משלמים מס רווחי הון <Ruled id="TXS-12">רק בפדיון</Ruled>, של עד {rate ? <Num value={rate} /> : null} <Term prefix="מ" id="רווח הון ריאלי">הרווח הריאלי</Term>, <Ruled id="TXS-09">כלומר מהרווח שמעבר לעליית</Ruled> <Term id="מדד המחירים לצרכן">מדד המחירים לצרכן</Term>.
        </Sentence>
        <p className="max-w-measure">
          הבנק או בית ההשקעות מנכים את המס <Term id="ניכוי מס במקור">במקור</Term>. <Ruled id="TXS-05">אם הוא נוכה במלואו, אין צורך בדיווח נפרד</Ruled> על <Term prefix="ה" id="מכירה">מכירה</Term>. <Term id="מס נוסף">מס נוסף</Term> <Ruled id="TXG-09">על הכנסות גבוהות</Ruled>, אם הוא חל, מוסדר בדוח השנתי.
        </p>
        <p className="max-w-measure">
          הפסד בפדיון אפשר <Term id="קיזוז הפסדים">לקזז</Term> <Term prefix="מ" id="רווח הון">רווחי הון</Term> ומריבית <Term prefix="ו" id="דיבידנד">דיבידנד</Term> <Ruled id="TXS-17">על ניירות ערך באותה שנה</Ruled>. <Ruled id="TXS-18">בשנים הבאות אפשר לקזז אותו מרווחי הון בלבד</Ruled>, אם הוגש דוח לשנת ההפסד. <Ruled id="TXS-19">קיזוז בין בנקים שונים דורש</Ruled> <Term id="דוח שנתי">דוח שנתי</Term>.
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
          נכסי הקרן שייכים לנאמן לטובת <Term id="בעלי היחידות">בעלי היחידות</Term>, <Ruled id="MF-02">בנפרד משאר הרכוש שלו, ואי אפשר לעקל אותם</Ruled>. <Ruled id="MF-03">הנאמן מפקח על מנהל הקרן</Ruled>.
        </p>
        <Sentence measure>
          אם מנהל הקרן קורס, <Ruled id="REG-11">ניהול הקרן עובר למנהל אחר</Ruled>. אם הנאמן קורס, מנהל הקרן צריך למנות נאמן מאושר אחר{days ? <> בתוך <Num value={days} /> ימים</> : null}. אם זה לא קורה, הרשות יכולה להורות להעביר את הקרן למנהל אחר. לא כתוב במפורש מה קורה לכסף בחדלות הפירעון של מנהל הקרן עצמו. שאלה פתוחה <IdRef id="REG OQ22" end="." /> אין ערבות של המדינה לשווי הקרן, וגם לפיקדונות בבנק <Ruled id="BANK-23">אין ביטוח</Ruled>.
        </Sentence>
        <p className="max-w-measure">
          השווי יכול גם לרדת. רשות ניירות ערך מונה <Term id="סיכון אשראי">סיכון אשראי</Term>, <Ruled id="MF-41">כולל של הבנק שבו מופקד הכסף</Ruled>, <Term id="סיכון ריבית">סיכון ריבית</Term>, <Term id="סיכון נזילות">סיכון נזילות</Term> <Term prefix="ו" id="סיכון אינפלציה">סיכון אינפלציה</Term>. במקרים חריגים <Ruled id="MF-13">אפשר להפסיק פדיונות</Ruled> לכמה ימי מסחר, ובאישור שר האוצר גם יותר. <Term id={'קרן כספית מט"ח'}>קרן כספית מט״ח</Term> חשופה גם <Term prefix="ל" id="שער חליפין">שער המטבע</Term>: שינוי בשער משנה את השווי בשקלים.
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
          כסף שצריך להישאר זמין: קרן חירום, כסף שמחכה להחלטה, או סכום שיש לו שימוש בחודשים הקרובים. <Ruled id="MF-34">פודים בכל יום מסחר</Ruled>, בלי נעילה, ואפשר להוסיף או למשוך חלק.
        </p>
        <p className="max-w-measure">
          מול פיקדון בבנק ההבדל הראשון הוא נזילות. פיקדון נעול עד הפירעון או עד <Term id="תחנת יציאה">תחנת היציאה</Term> הבאה. <Term id="שבירת פיקדון">שבירה</Term> <Ruled id="BANK-06">אפשרית אם ההסכם מתיר או הבנק מסכים</Ruled>, <Ruled id="TXI-07" prefix="ו">עלולה לפגוע</Ruled> <Term prefix="ב" id="ריבית">ריבית</Term> ואף בקרן. קרן כספית יומית נפדית בכל יום מסחר.
        </p>
        <Sentence measure>
          ההבדל השני הוא מס. על ריבית מפיקדון שקלי <Term id="לא צמוד">לא צמוד</Term> משלמים מס הכנסה של {depositRate ? <Num value={depositRate} /> : null} מכל הריבית. בקרן כספית פטורה משלמים <Term id="מס רווחי הון">מס רווחי הון</Term> של עד {fundRate ? <Num value={fundRate} /> : null} רק מהרווח שמעבר <Term prefix="ל" id="אינפלציה">אינפלציה</Term>. באותה תשואה לפני מס, כשהאינפלציה גבוהה, בקרן משלמים פחות מס. כשהיא נמוכה, משלמים פחות מס בפיקדון. מי מנצח תלוי באינפלציה, בריבית ובתקופה, ולכן האתר מחשב את זה במקום לקבוע מראש. <Ruled id="TXS-17">הפסד בקרן אפשר לקזז</Ruled>. בפיקדון, <Ruled id="TXI-26">החלק מהסכום שהופקד שאבד בשבירה לא מקטין את מס ההכנסה שהבנק מנכה</Ruled>. האתר לא מצא בכללים שקרא אם החלק הזה הוא <Term id="הפסד הון">הפסד הון</Term> <IdRef id="TXI OQ14" end="." /> <Ruled id="TXI-17">הפסד מניירות ערך לא מתקזז מריבית על פיקדון</Ruled>. <ProofsChip ids={["M-10"]} />
        </Sentence>
        <p className="max-w-measure">
          פיקדון יכול להיות עדיף כשברור שלא תצטרכו את הכסף עד הפירעון, וכשהריבית שלו גבוהה מהתשואה של הקרן אחרי דמי הניהול, בהתחשב בהבדל במס. בנק שאפשר לקנות דרכו קרנות כספיות או מק״מ <Ruled id="BANK-15">חייב להציג אותם ליד הפיקדונות</Ruled>, מסוננים לפי תקופה, ושם אפשר להשוות. לכסף שאפשר לנעול לתקופה ידועה יש גם <Term id="קרן כספית מתחדשת">קרן כספית מתחדשת</Term>, שיכולה לפרסם <Ruled id="MF-35">תשואה צפויה מראש</Ruled>.
        </p>
      </>
    );
  },
};
