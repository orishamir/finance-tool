# Independent review of the "הידעת?" facts, the rules-page Hebrew and fresh search claims

Reviewer's date: 2026-11-01. Every record below was read on this date, from the working tree (the facts and the copy are uncommitted changes).

## What I read and what I inferred

**Read:**
- `data/parameters/pinned-rules.json`, field `facts` (41 sentences).
- For each fact, `data/rules/<id>.json`: `text_he`, `figures` with notes, `sources` with quotes.
- Rule base entries in `.claude/skills/il-finance/references/` for CS-07, TXK-09, KH-07, TXH-03, SW-26, SW-44, BRK-33, BRK-19, PF-28, IRA-02, ETF-06, MF-49.
- `docs/copy.md` section 10; the `rulesFront`, `scopeWords.rulesLine` and gallery strings in `site/app/copy.ts`.
- `SlottedText`, `formatValue`, `ruleFigure`, `pickSources`, `AskField`, `WithNumber` and the new fact check in `packages/pipeline/src/validate.ts`.
- About 90 further records for Part 3.

**Not read, as instructed:** `site/app/lib/search-claims.ts`, `site/app/lib/search-aliases.ts`. I did not run the search.

**Not done:** I did not open the primary documents (laws, circulars) behind the records. "The record says" means the record, not the law. I did not run the site, so rendering findings come from reading the code.

**Inferred, marked again where they appear:**
- CS-05: "להעביר" means assign to another person (CS-11 and SW-25 allow moving between funds).
- TXK-09: "למשל מכספי קופת גמל להשקעה" comes from sibling records TXK-27 and KGL-09, not from TXK-09.
- BRK-33: "not every member shows an average" rests on one rule-base note about one member's sheet.

## Part 1: the facts

