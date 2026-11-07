// Guide prose for funds of every kind (D55, 2026-11-03): what a fund is under the law, its kinds, how units change hands, its fees, who holds
// the money and a short tax note. A page of its own and not a product id, so it stays out of the comparison. Every figure is a Num over a rule
// figure, every block ends with the rules it rests on (il-finance MF, ETF, REG, TXS, BANK, BRK, read 2026-11-03); only general rules, and one
// record seen only in two companies' fund names (ETF-61), stated as those companies' names. Cut to about half on 2026-11-03 (review in
// research/specs/2026-11-03-funds-guide/review.md): no risks or documents section, no creation route, no distribution fee, no ETN history.
import { Fragment, type ReactNode } from "react";
import { Link } from "react-router";
import { Num, RulesLine, Term } from "../../components/provenance";
import { Callout, FixedTable, ProseList, Sentence } from "../../components/kit";
import { INDICES_PATH } from "../../lib/invest";
import { fmt } from "../../lib/format";
import type { SiteValue } from "../../lib/value";
import type { ContentProps } from "./types";

const n = (v: SiteValue | null): ReactNode => (v ? <Num value={v} /> : null);
const linkClass = "text-link hover:underline";

export function What() {
  return (
    <>
      <Sentence measure>
        <Term id="קרן נאמנות">קרן נאמנות</Term> היא כסף של משקיעים רבים שמושקע יחד. היא קמה בהסכם בין שני גופים <Term prefix="ש" id="רשות ניירות ערך">רשות ניירות ערך</Term> אישרה: <Term id="מנהל קרן">מנהל הקרן</Term>, שמנהל את ההשקעות, ו<Term id="נאמן">נאמן</Term>, שמחזיק את הנכסים בשביל המשקיעים.
      </Sentence>
      <Sentence measure>
        הקרן מחולקת ל<Term id="יחידה">יחידות</Term>, וכל יחידה נותנת זכות שווה בקרן. יחידות מוצעות לציבור רק לפי <Term id="תשקיף">תשקיף</Term> שהרשות התירה לפרסם.
      </Sentence>
      <RulesLine ids={["MF-01", "MF-02", "MF-04", "REG-07"]} />
      <Callout tone="info" className="max-w-measure" title={<><Term id="קרן סל">קרן סל</Term> <Term prefix="ו" id="קרן מחקה פתוחה">קרן מחקה פתוחה</Term> הן קרנות נאמנות</>}>
        המילים ״קרן נאמנות״ לא אומרות איך הקרן נסחרת ובמה היא משקיעה. את זה קובעים שני הבדלים: אם הקרן מחקה מדד, ואם היא פתוחה או סגורה.
      </Callout>
    </>
  );
}

