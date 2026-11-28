// Guide prose for a bond fund with a limited period (the market's "קרן בולט"). A page of its own and not a product id, so it
// stays out of the comparison until the founder decides otherwise. Every figure, year and date is a Num over a rule figure (a fund's id is not a
// figure); the words that state a rule open it (Ruled, D116), and a figure from a rule opens it from its sheet (il-finance MF-59 to MF-66, MF-75 to MF-78,
// TXS-33 to TXS-37). A company's term appears under that company's name.
import { Fragment, type ReactNode } from "react";
import { Num, ProofsChip, Ruled, Term } from "../../components/provenance";
import { ownBy } from "../../lib/value";
import { Callout, FixedTable, Sentence, SortNote } from "../../components/kit";
import type { ContentProps } from "./types";

const NoBreak = ({ v }: { v: ReactNode }) => <bdi className="whitespace-nowrap">{v}</bdi>;

// a company's figure about its own funds, under its own name, is plain sourced (D31)
const ownFigure = (figure: ContentProps["figure"], company: string) => (id: string, name: string) => {
  const v = figure(id, name);
  return v ? <Num value={ownBy(v, company)} /> : null;
};

export function What() {
  return (
    <>
      <Sentence measure><Ruled id="MF-59">בסוף התקופה</Ruled> <Term id="מנהל קרן">מנהל הקרן</Term> <Ruled id="MF-60">פודה</Ruled> את <Term prefix="ה" id="יחידה">יחידות</Term>, והכסף חוזר למי שעדיין מחזיק בהן.</Sentence>
      <Sentence measure>בקרנות שנמצאו, הקרן <Ruled id="MF-62">עוקבת אחרי מדד</Ruled> של <Term id="איגרת חוב">איגרות חוב</Term> <Ruled id="MF-61">שנפרעות בערך באותה שנה</Ruled>. בקרן 5137492 של ילין לפידות, ככל שהן נפרעות הכסף עובר <Term prefix="ל" id={'מק"מ'}>מק״מ</Term>, <Ruled id="MF-75" prefix="ו">אחרי סוף השנה למזומן</Ruled>.</Sentence>
      <Sentence measure>לפי <Term prefix="ה" id="בורסה">בורסה</Term>, <Ruled id="MF-61">למדדים האלה יש מועד סיום</Ruled>: הם מפסיקים להתקיים כשהאיגרת האחרונה נפדית. ילין לפידות כותבת <Ruled id="MF-75" prefix="ש">אין בכך התחייבות</Ruled> להשיג את מטרת הקרן. ככל שהסוף מתקרב, נשאר פחות זמן עד שהאיגרות בקרן נפרעות, ולכן שינוי <Term prefix="ב" id="ריבית">ריבית</Term> מזיז את <Term id="מחיר קנייה">מחיר היחידה</Term> <Ruled id="BND-04">פחות ופחות</Ruled>. בקרן אג״ח בלי מועד סיום אין רגע כזה: כמה מחיר היחידה זז <Ruled id={["BND-13", "BND-15"]}>תלוי באיגרות שהיא מחזיקה</Ruled> באותו זמן. מי שיודע מתי יצטרך את הכסף יכול לבחור קרן ששנת הסיום שלה <Ruled id="BND-14">קרובה למועד הזה</Ruled>. כך בוחרים גם איגרת חוב: לפי המועד שבו היא נגמרת. <ProofsChip ids={["M-03"]} /></Sentence>
      <Sentence measure>בחוק ובמסמכים של <Term id="רשות ניירות ערך">רשות ניירות ערך</Term> שנבדקו <Ruled id="MF-59">לא נמצא שם לסוג הקרן הזה</Ruled>. האתר משתמש במילים של החוק. המילה ״בולט״ היא מילה של הבורסה <Ruled id="MF-61" prefix="ל">סוג מדד</Ruled>, והיא <Ruled id="MF-62">מופיעה גם בשמות של קרנות</Ruled>. ילין לפידות <Ruled id="MF-63">כותבת במקומה</Ruled> ״אג״ח <Term prefix="ל" id="פדיון">פדיון</Term>״.</Sentence>
      <Callout tone="info" className="max-w-measure" title="שנה בשם הקרן לא אומרת שהקרן נגמרת">
        יש קרנות עם שנה בשם, ובסוף אותה שנה הן <Ruled id="MF-65">עוברות לשנה מאוחרת יותר</Ruled> וממשיכות להתקיים. אצל הראל, תכלית ו־MTF כתוב בשם הקרן ״מתגלגל״. קרן שמתפרקת <Ruled id="MF-59">מזהים לפי מה שכתוב עליה עצמה</Ruled> תחת ״<Term id="תקופת קיום הקרן">תקופת קיום הקרן</Term>״.
      </Callout>
      <Sentence measure>איגרת חוב אחת שמחזירה את כל קרן החוב שלה בתשלום אחד בסוף היא דבר אחר. גם לה <Ruled id="CORP-26">לא נמצא שם רשמי</Ruled>.</Sentence>
    </>
  );
}

