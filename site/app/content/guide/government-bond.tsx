// Guide prose for איגרות חוב ממשלתיות (architecture 3.5: prose lives in content files; every figure is a
// Num). Written 2026-10-23 from the rule base (GOV, TXI, TXS, BRK, REG); each block ends with the rules it
// rests on. NEW copy for the founder to review (docs/copy.md holds only labels).
import { Link } from "react-router";
import type { GuideContent } from "./types";
import { fmt } from "../../lib/format";
import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";

export const content: GuideContent = {
  what: ({ figure }) => {
    const floatingEvery = figure("GOV-14", "coupon_every_months");
    return (
      <>
        <p className="max-w-measure">
          הלוואה שנותנים למדינה, וקונים ומוכרים אותה <Term prefix="ב" id="בורסה">בורסה</Term>. המדינה מחזירה את <Term prefix="ה" id="שווי נקוב">שווי הנקוב</Term> במועד <Term prefix="ה" id="פדיון">פדיון</Term>, ובדרך משלמת <Term id="קופון">קופון</Term>: <Term id="ריבית">ריבית</Term> במועדים קבועים.
        </p>
        <Sentence measure>
          יש שלושה סוגים עיקריים. <Term id={'אג"ח בריבית קבועה'}>בריבית קבועה</Term>: <Term id="לא צמוד">לא צמודה</Term> <Term prefix="ל" id="מדד">מדד</Term>, עם קופון קבוע שמשולם פעם בשנה <RuleRef id="GOV-13" end="." /> <Term id={'אג"ח ממשלתית צמודה'}>צמודה למדד</Term>: הקרן והריבית עולות ויורדות עם <Term id="מדד המחירים לצרכן">מדד המחירים לצרכן</Term>. <Term id={'אג"ח בריבית משתנה'}>בריבית משתנה</Term>: לא צמודה, והריבית מתעדכנת כל {floatingEvery ? <Num value={floatingEvery} /> : null} חודשים לפי תשואת <Term prefix="ה" id={'מק"מ'}>מק״מ</Term>, בלי <Term id="מרווח">מרווח</Term> ובלי רצפה <RuleRef id="GOV-14" end="." />
        </Sentence>
        <p className="max-w-measure">
          יש גם שמות ישנים. <Term id="שחר">״שחר״</Term> הוא סוג ישן ונפרד עם תקנות משלו, לא השם הקודם של האיגרת <Term prefix="ב" id="ריבית קבועה">ריבית קבועה</Term>. גם <Term id="גילון חדש">״גילון חדש״</Term> הוא סוג ישן ונפרד, שכבר לא מונפק. <Term id="גליל">״גליל״</Term> הוא סוג ישן ונפרד של איגרת צמודה.
        </p>
        <p className="max-w-measure">
          יש גם <Term id={'אג"ח ממשלתית קצרה'}>אג״ח ממשלתית קצרה</Term>, עד שנה, בלי ריבית, שנמכרת מתחת לסכום הפדיון כמו מק״מ. כולן <Term id={'אג"ח סחיר'}>סחירות</Term>: אפשר למכור אותן בכל יום מסחר במחיר השוק של אותו יום, ולא חייבים לחכות לפדיון.
        </p>
        <RulesLine ids={["GOV-08", "GOV-11", "GOV-13", "GOV-14", "GOV-15", "GOV-17"]} />
      </>
    );
  },
  who: ({ figure }) => {
    const minOrder = figure("GOV-24", "min_order_government_bond");
    const unit = figure("GOV-24", "trading_unit_face_value");
    return (
      <>
        <p className="max-w-measure">
          המנפיקה היא המדינה, דרך יחידת ניהול החוב הממשלתי במשרד האוצר, במכרזים שבועיים. אתם קונים דרך חשבון ניירות ערך בבנק או <Term prefix="ב" id="בית השקעות">בית השקעות</Term> שהוא <Term id="חבר בורסה">חבר בורסה</Term>, בבורסה בתל אביב, שבפיקוח <Term id="רשות ניירות ערך">רשות ניירות ערך</Term>.
        </p>
        <Sentence measure>
          בבורסה, במסחר הרציף, פקודה היא של {minOrder ? <Num value={minOrder} display={fmt.nisWhole(Number(minOrder.value))} /> : null} לפחות. בשלבים אחרים של יום המסחר, כמו לפני הפתיחה ולפני הנעילה, אפשר גם יחידת מסחר אחת, {unit ? <Num value={unit} display={fmt.nisWhole(Number(unit.value))} /> : null} שווי נקוב. הבנק או בית ההשקעות יכולים לקבוע בתעריפון מינימום משלהם.
        </Sentence>
        <p className="max-w-measure">
          מכירה לציבור במכרז עצמו עוברת לפי החוק דרך בנקים וחברי בורסה. איך הזמנה של אדם פרטי מגיעה למכרז, באיזה סכום מינימלי ובאיזו עמלה, לא נמצא. שאלה פתוחה <IdRef id="GOV OQ8" end="." />
        </p>
        <p className="max-w-measure">איגרות ״ערד״ הונפקו רק <Term prefix="ל" id="קרן פנסיה">קרנות פנסיה</Term>, ו״ח״ץ״ הן רק לחברות ביטוח. אדם פרטי לא יכול לקנות אותן.</p>
        <RulesLine ids={["GOV-09", "GOV-10", "GOV-18", "GOV-24", "REG-13", "BRK-32"]} />
      </>
    );
  },
  termIds: ["שווי נקוב", "פדיון", "קופון", "אג\"ח בריבית קבועה", "לא צמוד", "שחר", "אג\"ח ממשלתית צמודה", "גליל", "אג\"ח בריבית משתנה", "גילון חדש", "אג\"ח ממשלתית קצרה", "אג\"ח סחיר", "הפרשי הצמדה", "רווח הון ריאלי", "ניכוי מס במקור", "מועד קובע לזכאות", "מדד הבסיס", "מטבע חוץ", "איגרת חוב", "הליך תחרותי", "נומינלי", "קרן פנסיה", "רשות ניירות ערך", "חבר בורסה", "קופת גמל בניהול אישי", "רשות שוק ההון ביטוח וחיסכון", "מסלול השקעה", "כספי (שקלי)", "קרן השתלמות", "קופת גמל להשקעה", "דמי חשבון קבועים", "קנס שבירה", "פיקדון", "דמי ניהול פיקדון ניירות ערך", "ריבית משתנה", "ריבית קבועה", "מרווח", 'מק"מ', "מדד המחירים לצרכן", "ריבית", "בורסה", "מדד", "מכירה", "עמלת קנייה ומכירה", "נקודת אחוז"],
  afterTax: ({ figure }) => {
    const unlinked = figure("TXI-15", "rate");
    const linked = figure("TXI-14", "rate");
    return (
      <>
        <Sentence measure>
          <span className="font-medium">המס תלוי <Term prefix="ב" id="הצמדה">הצמדה</Term>, לא בשם הסדרה.</span> באיגרת לא צמודה, בריבית קבועה או משתנה, על הקופון משלמים {unlinked ? <Num value={unlinked} /> : null} מהסכום <Term prefix="ה" id="נומינלי">נומינלי</Term>. על רווח <Term prefix="מ" id="מכירה">מכירה</Term> או מפדיון משלמים עד אותו שיעור מכל הרווח, בלי ניכוי של <Term prefix="ה" id="אינפלציה">אינפלציה</Term>.
        </Sentence>
        <Sentence measure>
          באיגרת צמודה <Term id="הפרשי הצמדה">הפרשי ההצמדה</Term> פטורים ממס. על הריבית הריאלית <Term prefix="ועל ה" id="רווח הון ריאלי">רווח הריאלי</Term> משלמים עד {linked ? <Num value={linked} /> : null}.
        </Sentence>
        <p className="max-w-measure">
          אם המדד יורד, הקופון המוקטן ממוסה במלואו, והאתר לא מקזז ממנו את ההפסד מההצמדה. בית המשפט המחוזי לא התיר קיזוז כזה בפיקדון צמוד <Term prefix="ל" id="מטבע חוץ">מטבע חוץ</Term>, ובית המשפט העליון השאיר את השאלה פתוחה. על איגרת חוב הדין הזה חל רק בהיסק מאותו נימוק.
        </p>
        <p className="max-w-measure">
          הבנק או חבר הבורסה מבצעים <Term id="ניכוי מס במקור">ניכוי מס במקור</Term>.
        </p>
        <Callout tone="blocked" className="max-w-measure">
          <span className="font-medium">קנייה בין מועדי קופון.</span> מי שקונה אחרי <Term prefix="ה" id="מועד קובע לזכאות">מועד הקובע</Term> לא מקבל את הקופון הקרוב, ומי שקונה באמצע תקופה משלם במחיר גם על ריבית שנצברה. איך המס מטפל בריבית הזאת לא מתועד, והאתר לא מחשב את זה. שאלה פתוחה <IdRef id="TXI OQ5" end="." />
        </Callout>
        <RulesLine ids={["TXI-14", "TXI-15", "TXI-12", "TXI-05", "TXI-25", "TXS-05", "GOV-11"]} />
      </>
    );
  },
  risks: () => (
    <>
      <p className="max-w-measure">
        את הקרן והקופונים משלמת המדינה מהכנסותיה הכלליות, לא הבנק ולא <Term prefix="ה" id="ברוקר">ברוקר</Term>.
      </p>
      <p className="max-w-measure">
        מחיר האיגרת בבורסה עולה ויורד עם הריבית במשק. מי שמוכר לפני הפדיון יכול לקבל פחות ממה ששילם, ומי שמחזיק עד הפדיון מקבל את השווי הנקוב.
      </p>
      <p className="max-w-measure">
        באיגרת צמודה אין רצפה בתקנות: אם המדד יורד מתחת <Term prefix="ל" id="מדד הבסיס">מדד הבסיס</Term>, גם הקרן וגם הריבית קטנות. באיגרת לא צמודה, אינפלציה גבוהה מהריבית שוחקת את הכסף.
      </p>
      <p className="max-w-measure">
        המדינה יכולה לפדות סדרה מוקדם, <Term prefix="ב" id="הליך תחרותי">הליך תחרותי</Term> ושוויוני שהיא מפרסמת. זו זכות שלה, לא שלכם: מי שרוצה לצאת לפני הפדיון מוכר בבורסה.
      </p>
      <p className="max-w-measure">
        {/* D6 (2026-10-26): how the account keeps the paper is the account's, said once on its page, not copied here */}
        הנייר מוחזק בחשבון ניירות ערך. איך החשבון שומר על נכסי הלקוחות, ומה קורה אם הבנק או בית ההשקעות קורסים, מוסבר בעמוד של <Link to="/guide/brokerage-account" className="text-link hover:underline">חשבון ניירות ערך</Link>.
      </p>
      <p className="max-w-measure">
        מה עוד לא נמצא: הנוסח המקורי של התקנות של הסוג הישן ״שחר״, לסדרות שלו שאולי עוד נסחרות <IdRef id="GOV OQ4" end=";" /> אם לסדרה צמודה מסוימת יש רצפה בירידת מדד <IdRef id="GOV OQ6" end=";" /> וטקסט רשמי על סיכון המחיר לפני הפדיון <IdRef id="GOV OQ9" end="." />
      </p>
      <RulesLine ids={["GOV-02", "GOV-12", "GOV-13", "GOV-14", "GOV-16", "GOV-17"]} />
    </>
  ),
  use: () => (
    <>
      <p className="max-w-measure">
        כסף לתקופה ידועה של יותר משנה, כשרוצים תשלום קבוע מהמדינה ואפשרות למכור בדרך. איגרת צמודה למדד שומרת על ערך הכסף למי שמחזיק עד הפדיון. איגרת בריבית קבועה נותנת סכום ידוע מראש בשקלים. איגרת <Term prefix="ב" id="ריבית משתנה">ריבית משתנה</Term> עוקבת אחרי תשואת המק״מ, ומתאימה כשלא רוצים להתחייב לריבית של היום.
      </p>
      <p className="max-w-measure">
        לתקופה של עד שנה, מק״מ או אג״ח ממשלתית קצרה פשוטים יותר: בלי קופונים, ובמק״מ גם בלי <Term id="דמי ניהול פיקדון ניירות ערך">דמי ניהול פיקדון ניירות ערך</Term> בבנק. לעומת <Term id="פיקדון">פיקדון</Term>, <Term prefix="ב" id="איגרת חוב">איגרת חוב</Term> משלמים <Term id="עמלת קנייה ומכירה">עמלות קנייה ומכירה</Term> ודמי ניהול פיקדון ניירות ערך, אבל אין נעילה ואין <Term id="קנס שבירה">קנס שבירה</Term>.
      </p>
      <p className="max-w-measure">
        עמלות הקנייה והמכירה, <Term prefix="ו" id="דמי חשבון קבועים">דמי חשבון קבועים</Term> אם החברה גובה אותם, נקבעים בתעריפון של כל חברה. ראו במדריך: <Link to="/guide/brokerage-account" className="text-link hover:underline">חשבון ניירות ערך</Link>.
      </p>
      <RulesLine ids={["GOV-11", "GOV-13", "GOV-14", "GOV-15", "GOV-17", "BANK-18", "BRK-16"]} />
      {/* D6 (amended 2026-10-27): the two government-bond exposure pages folded into this one; what they said about holding bonds without buying them */}
      <p className="max-w-measure">
        אפשר להחזיק איגרות חוב ממשלתיות גם בעקיפין. <Link to="/guide/money-market-fund-daily" className="text-link hover:underline">קרן כספית</Link> יכולה להחזיק איגרות לא צמודות עם פחות משנה לפדיון, אבל לא איגרות צמודות למדד. <Term prefix="ב" id="קופת גמל להשקעה">קופת גמל להשקעה</Term> <Term prefix="וב" id="קרן השתלמות">קרן השתלמות</Term> יש מסלולים שמתמחים באג״ח ממשלתית ובאג״ח צמודה למדד, ומסלול ״<Term id="כספי (שקלי)">כספי (שקלי)</Term>״ שלפי רשימת <Term id="מסלול השקעה">מסלולי ההשקעה</Term> של <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון</Term> מחזיק גם מלוות ממשלה בשקלים. בחשבון <Term prefix="ב" id="קופת גמל בניהול אישי">ניהול אישי</Term> קונים אותן ישירות, כמו בחשבון ניירות ערך.
      </p>
      <RulesLine ids={["MF-29", "CAT-10", "CAT-17", "CAT-18", "CAT-23", "IRA-11"]} />
    </>
  ),
};

export { RuleRef };
