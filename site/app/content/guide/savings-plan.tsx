// Guide prose for תכנית חיסכון (architecture 3.5: prose lives in content files; every figure is a Num).
// Written 2026-10-23 from the il-finance rules cited under each block (BANK, BPN, TXI, REG, SW, MF); same
// shape and register as kupat-gemel-lehashkaa.tsx. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import { IdRef, Num, RuleRef, RulesLine, Term, VariesByCompany } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";

export const content: GuideContent = {
  what: () => (
    <>
      <p className="max-w-measure">
        <Term id="תכנית חיסכון">תוכנית חיסכון</Term> היא פיקדון שמפקידים אליו מדי פעם, לרוב סכום קבוע כל חודש <Term prefix="ב" id="פיקדון בהוראת קבע">הוראת קבע</Term>, לתקופה של יותר משנה.
      </p>
      <p className="max-w-measure">
        ההסכם חייב לקבוע את לוח ההפקדות, את הגבולות על הסכומים והמועדים ואת הריבית. הריבית קבועה או <Term id="ריבית משתנה">משתנה</Term>, כלומר ריבית עוגן ועוד או פחות מרווח ידוע מראש, והיא לא צמודה או <Term id="צמוד למדד המחירים לצרכן">צמודה למדד</Term>.
      </p>
      <p className="max-w-measure">
        לבנק ישראל אין הוראה מיוחדת לתוכניות חיסכון, וכל בנק בונה אותן אחרת. גם <Term id="תחנת יציאה">תחנות היציאה</Term>, ממתי הן נספרות ומה מושכים בהן, נקבעות בהסכם של כל תוכנית.
      </p>
      {/* D30: the anchor (BANK-34) and the exit points (BPN-10) are each bank's own terms; the guide names no bank's as the product's */}
      <div className="max-w-measure flex flex-col gap-1">
        <VariesByCompany ids={[{ rule: "BANK-34", companies: ["leumi", "hapoalim", "discount", "mercantile", "mizrahi-tefahot", "fibi", "massad", "yahav", "jerusalem"] }]} lead="העוגן הוא בדרך כלל ריבית הפריים, וכל בנק קובע אותה בעצמו" />
        <VariesByCompany ids={["BPN-10"]} lead="תחנות היציאה תלויות בבנק" />
      </div>
      <RulesLine ids={["BANK-28", "BANK-27", "BANK-25", "BANK-46", "BANK-26"]} />
    </>
  ),
  who: () => (
    <>
      <p className="max-w-measure">
        כל הבנקים שברשימת בנק ישראל, בפיקוח המפקח על הבנקים. בנק לא יכול לסרב לקבל פיקדון בלי סיבה סבירה. ההפקדות עוברות לתוכנית מהעו״ש, לרוב בהוראת קבע חודשית.
      </p>
      <RulesLine ids={["REG-01", "REG-03", "BANK-01", "BANK-28"]} />
    </>
  ),
  termIds: ["תכנית חיסכון", "פיקדון בהוראת קבע", "ריבית משתנה", "ריבית הפריים", "צמוד למדד המחירים לצרכן", "תחנת יציאה", "שבירת פיקדון", "פטור למעוט הכנסה"],
  afterTax: ({ figure }) => {
    const ceiling = figure("TXI-20", "favoured_ceiling");
    const deduction = figure("TXI-20", "deduction");
    return (
      <>
        <Sentence measure>
          למי שההכנסה שלו ושל בן או בת הזוג {ceiling ? <>עד <Num value={ceiling} /> </> : "נמוכה "}בשנה יש <Term id="פטור למעוט הכנסה">פטור למעוט הכנסה</Term>{deduction ? <>: עד <Num value={deduction} /> בשנה</> : null} מהריבית על פיקדונות ותוכניות חיסכון. מעל התקרה הפטור הולך וקטן. בדוח השנתי הוא מחושב אוטומטית, ובמהלך השנה מקבלים אותו בתיאום מס.
        </Sentence>
        <RulesLine ids={["TXI-20"]} />
        <Sentence measure>
          הפסד ממכירת ניירות ערך לא מתקזז מריבית על תוכנית חיסכון. הוא מתקזז מרווח הון, ובאותה שנה גם מריבית או דיבידנד על ניירות ערך, ותוכנית חיסכון היא לא נייר ערך <RuleRef id="TXI-17" />.
        </Sentence>
        <RulesLine ids={["TXI-17"]} />
        <Callout tone="blocked" className="max-w-measure">
          <span className="font-medium"><Term id="שבירת פיקדון">שבירה</Term> של תוכנית חיסכון: האתר לא מחשב אותה.</span> מחיר השבירה, ואם לכל הפקדה יש נעילה משלה, נקבעים בהסכם של כל בנק, ולא נאספו לכל הבנקים. הבנק מנכה מס מהריבית שהוא משלם בפועל, אבל מה קורה במס כשהשבירה פוגעת גם בקרן, לא נאמר בשום מקור. שאלות פתוחות (<IdRef id="BANK OQ12" />, <IdRef id="TXI OQ14" />).
        </Callout>
        <RulesLine ids={["BANK-06", "BANK-28", "TXI-07"]} />
      </>
    );
  },
  risks: ({ figure }) => {
    const months = figure("REG-04", "examination_deadline_months");
    const proposed = figure("REG-05", "proposed_guarantee");
    return (
      <>
        <p className="max-w-measure">
          אין בישראל ביטוח פיקדונות: אם בנק קורס, אין חוק שמחזיר לכם את הכסף. נגיד בנק ישראל יכול למנות לבנק מנהל מורשה ולהעביר את הפיקדונות לבנק אחר, ובאישור הממשלה גם להכריז על ערבות לפיקדונות. אלה סמכויות שלו, לא זכויות שלכם.
        </p>
        <Sentence measure>
          חוק משנת 2026 מחייב את שר האוצר ואת הנגיד לבחון {months ? <>תוך <Num value={months} /> חודשים </> : null}אם צריך ביטוח פיקדונות; זו חובת בדיקה, לא ביטוח. הצעת חוק פרטית מציעה ערבות {proposed ? <>של עד <Num value={proposed} /> </> : null}ללקוח בבנקים קטנים, אבל היא רק הצעה.
        </Sentence>
        <p className="max-w-measure">תוכנית בריבית משתנה זזה עם ריבית העוגן שלה לאורך כל השנים. תוכנית לא צמודה לא מגינה מפני עליית מחירים, ובתקופה ארוכה זה מורגש יותר.</p>
        <RulesLine ids={["REG-04", "REG-05", "REG-06", "BANK-23", "BANK-25", "BANK-26"]} />
      </>
    );
  },
  use: () => (
    <>
      <p className="max-w-measure">
        חיסכון למטרה עם תאריך, שבונים מהמשכורת כל חודש בלי לחשוב עליו: הוראת הקבע עושה את העבודה.
      </p>
      <p className="max-w-measure">
        מול פיקדון רגיל, היתרון הוא שלא פותחים פיקדון חדש בכל חודש. מול קרן כספית יומית, בתוכנית בריבית קבועה הריבית ידועה מראש לכל התקופה, ובקרן היומית התשואה זזה עם ריבית בנק ישראל.
      </p>
      <RulesLine ids={["BANK-28", "BANK-25", "MF-34"]} />
    </>
  ),
};

export { RuleRef };
