// Every Hebrew string the site shows, from docs/copy.md (release 1 sections in force 2026-10-23; the strings the
// 2026-10-23 build added are folded into copy.md the same day, marked there "for the founder's review").
// Figures never appear here: a `{…}` place in copy.md is filled by a Num on the page.

export const site = {
  name: "מקור",
  tagline: "להבין חיסכון והשקעה בישראל, עם מקור לכל מספר.",
  search: "חיפוש",
  searchPlaceholder: "הדביקו שם של מוצר, מסלול או מונח",
  menu: "תפריט",
  close: "סגירה",
  back: "חזרה",
  currentPage: "העמוד הנוכחי",
  menuItems: [
    { href: "/guide", label: "מדריך", current: "guide" },
    { href: "/questions", label: "שאלות שכולם שואלים", current: "questions" }, // the questions page (founder, 2026-10-24 evening)
    { href: "/companies", label: "חברות ומסלולים", current: "decoder" },
    { href: "/rules", label: "חוקים וכללים", current: "rules" },
    { href: "/parameters", label: "פרמטרים", current: "parameters" },
    { href: "/goal", label: "השוואה למטרה", current: "goal" },
    { href: "/invest", label: "השקעה במדד" }, // D28, 2026-10-25
  ] as const,
  notCovered: { href: "/not-covered", label: "מה האתר עוד לא מכסה" },
  // audit 2026-10-24 (A54, A29, A96): the menu's second group, the home crumb, the footer lines, back to top
  menuBehind: "מאחורי הקלעים",
  homeCrumb: "ראשי",
  footerNote: "אתר אישי, לא מסחרי, בלי קישורי שיווק; הכול נשמר במכשיר שלכם",
  footerAsOf: "נתונים נכון ל־",
  toTop: "חזרה למעלה",
  footer: [
    { href: "/questions", label: "שאלות שכולם שואלים" },
    { href: "/rules", label: "חוקים וכללים" },
    { href: "/parameters", label: "פרמטרים" },
    { href: "/goal", label: "השוואה למטרה" },
    { href: "/not-covered", label: "מה האתר עוד לא מכסה" },
  ],
} as const;

export const numbers = {
  legend: {
    sourced: "ממקור",
    computed: "מחושב",
    entered: "הזנתם",
    // audit 2026-10-24 (A23): the fourth legend item, the caution mark beside a figure that rests on a company's own document
    institution: "לפי החברה: המספר מבוסס על מסמך של החברה",
    // audit 2026-10-24 (A78, asked by the guides package): the glossary-term sample in the legend
    term: "מונח",
    termMeaning: "הקישו להסבר",
  },
  // audit 2026-10-24 (A25): a figure whose rate or fee takes effect after today; the date follows the maqaf
  startsOn: "נכנס לתוקף ב־",
  legendHintPhone: "הקישו על מספר כדי לראות מאיפה הוא.",
  legendHintPc: "לחצו על מספר כדי לראות מאיפה הוא.",
  details: "פרטים",
  unknown: "לא ידוע",
  parameter: "פרמטר של האתר",
  provisional: "ערך זמני שהאתר קבע",
  // audit 2026-10-24 (A77): the short tag beside a provisional parameter
  provisionalTag: "ערך זמני",
  staleSince: "לא עודכן מאז",
  weak: { secondary: "משני", institution: "לפי החברה" },
  yes: "כן",
  no: "לא",
  /** audit 2026-10-24 (A76): values the rule records write as English words, shown in Hebrew */
  enums: { unlinked: "לא צמוד", cpi: "צמוד למדד" } as Record<string, string>,
  monthsHe: { January: "בינואר", February: "בפברואר", March: "במרץ", April: "באפריל", May: "במאי", June: "ביוני", July: "ביולי", August: "באוגוסט", September: "בספטמבר", October: "באוקטובר", November: "בנובמבר", December: "בדצמבר" } as Record<string, string>,
} as const;

export const strength = {
  primary: { label: "מקור ראשי", line: "הנתון נלקח מנוסח החוק, מהתקנות או מהגוף שמפרסם אותו." },
  "primary-mirror": { label: "מקור ראשי (עותק)", line: "נוסח החוק נקרא באתר שמעתיק אותו, ועוד לא באתר הרשמי." },
  institution: { label: "לפי החברה", line: "הנתון נלקח ממסמך של בנק או של חברה מנהלת, לא מהחוק או מהרשות." },
  secondary: { label: "מקור משני", line: "הנתון נלקח מכתבה או מאתר מידע, לא מהמקור עצמו." },
  open: { label: "שאלה פתוחה", line: "עוד לא נמצא מקור שעונה על זה, ולכן האתר לא מחשב את זה." },
  entered: { label: "הזנתם", line: "הזנתם את הערך הזה." },
} as const;

export const buttons = {
  resetOne: "חזרה לערך ההתחלתי",
  resetAll: "חזרה לכל הערכים ההתחלתיים",
  resetEntered: "לאפס את הערכים שהזנתם",
  showTable: "הצגה כטבלה",
  hideTable: "הסתרת הטבלה",
  openSource: "פתיחת המקור",
  allRules: "לכל החוקים והכללים",
  copy: "העתקה",
  copied: "הועתק",
} as const;

export const home = {
  searchLabel: "מה ראיתם באפליקציה, בפרסומת או בדוח?",
  door1: { title: "להבין סוג של חיסכון", line: "מה זה, כמה זה עולה ואיך זה ממוסה", href: "/guide" },
  door2: { title: "מה חברה מציעה לי", line: "כל המוצרים והמסלולים שלה, עם הסבר לכל אחד", href: "/companies" },
  door3: { title: "כסף שיושב בעו״ש", line: "שני מספרים, ותראו כמה עולה להשאיר אותו שם", href: "/idle-cash" },
  // audit 2026-10-24 (A55): the count on the holdings door (the goal door of that audit became the question card below, 2026-10-24)
  holdingsSaved: { one: "החזקה אחת שמורה: {names}", many: "{n} החזקות שמורות: {names}" },
  // home question card 2026-10-24
  quick: {
    heading: "מה השאלה שלכם?",
    amountNow: "יש לכם היום",
    monthly: "ובכל חודש",
    years: "כמה שנים עד שתצטרכו את הכסף",
    unknownYears: "לא יודעים",
    purposeLabel: "בשביל מה",
    purposes: { apartment: "דירה", wedding: "חתונה", studies: "לימודים", child: "ילד", retirement: "פרישה", cushion: "כרית ביטחון", none: "בלי מטרה מסוימת" } as Record<string, string>,
    // NEW 2026-10-25 (the founder: only "כרית ביטחון" changed the card): what each purpose asks and assumes
    costLabel: { apartment: "כמה הדירה תעלה, בערך", wedding: "כמה החתונה תעלה, בערך", studies: "כמה הלימודים יעלו, בערך" } as Record<string, string>,
    costHint: "לא חובה. התוצאה תראה אם הסכום מספיק.",
    childNote: "החיסכון נבדק עד גיל {n}, המספר שהאתר קבע ל״{preset}״.",
    unknownNote: "בלי מספר שנים, ההשוואה תרוץ על {n} שנים, המספר שהאתר קבע ל״{preset}״.",
    submit: "מה הכי מתאים",
    submitCushion: "כמה עולה להשאיר בעו״ש",
    needAmount: "הזינו סכום: היום או בכל חודש.",
    line: "הכול נשמר במכשיר הזה. גיל, שכר ותשואה אפשר להוסיף בתוצאה, אם תרצו.",
    allFields: "לכל השדות",
    another: "שאלה נוספת",
    // NEW 2026-10-24 (scenario audit 7, 8, 4): doors for people who start from what they already hold, not from a purpose
    already: "יש לכם כבר…",
    alreadyDeposit: "פיקדון שמסתיים",
    alreadyStudyFund: "קרן השתלמות נזילה",
  },
} as const;

export const search = {
  label: "חיפוש",
  hint: "אפשר להדביק את השם בדיוק כמו שהוא מופיע באפליקציה, בפרסומת או בדוח.",
  tooShort: "הקלידו לפחות שתי אותיות.",
  groups: { product: "מוצרים", track: "מסלולים וקופות", term: "מונחים", guide: "עמודי מדריך", bank: "בנקים ומוצרי בנק", company: "חברות מנהלות" /* audit 2026-10-24 (A92) */, notcovered: "עוד לא באתר" /* audit 2026-10-24 (A92) */ },
  // audit 2026-10-24 (A4, A92): the row lines for numbers, and "also called"
  fundWord: "קופה",
  securityWord: "מספר נייר",
  notCoveredLine: "מוצר שהאתר עוד לא מכסה",
  also: "נקרא גם:",
  termLine: "מונח · מוסבר בעמוד",
  more: "הצגת כל התוצאות בקבוצה",
  clear: "ניקוי",
  empty: {
    title: "עוד לא באתר",
    bodyBefore: "את השם ״",
    bodyAfter: "״ עוד אין באתר.",
    underButton: "העתיקו את השם ושלחו אותו למי ששלח לכם את האתר, כדי שיתווסף. ההעתקה גם שומרת אותו במכשיר שלכם.", // changed 2026-10-24 (audit A4): saved only on the copy click
    notProduct: "זה לא שם של מוצר? ראו מה האתר עוד לא מכסה", // audit 2026-10-24 (A58, A92)
    copyFailed: "ההעתקה לא הצליחה. סמנו את השם והעתיקו אותו ידנית.",
    links: { companies: "לרשימת החברות", shorter: "לחפש רק חלק מהשם" },
  },
} as const;

export const guideIndex = {
  title: "מדריך",
  lede: "כל סוג של חיסכון והשקעה שהאתר מכסה. לכל אחד אותו מבנה, כדי שיהיה קל להשוות.",
  group1: { title: "איפה הכסף מוחזק", line: "המוצר עצמו: חשבון בבנק, קופה או חשבון השקעות" },
  group2: { title: "במה הכסף מושקע", line: "מה שבתוך המוצר: מזומן, אג״ח, מניות דרך מדד" },
  last: { title: "מה האתר עוד לא מכסה", line: "מוצרים שהאתר מכיר אבל עוד לא מסביר עד הסוף" },
  // audit 2026-10-24 (A43, A44): the product-versus-exposure explainer, the start line, the purpose groups and the plain subtitles
  explainer: {
    title: "שני חלקים בכל חיסכון",
    product: { term: "איפה הכסף מוחזק", line: "המוצר: פיקדון, קרן השתלמות, חשבון ניירות ערך. הוא קובע מי מחזיק את הכסף, מה המס ומתי אפשר למשוך." },
    exposure: { term: "במה הכסף מושקע", line: "מה שבתוך המוצר: מזומן, אג״ח, מדד מניות. הוא קובע מה עולה ויורד." },
    link: "בכל עמוד של מוצר יש שורה עם מה שאפשר להשקיע בתוכו.",
  },
  start: {
    title: "מאיפה להתחיל",
    // each line is the page's own "למה משתמשים בזה" sentence, shortened; the link goes to that page
    items: [
      { id: "keren-hishtalmut", lead: "שכירים שהמעסיק מפקיד להם:" },
      { id: "pension-comprehensive", lead: "הבסיס של כל חוסך שכיר:" },
      { id: "money-market-fund-daily", lead: "כסף שצריך להישאר זמין:" },
    ],
  },
  purposeGroups: { short: "כסף שוטף וקצר", "tax-benefit": "חיסכון עם הטבת מס", retirement: "פרישה", children: "לילדים", "self-directed": "לבחירה עצמית", other: "עוד" } as Record<string, string>,
  /** Products whose official name must be decoded: the card also shows the plain name the product's own record carries (names.he[1]). */
  plainSubtitleFor: ["pension-comprehensive", "pension-general", "provident-for-annuity", "child-savings-provident"],
  alsoCalled: "בשפה פשוטה:",
} as const;

export const guide = {
  indexTitle: "בעמוד הזה",
  sections: [
    { id: "what", title: "מה זה" },
    { id: "use", title: "למה משתמשים בזה" }, // audit 2026-10-24 (A42): directly under "מה זה"
    { id: "different", title: "מה מייחד" }, // D29 (2026-10-25): shown only on a page with a visual; guide.tsx filters it
    { id: "worth", title: "שווה לדעת" }, // knowledge layer 2026-10-24 (W6): shown only on wrappers with a P-09 block; guide.tsx filters it
    { id: "who", title: "מי מציע ומי מפקח" },
    { id: "inout", title: "כסף נכנס ויוצא" },
    { id: "cost", title: "כמה זה עולה" },
    { id: "tax", title: "מיסוי" },
    { id: "risk", title: "סיכונים ומה לא מוגן" },
    { id: "check", title: "מה האתר לקח בחשבון" }, // audit 2026-10-24 (A42): was "מה לבדוק"
    { id: "terms", title: "מונחים" },
  ] as const,
  // audit 2026-10-24 (A42, A43, A86)
  rulesToggle: { show: "הצגת החוקים והכללים", hide: "הסתרת החוקים והכללים" },
  exposuresRow: "במה אפשר להשקיע בתוכו:",
  companiesShow: "הצגת החברות",
  companiesHide: "הסתרת החברות",
  companiesOpen: "פתוחות לכלל הציבור",
  companiesClosed: "לעובדי מגזר או מפעל מסוים",
  companiesClosedLine: "אצל החברות האלה המסלולים של המוצר הזה מיועדים רק לעובדים של מגזר או של מפעל מסוים.",
  generalTermsShow: "הצגת המונחים הכלליים",
  termsShowAll: "הצגת כל המונחים של העמוד",
  termsHideAll: "הסתרת המונחים",
  graphTitle: "מה קורה לכסף לאורך הזמן",
  headline: { before: "נשאר לכם אחרי", after: "אחרי דמי ניהול ומס, בכסף של היום", afterNominal: "אחרי דמי ניהול ומס, בשקלים של העתיד" },
  // audit 2026-10-24 (A45): the headline says it is an example and names its inputs; each gap is filled by a Num
  headlineExample: { lead: "דוגמה:", plus: "ועוד", perMonth: "בחודש, בתשואה של", perMonthCash: "בחודש, בריבית של", perYear: "בשנה, משאירים לכם אחרי" }, // perMonthCash 2026-10-25: a cash-like page runs on a rate, not a return
  modes: { real: "בכסף של היום", nominal: "בשקלים של העתיד" },
  modeLabel: "אופן הצגת הסכומים",
  legend: { net: "נשאר לכם", tax: "מס", fees: "דמי ניהול", contributions: "ההפקדות שלכם" },
  chips: { amount_now: "סכום היום", monthly_deposit: "הפקדה חודשית", horizon_years: "שנים", "A-01": "תשואה בשנה", cash_rate: "ריבית בשנה", "A-02": "אינפלציה בשנה", all: "כל ההנחות" },
  readout: { today: "היום", year: "שנה" },
  table: { year: "שנה", contributions: "ההפקדות שלכם", fees: "דמי ניהול", tax: "מס", net: "נשאר לכם" },
  graphAria: { before: "גרף: הכסף לאורך", after: "הנתונים המלאים בטבלה." },
  rulesLine: "חוקים וכללים:",
  markers: { free: "אפשר למשוך מכאן", age: "גיל" },
  enteredReturnCaption: "הקו המקווקו מבוסס על תשואה שהזנתם, לא על הערכה של האתר.",
  enteredRateCaption: "הקו המקווקו מבוסס על ריבית שהזנתם, לא על זו שפורסמה או על הנחה של האתר.", // 2026-10-25
  feesIndependent: "לא תלויים ביתרה",
  feesIndependentShort: "לא תלויים ביתרה",
  blockedBand: "לא מחושב: שאלה פתוחה",
  figureNotUpdated: { before: "הנתון לא עודכן:", middle: "היה בתוקף עד", after: "עד שהוא יעודכן, האתר לא מחשב את הגרף.", link: "לפרטים" },
  appliesToYou: "לפי מה שהזנתם",
  employeesOnly: "לשכירים בלבד",
  selfEmployedOnly: "לעצמאים בלבד",
  whoLine: "לכל חברה יש עמוד עם כל המסלולים שלה.",
  allCompanies: "כל החברות",
  feeTable: { type: "סוג", base: "על מה נגבה", cap: "תקרה", rules: "חוקים וכללים" },
  feeNote: "אלה התקרות שבחוק. כמה כל חברה גובה בפועל, בכל מסלול, מופיע בעמוד של החברה.",
  feeNoteOther: "הסכומים בפועל נקבעים אצל הגורם המציע. כאן מופיעים סוגי העלויות, ותקרה כשיש תקרה בחוק.",
  taxSteps: { deposit: "בהפקדה", during: "כל עוד הכסף בפנים", exit: "כשמושכים" },
  // audit 2026-10-24 (A46): the study fund's deposit-side row by employment (TXH-04, TXH-01, TXH-03 for employees; TXH-05 for the self-employed)
  hishtalmutDeposit: {
    unknown: { headline: "תלוי אם אתם שכירים או עצמאים", employee: "שכירים:", selfEmployed: "עצמאים:" },
    employee: { headline: "אין ניכוי על ההפקדה שלכם", text: "הפקדת המעסיק בגבולות המותרים לא נחשבת הכנסה כשהיא נכנסת לקרן; מה שמעבר לגבולות ממוסה כשכר." },
    employeeShort: "אין ניכוי על ההפקדה שלכם. הפקדת המעסיק בגבולות המותרים לא ממוסה בהפקדה, ומעבר להם היא ממוסה כשכר.",
    selfEmployed: { headline: "ניכוי מההכנסה, עד תקרה", before: "אפשר לנכות עד", middle: "מההכנסה הקובעת, עד תקרה שנתית." },
  },
  related: "כדאי להכיר גם:",
  checklist: { blocked: "חסום:", considered: "נלקח בחשבון", notRelevant: "לא רלוונטי", blockedMark: "חסום: שאלה פתוחה", expand: "מאיפה זה", blockedLast: "עד שהשאלה תיסגר, האתר לא מחשב את זה.", intro: "כך האתר בודק כל מוצר, מול אותן שאלות. כאן מה שעוד פתוח; את כל הבדיקות אפשר לפתוח למטה.", showAll: "הצגת כל הבדיקות", hideAll: "הסתרת הבדיקות" }, // audit 2026-10-24 (A42)
  termsLine: "איך קוראים לזה בדוח, באפליקציה ובחוק.",
  generalTermsLabel: "מונחים כלליים",
  generalTermsLine: "מונחים שמשותפים לרוב המוצרים, לא רק לזה.",
  where: { statement: "דוח שנתי", "bank-statement": "דף חשבון", payslip: "תלוש שכר", app: "אפליקציה", ad: "פרסומת", law: "חוק", form: "טופס", bylaws: "תקנון", "gemel-net": "גמל נט", prospectus: "תשקיף", tariff: "תעריפון", "fund-name": "שם הקרן", "tax-form": "טופס מס", "pensia-net": "פנסיה נט", "provider-site": "אתר הגורם המציע" } as Record<string, string>,
  termTable: { term: "מונח", meaning: "מה זה", where: "איפה מופיע" },
  pcChooseHint: "בחרו מסלול כדי לראות את כל הפרטים ומה לבדוק", // from the approved company mockup
  sliderAria: "מחוון",
} as const;

export const values = {
  title: "ההנחות של הגרף",
  fields: { amount_now: "סכום היום", monthly_deposit: "הפקדה חודשית", horizon_years: "כמה שנים", "A-01": "תשואה בשנה", cash_rate: "ריבית בשנה", "A-02": "אינפלציה בשנה", age: "גיל", employment: "סוג ההעסקה" },
  optional: "(לא חובה)",
  employment: { employee: "שכירים", "self-employed": "עצמאים" },
  units: { nis: "₪", pct: "%", years: "שנים" },
  stateStart: "שדה שלא הזנתם הוא ערך התחלתי, פרמטר של האתר.", // one line above the fields (UX fix 17); a field shows its own state only once entered
  stateEntered: "הזנתם",
  hints: { return: "התשואה ההתחלתית היא דוגמה, לא תחזית.", cashCommon: { before: "הריבית ההתחלתית היא הריבית שרוב הבנקים משלמים בעו״ש:", prefix: "ב־", of: "מתוך", after: "הבנקים שנאספו. ריבית שתזינו תחול על כל היתרה." }, cashPublished: "הריבית שהבנק פרסם; ריבית שתזינו תחול על כל היתרה.", cashAssumption: "הריבית ההתחלתית היא הנחה של האתר: אין ריבית שפורסמה למוצר הזה.", asOf: "נכון ל־", inflation: "בכמה המחירים עולים בשנה, בממוצע.", age: "מסמן בגרף גילים שבהם החוקים והכללים משתנים.", employment: "מסמן בעמוד את החלקים שנוגעים לכם." },
  returnNote: "תשואה שתזינו תסומן בגרף בקו מקווקו, כי היא שלכם ולא של האתר.",
  returnNoteCash: "ריבית שתזינו תסומן בגרף בקו מקווקו, כי היא שלכם.", // 2026-10-25
  agePlaceholder: "למשל 30", // from the approved mockup
  errors: { nan: "הזינו מספר.", negative: "הסכום לא יכול להיות שלילי.", years: ["הזינו מספר שנים בין", "ל־"], age: ["הזינו גיל בין", "ל־"], pct: ["הזינו אחוז בין", "ל־"] },
  loading: "טוען…",
} as const;

export const provenance = {
  sourced: {
    source: "מקור",
    publisher: "פורסם על ידי",
    checked: "נבדק",
    from: "בתוקף מתאריך",
    to: "בתוקף עד",
    rule: "חוק או כלל",
    // audit 2026-10-24 (A21, A25)
    forYear: "תקף לשנת",
    englishTitle: "שם המקור באנגלית",
    localFile: "קובץ נתונים של האתר",
    lineBefore: "הנתון נלקח מהמקור שלמטה.",
    noValue: "הנתון הזה לא נמצא במקור, ולכן האתר לא מציג מספר.",
    notYetInForce: "עד אז הנתון הזה עוד לא חל; האתר מציג אותו כפי שפורסם.",
  },
  computed: { formula: "נוסחה", inputs: "ערכים שנכנסו לחישוב", rules: "חוקים וכללים שנכנסו לחישוב", weakInputs: "בין הערכים שנכנסו לחישוב, אלה לפי מסמך של החברה:" },
  // audit 2026-10-24 (A21): a flag with no sentence of its own
  flagOther: "הערה על החישוב:",
  entered: { line: "הזנתם את הערך הזה.", instead: "במקום:" },
  // 2026-10-25: `more` folds the parameter file's general line away from the clicked number's own line
  parameter: { why: "למה הערך הזה", more: "עוד על הפרמטר", approved: "תאריך אישור", notApproved: "עוד לא אושר", noRationale: "ערך שהאתר קבע בעצמו; הוא לא בא מהחוק." },
  stale: { before: "לא עודכן מאז", middle: "בדרך כלל מתעדכן", cadence: { daily: "כל יום", monthly: "כל חודש", quarterly: "כל רבעון", yearly: "כל שנה" } },
  allRulesOf: "לכל החוקים והכללים של",
  unit: {
    nis_per_month: "בחודש",
    pct_per_year: "בשנה",
    // audit 2026-10-24 (A76): the word after a figure that has no sign of its own
    months: "חודשים",
    years: "שנים",
    days: "ימים",
    business_days: "ימי עסקים",
    usd: "דולר",
    eur: "יורו",
  },
} as const;

export const rule = {
  title: "חוק או כלל",
  conditions: "תנאים וחריגים",
  figures: "סכומים לפי שנת מס",
  source: "מקור",
  topic: "נושא",
  checked: "נבדק",
  recheck: "ייבדק שוב",
  all: "לכל החוקים והכללים",
  open: { title: "שאלה פתוחה:", unknown: "מה עוד לא ידוע", waiting: "מה מחכה לתשובה", last: "בינתיים האתר לא מחשב את זה." },
  dimensions: "נוגע ל",
  noText: "הנוסח במילים פשוטות עוד לא נכתב; הכותרת מופיעה כפי שהיא במאגר החוקים והכללים.",
  // audit 2026-10-24 (A26): the "מקור" row of a rule with no link yet
  sourceMissing: "הקישור למקור עוד לא צורף.",
} as const;

export const rulesPage = {
  title: "חוקים וכללים",
  lede: "כל חוק וכל כלל שהאתר משתמש בו, עם המקור שלו. מה שהמקור שלו חלש יותר מסומן, ושאלה פתוחה מסומנת במנעול.",
  openQuestions: "שאלות פתוחות בנושא הזה",
  filter: "חיפוש לפי מספר, כותרת או טקסט",
  filterNone: "שום דבר לא מתאים לחיפוש.",
  filterMatching: "תואמים",
  // Hebrew names of the rule-base topics, from the il-finance index; copy.md 3.14
  groups: {
    "tax-general.md": "מס: כללי",
    "tax-interest-deposits-bonds.md": "מס: ריבית, פיקדונות ואג״ח",
    "tax-securities-israeli.md": "מס: ניירות ערך וקרנות ישראליות",
    "tax-securities-foreign.md": "מס: ניירות ערך וקרנות זרות",
    "tax-pension-gemel-lekitzba.md": "מס: פנסיה וקופת גמל לקצבה",
    "tax-hishtalmut.md": "מס: קרן השתלמות",
    "tax-gemel-lehashkaa-ira-child.md": "מס: קופת גמל להשקעה, ניהול אישי וחיסכון לכל ילד",
    "bank-current-account-deposits.md": "עובר ושב ופיקדונות",
    "mutual-funds-and-money-market-funds.md": "קרנות נאמנות וקרנות כספיות",
    "etfs-and-index-funds.md": "קרנות סל וקרנות מחקות",
    "brokerage-account.md": "חשבון השקעות",
    "government-bonds-and-makam.md": "אג״ח ממשלתיות ומק״מ",
    "kupat-gemel-lehashkaa.md": "קופת גמל להשקעה",
    "keren-hishtalmut.md": "קרן השתלמות",
    "pension-and-gemel-lekitzba.md": "פנסיה וקופת גמל לקצבה",
    "child-savings.md": "חיסכון לכל ילד",
    "ira-self-directed.md": "ניהול אישי",
    "provident-family-common.md": "חוקים וכללים משותפים לכל קופות הגמל",
    "regulators-and-protection.md": "מי מפקח ומה מוגן",
    "tracks-catalogue-and-decoder.md": "מסלולים והקטלוג",
    "bank-product-names.md": "שמות מוצרים בכל בנק",
    "switching-and-transfers.md": "מעבר בין גופים והעברת כספים",
    "corporate-bonds.md": "אג״ח קונצרניות",
    "fx-and-structured-deposits.md": "מט״ח ופיקדונות מובנים",
    "managed-and-robo-portfolios.md": "תיקים מנוהלים ותיקים דיגיטליים",
    "reits-and-gold-funds.md": "קרנות ריט וקרנות זהב",
    "savings-policies-and-executive-insurance.md": "פוליסות חיסכון וביטוח מנהלים",
    "tax-insurance-and-amendment-190.md": "מס: ביטוח ותיקון 190",
    "tax-tier2-other.md": "מס: מט״ח, אג״ח קונצרניות, ריט, זהב ותיקים מנוהלים",
  } as Record<string, string>,
  /** Topic name when a file is not in the map above: never a file name. */
  topicOther: "נושא נוסף במאגר החוקים והכללים",
} as const;

/** The Hebrew topic name of a rule-base file (never the file name). */
export function topicName(file: string): string {
  return (rulesPage.groups as Record<string, string>)[file] ?? rulesPage.topicOther;
}

export const parametersPage = {
  title: "פרמטרים של האתר",
  lede: "החלטות שהאתר מקבל בעצמו, כמו מתי שתי אפשרויות נחשבות שקולות. הן לא באות מהחוק, ואי אפשר לשנות אותן מהעמוד.",
  rows: { why: "למה", approved: "תאריך אישור", usedIn: "משמש ב:" },
  provisional: "ערך זמני שהאתר קבע",
  notSet: "עוד לא נקבע",
  // Hebrew names of the parameters (method.md §2.3 names them in English); copy.md 3.15
  names: {
    "P-01": "סף תיקו",
    "P-02": "גבולות בדיקת הרגישות",
    "P-03": "ספי ההכרעה על דמי ניהול",
    "P-04": "התאמת סיווג מסלול לטווח",
    "P-05": "התרחיש לדוגמה בעמודי המדריך",
    "P-06": "סטייה מותרת בבדיקות",
    "P-07": "נקודות ההתחלה של טופס המטרה",
  } as Record<string, string>,
  noCeiling: "ללא תקרה",
  // audit 2026-10-24 (A77): the Hebrew names of the products P-08 names by id
  wrapperNames: {
    "bank-deposit": "פיקדון בבנק",
    "brokerage-account": "חשבון השקעות",
    "government-bond": "אג״ח ממשלתית",
    "kupat-gemel-lehashkaa": "קופת גמל להשקעה",
    makam: "מק״מ",
  } as Record<string, string>,
  wrapperOther: "מוצר נוסף",
  /** Hebrew label of every parameter field, keyed by method id and field path ({row} is the classification of a table row, {preset} a preset's name). copy.md 3.15 */
  fields: {
    "P-01.value": "הפרש יחסי שמתחתיו שתי אפשרויות שקולות",
    "P-02.bounds.lo": "{name}: הגבול התחתון",
    "P-02.bounds.hi": "{name}: הגבול העליון",
    "P-03.negotiate_nis": "עלות לאורך האופק שמעליה שווה להתמקח",
    "P-03.avoid_nis": "עלות לאורך האופק שמעליה שווה להימנע",
    "P-03.negotiate_share": "חלק מכלל העלות (סף ההתמקחות)",
    "P-04.table.horizon_min_years": "סיווג {row}: אופק מינימלי",
    "P-04.table.horizon_max_years": "סיווג {row}: אופק מקסימלי",
    "P-04.table.max_fall_pct": "סיווג {row}: ירידה מרבית מקובלת",
    "P-05.inputs.amount_now": "סכום התחלתי",
    "P-05.inputs.monthly_deposit": "הפקדה חודשית",
    "P-05.inputs.horizon_years": "אופק",
    "P-05.inputs.A-01": "תשואה שנתית ברוטו למוצרי שוק (A-01)",
    "P-05.inputs.A-02": "אינפלציה שנתית (A-02)",
    "P-05.inputs.cash_rate": "ריבית למוצרים דמויי מזומן",
    "P-05.inputs.annual_income": "הכנסה שנתית ברוטו",
    "P-05.sliders.monthly_deposit.min": "מחוון ההפקדה החודשית: מינימום",
    "P-05.sliders.monthly_deposit.max": "מחוון ההפקדה החודשית: מקסימום",
    "P-05.sliders.monthly_deposit.step": "מחוון ההפקדה החודשית: גודל צעד",
    "P-05.sliders.horizon_years.min": "מחוון האופק: מינימום",
    "P-05.sliders.horizon_years.max": "מחוון האופק: מקסימום",
    "P-05.sliders.horizon_years.step": "מחוון האופק: גודל צעד",
    "P-05.ranges.age.min": "גיל מותר בשדה: מינימום",
    "P-05.ranges.age.max": "גיל מותר בשדה: מקסימום",
    "P-05.ranges.pct.min": "אחוז שנתי מותר בשדה: מינימום",
    "P-05.ranges.pct.max": "אחוז שנתי מותר בשדה: מקסימום",
    "P-06.abs_nis": "סטייה מותרת בשקלים",
    "P-06.rel_pct": "סטייה מותרת באחוזים",
    "P-07.presets.horizon_years": "{preset}: כמה שנים",
    "P-07.presets.monthly_deposit": "{preset}: הפקדה חודשית",
    "P-07.presets.must_stay_available_share": "{preset}: החלק שנשאר זמין",
    "P-07.presets.withdrawable_any_time": "{preset}: חייב להיות ניתן למשיכה בכל רגע",
    "P-07.ranges.horizon_years.min": "מחוון השנים: מינימום",
    "P-07.ranges.horizon_years.max": "מחוון השנים: מקסימום",
    "P-07.ranges.horizon_years.step": "מחוון השנים: גודל צעד",
  } as Record<string, string>,
  /** Names of the assumptions a P-02 bound moves (method.md 2.2). */
  boundNames: {
    "A-01": "תשואה שנתית ברוטו (A-01)",
    "A-02": "אינפלציה שנתית (A-02)",
    "A-03": "שינוי שער המטבע מול השקל (A-03)",
    "A-06": "עלות בתוך הקרן (A-06)",
    fee_rates: "מכפיל של כל עמלה",
    horizon: "שינוי באופק, בשנים",
  } as Record<string, string>,
  yearsWord: "שנים",
} as const;

export const companies = {
  title: "מה חברה מציעה לי",
  lede: "בחרו חברה כדי לראות את כל המוצרים והמסלולים שלה, ומה כל אחד מהם.",
  filter: "חיפוש חברה",
  noMatch: "אין חברה בשם הזה.",
  searchAll: "לחיפוש בכל האתר",
  back: "חברות ומסלולים",
} as const;

export const company = {
  lineBefore: "כל מה שהחברה מציעה, עם הסבר לכל מסלול. המסלולים לפי נתוני רשות שוק ההון, ביטוח וחיסכון, נכון ל",
  feesLine: "דמי הניהול שמופיעים ליד כל מסלול הם ממוצע של כל העמיתים במסלול, אחרי הנחות, לפי דיווח המסלול לרשות שוק ההון. לא בהכרח מה שתשלמו אתם.",
  feeColumn: "דמי ניהול מחיסכון, ממוצע {year}",
  feeRow: "דמי ניהול מחיסכון, ממוצע",
  feeRowWhole: "לקרן כולה",
  listHeading: "כל המסלולים של",
  tracks: { one: "מסלול אחד", two: "שני מסלולים", many: "מסלולים" },
  trackLine: { fund: "קופה", classification: "במה הכסף מושקע:" },
  sameName: { distinct: "שני מסלולים באותו שם: שתי קופות נפרדות", twice: "אותו מסלול מופיע פעמיים", unresolved: "לא הוכרע: הנתונים לא מראים אם זו אותה קופה" },
  oldData: "נתוני הרשות לא עודכנו מאז",
  paste: { title: "לא מצאתם שם?", label: "הקלידו או הדביקו את השם כמו שהוא מופיע באפליקציה, בפרסומת או בדוח.", placeholder: "למשל: גמל להשקעה כללי" },
  whatIs: "מה זה", // "מה זה קופת גמל להשקעה" link under a group, from the approved mockup
  productType: "סוג המוצר", // PC side card, from the approved mockup
  toGuide: "לעמוד המדריך על",
  pcColumns: { name: "שם המסלול, כמו שהחברה כותבת אותו", fund: "קופה", classification: "סיווג", holds: "במה הכסף מושקע", open: "פתיחה", group: "קבוצה" }, // from the approved mockup
  notInData: "לא נמצא בנתוני הרשות",
  default: "ברירת המחדל",
  subSpecialization: "התמחות:",
} as const;

export const track = {
  fundLine: "קופה",
  labels: { manager: "חברה מנהלת", product: "סוג מוצר", classification: "סיווג", holds: "במה הכסף מושקע", feeBalance: "דמי ניהול מחיסכון", feeDeposit: "דמי ניהול מהפקדה", period: "נכון לחודש", population: "למי מיועד", inception: "נפתח ב־" },
  feeBalanceLabel: "ממוצע דמי הניהול מחיסכון שנגבו בפועל בשנת {year}",
  feeDepositLabel: "ממוצע דמי הניהול מהפקדה שנגבו בפועל בשנת {year}",
  feeWhole: "לקרן כולה",
  feeNotReported: "עוד לא דווח",
  sameNameElsewhere: "יש מסלול נוסף באותו שם.",
  toOther: "למסלול השני",
  toGuide: "לעמוד המדריך על",
} as const;

export const notCovered = {
  title: "מה האתר עוד לא מכסה",
  lede: "מוצרים שהאתר מכיר אבל עוד לא יכול להסביר עד הסוף, ולמה.",
  rows: { known: "מה ידוע", open: "מה עוד פתוח", why: "למה זה חשוב" },
  empty: "כרגע האתר מכסה את כל המוצרים שהוא מכיר.",
  openLine: "החוקים והכללים לזה עוד בבדיקה. עד שייסגרו, האתר לא מחשב אותו.",
  notice: "החוקים והכללים לכל המוצרים כאן עוד בבדיקה. עד שייסגרו, האתר לא מחשב אותם.",
  blockedTag: "לא מחושב",
  alsoCalled: "נקרא גם",
  // audit 2026-10-24 (A58): what the site does not compare or do, from product.md section 4; this is by design, not a gap to fill
  wontDo: {
    title: "מה האתר לא משווה ולא עושה",
    lede: "אלה לא חסרים זמניים. האתר בנוי כך, ועל כל זה לא תמצאו כאן תשובה.",
    items: [
      "הלוואות: משכנתאות ואשראי צרכני",
      "ביטוח, חוץ מפוליסות חיסכון",
      "בחירת מניות, מסחר ונגזרים",
      "נדל״ן פיזי ומוצרי הון פרטי",
      "דירוג לפי תשואה בעבר",
      "חלוקה אוטומטית של הכסף בין מטרות",
      "ביצוע פעולות: אין כאן קנייה, העברה או הגשת בקשה",
      "חשבון משתמש: אין כניסה, והמידע שלכם נשאר במכשיר",
    ],
  },
} as const;

