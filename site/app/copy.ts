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
    { href: "/companies", label: "חברות ומסלולים", current: "decoder" },
    { href: "/rules", label: "כללים", current: "rules" },
    { href: "/parameters", label: "פרמטרים", current: "parameters" },
    { href: "/goal", label: "השוואה למטרה", current: "goal" },
  ] as const,
  notCovered: { href: "/not-covered", label: "מה האתר עוד לא מכסה" },
  footer: [
    { href: "/rules", label: "כללים" },
    { href: "/parameters", label: "פרמטרים" },
    { href: "/goal", label: "השוואה למטרה" },
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
  yes: "כן",
  no: "לא",
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
  door3: { title: "כסף שיושב בעו״ש", line: "שני מספרים, ותראו כמה עולה להשאיר אותו שם", href: "/idle-cash" },
} as const;

export const search = {
  label: "חיפוש",
  hint: "אפשר להדביק את השם בדיוק כמו שהוא מופיע באפליקציה, בפרסומת או בדוח.",
  tooShort: "הקלידו לפחות שתי אותיות.",
  groups: { product: "מוצרים", track: "מסלולים וקופות", term: "מונחים", guide: "עמודי מדריך", bank: "בנקים ומוצרי בנק" },
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
  headline: { before: "נשאר לכם אחרי", after: "אחרי דמי ניהול ומס, בכסף של היום", afterNominal: "אחרי דמי ניהול ומס, בשקלים של העתיד" },
  modes: { real: "בכסף של היום", nominal: "בשקלים של העתיד" },
  modeLabel: "אופן הצגת הסכומים",
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
  feeNoteOther: "הסכומים בפועל נקבעים אצל הגורם המציע. כאן מופיעים סוגי העלויות, ותקרה כשיש תקרה בחוק.",
  taxSteps: { deposit: "בהפקדה", during: "כל עוד הכסף בפנים", exit: "כשמושכים" },
  related: "גם כדאי להכיר:",
  checklist: { blocked: "חסום:", considered: "נלקח בחשבון", notRelevant: "לא רלוונטי", blockedMark: "חסום: שאלה פתוחה", expand: "מאיפה זה", blockedLast: "עד שהשאלה תיסגר, האתר לא מחשב את זה." },
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
  stale: { before: "לא עודכן מאז", middle: "בדרך כלל מתעדכן", cadence: { daily: "כל יום", monthly: "כל חודש", quarterly: "כל רבעון", yearly: "כל שנה" } },
  allRulesOf: "לכל הכללים של",
  unit: { nis_per_month: "בחודש", pct_per_year: "בשנה" },
} as const;

export const rule = {
  title: "כלל",
  conditions: "תנאים וחריגים",
  figures: "סכומים לפי שנת מס",
  source: "מקור",
  topic: "נושא",
  checked: "נבדק ב־",
  recheck: "ייבדק שוב ב־",
  all: "לכל הכללים",
  open: { title: "שאלה פתוחה:", unknown: "מה עוד לא ידוע", waiting: "מה מחכה לתשובה", last: "בינתיים האתר לא מחשב את זה." },
  dimensions: "נוגע ל",
  noText: "נוסח הכלל במילים פשוטות עוד לא נכתב; הכותרת מופיעה כפי שהיא במאגר הכללים.",
} as const;

export const rulesPage = {
  title: "כללים",
  lede: "כל כלל שהאתר משתמש בו, עם המקור שלו. כלל שהמקור שלו חלש יותר מסומן, ושאלה פתוחה מסומנת במנעול.",
  openQuestions: "שאלות פתוחות בנושא הזה",
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
    "provident-family-common.md": "כללים משותפים לקופות הגמל",
    "regulators-and-protection.md": "מי מפקח ומה מוגן",
    "tracks-catalogue-and-decoder.md": "מסלולים והקטלוג",
    "bank-product-names.md": "שמות מוצרים בכל בנק",
    "switching-and-transfers.md": "מעבר בין גופים והעברת כספים",
    "corporate-bonds.md": "אג״ח קונצרניות",
    "fx-and-structured-deposits.md": "מט״ח ופיקדונות מובנים",
    "managed-and-robo-portfolios.md": "תיקים מנוהלים ויועץ אוטומטי",
    "reits-and-gold-funds.md": "קרנות ריט וקרנות זהב",
    "savings-policies-and-executive-insurance.md": "פוליסות חיסכון וביטוח מנהלים",
    "tax-insurance-and-amendment-190.md": "מס: ביטוח ותיקון 190",
    "tax-tier2-other.md": "מס: מט״ח, אג״ח קונצרניות, ריט וזהב ותיקים מנוהלים",
  } as Record<string, string>,
  /** Topic name when a file is not in the map above: never a file name. */
  topicOther: "נושא נוסף במאגר הכללים",
} as const;

/** The Hebrew topic name of a rule-base file (never the file name). */
export function topicName(file: string): string {
  return (rulesPage.groups as Record<string, string>)[file] ?? rulesPage.topicOther;
}

export const parametersPage = {
  title: "פרמטרים של האתר",
  lede: "החלטות שהאתר מקבל בעצמו, כמו מתי שתי אפשרויות נחשבות שקולות. הן לא כללים מהחוק, ואי אפשר לשנות אותן מהעמוד.",
  rows: { why: "למה", approved: "אושר ב־", usedIn: "משמש ב:" },
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
  /** Hebrew label of every parameter field, keyed by method id and field path ({row} is the classification of a table row, {preset} a preset's name). copy.md 3.15 */
  fields: {
    "P-01.value": "הפרש יחסי שמתחתיו שתי אפשרויות שקולות",
    "P-02.bounds.lo": "{name}: הגבול התחתון",
    "P-02.bounds.hi": "{name}: הגבול העליון",
    "P-03.negotiate_nis": "עלות לאורך האופק שמעליה שווה לנהל משא ומתן",
    "P-03.avoid_nis": "עלות לאורך האופק שמעליה שווה להימנע",
    "P-03.negotiate_share": "חלק מכלל העלות (סף משא ומתן)",
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
  noMatch: "לא מצאנו חברה בשם הזה.",
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
  lede: "מוצרים שאנחנו מכירים אבל עוד לא יכולים להסביר עד הסוף, ולמה.",
  rows: { known: "מה ידוע", open: "מה עוד פתוח", why: "למה זה חשוב" },
  empty: "כרגע האתר מכסה את כל המוצרים שהוא מכיר.",
  openLine: "הכללים לזה עוד בבדיקה. עד שייסגרו, האתר לא מחשב אותו.",
  alsoCalled: "נקרא גם",
} as const;

export const system = {
  calcFailed: "לא הצלחנו לחשב את הגרף. רעננו את העמוד ונסו שוב.",
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
};

/** What each engine flag means, in one line (method.md §12); copy.md 3.8. The code stays beside the words. */
export const flags: Record<string, string> = {
  "G-02": "בסיס המס במשיכה: החוק לא אומר במפורש אם המס הוא על הרווח הריאלי. האתר מחשב לפי מה שהחברות המנהלות מנכות, ומציג גם את החלופה.",
  "G-11": "דמי ביטוח לאומי על הרווח במשיכה: עוד לא ברור אם חלים. האתר לא מחשב אותם.",
  "G-14": "הוצאות ישירות של המסלול לא נאספו עדיין, ולכן לא נכללו בחישוב.",
  "G-21": "חלק מהמס מוסדר דרך דוח שנתי, לא בניכוי במקור.",
  "PF-13": "ההנחה בדמי הניהול הוארכה לחמש שנים לפחות, לפי חוזר הרשות.",
  "TXK-OQ12": "מגיל הפרישה המוקדמת: האם מדרגות המס הנמוכות חלות על הרווח במשיכה, עוד לא ברור. האתר לא מחשב את ההקלה.",
};

/** Labels of the values a computation reads, shown in the number sheet (copy.md 3.8 "ערכים שנכנסו לחישוב"). */
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
    labelSwitch: "מעבר בין מסלולים",
    labelCeiling: "תקרת הפקדה",
    // one line per `lawful_exit.kind` (data-schema 3.3); each number is a Num on the page; copy.md 3.5a
    atMaturity: "בסוף התקופה שנקבעה בהסכם",
    atMaturityTerm: { before: "בתום", after: "" },
    afterYears: { before: "כשעוברות מההפקדה הראשונה", after: "" },
    atAge: { before: "מגיל", after: "" },
    atChildAge: { before: "כשהילד מגיע לגיל", after: "" },
    tradingDay: "בכל יום מסחר, במחיר של אותו יום",
    otherKind: "לפי התנאים שבנוסח שלמטה",
    textNote: "הנוסח המלא, כפי שהוא במקור:",
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
    creation_redemption: { name: "עמלת יצירה ופדיון", base: "כשההזמנה עוברת ליצרן הקרן ולא לבורסה" },
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
    "F-44": { before: "עד", after: "מהרווח הריאלי", text: "כלומר מהרווח שמעבר לעליית המחירים.", baseTag: "בסיס המס: מקור מוסדי", altBefore: "האתר מציג גם חלופה:", altAfter: "מהרווח הנומינלי." },
    // every other formula a wrapper record may name (method.md 5 to 9); one headline and one sentence each; copy.md 3.5a
    "F-21": { headline: "מס על הריבית בסוף כל פיקדון", text: "הבנק מנכה את המס מהריבית בסוף התקופה, והסכום נטו נפתח מחדש כפיקדון." },
    "F-22": { headline: "מס על הריבית בסוף כל תקופה", text: "אין כלל מס שמבדיל תוכנית חיסכון מפיקדון: הריבית ממוסה בסוף כל תקופה." },
    "F-23": { headline: "בקרן כספית פטורה אין מס בזמן ההחזקה", text: "חלוקות, אם יש, ממוסות כשהן משולמות. בקרן שהיא עצמה חייבת במס, הקרן משלמת את המס ולא אתם." },
    "F-24": { headline: "ההפרש בין מחיר הקנייה לפדיון נחשב ריבית", text: "המס על ההפרש מנוכה בפדיון, וסדרה חדשה נקנית מהסכום נטו." },
    "F-25": { headline: "מס על כל תשלום ריבית", text: "המס מנוכה בכל תשלום, והקופון נטו נקנה מחדש." },
    "F-26": { headline: "מס על הריבית כשהיא נזקפת", text: "הבנק מנכה את המס מהריבית בכל חודש שבו היא נכנסת לחשבון." },
    "F-30": { headline: "הפקדה שעלותה נטו שווה לסכום שבחרתם" },
    "F-31": { headline: "זיכוי במס על ההפקדה לפנסיה, לשכירים" },
    "F-32": { headline: "זיכוי או ניכוי במס על ההפקדה: לעצמאים ולמי שנחשבים עמית מוטב" },
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
      regBalance: "ממוצע דמי הניהול מחיסכון שנגבו בפועל בשנת {year} (ממוצע שנגבה, לא מחירון)",
      regDeposit: "ממוצע דמי הניהול מהפקדה שנגבו בפועל בשנת {year} (ממוצע שנגבה, לא מחירון)",
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
    { id: "check", title: "מה לבדוק" },
    { id: "terms", title: "מונחים" },
  ] as const,
  kinds: { equity_index: "מדד מניות", bond_index: "מדד אג״ח", cash_like: "מזומן ודומיו", mixed: "תמהיל של כמה סוגי נכסים", commodity: "סחורות", other: "אחר" } as Record<string, string>,
  kindLabel: "סוג",
  currencyLabel: "מטבע",
  holdLine: "המוצרים שבהם אפשר להחזיק את זה. השוואה ביניהם למטרה שלכם תתווסף בהמשך.",
  holdNone: "עוד לא נאספו המוצרים שמחזיקים את זה.",
  openTax: "לא ברור עדיין איך זה ממוסה כאן: שאלה פתוחה",
  toGuide: "לעמוד המדריך",
  noProse: "הטקסט של העמוד הזה עוד לא נכתב.",
  guideGroup: "עמודי מדריך על מה שהכסף מושקע בו",
} as const;