Verdicts: **11 ok, 28 change, 2 drop.** Question 2 (general, not one company's term): all 41 pass; each record has `scope: general` and none states a company's term. Question 3 (figures in words): all match, see the note after the table.

Serious means a reader could act wrongly on the sentence as written.

| # | id | verdict | reason | corrected sentence |
|---|---|---|---|---|
| 1 | BANK-20 | change (minor) | Record says "של אדם פרטי" and "מפנה למידע על חלופות". Word order "ברציפות לפחות רבעון" is awkward. | כשיתרת הזכות בעובר ושב של אדם פרטי עולה על {BANK-20:credit_balance_threshold} לפחות רבעון ברציפות, הבנק חייב לשלוח הודעה שמפנה למידע על חלופות השקעה שעשויות להניב יותר. |
| 2 | TXF-14 | **change, serious** | Dropped: "אזרחים אמריקנים ובעלי גרין קארד ... מחוץ לכלל". For a dual citizen or a green-card holder the sentence gives the wrong answer. "ניירות" is not the full term. | תושב ישראל שאינו אזרח אמריקני או בעל גרין קארד, ושהה בארצות הברית פחות מ־{TXF-14:presence_days} בשנת המס, לא משלם שם, ככלל, מס על רווחי הון מניירות ערך אמריקניים. |
| 3 | CS-07 | ok | "שישה חודשים" and the first-child track both match. The older-sibling route is dropped, but it does not change what a first-time parent does. | |
| 4 | KH-15 | change | Exception dropped its limits: "עד שליש מהיתרה, אם לא הייתה משיכה כזו בשנה שלפני". "סכום כלשהו" (any amount) is the point and is missing. The colon reads as if new deposits follow from the exception. | משיכה של סכום כלשהו מקרן השתלמות סוגרת את החשבון להפקדות: הפקדות חדשות הולכות לחשבון אחר, ומתחילה ספירה חדשה של השנים. החריג הוא משיכה להשתלמות בארץ של עד שליש מהיתרה, אם לא הייתה משיכה כזו בשנה שלפני. |
| 5 | TXH-04 | change | True to the record, but it drops "היא נחשבת הפקדה מוטבת, ולכן הרווחים עליה פטורים". Alone it suggests the employee's share brings no benefit. The record also calls "no deduction" a reading supported by the authority's table, and "from net" comes from a non-binding paper. | הפקדת העובד לקרן השתלמות משולמת מהשכר נטו, אחרי מס, ואין עליה ניכוי ולא זיכוי. היתרון הוא ביציאה: הרווחים עליה פטורים, עד הגבול על ההפקדה המוטבת. |
| 6 | BRK-33 | change | "לכל חבר בורסה את העמלות הממוצעות" is stronger than the record, which says averages **or** tariff. Rule base note of 2026-10-31: Altshuler's sheet has "no average printed" (one member's sheet; my inference that this limits the sentence). Dropped: figures are as members reported them. | מחשבון העמלות של הבורסה מציג לא רק תעריפונים אלא גם עמלות ממוצעות שנגבו בפועל, כפי שחברי הבורסה דיווחו, לפי סוג נייר ולפי שווי התיק. |
| 7 | PEN-06 | ok | Matches. "אחרי שניתנה לו ההזדמנות" is dropped without harm. | |
| 8 | KH-03 | change | Dropped: "חובות קיימות בענפים מסוימים, למשל לעובדי הוראה, ובצווי הרחבה שלא נקראו". A teacher or a worker under an extension order would conclude they have no right. Also "לפי הסכם" where the record says "לפי דין או הסכם". Move out of the first eight. | לא נמצא חוק שמחייב כל מעסיק להפקיד לקרן השתלמות, אבל יש חובות בענפים מסוימים ובצווי הרחבה. מי שזכאי לקרן לפי דין או הסכם בוחר אותה בעצמו. |
| 9 | REG-04 | change (word) | Matches the record. "הנגיד" should be a full term. "חוק חדש" will age; the recheck date is 2027-03-31. | אף חוק בישראל לא מקים ביטוח פיקדונות. חוק חדש מחייב את שר האוצר ואת נגיד בנק ישראל לבחון אם יש בו צורך. |
| 10 | TXS-21 | **change, serious** | "קרן" in Hebrew also means קרן השתלמות and קרן פנסיה. The record says the opposite for those: "מעבר בין מסלולים או קופות אינו אירוע מס". A reader may avoid a free move for fear of tax. Also "על הרווח הריאלי" is dropped. | בחשבון ניירות ערך, החלפת קרן נאמנות או קרן סל באחרת נחשבת מכירה: המס על הרווח הריאלי מנוכה במקור גם אם הכסף לא יוצא מהחשבון. בקופת גמל, בקרן השתלמות ובפנסיה מעבר בין מסלולים או קופות אינו אירוע מס. |
| 11 | PEN-36 | ok | Matches. Weak, see below. | |
| 12 | CS-13 | change | The age is missing, and it is the whole point: the reader decides at 18. "כולל ... רק אם" reads badly. Figure `age_last_grant` exists. It renders as "21 שנים", which reads a little heavy after "בגיל". | מי שלא משך כלום מהחיסכון לכל ילד מקבל בגיל {CS-13:age_last_grant} מענק אחרון של {CS-13:grant_age_21}: גם משיכה חלקית לפני כן מבטלת אותו. |
| 13 | TXI-25 | **change, serious** | The record marks the extension as inference: "המקרה היה פיקדון בנקאי צמוד למטבע חוץ; ההחלה על פיקדון צמוד מדד ... היא היסק". "פיקדון צמוד" reads as CPI-linked. It also drops "לא הכריע בשאלת הקיזוז", though the record's title says the question stayed open. | בפיקדון צמוד למטבע חוץ החוסך הפסיד בסך הכול כשההצמדה נעשתה שלילית, והריבית עדיין מוסתה במלואה: בית המשפט העליון דחה את הערעור, ואת שאלת הקיזוז השאיר פתוחה. |
| 14 | TXK-09 | **change, serious** | "קצבה מוכרת" is a term of art and the sentence does not explain it. Most readers will read it as their pension from 60, which the record contrasts: "בניגוד לפטור על קצבה מזכה". The record also leaves National Insurance and health contributions undecided. "למשל מכספי קופת גמל להשקעה" is my inference from TXK-27 and KGL-09. | קצבה מוכרת, למשל מכספי קופת גמל להשקעה, פטורה ממס למי שמלאו לו {TXK-09:age}: קרן ורווחים, בלי תקרה ובלי מבחן הכנסה, בניגוד לפטור על קצבה מזכה. |
| 15 | KGL-08 | ok | Matches. It could say more: {KGL-08:payout_business_days} and "דמי יציאה אינם חיוב מותר" are the less known parts. | |
| 16 | KGL-04 | ok | Matches. | |
| 17 | KH-07 | change | "כל מה שמעליה חייב במס" echoes the Chief Economist's note, but the reader cannot tell what is taxed or when. The record is more exact: the employer's excess is employee income when paid, and the fund separates the money. | מותר להפקיד לקרן השתלמות יותר מהתקרה המוטבת, אבל ההטבה נגמרת שם: הפקדת מעסיק מעל הגבול הפטור נחשבת הכנסה של העובד כשהיא משולמת לקרן, והקרן מפרידה בין כסף מוטב לכסף שאינו מוטב. |
| 18 | TXS-23 | change | Drops what to do about it: "את העודף מקבלים בחזרה אחרי סוף השנה". As written it reads as a loss. | למי שמלאו לו שישים, שיעורי המס ההתחלתיים על רווח הון ריאלי נמוכים מהרגיל, אבל הניכוי במקור אחיד ולא מתחשב בגיל: את העודף מקבלים בחזרה אחרי סוף השנה, בדוח שנתי או בבקשת החזר. |
| 19 | TXS-18 | change | Drops "רק מול רווחי הון ושבח, לא מול ריבית ודיבידנד", which changes what a saver plans around. | הפסד בניירות ערך שלא קוזז עובר לשנים הבאות בלי הגבלת זמן, בתנאי שהוגש דוח לשנה שבה נוצר. בשנים הבאות אפשר לקזז אותו רק מרווחי הון ושבח, לא מריבית ודיבידנד. |
| 20 | BRK-29 | drop | True, but dull and no decision rests on it. If kept, no wording change. | |
| 21 | BRK-19 | **change, serious** | The rule is about banks only (title "Banks:", text "שהבנק קבע"). As written it reads as binding every broker, while non-bank members are outside these rules. | בבנק, עמלה על שירות בערוץ ישיר חייבת להיות נמוכה מהעמלה על אותו שירות דרך פקיד, אלא אם השירות דרך פקיד ניתן בחינם. |
| 22 | BANK-01 | ok | Matches. The identification rules and "no duty to give credit" are dropped, which does not change a saver's action. | |
| 23 | SW-26 | change | Stronger than the record. It drops "כללי הנגיד קובעים ... אילו סוגי חשבונות נכללים" and "יש בנקים שעשויים להיות פטורים". The opening "מעבר בין בנקים הוא חובה של הבנק" says the move is the duty, not allowing it. "ללא" should be "בלי" in a sentence (10.8). | בנק חייב לאפשר ללקוח להעביר את הפעילות הפיננסית שלו לבנק אחר באופן מקוון ובלי עלות ללקוח. הכללים קובעים אילו חשבונות נכללים, ויש בנקים שעשויים להיות פטורים. |
| 24 | REG-06 | change | Drops "באישור הממשלה", "שמסכים" and "על כל הפיקדונות או עד סכום". | אם בנק לא יכול לעמוד בהתחייבויותיו, נגיד בנק ישראל רשאי, לא חייב, באישור הממשלה, להכריז שבנק ישראל או בנק אחר שמסכים ערב לפיקדונות, על כולם או עד סכום מסוים. |
| 25 | PF-18 | ok | Matches the quote "לא ניתן להעביר חלק". | |
| 26 | CS-03 | change | The rendered sentence loses "per month": `slotUnitWords` leaves out `nis_per_month`, so the slot prints "58 ₪" (read in code, not run). It also never names the programme: "מפקיד לכל ילד" where? | לכל ילד מפקיד הביטוח הלאומי {CS-03:monthly_deposit} בחודש בחיסכון לכל ילד, וההורה לא יכול לוותר על זה ולקבל את הסכום כקצבה. |
| 27 | CS-04 | change | Same per-month loss. "להכפיל את החיסכון" overstates: the record says "ההפקדה מוכפלת", and from then on only. The record limits it to "ההורה שמקבל את הקצבה". "יורדים" is the colloquial form 10.7 rejects for facts. | ההורה שמקבל את קצבת הילדים יכול להכפיל את ההפקדה לחיסכון לכל ילד: עוד {CS-04:monthly_addition} בחודש מנוכים מהקצבה ועוברים לחיסכון, ואפשר להפעיל ולבטל בכל עת. |
| 28 | CS-05 | change | "אי אפשר להעביר" reads as "cannot move to another fund", yet CS-11 allows that. Here it means assign. This reading is my inference from those records. | הכסף בחיסכון לכל ילד שייך לילד: אי אפשר להעביר אותו לאדם אחר, לשעבד או לעקל אותו. |
| 29 | TXF-27 | ok | Matches, and correctly speaks only of the filing duty. Strong. Renders "60,000 דולר". | |
| 30 | TXK-27 | change | True and it keeps the condition, but it parses badly: "שמושכים ... בשיעורי המס". | על הרווח ממשיכה מקופת גמל להשקעה, כשהוא ממוסה בשיעורי המס המיוחדים לריבית, לא משלמים דמי ביטוח לאומי ומס בריאות. |
| 31 | TXS-11 | change | "לא ניתן" is against 10.1. It drops the other half, that the holder pays nothing on sale, so it reads as all bad. "קרן חייבת" alone is unclear. | בקרן נאמנות חייבת הקרן משלמת את המס בעצמה והמחזיק לא משלם במכירה, אבל גם אי אפשר לקזז הפסד על היחידות שלה. |
| 32 | BANK-18 | change | Dropped: "עמלות קנייה, מכירה ופדיון עדיין חלות על מק״ם". The sentence suggests makam at a bank is free of fees. | אסור לבנק לגבות דמי ניהול פיקדון ניירות ערך על מק״ם או על קרן כספית, אבל עמלות קנייה, מכירה ופדיון של מק״ם עדיין חלות. |
| 33 | ETF-06 | change | The regulations read are Israeli, and ETF-01 defines an Israeli ETF; that foreign ETFs on TASE fall outside them is my inference from ETF-01 and ETF-24. The useful half, the average gap, is dropped. Weak, see below. | המחיר של קרן סל בבורסה יכול להיות שונה משווי היחידה, והדוח השנתי של קרן סל ישראלית חייב להראות את טווח ההפרשים בשנה האחרונה ואת ההפרש הממוצע. |
| 34 | GOV-03 | ok | Matches. | |
| 35 | GOV-12 | change | The record limits itself: "נקראו רק התקנות הכלליות ... אם קיימת רצפה לסדרה מסוימת לא אומת", and the reduction applies below the base index. "בירידת מחירים" suggests any monthly fall. | בתקנות הכלליות של אג״ח ממשלתית צמודה אין רצפה: אם המדד יורד מתחת למדד הבסיס, גם הקרן וגם הקופון מוקטנים. תנאים של סדרה מסוימת לא נבדקו. |
| 36 | PF-01 | ok | Matches; "שלושה" is correct. Optional: "החברה שמנהלת קופת גמל" is plainer than "חברה מנהלת". | |
| 37 | PF-28 | **change, serious** | "עובר אליה" states as automatic what the record says **may** happen: "הקרן המקבלת רשאית לבדוק". It also needs a notice to the member. The transfer is treated as a request and can be rejected. | כשמצטרפים לקרן פנסיה, הקרן רשאית לבדוק אם רשום על שמכם כסף בקרנות פנסיה אחרות ולהודיע על כך. מי שלא מתנגד בזמן נחשב כמי שביקש להעביר אליה כסף מחשבון לא פעיל. |
| 38 | SW-44 | **drop, serious** | Three errors. (a) Present tense for a circular that starts 1.1.2027; the 2022 prices apply until then and were not read. (b) "לכל היותר 11" while the figure's note says the sums exclude VAT, so the true ceiling is higher. (c) Drops "המסלולים דרך הבנקים נשארים ללא עלות לחוסך", the one thing that would change what a reader does. It is also dull. See the note below for a version from 1.1.2027. | |
| 39 | IRA-02 | ok | Matches. Niche. | |
| 40 | MF-13 | change | "אפשר להפסיק" hides who decides. "קרן פתוחה" alone is not the reader's term. The figures' notes say the section was "read through a summarising fetch" (MF open question 12), so I add no numbers. | במקרים חריגים יו״ר רשות ניירות ערך רשאי להורות על הפסקת פדיון של יחידות בקרן נאמנות פתוחה, למשל כשהמסחר בבורסה שובש באופן חמור. |
| 41 | MF-49 | change | A statement about the market, stated as today's, resting on an ISA guide of January 2017 (the record's source; the rule base calls it "dated"). It should be attributed. A count over the TASE export would be stronger, if the data allows it (not checked). | לפי מדריך של רשות ניירות ערך, רוב קרנות הנאמנות בארץ לא מחלקות: הן משקיעות מחדש הכנסות כמו דיבידנד וריבית. |