/** Plain-Hebrew reasons a run can fail with, carried as `messageHe` on a failure result (copy.md 7.1, added 2026-10-24, txh-limit). No engine message reaches the page. */
export const runFailure = {
  employerAboveTotal: "הפקדת המעסיק שהוזנה גבוהה מסך ההפקדה החודשית. בדקו שסכום ההפקדה כולל את חלק העובד וחלק המעסיק.",
  blocked: "החוקים והכללים לחישוב הזה עוד בבדיקה, ולכן האתר לא מחשב אותו.",
  figureNotUpdated: "אחד הנתונים בחישוב לא עודכן, ולכן האתר לא מחשב אותו.",
  generic: "האתר לא הצליח להריץ את החישוב עם הערכים האלה. בדקו את ההנחות שהזנתם.",
} as const;

export const system = {
  calcFailed: "האתר לא הצליח לחשב את הגרף. רעננו את העמוד ונסו שוב.",
  wentWrong: { title: "משהו השתבש", line: "האתר לא הצליח להציג את העמוד הזה. אפשר לרענן, או לחזור לעמוד הראשי.", home: "לעמוד הראשי", reload: "לרענן את העמוד" },
  notFound: { title: "העמוד הזה לא קיים. אולי הקישור ישן.", home: "לעמוד הראשי", search: "לחיפוש" },
  staleBanner: { before: "חלק מהנתונים בעמוד לא עודכנו מאז", after: "הם מסומנים בשעון." },
  loading: "טוען…",
  notInData: "לא נמצא בנתוני הרשות",
} as const;

/** Hebrew names of the formulas a sheet names (method.md F-IDs); copy.md 3.8. */
export const formulaNames: Record<string, string> = {
  "A-06": "העלות בתוך הקרן: סכום כל מרכיביה",
  "F-05": "ההפקדות לאורך הזמן",
  "F-06": "ערך בכסף של היום",
  "F-08": "חשבון הכסף חודש אחרי חודש",
  "F-09": "השווי במשיכה",
  "F-11": "דמי ניהול מהפקדה",
  "F-15": "דמי ניהול מחיסכון",
  "F-16": "דמי ניהול לחודש",
  "F-20": "מס על חלוקות מקרן או ממניה", // audit 2026-10-24 (A42): the brokerage guide's "while the money is in" step showed only this code
  "F-21": "מס על ריבית פיקדון",
  "F-22": "מס על ריבית תוכנית חיסכון",
  "F-23": "קרן כספית: המס בזמן ההחזקה",
  "F-24": "מס על דמי ניכיון במק״מ",
  "F-25": "מס על קופון באג״ח ממשלתית",
  "F-26": "מס על ריבית בעו״ש",
  "F-27": "קופת גמל: אין מס כל עוד הכסף בפנים",
  "F-40": "מס על רווח במכירת ניירות ערך",
  "F-41": "מס על ריבית שנצברה בפיקדון במשיכה",
  "F-46": "קרן השתלמות: המס במשיכה",
  "F-50": "חיסכון לכל ילד: המס במשיכה",
  "F-51": "ניהול אישי: המס במשיכה",
  "F-33": "הפקדה בלי הטבת מס",
  "F-43": "מס נוסף על הכנסה גבוהה",
  "F-44": "מס במשיכה מקופת גמל להשקעה",
  "F-67": "הגרף בעמודי המדריך",
  // audit 2026-10-24 (A21): names for the formulas a sheet shows beside its id, so no sheet opens on a bare code
  "F-17": "דמי ניהול קבועים בחשבון",
  "F-18": "עמלה על ריבית ודיבידנד",
  "F-30": "הפקדה שעולה לכם אותו סכום נטו",
  "F-47": "קרן השתלמות: משיכה מוקדמת",
  "F-60": "מה עולה להשאיר כסף בעו״ש",
  "F-61": "כמה דמי הניהול עולים לאורך הזמן",
  "F-62": "האם כדאי להתמקח על דמי הניהול",
  "F-63": "עלות העמלות אצל הספק",
  "F-64": "השוואת כל המסלולים של גוף",
  "F-65": "קרנות חלופיות לאותה חשיפה",
  "F-66": "עלות המעבר לקרן אחרת",
  "F-68": "הממוצע שהרשות מפרסמת לסיווג",
  "F-72": "איחוד חשבונות",
  "F-80": "דירוג האפשרויות והשוואה ביניהן",
  "F-81": "בדיקת רגישות להנחות",
  "F-83": "ספירת המסלולים שנכללו",
  "F-84": "שער חליפין מחושב משערי הבנק המרכזי האירופי",
  "F-85": "הריבית שרוב הבנקים משלמים בעו״ש",
  B3: "אפשרות שהכסף בה נעול עד סוף התקופה",
  /** Shown when a formula has no name above: no code in place of words. */
  _other: "חישוב של האתר",
};

/** What each engine flag means, in one line (method.md §12); copy.md 3.8. The code stays beside the words. */
export const flags: Record<string, string> = {
  "G-02": "בסיס המס במשיכה: לפי החוק המס הוא על הרווח הריאלי, כי חלק ההצמדה פטור. האתר מציג גם את החלופה של שיעור נמוך יותר על הרווח הנומינלי, שלפי דברי ההסבר לחוק לא חלה כאן.", // 2026-10-25 tax-bases research: the base is the law's (TXK-07)
  "G-11": "דמי ביטוח לאומי על הרווח במשיכה: עוד לא ברור אם חלים. האתר לא מחשב אותם.",
  "G-14": "הוצאות ישירות של המסלול לא נאספו עדיין, ולכן לא נכללו בחישוב.",
  "G-21": "חלק מהמס מוסדר דרך דוח שנתי, לא בניכוי במקור.",
  "PF-13": "ההנחה בדמי הניהול הוארכה לחמש שנים לפחות, לפי חוזר הרשות.",
  "TXK-OQ12": "מגיל הפרישה המוקדמת: האם מדרגות המס הנמוכות חלות על הרווח במשיכה, עוד לא ברור. האתר לא מחשב את ההקלה.",
};

/** Labels of the values a computation reads, shown in the number sheet (copy.md 3.8 "ערכים שנכנסו לחישוב"). */
export const computedInputs = {
  /** audit 2026-10-24 (A21): Hebrew names for the input keys the engine and the site's lifts write in English; a key not here (already Hebrew) is shown as written */
  names: {
    amount: "הסכום שנבדק",
    rate: "הריבית שהוצעה",
    baseline: "הריבית בעו״ש",
    balance: "היתרה",
    keep: "מה שחייב להישאר זמין",
    fee: "סוג דמי הניהול",
    fund_classification: "סיווג הקרן",
    specialization: "התמחות",
    period: "התקופה",
    count: "מספר המסלולים",
    statistic: "סוג הממוצע",
    real_value_without_fee: "הערך בכסף של היום בלי העמלה",
    real_value_with_fees: "הערך בכסף של היום עם העמלות",
    real_value_without_fees: "הערך בכסף של היום בלי העמלות",
    real_value_at_new_rate: "הערך בכסף של היום בשיעור החדש",
    real_value_without_provider_fees: "הערך בכסף של היום בלי עמלות הספק",
    real_value_with_provider_fees: "הערך בכסף של היום עם עמלות הספק",
    nominal_value_without_provider_fees: "הערך בלי עמלות הספק",
    nominal_value_with_provider_fees: "הערך עם עמלות הספק",
    real_value_no_switch: "הערך בלי מעבר, בכסף של היום",
    real_value_with_switch: "הערך עם המעבר, בכסף של היום",
    fee_line: "שורת העמלה",
    new_rate: "השיעור החדש",
    total_drag: "כל העלות",
    sum_of_line_costs: "סכום עלויות השורות",
    horizon_months: "מספר החודשים",
    month: "החודש",
    at_month: "חודש המעבר",
    tax_at_switch: "מס במכירה במעבר",
    level: "רמת העמלות",
    lines: "שורות העמלה",
    wrapper: "המוצר",
    share: "החלק שעובר",
    move: "הסכום שעובר",
    rule_ids: "החוקים והכללים",
  } as Record<string, string>,
  /** Values the engine writes in English (the `statistic` input, a fee level): shown in Hebrew. */
  valueWords: { mean: "ממוצע", median: "חציון", list: "תעריפון", average: "ממוצע הרשות", entered: "שהזנתם" } as Record<string, string>,
  amountNow: "סכום היום",
  monthly: "הפקדה חודשית",
  years: "שנים",
  grossReturn: "תשואה בשנה",
  cashRate: "ריבית בשנה",
  inflation: "אינפלציה בשנה",
  balanceFee: "דמי ניהול מחיסכון",
  depositFee: "דמי ניהול מהפקדה",
  directExpenses: "הוצאות ישירות",
  paidIn: "סך ההפקדות",
  grossBalance: "השווי לפני דמי ניהול ומס",
  realGain: "רווח ריאלי",
  taxRate: "שיעור המס",
  taxDuring: "מס בזמן ההחזקה",
  taxAtExit: "מס במשיכה",
  fees: "דמי ניהול",
  net: "נשאר לכם",
  index: "עליית המחירים עד אז",
  altNominalRate: "שיעור המס על הרווח הנומינלי",
  altTax: "החלופה: מס על הרווח הנומינלי",
  about: {
    headline: "מה שנשאר אחרי דמי ניהול ומס, אם מושכים בסוף התקופה",
    net: "מה שנשאר אם מושכים בסוף שנה",
    tax: "המס אם מושכים בסוף שנה",
    fees: "דמי הניהול שנגבו עד סוף שנה",
    contributions: "כל מה שהפקדתם עד סוף שנה",
    realGain: "הרווח שמעבר לעליית המחירים, עד סוף שנה",
    altTax: "המס לפי החלופה שהחוק מאפשר: אחוז קבוע מהרווח הנומינלי",
  },
} as const;

/** Fixed lines of the guide's key-value, fee and tax blocks, keyed by what the record says; copy.md 3.5a. */
export const guideBlocks = {
  ceiling: {
    perYearAll: "לשנה, לכל אדם בכל הקופות יחד",
    taxYear: "שנת המס",
    // one line per `ceiling.per` value the records use (the year line is the one above)
    per: {
      person_per_calendar_year: "לשנה, לכל אדם בכל הקופות יחד",
      person_per_month: "לחודש, לכל אדם",
      person_total_across_all_ira_accounts: "בסך הכול, לכל אדם בכל חשבונות הניהול האישי יחד",
      person_total_across_all_study_fund_accounts: "בסך הכול, לכל אדם בכל חשבונות קרן ההשתלמות יחד",
    } as Record<string, string>,
    labelTotal: "תקרה על הסכום הכולל",
  },
  exit: {
    anyTime: "בכל עת, את כל הכסף או חלק ממנו",
    labelWithdraw: "משיכה",
    labelFree: "מתי הכסף פנוי",
    labelDays: "תוך כמה זמן הכסף אצלכם",
    upTo: "עד",
    businessDays: "ימי עסקים",
    // a payout time that only one company was read for (D30, 2026-10-25): the company is named, the others were not checked
    onlyAt: { before: "כך אצל", after: "; אצל האחרים לא נבדק" },
    labelSwitch: "מעבר בין מסלולים",
    labelCeiling: "תקרת הפקדה",
    // one line per `lawful_exit.kind` (data-schema 3.3); each number is a Num on the page; copy.md 3.5a
    atMaturity: "בסוף התקופה שנקבעה בהסכם",
    atMaturityTerm: { before: "בתום", after: "" },
    afterYears: { before: "כשעוברות", after: "מההפקדה הראשונה" },
    atAge: { before: "מגיל", after: "" },
    atChildAge: { before: "כשהילד מגיע לגיל", after: "" },
    tradingDay: "בכל יום מסחר, במחיר של אותו יום",
    otherKind: "לפי התנאים שבנוסח שלמטה",
    textNote: "הנוסח המלא, כפי שהוא במקור:",
    // audit 2026-10-24 (A22): the Hebrew text of the rules the sentence cites, else the English wording, said to be English
    textNoteHe: "הפירוט המלא, לפי החוקים והכללים:",
    textNoteEn: "הנוסח באנגלית:",
    // audit 2026-10-24 (A14): the exit row of the money-in-and-out list points at the switching steps
    switchHow: "איך עוברים, שלב אחרי שלב",
  },
  fees: {
    balance: { name: "דמי ניהול מחיסכון", base: "כל שנה, מכל הכסף שנצבר", after: "בשנה" },
    deposit: { name: "דמי ניהול מהפקדה", base: "מכל סכום שמפקידים", after: "מכל הפקדה" },
    direct_expenses: { name: "הוצאות ישירות", base: "עלויות הקנייה והמכירה של ההשקעות, מהקופה", cap: "אין תקרה כוללת" },
    exit: { name: "דמי יציאה", base: "כשמושכים", cap: "אין" },
    // the other fee bases of the schema (`feeBase`), name and what they are charged on; copy.md 3.5a
    trade: { name: "עמלת קנייה ומכירה", base: "מכל פעולת קנייה או מכירה" },
    custody: { name: "דמי ניהול פיקדון ניירות ערך", base: "כל תקופה, על ניירות הערך שבחשבון" },
    fx: { name: "המרת מטבע", base: "מכל המרה של שקלים למטבע זר או חזרה" },
    fixed_period: { name: "דמי חשבון קבועים", base: "כל חודש או רבעון, בלי קשר לסכום" },
    distribution_handling: { name: "טיפול בריבית ובדיבידנד", base: "מכל תשלום ריבית או דיבידנד שנכנס לחשבון" },
    spread: { name: "מרווח קנייה ומכירה", base: "בכל קנייה ומכירה בבורסה, כחלק מהמחיר" },
    creation_redemption: { name: "עמלת יצירה ופדיון", base: "כשההזמנה עוברת למנהל הקרן ולא לבורסה" },
    transfer_out: { name: "העברה החוצה", base: "כשמעבירים את הכסף למוסד אחר" },
    load: { name: "הוספה", base: "נוסף על מחיר היחידה בקנייה, והולך למנהל הקרן ולא לקרן" },
    redemption_deduction: { name: "ניכוי בפדיון", base: "ממחיר הפדיון, רק אם הסכם הקרן קובע ניכוי כזה" },
    variable_management: { name: "דמי ניהול משתנים", base: "לפי הפער בין הקרן למדד, נוסף על דמי הניהול הקבועים; כשהקרן מפגרת אחרי המדד, המנהל משלם לה" },
    trustee: { name: "שכר נאמן", base: "כל שנה, מנכסי הקרן, בתוך מחיר היחידה" },
    insurance_premium: { name: "דמי ביטוח", base: "כל חודש, מהחיסכון, על כיסוי למקרה מוות או נכות" },
    upTo: "עד",
    zeroCap: "אין",
    noCap: "אין תקרה בחוק",
    tariffSet: "לפי התעריפון של הגורם המציע",
    unitAfter: { pct_per_year: "בשנה", pct_of_deposit: "מכל הפקדה", pct_of_trade: "מכל פעולה", pct_of_balance_per_period: "בכל תקופה", nis_per_month: "בחודש", nis_per_trade: "לכל פעולה", nis: "", pct: "" } as Record<string, string>,
  } as Record<string, any>,
  taxSteps: {
    "F-33": { headline: "אין הטבת מס", text: "מפקידים מכסף שכבר שולם עליו מס." },
    "F-27": { headline: "אין מס על הרווחים", text: "גם מעבר בין מסלולים לא ממוסה." },
    "F-44": { before: "עד", after: "מהרווח הריאלי", text: "כלומר מהרווח שמעבר לעליית המחירים.", baseTag: "בסיס המס: לפי החברה", altBefore: "האתר מציג גם חלופה:", altAfter: "מהרווח הנומינלי." },
    // every other formula a wrapper record may name (method.md 5 to 9); one headline and one sentence each; copy.md 3.5a
    "F-21": { headline: "מס על הריבית בסוף כל פיקדון", text: "הבנק מנכה את המס מהריבית בסוף התקופה, והסכום נטו נפתח מחדש כפיקדון." },
    "F-22": { headline: "מס על הריבית בסוף כל תקופה", text: "המס לא מבדיל בין תוכנית חיסכון לפיקדון: הריבית ממוסה בסוף כל תקופה." },
    "F-23": { headline: "בקרן כספית פטורה אין מס בזמן ההחזקה", text: "חלוקות, אם יש, ממוסות כשהן משולמות. בקרן שהיא עצמה חייבת במס, הקרן משלמת את המס ולא אתם." },
    "F-24": { headline: "ההפרש בין מחיר הקנייה לפדיון נחשב ריבית", text: "המס על ההפרש מנוכה בפדיון, וסדרה חדשה נקנית מהסכום נטו." },
    "F-25": { headline: "מס על כל תשלום ריבית", text: "המס מנוכה בכל תשלום, והקופון נטו נקנה מחדש." },
    "F-26": { headline: "מס על הריבית כשהיא נזקפת", text: "הבנק מנכה את המס מהריבית בכל חודש שבו היא נכנסת לחשבון." },
    "F-30": { headline: "הפקדה שעלותה נטו שווה לסכום שבחרתם" },
    "F-31": { headline: "זיכוי במס על ההפקדה לפנסיה, לשכירים" },
    "F-32": { headline: "זיכוי או ניכוי במס על ההפקדה: לעצמאים ולמי שנחשב עמית מוטב" },
    "F-40": { headline: "מס על הרווח במכירה", text: "המס מנוכה במכירה, מהרווח הריאלי או מהרווח הנומינלי, לפי סוג הנכס." },
    "F-41": { headline: "המס כבר שולם בכל פדיון", text: "במשיכה, הפיקדון האחרון נחשב כאילו נפדה ביום המשיכה, והריבית שנצברה בו ממוסה." },
    "F-42": { headline: "מגיל הפרישה המוקדמת: מדרגות המס שלכם", text: "על רווחים מסוימים חלות מדרגות המס של האדם, אם הן נמוכות מהשיעור הקבוע." },
    "F-43": { headline: "מס נוסף על הכנסה גבוהה", text: "מי שההכנסה השנתית שלו עוברת סף שבחוק משלם מס נוסף, דרך הדוח השנתי." },
    "F-45": { headline: "העברה לקצבה מגיל הפרישה המוקדמת" },
    "F-46": { headline: "בקרן השתלמות: פטור במשיכה אחרי תקופת ההמתנה", text: "הרווח מההפקדות המוטבות פטור ממס. רווח מהפקדה מעל הסכום המוטב ממוסה במשיכה." },
    "F-47": { headline: "משיכה מוקדמת מקרן השתלמות" },
    "F-48": { headline: "משיכה מוקדמת מפנסיה" },
    "F-49": { headline: "קצבה בפרישה" },
    "F-50": { headline: "חיסכון לכל ילד: מס על הרווח במשיכה", text: "ההפקדות, התוספת מההורה והמענקים אינם הכנסה. המס מנוכה במשיכה, ורק על הרווח." },
    "F-51": { headline: "ניהול אישי: המס כמו של הקופה שאושרה", text: "החשבון ממוסה כמו סוג הקופה שהוא אושר כמוה." },
    "F-52": { headline: "כסף שהמעסיק מפקיד" },
    "F-53": { headline: "דמי הביטוח בקרן הפנסיה" },
    "F-54": { headline: "חיסכון לכל ילד: ההפקדות של המדינה", text: "הביטוח הלאומי מפקיד סכום חודשי עד גיל הפדיון, והסכום מתעדכן פעם בשנה." },
  } as Record<string, Record<string, string>>,
  /** The rate line under a tax-at-exit step, one per rate its record cites; the rate itself is a Num between `before` and `after`. */
  exitRates: {
    realBasis: { before: "", after: "מהרווח הריאלי" },
    realLinkedBond: { before: "אג״ח צמודה למדד:", after: "מהרווח הריאלי" },
    nominalBasis: { before: "", after: "מהרווח הנומינלי" },
    unlinkedInterest: { before: "ריבית לא צמודה:", after: "מהריבית, מנוכה בבנק" },
    linkedInterestCeiling: { before: "ריבית צמודה למדד: עד", after: "מהריבית הריאלית, מנוכה בבנק" },
    linkedInterest: { before: "ריבית צמודה למדד:", after: "מהריבית הריאלית, מנוכה בבנק" },
    hishtalmutExcess: { before: "על הפקדה מעל הסכום המוטב:", after: "מהרווח הריאלי" },
    childProvident: { before: "במסלול קופת גמל:", after: "מהרווח הריאלי" },
    childBankLinked: { before: "בבנק, פיקדון צמוד למדד:", after: "מהרווח הריאלי" },
    childBankUnlinked: { before: "בבנק, פיקדון לא צמוד:", after: "מהרווח הנומינלי" },
  } as Record<string, { before: string; after: string }>,
  /** Shown on a tax step whose formula the site does not compute yet. */
  notComputed: { text: "האתר עוד לא מחשב את זה", releaseBefore: "יתווסף בגרסה", releaseAfter: "" },
  regulatorNames: { CMA: "רשות שוק ההון, ביטוח וחיסכון", BoI: "בנק ישראל", ISA: "רשות ניירות ערך", MoF: "משרד האוצר" } as Record<string, string>,
  /** Why a guide page has no graph (in place of the empty card). */
  noGraph: {
    missingBefore: "עוד לא נאספו נתונים ל",
    missingAfter: "ולכן עוד אין גרף לעמוד הזה.",
    unknownCause: "הגרף של העמוד הזה עוד לא מחושב.",
    parts: { deposit: "תנאי הפיקדון", fund: "קרן מייצגת", tariff: "תעריפון העמלות", series: "סדרת האג״ח הממשלתית", ira: "דמי הניהול של מנהל החשבון", employment: "סוג ההעסקה בדוגמה", other: "כל מה שהחישוב צריך" } as Record<string, string>,
  },
  /** The product terms an illustrative run read (values sheet and panel). */
  terms: {
    title: "תנאי המוצר בדוגמה",
    line: "הערכים האלה נלקחו מהנתונים של האתר. אי אפשר לשנות אותם מכאן.",
    labels: {
      term: "תקופה",
      linkage: "הצמדה",
      couponEvery: "תדירות הקופון",
      balanceCeiling: "תקרת היתרה שנושאת ריבית",
      tradeRate: "עמלת קנייה ומכירה",
      tradeMin: "עמלת קנייה ומכירה, מינימום",
      tradeMax: "עמלת קנייה ומכירה, מקסימום",
      custodyRate: "דמי ניהול פיקדון ניירות ערך",
      custodyMin: "דמי ניהול פיקדון ניירות ערך, מינימום",
      custodyMax: "דמי ניהול פיקדון ניירות ערך, מקסימום",
      fxRate: "עמלת המרת מטבע",
      monthlyFee: "דמי חשבון קבועים",
      iraManagerFee: "דמי ניהול של מנהל החשבון",
      fundManagement: "דמי ניהול של הקרן",
      fundVariable: "דמי ניהול משתנים של הקרן",
      fundTrustee: "שכר הנאמן של הקרן",
      fundTracking: "פער המעקב של הקרן",
      fundWithholding: "מס זר שנגבה בתוך הקרן",
      fundHalfSpread: "חצי ממרווח הקנייה והמכירה",
      regBalance: "ממוצע דמי הניהול מחיסכון שנגבו בפועל בשנת {year} (לא תעריפון)",
      regDeposit: "ממוצע דמי הניהול מהפקדה שנגבו בפועל בשנת {year} (לא תעריפון)",
      ninetyPercentTest: "מבחן 90% בקרן זרה",
    } as Record<string, string>,
    linkage: { unlinked: "לא צמוד", cpi: "צמוד למדד", prime: "צמוד לפריים" } as Record<string, string>,
  },
} as const;

/** Exposure pages (flows 6.6): section headings, kind names and the lines between; copy.md 3.6. */
export const exposurePage = {
  sections: [
    { id: "what", title: "מה זה" },
    { id: "hold", title: "איך מחזיקים את זה" },
    { id: "risk", title: "סיכונים" },
    { id: "check", title: "מה האתר לקח בחשבון" }, // audit 2026-10-24 (A42)
    { id: "terms", title: "מונחים" },
  ] as const,
  // audit 2026-10-24 (A83, A85)
  currencies: { ILS: "₪", USD: "$", EUR: "€" } as Record<string, string>,
  openDetails: "יש שאלות פתוחות",
  kinds: { equity_index: "מדד מניות", bond_index: "מדד אג״ח", cash_like: "מזומן ודומיו", mixed: "תמהיל של כמה סוגי נכסים", commodity: "סחורות", other: "אחר" } as Record<string, string>,
  kindLabel: "סוג",
  currencyLabel: "מטבע",
  holdLine: "המוצרים שבהם אפשר להחזיק את זה. ההשוואה ביניהם למטרה שלכם: בעמוד ״השוואה למטרה״.",
  holdNone: "עוד לא נאספו המוצרים שמחזיקים את זה.",
  openTax: "עוד לא ברור איך זה ממוסה כאן: שאלה פתוחה",
  toGuide: "לעמוד המדריך",
  noProse: "הטקסט של העמוד הזה עוד לא נכתב.",
  guideGroup: "עמודי מדריך על מה שהכסף מושקע בו",
} as const;

/** Catalogue lines on the company and track pages (flows 6.11, 6.12); copy.md 3.11 and 3.12. */
export const catalogue = {
  alsoCalled: "נקרא גם",
  seenAt: "מקור:",
  seenOn: "· נראה ב־",
  unassigned: { title: "שמות שעוד לא שויכו", line: "שמות שהחברה משתמשת בהם ושעוד לא שויכו למסלול בנתוני הרשות." },
  search: "שם מהקטלוג",
} as const;

// ---------------------------------------------------------------- release 2: goal form and comparison (docs/copy.md section 6)
/**
 * The goal form, the comparison result and the saved-goal strip (docs/copy.md 6.0 to 6.4). Strings copy.md holds are
 * used as written; the ones the build added are in copy.md's "added 2026-10-23" tables of those sections.
 * Figures never appear here: a `{…}` place in copy.md is filled by a Num on the page.
 */
