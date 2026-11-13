// Exposure prose for מדד S&P 500 (flows 6.6). Written from the rule base (ETF, TXS, TXF, CAT, IRA,
// BRK). The index itself is explained from S&P Dow Jones Indices' own index page and methodology (ETF-37 to
// ETF-40; product.md D18). Each block ends with the rules it rests on. The index maker's entry conditions and a
// fund's tracking asset are behind folds: only a specialist needs them. NEW copy for the founder to review.
import type { ExposureContent } from "../guide/types";
import type { GlanceItem } from "../../components/guide/sections";
import { GuideFold as Fold, RuleRows } from "../../components/guide/sections";
import { IdRef, Num, RuleRef, RulesLine, Term } from "../../components/provenance";
import { KeyValueList, ProseList, Section, Sentence, Tag, When } from "../../components/kit";
import { fmt } from "../../lib/format";

export const content: ExposureContent = {
  glance: ({ figure }) => {
    const companies = figure("ETF-37", "constituent_companies");
    const coverage = figure("ETF-37", "market_cap_coverage");
    const items: (GlanceItem | null)[] = [
      companies && { id: "companies", label: "חברות במדד", value: <Num value={companies} /> },
      coverage && { id: "coverage", label: "חלק משווי השוק הזמין להשקעה", value: <Sentence as="span">בערך <Num value={coverage} /></Sentence> },
    ];
    return items.filter((g) => g !== null);
  },
  what: ({ figure }) => {
    const companies = figure("ETF-37", "constituent_companies");
    const coverage = figure("ETF-37", "market_cap_coverage");
    const minCap = figure("ETF-38", "min_market_cap_usd");
    const notice = figure("ETF-39", "announcement_notice_business_days");
    const versions = figure("ETF-40", "return_versions");
    return (
      <>
        <p className="max-w-measure">עורך המדד, S&P Dow Jones Indices, מתאר את S&P 500 כמדד הייחוס הטוב ביותר למניות הגדולות בארצות הברית.</p>
        <Sentence measure>
          במדד {companies ? <Num value={companies} /> : null} חברות מובילות. יחד הן מכסות בערך {coverage ? <Num value={coverage} /> : null} משווי השוק הזמין להשקעה.
        </Sentence>
        <p className="max-w-measure">משקל כל חברה הוא שווי השוק של מניותיה שבידי הציבור, בלי תקרה למניה אחת. המדד מחושב בדולרים.</p>
        <p className="max-w-measure">
          הכסף מושקע, דרך קרן, במניות של חברות אמריקאיות לפי המדד, ובדולר, אלא אם הקרן <Term id="מגודרות מט&quot;ח">מנוטרלת מט״ח</Term>.
        </p>
        <RulesLine ids={["ETF-37", "ETF-39", "ETF-10"]} />

        <Section as="div" level="card" heading="h3" title="הגרסאות של המדד">
          <Sentence measure>
            למדד {versions ? <Num value={versions} /> : null} גרסאות. הן נבדלות במה שקורה <Term prefix="ל" id="דיבידנד">דיבידנדים</Term>.
          </Sentence>
          <KeyValueList
            rows
            items={[
              { id: "price", label: "מחיר בלבד", value: "הדיבידנדים לא נכנסים למדד." },
              { id: "gross", label: <Term id="תשואה כוללת ברוטו">תשואה כוללת ברוטו</Term>, value: "הדיבידנדים מושקעים מחדש במדד בלי מס." },
              {
                id: "net",
                label: "תשואה כוללת נטו",
                value: (
                  <>
                    הדיבידנדים מושקעים מחדש אחרי <Term id="ניכוי מס במקור">ניכוי מס במקור</Term> בארצות הברית.
                  </>
                ),
                tag: <Tag tone="primary">של הקרנות הישראליות</Tag>,
                line: "הקרנות הישראליות עוקבות אחרי הגרסה נטו. כלומר, מדד הייחוס שלהן כבר מניח שחלק מהדיבידנד נוכה כמס במקור.",
              },
            ]}
          />
          <RulesLine ids={["ETF-40"]} />
          <Fold label="אחרי מה בדיוק עוקבת קרן ישראלית">
            <p className="max-w-measure">
              <Term prefix="ה" id="נכס מעקב">נכס המעקב</Term> של קרן ישראלית על המדד הוא ״S&P 500 100%, דולר ארה״ב 100%״, בגרסת תשואה כוללת נטו, אלא אם הקרן מנוטרלת מט״ח.
            </p>
            <RulesLine ids={["ETF-10"]} />
          </Fold>
        </Section>

        <Fold label="איך נבחרות החברות למדד">
          <p className="max-w-measure">
            נכנסות אליו רק חברות אמריקאיות שנסחרות <Term prefix="ב" id="בורסה">בורסה</Term> אמריקאית, ובתנאים האלה:
          </p>
          <ProseList
            items={[
              <Sentence as="span" key="cap">
                שווי שוק של לפחות {minCap ? <Num value={minCap} display={`${fmt.number(Number(minCap.value) / 1e9)} מיליארד דולר`} /> : null}
                {/* the threshold moves at the start of every quarter (ETF-38): it says when it was read */}
                {minCap ? <>, <When iso={minCap.checked} lead="הסף נכון ל־" /> ומתעדכן כל רבעון</> : null}
              </Sentence>,
              "סחירות מספקת",
              "רווח חשבונאי חיובי ברבעון האחרון ובארבעת הרבעונים האחרונים יחד",
            ]}
          />
          <p className="max-w-measure">ועדת מדדים בוחרת את ההרכב לפי התנאים האלה ולפי איזון בין ענפים. מספר החברות קבוע.</p>
          <Sentence measure>
            הוועדה מחליפה חברות לפי הצורך, בהודעה של לפחות {notice ? <Num value={notice} /> : null} ימי עסקים מראש. מספרי המניות מתעדכנים פעם ברבעון.
          </Sentence>
          <RulesLine ids={["ETF-38", "ETF-39"]} />
        </Fold>
      </>
    );
  },
  holdNote: ({ figure }) => {
    const onTase = figure("ETF-32", "foreign_funds_traded_on_tase");
    const rate = figure("TXS-09", "rate");
    const lock = figure("TXH-09", "lock_years");
    const top = figure("TXH-11", "rate");
    return (
      <>
        <RuleRows
          items={[
            {
              id: "own",
              label: (
                <>
                  <Term prefix="ב" id="חשבון ניירות ערך">חשבון ניירות ערך</Term> <Term prefix="וב" id="קופת גמל בניהול אישי">ניהול אישי</Term>
                </>
              ),
              value: "בוחרים את הקרן בעצמכם.",
              rules: ["IRA-11", "TXK-17"],
            },
            {
              id: "track",
              label: "במסלול בקופה",
              value: (
                <>
                  <Term prefix="ב" id="קופת גמל להשקעה">קופת גמל להשקעה</Term>, <Term prefix="ב" id="קרן השתלמות">קרן השתלמות</Term> <Term prefix="וב" id="קרן פנסיה">קרן פנסיה</Term> יש מסלול ״<Term id="עוקב מדד S&P 500">עוקב מדד S&P 500</Term>״ <Term prefix="שה" id="חברה מנהלת">חברה המנהלת</Term> מנהלת.
                </>
              ),
              line: (
                <>
                  בתוך קופה, רווחים ודיבידנדים של המסלול פטורים ממס בישראל כל עוד הכסף בפנים. המס נקבע <Term prefix="ב" id="משיכה">משיכה</Term> לפי סוג הקופה. בקרן השתלמות המשיכה פטורה אחרי {lock ? <Num value={lock} /> : null} שנים על רווחי ההפקדות עד התקרה. רווח על הפקדה מעל התקרה ממוסה במס הכנסה של עד {top ? <Num value={top} /> : null} <Term prefix="מ" id="הרווח הריאלי">הרווח הריאלי</Term>, כלומר מהרווח <Term prefix="ה" id="נומינלי">נומינלי</Term> בניכוי <Term prefix="ה" id="אינפלציה">אינפלציה</Term> <RuleRef id="TXH-11" end="." /> מס אמריקאי שנוכה מדיבידנד בתוך קופה הוא עלות, ואין מקור שאומר אם אפשר להקטין אותו <IdRef id="TXK OQ7" end="." />
                </>
              ),
              rules: ["CAT-10", "CAT-17", "CAT-18", "CAT-24", "TXK-03", "TXK-18", "TXH-09", "TXH-11", "TXH-18", "TXP-13"],
            },
          ]}
        />

        <Section as="div" level="card" heading="h3" title="שלוש דרכים בחשבון ניירות ערך">
          <RuleRows
            items={[
              {
                id: "israeli",
                label: (
                  <>
                    <Term id="קרן סל">קרן סל</Term> או <Term id="קרן מחקה פתוחה">קרן מחקה</Term> ישראלית
                  </>
                ),
                value: (
                  <>
                    שתיהן <Term id="קרן נאמנות">קרנות נאמנות</Term> ישראליות. קרן ישראלית על מדד זר משיגה את החשיפה בדרך כלל דרך <Term id="עסקת החלף שאינה במימון">עסקת החלף</Term>.
                  </>
                ),
                line: (
                  <>
                    בקרן ישראלית <Term id="קרן נאמנות פטורה">פטורה</Term> משלמים <Term id="מס רווחי הון">מס רווחי הון</Term> של עד {rate ? <Num value={rate} /> : null} מהרווח הריאלי <Term prefix="ב" id="מכירה">מכירה</Term>. הרווח הריאלי של קרן שקלית נמדד מול <Term id="מדד המחירים לצרכן">מדד המחירים לצרכן</Term>, כך שגם עליית הדולר ממוסה.
                  </>
                ),
                rules: ["ETF-01", "ETF-04", "ETF-11", "TXS-09", "TXS-13", "TXS-14"],
              },
              {
                id: "foreign-tase",
                label: (
                  <>
                    <Term id="קרן חוץ">קרן חוץ</Term> שרשומה למסחר בתל אביב
                  </>
                ),
                value: <Sentence as="span">אחת מ־{onTase ? <Num value={onTase} /> : null} קרנות החוץ שנסחרות בתל אביב, על מדדים שונים. קונים אותה רק בבורסה.</Sentence>,
                rules: ["ETF-32", "ETF-26"],
              },
              {
                id: "foreign",
                label: (
                  <>
                    <Term id="קרן זרה">קרן זרה</Term> בבורסה בחו״ל
                  </>
                ),
                value: (
                  <>
                    קונים אותה דרך <Term id="ברוקר">ברוקר</Term>. היא מחזיקה את המניות עצמן.
                  </>
                ),
                line: "בקרן זרה הרווח נמדד מול שער הדולר. דיבידנד מחברה אמריקאית נושא מס אמריקאי שמתקזז מהמס בישראל.",
                rules: ["ETF-11", "ETF-28", "TXF-03", "TXF-04", "TXF-08", "TXF-12", "TXF-13", "TXF-16"],
              },
            ]}
          />
          <p className="max-w-measure">
            <Term id="רשות ניירות ערך">רשות ניירות ערך</Term> מפרסמת ממוצע שנתי של דמי הניהול של קרנות סל על מניות חו״ל. הוא מופיע בקישור שבכרטיס הכלל. כל קרן קובעת לעצמה את דמי הניהול, ויש גם <Term id="עמלת יצירה ופדיון">עמלת יצירה ופדיון</Term>, <Term id="דמי ניהול משתנים">דמי ניהול משתנים</Term> <Term prefix="ו" id="הפרש עקיבה">הפרש עקיבה</Term>.
          </p>
          <RulesLine ids={["ETF-17", "ETF-05", "ETF-13", "ETF-14", "ETF-09"]} />
        </Section>
      </>
    );
  },
  risks: () => (
    <>
      <p className="max-w-measure">
        השווי עולה ויורד עם מניות החברות שבמדד ועם שער הדולר. שני הדברים יכולים לרדת יחד. מחיר קרן סל בבורסה במהלך היום יכול להיות שונה משווי הנכסים שלה, ובמסחר בתל אביב כשוול סטריט סגורה הפער גדל.
      </p>
      <p className="max-w-measure">
        קרן ישראלית שמחזיקה חוזי החלף נושאת סיכון של הצד השני לעסקה. קרן יכולה להתפרק בהודעה מראש, ומנהל רשאי להעלות <Term id="דמי ניהול">דמי ניהול</Term> בתחילת שנה.
      </p>
      <p className="max-w-measure">
        קרן חוץ וקרן זרה אינן בפיקוח רשות ניירות ערך. הנספח הישראלי של קרן חוץ חייב לומר זאת. קרן זרה הרשומה בארצות הברית חושפת את העיזבון למס עיזבון אמריקאי.
      </p>
      <p className="max-w-measure">
        קרן זרה צוברת, שאינה מחלקת, ממוסה לפי קריאה שעוד לא אושרה במקור רשמי, וזו שאלה פתוחה <IdRef id="TXF OQ1" end="." /> מגבלות אירופיות על קנייה של קרנות אמריקאיות אצל ברוקר באירופה לא נבדקו, וזו שאלה פתוחה <IdRef id="ETF OQ11" end="." />
      </p>
      <RulesLine ids={["ETF-06", "ETF-11", "ETF-21", "ETF-14", "ETF-22", "ETF-24", "TXF-27", "TXF-11"]} />
    </>
  ),
  termIds: ["נכס מעקב", "דיבידנד", "מגודרות מט\"ח", "קרן סל", "קרן מחקה פתוחה", "קרן חוץ", "קרן זרה", "עסקת החלף שאינה במימון", "דמי ניהול משתנים", "הפרש עקיבה", "קרן נאמנות פטורה", "מס רווחי הון", "מדד המחירים לצרכן", "S&P 500", "עוקב מדד S&P 500", "פרופיל חשיפה", "מספר בורסה", "ISIN", "TER", "UCITS", "קרן שאינה מחלקת", "קרן מחלקת", "טופס W-8BEN", "רשות ניירות ערך", "דמי ניהול", "נומינלי", "משיכה", "הרווח הריאלי", "חברה מנהלת", "קרן פנסיה", "קרן השתלמות", "קופת גמל להשקעה", "קופת גמל בניהול אישי", "עמלת יצירה ופדיון", "קרן נאמנות", "חשבון ניירות ערך", "ניכוי מס במקור", "בורסה", "מכירה"],
};
