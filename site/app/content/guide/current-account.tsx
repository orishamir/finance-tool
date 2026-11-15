// Guide prose for חשבון עובר ושב (architecture 3.5: prose lives in content files; every figure is a Num).
// Written from the il-finance rules (BANK, TXI, REG, MF); the words that state a rule open it (Ruled, D116), and a figure from a rule opens
// it from its sheet. Same shape and register as kupat-gemel-lehashkaa.tsx. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import { Num, Ruled, Term } from "../../components/provenance";
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
    const bandLowMax = figure("BANK-35", "action_band_low_max");
    const bandMidMin = figure("BANK-35", "action_band_mid_min");
    const bandMidMax = figure("BANK-35", "action_band_mid_max");
    return (
      <>
        <p className="max-w-measure">
          לא כל בנק משלם <Term id="ריבית על יתרת זכות">ריבית על יתרת זכות</Term>. בנק שמשלם <Ruled id="BANK-09">חייב להציג את התנאים</Ruled>, ובנק שלא משלם חייב לכתוב זאת בטבלת הריביות שלו. <Term prefix="מ" id="ריבית">ריבית</Term> שכן משולמת הבנק <Ruled id="TXI-08">מנכה מס הכנסה</Ruled>.
        </p>
        <Sentence measure>
          העלות היא עמלות החשבון. כל בנק חייב להציע שני מסלולים ולתת לכל לקוח להצטרף אליהם: <Term prefix="ה" id="מסלול בסיסי">מסלול הבסיסי</Term> כולל {basicTeller ? <>עד <Num value={basicTeller} /> פעולה בפקיד ו</> : null}
          {basicDirect ? <>עד <Num value={basicDirect} /> פעולות בערוץ ישיר בחודש</> : "מעט פעולות בחודש"}, <Term prefix="וה" id="מסלול מורחב">מסלול המורחב</Term>{" "}
          {extendedTeller && extendedDirect ? <>עד <Num value={extendedTeller} /> ו־<Num value={extendedDirect} /></> : "יותר"}. פעולות מעבר למסלול מחויבות לפי <Term id="התעריפון המלא">התעריפון המלא</Term>. המחיר של המסלול הבסיסי <Ruled id="BANK-17">מוגבל בצו</Ruled>{basicCap ? <>: עד <Num value={basicCap} /> בחודש</> : null}.
        </Sentence>
        <Sentence measure>
          חוץ מבנק חדש: בשנים הראשונות אחרי שקיבל רישיון הוא <Ruled id="BANK-51">לא כפוף לתעריפון המלא</Ruled> ומפרסם תעריפון משלו, אבל תקרה שהנגיד קבע לשירות בפיקוח חלה גם עליו. גם בנק קטן <Ruled id="BANK-52">מקבל הקלות</Ruled> בחלק מהכללים של <Term id="בנק ישראל">בנק ישראל</Term> ללקוחות, למשל בשירותי התשלום שהוא חייב להציע בחשבון.
        </Sentence>
        {/* the rules ahead sit in their own box, which says they start later; the figures inside leave out their "starts on" mark */}
        <Callout tone="upcoming" className="max-w-measure" title="עומד להשתנות" tag={accountFrom ? <When iso={String(accountFrom.value)} lead="מ־" /> : undefined}>
          <Sentence size="sm">
            צו חדש קבע תקרה לדמי כרטיס חיוב מיידי{cardCap ? <>, עד <Num value={cardCap} /> בחודש,</> : null} שחלה {cardFrom ? <Num value={cardFrom} prefix="מ־" /> : "כבר"}. {accountFrom ? <Num value={accountFrom} prefix="מ־" /> : "בהמשך"} <Ruled id="BANK-35">המסלולים מתבטלים</Ruled>, ואותו צו קובע במקומם תקרה לעמלת ניהול חשבון, לפי מספר הפעולות בחודש: {feeFew && bandLowMax ? <>עד <Num value={feeFew} /> למי שעושה עד <Num value={bandLowMax} /> פעולות, </> : null}{feeMost && bandMidMin && bandMidMax ? <>עד <Num value={feeMost} /> מ־<Num value={bandMidMin} /> עד <Num value={bandMidMax} /> פעולות</> : null}{feeEach && bandMidMax ? <>, ועוד <Num value={feeEach} /> לכל פעולה מעל <Num value={bandMidMax} /></> : null}. <Ruled id="BANK-54">התקרות חלות על כל יחיד שמחזיק חשבון</Ruled>, וגם על תאגיד שהוא עסק כפי שקבע הנגיד בכללים, לפי מחזור העסקים שלו.
          </Sentence>
        </Callout>
      </>
    );
  },
  termIds: ["חשבון עובר ושב", "יתרת זכות בחשבון", "ריבית על יתרת זכות", "מסלול בסיסי", "מסלול מורחב", "הטבה בנקאית", "מנהל מורשה", "ביטוח פיקדונות", "פיקדון", "קרן כספית", "יחידה", "התעריפון המלא", "ריבית", "קרנות כספיות יומיות", "תשואה"],
  risks: ({ figure }) => {
    const months = figure("REG-04", "examination_deadline_months");
    const lapsed = figure("REG-05", "new_knesset_convened");
    const notice = figure("BANK-19", "notice_days");
    const benefitMonths = figure("BANK-19", "benefit_min_months");
    return (
      <>
        <p className="max-w-measure">
          <Ruled id="BANK-23">אין בישראל חוק שמקים</Ruled> <Term id="ביטוח פיקדונות">ביטוח פיקדונות</Term> או ערבות של המדינה לפיקדונות בבנקים. אם בנק קורס, נגיד בנק ישראל יכול למנות לבנק <Term id="מנהל מורשה">מנהל מורשה</Term>, ובאישור הממשלה גם <Ruled id="REG-06">להכריז על ערבות לפיקדונות</Ruled>. המנהל המורשה יכול, באישור הנגיד, להעביר את נכסי הבנק והתחייבויותיו. אלה סמכויות שלהם, לא זכויות שלכם.
        </p>
        <Sentence measure>
          חוק משנת 2026 <Ruled id="REG-04">מחייב את שר האוצר ואת הנגיד לבחון</Ruled> {months ? <>תוך <Num value={months} /> חודשים </> : null}אם צריך ביטוח פיקדונות; זו חובת בדיקה, לא ביטוח. הצעת חוק פרטית לביטוח פיקדונות <Ruled id="REG-05">פקעה</Ruled> כשהכנסת החדשה התכנסה{lapsed ? <> <Num value={lapsed} prefix="ב־" /></> : null}.
        </Sentence>
        <Sentence measure>
          כסף שיושב בעו״ש בלי ריבית לא גדל. <Term id="הטבה בנקאית">הטבה</Term> בריבית או <Term prefix="ב" id="עמלה">עמלה</Term> שנמשכת יותר {benefitMonths ? <><Num value={benefitMonths} prefix="מ־" /> חודשים</> : "מכמה חודשים"} <Ruled id="BANK-19">מסתיימת אחרי הודעה</Ruled>{notice ? <> של לפחות <Num value={notice} /> ימים</> : " מראש"}.
        </Sentence>
      </>
    );
  },
  use: ({ figure }) => {
    const threshold = figure("BANK-20", "credit_balance_threshold");
    const period = figure("BANK-20", "continuous_period_months");
    return (
      <>
        <p className="max-w-measure">
          <Term prefix="ה" id="חשבון עובר ושב">עו״ש</Term> הוא המקום לכסף שצריך להיות זמין באותו יום: המשכורת, ההוצאות של החודש והתשלומים הקרובים. <Term id="יחידה">יחידות</Term> של <Term id="קרן כספית">קרן כספית</Term> <Ruled id="MF-34">נפדות רק ביום מסחר</Ruled>, <Term prefix="ו" id="פיקדון">פיקדון</Term> נפתח לתקופה, ולכן כסף שעשוי לצאת היום נשאר בעו״ש.
        </p>
        <Sentence measure>
          כסף שלא צריכים באותו יום לא חייב לשבת שם. אם <Term prefix="ה" id="יתרת זכות בחשבון">יתרה</Term> נשארת {threshold ? <>מעל <Num value={threshold} /> </> : "מעל הסף שקבוע בחוק "}{period ? <>במשך <Num value={period} /> חודשים ברציפות</> : "ברציפות"}, החוק מחייב את הבנק <Ruled id="BANK-20">לשלוח הודעה שמפנה לחלופות</Ruled>.
        </Sentence>
      </>
    );
  },
};