export const r2 = {
  presets: { "liquid-reserve": "עתודה נזילה", "known-date": "קנייה במועד ידוע", "long-term": "הון לטווח ארוך", "lump-sum": "סכום חד־פעמי", child: "חיסכון לילד", none: "בלי נקודת התחלה" } as Record<string, string>,
  outcomes: { ranked: "דורגה", "listed-not-ranked": "מוצגת, לא מדורגת", excluded: "נפסלה לפי האילוץ שלכם", "not-eligible": "לא מתאימה לכם", "not-evaluated": "עוד לא נבדקה" } as Record<string, string>,
  outcomesPlural: { ranked: "דורגו", "listed-not-ranked": "מוצגות בלי דירוג", excluded: "נפסלו לפי האילוצים שלכם", "not-eligible": "לא מתאימות לכם", "not-evaluated": "עוד לא נבדקו" } as Record<string, string>,
  deciding: { "deposit-side-relief": "הטבת מס בהפקדה", "fee-drag": "דמי ניהול", "tax-at-exit": "מס (בהחזקה וביציאה)", "lock-up": "נעילה" } as Record<string, string>, // audit 2026-10-24 (A7): the figure is holding tax plus exit tax (ranking.ts taxAtExit)
  tieOne: "שקולה ל־",
  tieMany: "שקולות:",
  lockedUntil: "נעול עד",
  realLabel: "נשאר לכם במועד המטרה, בכסף של היום",
  nominalLabel: "נשאר לכם במועד המטרה, בשקלים של העתיד",
  saved: "נשמר במכשיר הזה",
  savedAuto: "נשמר אוטומטית במכשיר הזה. בלי חשבון, בלי שרת.",
  couldNotSave: "האתר לא הצליח לשמור במכשיר הזה. ההשוואה תעבוד, אבל המטרה לא תישמר.",
  loadingGoal: "טוען את המטרה השמורה…",
  menuRow: "השוואה למטרה",

  form: {
    // scenario fix 2026-10-24: child age, purchase cost, couple line, worst-fall hint
    childAge: "בן/בת כמה הילד? (או שנת לידה)",
    childAgeHint: "האופק הוא 18 פחות הגיל.",
    childAgeEmpty: "בלי גיל האופק הוא 18 שנים, פרמטר של האתר.",
    errChildAge: "הזינו גיל בין 0 ל־17, או שנת לידה.",
    targetCost: "כמה זה יעלה, בערך",
    targetCostHint: "לא חובה. התוצאה תראה אם הסכום מספיק, בלי להשפיע על הדירוג.",
    couple: "הטופס לאדם אחד. לזוג: הזינו את הסכומים המשותפים, ואת הפרטים של מי שהחיסכון על שמו.",
    worstFallShort: { before: "לטווח של", after: "שנים האתר לא מדרג מסלולים מנייתיים בלי תשואה שתזינו; השדה הזה משפיע רק עליהם." },
    title: "מה המטרה שלכם?",
    lede: "בחרו נקודת התחלה או מלאו בעצמכם. כל ערך אפשר לשנות, והכול נשמר במכשיר הזה.",
    presetLabel: "נקודת התחלה",
    filledBefore: "השדות ",
    filledAfter: " מולאו כנקודת התחלה. שנו מה שמתאים.",
    filledNames: { horizonYears: "שנים", monthly: "הפקדה חודשית", available: "החלק שנשאר זמין", anytime: "אילוץ המשיכה" } as Record<string, string>,
    keptEntered: "מה שהזנתם נשמר.",
    card1: "המטרה",
    name: "שם המטרה (לא חובה)",
    years: "כמה שנים עד המטרה",
    amountNow: "סכום היום",
    monthly: "הפקדה חודשית",
    available: "כמה צריך להישאר זמין מיד",
    availableFrom: "מאיזה תאריך",
    availableHint: "החלק הזה נשאר בעו״ש או בקרן כספית יומית, ולא נכנס להשוואה.",
    constraints: "אילוצים",
    anytime: "חייב להיות ניתן למשיכה בכל רגע",
    noReturnBefore: "בלי צורך בדוח שנתי למס: עוד אי אפשר לבדוק. שאלה פתוחה",
    noReturnCode: "TXG OQ4",
    card2: "קצת עליכם",
    card2Why: "למה שואלים: תקרות ההפקדה והטבות המס תלויות בשכר ובהפרשות.",
    age: "גיל",
    employment: "סוג ההעסקה",
    salary: "שכר חודשי ברוטו",
    pension: "הפרשות לפנסיה",
    hishtalmut: "הפרשות לקרן השתלמות",
    employer: "מעסיק",
    employee: "עובד",
    hishtalmutYearly: "הפקדה שנתית לקרן השתלמות",
    hasPension: "יש לכם פנסיה דרך העבודה?",
    hasHishtalmut: "יש לכם קרן השתלמות דרך העבודה?",
    yes: "כן",
    no: "לא",
    payslip: "איפה זה בתלוש",
    payslipNoRule: "הנוסח עוד לא נמצא במאגר החוקים והכללים של האתר.",
    payslipLast: "השמות המדויקים בתלוש משתנים בין מעסיקים. האתר עוד לא מצא להם מקור רשמי.",
    card3: "ההנחות",
    return: "תשואה שנתית על החלק המושקע",
    returnEmpty: "לא הוזן: האתר לא מנחש תשואה.",
    returnHint: "הזינו את התשואה שאתם מניחים. היא תסומן בכחול בכל מקום שבו היא משפיעה.",
    returnFilled: "תשואה שהזנתם תסומן בגרף בקו מקווקו, כי היא שלכם ולא של האתר.",
    inflation: "אינפלציה בשנה",
    inflationStart: "ערך התחלתי, פרמטר של האתר",
    insurance: "דמי הביטוח בקרן הפנסיה, כאחוז מההפקדות",
    insuranceHint: "כיסוי למקרה מוות או נכות שיורד מהחיסכון כל חודש. בלי המספר הזה האתר לא משווה קרן פנסיה, כי הוא לא מנחש אותו. בקופת גמל לקצבה אין ביטוח כזה, ולכן היא לא צריכה אותו.",
    insuranceEmpty: "לא הוזן: קרנות הפנסיה יסומנו ״עוד לא נבדקה״.",
    goalsHeading: "המטרות שלכם",
    goalsLine: "המטרות נבדקות אחת אחת, מימין לשמאל: הראשונה מקבלת את הכסף קודם. גררו מטרה כדי לשנות את הסדר.",
    addGoal: "מטרה נוספת",
    // 2026-10-24 (founder): the chips are dragged sideways; the current one can be renamed and deleted in place
    renameGoal: "שינוי השם",
    renameField: "שם המטרה",
    deleteGoal: "מחיקת המטרה",
    unnamed: "מטרה ללא שם",
    ageUp: "להגדיל את הגיל בשנה",
    ageDown: "להקטין את הגיל בשנה",
    errYears: "הזינו לפחות שנה אחת.",
    errYearsWhole: "הזינו מספר שלם של שנים.",
    errAvailable: "החלק הזמין גדול מהסכום היום.",
    errPercentBefore: "הזינו אחוז בין 0 ל־",
    errSalary: "השכר לא יכול להיות שלילי.",
    oldVersion: "המטרה שנשמרה היא מגרסה ישנה של האתר.",
    oldVersionActions: { restart: "להתחיל מחדש", delete: "מחיקה מהמכשיר" },
    // audit 2026-10-24 (A38): the submit
    needBoth: "כדי להשוות, הזינו כמה שנים עד המטרה וסכום: היום או בכל חודש.",
    needYears: "כדי להשוות, הזינו כמה שנים עד המטרה.",
    needAmount: "כדי להשוות, הזינו סכום היום או הפקדה חודשית.",
    fixFields: "תקנו את השדות המסומנים כדי להשוות.",
    bounced: "ההשוואה צריכה מטרה: הזינו כמה שנים עד המטרה וסכום.",
    // audit 2026-10-24 (A61): a bound is named, with its unit
    errPctBetween: ["הזינו מספר בין", "ל־", "אחוז"],
    errMonth: ["הזינו חודש מ־", " עד "],
    // audit 2026-10-24 (A40): optional fields say what they are for
    salaryWhy: "לא חובה. בלי זה האתר לא מחשב קרן פנסיה וקרן השתלמות.",
    pensionWhy: "לא חובה. משמש לחישוב קרן פנסיה.",
    hishtalmutWhy: "לא חובה. משמש לחישוב קרן השתלמות.",
    payslipOne: "ההפרשות מופיעות בתלוש השכר, בשורות הפנסיה וקרן ההשתלמות.",
    payslipFull: "הנוסח המלא",
    // audit 2026-10-24 (A39): the self-employed form
    salarySelf: "הכנסה חודשית ממוצעת",
    salarySelfHint: "הזינו ממוצע שנתי חלקי 12.",
    pensionSelf: "הפקדות לפנסיה",
    employeeSelf: "אחוז מההכנסה",
    hasPensionSelf: "מפקידים לפנסיה בעצמכם?",
    hasHishtalmutSelf: "מפקידים לקרן השתלמות בעצמכם?",
    // audit 2026-10-24 (A3): employment type filled in from the answer
    employmentDefault: "נבחר שכירים כי יש לכם פנסיה או קרן השתלמות דרך העבודה.",
    employmentFlip: "לא נכון? שינוי לעצמאים",
  },

  strip: {
    saved: "נשמר במכשיר הזה",
    // NEW 2026-10-25 (the first page lists every goal as a row, the founder): a goal that holds nothing yet
    blank: "עוד לא מולאה",
    fill: "למילוי",
    savedAll: "נשמרו במכשיר הזה",
    toResult: "לתוצאה",
    edit: "עריכה",
    menu: "עוד פעולות",
    add: "מטרה נוספת",
    delete: "מחיקה מהמכשיר",
    confirm: "למחוק את המטרה מהמכשיר הזה?",
    confirmYes: "מחיקה",
    confirmNo: "ביטול",
    compact: "המטרה השמורה:",
    change: "שינוי",
    none: "עוד אין מטרה שמורה.",
    noneLink: "להגדיר מטרה",
    recomputed: "חושב מחדש עם הנתונים של היום.",
  },

  result: {
    title: "מה הכי מתאים",
    listHeading: "לפי הסדר",
    headlineSingle: "האפשרות היחידה שדורגה למטרה הזו היא", // audit 2026-10-24 (hebrew-editor request): the lead before the name, so the subject is "האפשרות"
    reasonFeeVs: "לעומת",
    reasonLock: "הכסף בה זמין במועד המטרה, בעוד",
    reasonLockUntil: "נעולה עד",
    secondarySource: "לפי מקור משני",
    tieMid: "שקולות למטרה הזו: ההפרש ביניהן",
    tieThen: ", פחות מסף התיקו של האתר,",
    allTied: "כל האפשרויות שדורגו שקולות למטרה הזו: ההפרשים ביניהן קטנים מסף התיקו של האתר,",
    onlyBaseline: "רק העו״ש יכול להיות מדורג למטרה הזו:",
    why: "למה",
    whyTitle: "למה",
    whyBefore: "לפני",
    whyRows: { relief: "הטבת מס בהפקדה", fees: "דמי ניהול", taxDuring: "מס בזמן ההחזקה", taxExit: "מס ביציאה", lockUp: "נעילה", result: "נשאר לכם" },
    whyDeciding: "ההבדל הגדול ביותר", // audit 2026-10-24 (A7): was "מכריע"; F-80 names the largest gap, which need not favour the winner
    whyDiffers: "מה הבדיל ביניהן",
    whyNone: "אין הבדל בין החוקים והכללים ששתי האפשרויות נשענות עליהם.",
    rank: "מקום",
    decidingLine: "ההבדל הגדול ביותר מול האפשרות שמעליה:", // audit 2026-10-24 (A7): was "מכריע לעומת האפשרות שמעליה:"
    atProvider: "בתעריפון", // 2026-10-24 (Doron's case): the headline names the tariff the securities account is priced on
    feeShield: "ההפרש במס נובע מדמי הניהול: ב{provident} הם יורדים מהצבירה ומקטינים את הרווח החייב במס; ב{securities} דמי ניהול פיקדון ניירות הערך אינם מקטינים אותו, חוץ מאלה של שנת המכירה.", // 2026-10-24 (Doron's case): a tax gap that is a fee effect (F-08 step 5, TXS-06)
    assumptionsOf: "ההנחות של השורה",
    detail: "פירוט",
    secondaryTag: "המס ביציאה לפי מקור משני",
    availableMid: "נשארים זמינים",
    availableIn: { "current-account": "בעו״ש", "money-market-fund-daily": "בקרן כספית יומית" } as Record<string, string>,
    availableWorth: "ושווים",
    availableAt: "במועד המטרה, בכסף של היום.",
    availableNoRun: "ועוד אין לאתר תנאים לחשב כמה הם שווים במועד המטרה.",
    listedHeading: "מוצגות בלי דירוג",
    listedValueUnlock: "במועד השחרור",
    listedValuePreTax: "לפני מס",
    listedLocked: "נעולה עד",
    listedLockedAfter: ": הערך במועד השחרור",
    listedEmployee: "שכירים: מופקדת רק דרך המעסיק",
    listedCeilingBefore: "אפשר להפקיד בה עד", // audit 2026-10-24 (A11): was "בתקרה השנתית נכנס רק חלק מהכסף: {סכום} עוברים למטרה הבאה"
    listedCeilingMid: "בשנה;",
    listedCeilingAfter: "נשארים בחוץ, והאתר לא מפצל.",
    listedBlockedBefore: "המס ביציאה חסום: שאלה פתוחה",
    listedHeldBefore: "מוחזקת בתוך",
    listedHeldAfter: ", ונבדקת כמוהו",
    chartTitle: "הכסף לאורך הזמן, באפשרויות המובילות",
    chartAria: "גרף: אפשרויות לאורך",
    chartHorizon: "מועד המטרה",
    chartTie: "שקולות",
    chartEnteredCaption: "הקווים המקווקווים מבוססים על תשואה שהזנתם, לא על הערכה של האתר.",
    chartEmpty: "אין אפשרויות מדורגות להצגה.",
    chartYear: "שנה",
    chips: { years: "שנים", amountNow: "סכום היום", monthly: "הפקדה חודשית", available: "זמין מיד", return: "תשואה", inflation: "אינפלציה", all: "כל ההנחות" },
    chipEmpty: "לא הוזן",
    assumptionsTitle: "ההנחות של ההשוואה",
    suggestion: "הצעה מהבדיקה",
    adopt: "לאמץ",
    coverageBefore: "נבדקו",
    coverageMid: "אפשרויות:",
    coverageOpen: "כל האפשרויות ולמה",
    coverageClose: "הסתרת הרשימה",
    coverageGroups: { "not-eligible": "לא מתאימות לכם", excluded: "נפסלו לפי האילוצים שלכם", "not-evaluated": "עוד לא נבדקו", "listed-not-ranked": "מוצגות בלי דירוג", ranked: "דורגו" } as Record<string, string>,
    coverageLast: "המסלולים והקרנות בתוך כל מוצר מושווים בעמודים ״כל המסלולים בכל החברות״ ו״איזו קרן לקנות״.",
    reasons: {
      savingsPlan: "אין עדיין תנאים של תוכניות חיסכון",
      renewable: "הפקדות חודשיות לקרן כספית מתחדשת עוד לא מוגדרות",
      tier2: "עוד לא מכוסה: שאלות פתוחות",
      enterReturn: "הזינו תשואה",
      enterSalary: "הזינו שכר",
      enterInsurance: "הזינו את דמי הביטוח",
      enterAge: "הזינו גיל",
      enterEmployment: "הזינו את סוג ההעסקה",
      figureNotUpdated: "הנתון לא עודכן:",
      notOwnMoney: "מקבל רק את הכספים מהביטוח הלאומי ואת הפקדת ההורה, לא את הכסף הזה",
      excludedBefore: "נפסלה לפי האילוץ:",
      noTerms: "עוד אין לאתר את תנאי המוצר",
      noRun: "עוד אין לאתר שיטת חישוב לזה",
      gap: "שיטת החישוב עוד לא מוגדרת",
      ruleMissing: "חסר במאגר החוקים והכללים",
      ruleOpen: "שאלה פתוחה",
      employeeNoSalary: "הזינו שכר", // keeps the key for the study fund of an employee
    },
    constraintAnytime: "חייב להיות ניתן למשיכה בכל רגע",
    sensTitle: "מה היה משנה את התשובה",
    sensFlip: "מתהפך אם",
    sensCross: "תעבור מ־",
    sensTo: " ל־",
    sensThen: ": אז",
    sensFirst: "ראשונה.",
    sensFirstAlone: "ראשונה לבדה.", // 2026-10-24 (Doron's case): a move that breaks a tie leaves one option first alone
    sensBreaks: "התיקו נשבר אם", // 2026-10-24 (Doron's case): was "מפריד בין השקולות אם"
    sensNoFlip: "לא מתהפך בטווח שנבדק:",
    sensUntil: " עד ",
    sensFooter: "הטווחים הם פרמטר של האתר, ואי אפשר לשנות אותם כאן.",
    sensRunning: "האתר בודק מה היה משנה את התשובה…",
    sensNames: { "A-01": "תשואה שנתית", "A-02": "אינפלציה", horizon: "שנים עד המטרה" } as Record<string, string>,
    sensFee: { balance: "דמי ניהול מחיסכון", deposit: "דמי ניהול מהפקדה", direct: "הוצאות ישירות", fund: "העלות בתוך הקרן", trade: "עמלת קנייה ומכירה", custody: "דמי ניהול פיקדון ניירות ערך" } as Record<string, string>,
    times: "פי",
    checklistTitle: "מה לבדוק",
    checklistAffected: "השפיע על:",
    checklistBlocks: "מונע דירוג של:",
    nothingRanked: "אף אפשרות לא דורגה למטרה הזו.",
    nothingRankedLine: "הסיבות העיקריות:",
    excludesAll: "האילוצים שלכם פוסלים את כל האפשרויות:",
    excludesAllLink: "לשינוי האילוצים",
    allKept: "כל הכסף צריך להישאר זמין, אין מה להשוות.",
    needMore: "כדי להשוות, הזינו כמה שנים עד המטרה, וסכום היום או הפקדה חודשית.",
    toForm: "לטופס המטרה",
    failed: "האתר לא הצליח לחשב את ההשוואה. רעננו את העמוד ונסו שוב.",
    cashBefore: "האפשרויות הנזילות חושבו לפי ריבית של",
    cashAfter: ", פרמטר של האתר. את הנתונים של בנק ישראל אי אפשר להציג כאן בלי הסכמתו בכתב.",
    cashLink: "לנתונים של בנק ישראל",
    bankPublished: "ריבית הבנק, בתוקף מ־",
    staleRow: "מבוסס על נתון שלא עודכן מאז",
    cashChip: "ריבית על הכסף הנזיל",
    rulesUsed: "החוקים והכללים שההשוואה נשענת עליהם",
    realNominal: "אופן הצגת הסכומים",
    tableYear: "שנה",
    modes: { real: "בכסף של היום", nominal: "בשקלים של העתיד" },
    reset: "חזרה לערך ההתחלתי",
    legendBaseline: "העו״ש",
    // ---- audit 2026-10-24 (WP1, comparison half). docs/copy.md section "audit 2026-10-24 (WP1a)" holds the rows.
    // A3: the headline in three lines
    headlineLead: "מבין {n} האפשרויות שדורגו, האפשרות שמשאירה לכם הכי הרבה כסף במועד המטרה היא {name}.", // audit 2026-10-24 (A3)
    headlineLeadTwo: "מבין שתי האפשרויות שדורגו, האפשרות שמשאירה לכם הכי הרבה כסף במועד המטרה היא {name}.", // audit 2026-10-24 (A3)
    headlineCashOnly: "עדיין אפשר לדרג רק את האפשרויות הנזילות.", // audit 2026-10-24 (A3)
    headlineUnevaluated: { one: "אפשרות אחת לא נבדקה:", two: "שתי אפשרויות לא נבדקו:", other: "{n} אפשרויות לא נבדקו:" }, // audit 2026-10-24 (A3, A91)
    headlineEnter: "הזינו", // audit 2026-10-24 (A3)
    headlineFields: { return: "תשואה", employment: "סוג העסקה", salary: "שכר", age: "גיל", insurance: "דמי ביטוח" } as Record<string, string>, // audit 2026-10-24 (A3)
    employmentInferred: "סוג ההעסקה: שכירים, כי יש לכם פנסיה או קרן השתלמות דרך העבודה.", // audit 2026-10-24 (A3)
    employmentInferredChange: "לשנות", // audit 2026-10-24 (A3)
    // home question card 2026-10-24: "לא יודעים" leaves the years to the preset; the line under the headline below P-04's equity minimum
    horizonDefaulted: { before: "לא ידעתם כמה שנים, ולכן ההשוואה רצה על", mid: "שנים, נקודת ההתחלה של ״", after: "״.", change: "לשנות" },
    horizonHonest: {
      cannot: "האתר לא קובע אם {years} שנים מספיקות למניות: אין לו תשואה צפויה ואין לו נתון על ירידות.",
      can: "לפי טבלת ההתאמה של האתר, מסלול מנייתי נחשב מתאים מ־{min} שנים, למי שמסכים לירידה של {drop} בדרך.",
      linkBefore: "כדי לבדוק עם המספרים שלכם: הזינו תשואה וירידה שתסכימו לספוג",
      link: "בהשוואה לפי חשיפה",
    },
    // A7: the largest difference, with a gross-return row
    biggestLead: "ההבדל הגדול ביותר בין שתי הראשונות:", // audit 2026-10-24 (A7)
    biggestAt: "אצל", // audit 2026-10-24 (A7): "{סכום} אצל {אפשרות}"
    biggestAgainst: "הפער הזה לרעת", // audit 2026-10-24 (A7)
    whyGross: "תשואה ברוטו שהחישוב רץ עליה", // audit 2026-10-24 (A7)
    whyGrossNote: "נתון שהוזן או פורסם, או פרמטר של האתר, לא תוצאה", // audit 2026-10-24 (A7)
    // A8: a deposit whose published rate was read for another amount
    ownRate: { about: "ריבית שהזנתם", chip: "ריבית שהזנתם" }, // audit 2026-10-24 (A8)
    depositRange: {
      between: "הריבית שנקראה חלה על הפקדות של {min} עד {max}.",
      from: "הריבית שנקראה חלה על הפקדות של {min} ומעלה.",
      below: "ההפקדה שלכם נמוכה מזה, ובסכום כזה הבנק עשוי להציע ריבית אחרת.",
      above: "ההפקדה שלכם גבוהה מזה, ובסכום כזה הבנק עשוי להציע ריבית אחרת.",
      own: "להזין ריבית אחרת",
      ownLabel: "ריבית שנתית שהבנק הציע לכם",
      reset: "לחזור לריבית שפורסמה",
    }, // audit 2026-10-24 (A8)
    // A10: the instrument a card's run rests on
    representative: {
      named: "חושב לפי הרשומה שנאספה: {name}",
      tariff: ", ותעריפון {provider}.",
      end: ".",
      generic: "חושב לפי רשומה מייצגת שנאספה לאתר, לא לפי בחירה שלכם.",
      change: "להחליף",
    }, // audit 2026-10-24 (A10)
    // A12: the accepted fall in shekels
    fallEcho: "הירידה שתסכימו לספוג: {pct} מ־{amount}, כלומר {drop} היום. היא לא משפיעה על הדירוג בהשוואה לפי מוצר.", // audit 2026-10-24 (A12)
    fallBand: "ירידה שתסכימו לספוג", // audit 2026-10-24 (A12): the chart's accessible name for the shaded band
    // A14: after "בחרתי בזה"
    chosenNext: { heading: "מה עושים עכשיו", pick: "לבחור חברה ומסלול", join: "איך מצטרפים או עוברים", fees: "מה העמלות יעלו לכם" }, // audit 2026-10-24 (A14)
    // A71
    saveMenu: "לשמור את ההשוואה", // audit 2026-10-24 (A71)
    saveMenuAgain: "לשמור שוב את ההשוואה", // audit 2026-10-24 (A71)
    // A91: counts with their verbs, from Intl-style forms (one, two, other)
    counts: {
      numerals: { one: "אחת", two: "שתיים" },
      ranked: { one: "דורגה", other: "דורגו" },
      "listed-not-ranked": { one: "מוצגת בלי דירוג", other: "מוצגות בלי דירוג" },
      "not-eligible": { one: "לא מתאימה לכם", other: "לא מתאימות לכם" },
      excluded: { one: "נפסלה לפי האילוצים שלכם", other: "נפסלו לפי האילוצים שלכם" },
      "not-evaluated": { one: "עוד לא נבדקה", other: "עוד לא נבדקו" },
    } as Record<string, Record<string, string>>, // audit 2026-10-24 (A91)
    // A60: a reason with the product's name first
    reasonLead: "{name}: ", // audit 2026-10-24 (A60)
  },
} as const;

// scenario fix 2026-10-24 (sc-represent, folded in by sc-compare): the entered fee level of the representative instrument (D4)
export const ownTermsCopy = {
  // scenario fix 2026-10-24 (sc-broker): the broker the brokerage option runs on is the person's choice among the providers the providers page ranks
  provider: {
    chosen: "בחרתם", // scenario fix 2026-10-24
    heading: "ספק שהתעריפון שלו ישמש בחישוב", // scenario fix 2026-10-24
    hint: "הספקים שנאספו בעמוד הספקים, לפי מה שהאפשרות הזו משאירה בסוף. התעריפון הוא של הספק; הבחירה שלכם.", // scenario fix 2026-10-24
    pick: "לבחור", // scenario fix 2026-10-24
    channel: { direct: "ערוץ ישיר", branch: "סניף" } as Record<string, string>, // scenario fix 2026-10-24
    reset: "לחזור לספק שהאתר בחר", // scenario fix 2026-10-24
    siteChoice: "בחירת האתר", // scenario fix 2026-10-24
  },
  feeAbout: "דמי ניהול שהזנתם", // scenario fix 2026-10-24
  feeChip: "דמי ניהול שהזנתם", // scenario fix 2026-10-24
  fundCostLabel: "העלות בתוך הקרן", // scenario fix 2026-10-24
  feeLabel: "דמי ניהול מחיסכון", // scenario fix 2026-10-24
  /** The sensitivity line in fee terms (2026-10-24, Doron's case: names the option and its fee, never "בקרן"); {name} is the option, {x} the percentage. The lead ("מתהפך אם" or "התיקו נשבר אם") comes before it. */
  feeFlip: {
    fund: { below: "העלות בתוך הקרן ב{name} נמוכה מ־{x}", above: "העלות בתוך הקרן ב{name} גבוהה מ־{x}" },
    balance: { below: "דמי הניהול מחיסכון ב{name} נמוכים מ־{x}", above: "דמי הניהול מחיסכון ב{name} גבוהים מ־{x}" },
  } as Record<"fund" | "balance", { below: string; above: string }>,
  openMinimum: "סכום המינימום: שאלה פתוחה", // scenario fix 2026-10-24
  line: { named: "לפי {name}", fee: " בדמי ניהול {fee}", tariff: " ותעריפון {provider}", tariffCheapest: " ותעריפון {provider}, הזול ביותר למטרה הזו מבין התעריפונים שנאספו", end: ".", change: "להחליף", workbench: "לבחירת מוצר אחר", feeLabel: "דמי ניהול שנתיים בקרן, באחוזים", reset: "לחזור לדמי הניהול של הרשומה", classMin: "הנמוכים ביותר שנאספו באותה חשיפה: {fee}", rateLabel: "ריבית שנתית שהבנק הציע לכם", rateReset: "לחזור לריבית שפורסמה" }, // scenario fix 2026-10-24
  // 2026-10-25 (D27, D28): the securities account names no index until the person chooses one
  index: {
    range: "בין {low} ל־{high} לפי המדד שתבחרו", // 2026-10-25
    rangeNote: "האתר לא ממליץ על מדד. הדירוג מניח את התוצאה הנמוכה מביניהם, כדי לא להציג את החשבון טוב ממה שהוא.", // 2026-10-25
    pickLabel: "בחרו מדד כדי לראות תוצאה אחת", // 2026-10-25
    groupLabel: "מדדים", // 2026-10-25
    chosen: "המדד שבחרתם", // 2026-10-25
    cheapest: "הדרך הזולה: {broker} · {fund}", // 2026-10-25
    all: "כל הדרכים להשקיע במדד ←", // 2026-10-25
    clear: "לבטל את בחירת המדד", // 2026-10-25
    noWay: "לא נמצאה דרך להשקיע במדד הזה לפי התוכנית, והחשבון מדורג לפי קרן הדוגמה של האתר.", // 2026-10-25
    notRun: "הדרך הזולה למדד הזה לא נכנסת עדיין לחישוב, והחשבון מדורג לפי קרן הדוגמה של האתר.", // 2026-10-25
  },
};

// scenario fix 2026-10-24 (sc-compare): what the comparison's headline says beyond the leader. docs/copy.md section 6.8 holds the rows.
export const scnCompare = {
  flipAlongside: "שקולה לראשונה.", // scenario fix 2026-10-24: a flip that only makes the leader share first place names the newcomer, never the current leader
  fitDrop: "לא מתאים לפי טבלת ההתאמה של האתר: מסלול מנייתי נחשב מתאים למי שמסכים לירידה של {drop} (פרמטר)", // scenario fix 2026-10-24
  notRanked: "לא מדורג", // scenario fix 2026-10-24
  limitation: {
    text: "האתר עוד לא יכול להמליץ ל־{years} שנים: דורגו רק האפשרויות הנזילות, כי לא הזנתם תשואה.", // scenario fix 2026-10-24
    enterReturn: "הזינו תשואה", // scenario fix 2026-10-24
    orYears: "או שנו את מספר השנים", // scenario fix 2026-10-24
  },
  cashVerdict: "בין האפשרויות הנזילות, {name} משאירה הכי הרבה כסף במועד המטרה.", // scenario fix 2026-10-24
  parameterRate: {
    text: "לפי ריבית של {rate} שהאתר קבע ל{name};", // scenario fix 2026-10-24
    enter: "הזינו ריבית אחרת", // scenario fix 2026-10-24
    label: "ריבית שנתית שקיבלתם", // scenario fix 2026-10-24
    reset: "לחזור לריבית שהאתר קבע", // scenario fix 2026-10-24
  },
  enteredReturn: {
    text: "לפי תשואה של {r} שהזנתם; האתר לא יודע אם היא סבירה.", // scenario fix 2026-10-24
    currency: "המדד נקוב {inCurrency}: החישוב משתמש בתשואה שהזנתם כמות שהיא, ולא מוסיף שינוי {rate} מול השקל.", // scenario fix 2026-10-24
    filterOff: "מסנן הירידה לא הופעל.", // scenario fix 2026-10-24
    sameReturn: "כל המדדים רצים על אותה תשואה שהזנתם; ההבדל ביניהם כאן הוא עמלות ומטבע.", // scenario fix 2026-10-24
  },
  currencyIn: { USD: "בדולרים", EUR: "ביורו" } as Record<string, string>, // scenario fix 2026-10-24
  currencyRate: { USD: "בשער הדולר", EUR: "בשער היורו" } as Record<string, string>, // scenario fix 2026-10-24
  targetCost: {
    enough: "לפי האפשרות המובילה, בכסף של היום: {value} מול {cost}; מספיק.", // scenario fix 2026-10-24
    short: "לפי האפשרות המובילה, בכסף של היום: {value} מול {cost}; חסר {gap}.", // scenario fix 2026-10-24
  },
  nextStep: {
    text: "בינתיים: הכסף לא צריך לשבת בעו״ש; לפי המספרים כאן זה עולה עד {x} בחודש.", // scenario fix 2026-10-24
    link: "לבדיקה בעמוד המזומן הנזיל", // scenario fix 2026-10-24
    stocks: "את ההחלטה על מניות אפשר לקבל בנפרד.", // scenario fix 2026-10-24
  },
  realTerms: "בכסף של היום, אחרי אינפלציה של {i}: {amount} שלא גדל שווה {y} בעוד {n} שנים.", // scenario fix 2026-10-24
  targetCostLabel: "מחיר המטרה שהזנתם", // scenario fix 2026-10-24
  realTermsAbout: "סכום שלא גדל, בכסף של היום", // scenario fix 2026-10-24
  horizonFigures: { first: "לשנה: {a}", rest: "ל־{n} שנים: {b}" }, // scenario fix 2026-10-24
  pick: { label: "בחרו שתי אפשרויות להשוואה", first: "האפשרות הראשונה", second: "האפשרות השנייה" }, // scenario fix 2026-10-24
  blockedFor: "חסום ל:", // scenario fix 2026-10-24: under a covered checklist row, the options blocked on that dimension
  headlineSome: "(לחלק מהן)", // scenario fix 2026-10-24
  pastRecord: {
    text: "ברשומה שפורסמה ({src}, בדולרים, לפני אינפלציה; חלונות של שנים קלנדריות, לפני עמלות ומס): התשואה השנתית של מדד S&P 500 לפי השקף נעה, בחלונות של 5 שנים, בין {min5} ל־{max5}; ב־10 שנים בין {min10} ל־{max10}; ב־20 שנים בין {min20} ל־{max20}. עבר, לא תחזית; המספרים האלה לא נכנסים לדירוג.", // scenario fix 2026-10-24
    link: "למקור", // scenario fix 2026-10-24
  },
};

// ---- release 2, idle cash (copy 6.3) and the fit mark (copy 6.5).

export const idle = {
  title: "כסף שיושב בעו״ש",
  lede: "שני מספרים, ותראו כמה עולה לכם להשאיר אותו שם.",
  fields: { balance: "כמה יש בעו״ש", keep: "כמה חייב להישאר זמין מיד" },
  errBalance: "הזינו סכום גדול מאפס.",
  errKeep: "הסכום גדול מהיתרה בעו״ש.",
  fill: "מלאו את שני המספרים.",
  headlineBefore: "להשאיר",
  headlineMid: "בעו״ש עולה לכם עד",
  headlineAfter: "בחודש",
  headlineLabel: "העלות החודשית הגבוהה ביותר מבין האפשרויות הנזילות",
  noCost: "לפי הנתונים של האתר אף אפשרות נזילה לא משלמת יותר מהעו״ש, ולכן להשאיר אותו שם לא עולה לכם כלום.",
  allKept: "כל הכסף צריך להישאר זמין, אין מה להשוות.",
  rowNames: { "bank-deposit:average": "פיקדון", "bank-deposit:own-offer": "פיקדון לפי ההצעה שהזנתם, בחישוב לחודש", "money-market-fund-daily": "קרן כספית", makam: "מק״מ" } as Record<string, string>,
  perMonth: "בחודש",
  rateOf: "ריבית",
  labels: { entered: "הזנתם", parameter: "פרמטר של האתר", published: "בתוקף מ־" },
  mmfNote: "הריבית כאן משמשת כקירוב לתשואת הקרן.",
  makamNoCommission: "בלי עמלת קנייה",
  baselineBefore: "העו״ש משלם היום",
  baselineAfter: ".",
  baselineNone: "לפי הנתונים של האתר העו״ש לא משלם ריבית.",
  boiBefore: "הממוצע שבנק ישראל מפרסם לכל בנק לא מופיע כאן: תנאי השימוש של בנק ישראל לא מתירים לפרסם אותו מחדש בלי הסכמה בכתב.",
  boiLink: "לממוצעים של בנק ישראל",
  boiParam: "הריבית של הקרן הכספית והמק״מ היא פרמטר של האתר, לא נתון של בנק ישראל.",
  rowNotRun: "עוד לא נבדקה", // the row of a cash option the run could not do
  optional: "לדייק (לא חובה)",
  offer: "ההצעה לפיקדון שראיתם באפליקציה של הבנק",
  offerHint: "כמו שהיא מופיעה אצלכם, באחוזים לשנה.", // changed 2026-10-24 (scenario audit 7): the offer is no longer read as a one-month deposit
  // audit 2026-10-24 (A20, A59, A61): the yearly line, the offer's unit check, the deposit the person already holds
  soWhat: { before: "זה כ־", after: " בשנה, אם הכסף נשאר שם כל השנה." },
  offerUnit: { before: "התכוונתם ל־", after: "%? הריבית כאן באחוזים לשנה, למשל 3.2." },
  offerBelow: "ההצעה נמוכה ממה שהעו״ש משלם, ולכן להעביר אליה עולה לכם.",
  haveDeposit: "יש לכם כבר פיקדון? האתר עוד לא רושם פיקדונות. השוו את הריבית שלו לשורות כאן.",
  invalid: "תקנו את הערך שסומן באדום כדי לראות את התוצאה.",
  // scenario audit 2026-10-24 (7, 8, 4): the offer's term, the one-year verdict, the tax in words, the judgement on the size, the small-sum line
  term: {
    label: "לכמה זמן ההצעה",
    options: { "1": "חודש", "3": "3 חודשים", "12": "שנה", other: "אחר" } as Record<string, string>,
    otherLabel: "כמה חודשים",
    errMonths: "הזינו מספר שלם של חודשים, מ־1 עד 60.",
    ask: "בחרו לכמה זמן ההצעה, וכאן תראו מה היא שווה בשנה מול קרן כספית.",
  },
  verdict: {
    heading: "ההצעה של הבנק מול קרן כספית, לשנה",
    bank: "הבנק מציע ריבית של",
    termOf: { "1": "לפיקדון של חודש", "3": "לפיקדון של 3 חודשים", "12": "לפיקדון של שנה" } as Record<string, string>,
    termMonths: { before: "לפיקדון של ", after: " חודשים" },
    afterTax: ": אחרי מס כ־",
    perYear: " בשנה.",
    perYearShort: " בשנה",
    fund: "קרן כספית ב־",
    fundState: "פרמטר של האתר",
    gap: "ההפרש:",
    inFavor: { offer: "לטובת הפיקדון", fund: "לטובת הקרן", even: "אין הפרש" } as Record<string, string>,
    below: "מתחת לסף שהאתר קבע",
    worth: "שווה לבדוק",
    thresholdLabel: "הסף:",
    rolled: "החישוב מניח שפיקדון קצר מתחדש באותה ריבית עד סוף השנה.",
    longer: "התקופה ארוכה משנה: החישוב לוקח שנה אחת ממנה.",
    liquidity: "הפיקדון נעול עד סוף התקופה או עד תחנת היציאה; הקרן נזילה בכל יום מסחר.",
  },
  taxWords: {
    heading: "המס, במילים",
    deposit: "בפיקדון משלמים",
    depositMid: "מכל הריבית, והבנק מנכה אותם במקור.",
    fund: "בקרן כספית פטורה משלמים",
    fundMid: "רק מהרווח שמעבר לעליית המדד, ולכן כשהאינפלציה גבוהה חלק גדול מהתשואה פטור.",
    fundTrack: "מסלול המס של כל קרן כתוב בתשקיף שלה.",
  },
  materiality: {
    before: "בסכום כזה ההפרש הוא כ־",
    perYear: " בשנה: ",
    below: "מתחת לסף שהאתר קבע",
    worth: "שווה את הטרחה",
    thresholdLabel: "הסף:",
  },
  smallSum: "בקרן כספית קונים ופודים בדרך כלל בלי סכום מינימלי, ובבנק שיש לו הסכם הפצה עם מנהל הקרן אסור לגבות עמלה על קנייה, החזקה או פדיון.",
  anytime: "הכסף צריך להיות זמין בכל רגע",
  anytimeHint: "אם לא תסמנו, ההשוואה המלאה תכלול גם פיקדון נעול.",
  coverageBefore: "נבדקו",
  coverageMid: "אפשרויות:",
  coverageClose: "הסתרת הרשימה",
  coverageOpen: "כל האפשרויות ולמה",
  kinds: { baseline: "העו״ש עצמו", compared: "הושוו אליו", "not-eligible": "לא מתאימות לכם", "not-evaluated": "לא נכללו בהשוואה המהירה" } as Record<string, string>,
  kindsTag: { baseline: "העו״ש", compared: "הושוותה", "not-eligible": "לא מתאימה לכם", "not-evaluated": "לא נכללה בהשוואה המהירה" } as Record<string, string>,
  notQuick: "לא נכלל בהשוואה המהירה",
  notQuickLine: "כדאי לבדוק בהשוואה המלאה",
  fullLink: "להשוואה המלאה, עם המטרה ״עתודה נזילה״",
  rowsHeading: "מה זה עולה לכם",
  failed: "האתר לא הצליח לחשב. רעננו את העמוד ונסו שוב.",
  loading: "טוען את הנתונים…",
  noBaseline: "עוד אין לאתר את הריבית של העו״ש, ולכן אי אפשר להשוות.",
} as const;

export const fit = {
  heading: "מתאים למטרה שלכם?",
  marks: { fits: "מתאים", "no-fit": "לא מתאים", "no-rule": "אין כלל לסיווג הזה" } as Record<string, string>,
  goalLine: "לפי המטרה ״",
  goalLineMid: "״, ",
  horizonOnly: "לפי השנים עד המטרה בלבד.",
  ruleBefore: "לפי טבלת ההתאמה של האתר, לסיווג ״",
  ruleAfter: "״",
  ruleRange: "מתאים החל מ־",
  toCompare: "להשוואה למטרה הזו",
  changeGoal: "שינוי המטרה",
  noGoal: "אין מטרה שמורה. הגדירו מטרה כדי לראות אם המסלול מתאים לה.",
  noGoalLink: "להגדיר מטרה",
  stale: "נתוני הסיווג לא עודכנו מאז",
  companyLine: "ההתאמה לפי המטרה השמורה:",
  rowAria: "התאמה למטרה:",
  fitsWord: "מתאים",
  noFitWord: "לא מתאים",
} as const;

// Release 3: the track workbench and the entry points (docs/copy.md 7.0, 7.3, 7.5; flows 12.3, 12.5). The strings the
// build added are in copy.md 7.3's "Added 2026-10-24" table, keyed by path.
export const r3workbench = {
  title: { before: "כל המסלולים של ", after: " בכל החברות" },
  line: {
    before: "לפי נתוני רשות שוק ההון, ביטוח וחיסכון, נכון ל",
    mid: ". דמי הניהול הם ממוצע ",
    after: " של כל העמיתים במסלול, אחרי הנחות; לא בהכרח מה שתשלמו אתם.",
    noYear: ". דמי הניהול הם ממוצע של כל העמיתים במסלול, אחרי הנחות; לא בהכרח מה שתשלמו אתם.", // copy.md 7.3: the same line when the file names no year
  },
  noGoal: "אין מטרה שמורה. הגדירו מטרה כדי לראות התאמה.",
  tabs: { aria: "תצוגה", byTrack: "לפי מסלול", byProvider: "לפי ספק" },
  providerLine: "הטבלה לפי ספקים, עם התעריפונים: בעמוד ״איזה בנק או בית השקעות״.",
  chips: { aria: "במה הכסף מושקע", all: "הכול", noClass: "בלי סיווג בנתונים" }, // noClass: the coverage group's words (copy 7.3)
  filter: "חיפוש חברה או מסלול",
  sort: { aria: "סדר ההצגה", company: "חברה", "fee-balance": "מחיסכון", "fee-deposit": "מהפקדה", name: "שם" },
  notAnOffer: "ממוצע הוא מה שהעמיתים שילמו בפועל, לא הצעה אליכם.",
  // audit 2026-10-24 (A36, A82, A87): the open-to-all filter, the sort direction words, the key for "עוד לא דווח"
  openToAll: { label: "פתוח לכולם", hidden: "מסלולים הפתוחים רק לקבוצה מסוימת מוסתרים", none: "אין מסלולים שפתוחים רק לקבוצה מסוימת" },
  sortDir: { asc: "מהנמוך לגבוה", desc: "מהגבוה לנמוך" },
  missingKey: "עוד לא דווח: החברה לא דיווחה לרשות את הנתון לתקופה הזו.",
  // copy.md 7.3 (added 2026-10-24, B14): one and two are words, not "1 מסלולים"
  group: { suffix: "מסלולים", matching: "תואמים", one: "מסלול אחד", two: "שני מסלולים", matchingOne: "אחד תואם" },
  showMore: "להציג עוד",
  sectorOnly: "פתוח רק ל",
  columns: { company: "חברה", track: "מסלול", fund: "קופה", holds: "במה הכסף מושקע", balance: "ניהול מחיסכון, {year}", deposit: "ניהול מהפקדה", fit: "התאמה", open: "פתיחה" },
  phoneFee: { balance: "דמי ניהול מחיסכון", deposit: "מהפקדה" },
  wholeFund: "לקרן כולה",
  reference: { before: "ממוצע הרשות למסלולי ", mid: " (חציון ", year: "), לשנת ", from: ", מ־", tracks: " מסלולים.", fromOne: ", ממסלול אחד.", deposit: "מהפקדה:" }, // copy 7.0; deposit: site; fromOne added 2026-10-24
  coverage: {
    before: "נבדקו ",
    mid: " מסלולים ב־",
    companies: " חברות: ",
    fits: "מתאימים למטרה",
    "no-fit": "לא מתאימים",
    "no-rule": "בלי כלל לסיווג",
    ineligible: "פתוחים רק לקבוצה מסוימת",
    "no-goal": "בלי מטרה לבדוק מולה",
    "no-class": "בלי סיווג בנתונים",
  } as Record<string, string>,
  outcomeWords: { fits: "מתאים", "no-fit": "לא מתאים", "no-rule": "אין כלל לסיווג הזה", "no-goal": "לא נבדק: אין מטרה שמורה", "no-class": "לא נבדק: אין סיווג בנתונים" } as Record<string, string>,
  noTracks: "למוצר הזה אין מסלולים בנתוני הרשות.",
  oldData: "נתוני הרשות לא עודכנו מאז ",
  links: { fees: "מה העמלות האלה יעלו לכם", all: "כל המסלולים בכל החברות", group: { before: "לכל המסלולים של ", after: " בכל החברות" } },
  back: "חברות ומסלולים", // copy.md 7.3: the breadcrumb parent
  entry: {
    holdings: { title: "מה כבר יש לכם", line: "הזינו מהדוח השנתי, ותראו אם המסלול מתאים, מה העמלות עולות ואם אפשר לאחד", href: "/holdings", current: "holdings" },
    transfer: { label: "העברה למכשיר אחר", href: "/transfer" },
  },
} as const;

// ---------------------------------------------------------------- release 3: the fee materiality page (copy.md 7.0, 7.1)

/**
 * The fee page's strings. Verbatim from docs/copy.md 7.0 to 7.1; the `review` block and the other strings the build
 * added are in copy.md 7.1's "Added 2026-10-24" table, keyed by path.
 */
