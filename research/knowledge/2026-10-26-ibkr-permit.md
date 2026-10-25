# Interactive Brokers and the ISA's section 49A permit (research pass, 2026-10-26)

Question: does an Interactive Brokers company hold the Israel Securities Authority's permit under section 49A of the Securities Law, which lets a foreign broker offer trading services to people in Israel? Read first: `brokerage-account.md` BRK-01, BRK-06, BRK-41 to BRK-46, BRK-50 and open question 9. Nothing in the rule base or `data/` was edited.

## The answer in two sentences

Yes: the ISA's own list of section 49A permit holders names Interactive Brokers LLC (supervisor: the SEC, United States) and Interactive Brokers (U.K.) Limited (supervisor: the FCA, United Kingdom) among the foreign brokers permitted under the general permit's alternative B, both with a permit date of 20.10.2021; Interactive Brokers Ireland and Interactive Brokers Central Europe are not on the list. Interactive Brokers' own pages read do not say which of its companies opens an account for a resident of Israel, and none of them mentions the permit, so the site can state the permit from the ISA's list, but not which company a direct Israeli client gets.

## Findings

### F1. The ISA's list of permit holders: found, current file, and Interactive Brokers is on it

The ISA publishes "רשימת גופים בעלי היתר לפי סעיף 49א לחוק ניירות ערך" as a PDF (15 pages). Last time it was not found because it sits under a different path (`isa-be`) from the Q&A and the conditions. The file keeps its 2023 name and is replaced in place: the server's `Last-Modified` is 1 September 2025, the PDF's creation date is 31.8.2025, and the latest permit date printed in it is 21.01.2025.

The foreign-broker table (heading as printed, bidi resolved: "להלן יובא פירוט הברוקרים הזרים שקיבלו היתר לפי סעיף 49א לחוק לפי סעיף 2(ב)(1)(ג) לתנאי ההיתר הכללי", that is alternative B, category (1)(c), offers to the public at large) has 74 rows. Two of them:

| row | שם הישות המשפטית | מספר התאגדות / רישיון | גוף מפקח | תאריך מתן ההיתר | page |
|---|---|---|---|---|---|
| 11 | Interactive Brokers LLC | 0585402 | Securities and Exchange Commission ("SEC"), ארה"ב | 20.10.2021 | p.5 |
| 12 | Interactive Brokers (U.K.) Limited | 03958476 | Financial Conduct Authority ("FCA"), בריטניה | 20.10.2021 | p.6 |

No other Interactive Brokers company is on the list (searched the whole text for "Interactive", "Ireland", "Central Europe", "Hungary", "אירלנד", "הונגריה": only these two rows). No entity supervised by the Central Bank of Ireland appears at all.

