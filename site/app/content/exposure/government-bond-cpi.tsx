// Exposure prose for אג"ח ממשלתית צמודה (flows 6.6). Written 2026-10-23 from the rule base (GOV, TXI, TXS,
// BRK, CAT, IRA); each block ends with the rules it rests on. NEW copy for the founder to review.
import type { ExposureContent } from "../guide/types";
import { Num, RulesLine, Term } from "../../components/provenance";

const OQ = ({ id }: { id: string }) => (
  <bdi dir="ltr" className="whitespace-nowrap">
    {id}
  </bdi>
);

export const content: ExposureContent = {
  what: ({ figure }) => {
    const face = figure("GOV-11", "face_value");
    const every = figure("GOV-11", "coupon_every_months");
    const rate = figure("TXI-14", "rate");
    return (
      <>
        <p className="max-w-measure">
          הכסף מולווה למדינה בשקלים, לשנה לפחות, כשהקרן והריבית <Term id="צמוד למדד המחירים לצרכן">צמודות למדד המחירים לצרכן</Term>: <Term id="אג&quot;ח ממשלתית צמודה">איגרת חוב ממשלתית צמודה</Term> נמכרת ביחידות של {face ? <Num value={face} /> : null} <Term id="שווי נקוב">שווי נקוב</Term>, משלמת <Term id="קופון">קופון</Term> קבוע פעם ב{every ? <Num value={every} /> : null} חודשים, ובסוף התקופה מחזירה את הקרן בתשלום אחד, מוגדלת או מוקטנת לפי השינוי במדד מאז <Term id="מדד הבסיס">מדד הבסיס</Term>.
        </p>
        <p className="max-w-measure">
          מי שמחזיק עד הפדיון שומר על כוח הקנייה של הכסף ועוד הריבית הריאלית. <Term prefix="ה" id="הפרשי הצמדה">הצמדה</Term> פטורה ממס; על הריבית שמעליה משלמים עד {rate ? <Num value={rate} /> : null}, והמס מנוכה בתשלום הקופון. את הקופון מקבל מי שרשום כמחזיק <Term prefix="ב" id="מועד קובע לזכאות">מועד הקובע</Term>; מי שקונה אחריו מפסיד את הקופון הקרוב.
        </p>
        <RulesLine ids={["GOV-02", "GOV-08", "GOV-11", "GOV-12", "TXI-02", "TXI-05", "TXI-09", "TXI-14"]} />
      </>
    );
  },
  holdNote: () => (
    <>
      <p className="max-w-measure">
        קונים ומחזיקים בחשבון ניירות ערך בבנק או בבית השקעות, ישירות או בניהול אישי. בקופת גמל להשקעה ובקרן השתלמות יש מסלולים שמתמחים באג"ח צמוד מדד ובאג"ח ממשלתי. קרן כספית אינה רשאית להחזיק איגרות חוב צמודות למדד.
      </p>
      <RulesLine ids={["GOV-10", "GOV-17", "GOV-21", "BRK-16", "CAT-10", "CAT-17", "CAT-18", "IRA-11"]} />
    </>
  ),
  risks: ({ figure }) => {
    const saleRate = figure("TXS-01", "rate");
    return (
      <>
        <p className="max-w-measure">
          מי שמוכר לפני הפדיון מקבל את מחיר השוק של אותו יום, שיורד כשהריבית הריאלית במשק עולה, ויותר ככל שנותרו יותר שנים; הרווח ממכירה הוא <Term id="רווח הון ריאלי">רווח הון ריאלי</Term> במס של עד {saleRate ? <Num value={saleRate} /> : null}, אחרי הפחתת החלק שנבע מעליית המדד. כשהמדד יורד, התקנות מקטינות את הקרן ואת הקופון, בלי רצפה; הריבית עדיין ממוסה במלואה, וההפסד מההצמדה השלילית אינו מתקזז.
        </p>
        <p className="max-w-measure">
          מה לא מתועד עדיין: האם לסדרה מסוימת יש רצפה בירידת מדד (<OQ id="GOV OQ6" />); איך מטפלים במס בירידת מדד במכירה (<OQ id="TXS OQ15" />); ואיך הבנק מטפל בריבית הצבורה כשקונים בין מועדי קופון (<OQ id="TXI OQ5" />).
        </p>
        <RulesLine ids={["GOV-12", "GOV-16", "GOV-17", "TXS-01", "TXS-02", "TXI-14", "TXI-25", "TXI-16", "TXI-17"]} />
      </>
    );
  },
  termIds: ["צמוד למדד המחירים לצרכן", "אג\"ח ממשלתית צמודה", "שווי נקוב", "קופון", "מדד הבסיס", "הפרשי הצמדה", "מועד קובע לזכאות", "רווח הון ריאלי", "גליל", "מדד", "אג\"ח סחיר"],
};