/** Catalogue lines on the company and track pages (flows 6.11, 6.12); copy.md 3.11 and 3.12. */
export const catalogue = {
  alsoCalled: "נקרא גם",
  seenAt: "מקור:",
  seenOn: "· נראה ב־",
  unassigned: { title: "שמות שעוד לא שויכו", line: "שמות שהחברה משתמשת בהם ועוד לא הצלחנו לשייך למסלול בנתוני הרשות." },
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
  deciding: { "deposit-side-relief": "הטבת מס בהפקדה", "fee-drag": "דמי ניהול", "tax-at-exit": "מס ביציאה", "lock-up": "נעילה" } as Record<string, string>,
  tieOne: "שקולה ל־",
  tieMany: "שקולות:",
  lockedUntil: "נעול עד",
  realLabel: "נשאר לכם במועד המטרה, בכסף של היום",
  nominalLabel: "נשאר לכם במועד המטרה, בשקלים של העתיד",
  saved: "נשמר במכשיר הזה",
  savedAuto: "נשמר אוטומטית במכשיר הזה. בלי חשבון, בלי שרת.",
  couldNotSave: "לא הצלחנו לשמור במכשיר הזה. ההשוואה תעבוד, אבל המטרה לא תישמר.",
  loadingGoal: "טוען את המטרה השמורה…",
  compare: "להשוואה",
  menuRow: "השוואה למטרה",

  form: {
    title: "מה המטרה שלכם?",
    lede: "בחרו נקודת התחלה או מלאו בעצמכם. כל ערך אפשר לשנות, והכול נשמר במכשיר הזה.",
    presetLabel: "נקודת התחלה",
    filledBefore: "מילאנו ",
    filledAfter: " כנקודת התחלה. שנו מה שמתאים.",
    filledNames: { horizonYears: "שנים", monthly: "הפקדה חודשית", available: "החלק שנשאר זמין", anytime: "אילוץ המשיכה" } as Record<string, string>,
    keptEntered: "שמרנו על מה שהזנתם.",
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
    noReturnBefore: "בלי צורך בדוח שנתי למס: עדיין לא ניתן לבדוק. שאלה פתוחה",
    noReturnCode: "TXG OQ4",
    card2: "קצת עליכם",
    card2Why: "למה שואלים: תקרות ההפקדה והטבות המס תלויות בשכר ובהפרשות.",
    age: "גיל",
    employment: "סוג העסקה",
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
    payslipNoRule: "הטקסט של הכלל הזה עוד לא נמצא במאגר הכללים של האתר.",
    payslipLast: "השמות המדויקים בתלוש משתנים בין מעסיקים. עוד לא מצאנו להם מקור רשמי.",
    card3: "ההנחות",
    return: "תשואה שנתית על החלק המושקע",
    returnEmpty: "לא הוזן: האתר לא מנחש תשואה.",
    returnHint: "הזינו את התשואה שאתם מניחים. היא תסומן בכחול בכל מקום שבו היא משפיעה.",
    returnFilled: "תשואה שהזנתם תסומן בגרף בקו מקווקו, כי היא שלכם ולא של האתר.",
    inflation: "אינפלציה בשנה",
    inflationStart: "ערך התחלתי, פרמטר של האתר",
    insurance: "דמי הביטוח בקרן הפנסיה, כאחוז מההפקדות",
    insuranceHint: "כיסוי למקרה מוות ונכות שיורד מהחיסכון כל חודש. בלי המספר הזה האתר לא משווה קרן פנסיה, כי הוא לא מנחש אותו. בקופת גמל לקצבה אין ביטוח כזה, ולכן היא לא צריכה אותו.",
    insuranceEmpty: "לא הוזן: קרנות הפנסיה יסומנו ״עוד לא נבדקה״.",
    goalsHeading: "המטרות שלכם",
    goalsLine: "המטרות נבדקות אחת אחת, לפי הסדר. הראשונה מקבלת את הכסף קודם.",
    addGoal: "מטרה נוספת",
    moveUp: "להזיז למעלה",
    moveDown: "להזיז למטה",
    unnamed: "מטרה ללא שם",
    ageUp: "להגדיל את הגיל בשנה",
    ageDown: "להקטין את הגיל בשנה",
    errYears: "הזינו לפחות שנה אחת.",
    errYearsWhole: "הזינו מספר שלם של שנים.",
    errAvailable: "גדול מהסכום היום.",
    errPercentBefore: "הזינו אחוז עד ",
    errSalary: "השכר לא יכול להיות שלילי.",
    oldVersion: "המטרה שנשמרה היא מגרסה ישנה של האתר.",
    oldVersionActions: { restart: "להתחיל מחדש", delete: "מחיקה מהמכשיר" },
  },

  strip: {
    saved: "נשמר במכשיר הזה",
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
    headlineAfter: "היא הטובה ביותר למטרה הזו, כי",
    headlineBare: "היא הטובה ביותר למטרה הזו.",
    headlineSingle: "היא האפשרות היחידה שדורגה למטרה הזו.",
    reasonFee: "דמי הניהול בה נמוכים יותר:",
    reasonFeeVs: "לעומת",
    reasonFeeIn: "ב־",
    reasonTax: "המס ביציאה בה נמוך יותר:",
    reasonRelief: "ההפקדה אליה מזכה בהטבת מס ששווה",
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
    whyDeciding: "מכריע",
    whyDiffers: "מה הבדיל ביניהן",
    whyNone: "אין הבדל בין הכללים ששתי האפשרויות נשענות עליהם.",
    rank: "מקום",
    decidingLine: "מכריע לעומת הקודמת:",
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
    listedCeilingBefore: "התקרה השנתית לוקחת רק חלק מהכסף:",
    listedCeilingAfter: "עוברים למטרה הבאה",
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
    coverageLast: "המסלולים והקרנות בתוך כל מוצר מופיעים בעמודי החברות. ההשוואה ביניהם תתווסף בהמשך.",
    reasons: {
      savingsPlan: "אין עדיין תנאים של תוכניות חיסכון",
      renewable: "הפקדות חודשיות לקרן כספית מתחדשת עוד לא מוגדרות",
      tier2: "עוד לא מכוסה, שאלות פתוחות",
      enterReturn: "הזינו תשואה",
      enterSalary: "הזינו שכר",
      enterInsurance: "הזינו את דמי הביטוח",
      enterAge: "הזינו גיל",
      enterEmployment: "הזינו סוג העסקה",
      figureNotUpdated: "הנתון לא עודכן:",
      notOwnMoney: "מקבל רק את הכספים מביטוח לאומי ואת הפקדת ההורה, לא את הכסף הזה",
      excludedBefore: "נפסל לפי האילוץ:",
      noTerms: "עוד אין לאתר את תנאי המוצר",
      noRun: "עוד אין לאתר שיטת חישוב לזה",
      gap: "שיטת החישוב עוד לא מוגדרת",
      ruleMissing: "חסר כלל במאגר הכללים",
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
    sensBreaks: "מפריד בין השקולות אם",
    sensNoFlip: "לא מתהפך בטווח שנבדק:",
    sensUntil: " עד ",
    sensFooter: "הטווחים הם פרמטר של האתר ולא ניתנים לשינוי כאן.",
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
    needMore: "כדי להשוות, הזינו כמה שנים עד המטרה וסכום, להיום או להפקדה חודשית.",
    toForm: "לטופס המטרה",
    failed: "לא הצלחנו לחשב את ההשוואה. רעננו את העמוד ונסו שוב.",
    cashBefore: "האפשרויות הנזילות חושבו לפי ריבית של",
    cashAfter: ", פרמטר של האתר. את הנתונים של בנק ישראל אי אפשר להציג כאן בלי הסכמתו בכתב.",
    cashLink: "לנתונים של בנק ישראל",
    bankPublished: "ריבית הבנק, בתוקף מ־",
    staleRow: "מבוסס על נתון שלא עודכן מאז",
    cashChip: "ריבית על הכסף הנזיל",
    rulesUsed: "הכללים שההשוואה נשענת עליהם",
    realNominal: "אופן הצגת הסכומים",
    tableYear: "שנה",
    modes: { real: "בכסף של היום", nominal: "בשקלים של העתיד" },
    reset: "חזרה לערך ההתחלתי",
    legendBaseline: "העו״ש",
  },
} as const;

// ---- release 2, idle cash (copy 6.3) and the fit mark (copy 6.5).

export const idle = {
  title: "כסף שיושב בעו״ש",
  lede: "שני מספרים, ותראו כמה עולה לכם להשאיר אותו שם.",
  fields: { balance: "כמה יש בעו״ש", keep: "כמה חייב להישאר זמין מיד" },
  errBalance: "הזינו סכום גדול מאפס.",
  errKeep: "גדול מהיתרה בעו״ש.",
  fill: "מלאו את שני המספרים.",
  headlineBefore: "להשאיר",
  headlineMid: "בעו״ש עולה לכם עד",
  headlineAfter: "בחודש",
  headlineLabel: "העלות החודשית הגבוהה ביותר מבין האפשרויות הנזילות",
  noCost: "לפי הנתונים שלנו אף אפשרות נזילה לא משלמת יותר מהעו״ש, ולכן להשאיר אותו שם לא עולה לכם כלום.",
  allKept: "כל הכסף צריך להישאר זמין, אין מה להשוות.",
  rowNames: { "bank-deposit:average": "פיקדון", "bank-deposit:own-offer": "פיקדון לחודש, לפי ההצעה שהזנתם", "money-market-fund-daily": "קרן כספית", makam: "מק״מ" } as Record<string, string>,
  perMonth: "בחודש",
  rateOf: "ריבית",
  labels: { entered: "הוזן על ידך", parameter: "פרמטר של האתר", published: "בתוקף מ־" },
  mmfNote: "הריבית כאן משמשת כקירוב לתשואת הקרן.",
  makamNoCommission: "בלי עמלת קנייה",
  baselineBefore: "העו״ש משלם היום",
  baselineAfter: ".",
  baselineNone: "לפי הנתונים שלנו העו״ש לא משלם ריבית.",
  boiBefore: "הממוצע שבנק ישראל מפרסם לכל בנק לא מופיע כאן: תנאי השימוש של בנק ישראל לא מתירים לפרסם אותו מחדש בלי הסכמה בכתב.",
  boiLink: "לממוצעים של בנק ישראל",
  boiParam: "הריבית של הקרן הכספית והמק״מ היא פרמטר של האתר, לא נתון של בנק ישראל.",
  rowNotRun: "עוד לא נבדקה", // the row of a cash option the run could not do
  optional: "לדייק (לא חובה)",
  offer: "ההצעה לפיקדון שראיתם באפליקציה של הבנק",
  offerHint: "כמו שהיא מופיעה אצלכם, לפיקדון לחודש אחד.",
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
  failed: "לא הצלחנו לחשב. רעננו את העמוד ונסו שוב.",
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
  providerLine: "הטבלה לפי ספקים, עם התעריפונים, תתווסף בהמשך.",
  chips: { aria: "במה הכסף מושקע", all: "הכול", noClass: "בלי סיווג בנתונים" }, // noClass: the coverage group's words (copy 7.3)
  filter: "חיפוש חברה או מסלול",
  sort: { aria: "סדר ההצגה", company: "לפי חברה", "fee-balance": "דמי ניהול מחיסכון", "fee-deposit": "דמי ניהול מהפקדה", name: "שם" },
  notAnOffer: "ממוצע הוא מה שהעמיתים שילמו בפועל, לא הצעה אליכם.",
  // copy.md 7.3 (added 2026-10-24, B14): one and two are words, not "1 מסלולים"
  group: { suffix: "מסלולים", matching: "תואמים", one: "מסלול אחד", two: "שני מסלולים", matchingOne: "אחד תואם" },
  showMore: "להציג עוד",
  sectorOnly: "פתוח רק ל",
  columns: { company: "חברה", track: "מסלול", fund: "קופה", holds: "במה הכסף מושקע", balance: "דמי ניהול מחיסכון, ממוצע {year}", deposit: "דמי ניהול מהפקדה", fit: "התאמה", open: "פתיחה" },
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
  noTracks: "למוצר הזה אין מסלולים בנתוני הרשות. הטבלה לפי ספקים תתווסף בהמשך.",
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
  failed: "לא הצלחנו לחשב את העמלות. רעננו את העמוד ונסו שוב.",
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
    backHolding: "לאחזקה",
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
    noReference: "אין ממוצע להשוואה, ולכן לא ניתן לומר שכדאי להתמקח.",
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
  linkOuts: { boi: "לדשבורד העמלות של בנק ישראל", isa: "לדוח השנתי של רשות ניירות ערך", tase: "למחשבון העמלות של הבורסה" },
  perFund: "לקרן כולה",
  notReported: "עוד לא דווח",
  referenceLine: { before: "ממוצע הרשות למסלולי ", mid: ": ", median: " (חציון ", yearBefore: "), לשנת ", tracksBefore: ", מ־", tracksAfter: " מסלולים.", tracksOne: ", ממסלול אחד." },
  ownAverage: ["במסלול הזה עצמו שילמו העמיתים בממוצע ", "."],
  cap: { yearly: "התקרה בחוק: ", perYear: " בשנה", perDeposit: " מכל הפקדה", none: "אין תקרה בחוק", open: "התקרה: שאלה פתוחה ", eachManager: "התקרה: כל חברה קובעת ומפרסמת לכל מסלול; עוד לא נאספה." },
  reduction: { label: "אם יורידו ל־", worthBefore: "שווה ", worthAfter: ".", notReduction: "זה לא הורדה.", suggestion: "הצעה: הממוצע" },
  negotiation: {
    disclosure: "מה להגיד בשיחה",
    from: { balance: "מהחיסכון", deposit: "מהפקדה" } as Record<string, string>,
    p1: ["דמי הניהול ", " בחשבון שלי ב", " הם ", ". לפי נתוני "],
    p2: [" לשנת ", ", הממוצע שנגבה בפועל במסלולי ", " הוא ", " (חציון ", ", מ־", " מסלולים). אבקש להוריד את דמי הניהול ל־", "."],
    own: ["במסלול הזה עצמו הממוצע שנגבה בפועל היה ", "."],
    source: ["מקור: ", ", ", ", נתוני ", "."],
    datasets: { gemelnet: "גמל נט", "pensia-net": "פנסיה נט" } as Record<string, string>,
    authority: "רשות שוק ההון, ביטוח וחיסכון",
    last: "הטקסט מצטט מספר ציבורי ואת המקור שלו, ולא מתחייב לכלום.",
    copy: "העתקת הטקסט",
    copied: "הועתק",
  },
  remainder: { before: "השפעה משולבת של העמלות זו על זו: ", line: "הסכום של כל השורות והשורה הזו הוא העלות הכוללת." },
  thresholds: { before: "הספים: שווה להתמקח מ־", mid: "; שווה להימנע מ־", after: ". פרמטר של האתר.", link: "לכל הפרמטרים" },
  chart: {
    title: "העמלות לאורך הזמן",
    total: "סך העמלות",
    rest: "שאר העמלות",
    remainderLegend: "השפעה משולבת: הרווח עד הקו",
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
  notFound: "לא מצאנו את המוצר או האחזקה.",
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
    ruleMissing: "הטקסט של הכלל הזה עוד לא נמצא במאגר הכללים של האתר.",
    parameterReturn: "לא הוזנה תשואה. החישוב לפי התשואה של התרחיש לדוגמה, פרמטר של האתר.",
    noGoal: "אין מטרה שמורה: החישוב לפי התרחיש לדוגמה של האתר.",
    noTerms: "למוצר הזה עוד אין רשומה עם עמלות לחישוב. אפשר להזין את העמלות מהדוח שלכם.",
    needInput: "כדי לחשב צריך עוד פרט: ",
    // copy.md 7.1 (added 2026-10-24, B3): no engine message reaches the page
    needGeneric: "אחד מהערכים בהנחות",
    // copy.md 7.1 (added 2026-10-24, B3): the assumptions sheet when no goal is saved
    defaultsLead: "עד שתזינו ערך, החישוב לפי התרחיש לדוגמה של האתר: ",
    defaultsNote: "מה שתזינו כאן יישמר כמטרה במכשיר הזה.",
    genericFail: "לא הצלחנו להריץ את החישוב עם הערכים האלה. בדקו את ההנחות שהזנתם.",
    toForm: "לטופס המטרה",
    blockedRun: "החישוב למוצר הזה חסום: ",
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
  loadFailed: "לא הצלחנו לטעון את הנתונים. רעננו את העמוד ונסו שוב.", // copy.md 7.2
  empty: "מה להכין: הדוח השנתי של כל קופה, או הדוח מהמסלקה הפנסיונית.",
  add: "להוסיף אחזקה",
  listHeading: "האחזקות שלכם",
  sheetTitleNew: "אחזקה חדשה",
  sheetTitleEdit: "עריכת אחזקה",
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
  paste: "הדביקו את השם כמו שהוא מופיע בדוח",
  pasteSeveral: "יש יותר ממסלול אחד בשם הזה. בחרו:",
  pasteNone: "לא נמצא בנתוני הרשות. השם נשמר כמו שהקלדתם.",
  pasteOne: "נמצא מסלול אחד בשם הזה:", // copy.md 7.2
  pasteCopy: "העתקת השם", // copy.md 7.2, the copy button for the founder (flow 6)
  childRoute: "איפה הכסף",
  childRouteOptions: { provident: "קופת גמל", bank: "בנק" },
  childFund: "הקופה או הבנק",
  childFundBank: "הבנק", // copy.md 7.2
  childPlansNote: "לכל ילד חיסכון משלו: שני ילדים הם שתי אחזקות, ואין ביניהן איחוד.", // copy.md 7.2, from CS-21 as flows 24 says
  balance: "יתרה",
  fees: "דמי ניהול",
  feeBalance: "מחיסכון",
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
    fundNumber: "מספר הקופה מופיע במסמכי החברה ובמדריך ההעברות של הרשות.",
    lead: "מה הרשות קבעה שהדוח כולל:", // copy.md 7.2
    // The open lines. PF OQ5 ("no official source for the statement's layout") was closed by the 2026-10-23 rule pass (PF-33 to PF-38);
    // what the rules still leave open is the gov.il copy of the 2020 text (PF OQ16).
    openLine: "העותק של חוזר הדוחות באתר gov.il עוד לא נמצא; החוזר נקרא בעותק באתר אחר.", // copy.md 7.2, replaces copy.md's PF OQ5 line
    openCode: "PF OQ16",
    childPlan: "מבנה הדוח של חיסכון לכל ילד:", // copy.md 7.2 lead before CS-27's text
    neverPosition: "האתר לא מצייר דוח לדוגמה ולא מציין איפה בדף כל שדה.", // copy.md 7.2
    ruleMissing: "הטקסט של הכלל הזה עוד לא נמצא במאגר הכללים של האתר.", // copy.md 7.2
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
  feeFailed: "לא הצלחנו לחשב את העלות. בדקו את המטרה ואת הערכים שהזנתם.", // copy.md 7.2
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
  deleteConfirm: "למחוק את האחזקה מהמכשיר הזה?",
  deleteYes: "מחיקה",
  deleteNo: "ביטול",
  detailsOpen: "פרטים", // copy.md 7.2, the phone disclosure's label
  consolidation: {
    heading: "לאחד?",
    oneHolding: "איחוד נבדק כשיש שתי אחזקות מאותו סוג.",
    differentTypes: "העברה מותרת רק במסלולים שהתקנות מונות, לפי סוג המוצר.",
    differentTypesLink: "כל המסלולים בכל החברות", // copy.md 7.2, to the workbench (design-spec 13 edge case)
    outcomes: { allowed: "אפשר לאחד", notAllowed: "לא ניתן לאחד", notSourced: "כללי ההעברה עוד לא נמצאו", blocked: "חסום: שאלה פתוחה" },
    separate: "אפשר להעביר כחשבון נפרד", // copy.md 7.2: the SW-39 outcome (code allowed-separate-account)
    separateLine: "הכסף עובר שלם לחשבון נפרד אצל המנהל השני, והחשבונות מתאחדים רק כששניהם נזילים.", // copy.md 7.2, a plain statement of SW-39
    route: { mid: "ל", after: ": מסלול מותר בתקנות." },
    conditions: "בתנאי ש־",
    notYet: { before: "לא עדיין: החשבון השני נזיל מ־", after: "." },
    missingFirstDeposit: "כדי לבדוק אם אפשר לאחד, הוסיפו את תאריך ההפקדה הראשונה בכל קרן השתלמות.", // copy.md 7.2
    worth: { before: "איחוד ב", after: "שווה", mid: "ב־", end: ", בכסף של היום." },
    noSaving: "האיחוד לא חוסך בעמלות.",
    targetMark: { before: "המסלול הזה", fits: "מתאים", noFit: "לא מתאים", noRule: "אין כלל לסיווג שלו", noGoal: "אין מטרה לבדוק מולה", noTrack: "לא נמצא בנתוני הרשות", after: "למטרה." },
    worthUnavailable: { unsupported: "את שווי האיחוד לסוג המוצר הזה האתר עוד לא מחשב.", "no-goal": "כדי לחשב מה שווה האיחוד, הגדירו מטרה עם שנים.", failed: "לא הצלחנו לחשב את שווי האיחוד." }, // copy.md 7.2
    costHeading: "מה עוד כדאי לדעת", // copy.md 7.2
    sameManager: "שני החשבונות באותה חברה: איחוד חשבונות הוא תהליך של החברה, לא העברה.",
    bankChild: "לא ניתן להעביר לבנק אחר.",
    guideLater: "המדריך למעבר יתווסף בהמשך",
    ruleText: "הנוסח המלא", // copy.md 7.2
  },
  child: {
    heading: "חיסכון לכל ילד",
    blocked: "האם המסלול נבחר או ברירת מחדל: לא ניתן לבדוק.",
    blockedCode: "CS OQ10",
    known: "מה כן ידוע",
    twoPlans: "לכל ילד חיסכון משלו: שני ילדים הם שתי אחזקות, ואין ביניהן איחוד.", // copy.md 7.2
    bankRoute: "הכסף בבנק", // copy.md 7.2
  },
  saveLine: "נשמר אוטומטית במכשיר הזה. בלי חשבון, בלי שרת.",
  transferLink: "העברה למכשיר אחר",
  unsaved: "אי אפשר לשמור במכשיר הזה. מה שהזנתם יישאר רק בזמן הביקור.", // as release 2's "could not save" note
  importedTag: "יובא ב־",
  errors: {
    balanceNegative: "היתרה לא יכולה להיות שלילית.",
    percentOver: { before: "אחוז לא יכול להיות גבוה מ־", after: "." }, // copy.md 7.2: the maximum is a figure in the sentence, isolated (B14, changed 2026-10-24)
    dateFuture: "התאריך עוד לא הגיע.",
    firstAfter: "ההפקדה הראשונה לא יכולה להיות אחרי תאריך הדוח.",
    noTrack: "בחרו חברה ומסלול, או הדביקו את השם מהדוח.",
    required: "השדה הזה חובה.", // copy.md 7.2
    gainOverBalance: "הרווח לא יכול להיות גדול מהיתרה.", // copy.md 7.2
    amountNegative: "הסכום לא יכול להיות שלילי.",
  },
} as const;

export const r3transfer = {
  title: "להעביר למכשיר אחר",
  lede: "קובץ אחד עם כל מה שהזנתם. בלי חשבון, בלי שרת: הקובץ עובר רק איפה שאתם שולחים אותו.",
  exportHeading: "לשמור קובץ מהמכשיר הזה",
  contents: { goals: "מטרות", holdings: "אחזקות", names: "שמות שלא קוטלגו", inputs: "הערכים שהזנתם במדריך", versions: "גרסת האתר והנתונים" },
  caution: "הקובץ מכיל את הסכומים והשכר שהזנתם. שלחו אותו רק למי שאתם רוצים שיראה אותם.",
  buttons: { share: "שיתוף", download: "הורדה", copy: "העתקה", copied: "הועתק" },
  fileName: "שם הקובץ:",
  nothing: "עוד אין מה לשמור.",
  copyBlocked: "לא הצלחנו להעתיק. סמנו והעתיקו מכאן.",
  importHeading: "לטעון קובץ ממכשיר אחר",
  chooseFile: "בחרו קובץ",
  dropZone: "או גררו לכאן",
  paste: "או הדביקו כאן",
  previewCreated: { before: "נוצר ב־", mid: "גרסת אתר" },
  previewCounts: { goals: "מטרות", holdings: "אחזקות", names: "שמות שלא קוטלגו" },
  previewOld: "קובץ מגרסה ישנה; יומר בטעינה.",
  mode: { add: "להוסיף למה שיש במכשיר", replace: "להחליף את מה שיש במכשיר" },
  modeLabel: "מה לעשות עם מה שיש במכשיר", // copy.md 7.4
  replaceConfirm: { text: "להחליף? מה שיש במכשיר הזה יימחק.", yes: "להחליף", no: "ביטול" },
  load: "לטעון",
  afterImport: { before: "נטען:", goals: "מטרות", holdings: "אחזקות", tag: "מסומנים ״יובא ב־" },
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
    unreadable: "לא הצלחנו לקרוא את הקובץ.",
    shareFailed: "השיתוף לא הושלם. אפשר להוריד או להעתיק.",
  },
  unavailable: "אי אפשר לשמור במכשיר הזה. מה שנטען יישאר רק בזמן הביקור.", // copy.md 7.4, the release 2 note for import
  loading: "טוען…", // copy.md 7.4
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
  ledeDeposits: "הפיקדונות לפי פרסום הבנק, נכון ל",
  ledeTariff: "התעריפון נאסף ב־",
  groups: { deposits: "פיקדונות", savings: "תוכניות חיסכון", current: "עו״ש", brokerage: "חשבון השקעות" },
  groupLink: "מה זה",
  count: { one: "מוצר אחד", two: "שני מוצרים", many: "מוצרים" },
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
  linkage: { none: "לא צמוד", cpi: "צמוד למדד", fx: "צמוד לשער" },
  tax: { unlinked: "ריבית לא צמודה; השיעור בעמוד המדריך.", linked: "ריבית צמודה; השיעור בעמוד המדריך." },
  amount: { from: "מ־", to: "עד", noMin: "ללא מינימום" },
  breakWord: { not_allowed: "אין אפשרות שבירה", with_penalty: "שבירה בקנס", none: "שבירה ללא קנס" },
  breakDisclosure: "הבנק כותב:",
  exits: { every: "כל", months: "חודשים", none: "אין" },
  autoRenewWord: { yes: "כן", no: "לא", upTo: "עד", times: "פעמים" },
  currentConditions: "תנאי הריבית, כפי שהבנק כותב",
  notAnOffer: "הריבית המוצעת היא המינימום שהבנק מפרסם לסוג הפיקדון, לא הצעה אליכם. התנאים המחייבים הם בהסכם הפיקדון.",
  rowLinks: { whatIs: "מה זה", whatToCheck: "מה לבדוק" },
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
    tase_shares_bonds: "מניות ואגרות חוב",
    mutual_fund_units: "יחידות של קרן נאמנות",
    foreign_securities: "ניירות ערך זרים",
    makam: "מק״מ",
    money_market_units: "קרן כספית",
  },
  missingTariff: "התעריפון לא נאסף.",
  recordedReason: "הסיבה כפי שנרשמה בקובץ הנתונים",
  missingLinks: { tariffPageBefore: "לעמוד התעריפון של ", compare: "להשוואת הספקים (הבנק מופיע שם כלא ניתן להשוות)", /* copy.md 8.4: the broker's form of the parenthesis */ compareBroker: "להשוואת הספקים (בית ההשקעות מופיע שם כלא ניתן להשוות)" },
  brokerClassLine: "בית השקעות, חבר בורסה שאינו בנק",
  searchGroupBank: "בנקים ומוצרי בנק",
} as const;

