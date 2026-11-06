# The rules page, element by element: does each one help the reader settle what they were told? (2026-11-05)

A zero-based relevance audit of `/rules` ("חוקים וכללים", route `site/app/routes/rules.tsx`) as it is live on
2026-11-05, steps 1 and 2 of the method in `../2026-11-05-indices-relevance/audit.md` section 5, plus the colour
check of ground rule 6. It does not judge whether an element is correct or well made, only whether it helps the reader
settle a claim about money, and by how much. Nothing here says what to keep or cut; that waits for the fresh readers.

## Plan and method

- **The reader:** someone who was told something about money, or read it in a company's terms, and wants to know
  whether it is true (D47: "The rules page leads with what a person was told"). The three test claims and what the
  rule base says about each are in `claims.md`.
- **States:** (a) nothing typed; (b) each of the three claims typed; (c) the question filter "מה המדינה לוקחת" pressed
  with nothing typed; (d) one company card opened (KH-13, from claim 1). Screenshots and visible text per state are in
  this folder.
- **Heights:** `heights.json`, measured at 1440 px on the live site (captured 2026-11-05 20:57 UTC). The filter state
  and the phone heights were not in `heights.json`; they are the sum of the screenshot heights (inferred, marked so).
  On PC the result cards sit in two columns, so a card's own height and the height it adds to the page differ.
- **Money:** a scratch script (`rules_sizes.py` in the session scratchpad; not the engine) over rates read from
  `data/rules/` and the site's example plan (7% a year, 2% inflation, P-05; the indices page's default of 10,000 ₪ now
  and 500 ₪ a month for 10 years). Fees from `data/cma/gemelnet@2026-09.json`. Shekels are nominal unless said.
- **Read or inferred:** heights, counts, texts and rates were read from the capture, the code and the data. Which
  question an element serves, and "already carried", are my judgement over those. Where a cause is named from code, the
  code was read but the page was not re-run to prove it.

## 1. The reader's questions, ranked by the money they move

### The three test claims

