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
          הלוואה שנותנים למדינה, וקונים ומוכרים אותה בבורסה. המדינה מחזירה את <Term prefix="ה" id="שווי נקוב">שווי הנקוב</Term> במועד <Term prefix="ה" id="פדיון">פדיון</Term>, ובדרך משלמת <Term id="קופון">קופון</Term>: ריבית במועדים קבועים.
        </p>
        <Sentence measure>
          יש שלושה סוגים עיקריים. <Term id={'אג"ח בריבית קבועה'}>בריבית קבועה</Term>: <Term id="לא צמוד">לא צמודה</Term> למדד, עם קופון קבוע שמשולם פעם בשנה <RuleRef id="GOV-13" />. <Term id={'אג"ח ממשלתית צמודה'}>צמודה למדד</Term>: הקרן והריבית עולות ויורדות עם מדד המחירים לצרכן. <Term id={'אג"ח בריבית משתנה'}>בריבית משתנה</Term>: לא צמודה, והריבית מתעדכנת כל {floatingEvery ? <Num value={floatingEvery} /> : null} חודשים לפי תשואת המק״מ, בלי מרווח ובלי רצפה <RuleRef id="GOV-14" />.
        </Sentence>
        <p className="max-w-measure">
          יש גם שמות ישנים. <Term id="שחר">״שחר״</Term> הוא סוג ישן ונפרד עם תקנות משלו, לא השם הקודם של האיגרת בריבית קבועה. גם <Term id="גילון חדש">״גילון חדש״</Term> הוא סוג ישן ונפרד, שכבר לא מונפק. <Term id="גליל">״גליל״</Term> הוא סוג ישן ונפרד של איגרת צמודה.
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
          המנפיקה היא המדינה, דרך יחידת ניהול החוב הממשלתי במשרד האוצר, במכרזים שבועיים. אתם קונים דרך חשבון ניירות ערך בבנק או בבית השקעות שהוא חבר בורסה, בבורסה בתל אביב, שבפיקוח רשות ניירות ערך.
        </p>
        <Sentence measure>
          בבורסה, במסחר הרציף, פקודה היא של {minOrder ? <Num value={minOrder} display={fmt.nisWhole(Number(minOrder.value))} /> : null} לפחות. בשלבים אחרים של יום המסחר, כמו לפני הפתיחה ולפני הנעילה, אפשר גם יחידת מסחר אחת, {unit ? <Num value={unit} display={fmt.nisWhole(Number(unit.value))} /> : null} שווי נקוב. הבנק או בית ההשקעות יכולים לקבוע בתעריפון מינימום משלהם.
        </Sentence>
        <p className="max-w-measure">
          מכירה לציבור במכרז עצמו עוברת לפי החוק דרך בנקים וחברי בורסה. איך הזמנה של אדם פרטי מגיעה למכרז, באיזה סכום מינימלי ובאיזו עמלה, לא נמצא. שאלה פתוחה (<IdRef id="GOV OQ8" />).
        </p>
        <p className="max-w-measure">איגרות ״ערד״ הונפקו רק לקרנות פנסיה, ו״ח״ץ״ הן רק לחברות ביטוח. אדם פרטי לא יכול לקנות אותן.</p>
        <RulesLine ids={["GOV-09", "GOV-10", "GOV-18", "GOV-24", "REG-13", "BRK-32"]} />
      </>
    );
  },
  termIds: ["שווי נקוב", "פדיון", "קופון", "אג\"ח בריבית קבועה", "לא צמוד", "שחר", "אג\"ח ממשלתית צמודה", "גליל", "אג\"ח בריבית משתנה", "גילון חדש", "אג\"ח ממשלתית קצרה", "אג\"ח סחיר", "הפרשי הצמדה", "רווח הון ריאלי", "ניכוי מס במקור", "מועד קובע לזכאות", "מדד הבסיס"],
  afterTax: ({ figure }) => {
    const unlinked = figure("TXI-15", "rate");
    const linked = figure("TXI-14", "rate");
    return (
      <>
        <Sentence measure>
          <span className="font-medium">המס תלוי בהצמדה, לא בשם הסדרה.</span> באיגרת לא צמודה, בריבית קבועה או משתנה, על הקופון משלמים {unlinked ? <Num value={unlinked} /> : null} מהסכום הנומינלי. על רווח ממכירה או מפדיון משלמים עד אותו שיעור מכל הרווח, בלי ניכוי של האינפלציה.
        </Sentence>
        <Sentence measure>
          באיגרת צמודה <Term id="הפרשי הצמדה">הפרשי ההצמדה</Term> פטורים ממס. על הריבית הריאלית <Term prefix="ועל ה" id="רווח הון ריאלי">רווח הריאלי</Term> משלמים עד {linked ? <Num value={linked} /> : null}.
        </Sentence>
        <p className="max-w-measure">
          אם המדד יורד, הקופון המוקטן ממוסה במלואו, והאתר לא מקזז ממנו את ההפסד מההצמדה. בית המשפט המחוזי לא התיר קיזוז כזה בפיקדון צמוד למטבע חוץ, ובית המשפט העליון השאיר את השאלה פתוחה. על איגרת חוב הדין הזה חל רק בהיסק מאותו נימוק.
        </p>
        <p className="max-w-measure">
          הבנק או חבר הבורסה מבצעים <Term id="ניכוי מס במקור">ניכוי מס במקור</Term>.
        </p>
        <Callout tone="blocked" className="max-w-measure">
          <span className="font-medium">קנייה בין מועדי קופון.</span> מי שקונה אחרי <Term prefix="ה" id="מועד קובע לזכאות">מועד הקובע</Term> לא מקבל את הקופון הקרוב, ומי שקונה באמצע תקופה משלם במחיר גם על ריבית שנצברה. איך המס מטפל בריבית הזאת לא מתועד, והאתר לא מחשב את זה. שאלה פתוחה (<IdRef id="TXI OQ5" />).
        </Callout>
        <RulesLine ids={["TXI-14", "TXI-15", "TXI-12", "TXI-05", "TXI-25", "TXS-05", "GOV-11"]} />
      </>
    );
  },
  risks: () => (
    <>
      <p className="max-w-measure">
        את הקרן והקופונים משלמת המדינה מהכנסותיה הכלליות, לא הבנק ולא הברוקר.
      </p>
      <p className="max-w-measure">
        מחיר האיגרת בבורסה עולה ויורד עם הריבית במשק. מי שמוכר לפני הפדיון יכול לקבל פחות ממה ששילם, ומי שמחזיק עד הפדיון מקבל את השווי הנקוב.
      </p>
      <p className="max-w-measure">
        באיגרת צמודה אין רצפה בתקנות: אם המדד יורד מתחת <Term prefix="ל" id="מדד הבסיס">מדד הבסיס</Term>, גם הקרן וגם הריבית קטנות. באיגרת לא צמודה, אינפלציה גבוהה מהריבית שוחקת את הכסף.
      </p>
      <p className="max-w-measure">
        המדינה יכולה לפדות סדרה מוקדם, בהליך תחרותי ושוויוני שהיא מפרסמת. זו זכות שלה, לא שלכם: מי שרוצה לצאת לפני הפדיון מוכר בבורסה.
      </p>
      <p className="max-w-measure">
        {/* D6 (2026-10-26): how the account keeps the paper is the account's, said once on its page, not copied here */}
        הנייר מוחזק בחשבון ניירות ערך. איך החשבון שומר על נכסי הלקוחות, ומה קורה אם הבנק או בית ההשקעות קורסים, מוסבר בעמוד של <Link to="/guide/brokerage-account" className="text-link hover:underline">חשבון ניירות ערך</Link>.
      </p>
      <p className="max-w-measure">
        מה עוד לא נמצא: הנוסח המקורי של התקנות של הסוג הישן ״שחר״, לסדרות שלו שאולי עוד נסחרות (<IdRef id="GOV OQ4" />); אם לסדרה צמודה מסוימת יש רצפה בירידת מדד (<IdRef id="GOV OQ6" />); וטקסט רשמי על סיכון המחיר לפני הפדיון (<IdRef id="GOV OQ9" />).
      </p>
      <RulesLine ids={["GOV-02", "GOV-12", "GOV-13", "GOV-14", "GOV-16", "GOV-17"]} />
    </>
  ),
  use: () => (
    <>
      <p className="max-w-measure">
        כסף לתקופה ידועה של יותר משנה, כשרוצים תשלום קבוע מהמדינה ואפשרות למכור בדרך. איגרת צמודה למדד שומרת על ערך הכסף למי שמחזיק עד הפדיון. איגרת בריבית קבועה נותנת סכום ידוע מראש בשקלים. איגרת בריבית משתנה עוקבת אחרי תשואת המק״מ, ומתאימה כשלא רוצים להתחייב לריבית של היום.
      </p>
      <p className="max-w-measure">
        לתקופה של עד שנה, מק״מ או אג״ח ממשלתית קצרה פשוטים יותר: בלי קופונים, ובמק״מ גם בלי דמי ניהול פיקדון ניירות ערך בבנק. לעומת פיקדון, באיגרת חוב משלמים עמלות קנייה ומכירה ודמי ניהול פיקדון ניירות ערך, אבל אין נעילה ואין קנס שבירה.
      </p>
      <p className="max-w-measure">
        עמלות הקנייה והמכירה, ודמי חשבון קבועים אם החברה גובה אותם, נקבעים בתעריפון של כל חברה. ראו במדריך: <Link to="/guide/brokerage-account" className="text-link hover:underline">חשבון ניירות ערך</Link>.
      </p>
      <RulesLine ids={["GOV-11", "GOV-13", "GOV-14", "GOV-15", "GOV-17", "BANK-18", "BRK-16"]} />
      {/* D6 (amended 2026-10-27): the two government-bond exposure pages folded into this one; what they said about holding bonds without buying them */}
      <p className="max-w-measure">
        אפשר להחזיק איגרות חוב ממשלתיות גם בעקיפין. <Link to="/guide/money-market-fund-daily" className="text-link hover:underline">קרן כספית</Link> יכולה להחזיק איגרות לא צמודות עם פחות משנה לפדיון, אבל לא איגרות צמודות למדד. בקופת גמל להשקעה ובקרן השתלמות יש מסלולים שמתמחים באג״ח ממשלתית ובאג״ח צמודה למדד, ומסלול ״כספי (שקלי)״ שלפי רשימת מסלולי ההשקעה של רשות שוק ההון מחזיק גם מלוות ממשלה בשקלים. בחשבון בניהול אישי קונים אותן ישירות, כמו בחשבון ניירות ערך.
      </p>
      <RulesLine ids={["MF-29", "CAT-10", "CAT-17", "CAT-18", "CAT-23", "IRA-11"]} />
    </>
  ),
};

export { RuleRef };
