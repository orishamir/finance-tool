// Guide prose for קופת גמל להשקעה (architecture 3.5: prose lives in content files; every figure is a
// Num). Wording follows the approved mockup of 2026-10-23, checked against the rule base; each block
// ends with the rules it rests on. NEW copy for the founder to review (docs/copy.md holds only labels).
import type { GuideContent } from "./types";
import { fmt } from "../../lib/format";
import { IdRef, Num, RuleRef, RuleStrengthTag, RulesLine, Term } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";
import { OpenLossOffset } from "./open-tax";
import { AbroadAmount, AbroadFigure, AbroadPeriod, AbroadSaid, AbroadYears } from "./abroad-parts";

export const content: GuideContent = {
  what: () => (
    <>
      <p className="max-w-measure">
        בחוק ובכללים לא נמצא תנאי גיל או תושבות לפתיחה. זו קריאה של מה שהם לא אומרים, לא כלל כתוב. שאלה פתוחה <IdRef id="KGL OQ6" end="." /> <Term prefix="ה" id="חברה מנהלת">חברה המנהלת</Term> מחליטה אם לקבל בקשת הצטרפות.
      </p>
      <p className="max-w-measure">
        הכסף מושקע <Term prefix="ב" id="מסלול השקעה">מסלול השקעה</Term> שבוחרים. על הרווחים בתוך הקופה לא משלמים מס. מס הכנסה משלמים רק כש<Term id="משיכה">מושכים</Term>, ורק על הרווח.
      </p>
      <RulesLine ids={["KGL-01", "KGL-06", "TXK-03", "TXK-05"]} />
    </>
  ),
  who: () => (
    <>
      <p className="max-w-measure">
        חברות מנהלות של <Term id="קופת גמל">קופות גמל</Term>, בפיקוח <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון, ביטוח וחיסכון</Term>. לכל חברה יש עמוד עם כל המסלולים שלה.
      </p>
      <RulesLine ids={["REG-17"]} />
    </>
  ),
  switchLine: "בלי מס הכנסה. אפשר גם לעבור לקופת גמל להשקעה אחרת, עם כל היתרה או עם חלק ממנה.",
  switchRules: ["TXK-04", "PF-23", "KGL-10"],
  omitSwitchInTax: true,
  companiesOpen: true,
  termIds: ["מסלול השקעה", "משיכה", "חברה מנהלת", "קופת גמל לקצבה", "קצבה", "עמית", "מקדם המרה", "רשות שוק ההון ביטוח וחיסכון", "העברת כספים בין מסלולי השקעה", "קופת גמל", "תשואה", "אינפלציה", "שכר נאמן", "דמי ניהול", "חשבון ניירות ערך"],
  afterTax: ({ figure }) => {
    const age = figure("TXK-10", "early_retirement_age");
    const sixty = figure("TXG-04", "age");
    const rate = figure("TXK-06", "rate");
    const withheld = figure("TXK-26", "withholding_on_gains");
    const proposedCap = figure("TXK-21", "proposed_cap");
    return (
      <>
        {proposedCap ? (
          <>
            <Callout tone="caution" className="max-w-measure">
              <span className="font-medium">המלצה, לא חוק.</span> צוות של משרד האוצר המליץ ביולי 2026 על חשבון השקעות עם הטבת מס, עם תקרה אחת של <Num value={proposedCap} display={fmt.nisWhole(Number(proposedCap.value))} /> לאדם. מעל התקרה ההטבות של היום היו מסתיימות. זה יכול לשנות את הכדאיות של המוצר, אבל לא נמצאה הצעת חוק.
            </Callout>
            <RulesLine ids={["TXK-21"]} lead={<RuleStrengthTag id="TXK-21" />} />
          </>
        ) : null}
        <Callout tone="blocked" className="max-w-measure">
          <span className="font-medium">מגיל {age ? <Num value={age} /> : null} אפשר להעביר את הכסף <Term prefix="ל" id="קופת גמל לקצבה">קופת גמל לקצבה</Term>.</span> הכסף נכנס שם למסלול למקבלי <Term id="קצבה">קצבה</Term>, לקבלת קצבה בלבד. לפי טיוטת הבהרה מ־<bdi>2020</bdi> של הממונה על שוק ההון, ביטוח וחיסכון, אחרי ההעברה אי אפשר לבטל את הבחירה בקצבה, למשל במשיכה בסכום חד־פעמי. את הקצבה האתר עוד לא מחשב, כי חסרים <Term id="מקדם המרה">מקדמי ההמרה</Term>. שאלה פתוחה <IdRef id="PEN OQ7" end="." />
        </Callout>
        <RulesLine ids={["TXK-10", "KGL-09", "PEN-63"]} />
        <Callout tone="caution" className="max-w-measure">
          <span className="font-medium">מגיל {sixty ? <Num value={sixty} /> : null} המס על הרווח יכול להיות נמוך יותר.</span> {rate ? <Num value={rate} /> : "השיעור על הרווח"} הוא תקרה, לא שיעור קבוע. מגיל {sixty ? <Num value={sixty} /> : null} חלות על ההכנסה מדרגות המס הנמוכות, ואם המדרגה נמוכה מהתקרה, משלמים לפיה. הרווח נספר כחלק העליון של ההכנסה, ולכן זה עוזר רק כשהכנסות אחרות לא ממלאות את המדרגות הנמוכות. כשמזינים גיל, האתר מחשב את ההקלה לפי ההכנסה השנתית שבחישוב.
        </Callout>
        <Sentence measure>
          החברה המנהלת מנכה במקור {withheld ? <Num value={withheld} /> : "מס"} מהרווח, בכל גיל, ולא מנכה כלום מהסכום שהופקד <Term prefix="ומה" id="הצמדה">הצמדה</Term> עליו. זו מקדמה: המס הסופי נקבע בדוח השנתי, ושם מקבלים בחזרה את מה שנוכה יותר מדי.
        </Sentence>
        <RulesLine ids={["TXK-06", "TXG-04", "TXG-07", "TXK-26"]} />
        <OpenLossOffset />
      </>
    );
  },
  // how the same kind of saving works in four other countries (D114); every fact is read on that country's own pages, data/abroad/
  abroad: {
    heads: ["כמה אפשר להפקיד", "מס על הרווח", "מתי אפשר למשוך"],
    countries: {
      gb: {
        title: (p) => <>בבריטניה: חשבון <bdi dir="ltr">{p}</bdi></>,
        body: (f, { figure }) => {
          const age = figure("TXK-10", "early_retirement_age");
          return (
            <>
              חשבון חיסכון והשקעה עם הטבת מס, <AbroadSaid v={f("who")}>לתושבי בריטניה</AbroadSaid> מגיל <AbroadFigure v={f("min_age")} />. ההבדל מקופת גמל להשקעה: משיכה בכל גיל, גם של הכול בבת אחת, פטורה ממס על הרווח. בקופת גמל להשקעה משלמים מס הכנסה על הרווח במשיכה חד־פעמית בכל גיל, ומגיל {age ? <Num value={age} /> : null} הוא פטור רק כשהכסף עובר לקצבה.
            </>
          );
        },
        rules: ["TXK-05", "TXK-07", "TXK-09", "TXK-10", "TXK-12"],
        tiles: (f) => [<>עד <AbroadAmount v={f("deposit_limit")} /> בשנת המס <AbroadPeriod v={f("deposit_limit")} /></>, <AbroadSaid v={f("tax_on_gain")}>אין</AbroadSaid>, <AbroadSaid v={f("withdraw")}>בכל עת</AbroadSaid>],
      },
      us: {
        title: (p) => <>בארצות הברית: חשבון <bdi dir="ltr">{p}</bdi></>,
        body: (f, { figure }) => {
          const age = figure("TXK-10", "early_retirement_age");
          return (
            <>
              חשבון חיסכון לפרישה. מפקידים בו <AbroadSaid v={f("who")}>עד גובה ההכנסה מעבודה באותה שנה</AbroadSaid>, ולפי ההכנסה ואופן הגשת הדוח לפעמים פחות. כמו בקופת גמל להשקעה, ההפקדה לא מורידה את מס ההכנסה. ההבדל: מגיל <AbroadFigure v={f("withdraw")} />, אחרי <AbroadFigure v={f("account_years")} /> שנים לפחות מתחילת השנה של ההפקדה הראשונה, גם משיכה של הכול בבת אחת פטורה ממס הכנסה, כולל הרווח. בקופת גמל להשקעה, מגיל {age ? <Num value={age} /> : null} הרווח פטור ממס הכנסה רק כשהכסף עובר לקצבה.
            </>
          );
        },
        rules: ["TXK-05", "TXK-07", "TXK-09", "TXK-10", "TXK-12"],
        tiles: (f) => [<>עד <AbroadAmount v={f("deposit_limit")} /> בשנת <AbroadPeriod v={f("deposit_limit")} /></>, <AbroadSaid v={f("tax_on_gain")}>אין, בתנאים</AbroadSaid>, <>בלי מס הכנסה מגיל <AbroadFigure v={f("withdraw")} /></>],
      },
      fr: {
        title: (p) => <>בצרפת: תוכנית <bdi dir="ltr">{p}</bdi></>,
        body: (f) => <>תוכנית השקעה במניות של חברות אירופיות, <AbroadSaid v={f("who")}>לבגירים שהם תושבי צרפת לצורכי מס</AbroadSaid>. משיכה לפני <AbroadFigure v={f("closes_before")} /> שנים סוגרת בדרך כלל את התוכנית. אחרי <AbroadFigure v={f("exempt_after_years")} /> שנים הרווח פטור ממס הכנסה, אבל משלמים עליו מסים סוציאליים.</>,
        tiles: (f) => [<>עד <AbroadAmount v={f("deposit_limit")} /> בסך הכול</>, <>אחרי <AbroadYears v={f("exempt_after_years")} />: <AbroadSaid v={f("tax_on_gain")}>רק מסים סוציאליים</AbroadSaid></>, <><AbroadSaid v={f("withdraw")}>בכל עת</AbroadSaid>, אבל לפני <AbroadYears v={f("closes_before")} /> התוכנית בדרך כלל נסגרת</>],
      },
      it: {
        title: (p) => <>באיטליה: תוכנית <bdi dir="ltr">{p}</bdi></>,
        body: (f) => <>תוכנית חיסכון <AbroadSaid v={f("who")}>לתושבי איטליה</AbroadSaid>, שנועדה להפנות חסכונות לחברות שפועלות באיטליה. מי שמחזיק את ההשקעות <AbroadFigure v={f("holding_years")} /> שנים לפחות לא משלם מס על הרווח, <AbroadSaid v={f("investment_rules")}>כל עוד התוכנית עומדת בכללי ההשקעה שבחוק</AbroadSaid>.</>,
        tiles: (f) => [<>עד <AbroadAmount v={f("deposit_limit")} /> בשנה, <AbroadAmount v={f("deposit_total")} bare /> בסך הכול</>, <><AbroadSaid v={f("tax_on_gain")}>אין</AbroadSaid>, אחרי <AbroadYears v={f("holding_years")} /></>, <>לפני <AbroadYears v={f("holding_years")} />: <AbroadSaid v={f("withdraw")}>המס הרגיל, עם ריבית</AbroadSaid></>],
      },
    },
  },
  risks: () => (
    <>
      <p className="max-w-measure">הנכסים מוחזקים בנאמנות, בנפרד מהרכוש של החברה המנהלת, ואי אפשר לעקל אותם. זכויות של <Term id="עמית">עמית</Term> אפשר לעקל רק לפי כללים שהשר קובע. אם החברה המנהלת קורסת, הניהול עובר לחברה אחרת. המדינה לא ערבה לשווי הקופה, והוא עולה ויורד עם ההשקעות של המסלול שבחרתם.</p>
      <RulesLine ids={["PF-29", "REG-18", "REG-19"]} />
    </>
  ),
  use: ({ figure }) => {
    const age = figure("TXK-10", "early_retirement_age");
    return (
      <>
        <Sentence measure>
          חיסכון שצריך להישאר זמין: אין נעילה, ומושכים בכל עת. <Term id="העברת כספים בין מסלולי השקעה">מעבר בין מסלולים</Term> לא ממוסה, ולכן אפשר לשנות את ההשקעה בדרך בלי לשלם מס על הרווח. מגיל {age ? <Num value={age} /> : null} אפשר גם להעביר את הכסף <Term prefix="ל" id="קופת גמל לקצבה">קופת גמל לקצבה</Term>.
        </Sentence>
        <RulesLine ids={["KGL-08", "TXK-04", "TXK-10"]} />
      </>
    );
  },
};

export { RuleRef };
