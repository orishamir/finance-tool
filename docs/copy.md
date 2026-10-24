# Hebrew copy, release 1

> Release 2 section added 2026-10-23: section 6, the strings of the release 2 screens.
> Folded 2026-10-23 (evening): every string the day's build added to `site/app/copy.ts` is now here, in an "Added 2026-10-23, for the founder's review" table at the end of its section (3.5a and the release 2 tables are the largest), keyed by its `copy.ts` path so the two files can be diffed. Where the build's wording was changed, the note says what it was. Section 6.6 lists the word choices.
> Release 3 section added 2026-10-23: section 7, the strings of the release 3 screens.
> Release 4 section added 2026-10-24: section 8, the strings of the release 4 screens.
> Release 5 section added 2026-10-24: section 9, the strings of the release 5 screens.
> Folded 2026-10-24 (evening): every string the day's build added to `site/app/copy.ts` for releases 3 to 5 is now here, in an "Added 2026-10-24, for the founder's review" table at the end of its section, keyed by its `copy.ts` path. Where the build's wording was changed, the note says what it was; the rows of sections 7 to 9 that changed the same day say so in their note. Sections 7.6, 8.6 and 9.7 list the word choices.

Written 2026-10-23 as the site's UX writer, from `docs/flows.md` (screens and briefs), `docs/design-system.md`, the design review of the same day, and the design plugin's `ux-copy` skill with the `hebrew-content-writer` skill.
Status: **in force** (2026-10-23; the founder asked Claude to settle the wording, design-system Q3). Financial terms and their one-line explanations are in `docs/glossary.md`, each with its source in the il-finance rule base.

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
| Site name | מקור |
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
| Key, three samples | ממקור · מחושב · הזנתם · changed 2026-10-24 (Hebrew editor); was ״הוזן על ידך״ |
| Key, hint (phone) | הקישו על מספר כדי לראות מאיפה הוא. |
| Key, hint (PC) | לחצו על מספר כדי לראות מאיפה הוא. |
| A number's screen-reader name | `{ערך}`, `{ממקור / מחושב / הזנתם}`, פרטים · changed 2026-10-24 (Hebrew editor); was ״הוזן על ידך״ |
| Unknown value | לא ידוע |
| Site-parameter tag | פרמטר של האתר |
| Provisional parameter | ערך זמני שהאתר קבע |
| Stale flag (screen-reader name, and the sheet's line) | לא עודכן מאז `{תאריך}` |
| Weaker-source tag after a number | משני · לפי החברה · changed 2026-10-24 (Hebrew editor); was ״מוסדי״ |

### Source strength

The label, then the one line the number sheet and the rule card show under it.

| Label | Line |
|---|---|
| מקור ראשי | הנתון נלקח מנוסח החוק, מהתקנות או מהגוף שמפרסם אותו. |
| מקור ראשי (עותק) | נוסח החוק נקרא באתר שמעתיק אותו, ועוד לא באתר הרשמי. |
| לפי החברה | הנתון נלקח ממסמך של בנק או של חברה מנהלת, לא מהחוק או מהרשות. · changed 2026-10-24 (Hebrew editor); was ״מוסדי״ |
| מקור משני | הנתון נלקח מכתבה או מאתר מידע, לא מהמקור עצמו. |
| שאלה פתוחה | עוד לא נמצא מקור שעונה על זה, ולכן האתר לא מחשב את זה. · changed 2026-10-24 (Hebrew editor); was ״עוד לא מצאנו מקור שעונה על זה״ |

### Common buttons and links

| Element | Hebrew |
|---|---|
| Reset one value | חזרה לערך ההתחלתי |
| Reset all values | חזרה לכל הערכים ההתחלתיים |
| Reset entered values (link under the chart failure banner; `buttons.resetEntered`) | לאפס את הערכים שהזנתם | changed 2026-10-24 (UX fix, leftovers task 2): new |
| Show the graph's table / hide it | הצגה כטבלה / הסתרת הטבלה |
| Open a source | פתיחת המקור |
| To the rules page | לכל הכללים |
| Copy / after copying | העתקה / הועתק |


**Added 2026-10-23, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `site.back` | חזרה | screen-reader name of the back arrow inside a sheet (design-spec 3) |
| `site.menuItems[goal] · site.footer[goal]` | השוואה למטרה | the release 2 menu row and footer link; the words are in 6.0 |
| `numbers.yes · numbers.no` | כן · לא | a yes/no value object, shown through the number component |

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


**Added 2026-10-23, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `home.door3.title` | כסף שיושב בעו״ש | the third door (design-system 6.9); the words are in 6.0. The founder approved the first page with two doors, so the door itself is for review, not only the words |
| `home.door3.line` | שני מספרים, ותראו כמה עולה להשאיר אותו שם | as in 6.0 |

**Added 2026-10-24 (home question card), for the founder's review.** The question card that replaced the goal door (`docs/flows.md` 6.1, `docs/design-spec.md` 1a). Voice as in section 1: plural imperative, everyday words, no finance term on the card and never "מטרה". The goal door's two strings (`home.goalDoor`, "השוואה למטרה" with "הגדירו מטרה (סכום ושנים) וראו איזה מוצר מתאים ומה הוא עולה") are gone from `copy.ts`; "השוואה למטרה" stays as the menu row and footer link. Key paths are the ones in `site/app/copy.ts` (marked `// home question card 2026-10-24`). All wording is "chosen 2026-10-24, revisable".

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `home.quick.heading` | מה השאלה שלכם? | h2 of the card |
| `home.quick.amountNow` | יש לכם היום | field label; ₪ |
| `home.quick.monthly` | ובכל חודש | field label; ₪ |
| `home.quick.years` | כמה שנים עד שתצטרכו את הכסף | field label, in place of the goal form's "שנים עד המטרה" |
| `home.quick.unknownYears` | לא יודעים | chip; the years then come from the preset (a site parameter) |
| `home.quick.purposeLabel` | בשביל מה | label of the chip row; optional |
| `home.quick.purposes.apartment` | דירה | chip; known-date preset; also the goal's name |
| `home.quick.purposes.wedding` | חתונה | chip; known-date preset; also the goal's name |
| `home.quick.purposes.studies` | לימודים | chip; known-date preset; also the goal's name |
| `home.quick.purposes.child` | ילד | chip; child preset; also the goal's name |
| `home.quick.purposes.retirement` | פרישה | chip; long-term preset; also the goal's name |
| `home.quick.purposes.cushion` | כרית ביטחון | chip; opens idle cash (not a preset of the comparison). "כרית ביטחון" over the preset's own name "עתודה נזילה" on the card; the preset's name stays on the form and the strip |
| `home.quick.purposes.none` | בלי מטרה מסוימת | chip; lump-sum preset, or long-term when a monthly sum is typed; no name |
| `home.quick.submit` | מה הכי מתאים | the button; the result page's own title (`r2.result.title`), so one word names the answer |
| `home.quick.submitCushion` | כמה עולה להשאיר בעו״ש | the button with "כרית ביטחון" chosen |
| `home.quick.needAmount` | הזינו סכום: היום או בכל חודש. | under the button when no sum above zero is typed |
| `home.quick.line` | הכול נשמר במכשיר הזה. גיל, שכר ותשואה אפשר להוסיף בתוצאה, אם תרצו. | `text-xs muted` under the button |
| `home.quick.allFields` | לכל השדות | quiet link to the full goal form |
| `home.quick.another` | שאלה נוספת | the closed disclosure under the saved-goal strip; adds a second goal (D12) |
| `r2.result.horizonDefaulted.before / mid / after / change` | לא ידעתם כמה שנים, ולכן ההשוואה רצה על {n} שנים, נקודת ההתחלה של ״{preset}״. לשנות | note under the result's headline when the years came from the preset; {n} a site-parameter `Num`; "לשנות" opens the assumptions at the years. Same pattern as `employmentInferred` |
| `r2.result.horizonHonest.cannot` | האתר לא קובע אם {years} שנים מספיקות למניות: אין לו תשואה צפויה ואין לו נתון על ירידות. | product mode, when the years are below P-04's equity minimum; the site says what it does not know (D9, D11) |
| `r2.result.horizonHonest.can` | לפי טבלת ההתאמה של האתר, מסלול מנייתי נחשב מתאים מ־{min} שנים, למי שמסכים לירידה של {drop} בדרך. | {min} and {drop} are P-04's two figures, site parameters |
| `r2.result.horizonHonest.linkBefore` + `.link` | כדי לבדוק עם המספרים שלכם: הזינו תשואה וירידה שתסכימו לספוג + בהשוואה לפי חשיפה | the second half links to `/goal/compare?mode=exposure` |

The purpose to preset table is in `docs/design-spec.md` 1a.

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
| Title | עוד לא באתר · changed 2026-10-24 (Hebrew editor); was ״עוד לא קוטלג״ |
| Body | את השם "`{שם}`" עוד אין באתר. שמרנו אותו במכשיר שלכם כדי שיהיה אפשר להוסיף אותו. |
| Button | העתקה |
| Line under the button | העתיקו את השם ושלחו אותו למי ששלח לכם את האתר, כדי שיתווסף. |
| After copying | הועתק |
| Copy failed | ההעתקה לא הצליחה. סמנו את השם והעתיקו אותו ידנית. · changed 2026-10-24 (Hebrew editor); was ״לא הצלחנו להעתיק. סמנו את השם והעתיקו אותו ידנית.״ |
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
| Last card, line | מוצרים שהאתר מכיר אבל עוד לא מסביר עד הסוף · changed 2026-10-24 (Hebrew editor); was ״מוצרים שאנחנו מכירים אבל עוד לא מסבירים עד הסוף״ |

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
| Figure past its end date | הנתון לא עודכן: `{שם הכלל}` היה בתוקף עד `{תאריך}`. עד שהוא יעודכן, האתר לא מחשב את הגרף. · changed 2026-10-24 (Hebrew editor); was ״עד שנעדכן אותו, האתר לא מחשב את הגרף.״ |
| Its link | לכלל |
| Row that applies to the reader | לפי מה שהזנתם |
| Row that doesn't | לשכירים בלבד · לעצמאים בלבד |
| "Who offers it", line | לכל חברה יש עמוד עם כל המסלולים שלה. |
| "Who offers it", last chip | כל החברות |
| Fee table headings | סוג · על מה נגבה · תקרה · כללים |
| Fee table note | אלה התקרות שבחוק. כמה כל חברה גובה בפועל, בכל מסלול, מופיע בעמוד של החברה. |
| Tax steps | בהפקדה · כל עוד הכסף בפנים · כשמושכים |
| "Typical use", related products | כדאי להכיר גם: · changed 2026-10-24 (Hebrew editor); was ״גם כדאי להכיר:״ |
| Checklist summary | חסום: `{רשימה}` |
| Checklist marks | נלקח בחשבון · לא רלוונטי · חסום: שאלה פתוחה `{קוד}` |
| Checklist row, expand | מאיפה זה |
| Blocked row, last line | עד שהשאלה תיסגר, האתר לא מחשב את זה. |
| Terms section, line | איך קוראים לזה בדוח, באפליקציה ובחוק. |
| Terms, where it appears | דוח שנתי · דף חשבון · תלוש שכר · אפליקציה · פרסומת · חוק |


**Added 2026-10-23, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `guide.headline.afterNominal` | אחרי דמי ניהול ומס, בשקלים של העתיד | the headline's tail when the switch is on future shekels |
| `guide.modeLabel` | אופן הצגת הסכומים | screen-reader name of the real / nominal switch. Was "מטבע ההצגה": the switch is not about a currency |
| `guide.feeNoteOther` | הסכומים בפועל נקבעים אצל הגורם המציע. כאן מופיעים סוגי העלויות, ותקרה כשיש תקרה בחוק. | the fee-table note for a product that is not a provident fund (the provident note is above) |
| `guide.generalTermsLabel` | מונחים כלליים | disclosure under the term table |
| `guide.generalTermsLine` | מונחים שמשותפים לרוב המוצרים, לא רק לזה. |  |
| `guide.where.form · bylaws · gemel-net · prospectus · tariff · fund-name · tax-form · pensia-net · provider-site` | טופס · תקנון · גמל נט · תשקיף · תעריפון · שם הקרן · טופס מס · פנסיה נט · אתר הגורם המציע | more places a term appears (3.5 lists the first six). "תעריפון", not "תעריף": the banks' own word for the fee list (glossary "תעריפון מלא") |
| `guide.termTable.term · meaning · where` | מונח · מה זה · איפה מופיע | PC table headings, from the approved mockup |
| `guide.sliderAria` | מחוון | screen-reader name of a slider |

### 3.5a Fixed lines of the guide blocks

Added 2026-10-23 (added 2026-10-23, for the founder's review). The lines of the "כסף נכנס ויוצא", "כמה זה עולה" and "מיסוי" blocks, keyed by what the product record says (`guideBlocks` in `copy.ts`). A tax step is a headline and, where the site computes the step, one sentence; a dash separates the two here. Three headlines still hold a typed figure (marked **typed figure**): the rule's age or figure should come through the number component, which needs a code change.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `guideBlocks.ceiling.taxYear` | שנת המס | lead of the ceiling row, before the year |
| `guideBlocks.ceiling.per.person_per_calendar_year` | לשנה, לכל אדם בכל הקופות יחד | after the ceiling figure |
| `guideBlocks.ceiling.per.person_per_month` | לחודש, לכל אדם |  |
| `guideBlocks.ceiling.per.person_total_across_all_ira_accounts` | בסך הכול, לכל אדם בכל חשבונות הניהול האישי יחד | a total cap, so not "לשנה" |
| `guideBlocks.ceiling.per.person_total_across_all_study_fund_accounts` | בסך הכול, לכל אדם בכל חשבונות קרן ההשתלמות יחד | a total cap |
| `guideBlocks.ceiling.perYearAll` | לשנה, לכל אדם בכל הקופות יחד | same words as the yearly line; kept for older callers |
| `guideBlocks.ceiling.labelTotal` | תקרה על הסכום הכולל | row label when the cap is a total; the yearly label is `exit.labelCeiling` |
| `guideBlocks.exit.labelWithdraw` | משיכה | row label, money free at any time |
| `guideBlocks.exit.labelFree` | מתי הכסף פנוי | row label for a product with a lock-up; leads the section |
| `guideBlocks.exit.anyTime` | בכל עת, את כל הכסף או חלק ממנו | `lawful_exit.kind` = any_time |
| `guideBlocks.exit.atMaturity` | בסוף התקופה שנקבעה בהסכם | at_maturity without a term |
| `guideBlocks.exit.atMaturityTerm` | בתום `{חודשים}` | at_maturity with a term; the number component writes the months with their word |
| `guideBlocks.exit.afterYears` | כשעוברות מההפקדה הראשונה `{שנים}` | after_years. Was "רק אחרי `{שנים}`": now says where the clock starts (TXH-09, KH bylaws: from the first payment into the fund). The component writes only the words before the number, so the clock is named first |
| `guideBlocks.exit.atAge` | מגיל `{גיל}` | at_age |
| `guideBlocks.exit.atChildAge` | כשהילד מגיע לגיל `{גיל}` | at_child_age |
| `guideBlocks.exit.tradingDay` | בכל יום מסחר, במחיר של אותו יום | trading_day |
| `guideBlocks.exit.otherKind` | לפי התנאים שבנוסח שלמטה | a kind without its figure |
| `guideBlocks.exit.textNote` | הנוסח המלא, כפי שהוא במקור: | disclosure over the record's own text. Was "ברשומה" (a data word) |
| `guideBlocks.exit.labelDays · upTo · businessDays` | תוך כמה זמן הכסף אצלכם · עד · ימי עסקים | the payout row: "עד `{ימים}` ימי עסקים" |
| `guideBlocks.exit.labelSwitch` | מעבר בין מסלולים | row label |
| `guideBlocks.exit.labelCeiling` | תקרת הפקדה | row label, yearly or monthly cap |
| `guideBlocks.fees.balance` | דמי ניהול מחיסכון · כל שנה, מכל הכסף שנצבר · בשנה | name · what it is charged on · word after the cap |
| `guideBlocks.fees.deposit` | דמי ניהול מהפקדה · מכל סכום שמפקידים · מכל הפקדה |  |
| `guideBlocks.fees.direct_expenses` | הוצאות ישירות · עלויות הקנייה והמכירה של ההשקעות, מהקופה · אין תקרה כוללת | name · base · cap cell |
| `guideBlocks.fees.exit` | דמי יציאה · כשמושכים · אין | name · base · cap cell (provident family) |
| `guideBlocks.fees.trade` | עמלת קנייה ומכירה · מכל פעולת קנייה או מכירה | glossary term |
| `guideBlocks.fees.custody` | דמי ניהול פיקדון ניירות ערך · כל תקופה, על ניירות הערך שבחשבון | glossary term |
| `guideBlocks.fees.fx` | המרת מטבע · מכל המרה של שקלים למטבע זר או חזרה |  |
| `guideBlocks.fees.fixed_period` | דמי חשבון קבועים · כל חודש או רבעון, בלי קשר לסכום | BRK-24 |
| `guideBlocks.fees.distribution_handling` | טיפול בריבית ובדיבידנד · מכל תשלום ריבית או דיבידנד שנכנס לחשבון | BRK-24 |
| `guideBlocks.fees.spread` | מרווח קנייה ומכירה · בכל קנייה ומכירה בבורסה, כחלק מהמחיר |  |
| `guideBlocks.fees.creation_redemption` | עמלת יצירה ופדיון · כשההזמנה עוברת למנהל הקרן ולא לבורסה | ETF-05 · changed 2026-10-24 (Hebrew editor); was ״כשההזמנה עוברת ליצרן הקרן ולא לבורסה״ |
| `guideBlocks.fees.transfer_out` | העברה החוצה · כשמעבירים את הכסף למוסד אחר |  |
| `guideBlocks.fees.load` | הוספה · נוסף על מחיר היחידה בקנייה, והולך למנהל הקרן ולא לקרן | Was "עמלת הפצה · בקנייה או במכירה של יחידות בקרן", which is a different fee: the distribution fee (MF-24) is paid by the manager to the bank for units held. The schema's `load` is the purchase load, "הוספה" (MF-21, the glossary's term) |
| `guideBlocks.fees.redemption_deduction` | ניכוי בפדיון · ממחיר הפדיון, רק אם הסכם הקרן קובע ניכוי כזה | MF-22: allowed only where the fund agreement provides it. Was "מסכום הפדיון של יחידות בקרן" |
| `guideBlocks.fees.variable_management` | דמי ניהול משתנים · לפי הפער בין הקרן למדד, נוסף על דמי הניהול הקבועים; כשהקרן מפגרת אחרי המדד, המנהל משלם לה | ETF-14 and the glossary row. Was "לפי ביצועי הקרן, בנוסף לדמי הניהול הקבועים": the fee follows the tracking difference, not performance, and it can run the other way |
| `guideBlocks.fees.trustee` | שכר נאמן · כל שנה, מנכסי הקרן, בתוך מחיר היחידה | Was "דמי נאמנות"; the glossary and MF-20 say "שכר נאמן" |
| `guideBlocks.fees.insurance_premium` | דמי ביטוח · כל חודש, מהחיסכון, על כיסוי למקרה מוות או נכות | PEN-15, glossary term |
| `guideBlocks.fees.upTo` | עד | before a cap figure |
| `guideBlocks.fees.zeroCap` | אין | a cap of 0 (for example no custody fee on a makam at a bank) |
| `guideBlocks.fees.noCap` | אין תקרה בחוק | a cap the record holds as null |
| `guideBlocks.fees.tariffSet` | לפי התעריפון של הגורם המציע | a fee base with no cap in the record. Was "התעריף" |
| `guideBlocks.fees.unitAfter.*` | בשנה · מכל הפקדה · מכל פעולה · בכל תקופה · בחודש · לכל פעולה | pct_per_year · pct_of_deposit · pct_of_trade · pct_of_balance_per_period · nis_per_month · nis_per_trade; `nis` and `pct` add nothing |
| `guideBlocks.taxSteps.F-33` | אין הטבת מס — מפקידים מכסף שכבר שולם עליו מס. | headline — sentence |
| `guideBlocks.taxSteps.F-27` | אין מס על הרווחים — גם מעבר בין מסלולים לא ממוסה. |  |
| `guideBlocks.taxSteps.F-44` | עד `{שיעור}` מהרווח הריאלי — כלומר מהרווח שמעבר לעליית המחירים. · בסיס המס: לפי החברה · האתר מציג גם חלופה: `{שיעור}` מהרווח הנומינלי. | the rate is a number component; the tag and the alternative line follow · changed 2026-10-24 (Hebrew editor); was ״מוסדי״ |
| `guideBlocks.taxSteps.F-21` | מס על הריבית בסוף כל פיקדון — הבנק מנכה את המס מהריבית בסוף התקופה, והסכום נטו נפתח מחדש כפיקדון. |  |
| `guideBlocks.taxSteps.F-22` | מס על הריבית בסוף כל תקופה — אין כלל מס שמבדיל תוכנית חיסכון מפיקדון: הריבית ממוסה בסוף כל תקופה. |  |
| `guideBlocks.taxSteps.F-23` | בקרן כספית פטורה אין מס בזמן ההחזקה — חלוקות, אם יש, ממוסות כשהן משולמות. בקרן שהיא עצמה חייבת במס, הקרן משלמת את המס ולא אתם. |  |
| `guideBlocks.taxSteps.F-24` | ההפרש בין מחיר הקנייה לפדיון נחשב ריבית — המס על ההפרש מנוכה בפדיון, וסדרה חדשה נקנית מהסכום נטו. | Was "ההפרש בין המחיר לפדיון הוא ריבית" |
| `guideBlocks.taxSteps.F-25` | מס על כל תשלום ריבית — המס מנוכה בכל תשלום, והקופון נטו נקנה מחדש. |  |
| `guideBlocks.taxSteps.F-26` | מס על הריבית כשהיא נזקפת — הבנק מנכה את המס מהריבית בכל חודש שבו היא נכנסת לחשבון. |  |
| `guideBlocks.taxSteps.F-30` | הפקדה שעלותה נטו שווה לסכום שבחרתם | headline only |
| `guideBlocks.taxSteps.F-31` | זיכוי במס על ההפקדה לפנסיה, לשכירים | Was "זיכוי במס על הפקדה לפנסיה (לשכירים)": no brackets at the end of a line |
| `guideBlocks.taxSteps.F-32` | זיכוי או ניכוי במס על ההפקדה: לעצמאים ולמי שנחשב עמית מוטב | Was "…(לעצמאים ולמי שהפקדותיו מגיעות לסף שבחוק)": uses the law's term "עמית מוטב" (TXP-03; glossary row), gender-neutral, and the term opens its one-line explanation · changed 2026-10-24 (Hebrew editor); was ״לעצמאים ולמי שנחשבים עמית מוטב״ |
| `guideBlocks.taxSteps.F-40` | מס על הרווח במכירה — המס מנוכה במכירה, מהרווח הריאלי או מהרווח הנומינלי, לפי סוג הנכס. |  |
| `guideBlocks.taxSteps.F-41` | המס כבר שולם בכל פדיון — במשיכה, הפיקדון האחרון נחשב כאילו נפדה ביום המשיכה, והריבית שנצברה בו ממוסה. |  |
| `guideBlocks.taxSteps.F-42` | מגיל הפרישה המוקדמת: מדרגות המס שלכם — על רווחים מסוימים חלות מדרגות המס של האדם, אם הן נמוכות מהשיעור הקבוע. | **typed figure** (the age is TXK's rule figure): to become a number component, which needs a code change |
| `guideBlocks.taxSteps.F-43` | מס נוסף על הכנסה גבוהה — מי שההכנסה השנתית שלו עוברת סף שבחוק משלם מס נוסף, דרך הדוח השנתי. | "מס נוסף" is the glossary's term (also called מס יסף) |
| `guideBlocks.taxSteps.F-45` | העברה לקצבה מגיל הפרישה המוקדמת | **typed figure**, as F-42 |
| `guideBlocks.taxSteps.F-46` | בקרן השתלמות: פטור במשיכה אחרי תקופת ההמתנה — הרווח מההפקדות המוטבות פטור ממס. רווח מהפקדה מעל הסכום המוטב ממוסה במשיכה. |  |
| `guideBlocks.taxSteps.F-47 · F-48 · F-49` | משיכה מוקדמת מקרן השתלמות · משיכה מוקדמת מפנסיה · קצבה בפרישה | headlines only; the formulas are blocked or pending |
| `guideBlocks.taxSteps.F-50` | חיסכון לכל ילד: מס על הרווח במשיכה — ההפקדות, התוספת מההורה והמענקים אינם הכנסה. המס מנוכה במשיכה, ורק על הרווח. |  |
| `guideBlocks.taxSteps.F-51` | ניהול אישי: המס כמו של הקופה שאושרה — החשבון ממוסה כמו סוג הקופה שהוא אושר כמוה. |  |
| `guideBlocks.taxSteps.F-52` | כסף שהמעסיק מפקיד | headline only |
| `guideBlocks.taxSteps.F-53` | דמי הביטוח בקרן הפנסיה | Was "עלות הביטוח בפנסיה"; "דמי ביטוח" is the glossary's term (PEN-15) |
| `guideBlocks.taxSteps.F-54` | חיסכון לכל ילד: ההפקדות של המדינה — הביטוח הלאומי מפקיד סכום חודשי עד גיל הפדיון, והסכום מתעדכן פעם בשנה. | **typed figure** (CS rules), as F-42 |
| `guideBlocks.exitRates.realBasis` | `{שיעור}` מהרווח הריאלי | one line per rate a tax-at-exit step cites; the rate is a number component |
| `guideBlocks.exitRates.realLinkedBond` | אג״ח צמודה למדד: `{שיעור}` מהרווח הריאלי |  |
| `guideBlocks.exitRates.nominalBasis` | `{שיעור}` מהרווח הנומינלי |  |
| `guideBlocks.exitRates.unlinkedInterest` | ריבית לא צמודה: `{שיעור}` מהריבית, מנוכה בבנק |  |
| `guideBlocks.exitRates.linkedInterestCeiling` | ריבית צמודה למדד: עד `{שיעור}` מהריבית הריאלית, מנוכה בבנק |  |
| `guideBlocks.exitRates.linkedInterest` | ריבית צמודה למדד: `{שיעור}` מהריבית הריאלית, מנוכה בבנק |  |
| `guideBlocks.exitRates.hishtalmutExcess` | על הפקדה מעל הסכום המוטב: `{שיעור}` מהרווח הריאלי |  |
| `guideBlocks.exitRates.childProvident` | במסלול קופת גמל: `{שיעור}` מהרווח הריאלי |  |
| `guideBlocks.exitRates.childBankLinked` | בבנק, פיקדון צמוד למדד: `{שיעור}` מהרווח הריאלי |  |
| `guideBlocks.exitRates.childBankUnlinked` | בבנק, פיקדון לא צמוד: `{שיעור}` מהרווח הנומינלי |  |
| `guideBlocks.notComputed.text` | האתר עוד לא מחשב את זה | a tax step whose formula is pending |
| `guideBlocks.notComputed.releaseBefore` | יתווסף בגרסה `{מספר}` | Was "מתוכנן לגרסה `{מספר}`". The site's register for pending work is "יתווסף בהמשך"; the component appends the release number, so the number stays until the code drops it (none of today's records names a pending formula, so the line is a fallback) |
| `guideBlocks.regulatorNames.CMA · BoI · ISA · MoF` | רשות שוק ההון, ביטוח וחיסכון · בנק ישראל · רשות ניירות ערך · משרד האוצר |  |
| `guideBlocks.noGraph.missingBefore … missingAfter` | עוד לא נאספו נתונים ל`{חלק}` ולכן עוד אין גרף לעמוד הזה. | the callout in place of the empty graph card. Was "ולכן אין עדיין גרף" |
| `guideBlocks.noGraph.unknownCause` | הגרף של העמוד הזה עוד לא מחושב. |  |
| `guideBlocks.noGraph.parts.*` | תנאי הפיקדון · קרן מייצגת · תעריפון העמלות · סדרת האג״ח הממשלתית · דמי הניהול של מנהל החשבון · סוג ההעסקה בדוגמה · כל מה שהחישוב צריך | deposit · fund · tariff · series · ira · employment · other |
| `guideBlocks.terms.title` | תנאי המוצר בדוגמה | values sheet and panel |
| `guideBlocks.terms.line` | הערכים האלה נלקחו מהנתונים של האתר. אי אפשר לשנות אותם מכאן. | Was "נלקחו מרשומות האתר" |
| `guideBlocks.terms.labels.term · linkage · couponEvery` | תקופה · הצמדה · תדירות הקופון |  |
| `guideBlocks.terms.labels.tradeRate · tradeMin · tradeMax` | עמלת קנייה ומכירה · עמלת קנייה ומכירה, מינימום · עמלת קנייה ומכירה, מקסימום |  |
| `guideBlocks.terms.labels.custodyRate · custodyMin · custodyMax` | דמי ניהול פיקדון ניירות ערך · דמי ניהול פיקדון ניירות ערך, מינימום · דמי ניהול פיקדון ניירות ערך, מקסימום |  |
| `guideBlocks.terms.labels.fxRate · monthlyFee · iraManagerFee` | עמלת המרת מטבע · דמי חשבון קבועים · דמי ניהול של מנהל החשבון |  |
| `guideBlocks.terms.labels.fundManagement · fundVariable · fundTrustee` | דמי ניהול של הקרן · דמי ניהול משתנים של הקרן · שכר הנאמן של הקרן | trustee: was "דמי נאמנות של הקרן" |
| `guideBlocks.terms.labels.fundTracking · fundWithholding · fundHalfSpread` | פער המעקב של הקרן · מס זר שנגבה בתוך הקרן · חצי ממרווח הקנייה והמכירה |  |
| `guideBlocks.terms.labels.regBalance` | ממוצע דמי הניהול מחיסכון שנגבו בפועל בשנת `{שנה}` (לא תעריפון) | the regulator's average, as on the track page; "מחיסכון" is the glossary's term (was "מהנכסים") · changed 2026-10-24 (Hebrew editor); was ״(ממוצע שנגבה, לא מחירון)״ |
| `guideBlocks.terms.labels.regDeposit` | ממוצע דמי הניהול מהפקדה שנגבו בפועל בשנת `{שנה}` (לא תעריפון) | was "מההפקדות" · changed 2026-10-24 (Hebrew editor); was ״(ממוצע שנגבה, לא מחירון)״ |
| `guideBlocks.terms.labels.ninetyPercentTest` | מבחן 90% בקרן זרה | the name of the TXF test; the figure is part of the name |
| `guideBlocks.terms.linkage.unlinked · cpi · prime` | לא צמוד · צמוד למדד · צמוד לפריים |  |

Why "בשקלים של העתיד" rather than "נומינלי": the reader sees the difference in the label itself. The glossary still explains ריאלי and נומינלי where they appear in tax text.

### 3.6 Exposure guide page

| Element | Hebrew |
|---|---|
| Section headings | מה זה · איך מחזיקים את זה · סיכונים · מה לבדוק · מונחים |
| "How to hold it", line | המוצרים שבהם אפשר להחזיק את זה. ההשוואה ביניהם למטרה שלכם: בעמוד ״השוואה למטרה״. · changed 2026-10-24 (Hebrew editor); was ״המוצרים שבהם אפשר להחזיק את זה. השוואה ביניהם למטרה שלכם תתווסף בהמשך.״ |
| A product whose tax treatment is open | עוד לא ברור איך זה ממוסה כאן: שאלה פתוחה `{קוד}` · changed 2026-10-24 (Hebrew editor); was ״לא ברור עדיין״ |


**Added 2026-10-23, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `exposurePage.sections` | מה זה · איך מחזיקים את זה · סיכונים · מה לבדוק · מונחים | as the heading row above |
| `exposurePage.kinds.*` | מדד מניות · מדד אג״ח · מזומן ודומיו · תמהיל של כמה סוגי נכסים · סחורות · אחר | equity_index · bond_index · cash_like · mixed · commodity · other |
| `exposurePage.kindLabel · currencyLabel` | סוג · מטבע | record labels |
| `exposurePage.holdLine` | המוצרים שבהם אפשר להחזיק את זה. ההשוואה ביניהם למטרה שלכם: בעמוד ״השוואה למטרה״. | the approved line above; the build had "אלה המוצרים שיכולים להחזיק את זה. דירוג לפי המטרה שלכם עוד לא באתר." · changed 2026-10-24 (Hebrew editor); was ״המוצרים שבהם אפשר להחזיק את זה. השוואה ביניהם למטרה שלכם תתווסף בהמשך.״ |
| `exposurePage.holdNone` | עוד לא נאספו המוצרים שמחזיקים את זה. |  |
| `exposurePage.openTax` | עוד לא ברור איך זה ממוסה כאן: שאלה פתוחה | a blocked tag; the question codes follow as chips. The build had "המס על זה במוצר הזה הוא שאלה פתוחה" · changed 2026-10-24 (Hebrew editor); was ״לא ברור עדיין״ |
| `exposurePage.toGuide` | לעמוד המדריך |  |
| `exposurePage.noProse` | הטקסט של העמוד הזה עוד לא נכתב. | no prose file yet |
| `exposurePage.guideGroup` | עמודי מדריך על מה שהכסף מושקע בו | search-group and index heading |

### 3.7 Values for the graph

| Element | Hebrew |
|---|---|
| Sheet or panel title | ההנחות של הגרף |
| Fields | סכום היום · הפקדה חודשית · כמה שנים · תשואה בשנה · אינפלציה בשנה · גיל (לא חובה) · סוג ההעסקה (לא חובה) · changed 2026-10-24 (Hebrew editor); was ״סוג העסקה״ |
| Employment options | שכירים · עצמאים |
| State of a starting value | שדה שלא הזנתם הוא ערך התחלתי, פרמטר של האתר. (changed 2026-10-24, UX fix 17: one line above the fields; a field shows its own state only once entered) |
| State of an entered value | הזנתם · changed 2026-10-24 (Hebrew editor); was ״הוזן על ידך״ |
| Hint, return | התשואה ההתחלתית היא דוגמה, לא תחזית. |
| Hint, inflation | בכמה המחירים עולים בשנה, בממוצע. |
| Hint, age | מסמן בגרף גילים שבהם הכללים משתנים. |
| Hint, employment | מסמן בעמוד את החלקים שנוגעים לכם. |
| Note under the return field | תשואה שתזינו תסומן בגרף בקו מקווקו, כי היא שלכם ולא של האתר. |

| Age placeholder (`values.agePlaceholder`, from the approved mockup) | למשל 30 | a placeholder, not a value; the figure is an example and never enters a calculation |

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
| Row labels, from a source | מקור · פורסם על ידי · נבדק · בתוקף מתאריך · בתוקף עד · כלל (changed 2026-10-24, UX fix 9: noun labels, no hanging maqaf) |
| Row labels, calculated | נוסחה · ערכים שנכנסו לחישוב · כללים שנכנסו לחישוב |
| Entered, first line | הזנתם את הערך הזה. |
| Entered, the value it replaced | במקום: |
| Site parameter | למה הערך הזה · תאריך אישור (changed 2026-10-24, UX fix 9) |
| Stale, line | לא עודכן מאז `{תאריך}`. בדרך כלל מתעדכן `{כל יום / כל חודש / כל רבעון}`. |
| Unknown, line | `{הסיבה מהנתונים}` |


**Added 2026-10-23, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `provenance.stale.cadence.yearly` | כל שנה | a fourth cadence word |
| `provenance.unit.nis_per_month · pct_per_year` | בחודש · בשנה | unit words beside a figure in the sheet |
| `formulaNames.F-05` | ההפקדות לאורך הזמן | the formula's Hebrew name in the "נוסחה" row; the code stays beside it |
| `formulaNames.F-06` | ערך בכסף של היום |  |
| `formulaNames.F-08` | חשבון הכסף חודש אחרי חודש |  |
| `formulaNames.F-09` | השווי במשיכה |  |
| `formulaNames.F-11` | דמי ניהול מהפקדה |  |
| `formulaNames.F-15` | דמי ניהול מחיסכון |  |
| `formulaNames.F-16` | דמי ניהול לחודש |  |
| `formulaNames.F-21` | מס על ריבית פיקדון |  |
| `formulaNames.F-22` | מס על ריבית תוכנית חיסכון |  |
| `formulaNames.F-23` | קרן כספית: המס בזמן ההחזקה |  |
| `formulaNames.F-24` | מס על דמי ניכיון במק״מ |  |
| `formulaNames.F-25` | מס על קופון באג״ח ממשלתית |  |
| `formulaNames.F-26` | מס על ריבית בעו״ש |  |
| `formulaNames.F-27` | קופת גמל: אין מס כל עוד הכסף בפנים |  |
| `formulaNames.F-40` | מס על רווח במכירת ניירות ערך |  |
| `formulaNames.F-41` | מס על ריבית שנצברה בפיקדון במשיכה |  |
| `formulaNames.F-46` | קרן השתלמות: המס במשיכה |  |
| `formulaNames.F-50` | חיסכון לכל ילד: המס במשיכה |  |
| `formulaNames.F-51` | ניהול אישי: המס במשיכה |  |
| `formulaNames.F-33` | הפקדה בלי הטבת מס |  |
| `formulaNames.F-43` | מס נוסף על הכנסה גבוהה |  |
| `formulaNames.F-44` | מס במשיכה מקופת גמל להשקעה |  |
| `formulaNames.F-67` | הגרף בעמודי המדריך |  |
| `flags.G-02` | בסיס המס במשיכה: החוק לא אומר במפורש אם המס הוא על הרווח הריאלי. האתר מחשב לפי מה שהחברות המנהלות מנכות, ומציג גם את החלופה. | flags, one line each |
| `flags.G-11` | דמי ביטוח לאומי על הרווח במשיכה: עוד לא ברור אם חלים. האתר לא מחשב אותם. |  |
| `flags.G-14` | הוצאות ישירות של המסלול לא נאספו עדיין, ולכן לא נכללו בחישוב. |  |
| `flags.G-21` | חלק מהמס מוסדר דרך דוח שנתי, לא בניכוי במקור. |  |
| `flags.PF-13` | ההנחה בדמי הניהול הוארכה לחמש שנים לפחות, לפי חוזר הרשות. |  |
| `flags.TXK-OQ12` | מגיל הפרישה המוקדמת: האם מדרגות המס הנמוכות חלות על הרווח במשיכה, עוד לא ברור. האתר לא מחשב את ההקלה. | what an engine flag means, one line each; the code stays beside the words. "מגיל 60" is a **typed figure** (TXK OQ12) |
| `computedInputs.amountNow` | סכום היום | labels of the values a computation read ("ערכים שנכנסו לחישוב") |
| `computedInputs.monthly` | הפקדה חודשית |  |
| `computedInputs.years` | שנים |  |
| `computedInputs.grossReturn` | תשואה בשנה |  |
| `computedInputs.inflation` | אינפלציה בשנה |  |
| `computedInputs.balanceFee` | דמי ניהול מחיסכון |  |
| `computedInputs.depositFee` | דמי ניהול מהפקדה |  |
| `computedInputs.directExpenses` | הוצאות ישירות |  |
| `computedInputs.paidIn` | סך ההפקדות |  |
| `computedInputs.grossBalance` | השווי לפני דמי ניהול ומס |  |
| `computedInputs.realGain` | רווח ריאלי |  |
| `computedInputs.taxRate` | שיעור המס |  |
| `computedInputs.taxDuring` | מס בזמן ההחזקה |  |
| `computedInputs.taxAtExit` | מס במשיכה |  |
| `computedInputs.fees` | דמי ניהול |  |
| `computedInputs.net` | נשאר לכם |  |
| `computedInputs.index` | עליית המחירים עד אז |  |
| `computedInputs.altNominalRate` | שיעור המס על הרווח הנומינלי |  |
| `computedInputs.altTax` | החלופה: מס על הרווח הנומינלי |  |
| `computedInputs.about.headline` | מה שנשאר אחרי דמי ניהול ומס, אם מושכים בסוף התקופה | what a computed figure is, one line under its name |
| `computedInputs.about.net` | מה שנשאר אם מושכים בסוף שנה |  |
| `computedInputs.about.tax` | המס אם מושכים בסוף שנה |  |
| `computedInputs.about.fees` | דמי הניהול שנגבו עד סוף שנה |  |
| `computedInputs.about.contributions` | כל מה שהפקדתם עד סוף שנה |  |
| `computedInputs.about.realGain` | הרווח שמעבר לעליית המחירים, עד סוף שנה |  |
| `computedInputs.about.altTax` | המס לפי החלופה שהחוק מאפשר: אחוז קבוע מהרווח הנומינלי |  |

### 3.9 A rule

| Element | Hebrew |
|---|---|
| Title | כלל `{קוד}`: `{כותרת}` |
| Disclosure | תנאים וחריגים |
| Figures | סכומים לפי שנת מס |
| Source and dates | מקור · נבדק · ייבדק שוב (each label, then the date in the next cell) (changed 2026-10-24, UX fix 9) |
| Link | לכל הכללים |
| Open question, title | שאלה פתוחה: `{קוד}` |
| Open question, rows | מה עוד לא ידוע · מה מחכה לתשובה |
| Open question, last line | בינתיים האתר לא מחשב את זה. |


**Added 2026-10-23, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `rule.dimensions` | נוגע ל | before the dimension tags on a rule card |
| `rule.noText` | נוסח הכלל במילים פשוטות עוד לא נכתב; הכותרת מופיעה כפי שהיא במאגר הכללים. | data gap (data-inventory 3.4). "מאגר הכללים" everywhere, not "בסיס הכללים" |

**QA fixes (added 2026-10-23, for the founder's review).**

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `rule.topic` | נושא | row on a rule card that names the rule-base topic (see 3.14); it replaces the raw file name that the "מקור" row showed when a rule has no sourced figure. The "מקור" row now appears only when the rule has a figure with a source |

### 3.10 Companies list

| Element | Hebrew |
|---|---|
| Title | מה חברה מציעה לי |
| Lede | בחרו חברה כדי לראות את כל המוצרים והמסלולים שלה, ומה כל אחד מהם. |
| Filter label | חיפוש חברה |
| Row line | the product types it runs, from the glossary names: קופות גמל להשקעה · קרנות השתלמות · קרנות פנסיה … |
| No match | אין חברה בשם הזה. · changed 2026-10-24 (Hebrew editor); was ״לא מצאנו חברה בשם הזה.״ |
| Its link | לחיפוש בכל האתר |

### 3.11 Company page

| Element | Hebrew |
|---|---|
| Line under the title | כל מה שהחברה מציעה, עם הסבר לכל מסלול. המסלולים לפי נתוני רשות שוק ההון, ביטוח וחיסכון, נכון ל־`{חודש}`. (changed 2026-10-24, UX fix 28: maqaf) |
| Fees line (`company.feesLine`; replaced "Fees pending" on 2026-10-23, for the founder's review) | דמי הניהול שמופיעים ליד כל מסלול הם ממוצע של כל העמיתים במסלול, אחרי הנחות, לפי דיווח המסלול לרשות שוק ההון. לא בהכרח מה שתשלמו אתם. |
| List heading | כל המסלולים של `{חברה}` |
| Group count | `{מספר}` מסלולים |
| Track line | קופה `{מספר}` · במה הכסף מושקע: `{סיווג}` (changed 2026-10-24, audit A87: same word as the PC column) |
| Same-name banners | שני מסלולים באותו שם: שתי קופות נפרדות · אותו מסלול מופיע פעמיים · לא הוכרע: הנתונים לא מראים אם זו אותה קופה |
| Old data | נתוני הרשות לא עודכנו מאז `{חודש}`. |
| Paste card | לא מצאתם שם? · הקלידו או הדביקו את השם כמו שהוא מופיע באפליקציה, בפרסומת או בדוח. · למשל: גמל להשקעה כללי · changed 2026-10-24 (Hebrew editor); was ״הדביקו את השם כמו שהוא מופיע באפליקציה, בפרסומת או בדוח.״ |


**Added 2026-10-23, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `company.feeColumn` | דמי ניהול מחיסכון, ממוצע `{שנה}` | PC column head. Was "דמי ניהול ממוצעים מצבירה, `{שנה}`": the glossary's headword is "דמי ניהול מחיסכון" ("מצבירה" is listed as another name) |
| `company.feeRow` | דמי ניהול מחיסכון, ממוצע | label of the figure on a phone row |
| `company.feeRowWhole` | לקרן כולה | a pension fund's average belongs to the fund, not to the track |
| `company.subSpecialization` | התמחות: | the regulator's sub-specialisation field, shown as written until a plain-Hebrew exposure line is sourced |
| `catalogue.alsoCalled` | נקרא גם | catalogue lines on the company and track pages |
| `catalogue.seenAt · seenOn` | מקור: · · נראה ב־ | where a catalogue name was seen |
| `catalogue.unassigned.title` | שמות שעוד לא שויכו |  |
| `catalogue.unassigned.line` | שמות שהחברה משתמשת בהם ושעוד לא שויכו למסלול בנתוני הרשות. | Was "למסלול ברשות" · changed 2026-10-24 (Hebrew editor); was ״שמות שהחברה משתמשת בהם ועוד לא הצלחנו לשייך למסלול בנתוני הרשות.״ |
| `catalogue.search` | שם מהקטלוג | search-group heading |

**From the approved company mockup (2026-10-23), not new wording;** listed so the files diff:

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `company.pcColumns.name · fund · classification · holds · open · group` | שם המסלול, כמו שהחברה כותבת אותו · קופה · סיווג · במה הכסף מושקע · פתיחה · קבוצה | PC table headings |
| `company.productType` | סוג המוצר | PC side card |
| `company.whatIs` | מה זה | the "מה זה `{מוצר}`" link under a group |
| `company.tracks.one · two · many` | מסלול אחד · שני מסלולים · `{מספר}` מסלולים | the group count's plural forms (section 1) |
| `guide.pcChooseHint` | בחרו מסלול כדי לראות את כל הפרטים ומה לבדוק | PC, before a track is chosen |

### 3.12 Track page

| Element | Hebrew |
|---|---|
| Line under the title | קופה `{מספר}` |
| Default tag | ברירת המחדל |
| Record labels | חברה מנהלת · סוג מוצר · סיווג · במה הכסף מושקע · דמי ניהול מחיסכון · דמי ניהול מהפקדה · נכון לחודש |
| Fee labels (`track.feeBalanceLabel` · `track.feeDepositLabel`; replaced "Fee pending" on 2026-10-23, for the founder's review) | ממוצע דמי הניהול מחיסכון שנגבו בפועל בשנת `{שנה}` · ממוצע דמי הניהול מהפקדה שנגבו בפועל בשנת `{שנה}` |
| Same name elsewhere | יש מסלול נוסף באותו שם. `{התשובה מהנתונים}` |
| Its link | למסלול השני |
| Link to the guide | לעמוד המדריך על `{מוצר}` |


**Added 2026-10-23, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `track.labels.population · inception` | למי מיועד · נפתח ב־ | two more record labels from the regulator's data |
| `track.feeWhole` | לקרן כולה | appended to both fee labels on a pension track |
| `track.feeNotReported` | עוד לא דווח | an empty fee field is not zero. Was "טרם דווח" |

### 3.13 Not covered yet

| Element | Hebrew |
|---|---|
| Title | מה האתר עוד לא מכסה |
| Lede | מוצרים שהאתר מכיר אבל עוד לא יכול להסביר עד הסוף, ולמה. · changed 2026-10-24 (Hebrew editor); was ״מוצרים שאנחנו מכירים אבל עוד לא יכולים להסביר עד הסוף, ולמה.״ |
| Card rows | מה ידוע · מה עוד פתוח · למה זה חשוב |
| Each product's line | its one-line explanation from `docs/glossary.md` |
| Empty list | כרגע האתר מכסה את כל המוצרים שהוא מכיר. |


**Added 2026-10-23, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `rulesPage.filter · filterNone · filterMatching · ruleCount` | חיפוש כלל לפי מספר, כותרת או טקסט · אין כלל שמתאים לחיפוש. · תואמים · כלל אחד / כללים | added 2026-10-24 (UX fix 15): the rules page groups are collapsible with a filter field above them |
| `notCovered.notice · blockedTag` | הכללים לכל המוצרים כאן עוד בבדיקה. עד שייסגרו, האתר לא מחשב אותם. · לא מחושב | added 2026-10-24 (UX fix 16): one blocked notice at the top and a small tag per card; `openLine` is no longer shown per card |
| `notCovered.openLine` | הכללים לזה עוד בבדיקה. עד שייסגרו, האתר לא מחשב אותו. | where no open-question text exists in Hebrew yet. Was "…האתר לא מחשב עליו כלום." |
| `notCovered.alsoCalled` | נקרא גם |  |

### 3.14 Rules page

| Element | Hebrew |
|---|---|
| Title | כללים |
| Lede | כל כלל שהאתר משתמש בו, עם המקור שלו. כלל שהמקור שלו חלש יותר מסומן, ושאלה פתוחה מסומנת במנעול. |
| Group's open questions | שאלות פתוחות בנושא הזה |
| Re-check line | ייבדק שוב ב־`{תאריך}` |


**Added 2026-10-23, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `rulesPage.groups[tax-general.md]` | מס: כללי | the topic's Hebrew name, from the rule base's index |
| `rulesPage.groups[tax-interest-deposits-bonds.md]` | מס: ריבית, פיקדונות ואג״ח |  |
| `rulesPage.groups[tax-securities-israeli.md]` | מס: ניירות ערך וקרנות ישראליות |  |
| `rulesPage.groups[tax-securities-foreign.md]` | מס: ניירות ערך וקרנות זרות |  |
| `rulesPage.groups[tax-pension-gemel-lekitzba.md]` | מס: פנסיה וקופת גמל לקצבה |  |
| `rulesPage.groups[tax-hishtalmut.md]` | מס: קרן השתלמות |  |
| `rulesPage.groups[tax-gemel-lehashkaa-ira-child.md]` | מס: קופת גמל להשקעה, ניהול אישי וחיסכון לכל ילד |  |
| `rulesPage.groups[bank-current-account-deposits.md]` | עובר ושב ופיקדונות |  |
| `rulesPage.groups[mutual-funds-and-money-market-funds.md]` | קרנות נאמנות וקרנות כספיות |  |
| `rulesPage.groups[etfs-and-index-funds.md]` | קרנות סל וקרנות מחקות |  |
| `rulesPage.groups[brokerage-account.md]` | חשבון השקעות |  |
| `rulesPage.groups[government-bonds-and-makam.md]` | אג״ח ממשלתיות ומק״מ |  |
| `rulesPage.groups[kupat-gemel-lehashkaa.md]` | קופת גמל להשקעה |  |
| `rulesPage.groups[keren-hishtalmut.md]` | קרן השתלמות |  |
| `rulesPage.groups[pension-and-gemel-lekitzba.md]` | פנסיה וקופת גמל לקצבה |  |
| `rulesPage.groups[child-savings.md]` | חיסכון לכל ילד |  |
| `rulesPage.groups[ira-self-directed.md]` | ניהול אישי |  |
| `rulesPage.groups[provident-family-common.md]` | כללים משותפים לקופות הגמל |  |
| `rulesPage.groups[regulators-and-protection.md]` | מי מפקח ומה מוגן |  |
| `rulesPage.groups[tracks-catalogue-and-decoder.md]` | מסלולים והקטלוג |  |

**QA fixes (added 2026-10-23, for the founder's review).** A rule's title in lists and cards is the record's `title_he`, else the first sentence of its Hebrew text, else the English title (no new string).

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `rulesPage.groups[bank-product-names.md]` | שמות מוצרים בכל בנק | the topic names of the files the first table missed |
| `rulesPage.groups[switching-and-transfers.md]` | מעבר בין גופים והעברת כספים |  |
| `rulesPage.groups[corporate-bonds.md]` | אג״ח קונצרניות |  |
| `rulesPage.groups[fx-and-structured-deposits.md]` | מט״ח ופיקדונות מובנים |  |
| `rulesPage.groups[managed-and-robo-portfolios.md]` | תיקים מנוהלים ותיקים דיגיטליים | · changed 2026-10-24 (Hebrew editor); was ״תיקים מנוהלים ויועץ אוטומטי״ |
| `rulesPage.groups[reits-and-gold-funds.md]` | קרנות ריט וקרנות זהב |  |
| `rulesPage.groups[savings-policies-and-executive-insurance.md]` | פוליסות חיסכון וביטוח מנהלים |  |
| `rulesPage.groups[tax-insurance-and-amendment-190.md]` | מס: ביטוח ותיקון 190 |  |
| `rulesPage.groups[tax-tier2-other.md]` | מס: מט״ח, אג״ח קונצרניות, ריט, זהב ותיקים מנוהלים | · changed 2026-10-24 (Hebrew editor); was ״מט״ח, אג״ח קונצרניות, ריט וזהב ותיקים מנוהלים״ |
| `rulesPage.topicOther` | נושא נוסף במאגר הכללים | a file with no name in the map: never a file name on the page |

### 3.15 Parameters page

| Element | Hebrew |
|---|---|
| Title | פרמטרים של האתר |
| Lede | החלטות שהאתר מקבל בעצמו, כמו מתי שתי אפשרויות נחשבות שקולות. הן לא כללים מהחוק, ואי אפשר לשנות אותן מהעמוד. |
| Card rows | למה · תאריך אישור · משמש ב: (changed 2026-10-24, UX fix 9) |
| Provisional | ערך זמני שהאתר קבע |
| Not set | עוד לא נקבע |


**Added 2026-10-23, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `parametersPage.names.P-01` | סף תיקו | the parameter's Hebrew name (method.md names them in English) |
| `parametersPage.names.P-02` | גבולות בדיקת הרגישות |  |
| `parametersPage.names.P-03` | ספי ההכרעה על דמי ניהול |  |
| `parametersPage.names.P-04` | התאמת סיווג מסלול לטווח |  |
| `parametersPage.names.P-05` | התרחיש לדוגמה בעמודי המדריך |  |
| `parametersPage.names.P-06` | סטייה מותרת בבדיקות |  |

**QA fixes (added 2026-10-23, for the founder's review).** Every parameter field now has a Hebrew label instead of its key; `{name}`, `{row}` and `{preset}` are filled in from the record (the assumption, the classification, the preset's name). Years read "שנה / שנתיים / {n} שנים", a multiplier "×{n}", a rate "בשנה" or "בחודש" after it.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `parametersPage.names[P-07]` | נקודות ההתחלה של טופס המטרה | the title of the goal-preset parameter (it showed the id "goal-presets") |
| `parametersPage.noCeiling` | ללא תקרה | a horizon bound that is empty |
| `parametersPage.yearsWord` | שנים | after a signed number of years (the sensitivity bound for the horizon) |
| `parametersPage.boundNames[A-01]` | תשואה שנתית ברוטו (A-01) | the assumption names are those of method.md 2.2 |
| `parametersPage.boundNames[A-02]` | אינפלציה שנתית (A-02) | the assumption names are those of method.md 2.2 |
| `parametersPage.boundNames[A-03]` | שינוי שער המטבע מול השקל (A-03) | the assumption names are those of method.md 2.2 |
| `parametersPage.boundNames[A-06]` | עלות בתוך הקרן (A-06) | the assumption names are those of method.md 2.2 |
| `parametersPage.boundNames[fee_rates]` | מכפיל של כל עמלה | the assumption names are those of method.md 2.2 |
| `parametersPage.boundNames[horizon]` | שינוי באופק, בשנים | the assumption names are those of method.md 2.2 |
| `parametersPage.fields[P-01.value]` | הפרש יחסי שמתחתיו שתי אפשרויות שקולות |  |
| `parametersPage.fields[P-02.bounds.lo]` | {name}: הגבול התחתון |  |
| `parametersPage.fields[P-02.bounds.hi]` | {name}: הגבול העליון |  |
| `parametersPage.fields[P-03.negotiate_nis]` | עלות לאורך האופק שמעליה שווה להתמקח | · changed 2026-10-24 (Hebrew editor); was ״עלות לאורך האופק שמעליה שווה לנהל משא ומתן״ |
| `parametersPage.fields[P-03.avoid_nis]` | עלות לאורך האופק שמעליה שווה להימנע |  |
| `parametersPage.fields[P-03.negotiate_share]` | חלק מכלל העלות (סף ההתמקחות) | · changed 2026-10-24 (Hebrew editor); was ״חלק מכלל העלות (סף משא ומתן)״ |
| `parametersPage.fields[P-04.table.horizon_min_years]` | סיווג {row}: אופק מינימלי |  |
| `parametersPage.fields[P-04.table.horizon_max_years]` | סיווג {row}: אופק מקסימלי |  |
| `parametersPage.fields[P-04.table.max_fall_pct]` | סיווג {row}: ירידה מרבית מקובלת |  |
| `parametersPage.fields[P-05.inputs.amount_now]` | סכום התחלתי |  |
| `parametersPage.fields[P-05.inputs.monthly_deposit]` | הפקדה חודשית |  |
| `parametersPage.fields[P-05.inputs.horizon_years]` | אופק |  |
| `parametersPage.fields[P-05.inputs.A-01]` | תשואה שנתית ברוטו למוצרי שוק (A-01) |  |
| `parametersPage.fields[P-05.inputs.A-02]` | אינפלציה שנתית (A-02) |  |
| `parametersPage.fields[P-05.inputs.cash_rate]` | ריבית למוצרים דמויי מזומן |  |
| `parametersPage.fields[P-05.inputs.annual_income]` | הכנסה שנתית ברוטו |  |
| `parametersPage.fields[P-05.sliders.monthly_deposit.min]` | מחוון ההפקדה החודשית: מינימום |  |
| `parametersPage.fields[P-05.sliders.monthly_deposit.max]` | מחוון ההפקדה החודשית: מקסימום |  |
| `parametersPage.fields[P-05.sliders.monthly_deposit.step]` | מחוון ההפקדה החודשית: גודל צעד |  |
| `parametersPage.fields[P-05.sliders.horizon_years.min]` | מחוון האופק: מינימום |  |
| `parametersPage.fields[P-05.sliders.horizon_years.max]` | מחוון האופק: מקסימום |  |
| `parametersPage.fields[P-05.sliders.horizon_years.step]` | מחוון האופק: גודל צעד |  |
| `parametersPage.fields[P-05.ranges.age.min]` | גיל מותר בשדה: מינימום |  |
| `parametersPage.fields[P-05.ranges.age.max]` | גיל מותר בשדה: מקסימום |  |
| `parametersPage.fields[P-05.ranges.pct.min]` | אחוז שנתי מותר בשדה: מינימום |  |
| `parametersPage.fields[P-05.ranges.pct.max]` | אחוז שנתי מותר בשדה: מקסימום |  |
| `parametersPage.fields[P-06.abs_nis]` | סטייה מותרת בשקלים |  |
| `parametersPage.fields[P-06.rel_pct]` | סטייה מותרת באחוזים |  |
| `parametersPage.fields[P-07.presets.horizon_years]` | {preset}: כמה שנים |  |
| `parametersPage.fields[P-07.presets.monthly_deposit]` | {preset}: הפקדה חודשית |  |
| `parametersPage.fields[P-07.presets.must_stay_available_share]` | {preset}: החלק שנשאר זמין |  |
| `parametersPage.fields[P-07.presets.withdrawable_any_time]` | {preset}: חייב להיות ניתן למשיכה בכל רגע |  |
| `parametersPage.fields[P-07.ranges.horizon_years.min]` | מחוון השנים: מינימום |  |
| `parametersPage.fields[P-07.ranges.horizon_years.max]` | מחוון השנים: מקסימום |  |
| `parametersPage.fields[P-07.ranges.horizon_years.step]` | מחוון השנים: גודל צעד |  |

---

## 4. System messages

| Case | Hebrew |
|---|---|
| The calculation failed | האתר לא הצליח לחשב את הגרף. רעננו את העמוד ונסו שוב. · changed 2026-10-24 (Hebrew editor); was ״לא הצלחנו לחשב את הגרף. רעננו את העמוד ונסו שוב.״ |
| Page not found | העמוד הזה לא קיים. אולי הקישור ישן. · לעמוד הראשי · לחיפוש |
| Something went wrong (any failure other than an unknown address; `system.wentWrong`) | משהו השתבש · האתר לא הצליח להציג את העמוד הזה. אפשר לרענן, או לחזור לעמוד הראשי. · לעמוד הראשי · לרענן את העמוד | changed 2026-10-24 (UX fix, leftovers task 1): new page inside the shell. The root error boundary no longer shows the chart-failure line; an unknown id (missing `.data` file) shows "Page not found" · changed 2026-10-24 (Hebrew editor); was ״לא הצלחנו להציג את העמוד הזה.״ |
| Data older than its cadence (page banner) | חלק מהנתונים בעמוד לא עודכנו מאז `{תאריך}`. הם מסומנים בשעון. |
| Calculation not loaded yet (field state) | טוען… |
| A catalogued fund number no longer in the regulator's data | לא נמצא בנתוני הרשות |

---

## 5. Localisation notes

- Placeholders in braces are filled by the site with value objects; never by typed figures.
- Strings that hold a Latin word or a code (S&P 500, TXK OQ10, ISIN) wrap it in an isolating element.
- Labels are short on purpose: the phone width allows about 18 Hebrew characters on a segmented-control button and 30 on a chip.


---

## 6. Release 2 screens

Added 2026-10-23 for the briefs in `docs/flows.md` section 9 and the handoff in `docs/design-spec.md` sections 6 to 10. Same voice and conventions as section 1: plural imperative, no typed figures (every `{…}` is a value object with its state), names as the source writes them, codes after the words. Product and option names in these strings come from `docs/glossary.md` (for example "קופת גמל להשקעה", "חשבון השקעות", "מק״מ"). Status: **draft** (2026-10-23), to be settled by the founder as section 3 was.

### 6.0 Everywhere in release 2

| Element | Hebrew |
|---|---|
| Menu row and footer link | השוואה למטרה |
| First page, third door | כסף שיושב בעו״ש |
| Third door, line | שני מספרים, ותראו כמה עולה להשאיר אותו שם |
| Preset names (D13) | עתודה נזילה · קנייה במועד ידוע · הון לטווח ארוך · סכום חד־פעמי · חיסכון לילד · בלי נקודת התחלה |
| Outcome names, five (F-83) | דורגה · מוצגת, לא מדורגת · נפסלה לפי האילוץ שלכם · לא מתאימה לכם · עוד לא נבדקה |
| Outcome names, plural (coverage sentence) | דורגו · מוצגות בלי דירוג · נפסלו לפי האילוצים שלכם · לא מתאימות לכם · עוד לא נבדקו |
| Deciding formulas (F-80) | הטבת מס בהפקדה · דמי ניהול · מס ביציאה · נעילה |
| Tie, one | שקולה ל־`{שם}` |
| Tie, several | שקולות: `{שמות}` |
| Locked tag | נעול עד `{תאריך}` |
| Real value at the horizon, label | נשאר לכם במועד המטרה, בכסף של היום |
| Same, nominal | נשאר לכם במועד המטרה, בשקלים של העתיד |
| Saved on the device | נשמר במכשיר הזה |
| Saved automatically | נשמר אוטומטית במכשיר הזה. בלי חשבון, בלי שרת. |
| Could not save | האתר לא הצליח לשמור במכשיר הזה. ההשוואה תעבוד, אבל המטרה לא תישמר. · changed 2026-10-24 (Hebrew editor); was ״לא הצלחנו לשמור במכשיר הזה. ההשוואה תעבוד, אבל המטרה לא תישמר.״ |


**Note 2026-10-23.** The menu row, footer link and third door above are now in `copy.ts` (`site.menuItems`, `site.footer`, `home.door3`); the third door was added after the founder approved the first page with two doors, so it is for review as a door, not only as words.

### 6.1 Goal form

| Element | Hebrew |
|---|---|
| Title | מה המטרה שלכם? |
| Lede | בחרו נקודת התחלה או מלאו בעצמכם. כל ערך אפשר לשנות, והכול נשמר במכשיר הזה. |
| Preset row label (screen reader) | נקודת התחלה |
| After a preset is chosen | מילאנו `{רשימת שדות}` כנקודת התחלה. שנו מה שמתאים. |
| Preset chosen, fields already entered kept | מה שהזנתם נשמר. · changed 2026-10-24 (Hebrew editor); was ״שמרנו על מה שהזנתם.״ |
| `r2.form.childAge` | בן/בת כמה הילד? (או שנת לידה) | new 2026-10-24 (scenario fix): asked only with the child preset; the horizon is 18 minus the age |
| `r2.form.childAgeHint` · `childAgeEmpty` | האופק הוא 18 פחות הגיל. · בלי גיל האופק הוא 18 שנים, פרמטר של האתר. | new 2026-10-24 (scenario fix) |
| `r2.form.errChildAge` | הזינו גיל בין 0 ל־17, או שנת לידה. | new 2026-10-24 (scenario fix), error |
| `r2.form.targetCost` · `targetCostHint` | כמה זה יעלה, בערך · לא חובה. התוצאה תראה אם הסכום מספיק, בלי להשפיע על הדירוג. | new 2026-10-24 (scenario fix): asked only with the known-date preset |
| `r2.form.couple` | הטופס לאדם אחד. לזוג: הזינו את הסכומים המשותפים, ואת הפרטים של מי שהחיסכון על שמו. | new 2026-10-24 (scenario fix): one line under the amount fields |
| `r2.form.worstFallShort` | לטווח של `{n}` שנים האתר לא מדרג מסלולים מנייתיים בלי תשואה שתזינו; השדה הזה משפיע רק עליהם. | new 2026-10-24 (scenario fix): shown under the worst-fall field when the horizon is below P-04's equity minimum |
| Card 1 title | המטרה |
| Fields, card 1 | שם המטרה (לא חובה) · כמה שנים עד המטרה · סכום היום · הפקדה חודשית · כמה צריך להישאר זמין מיד · מאיזה תאריך |
| Hint, must stay available | החלק הזה נשאר בעו״ש או בקרן כספית יומית, ולא נכנס להשוואה. |
| Constraints heading | אילוצים |
| Constraint switch | חייב להיות ניתן למשיכה בכל רגע |
| Constraint, blocked row | בלי צורך בדוח שנתי למס: עוד אי אפשר לבדוק. שאלה פתוחה TXG OQ4 · changed 2026-10-24 (Hebrew editor); was ״עדיין לא ניתן לבדוק. שאלה פתוחה״ |
| Loss filter, later | כמה ירידה תסכימו לספוג: יתווסף בהמשך. |
| Card 2 title | קצת עליכם |
| Card 2, why | למה שואלים: תקרות ההפקדה והטבות המס תלויות בשכר ובהפרשות. |
| Fields, card 2 | גיל · סוג ההעסקה · שכר חודשי ברוטו · הפרשות לפנסיה · הפרשות לקרן השתלמות · יש לכם פנסיה דרך העבודה? · יש לכם קרן השתלמות דרך העבודה? · changed 2026-10-24 (Hebrew editor); was ״סוג העסקה״ |
| Percent pair sub-labels | מעסיק · עובד |
| Self-employed hishtalmut field | הפקדה שנתית לקרן השתלמות |
| Yes / no | כן · לא |
| Payslip disclosure | איפה זה בתלוש |
| Payslip disclosure, body | the text of rule PEN-36 from the rule base, then its chip, then: |
| Payslip disclosure, last line | השמות המדויקים בתלוש משתנים בין מעסיקים. האתר עוד לא מצא להם מקור רשמי. · changed 2026-10-24 (Hebrew editor); was ״עוד לא מצאנו להם מקור רשמי.״ |
| Card 3 title | ההנחות |
| Fields, card 3 | תשואה שנתית על החלק המושקע · אינפלציה בשנה |
| Return, empty | לא הוזן: האתר לא מנחש תשואה. |
| Return, hint | הזינו את התשואה שאתם מניחים. היא תסומן בכחול בכל מקום שבו היא משפיעה. |
| Return, filled | תשואה שהזנתם תסומן בגרף בקו מקווקו, כי היא שלכם ולא של האתר. |
| Inflation, start | ערך התחלתי, פרמטר של האתר | (now the one line above the fields, changed 2026-10-24, UX fix 17)
| Button | להשוואה |
| Goals list heading | המטרות שלכם |
| Goals list, line | המטרות נבדקות אחת אחת, לפי הסדר. הראשונה מקבלת את הכסף קודם. |
| Add a goal | מטרה נוספת |
| Move up / down (screen-reader names) | להזיז למעלה · להזיז למטה |
| Remaining-balance hint on a second goal | נשארו `{סכום}` אחרי המטרות הקודמות. |

**Errors** (in addition to 3.7):

| Case | Hebrew |
|---|---|
| Horizon under one year | הזינו לפחות שנה אחת. |
| Available above the amount now | החלק הזמין גדול מהסכום היום. · changed 2026-10-24 (Hebrew editor); was ״גדול מהסכום היום.״ |
| Percent above 100 | הזינו אחוז בין 0 ל־ `{מקסימום}`. · changed 2026-10-24 (Hebrew editor); was ״הזינו אחוז עד״ |
| Salary negative | השכר לא יכול להיות שלילי. |


**Added 2026-10-23, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `r2.form.filledNames.*` | שנים · הפקדה חודשית · החלק שנשאר זמין · אילוץ המשיכה | the field names in "מילאנו `{רשימת שדות}` כנקודת התחלה" |
| `r2.form.payslipNoRule` | הטקסט של הכלל הזה עוד לא נמצא במאגר הכללים של האתר. | when PEN-36 is not in the rule base |
| `r2.form.insurance` | דמי הביטוח בקרן הפנסיה, כאחוז מההפקדות | field label (A-17, entered by the person, G-12). Was "עלות ביטוח בקרן הפנסיה (% מההפקדות)": "דמי ביטוח" is the glossary's term (PEN-15), and no brackets |
| `r2.form.insuranceHint` | כיסוי למקרה מוות או נכות שיורד מהחיסכון כל חודש. בלי המספר הזה האתר לא משווה קרן פנסיה, כי הוא לא מנחש אותו. בקופת גמל לקצבה אין ביטוח כזה, ולכן היא לא צריכה אותו. | Was "בלי המספר הזה אי אפשר להשוות קרן פנסיה, והאתר לא מנחש אותו. קופת גמל לקצבה בלי ביטוח, ולכן לא צריכה אותו.": says what the number is first (PEN-15), and the last sentence had no verb. The provident fund for annuity has no pooled insurance (PEN-35) · changed 2026-10-24 (Hebrew editor); was ״כיסוי למקרה מוות ונכות שיורד מהחיסכון כל חודש.״ |
| `r2.form.insuranceEmpty` | לא הוזן: קרנות הפנסיה יסומנו ״עוד לא נבדקה״. | Was "…יופיעו כ״עוד לא נבדקה״." |
| `r2.form.ageUp · ageDown` | להגדיל את הגיל בשנה · להקטין את הגיל בשנה | screen-reader names of the age stepper. Were "גיל, להגדיל באחד · גיל, להקטין באחד" |
| `r2.form.errYearsWhole` | הזינו מספר שלם של שנים. | error |

### 6.2 Comparison result

| Element | Hebrew |
|---|---|
| Title | `{שם המטרה}`: מה הכי מתאים |
| Recomputed line (strip) | חושב מחדש עם הנתונים של היום. |
| Headline pattern | `{אפשרות}` היא הטובה ביותר למטרה הזו, כי `{סיבה}`. |
| Reason: fee drag | דמי הניהול בה נמוכים יותר: `{סכום}` לעומת `{סכום}` ב־`{שנים}` |
| Reason: tax at exit | המס ביציאה בה נמוך יותר: `{סכום}` לעומת `{סכום}` |
| Reason: deposit-side relief | ההפקדה אליה מזכה בהטבת מס ששווה `{סכום}`, לעומת `{סכום}` |
| Reason: lock-up | הכסף בה זמין במועד המטרה, בעוד `{אפשרות}` נעולה עד `{תאריך}` |
| Headline, secondary-source winner | the headline, then the tag: לפי מקור משני |
| Headline, tie | `{אפשרות}` ו`{אפשרות}` שקולות למטרה הזו: ההפרש ביניהן `{אחוז}`, פחות מסף התיקו של האתר, `{אחוז}`. |
| Headline, all tied | כל האפשרויות שדורגו שקולות למטרה הזו: ההפרשים ביניהן קטנים מסף התיקו של האתר, `{אחוז}`. |
| Headline, only the baseline | רק העו״ש יכול להיות מדורג למטרה הזו: `{סיבה}`. |
| Why button | למה |
| Why sheet, title | למה `{אפשרות}` לפני `{אפשרות}` |
| Why sheet, rows | הטבת מס בהפקדה · דמי ניהול · מס בזמן ההחזקה · מס ביציאה · נעילה · נשאר לכם |
| Why sheet, deciding mark | מכריע |
| Why sheet, differing dimensions | מה הבדיל ביניהן |
| Ranked list heading | לפי הסדר |
| Rank (screen-reader name) | מקום `{מספר}` |
| Deciding line | מכריע לעומת האפשרות שמעליה: `{נוסחה}`, `{סכום}` לעומת `{סכום}` · changed 2026-10-24 (Hebrew editor); was ״מכריע לעומת הקודמת:״ |
| Row's assumptions (screen-reader name) | ההנחות של השורה |
| Row detail (screen-reader name) | פירוט |
| Secondary-source tag on a row | המס ביציאה לפי מקור משני |
| Available card | `{סכום}` נשארים זמינים בעו״ש ושווים `{סכום}` במועד המטרה, בכסף של היום. |
| Listed heading | מוצגות בלי דירוג |
| Listed reasons | שכירים: מופקדת רק דרך המעסיק · נעולה עד `{תאריך}`: הערך במועד השחרור · בתקרה השנתית נכנס רק חלק מהכסף: `{סכום}` עוברים למטרה הבאה · המס ביציאה חסום: שאלה פתוחה `{קוד}` · מוחזקת בתוך `{מוצר}`, ונבדקת כמוהו · changed 2026-10-24 (Hebrew editor) · ״התקרה השנתית לוקחת רק חלק מהכסף:״ · ״מוחזקת ב״ |
| Listed value labels | במועד השחרור · לפני מס |
| Pin to chart | להציג בגרף · להסיר מהגרף |
| Chart title | הכסף לאורך הזמן, באפשרויות המובילות |
| Chart's screen-reader name | גרף: `{מספר}` אפשרויות לאורך `{שנים}`. הנתונים המלאים בטבלה. |
| Chart marker, horizon | מועד המטרה |
| Chart, tie bracket | שקולות |
| Chart caption, entered return | הקווים המקווקווים מבוססים על תשואה שהזנתם, לא על הערכה של האתר. |
| Chart, nothing to draw | אין אפשרויות מדורגות להצגה. |
| Assumption chips | שנים · סכום היום · הפקדה חודשית · זמין מיד · תשואה · אינפלציה · כל ההנחות |
| Assumptions sheet title | ההנחות של ההשוואה |
| Coverage sentence | נבדקו `{מספר}` אפשרויות: `{מספר}` דורגו, `{מספר}` מוצגות בלי דירוג, `{מספר}` לא מתאימות לכם, `{מספר}` נפסלו לפי האילוצים שלכם, `{מספר}` עוד לא נבדקו. |
| Coverage, open / close | כל האפשרויות ולמה · הסתרת הרשימה |
| Coverage groups | לא מתאימות לכם · נפסלו לפי האילוצים שלכם · עוד לא נבדקו · מוצגות בלי דירוג · דורגו |
| Coverage reasons, not evaluated | אין עדיין תנאים של תוכניות חיסכון · הפקדות חודשיות לקרן כספית מתחדשת עוד לא מוגדרות · לא נכלל בהשוואה המהירה · עוד לא מכוסה: שאלות פתוחות · הזינו תשואה · הזינו שכר · הנתון לא עודכן: `{כלל}` · changed 2026-10-24 (Hebrew editor); was ״עוד לא מכוסה, שאלות פתוחות״ |
| Coverage reasons, not eligible | מקבל רק את הכספים מהביטוח הלאומי ואת הפקדת ההורה, לא את הכסף הזה · פתוח רק ל`{קבוצה}` · changed 2026-10-24 (Hebrew editor); was ״מקבל רק את הכספים מביטוח לאומי ואת הפקדת ההורה״ |
| Coverage reason, excluded | נפסלה לפי האילוץ: `{אילוץ}` · changed 2026-10-24 (Hebrew editor); was ״נפסל לפי האילוץ:״ |
| Coverage, group line | `{קבוצה}`: `{מספר}` מוחזקות אחת־אחת, השאר לא |
| Coverage, last line | המסלולים והקרנות בתוך כל מוצר מושווים בעמודים ״כל המסלולים בכל החברות״ ו״איזו קרן לקנות״. · changed 2026-10-24 (Hebrew editor); was ״המסלולים והקרנות בתוך כל מוצר מופיעים בעמודי החברות. ההשוואה ביניהם תתווסף בהמשך.״ |
| Sensitivity title | מה היה משנה את התשובה |
| Sensitivity, flips | מתהפך אם `{הנחה}` תעבור מ־`{ערך}` ל־`{ערך}`: אז `{אפשרות}` ראשונה. |
| Sensitivity, breaks a tie | מפריד בין השקולות אם `{הנחה}` תעבור מ־`{ערך}` ל־`{ערך}`: אז `{אפשרות}` ראשונה. |
| Sensitivity, no flip | לא מתהפך בטווח שנבדק: `{מ}` עד `{עד}`. |
| Sensitivity, blocked | לא נבדק: שאלה פתוחה `{קוד}` |
| Sensitivity, assumption names | תשואה שנתית · אינפלציה · שער החליפין · העלות בתוך הקרן · `{שם העמלה}` · שנים עד המטרה |
| Sensitivity, footer | הטווחים הם פרמטר של האתר, ואי אפשר לשנות אותם כאן. · changed 2026-10-24 (Hebrew editor); was ״הטווחים הם פרמטר של האתר ולא ניתנים לשינוי כאן.״ |
| Sensitivity suggestion in a field | הצעה מהבדיקה · לאמץ |
| Checklist title | מה לבדוק |
| Checklist row, which options | השפיע על: `{אפשרויות}` |
| Nothing ranked | אף אפשרות לא דורגה למטרה הזו. |
| Nothing ranked, line | הסיבות העיקריות: `{סיבות}`. |
| Constraint excludes everything | האילוצים שלכם פוסלים את כל האפשרויות: `{אילוץ}`. |
| Its link | לשינוי האילוצים |
| Stale input on a row | מבוסס על נתון שלא עודכן מאז `{תאריך}`. |
| Loading the goal | טוען את המטרה השמורה… |


**Added 2026-10-23, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `r2.result.headlineBare` | `{אפשרות}` היא הטובה ביותר למטרה הזו. | when the deciding formula does not favour the winner, so no reason is claimed |
| `r2.result.headlineSingle` | `{אפשרות}` היא האפשרות היחידה שדורגה למטרה הזו. |  |
| `r2.result.whyNone` | אין הבדל בין הכללים ששתי האפשרויות נשענות עליהם. | why sheet, no differing dimension. Was "עליהן" |
| `r2.result.availableIn.money-market-fund-daily` | בקרן כספית יומית | the available card when the kept part sits in a daily fund ("בעו״ש" is the other) |
| `r2.result.availableNoRun` | ועוד אין לאתר תנאים לחשב כמה הם שווים במועד המטרה. | the available card without a run |
| `r2.result.chipEmpty` | לא הוזן | the chip of an empty field |
| `r2.result.reasons.enterInsurance · enterAge · enterEmployment` | הזינו את דמי הביטוח · הזינו גיל · הזינו את סוג ההעסקה | more "not evaluated" reasons. Insurance: was "הזינו את עלות הביטוח" · changed 2026-10-24 (Hebrew editor); was ״הזינו סוג העסקה״ |
| `r2.result.reasons.noTerms · noRun · gap · ruleMissing · ruleOpen` | עוד אין לאתר את תנאי המוצר · עוד אין לאתר שיטת חישוב לזה · שיטת החישוב עוד לא מוגדרת · חסר כלל במאגר הכללים · שאלה פתוחה | |
| `r2.result.sensRunning` | האתר בודק מה היה משנה את התשובה… | while the sensitivity runs. Was "בודק מה היה משנה…" (no subject) |
| `r2.result.times` | פי | a fee moved by a multiple: "פי `{מספר}`" |
| `r2.result.checklistBlocks` | מונע דירוג של: | checklist row, the options a blocked dimension keeps out of the order |
| `r2.result.needMore` | כדי להשוות, הזינו כמה שנים עד המטרה, וסכום היום או הפקדה חודשית. | result without enough inputs · changed 2026-10-24 (Hebrew editor); was ״כדי להשוות, הזינו כמה שנים עד המטרה וסכום, להיום או להפקדה חודשית.״ |
| `r2.result.toForm` | לטופס המטרה |  |
| `r2.result.failed` | האתר לא הצליח לחשב את ההשוואה. רעננו את העמוד ונסו שוב. | as 4 · changed 2026-10-24 (Hebrew editor); was ״לא הצלחנו לחשב את ההשוואה. רעננו את העמוד ונסו שוב.״ |
| `r2.result.cashBefore … cashAfter` | האפשרויות הנזילות חושבו לפי ריבית של `{אחוז}`, פרמטר של האתר. את הנתונים של בנק ישראל אי אפשר להציג כאן בלי הסכמתו בכתב. | D20. The tail was "…, פרמטר של האתר: את הסדרות של בנק ישראל אי אפשר לפרסם מחדש באתר." ("סדרות" is a data word) |
| `r2.result.cashLink` | לנתונים של בנק ישראל | link out (D20) |
| `r2.result.bankPublished` | ריבית הבנק, בתוקף מ־`{תאריך}` | label of a deposit's own rate (A-21 note, D20). The date is the record's `effective_from`, so it can be after today; it is not a publication date (changed 2026-10-23, QA F11; was "לפי פרסום הבנק ב־`{תאריך}`") |
| `r2.result.rulesUsed` | הכללים שההשוואה נשענת עליהם | rules line heading. Was "כללים שהשוואה נשענת עליהם" |
| `r2.result.cashChip` | ריבית על הכסף הנזיל | assumption chip for the cash rate. Was "ריבית נזילה", which is not a Hebrew phrase |
| `r2.result.realNominal` | אופן הצגת הסכומים | screen-reader name of the real / nominal switch, as `guide.modeLabel` |

**QA fixes (added 2026-10-23, for the founder's review).**

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `formulaNames[A-06]` | העלות בתוך הקרן: סכום כל מרכיביה | the formula line of the brokerage row's "העלות בתוך הקרן" chip, which now shows the sum of the fund's fee lines the run uses (fixed management, variable management, trustee, tracking, foreign withholding where the record has them), each one an input of the computed value |

### 6.3 Idle-cash screen

| Element | Hebrew |
|---|---|
| Title | כסף שיושב בעו״ש |
| Lede | שני מספרים, ותראו כמה עולה לכם להשאיר אותו שם. |
| Fields | כמה יש בעו״ש · כמה חייב להישאר זמין מיד |
| Before both are filled | מלאו את שני המספרים. |
| Headline | להשאיר `{סכום}` בעו״ש עולה לכם עד `{סכום}` בחודש |
| Headline label | העלות החודשית הגבוהה ביותר מבין האפשרויות הנזילות |
| Row names (`idle.rowNames`; changed 2026-10-23 under D20, for the founder's review) | פיקדון · פיקדון לחודש, לפי ההצעה שהזנתם · קרן כספית · מק״מ |
| Rate labels, three (`idle.labels`; changed 2026-10-23 under D20 and again for QA F11, for the founder's review) | בתוקף מ־`{תאריך}` · הזנתם · פרמטר של האתר · changed 2026-10-24 (Hebrew editor); was ״הוזן על ידך״ |
| Rate labels before D20 (superseded, not in `copy.ts`) | הממוצע ששולם ב`{בנק}` בחודש שעבר · הזנתם · ממקור: `{שם הסדרה}` · changed 2026-10-24 (Hebrew editor); was ״הוזן על ידך״ |
| Series names (superseded by D20: the Bank of Israel series are links, not numbers) | ריבית בנק ישראל · תשואת מק״מ |
| Money-market note (`idle.mmfNote`; changed 2026-10-23 under D20) | הריבית כאן משמשת כקירוב לתשואת הקרן. |
| Makam, no commission | בלי עמלת קנייה |
| Per month | בחודש |
| Baseline line | העו״ש משלם היום `{אחוז}`. |
| Baseline, no interest | לפי הנתונים של האתר העו״ש לא משלם ריבית. · changed 2026-10-24 (Hebrew editor); was ״לפי הנתונים שלנו העו״ש לא משלם ריבית.״ |
| Optional section | לדייק (לא חובה) |
| Bank field | הבנק שלכם |
| Bank, none | לא לבחור |
| Choose a bank in place of a rate | בחרו בנק |
| Offer field | ההצעה לפיקדון שראיתם באפליקציה של הבנק |
| Offer hint | כמו שהיא מופיעה אצלכם, לפיקדון לחודש אחד. |
| All money must stay available | כל הכסף צריך להישאר זמין, אין מה להשוות. |
| Coverage, not in the quick comparison | לא נכלל בהשוואה המהירה |
| Link to the full comparison | להשוואה המלאה, עם המטרה "עתודה נזילה" |


**Added 2026-10-23, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `idle.errBalance · errKeep` | הזינו סכום גדול מאפס. · הסכום גדול מהיתרה בעו״ש. | field errors · changed 2026-10-24 (Hebrew editor); was ״גדול מהיתרה בעו״ש.״ |
| `idle.rowsHeading` | מה זה עולה לכם | heading of the cost rows |
| `idle.rateOf` | ריבית | before a row's rate figure |
| `idle.noCost` | לפי הנתונים של האתר אף אפשרות נזילה לא משלמת יותר מהעו״ש, ולכן להשאיר אותו שם לא עולה לכם כלום. | no row costs anything. Was "…, אז להשאיר אותו שם לא עולה לכם." · changed 2026-10-24 (Hebrew editor); was ״לפי הנתונים שלנו אף אפשרות נזילה״ |
| `idle.boiBefore` | הממוצע שבנק ישראל מפרסם לכל בנק לא מופיע כאן: תנאי השימוש של בנק ישראל לא מתירים לפרסם אותו מחדש בלי הסכמה בכתב. | D20. Was "…לא מוצג כאן, כי אי אפשר לפרסם אותו מחדש בלי הסכמת הבנק." ("הבנק" read as the person's bank) |
| `idle.boiLink` | לממוצעים של בנק ישראל | link out |
| `idle.boiParam` | הריבית של הקרן הכספית והמק״מ היא פרמטר של האתר, לא נתון של בנק ישראל. |  |
| `idle.kinds.baseline · compared · not-eligible · not-evaluated` | העו״ש עצמו · הושוו אליו · לא מתאימות לכם · לא נכללו בהשוואה המהירה | coverage sentence and group headings, after a count. Were "השוואה אליו · הושוו אליו · …": "`{1}` השוואה אליו" did not read |
| `idle.kindsTag.baseline · compared · not-eligible · not-evaluated` | העו״ש · הושוותה · לא מתאימה לכם · לא נכללה בהשוואה המהירה | the tag on one row, singular. "compared" was "הושוו" |
| `idle.notQuickLine` | כדאי לבדוק בהשוואה המלאה | after "לא נכלל בהשוואה המהירה" |
| `idle.rowNotRun` | עוד לא נבדקה | a cash row the run could not do |
| `idle.failed` | האתר לא הצליח לחשב. רעננו את העמוד ונסו שוב. | · changed 2026-10-24 (Hebrew editor); was ״לא הצלחנו לחשב. רעננו את העמוד ונסו שוב.״ |
| `idle.loading` | טוען את הנתונים… |  |
| `idle.noBaseline` | עוד אין לאתר את הריבית של העו״ש, ולכן אי אפשר להשוות. | no current-account rate in the data |

### 6.4 Saved-goal strip

| Element | Hebrew |
|---|---|
| Strip line | `{שם המטרה}` · `{שנים}` · `{סכום}` |
| Unnamed goal | the preset's name; with none: מטרה ללא שם |
| Saved line | נשמר במכשיר הזה |
| Actions | לתוצאה · עריכה · מטרה נוספת · מחיקה מהמכשיר |
| Menu button (screen-reader name) | עוד פעולות |
| Delete confirm | למחוק את המטרה מהמכשיר הזה? · מחיקה · ביטול |
| Compact line | המטרה השמורה: `{שם}` · `{שנים}` |
| Compact action | שינוי |
| No goal (first page) | עוד אין מטרה שמורה. |
| Its link | להגדיר מטרה |
| Old version | המטרה שנשמרה היא מגרסה ישנה של האתר. |
| Old version, actions | להתחיל מחדש · מחיקה מהמכשיר |

### 6.5 Fit mark

| Element | Hebrew |
|---|---|
| Card heading | מתאים למטרה שלכם? |
| Marks | מתאים · לא מתאים · אין כלל לסיווג הזה |
| Goal line (`fit.goalLine`; changed 2026-10-23, for the founder's review) | לפי המטרה "`{שם המטרה}`", `{שנים}`. |
| Horizon only (`fit.horizonOnly`; changed 2026-10-23, for the founder's review) | לפי השנים עד המטרה בלבד. סינון לפי ירידה שתסכימו לספוג יתווסף בהמשך. |
| Rule line | לפי טבלת ההתאמה של האתר, לסיווג "`{סיווג}`" |
| Links | להשוואה למטרה הזו · שינוי המטרה |
| No goal | אין מטרה שמורה. הגדירו מטרה כדי לראות אם המסלול מתאים לה. |
| Its link | להגדיר מטרה |
| Company page, line above the list | ההתאמה לפי המטרה השמורה: `{שם}` · `{שנים}` |
| Row mark (screen-reader name) | התאמה למטרה: `{מתאים / לא מתאים}` |


**Added 2026-10-23, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `fit.ruleRange` | מתאים החל מ־`{שנים}` | the rule line's figure (P-04's horizon band). Was "מתאים מ־" |
| `fit.stale` | נתוני הסיווג לא עודכנו מאז `{חודש}`. | the caution line when the regulator's period is stale; same shape as 3.11. Was "נתוני הסיווג ישנים: התקופה האחרונה שיש לאתר היא `{חודש}`." |

### 6.6 Why these words

- **"מוצגת, לא מדורגת"** rather than "לא דורגה": the option is on the page with a value; it is only kept out of the order (method B3).
- **"לא מתאימה לכם"** for "not eligible": a rule bars this person or this money; the wording points at the fit, not at a fault.
- **"נפסלה לפי האילוץ שלכם"** keeps the constraint the person's own, in the entered colour, so a result the person narrowed is not read as the site's view.
- **"עוד לא נבדקה"** says the site has not evaluated it, never that it is worse.
- **"שקולה"** rather than "תיקו": everyday Hebrew for "as good as", and it reads as a statement about the goal ("למטרה הזו"), which is what D5 means.
- **"נעול עד"** names the date, not the years: a date is what the person will plan around (D16).
- **"מכריע"** for the deciding formula: one word, and it says what the line is: the thing that decides, not an explanation of everything.
- **"מתהפך אם … תעבור מ־… ל־…"** follows F-81's own sentence, with both values as numbers so the size of the move is visible.
- **"כסף של היום"** stays from release 1 for "real"; the nominal switch keeps "שקלים של העתיד".
- **Added 2026-10-23** (the build's strings, folded the same day):
  - **"הוספה"**, not "עמלת הפצה", for the schema's `load`: the law's purchase load (MF-21). The distribution fee (MF-24) is a different fee, paid by the fund manager to the bank, and is not a line the saver pays.
  - **"שכר נאמן"**, not "דמי נאמנות": the law's and the glossary's term (MF-20).
  - **"עמית מוטב"** in the F-32 headline: the law's term (TXP-03), and it opens its one-line explanation; "מי שהפקדותיו מגיעות לסף שבחוק" was masculine and said less.
  - **"כשעוברות מההפקדה הראשונה `{שנים}`"** for the after-years exit: names where the clock starts (TXH-09: from the first payment into the fund). "רק אחרי `{שנים}`" left the reader guessing.
  - **"דמי הביטוח בקרן הפנסיה"**, not "עלות ביטוח": the glossary's term (PEN-15); the hint says what the cover is before it says why the site asks.
  - **"העו״ש עצמו · הושוו אליו"** in the idle-cash coverage sentence, and **"הושוותה"** on one row: the words follow a count ("`{3}` הושוו אליו"), so each is a predicate, not a heading.
  - **"השנים עד המטרה"**, not "האופק", on the fit mark: "אופק" is our word, not the reader's; the glossary keeps "אופק" as another name.
  - **"תעריפון"**, not "תעריף": the banks' own word for the fee list (glossary "תעריפון מלא").
  - **"מאגר הכללים"** everywhere for the rule base; "בסיס הכללים" is dropped.
  - **"אופן הצגת הסכומים"**, not "מטבע ההצגה", for the real / nominal switch: both modes are shekels.
  - **"יתווסף בגרסה `{מספר}`"**, not "מתוכנן לגרסה": the site's register for pending work is "יתווסף"; the release number stays only because the component appends it.
  - **Typed figures** remain in three tax-step headlines, one flag and one sentence (ages 60 and 18, from TXK and CS rules); they are marked in 3.5a and 3.8 and need a number component, which is a code change.

---

## 7. Release 3 screens

Added 2026-10-23 for the briefs in `docs/flows.md` section 12 and the handoff in `docs/design-spec.md` sections 11 to 15. Same voice and conventions as section 1: plural imperative or impersonal, no typed figures (every `{…}` is a value object with its state), names as the source writes them, codes after the words. Fee names are the glossary's terms (section 2's checklist rows and the guide fee table of 3.5a: "דמי ניהול מחיסכון", "דמי ניהול מהפקדה", "הוצאות ישירות", "עמלת קנייה ומכירה", "דמי ניהול פיקדון ניירות ערך", "המרת מטבע", "דמי חשבון קבועים", "מרווח קנייה ומכירה"). Status: **draft** (2026-10-23), to be settled by the founder as sections 3 and 6 were. Every wording choice is "chosen 2026-10-23, revisable"; section 7.6 says why.

### 7.0 Everywhere in release 3

| Element | Hebrew |
|---|---|
| Menu row, footer link, fourth door | מה כבר יש לכם |
| Fourth door, line | הזינו מהדוח השנתי, ותראו אם המסלול מתאים, מה העמלות עולות ואם אפשר לאחד |
| Footer link, strip menu row, holdings save line | העברה למכשיר אחר |
| Strip menu row, when imported items exist | מחיקת מה שיובא |
| Imported tag | יובא ב־`{תאריך}` |
| Verdict names, three (F-62) | שווה להתמקח · שווה להימנע · לא שווה את הטרחה |
| Avoid not evaluated | להימנע: לא נבדק. נבדק רק מול השוואה למטרה. |
| Its link | להגדיר מטרה |
| No reference | אין ממוצע להשוואה |
| No reference, reasons | הממוצע של בנק ישראל מוצג רק בקישור: תנאי השימוש של בנק ישראל לא מתירים לפרסם אותו מחדש בלי הסכמה בכתב. · ממוצעי רשות ניירות ערך לקטגוריות של קרנות עוד לא אומתו כנתון להשוואה לקרן מסוימת. · הממוצעים שהבורסה מפרסמת לכל חבר בורסה עוד לא נאספו. · להוצאות ישירות אין ממוצע שנאסף. · המסלול לא נמצא בנתוני הרשות. |
| No reference, links out | ללוח הנתונים של בנק ישראל · לדוח השנתי של רשות ניירות ערך · למחשבון העמלות של הבורסה · changed 2026-10-24 (Hebrew editor); was ״לדשבורד העמלות של בנק ישראל״ |
| Regulator reference line (F-68) | ממוצע הרשות למסלולי `{סיווג}`: `{אחוז}` (חציון `{אחוז}`), לשנת `{שנה}`, מ־`{מספר}` מסלולים. |
| Track's own average | במסלול הזה עצמו שילמו העמיתים בממוצע `{אחוז}`. |
| Per fund (pension) | לקרן כולה |
| Fee not reported | עוד לא דווח |
| Pre-tax tag (blocked exit) | לפני מס ביציאה: שאלה פתוחה `{קוד}` |
| Fee cost over the horizon | `{סכום}` ב־`{שנים}`, בכסף של היום |
| Links to the fee page | מה העמלות כאן עולות לכם · כמה העמלות האלה עולות לאורך זמן · מה העמלות האלה יעלו לכם · כל העמלות, ומה שווה לעשות איתן |
| Links to the workbench | כל המסלולים בכל החברות · לכל המסלולים של `{מוצר}` בכל החברות |
| Later releases | המדריך למעבר: בעמוד ״איך עוברים״ · הטבלה לפי ספקים תתווסף בהמשך · סינון לפי ירידה שתסכימו לספוג יתווסף בהמשך · changed 2026-10-24 (Hebrew editor); was ״המדריך למעבר יתווסף בהמשך״ |

**Added 2026-10-24, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed. Where the build's wording was changed, the note says what it was.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `r3fees.notReported` | עוד לא דווח | the "Fee not reported" row above was "טרם דווח"; changed to the wording settled for release 1 (`track.feeNotReported`, 3.12): one phrase for an empty fee field everywhere |
| `r3fees.names.fund · base.fund` | העלות בתוך הקרן · כל שנה, בתוך מחיר היחידה | the fund's internal cost as a fee row (A-06's name, 3.8); the base words were already in 7.1 |
| `r3fees.names.manager · base.manager` | דמי ניהול של החברה המנהלת · כל שנה, מהחיסכון, נוסף על העלות בתוך הקרן | the IRA manager's balance fee (F-51, IRA-17). Was "דמי ניהול של המסגרת": "מסגרת" is not a site word; "החברה המנהלת" is the glossary's |
| `r3fees.periods` | חודש · רבעון · שנה | the `{תקופה}` of "כל `{תקופה}`, על ניירות הערך שבחשבון" |
| `r3fees.negotiation.datasets · authority` | גמל נט · פנסיה נט · רשות שוק ההון, ביטוח וחיסכון | the `{מאגר}` and `{רשות}` of the negotiation text. Was "רשות שוק ההון": the regulator's name as 8.0 writes it |
| `r3fees.linkGuide` | לעמוד המדריך | link back from the fee page |
| `r3workbench.entry.holdings · entry.transfer` | מה כבר יש לכם · הזינו מהדוח השנתי, … · העברה למכשיר אחר | the fourth door and the footer link, as the table above; held with their routes |

### 7.1 Fee materiality page

| Element | Hebrew |
|---|---|
| Title | כמה העמלות עולות לכם |
| Subject strip, from a comparison | לפי ההשוואה למטרה "`{שם המטרה}`": `{מוצר}`, לפי `{רשומה}` |
| Subject strip, from a guide page | לפי עמוד המדריך: `{מוצר}`, לפי `{רשומה}` |
| Subject strip, from a track | לפי המסלול `{מסלול}` (`{חברה}`), ממוצע `{שנה}` |
| Subject strip, from a holding | לפי הדוח שלכם: `{שם ההחזקה}` · changed 2026-10-24 (Hebrew editor); was ״אחזק״ |
| Subject strip, link back | לתוצאה · לעמוד המדריך · לעמוד המסלול · להחזקה · changed 2026-10-24 (Hebrew editor); was ״אחזק״ |
| Headline | העמלות ב`{מוצר}` יעלו לכם `{סכום}` ב־`{שנים}`, בכסף של היום |
| Headline, from a holding | העמלות ב`{שם ההחזקה}` יעלו לכם `{סכום}` ב־`{שנים}`, בכסף של היום · changed 2026-10-24 (Hebrew editor); was ״אחזק״ |
| Headline, under | בלי עמלות היו נשארים `{סכום}`; עם העמלות, `{סכום}`. |
| Headline, no horizon yet | הזינו כמה שנים הכסף יישאר, ונחשב. |
| Fee list heading | לפי הסדר, מהגדולה לקטנה |
| Fee row, base words | כל שנה, מהחיסכון · מכל הפקדה · כל שנה, מהקופה, נוסף על דמי הניהול · בכל קנייה ומכירה · כל `{תקופה}`, על ניירות הערך שבחשבון · בכל המרה · כל חודש, בלי קשר לסכום · בכל קנייה ומכירה בבורסה, כחלק מהמחיר · כל שנה, בתוך מחיר היחידה |
| Fee row, cost label | ב־`{שנים}` |
| Verdict reason, negotiate | העלות `{סכום}` או יותר, ויש ממוצע נמוך מהמחיר שלכם. |
| Verdict reason, avoid | העלות `{סכום}` או יותר, ואפשרות אחרת בהשוואה לא גובה אותה. |
| Verdict reason, not worth, below threshold | העלות נמוכה מ־`{סכום}`. |
| Verdict reason, not worth, no reference | אין ממוצע להשוואה, ולכן אי אפשר לומר שכדאי להתמקח. · changed 2026-10-24 (Hebrew editor); was ״אין ממוצע להשוואה, ולכן לא ניתן לומר שכדאי להתמקח.״ |
| Verdict reason, not worth, nothing removes it | כל האפשרויות בהשוואה גובות עמלה כזו. |
| Removed by | אין עמלה כזו ב`{אפשרות}`. |
| Removed by, several | אין עמלה כזו ב`{אפשרויות}`. |
| Cap line | התקרה בחוק: `{אחוז}` בשנה · התקרה בחוק: `{אחוז}` מכל הפקדה · אין תקרה בחוק · התקרה: שאלה פתוחה `{קוד}` |
| Cap, each manager sets (direct expenses, PF-11) | התקרה: כל חברה קובעת ומפרסמת לכל מסלול; עוד לא נאספה. |
| Reduction field | אם יורידו ל־ |
| Reduction, worth | שווה `{סכום}` ב־`{שנים}`. |
| Reduction, not a reduction | זו לא הורדה. · changed 2026-10-24 (Hebrew editor); was ״זה לא הורדה.״ |
| Reduction, suggestion tag | הצעה: הממוצע |
| Negotiation disclosure | מה להגיד בשיחה |
| Negotiation text pattern | דמי הניהול `{מהחיסכון / מהפקדה}` בחשבון שלי ב`{מוצר}` הם `{אחוז}`. לפי נתוני `{מאגר}` של `{רשות}` לשנת `{שנה}`, הממוצע שנגבה בפועל במסלולי `{סיווג}` הוא `{אחוז}` (חציון `{אחוז}`, מ־`{מספר}` מסלולים). אבקש להוריד את דמי הניהול ל־`{אחוז}`. |
| Negotiation text, track's own average (added sentence) | במסלול הזה עצמו הממוצע שנגבה בפועל היה `{אחוז}`. |
| Negotiation text, source line | מקור: `{מאגר}`, `{רשות}`, נתוני `{חודש}`. |
| Negotiation, rule lines | the texts of PF-13 and PF-16 from the rule base, with their chips, then: |
| Negotiation, last line | הטקסט מצטט מספר ציבורי ואת המקור שלו, ולא מתחייב לכלום. |
| Copy the text | העתקת הטקסט · הועתק |
| Interaction remainder | השפעה משולבת של העמלות זו על זו: `{סכום}` |
| Interaction remainder, line | הסכום של כל השורות והשורה הזו הוא העלות הכוללת. |
| Thresholds line | הספים: שווה להתמקח מ־`{סכום}`; שווה להימנע מ־`{סכום}`. פרמטר של האתר. |
| Its link | לכל הפרמטרים |
| Chart title | העמלות לאורך הזמן |
| Chart, direct labels (short) | ניהול מחיסכון · ניהול מהפקדה | `r3fees.chart.short`; added 2026-10-24 (UX fix 30): the full names were cut in the 94 px label strip; the legend and readout keep the full names |
| Chart, total line | סך העמלות |
| Chart, rest band | שאר העמלות |
| Chart, remainder legend | השפעה משולבת: הפער עד הקו · changed 2026-10-24 (Hebrew editor); was ״השפעה משולבת: הרווח עד הקו״ |
| Chart, not reported in legend | לא דווח |
| Chart marker, no goal | סוף התקופה |
| Chart's screen-reader name | גרף: העלות של `{מספר}` עמלות לאורך `{שנים}`. הנתונים המלאים בטבלה. |
| Assumption chips | סכום · הפקדה חודשית · שנים · תשואה · אינפלציה · כל ההנחות |
| Assumptions sheet title | ההנחות של חישוב העמלות |
| Sensitivity title | מה היה משנה את המסקנה |
| Sensitivity, flips a verdict | המסקנה על `{עמלה}` מתהפכת אם `{הנחה}` תעבור מ־`{ערך}` ל־`{ערך}`: אז `{פסק הדין}`. |
| Sensitivity, changes the largest fee | העמלה הגדולה מתחלפת אם `{הנחה}` תעבור מ־`{ערך}` ל־`{ערך}`: אז `{עמלה}`. |
| Sensitivity, no flip | לא מתהפכת בטווח שנבדק: `{מ}` עד `{עד}`. |
| Sensitivity, fee assumption name | `{שם העמלה}`, מחצי עד כפול |
| One fee only / no fees | אין עמלות ברשומה הזו. |
| Omitted fee (not reported) | `{עמלה}` לא נכללה בחישוב: לא דווחה. |
| Subject not found | המוצר או ההחזקה לא נמצאו. · למדריך · למה שכבר יש לכם · changed 2026-10-24 (Hebrew editor); was ״לא מצאנו את המוצר או האחזקה.״ |
| Loading | טוען… |

**Added 2026-10-24, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed. Where the build's wording was changed, the note says what it was.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `r3fees.failed` | האתר לא הצליח לחשב את העמלות. רעננו את העמוד ונסו שוב. | as section 4's "could not compute" line · changed 2026-10-24 (Hebrew editor); was ״לא הצלחנו לחשב את העמלות. רעננו את העמוד ונסו שוב.״ |
| `r3fees.chart.year` | שנה | the chart's year readout |
| `r3fees.review.noClass` | למוצר הזה לא נבחר מסלול מייצג, ולכן אין סיווג שממנו מחשבים את ממוצע הרשות. | no-reference reason when P-05 names no track for the wrapper (F-68). Was "לא נבחר מסלול ייצוגי לצורך ממוצע הרשות, ולכן אין סיווג שממנו אפשר לחשב ממוצע למוצר הזה.": "מייצג" as "הרשומה המייצגת" (8.1) |
| `r3fees.review.emptyClass` | אף מסלול בסיווג הזה לא דיווח על העמלה הזו. | no-reference reason when no track in the class reports the fee |
| `r3fees.review.refNotBelow` | הממוצע לא נמוך מהמחיר שלכם. | not-worth reason when a reference exists and is not below the person's rate. Was "הממוצע אינו נמוך מהמחיר שלכם." |
| `r3fees.review.official` | הממוצע שהרשות פרסמה לשנת `{שנה}` לכל הקופות מהסוג הזה: `{אחוז}` | the Authority's official class average from its annual report (PF-39), quoted under D22 as a second line beside the F-68 reference; it does not enter the verdict. Was "הממוצע הרשמי של הרשות לשנת … לכל הקופות מסוג זה: " |
| `r3fees.review.officialNote` | ממוצע מהדוח השנתי של הממונה על שוק ההון, לכל הקופות מהסוג הזה יחד; לא משמש למסקנה. | Was "ממוצע שפורסם בדוח הממונה, לכל הקופות מהסוג הזה יחד. לא משמש לפסק הדין.": "פסק הדין" is the method's word, the page says "המסקנה" |
| `r3fees.review.chartGross` | הגרף מראה את ההפרש לפני מס ועלויות היציאה, ולכן בקצהו הוא גבוה ב־`{סכום}` מהסכום שבכותרת: בלי העמלות הרווח גדול יותר, והמס עליו גדול יותר. · מס ועלויות היציאה על ההפרש | under the chart (B6, changed 2026-10-24): the last point is before exit tax and the headline after it; the figure is the exact gap (`feeMaterialitySeries().exitEffect`), a computed value. Was "הגרף מראה את הערך לפני עלויות היציאה והמס, ולכן הסכומים בקצהו שונים מעט מאלה שבטבלה." ("a little" was wrong: a kupat gemel lehashkaa takes a quarter of the real gain). Parts: before · after · the figure's label |
| `r3fees.review.ruleMissing` | הטקסט של הכלל הזה עוד לא נמצא במאגר הכללים של האתר. | as `r2.form.payslipNoRule` (6.1). Was "הכלל הזה עוד לא נכנס לבסיס הכללים של האתר, ולכן אין כאן את הנוסח שלו.": one sentence for a missing rule text everywhere |
| `r3fees.review.parameterReturn` | לא הוזנה תשואה. החישוב לפי התשואה של התרחיש לדוגמה, פרמטר של האתר. | callout when the run takes P-05's return. Was "אין תשואה שהוזנה. החישוב משתמש בתשואה של תרחיש ההדגמה, פרמטר של האתר.": P-05 is "התרחיש לדוגמה" on the parameters page (3.15) |
| `r3fees.review.noGoal` | אין מטרה שמורה: החישוב לפי התרחיש לדוגמה של האתר. | Was "…לפי תרחיש ההדגמה של האתר." |
| `r3fees.review.returnChipParameter` | התרחיש לדוגמה | the return chip in that state. Was "תרחיש הדגמה" |
| `r3fees.review.noTerms` | למוצר הזה עוד אין רשומה עם עמלות לחישוב. אפשר להזין את העמלות מהדוח שלכם. | Was "עוד אין תנאי עמלות לחישוב למוצר הזה. אפשר להזין את העמלות מהדוח שלכם." |
| `r3fees.review.needInput · toForm` | כדי לחשב צריך עוד פרט: `{שדה}` · לטופס המטרה | a missing input and its link |
| `r3fees.review.blockedRun` | החישוב למוצר הזה חסום: `{סיבה}` | Was "המוצר הזה חסום בחישוב: " |
| `r3fees.review.sensRunning · sensFooter` | בודק… · הטווחים שנבדקו הם פרמטר של האתר. | the sensitivity panel while it computes, and its last line. Were "בודקים…" (the site speaks in the singular, as "טוען…") and "הטווחים הם פרמטר של האתר." |
| `r3fees.review.notReportedRow` | העמלה לא דווחה לרשות, ולכן לא נכללה בחישוב. | row detail of an unreported fee |
| `r3fees.review.staleLine` | נתוני הרשות לא עודכנו מאז `{חודש}` | as 7.3's old-data line |
| `r3fees.review.detail` | פירוט החישוב | not rendered yet; the heading as 8.2's row detail. Was "פרטי החישוב" |
| `r3fees.review.holdingSoon · ownerRates · adopted` | — | removed from `copy.ts` 2026-10-24 (not rendered: "עמוד ההחזקות עוד לא מחובר לעמוד הזה." is no longer true, "קצב" names nothing and `adopted` was empty). `r3fees.review.detail` is also not rendered yet · changed 2026-10-24 (Hebrew editor); was ״אחזק״ |
| `r3fees.review.needGeneric · genericFail` | אחד מהערכים בהנחות · האתר לא הצליח להריץ את החישוב עם הערכים האלה. בדקו את ההנחות שהזנתם. | B3, added 2026-10-24 (QA fixes): no engine message reaches the page; the first fills "כדי לחשב צריך עוד פרט: …", the second is the line when no rule or open question is named · changed 2026-10-24 (Hebrew editor); was ״לא הצלחנו להריץ את החישוב עם הערכים האלה. בדקו את ההנחות שהזנתם.״ |
| `runFailure.employerAboveTotal · blocked · figureNotUpdated · generic` | הפקדת המעסיק שהוזנה גבוהה מסך ההפקדה החודשית. בדקו שסכום ההפקדה כולל את חלק העובד וחלק המעסיק. · הכללים לחישוב הזה עוד בבדיקה, ולכן האתר לא מחשב אותו. · אחד הנתונים בחישוב לא עודכן, ולכן האתר לא מחשב אותו. · האתר לא הצליח להריץ את החישוב עם הערכים האלה. בדקו את ההנחות שהזנתם. | added 2026-10-24 (txh-limit): the Hebrew reason a failed run carries as `messageHe` (timeline, fee run, holding card); no engine message or bare rule code reaches the page; the engine splits an employer part above TXH-01's limit (F-52), so no run stops there · changed 2026-10-24 (Hebrew editor); was ״לא הצלחנו להריץ את החישוב עם הערכים האלה. בדקו את ההנחות שהזנתם.״ |
| `r3fees.referenceLine.tracksOne` | , ממסלול אחד. | the reference line when one track is behind the mean (was "מ־1 מסלולים") |
| `r3fees.review.defaultsLead · defaultsNote` | עד שתזינו ערך, החישוב לפי התרחיש לדוגמה של האתר: `{שנים}`, `{סכום}`, … · מה שתזינו כאן יישמר כמטרה במכשיר הזה. | B3, added 2026-10-24 (QA fixes): the top of the assumptions sheet when no goal is saved, the scenario's own numbers each opening its source |

### 7.2 Holdings page

| Element | Hebrew |
|---|---|
| Title | מה כבר יש לכם |
| Lede | הזינו מהדוח השנתי, ותראו אם המסלול מתאים למטרה, מה העמלות עולות ואם אפשר לאחד. הכול נשמר במכשיר הזה. |
| Strip line | ההתאמה והעלות לפי המטרה השמורה: `{שם}` · `{שנים}` |
| Empty state | מה להכין: הדוח השנתי של כל קופה, או הדוח מהמסלקה הפנסיונית. |
| Add button | להוסיף החזקה · changed 2026-10-24 (Hebrew editor); was ״אחזק״ |
| List heading | ההחזקות שלכם · changed 2026-10-24 (Hebrew editor); was ״אחזק״ |
| Sheet title | החזקה חדשה · עריכת החזקה · changed 2026-10-24 (Hebrew editor); was ״אחזק״ |
| Field groups | מה זה · כמה · מהדוח |
| Fields, "מה זה" | סוג המוצר · החברה המנהלת · המסלול |
| Wrapper options | the glossary names of the provident-family wrappers and child savings; then: |
| Wrappers later | פיקדונות וחשבונות השקעות יתווספו בהמשך, עם התעריפונים. |
| Track picker, paste | הקלידו או הדביקו את השם כמו שהוא מופיע בדוח · changed 2026-10-24 (Hebrew editor); was ״הדביקו את השם כמו שהוא מופיע בדוח״ |
| Track picker, several match | יש יותר ממסלול אחד בשם הזה. בחרו: |
| Track picker, none | לא נמצא בנתוני הרשות. השם נשמר כמו שהקלדתם. |
| Fields, "כמה" | יתרה · דמי ניהול · הוצאות ישירות (לא חובה) · הפקדה חודשית שלכם (לא חובה) · הפקדה חודשית של המעסיק (לא חובה) |
| Percent pair sub-labels | מחיסכון · מהפקדה |
| Fields, "מהדוח" | הדוח נכון ל־ · תאריך ההפקדה הראשונה |
| First deposit, why | כדי לבדוק אם הכסף נזיל, האתר צריך לדעת מתי התחיל. |
| Child plan fields | איפה הכסף: קופת גמל / בנק · הקופה או הבנק · יתרה |
| Statement disclosure | איפה זה בדוח |
| Statement disclosure, body | the texts of PF-12 and PF-26 from the rule base, with their chips, then: |
| Statement disclosure, spellings | מילים שתפגשו: `{שמות נוספים מהמילון}` |
| Statement disclosure, lead and what the regulator fixed | מה הרשות קבעה שהדוח כולל: then the texts of PF-34 to PF-38 from the rule base, with their chips (changed 2026-10-24: PF OQ5 was closed on 2026-10-23 by PF-33 to PF-38) |
| Statement disclosure, standing line | האתר לא מצייר דוח לדוגמה ולא מציין איפה בדף כל שדה. |
| Statement disclosure, open line | העותק של חוזר הדוחות באתר gov.il עוד לא נמצא; החוזר נקרא בעותק באתר אחר. שאלה פתוחה PF OQ16 |
| Statement disclosure, fund number | מספר הקופה מופיע במסמכי החברה ובמדריך ההעברות של הרשות. |
| Statement disclosure, child plan | מבנה הדוח של חיסכון לכל ילד: then the text of CS-27 from the rule base, with its chip (changed 2026-10-24: CS OQ11 was closed on 2026-10-23 by CS-27) |
| Clearing-house disclosure | אפשר גם מהדוח של המסלקה הפנסיונית |
| Clearing-house, last line | איך מקבלים את הדוח וכמה הוא עולה: שאלה פתוחה PF OQ6 |
| Save / cancel | שמירה · ביטול |
| Card, fund line | `{חברה}` · קופה `{מספר}` |
| Card, unmatched tag | לא נמצא בנתוני הרשות |
| Card, unmatched line | המסלול לא נמצא בנתוני הרשות, ולכן אין סיווג, התאמה או ממוצע להשוואה. |
| Card, record labels | סיווג · נכון לחודש · יתרה · דמי ניהול מחיסכון · דמי ניהול מהפקדה · הוצאות ישירות |
| Card, no classification | אין סיווג, ולכן אין ממוצע. |
| Card, fee above cap | מעל התקרה בחוק: `{אחוז}` |
| Card, fee line | העמלות יעלו `{סכום}` ב־`{שנים}`, בכסף של היום. |
| Card, fee line, no goal | כמה שנים הכסף הזה יישאר? הגדירו מטרה. |
| Card, fit no goal | אין מטרה שמורה. |
| Card, actions | עריכה · מחיקה |
| Delete confirm | למחוק את ההחזקה מהמכשיר הזה? · מחיקה · ביטול · changed 2026-10-24 (Hebrew editor); was ״אחזק״ |
| Consolidation heading | לאחד? |
| Consolidation, one holding per type | איחוד נבדק כשיש שתי החזקות מאותו סוג. · changed 2026-10-24 (Hebrew editor); was ״אחזק״ |
| Consolidation, different types | העברה מותרת רק במסלולים שהתקנות מונות, לפי סוג המוצר. |
| Consolidation outcomes | אפשר לאחד · אי אפשר לאחד · כללי ההעברה עוד לא נמצאו · חסום: שאלה פתוחה `{קוד}` · changed 2026-10-24 (Hebrew editor); was ״לא ניתן לאחד״ |
| Consolidation, route | `{מוצר}` ל`{מוצר}`: מסלול מותר בתקנות. |
| Consolidation, conditions heading | בתנאי ש־ |
| Consolidation, conditions | the rule texts (PF-17 reg. 4 blocks; PF-18; SW-12; SW-24) from the rule base, with chips |
| Consolidation, not yet (hishtalmut) | עוד לא: החשבון השני נזיל מ־`{תאריך}` בערך (לפי סוף החודש של ההפקדה הראשונה). · changed 2026-10-24 (review fix, month end, TXH-09) · changed 2026-10-24 (Hebrew editor); was ״עוד לא: החשבון השני נזיל מ־״ |
| Consolidation, worth | איחוד ב`{מסלול}` שווה `{סכום}` ב־`{שנים}`, בכסף של היום. |
| Consolidation, no saving | האיחוד לא חוסך בעמלות. |
| Consolidation, target mark | המסלול הזה `{מתאים / לא מתאים}` למטרה. |
| Consolidation, cost lines | the texts of PF-19, TXK-04 or TXH-19, PF-14 with SW-15, from the rule base, with chips |
| Consolidation, same manager | שני החשבונות באותה חברה: איחוד חשבונות הוא תהליך של החברה, לא העברה. |
| Consolidation, bank child plan | אי אפשר להעביר לבנק אחר. · changed 2026-10-24 (Hebrew editor); was ״לא ניתן להעביר לבנק אחר.״ |
| Child-savings heading | חיסכון לכל ילד |
| Child-savings, blocked | האם המסלול נבחר או ברירת מחדל: אי אפשר לבדוק. שאלה פתוחה CS OQ10 · changed 2026-10-24 (Hebrew editor); was ״לא ניתן לבדוק.״ |
| Child-savings, known | מה כן ידוע |
| Save line | נשמר אוטומטית במכשיר הזה. בלי חשבון, בלי שרת. |

**Errors:**

| Case | Hebrew |
|---|---|
| Balance negative | היתרה לא יכולה להיות שלילית. |
| Percent above 100 | הזינו אחוז בין 0 ל־ `{מקסימום}`. · changed 2026-10-24 (Hebrew editor); was ״הזינו אחוז עד״ |
| Statement date in the future | התאריך עוד לא הגיע. |
| First deposit after the statement date | ההפקדה הראשונה לא יכולה להיות אחרי תאריך הדוח. |
| No company or track chosen | בחרו חברה ומסלול, או הקלידו את השם מהדוח. · changed 2026-10-24 (Hebrew editor); was ״בחרו חברה ומסלול, או הדביקו את השם מהדוח.״ |

**Added 2026-10-24, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed. Where the build's wording was changed, the note says what it was.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `r3holdings.loading · loadFailed` | טוען את הנתונים… · האתר לא הצליח לטעון את הנתונים. רעננו את העמוד ונסו שוב. | · changed 2026-10-24 (Hebrew editor); was ״לא הצלחנו לטעון את הנתונים. רעננו את העמוד ונסו שוב.״ |
| `r3holdings.wrappersLaterHeading` | פיקדונות וחשבונות השקעות | the group the deferred line is about |
| `r3holdings.companyFilter · companyNone · companyTyped` | חיפוש חברה · אין חברה כזו בנתוני הרשות לסוג הזה. הקלידו את השם כמו שהוא בדוח. · שם החברה כמו שהוא בדוח | the company picker |
| `r3holdings.trackPick · trackNoneForCompany · trackSelected · trackChange` | מסלולים של החברה · אין מסלולים של החברה הזו בנתוני הרשות לסוג הזה. · המסלול שנבחר · בחירה אחרת | the track picker |
| `r3holdings.fundNumber · cardFundLine` | קופה | the word of "קופה `{מספר}`" |
| `r3holdings.pasteOne · pasteCopy` | נמצא מסלול אחד בשם הזה: · העתקת השם | the paste result with one match; the copy button for a name not in the data (flow 6) |
| `r3holdings.childFundBank · child.bankRoute` | הבנק · הכסף בבנק | child-savings bank route |
| `r3holdings.childPlansNote · child.twoPlans` | לכל ילד חיסכון משלו: שני ילדים הם שתי החזקות, ואין ביניהן איחוד. | CS-21. Were "חיסכון לכל ילד של שני ילדים הם שתי החזקות, ואף פעם לא איחוד." and "שני חיסכונות של שני ילדים הם שתי החזקות, ואף פעם לא איחוד.": one sentence for both places · changed 2026-10-24 (Hebrew editor); was ״אחזק״ |
| `r3holdings.feeBalanceLabel · feeDepositLabel` | דמי ניהול מחיסכון · דמי ניהול מהפקדה | the glossary terms, for the card |
| `r3holdings.embeddedGain · embeddedGainWhy` | הרווח שכבר בתוך היתרה, מהדוח המפורט · בלי זה האתר מחשב את העמלות אבל לא את המס ביציאה. | a kupat gemel lehashkaa balance under review (F-61, PF-36). Was "הרווח שכבר בתוך היתרה (מהדוח המפורט)": no brackets in a label |
| `r3holdings.bars.label · lead` | מצבים שחוסמים העברה · סמנו אם אחד מאלה נכון לחשבון הזה: | PF-17 reg. 4 blocks; each label shows only when the rule's text names the case |
| `r3holdings.barLabels.*` | יש הלוואה פתוחה על הקופה · יש עיקול או שעבוד על כל היתרה · קצבה כבר התחילה · הקופה המקבלת סגורה · הוגשה או אושרה תביעה לקצבת נכות · העמית נפטר · הוגשה בקשה לקרן פנסיה מקיפה | the cases, in PF-17's order |
| `r3holdings.statementDisclosure.lead · neverPosition · openLine · openCode` | מה הרשות קבעה שהדוח כולל: · האתר לא מצייר דוח לדוגמה ולא מציין איפה בדף כל שדה. · העותק של חוזר הדוחות באתר gov.il עוד לא נמצא; החוזר נקרא בעותק באתר אחר. · PF OQ16 | the rows above, changed the same day. The open line was "הנוסח של חוזר הדוחות האחידים בעותק של gov.il עוד לא נקרא.", which inverted PF OQ16 (the gov.il copy was not found; the text was read on a third-party host) |
| `r3holdings.statementDisclosure.childPlan · ruleMissing` | מבנה הדוח של חיסכון לכל ילד: · הטקסט של הכלל הזה עוד לא נמצא במאגר הכללים של האתר. | the lead before CS-27; the missing-rule line as 6.1. Was "הנוסח של הכלל עוד לא במאגר." |
| `r3holdings.trackAvgYear` | לשנת | the year after the track's own average |
| `r3holdings.feeNotComputed · feeNeedsPf36 · feeNeedsFirstDeposit · feeFailed` | את העלות של סוג המוצר הזה האתר עוד לא מחשב. · הקרן עוד לא נזילה: כדי לחשב את המס ביציאה צריך את פיצול שכבות המס מהדוח המפורט. · כדי לחשב את העלות בקרן השתלמות, הוסיפו את תאריך ההפקדה הראשונה. · האתר לא הצליח לחשב את העלות. בדקו את המטרה ואת הערכים שהזנתם. | the fee line's states. The PF-36 line was "הקרן עוד לא נזילה: צריך את פיצול שכבות המס מהדוח המפורט." · changed 2026-10-24 (Hebrew editor); was ״לא הצלחנו לחשב את העלות. בדקו את המטרה ואת הערכים שהזנתם.״ |
| `r3holdings.depositsLeftOut · returnFromParameter` | ההפקדות החודשיות לא נכללו: חסר שכר בטופס המטרה. · החישוב לפי התשואה של התרחיש לדוגמה, פרמטר של האתר, לא לפי תשואה שהזנתם. | Was "החישוב לפי תשואה לדוגמה של האתר, לא תשואה שהזנתם." (P-05 is "התרחיש לדוגמה") |
| `r3holdings.fitHeading · fitNoTrack · fitNoGoalLink` | מתאים למטרה? · אין התאמה: המסלול לא נמצא בנתוני הרשות. · להגדיר מטרה | the card's fit block |
| `r3holdings.actions.up · down · detailsOpen` | להזיז למעלה · להזיז למטה · פרטים | Were "הזזה למעלה · הזזה למטה"; 6.1's words |
| `r3holdings.consolidation.differentTypesLink` | כל המסלולים בכל החברות | |
| `r3holdings.consolidation.separate · separateLine` | אפשר להעביר כחשבון נפרד · הכסף עובר שלם לחשבון נפרד אצל המנהל השני, והחשבונות מתאחדים רק כששניהם נזילים. | the SW-39 outcome |
| `r3holdings.consolidation.missingFirstDeposit` | כדי לבדוק אם אפשר לאחד, הוסיפו את תאריך ההפקדה הראשונה בכל קרן השתלמות. | |
| `r3holdings.consolidation.targetMark.noRule · noGoal · noTrack` | אין כלל לסיווג שלו · אין מטרה לבדוק מולה · לא נמצא בנתוני הרשות | the other states of "המסלול הזה `{…}` למטרה." |
| `r3holdings.consolidation.worthUnavailable.*` | את שווי האיחוד לסוג המוצר הזה האתר עוד לא מחשב. · כדי לחשב מה שווה האיחוד, הגדירו מטרה עם שנים. · האתר לא הצליח לחשב את שווי האיחוד. | · changed 2026-10-24 (Hebrew editor); was ״לא הצלחנו לחשב את שווי האיחוד.״ |
| `r3holdings.consolidation.costHeading · ruleText` | מה עוד כדאי לדעת · הנוסח המלא | the heading over the cost lines; the disclosure of a rule's full text |
| `r3holdings.unsaved` | אי אפשר לשמור במכשיר הזה. מה שהזנתם יישאר רק בזמן הביקור. | storage unavailable |
| `r3holdings.errors.required · gainOverBalance · amountNegative · percentOver` | השדה הזה חובה. · הרווח לא יכול להיות גדול מהיתרה. · הסכום לא יכול להיות שלילי. · אחוז לא יכול להיות גבוה ממאה. | the percent error was "הזינו אחוז בין 0 ל־ 100." with a typed figure; 6.1's form takes the maximum through the number component, which needs a code change here · changed 2026-10-24 (Hebrew editor); was ״הזינו אחוז עד״ |
| `r3holdings.classRef.afterOne` | ), ממסלול אחד | the holdings card's reference line for one track (B14, added 2026-10-24 (QA fixes)); the count on the card is the tracks that report that fee, as on the fee page and the workbench (B12) |

| `r3holdings.wrapperHints · feeDepositHint · saveProblems · closeAsk · companyPartial · companyNotFound · trackCount · cardDates · trackAvgNone · fitNoRule · avgSaving · switchLink · depositsHere` | (קרן פנסיה) · אין שורה כזו בדוח? השאירו ריק, וייכתב 0. · שדה אחד / שני שדות / N שדות לתיקון, למעלה. · לסגור בלי לשמור? (לסגור · להמשיך) · זיהינו חברה לפי חלק מהמילים… · לא נמצאה חברה בשם הזה… · מסלול אחד / שני מסלולים / N מסלולים · נתוני הרשות · הדוח שלכם · המסלול הזה עוד לא דיווח לרשות דמי ניהול לשנת · האתר לא קבע כלל התאמה לסיווג הזה. · לפי הממוצע הייתם חוסכים כ־X ₪ ב־N שנים. · איך עוברים · פיקדון שיש לכם כבר אפשר להשוות בעמוד הכסף שבעו״ש. | added 2026-10-24 (UX fix A14 to A18, A59, A60, A64, A65, A67); `fitNoRule` replaces ״אין כלל לסיווג הזה״ on the card |
| `r3holdings.errors.statementFuture · firstFuture · invalid · wrapperRequired` | תאריך הדוח לא יכול להיות אחרי היום. · ההפקדה הראשונה לא יכולה להיות אחרי היום. · תקנו את הערך או מחקו אותו. · בחרו סוג מוצר. | added 2026-10-24 (UX fix A15); `dateFuture` is no longer used |
| `r3holdings.statementDisclosure.more` | עוד | added 2026-10-24 (UX fix A64): the regulator's text sits behind it, the statement's own words come first |
| `idle.soWhat · offerUnit · offerBelow · haveDeposit · invalid` | זה כ־X ₪ בשנה, אם הכסף נשאר שם כל השנה. · התכוונתם ל־4%? הריבית כאן באחוזים לשנה, למשל 3.2. · ההצעה נמוכה ממה שהעו״ש משלם, ולכן להעביר אליה עולה לכם. · יש לכם כבר פיקדון? האתר עוד לא רושם פיקדונות. השוו את הריבית שלו לשורות כאן. · תקנו את הערך שסומן באדום כדי לראות את התוצאה. | added 2026-10-24 (UX fix A20, A59, A61) |
| `idle.offerHint · rowNames["bank-deposit:own-offer"]` | כמו שהיא מופיעה אצלכם, באחוזים לשנה. · פיקדון לפי ההצעה שהזנתם, בחישוב לחודש | changed 2026-10-24 (scenario audit 7): the offer is no longer called a one-month deposit |
| `idle.term` | לכמה זמן ההצעה · חודש · 3 חודשים · שנה · אחר · כמה חודשים · הזינו מספר שלם של חודשים, מ־1 עד 60. · בחרו לכמה זמן ההצעה, וכאן תראו מה היא שווה בשנה מול קרן כספית. | added 2026-10-24: the term chips, the months field, the prompt while the offer has no term |
| `idle.verdict` | ההצעה של הבנק מול קרן כספית, לשנה · הבנק מציע ריבית של `{x}` לפיקדון של `{חודש/3 חודשים/שנה/n חודשים}`: אחרי מס כ־`{a}` בשנה. · קרן כספית ב־`{x}` (פרמטר של האתר): אחרי מס כ־`{b}` בשנה. · ההפרש: `{g}` בשנה `{לטובת הפיקדון/לטובת הקרן}` — `{מתחת לסף שהאתר קבע (P-03)/שווה לבדוק}` (הסף: `{n}`) · הפיקדון נעול עד סוף התקופה או עד תחנת היציאה; הקרן נזילה בכל יום מסחר. · החישוב מניח שפיקדון קצר מתחדש באותה ריבית עד סוף השנה. · התקופה ארוכה משנה: החישוב לוקח שנה אחת ממנה. | added 2026-10-24. "ריבית של … לפיקדון של …" so a yearly rate is not read as a monthly one |
| `idle.taxWords` | המס, במילים · בפיקדון משלמים `{15%}` מכל הריבית, והבנק מנכה אותם במקור. · בקרן כספית פטורה משלמים `{25%}` רק מהרווח שמעבר לעליית המדד, ולכן כשהאינפלציה גבוהה חלק גדול מהתשואה פטור. · מסלול המס של כל קרן כתוב בתשקיף שלה. | added 2026-10-24, from the bank-deposit and money-market guides; chips TXI-03, TXI-07, TXS-12, TXS-07 |
| `idle.materiality` | בסכום כזה ההפרש הוא כ־`{x}` בשנה: `{מתחת לסף שהאתר קבע (P-03)/שווה את הטרחה}` (הסף: `{n}`) | added 2026-10-24 |
| `idle.smallSum` | בקרן כספית קונים ופודים בדרך כלל בלי סכום מינימלי, ובבנק שיש לו הסכם הפצה עם מנהל הקרן אסור לגבות עמלה על קנייה, החזקה או פדיון. | added 2026-10-24; chips MF-15, MF-26, BANK-18; shown when the yearly cost of the whole sum is under P-03's threshold |
| `idle.anytime · anytimeHint` | הכסף צריך להיות זמין בכל רגע · אם לא תסמנו, ההשוואה המלאה תכלול גם פיקדון נעול. | added 2026-10-24, the box by the hand-off button |
| `home.quick.already · alreadyDeposit · alreadyStudyFund · alreadyLarge` | יש לכם כבר… · פיקדון שמסתיים · קרן השתלמות נזילה · סכום גדול בלי מטרה | added 2026-10-24: a second row under the purpose chips; links to /idle-cash and /holdings, the last selects "בלי מטרה מסוימת" |

### 7.3 Track workbench page

| Element | Hebrew |
|---|---|
| Title | כל המסלולים של `{מוצר}` בכל החברות |
| Line under the title | לפי נתוני רשות שוק ההון, ביטוח וחיסכון, נכון ל־`{חודש}`. דמי הניהול הם ממוצע `{שנה}` של כל העמיתים במסלול, אחרי הנחות; לא בהכרח מה שתשלמו אתם. (changed 2026-10-24, UX fix 28: maqaf) |
| No goal line | אין מטרה שמורה. הגדירו מטרה כדי לראות התאמה. |
| Tabs | לפי מסלול · לפי ספק |
| Provider tab line | הטבלה לפי ספקים, עם התעריפונים: בעמוד ״איזה בנק או בית השקעות״. · changed 2026-10-24 (Hebrew editor); was ״הטבלה לפי ספקים, עם התעריפונים, תתווסף בהמשך.״ |
| Exposure chips (screen-reader name) | במה הכסף מושקע |
| Exposure chip | `{סיווג}` · `{מספר}` |
| Exposure chip, all | הכול |
| Filter field | חיפוש חברה או מסלול |
| Sort control (screen-reader name) | סדר ההצגה |
| Sort options | חברה · מחיסכון · מהפקדה · שם | changed 2026-10-24 (UX fix 29): shorter labels so the four fit one line at 390; was לפי חברה · דמי ניהול מחיסכון · דמי ניהול מהפקדה · שם |
| Not an offer line | ממוצע הוא מה שהעמיתים שילמו בפועל, לא הצעה אליכם. |
| Group heading | `{סיווג}` · `{מספר}` מסלולים |
| Group heading, filtered | `{מספר}` תואמים |
| Show more | להציג עוד `{מספר}` |
| PC columns | חברה · מסלול · קופה · במה הכסף מושקע · ניהול מחיסכון, `{שנה}` · ניהול מהפקדה · התאמה · פתיחה (changed 2026-10-24, audit A82: shorter headers; the lead line above the table says these are fee averages) |
| Phone fee line | דמי ניהול מחיסכון `{אחוז}` · מהפקדה `{אחוז}` |
| Sector track | פתוח רק ל`{קבוצה}` |
| Coverage sentence | נבדקו `{מספר}` מסלולים ב־`{מספר}` חברות: `{מספר}` מתאימים למטרה, `{מספר}` לא מתאימים, `{מספר}` בלי כלל לסיווג, `{מספר}` פתוחים רק לקבוצה מסוימת, `{מספר}` בלי מטרה לבדוק מולה. |
| Coverage groups | מתאימים למטרה · לא מתאימים · בלי כלל לסיווג · פתוחים רק לקבוצה מסוימת · בלי מטרה לבדוק מולה · בלי סיווג בנתונים |
| Coverage outcome words, one row | מתאים · לא מתאים · אין כלל לסיווג הזה · פתוח רק ל`{קבוצה}` · לא נבדק: אין מטרה שמורה · לא נבדק: אין סיווג בנתונים |
| No tracks for the wrapper | למוצר הזה אין מסלולים בנתוני הרשות. · changed 2026-10-24 (Hebrew editor); was ״למוצר הזה אין מסלולים בנתוני הרשות. הטבלה לפי ספקים תתווסף בהמשך.״ |
| Old data | נתוני הרשות לא עודכנו מאז `{חודש}`. |

**Added 2026-10-24, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed. Where the build's wording was changed, the note says what it was.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `r3workbench.line.noYear` | לפי נתוני רשות שוק ההון, ביטוח וחיסכון, נכון ל־`{חודש}`. דמי הניהול הם ממוצע של כל העמיתים במסלול, אחרי הנחות; לא בהכרח מה שתשלמו אתם. | the line under the title when the file names no year (changed 2026-10-24, UX fix 28: maqaf) |
| `r3workbench.tabs.aria` | תצוגה | the tabs' screen-reader name |
| `r3workbench.reference.deposit` | מהפקדה: | the deposit half of the regulator reference line |
| `r3workbench.back` | חברות ומסלולים | the breadcrumb parent |
| `r4workbench.group.one · two · matchingOne` | מסלול אחד · שני מסלולים · אחד תואם | a group heading with one or two tracks, instead of "1 מסלולים" (B14, added 2026-10-24 (QA fixes)) |
| `r4workbench.reference.fromOne` | , ממסלול אחד. | the class-reference line over one track |

### 7.4 Export and import

| Element | Hebrew |
|---|---|
| Title | העברה למכשיר אחר · changed 2026-10-24 (Hebrew editor); was ״להעביר למכשיר אחר״ |
| Lede | קובץ אחד עם כל מה שהזנתם. בלי חשבון, בלי שרת: הקובץ עובר רק לאן שאתם שולחים אותו. · changed 2026-10-24 (Hebrew editor); was ״הקובץ עובר רק איפה שאתם שולחים אותו.״ |
| Export heading | לשמור קובץ מהמכשיר הזה |
| Contents line | `{מספר}` מטרות · `{מספר}` החזקות · `{מספר}` שמות שלא קוטלגו · הערכים שהזנתם במדריך · גרסת האתר והנתונים · changed 2026-10-24 (Hebrew editor); was ״אחזק״ |
| Caution | הקובץ מכיל את הסכומים והשכר שהזנתם. שלחו אותו רק למי שאתם רוצים שיראה אותם. |
| Buttons | שיתוף · הורדה · העתקה · הועתק |
| File name line | שם הקובץ: `{שם}` |
| Nothing to export | עוד אין מה לשמור. |
| Copy blocked | ההעתקה לא הצליחה. סמנו והעתיקו מכאן. · changed 2026-10-24 (Hebrew editor); was ״לא הצלחנו להעתיק. סמנו והעתיקו מכאן.״ |
| Import heading | לטעון קובץ ממכשיר אחר |
| Choose file | בחירת קובץ · changed 2026-10-24 (Hebrew editor); was ״בחרו קובץ״ |
| Drop zone (PC) | או גררו לכאן |
| Paste field | או הדביקו כאן |
| Preview, created | נוצר ב־`{תאריך}` · גרסת אתר `{מזהה}` |
| Preview, counts | `{מספר}` מטרות · `{מספר}` החזקות · `{מספר}` שמות שלא קוטלגו · changed 2026-10-24 (Hebrew editor); was ״אחזק״ |
| Preview, old version | קובץ מגרסה ישנה; יומר בטעינה. |
| Mode | להוסיף למה שיש במכשיר · להחליף את מה שיש במכשיר |
| Replace confirm | להחליף? מה שיש במכשיר הזה יימחק. · להחליף · ביטול |
| Load | לטעון |
| After import | נטען: `{מספר}` מטרות, `{מספר}` החזקות. מסומנים "יובא ב־`{תאריך}`". · changed 2026-10-24 (Hebrew editor); was ״אחזק״ |
| After import, links | למה שכבר יש לכם · לתוצאה |
| Duplicates skipped | `{מספר}` פריטים זהים כבר היו במכשיר ולא נטענו שוב. · one: פריט אחד זהה כבר היה במכשיר ולא נטען שוב. · two: שני פריטים זהים כבר היו במכשיר ולא נטענו שוב. · changed 2026-10-24 (audit A91, A33) |
| Delete imported, confirm | למחוק מהמכשיר הזה את כל מה שיובא? · מחיקה · ביטול |

**Errors:**

| Case | Hebrew |
|---|---|
| Newer version | הקובץ נוצר בגרסה חדשה יותר של האתר. רעננו את העמוד ונסו שוב. |
| Not the site's format | זה לא קובץ של מקור. |
| Invalid content | הקובץ לא תקין: `{שדה}`. לא שונה כלום במכשיר. |
| Unreadable file | האתר לא הצליח לקרוא את הקובץ. · changed 2026-10-24 (Hebrew editor); was ״לא הצלחנו לקרוא את הקובץ.״ |
| Share failed | השיתוף לא הושלם. אפשר להוריד או להעתיק. |
| Invalid content, `{שדה}` | the file's field in Hebrew, not its English key: תוכן הקובץ · תאריך הייצוא · גרסת הקובץ · פרטי האתר · המטרות · הערכים במדריך · ההחזקות · השמות שלא קוטלגו · רשימת הטעינות · ההשוואות השמורות · changed 2026-10-24 (audit A33) |

**Added 2026-10-24 (audit A32, A33, A69, A70, A72, A91, `r3transfer` in `copy.ts`).**

| Key in `copy.ts` (`r3transfer.`) | Hebrew | Note |
|---|---|---|
| `forms.goals` | מטרה אחת · שתי מטרות · `{מספר}` מטרות | one, two, many; the same three forms for the rest (A91); the digit only in "many" |
| `forms.holdings` | החזקה אחת · שתי החזקות · `{מספר}` החזקות | |
| `forms.names` | שם אחד שלא קוטלג · שני שמות שלא קוטלגו · `{מספר}` שמות שלא קוטלגו | |
| `forms.comparisons` | השוואה שמורה אחת · שתי השוואות שמורות · `{מספר}` השוואות שמורות | |
| `forms.offers` | הצעה שהזנתם · שתי הצעות שהזנתם · `{מספר}` הצעות שהזנתם | the entered offers (the file now carries them, A32) |
| `forms.variants` | חשיפה עם הנחות שהזנתם · שתי חשיפות עם הנחות שהזנתם · `{מספר}` חשיפות עם הנחות שהזנתם | the variant assumptions per exposure |
| `forms.ticks` | סימון אחד ב״איך עוברים״ · שני סימונים ב״איך עוברים״ · `{מספר}` סימונים ב״איך עוברים״ | the playbook ticks |
| `forms.ownRates` | ריבית שהזנתם להשוואה · שתי ריביות שהזנתם להשוואה · `{מספר}` ריביות שהזנתם להשוואה | the own rates entered on the comparison; new 2026-10-24 (sweep) |
| `onePerDevice` | האתר שומר מכשיר אחד לאדם אחד: אין בו פרופילים נפרדים. | A70; shown under the lede; requested for the holdings save line and the goal form's footer |
| `erasedNote` | בחלון פרטי או אחרי ניקוי נתוני האתר, מה שנשמר כאן נמחק. שמרו קובץ מהעמוד הזה. | A70 |
| `nothingNew` | בקובץ אין שום דבר חדש: הכול כבר במכשיר הזה. | after an add that added nothing (A33) |
| `switchGoal` · `switched` | לעבור למטרה שיובאה · המטרה שיובאה היא עכשיו המטרה הנוכחית. | A69 |
| `sideFailed` | ההצעות, ההנחות והסימונים לא נשמרו במכשיר הזה. | the device refused the write |
| `rejectedHeading` · `rejectedItem` | לא ייטענו, כי שדה בהם לא תקין: · `{סוג}` `{מקום}`, `{שדה}`: `{בעיה}`. | e.g. "מטרה 2, שנות החיסכון: לא מספר." (A33) |
| `rejectedKinds` | מטרה · החזקה · השוואה שמורה · ערך במדריך · הצעה · הנחות לחשיפה · סימונים | |
| `rejectedProblems` | המבנה לא תקין · לא מספר · מתחת לאפס · מעל 100 · לא מספר שלם בין 1 ל־40 · לא בין 15 ל־100 · לא תאריך · סוג חיסכון לא מוכר · גדול מהיתרה | the form's own rules (horizon 1 to 40 from `goal-presets.json`, age 15 to 100, percent 0 to 100, balance at least zero) |
| `rejectedFields` | the Hebrew name of each goal and holding field (שנות החיסכון, הסכום עכשיו, היתרה, דמי הניהול מחיסכון ...) | |

**Added 2026-10-24, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed. Where the build's wording was changed, the note says what it was.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `r3transfer.modeLabel` | מה לעשות עם מה שיש במכשיר | the mode choice's screen-reader name |
| `r3transfer.deleted` | מה שיובא נמחק. | after "מחיקת מה שיובא" |
| `r3transfer.unavailable` | אי אפשר לשמור במכשיר הזה. מה שנטען יישאר רק בזמן הביקור. | storage unavailable on import |
| `r3transfer.loading` | טוען… | |

### 7.5 Additions to existing screens

| Where | Hebrew |
|---|---|
| Result, row detail (after the fee rows) | מה העמלות כאן עולות לכם · כל המסלולים בכל החברות |
| Result, "יש לכם כבר כזה?" line | יש לכם כבר כזה? הזינו מהדוח. |
| Guide page, fees block, last line | כמה העמלות האלה עולות לאורך זמן |
| Company page, group heading link | לכל המסלולים של `{מוצר}` בכל החברות |
| Track page, key-value card, last row | מה העמלות האלה יעלו לכם |

### 7.6 Why these words

- **"שווה להתמקח"** rather than "כדאי לנהל משא ומתן": the founder's own words were "which battles to fight" and P-03's rationale says "שווה שיחת טלפון"; "להתמקח" is the everyday verb and fits a tag. Not "שווה שיחה": a call is one way to negotiate; the verdict is about the fee.
- **"שווה להימנע"** keeps F-62's meaning (avoid by choosing differently); the reason line and the removed-by line say how. Not "להחליף": the site does not tell a person to switch (B3 posture).
- **"לא שווה את הטרחה"** says the effort is not worth it, not that the fee is fair; the reason line says which threshold was missed, or that no reference exists.
- **"אין ממוצע להשוואה"** rather than "אין נתון": there is a number somewhere (the Bank's, TASE's, the ISA's); the site may not show it or has not confirmed it, and the reason says which.
- **"ממוצע הרשות למסלולי {סיווג}"** names what F-68 computes: the regulator's data, averaged by the site across one classification. "חציון" is the everyday statistics word; the glossary explains it.
- **"השפעה משולבת"** for the interaction remainder: the costs of fees taken one at a time do not add up to the total because they compound on each other; "משולבת" says so without jargon ("שארית אינטראקציה" would be opaque).
- **"בכסף של היום"** stays from release 1 for real values; the fee page has no nominal view (F-61 is real).
- **"אבקש להוריד"** in the negotiation text: first person future is gender-neutral and is what the person will say; the site's voice stays out of the text.
- **"איפה זה בדוח"** mirrors release 2's "איפה זה בתלוש"; the body is honest in the same way (no label the rule base does not hold).
- **"מה כבר יש לכם"** for holdings: plain words for "what you already hold"; "אחזקות" appears as the list heading because it is the statement's word.
- **"אפשר לאחד" / "לא ניתן לאחד"**: "לאחד" is the everyday verb; the glossary's "איחוד חשבונות" and "העברת כספים בין קופות גמל" (ניוד) are the formal terms and open from the card.
- **"כללי ההעברה עוד לא נמצאו"** says the site has not found the rule, never that a transfer is barred.
- **"להעביר למכשיר אחר"** rather than "ייצוא וייבוא": the person's goal is the other device, not the file; "לשמור קובץ" and "לטעון קובץ" name the two halves in verbs a phone user knows. "יובא ב־{תאריך}" uses the formal verb once, as a tag.
- **"ממוצע הוא מה שהעמיתים שילמו בפועל, לא הצעה אליכם"** sits under the sort control so that sorting by fee is never read as the site ranking tracks (F-64 ranks nothing; CAT-37).
- **Added 2026-10-24** (the build's strings, folded the same day): **"עוד לא דווח"** replaces "טרם דווח", the wording release 1 settled for an empty fee field. **"התרחיש לדוגמה"** is P-05's name wherever the fee page or a holding card runs on it (the parameters page's name for P-05), never "תרחיש הדגמה" or "התרחיש המייצג"; "הרשומה המייצגת" stays for the instrument P-05 names, and "מסלול מייצג" for its track. **"הטקסט של הכלל הזה עוד לא נמצא במאגר הכללים של האתר"** is the one sentence for a rule the bundle lacks (6.1's). **"בודק…"** like "טוען…": the site speaks in the singular when it reports its own work. **"מצבים שחוסמים העברה"** for PF-17's reg. 4 blocks: cases the person marks, not questions, so a noun phrase.

## 8. Release 4 screens

Added 2026-10-24 for the briefs in `docs/flows.md` section 15 and the handoff in `docs/design-spec.md` sections 16 to 20. Same voice and conventions as section 1: plural imperative or impersonal, no typed figures (every `{…}` is a value object with its state), names as the source writes them, codes after the words. Fee names are the glossary's terms (section 7's list; the four provider fee types here are "עמלת קנייה ומכירה", "דמי ניהול פיקדון ניירות ערך", "המרת מטבע", "דמי חשבון קבועים"). Rule texts are never retyped here: a step, a protection line or a condition renders the rule base's text with its chip. Status: **draft** (2026-10-24), to be settled by the founder as sections 3, 6 and 7 were. Every wording choice is "chosen 2026-10-24, revisable"; section 8.6 says why.

### 8.0 Everywhere in release 4

| Element | Hebrew |
|---|---|
| Fee levels, three (D4) | תעריפון · ממוצע שפורסם · ההצעה שלכם |
| Provider class words | בנק · בית השקעות · חברה מנהלת · מנהל קרנות |
| Regulator names | בנק ישראל · רשות ניירות ערך · רשות שוק ההון, ביטוח וחיסכון |
| Provider fee types, four (F-63) | עמלת קנייה ומכירה · דמי ניהול פיקדון ניירות ערך · המרת מטבע · דמי חשבון קבועים |
| Not comparable, heading and tag | אי אפשר להשוות · changed 2026-10-24 (Hebrew editor); was ״לא ניתן להשוות״ |
| Not comparable, reasons (F-63 codes) | התעריפון לא נאסף. · בתעריפון אין שורה ל`{סוג הנייר}`. · בתעריפון אין שורה ל`{סוג הנייר}` ב`{ערוץ}`. · לא נאסף ממוצע לשורות שחלות על `{סוג הנייר}`. · בשורה "`{שם השורה}`" חסר ערך בתעריפון. |
| Recorded reason disclosure | הסיבה כפי שנרשמה בקובץ הנתונים |
| No average collected | אין ממוצע שנאסף |
| No average, reason | ממוצעי בנק ישראל ומחשבון העמלות של הבורסה מוצגים רק בקישור: הפרסום מחדש דורש הסכמה בכתב. |
| No average, links out | ללוח הנתונים של בנק ישראל · למחשבון העמלות של הבורסה · changed 2026-10-24 (Hebrew editor); was ״לדשבורד העמלות של בנק ישראל״ |
| Not collected (a fee, a list, a record) | לא נאסף · לא נאספה · עוד לא נאספו |
| Not printed (a list field) | לא מודפס |
| Stale tariff line | התעריפון נאסף ב־`{תאריך}`; מאז ייתכן שהשתנה. |
| No published date | ללא תאריך פרסום |
| Entered tag (provider row) | לפי ההצעה שלכם |
| Strength chip words (D10) | ראשי · ראשי (עותק) · לפי החברה · משני · ניסיון · שאלה פתוחה · changed 2026-10-24 (Hebrew editor); was ״מוסדי״ |
| Strength chip, copy popover | המקור הרשמי נקרא בעותק שמתארח ב`{אתר}`, נבדק ב־`{תאריך}`. |
| Experience label | ניסיון של אדם אחד, לא כלל. |
| Instrument class words | קרן סל · מניות ואיגרות חוב · יחידות של קרן נאמנות · ניירות ערך זרים · קרן חוץ הנסחרת בבורסה · מק״מ · קרן כספית · changed 2026-10-24 (Hebrew editor); was ״מניות ואגרות חוב״ |
| Domicile words | ישראל · אירלנד · ארה״ב · `{קוד}` |
| Distribution policy words | לא מחלקת · מחלקת · לא נאסף |
| Links to the provider workbench | איזה בנק או בית השקעות · השוואת ספקים לקרן הזו · להשוואת הספקים |
| Links to the fund-variant page | איזו קרן לקנות · כל הקרנות על `{חשיפה}` · להחליף קרן · changed 2026-10-24 (Hebrew editor); was ״החליפו קרן״ |
| Links to the playbook | איך עוברים · המדריך למעבר · איך עוברים לחברה אחרת · ואם תחליטו לעבור: המדריך למעבר |
| Workbench tabs | לפי ספק · לפי מסלול · לפי קרן |
| Later releases | ~~סינון לפי ירידה שתסכימו לספוג יתווסף בהמשך~~ (retired by 9.0; `r4workbench.later` is not rendered) |

**Added 2026-10-24, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed. Where the build's wording was changed, the note says what it was.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `r4playbook.chip` | ראשי · ראשי (עותק) · לפי החברה · משני · ניסיון · שאלה פתוחה | changed 2026-10-24 (Hebrew editor); was ״ראשי, בעותק״ · the row above was "ראשוני · ראשוני, בעותק · … · פתוח" (changed 2026-10-24): the site's strength labels since release 1 are "מקור ראשי" and "שאלה פתוחה" (section 2), and one strength has one word. `docs/design-system.md` 8.5, `docs/flows.md` 15.3 and `docs/design-spec.md` 19 still write "ראשוני" · changed 2026-10-24 (Hebrew editor); was ״מוסדי״ |
| `r4playbook.hosts` | אנליסט · ויקיטקסט · נבו · מיטב | the `{אתר}` of the copy popover, as the rule base's sources name them |
| `r4workbench.notComparable.ambiguous` | בתעריפון יש כמה שורות שחלות על `{סוג הנייר}`, ולאתר אין עדיין דרך לבחור ביניהן בלי לנחש: | the sixth F-63 reason (`ambiguous-lines`): a plan or a sub-class the engine will not choose between; the lines follow |
| `r4workbench.notComparable.codes` | — | removed 2026-10-24 (B7): the file's code words ("data-missing" …) are no longer shown beside the reason or in the coverage list; both show the reason sentence of the 8.0 table. `r4workbench.later` is also removed |
| `r4workbench.instrumentClasses[tase_foreign_fund_units]` | קרן חוץ הנסחרת בבורסה | added to the class words above |
| `r4workbench.tabs.aria` | תצוגות של ההשוואה | the tabs' screen-reader name |
| `r4workbench.enteredTag · noPublishedDate` | לפי ההצעה שלכם · ללא תאריך פרסום | as the rows above |

### 8.1 Provider workbench page

| Element | Hebrew |
|---|---|
| Title | איזה בנק או בית השקעות: `{מוצר}` |
| Subject strip | לפי `{שם הקרן}` · `{מספר נייר}` · `{סוג הנייר}` |
| Subject strip, from P-05 | לפי הרשומה המייצגת: `{שם הקרן}` · `{מספר נייר}` |
| Subject strip, link | להחליף קרן · changed 2026-10-24 (Hebrew editor); was ״החליפו קרן״ |
| No fund | בחרו קרן כדי להשוות ספקים. |
| Tracks tab, brokerage | למוצר הזה אין מסלולים בנתוני הרשות. |
| Behaviour card title | הפעילות שלכם · changed 2026-10-24 (Hebrew editor); was ״ההתנהגות שלכם״ |
| Trades a month | פעולות בחודש |
| Trades a month, hint | כל הפקדה חודשית מתחלקת ל־`{מספר}` פקודות, ולכל פקודה עמלה משלה. · פקודה אחת · לשתי פקודות (changed 2026-10-24) |
| Channel | ערוץ |
| Channel options | ערוצים ישירים · סניף |
| Channel, brokers | לא רלוונטי לבתי השקעות |
| FX fact, foreign currency | הקרן נקובה ב`{מטבע}`: כל הפקדה מומרת. |
| FX fact, shekels | הקרן נקובה בשקלים: אין המרה. |
| Deposits fact | הפקדה אחת בכל חודש של השנה. |
| Fee-level switch (screen-reader name) | רמת העמלה |
| Level line, list | לפי התעריפון המלא של כל ספק, בלי הנחות. · changed 2026-10-24 (Hebrew editor); was ״לפי התעריפון המלא של כל ספק, במחיר המחירון, בלי הנחות.״ |
| Level line, average, none collected | אין ממוצע שנאסף: ממוצעי בנק ישראל ומחשבון העמלות של הבורסה מוצגים רק בקישור. |
| Level line, average, collected | ממוצע העמלות שנגבו בפועל, כפי שפורסם ב`{מקור}`. ספק בלי ממוצע מופיע כ״אי אפשר להשוות״. · changed 2026-10-24 (Hebrew editor); was ״ספק בלי ממוצע מופיע כלא ניתן להשוות.״ |
| Level line, entered | ההצעה שלכם מושווית לתעריפון של האחרים. |
| Entered, none yet | עוד לא הזנתם הצעה. |
| Entered, link | להזין הצעה · changed 2026-10-24 (Hebrew editor); was ״הזינו הצעה״ |
| Entered, count in the segment | ההצעה שלכם · `{מספר}` |
| Table heading | לפי העלות, מהזולה ליקרה · changed 2026-10-24 (Hebrew editor); was ״לפי העלות, מהזולה לגבוהה״ |
| Horizon cost | `{סכום}` ב־`{שנים}`, בכסף של היום |
| Year-one cost | `{סכום}` בשנה הראשונה |
| Year-one tag | בשקלים של השנה הראשונה |
| Bar legend (screen-reader name) | לפי סוג עמלה |
| Deciding line | מכריע מול `{ספק}`: `{סוג העמלה}` |
| Deciding, detail | הפער לפי סוג: `{סוג}` `{סכום}` … |
| Tie | שקולה ל־`{ספק}` · שקולות: `{ספקים}` |
| Tie, threshold line | ההפרש קטן מסף התיקו של האתר: `{אחוז}`. פרמטר של האתר. |
| Tariff line | תעריפון מ־`{תאריך}`, נאסף ב־`{תאריך}` |
| Tariff link | לתעריפון `(PDF)` (the file format follows in brackets, isolated left to right, at the end; changed 2026-10-24, UX fix 32) |
| Minimums | מינימום לפתיחת חשבון: `{סכום}` · לא נמצא בתעריפון |
| Per-trade bounds | מינימום לפעולה `{סכום}` · מקסימום `{סכום}` |
| Protection | מפוקח: `{רגולטור}` |
| TASE member tag | חבר בורסה |
| Not ISA supervised (BRK-06) | לא מפוקח על ידי רשות ניירות ערך |
| Protection disclosure | מה מגן על הכסף |
| Not modelled | לא נכלל בחישוב: `{שם השורה}`. הנוסחה לעמלה הזו עוד לא נכתבה. `{קוד}` |
| No line | אין בתעריפון שורה ל`{בסיס}`; לא נגבה בחישוב. |
| Fixed fee spread | `{שם השורה}` נפרסו לחודשים. |
| Row links | קיבלתם הצעה? הזינו אותה · איך עוברים · מה העמלות האלה יעלו לכם · לעמוד `{ספק}` |
| Row detail heading | השורות שנקראו מהתעריפון |
| Row detail, entered lines | הוחלפו בהצעה שלכם: `{שורות}` |
| Row detail, type costs | העלות לפי סוג עמלה |
| Not comparable heading | אי אפשר להשוות · changed 2026-10-24 (Hebrew editor); was ״לא ניתן להשוות״ |
| Not comparable, offer link | יש לכם הצעה מ`{ספק}`? הזינו אותה |
| Coverage sentence | נבדקו `{מספר}` ספקים: `{מספר}` דורגו, `{מספר}` אי אפשר להשוות. · נבדק ספק אחד: … · נבדקו שני ספקים: … · אחד דורג · שניים דורגו · changed 2026-10-24 (Hebrew editor); was ״לא ניתן להשוות״ · count forms 2026-10-24 (sweep) |
| Coverage, one ranked | דורג `{מספר}` מתוך `{מספר}` ספקים. |
| Coverage groups | דורגו · אי אפשר להשוות · changed 2026-10-24 (Hebrew editor); was ״לא ניתן להשוות״ |
| All missing | אין עדיין תעריפון שנאסף למוצר הזה. |
| Provident wrapper | למוצר הזה הדירוג הוא לפי מסלול. כאן מופיעים דמי הניהול לפי התעריפון של כל חברה, בלי דירוג. · changed 2026-10-24 (Hebrew editor); was ״כאן מופיעים דמי הניהול לפי המחירון של כל חברה, בלי דירוג.״ |
| Provident listing label | דמי ניהול לפי התעריפון של החברה, לא מדורג · changed 2026-10-24 (Hebrew editor); was ״דמי ניהול לפי המחירון של החברה, לא מדורג״ |
| Chart title | העלות המצטברת לאורך הזמן |
| Chart marker | שנה ראשונה · מועד המטרה · סוף התקופה |
| Chart, dashed caption | הקו המקווקו מבוסס על הצעה שהזנתם. |
| Chart's screen-reader name | גרף: העמלות המצטברות של `{מספר}` ספקים לאורך `{שנים}`. הנתונים המלאים בטבלה. |
| Offer card title | ההצעה שלכם מ`{ספק}` |
| Offer card, hint | מלאו רק את השורות שהוצעו לכם; השאר נשאר לפי התעריפון. |
| Offer fields | עמלת קנייה ומכירה · דמי ניהול פיקדון ניירות ערך · המרת מטבע · דמי חשבון קבועים |
| Offer sub-fields | אחוז · מינימום · מקסימום · אחוז ל`{תקופה}` · ₪ לחודש |
| Period words | לחודש · לרבעון · לשנה |
| Placeholder | תעריפון: `{ערך}` |
| Above the list | גבוה מהתעריפון |
| Who and when | מי הציע ומתי · מי הציע (לא חובה) · תאריך ההצעה |
| Offer, binding line | להצעה שלא בכתב לא נמצא כלל שמחייב אותה. שאלה פתוחה SW OQ4 |
| Offer buttons | שמירה · ניקוי ההצעה · ביטול |
| Links | כל הקרנות על `{חשיפה}` · לעמוד המדריך |
| Loading | טוען… |

**Errors:**

| Case | Hebrew |
|---|---|
| Percent above 100 | הזינו אחוז בין 0 ל־ `{מקסימום}`. · changed 2026-10-24 (Hebrew editor); was ״הזינו אחוז עד״ |
| Negative amount | הסכום לא יכול להיות שלילי. |
| Offer date in the future | תאריך ההצעה עוד לא הגיע. |
| Minimum above maximum | המינימום לא יכול להיות גבוה מהמקסימום. |
| Trades a month out of range | הזינו בין `{מינימום}` ל־`{מקסימום}` פעולות בחודש. |

**Added 2026-10-24, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed. Where the build's wording was changed, the note says what it was.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `r4workbench.providers.behaviour.deposits` | הפקדה אחת בכל חודש של השנה. | the row above was "12 הפקדות בשנה, אחת לכל הפקדה חודשית." (changed 2026-10-24): no typed figure, even for A-28's twelve |
| `r4workbench.providers.back` | המדריך למוצר | the breadcrumb parent |
| `r4workbench.providers.noGoal` | אין מטרה שמורה: ההשוואה לפי התרחיש לדוגמה של האתר. | Was "…ההשוואה רצה על התרחיש המייצג של האתר.": P-05 is "התרחיש לדוגמה" (3.15) |
| `r4workbench.providers.behaviour.ordersUp · ordersDown` | עוד פעולה בחודש · פחות פעולות בחודש | the stepper's screen-reader names |
| `r4workbench.providers.behaviour.chips` | סכום · הפקדה חודשית · שנים · כל ההנחות | the amounts chips |
| `r4workbench.providers.columns` | דירוג · ספק · עלות · בשנה הראשונה · לפי סוג עמלה · תעריפון מ־ · מינימום · פיקוח · פתיחה | PC column heads |
| `r4workbench.providers.tariffLine.collected` | נאסף ב־`{תאריך}` | the tariff line when no published date exists |
| `r4workbench.providers.formats` | PDF · דף אינטרנט · גיליון | the tariff link's file format |
| `r4workbench.providers.notModelledF18 · notModelledOther` | הנוסחה לעמלה הזו עוד לא נכתבה. · עמלה שאינה חלק מעלות ההחזקה השוטפת. | the two reasons a tariff line is left out: the method has no formula (G-18), or the line is not a holding cost (a transfer out) |
| `r4workbench.providers.noLineBases` | קנייה ומכירה · דמי ניהול פיקדון ניירות ערך · המרת מטבע | the `{בסיס}` of "אין בתעריפון שורה ל`{בסיס}`" |
| `r4workbench.providers.rowLinks.edit` | עריכת ההצעה שלכם | when an offer exists. Was "הצעה שלכם: עריכה" |
| `r4workbench.providers.vsTag · vsSet · vsClear` | מושווה · להשוות אליו · ביטול ההשוואה | choosing which row "מכריע מול" is measured against. Were "השוו אליו · בטלו השוואה": buttons are nouns or infinitives (section 2) |
| `r4workbench.providers.detail.remainder · rate · min · max · period · channel · level · fromAverage · rules · bases` | השפעה משולבת של העמלות · שיעור · מינימום · מקסימום · תקופה · ערוץ · רמה · ממוצע · הכללים שהחישוב נשען עליהם · קנייה ומכירה · דמי ניהול פיקדון · המרת מטבע · דמי חשבון קבועים | the row detail's labels. The rules heading was "הכללים שהחישוב קרא"; 6.2's is "הכללים שההשוואה נשענת עליהם" |
| `r4workbench.providers.notComparableLinks.tariff` | לעמוד התעריפון של `{ספק}` | |
| `r4workbench.providers.provident.toTracks · balance · deposit · noFee · tariff` | לדירוג לפי מסלול · מחיסכון · מהפקדה · לא נמצא בתעריפון · תעריפון | the provident listing's link, column words and empty cell. Were "מהצבירה · מההפקדה": the glossary's words are "מחיסכון" and "מהפקדה" (7.2's sub-labels) |
| `r4workbench.providers.chart.year · today · yearOneMarker · legendVs · realNote` | שנה · היום · שנה ראשונה · מושווה · העמלות ששולמו עד החודש הזה, בכסף של היום. הנקודה האחרונה כוללת את עמלת המכירה. | the chart's readout, marker and reading. The reading was "העמלות ששולמו עד החודש, בכסף של היום. הסוף כולל את עמלת המכירה." |
| `r4workbench.providers.offer.belowTable · noStorage · empty · noList` | ההצעה שלכם מושווית לתעריפון של האחרים. · אי אפשר לשמור במכשיר הזה. ההצעה תישאר רק בזמן הביקור. · מלאו לפחות שורה אחת. · אין שורה כזו בתעריפון | the storage note was "אי אפשר לשמור במכשיר הזה: ההצעה תישאר רק בביקור הזה." (7.2's pattern) |
| `r4workbench.providers.offer.errors.needRate` | הזינו קודם את השיעור של השורה. | a bound without a rate |
| `r4workbench.providers.failed` | האתר לא הצליח לטעון את נתוני הספקים. נסו לרענן. | · changed 2026-10-24 (Hebrew editor); was ״לא הצלחנו לטעון את נתוני הספקים. נסו לרענן.״ |
| `r4workbench.providers.cannotRun.*` | אין עדיין השוואת ספקים לקרן מהסוג הזה. · הזינו את שער ה`{מטבע}` בעמוד הקרנות כדי להשוות ספקים. · הקרן מחלקת: הזינו את תשואת החלוקה בעמוד הקרנות כדי להשוות ספקים. · החישוב נעצר על נתון בתעריפון: `{פרט}` · אין השוואת ספקים למוצר הזה. · אין קרן מייצגת למוצר הזה. | the cases the page cannot run |
| `r4workbench.providers.pendingLine · incompleteRules` | התוצאה חלקית: העמלה `{מזהה}` עוד לא מחושבת. · הנוסחה לעמלות על חלוקת רווחים עוד לא נכתבה, ולכן הדירוג חלקי. | partial results |
| `r4workbench.providers.behaviour.ordersHint` | כל הפקדה חודשית מתחלקת ל־`{מספר}` פקודות, ולכל פקודה עמלה משלה. · כל הפקדה חודשית היא פקודה אחת, ולכל פקודה עמלה משלה. · כל הפקדה חודשית מתחלקת לשתי פקודות, ולכל פקודה עמלה משלה. | B14, added 2026-10-24 (QA fixes): the number is a Num inside the sentence for three and more; one and two are words. Was a function that typed the digit |

### 8.2 Fund-variant page

| Element | Hebrew |
|---|---|
| Title | כל הקרנות שעוקבות אחרי `{חשיפה}` |
| List line, both collected | לפי רשימת הקרנות של מאיה מ־`{תאריך}` ורשימת קרנות החוץ של הבורסה מ־`{תאריך}`, ולפי הרשומות שנאספו. |
| List line, Israeli list not collected | רשימת הקרנות הישראליות עוד לא נאספה; מוצגות הקרנות שיש להן רשומה. הרשימה המלאה במאיה. |
| List line, TASE list not collected | רשימת קרנות החוץ של הבורסה עוד לא נאספה. הרשימה המלאה באתר הבורסה. |
| List links | לרשימת הקרנות במאיה · לרשימת קרנות החוץ באתר הבורסה |
| Old list | הרשימה לא עודכנה מאז `{תאריך}`. |
| Assumption chips | סכום · הפקדה חודשית · שנים · תשואה ב`{מטבע}` · אינפלציה · שינוי שער `{מטבע}` · שער `{מטבע}` היום · W-8BEN · התעריפון של `{ספק}` · פעולות בחודש · כל ההנחות |
| Assumptions sheet title | ההנחות של השוואת הקרנות |
| W-8BEN field | יש לכם טופס W-8BEN אצל הברוקר? · כן · לא |
| W-8BEN, line | עובדה שלכם, לא כלל. |
| FX fields, D20 line | שערי בנק ישראל מוצגים רק בקישור; הזינו את השער. |
| FX link | לשערי בנק ישראל |
| Distribution yield field | תשואת החלוקה של `{קרן}` (אחוז בשנה) · תשלומים בשנה |
| Distribution yield, line | הרשומה של הקרן לא כוללת תשואת חלוקה; הזינו מהמסמכים של הקרן. |
| Provider chip, from P-05 | התעריפון של `{ספק}` (הרשומה המייצגת) |
| Filter field | חיפוש קרן, מנהל או מספר |
| Sort options | לפי הדירוג · דמי ניהול · שם |
| Sort line | הדירוג נשען על התשואה שהזנתם ועל הפרטים שנאספו לכל קרן. |
| List heading | לפי מה שנשאר לכם, מהגבוה לנמוך |
| Group headings | דורגו · מוצגות בלי דירוג · עוד לא נבדקו · changed 2026-10-24 (Hebrew editor); was ״מוצגות, לא מדורגות״ |
| Security number | מספר נייר · העתקה · הועתק |
| Source tags | ברשימת מאיה · ברשימת קרנות החוץ של הבורסה · רשומה שנאספה · לא ברשימה האחרונה |
| Domicile tag (screen-reader prefix) | מדינת המוצא: `{מדינה}` |
| Policy tags | לא מחלקת · מחלקת · לא נאסף |
| Trading line | נסחרת בשקלים בבורסה · נקנית ב`{מטבע}` בחו״ל · נקובה ב`{מטבע}` |
| Fee labels | דמי ניהול קבועים · שכר נאמן · דמי ניהול משתנים · הפרש עקיבה, שנה אחרונה · מרווח ציטוט חציוני · changed 2026-10-24 (Hebrew editor); was ״דמי נאמן״ |
| Fee not collected | לא נאסף · נלקח כאפס בחישוב |
| Value label | נשאר לכם במועד המטרה, בכסף של היום |
| Reason, no record | הפרטים עוד לא נאספו. |
| Reason, field missing | הפרטים עוד לא נאספו: `{שדה}`. |
| Field names | דמי ניהול קבועים · מדיניות חלוקה · מעמד מס |
| Reason, accumulating foreign fund (G-18) | מקור משני: רשות המסים לא אישרה שקרן זרה שאינה מחלקת ממוסה רק במכירה. שאלה פתוחה TXF OQ1 |
| Reason, taxable Israeli fund | לקרן נאמנות חייבת אין עדיין חישוב. |
| Reason, yield missing | הזינו את תשואת החלוקה. |
| Reason, start rate missing | הזינו את שער ה`{מטבע}`. |
| Reason, withholding not set | ניכוי במקור ב`{מדינה}`: לא נקבע. |
| Reason, money-market | סוג הקרן הכספית אינו ברשומה. |
| Reason, other currency | אין חישוב לקרן ב`{מטבע}` על חשיפה ב`{מטבע}`. |
| Reason, exit blocked | המס ביציאה חסום: שאלה פתוחה `{קוד}` |
| Row links | השוואת ספקים לקרן הזו · מה לבדוק |
| Group line (G-29) | קרנות זרות הנסחרות בחו״ל: `{מספר}` מוחזקות אחת־אחת והושוו; לרשימה המלאה אין מקור. ETF OQ4 |
| Coverage sentence | נבדקו `{מספר}` קרנות: `{מספר}` דורגו, `{מספר}` מוצגות בלי דירוג, `{מספר}` עוד לא נבדקו, וקבוצה אחת. |
| No funds at all | האתר עוד לא מכיר קרן על `{חשיפה}`. |
| Cash-like exposure | לקרן כספית אין כאן השוואה: סוג הקרן אינו ברשומה. |
| Its link | למדריך על קרן כספית |
| No return | לא הוזן: האתר לא מנחש תשואה. |
| Duplicate records | שתי רשומות לאותו נייר · לא הוכרע |

**Added 2026-10-24, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed. Where the build's wording was changed, the note says what it was.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `r4workbench.funds.fees[tracking_difference_12m]` | הפרש עקיבה, שנה אחרונה | the fee-labels row above was "הפרש עקיבה, 12 חודשים" (changed 2026-10-24): no typed figure |
| `r4workbench.funds.back` | המדריך לחשיפה | the breadcrumb parent |
| `r4workbench.funds.listLine.onlyIsraeli · onlyTase` | לפי רשימת הקרנות של מאיה מ־`{תאריך}`, ולפי הרשומות שנאספו. · לפי רשימת קרנות החוץ של הבורסה מ־`{תאריך}`, ולפי הרשומות שנאספו. | one list collected, the other not |
| `r4workbench.funds.sheet.fxChangeLabel · fxStartLabel` | שינוי שער `{מטבע}` בשנה (אחוז) · שער `{מטבע}` היום (₪) | the A-03 field and the start rate (D20: entered) |
| `r4workbench.funds.sheet.providerLabel · providerChange · goalLead · reset` | הספק שהתעריפון שלו נכנס לחישוב · להחליף ספק · הסכום, ההפקדה והשנים הם של המטרה השמורה: · איפוס | the provider chooser and the goal line. The label was "הספק שהתעריפון שלו מחושב" · changed 2026-10-24 (Hebrew editor); was ״החליפו ספק״ |
| `r4workbench.funds.sort.aria · name` | סדר ההצגה · שם | Were "מיון · לפי שם": 7.3's words |
| `r4workbench.funds.columns` | דירוג · קרן · מספר נייר · מקור · מדינת המוצא · חלוקה · דמי ניהול · נשאר לכם · תוצאה · פתיחה | PC column heads |
| `r4workbench.funds.feesHeading` | עלויות הקרן | the fee block's heading in the row · changed 2026-10-24 (Hebrew editor); was ״דמי הקרן״ |
| `r4workbench.funds.outcomes` | דורגה · מוצגת, לא מדורגת · עוד לא נבדקה | the one-row outcome words, as 6.0 |
| `r4workbench.funds.reasons.other` | אין חישוב לקרן הזו: `{פרט}` | an engine reason the table has no sentence for, with its detail as data |
| `r4workbench.funds.secondaryTag` | מקור משני | the tag on the G-18 reason |
| `r4workbench.funds.detail.*` | פירוט החישוב · הסכומים ששולמו לאורך הדרך, בשקלים של אז; השורה האחרונה בכסף של היום. · עלויות הקרן · מרווח הקנייה והמכירה · עמלות הספק · מס במהלך התקופה · מס ביציאה · נשאר לכם · הכללים שהחישוב נשען עליהם | the row detail. The rules heading was "הכללים שהחישוב קרא" |
| `r4workbench.funds.noFundsCopy` | העתקת השם | the copy button under "האתר עוד לא מכיר קרן על `{חשיפה}`", as 7.2's. Was "העתקת השם לבקשה" |
| `r4workbench.funds.more · noMatch` | עוד `{מספר}` קרנות · אין קרן שמתאימה לחיפוש. | paging and an empty search |
| `r4workbench.funds.providerNote.*` | החישוב לפי התעריפון של `{ספק}`. · החישוב לפי התעריפון של `{ספק}` (הרשומה המייצגת). · התעריפון של `{ספק}` לא נאסף; החישוב לפי הרשומה המייצגת. | which tariff the run used |
| `r4workbench.funds.loading · failed · noExposure` | טוען… · האתר לא הצליח לטעון את נתוני הקרנות. נסו לרענן. · אין חשיפה כזו באתר. | · changed 2026-10-24 (Hebrew editor); was ״לא הצלחנו לטעון את נתוני הקרנות. נסו לרענן.״ |
| `r4workbench.funds.needsReturn · needsReturnLink` | הזינו תשואה במטרה השמורה כדי לדרג את הקרנות. · למטרה | |
| `r4workbench.funds.coverage` | נבדקו `{מספר}` קרנות: `{מספר}` דורגו, … · נבדקה קרן אחת: … · אחת דורגה · אחת מוצגת בלי דירוג · אחת עוד לא נבדקה · וקבוצה אחת. | B14, added 2026-10-24 (QA fixes): singular forms when a count is one ("אחת" in the number component with the singular verb). The sentence's parts are `before · oneFund · midOne · one · many · end` |
| `r4workbench.funds.more · groupsOne` | עוד קרן אחת (for one) · דורגה · מוצגת, לא מדורגת · עוד לא נבדקה | the paging button and a group heading with one row (the outcome words of 5.0 in the singular) |
| `r4workbench.funds.chips.return` | תשואה ב־`{מטבע}` | the maqaf before the currency code (was "תשואה ב`{מטבע}`") |
| `r4workbench.funds.groups.waits · groupsOne.waits · coverage.many.waits · coverage.one.waits` | ממתינות לתשואה · ממתינה לתשואה · ממתינות לתשואה · אחת ממתינה לתשואה | B14, added 2026-10-24 (QA fixes): with no return entered nothing is ranked, so the group that would be "דורגו" is named for what it waits for (the sentence and the heading) |

### 8.3 Switching playbook page

| Element | Hebrew |
|---|---|
| Title | איך עוברים: `{מוצר}` |
| Lede | השלבים כפי שהכללים קובעים אותם: מה חותמים, מה לצפות, ומה חוזק המקור של כל שלב. לא המלצה לעבור. |
| Subject strip | מ`{ספק}` ל`{ספק}` · מ`{ספק}` |
| Pair fields | מאיפה · לאן · בחרו מאיפה ולאן (לא חובה) |
| Same company | אותה חברה: החלפת מסלול בתוך הקופה. |
| Steps heading | השלבים, לפי הכללים |
| Step number | שלב `{מספר}` |
| Labelled lines | מה חותמים: · מה לצפות: |
| Figure present | בתוך `{מספר}` ימי עסקים · בתוך `{מספר}` ימים · `{מספר}` חודשים |
| Figure file missing | בתוך התקופה שהחוזר קובע |
| Open question line | שאלה פתוחה `{קוד}`: `{מה לא נמצא}` |
| Institution-only prefix | לפי הוראות המוסדות: |
| No rule found (SW-19) | שיחת שימור: לא נמצא כלל |
| No rule, head | לא נמצא כלל על שיחת שימור במוצרי גמל. |
| No rule, known | מה כן ידוע |
| Experience disclosure | מה אנשים מספרים |
| Experience, source line | מקור: `{פורום}`, `{שרשור}`, נקרא ב־`{תאריך}` |
| Experience not shipped | ניסיון מהפורומים לא נכלל בגרסה הזו. |
| Record-offer card title | רשמו כל הצעה |
| Record-offer, lede | הצעות גם מתבטלות. רשמו כל הצעה עם התאריך שלה. · changed 2026-10-24 (Hebrew editor); was ״הצעות נמשכות. רשמו כל הצעה עם התאריך שלה.״ |
| Record-offer, items | מאיזה ספק · כל שורת עמלה והמינימום שלה · מי אמר · באיזה תאריך · בכתב או בטלפון |
| Record-offer, copy | העתקת תבנית לרישום · הועתק |
| Record-offer, template | הצעה מ___, בתאריך ___: עמלת קנייה ומכירה ___ (מינימום ___); דמי ניהול פיקדון ניירות ערך ___; המרת מטבע ___; דמי חשבון ___. מי הציע: ___. בכתב: כן / לא. |
| Record-offer, link | ההצעות שהזנתם בהשוואת הספקים |
| Cost, brokerage (F-66) | המעבר מ`{קרן}` ל`{קרן}` עכשיו יעלה `{סכום}` בכסף של היום, מזה מס במכירה `{סכום}`. |
| Cost, brokerage detail | בלי מעבר היו נשארים `{סכום}`; עם המעבר, `{סכום}`. התמורה אחרי המס פותחת את הקרן החדשה: `{סכום}`. |
| Cost, provident | המעבר לא עולה כלום לפי הכללים. |
| Cost, provident lines | הנחה בדמי ניהול יכולה להסתיים מוקדם במעבר. · דמי הצטרפות, אם החברה גובה: לפי התעריפון של החברה. · changed 2026-10-24 (Hebrew editor); was ״דמי הצטרפות, אם החברה גובה: לפי המחירון של החברה.״ |
| Cost, in kind (SW-36) | לפי הצהרות של מוסדות בלבד: העברה לחשבון של אותו בעלים אינה אירוע מס. שאלה פתוחה SW OQ11 |
| Cost, transfer fee | עמלת העברת ניירות ערך: `{סכום}` · לא נאסף |
| Cost, hishtalmut partial | אי אפשר: קרן השתלמות עוברת רק בשלמותה. · changed 2026-10-24 (Hebrew editor); was ״לא ניתן:״ |
| Cost, different kinds | לא נבדק: אין כלל שאומר שהעברה בין שני סוגים פטורה ממס. · changed 2026-10-24 (Hebrew editor); was ״אין כלל שאומר שהעברה בין שני סוגים חופשית ממס.״ |
| Cost, rule open | חסום: שאלה פתוחה `{קוד}` |
| Checklist heading | מה לבדוק אחרי המעבר |
| Checklist reset | איפוס · לאפס את הסימונים? · איפוס · ביטול |
| Links | מה כבר יש לכם · השוואת הספקים · לעמוד המדריך · כל הכללים על מעבר |
| One-step wrapper, child savings | תוכנית בבנק לא עוברת לבנק אחר; תוכנית בקופת גמל עוברת דרך הקופה המקבלת וביטוח לאומי. |
| One-step wrapper, deposit | פיקדון לא עובר לבנק אחר לפני הפדיון. כסף חדש אפשר להפקיד בבנק אחר בחשבון במערכת סגורה. |

**Step titles, one per rule** (the step renders the rule's text under it; the title never changes with the pair):

| Rule | Title |
|---|---|
| KH-10, KH-14 | בדקו את השעון: מתי הכסף נזיל |
| SW-18 | קבלו את הנתונים שלכם מהמסלקה הפנסיונית |
| SW-16 | בחרו את הקופה המקבלת ואת המסלול |
| SW-17 | הצטרפו ישירות, או דרך סוכן אם תרצו |
| SW-02, SW-03, SW-20 | חתמו על בקשת ההעברה בקופה המקבלת |
| SW-21 | לאן אפשר להעביר קופת גמל להשקעה |
| SW-01, SW-23 | לאן אפשר להעביר, ואילו כספים |
| SW-24 | במזומן או בעין |
| SW-10 | הודיעו למעסיק לאן להפקיד |
| SW-04 | המועד הקובע: ההפקדה הראשונה בקופה החדשה |
| SW-05 | צפו להודעת דחייה או עיכוב |
| SW-12 | ביטוח בפנסיה: הטופס, הכיסוי וחודשי האכשרה |
| SW-13 | מה חוסם העברה |
| SW-14 | העברה חלקית |
| SW-22 | חשבונות לא פעילים מתאחדים אוטומטית |
| SW-19 | שיחת שימור: לא נמצא כלל |
| SW-07 | אפשר לבטל עד שהכסף עובר |
| SW-06 | הכסף עובר |
| SW-09 | שתי הקופות מאשרות בכתב |
| SW-25 | העברת חיסכון לכל ילד |
| SW-26 | בקשו את המעבר בבנק הקולט |
| SW-31 | קראו את דף המידע |
| SW-27 | בחרו יום מעבר; אפשר לבטל |
| SW-28 | צפו לפנייה לשימור מהבנק המקורי |
| SW-29 | מה עובר ומה נשאר |
| SW-30 | ניתוב התשלומים אחרי המעבר |
| SW-32 | פיקדון לא עובר לפני הפדיון |
| SW-35 | פתחו חשבון אצל המקבל ובקשו העברה מהמוסד הנוכחי |
| SW-33, SW-34 | מה עולה להעביר ניירות ערך |
| SW-36 | מס במעבר ניירות ערך |
| SW-37 | ברוקר זר: לא נמצא תהליך |
| SW-38 | בדקו אחרי המעבר |

"מה חותמים" and "מה לצפות" lines name the forms and notices as the rule base spells them (נספח א׳, נספח ב׳, נספח ה׳ ו־ה׳1, נספח ו׳, אישור לעמית עובר), rendered from the rule's text, never typed here.

**Added 2026-10-24, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed. Where the build's wording was changed, the note says what it was.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `r4playbook.strip.none · fundFrom · fundTo` | לא נבחר · מקרן · לקרן | the pair strip before a choice; the two fund fields of a brokerage switch |
| `r4playbook.experience.label` | ניסיון של אדם אחד, לא כלל. | the experience card's last line, as 8.0 |
| `r4playbook.chipCopy` | המקור הרשמי נקרא בעותק שמתארח ב`{אתר}`, נבדק ב־`{תאריך}`. | as 8.0; the hosts are in 8.0's table |
| `r4playbook.cost.heading` | כמה עולה המעבר | the cost block's heading. Was "מה עולה המעבר" |
| `r4playbook.cost.brokerageSaves` | המעבר מ`{קרן}` ל`{קרן}` עכשיו יחסוך `{סכום}` בכסף של היום; המס במכירה `{סכום}`. | F-66 when the cheaper fund outweighs the sale |
| `r4playbook.cost.notEvaluated · reasons.*` | לא נבדק: `{סיבה}` · לא נמצאה אחת הקרנות באתר. · הזינו את שער המטבע בעמוד הקרן. · הזינו את תשואת החלוקה בעמוד הקרן. · אין עדיין חישוב לסוג הקרן הזה. · אין חישוב לקרן שמטבעה שונה מהחשיפה. · תעריפון הספק לא נאסף. · החישוב לא הצליח. | when the cost sentence cannot be built |
| `r4playbook.cost.shareLabel · shareAll · sharePart · secondary · loading` | כמה מהיתרה עוברת · כל היתרה · חלק מהיתרה · מקור משני · טוען… | the share control of a study fund (SW-14 context), the tag on the in-kind line |
| `r4playbook.links.playbook` | המדריך למעבר | as 8.5 |
| `r4playbook.brokerageNote` | סדר השלבים בחשבון השקעות הוא לפי הוראות של בנקים ובתי השקעות, לא לפי תקנה. | design-spec 19 edge case. Was "סדר השלבים בחשבון ניירות ערך לפי הוראות של בנקים ובתי השקעות, לא לפי תקנה.": the site's word is "חשבון השקעות", and the sentence needed a verb |
| `r4playbook.oq[SW OQ2]` | האם חוזר ההעברה חל על קופת גמל להשקעה. | the `{מה לא נמצא}` of the open-question line, one per question of `switching-and-transfers.md` |
| `r4playbook.oq[SW OQ3]` | כלל על פניות שימור במוצרי גמל. | |
| `r4playbook.oq[SW OQ4]` | האם הצעה שניתנה לפני ההצטרפות מחייבת. | |
| `r4playbook.oq[SW OQ5]` | איך נבדקת הסכמת הלקוח להוצאת דוח מהמסלקה. | the price side closed 2026-10-24 (SW-44) |
| `r4playbook.oq[SW OQ6]` | מי מודיע למעסיק להפנות את ההפקדות הבאות, ובתוך כמה זמן. | |
| `r4playbook.oq[SW OQ9]` | אילו סוגי חשבונות ופעילות נכללים בכללי המעבר בין בנקים. | Was "אילו סוגי חשבונות ופעילות כללי המעבר בין בנקים כוללים." |
| `r4playbook.oq[SW OQ10]` | המחיר המפוקח להעברת ניירות ערך. | |
| `r4playbook.oq[SW OQ11]` | המס על העברת ניירות ערך בין חשבונות של אותו בעלים. | |
| `r4playbook.oq[SW OQ12]` | העברה בין מוסד ישראלי לברוקר זר. | |
| `r4playbook.oq[SW OQ16]` | הסרת סוכן שכבר מחובר לחשבון. | |
| `r4playbook.loading · noWrapper · incomplete` | טוען… · אין מדריך מעבר למוצר הזה. · המדריך חלקי בשלב הזה: כלל פתוח מסומן במנעול. | · changed 2026-10-24 (Hebrew editor); was ״כלל פתוח מסומן בנעילה.״ |
| `r4playbook.offer.itemsByFamily · templates` | provident: מאיזה ספק · דמי הניהול מהחיסכון ומההפקדה, ועד מתי ההנחה · מי אמר · באיזה תאריך · בכתב או בטלפון / הצעה מ___, בתאריך ___: דמי ניהול מחיסכון ___; דמי ניהול מהפקדה ___; ההנחה בתוקף עד ___. מי הציע: ___. בכתב: כן / לא. · bank: מאיזה בנק · הריבית על ההפקדה ולכמה זמן · … / הצעה מ___, בתאריך ___: ריבית על ההפקדה ___, לתקופה של ___. מי הציע: ___. בכתב: כן / לא. | B10, added 2026-10-24 (QA fixes): the list and the copied template follow the wrapper's family (provident, bank, brokerage); the brokerage ones are `offer.items` and `offer.template` as before |

### 8.4 Companies list, bank page and fund manager page

| Element | Hebrew |
|---|---|
| Companies list headings | חברות מנהלות · בנקים ובתי השקעות · מנהלי קרנות |
| Bank or broker row line | `{סוג}` · תעריפון מ־`{תאריך}` · `{סוג}` · התעריפון לא נאסף |
| Fund manager row line | `{מספר}` קרנות |
| Bank page lede | כל מה שהבנק מציע, עם הסבר לכל מוצר. הפיקדונות לפי פרסום הבנק, נכון ל־`{תאריך}`; התעריפון נאסף ב־`{תאריך}`. (changed 2026-10-24, UX fix 28: maqaf) |
| Groups | פיקדונות · תוכניות חיסכון · עו״ש · חשבון השקעות |
| Group link | מה זה `{סוג}` |
| Group count | מוצר אחד · שני מוצרים · `{מספר}` מוצרים |
| Deposits not collected | עוד לא נאספו פיקדונות ותוכניות חיסכון של `{בנק}`. |
| Its link | לטבלת הריביות של הבנק |
| Model line | דגם: `{דגם}` |
| Also called | נקרא גם |
| Record labels | סוג לפי הוראה 447 · תקופה · סוג הריבית · שיעור הריבית המוצעת (נומינלי שנתי), לפני מס · נכון ליום · הצמדה · מס על הריבית · סכום · שבירה · תחנות יציאה · חידוש אוטומטי |
| Term | `{מספר}` חודשים · ללא תקופה |
| Rate type | ריבית קבועה · ריבית משתנה: `{עוגן}` `{מרווח}` |
| Linkage | לא צמוד · צמוד למדד · צמוד למט״ח · changed 2026-10-24 (Hebrew editor); was ״צמוד לשער״ |
| Tax on the interest | ריבית לא צמודה; השיעור בעמוד המדריך. · ריבית צמודה; השיעור בעמוד המדריך. |
| Amount | מ־`{סכום}` עד `{סכום}` · מ־`{סכום}` · עד `{סכום}` · ללא מינימום |
| Break | אין אפשרות שבירה · שבירה בקנס · שבירה ללא קנס |
| Break disclosure | הבנק כותב: |
| Exit points | כל `{מספר}` חודשים · אין |
| Auto renew | כן · לא · עד `{מספר}` פעמים |
| Current-account conditions | תנאי הריבית, כפי שהבנק כותב |
| Not an offer line (BANK-13) | הריבית המוצעת היא המינימום שהבנק מפרסם לסוג הפיקדון, לא הצעה אליכם. התנאים המחייבים הם בהסכם הפיקדון. |
| Row links | מה זה `{סוג}` · מה האתר לקח בחשבון · changed 2026-10-24 (sweep); was ״מה לבדוק״, follows the renamed guide section |
| Brokerage card title | התעריפון |
| Lines collected | `{מספר}` שורות עמלה נאספו: `{בסיסים}` |
| Notice line | הודעה על שינוי בעמלות |
| Comparison link | להשוואת הספקים |
| Missing tariff | התעריפון לא נאסף. |
| Missing tariff, links | לעמוד התעריפון של `{ספק}` · להשוואת הספקים (הבנק מופיע שם כ״אי אפשר להשוות״) · changed 2026-10-24 (Hebrew editor); was ״מופיע שם כלא ניתן להשוות)״ |
| Broker class line | בית השקעות, חבר בורסה שאינו בנק |
| Fund manager group | קרנות הנאמנות של `{מנהל}` |
| Fund manager, no list | רשימת הקרנות של `{מנהל}` עוד לא נאספה. הרשימה המלאה במאיה. |
| Fund columns | שם · מספר · סיווג · קוד חשיפה · נכס מעקב · מעמד מס · דמי ניהול · שכר נאמן · רשומה · changed 2026-10-24 (Hebrew editor); was ״דמי נאמן״ |
| Has record tag | יש רשומה |
| Exposure code popover | קוד החשיפה: הספרה היא החשיפה המרבית למניות, והאות למטבע חוץ, כחלק משווי הנכסים. |
| Provident manager listing (track workbench tab) | דמי ניהול לפי התעריפון של החברה, לא מדורג · changed 2026-10-24 (Hebrew editor); was ״דמי ניהול לפי המחירון של החברה, לא מדורג״ |

**Added 2026-10-24, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed. Where the build's wording was changed, the note says what it was.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `r4catalogue.rowLine.noDate · card.noPublishedDate` | ללא תאריך פרסום | as 8.0 |
| `r4catalogue.asOfAfterRead` | התאריך מאוחר מיום הקריאה | the bank's "נכון ליום" is later than the day the record was read (flow 33, point 11). Was "אחרי יום הקריאה" |
| `r4catalogue.card.period` | לחודש · לרבעון · לשנה | how often a custody percentage is charged, as the tariff states it |
| `r4catalogue.card.channel` | ערוצים ישירים · סניף | as 8.1 |
| `r4catalogue.missingLinks.compareBroker` | להשוואת הספקים (בית ההשקעות מופיע שם כ״אי אפשר להשוות״) | the broker's form of the parenthesis · changed 2026-10-24 (Hebrew editor); was ״מופיע שם כלא ניתן להשוות)״ |
| `r4catalogue.instrumentClasses · regulators` | as 8.0 | the class and regulator words, held again for the bank page |

### 8.5 Additions to existing screens

| Where | Hebrew |
|---|---|
| Result, brokerage row detail | איזה בנק או בית השקעות · איזו קרן לקנות |
| Result, coverage last line | הספקים, המסלולים והקרנות בתוך כל מוצר מושווים בשולחן העבודה. |
| Exposure guide page, block | איזו קרן לקנות · `{מספר}` קרנות עם רשומה · `{מספר}` קרנות ברשימה |
| Brokerage guide page, who offers it | תעריפון מ־`{תאריך}` · לא נאסף · איזה בנק או בית השקעות |
| Guide page, in-and-out block | איך עוברים לחברה אחרת |
| Holdings, consolidation card last line | המדריך למעבר |
| Holding card | איך עוברים |
| Fee page, negotiate row | ואם תחליטו לעבור: המדריך למעבר |
| Track workbench, provider tab (provident) | למוצר הזה הדירוג הוא לפי מסלול. כאן מופיעים דמי הניהול לפי התעריפון של כל חברה, בלי דירוג. · changed 2026-10-24 (Hebrew editor); was ״כאן מופיעים דמי הניהול לפי המחירון של כל חברה, בלי דירוג.״ |
| Export contents line, added | `{מספר}` הצעות שהזנתם |
| Search group heading | בנקים ומוצרי בנק · קרנות |

### 8.6 Why these words

- **"תעריפון · ממוצע שפורסם · ההצעה שלכם"** for D4's three levels: "תעריפון" is the glossary's headword for the published price list and the word on every bank's site; "ממוצע שפורסם" covers both the Bank of Israel's and TASE's averages without naming a regulator that TASE is not; "ההצעה שלכם" matches release 2's "הצעה שהזנתם" and says whose number it is. Not "מחירון": the glossary chose "תעריפון".
- **"לא ניתן להשוות"** rather than "חסר": the provider exists and is listed; what is missing is the comparison. The reason sentence says what was not collected or what did not apply, so a missing tariff is never read as a missing provider.
- **"מכריע מול {ספק}"** keeps release 2's "מכריע" and adds the pair, because the deciding type is a property of two rows, not of one.
- **"בשנה הראשונה"** with the tag "בשקלים של השנה הראשונה": F-63's year-one cost is nominal at month 12 and the horizon cost is real; the two cannot share "בכסף של היום".
- **"אין ממוצע שנאסף"** rather than release 3's "אין ממוצע להשוואה": here the averages exist, are free to read on the publishers' pages, and the site may not copy them (D20, D22); the word "נאסף" and the links say exactly that.
- **"ראשי, בעותק"** for a primary source read on a mirror or a third-party host: the person following a process should know the circular was read in a copy; "עותק" is the plain word and the popover names the host. Not "מירור". Was "ראשוני, בעותק" until 2026-10-24: the site's label for the strength since release 1 is "מקור ראשי" (section 2), and the chip must not name the same strength with a different word; "שאלה פתוחה" for the open chip for the same reason (was "פתוח").
- **"ניסיון"** for a forum account: the rule base's own label ("experience"); the card's last line, "ניסיון של אדם אחד, לא כלל", keeps it from reading as advice.
- **"לא נמצא כלל"** on the retention step, in the step's title: the research says this is where people get hurt, and the honest heading is the content.
- **"רשמו כל הצעה"** in the imperative: it is the one place the playbook tells the person to do something the rules do not require, and it says why in the lede ("הצעות נמשכות").
- **"המעבר לא עולה כלום לפי הכללים"** rather than "המעבר חינם": the rules say no transfer fee and no tax; a discount may still end and a joining fee may exist, and the two lines under it say so.
- **"לפי הצהרות של מוסדות בלבד"** inside the in-kind sentence: D10 asks that a secondary basis be visible wherever it affects what is shown; a chip alone would be too quiet for a yes a person acts on.
- **"לא מחלקת" / "מחלקת"** as tags: the glossary's headwords are "קרן שאינה מחלקת" and "קרן מחלקת"; the tag drops "קרן" because the row is already a fund. "צוברת" stays as "נקרא גם".
- **"מדינת המוצא"** for domicile: the glossary's term, from the law's wording for a foreign fund ("מדינת המוצא של קרן החוץ").
- **"מספר נייר"** for the security number: the bank's order screen says "מספר נייר" and the product's "works when" asks for it; "ISIN" appears in the row detail as the record holds it.
- **"הפרטים עוד לא נאספו"** for F-65's "not evaluated: details not collected": the same posture as release 2's "עוד לא נבדקה", with the reason in the words the product uses.
- **"רשומה שנאספה"** for a `data/funds/` record: the site's word for a hand-collected file, as the data schema calls it.
- **"בנקים ובתי השקעות"** as one heading: both are TASE members and both appear in the provider table; the class word on each row tells them apart.
- **"שיעור הריבית המוצעת (נומינלי שנתי), לפני מס"** is directive 447's own label (BANK-13), kept verbatim so the row matches the bank's table a friend is looking at.
- **"מה חותמים / מה לצפות"** as the two labelled lines of a step: product 3.7 Out names exactly these two things for every step; the labels make them scannable.
- **Added 2026-10-24** (the build's strings, folded the same day): **"כמה עולה המעבר"** for the cost block, the question a person asks (not "מה עולה"). **"הפקדה אחת בכל חודש של השנה"** says A-28's twelve deposits without a digit. **"להשוות אליו · ביטול ההשוואה"** as infinitive and noun, like every other button. **"הכללים שהחישוב נשען עליהם"** mirrors 6.2's "הכללים שההשוואה נשענת עליהם". **"מחיסכון · מהפקדה"** in the provident listing, the glossary's words, never "מצבירה".

## 9. Release 5 screens

Added 2026-10-24 for the briefs in `docs/flows.md` section 18 and the handoff in `docs/design-spec.md` sections 21 to 25. Same voice and conventions as section 1: plural imperative or impersonal, no typed figures (every `{…}` is a value object with its state), names as the source writes them, codes after the words. Exposure names are the records' `names.he[0]` (מזומן שקלי · מק"מ · אג"ח ממשלתית לא צמודה · אג"ח ממשלתית צמודה · מדד S&P 500 · מדד ת"א-125 · מסלול כללי) and their one-line explanations are the records' `one_line_he`, never retyped here. Rule texts render from the rule base with their chips. Status: **draft** (2026-10-24), to be settled by the founder as sections 3, 6, 7 and 8 were. Every wording choice is "chosen 2026-10-24, revisable"; section 9.7 says why.

### 9.0 Everywhere in release 5

| Element | Hebrew |
|---|---|
| Mode names, two (3.2, D9) | לפי מוצר · לפי חשיפה |
| Mode lede, wrapper | אותה השקעה בכל מוצר שיכול להחזיק אותה, באותה תשואה. |
| Mode lede, exposure | אותו כסף, באותו אופק, בכל חשיפה שהאתר מכיר, בתשואה שאתם מזינים לכל אחת; מסנן הירידה שלכם מוציא את מה שלא תסכימו לספוג. |
| The word for an exposure | חשיפה · חשיפות |
| The loss filter (D11) | מסנן הירידה |
| Worst fall (A-29) | הירידה החמורה ביותר שאתם צופים |
| Largest fall accepted (A-29) | הירידה הגדולה ביותר שתסכימו לספוג |
| Return labels (D7, D9) | לפי תשואה שהזנתם: `{אחוז}` · לפי ריבית הבנק שפורסמה: `{אחוז}` · לפי ריבית שהזנתם: `{אחוז}` |
| Excluded outcome, exposure mode | נפסלה לפי מסנן הירידה · נפסלו לפי מסנן הירידה |
| Saved comparison | ההשוואה השמורה · נשמרה ב־`{תאריך}` |
| Revisit | בדיקה מחדש · לבדיקה מחדש |
| Affects rankings, two groups | משפיע על דירוגים · לא משפיע על דירוגים |
| Menu row and footer link | מה השתנה |
| Graduation | עבר לכיסוי מלא · עברו לכיסוי מלא |
| Retired (8.0 "later releases") | ~~סינון לפי ירידה שתסכימו לספוג יתווסף בהמשך~~ |
| Retired (6.1 loss filter, later) | ~~כמה ירידה תסכימו לספוג: יתווסף בהמשך.~~ |
| Retired (3.6 exposure guide page) | ~~המוצרים שבהם אפשר להחזיק את זה. ההשוואה ביניהם למטרה שלכם: בעמוד ״השוואה למטרה״.~~ → המוצרים שבהם אפשר להחזיק את זה. · changed 2026-10-24 (Hebrew editor); was ״המוצרים שבהם אפשר להחזיק את זה. השוואה ביניהם למטרה שלכם תתווסף בהמשך.״ |

### 9.1 Goal form additions

| Element | Hebrew |
|---|---|
| Accepted-fall field, label | הירידה הגדולה ביותר שתסכימו לספוג בדרך למטרה |
| Unit | אחוז מהשווי |
| Hint | ההחלטה שלכם, לא ציון ולא שאלון. האתר לא ממליץ על מספר. |
| Use line | משמש את ההשוואה לפי חשיפה ואת סימון ההתאמה של מסלולים. |
| Empty | לא הוזן: ההשוואה לפי חשיפה תרוץ בלי מסנן, ותציין את זה. · changed 2026-10-24 (Hebrew editor); was ״ההשוואה לפי חשיפה תרוץ בלי מסנן, ותגיד זאת.״ |
| Second door (quiet button) | השוואה לפי חשיפה (במה הכסף מושקע) · changed 2026-10-24 (sweep); was ״איזו חשיפה מתאימה למטרה״ |
| Errors | as 6.1 ("הזינו אחוז בין 0 ל־ `{מקסימום}`.") · changed 2026-10-24 (Hebrew editor); was ״הזינו אחוז עד״ |

### 9.2 Exposure result page

| Element | Hebrew |
|---|---|
| Title | `{שם המטרה}`: איזו חשיפה מתאימה |
| Tabs | לפי מוצר · לפי חשיפה |
| Headline pattern | `{חשיפה}` מתאימה למטרה הזו לפי התשואות שהזנתם, כי `{סיבה}`. |
| Headline, sourced cash winner | `{חשיפה}` מתאימה למטרה הזו לפי התשואות שהזנתם ולפי ריבית הבנק שפורסמה, כי `{סיבה}`. |
| Headline, bare | `{חשיפה}` מתאימה למטרה הזו לפי התשואות שהזנתם. |
| Headline, single | `{חשיפה}` היא החשיפה היחידה שדורגה למטרה הזו. |
| Headline, tie | `{חשיפה}` ו`{חשיפה}` שקולות למטרה הזו לפי התשואות שהזנתם: ההפרש ביניהן `{אחוז}`, פחות מסף התיקו של האתר, `{אחוז}`. |
| Headline, all tied | כל החשיפות שדורגו שקולות למטרה הזו לפי התשואות שהזנתם. |
| Reasons (deciding formula) | as 6.2 ("דמי הניהול בה נמוכים יותר…" and the rest), with the holding wrapper's figures |
| No return at all (callout) | הזינו תשואה לחשיפה אחת לפחות כדי להשוות. |
| All entered exposures excluded | מסנן הירידה שלכם פוסל את כל החשיפות שהזנתם: מסכימים לספוג עד `{אחוז}`. |
| Its link | לשינוי המספר |
| Why button, why sheet | as 6.2 |
| Ranked heading | לפי הסדר, לפי התשואות שהזנתם |
| Listed heading | מוצגות בלי דירוג |
| Excluded heading | נפסלו לפי מסנן הירידה |
| Not evaluated heading | עוד לא נבדקו |
| Entered-return field | תשואה שנתית במונחי שקל; האתר לא מוסיף שינוי בשער ה`{מטבע}` (שקל: תשואה שנתית במונחי שקל) · changed 2026-10-24 (review fix): the engine takes the entered return as a shekel return (A-03 = 0); was ״תשואה שנתית ב`{מטבע}`״ |
| Return, empty | לא הוזן: האתר לא מנחש תשואה. |
| Return, hint | הזינו את התשואה שאתם מניחים לחשיפה הזו. היא תסומן בכחול בכל מקום שבו היא משפיעה. |
| Cash-rate line, published | ריבית הבנק, בתוקף מ־`{תאריך}` |
| Cash-rate note (BANK-13) | המינימום שהבנק מפרסם לסוג הפיקדון, לא הצעה אליכם. התנאים המחייבים בהסכם הפיקדון. |
| Cash-rate actions | להזין ריבית אחרת · לחזור לריבית שפורסמה |
| No sourced series (D20) | אין סדרה ממקור: שערי בנק ישראל מוצגים רק בקישור. הזינו תשואה. |
| Its link | לנתוני בנק ישראל |
| Worst-fall field | הירידה החמורה ביותר שאתם צופים ב־`{חשיפה}`, בדרך למטרה (changed 2026-10-24, UX fix 8) |
| Unit | אחוז מהשווי |
| Worst-fall hint (popover) | אין לאתר מקור להערכה כזו, ולכן הוא לא מציע מספר. מה ידוע על הסיכונים, בעמוד המדריך. |
| Its link | לסיכונים של `{חשיפה}` |
| Accepted-fall chip | מסכימים לספוג עד `{אחוז}` |
| Accepted-fall chip, not set | לא הוזן כמה תסכימו לספוג |
| Per-exposure override | לחשיפה הזו בנפרד · לפי המספר המשותף |
| Holding wrapper line | מוחזקת במוצר `{מוצר}` (changed 2026-10-24, UX fix 8) · changed 2026-10-24 (Hebrew editor); was ״מוחזקת ב״ |
| Holding wrapper, change | להחליף מוצר · changed 2026-10-24 (Hebrew editor); was ״החליפו מוצר״ |
| Holding wrapper, parameter popover | המוצר שהאתר בחר כברירת מחדל לחשיפה הזו, פרמטר של האתר. אפשר לבחור כל מוצר שיכול להחזיק אותה. |
| Loss note, worst fall missing | מסנן הירידה לא הופעל: הזינו את הירידה שאתם צופים. |
| Loss note, accepted fall missing | מסנן הירידה לא הופעל: הזינו את הירידה שתסכימו לספוג. |
| Exclusion tag | נפסלה: צופים ירידה של `{אחוז}`, מסכימים לספוג עד `{אחוז}` |
| Exclusion line | שנו אחד מהמספרים כדי להחזיר אותה להשוואה. |
| Filter passed (row detail) | עברה את מסנן הירידה: `{אחוז}` עד `{אחוז}`. |
| Value label | נשאר לכם במועד המטרה, בכסף של היום |
| Listed reason through the wrapper | ב`{מוצר}`: `{סיבה}` |
| Coverage reason, excluded | נפסלה לפי מסנן הירידה: צופים ירידה של `{אחוז}`, מסכימים לספוג עד `{אחוז}`. D11 |
| Coverage reasons, not evaluated | הזינו תשואה · אין סדרה ממקור: שערי בנק ישראל מוצגים רק בקישור. · לא נבחר מוצר שמחזיק את החשיפה · changed 2026-10-24 (Hebrew editor); was ״שערי בנק ישראל מוצגים רק בקישור. D20״ |
| Row links | באיזה מוצר להחזיק את זה · איזו קרן לקנות |
| Wrapper-mode link, no return yet | הזינו תשואה קודם |
| Choose button | בחרתי בזה |
| Chosen | הבחירה שלכם, מ־`{תאריך}` |
| Unchoose | לבטל את הבחירה |
| Save button | לשמור את ההשוואה |
| Saved | נשמרה ב־`{תאריך}` · לשמור שוב |
| Replace confirm | להחליף את ההשוואה שנשמרה ב־`{תאריך}`? · להחליף · ביטול |
| Chart title | הכסף לאורך הזמן, בחשיפות המובילות |
| Series chips (screen-reader name) | אילו חשיפות להציג |
| Series chips, limit line | עד ארבע בבת אחת; השאר בטבלה. |
| Series chips, more | עוד `{מספר}` בטבלה |
| Reference line label | מזומן, להשוואה |
| Chart caption (always) | הקווים המקווקווים מבוססים על תשואות שהזנתם, לא על הערכה של האתר. |
| Chart, nothing to draw | אין חשיפות מדורגות להצגה. |
| Assumption chips | שנים · סכום היום · הפקדה חודשית · זמין מיד · אינפלציה · מסכימים לספוג עד · כל ההנחות |
| Assumptions sheet title | ההנחות של ההשוואה לפי חשיפה |
| Assumptions sheet, per-exposure group | `{חשיפה}`: תשואה · ירידה צפויה · מסכימים לספוג · מוחזקת במוצר · changed 2026-10-24 (Hebrew editor); was ״מוחזקת ב״ |
| Coverage sentence | נבדקו `{מספר}` חשיפות: `{מספר}` דורגו, `{מספר}` מוצגות בלי דירוג, `{מספר}` נפסלו לפי מסנן הירידה, `{מספר}` עוד לא נבדקו. |
| Coverage, not eligible (only when non-zero) | , `{מספר}` לא מתאימות לכם |
| Coverage groups | as 6.2, with "נפסלו לפי מסנן הירידה" for the excluded group |
| Coverage, last line | הקרנות והמסלולים שנותנים כל חשיפה מושווים בעמודים ״איזו קרן לקנות״ ו״כל המסלולים בכל החברות״. · changed 2026-10-24 (Hebrew editor); was ״הקרנות והמסלולים שנותנים כל חשיפה מושווים בשולחן העבודה.״ |
| Sensitivity row, an exposure's return | התשואה של `{חשיפה}` |
| Wrapper mode, subject line | לפי `{חשיפה}` בתשואה שהזנתם, `{אחוז}` |
| Wrapper mode, cannot-hold tag | לא מחזיק `{חשיפה}` |
| Rules line heading | as 6.2 |

**Added 2026-10-24, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed. Where the build's wording was changed, the note says what it was.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `r5.mode.aria` | מצב ההשוואה | the mode tabs' screen-reader name |
| `r5.exposure.pageTitle` | איזו חשיפה מתאימה | the title when no goal is named |
| `r5.exposure.headline.bareSourced` | `{חשיפה}` מתאימה למטרה הזו לפי התשואות שהזנתם ולפי ריבית הבנק שפורסמה. | the bare form with the sourced-cash qualifier |
| `r5.exposure.headline.tieMany` | `{שמות}` שקולות למטרה הזו לפי התשואות שהזנתם: ההפרש ביניהן `{אחוז}`, פחות מסף התיקו של האתר, `{אחוז}`. | three or more tied |
| `r5.exposure.fields.currency` | שקלים · דולרים · יורו | no longer in the return label |
| `r5.exposure.fields.currencyOne` | דולר · יורו | the `{מטבע}` of "שער ה`{מטבע}`" in the return label (2026-10-24) |
| `r5.exposure.fields.returnLabelIls` | תשואה שנתית במונחי שקל | the label for a shekel exposure (2026-10-24) |
| `r5.exposure.fields.cashLabel · institution` | ריבית שנתית · לפי החברה | the overriding rate field; the tag on a published bank rate (D23) · changed 2026-10-24 (Hebrew editor); was ״מוסדי״ |
| `r5.exposure.fields.noSeriesLink` | לנתוני בנק ישראל | as the table above. Was "לנתונים של בנק ישראל" |
| `r5.exposure.fields.worstInfo · holdingAria · holdingDone` | על ההערכה · באיזה מוצר להחזיק · סגירה | screen-reader names of the worst-fall info button and the holding-wrapper chooser, and its close |
| `r5.exposure.notes.passedEqual` | עברה את מסנן הירידה: `{אחוז}`, בדיוק המספר שתסכימו לספוג. ירידה שווה למספר שלכם נשארת בהשוואה. | F-71 keeps an equal fall; said on the row. Was "…, בדיוק כמו המספר שתסכימו לספוג (שווה נשאר)." |
| `r5.exposure.coverageReasons.cannotHold · noFund · noTerms` | `{מוצר}` לא מחזיק את החשיפה הזו · לא נבדקה: פרטי הקרן עוד לא נאספו. · עוד אין לאתר את תנאי המוצר | engine reason `wrapper-cannot-hold`; a P-08 row waiting for a fund record; a wrapper without terms |
| `r5.exposure.p08.gov` | לא נבדקה: תדירות הקופון של סדרה לא צמודה עוד לא במאגר הכללים. שאלה פתוחה GOV OQ4 | the unlinked government bond row of P-08. Was "…במאגר הכללים (GOV OQ4).": a code is never in brackets at the end of a sentence (section 1) |
| `r5.exposure.chart.loading · aria` | טוען… · גרף: הכסף בחשיפות לאורך `{שנים}` | the skeleton line and the chart's screen-reader name |
| `r5.exposure.assumptions.ret · worst · accepted · holding · empty` | תשואה · ירידה צפויה · מסכימים לספוג · מוחזקת במוצר · לא הוזן | the per-exposure group's labels, and an empty value · changed 2026-10-24 (Hebrew editor); was ״מוחזקת ב״ |
| `r5.exposure.rank · detail · detailTitle · checklist · failed` | מקום · פירוט · פירוט · מה לבדוק · האתר לא הצליח לחשב את ההשוואה. רעננו את העמוד ונסו שוב. | as 6.2 · changed 2026-10-24 (Hebrew editor); was ״לא הצלחנו לחשב את ההשוואה. רעננו את העמוד ונסו שוב.״ |
| `r5.exposure.valueLabelNominal` | נשאר לכם במועד המטרה, בשקלים של העתיד | as 6.0 |
| `r5.exposure.save.failed` | האתר לא הצליח לשמור במכשיר הזה. ההשוואה תעבוד, אבל לא תישמר. | as 6.0 · changed 2026-10-24 (Hebrew editor); was ״לא הצלחנו לשמור במכשיר הזה. ההשוואה תעבוד, אבל לא תישמר.״ |

### 9.3 Revisit notice and sheet

| Element | Hebrew |
|---|---|
| Strip, saved | נשמרה ב־`{תאריך}` |
| Strip, saved with a choice | נשמרה ב־`{תאריך}` · הבחירה: `{אפשרות}` |
| Notice, changed | לבדיקה מחדש: `{מה}` השתנה ב־`{תאריך}` |
| Notice, changed, no entry date | לבדיקה מחדש: `{מה}` השתנה מאז `{תאריך}` |
| Notice, unchanged | ללא שינוי מאז `{תאריך}` |
| Notice, the goal changed (A30) | המטרה השתנתה מאז השמירה (`{מה}`); ההשוואה השמורה אינה תקפה לה · `{מה}`: שנות החיסכון: מ־`{מספר}` ל־`{מספר}` שנים · ועוד שינוי אחד / ועוד `{מספר}` שינויים (`r5.revisit.goalChanged`, `goalChange`, `goalChangeMore*`, `goalFields`); added 2026-10-24 (audit A30) |
| `{מה}`, one entry | הכלל `{קוד}` · הפרמטר `{שם}` · הנתון `{שם הקובץ}` · ההנחה `{שם}` |
| `{מה}`, counts | `{מספר}` כללים · `{מספר}` פרמטרים · `{מספר}` קובצי נתונים · `{מספר}` הנחות (joined with ", " and "ו"; the verb becomes "השתנו") |
| Many, with the comparison's share | `{מספר}` שינויים מאז `{תאריך}`, `{מספר}` מהם נגעו להשוואה הזו. |
| Computing | בודק מה השתנה… |
| Result, unchanged (quiet line) | נבדק מחדש היום: ללא שינוי מאז `{תאריך}`. |
| Verdict, holds | הדירוג נשמר: `{אפשרות}` עדיין ראשונה. |
| Verdict, top changed | הדירוג השתנה: `{אפשרות}` במקום `{אפשרות}`. |
| Verdict, tie set changed | קבוצת השקולות השתנתה: `{שמות}`. |
| Verdict, cannot run | לא ניתן לבדוק: `{סיבה}` |
| Cannot run, reason forms | הכלל `{קוד}` לא עודכן · חסר קלט: `{שדה}` · הרשומה `{שם}` לא קיימת עוד |
| Choice line, still ranked | בחרתם ב`{אפשרות}`; היא עדיין במקום `{מספר}`. |
| Choice line, not ranked today | בחרתם ב`{אפשרות}`; היום היא `{תוצאה}`: `{סיבה}`. |
| Banner buttons | מה השתנה · לשמור את ההשוואה של היום |
| Sheet title | מה השתנה מאז `{תאריך}` |
| Kind headings | כללים · פרמטרים · נתונים · הנחות |
| Diff row, values | היה `{ערך}` · עכשיו `{ערך}` |
| Diff row, dates | נבדק ב־`{תאריך}` |
| Diff row, removed | הוסר מהמאגר · הקובץ לא קיים עוד |
| Diff row, added | קובץ חדש · לא היה |
| Diff row, state change | היה פרמטר · עכשיו הזנתם · changed 2026-10-24 (Hebrew editor); was ״הוזן על ידך״ |
| Diff row, re-checked data | הקובץ נבדק מחדש; הערכים לא השתנו. |
| More rows | עוד `{מספר}` |
| Value changes heading | מה זז בהשוואה |
| Value change row | `{אפשרות}`: מ־`{סכום}` ל־`{סכום}`, בכסף של היום · changed 2026-10-24 (sweep); was with an arrow |
| Value change tags | חדשה בהשוואה · לא מדורגת עוד |
| Before/after heading | לפני ואחרי |
| Before/after columns | בשמירה, `{תאריך}` · היום |
| Before/after rows | ראשונה: `{אפשרות}` · שקולות: `{שמות}` · אין שקולות · אף אפשרות לא דורגה |
| Empty sheet | אף כלל, פרמטר, נתון או הנחה שההשוואה נשענה עליהם לא השתנו. |
| Footer links | לרשימת כל השינויים באתר מאז `{תאריך}` · לשמור את ההשוואה של היום |
| Unreadable record | ההשוואה שנשמרה היא מגרסה ישנה של האתר ואי אפשר לבדוק אותה מחדש. |
| Unreadable record, actions | להשוות מחדש ולשמור · מחיקה מהמכשיר |
| Delete confirm | למחוק את ההשוואה השמורה מהמכשיר הזה? · מחיקה · ביטול |
| Could not save | as 6.0 |

**Added 2026-10-24, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed. Where the build's wording was changed, the note says what it was.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `r5.revisit.changedMany · changedSinceMany` | לבדיקה מחדש: `{מה}` השתנו ב־`{תאריך}` · לבדיקה מחדש: `{מה}` השתנו מאז `{תאריך}` | the plural verb for counts (the note above) |
| `r5.revisit.changedRanking` | לבדיקה מחדש: הדירוג השתנה מאז `{תאריך}` | nothing the run read differs by entry, but the ranking moved |
| `r5.revisit.verdict.none` | הדירוג נשמר: אף אפשרות לא דורגה, גם לא בזמן השמירה. | both sides empty · changed 2026-10-24 (Hebrew editor); was ״אף אפשרות לא דורגה, גם בשמירה.״ |
| `r5.revisit.outcomes` | מוצגת, לא מדורגת · נפסלה · עוד לא נבדקה · לא מתאימה לכם | the `{תוצאה}` of "בחרתם ב`{אפשרות}`; היום היא `{תוצאה}`" · changed 2026-10-24 (Hebrew editor); was ״מוצגת בלי דירוג״ |
| `r5.revisit.choiceGone` | לא קיימת עוד | the chosen option is no longer in the comparison |
| `r5.revisit.sheet.close` | סגירה | |
| `r5.revisit.modeNames` | לפי מוצר · לפי חשיפה | as 9.0 |

### 9.4 What changed since page

Removed 2026-10-24 (D24): the page and its strings (`r5.changes`) are gone from `site/app/copy.ts`; the text is kept as history.

| Element | Hebrew |
|---|---|
| Title | מה השתנה באתר |
| Lede | כל שינוי בכללים, בפרמטרים ובנתונים של האתר, מהיומן שלו. בחרו מאיזה תאריך. |
| Picker label | מאז |
| Until (disclosure) | עד תאריך |
| Quick chips | הביקור הקודם · שבוע · חודש · מאז שנשמרה ההשוואה |
| Default line, previous visit | הביקור הקודם שלכם: `{תאריך}` |
| Default line, saved comparison | מאז שנשמרה ההשוואה: `{תאריך}` |
| Default line, thirty days | ברירת המחדל: החודש האחרון. |
| Counts line | `{מספר}` שינויים מאז `{תאריך}`, `{מספר}` מהם משפיעים על דירוגים. |
| Counts line, with until | `{מספר}` שינויים בין `{תאריך}` ל`{תאריך}`, `{מספר}` מהם משפיעים על דירוגים. |
| Counts line, whole log | מאז תחילת היומן, `{תאריך}` |
| Precise-test line | האם שינוי נגע להשוואה ששמרתם, בודקים בעמוד ההשוואה. |
| Group headings | משפיע על דירוגים · לא משפיע על דירוגים |
| Collection names (by file key) | rules: כללים · parameters: פרמטרים · fees: תעריפונים · terms/deposits: תנאי פיקדונות · terms: מונחים · dimensions: מימדים לבדיקה · catalog: קטלוג · funds: רשומות קרנות · series: סדרות · instruments/wrappers: רשומות מוצרים · instruments/exposures: רשומות חשיפות · cma: נתוני רשות שוק ההון · site/content: תוכן האתר · site/content/guide: עמודי המדריך · il-finance: מאגר הכללים |
| Columns | תאריך · מה · שדה · היה · עכשיו · למה |
| Values | לא היה · הוסר · פירוט |
| Reason label (screen-reader name) | הסיבה כפי שנרשמה ביומן |
| Snapshot row | `{מזהה}`: `{מספר}` שדות השתנו |
| Snapshot detail | פירוט · `{מספר}` מתוך `{מספר}` · להציג עוד |
| Filters | אוספים · חיפוש לפי מזהה או שדה |
| Loading older years | טוען שינויים ישנים יותר… |
| Empty | לא השתנה כלום מאז `{תאריך}`. |
| Error, date after today | התאריך אחרי היום. |
| Error, unreadable log (dev) | יומן השינויים לא נקרא: שורה `{מספר}`. |
| Stale banner | היומן עודכן לאחרונה ב־`{תאריך}`. |
| First page line | מאז הביקור הקודם שלכם השתנו `{מספר}` דברים באתר. |
| Rules and parameters pages, link | מה השתנה |

**Added 2026-10-24, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed. Where the build's wording was changed, the note says what it was.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `r5.changes.defaults.thirty` | ברירת המחדל: החודש האחרון. | the row above was "ברירת המחדל: 30 הימים האחרונים." (changed 2026-10-24): no typed figure; the quick chip says "חודש" |
| `r5.changes.snapshotMore` | להציג עוד | the row above was "עוד 50" (changed 2026-10-24): no typed figure; 7.3's paging word |
| `r5.changes.chipsAria` | בחירה מהירה של תאריך | the quick chips' screen-reader name. Was "תאריכים מהירים" |
| `r5.changes.explicit` | התאריך שבחרתם: `{תאריך}` | a date given in the address |
| `r5.changes.back · loading · countLabel · showAll · unknownCollection · objectLabel` | חזרה · טוען את היומן… · שורות · עוד `{מספר}` · אוסף · ערך מורכב | the back arrow, the loading line, the count beside a collection, paging, a collection the dictionary lacks, the disclosure of a value that is an object |
| `r5.changes.noHits` | אין שינוי שמתאים לחיפוש או לבחירה. | B11, added 2026-10-24 (QA fixes): the line under the filters when the search or the chosen collections match nothing |

### 9.5 Not covered yet: the status card

| Element | Hebrew |
|---|---|
| Block heading | מצב הכיסוי |
| Status, blocked | חסום: `{מספר}` שאלות פתוחות |
| Status, blocked, one | חסום: שאלה פתוחה אחת |
| Status, remaining | השאלות נסגרו; נותר: `{רשימה}` |
| Remaining items | רשומה עם מקור · שיטת חישוב |
| Status, graduated (end list) | עבר לכיסוי מלא ב־`{תאריך}` |
| Blockers heading | מה חוסם |
| Blocker (as 6.13) | שאלה פתוחה `{קוד}`: `{מה לא ידוע}` |
| Narrowed | צומצם ב־`{תאריך}`: `{כלל}` |
| Institution answer (D23, answered F1 on 2026-10-24) | יש תשובה של מוסד; האתר מחשב לפיה ומסמן ״לפי החברה״, אבל היא לא סוגרת שאלת מס לצורך מעבר לכיסוי מלא. · changed 2026-10-24 (Hebrew editor); was ״מוסדי״ |
| Reopened | נפתח מחדש ב־`{תאריך}` |
| Closures heading | מה נסגר |
| Closure | נסגר ב־`{תאריך}`: `{כלל}` |
| No closures recorded | עוד לא נרשמו סגירות. |
| Closure without a date | נסגר: `{כלל}` (התאריך לא נרשם) |
| Path line | כשייסגר: יופיע במדריך, בהשוואה למטרה, ב״חברות ומסלולים״ ובעמודי ״איזה בנק או בית השקעות״ ו״איזו קרן לקנות״, ויימנה בשורת הכיסוי של כל השוואה. · changed 2026-10-24 (Hebrew editor); was ״יופיע במדריך, בהשוואה למטרה, בשולחן העבודה ובקטלוג, ויימנה בשורת הכיסוי של כל השוואה.״ |
| Nearest | הקרוב ביותר לכיסוי מלא |
| Graduated list heading | עברו לכיסוי מלא |
| Graduated item | `{שם}`, מ־`{תאריך}` |
| Its link | לעמוד המדריך |
| Holdings row link | מה חוסם את הכיסוי |

**Added 2026-10-24, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed. Where the build's wording was changed, the note says what it was.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `r5.graduation.blockerShort` | שאלה פתוחה `{קוד}` | added 2026-10-24 (UX fix 16): the per-blocker line without the repeated "הכללים לזה עוד בבדיקה" sentence (the page notice says it once) |
| `r5.graduation.institution` | יש תשובה של מוסד; האתר מחשב לפיה ומסמן ״לפי החברה״, אבל היא לא סוגרת שאלת מס לצורך מעבר לכיסוי מלא. | the row above was "יש תשובה של מוסד; האתר מחשב לפיה רק אם ההחלטה F1 תתקבל." (changed 2026-10-24): D23 answered F1 the same day, so the line states the decision and names no decision code · changed 2026-10-24 (Hebrew editor); was ״מוסדי״ |
| `r5.graduation.sourceNote` | המצב נקרא מקטעי ״מצב מעבר״ בקובצי מאגר הכללים של כל מוצר ומרשימת הפערים הפתוחים של שיטת החישוב. | where the card's status comes from. Was "…ומשאלות G-24 של השיטה.": a method gap's code is not for the page |

### 9.6 Additions to existing screens

| Where | Hebrew |
|---|---|
| Menu and footer | מה השתנה |
| First page, under the strip | מאז הביקור הקודם שלכם השתנו `{מספר}` דברים באתר. |
| Rules page, parameters page, lede link | מה השתנה |
| Comparison result, tabs | לפי מוצר · לפי חשיפה |
| Comparison result, rows | בחרתי בזה · לשמור את ההשוואה |
| Saved-goal strip, second line | נשמרה ב־`{תאריך}` · הבחירה: `{אפשרות}` · לבדיקה מחדש: … · ללא שינוי מאז `{תאריך}` · מה השתנה |
| Compact strip | לבדיקה מחדש · ללא שינוי |
| Exposure guide page, "how to hold it" links | איזה מוצר יחזיק את זה למטרה שלכם · איזו חשיפה מתאימה למטרה |
| Fit mark, line with the loss filter (F-70) | לפי האופק ולפי הירידה שתסכימו לספוג (`{אחוז}`) |
| Fit mark, track's side (P-04) | המסלול מתאים לירידה של עד `{אחוז}`, פרמטר של האתר |
| Holdings, tier-2 row | מה חוסם את הכיסוי |
| Export contents line, added | `{מספר}` השוואות שמורות |
| Import, newer version | as 7.4 |

**Added 2026-10-24, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed. Where the build's wording was changed, the note says what it was.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `r5.additions.fitNotMet` | המסלול מתאים לירידה של עד `{אחוז}`, ואתם מסכימים לספוג עד `{אחוז}` | the fit mark's line when the track's fall exceeds the person's |
| `search.groups.bank` | בנקים ומוצרי בנק | as 8.5 |
| `fit.horizonOnly` | לפי השנים עד המטרה בלבד. | the release 2 line without its retired half (9.0) |

### 9.7 Why these words

- **"לפי מוצר · לפי חשיפה"** for the two modes: parallel to release 4's workbench tabs ("לפי ספק · לפי מסלול · לפי קרן"), and "חשיפה" is already the site's word for what the money is invested in (the exposure guide pages, "כל הקרנות על {חשיפה}"). Not "סוג נכס": the records are called exposures and the glossary explains the word once.
- **"מסנן הירידה"** for D11's loss filter: it is a filter the person sets, so "מסנן" and not "פרופיל סיכון" or "רמת סיכון", which would read as a score; "ירידה" rather than "הפסד" because the number is a fall in value on the way, not a realised loss.
- **"הירידה החמורה ביותר שאתם צופים" / "הירידה הגדולה ביותר שתסכימו לספוג"**: two long labels on purpose; each says whose number it is (you expect; you accept) and what it measures (a fall, on the way to the goal). "לספוג" is the everyday word for taking a fall without acting; "לסבול" would be about pain, "לקבל" ambiguous.
- **"צופים … מסכימים לספוג עד …"** in the exclusion tag: the two numbers side by side are the whole reason, and the person can see which to change.
- **"לפי תשואה שהזנתם: {אחוז}"** as a tag on every ranked row, beside the field: roadmap R5's risk is that an entered return is read as the site's view; the tag keeps the basis next to the figure when the field has scrolled away, and the headline's "לפי התשואות שהזנתם" repeats it where a screenshot would start.
- **"מתאימה למטרה הזו"** rather than release 2's "היא הטובה ביותר למטרה הזו": in exposure mode the ranking rests on numbers the person typed, so the site says the exposure fits, on their numbers, and never that it is best.
- **"ריבית הבנק שפורסמה"** for the cash rate: release 2's "ריבית הבנק, בתוקף מ־{תאריך}" named the figure; the label on the row needs to say it is a published one, against "ריבית שהזנתם".
- **"אין סדרה ממקור"**: the engine's "no sourced series" in the data words the site already uses ("ממקור"); the sentence then says why (D20) and what to do.
- **"מוחזקת ב{מוצר}" / "החליפו מוצר"**: the exposure does not float; it is held in a product, and the person can change which. "מוצר" is the site's word for a wrapper throughout.
- **"בחרתי בזה"** in the first person singular: it is the one place the person speaks, not the site; the imperative plural would be the site telling them to choose. The confirmation "הבחירה שלכם" returns to the site's voice.
- **"לבדיקה מחדש: {מה} השתנה ב־{תאריך}"**: product 3.9's "re-check: rule X changed on date Y" word for word, with the entry named ("הכלל TXS-09") when there is one, so the notice is specific; "ללא שינוי מאז {תאריך}" is its mirror, and the date tells the person how long the decision has held.
- **"הדירוג נשמר / השתנה"** as fixed sentences: the verdict is two booleans from the engine (`topUnchanged`, `tieSetUnchanged`); a fixed sentence per case keeps it a fact, not an opinion.
- **"מה זז בהשוואה"** for the value changes: lighter than "שינויים בערכים"; it says that numbers moved without saying that anything is wrong.
- **"משפיע על דירוגים / לא משפיע על דירוגים"** as the two group names: the schema's own flag (`affects_rankings`) in plain words, in the present tense because the flag is about what the engine reads, not about any one comparison; the quiet line under the counts says where the precise test lives. (Removed 2026-10-24, D24.)
- **"{מזהה}: {מספר} שדות השתנו"** for a folded snapshot: it says what the row is (one record, many fields) and keeps the count visible, so folding hides nothing.
- **"הביקור הקודם"** for the picker's default: "האחרון" would mean today's visit; the question is what changed since the one before.
- **"מצב הכיסוי"** for the status block: the page is about coverage ("מה האתר עוד לא מכסה"), and the block answers how far each product is from it.
- **"חסום: {מספר} שאלות פתוחות"**: the lock is the site's sign for an open rule everywhere; the count tells the person whether it is one question or six.
- **"השאלות נסגרו; נותר: …"**: a semicolon and a list, so the good news and the remaining work are one line; "נותר" rather than "חסר" because nothing is missing from the person's side.
- **"עבר לכיסוי מלא"** rather than "שודרג" or "עלה לרמה 1": tiers are a product-doc word; a friend reads "covered in full".
- **"עוד לא נרשמו סגירות."** rather than "לא נסגר כלום": the data file may simply not exist yet; the sentence says only what the site knows.
- **"כשייסגר: יופיע ב…"** as one fixed sentence: the graduation path is the same for every instrument and short enough to say in full; writing it once per card keeps the promise identical everywhere.
- **Added 2026-10-24** (the build's strings, folded the same day): **"ברירת המחדל: החודש האחרון"** rather than a count of days, so no figure is typed and the default reads like the quick chip "חודש". **"להציג עוד"** for paging, 7.3's word, never with a page size in it. **"ירידה שווה למספר שלכם נשארת בהשוואה"** says F-71's equal-is-kept rule in the person's terms. **"יש תשובה של מוסד; … לא סוגרת שאלת מס לצורך מעבר לכיסוי מלא"** states D23 without naming it: an institution's answer computes, labelled, and graduation still waits for a primary or secondary source.

---

## 10. Style guide (2026-10-24)

Written 2026-10-24 by the Hebrew editor (phase 1 review of 1,564 strings, phase 2 applied the same day with the lead's decisions). The decisions the lead took on the editor's open items: headlines restructured with האפשרות/החשיפה as the subject; "הוזן על ידך" → "הזנתם"; the "ניתן" chips → "אי אפשר להשוות / אי אפשר לאחד"; תעריפון, not מחירון; "מוצגת, לא מדורגת" (singular) / "מוצגות בלי דירוג" (plural); transfer page title "העברה למכשיר אחר"; "שולחן העבודה" out, pages named by their titles; doc ids (D11, D20) and dev words (קלט) out of user text; "ההתנהגות שלכם" → "הפעילות שלכם"; "דשבורד" → "לוח הנתונים של בנק ישראל"; address form unchanged; the glossary's "הפרש עקיבה" kept. The strength word "מוסדי" (which reads in Israeli finance as "institutional", i.e. more authoritative) is now **"לפי החברה"** everywhere: legend tag, popover label, playbook chip, exposure-mode tag, F-44 base tag; its one-line explanation is unchanged. The narrator is "האתר": "לא הצלחנו ל…" became "האתר לא הצליח ל…", "לפי הנתונים שלנו" → "לפי הנתונים של האתר", "מוצרים שאנחנו מכירים" → "מוצרים שהאתר מכיר". "אחזקה" → "החזקה" (the Academy's and the statements' word).


נכתב 2026-10-24 על בסיס `docs/copy.md` §1 (הכללים העומדים), סעיפי בחירת המילים 6.6, 7.6, 8.6 ו־9.7, `docs/glossary.md`, קריאת 1,564 שורות הממשק, וסיור באתר החי (העמוד הראשי, טופס המטרה, ההשוואה, העמלות, האחזקות, מדריך קופת גמל להשקעה, הבנק, שולחנות העבודה). המדריך לא מחליף את copy.md: הוא מרכז את מה שכבר נקבע שם, מוסיף כללים לשון שחסרו, ומסמן מה שדורש הכרעה של בעל האתר.

### 10.1 Register — המשלב

**היעד: חבר שמבין, שבמקרה גם איש מקצוע. לא בנק, לא בלוג.**

- משפט אחד, רעיון אחד. קודם המסקנה, אחר כך הסיבה.
- מילים של דיבור יומיומי משכיל: "אפשר", "אי אפשר", "עוד לא", "שווה", "כדאי", "בלי", "כמה זה עולה". לא מילות טופס: "ניתן", "אינו", "בכדי", "טרם", "לרבות", "במידה ו", "יש לציין".
- בלי ריפוד: לא "נשמח אם", לא "שימו לב", לא סימני קריאה, לא "אנא".
- בלי יועץ־פיננסי־בטלוויזיה: לא "אל תפספסו", לא "הטיפ שלנו", לא הבטחות. האתר מראה מספר ואומר מאיפה הוא.
- כשהאתר מדבר על עצמו: "האתר" בגוף שלישי ("האתר לא מנחש תשואה"), או "אנחנו" בגוף ראשון רבים רק בפעולות שנכשלו או נעשו ("לא הצלחנו לחשב", "מילאנו", "שמרנו"). כשהאתר מדווח על עבודה שהוא עושה עכשיו: יחיד ("טוען…", "בודק…").
- כשהאדם מדבר (טקסט להעתקה, כפתור בחירה): גוף ראשון יחיד ("אבקש להוריד", "בחרתי בזה"). זה המקום היחיד שבו יש "אני" באתר.

#### מה נשמע "מתורגם מאנגלית" כאן, ואיך מתקנים
| סימן | דוגמה שנמצאה | תיקון |
|---|---|---|
| "לא עדיין" (not yet) | "עוד לא: החשבון השני נזיל מ־…" | "עוד לא: …" · changed 2026-10-24 (Hebrew editor); was ״לא עדיין:״ |
| "חופשי ממס" (tax-free) | "העברה … חופשית ממס" | "פטורה ממס" |
| "ההתנהגות שלכם" (your behaviour) ככותרת קטע | כותרת קטע הפעולות בחודש והערוץ | "הפעילות שלכם" |
| "איפה ש" ליעד (where you send it) | "עובר רק איפה שאתם שולחים אותו" | "לאן שאתם שולחים אותו" |
| "קלט" (input) | "חסר קלט: {שדה}" | "חסר נתון: {שדה}" |
| "זה לא" + שם עצם נקבה (it's not a) | "זה לא הורדה" | "זו לא הורדה" |
| "מהזולה לגבוהה" (cheapest to highest) | כותרת טבלת הספקים | "מהזולה ליקרה" |
| "X עד Y" כשני מספרים שאינם טווח | "עברה את מסנן הירידה: 20% עד 30%" | "צופים 20%, מסכימים לספוג עד 30%" |
| "ניתן / לא ניתן" כפועל סתמי | "לא ניתן לומר", "לא ניתנים לשינוי" | "אי אפשר לומר", "אי אפשר לשנות" |
| "סף תיקו", "מכריע", "שקולה" | — | אלה טובים: מילים של עברית מדוברת, לא תרגום. |

### 10.2 Address form — צורת הפנייה

**הכלל העומד נשאר: ציווי רבים ("הזינו", "בחרו", "הקישו") או ניסוח סתמי ("אפשר", "יש", "כדי לחשב צריך"). לעולם לא "אתה"/"את", לא "אתה יכול", לא "שלך".**

- "אתם"/"שלכם"/"לכם" ברבים מותר ונכון ("התשואה שאתם מניחים", "נשאר לכם"). זהו הגוף השני של האתר, והוא נייטרלי־מגדר בפועל.
- "מי ש…" + יחיד זכר סתמי בעובדות על אדם כללי מותר ("מי שההכנסה השנתית שלו עוברת סף"); זה לא פנייה לקורא. אבל צריך התאמה במספר: "למי שנחשב עמית מוטב", לא "למי שנחשבים עמית מוטב".
- **חריגה שנמצאה:** "הוזן על ידך" (תווית מצב המספר, תווית מקור הריבית, "היה פרמטר · עכשיו הוזן על ידך"). "על ידך" הוא גוף שני יחיד זכר ומפר את הכלל. ההחלטה למטה (§9, החלטה 2); ההצעה: "הזנתם".
- בתוויות וצ'יפים אפשר גם צורת הסתמי בלי נושא: "לא הוזן", "נבדקו 7 אפשרויות".

### 10.3 Terminology — טבלת מונחים

מונח אחד לכל מושג. השמות הרשמיים (מילון, חוק, רשות) לא משתנים; השמות של האתר לדברים שלו צריכים להיות אחידים. העמודה "גרסאות" מביאה כל ניסוח שנמצא בשורות, עם המפתח.

| מושג | המונח הקנוני | גרסאות שנמצאו (מפתח) | הערה |
|---|---|---|---|
| דמי ניהול מהצבירה | **דמי ניהול מחיסכון** (מילון, הרשות) | "מחיסכון" כקיצור בעמודה (r3holdings.feeBalance, r4workbench.providers.provident.balance) | הקיצור מותר כשכותרת הקבוצה היא "דמי ניהול" |
| דמי ניהול מההפקדות | **דמי ניהול מהפקדה** | "מהפקדה" כקיצור; "מההפקדה" במשפט מלא (r4playbook.offer.itemsByFamily.provident~1) | במשפט רץ "מהחיסכון ומההפקדה" תקין |
| שכר הנאמן של קרן | **שכר נאמן** (חוק, מילון, 6.6) | "דמי נאמן" (r4workbench.funds.fees.trustee) ← לתקן | "דמי נאמנות" כבר הוסר |
| רשימת המחירים של בנק/ברוקר | **תעריפון** | "מחירון" (r4workbench.providers.provident.note/label, providentLines~1, levelLine.list, regBalance/regDeposit) | §9 החלטה 4: האם לחברות מנהלות אומרים "מחירון" |
| אפשרות שעל העמוד אך מחוץ לסדר | **מוצגת, לא מדורגת** (יחיד, מילון) / **מוצגות בלי דירוג** (רבים, משפט הכיסוי) | "מוצגות, לא מדורגות" (r4workbench.funds.groups.listed); "מוצגת בלי דירוג" (r5.revisit.outcomes.listed-not-ranked) | §9 החלטה 5 |
| ספק שאין לו השוואה | **לא ניתן להשוות** (8.6, צ'יפ) | "כלא ניתן להשוות" בתוך משפט (missingLinks.compare, levelLine.averageSome) ← לצטט במירכאות | §9 החלטה 3 |
| איחוד שהתקנות אוסרות | **לא ניתן לאחד** (7.6) | — | §9 החלטה 3: "אי אפשר לאחד" טבעי יותר מול "אפשר לאחד" |
| כלל שאין לו מקור | **שאלה פתוחה** | "פתוח" הוסר; תקין בכל השורות | הקוד אחרי המילים: "שאלה פתוחה TXG OQ4" |
| סימן של שאלה פתוחה | **מנעול** | "מסומן בנעילה" (r4playbook.incomplete) ← "במנעול" | |
| מועד מתן התוקף של נתון | **בתוקף מ־** | תקין | |
| נתון שלא עודכן | **לא עודכן מאז** / **עוד לא דווח** | "טרם" הוסר; "אין עדיין" ו"עוד אין" מתערבבים (ראו §4) | שתיהן תקינות; "עוד" היא בחירת הבית |
| הערכים שהאתר קובע | **פרמטר של האתר** | תקין | |
| הערך שהאדם הזין | **הזנתם** / "תשואה שהזנתם" / "ההצעה שלכם" | "הוזן על ידך" (idle.labels.entered, r5.revisit.sheet.stateChange, ובמפתחות שמחוץ לסקירה: numbers.legend.entered, strength.entered.label, values.stateEntered) | §9 החלטה 2 |
| מצב "לא נבדק" | **עוד לא נבדקה / עוד לא נבדקו** | תקין; "לא נבדק: …" עם סיבה תקין | |
| הערך הנשאר | **נשאר לכם** | תקין | |
| ערכים ריאליים / נומינליים | **בכסף של היום** / **בשקלים של העתיד**; לשנה הראשונה: **בשקלים של השנה הראשונה** | תקין | |
| הקצה של אופק המטרה | **מועד המטרה** | "סוף התקופה" כשאין מטרה; תקין | |
| הקו המקווקו | **מבוסס על תשואה שהזנתם** | תקין | |
| הדפים של השוואת מסלולים/ספקים/קרנות | שמות העמודים: **כל המסלולים בכל החברות**, **איזה בנק או בית השקעות**, **איזו קרן לקנות** | "שולחן העבודה" (r5.exposure.coverage.last, r5.graduation.path) — מילה של המסמכים, לא של האתר | §9 החלטה 7 |
| סוג ההעסקה | **סוג ההעסקה** (עם ה׳ הידיעה) | "סוג העסקה" (r2.form.employment, r2.result.reasons.enterEmployment, ומחוץ לסקירה values.fields.employment) | "סוג העסקה" נקרא "סוג של עִסקה" |
| איגרת חוב | **איגרות חוב** (כתיב מלא; מילון) | "אגרות חוב" (instrumentClasses.tase_shares_bonds) | |
| תיק מנוהל דיגיטלי | **תיק השקעות דיגיטלי** (מילון) | "יועץ אוטומטי" (rulesPage.groups.managed-and-robo-portfolios.md) | |
| מנהל הקרן | **מנהל הקרן** | "יצרן הקרן" (guideBlocks.fees.creation_redemption.base) | |
| פטור ממס | **פטור/פטורה ממס** | "חופשית ממס" (r4playbook.cost.differentKinds) | |
| הממוצע של הרשות | **ממוצע הרשות למסלולי {סיווג}** (7.6) | תקין | |
| הביטוח הלאומי | **הביטוח הלאומי** (עם ה׳) | "מביטוח לאומי" (r2.result.reasons.notOwnMoney) | |
| כיסוי ביטוחי בפנסיה | **דמי הביטוח בקרן הפנסיה**; "למקרה מוות או נכות" | "למקרה מוות ונכות" (r2.form.insuranceHint) | |
| המילה לפעולה בבורסה | **פעולה** (לאדם), **פקודה** (בהסבר הטכני) | תקין: "פעולות בחודש", "כל הפקדה מתחלקת ל־3 פקודות" | |
| הפער בין קרן למדד | **הפרש עקיבה** (מילון) | "פער המעקב של הקרן" (guideBlocks.terms.labels.fundTracking) | שתיהן מופיעות; המילון: "הפרש עקיבה". לא שונה בסבב הזה (תווית בחלון התנאים) — לרשימת ההחלטות |

### 10.4 Punctuation and numbers — פיסוק ומספרים

- **מקף (־, U+05B2 maqaf) בלי רווחים** בין אות שימוש למספר, לתאריך, לקוד או למילה לטינית: ב־2026, ל־10 שנים, מ־1,000 ₪, ה־API, ב־USD, נכון ל־25.10.2026. לפני מילה עברית אין מקף: "נכון לספטמבר 2026", "להסתיר". כשהערך שמתמלא יכול להיות גם לטיני וגם עברי (שם קרן, שם ספק), הרכיב צריך להחליט בזמן ריצה; זה עניין לקוד (ראו summary).
- **גרשיים (״) בראשי תיבות**, לפני האות האחרונה: אג״ח, מק״מ, עו״ש, ני״ע, ארה״ב, חו״ל. גרש (׳) בקיצור: מס׳, צ׳יפ.
- **מירכאות:** ״…״ (גרשיים משני הצדדים) בכל ציטוט של שם או תווית: לפי המטרה ״עתודה נזילה״, מסומן ״לא ניתן להשוות״. לא " " של ASCII ולא “ ” (נמצאו ב־r4workbench.notComparable.lineWithoutValue וב־search.empty.bodyBefore).
- **₪** אחרי המספר עם רווח: 1,234.50 ₪. **%** צמוד למספר: 0.8%. שני הסימנים מגיעים מהרכיב, לא מהטקסט; בטקסט חופשי כותבים "אחוז" ("אחוז מהשווי").
- **תאריכים** DD.MM.YYYY ("22.10.2026"); חודש במילים כשהנתון חודשי ("ספטמבר 2026").
- **טווח:** "0% עד 10%", "8 שנים עד 12 שנים" — במילה "עד", לא בקו מפריד. שני מספרים שאינם טווח לא נכתבים "X עד Y".
- **שלוש נקודות (…):** תו אחד (U+2026), צמוד למילה, רק בדיווח על פעולה שנמשכת ("טוען…", "בודק…"). לא בסוף משפט רגיל.
- **נקודה בסוף משפט**, גם כשהוא בן שתי מילים ("לא הוזן."). בלי נקודה: תוויות, כותרות, צ'יפים, כפתורים, שורות ברשימה של פריטים.
- **נקודתיים** פותחות פירוט או סיבה ("חסום: שאלה פתוחה", "לא נבדק: אין מטרה שמורה"); **נקודה־פסיק** מחברת שני משפטים קצרים שהם עובדה אחת ("השאלות נסגרו; נותר: …").
- **פסיק לפני "ולכן", "אבל", "כי"** כשאחריהם משפט שלם.
- **רשימה בתוך משפט:** פסיקים, ו׳ החיבור רק לפני הפריט האחרון ("מט״ח, אג״ח קונצרניות, ריט, זהב ותיקים מנוהלים").
- **הקוד של כלל/שאלה אחרי המילים**, לא בסוגריים: "שאלה פתוחה TXG OQ4". קודים של החלטות־מוצר (D11, D20) אינם משהו שהקורא יכול לפתוח ולא שייכים לממשק.
- **מספרים ומגדר:** "שני מספרים", "שתי אחזקות", "עד ארבע [חשיפות] בבת אחת", "אחת־אחת". **צורת זוגי** חובה ל־2 בשנה/חודש/יום: שנתיים, חודשיים, יומיים; "{n} חודשים" צריך מסלול נפרד ל־2 (copy.md §1 — Intl.PluralRules). אחד/שתיים במילים ("מסלול אחד", "שני מסלולים"), מ־3 בספרות.
- **מילה אחרי מספר:** "ב־10 שנים", "4 ימי עסקים", "12 חודשים"; לא "10 שנה".

### 10.5 Buttons, chips and labels — כפתורים, צ'יפים ותוויות

- **כפתור שעושה פעולה: שם פעולה** (שם עצם) או **שם פועל** (ל־): "שמירה", "מחיקה", "העתקה", "ביטול", "לשמור את ההשוואה", "להציג עוד". לא ציווי ("שמרו") — הציווי שמור למשפטי הנחיה בגוף הטקסט. שתי הצורות חיות באתר זו לצד זו; הכלל: **כפתור קצר של פעולה אחת ← שם עצם; כפתור שמתאר תוצאה או כולל מושא ← שם פועל**.
- **קישור ליעד: ל־ + היעד**: "לתוצאה", "לטופס המטרה", "לעמוד המדריך", "לכל הפרמטרים".
- **כפתור שמכניס את האדם למצב של בחירה: שם פועל עם מושא**: "להשוות אליו", "להזין ריבית אחרת", "לחזור לריבית שפורסמה".
- **קישור־שאלה בשורת פריט: שאלה קצרה + ציווי**: "קיבלתם הצעה? הזינו אותה".
- **אורך:** כפתור עד 3 מילים; צ'יפ עד 4; תווית שדה עד 7 (הארוכות שבאתר, "הירידה הגדולה ביותר שתסכימו לספוג בדרך למטרה", מוצדקות ב־9.7 ונשארות).
- **צ'יפ מצב:** בינוני סביל נקבה, מתאים ל"אפשרות"/"חשיפה"/"קרן" ("דורגה", "נפסלה", "הושוותה"); ברבים לפי המנייה ("3 דורגו"). זכר רק כשהשם המונה זכר ("דורג 1 מתוך 7 ספקים", "מסלול: מתאים").
- **תווית של ערך:** שם עצם בלבד, בלי נקודתיים כשהערך בשורה נפרדת ("יתרה", "סיווג"); עם נקודתיים כשהערך ממשיך באותה שורה ("מפוקח: {רגולטור}", "סיווג:").
- **לטינית בכותרות ותוויות:** כפי שהמקור כותב: S&P 500, W-8BEN, ISIN, PDF, gov.il. שמות מותגים לא מתורגמים ולא מתועתקים ("iShares"). קודים של רשויות באותיות גדולות (CMA, ISA) נשארים בקוד בלבד; על המסך השם העברי.
- **שם לקורא מסך (לא נראה):** תיאורי ובפעולה ברורה: "להגדיל את הגיל בשנה", "עוד פעולה בחודש", "מצב ההשוואה". לא שם של אייקון.

### 10.6 Errors, empty states and hints — שגיאות, מצבים ריקים ורמזים

**שגיאת שדה** (מתחת לשדה, נקודה בסוף):
1. מה לעשות, בציווי רבים, כשיש ערך תקין להציע: "הזינו מספר.", "הזינו אחוז עד 100.", "הזינו לפחות שנה אחת."
2. מה אסור, כהצהרה, כשהגבול הוא העובדה: "הסכום לא יכול להיות שלילי.", "המינימום לא יכול להיות גבוה מהמקסימום."
3. השוואה קצרה כשהשדה שלידו ברור: "גדול מהיתרה בעו״ש."
אין "שגיאה", אין "לא תקין" בלי לומר מה, אין סימן קריאה.

**כישלון של האתר** (לא של האדם): "לא הצלחנו ל…" + מה לעשות: "לא הצלחנו לחשב. רעננו את העמוד ונסו שוב." כשאין מה לעשות: "לא הצלחנו לקרוא את הקובץ."

**מצב ריק:** עובדה קצרה + הדרך הלאה כקישור. "עוד אין מטרה שמורה." → "להגדיר מטרה". "עוד אין מה לשמור." "אין קרן שמתאימה לחיפוש." כשהאתר הוא שחסר לו משהו, אומרים את זה בפירוש: "עוד אין לאתר את תנאי המוצר", "הפרטים עוד לא נאספו". לעולם לא מרמזים שהמוצר גרוע.

**רמז (hint) מתחת לשדה:** משפט אחד, מה הערך ולמה האתר שואל: "בכמה המחירים עולים בשנה, בממוצע.", "מסמן בגרף גילים שבהם הכללים משתנים." כאן מותר הטון החברי: "קצת עליכם", "לדייק (לא חובה)", "שני מספרים, ותראו כמה עולה".

**הודעת "לא נבדק/לא מחושב":** המצב בנקודתיים ואז הסיבה: "לא נבדק: אין מטרה שמורה", "חסום: שאלה פתוחה PEN OQ7", "לא נכלל בחישוב: {שם}." תמיד הסיבה; לעולם לא "לא זמין".

**הבטחות ("יתווסף בהמשך"):** רק כשזה עדיין נכון. אחרי גרסאות 4–5 כמה הבטחות כאלה כנראה התיישנו (ראו summary).

### 10.7 Slang policy — מדיניות סלנג ודיבור

**מותר ונכון (נגיעה קלה של דיבור):** כותרות דלתות ורמזים ("כסף שיושב בעו״ש", "מה כבר יש לכם", "קצת עליכם", "לדייק"), מצבים ריקים, שמות הפסיקה על עמלה ("שווה להתמקח", "לא שווה את הטרחה"), קישורי־שאלה ("קיבלתם הצעה?"), פריטי צ'קליסט ("מי אמר", "בכתב או בטלפון"), "בחרתי בזה".

**אסור:** כל מה שמביא עובדה — כללים, מס, מקור, תאריך תוקף, נוסח של רשות, אזהרות (stale, מקור משני, חסום), הודעות על כסף של האדם, הטקסט להעתקה למוסד. שם: עברית תקנית נקייה, מונחי המילון, בלי קריצות. "המס מנוכה בפדיון", לא "המס יורד כבר בפדיון".

**קו אדום:** אין סלנג אמיתי (אחלה, סבבה, וואלה, פאק), אין אנגלית־בעברית ("אפדייט", "דיפולט") כשיש מילה עברית מקובלת (עדכון, ברירת מחדל). מילים לועזיות שהמילון/הרשות משתמשים בהן נשארות: ברוקר, אינפלציה, רלוונטי, קופון, מינימום/מקסימום. "דשבורד" רק אם זה שם העמוד של בנק ישראל (לבדוק).

**"אמא שלכם לא תבין" מבחן:** אם משפט דורש היכרות עם המסמכים הפנימיים של האתר ("שולחן העבודה", "קלט", "D11", "רשומה") — לכתוב אותו מחדש במילים של העמוד או של הקורא. "רשומה" נשארת רק כמונח שהמילון מגדיר (רשומה שנאספה).

### 10.8 Grammar checklist — רשימת בדיקה דקדוקית

- התאמה במין ובמספר של בינוני ופועל לשם המונה המובלע: "אפשרות"/"חשיפה"/"קרן" → נקבה; "ספק"/"מסלול"/"מוצר" → זכר. כששם המוצר עצמו נקרא בכותרת ("פיקדון בנקאי היא הטובה ביותר") ההתאמה נשברת; פותרים במבנה שבו המילה המונה היא הנושא ("האפשרות הטובה ביותר … היא פיקדון בנקאי").
- "זה/זו/זאת" לפי מין השם: "זו לא הורדה", "זה לא קובץ של מקור".
- סמיכות: ה׳ הידיעה על הסומך בלבד: "סוג ההעסקה", "ממוצע הרשות", "שכר הנאמן של הקרן".
- כתיב מלא: איגרת, הכול, בסך הכול, תוכנית, ממדים (לא "מימדים"), ייתכן, אוכלוסייה, שתיים/שתי.
- "אי אפשר" (שתי מילים), "בלי" (לא "ללא" אלא בתוויות קצרות: "ללא תקרה", "ללא תאריך פרסום" — תקין כתווית).
- "עוד לא" ברירת המחדל לשלילת זמן; "עדיין" מותר אחרי "אין" כשהוא כבר כתוב ואין טעם לשנות; לא "טרם".
- "לאן" ליעד, "איפה" למקום: "לאן שאתם שולחים", "איפה זה בתלוש".
- "מתוך" / "מזה" לחלק מכלל: "דורג 1 מתוך 7", "מזה מס במכירה" (מקובל בטבלאות כספיות).
- לא "בכדי"; "כדי".
- אחרי "אם" בעתיד: "אם יורידו ל־", "מתהפך אם … תעבור".

### 10.9 Decisions for the owner — החלטות לבעל האתר

1. **כותרות ההשוואה ומין שם המוצר.** "{אפשרות} היא הטובה ביותר" ו־"{חשיפה} מתאימה למטרה הזו" נשברות כשהשם זכר (פיקדון, מק״מ, חשבון השקעות, מדד S&P 500). שתי דרכים: (א) להפוך את המבנה כך שהמילה "האפשרות/החשיפה" היא הנושא ("האפשרות הטובה ביותר למטרה הזו היא פיקדון בנקאי, כי …") — ההצעה שלי, מיושמת בקובץ ההצעות בביטחון בינוני; (ב) להוסיף שדה מין לכל מוצר וחשיפה ולהתאים פועל ותואר. הצ'יפים הקצרים ("דורגה", "נפסלה") נשארים בנקבה כמוסכמה ("האפשרות דורגה") בשתי הדרכים.
2. **"הוזן על ידך".** מפר את כלל הפנייה (יחיד זכר). האפשרויות: "הזנתם" (קצר, כמו "תשואה שהזנתם" בכל האתר; ההצעה שלי), או "הוזן על ידכם" (שומר על המבנה הסביל, כבד). נוגע גם ל־numbers.legend.entered, strength.entered.label, values.stateEntered שאינם ברשימת הסקירה, ולמסמך העיצוב ("Entered by you").
3. **משפחת "ניתן".** copy.md קבע "לא ניתן להשוות" (8.6) ו"לא ניתן לאחד" (7.6) כתוויות תוצאה; שאר המשפטים באתר אומרים "אפשר/אי אפשר". ההצעה: לשנות את המשפטים הרצים ל"אי אפשר" (מיושם, ביטחון גבוה), ולהחליט אם גם התוויות הקבועות משתנות ("אי אפשר לאחד", "אין השוואה"). אם לא — להשאיר "לא ניתן" רק בשתי התוויות האלה ולצטט אותן במירכאות בתוך משפט.
4. **"מחירון" לחברות מנהלות.** המילון בחר "תעריפון" לבנקים ולברוקרים; לחברות גמל האתר אומר "המחירון של החברה" (5 שורות). שתי אפשרויות: לקבל "מחירון" כמונח של גמל (מקביל ל"ממוצע שנגבה"), או לאחד ל"תעריפון". לא שונה בסבב הזה, פרט לשתי שורות שבהן המילה הייתה מיותרת.
5. **"מוצגת, לא מדורגת" מול "מוצגות בלי דירוג".** המילון מכיר את הראשון; משפטי הכיסוי את השני. ההצעה: יחיד "מוצגת, לא מדורגת" (צ'יפ, מילון), רבים "מוצגות בלי דירוג" (כיסוי) — זה המצב ברוב האתר, ושתי השורות החורגות הותאמו אליו. אפשרות אחרת: "בלי דירוג" בכל מקום.
6. **כותרת עמוד ההעברה.** הכותרת "להעביר למכשיר אחר" (שם פועל, 7.6) מול הקישורים אליו "העברה למכשיר אחר" (שם פעולה). שתיהן תקינות; לאחד או להשאיר.
7. **"שולחן העבודה".** מילה של המסמכים שהגיעה לשני משפטים על המסך. לקרוא לעמודים בשמותיהם ("איזו קרן לקנות", "כל המסלולים בכל החברות") או לתת לשלושת העמודים שם־גג שמופיע באתר.
8. **"ההתנהגות שלכם"** ככותרת הקטע של פעולות בחודש וערוץ. ההצעה: "הפעילות שלכם". חלופות: "איך אתם פועלים", "ההרגלים שלכם".
9. **"לדשבורד העמלות של בנק ישראל".** אם זה שם העמוד אצל בנק ישראל — נשאר; אם לא — "להשוואת העמלות של בנק ישראל".
10. **צורת הפנייה** — אין הצעה לשינוי. ציווי רבים + סתמי עובד היטב, נייטרלי־מגדר, וקרוב לאיך שישראלים כותבים הודעות לקבוצה. "את/אתה" היה דורש הכפלה או סלאשים, ושניהם גרועים מהמצב.


### 10.10 Applied 2026-10-24 (Hebrew editor)

Every string edit of the day, as applied to `site/app/copy.ts` (the rows above carry the note "changed 2026-10-24 (Hebrew editor)" where the old text was found; the rest are listed here only). `count` is how many places in `copy.ts` the edit touched.

| Key | Was | Now | count |
|---|---|---|---|
| `numbers.weak.institution` | institution: "מוסדי" } | institution: "לפי החברה" } | 1 |
| `strength.institution.label` | institution: { label: "מקור מוסדי", line: | institution: { label: "לפי החברה", line: | 1 · not in the tables above |
| `guideBlocks.taxSteps.F-44.baseTag` | baseTag: "בסיס המס: מקור מוסדי" | baseTag: "בסיס המס: לפי החברה" | 1 · not in the tables above |
| `r4playbook.chip.institution` | "primary-mirror": "ראשי, בעותק", institution: "מוסדי", | "primary-mirror": "ראשי (עותק)", institution: "לפי החברה", | 1 · not in the tables above |
| `r5.exposure.fields.institution` |       institution: "מוסדי", |       institution: "לפי החברה", | 1 · not in the tables above |
| `r5.graduation.institution` | ומסמן ״מקור מוסדי״ | ומסמן ״לפי החברה״ | 1 · not in the tables above |
| `entered state (5 keys)` | הוזן על ידך | הזנתם | 5 |
| `strength.open.line` | עוד לא מצאנו מקור שעונה על זה | עוד לא נמצא מקור שעונה על זה | 1 |
| `search.empty.title` | title: "עוד לא קוטלג" | title: "עוד לא באתר" | 1 |
| `search.empty.bodyBefore` | bodyBefore: "את השם “" | bodyBefore: "את השם ״" | 1 · not in the tables above |
| `search.empty.bodyAfter` | "” עוד אין באתר. שמרנו אותו במכשיר שלכם כדי שיהיה אפשר להוסיף אותו." | "״ עוד אין באתר. השם נשמר במכשיר שלכם כדי שיהיה אפשר להוסיף אותו." | 1 · not in the tables above |
| `search.empty.copyFailed` | לא הצלחנו להעתיק. סמנו את השם והעתיקו אותו ידנית. | ההעתקה לא הצליחה. סמנו את השם והעתיקו אותו ידנית. | 1 |
| `guideIndex.last.line` | מוצרים שאנחנו מכירים אבל עוד לא מסבירים עד הסוף | מוצרים שהאתר מכיר אבל עוד לא מסביר עד הסוף | 1 |
| `notCovered.lede` | מוצרים שאנחנו מכירים אבל עוד לא יכולים להסביר עד הסוף, ולמה. | מוצרים שהאתר מכיר אבל עוד לא יכול להסביר עד הסוף, ולמה. | 1 |
| `guide.figureNotUpdated.after` | עד שנעדכן אותו, האתר לא מחשב את הגרף. | עד שהוא יעודכן, האתר לא מחשב את הגרף. | 1 |
| `system.calcFailed` | לא הצלחנו לחשב את הגרף. רעננו את העמוד ונסו שוב. | האתר לא הצליח לחשב את הגרף. רעננו את העמוד ונסו שוב. | 1 |
| `system.wentWrong.line` | לא הצלחנו להציג את העמוד הזה. | האתר לא הצליח להציג את העמוד הזה. | 1 |
| `companies.noMatch` | לא מצאנו חברה בשם הזה. | אין חברה בשם הזה. | 1 |
| `catalogue.unassigned.line` | שמות שהחברה משתמשת בהם ועוד לא הצלחנו לשייך למסלול בנתוני הרשות. | שמות שהחברה משתמשת בהם ושעוד לא שויכו למסלול בנתוני הרשות. | 1 |
| `r2.form.filledBefore/After` | filledBefore: "מילאנו ",     filledAfter: " כנקודת התחלה. שנו מה שמתאים." | filledBefore: "השדות ",     filledAfter: " מולאו כנקודת התחלה. שנו מה שמתאים." | 1 · not in the tables above |
| `r2.form.keptEntered` | שמרנו על מה שהזנתם. | מה שהזנתם נשמר. | 1 |
| `r2.form.payslipLast` | עוד לא מצאנו להם מקור רשמי. | האתר עוד לא מצא להם מקור רשמי. | 1 |
| `r2.couldNotSave` | לא הצלחנו לשמור במכשיר הזה. ההשוואה תעבוד, אבל המטרה לא תישמר. | האתר לא הצליח לשמור במכשיר הזה. ההשוואה תעבוד, אבל המטרה לא תישמר. | 1 |
| `r5.exposure.save.failed` | לא הצלחנו לשמור במכשיר הזה. ההשוואה תעבוד, אבל לא תישמר. | האתר לא הצליח לשמור במכשיר הזה. ההשוואה תעבוד, אבל לא תישמר. | 1 |
| `r2.result.failed · r5.exposure.failed` | לא הצלחנו לחשב את ההשוואה. רעננו את העמוד ונסו שוב. | האתר לא הצליח לחשב את ההשוואה. רעננו את העמוד ונסו שוב. | 2 |
| `idle.noCost` | לפי הנתונים שלנו אף אפשרות נזילה | לפי הנתונים של האתר אף אפשרות נזילה | 1 |
| `idle.baselineNone` | לפי הנתונים שלנו העו״ש לא משלם ריבית. | לפי הנתונים של האתר העו״ש לא משלם ריבית. | 1 |
| `idle.failed` | "לא הצלחנו לחשב. רעננו את העמוד ונסו שוב." | "האתר לא הצליח לחשב. רעננו את העמוד ונסו שוב." | 1 |
| `r3fees.failed` | לא הצלחנו לחשב את העמלות. רעננו את העמוד ונסו שוב. | האתר לא הצליח לחשב את העמלות. רעננו את העמוד ונסו שוב. | 1 |
| `r3fees.notFound` | לא מצאנו את המוצר או האחזקה. | המוצר או ההחזקה לא נמצאו. | 1 |
| `r3fees.review.genericFail · runFailure.generic` | לא הצלחנו להריץ את החישוב עם הערכים האלה. בדקו את ההנחות שהזנתם. | האתר לא הצליח להריץ את החישוב עם הערכים האלה. בדקו את ההנחות שהזנתם. | 2 |
| `r3holdings.loadFailed` | לא הצלחנו לטעון את הנתונים. רעננו את העמוד ונסו שוב. | האתר לא הצליח לטעון את הנתונים. רעננו את העמוד ונסו שוב. | 1 |
| `r3holdings.feeFailed` | לא הצלחנו לחשב את העלות. בדקו את המטרה ואת הערכים שהזנתם. | האתר לא הצליח לחשב את העלות. בדקו את המטרה ואת הערכים שהזנתם. | 1 |
| `r3holdings.consolidation.worthUnavailable.failed` | לא הצלחנו לחשב את שווי האיחוד. | האתר לא הצליח לחשב את שווי האיחוד. | 1 |
| `r3transfer.copyBlocked` | לא הצלחנו להעתיק. סמנו והעתיקו מכאן. | ההעתקה לא הצליחה. סמנו והעתיקו מכאן. | 1 |
| `r3transfer.errors.unreadable` | לא הצלחנו לקרוא את הקובץ. | האתר לא הצליח לקרוא את הקובץ. | 1 |
| `r4workbench.providers.failed` | לא הצלחנו לטעון את נתוני הספקים. נסו לרענן. | האתר לא הצליח לטעון את נתוני הספקים. נסו לרענן. | 1 |
| `r4workbench.funds.failed` | לא הצלחנו לטעון את נתוני הקרנות. נסו לרענן. | האתר לא הצליח לטעון את נתוני הקרנות. נסו לרענן. | 1 |
| `r2.form.noReturnBefore` | בלי צורך בדוח שנתי למס: עדיין לא ניתן לבדוק. שאלה פתוחה | בלי צורך בדוח שנתי למס: עוד אי אפשר לבדוק. שאלה פתוחה | 1 |
| `r3fees.reason.noReference` | אין ממוצע להשוואה, ולכן לא ניתן לומר שכדאי להתמקח. | אין ממוצע להשוואה, ולכן אי אפשר לומר שכדאי להתמקח. | 1 |
| `r2.result.sensFooter` | הטווחים הם פרמטר של האתר ולא ניתנים לשינוי כאן. | הטווחים הם פרמטר של האתר, ואי אפשר לשנות אותם כאן. | 1 |
| `r3holdings.consolidation.bankChild` | לא ניתן להעביר לבנק אחר. | אי אפשר להעביר לבנק אחר. | 1 |
| `r3holdings.consolidation.outcomes.notAllowed` | notAllowed: "לא ניתן לאחד" | notAllowed: "אי אפשר לאחד" | 1 |
| `r3holdings.child.blocked` | האם המסלול נבחר או ברירת מחדל: לא ניתן לבדוק. | האם המסלול נבחר או ברירת מחדל: אי אפשר לבדוק. | 1 |
| `r4playbook.cost.hishtalmutPartial` | אי אפשר: קרן השתלמות עוברת רק בשלמותה. | אי אפשר: קרן השתלמות עוברת רק בשלמותה. | 1 · changed 2026-10-24 (Hebrew editor); was ״לא ניתן:״ |
| `r5.revisit.verdict.cannotRun` | cannotRun: "לא ניתן לבדוק: {reason}" | cannotRun: "אי אפשר לבדוק: {reason}" | 1 · not in the tables above |
| `r4catalogue.missingLinks.compare/compareBroker` | מופיע שם כלא ניתן להשוות) | מופיע שם כ״אי אפשר להשוות״) | 2 |
| `r4workbench.providers.levelLine.averageSome` | ספק בלי ממוצע מופיע כלא ניתן להשוות. | ספק בלי ממוצע מופיע כ״אי אפשר להשוות״. | 1 |
| `r4workbench.notComparable.heading · coverage (3 keys)` | לא ניתן להשוות | אי אפשר להשוות | 3 |
| `guideBlocks.terms.labels.regBalance/regDeposit` | (ממוצע שנגבה, לא מחירון) | (לא תעריפון) | 2 |
| `r4workbench.providers.levelLine.list` | לפי התעריפון המלא של כל ספק, במחיר המחירון, בלי הנחות. | לפי התעריפון המלא של כל ספק, בלי הנחות. | 1 |
| `r4workbench.providers.provident.note` | כאן מופיעים דמי הניהול לפי המחירון של כל חברה, בלי דירוג. | כאן מופיעים דמי הניהול לפי התעריפון של כל חברה, בלי דירוג. | 1 |
| `r4workbench.providers.provident.label` | דמי ניהול לפי המחירון של החברה, לא מדורג | דמי ניהול לפי התעריפון של החברה, לא מדורג | 1 |
| `r4playbook.cost.providentLines[1]` | דמי הצטרפות, אם החברה גובה: לפי המחירון של החברה. | דמי הצטרפות, אם החברה גובה: לפי התעריפון של החברה. | 1 |
| `r5.exposure.coverageReasons.excluded` | מסכימים לספוג עד {accepted}. D11" | מסכימים לספוג עד {accepted}." | 1 · not in the tables above |
| `r5.exposure.coverageReasons.noSeries` | שערי בנק ישראל מוצגים רק בקישור. D20" | שערי בנק ישראל מוצגים רק בקישור." | 1 |
| `r5.revisit.cannotRunReasons.input` | input: "חסר קלט: {field}" | input: "חסר נתון: {field}" | 1 · not in the tables above |
| `r5.exposure.coverage.last` | הקרנות והמסלולים שנותנים כל חשיפה מושווים בשולחן העבודה. | הקרנות והמסלולים שנותנים כל חשיפה מושווים בעמודים ״איזו קרן לקנות״ ו״כל המסלולים בכל החברות״. | 1 |
| `r5.graduation.path` | כשייסגר: יופיע במדריך, בהשוואה למטרה, בשולחן העבודה ובקטלוג, ויימנה בשורת הכיסוי של כל השוואה. | כשייסגר: יופיע במדריך, בהשוואה למטרה, ב״חברות ומסלולים״ ובעמודי ״איזה בנק או בית השקעות״ ו״איזו קרן לקנות״, ויימנה בשורת הכיסוי של כל השוואה. | 1 |
| `r4workbench.providers.behaviour.title` | title: "ההתנהגות שלכם" | title: "הפעילות שלכם" | 1 |
| `r3fees.linkOuts.boi · r4workbench.noAverageLinks.boi` | לדשבורד העמלות של בנק ישראל | ללוח הנתונים של בנק ישראל | 2 |
| `exposurePage.holdLine` | המוצרים שבהם אפשר להחזיק את זה. השוואה ביניהם למטרה שלכם תתווסף בהמשך. | המוצרים שבהם אפשר להחזיק את זה. ההשוואה ביניהם למטרה שלכם: בעמוד ״השוואה למטרה״. | 1 |
| `r2.result.coverageLast` | המסלולים והקרנות בתוך כל מוצר מופיעים בעמודי החברות. ההשוואה ביניהם תתווסף בהמשך. | המסלולים והקרנות בתוך כל מוצר מושווים בעמודים ״כל המסלולים בכל החברות״ ו״איזו קרן לקנות״. | 1 |
| `r3workbench.providerLine` | הטבלה לפי ספקים, עם התעריפונים, תתווסף בהמשך. | הטבלה לפי ספקים, עם התעריפונים: בעמוד ״איזה בנק או בית השקעות״. | 1 |
| `r3workbench.noTracks` | noTracks: "למוצר הזה אין מסלולים בנתוני הרשות. הטבלה לפי ספקים תתווסף בהמשך." | noTracks: "למוצר הזה אין מסלולים בנתוני הרשות." | 1 |
| `r3holdings.consolidation.guideLater` | guideLater: "המדריך למעבר יתווסף בהמשך" | guideLater: "המדריך למעבר: בעמוד ״איך עוברים״" | 1 |
| `guideBlocks.exit.afterYears` | afterYears: { before: "כשעוברות מההפקדה הראשונה", after: "" } | afterYears: { before: "כשעוברות", after: "מההפקדה הראשונה" } | 1 · not in the tables above |
| `guideBlocks.taxSteps.F-32.headline` | לעצמאים ולמי שנחשבים עמית מוטב | לעצמאים ולמי שנחשב עמית מוטב | 1 |
| `guideBlocks.fees.creation_redemption.base` | כשההזמנה עוברת ליצרן הקרן ולא לבורסה | כשההזמנה עוברת למנהל הקרן ולא לבורסה | 1 |
| `guide.related` | related: "גם כדאי להכיר:" | related: "כדאי להכיר גם:" | 1 |
| `exposurePage.openTax` | עוד לא ברור איך זה ממוסה כאן: שאלה פתוחה | עוד לא ברור איך זה ממוסה כאן: שאלה פתוחה | 1 · changed 2026-10-24 (Hebrew editor); was ״לא ברור עדיין״ |
| `rulesPage.groups.managed-and-robo-portfolios.md` | תיקים מנוהלים ויועץ אוטומטי | תיקים מנוהלים ותיקים דיגיטליים | 1 |
| `rulesPage.groups.tax-tier2-other.md` | מס: מט״ח, אג״ח קונצרניות, ריט וזהב ותיקים מנוהלים | מס: מט״ח, אג״ח קונצרניות, ריט, זהב ותיקים מנוהלים | 1 |
| `parametersPage.fields.P-03.negotiate_nis` | עלות לאורך האופק שמעליה שווה לנהל משא ומתן | עלות לאורך האופק שמעליה שווה להתמקח | 1 |
| `parametersPage.fields.P-03.negotiate_share` | חלק מכלל העלות (סף משא ומתן) | חלק מכלל העלות (סף ההתמקחות) | 1 |
| `company.lineBefore (month is a Hebrew word: no maqaf)` | ביטוח וחיסכון, נכון ל־",   feesLine | ביטוח וחיסכון, נכון ל",   feesLine | 1 · not in the tables above |
| `r3workbench.line.before (month is a Hebrew word: no maqaf)` | before: "לפי נתוני רשות שוק ההון, ביטוח וחיסכון, נכון ל־", | before: "לפי נתוני רשות שוק ההון, ביטוח וחיסכון, נכון ל", | 1 · not in the tables above |
| `company.paste.label` | label: "הדביקו את השם כמו שהוא מופיע באפליקציה, בפרסומת או בדוח." | label: "הקלידו או הדביקו את השם כמו שהוא מופיע באפליקציה, בפרסומת או בדוח." | 1 |
| `r2.result.reasons.enterEmployment` | enterEmployment: "הזינו סוג העסקה" | enterEmployment: "הזינו את סוג ההעסקה" | 1 |
| `r2.form.employment · values.fields.employment` | "סוג העסקה" | "סוג ההעסקה" | 2 |
| `r2.form.insuranceHint` | כיסוי למקרה מוות ונכות שיורד מהחיסכון כל חודש. | כיסוי למקרה מוות או נכות שיורד מהחיסכון כל חודש. | 1 |
| `r2.form.errAvailable` | errAvailable: "גדול מהסכום היום." | errAvailable: "החלק הזמין גדול מהסכום היום." | 1 |
| `r2.form.errPercentBefore` | errPercentBefore: "הזינו אחוז עד " | errPercentBefore: "הזינו אחוז בין 0 ל־" | 1 |
| `r4workbench.providers.offer.errors.percent` | `הזינו אחוז עד ${max}.` | `הזינו אחוז בין 0 ל־${max}.` | 1 · not in the tables above |
| `r5.form.empty` | ההשוואה לפי חשיפה תרוץ בלי מסנן, ותגיד זאת. | ההשוואה לפי חשיפה תרוץ בלי מסנן, ותציין את זה. | 1 |
| `r2.result.decidingLine` | decidingLine: "מכריע לעומת הקודמת:" | decidingLine: "מכריע לעומת האפשרות שמעליה:" | 1 |
| `r2.result.listedCeilingBefore` | listedCeilingBefore: "התקרה השנתית לוקחת רק חלק מהכסף:" | listedCeilingBefore: "בתקרה השנתית נכנס רק חלק מהכסף:" | 1 |
| `r2.result.needMore` | כדי להשוות, הזינו כמה שנים עד המטרה וסכום, להיום או להפקדה חודשית. | כדי להשוות, הזינו כמה שנים עד המטרה, וסכום היום או הפקדה חודשית. | 1 |
| `r2.result.reasons.tier2` | tier2: "עוד לא מכוסה, שאלות פתוחות" | tier2: "עוד לא מכוסה: שאלות פתוחות" | 1 |
| `r2.result.reasons.notOwnMoney` | מקבל רק את הכספים מביטוח לאומי ואת הפקדת ההורה | מקבל רק את הכספים מהביטוח הלאומי ואת הפקדת ההורה | 1 |
| `r2.result.reasons.excludedBefore` | excludedBefore: "נפסל לפי האילוץ:" | excludedBefore: "נפסלה לפי האילוץ:" | 1 |
| `idle.errKeep` | errKeep: "גדול מהיתרה בעו״ש." | errKeep: "הסכום גדול מהיתרה בעו״ש." | 1 |
| `r3fees.reduction.notReduction` | notReduction: "זה לא הורדה." | notReduction: "זו לא הורדה." | 1 |
| `r3fees.chart.remainderLegend` | remainderLegend: "השפעה משולבת: הרווח עד הקו" | remainderLegend: "השפעה משולבת: הפער עד הקו" | 1 |
| `r3holdings.paste` | paste: "הדביקו את השם כמו שהוא מופיע בדוח" | paste: "הקלידו או הדביקו את השם כמו שהוא מופיע בדוח" | 1 |
| `r3holdings.errors.noTrack` | בחרו חברה ומסלול, או הדביקו את השם מהדוח. | בחרו חברה ומסלול, או הקלידו את השם מהדוח. | 1 |
| `r3holdings.feeBalance` | feeBalance: "מחיסכון", | feeBalance: "מחיסכון (בדוח: מהצבירה)", | 1 · not in the tables above |
| `r3holdings.consolidation.notYet.before` | before: "עוד לא: החשבון השני נזיל מ־" | before: "עוד לא: החשבון השני נזיל מ־" | 1 · changed 2026-10-24 (Hebrew editor); was ״לא עדיין:״ |
| `r3transfer.title` | title: "להעביר למכשיר אחר" | title: "העברה למכשיר אחר" | 1 |
| `r3transfer.lede` | הקובץ עובר רק איפה שאתם שולחים אותו. | הקובץ עובר רק לאן שאתם שולחים אותו. | 1 |
| `r3transfer.chooseFile` | chooseFile: "בחרו קובץ" | chooseFile: "בחירת קובץ" | 1 |
| `r4catalogue/r4workbench.instrumentClasses.tase_shares_bonds` | "מניות ואגרות חוב" | "מניות ואיגרות חוב" | 2 |
| `r4catalogue.linkage.fx` | fx: "צמוד לשער" } | fx: "צמוד למט״ח" } | 1 |
| `r4workbench.notComparable.lineWithoutValue` | בשורה "${name}" חסר ערך בתעריפון. | בשורה ״${name}״ חסר ערך בתעריפון. | 1 · not in the tables above |
| `r4workbench.providers.tableHeading` | tableHeading: "לפי העלות, מהזולה לגבוהה" | tableHeading: "לפי העלות, מהזולה ליקרה" | 1 |
| `r4workbench.providers.behaviour.fxForeign` | `הקרן נקובה ב${ccy}: כל הפקדה מומרת.` | `הקרן נקובה ב־${ccy}: כל הפקדה מומרת.` | 1 · not in the tables above |
| `r4workbench.providers.cannotRun.needRate` | `הזינו את שער ה${ccy} בעמוד הקרנות כדי להשוות ספקים.` | `הזינו את שער ה־${ccy} בעמוד הקרנות כדי להשוות ספקים.` | 1 · not in the tables above |
| `r4workbench.providers.detail.bases.custody` | custody: "דמי ניהול פיקדון", fx: "המרת מטבע", fixed_period | custody: "דמי ניהול פיקדון ני״ע", fx: "המרת מטבע", fixed_period | 1 · not in the tables above |
| `r4workbench.providers.entered.link` | link: "הזינו הצעה" | link: "להזין הצעה" | 1 |
| `r4workbench.links.changeFund · providers.changeFund` | "החליפו קרן" | "להחליף קרן" | 2 |
| `r4workbench.funds.sheet.providerChange` | providerChange: "החליפו ספק" | providerChange: "להחליף ספק" | 1 |
| `r5.exposure.fields.holdingChange` | holdingChange: "החליפו מוצר" | holdingChange: "להחליף מוצר" | 1 |
| `r4workbench.funds.feesHeading` | feesHeading: "דמי הקרן" | feesHeading: "עלויות הקרן" | 1 |
| `r4workbench.funds.fees.trustee` | trustee: "דמי נאמן" | trustee: "שכר נאמן" | 1 |
| `r4workbench.funds.trading.abroad` | `נקנית ב${ccy} בחו״ל` | `נקנית ב־${ccy} בחו״ל` | 1 · not in the tables above |
| `r4workbench.funds.trading.quoted` | `נקובה ב${ccy}` | `נקובה ב־${ccy}` | 1 · not in the tables above |
| `r4workbench.funds.reasons.startRate` | `הזינו את שער ה${ccy}.` | `הזינו את שער ה־${ccy}.` | 1 · not in the tables above |
| `r4workbench.funds.reasons.otherCurrency` | `אין חישוב לקרן ב${a} על חשיפה ב${b}.` | `אין חישוב לקרן ב־${a} על חשיפה ב־${b}.` | 1 · not in the tables above |
| `r4workbench.funds.groups.listed` | listed: "מוצגות, לא מדורגות" | listed: "מוצגות בלי דירוג" | 1 |
| `r5.revisit.outcomes.listed-not-ranked` | "listed-not-ranked": "מוצגת בלי דירוג" | "listed-not-ranked": "מוצגת, לא מדורגת" | 1 |
| `r4playbook.incomplete` | כלל פתוח מסומן בנעילה. | כלל פתוח מסומן במנעול. | 1 |
| `r4playbook.cost.differentKinds` | אין כלל שאומר שהעברה בין שני סוגים חופשית ממס. | אין כלל שאומר שהעברה בין שני סוגים פטורה ממס. | 1 |
| `r4playbook.offer.lede` | lede: "הצעות נמשכות. רשמו כל הצעה עם התאריך שלה." | lede: "הצעות גם מתבטלות. רשמו כל הצעה עם התאריך שלה." | 1 |
| `r5.exposure.headline.reason` | "{exposure} מתאימה למטרה הזו לפי התשואות שהזנתם, כי {reason}." | "לפי התשואות שהזנתם, החשיפה שמתאימה למטרה הזו היא {exposure}, כי {reason}." | 1 · not in the tables above |
| `r5.exposure.headline.sourcedCash` | "{exposure} מתאימה למטרה הזו לפי התשואות שהזנתם ולפי ריבית הבנק שפורסמה, כי {reason}." | "לפי התשואות שהזנתם ולפי ריבית הבנק שפורסמה, החשיפה שמתאימה למטרה הזו היא {exposure}, כי {reason}." | 1 · not in the tables above |
| `r5.exposure.headline.bare` | "{exposure} מתאימה למטרה הזו לפי התשואות שהזנתם." | "לפי התשואות שהזנתם, החשיפה שמתאימה למטרה הזו היא {exposure}." | 1 · not in the tables above |
| `r5.exposure.headline.bareSourced` | "{exposure} מתאימה למטרה הזו לפי התשואות שהזנתם ולפי ריבית הבנק שפורסמה." | "לפי התשואות שהזנתם ולפי ריבית הבנק שפורסמה, החשיפה שמתאימה למטרה הזו היא {exposure}." | 1 · not in the tables above |
| `r5.exposure.headline.single` | "{exposure} היא החשיפה היחידה שדורגה למטרה הזו." | "החשיפה היחידה שדורגה למטרה הזו היא {exposure}." | 1 · not in the tables above |
| `r5.exposure.notes.passed` | passed: "עברה את מסנן הירידה: {worst} עד {accepted}." | passed: "עברה את מסנן הירידה: צופים {worst}, מסכימים לספוג עד {accepted}." | 1 · not in the tables above |
| `r5.exposure.fields.worstLabel` | worstLabel: "הירידה החמורה ביותר שאתם צופים ב־{exposure}, בדרך למטרה" | worstLabel: "הירידה החמורה ביותר שאתם צופים בחשיפה {exposure}, בדרך למטרה" | 1 · not in the tables above |
| `r5.exposure.fields.holdingLine` | holdingLine: "מוחזקת ב־{wrapper}" | holdingLine: "מוחזקת במוצר {wrapper}" | 1 · not in the tables above |
| `r5.exposure.listedThrough` | listedThrough: "ב{wrapper}: {reason}" | listedThrough: "במוצר {wrapper}: {reason}" | 1 · not in the tables above |
| `r5.exposure.assumptions.group/holding` | מוחזקת ב" | מוחזקת במוצר" | 2 |
| `r5.revisit.choiceStill/choiceNot` | בחרתם ב{option}; | בחרתם באפשרות {option}; | 2 · not in the tables above |
| `r5.revisit.verdict.none` | אף אפשרות לא דורגה, גם בשמירה. | אף אפשרות לא דורגה, גם לא בזמן השמירה. | 1 |
| `אחזקה → החזקה (holdings, fees, transfer)` | אחזק | החזק | 12 |
| `guideBlocks.terms.valueWords.list` (added today by a fixer) | מחירון | תעריפון | 1 · not in the tables above |

Also fixed outside `copy.ts` the same day, at the lead's request: "הודעו" → "הודיעו" (`site/app/lib/playbook.ts`, the employer step title), "והותק" → "והוותק" (`site/app/content/guide/keren-hishtalmut.tsx`), and מק"מ → מק״מ in the site's own prose under `site/app/content/` (26 places; glossary `Term` ids unchanged).

## Added 2026-10-24 (audit wave, WP9: workbench and catalogue)

| Key | Text | Note |
|---|---|---|
| `r3workbench.openToAll` | פתוח לכולם · `{n}` מסלולים הפתוחים רק לקבוצה מסוימת מוסתרים | A36: the toggle, on by default; the count is the sector and employer tracks it hides |
| `r3workbench.sortDir` | מהנמוך לגבוה · מהגבוה לנמוך | A36: screen-reader words for the sort direction; a second press reverses |
| `r3workbench.missingKey` | עוד לא דווח: החברה לא דיווחה לרשות את הנתון לתקופה הזו. | A87: one-line key under a table that holds an unreported fee |
| `r4workbench.providers.provident.title` | איזו חברה: `{מוצר}` | A35: the provider page title for the provident wrappers |
| `r4workbench.providers.provident.covered` | נאסף תעריפון של חברה אחת מתוך `{n}`; הדירוג הוא לפי מסלול. (many: של `{k}` חברות) | A35: one-sentence coverage statement, with the link "לדירוג לפי מסלול" |
| `r4catalogue.oneTariff` | הבנק מפרסם תעריפון אחד; ההצעות באפליקציה אישיות: הזינו אותן בעמוד כסף שיושב בעו״ש. | A88: under the bank's deposits group when it holds one product; the link goes to /idle-cash |


## Added 2026-10-24 (audit wave, WP6: shell, search, home)

| Key | Text | Note |
|---|---|---|
| `search.empty.bodyAfter` | ״`{שם}`״ עוד אין באתר. | changed 2026-10-24 (A4): the sentence "השם נשמר במכשיר שלכם…" is gone; a name is saved only when the person presses "העתקה" (the old row in section 3 is out of date) |
| `search.empty.underButton` | העתיקו את השם ושלחו אותו למי ששלח לכם את האתר, כדי שיתווסף. ההעתקה גם שומרת אותו במכשיר שלכם. | changed 2026-10-24 (A4): says what the copy button does |
| `search.empty.notProduct` | זה לא שם של מוצר? ראו מה האתר עוד לא מכסה | A58, A92: link to /not-covered under every "not on the site" answer |
| `search.groups.company` | חברות מנהלות | A92: companies are results |
| `search.groups.notcovered` | עוד לא באתר | A92: the not-covered products are results |
| `search.fundWord` | קופה `{n}` | A4: the number in a track row's second line |
| `search.securityWord` | מספר נייר `{n}` | A4: the number in a fund row's second line |
| `search.notCoveredLine` | מוצר שהאתר עוד לא מכסה | A92: second line of a not-covered result |
| `search.also` | נקרא גם: `{שמות}` | A92: other names of the same page, up to two |
| `site.menuBehind` | מאחורי הקלעים | A54: the menu's second group (כללים, פרמטרים, מה האתר עוד לא מכסה, העברה למכשיר אחר) |
| `site.homeCrumb` | ראשי | A54: the first page in a breadcrumb, instead of the site's name |
| `site.footerNote` | אתר אישי, לא מסחרי, בלי קישורי שיווק; הכול נשמר במכשיר שלכם | A29: the footer and under the first page's tagline |
| `site.footerAsOf` | נתונים נכון ל־`{date}` | A29: the date is the newest `checked` in data/ at build |
| `site.toTop` | חזרה למעלה | A96: aria-label of the back-to-top button |
| `home.goalDoor` | השוואה למטרה · הגדירו מטרה (סכום ושנים) וראו איזה מוצר מתאים ומה הוא עולה | A55: the goal card when no goal is saved |
| `home.holdingsSaved` | החזקה אחת שמורה: `{names}` · `{n}` החזקות שמורות: `{names}` | A55: second line on the holdings door |

## audit 2026-10-24 (WP1a): comparison fixes

New strings are `r2.result.*` and `r5.exposure.*` in copy.ts, each marked `// audit 2026-10-24 (A-nn)`. Changed rows: changed 2026-10-24 (UX fix A7, A11, A91, A3).

| Key | Hebrew | Note |
|---|---|---|
| `r2.result.headlineLead` / `headlineLeadTwo` | מבין `{n}` האפשרויות שדורגו, האפשרות שמשאירה לכם הכי הרבה כסף במועד המטרה היא `{שם}`. | A3; replaces `headlineAfter`/`headlineBare` ("היא הטובה ביותר למטרה הזו, כי …"), removed |
| `r2.result.headlineSingle` | האפשרות היחידה שדורגה למטרה הזו היא `{שם}`. | changed (hebrew-editor request: lead before the name) |
| `r2.result.headlineCashOnly` | עדיין אפשר לדרג רק את האפשרויות הנזילות. | A3 |
| `r2.result.headlineUnevaluated` | אפשרות אחת לא נבדקה: / שתי אפשרויות לא נבדקו: / `{n}` אפשרויות לא נבדקו: + הזינו `{שדות}` | A3, A91 |
| `r2.result.employmentInferred` | סוג ההעסקה: שכירים, כי יש לכם פנסיה או קרן השתלמות דרך העבודה. [לשנות] | A3 |
| `r2.result.biggestLead` | ההבדל הגדול ביותר בין שתי הראשונות: `{נוסחה}`, `{סכום}` אצל `{א}` לעומת `{סכום}` אצל `{ב}` (הפער הזה לרעת `{א}`). | A7; replaces `reasonFee/Tax/Relief` ("… כי"), removed |
| `r2.deciding["tax-at-exit"]` | מס (בהחזקה וביציאה) | changed (was מס ביציאה): the figure is holding tax plus exit tax |
| `r2.result.whyDeciding` / `decidingLine` | ההבדל הגדול ביותר / ההבדל הגדול ביותר מול האפשרות שמעליה: | changed (was מכריע …) |
| `r2.result.whyGross` | תשואה ברוטו שהחישוב רץ עליה (נתון שהוזן או פורסם, או פרמטר של האתר, לא תוצאה) | A7, informational row |
| `r2.result.depositRange.*` | הריבית שנקראה חלה על הפקדות של `{min}` עד `{max}`. ההפקדה שלכם גבוהה/נמוכה מזה … · להזין ריבית אחרת | A8 |
| `r2.result.representative.*` | חושב לפי הרשומה שנאספה: `{שם}`, ותעריפון `{ספק}`. [להחליף] | A10 |
| `r2.result.listedCeiling*` | אפשר להפקיד בה עד `{תקרה}` בשנה; `{סכום}` נשארים בחוץ, והאתר לא מפצל. | A11, changed (was "בתקרה השנתית נכנס רק חלק מהכסף: … עוברים למטרה הבאה") |
| `r2.result.fallEcho` | הירידה שתסכימו לספוג: `{אחוז}` מ־`{סכום}`, כלומר `{סכום}` היום. היא לא משפיעה על הדירוג בהשוואה לפי מוצר. | A12 |
| `r2.result.chosenNext` | מה עושים עכשיו: לבחור חברה ומסלול · איך מצטרפים או עוברים · מה העמלות יעלו לכם | A14 |
| `r2.result.saveMenu` | לשמור את ההשוואה / לשמור שוב את ההשוואה | A71 |
| `r2.result.counts`, `r5.exposure.coverage.counts` | אחת דורגה / שתיים דורגו / `{n}` דורגו, and the same for the other four outcomes | A91; `r5.exposure.coverage.sentence` is now "נבדקו `{n}` חשיפות:" and `notEligible` is removed |
| `r5.exposure.headline.noReturn` | עדיין אין מה להשוות: הזינו תשואה לחשיפה אחת לפחות. | changed (A3), shown as the headline |
| `r5.exposure.fields.returnFromProduct` | מההשוואה לפי מוצר | decision 16 |
| `r5.exposure.headline.reason` / `sourcedCash` | (removed) | the reason is the "largest difference" sentence now |

### 7.x Study fund that became liquid (scenario fix 2026-10-24, sc-holdings)

Strings in `r3holdings` (`site/app/copy.ts`), each marked `// scenario fix 2026-10-24`. Rule ids in brackets are the chips beside the sentence.

| Key | Hebrew | Note |
|---|---|---|
| firstDepositOver | ההפקדה הראשונה לפני יותר משש שנים (הקרן נזילה) | checkbox beside the exact date; the word "שש" is the TXH-09 wait written out |
| firstDepositOverWhy | במקום תאריך מדויק. אם לא סימנתם, הזינו את התאריך. | shown when ticked |
| feePrefill.balance / .deposit | ממוצע דמי הניהול מחיסכון של המסלול, כפי שהרשות מפרסמת: {ערך} לשנת {שנה}. / ...מהפקדה של המסלול: | the number is a sourced value through Num |
| feePrefill.balanceKept / depositKept | ריק: יישמר הממוצע הזה, כנתון ממקור. | |
| feePrefill.balanceEntered | הערך שהקלדתם יישמר במקום הממוצע. | |
| feePrefill.cardNote | ממוצע המסלול לפי הרשות, לא בהכרח מה שאתם משלמים | under a fee on the holding card that is the stored regulator average (2026-10-24, review fix); the card's average line is then not repeated |
| feePrefill.depositHint | אין שורה כזו בדוח? השאירו ריק. | replaces feeDepositHint when the track has a deposit average |
| liquidity.from | נזיל מ־{תאריך} בערך (לפי סוף החודש של ההפקדה הראשונה) [TXH-09] | changed 2026-10-24 (review fix): TXH-09's first payment date is a month end; `liquidity.about` is the added phrase |
| liquidity.notYet | עוד לא נזיל: נזיל מ־{תאריך} בערך (לפי סוף החודש של ההפקדה הראשונה) [TXH-09] | the same phrase (2026-10-24) |
| liquidity.overBefore | נזיל: ההפקדה הראשונה הייתה לפני יותר מ־{6 שנים} [TXH-09] | years from the rule's figure |
| liquidity.unknown | לא ידוע אם הקרן נזילה: חסר תאריך ההפקדה הראשונה. בעריכה אפשר גם לסמן שהיא הייתה לפני יותר משש שנים. | |
| decision.heading | הקרן נזילה: מה אפשר לעשות | |
| decision.stay | להשאיר: אין מס שנתי על הרווחים כל עוד הכסף בקרן; המס חל רק במשיכה. | [TXH-18] |
| decision.switchTrack | להחליף מסלול באותה קופה: מעבר מסלול בתוך הקרן אינו אירוע מס ואין עליו עמלה בתקנות; חברה רשאית להעלות דמי ניהול מוזלים אחרי מעבר. | [TXH-17, PF-23, SW-15] |
| decision.move | להעביר לחברה אחרת: עוברת כל היתרה בלבד, והוותק של הכסף נשמר. + קישור "איך עוברים" | [PF-18, SW-39] |
| decision.withdraw | למשוך: משיכה אחרי תקופת ההמתנה פטורה ממס על הרווחים מהפקדה מוטבת, ורווחים מהפקדה מעל התקרה ממוסים; לפי הכלל לעובד: אחרי משיכה החשבון נסגר להפקדות נוספות (משיכת שליש ללימודים לא סוגרת, TXH-10). | [TXH-09, TXH-10, TXH-11] · changed 2026-10-24 (review fix) |
| decision.fee | דמי הניהול בקרן הזו, מול הממוצע: | then the existing benchmark lines |
| decision.exposureLink | להשוות לפי חשיפה | to /goal/compare?mode=exposure |

A row whose rule is missing or open shows "שאלה פתוחה {code}" in place of its sentence.

### 6.8 Scenario fix 2026-10-24 (sc-compare)

Strings are `scnCompare.*` and `ownTermsCopy.*` in copy.ts, each marked `// scenario fix 2026-10-24`.

| Key | Hebrew | Note |
|---|---|---|
| `scnCompare.limitation.text` | האתר עוד לא יכול להמליץ ל־{שנים} שנים: דורגו רק האפשרויות הנזילות, כי לא הזנתם תשואה. | First line when years are at or above P-04's equity minimum and no return is entered; links: הזינו תשואה, או שנו את מספר השנים |
| `scnCompare.cashVerdict` | בין האפשרויות הנזילות, {שם} משאירה הכי הרבה כסף במועד המטרה. | Second line in that case |
| `scnCompare.parameterRate` | לפי ריבית של {ריבית} שהאתר קבע ל{אפשרות}; הזינו ריבית אחרת | Leader runs on P-05 cash_rate while a rival's rate is published or entered; opens an own-rate field |
| `scnCompare.enteredReturn` | לפי תשואה של {תשואה} שהזנתם; האתר לא יודע אם היא סבירה. [המדד נקוב בדולרים: החישוב משתמש בתשואה שהזנתם כמות שהיא, ולא מוסיף שינוי בשער הדולר מול השקל.] [מסנן הירידה לא הופעל.] | Entered return leads; the bracketed sentences when the exposure is foreign / the fall filter is unset |
| `scnCompare.enteredReturn.sameReturn` | כל המדדים רצים על אותה תשואה שהזנתם; ההבדל ביניהם כאן הוא עמלות ומטבע. | Exposure mode, every equity exposure on the copied return |
| `scnCompare.fitDrop` | לא מתאים לפי טבלת ההתאמה של האתר: מסלול מנייתי נחשב מתאים למי שמסכים לירידה של {ירידה} (פרמטר) | Reason of an equity option listed, not ranked, when the accepted drop is below P-04's |
| `scnCompare.notRanked` | לא מדורג | Tag on a listed row, which shows no headline figure |
| `scnCompare.targetCost` | לפי האפשרות המובילה, בכסף של היום: {סכום} מול {מחיר}; מספיק. / ...; חסר {פער}. | Known-date goal with a purchase cost; hidden in nominal mode · changed 2026-10-24 (review fix) |
| `scnCompare.nextStep` | בינתיים: הכסף לא צריך לשבת בעו״ש; לפי המספרים כאן זה עולה עד {סכום} בחודש. [את ההחלטה על מניות אפשר לקבל בנפרד.] לבדיקה בעמוד המזומן הנזיל | Lump sum; F-60 over the leading cash option; the bracket when the leader is not liquid |
| `scnCompare.realTerms` | בכסף של היום, אחרי אינפלציה של {אחוז}: {סכום} שלא גדל שווה {סכום} בעוד {n} שנים. | Real-terms line, shown in the today's-money mode |
| `scnCompare.horizonFigures` | לשנה: {סכום}; ל־{n} שנים: {סכום}. | Appended to the "לא ידעתם כמה שנים" note |
| `scnCompare.pick` | בחרו שתי אפשרויות להשוואה / האפשרות הראשונה / האפשרות השנייה | Picker in the why sheet |
| `scnCompare.blockedFor` | חסום ל: {אפשרויות} ({קוד}) | Under a covered checklist row |
| `scnCompare.headlineSome` | (לחלק מהן) | After the fields of the K-not-checked line when the fields unlock only some |
| `scnCompare.flipAlongside` | שקולה לראשונה. | Flip that makes a sole leader share first place |
| `scnCompare.pastRecord` | ברשומה שפורסמה (J.P. Morgan Asset Management, 1950–2025, בדולרים, לפני אינפלציה; חלונות של שנים קלנדריות, לפני עמלות ומס): התשואה השנתית של מדד S&P 500 לפי השקף נעה, בחלונות של 5 שנים, בין … (changed 2026-10-24, review fix: the slide does not say "annualised"; figure names in `mkt-01.json` now read "תשואה שנתית (לפי השקף), החלון הגרוע/הטוב ביותר של N שנים") … עבר, לא תחזית; המספרים האלה לא נכנסים לדירוג. למקור | MKT-01 figures as sourced numbers; (2026-10-24, polish) the source run "J.P. Morgan Asset Management, 1950–2025" is a `{src}` slot rendered in an LTR isolate, and the six figures carry one "מקור משני" tag after the sentence instead of one caution icon each |
| `ownTermsCopy.provider.*` | בחרתם · ספק שהתעריפון שלו ישמש בחישוב · הספקים שנאספו בעמוד הספקים, לפי מה שהאפשרות הזו משאירה בסוף. התעריפון הוא של הספק; הבחירה שלכם. · לבחור · ערוץ ישיר / סניף · לחזור לספק שהאתר בחר · בחירת האתר | Picker beside the brokerage card's fee field (sc-broker) |
| `r4workbench.providers.useInCompare.*` | לחשב את ההשוואה לפי הספק הזה · ההשוואה שלכם רצה על הספק הזה · לחזור לספק שהאתר בחר · לתוצאות ההשוואה · אין מטרה שמורה, ולכן אין השוואה שאפשר להריץ על הספק הזה. · להגדיר מטרה | Provider row on the providers page (brokerage) |
| `ownTermsCopy.*` | feeAbout, feeChip, fundCostLabel, feeLabel, flipBelow (מתהפך אם דמי הניהול בקרן יורדים מתחת ל־{x}), flipAbove, openMinimum (סכום המינימום: שאלה פתוחה), line.* (לפי {שם} בדמי ניהול {עלות} ותעריפון {ספק} · להחליף · לבחירת מוצר אחר · דמי ניהול שנתיים בקרן, באחוזים · לחזור לדמי הניהול של הרשומה · הנמוכים ביותר שנאספו באותה חשיפה: {עלות} · ריבית שנתית שהבנק הציע לכם · לחזור לריבית שפורסמה) | Folded in from lib/own-terms-copy.ts (sc-represent), marked scenario fix 2026-10-24 |

## Added 2026-10-24 (knowledge layer)

Strings in the blocks `sourceBlock`, `updateRules`, `ruleCardMore`, `rulesFront`, `documents`, `guideWorth`, `searchMore` and `knowledgeEntry` at the end of `site/app/copy.ts`, plus the P-09 name in `parametersPage.names` (lead's first write, Hebrew editor's review the same night; synthesis in `research/knowledge/2026-10-24-synthesis.md`). Rows marked "changed" are the editor's; the rest kept the lead's text. The two hand tables `data/sources/publishers.json` (99 hosts) and `data/sources/documents.json` (135 documents) carry the Hebrew names of publishers and documents; the twelve `question_he` of P-09 are at the end.

### sourceBlock

| Key | Text | Note |
|---|---|---|
| `sourceBlock.mirrorKind` | נוסח החוק (עותק) | the document kind on a mirror link; "עותק" is the strength word already in use |
| `sourceBlock.hosts.wikisource` / `.nevo` | ויקיטקסט · אתר נבו | |
| `sourceBlock.readable` | לקריאה נוחה: הנוסח המשולב (עותק) | changed (was "המאוחד"): the legal term for a text with its amendments folded in is נוסח משולב, as in "חוק הביטוח הלאומי [נוסח משולב]" |
| `sourceBlock.checked` | נבדק | followed by the date, no colon: a sentence fragment |
| `sourceBlock.mayHaveChanged` | מאז ייתכן שהנוסח השתנה. | |
| `sourceBlock.pdfTag` | PDF | Latin as the source writes it |
| `sourceBlock.more` | עוד מקור אחד · עוד שני מקורות · עוד `{n}` מקורות | dual form for 2 |
| `sourceBlock.weak` | עותק · לפי החברה · מקור משני | the strength word after "נבדק {date} ·", only when weaker than the law |
| `sourceBlock.citation.checked` / `.copied` | נבדק · ההפניה הועתקה. | toast after the copy button |
| `sourceBlock.officialMissing` | הפרסום הרשמי ברשומות עוד לא צורף; הנוסח נקרא מתוך עותק. | changed (was "נקרא בעותק"); rules page only, under a mirror rule |
| `sourceBlock.legendLine` | כל כלל נכתב מנוסח החוק או ממסמך של הרשות כשאפשר; כשהוא נלקח ממסמך של חברה, זה מסומן לידו. התאריך הוא היום שבו האתר קרא את המקור. | changed ("כלל נכתב" → "כל כלל נכתב", "כתוב לידו" → "מסומן לידו": the mark is a tag, not a sentence) |

### updateRules

| Key | Text | Note |
|---|---|---|
| `updateRules["fixed in law"]` | קבוע בחוק | |
| `updateRules["cpi-linked 1 jan"]` | מתעדכן ב־1 בינואר לפי המדד | maqaf before the number |
| `updateRules["average-wage-linked"]` | מתעדכן לפי השכר הממוצע | |
| `updateRules["provider-set"]` | החברה קובעת | changed (was "נקבע על ידי החברה"): active, and not confusable with the strength tag "לפי החברה" |
| `updateRules.market` | לפי השוק | |
| `updateRules.founder` | פרמטר של האתר | changed (was "ערך של האתר"): the canonical term of the terminology table |
| `updateRules.frozen` | מוקפא בשנים `{years}` | "בשנים" takes the range without a maqaf |

### ruleCardMore

| Key | Text | Note |
|---|---|---|
| `ruleCardMore.forTaxYear` | לשנת המס | the year follows |
| `ruleCardMore.derivedFrom` | נגזר מ־ | rule codes follow (Latin), hence the maqaf |
| `ruleCardMore.derivedLine` | זו מסקנה משילוב של כמה כללים, לא משפט אחד שנמצא במקור. | |
| `ruleCardMore.stable` | לא משתנה מעצמו | |
| `ruleCardMore.usesLead` | משפיע על | |
| `ruleCardMore.usesEngine` | החישובים באתר | changed (was "מנוע החישוב"): a document word; the reader knows "חישובים" |
| `ruleCardMore.usesNone` | כלל רקע: לא נכנס לחישוב ולא מוצג בעמוד אחר. | |
| `ruleCardMore.copyCitation` | העתקת ההפניה | noun form, one-action button |
| `ruleCardMore.experienceTag` | ניסיון של אדם אחד | the four forum entries |

### rulesFront

| Key | Text | Note |
|---|---|---|
| `rulesFront.title` / `.lede` | כללים · כל כלל שהאתר נשען עליו, עם המקור שלו. מתחילים מהשאלות שכולם שואלים, וממשיכים לפי מה שמעניין אתכם. | |
| `rulesFront.pinned.title` | השאלות שכולם שואלים | |
| ~~`rulesFront.pinned.tag`~~ | ~~בחירה של האתר~~ | removed 2026-10-24 (founder: "remove it"); the heading stands alone |
| ~~`rulesFront.pinned.provisional`~~ | ~~רשימה זמנית, עד שבעל האתר יאשר אותה~~ | removed 2026-10-24: the founder kept the list as drafted |
| `rulesFront.shelvesTitle` / `.teaser` | לפי השאלה שלכם · בין השאר: | |
| `rulesFront.ruleCount` | כלל אחד · `{n}` כללים | |
| `rulesFront.changing.*` | מה עומד להשתנות · כללים שיש להם תאריך בדיקה חוזרת, לפי חודש. · ב`{month}` | month is a Hebrew word: no maqaf |
| `rulesFront.byNumber.*` | לפי מספר · הקידומות של מספרי הכללים, למי שהגיע מכרטיס עם מספר. | |
| `rulesFront.filter` / `.filterNone` / `.filterMatching` | חיפוש כלל לפי מספר, כותרת או מילה · אין כלל שמתאים לחיפוש. · תואמים | |
| `rulesFront.toShelf` | לכל הכללים בנושא הזה | changed (was "במדף"): "מדף" is the synthesis's word, not the reader's |
| `rulesFront.back` | לכל הכללים | |
| `rulesFront.shelves.state` | מה המדינה לוקחת · מס בהפקדה, בדרך ובמשיכה; פטורים; מה חייב בדיווח | |
| `rulesFront.shelves.costs` | מה הבנק או בית ההשקעות לוקחים · דמי ניהול ותקרות, עמלות, הנחות שנגמרות, מינימום | |
| `rulesFront.shelves.access` | מה אפשר לעשות עם הכסף · מתי אפשר למשוך, איך עוברים, מי רשאי להצטרף, תקרות הפקדה | |
| `rulesFront.shelves.protection` | מי מפקח ומה מוגן · מי מפקח, מה קורה אם החברה קורסת, מה מבוטח | changed (was "מי הרגולטור, מה קורה אם גוף קורס, ביטוח"): "גוף" and "רגולטור" are regulator words; a list of three parallel questions |
| `rulesFront.shelves.structure` | איך המוצר בנוי · מטבע, חלוקה, מדדים, מה כתוב בדוח ואיך קוראים לדברים | |
| `rulesFront.subgroups.*` | מניות, קרנות ואג״ח בבורסה בישראל · קרנות וניירות ערך מחו״ל · ריבית: פיקדונות, מק״מ ואג״ח ממשלתיות · קרן השתלמות · פנסיה וקופת גמל לקצבה · קופת גמל להשקעה, ניהול אישי וחיסכון לכל ילד · מדרגות המס, מס יסף וביטוח לאומי · פוליסות חיסכון ותיקון 190 (עוד לא באתר) · מט״ח, אג״ח קונצרניות, ריט, זהב ותיקים מנוהלים (עוד לא באתר) | the reader's names of the rule-base files, no "מס:" prefix |
| `rulesFront.products.*` | כל המוצרים · משותף לכל הקופות · עוד לא באתר | |
| `rulesFront.experience.title` / `.line` | ניסיון של אחרים · עדויות של אנשים מהפורום, לא כללים; מסומנות כך גם בעמוד ״איך עוברים״. | changed (was "סיפורים … בעמוד המעבר"): "עדויות" is the honest word for forum reports; the page is named by its title |

### documents

| Key | Text | Note |
|---|---|---|
| `documents.title` / `.lede` | מסמכים · המסמכים שהכללים באתר נקראו מהם: חוקים, תקנות, חוזרים ומדריכים של הרשויות, ומסמכים של בנקים וחברות. לכל מסמך, הכללים שנשענים עליו. | |
| `documents.sections.*` | חוקים ותקנות · רשויות ומפקחים · הבורסה · מסמכים של בנקים וחברות · כתבות ומקורות משניים | |
| `documents.kinds.*` | חוק · תקנות · חוזר · עמוד באתר הרשות · מסמך רשמי · הנחיות הבורסה · מסמך של החברה · כתבה · מאגר נתונים · טופס · מסמך | `regulator_page` changed (was "עמוד של הרשות") |
| `documents.rulesLead` / `.rulesMore` | כללים שנשענים על המסמך: · עוד `{n}` | |
| `documents.checked` / `.open` | נבדק לאחרונה · למסמך | |
| `documents.data.title` / `.lede` | נתונים שהאתר קרא · תעריפונים, תנאי פיקדונות, דוחות של קרנות וסדרות נתונים, כל אחד עם התאריך שבו נקרא ועם העמוד באתר שמשתמש בו. | |
| `documents.data.tariffs` / `.tariffLine` / `.noPrintedDate` / `.missing` | תעריפונים · תעריפון `{provider}` · ללא תאריך מודפס · לא נמצא תעריפון שפורסם | |
| `documents.data.funds` / `.fundsLine` | קרנות שהאתר קרא · קרנות שהאתר קרא אחת־אחת מהדוח של מנהל הקרן; לא רשימה של כל הקרנות בבורסה. | the TASE terms (data-inventory) |
| `documents.data.deposits` / `.series` / `.latest` | תנאי פיקדונות · סדרות נתונים · הערך האחרון | |
| `documents.data.datasets` / `.datasetsLine` | נתוני הרשות · המסלולים והקופות שהרשות מפרסמת, בעמוד ״חברות ומסלולים״. | changed (was "בעמוד החברות"): the page is quoted by its title |
| `documents.data.toPage` | לעמוד שמשתמש בזה | |

### guideWorth, searchMore, knowledgeEntry, P-09

| Key | Text | Note |
|---|---|---|
| `guideWorth.title` / `.line` | שווה לדעת · עובדות על המוצר הזה שרוב האנשים לא יודעים, כל אחת עם הכלל והמקור שלה. | changed (was "שתיים או שלוש עובדות שרוב האנשים לא יודעים על המוצר הזה"): the count is not promised, and the object follows the verb |
| `searchMore.groups.*` | כללים · פרמטרים · מסמכים | |
| `searchMore.ruleWord` / `.parameterLine` / `.documentLine` | כלל · פרמטר של האתר · מסמך | |
| `searchMore.figureLine` | מספר מתוך כלל | changed (was "מספר בכלל", which reads as "a number at all") |
| `searchMore.maybe` | אולי התכוונתם: | |
| `searchMore.empty.questionTitle` / `.questionBody` | אין כלל שעונה על זה בניסוח הזה · האתר מחפש בכותרות ובטקסט של הכללים. נסו מילה או שתיים מהשאלה, או עברו על הכללים לפי נושא. | |
| `searchMore.empty.questionLink` / `.questionCopy` / `.questionUnder` | לכל הכללים · העתקת השאלה · אפשר לשלוח אותה למי ששלח לכם את האתר. | |
| `searchMore.empty.numberTitle` | אין מספר כזה בכללים, במסלולים ובקרנות | changed (was "בכללים ובקטלוג"): "קטלוג" is a document word; the three things a number can be |
| `searchMore.empty.numberNear` / `.mainWords` | קרוב לזה: · לחפש רק את המילים העיקריות | |
| `knowledgeEntry.homeLine` / `.homeLink` / `.menuDocuments` | כל מספר באתר נפתח למקור שלו. · על מה האתר נשען: הכללים והמסמכים · מסמכים | |
| `parametersPage.names["P-09"]` | הכללים שבראש עמוד הכללים: השאלות שכולם שואלים, ומה שווה לדעת בכל מדריך | changed (was "הכללים המוצמדים: …"): "מוצמדים" (pinned) is the developer's word |

### P-09 questions (`data/parameters/pinned-rules.json`, `question_he`)

Spoken questions, no number inside them, no "ידעתם?". Rows 1, 2, 4 and 10 kept the lead's text.

| Rules | Question |
|---|---|
| TXS-01, TXS-02 | כמה מס משלמים על רווח בבורסה? |
| TXI-03, TXI-02 | כמה מס משלמים על ריבית מפיקדון? |
| TXH-17, TXK-04, PF-23 | עוברים מסלול בתוך הקופה: משלמים מס או עמלה? · changed (was "מעבר מסלול בתוך הקופה: יש מס? יש עמלה?") |
| KGL-02, KGL-03 | כמה אפשר להפקיד בקופת גמל להשקעה בשנה? |
| TXH-09, KH-15 | מתי אפשר למשוך קרן השתלמות בלי מס? · changed (was "מתי קרן השתלמות נזילה בלי מס?"): TXH-09's own title |
| BANK-23, REG-04, REG-06 | הכסף בפיקדון בבנק מבוטח? · changed: says which deposit |
| PF-06, PF-02 | כמה דמי ניהול מותר לחברה לגבות? · changed: names who charges |
| PF-19, SW-06 | מעבירים את הכסף לקופה אחרת: כמה זמן זה לוקח ומה זה עולה? · changed (was "העברה בין קופות: …") |
| PF-13, PF-14, SW-15 | קיבלתם הנחה בדמי ניהול: לכמה זמן היא מובטחת? · changed: the question-link form of 10.5 |
| TXS-24, MF-37 | כל הקרנות הכספיות אותו דבר? |
| BANK-20 | כסף שיושב בעו״ש: הבנק חייב להודיע על זה? · changed (was "להגיד משהו"): BANK-20 is a duty to notify |
| REG-18, REG-19 | מה קורה לפנסיה אם החברה שמנהלת אותה קורסת? · changed (was "החברה המנהלת"): spoken form |

### Hand tables (`data/sources/`)

- `publishers.json`: 99 hosts (the lead's count of 78 was the markdown alone; the rule records' figure sources add 21). Regulators and ministries by their official names (רשות המסים, רשות שוק ההון, ביטוח וחיסכון, רשות ניירות ערך, בנק ישראל, המוסד לביטוח לאומי, הכנסת, הלשכה המרכזית לסטטיסטיקה, הבורסה לניירות ערך בתל אביב, מאיה (מערכת ההודעות של הבורסה)); `gov.il` is "אתר הממשלה (gov.il)" because its sub-paths cannot be told apart by host, and `documents.json` names the issuing authority; `hly.gov.il` is the official "חיסכון לכל ילד" site; mirrors are ויקיטקסט and נבו; banks and managers by their Hebrew trading names as the site writes them (בנק לאומי, מיטב, אלטשולר שחם, מור בית השקעות, הראל, הפניקס, יחד רופאים); copies of official documents on private hosts carry "(עותק)" (פאנדר, עדיף); Latin brand names stay Latin (S&P Dow Jones Indices, iShares, J.P. Morgan Asset Management, SIPC, LBMA). One host, `behar-law.co.il` (a law firm mirroring regulations once), keeps its host as its name: the firm's Hebrew name is not certain.
- `documents.json`: 135 recurring documents. Laws by their official short names with the Hebrew year where it is certain (פקודת מס הכנסה; חוק הפיקוח על שירותים פיננסיים (קופות גמל), התשס״ה-2005; חוק השקעות משותפות בנאמנות, התשנ״ד-1994; חוק הביטוח הלאומי [נוסח משולב], התשנ״ה-1995; חוק מילווה קצר מועד, התשמ״ד-1984 …); regulations in full with the Reshumot year (תקנות הפיקוח על שירותים פיננסיים (קופות גמל) (העברת כספים בין קופות גמל), התשס״ח-2008; … (דמי ניהול), התשע״ב-2012; כללי הבנקאות (שירות ללקוח) (עמלות), התשס״ח-2008). Two regulations are named without a year because the year was not certain: the IRA regulations (קופת גמל בניהול אישי) and the child-savings regulations (חיסכון ארוך טווח לילד). The deductions booklet is "לוח עזר לחישוב מס הכנסה ממשכורת ושכר עבודה (חוברת הניכויים) 2026"; the Tax Authority guide "דע זכויותיך וחובותיך 2025"; CMA circulars as "חוזר גופים מוסדיים {code}: {name}"; Bank of Israel directives as "הוראת ניהול בנקאי תקין {n}: {name}" (425 has no name: the title was not in the sources); Sefer HaChukim issues as "ספר החוקים {n} ({date}): {the amending law}".
