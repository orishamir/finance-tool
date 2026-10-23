// Every Hebrew string the release 1 screens show, from docs/copy.md (in force 2026-10-23). Strings that
// copy.md does not hold yet are marked NEW below and listed in the build report for the founder.
// Figures never appear here: a `{…}` place in copy.md is filled by a Num on the page.

export const site = {
  name: "מקור",
  tagline: "להבין חיסכון והשקעה בישראל, עם מקור לכל מספר.",
  search: "חיפוש",
  searchPlaceholder: "הדביקו שם של מוצר, מסלול או מונח",
  menu: "תפריט",
  close: "סגירה",
  back: "חזרה", // NEW: screen-reader name of the back arrow inside a sheet (design-spec 3)
  currentPage: "העמוד הנוכחי",
  menuItems: [
    { href: "/guide", label: "מדריך", current: "guide" },
    { href: "/companies", label: "חברות ומסלולים", current: "decoder" },
    { href: "/rules", label: "כללים", current: "rules" },
    { href: "/parameters", label: "פרמטרים", current: "parameters" },
  ] as const,
  notCovered: { href: "/not-covered", label: "מה האתר עוד לא מכסה" },
  footer: [
    { href: "/rules", label: "כללים" },
    { href: "/parameters", label: "פרמטרים" },
    { href: "/not-covered", label: "מה האתר עוד לא מכסה" },
  ],
} as const;

export const numbers = {
  legend: { sourced: "ממקור", computed: "מחושב", entered: "הוזן על ידך" },
  legendHintPhone: "הקישו על מספר כדי לראות מאיפה הוא.",
  legendHintPc: "לחצו על מספר כדי לראות מאיפה הוא.",
  details: "פרטים",
  unknown: "לא ידוע",
  parameter: "פרמטר של האתר",
  provisional: "ערך זמני שהאתר קבע",
  staleSince: "לא עודכן מאז",
  weak: { secondary: "משני", institution: "מוסדי" },
  yes: "כן", // NEW: a boolean value object
  no: "לא", // NEW
} as const;

export const strength = {
  primary: { label: "מקור ראשי", line: "הנתון נלקח מנוסח החוק, מהתקנות או מהגוף שמפרסם אותו." },
  "primary-mirror": { label: "מקור ראשי (עותק)", line: "נוסח החוק נקרא באתר שמעתיק אותו, ועוד לא באתר הרשמי." },
  institution: { label: "מקור מוסדי", line: "הנתון נלקח ממסמך של בנק או של חברה מנהלת, לא מהחוק או מהרשות." },
  secondary: { label: "מקור משני", line: "הנתון נלקח מכתבה או מאתר מידע, לא מהמקור עצמו." },
  open: { label: "שאלה פתוחה", line: "עוד לא מצאנו מקור שעונה על זה, ולכן האתר לא מחשב את זה." },
  entered: { label: "הוזן על ידך", line: "הזנתם את הערך הזה." },
} as const;

export const buttons = {
  resetOne: "חזרה לערך ההתחלתי",
  resetAll: "חזרה לכל הערכים ההתחלתיים",
  showTable: "הצגה כטבלה",
  hideTable: "הסתרת הטבלה",
  openSource: "פתיחת המקור",
  allRules: "לכל הכללים",
  copy: "העתקה",
  copied: "הועתק",
} as const;

export const home = {
  searchLabel: "מה ראיתם באפליקציה, בפרסומת או בדוח?",
  door1: { title: "להבין סוג של חיסכון", line: "מה זה, כמה זה עולה ואיך זה ממוסה", href: "/guide" },
  door2: { title: "מה חברה מציעה לי", line: "כל המוצרים והמסלולים שלה, עם הסבר לכל אחד", href: "/companies" },
} as const;

export const search = {
  label: "חיפוש",
  hint: "אפשר להדביק את השם בדיוק כמו שהוא מופיע באפליקציה, בפרסומת או בדוח.",
  tooShort: "הקלידו לפחות שתי אותיות.",
  groups: { product: "מוצרים", track: "מסלולים וקופות", term: "מונחים", guide: "עמודי מדריך" },
  termLine: "מונח · מוסבר בעמוד",
  more: "הצגת כל התוצאות בקבוצה",
  clear: "ניקוי",
  empty: {
    title: "עוד לא קוטלג",
    bodyBefore: "את השם “",
    bodyAfter: "” עוד אין באתר. שמרנו אותו במכשיר שלכם כדי שיהיה אפשר להוסיף אותו.",
    underButton: "העתיקו את השם ושלחו אותו למי ששלח לכם את האתר, כדי שיתווסף.",
    copyFailed: "לא הצלחנו להעתיק. סמנו את השם והעתיקו אותו ידנית.",
    links: { companies: "לרשימת החברות", shorter: "לחפש רק חלק מהשם" },
  },
} as const;