export const r3fees = {
  title: "כמה העמלות עולות לכם",
  loading: "טוען…",
  failed: "האתר לא הצליח לחשב את העמלות. רעננו את העמוד ונסו שוב.",
  strip: {
    compare: "לפי ההשוואה למטרה ״",
    compareMid: "״: ",
    compareRecord: ", לפי ",
    guide: "לפי עמוד המדריך: ",
    track: "לפי המסלול ",
    trackAverage: "), ממוצע ",
    holding: "לפי הדוח שלכם: ",
    backCompare: "לתוצאה",
    backGuide: "לעמוד המדריך",
    backTrack: "לעמוד המסלול",
    backHolding: "להחזקה",
  },
  headline: { before: "העמלות ב", mid: " יעלו לכם ", in: " ב־", after: ", בכסף של היום", under: "בלי עמלות היו נשארים ", with: "; עם העמלות, ", noHorizon: "הזינו כמה שנים הכסף יישאר, ונחשב." },
  preTax: "לפני מס ביציאה: שאלה פתוחה",
  listHeading: "לפי הסדר, מהגדולה לקטנה",
  names: {
    balance: "דמי ניהול מחיסכון",
    deposit: "דמי ניהול מהפקדה",
    direct: "הוצאות ישירות",
    trade: "עמלת קנייה ומכירה",
    custody: "דמי ניהול פיקדון ניירות ערך",
    fx: "המרת מטבע",
    fixed: "דמי חשבון קבועים",
    spread: "מרווח קנייה ומכירה",
    fund: "העלות בתוך הקרן",
    manager: "דמי ניהול של החברה המנהלת",
  } as Record<string, string>,
  base: {
    balance: "כל שנה, מהחיסכון",
    deposit: "מכל הפקדה",
    direct: "כל שנה, מהקופה, נוסף על דמי הניהול",
    trade: "בכל קנייה ומכירה",
    custodyBefore: "כל ",
    custodyAfter: ", על ניירות הערך שבחשבון",
    fx: "בכל המרה",
    fixed: "כל חודש, בלי קשר לסכום",
    spread: "בכל קנייה ומכירה בבורסה, כחלק מהמחיר",
    fund: "כל שנה, בתוך מחיר היחידה",
    manager: "כל שנה, מהחיסכון, נוסף על העלות בתוך הקרן",
  } as Record<string, string>,
  periods: { month: "חודש", quarter: "רבעון", year: "שנה" },
  costIn: "ב־",
  verdict: { negotiate: "שווה להתמקח", avoid: "שווה להימנע", "not-worth": "לא שווה את הטרחה" } as Record<string, string>,
  reason: {
    negotiate: ["העלות ", " או יותר, ויש ממוצע נמוך מהמחיר שלכם."],
    avoid: ["העלות ", " או יותר, ואפשרות אחרת בהשוואה לא גובה אותה."],
    below: ["העלות נמוכה מ־", "."],
    noReference: "אין ממוצע להשוואה, ולכן אי אפשר לומר שכדאי להתמקח.",
    nothingRemoves: "כל האפשרויות בהשוואה גובות עמלה כזו.",
  },
  avoidNotEvaluated: "להימנע: לא נבדק. נבדק רק מול השוואה למטרה.",
  setGoal: "להגדיר מטרה",
  removedBy: "אין עמלה כזו ב",
  noReference: "אין ממוצע להשוואה",
  noReferenceReasons: {
    D20: "הממוצע של בנק ישראל מוצג רק בקישור: תנאי השימוש של בנק ישראל לא מתירים לפרסם אותו מחדש בלי הסכמה בכתב.",
    "isa-unconfirmed": "ממוצעי רשות ניירות ערך לקטגוריות של קרנות עוד לא אומתו כנתון להשוואה לקרן מסוימת.",
    "tase-uncollected": "הממוצעים שהבורסה מפרסמת לכל חבר בורסה עוד לא נאספו.",
    "G-14": "להוצאות ישירות אין ממוצע שנאסף.",
    "no-cma-track": "המסלול לא נמצא בנתוני הרשות.",
  } as Record<string, string>,
  linkOuts: { boi: "ללוח הנתונים של בנק ישראל", isa: "לדוח השנתי של רשות ניירות ערך", tase: "למחשבון העמלות של הבורסה" },
  perFund: "לקרן כולה",
  notReported: "עוד לא דווח",
  referenceLine: { before: "ממוצע הרשות למסלולי ", mid: ": ", median: " (חציון ", yearBefore: "), לשנת ", tracksBefore: ", מ־", tracksAfter: " מסלולים.", tracksOne: ", ממסלול אחד." },
  ownAverage: ["במסלול הזה עצמו שילמו העמיתים בממוצע ", "."],
  cap: { yearly: "התקרה בחוק: ", perYear: " בשנה", perDeposit: " מכל הפקדה", none: "אין תקרה בחוק", open: "התקרה: שאלה פתוחה ", eachManager: "התקרה: כל חברה קובעת ומפרסמת לכל מסלול; עוד לא נאספה." },
  reduction: {
    label: "אם יורידו ל־",
    worthBefore: "שווה ",
    worthAfter: ".",
    notReduction: "זו לא הורדה.",
    suggestion: "הצעה: הממוצע",
    // audit 2026-10-24 (A9, A61): the what-if does not change the ranking; the bounds are named
    noRanking: "זו הערכה בלבד: היא לא משנה את הדירוג בהשוואה.",
    belowZero: "ההנחה צריכה להיות 0% או יותר.",
    aboveHundred: "עמלה לא יכולה להיות יותר מ־100%.",
  },
  negotiation: {
    disclosure: "מה להגיד בשיחה",
    from: { balance: "מהחיסכון", deposit: "מהפקדה" } as Record<string, string>,
    p1: ["דמי הניהול ", " בחשבון שלי ב", " הם ", ". לפי נתוני "],
    p2: [" לשנת ", ", הממוצע שנגבה בפועל במסלולי ", " הוא ", " (חציון ", ", מ־", " מסלולים). אבקש להוריד את דמי הניהול ל־", "."],
    // audit 2026-10-24 (A94): for a product the person has no account in yet (a wrapper or a track page), the script asks for an offer
    p1Offer: ["דמי הניהול ", " ב", " הם ", ". לפי נתוני "],
    p2Offer: " מסלולים). אבקש הצעה של דמי ניהול של ",
    offerEnd: " או פחות.",
    own: ["במסלול הזה עצמו הממוצע שנגבה בפועל היה ", "."],
    source: ["מקור: ", ", ", ", נתוני ", "."],
    datasets: { gemelnet: "גמל נט", "pensia-net": "פנסיה נט" } as Record<string, string>,
    authority: "רשות שוק ההון, ביטוח וחיסכון",
    last: "הטקסט מצטט מספר ציבורי ואת המקור שלו, ולא מתחייב לכלום.",
    copy: "העתקת הטקסט",
    copied: "הועתק",
  },
  // audit 2026-10-24 (A9, A10, A14, A18): the sentence above the chart, the ranked sentence, the softened badge, the links
  gap: {
    more: ["אם דמי הניהול היו כממוצע של המסלולים הדומים, הייתם משאירים אצלכם כ־", " ב־", "."],
    less: "דמי הניהול שלכם לא גבוהים מהממוצע של המסלולים הדומים.",
  },
  ranked: { first: "המוצר הזה במקום הראשון בהשוואה שלכם, גם אחרי העמלות.", other: ["למרות העמלה, המוצר הזה במקום ", " בהשוואה שלכם."], tied: " (שקול לאחרים)", link: "להשוואה" },
  verdictSoft: "יקר יחסית לחלופות בלי עמלה",
  linkSwitch: "איך עוברים",
  linkProviders: "השוואת הספקים",
  remainder: { before: "השפעה משולבת של העמלות זו על זו: ", line: "הסכום של כל השורות והשורה הזו הוא העלות הכוללת." },
  thresholds: { before: "הספים: שווה להתמקח מ־", mid: "; שווה להימנע מ־", after: ". פרמטר של האתר.", link: "לכל הפרמטרים" },
  chart: {
    title: "העמלות לאורך הזמן",
    // 2026-10-24 (evening, the founder's screenshot): one short name per fee kind, so each direct label is one line in the 94 px strip
    short: { balance: "ניהול מחיסכון", deposit: "ניהול מהפקדה", direct: "הוצאות ישירות", trade: "קנייה ומכירה", custody: "ניהול פיקדון", fx: "המרת מטבע", fixed: "דמי חשבון", spread: "מרווח", fund: "בתוך הקרן", manager: "ניהול החברה" } as Record<string, string>,
    total: "סך העמלות",
    rest: "שאר העמלות",
    remainderLegend: "השפעה משולבת: הפער עד הקו",
    notReported: "לא דווח",
    noGoalMarker: "סוף התקופה",
    aria: ["גרף: העלות של ", " עמלות לאורך ", ". הנתונים המלאים בטבלה."],
    year: "שנה",
  },
  chips: { amount: "סכום", monthly: "הפקדה חודשית", years: "שנים", return: "תשואה", inflation: "אינפלציה", all: "כל ההנחות" },
  assumptionsTitle: "ההנחות של חישוב העמלות",
  sens: {
    title: "מה היה משנה את המסקנה",
    flipVerdict: ["המסקנה על ", " מתהפכת אם ", " תעבור מ־", " ל־", ": אז "],
    flipLargest: ["העמלה הגדולה מתחלפת אם ", " תעבור מ־", " ל־", ": אז "],
    noFlip: "לא מתהפכת בטווח שנבדק: ",
    until: " עד ",
    feeAxis: ", מחצי עד כפול",
  },
  noFees: "אין עמלות ברשומה הזו.",
  omitted: [" לא נכללה בחישוב: לא דווחה."],
  notFound: "המוצר או ההחזקה לא נמצאו.",
  notFoundLinks: { guide: "למדריך", holdings: "למה שכבר יש לכם" },
  linksWorkbench: "כל המסלולים בכל החברות",
  linkGuide: "לעמוד המדריך",
  links: { fromResult: "מה העמלות כאן עולות לכם", fromGuide: "כמה העמלות האלה עולות לאורך זמן" },
  /** Strings the fee page needed beyond 7.1; settled in docs/copy.md 7.1 ("Added 2026-10-24"). */
  review: {
    noClass: "למוצר הזה לא נבחר מסלול מייצג, ולכן אין סיווג שממנו מחשבים את ממוצע הרשות.",
    emptyClass: "אף מסלול בסיווג הזה לא דיווח על העמלה הזו.",
    refNotBelow: "הממוצע לא נמוך מהמחיר שלכם.",
    official: ["הממוצע שהרשות פרסמה לשנת ", " לכל הקופות מהסוג הזה: "],
    officialNote: "ממוצע מהדוח השנתי של הממונה על שוק ההון, לכל הקופות מהסוג הזה יחד; לא משמש למסקנה.",
    // copy.md 7.1 (changed 2026-10-24, B6): the exact reason for the gap at the chart's end
    chartGross: {
      before: "הגרף מראה את ההפרש לפני מס ועלויות היציאה, ולכן בקצהו הוא גבוה ב־",
      after: " מהסכום שבכותרת: בלי העמלות הרווח גדול יותר, והמס עליו גדול יותר.",
      label: "מס ועלויות היציאה על ההפרש",
    },
    ruleMissing: "הנוסח עוד לא נמצא במאגר החוקים והכללים של האתר.",
    parameterReturn: "לא הוזנה תשואה. החישוב לפי התשואה של התרחיש לדוגמה, פרמטר של האתר.",
    noGoal: "אין מטרה שמורה: החישוב לפי התרחיש לדוגמה של האתר.",
    noTerms: "למוצר הזה עוד אין רשומה עם עמלות לחישוב. אפשר להזין את העמלות מהדוח שלכם.",
    needInput: "כדי לחשב צריך עוד פרט: ",
    // copy.md 7.1 (added 2026-10-24, B3): no engine message reaches the page
    needGeneric: "אחד מהערכים בהנחות",
    // copy.md 7.1 (added 2026-10-24, B3): the assumptions sheet when no goal is saved
    defaultsLead: "עד שתזינו ערך, החישוב לפי התרחיש לדוגמה של האתר: ",
    defaultsNote: "מה שתזינו כאן יישמר כמטרה במכשיר הזה.",
    genericFail: "האתר לא הצליח להריץ את החישוב עם הערכים האלה. בדקו את ההנחות שהזנתם.",
    toForm: "לטופס המטרה",
    blockedRun: "החישוב למוצר הזה חסום: ",
    // audit 2026-10-24 (A2, A63): the plain Hebrew first, its code after it in a chip; a goal that lacks a figure says so
    goalIncomplete: "המטרה השמורה עוד חסרה סכום או הפקדה, ולכן החישוב לפי התרחיש לדוגמה של האתר.",
    sensRunning: "בודק…",
    sensFooter: "הטווחים שנבדקו הם פרמטר של האתר.",
    notReportedRow: "העמלה לא דווחה לרשות, ולכן לא נכללה בחישוב.",
    detail: "פירוט החישוב",
    staleLine: "נתוני הרשות לא עודכנו מאז",
    returnChipParameter: "התרחיש לדוגמה",
  },
} as const;

// ---------------------------------------------------------------- release 3: holdings and transfer (copy.md 7.2, 7.4)
// The strings the build added beyond the 7.2 and 7.4 tables are in their "Added 2026-10-24" tables, keyed by path.

export const r3holdings = {
  title: "מה כבר יש לכם",
  lede: "הזינו מהדוח השנתי, ותראו אם המסלול מתאים למטרה, מה העמלות עולות ואם אפשר לאחד. הכול נשמר במכשיר הזה.",
  stripLine: "ההתאמה והעלות לפי המטרה השמורה:",
  loading: "טוען את הנתונים…", // copy.md 7.2
  loadFailed: "האתר לא הצליח לטעון את הנתונים. רעננו את העמוד ונסו שוב.", // copy.md 7.2
  empty: "מה להכין: הדוח השנתי של כל קופה, או הדוח מהמסלקה הפנסיונית.",
  add: "להוסיף החזקה",
  listHeading: "ההחזקות שלכם",
  sheetTitleNew: "החזקה חדשה",
  sheetTitleEdit: "עריכת החזקה",
  groups: { what: "מה זה", how: "כמה", report: "מהדוח" },
  fields: { wrapper: "סוג המוצר", company: "החברה המנהלת", track: "המסלול" },
  wrappersLater: "פיקדונות וחשבונות השקעות יתווספו בהמשך, עם התעריפונים.",
  wrappersLaterHeading: "פיקדונות וחשבונות השקעות", // copy.md 7.2, the word the deferred line is about
  companyFilter: "חיפוש חברה", // copy.md 7.2
  companyNone: "אין חברה כזו בנתוני הרשות לסוג הזה. הקלידו את השם כמו שהוא בדוח.", // copy.md 7.2
  companyTyped: "שם החברה כמו שהוא בדוח", // copy.md 7.2
  trackPick: "מסלולים של החברה", // copy.md 7.2
  trackNoneForCompany: "אין מסלולים של החברה הזו בנתוני הרשות לסוג הזה.", // copy.md 7.2
  trackSelected: "המסלול שנבחר", // copy.md 7.2
  trackChange: "בחירה אחרת", // copy.md 7.2
  fundNumber: "קופה", // copy.md 7.2, the card's "קופה {מספר}"
  paste: "הקלידו או הדביקו את השם כמו שהוא מופיע בדוח",
  pasteSeveral: "יש יותר ממסלול אחד בשם הזה. בחרו:",
  pasteNone: "לא נמצא בנתוני הרשות. השם נשמר כמו שהקלדתם.",
  pasteOne: "נמצא מסלול אחד בשם הזה:", // copy.md 7.2
  pasteCopy: "העתקת השם", // copy.md 7.2, the copy button for the founder (flow 6)
  childRoute: "איפה הכסף",
  childRouteOptions: { provident: "קופת גמל", bank: "בנק" },
  childFund: "הקופה או הבנק",
  childFundBank: "הבנק", // copy.md 7.2
  childPlansNote: "לכל ילד חיסכון משלו: שני ילדים הם שתי החזקות, ואין ביניהן איחוד.", // copy.md 7.2, from CS-21 as flows 24 says
  balance: "יתרה",
  fees: "דמי ניהול",
  feeBalance: "מחיסכון (בדוח: מהצבירה)",
  feeDeposit: "מהפקדה",
  feeBalanceLabel: "דמי ניהול מחיסכון", // the glossary term, card labels
  feeDepositLabel: "דמי ניהול מהפקדה",
  directExpenses: "הוצאות ישירות (לא חובה)",
  monthlyOwn: "הפקדה חודשית שלכם (לא חובה)",
  monthlyEmployer: "הפקדה חודשית של המעסיק (לא חובה)",
  statementDate: "הדוח נכון ל־",
  embeddedGain: "הרווח שכבר בתוך היתרה, מהדוח המפורט", // copy.md 7.2 (coordinator, 2026-10-24)
  embeddedGainWhy: "בלי זה האתר מחשב את העמלות אבל לא את המס ביציאה.", // copy.md 7.2
  bars: { label: "מצבים שחוסמים העברה", lead: "סמנו אם אחד מאלה נכון לחשבון הזה:" }, // copy.md 7.2; each label is shown only when PF-17's text names the case
  barLabels: {
    loan: "יש הלוואה פתוחה על הקופה",
    attachment: "יש עיקול או שעבוד על כל היתרה",
    annuityStarted: "קצבה כבר התחילה",
    receivingFundClosed: "הקופה המקבלת סגורה",
    disabilityAnnuityClaimed: "הוגשה או אושרה תביעה לקצבת נכות",
    memberDied: "העמית נפטר",
    appliedToComprehensivePension: "הוגשה בקשה לקרן פנסיה מקיפה",
  } as Record<string, string>,
  firstDeposit: "תאריך ההפקדה הראשונה",
  firstDepositWhy: "כדי לבדוק אם הכסף נזיל, האתר צריך לדעת מתי התחיל.",
  statementDisclosure: {
    label: "איפה זה בדוח",
    spellings: "מילים שתפגשו:",
    more: "עוד", // audit 2026-10-24 (A64): the regulator's text sits behind this
    fundNumber: "מספר הקופה מופיע במסמכי החברה ובמדריך ההעברות של הרשות.",
    lead: "מה הרשות קבעה שהדוח כולל:", // copy.md 7.2
    // The open lines. PF OQ5 ("no official source for the statement's layout") was closed by the 2026-10-23 rule pass (PF-33 to PF-38);
    // what the rules still leave open is the gov.il copy of the 2020 text (PF OQ16).
    openLine: "העותק של חוזר הדוחות באתר gov.il עוד לא נמצא; החוזר נקרא בעותק באתר אחר.", // copy.md 7.2, replaces copy.md's PF OQ5 line
    openCode: "PF OQ16",
    childPlan: "מבנה הדוח של חיסכון לכל ילד:", // copy.md 7.2 lead before CS-27's text
    neverPosition: "האתר לא מצייר דוח לדוגמה ולא מציין איפה בדף כל שדה.", // copy.md 7.2
    ruleMissing: "הנוסח עוד לא נמצא במאגר החוקים והכללים של האתר.", // copy.md 7.2
  },
  clearingHouse: { label: "אפשר גם מהדוח של המסלקה הפנסיונית", last: "איך מקבלים את הדוח וכמה הוא עולה:", openCode: "PF OQ6" },
  save: "שמירה",
  cancel: "ביטול",
  cardFundLine: "קופה",
  unmatchedTag: "לא נמצא בנתוני הרשות",
  unmatchedLine: "המסלול לא נמצא בנתוני הרשות, ולכן אין סיווג, התאמה או ממוצע להשוואה.",
  recordLabels: { classification: "סיווג", period: "נכון לחודש", balance: "יתרה", feeBalance: "דמי ניהול מחיסכון", feeDeposit: "דמי ניהול מהפקדה", directExpenses: "הוצאות ישירות" },
  noClassification: "אין סיווג, ולכן אין ממוצע.",
  trackAvg: "במסלול הזה עצמו שילמו העמיתים בממוצע", // copy 7.0 "Track's own average", the figure follows
  trackAvgYear: "לשנת", // copy.md 7.2
  classRef: { before: "ממוצע הרשות למסלולי", mid: "(חציון", after: "), מ־", tracks: "מסלולים", afterOne: "), ממסלול אחד" }, // copy 7.0 "Regulator reference line" in parts
  perFund: "לקרן כולה",
  capAbove: "מעל התקרה בחוק:",
  openQuestion: "שאלה פתוחה",
  feeLine: { before: "העמלות יעלו", mid: "ב־", after: ", בכסף של היום." },
  feeLineNoGoal: "כמה שנים הכסף הזה יישאר? הגדירו מטרה.",
  feeLinkLabel: "כל העמלות, ומה שווה לעשות איתן",
  preTax: "לפני מס ביציאה: שאלה פתוחה",
  feeNotComputed: "את העלות של סוג המוצר הזה האתר עוד לא מחשב.", // copy.md 7.2
  feeNeedsPf36: "הקרן עוד לא נזילה: כדי לחשב את המס ביציאה צריך את פיצול שכבות המס מהדוח המפורט.", // copy.md 7.2
  feeNeedsFirstDeposit: "כדי לחשב את העלות בקרן השתלמות, הוסיפו את תאריך ההפקדה הראשונה.", // copy.md 7.2
  feeFailed: "האתר לא הצליח לחשב את העלות. בדקו את המטרה ואת הערכים שהזנתם.", // copy.md 7.2
  depositsLeftOut: "ההפקדות החודשיות לא נכללו: חסר שכר בטופס המטרה.", // copy.md 7.2
  returnFromParameter: "החישוב לפי התשואה של התרחיש לדוגמה, פרמטר של האתר, לא לפי תשואה שהזנתם.", // copy.md 7.2
  fitNoGoal: "אין מטרה שמורה.",
  fitNoGoalLink: "להגדיר מטרה",
  fitHeading: "מתאים למטרה?", // copy.md 7.2, the card's label before the mark
  fitGoalLine: "לפי המטרה ״", // from release 2's fit copy
  fitGoalMid: "״, ",
  fitRuleBefore: "לפי טבלת ההתאמה של האתר, לסיווג ״",
  fitRuleAfter: "״ מתאים החל מ־",
  fitNoTrack: "אין התאמה: המסלול לא נמצא בנתוני הרשות.", // copy.md 7.2
  staleLine: "נתוני הסיווג לא עודכנו מאז", // as release 2's fit.stale
  actions: { edit: "עריכה", delete: "מחיקה", up: "להזיז למעלה", down: "להזיז למטה" }, // copy.md 7.2: up/down, (flow 22: up/down buttons on a phone)
  deleteConfirm: "למחוק את ההחזקה מהמכשיר הזה?",
  deleteYes: "מחיקה",
  deleteNo: "ביטול",
  detailsOpen: "פרטים", // copy.md 7.2, the phone disclosure's label
  consolidation: {
    heading: "לאחד?",
    oneHolding: "איחוד נבדק כשיש שתי החזקות מאותו סוג.",
    differentTypes: "העברה מותרת רק במסלולים שהתקנות מונות, לפי סוג המוצר.",
    differentTypesLink: "כל המסלולים בכל החברות", // copy.md 7.2, to the workbench (design-spec 13 edge case)
    outcomes: { allowed: "אפשר לאחד", notAllowed: "אי אפשר לאחד", notSourced: "החוקים והכללים להעברה עוד לא נמצאו", blocked: "חסום: שאלה פתוחה" },
    separate: "אפשר להעביר כחשבון נפרד", // copy.md 7.2: the SW-39 outcome (code allowed-separate-account)
    separateLine: "הכסף עובר שלם לחשבון נפרד אצל המנהל השני, והחשבונות מתאחדים רק כששניהם נזילים.", // copy.md 7.2, a plain statement of SW-39
    route: { mid: "ל", after: ": מסלול מותר בתקנות." },
    conditions: "בתנאי ש־",
    notYet: { before: "עוד לא: החשבון השני נזיל מ־", after: " בערך (לפי סוף החודש של ההפקדה הראשונה)." },
    missingFirstDeposit: "כדי לבדוק אם אפשר לאחד, הוסיפו את תאריך ההפקדה הראשונה בכל קרן השתלמות.", // copy.md 7.2
    worth: { before: "איחוד ב", after: "שווה", mid: "ב־", end: ", בכסף של היום." },
    noSaving: "האיחוד לא חוסך בעמלות.",
    targetMark: { before: "המסלול הזה", fits: "מתאים", noFit: "לא מתאים", noRule: "אין כלל לסיווג שלו", noGoal: "אין מטרה לבדוק מולה", noTrack: "לא נמצא בנתוני הרשות", after: "למטרה." },
    worthUnavailable: { unsupported: "את שווי האיחוד לסוג המוצר הזה האתר עוד לא מחשב.", "no-goal": "כדי לחשב מה שווה האיחוד, הגדירו מטרה עם שנים.", failed: "האתר לא הצליח לחשב את שווי האיחוד." }, // copy.md 7.2
    costHeading: "מה עוד כדאי לדעת", // copy.md 7.2
    sameManager: "שני החשבונות באותה חברה: איחוד חשבונות הוא תהליך של החברה, לא העברה.",
    bankChild: "אי אפשר להעביר לבנק אחר.",
    guideLater: "המדריך למעבר: בעמוד ״איך עוברים״",
    ruleText: "הנוסח המלא", // copy.md 7.2
  },
  child: {
    heading: "חיסכון לכל ילד",
    blocked: "האם המסלול נבחר או ברירת מחדל: אי אפשר לבדוק.",
    blockedCode: "CS OQ10",
    known: "מה כן ידוע",
    twoPlans: "לכל ילד חיסכון משלו: שני ילדים הם שתי החזקות, ואין ביניהן איחוד.", // copy.md 7.2
    bankRoute: "הכסף בבנק", // copy.md 7.2
  },
  saveLine: "נשמר אוטומטית במכשיר הזה. בלי חשבון, בלי שרת.",
  transferLink: "העברה למכשיר אחר",
  unsaved: "אי אפשר לשמור במכשיר הזה. מה שהזנתם יישאר רק בזמן הביקור.", // as release 2's "could not save" note
  importedTag: "יובא ב־",
  // audit 2026-10-24 (A15, A16, A17, A18, A59, A60, A65, A67): the sheet's save feedback, the card's two dates and shekel line
  wrapperHints: { "pension-comprehensive": "קרן פנסיה", "pension-general": "קרן פנסיה" } as Record<string, string>, // audit 2026-10-24 (A64): the statement says "קרן פנסיה מקיפה"
  feeDepositHint: "אין שורה כזו בדוח? השאירו ריק, וייכתב 0.", // audit 2026-10-24 (A15)
  saveProblems: { one: "שדה אחד לתיקון, למעלה.", two: "שני שדות לתיקון, למעלה.", many: "שדות לתיקון, למעלה." }, // audit 2026-10-24 (A15)
  closeAsk: { text: "לסגור בלי לשמור?", yes: "לסגור", no: "להמשיך" }, // audit 2026-10-24 (A67)
  companyPartial: "זיהינו חברה לפי חלק מהמילים. בחרו אותה מהרשימה, ואת המסלול בשלב הבא.", // audit 2026-10-24 (A17)
  companyNotFound: "לא נמצאה חברה בשם הזה. בחרו מהרשימה, או הקלידו את השם כמו בדוח.", // audit 2026-10-24 (A17)
  trackCount: { one: "מסלול אחד", two: "שני מסלולים", many: "מסלולים" }, // audit 2026-10-24 (A65)
  cardDates: { authority: "נתוני הרשות", statement: "הדוח שלכם" }, // audit 2026-10-24 (A16)
  trackAvgNone: "המסלול הזה עוד לא דיווח לרשות דמי ניהול לשנת", // audit 2026-10-24 (A60): its own sentence, the year follows
  fitNoRule: "האתר לא קבע כלל התאמה לסיווג הזה.", // audit 2026-10-24 (A60), P-04 is a site judgement
  avgSaving: { before: "לפי הממוצע הייתם חוסכים", approx: "כ־", mid: "ב־", after: "." }, // audit 2026-10-24 (A18): F-61's value of lowering the fee to the class mean
  switchLink: "איך עוברים", // audit 2026-10-24 (A14)
  depositsHere: { before: "פיקדון שיש לכם כבר אפשר להשוות ב", link: "עמוד הכסף שבעו״ש", after: "." }, // audit 2026-10-24 (A59)
  // scenario fix 2026-10-24 (study fund that became liquid): the first-deposit checkbox, the fee prefill, the card's liquidity line and decision block
  firstDepositOver: "ההפקדה הראשונה לפני יותר משש שנים (הקרן נזילה)", // scenario fix 2026-10-24
  firstDepositOverWhy: "במקום תאריך מדויק. אם לא סימנתם, הזינו את התאריך.", // scenario fix 2026-10-24
  feePrefill: {
    balance: "ממוצע דמי הניהול מחיסכון של המסלול, כפי שהרשות מפרסמת:", // scenario fix 2026-10-24
    balanceKept: "ריק: יישמר הממוצע הזה, כנתון ממקור.", // scenario fix 2026-10-24
    balanceEntered: "הערך שהקלדתם יישמר במקום הממוצע.", // scenario fix 2026-10-24
    deposit: "ממוצע דמי הניהול מהפקדה של המסלול:", // scenario fix 2026-10-24
    depositKept: "ריק: יישמר הממוצע הזה, כנתון ממקור.", // scenario fix 2026-10-24
    depositEntered: "הערך שהקלדתם יישמר במקום הממוצע.", // scenario fix 2026-10-24
    depositHint: "אין שורה כזו בדוח? השאירו ריק.", // scenario fix 2026-10-24: replaces feeDepositHint when the track has an average
    year: "לשנת", // scenario fix 2026-10-24
    cardNote: "ממוצע המסלול לפי הרשות, לא בהכרח מה שאתם משלמים", // review fix 2026-10-24: under a fee the card holds from the prefill
  },
  liquidity: {
    from: "נזיל מ־", // scenario fix 2026-10-24
    notYet: "עוד לא נזיל: נזיל מ־", // scenario fix 2026-10-24
    about: " בערך (לפי סוף החודש של ההפקדה הראשונה)", // review fix 2026-10-24: TXH-09's first payment date is a month end
    overBefore: "נזיל: ההפקדה הראשונה הייתה לפני יותר מ־", // scenario fix 2026-10-24
    overAfter: "", // scenario fix 2026-10-24
    unknown: "לא ידוע אם הקרן נזילה: חסר תאריך ההפקדה הראשונה. בעריכה אפשר גם לסמן שהיא הייתה לפני יותר משש שנים.", // scenario fix 2026-10-24
  },
  decision: {
    heading: "הקרן נזילה: מה אפשר לעשות", // scenario fix 2026-10-24
    stay: { label: "להשאיר", text: "אין מס שנתי על הרווחים כל עוד הכסף בקרן; המס חל רק במשיכה." }, // scenario fix 2026-10-24, TXH-18
    switchTrack: { label: "להחליף מסלול באותה קופה", text: "מעבר מסלול בתוך הקרן אינו אירוע מס ואין עליו עמלה בתקנות; חברה רשאית להעלות דמי ניהול מוזלים אחרי מעבר." }, // scenario fix 2026-10-24, TXH-17, PF-23, SW-15
    move: { label: "להעביר לחברה אחרת", text: "עוברת כל היתרה בלבד, והוותק של הכסף נשמר.", link: "איך עוברים" }, // scenario fix 2026-10-24, PF-18, SW-39
    withdraw: { label: "למשוך", text: "משיכה אחרי תקופת ההמתנה פטורה ממס על הרווחים מהפקדה מוטבת, ורווחים מהפקדה מעל התקרה ממוסים; ולעובד: אחרי משיכה החשבון נסגר להפקדות נוספות (משיכת שליש ללימודים לא סוגרת, TXH-10)." }, // scenario fix 2026-10-24, TXH-09, TXH-11; review fix 2026-10-24: the closure is the rule for an employee's fund and has the one-third study exception, TXH-10
    fee: "דמי הניהול בקרן הזו, מול הממוצע:", // scenario fix 2026-10-24
    exposureLink: "להשוות לפי חשיפה", // scenario fix 2026-10-24
  },
  errors: {
    balanceNegative: "היתרה לא יכולה להיות שלילית.",
    percentOver: { before: "אחוז לא יכול להיות גבוה מ־", after: "." }, // copy.md 7.2: the maximum is a figure in the sentence, isolated (B14, changed 2026-10-24)
    dateFuture: "התאריך עוד לא הגיע.",
    statementFuture: "תאריך הדוח לא יכול להיות אחרי היום.", // audit 2026-10-24 (A15)
    firstFuture: "ההפקדה הראשונה לא יכולה להיות אחרי היום.", // audit 2026-10-24 (A15)
    invalid: "תקנו את הערך או מחקו אותו.", // audit 2026-10-24 (A15)
    wrapperRequired: "בחרו סוג מוצר.", // audit 2026-10-24 (A15)
    firstAfter: "ההפקדה הראשונה לא יכולה להיות אחרי תאריך הדוח.",
    noTrack: "בחרו חברה ומסלול, או הקלידו את השם מהדוח.",
    required: "השדה הזה חובה.", // copy.md 7.2
    gainOverBalance: "הרווח לא יכול להיות גדול מהיתרה.", // copy.md 7.2
    amountNegative: "הסכום לא יכול להיות שלילי.",
  },
} as const;

