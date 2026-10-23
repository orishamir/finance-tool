# Hebrew copy, release 1

> Release 2 section added 2026-10-23: section 6, the strings of the release 2 screens.
> Folded 2026-10-23 (evening): every string the day's build added to `site/app/copy.ts` is now here, in an "Added 2026-10-23, for the founder's review" table at the end of its section (3.5a and the release 2 tables are the largest), keyed by its `copy.ts` path so the two files can be diffed. Where the build's wording was changed, the note says what it was. Section 6.6 lists the word choices.

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
| `guideBlocks.fees.creation_redemption` | עמלת יצירה ופדיון · כשההזמנה עוברת ליצרן הקרן ולא לבורסה | ETF-05 |
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
| `guideBlocks.taxSteps.F-44` | עד `{שיעור}` מהרווח הריאלי — כלומר מהרווח שמעבר לעליית המחירים. · בסיס המס: מקור מוסדי · האתר מציג גם חלופה: `{שיעור}` מהרווח הנומינלי. | the rate is a number component; the tag and the alternative line follow |
| `guideBlocks.taxSteps.F-21` | מס על הריבית בסוף כל פיקדון — הבנק מנכה את המס מהריבית בסוף התקופה, והסכום נטו נפתח מחדש כפיקדון. |  |
| `guideBlocks.taxSteps.F-22` | מס על הריבית בסוף כל תקופה — אין כלל מס שמבדיל תוכנית חיסכון מפיקדון: הריבית ממוסה בסוף כל תקופה. |  |
| `guideBlocks.taxSteps.F-23` | בקרן כספית פטורה אין מס בזמן ההחזקה — חלוקות, אם יש, ממוסות כשהן משולמות. בקרן שהיא עצמה חייבת במס, הקרן משלמת את המס ולא אתם. |  |
| `guideBlocks.taxSteps.F-24` | ההפרש בין מחיר הקנייה לפדיון נחשב ריבית — המס על ההפרש מנוכה בפדיון, וסדרה חדשה נקנית מהסכום נטו. | Was "ההפרש בין המחיר לפדיון הוא ריבית" |
| `guideBlocks.taxSteps.F-25` | מס על כל תשלום ריבית — המס מנוכה בכל תשלום, והקופון נטו נקנה מחדש. |  |
| `guideBlocks.taxSteps.F-26` | מס על הריבית כשהיא נזקפת — הבנק מנכה את המס מהריבית בכל חודש שבו היא נכנסת לחשבון. |  |
| `guideBlocks.taxSteps.F-30` | הפקדה שעלותה נטו שווה לסכום שבחרתם | headline only |
| `guideBlocks.taxSteps.F-31` | זיכוי במס על ההפקדה לפנסיה, לשכירים | Was "זיכוי במס על הפקדה לפנסיה (לשכירים)": no brackets at the end of a line |
| `guideBlocks.taxSteps.F-32` | זיכוי או ניכוי במס על ההפקדה: לעצמאים ולמי שנחשבים עמית מוטב | Was "…(לעצמאים ולמי שהפקדותיו מגיעות לסף שבחוק)": uses the law's term "עמית מוטב" (TXP-03; glossary row), gender-neutral, and the term opens its one-line explanation |
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
| `guideBlocks.terms.labels.regBalance` | ממוצע דמי הניהול מחיסכון שנגבו בפועל בשנת `{שנה}` (ממוצע שנגבה, לא מחירון) | the regulator's average, as on the track page; "מחיסכון" is the glossary's term (was "מהנכסים") |
| `guideBlocks.terms.labels.regDeposit` | ממוצע דמי הניהול מהפקדה שנגבו בפועל בשנת `{שנה}` (ממוצע שנגבה, לא מחירון) | was "מההפקדות" |
| `guideBlocks.terms.labels.ninetyPercentTest` | מבחן 90% בקרן זרה | the name of the TXF test; the figure is part of the name |
| `guideBlocks.terms.linkage.unlinked · cpi · prime` | לא צמוד · צמוד למדד · צמוד לפריים |  |

Why "בשקלים של העתיד" rather than "נומינלי": the reader sees the difference in the label itself. The glossary still explains ריאלי and נומינלי where they appear in tax text.

### 3.6 Exposure guide page

| Element | Hebrew |
|---|---|
| Section headings | מה זה · איך מחזיקים את זה · סיכונים · מה לבדוק · מונחים |
| "How to hold it", line | המוצרים שבהם אפשר להחזיק את זה. השוואה ביניהם למטרה שלכם תתווסף בהמשך. |
| A product whose tax treatment is open | לא ברור עדיין איך זה ממוסה כאן: שאלה פתוחה `{קוד}` |