export const guideIndex = {
  title: "מדריך",
  lede: "כל סוג של חיסכון והשקעה שהאתר מכסה. לכל אחד אותו מבנה, כדי שיהיה קל להשוות.",
  group1: { title: "איפה הכסף מוחזק", line: "המוצר עצמו: חשבון בבנק, קופה או חשבון השקעות" },
  group2: { title: "במה הכסף מושקע", line: "מה שבתוך המוצר: מזומן, אג״ח, מניות דרך מדד" },
  last: { title: "מה האתר עוד לא מכסה", line: "מוצרים שאנחנו מכירים אבל עוד לא מסבירים עד הסוף" },
} as const;

export const guide = {
  indexTitle: "בעמוד הזה",
  sections: [
    { id: "what", title: "מה זה" },
    { id: "who", title: "מי מציע ומי מפקח" },
    { id: "inout", title: "כסף נכנס ויוצא" },
    { id: "cost", title: "כמה זה עולה" },
    { id: "tax", title: "מיסוי" },
    { id: "risk", title: "סיכונים ומה לא מוגן" },
    { id: "use", title: "למה משתמשים בזה" },
    { id: "check", title: "מה לבדוק" },
    { id: "terms", title: "מונחים" },
  ] as const,
  graphTitle: "מה קורה לכסף לאורך הזמן",
  headline: { before: "נשאר לכם אחרי", after: "אחרי דמי ניהול ומס, בכסף של היום", afterNominal: "אחרי דמי ניהול ומס, בשקלים של העתיד" }, // afterNominal NEW: the headline when the switch is on future shekels
  modes: { real: "בכסף של היום", nominal: "בשקלים של העתיד" },
  modeLabel: "מטבע ההצגה", // NEW: screen-reader name of the switch group
  legend: { net: "נשאר לכם", tax: "מס", fees: "דמי ניהול", contributions: "ההפקדות שלכם" },
  chips: { amount_now: "סכום היום", monthly_deposit: "הפקדה חודשית", horizon_years: "שנים", "A-01": "תשואה בשנה", "A-02": "אינפלציה בשנה", all: "כל ההנחות" },
  readout: { today: "היום", year: "שנה" },
  table: { year: "שנה", contributions: "ההפקדות שלכם", fees: "דמי ניהול", tax: "מס", net: "נשאר לכם" },
  graphAria: { before: "גרף: הכסף לאורך", after: "הנתונים המלאים בטבלה." },
  rulesLine: "כללים:",
  markers: { free: "אפשר למשוך מכאן", age: "גיל" },
  enteredReturnCaption: "הקו המקווקו מבוסס על תשואה שהזנתם, לא על הערכה של האתר.",
  blockedBand: "לא מחושב: שאלה פתוחה",
  figureNotUpdated: { before: "הנתון לא עודכן:", middle: "היה בתוקף עד", after: "עד שנעדכן אותו, האתר לא מחשב את הגרף.", link: "לכלל" },
  appliesToYou: "לפי מה שהזנתם",
  employeesOnly: "לשכירים בלבד",
  selfEmployedOnly: "לעצמאים בלבד",
  whoLine: "לכל חברה יש עמוד עם כל המסלולים שלה.",
  allCompanies: "כל החברות",
  feeTable: { type: "סוג", base: "על מה נגבה", cap: "תקרה", rules: "כללים" },
  feeNote: "אלה התקרות שבחוק. כמה כל חברה גובה בפועל, בכל מסלול, מופיע בעמוד של החברה.",
  taxSteps: { deposit: "בהפקדה", during: "כל עוד הכסף בפנים", exit: "כשמושכים" },
  related: "גם כדאי להכיר:",
  checklist: { blocked: "חסום:", considered: "נלקח בחשבון", notRelevant: "לא רלוונטי", blockedMark: "חסום: שאלה פתוחה", expand: "מאיפה זה", blockedLast: "עד שהשאלה תיסגר, האתר לא מחשב את זה." },
  termsLine: "איך קוראים לזה בדוח, באפליקציה ובחוק.",
  where: { statement: "דוח שנתי", "bank-statement": "דף חשבון", payslip: "תלוש שכר", app: "אפליקציה", ad: "פרסומת", law: "חוק", form: "טופס", bylaws: "תקנון", "gemel-net": "גמל נט" } as Record<string, string>, // form, bylaws, gemel-net NEW
  termTable: { term: "מונח", meaning: "מה זה", where: "איפה מופיע" }, // NEW: PC table headings (from the approved mockup)
  pcChooseHint: "בחרו מסלול כדי לראות את כל הפרטים ומה לבדוק", // from the approved company mockup
  sliderAria: "מחוון", // NEW
} as const;