// Release 4: the provider workbench and the fund-variant page (docs/copy.md 8.0, 8.1, 8.2; flows 15.1, 15.2). The
// strings the build added are in the "Added 2026-10-24" tables of copy.md 8.0, 8.1 and 8.2, keyed by path. A `{…}` of
// copy.md is a function argument; every figure is a value object rendered by the provenance number, never typed here.
export const r4workbench = {
  // ---- 8.0 everywhere
  levels: { list: "תעריפון", average: "ממוצע שפורסם", entered: "ההצעה שלכם" },
  classWords: { bank: "בנק", broker: "בית השקעות", "provident-manager": "חברה מנהלת", "fund-manager": "מנהל קרנות" } as Record<string, string>,
  regulators: { BoI: "בנק ישראל", ISA: "רשות ניירות ערך", CMA: "רשות שוק ההון, ביטוח וחיסכון" } as Record<string, string>,
  feeTypes: { trade: "עמלת קנייה ומכירה", custody: "דמי ניהול פיקדון ניירות ערך", fx: "המרת מטבע", fixed: "דמי חשבון קבועים" } as Record<string, string>,
  notComparable: {
    heading: "לא ניתן להשוות",
    dataMissing: "התעריפון לא נאסף.",
    noLine: (cls: string) => `בתעריפון אין שורה ל${cls}.`,
    noLineChannel: (cls: string, channel: string) => `בתעריפון אין שורה ל${cls} ב${channel}.`,
    noAverage: (cls: string) => `לא נאסף ממוצע לשורות שחלות על ${cls}.`,
    lineWithoutValue: (name: string) => `בשורה "${name}" חסר ערך בתעריפון.`,
    /** copy.md 8.0: the engine refuses a tariff whose lines it cannot choose between (a plan, a sub-class); the page says so rather than guess a price */
    ambiguous: (cls: string) => `בתעריפון יש כמה שורות שחלות על ${cls}, ולאתר אין עדיין דרך לבחור ביניהן בלי לנחש:`,
  },
  recordedReason: "הסיבה כפי שנרשמה בקובץ הנתונים",
  noAverage: "אין ממוצע שנאסף",
  noAverageReason: "ממוצעי בנק ישראל ומחשבון העמלות של הבורסה מוצגים רק בקישור: הפרסום מחדש דורש הסכמה בכתב.",
  noAverageLinks: { boi: "לדשבורד העמלות של בנק ישראל", tase: "למחשבון העמלות של הבורסה" },
  notCollected: { fee: "לא נאסף", list: "לא נאספה", record: "עוד לא נאספו" },
  notPrinted: "לא מודפס",
  staleTariff: { before: "התעריפון נאסף ב־", after: "; מאז ייתכן שהשתנה." },
  noPublishedDate: "ללא תאריך פרסום",
  enteredTag: "לפי ההצעה שלכם",
  instrumentClasses: {
    etf_units: "קרן סל",
    tase_shares_bonds: "מניות ואגרות חוב",
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
    changeFund: "החליפו קרן",
  },
  tabs: { aria: "תצוגות של ההשוואה", byProvider: "לפי ספק", byTrack: "לפי מסלול", byFund: "לפי קרן", noTracks: "למוצר הזה אין מסלולים בנתוני הרשות." },

  // ---- 8.1 provider workbench page
  providers: {
    title: { before: "איזה בנק או בית השקעות: ", after: "" },
    back: "המדריך למוצר",
    subject: { before: "לפי ", sep: " · " },
    subjectP05: "לפי הרשומה המייצגת: ",
    changeFund: "החליפו קרן",
    noFund: "בחרו קרן כדי להשוות ספקים.",
    /** copy.md 8.1: the saved goal's absence, one line; the strip carries the link */
    noGoal: "אין מטרה שמורה: ההשוואה לפי התרחיש לדוגמה של האתר.",
    behaviour: {
      title: "ההתנהגות שלכם",
      orders: "פעולות בחודש",
      // copy.md 8.1 (changed 2026-10-24, B14): the number is a Num in the sentence; one and two are words
      ordersHint: { before: "כל הפקדה חודשית מתחלקת ל־", many: " פקודות, ולכל פקודה עמלה משלה.", one: "כל הפקדה חודשית היא פקודה אחת, ולכל פקודה עמלה משלה.", two: "כל הפקדה חודשית מתחלקת לשתי פקודות, ולכל פקודה עמלה משלה." },
      /** copy.md 8.1: the aria names of the stepper's two buttons */
      ordersUp: "עוד פעולה בחודש",
      ordersDown: "פחות פעולות בחודש",
      channel: "ערוץ",
      channelOptions: { direct: "ערוצים ישירים", branch: "סניף" },
      channelBrokers: "לא רלוונטי לבתי השקעות",
      fxForeign: (ccy: string) => `הקרן נקובה ב${ccy}: כל הפקדה מומרת.`,
      fxShekels: "הקרן נקובה בשקלים: אין המרה.",
      deposits: "הפקדה אחת בכל חודש של השנה.",
      /** copy.md 8.1: the amounts chips' labels */
      chips: { amount: "סכום", monthly: "הפקדה חודשית", years: "שנים", all: "כל ההנחות" },
    },
    levelAria: "רמת העמלה",
    levelLine: {
      list: "לפי התעריפון המלא של כל ספק, במחיר המחירון, בלי הנחות.",
      averageNone: "אין ממוצע שנאסף: ממוצעי בנק ישראל ומחשבון העמלות של הבורסה מוצגים רק בקישור.",
      averageSome: (source: string) => `ממוצע העמלות שנגבו בפועל, כפי שפורסם ב${source}. ספק בלי ממוצע מופיע כלא ניתן להשוות.`,
      entered: "ההצעה שלכם מושווית לתעריפון של האחרים.",
    },
    entered: { none: "עוד לא הזנתם הצעה.", link: "הזינו הצעה", count: (n: number) => `ההצעה שלכם · ${n}`, binding: "להצעה שלא בכתב לא נמצא כלל שמחייב אותה. שאלה פתוחה SW OQ4" },
    tableHeading: "לפי העלות, מהזולה לגבוהה",
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
      rules: "הכללים שהחישוב נשען עליהם",
      /** copy.md 8.1: what each line charges on, by the snapshot's base */
      bases: { trade: "קנייה ומכירה", custody: "דמי ניהול פיקדון", fx: "המרת מטבע", fixed_period: "דמי חשבון קבועים" } as Record<string, string>,
    },
    notComparableOffer: (name: string) => `יש לכם הצעה מ${name}? הזינו אותה`,
    notComparableLinks: { tariff: (name: string) => `לעמוד התעריפון של ${name}` },
    coverage: {
      sentence: { before: "נבדקו ", mid: " ספקים: ", mid2: " דורגו, ", after: " לא ניתן להשוות." },
      oneRanked: { before: "דורג ", mid: " מתוך ", after: " ספקים." },
      groups: { ranked: "דורגו", notComparable: "לא ניתן להשוות" },
    },
    allMissing: "אין עדיין תעריפון שנאסף למוצר הזה.",
    provident: {
      note: "למוצר הזה הדירוג הוא לפי מסלול. כאן מופיעים דמי הניהול לפי המחירון של כל חברה, בלי דירוג.",
      label: "דמי ניהול לפי המחירון של החברה, לא מדורג",
      toTracks: "לדירוג לפי מסלול",
      /** copy.md 8.1: the listing's column words and empty cell */
      balance: "מחיסכון",
      deposit: "מהפקדה",
      noFee: "לא נמצא בתעריפון",
      tariff: "תעריפון",
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
      binding: "להצעה שלא בכתב לא נמצא כלל שמחייב אותה. שאלה פתוחה SW OQ4",
      buttons: { save: "שמירה", clear: "ניקוי ההצעה", cancel: "ביטול" },
      /** copy.md 8.1: the line under the entered level's table, and the storage note */
      belowTable: "ההצעה שלכם מושווית לתעריפון של האחרים.",
      noStorage: "אי אפשר לשמור במכשיר הזה. ההצעה תישאר רק בזמן הביקור.",
      empty: "מלאו לפחות שורה אחת.",
      noList: "אין שורה כזו בתעריפון",
      errors: {
        percent: (max: number) => `הזינו אחוז עד ${max}.`,
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
    failed: "לא הצלחנו לטעון את נתוני הספקים. נסו לרענן.",
    /** copy.md 8.1: the cases the page cannot run, each with the word it needs */
    cannotRun: {
      fundType: "אין עדיין השוואת ספקים לקרן מהסוג הזה.",
      needRate: (ccy: string) => `הזינו את שער ה${ccy} בעמוד הקרנות כדי להשוות ספקים.`,
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
      w8ben: { label: "יש לכם טופס W-8BEN אצל הברוקר?", yes: "כן", no: "לא", line: "עובדה שלכם, לא כלל." },
      fxD20: "שערי בנק ישראל מוצגים רק בקישור; הזינו את השער.",
      fxLink: "לשערי בנק ישראל",
      yieldLabel: (fund: string) => `תשואת החלוקה של ${fund} (אחוז בשנה)`,
      perYear: "תשלומים בשנה",
      yieldLine: "הרשומה של הקרן לא כוללת תשואת חלוקה; הזינו מהמסמכים של הקרן.",
      providerP05: (name: string) => `התעריפון של ${name} (הרשומה המייצגת)`,
      /** copy.md 8.2: the A-03 field's label and the provider chooser's */
      fxChangeLabel: (ccy: string) => `שינוי שער ${ccy} בשנה (אחוז)`,
      fxStartLabel: (ccy: string) => `שער ${ccy} היום (₪)`,
      providerLabel: "הספק שהתעריפון שלו נכנס לחישוב",
      providerChange: "החליפו ספק",
      goalLead: "הסכום, ההפקדה והשנים הם של המטרה השמורה:",
      reset: "איפוס",
    },
    filter: "חיפוש קרן, מנהל או מספר",
    sort: { aria: "סדר ההצגה", rank: "לפי הדירוג", fee: "דמי ניהול", name: "שם" },
    sortLine: "הדירוג נשען על התשואה שהזנתם ועל הפרטים שנאספו לכל קרן.",
    listHeading: "לפי מה שנשאר לכם, מהגבוה לנמוך",
    // waits: no return entered, so nothing is ranked yet (copy.md 8.2, added 2026-10-24, B14)
    groups: { ranked: "דורגו", listed: "מוצגות, לא מדורגות", "not-evaluated": "עוד לא נבדקו", waits: "ממתינות לתשואה" } as Record<string, string>,
    columns: ["דירוג", "קרן", "מספר נייר", "מקור", "מדינת המוצא", "חלוקה", "דמי ניהול", "נשאר לכם", "תוצאה", "פתיחה"],
    security: { label: "מספר נייר", copy: "העתקה", copied: "הועתק" },
    sourceTags: { "maya-mutual-funds": "ברשימת מאיה", "tase-foreign-funds": "ברשימת קרנות החוץ של הבורסה", "data-funds": "רשומה שנאספה", notInList: "לא ברשימה האחרונה" } as Record<string, string>,
    domicileSr: (c: string) => `מדינת המוצא: ${c}`,
    trading: { nis: "נסחרת בשקלים בבורסה", abroad: (ccy: string) => `נקנית ב${ccy} בחו״ל`, quoted: (ccy: string) => `נקובה ב${ccy}` },
    fees: { fixed_management: "דמי ניהול קבועים", trustee: "דמי נאמן", variable_management: "דמי ניהול משתנים", tracking_difference_12m: "הפרש עקיבה, שנה אחרונה", median_spread: "מרווח ציטוט חציוני" } as Record<string, string>,
    feeNotCollected: "לא נאסף",
    feeTakenZero: "נלקח כאפס בחישוב",
    feesHeading: "דמי הקרן",
    value: "נשאר לכם במועד המטרה, בכסף של היום",
    outcomes: { ranked: "דורגה", "listed-not-ranked": "מוצגת, לא מדורגת", "not-evaluated": "עוד לא נבדקה" } as Record<string, string>,
    reasons: {
      noRecord: "הפרטים עוד לא נאספו.",
      fieldMissing: (field: string) => `הפרטים עוד לא נאספו: ${field}.`,
      fields: { "fees.fixed_management": "דמי ניהול קבועים", distribution_policy: "מדיניות חלוקה", "tax_status.il_fund_tax_track": "מעמד מס" } as Record<string, string>,
      g18: "מקור משני: רשות המסים לא אישרה שקרן זרה שאינה מחלקת ממוסה רק במכירה. שאלה פתוחה TXF OQ1",
      taxableIsraeli: "לקרן נאמנות חייבת אין עדיין חישוב.",
      yieldMissing: "הזינו את תשואת החלוקה.",
      startRate: (ccy: string) => `הזינו את שער ה${ccy}.`,
      withholding: (country: string) => `ניכוי במקור ב${country}: לא נקבע.`,
      moneyMarket: "סוג הקרן הכספית אינו ברשומה.",
      otherCurrency: (a: string, b: string) => `אין חישוב לקרן ב${a} על חשיפה ב${b}.`,
      exitBlocked: (code: string) => `המס ביציאה חסום: שאלה פתוחה ${code}`,
      /** copy.md 8.2: a reason the engine gives that the table has no sentence for, shown with its detail as the engine wrote it */
      other: "אין חישוב לקרן הזו:",
    },
    secondaryTag: "מקור משני",
    rowLinks: { providers: "השוואת ספקים לקרן הזו", check: "מה לבדוק" },
    detail: { heading: "פירוט החישוב", /* copy.md 8.2 */ nominalNote: "הסכומים ששולמו לאורך הדרך, בשקלים של אז; השורה האחרונה בכסף של היום.", fund: "עלויות הקרן", spread: "מרווח הקנייה והמכירה", provider: "עמלות הספק", taxDuring: "מס במהלך התקופה", taxExit: "מס ביציאה", result: "נשאר לכם", rules: "הכללים שהחישוב נשען עליהם" },
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
    failed: "לא הצלחנו לטעון את נתוני הקרנות. נסו לרענן.",
    noExposure: "אין חשיפה כזו באתר.",
    needsReturn: "הזינו תשואה במטרה השמורה כדי לדרג את הקרנות.",
    needsReturnLink: "למטרה",
  },
} as const;

// ---------------------------------------------------------------- release 4: the switching playbook (copy.md 8.3)
/** Strings of docs/copy.md 8.3 verbatim; the keys the build added are in copy.md 8.3's "Added 2026-10-24" table, keyed by path. */
export const r4playbook = {
  title: { before: "איך עוברים: ", after: "" },
  lede: "השלבים כפי שהכללים קובעים אותם: מה חותמים, מה לצפות, ומה חוזק המקור של כל שלב. לא המלצה לעבור.",
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
  stepsHeading: "השלבים, לפי הכללים",
  stepNumber: "שלב",
  sign: "מה חותמים:",
  expect: "מה לצפות:",
  figure: {
    businessDays: (n: string) => `בתוך ${n} ימי עסקים`,
    days: (n: string) => `בתוך ${n} ימים`,
    months: (n: string) => `${n} חודשים`,
    missing: "בתוך התקופה שהחוזר קובע",
  },
  openQuestion: "שאלה פתוחה",
  institutionPrefix: "לפי הוראות המוסדות: ",
  noRule: { title: "שיחת שימור: לא נמצא כלל", head: "לא נמצא כלל על שיחת שימור במוצרי גמל.", known: "מה כן ידוע" },
  experience: {
    disclosure: "מה אנשים מספרים",
    label: "ניסיון של אדם אחד, לא כלל.",
    source: { before: "מקור: ", mid: ", שרשור ", read: ", נקרא ב־" },
    notShipped: "ניסיון מהפורומים לא נכלל בגרסה הזו.",
  },
  /** The strength chip words (copy.md 8.0) and the popover for a copy (8.0). */
  chip: { primary: "ראשי", "primary-mirror": "ראשי, בעותק", institution: "מוסדי", secondary: "משני", experience: "ניסיון", open: "שאלה פתוחה" } as Record<string, string>,
  chipCopy: { before: "המקור הרשמי נקרא בעותק שמתארח ב", mid: ", נבדק ב־", after: "." },
  /** copy.md 8.3: the host of each mirror, as the rule base's sources name them */
  hosts: { analyst: "אנליסט", wikisource: "ויקיטקסט", nevo: "נבו", meitav: "מיטב" },
  offer: {
    title: "רשמו כל הצעה",
    lede: "הצעות נמשכות. רשמו כל הצעה עם התאריך שלה.",
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
    provident: "המעבר לא עולה כלום לפי הכללים.",
    providentLines: ["הנחה בדמי ניהול יכולה להסתיים מוקדם במעבר.", "דמי הצטרפות, אם החברה גובה: לפי המחירון של החברה."],
    inKind: "לפי הצהרות של מוסדות בלבד: העברה לחשבון של אותו בעלים אינה אירוע מס.",
    transferFee: { amount: "עמלת העברת ניירות ערך: ", none: "לא נאסף" },
    hishtalmutPartial: "לא ניתן: קרן השתלמות עוברת רק בשלמותה.",
    differentKinds: "לא נבדק: אין כלל שאומר שהעברה בין שני סוגים חופשית ממס.",
    open: "חסום: שאלה פתוחה",
    /** copy.md 8.3: the line when the sentence above cannot be built (the funds or the goal are not enough) and the share control of a hishtalmut */
    notEvaluated: "לא נבדק:",
    reasons: {
      "no-fund": "לא נמצאה אחת הקרנות באתר.",
      "need-rate": "הזינו את שער המטבע בעמוד הקרן.",
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
  links: { holdings: "מה כבר יש לכם", providers: "השוואת הספקים", guide: "לעמוד המדריך", rules: "כל הכללים על מעבר", playbook: "המדריך למעבר" },
  oneStep: { "child-savings-provident": "תוכנית בבנק לא עוברת לבנק אחר; תוכנית בקופת גמל עוברת דרך הקופה המקבלת וביטוח לאומי.", "child-savings-bank": "תוכנית בבנק לא עוברת לבנק אחר; תוכנית בקופת גמל עוברת דרך הקופה המקבלת וביטוח לאומי.", "bank-deposit": "פיקדון לא עובר לבנק אחר לפני הפדיון. כסף חדש אפשר להפקיד בבנק אחר בחשבון במערכת סגורה." } as Record<string, string>,
  /** copy.md 8.3: the brokerage order of steps is an institution's, said in the lede (design-spec 19 edge cases) */
  brokerageNote: "סדר השלבים בחשבון השקעות הוא לפי הוראות של בנקים ובתי השקעות, לא לפי תקנה.",
  /** copy.md 8.3: what each open question did not find (the rule base's open-question list, switching-and-transfers.md) */
  oq: {
    "SW OQ2": "האם חוזר ההעברה חל על קופת גמל להשקעה.",
    "SW OQ3": "כלל על פניות שימור במוצרי גמל.",
    "SW OQ4": "האם הצעה שניתנה לפני ההצטרפות מחייבת.",
    "SW OQ5": "איך נבדקת הסכמת הלקוח להוצאת דוח מהמסלקה.",
    "SW OQ6": "מי מודיע למעסיק להפנות את ההפקדות הבאות, ובתוך כמה זמן.",
    "SW OQ9": "אילו סוגי חשבונות ופעילות נכללים בכללי המעבר בין בנקים.",
    "SW OQ10": "המחיר המפוקח להעברת ניירות ערך.",
    "SW OQ11": "המס על העברת ניירות ערך בין חשבונות של אותו בעלים.",
    "SW OQ12": "העברה בין מוסד ישראלי לברוקר זר.",
    "SW OQ16": "הסרת סוכן שכבר מחובר לחשבון.",
  } as Record<string, string>,
  loading: "טוען…",
  noWrapper: "אין מדריך מעבר למוצר הזה.",
  incomplete: "המדריך חלקי בשלב הזה: כלל פתוח מסומן בנעילה.",
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
    empty: "לא הוזן: ההשוואה לפי חשיפה תרוץ בלי מסנן, ותגיד זאת.",
    secondDoor: "איזו חשיפה מתאימה למטרה",
  },
  // 9.2 exposure result
  exposure: {
    title: "{goal}: איזו חשיפה מתאימה",
    pageTitle: "איזו חשיפה מתאימה",
    headline: {
      reason: "{exposure} מתאימה למטרה הזו לפי התשואות שהזנתם, כי {reason}.",
      sourcedCash: "{exposure} מתאימה למטרה הזו לפי התשואות שהזנתם ולפי ריבית הבנק שפורסמה, כי {reason}.",
      bare: "{exposure} מתאימה למטרה הזו לפי התשואות שהזנתם.",
      bareSourced: "{exposure} מתאימה למטרה הזו לפי התשואות שהזנתם ולפי ריבית הבנק שפורסמה.", // copy.md 9.2 to 9.6: the bare form with the sourced-cash qualifier
      single: "{exposure} היא החשיפה היחידה שדורגה למטרה הזו.",
      tie: "{a} ו{b} שקולות למטרה הזו לפי התשואות שהזנתם: ההפרש ביניהן {gap}, פחות מסף התיקו של האתר, {theta}.",
      tieMany: "{names} שקולות למטרה הזו לפי התשואות שהזנתם: ההפרש ביניהן {gap}, פחות מסף התיקו של האתר, {theta}.", // copy.md 9.2 to 9.6: three or more tied
      allTied: "כל החשיפות שדורגו שקולות למטרה הזו לפי התשואות שהזנתם.",
      noReturn: "הזינו תשואה לחשיפה אחת לפחות כדי להשוות.",
      allExcluded: "מסנן הירידה שלכם פוסל את כל החשיפות שהזנתם: מסכימים לספוג עד {accepted}.",
      allExcludedLink: "לשינוי המספר",
    },
    reasons: { fee: "דמי הניהול בה נמוכים יותר:", tax: "המס ביציאה בה נמוך יותר:", relief: "ההפקדה אליה מזכה בהטבת מס ששווה" }, // as 6.2
    headings: { ranked: "לפי הסדר, לפי התשואות שהזנתם", listed: "מוצגות בלי דירוג", excluded: "נפסלו לפי מסנן הירידה", notEvaluated: "עוד לא נבדקו" },
    fields: {
      returnLabel: "תשואה שנתית ב{currency}",
      returnEmpty: "לא הוזן: האתר לא מנחש תשואה.",
      returnHint: "הזינו את התשואה שאתם מניחים לחשיפה הזו. היא תסומן בכחול בכל מקום שבו היא משפיעה.",
      currency: { ILS: "שקלים", USD: "דולרים", EUR: "יורו" } as Record<string, string>, // copy.md 9.2 to 9.6: the currency word for the label
      cashPublished: "ריבית הבנק, בתוקף מ־{date}",
      cashNote: "המינימום שהבנק מפרסם לסוג הפיקדון, לא הצעה אליכם. התנאים המחייבים בהסכם הפיקדון.",
      cashOverride: "להזין ריבית אחרת",
      cashReset: "לחזור לריבית שפורסמה",
      cashLabel: "ריבית שנתית", // copy.md 9.2 to 9.6: the label of the overriding field
      institution: "מוסדי",
      noSeries: "אין סדרה ממקור: שערי בנק ישראל מוצגים רק בקישור. הזינו תשואה.",
      noSeriesLink: "לנתוני בנק ישראל",
      worstLabel: "הירידה החמורה ביותר שאתם צופים ב{exposure}, בדרך למטרה",
      worstHint: "אין לאתר מקור להערכה כזו, ולכן הוא לא מציע מספר. מה ידוע על הסיכונים, בעמוד המדריך.",
      worstLink: "לסיכונים של {exposure}",
      worstInfo: "על ההערכה", // copy.md 9.2 to 9.6: the accessible name of the info button
      unit: "אחוז מהשווי",
      acceptedChip: "מסכימים לספוג עד {accepted}",
      acceptedNotSet: "לא הוזן כמה תסכימו לספוג",
      acceptedSeparate: "לחשיפה הזו בנפרד",
      acceptedCommon: "לפי המספר המשותף",
      holdingLine: "מוחזקת ב{wrapper}",
      holdingChange: "החליפו מוצר",
      holdingParameter: "המוצר שהאתר בחר כברירת מחדל לחשיפה הזו, פרמטר של האתר. אפשר לבחור כל מוצר שיכול להחזיק אותה.",
      holdingAria: "באיזה מוצר להחזיק", // copy.md 9.2 to 9.6
      holdingDone: "סגירה", // copy.md 9.2 to 9.6
    },
    notes: {
      lossWorst: "מסנן הירידה לא הופעל: הזינו את הירידה שאתם צופים.",
      lossAccepted: "מסנן הירידה לא הופעל: הזינו את הירידה שתסכימו לספוג.",
      excludedTag: "נפסלה: צופים ירידה של {worst}, מסכימים לספוג עד {accepted}",
      excludedLine: "שנו אחד מהמספרים כדי להחזיר אותה להשוואה.",
      passed: "עברה את מסנן הירידה: {worst} עד {accepted}.",
      passedEqual: "עברה את מסנן הירידה: {worst}, בדיוק המספר שתסכימו לספוג. ירידה שווה למספר שלכם נשארת בהשוואה.", // copy.md 9.2 to 9.6: F-71 "equal is kept", named on the row
    },
    valueLabel: "נשאר לכם במועד המטרה, בכסף של היום",
    valueLabelNominal: "נשאר לכם במועד המטרה, בשקלים של העתיד", // as 6.2
    listedThrough: "ב{wrapper}: {reason}",
    coverageReasons: {
      excluded: "נפסלה לפי מסנן הירידה: צופים ירידה של {worst}, מסכימים לספוג עד {accepted}. D11",
      noReturn: "הזינו תשואה",
      noSeries: "אין סדרה ממקור: שערי בנק ישראל מוצגים רק בקישור. D20",
      noWrapper: "לא נבחר מוצר שמחזיק את החשיפה",
      cannotHold: "{wrapper} לא מחזיק את החשיפה הזו", // copy.md 9.2 to 9.6: engine reason wrapper-cannot-hold (a build error in the normal flow)
      noFund: "לא נבדקה: פרטי הקרן עוד לא נאספו.", // copy.md 9.2 to 9.6: P-08 row waiting for a fund record
      noTerms: "עוד אין לאתר את תנאי המוצר", // copy.md 9.2 to 9.6
    },
    links: { holdIt: "באיזה מוצר להחזיק את זה", buyFund: "איזו קרן לקנות", holdItNoReturn: "הזינו תשואה קודם" },
    choose: { button: "בחרתי בזה", chosen: "הבחירה שלכם, מ־{date}", unchoose: "לבטל את הבחירה" },
    save: { button: "לשמור את ההשוואה", saved: "נשמרה ב־{date}", again: "לשמור שוב", confirm: "להחליף את ההשוואה שנשמרה ב־{date}?", replace: "להחליף", cancel: "ביטול", failed: "לא הצלחנו לשמור במכשיר הזה. ההשוואה תעבוד, אבל לא תישמר." }, // failed: as 6.0
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
      group: "{exposure}: תשואה · ירידה צפויה · מסכימים לספוג · מוחזקת ב",
      ret: "תשואה", worst: "ירידה צפויה", accepted: "מסכימים לספוג", holding: "מוחזקת ב",
      empty: "לא הוזן", // copy.md 9.2 to 9.6
    },
    coverage: {
      sentence: "נבדקו {n} חשיפות: {ranked} דורגו, {listed} מוצגות בלי דירוג, {excluded} נפסלו לפי מסנן הירידה, {notEvaluated} עוד לא נבדקו.",
      notEligible: ", {n} לא מתאימות לכם",
      groups: { "not-eligible": "לא מתאימות לכם", excluded: "נפסלו לפי מסנן הירידה", "not-evaluated": "עוד לא נבדקו", "listed-not-ranked": "מוצגות בלי דירוג", ranked: "דורגו" } as Record<string, string>,
      last: "הקרנות והמסלולים שנותנים כל חשיפה מושווים בשולחן העבודה.",
    },
    rank: "מקום", // copy.md 9.2 to 9.6
    detail: "פירוט", // copy.md 9.2 to 9.6
    detailTitle: "פירוט", // copy.md 9.2 to 9.6
    checklist: "מה לבדוק", // copy.md 9.2 to 9.6: as 6.2
    failed: "לא הצלחנו לחשב את ההשוואה. רעננו את העמוד ונסו שוב.", // as 6.2
    returnLabels: { entered: "לפי תשואה שהזנתם: {rate}", sourced: "לפי ריבית הבנק שפורסמה: {rate}", cashEntered: "לפי ריבית שהזנתם: {rate}" },
    wrapperSubject: "לפי {exposure} בתשואה שהזנתם, {rate}",
    cannotHoldTag: "לא מחזיק {exposure}",
    // copy.md 9.2 to 9.6: P-08 rows that cannot run, in the words of the parameter's own rows
    p08: { gov: "לא נבדקה: תדירות הקופון של סדרה לא צמודה עוד לא במאגר הכללים. שאלה פתוחה GOV OQ4", fund: "לא נבדקה: פרטי הקרן עוד לא נאספו." },
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
    what: { rule: "הכלל {code}", parameter: "הפרמטר {name}", data: "הנתון {name}", assumption: "ההנחה {name}" },
    counts: { rules: "{n} כללים", parameters: "{n} פרמטרים", data: "{n} קובצי נתונים", assumptions: "{n} הנחות" },
    many: "{n} שינויים מאז {date}, {m} מהם נגעו להשוואה הזו.",
    computing: "בודק מה השתנה…",
    resultUnchanged: "נבדק מחדש היום: ללא שינוי מאז {date}.",
    verdict: {
      holds: "הדירוג נשמר: {option} עדיין ראשונה.",
      topChanged: "הדירוג השתנה: {option} במקום {before}.",
      tieSet: "קבוצת השקולות השתנתה: {names}.",
      cannotRun: "לא ניתן לבדוק: {reason}",
      none: "הדירוג נשמר: אף אפשרות לא דורגה, גם בשמירה.", // copy.md 9.2 to 9.6: both sides empty
    },
    cannotRunReasons: { rule: "הכלל {code} לא עודכן", input: "חסר קלט: {field}", record: "הרשומה {name} לא קיימת עוד" },
    choiceStill: "בחרתם ב{option}; היא עדיין במקום {n}.",
    choiceNot: "בחרתם ב{option}; היום היא {outcome}: {reason}.",
    banner: { sheet: "מה השתנה", saveToday: "לשמור את ההשוואה של היום" },
    sheet: {
      title: "מה השתנה מאז {date}",
      kinds: { rule: "כללים", parameter: "פרמטרים", data: "נתונים", assumption: "הנחות" },
      was: "היה {v}", now: "עכשיו {v}",
      checked: "נבדק ב־{date}",
      removed: "הוסר מהמאגר", fileGone: "הקובץ לא קיים עוד", added: "קובץ חדש", notThere: "לא היה",
      stateChange: "היה פרמטר · עכשיו הוזן על ידך",
      rechecked: "הקובץ נבדק מחדש; הערכים לא השתנו.",
      more: "עוד {n}",
      valueChanges: "מה זז בהשוואה",
      valueChange: "{option}: {a} → {b}, בכסף של היום",
      tags: { new: "חדשה בהשוואה", left: "לא מדורגת עוד" },
      beforeAfter: "לפני ואחרי",
      columns: { before: "בשמירה, {date}", now: "היום" },
      rows: { top: "ראשונה: {option}", tie: "שקולות: {names}", noTie: "אין שקולות", none: "אף אפשרות לא דורגה" },
      empty: "אף כלל, פרמטר, נתון או הנחה שההשוואה נשענה עליהם לא השתנו.",
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
    outcomes: { "listed-not-ranked": "מוצגת בלי דירוג", excluded: "נפסלה", "not-evaluated": "עוד לא נבדקה", "not-eligible": "לא מתאימה לכם" } as Record<string, string>,
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
    narrowed: "צומצם ב־{date}: {rule}",
    institution: "יש תשובה של מוסד; האתר מחשב לפיה ומסמן ״מקור מוסדי״, אבל היא לא סוגרת שאלת מס לצורך מעבר לכיסוי מלא.", // copy.md 9.5 (D23, 2026-10-24)
    reopened: "נפתח מחדש ב־{date}",
    closuresHeading: "מה נסגר",
    closure: "נסגר ב־{date}: {rule}",
    none: "עוד לא נרשמו סגירות.",
    closureNoDate: "נסגר: {rule} (התאריך לא נרשם)",
    path: "כשייסגר: יופיע במדריך, בהשוואה למטרה, בשולחן העבודה ובקטלוג, ויימנה בשורת הכיסוי של כל השוואה.",
    nearest: "הקרוב ביותר לכיסוי מלא",
    graduatedHeading: "עברו לכיסוי מלא",
    graduatedItem: "{name}, מ־{date}",
    graduatedLink: "לעמוד המדריך",
    holdingsLink: "מה חוסם את הכיסוי",
    sourceNote: "המצב נקרא מקטעי ״מצב מעבר״ בקובצי מאגר הכללים של כל מוצר ומרשימת הפערים הפתוחים של שיטת החישוב.", // copy.md 9.2 to 9.6
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
