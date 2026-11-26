// Guide prose for funds of every kind (D55): what a fund is under the law, its kinds, how units change hands, its fees, who holds
// the money and a short tax note. A page of its own and not a product id, so it stays out of the comparison. Every figure is a Num over a rule
// figure; the words that state a rule open it (Ruled, D116), and a figure from a rule opens it from its sheet (il-finance MF, ETF, REG,
// TXS, BANK, BRK); only general rules, and one
// record seen only in two companies' fund names (ETF-61), stated as those companies' names. Kept short
// (8dd1f013:research/specs/2026-11-03-funds-guide/review.md): no risks or documents section, no creation route, no distribution fee, no ETN history.
import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";
import { Num, Ruled, Term } from "../../components/provenance";
import { Callout, FixedTable, ProseList, Sentence } from "../../components/kit";
import { INDICES_PATH } from "../../lib/site-paths";
import { fmt } from "../../lib/format";
import type { SiteValue } from "../../lib/value";
import type { ContentProps } from "./types";

const n = (v: SiteValue | null): ReactNode => (v ? <Num value={v} /> : null);
const linkClass = "text-link hover:underline";

export function What() {
  return (
    <>
      <Sentence measure>
        <Term id="קרן נאמנות">קרן נאמנות</Term> היא כסף של משקיעים רבים שמושקע יחד. היא <Ruled id="MF-01">קמה בהסכם</Ruled> בין <Term id="מנהל קרן">מנהל הקרן</Term> <Term prefix="ל" id="נאמן">נאמן</Term>, שני גופים <Term prefix="ש" id="רשות ניירות ערך">רשות ניירות ערך</Term> אישרה.
      </Sentence>
      <Sentence measure>
        הקרן מחולקת ל<Term id="יחידה">יחידות</Term>, וכל יחידה נותנת זכות שווה בקרן. <Ruled id="MF-04">יחידות מוצעות לציבור רק לפי</Ruled> <Term id="תשקיף">תשקיף</Term> שהרשות התירה לפרסם.
      </Sentence>
      <Callout tone="info" className="max-w-measure" title={<><Term id="קרן סל">קרן סל</Term> <Term prefix="ו" id="קרן מחקה פתוחה">קרן מחקה פתוחה</Term> הן קרנות נאמנות</>}>
        המילים ״קרן נאמנות״ לא אומרות איך הקרן נסחרת ובמה היא משקיעה. את זה <Ruled id="MF-01">קובע הסכם הקרן</Ruled>: אם היא פתוחה או סגורה, ומה מדיניות ההשקעה שלה, למשל אם הקרן מחקה מדד.
      </Callout>
    </>
  );
}

export function Kinds({ figure }: ContentProps) {
  const asOf = figure("ETF-18", "counts_as_of");
  return (
    <>
      <Sentence measure>
        <Term id="קרן מחקה">קרן מחקה</Term> עוקבת אחרי מדד או אחרי מחיר של סחורה: <Ruled id="ETF-01">היא מכוונת לתוצאות שנגזרות מהשינוי במחיר שלו</Ruled>.
      </Sentence>
      <FixedTable
        measure
        rowHead="מדיניות ההשקעה"
        columns={[
          { id: "open", head: <><Term id="קרן פתוחה">פתוחה</Term>: <Ruled id="MF-05">קונים מהקרן ופודים לה</Ruled></> },
          { id: "closed", head: <>סגורה: קונים ומוכרים <Term prefix="ב" id="בורסה">בורסה</Term></> },
        ]}
        rows={[
          {
            key: "tracking",
            head: "מחקה מדד",
            cells: ["קרן מחקה פתוחה", "קרן סל"],
          },
          { key: "other", head: "לא מחקה", cells: ["קרן פתוחה", <Term key="s" id="קרן סגורה">קרן סגורה</Term>] },
        ]}
      />
      <Sentence measure>קרן מחקה סגורה היא קרן סל <Ruled id="ETF-01">רק כשהסכם הקרן קובע שהיא קרן סל</Ruled>.</Sentence>
      <Sentence measure>
        לפי הדוח השנתי של רשות ניירות ערך, בסוף {asOf ? <Num value={asOf} display={String(asOf.value).slice(0, 4)} /> : null} היו בישראל {n(figure("ETF-18", "etf_count"))} קרנות סל ו־{n(figure("ETF-18", "open_tracking_fund_count"))} קרנות מחקות פתוחות. <Ruled id="ETF-18">שתיהן עוקבות אחרי מדד באותה דרך</Ruled>, וההבדל ביניהן הוא איך ומתי קונים ומוכרים אותן.
      </Sentence>
      <Sentence measure>
        <Term id="קרן כספית">קרן כספית</Term> היא סוג נפרד: קרן שהנכסים שלה <Term prefix="ב" id="סיכון אשראי">סיכון אשראי</Term> נמוך, והסכם הקרן שלה <Ruled id="MF-07">קובע שהיא קרן כספית</Ruled>.
      </Sentence>
      <Sentence measure>
        בשמות הקרנות של אי.בי.אי ושל ילין לפידות שנבדקו, <Ruled id="ETF-61">״סל״ מסמן קרן סל</Ruled> ו״מחקה״ קרן מחקה פתוחה. לא נמצא כלל שמחייב לכתוב את הסוג בשם. <Ruled id="ETF-01">הסוג כתוב בהסכם הקרן</Ruled>.
      </Sentence>
    </>
  );
}

