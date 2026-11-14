// Every Hebrew string the site shows, from docs/copy.md.
// Figures never appear here: a `{…}` place in copy.md is filled by a Num on the page.
import { countPhrase } from "./lib/count";

export const site = {
  name: "מקור",
  tagline: "להבין חיסכון והשקעה בישראל, עם מקור לכל מספר.",
  search: "חיפוש",
  searchPlaceholder: "הדביקו שם של מוצר, מסלול או מונח",
  menu: "תפריט",
  close: "סגירה",
  /** The sign at a sheet's bottom edge while more of it lies below (a still shot's fade alone read as content cut off). */
  moreBelow: "יש עוד למטה",
  back: "חזרה",
  currentPage: "העמוד הנוכחי",
  menuItems: [
    { href: "/guide", label: "מדריך", current: "guide" },
    { href: "/companies", label: "חברות ומסלולים", current: "decoder" },
    { href: "/rules", label: "חוקים וכללים", current: "rules" },
    { href: "/parameters", label: "פרמטרים", current: "parameters" },
    { href: "/indices", label: "השקעה במדד" }, // D28, 2026-10-25
    { href: "/deal", label: "עמלות" }, // the fee page (D112); founder, 2026-11-13: "it should have a link from the header". Its breadcrumb is this word
  ] as const,
  notCovered: { href: "/not-covered", label: "מה האתר עוד לא מכסה" },
  // the menu's second group, the home crumb, the footer lines, back to top
  menuBehind: "מאחורי הקלעים",
  homeCrumb: "ראשי",
  footerNote: "אתר אישי, לא מסחרי, בלי קישורי שיווק; הכול נשמר במכשיר שלכם",
  /** The newest date any figure on the site was checked: not the date of the prices on a page, which say their own. */
  footerAsOf: "הנתון האחרון באתר נבדק ב־",
  toTop: "חזרה למעלה",
  footer: [
    { href: "/parameters", label: "פרמטרים" },
    { href: "/not-covered", label: "מה האתר עוד לא מכסה" },
  ],
} as const;

export const numbers = {
  legend: {
    sourced: "ממקור",
    computed: "מחושב",
    entered: "הזנתם",
    // "123 ממקור 123 מחושב" read as a placeholder; the key says what it is and draws each state on its own word
    lead: "כך מסומן מספר:",
    enteredSample: "שהזנתם",
    // the fourth legend item, the caution mark beside a figure that rests on a company's own document
    institution: "לפי החברה: המספר מבוסס על מסמך של החברה",
    // the caution item for a figure its record doubts, after the word "יש ספק" (numbers.doubt) drawn in the figure's tint
    doubtMeaning: "המקור לא חד־משמעי",
    // asked by the guides package: the glossary-term sample in the legend
    term: "מונח",
    termMeaning: "הקישו להסבר",
  },
  /** the tag on a figure or rate that rests on the site's own reading of official texts (the engine's "reading" label, a rate whose reach no official text states); not a secondary source, which is a press article or a forum post. */
  reading: "קריאה של האתר",
  // a figure whose rate or fee takes effect after today; the date follows the maqaf
  startsOn: "נכנס לתוקף ב־",
  legendHintPhone: "הקישו על מספר כדי לראות מאיפה הוא.",
  legendHintPc: "לחצו על מספר כדי לראות מאיפה הוא.",
  details: "פרטים",
  unknown: "לא ידוע",
  /** The unit of the regulator's amounts (data-schema 2, `nis_millions`): `25,706.14 מיליון ₪`. */
  nisMillions: "מיליון ₪",
  /**
   * The word of a shekel figure's short form, always with two decimals (`2.30 מיליארד ₪`, lib/format.ts `nisBillions`): a figure of a
   * billion or more on a phone, of a thousand billion or more on a computer, from a hundred million in a row that writes one of its
   * figures short, and the track pages' managed money from a thousand million.
   */
  billion: "מיליארד",
  /** A chart tick's short form (lib/format.ts `compactNis`): `200 אלף ₪`, `1.5 מיליון ₪`. */
  compact: { thousand: "אלף", million: "מיליון" },
  /** A count of years and of months in words (lib/format.ts `fmt.years`, `fmt.months`): "שנה", "שנתיים", "5 שנים". */
  yearWords: { one: "שנה", two: "שנתיים", many: "שנים" },
  monthWords: { one: "חודש", two: "חודשיים", many: "חודשים" },
  agorotPerDollar: "אגורות לדולר", // the tariff's own words, Psagot part 5
  parameter: "פרמטר של האתר",
  staleSince: "לא עודכן מאז",
  weak: { secondary: "משני", institution: "לפי החברה" },
  /** A figure the record itself doubts (SiteValue.doubt): the word in its label and the title over the doubt in its sheet. */
  doubt: "יש ספק",
  yes: "כן",
  no: "לא",
  /** values the rule records write as English words, shown in Hebrew */
  // and the deposit records' linkage and tax bucket, and a parameter's wrapper: a sheet with no word of its own
  enums: { unlinked: "לא צמוד", cpi: "צמוד למדד", none: "אין", free: "חינם", unlinked_15: "ריבית לא צמודה", linked_25: "ריבית צמודה", makam: "מק״מ" } as Record<string, string>,
  monthsHe: { January: "בינואר", February: "בפברואר", March: "במרץ", April: "באפריל", May: "במאי", June: "ביוני", July: "ביולי", August: "באוגוסט", September: "בספטמבר", October: "באוקטובר", November: "בנובמבר", December: "בדצמבר" } as Record<string, string>,
} as const;

export const strength = {
  primary: { label: "מקור ראשי", line: "הנתון נלקח מנוסח החוק, מהתקנות או מהגוף שמפרסם אותו." },
  institution: { label: "לפי החברה", line: "הנתון נלקח ממסמך של בנק או של חברה מנהלת, לא מהחוק או מהרשות." },
  secondary: { label: "מקור משני", line: "הנתון נלקח מכתבה או מאתר מידע, לא מהמקור עצמו." },
  open: { label: "שאלה פתוחה", line: "עוד לא נמצא מקור שעונה על זה, ולכן האתר לא מחשב את זה." },
  entered: { label: "הזנתם", line: "הזנתם את הערך הזה." },
} as const;

export const buttons = {
  resetOne: "חזרה לערך ההתחלתי",
  // the reset at the far end of a field's label line, before the start value as the field shows it: "חזרה ל־10", "חזרה ל־12,000 ₪"
  resetTo: "חזרה ל־",
  resetAll: "חזרה לערכי ההתחלה",
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
  /** Three groups by what the reader came to do. Each comparison row's title is its page's own title; its line says what the page answers. */
  understand: {
    head: "להבין",
    // the kinds themselves (P-10), each opening its guide page, and a link to the whole list
    title: "סוג של חיסכון",
    line: "מה זה, כמה זה עולה ואיך זה ממוסה",
    href: "/guide",
    all: "לכל סוגי החיסכון במדריך",
  },
  compare: {
    head: "להשוות",
    // "הריבית הקבועה הגבוהה לשנה על 10,000 ₪: 3.25% בבנק ירושלים": the deposits page's own heading figure at its start
    deposits: { lead: "הריבית הקבועה הגבוהה לשנה על ", colon: ": ", atBank: " בבנק ", plain: "הריבית של כל בנק, לכל תקופה ולכל סכום" },
    tracks: "כמה כל מסלול גובה, במה הוא מושקע ומה הוא השיג בעבר",
    indices: "באיזה חשבון ובאיזו קרן הכי זול להחזיק מדד לאורך זמן",
    companies: "כל המוצרים והמסלולים של חברה, עם הסבר לכל אחד",
  },
  check: {
    head: "לבדוק מה אמרו לכם",
    lead: "מה כתוב על זה בחוק ובתנאים של החברות, ואיפה. למשל:",
    /** An example claim as its row shows it, in quotation marks. */
    quoted: (claim: string) => `״${claim}״`,
    all: "לכל החוקים והכללים",
  },
} as const;

export const search = {
  label: "חיפוש",
  hint: "אפשר להדביק את השם בדיוק כמו שהוא מופיע באפליקציה, בפרסומת או בדוח.",
  tooShort: "הקלידו לפחות שתי אותיות.",
  groups: { product: "מוצרים", track: "מסלולים וקופות", term: "מונחים", guide: "עמודי מדריך", bank: "בנקים ומוצרי בנק", company: "חברות מנהלות", notcovered: "עוד לא באתר" },
  // the row lines for numbers, and "also called"
  fundWord: "קופה",
  securityWord: "מספר נייר",
  notCoveredLine: "מוצר שהאתר עוד לא מכסה",
  also: "נקרא גם:",
  termLine: "מונח · מוסבר בעמוד",
  // a guide's row: its page by its own name, or by another name it is also known by; the part of a guide that answers a question
  guideLine: "עמוד המדריך",
  guideAbout: "עמוד המדריך על",
  sectionLine: "חלק מעמוד המדריך",
  tracksLine: "השוואה של המסלולים בכל החברות",
  /** The guide group's heading when a comparison page stands beside the guide. */
  guideAndCompare: "מדריך והשוואה",
  more: "הצגת כל התוצאות בקבוצה",
  clear: "ניקוי",
  empty: {
    title: "עוד לא באתר",
    bodyBefore: "את השם ״",
    bodyAfter: "״ עוד אין באתר.",
    underButton: "העתיקו את השם ושלחו אותו למי ששלח לכם את האתר, כדי שיתווסף. ההעתקה גם שומרת אותו במכשיר שלכם.", // saved only on the copy click
    notProduct: "זה לא שם של מוצר? ראו מה האתר עוד לא מכסה",
    copyFailed: "ההעתקה לא הצליחה. סמנו את השם והעתיקו אותו ידנית.",
    links: { companies: "לרשימת החברות", shorter: "לחפש רק חלק מהשם" },
  },
} as const;

export const guideIndex = {
  title: "מדריך",
  lede: "כל סוג של חיסכון והשקעה שהאתר מכסה. לכל אחד אותו מבנה, כדי שיהיה קל להשוות.",
  group1: { title: "איפה הכסף מוחזק", line: "המוצר עצמו: חשבון בבנק, קופה או חשבון ניירות ערך" },
  group2: { title: "במה הכסף מושקע", line: "מה שבתוך המוצר: מזומן, מק״מ, קרן כספית, אג״ח, מניות דרך מדד" },
  // D6: the money-market funds are one entry under "במה הכסף מושקע", each kind with its page
  fundKindsLine: "לפי סוג",
  fundKinds: { "money-market-fund-daily": "יומית", "money-market-fund-renewable": "מתחדשת" } as Record<string, string>,
  last: { title: "מה האתר עוד לא מכסה", line: "מוצרים שהאתר מכיר אבל עוד לא מסביר עד הסוף" },
  // the purpose groups and the plain subtitles
  purposeGroups: { short: "כסף שוטף וקצר", "tax-benefit": "חיסכון עם הטבת מס", retirement: "פרישה", children: "לילדים", "self-directed": "לבחירה עצמית", other: "עוד" } as Record<string, string>,
  /** Products whose official name must be decoded: the card also shows the plain name the product's own record carries (names.he[1]). */
  plainSubtitleFor: ["pension-comprehensive", "pension-general", "provident-for-annuity", "child-savings-provident"],
  alsoCalled: "בשפה פשוטה:",
} as const;

// A guide of its own, no product id; the prose is in content/guide/limited-bond-fund.tsx
export const limitedBondFund = {
  title: "קרן אג״ח שתקופת קיומה מוגבלת",
  lede: "קרן נאמנות שמחזיקה איגרות חוב שנגמרות בערך באותה שנה, ומתפרקת במועד שנקבע מראש. יש שקוראים לה קרן בולט, ויש שקוראים לה קרן אג״ח לפדיון.",
  indexLine: "קרן אג״ח שנגמרת במועד שנקבע מראש, ויש שקוראים לה קרן בולט",
  searchNames: ["קרן אג״ח שתקופת קיומה מוגבלת", "קרן בולט", "קרנות בולט", "אג״ח בולט", "אג״ח לפדיון"],
  sections: [
    { id: "what", title: "מה זה" },
    { id: "compare", title: "לעומת איגרת חוב וקרן אג״ח רגילה" },
    { id: "who", title: "מי מציע, ובכמה" },
    { id: "end", title: "מה קורה בסוף" },
    { id: "tax", title: "מס" },
    { id: "risks", title: "סיכונים" },
  ],
};

// A guide of its own on funds of every kind (D55), no product id; the prose is in content/guide/mutual-funds.tsx
export const mutualFunds = {
  title: "קרנות נאמנות",
  lede: "קרן סל, קרן מחקה פתוחה וקרן כספית הן כולן קרנות נאמנות לפי אותו חוק: מנהל קרן משקיע את הכסף, ונאמן מחזיק את הנכסים בשביל בעלי היחידות.",
  indexLine: "מה זו קרן נאמנות, מה ההבדל בין קרן סל לקרן מחקה פתוחה, וכמה זה עולה",
  searchNames: ["קרנות נאמנות", "קרן נאמנות", "קרן סל", "קרנות סל", "קרן מחקה", "קרנות מחקות", "קרן מחקה פתוחה", "קרן פתוחה", "קרן סגורה", "ETF"],
  sections: [
    { id: "what", title: "מה זה" },
    { id: "kinds", title: "סוגי הקרנות" },
    { id: "trade", title: "קנייה ומכירה" },
    { id: "cost", title: "כמה זה עולה" },
    { id: "safety", title: "מי מחזיק את הכסף" },
    { id: "tax", title: "מיסוי" },
  ],
};

export const guide = {
  indexTitle: "בעמוד הזה",
  // D6: makam, a government bond and a money-market fund are bought inside an account, not a container of their own
  heldIn: "קונים ומחזיקים בתוך {account}. מי יכול לפתוח את החשבון, מי מפקח עליו ואיך שומרים בו את הנכסים: בעמוד שלו.",
  sections: [
    { id: "what", title: "מה זה" },
    { id: "use", title: "למה משתמשים בזה" }, // directly under "מה זה"
    { id: "different", title: "מה מייחד" }, // D29: shown only on a page with a visual; guide.tsx filters it
    { id: "worth", title: "שווה לדעת" }, // knowledge layer 2026-10-24 (W6): shown only on wrappers with a P-09 block; guide.tsx filters it
    { id: "who", title: "מי מציע ומי מפקח" },
    { id: "inout", title: "כסף נכנס ויוצא" },
    { id: "cost", title: "כמה זה עולה" },
    { id: "tax", title: "מיסוי" },
    { id: "risk", title: "סיכונים ומה לא מוגן" },
  ] as const,
  /** A section whose usual title does not fit this guide. */
  sectionTitles: {
    "current-account": { use: "כמה כסף להחזיק בעו״ש" },
    "pension-general": { use: "מתי מגיעים אליה" },
    "keren-hishtalmut": { different: "מה קורה לכסף בקרן", who: "מי מציע ומי מצטרף", inout: "משיכה ומעבר", risk: "סיכונים ומה מוגן" },
    makam: { who: "איפה קונים ומי מנפיק" },
    "government-bond": { who: "איפה קונים ומי מנפיק" },
  } as Record<string, Record<string, string>>,
  /** A row of what each company sets for itself, where the checklist's general name would not say what the companies differ on. */
  companyTermTitles: {
    "keren-hishtalmut": { eligibility: "מה קורה כשהמעסיק מפסיק להפקיד, או כשעוברים לעצמאים" },
  } as Record<string, Record<string, string>>,
  exposuresRow: "במה אפשר להשקיע:",
  // D6: on a wrapper's page, the securities bought inside it that have a page of their own (makam, bonds, money-market funds)
  securitiesRow: "מה קונים בתוכו, ולכל אחד עמוד משלו:",
  companiesShow: "הצגת החברות",
  companiesHide: "הסתרת החברות",
  graphTitle: "מה קורה לכסף לאורך הזמן",
  // the sentence names only what the run has: fees and tax, tax alone, fees alone, or neither (a current account at 0%)
  // a run on a tariff (a securities account, makam, a bond) charges commissions and custody beside a fund's own fee: "דמי ניהול" alone is a
  // managing company's or a fund manager's percentage (glossary), so its words name both
  headline: {
    before: "נשאר לכם אחרי",
    afterBoth: "אחרי דמי ניהול ומס",
    afterTax: "אחרי מס",
    afterFees: "אחרי דמי ניהול",
    afterBothTariff: "אחרי עמלות, דמי ניהול ומס",
    afterFeesTariff: "אחרי עמלות ודמי ניהול",
    real: "בכסף של היום",
    nominal: "בשקלים של העתיד",
  },
  // the headline says it is an example and names its inputs; each gap is filled by a Num
  // a cash-like page runs on a rate, not a return; a lump-sum page (lumpSumIds) names one amount, with no monthly deposit
  headlineExample: { lead: "דוגמה:", plus: "ועוד", perMonth: "בחודש, בתשואה של", perMonthCash: "בחודש, בריבית של", lump: "בתשואה של", lumpCash: "בריבית של", perYear: "בשנה, משאירים לכם אחרי" },
  modes: { real: "בכסף של היום", nominal: "בשקלים של העתיד" },
  // the "?" beside the switch says what each side's figure is; the other side's figure is the switch's other side
  modeHelp: { about: "בכסף של היום ובשקלים של העתיד", text: "בכסף של היום: מה שהסכום יקנה במחירים של היום. בשקלים של העתיד: מה שיהיה כתוב אז בדוח או בחשבון. הוא יקנה פחות, כי המחירים עולים." },
  modeLabel: "אופן הצגת הסכומים",
  // the fees band is what was charged, a total to date, not a rate
  legend: { net: "נשאר לכם", tax: "מס", fees: "דמי ניהול שנגבו", feesTariff: "עמלות ודמי ניהול שנגבו", contributions: "ההפקדות שלכם" },
  chips: { amount_now: "סכום היום", monthly_deposit: "הפקדה חודשית", horizon_years: "תקופה", "A-01": "תשואה בשנה", cash_rate: "ריבית בשנה", "A-02": "אינפלציה בשנה", all: "כל ההנחות" },
  readout: { today: "היום", year: "שנה" },
  table: { year: "שנה", contributions: "ההפקדות שלכם", fees: "דמי ניהול שנגבו", feesTariff: "עמלות ודמי ניהול שנגבו", tax: "מס", net: "נשאר לכם" },
  graphAria: { before: "גרף: הכסף לאורך", after: "הנתונים המלאים בטבלה." },
  rulesLine: "חוקים וכללים:",
  markers: { free: "אפשר למשוך מכאן", age: "גיל" },
  enteredReturnCaption: "הקו המקווקו מבוסס על תשואה שהזנתם, לא על הערכה של האתר.",
  enteredRateCaption: "הקו המקווקו מבוסס על ריבית שהזנתם, לא על זו שפורסמה או על הנחה של האתר.",
  blockedBand: "לא מחושב: שאלה פתוחה",
  figureNotUpdated: { before: "הנתון לא עודכן:", middle: "היה בתוקף עד", after: "עד שהוא יעודכן, האתר לא מחשב את הגרף.", link: "לפרטים" },
  appliesToYou: "לפי מה שהזנתם",
  employeesOnly: "לשכירים בלבד",
  selfEmployedOnly: "לעצמאים בלבד",
  whoLine: "לכל חברה יש עמוד עם כל המסלולים שלה.",
  allCompanies: "לכל החברות",
  // the cap column's head says whose cap it is: the fee regulations' on a provident guide, the law's elsewhere
  feeTable: { type: "סוג", base: "על מה נגבה", cap: { regs: "התקרה שבתקנות", law: "תקרה בחוק" } },
  /** What the cap column's head says, for a phone, where the fees stand as rows with no heads: the first sentence under the table. */
  feeCapsPhone: { regs: "אלה התקרות שבתקנות.", law: "כאן מופיעים סוגי העלויות, ותקרה כשיש תקרה בחוק." },
  /** Under the table: where the prices actually charged are. */
  feeNote: "כמה העמיתים שילמו בממוצע, בכל חברה ובכל מסלול, מופיע בעמוד של החברה.",
  feeNoteOther: "הסכומים בפועל נקבעים אצל הגורם המציע.",
  /** Under a fee's cap on a provident guide with several managers' lists collected (F-105): the range over every collected manager. */
  // F-105: the rates the documents print, not a price for the whole period (a rate under the cap is a discount, A-19); no sentence ends on a number, whose full stop RTL draws before it
  // a count opening a sentence read as a decimal after the full stop (".9"), "print only the cap" read as "charge it" or "hide
  // the price", and a range from the lowest to the cap read as "most companies are in between", so the count at the cap comes first
  // the range said once, under the table, for both fees; under each cap only how many write the cap alone
  // ("the exact same paragraph appears twice"). D83: the discount, its period and when it can end earlier (PF-14)
  listRange: {
    before: "אצל",
    of: "מתוך",
    managers: "החברות המנהלות שנאספו, במסמכים כתובה רק התקרה שבתקנות.",
    note: {
      // the count under each fee read as repeated; when both fees have the same count it is said here once
      atCapBoth: { before: "אצל", of: "מתוך", after: "החברות המנהלות שנאספו, במסמכים כתובה רק התקרה, גם מחיסכון וגם מהפקדה." },
      agreement: "מה שגובים בפועל נקבע בהסכם אישי.",
      others: "אצל שאר החברות כתובים במסמכים שיעורים נמוכים יותר. הנמוכים ביותר הם",
      balance: "מחיסכון",
      deposit: "מהפקדה",
      and: "ו־",
      kind: { discount: "בתקופת ההנחה", offer: "בהצעה מותנית, לא במחיר מחייב", plain: "" } as Record<string, string>,
      discountFor: "רשות שוק ההון מחייבת שהנחה כזו תימשך לפחות",
      // "at least 5 years" beside "it can end earlier" read as a contradiction, so the exceptions are part of the same sentence
      discountFrom: "מהיום שהחברה מתחילה לגבות את דמי הניהול המוזלים, חוץ ממקרים שהרשות מונה, למשל חצי שנה אחרי שמפסיקים להפקיד, או כשמושכים כסף או מעבירים אותו לקופה אחרת או למסלול אחר.",
      // PF OQ18: a lump sum and no more deposits may or may not count as deposits stopping; the run takes the cautious reading and ends the discount after six months (A-19)
      lumpSum: { before: "כשמפקידים פעם אחת ולא מפקידים שוב, לא ברור אם זה נחשב הפסקת הפקדות, וזו שאלה פתוחה", after: "." },
      discountEnd: "בתום ההנחה מותר לחברה להעלות את דמי הניהול עד התקרה.",
    },
  },
  feeRange: { caps: "לפי רשות שוק ההון, ב־", of: "מתוך", tracks: "המסלולים, אלה שדיווחו על דמי ניהול, העמיתים שילמו", inYear: "בשנת", average: "בממוצע", to: "עד", reported: "בשנה, תלוי במסלול. כמה הם שילמו בכל חברה ובכל מסלול מופיע בעמוד של החברה." },
  taxSteps: { deposit: "בהפקדה", during: "כל עוד הכסף בפנים", exit: "כשמושכים" },
  // the study fund's deposit-side row by employment (TXH-04, TXH-01, TXH-03 for employees; TXH-05 for the self-employed)
  hishtalmutDeposit: {
    unknown: { headline: "תלוי אם אתם שכירים או עצמאים", employee: "שכירים:", selfEmployed: "עצמאים:" },
    employee: { headline: "ההפקדה שלכם לא מקטינה את מס ההכנסה", text: "היא יורדת מהשכר אחרי מס. הפקדת המעסיק עד הגבול לא נחשבת הכנסה כשהיא נכנסת לקרן; מה שמעל הגבול ממוסה כשכר." },
    employeeShort: "ההפקדה שלכם יורדת מהשכר אחרי מס, ולא מקטינה את מס ההכנסה. הפקדת המעסיק עד הגבול לא נחשבת הכנסה כשהיא נכנסת לקרן; מה שמעל הגבול ממוסה כשכר.",
    selfEmployed: { headline: "ההפקדה מקטינה את מס ההכנסה, עד תקרה", before: "אפשר להפחית מההכנסה מהעסק או מהמקצוע עד", middle: "ממנה, ורק על הכנסה של עד", after: "בשנה, ופחות למי שגם שכיר. זה גבול נפרד מהגבול של הפטור כשמושכים." },
  },
  related: "כדאי להכיר גם:",
  checklist: { blocked: "חסום:", considered: "נלקח בחשבון", uncovered: "עוד לא נלקח בחשבון", blockedMark: "חסום: שאלה פתוחה", expand: "מאיפה זה", blockedLast: "עד שהשאלה תיסגר, האתר לא מחשב את זה.", intro: "כך האתר בודק כל מוצר, מול אותן שאלות. כאן מה שעוד פתוח; את כל הבדיקות אפשר לפתוח למטה.", showAll: "הצגת כל הבדיקות", hideAll: "הסתרת הבדיקות" },
  pcChooseHint: "בחרו מסלול כדי לראות את כל הפרטים ומה לבדוק", // from the approved company mockup
  sliderAria: "מחוון",
} as const;

export const values = {
  title: "ההנחות של הגרף",
  fields: { amount_now: "סכום היום", monthly_deposit: "הפקדה חודשית", horizon_years: "כמה שנים", "A-01": "תשואה בשנה", cash_rate: "ריבית בשנה", "A-02": "אינפלציה בשנה", age: "גיל", employment: "סוג ההעסקה" },
  optional: "(לא חובה)",
  employment: { employee: "שכירים", "self-employed": "עצמאים" },
  units: { nis: "₪", pct: "%", years: "שנים", usd: "$", eur: "€", gbp: "£" },
  hints: { return: "התשואה ההתחלתית היא דוגמה, לא תחזית.", cashCommon: { before: "הריבית ההתחלתית היא הריבית שהכי הרבה בנקים משלמים בעו״ש:", prefix: "ב־", of: "מתוך", after: "הבנקים שנאספו. ריבית שתזינו תחול על כל היתרה." }, cashPublished: "הריבית שהבנק פרסם; ריבית שתזינו תחול על כל היתרה.", cashAssumption: "הריבית ההתחלתית היא ריבית בנק ישראל: הנחה של האתר, לא התשואה של המוצר הזה.", cashRenews: { deposit: "אחרי התקופה הראשונה זו הנחה: בכל חידוש הפיקדון מקבל את הריבית שהבנק מפרסם באותו יום, והגרף מניח שהיא נשארת כמו היום.", "savings-plan": "אחרי התקופה הראשונה זו הנחה: תוכנית חדשה מקבלת את הריבית שהבנק מפרסם באותו יום, והגרף מניח שהיא נשארת כמו היום." }, asOf: "נכון ל־", inflation: "בכמה המחירים עולים בשנה, בממוצע.", deposits: "החישוב מניח שההפקדה החודשית עולה כל חודש עם המחירים.", age: "מסמן בגרף גילים שבהם החוקים והכללים משתנים.", employment: "מסמן בעמוד את החלקים שנוגעים לכם." },
  returnNote: "תשואה שתזינו תסומן בגרף בקו מקווקו, כי היא שלכם ולא של האתר.",
  returnNoteCash: "ריבית שתזינו תסומן בגרף בקו מקווקו, כי היא שלכם.",
  agePlaceholder: "למשל 30", // from the approved mockup
  errors: { nan: "הזינו מספר.", whole: "הזינו סכום בשקלים שלמים.", negative: "הסכום לא יכול להיות שלילי.", positive: "הזינו סכום גדול מאפס.", years: ["הזינו מספר שנים בין", "ל־"], age: ["הזינו גיל בין", "ל־"], pct: ["הזינו אחוז בין", "ל־"] },
  loading: "טוען…",
} as const;

export const provenance = {
  /** A Maya citation inside a Hebrew source title, said in Hebrew: the data's "(Maya filing 1725200, PDF)" read backwards in a Hebrew line. */
  maya: { filing: "דיווח במאיה", published: "פורסם", fundPage: "דף הקרן במאיה", maya: "מאיה" },
  sourced: {
    source: "מקור",
    publisher: "פורסם על ידי",
    checked: "נבדק",
    from: "בתוקף מתאריך",
    to: "בתוקף עד",
    rule: "חוק או כלל",
    forYear: "תקף לשנת",
    englishTitle: "שם המקור באנגלית",
    localFile: "קובץ נתונים של האתר",
    lineBefore: "הנתון נלקח מהמקור שלמטה.",
    noValue: "הנתון הזה לא נמצא במקור, ולכן האתר לא מציג מספר.",
    notYetInForce: "עד אז הנתון הזה עוד לא חל; האתר מציג אותו כפי שפורסם.",
  },
  /** A glossary card's other names; each is drawn with its gershayim (copy 10.4). */
  termAlso: "נקרא גם:",
  computed: {
    formula: "נוסחה",
    inputs: "ערכים שנכנסו לחישוב",
    rules: "חוקים וכללים שנכנסו לחישוב",
    weakInputs: "בין הערכים שנכנסו לחישוב, אלה לפי מסמך של החברה:",
  },
  // a flag with no sentence of its own
  flagOther: "הערה על החישוב:",
  // one chip for every id (IdRef); the formula sheet and the open-question sheet
  idRef: { formula: "נוסחה", parameter: "פרמטר", question: "שאלה פתוחה", questionChip: "פרטים", howComputed: "איך זה מחושב" }, // questionChip: an open question's chip says a word, not its code
  formulaSheet: {
    usesLabel: "פרמטרים של האתר שהנוסחה משתמשת בהם",
    full: "ההגדרה המלאה במסמך שיטת החישוב (באנגלית)",
    /** Over the key to a formula's symbols (`formulaKeys`). */
    where: "כאשר:",
  },
  questionSheet: {
    what: "זו שאלה פתוחה בבסיס החוקים: משהו שעוד לא נמצא לו מקור ברור, בחוק או אצל הרשות.",
    onSite: "כל עוד היא פתוחה, האתר לא מנחש תשובה. הוא לא מחשב את מה שתלוי בה, או מציג אותו עם הערה.",
    status: "מצב",
    blocks: "מה היא עוצרת",
    // the status line, from data/open-questions.json (an answered question is deleted from the rule base)
    statuses: { open: "פתוחה", narrowed: "פתוחה בחלקה: חלק ממנה כבר נענה" } as Record<string, string>,
  },
  entered: { line: "הזנתם את הערך הזה.", instead: "במקום:" },
  // `more` folds the parameter file's general line away from the clicked number's own line
  parameter: { why: "למה הערך הזה", more: "עוד על הפרמטר", noRationale: "ערך שהאתר קבע בעצמו; הוא לא בא מהחוק." },
  stale: { before: "לא עודכן מאז", middle: "בדרך כלל מתעדכן", cadence: { daily: "כל יום", monthly: "כל חודש", quarterly: "כל רבעון", yearly: "כל שנה" } },
  allRulesOf: "לכל החוקים והכללים של",
  unit: {
    nis_per_month: "בחודש",
    pct_per_year: "בשנה",
    // the word after a figure that has no sign of its own
    months: "חודשים",
    years: "שנים",
    days: "ימים",
    business_days: "ימי עסקים",
  },
} as const;

export const rule = {
  set: "חוקים וכללים",
  title: "חוק או כלל",
  conditions: "תנאים וחריגים",
  figures: "המספרים",
  source: "מקור",
  topic: "נושא",
  checked: "נבדק",
  recheck: "ייבדק שוב",
  all: "לכל החוקים והכללים",
  open: { title: "שאלה פתוחה:", unknown: "מה עוד לא ידוע", waiting: "מה מחכה לתשובה", last: "בינתיים האתר לא מחשב את זה." },
  dimensions: "נוגע ל",
  noText: "הנוסח במילים פשוטות עוד לא נכתב; הכותרת מופיעה כפי שהיא במאגר החוקים והכללים.",
  // the "מקור" row of a rule with no link yet
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
    "brokerage-account.md": "חשבון ניירות ערך",
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
  lede: "החלטות שהאתר מקבל בעצמו, כמו מתי שתי אפשרויות נחשבות שקולות. הן לא באות מהחוק, ואי אפשר לשנות אותן מהעמוד. ליד כל אחת כתוב איזה עמוד משתמש בה.",
  rows: { why: "למה", usedIn: "משמש ב:" },
  // Hebrew names of the parameters a live page reads (lib/parameter-pages.ts); copy.md 3.15. The search lists the same ones.
  names: {
    "P-01": "סף תיקו",
    "P-02": "גבולות בדיקת הרגישות",
    "P-05": "התרחיש לדוגמה",
    "P-09": "העובדות שהאתר מבליט",
    "P-10": "סוגי החיסכון שבעמוד הראשון",
    "P-11": "הסכומים שאפשר לבחור בעמוד הפיקדונות",
  } as Record<string, string>,
  /** The pages a parameter is used on, each a link (lib/parameter-pages.ts). */
  pages: {
    home: "העמוד הראשי",
    guide: "עמודי המדריך",
    rules: "עמוד החוקים והכללים",
    indices: "עמוד המדדים",
    deposits: "עמוד הפיקדונות",
  } as Record<string, string>,
  /** Over the kinds of saving the first page names (P-10), each its guide's name. */
  homeKinds: "בעמוד הראשון, לפי הסדר:",
  noCeiling: "ללא תקרה",
  /** Hebrew label of every parameter field, keyed by method id and field path ({name} is the assumption a bound moves). copy.md 3.15 */
  fields: {
    "P-01.value": "הפרש יחסי שמתחתיו שתי אפשרויות שקולות",
    "P-02.bounds.lo": "{name}: הגבול התחתון",
    "P-02.bounds.hi": "{name}: הגבול העליון",
    "P-05.inputs.amount_now": "סכום התחלתי",
    "P-05.inputs.monthly_deposit": "הפקדה חודשית",
    "P-05.inputs.horizon_years": "אופק",
    "P-05.inputs.A-01": "תשואה שנתית ברוטו למוצרי שוק",
    "P-05.inputs.A-02": "אינפלציה שנתית",
    "P-05.inputs.cash_rate": "ריבית למוצרים דמויי מזומן",
    "P-05.inputs.annual_income": "הכנסה שנתית ברוטו",
    "P-05.sliders.monthly_deposit.min": "מחוון ההפקדה החודשית: מינימום",
    "P-05.sliders.monthly_deposit.max": "מחוון ההפקדה החודשית: מקסימום",
    "P-05.sliders.monthly_deposit.step": "מחוון ההפקדה החודשית: גודל צעד",
    "P-05.sliders.horizon_years.min": "מחוון האופק: מינימום",
    "P-05.sliders.horizon_years.max": "מחוון האופק: מקסימום",
    "P-05.sliders.horizon_years.step": "מחוון האופק: גודל צעד",
    "P-05.sliders.amount_now.min": "מחוון הסכום של היום: מינימום",
    "P-05.sliders.amount_now.max": "מחוון הסכום של היום: מקסימום",
    "P-05.sliders.amount_now.step": "מחוון הסכום של היום: גודל צעד",
    "P-05.sliders.A-01.min": "מחוון התשואה: מינימום",
    "P-05.sliders.A-01.max": "מחוון התשואה: מקסימום",
    "P-05.sliders.A-01.step": "מחוון התשואה: גודל צעד",
    "P-05.sliders.change_share.min": "גרף השינויים בעמוד המדדים: הקצה השמאלי",
    "P-05.sliders.change_share.max": "גרף השינויים בעמוד המדדים: הקצה הימני",
    "P-05.sliders.change_share.step": "גרף השינויים בעמוד המדדים: גודל צעד",
    "P-05.sliders.change_share.start": "גרף השינויים בעמוד המדדים: השינוי שמוצג בהתחלה",
    "P-05.ranges.age.min": "גיל מותר בשדה: מינימום",
    "P-05.ranges.age.max": "גיל מותר בשדה: מקסימום",
    "P-05.ranges.pct.min": "אחוז שנתי מותר בשדה: מינימום",
    "P-05.ranges.pct.max": "אחוז שנתי מותר בשדה: מקסימום",
    "P-11.steps.0": "סכום 1",
    "P-11.steps.1": "סכום 2",
    "P-11.steps.2": "סכום 3",
    "P-11.steps.3": "סכום 4",
    "P-11.steps.4": "סכום 5",
    "P-11.steps.5": "סכום 6",
  } as Record<string, string>,
  /** Names of the assumptions a P-02 bound moves (method.md 2.2), in words only. */
  boundNames: {
    "A-01": "תשואה שנתית ברוטו",
    "A-02": "אינפלציה שנתית",
    "A-03": "שינוי שער המטבע מול השקל",
    "A-06": "עלות בתוך הקרן",
    fee_rates: "מכפיל של כל עמלה",
    horizon: "שינוי באופק, בשנים",
  } as Record<string, string>,
  yearsWord: "שנים",
} as const;

export const companies = {
  title: "מה חברה מציעה לי",
  back: "חברות ומסלולים",
} as const;

/** The companies page (lib/company-focus.ts): every company beside one in focus, filtered by a kind of product, a product and a name. */
export const companyFocus = {
  search: "חיפוש חברה",
  typeLabel: "סוג מוצר",
  productLabel: "מוצר",
  /** The four kinds of product, the designer's grouping. */
  types: { all: "הכול", savings: "גמל, השתלמות ופנסיה", funds: "קרנות", trade: "מסחר בניירות ערך", bank: "פיקדונות" },
  trayHint: "בחירת סוג מוצר פותחת כאן את המוצרים שלו. אפשר גם ללחוץ על מוצר אצל החברה שבפוקוס.",
  groups: { houses: "בתי השקעות", managers: "חברות מנהלות", banks: "בנקים" },
  /** A company's name in the list, by page id, where the site's short name (lib/providers.ts `shortName`) still runs to two lines in its
   *  narrow column. The pane beside the list and the search keep the full name. */
  shortNames: {
    "interactive-israel": "אינטראקטיב",
    "interactive-brokers": "IBKR",
    "513173393": "אלטשולר",
    "513611509": "ילין",
    "520019688": "מבטחים",
    "512245812": "מנורה",
    "mizrahi-tefahot": "מזרחי",
  } as Record<string, string>,
  /** A group head's count while a filter or a search is on: "9 מ־13". */
  of: (shown: string, total: string) => `${shown} מ־${total}`,
  companies: { one: "חברה אחת", two: "שתי חברות", many: "חברות" },
  status: {
    tap: "לחיצה על שם מציגה מה יש לחברה.",
    offersOne: "מציעה",
    offersMany: "מציעות",
    beside: "ליד כל שם:",
    unit: { tracks: "מספר המסלולים", funds: "מספר הקרנות", deposits: "מספר הפיקדונות", plans: "מספר התוכניות" },
    searchOne: "מתאימה לחיפוש.",
    searchMany: "מתאימות לחיפוש.",
    searchNone: "אין חברה שמתאימה לחיפוש.",
  },
  units: {
    tracks: { one: "מסלול אחד", two: "שני מסלולים", many: "מסלולים" },
    funds: { one: "קרן אחת", two: "שתי קרנות", many: "קרנות" },
    deposits: { one: "פיקדון אחד", two: "שני פיקדונות", many: "פיקדונות" },
    plans: { one: "תוכנית אחת", two: "שתי תוכניות", many: "תוכניות" },
  },
  has: "יש",
  fullPage: "לעמוד המלא",
  productsOnSite: { one: "מוצר אחד באתר", two: "שני מוצרים באתר", many: "מוצרים באתר" },
  members: "כולל:",
  tariffAt: "התעריפון נאסף ב־",
  paneHint: "לחיצה על מוצר מראה ברשימה מי עוד מציע אותו. החץ פותח את המוצר בעמוד של החברה.",
  assets: "כסף מנוהל",
  fees: "דמי ניהול מהחיסכון",
  to: "עד",
  tariffGroups: "בתעריפון:",
  asOf: "לפי פרסום הבנק, נכון ל־",
  more: "עוד בעמוד המלא",
  terms: "מה כתוב במסמכים",
  /** The products the site has none of at this company: the site may not have collected one the company offers. */
  notHere: "אין באתר:",
  /** The arrow's spoken name. */
  open: (product: string, company: string) => `${product} בעמוד של ${company}`,
  /** The pane's name on a phone, where it opens over the list. */
  close: "סגירה",
  documents: "למסמכים של גופים שאין להם עמוד כאן",
  /** The phone's folded filters: what is chosen, and its words; the search in it as typed. */
  fold: { more: "שינוי", less: "סגירה" },
  quoted: (q: string) => `״${q}״`,
} as const;

export const company = {
  /** D36: both fees on every row, the words after each figure. The legal cap is the caption over its fee's head and the direct expenses the
   *  line of the savings fee's "?"; a phone, with no heads, has both under the table. */
  fees: {
    savings: "מהחיסכון",
    deposits: "מהפקדה",
    cap: "התקרה בתקנות:",
    /** Before the age a cap binds from, and its colon: "התקרה בתקנות אחרי גיל 21:" (CS-18). */
    capAfterAge: "התקרה בתקנות אחרי גיל",
    capSavings: "מהחיסכון,",
    capDeposits: "מהפקדה",
    direct: "בנוסף לדמי הניהול יורדות מהקופה הוצאות ישירות (עמלות מסחר, משמורת ועוד), שלא מופיעות כאן: הן נראות בתשואה, לא כשורה בחשבון.",
  },
  /** The labels beside a track's name (lib/track-labels.ts): facts about this track only (D35). */
  labels: { new: "חדש" } as Record<string, string>,
  /** The track page's note when another track has its name (the company page's same-name banners went with its old list). */
  sameName: { distinct: "שני מסלולים באותו שם: שתי קופות נפרדות" },
  oldData: "נתוני הרשות לא עודכנו מאז",
  default: "ברירת המחדל",
  /** D34: the exposure bars in the track table, and two rows of the track page (F-87, F-88). */
  stock: {
    column: "חשיפה בסוף {period}",
    rowStock: "חשיפה למניות בסוף {period}",
    rowCurrency: "חשיפה למט״ח בסוף {period}",
    stocks: "מניות",
    currency: "מט״ח",
    about: "החלק מנכסי המסלול שחשוף לשוק המניות בסוף",
    aboutCurrency: "החלק מנכסי המסלול שחשוף למטבע חוץ בסוף",
    missing: "לא דווח",
    noAssets: "אין נכסים",
    /** The sheet's note on every share (F-87): what the regulator does not publish. */
    note: "לפי דיווח המסלול לרשות שוק ההון. הרשות לא מפרסמת אם החשיפה כוללת נגזרים או את מה שבתוך קרנות שהמסלול מחזיק, ולכן היא יכולה להיות גבוהה מ־100%.",
    noteMissing: "המסלול לא דיווח לרשות את סך הנכסים או את החשיפה לתקופה הזו.",
    noteNoAssets: "המסלול דיווח לרשות על סך נכסים 0 לתקופה הזו, ולכן אין חלק לחשב.",
  },
} as const;

export const track = {
  fundLine: "קופה",
  /** The fund number as a link to the track's page on the regulator's Gemel-Net (Pensia-Net has no page per fund). */
  gemelNet: { label: "מסלול {id} באתר גמל נט של רשות שוק ההון", page: "עמוד המסלול בגמל נט" },
  labels: { manager: "חברה מנהלת", product: "סוג מוצר", classification: "סיווג", holds: "במה הכסף מושקע", feeBalance: "דמי ניהול מחיסכון", feeDeposit: "דמי ניהול מהפקדה", period: "נכון לחודש", inception: "נפתח ב־" },
  /** The regulator's own words for the figure in members' reports ("דמי ניהול שנגבו בפועל"; CAT-37, which each value's sheet cites). */
  feeBalanceLabel: "ממוצע דמי הניהול מחיסכון שנגבו בפועל בשנת {year}",
  feeDepositLabel: "ממוצע דמי הניהול מהפקדה שנגבו בפועל בשנת {year}",
  feeWhole: "לקרן כולה",
  /** A child-savings fee is what members past National Insurance's age paid, spread over the whole track (CS OQ9); the note over the
   * list says the age, from CS-18's figure. */
  feeOver21: "על כל המסלול",
  feeNotReported: "עוד לא דווח",
  /** An empty deposit-fee average that PF-06 explains: the product has no deposit fee. */
  feeNone: "אין",
  sameNameElsewhere: "יש מסלול נוסף באותו שם.",
  toOther: "למסלול השני",
  /** The link beside the product's name to its guide page. */
  toGuide: "לעמוד המדריך",
  /** The heading over what the site took into account for this track's product. */
  checklist: "מה לבדוק",
} as const;

export const notCovered = {
  title: "מה האתר עוד לא מכסה",
  lede: "אפשרויות חיסכון והשקעה שהאתר מכיר, ועוד אין להן עמוד במדריך. בכל שורה: מה זה, והשאלה שעוד פתוחה.",
  empty: "כרגע לכל מה שהאתר מכיר יש עמוד במדריך.",
  alsoCalled: "נקרא גם",
  covered: { line: "כל סוגי החיסכון וההשקעה שהאתר כן מכסה מופיעים במדריך.", link: "למדריך" },
  /** The link to the source of the row's sentence, right under it. */
  toSource: "למקור",
  /** Why the row has no guide yet: the open question in its own words, or how many when there are several (the fold lists them). */
  openOne: "שאלה פתוחה: {question}",
  openMany: "{n} שאלות עוד פתוחות",
  /** No question left open: what is still missing. */
  remaining: "לכל השאלות יש תשובה; נותר: {list}",
  remainingItems: { record: "נתונים עם מקור", formula: "שיטת חישוב" } as Record<string, string>,
  /** The fold under each row: the rest of what is known. */
  known: "מה כבר ידוע",
  openHeading: "השאלות שעוד פתוחות",
  narrowed: "לחלק מהשאלה כבר יש תשובה, לפי הכללים האלה:", // "…, לפי" before the chip read as cut off
  institution: "יש תשובה של מוסד; האתר מחשב לפיה ומסמן ״לפי החברה״, אבל היא לא סוגרת שאלת מס לצורך מעבר לכיסוי מלא.", // copy.md 7 (D23)
  answeredHeading: "שאלות שכבר יש להן תשובה",
  /**
   * An answered question in words, by the row's id and the rules that answered it joined with a space (the rule base keeps no
   * answered question). Each is the line the question's sheet had; its rules follow as a chip.
   */
  answeredTopics: {
    "savings-policies": {
      "TXA-28": "האם מעבר של פוליסת חיסכון לחברת ביטוח אחרת הוא אירוע מס",
      "INS-25": "תקרה בתקנות לדמי הניהול בפוליסת חיסכון",
      "TXA-08 TXA-28": "האם אפשר להעביר פוליסת חיסכון לחברת ביטוח אחרת",
    },
    "foreign-currency-deposits": { "TXI-25 TX2-01": "המס על פיקדון במטבע חוץ כשהמטבע יורד" },
    "managed-portfolios": { "TX2-15 TX2-17": "איך ממוסה תיק השקעות מנוהל, כולל מע״מ על דמי הניהול" },
    reits: { "RG-07 RG-08": "מה קורה לקרן להשקעות במקרקעין שלא חילקה כנדרש, ומי מאשר את מעמדה" },
    "amendment-190-deposits": {
      "TXA-30": "המקור לתקרות הגיל ולתנאים של גיל 60 ושל שלושה תלושי שכר בהיוון קצבה מוכרת",
      "TXA-19": "האם תקרת ההיוון הפטור כוללת גם היוון של קצבה מוכרת",
    },
  } as Record<string, Record<string, string>>,
  sourceLead: "המקור של ההגדרה:",
  checked: "נבדק ב־{date}",
  rulesLead: "הכללים שנאספו עד עכשיו:",
  // what the site does not compare or do, from product.md section 4; this is by design, not a gap to fill
  wontDo: {
    title: "מה האתר לא משווה ולא עושה",
    lede: "אלה לא חסרים זמניים. האתר בנוי כך, ועל כל זה לא תמצאו כאן תשובה.",
    items: [
      "הלוואות: משכנתאות ואשראי צרכני",
      "ביטוח, חוץ מפוליסות חיסכון ומביטוח מנהלים",
      "בחירת מניות, מסחר ונגזרים",
      "נדל״ן פיזי ומוצרי הון פרטי",
      "דירוג לפי תשואה בעבר",
      "חלוקה אוטומטית של הכסף בין מטרות",
      "ביצוע פעולות: אין כאן קנייה, העברה או הגשת בקשה",
      "חשבון משתמש: אין כניסה, והמידע שלכם נשאר במכשיר",
    ],
  },
} as const;

/** Plain-Hebrew reasons a run can fail with, carried as `messageHe` on a failure result (copy.md 7.1, txh-limit). No engine message reaches the page. */
export const runFailure = {
  employerAboveTotal: "הפקדת המעסיק שהוזנה גבוהה מסך ההפקדה החודשית. בדקו שסכום ההפקדה כולל את חלק העובד וחלק המעסיק.",
  blocked: "החישוב הזה תלוי בשאלה פתוחה, ולכן האתר לא מחשב אותו.",
  figureNotUpdated: "אחד הנתונים בחישוב לא עודכן, ולכן האתר לא מחשב אותו.",
  generic: "האתר לא הצליח להריץ את החישוב עם הערכים שבהנחות.",
} as const;

export const system = {
  calcFailed: "האתר לא הצליח לחשב את הגרף. רעננו את העמוד ונסו שוב.",
  wentWrong: { title: "משהו השתבש", line: "האתר לא הצליח להציג את העמוד הזה. אפשר לרענן, או לחזור לעמוד הראשי.", home: "לעמוד הראשי", reload: "לרענן את העמוד" },
  notFound: { title: "העמוד הזה לא קיים. אולי הקישור ישן.", home: "לעמוד הראשי", search: "לחיפוש" },
  loading: "טוען…",
} as const;

/**
 * The line a link to a page shows when it is pasted in a chat (lib/page-meta.ts), for a page with no line of its own under its
 * title, and the lines made from a page's data. A page that has such a line (a guide's, the documents page's) gives that one.
 */
export const pagePreview = {
  companies: "בתי השקעות, חברות מנהלות ובנקים, ומה כל אחד מציע: גמל, השתלמות ופנסיה, קרנות, מסחר בניירות ערך ופיקדונות.",
  tracks: "כל המסלולים בכל החברות, מוצר אחר מוצר: ממוצע דמי הניהול, החשיפה, התשואה והכסף המנוהל, מנתוני רשות שוק ההון.",
  fees: "מזינים את העמלות של עסקה אחת, כמו שהיא, והאתר מראה מה היא גובה, על מה ומתי.",
  notFound: "בכתובת הזו אין עמוד באתר.",
  /** A company's or a bank's page, after its "מה יש ב…" (companyPage.whatsIn). */
  company: (whatsIn: string) => `${whatsIn}: המוצרים, התנאים והעמלות, עם מקור לכל מספר.`,
  /** A track's page: whose track it is, and in which product when the site knows it. */
  track: (company: string, product: string | null) =>
    `מסלול${product ? ` ${inName(product)}` : ""} של ${company}: ממוצע דמי הניהול ובמה הכסף מושקע, מנתוני רשות שוק ההון.`,
  /** One of the rules page's five questions, with its line (rulesFront.shelves). */
  shelf: (line: string) => `חוקים וכללים: ${line}.`,
  /** A guide or an exposure page whose record has no line of its own. */
  guide: (name: string) => `מה זה ${name}, איך הכסף נכנס ויוצא, המס והעלויות.`,
} as const;

/** Hebrew names of the formulas a sheet names (method.md F-IDs); copy.md 3.8. */
export const formulaNames: Record<string, string> = {
  "A-06": "העלות בתוך הקרן: סכום כל מרכיביה",
  "F-05": "ההפקדות לאורך הזמן",
  "F-06": "ערך בכסף של היום",
  "F-106": "סך ההפקדות בכסף של היום",
  "F-107": "מס אמריקני על דיבידנדים בתוך קרן אירית",
  "F-109": "קנייה ביחידות שלמות, והכסף שמחכה ליחידה",
  "F-110": "התקופות של העסקה: מתי כל עמלה משתנה",
  "F-111": "על מה כל עמלה נגבית, ומה מצטבר יחד",
  "F-112": "הסכומים שהמחירים בעסקה מסמנים",
  "F-113": "מחיר שהוזן מול התקרה",
  "F-114": "המקרה שהעמלה נקראת בו",
  "F-115": "מחיר שמשתנה לפי הגודל, בכל גודל",
  "F-116": "הנחה מהמחיר",
  "F-117": "עמלה של צד שלישי",
  "F-118": "מה שנשאר לפני מס רווחי הון, כשהמס תלוי בשאלה פתוחה",
  "F-08": "חשבון הכסף חודש אחרי חודש",
  "F-09": "השווי במשיכה",
  "F-10": "העלות בתוך הקרן",
  "F-11": "דמי ניהול מהפקדה",
  "F-14": "דמי ניהול פיקדון ניירות ערך",
  "F-15": "דמי ניהול מחיסכון",
  "F-16": "דמי ניהול לחודש",
  "F-20": "מס על חלוקות מקרן או ממניה", // the brokerage guide's "while the money is in" step showed only this code
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
  "F-42": "מגיל שישים: מדרגות המס המופחתות על הרווח", // the kupat gemel lehashkaa lump sum's tax from 60 opens on it
  "F-67": "הגרף בעמודי המדריך",
  // names for the formulas a sheet shows beside its id, so no sheet opens on a bare code
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
  "F-82": "חישוב מחדש של השוואה שנשמרה",
  "F-83": "ספירת המסלולים שנכללו",
  "F-84": "שער חליפין מחושב משערי הבנק המרכזי האירופי",
  "F-85": "הריבית שהכי הרבה בנקים משלמים בעו״ש",
  "F-104": "ספירת תנאי השבירה בפיקדונות שנאספו",
  "F-108": "הריבית הגבוהה מבין ההצעות שהסכום פותח",
  "F-87": "החלק מנכסי המסלול שחשוף למניות",
  "F-88": "החלק מנכסי המסלול שחשוף למטבע חוץ",
  "F-99": "הנכסים של חברה במוצר: סכום הנכסים של המסלולים שלה",
  "F-100": "טווח דמי הניהול בקבוצה, וסדר הקבוצות לפי החשיפה למניות",
  "F-89": "כמה שינוי באחוז ממספר אחד משנה את מה שנשאר",
  "F-90": "מה נשאר בסוף כשכל מספר משתנה באותו אחוז",
  /** the index pages ("חישוב של האתר F-92" says nothing; an id stands beside words, never alone) */
  "F-91": "העלות לפי מי שגובה אותה: החשבון, הקרן והמדינה",
  "F-92": "חישוב הפער של הקרן מהמדד, לפי הדוחות שלה",
  "F-105": "דמי הניהול לפי התעריפונים של כל המנהלים",
  "F-93": "השינוי בשער הדולר מול השקל בשנים שעברו",
  "F-94": "עם נטרול מט״ח או בלי: ההפרש לפי שער הדולר",
  "F-95": "מה עשו הקרנות מכל סוג באותן שנים",
  "F-96": "הכסף בקרן השתלמות, שלב אחרי שלב",
  B3: "אפשרות שהכסף בה נעול עד סוף התקופה",
  /** Shown when a formula has no name above: no code in place of words. */
  _other: "חישוב של האתר",
};

/**
 * The key to each formula's symbols on its sheet: for
 * every formula docs/method.md writes as math ($`…`$), what each symbol stands for, its TeX as in the formula; and, when the entry has more
 * than one formula, a name for each, in the entry's order. `lib/formula-tex.test.ts` keeps this and method.md in step.
 */
export const formulaKeys: Record<string, { lines?: string[]; symbols: [tex: string, words: string][] }> = {
  "F-05": {
    lines: ["כשההפקדה עולה עם האינפלציה, כך שבכסף של היום היא קבועה", "כשההפקדה קבועה בשקלים"],
    symbols: [
      ["C_m", "ההפקדה בכל חודש, בשקלים של אותו חודש"],
      ["C", "ההפקדה החודשית בתוכנית, בכסף של היום"],
      ["I_m", "מדד המחירים באותו חודש, ביחס להיום (היום הוא 1)"],
    ],
  },
  "F-106": {
    symbols: [
      ["P", "סך ההפקדות, בכסף של היום"],
      ["C_0", "הסכום שמפקידים היום"],
      ["C", "ההפקדה החודשית, בכסף של היום"],
      ["n", "מספר השנים"],
    ],
  },
  "F-107": {
    symbols: [
      ["w", "המס האמריקני על הדיבידנדים, כחלק מהקרן בשנה"],
      ["\\rho", "שיעור המס האמריקני על דיבידנד לקרן אירית"],
      ["y_{US}", "תשואת הדיבידנד של המניות האמריקניות במדד"],
      ["s_{US}", "משקל המניות האמריקניות במדד (1 במדד של חברות אמריקניות בלבד)"],
    ],
  },
  "F-06": {
    lines: ["סכום בכסף של היום", "סכום שלא גדל, בכסף של היום בסוף התקופה", "מה שהופקד, בכסף של היום"],
    symbols: [
      ["V", "סכום בשקלים של אותו חודש"],
      ["I_m", "מדד המחירים באותו חודש, ביחס להיום (היום הוא 1)"],
      ["I_T", "מדד המחירים בסוף התקופה, ביחס להיום"],
      ["P", "מה שהופקד, בכסף של היום"],
      ["C_0", "הסכום שמפקידים היום"],
      ["C_m", "ההפקדה בכל חודש, בשקלים של אותו חודש"],
      ["T", "מספר החודשים בתוכנית"],
    ],
  },
  "F-60": {
    symbols: [
      ["M", "כמה עולה לכם בחודש להשאיר את הכסף בעו״ש"],
      ["B", "הסכום בעו״ש, בלי החלק שצריך להישאר זמין"],
      [String.raw`r_{\text{cc}}`, "הריבית השנתית בעו״ש, אחרי המס על הריבית"],
      [String.raw`r_{\text{alt}}`, "התשואה השנתית נטו באפשרות נזילה אחרת: קרן כספית, פיקדון לחודש או מק״מ"],
    ],
  },
  "F-84": {
    symbols: [
      ["S_c", "כמה שקלים עולה יחידה אחת של המטבע"],
      [String.raw`E_{\text{ILS}}`, "כמה שקלים שווה אירו אחד, לפי שער הייחוס של הבנק המרכזי האירופי"],
      ["E_c", "כמה יחידות של המטבע שווה אירו אחד, באותו יום"],
    ],
  },
  "F-87": {
    symbols: [
      ["s", "החלק מנכסי המסלול שחשוף למניות, באחוזים"],
      ["E", "הסכום שחשוף למניות, לפי דיווח המסלול לרשות שוק ההון"],
      ["A", "כל הנכסים של המסלול, באותו דיווח"],
    ],
  },
  "F-88": {
    symbols: [
      ["c", "החלק מנכסי המסלול שחשוף למטבע חוץ, באחוזים"],
      ["X", "הסכום שחשוף למטבע חוץ, לפי דיווח המסלול לרשות שוק ההון"],
      ["A", "כל הנכסים של המסלול, באותו דיווח"],
    ],
  },
  "F-93": {
    lines: ["שער הדולר בסוף כל חודש", "השינוי בשער בשנה קלנדרית", "השינוי הממוצע לשנה, בכל תקופה באורך התוכנית"],
    symbols: [
      ["r_t", "כמה שקלים עלה דולר אחד בסוף חודש"],
      [String.raw`\text{ILS}_t`, "כמה שקלים היה שווה אירו אחד באותו יום, לפי שער הייחוס של הבנק המרכזי האירופי"],
      [String.raw`\text{USD}_t`, "כמה דולרים היה שווה אירו אחד באותו יום"],
      [String.raw`r_{\text{Dec}(y)}`, "השער בסוף דצמבר של השנה"],
      [String.raw`r_{\text{Dec}(y-1)}`, "השער בסוף דצמבר של השנה הקודמת"],
      ["H", "מספר השנים בתוכנית"],
      ["r_{t+12H}", "השער בסוף התקופה, אחרי מספר השנים בתוכנית"],
    ],
  },
  "F-99": {
    symbols: [
      ["S", "הנכסים של החברה במוצר: הסכום של כל המסלולים שלה בו"],
      ["A_i", "הנכסים של מסלול אחד של החברה, בסוף החודש שדווח לרשות שוק ההון"],
    ],
  },
};

/** What each engine flag means, in one line (method.md §12); copy.md 3.8. The code stays beside the words. */
export const flags: Record<string, string> = {
  // F-107 at TXF-16's rate, which a fund obtains only if it passes the treaty's limitation-on-benefits article (TXF OQ7, method G-33)
  "TXF-OQ7": "המס האמריקני על הדיבידנדים בתוך הקרן חושב לפי השיעור שהאמנה בין ארצות הברית לאירלנד קובעת לקרן אירית. הקרן מקבלת את השיעור הזה רק אם היא עומדת בתנאי האמנה, ועוד לא נבדק אם הקרן הזו עומדת בהם. אם לא, המס הזה יכול להיות גבוה יותר, ויישאר לכם פחות.",
  "G-14": "הוצאות ישירות של המסלול לא נאספו עדיין, ולכן לא נכללו בחישוב.",
  // F-119: an s.120ב amount read for a year after its freeze; TXG OQ16 (the rounding, the CPI readings, the unrounded 2024 amount) keeps it from being exact
  // the person's income stays as entered (A-12, A-13), and the figures linked to the average wage stay at 2026's (method G-36); a fall of the CPI is TXG OQ17,
  // run under each of its readings (method §13)
  "G-36": "מ־2028 החישוב מעלה כל שנה, לפי האינפלציה שבחישוב, את מדרגות המס, את הסף של המס הנוסף ואת הסכומים שהחוק הקפיא עד 2027 בהטבות על ההפקדות. ההכנסה שלכם נשארת בחישוב כפי שהזנתם, ולכן עם השנים חלק גדול יותר ממנה נופל במדרגות הנמוכות. סכומים שצמודים לשכר הממוצע נשארים כמו ב־2026, כי האתר לא מניח איך השכר הממוצע ישתנה. לא ידוע איך רשות המסים תעגל את הסכומים ולפי אילו מדדים, ולכן הסכומים המדויקים יכולים להיות שונים במעט. גם לא ידוע אם הסכומים יורדים כשהמדד יורד. באינפלציה שלילית החישוב נעשה בכל אחת מהאפשרויות, ואם התוצאות שונות, אין חישוב לשנים שאחרי 2027.",
  // an open reading every reading of which gave the same run (method §13, `acrossReadings`): F-119 at a falling CPI (TXG OQ17)
  "TXG-OQ17": "הסכום כאן לא תלוי בשאלה שהחוק משאיר פתוחה. המדד יורד בחישוב הזה, והחוק לא אומר מה ירידה כזו עושה מ־2028 למדרגות המס ולסכומים שהוקפאו עד 2027: אם הם יורדים, נשארים כמו שהיו, או שהירידה מתקזזת מעלייה מאוחרת יותר. החישוב נעשה בכל אחת מהדרכים, ובכולן יצא אותו סכום.",
  // the same for F-120 at a falling CPI: KGL-03's yearly ceiling (KGL OQ15, proposed to the rule base)
  "KGL-OQ15": "הסכום כאן לא תלוי בשאלה שהחוק משאיר פתוחה. המדד יורד בחישוב הזה, והחוק לא אומר מה ירידה כזו עושה לתקרת ההפקדה השנתית לקופת גמל להשקעה: אם היא יורדת, נשארת כמו שהייתה, או שהירידה מתקזזת מעלייה מאוחרת יותר. החישוב נעשה בכל אחת מהדרכים, ובכולן יצא אותו סכום.",
  // A-30: a yearly cap on deposits reached in the run date's tax year, which the run starts with nothing deposited (method F-01)
  "A-30": "החישוב מניח שלא הפקדתם עוד מתחילת השנה, ולכן התקרה השנתית של השנה הזו נשארת כולה להפקדות מהיום ועד סוף השנה. הפקדות שכבר עשיתם השנה נספרות באותה תקרה ומקטינות אותה.",
  "G-16": "בסוף התקופה יש כסף בפיקדון שעוד לא הסתיים. החישוב מחשיב אותו כאילו הפיקדון הסתיים באותו יום, עם הריבית שנצברה עד אז, ולא מחשב שבירת פיקדון. בפיקדון שאי אפשר לשבור, הכסף משתחרר רק כשהפיקדון מסתיים או בתחנת יציאה, ולכן הסכום כאן יכול להיות גבוה ממה שאפשר למשוך באותו יום.", // F-41: the run prices a piece inside its term at the horizon as matured and prices no break; an unlinked piece at an exit point takes G-34 instead (method G-16)
  "G-34": "הסכום שמקבלים יכול להיות שונה מהסכום כאן, כי בסוף התקופה יש כסף בפיקדון שעוד לא הסתיים, והחישוב מניח שמושכים אותו אז בתחנת יציאה עם כל הריבית שנצברה. תחנת יציאה היא מועד שבו אפשר למשוך בלי לשבור את הפיקדון, אבל מה משלמים בה, ואם צריך להודיע מראש, קובע כל בנק בתנאי הפיקדון.", // F-41: an unlinked piece at an exit point on the last day is priced with interest to date; it can be withdrawn there without a break (BANK-27); what an exit point pays and the notice it needs are each product's terms, not in the records, and a product may pay less or more (BANK OQ20, method G-34)
  "G-21": "חלק מהמס מוסדר דרך דוח שנתי, לא בניכוי במקור.",
  "PF-13": "בחישוב, ההנחה בדמי הניהול נמשכת {PF-13:min_discount_years}, התקופה הקצרה ביותר שחוזר רשות שוק ההון מתיר, גם אם החברה כתבה תקופה קצרה יותר.",
  // D87, now the cautious reading (guidelines/research.md step 6): one deposit and no more, the run ends the discount after six months (PF OQ18)
  "PF-OQ18": "בחישוב, ההנחה בדמי הניהול מסתיימת {PF-14:months_after_deposits_stop} אחרי ההפקדה, ומשם דמי הניהול הם בלי ההנחה. חוזר של רשות שוק ההון מתיר להעלות דמי ניהול {PF-14:months_after_deposits_stop} אחרי שההפקדות נפסקות, ועוד לא נמצא אם זה חל על מי שהפקיד פעם אחת בלבד. אם לא, ההנחה תימשך, והתוצאה תהיה גבוהה יותר.",
  "G-23": "נקודות הזיכוי לא הופחתו מהמס הזה. נקודות זיכוי מקטינות את כל המס המחושב בשנה, גם את המס על רווחים ועל ריבית בשיעור מיוחד, ולכן הן משנות את התוצאה רק כשהן גדולות מהמס על שאר ההכנסה שלכם באותה שנה, למשל בשנה בלי משכורת. מס שכבר נוכה במקור חוזר רק דרך דוח שנתי או בקשת החזר מס. האתר לא יודע כמה נקודות זיכוי יש לכם.", // TXG-05; the refund of tax withheld is TXG-25; method G-23 names the input it would need
  // F-31, F-32: the s.45A credit is capped at the year's tax, the rest lost on the cautious reading (TXP-01, TXP OQ20); that tax leaves out
  // credit points, which the engine has no input for (method G-23), so this line carries what G-23 means for the credit
  "TXP-OQ20": "הזיכוי כאן הוא עד גובה מס ההכנסה שלכם באותה שנה. לא נמצא חוק שמחזיר את החלק שמעל המס או מעביר אותו לשנים הבאות, ולכן החישוב מניח שהחלק הזה הולך לאיבוד. המס שחושב הוא בלי נקודות הזיכוי שלכם, כי האתר לא יודע כמה יש לכם. אם המס שאתם משלמים נמוך מהזיכוי, תקבלו פחות מהסכום כאן.",
  "CS-18": "דמי הניהול אחרי גיל עשרים ואחת חושבו לפי התקרה שבתקנות, ולכן הם ״עד״: בקופה שלכם השיעור יכול להיות נמוך יותר.", // the child-savings fee after 21 runs on CS-18's cap unless the person enters a rate (F-54)
  "TXK-06": "בחישוב הזה לא מגישים דוח שנתי או בקשת החזר מס, ולכן המס הוא מה שהחברה המנהלת מנכה במקור: {TXK-26:withholding_on_gains} מהרווח הריאלי. למי שמלאו לו {TXG-04:age} מדרגות המס המופחתות חלות קודם על הרווח, ומי שמגיש דוח או בקשת החזר יכול לקבל חלק מהמס בחזרה.", // F-44 applies the brackets (F-42); the flag marks only a run with the refund not claimed (A-14 off). The manager withholds 25% of the gains (TXK-26, Tax Authority file 856), so the flat rate is what is withheld, not an upper bound
  "TXK-26": "בחישוב הזה מגישים דוח שנתי או בקשת החזר מס. החברה המנהלת מנכה במקור {TXK-26:withholding_on_gains} מהרווח הריאלי. למי שמלאו לו {TXG-04:age} מדרגות המס המופחתות חלות קודם, ועל חלק הרווח שהמדרגה שלו נמוכה מזה מקבלים את ההפרש בחזרה אחרי הדוח. המספר כאן הוא המס אחרי ההחזר.", // the kupat gemel lehashkaa exit from 60 settles against the manager's withholding (TXK-26), not G-21 (a bank's or TASE member's withholding). That withholding is 25% of the gains (Tax Authority file 856), the maximum rate of TXK-06, so no part is above it
  "BANK-35": "מ{BANK-35:account_fee_up_to_2_actions.from} הסכום כאן יכול להיות גבוה מדי. צו של נגיד בנק ישראל קובע אז תקרה לדמי הניהול של חשבון עו״ש לפי מספר הפעולות בחודש, ובחשבון עם עד שתי פעולות בחודש התקרה נמוכה מדמי הניהול שנספרו כאן. עוד לא ידוע איך הכללים החדשים סופרים פעולה, ולכן החישוב משאיר את דמי הניהול של היום לכל התקופה.", // D64: F-102 keeps the price list's minimum; the engine flags the month the cap starts where a counted minimum is above the cap for 0 to 2 actions
  "G-32": "הסכום שנגבה על כל דיבידנד בשביל הגוף ששומר את ניירות הערך בחו״ל לא הופחת מהרווח במכירה. החוק מפחית מהרווח את דמי המשמרת של שנת המכירה, ועוד לא ברור אם גם הסכום הזה נחשב דמי משמרת. אם כן, המס כאן מעט גבוה מדי.", // D67: F-103 stays out of the sale gain; the engine flags a charge in the exit tax year (method G-32)
  "TXP-11": "הפקדת המעסיק לפיצויים עוברת את תקרת הפיצויים, שנבדקת כל חודש: החלק שמעל התקרה הוא הכנסת עבודה כבר במועד ההפקדה, והאתר עוד לא מחשב את המס עליו.", // the monthly test is circular 4/2019 s.2.1.1 (TXP-11); the engine flag had been the open question
};

/** Labels of the values a computation reads, shown in the number sheet (copy.md 3.8 "ערכים שנכנסו לחישוב"). */
export const computedInputs = {
  /** A printed fee's period, as the value of `names.period` on the sheet of F-17's monthly sum. */
  periods: { month: "חודש", quarter: "רבעון", year: "שנה" },
  /** Hebrew names for the input keys the engine and the site's lifts write in English; a key not here (already Hebrew) is shown as written */
  names: {
    amount: "הסכום שנבדק",
    stock_market_exposure: "החשיפה לשוק המניות",
    foreign_currency_exposure: "החשיפה למטבע חוץ",
    total_assets: "סך נכסי המסלול",
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
  taxAtExit: "מס במשיכה",
  fees: "דמי ניהול",
  // a run on a tariff: commissions and custody beside a fund's own fee
  feesTariff: "עמלות ודמי ניהול",
  about: {
    headline: "מה שנשאר אחרי דמי ניהול ומס, אם מושכים בסוף התקופה",
    headlineTariff: "מה שנשאר אחרי עמלות, דמי ניהול ומס, אם מושכים בסוף התקופה",
    net: "מה שנשאר אם מושכים בסוף שנה",
    tax: "המס אם מושכים בסוף שנה",
    fees: "דמי הניהול שנגבו עד סוף שנה",
    feesTariff: "העמלות ודמי הניהול שנגבו עד סוף שנה",
    contributions: "כל מה שהפקדתם עד סוף שנה",
    realGain: "הרווח שמעבר לעליית המחירים, עד סוף שנה",
  },
} as const;

/** Fixed lines of the guide's key-value, fee and tax blocks, keyed by what the record says; copy.md 3.5a. */
export const guideBlocks = {
  // what the rule base found on withdrawals; each figure is a Num on the page
  withdrawal: {
    daysCount: { label: "מתי מתחילים לספור את הימים", value: "מבקשה מלאה, לא מהבקשה הראשונה. עיכוב בגלל פרטים שחסרו בבקשה לא נחשב איחור." },
    unlawful: { label: "בקשה למשוך שלא כדין", before: "לפני התשלום הקופה חייבת לקיים שיחת שירות, או, בסכום של עד", after: ", לשלוח הודעה דיגיטלית. היא משלמת רק אחרי אישור מפורש שלכם." },
    lowIncome: { label: "משיכה בלי ניכוי מס בגלל הכנסה נמוכה", before: "עד ההפרש בין ההכנסה שלכם ושל בן או בת הזוג, מכל מקור, כולל הכנסות פטורות, לבין", one: "בחודש, או", after: "בחודש למי שיש לו ילד מתחת לגיל 18. ההצהרה היא על אחד משני החודשים שלפני הבקשה, ותקפה לאותו חודש ולשני החודשים שאחריו.", wageBefore: "הסכומים הם שכר המינימום לחודש", wageFrom: "מ־", wageAfter: ", ופעמיים שכר המינימום. הם משתנים כששכר המינימום משתנה, ב־1 באפריל של כל שנה." },
  },
  ceiling: {
    perYearAll: "לשנה, לכל אדם בכל הקופות יחד",
    taxYear: "שנת המס",
    // one line per `ceiling.per` value the records use (the year line is the one above)
    per: {
      person_per_calendar_year: "לשנה, לכל אדם בכל הקופות יחד",
      person_per_month: "לחודש, לכל אדם",
      // the regulation caps the index-tracking money, the pension or savings test's and a new account's, less capital money (IRA-07 (ב))
      person_total_across_all_ira_accounts: "בסך הכול, לכל אדם בכל חשבונות הניהול האישי יחד, על חלק מסוגי הכסף",
      person_total_across_all_study_fund_accounts: "בסך הכול, לכל אדם בכל חשבונות קרן ההשתלמות יחד",
    } as Record<string, string>,
    labelTotal: "תקרה על הסכום הכולל",
  },
  exit: {
    anyTime: "בכל עת, את כל הכסף או חלק ממנו",
    labelWithdraw: "משיכה",
    labelFree: "מתי הכסף פנוי",
    // an exit at an age is when a pension may start (PEN-26, PEN-30), not when the money is free: only some of it may be drawn before
    labelAtAge: "מתי אפשר להתחיל לקבל קצבה",
    labelDays: "תוך כמה זמן הכסף אצלכם",
    upTo: "עד",
    businessDays: "ימי עסקים",
    // a payout time that only one company was read for (D30): the company is named, the others were not checked
    onlyAt: { before: "כך אצל", after: "; אצל האחרים לא נבדק" },
    labelSwitch: "מעבר בין מסלולים וקופות", // was "מעבר בין מסלולים"; the lines under it also cover moving to another fund, a pension fund or another company
    labelCeiling: "תקרת הפקדה",
    // one line per `lawful_exit.kind` (data-schema 3.3); each number is a Num on the page; copy.md 3.5a
    atMaturity: "בסוף התקופה שנקבעה בהסכם",
    atMaturityTerm: { before: "בתום", after: "" },
    afterYears: { before: "כשעוברות", after: "מההפקדה הראשונה" },
    atAge: { before: "מגיל", after: "" },
    atChildAge: { before: "כשהילד מגיע לגיל", after: "" },
    tradingDay: "בכל יום מסחר, במחיר של אותו יום",
    otherKind: "לפי התנאים שבחוקים ובכללים",
  },
  fees: {
    balance: { name: "דמי ניהול מחיסכון", base: "כל שנה, מכל הכסף שנצבר", after: "בשנה" },
    // a fund's own management fee (units of a fund, MF-16): the manager's yearly percentage, inside the unit price
    balanceFund: { name: "דמי ניהול", base: "כל שנה, מנכסי הקרן, בתוך מחיר היחידה", after: "בשנה" },
    deposit: { name: "דמי ניהול מהפקדה", base: "מכל סכום שמפקידים", after: "מכל הפקדה" },
    direct_expenses: { name: "הוצאות ישירות", base: "נוספות על דמי הניהול: עלויות כמו קנייה ומכירה של ההשקעות, מהקופה", cap: "לא נמצאה תקרה כוללת" },
    exit: { name: "דמי יציאה", base: "כשמושכים", cap: "לא גובים" },
    // the other fee bases of the schema (`feeBase`), name and what they are charged on; copy.md 3.5a
    trade: { name: "עמלת קנייה ומכירה", base: "מכל פעולת קנייה או מכירה" },
    custody: { name: "דמי ניהול פיקדון ניירות ערך", base: "כל תקופה, על ניירות הערך שבחשבון" },
    fx: { name: "המרת מטבע", base: "מכל המרה של שקלים למטבע זר או חזרה" },
    fixed_period: { name: "דמי חשבון קבועים", base: "כל חודש או רבעון, בלי קשר לסכום" },
    distribution_handling: { name: "טיפול בריבית ובדיבידנד", base: "מכל תשלום ריבית או דיבידנד שנכנס לחשבון" },
    spread: { name: "מרווח קנייה ומכירה", base: "בכל קנייה ומכירה בבורסה, כחלק מהמחיר" },
    creation_redemption: { name: "עמלת יצירה ופדיון", base: "כשההזמנה עוברת למנהל הקרן ולא לבורסה" },
    transfer_out: { name: "העברה החוצה", base: "כשמעבירים את הכסף למוסד אחר" },
    corporate_event: { name: "עלות לכל אירוע חברה", base: "על כל אירוע חברה, כמו דיבידנד, בנייר ערך שמוחזק בחו״ל" },
    load: { name: "הוספה", base: "נוסף על מחיר היחידה בקנייה, והולך למנהל הקרן ולא לקרן" },
    redemption_deduction: { name: "ניכוי בפדיון", base: "ממחיר הפדיון, רק אם הסכם הקרן קובע ניכוי כזה" },
    variable_management: { name: "דמי ניהול משתנים", base: "לפי הפער בין הקרן למדד, נוסף על דמי הניהול הקבועים; כשהקרן מפגרת אחרי המדד, המנהל משלם לה" },
    trustee: { name: "שכר נאמן", base: "כל שנה, מנכסי הקרן, בתוך מחיר היחידה" },
    insurance_premium: { name: "דמי ביטוח", base: "כל חודש, מהחיסכון, על כיסוי למקרה מוות או נכות" },
    upTo: "עד",
    zeroCap: "לא גובים",
    // a record's empty cap: no cap was found in the law and the rules read, which is as sure as the rule base is (MF-20: "No cap found")
    noCap: "לא נמצאה תקרה בחוק",
    // a cap that binds some providers only (the record's `binds`): the cell names them, and the line under it says what holds elsewhere
    bindsLead: { banks: "בבנק:", banks_and_fund_distributors: "בבנק:" } as Record<string, string>,
    bindsOthers: {
      banks: "בבית השקעות לא נמצאה תקרה בחוק.",
      banks_and_fund_distributors: "גם מפיץ של הקרן שאינו משווק השקעות, ויש לו הסכם הפצה איתה, לא רשאי לגבות. בבית השקעות שהוא משווק השקעות, כמו רוב בתי ההשקעות, לא נמצאה תקרה בחוק.",
    } as Record<string, string>,
    // the case a cap holds in alone (the record's `caveat`)
    caveat: {
      closing_account: "כשסוגרים את החשבון ומעבירים את ניירות הערך לחשבון שלכם בגוף אחר, ועוד הוצאות צד שלישי.",
      distribution_agreement: "בנק, או מפיץ אחר של הקרן שאינו משווק השקעות, לא רשאי לגבות מכם על קנייה, החזקה או פדיון של היחידות כשיש לו הסכם הפצה עם הקרן.",
    } as Record<string, string>,
    // SW-33: while the account stays open, the supervised price
    openTransfer: { before: "כשהחשבון נשאר פתוח: עד", after: "ועוד מה שהבנק שילם לצד שלישי." },
    // a line under a cap that its record states in its notes only, by guide and fee base
    capNote: {
      "brokerage-account": { custody: "בבנק לא גובים אותם על מק״מ ועל יחידות של קרן כספית." },
    } as Record<string, Record<string, string>>,
    tariffSet: "לפי התעריפון של הגורם המציע",
    unitAfter: { pct_per_year: "בשנה", pct_of_deposit: "מכל הפקדה", pct_of_trade: "מכל פעולה", pct_of_balance_per_period: "בכל תקופה", nis_per_month: "בחודש", nis_per_trade: "לכל פעולה", nis: "", pct: "" } as Record<string, string>,
  } as Record<string, any>,
  taxSteps: {
    "F-33": { headline: "אין הטבת מס", text: "מפקידים מכסף שכבר שולם עליו מס." },
    "F-27": { headline: "אין מס על הרווחים", text: "גם מעבר בין מסלולים לא ממוסה.", textSwitchOpen: "המס משולם רק כשמושכים את הכסף." },
    "F-44": { before: "עד", after: "מהרווח הריאלי", text: "כלומר מהרווח שמעבר לעליית המחירים." },
    // every other formula a wrapper record may name (method.md 5 to 9); one headline and one sentence each; copy.md 3.5a
    "F-20": { headline: "מס על חלוקות מקרן או ממניה", text: "על כל דיבידנד או חלוקה משלמים מס כשהם משולמים. החישוב מניח שהסכום נטו מושקע מחדש. בקרן שהיא עצמה חייבת במס, הקרן משלמת את המס ולא אתם." },
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
    "F-46": { before: "כשעוברות", after: "שנים מההפקדה הראשונה, אין מס", text: "גם על ההפקדות וגם על הרווח, חוץ מרווח על כסף שהופקד מעל הגבול." },
    "F-47": { headline: "משיכה מוקדמת מקרן השתלמות" },
    "F-48": { headline: "משיכה מוקדמת מפנסיה" },
    "F-49": { headline: "קצבה בפרישה" },
    "F-50": { headline: "חיסכון לכל ילד: מס על הרווח במשיכה", text: "ההפקדות, התוספת מההורה והמענקים לא נחשבים הכנסה. המס מנוכה במשיכה, ורק על הרווח." },
    "F-51": { headline: "ניהול אישי: המס לפי סוג הקופה", text: "חשבון בניהול אישי ממוסה לפי סוג הקופה שהוא אושר כמוה: קרן השתלמות כמו קרן השתלמות, קופה לקצבה כמו קופה לקצבה." },
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
    // TXI-02: the tax is "not exceeding" the rate, and the bank withholds all of it (TXI-08); lower brackets can apply (TXI-19)
    linkedInterestCeiling: { before: "ריבית צמודה למדד: עד", after: "מהריבית הריאלית. הבנק מנכה את מלוא השיעור, ולמי שזכאי למדרגות מס נמוכות יותר המס יכול להיות נמוך יותר" },
    linkedInterest: { before: "ריבית צמודה למדד:", after: "מהריבית הריאלית, מנוכה בבנק" },
    hishtalmutExcess: { before: "על הרווח הזה: עד", after: "מהחלק שמעל האינפלציה" },
    childProvident: { before: "במסלול קופת גמל: עד", after: "מהרווח הריאלי" },
    childBankLinked: { before: "בבנק, פיקדון צמוד למדד: עד", after: "מהרווח הריאלי" },
    childBankUnlinked: { before: "בבנק, פיקדון לא צמוד:", after: "מהרווח הנומינלי" },
  } as Record<string, { before: string; after: string }>,
  /** Shown on a tax step whose formula the site does not compute yet. */
  notComputed: { text: "האתר עוד לא מחשב את זה", releaseBefore: "יתווסף בגרסה", releaseAfter: "" },
  regulatorNames: { CMA: "רשות שוק ההון, ביטוח וחיסכון", BoI: "בנק ישראל", ISA: "רשות ניירות ערך", MoF: "משרד האוצר" } as Record<string, string>,
  /** What each figure of a provident guide's list-fee range is (F-105), for its number sheet. */
  listRange: {
    about: {
      low: "השיעור הנמוך ביותר שכתוב במסמכים של החברות המנהלות שנאספו",
      managers: "כמה חברות מנהלות שדמי הניהול שלהן נאספו מהמסמכים שלהן",
      atCap: "אצל כמה מהחברות האלה כתובה במסמכים רק התקרה שבתקנות",
      capInput: "התקרה שבתקנות",
    },
  },
  /** The product terms an illustrative run read (values sheet and panel). */
  terms: {
    title: "תנאי המוצר בדוגמה",
    line: "הערכים האלה נלקחו מהנתונים של האתר. אי אפשר לשנות אותם מכאן.",
    // copy.md 10.3: the word is "תעריפון"; a managing company's example takes its management fees, not a tariff
    whose: "התנאים והתעריפון בדוגמה הם של",
    // a deposit's example reads the bank's deposit terms and no tariff
    whoseDeposit: "התנאים בדוגמה הם של",
    whoseManager: "דמי הניהול בדוגמה הם של",
    // a money-market fund's example: the fund's own fees are its manager's, and the trade and custody lines are the bank route's (MF-26, BANK-18)
    whoseFund: "דמי הניהול של הקרן בדוגמה הם של",
    bankRoute: "הדוגמה מניחה שהקרן נקנית דרך בנק שיש לו הסכם הפצה איתה, ובנק כזה לא גובה עליה עמלת קנייה ומכירה ודמי ניהול פיקדון.",
    // a fee of the fund the record could not collect: the run counts it as 0
    notCollected: "לא נאסף, ולכן לא נכלל בחישוב",
    // a deposit's own term, in place of the label "תקופה", which on the same card names the years the chart runs
    depositTerm: "תקופת הפיקדון",
    // after a custody rate or bound charged per period, by the months in the period: "0.03% ברבעון", never a bare "0.03%"
    perPeriod: { 1: "בחודש", 3: "ברבעון", 6: "בחצי שנה", 12: "בשנה" } as Record<number, string>,
    // F-80, F-86: the example rests on the site's pick over every collected institution, never on one bank as the general case
    pick: {
      accountCount: "כמה בנקים ובתי השקעות שהתעריפון שלהם נאסף ושהאתר מחשב בשבילם את הדוגמה",
      /** Among a count's inputs, a house's document after the first it is priced on (a provident manager's bylaws). */
      moreDocument: (name: string, n: number | null) => (n === null ? `${name}, מסמך נוסף` : `${name}, מסמך נוסף ${n}`),
      account: { before: "הבחירה של האתר: מבין", after: "הבנקים ובתי ההשקעות שנאספו, התעריפון הזה משאיר לכם הכי הרבה כסף בתוכנית לדוגמה. אצל האחרים העמלות שונות." },
      // F-80, P-01: houses within the tie threshold of the top; the example runs on the first and crowns none
      tied: { before: "מבין", middle: "הבנקים ובתי ההשקעות שנאספו, התעריפונים של", and: "ושל", tie: "שקולים בתוכנית לדוגמה: ההפרש ביניהם קטן מסף התיקו של האתר", after: "ולכן האתר לא בוחר ביניהם. הדוגמה מחושבת לפי התעריפון של", end: "אצל האחרים נשאר לכם פחות." },
      managerCount: "כמה חברות מנהלות שדמי הניהול שלהן נאספו מהמסמכים שלהן",
      // "cheapest" is by what the documents say; most companies write only the cap and set the price in each member's agreement
      // "אצלה נשאר הכי הרבה" read as the most staying with the company; the savers are named
      manager: { before: "הבחירה של האתר: מבין", after: "החברות המנהלות שדמי הניהול שלהן נאספו, במסמכים של החברה הזו כתובים דמי הניהול הנמוכים ביותר, גם מחיסכון וגם מהפקדה. לכן בתוכנית לדוגמה נשאר לחוסכים בחברה הזו הכי הרבה כסף. בהסכם אישי חברה אחרת יכולה לגבות פחות." },
      // F-80: managers whose prices are the same in every month; the example runs on the first and crowns none
      managerTied: { before: "מבין", middle: "החברות המנהלות שדמי הניהול שלהן נאספו, דמי הניהול של", and: "ושל", after: "הם הנמוכים ביותר ושווים זה לזה, ולכן האתר לא בוחר בין החברות. הדוגמה מחושבת לפי דמי הניהול של", end: "בהסכם אישי חברה אחרת יכולה לגבות פחות." },
      // A-19, F-16: a printed rate under the bylaws' cap is a discount that lasts at least PF-13's period and may then rise to the cap
      // D83: the period below is the regulator's minimum (discount) or the company's own longer one (discountOwn); PF-14's
      // earlier end is said in words, and the example's assumption that it does not come (A-19)
      // PF OQ18: whether one deposit and no more counts as deposits stopping is open, said between the earlier end and the rest
      // the earlier ends are said once, in the note under the fee table; here only that the example assumes none comes
      // "נמשכת את כל תקופת ההנחה" said nothing; the example assumes the discount does not end early
      discount: "דמי ניהול נמוכים מהתקרה שבתקנון הם הנחה. רשות שוק ההון מחייבת לתת את ההנחה לפחות לתקופה שכתובה למטה, חוץ ממקרים שהיא מונה. הדוגמה מניחה שההנחה לא מסתיימת לפני הזמן, ושבסופה דמי הניהול עולים לתקרה.",
      discountOwn: "דמי ניהול נמוכים מהתקרה שבתקנון הם הנחה. לפי מסמכי החברה ההנחה נמשכת לאורך התקופה שלמטה, יותר זמן ממה שרשות שוק ההון מחייבת. הדוגמה מניחה שההנחה לא מסתיימת לפני הזמן, ושבסופה דמי הניהול עולים לתקרה.",
      deposit: { before: "הדוגמה היא הפיקדון האמצעי מבין", after: "הפיקדונות הרגילים לשנה שנאספו ושאי אפשר לשבור אותם, אחד מכל בנק. היא לא הריבית הגבוהה בשוק ולא בחירה של האתר." },
    },
    labels: {
      listBalance: "דמי ניהול מחיסכון",
      listDeposit: "דמי ניהול מהפקדה",
      discountBalance: "דמי ניהול מחיסכון בתקופת ההנחה",
      discountDeposit: "דמי ניהול מהפקדה בתקופת ההנחה",
      // "לפחות 5 שנים" beside the earlier ends read as a contradiction; the example runs exactly this period (A-19)
      // "אחרי ההנחה, עד" made 1.05% read as a fixed rate; the label says it is the most the company may charge
      discountYears: "תקופת ההנחה בדוגמה",
      discountMonths: "תקופת ההנחה",
      // Hebrew editor: the glossary's fee names, as the labels above them, with "לכל היותר" to say it is a most
      afterBalance: "דמי ניהול מחיסכון אחרי תקופת ההנחה, לכל היותר",
      afterDeposit: "דמי ניהול מהפקדה אחרי תקופת ההנחה, לכל היותר",
      term: "תקופה",
      linkage: "הצמדה",
      couponEvery: "תדירות הקופון",
      balanceCeiling: "תקרת היתרה שנושאת ריבית",
      tradeRate: "עמלת קנייה ומכירה",
      tradeMin: "עמלת קנייה ומכירה, מינימום",
      tradeMax: "עמלת קנייה ומכירה, מקסימום",
      tradeFlat: "עמלה קבועה לפעולה קטנה",
      tradeFlatUpTo: "העמלה הקבועה חלה על פעולה עד",
      redeemRate: "עמלת פדיון",
      redeemMin: "עמלת פדיון, מינימום",
      redeemMax: "עמלת פדיון, מקסימום",
      redeemFlat: "עמלה קבועה לפדיון קטן",
      redeemFlatUpTo: "העמלה הקבועה חלה על פדיון עד",
      standingRate: "עמלת קנייה בהוראת קבע",
      standingMin: "עמלת קנייה בהוראת קבע, מינימום",
      standingMax: "עמלת קנייה בהוראת קבע, מקסימום",
      custodyRate: "דמי ניהול פיקדון ניירות ערך",
      custodyMin: "דמי ניהול פיקדון ניירות ערך, מינימום",
      custodyMax: "דמי ניהול פיקדון ניירות ערך, מקסימום",
      fxRate: "עמלת המרת מטבע",
      monthlyFee: "דמי חשבון קבועים",
      iraManagerFee: "דמי ניהול של החברה המנהלת",
      fundManagement: "דמי ניהול של הקרן",
      fundVariable: "דמי ניהול משתנים של הקרן",
      fundTrustee: "שכר הנאמן של הקרן",
      fundTracking: "הפרש העקיבה של הקרן",
      fundWithholding: "מס זר שנגבה בתוך הקרן",
      fundHalfSpread: "חצי ממרווח הקנייה והמכירה",
      // the regulator's own words for the figure in members' reports (CAT-37, which the value's sheet cites)
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
  ] as const,
  openDetails: "יש שאלות פתוחות",
  kinds: { equity_index: "מדד מניות", bond_index: "מדד אג״ח", cash_like: "מזומן ודומיו", mixed: "תמהיל של כמה סוגי נכסים", commodity: "סחורות", other: "אחר" } as Record<string, string>,
  kindLabel: "סוג",
  currencyLabel: "מטבע",
  holdLine: "המוצרים שבהם אפשר להחזיק את החשיפה הזו.",
  holdNone: "עוד לא נאספו המוצרים שמחזיקים את זה.",
  toIndices: "להשוואת החשבונות והקרנות על המדד",
  /** A product's tag on an exposure page, by what its open questions leave out (D105): the pension products are blocked by conversion
   *  factors not collected, not by an unclear tax. */
  openBlock: { tax: "עוד לא ברור איך זה ממוסה כאן: שאלה פתוחה", annuity: "האתר עוד לא מחשב כאן את הקצבה: חסרים מקדמי ההמרה", other: "האתר עוד לא מחשב את זה כאן: שאלה פתוחה" },
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

// ---------------------------------------------------------------- release 2: the comparison's words (docs/copy.md section 6)
/**
 * Words of the comparison (docs/copy.md 6.0 to 6.4) that the indices page and the visuals show.
 * Figures never appear here: a `{…}` place in copy.md is filled by a Num on the page.
 */
export const r2 = {
  form: {
    errYears: "הזינו לפחות שנה אחת.",
    errYearsWhole: "הזינו מספר שלם של שנים.",
  },

  result: {
    // A8: a deposit whose published rate was read for another amount
    ownRate: { about: "ריבית שהזנתם" },
  },
} as const;

// sc-represent, folded in by sc-compare: the entered fee level of the representative instrument (D4)
export const ownTermsCopy = {
  fundCostLabel: "העלות בתוך הקרן",
};

// Release 3: the track workbench and the entry points (docs/copy.md 7.0, 7.3, 7.5; flows 12.3, 12.5). The strings the
// build added are in copy.md 7.3's "Added 2026-10-24" table, keyed by path.
// ---------------------------------------------------------------- the track browser (D54)

/** "כל המסלולים בכל החברות" at /tracks: every company's tracks of one product, from the approved prototype (8dd1f013:research/specs/2026-11-03-track-browser). */
/** The "?" beside a label that opens its glossary card (kit/help-mark.tsx). */
export const help = {
  markLabel: "מה זה {about}",
};

export const trackBrowser = {
  title: "כל המסלולים בכל החברות",
  tabs: { aria: "איך לראות את החברות והמסלולים", byCompany: "לפי חברה", byProduct: "לפי מוצר", deposits: "פיקדונות בבנקים" },
  /** The page's line: its year and date stand on a phone only, whose rows have no heads; from md the heads say them. */
  lead: {
    intro: "דמי הניהול הם הממוצע שנגבה ב־",
    figures: "; החשיפה, התשואה והכסף המנוהל נכונים לסוף ",
    end: ". ",
    source: "מנתוני רשות שוק ההון.",
    noYear: "החשיפה, התשואה והכסף המנוהל נכונים לסוף ",
  },
  controls: {
    product: "מוצר",
    search: "חיפוש",
    searchPlaceholder: "שם המסלול או החברה",
    kind: "במה הכסף מושקע",
    kindAll: "הכול",
    /** In place of the kinds, on a product the regulator does not sort by kind (the pension funds). */
    noKinds: "הרשות לא מסווגת את המסלולים של המוצר הזה לפי סוג ההשקעה.",
    sort: "מיון",
  },
  /** The phone's folded controls: "קרן השתלמות · מניות · מיון לפי דמי ניהול". */
  fold: { kindAll: "כל סוגי ההשקעה", sort: "מיון לפי ", more: "שינוי", less: "סגירה" },
  /** The count line over the list: "133 מסלולים של 12 חברות (מתוך 133) · דמי ניהול מהחיסכון: מ־0.10% עד 0.90%"; the guide link is under the products. */
  count: {
    tracksNone: "אין מסלולים",
    tracksOne: "מסלול אחד",
    tracksTwo: "שני מסלולים",
    tracksMany: "מסלולים",
    companiesNone: "אין חברות",
    of: "של",
    outOf: "מתוך",
    whatIs: "מה זה",
  },
  /** What each sort says in the line above the list: the column, then the direction. */
  sorts: {
    name: { label: "שם", what: "שם המסלול", whatKind: "שם החברה", up: "בסדר הא״ב", down: "בסדר הא״ב ההפוך" },
    fee: { label: "דמי ניהול מהחיסכון", what: "דמי הניהול מהחיסכון", up: "מהזול ליקר", down: "מהיקר לזול" },
    dep: { label: "דמי ניהול מהפקדה", what: "דמי הניהול מהפקדה", up: "מהזול ליקר", down: "מהיקר לזול" },
    stock: { label: "חשיפה למניות", what: "החשיפה למניות", up: "מהנמוכה לגבוהה", down: "מהגבוהה לנמוכה" },
    assets: { label: "כסף מנוהל", what: "הכסף המנוהל", up: "מהמעט להרבה", down: "מההרבה למעט" },
  },
  order: {
    company: "החברות מסודרות מהגדולה לקטנה לפי הכסף המנוהל; בתוך כל חברה לפי ",
    kind: "המסלולים מסודרים לפי ",
  },
  /** The heading of a group: "16 מסלולים · כסף מנוהל 19.1 מיליארד ₪ · דמי ניהול מהחיסכון: מ־0.54% עד 0.61%". */
  group: {
    assets: "כסף מנוהל",
  },
  columns: {
    track: "המסלול",
    company: "החברה",
    fund: "קופה",
    /** The full table's fee head, its year beside it in muted words, over the two heads that sort. */
    fee: "דמי ניהול",
    feeSavings: "מהחיסכון",
    feeDeposits: "מהפקדה",
    exposure: "חשיפה למניות ולמט״ח",
    /** The past yield's head: a past record, and in the muted line under it, before fees and tax (the "?" holds the whole sentence). */
    yield: "תשואת עבר שנתית ממוצעת",
    beforeFees: "לפני דמי ניהול ומס",
    assets: "כסף מנוהל",
    open: "פתיחה",
    /** A company page's shorter table, one figure a cell (designer's mock, 2026-11-10); its date is the caption over the columns it holds.
     *  `past` is the one head over the two past yields, each column's years (`yield.years3`, `yield.years5`) under it. */
    short: { fee: "דמי ניהול מהחיסכון", deposit: "מהפקדה", stocks: "מניות", currency: "מט״ח", past: "תשואת עבר", assets: "כסף מנוהל" },
    /** Under a fee head, muted: the year whose average the column shows; with no year, the word alone. */
    average: "ממוצע {year}",
    averageNoYear: "ממוצע",
    /** Under a head of the full table, muted: the date of its figures. */
    endOf: "סוף {period}",
    /** A company page's caption over the columns whose figures share one date. */
    asOf: "נכון לסוף {period}",
  },
  /** Over a company page's table: what its dates are, and a deposit fee every track shares. The fees' year and the figures' date are said
   * on a phone, whose rows have no heads; from md the fee heads and the caption over the columns say them. */
  feeAverage: (year: string, wholeFund = false) => `דמי הניהול הם הממוצע שנגבה ב־${year}${wholeFund ? " בקרן כולה" : ""}; `,
  /** On a phone, whose rows have no heads, over a pension product's list: whose the fees are (CAT-39). */
  wholeFund: "בקרן פנסיה דמי הניהול הם של הקרן כולה, לא של המסלול: כל המסלולים של קרן אחת מראים אותם דמי ניהול.",
  /** Over a child-savings list or track: what its fee figure is, as the rule base reads it (CS OQ9); the question's chip follows. */
  childFee: { before: "בחיסכון לכל ילד דמי הניהול כאן הם, לפי קריאה של האתר, מה שעמיתים מעל גיל", after: "שילמו, בממוצע על כל הנכסים של המסלול. עד הגיל הזה הביטוח הלאומי משלם את דמי הניהול. זה לא המחיר שהקופה גובה. שאלה פתוחה" },
  dates: (period: string) => `החשיפה, התשואה והכסף המנוהל נכונים לסוף ${period}.`,
  depositOnce: "דמי ניהול מהפקדה, בכל המסלולים:",
  /** A company page's link to the product's tracks at every company: "קרן השתלמות בכל החברות". */
  inAll: (name: string) => `${name} בכל החברות`,
  yield: { phone: "תשואה שנתית ממוצעת", years3: "3 שנים", years5: "5 שנים", young: "אין", missing: "לא דווח", emptyNote: { before: "השדה ריק בנתוני הרשות: לא פורסמה למסלול תשואה שנתית ממוצעת ל־", after: " שנים." }, selfManaged: "בניהול אישי: כל חוסך מחליט במה להשקיע", selfManagedShort: "כל חוסך מחליט במה להשקיע" },
  assets: { million: "מיליון ₪", missing: "לא דווח", emptyNote: "השדה ריק בנתוני הרשות: לא פורסם כמה כסף מנוהל במסלול.", phone: "כסף מנוהל" },
  /** The sheets' headers of the two group figures (F-99, F-100), and of the whole list's fee range on the count line. */
  about: { assets: "הכסף שהחברה מנהלת במוצר, בכל המסלולים יחד", feeLow: "הנמוך מדמי הניהול מהחיסכון שדווחו למסלולים בקבוצה", feeHigh: "הגבוה מדמי הניהול מהחיסכון שדווחו למסלולים בקבוצה" },
  noResult: { before: "אין מסלולים שמתאימים לחיפוש ״", after: "״." },
  /** The guide's link to a product's tracks: "כל המסלולים של קופת גמל להשקעה בכל החברות". */
  guideLink: { before: "כל המסלולים של ", after: " בכל החברות" },
  /** What each "?" explains, for its spoken name; on a phone, the line above the list that opens the same cards. */
  help: { fee: "דמי ניהול ממוצעים", deposit: "דמי ניהול ממוצעים מהפקדה", assets: "כסף מנוהל", exposure: "חשיפה למניות ולמט״ח", past: "תשואת עבר", phoneLead: "מה אומרים המספרים:" },
  /** The past yield's whole caution: the "?" beside its head, and on a phone, whose rows have no heads, under the list. */
  pastNote: "התשואה היא תשואת עבר כמו שהרשות מפרסמת אותה: לפני דמי הניהול ולפני מס. היא לא אומרת מה יקרה בהמשך, ולכן אין מיון לפיה.",
  oldData: "נתוני הרשות לא עודכנו מאז",
  /** At the end of a phone's track row opened in place under its company. */
  openTrack: "לעמוד המסלול",
} as const;

/**
 * The deposits page (D92, `/deposits`): every bank's standard shekel deposits side by side. The count line, the fold, the grid's cells
 * and the notes; the deposit's own words (break, exits, kinds) are r4catalogue's, as on the bank pages.
 */
export const depositBrowser = {
  title: "פיקדונות בכל הבנקים",
  lead: "הריבית שהבנקים מפרסמים לפיקדון בשקלים, בשנה ולפני המס, לא הצעה אישית. בנק אש ישראל לא נכלל: לא נמצא לו אתר.",
  /** At the end of the list's heading line: "נקרא מאתרי הבנקים ב־09.11.2026". */
  read: "נקרא מאתרי הבנקים ב־",
  controls: {
    amount: "כמה מפקידים",
    picks: "סכומים מוכנים",
    kind: "סוג הריבית",
    show: "להציג גם",
    conditional: "הצעות עם תנאי",
    linked: "צמודות למדד",
    myBank: "לסמן את הבנק שלי",
    noBank: "לא נבחר",
    sort: "מיון",
  },
  terms: { day: "יום", week: "שבוע", m1: "חודש", m3: "3 חודשים", m6: "6 חודשים", y1: "שנה", y2: "שנתיים", y3: "3 שנים" },
  /** The chart's pills on a phone, where eight stand across the width; `termsTiny` under 360 px. */
  termsShort: { day: "יום", week: "שבוע", m1: "חודש", m3: "3 ח׳", m6: "6 ח׳", y1: "שנה", y2: "שנתיים", y3: "3 שנים" },
  termsTiny: { day: "יום", week: "שבוע", m1: "חודש", m3: "3 ח׳", m6: "6 ח׳", y1: "שנה", y2: "2 ש׳", y3: "3 ש׳" },
  /** "23 הצעות לשנה", "אין פיקדון ליום". */
  termFor: { day: "ליום", week: "לשבוע", m1: "לחודש", m3: "ל־3 חודשים", m6: "ל־6 חודשים", y1: "לשנה", y2: "לשנתיים", y3: "ל־3 שנים" },
  /** "על 10,000 ₪ בשנה". */
  termIn: { day: "ביום", week: "בשבוע", m1: "בחודש", m3: "ב־3 חודשים", m6: "ב־6 חודשים", y1: "בשנה", y2: "בשנתיים", y3: "ב־3 שנים" },
  kinds: { fixed: "קבועה", variable: "משתנה" },
  kindWords: { fixed: "בריבית קבועה", variable: "בריבית משתנה" },
  count: { offers: "הצעות", offerOne: "הצעה אחת", offerTwo: "שתי הצעות" },
  /** The chart over the list: a bar for each term, the highest rate open to everyone at the amount. */
  chart: {
    title: { fixed: "ריבית קבועה בשנה: הגבוהה בכל תקופה, ב־", variable: "ריבית משתנה בשנה: הגבוהה בכל תקופה, ב־" },
    titleNoAmount: { fixed: "ריבית קבועה בשנה: הגבוהה בכל תקופה", variable: "ריבית משתנה בשנה: הגבוהה בכל תקופה" },
    axis: "תקופת הפיקדון",
    none: "אין",
    gap: { otherKind: { fixed: "רק משתנה", variable: "רק קבועה" }, unknownAtAmount: "לא ידוע בסכום הזה", notAtAmount: "לא בסכום הזה", none: "אין הצעות" },
    /** A column's spoken name: "שנה: 3.25% בבנק ירושלים". */
    atBank: " בבנק ",
    chosen: "נבחרה",
    /** After a bound in a row's box. */
    minWord: "מינימום",
    maxWord: "מקסימום",
  },
  /** The list's heading: "23 הצעות לשנה. הגבוהה: 3.25% בבנק ירושלים, כ־325 ₪ על 10,000 ₪". */
  heading: { best: "הגבוהה: ", atBank: " בבנק ", on: " על " },
  empty: {
    noAmountTitle: "כמה מפקידים?",
    noAmount: "כתבו כמה מפקידים, והרשימה תראה את הפיקדונות שאפשר לפתוח בסכום הזה.",
    /** "אין פיקדון ליום בריבית קבועה". */
    none: "אין פיקדון ",
    otherKindOnly: { fixed: "לתקופה הזאת הבנקים מפרסמים רק ריבית משתנה.", variable: "לתקופה הזאת הבנקים מפרסמים רק ריבית קבועה." },
    /** "אין פיקדון לשנה בריבית קבועה שאפשר לפתוח ב־100 ₪". */
    atAmount: " שאפשר לפתוח ב־",
  },
  columns: { bank: "הבנק והפיקדון", rate: "ריבית בשנה", amount: "סכום להפקדה", access: "גישה לכסף לפני הסוף", interestOn: "על ", beforeTax: "לפני המס על הריבית" },
  /** The phone's sort, where there are no column heads to press. */
  sortPhone: { rate: "ריבית גבוהה קודם", min: "סכום נמוך קודם" },
  access: { exit: "יציאה ", firstAfter: "יציאה ראשונה אחרי ", some: "יש תחנות יציאה", locked: "נעול עד סוף התקופה" },
  /** The line of an offer under the first of its name. */
  variant: { withExits: "אותו פיקדון, עם תחנות יציאה", withWords: "אותו פיקדון, עם ", noExits: "אותו פיקדון, בלי תחנות יציאה", same: "אותו פיקדון, ", from: "מ־", plain: "אותו פיקדון" },
  interest: {
    inputs: { rate: "הריבית שהבנק מפרסם", amount: "הסכום שמפקידים", effective: "הריבית האפקטיבית שהבנק מפרסם", periods: "כמה פעמים בשנה הבנק מחשב ריבית" },
    /** A term over a year whose record says nothing of how the product calculates interest (BANK-50, BANK OQ21). */
    unknown: "לא ידוע: הבנק לא מפרסם כמה פעמים בשנה הוא מחשב ריבית",
    about: "הריבית על הסכום, לפני המס על הריבית, ",
    about2: "כ־",
    underOne: "פחות מ־⁦1 ₪⁩",
    variableNote: "ריבית משתנה: החישוב לפי הריבית של היום, והיא יכולה להשתנות במהלך התקופה.",
  },
  mine: "הבנק שלי",
  fold: { more: "עוד ", less: "להציג פחות", change: "שינוי", close: "סגירה" },
  /** The linked offers, after the rest when their chip is on. */
  linkedLead: "צמודות למדד",
  linkedLine: ". הריבית באה בנוסף להצמדה, ולכן הן לא מדורגות מול השאר.",
  /** The tag of a linked row. */
  linked: { cpi: "צמוד למדד", fx: "צמוד למט״ח" },
  /** The folded group under the list: "22 הצעות שאי אפשר לפתוח ב־10,000 ₪"; where the table of one of them does not say whether it takes the amount, `orUnknown`. */
  closed: { before: "שאי אפשר לפתוח ב־", orUnknown: "שאי אפשר לפתוח, או שלא ידוע אם אפשר לפתוח, ב־" },
  help: { rate: "הריבית שהבנק מפרסם", exits: "תחנות יציאה", break: "שבירת פיקדון", phoneLead: "מה אומרות המילים:" },
  grid: {
    title: { fixed: "הריבית הקבועה הגבוהה בכל בנק ולכל תקופה, ב־", variable: "הריבית המשתנה הגבוהה בכל בנק ולכל תקופה, ב־" },
    line: "בשנה, לפני המס על הריבית. הקישו על משבצת כדי לראות את ההצעות של הבנק ברשימה.",
    helpAbout: "מה יש בכל משבצת",
    helpText:
      "בכל משבצת: הריבית הגבוהה מבין ההצעות של הבנק לתקופה הזו שאפשר לפתוח בסכום שבחרתם, מסוג הריבית שבחרתם, לא צמודות למדד, ושהבנק לא כותב שהן רק לחלק מהלקוחות. ״ועוד״ סופר את שאר ההצעות של הבנק לאותה תקופה, מכל סוג.",
    about: "הריבית הגבוהה מבין ההצעות של הבנק לתקופה הזו שאפשר לפתוח בסכום שבחרתם",
    bank: "בנק",
    more: "ועוד",
    /** A sheet line of a bank that prints one name for several amounts: "· מ־250,000 ₪". */
    from: "מ־",
    gap: { none: "לא מציע", otherKind: { fixed: "רק ריבית משתנה", variable: "רק ריבית קבועה" }, otherOffers: "רק הצעות אחרות", conditionalOnly: "רק עם תנאי", unknownAtAmount: "לא ידוע בסכום הזה", notAtAmount: "לא בסכום הזה" },
    /** The cell's button: "להצעות של לאומי לשנה ברשימה, 1.8%". */
    goTo: { before: "להצעות של ", middle: " ל", after: " ברשימה" },
    /** The highest cell of a column: framed, and said. */
    best: "הגבוהה בתקופה",
    scale: { aria: "סולם הצבע", lead: "ככל שהריבית גבוהה יותר, המשבצת בהירה יותר. במסגרת: הגבוהה בכל תקופה." },
    phoneHalves: ["עד 3 חודשים", "מ־6 חודשים עד 3 שנים"],
  },
  /** On the bank-deposit guide, where it names the banks. */
  guideLink: "להשוואת הפיקדונות של כל הבנקים, תקופה לצד תקופה",
  search: { names: ["פיקדונות בכל הבנקים", "השוואת פיקדונות", "ריבית על פיקדון בבנקים", "פיקדון בנקאי בכל הבנקים"], line: "השוואה של הפיקדונות בכל הבנקים" },
} as const;

/** What is left of the track workbench's strings (its page became the track browser): the fee table's empty-cell key and the entrance to transfer. */
export const r3workbench = {
  // what the sheet of an unreported fee says first, then the reason when the data gives one (moved there from a key under the table)
  missingNote: "השדה ריק בנתוני הרשות.",
  entry: {
    transfer: { label: "העברה למכשיר אחר", href: "/transfer" },
  },
} as const;

/**
 * The fee page (method §10.6, components/fee-deal): one deal, its fees as the person typed them, read with no plan and no total. A fee base
 * the records list is named by the guide's words (`guideBlocks.fees`); the four fees they do not list are named in `names`. The figures are
 * `Num`s and fields; these are the words around them.
 */
export const feeDeal = {
  title: "העמלות בעסקה שלכם",
  lede: "מזינים עסקה אחת בדיוק כמו שהיא: כל עמלה, ממה היא נגבית, המינימום והתקרה שלה, ואיך היא משתנה עם השנים. האתר מראה מה העסקה גובה, על מה, ומתי.",
  /** The word the header and the menu call the page by. */
  crumb: site.menuItems.find((m) => m.href === "/deal")!.label,
  loading: "טוען…",
  failed: "הנתונים של העמוד לא נטענו. אפשר לרענן את הדף ולנסות שוב.",
  /** The four fees the records' bases do not list (shapes.ts), and the name of a fee of the person's own before they name it. */
  names: { fund_management: "דמי הניהול של הקרן", fx_spread: "הפרש שער בהמרה", current_account: "חשבון עובר ושב בבנק", own: "עמלה משלכם" } as Record<string, string>,
  /**
   * The grammar of each fee's name (the guide's names and the four above), by its kind, for a word that agrees with it: its gender and
   * number (`m`, `f`, `mp`, `fp`), and for a fee that can be a sum on the account its name with the article ("דמי החשבון הקבועים"). A fee
   * of the person's own has none: a sentence about it keeps the form that agrees with nothing.
   */
  nameForms: {
    balance: { g: "mp" },
    deposit: { g: "mp" },
    direct_expenses: { g: "fp" },
    exit: { g: "mp" },
    trade: { g: "f" },
    custody: { g: "mp", the: "דמי ניהול פיקדון ניירות הערך" },
    fx: { g: "f" },
    fixed_period: { g: "mp", the: "דמי החשבון הקבועים" },
    distribution_handling: { g: "m" },
    spread: { g: "m" },
    creation_redemption: { g: "f" },
    transfer_out: { g: "f" },
    corporate_event: { g: "f" },
    load: { g: "f" },
    redemption_deduction: { g: "m" },
    variable_management: { g: "mp" },
    trustee: { g: "m" },
    insurance_premium: { g: "mp" },
    fund_management: { g: "mp" },
    fx_spread: { g: "m" },
    current_account: { g: "m", the: "החשבון העובר ושב בבנק" },
  } as Record<string, { g: "m" | "f" | "mp" | "fp"; the?: string }>,
  /** "Larger than", after a name that is the subject, agreeing with it ("דמי החשבון הקבועים גדולים מדמי ניהול הפיקדון"). */
  larger: { m: " גדול מ", f: " גדולה מ", mp: " גדולים מ", fp: " גדולות מ" } as Record<string, string>,
  /** The rate a cost curve converts a bound in another currency at (F-84), by the currencies a bound may be typed in, as a value's input. */
  rateNames: { USD: "שער הדולר בשקלים", EUR: "שער האירו בשקלים", GBP: "שער הלירה שטרלינג בשקלים" } as Record<string, string>,
  /** The bar under the page's head: the deal's name and where it is kept. */
  bar: {
    label: "העסקה",
    /** The name a deal shows before the person gives one: its kind's, or a new deal's before a kind is chosen. */
    namePlaceholder: (kind: string | null) => (kind ? `${kind} שלי` : "עסקה חדשה"),
    saved: "נשמרת במכשיר הזה",
    unsaved: "המכשיר הזה לא שומר אותה",
  },
  /** What each group of fees is charged on (F-111), as a group's heading. */
  on: {
    "action:trade": "על כל קנייה או מכירה",
    "action:conversion": "על כל המרה",
    "action:deposit": "על כל הפקדה",
    "action:distribution": "על כל תשלום של ריבית או דיבידנד",
    "action:transfer_out": "על כל העברה החוצה",
    "action:none": "על פעולות אחרות",
    held: "על מה שמוחזק, בכל שנה",
    /** The same for a product that saves (one whose fees are charged from the savings): what has built up. */
    heldSaved: "על מה שנצבר, בכל שנה",
    account: "על החשבון, בלי קשר לסכום",
    cover: "על הכיסוי הביטוחי",
    unsaid: "בלי לומר על מה",
  } as Record<string, string>,
  /** A side of a trade, where a sale is priced apart from a purchase or a fee is charged on one of them alone. */
  sides: { buy: "בקנייה", sell: "במכירה" } as Record<string, string>,
  /** A price in words around its figures. */
  price: {
    free: "חינם",
    /** After an action's rate: what it is a share of, by the fee; `default` for the rest. */
    of: { default: "מהפעולה", fx: "מההמרה", fx_spread: "מההמרה", deposit: "מההפקדה", distribution_handling: "מכל תשלום", transfer_out: "מההעברה", exit: "מהמשיכה", insurance_premium: "מההפקדה" } as Record<string, string>,
    /** Before a bound, after a comma. */
    min: "מינימום ",
    max: "מקסימום ",
    /** After a share of what is held, beside its period. */
    held: "ממה שמוחזק",
    heldSaved: "ממה שנצבר",
    /** The months a rate is for, or a sum's period. */
    per: { 1: "בחודש", 3: "ברבעון", 6: "בחצי שנה", 12: "בשנה" } as Record<number, string>,
    /** How often a share of what is held is charged, where it is charged more often than its rate's period. */
    charged: { 1: "נגבה כל חודש", 3: "נגבה כל רבעון", 6: "נגבה כל חצי שנה", 12: "נגבה פעם בשנה" } as Record<number, string>,
    /** After a sum on each action, or a builder row's rate, by the fee. */
    perAction: { default: "לכל פעולה", fx: "לכל המרה", fx_spread: "לכל המרה", deposit: "לכל הפקדה", insurance_premium: "לכל הפקדה", exit: "לכל משיכה", transfer_out: "לכל העברה", corporate_event: "לכל אירוע", distribution_handling: "לכל תשלום" } as Record<string, string>,
    insideFund: "בתוך הקרן",
    /** After a sum for each unit traded (a price per unit, F-12). */
    perUnit: "לכל יחידה",
    /**
     * A flat price for a small action, before the rest of the price: "{flat} לכל המרה עד {upTo}. מעל זה {the price}" (F-12, F-13). A
     * percent maximum is said as a maximum, with what it is a share of: ", מקסימום 25% מהפעולה".
     */
    flat: { upTo: " עד ", above: ". מעל זה " },
    /** After the panel's flat price and its words, before the sum it holds up to: "[2.85 $] לכל המרה, עד המרה של [50 $]". */
    flatSep: ",",
    /** Between a fee's name and its price. */
    sep: ": ",
  },
  /**
   * Where a figure a template filled is from, in the note a press on its box opens: a house's price list, with the page of the document
   * where the record names one, or the regulator's data on a track.
   */
  figureFrom: { list: "מהתעריפון של ", page: ", עמ׳ ", cma: "מנתוני רשות שוק ההון." },
  /** The deal at a glance (F-110 to F-113). */
  glance: {
    title: "העסקה במבט אחד",
    throughout: "לאורך כל העסקה",
    changes: "מה משתנה ומתי",
    /** Before the months to the nearest change (a computed figure). */
    inMonths: "בעוד ",
    /** Before the rate a group's fees add to (F-111). */
    together: "יחד: ",
    /** After that rate: what it is a share of, by the group. */
    of: { "action:trade": "מהפעולה", "action:conversion": "מההמרה", "action:deposit": "מההפקדה", "action:distribution": "מכל תשלום", "action:transfer_out": "מההעברה", "action:none": "מהפעולה", held: "בשנה ממה שמוחזק", heldSaved: "בשנה ממה שנצבר" } as Record<string, string>,
    /** A change of a fee's price at a date: the new price, then the one it replaces. */
    instead: ", במקום ",
    /** A fee that starts after a free time, before its name, by the name's gender and number ("מתחילים דמי חשבון קבועים, 10 ₪ בחודש"). */
    starts: { m: "מתחיל ", f: "מתחילה ", mp: "מתחילים ", fp: "מתחילות " } as Record<string, string>,
    /** Fees left out of every reading until their prices' months are in order, by name. */
    unread: "לא נקראות עד שהתאריכים שלהן מסודרים: ",
    /** The deal has fees, and none has its price yet. */
    noneRead: "עוד אין בעסקה עמלה עם מחיר.",
  },
  /** The sums a deal's own prices mark (F-112), as the points say them. `noun` is the action a bound is on. */
  marks: {
    noun: { trade: "פעולה", conversion: "המרה", deposit: "הפקדה", distribution: "תשלום", transfer_out: "העברה", none: "פעולה" } as Record<string, string>,
    /** The action a fee's mark is said on, by the fee: a conversion's on each conversion, any other fee's on each action. */
    feeNoun: { fx: "המרה", fx_spread: "המרה" } as Record<string, string>,
    /** A count of units a price per unit's minimum or maximum is reached at (F-112). */
    units: { one: "יחידה אחת", two: "שתי יחידות", many: "יחידות" },
    /**
     * The yearly sums on the account against custody's yearly rate (F-112 (3)). `after` where they are the largest cost of holding below
     * that value; else `smaller` and custody's name ("…. על פחות מזה הם גדולים מ{custody}."), `custody` where the deal has several
     * custody fees.
     */
    meet: {
      before: "הסכומים הקבועים, ",
      sum: " בשנה, שווים ל־",
      rate: " על ",
      after: ". על פחות מזה הם העלות הגדולה בהחזקה.",
      smaller: ". על פחות מזה הם גדולים מ",
      custody: "דמי ניהול הפיקדון",
    },
  },
  /** A price against its legal cap (F-113). */
  standing: {
    tag: { below: "מתחת לתקרה", at: "בתקרה", above: "מעל התקרה", none: "לא נמצאה תקרה בחוק" } as Record<string, string>,
    /** "{price}, שהם {share} מהתקרה." */
    share: { before: ", שהם ", after: " מהתקרה." },
    /** In a builder row's line: "{share} מהתקרה". */
    shareShort: " מהתקרה",
    at: "זה המקסימום שמותר לגבות.",
    above: "יותר ממה שמותר לגבות. הערך נשאר כמו שהוזן, והאתר לא מתקן אותו.",
    banned: "אסור לגבות עמלה כזו. הערך נשאר כמו שהוזן, והאתר לא מתקן אותו.",
    otherForm: "המחיר הוזן בצורה שהתקרה לא מודדת, ולכן הוא לא נבדק מולה.",
    notSourced: "לתקרה אין מקור שנבדק, ולכן המחיר לא נבדק מולה.",
    /** Whom a cap binds where it binds some providers only (its record's `binds`), and why the price is then not judged. */
    binds: { banks: "התקרה חלה רק על בנקים.", banks_and_fund_distributors: "התקרה חלה על בנקים, ועל מפיץ של הקרן שהוא לא משווק השקעות ויש לו הסכם הפצה עם הקרן." } as Record<string, string>,
    bindsUnjudged: " העסקה לא אומרת שהיא בבנק, ולכן המחיר לא נבדק מולה.",
    /**
     * A cap that holds only in a case the deal does not state (its record's `caveat`, F-113): what it says, after the cap's figure, or after
     * "לא נמצאה תקרה בחוק" where the record sets none. No price is judged against it.
     */
    caveat: {
      closing_account: "התקרה חלה בבנק, כשסוגרים את החשבון ומעבירים את הניירות לחשבון שלכם בגוף אחר. הכללים מזכירים לצידה גם הוצאות צד שלישי. כשהחשבון נשאר פתוח חל מחיר אחר, בפיקוח. לכן המחיר לא נבדק מולה.",
      distribution_agreement: "בנק, או מפיץ אחר של הקרן שהוא לא משווק השקעות, לא רשאי לגבות מכם על קנייה או פדיון של יחידות הקרן כשיש לו הסכם הפצה עם הקרן.",
    } as Record<string, string>,
    /** The cap's line: its figure, with its unit's words after it. */
    capLine: "התקרה: ",
    /** What the cap's figure (or "לא נמצאה תקרה בחוק") opens, said before it by a screen reader: the fee's cap and the rules that set it. */
    capRules: (fee: string) => `התקרה על ${fee} והחוקים שקובעים אותה`,
    /** What "לא נמצאה תקרה בחוק" opens, said before it by a screen reader: the rules on the fee. */
    noCapRules: (fee: string) => `החוקים על ${fee}`,
    /** The spoken name of the rules that ban a fee here. */
    bannedRules: (fee: string) => `החוקים שאוסרים את ${fee}`,
    /** After a standing's tag on a card or in the glance, for a screen reader: pressing it leads to the fee's row of the law card. */
    toLaw: ", מה החוק קובע עליה",
    /** Before a price's standing: the month its price ends, or the month it starts. */
    until: "עד ",
    from: "מ־",
    now: "היום ",
  },
  /** The two columns that enter the deal: what it is, in steps, and its fees. */
  builder: {
    title: "על מה העסקה",
    kind: "סוג המוצר",
    kindChange: "להחליף",
    kindsAria: "סוגי המוצרים",
    close: "סגירה",
    track: "החברה והמסלול",
    trackNone: "לא נבחרו (לא חובה)",
    trackPick: "לבחור מסלול",
    /** The step that fills the deal from a price list, and its button opens the price lists. */
    fill: "מילוי מתעריפון",
    fees: "העמלות בעסקה",
    /** After a bound in a row's box. */
    minWord: "מינימום",
    maxWord: "מקסימום",
    /** The spoken name of the button that opens a fee in its panel. */
    open: (name: string) => `לפתוח את ${name}`,
    add: "אפשר להוסיף:",
    /** The fees a deal can still take, in the toolbox's column while no fee is open, each with the group heading of what it charges on. */
    palette: "אפשר להוסיף",
    paletteHint: "מקישים על עמלה, או גוררים אותה אל העסקה.",
    paletteHintTap: "מקישים על עמלה כדי להוסיף אותה.",
    unread: "התאריכים של המחירים לא מסודרים, ולכן העמלה לא נקראת.",
    /** The line a fee just taken away leaves in its place, before its name. */
    removed: "הוסרה מהעסקה: ",
    /** The line another kind of product leaves where it took several fees away, before their names. */
    removedMany: "הוסרו מהעסקה: ",
    /** The line in the panel of a fee just filled from a house's price list. */
    filled: (house: string) => `העמלה מולאה מהתעריפון של ${house}`,
    /** The action on the undo line that puts the deal back as it was. */
    undo: "ביטול",
    /** A field's spoken name: the fee, then the figure. */
    fieldName: (fee: string, field: string) => `${fee}, ${field}`,
    /** The facts a row says beside its prices. */
    facts: {
      noBounds: "בלי מינימום ובלי מקסימום",
      /** A fee whose rate or sum nobody typed yet: it is not read until it is. */
      noPrice: "עוד לא הוזן מחיר",
      insideFund: "נגבים בתוך הקרן",
    },
  },
  /** The left column: every field of the chosen fee. */
  panel: {
    title: "העמלה שבחרתם",
    ownName: "שם העמלה",
    forms: { free: "חינם", action: "אחוז מכל פעולה", held: "אחוז ממה שמוחזק", sum: "סכום קבוע", perAction: "סכום לכל פעולה", perUnit: "סכום לכל יחידה" } as Record<string, string>,
    /** The price parts beyond a rate and its bounds, by the name the reading's sheets give them (values.ts `inputKey`; reading.ts `UNIT_PRICE_KEY`). */
    parts: { cap: "המקסימום באחוזים", flat: "המחיר הקבוע לפעולה קטנה", upTo: "עד כמה חל המחיר הקבוע", discount: "ההנחה", third: "העמלה של הצד השלישי", thirdMin: "המינימום של הצד השלישי", thirdMax: "המקסימום של הצד השלישי", refund: "ההחזר", perSecurity: "המקסימום לכל נייר ערך", unitPrice: "מחיר יחידה" },
    howMuch: "כמה",
    min: "מינימום",
    max: "מקסימום",
    /** An empty bound's box. */
    empty: "—",
    /** The spoken name of the price's currency, the choice in a box of it (the sum per unit's, else the minimum's), for all its sums. */
    currency: "המטבע של הסכומים",
    currencies: { ILS: "שקלים", USD: "דולרים", EUR: "אירו", GBP: "לירות שטרלינג" } as Record<string, string>,
    signs: { ILS: "₪", USD: "$", EUR: "€", GBP: "£" } as Record<string, string>,
    per: "לכל",
    perOptions: { 1: "לחודש", 3: "לרבעון", 6: "לחצי שנה", 12: "לשנה" } as Record<number, string>,
    every: "נגבה כל",
    everyOptions: { 1: "חודש", 3: "רבעון", 6: "חצי שנה", 12: "שנה" } as Record<number, string>,
    sumEvery: "כל כמה זמן",
    sumEveryOptions: { 1: "בחודש", 3: "ברבעון", 6: "בחצי שנה", 12: "בשנה" } as Record<number, string>,
    /** A sum past what a deal keeps (model.ts, `SUM_MAX`). */
    tooLarge: "הזינו סכום עד מיליארד ₪.",
    perCharge: "לכל חיוב",
    /** The percent maximum (a share of the action that the fee never passes, F-12), after its box the action it is a share of. */
    cap: "מקסימום באחוזים",
    /** Before the sum the flat price holds up to, by the fee: "[2.85 $] לכל המרה, עד המרה של [50 $]". */
    upTo: { default: "עד פעולה של", fx: "עד המרה של" } as Record<string, string>,
    /** The last price, which holds on with no end. */
    noEnd: "מכאן והלאה",
    /**
     * A price that changes with time (F-110): the divider between two prices ("מ־" and the month the later starts, its box's spoken name,
     * its bin), the dashed slot at the end that adds a change by its month alone, its question and what it does, the month refused where
     * the prices change already, and the line a change taken away leaves.
     */
    change: {
      from: "מ־",
      month: "החודש שהמחיר משתנה בו",
      remove: "להסיר את השינוי במחיר",
      add: "המחיר משתנה מתאריך",
      ask: "מאיזה חודש המחיר משתנה?",
      note: "המחיר שחל אז יתפצל לשניים: החדש מתחיל כהעתק שלו, עד שתשנו אותו.",
      taken: "המחיר כבר משתנה בחודש הזה.",
      removed: "השינוי במחיר הוסר: המחיר שאחריו חזר להיות המחיר שלפניו.",
    },
    salePrices: "המחיר במכירה",
    oneSide: { buy: "נגבית רק בקנייה", sell: "נגבית רק במכירה" } as Record<string, string>,
    remove: "להסיר את העמלה",
    /** Opens the site's explanation of the fee (its glossary card). */
    whatIs: "מה זה",
    /** Fills this fee's price from a house's price list. */
    fill: "למלא מתעריפון",
    /** Closes the panel; no fee is chosen then. */
    close: "סגירה",
  },
  /**
   * A fee whose price changes by things (F-114), its cases, the parts of a price and the toolbox that adds them (rows.ts, panel.ts, toolbox.ts), the
   * reading's picks (reading.ts) and what the reading states without computing (method §10.6, "What the page states and does not compute").
   */
  cases: {
    /** The head of a fee's cases, before the things it changes by. */
    changesBy: "המחיר משתנה לפי",
    /** Each thing a price may change by, as a pill and as a part in the toolbox (shapes.ts, `ByKind`). */
    things: { what: "מה קונים", held: "מה מחזיקים", channel: "הערוץ", track: "המסלול שבחרתם", currency: "המטבע", actionSize: "גודל הפעולה", portfolioSize: "גודל התיק", volume: "היקף המסחר בחודש", count: "מספר הפעולות בחודש", own: "תנאי משלכם" } as Record<string, string>,
    /** The size of the action, by the fee: its own action's size ("גודל ההמרה"); `default` for a fee on a purchase or a sale. */
    actionSize: { default: "גודל הפעולה", fx: "גודל ההמרה", fx_spread: "גודל ההמרה", deposit: "גודל ההפקדה", insurance_premium: "גודל ההפקדה", exit: "גודל המשיכה", transfer_out: "גודל ההעברה", distribution_handling: "גודל התשלום" } as Record<string, string>,
    /** The values the site names, by thing (shapes.ts, `LIST_IDS`). */
    values: {
      what: { tase: "ניירות ערך בתל אביב", mutualFunds: "קרנות נאמנות", moneyMarket: "קרנות כספיות", makam: "מק״מ", us: "בחו״ל, בארה״ב", europe: "בחו״ל, באירופה", world: "בחו״ל, בשאר העולם" } as Record<string, string>,
      channel: { branch: "בסניף", phone: "בטלפון", direct: "באינטרנט ובאפליקציה" } as Record<string, string>,
      currency: { USD: "מדולר או לדולר", EUR: "מאירו או לאירו", GBP: "מלירה שטרלינג או ללירה שטרלינג", other: "ממטבע אחר או למטבע אחר" } as Record<string, string>,
    },
    /**
     * A case naming every value abroad but those another case names: "מחוץ ל" and theirs ("בחו״ל, מחוץ לארה״ב"); several joined by "ול"
     * ("מחוץ לארה״ב ולאירופה").
     */
    outside: { lead: "מחוץ ל", and: " ול", names: { us: "ארה״ב", europe: "אירופה", world: "שאר העולם" } as Record<string, string> },
    /** A case's value that is any value of its thing, said fainter than a named one. */
    any: { what: "בכל מה שקונים", held: "בכל מה שמוחזק", channel: "בכל ערוץ", track: "בכל מסלול", currency: "בכל מטבע", actionSize: "בכל גודל", portfolioSize: "בכל גודל תיק", volume: "בכל היקף", count: "בכל מספר", own: "בכל ערך" } as Record<string, string>,
    /** A range's step: up to its top, or above the last top; the unit after a count of units or of actions. */
    upTo: "עד ",
    over: "מעל ",
    units: { units: "יחידות", actions: "פעולות" } as Record<string, string>,
    /** Between a case's values for two things. */
    sep: " · ",
    /** A case's row, spoken: the button that opens it, before its values. */
    openCase: "לפתוח את המקרה: ",
    /**
     * The workbench's table of a fee's cases (band-layout.ts): each part row's head, the price's by what every case's price is (a share, a
     * sum, else a price); the line a part said once for every case stands under, or for the cases of one currency; a ladder's step between
     * two tops ("100,000 עד 500,000 ₪"); a step's top typed in place, spoken; and the place of a grid no case holds, spoken.
     */
    rowHeads: { rate: "שיעור", sum: "סכום", price: "מחיר", min: "מינימום", max: "מקסימום", cap: "מקסימום באחוזים", flat: "מחיר קבוע לפעולה קטנה", maxPerSecurity: "מקסימום לכל נייר ערך", discount: "הנחה", third: "צד שלישי", until: "שינוי במחיר", offset: "קיזוז", refund: "החזר", notes: "עוד על המחיר" } as Record<string, string>,
    shared: { all: "בכל המקרים:", in: { ILS: "בכל המקרים בשקלים:", USD: "בכל המקרים בדולרים:", EUR: "בכל המקרים באירו:", GBP: "בכל המקרים בלירות שטרלינג:" } as Record<string, string> },
    stepBetween: " עד ",
    stepTop: "הגבול העליון של המדרגה",
    /** A top typed in place that would not stay between its neighbours: "בין 100,000 ל־500,000". */
    stepTopRange: (from: string, to: string | null) => (to === null ? `מעל ${from}` : `בין ${from} ל־${to}`),
    emptyPlace: "להוסיף מקרה כאן: ",
    /**
     * The add slots of a fee's table: a case ("+ מקרה"), a ladder's step ("+ מדרגה"), a grid's row or column by its thing's name; the
     * question a step asks (its boundary alone, and what it does), and the line under a grid's new values.
     */
    addSlot: { case: "מקרה", step: "מדרגה" },
    addStep: { ask: "{thing}: איפה הגבול של המדרגה החדשה?", note: "המדרגה שהגבול נופל בה תתפצל לשתיים, ושתיהן יישארו במחיר שלה עד שתשנו אותו.", field: "הגבול החדש", taken: "יש כבר מדרגה שמתחילה כאן." },
    addValues: "כל ערך שתסמנו יקבל את המחירים של {last}, עד שתשנו אותם.",
    /** The switch above a grid of a fee that changes by three things, spoken. */
    switchLabel: "המקרים של",
    /** The line an undone case or thing leaves (undo.ts). */
    caseRemoved: "המקרה הוסר.",
    /**
     * The line a thing taken away leaves (undo.ts), naming it as the menu did: how many cases merged into how many, that none merged, or
     * that the fee kept one case's price, the person's track's where a case is theirs (`slimOwn`), else the first case's.
     */
    byRemoved: {
      merged: "המחיר כבר לא משתנה לפי {thing}: {from} מקרים הם עכשיו {to}.",
      kept: "המחיר כבר לא משתנה לפי {thing}. המקרים נשארו כמו שהם, כי הם שונים גם בדבר אחר.",
      slim: "המחיר כבר לא משתנה לפי {thing}. נשאר המחיר של המקרה הראשון.",
      slimOwn: "המחיר כבר לא משתנה לפי {thing}. נשאר המחיר של המסלול שלכם.",
    },
    /**
     * The line a price put in another form leaves (undo.ts): that it changed, and what it left behind by name ("המחיר הוחלף, והמינימום
     * והמקסימום הוסרו.").
     */
    formChanged: {
      plain: "המחיר הוחלף.",
      lost: "המחיר הוחלף, ו{parts} {verb}.",
      one: "הוסר",
      many: "הוסרו",
      and: "ו",
      parts: { min: "המינימום", max: "המקסימום", cap: "המקסימום באחוזים", flat: "המחיר הקבוע לפעולה קטנה", maxPerSecurity: "המקסימום לכל נייר ערך" },
    },
    /**
     * A thing of the band's head, opened while its fee is open: its values in the cases, the action that drops it, and what that does. The
     * cases that merge keep the person's track's price where one of them is theirs (`mergeOwn`, `slimOwn`), else the first one's.
     */
    thingMenu: {
      title: "המקרים מבחינים בין:",
      stop: "להפסיק להבחין לפי {thing}",
      merge: "{from} מקרים יהיו {to}: מקרים שנבדלים רק בזה יאוחדו, במחיר של הראשון מהם.",
      mergeOwn: "{from} מקרים יהיו {to}: מקרים שנבדלים רק בזה יאוחדו, במחיר של המסלול שלכם אם הוא ביניהם, ואחרת במחיר של הראשון מהם.",
      kept: "המקרים יישארו כמו שהם, כי הם שונים גם בדבר אחר.",
      slim: "לעמלה יישאר מחיר אחד: המחיר של המקרה הראשון.",
      slimOwn: "לעמלה יישאר מחיר אחד: המחיר של המסלול שלכם.",
    },
    /** The toolbox: what it adds to, how, and its groups' heads. */
    addTo: "להוסיף למקרה: ",
    /** Which of a fee's prices over time the toolbox adds to: "להוסיף למחיר ממינואר 2027", "להוסיף למחיר עד דצמבר 2026". */
    toolPrice: { lead: "להוסיף למחיר", from: "מ־", until: "עד " },
    groups: { price: "המחיר", bound: "מינימום ומקסימום", by: "המחיר משתנה לפי", link: "קשר לעמלה אחרת", more: "עוד על המחיר" } as Record<string, string>,
    /** A part of a price, as a toolbox card and as the open case's line; `perAction` and `of` follow the fee (`price.perAction`, `price.of`). */
    parts: {
      perUnit: "לכל יחידה",
      discount: { lead: "הנחה ", tail: " מהמחיר", alsoMin: ", גם על המינימום" },
      third: "ועוד עמלה של צד שלישי",
      /** A third party's fee named in the list's words: "ועוד עמלת הברוקר". */
      thirdOf: "ועוד עמלת ",
      thirdNone: "בלי סכום בתעריפון",
      /** Before the month a later price starts, on a closed line: "ומינואר 2027". */
      from: "ומ־",
      min: "מינימום ",
      max: "מקסימום ",
      /** A held share's maximum on each security, after its sum: "מקסימום 7,500 ₪ לכל נייר ערך בכל חיוב" (§10.6's stated parts). */
      perSecurity: { each: " לכל נייר ערך", charge: " בכל חיוב" },
      /** After a bound's sum: on each action, by the fee (`price.perAction` names the action). */
      boundPer: { default: "לפעולה", fx: "להמרה", fx_spread: "להמרה" } as Record<string, string>,
      offset: "מתקזזת מול עמלה אחרת",
      /** An offset against a named fee: "מתקזזת מול {fee} של אותו חודש". */
      offsetOf: { lead: "מתקזזת מול ", tail: " של אותו חודש" },
      refund: "החזר ",
      notes: { unfilled: "גם על הוראה שלא בוצעה", unfilledClerk: "במינימום על הוראה דרך פקיד שלא בוצעה, לא בקרנות נאמנות", unfilledClerkAbroad: "במינימום על הוראה דרך פקיד שלא בוצעה", capRead: "המקסימום באחוזים גובר על המינימום, לפי קריאת האתר", partial: "כל ביצוע חלקי בנפרד", inTrade: "הסכומים במטבע של העסקה", sale: "מכירה במחיר אחר" } as Record<string, string>,
      flat: { lead: "מחיר קבוע ", tail: " עד " },
      /** The toolbox's card of a flat price for a small action, by the fee: "מחיר קבוע לפעולה קטנה, עד ☐", a conversion's "להמרה קטנה". */
      flatSmall: { default: "מחיר קבוע לפעולה קטנה, עד ", fx: "מחיר קבוע להמרה קטנה, עד ", fx_spread: "מחיר קבוע להמרה קטנה, עד " } as Record<string, string>,
      /** In a discount in edit: the switch that takes it off the minimum too. */
      discountOnMin: "גם על המינימום",
      /** In a third party's fee in edit: whose fee it is, in the list's words, and the form of its price. */
      thirdWho: "שם הצד השלישי",
      thirdForm: "המחיר של הצד השלישי",
      /** In an offset in edit, before its fee is chosen. */
      offsetPick: "בחרו עמלה",
    },
    /** Why a thing cannot be added. */
    full: "המחיר יכול להשתנות לפי שלושה דברים לכל היותר.",
    /** Adding a thing: the question for its values, asked once, and what the copies come to. */
    ask: {
      what: "לפי מה קונים: מה קונים לפי התעריפון שלכם?",
      held: "לפי מה מחזיקים: מה מחזיקים לפי התעריפון שלכם?",
      channel: "לפי הערוץ: אילו ערוצים יש בתעריפון שלכם?",
      currency: "לפי המטבע: אילו מטבעות יש בתעריפון שלכם?",
      track: "לפי המסלול: אילו מסלולים יש בתעריפון שלכם?",
      own: "תנאי משלכם: מה התנאי, ומה הערכים שלו?",
      range: "{thing}: עד כמה חל המחיר הראשון?",
    } as Record<string, string>,
    /** Each copied case, by the thing: "כל מקרה יועתק לכל ערוץ שסימנתם, עם המחיר שלו." */
    copies: { lead: "כל מקרה יועתק לכל ", tail: " שסימנתם, עם המחיר שלו.", range: "כל מקרה יועתק ל״עד״ ול״מעל״, עם המחיר שלו.", count: "{from} מקרים יהיו {to}." },
    /** The noun a copy is made for, by the thing. */
    copyNoun: { what: "סוג", held: "סוג", channel: "ערוץ", currency: "מטבע", track: "מסלול", own: "ערך" } as Record<string, string>,
    /** The line for a value in the person's own words under a list's values, by the thing where it has its own, else the general one. */
    otherValue: "משהו אחר, בשם משלכם",
    otherBy: { channel: "ערוץ אחר" } as Partial<Record<string, string>>,
    /** Adds a value typed in the person's words to the values asked, ticked. */
    addValue: "להוסיף לרשימה",
    /** A condition of the person's own, its name asked first. */
    ownLabel: "התנאי, במילים שלכם",
    add: "להוסיף",
    cancel: "ביטול",
    /** A case's slot, opened: what it names, several may be ticked; a track by name with the person's own; a range's step. */
    slot: {
      list: "{thing} במקרה הזה. אפשר לסמן כמה.",
      trackName: "שם המסלול, כמו שהוא כתוב אצלכם",
      myTrack: "זה המסלול שלי",
      range: "{thing} במקרה הזה",
      before: "המקרה שלפניו: ",
      /** A value of the person's own, typed under a list: its name, and for what is bought or held, where it is bought and its currency. */
      ownName: "השם, כמו שהוא כתוב אצלכם",
      /** A typed value's name, by the thing where it has its own words (a track's). */
      nameBy: { track: "שם המסלול, כמו שהוא כתוב אצלכם" } as Partial<Record<string, string>>,
      ownPlace: "איפה זה נקנה",
      israel: "בארץ",
      abroad: "בחו״ל",
      ownCurrency: "המטבע",
      /** A range's unit, spoken. */
      unit: "היחידה",
    },
    /** The reading's first line: the picks it is read for. */
    readFor: "קוראים את העסקה בשביל",
    readForLine: "כל עמלה נקראת במקרה שבחרתם כאן. עמלה שמשתנה לפי גודל הפעולה נקראת בכל הגדלים, בגרף שלמטה.",
    /** A fee the picks give no case (F-114), as its line in the glance and its slim line say it. */
    unmatched: "בתעריפון שהוזן אין מחיר למה שבחרתם, ולכן העמלה לא נקראת.",
    /** A fee whose sums are in the action's currency, read for something bought in a currency the deal does not know. */
    noCurrency: "הסכומים שלה במטבע של העסקה, ובמה שבחרתם המטבע לא ידוע, ולכן העמלה לא נקראת.",
    /** A fee the law bans here (the rule table's ban), as its card, its line in the glance and the law card say it, before its rules. */
    ban: {
      law: "כללי הבנקאות אוסרים על בנק לגבות אותה על מה שבחרתם, ולכן היא לא עולה כלום.",
      /** Where the rules ban it only read together (MF-71): the site's reading, not their words. */
      reading: "לפי כללי הבנקאות, בקריאת האתר, בנק לא גובה אותה על מה שבחרתם, ולכן היא לא עולה כלום.",
      /** BANK-51: a new bank, for five years from its licence, is outside the rules' closed list and tariffs (ss. 9ט, 9י). */
      newBank: "בנק חדש, בחמש השנים הראשונות מהרישיון שלו, לא כפוף לכללים האלה.",
      /** MF-71: the distribution fee a bank may charge on money-market units where the fund's manager has no agreement with it. */
      distribution: "על יחידות של קרן כספית בנק עדיין יכול לגבות עמלת הפצה של עד 0.1% בשנה, אם אין לו הסכם הפצה עם מנהל הקרן.",
    },
    /** What the reading states without computing (§10.6), after the fee's name and ": ". */
    stated: {
      third: "נוספת עמלה של צד שלישי בלי סכום בתעריפון, ולכן הפעולה עולה יותר ממה שמוצג.",
      thirdOf: { lead: "נוספת עמלת ", tail: " בלי סכום בתעריפון, ולכן הפעולה עולה יותר ממה שמוצג." },
      offset: { lead: "מתקזזת מול ", tail: " של אותו חודש, עד הסכום שלה. האתר מראה אותה בסכום המלא." },
      refund: { lead: "יש החזר של ", tail: ". האתר לא מנכה אותו." },
      /** A maximum on each security held: it bounds each security's charge, and the page cannot apply it without them. */
      maxPerSecurity: { lead: "המקסימום של ", tail: " הוא לכל נייר ערך, ולכן האתר לא מחשב אותו: הוא תלוי בכמה ניירות ערך מחזיקים ובשווי של כל אחד." },
      unfilled: "נגבית גם על הוראה שלא בוצעה.",
      /** At a bank, in the terms of the Bank of Israel's fee rules (BRK-16, notes to part 4(א)(1)). */
      unfilledClerk: "בניירות ערך בבורסה בתל אביב, חוץ מקרנות נאמנות, הוראה שניתנה דרך פקיד ולא בוצעה מסיבה שתלויה בכם נגבית במינימום.",
      /** At a bank, abroad, in the terms of the fee rules' own line for securities abroad (BRK-16, part 4(א)(4) note 1). */
      unfilledClerkAbroad: "בניירות ערך בחו״ל, הוראה שניתנה דרך פקיד ולא בוצעה מסיבה שתלויה בכם נגבית במינימום.",
      /** A list that prints a percent maximum beside a minimum and does not say which wins on a small action (F-12). */
      capRead: "התעריפון מפרסם מינימום וגם מקסימום באחוזים, ולא אומר מה משלמים בפעולה קטנה. האתר מחשב לפי המקסימום באחוזים, ואם המינימום הוא שחל, פעולה קטנה עולה יותר.",
      partial: "כל ביצוע חלקי נגבה בנפרד, ולכן הוראה שמתבצעת בחלקים יכולה לעלות את המינימום יותר מפעם אחת.",
    },
    /**
     * A step of a fee read across sizes (F-115), after the fee's name: "המרת מטבע, עד 100 $", "המרת מטבע, מעל 100 $"; and a step's top,
     * where the fee's price changes ("ב־100 $ משתנה המחיר של המרת מטבע.").
     */
    step: { from: ", מעל ", to: ", עד ", edge: { before: "ב־", mid: " משתנה המחיר של {name}." } },
  },
  /** The reading's section under the columns (method §10.6, `readingOf`). */
  reading: "קוראים את העסקה",
  read: {
    /** The periods of F-110 as cards. */
    periods: {
      kicker: "העסקה, תקופה אחרי תקופה",
      today: "היום",
      here: "אתם כאן",
      /** Before a period's first month in its title ("ממרץ 2027"), and before the month it ends. */
      from: "מ־",
      until: "עד ",
      /** Before the months left in today's period (a computed figure). */
      left: "עוד ",
      noEnd: "מכאן והלאה",
      sep: " · ",
      /** Before a price that changed at the period's start, by how it changed. */
      change: { starts: "מתחיל: ", ends: "נגמר: ", rises: "עולה: ", falls: "יורד: ", changes: "משתנה: " } as Record<string, string>,
      /** The headline: one change, after its month ("ממרץ 2028 …"), with the fee's name. */
      one: { starts: "נגמרת תקופת הפטור של {name}", ends: "המחיר של {name} יורד לאפס", rises: "המחיר של {name} עולה", falls: "המחיר של {name} יורד", changes: "המחיר של {name} משתנה" } as Record<string, string>,
      /** After a rise to or past the cap. */
      toCap: { at: " עד התקרה", above: " אל מעל התקרה" } as Record<string, string>,
      /** Several fees that all start after a free time. */
      starts: { one: "עמלה אחת מתחילה אחרי תקופת פטור", two: "שתי עמלות מתחילות אחרי תקופת פטור", many: "{n} עמלות מתחילות אחרי תקופת פטור" },
      /** Several changes at one month: the month's lead, then how many prices change. */
      oneMonth: { lead: "ב־", count: { one: "מחיר אחד", two: "שני מחירים", many: "{n} מחירים" }, after: " בעסקה", verb: " משתנים " },
      /** Changes at several months: up to three by month, more by their count and the first. */
      months: { lead: "העסקה משתנה ", at: "ב־", and: "וב־", sep: ", ", count: { one: "פעם אחת", two: "פעמיים", many: "{n} פעמים" }, first: ", הראשונה ב־" },
    },
    /** The two curves of F-112. */
    curves: {
      /** The kicker of a curve, by the action it prices (and its side, where a sale is priced apart), or holding. */
      kicker: {
        trade: "מה עולה קנייה או מכירה, לפי הגודל שלה",
        "trade:buy": "מה עולה קנייה, לפי הגודל שלה",
        "trade:sell": "מה עולה מכירה, לפי הגודל שלה",
        conversion: "מה עולה המרה, לפי הגודל שלה",
        deposit: "מה עולה הפקדה, לפי הגודל שלה",
        distribution: "מה עולה תשלום של ריבית או דיבידנד, לפי הגודל שלו",
        transfer_out: "מה עולה העברה החוצה, לפי הגודל שלה",
        held: "מה עולה להחזיק שנה, לפי הסכום",
        heldSaved: "מה עולה שנה של חיסכון, לפי הסכום שנצבר",
      } as Record<string, string>,
      /** The amount under the chart. */
      x: { trade: "גודל הפעולה", conversion: "גודל ההמרה", deposit: "גודל ההפקדה", distribution: "גודל התשלום", transfer_out: "גודל ההעברה", held: "הסכום שמוחזק", heldSaved: "הסכום שנצבר" } as Record<string, string>,
      /** The head of the reading at an amount: "{the action} של {amount}", or a year on what is held. */
      tipAction: (noun: string, amount: string) => `${noun} של ${amount}`,
      tipHeld: (amount: string) => `שנה על ${amount}`,
      total: "יחד",
      /** The periods to choose between where the curves differ by period, as a control's spoken name. */
      choose: "התקופה",
      /** The headline, around the sum a mark falls on (a computed figure). `{noun}` is the action. */
      head: {
        min: { before: "עד {noun} של ", after: " המינימום קובע, ומעל הסכום הזה משלמים אחוז" },
        max: { before: "מעל {noun} של ", after: " המקסימום קובע, ומתחת לסכום הזה משלמים אחוז" },
        minHeld: { before: "על פחות מ־", after: " המינימום קובע, ומעל הסכום הזה משלמים אחוז" },
        maxHeld: { before: "על יותר מ־", after: " המקסימום קובע, ומתחת לסכום הזה משלמים אחוז" },
        minMax: { before: "המינימום קובע עד ", middle: ", והמקסימום מעל ", after: ". ביניהם משלמים אחוז" },
        meet: { before: "מתחת ל־", sums: " הסכומים הקבועים", largest: " הם העלות הגדולה בהחזקה" },
        /** Where one fee is the sum per period: its name with the article, and the words that agree with it. */
        meetOne: { m: " הוא העלות הגדולה בהחזקה", f: " היא העלות הגדולה בהחזקה", mp: " הם העלות הגדולה בהחזקה", fp: " הן העלות הגדולה בהחזקה" } as Record<string, string>,
        /**
         * After a minimum's headline where the curve's fees are their whole group (F-111): the rate above the minimum's sum, between "מעליה"
         * (by the action's noun, or the sum held) and what the rate is a share of (the glance's words).
         */
        minRate: { lead: " המינימום קובע. ", above: { trade: "מעליה", conversion: "מעליה", deposit: "מעליה", distribution: "מעליו", transfer_out: "מעליה", none: "מעליה", held: "מעליו" } as Record<string, string>, cost: " העלות " },
        marks: { one: "העלות משנה התנהגות בסכום אחד", two: "העלות משנה התנהגות בשני סכומים", many: "העלות משנה התנהגות ב־{n} סכומים" },
      },
      /** Under a trade's curve that includes a conversion (F-111); the second where a sale costs the same. */
      conversion: "קנייה שלא בשקלים כוללת המרת מטבע.",
      sameSale: "מכירה עולה אותו דבר.",
      /** Beside a curve with a bound in another currency (F-112, F-84): "סכום בדולרים נכנס לגרף בשקלים: {rate} לדולר, לפי השער של {date}." */
      rate: { before: (plural: string) => `סכום ב${plural} נכנס לגרף בשקלים: `, per: { USD: " לדולר", EUR: " לאירו", GBP: " ללירה שטרלינג" } as Record<string, string>, date: ", לפי השער של " },
      /** A curve the site cannot draw: a bound in a currency it has no rate for. */
      undrawn: (plural: string) => `אין כאן גרף: מינימום או מקסימום בעסקה הוא ב${plural}, ולאתר אין עכשיו שער שלו.`,
      /** Under a curve of holding with a fee whose price list prints a maximum on the whole deposit, which no data field holds and the curve does not apply. */
      perDeposit: (fee: string) => `במחירון יש ל${fee} גם מקסימום לכל הפיקדון, והגרף לא מחיל אותו. מהשווי שבו המקסימום הזה מתחיל לחול, העמלה בפועל נמוכה ממה שהגרף מראה. האתר לא מחשב מאיזה שווי זה קורה, כי המקסימום הזה כתוב במחירון רק במילים.`,
      /** A curve with a price per unit (F-112): the unit's price, a chart's field, and beside it why the chart needs it. */
      unitPrice: "מחיר יחידה",
      unitWhy: "{name} היא לפי יחידות, ולכן הגרף צריך את מחיר היחידה.",
    },
    /** The statements of F-112 and the reading. */
    points: {
      kicker: "נקודות בעסקה",
      title: "איפה העסקה משנה התנהגות",
      /** Before a statement that holds only in some periods: from a month, until one. */
      from: "מ־",
      until: "עד ",
      untilAfter: " עד ",
      spanEnd: ": ",
      spanSep: ", ",
      /**
       * A part of an action's price and the stretch it decides (F-112): "{the part} של {name}, {its figure}, קובע בכל {noun} עד {amount}.",
       * from where it starts where that is above nothing ("מ־100 $ עד 8,333 $"), above the maximum's sum, and in units for a price per
       * unit ("של עד 200 יחידות"; past the sum where another part stops, "מעל 100 $ של עד 200 יחידות").
       */
      part: { min: "המינימום של {name}{side}, ", max: "המקסימום של {name}{side}, ", cap: "המקסימום באחוזים של {name}{side}, ", flat: "המחיר הקבוע של {name}{side}, " } as Record<string, string>,
      decides: ", קובע בכל {noun} ",
      upTo: "עד ",
      above: "מעל ",
      unitsUpTo: "של עד ",
      unitsAbove: "של יותר מ־",
      /** A bound in units whose stretch starts where a percent maximum's or a flat price's sum ends: "בכל פעולה מעל 100 $ של עד 200 יחידות". */
      unitsFrom: { above: "מעל ", upTo: " של עד " },
      end: ".",
      minHeld: { before: "המינימום של {name}, ", middle: " לכל חיוב, קובע על פחות מ־", after: "." },
      maxHeld: { before: "המקסימום של {name}, ", middle: " לכל חיוב, קובע על יותר מ־", after: "." },
      /** A share of what is held charged more often than its rate's period: "{name}, 0.4% בשנה, נגבה כל חודש: חלק אחד מ־12 בכל פעם." */
      every: { before: "{name}, ", part: ": חלק אחד מ־{k} בכל פעם." },
      /** A share with a minimum and no maximum. */
      noMax: "{name}{side}: יש מינימום ואין מקסימום, ולכן מעל המינימום העמלה גדלה עם הסכום בלי גבול.",
      /**
       * A sum per unit with a minimum and no maximum: "{name}: מעל 200 יחידות העמלה גדלה עם מספר היחידות", and where a percent maximum caps
       * it ", ולא עוברת 1% מהפעולה".
       */
      noMaxUnits: { before: "{name}{side}: מעל ", grows: " העמלה גדלה עם מספר היחידות", cap: ", ולא עוברת ", end: "." },
    },
    /** The law rows of F-113. */
    law: {
      kicker: "מה החוק קובע",
      above: { one: "עמלה אחת גבוהה ממה שמותר לגבות", two: "שתי עמלות גבוהות ממה שמותר לגבות", many: "{n} עמלות גבוהות ממה שמותר לגבות" },
      at: { one: "עמלה אחת מגיעה למקסימום שמותר לגבות", two: "שתי עמלות מגיעות למקסימום שמותר לגבות", many: "{n} עמלות מגיעות למקסימום שמותר לגבות" },
      below: "העמלות שנבדקו מול התקרה מתחתיה",
      /** No number in it: one fee, or several. */
      noCap: { one: "לעמלה שבעסקה לא נמצאה תקרה בחוק", several: "לעמלות שבעסקה לא נמצאה תקרה בחוק" },
      notJudged: "אף מחיר בעסקה לא נבדק מול תקרה",
      /** A fee the law bans here, where no price is above or at its cap. */
      banned: { one: "עמלה אחת בעסקה בנק לא גובה, לפי כללי הבנקאות", several: "יש בעסקה עמלות שבנק לא גובה, לפי כללי הבנקאות" },
      /** Before a price after the first: the month it starts. */
      from: "מ־",
    },
  },
  /** The bar's end: the deals this device keeps, a link to the deal, and the template picker. */
  end: {
    deals: "העסקאות שלי",
    /** The list's spoken name. */
    dealsName: "העסקאות שנשמרו במכשיר הזה",
    newDeal: "עסקה חדשה",
    words: { confirm: "למחוק את העסקה מהמכשיר הזה?", confirmYes: "מחיקה", confirmNo: "ביטול", rename: "שינוי השם", remove: "מחיקת העסקה", renameField: "שם העסקה" },
    link: "קישור לעסקה",
    copied: "הקישור הועתק",
    /** The line a saved deal just deleted leaves under the bar, before its name. */
    deleted: "נמחקה מהמכשיר: ",
    /** Under a saved deal's name in the list: its product, and the day it was last saved (`savedOn` before the date). */
    savedOn: "נשמרה ב־",
    /** Closes the line that says a template opened a new deal. */
    dismiss: "סגירה",
    /** The clipboard refused: the address to copy by hand. */
    copyBlocked: "ההעתקה לא הצליחה. אפשר להעתיק את הקישור מכאן:",
    linkField: "הקישור לעסקה",
    template: "לבחור תבנית",
    /** Said once a template opened a new deal: from a house's price list, or from a track. */
    opened: { house: (name: string) => `נפתחה עסקה חדשה מהתעריפון של ${name}.`, track: (name: string) => `נפתחה עסקה חדשה מהמסלול ${name}.` },
    /** After it, where the device keeps deals. */
    kept: " העסקה הקודמת שמורה ב״העסקאות שלי״.",
  },
  /** The template picker (a sheet). */
  picker: {
    house: { title: "לבחור תבנית", lede: "העמלות מהתעריפון האחרון של כל בית.", group: "בתי השקעות ובנקים" },
    track: { title: "לבחור מסלול", lede: "הבחירה ממלאת את דמי הניהול של המסלול מהממוצע שרשות שוק ההון מפרסמת: מהחיסכון, ומההפקדה כשיש לה נתון." },
    /** After a track's yearly fee on the savings, at its row's end. */
    saving: "בשנה מהחיסכון",
    /** After the lede where the picker was opened from the bar, whose pick opens a new deal (not from the builder's track step). */
    newDeal: "הבחירה פותחת עסקה חדשה, והעסקה שעל המסך נשארת כמו שהיא.",
    search: "חיפוש לפי שם",
    clear: "ניקוי החיפוש",
    none: "אין תבנית בשם הזה.",
    /** Under a price list: how many of its lines it leaves out of the deal, or that it has none for what the deal holds. */
    leaves: { one: "שורה אחת לא נכנסת", two: "שתי שורות לא נכנסות", many: "{n} שורות לא נכנסות" },
    noHolding: "אין בו שורות למה שהעסקה מחזיקה",
  },
  /** What a template filled and left out, in the builder. */
  filled: {
    /** Before the template's name. */
    from: { house: "העסקה מולאה מהתעריפון של ", track: "העסקה מולאה מהמסלול " },
    left: "מה לא נכנס מהתבנית",
    /** Why a price list's line fills nothing (templates.ts, `LeftWhy`). */
    why: {
      "per-dollar": "מחיר המרה בשקלים לכל דולר: העסקה מתמחרת המרה באחוז ממנה.",
      "bound-currency": "מינימום ומקסימום בשני מטבעות, או מינימום ומקסימום על מה שמוחזק שלא בשקלים: העסקה לא יכולה לרשום אותם.",
      ambiguous: "שתי שורות בתעריפון חלות על העמלה, והתעריפון לא אומר איזו מהן.",
      "no-value": "שורה בלי מחיר.",
      "no-period": "אחוז ממה שמוחזק בלי תדירות גבייה: העסקה לא יודעת כל כמה זמן הוא נגבה.",
      plan: "מחיר של תוכנית מסוימת, כמו הוראת קבע: חל רק עליה.",
      "set-aside": "מחיר שמופיע בתעריפון, אבל המסמכים של הבית לא מראים שלקוח רגיל יכול לקבל אותו.",
      "another-line": "שורה אחרת של אותה עמלה היא זו שחלה על מה שהעסקה מחזיקה.",
      "other-base": "עמלה שהתבנית לא ממלאת.",
      "spread-unpriced": "המרה בלי עמלה, אבל עם מרווח בשער שהתעריפון לא מגביל: העסקה לא מחשבת את המרווח, ולכן ההמרה עולה בפועל יותר.",
      /** BRK-16 part 4(א)(1) and footnote 4: the line prices tracking funds and listed funds, and no other mutual fund. */
      "bank-funds": "בבנק השורה הזו לא מתמחרת קרן נאמנות אקטיבית, לפי כללי העמלות של בנק ישראל, ולכן לקרן כזו אין כאן מחיר קנייה ומכירה. קרן מחקה פתוחה מתומחרת כמו ניירות ערך בתל אביב, ואפשר לבחור בזה בקריאה.",
      "spread-on-top": "על ההמרה נוסף מרווח בשער שהתעריפון לא מגביל: העסקה לא מחשבת את המרווח, ולכן ההמרה עולה בפועל יותר.",
      redemption: "מחיר לפדיון במועד הפירעון: חל רק על פדיון כזה, לא על קנייה ומכירה.",
      /** A maximum on the whole deposit the record prints beside the one on each security, which the page does not apply yet. */
      "per-deposit": "המחירון קובע גם מקסימום לכל הפיקדון, ליד המקסימום לכל נייר ערך. האתר לא מחיל אותו עד שיהיה לו שדה בנתונים, ולכן על פיקדון גדול העמלה בפועל יכולה להיות נמוכה ממה שמוצג.",
      "distribution-yearly": "עמלת הפצה בשנה על יחידות של קרן נאמנות, לפי סוג הקרן: העסקה עוד לא יכולה לרשום אחוז בשנה ממה שמוחזק בעמלה הזו, ולכן היא לא נכנסת.",
      "no-holding": "בתעריפון אין שורות למה שהעסקה מחזיקה, ולכן לא נכנסה ממנו אף עמלה.",
      "none-by-rule": "בתקנות דמי הניהול אין למוצר הזה דמי ניהול מההפקדה, רק מהחיסכון.",
      "track-no-value": "בנתונים של רשות שוק ההון אין מספר כזה למסלול הזה.",
    } as Record<string, string>,
  },
} as const;

/** The input names of the fee page's readings (values.ts `inputKey`, `deal:` and the fee's kind): each fee's figure, its bounds and its
 *  yearly figure, by the fee's name. A second fee of one kind, and any after it, is numbered in its key (`deal:custody 2.min`); the sheet
 *  names it from these, the number after the fee's name (provenance-sheets.tsx, `inputName`). Added to the sheet's names here, where the
 *  fee names above and the guide's are both defined. */
function dealInputNames(): Record<string, string> {
  const out: Record<string, string> = { cap: "התקרה", account_sums: "הסכומים הקבועים בשנה", custody_rate: "האחוז ממה שמוחזק בשנה" };
  // the rate a curve converts a bound in another currency at (reading.ts, `rateKey`)
  for (const [code, name] of Object.entries(feeDeal.rateNames)) out[`deal:rate:${code}`] = name;
  const kinds = [...Object.keys(guideBlocks.fees).filter((k) => typeof guideBlocks.fees[k] === "object" && guideBlocks.fees[k].name), ...Object.keys(feeDeal.names)];
  for (const k of kinds) {
    const name: string = guideBlocks.fees[k]?.name ?? feeDeal.names[k]!;
    out[`deal:${k}`] = name;
    out[`deal:${k}.min`] = `${name}: המינימום`;
    out[`deal:${k}.max`] = `${name}: המקסימום`;
    out[`deal:${k}.yearly`] = `${name}, בשנה`;
    for (const part of ["cap", "flat", "upTo", "discount", "third", "thirdMin", "thirdMax", "refund", "perSecurity"] as const) out[`deal:${k}.${part}`] = `${name}: ${feeDeal.panel.parts[part]}`;
  }
  out["deal:unit-price"] = feeDeal.panel.parts.unitPrice;
  return out;
}
for (const [key, name] of Object.entries(dealInputNames())) computedInputs.names[key] ??= name;

/** A link into the fee page from a page of what a deal can be of (a guide, a track): the page by its title. */
export const feePageLink = `לעמוד ״${feeDeal.title}״`;

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
  // each count in its Hebrew form; the digit shows (inside a Num) only in `many`
  forms: {
    goals: { one: "מטרה אחת", two: "שתי מטרות", many: "מטרות" },
    holdings: { one: "החזקה אחת", two: "שתי החזקות", many: "החזקות" },
    names: { one: "שם אחד שלא קוטלג", two: "שני שמות שלא קוטלגו", many: "שמות שלא קוטלגו" },
    comparisons: { one: "השוואה שמורה אחת", two: "שתי השוואות שמורות", many: "השוואות שמורות" },
    offers: { one: "הצעה שהזנתם", two: "שתי הצעות שהזנתם", many: "הצעות שהזנתם" },
    variants: { one: "חשיפה עם הנחות שהזנתם", two: "שתי חשיפות עם הנחות שהזנתם", many: "חשיפות עם הנחות שהזנתם" },
    ticks: { one: "סימון אחד ב״איך עוברים״", two: "שני סימונים ב״איך עוברים״", many: "סימונים ב״איך עוברים״" },
    ownRates: { one: "ריבית שהזנתם להשוואה", two: "שתי ריביות שהזנתם להשוואה", many: "ריביות שהזנתם להשוואה" },
    deals: { one: "עסקה שמורה אחת בעמוד העמלות", two: "שתי עסקאות שמורות בעמוד העמלות", many: "עסקאות שמורות בעמוד העמלות" },
  },
  // one person per device; a private window or cleared site data erases the work
  onePerDevice: "האתר שומר מכשיר אחד לאדם אחד: אין בו פרופילים נפרדים.",
  erasedNote: "בחלון פרטי או אחרי ניקוי נתוני האתר, מה שנשמר כאן נמחק. שמרו קובץ מהעמוד הזה.",
  // the load's report is true
  nothingNew: "בקובץ אין שום דבר חדש: הכול כבר במכשיר הזה.",
  duplicatesForms: { one: "פריט אחד זהה כבר היה במכשיר ולא נטען שוב.", two: "שני פריטים זהים כבר היו במכשיר ולא נטענו שוב." }, // A91: the singular and dual of `duplicates`
  sideFailed: "ההצעות, ההנחות והסימונים לא נשמרו במכשיר הזה.",
  rejectedHeading: "לא ייטענו, כי שדה בהם לא תקין:",
  rejectedItem: "{kind} {at}, {field}: {problem}.",
  rejectedKinds: { goal: "מטרה", holding: "החזקה", comparison: "השוואה שמורה", input: "ערך במדריך", offers: "הצעה", variants: "הנחות לחשיפה", ticks: "סימונים", ownRates: "ריבית שהוזנה", deals: "עסקה שמורה" }, // ownRates:
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
    horizonYears: "השנים עד המטרה", amountNow: "סכום היום", monthly: "ההפקדה החודשית", available: "הסכום הזמין",
    age: "הגיל", salary: "השכר", pension: "הפקדות לפנסיה", hishtalmut: "הפקדות להשתלמות", hishtalmutYearly: "ההפקדה השנתית להשתלמות",
    return: "התשואה", inflation: "האינפלציה", insurance: "דמי הביטוח בקרן הפנסיה", acceptedFall: "הירידה שמסכימים לספוג",
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
/** D33: a group's companies shown as one company, under the name people know it by; copy.md 8.7. */
export const brands = {
  searchLine: "בית השקעות",
  members: "כולל את החברות:",
  listHeading: "כל המוצרים של",
  funds: {
    groups: { etf: "קרנות סל", tracking: "קרנות מחקות", "money-market": "קרנות כספיות", other: "קרנות נאמנות" },
    count: { one: "קרן אחת", two: "שתי קרנות", many: "קרנות" },
    /** Over a company page's fund table: which funds it holds. Where the fees come from is the fee head's ("לפי הדוח של הקרן"), and on a
     *  phone the line over the list that opens the fees' cards under that head. */
    collected: "רק הקרנות שהאתר אסף עליהן דוח, לא כל הקרנות של החברה.",
    /** The fund table (design-system 11 "Lists of products"): the head carries the words, the cell the value. */
    columns: { name: "שם הקרן", number: "מספר נייר", index: "המדד", kind: "סוג הקרן", fees: "דמי ניהול לפי הדוח של הקרן" },
    /** The "?" by the fees' head: one sheet of the three glossary terms, under this line. The names are the glossary's keys. */
    feeTerms: ["דמי ניהול קבועים", "דמי ניהול משתנים", "שכר נאמן"],
    feeHelpLead: "בכל שורה שלושה מספרים מהדוח של הקרן:",
    feeWords: { fixed: "קבועים", variable: "משתנים", trustee: "נאמן" },
    /** The phone row's lead before the three fees, and the word before the index's name (the head the phone has not got). */
    phoneFees: "דמי ניהול:",
    indexWord: "מדד",
    numberWord: "מספר נייר",
    /** The number is the link to the fund's page on Maya; this is its spoken name. */
    mayaLink: (n: string) => `${n}, בדף הקרן במאיה`,
    moneyMarketKinds: { daily: "קרן כספית יומית", renewable: "קרן כספית מתחדשת" },
  },
} as const;

/** The company pages' template (components/company/): the side list, the overview, the product views. */
export const companyPage = {
  overview: "סקירה",
  navLabel: "המוצרים של החברה",
  /** "מה יש במיטב", "מה יש ב־IBI": the overview's heading. */
  whatsIn: (name: string) => (/^[A-Za-z0-9]/.test(name) ? `מה יש ב־${name}` : `מה יש ב${name}`),
  whatsInBank: "מה יש בבנק",
  /** The list's groups, the names of the kinds of product on /companies. */
  groups: { savings: "גמל, השתלמות ופנסיה", funds: "קרנות", trade: "מסחר בניירות ערך" },
  /** The folded list on a phone: what is shown, and its words. */
  fold: { shown: "מוצג:", more: "מוצרים אחרים", less: "סגירה" },
  units: {
    funds: (n: number) => countPhrase(n, { one: "קרן אחת", two: "שתי קרנות", many: "קרנות" }),
    deposits: (n: number) => countPhrase(n, { one: "פיקדון אחד", two: "שני פיקדונות", many: "פיקדונות" }),
    plans: (n: number) => countPhrase(n, { one: "תוכנית אחת", two: "שתי תוכניות", many: "תוכניות" }),
  },
  /** The overview's line of a product. */
  overviewLine: { rate: "ריבית בשנה:", to: "עד", assets: "כסף מנוהל:", fees: "דמי ניהול מהחיסכון:", asOf: "נכון לסוף ", funds: "קרנות שהאתר אסף עליהן דוח" },
  /** A bank's overview row: the fact's label over its figure (designer's mocks, 2026-11-10). */
  overviewFact: {
    /** The range's label: its periods, and the linkage of its records where it names one (a linked rate is not ranged with an unlinked). */
    rate: (period: string | null, linkage: string | null = null) => ["ריבית בשנה", linkage, period].filter(Boolean).join(", "),
    /** The linkage the label names: the records of the range are of this one, while the product holds others too, or a linked one alone. */
    linkage: { none: "לא צמודה", cpi: "צמודה למדד", fx: "צמודה למט״ח" } as Record<string, string>,
    /** A current account's rate, where the bank pays it only on its conditions (the product's part spells them out). */
    current: (conditional: boolean) => (conditional ? "ריבית בשנה על יתרת זכות, בתנאים" : "ריבית בשנה על יתרת זכות"),
    parts: "מה יש בו",
    asOf: "נכון ל־",
  },
  /** A manager's overview table. */
  overviewTable: {
    cols: { product: "המוצר", count: "כמה", assets: "כסף מנוהל", fees: "דמי ניהול", go: "פתיחה" },
    fundsFees: (n: number) => (n === 1 ? "לפי הדוח של הקרן" : "לפי הדוח של כל קרן"),
    tariff: "לפי התעריפון",
    /** Where the table holds tracks, the heads say what their figures are: the fee range's words and the money's date as muted lines under
     *  the heads. */
    heads: { fees: (year: string | null) => (year ? `הממוצע שנגבה ב־${year}, מהחיסכון: מהזול ליקר` : "במסלולים: מהחיסכון, מהזול ליקר"), assets: (period: string) => `נכון לסוף ${period}` },
    /** On a phone, whose rows have no heads, the same in a note under the table; the date of managed money comes before `end`. */
    note: { fees: (year: string | null) => (year ? `דמי הניהול במסלולים הם הממוצע שנגבה ב־${year}, מהחיסכון, מהמסלול הזול ליקר.` : "דמי הניהול במסלולים הם מהחיסכון, מהמסלול הזול ליקר."), assets: "הכסף המנוהל נכון לסוף ", end: "." },
  },
  deposits: {
    asOf: "לפי פרסום הבנק, נכון ל־",
    sharedDeposits: "נכון לכל הפיקדונות בטבלה:",
    sharedPlans: "נכון לכל התוכניות בטבלה:",
    beforeTax: "הריבית שנתית ונומינלית, לפני המס על הריבית.",
    amount: "כמה מפקידים",
    allAmounts: "כל הסכומים",
    fixed: "קבועה",
    variable: "משתנה",
    cols: { deposit: "הפיקדון", plan: "התוכנית", amount: "סכום ההפקדה", rate: "ריבית בשנה", rateBand: "ריבית בשנה, לפי סכום ההפקדה" },
    compare: "השוואה לפיקדונות בבנקים אחרים",
    /** The spoken name of a row's fold button. */
    detail: (name: string) => `פרטים על ${name}`,
    /** The fold button's marks: what its details hold that should not hide silently. */
    marks: { note: "יש הערה של הבנק", doubt: "יש ספק בנתון", stale: "הנתון לא עודכן" },
    /** The tax said once for each linkage, in the shared box. */
    taxIn: { none: "בפיקדון לא צמוד", cpi: "בפיקדון צמוד למדד", fx: "בפיקדון צמוד למט״ח" },
    taxOf: { unlinked: "המס של ריבית לא צמודה", linked: "המס של ריבית צמודה" },
    taxRates: "השיעורים בעמוד המדריך.",
    /** The shared box in plain sentences (designer's mocks, 2026-11-10). */
    say: {
      rate: "הריבית נומינלית, שנתית ולפני המס על הריבית.",
      rateType: { fixed: "הריבית קבועה.", variable: "הריבית משתנה." },
      unlinked: { deposits: "הפיקדונות לא צמודים.", plans: "התוכניות לא צמודות." },
      renew: { no: "אין חידוש אוטומטי", yes: "יש חידוש אוטומטי", upTo: (n: string) => `חידוש אוטומטי עד ${n} פעמים` },
      /** "אין אפשרות שבירה, ואין חידוש אוטומטי." */
      and: (a: string, b: string) => `${a}, ו${b}.`,
      exits: (x: string) => `תחנות יציאה: ${x}.`,
    },
    modelWord: "דגם",
    /** Under the table: the product's guide page, which says how its interest is taxed. */
    whatIsTax: (name: string) => `מה זה ${name}, ואיך הריבית ממוסה`,
  },
  docs: {
    about: (product: string) => `מה כתוב במסמכים על ${product}`,
    more: (company: string) => `עוד במסמכים של ${company}`,
    line: "תנאים שכתובים במסמכים של החברה ולא בחוק. בחברה אחרת הם יכולים להיות שונים. לחיצה על המספר פותחת את הרשומה המלאה.",
    /** The overview's lead over the entries about none of the products (designer's mocks, 2026-11-10). */
    moreLine: (whose: string) => `תנאים שכתובים במסמכים של ${whose} ולא בחוק. מה שנוגע למוצר אחד מופיע אצל המוצר.`,
    bank: "הבנק",
    /** The side list's link to a product's entries. */
    part: (n: number) => `מה כתוב במסמכים · ${n}`,
  },
  /** A small label over a bank's side list. */
  bankList: "בעמוד של הבנק",
} as const;

export const r4catalogue = {
  headings: { fundManagers: "מנהלי קרנות" },
  classWord: { bank: "בנק", broker: "בית השקעות" },
  fundManagerCount: "קרנות",
  ledeIntro: "כל מה שהבנק מציע, עם הסבר לכל מוצר.",
  ledeDeposits: "הפיקדונות לפי פרסום הבנק, נכון ל־",
  ledeTariff: "התעריפון נאסף ב־",
  groups: { deposits: "פיקדונות", savings: "תוכניות חיסכון", current: "עו״ש", brokerage: "חשבון ניירות ערך" },
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
  term: { months: "חודשים", none: "ללא תקופה", day: "יום אחד", twoDays: "יומיים", days: "ימים", year: "שנה", twoYears: "שנתיים", years: "שנים" },
  rateType: { fixed: "ריבית קבועה", variable: "ריבית משתנה:", prime: "פריים", less: "פחות", more: "ועוד" },
  linkage: { none: "לא צמוד", cpi: "צמוד למדד", fx: "צמוד למט״ח" },
  tax: { unlinked: "ריבית לא צמודה; השיעור בעמוד המדריך.", linked: "ריבית צמודה; השיעור בעמוד המדריך." },
  /** A deposit's amounts on every page (lib/deposit-kind.ts `amountRangeForm`): "מ־1,000 ₪", "1,000 עד 50,000 ₪", "עד 50,000 ₪", "ללא מינימום". */
  amount: { from: "מ־", fromWord: "מ", fromDay: "מיום", to: "עד", noMin: "ללא מינימום", above: "מעל", notIncluded: "(לא כולל)" },
  breakWord: { not_allowed: "אין אפשרות שבירה", with_penalty: "שבירה בקנס", none: "שבירה בלי קנס" },
  // a deposit that cannot be broken but has exit points: "אין אפשרות שבירה" alone read as "the money is locked" beside its exits
  breakAtExits: "אין אפשרות שבירה; אפשר למשוך רק בתחנות היציאה",
  breakDisclosure: "הבנק כותב:",
  exits: {
    every: "כל",
    none: "אין",
    some: "יש",
    someCard: "יש; המועדים בתנאי הבנק",
    // a first exit point later than the interval after it (Leumi's prime plan: "בתום 6 חודשים, וכל 3 חודשים לאחר מכן")
    afterThen: (first: string, every: string) => `אחרי ${first}, ואז כל ${every}`,
    // a first exit point with no interval in the record
    firstAfter: (first: string) => `הראשונה אחרי ${first}`,
  },
  // a deposit's kind (`variant`) as a label chip on the bank page: what sets it apart from the bank's plain deposit
  kindLabels: {
    "deposit-campaign": { text: "מבצע", explain: "בטבלת הריביות של הבנק הפיקדון הזה מסומן כמבצע. מה צריך כדי לקבל את הריבית שלו כתוב בתנאי הבנק." },
    "deposit-new-customers": { text: "רק למצטרפים חדשים", explain: "הבנק מציע את הפיקדון רק למי שמצטרף אליו עד תאריך שהוא מפרסם. מי שכבר לקוח של הבנק לא יכול לפתוח אותו." },
    "deposit-closed-system": { text: "בלי חשבון בבנק הזה", explain: "פיקדון במערכת סגורה: פותחים אותו בלי חשבון עו״ש בבנק הזה. הכסף מגיע רק מחשבון שלכם בבנק אחר וחוזר רק אליו." },
    "deposit-interest-during-term": { text: "ריבית במהלך התקופה", explain: "הבנק משלם את הריבית במהלך התקופה, לא רק בסופה. כל כמה זמן, כתוב בתנאי הבנק." },
    "deposit-best-of": { text: "בחירה בסוף התקופה", explain: "בסוף התקופה הבנק משלם את הטוב מבין כמה דרכים לחשב את הרווח. אילו דרכים, ומה קורה ביציאה לפני הזמן, כתוב בתנאי הבנק." },
  },
  /** The lead of the line that links a deposit kind's sheet to the bank's own table. */
  kindDoc: "טבלת הריביות של הבנק",
  /** The record's own conditions (`conditions_he`), on its card. */
  conditionsLead: "בתנאי הבנק:",
  // a deposit's kind on a sheet line, where its name repeats at the bank and its table prints no code (F-104)
  depositKind: {
    fixed: "ריבית קבועה",
    variable: "ריבית משתנה",
    cpi: "צמוד למדד",
    fx: "צמוד למטבע חוץ",
    exits: "תחנת יציאה",
    // a first exit point with no interval in the record, and exit points whose timing the record does not give
    exitFirstAfter: (first: string) => `תחנת יציאה ראשונה אחרי ${first}`,
    // no comma inside: the words stand in a list that is itself joined by commas
    exitAfterThen: (first: string, every: string) => `תחנת יציאה אחרי ${first} ואז כל ${every}`,
    exitsSome: "עם תחנות יציאה",
  },
  autoRenewWord: { yes: "כן", no: "לא", upTo: "עד", times: "פעמים" },
  currentConditions: "תנאי הריבית, כפי שהבנק כותב",
  /** BANK-13 and BANK-14: a rate published under directive 447 is the minimum the bank pays for the deposit type. */
  notAnOffer: "הריבית היא המינימום שהבנק מפרסם לסוג הפיקדון, לא הצעה אליכם.",
  rowLinks: { whatIs: "מה זה" },
  /** copy.md 8.4: the page's "נכון ליום" is after the day the record was read (flow 33, point 11); no string in copy.md */
  asOfAfterRead: "התאריך מאוחר מיום הקריאה",
  card: {
    collectedAt: ", נאסף ב־",
    notice: "הודעה על שינוי בעמלות",
    /** the index page with this house picked */
    compare: "להשוואה מול שאר הבנקים ובתי ההשקעות",
    stale: { before: "התעריפון נאסף ב־", after: "; מאז ייתכן שהשתנה." },
    minimum: "מינימום לפתיחת חשבון",
    minimumNone: "לא נמצא בתעריפון",
    /** the fees as a table (the account "should have a standard way"): the heads carry the words */
    cols: { covers: "על מה נגבה", price: "המחיר", where: "איפה זה כתוב" },
    /** the short link in the table's column: the page of the price list, or of another document named in the row */
    page: (n: number) => `עמוד ${n}`,
    inTariff: "בתעריפון",
    otherDoc: "במסמך אחר",
    /** a fee charged on each transfer of securities out, after its amount; a price per share, after its amount */
    perTransfer: "להעברה",
    perShare: "למניה",
    /** what a fee on the account itself is charged on, in the row of the price list's table */
    onAccount: {
      fixed_period: "בלי קשר לסכום שבחשבון",
      transfer_out: "כשמעבירים את ניירות הערך לחשבון שלכם בגוף פיננסי אחר",
    },
    /**
     * a distribution fee (MF-24): the fund manager pays it to the house the units are held through, under a distribution agreement. A
     * bank's price list prints it as a line charged to the unit's buyer ("עמלת הפצה מרוכש יחידת השתתפות"): without an agreement for the
     * fund a bank may charge the holder up to that fee (MF-26), which `withoutAgreement` says on a bank's card
     */
    distribution: {
      name: "עמלת הפצה",
      who: (to: string) => `מנהל הקרן משלם אותה ${to} על יחידות הקרן שמחזיקים דרכו, כשיש ביניהם הסכם הפצה.`,
      withoutAgreement: "בלי הסכם כזה הבנק רשאי לגבות אותה מכם.",
      /** At a bank, the weak line with the fee's strip: what may fall on the reader stays in sight, its rules in the strip's "?". */
      chargeable: "בלי הסכם הפצה הבנק רשאי לגבות אותה מכם.",
      toBank: "לבנק",
      toBroker: "לבית ההשקעות",
    },
    bounds: { min: "מינימום", max: "מקסימום" },
    /** a bound charged on each trade, after its amount */
    perTrade: "לפעולה",
    /** a percentage fee whose documents print no bound: the site charges none, and says so rather than leave the cell blank */
    noBound: { min: "ללא מינימום", max: "ללא מקסימום" },
    /** a flat price for a small conversion or order (F-12, F-13), after its amount and before the sum it holds up to: "3.30 $ להמרה של עד 99 $" */
    flatUpTo: { fx: "להמרה של עד", trade: "לפעולה של עד" },
    factsTitle: "פתיחת חשבון ופיקוח",
    regulator: "הגוף המפקח",
    tase: "חבר בורסה",
    protectionDisclosure: "מה מגן על הכסף",
    channel: { direct: "ערוצים ישירים", branch: "סניף" },
    /** copy.md 8.4: how often a custody percentage is charged; the tariff states the period, copy.md names none */
    period: { month: "לחודש", quarter: "לרבעון", year: "לשנה" },
    /** D57 amended: the details of a house's account stand on its page, each as its own part of the card */
    priceFor: "למי המחירים כאן",
    /** the two-way switch over the fee table, where the price list prices a fee by channel */
    channelPick: "איפה נותנים את ההוראה",
    whereTariff: (page?: number) => (page ? `בתעריפון, עמוד ${page}` : "בתעריפון"),
    // a document whose name already says its page is not given the page twice
    whereOther: (title: string, page?: number) => (page && !/עמ'|עמוד/.test(title) ? `${title}, עמוד ${page}` : title),
    /** a conversion spread the binding documents do not limit is never shown as zero (D56) */
    spreadNotLimited: "מרווח ההמרה: המסמכים לא קובעים לו תקרה",
    spreadUpTo: "מרווח ההמרה: עד",
    /** a conversion line between two foreign currencies, beside the shekel one (the price lists' own words, "המרה בין שני מטבעות זרים") */
    fxToFx: "בין שני מטבעות זרים",
    linesTitle: "העמלות",
    /** under the fee table, where some fee is priced by channel */
    channelNote: "שורה שהמחיר שלה תלוי בערוץ מסומנת בשם הערוץ, והמספרים שלה מתחלפים במקום כשמחליפים ערוץ.",
    /** under the can-buy list, when one document says it all */
    canBuyFrom: "לפי",
    canBuy: {
      title: "מה אפשר לקנות כאן",
      state: { yes: "אפשר", no: "אי אפשר", unknown: "לא ברור" } as Record<"yes" | "no" | "unknown", string>,
      source: "איפה זה כתוב",
    },
    claims: {
      title: "מה כתוב בפרסום, ומה במסמכים",
      lead: "המחירים כאן הם לפי התעריפון והתקנונים, המסמכים שמחייבים את החברה. מה שכתוב בפרסום שלה לא תמיד תואם אותם:",
    },
    groupsTitle: "מחירים לקבוצות ומבצעים",
    groupsLead: "המחירים האלה לא נכנסים להשוואה בין הבנקים ובתי ההשקעות, כי הם תלויים במי שקונה. ההשוואה מחשבת לפי המחיר ללקוח רגיל.",
  },
  regulators: { BoI: "בנק ישראל", ISA: "רשות ניירות ערך", CMA: "רשות שוק ההון, ביטוח וחיסכון" },
  instrumentClasses: {
    etf_units: "קרן סל",
    tase_foreign_fund_units: "קרן חוץ הנסחרת בבורסה",
    tase_shares_bonds: "מניות ואיגרות חוב",
    mutual_fund_units: "יחידות של קרן נאמנות",
    foreign_securities: "ניירות ערך זרים",
    makam: "מק״מ",
    money_market_units: "קרן כספית",
    tase_bonds: "איגרות חוב בבורסה בתל אביב",
  },
  missingTariff: "התעריפון עוד לא נאסף.",
  missingLinks: { tariffPageBefore: "לעמוד התעריפון של ", compare: "להשוואה מול שאר הבנקים ובתי ההשקעות (הבנק מופיע שם בלי מחיר)", /* copy.md 8.4: the broker's form of the parenthesis */ compareBroker: "להשוואה מול שאר הבנקים ובתי ההשקעות (בית ההשקעות מופיע שם בלי מחיר)" },
  brokerClassLine: "בית השקעות, חבר בורסה שהוא לא בנק",
  searchGroupBank: "בנקים ומוצרי בנק",
} as const;

/** "א, ב וג": a list in running Hebrew, "ו" before the last. */
const andList = (items: string[]) => (items.length < 2 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} ו${items[items.length - 1]}`);

/** Group prices (D43): the line under a house's row and its sub-rows, on the indices page and on the house's page (kit/group-prices.tsx). */
export const groupPrices = {
  /** the row's figure uses the price list's price, not the lower one under it */
  notCounted: "לא בחישוב",
  /** "מחיר אחר לצעירים, לסטודנטים וללקוחות פפר": each group after "ל" */
  line: (who: string[]) => `מחיר אחר ${andList(who.map((w) => `ל${w}`))}`,
  kinds: { young: "צעירים", soldier: "חיילים", released: "חיילים משוחררים", student: "סטודנטים", salary: "מעבירי משכורת" } as Record<string, string>,
  /** The young on the closed line, with the ages their groups print: "צעירים בגילאי 14 עד 21.5" */
  youngAges: (from: string | null, to: string | null, topVaries?: boolean) =>
    from && to ? `צעירים בגילאי ${from} עד ${to}` : from && topVaries ? `צעירים מגיל ${from} (עד גיל שונה בכל קבוצה)` : from ? `צעירים מגיל ${from}` : to ? `צעירים עד גיל ${to}` : "צעירים",
  // "מגיל 14" alone read as no upper age to two young readers, where one group prints its top age and another none
  colWho: "מי",
  colCheaper: "מה זול יותר",
  colEnds: "עד מתי",
  noFund: "המסמך לא מזכיר קרנות",
  fundsOnly: (fees: string[]) => `המסמך מזכיר קרנות רק לגבי ${andList(fees)}`,
  fees: { trade: "קנייה ומכירה", custody: "דמי הניהול", trade_israel: "קנייה ומכירה בארץ", trade_abroad: "קנייה ומכירה בחוץ לארץ", custody_israel: "דמי הניהול בארץ", custody_abroad: "דמי הניהול בחוץ לארץ" } as Record<string, string>,
  noFundNote: "כשהמסמך לא מזכיר קרנות, לא ידוע אם המחיר חל גם על קרן מחקה או על קרן סל.",
  /** The link on a sub-row that opens the account panel with this group's prices in the person's column. */
  ownAccount: "לחשבון במחיר הזה בהשקעה במדד",
  /** The held account of a house's group picked on the index page: its name wherever the pair names it. */
  pickedName: (house: string, group: string) => `${house}, ל${group}`,
  /** The radio on a sub-row the person can pick: what picking it does, for a screen reader. */
  pickLabel: (group: string) => `חשבון במחיר ל${group}`,
  /** On the account tile, above the house's groups, when one of them is picked. */
  pickedLine: (group: string) => `במחיר ל${group} כל עוד הוא נמשך, ואחר כך לפי התעריפון`,
  /** Under the sub-rows, when some can be picked: why the others cannot. */
  pickNote: "אפשר לבחור מחיר של קבוצה כשהמסמך מזכיר בו קרנות וכתוב בו כמה זמן הוא נמשך.",
  toPage: (house: string) => `לעמוד של ${house}, עם המקורות`,
  sources: "איפה זה כתוב:",
  atPage: (n: number) => `עמוד ${n}`,
  atRows: (rows: number[]) => (rows.length === 1 ? `שורה ${rows[0]}` : `שורות ${rows.slice(0, -1).join(", ")} ו־${rows[rows.length - 1]}`),
  /** a house with no group price on securities says why */
  states: {
    none_on_securities: "יש נספח לקבוצות, אבל אין בו מחיר לניירות ערך.",
    no_mention: "במסמכים שנקראו לא מוזכרת קבוצה עם מחיר אחר.",
    not_read: "האתר לא הצליח לקרוא את המחירים לקבוצות.",
  } as Record<string, string>,
};

/** A claim of a house's advertising set against its binding documents (D57; kit/claim-check.tsx). */
export const claims = {
  verdict: { contradicted: "המסמך אומר אחרת", offer: "רק בתנאים", not_found: "לא כתוב במסמכים" } as Record<string, string>,
  fee: { custody: "דמי משמרת", account: "דמי טיפול", trade: "קנייה ומכירה", conversion: "המרת מטבע", standing_order: "הוראת קבע" } as Record<string, string>,
  ad: "בפרסום",
  binding: "במסמך המחייב",
  notFound: "במסמכים המחייבים זה לא כתוב. המסמך שנבדק:",
  seen: (date: string) => `נראה ב־${date}`,
  dated: (date: string) => `מ־${date}`,
  quote: (words: string) => `״${words}״`,
  atPage: (title: string, page: number) => `${title}, עמוד ${page}`,
};

// Release 4: words of the index page's house and fund rows (docs/copy.md 8.0, 8.1, 8.2; flows 15.1, 15.2). The
// strings the build added are in the "Added 2026-10-24" tables of copy.md 8.0, 8.1 and 8.2, keyed by path. A `{…}` of
// copy.md is a function argument; every figure is a value object rendered by the provenance number, never typed here.
export const r4workbench = {
  // ---- 8.0 everywhere
  levels: { list: "תעריפון", average: "ממוצע שפורסם", entered: "ההצעה שלכם" },
  regulators: { BoI: "בנק ישראל", ISA: "רשות ניירות ערך", CMA: "רשות שוק ההון, ביטוח וחיסכון" } as Record<string, string>,
  notComparable: {
    dataMissing: "התעריפון לא נאסף.",
    noLine: (cls: string) => `בתעריפון אין שורה ל${cls}.`,
    // a house whose trade lines abroad name one exchange only (One Zero: "ניירות ערך זרים הנסחרים בארה״ב"), and a fund on the other
    otherVenue: (houseVenue: "us" | "europe") => (houseVenue === "us" ? "בחשבון הזה קונים בחו״ל רק ניירות ערך שנסחרים בארה״ב, והקרן הזו נסחרת באירופה." : "בחשבון הזה קונים בחו״ל רק ניירות ערך שנסחרים באירופה, והקרן הזו נסחרת בארה״ב."),
    noLineChannel: (cls: string, channel: string) => `בתעריפון אין שורה ל${cls} ב${channel}.`,
    noAverage: (cls: string) => `לא נאסף ממוצע לשורות שחלות על ${cls}.`,
    lineWithoutValue: (name: string) => `בשורה ״${name}״ חסר ערך בתעריפון.`,
    /** copy.md 8.0: the engine refuses a tariff whose lines it cannot choose between (a plan, a sub-class); the page says so rather than guess a price */
    ambiguous: (cls: string) => `בתעריפון יש כמה שורות שחלות על ${cls}, ולאתר אין עדיין דרך לבחור ביניהן בלי לנחש:`,
    /** a fee per unit bought, and the fund's unit price is not collected */
    needsSharePrice: "העמלה בתעריפון נקבעת לפי מספר היחידות, ומחיר היחידה של הקרן עוד לא נאסף.",
    /** a minimum or fee in a foreign currency the site has no rate for */
    needsFxRate: "התעריפון קובע עמלה במטבע חוץ, ולאתר אין שער למטבע הזה.",
    /** the engine cannot read the tariff without guessing */
    recordError: "האתר לא מצליח לקרוא את התעריפון הזה בלי לנחש, ולכן לא מחשב לו מחיר.",
  },
  noAverage: "אין ממוצע שנאסף",
  noAverageReason: "ממוצעי בנק ישראל ומחשבון העמלות של הבורסה מוצגים רק בקישור: הפרסום מחדש דורש הסכמה בכתב.",
  noAverageLinks: { boi: "ללוח הנתונים של בנק ישראל", tase: "למחשבון העמלות של הבורסה" },
  notPrinted: "לא מודפס",
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
  links: {
    /** the index page, where every house is priced */
    providersCompare: "להשוואת הבנקים ובתי ההשקעות",
  },

  // ---- 8.1 the channel words the index page reads
  providers: {
    behaviour: {
      orders: "פעולות בחודש",
      channelOptions: { direct: "ערוצים ישירים" },
    },
  },
} as const;

// ---------------------------------------------------------------------------------------------------------------
// Knowledge layer (8dd1f013:research/knowledge/2026-10-24-synthesis.md). Keys are fixed; the Hebrew editor
// polishes the values. docs/copy.md gets a section listing these strings.
// ---------------------------------------------------------------------------------------------------------------

/** The source block under a rule's text and in the number sheet (synthesis §3.3). */
export const sourceBlock = {
  checked: "נבדק",
  mayHaveChanged: "מאז ייתכן שהנוסח השתנה.",
  pdfTag: "PDF",
  more: { one: "עוד מקור אחד", two: "עוד שני מקורות", many: "עוד {n} מקורות" },
  /** The word after "נבדק {date} ·" when the source is weaker than the law. */
  weak: { institution: "לפי החברה", secondary: "מקור משני" } as Record<string, string>,
  /** The one-line citation the copy button writes: "{claim} — {publisher}, {document}, {locator}. {url} (נבדק {date})" */
  citation: { checked: "נבדק", copied: "הועתק" }, // was "ההפניה הועתקה."; the box's own label turns into it
  /** The lede sentence of the rules pages' legend: where a text comes from and what a date is. */
  legendLine: "הכול נכתב מנוסח החוק או ממסמך של הרשות כשאפשר; מה שנלקח ממסמך של חברה מסומן לידו. התאריך הוא היום שבו האתר קרא את המקור.",
} as const;

/**
 * Hebrew for the `update_rule` words the rule records carry (shown beside a figure with its tax year). "fixed in regulation" covers every
 * binding text below a law that the records cite with it (regulations, a regulator's circulars and directives, the exchange's rules and index rules), so
 * its word names none of them in particular. "fixed in document" is a figure that the document the figure cites fixes without binding
 * anyone at large (a tax ruling, a report, an index provider's own methodology): it says the figure is as that document, shown in the source line, has it.
 */
export const updateRules = {
  "fixed in law": "קבוע בחוק",
  "cpi-linked 1 jan": "מתעדכן ב־1 בינואר לפי מדד המחירים לצרכן",
  "average-wage-linked": "מתעדכן לפי השכר הממוצע",
  "provider-set": "החברה קובעת",
  "fixed in regulation": "קבוע בכללים",
  "fixed in document": "קבוע במסמך המקור",
  market: "לפי השוק",
  founder: "פרמטר של האתר",
  frozen: "מוקפא בשנים {years}",
  "set yearly": "נקבע מחדש בכל שנה",
} as const;

/**
 * Who a rule applies to (D30; 8dd1f013:research/specs/2026-10-25-rules-scope/spec.md §4): the rule card's label and lines by
 * scope, the chip of a company's term, "תלוי בחברה", the company pages' section, the rules page's line and the search group.
 * `{names}` is a Hebrew list ("הראל ואלטשולר שחם"), `{name}` one company.
 */
export const scopeWords = {
  // "על {names}": a record about companies that rests on none of their documents
  tag: { general: "חל על כולם", institution: "של {names}", unsettled: "לא הוכח שחל על כולם", about: "על {names}" },
  line: {
    institution: "נמצא במסמכים של {names}; בחברות אחרות זה יכול להיות אחרת.",
    notTheirs: "המקורות כאן הם לא מסמכים של {names}.",
    unsettledSeen: "נמצא במסמכים של {names}. אולי כך בכל החברות; האתר לא מצא לזה מקור רשמי.",
    unsettled: "אולי כך בכל החברות; האתר לא מצא לזה מקור רשמי.",
  },
  /** The card's foot: where the company's terms are listed, one link per company. */
  allAt: "לכל מה שהאתר מצא אצל {name}",
  allNoCompany: "לכל מה שלא נכלל ככלל",
  /** A record the rule base keeps that is not a rule (a list, a count, a site's terms, a company's tariff): its card's tag and, when it cites a company's document, its line. */
  notRule: {
    tag: "לא נכלל ככלל",
    lineOwn: "נמצא במסמכים של {names}. האתר לא מציג את זה ככלל, ושומר אותו עם המקור בין מה שלא נכלל ככלל.",
  },
  /** The card's foot of a general rule on a page about one product. */
  rulesOf: "לכל החוקים והכללים של {product}",
  /** The chip of a record that names several companies: "לאומי ועוד 3". */
  chipMore: { one: "ועוד אחת", two: "ועוד שתיים", many: "ועוד {n}" },
  /** Where a property is each company's own: the guide's line and checklist mark, with the companies as links. */
  varies: "תלוי בחברה",
  /** On a guide's row: the companies named are the ones read, not the whole market. */
  variesExamples: "תלוי בחברה, לדוגמה",
  variesBank: "תלוי בבנק",
  noPage: {
    title: "מה כתוב במסמכים של חברות שאין להן עמוד כאן",
    // what no company's section lists: the records the rule base keeps that are not rules
    none: { title: "לא נכלל ככלל: פרסומים, ספירות ונתונים", line: "מה שהאתר שומר עם המקור אבל לא מציג ככלל: רשימות וספירות, נתונים, תנאי שימוש של אתרים, תעריפונים של חברות, ומקומות שבהם האתר חיפש כלל ולא מצא.", fold: "הרשימה המלאה" },
  },
  /** The rules page: company terms are not listed there. */
  rulesLine: { before: "כאן רק חוקים וכללים שלא תלויים בחברה מסוימת. מה שכתוב רק במסמכים של חברה מסוימת מופיע בעמוד של אותה חברה.", link: "לרשימת החברות" },
  searchGroup: "אצל חברות מסוימות",
  /** "and" before the last name of a list: joined to a Hebrew name, with a maqaf before a Latin one (copy.md 10.4). */
  and: { hebrew: "ו", latin: "ו־" },
} as const;

/** Additions to the rule card (synthesis §3.3). */
export const ruleCardMore = {
  forTaxYear: "לשנת המס",
  derivedFrom: "נגזר מ־",
  derivedLine: "זו מסקנה משילוב של כמה חוקים וכללים, לא משפט אחד שנמצא במקור.",
  /** A general rule's pointers to companies' terms: named examples, never a derivation. */
  examples: "לדוגמה:",
  stable: "לא משתנה מעצמו",
  usesLead: "משפיע על",
  usesEngine: "החישובים באתר",
  usesNone: "רקע בלבד: לא נכנס לחישוב ולא מוצג בעמוד אחר.",
  // "הפניה" for a citation; a better Hebrew word: "מראה מקום", on a box that shows the citation
  copyCitation: "העתקת מראה המקום",
  citationLabel: "מראה מקום",
} as const;

/** The rules page's whole rule, opened from its row (`RuleDetail`). */
export const rulesDetail = {
  sourcesHead: "מקורות",
} as const;

/** The rules page: a field, the products, the five questions and every rule as a row; a rule's detail beside the list or on its own. */
export const rulesFront = {
  title: "חוקים וכללים",
  lede: "אמרו לכם משהו על הכסף, או שאתם קוראים תנאים של בנק או של חברה אחרת? כתבו את זה כאן, ותראו מה כתוב על זה, ואיפה.",
  // the claim field: what a person was told, checked against the law and against what each company wrote; a rule's id opens that rule
  ask: {
    label: "מה אמרו לכם, מה קראתם בתנאים, או מספר של חוק או כלל",
    placeholder: "מה אמרו לכם, או מספר כלל כמו TXH-09",
    clear: "ניקוי",
    examplesLead: "למשל:",
    examples: ["מותר לבנק לשנות עמלה בלי להודיע", "אפשר למשוך קרן השתלמות אחרי 3 שנים", "אם הברוקר פושט רגל, הכסף אובד"],
  },
  facts: { title: "שווה לדעת", more: "עוד עובדות", toRule: "לפירוט המלא" },
  /** The product list: on a computer beside the rules, on a phone a button that opens it. */
  nav: {
    label: "מוצר",
    title: "בחירת מוצר",
    groups: { bank: "בבנק", market: "בשוק ההון", provident: "גמל והשתלמות", pension: "פנסיה", other: "אחר" } as Record<string, string>,
    count: "{n} חוקים וכללים",
    countOne: "חוק או כלל אחד",
  },
  changingOnly: "רק מה שעומד להשתנות",
  questions: "לפי השאלה",
  none: "אין חוק או כלל שעומד להשתנות במוצר הזה.",
  row: { sources: "{n} מקורות", sourceOne: "מקור אחד", recheck: "ייבדק שוב", more: "ועוד {n}", openPart: "יש בו שאלה פתוחה" },
  detail: {
    back: "לרשימה",
    empty: "בחרו חוק או כלל מהרשימה, והנוסח המלא והמקורות שלו יופיעו כאן.",
    companies: "מה כתוב על זה בתקנונים של חברות",
    companiesDocs: "{n} מסמכים",
    companiesDocOne: "מסמך אחד",
  },
  claim: {
    tabs: { law: "בחוק ובכללים", companies: "אצל חברות" },
    product: "מוצר",
    question: "שאלה",
    all: "הכול",
    filter: "סינון",
    top: "ההתאמה הקרובה ביותר",
    more: "עוד {n} חוקים וכללים",
    moreOne: "עוד חוק או כלל אחד",
    near: "לא נמצאה התאמה מלאה; אלה הכי קרובים.",
    nothing: "לא נמצא שום דבר. אפשר לנסות במילים אחרות, או לבחור אחת הדוגמאות.",
    lawNone: "אין כאן חוק או כלל שמתאימים למה שכתבתם ולסינון יחד.",
    lawAll: "לכל ה־{n}",
    companiesLine: "כל מסמך חל רק על החברה שלו. הקישור פותח את העמוד במסמך שבו הנושא מופיע; האתר לא מסכם מה כתוב שם.",
    companiesNone: "במסמכי החברות שהאתר קרא אין כרגע נושא שמתאים למה שכתבתם.",
    groups: { bank: "בנקים", fund: "קופות גמל וקרנות השתלמות", other: "ברוקרים ובתי השקעות" },
    cols: { company: "חברה", document: "מסמך", edition: "מהדורה", where: "איפה כתוב" },
    page: "עמוד {n}",
    noEdition: "לא צוינה",
    companyRead: "מה שהאתר כבר קרא בתנאים של חברות",
  },
  shelves: {
    state: { name: "מה המדינה לוקחת", line: "מס בהפקדה, בדרך ובמשיכה; פטורים; מה חייב בדיווח" },
    costs: { name: "מה הבנק, בית ההשקעות או החברה המנהלת לוקחים", line: "דמי ניהול ותקרות, עמלות, הנחות שנגמרות, מינימום" },
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
  /** `/rules/<shelf>`, the old addresses of the five questions: the line that leads on to the page, opened on that question. */
  presetAll: "לחוקים והכללים על השאלה הזו",
} as const;

/** The documents page (synthesis §3.5). */
export const documents = {
  title: "מסמכים",
  lede: "המסמכים שמאגר החוקים והכללים נקרא מהם: חוקים, תקנות, חוזרים ומדריכים של הרשויות, ומסמכים של בנקים וחברות. לכל מסמך, מה שנשען עליו.",
  sections: { laws: "חוקים ותקנות", regulators: "רשויות ומפקחים", exchange: "הבורסה", institutions: "מסמכים של בנקים וחברות" },
  kinds: { law: "חוק", regulation: "תקנות", circular: "חוזר", regulator_page: "עמוד באתר הרשות", official_pdf: "מסמך רשמי", exchange_rules: "הנחיות הבורסה", institution_doc: "מסמך של החברה", article: "כתבה", dataset: "מאגר נתונים", form: "טופס", other: "מסמך" } as Record<string, string>,
  rulesLead: "מה שנשען על המסמך:",
  more: { one: "עוד מסמך אחד", many: "עוד {n} מסמכים", line: "מסמכים שרק חוק או כלל אחד או שניים נשענים עליהם: עמודים של חברות ומקורות נוספים." },
  rulesMore: "עוד {n}",
  checked: "נבדק לאחרונה",
  open: "למסמך",
  /** In an opened kind of document while its cards come, and if they could not. */
  loading: "טוען…",
  failed: "המסמכים לא נטענו. רעננו את העמוד ונסו שוב.",
  data: {
    title: "נתונים שהאתר קרא",
    lede: "תעריפונים, תנאי פיקדונות, דוחות של קרנות וסדרות נתונים, כל אחד עם התאריך שבו נקרא ועם העמוד באתר שמשתמש בו.",
    tariffs: "תעריפונים",
    tariffLine: "תעריפון {provider}",
    linesAfter: " שורות בתעריפון",
    /** A price list the site has not read: every record marked so names a list that exists and could not be read (a human check, a page
     *  with no text) or a price left open, never a house with no published list, so it is "not collected", as on the company's card (D105). */
    missing: "התעריפון עוד לא נאסף",
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
 * "What makes it different" on a guide page (D29, 8dd1f013:research/specs/2026-10-25-guide-signatures/spec.md): the frame, then one block per
 * visual. Builder G1 owns the cash-like pages (`account`, `deposit`, `plan`, `ladder`, `renewable`, `makam`, `bond`); builder G2 adds its own keys.
 */
export const guideSignature = {
  indexTitle: "מה מייחד",
  titleBefore: "מה מייחד", // without "את" ("מה מייחד קרן כספית מתחדשת")
  pages: {
    "current-account": { name: "חשבון עובר ושב", question: "כמה עולה להשאיר כסף בעו״ש?", alt: "קרן כספית יומית", altId: "money-market-fund-daily", altLine: "אותו כסף, באותה זמינות. כך נראה ההפרש." },
    "savings-plan": { name: "תוכנית חיסכון", question: "מתי אפשר לקחת את הכסף?", alt: "פיקדון בנקאי חד־פעמי", altId: "bank-deposit", altLine: "אותו סכום בפיקדון אחד שנפתח בבת אחת." },
    "money-market-fund-daily": { name: "קרן כספית יומית", question: "כמה מהר הכסף חוזר, ומה הוא מרוויח עד אז?", alt: "עו״ש ופיקדון לשנה", altId: "current-account", altLine: "הסולם מראה איפה הקרן עומדת מול עו״ש ומול פיקדון לשנה." },
    makam: { name: "מק״מ", question: "מה קורה אם מוכרים לפני הפדיון?", alt: "פיקדון לשנה", altId: "bank-deposit", altLine: "בפיקדון לשנה היציאה לפני הסוף תלויה בבנק; במק״מ אפשר למכור בכל יום מסחר, במחיר של אותו יום." },
    "government-bond": { name: "אג״ח ממשלתית", question: "מה קורה למחיר כשהריבית זזה?", alt: "מק״מ", altId: "makam", altLine: "הלוואה קצרה לממשלה: כשהריבית זזה, מחיר המק״מ כמעט לא זז." },
    "keren-hishtalmut": { name: "קרן השתלמות", question: "כמה כסף נשאר לכם, ומתי?", alt: "", altId: "", altLine: "" },
    "pension-comprehensive": { name: "קרן חדשה מקיפה", question: "מאיפה בא כל שקל מההפקדה, ומה הוא קונה?", alt: "", altId: "", altLine: "כאן אין השוואה למוצר מחוץ לפנסיה: חיסכון לפנסיה הוא חובה לשכיר, לפי צו ההרחבה, וגם לעצמאי. שכיר יכול לבחור קרן מקיפה או קופת גמל לקצבה עם כיסוי למקרה מוות או נכות, וההבדלים ביניהן כתובים בעמוד." },
    "pension-general": { name: "קרן חדשה כללית", question: "מאיפה בא כל שקל מההפקדה, ומה הוא קונה?", alt: "", altId: "", altLine: "כאן אין השוואה למוצר מחוץ לפנסיה: חיסכון לפנסיה הוא חובה לשכיר, לפי צו ההרחבה, וגם לעצמאי. שכיר יכול לבחור קרן מקיפה או קופת גמל לקצבה עם כיסוי למקרה מוות או נכות, וההבדלים ביניהן כתובים בעמוד." },
    "provident-for-annuity": { name: "תגמולים ואישית לפיצויים", question: "מאיפה בא כל שקל מההפקדה, ומה הוא קונה?", alt: "", altId: "", altLine: "כאן אין השוואה למוצר מחוץ לפנסיה: חיסכון לפנסיה הוא חובה לשכיר, לפי צו ההרחבה, וגם לעצמאי. שכיר יכול לקיים כאן את החובה במקום קרן מקיפה, אם יש לו כיסוי למקרה מוות או נכות, באותה קופה או במקום אחר." },
  } as Record<string, { name: string; question: string; alt: string; altId: string; altLine: string }>,
  altBefore: "הכי קרוב לזה, באותה החזקה:",
  altLinkBefore: "לעמוד של",
  timeline: { summary: "שחקו עם המספרים שלכם", hide: "הסתרת המספרים", lead: "גרף לדוגמה של כסף שנכנס, גדל לפי הנחה ויוצא אחרי עלויות ומס. אפשר לשנות כל הנחה." },
  common: {
    notComputed: "עוד לא חושב",
    rangeTo: "עד", // a range is "1.55% עד 2.25%", not a dash (wording.md)
    // one sentence for the rate most banks pay on a current account, on the current-account page and under the money-market ladder
    // "רוב" only where the rate is more than half the banks' (F-85 is the most common rate, which may be a half or less)
    commonRate: { before: "רוב הבנקים משלמים בעו״ש", beforeMode: "הריבית הנפוצה ביותר בעו״ש היא", of: "מתוך", after: "הבנקים שנאספו." },
    // after the fund's line in the legend: its return, the site's assumption (a caution: its short form stays in sight), and a "?" with why
    fundAssumption: { note: "בשנה, הנחה של האתר", about: "התשואה שהאתר מניח לקרן", help: "אין תשואה שפורסמה לקרן כספית שהאתר רשאי להציג, ולכן הקרן רצה כאן על תשואה שהאתר מניח. זו הנחה של האתר, לא הבטחה ולא תחזית." },
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
      ret: "התשואה שהאתר מניח",
      inflation: "האינפלציה שהאתר מניח",
    },
    outOfRange: { before: "הסכום מחוץ לטווח שהריבית שפורסמה נקבעה לו:", middle: "עד", after: "." },
    gaps: {
      depositBreak: "הבנק מתאר שבירה בתנאים שהאתר עוד לא מחשב.",
      planLockPerDeposit: "ההנחה כאן: לכל הפקדה חודשית יש נעילה משלה, באורך תקופת התוכנית, כמו בפיקדון שנפתח בכל חודש. אין כלל כללי שקובע את זה: כל בנק קובע בהסכם התוכנית שלו. בחוזה של בנק אחד שהאתר קרא, התוכניות נפתחות כולן יחד, בנקודת יציאה שנספרת מתחילת התוכנית. שאלה פתוחה BANK-OQ12",
      accountBanks: "הריביות שהבנקים מפרסמים על יתרה בעו״ש עוד לא נאספו.",
      depositBanks: "הריביות שהבנקים מפרסמים על פיקדון לשנה עוד לא נאספו.",
    } as Record<string, string>,
    gapFallback: "הנתונים לזה עוד לא נאספו.",
  },
  account: {
    balance: "יתרה בעו״ש",
    // G3: the page leads with 0%; most banks pay nothing on a current account, and the interest of the few that do is a fold
    headline: { lead: "אחרי", inAccount: "בעו״ש שווים", today: "בכסף של היום:", less: "פחות", more: "יותר", same: "בלי שינוי" },
    mostPayNothing: "רוב הבנקים לא משלמים ריבית על עו״ש, ולכן הכסף מאבד מערכו בקצב עליית המחירים.",
    modePaysNothing: "הריבית הנפוצה ביותר על עו״ש היא אפס, ובבנק כזה הכסף מאבד מערכו בקצב עליית המחירים.",
    todayMoney: { before: "בכסף של היום: מה שהסכום יקנה במחירים של היום. המחירים עולים", after: "בשנה (הנחה של האתר), ולכן סכום שלא גדל קונה פחות עם השנים. הסכומים אחרי מס ועלויות." },
    axisNote: "הציר האנכי לא מתחיל באפס, כדי שההפרש ייראה.",
    fold: {
      title: "חלק מהבנקים כן משלמים ריבית, בתנאים ועל סכום קטן בלבד",
      anchorId: "current-account-banks",
      rateHelp: "כך כל בנק פרסם את הריבית שלו בלוח הריביות לפי הוראה 447 של בנק ישראל. היא לא מגיעה לכל לקוח: כל בנק קובע תנאים.",
      columns: { bank: "בנק", rate: "ריבית בשנה", who: "למי היא מגיעה", max: { before: "בשנה על", after: ", אחרי מס" } },
      until: "עד",
      silent: {
        title: "לא משלמים ריבית",
        nothing: "כלום",
        sentence: { one: "כתב בפרסום שלו", many: "כתבו בפרסום שלהם", rest: "את המשפט שבנק ישראל דורש מבנק שלא מציע ריבית:", quote: "״לא מוצעת ריבית על יתרת זכות״." },
        printedZero: { mid: "כתב בפרסום ריבית", end: "." },
      },
      /**
       * A paying bank whose own condition on the balance the balance entered breaks (F-26, `balance_conditions`): nothing at that balance,
       * and the condition in the bank's figure. By what the condition measures, its bound, and whether the figure itself is in: the words
       * before the figure, the prefix joined to it, and the words after it.
       */
      broken: {
        word: "כלום ביתרה הזו",
        lead: "הבנק משלם רק",
        daily_balance: {
          min: { in: { before: "כשהיתרה בעו״ש היא", prefix: "", after: " ומעלה בכל יום" }, out: { before: "כשהיתרה בעו״ש גבוהה", prefix: "מ־", after: " בכל יום" } },
          max: { in: { before: "כשהיתרה בעו״ש לא עולה על", prefix: "", after: " בכל יום" }, out: { before: "כשהיתרה בעו״ש נמוכה", prefix: "מ־", after: " בכל יום" } },
        },
        average_balance: {
          min: { in: { before: "כשהיתרה החודשית הממוצעת היא", prefix: "", after: " ומעלה" }, out: { before: "כשהיתרה החודשית הממוצעת גבוהה", prefix: "מ־", after: "" } },
          max: { in: { before: "כשהיתרה החודשית הממוצעת לא עולה על", prefix: "", after: "" }, out: { before: "כשהיתרה החודשית הממוצעת נמוכה", prefix: "מ־", after: "" } },
        },
        total_assets: {
          min: { in: { before: "כשסך הנכסים בחשבון הוא", prefix: "", after: " ומעלה" }, out: { before: "כשסך הנכסים בחשבון גבוה", prefix: "מ־", after: "" } },
          max: { in: { before: "כשסך הנכסים בחשבון לא עולה על", prefix: "", after: "" }, out: { before: "כשסך הנכסים בחשבון נמוך", prefix: "מ־", after: "" } },
        },
      },
    },
    worth: {
      many: { mid: "מתוך", after: "הבנקים שנאספו משלמים ריבית על יתרה בעו״ש" },
      one: { mid: "מתוך", after: "הבנקים שנאספו משלם ריבית על יתרה בעו״ש" },
      oneWord: "בנק אחד",
      conditionalCapped: { many: ", כולם בתנאים ועל יתרה של עד", one: ", בתנאים ועל יתרה של עד", only: "בלבד" },
      conditional: { many: ", כולם בתנאים", one: ", בתנאים" },
      capped: { many: ", כולם על יתרה של עד", one: ", על יתרה של עד", only: "בלבד" },
      best: "הכי הרבה:",
      at: "אצל",
      link: "לטבלה",
    },
    chart: { aria: "גרף: מה קורה ליתרה בעו״ש ובקרן כספית לאורך השנים, בכסף של היום", account: "בעו״ש", fund: "בקרן כספית", baseline: "הסכום שהתחלתם בו", cost: "מה שמפסידים בעו״ש" },
    figures: { account: "בעו״ש", fund: "בקרן כספית יומית", fundTerm: "קרן כספית יומית", cost: "מה שמפסידים בעו״ש" },
    about: {
      account: "מה שנשאר בעו״ש בסוף התקופה, אחרי מס, בכסף של היום",
      fund: "מה שנשאר בקרן כספית יומית בסוף התקופה, אחרי עלויות ומס, בכסף של היום",
      cost: "מה שהקרן מוסיפה על העו״ש באותה תקופה, בכסף של היום",
      change: "ההפרש בין מה ששווה היתרה בסוף התקופה לבין הסכום שהתחלתם בו, בכסף של היום",
      maxYear: "הכי הרבה שהבנק משלם בשנה על היתרה, אחרי המס שהוא מנכה, ללקוח שעומד בתנאים",
    },
    inputs: { rate: "הריבית שהבנק מפרסם", common: "הריבית הנפוצה ביותר בעו״ש", ceiling: "התקרה: היתרה שנושאת ריבית", tax: "המס שהבנק מנכה על הריבית" },
    today: "היום",
    after: "אחרי",
  },
  deposit: {
    // F-104: what the collected one-year deposits say about breaking them, counted over the banks
    // the exit column of a deposit beside its break term, on the sheet of a count that reads both (F-104)
    exitsInput: "תחנות יציאה",
    breakAbout: { deposits: "כמה פיקדונות לשנה נאספו מטבלאות הריביות של הבנקים", banks: "מכמה בנקים נאספו הפיקדונות לשנה", lockedBanks: "בכמה בנקים אי אפשר לשבור אף אחד מהפיקדונות לשנה שנאספו", lockedBanksWithExits: "בכמה מהבנקים האלה יש פיקדון לשנה עם תחנות יציאה", bankDeposits: "כמה פיקדונות לשנה נאספו מהבנק הזה", withPenalty: "כמה מהפיקדונות לשנה שנאספו מהבנק הזה אפשר לשבור עם קנס", free: "כמה מהפיקדונות לשנה שנאספו מהבנק הזה אפשר לשבור בלי קנס" },
    about: { rangeLo: "הריבית הנמוכה ביותר מבין הפיקדונות הרגילים לשנה שנאספו, אחד מכל בנק", rangeHi: "הריבית הגבוהה ביותר מבין הפיקדונות הרגילים לשנה שנאספו, אחד מכל בנק", rangeCount: "מכמה בנקים נאסף פיקדון רגיל לשנה בריבית קבועה", exampleCount: "כמה פיקדונות רגילים לשנה שאי אפשר לשבור אותם נאספו", noExitCount: "בכמה מהפיקדונות הרגילים לשנה שנאספו אי אפשר למשוך את הכסף לפני סוף התקופה",},
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
    // the example runs on Leumi's plan (P-05); other banks' plans are collected too, on terms of their own
    onlyCollected: "לפי הפרסום של לאומי. האתר אסף תוכניות חיסכון גם מבנקים אחרים, והתנאים שלהן שונים.",
    lockLine: { before: "בתוכנית של לאומי התקופה היא", middle: "והריבית", after: "בשנה; אין אפשרות שבירה." },
    alt: { before: "בפיקדון חד־פעמי", ofBank: "של", forTerm: "לתקופה של", rate: "ריבית", middle: "כל הסכום נעול ואז פנוי בבת אחת." },
    rangeLine: "האתר קורא את הטווח בטבלה של הבנק כסכום להפקדה אחת; הטבלה לא אומרת זאת במילים.",
    about: { free: "מה שפנוי לקחת ביום שבחרתם: ההפקדות שהתקופה שלהן הסתיימה, אחרי מס", locked: "הכסף שהופקד ועדיין נעול ביום שבחרתם", last: "החודש שבו ההפקדה האחרונה נפתחת" },
  },
  ladder: {
    // a table of the four products instead of a filter over cards; how soon the money is back is a coloured tag with
    // an icon and a word (no made-up unit), the rate a bar with its figure; the notes are a list under it
    columns: { product: "מוצר", when: "מתי הכסף אצלכם", rate: "ריבית שנתית" },
    caption: "ארבעה מוצרים לפי כמה מהר הכסף חוזר, וריבית כל אחד",
    rows: { "current-account": "עו״ש", "money-market-fund-daily": "קרן כספית יומית", "money-market-fund-renewable": "קרן כספית מתחדשת", "bank-deposit": "פיקדון לשנה" } as Record<string, string>,
    when: { "any-time": "בכל רגע", "trading-day": "תוך יום מסחר", "fixed-dates": "במועדים קבועים", "at-maturity": "בסוף התקופה" } as Record<string, string>,
    tradingDay: "הוראה עד השעה היעודה, הכסף באותו יום",
    interval: { before: "עד", after: "חודשים בין מועדים" },
    thisOne: "המוצר בעמוד",
    // a row whose rate is one bank's own figure names the bank ("פיקדון לשנה של לאומי"), D30/D31
    ofBank: "של",
    kinds: { assumption: "לפי ריבית בנק ישראל", range: { before: "טווח ב־", after: "פיקדונות רגילים שנאספו" } },
    take: { before: "הקרן היומית זמינה כמעט כמו", term: "עו״ש", after: ", ולפי הריבית שהאתר מניח היא משלמת, לפני העלויות שלה, לפחות כמו המוצרים שמחזירים את הכסף לאט יותר. אחרי העלויות היא יכולה לשלם פחות מהם." },
    legend: { rate: "ריבית שנתית", range: "טווח בין הפיקדונות הרגילים שנאספו" },
    notes: {
      beforeTax: "ריבית שנתית לפני מס ועלויות.",
      assumption: "הריבית של שתי הקרנות היא הנחה של האתר לפי ריבית בנק ישראל, לא ריבית שפורסמה.",
      // F-86: the count of the collected one-year deposits that cannot be left early, naming none (D30)
      exit: { before: "פיקדון לשנה: ב־", of: "מתוך", after: "הפיקדונות הרגילים שנאספו אי אפשר למשוך את הכסף לפני סוף התקופה; באחרים אפשר, לפי תנאי הבנק.", all: "פיקדון לשנה: באף אחד מהפיקדונות הרגילים שנאספו אי אפשר למשוך את הכסף לפני סוף התקופה." },
    },
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
    feesWhose: { before: "לפי התעריפון של", middle: ", כי מבין", after: "הבנקים ובתי ההשקעות שנאספו, התעריפון הזה משאיר הכי הרבה בתוכנית לדוגמה. אצל האחרים העמלה שונה.", tied: "מבין הבנקים ובתי ההשקעות שנאספו, התעריפון הזה שקול לתעריפון של", tiedGap: "ההפרש קטן מסף התיקו של האתר," },
    taxSale: { before: "מס על", term: "רווח הון" },
    taxRedeem: "מס על הניכיון",
    // the fees line: how much of it is custody, and why the banks' ban on custody for makam does not reach the house
    feesCustody: { before: "מהן", after: "דמי ניהול פיקדון ניירות ערך", every: "שנגבים פעם ב־{n} חודשים" },
    custodyBan: { before: "האיסור לגבות דמי ניהול פיקדון ניירות ערך על מק״מ חל רק על בנקים, והתעריפון הזה הוא של", term: "בית השקעות", after: "." },
    // what the tax is the rate of, so a reader can redo it (15% of the gain shown was not the tax shown)
    taxBase: {
      fees: "המס הוא {rate} מ־{base}: הרווח עד עכשיו פחות {fees} של {kind} ששולמו {year} של המכירה.",
      year: "שנת המס",
      sale: "המס הוא {rate} מ־{base}: הרווח עד עכשיו.",
      // what the run does, not the law: custody paid by selling paper is the method's model (F-24), and whether the year's leftover fees
      // lower the tax on the discount is open (TX2 OQ11)
      redeemFees: "המס הוא {rate} מ־{base}: הניכיון. החישוב מניח ש{kind} משולמים במכירת חלק מהמק״מ, ומוריד אותם רק מהרווח על החלקים שנמכרו, שהוא כאן {fees}. עוד לא ברור אם היתרה מקטינה את המס על הניכיון: שאלה פתוחה.",
      // the fees the year's capital gains are reduced by (TXS-06): custody, and the account's fixed fee where the house charges one
      kind: { custody: "דמי ניהול פיקדון ניירות ערך", withAccount: "דמי ניהול פיקדון ניירות ערך ודמי חשבון קבועים" },
      redeem: "המס הוא {rate} מ־{base}: הניכיון.",
      about: { base: "הסכום שהמס מחושב עליו", fees: "דמי ניהול פיקדון ניירות ערך של שנת המס שירדו מהרווח. התקנות מתירות לנכות אותם מרווח ממכירת ניירות ערך באותה שנה." },
    },
    yieldLine: { before: "המחיר עולה לפי תשואה של", after: "בשנה. התשואה היא הנחה של האתר, לא ריבית שפורסמה." },
    redeem: "בפדיון המחיר הוא 100, הניכיון ממוסה כריבית, ועמלת הפדיון של התעריפון יורדת מהסכום שנפדה.",
    // F-86: the one-year deposit it is set against, as a range and a count over the collected banks (D30)
    altDeposit: { before: "לעומת זאת פיקדון לשנה, מבין אלה שנאספו, משלם", middle: "בשנה; ב־", of: "מתוך", after: "הפיקדונות האלה אין אפשרות שבירה.", all: "בשנה; באף אחד מהם אין אפשרות שבירה." },
    blocked: "המס על מכירה לפני הפדיון עוד לא מחושב:",
    about: { buy: "מחיר הקנייה ל־100, בתשואה שהאתר מניח", price: "מחיר המכירה ל־100, בתשואה שהאתר מניח", gain: "הרווח עד היום שבחרתם, לפני מס ועמלות", tax: "המס על הרווח", fees: "עמלות הקנייה, המכירה והפדיון ודמי ניהול פיקדון ניירות ערך, לפי התעריפון שבדוגמה", custody: "דמי ניהול פיקדון ניירות ערך שנגבו עד היום שבחרתם, לפי התעריפון שבדוגמה", net: "מה שנשאר אחרי עמלות ומס" },
  },
  bond: {
    amount: "סכום",
    years: "זמן עד הפדיון",
    shift: "שינוי בריבית בשוק",
    shiftUnit: "נקודות אחוז",
    shiftUnitOne: "נקודת אחוז",
    figures: { price: "מחיר ל־100 אם מוכרים היום", change: "שינוי מ־100", makam: "מק״מ, אותו שינוי בריבית" },
    // a CPI-linked series pays its principal and coupons scaled by the index, up or down (GOV-11, GOV-12: no floor), so the figures are
    // before the linkage, and nothing is "promised" in shekels
    bars: { sell: "אם מוכרים היום", hold: "אם מחזיקים עד הפדיון: הקרן חוזרת", holdLinked: "אם מחזיקים עד הפדיון: הקרן, לפני השינוי במדד" },
    diffLoss: "ההפרש: במכירה היום תקבלו {gap} פחות",
    diffGain: "ההפרש: במכירה היום תקבלו {gap} יותר",
    holdLine: {
      before: "בפדיון מקבלים בחזרה",
      middle: "ובדרך משולמים קופונים של",
      after: { unlinked: "בסך הכול, כל עוד מחזיקים עד הסוף.", cpi: "בסך הכול, לפני השינוי במדד: בסדרה צמודה הקרן והקופונים עולים או יורדים עם המדד, ויכולים לרדת גם מתחת לסכום הזה." } as Record<string, string>,
    },
    note: { before: "מחיר האג״ח זז בכיוון הפוך לריבית, והשינוי גדול יותר ככל שהפדיון רחוק יותר. המחיר כאן לפני", term: "עמלה", after: "ומס." },
    linkage: { cpi: "צמודה למדד", unlinked: "לא צמודה" } as Record<string, string>,
    termsLine: { before: "הסדרה", middle: ", וקופון משולם כל" },
    couponLine: { before: "הקופון כאן הוא ההנחה של האתר,", after: "בשנה." },
    about: { price: "המחיר ל־100 אחרי שינוי הריבית: הערך הנוכחי של הקופונים והקרן שנשארו", change: "השינוי במחיר ביחס ל־100", sale: "מה שמקבלים ממכירה היום, לפני עמלה ומס", redeem: "הקרן שחוזרת בפדיון", coupons: "סכום הקופונים עד הפדיון", makam: "השינוי במחיר מק״מ בשנה באותו שינוי ריבית", diff: "ההפרש בין מכירה היום להחזקה עד הפדיון" },
  },
  /** Builder G2: the study fund, the provident fund for investing and the pensions. */
  g2: {
    plan: { before: "ההפקדה בדוגמה:", middle: "היום ועוד", after: "בכל חודש.", change: "שינוי הסכומים", hide: "הסתרת השדות", amount: "סכום היום", monthly: "הפקדה חודשית" },
    gaps: {
      bundle: "הנתונים של העמוד הזה עוד לא נטענו.",
      indexTrack: "האתר לא מצא מסלול של הקרן הזו על אותו מדד שמוחזק בחשבון ניירות ערך, ולכן אין השוואה של אותו דבר מול אותו דבר.",
      lump: "החישוב לא הצליח עם הערכים שנבחרו.",
      annuityFactors: "גובה הקצבה החודשית תלוי במקדמי ההמרה של הקרן, והאתר עוד לא אסף אותם, ולכן אין כאן קצבה חודשית. שאלה פתוחה PEN OQ7",
      pensionTrack: "הפרמטרים של האתר עוד לא קובעים מסלול מייצג לקרן הזו, ולכן אין חישוב של דמי הניהול ושל מה שנצבר.",
    } as Record<string, string>,
  },
  hishtalmut: {
    story: {
      employment: { employee: "שכירים", self: "עצמאים" },
      fields: { own: "ההפקדה שלכם, מהשכר", employer: "הפקדת המעסיק, מהשכר", ret: "תשואה בשנה", fee: "דמי ניהול בשנה" },
      // the choice the drawing is for, in two figures: what is left after the year picked, and what waiting for the lock changes
      head: {
        at: "אם מושכים אחרי",
        times: { before: "פי", after: "ממה שהפקדתם", afterBoth: "ממה שהופקד, מכם ומהמעסיק" },
        wait: "אם מחכים עד אחרי",
        more: { before: "עוד", less: "פחות", middle: " מעבר להפקדות שבינתיים, בלי מה שכסף שנמשך קודם היה מרוויח במקום אחר. מס הכנסה במשיכה שלא משלמים:", after: "." },
        taxAt: "המס אם מושכים אחרי",
        wasBefore: { before: "במשיכה אחרי", after: "המס היה" },
        taxStays: { before: "על הרווח ממה שהופקד מעל התקרה יש מס הכנסה גם אחרי", after: "." },
      },
      chartLine: "נטו בידיים, באלפי ₪",
      note: { wait: "מחכים עוד", more: "יותר בידיים, מעבר להפקדות שבינתיים, שמגיעות בכל מקרה", less: "פחות בידיים, מעבר להפקדות שבינתיים, שמגיעות בכל מקרה", saved: "מס הכנסה במשיכה שנחסך" },
      bar: {
        own: "הפקדתם",
        employer: "המעסיק הוסיף",
        refund: "החזר המס הוסיף",
        gain: "התשואה, מעבר לעליית המחירים",
        loss: "התשואה הורידה",
        fees: "דמי הניהול לקחו",
        salary: "המס על הפקדות המעסיק",
        taxWithdrawal: "המס במשיכה",
        tax: "המס לקח",
        left: "נשאר בידיים",
        account: { before: "אותו כסף", prefix: "ב", term: "חשבון ניירות ערך", after: ":" },
      },
      yearName: "אחרי כמה שנים מושכים",
      // the two figures of a gap between the year picked and the end of the lock, as its sheet names them
      inputs: { left: "נשאר בידיים בשנה שנבחרה", lockNet: "נשאר בידיים בסוף שנות הנעילה", paid: "מה שהופקד עד השנה שנבחרה", lockPaid: "מה שהופקד עד סוף שנות הנעילה", tax: "מס ההכנסה במשיכה בשנה שנבחרה", salaryTax: "מה שהשכר שילם על הפקדות המעסיק מעל התקרה, עד השנה שנבחרה", lockSalaryTax: "מה שהשכר שילם על הפקדות המעסיק מעל התקרה, עד סוף שנות הנעילה", lockTax: "מס ההכנסה במשיכה בסוף שנות הנעילה" },
      aria: "הכסף בקרן בשנה שנבחרה: ההפקדות והתשואה, מה שדמי הניהול והמס לקחו, ומה שנשאר",
      strip: { aria: "הכסף בקרן אם מושכים אחרי כל אחת מ־12 השנים. אפשר לבחור שנה", before: "לפני", taxed: ": מס", from: "מ־", exempt: ": פטור ממס", exemptUnderLimit: ": פטור עד התקרה" },
      selfGap: { before: "לעצמאים עוד אין כאן חישוב למשיכה לפני", after: ": במשיכה כזו משלמים מס כמו על הכנסה מהעסק, על הרווח ועל ההפקדות שקיבלתם עליהן ניכוי." },
      // the reader's own values against the limit: the rule itself is in the guide's text above
      standing: {
        over: { month: "בחודש", year: "בשנה", lead: "מההפקדות לא מקבלים פטור", leadOwn: "מההפקדות שלכם לא מקבלים פטור.", leadEmployer: "מההפקדות של המעסיק לא מקבלים פטור.", own: "מכם ו־", employer: "מהמעסיק.", why: "בגללם יש מס גם אחרי", noTax: { prefix: "ב", term: "תשואה", after: "הזו אין עליהם מס אחרי" }, noTaxWhy: ", כי הרווח לא עובר את עליית המחירים.", grows: "החלק הזה גדל עם השנים, כי השכר עולה והפטור עוצר בשכר של", growsAfter: "בחודש." },
        crossing: {
          today: "היום כל ההפקדות מקבלות פטור.",
          employee: "הפטור עוצר בשכר של",
          employeeRise: "בחודש, והשכר וההפקדות עולים",
          employeeThen: "בשנה, ולכן החל מהשנה ה־",
          self: "הפטור עוצר ב־",
          selfRise: "בשנה, והחישוב מעלה את ההפקדות",
          // TXH-08's amount is frozen by s.120ב through 2027 and grows with prices from 2028 (F-119, F-97)
          selfThen: "בשנה. החוק מקפיא את הסכום הזה עד 2027, והוא עולה עם המחירים רק מ־2028, ולכן החל מהשנה ה־",
          part: "חלק מההפקדות לא מקבל פטור",
          taxed: ", ויש עליו מס.",
          ifNot: "אם השכר לא עולה, זה לא קורה.",
        },
        room: { you: "אם תפקידו עוד", employer: "אם המעסיק יפקיד עוד", andEmployer: "והמעסיק עוד", month: "בחודש", year: "בשנה", exempt: "גם הם יקבלו פטור." },
      },
      early: { noClaim: "בלי בקשת החזר ממס הכנסה נשארים לכם", because: ": הקרן מעבירה", toTax: "למס הכנסה,", and: "ו־", onlyIf: "מהם חוזרים רק אם מבקשים. הסכומים למעלה כוללים את ההחזר.", before: "משיכה אחרי", first: ": לחשבון נכנסים", withheld: ", והקרן מעבירה", stop: "למס הכנסה.", owedBefore: "למס הכנסה. בדוח השנתי משלמים עוד", owed: ", וזה כלול בסכומים למעלה.", rate: "שיעור הניכוי במקור", linkage: "מס ההכנסה כאן כולל גם את המס על החלק של הרווח שרק משלים את עליית המחירים. לא נמצא טקסט שאומר אם אפשר לקבל אותו בחזרה בדוח השנתי, ולכן האתר מחשב אותו." },
      // one sentence each, beside what it qualifies (guidelines/wording.md "Notes and caveats")
      hints: {
        fee: { before: "ערך התחלתי:", fee: "דמי הניהול", middle: "הממוצעים שנגבו במסלול", number: "מספר", after: "." },
      },
      // a caution kept in sight in the short form of the indices page's plan line (DotLine): whose assumption it is, what rises, the money's unit
      assume: { site: "הנחה של האתר, לא תחזית", employee: "השכר וההפקדות עולים כל שנה ב־", self: "ההפקדות עולות כל שנה ב־", like: ", כמו ה", term: "אינפלציה", today: "הסכומים בכסף של היום" },
      held: {
        account: "החשבון שבעמודה ״אותו כסף בחשבון״: קרן",
        tariff: "בתעריפון של",
        pick: "שמשאיר הכי הרבה מבין",
        collected: "התעריפונים שיש באתר.",
      },
      about: {
        own: "מה שהפקדתם עד השנה שנבחרה, כל הפקדה בכסף של היום",
        extra: "מה שהמעסיק הפקיד עד השנה שנבחרה, כל הפקדה בכסף של היום",
        extraSelf: "המס שחזר אליכם בזכות הניכוי על ההפקדות עד השנה שנבחרה, בכסף של היום",
        gain: "מה שהתשואה הוסיפה מעבר לעליית המחירים, לפני דמי ניהול, בכסף של היום. מתחת לאפס כשעליית המחירים לוקחת יותר מהתשואה",
        fee: "מה שדמי הניהול לקחו עד השנה שנבחרה, כל תשלום בכסף של היום",
        times: "מה שנשאר בידיים חלקי מה שהופקד, בשנה שנבחרה: מה שהפקדתם, ואצל שכירים גם מה שהמעסיק הפקיד",
        lockNet: "מה שנשאר בידיים אם מושכים בסוף שנות הנעילה, בכסף של היום",
        lockTax: "מס ההכנסה במשיכה אם מושכים בסוף שנות הנעילה, בכסף של היום",
        lockSalaryTax: "מס ההכנסה, דמי הביטוח הלאומי ודמי ביטוח הבריאות שהשכר שילם על הפקדות המעסיק מעל התקרה, עד סוף שנות הנעילה, בכסף של היום",
        taxAtWithdrawal: "מס ההכנסה במשיכה בשנה שנבחרה, בלי מה שהשכר שילם על הפקדות המעסיק מעל התקרה, בכסף של היום",
        paid: "מה שהופקד עד השנה שנבחרה, ואצל שכירים גם מה שהמעסיק הפקיד, כל הפקדה בכסף של היום",
        lockPaid: "מה שהופקד עד סוף שנות הנעילה, ואצל שכירים גם מה שהמעסיק הפקיד, כל הפקדה בכסף של היום",
        waitMore: "מה שנשאר מעל מה שהופקד אם מושכים בסוף שנות הנעילה, פחות מה שנשאר מעל מה שהופקד אם מושכים בשנה שנבחרה, בכסף של היום. ההפקדות שבינתיים לא נספרות, כי הן מגיעות בכל מקרה",
        taxSaved: "מס ההכנסה במשיכה בשנה שנבחרה פחות מס ההכנסה במשיכה בסוף שנות הנעילה, בכסף של היום. מה שהשכר משלם על הפקדות המעסיק מעל התקרה לא נכלל, כי הוא משולם בכל מקרה",
        taxBefore: "המס אם מושכים שנה לפני סוף שנות הנעילה, בכסף של היום",
        tax: "המס במשיכה, ועל מה שהמעסיק הפקיד מעל התקרה גם מס הכנסה, דמי ביטוח לאומי ודמי ביטוח בריאות, בכסף של היום",
        taxSalary: "מס הכנסה, דמי ביטוח לאומי ודמי ביטוח בריאות על מה שהמעסיק הפקיד מעל התקרה, שנגבו כל חודש מהשכר, בכסף של היום",
        taxWithdrawal: "המס שנגבה במשיכה, בכסף של היום",
        left: "מה שנשאר אחרי המס אם מושכים בשנה שנבחרה, בכסף של היום",
        account: "מה שנשאר מאותה הפקדה בחשבון ניירות ערך על אותו מדד, אחרי עמלות ומס, בכסף של היום",
        ownMonthly: "ההפקדה החודשית שלכם: האחוז שבשדה כפול השכר",
        employerMonthly: "ההפקדה החודשית של המעסיק: האחוז שבשדה כפול השכר",
        over: "מה שמופקד מעל התקרה של הפטור בסכומים של היום",
        overSelf: "מה שמופקד בשנה מלאה מעל התקרה של הפטור, לפי ההפקדה החודשית שהזנתם, לפני החזר המס",
        overOwn: "מה שאתם מפקידים בחודש מעל התקרה של הפטור",
        overEmployer: "מה שהמעסיק מפקיד בחודש מעל התקרה של הפטור",
        room: "כמה עוד אפשר להפקיד בחודש עם פטור, בסכומים של היום",
        roomSelf: "כמה עוד אפשר להפקיד בשנה מלאה עד התקרה של הפטור, לפי ההפקדה החודשית שהזנתם, לפני החזר המס",
        crossYear: "השנה הראשונה שבה הפקדה עוברת את התקרה של הפטור",
        first: "מה שנכנס לחשבון במשיכה בשנה שנבחרה, לפני דוח שנתי או בקשת החזר: מה שנשאר אחרי המס, ועוד מה שנוכה מעבר למס, בכסף של היום",
        owed: "מה שנשאר לשלם בדוח השנתי: המס על המשיכה פחות מה שנוכה, בכסף של היום",
        withheld: "מה שהקרן מנכה במקור במשיכה בשנה שנבחרה: על הרווחים ועל הפקדות המעסיק עד התקרה, בכסף של היום",
        back: "מה שחוזר אחרי בקשת החזר ממס הכנסה: מה שנוכה פחות המס על המשיכה, בכסף של היום",
      },
    },
    broker: "חשבון ניירות ערך",
    track: "מסלול",
    trackFee: "דמי הניהול שלו:",
    perYearAvg: "בשנה, הממוצע שהרשות מפרסמת.",
    fund: "קרן",
    employmentLabel: "סוג ההעסקה",
    income: { employee: "משכורת ברוטו בחודש", "self-employed": "הכנסה חייבת בחודש" } as Record<string, string>,
    incomeAnnual: "ההכנסה השנתית בתרחיש לדוגמה",
    incomeAbout: "ההכנסה החודשית שהחישוב מניח",
    gaps: {
      blocked: "המס על המשיכה הזו תלוי בשאלה פתוחה, ולכן אין כאן מספר.",
    } as Record<string, string>,
    // the pension visual's assumptions, in the short form of the indices page's plan line (DotLine)
    assumption: { site: "הנחות של האתר, לא תחזית", ret: "תשואה", inflation: "אינפלציה", perYear: "בשנה" },
    inputNames: { trackFee: "דמי הניהול של המסלול", lockYears: "שנות הנעילה", cap: "תקרת המשכורת הקובעת", selfBenefited: "תקרת ההפקדה המוטבת לעצמאי בשנה" },
  },
  pension: {
    lead: "הפקדה לפנסיה של שכיר מורכבת משלושה חלקים: מה שמנוכה לכם מהמשכורת, מה שהמעסיק מוסיף, ופיצויים שהמעסיק שומר לכם בקרן. כך זה נראה במשכורת שבחרתם:",
    selfEmployed: "כאן מוצג שכיר שהמעסיק מפקיד לו. עצמאי מפקיד בעצמו, בלי מעסיק, וההטבה שלו היא ניכוי מההכנסה במקום זיכוי. החישוב לעצמאי עוד לא מוצג כאן.",
    salary: "משכורת ברוטו בחודש",
    salaryAnnual: "ההכנסה השנתית בתרחיש לדוגמה",
    salaryAbout: "המשכורת החודשית שהחישוב מניח",
    insurance: "דמי הביטוח בקרן הפנסיה, באחוז מההפקדה",
    insuranceHint: "אתם מזינים אותם: האתר עוד לא אסף את תעריפי הביטוח.",
    insuranceAbout: "דמי הביטוח בקרן הפנסיה, באחוז מההפקדה",
    insuranceNeeded: "הזינו את דמי הביטוח כדי לראות",
    monthLead: "כל חודש מופקדים בסך הכול",
    parts: { you: "ממכם", employer: "מהמעסיק, תגמולים", severance: "מהמעסיק, פיצויים" },
    chart: { aria: "פס אחד שמחולק לשלושה חלקים: מה שהעובד מפקיד, מה שהמעסיק מפקיד לתגמולים, ומה שהמעסיק מפקיד לפיצויים" },
    returns: { before: "מהחלק שלכם חוזר אליכם", after: "בחודש כזיכוי ממס.", when: "הוא מגיע כל חודש, בניכוי קטן יותר של מס הכנסה מהמשכורת, רק אם רשות המסים הורתה כך למעסיק לבקשתכם, או הודיעה כך לכל המעסיקים. אם יש הודעה כזו, עוד לא ידוע: שאלה פתוחה", otherwise: "בלי אחת מהשתיים, הוא מגיע כשמחושב מס ההכנסה של השנה, בדוח שנתי או בבקשת החזר." },
    // the general fund's page: only the deposit above the comprehensive fund's ceiling reaches it (PEN-10, PEN-08; method F-67)
    general: {
      below: { before: "לקרן הכללית לא מגיע מההפקדה הזו כלום: כולה נכנסת לקרן המקיפה, כי היא מתחת ל", term: "תקרת ההפקדה", middle: "שלה,", after: "בחודש. לקרן הכללית עובר מה שמופקד מעל התקרה, ובשיעורי המינימום זה לא קורה בשום משכורת." },
      split: { before: "מעל התקרה של הקרן המקיפה,", middle: "בחודש, עוברים לקרן הכללית", after: "בחודש. איך העודף מתחלק בין ההפקדה שלכם להפקדות המעסיק, הכללים שנאספו לא אומרים, ולכן אין כאן חישוב של מה שנצבר בה." },
      toGeneral: "מה שמופקד בחודש מעל התקרה של הקרן המקיפה, ועובר לקרן הכללית",
    },
    // what the balance assumes, beside the return and inflation (method F-67, "What the visual assumes")
    // the run holds the net outlay fixed in shekels; from 2028 the credit's caps grow (F-119), so the same outlay can buy a larger gross deposit
    assume: { flat: "מה שיוצא מהכיס שלכם, אחרי הזיכוי, באותו סכום בשקלים בכל השנים, בלי עליית שכר", grossRises: "מ־2028 תקרות הזיכוי עולות עם המחירים, ולכן ההפקדה עצמה יכולה לגדול מעל הסכום החודשי שלמעלה", noInsurance: "בלי דמי הביטוח, כי לא הוזנו" },
    figures: { net: "בפועל יוצא מהכיס שלכם, אחרי הזיכוי", insurance: "דמי הביטוח בקרן הפנסיה", depositFee: "דמי ניהול מההפקדה", balance: "מה שנצבר בקרן אחרי" },
    balanceGap: { "no-fees": "אין חישוב; הסיבה למטה", "no-run": "החישוב לא הצליח עם הערכים האלה" } as Record<string, string>,
    ratesLine: { before: "ההפקדות הן המינימום לפי צו ההרחבה:", middle: "מכם,", severance: "מהמעסיק לתגמולים, ועוד", wage: "מהמעסיק לפיצויים, על שכר של עד", after: "בחודש (השכר הממוצע במשק). בהסכם העבודה שיעורי ההפקדה יכולים להיות גבוהים יותר." },
    creditLine: { before: "על ההפקדה שלכם מגיע", term: "זיכוי ממס", middle: "של", after: "מהסכום המזכה, עד תקרה שנגזרת מההכנסה ועד גובה המס שאתם משלמים באותה שנה." },
    beneficiary: { before: "אתם נחשבים", term: "עמית מוטב", middle: "ההפקדות שלכם ושל המעסיק יחד עוברות את הסף של", after: "בשנה, ולכן הזיכוי מחושב לפי הכללים לעמית מוטב." },
    insuranceNote: "בקרן פנסיה חלק מההפקדה משלם ביטוח למקרה מוות או נכות. דמי הביטוח תלויים בגיל ובכיסוי.",
    noInsurance: "בתגמולים ואישית לפיצויים אין ביטוח משותף: ההפקדה, אחרי דמי הניהול, נכנסת כולה לחיסכון.",
    feesLine: { before: "דמי הניהול הם הממוצע שהרשות מפרסמת למסלול", balance: "בשנה מהחיסכון", deposit: "ועוד", ofDeposit: "מההפקדה", after: "בפנסיה הנתון הוא של הקרן כולה ולא של המסלול." },
    none: { pension: "קצבת זקנה", fund: "קרן פנסיה", after: "מתחילה לא לפני גיל" },
    todayMoney: "הסכומים בכסף של היום",
    inputNames: { avgWage: "השכר הממוצע במשק", employee: "שיעור ההפקדה של העובד", employer: "שיעור ההפקדה של המעסיק לתגמולים", severance: "שיעור ההפקדה של המעסיק לפיצויים", credit: "שיעור הזיכוי", threshold: "סף ההפקדות לעמית מוטב", depositFee: "דמי הניהול מההפקדה" },
    about: {
      you: "ההפקדה החודשית של העובד: השיעור המזערי כפול השכר המבוטח",
      employer: "ההפקדה החודשית של המעסיק לתגמולים: השיעור המזערי כפול השכר המבוטח",
      severance: "ההפקדה החודשית של המעסיק לפיצויים: השיעור המזערי כפול השכר המבוטח",
      total: "סך ההפקדות בחודש",
      relief: "הזיכוי ממס על ההפקדה של העובד, מחולק לחודשים",
      net: "ההפקדה של העובד פחות הזיכוי ממס",
      depositFee: "דמי הניהול מההפקדה, באחוז הממוצע שדווח, מסך ההפקדות החודשי",
      insurance: "דמי הביטוח בקרן הפנסיה: האחוז שהזנתם מסך ההפקדות החודשי",
      balance: "מה שנצבר בקרן מכל ההפקדות (של העובד ושל המעסיק), אחרי דמי ניהול וביטוח, בכסף של היום ולפני שהקרן הופכת אותו לקצבה. מה שיוצא מהכיס שלכם אחרי הזיכוי נשאר באותו סכום בכל השנים, ולכן מ־2028, כשתקרות הזיכוי עולות, ההפקדה של העובד יכולה לגדול",
    },
  },
} as const;

/** The "worth knowing" block on each wrapper guide page (synthesis §3.7). */
export const guideWorth = {
  title: "שווה לדעת",
  line: "עובדות על המוצר הזה שלא כולם מכירים, כל אחת עם המקור שלה.",
  /** before a figure that is a legal cap (its name holds "cap"), so a cap never reads as the rate charged */
  upTo: "עד",
  /** after the figure's name, before the year a yearly figure is for ("חלק הבורסה במחזור המסחר השנתי, בשנת 2025") */
  inYear: "בשנת",
} as const;

/**
 * The note on how the product works in other countries, at the end of a guide's "שווה לדעת" (product D114, kit `AbroadNote`). The words
 * about each country's product are the guide's own, in its content file.
 */
export const abroad = {
  tag: "במדינות אחרות",
  /** The row of countries, for a screen reader. */
  chipsLabel: "מדינה",
  /** The four countries, in the one order every guide keeps (D114). */
  countries: { gb: "בריטניה", us: "ארצות הברית", fr: "צרפת", it: "איטליה" } as Record<string, string>,
  /** A country's chip where no product like the guide's was found, after its name. */
  notFound: "לא נמצא",
  /** Between the two calendar years of a tax year that spans them ("2026 עד 2027"). */
  yearTo: "עד",
  /** That country's heading. */
  noneTitle: (country: string) => `ב${country}: לא נמצא מוצר דומה`,
  /** The source line: the pages' publishers, then the day they were read. */
  source: (publishers: string[]) => `מקור: ${andList(publishers)},`,
  checked: "נבדק ב־",
  /** The link to the first page, by its publisher's name. */
  link: (publisher: string) => `לעמוד ב${publisher}`,
  /** An amount's word after its figure, in its own currency (never converted). */
  currency: { gbp: "ליש״ט", usd: "דולר", eur: "אירו" } as Record<string, string>,
} as const;

/** Search additions (synthesis §3.6): the three new groups, their row lines and the empty states by query type. */
export const searchMore = {
  groups: { rule: "חוקים וכללים", companyRule: "אצל חברות מסוימות" /* D30: a company's own terms, each row naming the company */, parameter: "פרמטרים", document: "מסמכים" },
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

/**
 * "השקעה במדד" (D28; spec 8dd1f013:research/specs/2026-10-25-invest-page/spec.md). Figures never appear here: a number is a Num on the page.
 * The labels are defined in lib/labels.ts (id, icon, tone, rules); their words are here.
 */
/** A span of years in a sentence (copy.md §1): "שנה", "שנתיים", "10 שנים"; never "1 שנים". */
const yearsSpan = (n: number) => countPhrase(n, numbers.yearWords);
/** "ל" before a Hebrew name, "ל־" before a Latin one: "לפסגות", "ל־IBI". */
const toName = (name: string) => `${/^[A-Za-z]/.test(name) ? "ל־" : "ל"}${name}`;
/** "ב" before a Hebrew name, "ב־" before a Latin one: "בפסגות", "ב־IBI". */
const inName = (name: string) => `${/^[A-Za-z]/.test(name) ? "ב־" : "ב"}${name}`;
/** "מ" joined to a Hebrew name, "מ־" before a Latin one or a number (copy.md 10.4): "מהראל", "מ־MTF". The prefix only: the name follows. */
const fromPrefix = (name: string) => (/^[A-Za-z0-9]/.test(name.replace(/^[\u2066-\u2069\u200e\u200f]+/, "")) ? "מ־" : "מ");
/** The words after a fund's gap, in its row and in its sheet's head alike (copy 10.4): the year when it rests on one, else the yearly mean. */
const gapUnit = (n: number, year?: number) => (n === 1 && year ? `ב־${year}` : "בשנה");
/** "בשנה אחת", "בשנתיים", "ב־10 שנים". */
const inYears = (n: number) => countPhrase(n, { one: "בשנה אחת", two: "בשנתיים", many: "ב־{n} שנים" });

/** How many questions "לפני שמחליטים" asks, in words. */
const questionCount = (n: number) => (n === 4 ? "ארבע שאלות" : n === 3 ? "שלוש שאלות" : n === 2 ? "שתי שאלות" : "שאלה אחת");

/**
 * The pair the receipt shows, named by whether the person picked it. Picked, it is the chosen pair. Before any pick it is the page's own:
 * never called the person's choice, nor the site's ("בחירת האתר" reads as a recommendation beside "האתר לא ממליץ על מדד"), and named by
 * where it is shown, the receipt, so nobody asks who chose it.
 */
const shownPair = (chosen: boolean) => {
  const name = chosen ? "הזוג שנבחר" : "הזוג שבקבלה";
  return {
    name,
    /** On its own row of a list, in place of the difference. */
    row: chosen ? "נבחר" : "בקבלה",
    /** A difference's sheet: what it is. */
    diffAbout: `ההפרש מ${name}`,
    vs: `לעומת ${name}`,
    /** The rail's card of the pair's facts. */
    cardTitle: `${name}, בפירוט`,
    /** "לפני שמחליטים": its lead before the pair's names, and the tabs' spoken name. */
    questions: (n: number) => `${questionCount(n)} על ${name}:`,
    tabs: `שאלות על ${name}`,
    /** The fees panel's bars. */
    feeBars: `העמלות של ${name}, לפי סעיף`,
  };
};

export const invest = {
  /** The notes on a money-market fund's zero trade and custody lines at a bank (lib/instruments.server.ts): the rule, and what the example assumes. */
  bankMoneyMarketZero: {
    trade: "בקרן כספית שיש עליה הסכם הפצה המפיץ לא רשאי לגבות מבעל היחידה עמלה על קנייה, החזקה או פדיון (MF-26). ההדגמה מניחה שלבנק יש הסכם הפצה עם הקרן, כמקובל.",
    custody: "בבנק אי אפשר לגבות דמי ניהול פיקדון ניירות ערך על קרן כספית (BANK-18). ההדגמה מניחה שהקרן נקנית דרך הבנק.",
  },
  shownPair,
  /** The plan's inputs as a computed figure's sheet lists them (`planInputs` in lib/invest.ts): a figure lists only those its formula uses. */
  planInputs: { amount: "סכום", monthly: "הפקדה חודשית", years: "שנים", return: "תשואה", inflation: "אינפלציה" },
  nav: "השקעה במדד",
  metaTitle: "השקעה במדד",
  sub: "בוחרים חשבון ניירות ערך וקרן, ורואים כמה יישאר לכם. לפי התעריפון של כל בנק ובית השקעות ולפי הדוח של כל קרן.",
  loading: "טוען את התעריפונים והקרנות…",
  failed: "האתר לא הצליח לטעון את התעריפונים והקרנות. נסו לרענן את העמוד.",
  /**
   * In place of the pair, its receipt and the lists, when the plan puts in nothing: no account or fund is crowned on 0 ₪. The knobs beside
   * it already show the two zeros, so the line says what the comparison needs. `action` is followed by the amount knob's own label
   * (`plan.knobs.amount`), and moves the focus to that knob's box.
   */
  empty: { title: "אין מה להשקיע", body: "כדי להשוות חשבונות וקרנות צריך סכום להשקיע, היום או בכל חודש.", action: "להזין" },
  breadcrumbHome: "ראשי",

  chips: {
    none: "בחרו מדד כדי לראות את הדרכים להחזיק אותו.",
    ownChoice: "הבחירה במדד שלכם; האתר לא ממליץ על מדד.",
    rename: "שינוי השם",
    renameField: "שם המדד",
    remove: "מחיקת המדד מהמכשיר",
    confirm: "למחוק את המדד מהמכשיר הזה?",
    confirmYes: "מחיקה",
    confirmNo: "ביטול",
    savedTag: "נשמר במכשיר",
  },
  custom: {
    heading: "מדד אחר",
    field: "שם המדד",
    placeholder: "למשל ניקיי 225",
    go: "הוספה",
    matched: (name: string) => `האתר מכיר את ״${name}״ ובחר אותו.`,
    cancel: "ביטול",
    savedNote: "מדד שהוספתם, שמור במכשיר הזה",
    nameTaken: "יש כבר מדד בשם הזה.",
    missing: "המדד הזה לא שמור במכשיר הזה. בחרו מדד מהרשימה או הוסיפו אותו שוב.",
  },

  /** The title row: the page's title with the index picker inside it, and one line under it about the index chosen. */
  title: {
    lead: "איפה ואיך הכי זול להשקיע במדד",
    tail: "לאורך זמן",
    /** The picker before an index is chosen. */
    choose: "בחירת מדד",
    /** The picker's spoken name. */
    picker: "המדד",
    tag: { israeli: "מדד ישראלי", foreign: "מדד זר" },
    /** The word an index's name may start with: the picker drops it after the title's "במדד", and a typed name is matched with and without it. */
    indexWord: "מדד",
  },

  /** The receipt (the page's answer, in the side rail or between the lists): what was paid in, what the index added, what each party took, what is left. */
  receipt: {
    title: "קבלה",
    added: "המדד הוסיף, לפני כל עלות",
    left: "נשאר לכם",
    /** The receipt's stub at the screen's foot: the way back up to the receipt. */
    toReceipt: "לקבלה",
    /** Under what is left: when, in what money, and on what the dollar does (only where the figure rests on it). */
    caption: (years: number, steady: string | null) => `בעוד ${yearsSpan(years)}, בכסף של היום${steady ? `, ${steady}` : ""}.`,
    /** The ticket's two side parts: what the account and the fund take, under their names. */
    accountCharges: "החשבון גובה",
    fundCharges: "הקרן גובה",
    gain: "הרווח שלכם",
    gainNote: "מה שנשאר, פחות מה שהפקדתם",
    lost: "מה ירד בדרך",
    lostBar: "מה ירד בדרך, לפי מי שלקח",
    /** The bar's parts besides the tax, by who took them. */
    parts: { account: "החשבון", fund: "הקרן" },
    /** A part that took money but under half a percent of what went. */
    underOne: "פחות מ־⁦1%⁩",
    /** The fund's fees as rows under its line, each by its whole name; `charged`: the variable fee the costs rest on, after its years. */
    fundFees: { fixed: "דמי ניהול קבועים", variable: "דמי ניהול משתנים", trustee: "שכר נאמן", yearly: "דמי ניהול שנתיים", charged: (word: string) => `משתנים ${word}` },
  },

  /** A fee's rate in words as the price list prints it, under the receipt's account lines (lib/rate-words). */
  rate: {
    per: { trade: "מכל פעולה", eachTrade: "לפעולה", share: "למניה", conversion: "מכל המרה", month: "לחודש", quarter: "לרבעון", year: "לשנה" } as Record<string, string>,
    min: "מינימום",
    max: "מקסימום",
    cap: { before: "עד", after: "מסכום הפעולה" },
    /** a flat price for a small order or conversion, after its amount and before the sum it holds up to, as the company's card says it (r4catalogue.card.flatUpTo) */
    flat: { conversion: "להמרה של עד", eachTrade: "לפעולה של עד" } as Record<string, string>,
    spread: "מרווח המרה עד",
    standing: "בהוראת קבע:",
    regular: "בפעולה אחרת:",
  },

  /** The chosen pair's card: what the lists' heads and rows say of the chosen account and fund. */
  chosen: {
    /** The account's and the fund's fees together, without the tax. */
    together: { before: "יחד", after: "עמלות" },
    togetherAbout: "מה שהחשבון והקרן לוקחים יחד, בלי המס",
    collected: "התעריפון נאסף",
    aside: "מחיר אחר, שלא בחישוב",
    none: "אין",
    fundDoc: "הדוח של הקרן",
    fundDocOther: "המסמך של הקרן",
    number: "מספר הקרן",
    kind: "סוג הקרן",
    /** A line per label family; the tax family's labels speak of different taxes, so its line names the subject, not one tax (copy.md 1). */
    groups: { follow: "מעקב אחרי המדד", payout: "דיבידנדים", currency: "נטרול מט״ח", tax: "איך הקרן ממוסה" } as Record<string, string>,
    /** Whether a fund document's title names its report ("דוח שנתי", "דו\"ח", "דו״ח"), read with its quotes or gershayim left out. */
    isReport: (title: string) => title.replace(/["״]/g, "").startsWith("דוח"),
  },

  /** The two linked lists and the heading block above them: the verdict on the chosen pair and the key to the small figure. */
  lists: {
    kicker: "איפה ואיך: החשבון והקרן",
    colLeft: "נשאר בסוף",
    /** A fund row's note where the pair's price rests on a rule that is an open question (`pair.openRow` in the chosen fund's tile). */
    openRow: "לא מדורגת: שאלה פתוחה",
    /** In "נשאר בסוף"'s "?": which price a row counts; a price for some customers is in the chosen account's card. */
    whichPrice: "המחיר בכל שורה הוא של לקוח רגיל, והדירוג לפיו. מחיר אחר, לחלק מהלקוחות, לא נכנס לחישוב. הוא כתוב בפירוט של החשבון שנבחר.",
    /** Above several funds with no price at the chosen account, after why: a pick moves the account (`pair.pickMoves` for one fund). */
    pickMovesMany: (house: string) => `בחירה באחת מהן מעבירה את החשבון ${toName(house)}`,
    /** The accounts' side beside the ruler: an account is a stretch of it. */
    accounts: {
      title: "איפה: החשבון",
      /** The line under the title, its last words bold. */
      sets: { lead: "החשבון קובע את", what: "הקטע" },
      each: "כל נקודה בקטע: קרן אחת שנקנית בו",
      /** An account's figure: what is left with its cheapest fund. */
      upTo: "עד",
      /** In the "?" beside "הקטע": the small bar beside each row, on the ruler's scale (from 1280 px) or on one scale (below, with no ruler). */
      barRuler: "הפס הקטן ליד כל חשבון: הקטע שלו על הסרגל, מהקרן הזולה בו עד היקרה.",
      barAlone: "הפס הקטן ליד כל חשבון: הקטע שלו, מהקרן הזולה בו עד היקרה. לכל החשבונות אותו סולם.",
      /** An account whose every priced fund of the kind rests on an open rule (G-18): shown, not ranked, no stretch; why is G-18's text. */
      unranked: "לא מדורג",
    },
    /** The funds' side: a fund is a spot inside the chosen account's stretch. */
    funds: {
      title: "איך: הקרן",
      sets: { lead: "הקרן קובעת את", what: "המקום בקטע" },
      /** "בפסגות: עד 4,492 ₪ בין קרן לקרן": the stretch's length at the chosen account. */
      span: "{house}: עד {span} בין קרן לקרן",
      spanAbout: (house: string) => `הפער בין הקרן שמשאירה הכי הרבה לזו שמשאירה הכי מעט, ${inName(house)}`,
      inHouse: (house: string) => inName(house),
      /** A fund's figure against the pair in the receipt: less, more or the same as it leaves. */
      less: "פחות",
      more: "עוד",
      same: "אותו סכום",
      /** In the "?" beside "המקום בקטע", below 1280 px, where no ruler stands: the small bar beside each fund. */
      barAlone: (house: string) => `הפס הקטן ליד כל קרן: הקטע של ${house}, והנקודה בו היא הקרן.`,
      /** The fold under the list: the funds the chosen account gives no price, with their reasons. */
      unpriced: (n: number) => (n === 1 ? "ועוד קרן אחת בלי מחיר בחשבון הזה" : `ועוד ${n} קרנות בלי מחיר בחשבון הזה`),
      unpricedLabel: (house: string) => `קרנות בלי מחיר ${inName(house)}`,
      /** The heading over the funds on an open rule (G-18), after the ranked ones of their kind: shown, not ranked. */
      unranked: "לא מדורגות",
    },
    /** Under both lists, how a tap moves them. `ruler`: from 1280 px, where the ruler stands between them. */
    note: (ruler: boolean) => (ruler ? "לחיצה על חשבון מחליפה את הקטע שעל הסרגל. לחיצה על קרן מזיזה את הנקודה בתוכו." : "לחיצה על חשבון מחליפה את הקטע. לחיצה על קרן מזיזה את הנקודה בתוכו."),
    /** The ruler's title, over it: what it measures. */
    rulerTitle: "כמה נשאר לכם בסוף, לפי התוכנית שלכם",
    /** Under both lists, for the chosen account: a price for some of its customers that the figure leaves out (a group's, or a standing
     *  order's), and where the card says whose. */
    otherPrice: (house: string, card: string) => `${inName(house)} יש גם מחיר אחר, לחלק מהלקוחות. הוא לא נכנס לחישוב, ולמי הוא מיועד כתוב ב״${card}״.`,
  },

  /**
   * F-118 (D84): the funds whose tax rests on an open rule, listed under the funds with their figures before tax at the chosen account, never
   * ranked and never chosen as the pair.
   */
  beforeTax: {
    /** The heading over them, in the blocked colours with the lock. */
    heading: "לפני מס רווחי הון, בלי דירוג",
    /** The plain note under the heading, by the rule: `{term}` is `noteTerm`, the words that open the rule's card. */
    note: {
      "TXF-04": "מס רווחי הון על הקרנות האלה {term}: אין נוסח רשמי שאומר אם הרווח בקרן חוץ שנסחרת בתל אביב נמדד מול שער המטבע או מול מדד המחירים לצרכן.",
    } as Record<string, string>,
    noteOther: "המס על הקרנות האלה {term}: הוא תלוי בכלל שעוד לא נקבע.",
    noteTerm: "עוד לא ידוע",
    /** The note's last sentence: what the figures are and what is not done with them. */
    noteTail: "לכן הסכומים כאן לפני מס רווחי הון, ואי אפשר להשוות אותם לקרנות שלמעלה או לבחור בהן.",
    /** The list's name, for a screen reader. */
    label: (house: string) => `קרנות לפני מס רווחי הון ${inName(house)}`,
    colCharges: "החשבון גובה",
    colChargesHelp: "מה החשבון גובה בכל התקופה, לפני המס שהעמלות חוסכות, בכסף של היום.",
    colLeft: "נשאר לפני מס רווחי הון",
    colLeftHelp: "מה שנשאר בסוף אחרי דמי הניהול והעמלות, לפני מס רווחי הון במכירה, בכסף של היום. המס לא ידוע, ולכן אין כאן סכום אחרי מס רווחי הון.",
    leftAbout: (fund: string, house: string) => `נשאר לפני מס רווחי הון: ${fund}, ${inName(house)}`,
    costAbout: (house: string) => `מה החשבון גובה: ${house}`,
  },

  /** "לפני שמחליטים" under the lists: a few questions about the chosen pair, a card each with its answer, one panel open at a time. */
  before: {
    title: "לפני שמחליטים",
    leadTail: (n: number) => (n === 1 ? "הכרטיס פותח ניתוח." : "כל כרטיס פותח ניתוח אחד."),
    /** On the open card below 1024 px, where the cards stand over one another and no pointer joins the open one to its panel. */
    openWord: "פתוח למטה",
    fees: {
      question: "לאן הולכות העמלות?",
      /** The card's line under the largest item, around the pair's fees together. */
      of: "מתוך",
      ofTail: "עמלות בכל התקופה",
      kicker: "לאן הולכות העמלות:",
      /** The headline: "הסעיף הגדול: דמי משמרת, 699 ₪ מתוך 1,173 ₪ עמלות". */
      largest: "הסעיף הגדול:",
      fees: "עמלות",
      total: "סך העמלות בכל התקופה:",
      /** Why the tax is not among the bars, by the exact tax's name (one tax, or the capital gains tax and the tax on what a fund pays out). */
      noTax: (tax: string, two: boolean) => (two ? `${tax} לא מופיעים כאן: הם לא עמלה, והם יורדים בכל מקרה. הם נשארים בקבלה.` : `${tax} לא מופיע כאן: הוא לא עמלה, והוא יורד בכל מקרה. הוא נשאר בקבלה.`),
      /** The pair set beside the chosen one, in a sentence: {role}, {pair} (a button that picks it), {fees}, {left} and {gap} are its parts. */
      other: "{role}: {pair}. העמלות בו {fees}, ונשארים בו {left}, {gap}.",
    },
    sens: {
      question: "מה הכי משנה את מה שיישאר לכם?",
      /** The card's line: "20% יותר מוסיפים 19,116 ₪ בסוף". */
      adds: "מוסיפים",
      takes: "מורידים",
      atEnd: "בסוף",
      /** At the plan itself, where nothing changes. */
      none: "בלי שינוי",
    },
    hedge: {
      question: "עם נטרול מט״ח או בלי?",
      moreUnhedged: "יותר בלי נטרול",
      moreHedged: "יותר עם נטרול",
    },
    stairs: {
      question: "מה משפר את הבחירה, ובכמה?",
      more: "עוד",
      less: "פחות",
      inSteps: (n: number) => (n === 1 ? "בצעד אחד" : `ב־${n} צעדים`),
      none: "אין צעד שמשאיר יותר",
      fromExample: "מנקודת התחלה לדוגמה:",
      from: "מנקודת ההתחלה:",
    },
  },

  /** An index with no fund the page can price (a custom one): the same two lists, the accounts by what they charge, and one request to add the fund. */
  noFund: {
    callTitle: "כמה נשאר בסוף תלוי בקרן",
    callBody: (index: string) => `האתר לא אסף קרנות על ${index}. הוסיפו את הקרן שאתם שוקלים, והעמוד יחשב כמה נשאר בכל חשבון. עד אז, הרשימה מסדרת את החשבונות לפי מה שהם גובים.`,
    accountsCond: "מסודרים לפי מה שכל חשבון גובה, בסוג הקרן שהכי זול לקנות בו",
    accountsHint: "בחרו חשבון כדי לראות את התעריפון שלו",
    fundTitle: "עוד לא נבחרה קרן",
    fundWhy: "בלי קרן שנבחרה, האתר לא מנחש דמי ניהול.",
    none: "אין עדיין קרנות ברשימה.",
    unpriced: "הקרנות שהוספתם, בלי מחיר:",
    mayaLead: "את דמי הניהול של קרן אפשר למצוא במאיה, מערכת ההודעות של הבורסה.",
  },

  /** An account on your own terms, started from a house (F-101): what the sheets of its computed figures call them. The panel's own words come with the panel. */
  ownAccount: {
    placeAbout: (of: number) => `המקום בין ${of} חשבונות, לפי מה שנשאר בסוף`,
    differenceAbout: "מה שנשאר בחשבון שלכם פחות מה שנשאר בחשבון לפי התעריפון של אותו בנק או בית השקעות, באותה קרן",
    decidingAbout: (line: string) => `ההפרש בין התעריפון לחשבון שלכם: ${line}`,
    /** The link on a house's page; in the comparison the chosen account's card opens it (`pair.ownPrice`). */
    open: (house: string) => `חשבון בתנאים שלכם, על בסיס ${house}`,
    panel: {
      title: (house: string) => `${house}, בתנאים שלכם`,
      nameDefault: (house: string) => `${house}, בתנאים שלכם`,
      sub: "מתחילים מהתעריפון ומשנים רק את המחירים שקיבלתם בפועל. מה שלא שיניתם נשאר כמו בתעריפון. החשבון נשמר רק במכשיר הזה, ומושווה כמו כל חשבון אחר בעמוד.",
      nameField: "השם של השורה בהשוואה",
      startField: "על בסיס",
      startList: (house: string) => `התעריפון של ${house}`,
      noWay: (house: string) => `ל${house} אין מחיר לקרן במדד הזה, ולכן אי אפשר לחשב חשבון על בסיסו כאן.`,
      computing: "מחשב…",
      tileLeft: (years: number) => `נשאר אחרי ${countPhrase(years, { one: "שנה אחת", two: "שנתיים", many: "שנים" })}`,
      tileLeftNote: "בכסף של היום, אחרי דמי ניהול, עמלות ומס",
      tilePlace: "המקום בהשוואה",
      tilePlaceValue: (rank: number, of: number) => `${rank} מתוך ${of}`,
      tilePlaceNote: "לפי מה שנשאר בסוף",
      tileDiff: (house: string) => `לעומת התעריפון של ${house}`,
      tileDiffNote: "באותה קרן, לפי התוכנית שלכם",
      gridLabel: "העמלות של החשבון: התעריפון, מה שהלקוחות שילמו בממוצע, והתנאים שלכם",
      head: { fee: "עמלה", list: "בתעריפון", avg: "מה שהלקוחות שילמו בממוצע", yours: "שלכם" },
      listLabel: "בתעריפון",
      yoursLabel: "שלכם",
      listNone: "בתעריפון אין שורה לסוג הזה של קרן",
      listWord: "התעריפון",
      avgBody: (house: string) => `הבורסה מפרסמת כמה שילמו לקוחות ${house} בממוצע, לפי גודל התיק. היא אוסרת להעתיק את המספרים, ולכן הם לא כאן.`,
      avgLink: "למחשבון העמלות של הבורסה",
      sameAsList: "כמו בתעריפון",
      fromGroup: (name: string) => `לפי ${name}`,
      groupDoc: "המסמך",
      groupEnds: (months: number) => (months % 12 === 0 ? countPhrase(months / 12, { one: "שנה אחת", two: "שנתיים", many: "שנים" }) : countPhrase(months, { one: "חודש אחד", two: "חודשיים", many: "חודשים" })),
      groupFor: (period: string) => `תקף ${period} מההצטרפות`,
      groupSide: { buy: "בקנייה בלבד", sell: "במכירה בלבד" },
      groupNoFund: "המסמך של הקבוצה לא מזכיר קרנות, ולכן האתר לא מחשב את הקרן לפי המחיר הזה.",
      kinds: { rate: "", exempt: "", discount: "הנחה של", floor: "לא פחות מ", flat: "מחיר קבוע", flat_up_to: "עד", per_share: "לכל מניה", min: "מינימום", max: "מקסימום" } as Record<string, string>,
      cannot: "אי אפשר לחשב חשבון בתנאים האלה.",
      groupWords: (words: string) => `בקבוצה: ${words}`,
      adoptButton: "להשתמש במחיר הזה",
      adoptUndo: "לחזור לתעריפון",
      adopted: "בחרתם להשתמש במחיר של הקבוצה",
      adoptedAbout: (name: string, words: string) => `${name}: ${words}, לפי בחירתכם`,
      exempt: "פטור",
      field: {
        tradePct: "קנייה ומכירה, אחוז",
        tradeMin: "קנייה ומכירה, מינימום לפעולה",
        custodyPct: "דמי ניהול פיקדון ניירות ערך, אחוז לשנה",
        custodyMin: "דמי ניהול פיקדון ניירות ערך, מינימום לחודש",
        monthlyFee: "דמי ניהול חשבון ניירות ערך, ₪ לחודש",
        fxPct: "המרת מטבע, אחוז",
        placeholder: "בלי שינוי",
      },
      until: {
        label: "כמה שנים נשארים בקבוצה",
        hint: (house: string) => `שדה ריק: נשארים בקבוצה לאורך כל התוכנית. כשיוצאים ממנה, החשבון חוזר לתעריפון של ${house}.`,
        error: "הזינו מספר שלם של שנים.",
        strip: "שנות התוכנית: איזה מחיר חל בכל תקופה",
        today: "היום",
        year: (y: number) => `שנה ${y}`,
        allGroup: "מחירי הקבוצה",
        someGroup: (what: string) => `${what}, במחיר הקבוצה`,
        afterGroup: "התעריפון",
      },
      costs: {
        title: "כמה כל עמלה עולה לאורך התוכנית שלכם",
        list: "לפי התעריפון",
        yours: "בתנאים שלכם",
        fromList: (house: string) => `מהתעריפון של ${house}`,
        fromGroup: (name: string) => `מהמסמך של ${name}`,
        fromYours: "מה שהזנתם",
        computed: "חישוב של האתר",
        total: (who: string) => `${who}: סך העמלות של החשבון`,
      },
      decidesLead: (line: string) => `העמלה שההפרש בה הכי גדול היא ${line}: לאורך כל התוכנית היא עולה`,
      decidesLess: "פחות בחשבון שלכם מאשר לפי התעריפון.",
      decidesMore: "יותר בחשבון שלכם מאשר לפי התעריפון.",
      decidesNone: "החשבון שלכם בדיוק בתנאי התעריפון, ולכן אין הפרש בעמלות.",
      add: "הוספה להשוואה",
      basedOn: (house: string, group: string | null) => (group ? `על בסיס ${house}, ${group}` : `על בסיס ${house}`),
      rowDiff: (more: boolean) => (more ? "יותר מהתעריפון" : "פחות מהתעריפון"),
      rowSame: "כמו בתעריפון",
      rowMainly: (line: string) => `בעיקר מ${line}`,
      houseGone: (house: string) => `${house} כבר לא באתר: השורה שומרת רק את מה שהזנתם.`,
    },
  },

  /** A broker and a fund the person types (D44). */
  customEntries: {
    /** Buttons: an action with an object is an infinitive, up to three words (wording.md). */
    addBroker: "להזין תנאים שקיבלתם",
    addFund: "להוסיף קרן אחרת",
    edit: "עריכה",
    brokerTitle: "חשבון בתנאים שקיבלתם",
    brokerEdit: (name: string) => `התנאים של ״${name}״`,
    brokerSub: "החשבון נשמר רק במכשיר הזה ומושווה כמו כל חשבון אחר בעמוד הזה. שדה ריק הוא מחיר לא ידוע, והחשבון לא ידורג עד שתמלאו אותו. עמלה או מינימום שלא גובים מכם: כתבו 0.",
    /** A new account starts from a house's price list, as the account card's does. */
    brokerStart: "בחרו את הבנק או בית ההשקעות. מתחילים מהתעריפון שלו ומשנים רק את המחירים שקיבלתם.",
    basis: "על בסיס",
    basisNone: "בחרו",
    basisNotListed: "בנק או בית השקעות שלא ברשימה",
    /** The row of an account typed with a line left empty: not ranked (the founder's rule that silence is not zero). */
    incomplete: "חסרים מחירים, ולכן החשבון לא מדורג. השלימו אותם בעריכה.",
    unknownLine: (list: string) => `לא הזנתם, ולכן לא ידוע: ${list}.`,
    /** An account typed with the conversion left empty: only a fund bought abroad converts, so only it has no price there. */
    fxUnknown: "לא הזנתם את המחיר של המרת מטבע, ולכן לקרן שנקנית בחו״ל אין מחיר בחשבון הזה. השלימו אותו בעריכה.",
    /** A fee of a typed fund left empty, where its figure would stand. */
    notTyped: "לא הוזן",
    fundTitle: (index: string) => `קרן על ${index}`,
    fundEdit: (name: string) => `הפרטים של ״${name}״`,
    fundSub: "הקרן נשמרת רק במכשיר הזה, ברשימה של המדד הזה, ומתומחרת כמו כל קרן מהסוג שלה. שדה ריק הוא דמי ניהול לא ידועים, והקרן לא תתומחר עד שתמלאו אותו. דמי ניהול שהקרן לא גובה: כתבו 0.",
    fields: {
      brokerName: "שם הבנק או בית ההשקעות",
      fundName: "שם הקרן",
      number: "מספר נייר (לא חובה)",
      kind: "סוג הקרן",
      trade: "עמלת קנייה ומכירה",
      tradeMin: "מינימום לפעולה",
      /** A minimum left empty, named with its line in the row's list of what is not known. */
      minOf: (min: string, line: string) => `${min} ב${line}`,
      custody: "דמי ניהול פיקדון ניירות ערך",
      custodyMin: "מינימום לחודש",
      percent: "אחוז",
      percentYear: "אחוז לשנה",
      fx: "המרת מטבע",
      monthly: "דמי חשבון קבועים",
      nisMonth: "₪ לחודש",
      fixed: "דמי ניהול קבועים",
      variable: "דמי ניהול משתנים",
      trustee: "שכר נאמן",
      yearly: "דמי ניהול שנתיים",
      sells: "מה אפשר לקנות בחשבון",
      sellsIsraeli: "קרנות בישראל, כולל קרנות חוץ בבורסה בתל אביב",
      sellsAbroad: "קרנות בחו״ל",
      hedged: "נטרול מט״ח",
      hedgedNo: "בלי נטרול",
      hedgedYes: "עם נטרול",
      yield: "תשואת החלוקה",
      perYear: "תשלומים בשנה",
    },
    /** The panel of the person's own fund: its three parts, the questions about the fund, and the preview of its row. */
    fundParts: { fund: "הקרן", fees: "דמי ניהול", traits: "מה הקרן עושה" },
    traitsSub: "כל תשובה מוסיפה לשורה של הקרן את התוויות שמופיעות בה.",
    ask: {
      payout: "מה הקרן עושה עם הדיבידנדים?",
      tracking: "איך הקרן עוקבת אחרי המדד?",
      domicile: "באיזו מדינה הקרן רשומה?",
      hedged: "האם הקרן מנטרלת את שער המטבע?",
      /** On an index the person added, which may be in shekels. */
      currency: "האם ערך הקרן זז עם שער של מטבע זר?",
    },
    unknown: "לא ידוע",
    domicileNames: { IE: "אירלנד", US: "ארצות הברית", other: "מדינה אחרת, או לא ידוע" } as Record<string, string>,
    noLabel: "בלי תווית",
    noPrice: "הקרן תופיע בלי מחיר",
    shekelIndex: "המדד בשקלים",
    shekelIndexNote: "בלי חשיפה למט״ח",
    perYearNames: { "1": "פעם בשנה", "2": "פעמיים", "4": "4 פעמים", "12": "כל חודש" } as Record<string, string>,
    preview: "כך תיראה השורה של הקרן",
    previewPriced: "מה שהזנתם מספיק כדי לחשב את הקרן.",
    previewNone: "בלי תוויות",
    kinds: { "il-tracking": "קרן מחקה ישראלית", "il-etf": "קרן סל ישראלית", "tase-foreign": "קרן חוץ בבורסה בתל אביב", abroad: "קרן שנקנית בחו״ל" } as Record<string, string>,
    enteredWord: "הזנתם",
    yearlyWord: "שנתיים",
    minWord: "מינימום",
    minWordAlone: "מינימום בלבד:",
    listWords: (xs: string[]) => (xs.length < 2 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} ו${xs[xs.length - 1]}`),
    notSold: "לפי מה שהזנתם, אין בחשבון הזה קרנות מהסוג הזה.",
    notSoldSource: "מה שהזנתם",
    tariffTitle: "התנאים שהזנתם",
    errors: {
      "name-empty": "הזינו שם.",
      "name-taken": "השם הזה כבר תפוס.",
      "sells-none": "סמנו לפחות סוג אחד.",
      "hedged-none": "בחרו מה קורה לקרן כששער המטבע זז.",
      negative: "הסכום לא יכול להיות שלילי.",
    } as Record<string, string>,
    save: "שמירה במכשיר",
    cancel: "ביטול",
    remove: "הסרה מהמכשיר",
    removeAsk: (name: string) => `להסיר את ״${name}״ מהמכשיר הזה?`,
    removeYes: "הסרה",
    noStorage: "אי אפשר לשמור במכשיר הזה. מה שתזינו יישאר רק בזמן הביקור.",
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
    siteExample: "לדוגמה של האתר",
    all: "כל ההנחות",
    panelTitle: "ההנחות של החישוב",
    knobs: {
      amount: "סכום היום",
      monthly: "הפקדה חודשית",
      years: "שנים",
      ret: "תשואה בשנה",
      more: "עוד",
      today: "היום",
      perMonth: "בחודש",
      oneYear: "עוד שנה",
      retStep: "תשואה",
      most: "הכי משפיע",
      others: "אינפלציה",
      /** After the inflation's figure on the plan card's line. */
      perYear: "בשנה",
      /** What the yearly return is (A-01, a gross return: docs/method.md), on the plan card's line under the sliders, and at the head of the assumptions. */
      retBefore: "התשואה בשנה היא לפני אינפלציה, דמי ניהול, עמלות ומס",
      /** At the head of the assumptions: what the return is (A-01), what the results are, and A-04 "constant real" (F-05), since the
       *  results hold only with the deposit rising with prices. */
      assumptions: "התשואה בשנה היא לפני אינפלציה, דמי ניהול, עמלות ומס. מה שנשאר מחושב אחרי כל אלה, בכסף של היום. ההפקדה החודשית עולה עם האינפלציה, כך שבכסף של היום היא נשארת קבועה.",
      /** Under them: the yearly income the runs assume (P-05 `annual_income`, or the one entered), and that the receipt's capital gains tax
       *  line holds the surtax too when that income with the real gain passes its threshold in the year of the sale (F-43, TXG-09, TXG-10) */
      income: {
        before: "החישוב מניח הכנסה של",
        after: "בשנה, מלבד הרווח.",
        surtax: "השורה ״מס רווחי הון״ כוללת גם",
        term: "מס נוסף",
        end: ", אם בשנת המכירה ההכנסה יחד עם הרווח עוברת את הסף שלו.",
      },
      changes: {
        title: "מה הכי משנה את מה שיישאר לכם",
        lead: "בכל קו משתנה מספר אחד, והשאר נשארים כמו בתוכנית שלכם. גררו את הקו האנכי בגרף, או בחרו שינוי:",
        ifUp: "אם תגדילו כל מספר ב־",
        ifDown: "אם תקטינו כל מספר ב־",
        most: "הכי ישנה",
        nouns: { amount: "הסכום של היום", monthly: "ההפקדה החודשית", years: "מספר השנים", ret: "התשואה" } as Record<string, string>,
        atEnd: "בסוף",
        planHead: "לפי התוכנית שלכם יישארו לכם בסוף",
        more: "יותר",
        less: "פחות",
        planWord: "התוכנית שלכם",
        xTitle: "השינוי בכל מספר",
        yTitle: "נשאר בסוף (₪)",
        choices: "השינוי שמוצג",
        cols: ["המספר", "בתוכנית שלכם", "אחרי השינוי", "נשאר לכם בסוף", "ההפרש"],
        foot: "בכסף של היום, אחרי דמי ניהול, עמלות ומס, בחשבון ובקרן שהעמוד מחשב למעלה.",
        aboutTo: "המספר אחרי השינוי",
        aboutLeft: "מה יישאר בסוף אחרי השינוי",
        aboutDiff: "ההפרש ממה שיישאר לפי התוכנית שלכם",
      },
    },
    dollar: "שער הדולר",
    dollarSource: "מחושב משערי הייחוס של הבנק המרכזי האירופי",
    dollarMissing: "אין שער דולר בשערי הייחוס; הדרך בחו״ל לא מחושבת.",
  },

  header: {
    israeliIndex: "מדד של חברות ישראליות",
    foreignIndex: "מדד של חברות מחוץ לישראל",
    foreignNote: "אפשר להחזיק אותו גם דרך קרן חוץ.",
    israeliNote: "קרנות ישראליות שמחזיקות את המניות; אין קרן חוץ שמתמחה בישראל.",
  },

  worth: {
    lines: { house: "אותה קרן, בחשבון ניירות ערך אחר", fund: "אותו חשבון ניירות ערך, קרן אחרת" },
    heading: "מה כל בחירה שווה, בפירוט",
    sub: "ההפרש בין הבחירה הטובה לגרועה, בכסף של היום.",
    bars: {
      broker: "איזה חשבון ניירות ערך",
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
    foldLabel: "קרן סל או קרן מחקה: מה ההבדל",
    foldSub: "כל אחת היא דרך אחרת להחזיק את אותו מדד: איך קונים אותה, איך היא מתומחרת ואיך היא ממוסה.",
    titles: { "il-tracking": "קרן מחקה ישראלית", "il-etf": "קרן סל ישראלית", "tase-foreign": "קרן חוץ בת״א", abroad: "בחו״ל" } as Record<string, string>,
    titlesIn: { "il-tracking": "קרן מחקה ישראלית", "il-etf": "קרן סל ישראלית", "tase-foreign": "קרן חוץ בבורסה בתל אביב", abroad: "דרך בחו״ל" } as Record<string, string>,
    funds: (n: number) => (n === 0 ? "אין קרנות שנאספו" : n === 1 ? "קרן אחת שנאספה" : `${n} קרנות שנאספו`),
    bestBroker: "חשבון ניירות הערך הזול",
    bestFund: "הקרן הטובה",
    brokerCost: "עלות חשבון ניירות הערך",
    left: "נשאר",
    noBroker: "אין חשבון ניירות ערך שאפשר לחשב לו",
    notYet: "עוד לא חושב",
    noRate: "אין שער דולר בשערי הייחוס.",
    noFundsFor: "לא נאספו קרנות על המדד הזה",
    on: (exchange: string) => `בבורסה ב${exchange}`,
    exchange: { us: "ארצות הברית", europe: "לונדון" } as Record<string, string>,
  },

  matters: {
    house: { lead: "אותה קרן, בחשבון ניירות ערך אחר:", body: "יישארו לכם עד {gap} פחות.", one: "הקרן הזו מחושבת רק בחשבון ניירות ערך אחד, ולכן אין חשבון אחר להשוות." },
    fund: { lead: "אותו חשבון ניירות ערך, קרן אחרת:", body: "עד {gap} פחות.", one: "זו הקרן היחידה שמחושבת בחשבון ניירות הערך הזה." },
    under: "לעומת הדרך הזולה ביותר, בעוד {years} שנים, בכסף של היום.",
  },

  houses: {
    gapAbout: (name: string) => `פער מהדרך הזולה, ${name}`,
    costAbout: (name: string) => `עלות ${name}`,
  },

  /** The page as two linked lists (spec 8dd1f013:research/specs/2026-10-27-invest-improvements 3.8 to 3.10): an account and a fund, each list priced on the other's choice. */
  pair: {
    paidIn: "הפקדתם",
    paidInAbout: "סך ההפקדות",
    /** The bank's monthly current-account minimum among a row's inputs, with its price list as the source (F-102). */
    accountMinimum: "דמי ניהול חשבון עו״ש בחודש",
    /** An exchange rate a run is priced at (F-84), among a figure's inputs: the currency the fund is bought in, or a price-list line set in it. */
    rateInput: (code: string): string => {
      const word = invest.currencies[code];
      return word ? `שער ה${word}` : `שער ⁦${code}⁩`;
    },
    /** F-91's X, the deposits grown at the plan's return alone: what the receipt and a pair's figures start from. */
    baseInput: "ההפקדות עם התשואה בלבד",
    baseAbout: "ההפקדות עם התשואה של התוכנית בלבד, בלי מה שהחשבון, הקרן והמדינה לוקחים, בכסף של היום",
    left: (years: number) => `נשאר לכם בעוד ${yearsSpan(years)}`,
    steadyDollar: "אם הדולר לא זז מול השקל",
    steadyIndexCurrency: "אם שער המטבע של המדד לא זז מול השקל",
    cheapest: "הזוג הזול ביותר",
    cheapestStar: "★ הזוג הזול ביותר לתוכנית שלכם",
    yours: "הבחירה שלכם",
    next: "הזוג הבא בתור",
    vsYours: "לעומת הבחירה שלכם",
    /** Before any pick, the next pair is set against the cheapest one, never against "your choice". */
    vsCheapest: "לעומת הזוג הזול ביותר",
    /** Before any pick, on an index with no ranked pair: the pair shown is the one that leaves the most, on an open rule, and says why it is not ranked. */
    openTop: "הזוג שמשאיר הכי הרבה, בלי דירוג כי המס תלוי בשאלה פתוחה",
    /** Every pair within the site's tie threshold of the top (P-01, F-80): none is crowned, and the count is said; with the
     *  funds they hold where fewer, the count the fund list's "אחת מ־3 הקרנות השקולות" makes ("אחד מ־5 הזוגות" beside "מ־3"). */
    tieTop: (n: number, funds = n) =>
      `${n === 2 ? "אחד משני הזוגות הזולים ביותר לתוכנית שלכם" : `אחד מ־${n} הזוגות הזולים ביותר לתוכנית שלכם`}${funds >= n ? "" : funds === 1 ? (n === 2 ? ", שניהם באותה קרן" : ", כולם באותה קרן") : funds === 2 ? ", שבהם שתי קרנות שונות" : `, שבהם ${funds} קרנות שונות`}`,
    /** The next pair, itself within the threshold: no order is shown between them. */
    tieOther: "עוד אחד מהזוגות הזולים ביותר",
    /** On the person's pick, within the threshold of the top. */
    tiedWith: "בין הזוגות הזולים ביותר",
    /** A pair's role under a tie: neither pair is first. */
    tieRole: "אחד מהזוגות הזולים ביותר",
    /** The pairs of the tie other than the two the fees panel names, named after them, so the count points at pairs the reader can find. */
    tieThird: "הזוג השלישי:",
    tieRest: "הזוגות האחרים:",
    tieWith: "עם",
    tieMore: (n: number) => (n === 1 ? "ועוד זוג אחד" : `ועוד ${n} זוגות`),
    /** What makes pairs a tie, said where the tie is first named, around P-01 written as a figure (the threshold was not on the page). */
    tieRule: { before: " זוגות נחשבים שקולים כשההפרש בין הסכומים שהם משאירים בסוף קטן מ־", after: " מהסכום הגדול מביניהם." },
    tieWhy: (n: number) => (n === 2 ? "ההפרש קטן מכדי לקבוע איזה זוג זול יותר, ולכן שני הזוגות שקולים." : `ההפרשים בין ${n} הזוגות הזולים ביותר קטנים מכדי לקבוע איזה מהם זול יותר, ולכן הם שקולים.`),
    /** An input of a computed figure, named by whose it is: "הבחירה שלכם: נשאר". */
    input: (who: string, what: string) => `${who}: ${what}`,
    moreIfCheapest: "יותר אם עוברים לזוג הזול",
    pickCheapest: "לבחור בזוג הזה",
    who: { account: "החשבון:", fund: "הקרן:", state: "המדינה:" },
    lines: { trade: "עמלות קנייה ומכירה", custody: "דמי משמרת", fixed: "דמי ניהול חשבון", fx: "המרת מטבע", other: "עמלות אחרות", account: "דמי ניהול חשבון עו״ש" } as Record<string, string>,
    /** The legend's item for the account's own fee and a bank's current account (D64), which share its colour ("דמי ניהול חשבון" alone read as either). */
    legendAccount: "דמי ניהול חשבון ניירות ערך ועו״ש",
    /** The same item where no bar shown counts a current account (an investment house, a bank marked as the person's own): a legend names only what is drawn. */
    legendSecurities: "דמי ניהול חשבון ניירות ערך",
    lineAbout: (line: string) => `מה החשבון גובה: ${line}`,
    /** Where a part of a cost bar's price comes from, said in the box that opens on pointing at it or tapping it. */
    sourceList: (house: string) => `מהתעריפון של ${house}`,
    sourceEntered: "מה שהזנתם",
    sourceFund: "מהעלויות של הקרן עצמה",
    sourceComputed: "חישוב של האתר",
    /** F-91's fund part: the management, variable and trustee fees, A-07, the spread and the tax inside the fund (A-11). */
    fundLine: "עלות הקרן",
    fundAbout: "העלויות של הקרן עצמה, כולל מס דיבידנד בתוך הקרן",
    /**
     * The fund's yearly costs as the site prices them, among the inputs of every figure that runs the fund (a fund 2.93 points
     * behind its index can rank ahead of one 2.91 behind: the forward costs differ, and the sheet lists them).
     */
    fundInputs: {
      fixed: "הקרן: דמי ניהול קבועים",
      variable: "הקרן: דמי ניהול משתנים",
      trustee: "הקרן: שכר נאמן",
      payout: "הקרן: תשואת חלוקה",
      /** A-11 by F-107: the US tax on the dividends of the US shares an Irish fund holds, and the three figures it multiplies. */
      usWithholding: "הקרן: מס אמריקני על הדיבידנדים, בשנה",
      usWithholdingAbout: "המס שארצות הברית מנכה מהדיבידנדים של המניות האמריקניות בקרן, באחוזים מהקרן בשנה",
      usRate: "שיעור המס האמריקני על דיבידנד לקרן אירית",
      usYield: "תשואת הדיבידנד של המניות האמריקניות במדד",
      usWeight: "משקל המניות האמריקניות במדד",
      /** F-92 (b): a year whose report prints no fees charged is measured against the fees listed today. */
      listedFixed: "דמי ניהול קבועים שהקרן גובה היום",
      listedVariable: "דמי ניהול משתנים שהקרן גובה היום",
      listedTrustee: "שכר נאמן שהקרן גובה היום",
      beyond: (years: number[]) => (years.length === 1 ? `הקרן: פיגור מעבר לדמי הניהול ולשכר הנאמן ב־${years[0]}` : "הקרן: פיגור מעבר לדמי הניהול ולשכר הנאמן, בשנה"),
      beyondAbout: (years: number[]) =>
        years.length === 1
          ? `הפיגור של הקרן אחרי המדד ב־${years[0]}, מעבר לדמי הניהול ולשכר הנאמן שגבתה; הקדמה על המדד נספרת כאפס`
          : "ממוצע הפיגור של הקרן אחרי המדד, מעבר לדמי הניהול ולשכר הנאמן שגבתה בכל שנה; שנים שבהן הקרן הקדימה את המדד נכנסות לממוצע, וממוצע של הקדמה נספר כאפס",
      chargedFixed: (year: number) => `דמי ניהול קבועים שנגבו ב־${year}`,
      chargedVariable: (year: number) => `דמי ניהול משתנים שנגבו ב־${year}`,
      chargedTrustee: (year: number) => `שכר נאמן שנגבה ב־${year}`,
    },
    /** The state's part, by the exact tax (docs/copy.md 1): the capital gains tax at the sale (TXS-01, TXF-02) */
    taxLine: "מס רווחי הון",
    /** ... and, where a bar's fund pays out, the tax on what it pays (TXS-10, TXF-10) */
    taxLinePayouts: "מס רווחי הון ומס על דיבידנד",
    taxAbout: "מס רווחי הון במכירה, בכסף של היום",
    taxAboutPayouts: "מס רווחי הון במכירה ומס על הדיבידנד בכל חלוקה, בכסף של היום",
    /** The part of the account's cost no single fee line explains (F-91), named by what it adds and where it comes from. */
    remainder: "תוספת משילוב עמלות החשבון",
    remainderAbout: "החלק הזה לא שייך לעמלה אחת: בלי אחת מעמלות החשבון הוא עדיין היה נגבה, כי שאר עמלות החשבון היו גובות אותו מהכסף שהיא כבר לא הייתה לוקחת ומהצמיחה שלו.",
    /** F-109, F-91 (D94): where the house buys the fund in whole units, what the cash waiting for a unit did against the fund. Not a fee: its
     *  own line beside the account's fees, a minus where the fund rose while the cash waited and a plus where it fell; `why` under it by its sign */
    waiting: "כסף שחיכה ליחידה שלמה",
    waitingAbout: "ההפרש בין הכסף שחיכה ליחידה שלמה לבין מה שהיה נעשה ממנו בקרן, עד המכירה, בכסף של היום",
    waitingWhy: { rose: "קונים כאן רק יחידות שלמות, והכסף שחיכה לא עלה עם הקרן.", fell: "קונים כאן רק יחידות שלמות, והכסף שחיכה לא ירד עם הקרן." },
    /** F-109 (D94): one line on a row whose house buys the fund in whole units, where a monthly deposit buys no unit in most months, or in some */
    unitsEvery: "יחידה עולה יותר מההפקדה החודשית: קונים פעם בכמה חודשים, ובינתיים הכסף מחכה בחשבון בלי ריבית.",
    unitsSome: "קונים רק יחידות שלמות: בחודש שההפקדה לא מגיעה ליחידה, הכסף מחכה בחשבון בלי ריבית.",
    /** F-109: a fund bought in whole units whose unit price the site did not collect is priced by amount, and its row says so */
    unitPriceMissing: "מחיר יחידה של הקרן לא נאסף, אז החישוב קונה בכל סכום, גם חלק מיחידה.",
    accountSlot: "חשבון ניירות ערך",
    fundSlot: "קרן",
    accounts: "כל החשבונות",
    funds: (index: string) => `כל הקרנות על ${index}`,
    colAccount: "חשבון",
    colCharges: (years: number) => `מה החשבון גובה ${inYears(years)}`,
    colChargesShort: "מה החשבון גובה",
    tariff: "התעריפון",
    /** Beside the price list's link: when the site saved its copy. */
    collectedOn: (date: string) => `נאסף ב־${date}`,
    /** Over the account list: the days the price lists were saved, oldest and newest. */
    collectedSpan: (from: string, to: string) => (from === to ? `התעריפונים נאספו ב־${from}.` : `התעריפונים נאספו בין ${from} ל־${to}.`),
    /** On the chosen account's card, beside its price list: opens the house's account on your own terms (one link, not a line on every row). */
    ownPrice: "להזין מחיר שקיבלתם",
    colLeft: "נשאר",
    /** The lists' head over what is left: its "?" says after what and in what money (design.md: a head says what it holds). */
    colLeftHelp: "מה שנשאר לכם בסוף, אחרי דמי הניהול, העמלות והמס, בכסף של היום.",
    colFund: "קרן",
    colNumber: "מספר נייר",
    colFees: "דמי ניהול",
    colYield: "תשואת חלוקה",
    /** The page's own pick when it is one of the pairs the tiles call tied (a tie, then the site's mark on one of them). */
    markedTie: (n: number) => (n === 2 ? "אחת משתי הקרנות השקולות" : `אחת מ־${n} הקרנות השקולות`),
    cheapestTag: "★ הזול",
    whichPrice: "המחיר בכל שורה הוא של לקוח רגיל, והדירוג לפיו. מחיר לקבוצות כתוב בשורה של הבנק או בית ההשקעות ולא נכנס לחישוב.",
    /** D64: the bank where the person already has a current account; that bank's row leaves the current account out. */
    ownBank: {
      label: "הבנק שבו כבר יש לכם חשבון עו״ש",
      none: "לא באחד מהבנקים האלה",
      /** `free`: the banks whose price list charges nothing for a current account, which the box leaves out (One Zero, D64), so its row
       * reads as a bank's that counts no fee. */
      counted: (free: string[]) =>
        `השורה של כל בנק שגובה דמי ניהול חשבון עו״ש סופרת אותם, כי השקעה דרכו דורשת חשבון עו״ש אצלו. כבר יש לכם חשבון עו״ש באחד מהבנקים? בחרו אותו בתיבה, והשורה שלו לא תספור אותם.${free.length > 0 ? ` ${andList(free)} ${free.length > 1 ? "לא גובים" : "לא גובה"} דמי ניהול חשבון עו״ש,` : ""} ${free.length > 0 ? "ובית" : "בית"} השקעות לא דורש עו״ש אצלו.`,
    },
    /** D65 and D66: said once, for an index with funds bought abroad; `capped`: the houses whose price lists print a limit on the spread, which their figures count at the limit (F-13). */
    abroadTitle: "מה לא נכנס למחיר של קרן שנקנית בחו״ל",
    abroadSpread: (capped: string[]) => `מעבר לעמלת המרת המטבע, הבנק או בית ההשקעות ממירים את השקלים לדולרים בשער שהם קובעים, שיכול להיות גרוע משער השוק. בתעריפון של רוב הבנקים ובתי ההשקעות אין תקרה לפער הזה, ולכן הוא לא נכנס לחישוב. תקרה לפער כתובה בתעריפון של ${andList(capped.map((x, i) => (i > 0 && i === capped.length - 1 && /^[A-Za-z]/.test(x) ? `־${x}` : x)))}, ואצלם החישוב סופר את הפער בגובה התקרה.`,
    /** D66: what others abroad charge a house is left out, with or without a printed ceiling; said against the spread above, which the house
     * sets itself: a written ceiling counted there and not here would read as a contradiction. */
    abroadOthers:
      "גם גופים בחו״ל גובים עמלות מהבנק או מבית ההשקעות: ברוקר, הגוף ששומר את ניירות הערך, הבורסה או רשויות. רוב הבנקים ובתי ההשקעות מעבירים אותן ללקוח. בשונה מהפער בשער ההמרה, שהבנק או בית ההשקעות קובעים בעצמם, את העמלות האלה קובע הגוף בחו״ל, ולכן הן לא נכנסות לחישוב, גם כשהתעריפון כותב להן תקרה. קרן שנקנית בחו״ל יכולה לעלות יותר ממה שמחושב כאן.",
    /** D67, F-103: a house whose price list prints custody abroad at `{custody}` (0%, its own line) and passes on the custodian's cost per
     * corporate event, up to `{amount}` (One Zero): counted at that ceiling on each dividend of a fund that pays one, and never on a fund that
     * keeps its profit. */
    abroadPerDividend:
      "יוצא מן הכלל: בתעריפון של {name} דמי ניהול פיקדון ניירות ערך בחו״ל הם {custody}, והעלות של הגוף ששומר את ניירות הערך עוברת ללקוח, עד {amount} על כל דיבידנד. בלי העלות הזאת שמירת ניירות הערך שם הייתה נראית בחינם, ולכן החישוב סופר את המרב, {amount} על כל דיבידנד, בקרן בחו״ל שמחלקת דיבידנד (רווח שהקרן משלמת למחזיקים בה). קרן שצוברת את הרווח בתוכה (בשמה כתוב Accumulating) לא משלמת אותה.",
    yoursTag: "החשבון שלכם",
    standingTag: "מחיר להוראת קבע",
    /**
     * a house that sells this kind of fund only by phone, in its own words (an availability entry's `phone_only`): a tag beside
     * the house, which opens the source, and one line on the chosen pair's card. The price and the order do not change.
     */
    phoneTag: "בטלפון בלבד",
    phoneLine: (house: string) => `${inName(house)} קונים את הקרן הזאת רק בטלפון, דרך חדר המסחר.`,
    phoneAbout: (house: string) => `איך קונים את הקרן ${inName(house)}`,
    phoneLead: (quote: string) => `לפי החברה, את הקרן הזאת קונים אצלה רק בטלפון, דרך חדר המסחר: ״${quote}״.`,
    /** The houses counted are the Israeli ones: the count leaves out the accounts abroad (Interactive, `foreign`), which the list beside the
     *  note holds ("3 מתוך 15" beside a list of 17 accounts). */
    standingNote: (n: number, total: number) =>
      `קנייה חודשית מחושבת כהוראת קבע: ${n === 1 ? `אחד מתוך ${total} הבנקים ובתי ההשקעות בישראל שברשימה מפרסם` : `${n} מתוך ${total} הבנקים ובתי ההשקעות בישראל שברשימה מפרסמים`} לה מחיר נמוך יותר, והוא שנכלל בחישוב. סכום חד־פעמי ומכירה מחושבים במחיר הרגיל.`,
    /** In the standing-order note's place when the plan has no monthly deposit. */
    noMonthly: "בלי הפקדה חודשית אין קנייה בהוראת קבע, ולכן כל החשבונות מחושבים במחיר הרגיל.",
    /**
     * D41, D56: banks whose price lists print a standing-order price their own documents do not show the reader can use for the page's
     * funds; each row says its bank's reason (`asideLine`). Counted over the Israeli houses, as `standingNote`.
     */
    asideNote: (n: number, total: number) =>
      `קנייה חודשית מחושבת במחיר הרגיל. ${n === 1 ? `אחד מתוך ${total} הבנקים ובתי ההשקעות בישראל שברשימה מפרסם` : `${n} מתוך ${total} הבנקים ובתי ההשקעות בישראל שברשימה מפרסמים`} מחיר אחר לקנייה בהוראת קבע, אבל המסמכים שלהם לא מראים שאפשר לקנות בה את הקרנות שבעמוד, ולכן הוא לא נכנס לחישוב.`,
    /** Under a bank's row, after the "not counted" tag: the standing-order price its price list prints, then the record's reason. */
    asideLine: "מחיר אחר לקנייה בהוראת קבע: {rate}, מינימום {min}.",
    asideLineNoMin: "מחיר אחר לקנייה בהוראת קבע: {rate}.",
    broken: "⫽ הפס נחתך: הסכום ארוך מהשטח",
    /** An account's row where it prices no fund on the index, by why, in `whyNoFundAt`'s order: its record leaves it in doubt, its price
     *  list is not collected, its documents say no kind of fund on the index is sold there, or the engine gave no price. The words
     *  themselves open why: the rule the record names, or each kind's reason with its document (D104, D105). */
    noFund: { doubt: "לא ברור אם אפשר שם", missing: "התעריפון עוד לא נאסף", notSold: "לא אפשרי שם", other: "אין מחיר" },
    /** The line over the funds the picked account gives no price, by why, naming the account; the words open why, as an account's row
     *  does (D105). Same order as `whyNoPrice`: a doubt in the record, a price list not collected, a kind the house does not sell. */
    noPriceAt: {
      doubt: (house: string) => `לא ברור אם נקנית ${inName(house)} ובאיזה מחיר`,
      missing: (house: string) => `התעריפון של ${house} עוד לא נאסף`,
      notSold: (house: string) => `לא נקנית ${inName(house)}`,
      other: (house: string) => `אין מחיר ${inName(house)}`,
    },
    /** Under a fund listed in Tel Aviv and abroad, on each of its two rows: the other row is the same fund, counted once. */
    sameFundAs: (number: string, abroad: boolean) => `אותה קרן כמו \u2066${number}\u2069 ${abroad ? "שנסחרת בחו״ל" : "שנסחרת בתל אביב"}, ולכן שתיהן נספרות כקרן אחת`,
    notPossibleSource: "המקור",
    /** A grey row's long reason shows two lines; the rest opens at a tap (on a phone the reasons kept about 450 px of blank under the list). */
    reasonMore: "ההסבר המלא",
    reasonLess: "הסבר מקוצר",
    /** A house whose own documents say this kind of fund cannot be bought there (said only in a link's title before). */
    notPossibleAny: "לפי המסמכים של החברה, אי אפשר לקנות שם קרן על המדד הזה.",
    notPossibleWhy: (kind: string) => `לפי המסמכים של החברה, אי אפשר לקנות שם ${kind}.`,
    /** On an account row with no price for the fund: picking it picks another fund too, said before the tap, with no figure: a
     *  row with no data shows no value ("אין נתון" beside "ונשארים 84,172 ₪"). */
    elsewhere: "בחירה בחשבון הזה מעבירה גם לקרן",
    /** On a fund row with no price at the account: picking it moves the account, said before the tap. */
    pickMoves: (house: string) => `בחירה בה מעבירה את החשבון ${toName(house)}`,
    /** On the row tapped, after the tap changed the other half too, with the way back: it puts back both the account and the fund,
     * not the fund alone. */
    movedHouse: (house: string) => `החשבון עבר ${toName(house)}`,
    moveBackTo: (house: string) => `חזרה ${toName(house)} ולקרן הקודמת`,
    movedFund: "גם הקרן הוחלפה.",
    /** On a fund row priced on an open rule: why it stands below the ranked funds, on the row itself (Invesco
     *  1183441 leaves more than a tied fund and stands under it; a legend elsewhere does not say why). */
    openRow: "מוצגת, לא מדורגת: שאלה פתוחה",
    fundsNotPriced: (n: number, house: string) => (n === 1 ? `קרן אחת לא מחושבת ב${house}:` : `${n} קרנות לא מחושבות ב${house}:`),
    switched: (what: string) => `${what} לא מחושב עם הבחירה הקודמת, אז נבחר גם החלק השני שנשאר בו הכי הרבה.`,
    listLabelAccounts: "חשבונות ניירות ערך",
    listLabelFunds: "קרנות על המדד",
    moreFunds: (n: number) => (n === 1 ? "עוד קרן אחת" : `עוד ${n} קרנות`),
    /**
     * In the "?" beside the fund list's name head, where a fund's name carries an exposure profile such as (4D) (ETF-12; "(4D) and (4A)
     * are never explained"): each code on the list in plain words, over the term's glossary card. The keys are the profile's two grades.
     */
    profile: {
      about: "הקוד בסוגריים בשם של קרן",
      lead: "הקוד בסוגריים בשם של קרן ישראלית הוא",
      term: "פרופיל החשיפה שלה",
      equity: { "4": "יכולה להיות כולה במניות" } as Record<string, string>,
      currency: { D: "וגם כולה במטבע חוץ", A: "וכמעט בלי מטבע חוץ, כמו קרן מנוטרלת מט״ח", "0": "ובלי מטבע חוץ" } as Record<string, string>,
      code: (code: string, words: string) => `\u2066(${code})\u2069: הקרן ${words}`,
    },
  },

  typeTags: { "il-etf": "קרן סל", "il-tracking": "קרן מחקה", "tase-foreign": "קרן חוץ בת״א", abroad: "בחו״ל" } as Record<string, string>,

  folds: { worth: "מה כל בחירה שווה, בפירוט" },

  funds: {
    heading: (house: string) => `הקרנות על המדד, בחשבון ${/^[A-Za-z]/.test(house) ? "ב־" : "ב"}${house}`,
    pick: "הקרנות על המדד",
    house: "חשבון ניירות ערך",
    manager: "מנהל הקרן",
    rank: "מקום",
    name: "קרן",
    fees: "דמי הניהול שלה",
    fixed: "דמי ניהול קבועים",
    variable: "דמי ניהול משתנים",
    trustee: "שכר נאמן",
    labels: "תוויות",
    value: (broker: string) => `נשאר ב${broker}`,
    yours: (broker: string) => `ב${broker}`,
    whatLabels: "מה אומרות התוויות?",
    /**
     * The note under the list: only the sentences for the states the list shows, the kind of index once, and that a lead over
     * the index is not counted as a gain. `unstated`: how many funds' index is of no stated kind; `grossApart`: a
     * gross index not compared on this list; `kind` null: no fund on the list has a compared gap, and the column is left out.
     */
    gapNote: ({ kind, unstated, grossApart, funds, noYear, notCollected, typed = 0 }: { kind: "net" | "gross" | "mixed" | null; unstated: number; grossApart: boolean; funds: number; noYear: number; notCollected: number; typed?: number }) =>
      [
        kind
          ? "מול המדד: בכמה הקרן, אחרי כל העלויות שלה, הקדימה (+) או פיגרה (−) אחרי המדד שלה: בשנה המלאה שבדוח של הקרן, או בממוצע לשנה כשבדוח יש כמה שנים מלאות."
          : "מול המדד: לאף קרן ברשימה אין פער מושווה מול המדד שלה, ולכן אין עמודה כזאת.",
        kind === "net"
          ? "המדד כאן הוא מדד נטו, שסופר את הדיבידנדים אחרי המס על דיבידנדים שמנוכה מהם במדינה של החברה."
          : kind === "gross"
            ? "המדד כאן הוא מדד ברוטו, שסופר את הדיבידנדים לפני המס על דיבידנדים."
            : kind === "mixed"
              ? "חלק מהקרנות נמדדות מול מדד נטו וחלק מול מדד ברוטו; הסוג כתוב בפירוט שנפתח מהמספר."
              : null,
        unstated > 0
          ? kind
            ? "״לא מושווה״: האתר לא מצא מסמך רשמי שאומר איך המדד של הקרן סופר את הדיבידנדים, ולכן הפער שלה לא מוצג."
            : unstated === funds
              ? "האתר לא מצא מסמך רשמי שאומר איך המדד של הקרנות סופר את הדיבידנדים."
              : `אצל ${unstated} מהקרנות האתר לא מצא מסמך רשמי שאומר איך המדד שלהן סופר את הדיבידנדים.`
          : null,
        grossApart && kind ? "״לא מושווה״ ליד קרן על מדד ברוטו: המדד סופר את הדיבידנדים לפני המס על דיבידנדים, ופער מולו לא דומה לפער של שאר הקרנות ברשימה." : null,
        // "אין שנה מלאה" stood in the list with no word about it
        noYear > 0 ? "״אין שנה מלאה״: בדוח השנתי של הקרן עוד אין שנה קלנדרית מלאה להשוות למדד." : null,
        notCollected > 0 ? "״עוד לא נאסף״: האתר עוד לא קרא את התשואות של הקרן ושל המדד שלה." : null,
        typed > 0 ? "״לא נבדק״: לקרן שהזנתם האתר לא קורא דוח שנתי, ולכן הוא לא יודע את הפער שלה מהמדד." : null,
      ]
        .filter(Boolean)
        .join(" "),
    kindsNote: "בכל סוג הקרנות מסודרות לפי מה שנשאר, והסדר לא תלוי בדולר.",
    /** The shekel column's "?" (design.md: a column's longer explanation goes in its head's "?"): a fund 0.28% behind can leave less than
     *  funds 0.29% behind, since the shekels follow the fees, and a lead inside them earns nothing. */
    diffHelp: (steadyRate: boolean, gap: boolean) =>
      [
        "ההפרש במה שנשאר בסוף, אחרי דמי הניהול, עמלות החשבון והמס.",
        gap ? "זה לא הפער מהמדד: בחישוב הזה, פיגור מעבר לדמי הניהול נוסף לעלות, והקדמה על המדד לא נספרת כרווח." : null,
        steadyRate ? "הסכומים הם אם שער המטבע לא משתנה מול השקל." : null,
      ]
        .filter(Boolean)
        .join(" "),
    notCollected: "לא נאסף",
    noSuchFee: "אין",
    feeWordsNote: "״אין״ ליד דמי ניהול משתנים או שכר נאמן: אלה שורות של החוק הישראלי לקרנות, והוא לא חל על קרן זרה. ״לא נאסף״: לקרן יש שורה כזאת, והאתר עוד לא אסף את המספר שלה.",
    /** After "אין": "אין נאמן" alone could read as a fund with no custodian, which is not what the site knows. */
    noTrusteeWord: "שכר נאמן",
    cannot: "אי אפשר לחשב",
    currencyMismatch: (fund: string, index: string) => `הקרן נקובה ב${fund} והמדד ב${index}; האתר לא מחשב את ההפרש ביניהם.`,
    mismatchTag: "מטבע שונה ממטבע המדד",
    number: "מספר נייר",
    sameAsBest: "אותו חשבון ניירות ערך",
    emptyHeading: "עוד לא נאספו קרנות על המדד הזה",
    emptyBody: "בלי קרן שנאספה, האתר לא מנחש דמי ניהול. אפשר לבחור קרן במאיה, מערכת ההודעות של הבורסה, לפי דמי הניהול שלה, או לבקש שהאתר יאסוף.",
    maya: "לחיפוש במאיה",
    mayaPage: "בדף הקרן במאיה",
    request: "לבקש שהאתר יאסוף",
    requestText: (index: string) => `אבקש שהאתר יאסוף קרנות על המדד ״${index}״.`,
    copied: "הועתק",
    noOption: "אין קרנות שנאספו שנקנות בחשבון הזה.",
    israelTitle: "קרנות ישראליות",
  },

  /** The "?" beside the return under the sliders: what the return is, and whether the lists' order holds at another (wording.md: a note
   *  beside what it qualifies). */
  foot: {
    returnAbout: "התשואה שבחישוב",
    example: "תשואה לדוגמה, לא תחזית: הסדר של הדרכים לפי עלויות, לא לפי מה שהמדד יעשה.",
    enteredHelp: "התשואה שבחישוב היא זו שהזנתם.",
    holds: "הסדר נשמר בכל תשואה בין 0% ל־10%.",
    flips: "הסדר משתנה בתשואה שונה:",
    flipsAt: (at: number) => `ב־${at}%`,
    flipWhat: { options: "הסדר בין האפשרויות", brokers: (o: string) => `הסדר בין החשבונות ב${o}`, funds: (o: string) => `הסדר בין הקרנות ב${o}` },
    sharePrice: "קרנות בחו״ל שהתעריפון שלהן נקבע לפי מספר המניות מחכות למחיר היחידה של הקרן, שעוד לא נאסף.",
  },

  /** Hedged or not: the fund list's two groups and rows (F-94). */
  kinds: {
    name: { unhedged: "בלי נטרול מט״ח", hedged: "עם נטרול מט״ח" } as Record<"unhedged" | "hedged", string>,
    nameMany: (ccy: string) => ({ unhedged: "בלי נטרול", hedged: `עם נטרול ה${ccy}` }) as Record<"unhedged" | "hedged", string>,
    hedgedMany: "המטבעות האחרים שבמדד עדיין משפיעים, מול הדולר.",
    between: "בין",
    and: "ל־",
    /** Funds, not rows: a fund in Tel Aviv and abroad is a row each, and each of its rows says so. */
    groupCount: (n: number) => countPhrase(n, { one: "קרן אחת", two: "שתי קרנות", many: "קרנות" }),
    colGap: "מול המדד",
    /**
     * the row's words under the gap, and the gap sheet's head in full (not "בשנה" alone): one year names it
     * ("בשנה · שנה אחת" reads as a yearly figure resting on nothing); more years, the yearly mean and how many
     */
    gapYears: (n: number, year?: number) => (n === 1 && year ? gapUnit(1, year) : `${gapUnit(n)} · ${n === 2 ? "שנתיים" : `${n} שנים`}`),
    gapNone: "אין שנה מלאה",
    gapNotCollected: "עוד לא נאסף",
    /** a fund the person typed: the site reads no report of it, so its gap is not something still to collect (D105) */
    gapTyped: "לא נבדק",
    /** F-92 (d): years not compared: an index of unstated kind, or a gross one beside a net one or off TA-35, TA-90 and TA-125 or on a fund that is not exempt */
    gapUnstated: "לא מושווה",
    /** the column's head and the gap sheet's title: the kind of index every compared gap on the list is measured against */
    gapHead: { net: "מול מדד נטו", gross: "מול מדד ברוטו" } as Record<"net" | "gross", string>,
    /** the input in the gap's sheet that opens the document saying what the index is */
    gapInputKind: "סוג המדד",
    gapKindWord: { net: "נטו", gross: "ברוטו" } as Record<"net" | "gross", string>,
    gapPage: (n: number) => `עמוד ${n}`,
    currencyIn: { ILS: "בשקלים", NIS: "בשקלים", USD: "בדולרים", EUR: "באירו" } as Record<string, string>,
    currencyInOther: "במטבע של הקרן",
    /**
     * the first lines of the gap's sheet: what the kind of index means, then where the years come from and in what currency.
     * A gross index is compared only on TA-35, TA-90 and TA-125, where every fund faces the same before-tax index and the fund is an exempt
     * Israeli fund (F-92 (d)); why a fund beats a net index
     * is a tax question the page does not answer.
     */
    /** `positiveOnly`: the report prints only the variable fees the fund paid its manager, not what the manager paid it (Mor's footnote), and A-07 is floored at 0, the only case where it can lower the cost. */
    gapLead: (kind: "net" | "gross", currency: string, israeli: boolean, years = 2, positiveOnly = false) =>
      // the mean's clause only where there is a mean: a one-year sheet ("ב־2025") read "the mean includes years ..."
      `${kind === "net" ? "מדד נטו סופר את הדיבידנדים של החברות אחרי המס על דיבידנדים שמנוכה מהם במדינה של החברה." : "מדד ברוטו סופר את הדיבידנדים של החברות לפני המס על דיבידנדים."} ${israeli ? `התשואות ${currency}, מהדוחות השנתיים של הקרן.` : `התשואות ${currency}, ממסמכים של מנהל הקרן.`} תשואת הקרן היא אחרי כל העלויות שלה${years > 1 ? ", והממוצע כולל גם שנים שבהן הקרן הקדימה את המדד" : ""}. בחישוב העלות בשקלים, פיגור מעבר לדמי הניהול נוסף לעלות, והקדמה על המדד לא נספרת כרווח.${positiveOnly ? " בדוח של הקרן מופיעים רק דמי הניהול המשתנים שהיא שילמה למנהל, לא מה שהמנהל שילם לה כשפיגרה אחרי המדד. לכן העלות שלה בפועל יכולה להיות נמוכה מזו שהאתר חישב." : ""}`,
    gapInputFund: (year: number) => `תשואת הקרן ב־${year}`,
    /** the benchmark by the name the fund's document prints */
    gapInputBenchmark: (name: string, year: number) => `תשואת \u2066${name}\u2069 ב־${year}`,
    /** the priced variable fee's sheet title: what the site prices in place of the listed rate */
    variablePricedAbout: (years: number[]) =>
      years.length === 1 ? `דמי הניהול המשתנים שנגבו ב־${years[0]}, שלפיהם האתר מחשב` : `ממוצע דמי הניהול המשתנים שנגבו בשנים ${Math.min(...years)} עד ${Math.max(...years)}, שלפיו האתר מחשב`,
    /** on the fund card, after the listed variable rate where the site prices another (0.3% shown, −0.215% priced) */
    variableChargedWord: (years: number[]) => (years.length === 1 ? `שנגבו בפועל ב־${years[0]}` : `שנגבו בפועל בממוצע בשנים ${Math.min(...years)} עד ${Math.max(...years)}`),
    crossWhy: (lo: string, hi: string) => `לפי הדולר, מירידה של ${lo} בשנה ועד עלייה של ${hi}`,
    /** The dollar's yearly change a run is at (A-03, P-02's bound), among the inputs of what a pair leaves (F-94). */
    dollarChangeInput: "השינוי של הדולר מול השקל בכל שנה",
  },

  /**
   * The stairs, the last section of the page (drawing A of 8dd1f013:research/specs/2026-11-01-indices-general/stairs.html, wording as
   * written there): from one account and one fund, which single change leaves more at the end, and by how much.
   */
  stairs: {
    title: "מה משפר את הבחירה, ובכמה",
    /** The chart's title says what its steps add up to (charts.md: a finding, not the topic). */
    panelTitle: {
      lead: (steps: number) => (steps === 1 ? "צעד אחד משאיר" : `${steps} צעדים משאירים`),
      more: "עוד",
      less: "פחות",
      tail: "בסוף",
      none: "אין בחירה שמשאירה יותר מנקודת ההתחלה",
      about: "מה שהצעדים מוסיפים למה שנשאר בסוף",
    },
    axisNote: "הגובה הוא מה שנשאר בסוף, אחרי דמי הניהול, העמלות והמס, בכסף של היום. לחיצה על מדרגה לוקחת אותה, או חוזרת אליה אם כבר נלקחה.",
    reset: "לחזור להתחלה",
    chartLabel: "מדרגות",
    now: "עכשיו",
    /** Over the start before any pick: the page's example, not where the person is. */
    nowExample: "לדוגמה",
    ceiling: "הכי הרבה בכל התעריפונים",
    ceilingLine: "הכי הרבה בכל התעריפונים:",
    /** The result column's words where the steps end below the most any priced pair leaves. */
    resultEnd: "בסוף",
    /** The table's head over the result column. */
    result: (steps: number) => (steps === 0 ? "בסוף" : steps === 1 ? "אחרי הצעד" : `אחרי ${["", "", "שני", "שלושת", "ארבעת", "חמשת"][steps] ?? steps} הצעדים`),
    lockLabel: "שאלת מס פתוחה",
    startPoint: "נקודת ההתחלה",
    lanes: {
      account: { word: "חשבון אחר", title: "חשבון אחר, אותה קרן", head: "החשבון" },
      kind: { word: "סוג קרן אחר", title: "סוג קרן אחר, אותו חשבון", head: "סוג הקרן" },
      fund: { word: "קרן אחרת", title: "קרן אחרת מאותו סוג, אותו חשבון", head: "הקרן" },
    },
    kinds: { "il-tracking": "קרן מחקה ישראלית", "il-etf": "קרן סל ישראלית", "tase-foreign": "קרן חוץ בבורסה בתל אביב", abroad: "קרן שנקנית בחו״ל" } as Record<string, string>,
    why: { u: "לא נמכרת שם", n: "אין מחיר", d: "יש ספק אם נמכרת שם" },
    /** the account lane's grey lines name the fund they are about ("יש ספק אם נמכרת שם: וואן זירו" read as the list's own pick) */
    whyFund: {
      u: (fund: string) => `\u2068${fund}\u2069 לא נמכרת שם`,
      n: (fund: string) => `אין מחיר לקרן \u2068${fund}\u2069`,
      d: (fund: string) => `יש ספק אם \u2068${fund}\u2069 נמכרת שם`,
    },
    noOtherFund: "אין קרן אחרת מהסוג הזה.",
    /** `notSplit`: a step whose cost could not be split by who takes it says so, in place of a figure (no 0 that reads as a cost of nothing). */
    // the account's fees, and apart from them what the cash waiting for a whole unit did (F-91, F-109), as the receipt writes them
    table: { step: "הצעד", fund: "הקרן", account: "החשבון", accountCost: "עמלות החשבון", waiting: "כסף שחיכה ליחידה שלמה", fundCost: "עלות הקרן", tax: "מס", left: "נשאר בסוף", notSplit: "לא חושב" },
    stepStart: "נקודת ההתחלה:",
    here: "עכשיו:",
    hereExample: "נקודת התחלה לדוגמה:",
    startExample: "עוד לא בחרתם קרן וחשבון, ולכן המדרגות מתחילות מקרן ומחשבון מאמצע הרשימות. בחרו ברשימות למעלה, והמדרגות יתחילו ממה שבחרתם.",
    startPicked: "המדרגות מתחילות מהקרן ומהחשבון שבחרתם ברשימות למעלה. בחירה אחרת שם מתחילה אותן מחדש.",
    hereLeft: "נשארים בסוף",
    rowsHint: "כל שורה משנה דבר אחד. לחיצה על שורה מוסיפה אותה למדרגות.",
    rowHead: { left: "נשאר בסוף", versus: "לעומת עכשיו", versusExample: "לעומת הדוגמה", less: "פחות", more: "יותר", money: "כסף" },
    more: "עוד",
    fewer: "פחות",
    same: "אותו סכום",
    statusTop: "אחרי המדרגות האלה אין בחירה אחרת שמשאירה יותר, בכל החשבונות שיש להם מחיר.",
    statusNone: "מכאן אין שינוי אחד שמשפר. עד הכי הרבה חסרים עוד",
    statusTogether: ", וכדי להגיע אליו צריך לשנות כמה דברים יחד.",
    jump: "לעבור אל",
    openNote: "עם שאלת מס פתוחה מופיע גם",
    legendNext: "הצעד הכי גדול שנשאר, עוד לא נלקח",
    legendOpen: "נשען על שאלת מס פתוחה: מוצג, לא מדורג",
    about: { left: "מה שנשאר בסוף", versus: "ההפרש מההחזקה שבה עומדים", cost: "ההפרש בעלות", ceilingGap: "מה שחסר עד הכי הרבה" },
  },

  /** The section at the bottom of the page (F-95, F-93). */
  dollar: {
    title: "עם נטרול מט״ח או בלי: מה קרה בפועל",
    lead: "שתי הקרנות עוקבות אחרי אותו מדד. קרן בלי נטרול מט״ח זזה גם עם המדד וגם עם שער הדולר מול השקל. קרן עם נטרול מט״ח זזה כמעט רק עם המדד, אבל בכל שנה שיש עליה דוח היא השיגה פחות ממנו.",
    to: "עד",
    cancelsLabel: "מה הנטרול מבטל: שער הדולר",
    cancelsNote: (from: number, to: number) => `כך זז הדולר מול השקל בשנה אחת, ${from} עד ${to}.`,
    /** Templates: {lo} and {hi} are figures (each opens its sheet). */
    cancelsStretch: (h: number) => (h === 1 ? "בשנה אחת: {lo} עד {hi}." : `בממוצע של ${yearsSpan(h)} רצופות: {lo} עד {hi} בשנה.`),
    stretchAbout: (h: number) => (h === 1 ? "השינוי של הדולר מול השקל בשנה אחת" : `השינוי הממוצע לשנה של הדולר מול השקל, על פני ${yearsSpan(h)} רצופות`),
    cancelsNoStretch: (h: number) => (h === 1 ? "עוד אין נתונים לשנה אחת." : `עוד אין נתונים ל${h === 2 ? "" : "־"}${yearsSpan(h)} רצופות.`),
    costsLabel: "מה הנטרול עולה: פער מהמדד",
    pointsAYear: "נקודות בשנה",
    /** A template: {fee} is the fund's listed fees together, a figure. */
    costsOne: (name: string, from: number, to: number) => `בכמה \u2068${name}\u2069 השיגה פחות מהמדד שלה, ${from === to ? `ב־${to}` : `${from} עד ${to}`}, כולל דמי ניהול של {fee}.`,
    feesAbout: "דמי הניהול ושכר הנאמן של הקרן, יחד",
    shortfallAbout: "בכמה נקודות אחוז בשנה הקרן עם הנטרול השיגה פחות מהמדד שלה",
    unhedgedGapAbout: "בכמה נקודות אחוז בשנה קרן בלי נטרול השיגה יותר מהמדד שלה (מינוס: פחות)",
    costsMany: (n: number, from: number, to: number) => `בכמה פחות מהמדד שלהן השיגו ${n === 2 ? "שתי" : n} הקרנות עם הנטרול, ${from === to ? `ב־${to}` : `${from} עד ${to}`}, כולל דמי הניהול.`,
    costsUnhedged: "קרנות בלי נטרול נשארו קרובות למדד שלהן: {lo} עד {hi} נקודות.",
    notCancelsLabel: "מה הנטרול לא מבטל: ירידה של השוק",
    inYear: (y: number) => `ב־${y}`,
    /** Templates: {index}, {dollar}, {a} and {b} are figures; {hedged} is one of the four phrases below, themselves templates of figures. */
    fell: (y: number) => `ב־${y} המדד ירד {index} בדולרים, אבל הדולר עלה {dollar}. זה ריכך את הירידה: קרנות בלי נטרול ירדו רק {a} עד {b}, {hedged}.`,
    roseOpposite: (y: number) => `ב־${y} קרה ההפך: המדד עלה {index} בדולרים, אבל הדולר ירד {dollar}. זה לקח את רוב העלייה: קרנות בלי נטרול עלו רק {a} עד {b}, {hedged}.`,
    roseAlone: (y: number) => `ב־${y} המדד עלה {index} בדולרים, אבל הדולר ירד {dollar}. זה לקח את רוב העלייה: קרנות בלי נטרול עלו רק {a} עד {b}, {hedged}.`,
    oneFell: "והקרן עם הנטרול ירדה {x}",
    oneRose: "והקרן עם הנטרול עלתה {x}",
    manyFell: "והקרנות עם הנטרול ירדו {a} עד {b}",
    manyRose: "והקרנות עם הנטרול עלו {a} עד {b}",
    noFall: "בדוחות שנאספו על המדד הזה עוד אין שנה שבה המדד ירד.",
    noFallShort: "עוד אין שנת ירידה בדוחות",
    /** The charts' titles say what the bars show (charts.md: a finding, not the topic). */
    yearsTitle: (falls: number, n: number) => (falls === 0 ? `ב־${n} השנים האחרונות הדולר לא ירד מול השקל באף שנה` : `ב־${falls} מתוך ${n} שנים הדולר ירד מול השקל`),
    yearsLabel: "השינוי של הדולר מול השקל בכל שנה",
    yearsNote: "באחוזים. העמודות הבהירות: השנים שיש עליהן דוחות של הקרנות.",
    /** How many of the years the hedged fund (or the hedged funds' middle) did better than the unhedged funds' middle, as the bars show. */
    fundsTitle: (better: number, n: number, many: boolean, year: number) => {
      const who = many ? "הקרנות עם הנטרול" : "הקרן עם הנטרול";
      const more = many ? "השיגו יותר" : "השיגה יותר";
      const less = many ? "השיגו פחות" : "השיגה פחות";
      if (n === 1) return `ב־${year} ${who} ${better ? more : less} מקרנות בלי נטרול`;
      if (better === 0) return `בכל אחת מ־${n} השנים ${who} ${less} מקרנות בלי נטרול`;
      if (better === n) return `בכל אחת מ־${n} השנים ${who} ${more} מקרנות בלי נטרול`;
      return `${who} ${more} מקרנות בלי נטרול ${better === 1 ? "בשנה אחת" : `ב־${better}`} מתוך ${n} השנים`;
    },
    fundsLabel: "התשואה של שני סוגי הקרנות בכל שנה",
    fundsNote: "באחוזים, אחרי כל ההוצאות של הקרן, לפני מס.",
    legendUnhedged: "בלי נטרול מט״ח: אמצע הטווח של כל הקרנות עם דוח לאותה שנה",
    legendHedgedOne: (name: string) => `עם נטרול מט״ח: ${name}, היחידה עם דוח על המדד הזה`,
    legendHedgedMany: (n: number) => `עם נטרול מט״ח: אמצע הטווח של ${n} הקרנות עם דוח על המדד הזה`,
    colYear: "שנה",
    colDollar: "הדולר מול השקל",
    colIndex: "המדד בדולרים",
    colUnhedged: "קרנות בלי נטרול",
    colHedged: "קרן עם נטרול",
    colGap: "עם נטרול מול בלי נטרול, בנקודות אחוז",
    together: (n: number) => `${n} השנים יחד`,
    togetherFunds: (count: number, n: number) => `${count} הקרנות שיש להן ${n} שנים`,
    inputFund: (name: string, year: number) => `${name}, ${year}`,
    /** The index's return in a year as one fund's report prints it, beside that fund's own return: a gap is the one less the other (F-95). */
    inputFundIndex: (name: string, year: number) => `המדד בדוח של ${name}, ${year}`,
    /** A year's change of the dollar against the shekel (F-93), among the inputs of the years together (F-95). */
    inputDollar: (year: number) => `הדולר מול השקל, ${year}`,
    /** Shekels per dollar at a month end (F-84), an input of a change of the dollar (F-93); `month` is said as "דצמבר 2024". */
    inputRate: (month: string) => `שקלים לדולר בסוף ${month}`,
    /** A year's return of the index in dollars, among the inputs of the years together (F-95). */
    inputIndex: (year: number) => `המדד בדולרים, ${year}`,
    planLead: "בתוכנית שלכם:",
    /** "בסוף השנה", "בסוף השנתיים", "בסוף 10 השנים": never "1 השנים". */
    planPoint: (h: number) => `הפרש של נקודת אחוז אחת בכל שנה, בין שהוא בא מהדולר ובין שהוא בא מהפער, שווה בסוף ${countPhrase(h, { one: "השנה", two: "השנתיים", many: "{n} השנים" })}`,
    planReal: ", בכסף של היום ואחרי מס.",
    planSteady: "אם שער הדולר לא ישתנה והפער יישאר כמו בדוחות",
    pairName: (fund: string, house: string) => `${fund} ב${house}`,
    kindNoHedge: "(בלי נטרול)",
    kindHedge: "(עם נטרול)",
    leaves: "תשאיר",
    /** "יותר מהראל…", "יותר מ־MTF…": the prefix joined to a Hebrew name, with a maqaf before a Latin one (copy.md 10.4). */
    moreThan: (name: string) => `יותר ${fromPrefix(name)}`,
    pointAbout: "מה שווה נקודת אחוז בשנה",
    moreAbout: "כמה יותר נשאר אם הדולר לא זז",
    small: (years: number, funds: number) => `זה בסיס קטן: ${years === 1 ? "שנה אחת" : `${years} שנים`}, ${funds === 1 ? "וקרן אחת" : `ו־${funds} קרנות`} עם נטרול על המדד הזה. זה מה שקרה, לא מה שיקרה.`,
    taxLead: "גם רווח שבא מהדולר ממוסה: כל עוד יש רווח ריאלי,",
    taxTail: "מכל הפרש בין הקרנות הולך למס.",
    taxAbout: "החלק מהפרש בין הקרנות שהולך למס",
    /** The four figures the tax's share is worked out from: the unhedged pair with the dollar a point down and a point up (F-95). */
    taxInputs: { leftDown: "נשאר בסוף, אם הדולר יורד נקודה בשנה", leftUp: "נשאר בסוף, אם הדולר עולה נקודה בשנה", taxDown: "המס, אם הדולר יורד נקודה בשנה", taxUp: "המס, אם הדולר עולה נקודה בשנה" },
    noSource: "למה הקרן עם הנטרול משיגה פחות מהמדד, ומה יקבע את זה בעתיד: עוד אין לאתר מקור.",
    sources: "מקורות: הדוחות השנתיים של הקרנות, ושערי המטבע של",
    /** The panel's headline, then the rest of the bottom line under it. */
    bottomHead: "הנטרול לא מגן מירידה של השוק",
    bottomLine: "הוא מחליף את התנודה של הדולר, שיכולה לעזור או להזיק בכל שנה, בפער מהמדד שחזר בכל שנה בדוחות. לפי הנוסחה של רשות ניירות ערך, הפער תלוי בפער הריביות בין השקל לדולר. הוא תלוי גם באופן שבו המדד והדולר זזים יחד. לכן גודלו משתנה משנה לשנה, והדוחות לא אומרים אותו מראש. אם הדולר ייחלש לאורך השנים בקצב גדול מהפער, הקרן עם הנטרול תשאיר יותר; אחרת, הקרן בלי נטרול.",
  },

  reasons: {
    fundType: "הקרן הזו עוד לא מחושבת באתר (סוג או מס שאין להם חישוב).",
    needYield: "הקרן מחלקת, וצריך את תשואת החלוקה שלה כדי לחשב.",
    usFundOpen: "אין מחיר לקרן הזו: תשואת החלוקה שלה לא נאספה, כי לא נמצא נוסח רשמי שאומר איך ממסים בישראל את החלוקה של הקרן.",
    needRate: (ccy: string) => `אין שער ל${ccy} בשערי הייחוס.`,
    noBroker: "אין חשבון ניירות ערך שאפשר לחשב לו את הקרן הזו.",
    noHedgeRecord: "אי אפשר לחשב: בדוח השנתי של הקרן עוד אין שנה מלאה, ובקרן מנוטרלת רוב העלות היא הפער מהמדד.",
    noHedgeEntered: "אי אפשר לחשב: בקרן מנוטרלת רוב העלות היא הפער מהמדד, והאתר לא יודע אותו לקרן שהזנתם.",
    payoutUnknown: "אי אפשר לחשב: לא צוין אם הקרן צוברת או מחלקת, והמס תלוי בזה.",
    /** A fund the person typed with a fee left empty (D56). */
    feeUnknown: "אי אפשר לחשב: חלק מדמי הניהול של הקרן לא הוזנו. השלימו אותם בעריכה.",
    domicileUnknown: "אי אפשר לחשב: הקרן מחלקת, והמס שמנוכה בחו״ל מכל חלוקה תלוי במדינה שבה היא רשומה. האתר יודע אותו לאירלנד ולארצות הברית בלבד.",
    /** A fund whose tax rests on an open rule (F-04, G-35), where no figure before tax is shown for it (an account that does not price it, a
     *  kind with no fund record, a fund that pays out, the preview of a fund being typed): by the rule, said plainly; nothing is ranked. Where
     *  F-118 prices it, a typed accumulating fund with its fees among them, `beforeTax` says it. */
    ruleOpen: {
      "TXF-04": "אי אפשר לחשב את מס רווחי הון: לא ידוע אם המס על רווח בקרן חוץ שנסחרת בתל אביב מחושב לפי שער המטבע או לפי מדד המחירים לצרכן. זו שאלה פתוחה, ולכן הקרן לא מדורגת.",
      // F-119 at a falling CPI (TXG OQ17), its readings giving the run different results (method §13)
      "TXG-09": "אי אפשר לחשב את המס במכירה אחרי 2027 כשהאינפלציה שלילית: החוק מעדכן את מדרגות המס ואת הסף של המס הנוסף לפי עליית המדד, ולא אומר מה קורה כשהמדד יורד. כאן כל אחת מהאפשרויות נותנת מס אחר, ולכן אין כאן חישוב ודירוג.",
    } as Record<string, string>,
    ruleOpenOther: "אי אפשר לחשב: המס על הקרן תלוי בכלל שעוד לא ידוע, ולכן הקרן לא מדורגת.",
  },

  /** The word for an option inside a sentence ("ב…"). */
  optionIn: { "il-tracking": "קרן מחקה ישראלית", "il-etf": "קרן סל ישראלית", "tase-foreign": "קרן חוץ בבורסה בתל אביב", abroad: "דרך בחו״ל" } as Record<string, string>,

  /** The currency of an index the person added, which the site does not know, where a label names "שער ה…". */
  indexCurrency: "מטבע של המדד",
  currencies: { USD: "דולר", EUR: "אירו", GBP: "פאונד", JPY: "ין", CHF: "פרנק שוויצרי", CAD: "דולר קנדי", AUD: "דולר אוסטרלי", CNY: "יואן", HKD: "דולר הונג קונג", NIS: "שקל", ILS: "שקל" } as Record<string, string>,

  labelFamilies: { held: "איפה הקרן מוחזקת", trade: "איך היא נסחרת", follow: "איך היא עוקבת אחרי המדד", currency: "מטבע", payout: "חלוקה", tax: "מס", asks: "מה היא דורשת מכם, וסיכון", availability: "זמינות" },
  labelsSheet: { rules: "מקורות", doc: "מסמך הקרן", close: "סגירה", forPlan: "" },
  labels: {
    "held-il": { text: "קרן ישראלית", explain: "הקרן רשומה בישראל ומפוקחת כאן. על מדד זר היא מקבלת את החשיפה בעסקאות, ועל מדד ישראלי היא מחזיקה את המניות." },
    "held-tase-foreign": { text: "קרן חוץ בת״א", explain: "קרן מחוץ לישראל שנסחרת גם בבורסה בתל אביב, בשקלים. קרן חוץ לא מתמחה בישראל, ולכן היא רק על מדדים זרים." },
    "held-abroad": { text: "נקנית בחו״ל", explain: "הקרן נקנית בבורסה בחו״ל, דרך בנק או בית השקעות שמוכרים ניירות ערך זרים. רשות ניירות ערך לא מפקחת עליה." },
    "trade-etf": { text: "קרן סל", explain: "קרן סל נסחרת בבורסה כל יום המסחר, במחיר שמשתנה במהלך היום." },
    "trade-tracking": { text: "קרן מחקה", explain: "קרן מחקה נקנית ונפדית במחיר היחידה אחת ביום, דרך הבנק או בית ההשקעות, לא בבורסה." },
    "follow-physical": { text: "מחזיקה את המניות", explain: "הקרן קונה את המניות שבמדד עצמן. כך עוקבות בדרך כלל קרנות על מדדים מקומיים." },
    "follow-swap": { text: "עסקת החלף", explain: "הקרן מקבלת את תשואת המדד מבנק בעסקת החלף. כך עוקבות בדרך כלל קרנות ישראליות על מדדים זרים, ויש בכך סיכון לבנק שמול הקרן." },
    "follow-futures": { text: "חוזים עתידיים", explain: "הקרן יוצרת את החשיפה למדד בחוזים עתידיים הנסחרים בבורסה." },
    "follow-mixed": { text: "כמה דרכים יחד", explain: "הקרן משלבת כמה דרכים לעקוב אחרי המדד, למשל עסקאות החלף וחוזים עתידיים, ולפעמים גם קרנות אחרות." },
    currency: { text: (ccy: string) => `חשיפה ל${ccy}`, explain: (ccy: string) => `ערך הקרן עולה ויורד גם עם שער ה${ccy} מול השקל, כי המדד מחושב בו.` },
    hedged: { text: "מנוטרלת מט״ח", explain: (ccy: string) => `הקרן מנטרלת את שער ה${ccy} מול השקל, ולכן שינוי בשער לא משנה את ערכה. הנטרול עולה כסף: הוא נראה בפער של הקרן מהמדד שלה, והחישוב באתר כולל אותו.` },
    "hedged-many": { text: (ccy: string) => `מנוטרלת ${ccy}`, explain: (ccy: string) => `הקרן מנטרלת את שער ה${ccy} מול השקל, ורק אותו. המדד מחושב ב${ccy} מתוך מניות בכמה מטבעות, ולכן המטבעות האחרים שבמדד עדיין משנים את ערכה, מול ה${ccy}. הנטרול עולה כסף: הוא נראה בפער של הקרן מהמדד שלה, והחישוב באתר כולל אותו.` },
    "currency-foreign": { text: "חשיפה למט״ח", explain: "את המדד הזה הוספתם, והאתר לא יודע באיזה מטבע הוא מחושב. ערך הקרן עולה ויורד גם עם שער המטבע הזה מול השקל. בדיקת השער באתר זהה לכל מטבע, ולכן היא לא תלויה בשאלה איזה מטבע זה." },
    "currency-many": { text: (ccy: string) => `חשיפה ל${ccy} ולמטבעות נוספים`, explain: (ccy: string) => `ערך הקרן עולה ויורד עם שער ה${ccy} מול השקל, ועם המטבעות האחרים שבמדד, כי המדד מחושב ב${ccy} מתוך מניות בכמה מטבעות.` },
    "tax-currency": { text: "מס גם על שינויי המטבע", explain: "בקרן ישראלית מס רווחי הון נמדד על הרווח הריאלי ביחידות השקליות, ולכן גם עליית המטבע שבתוך הרווח ממוסה." },
    "tax-fund-dividend": { text: "מס דיבידנד בתוך הקרן", explain: "קרן אירית משלמת מס אמריקני על דיבידנדים מחברות אמריקניות. המס הזה הוא עלות של הקרן ולא מזוכה בישראל." },
    "tax-distribution": { text: "מס על כל חלוקה", explain: "קרן שמחלקת משלמת לכם דיבידנד, וממנו משלמים מס בכל חלוקה, לפני המכירה." },
    "pays-accumulating": { text: "צוברת", explain: "הקרן לא מחלקת תשלומים: הכנסות כמו דיבידנד וריבית מושקעות בה מחדש." },
    "pays-distributing": { text: "מחלקת דיבידנד", explain: "הקרן מחלקת תשלומים לבעלי היחידות, פעם בשנה או יותר, לפי שיקול דעת המנהל." },
    "tax-on-sale-open": { text: "מס בצבירה: לא ידוע", explain: "לא ידוע אם משלמים מס על מה שהקרן צוברת לפני שמוכרים. לא נמצא חוק שמחייב מס כזה, אבל גם אין אישור רשמי שאין. האתר מחשב כאילו המס משולם רק במכירה, ולכן לא מדרג את הקרן." },
    "tax-on-sale-ruling": { text: "אין מס בצבירה", explain: "הקרן מדווחת בנספח לתשקיף הישראלי שלה שקיבלה החלטת מיסוי מרשות המסים: יחיד משלם מס רק כשהוא מוכר יחידות או כשהקרן מחלקת רווחים, ולא על מה שהקרן צוברת. ההחלטה עצמה לא פורסמה, ולכן המקור הוא מסמך הקרן. לפי ההחלטה הזאת הקרן מדורגת." },
    "ask-self-report": { text: "דיווח עצמי למס", explain: "ברוקר זר לא מנכה מס בישראל במכירה, ולכן מדווחים על הרווח ומשלמים מקדמה פעמיים בשנה, ומגישים דוח שנתי. בבנק או אצל חבר בורסה בישראל המס מנוכה במכירה, וגם קרן זרה לא מחייבת דיווח." },
    "ask-tax-service": { text: "ניכוי מס בשירות נוסף", explain: "החברה מציעה שירות שמנכה מס ישראלי בחשבון, למי שמצטרף אליו. מי שלא מצטרף מדווח על הרווח בעצמו, משלם מקדמה פעמיים בשנה ומגיש דוח שנתי." },
    "ask-estate": { text: "מס עיזבון אמריקאי", explain: "מי שלא אמריקאי ומחזיק נכסים אמריקניים מעל סף הנקוב בדולרים עלול להיות חייב בדוח מס עיזבון אמריקני. קרן שמאוגדת בארצות הברית היא נכס אמריקני." },
    "risk-unsupervised": { text: "לא בפיקוח רשות ני״ע", explain: "בית ההשקעות פועל בישראל בהיתר, ורשות ניירות ערך לא מפקחת עליו. חשבונות הלקוחות נפתחים אצל גוף זר." },
    "ask-w8": { text: "צריך טופס W-8BEN", explain: "לקרן אמריקנית צריך למסור לבנק או לבית ההשקעות טופס W-8BEN. בלי הטופס הניכוי האמריקני עלול להיות גבוה יותר." },
    unavailable: { text: "לא זמין בחשבון הזה", explain: "לפי מה שבית ההשקעות מפרסם, הוא לא מוכר את הסוג הזה ללקוחות פרטיים." },
  },
} as const;

/** What a house's documents hold that its price leaves out (D106): a line under the house's price, the sheet its words open, and the mark
 *  beside an account in the indices page's list. */
export const leftOut = {
  lead: "לא נכלל במחיר:",
  /** The line's tappable words: what can change what some customers pay, or, where the record marks nothing so, how many things it leaves out. */
  canChange: (n: number) => (n === 1 ? "דבר אחד שיכול לשנות אותו" : `${n} דברים שיכולים לשנות אותו`),
  some: (n: number) => (n === 1 ? "דבר אחד מהמסמכים" : `${n} דברים מהמסמכים`),
  title: (house: string) => `מה לא נכלל במחיר ${inName(house)}`,
  sheetLead: "המחיר בעמוד מחושב לפי התעריפון. אלה דברים שבמסמכים ולא נכנסו לחישוב, והם יכולים לשנות את מה שחלק מהלקוחות משלמים.",
  sheetLeadOther: "המחיר בעמוד מחושב לפי התעריפון. אלה דברים שבמסמכים ולא נכנסו לחישוב.",
  /** The second heading: what the record leaves out with no reason for the reader yet, or that changes no reader's price. */
  other: "עוד דברים שבמסמכים ולא בחישוב",
  /** The document's name with the page the thing is on. */
  page: (title: string, n: number) => `${title}, עמוד ${n}`,
  /** The mark beside an account's name: what a screen reader says, and the line under the list that says what it is. */
  mark: "יש דברים שלא נכללו במחיר",
  markKey: "סמל המסמך ליד שם של חשבון: יש במסמכים שלו דברים שלא נכללו במחיר, והם יכולים לשנות אותו. לחיצה על הסמל מראה מה.",
};

/**
 * The words of a fee's cases and parts (kit ConditionBand, PartChip, SlimFee, Toolbox, AskValues, the value menus, ReadForBand), the same
 * on every page that uses them. What a page says of its own fees and cases (a question, a count, the name of a case) comes in from the page.
 */
export const dealCases = {
  /** The head of a fee's band, before the things its price changes by. */
  changesBy: "המחיר משתנה לפי",
  /** The tag of the open case and of an open fee; the outline says it too. */
  chosen: "נבחר",
  /** The tag beside the person's own track. */
  mine: "שלכם",
  copyCase: "להעתיק את המקרה",
  removeCase: "להסיר את המקרה",
  /** The bin of a part in an open case, spoken where the page gives no name of its own. */
  removePart: "להסיר את החלק",
  toolbox: {
    /** Before the open case's condition in words: "להוסיף למקרה: בחו״ל, בארה״ב · מסלול 1". */
    target: "להוסיף למקרה:",
    hint: "מקישים על חלק כדי להוסיף אותו.",
    /** The hint where a part can also be dragged (a computer's fine pointer). */
    hintDrag: "מקישים על חלק, או גוררים אותו אל העמלה, כדי להוסיף אותו.",
    /** Said, not shown, of a part the case already has: its ✓ shows it. */
    used: "כבר במקרה",
    /** The phone's row of groups, spoken. */
    groups: "סוגי החלקים",
    /** The phone sheet's handle, spoken: it folds the sheet to its row of groups, and opens it again. */
    fold: "לקפל את החלקים",
    unfold: "לפתוח את החלקים",
    /** The phone sheet's ✕, spoken: it closes the open fee, and the sheet with it. */
    close: "סגירת העמלה",
  },
  ask: { add: "להוסיף", cancel: "ביטול" },
  menus: {
    /** The last row of a list of values: a value of the person's own. */
    other: "משהו אחר, בשם משלכם",
    trackName: "שם המסלול, כמו שהוא כתוב אצלכם",
    myTrack: "זה המסלול שלי",
    /** A range's side, spoken: up to its top, or over the top of the case before it. */
    side: "עד או מעל",
    upTo: "עד",
    over: "מעל",
    /** Before the case before it: "המקרה שלפניו: עד 100 $". */
    before: "המקרה שלפניו:",
  },
  read: {
    /** The reading's first row, before the picks. */
    lead: "קוראים את העסקה בשביל",
  },
};

/** The kit's own words (components/kit): names that assistive technology reads, and the gallery at /kit (a page for builders, not in the menu or the search). */
export const kit = {
  legend: "מקרא",
  /** A figure or a month typed in place (kit FigureField, MonthField). */
  figure: {
    /** In the note a press on a sourced figure's box opens: the link that opens the figure's source. */
    toSource: "למקור",
    /** What an empty month's box says, beside its calendar mark: a press opens the months to choose from, and typing works too. */
    monthPlaceholder: "בחרו חודש",
    monthError: "כתבו חודש ושנה, כמו 03.2027.",
    /** The month picker's year control, for a screen reader and a pointer's hover (the arrows say it to the eye). */
    yearBack: "לשנה הקודמת",
    yearOn: "לשנה הבאה",
  },
  /** Said with a step's check (kit Step), so a done step is not told by its colour alone. */
  stepDone: "הושלם",
  /**
   * A price list's date line (kit TariffDate): what the document prints, never only that something is missing (copy.md 3,
   * "Say what the source gives"). `checked` follows a line whose document prints no usable date, where the page shows no other day: the day the site collected the
   * record, in the same word as the company card's "נאסף ב־" ("נבדק" and "נאסף" for one date read as two promises).
   */
  tariffDate: {
    published: "תעריפון מ־",
    /** `{part} מ־{date}`: a price list that dates each part, the part the site reads */
    part: "{part} מ־",
    /** the part's printed date is no real date: the print as it stands, then the editor's mark that the oddity is the source's */
    misprinted: { before: "{part} מ־", after: " (כך במקור)" },
    version: "תעריפון גרסת ",
    none: "בלי תאריך מודפס",
    checked: "נאסף ב־",
    /** under a heading that already names the price list ("תעריפון {provider}"), the word is not said again */
    titled: { published: "מתאריך ", version: "גרסת " },
    /** the number sheet's line for the printed date: the whole document's, or a part's */
    aboutWhole: "תאריך הפרסום של התעריפון",
    aboutPart: "התאריך המודפס ב{part} של התעריפון",
  },
  /** The chevron of a list's group heading, which folds the group's rows. */
  groupFold: "הצגה או הסתרה של השורות בקבוצה",
  /** The head, for a screen reader, of a list's column of fold buttons (each opens more about its row). */
  rowDetail: "פרטים",
  chart: {
    hint: "לחיצה על הגרף נועלת שנה, וגרירה עליו מקרבת לטווח שנים.",
    hintShort: "לחיצה על הגרף נועלת שנה.",
    showing: "מוצג:",
    yearWord: "שנה",
    to: "עד",
    allYears: "כל השנים",
    shareOf: (pct: number) => `\u2066${pct}%\u2069 מהפס`,
    /** The last line of a cost bar's box, after every part's amount. */
    total: "סך הכול",
  },
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
      changed: "אחרי שינוי",
      sourced: "ממקור",
      computed: "מחושב",
      stale: "לא עודכן",
      error: "שגיאה",
      disabled: "לא זמין",
      open: "פתוח",
      closed: "סגור",
      nested: "פנימי בתוך פתוח",
      long: "ארוך",
      interactive: "אפשר לנסות",
      draggable: "אפשר לגרור",
      withIcon: "עם אייקון",
      wide: "על כל הרוחב",
    },
    uses: {
      FilterChip: "מסנן שדולק או כבוי בלי קשר למסננים האחרים, עם מספר השורות שיוצגו כשהוא דולק. למספר יש מקום קבוע, ומסנן שלא יציג כלום מתעמעם ונשאר במקומו. בחירה של ערך אחד מכמה, שמבטלים זה את זה, היא ChoiceChips עם counts.",
      AskField: "השדה הגדול שהעמוד נפתח בו: נכנס בו משפט שלם, ו־× מרוקן אותו.",
      SearchField: "תיבה לחיפוש או לסינון במילים, עם סמל החיפוש: מסנן של רשימה, או שדה שפותח את החיפוש של האתר. התווית מעליה, או רק לקורא מסך כשהמילים שסביבה כבר אומרות מה מחפשים. בפנים היא כמו AskField.",
      AbroadNote: "איך מוצר כמו זה של העמוד עובד במדינות אחרות: שבב לכל מדינה, תמיד באותו סדר, והפתק נפתח על הדומה ביותר. בכל מדינה כותרת, משפט או שניים, שורת מקור עם קישור, ושלוש עובדות עם אותן כותרות בכל המדינות: אריחים ליד הטקסט במחשב, שורות מתחתיו בטלפון. מדינה שלא נמצא בה מוצר דומה נשארת כשבב מקווקו ואפור, ובחירה בו אומרת שלא נמצא ומתי נבדק. הגובה של הגרסה הארוכה נשמר, כך שבחירה לא מזיזה את מה שמתחת.",
      DidYouKnow: "״הידעת?״: עובדות קצרות מהחוקים והכללים, כל אחת עם המקור שלה והדרך לפירוט המלא. כל הכרטיסים באותו גובה.",
      RuleTitleRow: "שורה ברשימה של חוקים וכללים, כשהשורה היא החוק עצמו: הכותרת היא הקישור, והיא פותחת את הכרטיס. בלי מזהה: הוא נשאר בכרטיס. כל השורה כפתור אחד, 44 פיקסלים לפחות. גר ב־provenance.tsx, לא ב־kit.",
      RulesLine: "החוקים והכללים שמאחורי עובדה: שבב אחד עם המספר שלהם, השורה האחרונה בבלוק, ולעולם לא עמודה בטבלה. שבב שפותח רשימה של השמות המלאים, וכלל אחד נפתח ישר בכרטיס. בלי חוקים וכללים אין שבב. גר ב־provenance.tsx, לא ב־kit.",
      MixedName: "שם של קרן או חברה בתוך שורה בעברית. שם שיש בו עברית נפרש מימין לשמאל גם כשהוא מתחיל באותיות לטיניות; שם בלי עברית שומר על הכיוון שלו. שם בשורה משלו שעלולה להיחתך (NameLine) נחתך בסוף השם לפי סדר הקריאה, כך שתחילתו, שם המותג, תמיד נראית.",
      ClampedText: "טקסט ארוך בשורה של רשימה ששורותיה שומרות על הגובה: שתי השורות הראשונות, והשאר נפתח בלחיצה ונסגר בלחיצה. הקישור מופיע רק כשהטקסט נחתך.",
      AlsoChanged: "בחירה ששינתה גם משהו אחר: המשפט נאמר בשורה שנלחצה, ולידו הדרך חזרה למה שהיה לפני הלחיצה. הקישור בגודל מגע מלא ולא מגדיל את השורה.",
      StrengthLabel: "כמה חזק המקור של נתון או של כלל: מקור משני או לפי החברה בתווית זהירות, שאלה פתוחה עם מנעול. נתון שנשען על קריאה של האתר בטקסט רשמי מקבל ReadingTag, לעולם לא \"מקור משני\". תווית אחת לשלב או לשורה, רק כשיש ספק. גר ב־provenance.tsx, לא ב־kit.",
      IdRef: "שבב לכל מזהה שיש לאתר: חוק, נוסחה, פרמטר או שאלה פתוחה. השבב אומר מילים, לא את המזהה: חוק הוא ״חוקים וכללים · 1״ (או שמו, ברשימה של חוקים), נוסחה ופרמטר בשמם. המזהה נשאר בכרטיס שהשבב פותח. גר ב־provenance.tsx, לא ב־kit.",
      Button: "Button לפעולה, LinkButton למעבר לעמוד. כפתור primary אחד בכל מסך.",
      Tag: "תווית קצרה עם גוון: מצב, סוג, דגל. הגוון לא עובד לבד: מוסיפים מילה או אייקון.",
      Callout: "הערה בקופסה מתחת לתוצאה: caution (לא עודכן, מקור חלש), blocked (שאלה פתוחה), info, ו־upcoming (כללים שעומדים להשתנות: הצבעים של info עם לוח שנה, והתאריך בתגית ליד הכותרת; מספר בתוכה בלי סימן \"נכנס לתוקף\"). לכולן אותה צורה: מסגרת דקה וקצה של 4 פיקסלים בצד שבו הטקסט מתחיל, בצבע של הסוג; הרקע המלא מבדיל אזהרה מהערה.",
      EmptyState: "במקום התוצאה של בלוק, כשהמספרים של הקורא לא משאירים מה להראות: אייקון, כותרת של שורה אחת, הסבר של שורה אחת ופעולה אחת שמובילה למה שימלא את הבלוק. ההסבר אומר מה הבלוק צריך, ולא חוזר על מה שהשדות לידו מראים.",
      Card: "המשטח המורם היחיד. את הריפוד בוחרים ב־pad, את הפנים ב־className.",
      PageHead: "ראש העמוד: הכותרת, שורת הפתיחה מתחתיה, ומה שעומד מעליהן או לידן: לשוניות, הדרך חזרה, שדה. בכל עמוד אותו ריווח מלמעלה ואותם גדלים לכותרת ולשורת הפתיחה.",
      Section: "כותרת עם פתיחה ופעולה בקצה השורה, ואחריה הגוף. level: page, card או form, ו־kick לשם קטן בצבע ההדגשה מעל עמודה של כלי, שלחלקים שלה כותרות משלהם.",
      Disclosure: "כל מה שהקורא יכול לפתוח: טבלה, הערה ארוכה, קבוצה ברשימה. התווית והחץ עוקבים אחרי מצב הקופסה עצמה, גם בתוך קופסה פתוחה אחרת.",
      FoldGroup: "כותרת קבוצה עם הספירה שלה. list (ברירת המחדל): קבוצה בתוך רשימת כיסוי, כותרת ברמה 3 או 4. section: נושא של כרטיסים בעמוד (קבוצות החוקים והכללים, מה כתוב במסמכים של חברה), כותרת גדולה ושורה של 48 פיקסלים; open ו־onOpenChange כשהעמוד פותח קבוצה לפי הכתובת.",
      PhoneFold: "הבחירות של עמוד לפני רשימה, מקופלות בטלפון: שורה אחת אומרת מה נבחר ופותחת אותן, כדי שהרשימה תתחיל במסך הראשון. במחשב הן פתוחות תמיד, בלי השורה.",
      SegmentedControl: "שתיים עד ארבע תשובות קצרות, אחת תמיד נבחרת: לבחירה שמשנה איך אותו תוכן מוצג (כסף של היום או נומינלי, קיבוץ, סדר, גרף או טבלה), או לשאלה שהחישוב צריך (שכיר או עצמאי). התשובות קצרות מספיק כדי לעמוד זו ליד זו גם בטלפון. הבחירה נעשית לפי מה שהבחירה עושה, לא לפי מספר האפשרויות.",
      MenuPicker: "בחירה של פריט אחד מרשימה, בתוך שורת טקסט: כפתור שמראה את הנבחר וחץ, ומתחתיו הרשימה. הנבחר מסומן בווי ובכתב מודגש. פריט שהוספתם מקבל עיפרון ופח, והשורה האחרונה מוסיפה. החצים עוברים בין השורות, ו־Escape או הקשה מחוץ לרשימה סוגרים אותה.",
      ShareBar: "שלם מפורק לכמה חלקים, בפס אחד של אחוזים: החלקים זה ליד זה, 2 פיקסלים ביניהם, וכל אחד באורך החלק שלו. מעל הפס מקרא אחד, בסדר של הפס: לכל חלק הצבע, השם והאחוז שלו, תמיד באותו מקום. הסכומים עצמם כתובים ליד הפס.",
      Receipt: "קבלה: דף עם קצה תחתון קרוע, שורות של שם וסכום עם קו נקודות ביניהם, והחלקים של שורה מוזחים מתחתיה מאחורי קו בצבע שלה: עמלות של חשבון עם הסכום שלהן, עמלות של קרן עם השיעור שלהן. קו כפול לפני הסכום הסופי, וקו מקווקו לפני מה שנובע ממנו. כרטיס (ReceiptTicket): אותן שורות לרוחב עמודה רחבה, בשלושה חלקים: החשבון בצד אחד, הסכום שנשאר באמצע, הקרן בצד השני, ושורה מתחתיהם; חריצים עגולים במקום שבו קווי האמצע פוגשים את הקצוות. בטלפון, כשהקבלה למעלה מחוץ למסך, תלוש שלה עם קצה עליון קרוע נצמד לתחתית המסך: כמה נשאר, והקשה עליו מחזירה לקבלה.",
      FactTile: "אריח קטן של עובדות על דבר אחד: שורת כותרת עם קישור בסופה, שם, ושורות של שם וערך ב־13 פיקסלים. הקצה שלו בצבע של מה שהדבר גובה, כמו השורה שלו בקבלה. שני אריחים מחוברים ב־+ עגול על התפר.",
      ChipList: "רשימה שאפשר לבחור בה, להוסיף לה, לשנות שם ולמחוק: מטרות. הפריט הנבחר מקבל עיפרון ופח; גרירה רק כשיש onMove; הפריט האחרון (add) מוסיף.",
      KnobStrip: "מספרי התוכנית כמחוונים שנשארים על המסך, לעמוד שנועד לשחק בו: שני טורים במחשב, אחד בטלפון. מספר שלא עובר בדיקה מקבל את ההודעה שלו בקצה שורת השם, במקום כפתור האיפוס, כך שהשורה לא גדלה.",
      ChangeChart: "כל מספר בתוכנית משתנה באותו אחוז, קו לכל מספר על גרף אחד, משמאל (פחות) לימין (יותר). סמן שגוררים או בוחרים קורא את כל הקווים, והטבלה אומרת לכל מספר: לפני, אחרי, מה נשאר וההפרש.",
      PileBar: "הסיפור של הכסף לפי שנת המשיכה: עמודה לכל שנה עם מה שנשאר בידיים מעליה, השנה שנבחרה והשנה שמשווים אליה בצבע מלא, וחץ עם מה שמשתנה אם מחכים. מתחת, השנה שנבחרה כפס אחד משמאל: מה שהופקד והתשואה, ובקצה מה שדמי הניהול והמס לקחו, וסוגר מתחת למה שנשאר.",
      StairsChart: "מדרגות: מה שנשאר בסוף על הציר האנכי, סדר הצעדים משמאל לימין. הראשונה אפורה עם סימן שבר כי הציר לא מתחיל באפס; כל מדרגה צפה בגוון של מה ששונה, ואדומה כשהיא מפסידה. שנלקחה: מלאה; מוצעת: בהירה ומוקפת; על כלל פתוח: חלולה. מתחתיה טבלה באותן עמודות (מחשב) או רשימת צעדים (טלפון).",
      LeftOutLine: "מה שבמסמכים של בית ולא במחיר שלו: שורה מתחת למחיר, שהמילים שלה פותחות כל דבר שיכול לשנות את מה שחלק מהלקוחות משלמים, עם הסיבה והמסמך בעמוד שלו, ואחריהם השאר בשמם. הסימן ליד שם של חשבון ברשימה פותח את אותו גיליון, רק כשיש דבר כזה.",
      DiffRow: "שורה של שינוי אחד: מה משתנה, מה נשאר בסוף, וסרגל מקו האמצע: ימינה וירוק לעוד כסף, שמאלה ואדום לפחות. יחידה אחת לכל השורות; סרגל ארוך נחתך בסימן והמספר אומר את הגודל המלא. לחיצה על השורה לוקחת אותה.",
      PickCard: "כרטיס שכולו כפתור: לחיצה בכל מקום עליו בוחרת בו, בלי קישור ״בחרו״ בתוכו. מספרים וקישורים שבתוכו נשארים לחיצים בפני עצמם. הכרטיס שכבר נבחר אינו PickCard.",
      TileChoice: "תשובות לשאלה אחת, כל אחת אריח שמראה מה היא מביאה (התוויות שהיא מוסיפה, או שורה קצרה). אפשר שלא תהיה בחירה עדיין. מה שבתוך אריח לא לחיץ בפני עצמו.",
      ChoiceChips: "ערך אחד מכמה שמצמצם רשימה, עם counts: מספר השורות שכל ערך יציג, במקום קבוע, וגלולה שלא תציג כלום מתעמעמת במקומה. עם missing: גלולה מקווקוות ואפורה לבחירה שלא נמצא בה כלום, שאפשר עדיין לבחור, והתווית שלה אומרת את זה גם במילים. בלי counts: תשובה מוכנה לשאלה שהחישוב צריך, כשהתשובות רבות או ארוכות מדי לעמוד זו ליד זו בטלפון, ו״אחר״ לערך משלכם. עם wrap יורד שורה, בלעדיו גולל הצידה בטלפון, ועם line נשאר שורה אחת בכל רוחב. הגלולה הנבחרת ברוחב של האחרות, כך שבחירה לא מזיזה כלום. ״אחר״ הוא תמיד הגלולה המקווקוות עם הפלוס (other), שפותחת שדה מתחת לשורה.",
      ChoicePair: "בחירה בשתי רמות (סוג מוצר ואז מוצר; מוצר ואז במה הכסף מושקע): הרמה הראשונה שורת גלולות עם מספרים, והשנייה מגש בשורה אחת ובגובה קבוע שגולל הצידה, כך שבחירה בכל רמה לא מזיזה כלום מתחת. כל עוד הרמה הראשונה לא פותחת כלום, במגש יש רמז.",
      ChoiceTray: "מגש בשורה אחת ובגובה קבוע מתחת לשורת בחירה: כל עוד לא נבחר בה כלום יש בו רמז עמום, ואחר כך תווית ושורת בחירה משלו שגוללת הצידה. מה שמתחתיו לא זז.",
      LongestCase: "גוש שתוכנו משתנה לפי בחירה: תמיד בגובה המקרה הארוך ביותר, בכל רוחב מסך, כדי ששום דבר מתחתיו לא יזוז.",
      HoldTallest: "כמו LongestCase, כשהמקרים רבים מכדי להישאר בעמוד: הם נפרשים פעם אחת בלי שייראו, נמדדים ויורדים, והגוש נשאר בגובה הארוך שבהם עד שמשתנים המדד או רוחב המסך.",
      InputSlot: "מספר שהקוראים קובעים, בתוך משפט: מספר רגיל ברווח ברוחב קבוע, כדי שהמשפט לא יקפוץ כשהמספר משתנה. הוא לא נפתח: השדה שליד המשפט משנה אותו.",
      Sentence: "טקסט שיש בו מספרים או קישורים. רצוף בלבד: אין לו מאפיין פריסה, ולכן מספר לא יכול ליפול לשורה משלו. הקטעים כילדים, או מחרוזת עם מקומות {name}.",
      Stat: "מספר עם שמו מעליו והערה מתחתיו; שניים עד ארבעה זה לצד זה. tone מוסיף את הצבע של העמודה או הקו שהוא נקרא על שמם.",
      KeyValue: "KeyValue: שם בתחילת השורה וערכו בסופה, בתוך dl. KeyValueList: עובדות ככרטיסים (רשימה בטלפון, רשת 2 על 2 מ־lg); עם rows, כרטיס אחד של שורות בכל רוחב, לעובדות שהערך שלהן משפט.",
      DotLine: "שורה חלשה אחת של חלקים קצרים בין נקודות: על מה חישוב רץ. של מי המספרים (אזהרה נשארת בעין), המספרים, ופעולה בסוף.",
      SourceLine: "SourceLine: מאיפה בא ערך ההתחלה, מתחת לבקרים. GapNote: חלק שהאתר עוד לא חישב, עם הסיבה.",
      PrintedText: "PrintedText: הטקסט של מסמך, עם המספרים שלו משמאל לימין. DoubtNote: ספק לגבי נתון, ליד הנתון.",
      NumberField: "תיבה למספר אחד שמקלידים: יחידה, רמז, שגיאה. ערך שהוקלד נראה כמו ערך ההתחלה; אחרי שינוי, בקצה שורת השם מופיע ״חזרה ל־״ עם ערך ההתחלה, בלי להזיז דבר. נשמר אחרי הפסקה של 150 מילישניות או ביציאה מהתיבה.",
      FieldState: "איפוס לקבוצה של תיבות קטנות בלי שורת שם, בשורה משלו מתחתן, ו״טוען…״ בזמן שהשדות מחכים. שדה עם שורת שם מחזיק את האיפוס שלו שם.",
      RangeField: "מספר ומחוון שלו יחד: לכמות עם טווח טבעי. האיפוס בקצה שורת השם, ליד התיבה.",
      TextField: "שורת טקסט אחת שהאדם מקליד, כמו שם: תווית מעל, ושורת עזר או שגיאה מתחת. inline: התווית לצד התיבה, לשם שמקלידים במקום בתוך שורה של עובדות אחרות. למספר, NumberField.",
      CheckField: "סימון של כן או לא, ליד סימונים אחרים שלא שוללים זה את זה; כל השורה היא אזור ההקשה.",
      FieldGroup: "שדות ששייכים יחד תחת כותרת אחת, עם קו בין קבוצה לקבוצה.",
      SelectField: "בחירה של פריט אחד מרשימה של שמות, ב־select רגיל: תווית מעל, אפשרות \"לא נבחר\" ראשונה אם צריך, ושורת עזר מתחת. חשבון, ספק. עם wide הרשימה ממלאת את הרוחב, כמו שדה טקסט שלצידה.",
      PercentField: "שדה מספר לאחוז: שיעור שנתי אלא אם unit אומר אחרת, ומשפט הטווח הרגיל (0 עד 100, או הטווח שניתן).",
      Marker: "סמן שנגררים אותו על ציר של תרשים: לחיצה בכל מקום בשטח מזיזה אותו, וגם מקשי החצים. Marker הוא המחוון הבלתי נראה; MarkerMark הוא מה שהתרשים מצייר. LaneLabel הוא שם של פס על הנתיב: כשהסמן עומד עליו הוא זז לקצה השני של הפס או לצד הסמן.",
      StepTag: "תגית אפורה על סולם מסודר (1 עד 4), עם אייקון ומילה תמיד: כמה מהר הכסף חוזר, מ״בכל רגע״ עד ״בסוף השנה״. רק האייקון צבעוני, מטורקיז לאדום, כך שהתגית לא נקראת כדגל.",
      TableCols: "רוחב קבוע לכל עמודה בטבלה, במחשב ובטלפון, כדי שמספר שמשתנה לא יזיז עמודה. רוחב ב־rem לעמודה שהתוכן הארוך ביותר שלה ידוע, auto לעמודות שחולקות את השאר. עמודה שהטלפון משמיט מקבלת רוחב 0 בטלפון, והתאים שלה את PHONE_GONE, כך שהיא יוצאת מהטבלה כולה. כל טבלה באתר בנויה עליו.",
      CompareTable: "טבלה של כמה אפשרויות עם גרף קטן בתאים: עמודות עם כותרת אומרות מה משווים, ועמודה בתא (ValueBar) מאפשרת להשוות לפני שקוראים. בטלפון השם בשורה משלו והתאים מתחתיו. ValueBar: מספר ועמודה מתחתיו, באותו סולם בכל השורות; טווח הוא חלק מלא וחלק מפוספס.",
      ProseList: "נקודות בתוך טקסט של מדריך, בגודל הגוף, אחרי משפט שמוביל אליהן.",
      NoteList: "ההערות שמתחת לתרשים, נקודה לכל הערה: מה המספר לא כולל, מאיפה ריבית מגיעה. אף פעם לא משפט אחד ארוך.",
      GainBars: "שני סכומים כעמודות מאותה נקודת התחלה, וההפרש כסוגר עם מספר משלו (אף פעם לא עמודה שלישית).",
      ChartLegend: "שלושת החלקים סביב כל תרשים: מה כל סימן אומר, הערכים בשנה שמצביעים עליה, ואותם מספרים כטבלה.",
      CompanyLinks: "פתיח ואחריו החברות שהוא עוסק בהן, כל אחת קישור לעמוד שלה: ״תלוי בחברה״ כשכל חברה קובעת לעצמה, ״לכל מה שמצאנו אצל״ מתחת לתנאי של חברה. רצוף: יכול לסגור משפט או לעמוד בשורה משלו.",
      RowArrow: "החץ בסוף שורה שפותחת עמוד אחר באתר, בצבע של קישור. חץ שפותח חלון באותו עמוד שייך לכפתור שלו, לא לזה.",
      ProductTableGroups: "רשימה ארוכה של מוצרים שמתחלקת לקבוצות (חברה, סוג השקעה): כותרת מעל כל קבוצה עם שורה של מספרים, כותרות עמודה שממיינות את הטבלה (SortHead, ו־aria-sort בעמודה), כותרת קבוצה שלחיצה עליה מקפלת את שורות הקבוצה (foldable), וכותרת שנשארת מתחת לכותרת האתר בזמן הגלילה (stickyHead) כל עוד הטבלה נכנסת ברוחבה. במחשב ובטלפון נבנית רק הפריסה שהמסך מציג.",
      ProductPhoneFold: "מוצר ברשימה ארוכה בטלפון (מסלולים תחת חברה): שורה אחת עם השם ומספר אחד עם המילה שלו. הקשה על השורה פותחת במקום את כל השאר, והשורה גדלה בהדרגה, כך שמה שמתחתיה זז בעדינות ומה שמעליה לא זז. המספר שבשורה שומר על ההקשה שלו ופותח את המקור.",
      SortHead: "כותרת עמודה שממיינת את הטבלה בלחיצה: מודגשת עם ▲ או ▼ כשהיא פעילה, ⇅ חלש כשלא. לחיצה ראשונה נותנת את הסדר הטבעי של העמודה והשנייה הופכת אותו. החץ במקום קבוע ורוחב המודגש נשמר, ולכן לחיצה לא מזיזה דבר.",
      MarkHold: "סימן קטן לפני מילים או אחריהן (אזהרה, מנעול, חץ של קישור, סימן שאלה) נצמד למילה שלידו, כדי שלא יעמוד לבד בשורה.",
      SourcedTag: "תגית קצרה על חברה שמקור עומד מאחוריה, כמו ״בטלפון בלבד״ ליד בית השקעות שמוכר סוג קרן רק בטלפון. הקשה פותחת את המקור, כמו בכל מספר. התגית לא משנה אף מספר, ושטח המגע שלה בגובה 44 פיקסלים בלי להגדיל את השורה.",
      Formula: "נוסחה בכתב מתמטי, עם מקרא שאומר מה כל סימן בה: בכרטיס של נוסחה שמסמך שיטת החישוב כותב כך, במקום קישור למסמך.",
      HelpMark: "סימן שאלה ליד כותרת או תווית, שפותח בהקשה את כרטיס המונח ממילון המונחים, עם המקור, או הסבר קצר משלו: רק במקום שהוא מוסיף משהו שהכותרת לא אומרת.",
      TabCards: "שאלות בכרטיסים בשורה, ולוח אחד פתוח מתחתיהן: בכל כרטיס השאלה, התשובה בכמה מילים ושורה מתחתיה, והכרטיס כולו הוא הלשונית. התשובה מילים פשוטות, והמספר שבה נפתח מתוך הלוח. הכרטיס הפתוח במסגרת בצבע הפעולה, עם חץ קטן אל הלוח, ובמסך צר עם מילה שאומרת שהוא פתוח. החצים במקלדת עוברים בין הכרטיסים. כל לוח נפתח בשורה קטנה בצבע הפעולה ובמסקנה שלו (PanelHead).",
      OptionBars: "עמודות שמשוות בין אפשרויות: שורה לכל אפשרות, השם ושורה מתחתיו, עמודה מקו אפס אחד והסכום בקצה שלה. הסכומים על העמודות במקום ציר.",
      TabStrip: "לשוניות בתוך עמוד שמחליפות חלק אחד שלו לתצוגה משלה, עם תוכן מסוג אחר, בלי לעזוב אותו (בחיפוש בעמוד החוקים והכללים: מה כתוב בחוק, ומה כתבו החברות): כל לשונית היא כפתור עם מספר השורות שבה, והחצים במקלדת עוברים ביניהן. בחירה שרק מצמצמת רשימה אחת היא ChoiceChips עם counts.",
      InlineSelect: "בחירה שיושבת בשורה של פקדים אחרים (הסינון בסוף שורת הלשוניות בחיפוש): התווית והבחירה בתוך רשימה נפתחת אחת, בלי מסגרת של שדה. labelHidden: התווית רק לקורא מסך, כשהמילים שסביבה כבר אומרות מה בוחרים.",
      ListRow: "שורה קומפקטית ברשימה שכל פריט בה נפתח במלואו לידה או במסך משלו: כותרת, שורה עמומה שנשמטת בטלפון, תגיות, מקור ומזהה בסוף. כל השורה היא כפתור, והנבחרת מסומנת ברקע ובפס בתחילתה. שורות תחת שם משלהן, שלא בוחרים בו (בית השקעות מעל התוכניות שלו), מוזחות מתחתיו, ושורה עמומה שלהן נשארת גם בטלפון.",
      ChooseRow: "שורה שבוחרת משהו בעמוד (מסנן) ונגמרת בחץ שמוביל למקום אחר. כל השורה היא כפתור שנלחץ ושוב משחרר, והמספרים בשורה העמומה והחץ שומרים על הלחיצה שלהם. הנבחרת ברקע ובפס בתחילתה, ושורה מעומעמת נשארת במקומה.",
      SideNav: "רשימה בצד של עמוד שמראה חלק אחד בכל פעם (עמוד חברה: סקירה, ואז כל מוצר). כל פריט הוא קישור עם הכתובת שלו, כך שקישור וכפתור חזרה עובדים. הנבחר ברקע ובפס בתחילתו, כמו ListRow, והחלקים שלו נפתחים מתחתיו כקישורים בתוך העמוד. מ־1024 פיקסלים הרשימה ליד התוכן בכל רוחב ונשארת במקום כשגוללים; טבלה רחבה מהמקום שלידה נגללת הצידה בתוך הכרטיס שלה. מתחת ל־1024 פיקסלים הרשימה היא שורה אחת שאומרת מה מוצג ופותחת אותה.",
      GoLink: "קישור בתוך האתר שממשיך הלאה, בסוף חלק: המילים בצבע הקישור וחץ אחריהן, צמוד למילה האחרונה.",
      TextLink: "קישור לעמוד באתר, במראה אחד בכל האתר: בצבע הקישור, עם קו תחתון כשהעכבר עליו. inline בתוך טקסט רץ, בגודל הטקסט ובלי שטח מגע משלו. line בשורה משלו או בין פקדים, עם שטח מגע של 44 פיקסלים.",
      GoRow: "שורה שפותחת עמוד אחר, בעמודה צרה (הדרכים פנימה בעמוד הראשי): שם, שורה עמומה שאומרת על מה העמוד עונה, וחץ. כל השורה היא קישור, ומספר בשורה שומר על הלחיצה שלו.",
      OpenRow: "שורה שפותחת חלק אחר של העמוד או עמוד אחר (הסקירה של בנק): שם, כמה, עובדה אחת מתחת לתווית קטנה, תאריך וחץ, בעמודות. כל השורה היא קישור, והמספרים בה שומרים על הלחיצה שלהם.",
      SharedFacts: "מה שנכון לכל השורות בטבלה, פעם אחת מעליה במקום בכל שורה. עובדה שנכונה רק לחלק מהשורות נשארת בשורות שלה.",
      FigureLines: "מספרים קטנים זה מתחת לזה, כל אחד בשורה אחת עם תווית בתחילתה (הריביות של פיקדון לפי סכום, בשורה בטלפון). שורה שבחירה במקום אחר מניחה בצד מתעמעמת במקומה.",
      ProductTableBand: "כותרת מעל כמה עמודות סמוכות (״ריבית בשנה, לפי סכום ההפקדה״), כותרת אחת מעל שתי עמודות שכל אחת מהן אומרת מתחתיה רק את שלה (״תשואת עבר״ מעל ״3 שנים״ ו״5 שנים״), עמודה מעומעמת במקומה כשבחירה בעמוד מניחה אותה בצד, ופרטים של שורה שנפתחים מתחתיה בכפתור בסוף השורה, עם סימן למה שיש בהם (הערה של הבנק, ספק). טבלה רחבה מהכרטיס שלה נגללת הצידה בתוכו, והעמודה הראשונה נשארת במקומה.",
      PageTabs: "לשוניות בראש עמוד שהוא אחת מכמה תצוגות של אותו נושא (לפי חברה, לפי מוצר): כל לשונית היא עמוד משלה, ולכן קישור; הנוכחית מסומנת בקו תחתון וב־aria-current.",
      DepositWords: "המספרים של פיקדון במילים, אותו דבר בכל עמוד שמראה פיקדון: העוגן והמרווח של ריבית משתנה (\"פריים פחות 1.5\", AnchorSpread) והסכומים שהבנק מקבל (AmountRange). כל מספר עובר דרך רכיב המקור.",
      TrackCells: "מה שהתאים של מסלול מכילים, לכל רשימת מסלולים: שני ממוצעי דמי הניהול של הרשות (TrackFeeLines, FeeNum; תא ריק מסביר את עצמו כשלוחצים עליו), החשיפה למניות ולמט״ח, פס לכל אחת (ExposureCell) והתוויות שליד השם (TrackLabels). כל מספר עובר דרך רכיב המקור.",
      ProductTable: "רשימה של מוצרים מאותו סוג (מסלולים, קרנות): טבלה אחת במחשב ושורה לכל מוצר בטלפון, אף פעם לא ערימה של כרטיסים. הכותרת נושאת את המילים והתא את הערך; fit לעמודה ברוחב התוכן שלה (מספר, קישור, דמי ניהול), והשם מקבל את השאר. banner: שורת זהירות מעל שורות ששייכות יחד. ProductPhoneRow: שורה של מוצר בטלפון. ProductIdLink: המזהה הוא הקישור החוצה (מספר הקרן למאיה), עם אייקון קישור חיצוני. ProductFigures: מספרים, כל אחד עם המילה שלו, אחד מתחת לשני בתא ובשורה אחת בטלפון.",
      CostStack: "עלות אחת מפורקת לחלקיה, בפס אחד: כל חלק בגוון שלו, אורך הפס הוא הסכום על קנה מידה משותף. פסים להשוואה מציירים זה מעל זה. סכום שעובר את קנה המידה נחתך בקצה עם סימן שבירה. כשמספר משתנה, הרוחב של כל חלק והסכום שכתוב בו מחליקים לערך החדש, וחלק שיורד לאפס מצטמק עד שהוא נעלם בלי לעזוב את מקומו. הצבעה על חלק, או הקשה עליו בטלפון, מראה את שמו, הסכום, החלק מהפס ומאיפה בא המחיר שלו.",
      PeriodBars: "בחירה של תקופה אחת, מצוירת כתרשים עמודות: כל עמודה כולה כפתור אחד, ובה המספר, העמודה, שם התקופה ומי משלם. כל העמודות על סולם אחד מאפס, בלי קווי רשת ובלי ציר, כי כל עמודה נושאת את המספר שלה. הנבחרת במסגרת וברקע, השם שלה במילוי. עמודה בלי מספר כותבת ״אין״ ואפשר לבחור גם אותה. בטלפון השמות מתקצרים ושם הבנק יורד.",
      MeterBar: "פס דק של חלק מ־0 עד 100% ליד המספר שלו בשורת טבלה: החשיפה של מסלול למניות ולמט״ח, בצבע של כל אחת. כל הפסים ברשימה באותו אורך, כך שהעין עוברת לאורך העמודה. ריק ב־0, מלא מעל 100%. המספר נושא את המשמעות, והפס רק לעין.",
      FigureField: "מספר שמקלידים במקום שבו הוא עומד, כמו אחוז של עמלה בשורה שלה. התיבה במצב של המספר: מה שהאדם הקליד בדיו ובמסגרת כחולות, בלי רקע כחול, מה שמולא מתעריפון או ממסלול עם קו אפור, ולחיצה עליו פותחת מתחתיו הערה מאיפה הוא, עם קישור למקור. שדה רשות שלא מולא עם מסגרת מקווקוות.",
      MonthField: "חודש ושנה באותה תיבה של FigureField, עם סימן של לוח שנה. לחיצה על התיבה פותחת לידה את השנה ואת שנים־עשר החודשים שלה (MonthPicker), ובחירה בחודש שומרת אותו. אפשר גם להקליד, כמו 03.2027: נשמר כשיוצאים מהשדה או לוחצים Enter, ושדה רשות שמרוקנים נמחק. חודש שהעמוד לא מקבל מופיע מחוק ואי אפשר לבחור בו.",
      TypedPlain: "עוטף סיכום שעומד ליד התיבות שהמספרים הוקלדו בהן: מספר שהאדם הקליד נקרא בו כמילים רגילות, בלי הכחול ובלי לחיצה, כי התיבה לידו כבר מראה של מי הוא. מספר מחושב שומר על הקו המנוקד, ומספר ממקור על הקו האפור.",
      Step: "שלב בעמוד שבונים בו משהו לפי סדר: מספר בעיגול, או סימן וי כשהשלב הושלם, הכותרת, מה נבחר, והדרך לשנות בסוף השורה. קו דק בין השלבים.",
      StepStrip: "השלבים אחרי שנעשו, בשורה אחת מעל מה שנבנה בהם, כשכמעט לא חוזרים לשנות אותם: השם של כל שלב ומה נבחר, נקודה, והדרך לשנות. בסוף השורה הפעולה שלה, ומתחתיה מה ששלב פותח כדי לשנות אותו או מה שנאמר על הבחירה. כשאין מקום, השורה נשברת.",
      AmountChart: "מה משהו עולה בכל סכום: החלקים כשטחים זה על זה מאפס, הסכום משמאל לימין, השם של כל חלק בסוף הרצועה שלו, והסכומים שבהם העלות משנה התנהגות כנקודות על הקו העליון עם קו מקווקו עד הציר. מצביע או הקשה על הגרף קוראים כל חלק ואת הסכום שלהם. כשאין מקום לשמות בסוף, הם עוברים למקרא מעל הגרף.",
      AddLine: "שורה שקטה מתחת לרשימה שהאדם בונה: מסגרת מקווקוות, פלוס ושבב קטן לכל דבר שאפשר להוסיף. הרגילים קודם בדיו מלאה, הנדירים אחריהם בדיו מעומעמת. המקום היחיד בעמוד שמדבר על מה שחסר.",
      PeriodStrip: "שנות התוכנית ברצועה אחת, לכל תקופה גוון משלה ומה שמחזיק בה כתוב עליה: שנים במחיר של קבוצה, ואז שנים בתעריפון. הזמן רץ משמאל לימין והקצוות כתובים מתחת. רצועה לקריאה בלבד, לא כפתור.",
      Stretch: "שתי רשימות משני צדי סרגל של כסף: חשבון הוא קטע בסרגל, מהקרן היקרה בו עד הזולה, וקרן היא נקודה בקטע של החשבון שנבחר. השורה של החשבון שנבחר נפתחת אל הקטע שלו, פס על הסרגל, והפס נפתח אל רשימת הקרנות, עם קו ישר מהנקודה של כל קרן לשורה שלה. הזוג שנבחר הוא נקודה אחת בקטע, וקו ישר עולה ממנה אל מה שמעליה. הכול נמדד מהמקום של השורות, מחדש בכל שינוי. StretchBar: עותק קטן של הסרגל ליד שורה, באותו סולם לכל השורות, עם הקטע של השורה, ונקודה כשהשורה היא קרן. שורות הרשימות בסגנון line: שורה אחת, בלי עיגול בחירה, 32 פיקסלים זו מזו עם עכבר ולפחות 44 במגע ומתחת ל־1280 פיקסלים.",
      PickList: "רשימה שבוחרים בה שורה אחת: כל שורה היא כפתור בחירה, והשורה הנבחרת צבועה עם פס בתחילתה, או, בשורות של שורה אחת ליד סרגל, צבועה וממוסגרת בצבע של מה שבוחרים בה. שורה שאי אפשר לחשב נשארת ברשימה, מעומעמת; לא מסננים אותה החוצה. כותרת קבוצה יכולה לעמוד מעל שורה, ואותה לא בוחרים.",
      PairBars: "שתי עמודות לכל שנה מאפס, השנים משמאל לימין והמספר בקצה כל עמודה. לכל סדרה גוון משלה, ומקרא לצד הגרף.",
      FixedTable: "טבלה שרוחב העמודות שלה קבוע, ולכן שום דבר לא זז כשמספר משתנה. אפשר להסתיר בטלפון עמודה שאינה הכרחית.",
      StatTile: "מספר גדול במסגרת משלו, עם שם מעליו ומשפט מתחתיו. שורה של שלושה מציגה את עיקרי הגוש.",
      Glide: "איך גרף זז כשהמספרים שלו משתנים: הקו, הציר והתוויות נעים מהמקום שבו הם עומדים עכשיו, בלי קפיצות ובלי חזרה אחורה, גם כשהמחוון ממשיך לזוז.",
      YearZoom: "איך גרף עם ציר שנים מגיב לעכבר ולאצבע: הצבעה על שנה מציגה את הערכים שלה, ולחיצה או הקשה נועלת אותה. במחשב, גרירה מקרבת לטווח של שנים. בטלפון אין קירוב, כדי לא להפריע לגלילה.",
      YearBars: "ערך לכל שנה כעמודה מאפס, השנים משמאל לימין והמספר בקצה כל עמודה. גוון ניטרלי אחד: זו סדרה אחת.",
      LabelChip: "מה המוצר הוא או עושה, במילה או שתיים ואייקון: איך הקרן עוקבת אחרי המדד, אם היא מחלקת, המטבע. הקשה פותחת דף אחד לעמוד (LabelSheetHost) עם ההסבר והחוקים. סוג הוא תווית, לא עמודה. LabelRow: שורה של תוויות.",
      GroupPrices: "מחירים לקבוצות לצד דירוג, אף פעם לא בתוכו: שורה סגורה מתחת לשורה של בית ההשקעות אומרת למי יש מחיר אחר, ונפתחת בהקשה לשורה לכל מחיר בשלוש עמודות: מי, מה זול יותר, עד מתי. קבוצות עם אותו מחיר הן שורה אחת. בעמוד של בית ההשקעות אותן שורות, עם המקום שבו כל אחת כתובה.",
      DocLink: "קישור החוצה למסמך שבו כתובים מילה או מספר: עמוד בתעריפון, תקנון של מבצע, הדף שבו נראה פרסום. נפתח בלשונית חדשה ומסתיים בחץ החוצה.",
      When: "תאריך בתוך טקסט: יום משמאל לימין, וחודש שמסמך מדפיס לבד במילים, בלי יום שהאתר המציא. המילים שלפניו נשארות איתו בשורה, ו״מ־״ או ״ב־״ לפני שם של חודש נכתבים צמודים: ״מנובמבר 2025״.",
      TariffDate: "שורת התאריך של תעריפון: מה שהמסמך עצמו מדפיס, בצבע רגיל. תאריך אחד לכל המסמך, תאריך של החלק שהאתר קורא, גרסה, תאריך שהודפס בטעות כמו שהוא, או שאין תאריך מודפס ומתי האתר בדק. מתחת לכותרת שכבר אומרת ״תעריפון״ המילה לא חוזרת.",
      ConditionBand: "הראש של עמלה שהמחיר שלה משתנה לפי דבר אחד עד שלושה (מה קונים, הערוץ, המסלול, גודל הפעולה): ״המחיר משתנה לפי״ והדברים בפס כחול, ופח ליד כל דבר. כשהמקרים נקראים כשורות (בטלפון, או יותר מחמישה מקרים) הם בפס עצמו: שורה לכל מקרה, התנאי במילים מעל החלקים, ״בכל …״ חלש יותר, ״שלכם״ ליד המסלול של האדם. טבלה של שני דברים נקראת בקבוצה לכל ערך של הדבר הראשון. מקרים שאינם של האדם מקופלים לשורה אחת. מקרה אחד פתוח: מסגרת, ״נבחר״, הערכים שלו כמקומות לבחירה והחלקים עם התיבות שלהם.",
      CaseTable: "המקרים של עמלה לפי הצורה שלה. דבר אחד: המקרים בעמודות והחלקים בשורות, רק השורות שיש למקרה כלשהו, ותא אחד לשכנים שווים. טווח הוא סולם עולה, והגבול של כל מדרגה נכתב במקומו. שני דברים: טבלה, הראשון בצד והשני למעלה, ומקרה שחל בכל ערך של השני תופס את כל השורה. דבר שלישי הוא מתג מעל הטבלה. מה שזהה בכל המקרים נאמר פעם אחת מעליהם, ומה שזהה בשורה או בעמודה נאמר בראש שלה. ההוספה עומדת איפה שהדבר החדש יופיע: עמודה, מדרגה, שורה או מקום ריק בקו מקווקו.",
      ChangeDivider: "מחיר שמשתנה עם הזמן: המחירים של העמלה זה מתחת לזה לפי הזמן, ובין שניים קו לכל הרוחב עם ״מ־״ והחודש שהמחיר הבא מתחיל בו, שאפשר לשנות במקום, ופח שמוריד את השינוי. בסוף, בקו מקווקו, ״+ המחיר משתנה מתאריך״, ששואל רק על החודש.",
      FeePalette: "העמלות שאפשר עוד להוסיף לעסקה, כשאף עמלה לא פתוחה: כרטיס לכל עמלה, הנקודה שלה, השם ושורה אחת על מה היא נגבית. הקשה מוסיפה אותה ופותחת אותה, ובמחשב אפשר גם לגרור אותה אל העסקה.",
      PartChip: "חלק של מחיר: מחיר, מינימום או מקסימום, קשר לעמלה אחרת, או הערה. במנוחה דק, והסמל והמילה הראשונה בצבע של הסוג; המספרים במצב שלהם, כמו בכל מקום. PartEdit: אותו חלק בעריכה, על כל הרוחב, עם התיבות והבחירות שלו ופח להסרה. סדר החלקים קבוע.",
      SlimFee: "עמלה שיש לה מחיר אחד: שורה אחת, נקודת הצבע שלה, השם והחלקים. הקשה פותחת אותה במקומה, כמו מקרה. FeeBlock: עמלה שהמחיר שלה משתנה, השם ומתחתיו הפס.",
      RemoveButton: "הפקד שמוריד משהו: פח, הסמל לבדו בעיגול, המילים שלו נאמרות ומופיעות כשמצביעים עליו. בטלפון 44 פיקסלים מכל צד. ✕ רק סוגר (חלונית, גיליון, תפריט); מה שמוריד חלק, מקרה, דבר שהמחיר משתנה לפיו או עמלה הוא תמיד הפח.",
      DropZone: "גרירה של שבב אל מקום שמקבל אותו, במחשב בלבד: שבב שהקשה עליו כבר עושה משהו נגרר גם אל מקום בעמוד, והשחרור שם עושה מה שההקשה עושה, באותו מקום. בזמן הגרירה כל מקום שמקבל את השבב מוקף בצבע הפעולה, ומקום שלא יקבל אותו לא מראה כלום. בטלפון נשארת ההקשה.",
      Toolbox: "החלקים שאפשר להוסיף למקרה הפתוח, בקבוצות לפי סוג, כל קבוצה עם הצבע והסמל שלה. הקשה על חלק מוסיפה אותו, ובמחשב אפשר גם לגרור אותו אל המקום שלו; חלק שכבר במקרה מסומן ב־✓ ומעומעם, ולא נעלם. בטלפון: לשונית קצרה בתחתית המסך, קבוצה אחת בכל פעם, והקבוצות כלשוניות שגוללות לצדדים.",
      AskValues: "השאלה שעולה פעם אחת כשמוסיפים דבר שהמחיר משתנה לפיו: אילו ערכים יש בתעריפון, כבחירות שמסמנים, ״אחר״ בשם משלכם, משפט שאומר כמה מקרים יהיו, ו״להוסיף״ או ״ביטול״.",
      ValueMenus: "מה שנפתח כשמקישים על מקום של ערך במקרה הפתוח. TickMenu: רשימה לסימון, אפשר כמה, ושורה אחרונה לערך בשם משלכם. TrackMenu: שם המסלול כמו שהוא כתוב, ומתג ״זה המסלול שלי״. RangeMenu: ״עד״ או ״מעל״, המספר והיחידה, ושורה שאומרת מה המקרה שלפניו. ValueMenuSheet: הכרטיס שמחזיק אותם, ליד המקום במחשב ומלמטה בטלפון. ThingMenu: מה שנפתח כשמקישים על דבר בראש הפס בזמן שהעמלה פתוחה: הערכים שלו במקרים, ״להפסיק להבחין לפי …״, ושורה שאומרת מה יקרה למקרים.",
      ReadForBand: "השורה הראשונה של קריאת העסקה, בכחול של הפס: בשביל איזה מקרה קוראים, בחירה אחת לכל דבר שהעמלות משתנות לפיו, ושורה מתחת. עסקה בלי פס לא מראה אותה.",
      ClaimCheck: "טענה מהפרסום של חברה מול המסמך שמחייב אותה: העמלה והמסקנה במילים, ואז שני הצדדים במילים שלהם, כל אחד עם קישור למקום שבו הוא כתוב. ClaimList: כמה טענות זו אחר זו.",
    },
    sample: {
      /** The cases and parts (ConditionBand, PartChip, SlimFee, Toolbox, AskValues, the value menus, ReadForBand): a deal's words, made up. */
      cases: {
        trade: "עמלת קנייה ומכירה",
        fx: "המרת מטבע",
        custody: "דמי ניהול פיקדון ניירות ערך",
        fixed: "דמי חשבון קבועים",
        things: { what: "מה קונים", track: "המסלול שבחרתם", channel: "הערוץ", size: "גודל ההמרה", held: "מה מחזיקים", portfolio: "גודל התיק" },
        heldValues: { ta: "ניירות ערך בתל אביב, קרנות נאמנות", abroad: "בחו״ל" },
        perCharge: "לכל חיוב",
        what: { ta: "ניירות ערך בתל אביב", mutual: "קרנות נאמנות מסורתיות", money: "קרנות כספיות", makam: "מק״מ", us: "בחו״ל, בארה״ב", europe: "בחו״ל, באירופה", world: "בחו״ל, בשאר העולם", notUs: "בחו״ל, מחוץ לארה״ב" },
        tracks: ["מסלול 1", "מסלול 2", "מסלול 3"],
        anyTrack: "בכל מסלול",
        anyChannel: "בכל ערוץ",
        channels: { branch: "בסניף", phone: "בטלפון", web: "באינטרנט ובאפליקציה", other: "ערוץ אחר" },
        /** A case row's spoken name: what a tap on it does. */
        open: (words: string) => `לפתוח את המקרה: ${words}`,
        openFee: (name: string) => `לפתוח את ${name}`,
        upTo: "עד",
        over: "מעל",
        toAction: "לפעולה",
        toConversion: "להמרה",
        inActionCurrency: "במטבע הפעולה",
        discount: "הנחה",
        ofPrice: "מהמחיר, גם על המינימום",
        andAlso: "ועוד",
        thirdParty: "עמלות של צד שלישי",
        noSum: "בלי סכום בתעריפון",
        unexecuted: "גם על הוראה שלא בוצעה",
        partial: "כל ביצוע חלקי בנפרד",
        saleApart: "מכירה במחיר אחר",
        offset: "מתקזזת מול עמלה אחרת",
        refund: "החזר",
        thirdPartyPart: "ועוד עמלה של צד שלישי",
        capWords: "מהפעולה",
        groups: { price: "המחיר", bound: "מינימום ומקסימום", when: "המחיר משתנה לפי", link: "קשר לעמלה אחרת", note: "עוד על המחיר" },
        whenParts: { what: "מה קונים", track: "המסלול שבחרתם", channel: "הערוץ", action: "גודל הפעולה", portfolio: "גודל התיק", volume: "היקף המסחר בחודש", count: "מספר הפעולות בחודש", own: "תנאי משלכם" },
        fourth: "לעמלה יש כבר שלושה דברים שהמחיר משתנה לפיהם, וזה המספר הגדול ביותר.",
        target: "בחו״ל, בארה״ב · מסלול 1",
        ask: "לפי הערוץ: אילו ערוצים יש בתעריפון שלכם?",
        askNote: "כל מקרה יועתק לכל ערוץ שסימנתם, עם המחיר שלו. 2 מקרים יהיו 4.",
        tickTitle: "מה קונים במקרה הזה. אפשר לסמן כמה.",
        rangeTitle: "גודל ההמרה במקרה הזה",
        trackPicks: "המסלול",
        whatPicks: "מה קונים",
        readNote: "כל עמלה נקראת במקרה שבחרתם כאן. עמלה שמשתנה לפי גודל הפעולה נקראת בכל הגדלים, בגרף שלמטה.",
        menuOpen: "הערך של המקרה",
        /** ThingMenu: a thing of the band's head opened, its values in the cases, the action that drops it and what that does. */
        thingTitle: "המקרים מבחינים בין:",
        thingStop: "להפסיק להבחין לפי המסלול שבחרתם",
        thingAfter: "4 מקרים יהיו 2: מקרים שנבדלים רק בזה יאוחדו, במחיר של הראשון מהם.",
        thingOpen: "הדבר שהמחיר משתנה לפיו",
      },
      /** AbroadNote: three made-up countries, two with a product and one without. */
      abroad: {
        places: { a: "מדינה א׳", b: "מדינה ב׳", c: "מדינה ג׳" } as Record<string, string>,
        title: "במדינה א׳: תוכנית לדוגמה",
        titleB: "במדינה ב׳: חשבון לדוגמה",
        body: "משפט או שניים על המוצר, ועל ההבדל מהמוצר של העמוד.",
        none: "האתר לא מצא שם מוצר דומה. זה לא אומר שאין כזה.",
        heads: ["עובדה ראשונה", "עובדה שנייה", "עובדה שלישית"],
        said: "אין",
        publisher: "אתר לדוגמה",
      },
      /** FigureField: where a sourced figure is from, in the note a press on its box opens. */
      from: "מהתעריפון של בית השקעות לדוגמה.",
      /** LeftOutLine: a made-up house's left-out things, one that can change a price and two that are only listed. */
      leftOut: { house: "בית לדוגמה", what: "מסלול מחירים לדוגמה", why: "מחיר אחר למי שעושה הרבה פעולות. האתר מחשב לפי המחיר הרגיל.", doc: "תעריפון לדוגמה, עמוד 3", others: ["שירות לדוגמה", "עוד שירות לדוגמה"] },
      /** TabCards: three made-up questions, their answers and the panel's words. */
      tabCards: { label: "שאלות לדוגמה", questions: ["שאלה ראשונה לדוגמה?", "שאלה שנייה לדוגמה?", "שאלה שלישית לדוגמה?"], answers: ["תשובה לדוגמה", "עוד תשובה", "תשובה שלישית"], note: "שורה מתחת לתשובה, לדוגמה", open: "פתוח למטה", kicker: "שם הניתוח, לדוגמה", head: "המסקנה של הניתוח, לדוגמה", body: "כאן הניתוח של השאלה שנפתחה." },
      /** PhoneFold: what is chosen, the line's two words, the chips it folds. */
      /** AmountChart: two made-up parts of a cost against an amount, and the words around the chart. */
      amount: { a: "עמלה לדוגמה", b: "עמלה נוספת לדוגמה", x: "הסכום, לדוגמה", tip: (a: string) => `סכום של ${a}`, total: "יחד" },
      /** MenuPicker with words of its own on the button: the list's name and a count. */
      menuFace: "הרשימה שלכם · 3",
      phoneFold: { summary: "בחירה לדוגמה · עוד בחירה לדוגמה", more: "שינוי", less: "סגירה", chips: ["אפשרות א", "אפשרות ב", "אפשרות ג"] },
      /** keepTitleWhole: a document's title naming a fund, made up, with a Latin run and a quoted name ending in a number. */
      chipSentence: "במכירת ניירות ערך הבנק או חבר הבורסה מנכים מס רווח הון במקור",
      docTitle: 'קרן לדוגמה, דוח שנתי "קרן לדוגמה MSCI AC World (4A) ETF ת"א 35" (1234567), 31.12.2025',
      receipt: { title: "קבלה לדוגמה", stubNames: "חשבון לדוגמה + קרן לדוגמה", paid: "הפקדתם", added: "צמיחה לדוגמה", tax: "מס רווחי הון לדוגמה", account: "החשבון: חשבון לדוגמה", accountLine: "עמלה לדוגמה", rate: "0.1% מכל פעולה (דוגמה)", fund: "הקרן: קרן לדוגמה", fundFee: "דמי ניהול לדוגמה", left: "נשאר לכם", gain: "מה שנשאר, פחות מה שהפקדתם", bar: "מה ירד בדרך, לדוגמה" },
      stretch: { accounts: "חשבונות לדוגמה", funds: "קרנות לדוגמה", ruler: "כמה נשאר בסוף, לדוגמה", upTo: "עד", less: "פחות", chosen: "נבחר", years: "10 שנים לדוגמה" },
      tile: { account: "החשבון", fund: "הקרן", link: "התעריפון", name: "בית השקעות לדוגמה", rows: ["שורה ראשונה", "שורה שנייה"], values: ["ערך לדוגמה", "ערך נוסף"] },
      cost: { trade: "קנייה ומכירה", custody: "דמי משמרת", fixed: "דמי ניהול חשבון", fund: "דמי ניהול הקרן", tax: "מס רווחי הון", remainder: "תוספת משילוב עמלות החשבון", remainderAbout: "החלק הזה לא שייך לעמלה אחת: בלי אחת מעמלות החשבון הוא עדיין היה נגבה, כי שאר עמלות החשבון היו גובות אותו מהכסף שהיא כבר לא הייתה לוקחת ומהצמיחה שלו.", fromComputed: "חישוב של האתר", fromList: "מהתעריפון של בית השקעות לדוגמה", fromGroup: "מהמסמך של קבוצה לדוגמה", fromYours: "מה שהזנתם", states: { list: "התעריפון", group: "קבוצה", yours: "שלכם" } as Record<string, string>, stateLabel: "מחירים לדוגמה" },
      periods: ["יום", "שבוע", "חודש", "3 חודשים", "6 חודשים", "שנה", "שנתיים", "3 שנים"],
      periodsShort: ["יום", "שבוע", "חודש", "3 ח׳", "6 ח׳", "שנה", "שנתיים", "3 שנים"],
      periodsTiny: ["יום", "שבוע", "חודש", "3 ח׳", "6 ח׳", "שנה", "2 ש׳", "3 ש׳"],
      periodNone: "אין",
      periodLabel: "תקופת הפיקדון, לדוגמה",
      periodChosen: "נבחרה",
      periodNote: "בנק לדוגמה",
      periodGap: "רק משתנה",
      strip: { label: "השנים של התוכנית, לדוגמה", first: "מחירי הקבוצה", middle: "קנייה בלבד במחיר הקבוצה", after: "התעריפון", today: "היום", year: (y: number) => `שנה ${y}` },
      groups: {
        house: "בית השקעות לדוגמה",
        doc: "מסמך לדוגמה",
        quote: "המילים במסמך, לדוגמה",
        holdings: "ניירות ערך לדוגמה",
        holdingsFunds: "קרנות לדוגמה",
        cheaperA: "דמי ניהול 0.1% במקום 0.2% (דוגמה)",
        cheaperB: "4 ₪ לפעולה (דוגמה)",
        price: "מחיר לדוגמה",
        a: { name: "קבוצה ראשונה", who: "צעירים בגילאי 18 עד 25 (דוגמה)", whoShort: "צעירים בגילאי 18 עד 25 (דוגמה)", ends: "לא כתוב", endsShort: "לא כתוב" },
        b: { name: "קבוצה שנייה", who: "סטודנטים לדוגמה", whoShort: "סטודנטים לדוגמה", ends: "שנה מההצטרפות (דוגמה)", endsShort: "שנה (דוגמה)" },
        c: { name: "קבוצה שלישית", who: "לקוחות לדוגמה", whoShort: "לקוחות לדוגמה", ends: "לא כתוב", endsShort: "לא כתוב" },
      },
      claim: { claim: "ללא דמי משמרת (דוגמה)", binding: "דמי משמרת 0.1% לרבעון (דוגמה)", ad: "דף פרסום לדוגמה", doc: "תעריפון לדוגמה", terms: "תקנון מבצע לדוגמה" },
      tariffPart: "חלק ניירות הערך",
      whenLead: "תעריפון מ־",
      steps: ["בכל רגע", "תוך יום מסחר", "במועדים קבועים", "בסוף השנה"],
      products: { name: "שם", number: "מספר", link: "קישור", figure: "שיעור", note: "שורה שנייה קצרה", a: "מוצר ראשון", b: "מוצר שני", c: "מוצר שלישי", banner: "שורת זהירות מעל שתי שורות ששייכות יחד", go: "לעמוד" },
      compare: { product: "אפשרות", when: "מתי", rate: "ריבית שנתית", a: "אפשרות ראשונה", b: "אפשרות שנייה", c: "אפשרות שלישית", mine: "בעמוד", range: "טווח לדוגמה" },
      notes: ["הערה ראשונה: מה המספר לא כולל.", "הערה שנייה: מאיפה הריבית מגיעה."],
      dotLine: { site: "הנחות לדוגמה, לא תחזית", ret: "תשואה 5% בשנה, לדוגמה", today: "הסכומים בכסף של היום" },
      list: { heading: "הרשימה שלכם", note: "הערה קטנה ליד הכותרת, שיורדת שורה כשאין מקום", items: ["ראשון", "שני", "שלישי"], longItem: "פריט עם שם ארוך מאוד כדי לראות איך השורה יורדת", add: "פריט נוסף", confirm: "למחוק את הפריט?", yes: "מחיקה", no: "ביטול", rename: "שינוי השם", remove: "מחיקת הפריט", renameField: "שם הפריט", foot: "שורה מתחת לרשימה." },
      text: { label: "שם לדוגמה", check: "סימון לדוגמה", group: "קבוצת שדות" },
      select: { label: "חשבון לדוגמה", none: "לא נבחר", options: [{ id: "a", name: "ראשון" }, { id: "b", name: "שני" }, { id: "c", name: "שלישי" }], help: "שורת עזר קצרה מתחת לשדה." },
      title: "כותרת לדוגמה",
      /** Section `under`: a line that belongs to the heading. */
      sectionUnder: "שורה ששייכת לכותרת, צמודה אליה",
      other: "אחר",
      otherField: "הערך שלכם",
      pickCard: "בחרו באפשרות הזאת",
      pickCardLink: "קישור בתוך הכרטיס",
      legendAfter: "הנחה לדוגמה",
      helpText: { head: "ריבית בשנה", text: "כך כל בנק פרסם את הריבית שלו. היא לא מגיעה לכל לקוח: כל בנק קובע תנאים." },
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
      longTag: "של קרן לדוגמה בעלת שם ארוך מאוד, ועוד קרן לדוגמה עם שם ארוך",
      knobStep: "עוד צעד:",
      knobMost: "הכי משפיע",
      range: "שנים",
      percent: "אחוז לדוגמה",
      hint: "רמז קצר מתחת לשדה.",
      error: "הזינו מספר תקין.",
      stairsNow: "עכשיו",
      stairsStep: "שלב",
      seriesA: "מסלול א",
      seriesB: "מסלול ב",
      seriesC: "קו מנוקד: על תשואה שהוזנה",
      baselineDots: "קו נקודות: העו״ש, קו הבסיס בגרף ההשוואה",
      fee: "דמי ניהול",
      yearWord: "שנה",
      today: "היום",
      markerName: "סמן על ציר השנים",
      laneA: "פס ראשון: נעול",
      laneB: "פס שני: פתוח",
      barA: "אפשרות א",
      barB: "אפשרות ב",
      diff: "ההפרש",
      diffLine: "ההפרש: באפשרות א יש {gap} יותר",
      reason: "אין עדיין נתון על הדמים המלאים של החשבון.",
      sourceLead: "מקור ההתחלה:",
      sourceItems: ["מה שהזנתם", "המטרה השמורה"],
      printed: "ללקוחות פרטיים ששכר של לפחות 3,000 ₪ נכנס לחשבון שלהם, עד 31.03.2026, בריבית של 2%.",
      doubt: "הבנק מפרסם 4 שיעורי ריבית, אחד לכל תקופה של 3 חודשים, ולא שיעור אחד לשנה.",
      depositTable: "טבלת הריביות של הבנק (דוגמה)",
      group: "לא דורגו",
      topic: "קרן השתלמות",
      rowA: "אפשרות ראשונה",
      rowB: "אפשרות שנייה",
      statLabels: ["אחרי הדמים", "בלי דמים", "העלות"],
      note: "הערה קצרה מתחת למספר",
      kv: ["דמי ניהול מצבירה", "דמי ניהול מהפקדה", "תקופת התחייבות"],
      cards: [
        { id: "a", label: "תקרת הפקדה", line: "השורה שמתחת לערך.", lead: "שורת רקע קטנה." },
        { id: "b", label: "פטור ממס", line: "עוד שורה." },
      ],
      companyLead: "תלוי בחברה",
      companies: ["חברה ראשונה", "חברה שנייה", "חברה שלישית"],
    },
  },
} as const;

/** What the guide visuals' range facts are, as their number sheets say it (moved from guide-signature-g2.server.ts). */
export const signatureFacts = {
  /** Beside an exchange rate worked out from the European Central Bank's reference rates (F-84), with their date ("23.10.2026"). */
  fxLabel: (date: string) => `מחושב משערי הייחוס של הבנק המרכזי האירופי, ${date}`,
  /** What the house named in a guide's own-account figure is: the one the site's parameters assume (P-05). */
  ownHouse: "בית ההשקעות שהפרמטרים של האתר מניחים לחשבון ניירות ערך",
  /** The regulator's monthly file a count of its tracks rests on (F-64); its value is the month, said as "ספטמבר 2026". */
  cmaFile: "הקובץ החודשי של רשות שוק ההון",
  /** A guide's count of the regulator's tracks of the product, without self-directed tracks (F-64). */
  trackCount: "כמה מסלולים, בלי מסלולים בניהול אישי, דיווחה הרשות בתקופה האחרונה עם דמי ניהול",
  trackCountAll: "כמה מסלולים, בלי מסלולים בניהול אישי, יש בקובץ של הרשות לתקופה האחרונה, עם דמי ניהול או בלי",
  /** A guide's count of the regulator's tracks that follow the index (F-67's rule 3). */
  indexTrackCount: "כמה מסלולים על המדד הזה דיווחה הרשות בתקופה האחרונה, עם דמי ניהול",
  /** An ECB reference rate among a cross rate's inputs (F-84): units of the currency, by its code, per one euro. */
  perEur: (code: string) => `${code} לאירו`,
  brokerWorst: "בית ההשקעות שהחשבון בו משאיר הכי מעט בתוכנית לדוגמה של האתר",
  brokerBest: "בית ההשקעות שהחשבון בו משאיר הכי הרבה בתוכנית לדוגמה של האתר",
  brokerCount: "כמה בנקים ובתי השקעות שהתעריפון שלהם נאסף ושהאתר מחשב בשבילם את החשבון",
} as const;
