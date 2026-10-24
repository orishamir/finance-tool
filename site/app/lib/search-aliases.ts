// The alias table of the search (research/knowledge/2026-10-24-search.md §3.4, 52 rows): what a person types on the
// left, the names the site and the rule base use on the right. Equivalences of names only, not finance facts. Applied to
// the query by `aliasQueries` in lib/search.ts: a matching phrase is replaced by each canonical name, and the original
// query also stays. Rows with `confirm: true` are everyday Israeli wording the sources do not spell out; the Hebrew
// editor (W-He) confirms them. `source` says where the pair is grounded.
export interface AliasRow {
  /** What a person types (any one of these). */
  from: string[];
  /** The canonical names it stands for (each is tried). */
  to: string[];
  /** Everyday wording, not spelled in the sources: awaiting the Hebrew editor. */
  confirm?: boolean;
  source: string;
}

export const aliasRows: AliasRow[] = [
  { from: ["פק״מ", 'פק"מ', "פקמ"], to: ["פיקדון קצר מועד", "פיקדון לזמן קצוב"], source: "glossary (bank deposits); wrapper bank-deposit names.app" },
  { from: ["פקדון", "פיקדונות"], to: ["פיקדון"], source: 'glossary "פיקדון => פקדון"; wrapper names' },
  { from: ["מק״ם", "מקמ", "מלווה קצר מועד"], to: ["מק״מ", "מילווה קצר מועד"], source: "glossary; wrapper makam" },
  { from: ["עו״ש", "עוש"], to: ["חשבון עובר ושב", "יתרת זכות בחשבון"], source: "glossary; wrapper current-account" },
  { from: ["אג״ח", "אגח"], to: ["איגרות חוב"], source: "glossary; copy.md 10.3" },
  { from: ["ני״ע", "ניע"], to: ["ניירות ערך"], source: "brokerage Terms; wrapper brokerage-account names.statement" },
  { from: ["תיק ניירות ערך", "חשבון מסחר", "פיקדון ניירות ערך"], to: ["חשבון ניירות ערך"], source: 'glossary row "חשבון ניירות ערך"' },
  { from: ["קופ״ג", "קופג"], to: ["קופת גמל"], source: 'glossary "קופת גמל לקצבה => קופ״ג לקצבה"' },
  { from: ["גמל להשקעה", "גמל השקעה", "חיסכון פלוס"], to: ["קופת גמל להשקעה"], source: "kupat-gemel-lehashkaa Terms; wrapper names" },
  { from: ["השתלמות", "קרנות השתלמות"], to: ["קרן השתלמות"], source: "keren-hishtalmut Terms; glossary" },
  { from: ["IRA", "ניהול אישי", "גמל בניהול אישי"], to: ["קופת גמל בניהול אישי"], source: 'glossary row "קופת גמל בניהול אישי"; wrappers ira-*' },
  { from: ["פנסיה", "קרן פנסיה", "פנסיה מקיפה"], to: ["קרן חדשה מקיפה"], source: 'glossary row "קרן חדשה מקיפה"; wrapper pension-comprehensive' },
  { from: ["קרן פנסיה כללית", "קרנות כלליות"], to: ["קרן חדשה כללית"], source: "glossary" },
  { from: ["חיסכון לילד", "חיסכון לכל ילד בבנק", "מיטב קידס"], to: ["חיסכון לכל ילד"], source: "glossary; wrappers child-savings-*" },
  { from: ["כספית", "קרן כספית שקלית", "כספית שקלית"], to: ["קרן כספית"], source: 'MF Terms ("כספית שקלית" category); wrapper names' },
  { from: ["קרן מועדים קבועים", "כספית מתחדשת"], to: ["קרן כספית מתחדשת"], source: "glossary; wrapper money-market-fund-renewable" },
  { from: ["ETF", "תעודת סל", "קרנות סל"], to: ["קרן סל"], source: 'glossary "קרן סל => ETF"; term "תעודת סל"' },
  { from: ["מחקה", "קרנות מחקות"], to: ["קרן מחקה"], source: 'glossary "קרן מחקה => מחקה"' },
  { from: ["קרן צוברת", "צבירה", "accumulating"], to: ["קרן שאינה מחלקת"], source: "glossary" },
  { from: ["מחלקת", "distributing"], to: ["קרן מחלקת"], source: "glossary" },
  { from: ["קרן זרה", "קרנות חוץ נסחרות", "קרנות מגוירות"], to: ["קרן חוץ"], source: 'glossary row "קרן חוץ"' },
  { from: ["סנופי", "אס אנד פי", "S&P", "SP500"], to: ["S&P 500"], confirm: true, source: "exposure index-sp500 names; the spoken forms are colloquial" },
  { from: ["תא 125", "ת״א-125", "TA-125"], to: ["מדד ת״א-125"], source: "exposure index-ta125 names" },
  { from: ["שחר", "גילון", "גליל", "ממש״ק", "ממצ״מ"], to: ["אג״ח ממשלתית"], source: "glossary rows; exposure names" },
  { from: ["מס רווחי הון", "רווחי הון", "ריווח הון", "מס רווח הון"], to: ["רווח הון"], source: 'glossary "רווח הון => ריווח הון · רווחי הון"; term "מס רווחי הון"' },
  { from: ["רווח ריאלי"], to: ["רווח הון ריאלי"], source: "glossary" },
  { from: ["מס יסף"], to: ["מס נוסף"], source: "glossary; TXG-09 title" },
  { from: ["ביטוח לאומי"], to: ["דמי ביטוח לאומי"], source: "glossary (tax-general)" },
  { from: ["מס בריאות"], to: ["דמי ביטוח בריאות"], source: "glossary" },
  { from: ["מדרגות מס הכנסה", "מדרגות"], to: ["מדרגות מס"], source: "glossary" },
  { from: ["נקודות זיכוי"], to: ["נקודת זיכוי"], source: "glossary" },
  { from: ["ניכוי במקור"], to: ["ניכוי מס במקור"], source: "glossary" },
  { from: ["טופס 0867", "אישור שנתי", "867"], to: ["טופס 867"], source: "glossary" },
  { from: ["דיווח מקוצר"], to: ["מסלול הדיווח המקוצר"], source: "glossary" },
  { from: ["דמי משמרת", "דמי משמורת", "דמי שמירה", "דמי ניהול פקדון ני״ע"], to: ["דמי ניהול פיקדון ניירות ערך"], source: "glossary rows (two)" },
  { from: ["עמלות מסחר", "עמלות קניה ומכירה", "עמלת קניה"], to: ["עמלת קנייה ומכירה"], source: "glossary" },
  { from: ["דמי ניהול מצבירה", "מהצבירה", "מהיתרה הצבורה"], to: ["דמי ניהול מחיסכון"], source: "glossary; copy.md 10.3" },
  { from: ["דמי ניהול מתוך התשלומים", "מההפקדה"], to: ["דמי ניהול מהפקדה"], source: "glossary; copy.md 10.3" },
  { from: ["תעריפון מלא", "מחירון"], to: ["תעריפון"], source: 'glossary "התעריפון המלא"; copy.md 10.3 (מחירון is the person\'s word, not the site\'s)' },
  { from: ["תקרה", "תקרת ההפקדה", "תקרת הפקדה שנתית", "תקרת הפקדה מוטבת"], to: ["תקרת הפקדה"], source: 'glossary row "תקרת הפקדה"' },
  { from: ["ניוד", "העברת כספים", "להעביר קופה"], to: ["העברת כספים בין קופות גמל"], source: "glossary; switching Terms" },
  {
    from: ["מעבר בין מסלולים", "שינוי מסלול", "החלפת מסלול", "להחליף מסלול", "לעבור מסלול", "שינוי מסלולי השקעה"],
    to: ["העברת כספים בין מסלולי השקעה", "מעבר מסלול"],
    confirm: true,
    source: 'glossary "העברת כספים בין מסלולי השקעה"; the verb forms are colloquial',
  },
  { from: ["הוראת קבע", "הו״ק", "הוק"], to: ["פיקדון בהוראת קבע", "תכנית חיסכון"], source: "glossary; wrapper savings-plan names.app" },
  { from: ["תוכנית חיסכון"], to: ["תכנית חיסכון"], source: "glossary" },
  { from: ["פיקדון ללקוחות כל הבנקים", "פיקדון ללא חשבון עו״ש", "מערכת סגורה"], to: ["חשבון במערכת סגורה"], source: "glossary" },
  { from: ["פריים", "ריבית פריים"], to: ["ריבית הפריים"], source: "glossary" },
  { from: ["ריבית ב״י", "ריבית בנק ישראל"], to: ["ריבית בנק ישראל"], source: "glossary" },
  { from: ["מדד", "צמוד", "צמוד מדד", "הצמדה למדד"], to: ["צמוד למדד המחירים לצרכן", "מדד המחירים לצרכן"], source: "glossary rows" },
  { from: ["נזילות", "קרן נזילה", "נזיל"], to: ["קרן נזילה"], source: 'glossary; bank-product-names Terms ("נזיל")' },
  { from: ["תחנות יציאה", "נקודות יציאה"], to: ["תחנת יציאה"], source: "glossary" },
  { from: ["מח״מ"], to: ["משך חיים ממוצע"], source: "MF Terms" },
  {
    from: ["תשואה היסטורית", "תשואת העבר", "S&P 500 בעבר", "מה עשה המדד"],
    to: ["טווחי תשואה היסטוריים של מדד S&P 500"],
    confirm: true,
    source: "MKT-01 title; the phrases are colloquial",
  },
];
