// Guide prose for קופת גמל להשקעה (architecture 3.5: prose lives in content files; every figure is a
// Num). Wording follows the approved mockup of 2026-10-23, checked against the rule base; each block
// ends with the rules it rests on. NEW copy for the founder to review (docs/copy.md holds only labels).
import type { GuideContent } from "./types";
import { fmt } from "../../lib/format";
import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";
import { OpenLossOffset } from "./open-tax";

export const content: GuideContent = {
  what: () => (
    <>
      <p className="max-w-measure">
        קופת גמל שמפקידים אליה בעצמכם, עד תקרה שנתית. החוק לא קובע תנאי גיל או תושבות לפתיחה, והחברה המנהלת מחליטה אם לקבל בקשת הצטרפות.
      </p>
      <p className="max-w-measure">
        הכסף מושקע <Term prefix="ב" id="מסלול השקעה">מסלול השקעה</Term> שבוחרים. על הרווחים בתוך הקופה לא משלמים מס. משלמים רק כש<Term id="משיכה">מושכים</Term>, ורק על הרווח.
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
  switchLine: "בלי מס. אפשר גם לעבור לקופת גמל להשקעה אחרת, עם כל היתרה או עם חלק ממנה",
  switchRules: ["TXK-04", "PF-23", "KGL-10"],
  termIds: ["מסלול השקעה", "משיכה", "חברה מנהלת", "קופת גמל לקצבה", "קצבה"],
  afterTax: ({ figure }) => {
    const age = figure("TXK-10", "early_retirement_age");
    const sixty = figure("TXG-04", "age");
    const rate = figure("TXK-06", "rate");
    const withheld = figure("TXK-26", "regulation_text_rate");
    const proposedCap = figure("TXK-21", "proposed_cap");
    return (
      <>
        {proposedCap ? (
          <>
            <Callout tone="caution" className="max-w-measure">
              <span className="font-medium">המלצה, לא חוק.</span> צוות של משרד האוצר המליץ ביולי 2026 על חשבון השקעות עם הטבת מס, עם תקרה אחת של <Num value={proposedCap} display={fmt.nisWhole(Number(proposedCap.value))} /> לאדם. מעל התקרה ההטבות של היום היו מסתיימות. זה יכול לשנות את הכדאיות של המוצר, אבל לא נמצאה הצעת חוק.
            </Callout>
            <RulesLine ids={["TXK-21"]} />
          </>
        ) : null}
        <Callout tone="blocked" className="max-w-measure">
          <span className="font-medium">מגיל {age ? <Num value={age} /> : null} אפשר להעביר את הכסף <Term prefix="ל" id="קופת גמל לקצבה">קופת גמל לקצבה</Term>.</span> הכסף נכנס שם למסלול למקבלי קצבה, לקבלת <Term id="קצבה">קצבה</Term> בלבד. את הקצבה האתר עוד לא מחשב, כי חסרים מקדמי ההמרה. שאלה פתוחה (<IdRef id="PEN OQ7" />).
        </Callout>
        <RulesLine ids={["TXK-10", "KGL-09"]} />
        <Callout tone="caution" className="max-w-measure">
          <span className="font-medium">מגיל {sixty ? <Num value={sixty} /> : null} המס על הרווח יכול להיות נמוך יותר.</span> {rate ? <Num value={rate} /> : "השיעור על הרווח"} הוא תקרה, לא שיעור קבוע. מגיל {sixty ? <Num value={sixty} /> : null} חלות על ההכנסה מדרגות המס הנמוכות, ואם המדרגה נמוכה מהתקרה, משלמים לפיה. הרווח נספר כחלק העליון של ההכנסה, ולכן זה עוזר רק כשהכנסות אחרות לא ממלאות את המדרגות הנמוכות. כשמזינים גיל, האתר מחשב את ההקלה לפי ההכנסה השנתית שבחישוב.
        </Callout>
        <Sentence measure>
          החברה המנהלת מנכה במקור {withheld ? <Num value={withheld} /> : "לפי התקנות"} מהרווח, בכל גיל. זו מקדמה: המס הסופי נקבע בדוח השנתי, ושם מקבלים בחזרה את מה שנוכה יותר מדי או משלימים את מה שחסר, עד התקרה <RuleRef id="TXK-26" />.
        </Sentence>
        <RulesLine ids={["TXK-06", "TXG-04", "TXG-07", "TXK-26"]} />
        <OpenLossOffset />
      </>
    );
  },
  risks: () => (
    <>
      <p className="max-w-measure">הנכסים מוחזקים בנאמנות, בנפרד מהרכוש של החברה המנהלת, ואי אפשר לעקל אותם. זכויות של עמית אפשר לעקל רק לפי כללים שהשר קובע. אם החברה המנהלת קורסת, הניהול עובר לחברה אחרת. המדינה לא ערבה לשווי הקופה, והוא עולה ויורד עם ההשקעות של המסלול שבחרתם.</p>
      <RulesLine ids={["PF-29", "REG-18", "REG-19"]} />
    </>
  ),
  use: ({ figure }) => {
    const age = figure("TXK-10", "early_retirement_age");
    return (
      <>
        <Sentence measure>
          חיסכון שצריך להישאר זמין: אין נעילה, ומושכים בכל עת. מעבר בין מסלולים לא ממוסה, ולכן אפשר לשנות את ההשקעה בדרך בלי לשלם מס על הרווח. מגיל {age ? <Num value={age} /> : null} אפשר גם להעביר את הכסף לקופת גמל לקצבה.
        </Sentence>
        <RulesLine ids={["KGL-08", "TXK-04", "TXK-10"]} />
      </>
    );
  },
};

export { RuleRef };