export function Trade({ figure }: ContentProps) {
  const foreign = figure("MF-74", "foreign_securities_line");
  const minOrder = figure("ETF-67", "min_order_equity_market");
  return (
    <>
      <FixedTable
        measure
        rowHead="מה בודקים"
        columns={[
          { id: "open", head: "קרן מחקה פתוחה" },
          { id: "etf", head: "קרן סל" },
        ]}
        rows={[
          { key: "where", head: "ממי קונים", cells: [<Fragment key="open">מהקרן, דרך <Term id="מפיץ">מפיץ</Term></Fragment>, "ממוכר בבורסה"] },
          { key: "when", head: "מתי", cells: [<Fragment key="open"><Ruled id="MF-09">בימים שהקרן מחשבת בהם מחיר</Ruled>, לפי <Term id="השעה היעודה">השעה היעודה</Term></Fragment>, <Fragment key="etf"><Ruled id="ETF-04">לאורך יום המסחר</Ruled></Fragment>] },
          { key: "price", head: "באיזה מחיר", cells: [<Fragment key="open"><Ruled id="MF-05">לפי שווי הנכסים</Ruled></Fragment>, <Fragment key="etf">בבורסה, <Ruled id="ETF-06">לא תמיד שווי היחידה</Ruled></Fragment>] },
          { key: "order", head: "מה מזמינים", cells: [<Fragment key="open"><Ruled id="MF-11">סכום כסף</Ruled></Fragment>, "מספר יחידות"] },
        ]}
      />
      <Sentence measure>
        בקרן פתוחה, הוראת קנייה או <Term id="פדיון">פדיון</Term> <Ruled id="MF-11">ניתנת למפיץ</Ruled>, שהוא <Term id="חבר בורסה">חבר בורסה</Term>, כמו בנק או <Term id="בית השקעות">בית השקעות</Term>. <Ruled id="MF-15">ברוב הקרנות אין סכום מינימלי</Ruled>.
      </Sentence>
      <Sentence measure>
        הוראה שמגיעה לפני השעה היעודה של הקרן <Ruled id="MF-10">מקבלת את המחיר של אותו יום</Ruled>. הוראה מאוחרת יותר מקבלת את המחיר של יום החישוב הבא. לכן ברגע ההוראה המחיר עוד לא ידוע.
      </Sentence>
      <Sentence measure>
        בקרן שמותר לה להחזיק עד {n(foreign)} <Term id="נייר ערך">ניירות ערך</Term> מחו״ל, כסף הפדיון מגיע באותו יום, אם ההוראה ניתנה לפני השעה היעודה. בקרן שמותר לה יותר, ביום המסחר הבא.
      </Sentence>
      <Sentence measure>
        במקרים חריגים <Ruled id="MF-13">אפשר להפסיק קנייה ופדיון בקרן פתוחה</Ruled>: יו״ר רשות ניירות ערך רשאי להורות על הפסקה של עד {n(figure("MF-13", "isa_suspension_days"))} ימי מסחר, ובאישור שר האוצר להאריך אותה, עד {n(figure("MF-13", "max_suspension_days"))} ימים רצופים בסך הכול.
      </Sentence>
      <Sentence measure>
        בבורסה <Ruled id="ETF-67">אפשר לקנות גם יחידה אחת</Ruled> של קרן סל. אבל פקודה במסחר הרציף היא לפחות {minOrder ? <Num value={minOrder} display={fmt.nisWhole(Number(minOrder.value))} /> : null} בקרן שנסחרת בשוק המניות של הבורסה, ויותר בקרן שנסחרת בשוק <Term prefix="ה" id="איגרת חוב">אג״ח</Term>.
      </Sentence>
      <Sentence measure>
        המחיר בבורסה נקבע בהיצע ובביקוש, ולכן הוא <Ruled id="ETF-06">יכול להיות גבוה או נמוך משווי היחידה</Ruled>. מנהל של קרן סל חייב לחתום על הסכם עם <Term id="עושה שוק">עושה שוק</Term>, גוף שמציע בכל יום מחיר קנייה ומחיר מכירה ליחידות.
      </Sentence>
    </>
  );
}

