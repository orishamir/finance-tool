// Guide prose for a bond fund with a limited period (the market's "קרן בולט"). A page of its own and not a product id, so it
// stays out of the comparison until the founder decides otherwise. Every figure, year and date is a Num over a rule figure (a fund's id is not a
// figure), every block ends with the rules it rests on (il-finance MF-59 to MF-66, TXS-33 to TXS-37, read and). A company's term appears under that company's name.
import { Fragment, type ReactNode } from "react";
import { Num, RulesLine, Term } from "../../components/provenance";
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
      <Sentence measure>בסוף התקופה <Term id="מנהל קרן">מנהל הקרן</Term> פודה את <Term prefix="ה" id="יחידה">יחידות</Term>, והכסף חוזר למי שעדיין מחזיק בהן.</Sentence>
      <RulesLine ids={["MF-59", "MF-60"]} />
      <Sentence measure>בקרנות שנמצאו, הקרן עוקבת אחרי מדד של <Term id="איגרת חוב">איגרות חוב</Term> שנפרעות בערך באותה שנה. אצל ילין לפידות, ככל שהן נפרעות הכסף עובר <Term prefix="ל" id={'מק"מ'}>מק״מ</Term>, ואחרי סוף השנה למזומן.</Sentence>
      <RulesLine ids={["MF-61", "MF-62", "MF-63"]} />
      <Sentence measure>בחוק ובמסמכים של <Term id="רשות ניירות ערך">רשות ניירות ערך</Term> שנבדקו לא נמצא שם לסוג הקרן הזה, והאתר משתמש במילים של החוק. המילה ״בולט״ היא מילה של <Term prefix="ה" id="בורסה">בורסה</Term> לסוג מדד, והיא מופיעה גם בשמות של קרנות. ילין לפידות כותבת במקומה ״אג״ח <Term prefix="ל" id="פדיון">פדיון</Term>״.</Sentence>
      <RulesLine ids={["MF-59", "MF-61", "MF-62", "MF-63"]} />
      <Callout tone="info" className="max-w-measure" title="שנה בשם הקרן לא אומרת שהקרן נגמרת">
        יש קרנות עם שנה בשם שבסוף אותה שנה עוברות לשנה מאוחרת יותר וממשיכות להתקיים. אצל הראל, תכלית ו־MTF כתוב בשם הקרן ״מתגלגל״. קרן שמתפרקת מזהים לפי מה שכתוב עליה עצמה תחת ״<Term id="תקופת קיום הקרן">תקופת קיום הקרן</Term>״.
      </Callout>
      <RulesLine ids={["MF-65", "MF-59"]} />
      <Sentence measure>איגרת חוב אחת שמחזירה את כל קרן החוב שלה בתשלום אחד בסוף היא דבר אחר. גם לה לא נמצא שם רשמי.</Sentence>
      <RulesLine ids={["CORP-26"]} />
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
          { key: "end", head: "מתי זה נגמר", cells: [<Fragment key="bond">במועד <Term prefix="שה" id="מנפיק">מנפיק</Term> קבע</Fragment>, "בסוף התקופה של הקרן", "אין מועד סיום"] },
          { key: "back", head: "מה חוזר", cells: ["מה שהמנפיק התחייב לשלם, אם ישלם", "מה שנשאר בקרן, בלי התחייבות", "שווי היחידה ביום הפדיון"] },
          { key: "issuers", head: "כמה מנפיקים", cells: ["אחד", "כמה, ויכולים להישאר פחות קרוב לסוף", "תלוי בקרן"] },
          { key: "cost", head: "עלות שוטפת", cells: [
              <Fragment key="bond">
                בלי <Term id="דמי ניהול">דמי ניהול</Term>; יש עמלות <Term prefix="ו" id="דמי ניהול פיקדון ניירות ערך">דמי משמרת</Term>
              </Fragment>,
              <Fragment key="limited">
                דמי ניהול <Term prefix="ו" id="שכר נאמן">שכר נאמן</Term>
              </Fragment>,
              "דמי ניהול ושכר נאמן",
            ],
          },
          { key: "sell", head: "מכירה לפני הסוף", cells: ["במחיר בבורסה", "במחיר של יום התמחור", "במחיר של יום התמחור"] },
          {
            key: "tax",
            head: (
              <>
                מס <Term prefix="ב" id="קרן נאמנות פטורה">קרן פטורה</Term> ובאיגרת
              </>
            ),
            cells: [
              <Fragment key="bond">
                על <Term prefix="ה" id="ריבית">ריבית</Term> כשהיא משולמת, ועל <Term id="רווח הון">רווח הון</Term> במכירה או בפדיון
              </Fragment>,
              <Fragment key="limited">
                {/* two words in a column 64 px wide on a 320 px phone: the term breaks between them there rather than run out of its cell */}
                על <Term id="הרווח הריאלי" className="whitespace-normal">הרווח הריאלי</Term> בפדיון
              </Fragment>,
              <Fragment key="open">
                על הרווח הריאלי <Term prefix="ב" id="מכירה">מכירה</Term> או בפדיון
              </Fragment>,
            ],
          },
        ]}
      />
      <RulesLine ids={["CORP-01", "CORP-23", "TX2-06", "TXI-12", "TXS-03", "MF-05", "MF-10", "MF-11", "MF-16", "MF-20", "MF-60", "TXS-09", "TXS-33"]} />
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
          { key: "migdal", head: "מגדל (MTF)", cells: [migdal("MF-64", "funds_migdal"), migdal("MF-64", "end_migdal"), migdal("MF-64", "fee_migdal"), migdal("MF-64", "trustee_migdal")] },
        ]}
      />
      <RulesLine ids={["MF-62", "MF-63", "MF-64"]} />
      <Sentence measure>
        דמי ניהול יכולים לעלות: בקרן 5137492 של ילין לפידות הם היו {yalin("MF-63", "fee_report")} בדוח השנתי ל־{yalin("MF-63", "fee_report_date")}, ובתשקיף המאוחר יותר כתוב {yalin("MF-63", "fee")}. לכן כדאי לבדוק את דמי הניהול בדוח או בתשקיף האחרונים של הקרן.
      </Sentence>
      <RulesLine ids={["MF-63"]} />
      <Sentence measure>מעבר לדמי הניהול, הבנק או בית ההשקעות שדרכו קונים יכולים לגבות <Term id="עמלה">עמלה</Term> על קנייה ומכירה של יחידות, כך כותבת ילין לפידות. לא נמצא אם נגבית עמלה גם על התשלום בפירוק.</Sentence>
      <RulesLine ids={["MF-63", "MF-27"]} />
      <Sentence measure>נבדקו התשקיפים של תשעה מנהלי קרנות, ורשימות הקרנות של שישה נוספים לפי השם בלבד. אצל ארבעה מהשישה לא נמצאה קרן כזו. אצל איילון, סיגמא, מור ואלטשולר שחם יש קרנות עם תאריך בשם, בלי נוסח שאומר שהן מתפרקות, ולכן הן לא בטבלה. קרן שנוספה אחרי התשקיף יכולה להיות חסרה.</Sentence>
      <RulesLine ids={["MF-65"]} />
      <Sentence measure>בחוץ לארץ יש קרנות דומות, כמו iShares iBonds ו־Invesco BulletShares. בבורסה בתל אביב לא נמצאה <Term id="קרן זרה">קרן זרה</Term> כזו, ולא נבדק אם חשבון ישראלי מציע אותן.</Sentence>
      <RulesLine ids={["ETF-79", "ETF-80", "ETF-81"]} />
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
        לפי החוק, מי שמפרק את הקרן מודיע על הפירוק בין {max && <Num value={max} />} ל־{min && <Num value={min} />} ימים לפני המועד, ומרגע ההודעה <Term id="קרן פתוחה">קרן פתוחה</Term> מפסיקה להציע יחידות. הוא מוכר את הנכסים ופודה את היחידות במועד הפירוק.
      </Sentence>
      <RulesLine ids={["MF-60"]} />
      <Sentence measure>
        המועד האחרון לתשלום כתוב במסמך של הקרן, והמנהל יכול להודיע אחרת: בקרן 5137492 של ילין לפידות עד {yalin("MF-63", "last_payment")}, בקרן 5140249 של תכלית עד {tachlit("MF-64", "payment_5140249")}, ובקרן 5140231 של תכלית עד {tachlit("MF-64", "payment_5140231")}. בשתי קרנות תכלית האלה המנהל מתחייב לא להעלות את שכרו עד הפירוק.
      </Sentence>
      <RulesLine ids={["MF-63", "MF-64"]} />
      <Callout tone="caution" className="max-w-measure" title="עוד לא נבדק פירוק בפועל">
        הקרנות הראשונות מסתיימות ב־{kesem("MF-62", "end_first")}, וב־{kesem("MF-66", "notice_checked")} עוד לא נמצאה הודעת פירוק בשתי הקרנות שנבדקו. ההנחה שהכסף מגיע כמזומן <Term prefix="ל" id="חשבון ניירות ערך">חשבון ניירות ערך</Term> היא מסקנה מהחוק. בחוק לא נאמר אם אפשר עוד לפדות יחידות אחרי ההודעה.
      </Callout>
      <RulesLine ids={["MF-60", "MF-62", "MF-66"]} />
    </>
  );
}