- Source: [רשות ניירות ערך: רשימת גופים בעלי היתר לפי סעיף 49א לחוק ניירות ערך](https://www.new.isa.gov.il/images/Fittings/isa-be/asset_library_pic/al_lobby/al_lobby-627b50ab87f01/ListofCompanies130623.pdf), p.4 (heading of the foreign-broker table), p.5 row 11, p.6 row 12 · checked 2026-10-26 · primary
- Proposed scope: `- Scope: institution: Interactive Brokers`

Other names on the same list that touch records already in the rule base (same source):
- **Interactive Israel.** "Mexem LTD.", licence "325/17", Cyprus Securities and Exchange Commission ("CYSEC"), 21.02.2024, in the table of foreign brokers "שקיבלו היתר לפי סעיף 49א לחוק ואשר ביקשו לפעול באמצעות גורמים חיצוניים, שעליהם הם מחויבים לפקח בהתאם לתנאי ההיתר הכללי" (p.13, row 3). Separately, "אינטראקטיב ישראל שוקי הון בע"מ", licence type "ניהול תיקים", licence 712, permit 13.7.2022, in the table of licensees under the advice law, alternative B category (1)(d) (p.14, row 19). This confirms from the regulator what BRK-46 records only from Interactive Israel's own page.
- **Bank Yahav.** "בנק יהב לעובדי המדינה בע"מ", supervisor "הפיקוח על הבנקים – בנק ישראל", 01.04.2020 (p.4, banks table row 9). Confirms BRK-46's Yahav part from the regulator.
- **eToro** (open question 9 says "eToro not researched"). "eToro (Europe) Limited", 200585, CYSEC, 3.7.2022 (p.11, row 60); "eToro (UK) Limited", 07973792, FCA, 3.7.2022 (p.11, row 61).

### F2. Is the list complete, and how often is it updated

What the ISA says:
- The binding Hebrew conditions say the list is shown on the ISA site and leaves out only alternative A (qualified investors only, which needs no application): "על מנת לשקף לציבור המשקיעים את זהות הגורמים שהינם בעלי היתר מכוח סעיף 49א לחוק, תוצג רשימת הגורמים האמורים באתר הרשות. הרשימה לא תכלול גורמים שאינם בורסות או מי מטעמן הפועלים בהתאם לחלופה המפורטת בסעיף 2, חלופה א' להיתר (פניה למשקיעים כשירים בלבד)."
  - Source: [רשות ניירות ערך: תנאי ההיתר הכללי לפי סעיף 49א לחוק ניירות ערך (נוסח חדש דצמבר 2023)](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-626a5f3377ef9/49A.pdf), p.2, דברי הסבר · checked 2026-10-26 · primary
- The list itself says brokers need to apply only when they approach the public at large: "גורמים אחרים כמו ברוקרים נדרשים לפנות לרשות רק אם הם פונים למשקיעים מהציבור הרחב, להבדיל ממשקיעים כשירים שנכללים בתוספת הראשונה לחוק".
  - Source: [רשות ניירות ערך: רשימת גופים בעלי היתר לפי סעיף 49א](https://www.new.isa.gov.il/images/Fittings/isa-be/asset_library_pic/al_lobby/al_lobby-627b50ab87f01/ListofCompanies130623.pdf), p.1, para. 2 · checked 2026-10-26 · primary
- The list prints no "as of" date. Its footnote: "מובהר כי פירוט הסטאטוס הרגולטורי של בעלי ההיתר בכל הטבלאות לעיל נכון למועד הפרסום. לגבי סטאטוס העדכני - יש לבדוק באתר הרגולטור הרלבנטי" (p.14, footnote under the advice-law table; same source).

How often it changes (from the file's history, not from an ISA statement):
- The Internet Archive holds three captures of the same address: 14.12.2024 and 21.4.2025 with one content digest, 11.6.2026 with the digest of today's file. The 2025 capture is a PDF created 11.7.2024 whose latest permit date is 09.07.2024, and it already lists both Interactive Brokers rows. So the file was replaced about a year apart (July 2024, then end of August 2025) and has not changed for about 14 months.
  - Source: [Internet Archive: capture of the ISA list, 21.4.2025](https://web.archive.org/web/20250421004834/https://www.new.isa.gov.il/images/Fittings/isa-be/asset_library_pic/al_lobby/al_lobby-627b50ab87f01/ListofCompanies130623.pdf), p.5 row 11, p.6 row 12 · checked 2026-10-26 · primary (archived copy of the regulator's file)
- Reading: complete in scope (every permit except alternative A) as at its last update; permits granted or revoked after August 2025 would not show. A holder must re-declare every three years ("נדרש בעל ההיתר אחת לשלוש שנים להגיש הצהרה דומה", conditions p.8), and must report at once if a condition stops holding (p.8). Interactive Brokers' 2021 permit is still on the 2025 file, which is after its first three-year mark.

### F3. The binding Hebrew text of the general permit conditions (found)

The Hebrew original that BRK-06 says was not found is the file the list links to ("לתנאי ההיתר הכללי ראה קישור", list p.1). Dated "כ"ט כסלו תשפ"ד, 12 בדצמבר 2023", "(נוסח חדש דצמבר 2023)", in force from 11 February 2024, signed by "ספי זינגר, יו"ר רשות ניירות ערך"; 8 pages. The list's footnote 1 says the conditions were updated on 11.11.2019, 31.12.2020 and 12.12.2023, so this is the current text as of the list.

Sentences the rule base should hold in Hebrew (all from [תנאי ההיתר הכללי לפי סעיף 49א, נוסח חדש דצמבר 2023](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-626a5f3377ef9/49A.pdf) · checked 2026-10-26 · primary):
- Category (1)(c), p.6: "גוף הנתון לפיקוח והסדרה כ-broker-dealer בארצות הברית; ... או שהוא investment firm או credit institution כהגדרתם בסעיף 2(1) ל-Regulation No 600/2014, שמשרדיו הראשיים (head office) מצויים בממלכה המאוחדת (United Kingdom) ... ובהתאם לדין על פיו הגוף האמור נתון להסדרה ופיקוח, לא יהיה בעובדה שהלקוח מצוי בישראל כדי לפגוע בחובותיו כלפי הלקוח."
- Conditions (2) and (3), p.6: "(2) הוא אינו פועל מטעמה של הבורסה הזרה בה יבוצעו העסקאות בניירות ערך; (3) הוא לא ישווק בורסה זרה מסוימת או שוק מסוים."
- The disclosure, p.7: "בעל היתר המציין בפני כל אדם כי קיבל את היתר הרשות לפי סעיף 49א לחוק, נדרש למסור גילוי בולט בזו הלשון: ... היתר לפי חלופה ב': "היתר הרשות לפי סעיף 49א לחוק ניירות ערך ניתן בהסתמך על הצהרת בעל ההיתר כי הוא נתון לפיקוח של __________. פעילות בעל ההיתר אינה מפוקחת על-ידי רשות ניירות ערך. אין בהיתר משום הבעת דעה על טיבו של השירות הניתן בידי בעל ההיתר או על הסיכונים הכרוכים בו"." and "אי מתן גילוי כאמור יהווה הפרה של תנאי ההיתר הכללי ועלול להביא בין היתר לשלילתו."
  - Difference from the English translation the rule base quotes: the Hebrew requires a **prominent** disclosure ("גילוי בולט"); the English says only "a disclosure".
- Re-declaration and change of status, p.8: "נדרש בעל ההיתר אחת לשלוש שנים להגיש הצהרה דומה בדבר עמידתו בתנאי ההיתר"; "חדל להתקיים בבעל היתר תנאי מן התנאים לקבלת היתר ידווח על כך לרשות באופן מיידי."
- Proposed scope: `- Scope: general`

### F4. The ISA's own wording on offering by a foreign broker without a permit

1. The prohibition reaches anyone who markets trading services in Israel, including on behalf of a permit holder. Conditions, p.3: "האיסור לפעול ללא היתר חל על כל מי שפונה בהצעה למתן שירותי מסחר כמפורט בחוק, ובכלל זה מי שפונה בהצעה למשקיעים בישראל במטרה לשווק שירותי מסחר שיינתנו על-ידי גוף אחר שהוא בעל היתר לפי סעיף 49א."
   - Source: [תנאי ההיתר הכללי לפי סעיף 49א, נוסח חדש דצמבר 2023](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-626a5f3377ef9/49A.pdf), p.3, דברי הסבר · checked 2026-10-26 · primary
2. What counts as an offer. Q&A question 5, p.3 (one justified line in the PDF extracts in visual order; read right to left it is "בעקיפין, לרבות באמצעות פניות"): "פנייה בהצעה למתן שירותי מסחר בניירות ערך משמעה כל פנייה לאדם (לרבות תאגיד) או שיווק בישראל, במישרין או בעקיפין, לרבות באמצעות פניות טלפוניות, פניות במייל, פרסומים בכתב או בעל-פה, פרסומים כלליים לציבור הרחב או לקבוצה מסוימת של אנשים, פניות באמצעות סוכנים, פרסומים בתקשורת, פרסומים באינטרנט וברשתות חברתיות."
3. Group companies, same answer, p.3: "אם הגוף הזר הוא חלק מקבוצה אין מניעה שברוקרים אחרים השייכים לקבוצה, ואשר קיבלו היתר, ימשיכו לפנות בהצעה למתן שירותים לפי סעיף 49א לחוק, כל עוד הם אינם פונים בהצעה למתן שירותים בידי הגוף הזר בישראל, החורגים מן השירותים המתוארים בסעיף 7 לקובץ השאלות והתשובות, למשל על ידי שיווק האפשרות לפתוח חשבון בגוף הזר." This is the sentence that matters for Interactive Brokers: its permitted companies (IB LLC, IB UK) may offer their own services, but marketing an account at a group company without a permit (IB Ireland, for instance) would be outside it.
4. A foreign body active in Israel cannot rely on the client's own initiative. Question 6, p.4: "פנייה כאמור לאדם (לרבות תאגיד) בישראל אסורה בלא היתר לפי סעיף 49א, ואין זה רלבנטי אם מדובר בלקוח שביקש לקבל את שירותי המסחר האמורים בניירות ערך מיוזמתו, שכן מדובר בגוף הפועל בישראל ומציע שירותים בישראל."
   - Source for 2 to 4: [רשות ניירות ערך: שאלות ותשובות בעקבות פרסום תנאי ההיתר הכללי לפי סעיף 49א (עדכון 13.1.2025)](https://www.new.isa.gov.il/images/Fittings/isa/asset_library_pic/al_lobby/al_lobby-626a5f3377ef9/QAA49a.pdf), p.3, question 5; p.4, question 6 · checked 2026-10-26 · primary
- Proposed scope: `- Scope: general`

No ISA directive on this was found beyond the conditions and the Q&A; the list's own preface (p.1, paras. 2 to 6) repeats the same frame ("ההיתר הכללי אינו קובע משטר פיקוח של הרשות על הגופים שקיבלו היתר, אלא קובע דרישות סף לצורך קבלתו"; "ההיתר ניתן בהסתמך על הצהרות הגוף הפונה, כפי שהן נכללות בפנייתו על כך שהוא עומד בתנאי הסף, ועליהן בלבד").

### F5. Interactive Brokers' own words on Israel

All read on 2026-10-26 by plain curl. The FAQ answers were read through the FAQ page's own search service (the same POST the public page at `/lib/cstools/faq/` makes; no login, no bot check); the URL given is the FAQ app's address for each answer.

1. **Which company serves an Israeli: not stated.** The FAQ "Which IBKR entity carries my account?" still says only that the entity "is generally based upon the account holder's country of legal residency" and lists nine companies; Israel is not named.
   - Source: [Interactive Brokers: FAQ, Which IBKR entity carries my account?](https://www.interactivebrokers.com/lib/cstools/faq/#/content/38458938) · checked 2026-10-26 · institution
2. **It serves Israeli residents and has an Israeli payment route.** "Israeli residents will have the option to select between domestic ZAHAV transfers and international bank transfers." "Funds received via the Masav (Bank of Israel's Automated Clearing House) system will not be accepted and will be returned." ILS withdrawals: "IBKR charges a fee of ILS 30.00 for subsequent withdrawals beyond the complimentary limit."
   - Source: [Interactive Brokers: FAQ, ILS Deposits and Withdrawals](https://www.interactivebrokers.com/lib/cstools/faq/#/content/1146100886), "Important ILS Deposit Information", "Unacceptable Deposit Methods", "Bank Wire" · checked 2026-10-26 · institution
3. **Israel is singled out in the IBKR Lite rules.** "Brokers on the IBKR Lite plan cannot support the following type of client sub accounts: Israel is the country of legal residence of the account holder"; an advisor on Lite must have "No client accounts from Israel".
   - Source: [Interactive Brokers: Traders and Investors (individual accounts)](https://www.interactivebrokers.com/en/accounts/individual.php), IBKR Lite section · checked 2026-10-26 · institution; same text on [Commissions & Fees](https://www.interactivebrokers.com/en/pricing/commissions-home.php) · checked 2026-10-26 · institution
4. **TASE for Israeli retail clients (2019 text, the only one found).** "IBKR institutional clients globally and retail clients outside of Israel can use their account to trade stocks on the Tel Aviv Stock Exchange ... IBKR will connect clients to TASE via a banking intermediary based in Israel."
   - Source: [Interactive Brokers: NEWs @ IBKR 2019, Vol. 6](https://www.interactivebrokers.com/en/general/communiques/2019/news-at-ibkr-02-2019-vol6.php), "Access the Tel Aviv Stock Exchange (TASE) with Your IBKR Account" · checked 2026-10-26 · institution (dated 2019; no later statement found either way)
5. **No Hebrew site, no Israel page, no mention of the permit.** The language menus offer no Hebrew (interactivebrokers.com: Chinese, Spanish, Korean, Portuguese besides English; .co.uk: de, en, es, fr, it, ru; .ie: de, en, es, fr, hu, it, pt); `/he/home.php`, `/he/` and `/il/` on interactivebrokers.com return 404. "Israel Securities Authority", "49A" and "Israel" were searched on the three home pages, the stock commission pages (.com, .co.uk) and the disclosure pages (.com, .co.uk, .ie): none mentions the ISA or the permit; "Israel" appears only as a market in the price list. IBKR's public forms service tags 127 forms with the language code "he", but the one opened (form 4499, "Appropriateness Assessment Description") is in English, so this is not evidence of Hebrew material. No form name in ids 1 to 13,000 mentions Israel.
   - Proposed scope for 1 to 5: `- Scope: institution: Interactive Brokers`

### F6. Item 4 of the brief: date and conditions of the permit

- Date: 20.10.2021 for both Interactive Brokers LLC and Interactive Brokers (U.K.) Limited (F1).
- Conditions: no company-specific conditions are printed; both are listed under the general permit, alternative B, category (1)(c), not among the specific permits (section 3 of the list, pp.14-15, which names four other bodies). So the general conditions apply (F3): not acting for the foreign exchange, not marketing a specific exchange or market, the prominent disclosure whenever it says it holds the permit, a re-declaration every three years, and an immediate report of any change. Neither company is in the table of foreign brokers allowed to work through outside marketers (p.13: TradeStation Securities, TradeStation International, Mexem, Colmex Pro), so it may not use outside parties that talk to investors in Israel under condition (4).
- The three-part test of Q&A question 5 (not active in Israel, no approach, service limited) is the exception for bodies **without** a permit; it does not decide anything for IB LLC and IB UK, which hold one. F5 items 2 and 3 show Interactive Brokers does serve Israeli residents as a market, which is what the permit covers.

## Records and open questions that should change

- **BRK-06.** Replace "the Hebrew original was not found ... Re-read the Hebrew before quoting it on the site" with the Hebrew source (F3) and the Hebrew disclosure text; note that the Hebrew requires a prominent disclosure ("גילוי בולט"); add the ISA's statement that the list of holders is shown on its site, with the list as a source; add the Q&A question 5 definition of an offer and the group-company sentence (F4). Keep the English translation as a secondary line. Scope stays `general`.
- **BRK-43.** Close the permit part: Interactive Brokers LLC (SEC) and Interactive Brokers (U.K.) Limited (FCA) hold section 49A permits dated 20.10.2021 on the ISA's list; Interactive Brokers Ireland and Central Europe are not on it (F1). Keep open which company carries an Israeli resident's account. Add the ZAHAV deposit route for Israeli residents and the Lite exclusion (F5 items 2 and 3), and the 2019 statement that TASE was for retail clients outside Israel (F5 item 4), dated. Scope stays `institution: Interactive Brokers`; the permit line's source is primary (the regulator's list).
- **BRK-46.** Add the regulator's confirmation: Mexem LTD (CySEC 325/17) on the ISA list since 21.02.2024 in the outside-marketers table, אינטראקטיב ישראל שוקי הון בע"מ as an advice-law licensee since 13.7.2022, and Bank Yahav since 01.04.2020 (F1). These are primary lines about named companies, which D30 allows on the company's own record.
- **New record (suggested id BRK-51), "Section 49A permit holders named on the ISA's list".** Rule: the ISA publishes the list; who is on it for the providers the site names (the two Interactive Brokers companies, the two eToro companies, Mexem, Interactive Israel Capital Markets, Yahav and the other banks and non-bank members); the list has no date and was last replaced in August 2025. Scope: `institution: Interactive Brokers, eToro, Interactive Israel, Bank Yahav`. Likely to change: yes. Alternative: fold the lines into BRK-43 and BRK-46 and skip the new record.
- **BRK-01.** In Conditions, replace "Whether a foreign broker that does not solicit in Israel ... needs a permit is not stated in the text read; see open question 9" with the Q&A question 5 answer (already quoted in OQ9) and a pointer to the list.
- **BRK-41.** One clause: Interactive Brokers Ireland, where Interactive Israel says a client may choose to hold the account, is not itself on the ISA's list; the Q&A's question 7 exemption needs the contract to be between the permit holder and its clients (see "Still open").
- **Open question 9.** Close for Interactive Brokers on the permit (both companies listed, F1) and for eToro on the permit (both eToro companies listed, F1). Narrow the rest to: which Interactive Brokers company carries an Israeli resident's direct account, and whether a retail Israeli may trade TASE there today.
- **Institutions table.** Interactive Brokers (direct): replace "open question 9 (49A, the entity for Israelis)" with "49A permit: IB LLC (SEC) and IB UK (FCA), 20.10.2021 (ISA list); entity for Israelis open (OQ9)". eToro: replace "not researched" in the protection cell with "49A permit: eToro (Europe) Ltd (CySEC) and eToro (UK) Ltd (FCA), 3.7.2022 (ISA list)".
- **Sources table.** Add the ISA list, the Hebrew conditions, the archived 2025 list, and the IBKR pages in F5.
- **Site text that rests on the open question.** `site/app/content/guide/brokerage-account.tsx` line 38 says "האם חשבון שנפתח ישירות אצל ברוקר בחו"ל צריך היתר כזה עדיין לא מתועד. שאלה פתוחה: BRK OQ9". For Interactive Brokers this is now answered; the sentence should change with the record (the lead's call; not edited here).

## What the direct-account row should say

A short note, not nothing. Suggested content (Hebrew wording for the copy owner): Interactive Brokers' US company and UK company hold an ISA permit under section 49A since 20.10.2021; the ISA granted it on their declaration that the SEC and the FCA supervise them, and the ISA does not supervise them; Interactive Brokers does not say which of its companies opens an account for a resident of Israel (the top of the activity statement shows it). Draft: "לחברה האמריקאית ולחברה הבריטית של אינטראקטיב ברוקרס יש היתר של רשות ניירות ערך לפי סעיף 49א מ־20.10.2021. ההיתר ניתן על סמך הצהרתן שהן בפיקוח ה־SEC וה־FCA, ורשות ניירות ערך לא מפקחת עליהן."

Reasons: the Interactive Israel row beside it already shows its permit and that the ISA does not supervise it, so leaving the direct row silent invites the wrong reading that only the intermediary is permitted; the site currently shows the question as open, which is now wrong for this broker; the source is the regulator's own list (primary), so it passes the general-sources rule. No warning is needed, because the route is permitted. The site should not say which company a direct client gets until Interactive Brokers says so.

## Still open, and what would settle it

1. **Which Interactive Brokers company carries a resident of Israel's direct account** (IB LLC or IB UK, both permitted; or another). Not on any IBKR page read. Settles it: IBKR's application flow with Israel as country of residence (the agreement it presents names the company), or the top of an Israeli client's activity statement, or IBKR client services in writing.
2. **Whether Interactive Brokers gives the ISA's disclosure anywhere** (it must, wherever it says it holds the permit). Not on the public pages read; the application flow is the likely place. Same check as item 1.
3. **Whether the list is still current.** The file has not changed since 1.9.2025. The ISA site page that links it is an Angular app that curl cannot render, so the page was not read. A person: open https://www.new.isa.gov.il/ , find the section 49A page (search "49א"), and check whether the link "רשימת גופים בעלי היתר לפי סעיף 49א" points to a newer file. The ISA's address for permit declarations is 49Apermits@isa.gov.il (Q&A p.15).
4. **TASE for retail Israelis at IBKR today.** Only the 2019 newsletter speaks to it (no). IBKR's knowledge-base article "Leveraged FX Currency Restrictions for Israeli Retail Clients" (https://ibkr.info/article/3242) redirects to a FAQ stub that links back to itself; a person could open it in a browser to see whether the full article still exists. Material only if the site starts pricing TASE trades at a direct IBKR account for Israelis (BRK-42 does price them).
5. **Interactive Israel accounts at Interactive Brokers Ireland.** IB Ireland is not a permit holder. Q&A question 7 exempts a foreign broker that executes for a permit holder's clients only where "ההתקשרות והיחסים החוזיים הם בין בעל ההיתר ובין לקוחותיו, ולא בין הלקוחות לבין הברוקר הזר שאינו מחזיק בהיתר" (p.4). Whether an introduced IBKR account meets that is not stated by the ISA or by Interactive Israel. Outside this question; noted for BRK-41.
6. **A broker-dealer law.** Press reports a 2020 draft law that would bring brokers under ISA supervision; no official text was opened, so nothing here rests on it. Settles it: the memorandum on gov.il or the ISA site, and its status in the Knesset.

## Method notes

- ISA PDFs by curl (www.new.isa.gov.il serves them directly). `govil-page.sh` was not used: it accepts gov.il addresses only, and no gov.il page was needed.
- Interactive Brokers pages by curl; FAQ answers through the FAQ page's own search endpoint; form names through the public forms endpoint IBKR's disclosure pages call. No disguised browser, no bot-check workaround.
- Press and aggregator results (funder.co.il, comparebroker.io, Finance Magnates, Lexology) were used only to find documents and are not cited. A comparison site's claim that IBKR is not licensed by the ISA is contradicted by the ISA's list.
- Hebrew quotes are copied from the PDF text layer; where the extraction reversed a justified line, the note says so.