export const values = {
  title: "ההנחות של הגרף",
  fields: { amount_now: "סכום היום", monthly_deposit: "הפקדה חודשית", horizon_years: "כמה שנים", "A-01": "תשואה בשנה", "A-02": "אינפלציה בשנה", age: "גיל", employment: "סוג העסקה" },
  optional: "(לא חובה)",
  employment: { employee: "שכירים", "self-employed": "עצמאים" },
  units: { nis: "₪", pct: "%", years: "שנים" },
  stateStart: "ערך התחלתי, פרמטר של האתר",
  stateEntered: "הוזן על ידך",
  hints: { return: "התשואה ההתחלתית היא דוגמה, לא תחזית.", inflation: "בכמה המחירים עולים בשנה, בממוצע.", age: "מסמן בגרף גילים שבהם הכללים משתנים.", employment: "מסמן בעמוד את החלקים שנוגעים לכם." },
  returnNote: "תשואה שתזינו תסומן בגרף בקו מקווקו, כי היא שלכם ולא של האתר.",
  agePlaceholder: "למשל 30", // from the approved mockup
  errors: { nan: "הזינו מספר.", negative: "הסכום לא יכול להיות שלילי.", years: ["הזינו מספר שנים בין", "ל־"], age: ["הזינו גיל בין", "ל־"], pct: ["הזינו אחוז בין", "ל־"] },
  loading: "טוען…",
} as const;

export const provenance = {
  sourced: { source: "מקור", publisher: "פורסם על ידי", checked: "נבדק ב־", from: "בתוקף מ־", to: "בתוקף עד", rule: "כלל" },
  computed: { formula: "נוסחה", inputs: "ערכים שנכנסו לחישוב", rules: "כללים שנכנסו לחישוב" },
  entered: { line: "הזנתם את הערך הזה.", instead: "במקום:" },
  parameter: { why: "למה הערך הזה", approved: "אושר ב־" },
  stale: { before: "לא עודכן מאז", middle: "בדרך כלל מתעדכן", cadence: { daily: "כל יום", monthly: "כל חודש", quarterly: "כל רבעון", yearly: "כל שנה" } }, // yearly NEW
  allRulesOf: "לכל הכללים של",
  unit: { nis_per_month: "בחודש", pct_per_year: "בשנה" }, // NEW: unit words beside a figure in the sheet
} as const;

export const rule = {
  title: "כלל",
  conditions: "תנאים וחריגים",
  figures: "סכומים לפי שנת מס",
  source: "מקור",
  checked: "נבדק ב־",
  recheck: "ייבדק שוב ב־",
  all: "לכל הכללים",
  open: { title: "שאלה פתוחה:", unknown: "מה עוד לא ידוע", waiting: "מה מחכה לתשובה", last: "בינתיים האתר לא מחשב את זה." },
  dimensions: "נוגע ל", // NEW: the dimension tags on a rule card
  noText: "נוסח הכלל במילים פשוטות עוד לא נכתב; הכותרת מופיעה כפי שהיא בבסיס הכללים.", // NEW: data gap (data-inventory 3.4)
} as const;

export const rulesPage = {
  title: "כללים",
  lede: "כל כלל שהאתר משתמש בו, עם המקור שלו. כלל שהמקור שלו חלש יותר מסומן, ושאלה פתוחה מסומנת במנעול.",
  openQuestions: "שאלות פתוחות בנושא הזה",
  // NEW: Hebrew names of the rule-base topics, from the il-finance index
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
    "provident-family-common.md": "כללים משותפים לקופות הגמל",
    "regulators-and-protection.md": "מי מפקח ומה מוגן",
    "tracks-catalogue-and-decoder.md": "מסלולים והקטלוג",
  } as Record<string, string>,
} as const;