export function Compare() {
  return (
    <>
      <FixedTable
        rowHead="מה בודקים"
        columns={[
          { id: "bond", head: "איגרת חוב של חברה" },
          { id: "limited", head: "קרן שתקופתה מוגבלת" },
          { id: "open", head: "קרן אג״ח רגילה" },
        ]}
        rows={[
          { key: "end", head: "מתי זה נגמר", cells: [<Fragment key="bond">במועד <Term prefix="שה" id="מנפיק">מנפיק</Term> קבע</Fragment>, <Fragment key="limited"><Ruled id="MF-60">בסוף התקופה של הקרן</Ruled></Fragment>, <Fragment key="open">לפי קריאה של האתר, <Ruled id="MF-59">אין מועד סיום בחוק</Ruled>, רק פירוק מסיבה אחרת</Fragment>] },
          { key: "back", head: "מה חוזר", cells: [<Fragment key="bond"><Ruled id="CORP-01">מה שהמנפיק התחייב לשלם</Ruled>, אם ישלם</Fragment>, <Fragment key="limited"><Ruled id="MF-60">המפרק פודה את היחידות</Ruled>, אבל אצל ילין לפידות <Ruled id="MF-75">״אין בכך התחייבות״</Ruled></Fragment>, <Fragment key="open"><Term prefix="ב" id="קרן פתוחה">קרן פתוחה</Term>, <Ruled id="MF-05">לפי שווי הנכסים</Ruled> ביום הפדיון; <Term prefix="ב" id="קרן סל">קרן סל</Term>, <Ruled id="ETF-06">המחיר בבורסה</Ruled></Fragment>] },
          { key: "issuers", head: "כמה מנפיקים", cells: ["אחד", <Fragment key="limited">כמה, ו<Ruled id="MF-77">לפי דיווח אחד יכולים להישאר פחות</Ruled> קרוב לסוף</Fragment>, "תלוי בקרן"] },
          { key: "cost", head: "עלות שוטפת", cells: [
              <Fragment key="bond">
                בלי <Term id="דמי ניהול">דמי ניהול</Term>, אבל <Ruled id="CORP-23">יש עמלות</Ruled> <Term prefix="ו" id="דמי ניהול פיקדון ניירות ערך">דמי משמרת</Term>
              </Fragment>,
              <Fragment key="limited">
                דמי ניהול <Term prefix="ו" id="שכר נאמן">שכר נאמן</Term>
              </Fragment>,
              <Fragment key="open">
                <Ruled id={["MF-16", "MF-20"]}>דמי ניהול ושכר נאמן</Ruled>
              </Fragment>,
            ],
          },
          { key: "sell", head: "מכירה לפני הסוף", cells: ["במחיר בבורסה", <Fragment key="limited">בקרן פתוחה, במחיר <Ruled id="MF-10">של יום התמחור</Ruled>; בקרן סל, <Ruled id="ETF-06">במחיר בבורסה</Ruled></Fragment>, <Fragment key="open">בקרן פתוחה, במחיר <Ruled id="MF-10">של יום התמחור</Ruled>; בקרן סל, <Ruled id="ETF-06">במחיר בבורסה</Ruled></Fragment>] },
          {
            key: "rates",
            head: (
              <>
                כשהריבית במשק עולה <ProofsChip ids={["M-01", "M-03"]} />
              </>
            ),
            cells: [
              <Fragment key="bond">
                <Ruled id="BND-01">המחיר יורד</Ruled>, ובפדיון <Ruled id="BND-02">חוזר לסכום שהמנפיק התחייב לו</Ruled>
              </Fragment>,
              <Fragment key="limited">
                <Ruled id="BND-13">מחיר היחידה יורד</Ruled>, ופחות ככל שהסוף קרוב
              </Fragment>,
              <Fragment key="open">
                <Ruled id="BND-13">מחיר היחידה יורד</Ruled>
              </Fragment>,
            ],
          },
          {
            key: "tax",
            head: (
              <>
                מס <Term prefix="ב" id="קרן נאמנות פטורה">קרן פטורה</Term> ובאיגרת
              </>
            ),
            cells: [
              <Fragment key="bond">
                <Ruled id="TX2-06">על הריבית כשהיא משולמת</Ruled>, ועל <Term id="רווח הון">רווח הון</Term> <Ruled id="TXS-03" prefix="ב">מכירה</Ruled> או בפדיון
              </Fragment>,
              <Fragment key="limited">
                {/* two words in a column 64 px wide on a 320 px phone: the term breaks between them there rather than run out of its cell */}
                על <Term id="הרווח הריאלי" className="whitespace-normal">הרווח הריאלי</Term> <Ruled id={["TXS-09", "TXS-33"]} prefix="ב">פדיון</Ruled>
              </Fragment>,
              <Fragment key="open">
                על הרווח הריאלי <Term prefix="ב" id="מכירה">מכירה</Term> או בפדיון
              </Fragment>,
            ],
          },
        ]}
      />
      <Sentence measure>
        <span className="font-medium">קרן אג״ח רגילה אחרי עליית ריבית.</span> מחיר היחידה יורד מיד, בערך לפי <Term prefix="ה" id={'מח"מ'}>מח״מ</Term> של האיגרות בקרן. קרן ששומרת על אותו מח״מ קונה כל הזמן איגרות חדשות. האיגרות החדשות משלמות עכשיו יותר, ולכן הקרן מרוויחה יותר בכל שנה. בחשבון, אחרי בערך מספר שנים כמו המח״מ, הירידה וההכנסה הגבוהה מתקזזות. מי שמחזיק פחות זמן מזה נשאר מאחור, ומי שמחזיק יותר יוצא לפני. החשבון מניח שהריבית זזה פעם אחת ונשארת, ושאין דמי ניהול ואין מנפיק שלא משלם. <ProofsChip ids={["M-05"]} />
      </Sentence>
      <Sentence measure>
        קרן שבממוצע יותר ממחצית החשיפה שלה לאיגרות חוב, חוץ מקרן של קרנות, <Ruled id="BND-13">חייבת לפרסם בדוח השנתי</Ruled> את המח״מ של האיגרות שבה. לפי המח״מ אפשר להעריך כמה מחיר היחידה יזוז כשהריבית זזה.
      </Sentence>
    </>
  );
}