**SW-44 from 1.1.2027, if the bank route is kept in the sentence:** "בקשת מידע חד־פעמית במסלקה הפנסיונית על כל המוצרים מכל הגופים עולה לחוסך לכל היותר {SW-44:saver_one_time_all_institutions} לפני מע״מ, ודרך הבנקים היא בלי עלות."

**Figures in words (question 3).** "שישה חודשים" (CS-07), "שישים" (TXS-23, source "שמלאו לו 60 שנים") and "שלושה דברים" (PF-01) all match. But style guide 10.4 says digits from 3 up, while the new validator forbids typed digits, so the words exist to get past the check. The clean fix is a figure on CS-07 and TXS-23, then a slot. TXS-23 belongs to the tax-specialist.

### Weakest and lead

**The five weakest:**
1. BRK-29: known, and no decision rests on it.
2. SW-44: an 11-shekel fee, not yet in force.
3. CS-03: nobody wants to waive free money.
4. PEN-36: a legal detail about a payslip.
5. ETF-06: an obligation in a report few people open.

Next in line: MF-49, GOV-03, KGL-04.

**Not strong enough to lead (first eight): KH-03.** Its first words report a search that found nothing, and even corrected it is half an answer. Swap in TXF-27 (ok as written), or TXS-21 once corrected. BRK-33 can lead only after its correction. TXF-14, second among the three facts a computer shows first, must not ship without the citizen exception.