export const parametersPage = {
  title: "פרמטרים של האתר",
  lede: "החלטות שהאתר מקבל בעצמו, כמו מתי שתי אפשרויות נחשבות שקולות. הן לא כללים מהחוק, ואי אפשר לשנות אותן מהעמוד.",
  rows: { why: "למה", approved: "אושר ב־", usedIn: "משמש ב:" },
  provisional: "ערך זמני שהאתר קבע",
  notSet: "עוד לא נקבע",
  // NEW: Hebrew names of the parameters (method.md §2.3 names them in English)
  names: {
    "P-01": "סף תיקו",
    "P-02": "גבולות בדיקת הרגישות",
    "P-03": "ספי ההכרעה על דמי ניהול",
    "P-04": "התאמת סיווג מסלול לטווח",
    "P-05": "התרחיש לדוגמה בעמודי המדריך",
    "P-06": "סטייה מותרת בבדיקות",
  } as Record<string, string>,
} as const;

export const companies = {
  title: "מה חברה מציעה לי",
  lede: "בחרו חברה כדי לראות את כל המוצרים והמסלולים שלה, ומה כל אחד מהם.",
  filter: "חיפוש חברה",
  noMatch: "לא מצאנו חברה בשם הזה.",
  searchAll: "לחיפוש בכל האתר",
  back: "חברות ומסלולים",
} as const;

export const company = {
  lineBefore: "כל מה שהחברה מציעה, עם הסבר לכל מסלול. המסלולים לפי נתוני רשות שוק ההון, ביטוח וחיסכון, נכון ל",
  feesPending: "דמי הניהול של כל מסלול יופיעו כאן אחרי שנוודא מה בדיוק מודד כל שדה בנתוני הרשות.",
  listHeading: "כל המסלולים של",
  tracks: { one: "מסלול אחד", two: "שני מסלולים", many: "מסלולים" },
  trackLine: { fund: "קופה", classification: "סיווג:" },
  sameName: { distinct: "שני מסלולים באותו שם: שתי קופות נפרדות", twice: "אותו מסלול מופיע פעמיים", unresolved: "לא הוכרע: הנתונים לא מראים אם זו אותה קופה" },
  oldData: "נתוני הרשות לא עודכנו מאז",
  paste: { title: "לא מצאתם שם?", label: "הדביקו את השם כמו שהוא מופיע באפליקציה, בפרסומת או בדוח.", placeholder: "למשל: גמל להשקעה כללי" },
  whatIs: "מה זה", // "מה זה קופת גמל להשקעה" link under a group, from the approved mockup
  productType: "סוג המוצר", // PC side card, from the approved mockup
  toGuide: "לעמוד המדריך על",
  pcColumns: { name: "שם המסלול, כמו שהחברה כותבת אותו", fund: "קופה", classification: "סיווג", holds: "במה הכסף מושקע", open: "פתיחה", group: "קבוצה" }, // from the approved mockup
  notInData: "לא נמצא בנתוני הרשות",
  default: "ברירת המחדל",
  subSpecialization: "התמחות:", // NEW: the regulator's sub-specialization field, shown as written until a plain-Hebrew exposure line is sourced
} as const;

export const track = {
  fundLine: "קופה",
  labels: { manager: "חברה מנהלת", product: "סוג מוצר", classification: "סיווג", holds: "במה הכסף מושקע", feeBalance: "דמי ניהול מחיסכון", feeDeposit: "דמי ניהול מהפקדה", period: "נכון לחודש", population: "למי מיועד", inception: "נפתח ב־" }, // population, inception NEW: two CMA fields the record holds
  feePending: "עוד לא מוצג",
  sameNameElsewhere: "יש מסלול נוסף באותו שם.",
  toOther: "למסלול השני",
  toGuide: "לעמוד המדריך על",
} as const;

export const notCovered = {
  title: "מה האתר עוד לא מכסה",
  lede: "מוצרים שאנחנו מכירים אבל עוד לא יכולים להסביר עד הסוף, ולמה.",
  rows: { known: "מה ידוע", open: "מה עוד פתוח", why: "למה זה חשוב" },
  empty: "כרגע האתר מכסה את כל המוצרים שהוא מכיר.",
  openLine: "הכללים לזה עוד בבדיקה; עד שייסגרו, האתר לא מחשב עליו כלום.", // NEW: shown where no open-question text exists in Hebrew yet
  alsoCalled: "נקרא גם", // NEW
} as const;

