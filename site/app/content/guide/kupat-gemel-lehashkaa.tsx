// Guide prose for קופת גמל להשקעה (architecture 3.5: prose lives in content files; every figure is a
// Num). Checked against the rule base; the words that state a rule open it (Ruled, D116), and a figure
// from a rule opens it from its sheet (docs/copy.md holds only labels).
import type { GuideContent } from "./types";
import { fmt } from "../../lib/format";
import { IdRef, Num, Ruled, Term } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";
import { OpenLossOffset } from "./open-tax";
import { AbroadAmount, AbroadFigure, AbroadPeriod, AbroadSaid, AbroadYears } from "./abroad-parts";

export const content: GuideContent = {
  what: ({ figure }) => {
    const ceiling = figure("KGL-03", "ceiling");
    const rate = figure("TXK-07", "rate");
    return (
    <>
      <p className="max-w-measure">
        אתם מפקידים לקופה בעצמכם, עד {ceiling ? <Num value={ceiling} /> : "התקרה"} <Ruled id="KGL-02">בשנה, בכל הקופות שלכם יחד</Ruled>. הכסף מושקע <Term prefix="ב" id="מסלול השקעה">מסלול השקעה</Term> שבוחרים, ומי שלא בוחר <Ruled id="KGL-11">מצורף</Ruled> <Term prefix="ל" id="מסלול ברירת מחדל">מסלול ברירת המחדל</Term> של הקופה.
      </p>
      <p className="max-w-measure">
        <Ruled id="TXK-03">על הרווחים בתוך הקופה לא משלמים מס</Ruled>. מס הכנסה משלמים רק כש<Term id="משיכה">מושכים</Term>, <Ruled id="TXK-05" prefix="ו">רק על הרווח</Ruled>: עד {rate ? <Num value={rate} /> : "השיעור המרבי"} <Term prefix="מ" id="הרווח הריאלי">הרווח הריאלי</Term>.
      </p>
      <p className="max-w-measure">
        בחוק ובכללים <Ruled id="KGL-06">לא נמצא תנאי גיל או תושבות לפתיחה</Ruled>. זו קריאה של מה שהם לא אומרים, לא כלל כתוב. שאלה פתוחה <IdRef id="KGL OQ6" end="." /> <Term prefix="ה" id="חברה מנהלת">חברה המנהלת</Term> מחליטה אם לקבל בקשת הצטרפות.
      </p>
      <p className="max-w-measure">
        בגרף שלמטה דמי הניהול הם אלה שכתובים במסמכים של החברה שבדוגמה: <Ruled id="PF-13" prefix="ה">שיעור המוזל</Ruled> <Term prefix="ב" id="תקופת ההנחה">תקופת ההנחה</Term>, ואחריה התקרה שבתקנות, שעד אליה <Ruled id="PF-02">מותר לחברה לגבות</Ruled>. כמה <Term prefix="ה" id="עמית">עמיתים</Term> שילמו בממוצע בכל מסלול כתוב בחלק על העלויות.
      </p>
    </>
    );
  },
  who: () => (
    <>
      <p className="max-w-measure">
        חברות מנהלות של <Term id="קופת גמל">קופות גמל</Term>, <Ruled id="REG-17" prefix="ב">פיקוח</Ruled> <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון, ביטוח וחיסכון</Term>. לכל חברה יש עמוד עם כל המסלולים שלה.
      </p>
    </>
  ),
  switchLine: (
    <>
      בלי מס הכנסה, <Ruled id="TXK-04">לפי הקריאה של האתר</Ruled>. אפשר גם לעבור לקופת גמל להשקעה אחרת, <Ruled id="KGL-10">עם כל היתרה או עם חלק ממנה</Ruled>.
    </>
  ),
  omitSwitchInTax: true,
  companiesOpen: true,
  termIds: ["מסלול השקעה", "מסלול ברירת מחדל", "הרווח הריאלי", "תקופת ההנחה", "משיכה", "חברה מנהלת", "קופת גמל לקצבה", "קצבה", "עמית", "מקדם המרה", "רשות שוק ההון ביטוח וחיסכון", "העברת כספים בין מסלולי השקעה", "קופת גמל", "תשואה", "אינפלציה", "שכר נאמן", "דמי ניהול", "חשבון ניירות ערך", "דמי ניהול מהפקדה", "דוח שנתי", "החזר מס", "רשות המסים"],
  afterTax: ({ figure }) => {
    const age = figure("PEN-26", "early_retirement_age");
    const sixty = figure("TXG-04", "age");
    const rate = figure("TXK-06", "rate");
    const withheld = figure("TXK-26", "withholding_on_gains");
    const regulationRate = figure("TXK-26", "regulation_text_rate");
    const proposedCap = figure("TXK-21", "proposed_cap");
    const reportDate = figure("TXK-21", "report_date");
    return (
      <>
        {proposedCap ? (
          <Callout tone="caution" className="max-w-measure">
            <span className="font-medium">המלצה, לא חוק.</span> צוות של משרד האוצר המליץ{reportDate ? <> <Num value={reportDate} prefix="ב" /></> : null} על <Ruled id="TXK-21">חשבון השקעות עם הטבת מס</Ruled>, עם תקרה אחת של <Num value={proposedCap} display={fmt.nisWhole(Number(proposedCap.value))} /> לאדם. מעל התקרה ההטבות של היום היו מסתיימות. זה יכול לשנות את הכדאיות של המוצר, אבל לא נמצאה הצעת חוק.
          </Callout>
        ) : null}
        <Callout tone="blocked" className="max-w-measure">
          <span className="font-medium">מגיל {age ? <Num value={age} /> : null} <Ruled id="KGL-09">אפשר להעביר את הכסף</Ruled> <Term prefix="ל" id="קופת גמל לקצבה">קופת גמל לקצבה</Term>.</span> הכסף נכנס שם למסלול למקבלי <Term id="קצבה">קצבה</Term>, לקבלת קצבה בלבד. לפי טיוטת הבהרה מ־<bdi>2020</bdi> של הממונה על שוק ההון, ביטוח וחיסכון, אחרי ההעברה <Ruled id="PEN-71">אי אפשר לבטל את הבחירה בקצבה</Ruled>, למשל במשיכה בסכום חד־פעמי. את הקצבה האתר עוד לא מחשב, כי חסרים <Term id="מקדם המרה">מקדמי ההמרה</Term>. שאלה פתוחה <IdRef id="PEN OQ7" end="." />
        </Callout>
        <Callout tone="caution" className="max-w-measure">
          <span className="font-medium">מגיל {sixty ? <Num value={sixty} /> : null} המס על הרווח יכול להיות נמוך יותר.</span> {rate ? <Num value={rate} /> : "השיעור על הרווח"} הוא <Ruled id="TXG-07">תקרה, לא שיעור קבוע</Ruled>. מגיל {sixty ? <Num value={sixty} /> : null} <Ruled id="TXG-04">חלות על ההכנסה מדרגות המס הנמוכות</Ruled>, ואם המדרגה נמוכה מהתקרה, משלמים לפיה. הרווח <Ruled id="TXK-06">נספר כחלק העליון של ההכנסה</Ruled>, ולכן זה עוזר רק כשהכנסות אחרות לא ממלאות את המדרגות הנמוכות. כשמזינים גיל, האתר מחשב את ההקלה לפי ההכנסה השנתית שבחישוב.
        </Callout>
        <Sentence measure>
          החברה המנהלת <Ruled id="TXK-26">מנכה במקור</Ruled> {withheld ? <Num value={withheld} /> : "מס"} מהרווח, ולא מנכה כלום מהסכום שהופקד <Term prefix="ומה" id="הצמדה">הצמדה</Term> עליו. השיעור הזה כתוב בקובץ <Term prefix="ש" id="רשות המסים">רשות המסים</Term> מפרסמת לגופים שמנכים במקור. בתקנות, כפי שפורסמו, השיעור {regulationRate ? <Num value={regulationRate} /> : "נמוך יותר"}. האתר לא מצא את ההוראה שקובעת את השיעור שבקובץ. זו מקדמה: את מה שנוכה יותר מדי מקבלים בחזרה רק <Term prefix="ב" id="דוח שנתי">דוח שנתי</Term> או בבקשה <Term prefix="ל" id="החזר מס">החזר מס</Term>.
        </Sentence>
        {/* whether a deposit fee is part of the principal the gain is measured from is open (TXK-05 does not settle it); the ledger
            records each deposit after its fee (F-08), so the fee is taxed as gain */}
        <p className="max-w-measure">
          לא ידוע אם <Term id="דמי ניהול מהפקדה">דמי הניהול מההפקדה</Term> נחשבים חלק מהסכום שהופקד. בחישוב בעמוד הם לא נחשבים חלק ממנו, ולכן מס ההכנסה מחושב גם עליהם, כמו על רווח.
        </p>
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
          const age = figure("PEN-26", "early_retirement_age");
          return (
            <>
              חשבון חיסכון והשקעה עם הטבת מס, <AbroadSaid v={f("who")}>לתושבי בריטניה</AbroadSaid> מגיל <AbroadFigure v={f("min_age")} />. ההבדל מקופת גמל להשקעה: משיכה בכל גיל, גם של הכול בבת אחת, פטורה ממס על הרווח. בקופת גמל להשקעה <Ruled id="TXK-05">משלמים מס הכנסה על הרווח במשיכה חד־פעמית בכל גיל</Ruled>, ומגיל {age ? <Num value={age} /> : null} הוא <Ruled id={["TXK-12", "TXK-09"]}>פטור רק כשהכסף עובר לקצבה</Ruled>.
            </>
          );
        },
        tiles: (f) => [<>עד <AbroadAmount v={f("deposit_limit")} /> בשנת המס <AbroadPeriod v={f("deposit_limit")} /></>, <AbroadSaid v={f("tax_on_gain")}>אין</AbroadSaid>, <AbroadSaid v={f("withdraw")}>בכל עת</AbroadSaid>],
      },
      us: {
        title: (p) => <>בארצות הברית: חשבון <bdi dir="ltr">{p}</bdi></>,
        body: (f, { figure }) => {
          const age = figure("PEN-26", "early_retirement_age");
          return (
            <>
              חשבון חיסכון לפרישה. מפקידים בו <AbroadSaid v={f("who")}>עד גובה ההכנסה מעבודה באותה שנה</AbroadSaid>, ולפי ההכנסה ואופן הגשת הדוח לפעמים פחות. כמו בקופת גמל להשקעה, <Ruled id="TXK-01">ההפקדה לא מורידה את מס ההכנסה</Ruled>. ההבדל: מגיל <AbroadFigure v={f("withdraw")} />, אחרי <AbroadFigure v={f("account_years")} /> שנים לפחות מתחילת השנה של ההפקדה הראשונה, גם משיכה של הכול בבת אחת פטורה ממס הכנסה, כולל הרווח. בקופת גמל להשקעה, מגיל {age ? <Num value={age} /> : null} הרווח <Ruled id={["TXK-12", "TXK-09"]}>פטור ממס הכנסה רק כשהכסף עובר לקצבה</Ruled>.
            </>
          );
        },
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
      <p className="max-w-measure">הנכסים <Ruled id="PF-29">מוחזקים בנאמנות</Ruled>, בנפרד מהרכוש של החברה המנהלת, ואי אפשר לעקל אותם. זכויות של עמית <Ruled id="PF-48">אפשר לעקל רק לפי כללים שהשר קובע</Ruled>. אם החברה המנהלת קורסת, הניהול <Ruled id="REG-19">עובר לחברה אחרת</Ruled>. המדינה לא ערבה לשווי הקופה, והוא עולה ויורד עם ההשקעות של המסלול שבחרתם.</p>
    </>
  ),
  use: ({ figure }) => {
    const age = figure("PEN-26", "early_retirement_age");
    return (
      <>
        <Sentence measure>
          חיסכון שצריך להישאר זמין: אין נעילה, <Ruled id="KGL-08" prefix="ו">מושכים בכל עת</Ruled>. <Term id="העברת כספים בין מסלולי השקעה">מעבר בין מסלולים</Term> לא ממוסה, <Ruled id="TXK-04">לפי הקריאה של האתר</Ruled>, ולכן אפשר לשנות את ההשקעה בדרך בלי לשלם מס הכנסה על הרווח. מגיל {age ? <Num value={age} /> : null} <Ruled id="KGL-09">אפשר גם להעביר את הכסף</Ruled> <Term prefix="ל" id="קופת גמל לקצבה">קופת גמל לקצבה</Term>.
        </Sentence>
      </>
    );
  },
};