### Side findings for the owners of the records and the code

- **Rendering, shared piece.** `slotUnitWords` in `site/app/components/provenance.tsx` omits `nis_per_month`, so any slot of that unit drops "בחודש". The questions page uses the same `SlottedText`, but none of its rows has a slot of that unit today (checked by script), so only CS-03 and CS-04 show it. Adding the unit there is the shared fix, and would make the typed "בחודש" above redundant: choose one.
- **Source line beside a fact.** `pickSources` takes the first primary source, so the card's source can be the wrong one (read in code):
  - KH-03 shows "משרד החינוך" (a teachers' form) beside "no law was found".
  - ETF-06 shows the tracking-fund regulations, because the annual-report regulations it speaks of are mirrors and get filtered out.
  - TXS-18 shows "אתר הממשלה (gov.il)" rather than the Tax Authority.
  - Consider naming a fact's source in `facts`.
- **SW-26 record against the rule base.** `text_he` says "סוגי החשבונות שהכללים מכסים לא נקראו", while the rule base entry lists them from the consolidated rules (current accounts only, with exclusions). The record's sentence looks stale. It affects the corrected sentence only if the exclusions get named.
- **SW-44 record.** `text_he` says "מוגבלת לאחד עשר שקלים" and leaves out the VAT that the figure's note states. The `effective_from` is set, so the page shows only a small caution icon beside the figure.
- **For the tax-specialist:**
  - TXF-27 says a holder of American ETFs "חשוף", and then that whether a US fund organised as a trust counts as a US corporation's stock "לא נקראו". The two sit badly together.
  - TXK-09's "בלי תקרה" is what the July 2026 team report would change (TXK-21, not law, no bill found). Its rule base entry says so; the record's `text_he` does not.
- **Near duplicates.** BANK-18 and BRK-17 are the same rule, and BRK-17 is fuller (delisted securities, banks only). The fact could rest on either.

## Part 2: the Hebrew

Facts: changes are in the table above. On gender, third-person generic forms ("למי שמלאו לו", "עובד", "הורה") are allowed by 10.2. No how-to steps and no process language in the facts. The one question is "לא נמצא" in KH-03, which is honest and stays.

Other word points inside facts, all included in the corrections or trivially applied:
- "ניתן" (TXS-11) goes against 10.1.
- "ללא" in a sentence (SW-26) goes against 10.8.
- "יורדים" (CS-04) goes against 10.7.
- "חד פעמית" (SW-44): the site writes "חד־פעמי".
- "ניירות" (TXF-14) is not the full term.
- American: TXF records write "אמריקני", BRK-45 and TXF-28 write "אמריקאי"/"אמריקאית". The table in 10.3 has no ruling; pick one.

`rulesFront` and the rest:

- **`facts.title` "הידעת?"** is second person singular, against 10.2 and the founder's rule (plural or impersonal, never one person). D47 and the founder's own words use it, so this is the lead's or the founder's call. → "הידעתם?". "שווה לדעת" is already taken by the guide block.
- **`facts.toRule` "לכלל המלא"** gives a single record a noun, against the founder's decision of 2026-10-24 that the set has a name and a single record none (noted in the same file on `filters.showing`). → "לפירוט המלא".
- **`DidYouKnow` gallery line** has the same two points. → "״הידעתם?״: עובדות קצרות מהחוקים והכללים, כל אחת עם המקור שלה והדרך לפירוט המלא. כל הכרטיסים באותו גובה."
- **`ask.examples[2]` "הברוקר פושט רגל"** is not something a person was told; it reads as news and alarms. The other two are claims. → "אם הברוקר פושט רגל, הכסף אובד".
- **`claim.found`** breaks on 1: "נמצאו 1 חוקים וכללים", and `WithNumber` has no singular path (10.4 asks for one). "{c} של חברות" has no noun and reads as "company rules", although the count includes documents (`found.company + found.docs`). → "נמצאו {n} חוקים וכללים · {c} אצל חברות"; for one: "נמצא חוק או כלל אחד · {c} אצל חברות" (the site already uses "חוק או כלל" as `rule.title`). When c is 0, leave out the second part.
- **`claim.near`** → "לא נמצאה התאמה מלאה; הכי קרובים: {n} חוקים וכללים · {c} אצל חברות", with the same singular path.
- **`claim.lawNone` "אין כאן כלל שמתאים לטענה ולסינון יחד."** has a noun for one record, and "טענה" is not the page's word. → "אין כאן חוק או כלל שמתאימים למה שכתבתם ולסינון יחד."
- **`claim.companiesNone`**: "שנקראו" has no narrator, and 10.1 names "האתר". → "במסמכי החברות שהאתר קרא אין כרגע נושא שמתאים למה שכתבתם."
- **`claim.companiesLine`**: "העמוד" here is a page of a PDF, while everywhere else on the site it means a web page. → "כל מסמך חל רק על החברה שלו. הקישור פותח את העמוד במסמך שבו הנושא מופיע; האתר לא מסכם מה כתוב שם."
- **`claim.noEdition` "לא צוין"**: the column is "מהדורה", which is feminine (10.8). → "לא צוינה".
- **`lede`**: "תנאים של בנק" narrows the page, which also reads funds and brokers, and "מה כתוב" does not say where. → "אמרו לכם משהו על הכסף, או שאתם קוראים תנאים של בנק או של חברה אחרת? כתבו את זה כאן, ותראו מה כתוב על זה, ואיפה."
- **`scopeWords.rulesLine.before`**: "הרשימה כאן כללית" reads as "the list is only rough". → "כאן רק חוקים וכללים שלא תלויים בחברה מסוימת. מה שכתוב רק במסמכים של חברה מסוימת מופיע בעמוד של אותה חברה."
- **`FilterChip` gallery line**: "שיוצגו בו" is unclear. → "מסנן שדולק או כבוי, עם מספר השורות שיוצגו כשהוא דולק. למספר יש מקום קבוע, ומסנן שלא יציג כלום מתעמעם ונשאר במקומו."
- **`AskField` gallery line**: "שעמוד פותח בו" and "נכנס בו". → "השדה הגדול שהעמוד נפתח בו: נכנס בו משפט שלם, ו־× מרוקן אותו."

Fine as they are: `ask.label` (seven words; screen-reader only, so its repeat of the placeholder is not seen), `ask.placeholder`, `ask.clear`, `ask.examplesLead`, the other two examples, `facts.more`, `claim.filters`, `claim.nothing`, `claim.lawTitle`, `claim.lawAll`, `claim.companiesTitle`, `claim.groups`, `claim.cols`, `claim.page`, `claim.companyRead`, `rulesLine.link`.

Not checked: whether the placeholder fits on one line at 390 px.

## Part 3: fresh search claims

I wrote the claims in everyday words before opening the list of rule titles, and then read the records to find what answers each. I had already read the 41 facts for Part 1, so claims 4 and 5 touch the same subjects as facts, in other words.

Coverage: study fund (1, 2), money-market fund (3), foreign funds (4), custody and makam (5), self-directed fund (6), kupat gemel lehashkaa (7), government bonds (8), child savings (9), tax on securities (10), moving a portfolio (11), pension (12, 13), deposits (14), foreign broker (15). Left out, to stay at 15: current accounts and insurance policies.

Scope notes: BANK-33 is a named company's term (institution scope), and SW-55 is unsettled scope. They are the true answer to their claims, but the plain general list will not show them. A search result that finds the other ids in those rows has still answered the claim.

```json
[
  { "claim": "אם אני מעביר את קרן ההשתלמות לחברה אחרת מתחילים לי את השש שנים מחדש", "rules": ["SW-39", "TXH-19", "KH-14", "SW-20"] },
  { "claim": "אחרי שש שנים כל מה שיש בקרן השתלמות פטור ממס, גם מה שהפקדתי מעל התקרה", "rules": ["TXH-09", "TXH-08", "TXH-11", "KH-07"] },
  { "claim": "הפקיד בבנק אמר שעל קרן כספית משלמים 15 אחוז מס, בדיוק כמו בפיקדון", "rules": ["TXS-12", "TXI-03", "TXS-24"] },
  { "claim": "חבר אמר שעדיף לקנות קרן אירית ולא אמריקאית בגלל מס ירושה", "rules": ["TXF-27"] },
  { "claim": "הברוקר אמר שאסור לגבות דמי משמרת על מק״ם", "rules": ["BRK-52", "BRK-17", "BANK-18", "MF-27"] },
  { "claim": "בקופה בניהול אישי אפשר לקנות מה שרוצים, גם לשים הכול על מניה אחת", "rules": ["IRA-11", "IRA-12"] },
  { "claim": "מגיל 60 מושכים את קופת הגמל להשקעה בלי לשלם מס", "rules": ["TXK-05", "TXK-09", "TXK-10", "KGL-09"] },
  { "claim": "אג״ח ממשלתית זה כמו פיקדון, אם מחזיקים עד הסוף אי אפשר להפסיד", "rules": ["GOV-12", "GOV-11", "GOV-02", "TXI-14"] },
  { "claim": "בחיסכון לכל ילד עדיף בבנק כי שם הכסף לא יכול לרדת", "rules": ["CS-10", "CS-25", "CS-05", "REG-23"] },
  { "claim": "הפסדתי על מניה בבנק אחד והרווחתי בבית השקעות אחר, אז זה מתקזז לבד", "rules": ["TXS-19", "TXS-17", "TXF-23"] },
  { "claim": "כדי לעבור מהבנק לבית השקעות צריך למכור את כל המניות ולשלם מס", "rules": ["SW-35", "SW-55", "SW-33", "SW-36"] },
  { "claim": "חברת הפנסיה יכולה להעלות לי את דמי הניהול מתי שבא לה", "rules": ["PF-13", "PF-14", "PF-16", "PEN-21"] },
  { "claim": "פיטרו אותי אז אני יכול למשוך את כל הכסף מקרן הפנסיה", "rules": ["PEN-30", "PEN-31", "TXP-18", "TXP-19"] },
  { "claim": "אם שוברים פיקדון הבנק לוקח את כל הריבית, ככה זה בכל בנק", "rules": ["BANK-06", "BANK-33"] },
  { "claim": "אם קונים דרך ברוקר בחו״ל לא צריך לדווח למס הכנסה", "rules": ["BRK-45", "TXG-20", "TXF-22", "TXF-01"] }
]
```
