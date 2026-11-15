// Guide prose for איגרות חוב ממשלתיות (architecture 3.5: prose lives in content files; every figure is a
// Num). Written from the rule base (GOV, TXI, TXS, BRK, REG); the words that state a rule open it (Ruled, D116), and a figure
// from a rule opens it from its sheet. NEW copy for the founder to review (docs/copy.md holds only labels).
import { Link } from "react-router";
import type { GuideContent } from "./types";
import { fmt } from "../../lib/format";
import { IdRef, Num, ProofsChip, Ruled, Term } from "../../components/provenance";
import { Callout, Sentence, TextLink } from "../../components/kit";

export const content: GuideContent = {
  what: ({ figure }) => {
    const floatingEvery = figure("GOV-14", "coupon_every_months");
    const fixedEvery = figure("GOV-13", "coupon_every_months");
    const shortMax = figure("GOV-15", "term_max_months");
    return (
      <>
        <p className="max-w-measure">
          <Term id="איגרת חוב">איגרת חוב</Term> ממשלתית היא הלוואה שאתם נותנים למדינה. המדינה מחזירה את <Term prefix="ה" id="שווי נקוב">שווי הנקוב</Term> במועד <Term prefix="ה" id="פדיון">פדיון</Term>, ובסוגים שמשלמים <Term id="ריבית">ריבית</Term> <Ruled id={["GOV-11", "GOV-13", "GOV-14"]}>היא משלמת בדרך</Ruled> <Term id="קופון">קופון</Term>: ריבית במועדים קבועים.
        </p>
        <Sentence measure>
          <Ruled id="GOV-08">יש שלושה סוגים עיקריים</Ruled>. <Term id={'אג"ח בריבית קבועה'}>בריבית קבועה</Term>: <Term id="לא צמוד">לא צמודה</Term> <Term prefix="ל" id="מדד">מדד</Term>, עם <Ruled id="GOV-13">קופון קבוע</Ruled> שמשולם כל {fixedEvery ? <Num value={fixedEvery} /> : null} חודשים. <Term id={'אג"ח ממשלתית צמודה'}>צמודה למדד</Term>: <Ruled id="GOV-11">הקרן והריבית עולות ויורדות</Ruled> עם <Term id="מדד המחירים לצרכן">מדד המחירים לצרכן</Term>. <Term id={'אג"ח בריבית משתנה'}>בריבית משתנה</Term>: לא צמודה, <Ruled id="GOV-14" prefix="ו">הריבית מתעדכנת</Ruled> כל {floatingEvery ? <Num value={floatingEvery} /> : null} חודשים לפי תשואת <Term prefix="ה" id={'מק"מ'}>מק״מ</Term>, <Ruled id="GOV-14" prefix="ו">בנוסח התקנות אין</Ruled> <Term id="מרווח">מרווח</Term> ואין רצפה.
        </Sentence>
        <p className="max-w-measure">
          באיגרת הצמודה הקרן גדלה או קטנה עם המדד מאז <Term id="מדד הבסיס">מדד הבסיס</Term>, והקופון מחושב על הקרן אחרי <Term prefix="ה" id="הצמדה">הצמדה</Term>. לכן הקופון שלה הוא ריבית מעל עליית המחירים, ולא ריבית בשקלים.
        </p>
        <p className="max-w-measure">
          <span className="font-medium">שמות אחרים.</span> בשמות הנתונים של <Term id="בנק ישראל">בנק ישראל</Term> <Ruled id="GOV-19">האיגרות הקבועות הלא צמודות נקראות</Ruled> <Term id="שחר">״שחר״</Term> והצמודות <Term id="גליל">״גליל״</Term>. בתקנות אלה שמות של סוגים נפרדים, עם תקנות משלהם: <Ruled id="GOV-13">״שחר״ הוא לא השם הקודם</Ruled> של האיגרת <Term prefix="ב" id="ריבית קבועה">ריבית קבועה</Term> של היום, ו״גליל״ הוא לא השם הקודם של הצמודה. כך גם <Term id="גילון חדש">״גילון חדש״</Term>, <Ruled id="GOV-14">סוג ישן של איגרת</Ruled> <Term prefix="ב" id="ריבית משתנה">ריבית משתנה</Term> שכבר לא מונפק. ההבדל חשוב למי שמחזיק סדרה מאחד הסוגים האלה: התנאים שלה הם לפי התקנות של הסוג שלה. <Ruled id={["GOV-11", "GOV-13", "GOV-15"]}>בשם של כל סדרה כתובים</Ruled> חודש ושנת הפדיון שלה.
        </p>
        <p className="max-w-measure">
          יש גם <Term id={'אג"ח ממשלתית קצרה'}>אג״ח ממשלתית קצרה</Term>, {shortMax ? <>עד <Num value={shortMax} /> חודשים, </> : null}בלי ריבית, <Ruled id="GOV-15" prefix="ש">נמכרת מתחת לסכום הפדיון</Ruled> כמו מק״מ. כולן <Term id={'אג"ח סחיר'}>סחירות</Term>: <Ruled id="GOV-17">אפשר למכור אותן</Ruled> בכל יום מסחר <Ruled id="GOV-24">עד יום המסחר האחרון של הסדרה</Ruled>, במחיר השוק של אותו יום, ולא חייבים לחכות לפדיון.
        </p>
        <p className="max-w-measure">
          <span className="font-medium">המחיר אחרי ההנפקה.</span> <Ruled id="GOV-17">האיגרת נסחרת</Ruled> <Term prefix="ב" id="בורסה">בורסה</Term>, והמחיר שלה נקבע מחדש בכל יום מסחר. הוא יכול להיות מעל השווי הנקוב או מתחתיו: מחיר מתחת לשווי הנקוב פירושו שמשלמים פחות ממה שיחזור בפדיון, ומחיר מעליו פירושו שמשלמים יותר, ובשני המקרים מקבלים בדרך גם את הקופונים.
        </p>
        <p className="max-w-measure">
          <Term prefix="ה" id="תשואה לפדיון">תשואה לפדיון</Term> מסכמת את המחיר, הקופונים והשווי הנקוב במספר אחד: <Ruled id="BND-03">כמה תרוויחו בשנה אם תקנו במחיר של היום ותחזיקו עד הפדיון</Ruled>. ככל שהמחיר נמוך יותר, התשואה לפדיון גבוהה יותר. לכן איגרת עם קופון קבוע שקונים במחיר מעל השווי הנקוב מרוויחה בשנה פחות מהקופון שלה, כי בפדיון חוזר רק השווי הנקוב, ואיגרת שקונים מתחת לשווי הנקוב מרוויחה יותר ממנו. באיגרת עם קופונים היא הרווח המדויק רק אם כל קופון מושקע מחדש באותה <Term id="תשואה">תשואה</Term>. <ProofsChip ids={["M-01", "M-02", "M-09"]} />
        </p>
        <p className="max-w-measure">
          באותו יום, איגרות לתקופות שונות נותנות תשואות לפדיון שונות. <Ruled id="BND-06">הקו שמחבר אותן לפי הזמן עד הפדיון</Ruled> נקרא <Term id="עקום התשואות">עקום התשואות</Term>.
        </p>
        <p className="max-w-measure">
          <span className="font-medium">למה המחיר זז.</span> נניח שקניתם איגרת, ואחר כך הריבית במשק עלתה, כך שאיגרות חדשות של המדינה לאותה תקופה משלמות יותר. אף אחד לא ישלם מחיר מלא על האיגרת שלכם כשאפשר לקנות איגרת חדשה שמשלמת יותר. <Ruled id="BND-01">המחיר שלה יורד</Ruled>, עד שמי שקונה אותה מקבל את אותה תשואה לפדיון כמו בחדשה: הקופון שלה נמוך יותר, אבל הוא קונה אותה בזול, והמחיר חוזר לשווי הנקוב בפדיון. כשהריבית יורדת קורה ההפך, והמחיר עולה. זה נכון גם באיגרת בריבית קבועה: קבוע רק הקופון, לא המחיר.
        </p>
        <p className="max-w-measure">
          <span className="font-medium">כמה הוא זז תלוי בזמן שנשאר.</span> איגרת שנגמרת בעוד שנה זזה מעט, כי ההפרש בריבית נוגע רק לשנה אחת. איגרת שנגמרת בעוד עשרים שנה זזה הרבה, כי ההפרש מצטבר על כל השנים. את הזמן הזה מודדים <Term prefix="ב" id={'מח"מ'}>מח״מ</Term>: <Ruled id="BND-05">הזמן הממוצע עד שמקבלים את התשלומים, כשתשלום גדול שוקל יותר</Ruled>. קופונים מקצרים אותו, כי חלק מהכסף חוזר מוקדם. בשינוי קטן, <Ruled id="BND-04">המחיר זז באחוזים בערך כמו המח״מ בשנים כפול השינוי בריבית</Ruled> <Term prefix="ב" id="נקודת אחוז">נקודות אחוז</Term>. בדוגמה בהמשך העמוד אפשר להזיז את הריבית ואת הזמן לפדיון ולראות. החשבון של הפסקה הזו ושל הקודמת מוכח לתשלומים קבועים: באיגרת צמודה הוא חל על התשואה שמעל עליית המחירים, ובאיגרת בריבית משתנה, <Ruled id="GOV-14" prefix="ש">הקופון שלה מתעדכן</Ruled> עם תשואת המק״מ, הוא לא חל בצורה הזו. <ProofsChip ids={["M-01", "M-03"]} />
        </p>
      </>
    );
  },
  who: ({ figure }) => {
    const minOrder = figure("GOV-24", "min_order_government_bond");
    const unit = figure("GOV-24", "trading_unit_face_value");
    return (
      <>
        <p className="max-w-measure">
          המנפיקה היא המדינה, דרך יחידת ניהול החוב הממשלתי במשרד האוצר, <Ruled id="GOV-09" prefix="ב">מכרזים שבועיים</Ruled>. אתם קונים דרך <Ruled id="GOV-10">חשבון ניירות ערך בבנק</Ruled> או <Term prefix="ב" id="בית השקעות">בית השקעות</Term> שהוא <Term id="חבר בורסה">חבר בורסה</Term>, בבורסה בתל אביב, <Ruled id="REG-13" prefix="ש">בפיקוח</Ruled> <Term id="רשות ניירות ערך">רשות ניירות ערך</Term>.
        </p>
        <Sentence measure>
          בבורסה, במסחר הרציף, פקודה היא של {minOrder ? <Num value={minOrder} display={fmt.nisWhole(Number(minOrder.value))} /> : null} לפחות. בשלבים אחרים של יום המסחר, כמו לפני הפתיחה ולפני הנעילה, אפשר גם יחידת מסחר אחת, {unit ? <Num value={unit} display={fmt.nisWhole(Number(unit.value))} /> : null} שווי נקוב. הבנק או בית ההשקעות <Ruled id="GOV-24">יכולים לקבוע בתעריפון מינימום משלהם</Ruled>.
        </Sentence>
        <p className="max-w-measure">
          מכירה לציבור במכרז עצמו <Ruled id="GOV-10">עוברת לפי החוק דרך בנקים וחברי בורסה</Ruled>. איך הזמנה של אדם פרטי מגיעה למכרז, באיזה סכום מינימלי ובאיזו עמלה, לא נמצא. שאלה פתוחה <IdRef id="GOV OQ8" end="." />
        </p>
        <p className="max-w-measure">איגרות ״ערד״ הונפקו רק <Term prefix="ל" id="קרן פנסיה">קרנות פנסיה</Term>, ו״ח״ץ״ הן רק לחברות ביטוח. <Ruled id="GOV-18">אדם פרטי לא יכול לקנות אותן</Ruled>.</p>
      </>
    );
  },
  termIds: ["שווי נקוב", "פדיון", "קופון", "אג\"ח בריבית קבועה", "לא צמוד", "שחר", "אג\"ח ממשלתית צמודה", "גליל", "אג\"ח בריבית משתנה", "גילון חדש", "אג\"ח ממשלתית קצרה", "אג\"ח סחיר", "הפרשי הצמדה", "רווח הון ריאלי", "מס רווחי הון", "ניכוי מס במקור", "מועד קובע לזכאות", "מדד הבסיס", "מטבע חוץ", "איגרת חוב", "הליך תחרותי", "נומינלי", "קרן פנסיה", "רשות ניירות ערך", "חבר בורסה", "קופת גמל בניהול אישי", "רשות שוק ההון ביטוח וחיסכון", "מסלול השקעה", "כספי (שקלי)", "קרן השתלמות", "קופת גמל להשקעה", "דמי חשבון קבועים", "קנס שבירה", "פיקדון", "דמי ניהול פיקדון ניירות ערך", "ריבית משתנה", "ריבית קבועה", "מרווח", 'מק"מ', "מדד המחירים לצרכן", "ריבית", "בורסה", "מדד", "מכירה", "עמלת קנייה ומכירה", "נקודת אחוז", "ציפיות לאינפלציה", "עקום התשואות", "תשואה", "בנק ישראל", "קרן סל", "קרן נאמנות", "דמי ניהול", "קרן נאמנות פטורה", "הרווח הריאלי", 'מח"מ', "תשואה לפדיון"],
  afterTax: ({ figure }) => {
    const unlinked = figure("TXI-15", "rate");
    const linked = figure("TXI-14", "rate");
    return (
      <>
        <Sentence measure>
          <span className="font-medium"><Ruled id="TXI-15">המס תלוי בהצמדה, לא בשם הסדרה</Ruled>.</span> באיגרת לא צמודה, בריבית קבועה או משתנה, על הקופון משלמים מס הכנסה של {unlinked ? <Num value={unlinked} /> : null} מהסכום הנומינלי. על רווח <Term prefix="מ" id="מכירה">מכירה</Term> או מפדיון משלמים <Term id="מס רווחי הון">מס רווחי הון</Term> של עד אותו שיעור מכל הרווח, <Ruled id="TXI-12">בלי ניכוי של האינפלציה</Ruled>.
        </Sentence>
        <Sentence measure>
          באיגרת צמודה במלואה <Term id="הפרשי הצמדה">הפרשי ההצמדה</Term> <Ruled id={["TXI-05", "TXI-14"]}>פטורים ממס</Ruled>, אם הם לא הכנסה מעסק ולא נדרשו עליהם הוצאות ריבית או הצמדה. על הריבית הריאלית <Term prefix="ועל ה" id="רווח הון ריאלי">רווח הריאלי</Term> משלמים עד {linked ? <Num value={linked} /> : null}.
        </Sentence>
        <p className="max-w-measure">
          אם המדד יורד, האתר ממסה את הקופון המוקטן במלואו, ולא מקזז ממנו את ההפסד מההצמדה. בית המשפט המחוזי <Ruled id="TXI-25">לא התיר קיזוז כזה</Ruled> בפיקדון צמוד <Term prefix="ל" id="מטבע חוץ">מטבע חוץ</Term>, ובית המשפט העליון השאיר את השאלה פתוחה. על איגרת חוב הדין הזה חל רק בהיסק מאותו נימוק.
        </p>
        <p className="max-w-measure">
          מס ההכנסה על הקופון <Ruled id={["TXI-14", "TXI-15"]}>מנוכה במקור</Ruled>, ובמכירה <Ruled id="TXS-05">הבנק או חבר הבורסה מבצעים</Ruled> <Term id="ניכוי מס במקור">ניכוי מס במקור</Term> מהרווח.
        </p>
        <Callout tone="blocked" className="max-w-measure">
          <span className="font-medium">קנייה בין מועדי קופון.</span> מי שקונה אחרי <Term prefix="ה" id="מועד קובע לזכאות">מועד הקובע</Term> <Ruled id={["GOV-11", "GOV-13"]}>לא מקבל את הקופון הקרוב</Ruled>, ומי שקונה באמצע תקופה משלם במחיר גם על ריבית שנצברה. <Ruled id="TXI-16">מי שמקבל את הקופון ממוסה גם על הריבית הזאת</Ruled>, בלי פטור, זיכוי, ניכוי או קיזוז, חוץ מפטור שחל על הריבית עצמה, אם זו לא הכנסה מעסק. המשלם מנכה מס הכנסה מכל הקופון. אם יש צו שמחריג איגרות ממשלתיות סחירות, ואיך המחיר ששולם על הריבית הזאת נכנס לעלות, לא נמצא, ולכן האתר לא מחשב את זה. שאלה פתוחה <IdRef id="TXI OQ5" end="." />
        </Callout>
      </>
    );
  },
  risks: () => (
    <>
      <p className="max-w-measure">
        את הקרן והקופונים <Ruled id="GOV-02">משלמת המדינה מהכנסותיה הכלליות</Ruled>, לא הבנק ולא <Term prefix="ה" id="ברוקר">ברוקר</Term>.
      </p>
      <p className="max-w-measure">
        <span className="font-medium">מכירה לפני הפדיון.</span> מי שמחזיק עד הפדיון <Ruled id="BND-02">מקבל את השווי הנקוב</Ruled>, ובאיגרת צמודה <Ruled id="GOV-11">את הקרן אחרי הצמדה</Ruled>. מי שמוכר קודם <Ruled id="GOV-17">מקבל את המחיר בבורסה</Ruled> באותו יום, שיכול להיות נמוך ממה ששילם. ככל שהמח״מ ארוך יותר, הפער יכול להיות גדול יותר.
      </p>
      <p className="max-w-measure">
        <span className="font-medium">החזקה עד הסוף לא מבטלת את ההפסד.</span> אם הריבית עלתה אחרי שקניתם, ההחזקה עד הפדיון מחזירה את השווי הנקוב, אבל הרווח שלכם נמוך ממה שמקבל מי שקנה אחרי העלייה. מי שמכר והשקיע את הכסף בריבית החדשה עד אותו מועד מגיע בסוף לאותו סכום. ההפסד קרה כשהריבית עלתה, וההחזקה רק פורסת אותו על השנים שנשארו. <ProofsChip ids={["M-04"]} />
      </p>
      <p className="max-w-measure">
        <span className="font-medium">הקופונים בדרך.</span> מה שהקופונים ירוויחו תלוי בריבית של הזמן שבו הם מגיעים. <Ruled id="BND-08">אם הריבית תרד, תשקיעו אותם בפחות</Ruled>, ולכן התשואה לפדיון <Ruled id="BND-03">היא הרווח רק אם הריבית לא משתנה</Ruled>. <ProofsChip ids={["M-02"]} />
      </p>
      <p className="max-w-measure">
        <span className="font-medium">אינפלציה.</span> באיגרת לא צמודה הסכום ידוע בשקלים, אבל אם המחירים יעלו יותר ממה שציפו כשקניתם, <Ruled id="BND-09">הכסף יקנה פחות</Ruled>: <Ruled id="BND-11">המדינה תחזיר פחות כוח קנייה ממה ששני הצדדים ציפו</Ruled>. באיגרת צמודה <Ruled id="GOV-12">אין רצפה בתקנות</Ruled>: אם המדד יורד מתחת למדד הבסיס, גם הקרן וגם הריבית קטנות. <ProofsChip ids={["M-07"]} />
      </p>
      <p className="max-w-measure">
        <Ruled id="GOV-16">המדינה יכולה לפדות סדרה מוקדם</Ruled>, <Term prefix="ב" id="הליך תחרותי">הליך תחרותי</Term> ושוויוני שהיא מפרסמת. זו זכות שלה, לא שלכם: מי שרוצה לצאת לפני הפדיון מוכר בבורסה.
      </p>
      <p className="max-w-measure">
        {/* D6: how the account keeps the paper is the account's, said once on its page, not copied here */}
        הנייר מוחזק בחשבון ניירות ערך. איך החשבון שומר על נכסי הלקוחות, ומה קורה אם הבנק או בית ההשקעות קורסים, מוסבר בעמוד של <Link to="/guide/brokerage-account" className="text-link hover:underline">חשבון ניירות ערך</Link>.
      </p>
      <p className="max-w-measure">
        מה עוד לא נמצא: <Ruled id="GOV-13">הנוסח המקורי של התקנות</Ruled> של הסוג ״שחר״, לסדרות שלו שאולי עוד נסחרות <IdRef id="GOV OQ4" end=";" /> ואם לסדרה צמודה מסוימת <Ruled id="GOV-12">יש רצפה בירידת מדד</Ruled> <IdRef id="GOV OQ6" end="." />
      </p>
    </>
  ),
  use: ({ figure }) => {
    const fundRate = figure("TXS-09", "rate");
    const couponRate = figure("TXI-15", "rate");
    const fundBondMonths = figure("MF-29", "max_bond_term_months");
    return (
    <>
      <p className="max-w-measure">
        כסף לתקופה של יותר משנה, כשרוצים תשלום מהמדינה ואפשרות למכור בדרך.
      </p>
      <p className="max-w-measure">
        <span className="font-medium">כסף לתאריך ידוע.</span> כשיודעים מתי צריך את הכסף, <Ruled id="BND-14">אפשר לבחור איגרת שנגמרת בערך באותו מועד</Ruled> ולהחזיק אותה עד הסוף. אז מה שקורה למחיר בדרך <Ruled id="BND-02">לא משנה את מה שתקבלו בפדיון</Ruled>. באיגרת בריבית קבועה <Ruled id="GOV-13">ידוע כמה שקלים תקבלו</Ruled>, ובאיגרת צמודה <Ruled id="GOV-11">הסכום משתנה עם המדד</Ruled>, ולכן ידוע בערך מה הוא יקנה. מי שעלול להצטרך את הכסף קודם יצטרך למכור במחיר של אותו יום, ולכן מתאים לו נייר קצר יותר. <ProofsChip ids={["M-02"]} />
      </p>
      <p className="max-w-measure">
        <span className="font-medium">קבועה או צמודה.</span> בקבועה יודעים כמה שקלים יחזרו, <Ruled id="BND-09">אבל לא מה הם יקנו</Ruled>. בצמודה <Ruled id="GOV-11">הסכום משתנה עם המדד</Ruled>: יודעים בערך מה הכסף יקנה, אבל לא כמה שקלים יהיו. אפשר להשוות בין שתי סדרות לאותה תקופה לפי התשואה לפדיון של כל אחת: הן יוצאות שוות כש<Term prefix="ה" id="אינפלציה">אינפלציה</Term> הממוצעת היא בערך ההפרש בין התשואה של הקבועה לתשואה של הצמודה. אם האינפלציה תצא גבוהה מזה, הצמודה תרוויח יותר, ואם נמוכה, הקבועה. מי שבוחר בקבועה מהמר, בעצם, שהאינפלציה תהיה נמוכה מההפרש. <Ruled id="BND-10">בנק ישראל מחשב מההפרש הזה</Ruled> את <Term prefix="ה" id="ציפיות לאינפלציה">ציפיות לאינפלציה</Term> של השוק ומפרסם אותן.
      </p>
      <p className="max-w-measure">
        שני דברים מזיזים את נקודת השוויון. האיגרת הצמודה משתמשת במדד האחרון שפורסם לפני כל תשלום, ולכן החודשים האחרונים לפני הפדיון לא צמודים. ומס ההכנסה ומס רווחי ההון <Ruled id={["TXI-14", "TXI-15"]}>שונים בשתיהן</Ruled>, כמו שמוסבר בפרק על מיסוי. <ProofsChip ids={["M-06"]} />
      </p>
      <p className="max-w-measure">
        <span className="font-medium">לנעול או לחדש.</span> אפשר לנעול ריבית לכמה שנים באיגרת ארוכה, או לקנות <Ruled id="GOV-03">נייר קצר</Ruled>, כמו מק״מ, ולחדש אותו בכל פדיון. בנייר הקצר המחיר כמעט לא זז, אבל לא יודעים באיזו תשואה תחדשו: <Ruled id="BND-08">אם הריבית תרד, תרוויחו פחות</Ruled>. באיגרת הארוכה הקופון ננעל, אבל מי שמוכר בדרך חשוף לשינויי מחיר גדולים. דרך באמצע היא <Ruled id="BND-12">לחלק את הכסף לכמה איגרות שנגמרות בשנים שונות</Ruled>, כך שבכל שנה רק חלק מהכסף מתחדש, בתשואה של אותה שנה. איגרת בריבית משתנה היא דרך נוספת שלא נועלת ריבית: <Ruled id="GOV-14">הקופון שלה מתעדכן לפי תשואת המק״מ</Ruled>, ולכן עולה ויורד איתה. <ProofsChip ids={["M-08"]} />
      </p>
      <p className="max-w-measure">
        לתקופה של עד שנה, מק״מ או אג״ח ממשלתית קצרה פשוטים יותר: <Ruled id={["GOV-03", "GOV-15"]}>בלי קופונים</Ruled>, <Ruled id="BANK-18" prefix="ו">במק״מ גם בלי</Ruled> <Term id="דמי ניהול פיקדון ניירות ערך">דמי ניהול פיקדון ניירות ערך</Term> בבנק. לעומת <Term id="פיקדון">פיקדון</Term>, <Term prefix="ב" id="איגרת חוב">איגרת חוב</Term> משלמים <Term id="עמלת קנייה ומכירה">עמלות קנייה ומכירה</Term> ודמי ניהול פיקדון ניירות ערך <Ruled id={["BRK-16", "CORP-23"]}>לפי התעריפון של החברה</Ruled>, אבל <Ruled id="GOV-17">אין נעילה</Ruled> ואין <Term id="קנס שבירה">קנס שבירה</Term>.
      </p>
      <p className="max-w-measure">
        עמלות הקנייה והמכירה, <Term prefix="ו" id="דמי חשבון קבועים">דמי חשבון קבועים</Term> אם החברה גובה אותם, <Ruled id={["BRK-16", "BRK-24"]}>נקבעים בידי כל חברה</Ruled>. ראו במדריך: <Link to="/guide/brokerage-account" className="text-link hover:underline">חשבון ניירות ערך</Link>.
      </p>
      {/* D6: the two government-bond exposure pages folded into this one; what they said about holding bonds without buying them */}
      <p className="max-w-measure">
        אפשר להחזיק איגרות חוב ממשלתיות גם בעקיפין. <Link to="/guide/money-market-fund-daily" className="text-link hover:underline">קרן כספית</Link> <Ruled id="MF-29">יכולה להחזיק איגרות לא צמודות</Ruled> שנותרו להן עד {fundBondMonths ? <Num value={fundBondMonths} /> : null} חודשים לפדיון, איגרות כאלה בריבית משתנה שמתעדכנת לפחות פעמיים בשנה, ואיגרות ארוכות יותר שאפשר לפדות לפחות פעמיים בשנה, אבל לא איגרות צמודות למדד. <Term prefix="ב" id="קופת גמל להשקעה">קופת גמל להשקעה</Term> <Term prefix="וב" id="קרן השתלמות">קרן השתלמות</Term> <Ruled id={["CAT-18", "CAT-48"]}>יש מסלולים שמתמחים</Ruled> באג״ח ממשלתית, ומסלול ״<Term id="כספי (שקלי)">כספי (שקלי)</Term>״ שלפי רשימת <Term id="מסלול השקעה">מסלולי ההשקעה</Term> של <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון</Term> <Ruled id="CAT-23">מחזיק גם מלוות ממשלה בשקלים</Ruled>. בחשבון <Term prefix="ב" id="קופת גמל בניהול אישי">ניהול אישי</Term> <Ruled id="IRA-11">קונים אותן ישירות</Ruled>, כמו בחשבון ניירות ערך.
      </p>
      <Sentence measure>
        <span className="font-medium">ישירות או דרך קרן.</span> במקום לקנות סדרה, אפשר לקנות <Term id="קרן סל">קרן סל</Term> או <Term id="קרן נאמנות">קרן נאמנות</Term> שמשקיעה באיגרות ממשלתיות. מה שנאמר כאן על החזקה עד הפדיון נאמר על איגרת; מועד פדיון לקרן רגילה לא נמצא בכללים שהאתר קרא. יורדים בה <Term id="דמי ניהול">דמי ניהול</Term> <Ruled id="MF-16">בכל שנה, כאחוז מהנכסים</Ruled>, והמס שונה: <Term prefix="ב" id="קרן נאמנות פטורה">קרן פטורה</Term> <Ruled id="TXS-08">הקופונים לא ממוסים בתוך הקרן</Ruled>, ובמכירה משלמים עד {fundRate ? <Num value={fundRate} /> : null} <Term prefix="מ" id="הרווח הריאלי">הרווח הריאלי</Term>, ובאיגרת לא צמודה שמחזיקים ישירות משלמים על כל קופון {couponRate ? <Num value={couponRate} /> : null} מהסכום <Term prefix="ה" id="נומינלי">נומינלי</Term>. יש גם קרן <Ruled id="MF-59">שהסכם הקרן שלה קובע את תקופת הקיום שלה</Ruled>, ובסופה היא מתפרקת: ראו <TextLink to="/guide/limited-bond-fund">קרן אג״ח שתקופת קיומה מוגבלת</TextLink>.
      </Sentence>
    </>
    );
  },
};