export function Kinds({ figure }: ContentProps) {
  return (
    <>
      <Sentence measure>
        <Term id="קרן מחקה">קרן מחקה</Term> עוקבת אחרי מדד או אחרי מחיר של סחורה: היא מנסה לעלות ולרדת כמוהו.
      </Sentence>
      <FixedTable
        measure
        rowHead="מדיניות ההשקעה"
        columns={[
          { id: "open", head: <><Term id="קרן פתוחה">פתוחה</Term>: קונים מהקרן ופודים לה</> },
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
      <Sentence measure>קרן מחקה סגורה היא קרן סל רק כשהסכם הקרן קובע שהיא קרן סל.</Sentence>
      <RulesLine ids={["ETF-01", "MF-05"]} />
      <Sentence measure>
        לפי הדוח השנתי של רשות ניירות ערך, בסוף 2025 היו בישראל {n(figure("ETF-18", "etf_count"))} קרנות סל ו־{n(figure("ETF-18", "open_tracking_fund_count"))} קרנות מחקות פתוחות. שתיהן עוקבות אחרי מדד באותה דרך, וההבדל ביניהן הוא איך ומתי קונים ומוכרים אותן.
      </Sentence>
      <RulesLine ids={["ETF-18"]} />
      <Sentence measure>
        <Term id="קרן כספית">קרן כספית</Term> היא סוג נפרד: קרן שהנכסים שלה בסיכון אשראי נמוך, והסכם הקרן שלה קובע שהיא קרן כספית.
      </Sentence>
      <RulesLine ids={["MF-07"]} />
      <Sentence measure>
        בשמות הקרנות של אי.בי.אי ושל ילין לפידות שנבדקו, ״סל״ מסמן קרן סל ו״מחקה״ קרן מחקה פתוחה. כלל שמחייב לכתוב את הסוג בשם לא נמצא; הסוג כתוב בהסכם הקרן.
      </Sentence>
      <RulesLine ids={["ETF-61", "ETF-01"]} />
    </>
  );
}

export function Trade({ figure }: ContentProps) {
  const foreign = figure("MF-11", "foreign_securities_line");
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
          { key: "when", head: "מתי", cells: [<Fragment key="open">פעם ביום, לפי <Term id="השעה היעודה">השעה היעודה</Term></Fragment>, "לאורך יום המסחר"] },
          { key: "price", head: "באיזה מחיר", cells: ["לפי שווי הנכסים", "בבורסה, לא תמיד שווי היחידה"] },
          { key: "order", head: "מה מזמינים", cells: ["סכום כסף", "מספר יחידות"] },
        ]}
      />
      <RulesLine ids={["MF-05", "MF-09", "MF-10", "MF-11", "ETF-04", "ETF-06"]} />
      <Sentence measure>
        בקרן פתוחה, הוראת קנייה או <Term id="פדיון">פדיון</Term> ניתנת למפיץ, שהוא <Term id="חבר בורסה">חבר בורסה</Term>, כמו בנק או <Term id="בית השקעות">בית השקעות</Term>. ברוב הקרנות אין סכום מינימלי.
      </Sentence>
      <Sentence measure>
        הוראה שמגיעה לפני השעה היעודה של הקרן מקבלת את המחיר של אותו יום; הוראה מאוחרת יותר, את המחיר של יום החישוב הבא. לכן ברגע ההוראה המחיר עוד לא ידוע.
      </Sentence>
      <Sentence measure>
        בקרן שמותר לה להחזיק עד {n(foreign)} <Term id="נייר ערך">ניירות ערך</Term> מחו״ל, כסף הפדיון מגיע באותו יום, אם ההוראה ניתנה לפני השעה היעודה. בקרן שמותר לה יותר, ביום המסחר הבא.
      </Sentence>
      <Sentence measure>
        במקרים חריגים אפשר להפסיק קנייה ופדיון בקרן פתוחה: יו״ר רשות ניירות ערך רשאי להורות על הפסקה של עד {n(figure("MF-13", "isa_suspension_days"))} ימי מסחר, ובאישור שר האוצר להאריך אותה, עד {n(figure("MF-13", "max_suspension_days"))} ימים רצופים בסך הכול.
      </Sentence>
      <RulesLine ids={["MF-11", "MF-15", "MF-09", "MF-10", "MF-13"]} />
      <Sentence measure>
        בבורסה אפשר לקנות גם יחידה אחת של קרן סל, אבל פקודה במסחר הרציף היא לפחות {minOrder ? <Num value={minOrder} display={fmt.nisWhole(Number(minOrder.value))} /> : null} בקרן שנסחרת בשוק המניות של הבורסה, ויותר בקרן שנסחרת בשוק <Term prefix="ה" id="איגרת חוב">אג״ח</Term>.
      </Sentence>
      <Sentence measure>
        המחיר בבורסה נקבע בהיצע ובביקוש, ולכן הוא יכול להיות גבוה או נמוך משווי היחידה. מנהל של קרן סל חייב לחתום על הסכם עם <Term id="עושה שוק">עושה שוק</Term>, גוף שמציע בכל יום מחיר קנייה ומחיר מכירה ליחידות.
      </Sentence>
      <RulesLine ids={["ETF-67", "ETF-06"]} />
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
            בתוך <Term id="מחיר קנייה">מחיר היחידה</Term>: <Term id="דמי ניהול קבועים">דמי ניהול קבועים</Term> ו<Term id="שכר נאמן">שכר נאמן</Term>, אחוז שנתי מהנכסים שיורד מנכסי הקרן כל יום, בלי קשר <Term prefix="ל" id="תשואה">תשואה</Term>. בנוסח החוק לא נמצאה להם תקרה כללית.
          </>,
          <>
            בקנייה ובמכירה: בקרן פתוחה המנהל רשאי לגבות בקנייה תוספת למחיר (<Term id="הוספה">הוספה</Term>), שהולכת אליו ולא לקרן, ולפי רשות ניירות ערך רוב הקרנות לא גובות אותה. בקרן סל משלמים בבורסה את הפער בין מחיר הקנייה למחיר המכירה (<Term id="מרווח ציטוט של פקודות קנייה ומכירה">מרווח</Term>).
          </>,
          <>
            אצל הבנק או בית ההשקעות: בבנק אין <Term id="עמלת קנייה ומכירה">עמלת קנייה ומכירה</Term> על קרן פתוחה שאינה מחקה, אבל יש על קרן מחקה ועל קרן שנסחרת בבורסה, והבנק רשאי לגבות <Term id="דמי ניהול פיקדון ניירות ערך">דמי משמרת</Term> על יחידות, חוץ מקרן כספית. לפי דוח משותף של הרגולטורים, רוב חברי הבורסה שאינם בנקים גובים עמלות קנייה ומכירה גם על יחידות, ולפי רשות ניירות ערך בתי השקעות בדרך כלל לא גובים <Term id="דמי משמרת">דמי משמרת</Term> על יחידות.
          </>,
        ]}
      />
      <RulesLine ids={["MF-16", "MF-20", "MF-21", "ETF-06", "MF-27", "BRK-17", "BANK-18"]} />
      <Sentence measure>
        בקרן מחקה יכולים להיות גם <Term id="דמי ניהול משתנים">דמי ניהול משתנים</Term>, שנגזרים מ<Term id="הפרש עקיבה">הפרש העקיבה</Term>: כשהקרן מפגרת אחרי המדד, המנהל משלם לקרן. בכל כיוון הם לא עולים על {cap("variable_fee_cap_israeli_bonds_or_equities")} בקרן שרוב החשיפה שלה לאג״ח ישראליות או למניות ישראליות עם עלויות יצירה נמוכות, {cap("variable_fee_cap_foreign_indices")} בקרן שרוב החשיפה שלה למדדים שנסחרים בחו״ל, ו־{cap("variable_fee_cap_other")} בשאר הקרנות.
      </Sentence>
      <Sentence measure>
        את דמי הניהול המשתנים המנהל גובה פעם ברבעון, ורשאי לשנות את השיעור שלהם בתחילת כל שנה. מנהלי הקרנות מעלים דמי ניהול קבועים רק ביום הראשון של השנה ומורידים אותם בכל עת, לפי מתווה וולונטרי שלהם.
      </Sentence>
      <RulesLine ids={["ETF-14", "ETF-05", "MF-17"]} />
      <Sentence measure>
        השיעורים כתובים בתשקיף, והדוח השנתי של כל קרן מפרט את ההוצאות שירדו מנכסי הקרן. כמה כל השכבות עולות יחד בכל בנק ובית השקעות, לכל קרן מחקה פתוחה ולכל קרן סל על מדד:{" "}
        <Link to={INDICES_PATH} className={linkClass}>
          השקעה במדד
        </Link>
        .
      </Sentence>
      <RulesLine ids={["MF-16", "ETF-13"]} />
    </>
  );
}