export function Who({ figure }: ContentProps) {
  const kesem = ownFigure(figure, "קסם");
  const yalin = ownFigure(figure, "ילין לפידות");
  const meitav = ownFigure(figure, "מיטב");
  const migdal = ownFigure(figure, "מגדל");
  // wraps at the "עד" on a phone, so the column never pushes the table past the screen
  const range = (of: (id: string, name: string) => ReactNode, id: string, low: string, high: string) => (
    <>
      <NoBreak v={of(id, low)} /> עד <NoBreak v={of(id, high)} />
    </>
  );
  return (
    <>
      <Sentence measure>הנתונים של כל חברה לפי <Term prefix="ה" id="תשקיף">תשקיף</Term> שלה, נכון לתאריך שכתוב בו. כולן במסלול מס של קרן פטורה.</Sentence>
      <FixedTable
        rowHead="מנהל הקרן"
        columns={[
          { id: "funds", head: "קרנות" },
          { id: "years", head: "שנות סיום" },
          // the fees are the prospectus's; a fee can rise after an annual report, and the line under the table gives a case
          { id: "fee", head: <SortNote label="דמי ניהול בשנה" note="לפי התשקיף" /> },
          { id: "trustee", head: <SortNote label="שכר נאמן בשנה" note="לפי התשקיף" />, hideOnPhone: true },
        ]}
        rows={[
          { key: "kesem", head: "קסם", cells: [kesem("MF-62", "funds"), range(kesem, "MF-62", "end_first", "end_last"), range(kesem, "MF-62", "fee_low", "fee_high"), range(kesem, "MF-62", "trustee_low", "trustee_high")] },
          { key: "yalin", head: "ילין לפידות", cells: [yalin("MF-63", "funds"), range(yalin, "MF-63", "end_first", "end_last"), yalin("MF-63", "fee"), yalin("MF-63", "trustee")] },
          { key: "meitav", head: "מיטב (תכלית)", cells: [meitav("MF-64", "funds_meitav"), range(meitav, "MF-64", "end_first_meitav", "end_last_meitav"), range(meitav, "MF-64", "fee_low", "fee_high"), meitav("MF-64", "trustee")] },
          { key: "migdal", head: "מגדל (MTF)", cells: [migdal("MF-78", "funds_migdal"), migdal("MF-78", "end_migdal"), migdal("MF-78", "fee_migdal"), migdal("MF-78", "trustee_migdal")] },
        ]}
      />
      <Sentence measure>
        <Ruled id="MF-76">דמי ניהול יכולים לעלות</Ruled>: בקרן 5137492 של ילין לפידות הם היו {yalin("MF-76", "fee_report")} בדוח השנתי ל־{yalin("MF-76", "fee_report_date")}, ובתשקיף המאוחר יותר כתוב {yalin("MF-63", "fee")}. לכן כדאי לבדוק את דמי הניהול בדוח או בתשקיף האחרונים של הקרן.
      </Sentence>
      <Sentence measure>לפי ילין לפידות, הבנק או בית ההשקעות שדרכו קונים <Ruled id={["MF-63", "MF-27"]}>יכולים לגבות</Ruled> <Term id="עמלה">עמלה</Term> על קנייה ומכירה של יחידות, מעבר לדמי הניהול. לא נמצא אם נגבית עמלה גם על התשלום בפירוק.</Sentence>
      <Sentence measure>הטבלה בנויה מהתשקיפים של <bdi>9</bdi> מנהלי קרנות. קרן שנוספה אחרי התשקיף יכולה להיות חסרה בה.</Sentence>
      <Sentence measure>בחוץ לארץ <Ruled id={["ETF-80", "ETF-81"]}>יש קרנות דומות</Ruled>, כמו iShares iBonds ו־Invesco BulletShares. <Ruled id="ETF-79">בבורסה בתל אביב לא נמצאה</Ruled> <Term id="קרן זרה">קרן זרה</Term> כזו, ולא נבדק אם חשבון ישראלי מציע אותן.</Sentence>
    </>
  );
}

