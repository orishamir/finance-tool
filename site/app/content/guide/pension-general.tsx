// Guide prose for קרן חדשה כללית (new general pension fund). Same shape and register as
// kupat-gemel-lehashkaa.tsx; checked against the rule base (PEN, TXP, PF); the words that state a rule open it
// (Ruled, D116), and a figure from a rule opens it from its sheet. NEW copy for the founder to review.
import type { GuideContent } from "./types";
import type { SiteValue } from "../../lib/value";
import { IdRef, Num, Ruled, Term } from "../../components/provenance";
import { Callout } from "../../components/kit";
import { GuidePart } from "../../components/guide/sections";
import { disabilityRetirement, EmployerUntaxed, ExemptShare, LumpSums } from "./pension-parts";

const N = ({ v }: { v: SiteValue | null }) => (v ? <Num value={v} /> : null);

export const content: GuideContent = {
  what: ({ figure }) => (
    <>
      <p className="max-w-measure">
        הקרן הכללית היא <Term id="קרן פנסיה">קרן פנסיה</Term> להפקדות שלא נכנסות לקרן המקיפה. <Ruled id="PEN-08">לקרן המקיפה יש תקרה להפקדות של כל חודש</Ruled>, ו<Ruled id="PEN-10">מה שמעל התקרה עובר לקרן הכללית של אותה חברה</Ruled>.
      </p>
      <p className="max-w-measure">
        גם בה <Ruled id="PEN-70">החיסכון הופך בפרישה</Ruled> <Term prefix="ל" id="קצבה">קצבה</Term>: סכום שמקבלים כל חודש. אבל בניגוד לקרן המקיפה, <Ruled id="PEN-69">המדינה לא מבטיחה בה רווח על חלק מהכסף</Ruled>.
      </p>
      <GuidePart title="התקרה של הקרן המקיפה">
        <p className="max-w-measure">
          <Term id="תקרת הפקדה">תקרת ההפקדה</Term> החודשית לקרן המקיפה, של המעסיק ושלכם יחד, היא <N v={figure("PEN-08", "monthly_deposit_ceiling")} />. העודף <Ruled id="PEN-10">עובר לקרן הכללית אוטומטית</Ruled>, אצל אותה <Term id="חברה מנהלת">חברה מנהלת</Term>. תקרה שלא נוצלה בחודש אחד <Ruled id="PEN-08">עוברת לחודשים הבאים באותה שנה</Ruled>.
        </p>
      </GuidePart>
      <GuidePart title="החיסכון והקצבה">
        <p className="max-w-measure">
          בקרן הכללית הכסף נצבר בחשבון על שמכם ומושקע <Term prefix="ב" id="מסלול השקעה">מסלול השקעה</Term>. בפרישה היתרה הופכת לקצבה חודשית <Ruled id="PEN-70">לפי</Ruled> <Term id="מקדם המרה">מקדם המרה</Term> של הקרן. <Term prefix="ב" id="מסלול ביטוח">מסלולי הביטוח</Term> של הקרן, הגיל שממנו היא משולמת <Ruled id="PEN-64">הוא לפחות</Ruled> <N v={figure("PEN-64", "min_retirement_age")} />.
        </p>
      </GuidePart>
      <GuidePart title="ביטוח לנכות ולמוות">
        <p className="max-w-measure">
          במסלולי הביטוח <Ruled id="PEN-64">יש גם כיסוי לנכות ולמוות</Ruled>: <Term id="קצבת נכות">קצבת נכות</Term> <Term prefix="ל" id="עמית פעיל">עמית פעיל</Term>, <Term prefix="ו" id="קצבת שאירים">קצבת שאירים</Term> ששווייה לא נמוך מהיתרה שצברתם. הקרן <Ruled id="PEN-64">רשאית להציע גם מסלול בלי הכיסוי הזה</Ruled>.
        </p>
      </GuidePart>
      <GuidePart title="מה עוד שונה מהמקיפה">
        <p className="max-w-measure">
          <Ruled id="PEN-69">אין בה</Ruled> <Term id="השלמת תשואה">השלמת תשואה</Term> של המדינה. כללי המס <Ruled id="TXP-24">הם כמו במקיפה</Ruled>.
        </p>
      </GuidePart>
    </>
  ),
  who: () => (
    <>
      <p className="max-w-measure">אותן חברות מנהלות של קרנות הפנסיה, <Ruled id="REG-17" prefix="ב">פיקוח</Ruled> <Term id="רשות שוק ההון ביטוח וחיסכון">רשות שוק ההון, ביטוח וחיסכון</Term>. לכל קרן מקיפה יש קרן כללית אחות, <Ruled id="PEN-10" prefix="ו">אליה העודף עובר</Ruled>.</p>
    </>
  ),
  switchLine: (
    <>
      <Ruled id="TXP-32">בלי מס הכנסה, לפי קריאה של האתר</Ruled>, גם בין מסלולים בתוך הקרן וגם במעבר לקרן פנסיה אחרת. כל עוד אתם <Term id="עמית">עמיתים</Term> פעילים בקרן הכללית, <Ruled id="SW-13">אי אפשר לעבור ממנה לקרן מקיפה</Ruled>.
    </>
  ),
  termIds: ["מסלול השקעה", "קצבת נכות", "קצבת שאירים", "עמית פעיל", "קרן נבחרת", "זיכוי ממס", "עמית מוטב", "הכנסה מזכה", "מקדם המרה", "קצבה מזכה", "משיכה שלא כדין", "איזון אקטוארי", "קופת גמל לקצבה", "קרן פנסיה", "עמית", "משיכה", "גיל הפרישה", "תגמולי מעסיק", "מרכיב הפיצויים", "רשות שוק ההון ביטוח וחיסכון", "השלמת תשואה", "קצבה", "חברה מנהלת", "אינפלציה", "תקרת הפקדה", "מסלול ביטוח", "שאירים"],
  cost: ({ figure }) => (
    <p className="max-w-measure">
      לעומת הקרן המקיפה, תקרת דמי הניהול מהחיסכון כאן גבוהה יותר, ותקרת דמי הניהול מההפקדה נמוכה יותר. במקיפה הן <N v={figure("PF-04", "balance_cap")} /> בשנה מהחיסכון ו־<N v={figure("PF-04", "deposit_cap")} /> מההפקדה.
    </p>
  ),
  afterTax: ({ figure }) => (
    <>
      <p className="max-w-measure">
        <Ruled id="TXP-24" prefix="ה">כללים זהים למקיפה</Ruled>, כי בתקנות מס הכנסה שתיהן <Term id="קופת גמל לקצבה">קופת גמל לקצבה</Term>. ההפקדה שלכם מורידה את מס ההכנסה ב־<N v={figure("TXP-01", "credit_pct")} /> מסכום ההפקדה, <Ruled id="TXP-01">בלי קשר למדרגת המס שלכם</Ruled>. לפי הנחה של האתר, ההפחתה היא עד גובה המס שאתם משלמים באותה שנה. זה <Term id="זיכוי ממס">זיכוי ממס</Term>. למי שהוא לא <Term id="עמית מוטב">עמית מוטב</Term> הוא <Ruled id="TXP-02">חל על הפקדה של עד</Ruled> <N v={figure("TXP-02", "credited_pct_of_income")} /> <Term prefix="מ" id="הכנסה מזכה">הכנסה מזכה</Term> של עד <N v={figure("TXP-02", "eligible_income_cap")} /> בשנה. עמית מוטב <Ruled id="TXP-03">עובר לתקרת זיכוי אחרת</Ruled>.
      </p>
      <EmployerUntaxed figure={figure} />
      <Callout tone="blocked" className="max-w-measure">
        <span className="font-medium">את הקצבה האתר עוד לא מחשב, כי חסרים <Term id="מקדם המרה">מקדמי ההמרה</Term>.</span> שאלה פתוחה <IdRef id="PEN OQ7" end="." />
      </Callout>
      <p className="max-w-measure">
        <Ruled id="TXP-14" prefix="ה">פטור ממס</Ruled> על הקצבה מתחיל <Term prefix="ב" id="גיל הפרישה">גיל הפרישה</Term> לפי החוק: <N v={figure("PEN-26", "retirement_age_men")} /> לגברים ו־<N v={figure("PEN-26", "retirement_age_women")} /> לנשים. לנשים שנולדו עד <N v={figure("PEN-26", "graded_women_born_until")} /> הגיל <Ruled id="PEN-26">מדורג לפי שנת הלידה</Ruled>. {disabilityRetirement}
      </p>
      <ExemptShare figure={figure} />
      <LumpSums figure={figure} />
    </>
  ),
  risks: ({ figure }) => (
    <>
      <p className="max-w-measure">הנכסים <Ruled id="PF-29">מוחזקים בנאמנות</Ruled>, בנפרד מהרכוש של החברה המנהלת, ואי אפשר לעקל אותם. זכויות של עמית <Ruled id="PF-48">אפשר לעקל רק לפי כללים שהשר קובע</Ruled>. אם החברה המנהלת קורסת, הניהול <Ruled id="REG-19">עובר לחברה אחרת</Ruled>.</p>
      <p className="max-w-measure"><Ruled id="PEN-69">אין כאן</Ruled> השלמת <Term prefix="ה" id="תשואה">תשואה</Term> של המדינה.</p>
      <p className="max-w-measure">
        <Ruled id="PEN-65">גם בקרן הכללית יש</Ruled> <Term id="איזון אקטוארי">איזון אקטוארי</Term>. עודף או גירעון מנכות או מתמותה של עמיתים פעילים מגיע רק למי שבמסלול ביטוח עם כיסוי לנכות או <Term prefix="ל" id="שאירים">שאירים</Term>. הקרן <Ruled id="PEN-64">רשאית להציע גם מסלול בלי כיסוי לנכות ולמוות</Ruled>, ולעמיתים בו העודף או הגירעון האלה לא מגיעים. עודף או גירעון מגורמים דמוגרפיים אחרים מעדכן את היתרות של העמיתים ואת הקצבאות. עודף או גירעון מהתשואות חל רק על מקבלי הקצבה. האיזון נעשה בכל תקופת דיווח כספי. האתר לא מצא בכללים שקרא אם בקרן הכללית זו תקופה של רבעון או של שנה.
      </p>
    </>
  ),
  use: () => (
    <>
      <p className="max-w-measure">
        הכסף מגיע לכאן אוטומטית כשההפקדה עוברת את התקרה של המקיפה. דמי הניהול על הכסף הזה <Ruled id="PEN-10">לא יכולים להיות גבוהים מדמי הניהול שלכם במקיפה</Ruled>, אלא אם סוכם אחרת במפורש. החברה מודיעה בכתב, בתוך שבועיים מההעברה הראשונה, על ההעברה, על דמי הניהול ועל הכיסוי הביטוחי.
      </p>
      <p className="max-w-measure">
        <Term prefix="ה" id="קרן נבחרת">קרנות הנבחרות</Term> <Ruled id="PEN-23">הן קרנות מקיפות</Ruled>. כאן שווה לבדוק את דמי הניהול.
      </p>
    </>
  ),
};