export const r3transfer = {
  title: "העברה למכשיר אחר",
  lede: "קובץ אחד עם כל מה שהזנתם. בלי חשבון, בלי שרת: הקובץ עובר רק לאן שאתם שולחים אותו.",
  exportHeading: "לשמור קובץ מהמכשיר הזה",
  contents: { goals: "מטרות", holdings: "החזקות", names: "שמות שלא קוטלגו", inputs: "הערכים שהזנתם במדריך", versions: "גרסת האתר והנתונים" },
  caution: "הקובץ מכיל את הסכומים והשכר שהזנתם. שלחו אותו רק למי שאתם רוצים שיראה אותם.",
  buttons: { share: "שיתוף", download: "הורדה", copy: "העתקה", copied: "הועתק" },
  fileName: "שם הקובץ:",
  nothing: "עוד אין מה לשמור.",
  copyBlocked: "ההעתקה לא הצליחה. סמנו והעתיקו מכאן.",
  importHeading: "לטעון קובץ ממכשיר אחר",
  chooseFile: "בחירת קובץ",
  dropZone: "או גררו לכאן",
  paste: "או הדביקו כאן",
  previewCreated: { before: "נוצר ב־", mid: "גרסת אתר" },
  previewCounts: { goals: "מטרות", holdings: "החזקות", names: "שמות שלא קוטלגו" },
  previewOld: "קובץ מגרסה ישנה; יומר בטעינה.",
  mode: { add: "להוסיף למה שיש במכשיר", replace: "להחליף את מה שיש במכשיר" },
  modeLabel: "מה לעשות עם מה שיש במכשיר", // copy.md 7.4
  replaceConfirm: { text: "להחליף? מה שיש במכשיר הזה יימחק.", yes: "להחליף", no: "ביטול" },
  load: "לטעון",
  afterImport: { before: "נטען:", goals: "מטרות", holdings: "החזקות", tag: "מסומנים ״יובא ב־" },
  afterLinks: { holdings: "למה שכבר יש לכם", result: "לתוצאה" },
  duplicates: "פריטים זהים כבר היו במכשיר ולא נטענו שוב.",
  deleteImportedConfirm: { text: "למחוק מהמכשיר הזה את כל מה שיובא?", yes: "מחיקה", no: "ביטול" },
  deleteImported: "מחיקת מה שיובא",
  deleted: "מה שיובא נמחק.", // copy.md 7.4
  errors: {
    newer: "הקובץ נוצר בגרסה חדשה יותר של האתר. רעננו את העמוד ונסו שוב.",
    format: "זה לא קובץ של מקור.",
    invalidBefore: "הקובץ לא תקין:",
    invalidAfter: ". לא שונה כלום במכשיר.",
    unreadable: "האתר לא הצליח לקרוא את הקובץ.",
    shareFailed: "השיתוף לא הושלם. אפשר להוריד או להעתיק.",
  },
  unavailable: "אי אפשר לשמור במכשיר הזה. מה שנטען יישאר רק בזמן הביקור.", // copy.md 7.4, the release 2 note for import
  loading: "טוען…", // copy.md 7.4
  // audit 2026-10-24 (A91, A32): each count in its Hebrew form; the digit shows (inside a Num) only in `many`
  forms: {
    goals: { one: "מטרה אחת", two: "שתי מטרות", many: "מטרות" },
    holdings: { one: "החזקה אחת", two: "שתי החזקות", many: "החזקות" },
    names: { one: "שם אחד שלא קוטלג", two: "שני שמות שלא קוטלגו", many: "שמות שלא קוטלגו" },
    comparisons: { one: "השוואה שמורה אחת", two: "שתי השוואות שמורות", many: "השוואות שמורות" },
    offers: { one: "הצעה שהזנתם", two: "שתי הצעות שהזנתם", many: "הצעות שהזנתם" },
    variants: { one: "חשיפה עם הנחות שהזנתם", two: "שתי חשיפות עם הנחות שהזנתם", many: "חשיפות עם הנחות שהזנתם" },
    ticks: { one: "סימון אחד ב״איך עוברים״", two: "שני סימונים ב״איך עוברים״", many: "סימונים ב״איך עוברים״" },
    ownRates: { one: "ריבית שהזנתם להשוואה", two: "שתי ריביות שהזנתם להשוואה", many: "ריביות שהזנתם להשוואה" }, // audit 2026-10-24 (sweep)
  },
  // audit 2026-10-24 (A70): one person per device; a private window or cleared site data erases the work
  onePerDevice: "האתר שומר מכשיר אחד לאדם אחד: אין בו פרופילים נפרדים.",
  erasedNote: "בחלון פרטי או אחרי ניקוי נתוני האתר, מה שנשמר כאן נמחק. שמרו קובץ מהעמוד הזה.",
  // audit 2026-10-24 (A33, A69): the load's report is true, and an add can switch to the goal it brought
  nothingNew: "בקובץ אין שום דבר חדש: הכול כבר במכשיר הזה.",
  switchGoal: "לעבור למטרה שיובאה",
  switched: "המטרה שיובאה היא עכשיו המטרה הנוכחית.",
  duplicatesForms: { one: "פריט אחד זהה כבר היה במכשיר ולא נטען שוב.", two: "שני פריטים זהים כבר היו במכשיר ולא נטענו שוב." }, // A91: the singular and dual of `duplicates`
  sideFailed: "ההצעות, ההנחות והסימונים לא נשמרו במכשיר הזה.",
  rejectedHeading: "לא ייטענו, כי שדה בהם לא תקין:",
  rejectedItem: "{kind} {at}, {field}: {problem}.",
  rejectedKinds: { goal: "מטרה", holding: "החזקה", comparison: "השוואה שמורה", input: "ערך במדריך", offers: "הצעה", variants: "הנחות לחשיפה", ticks: "סימונים", ownRates: "ריבית שהוזנה" }, // ownRates: audit 2026-10-24 (sweep)
  rejectedProblems: {
    structure: "המבנה לא תקין",
    "not-number": "לא מספר",
    negative: "מתחת לאפס",
    "over-100": "מעל 100",
    years: "לא מספר שלם בין 1 ל־40",
    age: "לא בין 15 ל־100",
    date: "לא תאריך",
    wrapper: "סוג חיסכון לא מוכר",
    "gain-over-balance": "גדול מהיתרה",
  },
  rejectedFields: {
    goal: "המטרה", id: "המזהה", name: "שם המטרה", profile: "הפרופיל", assumptions: "ההנחות", exposures: "נתוני החשיפות",
    horizonYears: "שנות החיסכון", amountNow: "הסכום עכשיו", monthly: "ההפקדה החודשית", available: "הסכום הזמין",
    age: "הגיל", salary: "השכר", pension: "הפקדות לפנסיה", hishtalmut: "הפקדות להשתלמות", hishtalmutYearly: "ההפקדה השנתית להשתלמות",
    return: "התשואה", inflation: "האינפלציה", insurance: "עלות הביטוח", acceptedFall: "הירידה שמסכימים לספוג",
    holding: "ההחזקה", wrapperId: "סוג החיסכון", company: "החברה", order: "הסדר", track: "המסלול", balance: "היתרה",
    feeBalance: "דמי הניהול מחיסכון", feeDeposit: "דמי הניהול מהפקדה", directExpenses: "הוצאות ישירות", monthlyOwn: "ההפקדה החודשית שלכם",
    monthlyEmployer: "ההפקדה החודשית של המעסיק", embeddedGain: "הרווח שבתוך היתרה", statementDate: "תאריך הדוח", firstDeposit: "ההפקדה הראשונה",
  },
  // the file's top-level fields, for "הקובץ לא תקין: {field}" (was the field's name in English)
  refusalFields: {
    state: "תוכן הקובץ", exported: "תאריך הייצוא", version: "גרסת הקובץ", site: "פרטי האתר", goals: "המטרות", inputs: "הערכים במדריך",
    holdings: "ההחזקות", uncatalogued: "השמות שלא קוטלגו", imports: "רשימת הטעינות", savedComparisons: "ההשוואות השמורות",
  },
} as const;

// ---------------------------------------------------------------- release 4: banks and brokers in the catalogue (docs/copy.md 8.0, 8.4, 8.5)
/**
 * The companies list's headings, the bank and broker pages (flows 32, 33). Strings are copy.md 8.4 and 8.5 as
 * written; the ones the build added are in copy.md 8.4's "Added 2026-10-24" table, keyed by path.
 * Figures never appear here: a `{…}` place is filled by a Num.
 */
export const r4catalogue = {
  headings: { companies: "חברות מנהלות", institutions: "בנקים ובתי השקעות", fundManagers: "מנהלי קרנות" },
  classWord: { bank: "בנק", broker: "בית השקעות" },
  /** Row line: `{סוג}` · תעריפון מ־`{תאריך}` · or "התעריפון לא נאסף" in caution. */
  rowLine: { tariffFrom: "תעריפון מ־", missing: "התעריפון לא נאסף", noDate: "ללא תאריך פרסום" },
  fundManagerCount: "קרנות",
  ledeIntro: "כל מה שהבנק מציע, עם הסבר לכל מוצר.",
  ledeDeposits: "הפיקדונות לפי פרסום הבנק, נכון ל־",
  ledeTariff: "התעריפון נאסף ב־",
  groups: { deposits: "פיקדונות", savings: "תוכניות חיסכון", current: "עו״ש", brokerage: "חשבון השקעות" },
  groupLink: "מה זה",
  count: { one: "מוצר אחד", two: "שני מוצרים", many: "מוצרים" },
  // audit 2026-10-24 (A88): one published tariff is not "the site does not know my bank"; offers are personal and entered elsewhere
  oneTariff: { before: "הבנק מפרסם תעריפון אחד; ההצעות באפליקציה אישיות: הזינו אותן בעמוד ", link: "כסף שיושב בעו״ש", after: "." },
  depositsNotCollected: { before: "עוד לא נאספו פיקדונות ותוכניות חיסכון של ", after: "." },
  rateTableLink: "לטבלת הריביות של הבנק",
  modelLine: "דגם:",
  alsoCalled: "נקרא גם",
  labels: {
    type447: "סוג לפי הוראה 447",
    term: "תקופה",
    rateType: "סוג הריבית",
    rate: "שיעור הריבית המוצעת (נומינלי שנתי), לפני מס",
    asOf: "נכון ליום",
    linkage: "הצמדה",
    tax: "מס על הריבית",
    amount: "סכום",
    breakTerms: "שבירה",
    exits: "תחנות יציאה",
    autoRenew: "חידוש אוטומטי",
  },
  term: { months: "חודשים", none: "ללא תקופה" },
  rateType: { fixed: "ריבית קבועה", variable: "ריבית משתנה:" },
  linkage: { none: "לא צמוד", cpi: "צמוד למדד", fx: "צמוד למט״ח" },
  tax: { unlinked: "ריבית לא צמודה; השיעור בעמוד המדריך.", linked: "ריבית צמודה; השיעור בעמוד המדריך." },
  amount: { from: "מ־", to: "עד", noMin: "ללא מינימום" },
  breakWord: { not_allowed: "אין אפשרות שבירה", with_penalty: "שבירה בקנס", none: "שבירה ללא קנס" },
  breakDisclosure: "הבנק כותב:",
  exits: { every: "כל", months: "חודשים", none: "אין" },
  autoRenewWord: { yes: "כן", no: "לא", upTo: "עד", times: "פעמים" },
  currentConditions: "תנאי הריבית, כפי שהבנק כותב",
  notAnOffer: "הריבית המוצעת היא המינימום שהבנק מפרסם לסוג הפיקדון, לא הצעה אליכם. התנאים המחייבים הם בהסכם הפיקדון.",
  rowLinks: { whatIs: "מה זה", whatToCheck: "מה האתר לקח בחשבון" }, // audit 2026-10-24 (sweep): follows the renamed guide section
  /** copy.md 8.4: the page's "נכון ליום" is after the day the record was read (flow 33, point 11); no string in copy.md */
  asOfAfterRead: "התאריך מאוחר מיום הקריאה",
  card: {
    title: "התעריפון",
    tariffFrom: "תעריפון מ־",
    collectedAt: ", נאסף ב־",
    noPublishedDate: "ללא תאריך פרסום",
    link: "לתעריפון",
    linesBefore: "",
    linesMid: "שורות עמלה נאספו:",
    notice: "הודעה על שינוי בעמלות",
    compare: "להשוואת הספקים",
    stale: { before: "התעריפון נאסף ב־", after: "; מאז ייתכן שהשתנה." },
    minimum: "מינימום לפתיחת חשבון:",
    minimumNone: "לא נמצא בתעריפון",
    tradeBounds: { min: "מינימום לפעולה", max: "מקסימום" },
    protection: "מפוקח:",
    tase: "חבר בורסה",
    protectionDisclosure: "מה מגן על הכסף",
    channel: { direct: "ערוצים ישירים", branch: "סניף" },
    /** copy.md 8.4: how often a custody percentage is charged; the tariff states the period, copy.md names none */
    period: { month: "לחודש", quarter: "לרבעון", year: "לשנה" },
  },
  regulators: { BoI: "בנק ישראל", ISA: "רשות ניירות ערך", CMA: "רשות שוק ההון, ביטוח וחיסכון" },
  instrumentClasses: {
    etf_units: "קרן סל",
    tase_shares_bonds: "מניות ואיגרות חוב",
    mutual_fund_units: "יחידות של קרן נאמנות",
    foreign_securities: "ניירות ערך זרים",
    makam: "מק״מ",
    money_market_units: "קרן כספית",
  },
  missingTariff: "התעריפון לא נאסף.",
  recordedReason: "הסיבה כפי שנרשמה בקובץ הנתונים",
  missingLinks: { tariffPageBefore: "לעמוד התעריפון של ", compare: "להשוואת הספקים (הבנק מופיע שם כ״אי אפשר להשוות״)", /* copy.md 8.4: the broker's form of the parenthesis */ compareBroker: "להשוואת הספקים (בית ההשקעות מופיע שם כ״אי אפשר להשוות״)" },
  brokerClassLine: "בית השקעות, חבר בורסה שאינו בנק",
  searchGroupBank: "בנקים ומוצרי בנק",
} as const;

// Release 4: the provider workbench and the fund-variant page (docs/copy.md 8.0, 8.1, 8.2; flows 15.1, 15.2). The
// strings the build added are in the "Added 2026-10-24" tables of copy.md 8.0, 8.1 and 8.2, keyed by path. A `{…}` of
// copy.md is a function argument; every figure is a value object rendered by the provenance number, never typed here.
export const r4workbench = {
  // ---- 8.0 everywhere
  levels: { list: "תעריפון", average: "ממוצע שפורסם", entered: "ההצעה שלכם" },
  classWords: { bank: "בנק", broker: "בית השקעות", foreign_broker: "ברוקר זר", "provident-manager": "חברה מנהלת", "fund-manager": "מנהל קרנות" } as Record<string, string>,
  regulators: { BoI: "בנק ישראל", ISA: "רשות ניירות ערך", CMA: "רשות שוק ההון, ביטוח וחיסכון" } as Record<string, string>,
  feeTypes: { trade: "עמלת קנייה ומכירה", custody: "דמי ניהול פיקדון ניירות ערך", fx: "המרת מטבע", fixed: "דמי חשבון קבועים" } as Record<string, string>,
  notComparable: {
    heading: "אי אפשר להשוות",
    dataMissing: "התעריפון לא נאסף.",
    noLine: (cls: string) => `בתעריפון אין שורה ל${cls}.`,
    noLineChannel: (cls: string, channel: string) => `בתעריפון אין שורה ל${cls} ב${channel}.`,
    noAverage: (cls: string) => `לא נאסף ממוצע לשורות שחלות על ${cls}.`,
    lineWithoutValue: (name: string) => `בשורה ״${name}״ חסר ערך בתעריפון.`,
    /** copy.md 8.0: the engine refuses a tariff whose lines it cannot choose between (a plan, a sub-class); the page says so rather than guess a price */
    ambiguous: (cls: string) => `בתעריפון יש כמה שורות שחלות על ${cls}, ולאתר אין עדיין דרך לבחור ביניהן בלי לנחש:`,
    /** 2026-10-25 (engine E1): a fee per unit bought, and the fund's unit price is not collected */
    needsSharePrice: "העמלה בתעריפון נקבעת לפי מספר היחידות, ומחיר היחידה של הקרן עוד לא נאסף.",
    /** 2026-10-25 (engine E2): a minimum or fee in a foreign currency the site has no rate for */
    needsFxRate: "התעריפון קובע עמלה במטבע חוץ, ולאתר אין שער למטבע הזה.",
    /** 2026-10-25 (engine E5): the engine cannot read the tariff without guessing */
    recordError: "האתר לא מצליח לקרוא את התעריפון הזה בלי לנחש, ולכן לא מחשב לו מחיר.",
  },
  recordedReason: "הסיבה כפי שנרשמה בקובץ הנתונים",
  noAverage: "אין ממוצע שנאסף",
  noAverageReason: "ממוצעי בנק ישראל ומחשבון העמלות של הבורסה מוצגים רק בקישור: הפרסום מחדש דורש הסכמה בכתב.",
  noAverageLinks: { boi: "ללוח הנתונים של בנק ישראל", tase: "למחשבון העמלות של הבורסה" },
  notCollected: { fee: "לא נאסף", list: "לא נאספה", record: "עוד לא נאספו" },
  notPrinted: "לא מודפס",
  staleTariff: { before: "התעריפון נאסף ב־", after: "; מאז ייתכן שהשתנה." },
  noPublishedDate: "ללא תאריך פרסום",
  enteredTag: "לפי ההצעה שלכם",
  instrumentClasses: {
    etf_units: "קרן סל",
    tase_shares_bonds: "מניות ואיגרות חוב",
    mutual_fund_units: "יחידות של קרן נאמנות",
    foreign_securities: "ניירות ערך זרים",
    tase_foreign_fund_units: "קרן חוץ הנסחרת בבורסה",
    makam: "מק״מ",
    money_market_units: "קרן כספית",
  } as Record<string, string>,
  domicile: { IL: "ישראל", IE: "אירלנד", US: "ארה״ב" } as Record<string, string>,
  policy: { accumulating: "לא מחלקת", distributing: "מחלקת", "not-collected": "לא נאסף" } as Record<string, string>,
  links: {
    providers: "איזה בנק או בית השקעות",
    providersForFund: "השוואת ספקים לקרן הזו",
    providersCompare: "להשוואת הספקים",
    funds: "איזו קרן לקנות",
    fundsFor: (exposure: string) => `כל הקרנות על ${exposure}`,
    changeFund: "להחליף קרן",
  },
  tabs: { aria: "תצוגות של ההשוואה", byProvider: "לפי ספק", byTrack: "לפי מסלול", byFund: "לפי קרן", noTracks: "למוצר הזה אין מסלולים בנתוני הרשות." },

  // ---- 8.1 provider workbench page
  providers: {
    title: { before: "איזה בנק או בית השקעות: ", after: "" },
    back: "המדריך למוצר",
    subject: { before: "לפי ", sep: " · " },
    subjectP05: "לפי הרשומה המייצגת: ",
    changeFund: "להחליף קרן",
    noFund: "בחרו קרן כדי להשוות ספקים.",
    /** copy.md 8.1: the saved goal's absence, one line; the strip carries the link */
    noGoal: "אין מטרה שמורה: ההשוואה לפי התרחיש לדוגמה של האתר.",
    behaviour: {
      title: "הפעילות שלכם",
      orders: "פעולות בחודש",
      // copy.md 8.1 (changed 2026-10-24, B14): the number is a Num in the sentence; one and two are words
      ordersHint: { before: "כל הפקדה חודשית מתחלקת ל־", many: " פקודות, ולכל פקודה עמלה משלה.", one: "כל הפקדה חודשית היא פקודה אחת, ולכל פקודה עמלה משלה.", two: "כל הפקדה חודשית מתחלקת לשתי פקודות, ולכל פקודה עמלה משלה." },
      /** copy.md 8.1: the aria names of the stepper's two buttons */
      ordersUp: "עוד פעולה בחודש",
      ordersDown: "פחות פעולות בחודש",
      channel: "ערוץ",
      channelOptions: { direct: "ערוצים ישירים", branch: "סניף" },
      channelBrokers: "לא רלוונטי לבתי השקעות",
      fxForeign: (ccy: string) => `הקרן נקובה ב־${ccy}: כל הפקדה מומרת.`,
      fxShekels: "הקרן נקובה בשקלים: אין המרה.",
      deposits: "הפקדה אחת בכל חודש של השנה.",
      /** copy.md 8.1: the amounts chips' labels */
      chips: { amount: "סכום", monthly: "הפקדה חודשית", years: "שנים", all: "כל ההנחות" },
    },
    levelAria: "רמת העמלה",
    levelLine: {
      list: "לפי התעריפון המלא של כל ספק, בלי הנחות.",
      averageNone: "אין ממוצע שנאסף: ממוצעי בנק ישראל ומחשבון העמלות של הבורסה מוצגים רק בקישור.",
      averageSome: (source: string) => `ממוצע העמלות שנגבו בפועל, כפי שפורסם ב${source}. ספק בלי ממוצע מופיע כ״אי אפשר להשוות״.`,
      entered: "ההצעה שלכם מושווית לתעריפון של האחרים.",
    },
    entered: { none: "עוד לא הזנתם הצעה.", link: "להזין הצעה", count: (n: number) => `ההצעה שלכם · ${n}`, binding: "להצעה שלא בכתב לא נמצא מקור שמחייב אותה. שאלה פתוחה SW OQ4" },
    tableHeading: "לפי העלות, מהזולה ליקרה",
    columns: ["דירוג", "ספק", "עלות", "בשנה הראשונה", "לפי סוג עמלה", "תעריפון מ־", "מינימום", "פיקוח", "פתיחה"],
    horizon: { after: ", בכסף של היום" },
    yearOne: "בשנה הראשונה",
    yearOneTag: "בשקלים של השנה הראשונה",
    barAria: "לפי סוג עמלה",
    deciding: (other: string, type: string) => `מכריע מול ${other}: ${type}`,
    decidingDetail: "הפער לפי סוג:",
    tie: (other: string) => `שקולה ל־${other}`,
    tieMany: (others: string) => `שקולות: ${others}`,
    tieThreshold: "ההפרש קטן מסף התיקו של האתר:",
    tieThresholdAfter: ". פרמטר של האתר.",
    tariffLine: { before: "תעריפון מ־", mid: ", נאסף ב־", /* copy.md 8.1: the form with no published date */ collected: "נאסף ב־" },
    tariffLink: "לתעריפון",
    /** copy.md 8.1: the file formats the tariff link names */
    formats: { pdf: "PDF", html: "דף אינטרנט", xlsx: "גיליון" } as Record<string, string>,
    minimums: "מינימום לפתיחת חשבון:",
    minimumsNone: "לא נמצא בתעריפון",
    perTrade: { min: "מינימום לפעולה", max: "מקסימום" },
    protection: "מפוקח:",
    taseMember: "חבר בורסה",
    notIsaSupervised: "לא מפוקח על ידי רשות ניירות ערך",
    protectionDisclosure: "מה מגן על הכסף",
    notModelled: (name: string) => `לא נכלל בחישוב: ${name}.`,
    notModelledF18: "הנוסחה לעמלה הזו עוד לא נכתבה.",
    /** copy.md 8.1: a snapshot line that applies but is no part of a holding's running cost (a transfer out) */
    notModelledOther: "עמלה שאינה חלק מעלות ההחזקה השוטפת.",
    noLine: (base: string) => `אין בתעריפון שורה ל${base}; לא נגבה בחישוב.`,
    /** copy.md 8.1: the bases a missing line is named by, in the sentence above */
    noLineBases: { trade: "קנייה ומכירה", custody: "דמי ניהול פיקדון ניירות ערך", fx: "המרת מטבע" } as Record<string, string>,
    fixedSpread: (name: string) => `${name} נפרסו לחודשים.`,
    rowLinks: { offer: "קיבלתם הצעה? הזינו אותה", edit: "עריכת ההצעה שלכם", switch: "איך עוברים", fees: "מה העמלות האלה יעלו לכם", company: (name: string) => `לעמוד ${name}` },
    vsTag: "מושווה",
    vsSet: "להשוות אליו",
    vsClear: "ביטול ההשוואה",
    // scenario fix 2026-10-24 (sc-broker): the broker the goal comparison runs the brokerage account on is the person's choice, made here or on the card
    useInCompare: {
      use: "לחשב את ההשוואה לפי הספק הזה", // scenario fix 2026-10-24
      active: "ההשוואה שלכם רצה על הספק הזה", // scenario fix 2026-10-24
      clear: "לחזור לספק שהאתר בחר", // scenario fix 2026-10-24
      toCompare: "לתוצאות ההשוואה", // scenario fix 2026-10-24
      noGoal: "אין מטרה שמורה, ולכן אין השוואה שאפשר להריץ על הספק הזה.", // scenario fix 2026-10-24
      toGoal: "להגדיר מטרה", // scenario fix 2026-10-24
    },
    detail: {
      heading: "השורות שנקראו מהתעריפון",
      entered: (lines: string) => `הוחלפו בהצעה שלכם: ${lines}`,
      typeCosts: "העלות לפי סוג עמלה",
      /** copy.md 8.1: the remainder line of F-61 inside F-63 and the labels of a line's facts */
      remainder: "השפעה משולבת של העמלות",
      rate: "שיעור",
      min: "מינימום",
      max: "מקסימום",
      period: "תקופה",
      channel: "ערוץ",
      level: "רמה",
      fromAverage: "ממוצע",
      rules: "החוקים והכללים שהחישוב נשען עליהם",
      /** copy.md 8.1: what each line charges on, by the snapshot's base */
      bases: { trade: "קנייה ומכירה", custody: "דמי ניהול פיקדון ני״ע", fx: "המרת מטבע", fixed_period: "דמי חשבון קבועים" } as Record<string, string>,
    },
    notComparableOffer: (name: string) => `יש לכם הצעה מ${name}? הזינו אותה`,
    notComparableLinks: { tariff: (name: string) => `לעמוד התעריפון של ${name}` },
    coverage: {
      // audit 2026-10-24 (sweep): the counts in their Hebrew forms ("נבדק ספק אחד", "נבדקו שני ספקים", "נבדקו 5 ספקים"), as the compare coverage line
      sentence: { verbOne: "נבדק ", verbMany: "נבדקו ", one: "ספק אחד", two: "שני ספקים", after: " ספקים", colon: ": ", numerals: { one: "אחד", two: "שניים" }, ranked: { one: "דורג", other: "דורגו" }, sep: ", ", not: "אי אפשר להשוות", end: "." },
      oneRanked: { before: "דורג ", mid: " מתוך ", after: " ספקים." },
      groups: { ranked: "דורגו", notComparable: "אי אפשר להשוות" },
    },
    allMissing: "אין עדיין תעריפון שנאסף למוצר הזה.",
    provident: {
      note: "למוצר הזה הדירוג הוא לפי מסלול. כאן מופיעים דמי הניהול לפי התעריפון של כל חברה, בלי דירוג.",
      label: "דמי ניהול לפי התעריפון של החברה, לא מדורג",
      toTracks: "לדירוג לפי מסלול",
      /** copy.md 8.1: the listing's column words and empty cell */
      balance: "מחיסכון",
      deposit: "מהפקדה",
      noFee: "לא נמצא בתעריפון",
      tariff: "תעריפון",
      // audit 2026-10-24 (A35): the title for the provident wrappers, and the one-sentence statement of coverage
      title: { before: "איזו חברה: ", after: "" },
      covered: { before: "נאסף תעריפון של ", one: "חברה אחת", many: " חברות", mid: " מתוך ", after: "; הדירוג הוא לפי מסלול." },
    },
    chart: {
      title: "העלות המצטברת לאורך הזמן",
      marker: { yearOne: "שנה ראשונה", horizon: "מועד המטרה", end: "סוף התקופה" },
      dashed: "הקו המקווקו מבוסס על הצעה שהזנתם.",
      aria: (n: number, years: string) => `גרף: העמלות המצטברות של ${n} ספקים לאורך ${years}. הנתונים המלאים בטבלה.`,
      /** copy.md 8.1: the chart's year readout, the reading under it and the roles of the lines */
      year: "שנה",
      today: "היום",
      yearOneMarker: "שנה ראשונה",
      legendVs: "מושווה",
      realNote: "העמלות ששולמו עד החודש הזה, בכסף של היום. הנקודה האחרונה כוללת את עמלת המכירה.",
    },
    offer: {
      title: (name: string) => `ההצעה שלכם מ${name}`,
      hint: "מלאו רק את השורות שהוצעו לכם; השאר נשאר לפי התעריפון.",
      fields: { trade: "עמלת קנייה ומכירה", custody: "דמי ניהול פיקדון ניירות ערך", fx: "המרת מטבע", fixed: "דמי חשבון קבועים" },
      sub: { pct: "אחוז", min: "מינימום", max: "מקסימום", pctPeriod: (p: string) => `אחוז ${p}`, nisMonth: "₪ לחודש" },
      periods: { month: "לחודש", quarter: "לרבעון", year: "לשנה" } as Record<string, string>,
      placeholder: (v: string) => `תעריפון: ${v}`,
      above: "גבוה מהתעריפון",
      who: "מי הציע ומתי",
      whoText: "מי הציע (לא חובה)",
      when: "תאריך ההצעה",
      binding: "להצעה שלא בכתב לא נמצא מקור שמחייב אותה. שאלה פתוחה SW OQ4",
      buttons: { save: "שמירה", clear: "ניקוי ההצעה", cancel: "ביטול" },
      /** copy.md 8.1: the line under the entered level's table, and the storage note */
      belowTable: "ההצעה שלכם מושווית לתעריפון של האחרים.",
      noStorage: "אי אפשר לשמור במכשיר הזה. ההצעה תישאר רק בזמן הביקור.",
      empty: "מלאו לפחות שורה אחת.",
      noList: "אין שורה כזו בתעריפון",
      errors: {
        percent: (max: number) => `הזינו אחוז בין 0 ל־${max}.`,
        negative: "הסכום לא יכול להיות שלילי.",
        future: "תאריך ההצעה עוד לא הגיע.",
        minAboveMax: "המינימום לא יכול להיות גבוה מהמקסימום.",
        /** copy.md 8.1: a bound without a rate */
        needRate: "הזינו קודם את השיעור של השורה.",
        orders: (min: number, max: number) => `הזינו בין ${min} ל־${max} פעולות בחודש.`,
      },
    },
    links: { funds: (exposure: string) => `כל הקרנות על ${exposure}`, guide: "לעמוד המדריך" },
    loading: "טוען…",
    failed: "האתר לא הצליח לטעון את נתוני הספקים. נסו לרענן.",
    /** copy.md 8.1: the cases the page cannot run, each with the word it needs */
    cannotRun: {
      fundType: "אין עדיין השוואת ספקים לקרן מהסוג הזה.",
      needRate: (ccy: string) => `אין שער ל־${ccy} בשערי הייחוס של הבנק המרכזי האירופי, ולכן אי אפשר להשוות ספקים לקרן הזו.`,
      needYield: "הקרן מחלקת: הזינו את תשואת החלוקה בעמוד הקרנות כדי להשוות ספקים.",
      engine: "החישוב נעצר על נתון בתעריפון:",
      noWrapper: "אין השוואת ספקים למוצר הזה.",
      noP05: "אין קרן מייצגת למוצר הזה.",
    },
    pendingLine: (id: string) => `התוצאה חלקית: העמלה ${id} עוד לא מחושבת.`,
    incompleteRules: "הנוסחה לעמלות על חלוקת רווחים עוד לא נכתבה, ולכן הדירוג חלקי.",
  },

  // ---- 8.2 fund-variant page
  funds: {
    title: { before: "כל הקרנות שעוקבות אחרי ", after: "" },
    back: "המדריך לחשיפה",
    listLine: {
      both: (a: string, b: string) => `לפי רשימת הקרנות של מאיה מ־${a} ורשימת קרנות החוץ של הבורסה מ־${b}, ולפי הרשומות שנאספו.`,
      /** copy.md 8.2: one list collected, the other not */
      onlyIsraeli: (a: string) => `לפי רשימת הקרנות של מאיה מ־${a}, ולפי הרשומות שנאספו.`,
      onlyTase: (b: string) => `לפי רשימת קרנות החוץ של הבורסה מ־${b}, ולפי הרשומות שנאספו.`,
      israeliMissing: "רשימת הקרנות הישראליות עוד לא נאספה; מוצגות הקרנות שיש להן רשומה. הרשימה המלאה במאיה.",
      taseMissing: "רשימת קרנות החוץ של הבורסה עוד לא נאספה. הרשימה המלאה באתר הבורסה.",
      links: { maya: "לרשימת הקרנות במאיה", tase: "לרשימת קרנות החוץ באתר הבורסה" },
      old: (d: string) => `הרשימה לא עודכנה מאז ${d}.`,
    },
    chips: { amount: "סכום", monthly: "הפקדה חודשית", years: "שנים", return: (ccy: string) => `תשואה ב־${ccy}`, inflation: "אינפלציה", fxChange: (ccy: string) => `שינוי שער ${ccy}`, fxStart: (ccy: string) => `שער ${ccy} היום`, w8ben: "W-8BEN", provider: (name: string) => `התעריפון של ${name}`, orders: "פעולות בחודש", all: "כל ההנחות" },
    sheet: {
      title: "ההנחות של השוואת הקרנות",
      w8ben: { label: "יש לכם טופס W-8BEN אצל הברוקר?", yes: "כן", no: "לא", line: "עובדה שלכם, לא חוק או כלל." },
      fxD20: "שער היום נלקח משערי הייחוס של הבנק המרכזי האירופי; כאן מזינים רק כמה ישתנה בכל שנה.",
      fxLink: "לשערי בנק ישראל",
      yieldLabel: (fund: string) => `תשואת החלוקה של ${fund} (אחוז בשנה)`,
      perYear: "תשלומים בשנה",
      yieldLine: "הרשומה של הקרן לא כוללת תשואת חלוקה; הזינו מהמסמכים של הקרן.",
      providerP05: (name: string) => `התעריפון של ${name} (הרשומה המייצגת)`,
      /** copy.md 8.2: the A-03 field's label and the provider chooser's */
      fxChangeLabel: (ccy: string) => `שינוי שער ${ccy} בשנה (אחוז)`,
      fxStartLabel: (ccy: string) => `שער ${ccy} היום (₪)`,
      providerLabel: "הספק שהתעריפון שלו נכנס לחישוב",
      providerChange: "להחליף ספק",
      goalLead: "הסכום, ההפקדה והשנים הם של המטרה השמורה:",
      reset: "איפוס",
    },
    filter: "חיפוש קרן, מנהל או מספר",
    sort: { aria: "סדר ההצגה", rank: "לפי הדירוג", fee: "דמי ניהול", name: "שם" },
    sortLine: "הדירוג נשען על התשואה שהזנתם ועל הפרטים שנאספו לכל קרן.",
    listHeading: "לפי מה שנשאר לכם, מהגבוה לנמוך",
    // waits: no return entered, so nothing is ranked yet (copy.md 8.2, added 2026-10-24, B14)
    groups: { ranked: "דורגו", listed: "מוצגות בלי דירוג", "not-evaluated": "עוד לא נבדקו", waits: "ממתינות לתשואה" } as Record<string, string>,
    columns: ["דירוג", "קרן", "מספר נייר", "מקור", "מדינת המוצא", "חלוקה", "דמי ניהול", "נשאר לכם", "תוצאה", "פתיחה"],
    security: { label: "מספר נייר", copy: "העתקה", copied: "הועתק" },
    sourceTags: { "maya-mutual-funds": "ברשימת מאיה", "tase-foreign-funds": "ברשימת קרנות החוץ של הבורסה", "data-funds": "רשומה שנאספה", notInList: "לא ברשימה האחרונה" } as Record<string, string>,
    domicileSr: (c: string) => `מדינת המוצא: ${c}`,
    trading: { nis: "נסחרת בשקלים בבורסה", abroad: (ccy: string) => `נקנית ב־${ccy} בחו״ל`, quoted: (ccy: string) => `נקובה ב־${ccy}` },
    fees: { fixed_management: "דמי ניהול קבועים", trustee: "שכר נאמן", variable_management: "דמי ניהול משתנים", tracking_difference_12m: "הפרש עקיבה, שנה אחרונה", median_spread: "מרווח ציטוט חציוני" } as Record<string, string>,
    feeNotCollected: "לא נאסף",
    feeTakenZero: "נלקח כאפס בחישוב",
    feesHeading: "עלויות הקרן",
    value: "נשאר לכם במועד המטרה, בכסף של היום",
    outcomes: { ranked: "דורגה", "listed-not-ranked": "מוצגת, לא מדורגת", "not-evaluated": "עוד לא נבדקה" } as Record<string, string>,
    reasons: {
      noRecord: "הפרטים עוד לא נאספו.",
      fieldMissing: (field: string) => `הפרטים עוד לא נאספו: ${field}.`,
      fields: { "fees.fixed_management": "דמי ניהול קבועים", distribution_policy: "מדיניות חלוקה", "tax_status.il_fund_tax_track": "מעמד מס" } as Record<string, string>,
      g18: "מקור משני: רשות המסים לא אישרה שקרן זרה שאינה מחלקת ממוסה רק במכירה. שאלה פתוחה TXF OQ1",
      taxableIsraeli: "לקרן נאמנות חייבת אין עדיין חישוב.",
      yieldMissing: "הזינו את תשואת החלוקה.",
      noRate: (ccy: string) => `אין שער ל־${ccy} בשערי הייחוס של הבנק המרכזי האירופי.`,
      withholding: (country: string) => `ניכוי במקור ב${country}: לא נקבע.`,
      moneyMarket: "סוג הקרן הכספית אינו ברשומה.",
      otherCurrency: (a: string, b: string) => `אין חישוב לקרן ב־${a} על חשיפה ב־${b}.`,
      exitBlocked: (code: string) => `המס ביציאה חסום: שאלה פתוחה ${code}`,
      /** copy.md 8.2: a reason the engine gives that the table has no sentence for, shown with its detail as the engine wrote it */
      other: "אין חישוב לקרן הזו:",
    },
    secondaryTag: "מקור משני",
    rowLinks: { providers: "השוואת ספקים לקרן הזו", check: "מה לבדוק" },
    detail: { heading: "פירוט החישוב", /* copy.md 8.2 */ nominalNote: "הסכומים ששולמו לאורך הדרך, בשקלים של אז; השורה האחרונה בכסף של היום.", fund: "עלויות הקרן", spread: "מרווח הקנייה והמכירה", provider: "עמלות הספק", taxDuring: "מס במהלך התקופה", taxExit: "מס ביציאה", result: "נשאר לכם", rules: "החוקים והכללים שהחישוב נשען עליהם" },
    groupLine: { before: "קרנות זרות הנסחרות בחו״ל: ", after: " מוחזקות אחת־אחת והושוו; לרשימה המלאה אין מקור. ETF OQ4" },
    coverage: {
      before: "נבדקו ",
      mid1: " קרנות: ",
      // copy.md 8.2 (added 2026-10-24, B14): one fund, and a part that is one ("אחת", the feminine word beside a singular verb)
      beforeOne: "נבדקה ",
      oneFund: "קרן אחת",
      midOne: ": ",
      one: { ranked: "אחת דורגה", listed: "אחת מוצגת בלי דירוג", notEvaluated: "אחת עוד לא נבדקה", waits: "אחת ממתינה לתשואה" },
      many: { ranked: "דורגו", listed: "מוצגות בלי דירוג", notEvaluated: "עוד לא נבדקו", waits: "ממתינות לתשואה" },
      end: "וקבוצה אחת.",
    },
    noFunds: (exposure: string) => `האתר עוד לא מכיר קרן על ${exposure}.`,
    noFundsCopy: "העתקת השם",
    cashLike: "לקרן כספית אין כאן השוואה: סוג הקרן אינו ברשומה.",
    cashLink: "למדריך על קרן כספית",
    noReturn: "לא הוזן: האתר לא מנחש תשואה.",
    duplicates: { tag: "שתי רשומות לאותו נייר", unresolved: "לא הוכרע" },
    /** copy.md 8.2: paging inside a group, the empty search, the provider named on the page */
    more: (n: number) => (n === 1 ? "עוד קרן אחת" : `עוד ${n} קרנות`),
    /** copy.md 8.2 (added 2026-10-24): a group heading's singular, from the outcome words of 5.0 */
    groupsOne: { ranked: "דורגה", listed: "מוצגת, לא מדורגת", "not-evaluated": "עוד לא נבדקה", waits: "ממתינה לתשואה" } as Record<string, string>,
    noMatch: "אין קרן שמתאימה לחיפוש.",
    providerNote: { chosen: (name: string) => `החישוב לפי התעריפון של ${name}.`, p05: (name: string) => `החישוב לפי התעריפון של ${name} (הרשומה המייצגת).`, missing: (name: string) => `התעריפון של ${name} לא נאסף; החישוב לפי הרשומה המייצגת.` },
    loading: "טוען…",
    failed: "האתר לא הצליח לטעון את נתוני הקרנות. נסו לרענן.",
    noExposure: "אין חשיפה כזו באתר.",
    needsReturn: "הזינו תשואה במטרה השמורה כדי לדרג את הקרנות.",
    needsReturnLink: "למטרה",
  },
} as const;

