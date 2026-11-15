// Guide prose for פיקדון (architecture 3.5: prose lives in content files; every figure is a Num).
// Written from the il-finance rules (BANK, TXI, REG, MF); the words that state a rule open it (Ruled, D116), and a figure from a
// rule opens it from its sheet. Same shape and register as kupat-gemel-lehashkaa.tsx. NEW copy for the founder to review.
import type { ReactNode } from "react";
import type { GuideContent } from "./types";
import { YearOf } from "./year";
import type { BreakTerms } from "../../lib/guide-signature";
import { IdRef, Num, Ruled, Term, VariesByCompany } from "../../components/provenance";
import { Link } from "react-router";
import { depositBrowser } from "../../copy";
import { Callout, MixedName, Sentence, TextLink } from "../../components/kit";

export const content: GuideContent = {
  what: ({ figure }) => {
    const types = figure("BANK-14", "standard_deposit_types");
    return (
      <>
        <p className="max-w-measure">
          <Ruled id="BANK-14">התקופה יכולה להיות מיום אחד ועד כמה שנים</Ruled>. <Term prefix="ה" id="ריבית">ריבית</Term> <Term id="ריבית קבועה">קבועה</Term> <Ruled id="BANK-25" prefix="ו">ידועה מראש</Ruled>, או <Term id="ריבית משתנה">משתנה</Term>, כלומר <Term id="ריבית עוגן">ריבית עוגן</Term> ועוד או פחות <Term id="מרווח">מרווח</Term> <Ruled id="BANK-47">ידוע מראש</Ruled>. בסוף התקופה הכסף חוזר <Term prefix="ל" id="חשבון עובר ושב">עו״ש</Term> או <Term id="חידוש אוטומטי">מתחדש אוטומטית</Term>, <Ruled id="BANK-05">לפי מה שבחרתם</Ruled>.
        </p>
        {/* D30: "usually prime" is the Bank of Israel's word (BANK-47); each bank's definition of prime is its own term (BANK-34, ten banks) */}
        <p className="max-w-measure">
          <VariesByCompany ids={[{ rule: "BANK-34", companies: ["leumi", "hapoalim", "discount", "mercantile", "mizrahi-tefahot", "fibi", "massad", "yahav", "jerusalem", "one-zero"] }]} lead={<>העוגן הוא בדרך כלל <Term id="ריבית הפריים">ריבית הפריים</Term>, וכל בנק <Ruled id="BANK-46">מגדיר אותה בתנאים שלו</Ruled></>} end="." />
        </p>
        <p className="max-w-measure">
          פיקדון <Term id="לא צמוד">לא צמוד</Term> מחזיר את הקרן ועוד ריבית, גם אם המחירים עלו. פיקדון <Term id="צמוד למדד המחירים לצרכן">צמוד למדד</Term> מעדכן את הקרן לפי <Term prefix="ה" id="מדד">מדד</Term>, והריבית באה בנוסף. אם המדד יורד, <Ruled id="BANK-26">מה שקורה לקרן תלוי בתנאי המוצר</Ruled> (<Term id="הבטחת קרן">הבטחת קרן</Term>), וההסכם שלו חייב לציין זאת.
        </p>
        <Sentence measure>
          כדי שאפשר יהיה להשוות, <Ruled id="BANK-13">כל בנק חייב לפרסם טבלה אחידה</Ruled> של {types ? <Num value={types} /> : null} <Term id="סוגי הפיקדונות השקליים המקובלים">סוגי פיקדון מקובלים</Term>. לכל סוג מופיעים <Term id="שיעור הריבית המוצעת">הריבית המוצעת</Term>, לשנה ולפני מס, אפשרות <Term prefix="ה" id="שבירת פיקדון">שבירה</Term>, ובסוגים של שנה ומעלה גם <Term id="תחנת יציאה">תחנות היציאה</Term>.
        </Sentence>
      </>
    );
  },
  who: ({ figure }) => {
    const since = figure("BANK-21", "in_force_from");
    return (
      <>
        <p className="max-w-measure">
          <Ruled id="REG-03">כל הבנקים שברשימת</Ruled> <Term id="בנק ישראל">בנק ישראל</Term>, <Ruled id="REG-01">בפיקוח</Ruled> <Term id="המפקח על הבנקים">המפקח על הבנקים</Term>. בנק <Ruled id="BANK-01">לא יכול לסרב לקבל פיקדון</Ruled> בלי סיבה סבירה.
        </p>
        {/* D92: the comparison of the banks' deposits is a page of its own; the guide links to it where it names the banks */}
        <TextLink to="/deposits" look="line">
          {depositBrowser.guideLink}
        </TextLink>
        <Sentence measure>
          {since ? <>מאז <Num value={since} /> </> : null}<Ruled id="BANK-21">אפשר לפתוח פיקדון שקלי גם בבנק אחר</Ruled>, בלי לפתוח בו עו״ש, דרך <Term id="חשבון במערכת סגורה">חשבון במערכת סגורה</Term>: הכסף מגיע רק מהחשבון שלכם בבנק אחר וחוזר רק אליו. החוק פוטר מהחובה הזו בנק שהיקף הפעילות שלו קטן או זעיר, לפי חלקו בנכסים של כל הבנקים. אילו בנקים פטורים היום, האתר עוד לא בדק. <IdRef id="BANK OQ5" />
        </Sentence>
      </>
    );
  },
  termIds: [
    "ריבית קבועה",
    "ריבית משתנה",
    "ריבית הפריים",
    "חידוש אוטומטי",
    "סוגי הפיקדונות השקליים המקובלים",
    "שיעור הריבית המוצעת",
    "שבירת פיקדון",
    "קנס שבירה",
    "תחנת יציאה",
    "לא צמוד",
    "צמוד למדד המחירים לצרכן",
    "הבטחת קרן",
    "חשבון במערכת סגורה",
    "ביטוח פיקדונות",
    "פטור למעוט הכנסה",
    "מוצרי שוק הכסף",
    "תיאום מס",
    "מנהל מורשה",
    "מס רווחי הון",
    "מדד המחירים לצרכן",
    "דיבידנד",
    "רווח הון",
    "נייר ערך",
    "המפקח על הבנקים",
    "ריבית בנק ישראל",
    "קרנות כספיות יומיות",
    'מק"מ',
    "קרן כספית",
    "חשבון עובר ושב",
    "מרווח",
    "ריבית עוגן",
    "ריבית",
    "מדד",
    "הצמדה",
    "הפרשי הצמדה",
    "רשות המסים",
    "תוכנית חיסכון",
  ],
  // the chart runs one amount (lumpSumIds): a deposit is opened with one sum, and periodic deposits are a savings plan's (BANK-28)
  lumpNote: (
    <>
      להפקדה חודשית בבנק יש מוצר משלה, <Term id="תוכנית חיסכון">תוכנית חיסכון</Term>.{" "}
      <Link to="/guide/savings-plan" className="text-link hover:underline">
        לעמוד המדריך על תוכנית חיסכון
      </Link>
    </>
  ),
  afterTax: ({ figure, breakTerms }) => {
    const ceiling = figure("TXI-20", "favoured_ceiling");
    const deduction = figure("TXI-20", "deduction");
    return (
      <>
        <Sentence measure>
          למי שההכנסה שלו ושל בן או בת הזוג {ceiling ? <>עד <Num value={ceiling} /> </> : "נמוכה "}בשנה יש <Term id="פטור למעוט הכנסה">פטור למעוט הכנסה</Term>{deduction ? <>: עד <Num value={deduction} /> בשנה</> : null} מהריבית על פיקדונות ותוכניות חיסכון<YearOf v={ceiling ?? deduction} plural />. <Ruled id="TXI-20">מעל התקרה הפטור הולך וקטן</Ruled>. בדוח השנתי הוא מחושב אוטומטית, ובמהלך השנה מקבלים אותו <Term prefix="ב" id="תיאום מס">תיאום מס</Term>.
        </Sentence>
        <Sentence measure>
          הפסד ממכירת <Term id="נייר ערך">ניירות ערך</Term> <Ruled id="TXI-17">לא מתקזז מריבית על פיקדון</Ruled>. הוא מתקזז <Term prefix="מ" id="רווח הון">רווח הון</Term>, ובאותה שנה גם מריבית או <Term id="דיבידנד">דיבידנד</Term> על ניירות ערך, ופיקדון בנקאי הוא לא נייר ערך.
        </Sentence>
        <Sentence measure>
          פיקדון בריבית משתנה לפי הפריים <Ruled id="TXI-04">ממוסה כפיקדון לא צמוד</Ruled>, על כל הריבית: בחוק ״מדד״ הוא <Term id="מדד המחירים לצרכן">מדד המחירים לצרכן</Term> או שער מטבע, והפריים לא אחד מהם.
        </Sentence>
        {breakTerms ? <BreakLine b={breakTerms} /> : null}
        <Callout tone="blocked" className="max-w-measure" title={<>מס הכנסה או <Term id="מס רווחי הון">מס רווחי הון</Term> כששבירה פוגעת בסכום שהופקד: שאלה פתוחה</>}>
          אף מקור לא אומר מה קורה במס הכנסה או במס רווחי הון כששבירה מוחקת גם חלק מהסכום שהופקד. ידוע שהבנק <Ruled id="TXI-07">מנכה מס הכנסה מהריבית שהוא משלם בפועל</Ruled>. פיקדון צמוד שנשבר לפני הסוף, כך <Term prefix="ש" id="הפרשי הצמדה">הפרשי ההצמדה</Term> לא שולמו במלואם, <Ruled id="TXI-07">ממוסה על כל ההכנסה ממנו בשיעור של פיקדון לא צמוד</Ruled>: כך כתוב בחוזר של <Term id="רשות המסים">רשות המסים</Term>, ולפי קריאה של האתר בלשון הפקודה היום הכלל עדיין חל. <IdRef id="TXI OQ14" />
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
          אין בישראל <Term id="ביטוח פיקדונות">ביטוח פיקדונות</Term>: אם בנק קורס, <Ruled id="BANK-23">אין חוק שמחזיר לכם את הכסף</Ruled>. נגיד בנק ישראל יכול למנות לבנק <Term id="מנהל מורשה">מנהל מורשה</Term>, ובאישור הממשלה גם <Ruled id="REG-06">להכריז על ערבות לפיקדונות</Ruled>. המנהל המורשה יכול, באישור הנגיד, להעביר את נכסי הבנק והתחייבויותיו. אלה סמכויות שלהם, לא זכויות שלכם.
        </p>
        <Sentence measure>
          חוק משנת 2026 <Ruled id="REG-04">מחייב את שר האוצר ואת הנגיד לבחון</Ruled> {months ? <>תוך <Num value={months} /> חודשים </> : null}אם צריך ביטוח פיקדונות; זו חובת בדיקה, לא ביטוח. הצעת חוק פרטית לביטוח פיקדונות <Ruled id="REG-05">פקעה</Ruled> כשהכנסת החדשה התכנסה{lapsed ? <> <Num value={lapsed} prefix="ב־" /></> : null}.
        </Sentence>
        <p className="max-w-measure">פיקדון בריבית משתנה <Ruled id="BANK-25">זז עם ריבית העוגן שלו</Ruled>. פיקדון לא צמוד לא מגן מפני עליית מחירים.</p>
      </>
    );
  },
  use: () => (
    <>
      <p className="max-w-measure">
        כסף שיודעים מתי יצטרכו אותו, ורוצים עליו ריבית בלי תנודות. בוחרים תקופה שמתאימה למועד, או פיקדון עם תחנות יציאה אם המועד לא בטוח. כדי להשוות, בבנק שאפשר לקנות דרכו <Term id="קרן כספית">קרנות כספיות</Term> או <Term id={'מק"מ'}>מק״מ</Term>, <Ruled id="BANK-15">הפיקדונות מוצגים יחד איתם</Ruled> תחת <Term id="מוצרי שוק הכסף">מוצרי שוק הכסף</Term>, בלי העדפה של אף מוצר.
      </p>
      <p className="max-w-measure">
        פיקדון עדיף על <Term id="קרנות כספיות יומיות">קרן כספית יומית</Term> כשרוצים לדעת את הריבית ביום ההפקדה: בפיקדון בריבית קבועה <Ruled id="BANK-25">היא ידועה מראש, וההסכם חייב לומר אם הבנק רשאי לשנות אותה ובאילו תנאים</Ruled>, ובקרן היומית <Term prefix="ה" id="תשואה">תשואה</Term> <Ruled id={["MF-34", "MF-41"]}>לא ידועה מראש וזזה עם</Ruled> <Term id="ריבית בנק ישראל">ריבית בנק ישראל</Term>.
      </p>
    </>
  ),
};

