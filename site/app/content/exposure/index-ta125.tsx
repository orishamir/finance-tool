// Exposure prose for מדד ת"א-125 (flows 6.6). Written from the rule base (ETF-33 to ETF-36 added
// the same day from TASE's own pages, ETF-41 and ETF-42 from TASE's index page and the part-seven guidelines;
// ETF, TXS, MF, BRK, IRA). Each block ends with the rules it rests on. How TASE picks the shares is behind a fold: only a
// specialist needs it. NEW copy for the founder to review.
import type { ExposureContent } from "../guide/types";
import type { GlanceItem } from "../../components/guide/sections";
import { GuideFold as Fold, KeyValueList as RuleRows } from "../../components/guide/sections";
import { Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { KeyValueList, Sentence } from "../../components/kit";

export const content: ExposureContent = {
  glance: ({ figure }) => {
    const n = figure("ETF-33", "constituents");
    const cap = figure("ETF-41", "weight_cap");
    const items: (GlanceItem | null)[] = [
      n && { id: "constituents", label: "מניות במדד", value: <Num value={n} /> },
      cap && { id: "cap", label: "תקרת משקל למניה אחת", value: <Num value={cap} /> },
    ];
    return items.filter((g) => g !== null);
  },
  what: ({ figure }) => {
    const n = figure("ETF-33", "constituents");
    const updates = figure("ETF-35", "composition_updates_per_year");
    const cap = figure("ETF-41", "weight_cap");
    const ceiling = figure("ETF-41", "weight_cap_ceiling");
    const entry35 = figure("ETF-41", "ta35_entry_rank");
    const exit35 = figure("ETF-41", "ta35_exit_rank");
    const entry90 = figure("ETF-41", "ta90_entry_rank");
    const exit90 = figure("ETF-41", "ta90_exit_rank");
    const every = figure("ETF-42", "calculation_interval_seconds");
    return (
      <>
        <p className="max-w-measure">
          <Term prefix="ה" id="בורסה">בורסה</Term> מתארת את <Term id="ת&quot;א-125">ת״א-125</Term> כמדד הייחוס החשוב ביותר שלה, שמשקף את הכלכלה הישראלית. הוא כולל את מניות <Term id="ת&quot;א-35">ת״א-35</Term> <Term prefix="ו" id="ת&quot;א-90">ת״א-90</Term>.
        </p>
        <Sentence measure>
          הכסף מושקע, דרך קרן, במניות של {n ? <Num value={n} /> : null} החברות בעלות השווי הגבוה ביותר בבורסה בתל אביב, בשקלים.
        </Sentence>
        <Sentence measure>
          משקל כל מניה נקבע לפי שווי החזקות הציבור, עם מדרגת נזילות ותקרת משקל. ועדת המדדים קבעה תקרה של {cap ? <Num value={cap} /> : null} למניה אחת, מתוך גבול של {ceiling ? <Num value={ceiling} /> : null} שהנחיות הבורסה מתירות. הרכב המדד מתעדכן {updates ? <Num value={updates} /> : null} פעמים בשנה, בתחילת מאי ונובמבר.
        </Sentence>
        <p className="max-w-measure">
          המדד מחושב <Term prefix="כ" id="תשואה כוללת ברוטו">תשואה כוללת ברוטו</Term>: <Term id="דיבידנד">דיבידנד</Term> נספר במדד ביום האקס בלי להוריד מס. לכן קרן שעוקבת אחריו נמדדת מול מדד שלפני מס.
        </p>
        <RulesLine ids={["ETF-33", "ETF-35", "ETF-36", "ETF-41", "ETF-42"]} />
        <Fold label="איך נבחרות המניות למדד">
          <p className="max-w-measure">המניות נבחרות ממאגר "רימון", כ-250 מניות שעומדות בתנאי שווי שוק, סחירות וזיקה לישראל.</p>
          <p className="max-w-measure">לפי הנחיות הבורסה, המדד הוא פשוט מניות ת״א-35 ות״א-90 יחד, ומתעדכן איתם. בכל אחד מהם המניות מדורגות לפי שווי שוק ממוצע:</p>
          <KeyValueList
            rows
            items={[
              {
                id: "ta35",
                label: 'ת״א-35',
                value: (
                  <Sentence as="span">
                    מניה נכנסת בדירוג {entry35 ? <Num value={entry35} /> : null} או גבוה ממנו, ויוצאת בדירוג {exit35 ? <Num value={exit35} /> : null} או נמוך ממנו.
                  </Sentence>
                ),
              },
              {
                id: "ta90",
                label: 'ת״א-90',
                value: (
                  <Sentence as="span">
                    מניה נכנסת בדירוג {entry90 ? <Num value={entry90} /> : null}, ויוצאת בדירוג {exit90 ? <Num value={exit90} /> : null}.
                  </Sentence>
                ),
              },
            ]}
          />
          <p className="max-w-measure">כך לא מחליפים מניה על כל שינוי קטן.</p>
          <Sentence measure>המדד מחושב בזמן אמת כל {every ? <Num value={every} /> : null} שניות.</Sentence>
          <RulesLine ids={["ETF-34", "ETF-35", "ETF-41", "ETF-42"]} />
        </Fold>
      </>
    );
  },
  holdNote: ({ figure }) => {
    const rate = figure("TXS-09", "rate");
    return (
      <>
        <p className="max-w-measure">
          מחזיקים את המדד דרך <Term id="קרן סל">קרן סל</Term> או <Term id="קרן מחקה פתוחה">קרן מחקה</Term> ישראלית. שתיהן <Term id="קרן נאמנות">קרנות נאמנות</Term> בשקלים עם <Term id="מספר בורסה">מספר בורסה</Term>. קרן על מדד מקומי קונה בדרך כלל את המניות עצמן.
        </p>
        <p className="max-w-measure">
          <Term id="קרן חוץ">קרן חוץ</Term> אינה רשאית להתמחות בישראל, ולכן מדד ישראלי מגיעים אליו רק דרך קרן ישראלית.
        </p>
        <RulesLine ids={["ETF-01", "ETF-20", "ETF-31", "ETF-11", "MF-45"]} />
        <RuleRows
          items={[
            {
              id: "own",
              label: (
                <>
                  <Term prefix="ב" id="חשבון ניירות ערך">חשבון ניירות ערך</Term> <Term prefix="וב" id="קופת גמל בניהול אישי">ניהול אישי</Term>
                </>
              ),
              value: "קונים את הקרן בעצמכם.",
              line: (
                <Sentence as="span">
                  משלמים {rate ? <Num value={rate} /> : null} <Term prefix="מ" id="הרווח הריאלי">הרווח הריאלי</Term> <Term prefix="ב" id="מכירה">מכירה</Term>, מנוכה במקור. החלפה לקרן אחרת היא מכירה.
                </Sentence>
              ),
              rules: ["TXS-09", "TXS-13", "TXS-21", "IRA-11", "BRK-16"],
            },
            {
              id: "track",
              label: (
                <>
                  <Term prefix="ב" id="קופת גמל">קופות הגמל</Term> ובקרנות ההשתלמות
                </>
              ),
              value: (
                <>
                  יש מסלולים "<Term id="עוקב מדדי מניות">עוקב מדדי מניות</Term>", אבל מסלול כזה לא עוקב אחרי ת״א-125 לבד, והוא לא מופיע כאן.
                </>
              ),
              line: (
                <>
                  לפי רשימת <Term id="מסלול השקעה">מסלולי ההשקעה</Term> של <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון</Term>, מסלול כזה עוקב אחרי שלושה <Term id="מדד מניות">מדדי מניות</Term> לפחות, אף אחד מהם לא מעל חצי מהנכסים, והרשימה לא נותנת שם לאף מדד <RuleRef id="CAT-49" end="." />
                </>
              ),
              rules: ["CAT-10", "CAT-49"],
            },
          ]}
        />
        <p className="max-w-measure">
          <Term id="רשות ניירות ערך">רשות ניירות ערך</Term> מפרסמת ממוצע שנתי של דמי הניהול של קרנות סל על מניות בארץ. הוא מופיע בקישור שבכרטיס הכלל. כל קרן קובעת לעצמה, בתוספת <Term id="דמי ניהול משתנים">דמי ניהול משתנים</Term> <Term prefix="ו" id="הפרש עקיבה">הפרש עקיבה</Term>.
        </p>
        <RulesLine ids={["ETF-17", "ETF-13", "ETF-14"]} />
      </>
    );
  },
  risks: ({ figure }) => {
    const minOrder = figure("ETF-67", "min_order_equity_market");
    return (
    <>
      <p className="max-w-measure">
        השווי עולה ויורד עם מניות החברות שבמדד. מחיר קרן סל בבורסה במהלך היום יכול להיות שונה משווי הנכסים שלה, אף שיש <Term id="עושה שוק">עושה שוק</Term>.
      </p>
      <p className="max-w-measure">
        קרן יכולה להתפרק בהודעה מראש, ומנהל רשאי להעלות <Term id="דמי ניהול">דמי ניהול</Term> בתחילת שנה. הרכב המדד משתנה בכל עדכון, וקרן שעוקבת אחריו קונה ומוכרת מניות בהתאם.
      </p>
      <Sentence measure>
        יחידת המסחר בקרן סל היא <Term id="יחידה">יחידה</Term> אחת. בשלב המסחר הרציף, פקודה בקרן על מדד מניות צריכה להיות בשווי של {minOrder ? <Num value={minOrder} /> : null} לפחות <RuleRef id="ETF-67" end="." />
      </Sentence>
      <RulesLine ids={["ETF-06", "ETF-04", "ETF-21", "ETF-14", "ETF-35", "TXS-16", "ETF-67"]} />
    </>
    );
  },
  termIds: ["ת\"א-125", "ת\"א-35", "ת\"א-90", "עוקב מדדי מניות", "דיבידנד", "קרן סל", "קרן מחקה פתוחה", "מספר בורסה", "דמי ניהול משתנים", "הפרש עקיבה", "דמי ניהול קבועים", "פרופיל חשיפה", "קרן נאמנות פטורה", "מס רווחי הון", "יחידה", "דמי ניהול", "עושה שוק", "מדד מניות", "רשות שוק ההון ביטוח וחיסכון", "מסלול השקעה", "קופת גמל", "הרווח הריאלי", "קופת גמל בניהול אישי", "חשבון ניירות ערך", "רשות ניירות ערך", "קרן חוץ", "קרן נאמנות", "בורסה", "מכירה"],
};