// ---------------------------------------------------------------- release 4: the switching playbook (copy.md 8.3)
/** Strings of docs/copy.md 8.3 verbatim; the keys the build added are in copy.md 8.3's "Added 2026-10-24" table, keyed by path. */
export const r4playbook = {
  title: { before: "איך עוברים: ", after: "" },
  lede: "השלבים כפי שהחוקים והכללים קובעים אותם: מה חותמים, מה לצפות, ומה חוזק המקור של כל שלב. לא המלצה לעבור.",
  back: "מה כבר יש לכם",
  strip: {
    from: "מ",
    to: "ל",
    fromOnly: "מ",
    fieldFrom: "מאיפה",
    fieldTo: "לאן",
    pickPair: "בחרו מאיפה ולאן (לא חובה)",
    none: "לא נבחר",
    same: "אותה חברה: החלפת מסלול בתוך הקופה.",
    /** copy.md 8.3: the two fund fields of a brokerage switch */
    fundFrom: "מקרן",
    fundTo: "לקרן",
  },
  stepsHeading: "השלבים, לפי החוקים והכללים",
  stepNumber: "שלב",
  sign: "מה חותמים:",
  expect: "מה לצפות:",
  figure: {
    businessDays: (n: string) => `בתוך ${n} ימי עסקים`,
    days: (n: string) => `בתוך ${n} ימים`,
    months: (n: string) => `${n} חודשים`,
    missing: "בתוך התקופה שהחוזר קובע",
    // audit 2026-10-24 (hebrew-editor): the dual and the singular, by Intl.PluralRules (lib/hebrew.ts)
    forms: {
      businessDays: { lead: "בתוך ", one: "יום עסקים אחד", two: "שני ימי עסקים" },
      days: { lead: "בתוך ", one: "יום אחד", two: "יומיים" },
      months: { lead: "", one: "חודש אחד", two: "חודשיים" },
    },
  },
  openQuestion: "שאלה פתוחה",
  institutionPrefix: "לפי הוראות המוסדות: ",
  noRule: { title: "שיחת שימור: לא נמצא במקורות", head: "על שיחת שימור במוצרי גמל לא נמצא שום דבר במקורות.", known: "מה כן ידוע" },
  experience: {
    disclosure: "מה אנשים מספרים",
    label: "ניסיון של אדם אחד, לא חוק ולא כלל.",
    source: { before: "מקור: ", mid: ", שרשור ", read: ", נקרא ב־" },
    notShipped: "ניסיון מהפורומים לא נכלל בגרסה הזו.",
  },
  /** The strength chip words (copy.md 8.0) and the popover for a copy (8.0). */
  chip: { primary: "ראשי", "primary-mirror": "ראשי (עותק)", institution: "לפי החברה", secondary: "משני", experience: "ניסיון", open: "שאלה פתוחה" } as Record<string, string>,
  chipCopy: { before: "המקור הרשמי נקרא בעותק שמתארח ב", mid: ", נבדק ב־", after: "." },
  /** copy.md 8.3: the host of each mirror, as the rule base's sources name them */
  hosts: { analyst: "אנליסט", wikisource: "ויקיטקסט", nevo: "נבו", meitav: "מיטב" },
  offer: {
    title: "רשמו כל הצעה",
    lede: "הצעות גם מתבטלות. רשמו כל הצעה עם התאריך שלה.",
    items: ["מאיזה ספק", "כל שורת עמלה והמינימום שלה", "מי אמר", "באיזה תאריך", "בכתב או בטלפון"],
    // copy.md 8.3 (added 2026-10-24, B10): the list and the template follow the wrapper's family
    itemsByFamily: {
      provident: ["מאיזה ספק", "דמי הניהול מהחיסכון ומההפקדה, ועד מתי ההנחה", "מי אמר", "באיזה תאריך", "בכתב או בטלפון"],
      bank: ["מאיזה בנק", "הריבית על ההפקדה ולכמה זמן", "מי אמר", "באיזה תאריך", "בכתב או בטלפון"],
    } as Record<string, string[]>,
    copy: "העתקת תבנית לרישום",
    copied: "הועתק",
    template: "הצעה מ___, בתאריך ___: עמלת קנייה ומכירה ___ (מינימום ___); דמי ניהול פיקדון ניירות ערך ___; המרת מטבע ___; דמי חשבון ___. מי הציע: ___. בכתב: כן / לא.",
    templates: {
      provident: "הצעה מ___, בתאריך ___: דמי ניהול מחיסכון ___; דמי ניהול מהפקדה ___; ההנחה בתוקף עד ___. מי הציע: ___. בכתב: כן / לא.",
      bank: "הצעה מ___, בתאריך ___: ריבית על ההפקדה ___, לתקופה של ___. מי הציע: ___. בכתב: כן / לא.",
    } as Record<string, string>,
    link: "ההצעות שהזנתם בהשוואת הספקים",
  },
  cost: {
    brokerage: { before: "המעבר מ", mid: " ל", after: " עכשיו יעלה ", tax: " בכסף של היום, מזה מס במכירה ", end: "." },
    /** copy.md 8.3: the same sentence when the engine finds the switch gains (a cheaper fund outweighs the sale) */
    brokerageSaves: { after: " עכשיו יחסוך ", tax: " בכסף של היום; המס במכירה ", end: "." },
    brokerageDetail: { before: "בלי מעבר היו נשארים ", mid: "; עם המעבר, ", after: ". התמורה אחרי המס פותחת את הקרן החדשה: ", end: "." },
    provident: "המעבר לא עולה כלום לפי החוקים והכללים.",
    providentLines: ["הנחה בדמי ניהול יכולה להסתיים מוקדם במעבר.", "דמי הצטרפות, אם החברה גובה: לפי התעריפון של החברה."],
    inKind: "לפי הצהרות של מוסדות בלבד: העברה לחשבון של אותו בעלים אינה אירוע מס.",
    transferFee: { amount: "עמלת העברת ניירות ערך: ", none: "לא נאסף" },
    hishtalmutPartial: "אי אפשר: קרן השתלמות עוברת רק בשלמותה.",
    differentKinds: "לא נבדק: לא נמצא מקור שאומר שהעברה בין שני סוגים פטורה ממס.",
    open: "חסום: שאלה פתוחה",
    /** copy.md 8.3: the line when the sentence above cannot be built (the funds or the goal are not enough) and the share control of a hishtalmut */
    notEvaluated: "לא נבדק:",
    reasons: {
      "no-fund": "לא נמצאה אחת הקרנות באתר.",
      "need-rate": "אין שער למטבע של הקרן בשערי הייחוס של הבנק המרכזי האירופי.",
      "need-yield": "הזינו את תשואת החלוקה בעמוד הקרן.",
      "fund-type": "אין עדיין חישוב לסוג הקרן הזה.",
      "other-currency": "אין חישוב לקרן שמטבעה שונה מהחשיפה.",
      "no-tariff": "תעריפון הספק לא נאסף.",
      engine: "החישוב לא הצליח.",
    } as Record<string, string>,
    loading: "טוען…",
    shareLabel: "כמה מהיתרה עוברת",
    shareAll: "כל היתרה",
    sharePart: "חלק מהיתרה",
    secondary: "מקור משני",
    heading: "כמה עולה המעבר",
  },
  checklist: {
    heading: "מה לבדוק אחרי המעבר",
    reset: "איפוס",
    confirm: "לאפס את הסימונים?",
    confirmYes: "איפוס",
    confirmNo: "ביטול",
  },
  links: { holdings: "מה כבר יש לכם", providers: "השוואת הספקים", guide: "לעמוד המדריך", rules: "כל החוקים והכללים על מעבר", playbook: "המדריך למעבר" },
  oneStep: { "child-savings-provident": "תוכנית בבנק לא עוברת לבנק אחר; תוכנית בקופת גמל עוברת דרך הקופה המקבלת וביטוח לאומי.", "child-savings-bank": "תוכנית בבנק לא עוברת לבנק אחר; תוכנית בקופת גמל עוברת דרך הקופה המקבלת וביטוח לאומי.", "bank-deposit": "פיקדון לא עובר לבנק אחר לפני הפדיון. כסף חדש אפשר להפקיד בבנק אחר בחשבון במערכת סגורה." } as Record<string, string>,
  /** copy.md 8.3: the brokerage order of steps is an institution's, said in the lede (design-spec 19 edge cases) */
  brokerageNote: "סדר השלבים בחשבון השקעות הוא לפי הוראות של בנקים ובתי השקעות, לא לפי תקנה.",
  /** copy.md 8.3: what each open question did not find (the rule base's open-question list, switching-and-transfers.md) */
  oq: {
    "SW OQ2": "האם חוזר ההעברה חל על קופת גמל להשקעה.",
    "SW OQ3": "מה קובעים לגבי פניות שימור במוצרי גמל.",
    "SW OQ4": "האם הצעה שניתנה לפני ההצטרפות מחייבת.",
    "SW OQ5": "איך נבדקת הסכמת הלקוח להוצאת דוח מהמסלקה.",
    "SW OQ6": "מי מודיע למעסיק להפנות את ההפקדות הבאות, ובתוך כמה זמן.",
    "SW OQ9": "אילו סוגי חשבונות ופעילות המעבר בין בנקים כולל.",
    "SW OQ10": "המחיר המפוקח להעברת ניירות ערך.",
    "SW OQ11": "המס על העברת ניירות ערך בין חשבונות של אותו בעלים.",
    "SW OQ12": "העברה בין מוסד ישראלי לברוקר זר.",
    "SW OQ16": "הסרת סוכן שכבר מחובר לחשבון.",
  } as Record<string, string>,
  loading: "טוען…",
  noWrapper: "אין מדריך מעבר למוצר הזה.",
  incomplete: "המדריך חלקי בשלב הזה: שאלה פתוחה מסומנת במנעול.",
  // audit 2026-10-24 (A56): the summary box, each sentence a rule's own with its code after it
  summary: {
    heading: "בקצרה",
    lede: "משפטים מהשלבים שלמטה, כלשונם. אחרי כל משפט, מאיפה הוא בא.",
    topics: { time: "כמה זמן", cost: "כמה עולה", sign: "איפה חותמים", cancel: "אפשר לבטל", notice: "מתי זה קורה", lose: "מה לבדוק לפני", partial: "העברה חלקית", check: "מה לבדוק אחרי", route: "לאן אפשר", tax: "מס" } as Record<string, string>,
  },
  // audit 2026-10-24 (A56): a self-employed person has no employer to notify
  skipEmployer: "דלגו: לפי הפרופיל השמור אתם עצמאים",
} as const;

// Release 5 (docs/copy.md section 9, status draft 2026-10-24): exposure mode, the revisit notice and sheet, the
// change-log page, the not-covered status card. `{name}` is a place a value object fills (components/exposure-mode/tpl.tsx).
// The strings the build added are in the "Added 2026-10-24" tables of copy.md 9.2 to 9.6, keyed by path.
export const r5 = {
  // 9.0
  mode: {
    aria: "מצב ההשוואה",
    names: { wrapper: "לפי מוצר", exposure: "לפי חשיפה" },
    lede: {
      wrapper: "אותה השקעה בכל מוצר שיכול להחזיק אותה, באותה תשואה.",
      exposure: "אותו כסף, באותו אופק, בכל חשיפה שהאתר מכיר, בתשואה שאתם מזינים לכל אחת; מסנן הירידה שלכם מוציא את מה שלא תסכימו לספוג.",
    },
  },
  // 9.1 goal form
  form: {
    acceptedFall: "הירידה הגדולה ביותר שתסכימו לספוג בדרך למטרה",
    unit: "אחוז מהשווי",
    hint: "ההחלטה שלכם, לא ציון ולא שאלון. האתר לא ממליץ על מספר.",
    use: "משמש את ההשוואה לפי חשיפה ואת סימון ההתאמה של מסלולים.",
    empty: "לא הוזן: ההשוואה לפי חשיפה תרוץ בלי מסנן, ותציין את זה.",
    secondDoor: "השוואה לפי חשיפה (במה הכסף מושקע)", // audit 2026-10-24 (sweep): was "איזו חשיפה מתאימה למטרה"
    // 2026-10-25 (the founder: what is the difference between the two buttons?): the first said only "להשוואה"
    firstDoor: "השוואה לפי מוצר",
    doorsLine: "מוצר: איפה הכסף מוחזק, כמו קרן השתלמות, קופת גמל להשקעה, חשבון השקעות או פיקדון. חשיפה: במה הוא מושקע בתוך המוצר, כמו מדד מניות, אג״ח או מזומן.",
  },
  // 9.2 exposure result
  exposure: {
    title: "{goal}: איזו חשיפה מתאימה",
    pageTitle: "איזו חשיפה מתאימה",
    headline: {
      bare: "לפי התשואות שהזנתם, החשיפה שמתאימה למטרה הזו היא {exposure}.",
      bareSourced: "לפי התשואות שהזנתם ולפי ריבית הבנק שפורסמה, החשיפה שמתאימה למטרה הזו היא {exposure}.", // copy.md 9.2 to 9.6: the bare form with the sourced-cash qualifier
      single: "החשיפה היחידה שדורגה למטרה הזו היא {exposure}.",
      tie: "{a} ו{b} שקולות למטרה הזו לפי התשואות שהזנתם: ההפרש ביניהן {gap}, פחות מסף התיקו של האתר, {theta}.",
      tieMany: "{names} שקולות למטרה הזו לפי התשואות שהזנתם: ההפרש ביניהן {gap}, פחות מסף התיקו של האתר, {theta}.", // copy.md 9.2 to 9.6: three or more tied
      allTied: "כל החשיפות שדורגו שקולות למטרה הזו לפי התשואות שהזנתם.",
      noReturn: "עדיין אין מה להשוות: הזינו תשואה לחשיפה אחת לפחות.", // audit 2026-10-24 (A3): was "הזינו תשואה לחשיפה אחת לפחות כדי להשוות."; now the headline itself
      allExcluded: "מסנן הירידה שלכם פוסל את כל החשיפות שהזנתם: מסכימים לספוג עד {accepted}.",
      allExcludedLink: "לשינוי המספר",
    },
    headings: { ranked: "לפי הסדר, לפי התשואות שהזנתם", listed: "מוצגות בלי דירוג", excluded: "נפסלו לפי מסנן הירידה", notEvaluated: "עוד לא נבדקו" },
    fields: {
      returnLabel: "תשואה שנתית במונחי שקל; האתר לא מוסיף שינוי בשער ה{currency}", // review fix 2026-10-24: the engine takes the entered return as a shekel return (A-03 = 0); was "תשואה שנתית ב{currency}"
      returnLabelIls: "תשואה שנתית במונחי שקל", // review fix 2026-10-24: a shekel exposure has no exchange rate to name
      currencyOne: { USD: "דולר", EUR: "יורו" } as Record<string, string>, // review fix 2026-10-24: the currency in the singular for "שער ה…"
      returnEmpty: "לא הוזן: האתר לא מנחש תשואה.",
      returnHint: "הזינו את התשואה שאתם מניחים לחשיפה הזו. היא תסומן בכחול בכל מקום שבו היא משפיעה.",
      returnFromProduct: "מההשוואה לפי מוצר", // audit 2026-10-24 (decision 16): the equity exposure's return is the one entered in the product comparison; typing here replaces it
      returnFromProductReset: "לחזור לתשואה מההשוואה לפי מוצר",
      currency: { ILS: "שקלים", USD: "דולרים", EUR: "יורו" } as Record<string, string>, // copy.md 9.2 to 9.6: the currency word for the label
      cashPublished: "ריבית הבנק, בתוקף מ־{date}",
      cashNote: "המינימום שהבנק מפרסם לסוג הפיקדון, לא הצעה אליכם. התנאים המחייבים בהסכם הפיקדון.",
      cashOverride: "להזין ריבית אחרת",
      cashReset: "לחזור לריבית שפורסמה",
      cashLabel: "ריבית שנתית", // copy.md 9.2 to 9.6: the label of the overriding field
      institution: "לפי החברה",
      noSeries: "אין סדרה ממקור: שערי בנק ישראל מוצגים רק בקישור. הזינו תשואה.",
      noSeriesLink: "לנתוני בנק ישראל",
      worstLabel: "הירידה החמורה ביותר שאתם צופים בחשיפה {exposure}, בדרך למטרה",
      worstHint: "אין לאתר מקור להערכה כזו, ולכן הוא לא מציע מספר. מה ידוע על הסיכונים, בעמוד המדריך.",
      worstLink: "לסיכונים של {exposure}",
      worstInfo: "על ההערכה", // copy.md 9.2 to 9.6: the accessible name of the info button
      unit: "אחוז מהשווי",
      acceptedChip: "מסכימים לספוג עד {accepted}",
      acceptedNotSet: "לא הוזן כמה תסכימו לספוג",
      acceptedSeparate: "לחשיפה הזו בנפרד",
      acceptedCommon: "לפי המספר המשותף",
      holdingLine: "מוחזקת במוצר {wrapper}",
      holdingChange: "להחליף מוצר",
      holdingParameter: "המוצר שהאתר בחר כברירת מחדל לחשיפה הזו, פרמטר של האתר. אפשר לבחור כל מוצר שיכול להחזיק אותה.",
      holdingAria: "באיזה מוצר להחזיק", // copy.md 9.2 to 9.6
      holdingDone: "סגירה", // copy.md 9.2 to 9.6
    },
    notes: {
      lossWorst: "מסנן הירידה לא הופעל: הזינו את הירידה שאתם צופים.",
      lossAccepted: "מסנן הירידה לא הופעל: הזינו את הירידה שתסכימו לספוג.",
      excludedTag: "נפסלה: צופים ירידה של {worst}, מסכימים לספוג עד {accepted}",
      excludedLine: "שנו אחד מהמספרים כדי להחזיר אותה להשוואה.",
      passed: "עברה את מסנן הירידה: צופים {worst}, מסכימים לספוג עד {accepted}.",
      passedEqual: "עברה את מסנן הירידה: {worst}, בדיוק המספר שתסכימו לספוג. ירידה שווה למספר שלכם נשארת בהשוואה.", // copy.md 9.2 to 9.6: F-71 "equal is kept", named on the row
    },
    valueLabel: "נשאר לכם במועד המטרה, בכסף של היום",
    valueLabelNominal: "נשאר לכם במועד המטרה, בשקלים של העתיד", // as 6.2
    listedThrough: "במוצר {wrapper}: {reason}",
    coverageReasons: {
      excluded: "נפסלה לפי מסנן הירידה: צופים ירידה של {worst}, מסכימים לספוג עד {accepted}.",
      noReturn: "הזינו תשואה",
      noSeries: "אין סדרה ממקור: שערי בנק ישראל מוצגים רק בקישור.",
      noWrapper: "לא נבחר מוצר שמחזיק את החשיפה",
      cannotHold: "{wrapper} לא מחזיק את החשיפה הזו", // copy.md 9.2 to 9.6: engine reason wrapper-cannot-hold (a build error in the normal flow)
      noFund: "לא נבדקה: פרטי הקרן עוד לא נאספו.", // copy.md 9.2 to 9.6: P-08 row waiting for a fund record
      noTerms: "עוד אין לאתר את תנאי המוצר", // copy.md 9.2 to 9.6
    },
    links: { holdIt: "באיזה מוצר להחזיק את זה", buyFund: "איזו קרן לקנות", holdItNoReturn: "הזינו תשואה קודם" },
    choose: { button: "בחרתי בזה", chosen: "הבחירה שלכם, מ־{date}", unchoose: "לבטל את הבחירה" },
    save: { button: "לשמור את ההשוואה", saved: "נשמרה ב־{date}", again: "לשמור שוב", confirm: "להחליף את ההשוואה שנשמרה ב־{date}?", replace: "להחליף", cancel: "ביטול", failed: "האתר לא הצליח לשמור במכשיר הזה. ההשוואה תעבוד, אבל לא תישמר." }, // failed: as 6.0
    chart: {
      title: "הכסף לאורך הזמן, בחשיפות המובילות",
      chipsAria: "אילו חשיפות להציג",
      limit: "עד ארבע בבת אחת; השאר בטבלה.",
      more: "עוד {n} בטבלה",
      reference: "מזומן, להשוואה",
      caption: "הקווים המקווקווים מבוססים על תשואות שהזנתם, לא על הערכה של האתר.",
      empty: "אין חשיפות מדורגות להצגה.",
      loading: "טוען…", // copy.md 9.2 to 9.6: the skeleton line (design-spec 21.4)
      aria: "גרף: הכסף בחשיפות לאורך",
    },
    chips: { years: "שנים", amountNow: "סכום היום", monthly: "הפקדה חודשית", available: "זמין מיד", inflation: "אינפלציה", acceptedFall: "מסכימים לספוג עד", all: "כל ההנחות" },
    assumptions: {
      title: "ההנחות של ההשוואה לפי חשיפה",
      group: "{exposure}: תשואה · ירידה צפויה · מסכימים לספוג · מוחזקת במוצר",
      ret: "תשואה", worst: "ירידה צפויה", accepted: "מסכימים לספוג", holding: "מוחזקת במוצר",
      empty: "לא הוזן", // copy.md 9.2 to 9.6
    },
    coverage: {
      sentence: "נבדקו {n} חשיפות:", // audit 2026-10-24 (A91): the counts follow with their own verbs (`counts`); was one sentence with "1 דורגו"
      counts: { ranked: { one: "דורגה", other: "דורגו" }, "listed-not-ranked": { one: "מוצגת בלי דירוג", other: "מוצגות בלי דירוג" }, excluded: { one: "נפסלה לפי מסנן הירידה", other: "נפסלו לפי מסנן הירידה" }, "not-evaluated": { one: "עוד לא נבדקה", other: "עוד לא נבדקו" }, "not-eligible": { one: "לא מתאימה לכם", other: "לא מתאימות לכם" } } as Record<string, Record<string, string>>, // audit 2026-10-24 (A91)
      groups: { "not-eligible": "לא מתאימות לכם", excluded: "נפסלו לפי מסנן הירידה", "not-evaluated": "עוד לא נבדקו", "listed-not-ranked": "מוצגות בלי דירוג", ranked: "דורגו" } as Record<string, string>,
      last: "הקרנות והמסלולים שנותנים כל חשיפה מושווים בעמודים ״איזו קרן לקנות״ ו״כל המסלולים בכל החברות״.",
    },
    rank: "מקום", // copy.md 9.2 to 9.6
    detail: "פירוט", // copy.md 9.2 to 9.6
    detailTitle: "פירוט", // copy.md 9.2 to 9.6
    checklist: "מה לבדוק", // copy.md 9.2 to 9.6: as 6.2
    failed: "האתר לא הצליח לחשב את ההשוואה. רעננו את העמוד ונסו שוב.", // as 6.2
    returnLabels: { entered: "לפי תשואה שהזנתם: {rate}", sourced: "לפי ריבית הבנק שפורסמה: {rate}", cashEntered: "לפי ריבית שהזנתם: {rate}" },
    wrapperSubject: "לפי {exposure} בתשואה שהזנתם, {rate}",
    cannotHoldTag: "לא מחזיק {exposure}",
    // copy.md 9.2 to 9.6: P-08 rows that cannot run, in the words of the parameter's own rows
    p08: { gov: "לא נבדקה: תדירות הקופון של סדרה לא צמודה עוד לא במאגר החוקים והכללים. שאלה פתוחה GOV OQ4", fund: "לא נבדקה: פרטי הקרן עוד לא נאספו." },
  },
  // 9.3 revisit
  revisit: {
    stripSaved: "נשמרה ב־{date}",
    stripSavedChoice: "נשמרה ב־{date} · הבחירה: {choice}",
    changed: "לבדיקה מחדש: {what} השתנה ב־{date}",
    changedMany: "לבדיקה מחדש: {what} השתנו ב־{date}", // copy.md 9.2 to 9.6: the plural verb for counts (copy 9.3 note)
    changedSince: "לבדיקה מחדש: {what} השתנה מאז {date}",
    changedSinceMany: "לבדיקה מחדש: {what} השתנו מאז {date}",
    changedRanking: "לבדיקה מחדש: הדירוג השתנה מאז {date}", // copy.md 9.2 to 9.6: nothing the run read differs by entry, but the ranking moved
    unchanged: "ללא שינוי מאז {date}",
    // audit 2026-10-24 (A30): the goal's own inputs changed since the save, so the saved comparison does not fit it
    goalChanged: "המטרה השתנתה מאז השמירה ({what}); ההשוואה השמורה אינה תקפה לה",
    goalChange: "{label}: מ־{before} ל־{after}",
    goalChangeMore: "{first} ועוד {more}",
    goalChangeMoreOne: "שינוי אחד",
    goalChangeMoreMany: "{n} שינויים",
    goalFields: { horizonYears: "שנות החיסכון", amountNow: "הסכום עכשיו", monthly: "ההפקדה החודשית", available: "הסכום הזמין", anytime: "זמינות בכל עת", return: "התשואה שהזנתם", inflation: "האינפלציה", insurance: "עלות הביטוח", acceptedFall: "הירידה שמסכימים לספוג", age: "הגיל", employment: "סוג ההעסקה", salary: "השכר", pension: "הפקדות לפנסיה", hishtalmut: "הפקדות להשתלמות", exposures: "נתוני החשיפות", preset: "סוג המטרה" },
    what: { rule: "{code}", parameter: "הפרמטר {name}", data: "הנתון {name}", assumption: "ההנחה {name}" },
    counts: { rules: "{n} חוקים וכללים", parameters: "{n} פרמטרים", data: "{n} קובצי נתונים", assumptions: "{n} הנחות" },
    many: "{n} שינויים מאז {date}, {m} מהם נגעו להשוואה הזו.",
    computing: "בודק מה השתנה…",
    resultUnchanged: "נבדק מחדש היום: ללא שינוי מאז {date}.",
    verdict: {
      holds: "הדירוג נשמר: {option} עדיין ראשונה.",
      topChanged: "הדירוג השתנה: {option} במקום {before}.",
      tieSet: "קבוצת השקולות השתנתה: {names}.",
      cannotRun: "אי אפשר לבדוק: {reason}",
      none: "הדירוג נשמר: אף אפשרות לא דורגה, גם לא בזמן השמירה.", // copy.md 9.2 to 9.6: both sides empty
    },
    cannotRunReasons: { rule: "{code} לא עודכן", input: "חסר נתון: {field}", record: "הרשומה {name} לא קיימת עוד" },
    choiceStill: "בחרתם באפשרות {option}; היא עדיין במקום {n}.",
    choiceNot: "בחרתם באפשרות {option}; היום היא {outcome}: {reason}.",
    banner: { sheet: "מה השתנה", saveToday: "לשמור את ההשוואה של היום" },
    sheet: {
      title: "מה השתנה מאז {date}",
      kinds: { rule: "חוקים וכללים", parameter: "פרמטרים", data: "נתונים", assumption: "הנחות" },
      was: "היה {v}", now: "עכשיו {v}",
      checked: "נבדק ב־{date}",
      removed: "הוסר מהמאגר", fileGone: "הקובץ לא קיים עוד", added: "קובץ חדש", notThere: "לא היה",
      stateChange: "היה פרמטר · עכשיו הזנתם",
      rechecked: "הקובץ נבדק מחדש; הערכים לא השתנו.",
      more: "עוד {n}",
      valueChanges: "מה זז בהשוואה",
      valueChange: "{option}: מ־{a} ל־{b}, בכסף של היום", // audit 2026-10-24 (sweep): no arrow glyph
      tags: { new: "חדשה בהשוואה", left: "לא מדורגת עוד" },
      beforeAfter: "לפני ואחרי",
      columns: { before: "בשמירה, {date}", now: "היום" },
      rows: { top: "ראשונה: {option}", tie: "שקולות: {names}", noTie: "אין שקולות", none: "אף אפשרות לא דורגה" },
      empty: "אף חוק, כלל, פרמטר, נתון או הנחה שההשוואה נשענה עליהם לא השתנו.",
      detail: "פירוט",
      close: "סגירה", // copy.md 9.2 to 9.6
    },
    unreadable: "ההשוואה שנשמרה היא מגרסה ישנה של האתר ואי אפשר לבדוק אותה מחדש.",
    unreadableActions: { redo: "להשוות מחדש ולשמור", del: "מחיקה מהמכשיר" },
    deleteConfirm: "למחוק את ההשוואה השמורה מהמכשיר הזה?",
    deleteYes: "מחיקה",
    deleteNo: "ביטול",
    modeNames: { wrapper: "לפי מוצר", exposure: "לפי חשיפה" },
    // copy.md 9.2 to 9.6: the outcome words for "בחרתם ב…; היום היא {outcome}"
    outcomes: { "listed-not-ranked": "מוצגת, לא מדורגת", excluded: "נפסלה", "not-evaluated": "עוד לא נבדקה", "not-eligible": "לא מתאימה לכם" } as Record<string, string>,
    choiceGone: "לא קיימת עוד", // copy.md 9.2 to 9.6
    compact: { changed: "לבדיקה מחדש", unchanged: "ללא שינוי" },
  },
  // 9.5 not covered: the status card
  graduation: {
    block: "מצב הכיסוי",
    blocked: "חסום: {n} שאלות פתוחות",
    blockedOne: "חסום: שאלה פתוחה אחת",
    remaining: "השאלות נסגרו; נותר: {list}",
    remainingItems: { record: "רשומה עם מקור", formula: "שיטת חישוב" },
    graduated: "עבר לכיסוי מלא ב־{date}",
    blockersHeading: "מה חוסם",
    blocker: "שאלה פתוחה {code}: {text}",
    blockerShort: "שאלה פתוחה {code}",
    narrowed: "צומצם ב־{date}: {rule}",
    institution: "יש תשובה של מוסד; האתר מחשב לפיה ומסמן ״לפי החברה״, אבל היא לא סוגרת שאלת מס לצורך מעבר לכיסוי מלא.", // copy.md 9.5 (D23, 2026-10-24)
    reopened: "נפתח מחדש ב־{date}",
    closuresHeading: "מה נסגר",
    closure: "נסגר ב־{date}: {rule}",
    none: "עוד לא נרשמו סגירות.",
    closureNoDate: "נסגר: {rule} (התאריך לא נרשם)",
    path: "כשייסגר: יופיע במדריך, בהשוואה למטרה, ב״חברות ומסלולים״ ובעמודי ״איזה בנק או בית השקעות״ ו״איזו קרן לקנות״, ויימנה בשורת הכיסוי של כל השוואה.",
    nearest: "הקרוב ביותר לכיסוי מלא",
    graduatedHeading: "עברו לכיסוי מלא",
    graduatedItem: "{name}, מ־{date}",
    graduatedLink: "לעמוד המדריך",
    holdingsLink: "מה חוסם את הכיסוי",
    sourceNote: "המצב נקרא מקטעי ״מצב מעבר״ בקובצי מאגר החוקים והכללים של כל מוצר ומרשימת הפערים הפתוחים של שיטת החישוב.", // copy.md 9.2 to 9.6
  },
  // 9.6 additions to existing screens
  additions: {
    fitLossLine: "לפי האופק ולפי הירידה שתסכימו לספוג ({accepted})",
    fitTrackSide: "המסלול מתאים לירידה של עד {max}, פרמטר של האתר",
    fitNotMet: "המסלול מתאים לירידה של עד {max}, ואתם מסכימים לספוג עד {accepted}", // copy.md 9.2 to 9.6: the line when the track's fall exceeds the person's
    exportSaved: "{n} השוואות שמורות",
  },
} as const;

// the parameters page's name and field labels for P-08 (docs/parameters-rationale.md, added 2026-10-24)
Object.assign(parametersPage.names, { "P-08": "המוצר שמחזיק כל חשיפה, בהשוואה לפי חשיפה" });
for (const [id, he] of Object.entries({ "shekel-cash": "מזומן שקלי", makam: "מק״מ", "government-bond-cpi": "אג״ח ממשלתית צמודה", "government-bond-unlinked": "אג״ח ממשלתית לא צמודה", "index-sp500": "מדד S&P 500", "index-ta125": "מדד ת״א-125", "general-track": "מסלול כללי" })) {
  (parametersPage.fields as Record<string, string>)[`P-08.holding.${id}.wrapper_id`] = `${he}: המוצר שמחזיק אותה`;
}

// ---------------------------------------------------------------------------------------------------------------
// Knowledge layer, 2026-10-24 (research/knowledge/2026-10-24-synthesis.md). Keys are fixed; the Hebrew editor
// polishes the values. docs/copy.md gets a section listing these strings.
// ---------------------------------------------------------------------------------------------------------------

/** The source block under a rule's text and in the number sheet (synthesis §3.3). */
export const sourceBlock = {
  /** The document kind on a mirror link: "{title} · נוסח החוק (עותק), {host}" */
  mirrorKind: "נוסח החוק (עותק)",
  /** A copy of a document that is not a law or regulation (a circular or a report re-hosted elsewhere). */
  copyKind: "עותק",
  hosts: { wikisource: "ויקיטקסט", nevo: "אתר נבו" } as Record<string, string>,
  /** The second block when an official document is first and a mirror second. */
  checked: "נבדק",
  mayHaveChanged: "מאז ייתכן שהנוסח השתנה.",
  pdfTag: "PDF",
  more: { one: "עוד מקור אחד", two: "עוד שני מקורות", many: "עוד {n} מקורות" },
  /** The word after "נבדק {date} ·" when the source is weaker than the law. */
  weak: { "primary-mirror": "עותק", institution: "לפי החברה", secondary: "מקור משני" } as Record<string, string>,
  /** The one-line citation the copy button writes: "{claim} — {publisher}, {document}, {locator}. {url} (נבדק {date})" */
  citation: { checked: "נבדק", copied: "הועתק" }, // 2026-10-25: was "ההפניה הועתקה."; the box's own label turns into it
  /** The rules page only, under a mirror rule's source: the official publication is not attached yet. */
  officialMissing: "הפרסום הרשמי ברשומות עוד לא צורף; הנוסח נקרא מתוך עותק.",
  /** The lede sentence of the rules pages' legend: what a copy is and what a date is. */
  legendLine: "הכול נכתב מנוסח החוק או ממסמך של הרשות כשאפשר; מה שנלקח ממסמך של חברה מסומן לידו. התאריך הוא היום שבו האתר קרא את המקור.",
} as const;

/** Hebrew for the `update_rule` words the rule records carry (shown beside a figure with its tax year). */
export const updateRules = {
  "fixed in law": "קבוע בחוק",
  "cpi-linked 1 jan": "מתעדכן ב־1 בינואר לפי המדד",
  "average-wage-linked": "מתעדכן לפי השכר הממוצע",
  "provider-set": "החברה קובעת",
  "fixed in regulation": "קבוע בתקנות",
  market: "לפי השוק",
  founder: "פרמטר של האתר",
  frozen: "מוקפא בשנים {years}",
} as const;

/** Additions to the rule card (synthesis §3.3). */
export const ruleCardMore = {
  forTaxYear: "לשנת המס",
  derivedFrom: "נגזר מ־",
  derivedLine: "זו מסקנה משילוב של כמה חוקים וכללים, לא משפט אחד שנמצא במקור.",
  stable: "לא משתנה מעצמו",
  usesLead: "משפיע על",
  usesEngine: "החישובים באתר",
  usesNone: "רקע בלבד: לא נכנס לחישוב ולא מוצג בעמוד אחר.",
  // 2026-10-25 (the founder: "הפניה" for a citation; a better Hebrew word): "מראה מקום", on a box that shows the citation
  copyCitation: "העתקת מראה המקום",
  citationLabel: "מראה מקום",
  experienceTag: "ניסיון של אדם אחד",
} as const;

