// Guide prose for חשבון עובר ושב (architecture 3.5: prose lives in content files; every figure is a Num).
// Written 2026-10-23 from the il-finance rules cited under each block (BANK, TXI, REG, SW, MF); same shape
// and register as kupat-gemel-lehashkaa.tsx. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { Callout, Sentence } from "../../components/kit";

export const content: GuideContent = {
  what: ({ figure }) => {
    const threshold = figure("BANK-20", "credit_balance_threshold");
    const basicTeller = figure("BANK-17", "basic_teller_actions");
    const basicDirect = figure("BANK-17", "basic_direct_actions");
    const extendedTeller = figure("BANK-17", "extended_teller_actions");
    const extendedDirect = figure("BANK-17", "extended_direct_actions");
    const basicCap = figure("BANK-17", "basic_track_max_fee");
    return (
      <>
        <p className="max-w-measure">
          <Term id="חשבון עובר ושב">חשבון הבנק השוטף</Term>: המשכורת נכנסת אליו וההוצאות יוצאות ממנו. לא כל בנק משלם <Term id="ריבית על יתרת זכות">ריבית על יתרת זכות</Term>; בנק שמשלם חייב להציג את התנאים, ובנק שלא משלם חייב לכתוב זאת בטבלת הריביות שלו. על ריבית שכן משולמת הבנק מנכה מס כבר כשהיא נזקפת לחשבון.
        </p>
        <Sentence measure>
          אם <Term id="יתרת זכות בחשבון">יתרת הזכות</Term> נשארת {threshold ? <>מעל <Num value={threshold} /> </> : "מעל הסף שקבוע בחוק "}רבעון שלם, הבנק חייב לשלוח לכם הודעה שמפנה לחלופות שעשויות להניב יותר.
        </Sentence>
        <Sentence measure>
          העלות היא מסלול העמלות: <Term prefix="ה" id="מסלול בסיסי">מסלול הבסיסי</Term> כולל {basicTeller ? <>עד <Num value={basicTeller} /> פעולה בפקיד ו</> : null}
          {basicDirect ? <>עד <Num value={basicDirect} /> פעולות בערוץ ישיר בחודש</> : "מעט פעולות בחודש"}, <Term prefix="ה" id="מסלול מורחב">מורחב</Term>{" "}
          {extendedTeller && extendedDirect ? <>עד <Num value={extendedTeller} /> ו־<Num value={extendedDirect} /></> : "יותר"}. כל בנק חייב להציע את שניהם ולתת לכל לקוח להצטרף, ובמסלול הבסיסי העמלה מוגבלת בצו{basicCap ? <>: עד <Num value={basicCap} /> בחודש</> : null} <RuleRef id="BANK-17" />. צו שכבר פורסם יבטל את המסלולים ויקבע במקומם תקרה לעמלת ניהול חשבון, לפי מספר הפעולות בחודש, ותקרה לדמי כרטיס חיוב מיידי <RuleRef id="BANK-35" />.
        </Sentence>
        <RulesLine ids={["BANK-01", "BANK-09", "BANK-20", "BANK-17", "BANK-35", "TXI-08"]} />
      </>
    );
  },
  who: () => (
    <>
      <p className="max-w-measure">
        כל הבנקים שברשימת בנק ישראל, בפיקוח המפקח על הבנקים. בנק לא רשאי לסרב סירוב בלתי סביר לפתוח ולנהל חשבון עו"ש שנשאר ביתרת זכות.
      </p>
      <RulesLine ids={["REG-01", "REG-03", "BANK-01"]} />
    </>
  ),
  switchLine: "מעבר לבנק אחר נעשה אונליין דרך הבנק הקולט, בלי עלות ובלי מס; פיקדונות וניירות ערך שאינם ניתנים להעברה נשארים בבנק הישן עד הפירעון",
  switchRules: ["SW-26", "SW-27", "SW-29"],
  termIds: ["חשבון עובר ושב", "יתרת זכות בחשבון", "ריבית על יתרת זכות", "מסלול בסיסי", "מסלול מורחב", "הטבה בנקאית"],
  afterTax: () => (
    <>
      <Callout tone="blocked" className="max-w-measure">
        <span className="font-medium">הפטור למעוטי הכנסה על ריבית מפיקדון: לא ידוע אם הוא חל גם על ריבית בעו"ש.</span> האתר לא מחיל אותו כאן. שאלה פתוחה: <IdRef id="TXI OQ11" />.
      </Callout>
      <RulesLine ids={["TXI-20"]} />
      <Sentence measure>
        הפסד ממכירת ניירות ערך לא מקוזז כנגד ריבית שהבנק משלם: הפסד הון מקוזז כנגד רווח הון, ובניירות ערך גם כנגד ריבית או דיבידנד על ניירות ערך, והפסד שנשאר עובר לשנים הבאות כנגד רווח הון בלבד <RuleRef id="TXI-17" />.
      </Sentence>
      <RulesLine ids={["TXI-17"]} />
    </>
  ),
  risks: ({ figure }) => {
    const months = figure("REG-04", "examination_deadline_months");
    const proposed = figure("REG-05", "proposed_guarantee");
    return (
      <>
        <p className="max-w-measure">
          אין בישראל ביטוח פיקדונות. אם בנק לא יכול לעמוד בהתחייבויותיו, נגיד בנק ישראל רשאי למנות לו מנהל מורשה ולהעביר את נכסיו והתחייבויותיו, ובאישור הממשלה גם להכריז על ערבות לפיקדונותיו; זו סמכות שבשיקול דעת, לא זכות שלכם.
        </p>
        <Sentence measure>
          חוק חדש מחייב לבחון {months ? <>תוך <Num value={months} /> חודשים </> : null}אם צריך ביטוח פיקדונות, והצעת חוק פרטית מציעה ערבות {proposed ? <>של <Num value={proposed} /> </> : null}בבנקים קטנים; היא רק הצעה, ויתרת עו"ש ממילא לא נכללת בה.
        </Sentence>
        <p className="max-w-measure">כסף שיושב בעו"ש בלי ריבית לא גדל, ולכן החוק מחייב את הבנק להזכיר לכם חלופות. <Term id="הטבה בנקאית">הטבה</Term> על ריבית או עמלה נגמרת רק אחרי הודעה מראש.</p>
        <RulesLine ids={["REG-04", "REG-05", "REG-06", "BANK-23", "BANK-20", "BANK-19"]} />
      </>
    );
  },
  use: () => (
    <>
      <p className="max-w-measure">
        כסף שצריך להיות זמין ברגע זה: ההוצאות של החודש והכרית הקרובה. כסף שנשאר בעו"ש רבעון שלם מעבר לסף שבחוק כבר שייך במקום אחר, והבנק עצמו יזכיר זאת.
      </p>
      <p className="max-w-measure">
        מול קרן כספית יומית העו"ש עדיף רק כשצריך את הכסף באותו יום: יחידות בקרן נפדות רק ביום מסחר, והבנק מציג אותה לצד הפיקדונות כשמשווים.
      </p>
      <RulesLine ids={["BANK-20", "MF-34", "BANK-15"]} />
    </>
  ),
};

export { RuleRef };