export const system = {
  calcFailed: "לא הצלחנו לחשב את הגרף. רעננו את העמוד ונסו שוב.",
  notFound: { title: "העמוד הזה לא קיים. אולי הקישור ישן.", home: "לעמוד הראשי", search: "לחיפוש" },
  staleBanner: { before: "חלק מהנתונים בעמוד לא עודכנו מאז", after: "הם מסומנים בשעון." },
  loading: "טוען…",
  notInData: "לא נמצא בנתוני הרשות",
} as const;

/** NEW: Hebrew names of the formulas a sheet names (method.md F-IDs). */
export const formulaNames: Record<string, string> = {
  "F-05": "ההפקדות לאורך הזמן",
  "F-06": "ערך בכסף של היום",
  "F-08": "חשבון הכסף חודש אחרי חודש",
  "F-09": "השווי במשיכה",
  "F-11": "דמי ניהול מהפקדה",
  "F-15": "דמי ניהול מחיסכון",
  "F-16": "דמי ניהול לחודש",
  "F-27": "קופת גמל: אין מס כל עוד הכסף בפנים",
  "F-33": "הפקדה בלי הטבת מס",
  "F-43": "מס נוסף על הכנסות גבוהות",
  "F-44": "מס במשיכה מקופת גמל להשקעה",
  "F-67": "הגרף בעמודי המדריך",
};

/** NEW: what each engine flag means, in one line (method.md §12). The code stays beside the words. */
export const flags: Record<string, string> = {
  "G-02": "בסיס המס במשיכה: החוק לא אומר במפורש אם המס הוא על הרווח הריאלי. האתר מחשב לפי מה שהחברות המנהלות מנכות, ומציג גם את החלופה.",
  "G-11": "דמי ביטוח לאומי על הרווח במשיכה: עוד לא ברור אם חלים. האתר לא מחשב אותם.",
  "G-14": "הוצאות ישירות של המסלול לא נאספו עדיין, ולכן לא נכללו בחישוב.",
  "G-21": "חלק מהמס מוסדר דרך דוח שנתי, לא בניכוי במקור.",
  "PF-13": "ההנחה בדמי הניהול הוארכה לחמש שנים לפחות, לפי חוזר הרשות.",
  "TXK-OQ12": "מגיל 60: האם מדרגות המס הנמוכות חלות על הרווח במשיכה, עוד לא ברור. האתר לא מחשב את ההקלה.",
};

/** NEW: labels of the values a computation reads, shown in the number sheet (copy 3.8 "ערכים שנכנסו לחישוב"). */
export const computedInputs = {
  amountNow: "סכום היום",
  monthly: "הפקדה חודשית",
  years: "שנים",
  grossReturn: "תשואה בשנה",
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

/** NEW: fixed lines of the guide's key-value, fee and tax blocks, keyed by what the record says. */
export const guideBlocks = {
  ceiling: { perYearAll: "לשנה, לכל אדם בכל הקופות יחד", taxYear: "שנת המס" },
  exit: { anyTime: "בכל עת, את כל הכסף או חלק ממנו", labelWithdraw: "משיכה", labelDays: "תוך כמה זמן הכסף אצלכם", upTo: "עד", businessDays: "ימי עסקים", labelSwitch: "מעבר בין מסלולים", labelCeiling: "תקרת הפקדה" },
  fees: {
    balance: { name: "דמי ניהול מחיסכון", base: "כל שנה, מכל הכסף שנצבר", after: "בשנה" },
    deposit: { name: "דמי ניהול מהפקדה", base: "מכל סכום שמפקידים", after: "מכל הפקדה" },
    direct_expenses: { name: "הוצאות ישירות", base: "עלויות הקנייה והמכירה של ההשקעות, מהקופה", cap: "אין תקרה כוללת" },
    exit: { name: "דמי יציאה", base: "כשמושכים", cap: "אין" },
    upTo: "עד",
  },
  taxSteps: {
    "F-33": { headline: "אין הטבת מס", text: "מפקידים מכסף שכבר שולם עליו מס." },
    "F-27": { headline: "אין מס על הרווחים", text: "גם מעבר בין מסלולים לא ממוסה." },
    "F-44": { before: "עד", after: "מהרווח הריאלי", text: "כלומר מהרווח שמעבר לעליית המחירים.", baseTag: "בסיס המס: מקור מוסדי", altBefore: "האתר מציג גם חלופה:", altAfter: "מהרווח הנומינלי." },
  } as Record<string, Record<string, string>>,
  regulatorNames: { CMA: "רשות שוק ההון, ביטוח וחיסכון", BoI: "בנק ישראל", ISA: "רשות ניירות ערך" } as Record<string, string>,
} as const;