/** The rules front page and the five shelves (synthesis §3.4). */
export const rulesFront = {
  title: "חוקים וכללים",
  lede: "כל חוק וכל כלל שהאתר נשען עליו, עם המקור שלו. מסננים לפי השאלה, המוצר או המספר.",
  pinned: { title: "השאלות שכולם שואלים" }, // the tag and the provisional note were removed 2026-10-24 at the founder's request
  changing: { title: "מה עומד להשתנות", line: "מה שיש לו תאריך בדיקה חוזרת, לפי חודש.", month: "ב{month}" },
  filter: "חיפוש לפי מספר, כותרת או מילה",
  shelves: {
    state: { name: "מה המדינה לוקחת", line: "מס בהפקדה, בדרך ובמשיכה; פטורים; מה חייב בדיווח" },
    costs: { name: "מה הבנק או בית ההשקעות לוקחים", line: "דמי ניהול ותקרות, עמלות, הנחות שנגמרות, מינימום" },
    access: { name: "מה אפשר לעשות עם הכסף", line: "מתי אפשר למשוך, איך עוברים, מי רשאי להצטרף, תקרות הפקדה" },
    protection: { name: "מי מפקח ומה מוגן", line: "מי מפקח, מה קורה אם החברה קורסת, מה מבוטח" },
    structure: { name: "איך המוצר בנוי", line: "מטבע, חלוקה, מדדים, מה כתוב בדוח ואיך קוראים לדברים" },
  } as Record<string, { name: string; line: string }>,
  /** Sub-group names per rule-base file, the reader's words (no "מס:" prefix); a file not listed keeps rulesPage.groups. */
  subgroups: {
    "tax-securities-israeli.md": "מניות, קרנות ואג״ח בבורסה בישראל",
    "tax-securities-foreign.md": "קרנות וניירות ערך מחו״ל",
    "tax-interest-deposits-bonds.md": "ריבית: פיקדונות, מק״מ ואג״ח ממשלתיות",
    "tax-hishtalmut.md": "המס על קרן השתלמות",
    "tax-pension-gemel-lekitzba.md": "המס על פנסיה וקופת גמל לקצבה",
    "tax-gemel-lehashkaa-ira-child.md": "המס על קופת גמל להשקעה, ניהול אישי וחיסכון לכל ילד",
    "tax-general.md": "מדרגות המס, מס יסף וביטוח לאומי",
    "tax-insurance-and-amendment-190.md": "פוליסות חיסכון ותיקון 190 (עוד לא באתר)",
    "tax-tier2-other.md": "מט״ח, אג״ח קונצרניות, ריט, זהב ותיקים מנוהלים (עוד לא באתר)",
  } as Record<string, string>,
  products: { all: "כל המוצרים", common: "משותף לכל הקופות", tier2: "עוד לא באתר" },
  // one page with filters (founder, 2026-10-24 evening): the shelves, the products, the prefixes and "what will change" are filters on /rules
  filters: {
    all: "הכול",
    shelfLabel: "לפי השאלה",
    productLabel: "לפי מוצר",
    changing: "עומד להשתנות",
    prefixLabel: "לפי מספר",
    clear: "ניקוי הסינון",
    showing: "מוצגים {n} מתוך {total}", // no noun: the set is "חוקים וכללים" and a single record has no noun (founder, 2026-10-24 evening)
    showingOne: "מוצג אחד מתוך {total}",
    none: "שום דבר לא מתאים לסינון הזה.",
    preset: "החוקים והכללים שעונים על השאלה",
    presetAll: "לכל החוקים והכללים",
  },
  experience: { title: "ניסיון של אחרים", line: "עדויות של אנשים מהפורום, לא חוקים ולא כללים; מסומנות כך גם בעמוד ״איך עוברים״." },
  /** The quiet line under the filter field: the questions left this page for /questions (founder, 2026-10-24 evening). */
  questionsLine: { before: "יש לכם שאלה?", link: "השאלות שכולם שואלים" },
} as const;

/** The questions page (/questions): the common questions left the rules page and got a one-line answer each (founder, 2026-10-24 evening). */
export const questions = {
  title: "השאלות שכולם שואלים",
  lede: "תשובה של שורה לכל שאלה, ומתחתיה החוקים והכללים שאפשר לפתוח ולבדוק במקור.",
  toRules: "לכל החוקים והכללים בנושא",
  noAnswer: "התשובה עוד לא נכתבה; החוקים והכללים שעונים על השאלה מופיעים מתחת.",
  home: { title: "שאלות שכולם שואלים", all: "לכל השאלות" },
} as const;

/** The documents page (synthesis §3.5). */
export const documents = {
  title: "מסמכים",
  lede: "המסמכים שמאגר החוקים והכללים נקרא מהם: חוקים, תקנות, חוזרים ומדריכים של הרשויות, ומסמכים של בנקים וחברות. לכל מסמך, מה שנשען עליו.",
  sections: { laws: "חוקים ותקנות", regulators: "רשויות ומפקחים", exchange: "הבורסה", institutions: "מסמכים של בנקים וחברות", secondary: "כתבות ומקורות משניים" },
  kinds: { law: "חוק", regulation: "תקנות", circular: "חוזר", regulator_page: "עמוד באתר הרשות", official_pdf: "מסמך רשמי", exchange_rules: "הנחיות הבורסה", institution_doc: "מסמך של החברה", article: "כתבה", dataset: "מאגר נתונים", form: "טופס", other: "מסמך" } as Record<string, string>,
  rulesLead: "מה שנשען על המסמך:",
  more: { one: "עוד מסמך אחד", many: "עוד {n} מסמכים", line: "מסמכים עם הפניה אחת או שתיים בלבד: עמודים של חברות, כתבות ומקורות נוספים." },
  rulesMore: "עוד {n}",
  checked: "נבדק לאחרונה",
  open: "למסמך",
  data: {
    title: "נתונים שהאתר קרא",
    lede: "תעריפונים, תנאי פיקדונות, דוחות של קרנות וסדרות נתונים, כל אחד עם התאריך שבו נקרא ועם העמוד באתר שמשתמש בו.",
    tariffs: "תעריפונים",
    tariffLine: "תעריפון {provider}",
    noPrintedDate: "ללא תאריך מודפס",
    linesAfter: " שורות בתעריפון",
    missing: "לא נמצא תעריפון שפורסם",
    funds: "קרנות שהאתר קרא",
    fundsLine: "קרנות שהאתר קרא אחת־אחת מהדוח של מנהל הקרן; לא רשימה של כל הקרנות בבורסה.",
    deposits: "תנאי פיקדונות",
    series: "סדרות נתונים",
    latest: "הערך האחרון",
    datasets: "נתוני הרשות",
    datasetsLine: "המסלולים והקופות שהרשות מפרסמת, בעמוד ״חברות ומסלולים״.",
    toPage: "לעמוד שמשתמש בזה",
  },
} as const;

/**
 * "What makes it different" on a guide page (D29, research/specs/2026-10-25-guide-signatures/spec.md): the frame, then one block per
 * visual. Builder G1 owns the cash-like pages (`account`, `deposit`, `plan`, `ladder`, `renewable`, `makam`, `bond`); builder G2 adds its own keys.
 */
export const guideSignature = {
  indexTitle: "מה מייחד",
  titleBefore: "מה מייחד את",
  pages: {
    "current-account": { name: "חשבון עובר ושב", question: "כמה עולה להשאיר כסף בעו״ש?", alt: "קרן כספית יומית", altId: "money-market-fund-daily", altLine: "אותו כסף, באותה זמינות, בקרן כספית יומית. כך נראה ההפרש." },
    "bank-deposit": { name: "פיקדון בנקאי", question: "על מה מוותרים כשנועלים את הכסף?", alt: "קרן כספית יומית", altId: "money-market-fund-daily", altLine: "אותו כסף בקרן כספית יומית, שאפשר לפדות בכל יום מסחר." },
    "savings-plan": { name: "תוכנית חיסכון", question: "מתי אפשר לקחת את הכסף?", alt: "פיקדון בנקאי חד־פעמי", altId: "bank-deposit", altLine: "אותו סכום בפיקדון אחד שנפתח בבת אחת." },
    "money-market-fund-daily": { name: "קרן כספית יומית", question: "כמה מהר הכסף חוזר, ומה הוא מרוויח עד אז?", alt: "עו״ש ופיקדון לשנה", altId: "current-account", altLine: "הסולם מראה איפה הקרן עומדת מול עו״ש ומול פיקדון לשנה." },
    "money-market-fund-renewable": { name: "קרן כספית מתחדשת", question: "מתי אפשר לצאת?", alt: "קרן כספית יומית", altId: "money-market-fund-daily", altLine: "הקרן היומית נפדית בכל יום מסחר, בלי לחכות למועד קבוע." },
    makam: { name: "מק״מ", question: "מה קורה אם מוכרים לפני הפדיון?", alt: "פיקדון לשנה", altId: "bank-deposit", altLine: "בפיקדון לשנה של לאומי אי אפשר לשבור; במק״מ אפשר למכור בכל יום מסחר, במחיר של אותו יום." },
    "government-bond": { name: "אג״ח ממשלתית", question: "מה קורה למחיר כשהריבית זזה?", alt: "מק״מ", altId: "makam", altLine: "הלוואה קצרה לממשלה: כשהריבית זזה, מחיר המק״מ כמעט לא זז." },
    "keren-hishtalmut": { name: "קרן השתלמות", question: "מה הנעילה של קרן ההשתלמות קונה לכם?", alt: "חשבון ניירות ערך", altId: "brokerage-account", altLine: "אותו מדד ואותה הפקדה, בלי נעילה ובלי הטבת מס." },
    "kupat-gemel-lehashkaa": { name: "קופת גמל להשקעה", question: "מה הדרכים לצאת מקופת גמל להשקעה?", alt: "חשבון ניירות ערך", altId: "brokerage-account", altLine: "אותו מדד ואותה הפקדה בחשבון ניירות ערך. כך נראה ההפרש." },
    "pension-comprehensive": { name: "קרן פנסיה מקיפה", question: "מאיפה בא כל שקל מההפקדה, ומה הוא קונה?", alt: "", altId: "", altLine: "אין חלופה להשוות מולה: פנסיה היא חובה לשכיר, לפי צו ההרחבה." },
    "pension-general": { name: "קרן פנסיה כללית", question: "מאיפה בא כל שקל מההפקדה, ומה הוא קונה?", alt: "", altId: "", altLine: "אין חלופה להשוות מולה: פנסיה היא חובה לשכיר, לפי צו ההרחבה." },
    "provident-for-annuity": { name: "קופת גמל לקצבה", question: "מאיפה בא כל שקל מההפקדה, ומה הוא קונה?", alt: "", altId: "", altLine: "אין חלופה להשוות מולה: שכיר יכול לקיים בה את חובת הפנסיה רק אם יש לו כיסוי מוות ונכות במקום אחר." },
  } as Record<string, { name: string; question: string; alt: string; altId: string; altLine: string }>,
  altBefore: "הכי קרוב לזה, באותה החזקה:",
  altLinkBefore: "לעמוד של",
  compareLink: "להשוואה המלאה לפי המטרה שלכם",
  timeline: { summary: "שחקו עם המספרים שלכם", hide: "הסתרת המספרים", lead: "גרף לדוגמה של כסף שנכנס, גדל לפי הנחה ויוצא אחרי עלויות ומס. אפשר לשנות כל הנחה." },
  common: {
    notComputed: "עוד לא חושב",
    onlyLeumi: "לפי הפרסום של לאומי; בנקים אחרים עוד לא נאספו.",
    fundAssumption: { before: "אין תשואה שפורסמה לקרן כספית שהאתר רשאי להציג, ולכן הקרן רצה כאן על", after: "בשנה. זו הנחה של האתר, לא הבטחה ולא תחזית." },
    source: { guide: "הזנתם", goal: "מהמטרה השמורה", p05: "דוגמה של האתר" } as Record<string, string>,
    sourceLead: "הסכום והזמן:",
    years: "כמה שנים",
    todayMoney: "הסכומים בכסף של היום, אחרי מס ועלויות.",
    drag: "גררו את הסמן, הקישו על הציר או השתמשו בחצים.",
    inputNames: {
      balance: "היתרה",
      years: "מספר השנים",
      amount: "הסכום",
      monthly: "ההפקדה החודשית",
      rate: "הריבית שפורסמה",
      ceiling: "תקרת היתרה שנושאת ריבית",
      term: "תקופת הפיקדון",
      assumption: "הריבית שהאתר מניח",
      maxInterval: "המרווח המרבי בין מועדים",
      coupon: "הקופון שהאתר מניח",
      couponEvery: "תדירות הקופון",
    },
    outOfRange: { before: "הסכום מחוץ לטווח שהריבית שפורסמה נקבעה לו:", middle: "עד", after: "." },
    gaps: {
      depositBreak: "הבנק מתאר שבירה בתנאים שהאתר עוד לא מחשב.",
      planLockPerDeposit: "ההנחה כאן: לכל הפקדה חודשית יש נעילה משלה, באורך תקופת התוכנית, כמו בפיקדון שנפתח בכל חודש. אף מקור לא אומר אם כך זה בפועל (שאלה פתוחה BANK-OQ12); בחוזה של בנק אחד נקראו תוכניות שנפתחות כולן יחד, בנקודת יציאה שנספרת מתחילת התוכנית.",
      mmfPayoutDays: "כמה ימי עסקים עוברים מהוראת הפדיון עד שהכסף בחשבון עוד לא ידוע (שאלה פתוחה MF-OQ4).",
      renewableDates: "מועדי הסדרות הבאות עוד לא נאספו: הם כתובים בהסכם הקרן ובתשקיף שלה, והאתרים שמפרסמים אותם חוסמים קריאה אוטומטית.",
      seriesDate: "תאריך הפדיון של הסדרה לא נמצא בנתוני הקרן.",
      accountBanks: "הריביות שהבנקים מפרסמים על יתרה בעו״ש עוד לא נאספו.",
    } as Record<string, string>,
    gapFallback: "הנתונים לזה עוד לא נאספו.",
  },
  account: {
    balance: "יתרה בעו״ש",
    // 2026-10-25 (G3): the page leads with 0%; most banks pay nothing on a current account, and the interest of the few that do is a fold
    headline: { lead: "אחרי", inAccount: "בעו״ש שווים", inBank: "בעו״ש של", worth: "שווים", today: "בכסף של היום:", less: "פחות", more: "יותר", same: "בלי שינוי" },
    mostPayNothing: "רוב הבנקים לא משלמים ריבית על עו״ש, ולכן הכסף מאבד מערכו בקצב עליית המחירים.",
    commonRate: { before: "הריבית שרוב הבנקים משלמים:", prefix: "ב־", of: "מתוך", after: "הבנקים שנאספו." },
    todayMoney: { before: "בכסף של היום: מה שהסכום יקנה במחירים של היום. המחירים עולים", after: "בשנה (הנחה של האתר), ולכן סכום שלא גדל קונה פחות עם השנים. הסכומים אחרי מס ועלויות." },
    axisNote: "הציר האנכי לא מתחיל באפס, כדי שההפרש ייראה.",
    picked: {
      pays: { before: "הקו מראה את", mid: ": ריבית", cap: "על יתרה של עד", after: "בהנחה שאתם עומדים בתנאים של הבנק ושהריבית לא משתנה." },
      none: { before: "הקו מראה את", mid: ": ריבית" },
      clear: "חזרה לברירת המחדל",
    },
    fold: {
      title: "חלק מהבנקים כן משלמים ריבית, בתנאים ועל סכום קטן בלבד",
      anchorId: "current-account-banks",
      lead: "כך כל בנק פרסם את הריבית שלו בלוח הריביות לפי הוראה 447 של בנק ישראל. היא לא מגיעה לכל לקוח: כל בנק קובע תנאים.",
      columns: { bank: "בנק", rate: "ריבית בשנה", who: "למי היא מגיעה", max: "הכי הרבה בשנה, אחרי מס" },
      maxNote: { before: "העמודה האחרונה מחושבת ליתרה של", middle: ": הריבית על הסכום שהבנק משלם עליו (עד התקרה שלו), פחות מס של", after: ". זה המקסימום, ורק ללקוח שעומד בכל התנאים." },
      until: "עד",
      doubtTag: "יש ספק",
      silent: {
        title: "לא משלמים ריבית",
        nothing: "כלום",
        sentence: { one: "כתב בפרסום שלו", many: "כתבו בפרסום שלהם", rest: "את המשפט שבנק ישראל דורש מבנק שלא מציע ריבית:", quote: "״לא מוצעת ריבית על יתרת זכות״." },
        printedZero: { mid: "כתב בפרסום ריבית", end: "." },
      },
      picker: { label: "הבנק שלכם", hint: "בחרו בנק כדי לראות בגרף את הקו שלו, בהנחה שאתם עומדים בתנאים שלו. בחירה נוספת באותו בנק מבטלת אותה." },
    },
    worth: {
      many: { mid: "מתוך", after: "הבנקים שנאספו משלמים ריבית על יתרה בעו״ש" },
      one: { mid: "מתוך", after: "הבנקים שנאספו משלם ריבית על יתרה בעו״ש" },
      oneWord: "בנק אחד",
      conditionalCapped: { many: ", כולם בתנאים ועל עד", one: ", בתנאים ועל עד", only: "בלבד" },
      conditional: { many: ", כולם בתנאים", one: ", בתנאים" },
      capped: { many: ", כולם על עד", one: ", על עד", only: "בלבד" },
      best: "הכי הרבה:",
      at: "אצל",
      link: "לטבלה",
    },
    chart: { aria: "גרף: מה קורה ליתרה בעו״ש ובקרן כספית לאורך השנים, בכסף של היום", account: "בעו״ש", fund: "בקרן כספית", baseline: "הסכום שהתחלתם בו", cost: "המחיר של להשאיר" },
    figures: { account: "בעו״ש", fund: "בקרן כספית יומית", cost: "המחיר של להשאיר" },
    about: {
      account: "מה שנשאר בעו״ש בסוף התקופה, אחרי מס, בכסף של היום",
      fund: "מה שנשאר בקרן כספית יומית בסוף התקופה, אחרי עלויות ומס, בכסף של היום",
      cost: "מה שהקרן מוסיפה על העו״ש באותה תקופה, בכסף של היום",
      change: "ההפרש בין מה ששווה היתרה בסוף התקופה לבין הסכום שהתחלתם בו, בכסף של היום",
      maxYear: "הכי הרבה שהבנק משלם בשנה על היתרה, אחרי המס שהוא מנכה, ללקוח שעומד בתנאים",
    },
    inputs: { rate: "הריבית שהבנק מפרסם", common: "הריבית שרוב הבנקים משלמים", ceiling: "התקרה: היתרה שנושאת ריבית", tax: "המס שהבנק מנכה על הריבית" },
    today: "היום",
    after: "אחרי",
  },
  deposit: {
    marker: "מתי תצטרכו את הכסף?",
    unit: "חודשים מהיום",
    amount: "סכום",
    lanes: { deposit: "הפיקדון", fund: "קרן כספית יומית" },
    locked: "נעול",
    noBreak: "אין אפשרות שבירה",
    open: "זמינה בכל יום מסחר",
    bankWords: "במילים של הבנק:",
    chart: { aria: "תרשים: הפיקדון נעול עד סוף התקופה, והקרן הכספית זמינה בכל יום" },
    atMarker: { lead: "אם תצטרכו את הכסף אחרי", month: "חודשים", deposit: "מהפיקדון אפשר לקחת", fund: "מהקרן אפשר לקחת", none: "כלום: הוא נעול" },
    atEnd: { lead: "אחרי", earned: "הרווח של כל אחד:", gapMore: "ההפרש: הקרן מרוויחה יותר", gapLess: "ההפרש: הפיקדון מרוויח יותר" },
    breakOther: "שבירה: לפי תנאי הבנק",
    afterTax: "אחרי מס ועלויות. הקרן לפי ההנחה של האתר.",
    rateLine: { before: "הפיקדון של לאומי משלם", middle: "בשנה, לתקופה של" },
    about: { depositEnd: "מה שנשאר מהפיקדון בסוף התקופה, אחרי מס", depositGain: "הרווח מהפיקדון בסוף התקופה, אחרי מס", fundGain: "הרווח מהקרן באותה תקופה, אחרי עלויות ומס", fundNow: "מה שנשאר מהקרן אם מושכים ביום שבחרתם, אחרי עלויות ומס", gap: "ההפרש בין הרווח בקרן לרווח בפיקדון" },
  },
  plan: {
    monthly: "הפקדה חודשית",
    count: "כמה חודשים מפקידים",
    countOptions: ["6", "12", "24", "36"] as readonly string[],
    marker: "מתי תצטרכו את הכסף?",
    unit: "חודשים מתחילת התוכנית",
    chart: { aria: "תרשים: כל הפקדה חודשית כפס מיום ההפקדה עד היום שהיא נפתחת" },
    legend: { free: "פנויה", locked: "נעולה", notYet: "עוד לא הופקדה" },
    at: { before: "אחרי", after: "חודשים מתחילת התוכנית" },
    figures: { free: "פנוי לקחת", locked: "עדיין נעול", last: "ההפקדה האחרונה נפתחת בחודש" },
    lockLine: { before: "בתוכנית של לאומי התקופה היא", middle: "והריבית", after: "בשנה; אין אפשרות שבירה." },
    alt: { before: "בפיקדון חד־פעמי לתקופה של", rate: "ריבית", middle: "כל הסכום נעול ואז פנוי בבת אחת; בתוכנית ההפקדה האחרונה נפתחת רק בחודש" },
    rangeLine: "הטווח בטבלה של הבנק נקרא כסכום להפקדה אחת; הטבלה לא אומרת זאת במילים.",
    about: { free: "מה שפנוי לקחת ביום שבחרתם: ההפקדות שהתקופה שלהן הסתיימה, אחרי מס", locked: "הכסף שהופקד ועדיין נעול ביום שבחרתם", last: "החודש שבו ההפקדה האחרונה נפתחת" },
  },
  ladder: {
    need: "מתי אתם צריכים את הכסף?",
    speeds: { "any-time": "מיד", "trading-day": "ביום מסחר", "fixed-dates": "במועד קבוע", "at-maturity": "בסוף התקופה" } as Record<string, string>,
    rows: { "current-account": "עו״ש", "money-market-fund-daily": "קרן כספית יומית", "money-market-fund-renewable": "קרן כספית מתחדשת", "bank-deposit": "פיקדון לשנה" } as Record<string, string>,
    wait: { "any-time": "בכל רגע", "trading-day": "הוראת פדיון בכל יום מסחר", "fixed-dates": "רק במועדים שנקבעו מראש", "at-maturity": "בסוף התקופה, בלי שבירה" } as Record<string, string>,
    thisOne: "המוצר בעמוד",
    // 2026-10-25 (G3): the current-account row is the rate most of the collected banks publish, with the best a bank pays beside it
    common: { of: "מתוך", after: "הבנקים שנאספו מפרסמים ריבית כזאת." },
    top: { before: "יש בנקים שמשלמים עד", conditions: "בתנאים ועל עד", only: "בלבד", conditionsNoCeiling: "בתנאי הבנק" },
    term: "תקופה:",
    kinds: { published: "ריבית שפורסמה", assumption: "הנחה של האתר", common: "הריבית שרוב הבנקים משלמים" } as Record<string, string>,
    chart: { aria: "ארבעה מוצרים לפי מהירות החזרת הכסף, וריבית כל אחד" },
    best: { before: "הריבית הגבוהה ביותר שמחזירה את הכסף בזמן:", middle: "בשנה" },
    foot: "ריבית שנתית לפני מס ועלויות.",
    depositFoot: "הפיקדון לשנה לפי הפרסום של לאומי; בנקים אחרים עוד לא נאספו.",
  },
  renewable: {
    marker: "מתי תצטרכו את הכסף?",
    unit: "חודשים מהיום",
    today: "היום",
    chart: { aria: "ציר זמן של שנה: מועד הפדיון של הסדרה ואחריו מועדים שעוד לא ידועים" },
    known: "מועד הפדיון של הסדרה",
    unknown: "מועדים בהמשך: לא ידועים",
    need: "אם תצטרכו את הכסף ב־",
    nextDate: "המועד הקרוב:",
    wait: "ממתינים",
    days: "ימים",
    after: { before: "אחרי", middle: "הסדרה מתחדשת, והמועד הבא", notLater: "לא יאוחר מ־", end: "כי המרווח בין שני מועדים הוא עד", abs: "באישור הרשות" },
    cannot: "אי אפשר למשוך לפני המועד. מי שלא פודה במועד, הכסף ממשיך אוטומטית לתקופה הבאה.",
    gapped: "הסדרה שברשומה כבר נפדתה, והסדרה הבאה עוד לא נאספה.",
    about: { wait: "כמה ימים עד מועד הפדיון של הסדרה", latest: "המועד המאוחר ביותר שיכול להיות למועד שאחרי הסדרה" },
  },
  makam: {
    amount: "סכום",
    sell: "מתי מוכרים?",
    marker: "מוכרים אחרי",
    unit: "חודשים מהקנייה",
    chart: { aria: "גרף: מחיר המק״מ עולה לאורך השנה עד 100 בפדיון", par: "100 בפדיון", buy: "מחיר הקנייה" },
    atRedemption: "בפדיון",
    atSale: "אם מוכרים אחרי",
    figures: { price: "מחיר ל־100", gain: "רווח עד עכשיו", fees: "עמלות", net: "נשאר לכם" },
    feesWhose: "לפי התעריפון של לאומי; אצל בנק או בית השקעות אחר העמלה שונה.",
    taxSale: "מס על רווח הון",
    taxRedeem: "מס על הניכיון",
    yieldLine: { before: "המחיר עולה לפי תשואה של", after: "בשנה. התשואה היא הנחה של האתר, לא ריבית שפורסמה." },
    redeem: "בפדיון המחיר הוא 100, והניכיון ממוסה כריבית.",
    altNoBreak: "לעומת זאת הפיקדון של לאומי משלם",
    altTermPrefix: "ל־",
    noBreak: "אין אפשרות שבירה",
    blocked: "המס על מכירה לפני הפדיון עוד לא מחושב:",
    about: { buy: "מחיר הקנייה ל־100, בתשואה שהאתר מניח", price: "מחיר המכירה ל־100, בתשואה שהאתר מניח", gain: "הרווח עד היום שבחרתם, לפני מס ועמלות", tax: "המס על הרווח", fees: "עמלות הקנייה והמכירה לפי התעריפון של לאומי", net: "מה שנשאר אחרי עמלות ומס" },
  },
  bond: {
    amount: "סכום",
    years: "שנים עד הפדיון",
    shift: "שינוי בריבית בשוק",
    shiftUnit: "נקודות אחוז",
    figures: { price: "מחיר ל־100 אם מוכרים היום", change: "שינוי מ־100", makam: "מק״מ, אותו שינוי בריבית" },
    bars: { sell: "אם מוכרים היום", hold: "אם מחזיקים עד הפדיון: הקרן חוזרת" },
    diffLoss: "ההפרש: מה שהמכירה היום מפסידה",
    diffGain: "ההפרש: מה שהמכירה היום מרוויחה",
    holdLine: { before: "בפדיון מקבלים בחזרה", middle: "ובדרך משולמים קופונים של", after: "בסך הכול. זה מה שהובטח, כל עוד מחזיקים עד הסוף." },
    note: "מחיר האג״ח זז בכיוון ההפוך לריבית, והתנועה גדולה ככל שהפדיון רחוק יותר. המחיר כאן לפני עמלה ומס.",
    linkage: { cpi: "צמודה למדד", unlinked: "לא צמודה" } as Record<string, string>,
    termsLine: { before: "הסדרה", middle: ", וקופון משולם כל" },
    couponLine: { before: "הקופון כאן הוא ההנחה של האתר,", after: "בשנה." },
    about: { price: "המחיר ל־100 אחרי שינוי הריבית: הערך הנוכחי של הקופונים והקרן שנשארו", change: "השינוי במחיר ביחס ל־100", sale: "מה שמקבלים ממכירה היום, לפני עמלה ומס", redeem: "הקרן שחוזרת בפדיון", coupons: "סכום הקופונים עד הפדיון", makam: "השינוי במחיר מק״מ בשנה באותו שינוי ריבית", diff: "ההפרש בין מכירה היום להחזקה עד הפדיון" },
  },
  /** Builder G2 (2026-10-25): the study fund, the provident fund for investing and the pensions. */
  g2: {
    plan: { before: "ההפקדה בדוגמה:", middle: "היום ועוד", after: "בכל חודש.", change: "שינוי הסכומים", hide: "הסתרת השדות", amount: "סכום היום", monthly: "הפקדה חודשית" },
    gaps: {
      bundle: "הנתונים של העמוד הזה עוד לא נטענו.",
      indexTrack: "האתר לא מצא מסלול של הקרן הזו על אותו מדד שמוחזק בחשבון ניירות ערך, ולכן אין השוואה של אותו דבר מול אותו דבר.",
      lump: "החישוב לא הצליח עם הערכים שנבחרו.",
      annuityFactors: "גובה הקצבה החודשית תלוי במקדמי ההמרה של הקרן, והאתר עוד לא אסף אותם (שאלה פתוחה PEN OQ7), ולכן אין כאן קצבה חודשית.",
      pensionTrack: "הפרמטרים של האתר עוד לא קובעים מסלול מייצג לקרן הזו, ולכן אין חישוב של דמי הניהול ושל מה שנצבר.",
    } as Record<string, string>,
  },
  hishtalmut: {
    lead: { before: "הרווחים בקרן השתלמות פטורים ממס רק אם מושכים אחרי", after: "מהתשלום הראשון. כך זה נראה מול אותו מדד בחשבון ניירות ערך, באותה הפקדה:" },
    heldLead: "שני הצדדים מחזיקים את אותו מדד:",
    study: "קרן השתלמות",
    broker: "חשבון ניירות ערך",
    track: "מסלול",
    trackFee: "דמי הניהול שלו:",
    perYearAvg: "בשנה, הממוצע שנגבה בפועל לפי הרשות.",
    fund: "קרן",
    trusteeLead: "שכר נאמן",
    andMgmt: "ודמי ניהול",
    perYear: "בשנה.",
    perYearTariff: "בשנה, ועוד העמלות והקסטודי לפי התעריפון של",
    employmentLabel: "סוג ההעסקה",
    employment: { employee: "שכיר", "self-employed": "עצמאי" } as Record<string, string>,
    income: { employee: "משכורת ברוטו בחודש", "self-employed": "הכנסה חייבת בחודש" } as Record<string, string>,
    incomeSource: "ההכנסה:",
    incomeAnnual: "ההכנסה השנתית של האתר",
    incomeAbout: "ההכנסה החודשית שהחישוב מניח",
    marker: "אחרי כמה שנים מושכים את הכסף?",
    unit: "שנים מהיום",
    chart: { aria: "ציר זמן של שתים־עשרה שנים: בתחילתו הקרן נעולה, ואחרי תום הנעילה אפשר למשוך בפטור", locked: "נעול: משיכה ממוסה", open: "אפשר למשוך בפטור" },
    at: { before: "אם מושכים אחרי", after: ":" },
    barsNote: "הרווח נטו: מה שנשאר אחרי עלויות ומס, פחות מה שהפקדתם.",
    diffMore: "ההפרש: קרן ההשתלמות משאירה יותר",
    diffLess: "ההפרש: קרן ההשתלמות משאירה פחות",
    costsRow: "עלויות",
    taxRow: "מס",
    earlyLine: { before: "משיכה לפני תום הנעילה ממוסה: המס על הרווחים מתחיל בשיעור של", after: "במקום פטור." },
    gaps: {
      selfEmployedEarly: "אין מספר לקרן ההשתלמות בשנים האלה: משיכה מוקדמת של עצמאי ממוסה כהכנסה מעסק, כולל ההפקדות שנוכו (TXH-07), והחישוב הזה עוד לא במנוע של האתר.",
      blocked: "המס על המשיכה הזו נשען על כלל פתוח, ולכן אין כאן מספר.",
    } as Record<string, string>,
    employee: {
      own: { before: "מההפקדה החודשית שלכם רק", middle: "נחשבים", term: "הפקדה מוטבת", after: ", כלומר פטורה: עד", end: "מהמשכורת הקובעת." },
      excess: { before: "על", middle: "בחודש מעבר לזה אין פטור: הרווחים עליהם ממוסים במשיכה, בשיעור של עד", after: "מהרווח הריאלי, כמו בחשבון ניירות ערך." },
      employer: {
        before: "המעסיק יכול להפקיד עד",
        middle: "מהמשכורת הקובעת בלי שזה ייחשב לכם הכנסה. המשכורת הקובעת היא השכר עד",
        max: "בחודש, ולשכר שהזנתם זה עד",
        after: "הכסף של המעסיק לא עומד לבחירה ולכן הוא מחוץ להשוואה: אי אפשר להעביר אותו לחשבון ניירות ערך. השיעור בפועל נקבע בהסכם העבודה.",
      },
    },
    self: { before: "ההפקדה של עצמאי מנוכה מההכנסה החייבת, עד", middle: "ממנה (ההכנסה נספרת עד", saves: " בשנה). בתוכנית הזו הניכוי חוסך", after: "מס לאורך התקופה, וזה כבר כלול במספרים למעלה." },
    rangeLead: "ההפרש תלוי גם במי שבוחרים:",
    rangeBroker: { before: "בית ההשקעות של חשבון ניירות ערך: ההפרש נע בין", to: "לבין", of: "מבין", collected: "בנקים ובתי השקעות שנאספו", here: "כאן לפי מי שמשאיר הכי הרבה,", more: "השוואה מלאה בעמוד השקעה במדד" },
    rangeManager: { before: "המנהל של קרן ההשתלמות: ההפרש נע בין", to: "לבין", fees: "דמי ניהול של", toFee: "עד", across: " בשנה, לפי", tracks: "מסלולים על המדד" },
    lockLine: { before: "הנעילה היא", middle: "מהתשלום הראשון. למי שהגיע לגיל פרישה, או שמושך את הכסף להשתלמות, היא רק" },
    assumption: { before: "התשואה בשתי הדרכים היא", middle: "בשנה והאינפלציה", after: "בשנה: הנחות של האתר, לא תחזית." },
    inputNames: { ret: "התשואה שהאתר מניח", inflation: "האינפלציה שהאתר מניח", trackFee: "דמי הניהול של המסלול", employerPct: "שיעור ההפקדה הפטור של המעסיק", cap: "תקרת המשכורת הקובעת", ownPct: "שיעור ההפקדה המוטבת שלכם" },
    about: {
      study: "הרווח נטו בקרן ההשתלמות בשנה שבחרתם: מה שנשאר אחרי עלויות ומס, פחות מה שהפקדתם, בכסף של היום",
      broker: "הרווח נטו בחשבון ניירות ערך באותה שנה: מה שנשאר אחרי עלויות ומס, פחות מה שהפקדתם, בכסף של היום",
      diff: "ההפרש בין שני הרווחים",
      fees: "עלויות הניהול והעמלות עד השנה שבחרתם, בכסף של היום",
      tax: "המס בעת המשיכה ובדרך, בכסף של היום",
      rangeBroker: "ההפרש בין קרן ההשתלמות לחשבון ניירות ערך אצל בית ההשקעות שמשאיר הכי מעט ואצל זה שמשאיר הכי הרבה, בתוכנית לדוגמה של האתר",
      rangeManager: "ההפרש בין קרן ההשתלמות לחשבון ניירות ערך כשדמי הניהול של המסלול הם הנמוכים והגבוהים ביותר שדווחו על המדד",
      employerMax: "הסכום החודשי הגבוה ביותר שהמעסיק יכול להפקיד בלי שייחשב לכם הכנסה: השיעור הפטור כפול המשכורת הקובעת",
      benefited: "החלק החודשי מההפקדה שנחשב הפקדה מוטבת",
      excess: "החלק החודשי שמעל ההפקדה המוטבת",
      relief: "המס שהניכוי חוסך לאורך התקופה",
    },
  },
  provident: {
    lead: { before: "מקופת גמל להשקעה אפשר לקחת את הכסף בכל עת, כסכום חד־פעמי ממוסה. מגיל", after: "נפתחת גם דרך קצבה, שפטורה ממס. כך זה נראה, מול אותו מדד בחשבון ניירות ערך:" },
    container: "קופת גמל להשקעה",
    marker: "אחרי כמה שנים לוקחים את הכסף?",
    unit: "שנים מהיום",
    ageLabel: "הגיל שלכם היום",
    ageHint: "לא חובה. בלי גיל האתר לא יכול להראות מתי נפתחת הקצבה.",
    ageError: "גיל שלם בין 0 ל־120.",
    chart: {
      aria: "ציר זמן: בתחילתו דרך אחת לצאת מהקופה, ומהגיל שבו נפתחת הקצבה יש שתיים",
      noAge: "בכל גיל אפשר לקחת סכום חד־פעמי. מהגיל שבו נפתחת קצבה יש דרך נוספת; הזינו גיל כדי לראות מתי.",
      one: "דרך אחת: סכום חד־פעמי",
      two: "שתי דרכים: סכום או קצבה",
      legend: { before: "הקצבה נפתחת בגיל", after: "(אפשר לצאת גם לפני כן, כסכום חד־פעמי)." },
    },
    at: { before: "אם לוקחים את הכסף אחרי", age: "בגיל", after: ":" },
    lump: "סכום חד־פעמי",
    lumpBar: "קופת גמל להשקעה, אם לוקחים סכום חד־פעמי",
    left: "נשאר לכם",
    taxLine: "מס",
    taxRate: "שיעור המס על הרווח הריאלי",
    nominalRate: "שיעור המס על הרווח הנומינלי",
    taxNote: { before: "המס הוא עד", term: "הרווח הריאלי", after: ", ומנוכה במקור. אין נעילה ואין קנס יציאה: אפשר לקחת בכל עת." },
    altNote: { before: "אם הבסיס הוא הרווח הנומינלי ובשיעור של", middle: "(שאלה פתוחה), המס יהיה" },
    annuity: "קצבה",
    moves: "עובר לקופת הקצבה",
    pensionTax: "מס על הקצבה",
    exempt: "פטורה",
    closed: { before: "בגיל שבחרתם הדרך הזו עוד סגורה: היא נפתחת מגיל", after: "." },
    needAge: "מגיל הפרישה המוקדמת אפשר להעביר את הכסף לקופת גמל לקצבה ולקבל ממנו קצבה פטורה ממס. הזינו את הגיל שלכם כדי לראות מתי זה נפתח.",
    annuityNote: { before: "קצבה שמגיעה מהכסף הזה נחשבת", term: "קצבה מוכרת", middle: "ופטורה ממס מגיל", after: "ללא תקרה וללא מבחן הכנסות." },
    third: "העברה לקופת גמל להשקעה אחרת אינה משיכה: אין עליה מס, ומועדי ההפקדה נשמרים.",
    versus: "ובחשבון ניירות ערך על אותו מדד, באותה הפקדה:",
    diffMore: "ההפרש: קופת הגמל משאירה יותר",
    diffLess: "ההפרש: קופת הגמל משאירה פחות",
    rangeBroker: { before: "בית ההשקעות של חשבון ניירות ערך: ההפרש נע בין" },
    rangeManager: { before: "המנהל של קופת הגמל: ההפרש נע בין" },
    overCeiling: { before: "ההפקדות בשנה הראשונה גדולות מהתקרה השנתית של", after: "לאדם. מה שמעבר לתקרה לא נכנס לקופה, וגם לא נספר כאן." },
    about: {
      net: "מה שנשאר מהקופה אחרי מס, אם לוקחים הכול כסכום חד־פעמי, בכסף של היום",
      tax: "המס על הסכום החד־פעמי: חלק מהרווח הריאלי, בכסף של היום",
      alt: "המס על אותו סכום אם הבסיס הוא הרווח הנומינלי, בכסף של היום",
      transfer: "היתרה שעוברת לקופת גמל לקצבה, לפני מס, בכסף של היום",
      gain: "הרווח נטו בקופה: מה שנשאר אחרי עלויות ומס, פחות מה שהפקדתם, בכסף של היום",
      brokerGain: "הרווח נטו בחשבון ניירות ערך באותה שנה, בכסף של היום",
      diff: "ההפרש בין שני הרווחים",
      rangeBroker: "ההפרש בין קופת הגמל לחשבון ניירות ערך אצל בית ההשקעות שמשאיר הכי מעט ואצל זה שמשאיר הכי הרבה, בתוכנית לדוגמה של האתר",
      rangeManager: "ההפרש בין קופת הגמל לחשבון ניירות ערך כשדמי הניהול של המסלול הם הנמוכים והגבוהים ביותר שדווחו על המדד",
    },
  },
  pension: {
    lead: "הפקדה לפנסיה של שכיר מורכבת משלושה חלקים: מה שמנוכה לכם מהמשכורת, מה שהמעסיק מוסיף, ופיצויים שהמעסיק שומר לכם בקרן. כך זה נראה במשכורת שבחרתם:",
    yearsSource: "מספר השנים:",
    selfEmployed: "כאן מוצג שכיר שהמעסיק מפקיד לו. עצמאי מפקיד בעצמו, בלי מעסיק, וההטבה שלו היא ניכוי מההכנסה במקום זיכוי. החישוב לעצמאי עוד לא מוצג כאן.",
    salary: "משכורת ברוטו בחודש",
    salaryAnnual: "ההכנסה השנתית של האתר",
    salaryAbout: "המשכורת החודשית שהחישוב מניח",
    salarySource: "המשכורת:",
    insurance: "עלות הביטוח בקרן, באחוז מההפקדה",
    insuranceHint: "אתם מזינים אותה: האתר עוד לא אסף את תעריפי הביטוח.",
    insuranceAbout: "עלות הביטוח באחוז מההפקדה",
    insuranceSource: "עלות הביטוח:",
    insuranceNeeded: "הזינו את העלות כדי לראות",
    monthLead: "כל חודש מופקדים בסך הכול",
    parts: { you: "ממכם", employer: "מהמעסיק, תגמולים", severance: "מהמעסיק, פיצויים" },
    chart: { aria: "פס אחד שמחולק לשלושה חלקים: מה שהעובד מפקיד, מה שהמעסיק מפקיד לתגמולים, ומה שהמעסיק מפקיד לפיצויים" },
    returns: { before: "מהחלק שלכם חוזר אליכם", after: "בחודש כזיכוי מס, שמחושב בדוח השנתי." },
    figures: { net: "בפועל יוצא מהכיס שלכם, אחרי הזיכוי", insurance: "עלות הביטוח בקרן", depositFee: "דמי ניהול מההפקדה", balance: "מה שנצבר בקרן אחרי" },
    balanceGap: { "no-fees": "אין חישוב; הסיבה למטה", "no-run": "החישוב לא הצליח עם הערכים האלה" } as Record<string, string>,
    ratesLine: { before: "ההפקדות הן המינימום לפי צו ההרחבה:", middle: "מכם,", severance: "מהמעסיק לתגמולים, ועוד", wage: "מהמעסיק לפיצויים, על שכר של עד", after: "בחודש (השכר הממוצע במשק). בהסכם העבודה אפשר שיהיה יותר." },
    creditLine: { before: "על ההפקדה שלכם מגיע", term: "זיכוי ממס", middle: "של", after: "מהסכום המזכה, עד תקרה שנגזרת מההכנסה." },
    beneficiary: { before: "אתם נחשבים", term: "עמית מוטב", middle: "ההפקדות שלכם ושל המעסיק יחד עוברות את הסף של", after: "בשנה, ולכן הזיכוי מחושב לפי הכללים שלו." },
    insuranceNote: "בקרן פנסיה חלק מההפקדה משלם ביטוח למקרה מוות או נכות. עלותו תלויה בגיל ובכיסוי, והאתר עוד לא אסף את התעריפים, ולכן אתם מזינים אותה.",
    noInsurance: "בקופת גמל לקצבה אין ביטוח משותף: ההפקדה, אחרי דמי הניהול, נכנסת כולה לחיסכון.",
    feesLine: { before: "דמי הניהול הם הממוצע שנגבה בפועל במסלול", balance: "בשנה מהחיסכון", deposit: "ועוד", ofDeposit: "מההפקדות", after: "בפנסיה הנתון הוא של הקרן כולה ולא של המסלול." },
    none: { before: "קצבת זקנה מקרן פנסיה מתחילה לא לפני גיל" },
    todayMoney: "הסכומים בכסף של היום.",
    inputNames: { avgWage: "השכר הממוצע במשק", employee: "שיעור ההפקדה של העובד", employer: "שיעור ההפקדה של המעסיק לתגמולים", severance: "שיעור ההפקדה של המעסיק לפיצויים", credit: "שיעור הזיכוי", depositFee: "דמי הניהול מההפקדה" },
    about: {
      you: "ההפקדה החודשית של העובד: השיעור המזערי כפול השכר המבוטח",
      employer: "ההפקדה החודשית של המעסיק לתגמולים: השיעור המזערי כפול השכר המבוטח",
      severance: "ההפקדה החודשית של המעסיק לפיצויים: השיעור המזערי כפול השכר המבוטח",
      total: "סך ההפקדות בחודש",
      relief: "הזיכוי ממס על ההפקדה של העובד, מחולק לחודשים",
      net: "ההפקדה של העובד פחות הזיכוי ממס",
      depositFee: "דמי הניהול מההפקדה, באחוז הממוצע שדווח, מסך ההפקדות החודשי",
      insurance: "עלות הביטוח: האחוז שהזנתם מסך ההפקדות החודשי",
      balance: "מה שנצבר בקרן מכל ההפקדות (של העובד ושל המעסיק), אחרי דמי ניהול וביטוח, בכסף של היום ולפני שהקרן הופכת אותו לקצבה",
    },
  },
} as const;

