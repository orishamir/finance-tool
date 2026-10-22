# Hebrew copy, release 1

Written 2026-10-23 as the site's UX writer, from `docs/flows.md` (screens and briefs), `docs/design-system.md`, the design review of the same day, and the design plugin's `ux-copy` skill with the `hebrew-content-writer` skill.
Status: **draft for founder review.** Financial terms and their one-line explanations are in `docs/glossary.md`, each with its source in the il-finance rule base.

---

## 1. Voice

- **Direct and plain.** One idea per sentence. Point first, reason second. No softeners ("נשמח אם"), no exclamation marks, no "שימו לב".
- **Addressing the reader:** plural imperative ("הדביקו", "בחרו", "הקישו") or impersonal ("אפשר", "יש"). Never "אתה" or "את". This keeps every line gender-neutral.
- **Spelling:** ktiv maleh throughout. Gershayim inside acronyms (אג״ח, מק״מ, עו״ש). Maqaf between a prefix and a number or Latin word (ב־2026, ה־S&P 500).
- **Names:** products, tracks and companies appear exactly as their source writes them. The site's words go beside them, never instead of them.
- **No typed numbers.** Every figure comes from the number component with its source. In this file a figure's place is shown as `{שם}`, for example `{סכום}`, `{תאריך}`, `{שנים}`.
- **Financial terms:** the first time a term from the glossary appears on a page, it can be tapped for its one-line explanation (`docs/glossary.md`). Use the official Hebrew term from the glossary, not a synonym.
- **Plural forms:** years, months and days follow Hebrew forms, not a digit plus a fixed word: שנה, שנתיים, `{n}` שנים; חודש, חודשיים, `{n}` חודשים. Build them with `Intl.PluralRules('he')`.
- **Codes:** a rule or open-question code follows its words and is never in brackets at the end of a sentence: "שאלה פתוחה: TXK OQ10".

---

## 2. Everywhere

### Header, menu, footer

| Element | Hebrew |
|---|---|
| Site name | `{שם האתר}` (not chosen yet) |
| Search button (screen-reader name) | חיפוש |
| Search field placeholder (PC header) | הדביקו שם של מוצר, מסלול או מונח |
| Menu button (screen-reader name) | תפריט |
| Menu items | מדריך · חברות ומסלולים · כללים · פרמטרים · מה האתר עוד לא מכסה |
| Close (sheets, menu) | סגירה |
| Footer links | כללים · פרמטרים · מה האתר עוד לא מכסה |
| Back link on a phone | the parent page's name, with a chevron pointing right |

### Number styles and their key