**Added 2026-10-23, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `exposurePage.sections` | מה זה · איך מחזיקים את זה · סיכונים · מה לבדוק · מונחים | as the heading row above |
| `exposurePage.kinds.*` | מדד מניות · מדד אג״ח · מזומן ודומיו · תמהיל של כמה סוגי נכסים · סחורות · אחר | equity_index · bond_index · cash_like · mixed · commodity · other |
| `exposurePage.kindLabel · currencyLabel` | סוג · מטבע | record labels |
| `exposurePage.holdLine` | המוצרים שבהם אפשר להחזיק את זה. השוואה ביניהם למטרה שלכם תתווסף בהמשך. | the approved line above; the build had "אלה המוצרים שיכולים להחזיק את זה. דירוג לפי המטרה שלכם עוד לא באתר." |
| `exposurePage.holdNone` | עוד לא נאספו המוצרים שמחזיקים את זה. |  |
| `exposurePage.openTax` | לא ברור עדיין איך זה ממוסה כאן: שאלה פתוחה | a blocked tag; the question codes follow as chips. The build had "המס על זה במוצר הזה הוא שאלה פתוחה" |
| `exposurePage.toGuide` | לעמוד המדריך |  |
| `exposurePage.noProse` | הטקסט של העמוד הזה עוד לא נכתב. | no prose file yet |
| `exposurePage.guideGroup` | עמודי מדריך על מה שהכסף מושקע בו | search-group and index heading |

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
| Row labels, from a source | מקור · פורסם על ידי · נבדק ב־ · בתוקף מ־ · בתוקף עד · כלל |
| Row labels, calculated | נוסחה · ערכים שנכנסו לחישוב · כללים שנכנסו לחישוב |
| Entered, first line | הזנתם את הערך הזה. |
| Entered, the value it replaced | במקום: |
| Site parameter | למה הערך הזה · אושר ב־ |
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
| Source and dates | מקור · נבדק ב־`{תאריך}` · ייבדק שוב ב־`{תאריך}` |
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
| No match | לא מצאנו חברה בשם הזה. |
| Its link | לחיפוש בכל האתר |

### 3.11 Company page