export function End({ figure }: ContentProps) {
  const max = figure("MF-60", "notice_days_max");
  const min = figure("MF-60", "notice_days_min");
  const yalin = ownFigure(figure, "ילין לפידות");
  const tachlit = ownFigure(figure, "מיטב");
  const kesem = ownFigure(figure, "קסם");
  return (
    <>
      <Sentence measure>
        לפי החוק, מי שמפרק את הקרן מודיע על הפירוק בין {max && <Num value={max} />} ל־{min && <Num value={min} />} ימים לפני המועד. קרן פתוחה <Ruled id="MF-60">מפסיקה להציע יחידות</Ruled> מיום התמחור הראשון אחרי ההודעה לרשות ניירות ערך. הוא מוכר את הנכסים ופודה את היחידות במועד הפירוק.
      </Sentence>
      <Sentence measure>
        המועד האחרון לתשלום כתוב במסמך של הקרן: בקרן 5137492 של ילין לפידות עד {yalin("MF-75", "last_payment")}, בקרן 5140249 של תכלית עד {tachlit("MF-64", "payment_5140249")}, ובקרן 5140231 של תכלית עד {tachlit("MF-64", "payment_5140231")}. בשתי קרנות תכלית האלה <Ruled id="MF-64">המנהל יכול להודיע על מועד אחר</Ruled>, והוא מתחייב לא להעלות את שכרו עד הפירוק.
      </Sentence>
      <Callout tone="caution" className="max-w-measure" title="האתר לא מצא פירוק כזה שכבר קרה">
        הקרנות הראשונות מסתיימות ב־{kesem("MF-62", "end_first")}. נכון ל־{kesem("MF-66", "notice_checked")}, <Ruled id="MF-66">האתר לא מצא הודעת פירוק</Ruled> בדיווחים של קרן 5138565 של קסם ושל קרן 5137492 של ילין לפידות. <Ruled id="MF-60">בחוק כתוב שהמפרק פודה את היחידות במועד הפירוק</Ruled>. החוק לא אומר אם אפשר עוד לפדות יחידות אחרי ההודעה. האתר לא מצא בכללים שקרא איך הכסף מגיע <Term prefix="ל" id="חשבון ניירות ערך">חשבון ניירות ערך</Term>.
      </Callout>
    </>
  );
}