export function Tax({ figure }: ContentProps) {
  const rate = figure("TXS-09", "rate");
  return (
    <>
      <Sentence measure>לפי מסקנת האתר, בקרן פטורה הפירוק הוא פדיון של היחידות, ולכן הוא ממוסה כמו כל פדיון: עד {rate && <Num value={rate} />} מהרווח הריאלי, עם <Term id="ניכוי מס במקור">ניכוי במקור</Term> בשעת התשלום. הפסד בפירוק הוא <Term id="הפסד הון">הפסד הון</Term> רגיל.</Sentence>
      <RulesLine ids={["TXS-33", "TXS-09", "TXS-34", "TXS-35"]} />
      <Callout tone="caution" className="max-w-measure" title={<>מסקנה, ולא נוסח של <Term id="רשות המסים">רשות המסים</Term></>}>
        שום טקסט של רשות המסים לא מזכיר תשלום בפירוק קרן. המסקנה של האתר באה מחוק הקרנות ומפקודת מס הכנסה. לא נמצא באיזו <Term id="שנת המס">שנת מס</Term> נרשמת התוצאה כשהקרן מסתיימת בשנה אחת ומשלמת בשנה הבאה, ובקרן דולרית לא נמצא באיזה יום נקבע השער.
      </Callout>
      <RulesLine ids={["TXS-35", "TXS-36"]} />
    </>
  );
}