| # | Question (the claim) | Money it moves, at a plain example | What the page answered (claim state) |
|---|---|---|---|
| 1 | **"קרן השתלמות פטורה ממס אחרי 6 שנים"**: is a study fund tax-free after 6 years? | **Large.** A salaried worker at the salary ceiling (15,712 ₪ a month, TXH-02) with the full benefited deposit (2.5% + 7.5% = 1,571.20 ₪ a month, KH-04) has **139,145 ₪** after 6 years at 7%; the gain is 26,019 ₪, of which 19,123 ₪ is real. The exemption is worth **4,781 ₪** (25% of the real gain, TXH-11's rate, as a taxable account would pay) and keeps growing after year 6. **Gains on deposits above the ceiling are taxed** (TXH-11): at a 25,000 ₪ salary the 929 ₪ a month above it earns 11,304 ₪ of real gain in 6 years, **2,826 ₪** of tax. **Early withdrawal:** the non-exempt sums are withheld at **47%** (TXH-15; which sums are non-exempt was not sized). **A withdrawal closes the account** (KH-15): new deposits start a new 6-year clock; not money at once, but 6 more years before those deposits are free. The exemption is "likely to change" (TXH-09, TXH-22: a Finance Ministry paper, not law, proposes limiting it). | 26 found, 6 shown. TXH-09 (first) carries the answer and the ceiling ("הרווחים שמקורם בהפקדה המוטבת") and the closure in its text, and "6 שנים · קבוע בחוק" in its figures. TXH-11 (the 2,826 ₪) is not among the six shown. Four of the six shown are about moving the fund to another company. |
| 2 | **"על רווח בבורסה משלמים 25% מס"**: is it 25% on stock-market gains? | **Medium.** On the indices page's default plan (10,000 ₪ + 500 ₪ a month, 10 years, 7%, 2% inflation) the gain is 35,197 ₪, of which 8,488 ₪ only makes up for inflation. 25% of the whole gain is 8,799 ₪; 25% of the real gain is 6,677 ₪: **the inflation rule (TXS-02) is worth 2,122 ₪.** "Up to 25%" (TXS-01): lower only for someone whose whole income is in a low bracket (not sized). Unlinked bonds pay **15% of the whole gain** (TXS-03): 5,280 ₪ on the same gain. A substantial shareholder (10% of a company) pays up to 30%: not this page's reader. | 7 found, 6 shown. TXS-01 (first) says "רווח הון ריאלי", "לא יותר משיעור המס המרבי" and "בעל מניות מהותי", with "25% · שיעור המס המרבי על רווח הון ריאלי". **TXS-02 (inflation is exempt) is not found**; TXS-09's text says the real gain "נמדד מול מדד המחירים לצרכן". TXS-03 (15%) is not found. The one company card offered is BANK-34 (prime rate), unrelated. |
| 3 | **"מעבר מסלול בקרן השתלמות לא עולה כלום"**: does switching track cost nothing? | **Small, with one catch.** No tax (TXH-17), no fee and no limit on the number of switches (PF-23), money moves within 3 business days. **The catch** (PF-14 with PF-13): a switch lets the company raise a discounted fee before the discount's minimum 5 years end (after notice). Study-fund fees in gemelnet (September 2026, 138 of 154 tracks with a figure) run **0.24% to 0.74%, median 0.58%**; the cap is **2%** (PF-06). On the 139,145 ₪ balance of claim 1, the cheapest-to-median gap is **473 ₪ a year**; median to the cap, an upper bound, **1,976 ₪ a year**. | 5 found, all shown. KH-18 (first) says the money moves in a few business days and "והחוק לא מתיר עמלה עליו"; TXH-17 says no tax. **PF-14 and PF-13, the catch, are not found**; PF-23 is not found, though KH-18 carries its "no fee". IRA-02 (pension to self-managed funds) and TXS-12 (money-market funds) are unrelated. No company section. |

### The page's own lists of questions

- **P-09 (`data/parameters/pinned-rules.json`), 12 questions.** Read. They are no longer shown on the page: D58 removed
  the questions page and its links, and on `/rules` a question appears only when a guide links to its rules
  (`?ids=`, `presetRow` in the route). Ranked by money, as far as the rule base sizes them without new work:
  1. "מתי אפשר למשוך קרן השתלמות בלי מס?" (TXH-09, KH-15): claim 1 above, thousands of shekels.
  2. "כמה מס משלמים על רווח בבורסה?" (TXS-01, TXS-02): claim 2 above, about 2,000 ₪ on the default plan.
  3. "קיבלתם הנחה בדמי ניהול: לכמה זמן היא מובטחת?" (PF-13, PF-14, SW-15): hundreds of shekels a year (claim 3).
  4. "כמה דמי ניהול מותר לחברה לגבות?" (PF-06, PF-02): the cap, 2% of the balance in a study fund; same scale.
  5. "כמה מס משלמים על ריבית מפיקדון?" (TXI-03, TXI-02): 15% of all the interest on an unlinked deposit; not sized.
  6. "כל הקרנות הכספיות אותו דבר?" (TXS-24, MF-37): not sized.
  7. "עוברים מסלול בתוך הקופה: משלמים מס או עמלה?" (TXH-17, TXK-04, PF-23): claim 3, zero unless a discount ends.
  8. "מעבירים את הכסף לקופה אחרת: כמה זמן זה לוקח ומה זה עולה?" (PF-19, SW-06): not sized.
  9. "כמה אפשר להפקיד בקופת גמל להשקעה בשנה?" (KGL-02, KGL-03): a ceiling, decides what is allowed; not sized.
  10. "הכסף בפיקדון בבנק מבוטח?" (BANK-23, REG-04, REG-06): no deposit insurance; at stake is a deposit if a bank
      fails. A risk, not a sum.
  11. "מה קורה לפנסיה אם החברה שמנהלת אותה קורסת?" (REG-18, REG-19): a protection question; a risk, not a sum.
  12. "כסף שיושב בעו״ש: הבנק חייב להודיע על זה?" (BANK-20): a notice above 15,000 ₪; it moves no money by itself.
- **The five question filters (D25's "shelves")**, visible: "מה המדינה לוקחת" 175 rules, "מה הבנק או בית ההשקעות
  לוקחים" 72, "מה אפשר לעשות עם הכסף" 145, "מי מפקח ומה מוגן" 76, "איך המוצר בנוי" 33. The first two decide money
  directly (tax and fees); the third decides what is allowed and when; the last two decide risk and meaning.
- **The three example claims under the field**, visible: "מותר לבנק לשנות עמלה בלי להודיע", "אפשר למשוך קרן השתלמות
  אחרי 3 שנים" (true only at retirement age or for study, TXH-10), "אם הברוקר פושט רגל, הכסף אובד".
- **What the decisions say the page is for.** D25: "every rule on the same page, with filters by the reader's
  question …, by product, by id prefix and by 'about to change'", "every rule shows its sources first". D47: "A large
  field takes a claim in plain words … When a claim is typed, the filters fold away and the page shows what the law and
  the rules say, then 'מה כתוב אצל החברות'". D48 governs the rules chip on other pages; on this page a fact's single
  rule opens its card ("BANK-20 · לפירוט המלא").

## 2. Every element, state by state

Height is on PC, in px. "Carried by" names another element that already gives the reader the same thing. "Required
by" quotes a founder rule or decision, or says none was found in D25, D47, D48 and the standing rules.

### (a) Nothing typed: 5,839 px on PC; about 6,686 px on a phone (inferred from the shots)

| Element | Height | Serves | How much | Carried by | Required by |
|---|---|---|---|---|---|
| Title "חוקים וכללים" | 39 | none (orientation) | 0 | the menu item of the same name | D25: the set "is named 'חוקים וכללים'" |
| Intro "אמרו לכם משהו על הכסף, או שאתם קוראים תנאים …" | 58 | the claim field (says what to type) | 0 by itself | the field's placeholder "כתבו מה אמרו לכם, או מה קראתם בתנאים" | none found |
| **Claim field** | 62 | **every question**: the way in to all three claims | the whole of each answer below | — | D47: "A large field takes a claim in plain words" |
| "למשל:" and 3 example claims (links that fill the field) | 44 | shows what to type; one example is a claim about the study fund | 0 | — | none found in the decisions |
| "לפי השאלה": label and 6 chips with counts (הכול 501, and the five questions) | 66 | browsing by kind of question: tax and fees first | narrows 501 rules to 33 to 175; changes no answer | the five section headings below (same names, same counts) | D25: "filters by the reader's question (five 'shelves' …)"; D47: "with live counts" |
| "לפי מוצר": label and 20 chips with counts | 170 (3 rows) | browsing by product | narrows; changes no answer. **5 pairs have equal counts** (קרן כספית / מתחדשת 67, איגרות חוב ממשלתיות / מק"מ 46, פיקדון / תכנית חיסכון 39, קופת גמל / קרן השתלמות בניהול אישי 37, קרן חדשה כללית / תגמולים ואישית לפיצויים 60); whether they hold the same rules was not checked. Includes "עוד לא באתר 13" and "משותף לכל הקופות 30" | — | D25: "by product" |
| "עומד להשתנות 231" chip | 44 | whether a rule is about to change | marks **231 of 501 rules (46%)** | the "ייבדק שוב" date on each card | D25: "by 'about to change'" |
| "לפי מספר" fold (id prefixes, closed) | 44 | none of a reader's questions (ids are the rule base's) | 0 | the ids on the cards | D25: "by id prefix" |
| Count "מוצגים 501 מתוך 501" | 44 | none while nothing is filtered | 0 | the "הכול 501" chip | D47 "live counts" covers the chips; none found for this line |
| **Rule list: 5 sections, 71 folded groups** | **4,672** (80% of the page) | browsing; each section is a question kind | 0 until a group is opened. Groups follow the rule base's files: **25 distinct names, 15 of them repeated across sections**, **14 groups hold one rule**, and one section can hold the same product twice ("קרן השתלמות · 1" and "המס על קרן השתלמות · 15" both under "מה המדינה לוקחת"; likewise "פנסיה וקופת גמל לקצבה · 2" and "המס על פנסיה …· 18"). Two groups say "(עוד לא באתר)" | the filters (same rules) | D47: "While nothing is typed, the page lists every rule by group"; D25 "every rule on the same page" |
| · Section heads with count and a one-line scope (e.g. "מס בהפקדה, בדרך ובמשיכה; פטורים; מה חייב בדיווח") | 56 each, 280 | which section answers which kind of question | 0 | the question chips | none for the scope lines |
| · Group folds (48 + 12 gap each) | 60 each, 4,260 | finding a rule by topic | 0 until opened | — | D47 (as above) |
| **"הידעת?" block**: 2 facts with their sourced figure, the source's publisher, "BANK-20 · לפירוט המלא", and "עוד עובדות" | 609, **beside the list on PC (adds 0)**; about 340 on a phone, **above the list** | none of the three claims. BANK-20 (a bank must notify above 15,000 ₪ idle) touches idle cash; TXF-27 (US estate tax above 60,000 $) touches S&P 500 holders abroad | 0 for the claims; TXF-27 can be large for an estate, not sized | the rule cards BANK-20 and TXF-27 | D47: "beside a 'הידעת?' block of sourced facts (P-09 `facts` …)"; D48: "a single rule opens its card at once" |
| Footer "123 ממקור · לחצו על מספר כדי לראות מאיפה הוא." | 22 | reading a sourced figure | 0 | the grey underline itself | Standing rule: "The page shows which of the three it is" |
| Footer "הכול נכתב מנוסח החוק או ממסמך של הרשות כשאפשר; …" | 44 | trust in the answer | 0 | the source lines on each card | Standing rule "General sources first" (by meaning; the line itself is not required) |
| Footer "כאן רק חוקים וכללים שלא תלויים בחברה מסוימת … לרשימת החברות" | 44 | where a company's own terms are | 0 | — | D47: "the plain list without a claim holds general rules only" |

### (b) A claim typed: 4,420 / 3,404 / 4,684 px on PC; about 10,178 / 7,408 / 8,730 px on a phone (inferred)

| Element | Height | Serves | How much | Carried by | Required by |
|---|---|---|---|---|---|
| Title, intro and field (examples gone) | 183 | the claim | — | — | D47 |
| The typed claim in the field | (in 62) | the claim | — | — | — On a phone the field cuts the claim ("… אחרי 6 שני"); read from `claim1-phone-00.png` |
| "סינון התוצאות" fold (the filters, closed) | 44 | narrowing results | 0 in all three claims (no claim needed it) | — | D47: "When a claim is typed, the filters fold away" |
| Count "נמצאו 26 חוקים וכללים · 1 אצל חברות" | 44 | how much the page found | 0. The count is of matches, not of answers: 26 for claim 1, where 2 of the 6 shown answer it | the section head "· 26" right below | none found |
| Section head "מה כתוב בחוק ובכללים · 26" | 29 | — | — | the count line | D47: "the page shows what the law and the rules say" |
| **Result cards, first 6** (in two columns on PC) | 3,339 / 2,324 / 3,759 (the grid) | **the claim** | see the next table | — | D47; the cap of 6 is the code's `claimFirst = 6`, no decision found |
| "לכל ה־26" / "לכל ה־7" link | about 40 | the matches not shown | claim 1: TXH-11 (2,826 ₪) may be among them; not checked | — | none found |
| "מה כתוב אצל החברות" heading | 29 | what each company wrote | — | — | D47: "then 'מה כתוב אצל החברות'" |
| "במסמכי החברות שהאתר קרא אין כרגע נושא שמתאים למה שכתבתם." | 22 | the company documents | 0. In claims 1 and 2 it is followed at once by a company card under "מה שהאתר כבר קרא בתנאים של חברות", so "nothing matched" and "one matched" stand one under the other | — | D47: "the company documents that speak of the claim's subject" (the empty case) |
| "מה שהאתר כבר קרא בתנאים של חברות" and one folded card (KH-13 for claim 1, BANK-34 for claim 2; none for claim 3) | 75 | claim 1: which study fund allows a study withdrawal and how. Claim 2: nothing (prime rate) | claim 1: a liquidity question, not a sum. Claim 2: 0 | — | D47: "then the company terms the site has read" |
| Footer (three notes) | 140 | as in (a) | 0 | — | as in (a) |
| "הידעת?" | **0: gone** once a claim is typed | — | — | — | D47 (shown "while nothing is typed") |

**The result cards, one by one.** Height is the card's own; "rows" says what the card adds to the page on PC.

| Claim | Card | Height | Serves the claim? | Money it carries |
|---|---|---|---|---|
| 1 | TXH-09 "מתי אפשר למשוך מקרן השתלמות בלי מס" | 836 | **yes, the answer**: 6 years, only "הרווחים שמקורם בהפקדה המוטבת", the closure, "ההצעות לצמצם את ההטבה ישנו את הכלל הזה אם יחוקקו" | 4,781 ₪ (and the ceiling, in words) |
| 1 | TXH-10 "משיכה פטורה בתקופה מקוצרת" | 1,090 | yes, a side: 3 years at retirement age or for study | the same exemption, earlier |
| 1 | TXH-19, SW-20, KH-17, PF-18 (moving the fund to another fund or company) | 1,217 / 885 / 966 / 1,008 = **4,076** | **no**: they answer "can I move it and keep the years", not the claim | 0 for the claim. On PC rows 2 and 3 (2,225 px) hold only these |
| 1 | not shown: TXH-11 (gains above the ceiling are taxed) | — | the main condition | 2,826 ₪ at a 25,000 ₪ salary |
| 2 | TXS-01 "מס על רווח הון ממניות שנסחרות בישראל" | 844 | **yes, the answer**: real gain, "לא יותר משיעור המס המרבי", a substantial shareholder pays more; figure "25% · שיעור המס המרבי על רווח הון ריאלי" | the 25% ceiling |
| 2 | TXS-09 "קרן פטורה: מה החוסך משלם במכירה או בפדיון" | 928 | partly: "הרווח הריאלי נמדד מול מדד המחירים לצרכן" | part of the 2,122 ₪, in words only |
| 2 | TXS-07 (two tax tracks of an Israeli fund), TXF-05 (Israeli withholding on a foreign fund) | 521 / 711 | side: who withholds, not how much | 0 for the claim |
| 2 | TXS-19 (offsetting losses), TXF-22 (a foreign broker: twice-yearly advances) | 661 / 615 | side: how the tax is paid and lowered | losses: not sized |
| 2 | not shown: TXS-02 (inflation exempt), TXS-03 (unlinked bonds, 15%) | — | the "half" of the half-truth | 2,122 ₪; 5,280 ₪ against 6,677 ₪ |
| 3 | KH-18 "מעבר בין מסלולים בתוך הקרן: מתי ואיך הכסף עובר" | 903 | **yes**: a few business days, "והחוק לא מתיר עמלה עליו" | the "no fee" |
| 3 | TXH-17 "מעבר מסלול בתוך הקרן אינו אירוע מס" | 594 | **yes**: no tax | the "no tax" |
| 3 | TXS-21 "מעבר בין קרנות או ניירות ערך הוא מכירה" | 642 | contrast: outside the fund a switch is a sale | 0 for the claim |
| 3 | IRA-02 (pension money into a self-managed fund), TXS-12 (money-market funds) | **1,664** / 1,167 | **no** | 0. On PC rows 2 and 3 (2,831 px) are set by these two |
| 3 | not shown: PF-14 with PF-13 (a discount can end) | — | **the catch** | 473 to 1,976 ₪ a year at 139,145 ₪ |

Relevant cards over all card height: claim 1, 1,926 of 6,002 px (32%); claim 2, 1,772 of 4,280 px (41%, counting
TXS-01 and TXS-09); claim 3, 1,497 of 4,970 px (30%, KH-18 and TXH-17).

**Inside one card** (all 17 result cards measured from `heights.json`; the parts after the sources by eye from the
shots):

| Part | Height | Serves | How much | Carried by | Required by |
|---|---|---|---|---|---|
| "id · title" (e.g. "TXH-09 · מתי אפשר למשוך מקרן השתלמות בלי מס") | 25 to 50 | finding the answering card | the title often answers in words | — | D25: "a card reading 'id · title'" |
| Scope chip "חל על כולם" | (in the header, 52 with the title) | none for these claims | 0. **The same on all 17 result cards** | — | D30 via the card ("who it applies to … a neutral label") |
| **Body text** | 90 to 246; **12% to 17% of card height** (740 / 739 / 762 px of 6,002 / 4,280 / 4,970) | **the answer** | all of it | — | D25 (the rule) |
| "נגזר מ־ PF-18 KH-14 …" and "זו מסקנה משילוב של כמה חוקים וכללים, לא משפט אחד שנמצא במקור." | about 50 | how sure | 0 | — | none found |
| "לדוגמה: הראל ועוד אחת" (SW-20) | 24 | — | 0 | — | none found |
| **Sources**: per source a teal link (publisher · document, page, section), a "PDF" tag, the quoted words, "נבדק date" | 90 to 1,094; **32% to 53% of card height** (3,197 / 1,376 / 2,512 px); 1 to 8 sources a card, 28 in claim 1's six cards | trust; the government paper behind the answer | 0 to the answer; it proves it | the body | D25: "every rule shows its sources first (publisher, document, section or page, the quoted words where the record holds them, the date read …)" |
| "המספרים": figure name, "קבוע בחוק" or "לשנת המס 2026 · קבוע בחוק", the figure with a grey underline (6 in all three claims) | about 60 a figure | **the number in the claim** ("6 שנים", "25%") | confirms the figure; "שיעור המס המרבי על רווח הון ריאלי" carries "ceiling" and "real" | the body, in words | Standing rule "Every number traces to a source" |
| "נבדק date" and "ייבדק שוב date" (the rule's own) | about 60 | whether it may change | 0 | the per-source dates above | D25 ("about to change") |
| "נוגע ל": topic tags (e.g. "פטורים לפי גיל ושימוש", "מס ביציאה", "נזילות ונעילה"), not pressable | about 30 | none | 0 | — | none found |
| "משפיע על": product links and "החישובים באתר" | 25 to 60 | where else the rule matters | 0 to the claim | — | none found |
| "לא משתנה מעצמו" (13 of 17 cards) | 20 | whether it changes on its own | 0 | the dates | none found |
| "מראה מקום" box with a copy button | about 45 | citing the rule elsewhere | 0 | **the first source line** (same publisher, document and page, with the address) | none found |

### (c) The question filter "מה המדינה לוקחת" pressed: about 2,488 px on PC, 3,077 on a phone (inferred)

| Element | Height | Serves | How much | Carried by | Required by |
|---|---|---|---|---|---|
| The pressed chip (teal fill) and "מוצגים 175 מתוך 501" with "ניקוי הסינון" | as in (a), 44 | narrowing to tax | 0 by itself | — | D47 "live counts" |
| Product chips re-counted for tax (e.g. "קרן השתלמות 15", "חשבון ניירות ערך 44"); "משותף לכל הקופות 0" greyed | as in (a) | narrowing further | 0 | — | D47 "live counts" |
| The one section, 20 folded groups | about 1,300 | browsing tax rules | 0 until a group opens | — | D47 |
| "הידעת?" | beside, as in (a) | — | 0. The first fact is still BANK-20 (a bank notice), though the code's comment says "the facts that fit the filters come first"; whether BANK-20 fits this filter was not checked | — | D47 |
| **The product chip "קרן השתלמות" instead** (not given to readers) | **29,171 px on PC, 52,909 on a phone** (from the capture) | — | it opens all 42 cards at once (the code's `autoOpenLimit = 120`) | — | none found for the limit |

### (d) A company card opened (KH-13, from claim 1)

| Element | Height | Serves | How much | Carried by | Required by |
|---|---|---|---|---|---|
| Fold "KH-13 · אלטשולר שחם והראל: משיכה להשתלמות לפי התקנון" | 48 | — | — | — | D47 |
| The same title again as the card's header | 25 | — | 0 | **the fold, one line above** | none |
| Scope chip "על אלטשולר שחם ועוד אחת" | (in the header) | whose term it is | — | the title | D30: a company's term "appear[s] named" |
| Body (three study-withdrawal cases at Altshuler Shaham; Harel differs; "מה שבחוק: …") | about 70 at full width | claim 1's side: the study exception that keeps the account open | a liquidity question | TXH-10 (the law part) | D47 |
| "המקורות כאן אינם מסמכים של אלטשולר שחם והראל." | 22 | — | 0. **It contradicts the three sources listed under it**, which are Altshuler Shaham's and Harel's own bylaws and form, each marked "לפי החברה". Read in code: the line is `scopeWords.line.notTheirs`, chosen when the card is given no company documents, and the rules page's card data (`pd` in the route) passes none; the same cause would explain "לפי החברה" on a company's own document, which D31 says should not show. Inferred, not re-run | — | D31 (its opposite) |
| "נגזר מ־ KH-10 KH-15 TXH-10" and its note | 50 | — | 0 | — | none found |
| Three sources with "נבדק 25.10.2026 · לפי החברה" | 190 | trust | 0 | — | D25, D30 |
| Dates, "נוגע ל", "לא משתנה מעצמו" | 100 | — | 0 | — | none found |
| "רקע בלבד: לא נכנס לחישוב ולא מוצג בעמוד אחר." | 22 | none (it speaks of the site's own workings) | 0 | — | none found |
| "מראה מקום" (with the company's address) | 45 | — | 0 | the first source line | none found |

## 3. Height against money

| Question | Money at the example | Height that serves it, in the state where the reader asks it |
|---|---|---|
| 1. Study fund tax-free after 6 years | 4,781 ₪ exemption; 2,826 ₪ tax above the ceiling; 47% withholding if early | TXH-09 836 px and TXH-10 1,090 px. Four transfer cards, 4,076 px, sit beside and below them. TXH-11 not shown |
| 2. 25% on stock-market gains | 2,122 ₪ (inflation); 15% against 25% on unlinked bonds | TXS-01 844 px, TXS-09 928 px. TXS-02 and TXS-03 not found; four side cards 2,508 px |
| 3. Switching track costs nothing | 0 tax, 0 fee; a lost discount 473 to 1,976 ₪ a year | KH-18 903 px, TXH-17 594 px. PF-14 and PF-13 not found; two unrelated cards 2,831 px |
| none of the claims (nothing typed) | — | the folded list 4,672 px (80% of the empty page); filters 417 px; "הידעת?" 0 on PC, about 340 on a phone |

Inside a result card the answer is the body, 12% to 17% of the card's height; the sources are 32% to 53%. In all three
claims the answering card was first, and on both PC and phone its body is on the first screen after the field (read
from `claim1-pc-00.png` and `claim1-phone-00.png`). What the half-truths turn on (TXH-11, TXS-02, PF-14) was not on the
page in any of the three claims.

## 4. The colour check (ground rule 6, as amended on 2026-11-05)

The page has **no chart and no set of hues that tells categories apart**: the five question sections, the 20
product chips, the 71 groups and the topic tags are all the same neutral grey. Colours on the page, read from the code
(`theme.css`, the kit's `filter-chip`, `did-you-know`, `tag`, `fields`, `disclosure`, and `provenance.tsx`) and seen in
the shots:

| Colour (role, step, hex) | Where | Meaning there |
|---|---|---|
| background, neutral-975, #100f0d | page | surface |
| card, neutral-950, #171614 | result cards, the facts inside "הידעת?", the field | surface |
| secondary / muted, neutral-850 and 900, #282623 / #201e1b | unpressed filter chips, "עוד עובדות", the "חל על כולם" and topic tags, the "PDF" tag | a control or a label (the same grey for both: a pressable chip and a tag that does nothing) |
| foreground, neutral-100, #f2f0ec | headings, body text | text |
| muted-foreground, neutral-300, #c7c4be | intro, counts, dates, quotes, the "לפי החברה" and "מקור משני" words | secondary text |
| sourced hairline, neutral-500, #7d7a74 | under 15,000.00 ₪, 60,000.00 $, 6, 3, 25%, 15% and the footer "123" | a sourced figure (D7) |
| primary / link, teal-300, #83d5d0 | the pressed filter chip (fill), the field's frame, the example claims, every source link, "BANK-20 · לפירוט המלא", "לכל ה־26", "נגזר מ־" ids, product links, footer links | pressable, or chosen |
| info-border, teal-800, #04504d | the frame of "הידעת?" | a box of facts (not pressable) |
| caution, amber-400 / 200 | not in any captured state. In code: a source line whose rule may have changed since it was read ("מאז ייתכן שהנוסח השתנה."), the strength tag of a rule read from a secondary or company source | status |
| blocked, red-400 / 200 | not in any captured state. In code: an open rule's card | status |
| positive, green; entered, blue; computed, violet | not used on this page | — |

- **Two meanings inside one panel:** teal. In the header panel it is the field's frame, the example links and the
  pressed chip's fill, so "chosen" and "pressable" share one hue; in "הידעת?" a dark teal frames the box while light
  teal marks its links. Both are within the site's "teal for actions and links", and no chart is involved. Grey
  likewise covers both a pressable chip and a tag that does nothing ("נוגע ל"). Read from the shots and the code.
- **Status words not in their status colour:** "מקור משני" (on TXS-12's Bizportal source) and "לפי החברה" (on KH-13's
  sources) are written in muted grey (`provenance.tsx`, `OneSource`: `text-muted-foreground` unless the source may
  have changed), while CLAUDE.md names amber for "secondary source" and for "a company's figure used outside its own
  context, labelled 'לפי החברה'". The word is there, so nothing relies on colour; the amber is missing. Read.
- **Validator.** There is no categorical set to validate. For completeness, the hued status roles a rule card can carry
  were run: `validate_palette.js "#83d5d0,#e29522,#ff796d" --mode dark --surface "#171614" --pairs all` (link, caution,
  blocked) **fails** as a categorical palette: lightness outside the 0.48 to 0.67 band (0.73 to 0.82: these are text
  and icon steps), teal-300 below the chroma floor (0.081), and red against amber ΔE 11.7 normal and 5.6 deutan. Adding
  green and the grey hairline makes green against red ΔE 3.1 deutan. The validator itself says its scope is
  "categorical palettes only"; these are status marks that also carry an icon or a word (lock, alert, "לפי החברה"),
  and none of them appeared in the captured states. Contrast against the card surface passes for all.

## 5. What the reader needs and the page did not show (facts, not verdicts)

1. **The condition each claim turns on.** TXH-11 (gains above the ceiling taxed: 2,826 ₪ at a 25,000 ₪ salary) was not
   among claim 1's six shown cards; TXS-02 (inflation exempt: 2,122 ₪) and TXS-03 (15%) were not found for claim 2;
   PF-14 and PF-13 (a discount can end: up to 1,976 ₪ a year) were not found for claim 3.
2. **A verdict line.** No element says "true", "partly true" or "true, except …"; the reader assembles it from the
   bodies. The claim's own figure is confirmed only in "המספרים" (6 שנים, 25%).
3. **The shekels.** No result shows what the rule is worth on the reader's money; the page holds no plan. Whether it
   should is a product question (the page's decisions do not ask for one), noted, not proposed.
4. **The 12 questions of P-09** are reachable only from guides' links since D58; the page itself shows none of them.