// F-104: what the collected one-year deposits say about breaking them, counted over the banks (former ground rule 2: a bank whose rows were
// collected in larger number does not weigh more). The count of the banks where none can be broken names none of them (D30); the banks
// whose deposits can be broken are named, because the penalty is each bank's own term, and stand as links to their pages, where their
// terms are (VariesByCompany). No penalty in shekels (method F-104): Discount's is set on the day of the break, and One Zero's is a share of
// the interest accrued to that day. What a bank's own terms say about the penalty, from the rule base (BANK-33 for Discount: approval, the
// day's borrowers' rate table, no partial break in the first year; BANK-49 for One Zero: 10% of the accrued interest). They stand on that bank's line, right after its count and under its name, so no other bank's
// line reads them as its own (D30): "a break can wipe out the interest and part of the deposit" is Discount's term, not every bank's.
// A bank the rule base holds no break terms for (Mercantile, whose records cite only the general BANK-06 and BANK-14) has its count alone.
/** A bank's break terms worded from its own documents (Discount's: BANK-33, One Zero's: BANK-49, which their records cite in their break column). */
const ownTerms: Record<string, ReactNode> = {
  discount: (
    <>
      השבירה צריכה אישור של הבנק, ופיקדון לשנה אפשר לשבור רק כולו, לא חלק ממנו. הקנס נקבע רק ביום השבירה, לפי ״טבלת ריבית לווים״ של הבנק, שמתעדכנת כל יום לפי סוג הפיקדון והתקופה שנשארה לו, ולכן הסכום שלו לא ידוע מראש. בתנאי הבנק, שבירה יכולה למחוק את הריבית ואף חלק מהסכום שהופקד.
    </>
  ),
  "one-zero": (
    <>
      בטבלת התנאים של הבנק, מי ששובר חיסכון שנתי מקבל ״10% מהריבית הצבורה עד למועד השבירה בפועל״. הטבלה לא אומרת מה קורה בשבירה לסכום שהופקד.
    </>
  ),
};

