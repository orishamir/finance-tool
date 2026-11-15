// Exposure prose for מדד ת"א-125 (flows 6.6). Written from the rule base (ETF-33 to ETF-36 added
// the same day from TASE's own pages, ETF-41 and ETF-42 from TASE's index page and the part-seven guidelines;
// ETF, TXS, MF, BRK, IRA). The words that state a rule open it (Ruled, D116), and a figure from a rule opens it from its sheet. How TASE picks the shares is behind a fold: only a
// specialist needs it. NEW copy for the founder to review.
import type { ExposureContent } from "../guide/types";
import type { GlanceItem } from "../../components/guide/sections";
import { GuideFold as Fold, RuleRows } from "../../components/guide/sections";
import { Num, Ruled, Term } from "../../components/provenance";
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
          <Term prefix="ה" id="בורסה">בורסה</Term> מתארת את <Term id="ת&quot;א-125">ת״א-125</Term> <Ruled prefix="כ" id="ETF-33">מדד הייחוס החשוב ביותר שלה</Ruled>, שמשקף את הכלכלה הישראלית. הוא כולל את מניות <Term id="ת&quot;א-35">ת״א-35</Term> <Term prefix="ו" id="ת&quot;א-90">ת״א-90</Term>.
        </p>
        <Sentence measure>
          הכסף חשוף, דרך קרן, למניות של {n ? <Num value={n} /> : null} מהחברות הגדולות בבורסה בתל אביב, בשקלים.
        </Sentence>
        <Sentence measure>
          משקל כל מניה <Ruled id="ETF-36">נקבע לפי שווי החזקות הציבור</Ruled>, עם מדרגת נזילות ותקרת משקל. ועדת המדדים קבעה תקרה של {cap ? <Num value={cap} /> : null} למניה אחת, מתוך גבול של {ceiling ? <Num value={ceiling} /> : null} שהנחיות הבורסה מתירות. הרכב המדד מתעדכן {updates ? <Num value={updates} /> : null} פעמים בשנה, בתחילת מאי ונובמבר.
        </Sentence>
        <p className="max-w-measure">
          המדד מחושב <Term prefix="כ" id="תשואה כוללת ברוטו">תשואה כוללת ברוטו</Term>: <Term id="דיבידנד">דיבידנד</Term> <Ruled id="ETF-42">נספר במדד ביום האקס בלי להוריד מס</Ruled>. לכן קרן שעוקבת אחריו נמדדת מול מדד שלפני מס.
        </p>
        <Fold label="איך נבחרות המניות למדד">
          <p className="max-w-measure">המניות <Ruled id="ETF-34">נבחרות ממאגר "רימון"</Ruled>: מניות שעומדות בתנאי שווי שוק, סחירות וזיקה לישראל.</p>
          <p className="max-w-measure">לפי הנחיות הבורסה, המדד הוא פשוט מניות ת״א-35 ות״א-90 יחד, <Ruled prefix="ו" id="ETF-41">מתעדכן איתם</Ruled>. בכל אחד מהם המניות מדורגות לפי שווי שוק ממוצע:</p>
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
        </Fold>
      </>
    );
  },
  holdNote: ({ figure }) => {
    const rate = figure("TXS-09", "rate");
    return (
      <>
        <p className="max-w-measure">
          מחזיקים את המדד דרך <Term id="קרן סל">קרן סל</Term> או <Term id="קרן מחקה פתוחה">קרן מחקה</Term> ישראלית. שתיהן <Term id="קרן נאמנות">קרנות נאמנות</Term> ישראליות עם <Term id="מספר בורסה">מספר בורסה</Term>. קרן על מדד מקומי <Ruled id="ETF-11">קונה בדרך כלל את המניות עצמן</Ruled>.
        </p>
        <p className="max-w-measure">
          <Term id="קרן חוץ">קרן חוץ</Term> <Ruled id="ETF-31">לא רשאית להתמחות בישראל</Ruled>, ולכן מדד ישראלי מגיעים אליו רק דרך קרן ישראלית.
        </p>
        <RuleRows
          items={[
            {
              id: "own",
              label: (
                <>
                  <Term prefix="ב" id="חשבון ניירות ערך">חשבון ניירות ערך</Term> <Term prefix="וב" id="קופת גמל בניהול אישי">ניהול אישי</Term>
                </>
              ),
              value: <>קונים את הקרן בעצמכם. בניהול אישי היא <Ruled id="IRA-11">מהנכסים המותרים</Ruled>.</>,
              line: (
                <Sentence as="span">
                  בקרן <Term id="קרן נאמנות פטורה">פטורה</Term> משלמים <Term id="מס רווחי הון">מס רווחי הון</Term> של עד {rate ? <Num value={rate} /> : null} <Term prefix="מ" id="הרווח הריאלי">הרווח הריאלי</Term> <Term prefix="ב" id="מכירה">מכירה</Term>, והוא <Ruled id="TXS-13">מנוכה במקור</Ruled>. <Ruled id="TXS-21">החלפה לקרן אחרת היא מכירה</Ruled>.
                </Sentence>
              ),
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
                  יש מסלולים ״<Term id="עוקב מדדי מניות">עוקב מדדי מניות</Term>״, אבל מסלול כזה לא עוקב אחרי ת״א-125 לבד, והוא לא מופיע כאן.
                </>
              ),
              line: (
                <>
                  לפי רשימת <Term id="מסלול השקעה">מסלולי ההשקעה</Term> של <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון</Term>, מסלול כזה עוקב אחרי שלושה <Term id="מדד מניות">מדדי מניות</Term> לפחות, <Ruled id="CAT-49">אף אחד מהם לא מעל חצי מהנכסים</Ruled>, והרשימה לא נותנת שם לאף מדד.
                </>
              ),
            },
          ]}
        />
        <p className="max-w-measure">
          <Term id="רשות ניירות ערך">רשות ניירות ערך</Term> <Ruled id="ETF-17">מפרסמת ממוצע שנתי של דמי הניהול</Ruled> של קרנות סל על מניות בארץ. הוא מופיע בקישור שבכרטיס הכלל. <Ruled id="ETF-13">כל קרן קובעת לעצמה את דמי הניהול</Ruled>, ויש גם <Term id="דמי ניהול משתנים">דמי ניהול משתנים</Term> <Term prefix="ו" id="הפרש עקיבה">הפרש עקיבה</Term>.
        </p>
      </>
    );
  },
  risks: ({ figure }) => {
    const minOrder = figure("ETF-67", "min_order_equity_market");
    return (
    <>
      <p className="max-w-measure">
        השווי עולה ויורד עם מניות החברות שבמדד. מחיר קרן סל בבורסה במהלך היום <Ruled id="ETF-06">יכול להיות שונה משווי הנכסים שלה</Ruled>, אף שיש <Term id="עושה שוק">עושה שוק</Term>.
      </p>
      <p className="max-w-measure">
        קרן יכולה <Ruled id="ETF-21">להתפרק בהודעה מראש</Ruled>, ומנהל רשאי להעלות <Term id="דמי ניהול">דמי ניהול</Term>. מנהל שהתחייב לכך <Term prefix="ב" id="תשקיף">תשקיף</Term> שלו <Ruled id="MF-17">מעלה רק בתחילת שנה</Ruled>. הרכב המדד <Ruled id="ETF-35">משתנה בכל עדכון</Ruled>.
      </p>
      <Sentence measure>
        <Ruled id="ETF-67">יחידת המסחר בקרן סל</Ruled> היא <Term id="יחידה">יחידה</Term> אחת. בשלב המסחר הרציף, פקודה בקרן על מדד מניות צריכה להיות בשווי של {minOrder ? <Num value={minOrder} /> : null} לפחות.
      </Sentence>
    </>
    );
  },
  termIds: ["ת\"א-125", "ת\"א-35", "ת\"א-90", "עוקב מדדי מניות", "דיבידנד", "קרן סל", "קרן מחקה פתוחה", "מספר בורסה", "דמי ניהול משתנים", "הפרש עקיבה", "דמי ניהול קבועים", "פרופיל חשיפה", "קרן נאמנות פטורה", "מס רווחי הון", "יחידה", "דמי ניהול", "עושה שוק", "מדד מניות", "רשות שוק ההון ביטוח וחיסכון", "מסלול השקעה", "קופת גמל", "הרווח הריאלי", "קופת גמל בניהול אישי", "חשבון ניירות ערך", "רשות ניירות ערך", "קרן חוץ", "קרן נאמנות", "בורסה", "מכירה", "תשקיף"],
};
