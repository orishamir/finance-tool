# Job 4: banks' published customer terms

Issue 123. Read 2026-10-31. Library only: nothing in `data/`, `packages/`, `site/` or the rule base changed, and `data/sources/documents.json` was not edited. Every quote below is recorded in the library with `cite` under the plan's topic. A page number is the file's page.

Each bank's terms speak only for that bank. Nothing here is a statement about banks in general, and a shared wording below is a fact about the banks named.

## How far the reading goes

- **Word search, then the passage.** I searched each document for the plan's topics and read the passages found, not every page. "No clause found" means none turned up by that search in the documents listed; it is not a statement that the bank has no such term.
- **Jumbled text.** Discount, Mercantile and Yahav are two-column PDFs whose extracted text mixes the columns. A cited quote has all its words on the page, but the reading order was reconstructed by me. Check the page itself before relying on a sentence.

## Table

| Bank | Status | General terms | Securities terms | Other filed |
|---|---|---|---|---|
| Leumi | Found | `92690e4986a08814`, 310-93, footer 06.26 | `b784171ad4028486`, 08.25 | hub `48eee077a3f7610e`; communications banking `c9fe58996fa0e74d` |
| Hapoalim | **Blocked** | not checked | not checked | nothing filed |
| Discount | Found | `36453fb2c2b8e702`, full booklet | `0db5c13ebcf91370`, part E | hub `5e4ad8414f0f7e43`; closing guide `1b7a83b67cff3d21`; `b40cb2a4e3ba34e8`; fee tracks `e43f5b201f58bdb4`; advice `699eb6184efa1e98` |
| Mizrahi-Tefahot | Found; current edition unreadable | `9c29d0681b4ab0e2`, 1.2026, images with no text, **not read**; read instead `75ad7686ca92ccd9`, 8.2025 | `97e568f32eb2e075`, 7.2025 | hub `bf74aff852e6d78a`; `e0c8977cfad07d8a`; changes `c0e765b0c9ef125e` |
| FIBI | Found | `0e1d2966962cb12c`, פח-90, 8.25 | `30db20eaa1f2c615`, chapter C | hubs `47d0d6c7c12d955d`, `d76f3b6a7604dd92`, `7aa83c97e572aa55`; summary `07e388dee91b33e7`; closing guide `233e6bf05bfff50a`; annex `69eef3651ea97929`; e-vote `02cab9bdc310a9b3` |
| Mercantile | Found | `62474a808f06947d`, 0-099-200, 8.25 | `4076a5e01852724f`, part E | hub `66235a7a2d04f85a`; fee tracks `75e7201ed0996cc2`; closing guide `4488c30b7b7000fc`, 02.26 |
| Massad | Partly found; **securities chapter not found and its pages blocked** | `a681bf2641713eb5`, chapter A, 4.21 | not checked | closing guide `7dd5e58f81c4b4dc`, 2-16, old; transfer form `b2568a3d7a973cce` |
| Yahav | Found; edition unclear; agreements list empty by curl | `322ff632b328571c`, no edition date found; older `9aa0ef0d9e76e54d`, 8.15 | chapter 5 of `322ff632b328571c`, from p.39 | transfer page `3333d8a86ed4e6f0`; guide page `9d98573234cf6719`; custodian policy `b6c7bf7b5169f05c`; advice `9967ebd331f089bf` |
| Jerusalem | Found; some pages blocked | `43f36f509e83fcf3`, 73813, 01/2024 | part D of the same; addendum `b0a9e2bf6b8ed659` | forms page `9db9d8d45818265a`; opening request `39ff2263614e9d6c`; older `2e4d96f3499967f3` (10/20), `2bdc0fe33195b23b` (01/17) |
| One Zero | **Blocked** | not checked | not checked | nothing filed |
| Esh Israel (not in `institutions.json`) | No published terms found | none | none | Bank of Israel's register shows no website; one search found only licence news (`tried`) |

Totals, 11 banks: 7 with general and securities terms filed and read (Mizrahi on its 8.2025 and 7.2025 texts), 1 partly (Massad), 2 blocked (Hapoalim, One Zero), 1 with none found (Esh). Otsar Hahayal, Pagi and Union do not appear as separate entities in the register. Blocked links are on `chrome-list.md`.