export function Safety({ figure }: ContentProps) {
  return (
    <>
      <Sentence measure>
        הנאמן מחזיק את נכסי הקרן בשביל <Term id="בעלי היחידות">בעלי היחידות</Term>, בנפרד מהרכוש שלו, ואי אפשר לעקל אותם. הוא גם מפקח על כך שמנהל הקרן מקיים את החוק, את הסכם הקרן ואת התשקיף. הפסדים בשוק לא מוגנים: ירידה בשווי הנכסים יורדת ממחיר היחידה.
      </Sentence>
      <RulesLine ids={["MF-02", "MF-03", "REG-10"]} />
      <Sentence measure>
        מנהל קרן שקורס חייב להעביר את ניהול הקרנות למנהל אחר שלא קשור אליו. כשנאמן קורס, המנהל חייב להביא נאמן אחר בתוך {n(figure("REG-11", "trustee_replacement_days"))} ימים, והנאמן הקודם ממשיך עד שהחדש מתחיל לכהן.
      </Sentence>
      <Callout tone="caution" className="max-w-measure">
        החוק אומר מי מחליף מנהל או נאמן שקרס, אבל לא אומר במפורש מה קורה לכסף של בעלי היחידות כשמנהל הקרן עצמו קורס. זו עדיין שאלה פתוחה.
      </Callout>
      <RulesLine ids={["REG-11"]} />
    </>
  );
}

export function Tax({ figure }: ContentProps) {
  return (
    <>
      <Sentence measure>
        לכל קרן נאמנות ישראלית, מחקה או לא, יש אחד משני מסלולי מס: <Term id="קרן נאמנות פטורה">קרן פטורה</Term> או <Term id="קרן נאמנות חייבת">קרן חייבת</Term>. המסלול כתוב בהסכם הקרן או בתשקיף שלה, והבורסה מפרסמת אותו באתר הדיווחים שלה, מאיה.
      </Sentence>
      <Sentence measure>
        בקרן פטורה, מי שמוכר או פודה יחידה משלם עד {n(figure("TXS-09", "rate"))} מ<Term id="רווח הון ריאלי">הרווח הריאלי</Term>, והבנק או חבר הבורסה מנכה את המס במקור; מגיל 60 השיעור יכול להיות נמוך יותר. בקרן חייבת המס משולם בתוך הקרן על ההכנסות שלה, ומי שמוכר או פודה יחידות לא משלם מס.
      </Sentence>
      <Sentence measure>מעבר מקרן לקרן הוא <Term id="מכירה">מכירה</Term>: המס מנוכה במקור גם אם הכסף לא יוצא מהחשבון.</Sentence>
      <RulesLine ids={["TXS-07", "TXS-13", "TXS-24", "TXS-09", "TXS-11", "TXS-22", "TXS-21"]} />
    </>
  );
}

/** Glossary terms the prose opens with <Term>, so their cards ship with the page. */
export const termIds = [
  "קרן נאמנות",
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
  "רווח הון ריאלי",
  "בעלי היחידות",
  "קרן סגורה",
  "דמי משמרת",
  "עמלת קנייה ומכירה",
  "מחיר קנייה",
  "איגרת חוב",
  "בורסה",
  "נייר ערך",
  "רשות ניירות ערך",
] as const;
