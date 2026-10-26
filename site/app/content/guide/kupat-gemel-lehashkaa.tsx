// Guide prose for קופת גמל להשקעה (architecture 3.5: prose lives in content files; every figure is a
// Num). Wording follows the approved mockup of 2026-10-23, checked against the rule base; each block
// ends with the rules it rests on. NEW copy for the founder to review (docs/copy.md holds only labels).
import type { GuideContent } from "./types";
import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";

export const content: GuideContent = {
  what: () => (
    <>
      <p className="max-w-measure">
        קופת גמל שכל אדם יכול לפתוח, בכל גיל, ולהפקיד אליה בעצמו. הכסף מושקע <Term prefix="ב" id="מסלול השקעה">מסלול השקעה</Term> שבוחרים. על הרווחים בתוך הקופה לא משלמים מס, ומשלמים רק כש
        <Term id="משיכה">מושכים</Term> את הכסף.
      </p>
      <RulesLine ids={["KGL-01", "KGL-06", "TXK-03", "TXK-05"]} />
    </>
  ),
  who: () => (
    <>
      <p className="max-w-measure">
        <Term id="חברה מנהלת">חברות מנהלות</Term> של קופות גמל, בפיקוח רשות שוק ההון, ביטוח וחיסכון. לכל חברה יש עמוד עם כל המסלולים שלה.
      </p>
      <RulesLine ids={["REG-17"]} />
    </>
  ),
  switchLine: "בלי מס, גם מעבר לקופת גמל להשקעה אחרת",
  switchRules: ["TXK-04", "PF-23"],
  termIds: ["מסלול השקעה", "משיכה", "חברה מנהלת", "קופת גמל לקצבה", "קצבה"],
  afterTax: ({ figure }) => {
    const age = figure("TXK-10", "early_retirement_age");
    const sixty = figure("TXG-04", "age");
    return (
      <>
        <Callout tone="blocked" className="max-w-measure">
          <span className="font-medium">מגיל {age ? <Num value={age} /> : null} אפשר להעביר את הכסף <Term prefix="ל" id="קופת גמל לקצבה">קופת גמל לקצבה</Term>.</span> את <Term prefix="ה" id="קצבה">קצבה</Term> האתר עוד לא מחשב, כי חסרים מקדמי ההמרה. שאלה פתוחה: <IdRef id="PEN OQ7" />.
        </Callout>
        <RulesLine ids={["TXK-10", "KGL-09"]} />
        <Callout tone="caution" className="max-w-measure">
          <span className="font-medium">מגיל {sixty ? <Num value={sixty} /> : null} המס על הרווח במשיכה יכול להיות נמוך יותר.</span> השיעור על הרווח הוא שיעור מרבי, ולכן מדרגות המס הנמוכות של בני {sixty ? <Num value={sixty} /> : null} ומעלה חלות עליו קודם; מאחר שהרווח הוא המדרגה העליונה של ההכנסה, זה עוזר רק כשהכנסות אחרות משאירות את המדרגות האלה פנויות. כשמזינים גיל, האתר מחשב את ההקלה לפי ההכנסה השנתית שבחישוב. החברה המנהלת מנכה במקור בלי להתחשב בגיל, וההפרש חוזר בדוח שנתי <RuleRef id="TXK-06" />.
        </Callout>
        <RulesLine ids={["TXK-06", "TXG-04", "TXG-07"]} />
      </>
    );
  },
  risks: () => (
    <>
      <p className="max-w-measure">הנכסים מוחזקים בנאמנות, בנפרד מהרכוש של החברה המנהלת, ואי אפשר לעקל אותם. אם החברה המנהלת קורסת, הניהול עובר לחברה אחרת. אין ערבות של המדינה לשווי הקופה.</p>
      <p className="max-w-measure">השווי עולה ויורד עם ההשקעות של המסלול שבחרתם.</p>
      <RulesLine ids={["PF-29", "REG-18", "REG-19"]} />
    </>
  ),
  use: ({ figure }) => {
    const age = figure("TXK-10", "early_retirement_age");
    return (
      <>
        <Sentence measure>
          חיסכון שצריך להישאר זמין, בלי נעילה, עם השקעה במסלול לבחירה. מגיל {age ? <Num value={age} /> : null} אפשר להעביר אותו לקופת גמל לקצבה.
        </Sentence>
        <RulesLine ids={["KGL-08", "TXK-10"]} />
      </>
    );
  },
};

export { RuleRef };
