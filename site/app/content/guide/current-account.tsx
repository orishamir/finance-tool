// Guide prose for חשבון עובר ושב (architecture 3.5: prose lives in content files; every figure is a Num).
// Written 2026-10-23 from the il-finance rules cited under each block (BANK, TXI, REG, SW, MF); same shape
// and register as kupat-gemel-lehashkaa.tsx. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import { Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { effectiveFromValue } from "../../lib/value";
import { Sentence } from "../../components/kit";

export const content: GuideContent = {
  what: ({ figure }) => {
    const basicTeller = figure("BANK-17", "basic_teller_actions");
    const basicDirect = figure("BANK-17", "basic_direct_actions");
    const extendedTeller = figure("BANK-17", "extended_teller_actions");
    const extendedDirect = figure("BANK-17", "extended_direct_actions");
    const basicCap = figure("BANK-17", "basic_track_max_fee");
    const cardCap = figure("BANK-35", "immediate_debit_card_fee");
    const cardFrom = effectiveFromValue(cardCap, "המועד שבו התקרה לדמי כרטיס חיוב מיידי נכנסה לתוקף");
    const accountFrom = effectiveFromValue(figure("BANK-35", "account_fee_3_to_100_actions"), "המועד שבו התקרות לעמלת ניהול חשבון נכנסות לתוקף והמסלולים מתבטלים");
    return (
      <>
        <p className="max-w-measure">
          <Term id="חשבון עובר ושב">חשבון הבנק השוטף</Term>: המשכורת נכנסת אליו וההוצאות יוצאות ממנו. לא כל בנק משלם <Term id="ריבית על יתרת זכות">ריבית על יתרת זכות</Term>; בנק שמשלם חייב להציג את התנאים, ובנק שלא משלם חייב לכתוב זאת בטבלת הריביות שלו. על ריבית שכן משולמת הבנק מנכה מס כבר כשהיא נזקפת לחשבון.
        </p>
        <Sentence measure>
          העלות היא מסלול העמלות: <Term prefix="ה" id="מסלול בסיסי">מסלול הבסיסי</Term> כולל {basicTeller ? <>עד <Num value={basicTeller} /> פעולה בפקיד ו</> : null}
          {basicDirect ? <>עד <Num value={basicDirect} /> פעולות בערוץ ישיר בחודש</> : "מעט פעולות בחודש"}, <Term prefix="ה" id="מסלול מורחב">מורחב</Term>{" "}
          {extendedTeller && extendedDirect ? <>עד <Num value={extendedTeller} /> ו־<Num value={extendedDirect} /></> : "יותר"}. כל בנק חייב להציע את שניהם ולתת לכל לקוח להצטרף, ובמסלול הבסיסי העמלה מוגבלת בצו{basicCap ? <>: עד <Num value={basicCap} /> בחודש</> : null} <RuleRef id="BANK-17" />. צו חדש קבע תקרה לדמי כרטיס חיוב מיידי{cardCap ? <>, עד <Num value={cardCap} /> בחודש,</> : null} שחלה {cardFrom ? <Num value={cardFrom} prefix="מ־" /> : "כבר"}; {accountFrom ? <Num value={accountFrom} prefix="מ־" /> : "בהמשך"} אותו צו יבטל את המסלולים ויקבע במקומם תקרה לעמלת ניהול חשבון, לפי מספר הפעולות בחודש <RuleRef id="BANK-35" />.
        </Sentence>
        <RulesLine ids={["BANK-01", "BANK-09", "BANK-17", "BANK-35", "TXI-08"]} />
      </>
    );
  },
  termIds: ["חשבון עובר ושב", "יתרת זכות בחשבון", "ריבית על יתרת זכות", "מסלול בסיסי", "מסלול מורחב", "הטבה בנקאית"],
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
  use: ({ figure }) => {
    const threshold = figure("BANK-20", "credit_balance_threshold");
    return (
      <>
        <p className="max-w-measure">
          העו"ש הוא המקום לכסף שצריך להיות זמין באותו יום: המשכורת, ההוצאות של החודש והתשלומים הקרובים. יחידות של קרן כספית נפדות רק ביום מסחר, ופיקדון נפתח לתקופה, ולכן כסף שעשוי לצאת היום נשאר בעו"ש.
        </p>
        <Sentence measure>
          כסף שלא צריכים באותו יום לא חייב לשבת שם. אם <Term prefix="ה" id="יתרת זכות בחשבון">יתרה</Term> נשארת {threshold ? <>מעל <Num value={threshold} /> </> : "מעל הסף שקבוע בחוק "}במשך רבעון שלם, החוק מחייב את הבנק לשלוח הודעה שמפנה לחלופות.
        </Sentence>
        <RulesLine ids={["BANK-20", "MF-34", "BANK-13"]} />
      </>
    );
  },
};

export { RuleRef };