/** The "worth knowing" block on each wrapper guide page (synthesis §3.7). */
export const guideWorth = {
  title: "שווה לדעת",
  line: "עובדות על המוצר הזה שרוב האנשים לא יודעים, כל אחת עם המקור שלה.",
} as const;

/** Search additions (synthesis §3.6): the three new groups, their row lines and the empty states by query type. */
export const searchMore = {
  groups: { rule: "חוקים וכללים", parameter: "פרמטרים", document: "מסמכים" },
  parameterLine: "פרמטר של האתר",
  documentLine: "מסמך",
  figureLine: "מספר מתוך המאגר",
  maybe: "אולי התכוונתם:",
  empty: {
    questionTitle: "אין תשובה על זה בניסוח הזה",
    questionBody: "האתר מחפש בכותרות ובטקסט של החוקים והכללים. נסו מילה או שתיים מהשאלה, או עברו עליהם לפי נושא.",
    questionLink: "לכל החוקים והכללים",
    questionCopy: "העתקת השאלה",
    questionUnder: "אפשר לשלוח אותה למי ששלח לכם את האתר.",
    numberTitle: "אין מספר כזה בחוקים ובכללים, במסלולים ובקרנות",
    numberNear: "קרוב לזה:",
    mainWords: "לחפש רק את המילים העיקריות",
  },
} as const;

/** The home page line under the doors, and the menu and footer entry for the documents page. */
export const knowledgeEntry = {
  homeLine: "כל מספר באתר נפתח למקור שלו.",
  homeLink: "על מה האתר נשען: החוקים, הכללים והמסמכים",
  menuDocuments: "מסמכים",
} as const;

Object.assign(parametersPage.names, { "P-09": "השאלות שכולם שואלים: תשובה של שורה לכל שאלה בעמוד השאלות, והבלוק ״שווה לדעת״ בכל מדריך" });

/**
 * "השקעה במדד" (D28, 2026-10-25; spec research/specs/2026-10-25-invest-page/spec.md). Figures never appear here: a number is a Num on the page.
 * The labels are defined in lib/labels.ts (id, icon, tone, rules); their words are here.
 */
export const invest = {
  nav: "השקעה במדד",
  metaTitle: "השקעה במדד",
  h1: "איפה ואיך הכי זול להשקיע במדד, לאורך זמן",
  sub: "לפי התעריפון של כל בנק ובית השקעות ולפי הדוח של כל קרן",
  loading: "טוען את התעריפונים והקרנות…",
  failed: "האתר לא הצליח לטעון את התעריפונים והקרנות. נסו לרענן את העמוד.",
  noGoal: "הסכום, ההפקדה והשנים הם של האתר לדוגמה; הזינו מטרה כדי לחשב לפי התוכנית שלכם.",
  goalLink: "להזנת מטרה",
  breadcrumbHome: "ראשי",

  chips: {
    heading: "המדד",
    none: "בחרו מדד כדי לראות את הדרכים להחזיק אותו.",
    ownChoice: "הבחירה שלכם; האתר לא ממליץ על מדד",
    other: "אחר",
    remove: (name: string) => `הסרת ${name} מהרשימה`,
    savedTag: "נשמר במכשיר",
    israeliTag: "ישראלי",
    foreignTag: "זר",
  },
  custom: {
    heading: "מדד אחר",
    field: "שם המדד",
    placeholder: "למשל ניקיי 225",
    go: "המשך",
    matched: (name: string) => `האתר מכיר את ״${name}״ ובחר אותו.`,
    question: "החברות במדד ישראליות?",
    questionWhy: "זו השאלה היחידה שמשנה את הדרכים: על מדד ישראלי יש רק קרנות ישראליות שמחזיקות את המניות; על מדד זר יש גם קרנות חוץ.",
    yes: "כן",
    no: "לא",
    forInfo: "לידיעתכם בלבד, לא משנה את החישוב:",
    currency: "מטבע המדד",
    region: "אזור",
    save: "שמירה במכשיר",
    cancel: "ביטול",
    savedNote: "מדד שהוספתם, שמור במכשיר הזה",
    change: "שינוי התשובה",
    nameTaken: "יש כבר מדד בשם הזה.",
    missing: "המדד הזה לא שמור במכשיר הזה. בחרו מדד מהרשימה או הוסיפו אותו שוב.",
  },

  plan: {
    heading: "התוכנית שלכם",
    now: "היום",
    monthly: "בחודש",
    years: "שנים",
    inflation: "אינפלציה",
    ret: "תשואה",
    retExample: "תשואה לדוגמה",
    retEntered: "התשואה שהזנתם",
    fromGoal: "מהמטרה השמורה",
    siteExample: "לדוגמה של האתר",
    change: "שינוי במטרה",
    dollar: "שער הדולר",
    dollarSource: "מחושב משערי הייחוס של הבנק המרכזי האירופי",
    dollarMissing: "אין שער דולר בשערי הייחוס; הדרך בחו״ל לא מחושבת.",
    yourAccount: "החשבון שלכם",
    yourAccountNone: "לא נבחר",
    yourAccountLead: "ב־",
    yourAccountHelp: "אם יש לכם כבר חשבון, האתר יראה כמה עולה להישאר בו.",
    todayShekels: "בכסף של היום",
  },

  header: {
    israeliIndex: "מדד של חברות ישראליות",
    foreignIndex: "מדד של חברות מחוץ לישראל",
    foreignNote: "אפשר להחזיק אותו גם דרך קרן חוץ.",
    israeliNote: "קרנות ישראליות שמחזיקות את המניות; אין קרן חוץ שמתמחה בישראל.",
    forInfo: "לידיעתכם",
    currency: "מטבע",
    region: "אזור",
  },

  headline: {
    title: "הדרך הזולה ביותר לתוכנית שלכם",
    left: "נשאר בסוף, בכסף של היום",
    at: "ב־",
    withFund: "עם",
    yours: (broker: string) => `ב${broker}, עם אותה קרן`,
    yoursLess: "פחות",
    yoursSame: "אותו סכום",
    yoursCannot: (broker: string) => `ב${broker} אי אפשר לחשב את אותה קרן`,
    open: "הדרך הזו נשענת על כלל פתוח, ולכן מוצגת בלי דירוג.",
    noWay: "עוד לא חושבה דרך שלמה: אין קרן שהאתר יכול לחשב בשבילה.",
    noFunds: "בית ההשקעות הזול ביותר לקרן ישראלית על המדד:",
    noFundsCost: "עלות בית ההשקעות לאורך התקופה",
    noFundsWhy: "האתר לא אסף קרנות על המדד הזה, ולכן אין דירוג של דרכים שלמות; בית ההשקעות זול או יקר באותה מידה לכל קרן באותו סוג.",
    onlyOpen: "כל הדרכים שחושבו נשענות על כלל פתוח; הן מוצגות למטה, בלי דירוג.",
  },

  worth: {
    heading: "מה כל בחירה שווה בתוכנית שלכם",
    sub: "ההפרש בין הבחירה הטובה לגרועה, בכסף של היום.",
    bars: {
      broker: "איזה בית השקעות",
      fund: "איזו קרן",
      "etf-tracking": "קרן סל או קרן מחקה",
      abroad: "בארץ או בחו״ל",
    } as Record<string, string>,
    barNote: {
      broker: (option: string) => `בין הזול ליקר, ב${option}`,
      fund: (option: string) => `בין הקרנות ב${option}, אצל הזול`,
      "etf-tracking": "הטובה בכל אחת מהשתיים",
      abroad: "הטובה בארץ מול הטובה בחו״ל",
    },
    upTo: "עד",
    pendingNoRecords: "אין רשומות",
    pendingNotPriced: "בחישוב",
    open: "נשען על כלל פתוח",
  },

  options: {
    heading: "(א) מה האפשרויות",
    sub: "כל אחת היא דרך אחרת להחזיק את אותו מדד. הקישו על אפשרות כדי לראות את הקרנות שלה.",
    titles: { "il-tracking": "קרן מחקה ישראלית", "il-etf": "קרן סל ישראלית", "tase-foreign": "קרן חוץ בת״א", abroad: "בחו״ל" } as Record<string, string>,
    titlesIn: { "il-tracking": "קרן מחקה ישראלית", "il-etf": "קרן סל ישראלית", "tase-foreign": "קרן חוץ בבורסה בתל אביב", abroad: "דרך בחו״ל" } as Record<string, string>,
    funds: (n: number) => (n === 0 ? "אין קרנות שנאספו" : n === 1 ? "קרן אחת שנאספה" : `${n} קרנות שנאספו`),
    bestBroker: "בית ההשקעות הזול",
    bestFund: "הקרן הטובה",
    brokerCost: "עלות בית ההשקעות",
    left: "נשאר",
    noBroker: "אין בית השקעות שאפשר לחשב לו",
    notYet: "עוד לא חושב",
    noRate: "אין שער דולר בשערי הייחוס.",
    noFundsFor: "לא נאספו קרנות על המדד הזה",
    open: "נשען על כלל פתוח",
    on: (exchange: string) => `בבורסה ב${exchange}`,
    selected: "נבחרה",
    exchange: { us: "ארצות הברית", europe: "לונדון" } as Record<string, string>,
  },

  grid: {
    heading: "(ב) איזה בית השקעות הכי זול לכל אפשרות",
    sub: "עלות בית ההשקעות לאורך התקופה, בכסף של היום, לקרן בלי עלויות משלה. הזול בכל עמודה מסומן.",
    broker: "בית השקעות",
    cheapest: "הזול",
    unavailable: "לא זמין",
    noLine: "אין שורה בתעריפון",
    none: "—",
    noCandidate: "אין אפשרות",
    more: (n: number) => (n === 1 ? "עוד בית השקעות אחד" : `עוד ${n} בתי השקעות`),
    less: "פחות בתי השקעות",
    yours: "החשבון שלכם",
    foreignTag: "ברוקר זר",
    sourceOf: "המקור לכך שלא זמין",
    cellReason: "למה אי אפשר לחשב",
    viaExchange: (exchange: string) => `לפי הבורסה ב${exchange}`,
    tableLabel: "עלות כל בית השקעות לכל אפשרות",
    fixedOnly: "אינטראקטיב ברוקרס: מחושבים רק תעריפי ה־Fixed. תעריפי ה־Tiered משאירים בחוץ עמלות בורסה וסליקה שהנתונים לא מכילים, ולכן הדירוג שלהם היה מקטין את העלות.",
    fxPair: "המרה בין שני מטבעות זרים אינה חלה כאן: משקיע בשקלים מחליף שקלים למטבע.",
  },

  funds: {
    heading: "(ג) הקרנות באפשרות שבחרתם",
    pick: "בחרו אפשרות למעלה כדי לראות את הקרנות שלה.",
    rank: "מקום",
    name: "קרן",
    fees: "דמי הניהול שלה",
    fixed: "קבועים",
    variable: "משתנים",
    trustee: "נאמן",
    labels: "תוויות",
    value: (broker: string) => `נשאר ב${broker}`,
    yours: (broker: string) => `ב${broker}`,
    filterAll: "הכול",
    filterUnhedged: "בלי נטרול מט״ח",
    filterHedged: "רק מנוטרלות",
    whatLabels: "מה אומרות התוויות?",
    trackingNote: "הפרש העקיבה של הקרנות עוד לא נאסף, ונלקח כאפס.",
    notCollected: "לא נאסף",
    cannot: "אי אפשר לחשב",
    noMatch: "אין קרן שמתאימה לסינון.",
    currencyMismatch: (fund: string, index: string) => `הקרן נקובה ב${fund} והמדד ב${index}; האתר לא מחשב את ההפרש ביניהם.`,
    mismatchTag: "מטבע שונה ממטבע המדד",
    number: "מספר נייר",
    sameAsBest: "אותו בית השקעות",
    emptyHeading: "עוד לא נאספו קרנות על המדד הזה",
    emptyBody: "בלי רשומת קרן האתר לא מנחש דמי ניהול. אפשר לבחור קרן במאיה לפי דמי הניהול שלה, או לבקש שהאתר יאסוף.",
    maya: "לחיפוש במאיה",
    request: "בקשו שנאסוף",
    requestText: (index: string) => `אבקש שהאתר יאסוף קרנות על המדד ״${index}״.`,
    copied: "הועתק",
    noOption: "לאפשרות הזו אין קרנות שנאספו.",
    israelTitle: "קרנות ישראליות",
  },

  steps: {
    heading: "מה עושים עכשיו",
    openLead: "פותחים חשבון ב",
    stay: (broker: string) => `נשארים ב${broker}`,
    stayDiff: "ההפרש מול הדרך הזולה",
    buy: (fund: string) => `קונים את ${fund} לפי מספר הנייר`,
    buyNumber: "מספר נייר",
    copy: "העתקה",
    copied: "הועתק",
    buyCustom: "בוחרים קרן במאיה לפי דמי הניהול",
    standing: "מגדירים הוראת קבע של הסכום החודשי",
    standingWith: "הסכום החודשי",
    switchLink: "איך עוברים בית השקעות",
    noWay: "כשתהיה דרך שלמה, כאן יופיעו שלושת השלבים.",
  },

  foot: {
    returnUsed: "התשואה שבחישוב",
    example: "תשואה לדוגמה, לא תחזית: הסדר של הדרכים לפי עלויות, לא לפי מה שהמדד יעשה.",
    entered: "התשואה שהזנתם",
    holds: "הסדר נשמר בכל תשואה בין 0% ל־10%.",
    flips: "הסדר משתנה בתשואה שונה:",
    flipsAt: (at: number) => `ב־${at}%`,
    /** 2026-10-25 (lead): the order check in one line; the places it changes are behind the toggle */
    flipsSummary: (n: number) => `בתשואה של 0% או של 10% הסדר משתנה ב־${n} ${n === 1 ? "מקום" : "מקומות"}. פירוט`,
    flipWhat: { options: "הסדר בין האפשרויות", brokers: (o: string) => `הסדר בין בתי ההשקעות ב${o}`, funds: (o: string) => `הסדר בין הקרנות ב${o}` },
    engine: "המספרים מהמנוע, על הנתונים של היום.",
    values: "הערכים הם בכסף של היום.",
    ibkr: "אינטראקטיב ברוקרס: מחושבים רק תעריפי ה־Fixed; תעריפי ה־Tiered משאירים בחוץ עמלות בורסה וסליקה שהנתונים לא מכילים.",
    sharePrice: "קרנות בחו״ל שהתעריפון שלהן נקבע לפי מספר המניות מחכות למחיר היחידה של הקרן, שעוד לא נאסף.",
    d27: "האתר לא ממליץ על מדד.",
  },

  reasons: {
    fundType: "הקרן הזו עוד לא מחושבת באתר (סוג או מס שאין להם חישוב).",
    needYield: "הקרן מחלקת, וצריך את תשואת החלוקה שלה כדי לחשב.",
    needRate: (ccy: string) => `אין שער ל${ccy} בשערי הייחוס.`,
    noBroker: "אין בית השקעות שאפשר לחשב לו את הקרן הזו.",
  },

  /** The word for an option inside a sentence ("ב…"). */
  optionIn: { "il-tracking": "קרן מחקה ישראלית", "il-etf": "קרן סל ישראלית", "tase-foreign": "קרן חוץ בבורסה בתל אביב", abroad: "דרך בחו״ל" } as Record<string, string>,

  currencies: { USD: "דולר", EUR: "אירו", GBP: "פאונד", JPY: "ין", CHF: "פרנק שוויצרי", CAD: "דולר קנדי", AUD: "דולר אוסטרלי", CNY: "יואן", HKD: "דולר הונג קונג", NIS: "שקל", ILS: "שקל" } as Record<string, string>,

  labelFamilies: { held: "איפה הקרן מוחזקת", trade: "איך היא נסחרת", follow: "איך היא עוקבת אחרי המדד", currency: "מטבע", tax: "מס", asks: "מה היא דורשת מכם, וסיכון", availability: "זמינות" },
  labelsSheet: { rules: "מקורות", close: "סגירה", forPlan: "" },
  labels: {
    "held-il": { text: "קרן ישראלית", explain: "הקרן רשומה בישראל ומפוקחת כאן. על מדד זר היא מקבלת את החשיפה בעסקאות, ועל מדד ישראלי היא מחזיקה את המניות." },
    "held-tase-foreign": { text: "קרן חוץ בת״א", explain: "קרן מחוץ לישראל שנסחרת גם בבורסה בתל אביב, בשקלים. קרן חוץ לא מתמחה בישראל, ולכן היא רק על מדדים זרים." },
    "held-abroad": { text: "נקנית בחו״ל", explain: "הקרן נקנית בבורסה בחו״ל, דרך בנק או בית השקעות שמוכרים ניירות ערך זרים. הרשות לניירות ערך לא מפקחת עליה." },
    "trade-etf": { text: "קרן סל: נסחרת כל היום", explain: "קרן סל נסחרת בבורסה כל יום המסחר, במחיר שמשתנה במהלך היום." },
    "trade-tracking": { text: "קרן מחקה: פעם ביום", explain: "קרן מחקה נקנית ונפדית במחיר היחידה אחת ביום, דרך הבנק או בית ההשקעות, לא בבורסה." },
    "follow-physical": { text: "מחזיקה את המניות", explain: "הקרן קונה את המניות שבמדד עצמן. כך עוקבות בדרך כלל קרנות על מדדים מקומיים." },
    "follow-swap": { text: "עסקת החלף", explain: "הקרן מקבלת את תשואת המדד מבנק בעסקת החלף. כך עוקבות בדרך כלל קרנות ישראליות על מדדים זרים, ויש בכך סיכון לבנק שמול הקרן." },
    "follow-futures": { text: "חוזים עתידיים", explain: "הקרן יוצרת את החשיפה למדד בחוזים עתידיים הנסחרים בבורסה." },
    "follow-mixed": { text: "כמה דרכים יחד", explain: "הקרן משלבת כמה דרכים לעקוב אחרי המדד, למשל עסקאות החלף וחוזים עתידיים, ולפעמים גם קרנות אחרות." },
    currency: { text: (ccy: string) => `חשיפה ל${ccy}`, explain: (ccy: string) => `ערך הקרן עולה ויורד גם עם שער ה${ccy} מול השקל, כי המדד מחושב בו.` },
    hedged: { text: "מנוטרלת מט״ח", explain: "הקרן מנטרלת את השפעת שער המטבע, ולכן שינוי בשער לא משנה את ערכה. הנטרול עולה כסף, שנכלל בדמי הקרן או בעקיבה." },
    "tax-currency": { text: "מס גם על שינויי המטבע", explain: "בקרן ישראלית המס נמדד על הרווח הריאלי ביחידות השקליות, ולכן גם עליית המטבע שבתוך הרווח ממוסה." },
    "tax-fund-dividend": { text: "מס דיבידנד בתוך הקרן", explain: "קרן אירית משלמת מס אמריקני על דיבידנדים מחברות אמריקניות. המס הזה הוא עלות של הקרן ואינו מזוכה בישראל." },
    "tax-distribution": { text: "מס על כל חלוקה", explain: "קרן שמחלקת משלמת לכם דיבידנד, וממנו משלמים מס בכל חלוקה, לפני המכירה." },
    "tax-on-sale-open": { text: "מס רק במכירה", explain: "לא נמצא כלל שממסה יחיד על רווחים שקרן זרה צברה ולא חילקה, ורשות המסים לא אישרה זאת. זו שאלה פתוחה, ולכן הדרך מוצגת בלי דירוג." },
    "ask-self-report": { text: "דיווח עצמי למס", explain: "כשאין ניכוי מס במקור במכירה, מדווחים על הרווח ומשלמים מקדמה פעמיים בשנה, ומגישים דוח שנתי." },
    "ask-estate": { text: "מס עיזבון אמריקאי", explain: "מי שאינו אמריקאי ומחזיק נכסים אמריקניים מעל סף הנקוב בדולרים עלול להיות חייב בדוח מס ירושה אמריקני. קרן שמאוגדת בארצות הברית היא נכס אמריקני." },
    "risk-unsupervised": { text: "לא בפיקוח רשות ני״ע", explain: "בית ההשקעות פועל בישראל בהיתר, והרשות לניירות ערך לא מפקחת עליו. חשבונות הלקוחות נפתחים אצל גוף זר." },
    "ask-w8": { text: "צריך טופס W-8BEN", explain: "לקרן אמריקנית צריך למסור לבית ההשקעות טופס W-8BEN. בלי הטופס הניכוי האמריקני עלול להיות גבוה יותר." },
    unavailable: { text: "לא זמין בבית ההשקעות הזה", explain: "לפי מה שבית ההשקעות מפרסם, הוא לא מוכר את הסוג הזה ללקוחות פרטיים." },
  },
} as const;

/** The kit's own words (components/kit): names that assistive technology reads, and the gallery at /kit (a page for builders, not in the menu or the search). */
export const kit = {
  legend: "מקרא",
  gallery: {
    title: "ספריית הרכיבים",
    lede: "כל רכיב משותף של האתר, בכל מצבים שלו. לבניית דפים: רכיב חדש נכנס לכאן קודם.",
    banner: "המספרים בעמוד הזה הם דוגמאות לעיצוב בלבד. אף אחד מהם איננו נתון של האתר.",
    sampleSource: "דוגמה לעיצוב בלבד",
    sampleAbout: "מספר לדוגמה",
    use: "מתי משתמשים",
    states: {
      empty: "ריק",
      filled: "מלא (ערך התחלתי)",
      entered: "הוזן",
      sourced: "ממקור",
      computed: "מחושב",
      stale: "לא עודכן",
      error: "שגיאה",
      disabled: "לא זמין",
      open: "פתוח",
      closed: "סגור",
      nested: "פנימי בתוך פתוח",
      long: "ארוך",
      interactive: "לחיצה וגרירה",
      withIcon: "עם אייקון",
    },
    uses: {
      Button: "Button לפעולה, LinkButton למעבר לעמוד. כפתור primary אחד בכל מסך.",
      Tag: "תווית קצרה עם גוון: מצב, סוג, דגל. הגוון לא עובד לבד: מוסיפים מילה או אייקון.",
      Callout: "הערה בקופסה מתחת לתוצאה: caution (לא עודכן, מקור חלש), blocked (שאלה פתוחה), info.",
      Card: "המשטח המורם היחיד. את הריפוד בוחרים ב־pad, את הפנים ב־className.",
      Section: "כותרת עם פתיחה ופעולה בקצה השורה, ואחריה הגוף. level: page, card או form.",
      Disclosure: "כל מה שהקורא יכול לפתוח: טבלה, הערה ארוכה, קבוצה ברשימה. התווית והחץ עוקבים אחרי מצב הקופסה עצמה, גם בתוך קופסה פתוחה אחרת.",
      FoldGroup: "כותרת קבוצה עם הספירה שלה, בתוך רשימת כיסוי. כותרת ברמה 3 או 4.",
      CoverageFold: "הכרטיס שמונה כל אפשרות פעם אחת: משפט של ספירות, שורת הצגה והסתרה, והרשימה מתחת לקו.",
      SegmentedControl: "שתיים עד ארבע אפשרויות קצרות ושוות, אחת תמיד נבחרת.",
      ChoiceChips: "ארבע אפשרויות ומעלה או תוויות ארוכות, אחת נבחרת. עם wrap יורד שורה, בלעדיו גולל הצידה בטלפון.",
      Sentence: "טקסט שיש בו מספרים או קישורים. רצוף בלבד: אין לו מאפיין פריסה, ולכן מספר לא יכול ליפול לשורה משלו. הקטעים כילדים, או מחרוזת עם מקומות {name}.",
      Stat: "מספר עם שמו מעליו והערה מתחתיו; שניים עד ארבעה זה לצד זה. tone מוסיף את הצבע של העמודה או הקו שהוא נקרא על שמם.",
      KeyValue: "KeyValue: שם בתחילת השורה וערכו בסופה, בתוך dl. KeyValueList: עובדות ככרטיסים (רשימה בטלפון, רשת 2 על 2 מ־lg).",
      HeadlineFigure: "התשובה של כרטיס: המספר הגדול המחושב, תווית המצב ושורה שאומרת מה הוא.",
      RankBadge: "המקום (או מספר השלב) של שורה; המקום הראשון מלא.",
      SourceLine: "SourceLine: מאיפה בא ערך ההתחלה, מתחת לבקרים. GapNote: חלק שהאתר עוד לא חישב, עם הסיבה.",
      NumberField: "תיבה למספר אחד שמקלידים: יחידה, רמז, שגיאה, שורת המצב. נשמר אחרי הפסקה של 150 מילישניות או ביציאה מהתיבה.",
      RangeField: "מספר ומחוון שלו יחד: לכמות עם טווח טבעי.",
      PercentField: "שדה מספר לאחוז: שיעור שנתי אלא אם unit אומר אחרת, ומשפט הטווח הרגיל (0 עד 100, או הטווח שניתן).",
      Marker: "סמן שנגררים אותו על ציר של תרשים: לחיצה בכל מקום בשטח מזיזה אותו, וגם מקשי החצים. Marker הוא המחוון הבלתי נראה; MarkerMark הוא מה שהתרשים מצייר.",
      GainBars: "שני סכומים כעמודות מאותה נקודת התחלה, וההפרש כסוגר עם מספר משלו (אף פעם לא עמודה שלישית).",
      ChartLegend: "שלושת החלקים סביב כל תרשים: מה כל סימן אומר, הערכים בשנה שמצביעים עליה, ואותם מספרים כטבלה.",
    },
    sample: {
      title: "כותרת לדוגמה",
      lead: "שורת פתיחה קצרה שמסבירה מה יש בקבוצה.",
      body: "גוף הקבוצה: טקסט, רשימה או טבלה.",
      foldLabel: "הצגת הפרטים",
      foldHide: "הסתרת הפרטים",
      outer: "קופסה חיצונית",
      inner: "קופסה פנימית, סגורה",
      hello: "שלום",
      sentenceBefore: "אחרי",
      sentenceMid: "שנים הסכום יהיה",
      sentenceAfter: "ויישאר ככה, ראו",
      sentenceLink: "הסבר",
      option: ["א", "ב", "ג"],
      chip: ["אפשרות ראשונה", "אפשרות שנייה", "אפשרות שלישית", "אפשרות רביעית"],
      field: "סכום לדוגמה",
      range: "שנים",
      percent: "אחוז לדוגמה",
      hint: "רמז קצר מתחת לשדה.",
      error: "הזינו מספר תקין.",
      seriesA: "מסלול א",
      seriesB: "מסלול ב",
      seriesC: "קו מנוקד: על תשואה שהוזנה",
      fee: "דמי ניהול",
      yearWord: "שנה",
      today: "היום",
      markerName: "סמן על ציר השנים",
      barA: "אפשרות א",
      barB: "אפשרות ב",
      diff: "ההפרש",
      reason: "אין עדיין נתון על הדמים המלאים של החשבון.",
      sourceLead: "מקור ההתחלה:",
      sourceItems: ["מה שהזנתם", "המטרה השמורה"],
      cover: "נבדקו חמש אפשרויות: שתיים דורגו, שלוש לא.",
      coverOpen: "הצגת הרשימה",
      coverClose: "הסתרת הרשימה",
      group: "לא דורגו",
      rowA: "אפשרות ראשונה",
      rowB: "אפשרות שנייה",
      statLabels: ["אחרי הדמים", "בלי דמים", "העלות"],
      note: "הערה קצרה מתחת למספר",
      kv: ["דמי ניהול מצבירה", "דמי ניהול מהפקדה", "תקופת התחייבות"],
      cards: [
        { id: "a", label: "תקרת הפקדה", line: "השורה שמתחת לערך.", lead: "שורת רקע קטנה." },
        { id: "b", label: "פטור ממס", line: "עוד שורה." },
      ],
      headCaption: "אחרי ניכוי דמים, במונחי היום",
    },
  },
} as const;