| Element | Hebrew |
|---|---|
| Key, three samples | ממקור · מחושב · הוזן על ידך |
| Key, hint (phone) | הקישו על מספר כדי לראות מאיפה הוא. |
| Key, hint (PC) | לחצו על מספר כדי לראות מאיפה הוא. |
| A number's screen-reader name | `{ערך}`, `{ממקור / מחושב / הוזן על ידך}`, פרטים |
| Unknown value | לא ידוע |
| Site-parameter tag | פרמטר של האתר |
| Provisional parameter | ערך זמני שהאתר קבע |
| Stale flag (screen-reader name, and the sheet's line) | לא עודכן מאז `{תאריך}` |
| Weaker-source tag after a number | משני · מוסדי |

### Source strength

The label, then the one line the number sheet and the rule card show under it.

| Label | Line |
|---|---|
| מקור ראשי | הנתון נלקח מנוסח החוק, מהתקנות או מהגוף שמפרסם אותו. |
| מקור ראשי (עותק) | נוסח החוק נקרא באתר שמעתיק אותו, ועוד לא באתר הרשמי. |
| מקור מוסדי | הנתון נלקח ממסמך של בנק או של חברה מנהלת, לא מהחוק או מהרשות. |
| מקור משני | הנתון נלקח מכתבה או מאתר מידע, לא מהמקור עצמו. |
| שאלה פתוחה | עוד לא מצאנו מקור שעונה על זה, ולכן האתר לא מחשב את זה. |

### Common buttons and links

| Element | Hebrew |
|---|---|
| Reset one value | חזרה לערך ההתחלתי |
| Reset all values | חזרה לכל הערכים ההתחלתיים |
| Show the graph's table / hide it | הצגה כטבלה / הסתרת הטבלה |
| Open a source | פתיחת המקור |
| To the rules page | לכל הכללים |
| Copy / after copying | העתקה / הועתק |

---

## 3. Screen by screen

The numbers match the briefs in `docs/flows.md` section 6.

### 3.1 First page

| Element | Hebrew |
|---|---|
| Line under the site name | להבין חיסכון והשקעה בישראל, עם מקור לכל מספר. |
| Search label | מה ראיתם באפליקציה, בפרסומת או בדוח? |
| Search placeholder | הדביקו שם של מוצר, מסלול או מונח |
| Door 1 | להבין סוג של חיסכון |
| Door 1, line | מה זה, כמה זה עולה ואיך זה ממוסה |
| Door 2 | מה חברה מציעה לי |
| Door 2, line | כל המוצרים והמסלולים שלה, עם הסבר לכל אחד |
| Small link | מה האתר עוד לא מכסה |

Alternatives for the line under the site name:

| Option | Hebrew | Tone | Best for |
|---|---|---|---|
| A (recommended) | להבין חיסכון והשקעה בישראל, עם מקור לכל מספר. | plain, says what is different | everyone |
| B | מה כל מוצר חיסכון עושה, כמה הוא עולה ואיך הוא ממוסה. | concrete | a friend who has never heard of these products |
| C | חיסכון והשקעה בעברית פשוטה. אף אחד לא מקבל עמלה. | trust first | a reader who distrusts finance sites |

Why A: the reader learns what the site does and the one thing that sets it apart in a single line. B repeats the first door. C is true (no referral or agent links) but leads with suspicion.

### 3.2 Header and menu

As in section 2. The menu sheet's title is "תפריט". The current page's row has the screen-reader state "העמוד הנוכחי".

### 3.3 Search

| Element | Hebrew |
|---|---|
| Field label (screen reader; visible on the phone sheet) | חיפוש |
| Hint before typing | אפשר להדביק את השם בדיוק כמו שהוא מופיע באפליקציה, בפרסומת או בדוח. |
| Too short | הקלידו לפחות שתי אותיות. |
| Group headings | מוצרים · מסלולים וקופות · מונחים · עמודי מדריך |
| Result line, a product or track | `{חברה}` · `{סוג מוצר}` |
| Result line, a term | מונח · מוסבר בעמוד `{עמוד}` |
| More in a group | הצגת כל התוצאות בקבוצה |
| Clear button (screen-reader name) | ניקוי |

**No match (empty state).** What it is, why it is empty, and what to do next:

| Element | Hebrew |
|---|---|
| Title | עוד לא קוטלג |
| Body | את השם "`{שם}`" עוד אין באתר. שמרנו אותו במכשיר שלכם כדי שיהיה אפשר להוסיף אותו. |
| Button | העתקה |
| Line under the button | העתיקו את השם ושלחו אותו למי ששלח לכם את האתר, כדי שיתווסף. |
| After copying | הועתק |
| Copy failed | לא הצלחנו להעתיק. סמנו את השם והעתיקו אותו ידנית. |
| Links | לרשימת החברות · לחפש רק חלק מהשם |

Why "למי ששלח לכם את האתר": every friend reached the site through the founder's link, so this names the right person without naming anyone.

### 3.4 Guide list

| Element | Hebrew |
|---|---|
| Title | מדריך |
| Lede | כל סוג של חיסכון והשקעה שהאתר מכסה. לכל אחד אותו מבנה, כדי שיהיה קל להשוות. |
| Group 1 | איפה הכסף מוחזק |
| Group 1, line | המוצר עצמו: חשבון בבנק, קופה או חשבון השקעות |
| Group 2 | במה הכסף מושקע |
| Group 2, line | מה שבתוך המוצר: מזומן, אג״ח, מניות דרך מדד |
| Each card's line | the product's one-line explanation from `docs/glossary.md` |
| Last card | מה האתר עוד לא מכסה |
| Last card, line | מוצרים שאנחנו מכירים אבל עוד לא מסבירים עד הסוף |

### 3.5 Product guide page

| Element | Hebrew |
|---|---|
| Section index title | בעמוד הזה |
| Section headings, fixed order | מה זה · מי מציע ומי מפקח · כסף נכנס ויוצא · כמה זה עולה · מיסוי · סיכונים ומה לא מוגן · למה משתמשים בזה · מה לבדוק · מונחים |
| Lede | the product's one-line explanation from `docs/glossary.md` |
| Graph title | מה קורה לכסף לאורך הזמן |
| Headline label | נשאר לכם אחרי `{שנים}`, אחרי דמי ניהול ומס, בכסף של היום |
| Switch | בכסף של היום · בשקלים של העתיד |
| Legend | נשאר לכם · מס · דמי ניהול · ההפקדות שלכם |
| Value chips | סכום היום · הפקדה חודשית · שנים · תשואה בשנה · אינפלציה בשנה · כל ההנחות |
| Readout heading | היום / שנה `{n}` |
| Table headings | שנה · ההפקדות שלכם · דמי ניהול · מס · נשאר לכם |
| Graph's screen-reader name | גרף: הכסף לאורך `{שנים}`. הנתונים המלאים בטבלה. |
| Rules line | כללים: |
| Marker, money becomes free | אפשר למשוך מכאן |
| Marker, age | גיל `{גיל}` |
| Caption, return entered by the reader | הקו המקווקו מבוסס על תשואה שהזנתם, לא על הערכה של האתר. |
| Blocked band | לא מחושב: שאלה פתוחה `{קוד}` |
| Figure past its end date | הנתון לא עודכן: `{שם הכלל}` היה בתוקף עד `{תאריך}`. עד שנעדכן אותו, האתר לא מחשב את הגרף. |
| Its link | לכלל |
| Row that applies to the reader | לפי מה שהזנתם |
| Row that doesn't | לשכירים בלבד · לעצמאים בלבד |
| "Who offers it", line | לכל חברה יש עמוד עם כל המסלולים שלה. |
| "Who offers it", last chip | כל החברות |
| Fee table headings | סוג · על מה נגבה · תקרה · כללים |
| Fee table note | אלה התקרות שבחוק. כמה כל חברה גובה בפועל, בכל מסלול, מופיע בעמוד של החברה. |
| Tax steps | בהפקדה · כל עוד הכסף בפנים · כשמושכים |
| "Typical use", related products | גם כדאי להכיר: |
| Checklist summary | חסום: `{רשימה}` |
| Checklist marks | נלקח בחשבון · לא רלוונטי · חסום: שאלה פתוחה `{קוד}` |
| Checklist row, expand | מאיפה זה |
| Blocked row, last line | עד שהשאלה תיסגר, האתר לא מחשב את זה. |
| Terms section, line | איך קוראים לזה בדוח, באפליקציה ובחוק. |
| Terms, where it appears | דוח שנתי · דף חשבון · תלוש שכר · אפליקציה · פרסומת · חוק |

Why "בשקלים של העתיד" rather than "נומינלי": the reader sees the difference in the label itself. The glossary still explains ריאלי and נומינלי where they appear in tax text.

### 3.6 Exposure guide page

| Element | Hebrew |
|---|---|
| Section headings | מה זה · איך מחזיקים את זה · סיכונים · מה לבדוק · מונחים |
| "How to hold it", line | המוצרים שבהם אפשר להחזיק את זה. השוואה ביניהם למטרה שלכם תתווסף בהמשך. |
| A product whose tax treatment is open | לא ברור עדיין איך זה ממוסה כאן: שאלה פתוחה `{קוד}` |

### 3.7 Values for the graph

| Element | Hebrew |
|---|---|
| Sheet or panel title | ההנחות של הגרף |
| Fields | סכום היום · הפקדה חודשית · כמה שנים · תשואה בשנה · אינפלציה בשנה · גיל (לא חובה) · סוג העסקה (לא חובה) |
| Employment options | שכירים · עצמאים |
| State of a starting value | ערך התחלתי, פרמטר של האתר |
| State of an entered value | הוזן על ידך |
| Hint, return | התשואה ההתחלתית היא דוגמה, לא תחזית. |
| Hint, inflation | בכמה המחירים עולים בשנה, בממוצע. |
| Hint, age | מסמן בגרף גילים שבהם הכללים משתנים. |
| Hint, employment | מסמן בעמוד את החלקים שנוגעים לכם. |
| Note under the return field | תשואה שתזינו תסומן בגרף בקו מקווקו, כי היא שלכם ולא של האתר. |

**Errors.** Shown under the field, in red, with the field's edge red. The graph keeps the last valid value until the error is fixed.

| Case | Hebrew |
|---|---|
| Not a number | הזינו מספר. |
| Negative amount | הסכום לא יכול להיות שלילי. |
| Years out of range | הזינו מספר שנים בין `{מינימום}` ל־`{מקסימום}`. |
| Age out of range | הזינו גיל בין `{מינימום}` ל־`{מקסימום}`. |
| Percentage out of range | הזינו אחוז בין `{מינימום}` ל־`{מקסימום}`. |

### 3.8 Where a number comes from

| Element | Hebrew |
|---|---|
| Row labels, from a source | מקור · פורסם על ידי · נבדק ב־ · בתוקף מ־ · בתוקף עד · כלל |
| Row labels, calculated | נוסחה · ערכים שנכנסו לחישוב · כללים שנכנסו לחישוב |
| Entered, first line | הזנתם את הערך הזה. |
| Entered, the value it replaced | במקום: |
| Site parameter | למה הערך הזה · אושר ב־ |
| Stale, line | לא עודכן מאז `{תאריך}`. בדרך כלל מתעדכן `{כל יום / כל חודש / כל רבעון}`. |
| Unknown, line | `{הסיבה מהנתונים}` |

### 3.9 A rule

| Element | Hebrew |
|---|---|
| Title | כלל `{קוד}`: `{כותרת}` |
| Disclosure | תנאים וחריגים |
| Figures | סכומים לפי שנת מס |
| Source and dates | מקור · נבדק ב־`{תאריך}` · ייבדק שוב ב־`{תאריך}` |
| Link | לכל הכללים |
| Open question, title | שאלה פתוחה: `{קוד}` |
| Open question, rows | מה עוד לא ידוע · מה מחכה לתשובה |
| Open question, last line | בינתיים האתר לא מחשב את זה. |

### 3.10 Companies list

| Element | Hebrew |
|---|---|
| Title | מה חברה מציעה לי |
| Lede | בחרו חברה כדי לראות את כל המוצרים והמסלולים שלה, ומה כל אחד מהם. |
| Filter label | חיפוש חברה |
| Row line | the product types it runs, from the glossary names: קופות גמל להשקעה · קרנות השתלמות · קרנות פנסיה … |
| No match | לא מצאנו חברה בשם הזה. |
| Its link | לחיפוש בכל האתר |

### 3.11 Company page

| Element | Hebrew |
|---|---|
| Line under the title | כל מה שהחברה מציעה, עם הסבר לכל מסלול. המסלולים לפי נתוני רשות שוק ההון, ביטוח וחיסכון, נכון ל`{חודש}`. |
| Fees pending | דמי הניהול של כל מסלול יופיעו כאן אחרי שנוודא מה בדיוק מודד כל שדה בנתוני הרשות. |
| List heading | כל המסלולים של `{חברה}` |
| Group count | `{מספר}` מסלולים |
| Track line | קופה `{מספר}` · סיווג: `{סיווג}` |
| Same-name banners | שני מסלולים באותו שם: שתי קופות נפרדות · אותו מסלול מופיע פעמיים · לא הוכרע: הנתונים לא מראים אם זו אותה קופה |
| Old data | נתוני הרשות לא עודכנו מאז `{חודש}`. |
| Paste card | לא מצאתם שם? · הדביקו את השם כמו שהוא מופיע באפליקציה, בפרסומת או בדוח. · למשל: גמל להשקעה כללי |

### 3.12 Track page

| Element | Hebrew |
|---|---|
| Line under the title | קופה `{מספר}` |
| Default tag | ברירת המחדל |
| Record labels | חברה מנהלת · סוג מוצר · סיווג · במה הכסף מושקע · דמי ניהול מחיסכון · דמי ניהול מהפקדה · נכון לחודש |
| Fee pending, in a fee row | עוד לא מוצג |
| Same name elsewhere | יש מסלול נוסף באותו שם. `{התשובה מהנתונים}` |
| Its link | למסלול השני |
| Link to the guide | לעמוד המדריך על `{מוצר}` |

### 3.13 Not covered yet

| Element | Hebrew |
|---|---|
| Title | מה האתר עוד לא מכסה |
| Lede | מוצרים שאנחנו מכירים אבל עוד לא יכולים להסביר עד הסוף, ולמה. |
| Card rows | מה ידוע · מה עוד פתוח · למה זה חשוב |
| Each product's line | its one-line explanation from `docs/glossary.md` |
| Empty list | כרגע האתר מכסה את כל המוצרים שהוא מכיר. |

### 3.14 Rules page

| Element | Hebrew |
|---|---|
| Title | כללים |
| Lede | כל כלל שהאתר משתמש בו, עם המקור שלו. כלל שהמקור שלו חלש יותר מסומן, ושאלה פתוחה מסומנת במנעול. |
| Group's open questions | שאלות פתוחות בנושא הזה |
| Re-check line | ייבדק שוב ב־`{תאריך}` |

### 3.15 Parameters page

| Element | Hebrew |
|---|---|
| Title | פרמטרים של האתר |
| Lede | החלטות שהאתר מקבל בעצמו, כמו מתי שתי אפשרויות נחשבות שקולות. הן לא כללים מהחוק, ואי אפשר לשנות אותן מהעמוד. |
| Card rows | למה · אושר ב־ · משמש ב: |
| Provisional | ערך זמני שהאתר קבע |
| Not set | עוד לא נקבע |

---

## 4. System messages

| Case | Hebrew |
|---|---|
| The calculation failed | לא הצלחנו לחשב את הגרף. רעננו את העמוד ונסו שוב. |
| Page not found | העמוד הזה לא קיים. אולי הקישור ישן. · לעמוד הראשי · לחיפוש |
| Data older than its cadence (page banner) | חלק מהנתונים בעמוד לא עודכנו מאז `{תאריך}`. הם מסומנים בשעון. |
| Calculation not loaded yet (field state) | טוען… |
| A catalogued fund number no longer in the regulator's data | לא נמצא בנתוני הרשות |

---

## 5. Localisation notes

- Placeholders in braces are filled by the site with value objects; never by typed figures.
- Strings that hold a Latin word or a code (S&P 500, TXK OQ10, ISIN) wrap it in an isolating element.
- Labels are short on purpose: the phone width allows about 18 Hebrew characters on a segmented-control button and 30 on a chip.