function BankBreakLine({ b }: { b: BreakTerms["breakable"][number] }) {
  const n = Number(b.deposits.value);
  const pen = Number(b.withPenalty.value);
  const free = Number(b.free.value);
  const all = pen === n || free === n;
  return (
    <>
      {" "}ב<MixedName>{b.name}</MixedName> אפשר לבקש לשבור{" "}
      {all ? (
        <>כל אחד מהפיקדונות לשנה שנאספו, {pen === n ? <>עם <Term id="קנס שבירה">קנס</Term></> : "בלי קנס"}.</>
      ) : pen > 0 ? (
        <>
          עם <Term id="קנס שבירה">קנס</Term>, <Num value={b.withPenalty} /> מתוך <Num value={b.deposits} /> הפיקדונות לשנה שנאספו
          {free > 0 ? <>, ו־<Num value={b.free} /> בלי קנס</> : null}.
        </>
      ) : (
        <>
          בלי קנס, <Num value={b.free} /> מתוך <Num value={b.deposits} /> הפיקדונות לשנה שנאספו.
        </>
      )}
      {pen > 0 && ownTerms[b.id] ? <> {ownTerms[b.id]}</> : null}
    </>
  );
}

function BreakLine({ b }: { b: BreakTerms }) {
  const locked = Number(b.lockedBanks.value);
  const all = locked === Number(b.banks.value);
  const penalty = b.breakable.filter((x) => Number(x.withPenalty.value) > 0);
  // each bank under the break rules its own records cite; a general rule among them names no company, so it adds no link
  const refs = penalty.flatMap((x) => x.rules.map((rule) => ({ rule, companies: [x.id] })));
  return (
    <>
      <Sentence measure>
        <span className="font-medium">שבירת פיקדון לפני הזמן.</span>{" "}
        {locked > 0 ? (
          <>
            {/* a sentence opens on a word, not a number (docs/copy.md 10.4) */}
            {all ? <>בכל </> : <>מתוך </>}
            <Num value={b.banks} /> הבנקים שהאתר אסף מהם פיקדונות לשנה
            {all ? " " : <>, ב־<Num value={b.lockedBanks} /> </>}אי אפשר לשבור אף פיקדון לשנה שנאסף: הכסף חוזר רק בסוף התקופה
            {Number(b.lockedBanksWithExits.value) > 0 ? (
              <>
                , ובחלק מהפיקדונות גם ב<Term id="תחנת יציאה">תחנת יציאה</Term>.
              </>
            ) : (
              "."
            )}
          </>
        ) : null}
        {b.breakable.map((x) => (
          <BankBreakLine key={x.id} b={x} />
        ))}
      </Sentence>
      {penalty.length > 0 && (
        <Sentence measure>
          האתר לא מציג את הקנס בשקלים.{" "}
          <VariesByCompany ids={refs} lead="תנאי השבירה בעמוד הבנק" end="." />
        </Sentence>
      )}
    </>
  );
}
