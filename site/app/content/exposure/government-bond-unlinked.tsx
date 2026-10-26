// Exposure prose for אג"ח ממשלתית לא צמודה (flows 6.6). Written 2026-10-23 from the rule base (GOV, TXI, TXS,
// BRK, CAT, IRA, MF); each block ends with the rules it rests on. NEW copy for the founder to review.
import type { ExposureContent } from "../guide/types";
import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Sentence } from "../../components/kit";

export const content: ExposureContent = {
  what: ({ figure }) => {
    const couponRate = figure("TXI-15", "rate");
    const floating = figure("GOV-14", "coupon_every_months");
    return (
      <>
        <p className="max-w-measure">
          הכסף מולווה למדינה בשקלים, לשנים, בלי הצמדה למדד: <Term id="איגרות חוב ממשלתיות">איגרת חוב ממשלתית</Term> שמשלמת <Term id="קופון">קופון</Term> <Term prefix="ב" id="אג&quot;ח בריבית קבועה">ריבית קבועה</Term> שנקבעה בהנפקה, או <Term prefix="ב" id="אג&quot;ח בריבית משתנה">ריבית משתנה</Term> שמתעדכנת לפי תשואת המק״מ. בסוף התקופה המדינה מחזירה את <Term prefix="ה" id="שווי נקוב">שווי הנקוב</Term> מהכנסותיה הכלליות. הסדרות מונפקות במכרזים שבועיים של משרד האוצר, ואיגרות החוב הקצרות, לשנה לכל היותר, נמכרות בניכיון בלי ריבית.
        </p>
        <Sentence measure>
          על הקופון משלמים {couponRate ? <Num value={couponRate} /> : null} מכל הריבית, והמס מנוכה בתשלום; ריבית משתנה לא משנה את השיעור, כי המבחן הוא אם הקרן צמודה למדד. בסדרה בריבית משתנה הריבית מתעדכנת כל {floating ? <Num value={floating} /> : null} חודשים ואינה יורדת מאפס.
        </Sentence>
        <RulesLine ids={["GOV-02", "GOV-08", "GOV-09", "GOV-13", "GOV-14", "GOV-15", "TXI-03", "TXI-09", "TXI-15"]} />
      </>
    );
  },
  holdNote: () => (
    <>
      <p className="max-w-measure">
        קונים ומחזיקים בחשבון ניירות ערך בבנק או בבית השקעות, ישירות או בניהול אישי; קרן כספית רשאית להחזיק איגרות חוב ממשלתיות לא צמודות עם פחות משנה לפדיון. בקופת גמל להשקעה ובקרן השתלמות יש מסלולים מתמחים באג"ח ממשלתי, ומסלול "כספי (שקלי)", שלפי רשימת מסלולי ההשקעה של רשות שוק ההון מחזיק גם מלוות ממשלה בשקלים. מכירה לפני הפדיון נעשית בבורסה, במחיר השוק של אותו יום.
      </p>
      <RulesLine ids={["GOV-10", "GOV-17", "GOV-21", "BRK-16", "MF-29", "CAT-10", "CAT-17", "CAT-18", "CAT-23", "IRA-11"]} />
    </>
  ),
  risks: ({ figure }) => {
    const saleRate = figure("TXI-12", "rate");
    const months = figure("GOV-14", "coupon_every_months");
    return (
      <>
        <Sentence measure>
          מי שמחזיק עד הפדיון מקבל את הקופונים ואת השווי הנקוב כפי שנקבעו. מי שמוכר קודם מקבל את מחיר השוק, שיורד כשהריבית במשק עולה, ויותר ככל שנותרו יותר שנים לפדיון; הרווח ממכירה הוא <Term id="רווח הון ריאלי">רווח הון</Term> במס של עד {saleRate ? <Num value={saleRate} /> : null} מכל הרווח, בלי הפחתת המדד, והפסד מקזז רווחים וריבית מניירות ערך באותה שנה. כשהמחירים עולים יותר מהקופון, כוח הקנייה נשחק, כי אין הצמדה.
        </Sentence>
        <p className="max-w-measure">
          הסדרות בריבית משתנה שמונפקות היום הן מסוג "אג״ח ממשלתית בריבית משתנה": הריבית נקבעת לכל תקופת ריבית של {months ? <><Num value={months} /> חודשים</> : null} לפי ממוצע התשואות של סדרת המק״ם הקרובה ביותר לשנה לפדיון, ובתקנות שלהן אין מרווח ואין רצפה <RuleRef id="GOV-14" />. מה לא מתועד עדיין: שהסדרות בריבית קבועה שנמכרות היום מונפקות לפי התקנות של "אג״ח ממשלתית" (<IdRef id="GOV OQ4" />); איך הבנק מטפל בריבית הצבורה כשקונים בין מועדי קופון (<IdRef id="TXI OQ5" />); וטקסט רשמי על סיכון המחיר לפני הפדיון (<IdRef id="GOV OQ9" />).
        </p>
        <RulesLine ids={["GOV-14", "GOV-16", "GOV-17", "TXI-12", "TXI-13", "TXI-16", "TXI-17", "TXS-03"]} />
      </>
    );
  },
  termIds: ["איגרות חוב ממשלתיות", "קופון", "אג\"ח בריבית קבועה", "אג\"ח בריבית משתנה", "שווי נקוב", "רווח הון ריאלי", "לא צמוד", "שחר", "גילון חדש", "אג\"ח ממשלתית קצרה", "אג\"ח סחיר", "פדיון מוקדם"],
};