export function Risks({ figure }: ContentProps) {
  const kesem = ownFigure(figure, "קסם");
  const yalin = ownFigure(figure, "ילין לפידות");
  return (
    <>
      <Sentence measure>הסכום לא מובטח. הבורסה כותבת שמדדי בולט נועדו לקבע <Term id="תשואה לפדיון">תשואה לפדיון</Term>, אבל זה תיאור של מדד: ילין לפידות כותבת שאין בכך התחייבות, וסכום הכסף שיחזור לא ידוע מראש.</Sentence>
      <RulesLine ids={["MF-61", "MF-63"]} />
      <Sentence measure>מכירה לפני הסוף נעשית במחיר של אותו יום, שיכול להיות נמוך ממה ששולם.</Sentence>
      <RulesLine ids={["MF-10", "MF-11"]} />
      <Sentence measure>חדלות פירעון של מנפיק פוגעת בחלק מהקרן, והפגיעה מגיעה למחזיק דרך <Term id="מחיר קנייה">מחיר היחידה</Term>.</Sentence>
      <RulesLine ids={["MF-10", "TXS-37"]} />
      <Sentence measure>
        קרוב לסוף יכולות להישאר פחות החזקות. זו מסקנה מדיווח אחד: במדד של קרן 5138565 של קסם, שמסתיימת ב־{kesem("MF-62", "end_first")}, היו ב־{kesem("MF-66", "index_date")} רק {kesem("MF-66", "holdings")} <Term id="נייר ערך">ניירות ערך</Term>, וחמשת הגדולים שקלו {kesem("MF-66", "top_five")}.
      </Sentence>
      <RulesLine ids={["MF-66"]} />
      <Sentence measure>
        בקרן יכולות להיות איגרות שמועד הפדיון הסופי שלהן אחרי השנה שבשם, אם למנפיק יש זכות לפדות אותן מוקדם במועד מוגדר. אם הוא לא משתמש בזכות, האיגרת יוצאת מהמדד. כך הבהירו קסם ב־{kesem("MF-66", "kesem_note")} וילין לפידות ב־{yalin("MF-66", "yalin_note")}.
      </Sentence>
      <RulesLine ids={["MF-66"]} />
    </>
  );
}

/** Glossary terms the prose opens with <Term>, so their cards ship with the page. */
export const termIds = [
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
