// Guide prose for תוכנית חיסכון (architecture 3.5: prose lives in content files; every figure is a Num).
// Written from the il-finance rules (BANK, BPN, TXI, REG, MF); the words that state a rule open it (Ruled, D116), and a figure from a rule
// opens it from its sheet. Same shape and register as kupat-gemel-lehashkaa.tsx. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import { YearOf } from "./year";
import { IdRef, Num, Ruled, Term, VariesByCompany } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";
import { GuidePart } from "../../components/guide/sections";

export const content: GuideContent = {
  what: () => (
    <>
      <p className="max-w-measure">
        <Term id="תוכנית חיסכון">תוכנית חיסכון</Term> היא <Term id="פיקדון">פיקדון</Term> לתקופה מוסכמת <Ruled id="BANK-28">שמפקידים אליו מדי פעם</Ruled>, למשל <Term prefix="ב" id="פיקדון בהוראת קבע">הוראת קבע</Term>.
      </p>
      <p className="max-w-measure">
        היא מתאימה לחיסכון למטרה עם תאריך, שבונים כל חודש מהמשכורת. <Term prefix="ה" id="ריבית">ריבית</Term> <Ruled id="BANK-25">ידועה מראש, או זזה לאורך התקופה</Ruled>. את הכסף מקבלים בסוף התקופה, ו<Ruled id="BANK-28">אם אפשר לקבל אותו קודם, ובאיזה מחיר, נקבע בהסכם של כל תוכנית</Ruled>.
      </p>
      <GuidePart title="מה ההסכם קובע">
        <p className="max-w-measure">
          ההסכם <Ruled id={["BANK-28", "BANK-25"]}>חייב לקבוע</Ruled> את לוח ההפקדות, את הגבולות על הסכומים והמועדים ואת הריבית. כל בנק בונה תוכניות חיסכון אחרת.
        </p>
      </GuidePart>
      <GuidePart title="איך הריבית נקבעת">
        <p className="max-w-measure">
          הריבית יכולה להיות <Term id="ריבית קבועה">קבועה</Term> או <Term id="ריבית משתנה">משתנה</Term>. ריבית משתנה היא <Term id="ריבית עוגן">ריבית עוגן</Term> ועוד או פחות <Term id="מרווח">מרווח</Term> ידוע מראש. הריבית <Ruled id="BANK-26">לא צמודה</Ruled> או <Term id="צמוד למדד המחירים לצרכן">צמודה למדד</Term>.
        </p>
        {/* D30: the anchor (BANK-34) is each bank's own term; the guide names no bank's as the product's */}
        <p className="max-w-measure">
          <VariesByCompany ids={[{ rule: "BANK-34", companies: ["leumi", "hapoalim", "discount", "mercantile", "mizrahi-tefahot", "fibi", "massad", "yahav", "jerusalem"] }]} lead={<>העוגן הוא בדרך כלל <Term id="ריבית הפריים">ריבית הפריים</Term>, ולכל בנק <Ruled id="BANK-46">פריים משלו</Ruled></>} end="." />
        </p>
      </GuidePart>
      <GuidePart title="מתי אפשר למשוך">
        <p className="max-w-measure">
          <Term id="תחנת יציאה">תחנת יציאה</Term> היא מועד באמצע התקופה <Ruled id="BANK-27">שבו אפשר למשוך בלי לשבור את התוכנית</Ruled>. אם יש תחנות, ממתי הן נספרות ומה מושכים בהן <Ruled id="BANK-27">נקבע בהסכם של כל תוכנית</Ruled>.
        </p>
        {/* D30: the exit points (BPN-10) are each bank's own terms */}
        <div className="max-w-measure">
          <VariesByCompany ids={["BPN-10"]} lead="תחנות היציאה תלויות בבנק" />
        </div>
      </GuidePart>
    </>
  ),
  who: () => (
    <>
      <p className="max-w-measure">
        בנקים, <Ruled id="REG-01" prefix="ב">פיקוח</Ruled> <Term id="המפקח על הבנקים">המפקח על הבנקים</Term>. בנק <Ruled id="BANK-01">לא יכול לסרב לקבל פיקדון</Ruled> בלי סיבה סבירה.
      </p>
    </>
  ),
  termIds: ["תוכנית חיסכון", "פיקדון בהוראת קבע", "ריבית משתנה", "ריבית הפריים", "צמוד למדד המחירים לצרכן", "תחנת יציאה", "שבירת פיקדון", "פטור למעוט הכנסה", "תיאום מס", "מנהל מורשה", "ביטוח פיקדונות", "דיבידנד", "רווח הון", "נייר ערך", "המפקח על הבנקים", "ריבית בנק ישראל", "קרנות כספיות יומיות", "מרווח", "ריבית עוגן", "ריבית קבועה", "ריבית", "פיקדון", "רשות ניירות ערך", "חשבון עובר ושב"],
  afterTax: ({ figure }) => {
    const ceiling = figure("TXI-20", "favoured_ceiling");
    const deduction = figure("TXI-20", "deduction");
    return (
      <>
        <Sentence measure>
          למי שההכנסה שלו ושל בן או בת הזוג {ceiling ? <>עד <Num value={ceiling} /> </> : "נמוכה "}בשנה יש <Term id="פטור למעוט הכנסה">פטור למעוט הכנסה</Term>{deduction ? <>: עד <Num value={deduction} /> בשנה</> : null} מהריבית על פיקדונות ותוכניות חיסכון<YearOf v={ceiling ?? deduction} plural />. מעל התקרה הפטור <Ruled id="TXI-20">הולך וקטן</Ruled>. בדוח השנתי הוא מחושב אוטומטית, ובמהלך השנה מקבלים אותו <Term prefix="ב" id="תיאום מס">תיאום מס</Term>.
        </Sentence>
        <Sentence measure>
          הפסד ממכירת <Term id="נייר ערך">ניירות ערך</Term> <Ruled id="TXI-17">לא מתקזז מריבית על תוכנית חיסכון</Ruled>. הוא מתקזז <Term prefix="מ" id="רווח הון">רווח הון</Term>, ובאותה שנה גם מריבית או <Term id="דיבידנד">דיבידנד</Term> על ניירות ערך. תוכנית חיסכון היא לא נייר ערך.
        </Sentence>
        <Callout tone="blocked" className="max-w-measure">
          <span className="font-medium"><Term id="שבירת פיקדון">שבירה</Term> של תוכנית חיסכון: האתר לא מחשב אותה.</span> מחיר השבירה, ואם לכל הפקדה יש נעילה משלה, <Ruled id={["BANK-28", "BANK-06"]}>נקבעים בהסכם של כל בנק</Ruled>. התנאים האלה לא נאספו לכל הבנקים. הבנק <Ruled id="TXI-07">מנכה מס מהריבית שהוא משלם בפועל</Ruled>. אבל אף מקור לא אומר מה קורה במס כשהשבירה פוגעת גם בקרן. שאלות פתוחות: <IdRef id="BANK OQ12" end="," /> <IdRef id="TXI OQ14" end="." />
        </Callout>
      </>
    );
  },
  risks: ({ figure }) => {
    const months = figure("REG-04", "examination_deadline_months");
    const lapsed = figure("REG-05", "new_knesset_convened");
    return (
      <>
        <p className="max-w-measure">
          <Ruled id="BANK-23">אין בישראל חוק שמקים</Ruled> <Term id="ביטוח פיקדונות">ביטוח פיקדונות</Term> או ערבות של המדינה לפיקדונות בבנקים. אם בנק קורס, נגיד <Term id="בנק ישראל">בנק ישראל</Term> יכול למנות לו <Term id="מנהל מורשה">מנהל מורשה</Term>. באישור הממשלה הנגיד יכול גם <Ruled id="REG-06">להכריז על ערבות לפיקדונות</Ruled>. המנהל המורשה יכול, באישור הנגיד, להעביר את נכסי הבנק והתחייבויותיו. אלה סמכויות שלהם, לא זכויות שלכם.
        </p>
        <Sentence measure>
          חוק משנת 2026 <Ruled id="REG-04">מחייב את שר האוצר ואת הנגיד לבחון</Ruled> {months ? <>תוך <Num value={months} /> חודשים </> : null}אם צריך ביטוח פיקדונות. זו חובת בדיקה, לא ביטוח. הצעת חוק פרטית לביטוח פיקדונות <Ruled id="REG-05">פקעה</Ruled> כשהכנסת החדשה התכנסה{lapsed ? <> <Num value={lapsed} prefix="ב־" /></> : null}.
        </Sentence>
        <p className="max-w-measure">תוכנית בריבית משתנה <Ruled id="BANK-25">זזה עם ריבית העוגן שלה</Ruled> לאורך כל השנים. תוכנית לא צמודה לא מגינה מפני עליית מחירים.</p>
      </>
    );
  },
  use: () => (
    <>
      <p className="max-w-measure">
        חיסכון למטרה עם תאריך, שבונים מהמשכורת כל חודש.
      </p>
      <p className="max-w-measure">
        מול <Term id="קרנות כספיות יומיות">קרן כספית יומית</Term>, בתוכנית בריבית קבועה הריבית <Ruled id="BANK-25">ידועה מראש</Ruled> לכל התקופה. בקרן היומית, לפי <Term id="רשות ניירות ערך">רשות ניירות ערך</Term>, <Term prefix="ה" id="תשואה">תשואה</Term> <Ruled id="MF-34">עוקבת אחרי</Ruled> <Term id="ריבית בנק ישראל">ריבית בנק ישראל</Term>, פחות העלויות.
      </p>
    </>
  ),
};