export function Cost({ figure }: ContentProps) {
  const cap = (name: string) => n(figure("ETF-14", name));
  return (
    <>
      <Sentence measure>העלות של קרן באה בשלוש שכבות:</Sentence>
      <ProseList
        items={[
          <>
            בתוך <Term id="מחיר קנייה">מחיר היחידה</Term>: <Term id="דמי ניהול קבועים">דמי ניהול קבועים</Term> ו<Term id="שכר נאמן">שכר נאמן</Term>, <Ruled id="MF-16">אחוז שנתי מהנכסים שיורד מנכסי הקרן כל יום</Ruled>, בלי קשר <Term prefix="ל" id="תשואה">תשואה</Term>. בנוסח החוק <Ruled id="MF-20">לא נמצאה להם תקרה כללית</Ruled>.
          </>,
          <>
            בקנייה ובמכירה: בקרן פתוחה המנהל <Ruled id="MF-21">רשאי לגבות בקנייה תוספת למחיר</Ruled> (<Term id="הוספה">הוספה</Term>), שהולכת אליו ולא לקרן. לפי רשות ניירות ערך, רוב הקרנות לא גובות אותה. בקרן סל משלמים בבורסה את הפער בין מחיר הקנייה למחיר המכירה (<Term id="מרווח ציטוט של פקודות קנייה ומכירה">מרווח</Term>).
          </>,
          <>
            אצל הבנק או בית ההשקעות: בבנק אין <Term id="עמלת קנייה ומכירה">עמלת קנייה ומכירה</Term> על קרן פתוחה שלא מחקה, <Ruled id="MF-27">אבל יש על קרן מחקה</Ruled> ועל קרן שנסחרת בבורסה. הבנק רשאי לגבות <Term id="דמי ניהול פיקדון ניירות ערך">דמי משמרת</Term> על יחידות, <Ruled id={["BANK-18", "BRK-17"]}>חוץ מקרן כספית</Ruled>. לפי דוח משותף של הרגולטורים, רוב חברי הבורסה שהם לא בנקים גובים עמלות קנייה ומכירה גם על יחידות. בתעריפון של רוב בתי ההשקעות שנבדקו כתובים ״דמי ניהול פיקדון״ גם על יחידות. עמוד המדדים מחשב לפי התעריפון. לפי אותו דוח, בבתי השקעות <Ruled id="MF-70">מקובל שדמי משמרת לא נגבים בפועל</Ruled>. לכן העלות אצלם יכולה להיות נמוכה יותר.
          </>,
        ]}
      />
      <Sentence measure>
        בקרן מחקה יכולים להיות גם <Term id="דמי ניהול משתנים">דמי ניהול משתנים</Term>, שנגזרים מ<Term id="הפרש עקיבה">הפרש העקיבה</Term>: כשהקרן מפגרת אחרי המדד, <Ruled id="ETF-14">המנהל משלם לקרן</Ruled>. בכל כיוון הם לא עולים על {cap("variable_fee_cap_israeli_bonds_or_equities")} בקרן שרוב החשיפה שלה לאג״ח ישראליות או למניות ישראליות <Ruled id="ETF-05">עם עלויות יצירה נמוכות</Ruled>, {cap("variable_fee_cap_foreign_indices")} בקרן שרוב החשיפה שלה למדדים שנסחרים בחו״ל, ו־{cap("variable_fee_cap_other")} בשאר הקרנות.
      </Sentence>
      <Sentence measure>
        המנהל גובה את דמי הניהול המשתנים פעם ברבעון. הוא רשאי לשנות את השיעור שלהם בתחילת כל שנה. מנהלי קרנות מתחייבים בתשקיף שלהם <Ruled id="MF-17">להעלות דמי ניהול קבועים רק ביום הראשון של השנה</Ruled>, ומורידים אותם בכל עת. זו התחייבות של כל מנהל, לא חוק, ומנהל יכול לחזור בו ממנה ב־1 בינואר.
      </Sentence>
      <Sentence measure>
        <Ruled id="MF-16">השיעורים כתובים בתשקיף</Ruled>, והדוח השנתי של כל קרן <Ruled id="ETF-13">מפרט את ההוצאות שירדו מנכסי הקרן</Ruled>. כמה כל השכבות עולות יחד בכל בנק ובית השקעות, לכל קרן מחקה פתוחה ולכל קרן סל על מדד:{" "}
        <Link to={INDICES_PATH} className={linkClass}>
          השקעה במדד
        </Link>
        .
      </Sentence>
    </>
  );
}