export function Tax({ figure }: ContentProps) {
  const rate = figure("TXS-09", "rate");
  return (
    <>
      <Sentence measure>לפי מסקנת האתר, בקרן פטורה <Ruled id="TXS-33">הפירוק הוא פדיון של היחידות</Ruled>, ולכן הוא ממוסה כמו כל פדיון: עד {rate && <Num value={rate} />} מהרווח הריאלי, עם <Term id="ניכוי מס במקור">ניכוי במקור</Term> <Ruled id="TXS-34">בשעת התשלום</Ruled>. <Ruled id="TXS-35">הפסד בפירוק</Ruled> הוא <Term id="הפסד הון">הפסד הון</Term> רגיל.</Sentence>
      <Callout tone="caution" className="max-w-measure" title={<>מסקנה, ולא נוסח של <Term id="רשות המסים">רשות המסים</Term></>}>
        שום טקסט של רשות המסים לא מזכיר תשלום בפירוק קרן. המסקנה של האתר באה מחוק הקרנות ומפקודת מס הכנסה. לא נמצא באיזו <Term id="שנת המס">שנת מס</Term> נרשמת התוצאה <Ruled id="TXS-35">כשהקרן מסתיימת בשנה אחת ומשלמת בשנה הבאה</Ruled>. בקרן דולרית <Ruled id="TXS-36">לא נמצא באיזה יום נקבע השער</Ruled>.
      </Callout>
    </>
  );
}

export function Risks({ figure }: ContentProps) {
  const kesem = ownFigure(figure, "קסם");
  const yalin = ownFigure(figure, "ילין לפידות");
  return (
    <>
      <Sentence measure>הסכום לא מובטח. <Ruled id="MF-61">ההודעה של הבורסה על מדדי בולט מתארת מדדים, לא קרן</Ruled>. ילין לפידות כותבת <Ruled id="MF-75" prefix="ש">אין בכך התחייבות</Ruled>. לכן סכום הכסף שיחזור, וגם <Term prefix="ה" id="תשואה לפדיון">תשואה לפדיון</Term>, לא ידועים מראש.</Sentence>
      <Sentence measure>מכירה לפני הסוף נעשית <Ruled id="MF-10" prefix="ב">מחיר של אותו יום</Ruled>, שיכול להיות נמוך ממה ששולם.</Sentence>
      <Sentence measure>חדלות פירעון של מנפיק פוגעת בחלק מהקרן, והפגיעה <Ruled id="TXS-37">מגיעה למחזיק דרך מחיר היחידה</Ruled>.</Sentence>
      <Sentence measure>
        קרוב לסוף <Ruled id="MF-77">יכולות להישאר פחות החזקות</Ruled>. זו מסקנה מדיווח אחד: במדד של קרן 5138565 של קסם, שמסתיימת ב־{kesem("MF-62", "end_first")}, היו ב־{kesem("MF-77", "index_date")} רק {kesem("MF-77", "holdings")} <Term id="נייר ערך">ניירות ערך</Term>, וחמשת הגדולים שקלו {kesem("MF-77", "top_five")}.
      </Sentence>
      <Sentence measure>
        בקרן יכולות להיות איגרות שמועד הפדיון הסופי שלהן <Ruled id="MF-66">אחרי השנה שבשם</Ruled>, אם למנפיק יש זכות לפדות אותן מוקדם במועד מוגדר. אם הוא לא משתמש בזכות, האיגרת יוצאת מהמדד. כך הבהירו קסם ב־{kesem("MF-66", "kesem_note")} וילין לפידות ב־{yalin("MF-66", "yalin_note")}.
      </Sentence>
    </>
  );
}

/** Glossary terms the prose opens with <Term>, so their cards ship with the page. */
export const termIds = [
  'מח"מ',
  "נייר ערך",
  "מנפיק",
  "עמלה",
  "רשות המסים",
  "תקופת קיום הקרן",
  "מכירה",
  "מחיר קנייה",
  "תשואה לפדיון",
  "שנת המס",
  "הפסד הון",
  "רווח הון",
  "ניכוי מס במקור",
  "הרווח הריאלי",
  "חשבון ניירות ערך",
  "קרן פתוחה",
  "קרן סל",
  "קרן זרה",
  "קרן נאמנות פטורה",
  "תשקיף",
  "פדיון",
  "בורסה",
  "רשות ניירות ערך",
  'מק"מ',
  "איגרת חוב",
  "יחידה",
  "מנהל קרן",
  "קרן נאמנות",
  "דמי ניהול",
  "דמי ניהול פיקדון ניירות ערך",
  "שכר נאמן",
  "ריבית",
];