## What each says, by topic

Quotes are the document's own words. "—" means no clause found by the search described above.

### Custody (דמי משמרת)
- **Leumi:** `92690e4986a08814` p.13 and `b784171ad4028486` p.2, "דמי שמירה ,עמלות ותשלומים המגיעים לקסטודיאן". This sits in what the custodian may hold against, not a charge to the customer. Sale of deposit securities to cover debt "בהודעה של שלושה ימים מראש" (`b784171ad4028486` p.4).
- **Discount:** —
- **Mizrahi:** `97e568f32eb2e075` p.5, the bank may charge "בתחילת החודשים ינואר ,אפריל ,יולי ואוקטובר בכל שנה" or another period it sets, "ובעת מכירת ני"ע", a fee for managing the securities deposit.
- **FIBI:** `30db20eaa1f2c615` p.4, "דמי השמירה, עמלות ותשלומים המגיעים לקסטודיאן", also about what a custodian may hold against.
- **Mercantile:** —
- **Massad:** not checked (securities chapter).
- **Yahav:** `322ff632b328571c` p.12, "דמי ניהול חשבון ודמי ניהול חשבון ניירות ערך", among debts owed; amounts per the tariff at the time of collection.
- **Jerusalem:** — for a fee. `43f36f509e83fcf3` p.47 s145.5 points to a custody policy on the bank's site.

### Buy and sell commission (עמלת קנייה ומכירה)
- **Leumi:** `92690e4986a08814` p.52, "בסכומים המפורטים בתעריפון הבנק".
- **Discount:** `36453fb2c2b8e702` p.51, "העמלות שחברי בורסה גובים בעד שירותי ניירות ערך, מתפרסמות באתר הבורסה".
- **Mizrahi:** `75ad7686ca92ccd9` p.17, per the tariff (read for general fees, not securities alone).
- **FIBI:** — in the passages read.
- **Mercantile:** `4076a5e01852724f` p.13, same sentence as Discount's.
- **Massad:** not checked.
- **Yahav:** `322ff632b328571c` p.40, "העמלות שגובים חברי הבורסה".
- **Jerusalem:** `43f36f509e83fcf3` p.46 "לרבות בגין עמלות והוצאות נלוות"; p.48 s145.11 the customer bears all payments, commissions and expenses.

### Currency conversion (המרת מטבע)
- **Leumi:** `b784171ad4028486` p.2, proceeds "יומרו על ידי הבנק לפי שער בל"ל שבו הבנק יקנה"; `92690e4986a08814` p.61, "עמלת חליפין".
- **Discount:** `36453fb2c2b8e702` p.6, "לפי השער הנמוך ביותר להעברות והמחאות"; `0db5c13ebcf91370` p.8.
- **Mizrahi:** `75ad7686ca92ccd9` p.6, "שער אחיד".
- **FIBI:** `30db20eaa1f2c615` p.5, "שער העברות והמחאות".
- **Mercantile:** `4076a5e01852724f` p.10, "יומרו על ידי הבנק לפי שער החליפין הנמוך ביותר"; `62474a808f06947d` p.6.
- **Massad:** not checked.
- **Yahav:** `322ff632b328571c` p.44, "בניכוי עמלת חליפין".
- **Jerusalem:** `43f36f509e83fcf3` p.40, "שער המכירה של העברות והמחאות", in the credit chapter; — for securities proceeds.

