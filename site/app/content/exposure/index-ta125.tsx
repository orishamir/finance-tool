// Exposure prose for מדד ת"א-125 (flows 6.6). Written 2026-10-23 from the rule base (ETF-33 to ETF-36 added
// the same day from TASE's own pages, ETF-41 and ETF-42 from TASE's index page and the part-seven guidelines;
// ETF, TXS, MF, BRK, IRA). Each block ends with the rules it rests on. NEW copy for the founder to review.
import type { ExposureContent } from "../guide/types";
import { Num, RulesLine, Term } from "../../components/provenance";

const OQ = ({ id }: { id: string }) => (
  <bdi dir="ltr" className="whitespace-nowrap">
    {id}
  </bdi>
);

export const content: ExposureContent = {
  what: ({ figure }) => {
    const n = figure("ETF-33", "constituents");
    const updates = figure("ETF-35", "composition_updates_per_year");
    const cap = figure("ETF-41", "weight_cap");
    const ceiling = figure("ETF-41", "weight_cap_ceiling");
    const entry35 = figure("ETF-41", "ta35_entry_rank");
    const exit35 = figure("ETF-41", "ta35_exit_rank");
    const entry90 = figure("ETF-41", "ta90_entry_rank");
    const exit90 = figure("ETF-41", "ta90_exit_rank");
    return (
      <>
        <p className="max-w-measure">
          הכסף מושקע, דרך קרן, במניות של {n ? <Num value={n} /> : null} החברות בעלות השווי הגבוה ביותר בבורסה בתל אביב, בשקלים. הבורסה מתארת את <Term id="ת&quot;א 125">ת"א-125</Term> כמדד הייחוס החשוב ביותר שלה, שמשקף את הכלכלה הישראלית וכולל את מניות ת"א-35 ות"א-90.
        </p>
        <p className="max-w-measure">
          המניות נבחרות ממאגר "רימון", כ-250 מניות שעומדות בתנאי שווי שוק, סחירות וזיקה לישראל, והרכב המדד מתעדכן {updates ? <Num value={updates} /> : null} פעמים בשנה, בתחילת מאי ונובמבר. משקל כל מניה נקבע לפי שווי החזקות הציבור, עם מדרגת נזילות ותקרת משקל: ועדת המדדים קבעה תקרה של {cap ? <Num value={cap} /> : null} למניה אחת, מתוך גבול של {ceiling ? <Num value={ceiling} /> : null} שהנחיות הבורסה מתירות. המדד מחושב בזמן אמת כל 15 שניות.
        </p>
        <p className="max-w-measure">
          לפי הנחיות הבורסה, המדד הוא פשוט מניות ת"א-35 ות"א-90 יחד, ומתעדכן איתם. בכל אחד מהם המניות מדורגות לפי שווי שוק ממוצע: לת"א-35 מניה נכנסת בדירוג {entry35 ? <Num value={entry35} /> : null} או גבוה ממנו ויוצאת בדירוג {exit35 ? <Num value={exit35} /> : null} או נמוך ממנו, ולת"א-90 נכנסת בדירוג {entry90 ? <Num value={entry90} /> : null} ויוצאת בדירוג {exit90 ? <Num value={exit90} /> : null}, כך שלא מחליפים מניה על כל שינוי קטן. המדד מחושב כתשואה כוללת ברוטו: <Term id="דיבידנד">דיבידנד</Term> נספר במדד ביום האקס בלי להוריד מס, ולכן קרן שעוקבת אחריו נמדדת מול מדד שלפני מס.
        </p>
        <p className="max-w-measure">
          מחזיקים את המדד דרך <Term id="קרן סל">קרן סל</Term> או <Term id="קרן מחקה פתוחה">קרן מחקה</Term> ישראלית, שהן קרנות נאמנות בשקלים עם <Term id="מספר בורסה">מספר בורסה</Term>; קרן חוץ אינה רשאית להתמחות בישראל, ולכן מדד ישראלי מגיעים אליו רק דרך קרן ישראלית. קרן על מדד מקומי קונה בדרך כלל את המניות עצמן. רשות ניירות ערך מפרסמת ממוצע שנתי של דמי הניהול של קרנות סל על מניות בארץ; הוא מופיע בקישור שבכרטיס הכלל. כל קרן קובעת לעצמה, בתוספת <Term id="דמי ניהול משתנים">דמי ניהול משתנים</Term> <Term prefix="ו" id="הפרש עקיבה">הפרש עקיבה</Term>.
        </p>
        <RulesLine ids={["ETF-33", "ETF-34", "ETF-35", "ETF-36", "ETF-41", "ETF-42", "ETF-01", "ETF-20", "ETF-31", "ETF-11", "ETF-13", "ETF-14", "ETF-17", "MF-45"]} />
      </>
    );
  },
  holdNote: ({ figure }) => {
    const rate = figure("TXS-09", "rate");
    return (
      <>
        <p className="max-w-measure">
          בחשבון ניירות ערך ובניהול אישי קונים את הקרן בעצמכם, ומשלמים {rate ? <Num value={rate} /> : null} מהרווח הריאלי במכירה, מנוכה במקור; החלפה לקרן אחרת היא מכירה. בקופות הגמל ובקרנות ההשתלמות יש מסלולים "עוקבי מדדי מניות", אבל שום מקור שנקרא לא אומר שמסלול כזה עוקב דווקא אחרי ת"א-125, ולכן הם לא מופיעים כאן. שאלה פתוחה: <OQ id="CAT OQ9" />.
        </p>
        <RulesLine ids={["TXS-09", "TXS-13", "TXS-21", "IRA-11", "CAT-10", "BRK-16"]} />
      </>
    );
  },
  risks: () => (
    <>
      <p className="max-w-measure">
        השווי עולה ויורד עם מניות החברות שבמדד. מחיר קרן סל בבורסה במהלך היום יכול להיות שונה משווי הנכסים שלה, אף שיש עושה שוק; קרן יכולה להתפרק בהודעה מראש, ומנהל רשאי להעלות דמי ניהול בתחילת שנה. הרכב המדד משתנה בכל עדכון, וקרן שעוקבת אחריו קונה ומוכרת מניות בהתאם.
      </p>
      <p className="max-w-measure">
        לא מתועד עדיין: חובות עושי השוק לגבי מרווח וגודל (<OQ id="ETF OQ2" />) וגודל עסקה מינימלי ביחידות קרן סל (<OQ id="ETF OQ12" />).
      </p>
      <RulesLine ids={["ETF-06", "ETF-04", "ETF-21", "ETF-14", "ETF-35", "TXS-16"]} />
    </>
  ),
  termIds: ["ת\"א 125", "דיבידנד", "קרן סל", "קרן מחקה פתוחה", "מספר בורסה", "דמי ניהול משתנים", "הפרש עקיבה", "דמי ניהול קבועים", "פרופיל חשיפה", "קרן נאמנות פטורה", "מס רווחי הון", "יחידה"],
};
