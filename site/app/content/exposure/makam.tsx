// Exposure prose for מק״מ (flows 6.6). Written 2026-10-23 from the rule base (GOV, TXI, BANK, BRK, MF, IRA);
// each block ends with the rules it rests on. NEW copy for the founder to review.
import { Link } from "react-router";
import type { ExposureContent } from "../guide/types";
import { Num, RulesLine, Term } from "../../components/provenance";

const OQ = ({ id }: { id: string }) => (
  <bdi dir="ltr" className="whitespace-nowrap">
    {id}
  </bdi>
);

export const content: ExposureContent = {
  what: ({ figure }) => {
    const series = figure("GOV-22", "series_outstanding");
    const rate = figure("TXI-11", "rate");
    return (
      <>
        {/* audit A43: the two מק״מ pages say what each is and point at the other */}
        <p className="max-w-measure text-sm text-muted-foreground">
          זה העמוד על מה שהכסף מושקע בו. לקנייה ישירה של מק״מ, לעלויות ולמס של המוצר, ראו <Link to="/guide/makam" className="text-link hover:underline">מק״מ כמוצר: איפה הכסף מוחזק</Link>.
        </p>
        <p className="max-w-measure">
          הכסף מולווה למדינה לתקופה של עד שנה: <Term id="מק&quot;מ">מק״מ</Term> הוא מילווה קצר מועד שבנק ישראל מוכר לציבור במכרז חודשי, ואחר כך נסחר בבורסה. הוא לא משלם ריבית ולא צמוד למדד: קונים אותו במחיר נמוך <Term prefix="מה" id="שווי נקוב">שווי הנקוב</Term>, ובמועד <Term prefix="ה" id="פדיון">פדיון</Term> המדינה משלמת את השווי הנקוב במלואו מהכנסותיה הכלליות.
        </p>
        <p className="max-w-measure">
          בכל רגע יש {series ? <Num value={series} /> : null} סדרות בשוק, ובכל חודש אחת נפדית ואחת חדשה מונפקת. <Term prefix="ה" id="תשואה לפדיון">תשואה לפדיון</Term> ידועה ביום הקנייה למי שמחזיק עד הסוף, והבנק מציג אותה <Term id="תשואה ברוטו">ברוטו</Term>, לפני עמלות ומס. ההפרש בין מחיר הקנייה לשווי הנקוב נחשב במס <Term id="דמי ניכיון">דמי ניכיון</Term>, כלומר ריבית, ומשלמים עליו {rate ? <Num value={rate} /> : null} בפדיון.
        </p>
        <RulesLine ids={["GOV-01", "GOV-02", "GOV-03", "GOV-22", "GOV-23", "GOV-20", "TXI-01", "TXI-11", "TXI-09"]} />
      </>
    );
  },
  holdNote: ({ figure }) => {
    const share = figure("GOV-17", "tase_share_of_turnover");
    return (
      <>
        <p className="max-w-measure">
          מחזיקים מק״מ בחשבון ניירות ערך בבנק או בבית השקעות, ישירות או בתוך ניהול אישי; קרן כספית רשאית להחזיק מק״מ, ולכן מי שקונה קרן כספית חשוף אליו בעקיפין. בנק אסור לו לגבות <Term id="דמי ניהול פיקדון ניירות ערך">דמי ניהול פיקדון ניירות ערך</Term> על מק״מ, ועמלות הקנייה והמכירה הן שורה נפרדת בתעריפון. רוב המסחר באיגרות חוב ממשלתיות, {share ? <Num value={share} /> : null} ממנו, נעשה בבורסה.
        </p>
        <RulesLine ids={["GOV-21", "GOV-17", "BRK-17", "BANK-18", "BANK-15", "MF-29", "IRA-11"]} />
      </>
    );
  },
  risks: ({ figure }) => {
    const saleRate = figure("TXI-12", "rate");
    return (
      <>
        <p className="max-w-measure">
          מי שמחזיק עד הפדיון יודע מראש כמה יקבל, ובנק ישראל מתאר את המק״מ כהשקעה חסרת סיכון. מי שמוכר לפני כן מקבל את מחיר השוק של אותו יום, שיכול להיות נמוך ממחיר הקנייה כשהריבית במשק עולה; הרווח ממכירה כזאת הוא <Term id="רווח הון ריאלי">רווח הון</Term> במס של עד {saleRate ? <Num value={saleRate} /> : null} מכל הרווח, בלי הפחתה של המדד. בשנה שבה המחירים עולים יותר מהתשואה, כוח הקנייה נשחק.
        </p>
        <p className="max-w-measure">
          שתי שאלות פתוחות נוגעות לכם ישירות: איך הזמנה של אדם פרטי מגיעה למכרז ההנפקה ובאיזו עמלה (<OQ id="GOV OQ2" />), ושורה אחת במדריך רשות המסים שמדברת על מס של 20% על דמי הניכיון, בניגוד לחוק; האתר מחשב לפי החוק ומסמן את הסתירה (<OQ id="TXI OQ3" />).
        </p>
        <RulesLine ids={["GOV-22", "GOV-17", "TXI-12", "TXI-13", "GOV-05", "TXI-11"]} />
      </>
    );
  },
  termIds: ["מק\"מ", "שווי נקוב", "פדיון", "תשואה לפדיון", "תשואה ברוטו", "דמי ניכיון", "דמי ניהול פיקדון ניירות ערך", "רווח הון ריאלי", "אג\"ח סחיר", "מוצרי שוק הכסף"],
};