### Closing an account (סגירת חשבון)
- **Leumi:** `92690e4986a08814` p.46, bank closes on "הודעה מוקדמת בכתב ללקוחות של 45 ימים"; customer's closing "בתום 5 ימי עסקים".
- **Discount:** `36453fb2c2b8e702` p.10, 45 days' written notice by the bank; `1b7a83b67cff3d21` p.3, closed "בתוך 5 ימי עסקים, או בתוך 14 ימי עסקים אם קיים בחשבון תיק ני"ע זרים".
- **Mizrahi (8.2025):** `75ad7686ca92ccd9` p.11, the bank may close on notice under s35.3.2; p.13, "בתוך 45 יום מהודעת הבנק".
- **FIBI:** `0e1d2966962cb12c` p.19, "בהודעה מראש של 45 ימים לפחות"; customer "בתום חמישה ימי עסקים". `233e6bf05bfff50a` p.2, closing fees, see below.
- **Mercantile:** `62474a808f06947d` p.9, 45 days' written notice; `4488c30b7b7000fc` p.2, 5 or 14 business days.
- **Massad (4.21):** `a681bf2641713eb5` p.15 bank closes on notice; p.16 "בתום חמישה ימי עסקים".
- **Yahav:** `322ff632b328571c` p.21 s28, the bank may close; 45 days' notice stated for an account with no activity for 12 months (column-mixed, check the page).
- **Jerusalem:** `43f36f509e83fcf3` p.27 s76, "45 ימים ממועד מסירת הודעת הבנק", or at once in exceptional circumstances as the bank judges; s76.2 the customer may end at any time.

### Moving securities elsewhere (העברת ניירות ערך לגוף אחר)
- **Leumi:** — in these terms.
- **Discount:** `1b7a83b67cff3d21` p.1, a request to move a portfolio, whole or part, to another financial body, also online.
- **Mizrahi:** —
- **FIBI:** `233e6bf05bfff50a` p.2, listed under the 40 NIS ceiling below.
- **Mercantile:** `4488c30b7b7000fc` p.2, only as a closing period.
- **Massad:** `7dd5e58f81c4b4dc` p.2 (2-16), same ceiling; form `b2568a3d7a973cce`.
- **Yahav:** `3333d8a86ed4e6f0` p.1, 5 business days Israeli, 14 foreign, forms 15-17 to 15-19; "העברת תיק ניירות ערך מהווה אירוע מס פוטנציאלי ובאחריותך הבלעדית".
- **Jerusalem:** —

### Changing terms and notice (שינוי תעריף והודעה עליו)
- **Leumi:** `92690e4986a08814` p.58, s44, 30 days' notice.
- **Discount:** `36453fb2c2b8e702` p.13, "30 ימים לפחות לפני מועד השינוי".
- **Mizrahi (8.2025):** `75ad7686ca92ccd9` p.11, "בהודעה מוקדמת בכתב על כך או באמצעות פרסום באתר האינטרנט של הבנק"; no number of days found in that clause. Differs from the 30 days the other banks here state.
- **FIBI:** `0e1d2966962cb12c` p.31, s6.13, at least 30 days.
- **Mercantile:** `62474a808f06947d` p.12, notice; 30 stated beside it (column-mixed, check the page).
- **Massad (4.21):** `a681bf2641713eb5` p.27, at least 30 days.
- **Yahav:** `322ff632b328571c` p.5 s3.7, advance notice; days not read. p.12: where an amount or rate was not fixed, the tariff at the time of collection applies.
- **Jerusalem:** `43f36f509e83fcf3` p.26 s75, advance notice in any way the bank sets, "במועדים הקבועים בדין" (p.27).

These are terms of the account. The clause on a tariff change itself, as distinct from terms, was not separated out here.

### Dividend and withholding (דיבידנד וניכוי מס)
- **Leumi:** `92690e4986a08814` p.57, "חובת ניכוי מס במקור"; `b784171ad4028486` p.3, collects interest and dividends.
- **Discount:** `36453fb2c2b8e702` p.13, "הבנק ינכה מס במקור", "לפי שיעור ניכוי המס במקור הגבוה"; `0db5c13ebcf91370` p.5 and p.6, below.
- **Mizrahi:** `97e568f32eb2e075` p.4, may collect "כל ריבית, דיבידנד".
- **FIBI:** `0e1d2966962cb12c` p.26; `30db20eaa1f2c615` p.4.
- **Mercantile:** `62474a808f06947d` p.12, "לפי שיעור ניכוי המס במקור הגבוה ביותר החל על מי מבעלי החשבון"; `4076a5e01852724f` p.5 and p.7, below.
- **Massad:** `a681bf2641713eb5` p.23, withholding clause; dividends not checked.
- **Yahav:** `322ff632b328571c` p.44, the customer pays taxes on foreign securities, "תשלומי מס של מדינות זרות".
- **Jerusalem:** `43f36f509e83fcf3` p.26 s71.6, may deduct any tax with no prior notice; p.45, collects dividends.

