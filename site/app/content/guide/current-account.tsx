// Guide prose for חשבון עובר ושב (architecture 3.5: prose lives in content files; every figure is a Num).
// Written 2026-10-23 from the il-finance rules cited under each block (BANK, TXI, REG, SW, MF); same shape
// and register as kupat-gemel-lehashkaa.tsx. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import { Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { effectiveFromValue } from "../../lib/value";
import { Callout, Sentence, When } from "../../components/kit";

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
    const feeFew = figure("BANK-35", "account_fee_up_to_2_actions");
    const feeMost = figure("BANK-35", "account_fee_3_to_100_actions");
    const feeEach = figure("BANK-35", "account_fee_per_action_above_100");
    return (
      <>
        <p className="max-w-measure">
          <Term id="חשבון עובר ושב">חשבון הבנק השוטף</Term>: המשכורת נכנסת אליו וההוצאות יוצאות ממנו.
        </p>
        <p className="max-w-measure">
          לא כל בנק משלם <Term id="ריבית על יתרת זכות">ריבית על יתרת זכות</Term>. בנק שמשלם חייב להציג את התנאים, ובנק שלא משלם חייב לכתוב זאת בטבלת הריביות שלו. <Term prefix="מ" id="ריבית">ריבית</Term> שכן משולמת הבנק מנכה מס.
        </p>
        <Sentence measure>
          העלות היא עמלות החשבון. כל בנק חייב להציע שני מסלולים ולתת לכל לקוח להצטרף אליהם: <Term prefix="ה" id="מסלול בסיסי">מסלול הבסיסי</Term> כולל {basicTeller ? <>עד <Num value={basicTeller} /> פעולה בפקיד ו</> : null}
          {basicDirect ? <>עד <Num value={basicDirect} /> פעולות בערוץ ישיר בחודש</> : "מעט פעולות בחודש"}, <Term prefix="וה" id="מסלול מורחב">מסלול המורחב</Term>{" "}
          {extendedTeller && extendedDirect ? <>עד <Num value={extendedTeller} /> ו־<Num value={extendedDirect} /></> : "יותר"}. פעולות מעבר למסלול מחויבות לפי <Term id="התעריפון המלא">התעריפון המלא</Term>. המחיר של המסלול הבסיסי מוגבל בצו{basicCap ? <>: עד <Num value={basicCap} /> בחודש</> : null} <RuleRef id="BANK-17" end="." />
        </Sentence>
        {/* the rules ahead sit in their own box, which says they start later; the figures inside leave out their "starts on" mark (founder, 2026-11-08) */}
        <Callout tone="upcoming" className="max-w-measure" title="עומד להשתנות" tag={accountFrom ? <When iso={String(accountFrom.value)} lead="מ־" /> : undefined}>
          <Sentence size="sm">
            צו חדש קבע תקרה לדמי כרטיס חיוב מיידי{cardCap ? <>, עד <Num value={cardCap} /> בחודש,</> : null} שחלה {cardFrom ? <Num value={cardFrom} prefix="מ־" /> : "כבר"}. {accountFrom ? <Num value={accountFrom} prefix="מ־" /> : "בהמשך"} אותו צו מבטל את המסלולים וקובע במקומם תקרה לעמלת ניהול חשבון, לפי מספר הפעולות בחודש: {feeFew ? <>עד <Num value={feeFew} /> למי שעושה עד שתי פעולות, </> : null}{feeMost ? <>עד <Num value={feeMost} /> משלוש עד מאה פעולות</> : null}{feeEach ? <>, ועוד <Num value={feeEach} /> לכל פעולה מעל מאה</> : null} <RuleRef id="BANK-35" end="." />
          </Sentence>
        </Callout>
        <RulesLine ids={["BANK-01", "BANK-09", "BANK-17", "BANK-35", "TXI-08"]} />
      </>
    );
  },
  termIds: ["חשבון עובר ושב", "יתרת זכות בחשבון", "ריבית על יתרת זכות", "מסלול בסיסי", "מסלול מורחב", "הטבה בנקאית", "מנהל מורשה", "ביטוח פיקדונות", "פיקדון", "קרן כספית", "יחידה", "התעריפון המלא", "ריבית", "קרנות כספיות יומיות", "תשואה"],
  risks: ({ figure }) => {
    const months = figure("REG-04", "examination_deadline_months");
    const proposed = figure("REG-05", "proposed_guarantee");
    const notice = figure("BANK-19", "notice_days");
    return (
      <>
        <p className="max-w-measure">
          אין בישראל <Term id="ביטוח פיקדונות">ביטוח פיקדונות</Term>: אם בנק קורס, אין חוק שמחזיר לכם את הכסף. נגיד <Term id="בנק ישראל">בנק ישראל</Term> יכול למנות לבנק <Term id="מנהל מורשה">מנהל מורשה</Term> ולהעביר את נכסיו והתחייבויותיו, ובאישור הממשלה גם להכריז על ערבות לפיקדונות. אלה סמכויות שלו, לא זכויות שלכם.
        </p>
        <Sentence measure>
          חוק משנת 2026 מחייב את שר האוצר ואת הנגיד לבחון {months ? <>תוך <Num value={months} /> חודשים </> : null}אם צריך ביטוח פיקדונות; זו חובת בדיקה, לא ביטוח. הצעת חוק פרטית מציעה ערבות {proposed ? <>של עד <Num value={proposed} /> </> : null}ללקוח בבנקים קטנים, אבל היא רק הצעה, ויתרת עו״ש ממילא לא נכללת בה.
        </Sentence>
        <Sentence measure>
          כסף שיושב בעו״ש בלי ריבית לא גדל. <Term id="הטבה בנקאית">הטבה</Term> בריבית או <Term prefix="ב" id="עמלה">עמלה</Term> שנמשכת יותר משלושה חודשים מסתיימת אחרי הודעה{notice ? <> של לפחות <Num value={notice} /> ימים</> : " מראש"}.
        </Sentence>
        <RulesLine ids={["REG-04", "REG-05", "REG-06", "BANK-23", "BANK-20", "BANK-19"]} />
      </>
    );
  },
  use: ({ figure }) => {
    const threshold = figure("BANK-20", "credit_balance_threshold");
    return (
      <>
        <p className="max-w-measure">
          העו״ש הוא המקום לכסף שצריך להיות זמין באותו יום: המשכורת, ההוצאות של החודש והתשלומים הקרובים. <Term id="יחידה">יחידות</Term> של <Term id="קרן כספית">קרן כספית</Term> נפדות רק ביום מסחר, <Term prefix="ו" id="פיקדון">פיקדון</Term> נפתח לתקופה, ולכן כסף שעשוי לצאת היום נשאר בעו״ש.
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