| Element | Hebrew |
|---|---|
| Line under the title | כל מה שהחברה מציעה, עם הסבר לכל מסלול. המסלולים לפי נתוני רשות שוק ההון, ביטוח וחיסכון, נכון ל`{חודש}`. |
| Fees line (`company.feesLine`; replaced "Fees pending" on 2026-10-23, for the founder's review) | דמי הניהול שמופיעים ליד כל מסלול הם ממוצע של כל העמיתים במסלול, אחרי הנחות, לפי דיווח המסלול לרשות שוק ההון. לא בהכרח מה שתשלמו אתם. |
| List heading | כל המסלולים של `{חברה}` |
| Group count | `{מספר}` מסלולים |
| Track line | קופה `{מספר}` · סיווג: `{סיווג}` |
| Same-name banners | שני מסלולים באותו שם: שתי קופות נפרדות · אותו מסלול מופיע פעמיים · לא הוכרע: הנתונים לא מראים אם זו אותה קופה |
| Old data | נתוני הרשות לא עודכנו מאז `{חודש}`. |
| Paste card | לא מצאתם שם? · הדביקו את השם כמו שהוא מופיע באפליקציה, בפרסומת או בדוח. · למשל: גמל להשקעה כללי |


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
| `catalogue.unassigned.line` | שמות שהחברה משתמשת בהם ועוד לא הצלחנו לשייך למסלול בנתוני הרשות. | Was "למסלול ברשות" |
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
| Lede | מוצרים שאנחנו מכירים אבל עוד לא יכולים להסביר עד הסוף, ולמה. |
| Card rows | מה ידוע · מה עוד פתוח · למה זה חשוב |
| Each product's line | its one-line explanation from `docs/glossary.md` |
| Empty list | כרגע האתר מכסה את כל המוצרים שהוא מכיר. |


**Added 2026-10-23, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
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
| `rulesPage.groups[managed-and-robo-portfolios.md]` | תיקים מנוהלים ויועץ אוטומטי |  |
| `rulesPage.groups[reits-and-gold-funds.md]` | קרנות ריט וקרנות זהב |  |
| `rulesPage.groups[savings-policies-and-executive-insurance.md]` | פוליסות חיסכון וביטוח מנהלים |  |
| `rulesPage.groups[tax-insurance-and-amendment-190.md]` | מס: ביטוח ותיקון 190 |  |
| `rulesPage.groups[tax-tier2-other.md]` | מס: מט״ח, אג״ח קונצרניות, ריט וזהב ותיקים מנוהלים |  |
| `rulesPage.topicOther` | נושא נוסף במאגר הכללים | a file with no name in the map: never a file name on the page |

### 3.15 Parameters page

| Element | Hebrew |
|---|---|
| Title | פרמטרים של האתר |
| Lede | החלטות שהאתר מקבל בעצמו, כמו מתי שתי אפשרויות נחשבות שקולות. הן לא כללים מהחוק, ואי אפשר לשנות אותן מהעמוד. |
| Card rows | למה · אושר ב־ · משמש ב: |
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
| `parametersPage.fields[P-03.negotiate_nis]` | עלות לאורך האופק שמעליה שווה לנהל משא ומתן |  |
| `parametersPage.fields[P-03.avoid_nis]` | עלות לאורך האופק שמעליה שווה להימנע |  |
| `parametersPage.fields[P-03.negotiate_share]` | חלק מכלל העלות (סף משא ומתן) |  |
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
| Could not save | לא הצלחנו לשמור במכשיר הזה. ההשוואה תעבוד, אבל המטרה לא תישמר. |


**Note 2026-10-23.** The menu row, footer link and third door above are now in `copy.ts` (`site.menuItems`, `site.footer`, `home.door3`); the third door was added after the founder approved the first page with two doors, so it is for review as a door, not only as words.

### 6.1 Goal form

| Element | Hebrew |
|---|---|
| Title | מה המטרה שלכם? |
| Lede | בחרו נקודת התחלה או מלאו בעצמכם. כל ערך אפשר לשנות, והכול נשמר במכשיר הזה. |
| Preset row label (screen reader) | נקודת התחלה |
| After a preset is chosen | מילאנו `{רשימת שדות}` כנקודת התחלה. שנו מה שמתאים. |
| Preset chosen, fields already entered kept | שמרנו על מה שהזנתם. |
| Card 1 title | המטרה |
| Fields, card 1 | שם המטרה (לא חובה) · כמה שנים עד המטרה · סכום היום · הפקדה חודשית · כמה צריך להישאר זמין מיד · מאיזה תאריך |
| Hint, must stay available | החלק הזה נשאר בעו״ש או בקרן כספית יומית, ולא נכנס להשוואה. |
| Constraints heading | אילוצים |
| Constraint switch | חייב להיות ניתן למשיכה בכל רגע |
| Constraint, blocked row | בלי צורך בדוח שנתי למס: עדיין לא ניתן לבדוק. שאלה פתוחה TXG OQ4 |
| Loss filter, later | כמה ירידה תסכימו לספוג: יתווסף בהמשך. |
| Card 2 title | קצת עליכם |
| Card 2, why | למה שואלים: תקרות ההפקדה והטבות המס תלויות בשכר ובהפרשות. |
| Fields, card 2 | גיל · סוג העסקה · שכר חודשי ברוטו · הפרשות לפנסיה · הפרשות לקרן השתלמות · יש לכם פנסיה דרך העבודה? · יש לכם קרן השתלמות דרך העבודה? |
| Percent pair sub-labels | מעסיק · עובד |
| Self-employed hishtalmut field | הפקדה שנתית לקרן השתלמות |
| Yes / no | כן · לא |
| Payslip disclosure | איפה זה בתלוש |
| Payslip disclosure, body | the text of rule PEN-36 from the rule base, then its chip, then: |
| Payslip disclosure, last line | השמות המדויקים בתלוש משתנים בין מעסיקים. עוד לא מצאנו להם מקור רשמי. |
| Card 3 title | ההנחות |
| Fields, card 3 | תשואה שנתית על החלק המושקע · אינפלציה בשנה |
| Return, empty | לא הוזן: האתר לא מנחש תשואה. |
| Return, hint | הזינו את התשואה שאתם מניחים. היא תסומן בכחול בכל מקום שבו היא משפיעה. |
| Return, filled | תשואה שהזנתם תסומן בגרף בקו מקווקו, כי היא שלכם ולא של האתר. |
| Inflation, start | ערך התחלתי, פרמטר של האתר |
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
| Available above the amount now | גדול מהסכום היום. |
| Percent above 100 | הזינו אחוז עד `{מקסימום}`. |
| Salary negative | השכר לא יכול להיות שלילי. |


**Added 2026-10-23, for the founder's review.** Key paths are the ones in `site/app/copy.ts`, so the two files can be diffed.

| Key in `copy.ts` | Hebrew | Note |
|---|---|---|
| `r2.form.filledNames.*` | שנים · הפקדה חודשית · החלק שנשאר זמין · אילוץ המשיכה | the field names in "מילאנו `{רשימת שדות}` כנקודת התחלה" |
| `r2.form.payslipNoRule` | הטקסט של הכלל הזה עוד לא נמצא במאגר הכללים של האתר. | when PEN-36 is not in the rule base |
| `r2.form.insurance` | דמי הביטוח בקרן הפנסיה, כאחוז מההפקדות | field label (A-17, entered by the person, G-12). Was "עלות ביטוח בקרן הפנסיה (% מההפקדות)": "דמי ביטוח" is the glossary's term (PEN-15), and no brackets |
| `r2.form.insuranceHint` | כיסוי למקרה מוות ונכות שיורד מהחיסכון כל חודש. בלי המספר הזה האתר לא משווה קרן פנסיה, כי הוא לא מנחש אותו. בקופת גמל לקצבה אין ביטוח כזה, ולכן היא לא צריכה אותו. | Was "בלי המספר הזה אי אפשר להשוות קרן פנסיה, והאתר לא מנחש אותו. קופת גמל לקצבה בלי ביטוח, ולכן לא צריכה אותו.": says what the number is first (PEN-15), and the last sentence had no verb. The provident fund for annuity has no pooled insurance (PEN-35) |
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
| Deciding line | מכריע לעומת הקודמת: `{נוסחה}`, `{סכום}` לעומת `{סכום}` |
| Row's assumptions (screen-reader name) | ההנחות של השורה |
| Row detail (screen-reader name) | פירוט |
| Secondary-source tag on a row | המס ביציאה לפי מקור משני |
| Available card | `{סכום}` נשארים זמינים בעו״ש ושווים `{סכום}` במועד המטרה, בכסף של היום. |
| Listed heading | מוצגות בלי דירוג |
| Listed reasons | שכירים: מופקדת רק דרך המעסיק · נעולה עד `{תאריך}`: הערך במועד השחרור · התקרה השנתית לוקחת רק חלק מהכסף: `{סכום}` עוברים למטרה הבאה · המס ביציאה חסום: שאלה פתוחה `{קוד}` · מוחזקת בתוך `{מוצר}`, ונבדקת כמוהו |
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
| Coverage reasons, not evaluated | אין עדיין תנאים של תוכניות חיסכון · הפקדות חודשיות לקרן כספית מתחדשת עוד לא מוגדרות · לא נכלל בהשוואה המהירה · עוד לא מכוסה, שאלות פתוחות · הזינו תשואה · הזינו שכר · הנתון לא עודכן: `{כלל}` |
| Coverage reasons, not eligible | מקבל רק את הכספים מביטוח לאומי ואת הפקדת ההורה, לא את הכסף הזה · פתוח רק ל`{קבוצה}` |
| Coverage reason, excluded | נפסל לפי האילוץ: `{אילוץ}` |
| Coverage, group line | `{קבוצה}`: `{מספר}` מוחזקות אחת־אחת, השאר לא |
| Coverage, last line | המסלולים והקרנות בתוך כל מוצר מופיעים בעמודי החברות. ההשוואה ביניהם תתווסף בהמשך. |
| Sensitivity title | מה היה משנה את התשובה |
| Sensitivity, flips | מתהפך אם `{הנחה}` תעבור מ־`{ערך}` ל־`{ערך}`: אז `{אפשרות}` ראשונה. |
| Sensitivity, breaks a tie | מפריד בין השקולות אם `{הנחה}` תעבור מ־`{ערך}` ל־`{ערך}`: אז `{אפשרות}` ראשונה. |
| Sensitivity, no flip | לא מתהפך בטווח שנבדק: `{מ}` עד `{עד}`. |
| Sensitivity, blocked | לא נבדק: שאלה פתוחה `{קוד}` |
| Sensitivity, assumption names | תשואה שנתית · אינפלציה · שער החליפין · העלות בתוך הקרן · `{שם העמלה}` · שנים עד המטרה |
| Sensitivity, footer | הטווחים הם פרמטר של האתר ולא ניתנים לשינוי כאן. |
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
| `r2.result.reasons.enterInsurance · enterAge · enterEmployment` | הזינו את דמי הביטוח · הזינו גיל · הזינו סוג העסקה | more "not evaluated" reasons. Insurance: was "הזינו את עלות הביטוח" |
| `r2.result.reasons.noTerms · noRun · gap · ruleMissing · ruleOpen` | עוד אין לאתר את תנאי המוצר · עוד אין לאתר שיטת חישוב לזה · שיטת החישוב עוד לא מוגדרת · חסר כלל במאגר הכללים · שאלה פתוחה |  |
| `r2.result.sensRunning` | האתר בודק מה היה משנה את התשובה… | while the sensitivity runs. Was "בודק מה היה משנה…" (no subject) |
| `r2.result.times` | פי | a fee moved by a multiple: "פי `{מספר}`" |
| `r2.result.checklistBlocks` | מונע דירוג של: | checklist row, the options a blocked dimension keeps out of the order |
| `r2.result.needMore` | כדי להשוות, הזינו כמה שנים עד המטרה וסכום, להיום או להפקדה חודשית. | result without enough inputs |
| `r2.result.toForm` | לטופס המטרה |  |
| `r2.result.failed` | לא הצלחנו לחשב את ההשוואה. רעננו את העמוד ונסו שוב. | as 4 |
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
| Rate labels, three (`idle.labels`; changed 2026-10-23 under D20 and again for QA F11, for the founder's review) | בתוקף מ־`{תאריך}` · הוזן על ידך · פרמטר של האתר |
| Rate labels before D20 (superseded, not in `copy.ts`) | הממוצע ששולם ב`{בנק}` בחודש שעבר · הוזן על ידך · ממקור: `{שם הסדרה}` |
| Series names (superseded by D20: the Bank of Israel series are links, not numbers) | ריבית בנק ישראל · תשואת מק״מ |
| Money-market note (`idle.mmfNote`; changed 2026-10-23 under D20) | הריבית כאן משמשת כקירוב לתשואת הקרן. |
| Makam, no commission | בלי עמלת קנייה |
| Per month | בחודש |
| Baseline line | העו״ש משלם היום `{אחוז}`. |
| Baseline, no interest | לפי הנתונים שלנו העו״ש לא משלם ריבית. |
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
| `idle.errBalance · errKeep` | הזינו סכום גדול מאפס. · גדול מהיתרה בעו״ש. | field errors |
| `idle.rowsHeading` | מה זה עולה לכם | heading of the cost rows |
| `idle.rateOf` | ריבית | before a row's rate figure |
| `idle.noCost` | לפי הנתונים שלנו אף אפשרות נזילה לא משלמת יותר מהעו״ש, ולכן להשאיר אותו שם לא עולה לכם כלום. | no row costs anything. Was "…, אז להשאיר אותו שם לא עולה לכם." |
| `idle.boiBefore` | הממוצע שבנק ישראל מפרסם לכל בנק לא מופיע כאן: תנאי השימוש של בנק ישראל לא מתירים לפרסם אותו מחדש בלי הסכמה בכתב. | D20. Was "…לא מוצג כאן, כי אי אפשר לפרסם אותו מחדש בלי הסכמת הבנק." ("הבנק" read as the person's bank) |
| `idle.boiLink` | לממוצעים של בנק ישראל | link out |
| `idle.boiParam` | הריבית של הקרן הכספית והמק״מ היא פרמטר של האתר, לא נתון של בנק ישראל. |  |
| `idle.kinds.baseline · compared · not-eligible · not-evaluated` | העו״ש עצמו · הושוו אליו · לא מתאימות לכם · לא נכללו בהשוואה המהירה | coverage sentence and group headings, after a count. Were "השוואה אליו · הושוו אליו · …": "`{1}` השוואה אליו" did not read |
| `idle.kindsTag.baseline · compared · not-eligible · not-evaluated` | העו״ש · הושוותה · לא מתאימה לכם · לא נכללה בהשוואה המהירה | the tag on one row, singular. "compared" was "הושוו" |
| `idle.notQuickLine` | כדאי לבדוק בהשוואה המלאה | after "לא נכלל בהשוואה המהירה" |
| `idle.rowNotRun` | עוד לא נבדקה | a cash row the run could not do |
| `idle.failed` | לא הצלחנו לחשב. רעננו את העמוד ונסו שוב. |  |
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