export function Safety({ figure }: ContentProps) {
  return (
    <>
      <Sentence measure>
        הנאמן מחזיק את נכסי הקרן בשביל <Term id="בעלי היחידות">בעלי היחידות</Term>, <Ruled id="MF-02">בנפרד מהרכוש שלו, ואי אפשר לעקל אותם</Ruled>. הוא גם <Ruled id="MF-03">מפקח על כך שמנהל הקרן מקיים את החוק</Ruled>, את הסכם הקרן ואת התשקיף. <Ruled id="REG-10">הפסדים בשוק לא מוגנים</Ruled>: ירידה בשווי הנכסים יורדת ממחיר היחידה.
      </Sentence>
      <Sentence measure>
        מנהל קרן שקורס <Ruled id="REG-11">חייב להעביר את ניהול הקרנות למנהל אחר</Ruled> שלא קשור אליו. כשממנים לנאמן כונס נכסים או מפרק זמני והצו לא מבוטל בתוך {n(figure("REG-11", "order_lift_days"))} ימים, הכהונה שלו נגמרת. אז המנהל חייב להביא נאמן אחר בתוך {n(figure("REG-11", "trustee_replacement_days"))} ימים, והנאמן הקודם ממשיך עד שהחדש מתחיל לכהן.
      </Sentence>
      <Callout tone="caution" className="max-w-measure">
        החוק אומר מי מחליף מנהל או נאמן שקרס, אבל לא אומר במפורש מה קורה לכסף של בעלי היחידות כשמנהל הקרן עצמו קורס. זו עדיין שאלה פתוחה.
      </Callout>
    </>
  );
}

export function Tax({ figure }: ContentProps) {
  return (
    <>
      <Sentence measure>
        לכל קרן נאמנות ישראלית, <Ruled id="TXS-13">מחקה או לא</Ruled>, <Ruled id="TXS-07">יש אחד משני מסלולי מס</Ruled>: <Term id="קרן נאמנות פטורה">קרן פטורה</Term> או <Term id="קרן נאמנות חייבת">קרן חייבת</Term>. המסלול כתוב בהסכם הקרן או בתשקיף שלה. הבורסה <Ruled id="TXS-07">מפרסמת אותו באתר הדיווחים שלה</Ruled>, מאיה.
      </Sentence>
      <Sentence measure>
        בקרן פטורה, מי שמוכר או פודה יחידה משלם <Term id="מס רווחי הון">מס רווחי הון</Term> של עד {n(figure("TXS-09", "rate"))} מ<Term id="רווח הון ריאלי">הרווח הריאלי</Term>. הבנק או חבר הבורסה מנכה את המס במקור. מגיל {n(figure("TXG-04", "age"))} <Ruled id="TXS-22">השיעור יכול להיות נמוך יותר</Ruled>. בקרן חייבת <Ruled id="TXS-11">המס משולם בתוך הקרן על ההכנסות שלה</Ruled>, ומי שמוכר או פודה יחידות לא משלם מס.
      </Sentence>
      <Sentence measure>מעבר מקרן לקרן הוא <Term id="מכירה">מכירה</Term>: <Ruled id="TXS-21">המס מנוכה במקור גם אם הכסף לא יוצא מהחשבון</Ruled>.</Sentence>
    </>
  );
}

/** Glossary terms the prose opens with <Term>, so their cards ship with the page. */
export const termIds = [
  "קרן נאמנות",
  "סיכון אשראי",
  "בית השקעות",
  "תשואה",
  "עיקול",
  "מכירה",
  "מנהל קרן",
  "נאמן",
  "יחידה",
  "תשקיף",
  "קרן מחקה",
  "קרן פתוחה",
  "קרן סל",
  "קרן מחקה פתוחה",
  "קרן כספית",
  "מפיץ",
  "חבר בורסה",
  "השעה היעודה",
  "פדיון",
  "עושה שוק",
  "דמי ניהול קבועים",
  "שכר נאמן",
  "הוספה",
  "מרווח ציטוט של פקודות קנייה ומכירה",
  "דמי ניהול משתנים",
  "הפרש עקיבה",
  "דמי ניהול פיקדון ניירות ערך",
  "קרן נאמנות פטורה",
  "קרן נאמנות חייבת",
  "רווח הון ריאלי", "מס רווחי הון",
  "בעלי היחידות",
  "קרן סגורה",
  "עמלת קנייה ומכירה",
  "מחיר קנייה",
  "איגרת חוב",
  "בורסה",
  "נייר ערך",
  "רשות ניירות ערך",
] as const;