## Findings for the rule base (not edited)

1. **Missing rule: a 40 NIS ceiling on closing fees.** Bank of Israel's fees rules, `442ff2ea4ab47723` p.24 (`https://www.boi.org.il/media/mi2driua/159a.pdf`): "סך כל העמלות שיגבה התאגיד הבנקאי בשל פעולות לסגירת חשבון המפורטות להלן לא יעלה על 40 ש"ח", excluding track fees, clearing-house costs, correspondent fees and early-repayment fees, and listing the move of Israeli and of foreign securities to the same client's account at another bank. `switching-and-transfers.md` gives "at most NIS 10" per transfer on closing and no total; no such total turned up by word search in the rule base. FIBI's `233e6bf05bfff50a` p.2 and Massad's `7dd5e58f81c4b4dc` p.2 repeat it for their customers. The owner should confirm scope and add it, and may be able to narrow open question 12 in `brokerage-account.md`.
2. **Foreign tax above the Israeli maximum.** Discount `0db5c13ebcf91370` p.6 and Mercantile `4076a5e01852724f` p.7 say tax withheld abroad on income from securities of entities incorporated in certain countries (other than, among others, Israel and the US) may be at the maximum rate, above the treaty rate; that Israeli top-up follows the treaty or domestic rate, whichever is lower; and so "ייתכן כי שיעור המס הכולל שינוכה במקור ... יעלה על שיעור המס המרבי בישראל". That is these two banks' statement, and the wording concerns withholding. For the tax-specialist to compare with `tax-securities-foreign.md`, where a foreign fund's domicile (an Irish fund for instance) may matter. I did not research the law behind it.
3. **Joint accounts: the highest rate.** Discount p.13 and Mercantile p.12 withhold at the highest rate applying to any of the holders. No rule on this turned up by word search in the rule base. Those two banks only.
4. **Moving a portfolio and tax.** The rule base notes that "tax-neutral between one's own accounts" is stated only by institutions. Yahav's page says the opposite in tone: a potential tax event, the customer's sole responsibility. The owner may add it as a contrary institution's statement; it is not a rule.
5. **Mizrahi's custody charge timing.** Quarterly, and also at a sale (`97e568f32eb2e075` p.5). I found no rule on charge timing in `brokerage-account.md` by word search. This is Mizrahi's term only.
6. **Bank Esh.** Open question 10 stands: no site in the register and no published terms found.

## Other things to know

- **Mizrahi's January 2026 terms are images.** `9c29d0681b4ab0e2` has no text, and the "accessible" link on the bank's page is the same file. Its readable predecessor is 8.2025; its own update page `e0c8977cfad07d8a` says the January changes include arrears interest. A detailed January 2026 changes document was listed and not filed. Mizrahi's quotes above may be out of date.
- **FIBI's booklet is also served at Massad's address and is not Massad's.** I tried FIBI's URL on Massad's host, which is a guessed link that no Massad page gave me. It returned a byte-identical file that names FIBI as "הבנק". Nothing was filed from it. Massad's own chapter A names Massad, so FIBI's text is not attributed to Massad here.
- **Older editions in the library.** Leumi `c33ce72a478b8907` (08.25) is older than `92690e4986a08814` (06.26). `data/sources/documents.json` holds no Leumi link, so no page points to the older one through that file. Jerusalem's forms page still links 01/17 and 10/20, while the newest found is 01/2024; which one binds a new customer was not established.
- **Yahav's edition.** `322ff632b328571c` shows no edition date I could find. `9aa0ef0d9e76e54d` has "Dummy Text" on its first page and a footer of 2.16.
- **A filing slip.** `89bca2b50b7b470a` is Jerusalem's forms page, saved with publisher "blocked" because I expected the link to fail. The right copy is `9db9d8d45818265a`, and the digest says so. The library has no remove command and the index is not edited by hand.
- **Nothing in any document addressed me.**

## Needs the founder

Nothing to decide. A Chrome pass over the five new lines on `chrome-list.md` would close Hapoalim, One Zero, Massad's securities chapter and Jerusalem's and Yahav's lists.

Issue 123 stays open: investment houses are job 5 and the blocked banks remain.
